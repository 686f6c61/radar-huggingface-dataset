# lazarenkod/promises-asr-ru-mixed-coreml

## Resumen

Promises ASR RU Mixed es un modelo de reconocimiento automático del habla (ASR) para ruso, derivado de ai-sage/GigaAM-v3 de Sber (revisión `e2e_ctc`, commit `cec030b4c4f35d928e4a9044a3bdb29ebd499fac`), fine-tuneado por el autor lazarenkod y convertido a Core ML para su uso en la aplicación Promises. Su rasgo diferencial es un vocabulario extendido: a las 256 piezas SentencePiece originales se añaden piezas latinas hasta un total de 596 clases (la clase 596 es el blank de CTC), lo que permite transcribir términos en alfabeto latino como nombres de producto o abreviaturas ("Kubernetes", "SKU") dentro de habla rusa, algo que el modelo base no hace.

El modelo se distribuye como `GigaAM.mlmodelc` en fp16, con un tamaño de repositorio de 0,4 GB, y está pensado para inferencia en dispositivo en Apple Silicon mediante CPU, GPU o Neural Engine. La entrada es audio float32 a 16 kHz con longitudes de 5, 10 o 20 segundos (80 000, 160 000 o 320 000 muestras, con relleno de ceros), y la salida son log-probabilidades CTC con un frame cada 40 ms.

