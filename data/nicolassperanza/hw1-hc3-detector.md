# NicolasSperanza/hw1-hc3-detector

## Resumen

El modelo `NicolasSperanza/hw1-hc3-detector` es un clasificador de texto etiquetado como `text-classification` en HuggingFace, construido sobre la arquitectura BERT y distribuido en formato `safetensors` con la librería `transformers`. Cuenta con 22.713.986 parámetros reales, lo que lo sitúa en la gama de modelos compactos de codificación bidireccional, muy por debajo de los 110 millones de parámetros de un BERT-base estándar. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

El nombre del identificador (`hw1-hc3-detector`) y la existencia de múltiples repositorios homónimos publicados por otros usuarios (`xw131/hw1-hc3-detector`, `HongjiP/hw1-hc3-detector`, entre otros) apuntan a un ejercicio académico de clasificación binaria de texto humano frente a texto generado por ChatGPT, usando el conjunto de datos HC3 como referencia. El sufijo "hw1" sugiere una primera tarea de curso, y la replicación del mismo nombre por varios autores refuerza esa interpretación.

La relevancia del modelo es fundamentalmente didáctica y de referencia: la model card está generada automáticamente con la plantilla por defecto de HuggingFace y no contiene información sustantiva sobre datos de entrenamiento, hiperparámetros, licencia o evaluación. Cualquier uso en producción requeriría validar de forma independiente el comportamiento del clasificador, ya que no hay métricas publicadas ni documentación del proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según etiqueta `bert` del repositorio); configuración concreta (capas, dimensión oculta, cabezas de atención) no disponible |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (los modelos de la familia BERT suelen limitarse a 512 tokens, dato no confirmado en la información disponible) |
| Tipos de cuantizacion | No disponible; al publicarse únicamente pesos `safetensors` en precisión nativa, la cuantización a int8/fp16 requeriría conversión manual |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta `bert`, lo que sitúa al modelo en la familia de transformers con encoder bidireccional y objetivo de modelado de lenguaje enmascarado, reutilizado habitualmente mediante una cabeza de clasificación de secuencia sobre el token `[CLS]`. Con 22.713.986 parámetros totales, el modelo es notablemente más pequeño que un BERT-base (110 millones), lo que sugiere una configuración reducida o un vocabulario/pruning no documentado. La información disponible no permite confirmar el número de capas, la dimensión oculta, el número de cabezas ni la longitud máxima de secuencia.

No hay ningún dato publicado sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre hiperparámetros como la tasa de aprendizaje, el tamaño de batch o el régimen de precisión. La model card incluye los marcadores `[More Information Needed]` en todas las secciones relevantes. La única pista indirecta es el nombre del modelo, que referencia HC3 (conjunto de datos de pares pregunta-respuesta humano frente a ChatGPT), y la existencia de proyectos comunitarios análogos que ajustan `roberta-base` sobre ese mismo corpus.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la salida esperada es una o varias etiquetas con su puntuación de confianza sobre una secuencia de entrada.
- Detección de texto generado por IA: por el identificador `hc3-detector`, la tarea probable es distinguir entre texto escrito por humanos y texto generado por ChatGPT. Esta capacidad es inferida, no confirmada en la documentación.
- Inferencia de embeddings textuales: la etiqueta `text-embeddings-inference` indica compatibilidad con ese motor de despliegue, lo que implica que el modelo puede servir representaciones vectoriales de secuencia además de logits de clasificación.
- Compatibilidad con endpoints alojados: la etiqueta `endpoints_compatible` señala que el modelo puede desplegarse en la infraestructura de Inference Endpoints de HuggingFace.
- Tool calling / function calling: no soportado. Es un modelo encoder-only de clasificación, sin generación autoregresiva.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el repositorio no declara ninguna.

## Casos de uso

