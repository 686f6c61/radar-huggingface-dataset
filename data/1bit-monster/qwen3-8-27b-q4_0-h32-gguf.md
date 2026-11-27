# 1bit-MONSTER/Qwen3.8-27B-Q4_0-H32-GGUF

## Resumen

Qwen3.8-27B-Q4_0-H32-GGUF es una cuantizacion de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario 1bit-MONSTER. No se trata de un GGUF convencional: los pesos de las multiplicaciones matriciales han sido rotados mediante una transformada de Walsh-Hadamard de 32 puntos, lo que permite ejecutar el modelo con pesos de 4 bits y activaciones de 4 bits (W4A4) en las unidades matriciales de la GPU manteniendo una degradacion de calidad reducida respecto al modelo completo en BF16.

El paquete esta disenado especificamente para la ruta de prompt-processing del motor propietario 1bit engine sobre hardware AMD Strix Halo (Ryzen AI Max+ 395 con Radeon 8060S), usando una build ROCm concreta. El modelo base Qwen3.8-27B cuenta con 27.320.697.856 parametros y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 15,9 GB y el archivo GGUF principal pesa 15.182 MiB, lo que equivale a 4,66 bits por peso.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion poco habitual (rotacion Hadamard aplicada a activaciones para viabilizar W4A4); por otro, advierte de una incompatibilidad critica, ya que llama.cpp estandar carga el archivo pero produce resultados incorrectos porque no aplica la rotacion correspondiente a las activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion, FFN, delta-net y proyeccion MTP (detalle completo no disponible); cuantizacion con rotacion Walsh-Hadamard de 32 puntos |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con rotacion Hadamard (W4A4) en 456 tensores de atencion, FFN y proyecciones alpha/beta de delta-net; ssm_out en Q5_K; cabeza de salida en Q6_K; proyeccion MTP en Q8_0; normas y convoluciones en F32; media de 4,66 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo, con metadato `onebit.hadamard_q4_0 = 32`) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que no se proporcionan en la informacion disponible detalles sobre composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO. La model card de esta cuantizacion menciona componentes de atencion, FFN, una "delta-net" con proyecciones alpha/beta, una proyeccion MTP (multi-token prediction) y un modulo `ssm_out`, lo que sugiere una arquitectura hibrida con componentes de espacio de estados, aunque no se confirma explicitamente.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion: partiendo del Q8_0 de unsloth/Qwen3.8-27B-GGUF y de su imatrix, se aplica una rotacion Walsh-Hadamard de 32 puntos a los pesos antes de cuantizarlos a Q4_0. La rotacion se aplica tambien a las activaciones en tiempo de inferencia, lo que mantiene las activaciones de 4 bits proximas a las del modelo completo y reduce el error respecto a un W4A4 sin rotacion. El resultado medido: PPL de 6,096 y KLD medio de 0,055 frente a BF16, frente a 6,241 y 0,084 del W4A4 sin rotacion. El script de generacion es `tools/hadamard_q4_0.py`, invocado sobre el Q8_0 con la imatrix de Unsloth.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-27B (no se detallan capacidades especificas en la informacion disponible).
- Prompt processing de alta velocidad: 509 tok/s en pp512 y 440-470 tok/s con un prompt de 1.838 tokens en Strix Halo.
- Decodificacion funcional pero lenta en esta ruta: aproximadamente 11 tok/s.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Procesamiento de prompts largos en local sobre Strix Halo: gracias a los 440-470 tok/s de prompt processing, es adecuado para tareas de resumen, extraccion de informacion o clasificacion sobre documentos extensos donde el coste dominante es la fase de prefill.
- RAG con contexto largo en hardware de escritorio: el modelo cabe en 15,2 GB y se ejecuta en la GPU integrada Radeon 8060S, lo que permite montar un pipeline de recuperacion y generacion sin GPU dedicada, siempre que el volumen de generacion sea moderado.
- Evaluacion y experimentacion con cuantizacion W4A4: sirve como referencia practica para investigadores que quieran medir el impacto de la rotacion Hadamard en calidad (KLD, PPL) frente a cuantizaciones convencionales.
- Asistentes conversacionales de baja concurrencia: con 11 tok/s de decodificacion, es viable para uso individual o prototipos, no para atencion al cliente con multiples usuarios simultaneos.
- Banchmarking de hardware AMD: util para validar el rendimiento de la ruta ROCm lean del motor 1bit en Ryzen AI Max+ 395 antes de desplegar cargas mayores.
- Tareas de codigo en lote: si se combina con la ruta Vulkan y el drafter DFlash2 recomendados por el autor (45,7 tok/s en codigo), puede emplearse para generacion de codigo por lotes, aunque en ese caso el archivo a usar es el GGUF de Unsloth, no este.

