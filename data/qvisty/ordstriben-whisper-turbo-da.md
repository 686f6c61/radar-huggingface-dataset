# Qvisty/ordstriben-whisper-turbo-da

## Resumen

`Qvisty/ordstriben-whisper-turbo-da` es una conversión a formato sherpa-onnx con cuantización int8 del modelo `thorhojhus/whisper-large-v3-turbo-danish`, un ajuste fino sobre `openai/whisper-large-v3-turbo` especializado en reconocimiento automático del habla (ASR) en danés. Lo publica el equipo de la aplicación de dictado Ordstriben con permiso del autor del modelo original, Thor Højhus Avenstrup Jensen, y su propósito es permitir la transcripción offline en un teléfono sin conexión a internet.

El modelo no ha sido reentrenado: es una exportación de los pesos originales al formato ONNX de sherpa-onnx, con cuantización dinámica int8 aplicada por el script de exportación. El repositorio ocupa aproximadamente 1,0 GB y contiene únicamente el encoder, el decoder y el vocabulario en int8; los pesos originales en precisión completa permanecen en el repositorio de origen.

Su relevancia es práctica: demuestra un flujo de despliegue de Whisper large-v3-turbo en dispositivos de recursos limitados mediante sherpa-onnx, con una licencia MIT sobre los pesos y unos resultados medidos en el conjunto de test FLEURS `da_dk` que superan claramente a un Whisper small genérico en danés (8,6 % de WER frente a 36,0 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (large-v3-turbo), exportado a ONNX |
| Parametros totales | 809 M (modelo fuente); tamano del repo int8 ~1,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 segundos |
| Tipos de cuantizacion | int8 dinamico (solo se publican ficheros int8) |
| Idiomas soportados | danes (da) |
| Licencia | MIT (pesos); el modelo fuente y OpenAI Whisper son MIT |
| Formato de pesos | ONNX int8 (`turbo-da-encoder.int8.onnx`, `turbo-da-decoder.int8.onnx`) + `turbo-da-tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con 128 bins mel en la entrada, entrenado originalmente con supervisión débil a gran escala (paper arXiv:2212.04356). El modelo fuente `thorhojhus/whisper-large-v3-turbo-danish` es un ajuste fino en danés sobre esa base, con 809 M de parámetros; según su model card, los datos de entrenamiento incluyen CoRal v3, Common Voice 26.0, FLEURS, FTSpeech, NST Danish y una cantidad considerable de audio danés pseudo-etiquetado de origen no especificado.

Esta publicación concreta no añade entrenamiento: los pesos se renombraron al layout de OpenAI Whisper, se cargaron con `openai-whisper` 20250625 en modo estricto (sin tensores faltantes ni inesperados) y se exportaron con `scripts/whisper/export-onnx.py` de sherpa-onnx v1.13.8, usando el exportador TorchScript heredado (`dynamo=False`) y la cuantización int8 dinámica propia del script. Las versiones empleadas fueron torch 2.15.0 (CPU), onnx 1.23.2, onnxruntime 1.32.0 y Python 3.13. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en danés, con decodificación greedy y tarea `transcribe`.
- Ejecución completamente offline mediante sherpa-onnx, sin dependencia de red.
- Procesamiento de audio en ventanas de hasta 30 segundos.
- API de integración sencilla en Python mediante `sherpa_onnx.OfflineRecognizer.from_whisper`.
- Soporte de puntuación y texto en minúsculas en la salida (la evaluación se hizo normalizando ambos).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento extendido.

## Casos de uso

- Dictado offline en aplicación móvil: es el caso de uso original (la app Ordstriben); el modelo se ejecuta en el dispositivo sin conexión y transcribe voz danesa en ventanas de hasta 30 segundos.
- Transcripción de reuniones y notas de voz en danés: con ~3,0 s por clip de 12 s en una CPU de 4 núcleos, es adecuado para procesamiento por lotes de grabaciones cortas.
- Subtitulado de contenido audiovisual danés: la ventana de 30 segundos encaja con segmentos de subtitulado típicos y el WER de 8,6 % en FLEURS es razonable para este fin.
- Sistemas de accesibilidad para hablantes de danés: transcripción local sin enviar audio a la nube, útil por privacidad.
- Investigación en ASR de bajos recursos: sirve como referencia de un Whisper turbo ajustado a un idioma concreto y cuantizado para comparativas.
- Prototipado de pipelines ASR en entornos sin GPU: el formato ONNX int8 permite desplegar en CPU y en dispositivos embebidos con sherpa-onnx.
- Archivado y búsqueda de audio en danés: transcripción por lotes de archivos para indexación textual, siempre que los clips se segmenten a menos de 30 segundos.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los ficheros int8 exactos con sherpa-onnx 2.0.3 (Python), decodificación greedy, en 308 grabaciones (58 minutos) del split de test FLEURS `da_dk` (una de cada tres filas), con texto en minúsculas y sin puntuación antes de puntuar.

| Modelo (int8, sherpa-onnx) | WER | CER |
|---|---:|---:|
| `csukuangfj/sherpa-onnx-whisper-small` genérico | 36,0 % | 13,8 % |
| `ordstriben-whisper-small-da` (danés small) | 10,2 % | 3,8 % |
| `ordstriben-whisper-turbo-da` (este modelo) | 8,6 % | 3,1 % |

Velocidad: en una CPU cloud de 4 núcleos, con 24 clips de 12 segundos de media, el modelo tardó unos 3,0 segundos por clip. No se han medido velocidad ni consumo de memoria en teléfono. El autor advierte que el split de entrenamiento de FLEURS formó parte de los datos de entrenamiento del modelo fuente, por lo que la evaluación no es completamente independiente, y que la normalización de texto no maneja numerales; los números deben tomarse como indicativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo int8 ocupa ~1,0 GB, por lo que la huella en memoria es del orden de 1 GB en CPU o GPU.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU (la exportación y las pruebas se hicieron en CPU). Cualquier GPU con al menos ~2 GB de memoria libre debería poder alojarlo, pero no hay datos publicados.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU consumer moderna (RTX 3060 o superior) por el tamaño int8, aunque no está verificado en la información disponible.
- Despliegue: sherpa-onnx (Python y otros bindings), con `OfflineRecognizer.from_whisper`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~3,0 s por clip de 12 s en CPU de 4 núcleos (24 clips de prueba). Sin datos de throughput agregado ni de latencia en móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS da_dk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ordstriben-whisper-turbo-da` (este) | 809 M (int8) | 30 s de audio | 8,6 % | MIT | ONNX int8 en HF |
| `ordstriben-whisper-small-da` | no disponible | 30 s de audio | 10,2 % | no disponible | sherpa-onnx en HF |
| `csukuangfj/sherpa-onnx-whisper-small` (genérico) | no disponible | 30 s de audio | 36,0 % | no disponible | sherpa-onnx en HF |
| `thorhojhus/whisper-large-v3-turbo-danish` (fuente) | 809 M | 30 s de audio | no disponible | MIT | pesos originales en HF |

## Limitaciones y advertencias

- Solo danés: no se comprobaron otros idiomas tras el ajuste fino.
- El audio se procesa en ventanas de hasta 30 segundos; clips más largos requieren segmentación externa.
- El silencio, el ruido y los nombres poco frecuentes pueden producir texto incorrecto.
- La cuantización int8 puede costar algo de precisión frente a los pesos originales.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos ruidosos o silenciosos.
- La licencia MIT cubre los pesos, pero no altera los términos de los datos de entrenamiento del modelo fuente: CoRal v3 impone restricciones (no usar para síntesis de voz que imite a una persona concreta, suplantación de identidad ni inferencia de rasgos como género, edad o salud); FTSpeech se basa en grabaciones del Folketinget y el parlamento danés no respalda este modelo ni ningún producto que lo use.
- El modelo fuente incluye audio pseudo-etiquetado de origen no declarado, lo que añade incertidumbre sobre los derechos de los datos.
- La evaluación en FLEURS no es totalmente independiente porque ese split formó parte del entrenamiento del modelo fuente.
- No se han medido velocidad ni memoria en teléfono, que es el objetivo declarado del modelo.
- No se incluyen audio ni transcripciones de entrenamiento en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qvisty/ordstriben-whisper-turbo-da
- Modelo fuente: https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Dataset CoRal v3 y su licencia: https://huggingface.co/datasets/CoRal-project/coral-v3
- Términos del Folketinget sobre grabaciones: https://www.ft.dk/da/aktuelt/tv-fra-folketinget/deling-og-rettigheder
