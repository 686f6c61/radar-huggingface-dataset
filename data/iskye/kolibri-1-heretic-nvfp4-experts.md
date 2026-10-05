# iSkye/Kolibri-1-heretic-NVFP4-Experts

## Resumen

Kolibri-1-heretic-NVFP4-Experts es una cuantizacion de 4 bits del checkpoint `iSkye/Kolibri-1-heretic`, que a su vez es una version "abliterated" (decensored) del modelo Kolibri-1 de Aleph Alpha. El autor, iSkye, ha re-cuantizado unicamente los expertos enrutados del MoE de FP8 a NVFP4 (pesos en FP4 E2M1 con escalas de grupo), manteniendo el resto del checkpoint heretico bit a bit. El resultado ocupa 45,8 GB en repositorio (42,6 GiB segun el autor) frente a los 74 GB de la version FP8, y esta pensado para servir en una unica NVIDIA DGX Spark (GB10).

El modelo es un transformer con arquitectura Mixture-of-Experts: 384 expertos enrutados distribuidos en 50 capas, mas expertos compartidos. El recuento real de parametros en safetensors es de 40.354.338.560 (unos 40,35 mil millones), aunque la informacion disponible no desglosa cuantos de ellos son parametros activos por token. Los idiomas documentados son aleman e ingles, y la licencia es Apache-2.0.

Su relevancia ahora es doble: por un lado demuestra una receta de cuantizacion mixta (FP8 por bloques para atencion y expertos compartidos, NVFP4A16 solo para expertos enrutados) que reduce el peso del modelo casi a la mitad con una penalizacion de perplejidad declarada del 2-3 %; por otro, sirve como caso de estudio de un modelo con los rechazos eliminados mediante Heretic, con implicaciones evidentes de seguridad y responsabilidad para quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE); 384 expertos enrutados en 50 capas mas expertos compartidos |
| Parametros totales | 40.354.338.560 (40,35 mil millones), segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 solo pesos (FP4 E2M1, grupo 16, escalas de grupo FP8 E4M3, escala global fp32) en expertos enrutados; FP8 por bloques 128x128 en q/k/v/o de atencion y expertos compartidos; router, normas, embeddings y LM head sin cambios; activaciones en BF16 |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (grupos mixtos FP8 por bloques + NVFP4A16) |

## Arquitectura y entrenamiento

La arquitectura es la del Kolibri-1 original de Aleph Alpha: un transformer decoder con capas MoE donde los expertos enrutados concentran la mayor parte del peso. En este repositorio el autor no ha reentrenado nada; parte del checkpoint `iSkye/Kolibri-1-heretic`, que a su vez deriva de `Aleph-Alpha/Kolibri-1` (FP8 con bloques de 128x128). La abliteracion del paso intermedio se hizo con Heretic (proyecto ARA, LoRA de rango 50 fusionada) y afecto unicamente a `self_attn.o_proj` y `mlp.shared_experts.down_proj`.

