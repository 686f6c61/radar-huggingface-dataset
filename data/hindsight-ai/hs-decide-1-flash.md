# hindsight-ai/hs-decide-1-flash

## Resumen

hs-decide-1-flash es un modelo de decisión de 0,8B parámetros desarrollado por hindsight-ai, derivado mediante fine-tuning del modelo base Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: recibe un estado (texto, documentos, contexto) junto con una o varias preguntas tipadas sobre ese estado y devuelve, en una única pasada forward, una probabilidad para cada opción de respuesta, sin generar texto. Está diseñado específicamente para integrarse en Hindsight, el sistema de memoria para agentes publicado por vectorize-io.

El modelo cubre tres tipos de pregunta: `choice` (elegir una entre 2 y 255 opciones), `score` (puntuar en 2 a 10 niveles ordenados) y `noul` (sí o no). Todas las preguntas sobre un mismo estado se responden en la misma pasada, lo que reduce la latencia frente a encadenar llamadas a un modelo generativo. Está entrenado para peticiones de hasta 65.536 tokens y soporta ocho idiomas: inglés, español, francés, alemán, portugués, japonés, coreano y chino.

Su relevancia actual reside en que sustituye tareas de enrutamiento, clasificación y reranking dentro de pipelines de agentes por un modelo pequeño y determinista en su interfaz (probabilidades explícitas más un valor de confianza), desplegable en GPU con vLLM, en Mac con Apple silicon mediante MLX o en CPU con Transformers. La licencia Apache 2.0 y el tamaño reducido lo hacen apto para producción sin costes de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen3.5-0.8B), adaptado a decisión con cabeza de probabilidades por opción |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens por petición (entrenado) |
| Tipos de cuantizacion | bfloat16 (precisión del checkpoint); MLX con capas lineales a 8 bits; cuantizaciones GGUF no documentadas |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder de 0,75B parámetros, y se afina para una tarea de decisión: dado un estado y un conjunto de preguntas tipadas, produce una distribución de probabilidad sobre las opciones de cada pregunta en una sola pasada forward, con cero tokens de salida generados. La interfaz expone tres tipos de pregunta (`choice`, `score`, `noul`) y devuelve, para cada una, la opción elegida, las probabilidades de todas las opciones y una confianza.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí indica que el entrenamiento cubre peticiones de hasta 65.536 tokens y que el modelo es multilingüe en los ocho idiomas listados. La innovación principal es de interfaz más que de arquitectura: la respuesta es probabilística y estructurada, lo que permite umbralizar decisiones y agregar varias preguntas en una sola llamada, algo que un modelo generativo requeriría resolver con múltiples generaciones y parseo posterior.

## Capacidades

- Decisión tipada: preguntas `choice` (2 a 255 opciones), `score` (2 a 10 niveles ordenados) y `noul` (sí/no).
- Salida probabilística: probabilidad por cada opción más un valor de confianza, sin texto generado.
- Múltiples preguntas por petición: todas las preguntas sobre un mismo estado se responden en la misma pasada forward.
- Contexto largo: peticiones de hasta 65.536 tokens.
- Multilingüe: inglés, español, francés, alemán, portugués, japonés, coreano y chino.
- Reranking y selección de documentos: evaluación de la relevancia de documentos respecto a una consulta.
- Integración como memoria de agente: pensado para el sistema Hindsight (github.com/vectorize-io/hindsight).
- Despliegue en vLLM (endpoint `POST /v1/systemone`), MLX en Apple silicon y Transformers en CPU o GPU.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su función es exclusivamente de clasificación, puntuación y decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada ticket entrante en categorías (facturación, técnico, cuenta) mediante preguntas `choice` sobre el texto del ticket, con la confianza como señal para derivar a revisión humana los casos dudosos.
- Reranking de documentos recuperados: puntuar con preguntas `score` la relevancia de cada documento respecto a la consulta del usuario, usando las probabilidades por nivel para ordenar los resultados antes de pasarlos a un modelo generativo.
- Memoria de agentes: decidir qué recuerdos recuperados son relevantes para la consulta actual y cuáles deben descartarse, integrándose en Hindsight mediante el endpoint `/v1/systemone`.
- Detección de duplicados o contradicciones: preguntas `noul` para determinar si dos documentos tratan el mismo tema o si una fecha ha cambiado, como en el ejemplo de la model card sobre el offsite movido de abril 10 a abril 17.
- Filtrado previo en pipelines RAG: evaluar en una sola pasada si cada fragmento recuperado ayuda a responder la consulta, reduciendo el contexto enviado al modelo generativo y el coste por consulta.
- Moderación y control de calidad: preguntas `noul` o `score` para verificar si una respuesta cumple criterios definidos (tono, completitud, idioma) antes de publicarla.
- Clasificación multilingüe: aplicar el mismo conjunto de preguntas a contenido en español, inglés, francés, alemán, portugués, japonés, coreano o chino sin cambiar de modelo.

## Benchmarks y rendimiento

La model card incluye dos gráficas de evaluación (`assets/in-hindsight.png` y `assets/benchmarks.png`) que comparan el modelo dentro de Hindsight y frente a otros modelos de decisión de 0,8B, pero no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el checkpoint de 0,75B parámetros ocupa aproximadamente 1,5 GB de pesos; con overhead de activaciones y caché KV para contextos largos, el consumo puede crecer de forma notable con peticiones cercanas a 65.536 tokens.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM para contextos cortos; para contextos largos conviene una GPU de mayor memoria (A100, H100 o similares) o limitar `--max-request-tokens`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 4090 o inferiores, siempre que el contexto se mantenga moderado.
- Opciones de despliegue: vLLM (plugin en `serving/`, `hindsight-decision-serve`), MLX en Apple silicon (`hindsight-decision-serve-mlx`, con opción `--bits 8`) y Transformers en CPU o GPU (`hindsight-decision-serve-transformers`). Requiere Python 3.12 o superior; MLX requiere macOS 14 o superior en Apple silicon con Python arm64 nativo.
- Latencia y throughput: no disponible. Los servidores de Transformers y MLX responden una petición a la vez; en vLLM no se especifica el batching. La model card recomienda bajar `--max-request-tokens` si las peticiones de Hindsight expiran.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hs-decide-1-flash | 0,75B | 65.536 tokens | Decisión tipada con probabilidades | Apache 2.0 | Hugging Face, vLLM, MLX, Transformers |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto | no disponible | Hugging Face |
| Otros modelos de decisión de 0,8B | no disponible | no disponible | Decisión | no disponible | Comparados en la gráfica de benchmarks de la model card, sin valores numéricos publicados |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; solo responde preguntas tipadas sobre un estado dado.
- La model card no documenta sesgos conocidos ni la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos por idioma o dominio.
- Riesgo de calibración: la confianza devuelta debe validarse en el dominio de producción antes de usarla como umbral automático; la model card no publica métricas de calibración.
- Límite estricto de 65.536 tokens por petición; las peticiones más largas devuelven error 400 con `error_type: max_tokens_exceeded` y deben dividirse.
- Los servidores de Transformers y MLX atienden una petición a la vez, lo que limita el throughput; para cargas concurrentes es preferible vLLM.
- El soporte multilingüe se limita a los ocho idiomas listados; no se documenta el rendimiento en otros idiomas.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-0.8B antes de un despliegue comercial.
- Dependencia de la versión de vLLM indicada en la model card (0.32.0) para el plugin de servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Repositorio de Hindsight: https://github.com/vectorize-io/hindsight
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PyTorch (instalación): https://pytorch.org/get-started/locally/
