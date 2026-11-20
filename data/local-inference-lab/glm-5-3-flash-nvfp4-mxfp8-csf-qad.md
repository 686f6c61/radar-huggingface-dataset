# local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD

## Resumen

GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD es un checkpoint multimodal de tipo image-text-to-text publicado por local-inference-lab, una organizacion sin animo de lucro. Se trata de una cuantizacion de precision mixta del modelo GLM-5.3-Flash, orientada a reducir el peso en disco y el coste de inferencia mediante NVFP4 en los expertos enrutados del decodificador y del modulo MTP, MXFP8 en las proyecciones de atencion y una mezcla de NVFP4/MXFP8/BF16 en la torre de vision.

El checkpoint emplea QAD (quantization-aware distillation) en los pesos de los expertos del decodificador y compresion sin perdidas de las escalas de bloque E4M3 mediante un codec propio denominado CSF (`byte-window4-fixed-stream-u24-exceptions/1`). El modelo completo ocupa 174.939.049.131 parametros y el repositorio pesa 915,7 GB, distribuido en 36 shards de safetensors de aproximadamente 5 GB cada uno.

Es relevante porque demuestra un pipeline de cuantizacion agresiva (4 y 8 bits) sobre un modelo multimodal de gran tamano manteniendo la compatibilidad con el cargador estandar de vLLM y el metodo `modelopt_mixed`, sin necesidad de formatos de carga especificos. No obstante, el propio autor advierte de que no se ha ejecutado inferencia en GPU ni evaluacion de calidad multimodal sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador con expertos enrutados tipo MoE, modulo MTP y torre de vision); arquitectura base GLM-5.3-Flash, detalles no disponibles |
| Parametros totales | 174.939.049.131 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas E4M3 por grupo de 16), MXFP8 (E4M3 con escalas UE8M0 por 32 pesos), BF16 para tensores no convertidos; metodo `modelopt` con `quant_algo: MIXED_PRECISION` |
| Idiomas soportados | en, zh |
| Licencia | lil-license-1.0 (Local Inference Lab License, Version 1.0) |
| Formato de pesos | safetensors (36 shards), indexados por `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint parte de GLM-5.3-Flash y aplica una receta de cuantizacion de precision mixta. Los expertos enrutados del decodificador se almacenan en NVFP4 (valores E2M1, escalas de bloque E4M3 y escalas globales/de entrada en FP32) con pesos obtenidos mediante quantization-aware distillation (QAD). Las proyecciones de atencion del decodificador usan MXFP8 seleccionado desde la fuente fijada. Los expertos enrutados del modulo MTP se guardan en NVFP4 con activaciones BF16 y escalas de bloque almacenadas directamente.

La torre de vision combina tres regimenes: las lineales de atencion usan MXFP8 (E4M3 con escalas UE8M0 por cada 32 pesos, 48 matrices) y activaciones dinamicas; las lineales de MLP y merger usan NVFP4 (E2M1 con escalas E4M3 por cada 16 pesos y escala global FP32, 76 matrices) con activaciones BF16; el resto de tensores de vision (223, incluyendo normalizaciones, sesgos, embeddings posicionales y convoluciones) permanecen en BF16. Los pesos de vision ocupan 390.629.680 bytes (372,53 MiB), un ahorro de 702,50 MiB frente a la fuente BF16.

La innovacion principal es la compresion sin perdidas de las escalas de bloque E4M3 de los 36.288 matrices de expertos enrutados del decodificador principal mediante el codec CSF, que reconstruye exactamente los bytes originales. El resto de escalas (MTP, vision, PLE, MXFP8, globales y de activacion) no se comprimen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Procesamiento de imagenes y texto combinados, gracias a la torre de vision en precision mixta.
- Razonamiento y decodificacion con modulo MTP (multi-token prediction), segun la presencia de expertos enrutados MTP en el checkpoint.
- Soporte multilingue limitado a ingles y chino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue multimodal en produccion con vLLM: el checkpoint usa el cargador estandar de safetensors y el metodo `modelopt_mixed`, por lo que puede servirse con las herramientas habituales de vLLM sin adaptadores de carga especificos.
- Asistentes de analisis de documentos con imagenes: la torre de vision cuantizada a NVFP4/MXFP8 permite procesar capturas, diagramas y documentos escaneados junto a texto en ingles o chino.
- Inferencia con requisitos estrictos de almacenamiento: los 36 shards de aproximadamente 5 GB y la compresion CSF de escalas reducen el peso en disco frente a una version BF16 equivalente, util en clusters con almacenamiento limitado.
- Servicio de chat multilingue en ingles y chino: el modelo esta orientado a conversacion y cubre ambos idiomas, adecuado para atencion al cliente en esos mercados.
- Experimentacion en investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible para estudiar QAD, NVFP4/MXFP8 y compresion sin perdidas de escalas en modelos multimodales de gran tamano.
- Evaluacion comparativa de precision mixta: util para medir el impacto de NVFP4 en expertos frente a MXFP8 en atencion sobre la calidad de salida, aunque el autor no ha publicado dicha evaluacion.
- Pipeline de decodificacion especulativa con MTP: los expertos MTP en NVFP4 permiten integrar el modulo de prediccion multi-token en despliegues que lo aprovechen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado inferencia en GPU ni evaluacion de calidad multimodal sobre este checkpoint.

La unica validacion publicada es de integridad: todos los tensores y shards pasaron verificacion SHA-256, los tensores retenidos coinciden byte a byte con la entrada fijada, cada escala comprimida paso reconstruccion sin perdidas independiente y el empaquetado y redondeo NVFP4 de vision se comprobo contra una referencia E2M1 independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 915,7 GB y el checkpoint tiene 174.939 millones de parametros; con cuantizacion de 4-8 bits el peso en memoria seria del orden de decenas a centenares de GB, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada. El checkpoint esta pensado para entornos con vLLM y soporte de NVFP4/MXFP8 (hardware Blackwell o equivalente), aunque el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamano del modelo (174,9 mil millones de parametros) no cabe en una unica GPU de consumo.
- Opciones de despliegue: vLLM con el cargador estandar de safetensors y cuantizacion `modelopt_mixed`, preparando escalas TP-locales para b12x. Los runtimes GLM que fuerzan la torre de vision a BF16 deben habilitar las recetas de precision mixta explicitas, incluidas las proyecciones QKV de atencion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD (este) | 174.939.049.131 | no disponible | NVFP4 + MXFP8 + BF16 mixta | lil-license-1.0 | Hugging Face, 1518 descargas |
| GLM-5.3-Flash (fuente BF16) | no disponible | no disponible | BF16 | terminos upstream incluidos en LICENSES/ | referenciado como entrada fijada en la model card |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- No se ha ejecutado inferencia en GPU ni evaluacion de calidad multimodal sobre este checkpoint; el autor lo declara explicitamente.
- La cuantizacion NVFP4 en expertos y MXFP8 en atencion puede degradar la calidad frente al modelo BF16 original, aunque no hay mediciones publicadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados limitados a ingles y chino; no se declara soporte de castellano.
- Longitud de contexto no especificada en la model card.
- Licencia lil-license-1.0 con terminos propios; es necesario revisar `LICENSE`, `NOTICE` y `LICENSES/` antes de un uso comercial, ya que se mantienen los terminos upstream del modelo fuente.
- El checkpoint requiere runtimes con soporte de `modelopt_mixed` y de las recetas de precision mixta de vision; los runtimes que fuercen BF16 en la torre de vision deben configurarse explicitamente.
- El repositorio de 915,7 GB impone requisitos elevados de almacenamiento y ancho de banda para su descarga y despliegue.
- El campo `base_model` apunta al propio checkpoint (relacion `quantized`), lo que puede complicar la trazabilidad de la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD
- Revision fijada de la entrada: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD/tree/fd660d51d1fc3caae26a4bf31b7451475bbb9bdc
- Licencia: `LICENSE` dentro del repositorio (lil-license-1.0)
- Papers, blogs, repos y demos adicionales: no disponible en la informacion proporcionada
