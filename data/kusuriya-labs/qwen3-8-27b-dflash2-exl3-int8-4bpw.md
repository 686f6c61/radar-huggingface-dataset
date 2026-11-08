# kusuriya-labs/Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw

## Resumen

Este repositorio contiene una cuantizacion EXL3-INT8 a 4.0 bits por peso (bpw) del modelo borrador DFlash 2 de z-lab, publicado originalmente por inco.ai como `incoai/Qwen3.8-27B-DFlash2`. No es un modelo de lenguaje autonomo: es un draft model disenado para decodificacion especulativa, que propone tokens que el modelo objetivo `Qwen/Qwen3.8-27B` verifica despues. El resultado generado es, por tanto, la salida greedy del modelo objetivo, no la del borrador.

El modelo tiene 627.313.920 parametros reales (segun los tensores safetensors) y el repo ocupa 1.3 GB, con un `model.safetensors` de 1.17 GiB frente a los 3.58 GiB del original en BF16. La cuantizacion afecta a 36 lineales (la capa `fc` y las Q/K/V/O y gate/up/down de las 5 capas), mientras que 45 tensores pequenos (norms, convoluciones dinamicas, selector de candidatos) permanecen en BF16. Las embeddings y el LM head no forman parte del borrador: el runtime las toma del modelo objetivo.

Su relevancia es doble. Por un lado, demuestra que se puede cuantizar un draft model de decodificacion especulativa sin degradar la aceptacion de borradores ni la fidelidad de la salida, con una mejora de velocidad del 6,1 por ciento en la configuracion medida. Por otro, es un artefacto de nicho: el formato EXL3-INT8 no es cargable por ExLlamaV3 upstream, SGLang ni vLLM, y el runtime que lo soporta (`shelf`, para AMD gfx1201) aun no ha publicado la carga de borradores cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (`DFlash2DraftModel`), modelo borrador para decodificacion especulativa sobre Qwen3.8-27B |
| Parametros totales | 627.313.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 4.0 bpw (trellis, codebook multiplier `0x00DCD12D`); tensores auxiliares en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con esquema EXL3-INT8 (`.trellis`, `.suh`, `.svh`, `.mul1`); no compatible con Transformers, vLLM, SGLang ni ExLlamaV3 upstream |

## Arquitectura y entrenamiento

El modelo base es DFlash 2, un borrador de decodificacion especulativa asociado a Qwen3.8-27B. La arquitectura concreta (`DFlash2DraftModel`) no esta detallada en la informacion disponible, pero incluye una capa `fc`, cinco capas con proyecciones Q/K/V/O y gate/up/down, normas, convoluciones dinamicas y un selector de candidatos. El borrador no incorpora embeddings ni LM head propios: el runtime los toma del modelo objetivo, lo que explica que sus 627 millones de parametros sean mucho menores que los del modelo verificado.

La cuantizacion se realizo sin calibracion. El `convert.py` estandar del build ROCm de ExLlamaV3 no reconoce esta arquitectura y la calibracion requeriria los hidden states intermedios del modelo objetivo, de modo que los pesos se cuantizaron con el cuantizador de bajo nivel directamente: K=4, escalas de salida activadas, busqueda de escala global a partir de muestras de pesos, trellis de Viterbi y la ruta de respaldo que se usa cuando no hay matriz Hessiana disponible, con el multiplicador `0x00DCD12D`. El autor senala que una conversion calibrada, recogiendo hidden states reales del objetivo y las entradas por lineal, deberia ser al menos igual de buena, pero no se ha llevado a cabo.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Qwen3.8-27B; no genera texto de forma autonoma.
- Preserva la salida greedy del modelo objetivo: en la evaluacion, los ids generados fueron identicos a los de la decodificacion no especulativa en 16 de 16 prompts.
- Aceptacion de borradores del 98,3 por ciento respecto al borrador original en BF16 (2.884 borradores aceptados por ronda frente a 2.933).
- Cobertura de categorias de prompt variadas: chat, codigo, edicion de ficheros, JSON, matematicas, prosa, razonamiento y resumen (categorias de BetterBench).
- No soporta tool calling, agentes ni capacidades multimodales por si mismo; cualquier funcionalidad de ese tipo depende del modelo objetivo.
- Capacidades multilingues: no disponibles como dato propio; heredadas del modelo objetivo, no documentadas en esta ficha.

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-27B en hardware AMD: el borrador se carga junto al objetivo en el runtime `shelf` sobre gfx1201 y reduce el tiempo de decodificacion por ronda, con un coste de GPU de 5,42 ms por ronda frente a 8,48 ms del BF16.
- Despliegue con restricciones de VRAM en Radeon AI PRO R9700: al ocupar 1,17 GiB en lugar de 3,58 GiB, libera aproximadamente 2,4 GiB que pueden destinarse al modelo objetivo o a mayor cache KV.
- Servicio de chat y asistencia conversacional: la evaluacion incluye prompts de chat y prosa con hasta 512 tokens nuevos, donde el borrador mantiene la fidelidad de salida del objetivo.
- Generacion de codigo y edicion de ficheros en pipelines internos: las categorias de code y file edit de BetterBench estan cubiertas en la evaluacion, con salida identica al greedy no especulativo.
- Produccion de JSON estructurado: la categoria json de la evaluacion confirma que la decodificacion especulativa no altera la estructura de la salida verificada.
- Razonamiento y matematicas en entornos de investigacion: util para medir el impacto de la cuantizacion de borradores en tareas sensibles a la fidelidad token a token.
- Reproduccion de experimentos de decodificacion especulativa: sirve como referencia para comparar borradores BF16, FP8 y EXL3-INT8 4 bpw sobre el mismo objetivo y hardware.

