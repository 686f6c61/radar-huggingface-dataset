# aungzaythant/Howard-0.6B

## Resumen

Howard 0.6B es un modelo de síntesis de voz (text-to-speech) especializado en birmano (myanmar) con capacidad de code-switching birmano-inglés, desarrollado por el usuario independiente aungzaythant. Se trata de un fine-tuning del modelo Qwen/Qwen3-TTS-12Hz-0.6B-Base, orientado a resolver un problema concreto: la práctica ausencia de sistemas TTS de calidad para birmano, un idioma con más de 30 millones de hablantes y escasa representación en herramientas de voz. El modelo lee texto birmano en voz alta como audio mono de 24 kHz, pronunciando en inglés las palabras y frases inglesas que se intercalan habitualmente en el habla cotidiana birmana.

El modelo cuenta con 914.643.008 parámetros reales (etiquetado comercialmente como 0.6B) y se distribuye en tres formatos: safetensors BF16 para PyTorch, MLX de 8 bits para Apple Silicon y GGUF para qwentts.cpp. Su licencia Apache 2.0 permite uso comercial, lo que lo hace relevante para desarrolladores que necesiten integrar voz birmana en productos sin las restricciones de licencias más cerradas.

La relevancia actual del modelo reside en su doble enfoque: por un lado, cubre una lengua de bajos recursos con un TTS funcional; por otro, incorpora clonación de voz a partir de una grabación corta (el ejemplo de la model card usa 4,4 segundos) junto con su transcripción exacta, todo ejecutable en hardware de consumo, incluidos equipos Mac con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (fine-tuning de Qwen/Qwen3-TTS-12Hz-0.6B-Base); arquitectura exacta no detallada en la informacion disponible |
| Parametros totales | 914.643.008 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors), 8 bits (MLX), GGUF (qwentts.cpp) |
| Idiomas soportados | birmano (my), inglés (en); code-switching birmano-inglés |
| Licencia | Apache 2.0 (materiales originales de Qwen sujetos a su licencia upstream) |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen/Qwen3-TTS-12Hz-0.6B-Base, un modelo TTS de la familia Qwen3-TTS. La model card no detalla la arquitectura interna (tipo de decoder, mecanismo de atención, tokenizador de audio) ni el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas de RLHF o DPO. La información disponible se limita a indicar que se trata de un ajuste sobre el modelo base para adaptarlo al birmano y al code-switching con inglés.

La innovación técnica destacable, según la documentación del autor, es la capacidad de code-switching: el modelo detecta y pronuncia con fonética inglesa las palabras inglesas incrustadas en una frase birmana, en lugar de leerlas con reglas fonéticas birmanas. Asimismo, incorpora clonación de voz zero-shot condicionada por un par (grabación corta, transcripción exacta), generando audio mono a 24 kHz. No se dispone de información sobre la estrategia de entrenamiento del sistema de clonación ni sobre el volumen de datos de voz utilizados.

## Capacidades

- Síntesis de voz en birmano: convierte texto birmano en audio mono de 24 kHz.
- Code-switching birmano-inglés: pronuncia en inglés las palabras, nombres y frases inglesas dentro de una oración birmana.
- Clonación de voz: aprende una voz a partir de una grabación corta y su transcripción exacta, y lee texto nuevo con esa voz.
- Ejecución local: pesos BF16 para PyTorch, MLX de 8 bits para Apple Silicon y GGUF para qwentts.cpp.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Accesibilidad para hablantes de birmano: lectura en voz alta de artículos, documentos y mensajes para personas con discapacidad visual o dificultades de lectura, usando la ventana de audio de 24 kHz y la ejecución local para preservar la privacidad del contenido.
- Audiolibros y contenido editorial en birmano: narración de textos largos con una voz clonada del propio autor o narrador, previa autorización, manteniendo coherencia de timbre entre capítulos.
- Localización de productos digitales: generación de avisos de voz, notificaciones y tutoriales en birmano para aplicaciones móviles, con pronunciación correcta de términos técnicos en inglés (por ejemplo, "meeting", "online") gracias al code-switching.
- Asistentes de voz y chatbots: integración en pipelines de atención al cliente que requieran respuestas habladas en birmano, ejecutando el modelo en servidores con GPU o en equipos Mac para prototipado.
- Doblaje y posproducción de vídeo: clonación de la voz de un actor con su consentimiento para generar líneas adicionales o correcciones de guion sin necesidad de una nueva sesión de grabación.
- Investigación lingüística y docencia: generación de material de pronunciación controlada para el estudio del birmano, incluyendo ejemplos de code-switching y variación de voces.
- Prototipado en Apple Silicon: desarrollo de demos y pruebas de concepto en Mac con el formato MLX de 8 bits, sin depender de infraestructura GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 914,6 millones de parámetros; en BF16 requiere aproximadamente 1,8 GB solo para los pesos, más memoria para activaciones y buffers de audio. La cuantización de 8 bits en MLX reduce los pesos a alrededor de 0,9 GB. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU de consumo con al menos 4-6 GB de VRAM en BF16, aunque esta estimación no está confirmada en la documentación.
- Cabe en GPU de consumo: previsiblemente sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores, así como en Apple Silicon mediante MLX; no hay confirmación oficial.
- Opciones de despliegue: PyTorch con safetensors BF16, MLX para Apple Silicon y qwentts.cpp con GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Formatos |
|---|---|---|---|---|---|
| Howard 0.6B | 914.643.008 | birmano, inglés (code-switching) | Sí | Apache 2.0 | safetensors, MLX, GGUF |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | licencia upstream de Qwen | no disponible en la informacion |
| Alternativas TTS multilingues de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tuning sobre un modelo base con datos no descritos, pueden persistir sesgos de pronunciación, prosodia y cobertura dialectal del birmano.
- Riesgo de alucinación: en TTS se manifiesta como pronunciaciones incorrectas, omisiones o inserciones de audio; no hay evaluación publicada sobre la tasa de errores.
- Limitaciones de contexto e idioma: solo se documentan birmano e inglés; no se garantiza calidad en otros idiomas ni en variantes dialectales del birmano. La longitud máxima de texto por generación no está especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los materiales originales de Qwen conservan su licencia upstream, que debe respetarse.
- Uso de la clonación de voz: el autor exige permiso explícito del hablante y prohíbe la suplantación de personas reales o la inducción a error sobre quién habla; en contextos donde el audio generado pueda confundirse con una grabación real debe indicarse que es sintético.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor describe el modelo como "just warming up", lo que sugiere un estado temprano y sin validación comunitaria extensa.
- Producción: no hay datos publicados de latencia, throughput ni estabilidad, por lo que se recomienda una evaluación propia antes de desplegarlo en sistemas críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aungzaythant/Howard-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Vídeo de presentación: https://huggingface.co/aungzaythant/Howard-0.6B/resolve/main/assets/howard-film.mp4
- Licencia del modelo: https://huggingface.co/aungzaythant/Howard-0.6B/blob/main/LICENSE
- Aviso legal: https://huggingface.co/aungzaythant/Howard-0.6B/blob/main/NOTICE
- Licencia upstream de Qwen: https://huggingface.co/aungzaythant/Howard-0.6B/blob/main/UPSTREAM-LICENSE.txt
