# sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw

## Resumen

Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw es un paquete de cuantizacion experimental en formato Sushi derivado de los pesos BF16 del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored (revision `e096800036ec20da7e2442dcd4044a004d4e99fa`). Lo publica el usuario sanasol2008 y no anade abliteracion ni fine-tuning propios: la abliteracion procede del checkpoint de origen. Esta pensado para ejecutarse con el motor Sushi sobre MLX en Apple Silicon, no como checkpoint generico de Transformers ni de ExLlamaV3.

El modelo conserva una arquitectura MoE con torre de vision y pesos MTP, y suma un sidecar de n-gramas en disco. Los expertos enrutados se cuantizan en EXL3 K2 con codebook MCG y ventana 15, el tronco denso en affine8 alli donde la referencia Sushi lo usa y la tabla de n-gramas en affine4 con grupo 32. El sufijo `2bpw` hace referencia a la tasa de bits de los expertos enrutados, no al conjunto de tensores ni a la media del tamano de fichero, y el autor no reclama equivalencia sin perdidas con BF16.

Su relevancia es doble: por un lado, demuestra que un modelo de unos 21.100 millones de parametros puede servirse en un Mac de 48 GiB de memoria unificada con streaming desde SSD y una ventana configurada de 262.144 tokens; por otro, documenta de forma inusualmente explicita los limites de la validacion (MTP no validado, video no validado, vision solo probada con un parche de motor concreto).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de vision y cabezas MTP, segun las etiquetas del repositorio |
| Parametros totales | 21.142.110.099 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados como techo en el servicio de referencia; no es una garantia medida de memoria ni de calidad a contexto completo |
| Tipos de cuantizacion | Expertos enrutados: EXL3 K2, codebook MCG, ventana 15 (incluye expertos MTP). Tronco denso: affine8 donde la referencia Sushi lo usa; el resto de tensores flotantes mantienen el dtype de referencia. Sidecar de n-gramas: affine4, grupo 32, en `ngram_table.bin`. Cache KV: cuantizacion de 8 bits (`--kv-quant 8`) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las pruebas de humo incluyen aritmetica y texto en ruso) |
| Licencia | qwen-community-license-1.0 (etiquetada como `license: other` en el repositorio) |
| Formato de pesos | safetensors en paquete Sushi, libreria MLX; incluye `ngram_table.bin` y tokenizer; descarga completa de aproximadamente 64,87 GiB |

## Arquitectura y entrenamiento

La informacion disponible no documenta el entrenamiento del modelo original: no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla es el proceso de conversion. Se parte de los pesos BF16 del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored y se aplica un cuantizador Sushi con calibracion de 64 filas por 1024 tokens. El conversor esta basado en ExLlamaV3 en el commit `151539c77abc7ab7425d30da7a4e8e3c5c154e7b`, con una adaptacion aislada del codificador MCG-ventana15 y despacho paralelo para expertos cuantizados junto a lineales en BF16. El cuantizador privado Sashimi y su receta de calibracion no se reproducen.

El resultado mezcla varios regimenes de precision: expertos enrutados en EXL3 K2, tronco denso en affine8 en los puntos donde la referencia Sushi lo aplica, tensores flotantes restantes en su dtype original y una tabla de n-gramas en affine4. Se conserva la torre de vision y los pesos MTP, aunque el autor advierte que la inferencia MTP no esta validada. El plegado de normas y los cambios de layout siguen la convencion Sushi, lo que implica que el paquete no es portable directamente a otros runners. La ventana de 262.144 tokens se configura con `--ctx-size` y `--prefill-chunk 2048`, con cache KV de 8 bits y un presupuesto de streaming de 22 GiB desde SSD.

## Capacidades

