# local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD

## Resumen

Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD es un checkpoint multimodal de 96.486 millones de parametros publicado por local-inference-lab, una organizacion sin animo de lucro. No se trata de un modelo entrenado desde cero, sino de una recompresion y recuantizacion de un checkpoint base del mismo nombre, orientada a reducir el espacio en disco y habilitar inferencia en precisiones bajas (NVFP4 y MXFP8) sobre hardware compatible con el formato ModelOpt de NVIDIA. El pipeline declarado es `image-text-to-text`, por lo que cubre entrada de imagen y texto y salida de texto.

La relevancia tecnica del checkpoint esta en su contrato de almacenamiento: usa cuantizacion NVFP4 con escalas de bloque E4M3 para los expertos enrutados del decodificador, MXFP8 para las proyecciones de atencion, y compresion sin perdidas (codec `byte-window4-fixed-stream-u24-exceptions/1`) de las 73.728 matrices de escalas de bloque de los expertos. Ademas incluye pesos de vision en precision mixta (NVFP4 para lineales MLP y merger, MXFP8 para atencion) y una cabeza MTP (multi-token prediction) con expertos en NVFP4. El repo ocupa 205,1 GB repartidos en 21 shards de safetensors de aproximadamente 5 GB cada uno.

Es importante senalar que el autor declara explicitamente que no se han ejecutado pruebas de inferencia en GPU ni evaluaciones de calidad multimodal sobre este checkpoint; la validacion se limita a integridad criptografica (SHA-256) y a la reconstruccion exacta de las escalas comprimidas. Esto lo convierte en un artefacto interesante para investigacion de cuantizacion y despliegue en vLLM, pero no en una opcion validada para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador con expertos enrutados tipo MoE, cabeza MTP, torre de vision); detalles completos no disponibles |
| Parametros totales | 96.486.615.005 (96,49 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas E4M3 por bloque de 16 y escalas globales FP32), MXFP8 (E4M3 con escalas UE8M0 por 32 pesos), BF16 y FP32 para tensores no convertidos |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License 1.0 (lil-license-1.0), licencia "other" con terminos upstream heredados |
| Formato de pesos | safetensors (21 shards, indice `model.safetensors.index.json`), escalas comprimidas en streams `.nvfp4_csf_fixed` (uint8) y `.nvfp4_csf_exceptions` (uint32) |

## Arquitectura y entrenamiento

El checkpoint es una recuantizacion post-entrenamiento de un modelo base identificado con el mismo nombre. La arquitectura subyacente es un transformer multimodal con decodificador que incorpora expertos enrutados (mezcla de expertos), una cabeza MTP con sus propios expertos en NVFP4, y una torre de vision con 54 matrices de atencion en MXFP8 y 56 matrices lineales de MLP y merger en NVFP4, mas 223 tensores en BF16 (normalizaciones, sesgos, embeddings posicionales y convoluciones). Los pesos de vision ocupan 326.652.352 bytes (311,52 MiB), lo que supone un ahorro de 544,75 MiB frente a la fuente en BF16, excluyendo workspaces, activaciones y cache KV.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. Lo que si documenta el autor es el proceso de cuantizacion: los expertos enrutados del decodificador usan NVFP4 con valores E2M1, escalas de bloque E4M3 y escalas globales/de entrada en FP32; la atencion usa MXFP8 con seleccion de proyeccion fijada a la fuente; y las escalas de bloque de los expertos se comprimen sin perdidas con el codec CSF, que reconstruye los bytes originales de escala de forma exacta. La validacion cubre hashes SHA-256 de cada tensor y shard, coincidencia byte a byte de los tensores retenidos con la entrada fijada (revision `ac1c8d8edfb88a41df837e8ca431e0ec237c139d`), reconstruccion independiente de cada escala comprimida y comprobacion del empaquetado y redondeo NVFP4 de vision contra una referencia E2M1 independiente.

## Capacidades

