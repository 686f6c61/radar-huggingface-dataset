# hosam010023/Arabic_article_classifier

## Resumen

Arabic SANAD Encoder Classifier es un clasificador de texto en árabe no generativo, construido desde cero con PyTorch por el autor hosam010023. Utiliza un codificador Transformer bidireccional con un tokenizador BPE propio para categorizar artículos de prensa árabe en siete temas: tecnología, finanzas, política, religión, medicina, cultura y deporte. Con unos 7,25 millones de parámetros y una entrada máxima de 256 tokens, es un modelo deliberadamente compacto.

Su valor diferencial no está en el tamaño sino en la ingeniería de confianza: incorpora calibración mediante temperature scaling (T = 1,249) y un mecanismo de abstención que devuelve "sin respuesta" cuando la confianza calibrada cae por debajo de 0,70. En el conjunto de test de SANAD (14.181 artículos) alcanza una exactitud del 95,47% y un macro-F1 del 94,71%, con un ECE de solo 0,74% tras la calibración.

Es relevante como base educativa y de investigación: muestra cómo construir, entrenar y calibrar un clasificador de texto en árabe de principio a fin, algo poco frecuente frente a los modelos preentrenados tipo AraBERT. Está entrenado sobre el dataset arbml/SANAD (141.807 artículos) y se publica bajo licencia Apache-2.0 (pendiente de confirmación por el autor según la propia model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only para clasificación de secuencias |
| Parametros totales | 7.253.255 (~7,25M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 256 tokens (incluidos `[CLS]` y `[SEP]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe (principalmente árabe estándar moderno, prensa) |
| Licencia | Apache-2.0 (propuesta por el autor, pendiente de confirmación) |
| Formato de pesos | Checkpoint PyTorch (`checkpoints/best.pt`); no disponible en safetensors ni GGUF |

Detalles adicionales: hidden size 256, 4 capas de codificador, 4 cabezas de atención, feed-forward de 1.024, activación GELU, pre-LayerNorm con LayerNorm final, codificación posicional sinusoidal, pooling por media enmascarada sobre tokens reales y cabeza de clasificación lineal (256 → 7) con softmax en inferencia. Tokenizador propio: pre-tokenización por palabras + BPE con vocabulario de 16.000 tokens.

## Arquitectura y entrenamiento

El modelo es un encoder Transformer bidireccional puro, sin componente generativo. A diferencia de los clasificadores basados en modelos preentrenados, aquí la arquitectura y el tokenizador se han implementado desde cero: un pipeline propio de normalización del árabe (eliminación de diacríticos y tatweel, unificación de formas de alef, conversión de alef maqsura a yaa, normalización de dígitos arábigo-indios, minúsculas para caracteres latinos y colapso de espacios) seguido de BPE con vocabulario de 16.000 tokens. La normalización es intencionadamente simple y con pérdida: por ejemplo, puede confundir la preposición "على" con el nombre propio "علي".

El entrenamiento se realizó sobre el dataset SANAD (versión de Hugging Face arbml/SANAD), con 141.807 artículos recogidos originalmente de AlKhaleej, AlArabiya y Akhbarona. La división fue estratificada por clase con semilla 42: 113.445 artículos de entrenamiento, 14.181 de validación y 14.181 de test. Las clases están desbalanceadas (Finanzas es la mayor con 31.485 artículos; Cultura la menor con 5.397), por lo que se reporta macro-F1 junto a la exactitud. Tras el entrenamiento se aplicó calibración por temperature scaling (T = 1,249), que ajusta las confianzas sin modificar las predicciones. No hay datos publicados sobre RLHF/DPO (irrelevante al no ser un modelo generativo) ni sobre el número exacto de épocas, aunque la model card menciona el uso del checkpoint de la época 2.

## Capacidades

- Clasificación monoclase de noticias en árabe en 7 categorías: Tech, Finance, Politics, Religion, Medical, Culture, Sports.
- Salida estructurada en formato diccionario: pregunta, tipo, respuesta, confianza calibrada y top-3 de clases con probabilidades calibradas.
- Confianza calibrada mediante temperature scaling, con ECE en test del 0,74%.
- Abstención selectiva: devuelve `None` como respuesta cuando la confianza calibrada es inferior a 0,70 (umbral configurable en la demo).
- Interfaz de inferencia sencilla mediante la función `answer(text, question=...)` del módulo `answer.py`.
- No soporta: generación de texto, conversación, pregunta-respuesta abierta, tool calling, agentes, visión, audio ni respuestas sí/no o puntuaciones numéricas (carece de las cabezas correspondientes).

## Casos de uso

- Clasificación automática de noticias en árabe: un medio de comunicación puede etiquetar automáticamente artículos entrantes en las siete categorías de SANAD, con una exactitud del 95,47% en dominio similar al de entrenamiento.
- Filtrado con abstención en pipelines editoriales: gracias al umbral de abstención (0,70) y al ECE bajo (0,74%), los artículos dudosos pueden enrutarse a revisión humana en lugar de etiquetarse automáticamente, reduciendo errores silenciosos.
- Enseñanza de NLP desde cero: el repositorio sirve como material didáctico completo para aprender cómo se construyen un tokenizador BPE, un encoder Transformer y una calibración de confianza sin depender de pesos preentrenados.
- Investigación en predicción selectiva y calibración: base compacta para experimentar con temperature scaling, abstención y métricas como ECE y NLL en árabe.
- Baseline ligero para investigación en NLP árabe: con solo 7,25M de parámetros, sirve como punto de referencia rápido y barato frente a clasificadores basados en AraBERT u otros modelos preentrenados.
- Clasificación de contenido en apps con recursos limitados: su tamaño reducido lo hace adecuado para despliegues donde el coste computacional importa, siempre que el dominio sea prensa en árabe estándar moderno.

## Benchmarks y rendimiento

Resultados finales publicados en la model card (test de 14.181 artículos):

| Metrica | Validacion | Test |
|---|---:|---:|
| Accuracy | 95,32% | 95,47% |
| Macro-F1 | 94,66% | 94,71% |
| ECE antes de calibrar | 1,84% | 1,53% |
| ECE tras calibrar | 0,43% (in-sample); ~0,5% en verificación en dos mitades | 0,74% |
| Confianza media antes de calibrar | 97,17% | 96,99% |
| Confianza media tras calibrar | 95,74% | 95,54% |
| NLL tras calibrar | 0,1453–0,1513 (verificación en dos mitades) | 0,1395 |

No hay comparación publicada con otros modelos (AraBERT, CAMeL-BERT, etc.) en la información disponible, por lo que no pueden citarse números comparativos sin inventarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con 7,25M de parámetros en FP32 (~29 MB de pesos) y entradas de 256 tokens, unos cientos de MB de VRAM o incluso CPU son suficientes.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (incluso integrada o una GTX/RTX de gama baja) es más que suficiente. No se necesitan A100 ni H100.
- Consumer GPU: cabe con holgura en cualquier GPU doméstica; probablemente ejecutable incluso en portátiles sin GPU discreta.
- Despliegue: PyTorch (librería nativa del modelo). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI; la inferencia se realiza mediante el código del repositorio (`answer.py`), que requiere las rutas `data/bpe.json`, `checkpoints/best.pt` y `checkpoints/temperature.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas directas. Como referencia de categoría (clasificadores de texto en árabe), los alternativas habituales son modelos preentrenados afinados; se indican sus características generales conocidas, no resultados medidos sobre este modelo:

| Modelo | Enfoque | Parametros | Licencia tipica |
|---|---|---|---|
| Arabic SANAD Encoder Classifier | Encoder entrenado desde cero, con calibración y abstención | ~7,25M | Apache-2.0 (propuesta) |
| AraBERT (afinado para clasificación) | Encoder preentrenado + cabeza de clasificación | 135M (base) / 372M (large) | Apache-2.0 |
| CAMeL-BERT (afinado) | Encoder preentrenado + cabeza de clasificación | 22M–770M según variante | Apache-2.0 |

El modelo de esta ficha es mucho más pequeño y no parte de preentrenamiento masivo, pero incorpora de serie calibración de confianza y abstención, algo que los afinados estándar no incluyen por defecto. Datos comparativos de rendimiento: no disponibles.

## Limitaciones y advertencias

- Dominio acotado: la exactitud del 95,47% no es transferible a otros sitios web, dialectos árabes, periodos temporales ni taxonomías de etiquetas distintas de las siete de SANAD.
- Normalización con pérdida: la eliminación de diacríticos y la unificación de formas de alef pueden borrar distinciones semánticas relevantes (por ejemplo, entre la preposición "على" y el nombre "علي").
- Desbalance de clases: Finanzas (31.485 artículos) frente a Cultura (5.397) en entrenamiento; la exactitud puede sobreestimar el rendimiento en clases minoritarias, por lo que debe vigilarse el macro-F1.
- No es generativo: no responde preguntas abiertas, no conversa, no decide sí/no ni asigna puntuaciones numéricas sin entrenar cabezas adicionales.
- No apto para decisiones automatizadas de alto riesgo, según la propia model card.
- Licencia pendiente: Apache-2.0 figura como licencia propuesta, no confirmada definitivamente por el autor en el momento de la publicación; el dataset SANAD es CC BY 4.0 y exige atribución al redistribuir o describir trabajos derivados.
- Modelo de borrador/recién creado (0 descargas registradas): la calidad del repositorio y la reproducibilidad no han sido verificadas por terceros.
- Riesgo de alucinación: no aplicable como tal al no ser generativo, pero puede clasificar erróneamente con confianza aparentemente razonable fuera de su dominio; el mecanismo de abstención mitiga parcialmente este riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hosam010023/Arabic_article_classifier
- Dataset SANAD (Mendeley Data): https://data.mendeley.com/datasets/57zpx667y9/2
- Paper de SANAD (Data in Brief): https://www.sciencedirect.com/science/article/pii/S2352340919304305
- Dataset en Hugging Face: arbml/SANAD (https://huggingface.co/datasets/arbml/SANAD)
- Repositorio de código, paper o demo del modelo: no disponibles
