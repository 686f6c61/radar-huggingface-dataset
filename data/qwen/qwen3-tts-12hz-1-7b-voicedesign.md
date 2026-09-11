# Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es la variante de diseño de voz de la familia Qwen3-TTS, una serie de modelos de generación de habla desarrollada por Qwen (Alibaba). El modelo convierte texto en audio y permite definir el timbre, la emoción y la prosodia mediante instrucciones en lenguaje natural, sin necesidad de disponer de una muestra de referencia. Se distribuye bajo licencia Apache 2.0, con 1.916.676.352 parámetros (unos 1,92 mil millones) y un repositorio de 4,5 GB en HuggingFace, donde acumula 291.114 descargas y 407 «me gusta».

La arquitectura se describe como un modelo de lenguaje discreto con múltiples codebooks (discrete multi-codebook LM) construido sobre el tokenizador propio Qwen3-TTS-Tokenizer-12Hz, que opera a 12 Hz y permite compresión acústica eficiente y generación en streaming con una latencia declarada de 97 ms. La serie cubre diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y perfiles dialectales.

Su relevancia actual radica en que combina control de voz mediante lenguaje natural, clonación de voz y latencia de streaming inferior a 100 ms en un modelo de menos de 2.000 millones de parámetros con licencia permisiva, lo que facilita su integración en asistentes conversacionales, doblaje y producción de audio sin depender de API propietarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto con múltiples codebooks (discrete multi-codebook LM) sobre el tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.916.676.352 (aproximadamente 1,92 mil millones), según los pesos safetensors publicados |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en safetensors y el ejemplo oficial carga en bfloat16 |
| Idiomas soportados | 10 idiomas según la model card: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, además de perfiles dialectales. El metadato de HuggingFace no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería de inferencia | qwen-tts |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 4,5 GB |
| Fecha de creación | 21 de enero de 2026 |
| Última actualización | 29 de enero de 2026 |

## Arquitectura y entrenamiento

Qwen3-TTS emplea una arquitectura extremo a extremo basada en un modelo de lenguaje discreto con múltiples codebooks. El texto se traduce en tokens acústicos que el modelo genera de forma autorregresiva y que después se reconstruyen como audio, evitando los cuellos de botella de información de los pipelines clásicos de TTS (texto → fonemas → espectrograma → vocoder). La representación acústica la aporta el tokenizador propio Qwen3-TTS-Tokenizer-12Hz, que trabaja con una tasa de 12 Hz y combina compresión acústica eficiente con modelado semántico de alta dimensión. Esta tasa reducida implica menos tokens por segundo de audio, lo que reduce el coste de generación y habilita la síntesis en streaming.

La model card no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de optimización por preferencias como RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá del tokenizador propietario, la arquitectura discreta multi-codebook y la latencia de streaming declarada de 97 ms.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, más perfiles dialectales.
- Diseño de voz mediante instrucciones en lenguaje natural (voice design), que es la característica diferencial de esta variante: permite describir el timbre y el estilo deseado en lugar de aportar una muestra de audio.
- Control inteligente de la voz: la model card indica control flexible de timbre, emoción y prosodia mediante instrucciones en lenguaje natural.
- Clonación de voz dentro de la familia Qwen3-TTS (la model card cita la clonación de voz como capacidad de la serie completa).
- Generación en streaming con latencia extremo a extremo declarada de 97 ms.
- Salida de audio de alta calidad percibida como habla humana, según descripción del autor.
- No es un modelo de lenguaje general: no genera texto, no razona, no resuelve problemas matemáticos ni ejecuta código.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión ni de entrada de audio (es un modelo de salida de audio, no de comprensión).

## Casos de uso

- Diseño de voces de marca sin muestras: al aceptar descripciones en lenguaje natural, el modelo permite crear una voz corporativa para IVR, centralita telefónica o asistente interno sin contratar ni registrar locutores.
- Asistentes de voz en tiempo real: la latencia de streaming de 97 ms y la tasa de 12 Hz del tokenizador lo hacen apto para diálogos hablados con respuesta inmediata en aplicaciones de atención al cliente o asistentes domésticos.
- Doblaje y localización de vídeo: con diez idiomas soportados, un mismo flujo puede generar pistas de voz en varios idiomas manteniendo el control de emoción y prosodia sobre el guion traducido.
- Audiolibros y contenido narrado: la generación en streaming y la compresión acústica permiten procesar textos largos en fragmentos, manteniendo una voz consistente entre secciones.
- Accesibilidad: integración en lectores de pantalla y aplicaciones de asistencia para personas con discapacidad visual, gracias a la licencia Apache 2.0, que permite incrustar el modelo en productos distribuidos.
- Videojuegos y experiencias interactivas: generación dinámica de líneas de voz para personajes no jugadores, con control de emoción por instrucción para adaptar el tono al contexto de la escena.
- Contenido formativo y e-learning: producción de locuciones para cursos y materiales didácticos en varios idiomas, regenerando solo los fragmentos que cambian en cada revisión de guion.
- Prototipado rápido en producción audiovisual: creación de voces de referencia para previsualizar una pieza antes de contratar actores de doblaje.

