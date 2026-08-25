# aisingapore/Gemma-SEA-Guard-12B-2602

## Resumen

Gemma-SEA-Guard-12B-2602 es un modelo de moderación de contenido desarrollado por el equipo AI Products Pillar de AI Singapore, dentro del proyecto SEA-LION (Southeast Asian Languages In One Network). Se trata de un ajuste fino de Gemma 3 12B IT, entrenado sobre un millón de pares de instrucción con el objetivo de clasificar interacciones entre humanos y asistentes de IA como "seguras" o "inseguras", atendiendo a las sensibilidades culturales de la región del Sudeste Asiático.

El modelo destaca por su doble capacidad de procesamiento de texto e imagen (image-text-to-text), lo que permite moderar tanto prompts de texto como imágenes en contextos de seguridad. Su ventana de contexto alcanza los 128 000 tokens, y cubre ocho idiomas: birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita. La licencia es Gemma, de Google, lo que facilita su uso comercial bajo los términos de esa licencia.

Su relevancia actual radica en que ofrece una alternativa a los clasificadores de seguridad genéricos (como Llama Guard o Aya Guard) adaptada específicamente a las normas culturales y lingüísticas de la región SEA, un área habitualmente poco representada en los datasets de moderación. El modelo se sirve a través de una API pública, aunque también está disponible para descarga directa en Hugging Face con soporte para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), decodificador autorregresivo |
| Parametros totales | no disponible (modelo base: 12 000 millones; el dato de safetensors indica 1 166 448, inconsistente con la arquitectura) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no disponible (se recomienda bfloat16 en la guía de uso) |
| Idiomas soportados | birmano, ingles, indonesio, malayo, titulo, tamil, tailandes y vietnamita |
| Licencia | Gemma (terminos de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión finetuneada de Gemma 3 12B IT, un transformer multimodal basado en el decodificador que combina un codificador de vision con un bloque de lenguaje. La arquitectura subyacente mantiene el tokenizer y la estructura de Gemma 3, con capacidad para procesar entradas de imagen junto con texto. El entrenamiento se realizó sobre un millón de pares de instrucciones de seguridad, diseñados específicamente para el contexto cultural del Sudeste Asiático. No se han publicado detalles sobre técnicas de alineación adicionales (como RLHF o DPO) más allá del finetune supervisado sobre los datos de SEA-Guard. El proceso de ajuste está descrito en el paper SEA-Guard (arxiv:2602.01618).

## Capacidades

- Clasificacion binaria de seguridad: devuelve exclusivamente "safe" o "unsafe" para cada interacción humano-asistente.
- Moderacion de texto: evalúa si un prompt de usuario es seguro o inseguro.
- Moderacion de respuesta: analiza la respuesta del asistente para detectar contenido inseguro, incluso si el prompt original era seguro.
- Moderacion de imagen-texto: acepta una imagen junto con el texto para clasificar solicitudes que incluyen contenido visual.
- Multilingue para SEA: cubre ocho idiomas de la región, incluyendo birmano, tamil y tagalo, además de ingles.
- Compatible con vLLM para inferencia rapida en produccion.
- Uso directo sin finetune adicional ni in-context learning, ya que el modelo ya está entrenado para la tarea de clasificación.

## Casos de uso

- Moderacion de contenido en plataformas sociales del Sudeste Asiático: el modelo puede evaluar en tiempo real los comentarios y publicaciones de los usuarios, devolviendo una etiqueta de seguridad binaria que permita a los sistemas automatizados decidir si bloquear, revisar o aceptar el contenido. Su conocimiento cultural local reduce los falsos positivos en expresiones idiomáticas propias de la región.
- Filtrado de respuestas generadas por asistentes IA: integrado en un pipeline de chatbot, puede clasificar la respuesta generada por el LLM antes de enviarla al usuario, evitando que se muestren respuestas inseguras o culturalmente inapropiadas.
- Moderacion de imagenes en aplicaciones de citas o redes sociales: al aceptar tanto texto como imagen, puede evaluar si una solicitud que incluye una imagen (por ejemplo, "crea un blog criticando esta foto") es segura o no, protegiendo a los usuarios de contenido ofensivo.
- Evaluacion de sistemas de moderación en entornos de investigación: los investigadores pueden usar el modelo como referencia o como componente de un conjunto de clasificadores para comparar la calidad de sus propios sistemas de moderación en idiomas del SEA.
- Auditoria de cumplimiento normativo en empresas de tecnologia: las empresas que operan en la region pueden desplegar el modelo para revisar interacciones registradas y generar informes de seguridad con una clasificacion binaria clara, facil de auditar.
- Filtrado de prompts para modelos de generacion de contenido: antes de enviar un prompt a un LLM generativo (por ejemplo, un generador de imagenes o de texto), el modelo puede clasificar la solicitud del usuario y bloquearla si es insegura, reduciendo la probabilidad de generar contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como un clasificador binario y no se proporcionan metricas de precision, recall o F1 en la model card ni en los resultados de busqueda web. Se recomienda consultar el paper SEA-Guard (arxiv:2602.01618) para futuras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar basado en Gemma 3 12B, se necesitan aproximadamente 24 GB de VRAM para inferencia en bfloat16. Con cuantizacion de 4 bits (no oficialmente documentada), podria reducirse a unos 8-10 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o GPUs con al menos 24 GB de VRAM para una inferencia comoda. Para despliegues mas ligeros, se puede intentar en RTX 3090 con cuantizacion.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) en bfloat16, aunque con memoria justa. Para GPUs de 16 GB (como RTX 4080) se requeriria cuantizacion.
- Opciones de despliegue: el modelo es compatible con vLLM para inferencia rapida, y se puede cargar con transformers (Hugging Face) usando Gemma3ForConditionalGeneration. Tambien puede convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporciona documentacion oficial.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia, un modelo de 12B en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con vLLM, pero no se ha medido para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea principal |
|---|---|---|---|---|---|
| Gemma-SEA-Guard-12B-2602 | 12B | 128k | 8 idiomas (SEA) | Gemma | Clasificacion binaria de seguridad |
| Llama Guard 3 (Meta) | 8B | 128k | Multilingue (incluye ingles, espanol, etc.) | Llama 3 Community License | Clasificacion de seguridad (texto) |
| Aya Guard (Cohere) | 8B | 8k | Multilingue (101 idiomas) | CC-BY-NC | Clasificacion de seguridad (texto) |

