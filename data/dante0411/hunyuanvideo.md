# Dante0411/HunyuanVideo

## Resumen

HunyuanVideo es un modelo fundacional de generación de vídeo a partir de texto (text-to-video) desarrollado por Tencent, publicado como código y pesos abiertos bajo la licencia comunitaria Tencent Hunyuan. Se trata del primer modelo de vídeo open source que supera los 13.000 millones de parámetros, lo que lo convierte en el mayor de su categoría entre los modelos con pesos disponibles. El repositorio analizado (Dante0411/HunyuanVideo) es una réplica de los pesos oficiales alojados originalmente en `tencent/HunyuanVideo`, con un tamaño de 39,8 GB.

El modelo aborda el problema de la generación de vídeo de alta calidad alineada con instrucciones textuales, un ámbito hasta finales de 2024 dominado por soluciones cerradas como Runway Gen-3 o Luma 1.6. La propuesta de Tencent combina un transformer de atención completa con un diseño híbrido "dual-stream to single-stream", un VAE 3D causal para la compresión espacio-temporal del latente y un codificador de texto basado en un modelo de lenguaje multimodal (MLLM) de gran tamaño.

La relevancia actual del modelo radica en su carácter abierto: pesos, código de inferencia, versión cuantizada en FP8, integración con Diffusers y ComfyUI, inferencia paralela multi-GPU mediante xDiT y un benchmark propio (Penguin Video Benchmark). Esto permite a desarrolladores e investigadores reproducir, ajustar y desplegar generación de vídeo de nivel estado del arte sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa (full attention), diseño híbrido dual-stream to single-stream; VAE 3D causal para espacio latente comprimido espacio-temporalmente |
| Parametros totales | Más de 13.000 millones (13B+) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión; la longitud se refiere a frames generados, no a tokens de contexto) |
| Tipos de cuantizacion | FP8 (pesos cuantizados publicados); BF16/FP16 en los pesos originales |
| Idiomas soportados | No disponible (el codificador de texto es un MLLM multilingüe, pero la model card no detalla idiomas) |
| Licencia | Tencent Hunyuan Community License (license: other, license_name: tencent-hunyuan-community) |
| Formato de pesos | PyTorch (.pt), con variante FP8; integración en Diffusers |

## Arquitectura y entrenamiento

HunyuanVideo opera sobre un espacio latente comprimido mediante un VAE 3D causal, que reduce la dimensionalidad espacio-temporal del vídeo antes de alimentar el transformer generativo. El núcleo es un transformer de atención completa con un diseño híbrido en dos fases: una fase "dual-stream" en la que los tokens de vídeo y de texto se procesan de forma independiente a través de varios bloques, permitiendo que cada modalidad aprenda su propia modulación sin interferencias; y una fase "single-stream" en la que ambos conjuntos de tokens se concatenan y se procesan conjuntamente para la fusión multimodal. Las condiciones textuales se codifican mediante un MLLM de gran tamaño, y el modelo genera un latente de salida a partir de ruido gaussiano y dichas condiciones, que el decodificador del VAE 3D convierte en vídeo.

