# btbtyler09/shrew-ocr-v0.5-NVFP4-naive-test

## Resumen

shrew-ocr-v0.5-NVFP4-naive-test es un checkpoint experimental publicado por el usuario btbtyler09 en Hugging Face. Se trata de una cuantizacion NVFP4 (W4A4) del modelo shrew-ocr-preview v0.5, un modelo multimodal de tipo granite4_vision orientado a OCR, es decir, a la extraccion de texto a partir de imagenes. El checkpoint se ha generado con el esquema `nvfp4-pack-quantized` de la libreria compressed-tensors aplicando cuantizacion round-to-nearest sin datos de calibracion sobre las 280 capas lineales del modelo de lenguaje.

El propio autor lo etiqueta explicitamente como "test-only" y "not a release": no es un artefacto destinado a produccion ni a evaluacion de calidad, sino exclusivamente a mediciones de velocidad de servicio y de kernels. La model card advierte de que la calidad de salida no esta validada y de que el modelo tiende a entrar en bucles de generacion con mas frecuencia que la version FP8 calibrada.

El modelo cuenta con aproximadamente 3.997 millones de parametros (unos 4.000 millones) almacenados en 3,5 GB de repositorio, con licencia Apache 2.0 heredada del modelo base. Su relevancia es limitada para usuarios finales, pero resulta de interes para quienes investigan tecnicas de cuantizacion de 4 bits (NVFP4) sobre modelos multimodales y su impacto en el rendimiento de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | granite4_vision (transformer multimodal con torre de vision y modelo de lenguaje) |
| Parametros totales | 3.997.206.464 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, compressed-tensors `nvfp4-pack-quantized`), bloques de 16 con escalas de bloque e4m3 y una escala global fp32 por tensor; torre de vision, proyectores, lm_head, embeddings y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base shrew-ocr-preview v0.5 emplea la arquitectura granite4_vision, un diseno multimodal que combina una torre de vision con un modelo de lenguaje transformer para tareas de reconocimiento optico de caracteres. El checkpoint aqui descrito no introduce entrenamiento nuevo: es una cuantizacion del modelo base.

La cuantizacion aplicada es NVFP4 en modo W4A4 (pesos y activaciones a 4 bits) sobre las 280 capas lineales del modelo de lenguaje. Los pesos se agrupan en bloques de 16 elementos con escalas de bloque en formato e4m3 y una unica escala global fp32 por tensor, compartida entre los pares fusionados q/k/v y gate/up. Las escalas globales de activacion se toman de las escalas de entrada calibradas de shrew-ocr-preview-FP8. El proceso es round-to-nearest y no utiliza datos de calibracion propios. La torre de vision, los proyectores, el lm_head, los embeddings y las capas de normalizacion permanecen en bf16. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO del modelo base.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes, heredado del modelo base shrew-ocr-preview.
- Procesamiento multimodal imagen-texto mediante la torre de vision en bf16.
- Generacion de texto asociada a la extraccion de contenido de imagenes.
- El resto de capacidades especificas (tool calling, agentes, razonamiento multi-paso, multilingueismo, modo thinking) no estan documentadas en la informacion disponible.
- La calidad de las salidas de este checkpoint concreto no esta validada y el autor advierte de mayor tendencia a bucles de generacion que la version FP8.

## Casos de uso

- Medicion de velocidad de servicio en NVFP4: el checkpoint sirve para comparar throughput y latencia de kernels NVFP4 frente a las builds bf16 y FP8 del mismo modelo en un servidor de inferencia.
- Evaluacion de kernels de cuantizacion: util para desarrolladores de compressed-tensors o de runtimes de inferencia que necesiten validar la implementacion de `nvfp4-pack-quantized` sobre un modelo multimodal real de unos 4.000 millones de parametros.
- Pruebas de ocupacion de memoria: permite medir la huella de VRAM de un modelo OCR multimodal cuantizado a 4 bits en GPUs con soporte de NVFP4, comparandola con las versiones de mayor precision.
- Benchmarking de pipelines OCR de extremo a extremo: aunque la calidad no este validada, puede usarse para medir el coste computacional del pipeline completo (preprocesado de imagen, torre de vision, decodificacion) en escenarios de alta carga.
- Estudio de degradacion por cuantizacion sin calibracion: sirve como referencia negativa (round-to-nearest sin calibracion) frente a la futura build NVFP4 calibrada que el autor indica estar en desarrollo.
- Validacion de integridad de artefactos: el repositorio incluye `SHA256SUMS`, util para verificar la descarga y el despliegue de pesos en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,5 GB, por lo que el checkpoint cuantizado requiere del orden de 4 GB solo para pesos, mas el coste de activaciones, cache KV y buffers de la torre de vision en bf16. La cifra exacta no esta disponible.
- GPU recomendadas: se requiere hardware con soporte de NVFP4 (generaciones recientes de GPU de NVIDIA con kernels NVFP4). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: no disponible; depende del soporte de NVFP4 del hardware concreto.
- Opciones de despliegue: no disponibles en la informacion proporcionada. El uso de `custom_code` y compressed-tensors condiciona el runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| shrew-ocr-v0.5-NVFP4-naive-test | 3.997.206.464 | no disponible | NVFP4 W4A4 sin calibracion | Apache 2.0 | Test-only, no release |
| shrew-ocr-preview (bf16) | no disponible | no disponible | bf16 | Apache 2.0 | Build de referencia |
| shrew-ocr-preview-FP8 | no disponible | no disponible | FP8 calibrado | Apache 2.0 | Build de referencia |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con modelos OCR de terceros.

## Limitaciones y advertencias

- Checkpoint exclusivamente de prueba: el autor indica explicitamente que no debe usarse mas que para mediciones de kernels y velocidad de servicio.
- Calidad no validada: la cuantizacion round-to-nearest sin calibracion degrada la salida y el autor senala mayor tendencia a bucles de generacion que la build FP8.
- No es una release: la build NVFP4 calibrada esta en desarrollo por separado; esta version no la sustituye.
- Sesgos conocidos: no documentados en la informacion disponible, aunque se heredan los del modelo base.
- Riesgo de alucinacion: no cuantificado; agravado por la falta de calibracion y los bucles de generacion mencionados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero la calidad no validada desaconseja cualquier uso en produccion.
- Dependencia de `custom_code` y compressed-tensors: puede requerir versiones concretas de librerias y complicar el despliegue en runtimes estandar.

## Enlaces

- Hugging Face: https://huggingface.co/btbtyler09/shrew-ocr-v0.5-NVFP4-naive-test
- Modelo base: https://huggingface.co/btbtyler09/shrew-ocr-preview
- Build FP8 calibrada: https://huggingface.co/btbtyler09/shrew-ocr-preview-FP8
