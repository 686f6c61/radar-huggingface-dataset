# DerSahaftige/cutlass-align-en

## Resumen

Cutlass-align-en es una exportación a ONNX del modelo `WAV2VEC2_ASR_BASE_960H` de torchaudio, un wav2vec 2.0 base afinado sobre LibriSpeech 960 h por los autores originales de wav2vec 2.0 (fairseq, Facebook AI Research). El modelo se redistribuye bajo licencia MIT y su propósito declarado no es la transcripción libre, sino el alineamiento forzado (forced alignment) a nivel de palabra: dado un audio de 16 kHz mono y una transcripción conocida, produce tiempos por palabra.

El autor, DerSahaftige, lo publica como dependencia del editor de vídeo Cutlass, que lo descarga en el primer uso para colocar marcas temporales en subtítulos. La relevancia práctica es que ofrece un alineador CTC compacto (0,4 GB en el repositorio) en formato ONNX con opset 17, lo que permite ejecutarlo en runtimes ligeros sin depender de PyTorch ni de fairseq en producción.

El modelo es monolingüe (inglés) y hereda las limitaciones del checkpoint original: vocabulario de caracteres en minúscula, sin puntuación, y entrenado exclusivamente con lectura de audiolibros de LibriSpeech. No hay información sobre parámetros publicada en la model card; el tamaño corresponde a la variante base de wav2vec 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 base con cabeza CTC (transformer convolucional + encoder transformer) |
| Parametros totales | no disponible (variante base de wav2vec 2.0; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec 2.0 base original: campo receptivo de ~10 s por ventana de atención) |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (Copyright (c) Facebook, Inc. and its affiliates) |
| Formato de pesos | ONNX (opset 17); etiquetas en `wav2vec2_en.labels.json` |

## Arquitectura y entrenamiento

El modelo subyacente es wav2vec 2.0 base: un extractor convolucional que convierte audio crudo de 16 kHz en representaciones latentes, seguido de un encoder transformer con atención sobre ventanas y un módulo de cuantización con enmascaramiento contrastivo durante el preentrenamiento. Sobre esa base, el checkpoint `WAV2VEC2_ASR_BASE_960H` añade una cabeza CTC afinada con 960 horas de LibriSpeech (subconjuntos train-clean-100, train-clean-360 y train-other-500). El vocabulario de salida es de 29 símbolos: 26 letras minúsculas, apóstrofo, el separador de palabra `|` y el blank CTC `-`.

La exportación a ONNX (opset 17) mantiene una única entrada `audio` con forma 1 × muestras (audio crudo mono a 16 kHz) y una salida `log_probs` con log-softmax por columna. El alineamiento se obtiene aplicando decodificación CTC forzada contra la transcripción de referencia y extrayendo los fotogramas correspondientes a cada palabra. No se documentan en la model card procesos de RLHF, DPO ni ajustes adicionales; el autor declara únicamente la conversión de formato y la publicación del fichero de etiquetas.

## Capacidades

