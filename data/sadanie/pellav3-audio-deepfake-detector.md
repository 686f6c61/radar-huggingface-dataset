# Sadanie/pellav3-audio-deepfake-detector

## Resumen

Pellav3 es un detector de audio deepfake desarrollado por Sadanie (Pella Research) que aborda el problema del anti-spoofing en voz sintetica. El modelo procesa cada clip de audio mediante una arquitectura de doble vista: analiza simultaneamente la forma de onda cruda y el espectrograma mel, codifica cada vista en una secuencia de frames, fusiona ambas secuencias frame a frame y aplica attentive statistics pooling para producir una puntuacion unica de probabilidad de falsedad (p_fake).

Con 1.54 mil millones de parametros y una entrada fijada a 16 kHz, el modelo se distribuye en fp32 (6.2 GB) junto con un script de inferencia listo para ejecutar. Es la tercera iteracion de la familia Pella, tras Pellav2 (agosto de 2026), y su relevancia radica en la deteccion de voz generada por sistemas modernos de clonacion, un vector creciente de fraude y desinformacion.

La model card es notablemente escasa: no documenta datos de entrenamiento, benchmarks ni composicion del dataset, lo que limita la evaluacion independiente de su calidad mas alla de la licencia MIT y la disponibilidad publica de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble vista (waveform + espectrograma mel) con fusion frame a frame y attentive statistics pooling |
| Parametros totales | 1.54 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; duracion de clip no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, fp32) |

## Arquitectura y entrenamiento

Pellav3 emplea una arquitectura de dos ramas que procesa el mismo clip desde dos representaciones complementarias: la forma de onda cruda y el espectrograma mel. Cada rama produce una secuencia de frames que se fusiona elemento a elemento en un unico flujo, sobre el que se aplica attentive statistics pooling para agregar la informacion temporal en un vector de representacion que alimenta la cabeza de clasificacion binaria (fake/real).

La model card no especifica el numero de tokens de audio utilizados en el entrenamiento, la composicion del dataset, si hubo etapas de fine-tuning supervisado o tecnicas de aumento de datos, ni detalles sobre la funcion de perdida. Tampoco se documenta la arquitectura interna de los encoders de cada rama (tipo de transformer, CNN o híbrido). Esta ausencia de informacion impide reproducir el entrenamiento o auditar los datos utilizados.

## Capacidades

- Deteccion binaria de audio deepfake: devuelve una probabilidad p_fake por clip y etiqueta como FAKE cuando p_fake >= 0.5.
- Analisis multimodal de audio: combina informacion de dominio temporal (waveform) y frecuencial (mel spectrogram) en una sola decision.
- Procesamiento de audio a 16 kHz con soporte de multiples formatos de entrada via ffmpeg.
- Normalizacion de sonoridad mediante pyloudnorm, segun las dependencias del script de inferencia.
- Inferencia por linea de comandos mediante `pellav3_infer.py`.
- No se documenta soporte de tool calling, agentes, vision, audio de salida ni modo thinking.
- Capacidad multilingue no documentada; el unico idioma declarado es ingles.

## Casos de uso

- Moderacion de plataformas de audio: integrado como filtro previo a la publicacion de clips en podcasts, redes sociales o foros de voz, el modelo etiqueta automaticamente contenido sospechoso para revision humana.
- Verificacion periodistica: un redactor puede pasar un audio recibido por `pellav3_infer.py` y obtener una probabilidad de falsedad antes de citarlo como fuente.
- Deteccion de fraude telefonico: en pipelines de analisis de llamadas, el modelo puede marcar segmentos con voz sintetica para alertar a sistemas antifraude.
- Forense digital: como herramienta auxiliar en investigaciones que requieren identificar voz generada por sistemas de clonacion modernos.
- Investigacion en anti-spoofing: la licencia MIT y los pesos publicos permiten usar el modelo como baseline o componente en estudios academicos de deteccion de voz sintetica.
- Filtrado en datasets de voz: descartar muestras sinteticas antes de entrenar modelos de reconocimiento de habla o de sintesis.
- Automatizacion de QA en produccion de audio: validar que locuciones generadas o grabadas cumplen criterios de autenticidad antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, EER, AUC ni comparaciones con otros detectores. Existe una referencia externa a un benchmark independiente de Podonos (agosto de 2026) con 4.524 clips y unos 25 sistemas de clonacion de voz, pero no se aportan resultados de Pellav3 en dicho benchmark dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6.2 GB solo para pesos, mas overhead de activaciones y buffers de audio; se recomienda un minimo de 8-10 GB de VRAM.
- GPU recomendadas: NVIDIA A100, H100 o L40S para inferencia por lotes; RTX 4090 o RTX 3090 para uso individual.
- Cabe en GPU de consumo con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080). En GPUs de 8 GB puede requerir cuantizacion o carga parcial, no documentada por el autor.
- Opciones de despliegue: el autor solo proporciona `pellav3_infer.py` con PyTorch y torchaudio. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.54B en fp32, la latencia dependera del hardware y de la duracion del clip; no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pellav3 (Sadanie) | 1.54B | audio 16 kHz | MIT | Pesos en HF (.pt) | Doble vista waveform + mel |
| Pellav2 (Sadanie) | no disponible | audio 16 kHz | no disponible en la informacion | Pesos en HF | Version anterior, agosto 2026 |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros detectores de deepfake comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar Pellav3 con detectores de deepfake de terceros en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento: no se puede evaluar sesgos por idioma, acento, genero, edad o canal de grabacion.
- Riesgo de falsos positivos y negativos no cuantificado: sin benchmarks publicados, no hay estimacion de EER ni de calibracion del umbral 0.5.
- Solo declara soporte de ingles; el rendimiento en otros idiomas es desconocido.
- Modelo entrenado contra sistemas de clonacion hasta la fecha de publicacion (noviembre de 2026); puede degradarse frente a generadores mas recientes.
- Pesos en fp32 de 6.2 GB: no cabe en GPUs de gama baja sin cuantizacion, que el autor no documenta.
- Dependencia de ffmpeg en el PATH y de versiones fijas de librerias (transformers==4.48.3), lo que puede complicar el despliegue en entornos con otras dependencias.
- Licencia MIT permite uso comercial, pero la ausencia de garantias y de evaluacion independiente desaconseja su uso como unico criterio en decisiones de alto impacto sin revision humana.
- No se documenta el comportamiento ante audio con ruido, musica de fondo, multiples hablantes o clips muy cortos.

## Enlaces

- Hugging Face: https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector
- Version anterior (Pellav2): https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- README de Pellav2: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector/blob/main/README.md
- Pella Research: https://pellaresearch.com/
