# LlamaPal/Anubis-Mini-8B-Q4_K_M-GGUF

## Resumen

Anubis-Mini-8B-Q4_K_M-GGUF es una cuantización GGUF en formato Q4_K_M del modelo Anubis Mini 8B v1, desarrollado originalmente por TheDrummer y cuantizado por bartowski. El repositorio de LlamaPal que nos ocupa no es un desarrollo propio: se trata de un espejo (mirror) sin modificaciones del fichero original, con el mismo hash SHA-256, creado para ofrecer una descarga estable. El modelo base cuenta con 8.030.269.504 parámetros y está construido sobre la arquitectura Llama, según se deduce de la licencia Llama 3.3 Community License que acompaña a los pesos.

El propósito del modelo es la generación de texto conversacional, tal como indican sus etiquetas (`conversational`, `text-generation`). Al ser una cuantización Q4_K_M, el fichero ocupa 5,1 GB, lo que lo hace desplegable en GPUs de consumo con 8 GB de VRAM o más, a costa de una pérdida de precisión respecto a los pesos originales en FP16/BF16. No se dispone de información sobre el proceso de entrenamiento, la composición del dataset ni los idiomas soportados más allá de lo que figura en la model card del repositorio original.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes, no incluye model card técnica propia y remite íntegramente al repositorio de bartowski para cualquier detalle. Cualquier evaluación rigurosa debería hacerse sobre el modelo original de TheDrummer, no sobre este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (inferido de la licencia Llama 3.3; no confirmado en la model card) |
| Parametros totales | 8.030.269.504 |
| Parametros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras cuantizaciones en el repo original de bartowski |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | GGUF (`Anubis-Mini-8B-Q4_K_M.gguf`, 5,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que se puede inferir de la licencia (Llama 3.3 Community License) y del tamaño de parámetros (8B). La model card de este repositorio no describe la arquitectura, el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

El único dato técnico verificable es el proceso de cuantización: Q4_K_M, una cuantización de 4 bits con escalas por bloque que preserva las capas de atención y las matrices de embedding con mayor precisión relativa. El autor del espejo indica que el fichero es una copia byte a byte del generado por bartowski en el commit `76a925444244`, con hash SHA-256 `411c017e9c39b97ecf8373e34d348bb4bcbc4ef3aa761cb109bf5af0d1ef444c`. Cualquier detalle sobre el entrenamiento debe consultarse en el repositorio original de TheDrummer o en el de bartowski.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo multi-turno, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Generación de texto general: pipeline `text-generation` declarado en la model card.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el fichero puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Cuantización con imatrix: el tag `imatrix` sugiere que la cuantización se generó usando una matriz de importancia, lo que típicamente mejora la calidad respecto a cuantizaciones estándar del mismo bit-width.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: el fichero Q4_K_M de 5,1 GB cabe en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) usando llama.cpp u Ollama, lo que permite prototipar un asistente conversacional sin depender de la nube.
- Prototipado de chatbots de dominio cerrado: al ser un modelo de 8B ajustado para conversación, puede emplearse para validar flujos de diálogo antes de migrar a un modelo mayor o a una versión sin cuantizar.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre Q4_K_M y los pesos originales en una tarea concreta, dado que el hash permite verificar que los bytes coinciden con la referencia de bartowski.
- Inferencia en CPU con llama.cpp: el formato GGUF y el tamaño de 5,1 GB permiten ejecución en CPU con RAM suficiente (16 GB o más), útil para entornos sin GPU dedicada.
- Servicio de generación de texto en endpoints compatibles: el tag `endpoints_compatible` facilita su integración en infraestructura de serving que consuma la API estándar de Hugging Face.
- Reproducibilidad de experimentos: al ser un espejo con hash documentado, sirve como artefacto de referencia para pipelines que necesiten una descarga estable del mismo fichero binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con Q4_K_M, incluyendo overhead de contexto y caché KV (estimación a partir del tamaño del fichero de 5,1 GB; no confirmada por el autor).
- GPU recomendadas: RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 para despliegue en consumer; A100, H100 o L40S para serving de alta concurrencia.
- ¿Cabe en consumer GPU? Sí, en GPUs con 8 GB de VRAM o más, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, vLLM con soporte GGUF o TGI en configuraciones específicas); el tag `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, y no se dispone de benchmarks del modelo base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un espejo, no un desarrollo propio: el repositorio de LlamaPal no aporta model card técnica, ni documentación de entrenamiento, ni garantías de mantenimiento. Cualquier decisión de producción debe basarse en el repositorio original de TheDrummer o en el de bartowski.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Idiomas no documentados: se desconoce si el modelo está ajustado para castellano o si su rendimiento en español es aceptable.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- Cuantización Q4_K_M: introduce pérdida de precisión respecto a los pesos originales; para tareas sensibles a la calidad (código, matemáticas, razonamiento formal) conviene evaluar cuantizaciones superiores (Q5_K_M, Q6_K, Q8_0) o los pesos sin cuantizar.
- Licencia Llama 3.3 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para el licenciatario y sus afiliados), obligación de incluir el aviso "Built with Llama" y de redistribuir la licencia y el NOTICE. Es imprescindible revisar el texto completo antes de un uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de 8B, es esperable en tareas de conocimiento factual.
- Sesgos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, etnia, idioma o dominio.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/LlamaPal/Anubis-Mini-8B-Q4_K_M-GGUF
- Repositorio original de la cuantización (bartowski): https://huggingface.co/bartowski/TheDrummer_Anubis-Mini-8B-v1-GGUF
- Commit de referencia del fichero original: https://huggingface.co/bartowski/TheDrummer_Anubis-Mini-8B-v1-GGUF/tree/76a9254442449dc3738784810e465c5f894bc33e
- Modelo base (TheDrummer): no disponible en la información proporcionada.
