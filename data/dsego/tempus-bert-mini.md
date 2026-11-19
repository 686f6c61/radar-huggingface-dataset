# dsego/tempus-bert-mini

## Resumen

Tempus-bert-mini es un clasificador de etiquetado de tokens (token classification) desarrollado por dsego que determina, para cada número de un mensaje de chat en inglés que podría representar una hora del reloj, si se trata de una hora de la mañana (am), de la tarde/noche (pm) o de ningún tipo de hora. Se construye mediante fine-tuning de google/bert_uncased_L-4-H-256-A-4, un BERT mini de 11 millones de parámetros, y se distribuye en formato ONNX cuantizado a int8 (11 MB) y fp16 (21 MB).

El modelo no es autónomo: el código circundante localiza los candidatos numéricos y lee sus dígitos, mientras que la red se limita a etiquetar cada candidato. Está pensado para la extracción de horas en asistentes conversacionales y sistemas de agenda, con una latencia de aproximadamente 1,4 ms por mensaje en CPU de servidor y 9 ms en una Raspberry Pi 4. Su punto débil declarado es la desambiguación de horas implícitas por contexto situacional ("dinner at 7"), donde rinde claramente por debajo de un modelo generativo mayor.

El proyecto es relevante por su enfoque de eficiencia extrema: resuelve una tarea acotada de extracción de entidades temporales con un modelo de 11 MB que puede ejecutarse en navegador, dispositivos embebidos o servidores sin GPU, a un coste computacional mínimo y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (google/bert_uncased_L-4_H-256_A-4), 4 capas, 256 dimensiones ocultas, 4 cabezas de atención |
| Parametros totales | 11 millones (11M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del BERT base; no especificada en la model card) |
| Tipos de cuantizacion | int8 (recomendado, 11 MB) y fp16 (21 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`int8.onnx`, `fp16.onnx`) y vocabulario WordPiece (`vocab.txt`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de token classification sobre google/bert_uncased_L-4_H-256_A-4, un BERT mini con 4 capas de encoder, 256 dimensiones ocultas y 4 cabezas de atención, que suma 11 millones de parámetros. La entrada son `input_ids` y `attention_mask`; la salida son `logits` con una fila por token sobre tres clases (none, am, pm). La clase de un candidato se lee en su primer token. El modelo se exportó a ONNX en dos variantes: int8 con pesos de 8 bits y fp16 con pesos de 16 bits y la misma aritmética que precisión completa.

El entrenamiento se realizó sobre 11.299 mensajes sintéticos, generados y verificados por modelos de lenguaje con una pequeña revisión humana puntual. No se documentan en la información disponible detalles sobre número de épocas, hiperparámetros, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a una tarea de etiquetado supervisado. La innovación técnica principal es la separación de responsabilidades: el código externo (en `src/tempus/candidates.py` y `src/tempus/classifier.py`, con un port a JavaScript en `web/`) localiza candidatos y lee dígitos, mientras que la red solo clasifica, lo que permite un modelo minúsculo y rápido.

## Capacidades

- Clasificación de tokens para desambiguar horas del reloj en mensajes de chat en inglés: etiqueta cada número candidato como none, am o pm.
- Extracción de horas escritas con dígitos, además de las palabras "noon" y "midnight".
- Inferencia ultraligera: aproximadamente 1,4 ms de mediana por mensaje en 4 núcleos de un Ryzen 3600, 9 ms en Raspberry Pi 4 (4 hilos), 18 ms en un solo hilo y unos 4 ms en una pestaña de navegador en un Mac con Apple Silicon.
- Ejecución en CPU sin GPU, en dispositivos embebidos y en navegador gracias a la exportación ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.
- No es un modelo generativo: no produce texto libre, solo etiquetas por token.

## Casos de uso

- Extracción de horas en asistentes conversacionales: el modelo etiqueta cada número candidato de un mensaje ("meet at 3" → pm) y el código circundante ensambla la respuesta; es adecuado por su latencia de milisegundos en CPU y su tamaño de 11 MB.
- Normalización de agendas y recordatorios: en un pipeline de procesamiento de mensajes entrantes, se usa para convertir expresiones numéricas en horas con meridiano antes de crear eventos de calendario.
- Procesamiento por lotes de historiales de chat: al ejecutarse en CPU de servidor a ~1,4 ms por mensaje, permite clasificar grandes volúmenes de mensajes sin GPU ni coste de infraestructura relevante.
- Despliegue en dispositivos embebidos o edge: con 9 ms en Raspberry Pi 4, encaja en asistentes domésticos, kioscos o gateways IoT que necesitan interpretar horas sin conexión a la nube.
- Ejecución en navegador: el port JavaScript en `web/` y la variante ONNX permiten clasificar horas en el cliente (~4 ms en Apple Silicon), útil para aplicaciones web de chat con privacidad local.
- Filtrado previo en pipelines de extracción de entidades: como clasificador barato, descarta falsos candidatos numéricos antes de invocar un modelo mayor o un LLM, reduciendo coste y latencia.
- Sistemas de reservas o transporte con entrada de texto libre: interpreta horas numéricas en solicitudes de usuarios ("pickup at 8") para alimentar la lógica de negocio.

## Benchmarks y rendimiento

Resultados de coincidencia exacta por mensaje tras el ensamblaje del código circundante; se elige el mejor de tres ejecuciones de entrenamiento según estas mismas evaluaciones.

| Evaluación | int8.onnx | Media de tres ejecuciones (precisión completa) |
|---|---|---|
| Principal (530 mensajes) | 92,8% | 92,3% |
| Fresca (378 mensajes de situaciones no vistas en entrenamiento) | 92,6% | 91,6% |
| Falsas alarmas en 1.021 mensajes difíciles sin hora | 1,8% | 1,6% |
| Horas implícitas por situación, evaluación principal | no disponible (media de tres ejecuciones: 79,5%) | 79,5% |
| Horas implícitas por situación, evaluación fresca | no disponible (media de tres ejecuciones: 76,6%) | 76,6% |

En mensajes donde la hora solo se infiere por la situación ("dinner at 7"), la media de tres ejecuciones es del 79,5% en la evaluación principal y del 76,6% en la fresca; el modelo generativo de 230M del mismo autor alcanza aproximadamente el 92% en ese escenario.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para CPU. En GPU, el consumo de memoria es despreciable (11 MB en int8, 21 MB en fp16).
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, pero no aporta ventaja significativa.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU: Raspberry Pi 4 (9 ms con 4 hilos, 18 ms con un solo hilo), CPU de servidor (Ryzen 3600, ~1,4 ms de mediana) y navegador (~4 ms en Apple Silicon).
- Opciones de despliegue: ONNX Runtime (formato nativo), con port JavaScript para navegador; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~1,4 ms de mediana por mensaje en 4 núcleos de Ryzen 3600 (incluyendo búsqueda de candidatos y tokenización); 9 ms en Raspberry Pi 4 con 4 hilos; 18 ms en un solo hilo; ~4 ms en pestaña de navegador en Mac con Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dsego/tempus-bert-mini | 11M | no disponible | Etiquetado de tokens (horas am/pm/none) | Apache 2.0 | Hugging Face (ONNX) |
| dsego/tempus-lfm2.5-230m | 230M | no disponible | Generación (extracción de horas, ~92% en horas implícitas) | no disponible | Hugging Face |
| google/bert_uncased_L-4_H-256_A-4 | 11M | no disponible | Modelo base BERT mini (encoder) | Apache 2.0 | Hugging Face |

La comparación con otros modelos de la misma categoría (clasificadores de extracción temporal) no está disponible en la información proporcionada. El propio autor referencia tempus-lfm2.5-230m como alternativa generativa con mejor rendimiento en horas implícitas por contexto.

## Limitaciones y advertencias

- Solo inglés; no procesa otros idiomas.
- Solo reconoce horas escritas con dígitos, además de "noon" y "midnight"; no cubre otras expresiones temporales.
- Débil en situaciones no familiares: en horas implícitas por contexto rinde al 79,5% (principal) y 76,6% (fresca), frente al ~92% de un modelo generativo de 230M.
- Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una pequeña revisión humana puntual, lo que puede introducir sesgos y artefactos de distribución.
- Tasa de falsas alarmas del 1,8% (int8) en 1.021 mensajes difíciles sin hora; puede etiquetar erróneamente números que no son horas.
- No es un modelo autónomo: requiere el código circundante para localizar candidatos y ensamblar la respuesta; sin él no produce una salida útil.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en contextos ambiguos.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial con las condiciones de dicha licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-bert-mini
- Repositorio de código y fine-tuning: https://github.com/dsegovia90/tempus_finetune
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Alternativa generativa del mismo autor: https://huggingface.co/dsego/tempus-lfm2.5-230m
