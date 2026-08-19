# sokada4/Qwen3.8-27B-GPTQ-Int4

## Resumen

El modelo `sokada4/Qwen3.8-27B-GPTQ-Int4` es una cuantización GPTQ de 4 bits (W4A16) del modelo base `Qwen/Qwen3.8-27B`, un transformer denso de 27.8 mil millones de parámetros desarrollado por la familia Qwen. La cuantización ha sido producida con GPTQModel 7.3.4 y está pensada para servir el modelo en entornos de producción con vLLM, reduciendo el peso de 27B a aproximadamente 17.7 GiB en memoria. El checkpoint mantiene intactos los tensores de la cabeza de Multi-Token-Prediction (MTP) en bf16, lo que permite decodificación especulativa sin pérdida de rendimiento, y también conserva la torre de visión sin cuantizar, aunque el autor indica que el checkpoint está destinado a servir solo texto.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 27B en hardware de consumo (2x24GB) con una ventana de contexto nativa de 262.144 tokens, soporte de tool calling y razonamiento, y compatibilidad directa con vLLM, lo que lo hace adecuado como backend local para herramientas como Claude Code o Codex CLI. El autor proporciona benchmarks de latencia y throughput medidos en 2x RTX 3090, así como una advertencia importante sobre la fiabilidad de las llamadas a herramientas en comparación con modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; 200.000 en despliegue recomendado con 2x24GB |
| Tipos de cuantizacion | GPTQ W4A16, 4 bits, group size 128, simetrico, desc_act=false |
| Idiomas soportados | No especificados oficialmente; calibracion con c4 (zh/en/ja) y codeparrot (codigo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ cuantizado); tensores MTP y vision en bf16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.8B parametros con una cabeza de Multi-Token-Prediction (MTP) integrada para decodificacion especulativa. En esta cuantizacion, solo los pesos de `language_model.*` se han cuantizado a 4 bits mediante GPTQ con group size 128, simetria activada y `desc_act=false`. Los tensores MTP (15 tensores) se mantienen en bf16 gracias al mecanismo `out_of_model_tensors` de GPTQModel, y la torre de vision no se toca, aunque el checkpoint se sirve unicamente en modo texto.