- Generacion de texto conversacional en modo multi-turno, con la ventana de contexto ampliada configurada a 262.144 tokens.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`): la torre de vision se conserva en el paquete y se ha probado OCR sobre imagen con transcripcion correcta de tres campos, incluidos todos los numeros, en una peticion de 915 tokens de prompt y 9,91 segundos.
- Tool calling: en la validacion se obtuvo correctamente una llamada `get_weather` con `city=Belgrade`.
- Razonamiento aritmetico basico y generacion de texto en ruso, segun las comprobaciones de humo del autor.
- Decodificacion con modo thinking desactivable; las mediciones de rendimiento se hicieron con `thinking off`.
- Soporte de decodificacion especulativa mediante n-gramas, a traves del sidecar `ngram_table.bin` de 29,8 GiB.
- Capacidades multilingues: no disponibles como lista declarada; solo hay evidencia puntual de texto en ruso.
- Capacidades de agente multi-paso: no documentadas de forma explicita mas alla del soporte de tool calling.
- Vision en streaming bajo expert streaming: solo validada con un motor Sushi parcheado, no con una release sin modificar.
- MTP y video: pesos presentes, inferencia no validada.

## Casos de uso

- Asistente conversacional local en Mac: con 22 GiB de presupuesto de streaming desde SSD, el modelo puede servirse en un equipo Apple Silicon de 48 GiB de memoria unificada mediante `sushi serve`, lo que permite desplegar un asistente privado sin GPU dedicada ni conexion a servicios externos.
- Procesamiento de documentos con OCR: la torre de vision retenida permite extraer texto y campos estructurados de imagenes, como demuestra la comprobacion de OCR que transcribio tres campos numericos en una sola peticion de 915 tokens.
- Agentes con llamada a herramientas: el tool calling verificado permite integrar el modelo en flujos donde debe decidir que funcion invocar y con que argumentos, por ejemplo consultas de clima o recuperacion de datos estructurados.
- Analisis de contexto largo en local: la ventana configurada de 262.144 tokens con cache KV de 8 bits y cache de prefijos en disco (10 GB) esta pensada para revisar repositorios, expedientes o transcripciones extensas en una sola pasada, asumiendo que el consumo de memoria crece con el contexto.
- Despliegue sobre almacenamiento en lugar de VRAM: el diseno con sidecar de n-gramas en disco y streaming de expertos encaja en escenarios donde el cuello de botella es la memoria unificada y no el ancho de banda de una GPU, por ejemplo notebooks de desarrollo con 48 GiB.
- Experimentacion con cuantizacion extrema: como paquete de investigacion, sirve para medir el impacto de 2 bits por peso en expertos enrutados sobre calidad y velocidad, comparando contra la referencia Sushi 2bpw en el mismo hardware.
- Pruebas de contenido sin rechazo: al heredar la abliteracion del checkpoint de origen, puede emplearse en entornos controlados donde se evalua el comportamiento de modelos sin capa de rechazo, siempre bajo la licencia qwen-community-license-1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Los unicos datos cuantitativos son mediciones de decodificacion y comprobaciones de humo.

Comparacion de decodificacion en texto, con servidores nuevos secuenciales, streaming de 22 GiB, KV8, contexto de 16k, chunk de prefill 512, 0 entradas de cache de prefijos, temperatura 0, thinking desactivado, mismo prompt de 40 tokens y 256 tokens generados:

| Paquete | Decodificacion en frio (tok/s) | Decodificacion en caliente, media de las ejecuciones 2-3 (tok/s) |
|---|---:|---:|
| Sushi 2bpw original | 22,89 | 31,60 |
| Este paquete derivado de BF16 | 16,78 | 26,48 |

Otras mediciones y comprobaciones reportadas:

| Prueba | Resultado |
|---|---|
| OCR sobre imagen | Transcripcion correcta de tres campos, incluidos todos los numeros; 915 tokens de prompt, 9,91 s de tiempo total de peticion |
| Tool calling | Devuelve `get_weather` con `city=Belgrade` |
| Texto en ruso y aritmetica | Correcto en la configuracion final de servicio |
| Suite de integracion HTTP del parche | No completamente en verde: ocho fallos tambien presentes en la base sin parchear; las comprobaciones especificas del parche pasaron |

El autor advierte que estas cifras corresponden a mediciones con prompt corto y cache de expertos, y no son representativas del rendimiento en agentes con contexto largo.

## Requisitos de hardware

- Plataforma: Apple Silicon exclusivamente. El paquete usa la libreria MLX y el motor Sushi; la construccion documentada exige Homebrew y Xcode 26.2 o superior con su toolchain de Metal.
- Equipo de referencia probado: Apple M3 Max con 48 GiB de memoria unificada, Sushi 1.1.1, MLX 0.32.3 y un parche local de vision en streaming sobre el commit `4d32cb0bb16802df1038d3fbc518f3d36d57c92e`.
- Memoria: no se publica una cifra de VRAM o memoria unificada minima para inferencia. El servicio de referencia usa `--ssd-budget-gb 22`, es decir, 22 GiB de streaming respaldado por SSD, y la descarga completa ocupa unos 64,87 GiB en disco, de los cuales 29,8 GiB corresponden al sidecar de n-gramas en disco.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles. El autor no documenta soporte CUDA ni despliegue en GPU discreta para este paquete.
- Opciones de despliegue: `sushi serve` (motor especifico del formato Sushi) sobre MLX. No es un checkpoint valido para ExLlamaV3 generico ni para Transformers, pese a usar safetensors como contenedor.
- Parametros de servicio de referencia: `--host 127.0.0.1 --port 12345 --ssd-budget-gb 22 --no-mtp --kv-quant 8 --ctx-size 262144 --prefill-chunk 2048 --metrics --max-tokens 8192 --prefix-cache-entries 2 --prefix-cache-mem 1GB --prefix-cache-disk 10GB --temp 1`.
- Throughput estimado: 16,78 tok/s en frio y 26,48 tok/s en caliente en el escenario de prueba descrito, por debajo de los 22,89 y 31,60 tok/s del paquete Sushi 2bpw original en el mismo hardware y configuracion.
- Memoria y latencia: crecen con el contexto y con las entradas de imagen; el techo de 262.144 tokens es una configuracion, no una medida de consumo real a contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Rendimiento medido |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw (este) | 21.142.110.099 | 262.144 configurados | EXL3 K2 + affine8 + affine4 | qwen-community-license-1.0 | Publico en HuggingFace, 21 descargas, 0 likes | 16,78 tok/s en frio, 26,48 tok/s en caliente |
| Sushi 2bpw original (paquete de referencia) | no disponible | no disponible | Sushi 2bpw | no disponible | Usado como referencia en la model card | 22,89 tok/s en frio, 31,60 tok/s en caliente |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (modelo base) | no disponible en BF16 en la informacion proporcionada | no disponible | BF16 | no disponible | Publico en HuggingFace | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables de la misma categoria y tamano en la informacion proporcionada, por lo que no es posible establecer una comparativa de calidad frente a otros modelos.

## Limitaciones y advertencias

- No es un checkpoint generico: se trata de un paquete Sushi especifico. No funciona como checkpoint estandar de ExLlamaV3 ni de Transformers, pese a distribuirse en safetensors.
- El sufijo `2bpw` solo describe la tasa de bits de los expertos enrutados, no de todos los tensores ni la media del tamano de fichero.
- El autor no reclama calidad equivalente a BF16 ni ausencia de perdidas por la cuantizacion.
- El cuantizador privado Sashimi y su receta de calibracion no se reproducen, lo que limita la reproducibilidad exacta del paquete.
- La abliteracion proviene del checkpoint de origen; el autor no ha caracterizado de forma independiente el comportamiento de rechazo en esta conversion.
- Vision en streaming: solo validada con un motor Sushi parcheado. Conservar los pesos de vision no elimina las restricciones de streaming de un motor sin modificar.
- MTP: pesos presentes, inferencia no validada y desactivada (`--no-mtp`) en la configuracion de servicio documentada.
- Video: inferencia no validada.
- El techo de 262.144 tokens es una configuracion, no una garantia de calidad ni de consumo de memoria a contexto completo; el uso de memoria crece con el contexto y con imagenes.
- Rendimiento por debajo del paquete Sushi 2bpw original en las mismas condiciones de prueba, y las cifras corresponden a prompts cortos con cache de expertos, no a cargas de agente con contexto largo.
- La suite de integracion del parche de vision no paso completamente en verde: ocho fallos presentes tambien en la base sin parchear.
- Soporte de hardware muy restringido: Apple Silicon con el motor Sushi, sin soporte CUDA documentado.
- La licencia qwen-community-license-1.0 esta etiquetada como `other` en el repositorio; deben revisarse sus terminos antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no hay informacion publicada en la model card disponible.
- Idiomas soportados: no declarados; la unica evidencia es una comprobacion puntual de texto en ruso.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo y no aportan informacion contrastable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Parche rebasado de vision en streaming (commit `7e8684f`): https://github.com/sanasol/sushi/commit/7e8684f56392ff31ecac6383646221083e3a9b04
- Version anterior del parche (commit `1671383`): https://github.com/sanasol/sushi/commit/167138370611750d8c9ef1060c816103be0e99b1
- Test de integracion HTTP de vision en streaming: https://github.com/sanasol/sushi/blob/7e8684f56392ff31ecac6383646221083e3a9b04/tests/test_qwen_streaming_vision.sh
- Repositorio del motor Sushi: https://github.com/sanasol/sushi
- Referencia de ExLlamaV3 usada por el conversor: commit `151539c77abc7ab7425d30da7a4e8e3c5c154e7b` (sin enlace directo en la informacion disponible)
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo.
