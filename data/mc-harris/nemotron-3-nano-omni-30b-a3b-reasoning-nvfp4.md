# mc-harris/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning es un modelo multimodal de la familia Nemotron de NVIDIA que unifica la comprensión de vídeo, audio, imagen y texto para tareas empresariales de pregunta-respuesta, resumen, transcripción e inteligencia documental. Esta ficha concreta corresponde a la cuantización NVFP4 publicada por el usuario mc-harris a partir de los pesos oficiales en BF16 (`nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`), con un tamaño de repositorio de 22,4 GB y 18.326.275.008 parámetros almacenados en safetensors.

El modelo emplea una arquitectura híbrida Mamba2-Transformer con mezcla de expertos (MoE): 31B parámetros totales y aproximadamente 3B activos por token, con una ventana de contexto máxima de 256k tokens. Integra tres componentes: el backbone lingüístico Nemotron 3 Nano (30B A3B), el codificador visual CRADIO v4-H para imágenes y fotogramas de vídeo, y el codificador de voz Parakeet para entradas de audio. La salida es exclusivamente texto.

Su relevancia actual radica en que combina comprensión any-to-any (vídeo, audio, imagen, texto como entrada) con modo de razonamiento activado por defecto, soporte de tool calling y salida JSON, todo bajo una licencia de uso comercial (NVIDIA Open Model Agreement). La versión NVFP4 está pensada para reducir los requisitos de hardware hasta una única RTX 5090 de 32 GB, lo que acerca un modelo multimodal de 31B a estaciones de trabajo consumer de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer híbrida con Mixture of Experts (MoE) |
| Parámetros totales | 31B (18.326.275.008 parámetros almacenados en safetensors para esta cuantización) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 256k tokens |
| Tipos de cuantización | BF16 (62 GB), FP8 (33 GB), NVFP4 (21 GB); esta ficha es NVFP4 de 8 bits vía modelopt |
| Idiomas soportados | Inglés únicamente (según model card) |
| Licencia | NVIDIA Open Model Agreement (uso comercial permitido) |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |
| Modalidades de entrada | Vídeo, audio, imagen, texto |
| Modalidad de salida | Texto |
| Codificador visual | CRADIO v4-H |
| Codificador de audio | Parakeet (parakeet-tdt-0.6b-v2) |
| Backbone lingüístico | Nemotron 3 Nano LLM (30B A3B) |
| Pipeline | any-to-any |
| Fecha de publicación | 28/04/2026 (versiones oficiales NVIDIA); esta cuantización, 08/11/2026 |

## Arquitectura y entrenamiento

El backbone es un modelo híbrido Mamba2-Transformer con MoE de 31B parámetros totales y ~3B activos por token, lo que reduce el coste computacional por token frente a un transformer denso del mismo tamaño. Sobre ese backbone se acoplan dos codificadores especializados: CRADIO v4-H para imágenes y fotogramas de vídeo, y Parakeet para audio. El resultado es un modelo any-to-any con entrada multimodal y salida textual.

El modelo base fue desarrollado por NVIDIA y, según la model card, se mejoró utilizando Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b (probablemente como destilación o generación de datos, aunque la model card no detalla el mecanismo). El dataset citado es `nvidia/Nemotron-Image-Training-v3`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El modo de razonamiento está activado por defecto y se puede desactivar mediante el parámetro `enable_thinking`.

## Capacidades