- Generacion de texto y conversacion multimodal: el pipeline `image-text-to-text` indica soporte de entrada de imagen junto con texto y salida textual.
- Procesamiento de imagenes: la torre de vision esta cuantizada pero funcional segun el contrato de pesos, con atencion MXFP8 y MLP en NVFP4.
- Prediccion multi-token (MTP): la presencia de una cabeza MTP con expertos NVFP4 sugiere soporte de decodificacion especulativa o prediccion de varios tokens por paso, aunque el autor no documenta su uso en runtime.
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado en la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en cuantizacion de precisión ultra-baja: el checkpoint sirve como caso de estudio de NVFP4 con escalas E4M3 y compresion sin perdidas de escalas, permitiendo reproducir el pipeline CSF y medir el impacto de la cuantizacion en calidad frente al modelo base.
- Despliegue en vLLM con cuantizacion ModelOpt: el autor documenta compatibilidad con el loader estandar de safetensors de vLLM y el metodo `modelopt_mixed`, de modo que se puede servir el modelo sin formatos de carga especificos ni configuracion en la raiz del checkpoint.
- Evaluacion de modelos multimodales en entornos con VRAM limitada: al reducir el peso de los pesos de vision a 311,52 MiB y usar NVFP4 en los expertos, el checkpoint facilita experimentos de image-text-to-text en GPUs con menos memoria que las necesarias para BF16.
- Benchmarking de kernels b12x: el checkpoint esta preparado para que la capa de cuantizacion entregue escalas TP-locales a los kernels b12x, lo que permite medir throughput y latencia de kernels NVFP4/MXFP8 en hardware Blackwell.
- Pruebas de integridad y cadena de suministro de modelos: los hashes SHA-256 por tensor y shard y la reconstruccion exacta de escalas comprimidas permiten usar el checkpoint como referencia en pipelines de verificacion de artefactos.
- Prototipado de asistentes visuales en investigación: util para validar flujos de imagen y texto en laboratorio antes de comprometerse con un modelo mayor o con pesos en BF16, siempre acompanado de una evaluacion de calidad propia dado que el autor no la ha realizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han ejecutado pruebas de inferencia en GPU ni evaluaciones de calidad multimodal sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repo ocupa 205,1 GB en disco con cuantizacion NVFP4/MXFP8; la VRAM necesaria dependera del paralelismo de tensor, del tamaño de la cache KV y de las activaciones, y no puede calcularse con precision sin conocer la longitud de contexto y el numero de parametros activos.
- GPU recomendadas: hardware compatible con NVFP4 y MXFP8 de NVIDIA (generacion Blackwell, p. ej. B200) y con kernels b12x; el autor menciona explicitamente los kernels b12x HC/PLE y la conversion en memoria de 100 tensores FP32 a BF16 por parte del loader de vLLM.
- Compatibilidad con GPU de consumo: no confirmada. La cuantizacion NVFP4 requiere soporte de hardware especifico; no se documenta funcionamiento en RTX 4090 ni en GPUs consumer.
- Opciones de despliegue: vLLM con el loader estandar de safetensors y cuantizacion `modelopt_mixed` (`quant_method: "modelopt"`, `quant_algo: "MIXED_PRECISION"`). No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han ejecutado pruebas de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de rendimiento que permitan establecer una comparacion con alternativas de tamano o tarea similares.

## Limitaciones y advertencias

- Ausencia de validacion funcional: el autor declara que no se han ejecutado pruebas de inferencia en GPU ni evaluaciones de calidad multimodal; la validacion se limita a integridad de hashes y reconstruccion de escalas.
- Dependencia de hardware especifico: NVFP4 y MXFP8 requieren soporte de hardware y kernels (b12x) que no estan disponibles en todas las GPUs; el checkpoint no es portable a cualquier acelerador.
- Licencia restrictiva: la Local Inference Lab License 1.0 es una licencia "other" con terminos upstream heredados; es imprescindible revisar `LICENSE`, `NOTICE` y `LICENSES/` antes de cualquier uso comercial.
- Idiomas no declarados: la model card no especifica idiomas soportados, lo que impide garantizar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un checkpoint recuantizado de un modelo base no identificado publicamente en detalle, estos riesgos heredan del modelo original y no pueden evaluarse con los datos aportados.
- Contexto desconocido: la longitud de contexto no esta disponible, lo que limita la planificacion de memoria y el diseno de aplicaciones con conversaciones largas.
- Naturaleza de cuantizacion post-entrenamiento: la recuantizacion a NVFP4/MXFP8 puede degradar la calidad respecto al modelo en BF16; no se aportan metricas de dicha degradacion.
- Conversión en memoria de normalizaciones: el loader de vLLM convierte 100 tensores FP32 a BF16 en memoria, lo que introduce una discrepancia controlada respecto a los bytes almacenados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Revision fijada de la fuente: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD/tree/ac1c8d8edfb88a41df837e8ca431e0ec237c139d
- Licencia (referencia en el repo): LICENSE, NOTICE y LICENSES/ dentro del repositorio de Hugging Face
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
