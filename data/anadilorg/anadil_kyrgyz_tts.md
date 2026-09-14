# Anadilorg/Anadil_Kyrgyz_TTS

## Resumen

Anadil_Kyrgyz_TTS (AnadilKyrgyzTTS) es un adaptador LoRA de síntesis de voz (text-to-speech) para kirguís (`kir`), desarrollado por Anadilorg y publicado bajo licencia MIT. No es un modelo completo, sino un ajuste fino de bajo rango (r=32, α=32) aplicado sobre el modelo base openbmb/VoxCPM2, con un tamaño de adaptador de aproximadamente 72 MB, 384 tensores y unos 18,1 millones de parámetros en F32. Forma parte de la familia "Anadil" de adaptadores TTS para lenguas minorizadas (laz, zazaki, adigué, kurmanji, armenio y ladino), y el kirguís es su incorporación más reciente.

El modelo resuelve un problema muy concreto: la ausencia de voces sintéticas de calidad para una lengua túrquica de Asia Central con recursos digitales limitados. Se entrenó con 29.987 segmentos de un único hablante procedentes de la contribución `ky` de Mozilla Common Voice (3.065 clips de un solo colaborador), durante 5.000 pasos de entrenamiento, y genera audio de salida a 48 kHz. La síntesis funciona con clonación por referencia: se aporta un wav del hablante objetivo y el modelo reproduce su timbre.

Su relevancia actual es doble. Por un lado, demuestra que un adaptador de apenas decenas de megabytes puede dotar de voz a una lengua de bajos recursos reutilizando un modelo base grande. Por otro, es un caso representativo de la estrategia de adaptadores LoRA aplicados a TTS multilingüe, con despliegue sencillo mediante la librería `voxcpm` y una interfaz Gradio local. La contrapartida es que la model card no reporta ninguna métrica objetiva de calidad y todos los ejemplos publicados son frases vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, α=32) sobre openbmb/VoxCPM2; el ajuste afecta a las capas LM y DiT del modelo base |
| Parametros totales | ~18,1 millones en el adaptador (384 tensores, F32); parametros del modelo base no disponibles |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | Adaptador distribuido en F32; no se documentan versiones GGUF, INT8 ni otras cuantizaciones |
| Idiomas soportados | Kirguis (`kir`); los metadatos incluyen tambien `tr` (turco), pero el entrenamiento declarado es solo en kirguis |
| Licencia | MIT (la licencia del modelo base VoxCPM2 no se detalla en la informacion disponible) |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se descarga por separado desde openbmb/VoxCPM2 |

Datos adicionales: frecuencia de muestreo de salida de 48 kHz, hablante único identificado como `spk_tmp_001`, 5.000 pasos de entrenamiento, tamano del repositorio ~0,1 GB, version 0.1.0, fecha declarada 2026.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre VoxCPM2. Segun la model card, los rangos de bajo rango se inyectan en las capas LM y DiT del modelo base, lo que sugiere una arquitectura compuesta por un modelo de lenguaje que modela la secuencia textual/latente y un transformer de difusion (DiT) que genera el audio a partir de esas representaciones. No se aportan en la informacion disponible detalles sobre el numero de capas, la dimension oculta, el tokenizador de audio ni el mecanismo exacto de condicionamiento por referencia del modelo base.

El entrenamiento se realizo sobre 29.987 segmentos de un unico hablante extraidos de la contribucion `ky` de Mozilla Common Voice, que corresponden a 3.065 clips originales. Es un volumen de datos pequeno y monohablante, lo que explica tanto la rapidez del ajuste (5.000 pasos) como la limitacion estructural del resultado: el modelo aprende el estilo y el timbre de ese colaborador concreto. No se menciona el uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo poco habitual en TTS y que en este caso no aplica. La generacion emplea un parametro de guiado `cfg_value=2.0` y 10 pasos de inferencia por defecto.

## Capacidades

