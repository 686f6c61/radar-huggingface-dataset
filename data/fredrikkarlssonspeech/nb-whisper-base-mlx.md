# FredrikKarlssonSpeech/nb-whisper-base-mlx

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-base-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `NbAiLab/nb-whisper-base`, desarrollado por la Biblioteca Nacional de Noruega (NbAiLab). Este último es una adaptación del modelo Whisper de OpenAI, específicamente entrenado para el reconocimiento automático de voz (ASR) en noruego (bokmål y nynorsk). La conversión a MLX permite ejecutar inferencia de forma eficiente en Macs con chip Apple Silicon, aprovechando el framework de aprendizaje automático de Apple.

El modelo original fue entrenado durante 250.000 pasos con un dataset diverso de 8 millones de horas de audio (según la información del modelo ONNX relacionado). Esta versión MLX está cuantizada en float16, lo que reduce el uso de memoria sin sacrificar significativamente la precisión. Es una opción ligera y rápida para aplicaciones de transcripción en noruego que se ejecuten localmente en hardware Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible (basado en Whisper base, ~74M según OpenAI, no confirmado) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | float16 (MLX) |
| Idiomas soportados | nb (noruego bokmål), no (noruego nynorsk) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (float16, probablemente .npz) |

## Arquitectura y entrenamiento

El modelo base `NbAiLab/nb-whisper-base` sigue la arquitectura de Whisper de OpenAI: un transformer encoder-decoder con atención multi-cabeza, diseñado para procesar espectrogramas de audio de 30 segundos y generar transcripciones de texto. El entrenamiento fue realizado por NbAiLab utilizando Flax sobre TPUs, con un dataset de 8 millones de horas de audio en noruego (según la información del modelo ONNX). No se especifica si se usaron técnicas adicionales como RLHF o DPO.

La conversión a MLX se realizó mediante la herramienta `mlx-examples/whisper/convert.py` a precisión float16. Esto no altera los pesos del modelo, solo cambia el formato de almacenamiento y el runtime de inferencia, optimizado para los núcleos neuronales y la GPU de los chips Apple Silicon.

## Capacidades

- Reconocimiento automático de voz (ASR) en noruego bokmål y nynorsk.
- Transcripción de audio a texto con soporte de puntuación y mayúsculas (comportamiento estándar de Whisper).
- Posible capacidad de traducción de voz a texto en inglés (heredada de Whisper), aunque no está confirmada en la documentación del modelo.
- Inferencia local sin conexión, gracias al runtime MLX.
- Integración sencilla con la librería `mlx-whisper` para Python y CLI.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir grabaciones de audio en noruego de hasta 30 segundos por segmento, siendo útil para generar actas o subtítulos. Su tamaño reducido permite ejecutarlo en un MacBook Air sin problemas de rendimiento.
- Generación de subtítulos para vídeo: al procesar audio en noruego, se pueden crear subtítulos automáticos para contenidos audiovisuales, aprovechando la baja latencia de MLX en Apple Silicon.
- Asistentes de voz para aplicaciones de nicho: integración en aplicaciones de productividad o accesibilidad que requieran entrada de voz en noruego, con procesamiento local y privacidad garantizada.
- Archivado y digitalización de documentos sonoros: bibliotecas o instituciones pueden transcribir archivos históricos en noruego de forma eficiente, gracias a la licencia Apache 2.0 que permite uso comercial.
- Pruebas y desarrollo de pipelines de ASR: los desarrolladores pueden usar este modelo como referencia para comparar con otras variantes de Whisper en noruego, o como base para fine-tuning adicional.
- Herramientas de dictado en noruego: una aplicación de escritorio que convierta voz en texto para redacción de documentos, funcionando completamente offline en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1, M2, M3 o superior) para ejecutar el runtime MLX.
- Memoria RAM mínima recomendada: 8 GB (el modelo en float16 ocupa aproximadamente 150 MB, pero el runtime y el procesamiento de audio requieren memoria adicional).
- No se requieren GPUs externas; la inferencia se acelera mediante la GPU integrada y los núcleos Neural Engine del chip.
- Despliegue mediante la librería `mlx-whisper` (CLI o API Python) o integración directa con el framework MLX.
- Latencia estimada: para un segmento de 30 segundos de audio, la transcripción suele completarse en menos de 1 segundo en un M1 Pro, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nb-whisper-base-mlx (este) | ~74M (no confirmado) | 30 s | nb, no | Apache 2.0 | MLX |
| NbAiLab/nb-whisper-base (original) | ~74M (no confirmado) | 30 s | nb, no | Apache 2.0 | PyTorch |
| openai/whisper-base | 74M | 30 s | Multilingüe (99 idiomas) | MIT | PyTorch |
| NbAiLab/nb-whisper-large | ~1550M | 30 s | nb, no | Apache 2.0 | PyTorch |

La principal diferencia frente a `openai/whisper-base` es el entrenamiento específico en noruego, lo que mejora la precisión en este idioma. La versión MLX ofrece ventajas de rendimiento en Apple Silicon frente al formato PyTorch.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para noruego; no se recomienda su uso en otros idiomas.
- La ventana de contexto de 30 segundos obliga a segmentar audios más largos, lo que puede perder contexto entre segmentos.
- Al ser un modelo base (74M de parámetros), su precisión es inferior a la de los modelos large en tareas complejas o con ruido de fondo.
- No se han publicado evaluaciones formales sobre sesgos o alucinaciones, aunque Whisper en general puede generar texto inventado en silencios o audio ambiguo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base proviene de NbAiLab, que podría tener términos adicionales no especificados en esta model card.
- La conversión MLX no incluye la funcionalidad de decodificación especulativa ni otras optimizaciones avanzadas; para máxima velocidad en Apple Silicon se recomienda usar el runtime oficial de MLX.

## Enlaces

- [HuggingFace - FredrikKarlssonSpeech/nb-whisper-base-mlx](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-base-mlx)
- [HuggingFace - NbAiLab/nb-whisper-base (modelo original)](https://huggingface.co/NbAiLab/nb-whisper-base)
- [GitHub - NbAiLab/nb-whisper (código de entrenamiento)](https://github.com/NbAiLab/nb-whisper)
- [GitHub - mlx-whisper (herramienta de inferencia)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [HuggingFace - FredrikKarlssonSpeech/nb-whisper-base-onnx (conversión ONNX)](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-base-onnx)
- [HuggingFace - FredrikKarlssonSpeech/nb-whisper-large-onnx (conversión ONNX del modelo large)](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-onnx)
- [ModelScope - nb-whisper-base ONNX](https://www.modelscope.cn/models/onnx-community/nb-whisper-base-ONNX/summary)
- [GitHub - OpenAI Whisper (modelo original)](https://github.com/openai/whisper)
