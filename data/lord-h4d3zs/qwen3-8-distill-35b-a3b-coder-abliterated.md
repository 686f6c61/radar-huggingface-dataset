# Lord-H4D3ZS/Qwen3.8-Distill-35B-A3B-Coder-Abliterated

## Resumen

Este modelo es un artefacto experimental publicado por Lord-H4D3ZS que combina destilación de razonamiento, injerto del head MTP y cuantización extrema ROCmFPX para ejecutar un MoE de 35,5B parámetros en una GPU de consumo con 16GB de VRAM. El modelo base es Qwen/Qwen3.6-35B-A3B, una arquitectura MoE con 256 expertos y aproximadamente 3B parámetros activos. El "3.8" del nombre hace referencia al teacher utilizado en la destilación, un Qwen3.8-27B abliterated en formato GGUF Q8_0.

El propósito declarado por el autor es reproducir un pipeline completo (destilar → injertar MTP → cuantizar a 2-bit) y publicarlo como prueba de concepto, no como un modelo listo para producción. La cuantización emplea una mezcla role-aware: los expertos se reducen a 2-bit mientras que la atención, embeddings, expertos compartidos y la salida se mantienen en Q6, con normas en F32, alcanzando un tamaño total de 12GB. En la evaluación interna de 10 tareas, el modelo destilado empató con su base (6/10 frente a 6/10), sin ganancia medible, y la cuantización a 2-bit degrada aún más la calidad.

La licencia es Apache-2.0, heredada del modelo base. El repositorio incluye instrucciones de compilación para el runtime ROCmFPX y un script de build. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE, 256 expertos) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no especificada oficialmente; el comando de ejecución sugiere hasta 32K (con -c 32768) |
| Tipos de cuantizacion | Q2_0_ROCMFPX (expertos, ~90% del volumen), Q6_0_ROCMFPX (attention, embeddings, shared-experts, output), normas en F32 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, una arquitectura MoE con 256 expertos y activación de ~3B parámetros por token. La destilación se realizó mediante QLoRA de 4 bits con Unsloth, usando como teacher un Qwen3.8-27B abliterated (GGUF Q8_0) ejecutado con llama.cpp. El proceso consistió en destilación de razonamiento a nivel de secuencia: las cadenas de pensamiento completas del teacher se usaron como objetivos de SFT, con `completion_only_loss`, 1 época y 850 completaciones del teacher. El resultado se fusionó a bf16 y se injertó el head MTP (`nextn`) desde el modelo base.

La cuantización ROCmFPX es la innovación principal: una mezcla role-aware donde los expertos MoE se cuantizan a 2-bit (Q2_0_ROCMFPX) mientras que los componentes críticos para la coherencia (atención, embeddings, expertos compartidos y capa de salida) se mantienen en Q6_0_ROCMFPX, con normas en F32. Este enfoque es el análogo en llama.cpp/ROCmFPX de la idea OTQ de eschamoe: cuantizar agresivamente los expertos preservando la precisión de la atención. El modelo resultante ocupa 12GB en disco, dejando ~4GB de VRAM para el pool de KV en una GPU de 16GB.

## Capacidades

- Generación de texto conversacional y completado de secuencias.
- Razonamiento de secuencia heredado del teacher abliterated mediante destilación.
- Soporte de MTP (Multi-Token Prediction) con head `nextn`, sujeto al soporte del runtime para decodificación especulativa.
- Solo texto; sin capacidades de visión ni audio.
- No dispone de tool calling robusto ni capacidades agenticas fiables, según las limitaciones declaradas por el autor.
- Compatible con la API OpenAI a través de `llama-server` (endpoint `/v1`).

## Casos de uso

