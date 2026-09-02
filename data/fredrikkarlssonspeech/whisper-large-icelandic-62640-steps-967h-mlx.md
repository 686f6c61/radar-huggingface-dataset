# FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx

## Resumen

El modelo `whisper-large-icelandic-62640-steps-967h-mlx` es una conversión al formato MLX (Apple Silicon) del modelo `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h`, un fine-tuning de `openai/whisper-large` para reconocimiento automático de voz (ASR) en islandés. El modelo original fue entrenado por el Language and Voice Laboratory (LVL) de Islandia con 967 horas de audio procedentes de la plataforma Samrómur, durante 62 640 pasos de entrenamiento. Esta versión MLX está pensada para ejecutarse de forma eficiente en hardware Apple mediante la librería `mlx-whisper`.

La relevancia de este modelo radica en que el islandés es un idioma de bajos recursos, con pocos sistemas ASR de calidad disponibles. Este fine-tuning de Whisper large ofrece una solución de transcripción específica para islandés, con una licencia permisiva (CC-BY 4.0) y un formato optimizado para dispositivos Apple, lo que facilita su integración en aplicaciones locales sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large (encoder-decoder transformer, 32 capas encoder, 32 capas decoder) |
| Parametros totales | Aproximadamente 1550 millones (según arquitectura Whisper large) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | float16 (conversión MLX) |
| Idiomas soportados | Islandés (is) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | MLX (archivos .npz o .safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper large de OpenAI, un transformer encoder-decoder con atención de escala completa, entrenado originalmente con 680 000 horas de audio multilingüe. En este caso, se realizó un fine-tuning supervisado sobre el modelo preentrenado `openai/whisper-large` con 967 horas de habla islandesa recopiladas a través de la plataforma Samrómur, un proyecto colaborativo de la Language and Voice Laboratory. El entrenamiento duró 62 640 pasos, aunque no se especifican hiperparámetros concretos como tasa de aprendizaje o tamaño de lote. No se menciona el uso de RLHF u otras técnicas de alineación.

La conversión a MLX se llevó a cabo con el script `convert.py` de `mlx-examples/whisper` a precisión float16, lo que reduce el tamaño del modelo y acelera la inferencia en chips Apple Silicon sin pérdida significativa de calidad.

## Capacidades

- Reconocimiento automático de voz (ASR) en islandés: transcribe audio a texto con alta precisión para este idioma.
- Manejo de audio de hasta 30 segundos por segmento, con soporte para segmentación automática en archivos largos.
- Sin soporte para otros idiomas: el modelo está especializado exclusivamente en islandés.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni generación de texto general.
- Funciona como modelo de transcripción puro, sin detección de idioma adicional (se asume islandés).

## Casos de uso

- Transcripción de reuniones y conferencias en islandés: el modelo puede procesar grabaciones de audio y generar actas textuales, útil para empresas y administraciones públicas islandesas.
- Subtitulado de vídeos en islandés: integrable en pipelines de postproducción para generar subtítulos automáticos en contenido audiovisual.
- Asistentes de voz en islandés: combinado con un sistema de síntesis de voz, permite crear interfaces conversacionales en islandés para dispositivos Apple.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos en islandés.
- Archivado y búsqueda de contenido audiovisual: indexación de archivos de audio mediante transcripciones para búsqueda por texto.
- Aplicaciones de dictado en islandés: utilizable en editores de texto o entornos de desarrollo para entrada de voz en islandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere hardware Apple Silicon (M1, M2, M3 o superior) para ejecutar el modelo en formato MLX.
- VRAM estimada: aproximadamente 3 GB de memoria unificada para el modelo en float16 (Whisper large tiene ~1.55B parámetros).
- Se recomienda al menos 8 GB de RAM unificada para cargar el modelo y procesar audio sin problemas.
- No es compatible con GPUs NVIDIA o AMD; el formato MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx-whisper` (CLI y API de Python), integrable en aplicaciones macOS/iOS.
- Latencia: en un M1 Pro, la transcripción de un minuto de audio suele tardar unos pocos segundos, aunque no hay datos oficiales publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `whisper-large-icelandic-62640-steps-967h-mlx` (este) | ~1550M | 30 s audio | Islandés | CC-BY-4.0 | MLX |
| `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h` | ~1550M | 30 s audio | Islandés | CC-BY-4.0 | PyTorch (safetensors) |
| `openai/whisper-large-v3` | ~1550M | 30 s audio | Multilingüe (incluye islandés) | MIT | PyTorch, ONNX, etc. |

La versión MLX es funcionalmente equivalente al modelo original en PyTorch, pero optimizada para Apple Silicon. Frente a Whisper large-v3, que también soporta islandés, este modelo está específicamente afinado para el idioma, por lo que probablemente ofrezca mayor precisión en islandés a costa de perder la capacidad multilingüe.

## Limitaciones y advertencias

- El modelo solo reconoce islandés; no es adecuado para transcripción multilingüe.
- No se han evaluado sesgos de género, acento o dialecto en la información disponible; el entrenamiento se basa en datos de Samrómur, que pueden no representar todas las variantes dialectales del islandés.
- Al ser un fine-tuning de Whisper large, puede heredar ciertas limitaciones del modelo base, como errores en nombres propios o palabras poco frecuentes.
- La ventana de audio fija de 30 segundos puede dificultar la transcripción de audio muy largo si no se gestiona correctamente la segmentación.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al autor original.
- No hay garantías de soporte técnico ni mantenimiento continuado del modelo.

## Enlaces

- [Modelo en HuggingFace (MLX)](https://huggingface.co/FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx)
- [Modelo original (PyTorch)](https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h)
- [Repositorio mlx-whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [Página del proyecto Samrómur](https://samromur.is/) (referencia de los datos de entrenamiento)
