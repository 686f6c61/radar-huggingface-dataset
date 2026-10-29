# ihnatov-yuri/whisper-large-v3-turbo-uk

## Resumen

`ihnatov-yuri/whisper-large-v3-turbo-uk` es un ajuste fino de `openai/whisper-large-v3-turbo` para reconocimiento automático de habla en ucraniano, publicado por el desarrollador Yuri Ihnatov bajo licencia MIT. Mantiene intactas la arquitectura, el tokenizador y el vocabulario del modelo base: solo se ha reentrenado el decodificador de 4 capas, mientras que el codificador procede del modelo original de OpenAI. El resultado es un modelo de 808,9 millones de parámetros que conserva el inglés y produce transcripciones con mayúsculas, puntuación y números escritos en dígitos.

El modelo se entrenó sobre las mismas 617 horas de audio que la versión 2 de Parakeet UK del mismo autor, con predominio de material conversacional. Su interés práctico está en que iguala o supera ligeramente a Parakeet UK v2 en la media de diez conjuntos de evaluación en ucraniano (8,23 % de WER frente a 8,29 %) y mejora de forma clara al Whisper large-v3 original (9,79 %) y al turbo sin ajustar, manteniendo la velocidad del turbo gracias a su decodificador reducido.

Se distribuye en dos formatos: pesos PyTorch en `safetensors` (float32) para Transformers y una conversión Core ML en fp16 (1,6 GB en total) con el diseño de carpetas de WhisperKit, pensada para inferencia local en dispositivos Apple. Es una versión 1, publicada el 28 de octubre de 2026, sin descargas ni validación externa registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); codificador congelado del modelo base, decodificador de 4 capas reentrenado |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (arquitectura Whisper); no aplica contexto de texto |
| Tipos de cuantizacion | no disponible; el repositorio publica float32 en safetensors y fp16 en Core ML. No hay builds int8, 6-bit ni GGUF publicados |
| Idiomas soportados | ucraniano (uk) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32, formato `WhisperForConditionalGeneration`) y Core ML `.mlmodelc` (fp16: `MelSpectrogram`, `AudioEncoder` de 1,2 GB y `TextDecoder` de 330 MB) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder con la arquitectura estándar de Whisper large-v3-turbo: entrada mel de 128 bins, ventanas de 30 segundos y decodificador de 4 capas en lugar de las 32 del large-v3, lo que explica su mayor velocidad de inferencia. El ajuste fino solo afecta al decodificador; el codificador, el tokenizador y el vocabulario son los del modelo base de OpenAI, de modo que el modelo conserva parte de las capacidades multilingües adquiridas en el preentrenamiento aunque el entrenamiento supervisado se haya centrado en ucraniano.

El corpus de entrenamiento son 617 horas de audio en ucraniano, en su mayor parte conversacional, idénticas a las usadas para Parakeet UK v2. La model card no detalla la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (en un modelo ASR no serían el mecanismo habitual), ni los hiperparámetros del ajuste. Tampoco se documenta ninguna innovación técnica más allá del recorte del decodificador propio de la variante turbo. La conversión a Core ML se realizó con las herramientas `whisperkittools` de Argmax, sin paletización, y la carpeta Core ML declara la versión `"version": "whisper_b1"` en su `config.json`.

## Capacidades

- Transcripción de voz a texto en ucraniano con mayúsculas, puntuación y números en dígitos, sin necesidad de postprocesado de formato.
- Transcripción en inglés, conservada del modelo base; el autor indica explícitamente que el inglés se mantiene.
- Manejo de audio conversacional y espontáneo: podcasts, entrevistas, reuniones y sesiones parlamentarias.
- Vocalización de vocabulario especializado en dominios evaluados: medicina, IT, ingeniería, psicología y material parlamentario.
- Uso de la tarea `transcribe` y la tarea de traducción propias de Whisper a través de `generate_kwargs` (la model card solo documenta y evalúa `transcribe`).
- Ejecución local en dispositivos Apple mediante WhisperKit y Core ML, con decodificación y respaldo por temperatura incluidos en la librería.
- Integración con el pipeline `automatic-speech-recognition` de Transformers.
- Capacidad limitada de code-switching ucraniano-inglés: transcribe correctamente el contenido, pero solo escribe en inglés el 9,5 % de las palabras inglesas en la prueba específica.

## Casos de uso