- Comprensión de vídeo: hasta 2 minutos en mp4; para 1080p se muestrea hasta 1 FPS / 128 fotogramas, y para resoluciones menores como 720p se puede subir a 2 FPS / 256 fotogramas.
- Comprensión de audio: ficheros wav y mp3 de hasta 1 hora, con frecuencias de muestreo de 8 kHz en adelante.
- Comprensión de imagen: entradas RGB en jpeg y png.
- Procesamiento de texto con contexto de hasta 256k tokens.
- Reconocimiento óptico de caracteres (OCR) y análisis de gráficos y documentos largos.
- Transcripción de voz (ASR) con marcas de tiempo a nivel de palabra.
- Modo de razonamiento con cadena de pensamiento (chain-of-thought), activado por defecto y conmutable vía `enable_thinking`.
- Soporte de tool calling / function calling.
- Salida en formato JSON estructurado.
- Capacidades orientadas a flujos agénticos y automatización de GUI (agentes de navegador, correo, búsqueda agéntica).
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Análisis de vídeo y habla en medios y entretenimiento: el modelo puede generar descripciones densas, resúmenes y búsqueda semántica sobre grabaciones de reuniones o material audiovisual, combinando la comprensión de fotogramas (hasta 128-256 por vídeo) con la transcripción de audio en una sola pasada.
- Inteligencia documental para asistentes de IA: procesamiento de contratos, SOW/MSA, documentos financieros y científicos con OCR y análisis de gráficos, aprovechando la ventana de 256k tokens para documentos extensos.
- Verificación de entregas y pedidos en atención al cliente: lectura OCR de vídeos de entrega o de drive-thru para confirmar direcciones u órdenes, un caso citado explícitamente por NVIDIA.
- Transcripción de reuniones y actas: conversión de audio de hasta 1 hora en texto con marcas de tiempo por palabra, útil para generar resúmenes y actas estructuradas en JSON.
- Automatización de GUI y agentes: soporte de tool calling y salida JSON para agentes de navegador, gestión de incidentes o agentes de correo que necesitan interpretar capturas de pantalla y ejecutar acciones multi-paso.
- Enriquecimiento de catálogos audiovisuales: generación de metadatos, capítulos y descripciones a partir de vídeo y audio combinados, adecuado por su capacidad de procesar ambas modalidades de forma conjunta.
- Despliegue en estaciones de trabajo: al caber en una RTX 5090 de 32 GB en NVFP4, permite prototipar y ejecutar inferencia multimodal local sin depender de clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para NVFP4: ~21 GB de pesos; con overhead de contexto y caché KV se recomienda al menos 32 GB.
- GPU mínima indicada por NVIDIA para NVFP4: 1× RTX 5090 (32 GB); también soportado en 1× DGX Spark y 1× Jetson Thor.
- Para FP8: mínimo 1× L40S (48 GB); recomendado 1× RTX Pro 6000 o 1× B200.
- Para BF16: mínimo 1× H100 80 GB en una sola GPU; recomendado 1× B200 o 1× H200.
- Cabe en GPU consumer: sí, en RTX 5090 con la cuantización NVFP4.
- Opciones de despliegue: transformers (librería declarada, requiere `custom_code`), NVIDIA NIM (contenedor en NGC), build.nvidia.com. No se confirma en la información disponible soporte de vLLM, llama.cpp, Ollama o TGI para esta arquitectura híbrida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning (NVFP4) | 31B totales / ~3B activos | 256k | Vídeo, audio, imagen, texto → texto | NVIDIA Open Model Agreement | Hugging Face, NGC, build.nvidia.com |
| Nemotron-3-Nano-30B-A3B (BF16) | 31B totales / ~3B activos | no disponible | Texto | NVIDIA Open Model Agreement | Hugging Face |
| Qwen3-VL-30B-A3B-Instruct | 30B totales / ~3B activos | no disponible | Imagen, texto → texto | no disponible | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Idioma: la model card declara soporte exclusivo de inglés; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Sesgos: no se documentan en la información disponible las evaluaciones de sesgo del modelo.
- Alucinación: no se publican métricas de fiabilidad ni tasas de alucinación; en tareas de OCR y transcripción conviene validar las salidas.
- Licencia: el uso comercial está permitido bajo el NVIDIA Open Model Agreement, pero es un acuerdo con condiciones específicas que deben revisarse antes de producción.
- Esta ficha es una cuantización NVFP4 de terceros (mc-harris): puede introducir degradación respecto a BF16/FP8, y su soporte depende de kernels y frameworks compatibles con NVFP4.
- Requiere `custom_code` en transformers, lo que añade complejidad de despliegue frente a arquitecturas estándar.
- Límites de entrada: vídeo de hasta 2 minutos y audio de hasta 1 hora; los vídeos largos deben trocearse.
- Salida exclusivamente textual: no genera imagen, audio ni vídeo.
- El modelo de esta ficha tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación de la cuantización.

## Enlaces

- Cuantización NVFP4 (esta ficha): https://huggingface.co/mc-harris/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Versión FP8: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8
- Versión NVFP4 oficial: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Backbone lingüístico: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Codificador visual CRADIO v4-H: https://huggingface.co/nvidia/C-RADIOv4-H
- Codificador de audio Parakeet: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Referencia API NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-nano-omni-30b-a3b-reasoning
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/nemotron-3-nano-omni-30b-a3b-reasoning
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Paper referenciado (arXiv:2604.24954): https://arxiv.org/abs/2604.24954
