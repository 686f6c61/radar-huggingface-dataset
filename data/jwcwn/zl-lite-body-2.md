# jwcwn/zl-lite-body-2

## Resumen

hs-decide-1-flash es un modelo de decisión de 0,8B parámetros desarrollado por Hindsight AI (vectorize-io) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: recibe un estado (por ejemplo, una consulta y un conjunto de documentos) junto con una o varias preguntas tipadas sobre ese estado, y devuelve en un único forward pass una distribución de probabilidad sobre las opciones de respuesta de cada pregunta, sin generar texto. Está pensado como componente de decisión dentro de Hindsight, un sistema de memoria para agentes.

El modelo cubre tres tipos de pregunta: `choice` (elegir entre 2 y 255 opciones), `score` (puntuar en 2 a 10 niveles ordenados) y `noul` (sí/no). Admite múltiples preguntas sobre un mismo estado en una sola pasada y está entrenado para peticiones de hasta 65.536 tokens, lo que lo hace apto para contextos de memoria de agente con muchos documentos. Es multilingüe en ocho idiomas y se distribuye con licencia Apache 2.0.

Su relevancia práctica está en sustituir llamadas generativas costosas por una clasificación probabilística determinista y barata en el contexto de pipelines de recuperación y memoria de agentes: reranking de documentos, resolución de contradicciones entre fuentes y evaluación de relevancia, todo con un modelo de menos de mil millones de parámetros que cabe en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen3.5-0.8B, tag `qwen3_5_text`) |
| Parámetros totales | 852.985.920 (0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens por petición (entrenado) |
| Tipos de cuantización | no disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder de 0,8B parámetros, y se ha afinado como cabecera de decisión: en lugar de decodificar tokens, produce probabilidades sobre opciones tipadas (`choice`, `score`, `noul`) en una sola pasada hacia delante. La salida incluye, para cada pregunta, la opción elegida, su confianza y la distribución completa de probabilidades; en el caso de `score`, además, la leyenda de niveles y la puntuación esperada.

El entrenamiento se realizó sobre peticiones de hasta 65.536 tokens, lo que condiciona el diseño hacia estados largos con múltiples documentos y preguntas simultáneas. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información figura como no disponible. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. El despliegue en producción se realiza mediante un plugin de vLLM incluido en la carpeta `serving/` del repositorio, que añade el endpoint `POST /v1/systemone`.

## Capacidades

- Clasificación probabilística tipada: `choice` (2 a 255 opciones), `score` (2 a 10 niveles ordenados) y `noul` (sí/no).
- Respuesta a múltiples preguntas sobre un mismo estado en un único forward pass.
- Salida con probabilidades por opción y nivel de confianza, sin generación de texto.
- Reranking de documentos y evaluación de relevancia respecto a una consulta.
- Detección de contradicciones y resolución de información desactualizada entre fuentes.
- Soporte multilingüe en inglés, español, francés, alemán, portugués, japonés, coreano y chino.
- Integración nativa con Hindsight como modelo de decisión configurable por variables de entorno.
- Servido mediante plugin de vLLM con endpoint dedicado (`/v1/systemone`).
- No soporta tool calling ni function calling en el sentido generativo habitual; su interfaz es la API de preguntas tipadas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reranking en pipelines RAG: dado un estado con consulta y documentos candidatos, el modelo puntúa cada documento con el tipo `score` según su utilidad para responder, permitiendo reordenar los resultados de recuperación antes de pasarlos a un modelo generativo.
- Resolución de contradicciones en memoria de agente: con preguntas `choice` sobre qué documento contiene la versión más reciente de un dato y `noul` para detectar si un valor cambió, el sistema puede decidir qué recuerdo conservar.
- Enrutamiento de consultas: usar `choice` para clasificar la intención de una consulta entre un conjunto acotado de categorías o agentes especializados, con la distribución de probabilidades como señal de confianza para derivar a revisión humana.
- Filtrado de memoria a largo plazo: aplicar preguntas `noul` del tipo "¿este recuerdo sigue siendo relevante para el usuario?" sobre lotes de documentos en un solo pase, aprovechando el contexto de 65.536 tokens.
- Moderación y etiquetado ligero: clasificación de contenido en categorías predefinidas mediante `choice` con probabilidades calibradas, útil cuando se necesita trazabilidad de la decisión y no texto libre.
- Evaluación automática de respuestas: puntuar con `score` la calidad o completitud de una respuesta candidata frente a una consulta, como métrica barata en pipelines de evaluación continua.
- Anonimización o extracción de campos: preguntas `noul` y `choice` sobre documentos para decidir presencia de entidades sensibles o categorías documentales en flujos de preprocesado.

## Benchmarks y rendimiento

La model card incluye dos gráficas de evaluación (`assets/in-hindsight.png` y `assets/benchmarks.png`) que comparan el modelo dentro de Hindsight y frente a otros modelos de decisión de 0,8B, pero los valores numéricos no están disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,7 GB para los pesos (tamaño del repositorio), más overhead de activaciones y caché KV para contextos largos; con 65.536 tokens de contexto la caché KV puede dominar el consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para contextos moderados; A100, H100 o L40S para despliegues con contexto máximo y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que se ajuste la longitud de contexto y el número de peticiones concurrentes.
- Opciones de despliegue: vLLM 0.32.0 con el plugin de la carpeta `serving/` (endpoint `/v1/systemone`); también es cargable con transformers al ser un modelo safetensors estándar, aunque la API de preguntas tipadas requiere el plugin.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (0,8B) y el diseño de una sola pasada sin generación autoregresiva, se espera una latencia muy inferior a la de modelos generativos equivalentes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hs-decide-1-flash | 0,8B | 65.536 | Modelo de decisión (choice/score/noul) | Apache 2.0 | Hugging Face + Hindsight Inference |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generativo | no disponible | Hugging Face |
| Otros modelos de decisión de 0,8B | no disponible | no disponible | Decisión | no disponible | no disponible |

La model card menciona una comparación frente a "otros modelos de decisión de 0,8B" en `assets/benchmarks.png`, pero no se detallan nombres ni cifras. No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural necesita un modelo generativo adicional.
- Entrenado para un máximo de 65.536 tokens por petición; las peticiones que lo superan devuelven error 400 con `error_type: max_tokens_exceeded`.
- El número de opciones está acotado: 2 a 255 para `choice` y 2 a 10 niveles para `score`.
- No se documentan sesgos conocidos ni evaluaciones de robustez por idioma; el rendimiento puede variar entre los ocho idiomas soportados.
- Riesgo de calibración imperfecta en las probabilidades: la confianza devuelta debe validarse en el dominio de despliegue antes de usarse como umbral automático.
- La información de entrenamiento (datos, volumen, alineación) no está publicada, lo que limita la auditoría del modelo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- El ecosistema de serving está ligado a una versión concreta de vLLM (0.32.0) y a un plugin propio; la integración con otros servidores no está documentada.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/jwcwn/zl-lite-body-2
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
- Endpoint de inferencia Hindsight: https://inference.hindsight.vectorize.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
