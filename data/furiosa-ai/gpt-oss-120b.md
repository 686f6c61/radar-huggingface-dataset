# furiosa-ai/gpt-oss-120b

## Resumen

furiosa-ai/gpt-oss-120b es un paquete de despliegue del modelo open-weight openai/gpt-oss-120b, publicado por FuriosaAI para ejecutar el modelo sobre su acelerador RNGD mediante la librería Furiosa-LLM. No se trata de un modelo nuevo ni de un fine-tune: el repositorio contiene los pesos del modelo original de OpenAI junto con un Furiosa Executable Bundle (FXB) precompilado que permite servirlo en hardware RNGD sin pasar por una cadena de compilación propia.

El modelo subyacente es un transformer autorregresivo de arquitectura Mixture-of-Experts (MoE) con 116.829.156.672 parámetros totales, orientado a razonamiento de alta profundidad y a uso general en producción. Emite las respuestas en el formato harmony de OpenAI, que separa la cadena de pensamiento de la respuesta final, y ofrece soporte nativo de tool calling y de esfuerzo de razonamiento configurable por petición.

Su relevancia es doble: por un lado, demuestra que un MoE de ~117B parámetros puede servirse en aceleradores no-GPU con licencia Apache 2.0; por otro, estandariza la integración con el ecosistema OpenAI-compatible (API de Chat Completions, campo `reasoning`, parsers de tool calling), lo que reduce el trabajo de portabilidad para equipos que ya consumen APIs de OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-OSS (transformer autorregresivo Mixture-of-Experts) |
| Parámetros totales | 116.829.156.672 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 en los pesos de los expertos MoE; atención, router y embeddings en mayor precisión; tag de repositorio 8-bit |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |
| Librería | furiosa-llm |
| Hardware soportado | FuriosaAI RNGD |
| Estrategia de paralelismo | tensor-parallel de 32 PEs (4 tarjetas RNGD, 8 PEs por tarjeta) |
| Tamaño del repositorio | 240,9 GB |
| Modelo base | openai/gpt-oss-120b |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo con capas Mixture-of-Experts, denominada GPT-OSS por OpenAI. Los pesos de los expertos MoE se distribuyen cuantizados en MXFP4, el mismo formato en el que el modelo se publica upstream, mientras que atención, router y embeddings se mantienen en precisión superior. Esta mezcla reduce el peso en memoria sin degradar los componentes sensibles a la precisión numérica. El modelo emite las respuestas en el formato harmony, que estructura la salida en canales separados para el razonamiento y la respuesta final.

No se dispone, en la información proporcionada, de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card de este repositorio es una ficha de despliegue y remite a la model card upstream de openai/gpt-oss-120b para esos detalles. La innovación técnica destacable en este paquete es la integración del parser de harmony en Furiosa-LLM: el motor detecta automáticamente el formato y extrae el razonamiento sin necesidad de flags adicionales.

## Capacidades

