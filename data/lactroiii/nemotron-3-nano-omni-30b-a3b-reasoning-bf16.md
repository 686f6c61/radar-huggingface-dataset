# lactroiii/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16

## Resumen

Nemotron 3 Nano Omni es un modelo multimodal de razonamiento desarrollado por NVIDIA, diseñado para unificar la comprensión de vídeo, audio, imagen y texto en un único sistema. Forma parte de la familia Nemotron 3 Nano y se presenta como una solución para tareas empresariales de análisis de contenido rico, como reuniones grabadas, activos de medios, documentos complejos y automatización de interfaces gráficas. El modelo combina un backbone de lenguaje Mamba2-Transformer híbrido con mezcla de expertos (MoE) de aproximadamente 31 000 millones de parámetros totales y unos 3000 millones activos por token, junto con codificadores de visión y audio especializados. Soporta una ventana de contexto de hasta 256 000 tokens y acepta entradas de vídeo, audio, imagen y texto, generando exclusivamente texto como salida.

La relevancia de este modelo radica en su enfoque omni-modal integrado, que permite procesar simultáneamente múltiples modalidades sin necesidad de encadenar sistemas separados. Está optimizado para casos de uso como transcripción con marcas de tiempo, OCR, análisis de vídeo de larga duración, razonamiento sobre documentos y agentes que interactúan con interfaces gráficas. El modelo se distribuye bajo la licencia NVIDIA Open Model Agreement, lo que permite uso comercial, y está disponible en varios formatos de precisión (BF16, FP8 y NVFP4) para adaptarse a diferentes capacidades de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer hybrid MoE (con codificadores CRADIO v4-H para visión y Parakeet para audio) |
| Parametros totales | 33 015 632 214 (según pesos safetensors; NVIDIA declara 31B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | BF16 (este repo), FP8 y NVFP4 (repos separados) |
| Idiomas soportados | Inglés únicamente |
| Licencia | NVIDIA Open Model Agreement (uso comercial permitido) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje Nemotron 3 Nano de 30B A3B, que emplea una arquitectura híbrida Mamba2-Transformer con mezcla de expertos. Esta hibridación busca aprovechar la eficiencia de los estados recurrentes de Mamba para secuencias largas y la capacidad de atención del Transformer para tareas de razonamiento. El modelo incorpora dos codificadores especializados: CRADIO v4-H para procesar imágenes y fotogramas de vídeo, y Parakeet (versión TDT 0.6B) para codificar audio. La entrada puede ser vídeo (hasta 2 minutos, muestreado a 1-2 FPS según resolución), audio (hasta 1 hora, con frecuencias de muestreo desde 8 kHz), imágenes RGB y texto.

El entrenamiento se realizó con un conjunto de datos que incluye el dataset nvidia/Nemotron-Image-Training-v3, y NVIDIA indica que el modelo fue mejorado utilizando salidas de otros modelos como Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b. No se especifican el número total de tokens de entrenamiento ni los detalles de las fases de alineación (RLHF/DPO). El modelo incluye un modo de razonamiento activado por defecto, controlable mediante el parámetro `enable_thinking`, y admite salida en formato JSON, tool calling y marcas de tiempo a nivel de palabra para transcripción.

## Capacidades

- Comprensión multimodal unificada: procesa simultáneamente vídeo, audio, imagen y texto, generando respuestas de texto.
- Razonamiento con cadena de pensamiento: modo "thinking" activado por defecto, con presupuesto de razonamiento configurable (hasta 16 384 tokens de razonamiento).
- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos escaneados.
- Transcripción de voz a texto (ASR) con marcas de tiempo a nivel de palabra.
- Análisis de vídeo de larga duración: comprende hasta 2 minutos de vídeo, con muestreo adaptativo según resolución.
- Comprensión de documentos complejos: contratos, estados financieros, informes científicos, tablas y gráficos.
- Automatización de interfaces gráficas (GUI): puede interpretar capturas de pantalla y realizar acciones guiadas por agentes.
- Tool calling y soporte para agentes: permite integración con funciones externas y flujos de trabajo multi-paso.
- Salida en formato JSON estructurado para integración con sistemas empresariales.
- Contexto largo de 256k tokens, adecuado para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Atención al cliente con verificación visual: el modelo puede analizar vídeos de entregas o interacciones para verificar direcciones mediante OCR o validar pedidos en drive-thru, combinando visión y lenguaje en tiempo real.
- Transcripción y análisis de reuniones: dado un archivo de audio o vídeo de hasta una hora, genera transcripciones con marcas de tiempo, resume discusiones y extrae acuerdos o decisiones clave.
- Inteligencia documental para asistentes virtuales: procesa contratos, acuerdos de nivel de servicio (SLA/MSA), documentos financieros o artículos científicos, respondiendo preguntas específicas y extrayendo datos relevantes.
- Automatización de agentes GUI: el modelo puede interpretar capturas de pantalla de aplicaciones y navegadores, permitiendo agentes que gestionen incidencias, realicen búsquedas o envíen correos electrónicos de forma autónoma.
- Búsqueda y resumen de contenido audiovisual: en entornos de medios y entretenimiento, permite indexar vídeos, generar descripciones densas y buscar escenas o segmentos por contenido semántico.
- Verificación de cumplimiento en logística: a partir de imágenes de documentos de entrega o vídeos de almacén, el modelo puede validar que los procesos cumplen especificaciones, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de MMLU, HumanEval, GSM8K u otras métricas estándar. Se recomienda consultar el blog oficial de NVIDIA o la documentación de NIM para futuras actualizaciones con datos de evaluación.

## Requisitos de hardware

- Inferencia en BF16: mínimo 1× H100 80GB en una sola GPU; se recomienda 1× B200 o 1× H200.
- Inferencia en FP8: mínimo 1× L40S 48GB; se recomienda 1× RTX Pro 6000 o 1× B200.
- Inferencia en NVFP4: mínimo 1× RTX 5090 32GB; también soporta DGX Spark y Jetson Thor.
- El modelo no cabe en GPUs de consumo de gama media (por ejemplo, RTX 4090 con 24GB) en BF16 o FP8; la versión NVFP4 (21GB) podría ejecutarse en una RTX 4090, aunque no está listada como soporte mínimo oficial.
- Opciones de despliegue: NVIDIA NIM, contenedores NGC, vLLM, TGI y llama.cpp (a través del repositorio GGUF de unsloth).
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de comparativa directa con otros modelos en la informacion proporcionada. El modelo comparte características con otros MoE multimodales como Qwen2.5-VL-72B o Qwen3-VL-30B-A3B (este último utilizado en su entrenamiento), pero no hay datos de rendimiento publicados que permitan una comparación cuantitativa. Se recomienda evaluar el modelo en el hardware objetivo y con los casos de uso específicos antes de decidir su adopción.

## Limitaciones y advertencias

- Soporte de idiomas limitado al inglés; no está entrenado para otros idiomas, lo que restringe su uso en entornos multilingües.
- La licencia NVIDIA Open Model Agreement permite uso comercial, pero debe revisarse detenidamente, especialmente en lo relativo a redistribución y modificaciones.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- El contexto de 256k tokens es amplio, pero el rendimiento puede degradarse en secuencias muy largas o con múltiples modalidades simultáneas; se recomienda validar en producción.
- Los requisitos de hardware son elevados para la precisión BF16; las versiones FP8 y NVFP4 reducen el consumo de memoria pero pueden implicar pérdidas de precisión.
- El modelo está optimizado para GPUs NVIDIA; su ejecución en otro hardware puede requerir adaptaciones y no está garantizada.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/lactroiii/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Repositorio oficial de NVIDIA (BF16): https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Blog de NVIDIA sobre Nemotron 3 Nano Omni: https://huggingface.co/blog/nvidia/nemotron-3-nano-omni-multimodal-intelligence
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Documentación API de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-nano-omni-30b-a3b-reasoning
