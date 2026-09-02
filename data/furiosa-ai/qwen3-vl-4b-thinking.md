# furiosa-ai/Qwen3-VL-4B-Thinking

## Resumen

Qwen3-VL-4B-Thinking es un modelo denso de visión y lenguaje de 4.437 millones de parámetros, desarrollado por FuriosaAI como un bundle ejecutable (Furiosa Executable Bundle, FXB) del modelo base Qwen/Qwen3-VL-4B-Thinking de Alibaba. Está diseñado para ejecutarse exclusivamente en el hardware acelerador FuriosaAI RNGD mediante el motor de inferencia Furiosa-LLM, y se distribuye bajo licencia Apache 2.0. Su propósito es ofrecer capacidades multimodales (imagen, vídeo y texto) con razonamiento explícito tipo cadena de pensamiento, en un formato optimizado para despliegue en infraestructura de FuriosaAI.

El modelo combina un encoder de visión con un decoder transformer denso, empleando embeddings posicionales Interleaved-MRoPE y fusión de características multinivel DeepStack. Soporta tareas como OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, además de tool calling nativo. La edición Thinking emite una cadena de pensamiento explícita antes de la respuesta final, que Furiosa-LLM separa en un campo `reasoning` dentro de la API compatible con OpenAI. Esta versión no aplica cuantización: corre en la misma precisión que los pesos originales del modelo base.

La relevancia de esta publicación radica en que proporciona un despliegue listo para producción en hardware RNGD, con paralelismo tensorial de 8 PEs (una tarjeta), sin necesidad de compilar el modelo manualmente. Es una opción para desarrolladores que ya utilizan la infraestructura de FuriosaAI y necesitan un modelo multimodal de tamaño medio con capacidades de razonamiento y llamada a funciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (dense, encoder de visión + decoder transformer) |
| Parametros totales | 4.437.815.808 (4,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sin cuantizacion (precision original de los pesos upstream) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos originales) y FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL de la serie Qwen3, compuesta por un encoder de visión que procesa imágenes y vídeos, y un decoder transformer denso que genera texto. Utiliza embeddings posicionales Interleaved-MRoPE, que permiten intercalar posiciones de tokens de imagen y texto, y DeepStack, una técnica de fusión de características multinivel que mejora la comprensión de información visual compleja. Al ser la edición Thinking, el modelo está entrenado para producir una cadena de razonamiento explícita antes de la respuesta final, que el motor Furiosa-LLM extrae mediante el parser `qwen3`.

No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la documentación proporcionada. El modelo base Qwen/Qwen3-VL-4B-Thinking es el mismo que se publica en el Hub de Hugging Face, y esta versión de FuriosaAI añade únicamente el bundle ejecutable FXB y la integración con Furiosa-LLM. No se aplica cuantización, por lo que la precisión de los pesos es la misma que la del modelo original.

## Capacidades

- Comprensión de imágenes y vídeo junto con texto, aceptando mensajes multimodales en formato OpenAI (partes `image_url` y texto).
- Razonamiento explícito con cadena de pensamiento: el modelo emite un razonamiento interno que Furiosa-LLM separa en el campo `reasoning` de la respuesta, tanto en modo streaming como no streaming.
- Tool calling (llamada a funciones) mediante el parser `hermes`, compatible con la serie Qwen3.
- OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, según la descripción del modelo base.
- API compatible con OpenAI para integración sencilla con clientes existentes.
- Soporte de imágenes remotas (URL http/https), datos base64 inline y rutas locales `file://` (estas últimas requieren activación explícita mediante `--allowed-local-media-path`).

## Casos de uso