La innovacion tecnica de este checkpoint es puramente de compresion: los expertos enrutados se re-cuantizaron de FP8 a NVFP4 mediante redondeo al mas cercano a partir del maximo por grupo, sin datos de calibracion y manteniendo las activaciones en BF16. La cuantizacion se genero con compressed-tensors 0.17.0 mediante el script `tools/quantize_experts_nvfp4.py`. Como Heretic nunca toco los expertos enrutados, estos son bit-identicos a los del checkpoint `iSkye/Kolibri-1-NVFP4-Experts`; la unica diferencia entre ambos repositorios esta en `o_proj` y en el `down_proj` de los expertos compartidos. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento: la model card indica que el "reasoning split" funciona igual que en el modelo original.
- Soporte de tool calling / function calling, con parser dedicado (`--tool-call-parser kolibri1`) y eleccion automatica de herramienta (`--enable-auto-tool-choice`).
- Modo de razonamiento con parser especifico (`--reasoning-parser kolibri1`), lo que permite separar el bloque de pensamiento de la respuesta final.
- Capacidades multilingues limitadas a aleman e ingles segun los metadatos del repositorio.
- Modelo "abliterated": responde a peticiones que el modelo original rechaza (3/100 rechazos en la evaluacion de Heretic, frente a 100/100 del original).
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Despliegue en hardware compacto: con 42,8 GiB en GPU cabe en una unica DGX Spark (GB10) y permite servir un MoE de 40,35 mil millones de parametros sin repartirlo entre varias tarjetas, algo inviable en la version FP8 de 73,6 GiB.
- Generacion de texto en aleman e ingles de forma conversacional: el modelo esta evaluado explicitamente con textos de referencia en ambos idiomas, con perplejidades de 2,398 (aleman memorizado) y 1,258 (ingles memorizado) sobre plantilla de chat.
- Agentes con llamada a herramientas: el soporte de tool calling y de parser de razonamiento permite integrarlo en flujos multi-paso donde el modelo decide que funcion invocar y separa su traza de razonamiento de la salida final.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para medir el coste real de pasar expertos de FP8 a NVFP4 manteniendo el resto del checkpoint intacto, gracias a la tabla de perplejidades publicada.
- Investigacion sobre alineacion y seguridad: la comparacion entre el original (100/100 rechazos) y la version heretica (3/100) es un caso practico para estudiar el efecto de la abliteracion sobre el comportamiento de rechazo y sobre la calidad del modelo.
- Servicio de alto rendimiento en un solo nodo: con 272 tok/s agregados a 8 flujos en el kernel Marlin NVFP4 MoE, es adecuado para cargas de inferencia concurrentes de tamano medio en un unico acelerador.
- Prototipado con vLLM: al usar `compressed-tensors` y el plugin `aleph-alpha-inference`, se integra en el mismo stack de servicio (vLLM 0.30.0, cache KV en FP8) sin necesidad de reescribir el pipeline.

## Benchmarks y rendimiento

Perplejidad sobre textos de referencia dentro de la plantilla de chat (valores NVFP4: media de 3 ejecuciones, porque el kernel Marlin MoE no es bit-determinista):

| Texto | FP8 original | FP8 heretic | NVFP4 heretic |
|---|---|---|---|
| Aleman, memorizado | 1,675 | 2,327 | 2,398 |
| Ingles, memorizado | 1,126 | 1,221 | 1,258 |
| Aleman, escrito de nuevo | 8,385 | 9,548 | 9,734 |
| Ingles, escrito de nuevo | 13,78 | 13,97 | 14,31 |

Rendimiento medido en una DGX Spark (GB10), vLLM 0.30.0, expertos en el kernel Marlin NVFP4 MoE y cache KV en FP8:

