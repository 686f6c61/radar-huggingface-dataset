# rickybrent/GLM-Steam-320B-A18B-v2-NVFP4-HYPERFLARE-TP2-gb202

## Resumen

GLM-Steam-320B-A18B-v2-NVFP4-HYPERFLARE-TP2-gb202 es un paquete de ejecución (runtime package) preparado por el usuario rickybrent para servir el modelo TheDrummer/GLM-Steam-320B-A18B-v2, un finetune de la familia GLM-5.3 con arquitectura Mixture of Experts (320B parámetros totales, 18B activos), cuantizado en NVFP4 (FP4) y empaquetado para el runtime Hyperflare de NVIDIA. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión y validación de trabajo upstream (cuantización NVFP4 de cgg507 y pesos FP8 de TheDrummer) orientada a un hardware muy concreto: dos GPU RTX PRO 6000 Blackwell (GB202, SM120, 96 GB cada una) en tensor-parallel TP2.

El paquete resuelve un problema práctico de despliegue: permite ejecutar un modelo de 320B parámetros con capacidades de visión y contexto largo en dos GPU de estación de trabajo Blackwell, sin Python, sin toolkit CUDA, sin FlashInfer ni vLLM/SGLang/llama.cpp. El formato nativo de Hyperflare (payload format v2, prepared model contract 3) requiere compilar el runtime desde el repositorio oficial de NVIDIA en el commit 6d74db3a o superior, y no es cargable por las herramientas convencionales de inferencia.

Es relevante ahora porque demuestra la viabilidad de servir modelos MoE de gran tamaño con cuantización FP4 nativa (NVFP4) y decodificación especulativa MTP-5 sobre hardware consumer/prosumer de gama alta Blackwell, con una ventana de contexto de 1.048.576 tokens por petición y concurrencia máxima de 4. La licencia es MIT, lo que facilita su uso comercial, aunque las limitaciones de hardware y runtime restringen enormemente su adopción práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, base GLM-5.3, con torre de visión (image-text-to-text) |
| Parametros totales | 320B |
| Parametros activos | 18B |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | NVFP4 (FP4) para pesos; MXFP8 para visión; pesos FP8/FP32 como donantes en la conversión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Directorio core `model.safetensors/` en payload format v2 (prepared model contract 3); no compatible con safetensors estándar, GGUF ni formatos de vLLM/SGLang/llama.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Mixture of Experts de la familia GLM-5.3, con 320B parámetros totales y 18B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El paquete incorpora una torre de visión (pipeline image-text-to-text) cuantizada en MXFP8, y emplea decodificación especulativa MTP-5 (Multi-Token Prediction con 5 tokens de especulación) para acelerar la generación. El contexto por petición alcanza 1.048.576 tokens, con concurrencia máxima de 4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. El modelo base es un finetune de TheDrummer sobre GLM-5.3 (GLM-Steam-320B-A18B-v2), del que tampoco se detallan los datos de ajuste. La conversión NVFP4 proviene de cgg507/GLM-Steam-320B-A18B-v2a-NVFP4, con pesos FP32 donantes de TheDrummer/GLM-Steam-320B-A18B-v2-FP8. El paquete incluye compresión de caché KV sin pérdida opcional (CodecLayout rev. 1, `kv_codec_gpu`): modo CPU ZKV1 con 1,386× de reducción (-27,8%) y modo GPU GKV1 con 1,376× (-27,3%) y restauración PCIe/NVMe de 0,211 s a 16K.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) controlable mediante `reasoning_effort` (por defecto `"high"`) y `thinking_token_budget`.
- Comprensión de imágenes y texto (image-text-to-text) mediante torre de visión en MXFP8.
- Contexto largo de hasta 1.048.576 tokens por petición, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa MTP-5 para acelerar la generación.
- API compatible con OpenAI (`/v1/chat/completions`), con alias de modelo `GLM-Steam-320B-A18B-v2` configurable mediante `--served-model-name`.
- Compresión de caché KV sin pérdida en CPU o GPU para prefijos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo de pensamiento y el contexto largo lo permiten de forma implícita.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto por petición, el modelo puede ingerir libros completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación.
- Procesamiento de imágenes con texto asociado (image-text-to-text): extracción de información de capturas, diagramas o documentos escaneados combinada con razonamiento textual en un mismo pipeline.
- Asistentes de razonamiento profundo: el modo de pensamiento con `reasoning_effort: "high"` permite tareas de análisis complejo, y `thinking_token_budget` ajusta el coste de latencia cuando se requiere respuesta rápida.
- Servicio de API compatible con OpenAI en infraestructura propia: el alias `GLM-Steam-320B-A18B-v2` y el endpoint `/v1/chat/completions` permiten integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Caché de prefijos largos en producción: la compresión KV sin pérdida (ZKV1/GKV1) reduce el espacio de caché de prefijos en disco o memoria un 27-28%, útil en cargas con system prompts extensos y concurrencia de hasta 4 peticiones.
- Evaluación de cuantización FP4: investigadores pueden comparar el rendimiento de NVFP4 frente a FP8 usando el mismo modelo base y hardware Blackwell, con informes de validación incluidos en el repositorio.
- Despliegue en estaciones de trabajo Blackwell: dos RTX PRO 6000 (96 GB) permiten servir un MoE de 320B sin clúster de datacenter, adecuado para laboratorios y equipos con hardware prosumer de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio incluye informes de validación y benchmarks del paquete, pero sus cifras no se detallan en la información proporcionada.