- Filtrado de contenido generado por IA en plataformas educativas: el modelo podría puntuar entregas o respuestas de foros para marcar posibles textos producidos por asistentes conversacionales, siempre que se valide antes su precisión sobre datos propios, dado que no hay métricas publicadas.
- Integridad académica en pipelines de corrección automática: encadenado tras un extractor de texto, podría generar una señal adicional para revisión humana, nunca como decisión automática sancionadora.
- Moderación de contenido en comunidades online: como clasificador auxiliar de bajo coste computacional (22,7 millones de parámetros) para priorizar la revisión de publicaciones sospechosas de generación automática masiva.
- Detección de spam generado sintéticamente: aplicable a la detección de reseñas, comentarios o mensajes producidos en serie, donde la firma estilística del texto generado por LLM es un indicio útil entre varios.
- Etiquetado de corpus para investigación lingüística: usar el clasificador como anotador débil sobre grandes volúmenes de texto para construir datasets preliminares de texto humano frente a texto sintético, con revisión posterior.
- Componente de un clasificador en cascada: al ser tan pequeño, puede actuar como primer filtro barato antes de modelos más grandes y costosos, reduciendo el coste de inferencia en sistemas de moderación a gran escala.
- Despliegue en CPU para servicios de bajo tráfico: sus 22,7 millones de parámetros permiten servir el modelo en contenedores sin GPU, adecuado para demos, prácticas docentes o microservicios internos.
- Práctica docente y trabajos de curso: el repositorio encaja como ejemplo reproducible de ajuste fino de un encoder para clasificación de secuencias y publicación en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación cumplimentada, y la búsqueda web no ha devuelto métricas asociadas a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en fp32 (22,7 M de parámetros × 4 bytes) y unos 45 MB en fp16. Con estados intermedios de activaciones y batch pequeño, el consumo real se mantiene por debajo de 1 GB en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050 o superiores. En la práctica, no se necesita GPU.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo de los últimos diez años, y también en CPU. El modelo cabe holgadamente en sistemas embebidos con 1 GB de RAM libre.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta declarada), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), y exportación manual a ONNX u otros formatos. No se declaran pesos GGUF, por lo que Ollama o llama.cpp requerirían una conversión previa.
- Latencia y throughput estimados: no disponibles. Como referencia dimensional, un encoder de 22,7 millones de parámetros procesa secuencias cortas en pocos milisegundos en GPU moderna y en decenas de milisegundos en CPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NicolasSperanza/hw1-hc3-detector | 22,7 M | No disponible | Clasificación de texto | No disponible | HuggingFace, 0 descargas |
| xw131/hw1-hc3-detector | No disponible | No disponible | Clasificación de texto | No disponible | HuggingFace |
| HongjiP/hw1-hc3-detector | No disponible | No disponible | Clasificación de texto | No disponible | HuggingFace |
| sks2705/ai-text-detector | ~125 M (roberta-base) | 512 tokens | Detección humano vs ChatGPT sobre HC3 | No disponible | HuggingFace y GitHub |

El ecosistema de detectores de texto generado por IA incluye alternativas como `openai-community/roberta-base-openai-detector` (125 M de parámetros, licencia MIT, entrenado por OpenAI) o clasificadores basados en DeBERTa, pero no se dispone de datos comparativos de rendimiento con este modelo concreto, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de HuggingFace sin ninguna sección completada, lo que impide conocer el proceso de entrenamiento, los datos usados y las condiciones de uso previstas.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial. En ausencia de licencia explícita, el uso en producción conlleva incertidumbre legal.
- Riesgo de sesgo del dataset de origen: los detectores entrenados sobre HC3 heredan las limitaciones de ese corpus, que cubre dominios, idiomas y estilos muy concretos y puede producir falsos positivos sistemáticos sobre variedades dialectales, escritura no nativa o estilos formales.
- Riesgo de alucinación/error: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza; no hay curvas de calibración publicadas.
- Sesgo de dominio y posible sobreajuste al corpus de entrenamiento: sin datos de evaluación independientes, es imposible estimar la generalización fuera del dominio original.
- Cobertura lingüística desconocida: no se declara ningún idioma soportado, por lo que el comportamiento fuera del idioma de entrenamiento es una incógnita.
- Limitación de contexto: si sigue la convención de BERT, la entrada podría truncarse a 512 tokens, lo que impediría clasificar documentos largos en una sola pasada.
- Detección de IA poco fiable por naturaleza: este tipo de clasificadores degradan su precisión a medida que cambian los modelos generativos, y no deben usarse como prueba concluyente en contextos de integridad académica o laboral.
- Repositorio con métricas de adopción nulas: cero descargas y cero likes indican que no ha sido validado por la comunidad, lo que aumenta el riesgo de artefactos, pesos mal subidos o configuraciones inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NicolasSperanza/hw1-hc3-detector
- Repositorio homónimo de xw131: https://huggingface.co/xw131/hw1-hc3-detector
- Repositorio homónimo de HongjiP: https://huggingface.co/HongjiP/hw1-hc3-detector
- Entrada de registro en free2aitools: https://free2aitools.com/model/rafaonieva/hw1-hc3-detector
- Entrada de registro en savrn: https://savrn.com/models/hw1-hc3-detector
- Proyecto comunitario de detección de texto IA sobre HC3: https://github.com/sks2705/ai-text-detector
- Paper citado en las etiquetas del repositorio (calculadora de impacto medioambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de Machine Learning: https://mlco2.github.io/impact
