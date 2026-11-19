# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 es un modelo vision-lenguaje desarrollado por NVIDIA dentro de su familia Nemotron. Combina un codificador visual C-RADIO con un núcleo de lenguaje híbrido que entrelaza capas Mamba-2, capas de atención y capas de mezcla de expertos (MoE). Con 120.000 millones de parámetros totales y solo 12.000 millones activos por token, está diseñado para razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo.

Esta es la versión en precisión completa (BF16), pensada para personalización, adaptación a dominio y evaluación de referencia; NVIDIA publica además una variante NVFP4 optimizada para despliegue. El modelo soporta contextos de hasta 1 millón de tokens y decodificación especulativa nativa mediante Multi-Token Prediction (MTP), lo que reduce la latencia en generación autoregresiva.

Su relevancia actual radica en la combinación de una arquitectura híbrida eficiente en cómputo (solo 12B activos), contexto extremo de 1M tokens y capacidades multimodales de imagen y vídeo, todo bajo licencia OpenMDW-1.1 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con MoE y codificador visual C-RADIO |
| Parámetros totales | 124.453.395.976 (120B nominales) |
| Parámetros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | BF16 (pesos de referencia); existe variante NVFP4 publicada por el autor |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (BF16), con código personalizado (`nemotron_h_omni`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención y capas de mezcla de expertos. Esta combinación busca eficiencia en secuencias largas (Mamba-2 reduce el coste frente a atención cuadrática) manteniendo la capacidad de recuperación precisa de la atención. El componente MoE aporta 120B parámetros totales con solo 12B activos por token, lo que reduce el coste de inferencia. El codificador visual es C-RADIO, conectado al núcleo de lenguaje mediante un conector visión-lenguaje. La modalidad de entrada incluye texto, imágenes y vídeo; la salida es texto.

El modelo incorpora Multi-Token Prediction (MTP), que habilita decodificación especulativa nativa y acelera la generación. Dispone de un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`), con un nivel intermedio ("on medium") que reduce el número de tokens generados a costa de posible pérdida de precisión. Los datos de entrenamiento provienen de los conjuntos `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`; no se detalla en la información disponible el número exacto de tokens ni la composición completa del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento configurable (modo thinking desactivado, medio o completo).
- Generación y comprensión de código.
- Uso de herramientas y function calling (soporte de parser `qwen3_coder` en vLLM).
- Razonamiento multi-paso y flujos de agente.
- Comprensión de imágenes (image-text-to-text).
- Comprensión de vídeo, con control de FPS y número de marcos y tasa de poda de vídeo.
- Comprensión de documentos.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa nativa mediante MTP.
- Contexto largo de hasta 1M tokens para conversaciones y documentos extensos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens) y adjuntar imágenes o capturas enviadas por el usuario, manteniendo el hilo de la conversación sin truncamientos.
- Análisis de documentos extensos: procesamiento de contratos, informes o expedientes de cientos de páginas en una sola pasada gracias al contexto de 1M tokens, con extracción de datos y resumen estructurado.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling y el parser `qwen3_coder`, con el modo thinking activable para tareas de refactorización compleja.
- Comprensión de vídeo para monitorización o análisis de contenido: uso del soporte de vídeo con control de FPS y número de marcos para inspeccionar grabaciones, generar descripciones o detectar eventos.
- Agentes autónomos multi-paso: el modelo puede planificar, invocar herramientas y razonar sobre resultados intermedios, con MTP para reducir la latencia en cadenas largas de llamadas.
- Evaluación de referencia y adaptación a dominio: al ser la versión BF16 de precisión completa, sirve como base para fine-tuning, evaluación rigurosa y ajuste a dominios específicos (legal, médico, industrial).
- Asistencia multimodal en soporte técnico: diagnóstico a partir de capturas de pantalla o fotos de equipos, combinando visión y razonamiento en varios idiomas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.5-122B-A10B, Qwen3.8-Flash-Next y DeepSeek-V4-Flash, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Despliegue de referencia en BF16: 4× H100 o 2× GB200 según la model card.
- VRAM estimada: los pesos BF16 ocupan aproximadamente 249 GB (tamaño del repo 248,9 GB), por lo que se requiere agregación multi-GPU; no cabe en una sola GPU de consumo.
- GPU recomendadas: H100 (4 unidades en tensor parallel), GB200 (2 unidades), DGX Spark para la variante NVFP4.
- GPU de consumo: no viable en BF16; la variante NVFP4 está orientada a despliegue eficiente en DGX Spark y GPUs de centro de datos.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:v0.32.0` o nightly indicada), SGLang (mencionado en la model card), endpoints compatibles con SageMaker y Azure.
- Configuración vLLM de referencia: `--tensor-parallel-size 4`, `--gpu-memory-utilization=0.85`, `--max-num-seqs=32`, `--limit-mm-per-prompt '{"video": 1, "image": 1}'`, `--video-pruning-rate 0.5`, vídeo a 2 FPS y 256 marcos, `--speculative_config.method mtp` con 3 tokens especulativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face (BF16 y NVFP4) |
| Qwen3.5-122B-A10B | 122B totales / 10B activos | no disponible | no disponible | no disponible |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen citados en la tabla de benchmarks del autor, pero no se dispone de sus especificaciones completas ni de los resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo o con contexto de 1M tokens.
- El modo de razonamiento "on medium" reduce tokens generados pero puede degradar la precisión; debe validarse por caso de uso.
- Sesgos conocidos: no se detallan en la información disponible; deben evaluarse antes de producción.
- Idiomas soportados limitados a seis (en, es, fr, de, it, ja); el rendimiento en otros idiomas no está garantizado.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar los términos completos en el enlace oficial antes de desplegar.
- El despliegue en BF16 exige infraestructura multi-GPU de centro de datos (4× H100 o 2× GB200); no es viable en hardware de consumo.
- El contexto de 1M tokens tiene implicaciones de coste y latencia que deben planificarse; la model card remite a configuraciones de despliegue específicas.
- Requiere `--trust-remote-code` en vLLM debido al código personalizado (`nemotron_h_omni`), lo que implica revisar el código antes de ejecutarlo en entornos sensibles.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Hugging Face (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Informe técnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
