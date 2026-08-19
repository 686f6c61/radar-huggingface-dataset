# Sawfwair/MiniMax-H3-FL2VA-MLX-BF16

## Resumen

MiniMax-H3 FL2VA MLX compact BF16 es un artefacto de runtime MLX de máxima fidelidad para el modelo MiniMax-H3 FL2VA, desarrollado por Sawfwair. Se trata de una conversión compacta del checkpoint oficial `MiniMaxAI/MiniMax-H3@ec19cc6daf5d8add9417c18e86b6b58cc6c55027`, sin usar checkpoints convertidos o cuantizados de terceros. El modelo base MiniMax-H3 es un sistema generativo omni-modal que comprende contextos multimodales (texto, imagen, vídeo y audio) y genera vídeo con audio estéreo nativo hasta resoluciones 2K y duraciones de hasta 15 segundos.

Este artefacto concreto está pensado para su uso en la plataforma mere.run, con el identificador `video-minimax-h3-fl2va-bf16-mlx`. El núcleo de denoising activo de 20.11B parámetros se mantiene en BF16, mientras que el acondicionador Qwen3-VL usa cuantización MLX affine INT8 con grupo 64, el VAE de vídeo está en FP16 y el VAE de audio permanece en FP32. Se omiten ciertos componentes (proyecciones AdaLN solo de programación, MLP de timestep y tensores RoPE reconstruidos) tras generar tablas de puntos exactos para los shifts de vídeo/audio, lo que reduce el tamaño sin sacrificar fidelidad.

La relevancia de este modelo radica en ofrecer una versión compacta y verificable de MiniMax-H3 FL2VA para entornos MLX, con trazabilidad completa de conversión mediante manifiestos y sumas SHA256. Sin embargo, la licencia comunitaria de MiniMax H3 impone restricciones geográficas significativas que limitan su uso en varias regiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-modal (detalles internos no disponibles; el modelo base MiniMax-H3 es un sistema generativo omni-modal) |
| Parametros totales | No disponible |
| Parametros activos | 20.11B (núcleo de denoising activo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (núcleo), INT8 affine grupo 64 (acondicionador Qwen3-VL), FP16 (VAE de vídeo), FP32 (VAE de audio); existe versión 4-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (excluye uso, distribución y exhibición en EE. UU., UE, Reino Unido y Corea del Sur) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la información proporcionada. El modelo base MiniMax-H3 es un sistema generativo omni-modal que integra comprensión y generación de texto, imagen, vídeo y audio. En este artefacto MLX, el núcleo de denoising activo de 20.11B parámetros se mantiene en BF16, mientras que el acondicionador Qwen3-VL se cuantiza a INT8 affine con grupo 64, el VAE de vídeo a FP16 y el VAE de audio a FP32. Se eliminan proyecciones AdaLN solo de programación, el MLP de timestep y tensores RoPE reconstruidos, sustituyéndolos por tablas de puntos exactos (5, 9, 12, 16, 21 y 31 puntos) para los shifts de vídeo/audio 12/3 y la tabla LightX2V de 5 puntos 6/3. No se dispone de información sobre el proceso de entrenamiento, datos utilizados o técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo con audio estéreo nativo, hasta resoluciones 2K y duraciones de 15 segundos (según el modelo base MiniMax-H3).
- Comprensión unificada de contextos multimodales que combinan texto, imágenes, vídeo y audio.
- Conversión optimizada para MLX, con cuantización mixta (BF16, INT8, FP16, FP32) que reduce el tamaño manteniendo la fidelidad del checkpoint original.
- Trazabilidad completa de conversión mediante `SOURCE_MANIFEST.json`, `transformer.conversion.json`, `MODIFICATIONS.md` y `SHA256SUMS`.
- Diseñado específicamente para el runtime `video-minimax-h3-fl2va-bf16-mlx` de mere.run.

## Casos de uso

- Generación de vídeo con audio sincronizado para producción de contenido audiovisual: el modelo puede crear clips de hasta 15 segundos con audio estéreo nativo, adecuado para prototipos de vídeo, anuncios o material de demostración.
- Comprensión multimodal para análisis de vídeo y audio: al ser omni-modal, puede procesar entradas que combinan texto, imagen, vídeo y audio, útil para tareas de descripción automática o búsqueda semántica en archivos multimedia.
- Desarrollo de aplicaciones de realidad aumentada o virtual: la generación de vídeo con audio integrado permite crear escenas cortas para entornos inmersivos sin necesidad de pipelines separados.
- Investigación en modelos generativos omni-modales: el artefacto sirve como referencia de conversión MLX de alta fidelidad, con metadatos de conversión completos para auditar el proceso.
- Integración en plataformas de creación de contenido automatizada: mediante la API de mere.run, se puede desplegar el modelo para generar vídeos cortos bajo demanda en flujos de trabajo de marketing o educación.
- Evaluación de técnicas de cuantización mixta en MLX: la combinación de BF16, INT8, FP16 y FP32 permite estudiar el impacto de la cuantización selectiva en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 76.9 GB, lo que indica que se requiere almacenamiento significativo y VRAM elevada para cargar los pesos en memoria.
- No se proporcionan requisitos oficiales de VRAM ni GPUs recomendadas.
- Dado el tamaño y la cuantización mixta, es probable que se necesiten GPUs de gama alta con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB o H100), aunque no se confirma.
- El formato MLX está optimizado para Apple Silicon, por lo que también podría ejecutarse en Macs con memoria unificada suficiente (por ejemplo, 64 GB o más), aunque no se especifica.
- Opciones de despliegue: el artefacto está destinado a mere.run; no se mencionan vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros activos | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sawfwair/MiniMax-H3-FL2VA-MLX-BF16 (este) | 20.11B | BF16/INT8/FP16/FP32 | No disponible | MiniMax H3 Community (restricciones geográficas) | HuggingFace, MLX |
| Sawfwair/MiniMax-H3-FL2VA-MLX-4bit | No disponible | 4-bit | No disponible | MiniMax H3 Community | HuggingFace, MLX |
| MiniMaxAI/MiniMax-H3 (base) | No disponible | No disponible | No disponible | MiniMax H3 Community | HuggingFace, GitHub |

No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community excluye el uso, distribución y exhibición en Estados Unidos, Unión Europea, Reino Unido y República de Corea. Cualquier uso en estas regiones está prohibido.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto o idioma.
- El modelo está diseñado específicamente para mere.run; su uso fuera de esa plataforma puede requerir adaptaciones no documentadas.
- La cuantización mixta puede introducir degradaciones sutiles en la calidad de salida, aunque el autor afirma máxima fidelidad respecto al checkpoint original.
- El tamaño del repositorio (76.9 GB) implica que no es adecuado para entornos con recursos limitados.
- No se han publicado benchmarks ni evaluaciones independientes que validen el rendimiento del modelo en tareas estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sawfwair/MiniMax-H3-FL2VA-MLX-BF16
- Versión 4-bit del mismo autor: https://huggingface.co/Sawfwair/MiniMax-H3-FL2VA-MLX-4bit
- Repositorio GitHub del modelo base MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Índice de archivos del modelo MiniMax H3: https://h3aivideo.com/blog/minimax-h3-model-files-and-download-index
- Guía de archivos y descargas de MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
