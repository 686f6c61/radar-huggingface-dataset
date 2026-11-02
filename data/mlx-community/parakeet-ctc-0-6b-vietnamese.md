# mlx-community/parakeet-ctc-0.6b-Vietnamese

## Resumen

Parakeet CTC 0.6B Vietnamese es un modelo de reconocimiento automático del habla (ASR) especializado en vietnamita, desarrollado originalmente por NVIDIA y convertido al formato MLX por la comunidad mlx-community para su ejecución eficiente en hardware Apple Silicon. El modelo se basa en la arquitectura FastConformer con una cabeza de decodificación CTC (Connectionist Temporal Classification) y cuenta con aproximadamente 608,8 millones de parámetros, lo que lo sitúa en la gama media de modelos ASR con un equilibrio razonable entre precisión y coste computacional.

La relevancia de esta versión concreta reside en su formato MLX: permite ejecutar inferencia ASR en Macs con chips M-series (M1, M2, M3, M4) aprovechando la GPU unificada y el framework MLX de Apple, sin necesidad de GPUs NVIDIA ni de infraestructura en la nube. Es una opción práctica para desarrolladores que necesitan transcripción de audio en vietnamita en local, con privacidad de datos y baja latencia.

El modelo deriva del checkpoint original de NVIDIA (`nvidia/parakeet-ctc-0.6b-Vietnamese`) y hereda su licencia NVIDIA Open Model License. Al estar especializado en un único idioma (vietnamita), no es un modelo multilingüe generalista, sino una herramienta vertical para pipelines de transcripción en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabeza CTC |
| Parametros totales | 608.848.897 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente del chunking) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; MLX permite cuantización post-entrenamiento, no documentada en la card) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (MLX) |
| Tamano del repo | 2,4 GB |
| Libreria | mlx |
| Modelo base | nvidia/parakeet-ctc-0.6b-Vietnamese |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada y atención con complejidad lineal en tramos largos. Sobre el encoder se sitúa una cabeza CTC, que predice directamente la secuencia de tokens a partir de los frames acústicos sin necesidad de un decodificador autorregresivo, lo que simplifica el despliegue y reduce la latencia de inferencia.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus en vietnamita, ni si se aplicaron técnicas de aumento de datos o ajuste fino supervisado más allá del entrenamiento CTC estándar. La model card de esta conversión remite a la card original de NVIDIA para esos detalles, que no se incluyen aquí.

La innovación relevante de esta versión es la conversión a MLX, que permite ejecutar el modelo en el framework de Apple con pesos en safetensors y aprovechar la GPU unificada de los chips M-series. La conversión se realizó con un script público enlazado en la card.

## Capacidades

- Reconocimiento automático del habla en vietnamita a partir de audio.
- Decodificación CTC no autorregresiva, lo que permite transcripción rápida y paralelizable.
- Salida de transcripción alineada a nivel de frame (propiedad de los modelos CTC).
- Ejecución local en hardware Apple Silicon mediante MLX.
- Integración con las herramientas `parakeet-mlx` y `mlx-audio` para inferencia por línea de comandos.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta visión, audio generativo ni otras modalidades más allá de la transcripción de voz.
- Capacidad monolingüe: únicamente vietnamita.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo convierte audio en texto de forma local en un Mac, evitando enviar grabaciones confidenciales a servicios en la nube y aprovechando la aceleración MLX.
- Subtitulado automático de vídeo: se puede integrar en un pipeline que extraiga audio con ffmpeg, transcriba con `parakeet-mlx` y genere ficheros SRT para contenido en vietnamita.
- Atención al cliente en vietnamita: transcripción de llamadas o mensajes de voz para su análisis, indexación o enrutamiento posterior, con la ventaja de que el procesamiento local reduce requisitos de cumplimiento de datos.
- Investigación lingüística y corpus: generación de transcripciones a granel de grabaciones en vietnamita para construir corpus anotados, con la salida CTC facilitando la alineación temporal.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en contextos de habla vietnamita, ejecutable en un portátil Apple sin infraestructura adicional.
- Prototipado rápido en macOS: desarrolladores que quieran validar un pipeline ASR en vietnamita antes de escalar a producción pueden usar esta versión MLX como banco de pruebas sin coste de GPU en la nube.
- Preprocesado para otros sistemas: transcripción de audio como entrada para motores de búsqueda, sistemas de resumen o análisis de sentimiento en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 2,4 GB en safetensors; en ejecución se requiere memoria unificada suficiente para cargar los pesos y los buffers de activación, estimada en torno a 3-4 GB para audio de duración moderada.
- GPU recomendadas: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por ser el target de MLX. No está pensado para GPUs NVIDIA en este formato.
- Cabe en consumer hardware: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; idealmente 16 GB para procesar audios largos con holgura.
- Opciones de despliegue: `parakeet-mlx` (CLI), `mlx-audio` (CLI y API Python), y scripts propios sobre MLX. No aplica vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato/modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del chip concreto y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto/audio | Licencia | Formato |
|---|---|---|---|---|---|
| mlx-community/parakeet-ctc-0.6b-Vietnamese | 608,8 M | vietnamita | no disponible | NVIDIA Open Model License | safetensors (MLX) |
| nvidia/parakeet-ctc-0.6b-Vietnamese | 608,8 M | vietnamita | no disponible | NVIDIA Open Model License | safetensors (PyTorch) |
| Whisper large-v3 (referencia) | ~1.550 M | multilingüe (incl. vi) | ventana de 30 s | MIT | safetensors, GGUF, MLX |
| Whisper small (referencia) | ~244 M | multilingüe (incl. vi) | ventana de 30 s | MIT | safetensors, GGUF, MLX |

El modelo de referencia directa es el checkpoint original de NVIDIA en PyTorch, del que esta versión es una conversión funcional. Frente a Whisper, Parakeet CTC ofrece una arquitectura más ligera y una decodificación no autorregresiva que puede reducir latencia, pero carece de la cobertura multilingüe de Whisper y de su ecosistema de despliegue más amplio. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; el audio en otros idiomas producirá salidas incorrectas o sin sentido.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario técnico no visto en entrenamiento.
- La cabeza CTC no proporciona puntuaciones de confianza calibradas de forma estándar; la integración en producción debe añadir validación posterior.
- Licencia NVIDIA Open Model License: conviene revisar los términos completos antes de uso comercial, ya que no es una licencia permisiva tipo MIT o Apache 2.0.
- Formato MLX exclusivo: no es directamente utilizable en GPUs NVIDIA, TPUs ni en la mayoría de servidores Linux sin reconvertir los pesos al checkpoint original de PyTorch.
- No hay información publicada sobre sesgos demográficos o dialectales del corpus vietnamita empleado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su validación por la comunidad es aún inexistente.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso; es estrictamente un modelo ASR.

## Enlaces

- HuggingFace (esta versión MLX): https://huggingface.co/mlx-community/parakeet-ctc-0.6b-Vietnamese
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/parakeet-ctc-0.6b-Vietnamese
- Script de conversión a MLX: https://gist.github.com/senstella/77178bb5d6ec67bf8c54705a5f490bed
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