- Sintesis de voz en kirguis a partir de texto, con salida a 48 kHz.
- Clonacion de voz por referencia: acepta un wav del hablante objetivo (`--reference`) para aproximar su timbre, incluido el del hablante de entrenamiento (`samples/1.wav`).
- Ajuste fino especifico de hablante: reproduce con mas fidelidad el estilo del colaborador de Common Voice usado en el entrenamiento.
- Control de la generacion mediante parametros de inferencia (`cfg_value`, `inference_timesteps`).
- Interfaz de linea de comandos (`inference.py`) y API de Python (`AnadilKyrgyzTTS.synthesize`).
- Demo web local con Gradio (`demo.py`, puerto 7860).
- Utilidades de validacion incluidas: `test_smoke.py --weights-only` para comprobar la integridad de los pesos y `test_smoke.py` para una prueba completa de sintesis.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada (el modelo es exclusivamente text-to-speech).

## Casos de uso

- Lectura de pantalla y accesibilidad: integrado en lectores de pantalla para usuarios kirguisparlantes con discapacidad visual, aprovechando que el modelo es ligero (72 MB de adaptador) y puede ejecutarse junto al modelo base en una sola GPU.
- Audiolibros y prensa hablada: conversion de articulos, boletines o capitulos de libros al kirguis hablado con una voz consistente, gracias a que el modelo mantiene un unico timbre estable en todo el texto.
- Locucion de avisos publicos y contenido institucional: generacion de anuncios para transporte, sanidad o administracion en Kirguistan, donde la disponibilidad de locutores profesionales en kirguis es limitada.
- Doblaje y preservacion de la voz de un hablante concreto: uso de la clonacion por referencia para doblar material nuevo conservando el timbre de una persona (por ejemplo, un narrador o un informante linguistico), siempre con su consentimiento.
- Asistentes conversacionales en kirguis: combinado con un modelo de reconocimiento de voz y un LLM, permite construir un asistente por voz de extremo a extremo para una lengua que apenas tiene soporte comercial.
- Material educativo y aprendizaje de idiomas: generacion de ejercicios de pronunciacion y dictado en kirguis para escuelas y cursos de lengua, con la ventaja de reproducir una pronunciacion nativa.
- Investigacion en linguistica y documentacion: produccion de corpus de audio sintetico alineado con texto para experimentos de normalizacion, evaluacion de ASR o estudios comparativos entre lenguas turquicas.
- Prototipado rapido de productos de voz: al ser un adaptador pequeno y con licencia MIT, permite validar una hipotesis de producto de voz en kirguis antes de invertir en grabaciones profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han calculado metricas automaticas de calidad (WER, UTMOS u otras) y que los cinco ejemplos de audio publicados corresponden a frases vistas por el modelo durante el entrenamiento, por lo que no sirven como evidencia de generalizacion a texto nuevo.

| Metrica | Resultado |
|---|---|
| WER | no disponible |
| UTMOS / MOS | no disponible |
| Similitud de hablante | no disponible |
| Latencia de sintesis | no disponible |
| Throughput | no disponible |

## Requisitos de hardware