## Benchmarks y rendimiento

La información disponible solo incluye resultados de tasa de error de palabra (WER, menor es mejor) en el conjunto de prueba Seed-TTS para la variante Base de la serie, no para esta variante VoiceDesign:

| Modelo | Seed-TTS test-zh | Seed-TTS test-en |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado resultados de benchmarks específicos de la variante Qwen3-TTS-12Hz-1.7B-VoiceDesign en la información disponible. Tampoco hay datos de MOS, similitud de hablante ni evaluaciones por idioma más allá del chino y el inglés.

## Requisitos de hardware

- Parámetros: 1.916.676.352. En bfloat16 los pesos ocupan aproximadamente 3,84 GB; el repositorio completo ocupa 4,5 GB.
- VRAM estimada para inferencia: del orden de 5 a 6 GB en bfloat16 si se añaden activaciones y memorias intermedias (estimación propia a partir del tamaño de los pesos, no confirmada por el autor). En float16 el peso baja ligeramente; con cuantización de 8 bits podría situarse en torno a 3-4 GB, pero no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4070 o una RTX 4090 son suficientes para bfloat16 en una sola GPU.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media con 8 GB o más. En GPUs con menos de 8 GB sería necesario cuantizar, algo que el autor no documenta.
- Opciones de despliegue: paquete oficial `qwen-tts` (instalable con `pip install -U qwen-tts`) sobre PyTorch, con `device_map="cuda:0"`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"` en el ejemplo del autor. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos en GGUF.
- Latencia: el autor declara 97 ms de latencia extremo a extremo en modo streaming. Es una cifra del fabricante y no se indica en qué hardware fue medida.
- Rendimiento (throughput): no disponible.

## Comparativa con modelos similares

Comparación dentro de la propia familia, con los datos publicados en la model card:

| Modelo | Parámetros | Idiomas | Licencia | WER Seed-TTS test-zh / test-en | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (este modelo) | 1,92 B (safetensors) | 10 | Apache 2.0 | no disponible | HuggingFace, ModelScope |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7 B según nomenclatura | 10 | Apache 2.0 | 0,77 / 1,24 | HuggingFace, ModelScope |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7 B según nomenclatura | 10 | Apache 2.0 | no disponible | HuggingFace, ModelScope |

Alternativas de otras familias orientadas a TTS multilingüe con clonación de voz (XTTS-v2, CosyVoice2, Bark, F5-TTS): no disponible en la información proporcionada. No se han encontrado en la búsqueda web datos verificables de parámetros, contexto, rendimiento ni licencia de estos modelos que permitan una comparación rigurosa; las búsquedas realizadas devolvieron resultados no relacionados con el modelo.

## Limitaciones y advertencias

- La model card es genérica para toda la serie Qwen3-TTS: no describe de forma específica el entrenamiento, el dataset ni los hiperparámetros de la variante VoiceDesign.
- El único benchmark publicado corresponde a la variante Base. No hay cifras de calidad (MOS, similitud de hablante, WER por idioma) para VoiceDesign, por lo que su rendimiento real en producción no está cuantificado de forma independiente.
- La latencia de 97 ms es una cifra declarada por el fabricante y no se especifica el hardware ni las condiciones de medición.
- Riesgo de alucinación en el sentido propio del TTS: el modelo puede producir pronunciaciones incorrectas, énfasis inadecuado o artefactos acústicos en textos con nombres propios, siglas, números o idiomas mezclados.
- Las instrucciones de diseño de voz en lenguaje natural pueden dar resultados variables entre ejecuciones; no se documenta estabilidad ni reproducibilidad por semilla.
- Riesgo de uso indebido: la combinación de diseño de voz y clonación de voz dentro de la misma familia habilita la creación de voces sintéticas realistas, con riesgo de suplantación, fraude y desinformación. La licencia Apache 2.0 no impone restricciones de uso técnico, por lo que la mitigación depende del implementador.
- La licencia Apache 2.0 permite uso comercial y modificación sin obligación de publicar derivados, pero no exime de cumplir la normativa aplicable sobre derechos de imagen, voz y protección de datos personales.
- Los metadatos de HuggingFace no declaran los idiomas soportados; la lista de diez idiomas procede exclusivamente de la model card y no se detalla el nivel de calidad por idioma.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita el despliegue en entornos de CPU o en GPUs de gama baja.
- No hay información sobre sesgos demográficos, acento o cobertura de variedades dialectales más allá de la mención genérica a perfiles dialectales.
- Uso en producción de voz sintética: conviene etiquetar el audio generado como sintético para cumplir con las recomendaciones de transparencia y con la normativa emergente sobre contenidos generados por IA.

## Enlaces

- HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Colección de la familia Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Colección en ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog de Qwen: https://qwen.ai/blog?id=qwen3tts-0115
- Paper (arXiv 2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Paquete de inferencia en PyPI: `pip install -U qwen-tts`

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo, por lo que no se han podido añadir fuentes externas de evaluación independiente.