- Alineamiento forzado de palabras: genera tiempos de inicio y fin por palabra a partir de audio y transcripción conocida.
- Reconocimiento de voz CTC en inglés como subproducto del grafo (salida `log_probs` decodificable con vocabulario de caracteres).
- Ejecución sin PyTorch: el grafo ONNX se puede servir con ONNX Runtime, lo que facilita el despliegue en aplicaciones de escritorio y móviles.
- Entrada de audio crudo: no requiere extracción de features externa, solo PCM mono a 16 kHz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Subtitulado automático en editores de vídeo: el caso declarado por el autor; se alinea una transcripción existente con el audio para generar marcas temporales por palabra y montar subtítulos con estilos karaoke o resaltado sincronizado.
- Sincronización de guiones y locuciones: en doblaje o audiolibros, se alinea el texto del guion con la locución grabada para detectar desviaciones de ritmo y generar informes de duración por frase.
- Búsqueda por palabra en archivos de audio: indexar podcasts o grabaciones con transcripción previa y usar los tiempos alineados para saltar a la posición exacta de cada término.
- Control de calidad de transcripciones: comparar la transcripción de un ASR de producción con el audio mediante alineamiento forzado y localizar segmentos donde la confianza CTC cae, para revisión humana selectiva.
- Anotación de corpus lingüísticos: generar alineamientos a nivel de palabra para datasets de fonética o prosodia en inglés, con la ventaja de ejecutarse en ONNX Runtime dentro de pipelines de anotación.
- Herramientas de accesibilidad: sincronizar texto y audio en lectores de subtítulos o aplicaciones de lectura guiada, donde el modelo aporta los tiempos y el texto proviene de otra fuente.
- Integración en aplicaciones de escritorio sin dependencias pesadas: al ser un único fichero ONNX de 0,4 GB, encaja en instaladores de apps que no quieren empaquetar PyTorch ni CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, tasas de alineamiento correcto ni latencias medidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y la variante base de wav2vec 2.0, la inferencia cabe holgadamente en menos de 2 GB de memoria en FP32.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); el modelo es lo bastante pequeño para no requerir A100 ni H100.
- GPU de consumo: sí, cabe en GTX 1060, RTX 2060, RTX 3060, RTX 4090 y similares; también es viable en CPU para audios cortos.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), y conversión adicional a otros runtimes ONNX si se necesita.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cutlass-align-en (este) | no disponible (base wav2vec 2.0) | audio crudo 16 kHz, ventana ~10 s | en | MIT | ONNX |
| torchaudio `WAV2VEC2_ASR_BASE_960H` | base wav2vec 2.0 | audio crudo 16 kHz | en | MIT | PyTorch |
| wav2vec 2.0 large (fairseq) | large wav2vec 2.0 | audio crudo 16 kHz | en | MIT | PyTorch |
| Whisper (OpenAI) | varía por tamano (tiny a large) | audio 30 s por ventana | multilingue | MIT | PyTorch, ONNX, GGML |

La comparación con Whisper es la más relevante en la práctica: Whisper cubre transcripción y timestamps aproximados, mientras que este modelo está especializado en alineamiento exacto a nivel de palabra cuando ya se dispone de la transcripción. Frente al checkpoint original de torchaudio, la diferencia es únicamente el formato (ONNX frente a PyTorch) y el fichero de etiquetas; los pesos y el comportamiento deberían ser equivalentes.

## Limitaciones y advertencias

- Solo inglés: no hay soporte para otros idiomas ni para audio con fuerte acento no nativo sin degradación esperable.
- Depende de una transcripción de referencia: no es un sistema de transcripción autónomo fiable; el alineamiento forzado requiere el texto correcto para producir tiempos útiles.
- Vocabulario restringido: minúsculas, sin puntuación, sin dígitos ni símbolos; los números y signos deben normalizarse antes del alineamiento.
- Dominio de entrenamiento limitado: LibriSpeech es lectura de audiolibros; el rendimiento en conversación espontánea, ruido de fondo o música puede degradarse sin datos publicados que lo cuantifiquen.
- Riesgo de alucinación y desalineamiento: la decodificación CTC forzada puede asignar tiempos incorrectos si el audio y el texto no coinciden o si hay silencios largos.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus de entrenamiento (audiolibros en inglés) puede infrarepresentar variedades dialectales.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de Facebook, Inc. y sus filiales.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso en producción ni de validación independiente por parte de la comunidad.
- Fechas del repositorio (creado en 2026) no verificables con la información disponible; conviene comprobar la integridad de los ficheros con los sha256 publicados antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/DerSahaftige/cutlass-align-en
- Checkpoint original en torchaudio: https://pytorch.org/audio/stable/pipelines.html (referencia `WAV2VEC2_ASR_BASE_960H`)
- Paper wav2vec 2.0 (Baevski et al., 2020): https://arxiv.org/abs/2006.11477
- Repositorio fairseq: https://github.com/facebookresearch/fairseq
- Dataset LibriSpeech: https://www.opensource.org/licenses/MIT (referencia de licencia) y https://www.openslr.org/12