- Actas de comisiones parlamentarias: el modelo baja el WER al 9,33 % en 47 reuniones no vistas, frente al 12,26 % del large-v3, lo que permite generar borradores de acta revisables por un editor humano con una carga de corrección notablemente menor.
- Transcripción de plenos y sesiones oficiales: con un WER del 4,64 % en el conjunto de la Verkhovna Rada, es adecuado para producir subtítulos y registros de intervenciones con mínima intervención manual.
- Subtitulado de podcasts y entrevistas: 10,75 % de WER en un conjunto de 269 clips conversacionales, con salida ya puntuada y con mayúsculas que reduce el trabajo de formateo previo a la publicación.
- Aplicaciones de dictado y notas de voz en iOS y macOS: la conversión Core ML de 1,6 GB con el diseño de WhisperKit permite inferencia totalmente local, sin enviar audio a servidores y con un consumo de disco y memoria asumible en un portátil Apple.
- Documentación clínica dictada: el conjunto de medicina se transcribe con un 7,86 % de WER, suficiente para generar borradores de informes que el profesional revisa antes de firmar.
- Generación de subtítulos para vídeo divulgativo y formación técnica: los conjuntos de IT (8,47 %) e ingeniería (7,69 %) muestran un comportamiento razonable con terminología especializada.
- Análisis de llamadas y atención al cliente: al ser un modelo de 808 M de parámetros puede ejecutarse en una GPU de consumo y procesar lotes de grabaciones en pipelines internos con coste por hora bajo.
- Investigación lingüística y creación de corpus orales: la licencia MIT y la disponibilidad de pesos en formato estándar permiten usarlo para anotar grandes volúmenes de audio ucraniano sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; se trata de un modelo ASR y las métricas publicadas son de tasa de error por palabra (WER). Todas las cifras proceden de la model card, medidas en Core ML sobre un Apple M3 Pro con una muestra de una hora de cada conjunto de evaluación y texto normalizado (minúsculas, sin puntuación, guiones como espacios).

| Conjunto de evaluacion (ucraniano) | Clips | Whisper large-v3 | Whisper large-v3-turbo | Whisper UK v1 (este modelo) | Parakeet v3 (base) | Parakeet UK v2 |
|---|---|---|---|---|---|---|
| Comisiones parlamentarias | 325 | 12,26 % | 13,69 % | 9,33 % | 14,31 % | 9,00 % |
| Podcasts y entrevistas | 269 | 11,59 % | 13,83 % | 10,75 % | 14,17 % | 10,70 % |
| YODAS, vídeos públicos | 459 | 14,56 % | 16,99 % | 14,35 % | 16,17 % | 13,71 % |
| Plenos de la Verkhovna Rada | 306 | 7,92 % | 8,86 % | 4,64 % | 8,80 % | 4,90 % |
| Charlas públicas, temas mixtos | 270 | 11,57 % | 11,81 % | 7,79 % | 12,23 % | 7,97 % |
| FLEURS uk | 343 | 7,37 % | 9,00 % | 7,01 % | 7,20 % | 6,36 % |
| IT | 270 | 7,58 % | 8,14 % | 8,47 % | 9,30 % | 8,48 % |
| Medicina | 269 | 11,34 % | 11,78 % | 7,86 % | 10,98 % | 8,81 % |
| Psicología | 272 | 4,38 % | 5,04 % | 4,42 % | 5,98 % | 4,63 % |
| Ingeniería | 248 | 9,36 % | no completado | 7,69 % | 11,20 % | 8,32 % |
| Media de los 10 conjuntos en ucraniano | | 9,79 % | no disponible | 8,23 % | 11,03 % | 8,29 % |

| Conjunto de evaluacion (ingles) | Clips | Whisper large-v3 | Whisper large-v3-turbo | Whisper UK v1 (este modelo) | Parakeet v3 (base) | Parakeet UK v2 |
|---|---|---|---|---|---|---|
| FLEURS en | 378 | 4,83 % | 5,06 % | 5,28 % | 5,90 % | 5,51 % |
| Reuniones AMI en inglés | 862 | 22,30 % | 22,63 % | 13,21 % | 14,14 % | 12,72 % |

| Code-switching: 200 clips con una frase en inglés entre dos en ucraniano | Whisper large-v3 | Whisper large-v3-turbo | Whisper UK v1 (este modelo) | Parakeet v3 (base) | Parakeet UK v2 |
|---|---|---|---|---|---|
| WER | 43,17 % | 44,48 % | 38,98 % | 30,95 % | 28,55 % |
| Palabras inglesas escritas en inglés | 0,3 % | 2,3 % | 9,5 % | 32,8 % | 32,9 % |

Diferencias de WER agrupadas sobre los 10 conjuntos en ucraniano, con intervalo del 95 % por bootstrap emparejado sobre grabaciones (negativo = el primer modelo es mejor): Whisper UK v1 frente a Whisper large-v3, −1,55 puntos [−2,17; −0,92]; Parakeet UK v2 frente a Whisper large-v3, −1,50 puntos [−2,06; −0,90]; Whisper UK v1 frente a Parakeet UK v2, −0,06 puntos [−0,32; +0,23], es decir, sin diferencia significativa.

