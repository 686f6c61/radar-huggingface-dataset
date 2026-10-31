# nativ-community/Audio8-TTS-Realistic-0.6b-8bit

## Resumen

Audio8-TTS-Realistic-0.6b-8bit es un modelo de sintetización de voz (text-to-speech) con soporte de clonación de voz zero-shot, publicado por nativ-community como una conversión a MLX del modelo base Edge0/Audio8-TTS-Realistic-0.6b. Genera voz mono a 44,1 kHz de calidad realista y permite replicar una voz de referencia a partir de un clip de audio y su transcripción, sin necesidad de entrenamiento adicional.

El modelo está cuantizado a 8 bits y distribuido en formato safetensors para su ejecución con la librería mlx-audio, lo que lo orienta específicamente a hardware Apple Silicon (Mac con chips M1/M2/M3/M4). Una de sus ventajas prácticas es que el códec de audio va incluido en el repositorio y la inferencia no requiere PyTorch ni código remoto de confianza, simplificando el despliegue local.

Con aproximadamente 938,6 millones de parámetros (pesos reales en safetensors, pese a la denominación "0.6b" del modelo base) y una ventana de contexto compartida de 2.048 posiciones para texto, audio de referencia y fotogramas generados, es un modelo ligero adecuado para generación de voz en local: narración, asistentes de voz, doblaje rápido y prototipado de agentes con salida de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (modelo de audio autorregresivo con códec integrado) |
| Parametros totales | 938.556.145 (pesos reales en safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 2.048 posiciones (compartidas entre texto, audio de referencia y fotogramas generados) |
| Tipos de cuantizacion | 8 bits (versión cuantizada del modelo base Edge0/Audio8-TTS-Realistic-0.6b) |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (23 variedades) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX para mlx-audio) |

Datos adicionales: salida de audio mono a 44,1 kHz; tamaño del repositorio 2,0 GB; el códec conserva su precisión original durante la conversión o cuantización.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR (dual autorregresiva) típica de los sistemas TTS neuronales modernos: un transformador autorregresivo genera fotogramas de tokens de audio a partir del texto de entrada, y un códec neuronal integrado los decodifica en forma de onda. El códec se mantiene en precisión completa incluso en la versión cuantizada a 8 bits, lo que sugiere que la cuantización se aplica al modelo de lenguaje de audio y no al decodificador, preservando la fidelidad del audio final. La generación devuelve una única forma de onda completa por llamada, sin streaming por chunks según la documentación disponible.

Sobre los datos de entrenamiento, el número de tokens, la composición del corpus y el uso de técnicas de alineación o preferencia no constan en la información disponible. El modelo base es Edge0/Audio8-TTS-Realistic-0.6b, y esta ficha corresponde a una conversión comunitaria a MLX con cuantización a 8 bits realizada por nativ-community, optimizada para inferencia en Apple Silicon mediante el framework MLX. No se requiere PyTorch en tiempo de ejecución ni carga de código remoto arbitrario.

## Capacidades

- Texto a voz realista en mono a 44,1 kHz, con una sola pasada de generación por llamada.
- Clonación de voz zero-shot: basta un audio de referencia (`ref_audio`) y su transcripción exacta (`ref_text`) para replicar la voz sin entrenamiento.
- Soporte multilingüe declarado en 23 idiomas y variedades, incluido el castellano (es), además de inglés, chino, japonés, coreano, alemán, francés, italiano, ruso, árabe, portugués y otros.
- Códec de audio incluido en el repositorio: inferencia autónoma sin dependencia de PyTorch ni de código remoto.
- Ejecución eficiente en Apple Silicon mediante MLX y la librería mlx-audio, con pesos cuantizados a 8 bits.
- Presupuesto de contexto compartido de 2.048 posiciones para texto, audio de referencia y fotogramas generados.

No hay constancia de capacidades de tool calling, razonamiento, visión ni generación multi-turno: se trata de un modelo especializado exclusivamente en TTS.

## Casos de uso

