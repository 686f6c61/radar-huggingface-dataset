# LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 es una cuantización en precisión NVFP4 (4 bits) del modelo multimodal omni de NVIDIA, Nemotron 3 Nano Omni, publicada por el usuario LimitlessMindd. El modelo original, desarrollado por NVIDIA, unifica la comprensión de video, audio, imagen y texto en un único sistema, con salida exclusivamente textual. Está diseñado para tareas empresariales como análisis de reuniones, inteligencia documental (OCR, gráficos, contratos), automatización de interfaces gráficas (GUI) y agentes multimodales.

La arquitectura combina un backbone híbrido Mamba2-Transformer con mezcla de expertos (MoE) de 31B parámetros totales y aproximadamente 3B activos por token, junto con encoders especializados: CRADIO v4-H para visión y Parakeet para audio. Soporta una ventana de contexto de hasta 256k tokens y un modo de razonamiento activado por defecto, con cadenas de pensamiento (chain-of-thought) y soporte para tool calling. Esta versión NVFP4 reduce el tamaño del modelo a 22,4 GB, permitiendo su ejecución en GPUs de consumo como la RTX 5090 con 32 GB de VRAM.

La relevancia actual radica en que elimina la necesidad de orquestar múltiples modelos especializados (visión, audio, lenguaje) para tareas multimodales, ofreciendo una solución unificada y eficiente en un solo modelo abierto, con licencia comercial permitida bajo el NVIDIA Open Model Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer Hybrid Mixture of Experts (MoE) |
| Parametros totales | 31B (según arquitectura; 18.326.275.008 en safetensors) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | NVFP4 (este repo); también disponibles BF16 y FP8 |
| Idiomas soportados | Inglés únicamente |
| Licencia | NVIDIA Open Model Agreement (uso comercial permitido) |
| Formato de pesos | safetensors (también disponible GGUF de unsloth) |

## Arquitectura y entrenamiento

El modelo combina un backbone híbrido Mamba2-Transformer con mezcla de expertos (MoE), donde cada token activa aproximadamente 3B de los 31B parámetros totales. Esta hibridación permite un procesamiento eficiente de secuencias largas (hasta 256k tokens) gracias a las capas Mamba2, mientras que las capas Transformer mantienen la capacidad de razonamiento profundo. Para la entrada multimodal, utiliza dos encoders externos: CRADIO v4-H para imágenes y fotogramas de video, y Parakeet para audio, cuyas representaciones se integran en el backbone.

El entrenamiento se realizó con un enfoque de mejora progresiva, utilizando modelos como Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b para generar datos sintéticos de alta calidad. El dataset principal es nvidia/Nemotron-Image-Training-v3, que incluye recaptioning de imágenes y audio, generación de pares pregunta-respuesta, cadenas de razonamiento para tareas complejas y filtrado basado en calidad. No se han publicado detalles sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Comprensión multimodal unificada: procesa simultáneamente video (hasta 2 minutos, muestreo de 1-2 FPS), audio (hasta 1 hora, 8 kHz o superior), imágenes (RGB) y texto.
- Razonamiento con cadena de pensamiento: modo "thinking" activado por defecto, con presupuesto de razonamiento configurable (hasta 16384 tokens) y parámetros de temperatura y top_p específicos.
- Tool calling y salida JSON: soporta invocación de herramientas y generación de respuestas en formato JSON estructurado.
- Transcripción de voz con marcas de tiempo a nivel de palabra: útil para subtitulado y análisis de reuniones.
- OCR y análisis de documentos: extracción de texto de imágenes, comprensión de gráficos y tablas, y análisis de documentos largos.
- Automatización de GUI: capacidad de interpretar capturas de pantalla y realizar acciones en interfaces gráficas para agentes autónomos.
- Modo instruct: permite desactivar el razonamiento para respuestas más rápidas y directas, con temperatura baja (0.2) y top_k=1.

## Casos de uso