Es relevante porque aborda un problema concreto y poco resuelto en ASR ruso: la escritura correcta de términos latinos en habla con code-switching. No obstante, el propio autor documenta que la mejora es modesta (20,8 % de acierto en términos latinos no vistos frente a 12,8 % del original), por lo que el modelo se plantea como un componente combinado con otros reconocedores y con un glosario de usuario, no como sustituto de una lista de términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GigaAM-v3 (revision `e2e_ctc`), CTC end-to-end; pesos convertidos a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica; ventanas de audio de 5, 10 o 20 s (80 000, 160 000 o 320 000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp16 (distribucion Core ML); fp32 verificado para paridad con PyTorch |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT (se conserva la linea de copyright de GigaChat Team) |
| Formato de pesos | Core ML (`GigaAM.mlmodelc`); `tokens.txt` con las piezas en orden de id y `gigaam.json` con constantes de runtime |
| Vocabulario | 596 clases (256 piezas SentencePiece originales + piezas latinas); clase 596 = blank CTC |
| Frecuencia de muestreo | 16 kHz, entrada float32 de forma (1, N) |
| Paso de frame | 40 ms por frame en la salida (1, T, C) |
| Tamano en disco | aproximadamente 424 MB |

## Arquitectura y entrenamiento

El modelo parte de GigaAM-v3 en su variante `e2e_ctc`, un sistema ASR end-to-end con pérdida CTC sobre tokens, y se ha fine-tuneado durante 8000 pasos con la receta del modelo hermano del autor: pérdida CTC por token más un término KL hacia el modelo original sobre datos ancla en ruso, SpecAugment, ruido y respuestas de sala. A esta base se añadieron aproximadamente 10 000 frases con términos latinos leídas por un modelo de voz sintética (Qwen3-TTS, 337 voces, parte de los clips en modo acento), junto con los datos rusos del modelo hermano: Common Voice ru, FLEURS ru, Russian LibriSpeech y grabaciones propias del autor con pseudo-etiquetas (8,2 horas).

Tras el fine-tuning se aplicó WiSE-FT con alpha 0,7, desplazando los pesos un 70 % hacia el modelo original para preservar el rendimiento previo en ruso. La conversión a Core ML se hizo en fp16; el autor verificó paridad con PyTorch en fp32 (mismos ids en 20 clips, delta máximo de log-probabilidad de 2,9e-3) y en fp16 (mismos ids en 18 de 20 clips). La innovación principal no está en la arquitectura, sino en la extensión del vocabulario de salida para cubrir términos latinos en habla rusa.

## Capacidades

- Reconocimiento de voz en ruso con decodificación CTC greedy o beam search.
- Transcripción de términos en alfabeto latino embebidos en habla rusa (nombres de producto, abreviaturas, siglas), gracias al vocabulario extendido de 596 clases.
- Reducción de sonidos de relleno transcritos: 0,9 por cada 1000 palabras frente a 21,1 del modelo original.
- Mejora ligera en el recuerdo de nombres propios rusos: 0,648 frente a 0,605 del original sobre 81 nombres.
- Ejecución en dispositivo en Apple Silicon mediante Core ML, con soporte de CPU, GPU y Neural Engine.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y llamadas en ruso en aplicaciones macOS/iOS: el modelo procesa ventanas de 5, 10 o 20 segundos con relleno de ceros y devuelve log-probabilidades CTC, adecuadas para decodificación incremental en local sin enviar audio a la nube.
- Dictado con jerga técnica: en entornos de desarrollo donde se pronuncian términos como "Kubernetes" o "SKU" en mitad de una frase rusa, el vocabulario latino permite escribir esas palabras en alfabeto latino en lugar de transliterarlas por sonido.
- Subtitulado offline de contenido en ruso: con aproximadamente 81 veces tiempo real en CPU sola y 2400 segundos de audio procesados en 9 segundos en un M4 Pro con CPU+GPU, es viable generar subtítulos de archivos largos en un portátil.
- Integración en la app Promises como componente de un pipeline ASR combinado: el autor lo usa junto a un reconocedor que escribe mejor el latino (Parakeet) y con el glosario del usuario, lo que sugiere un patrón de ensemble para maximizar precisión en términos.
- Procesamiento de audio con ruido o reverberación: el entrenamiento incluyó ruido y respuestas de sala, lo que lo hace adecuado para grabaciones de micrófono no idealmente acondicionadas.
- Prototipado de ASR en dispositivo con requisitos de privacidad: al ejecutarse enteramente en local con Core ML y unos 110 MB de memoria en CPU, encaja en escenarios donde el audio no puede salir del dispositivo.
- Evaluación comparativa de vocabularios ASR: sirve como referencia para estudiar el efecto de añadir piezas latinas a un vocabulario SentencePiece ruso en tareas de code-switching.

## Benchmarks y rendimiento

Datos medidos por el autor el 07.11.2026, decodificación greedy, tasa de error de palabras (WER, %) salvo donde se indica:

| Conjunto | Original | Este modelo |
|---|---|---|
| FLEURS-ru test, 120 clips (PyTorch) | 4,25 | 4,41 |
| FLEURS-ru test, Core ML fp16 (CPU+GPU y CPU+NE) | 4,37 | 4,46-4,54 |
| Russian LibriSpeech test, 300 clips | 6,20 | 6,06 |
| Common Voice ru test, 300 clips | 2,57 | 2,81 |
| Recuerdo de 81 nombres rusos | 0,605 | 0,648 |
| Sonidos de relleno escritos por 1000 palabras | 21,1 | 0,9 |
| Términos latinos correctos, 875 no vistos en entrenamiento (voz sintética) | 12,8 % | 20,8 % |
| Los mismos términos, Core ML fp16 | no disponible | 20,5-20,7 % |

Rendimiento de inferencia declarado: aproximadamente 424 MB de pesos, 2400 segundos de audio procesados en 9 segundos en un M4 Pro con CPU+GPU, y aproximadamente 110 MB de memoria con 81 veces tiempo real en CPU sola.

## Requisitos de hardware

- VRAM/ memoria: aproximadamente 110 MB de memoria en ejecución solo con CPU; el tamaño del modelo en disco es de unos 424 MB.
- GPU recomendadas: Apple Silicon con soporte de Core ML; el autor reporta pruebas en un M4 Pro con CPU+GPU y con CPU+Neural Engine.
- Compatibilidad con GPU de consumo: el modelo está empaquetado para Core ML, por lo que su despliegue natural es en hardware Apple (M-series, A-series). No se distribuyen pesos en formatos para CUDA.
- Opciones de despliegue: Core ML (`GigaAM.mlmodelc`) integrado en apps de Apple; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR de este tipo.
- Latencia y throughput: 81 veces tiempo real en CPU sola; 2400 segundos de audio en 9 segundos en M4 Pro con CPU+GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Promises ASR RU Mixed (este modelo) | no disponible | ventanas de 5/10/20 s | ru | MIT | Core ML | Vocabulario extendido con piezas latinas; 20,8 % de acierto en términos latinos no vistos |
| ai-sage/GigaAM-v3 (modelo base) | no disponible | ventanas equivalentes | ru | MIT | safetensors / PyTorch | Referencia de partida; 12,8 % en términos latinos no vistos y 21,1 rellenos por 1000 palabras |
| Modelo hermano del autor (receta base) | no disponible | ventanas equivalentes | ru | no disponible | no disponible | Misma receta de entrenamiento sin datos de code-switching; citado como origen de los datos rusos |

No se dispone de datos de benchmarks de otros sistemas ASR rusos en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- La mejora en términos latinos es limitada: cuatro de cada cinco términos no vistos siguen sin escribirse en latino (muchos se escriben por sonido en cirílico o se pierden). No sustituye a una lista de términos o glosario.
- Los tests de términos se hicieron con voz sintética; no se midieron grabaciones reales para términos.
- Ligero empeoramiento en algunos conjuntos respecto al original: FLEURS-ru pasa de 4,25 a 4,41 y Common Voice ru de 2,57 a 2,81.
- Solo soporta ruso; no hay capacidades multilingües más allá de la escritura de piezas latinas.
- El autor advierte que las comprobaciones de privacidad realizadas (56 clips reservados, 285 ventanas no vistas) tienen poca potencia estadística y no cubren fugas de hablante ni ataques de extracción; parte de los datos de fine-tuning son grabaciones propias con voces de terceros no publicadas.
- La licencia MIT permite uso comercial, pero se conserva la línea de copyright de GigaChat Team; conviene revisar el archivo `LICENSE` del repositorio.
- Al ser un modelo CTC empaquetado para Core ML, no es directamente reutilizable en stacks de inferencia habituales de Python/CUDA sin reconversión.
- Riesgo de alucinación inherente a ASR: en silencio, ruido o música el modelo puede emitir texto; el autor reporta que en esas condiciones no aparecen frases de los textos de entrenamiento, pero el riesgo de inserciones no es nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/promises-asr-ru-mixed-coreml
- Modelo base GigaAM-v3: https://huggingface.co/ai-sage/GigaAM-v3
- mlx2coreml (herramienta de conversión MLX a Core ML): https://pypi.org/project/mlx2coreml/
- laya-coreml (referencia de despliegue Core ML en Apple Silicon): https://pypi.org/project/laya-coreml/
