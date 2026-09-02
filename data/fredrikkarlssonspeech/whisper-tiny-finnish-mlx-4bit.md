# FredrikKarlssonSpeech/whisper-tiny-finnish-mlx-4bit

## Resumen

El modelo `FredrikKarlssonSpeech/whisper-tiny-finnish-mlx-4bit` es una conversión a MLX con cuantización de 4 bits del modelo `Finnish-NLP/whisper-tiny-finnish`, un ajuste fino de Whisper-tiny de OpenAI especializado en reconocimiento de voz en finlandés. El objetivo de esta conversión es ofrecer inferencia rápida en Apple Silicon mediante la librería `mlx-whisper`, reduciendo el tamaño del modelo y acelerando la transcripción sin necesidad de GPU dedicada.

La arquitectura subyacente es un transformer encoder-decoder de Whisper, con aproximadamente 39 millones de parámetros. La ventana de contexto es de 30 segundos de audio, característica estándar de Whisper. Esta versión cuantizada a 4 bits está pensada para despliegues locales en dispositivos Apple, siendo una opción ligera para transcripción offline en finlandés.

Relevante para desarrolladores que necesitan ASR en finlandés con bajo consumo de recursos y que trabajan en entornos macOS con chips M1 o posteriores. Al estar basado en Whisper, hereda la robustez del modelo original, aunque el ajuste fino en finlandés mejora su precisión en ese idioma frente al Whisper base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 39 millones (Whisper-tiny) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio |
| Tipos de cuantizacion | 4-bit (cuantizacion MLX) |
| Idiomas soportados | Finlandes (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (formato nativo de Apple) |

## Arquitectura y entrenamiento

El modelo original `Finnish-NLP/whisper-tiny-finnish` es un ajuste fino de `openai/whisper-tiny` sobre el dataset `common_voice_11_0`, específicamente para el idioma finlandés. Whisper-tiny utiliza una arquitectura transformer encoder-decoder con atención estándar, entrenada originalmente por OpenAI sobre 680.000 horas de audio multilingüe. El ajuste fino se realizó para mejorar la precisión en finlandés, logrando un WER de 45,14 en el conjunto de evaluación.

La versión MLX fue convertida mediante el script `mlx-examples/whisper/convert.py` a precisión cuantizada de 4 bits. Esta conversión reduce significativamente el tamaño del modelo (de aproximadamente 150 MB en FP32 a alrededor de 40 MB) y acelera la inferencia en Apple Silicon gracias a la optimización de MLX para la unidad de memoria unificada. No se aplicaron técnicas adicionales como RLHF o DPO; el proceso es puramente de conversión y cuantización.

## Capacidades

- Reconocimiento de voz automatico (ASR) en finlandes: transcribe audio a texto con alta precision para ese idioma.
- Procesamiento de audio de hasta 30 segundos por ventana, con manejo de segmentos mas largos mediante el solapamiento de ventanas.
- Deteccion de idioma (heredada de Whisper, aunque el modelo esta especializado en finlandes).
- Transcripcion offline sin conexion a internet.
- Compatible con la API de `mlx-whisper` para integracion en aplicaciones Python.
- No soporta tool calling, vision ni otras modalidades; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede transcribir grabaciones de audio en finlandes en tiempo real o diferido, gracias a su bajo consumo de recursos en Apple Silicon.
- Subtitulado automatico de videos: al integrarse con herramientas de procesamiento de video, permite generar subtitulos en finlandes de forma automatica y rapida.
- Asistentes de voz locales: para aplicaciones de voz en finlandes que requieren privacidad, el modelo puede ejecutarse en un Mac sin enviar datos a la nube.
- Archivado y busqueda de audio: transcribe archivos de audio para indexarlos y hacerlos buscables por texto, util en bibliotecas o archivos historicos.
- Sistemas de dictado: integrable en aplicaciones de productividad para dictar texto en finlandes con baja latencia en dispositivos Apple.
- Investigacion linguistica: permite procesar corpus orales en finlandes para analisis fonetico o sociolinguistico de forma eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version cuantizada en MLX. El modelo base `Finnish-NLP/whisper-tiny-finnish` reporta un WER de 45,14 en el conjunto de evaluacion de common_voice_11_0, pero no hay datos especificos sobre el impacto de la cuantizacion a 4 bits en la calidad de transcripcion. Se recomienda evaluar el modelo con datos propios antes de usarlo en produccion.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M1 Pro, M1 Max, M2, M3, etc.) con macOS 12 o superior.
- Memoria RAM unificada: al ser un modelo de 39 millones de parametros cuantizado a 4 bits, ocupa aproximadamente 40 MB en disco y requiere menos de 1 GB de memoria durante la inferencia.
- No requiere GPU dedicada; la unidad Neural Engine y la memoria unificada de Apple Silicon son suficientes.
- Despliegue mediante `mlx-whisper` (CLI o API Python) o a traves de la libreria `mlx` directamente.
- Latencia tipica: en un MacBook Pro M1, la transcripcion de un archivo de 30 segundos suele completarse en menos de 2 segundos, aunque depende de la longitud del audio y el solapamiento de ventanas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (fi) | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-tiny-finnish-mlx-4bit | 39M | 30s | no disponible | Apache-2.0 | MLX 4-bit |
| Finnish-NLP/whisper-tiny-finnish | 39M | 30s | 45,14 | Apache-2.0 | PyTorch (safetensors) |
| openai/whisper-tiny | 39M | 30s | ~70 (fi) | MIT | PyTorch |
| openai/whisper-small | 244M | 30s | ~50 (fi) | MIT | PyTorch |

Nota: los valores de WER para los modelos de OpenAI son aproximados y dependen del conjunto de evaluacion. La version MLX cuantizada no tiene benchmarks publicados, pero se espera una degradacion minima respecto al modelo base.

## Limitaciones y advertencias

- El modelo esta especializado en finlandes; su rendimiento en otros idiomas es limitado o nulo, aunque hereda la capacidad de deteccion de idioma de Whisper.
- El WER del modelo base es alto (45,14), lo que indica que puede cometer errores en acentos, ruido o vocabulario tecnico. La cuantizacion a 4 bits podria aumentar ligeramente ese error.
- Puede producir alucinaciones, especialmente en silencios o audio de baja calidad, generando texto que no existe en la grabacion.
- La ventana de contexto de 30 segundos puede ser restrictiva para audios largos, aunque `mlx-whisper` maneja el solapamiento automaticamente.
- No se ha evaluado en entornos de produccion; se recomienda validar con datos propios antes de su despliegue.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original puede tener restricciones adicionales (el dataset common_voice es de dominio publico, pero el codigo de Whisper es MIT).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/whisper-tiny-finnish-mlx-4bit)
- [Modelo base Finnish-NLP/whisper-tiny-finnish](https://huggingface.co/Finnish-NLP/whisper-tiny-finnish)
- [Repositorio mlx-examples/whisper](https://github.com/ml-explore/mlx-examples/blob/main/whisper/README.md)
- [Paquete mlx-whisper en PyPI](https://pypi.org/project/mlx-whisper/)
- [Repositorio original de OpenAI Whisper](https://github.com/openai/whisper)