El entrenamiento se apoya en tres pilares descritos en el paper: curación de datos a gran escala, entrenamiento conjunto de imagen y vídeo (image-video joint training) e infraestructura eficiente para entrenamiento e inferencia a gran escala. La model card no especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset, ni confirma el uso de RLHF o DPO (técnicas habituales en modelos de lenguaje, no estándar en difusión). Entre las innovaciones destacables están la reescritura de prompts (prompt rewrite) para mejorar la alineación texto-vídeo, la inferencia paralela con xDiT (sequence parallel multi-GPU) y la publicación de pesos en FP8 para reducir el consumo de VRAM.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de hasta 720p según la nomenclatura de los checkpoints (`hunyuan-video-t2v-720p`).
- Generación unificada de imagen y vídeo gracias a la arquitectura generativa compartida.
- Alineación texto-vídeo mejorada mediante codificador MLLM y módulo de reescritura de prompts.
- Diversidad de movimiento y estabilidad de generación, según las evaluaciones humanas reportadas por Tencent.
- Inferencia multi-GPU con paralelismo de secuencia (xDiT) para acelerar la generación.
- Integración con Diffusers y ComfyUI para pipelines de generación.
- Soporte de cuantización FP8 para reducir requisitos de memoria.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes ni modo thinking (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- **Generación de vídeo publicitario y de marketing**: el modelo produce clips de hasta 720p a partir de descripciones textuales, adecuado para prototipado rápido de anuncios y storyboards sin rodaje.
- **Previsualización en producción audiovisual**: los equipos de cine y animación pueden generar previsiones animadas (previsualizaciones) de escenas a partir del guion, reduciendo costes antes de la producción final.
- **Creación de contenido para redes sociales**: generación automatizada de clips cortos a partir de prompts, integrable en pipelines de publicación mediante Diffusers o ComfyUI.
- **Investigación en generación de vídeo**: al ser open source con pesos e infraestructura de entrenamiento documentada, sirve como base para fine-tuning, ablaciones y estudios de alineación texto-vídeo.
- **Generación de datasets sintéticos de vídeo**: útil para aumentar corpus de entrenamiento de otros modelos (reconocimiento de acciones, segmentación de vídeo) con contenido controlado por prompt.
- **Prototipado de interfaces creativas**: integración en aplicaciones Gradio o ComfyUI para herramientas de creación asistida por IA en estudios de diseño.
- **Educación y divulgación**: generación de material audiovisual explicativo a partir de descripciones textuales para cursos y presentaciones.

## Benchmarks y rendimiento

La model card reporta una evaluación humana profesional según la cual HunyuanVideo supera a Runway Gen-3, Luma 1.6 y tres modelos chinos de generación de vídeo de primer nivel. Sin embargo, no se proporcionan cifras numéricas de benchmarks automáticos (MMLU, HumanEval, GSM8K no aplican; métricas como FVD, CLIP-score o VBench no se detallan en la información disponible).

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluación humana profesional | Superior a Runway Gen-3, Luma 1.6 y 3 modelos chinos top | Sin cifras numéricas publicadas en la model card |
| Penguin Video Benchmark | Publicado como recurso (CSV) | Resultados numéricos no disponibles en la información proporcionada |
| FVD / CLIP-score / VBench | No disponible | No reportados en la información disponible |

## Requisitos de hardware

- **VRAM estimada**: los pesos originales superan los 13B parámetros; en BF16 se requiere aproximadamente 26 GB solo para pesos, más el VAE 3D y el codificador MLLM, por lo que la inferencia en precisión completa requiere GPUs de 80 GB (A100/H100) o configuraciones multi-GPU.
- **Variante FP8**: los pesos cuantizados en FP8 reducen el consumo de memoria y permiten inferencia en GPUs de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada).
- **GPU recomendadas**: A100 80GB, H100 80GB para inferencia en precisión completa; A100 40GB o L40S con FP8; configuraciones multi-GPU mediante xDiT para mayor velocidad.
- **Consumer GPU**: no cabe en GPUs de consumo de 24 GB (RTX 4090) en precisión completa; la variante FP8 y configuraciones optimizadas podrían acercarse, pero no se documenta oficialmente compatibilidad con 24 GB.
- **Despliegue**: código oficial de inferencia en PyTorch, integración con Diffusers, ComfyUI, servidor Gradio y paralelismo multi-GPU con xDiT. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de difusión de vídeo).
- **Latencia y throughput**: no disponibles en la información proporcionada; la inferencia paralela multi-GPU se presenta como mecanismo para acelerar la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| HunyuanVideo | 13B+ | 720p, text-to-video | Tencent Hunyuan Community | Pesos abiertos, Diffusers, ComfyUI |
| Runway Gen-3 | No disponible | No disponible | Propietaria (API) | Solo API cerrada |
| Luma 1.6 | No disponible | No disponible | Propietaria (API) | Solo API cerrada |
| Modelos chinos top (no especificados) | No disponible | No disponible | No disponible | No disponible |

La model card sitúa a HunyuanVideo por encima de Runway Gen-3 y Luma 1.6 en evaluación humana, pero no ofrece parámetros ni especificaciones de estos competidores. No se dispone de datos de otros modelos open source comparables (p. ej., CogVideoX, Mochi, LTX-Video) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Tencent Hunyuan Community License no es una licencia OSI estándar; puede imponer restricciones al uso comercial, especialmente en determinadas jurisdicciones o escalas de usuarios. Es imprescindible revisar el texto de la licencia antes de un despliegue comercial.
- **Riesgo de alucinación visual**: como modelo generativo, puede producir contenido incoherente, artefactos temporales o desalineación con el prompt, especialmente en escenas complejas o prompts ambiguos.
- **Sesgos**: los datos de entrenamiento no se detallan en la model card, por lo que no es posible evaluar sesgos de género, culturales o demográficos; es probable que hereden sesgos de los corpus web utilizados.
- **Idiomas**: no se especifican los idiomas soportados; aunque el codificador MLLM sea multilingüe, el rendimiento en castellano no está documentado.
- **Requisitos de hardware elevados**: la inferencia en precisión completa exige GPUs de 80 GB o multi-GPU, lo que limita su uso a infraestructuras con recursos significativos.
- **Repositorio no oficial**: el repo Dante0411/HunyuanVideo es una réplica con 0 descargas y 0 likes; para producción conviene usar los pesos oficiales de `tencent/HunyuanVideo` y verificar la integridad de los ficheros.
- **Caveat de producción**: no se documentan latencias ni throughput, por lo que la planificación de capacidad debe hacerse con pruebas propias.

## Enlaces

- Repositorio Hugging Face analizado: https://huggingface.co/Dante0411/HunyuanVideo
- Repositorio oficial en Hugging Face: https://huggingface.co/tencent/HunyuanVideo
- Paper (arXiv): https://arxiv.org/abs/2412.03603
- Paper secundario referenciado (arXiv): https://arxiv.org/abs/2405.07719
- Repositorio GitHub: https://github.com/Tencent/HunyuanVideo
- Página del proyecto: https://aivideo.hunyuan.tencent.com
- Documentación de Diffusers: https://huggingface.co/docs/diffusers/main/api/pipelines/hunyuan_video
- xDiT (inferencia paralela): https://github.com/xdit-project/xDiT
- Penguin Video Benchmark: https://github.com/Tencent/HunyuanVideo/blob/main/assets/PenguinVideoBenchmark.csv
- Pesos FP8: https://huggingface.co/tencent/HunyuanVideo/blob/main/hunyuan-video-t2v-720p/transformers/mp_rank_00_model_states_fp8.pt
- HunyuanVideo-I2V (image-to-video): https://github.com/Tencent/HunyuanVideo-I2V
- Licencia: https://huggingface.co/Dante0411/HunyuanVideo/blob/main/LICENSE
