# positron-ai/Ministral-3-14B-Instruct-2512

## Resumen

Ministral-3-14B-Instruct-2512 es un modelo de lenguaje de tipo transformer denso desarrollado por Mistral AI, publicado originalmente en su repositorio oficial y aquí redistribuido como espejo (mirror) por Positron AI. Con 13.945.031.680 parámetros (aproximadamente 14B) y pesos en formato safetensors, se posiciona como un modelo de talla media orientado a instrucciones, con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones adicionales.

El repositorio que nos ocupa no es el desarrollo original, sino una copia verificada byte a byte del modelo upstream en la revisión `29439f81c2be264d8d393273f99e7db9c0961120`. La única modificación introducida es el `README.md`; el resto de archivos (pesos, tokenizador Tekken, plantilla de chat, configuración y prompt de sistema) mantienen sus identificadores de objeto idénticos a los del repositorio de Mistral AI. Esta operación responde a una necesidad de reproducibilidad en pipelines de integración continua (CI), aislando las descargas de la volatilidad, el gating y los límites de tasa del repositorio original.

Es relevante ahora porque ofrece una fuente estable y anónimamente descargable de un modelo de 14B con licencia permisiva, algo útil para equipos que automatizan la descarga de pesos en entornos de CI/CD. No obstante, conviene subrayar que este repositorio no aporta evaluación propia ni debe considerarse canal de adquisición para procesamiento de pesos ni como fuente `bf16`; el sujeto canónico sigue siendo el repositorio upstream de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral 3, tag `mistral3`) |
| Parametros totales | 13.945.031.680 (~14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos publicados en safetensors; el repositorio incluye tag `fp8`; no se detallan otras variantes |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards + `consolidated.safetensors`); tokenizador Tekken (`tekken.json`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia `mistral3` (tag de HuggingFace) y de tipo denso, con 13.945.031.680 parametros. El repositorio incluye `params.json`, `config.json`, `generation_config.json`, `processor_config.json`, una plantilla de chat (`chat_template.jinja`) y un prompt de sistema (`SYSTEM_PROMPT.txt`), lo que confirma que se distribuye como modelo instructivo listo para conversacion. El tokenizador es Tekken, el tokenizador propietario de Mistral AI, con vocabulario empaquetado en `tekken.json`.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta la longitud de contexto nativa. Cualquier afirmacion sobre estos puntos requeriria consultar la model card upstream `README.upstream.md`, que se preserva en el repositorio pero cuyo contenido no se ha incluido en la informacion facilitada.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional, con plantilla de chat propia (`chat_template.jinja`) y prompt de sistema incluido (`SYSTEM_PROMPT.txt`).
- Razonamiento y respuesta a instrucciones complejas, segun el sufijo `Instruct` del nombre.
- Soporte de tokenizador Tekken, optimizado por Mistral AI para eficiencia en la tokenizacion de codigo y texto multilingue.
- Capacidades multilingues: no se detalla la lista de idiomas en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades especiales (vision, audio, thinking mode): no confirmadas en la informacion disponible.

## Casos de uso

- Integracion continua (CI) con pesos fijados: el repositorio sirve como fuente de descarga anonimamente accesible y anclada a una revision concreta, lo que permite que los pipelines de CI descarguen el modelo sin depender del gating ni de los limites de tasa del repositorio upstream de Mistral AI.
- Replicabilidad de experimentos: al ser una copia byte a byte verificada mediante sha256/sha1, garantiza que los resultados de evaluacion obtenidos en CI correspondan exactamente al artefacto upstream, eliminando la variabilidad por cambios silenciosos.
- Despliegue de un asistente conversacional de talla media: con ~14B parametros y licencia Apache 2.0, es adecuado para servicios de atencion al cliente o asistentes internos donde se requiere uso comercial sin restricciones.
- Generacion de codigo asistida: la presencia del tokenizador Tekken y la naturaleza instructiva del modelo lo hacen apto para autocompletado y explicacion de codigo en entornos de desarrollo, aunque no se documentan benchmarks especificos en la informacion disponible.
- Fine-tuning supervisado (SFT) sobre dominio propio: al ser un modelo denso de 14B con pesos en safetensors y licencia permisiva, puede adaptarse con LoRA o QLoRA sobre una unica GPU de 80 GB o varias de 24 GB, partiendo de esta copia estable.
- Evaluacion comparativa interna: util para equipos que necesitan un baseline de 14B con licencia Apache 2.0 frente a modelos de mayor tamano, manteniendo la trazabilidad del artefacto exacto evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explicitamente que no reporta resultados de evaluacion y que ninguno debe atribuirse a este mirror.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 28 GB solo para pesos (14B x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits (fp8): aproximadamente 14 GB para pesos; el repositorio incluye el tag `fp8`, aunque no se detalla si los pesos publicados estan ya cuantizados o solo etiquetados.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 8-9 GB para pesos, lo que permitiria ejecucion en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16; RTX 4090 (24 GB) para fp8 o cuantizaciones de 4-5 bits; RTX 3090/4080 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits (RTX 3090, RTX 4090, RTX 4080) y potencialmente en 8 bits con 24 GB si el overhead es bajo.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con safetensors y con cuantizaciones GGUF derivadas; el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512 (este mirror) | 13,9B | No disponible | Apache 2.0 | Safetensors, mirror CI |
| Mistral Nemo 12B Instruct | ~12B | No disponible en esta busqueda | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-14B-Instruct | ~14,7B | No disponible en esta busqueda | Apache 2.0 | Safetensors, GGUF, AWQ |
| Llama 3.1 8B Instruct | ~8B | No disponible en esta busqueda | Llama 3.1 Community License | Safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato de distribucion. Cualquier comparacion de calidad requeriria benchmarks que no se han publicado aqui.

## Limitaciones y advertencias

- Este repositorio es exclusivamente un mirror de CI: no es canal de adquisicion para procesamiento de pesos ni fuente `bf16`; el sujeto canonico es `mistralai/Ministral-3-14B-Instruct-2512`.
- No se han publicado evaluaciones propias; no deben atribuirse resultados de benchmark a este repositorio.
- La longitud de contexto, los idiomas soportados y las capacidades de tool calling no estan documentados en la informacion disponible, por lo que no deben asumirse.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 14B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los terminos del modelo upstream y cualquier dependencia del tokenizador Tekken.
- El tag `fp8` en HuggingFace no garantiza que los pesos publicados esten cuantizados; debe verificarse en `config.json` antes de asumir un formato concreto.
- El tamano del repositorio (31,5 GB) incluye tanto los 4 shards como el `consolidated.safetensors`, lo que duplica el espacio de descarga si se clona completo.

## Enlaces

- Repositorio mirror en HuggingFace: https://huggingface.co/positron-ai/Ministral-3-14B-Instruct-2512
- Repositorio upstream (Mistral AI): https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Revision upstream referenciada: `29439f81c2be264d8d393273f99e7db9c0961120`
- Model card upstream preservada en el repositorio: `README.upstream.md`
- Prompt de sistema incluido: `SYSTEM_PROMPT.txt`
- Plantilla de chat: `chat_template.jinja`
- Tokenizador Tekken: `tekken.json`, `tokenizer.json`