- Narración de audiolibros y artículos en castellano: gracias al soporte del idioma es y a la salida a 44,1 kHz, puede convertir textos largos en audio, aunque la ventana de 2.048 posiciones obliga a segmentar el texto en fragmentos.
- Asistentes de voz y agentes locales en Mac: al no requerir PyTorch y ejecutarse con mlx-audio en Apple Silicon, es idóneo para integrar salida de voz en aplicaciones locales que respetan la privacidad del usuario.
- Prototipado de doblaje y localización: la clonación zero-shot permite probar voces para vídeos o contenido multilingüe (hasta 23 idiomas) a partir de un único clip de referencia y su transcripción.
- Generación de voz para podcasts y contenido multimedia: la calidad de 44,1 kHz en mono es adecuada para producción de audio publicable con posproducción ligera.
- Accesibilidad: lectura de interfaces, documentos o correos en voz alta para usuarios con dificultades visuales, integrada en apps de escritorio macOS sin coste de API.
- Desarrollo y pruebas de pipelines TTS: la CLI `python -m mlx_audio.tts.generate` y la API de Python permiten integrarlo en scripts de automatización y CI para generar audio de prueba de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo TTS, las métricas habituales (WER sobre LibriSpeech, SIM para similitud de voz, MOS para calidad percibida) no constan en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con unos 938,6 millones de parámetros a 8 bits más el códec en precisión completa, el repositorio ocupa 2,0 GB; se estima un consumo de memoria de en torno a 2,5-4 GB durante la inferencia (estimación, no dato publicado).
- Hardware objetivo: Apple Silicon (M1, M2, M3 o M4) mediante el framework MLX; es el entorno para el que la conversión está diseñada.
- Consumer: cualquier Mac con al menos 8 GB de memoria unificada debería ejecutarlo con holgura; no hay constancia de soporte CUDA oficial en esta conversión (para GPU NVIDIA habría que recurrir al modelo base Edge0/Audio8-TTS-Realistic-0.6b).
- Despliegue: mediante mlx-audio (API de Python con `mlx_audio.tts.utils.load` o CLI `python -m mlx_audio.tts.generate`). No consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la generación devuelve la forma de onda completa al final de cada llamada, sin streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clonacion zero-shot | Licencia | Plataforma principal |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-8bit | 938,6 M (8 bits) | 2.048 posiciones | Sí | Apache 2.0 | Apple Silicon (MLX) |
| Kokoro (82M) | 82 M | no disponible | No (voces predefinidas) | Apache 2.0 | Multiplataforma (PyTorch/ONNX) |
| XTTS-v2 (Coqui) | ~750 M | no disponible | Sí | Licencia Coqui (uso comercial restringido) | Multiplataforma (PyTorch) |

Comparado con Kokoro, Audio8 es más grande pero ofrece clonación de voz zero-shot, que Kokoro no incluye. Frente a XTTS-v2, ofrece una licencia Apache 2.0 sin restricciones comerciales y ejecución nativa en Apple Silicon sin PyTorch, aunque XTTS-v2 tiene un ecosistema más maduro y documentación más amplia.

## Limitaciones y advertencias

- Ventana de contexto reducida: el presupuesto compartido de 2.048 posiciones limita la longitud del texto, el audio de referencia y el audio generado por llamada; textos largos requieren segmentación manual.
- Sin streaming: la generación devuelve la forma de onda completa al terminar, lo que puede añadir latencia perceptible en aplicaciones interactivas.
- Calidad variable entre idiomas: aunque se declaran 23 idiomas, no hay datos públicos de calidad (WER/MOS) por idioma; el rendimiento en castellano debe validarse empíricamente.
- Riesgos éticos de la clonación de voz: replicar voces zero-shot puede usarse para suplantación o deepfakes de audio; es responsabilidad del usuario contar con consentimiento y cumplir la normativa aplicable (en la UE, la AI Act clasifica el deepfake de voz como riesgo de transparencia).
- Conversión comunitaria: esta versión es una cuantización de terceros (nativ-community) del modelo base de Edge0; la cuantización a 8 bits puede introducir ligeras degradaciones respecto al modelo original, y el soporte depende del mantenedor de la conversión (71 descargas en el momento de los datos).
- Sin benchmarks publicados: no hay métricas objetivas de calidad ni de velocidad, por lo que la evaluación previa a producción corre a cargo del desarrollador.
- Licencia: Apache 2.0, sin restricciones de uso comercial conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/Audio8-TTS-Realistic-0.6b-8bit
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Librería mlx-audio: https://github.com/Banafo/mlx-audio (repositorio de referencia de la librería; no se ha proporcionado enlace oficial en la información disponible)
