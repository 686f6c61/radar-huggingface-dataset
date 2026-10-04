# fyb1214/Huihui-Qwen3.8-27B-Abliterated-Swift-1.5-GSQ-RCO-NInfer

## Resumen

Este repositorio no contiene un entrenamiento nuevo, sino un reempaquetado de formato: toma la serie GGUF ya abliterada y cuantizada de huihui-ai (Huihui-Qwen3.8-27B-abliterated, tier Swift-1.5 GSQ-RCO) y la introduce en contenedores monolíticos `.ninfer` para el motor de inferencia NInfer. El autor es fyb1214. El modelo subyacente es Qwen3.8-27B, un transformer multimodal de 27B parámetros con torre de visión, 64 capas y una mezcla de atención linear/full en proporción 4:1, al que se han aplicado dos transformaciones sucesivas: un fine-tune Swift 1.5 con GSQ-RCO y una abliteración (eliminación de la dirección de rechazo) sobre las capas 22 a 52.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de 27B multimodal en GPUs de consumo con ~16 GB de VRAM (RTX 5070 Ti, 5080, 5090) gracias a la cuantización IQ2_XS de 8,34 GiB de pesos. Por otro, sirve como banco de pruebas para decodificación especulativa: el contenedor incluye la cabeza MTP (multi-token prediction) y el proposal head, de modo que el motor puede acelerar la generación sin archivos adicionales. Cada `.ninfer` es autocontenido: torre de texto, torre de visión, MTP, tokenizer, plantilla de chat y recursos de procesamiento de medios.

El atractivo para investigación es que se trata de un modelo con el filtrado de seguridad notablemente reducido, pensado explícitamente para entornos controlados y no para producción ni para aplicaciones de cara al público. El repositorio se publica por niveles de cuantización de forma incremental; solo el tier IQ2_XS está disponible en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: 64 capas con mezcla de atencion linear/full en proporcion 4:1, torre de vision y cabeza MTP (multi-token prediction) con proposal head |
| Parametros totales | 27B (segun la denominacion del modelo; la model card no publica el recuento exacto) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Bloques GGUF: `gguf_iq1_m`, `gguf_iq1_s`, `gguf_iq2_s`, `gguf_iq2_xs`, `gguf_iq2_xxs`, `gguf_iq3_s`, `gguf_iq3_xxs`, `gguf_iq4_xs`, `gguf_q2_k`, `gguf_q4_k`, `gguf_q6_k`. Torre de vision: `q4/q5_g64_fp16` y `q8_g32_fp16` (recodificada por grupos desde el mmproj en BF16). Tiers: IQ2_XS publicado; IQ2_S, IQ3_XXS e IQ3_S pendientes |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (este repositorio). El fine-tune upstream Swift 1.5 se distribuye bajo Swift Open License v1.0, que permite redistribucion con atribucion |
| Formato de pesos | `.ninfer` (contenedor NInfer, layout `gguf_blocks_v1`), derivado de GGUF; no compatible con los artefactos ternarios `PQ2_0_G128` / `PTQ1_0_G128` |

Otros datos del repositorio: tamano total 9,4 GB; fichero `huihui_swift15_iq2xs_mtp.ninfer` de 9.411.869.440 bytes (8,76 GiB en disco, 8,34 GiB de pesos); inventario de 1192 tensores mas 6 recursos; pipeline declarado `image-text-to-text`; libreria `ninfer`; descargas y likes registrados: 0.

## Arquitectura y entrenamiento

La cadena de procedencia tiene cuatro eslabones. El modelo base es Qwen/Qwen3.8-27B (Apache-2.0). Sobre el se aplico el fine-tune Swift 1.5 con GSQ-RCO de ukisai (Swift Open License v1.0). Despues, huihui-ai ablitero el modelo: elimino la direccion de rechazo en las capas 22 a 52 (indexacion 0-based), dejando intactas la cabeza MTP y la torre de vision. Finalmente, fyb1214 repaqueteo los bloques GGUF en contenedores `.ninfer` mediante la receta `qwen3_8_27b_gguf`.

