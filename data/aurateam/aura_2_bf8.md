# aurateam/AURA_2_BF8

## Resumen

AURA 2.0 es un modelo de lenguaje para vídeo en streaming desarrollado por el equipo AURA (aurateam), presentado en el informe técnico "Beyond Answering: Learning to Speak First and Act in Streaming Video" (arXiv:2611.17048). Se construye sobre el modelo base Qwen/Qwen3.5-9B y se distribuye en este repositorio como un checkpoint cuantizado en FP8 mediante compressed-tensors. El modelo está diseñado para iniciar conversaciones de forma proactiva, invocar herramientas a partir del flujo de vídeo en directo y fundamentar sus interacciones en objetos y regiones concretas de los fotogramas.

La propuesta central es el cambio de paradigma respecto a los modelos de vídeo tradicionales: en lugar de esperar una pregunta del usuario, AURA 2.0 aprende a "hablar primero" y a actuar sobre el stream. Esto lo sitúa en el ámbito de los asistentes multimodales en tiempo real, con aplicaciones potenciales en monitorización, robótica o atención asistida.

El checkpoint tiene 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 11,9 GB en formato safetensors. Los idiomas declarados son inglés y chino, y la licencia es CC BY-NC 4.0, lo que restringe el uso a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para vídeo en streaming, derivado de Qwen/Qwen3.5-9B (detalle interno no disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); no se detallan otros formatos en el repositorio |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | CC BY-NC 4.0 (solo investigación no comercial) |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

AURA 2.0 se apoya en el modelo base Qwen/Qwen3.5-9B y añade capacidades de vídeo en streaming: procesamiento de fotogramas en tiempo real, fundamentación espacial (grounding en objetos y regiones) e invocación de herramientas a partir del contenido visual. El repositorio no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; esa información solo podría estar en el informe técnico arXiv:2611.17048, que no se ha incluido en la información disponible.

La innovación destacada por el autor es el comportamiento proactivo: el modelo puede iniciar la conversación sin esperar una consulta explícita y actuar sobre el stream (llamadas a herramientas, referencias a regiones del fotograma). El checkpoint publicado está cuantizado en FP8 con compressed-tensors, lo que reduce el peso a 11,9 GB y facilita su despliegue en hardware con soporte para FP8.

## Capacidades

- Comprensión de vídeo en streaming y respuesta a partir del flujo en directo.
- Inicio proactivo de conversaciones ("speak first") sin consulta previa del usuario.
- Invocación de herramientas (tool calling) basada en el contenido del stream.
- Fundamentación espacial: referencia a objetos y regiones concretas de los fotogramas.
- Generación de texto y razonamiento multimodal derivados del modelo base Qwen3.5-9B.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modo de razonamiento en varios pasos y comportamiento de agente (según la descripción del proyecto).

## Casos de uso

- Monitorización de vídeo en directo: el modelo puede iniciar avisos cuando detecta eventos relevantes en el stream, sin esperar una consulta, lo que encaja con vigilancia de instalaciones o control de calidad en líneas de producción.
- Asistencia remota en tiempo real: un operador puede recibir descripciones y referencias a regiones concretas del vídeo mientras un técnico trabaja sobre el terreno, aprovechando el grounding espacial.
- Robótica y agentes embebidos: la invocación de herramientas a partir del stream permite conectar el modelo con actuadores o APIs externas en bucles de percepción-acción.
- Accesibilidad: descripción proactiva de escenas de vídeo para personas con discapacidad visual, con referencias localizadas a objetos del fotograma.
- Análisis de retransmisiones deportivas o eventos: detección y narración de acciones con anclaje espacial en la imagen.
- Investigación en modelos de vídeo conversacionales: al ser un checkpoint de investigación con licencia no comercial, sirve como base para experimentos académicos sobre proactividad y streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 11,9 GB en disco, por lo que se necesita al menos ese orden de magnitud en memoria, más overhead de activaciones y del procesador de vídeo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPUs con soporte FP8 como H100 o L40S; en consumer, una RTX 4090 (24 GB) sería el mínimo razonable, aunque no está confirmado.
- Cabe en GPU consumer: probablemente en RTX 4090 y modelos con 24 GB o más, sujeto a verificación.
- Opciones de despliegue: no disponible. El formato compressed-tensors FP8 requiere frameworks compatibles (por ejemplo, vLLM con soporte compressed-tensors); no se indica compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AURA 2.0 (este) | 9,4 B | no disponible | CC BY-NC 4.0 | Vídeo en streaming proactivo |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | según Qwen (no disponible aquí) | LLM multimodal base |
| Alternativas de vídeo-LLM | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: uso exclusivamente no comercial y de investigación; no se permite uso comercial sin autorización.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No se detallan sesgos conocidos ni tasas de alucinación; al ser un modelo derivado de Qwen3.5-9B, hereda los sesgos del modelo base, no cuantificados aquí.
- La licencia no cubre derechos sobre datasets de terceros ni sobre el material multimedia subyacente.
- El checkpoint está en FP8 con compressed-tensors, lo que puede limitar la compatibilidad con herramientas de inferencia que no soporten ese formato.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con streams largos.
- Solo 280 descargas y 17 likes en el momento de la consulta: ecosistema reducido y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/aurateam/AURA_2_BF8
- Página del proyecto: https://aurateam2026.github.io/Aura-2.0/
- Repositorio GitHub: https://github.com/aurateam2026/Aura2.0
- Informe técnico (arXiv): https://arxiv.org/abs/2611.17048
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
