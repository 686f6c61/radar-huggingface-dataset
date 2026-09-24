# inference-optimization/Qwen3-8B-DFlash-PerfectBlend-NVFP4-W4A4

## Resumen

Este repositorio contiene un drafter de decodificación especulativa DFlash cuantizado para el modelo objetivo Qwen3-8B, publicado por la organizacion inference-optimization a partir de RedHatAI/Qwen3-8B-speculator.dflash. No es un modelo de chat autonomo: su funcion es proponer secuencias cortas de tokens (hasta 7 por paso con `--spec-tokens 7`) que el modelo objetivo verifica en una unica pasada, de modo que el servicio genere mas tokens por segundo sin cambiar el modelo que determina la salida final.

La aportacion principal es la cuantizacion NVFP4 W4A4 (pesos de 4 bits con grupo de tamano 16 y activaciones de 4 bits local-dynamic) calibrada con un procedimiento PerfectBlend real sobre estados ocultos, entradas de tokens y mascaras de perdida alineados con Qwen3-8B (2.027 ejemplos, longitud de secuencia 2.048, semilla 0). El artefacto ocupa 0,9 GB y declara 1.179.882.368 parametros segun safetensors, con licencia Apache-2.0 y libreria `speculators`.

Es relevante ahora porque combina dos lineas activas de optimizacion de inferencia, la decodificacion especulativa y la cuantizacion de 4 bits en formato NVFP4, en un momento en el que el soporte nativo de FP4 es todavia incipiente: la evaluacion del autor en H100 se realizo con emulacion W4A4 y no se reclama rendimiento nativo Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash para el modelo objetivo Qwen3-8B; la arquitectura interna no se detalla en la model card |
| Parametros totales | 1.179.882.368 (~1,18 mil millones), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El drafter opera sobre el contexto del modelo objetivo; la calibracion uso secuencias de 2.048 tokens |
| Tipos de cuantizacion | NVFP4 W4A4: pesos de 4 bits con grupo de tamano 16 y activaciones de 4 bits local-dynamic; empaquetado `compressed-tensors` |
| Idiomas soportados | No disponible (depende del modelo objetivo; el drafter no documenta idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`compressed-tensors`) mas `config.py` con codigo personalizado (`custom_code`) |
| Tipo de artefacto | Drafter de decodificacion especulativa; no es un modelo de chat autonomo |
| Modelos base | `RedHatAI/Qwen3-8B-speculator.dflash` (drafter fuente) y `Qwen/Qwen3-8B` (objetivo) |
| Libreria | `speculators` |
| Metodo especulativo | `dflash` (`--spec-method dflash` en vLLM) |
| Tokens especulativos por paso | 7 (`--spec-tokens 7`) |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 (a fecha de la informacion disponible) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa: genera propuestas de tokens que el modelo objetivo Qwen3-8B valida en un unico forward pass. En una implementacion correcta, la distribucion de salida la determina el modelo objetivo y el drafter solo influye en la tasa de aceptacion y, por tanto, en el rendimiento. El artefacto se deriva del drafter DFlash de Red Hat AI y se cuantiza a NVFP4 W4A4 para reducir su huella de memoria; el repositorio incluye unicamente el componente drafter, no el modelo objetivo.

La calibracion es el elemento diferencial: se realizo un PerfectBlend "real" usando estados ocultos de Qwen3-8B alineados, entradas de tokens y mascaras de perdida, con una cache de 2.027 ejemplos preparados, longitud de secuencia 2.048 y semilla 0. El observador de pesos empleado es `nvfp4_expanded_mse`. Ni la cache ni los prompts estan incluidos en el repositorio, aunque sus recuentos y hashes de contenido se registran en `calibration_manifest.json`, y la configuracion de cuantizacion y las revisiones de origen en `quant_run_manifest.json`.

No se documenta en la model card el procedimiento de entrenamiento del drafter fuente (numero de tokens, composicion del dataset, si hubo RLHF/DPO). El directorio `provenance/` recoge el `train_command.txt` capturado del drafter original, un comando de cuantizacion marcado explicitamente como reconstruido, la instantanea del cuantizador y del codigo de calibracion, el comando de vLLM con su parche de runtime, los hashes de los checkpoints del objetivo y del drafter, y nueve comandos de evaluacion por subconjunto. En la evaluacion NVFP4 sobre H100 se uso emulacion W4A4; el autor no reclama rendimiento nativo de servicio NVFP4 en Blackwell.