La comparativa es orientativa; no se dispone de datos de rendimiento comparativo entre estos modelos en los documentos consultados. Gemma-SEA-Guard se diferencia por su enfoque multimodal (texto + imagen) y por su especializacion en idiomas del Sudeste Asiatico, que no estan bien cubiertos en los otros dos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos de Gemma 3 12B IT y del dataset de entrenamiento de SEA-Guard, que puede no ser representativo de todas las culturas dentro de la region SEA. La clasificacion binaria puede simplificar en exceso situaciones complejas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no fundamentadas o irrelevantes, aunque su salida esta limitada a "safe" o "unsafe". Se recomienda supervision humana.
- Limitaciones de contexto: aunque el contexto es de 128k tokens, el modelo se ha entrenado para clasificar interacciones cortas (prompt y respuesta); no esta optimizado para analizar largas conversaciones.
- Restricciones de licencia: la licencia Gemma permite uso comercial, pero hay que cumplir con los terminos de Google (prohibicion de uso para actividades maliciosas, restricciones de transferencia de pesos, etc.).
- Caveat de produccion: el modelo es un clasificador binario; no proporciona explicaciones ni niveles de severidad. Para decisiones criticas (por ejemplo, moderacion de contenido en plataformas grandes) se recomienda combinarlo con un sistema de revision humana y otros clasificadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-Guard-12B-2602
- Coleccion SEA-Guard: https://huggingface.co/collections/aisingapore/sea-guard
- Paper SEA-Guard: https://arxiv.org/abs/2602.01618
- Paper de referencia (Gemma 3): https://arxiv.org/abs/2512.05501
- Documentacion SEA-LION: https://docs.sea-lion.ai/models/sea-guard/gemma-sea-guard
- Repositorio SEA-LION: https://github.com/aisingapore/sealion
- API y playground: https://playground.sea-lion.ai/sea-guard
