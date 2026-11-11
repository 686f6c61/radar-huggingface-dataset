# LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14

## Resumen

Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14 es una conversión de arquitectura, no un reentrenamiento, del modelo DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2. El autor, LTM-Lab, mantiene los pesos originales bit a bit y añade una capa de memoria episódica persistente implementada mediante código remoto (`configuration_qwen_dense_v14_reinstatement.py` y `modeling_qwen_dense_v14_reinstatement.py`) y una arquitectura declarada `Qwen3_5V14ForConditionalGeneration`. El modelo resuelve el problema de la memoria entre peticiones independientes: lo que se dijo en una conversación puede recuperarse en otra sesión posterior sin reinyectar texto en el prompt.

El modelo base es un Qwen3.5 dense de 39.958.026.224 parámetros (unos 40B) con 96 capas, combinación de capas Gated DeltaNet y capas de atención, y una cabeza MTP (multi-token prediction) para decodificación especulativa EAGLE. La conversión v14 hereda la arquitectura de la conversión de 27B del mismo linaje, ampliada de 64 a 96 capas. Los pesos están en bfloat16 y el repositorio ocupa 79,9 GB.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 40B con licencia Apache 2.0 y capacidades multimodales (pipeline image-text-to-text); por otro, describe un mecanismo de memoria episódica en disco que se aparta del patrón habitual de RAG y de ventanas de contexto largas, con implicaciones claras de privacidad y multi-tenencia que conviene evaluar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 dense (Gated DeltaNet + capas de atención), 96 capas; conversión declarada `Qwen3_5V14ForConditionalGeneration` |
| Parametros totales | 39.958.026.224 (≈40B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de servicio recomendada; longitud máxima nativa no disponible |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan GGUF, AWQ ni GPTQ en la información disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con `auto_map` y código remoto) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 96 capas que alterna capas de atención con capas Gated DeltaNet (un mecanismo de estado recurrente lineal), e incluye una cabeza MTP que sirve como draft para decodificación especulativa EAGLE. El checkpoint de origen incorpora ya esa cabeza. La conversión v14 no entrena, no fusiona ni cuantiza: los pesos son idénticos byte a byte a los del modelo base. Lo que se añade es el nombre de arquitectura, un `auto_map`, las opciones de memoria (`qwen_dense_v14_memory_config`) en `config.json` y dos ficheros de código que implementan el almacén de memoria.