- Generación de texto y razonamiento explícito: produce primero una cadena de pensamiento y después la respuesta final, en canales separados del formato harmony.
- Control del esfuerzo de razonamiento por petición mediante `reasoning_effort` con valores `"low"`, `"medium"` y `"high"`.
- Tool calling / function calling nativo, expuesto a través del parser `openai` del servidor Furiosa-LLM, con opciones `tool_choice` de tipo `"auto"`, `"required"`, `"none"` o función concreta.
- Compatibilidad con la API de Chat Completions de OpenAI, incluyendo streaming.
- Separación del razonamiento en la respuesta: campo `message.reasoning` en modo no streaming y `delta.reasoning` en streaming.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- No se documentan en la información disponible capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Razonamiento de alta profundidad en producción: el modelo permite fijar `reasoning_effort` a `"high"` para tareas de análisis complejo y bajarlo a `"low"` en consultas simples, ajustando el coste computacional por petición sobre las cuatro tarjetas RNGD.
- Agentes con tool calling: con `--enable-auto-tool-choice --tool-call-parser openai`, el modelo puede decidir cuándo invocar una función, lo que lo hace adecuado para orquestadores que encadenan llamadas a APIs externas, bases de datos o servicios internos.
- Asistentes conversacionales con trazas auditables: al devolver el razonamiento en un campo separado, es posible registrar la cadena de pensamiento para auditoría o depuración sin mezclarla con la respuesta entregada al usuario final.
- Migración de cargas OpenAI a infraestructura propia: al exponer una API compatible con Chat Completions y el mismo campo `reasoning` que recomienda OpenAI, los clientes existentes pueden apuntar a `http://localhost:8000/v1` cambiando únicamente la URL base.
- Despliegue en aceleradores no-GPU: el FXB precompilado evita recompilar el modelo para RNGD, lo que simplifica la puesta en marcha en clústeres con aceleradores FuriosaAI frente a una integración manual con vLLM o SGLang.
- Prototipado e investigación sobre razonamiento: la posibilidad de alternar el esfuerzo de razonamiento por petición facilita experimentos comparativos sobre la calidad de la cadena de pensamiento sin cambiar de modelo ni de infraestructura.
- Sustitución de modelos propietarios en pipelines internos en inglés: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que la carga de trabajo esté en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria de acelerador: no disponible de forma explícita. El repositorio ocupa 240,9 GB y los expertos MoE están en MXFP4, con atención, router y embeddings en mayor precisión.
- Hardware de referencia: FuriosaAI RNGD, con un tamaño de tensor-parallel de 32 PEs que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta).
- GPU consumer: no disponible. La model card no documenta ejecución en GPU para este paquete; para vLLM, SGLang o Transformers remite a la model card upstream de openai/gpt-oss-120b.
- Opciones de despliegue: `furiosa-llm serve furiosa-ai/gpt-oss-120b` sobre RNGD. Para otros frameworks (vLLM, SGLang, Transformers) debe consultarse el repositorio upstream.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Hardware de referencia | Formato |
|---|---|---|---|---|---|
| furiosa-ai/gpt-oss-120b | 116.829.156.672 | no disponible | apache-2.0 | FuriosaAI RNGD (4 tarjetas) | safetensors + FXB |
| openai/gpt-oss-120b | no disponible en esta ficha | no disponible | apache-2.0 | GPU (vLLM, SGLang, Transformers) | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo upstream openai/gpt-oss-120b: comparten pesos y licencia, pero difieren en el destino de despliegue. El paquete de FuriosaAI añade el FXB y la integración con Furiosa-LLM; el upstream está pensado para GPU y frameworks convencionales.

## Limitaciones y advertencias

- El repositorio está atado a hardware FuriosaAI RNGD: el FXB no es portable a GPU ni a otros aceleradores. Para esos entornos debe usarse el modelo upstream.
- El soporte de idiomas declarado es únicamente inglés; no se garantiza calidad en castellano ni en otros idiomas.
- No se documentan en esta ficha la longitud de contexto ni los parámetros activos del MoE; deben consultarse en la model card upstream antes de dimensionar cargas de trabajo.
- Riesgo de alucinación inherente a los modelos de razonamiento: la cadena de pensamiento puede contener afirmaciones plausibles pero incorrectas, por lo que conviene validar las salidas en flujos críticos.
- Sesgos conocidos: no documentados en la información disponible; deben evaluarse sobre el modelo upstream.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI y solo aparece en respuestas que contienen razonamiento; acceder a él en otros casos lanza `AttributeError`, lo que exige manejo defensivo en el código cliente.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento de las condiciones del modelo upstream recae en el integrador.
- El repositorio registra 0 likes y 1449 descargas en el momento de la consulta, lo que sugiere una adopción todavía limitada y menos validación comunitaria que el upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/gpt-oss-120b
- Modelo base upstream: https://huggingface.co/openai/gpt-oss-120b
- Licencia del modelo upstream: https://huggingface.co/openai/gpt-oss-120b/blob/main/LICENSE
- Formato harmony: https://github.com/openai/harmony
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Opciones de tool choice: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html#tool-choice-options
- Verificación de implementaciones de gpt-oss (OpenAI Cookbook): https://developers.openai.com/cookbook/articles/gpt-oss/verifying-implementations#chat-completions
- Sitio de FuriosaAI: https://furiosa.ai
