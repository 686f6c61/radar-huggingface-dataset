# jwcwn/zl-mini-body-1

## Resumen

Wald-Q4B v2.1 es un modelo de decisión de 4B parámetros desarrollado por jwcwn (publicado bajo la organización org2ai en HuggingFace). No es un modelo conversacional al uso: recibe un estado (texto, imágenes o vídeo) junto con un conjunto de opciones tipadas y devuelve una probabilidad calibrada para cada opción, sin generar texto libre que haya que parsear. Está afinado a partir de Qwen/Qwen3.5-4B mediante un pase de entrenamiento de decisión a parámetros completos con un anclaje KL ligero hacia el modelo base.

El modelo resuelve un problema concreto en pipelines de agentes: la selección de herramientas, el enrutamiento de peticiones y la clasificación con umbrales de confianza. Al exponer probabilidades calibradas en lugar de texto, permite fijar umbrales deterministas y derivar decisiones de escalado o abstención. Incorpora un modo "Auto 0.7" que activa razonamiento nativo (hasta 512 tokens) solo cuando la probabilidad máxima cae por debajo de 0,7, lo que reduce coste en peticiones fáciles.

La relevancia actual reside en su licencia Apache-2.0, su tamaño contenido (4B, 4.659.865.088 parámetros reales según safetensors) y su despliegue autoalojado mediante una API compatible con Jev (`POST /v1/systemone`) sobre vLLM, además de soporte de cuantización GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, con torre de visión de Qwen3.5) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (soporte declarado vía llama.cpp); otras cuantizaciones no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B (variante chat) y se somete a un único pase de entrenamiento de decisión a parámetros completos, con un anclaje KL ligero hacia el modelo base para preservar capacidades. Los pesos publicados corresponden a una interpolación: 0,85 × modelo entrenado + 0,15 × modelo base (checkpoint `056A0-c31`). La torre de visión de Qwen3.5-4B se mantiene sin cambios y se usa en modo zero-shot; para vídeo, el servidor decodifica el clip una vez por petición y, por defecto, envía 32 fotogramas a la torre como un único vídeo nativo de Qwen3.5 con marcas de tiempo (ruta alternativa `frames16` con 16 fotogramas etiquetados como imágenes).

El mecanismo de inferencia es singular: un único forward pass lee una probabilidad para cada opción a partir de los logits de las letras de opción (plantilla de chat de Qwen), calibrada con una tabla de temperatura congelada. En el modo Auto 0.7 (por defecto), si la probabilidad superior es inferior a 0,7, el modelo razona una vez de forma nativa (máximo 512 tokens) y vuelve a leer las opciones. Con más de 26 opciones se aplica un knockout de una pasada sobre todas ellas. Los pensamientos generados son los del modelo base; no se entrenó texto de razonamiento.

En cuanto a datos, aproximadamente el 23 % de los tokens de entrenamiento provienen de los splits de train de benchmarks públicos que también alimentan el Decision Index, reformateados como decisiones. El resto es datos de decisión amplios: tareas generales de decisión como reglas y políticas, clasificación, entailment y verificación de hechos, tablas y documentos, y juicio (en torno al 35 %), junto con decisiones difíciles escritas y/o etiquetadas por modelos frontera (el resto, según la información disponible).

## Capacidades

- Decisión estructurada con probabilidades calibradas por opción, sin texto que parsear.
- Preguntas de tipo elección (`choice`) con criterios y de tipo sí/no/no sé (`noul`).
- Razonamiento nativo condicional (Auto 0.7): piensa hasta 512 tokens solo cuando la confianza es baja.
- Manejo de más de 26 opciones mediante knockout de una pasada.
- Entrada de imágenes zero-shot a través de la torre de visión de Qwen3.5-4B.
- Entrada de vídeo (hasta 32 MB y 300 s por petición, un vídeo por petición), con rutas `native32` y `frames16`.
- Selección de elementos web para acciones de navegador (evaluado en Mind2Web).
- Enrutamiento de agentes y selección de herramientas.
- Clasificación con umbrales de confianza derivados de la calibración.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declara soporte explícito de tool calling generativo ni de agentes multi-paso más allá del enrutamiento y la selección de opciones.

## Casos de uso

- Enrutamiento de tickets de soporte: se envía el texto del ticket como `state` y un conjunto de colas como opciones; el modelo devuelve la probabilidad de cada cola, y el sistema deriva a la de mayor probabilidad o a revisión humana si ninguna supera 0,7.
- Selección de herramientas en agentes: dado el estado de la conversación y el catálogo de herramientas disponibles como opciones tipadas, el modelo produce la distribución sobre herramientas, lo que permite integrar un umbral de abstención en el orquestador.
- Clasificación documental con confianza: para tablas, documentos y tareas de entailment o verificación de hechos, el modelo devuelve probabilidades calibradas que permiten fijar políticas de escalado sin postprocesar texto.
- Automatización de atención al cliente con imágenes: el cliente envía una foto junto con una pregunta `noul` (por ejemplo, "¿el artículo está visiblemente dañado?") y el modelo responde con probabilidad calibrada, útil en devoluciones o verificación de incidencias.
- Monitorización por vídeo en retail: análisis de clips de hasta 300 s con preguntas binarias (por ejemplo, si un comprador guarda un artículo en una bolsa), con la ruta `native32` por defecto y latencia declarada de 2,5 s para un clip de 15 s con 24 preguntas en una RTX 5090 en serie.
- Agentes de navegador web: selección del elemento de la página a accionar entre un conjunto de candidatos, con resultados declarados del 94,9 / 91,5 / 91,7 % en Mind2Web (tarea / sitio web / dominio).
- Moderación y juicio de contenido: uso de las opciones tipadas para clasificar contenido según políticas, con la probabilidad como señal de confianza para derivar casos límite a revisión.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados por el organizador del leaderboard; ejecuciones propias):

