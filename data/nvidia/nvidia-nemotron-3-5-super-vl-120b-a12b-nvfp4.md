# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 es la versión cuantizada en NVFP4 del modelo vision-lenguaje Nemotron 3.5 Super VL de NVIDIA, publicado originalmente en BF16. Está disenado para tareas de razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo, y combina una arquitectura híbrida Mamba-2 con capas de atención y mezcla de expertos (MoE), junto con un codificador visual C-RADIO y un conector visión-lenguaje. La cuantización NVFP4 reduce los requisitos de memoria mediante destilación con conciencia de cuantización desde el modelo BF16.

El modelo declara 120B parámetros totales con 12B parámetros activos y soporta contextos de hasta 1M tokens. Incorpora Multi-Token Prediction (MTP) para decodificación especulativa nativa y un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking`). Está pensado para el despliegue eficiente de agentes de texto y visión-lenguaje en hardware NVIDIA, incluyendo una única DGX Spark, una RTX PRO 6000, una H200, dos H100 o una GB200.

Es relevante ahora porque ofrece capacidades multimodales de contexto muy largo en un formato cuantizado de 8 bits que cabe en plataformas de una sola GPU profesional, con licencia OpenMDW-1.1 que permite uso comercial. La ficha se basa en la model card del autor y en los metadatos de Hugging Face; los datos no presentes en esas fuentes se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con MoE y codificador visual C-RADIO |
| Parámetros totales | 120B (según model card); 65.769.840.138 según safetensors |
| Parámetros activos | 12B (MoE) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantización | NVFP4 (pesos en precisión mixta, 8-bit); modelo base en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura combina capas intercaladas de Mamba-2, mezcla de expertos (MoE) y atención, con un codificador visual C-RADIO y un conector visión-lenguaje. El modelo es un MoE con 120B parámetros totales y 12B activos, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamano. Soporta contextos de hasta 1M tokens y emplea Multi-Token Prediction (MTP) para decodificación especulativa nativa.

Esta versión NVFP4 se obtiene mediante destilación con conciencia de cuantización desde el modelo BF16 `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, reduciendo los requisitos de memoria. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada. El modelo incluye un modo de razonamiento configurable (`enable_thinking`) con niveles `off`, `on (medium)` y `on`, y recomienda parámetros de muestreo distintos para texto (temperatura 1.0, top_p 0.95) y visión (temperatura 0.6, top_p 0.95).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`enable_thinking=True/False`) y presupuesto de razonamiento ajustable.
- Comprensión de imágenes y vídeo como entrada, con salida de texto (pipeline image-text-to-text).
- Comprensión de documentos.
- Generación de código.
- Uso de herramientas y function calling: el ejemplo de vLLM habilita `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Razonamiento multi-paso y soporte para agentes.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP).
- Procesamiento de vídeo con parámetros de muestreo configurables (fps y número de frames) y pruning de vídeo.

## Casos de uso

- Agentes multimodales de atención al cliente: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, documentos) gracias a su ventana de hasta 1M tokens y a su soporte de tool calling para consultar sistemas internos.
- Análisis de documentos extensos: comprensión de documentos combinada con contexto de 1M tokens permite procesar informes, contratos o expedientes completos junto con sus figuras y tablas en una sola pasada.
- Generación de código en producción: el soporte de function calling y el parser `qwen3_coder` en vLLM permiten integrarlo en pipelines de CI/CD y asistentes de código que invocan herramientas.
- Comprensión de vídeo: con parámetros como `fps=2` y `num_frames=256` y pruning de vídeo al 0.5, es adecuado para resumen y análisis de contenido audiovisual.
- Despliegue en el borde o en estaciones de trabajo: al caber en una DGX Spark o una RTX PRO 6000, sirve para asistentes locales con capacidades de visión sin depender de la nube.
- Razonamiento con presupuesto controlado: el nivel `on (medium)` reduce los tokens generados frente a `on`, útil en entornos con latencia o coste acotados donde se acepta una posible pérdida de precisión.
- Automatización de soporte técnico con capturas de pantalla: la entrada de imagen y el razonamiento multi-paso permiten diagnosticar incidencias a partir de imágenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una gráfica (`accuracy_plot.png`) sin valores numéricos en el texto proporcionado.

## Requisitos de hardware

- Despliegue oficial declarado: 1× DGX Spark (GB10), 1× NVIDIA RTX PRO 6000, 1× H200, 2× H100 o 1× GB200.
- El ejemplo de vLLM de la model card está indicado para DGX Spark (GB10) únicamente, con una secuencia concurrente (`--max-num-seqs 1`), `--gpu-memory-utilization 0.75` y `--max-num-batched-tokens 8192`.
- Decodificación especulativa con el modelo borrador `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr` y 7 tokens especulativos por borrador (método `dflash`).
- Backend Mamba con `flashinfer`, caché SSM en float16 y redondeo estocástico de la caché Mamba.
- Despliegue mediante vLLM (imagen `vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57`); la model card menciona también ejemplos con SGLang. No se detallan opciones con llama.cpp u Ollama.
- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamano del repositorio es de 75.0 GB.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo generativo, es susceptible de producir contenido incorrecto.
- El nivel de razonamiento `on (medium)` reduce los tokens generados pero puede afectar a la precisión, según la model card.
- La configuración de vLLM del ejemplo está pensada para DGX Spark únicamente y con una sola secuencia concurrente, lo que limita el throughput en ese escenario.
- El modelo requiere `--trust-remote-code` y código personalizado (`custom_code`), lo que implica ejecutar código del autor.
- Idiomas soportados limitados a en, es, fr, de, it y ja; el rendimiento fuera de esos idiomas no está documentado.
- Licencia OpenMDW-1.1: la model card indica que el modelo está listo para uso comercial o no comercial, pero conviene revisar los términos completos de la licencia antes de su explotación.
- La model card indica 120B parámetros totales, mientras que los safetensors declaran 65.769.840.138; esta discrepancia debe tenerse en cuenta al planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo borrador para decodificación especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
