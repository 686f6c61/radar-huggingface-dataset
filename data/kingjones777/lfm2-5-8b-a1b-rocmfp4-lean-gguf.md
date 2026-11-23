# kingjones777/LFM2.5-8B-A1B-ROCmFP4-LEAN-GGUF

## Resumen

LFM2.5-8B-A1B-ROCmFP4-LEAN-GGUF es una cuantización de 4 bits en formato ROCmFP4 del modelo LiquidAI/LFM2.5-8B-A1B, publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una conversión de pesos orientada específicamente al hardware AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, arquitectura gfx1151). El formato ROCmFP4 solo existe en el fork ROCmFPX de llama.cpp, por lo que el archivo no es cargable con llama.cpp estándar.

El modelo base es un transformer de tipo MoE con arquitectura `lfm2moe`, 8.467.856.832 parámetros totales y una ventana de contexto de 128.000 tokens. Esta build concreta ocupa 4.809.862.624 bytes (4,48 GiB) y emplea 256 tensores: 132 en ROCmFP4, 123 en F32 y uno en Q5_K (el embedding de tokens). La proyección de salida está atada al embedding, de modo que no existe un tensor `output.weight` independiente.

Su relevancia es acotada pero clara: es la primera build ROCmFP4 de un checkpoint LFM2.5 y ofrece un rendimiento medido de 147,1 t/s en generación sobre un Ryzen AI Max+ 395 con ROCm 7.13.0, además de métricas de prompt processing de hasta 3.732,2 t/s con Super Roc. La licencia heredada es lfm1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2moe` (MoE, transformer) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | ROCmFP4 (ftype 101, `Q4_0_ROCMFP4_LEAN`); embedding de tokens en Q5_K; 123 tensores en F32 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (heredada del modelo base) |
| Formato de pesos | GGUF (256 tensores; 4.809.862.624 bytes / 4,48 GiB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `lfm2moe`, una mezcla de expertos de Liquid AI con atención y estado recurrente propios de la familia LFM2. El repositorio no documenta el número de parámetros activos por token ni la composición del dataset de entrenamiento, el volumen de tokens o si hubo fases de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa más allá del soporte DSpark que LiquidAI publica para este modelo.

En cuanto al proceso de conversión, el autor parte de LiquidAI/LFM2.5-8B-A1B en la revisión `b9aebfcbe28b6cb374042f495d733037550ab146`, lo convierte a GGUF F16 con llama.cpp upstream en el commit `e85caa81ea2b65797396018c179b87ad61fa38ab` y después lo cuantiza a ftype 101 con el fork ROCmFPX (rama `feature/dspark-v2`). Existen dos variantes que solo difieren en el tipo del embedding: LEAN (ftype 101, Q5_K) y COHERENT (ftype 102, Q6_K). No se publica perplejidad de esta build.

## Capacidades

- Generación de texto conversacional y continuación de texto, según el pipeline declarado `text-generation`.
- Modo de razonamiento explícito: la salida de muestra incluye marcas `[Start thinking]` y el autor indica que el pensamiento se activa por petición con `chat_template_kwargs.enable_thinking` y se desactiva con `--think off`.
- Tool calling: medido en Super Roc con 7/8 aciertos en modo requerido y 5/8 en modo automático.
- Caché de prompt: 4.815 tokens en caché sobre 4.855 de prompt en el segundo turno.
- Capacidad multilingüe: no disponible (no se documentan idiomas).
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Inferencia local en equipos Strix Halo: el archivo está pensado para Ryzen AI Max+ 395 con memoria unificada de 125-128 GB, donde cabe holgadamente y ofrece 147,1 t/s de generación con `-ngl 999 -fa on`.
- Asistente conversacional con contexto largo: la ventana de 128.000 tokens permite mantener historiales extensos o documentos completos en memoria, con una caché de prompt que reutiliza 4.815 de 4.855 tokens en el segundo turno.
- Automatización con tool calling: los 7/8 aciertos en modo requerido lo hacen utilizable en flujos donde el esquema de herramientas es fijo y se exige la llamada.
- Servicio local con API compatible con OpenAI: el tag `endpoints_compatible` y el comando `superroc serve --served-model-name lfm2.5-8b-lean-rerun` permiten exponerlo en `127.0.0.1:8080` para clientes existentes.
- Generación de código en local: se midieron 157,8 t/s de media en dos prompts de código, adecuado para autocompletado interactivo en el propio equipo.
- Integración con Lemonade: mediante `lemonade pull LFM2.5-8B-A1B-ROCmFP4-LEAN` y la configuración `llamacpp.rocm_bin`, se puede usar como backend de chat local sin montar infraestructura adicional.
- Evaluación de cuantizaciones de 4 bits en AMD: útil para comparar el comportamiento de ROCmFP4 frente a k-quants estándar en gfx1151 antes de adoptar el formato en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de throughput, medidos por el autor.

| Metrica | Valor | Entorno |
|---|---:|---|
| Generación (`-c 512 -n 64`, temp 0) | 147,1 t/s | llama-cli, Ryzen AI Max+ 395, ROCm 7.13.0 |
| Generación (`-c 2048 -n 512`, media de 3 repeticiones) | 137,3 t/s | sin drafter |
| Generación con DSpark (`--spec-draft-n-max 8`) | 85,1 t/s | −38,0% frente a sin drafter |
| Prompt tok/s (p1k) | 3.732,2 | Super Roc 0.20.1 |
| Prompt tok/s (p8k) | 2.941,5 | Super Roc 0.20.1 |
| Generación tok/s (p1k) | 152,62 | Super Roc 0.20.1 |
| Generación tok/s (p8k) | 129,08 | Super Roc 0.20.1 |
| Generación de código tok/s | 157,8 | media de 2 prompts |
| Tiempo de carga | 6 s | Super Roc 0.20.1 |

## Requisitos de hardware

- VRAM/memoria: el archivo pesa 4,48 GiB; en Strix Halo se emplea memoria unificada, y las pruebas se hicieron con 125-128 GB en el equipo.
- GPU objetivo: AMD Radeon 8060S integrada en Ryzen AI Max+ 395, arquitectura gfx1151. Requiere ROCm 7.13.0 en las pruebas del autor.
- GPU consumer: no se documenta funcionamiento en GPU NVIDIA ni en GPUs AMD de escritorio; el formato ROCmFP4 está atado al fork ROCmFPX.
- Despliegue: llama.cpp del fork ROCmFPX (rama `feature/dspark-v2`) y Super Roc 0.20.1. llama.cpp estándar no carga el archivo. También disponible vía Lemonade.
- Throughput: 147,1 t/s de generación y 3.732,2 t/s de prompt processing a 1k; 129,08 t/s de generación a 8k de contexto.
- Memoria de contexto: se cargaron 128.000 tokens de contexto en Super Roc, aunque el autor señala que el comportamiento en la ventana completa no se probó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-ROCmFP4-LEAN (esta build) | 8,47 B | 128.000 | GGUF ROCmFP4 (ftype 101) | lfm1.0 | Solo fork ROCmFPX; 147,1 t/s en gfx1151 |
| LiquidAI/LFM2.5-8B-A1B (original) | 8,47 B | 128.000 | safetensors | lfm1.0 | Pesos de referencia; requiere runtime estándar |
| Builds GGUF k-quant de LFM2.5-8B-A1B (LiquidAI, unsloth y otros) | 8,47 B | 128.000 | GGUF k-quant | lfm1.0 | Compatibles con llama.cpp estándar; el autor no las ejecutó ni comparó |
| LFM2.5-1.2B (misma familia) | no disponible | no disponible | no disponible | lfm1.0 | DSpark midió −28,4% en esta variante |
| LFM2.5-2.6B (misma familia) | no disponible | no disponible | no disponible | lfm1.0 | DSpark midió −19,1% en esta variante |

## Limitaciones y advertencias

- El archivo solo se carga con el fork ROCmFPX de llama.cpp; llama.cpp estándar falla al abrirlo. Esto limita la portabilidad y ata el despliegue a un fork de terceros.
- La decodificación especulativa DSpark es una pérdida neta en este hardware: −38,0% de generación (85,1 frente a 137,3 t/s) y longitud media aceptada de 2,71 con bloque de 9. El autor no publica drafter ROCmFP4.
- `lfm2.cpp` y `lfm2moe.cpp` no rellenan `t_layer_inp[]`, por lo que `draft-dspark` aborta con `GGML_ASSERT(t_layer_inp[il] != nullptr)` sin un parche de una línea.
- Con el parche aplicado, llama.cpp avisa de que el rollback de estado recurrente no es compatible con `draft-dspark` y recurre a una ruta de checkpoint no bit-exacta; la salida diverge de la generación greedy (reproducible 3/3).
- No se publica perplejidad de esta build; la evidencia de calidad se limita a una comprobación de coherencia y a una auditoría a nivel de tensor.
- El comportamiento en la ventana completa de 128.000 tokens no se ha probado.
- La licencia lfm1.0 es de tipo "other" y puede imponer restricciones al uso comercial; debe revisarse antes de producción.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El rendimiento medido corresponde a un único equipo en reposo y a una petición simultánea; no hay datos de concurrencia.
- El repositorio tiene 27 descargas y 0 likes, y las cifras de rendimiento proceden del propio autor del quant, no de una evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/LFM2.5-8B-A1B-ROCmFP4-LEAN-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Super Roc: https://github.com/kingjones30/superroc
- Guía de Lemonade de Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