## Requisitos de hardware

- GPU: exactamente 2 × RTX PRO 6000 Blackwell Workstation Edition (GB202, SM120, 96 GB cada una), en tensor-parallel TP2. No se contempla otro hardware.
- VRAM: el paquete pesa ~168,2 GiB / 180,6 GB, distribuido entre las dos GPU; la compresión KV en GPU reserva ~0,24 GiB/GPU adicionales.
- Consumer GPU: no cabe en GPU consumer convencionales (RTX 4090, 5090, etc.); requiere las RTX PRO 6000 Blackwell de 96 GB.
- Runtime: Hyperflare (NVIDIA/hyperflare-inference) compilado desde el commit 6d74db3a o compatible, con `cargo build --release`. No requiere Python, toolkit CUDA, FlashInfer ni cabeceras de preparación.
- Incompatibilidad: Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato nativo.
- Lanzamiento: `flare run rickybrent/GLM-Steam-320B-A18B-v2-NVFP4-HYPERFLARE-TP2-gb202 --gpus 0,1`, con verificación de firma del publicador (`publisher.json`) en la primera carga.
- Latencia y throughput: no disponibles, salvo la restauración de caché KV a 16K de 0,211 s en modo GKV1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| GLM-Steam-320B-A18B-v2 NVFP4 HYPERFLARE TP2 (este) | 320B totales / 18B activos | 1.048.576 | MIT | Hyperflare nativo (payload v2) | 2 descargas, 0 likes |
| TheDrummer/GLM-Steam-320B-A18B-v2-FP8 | 320B totales / 18B activos | no disponible | no disponible | FP8 (safetensors) | upstream del finetune |
| cgg507/GLM-Steam-320B-A18B-v2a-NVFP4 | 320B totales / 18B activos | no disponible | no disponible | NVFP4 | upstream de la cuantización |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Hardware extremadamente restrictivo: solo funciona en 2 × RTX PRO 6000 Blackwell (GB202, SM120, 96 GB); no es desplegable en otras GPU ni en clústeres convencionales.
- Runtime no estándar: requiere compilar Hyperflare desde el commit 6d74db3a; no es compatible con Transformers, vLLM, SGLang ni llama.cpp, lo que limita la integración con ecosistemas existentes.
- Verificación de firma del publicador en la primera carga; el modo desatendido exige `--dangerously-approve-key` y `--dangerously-accept-publisher`, con el riesgo de seguridad asociado.
- Advertencias de preflight PCIe si Relaxed Ordering o Resizable BAR están deshabilitados; puede requerir `flare doctor` o `--bypass-performance-check`.
- El template de chat abre `<|assistant|>