- Analisis de documentos escaneados: el modelo puede extraer texto e interpretar tablas y diagramas a partir de imágenes, lo que permite automatizar la digitalizacion de facturas, contratos o formularios en entornos que ya usan hardware RNGD.
- Atencion al cliente con capturas de pantalla: un agente conversacional puede recibir una imagen del problema del usuario (error en pantalla, configuracion) y generar una respuesta razonada, gracias a su capacidad de razonamiento explicito y tool calling para consultar bases de conocimiento.
- Generacion de codigo asistida por imagenes: el desarrollador puede adjuntar un diagrama o esquema de arquitectura y pedir al modelo que genere el codigo correspondiente, aprovechando el soporte de tool calling para integrarse en pipelines de CI/CD.
- Analisis de graficos y dashboards: el modelo interpreta graficos de barras, lineas o circulares a partir de una imagen y produce un resumen textual con los datos clave, util para informes automaticos.
- Moderacion de contenido visual: combinado con un sistema de colas, puede clasificar imagenes o frames de video segun criterios definidos, emitiendo una justificacion razonada de cada decision.
- Asistente educativo multimodal: un tutor virtual puede recibir una foto de un problema de matematicas o un esquema biologico y explicar el procedimiento paso a paso, aprovechando la cadena de pensamiento para mostrar el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de FuriosaAI no incluye metricas como MMLU, HumanEval, GSM8K o evaluaciones de tareas visuales para esta version especifica. Se recomienda consultar la model card del modelo base Qwen/Qwen3-VL-4B-Thinking para obtener datos de rendimiento del modelo original, aunque no se garantiza que los resultados sean identicos en el hardware RNGD.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con paralelismo tensorial de 8 PEs (una tarjeta RNGD completa).
- No es compatible con GPUs estandar (NVIDIA, AMD) en esta version; el bundle FXB esta compilado exclusivamente para RNGD.
- El modelo base Qwen/Qwen3-VL-4B-Thinking puede ejecutarse en otros frameworks (vLLM, SGLang, Transformers) en GPUs convencionales, pero esta publicacion concreta no incluye esos artefactos.
- No se especifica la VRAM necesaria en la documentacion; al no haber cuantizacion, se estima que requiere al menos 8-10 GB de memoria para los pesos en precision bf16, aunque el despliegue real depende del motor Furiosa-LLM.
- Despliegue mediante `furiosa-llm serve`, con flags para controlar limites de imagenes/videos por peticion, dominios remotos permitidos (proteccion SSRF) y rutas locales de medios.
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-4B-Thinking (este) | 4,4 B | No disponible | Apache 2.0 | FuriosaAI RNGD | Hub de Hugging Face |
| Qwen/Qwen3-VL-4B-Thinking (base) | 4,4 B | No disponible | Apache 2.0 | GPUs estandar (vLLM, SGLang, Transformers) | Hub de Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (no-thinking) | 4,4 B | No disponible | Apache 2.0 | GPUs estandar | Hub de Hugging Face |

La diferencia principal con el modelo base es el bundle FXB y la integracion con Furiosa-LLM; las capacidades del modelo son identicas. La version Instruct (no-thinking) no emite cadena de pensamiento, lo que puede resultar en menor latencia para tareas simples, pero pierde la capacidad de razonamiento explicito.

## Limitaciones y advertencias

- Requiere hardware especifico FuriosaAI RNGD; no es portable a GPUs convencionales sin recompilar el modelo con otros frameworks.
- No se aplica cuantizacion, por lo que el consumo de memoria y la latencia pueden ser superiores a los de versiones cuantizadas de otros modelos similares.
- Los idiomas soportados no estan documentados en la informacion proporcionada; se asume que hereda las capacidades multilingues del modelo base Qwen3-VL, pero no se puede confirmar.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento espacial o interpretacion de imagenes ambiguas; se recomienda validar las respuestas en entornos de produccion.
- El acceso a imagenes locales esta deshabilitado por defecto; es necesario configurar `--allowed-local-media-path` y `--allowed-media-domains` para evitar riesgos de seguridad (SSRF).
- El campo `reasoning` no forma parte de la especificacion OpenAI; los clientes que no lo manejen pueden ignorarlo, pero su ausencia en respuestas sin razonamiento puede provocar errores si se accede directamente.
- No se proporcionan datos de rendimiento ni benchmarks propios, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-4B-Thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Documentacion de FuriosaAI sobre Qwen3-VL: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-vl.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html