El repaqueteo es una conversion de formato pura: los tensores de texto se importan literalmente desde los bloques GGUF de origen (`import_encoded`, `cast_direct`, `grouped_absmax`), sin recuantizacion de la torre de texto, sin reentrenamiento y sin ablacion adicional. Los tensores de vision si se recodifican por grupos a partir del mmproj en BF16. El SHA-256 del GGUF de origen se verifico contra el digest LFS de huihui-ai antes de convertir, y el fichero `huihui_swift15_iq2xs_mtp.ninfer.conversion.json` registra objeto por objeto el tensor de origen, el metodo, el formato y el layout, cuadrando con el inventario del GGUF fuente.

El detalle tecnico mas relevante para el rendimiento es la inclusion de la cabeza MTP y el proposal head dentro del propio contenedor, lo que habilita decodificacion especulativa (etiqueta `speculative-decoding`) sin adaptadores ni parches externos. La mezcla 4:1 de atencion linear y atencion completa reduce el coste de la ventana larga en las capas linear. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generacion de texto y razonamiento en ingles y chino, heredados de Qwen3.8-27B.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`): la torre de vision se incluye en el contenedor, recodificada desde el mmproj en BF16.
- Decodificacion especulativa mediante cabeza MTP y proposal head integradas, con el objetivo de aumentar el throughput de generacion.
- Ejecucion en cuantizacion agresiva (IQ2_XS, 8,34 GiB de pesos) manteniendo el layout de bloques GGUF, lo que permite desplegar un modelo de 27B en GPUs de consumo.
- Generacion sin filtrado de rechazo en el rango de capas abliterado (22-52), orientada a escenarios de investigacion sobre comportamiento de modelos.
- Soporte de plantilla de chat y tokenizer empaquetados, junto con los recursos del procesador de medios, lo que simplifica la integracion en el motor NInfer.
- Razonamiento multi-paso y uso de herramientas: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como se comporta un transformer de 27B cuando se elimina la direccion de rechazo en 31 capas concretas, comparando respuestas contra el modelo base sin abliterar y contra la version GGUF de huihui-ai.
- Red-teaming y evaluacion de seguridad: util como generador adversarial controlado en pipelines internos de pruebas, siempre en entornos aislados y sin exposicion publica, dado que el propio autor declara que el filtrado de seguridad esta muy reducido.
- Inferencia local en GPU de consumo: con 8,34 GiB de pesos en IQ2_XS, encaja en equipos Windows con 16 GB de VRAM objetivo (RTX 5070 Ti, 5080, 5090) usando el motor NInfer con CUDA 13, segun el repositorio de la receta de conversion.
- Experimentacion con decodificacion especulativa: al incluir la cabeza MTP y el proposal head en el mismo contenedor, sirve para medir ganancias de throughput frente a decodificacion autoregresiva estandar sin montar infraestructura adicional.
- Analisis de imagenes con descripcion en chino o ingles: la torre de vision empaquetada permite tareas de image-text-to-text en local, por ejemplo clasificacion o resumen de contenido visual en flujos de investigacion.
- Reproducibilidad de conversiones de formato: el fichero de conversion con 1192 tensores y 6 recursos, mas `SHA256SUMS`, permite auditar que el repaqueteo `.ninfer` no altera los pesos del GGUF de origen, util para validar cadenas de custodia de modelos.
- Pruebas de cuantizacion extrema: comparar la calidad del tier IQ2_XS con los tiers IQ2_S, IQ3_XXS e IQ3_S a medida que se publiquen permite caracterizar la degradacion por debajo de 3 bits en un modelo de 27B multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y las busquedas web realizadas no aportan metricas del modelo abliterado ni de este repaqueteo. Tampoco se publican medidas de latencia o throughput del motor NInfer para este contenedor concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el tier IQ2_XS ocupa 8,76 GiB en disco (8,34 GiB de pesos). A esa cifra hay que sumar la cache KV, los buffers del runtime y la torre de vision, por lo que el objetivo declarado por el ecosistema de la receta es una GPU de ~16 GB de VRAM.
- GPU recomendadas por el autor de la receta de conversion: RTX 5070 Ti, RTX 5080 y RTX 5090, en Windows con CUDA 13. No hay datos publicados para A100, H100 u otras GPUs de centro de datos.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas de VRAM segun el objetivo del proyecto; no se especifica el comportamiento en GPUs de 12 GB o menos.
- Opciones de despliegue: motor NInfer, y exclusivamente una build que lea el layout `gguf_blocks_v1`. Los formatos ternarios `PQ2_0_G128` / `PTQ1_0_G128` no son intercambiables con este contenedor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La cabeza MTP esta pensada para decodificacion especulativa, pero no se publican cifras de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fyb1214/…-GSQ-RCO-NInfer (este) | 27B | no disponible | `.ninfer`, layout `gguf_blocks_v1` | apache-2.0 (repo); upstream Swift bajo Swift Open License v1.0 | Solo tier IQ2_XS publicado |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | no disponible | GGUF | apache-2.0 | Repositorio de origen; incluye los tiers Swift-1.5 usados aqui |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors y variantes | apache-2.0 | Modelo original sin abliterar; con filtrado de seguridad intacto |
| huihui-ai/Qwen3-8B-abliterated | 8B | no disponible | no disponible | no disponible | Alternativa abliterada de menor tamano de la misma familia de autor |

Las diferencias clave frente al GGUF de origen no estan en los pesos, sino en el contenedor: este repositorio unifica torre de texto, torre de vision, MTP, tokenizer y recursos en un unico fichero, y exige un motor NInfer especifico. Frente al Qwen3.8-27B original, la diferencia es la abliteracion de las capas 22-52. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas opciones.

## Limitaciones y advertencias

- El filtrado de seguridad esta significativamente reducido respecto al modelo base. El autor advierte que las salidas pueden ser sensibles, controvertidas o inapropiadas, y que el modelo no es apto para entornos de cara al publico, para uso por menores ni para aplicaciones que requieran alta seguridad.
- Sesgos conocidos: no disponible en la informacion proporcionada mas alla de la advertencia generica sobre contenido inapropiado.
- Riesgo de alucinacion: no se publican evaluaciones especificas. La cuantizacion IQ2_XS (por debajo de 3 bits por peso) es propensa a degradar la fidelidad de las respuestas frente a cuantizaciones mayores; no hay datos que cuantifiquen esa perdida en este modelo.
- Idiomas: solo ingles y chino declarados. No hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de ventana larga.
- Restricciones de licencia: el repositorio se declara Apache-2.0, pero la cadena incluye el fine-tune Swift 1.5 bajo Swift Open License v1.0 y el modelo base bajo Apache-2.0. Para uso comercial hay que revisar el fichero `NOTICE` y verificar el cumplimiento de la Swift Open License v1.0, que exige atribucion.
- Dependencia de motor: el contenedor exige una build de NInfer que lea `gguf_blocks_v1`. No funciona con llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue y el soporte de la comunidad.
- Uso previsto declarado: investigacion e inferencia local. No validado para produccion ni para sistemas criticos de seguridad.
- Estado incompleto: los tiers IQ2_S, IQ3_XXS e IQ3_S estaban pendientes de publicacion; la disponibilidad de cuantizaciones de mayor calidad no esta garantizada.
- Adopcion nula: cero descargas y cero likes en el momento de redactar la ficha, sin evidencia de uso o validacion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fyb1214/Huihui-Qwen3.8-27B-Abliterated-Swift-1.5-GSQ-RCO-NInfer
- Modelo GGUF de origen (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo abliterado en Transformers (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Receta de conversion y motor NInfer para Qwen3.8-27B GSQ-RCO: https://github.com/Ryan-gsq/ninfer-16g-5070ti-5080-5090-qwen3.8-27b-gsq-rco
- Repositorio base del motor (fork de origen): https://github.com/iamwavecut/ninfer-all
- Espejo en ModelScope: https://www.modelscope.cn/models/fyb423/Huihui-Qwen3.8-27B-Swift-1.5-GSQ-RCO-NInfer
- Ficha de referencia del modelo abliterado: https://abliteratedmodels.org/qwen3.8-27b-abliterated/
- Manifiesto espejo en GitHub: https://github.com/Ahaa43443/huihui-qwen3.8-27b-abliterated-mirror/tree/main
- Alternativa abliterada de menor tamano (huihui-ai/Qwen3-8B-abliterated): https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