## Benchmarks y rendimiento

Datos medidos por el autor en Strix Halo el 2026-09-28, con KLD frente a BF16 sobre wikitext-2 (40 x 512) y pp512 con llama-bench (ub 512):

| Qwen3.8-27B | pp512 (tok/s) | PPL | KLD medio | Mismo token top-1 |
|---|---|---|---|---|
| Q4_0, int8 exacto | ~400 | 6,021 | 0,029 | 91,9% |
| Q4_0, W4A4 sin rotacion | 461-488 | 6,241 | 0,084 | 87,4% |
| Este archivo, W4A4 con rotacion | 509 | 6,096 | 0,055 | 89,3% |

A traves de `1bit serve`: 440-470 tok/s con un prompt de 1.838 tokens. Decodificacion en esta ruta: aproximadamente 11 tok/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el archivo GGUF pesa 15.182 MiB (unos 14,8 GiB); se necesita memoria unificada o VRAM suficiente para cargarlo completo mas el overhead del motor.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max+ 395, GPU Radeon 8060S) con memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el modelo esta pensado para la ruta ROCm lean del motor 1bit en Strix Halo.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer NVIDIA; llama.cpp estandar carga el archivo pero produce resultados incorrectos.
- Despliegue: exclusivamente mediante `1bit serve` con una build compilada con `-DONEBIT_LEAN=ON -DONEBIT_LEAN_ROCM=ON`. No es compatible con vLLM, TGI, Ollama ni llama.cpp sin modificaciones.
- Throughput medido: 509 tok/s en pp512, 440-470 tok/s en prefill de 1.838 tokens, ~11 tok/s en decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (Q4_0-H32) | 27,3B | GGUF W4A4 con rotacion | no disponible | Apache-2.0 | Solo motor 1bit en Strix Halo; 509 tok/s pp512 |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | GGUF convencional | no disponible | Apache-2.0 | Compatible con llama.cpp; el autor lo recomienda para decodificacion via ruta Vulkan con DFlash2 (45,7 tok/s en codigo) |
| Qwen/Qwen3.8-27B (BF16) | 27,3B | safetensors | no disponible | Apache-2.0 | Referencia de calidad; requiere mucho mas memoria |

No se dispone de datos de benchmarks de calidad para comparar con otras familias de modelos del mismo tamano.

## Limitaciones y advertencias

- Incompatibilidad critica: llama.cpp estandar carga el archivo pero calcula resultados incorrectos, porque no aplica la rotacion Hadamard a las activaciones. Solo funciona con la build ROCm lean del motor 1bit.
- Dependencia de hardware: disenado para AMD Strix Halo; no se documenta funcionamiento en otras GPUs.
- Decodificacion lenta: ~11 tok/s en esta ruta, insuficiente para interacciones fluidas o alta concurrencia. El propio autor recomienda otro GGUF para cargas con mucha generacion.
- Perdida de calidad respecto a BF16: KLD medio de 0,055 y 89,3% de coincidencia en el token top-1; no es equivalente al modelo completo.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Longitud de contexto no documentada en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; se heredan los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero la viabilidad practica queda limitada por la dependencia del motor y del hardware especificos.
- Modelo con muy poca traccion (41 descargas, 0 likes en el momento de la consulta): ecosistema y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-Q4_0-H32-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen e imatrix: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Familia de modelos 1bit: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada de la familia: https://huggingface.co/1bit-MONSTER#start-here
- Documentacion de la build lean: docs/lean.md en el repositorio del motor