Con generación greedy por defecto en PyTorch y Transformers, los mismos pesos obtienen 8,97 % en la media de los diez conjuntos en lugar de 8,23 %, principalmente por repeticiones en el conjunto de podcasts (15,39 %). El autor recomienda por ello la build Core ML con WhisperKit, cuyo respaldo por temperatura evita ese problema.

## Requisitos de hardware

- VRAM estimada: unos 3,2 GB para los pesos en float32 y aproximadamente 1,6 GB en fp16, más el margen de activaciones y del búfer de audio de 30 segundos; en la práctica cabe holgadamente en GPUs con 6-8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, L4, A10); en A100 y H100 el modelo queda muy sobredimensionado y el cuello de botella será el preprocesado de audio, no la GPU.
- Cabe en GPU de consumo: sí. Con 808,9 M de parámetros, una RTX 4090 o una RTX 3060 pueden ejecutar varias instancias en paralelo o procesar lotes grandes.
- Despliegue: Transformers con `pipeline("automatic-speech-recognition")`, WhisperKit con la carpeta Core ML en Apple Silicon, faster-whisper o whisper.cpp mediante conversión propia (no se publican builds GGUF ni binarios whisper.cpp en el repositorio), y servidores de inferencia con soporte de Whisper como vLLM o TGI, aunque el autor no documenta ni valida estos últimos.
- Latencia y throughput: no se publican cifras concretas. La model card solo indica que es aproximadamente tan rápido como el turbo original y varias veces más rápido que large-v3, gracias al decodificador de 4 capas en lugar de 32.
- Almacenamiento: el repositorio ocupa 4,9 GB; la build Core ML son 1,6 GB en disco (1,2 GB el codificador y 330 MB el decodificador).

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER medio en ucraniano (10 conjuntos) | WER en inglés (AMI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-large-v3-turbo-uk (este modelo) | 808,9 M | 30 s | 8,23 % | 13,21 % | MIT | HuggingFace, safetensors y Core ML |
| openai/whisper-large-v3 | 1.550 M | 30 s | 9,79 % | 22,30 % | MIT (según el modelo base) | HuggingFace, múltiples formatos |
| openai/whisper-large-v3-turbo | 808,9 M | 30 s | no disponible (no completó el conjunto de ingeniería) | 22,63 % | MIT | HuggingFace, múltiples formatos |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk (v2) | 0,6 B | no disponible | 8,29 % | 12,72 % | no disponible en la información proporcionada | HuggingFace, build int8 |

Frente a Parakeet UK v2, el modelo es estadísticamente equivalente en la media de ucraniano (diferencia de −0,06 puntos con intervalo que cruza cero), algo peor en reuniones en inglés (13,21 % frente a 12,72 %) y claramente peor en code-switching (38,98 % frente a 28,55 %, y solo el 9,5 % de las palabras inglesas escritas en inglés frente al 32,9 %). Su ventaja es la compatibilidad con el ecosistema Whisper (Transformers, WhisperKit, herramientas de transcripción con marcas de tiempo) y una licencia MIT explícita.

## Limitaciones y advertencias

- Code-switching: con un 38,98 % de WER en clips que alternan ucraniano e inglés, no es adecuado para contenido bilingüe sin revisión; además solo transcribe en alfabeto latino el 9,5 % de las palabras inglesas.
- Repeticiones en PyTorch: con decodificación greedy por defecto, el WER en podcasts sube al 15,39 % por bucles de repetición. Hay que usar decodificación con respaldo por temperatura (por ejemplo WhisperKit) o ajustar los parámetros de generación.
- Idioma: el modelo se entrenó con el token de idioma proporcionado y la detección automática de idioma no se evaluó; conviene fijar `language="uk"` o `"en"` explícitamente en cada llamada.
- Inglés: aunque se conserva, el rendimiento en inglés es inferior al de modelos especializados (13,21 % en AMI frente al 12,72 % de Parakeet UK v2), y en FLEURS en empeora ligeramente respecto al large-v3 (5,28 % frente a 4,83 %).
- Sesgos: la model card no documenta ningún análisis de sesgos por acento, género, edad o procedencia regional. El corpus es mayoritariamente conversacional y parlamentario, por lo que la cobertura de registros dialectales es desconocida.
- Alucinación: como todo modelo Whisper, puede inventar texto en segmentos con silencio, ruido o música; no se documentan mitigaciones específicas más allá del respaldo por temperatura.
- Validación externa: el repositorio no registra descargas ni valoraciones, y todos los números proceden del autor del modelo, sin replicación independiente.
- Licencia: MIT, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI de las que deriva.
- Fecha y versionado: es la versión 1, publicada el 28 de octubre de 2026; el autor recomienda fijar la revisión con `revision=` o descargar un commit concreto para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ihnatov-yuri/whisper-large-v3-turbo-uk
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Parakeet UK v2 del mismo autor: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Repositorio de información del modelo y papers: no disponible en la información proporcionada
