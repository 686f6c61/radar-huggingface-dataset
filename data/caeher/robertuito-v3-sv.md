# caeher/robertuito-v3-sv

## Resumen

RoBERTuito v3 SV (`caeher/robertuito-v3-sv`) es un modelo de clasificación de secuencias en español, desarrollado por el usuario caeher, que etiqueta publicaciones de redes sociales en cuatro clases: no tóxico, lenguaje ofensivo, discurso de odio y amenazas o violencia. Está construido a partir del encoder `pysentimiento/robertuito-base-cased`, un RoBERTa base adaptado al español de redes sociales, y se ha ajustado sobre el corpus V3 del proyecto, compuesto por publicaciones públicas anonimizadas con foco en El Salvador.

El modelo tiene 108.790.276 parámetros (recuento real de los pesos en safetensors) y un tamaño de repositorio de 0,4 GB, por lo que es un clasificador pequeño y desplegable en CPU o en cualquier GPU de consumo. El artefacto publicado corresponde a la mediana de tres semillas (42, 1337 y 2026), con la semilla 2026 seleccionada por F1 de validación, y se entrenó con longitud máxima de 128 tokens y pesos reducidos para ejemplos sintéticos.

Su relevancia es doble: por un lado cubre una variante dialectal poco representada en los corpus de toxicidad en español (español de El Salvador y su jerga en redes), y por otro publica métricas con intervalos de confianza bootstrap, algo poco habitual en modelos de este tipo. El propio autor advierte que no debe usarse como único criterio de moderación ni para tomar decisiones sobre personas, y que requiere revisión humana. La licencia MIT facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base cased), ajustado para clasificación de secuencias con cabeza de 4 clases |
| Parametros totales | 108.790.276 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el ajuste fino; la model card no especifica una ventana mayor utilizable |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; el modelo es compatible con cuantización estándar de PyTorch/ONNX) |
| Idiomas soportados | Español (`es`), con foco en español de El Salvador y registro de redes sociales |
| Licencia | MIT |
| Formato de pesos | Safetensors (repositorio de 0,4 GB, librería `transformers`) |

Otros datos relevantes: `pipeline_tag` = `text-classification`, etiquetas declaradas `hate-speech-detection`, `offensive-language`, `spanish`, `el-salvador`, `social-media`, y compatibilidad con `text-embeddings-inference` y endpoints. Descargas y likes registrados en HuggingFace: 0 en ambos casos en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RoBERTa en versión base y *cased*, es decir, sensible a mayúsculas y minúsculas, preentrenado originalmente sobre grandes volúmenes de texto informal en español (`pysentimiento/robertuito-base-cased`). Sobre ese backbone se ha añadido una cabeza de clasificación de cuatro clases y se ha realizado un ajuste supervisado con el corpus V3 del proyecto, usando el campo `texto_modelo` como entrada, una longitud máxima de 128 tokens y pesos reducidos para los ejemplos sintéticos del conjunto. El modelo publicado no es un único ajuste: se entrenaron tres semillas (42, 1337 y 2026) y se seleccionó la semilla 2026 por su F1 de validación.

El corpus de entrenamiento está formado por publicaciones públicas anonimizadas, con presencia de lenguaje ofensivo y discurso de odio explícito. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de preferencia como RLHF o DPO; en un clasificador de este tipo lo habitual es entrenamiento supervisado con entropía cruzada, pero ese dato no se confirma en la información disponible. Sí se documenta una brecha de rendimiento entre las fuentes X y Facebook, lo que sugiere un dataset heterogéneo por plataforma, y la existencia de una sonda adversarial descrita como diagnóstica, que no sustituye a una evaluación independiente.

## Capacidades

- Clasificación de texto en cuatro categorías excluyentes: 0 = no tóxico, 1 = lenguaje ofensivo, 2 = discurso de odio, 3 = amenazas o violencia.
- Funciona sobre texto corto de redes sociales (publicaciones y comentarios), con truncado a 128 tokens.
- Etiquetado por secuencia con probabilidades por clase, reutilizables como señal de *scoring* o *ranking*.
- Extracción de representaciones internas del encoder, aprovechable para tareas auxiliares de similitud o agrupamiento.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")` y compatibilidad declarada con `text-embeddings-inference` y endpoints.
- No dispone de *tool calling*, ni de modo agente, ni de razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No tiene capacidades multimodales (visión, audio) ni generación de texto.
- Cobertura multilingüe limitada al español; no se documenta soporte para otras lenguas ni para variantes más allá del foco salvadoreño.

## Casos de uso

- Moderación asistida de comunidades en línea: el modelo puede preclasificar cada comentario en una de las cuatro categorías y derivar solo los casos dudosos o graves a revisión humana, reduciendo el volumen de trabajo manual en foros, grupos de Facebook o hilos de X.
- Priorización de amenazas: la clase 3 (amenazas/violencia) permite construir una cola de alertas de mayor severidad que se revisa antes que el resto, útil en equipos de confianza y seguridad con recursos limitados.
- Monitorización de marca o reputación: procesar en lote menciones y comentarios sobre una organización o figura pública para medir qué proporción cae en lenguaje ofensivo o discurso de odio, y detectar picos anómalos.
- Anotación asistida de corpus para investigación: usar las predicciones como preetiquetado en estudios sobre toxicidad en español salvadoreño, con corrección humana posterior, para acelerar la construcción de datasets.
- Filtrado previo en plataformas de contenido generado por usuarios: descartar o marcar automáticamente comentarios que superan un umbral de probabilidad en las clases 1-3 antes de que se publiquen o se muestren.
- Señal auxiliar en sistemas de recomendación y ordenación: incorporar la puntuación de toxicidad como característica adicional para no promover contenido ofensivo en *feeds*.
- Investigación sociolingüística comparada: al estar especializado en una variante poco cubierta, permite comparar patrones de toxicidad entre plataformas (X frente a Facebook) dentro del mismo ecosistema lingüístico.
- Inferencia de bajo coste en producción: con unos 109 millones de parámetros, se puede ejecutar en CPU dentro del propio servidor de aplicación sin depender de GPU, lo que abarata despliegues de moderación a pequeña escala.

