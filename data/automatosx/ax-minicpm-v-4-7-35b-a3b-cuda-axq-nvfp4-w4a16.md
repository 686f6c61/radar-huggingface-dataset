# AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16 es un empaquetado de cuantizacion del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicado por AutomatosX dentro de su linea de herramientas AXQuant. El modelo base es un modelo vision-lenguaje de tipo image-text-to-text con arquitectura MoE (mezcla de expertos), 35.212.875.824 parametros totales y un diseno hibrido que combina atencion estandar con capas de atencion lineal hibrida, segun se deduce de la politica de exportacion descrita en la model card.

El interes tecnico de este repositorio no reside en el modelo en si, sino en el formato de pesos: una exportacion de referencia NVFP4 RTN W4A16 con tamano de bloque 16, en la que se cuantizan 160 matrices 2D elegibles (40 de atencion y 120 de expertos) mientras que vision, merger, atencion lineal hibrida, normas, router, embeddings, LM-head y pesos de expertos 3D fusionados conservan la precision de origen. El resultado es un paquete de 69,9 GB en safetensors que documenta un experimento de cuantizacion, no un modelo listo para servir.

Es relevante ahora porque ejemplifica una tendencia creciente: la publicacion de artefactos intermedios de cuantizacion (NVFP4, MXFP4, MXFP8) para modelos MoE multimodales grandes, con trazabilidad explicita de que tensores se cuantizan y cuales no. Sin embargo, el propio autor advierte de que el paquete es evidencia de desarrollo y no un certificado de calidad: no se ha validado en tiempo de ejecucion CUDA, no se ha evaluado su calidad y no se reclama compatibilidad con ningun motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y atencion lineal hibrida (heredada del modelo base) |
| Parametros totales | 35.212.875.824 |
| Parametros activos | no disponible (el modelo base se denomina A3B, pero no se detalla el numero exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 RTN W4A16, tamano de bloque 16, activaciones declaradas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, 1.152 tensores indexados, 69,9 GB) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-35B-A3B emplea una arquitectura de mezcla de expertos con capas de atencion hibrida: la model card de la exportacion menciona explicitamente "hybrid linear-attention" como una de las familias de tensores que se mantienen en precision de origen. La exportacion cuantiza unicamente 160 matrices 2D elegibles (40 de atencion y 120 de expertos) mediante NVFP4 round-to-nearest con bloque de 16 y activaciones BF16, dejando intactos vision encoder, merger, normas, router, embeddings, LM-head y los pesos 3D fusionados de los expertos. No se indexaron tensores MTP.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. La exportacion se realizo con un backend de referencia en numpy sobre CPU, lo que implica que no hubo validacion en runtime CUDA ni pruebas de generacion. La model card senala que los hermanos MLX MXFP4 y MXFP8 fueron cargados con MLX-VLM 0.7.9 y superaron un smoke test sintetico de generacion de imagen, pero aclara que esa evidencia no aplica a este repositorio NVFP4.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline image-text-to-text declarado en los metadatos).
- Procesamiento multimodal: el modelo base integra un encoder de vision y un modulo merger que se conservan en precision completa en esta exportacion.
- Razonamiento y conversacion multiturno (etiqueta "conversational").
- Capacidades de video y MTP: no reclamadas por el autor en esta exportacion.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion NVFP4: el paquete sirve como referencia reproducible de que tensores de un MoE multimodal son elegibles para W4A16 y cuales deben mantenerse en BF16, util para disenar politicas de cuantizacion propias.
- Desarrollo de toolchains de conversion: permite validar pipelines de exportacion (lectura de safetensors, mapeo de nombres, generacion de manifiestos) antes de abordar modelos mayores o formatos propietarios.
- Comparacion de formatos de cuantizacion: junto a los hermanos MLX MXFP4 y MXFP8, facilita estudios comparativos de precision y tamano entre formatos de 4 y 8 bits sobre el mismo modelo base.
- Auditoria de artefactos publicados: util para equipos que evaluan la trazabilidad de repositorios de cuantizacion (revision de origen, politica de precision, estado de validacion) antes de adoptarlos en produccion.
- Base para reconstruccion con AXQuant: dado el aviso de rebuild, sirve como punto de partida para regenerar el paquete con la version mejorada del toolkit y comparar resultados.
- Docencia y formacion tecnica: ejemplo real de model card con advertencias explicitas sobre limites de validacion, adecuado para ensenar buenas practicas de publicacion de artefactos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente `quality_certified=false` y `runtime_verified=false`, y no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas vision-lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 69,9 GB en safetensors, pero el autor no proporciona cifras de memoria en runtime ni de rendimiento.
- GPU recomendadas: no disponible. El nombre del repositorio menciona CUDA, pero la exportacion se genero con backend numpy en CPU y no se ha probado carga ni generacion en CUDA.
- Compatibilidad con GPU de consumo: no verificada. El tamano del paquete (69,9 GB) excede la VRAM de la mayoria de GPU consumer, pero no hay datos de despliegue efectivo.
- Opciones de despliegue: vLLM y otros motores no han sido probados; AX Engine no soporta `minicpmv4_7` en la version 7.6.4 del generador de manifiestos. Los hermanos MLX requieren MLX-VLM 0.7.9, pero esa validacion no se extiende a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16 (este) | 35,2 B totales | no disponible | NVFP4 W4A16, safetensors | Apache-2.0 | Sin validar en runtime CUDA ni calidad |
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4 | mismo base | no disponible | MXFP4, MLX | Apache-2.0 | Smoke test sintetico superado con MLX-VLM 0.7.9 |
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8 | mismo base | no disponible | MXFP8, MLX | Apache-2.0 | Smoke test sintetico superado con MLX-VLM 0.7.9 |
| openbmb/MiniCPM-V-4.7-35B-A3B (modelo base) | 35,2 B totales | no disponible | safetensors BF16 | Apache-2.0 | Modelo de referencia del autor original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el paquete es evidencia de desarrollo y no un certificado de calidad.
- `runtime_verified=false`: no se ha probado carga ni generacion en CUDA; el backend de exportacion es numpy sobre CPU.
- `quality_certified=false`: no se ha evaluado la calidad del modelo cuantizado.
- AX Engine 7.6.4 no soporta `minicpmv4_7`; vLLM y otros motores no han sido probados y no se reclama compatibilidad.
- Calidad de video, MTP y vision-lenguaje no reclamada en esta exportacion.
- Aviso de rebuild: el paquete sera reconstruido con el toolkit AXQuant mejorado y reemplazado como nueva revision; conviene fijar un commit si se depende de los archivos actuales.
- Sesgos conocidos: no disponibles (no hay evaluacion publicada).
- Riesgo de alucinacion: no evaluado en esta variante.
- Limitaciones de contexto o idioma: no disponibles.
- Uso comercial: la licencia Apache-2.0 del modelo base lo permite, pero la falta de validacion de calidad y runtime desaconseja su uso en produccion sin una evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Revision del modelo base citada: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B/tree/896c2d454672476a7b45dcc5e3f0c700a0218577
- Hermano MLX MXFP4: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4
- Hermano MLX MXFP8: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8
