# amir0907/student-v2

## Resumen

student-v2 (denominado internamente «Surgical Emotion Module v2») es un adaptador de destilación de 3,18 M de parámetros que se implanta sobre el codificador de emociones congelado emotion2vec_plus_base para producir representaciones emocionales continuas a nivel de frame. Lo desarrolla un único autor (amir0907) y se publica como la segunda iteración de amir0907/student (ahora «v1»), con 2,4 veces más datos y 2,2 veces más pasos de entrenamiento. No es un modelo de lenguaje: es un extractor de características emocionales pensado como front-end de condicionamiento.

El módulo convierte audio a 16 kHz en cuatro salidas sincronizadas: embeddings de 768 dimensiones a 12,5 Hz (80 ms por frame), probabilidades por frame de 9 clases emocionales, un escalar de intensidad continua en [0,1] y agregados a nivel de utterance. La tasa de 12,5 Hz no es arbitraria: al ser exactamente un cuarto de los 50 Hz del profesor y la mitad de los 6,25 Hz de los tokens del LLM de dots.tts, cada token de TTS recibe exactamente dos frames de emoción.

Su relevancia es doble. Por un lado, demuestra una receta de destilación sin etiquetas (self-distillation sobre las representaciones del profesor) que reproduce al profesor con una divergencia JS media de 0,00022 y un coseno de embedding agrupado de 0,99955, con solo 2,7 ms de sobrecoste de inferencia en una T4 en fp32. Por otro, ataca un problema práctico de los sistemas de traducción voz-a-voz: inyectar prosodia emocional variable en el tiempo en lugar de una etiqueta estática por utterance. El repositorio, sin embargo, no tiene descargas ni validación externa y sus datos de entrenamiento imponen restricciones de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador convolucional de destilación sobre emotion2vec_plus_base congelado: LN → Linear(768→512) → 3 convoluciones depthwise-separables (k=9, dilataciones 1/2/4) → pooling soft-attention agrupado (G=4, 50→12,5 Hz) → LN → Linear(512→768) → cabezas de embedding, clases e intensidad |
| Parámetros totales | 3,18 M (solo el adaptador; el backbone congelado no se contabiliza y su tamaño no se indica en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; procesa utterances completas y presenta una tolerancia de un frame en el borde final, heredada del front-end convolucional del profesor |
| Tipos de cuantización | No disponible (no se documentan variantes fp16/int8/GGUF) |
| Idiomas soportados | No disponible; el corpus de destilación (RAVDESS) contiene habla en inglés |
| Licencia | Apache-2.0 para el adaptador; los datos de destilación son RAVDESS (CC BY-NC-SA 4.0), por lo que el uso comercial queda restringido o exige re-destilar |
| Formato de pesos | Checkpoint PyTorch `surgical_emotion_module.pt`; backbone en formato de directorio FunASR |
| Librería | funasr |
| Tasa de salida | 12,5 Hz (80 ms/frame), verificada a 1, 2,5, 5 y 10 s |
| Dimensión de embedding | 768 |
| Clases emocionales | 9 (taxonomía heredada del profesor; el modelo no enumera las etiquetas) |
| Salidas | `frame_embs` (B,T,768), `frame_probs` (B,T,9), `frame_intensity` (B,T,1), `utt_emb` (B,768), `utt_probs` (B,9), `frame_lengths` (B,) |
| Entrada | Audio mono a 16 kHz con longitudes (`wav_16k`, `wav_lengths`) |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un cuello de botella convolucional que aprende a comprimir y remuestrear el espacio latente del profesor. emotion2vec_plus_base produce estados de 768 dimensiones a 50 Hz; el adaptador los proyecta a 512, aplica tres convoluciones depthwise-separables con kernel 9 y dilataciones 1, 2 y 4 para capturar contexto temporal multi-escala, y reduce la tasa mediante un pooling de soft-attention agrupado en G=4 grupos, lo que baja de 50 a 12,5 Hz de forma determinista. Tras una normalización y una proyección de vuelta a 768, tres cabezas emiten embedding, distribución de 9 clases e intensidad. El entrenamiento es una destilación auto-supervisada sin etiquetas: la única señal de supervisión son los estados del profesor congelado.

Los datos proceden de RAVDESS, actores 1-18, con 2160 utterances que combinan habla (1080) y canto (1080); los actores 19-24 quedan completamente fuera y se usan como test held-out. La optimización es AdamW con learning rate 3e-4, warmup de 100 pasos y 2000 pasos totales (frente a 900 en v1). Para abaratar el coste, la caché de estados del profesor se precalculó en paralelo sobre 2× T4 mediante `precompute_shard.py`; la inferencia del adaptador se midió en una sola T4 en fp32. La innovación reseñable no es tanto la topología como el contrato de tasa: el diseño garantiza 12,5 Hz exactos en cualquier duración de entrada, lo que permite inyectar la emoción como condición variable en el tiempo en dots.tts sin realinear nada.

## Capacidades

- Extracción de embeddings emocionales continuos a nivel de frame (768 dimensiones, 12,5 Hz) a partir de audio a 16 kHz.
- Clasificación emocional por frame sobre 9 clases, con distribución de probabilidad completa en lugar de una etiqueta dura.
- Estimación de intensidad emocional continua en el rango [0,1] por frame, útil para modular la expresividad de forma gradual.
- Agregación a nivel de utterance: `utt_emb` (768) y `utt_probs` (9) para tareas de clasificación global.
- Funciona tanto sobre habla como sobre canto, al haberse entrenado con 1080 utterances de cada tipo.
- Cumplimiento determinista de la tasa de 12,5 Hz, condición necesaria para alinearse con tokens de 6,25 Hz (dos frames por token).
- Pipeline completo reproducible en el repositorio: módulo, precomputación paralela de la caché del profesor, entrenamiento, evaluación, benchmark, generador de galería de demos y script de comparación v1 frente a v2.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo generativo ni un LLM.
- No se documentan capacidades multilingües, de visión ni de audio-texto.

## Casos de uso

- Condicionamiento emocional en traducción voz-a-voz y TTS: el adaptador entrega `frame_embs` a 12,5 Hz para inyectarlos en dots.tts como condición variable en el tiempo junto a la ruta de x-vector del hablante, de modo que la emoción del audio de origen se preserve en el audio sintetizado en lugar de perderse en una etiqueta estática.
- Doblaje automático con preservación de prosodia: al disponer de dos frames de emoción por token de 6,25 Hz, la señal se puede alinear con la secuencia de tokens del modelo de síntesis sin remuestreo adicional, lo que reduce el trabajo de ingeniería en pipelines de localización.
- Etiquetado de corpus de habla a nivel de frame: usar el módulo como extractor de características para anotar bases de datos de investigación con trayectorias emocionales (subidas, bajadas y cambios bruscos), sustituyendo anotaciones humanas por frame, mucho más caras.
- Análisis de llamadas y atención al cliente: las salidas `utt_probs` permiten clasificar el tono de cada intervención y las `frame_intensity` detectan picos de frustración dentro de la llamada; el coste de 2,7 ms de sobrecoste en T4 hace viable el procesamiento por lotes de grandes volúmenes.
- Investigación en psicolingüística y análisis de expresión musical: al haber sido entrenado también con canto, sirve para estudiar dinámicas emocionales en interpretación vocal, una tarea donde los clasificadores entrenados solo con habla suelen degradarse.
- Avatares y agentes conversacionales expresivos: la intensidad continua en [0,1] y las 9 clases por frame permiten mapear la emoción detectada a parámetros de animación facial o a curvas de prosodia del TTS en tiempo casi real.
- Reducción de secuencia para entrenar modelos SER: extraer características a 12,5 Hz supone un factor 4 menos de frames que los 50 Hz del profesor, lo que abarata el entrenamiento de cabezas descendentes sobre secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables: el modelo no es un LLM. La única evaluación publicada mide la fidelidad de la destilación frente al profesor congelado, sobre 32 archivos held-out de los actores 19-24.

| Métrica (32 archivos, actores 19-24, frente al profesor congelado) | v1 | v2 |
|---|---|---|
| Acuerdo top-1 | 100 % | 100 % |
| Divergencia JS media | 0,00035 | 0,00022 |
| Coseno del embedding agrupado | 0,99935 | 0,99955 |
| Coseno a nivel de frame (12,5→50 Hz) | 0,99524 | 0,99572 |
| Dinámica de intensidad (std media) | 0,0301 | 0,0351 |
| Correlación de intensidad frente a energía con compuerta de confianza | 0,310 | 0,326 |

Advertencia metodológica: todas las métricas miden concordancia con el profesor, no exactitud frente a emoción humana anotada. Un acuerdo del 100 % en top-1 indica que el alumno reproduce al profesor, no que el profesor acierte.

## Requisitos de hardware

- El adaptador (3,18 M de parámetros, ~13 MB en fp32) cabe en cualquier GPU e incluso en CPU; el coste computacional real lo domina el backbone emotion2vec_plus_base congelado, cuyo tamaño no se especifica en la información disponible.
- Sobrecoste medido del adaptador: aproximadamente 2,7 ms por delante del backbone congelado en una NVIDIA T4 en fp32 (una sola GPU).
- La precomputación de la caché del profesor se realizó en paralelo sobre 2× T4, lo que da una idea del orden de magnitud del backbone para procesar lotes grandes.
- GPU consumer: sí, en cualquier tarjeta con suficiente memoria para el backbone; no se publican cifras de VRAM concretas para el conjunto.
- Opciones de despliegue: PyTorch más FunASR, cargando `SurgicalEmotionEncoder.from_pretrained(<dir emotion2vec_plus_base>, "surgical_emotion_module.pt", device=...)`. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF, al no tratarse de un modelo de lenguaje.
- Rendimiento: no se publican cifras de throughput (archivos por segundo) ni latencia extremo a extremo; solo el sobrecoste de 2,7 ms del adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amir0907/student-v2 | 3,18 M (adaptador) + backbone congelado | Embeddings 768-d a 12,5 Hz, 9 clases, intensidad [0,1] | Destilación sin etiquetas, 2160 utterances (RAVDESS actores 1-18) | Apache-2.0 con caveat de datos CC BY-NC-SA 4.0 | HuggingFace, 0 descargas |
| amir0907/student (v1) | 3,18 M (misma arquitectura) | Idénticas | 900 utterances, 900 pasos | Apache-2.0 con el mismo caveat | HuggingFace |
| emotion2vec_plus_base (profesor) | No disponible en la información | Estados 768-d a 50 Hz, taxonomía de 9 clases | No disponible en la información | Apache-2.0 según la model card | HuggingFace / FunASR |

Frente a un clasificador SER convencional, la diferencia relevante es la granularidad: student-v2 no emite una etiqueta por utterance, sino una trayectoria continua con contrato de tasa fijo, que es lo que un sistema de TTS necesita para condicionar la prosodia. No se dispone en la información proporcionada de comparaciones con otros modelos SER públicos (wav2vec2-based, emotion2vec_plus_large u otros), por lo que no se puede establecer una comparativa de rendimiento con terceros.

## Limitaciones y advertencias

- Dominio de entrenamiento muy estrecho: RAVDESS es habla emocional actuada por 24 actores de inglés norteamericano, en condiciones de estudio. No hay evidencia publicada de robustez en audio real, ruidoso, con acentos distintos o con emoción espontánea.
- Riesgo de licencia: aunque el adaptador se declara Apache-2.0, se destiló sobre RAVDESS (CC BY-NC-SA 4.0). La model card recomienda explícitamente mantener el uso no comercial o re-destilar sobre habla con licencia permisiva, ya que la receta no necesita etiquetas.
- Evaluación circular: las métricas miden fidelidad al profesor, de modo que el modelo hereda todos los sesgos y errores de emotion2vec_plus_base. Una divergencia JS de 0,00022 no dice nada sobre la validez psicológica de las 9 clases.
- No es un modelo generativo: no genera texto, no hace tool calling, no soporta agentes y no debe evaluarse con benchmarks de LLM.
- Tabla de emociones fija (9 clases) impuesta por el profesor; no admite etiquetas personalizadas ni dimensionales (valencia/arousal) salvo la intensidad escalar.
- La correlación de la intensidad con la energía con compuerta de confianza es débil (0,326), por lo que la señal de intensidad debe usarse como modulación relativa, no como medida absoluta.
- Tolerancia de un frame en el borde final de la utterance, heredada del front-end convolucional del profesor; conviene recortar o rellenar en integraciones que exijan alineación exacta.
- Datos de comunidad inexistentes (0 descargas, 0 likes), sin paper ni revisión por pares; el repositorio figura con 0,0 GB en HuggingFace y la fecha de creación registrada es 2026-10-27, lo que conviene verificar antes de integrarlo en producción.
- Dependencia estricta de la configuración exacta del backbone (50 Hz, 768 dimensiones); no hay soporte documentado de cuantización ni de variantes del profesor.
- Idiomas soportados no declarados: no hay garantía de comportamiento en castellano ni en ninguna otra lengua distinta del inglés de RAVDESS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amir0907/student-v2
- Versión anterior (v1): https://huggingface.co/amir0907/student
- Perfil del autor: https://huggingface.co/amir0907
- Código incluido en el repositorio: `code/surgical_emotion.py` (módulo), `code/precompute_shard.py` (caché paralela del profesor), `code/train_v2.py` (destilación), además de scripts de evaluación, benchmark, galería de demos y comparación v1/v2.
- Informes incluidos en el repositorio: `reports/v1_v2_compare.json` (comparación por archivo) y `reports/train_v2.log` (registro de entrenamiento).
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales específicos de este modelo.
