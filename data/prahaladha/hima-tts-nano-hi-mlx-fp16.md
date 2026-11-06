# Prahaladha/hima-tts-nano-hi-mlx-fp16

## Resumen

hima-tts-nano-hi-mlx-fp16 es la conversión a MLX en precisión float16 del modelo de síntesis de voz en hindi hima-tts-nano-hi, desarrollado por el usuario Prahaladha. Se trata de un modelo TTS de tan solo 62 millones de parámetros (61.854.849 exactos según los pesos safetensors) que genera audio a 24 kHz y está pensado para ejecutarse en local sobre la GPU de un Mac con Apple Silicon, sin necesidad de PyTorch en el momento de la inferencia.

El modelo base es un TTS en hindi con seis voces integradas (Meera, Sneha, Nandini, Siddharth, Ishaan y Nikhil) y capacidad de clonar voces a partir de una grabación mediante el repositorio original en PyTorch. Esta variante MLX mantiene las mismas voces y la misma calidad sonora que el modelo original, pero reescribe la ruta de inferencia para aprovechar Metal, lo que según el autor multiplica por más de cuatro la velocidad respecto a la ejecución en CPU con PyTorch.

Su relevancia actual es práctica: demuestra que un modelo TTS de tamaño "nano" puede ofrecer velocidades de 29x tiempo real en un único texto y hasta 70x en lotes sobre un Apple M4 Pro, lo que lo hace apto para generación de audio por lotes, doblaje o prototipado de asistentes de voz en hindi sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; pesos en MLX float16) |
| Parametros totales | 61.854.849 (~62 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (esta version); existe variante de 8 bits en el mismo perfil de autor |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors (MLX), mas codec.safetensors, voces en safetensors y tokenizer.model |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (no se especifica si es un transformer autorregresivo sobre tokens de audio, un modelo tipo VITS, un difusor o una arquitectura híbrida con codec neural). Lo que sí se documenta es la estructura de artefactos: un `model.safetensors` con el modelo en float16, un `voices/model.safetensors` ajustado para las seis voces integradas, un `codec.safetensors` que convierte la salida del modelo en audio y un tokenizador de texto (`tokenizer.model`) junto con `config.yaml` para los parámetros de muestreo.

Tampoco se han publicado datos sobre el volumen de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o ajuste por preferencias; en un modelo TTS de este tamaño lo habitual sería entrenamiento supervisado sobre pares texto-audio, pero no hay confirmación en la información proporcionada. La innovación técnica destacable de esta variante concreta es la conversión a MLX float16 para ejecución nativa en Apple Silicon, con un módulo Python propio (`hima_mlx`) que expone `say`, `say_many` y `save`, y un preprocesador de texto (`text/`) que normaliza números, fechas y cantidades a palabras antes de la síntesis.

## Capacidades

- Síntesis de voz en hindi a partir de texto, con salida en audio float32 a 24 kHz.
- Seis voces integradas: tres femeninas (Meera, Sneha, Nandini) y tres masculinas (Siddharth, Ishaan, Nikhil).
- Generación de una voz aleatoria si no se especifica ninguna, con control mediante semilla (`seed=`) para reproducir la misma toma.
- Clonación de voz a partir de una grabación (`--from me.wav`), aunque este paso requiere el repositorio base en PyTorch.
- Síntesis por lotes mediante `say_many`, con un rendimiento agregado muy superior al procesamiento individual.
- Normalización de texto para números, fechas y cantidades (carpeta `text/`).
- Soporte declarado de hindi e inglés en las etiquetas del modelo, si bien la documentación se centra en la síntesis en hindi.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Generación por lotes de locuciones en hindi: con `say_many` y 48 textos simultáneos el autor reporta 70x tiempo real en un M4 Pro, lo que permite producir horas de audio en minutos para catálogos, audiolibros o contenido formativo.
- Doblaje y localización de vídeo al hindi: la velocidad de 29x tiempo real en un solo texto permite generar pistas de voz alineadas con guiones segmentados sin esperas perceptibles.
- Prototipado de asistentes de voz locales: al no requerir PyTorch ni conexión a la nube, se puede integrar en una app de escritorio para Mac que responda en hindi con baja latencia.
- Accesibilidad y lectura de textos: conversión de documentos o noticias en hindi a audio para usuarios con discapacidad visual, aprovechando la normalización de números y fechas.
- Pruebas A/B de voces en productos: las seis voces integradas y la generación aleatoria con semilla permiten comparar timbres rápidamente antes de fijar una voz de marca.
- Investigación en TTS de bajo coste: con 62 M de parámetros y un repo de 0,3 GB, sirve como línea base reproducible para experimentos de conversión de modelos (MLX frente a ONNX o PyTorch) y de cuantización a 8 bits.
- Contenido educativo bilingüe hindi-inglés: frases mixtas como las del ejemplo de la model card (hindi con términos en inglés) son un caso realista para material docente.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| Velocidad, un texto a la vez | 29x tiempo real | Apple M4 Pro (MLX fp16) |
| Velocidad, lote de 48 textos (`say_many`) | 70x tiempo real | Apple M4 Pro (MLX fp16) |
| Velocidad en CPU con PyTorch | 6x tiempo real | Misma máquina, modelo base |
| Tasa de error de lectura de letras | 2,1 % | 12 frases de prueba (menor es mejor) |
| Tasa de error de lectura de letras | 1,2 % | Referencia float32 ONNX (menor es mejor) |

No se han publicado resultados de benchmarks estándar (MOS, WER sobre corpus públicos, MCD) en la información disponible. Los únicos datos cuantitativos son los de velocidad y la tasa de error de lectura de letras proporcionados por el autor.

## Requisitos de hardware

- VRAM/unified memory: al tratarse de 62 M de parámetros en float16, el peso ronda los 124 MB, más el codec y las voces; el repo completo ocupa 0,3 GB, por lo que cabe holgadamente en cualquier Mac con Apple Silicon.
- GPU recomendadas: Apple Silicon con soporte Metal; el autor cita un M4 Pro como referencia de rendimiento. No se documenta ejecución en GPU NVIDIA para esta variante MLX.
- GPU de consumo: sí, cualquier chip de la familia M1 o superior debería poder ejecutarlo; no hay datos de rendimiento publicados para M1, M2 o M3.
- Despliegue: librería `mlx` con el módulo `hima_mlx` incluido en el repo; instalación vía `huggingface_hub` y `requirements.txt`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: 29x tiempo real en un texto y 70x en lotes de 48 según el autor; la latencia por petición individual no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato/ejecucion | Licencia | Notas |
|---|---|---|---|---|---|
| hima-tts-nano-hi-mlx-fp16 | ~62 M | hi, en | MLX float16 (Apple Silicon) | other | 29x-70x tiempo real en M4 Pro |
| hima-tts-nano-hi (base) | ~62 M | hi, en | PyTorch, con variantes ONNX y MLX | other | Modelo original, permite clonar voces |
| hima-tts-nano-hi-mlx-8bit | ~62 M | hi, en | MLX 8 bits | other | Variante cuantizada del mismo autor |
| Alternativas TTS multilingues de gran tamano (p. ej. familia XTTS) | cientos de M a miles de M | multilingue | PyTorch/ONNX | varía | No disponible en la informacion proporcionada para comparacion directa |

No se dispone de datos de benchmarks comparativos frente a otros sistemas TTS en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas, formato y licencia.

## Limitaciones y advertencias

- Cobertura lingüística limitada: el modelo está orientado al hindi; el inglés aparece en las etiquetas, pero no se documenta su calidad de síntesis.
- Licencia "other": es una licencia personalizada y no se detallan sus términos en la información disponible; es imprescindible revisar el repositorio antes de cualquier uso comercial.
- Dependencia de Apple Silicon: la variante MLX no está pensada para GPU NVIDIA ni para servidores x86 convencionales; para esos entornos habría que usar el modelo base en PyTorch u ONNX.
- La clonación de voz requiere el repositorio base en PyTorch, lo que rompe la promesa de "sin PyTorch" para ese flujo concreto.
- Riesgo de pronunciación incorrecta: el propio autor reporta un 2,1 % de errores en la lectura de letras sobre 12 frases de prueba, superior al 1,2 % de la referencia ONNX en float32.
- No hay información publicada sobre sesgos de género, acento o dialecto en las seis voces integradas, ni sobre el comportamiento con texto code-mixed más allá del ejemplo de la model card.
- Ausencia de benchmarks estándar de calidad (MOS, WER sobre corpus públicos): la evaluación cualitativa queda en manos del usuario.
- Modelo con muy poca tracción (18 descargas, 0 likes en el momento de la consulta) y sin garantías de mantenimiento; conviene fijar la versión descargada.
- No se documentan límites de longitud de texto por petición ni el comportamiento en entradas muy largas.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-fp16
- Modelo base: https://huggingface.co/Prahaladha/hima-tts-nano-hi
- Variante 8 bits: https://huggingface.co/Prahaladha/hima-tts-nano-hi-mlx-8bit
- Perfil del autor: https://huggingface.co/Prahaladha