## Capacidades

- Propuesta de tokens en borrador (hasta 7 por paso) para su verificacion por parte del modelo objetivo Qwen3-8B dentro de un flujo de decodificacion especulativa DFlash.
- Aceleracion de la decodificacion en vLLM mediante `--spec-model`, `--spec-method dflash` y `--spec-tokens 7`, siempre emparejado con el modelo objetivo.
- Reduccion de la huella de memoria del componente drafter: 0,9 GB de repositorio y cuantizacion de 4 bits, frente al drafter fuente sin cuantizar.
- Integracion con la libreria `speculators` y con un build de vLLM compatible con DFlash, que requiere el `config.py` y el parche de runtime incluidos en `provenance/evaluation/`.
- No genera texto de forma autonoma: no es un modelo de chat, no mantiene conversaciones ni produce respuestas finales por si mismo.
- No soporta por si mismo tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio; cualquier capacidad de ese tipo depende del modelo objetivo Qwen3-8B.
- Capacidades multilingues: no evaluadas ni documentadas para el drafter.

## Casos de uso

- Servicio de generacion de texto con Qwen3-8B en vLLM: emparejar este drafter con el objetivo y `--spec-method dflash` para aumentar los tokens generados por segundo en cargas de salida larga (chat, resumenes, redaccion), manteniendo la calidad final determinada por el modelo objetivo.
- Despliegue con restricciones de VRAM: al ocupar 0,9 GB, el drafter deja margen para servir el objetivo Qwen3-8B cuantizado y el drafter en una unica GPU de 24 GB, algo inviable con drafters de mayor tamano.
- Entornos multi-modelo o multi-tenant: un drafter de menos de 1 GB permite mantener varias instancias o compartir la GPU con otros servicios sin desplazar al modelo objetivo.
- Investigacion en cuantizacion de drafters: comparar la tasa de aceptacion y la calidad resultante de este artefacto NVFP4 W4A4 frente al drafter fuente `RedHatAI/Qwen3-8B-speculator.dflash` sin cuantizar, usando los mismos prompts y el mismo objetivo.
- Auditoria y reproducibilidad de experimentos de inferencia: los manifiestos, hashes de checkpoints, comandos de evaluacion por subconjunto y el comando de vLLM con parche permiten reconstruir el montaje experimental, aunque la cache de calibracion no sea redistribuible.
- Preparacion de despliegues en hardware Blackwell: usar este artefacto para validar la ruta NVFP4 cuando se disponga de servicio nativo de 4 bits, teniendo en cuenta que las cifras actuales corresponden a emulacion W4A4 en H100.
- Comparativa de metodos especulativos: servir Qwen3-8B alternando distintos drafters (DFlash, otros disponibles en el ecosistema `speculators`) para medir su impacto en latencia y aceptacion bajo la misma configuracion de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia una evaluacion completa del 24 de septiembre de 2026 y nueve comandos de evaluacion por subconjunto en `provenance/`, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de decodificacion especulativa (tasa de aceptacion, tokens por segundo, latencia por token). Tampoco se publican comparaciones numericas con el drafter fuente sin cuantizar.

## Requisitos de hardware