- Atención al cliente automatizada: el modelo puede analizar videos de entregas (por ejemplo, verificación de drop-off mediante OCR de direcciones) o conversaciones de audio, generando respuestas contextuales con razonamiento. Su ventana de 256k tokens permite manejar interacciones largas y múltiples turnos.
- Inteligencia documental para asistentes legales: procesa contratos, acuerdos de nivel de servicio (SOW/MSA) y documentos financieros, extrayendo cláusulas clave, resumiendo secciones y respondiendo preguntas específicas con citas textuales.
- Análisis de medios y entretenimiento: genera subtítulos densos, resúmenes y búsqueda semántica en videos largos (hasta 2 minutos por clip), combinando comprensión visual y de audio para identificar eventos, diálogos y acciones.
- Agentes de automatización de GUI: el modelo puede interpretar capturas de pantalla y ejecutar acciones en navegadores o aplicaciones de escritorio, habilitando flujos de gestión de incidencias, búsqueda agéntica o automatización de correos electrónicos.
- Transcripción y subtitulado en tiempo real: gracias a su encoder Parakeet y la salida con marcas de tiempo a nivel de palabra, puede transcribir reuniones, podcasts o material de formación, generando subtítulos sincronizados.
- Verificación de pedidos en drive-thru: combina entrada de audio (voz del cliente) y video (imagen del pedido) para confirmar pedidos en restauración rápida, reduciendo errores y mejorando la experiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos multimodales. Se recomienda consultar el blog técnico de NVIDIA para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización NVFP4, el modelo ocupa aproximadamente 22,4 GB en disco, lo que permite ejecutarse en GPUs con 32 GB de VRAM o más. Para BF16 se requieren 62 GB, y para FP8 33 GB.
- GPU recomendadas: para NVFP4, el mínimo es una RTX 5090 de 32 GB; también se soportan DGX Spark y Jetson Thor. Para FP8 se recomienda L40S de 48 GB o RTX Pro 6000. Para BF16, una H100 de 80 GB es suficiente.
- Compatibilidad con GPUs de consumo: sí, la RTX 5090 (32 GB) es suficiente para NVFP4, lo que la hace accesible para estaciones de trabajo de gama alta.
- Opciones de despliegue: compatible con el ecosistema transformers de Hugging Face, así como con NVIDIA NIM y contenedores NGC. También existen versiones GGUF (de unsloth) para su uso con llama.cpp u Ollama.
- Latencia y throughput: no se han proporcionado datos específicos. Dado el diseño MoE con ~3B parámetros activos, se espera un throughput superior al de modelos densos de tamaño similar, aunque la latencia depende del hardware y del modo de razonamiento activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B | 31B (3B activos) | 256k | Video, audio, imagen, texto | NVIDIA Open Model Agreement | Hugging Face, NIM |
| Qwen2.5-VL-72B-Instruct | 72B (denso) | 128k | Imagen, video | Apache 2.0 | Hugging Face |
| Llama 3.2 Vision 90B | 90B (denso) | 128k | Imagen | Llama 3.2 Community License | Hugging Face |

La comparativa se basa en características arquitectónicas y de licencia, ya que no se dispone de benchmarks públicos para Nemotron-3-Nano-Omni. Frente a Qwen2.5-VL y Llama 3.2 Vision, este modelo ofrece una ventana de contexto mayor (256k) y soporte nativo de audio, además de un diseño MoE que reduce los parámetros activos por token, lo que puede traducirse en menor latencia y mayor eficiencia en despliegue.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No es adecuado para aplicaciones que requieran otros idiomas sin un pipeline de traducción adicional.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas. Se recomienda validación humana en entornos de producción.
- Limitaciones de entrada: el video está limitado a 2 minutos por clip y el audio a 1 hora, con requisitos de muestreo específicos. No se soportan formatos de entrada adicionales.
- Sesgos conocidos: no se han publicado evaluaciones de sesgo. Dado que el entrenamiento se basa en datos sintéticos generados por otros modelos, puede heredar sesgos de esos modelos.
- Restricciones de licencia: aunque el NVIDIA Open Model Agreement permite uso comercial, es necesario revisar los términos completos, especialmente en lo relativo a redistribución y responsabilidad.
- Requisitos de hardware: aunque NVFP4 permite ejecución en RTX 5090, el modo de razonamiento (thinking) puede requerir más VRAM y tiempo de cómputo, por lo que se recomienda probar en el hardware objetivo antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace (NVFP4): https://huggingface.co/LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Modelo base FP8: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8
- Blog de NVIDIA (introducción): https://huggingface.co/blog/nvidia/nemotron-3-nano-omni-multimodal-intelligence
- Blog de desarrolladores de NVIDIA: https://developer.nvidia.com/blog/nvidia-nemotron-3-nano-omni-powers-multimodal-agent-reasoning-in-a-single-efficient-open-model
- Blog corporativo de NVIDIA: https://blogs.nvidia.com/blog/nemotron-3-nano-omni-multimodal-ai-agents/
- Versión GGUF (unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/nemotron-3-nano-omni-30b-a3b-reasoning