## Benchmarks y rendimiento

Resultados publicados en la model card (clasificación de cuatro clases, métrica F1 macro y *accuracy*):

| Corte | F1 macro | Accuracy | n |
|---|---:|---:|---:|
| Validación | 0,8379 | 0,8410 | 459 |
| Test | 0,8260 | 0,8283 | 460 |

Intervalo de confianza bootstrap del 95 % para el F1 macro de test: [0,7884, 0,8598].

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni comparaciones numéricas frente a otros modelos de detección de toxicidad. La model card menciona además una brecha de rendimiento entre X y Facebook y una sonda adversarial de carácter diagnóstico, pero no aporta cifras para ninguno de los dos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32, 0,22 GB en fp16/bf16 y 0,11 GB en int8, solo para los pesos. Con activaciones y lote pequeño, cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Para lotes grandes y *throughput* alto, tarjetas de centro de datos como T4, L4, A10, A100 o H100; en escritorio, RTX 3060, 4060, 4090 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo con soporte CUDA, incluidos equipos antiguos, y también en Apple Silicon vía Metal (MPS).
- Ejecución en CPU: viable para volúmenes moderados, ya que es un encoder de 108 millones de parámetros con secuencias de 128 tokens.
- Opciones de despliegue: `transformers` con `pipeline`, HuggingFace Text Generation Inference (TGI) para servir clasificadores, ONNX Runtime para exportación y ejecución optimizada en CPU/GPU, y contenedores propios con FastAPI. El repositorio declara compatibilidad con `text-embeddings-inference` y endpoints. `llama.cpp` y `Ollama` no son vías habituales para un modelo de clasificación de este tipo, y vLLM solo resulta relevante si se despliega mediante su soporte de modelos con *pooling*.
- Latencia y throughput: no publicados. Como referencia de orden de magnitud, un encoder de este tamaño y longitud de secuencia suele procesar desde varios cientos hasta algunos miles de muestras por segundo por GPU en fp16 y lotes grandes, y decenas o cientos por segundo en CPU multinúcleo, pero estas cifras no están verificadas para este modelo concreto y deben medirse en el entorno de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caeher/robertuito-v3-sv (este modelo) | 108.790.276 | 128 tokens en ajuste | Clasificación de toxicidad en 4 clases, español de El Salvador | MIT | HuggingFace, vía `transformers` |
| pysentimiento/robertuito-base-cased | Aproximadamente el mismo backbone (es el modelo base de este ajuste) | No disponible en la información proporcionada | Encoder preentrenado en español de redes sociales | No disponible | HuggingFace |
| pysentimiento/robertuito-\* (ajustes de sentimiento, emociones y toxicidad) | No disponible | No disponible | Clasificación de texto en español de redes sociales | No disponible | HuggingFace |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | No disponible | No disponible | Encoder BERT preentrenado en español general | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, tarea y licencia del modelo descrito frente a sus referencias más directas.

## Limitaciones y advertencias

- La propia model card indica que el modelo no debe usarse como único criterio para moderación ni para tomar decisiones sobre personas: exige revisión humana y evaluación específica del dominio.
- Riesgo de falsos positivos en usos irónicos, reivindicativos o en jerga dialectal, un problema habitual en detección de toxicidad y no cuantificado en la información disponible.
- Las métricas dependen de la distribución del corpus; se documenta una brecha de rendimiento entre X y Facebook, de modo que el comportamiento puede degradarse en plataformas o registros distintos a los de entrenamiento.
- Los conjuntos de validación y test son pequeños (459 y 460 ejemplos), por lo que los intervalos de confianza son amplios ([0,7884, 0,8598] en F1 de test) y las diferencias finas entre versiones pueden no ser significativas.
- La sonda adversarial descrita es diagnóstica y no sustituye a una evaluación independiente en el dominio de despliegue.
- Cobertura idiomática limitada al español, con foco salvadoreño; no se documenta comportamiento en otras variedades del español ni en textos formales o largos.
- La longitud de contexto del ajuste (128 tokens) implica truncado en publicaciones largas o hilos, lo que puede perder el contexto necesario para clasificar correctamente.
- No se documentan análisis de sesgo por género, orientación, origen u otros ejes, ni datos sobre la composición demográfica del corpus.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- Licencia MIT para el artefacto publicado, pero conviene verificar las condiciones del modelo base `pysentimiento/robertuito-base-cased` antes de un uso comercial, ya que la model card no las reproduce.
- El entrenamiento usa publicaciones públicas anonimizadas, pero no se detalla el proceso de anonimización ni su robustez frente a reidentificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caeher/robertuito-v3-sv
- Modelo base citado en la model card: https://huggingface.co/pysentimiento/robertuito-base-cased
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos correspondían a textos legales alemanes sin relación con el modelo.