El mecanismo de memoria funciona así: durante la lectura de un prompt, las claves y valores que calculan las capas de atención se fragmentan en eventos de hasta 128 tokens y se escriben en un almacén en disco, cada uno con un engram de bajo rango del estado que deja en las capas recurrentes. Ante un prompt nuevo, se lee una vez para determinar qué solicita; los eventos almacenados cuyas claves captarían su atención se recuperan mediante un voto único para todas las capas y cabezas; sus engrams se componen en el estado recurrente de la petición y el prompt se relee con las claves y valores recuperados fusionados en la atención. No se recupera texto ni se añade nada al prompt. Un prompt que no requiere nada del almacén no recupera nada y se responde como el modelo plano.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF o DPO). Los tags de la model card mencionan "Cold Fusion", "GAIN Training" y "Multi-stage tuning", pero sin detalle verificable en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con 27 modos de razonamiento y 27 modos instruct declarados por el autor.
- Generación de código y soporte de tool calling (parser `qwen3_coder` en la configuración de SGLang).
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`).
- Memoria episódica persistente entre peticiones independientes, con almacén en disco que sobrevive a reinicios del servidor.
- Escritura creativa, ficción, roleplay y narración en todos los géneros, según los tags del autor.
- Capacidades multilingües en 16 idiomas.
- 15 "AI Constructs" y 5 "Super AI Constructs" declarados (Brainstorm, Brainstorm Business, Universal Teacher, Agent, Coder), junto con "Turbo-Brilliance" y 9 modos de razonamiento "Xhigh"; se trata de etiquetas del autor sin especificación técnica publicada.
- Decodificación especulativa EAGLE con cabeza MTP integrada en el checkpoint.

## Casos de uso

- Asistentes conversacionales con memoria entre sesiones: el almacén episódico permite que un usuario retome una conversación días después y el modelo recupere eventos previos sin que el front-end reenvíe el historial completo. Adecuado cuando el contexto histórico excede la ventana de 65.536 tokens.
- Atención al cliente multi-turno: con `--max-running-requests 2` y contexto de 65.536 tokens, el modelo puede gestionar conversaciones largas; la memoria persistente evita repetir el contexto en cada turno. Requiere un servidor y un directorio `/memory` por tenant.
- Generación de código en pipelines: el soporte de tool calling con parser `qwen3_coder` y el modo coder permiten integrarlo en flujos de CI/CD para generación de parches, revisión de diffs o generación de tests, siempre que el pipeline gestione el almacén de memoria de forma aislada.
- Agentes multi-paso: la combinación de tool calling, razonamiento en modo thinking y memoria persistente facilita agentes que acumulan observaciones entre ejecuciones. La limitación de dos peticiones concurrentes obliga a serializar la carga.
- Análisis de documentos e imágenes: el pipeline image-text-to-text permite extraer información de capturas, diagramas o documentos escaneados y mantener los resultados en memoria para consultas posteriores.
- Escritura creativa y roleplay de larga duración: la memoria episódica mantiene coherencia de personajes y tramas a lo largo de sesiones separadas, algo que las ventanas de contexto finitas no cubren sin reinyección.
- Investigación sobre memoria en LLM: el código de recuperación por votación y composición de engrams es un artefacto reproducible para estudiar recuperación de KV sin texto intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput medidas; solo menciona que los argumentos de servicio están ajustados a una GPU de 96 GB a partir de la experiencia con el modelo de 27B y que no fueron ejecutados.

## Requisitos de hardware

- VRAM: los pesos en bfloat16 ocupan 75 GB; el repositorio completo son 79,9 GB. Se necesita una GPU de 96 GB para servir con `--mem-fraction-static 0.92`.
- GPU recomendadas: una única GPU de 96 GB (por ejemplo, H100 80GB no es suficiente; se requiere H100 NVL 94GB, H200 o similar). La model card indica explícitamente "one 96 GB GPU".
- Consumer GPU: no cabe en ninguna GPU de consumo actual en bfloat16. No se documentan cuantizaciones que permitan reducir el requisito.
- Despliegue: SGLang mediante la imagen Docker `lovewin10/sglang-v14:nightly-dev-cu13-20260924-ffac53d7-v14`, con `--attention-backend flashinfer` (o `fa3`), `--linear-attn-backend triton`, `--mamba-ssm-dtype float32` y TP, PP y DP attention de 1. También es usable con transformers mediante código remoto.
- Configuración de servicio recomendada: contexto de 65.536 tokens, `--max-prefill-tokens 16384`, `--max-running-requests 2`, `--kv-cache-dtype fp8_e4m3`, `--max-mamba-cache-size 8`, decodificación especulativa EAGLE con 3 pasos y 4 tokens draft.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria entre peticiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14 | ≈40B | 65.536 (config. de servicio) | Sí, almacén en disco con engrams | Apache 2.0 | Hugging Face, requiere SGLang modificado |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2 (modelo base) | ≈40B | no disponible | No | Apache 2.0 (heredada) | Hugging Face |
| Conversión v14 del mismo linaje en 27B | ≈27B | no disponible | Sí | Apache 2.0 | Hugging Face |
| Otros modelos densos de ~40B con contexto largo | no disponible | no disponible | No (requieren reinyección de contexto) | variable | variable |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- El almacén `/memory` contiene los token ids y las claves y valores de atención de cada prompt leído: debe tratarse como registro de conversaciones y borrarse para olvidar. No hay separación entre usuarios; se necesita un servidor con su propio `/memory` por tenant.
- El texto generado no se escribe en memoria; una respuesta solo se convierte en memoria cuando un prompt posterior la transporta, como hacen los front-ends de chat al reenviar la conversación.
- La memoria exige `--attention-backend flashinfer` o `fa3`, y TP, PP y DP attention de 1; no escala con paralelismo de tensor.
- La configuración de servicio recomendada no fue ejecutada por el autor; los valores son estimaciones derivadas del modelo de 27B.
- El modelo está etiquetado como "uncensored" y "abliterated": cabe esperar una reducción de los rechazos ante contenido sensible y un mayor riesgo de generar material inapropiado o dañino. Requiere filtrado y moderación en producción.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Las etiquetas "27 reasoning modes", "15 AI Constructs" y similares carecen de especificación técnica publicada; no deben tratarse como garantías de comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue depende de una imagen Docker de terceros (`lovewin10/sglang-v14`) cuyo mantenimiento y auditoría no están documentados.
- El modelo depende de código remoto (`trust_remote_code`), lo que implica ejecutar código del autor en el proceso de inferencia.
- Longitud máxima de contexto nativa del modelo base no documentada; la cifra de 65.536 corresponde a la configuración de servicio, no a un límite arquitectónico confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2-v14
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2
- Imagen Docker de SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v14
- Imagen SGLang original: `lmsysorg/sglang:nightly-dev-cu13-20260924-ffac53d7`
- Datasets referenciados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
