# Adara2/Helcurt

## Resumen

Helcurt es un modelo de conversión de voz (voice conversion) basado en RVC v2 (Retrieval-based Voice Conversion, versión 2) con una frecuencia de muestreo de 40 kHz, entrenado por el usuario Adara2 y publicado en Hugging Face. Su propósito es transformar una señal de audio de entrada (voz fuente) en la voz del personaje Helcurt, preservando el contenido lingüístico y el ritmo pero sustituyendo el timbre por el del personaje objetivo. No es un modelo de lenguaje ni un sistema generativo de texto: es un modelo acústico de audio-a-audio especializado en una única identidad vocal.

El modelo se entrenó durante 100 épocas con un pitch guidance de 1, lo que indica que la conversión mantiene el tono original de la fuente sin transposición. Incluye dos ficheros de índice FAISS (added y trained) con IVF174 y nprobe 1, empleados por el mecanismo de retrieval de RVC para mejorar la fidelidad del timbre objetivo durante la inferencia. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

Es relevante en el contexto del doblaje, la creación de contenido y la experimentación con clonación de voz de personajes, ya que RVC v2 permite inferencia rápida en tiempo casi real sobre GPU de consumo. No obstante, al tratarse de un modelo de una sola voz y con 0 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto experimental más que un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 40k (Retrieval-based Voice Conversion, basada en VITS/HuBERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `.pth`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (depende de la fuente; el modelo en sí es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) + índices FAISS `.index` |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz que combina un extractor de características (típicamente HuBERT) para obtener representaciones lingüísticas y de contenido, un codificador de tono (pitch) basado en F0, y un decoder generativo de tipo VITS que sintetiza la forma de onda en la voz objetivo. La variante 40k indica que el modelo opera a 40 kHz, lo que permite reproducir contenido espectral de hasta 20 kHz y, por tanto, voces con mayor presencia de agudos y detalle en consonantes que las variantes 32k o 48k estándar.

El entrenamiento reportado por el autor es de 100 épocas con pitch guidance de 1, sobre un dataset no especificado (número de muestras, duración total ni procedencia no disponibles). El modelo incluye dos índices FAISS (`added_IVF174_Flat_nprobe_1_Helcurt_v2.index` y `trained_IVF174_Flat_nprobe_1_Helcurt_v2.index`) con 174 centroides IVF y nprobe 1, que se usan en el paso de retrieval para sustituir características acústicas de la fuente por las más cercanas del conjunto objetivo, mejorando la similitud tímbrica. No se documenta uso de RLHF, DPO ni decodificación especulativa, dado que no es un modelo de lenguaje.

## Capacidades

- Conversión de voz audio-a-audio: transforma una grabación de voz arbitraria en la voz del personaje Helcurt.
- Preservación de contenido y prosodia: mantiene el texto hablado y el ritmo de la fuente, sustituyendo solo el timbre.
- Pitch guidance fijado a 1: conserva el tono original de la fuente sin transposición de octava.
- Frecuencia de muestreo de 40 kHz: mayor ancho de banda que las variantes 32k, con reproducción de hasta 20 kHz.
- Retrieval con índice FAISS: mejora la fidelidad del timbre objetivo en pasajes largos.
- Independencia del idioma de entrada: al operar sobre representaciones acústicas, en principio acepta cualquier idioma de la fuente (no verificado por el autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un LLM.
- No dispone de modo thinking, visión ni audio de salida distinto de la propia voz convertida.

## Casos de uso

- Doblaje de personajes en proyectos de fansub o animación amateur: se introduce la voz del actor original y se convierte al timbre de Helcurt, manteniendo la sincronía labial y la entonación originales.
- Creación de contenido para redes sociales: generación de clips de voz del personaje a partir de un texto leído por el propio creador, útil para vídeos cortos y parodias.
- Sustitución de voz en mods de videojuegos: reemplazo de líneas de diálogo de un personaje por la voz de Helcurt en proyectos de modding no comerciales.
- Prototipado de asistentes con voz de personaje: experimentación con interfaces conversacionales donde la identidad vocal es parte del producto, combinando el modelo con un TTS previo que genere la fuente.
- Investigación en conversión de voz: banco de pruebas para evaluar la calidad de RVC v2 a 40 kHz con retrieval FAISS frente a variantes 32k/48k.
- Postproducción de audio y podcasting: corrección o sustitución puntual de tomas de voz manteniendo la naturalidad del habla original.
- Educación y divulgación: demostraciones de clonación de voz de personaje para explicar el funcionamiento de RVC y sus implicaciones éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,3 GB) y la naturaleza de RVC v2, se estima un consumo moderado, aunque el dato exacto no está documentado.
- GPU recomendadas: no disponible. RVC v2 suele ejecutarse en GPU NVIDIA con CUDA; no se especifican modelos concretos en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; no disponible.
- Opciones de despliegue: no se documentan en la model card. RVC v2 se ejecuta habitualmente mediante el repositorio oficial de RVC y herramientas derivadas, pero el autor no indica ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Muestreo | Licencia | Descargas/likes | Disponibilidad |
|---|---|---|---|---|---|
| Adara2/Helcurt | RVC v2 | 40 kHz | MIT | 0 / 0 | Hugging Face |
| RVC v2 estándar (32k) | RVC v2 | 32 kHz | MIT (repo original) | no disponible | Repositorio oficial de RVC |
| RVC v2 (48k) | RVC v2 | 48 kHz | MIT (repo original) | no disponible | Repositorio oficial de RVC |
| Modelos de voz de personaje en Hugging Face | RVC / So-VITS-SVC | variable | variable | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, similitud de hablante, error de pitch) para Helcurt ni para alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola voz: solo genera el timbre de Helcurt; no es un modelo general de TTS ni de conversión multi-hablante.
- Dataset de entrenamiento no documentado: se desconoce la duración, procedencia y consentimiento de las muestras, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de artefactos: como todo RVC, puede introducir ruido, vibrato artificial o inestabilidad en pasajes largos o con ruido de fondo.
- Dependencia de la fuente: la calidad de salida está condicionada por la calidad de la grabación de entrada y por el rango de pitch del hablante original.
- Sin benchmarks publicados: no hay evidencia objetiva de similitud de hablante ni de naturalidad.
- Licencia MIT: permite uso comercial y modificación, pero no exime del cumplimiento de normativas de protección de datos y derechos de imagen/voz si el personaje o la voz están protegidos.
- Consideraciones éticas y legales: la clonación de voz requiere consentimiento explícito del hablante original y puede estar sujeta a regulación (por ejemplo, el AI Act europeo en materia de deepfakes).
- Idiomas no verificados: aunque el modelo es en teoría independiente del idioma, no se ha validado su comportamiento en castellano ni en otros idiomas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni issues documentados.

## Enlaces

- Hugging Face: https://huggingface.co/Adara2/Helcurt
- Repositorio oficial de RVC (referencia de la arquitectura): https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Paper de HuBERT (extractor de características usado en RVC): https://arxiv.org/abs/2106.07447
- Paper de VITS (base generativa de RVC): https://arxiv.org/abs/2106.06103