- Investigación sobre cuantización extrema en modelos MoE: permite estudiar el impacto de cuantizar expertos a 2-bit mientras se preserva la atención en Q6, comparando la coherencia frente a cuantizaciones uniformes.
- Evaluación de pipelines de destilación de razonamiento en modelos de gran tamaño: el artefacto documenta un flujo reproducible (destilar con QLoRA → injertar MTP → cuantizar con ROCmFPX) que puede servir de referencia para experimentos similares.
- Pruebas de concepto de inferencia local en GPU de 16GB: con 12GB de peso y ~4GB para contexto, es viable ejecutar sesiones de contexto largo (hasta 32K) o varias sesiones cortas en paralelo en una RTX 4080/4090 o similar.
- Benchmarking de calidad frente a tamaño en modelos cuantizados: permite comparar el rendimiento de un MoE de 35B cuantizado a 2-bit frente al modelo base sin cuantizar o frente a otros formatos GGUF.
- Desarrollo de runtimes con soporte ROCmFPX: el repositorio incluye instrucciones de compilación (pinned commit `b2f5829`) y un script de build, útil para validar implementaciones de cuantización FPX.
- Exploración de técnicas de abliteración de corpus: el modelo transfiere las características del teacher abliterated sobre el corpus de entrenamiento, ofreciendo un caso de estudio sobre los límites de esta técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la informacion disponible. La unica evaluacion mencionada es una prueba interna de 10 tareas donde el modelo destilado (antes de cuantizar) empató con su base (6/10 frente a 6/10). No hay datos de MMLU, HumanEval, GSM8K ni otras metricas comparativas.

## Requisitos de hardware

- VRAM estimada: 12GB para el modelo cuantizado; se recomienda una GPU de 16GB para dejar ~4GB libres para el pool de KV y contexto.
- GPU recomendadas: tarjetas de consumo con 16GB de VRAM, como RTX 4080, RTX 4090, o equivalentes AMD con soporte ROCm.
- No cabe en GPUs de 8GB; el modelo está diseñado específicamente para el rango de 16GB.
- Opciones de despliegue: `llama-server` con runtime ROCmFPX (compilado desde el pinned commit `b2f5829`), exponiendo una API compatible con OpenAI en `http://127.0.0.1:8080/v1`.
- Latencia y throughput: no disponibles. El autor advierte que contexto y concurrencia comparten el pool de KV, por lo que se debe elegir entre una sesión de contexto largo (`-c 32768 -np 1`) o varias sesiones cortas (`-c 8192 -np 8`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Distill-35B-A3B-Coder-Abliterated (este) | 35,5B totales, ~3B activos | hasta 32K (sugerido) | Q2/Q6 ROCmFPX | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B totales, ~3B activos | no disponible | bf16 original | Apache-2.0 | safetensors en HF |
| Qwen3.8-27B (teacher, abliterated) | 27B | no disponible | Q8_0 GGUF | Apache-2.0 | GGUF en HF |

No se dispone de datos suficientes para comparar con otros modelos MoE cuantizados de rango similar en GPU de 16GB. La comparacion principal es contra el modelo base sin cuantizar, del cual este artefacto es una derivacion experimental.

## Limitaciones y advertencias

- Es un proof-of-concept declarado por el autor, no un modelo de produccion.
- No hay ganancia de precision sobre el modelo base: la evaluacion interna mostro un empate (6/10 frente a 6/10) antes de cuantizar.
- La cuantizacion a 2-bit degrada la calidad; el autor advierte que el modelo "intercambia calidad por ajuste" (fit).
- Debil en tool calling y tareas agenticas, debido al corpus de destilacion limitado (850 completaciones).
- El termino "abliterated" se refiere solo al corpus de entrenamiento transferido desde el teacher; no es un modelo globalmente abliterated.
- Solo texto; sin soporte de vision ni audio.
- Requiere un runtime especifico con soporte ROCmFPX, compilado desde un commit concreto (`b2f5829`); no funciona con llama.cpp estandar.
- El head MTP (`nextn`) esta presente pero la decodificacion especulativa depende del soporte del runtime.
- Sin datos de benchmarks publicos, lo que dificulta evaluar su rendimiento real frente a alternativas.
- Descargas y likes en HuggingFace son cero, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lord-H4D3ZS/Qwen3.8-Distill-35B-A3B-Coder-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- BUILD.md (instrucciones de compilacion del runtime ROCmFPX): disponible en el repositorio del modelo
- Script de build `build_rocmfpx.sh`: disponible en el repositorio del modelo
