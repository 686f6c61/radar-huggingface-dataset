# samuelolubukun/murivo-tts-octa-21m

## Resumen

Murivo-TTS Octa 21M es un motor de síntesis de voz (text-to-speech) multilingüe y ultraligero desarrollado por el usuario de Hugging Face `samuelolubukun`. Cubre ocho lenguas africanas —suajili, hausa, yoruba, igbo, luganda, fulfulde, luo y twi— y combina un backbone acústico de tipo Diffusion Transformer (DiT) con flow-matching de aproximadamente 20,9 millones de parámetros con el vocoder neuronal VoxCPM2 Causal AudioVAE, que opera a 48 kHz. El resultado es audio sintetizado a frecuencia de muestreo nativa de estudio (48.000 Hz) generado a entre 13 y 21 veces más rápido que el tiempo real en GPUs convencionales.

El modelo aborda un problema concreto: la escasez de sistemas TTS de calidad para lenguas africanas de bajos recursos, muchas de ellas tonales y con ortografías complejas. Al ser extremadamente pequeño (unos 40 MB en FP16 y 15,5 MB en ONNX INT8), está pensado para despliegue en entornos con recursos limitados, incluidos dispositivos móviles y edge, y funciona de forma 100 % offline.

Su relevancia actual reside en la combinación de un tamaño reducido, cobertura multilingüe de ocho idiomas y una licencia Apache 2.0 permisiva, lo que facilita su integración en productos comerciales y su uso en investigación sobre lenguas africanas. El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, registra 0 descargas y 1 like, lo que indica que se trata de un lanzamiento muy reciente y con escasa adopción todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) de 8 capas con alineador RoPE; vocoder VoxCPM2 Causal AudioVAE |
| Parametros totales | ~20,9 M (backbone acústico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (PyTorch) e INT8 Dynamic Quantization (ONNX) |
| Idiomas soportados | sw, ha, yo, ig, lg, ff, luo, tw (8 lenguas africanas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`murivo_tts_octa.pt`, ~40 MB FP16) y ONNX (`murivo_tts_octa_int8.onnx`, ~15,5 MB INT8) |

## Arquitectura y entrenamiento

El modelo se compone de dos piezas: un backbone acústico de tipo Diffusion Transformer con flow-matching de 8 capas y aproximadamente 20,9 millones de parámetros, equipado con un alineador basado en RoPE, y un vocoder neuronal VoxCPM2 Causal AudioVAE que genera la forma de onda final a 48.000 Hz. El entrenamiento se realizó como un modelo acústico multilingüe unificado, inicializado (warm-start) a partir de un backbone DiT inglés preentrenado de 21M (`samuelolubukun/murivo-tts-21m-english`).

La metodología de entrenamiento incluye batching multilingüe estratificado con ranuras dedicadas de condicionamiento de hablante e idioma (`spk=0..9`) para evitar el sangrado de timbre entre familias de lenguas tonales y no tonales. Se incorpora una cabeza de duración adaptativa con un suelo mínimo de 4 fotogramas (160 ms) para partículas gramaticales aisladas y un suelo multisilábico (≥ 0,95 fotogramas por fonema) para palabras aglutinantes largas. El pipeline de datos emplea aislamiento neuronal con DeepFilterNet 3, fundidos de cruce por cero con ventana de Hanning de 25 ms y nivelación de pico uniforme a 0,95. Las fuentes de datos citadas son WaxalNLP, FLEURS, NaijaVoices, un corpus de estudio de yoruba y narraciones de OpenBible.

## Capacidades

- Síntesis de voz multilingüe en ocho lenguas africanas: suajili, hausa, yoruba, igbo, luganda, fulfulde, luo y twi.
- Generación de audio a 48 kHz con vocoder neuronal VoxCPM2 Causal AudioVAE.
- Condicionamiento de hablante mediante ranuras `spk=0..9`, lo que permite voces diferenciadas por idioma o hablante.
- Manejo de lenguas tonales (yoruba, igbo) y no tonales dentro de un mismo modelo unificado.
- Modelo de duración adaptativa que gestiona tanto partículas gramaticales cortas como palabras aglutinantes largas.
- Inferencia 100 % offline, sin dependencia de servicios externos.
- Despliegue en edge y móvil mediante el archivo ONNX INT8 de 15,5 MB.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el pipeline es exclusivamente text-to-speech.

## Casos de uso

- **Lectura de noticias y contenidos en lenguas africanas**: el modelo puede convertir artículos o boletines en audio a 48 kHz para medios locales que cubren suajili, hausa, yoruba u otras de las ocho lenguas, sin depender de conectividad.
- **Accesibilidad para personas con discapacidad visual**: integración en lectores de pantalla y aplicaciones de asistencia que necesitan voces nativas en lenguas africanas, aprovechando el tamaño reducido del modelo para ejecutarse en dispositivos de gama baja.
- **Asistentes de voz embebidos y offline**: el archivo ONNX INT8 de 15,5 MB permite desplegar síntesis de voz en aplicaciones móviles o dispositivos IoT sin conexión, útil en zonas con conectividad limitada.
- **Educación y aprendizaje de idiomas**: generación de material auditivo para cursos de suajili, yoruba, igbo o twi, con pronunciación nativa y soporte de tonos en las lenguas que los emplean.
- **Audioguías y señalización pública**: síntesis de anuncios y avisos en estaciones, aeropuertos o servicios públicos de regiones donde se hablan estas lenguas, con generación rápida (13-21× tiempo real) para actualizaciones frecuentes.
- **Doblaje y localización de contenido**: producción de pistas de voz para vídeos, cursos o podcasts dirigidos a audiencias africanas, usando el condicionamiento de hablante para mantener voces consistentes entre fragmentos.
- **Investigación en TTS para lenguas de bajos recursos**: el modelo sirve como base reproducible (Apache 2.0, pesos PyTorch y ONNX) para experimentos de fine-tuning y evaluación en lingüística computacional africana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una velocidad de síntesis de 13× a 21× más rápida que el tiempo real en GPUs estándar, sin especificar la GPU empleada ni métricas de calidad (MOS, WER, etc.).

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con un backbone de ~20,9 M de parámetros y pesos FP16 de ~40 MB, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: no se especifican modelos concretos; la model card menciona "GPUs estándar" para la cifra de 13-21× tiempo real.
- **GPU consumer**: sí, cabe en cualquier GPU consumer moderna e incluso en hardware de gama baja; la variante ONNX INT8 de 15,5 MB está pensada para edge y móvil.
- **Opciones de despliegue**: PyTorch (`murivo_tts_octa.pt`) y ONNX Runtime (`murivo_tts_octa_int8.onnx`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks de LLM, no aplicables directamente a este TTS).
- **Latencia y throughput**: 13× a 21× más rápido que el tiempo real según el autor; no se detalla la latencia por frase ni el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Murivo-TTS Octa 21M | ~20,9 M | 48 kHz | 8 lenguas africanas | Apache 2.0 | Hugging Face (PyTorch + ONNX) |
| Murivo-TTS 21M English | ~21 M | no disponible | Inglés | no disponible | Hugging Face (`samuelolubukun/murivo-tts-21m-english`) |
| Alternativas TTS multilingües de gran tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- **Sesgos**: el modelo se entrena con corpus específicos (WaxalNLP, FLEURS, NaijaVoices, OpenBible, corpus de yoruba); puede reflejar los sesgos de hablantes, dialectos y registros presentes en esas fuentes, con cobertura desigual entre las ocho lenguas.
- **Alucinación y errores de pronunciación**: como todo TTS, puede producir pronunciaciones incorrectas, especialmente en lenguas tonales donde un error de tono cambia el significado; no se han publicado métricas de inteligibilidad.
- **Cobertura de idiomas limitada**: solo ocho lenguas africanas; no soporta castellano ni otras lenguas no listadas.
- **Ausencia de benchmarks**: no hay resultados publicados de MOS, WER ni comparaciones objetivas, lo que dificulta evaluar su calidad frente a alternativas.
- **Madurez del proyecto**: 0 descargas y 1 like en el momento de la consulta; proyecto muy reciente (creado el 2026-11-15) sin validación externa conocida.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento citados (WaxalNLP, FLEURS, NaijaVoices, OpenBible) para usos derivados.
- **Contexto y longitud de entrada**: no se documenta la longitud máxima de texto por síntesis ni el comportamiento en entradas muy largas.
- **Producción**: al no haber benchmarks ni informes de latencia por hardware concreto, se recomienda validación propia antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuelolubukun/murivo-tts-octa-21m
- Backbone inglés de partida: https://huggingface.co/samuelolubukun/murivo-tts-21m-english
- Dataset WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset NaijaVoices: https://huggingface.co/datasets/naijavoices/naijavoices-dataset
- Dataset Yoruba TTS: https://huggingface.co/datasets/Hidi-agili/yoruba_tts_dataset
- Dataset Open Bible (multilingual-tts): https://huggingface.co/datasets/multilingual-tts/open-bible
