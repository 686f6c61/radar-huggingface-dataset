# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14

## Resumen

LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14 es una conversión del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored a una arquitectura denominada V14 de memoria episódica (`Qwen3_5V14ForConditionalGeneration`). El autor, LTM-Lab, no entrena ni fusiona pesos: los pesos son idénticos bit a bit a los del modelo de origen. Lo que añade es una capa de código (dos ficheros de remote code) y opciones de configuración de memoria en `config.json` que permiten que el modelo recuerde información entre peticiones HTTP distintas servidas por un SGLang modificado.

El modelo base pertenece a la familia Qwen3 (etiquetado internamente como qwen3_5/qwen3_6/qwen3_8) con 27.781.427.952 parámetros reales según safetensors, pipeline image-text-to-text y licencia Apache 2.0. Está afinado para eliminar restricciones de contenido (uncensored) y para cubrir todo tipo de casos de uso, con un proceso de entrenamiento multi-etapa que el autor denomina Cold Fusion y GAIN Training.

Su relevancia actual es acotada pero específica: propone una forma de memoria persistente entre conversaciones que no pasa por RAG textual ni por inyección de contexto en el prompt, sino por almacenar claves y valores de atención en disco y recuperarlos mediante votación entre capas y cabezas. Es un experimento de arquitectura más que un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y SSM (etiquetado `qwen3_5`), envuelto en `Qwen3_5V14ForConditionalGeneration` con memoria episódica V14 |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el comando de servicio con `--context-length 262144`) |
| Tipos de cuantización | no disponible en la información proporcionada; el servicio de referencia usa `--kv-cache-dtype fp8_e4m3` para la caché KV, no para los pesos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB); incluye `model-mtp-restored.safetensors` con la cabeza MTP para decodificación especulativa |

## Arquitectura y entrenamiento

La arquitectura de base es un transformer de la familia Qwen3 con componentes de atención lineal y SSM (el comando de servicio incluye `--linear-attn-backend triton`, `--mamba-ssm-dtype float32` y `--enable-linear-replayssm-spec`, lo que confirma la presencia de capas de estado recurrente tipo Mamba). Sobre ese sustrato, la conversión V14 añade un mecanismo de memoria episódica: durante la lectura de un prompt, las claves y valores calculados por las capas de atención se fragmentan en eventos de hasta 128 tokens y se escriben en disco junto con un *engram* de bajo rango del estado que dejan en las capas recurrentes. En una petición posterior, el prompt se lee una vez para determinar qué solicita, se recuperan por votación única (para todas las capas y cabezas) los eventos cuyas claves captarían su atención, se componen sus engrams en el estado recurrente de la petición y se relee el prompt con esas claves y valores fusionados en la atención. No se recupera texto ni se añade nada al prompt.

Sobre el entrenamiento del modelo base no hay datos en la información proporcionada: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. El autor cita tres datasets (DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets, DavidAU/THE-DECKARD-Datasets), un proceso multi-etapa con Cold Fusion y GAIN Training, y el uso de Unsloth, pero sin cifras. La innovación técnica destacable de esta versión concreta es la memoria entre peticiones con persistencia en disco, compatible con CUDA graph, caché de prefijos y decodificación especulativa EAGLE, que usa la cabeza MTP incluida en el repo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imagen y texto (`image-text-to-text`), con carga mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Razonamiento con modo thinking: el servicio de referencia activa `--reasoning-parser qwen3-thinking`.
- Tool calling y function calling: el servicio usa `--tool-call-parser qwen3_coder`.
- Memoria episódica entre peticiones independientes: lo dicho en una conversación puede responderse en otra conversación nueva, siempre que el servidor SGLang modificado y el directorio `/memory` estén activos.
- Decodificación especulativa EAGLE con 3 pasos, top-k 1 y 4 tokens de borrador.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo sin censura (uncensored): el modelo base está afinado para reducir rechazos de contenido.
- Desactivación de la memoria mediante `SGLANG_V14_MEMORY=0`, comportándose entonces como el modelo original.

## Casos de uso