## Benchmarks y rendimiento

Evaluacion con el runtime `shelf` en una AMD Radeon AI PRO R9700 (gfx1201), objetivo Qwen3.8-27B EXL3-INT8 4 bpw, decodificacion greedy, `--dflash2-drafts 7`, 16 prompts de categorias BetterBench y hasta 512 tokens nuevos, una ejecucion por prompt:

| Modelo borrador | Borradores aceptados / ronda | tok/s de decodificacion | Ids generados frente a greedy no especulativo |
|---|---:|---:|---|
| BF16 original | 2,933 | 69,13 | identicos (16/16) |
| EXL3-INT8 4 bpw (este modelo) | 2,884 (98,3 % de BF16) | 73,35 (+6,1 %) | identicos (16/16) |
| FP8 (repo hermano) | 2,939 | 73,19 (+5,9 %) | identicos (16/16) |

El tiempo de GPU del borrador por ronda fue de 8,48 ms en BF16 y 5,42 ms en esta version. La diferencia de velocidad procede de una sola ejecucion por prompt y no se ha validado estadisticamente; en el subconjunto de prompts con una segunda repeticion, los ids generados y los recuentos de borradores aceptados coincidieron con la primera.

## Requisitos de hardware

- VRAM para el borrador: 1,17 GiB en EXL3-INT8 4 bpw, frente a 3,58 GiB en BF16.
- VRAM total: hay que sumar la del modelo objetivo Qwen3.8-27B en EXL3-INT8 4 bpw y la cache KV; la informacion disponible no detalla esa cifra.
- GPU validada: AMD Radeon AI PRO R9700 (gfx1201). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado; el runtime `shelf` esta descrito para gfx1201 y no se documenta soporte en otras arquitecturas.
- Opciones de despliegue: unicamente el runtime `shelf`; ExLlamaV3 upstream, SGLang, vLLM, llama.cpp, Ollama y TGI no pueden cargar este formato.
- Latencia y throughput: 5,42 ms de GPU por ronda para el borrador y 73,35 tok/s de decodificacion en la configuracion medida.
- Estado de disponibilidad: la carga de borradores cuantizados en `shelf` no se ha publicado; no existe runtime publico para este formato en el momento de redactar la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Borradores aceptados / ronda | tok/s | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| EXL3-INT8 4 bpw (este modelo) | 627 M | EXL3-INT8 safetensors | 2,884 | 73,35 | Apache-2.0 | `shelf` (no publicado) |
| DFlash2 BF16 (z-lab) | 627 M | safetensors BF16 | 2,933 | 69,13 | Apache-2.0 | `shelf` |
| DFlash2 FP8 (kusuriya-labs) | 627 M | FP8 | 2,939 | 73,19 | Apache-2.0 | `shelf` |

No se dispone de datos de otros borradores de decodificacion especulativa para Qwen3.8-27B en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: sin el modelo objetivo Qwen3.8-27B y un runtime de decodificacion especulativa no produce salida util.
- El formato EXL3-INT8 no es cargable por ExLlamaV3 upstream, SGLang ni vLLM; el unico runtime compatible (`shelf`) no ha publicado la funcionalidad de carga de borradores cuantizados.
- La cuantizacion se hizo sin calibracion, mediante la ruta de respaldo sin Hessiana; el autor espera que una conversion calibrada sea al menos igual de buena, pero no se ha verificado.
- La mejora de velocidad del 6,1 por ciento procede de una sola ejecucion por prompt y carece de validacion estadistica.
- Solo se ha evaluado en una GPU AMD Radeon AI PRO R9700 (gfx1201); el comportamiento en otro hardware es desconocido.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar la salida del modelo objetivo, los sesgos relevantes son los de Qwen3.8-27B.
- Riesgo de alucinacion: no aplica al borrador por si mismo, ya que el objetivo verifica cada token; la fidelidad medida fue del 100 por ciento en los 16 prompts evaluados.
- Idiomas y longitud de contexto: no disponibles en la ficha del modelo.
- Licencia Apache-2.0, sin restricciones adicionales documentadas para uso comercial, aunque la ausencia de runtime publico limita de facto su explotacion en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo hermano en FP8: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-FP8
- Referencia del formato EXL3-INT8: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw
