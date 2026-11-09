# s1lvrn0/whiscribe-diarization

## Resumen

Whiscribe-diarization es un repositorio de dos modelos ONNX publicados por el usuario s1lvrn0 para realizar diarización de hablantes (identificar quién habla y cuándo) en la aplicación Android Whiscribe, que transcribe audio en el propio dispositivo. No es un modelo de lenguaje ni un modelo generativo: son dos componentes de un pipeline de audio, una segmentación de hablantes derivada de pyannote segmentation 3.0 y un extractor de embeddings de voz basado en ReDimNet2-B3. Ambos están exportados a ONNX para ejecutarse con el proveedor CPU de ONNX Runtime, sin necesidad de GPU.

El primer modelo, `pyannote-segmentation-3.0.onnx` (unos 6 MB), recibe ventanas de 10 segundos a 16 kHz y produce, por fotograma, las puntuaciones de 7 clases powerset que indican qué combinación de hasta tres hablantes está activa. El segundo, `redimnet2-b3-vox2-lm.onnx` (unos 18 MB), convierte un fragmento de audio de un solo hablante en un vector de 192 dimensiones que permite comparar voces por similitud coseno. La relevancia actual reside en que ofrece un pipeline de diarización completamente offline y ligero, apto para móviles, con licencia MIT y sin dependencia de servicios en la nube.

El autor no ha reentrenado nada: son conversiones directas de pesos existentes (pyannote vía sherpa-onnx y ReDimNet2 de Palabra.ai), empaquetadas junto con una descripción del pipeline de agrupamiento que usa la app. El repositorio no incluye código de inferencia completo ni la aplicación, solo los dos ficheros ONNX y las notas de diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: segmentación de hablantes (pyannote segmentation 3.0, powerset) + extractor de embeddings (ReDimNet2-B3) |
| Parametros totales | no disponible (solo se indica el tamaño de los ficheros ONNX: 5.992.913 y 18.041.088 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de segmentación de 10 s (160.000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son ONNX float32) |
| Idiomas soportados | no disponible (el autor menciona evaluaciones con voces en ocho idiomas, sin listarlos) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17 en el caso de ReDimNet2) |

## Arquitectura y entrenamiento

La segmentación emplea el modelo pyannote segmentation 3.0 de pyannote/CNRS, que trabaja sobre ventanas de 10 segundos muestreadas a 16 kHz y genera una salida `[batch, 589, 7]`: 589 fotogramas por ventana y 7 clases powerset (nadie, hablante 1, hablante 2, hablante 3, 1+2, 1+3, 2+3). El fichero publicado es la conversión ONNX de sherpa-onnx, sin modificaciones. El extractor de embeddings es ReDimNet2-B3 de Palabra.ai, entrenado únicamente con VoxCeleb2, exportado a ONNX con el script `export_redimnet2_onnx.py` del repositorio oficial en el commit `c5bbe0b76e37df698c403f8844e41304ceab6307` mediante el exportador TorchScript de PyTorch. El autor verifica que los embeddings ONNX coinciden con los de PyTorch con similitud coseno de 1.000000 en fragmentos de 0,5 a 10 segundos.

No se ha reentrenado ningún componente. El pipeline que describe la model card aplica segmentación sobre ventanas de 10 s con salto de 2,5 s, extrae un embedding por cada hablante detectado en la ventana usando solo el audio en el que habla en solitario, agrupa con clustering de enlace promedio sobre distancia coseno con umbral de corte en 0,6 y fusiona los clusters pequeños con el más cercano en el tiempo. Las evaluaciones se realizaron sobre reuniones AMI y conversaciones sintéticas con voces reales en ocho idiomas, aunque no se publican cifras.

## Capacidades

- Segmentación de hablantes con soporte de hasta tres hablantes simultáneos por ventana (salida powerset de 7 clases).
- Extracción de embeddings de voz de 192 dimensiones a partir de audio mono a 16 kHz en el rango [-1, 1], de cualquier duración (la app usa 0,5 s o más).
- Comparación de voces mediante similitud coseno entre embeddings.
- Diarización completa mediante la combinación de segmentación, embeddings y clustering de enlace promedio.
- Ejecución en CPU mediante ONNX Runtime, sin GPU.
- Diseñado para despliegue en Android (tamaño reducido: ~24 MB entre ambos modelos).
- No realiza reconocimiento de voz, traducción, generación de texto ni tool calling; es un componente específico de audio.

## Casos de uso

- Diarización offline en aplicaciones móviles de transcripción: el pipeline completo cabe en ~24 MB y se ejecuta en CPU, por lo que puede integrarse en apps Android que transcriben reuniones o notas de voz sin enviar audio a la nube, preservando la privacidad.
- Etiquetado de reuniones y actas: combinado con un motor ASR, permite atribuir cada fragmento transcrito a un hablante concreto, útil para generar actas con intervinientes identificados en entornos como AMI, sobre los que el autor reporta evaluación.
- Indexación y búsqueda por voz en archivos de audio: los embeddings de 192 dimensiones permiten agrupar y buscar fragmentos de una misma persona en grabaciones largas mediante similitud coseno.
- Análisis de entrevistas y podcasts: separar las intervenciones del entrevistador y del entrevistado para facilitar la edición o la generación de subtítulos con etiquetas de hablante.
- Segmentación previa para pipelines ASR: usar la salida de segmentación para trocear el audio en regiones de habla única y alimentar un reconocedor con fragmentos limpios, mejorando la calidad de la transcripción.
- Investigación en diarización de bajo coste: servir como referencia ligera y reproducible para comparar pipelines de clustering o evaluar el impacto del umbral de corte (0,6) en distintos corpus.
- Aplicaciones de accesibilidad: identificar cambios de hablante en tiempo real en conversaciones para sistemas de subtitulado en directo en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona evaluaciones sobre AMI y conversaciones sintéticas en ocho idiomas, pero no incluye métricas (DER, tasa de error de diarización) ni tablas comparativas.

## Requisitos de hardware

- VRAM: no aplica; ambos modelos están pensados para ejecutarse en CPU con ONNX Runtime.
- Tamaño en disco/memoria: aproximadamente 6 MB (segmentación) + 18 MB (embeddings) = ~24 MB en float32.
- GPU recomendadas: ninguna necesaria; funciona en CPU. Podría acelerarse con proveedores ONNX de GPU (CUDA, CoreML, NNAPI) si se configura, aunque no se documenta.
- Cabe en cualquier dispositivo Android moderno y en CPU de escritorio sin requisitos relevantes.
- Despliegue: ONNX Runtime (proveedor CPU por defecto). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La app procesa ventanas de 10 s con salto de 2,5 s, lo que implica solapamiento del 75 %, pero no se publican tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whiscribe-diarization (este) | Segmentación + embeddings ONNX | ~24 MB | Ventana de 10 s | MIT | Hugging Face |
| pyannote segmentation 3.0 original | Segmentación | no disponible | Ventana de 10 s | MIT | pyannote / sherpa-onnx |
| ReDimNet2-B3 original (PyTorch) | Embeddings de voz | no disponible | Audio de cualquier duración | MIT (pesos b3-vox2-lm) | GitHub Palabra.ai |
| WeSpeaker / ResNet de referencia | Embeddings de voz | no disponible | no disponible | variable | no disponible |

La comparativa directa con otros pipelines de diarización (por ejemplo, pyannote speaker-diarization 3.0 completo o soluciones comerciales) no está disponible en la información proporcionada. Este repositorio se distingue por su empaquetado ONNX ligero y su orientación a dispositivos móviles.

## Limitaciones y advertencias

- Solo admite hasta tres hablantes simultáneos por ventana; solapamientos con más voces no se representan correctamente.
- El umbral de clustering (0,6) y la fusión de clusters pequeños son heurísticas descritas por el autor; su comportamiento puede degradarse en conversaciones con voces similares o ruido.
- No se publican métricas de error de diarización (DER) ni evaluaciones reproducibles; las afirmaciones sobre AMI y ocho idiomas no están cuantificadas.
- El modelo de embeddings se entrenó solo con VoxCeleb2, cuyo audio proviene de entrevistas de YouTube; puede presentar sesgos hacia ese dominio y hacia determinados acentos, géneros y edades.
- Los metadatos de VoxCeleb2 son CC BY-SA 4.0 y los derechos de los vídeos pertenecen a sus propietarios; el autor advierte de esta procedencia. Los pesos de ReDimNet2 entrenados con VoxBlink2 (CC BY-NC-SA) no se usan, lo que evita restricciones no comerciales.
- La licencia del repositorio es MIT, pero conviene verificar las licencias de los componentes originales (pyannote y ReDimNet2) para uso comercial.
- No incluye código de inferencia completo ni la app; el usuario debe implementar el pipeline de segmentación, extracción y clustering.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s1lvrn0/whiscribe-diarization
- pyannote-audio (GitHub): https://github.com/pyannote/pyannote-audio
- Conversión ONNX de pyannote segmentation en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-segmentation-models
- ReDimNet2 (GitHub, Palabra.ai): https://github.com/PalabraAI/redimnet2