| Metrica | Heretic FP8 | Heretic NVFP4 |
|---|---|---|
| Tokens/s en un solo flujo | ~48 | 54 |
| Tokens/s agregados a 8 flujos | ~179 | 272 |
| Memoria en GPU | 73,6 GiB | 42,8 GiB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 42,8 GiB en GPU segun el autor (mas la cache KV, que en la receta de referencia va en FP8).
- GPU recomendadas: NVIDIA DGX Spark (GB10), para la que esta disenado y medida la receta. Por el consumo de memoria, tambien encajaria en GPUs con 48 GB o mas, como RTX 6000 Ada, A100 80 GB, H100 80 GB o B200, aunque el autor solo documenta la GB10.
- No cabe en GPUs de consumo con 24 GB (RTX 4090) ni con 32 GB (RTX 5090), dado que el peso del modelo por si solo ocupa 42,8 GiB.
- Opciones de despliegue: vLLM 0.30.0 con el plugin `aleph-alpha-inference` 1.0.0 instalado con `--no-deps`, variable `VLLM_USE_DEEP_GEMM=0`, `--kv-cache-dtype fp8` y los parsers `kolibri1`. En DGX Spark se documenta un script `start.sh` (con `ABLIT=1`) en el repositorio de la receta.
- Latencia y throughput: 54 tok/s en un unico flujo y 272 tok/s agregados a 8 flujos en la DGX Spark, frente a ~48 y ~179 tok/s de la version FP8 en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Memoria en GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iSkye/Kolibri-1-heretic-NVFP4-Experts | 40,35 mil millones | Expertos enrutados NVFP4, resto FP8 por bloques | 42,8 GiB (medido) | Apache-2.0 | HuggingFace, libreria vLLM |
| iSkye/Kolibri-1-heretic | 40,35 mil millones (misma base) | FP8 por bloques 128x128 | 73,6 GiB (medido) | Apache-2.0 | HuggingFace |
| iSkye/Kolibri-1-NVFP4-Experts | 40,35 mil millones (misma base) | Expertos NVFP4, sin abliterar | no disponible | Apache-2.0 | HuggingFace |
| Aleph-Alpha/Kolibri-1 | 40,35 mil millones (misma base) | FP8 por bloques 128x128 | 73,6 GiB (referencia indirecta) | Apache-2.0 | HuggingFace |

No se dispone de datos de contexto ni de benchmarks comparativos frente a modelos de otros fabricantes de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: se le ha eliminado la mayor parte del comportamiento de rechazo. Responde a peticiones que el modelo original declina; la evaluacion de Heretic reporta 3/100 rechazos frente a 100/100 del original. El uso indebido es responsabilidad exclusiva de quien despliega el modelo.
- Perdida de calidad medible: el NVFP4 anade un 2-3 % de perplejidad sobre el checkpoint heretico en FP8, y la abliteracion en si cuesta mas, especialmente en aleman (8,385 a 9,734 en aleman escrito de nuevo, un 16 % mas).
- El kernel Marlin MoE NVFP4 no es bit-determinista, por lo que las salidas pueden variar ligeramente entre ejecuciones.
- Idiomas documentados unicamente aleman e ingles; no hay datos sobre el comportamiento en castellano ni en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que impide dimensionar correctamente la cache KV en produccion.
- Compatibilidad fragil del stack: el plugin `aleph-alpha-inference` 1.0.0 fija vLLM `<0.30`, pero la receta lo instala con `--no-deps` sobre vLLM 0.30.0 asumiendo que el codigo usado no ha cambiado. Cualquier actualizacion de vLLM puede romper el servicio.
- La cuantizacion se hizo sin datos de calibracion (redondeo al mas cercano desde el maximo por grupo), lo que puede penalizar mas en dominios alejados de la distribucion de referencia que en los textos de la tabla de perplejidad.
- Licencia Apache-2.0: permite uso comercial, pero al ser una version modificada de `Aleph-Alpha/Kolibri-1` conviene revisar la model card original para usos previstos, evaluacion, riesgos y limitaciones adicionales.
- Riesgo de alucinacion inherente a un modelo de este tamano: no hay datos de evaluacion de fidelidad factual en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iSkye/Kolibri-1-heretic-NVFP4-Experts
- Checkpoint base heretico: https://huggingface.co/iSkye/Kolibri-1-heretic
- Checkpoint NVFP4 sin abliterar: https://huggingface.co/iSkye/Kolibri-1-NVFP4-Experts
- Modelo original: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Receta de servicio en DGX Spark: https://github.com/15ky3/Kolibri-1-DGX-Spark
- Script de cuantizacion: https://github.com/15ky3/Kolibri-1-DGX-Spark/blob/main/tools/quantize_experts_nvfp4.py
- Heretic: https://heretic-project.org
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- Plugin de inferencia de Aleph Alpha: https://github.com/Aleph-Alpha/aleph-alpha-inference
- Sitio de Aleph Alpha: https://aleph-alpha.com

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; todos los enlaces anteriores proceden de la model card del repositorio.