- VRAM del drafter: 0,9 GB de pesos en disco segun el tamano del repositorio (NVFP4 W4A4). La VRAM efectiva en inferencia es superior por activaciones y overhead; una estimacion razonable es del orden de 1 a 2 GB para el componente drafter, sin contar la cache KV del objetivo.
- El requisito dominante es el del modelo objetivo Qwen3-8B: aproximadamente 16 GB en BF16, en torno a 8-9 GB en FP8 y alrededor de 5-6 GB en cuantizacion de 4 bits (estimaciones habituales de despliegue, no cifras publicadas en esta model card).
- GPU de evaluacion: H100, con emulacion W4A4 para NVFP4. El autor advierte que el artefacto no acredita rendimiento nativo NVFP4 en Blackwell.
- NVFP4 nativo: requiere hardware Blackwell (familia B100/B200/GB200, RTX 50 y equivalentes profesionales). En GPUs sin soporte nativo de FP4 se depende de emulacion, con la penalizacion de rendimiento correspondiente.
- GPU de consumo: el drafter cabe con holgura en cualquier GPU moderna; servir el conjunto drafter mas objetivo Qwen3-8B cuantizado es factible en una RTX 4090 de 24 GB, aunque sin aceleracion FP4 nativa.
- Opciones de despliegue: vLLM con build compatible con DFlash, usando `vllm serve Qwen/Qwen3-8B --spec-model <drafter> --spec-tokens 7 --spec-method dflash`, junto con el `config.py` y el parche de runtime de `provenance/evaluation/`. No se documentan rutas de despliegue alternativas (llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y rendimiento: no disponible. No se publican cifras de tokens por segundo, latencia por token ni tasa de aceptacion, ni para el modo emulado ni para hardware con FP4 nativo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B-DFlash-PerfectBlend-NVFP4-W4A4 (este) | Drafter DFlash cuantizado | 1,18 mil millones (safetensors) | NVFP4 W4A4, calibracion PerfectBlend | No disponible | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| RedHatAI/Qwen3-8B-speculator.dflash | Drafter DFlash fuente, sin cuantizar | No disponible | No especificada | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-8B | Modelo objetivo de proposito general | 8B por denominacion (no confirmado en la informacion disponible) | Multiples formatos | No disponible en la informacion proporcionada | Consultar la model card del objetivo | HuggingFace |
| Qwen3-8B sin decodificacion especulativa | Linea base de decodificacion autoregresiva | 8B por denominacion | Segun despliegue | No disponible | Consultar la model card del objetivo | No aplica |

No hay datos de rendimiento comparativo (tasa de aceptacion, tokens por segundo, latencia) para ninguna de estas opciones en la informacion disponible. Otros drafters del ecosistema `speculators` (por ejemplo variantes tipo Eagle3 o Medusa) podrian ser alternativas, pero no se dispone de sus especificaciones ni de resultados en esta informacion.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar respuestas por si solo ni sustituir a Qwen3-8B. Cualquier uso fuera de un flujo de decodificacion especulativa con ese objetivo carece de sentido.
- Dependencia de una build especifica de vLLM compatible con DFlash, mas el `config.py` personalizado y un parche de runtime documentado en `provenance/evaluation/`. La integracion no es plug-and-play con versiones estandar.
- Discrepancia de nomenclatura: el titulo interno y el comando de ejemplo de la model card se refieren a "Blend4-NVFP4-W4A4", mientras que el identificador del repositorio es "PerfectBlend-NVFP4-W4A4". Conviene verificar el ID real antes de lanzar el servicio, ya que el comando del README apunta a un nombre distinto del repositorio.
- Ausencia de benchmarks: no hay cifras de calidad, latencia ni tasa de aceptacion, por lo que el impacto real de la cuantizacion del drafter no esta cuantificado publicamente.
- La evaluacion en H100 uso emulacion W4A4; no se debe esperar la ganancia de rendimiento del FP4 nativo en esa configuracion, y el autor no reclama rendimiento nativo en Blackwell.
- Reproducibilidad parcial de la calibracion: los prompts y la cache de estados ocultos no se distribuyen por no ser redistribuibles; solo se publican recuentos y hashes. Ademas, el comando de cuantizacion esta marcado como reconstruido.
- Inconsistencia de metadatos: las etiquetas del repositorio incluyen tanto `nvfp4` como `8-bit` y `compressed-tensors`, lo que puede inducir a confusion sobre el formato real de los pesos.
- Riesgo de alucinacion y sesgos: no evaluados en este artefacto. En un flujo especulativo correctamente implementado la distribucion de salida la determina el modelo objetivo, pero un fallo de implementacion o una verificacion mal configurada podria alterar los resultados.
- Licencia: Apache-2.0 para el drafter. El modelo objetivo Qwen3-8B tiene su propia licencia, que debe revisarse de forma independiente antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con publicacion reciente (24 de septiembre de 2026), por lo que carece de validacion comunitaria.
- La documentacion no especifica el contexto maximo soportado por el drafter, los idiomas admitidos ni el comportamiento con secuencias muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3-8B-DFlash-PerfectBlend-NVFP4-W4A4
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter fuente: https://huggingface.co/RedHatAI/Qwen3-8B-speculator.dflash
- Artefactos internos del repositorio: `config.py`, `quant_run_manifest.json`, `calibration_manifest.json` y el directorio `provenance/` (incluye `provenance/evaluation/`)
- La busqueda web realizada no aporto enlaces tecnicos relevantes: los resultados se limitaron a definiciones genericas del termino "inferencia" (Wikipedia, diccionarios), sin relacion con este modelo ni con la decodificacion especulativa.