- Memoria recomendada: aproximadamente 9 GB segun la model card para inferencia en fp32.
- GPU recomendadas: CUDA es la opcion preferida por el autor. Una GPU con 12 GB de VRAM o mas (RTX 3060 12 GB, RTX 4070, RTX 4080/4090, A10, L4) deberia ser suficiente para el conjunto base + adaptador en fp32 segun la cifra declarada; no se especifican modelos de gama alta concretos.
- Cabe en GPU de consumo: si, previsiblemente, en tarjetas con al menos 12 GB de VRAM, dado el requisito declarado de ~9 GB. Cualquier GPU con menos memoria requerira cuantizacion del modelo base, no documentada en esta ficha.
- Apple Silicon: compatible pero mas lento, segun la propia model card.
- Opciones de despliegue: libreria `voxcpm` con PyTorch y torchaudio; script `inference.py` por linea de comandos; API de Python; demo Gradio local. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Los valores por defecto de inferencia son `cfg_value=2.0` e `inference_timesteps=10`, parametros que afectan directamente al coste computacional.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos tecnicos de modelos alternativos, por lo que la comparacion cuantitativa no es posible. Se ofrece una comparacion cualitativa de categoria, marcando como "no disponible" todo dato que no consta en la documentacion facilitada.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Anadil_Kyrgyz_TTS | Adaptador LoRA TTS sobre VoxCPM2 | ~18,1 M en el adaptador | kir (metadatos: tambien tr) | MIT | Referencia de esta ficha |
| openbmb/VoxCPM2 | Modelo base TTS | no disponible | no disponible | no disponible | Modelo sobre el que se aplica el LoRA; sin datos en la informacion disponible |
| Otros adaptadores de la familia Anadil (laz, zazaki, adigue, kurmanji, armenio, ladino) | Adaptadores LoRA TTS | no disponible | lenguas minorizadas respectivas | no disponible | Mencionados en la model card, sin especificaciones |
| Alternativas TTS con soporte de kirguis (por ejemplo, sistemas multilingues o de Meta MMS) | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la informacion disponible |

## Limitaciones y advertencias

- Hablante unico: el modelo esta ajustado sobre un solo colaborador de Common Voice; no genera multiples voces de forma nativa. Cualquier otra voz exige clonacion por referencia y su fidelidad no esta cuantificada.
- Datos de entrenamiento escasos: 29.987 segmentos de un unico hablante (3.065 clips originales). El modelo tiende a reproducir el estilo de ese hablante y puede degradarse ante registros, dominios o longitudes de frase alejados de esa distribucion.
- Ausencia de metricas objetivas: no hay WER, UTMOS, MOS ni similitud de hablante publicados. Los cinco ejemplos de audio son frases vistas en entrenamiento, por lo que no constituyen evidencia de generalizacion. Cualquier evaluacion en produccion debe hacerse con un conjunto de test propio y ciego.
- Idioma: aunque los metadatos incluyen `tr`, el entrenamiento declarado es exclusivamente en kirguis. No hay evidencia de calidad en turco ni en otras lenguas turquicas.
- Riesgo de alucinacion acustica: como en cualquier TTS, el modelo puede producir pronunciaciones incorrectas, prosodia anomala o artefactos ante texto con numeros, abreviaturas, palabras extranjeras o signos de puntuacion poco frecuentes en el corpus de entrenamiento.
- Licencia del modelo base: el adaptador es MIT, pero el uso comercial depende tambien de la licencia de openbmb/VoxCPM2, que no se detalla en la informacion disponible. Debe verificarse antes de desplegar.
- Procedencia de los datos: el corpus proviene de una donacion voluntaria a Mozilla Common Voice. La clonacion de voz de personas identificables exige consentimiento explicito y cumple la normativa aplicable de proteccion de datos.
- Madurez: version 0.1.0, con 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Riesgo de sesgo de hablante y de variedad dialectal: al provenir de un unico colaborador, la variedad de kirguis representada es una sola y puede no reflejar las hablas del sur, del norte ni de comunidades fuera de Kirguistan.
- Restriccion practica de memoria: se recomienda aproximadamente 9 GB de memoria para fp32, lo que excluye GPUs de gama baja y hace que la inferencia en Apple Silicon sea notablemente mas lenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anadilorg/Anadil_Kyrgyz_TTS
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Fichero de licencia del repositorio: https://huggingface.co/Anadilorg/Anadil_Kyrgyz_TTS/blob/main/LICENSE
- Ejemplos de audio originales y sintetizados: https://huggingface.co/Anadilorg/Anadil_Kyrgyz_TTS/tree/main/samples
- Mozilla Common Voice (origen del corpus `ky`): https://commonvoice.mozilla.org/
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo y no aportan enlaces adicionales utiles (contenian articulos sobre auriculares AirPods Max y un indice de tarjetas graficas). No se han encontrado papers, repositorios ni demos adicionales en la informacion disponible.
