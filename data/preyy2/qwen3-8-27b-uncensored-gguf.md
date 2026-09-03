# preyy2/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una version cuantizada y "desensibilizada" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario preyy2. El modelo base es un vision-language model denso de 27 000 millones de parametros con arquitectura hibrida de atencion (Gated DeltaNet lineal + atencion completa), contexto de 262 144 tokens y capacidades de razonamiento, tool calling y vision. Esta version elimina parcialmente el comportamiento de rechazo del modelo original mediante una tecnica llamada abliteration, que modifica los pesos del modelo sin reentrenamiento.

La relevancia de este modelo reside en que ofrece una alternativa de codigo abierto con menos restricciones de seguridad para casos de uso donde el modelo base rechaza peticiones legitimas, manteniendo las capacidades del original. Se distribuye en formato GGUF con multiples niveles de cuantizacion, incluyendo la cabeza de prediccion multi-token (MTP) para decodificacion especulativa, y un proyector de vision para entrada de imagenes. La licencia es Apache 2.0, aunque el autor indica un uso restringido a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hibrida: Gated DeltaNet lineal + atencion completa) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (mas F16 no publicado) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 (uso restringido a investigacion segun el autor) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con vocabulario de 248 320 tokens, que combina atencion lineal Gated DeltaNet con atencion completa en capas alternas. Incluye una cabeza de prediccion multi-token (MTP) de 1 capa para decodificacion especulativa, y un proyector de vision para entrada de imagenes. El proceso de "uncensoring" se realizo con la herramienta Heretic, que aplica abliteration: elimina direcciones de rechazo en los pesos minimizando la divergencia KL respecto al modelo original, sin fine-tuning ni datos de entrenamiento adicionales. La abliteration se ejecuto en bf16 y el LoRA resultante se fusiono en el modelo base, por lo que los pesos publicados no son un redondeo de cuantizacion. Los tensores `mtp.*` se copiaron sin modificacion del checkpoint base. La matriz de importancia (imatrix) se calculo directamente desde el f16 con wikitext-2 (200 chunks).

## Capacidades

- Generacion de texto y razonamiento multi-paso en ingles y chino.
- Comprension de imagenes mediante el proyector de vision mmproj (F16).
- Tool calling y function calling, compatible con runtimes que soporten endpoints.
- Decodificacion especulativa con cabeza MTP integrada (fused) o como archivo separado para `--model-draft`.
- Razonamiento con modo thinking (heredado del modelo base).
- Contexto largo de 262 144 tokens para conversaciones multi-turno y documentos extensos.
- Comportamiento de rechazo sustancialmente reducido respecto al modelo base (no eliminado).

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, poesia o guiones sobre temas que el modelo base rechazaria, manteniendo la calidad del Qwen3.8-27B original.
- Analisis de documentos extensos: con 262 144 tokens de contexto, puede procesar libros completos, informes tecnicos o codigo fuente de gran tamano en una sola pasada.
- Asistente de codigo con vision: al combinar la entrada de imagenes con generacion de codigo, puede transcribir diagramas o capturas de pantalla a codigo funcional.
- Investigacion en seguridad de IA: util para estudiar el comportamiento de modelos sin alineacion de seguridad, comparando respuestas con el modelo base.
- Despliegue local en hardware modesto: las cuantizaciones IQ2_M (10,6 GB) y Q4_K_M (16,8 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM.
- Desarrollo de agentes conversacionales: el soporte de tool calling y el contexto largo permiten construir agentes que mantienen estado a lo largo de interacciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones de perplexity en wikitext-2 para cada cuantizacion, comparadas contra el f16 de referencia:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7,1557 +/- 0,25104 | - |
| Q5_K_M | 7,1573 +/- 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 +/- 0,25019 | +0,0026 |
| Q6_K | 7,1689 +/- 0,25149 | +0,0132 |
| Q8_0 | 7,1764 +/- 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 +/- 0,25227 | +0,0257 |
| IQ2_M | 7,8581 +/- 0,27481 | +0,7024 |

El autor advierte que las diferencias entre cuantizaciones (excepto IQ2_M) estan dentro del margen de error estandar (~0,25), por lo que el orden de las filas no es significativo.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 10,6 GB (IQ2_M) hasta 29,0 GB (Q8_0) para el archivo principal, mas 0,9 GB del proyector de vision si se usa.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q5_K_M; A100/H100 (40-80 GB) para Q8_0 o f16.
- Cabe en GPUs de consumo: si, con cuantizaciones IQ2_M, IQ4_XS o Q4_K_M en GPUs de 12-16 GB (por ejemplo, RTX 3060 12 GB o RTX 4070 Ti 16 GB).
- Opciones de despliegue: llama.cpp, llama-server, Ollama (build disponible), ComfyUI para vision, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. La decodificacion especulativa con MTP puede acelerar la generacion, pero la tasa de aceptacion no se ha medido para todas las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262 144 | Apache 2.0 | safetensors | Modelo original con alineacion de seguridad |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262 144 | Apache 2.0 (research only) | GGUF | Abliterado, con MTP y vision |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | 262 144 | Apache 2.0 | GGUF | Cuantizaciones del modelo original sin abliteracion |

La diferencia principal frente al modelo base es la reduccion del comportamiento de rechazo. Frente a las cuantizaciones de unsloth, este modelo anade la cabeza MTP y el proyector de vision en el mismo repositorio.

## Limitaciones y advertencias

- El comportamiento de rechazo esta "sustancialmente reducido, no eliminado": el modelo puede seguir negandose a ciertas peticiones.
- La licencia Apache 2.0 se indica en la model card, pero el autor restringe el uso a investigacion; verificar antes de usar en produccion.
- La tasa de aceptacion de la decodificacion especulativa puede ser menor que en el modelo base, ya que la cabeza MTP se entreno contra el modelo sin modificar.
- La cuantizacion IQ2_M muestra una perdida de perplexity significativa (+0,70) y puede degradar la calidad en tareas complejas.
- El modelo solo soporta ingles y chino; otros idiomas pueden tener rendimiento inferior.
- No se han publicado benchmarks de tareas (razonamiento, codigo, matematicas) para esta version, por lo que el impacto de la abliteracion en capacidades no esta cuantificado.
- El autor no proporciona garantias sobre el comportamiento del modelo en entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/preyy2/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Build de Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Cuantizaciones alternativas (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Articulo de analisis: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-gguf-orcarouter
