# MKRWW/Qwen3.8-27B-int4-AutoRound

## Resumen

Qwen3.8-27B-int4-AutoRound es una cuantizacion INT4 del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por MKRWW mediante Intel AutoRound. El objetivo principal es reducir el peso del modelo de aproximadamente 54 GB en bf16 a unos 17,5 GB en INT4, lo que permite ejecutar el modelo completo en una unica GPU de consumo con 24 GB de VRAM, como una RTX 3090 o RTX 4090, sin necesidad de hardware profesional.

El modelo base Qwen3.8-27B presenta una arquitectura `qwen3_5` (Qwen3_5ForConditionalGeneration) y es multimodal, con capacidades de procesamiento de imagen, texto y audio. Esta cuantizacion mantiene los towers de vision y audio en fp16, cuantizando unicamente los 64 bloques decodificadores de lenguaje. La receta de cuantizacion replica la utilizada en Lorbus/Qwen3.6-27B-int4-AutoRound, lo que permite una actualizacion directa desde la version 3.6. El modelo se sirve mediante vLLM con la ruta de cuantizacion `auto_round` y esta disponible bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (Qwen3_5ForConditionalGeneration), multimodal |
| Parametros totales | 3.029.765.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (con TP=2); ~16.384 tokens en una sola GPU de 24 GB |
| Tipos de cuantizacion | INT4 (AutoRound, group_size=128, simetrico) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con arquitectura `qwen3_5`, que incluye torres de vision y audio ademas del decodificador de lenguaje. La cuantizacion AutoRound se aplica exclusivamente a los 64 bloques decodificadores de lenguaje, manteniendo los towers de vision/audio, `lm_head` y embeddings en fp16. Las proyecciones `linear_attn.in_proj_a` e `in_proj_b` (forma 48×5120) se mantienen tambien en fp16 por no ser divisibles por el tamaño de grupo.

La calibracion se realizo con el dataset NeelNanda/pile-10k, utilizando 128 muestras, 200 iteraciones y una longitud de secuencia de 2048 tokens. La cuantizacion se ejecuto en una unica RTX 3090 en un servidor domestico, lo que demuestra que el hardware de consumo es suficiente tanto para cuantizar como para ejecutar el modelo. El formato de exportacion es `auto_round:auto_gptq`, compatible con la ruta de cuantizacion `auto_round` de vLLM.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo puede procesar y generar texto, describir imagenes y trabajar con entradas de audio.
- Razonamiento con modo "thinking": compatible con el parser de razonamiento `qwen3` de vLLM para cadenas de pensamiento.
- Generacion de codigo: el modelo base destaca en tareas de programacion, y la cuantizacion mantiene un rendimiento solido (13/13 tareas de codigo verificadas contra tests unitarios).
- Razonamiento matematico: 12/12 problemas verbales resueltos correctamente en las pruebas internas.
- Tool calling y function calling: soportado mediante `--enable-auto-tool-choice` y el parser `qwen3_coder` en vLLM.
- Capacidades multilingues: no especificadas en la informacion disponible, aunque el modelo base Qwen3.8-27B es multilingue.
- Soporte de agentes: el modelo puede integrarse en flujos de agente gracias al tool calling y al razonamiento multi-paso.

## Casos de uso

- Asistente multimodal local en una GPU de consumo: con 17,45 GB de pesos, el modelo cabe en una RTX 3090 o 4090 de 24 GB, permitiendo ejecutar un asistente con capacidades de vision y texto en un equipo domestico sin depender de la nube.
- Generacion de codigo en produccion: con 13/13 tareas de codigo superadas, puede integrarse en pipelines de CI/CD para generar o revisar codigo, usando el modo no-think para respuestas rapidas o el modo thinking para problemas complejos.
- Razonamiento matematico asistido: su rendimiento perfecto en problemas verbales (12/12) lo hace util como herramienta de apoyo en educacion o investigacion, con verificacion de resultados.
- Agente autonomo con tool calling: el soporte de `qwen3_coder` parser permite construir agentes que llaman a APIs o ejecutan funciones de forma autonoma, con validacion de argumentos JSON.
- Procesamiento de documentos largos con doble GPU: con TP=2 y 262.144 tokens de contexto, puede analizar documentos extensos, libros o codebases completos, manteniendo la coherencia a lo largo de la conversacion.
- Despliegue en entornos con restricciones de VRAM: al ocupar ~18 GB en disco y ~17,5 GB en VRAM, es viable en instancias cloud con una unica GPU de 24 GB, reduciendo costes frente a los ~54 GB necesarios en bf16.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de pruebas internas del autor, ejecutadas en una RTX 3090 y comparadas con una build equivalente de Qwen3.6-27B-int4-AutoRound con la misma configuracion de servicio. No se trata de un leaderboard formal, pero los resultados son reproducibles.