La calibracion de la cuantizacion se realizo con 256 muestras en total (64 por fuente) de `allenai/c4` (chino, ingles, japones) y `codeparrot/codeparrot-clean-valid`, con una longitud de secuencia de 4096 tokens. No se proporcionan datos sobre el entrenamiento del modelo base (numero de tokens, dataset, metodos de alineacion como RLHF o DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: compatible con el parser de razonamiento `qwen3` de vLLM, que extrae cadenas de pensamiento del modelo.
- Tool calling / function calling: soportado via el parser `qwen3_xml` (alias `qwen3_coder`) en vLLM, con `--enable-auto-tool-choice`.
- Decodificacion especulativa MTP: la cabeza MTP en bf16 permite acelerar la inferencia con una tasa de aceptacion medida del 74,8% en este checkpoint.
- Capacidades multilingues: la calibracion incluye chino, ingles y japones, aunque no se confirma el soporte oficial de idiomas.
- Multimodalidad parcial: el pipeline es image-text-to-text, pero el autor indica que el checkpoint esta destinado a servir solo texto; la torre de vision no esta cuantizada pero no se recomienda su uso.
- Compatibilidad con APIs de agentes: puede usarse como backend de Claude Code (API Anthropic Messages) y Codex CLI (API OpenAI compatible) mediante vLLM.

## Casos de uso

- Backend local para Claude Code: el modelo puede servir como sustituto de modelos Anthropic en Claude Code, configurando las variables de entorno `ANTHROPIC_BASE_URL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, etc., y desactivando el header de atribucion para preservar el prefix caching de vLLM. Adecuado por su soporte nativo de la API Messages y su ventana de contexto amplia.
- Backend local para Codex CLI: similar al anterior, usando la API compatible con OpenAI de vLLM y el wire API `responses`. El modelo acepta `reasoning_effort` en `{xhigh, medium, low}`, lo que permite ajustar el nivel de razonamiento.
- Inferencia de texto con contexto largo: con 262.144 tokens de contexto nativo (200.000 en configuracion recomendada), es util para procesar documentos extensos, analisis de codigo o conversaciones multi-turno largas.
- Decodificacion especulativa para reducir latencia: en despliegues con 2x24GB, la cabeza MTP acelera la generacion (TPOT medio de 12,6 ms a concurrencia 1), ideal para aplicaciones interactivas en tiempo real.
- Generacion de codigo asistida: gracias al tool calling y al entrenamiento con datos de codigo (codeparrot), puede integrarse en pipelines de desarrollo para autocompletado, generacion de tests o refactorizacion.
- Prototipado de agentes autonomos: con `--enable-auto-tool-choice` y el parser XML, se pueden construir agentes que llamen a funciones externas, aunque se recomienda supervisar las llamadas por la tasa de errores observada.

## Benchmarks y rendimiento

El autor proporciona resultados de `vllm bench serve` con dataset aleatorio (input-len 128, output-len 64), en 2x RTX 3090 con tensor parallelism 2 y MTP speculative decoding habilitado:

| Concurrencia | TTFT medio | TPOT medio | Output tok/s | Tasa de aceptacion MTP |
|---|---|---|---|---|
| 1 | 198,5 ms | 12,6 ms | 64,6 | 74,8% |
| 8 | 488,0 ms | 43,9 ms | 154,3 | 74,7% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La tasa de aceptacion MTP es notablemente inferior a la del checkpoint hermano Qwen3.6-27B (84-88%), lo que afecta a la velocidad efectiva en modo especulativo.

## Requisitos de hardware

- VRAM estimada: ~17,7 GiB solo para pesos en 4 bits; se necesita memoria adicional para KV cache y buffers de verificacion MTP.
- GPU recomendadas: 2x24GB (p.ej. RTX 3090) con `--tensor-parallel-size 2` para un uso comodo con MTP y contexto de 200.000 tokens; 4x24GB o 2x48GB+ para contexto nativo completo.
- GPU de consumo: cabe en una RTX 4090 (24GB) solo sin MTP y con `--max-model-len` reducido; una sola 24GB hace OOM en el paso de captura de grafo CUDA a longitud nativa.
- Opciones de despliegue: vLLM 0.26.0 (probado), llama.cpp, Ollama u otros servidores compatibles con GPTQ, aunque la model card solo documenta vLLM.
- Latencia y throughput: con TP=2 y MTP, TTFT de 198,5 ms y TPOT de 12,6 ms a concurrencia 1; 154,3 output tok/s agregados a concurrencia 8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP acceptance | Licencia |
|---|---|---|---|---|---|
| sokada4/Qwen3.8-27B-GPTQ-Int4 | 27,8B | 262.144 | GPTQ 4-bit | 74,8% | Apache 2.0 |
| sokada4/Qwen3.6-27B-GPTQ-Int4 | 27,8B (misma arquitectura) | 262.144 | GPTQ 4-bit | 84-88% | Apache 2.0 |
| Qwen/Qwen3.8-27B (base sin cuantizar) | 27,8B | 262.144 | bf16 | no disponible | Apache 2.0 |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. La diferencia principal entre los dos checkpoints GPTQ es la tasa de aceptacion MTP, que es una propiedad del modelo especifico y no de la arquitectura. El modelo base sin cuantizar no tiene datos de rendimiento de inferencia en esta informacion.

## Limitaciones y advertencias

- Fiabilidad de tool calling: pruebas de campo independientes indican una tasa de llamadas a herramientas malformadas aproximadamente 10 veces mayor que en modelos Claude o GPT propietarios (reportada para la familia Qwen3.6/3.8). Se recomienda validar las llamadas y mantener supervisión humana en agentes autonomos.
- Tasa de aceptacion MTP reducida: 74,8% frente al 84-88% de Qwen3.6-27B, lo que reduce la ganancia de velocidad de la decodificacion especulativa.
- Restricciones de VRAM: en una sola GPU de 24GB, el modelo solo es practico sin MTP y con contexto muy reducido; la longitud nativa provoca OOM en la captura de grafo CUDA.
- `reasoning_effort` limitado: el servidor vLLM solo acepta `{xhigh, medium, low}`; pasar `high` (el valor por defecto de Claude Code) devuelve un error 400.
- Uso multimodal no soportado: aunque el pipeline es image-text-to-text, el checkpoint esta disenado para servir solo texto; la torre de vision no esta cuantizada pero no se recomienda su uso.
- Sin datos de sesgos o alucinacion: no se proporciona informacion sobre sesgos conocidos ni tasas de alucinacion especificas de este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sokada4/Qwen3.8-27B-GPTQ-Int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint hermano Qwen3.6-27B GPTQ: https://huggingface.co/sokada4/Qwen3.6-27B-GPTQ-Int4
- GPTQModel (herramienta de cuantizacion): https://github.com/ModelCloud/GPTQModel