| Benchmark | Wald-Q4B v2.1 | Jev 1.13 (hosted) |
|---|---:|---:|
| Decision Index 0.3, suite pública completa (140.620 peticiones) | 60,05 (índice público, Auto 0.7; bruto 70,12, amplitud 58,63) | 57,96 (columna pública del board) |
| JevBench public set (231) | 210 (medido en Wald-4B v2.0) | 200/231 |
| JevBench-XL TEST (8.177) | 67,75 % | 67,85 % |
| Mind2Web selección de elemento (tarea / sitio / dominio) | 94,9 / 91,5 / 91,7 % | 88,3 / 86,9 / 86,6 % |
| Decisiones de imagen, 11 benchmarks públicos de Decision Index Vision (conversiones propias) | 67,23 | sin entrada de imagen |
| JevAdvBench, tasa de flip (menor es mejor) | 7,1 % | 6,1 % |

El model-index declara además un `balanced_skill_index` de 60,05 sobre Decision Index 0.3 (suite pública completa, 140.620 peticiones), marcado como no verificado. Latencia declarada: mediana de 158 ms en serie (una petición en vuelo, en caliente, tiempo de procesamiento) sobre una RTX PRO 6000 con 200 peticiones de DI 0.3. Vídeo: 87,4 % en VisualDecisionBench video (7.143 preguntas, ejecución propia) y 2,5 s para un clip de 15 s con 24 preguntas en una RTX 5090 en serie.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,66B parámetros, en FP16 serían necesarios aproximadamente 9,3 GB de pesos, y en cuantizaciones GGUF de 4-8 bits, del orden de 3-6 GB, si bien estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: el autor reporta ejecuciones en RTX PRO 6000 y RTX 5090; el despliegue de referencia requiere una GPU NVIDIA.
- GPU de consumo: cabe en GPU de consumo con cuantización GGUF mediante llama.cpp; el soporte de vLLM con el servidor `wald-serve` se documenta para GPU NVIDIA.
- Opciones de despliegue: vLLM mediante el servidor `wald-serve` (API `POST /v1/systemone` en el puerto 8000, con `run.sh` y `uv`), llama.cpp con pesos GGUF, y Docker según el RUNBOOK del repositorio.
- Latencia y throughput: mediana de 158 ms en serie sobre RTX PRO 6000 (200 peticiones de DI 0.3, una en vuelo, en caliente); 2,5 s para un clip de vídeo de 15 s con 24 preguntas en RTX 5090 en serie. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wald-Q4B v2.1 | 4,66B | no disponible | Decisiones con probabilidades calibradas, visión y vídeo | Apache-2.0 | Pesos abiertos en HuggingFace, despliegue propio |
| Jev 1.13 (hosted) | no disponible | no disponible | Decisiones con probabilidades calibradas | no disponible (servicio alojado) | Solo alojado |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base chat multimodal | no disponible en la información proporcionada | Pesos abiertos en HuggingFace |

La comparación con Jev 1.13 se basa en las cifras que el propio autor incluye en su model card; Jev es un servicio alojado sin pesos públicos disponibles según la información consultada. Frente a Qwen3.5-4B, Wald-Q4B añade la capa de decisión calibrada y el modo Auto 0.7, manteniendo la torre de visión sin cambios.

## Limitaciones y advertencias

- Los benchmarks son ejecuciones propias del autor, no verificadas por el organizador del leaderboard; el propio model-index marca el resultado como `verified: false`.
- El resultado de JevBench public set (210) se midió en Wald-4B v2.0, no en v2.1.
- Idiomas soportados: solo inglés según la model card; el rendimiento en castellano no está evaluado.
- La longitud de contexto no se declara en la información disponible, lo que impide dimensionar casos de contexto largo.
- El modelo devuelve probabilidades sobre opciones predefinidas; no es adecuado para generación de texto libre ni para conversación abierta.
- El razonamiento nativo está acotado a 512 tokens y solo se activa por debajo del umbral 0,7; los pensamientos provienen del modelo base y no fueron entrenados.
- La calibración depende de una tabla de temperatura congelada; cambios en la distribución de entrada pueden degradar la fiabilidad de las probabilidades.
- Tasa de flip del 7,1 % en JevAdvBench, superior al 6,1 % de Jev 1.13: cierta sensibilidad a perturbaciones adversariales.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al tratarse de un fine-tune sobre Qwen3.5-4B, hereda los sesgos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni auditorías de calibración en dominios distintos a los evaluados.
- El soporte de vídeo requiere `wald-serve` 0.2.2 desde la rama `main`; los pesos son los mismos que la etiqueta `v2.1`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwcwn/zl-mini-body-1
- Repositorio del modelo referenciado (org2ai/Wald-4B): https://huggingface.co/org2ai/Wald-4B
- Resultados de Decision Index 0.3: https://huggingface.co/datasets/org2ai/Wald-Q4B-decision-index-results/tree/main/runs/wald-q4b-v21-056A0-auto07
- Documentación de la API: https://huggingface.co/org2ai/Wald-4B/blob/main/docs/api.md
- RUNBOOK (servidor, Docker y evaluación): https://huggingface.co/org2ai/Wald-4B/blob/main/RUNBOOK.md
- Evaluación v2.1: https://huggingface.co/org2ai/Wald-4B/tree/main/evaluation/v2.1
- Resultados de vídeo: https://huggingface.co/org2ai/Wald-4B/blob/main/evaluation/v2.1/video.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