**Calidad (build 3.8-int4 vs 3.6-int4):**

| Test | 3.6-int4 | 3.8-int4 |
|---|---|---|
| Codigo (13 tareas, tests unitarios, no-think) | 12/13 | 13/13 |
| Matematicas (12 problemas verbales, verificados) | 8/12 | 12/12 |
| Tool-calling (argumentos JSON validos) | Si | Si |
| Vision / Omni (descripcion de imagen) | Si | Si |

**Throughput (vLLM, TP=2, 1024-in/256-out, ignore_eos):**

| Concurrencia | Salida tok/s | Total tok/s |
|---|---|---|
| 1 | 56 | 281 |
| 8 | 200 | 999 |
| 32 | 271 | 1354 |
| 64 | 281 | 1404 |

El rendimiento de 3.8 se encuentra dentro del ruido estadistico respecto a 3.6. El sistema esta limitado por prefill, por lo que los prompts largos afectan a la latencia pero no a la velocidad de decodificacion.

## Requisitos de hardware

- VRAM estimada: 17,45 GB para los pesos en INT4; con `--enforce-eager` queda espacio para ~16 K de contexto (≈59 K tokens KV en fp8) en una GPU de 24 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para una sola tarjeta; dos tarjetas de 24 GB con TP=2 para el contexto completo de 262 K tokens.
- Compatibilidad con GPU de consumo: si, cabe en una unica GPU de 24 GB, incluyendo las RTX 3090/4090.
- Opciones de despliegue: vLLM con `--quantization auto_round`; para CPU o VRAM reducida se recomienda una version GGUF (no incluida en este repositorio).
- Latencia y throughput: ~56 tok/s en single-stream; hasta 281 tok/s de salida con concurrencia 64 en TP=2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| MKRWW/Qwen3.8-27B-int4-AutoRound | 3,03 B | 262 K (TP=2) | Apache-2.0 | INT4 AutoRound | Multimodal, 17,5 GB de pesos |
| Lorbus/Qwen3.6-27B-int4-AutoRound | no disponible | no disponible | Apache-2.0 | INT4 AutoRound | Version anterior, misma receta |
| Qwen/Qwen3.8-27B (bf16) | 3,03 B | 262 K | Apache-2.0 | bf16 | Requiere ~54 GB de VRAM |

La comparativa directa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada. La alternativa mas cercana es la version 3.6 cuantizada con la misma metodologia, que sirve como referencia de rendimiento.

## Limitaciones y advertencias

- La cuantizacion INT4 puede introducir perdidas de precision en tareas muy sensibles a los detalles numericos, aunque las pruebas internas muestran resultados solidos en codigo y matematicas.
- La calibracion se realizo unicamente en modo texto (NeelNanda/pile-10k); los towers de vision y audio no fueron calibrados, lo que podria afectar al rendimiento multimodal en casos extremos.
- Las proyecciones `linear_attn.in_proj_a` e `in_proj_b` se mantienen en fp16 por limitaciones de forma, lo que incrementa ligeramente el uso de VRAM.
- El contexto completo de 262 K tokens requiere dos GPUs de 24 GB; en una sola GPU el contexto se limita a ~16 K tokens.
- Los benchmarks publicados son pruebas internas del autor, no un leaderboard formal; los resultados deben interpretarse con cautela.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificas de esta cuantizacion.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MKRWW/Qwen3.8-27B-int4-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Intel AutoRound: https://github.com/intel/auto-round
- Version 3.6 de referencia: https://huggingface.co/Lorbus/Qwen3.6-27B-int4-AutoRound