- Asistentes con memoria de usuario a largo plazo: el servidor guarda claves y valores de cada prompt en `/memory`, de modo que un usuario puede retomar un tema en una sesión nueva sin reenviar el historial. Adecuado porque la recuperación es por atención, no por búsqueda textual, y el almacén sobrevive a reinicios.
- Investigación sobre memoria episódica en LLM: el flag `SGLANG_V14_TRACE=1` registra cada decisión de recuperación (votos y eventos recuperados), lo que permite auditar y medir el comportamiento del mecanismo en experimentos controlados.
- Prototipos de agentes con estado persistente: al integrarse con la API OpenAI en el puerto 8000, encaja en pipelines de agentes que necesitan recordar decisiones previas entre ejecuciones, con tool calling mediante `qwen3_coder`.
- Análisis de documentos e imágenes en flujos por lotes: la ventana de 262.144 tokens y el pipeline image-text-to-text permiten procesar documentos largos con contenido visual en una sola petición.
- Evaluación de decodificación especulativa en hardware Blackwell: el comando de referencia está validado en una RTX PRO 6000 Blackwell con EAGLE y caché KV en fp8, útil como banco de pruebas de throughput.
- Despliegue interno sin filtros de contenido: para entornos de investigación donde se requiere que el modelo no rechace peticiones por políticas de seguridad, con la advertencia de que la responsabilidad de filtrado recae en el operador.
- Servicio multi-tenant aislado: levantando una instancia de servidor con su propio directorio `/memory` por usuario o inquilino, ya que el almacén no separa usuarios por sí mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "resultados medidos y limitaciones conocidas" en el texto en chino tradicional, pero no incluye cifras en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que se necesita una GPU de 96 GB para el comando de servicio de referencia con pesos en bf16 y contexto de 262.144 tokens. El repo pesa 55,6 GB en safetensors, por lo que en bf16 los pesos ocupan aproximadamente esa cifra y el resto se reparte entre caché KV (fp8_e4m3), estados SSM y memoria del servidor.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), validada por el autor. Para el mismo rango de VRAM, A100 80 GB o H100 80 GB quedarían por debajo del requisito indicado; H200 o B200 de 141 GB o más serían opciones con margen.
- ¿Cabe en GPU de consumo? No con el comando de referencia. No se documenta ninguna configuración con cuantización para GPU de consumo (RTX 4090 de 24 GB, RTX 5090 de 32 GB); no disponible.
- Opciones de despliegue: SGLang modificado mediante la imagen Docker `lovewin10/sglang-v14:nightly-dev-cu13-20260924-ffac53d7-v14`, y Transformers con `trust_remote_code=True` y `AutoModelForImageTextToText`. La memoria episódica requiere `--attention-backend flashinfer` (o `fa3`) y TP, PP y DP de 1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor indica que CUDA graph, caché de prefijos y decodificación especulativa siguen activos con la memoria habilitada, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria entre peticiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-27B-...-v14 (este) | 27,78 B | 262.144 | Sí, vía SGLang modificado y almacén en disco | Apache 2.0 | Hugging Face, 0 descargas |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (base) | 27,78 B (pesos idénticos) | no disponible | No | Apache 2.0 | Hugging Face |
| Qwen3 original de Alibaba (familia) | no disponible en la información | no disponible | No | Apache 2.0 en la mayoría de variantes | Hugging Face |

La comparación con el modelo base es directa: los pesos son idénticos byte a byte y la única diferencia es el envoltorio de memoria y los dos ficheros de código. Frente a un Qwen3 estándar, la ventaja es la persistencia entre peticiones sin RAG textual; la desventaja es la dependencia de una imagen Docker concreta y de un backend de atención específico. No hay datos de rendimiento comparado en la información disponible.

## Limitaciones y advertencias

- El almacén `/memory` contiene los token ids y las claves y valores de atención de todos los prompts leídos: debe tratarse como registro de conversaciones y borrarse para olvidar. Supone un riesgo de privacidad si se comparte entre usuarios.
- No hay separación entre usuarios en el almacén: todas las peticiones leen y escriben el mismo directorio. Para aislar memorias hay que levantar un servidor con su propio `/memory` por inquilino.
- El texto generado no se escribe en memoria; solo se recuerda cuando un prompt posterior lo incluye, como hacen los frontends de chat al reenviar la conversación.
- Solo se documenta inglés como idioma soportado; el rendimiento en castellano no está verificado.
- Es un modelo uncensored: no aplica filtros de seguridad propios y el operador debe implementar moderación externa.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimarlo.
- La memoria requiere `--attention-backend flashinfer` o `fa3` y TP, PP y DP de 1, lo que impide escalado tensorial con la memoria activa.
- Dependencia de una imagen Docker de un tercero (`lovewin10/sglang-v14`) y de remote code con `trust_remote_code=True`: hay que auditar el código antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El nombre del modelo y las etiquetas (`qwen3_5`, `qwen3_6`, `qwen3_8`) no se corresponden con una nomenclatura oficial de Qwen, lo que dificulta verificar la procedencia exacta de los pesos base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Imagen Docker del SGLang modificado: https://hub.docker.com/r/lovewin10/sglang-v14
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset DavidAU/THE-DECKARD-Datasets: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
