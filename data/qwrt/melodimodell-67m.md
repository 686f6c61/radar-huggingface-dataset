# qwrt/Melodimodell-67M

## Resumen

Melodimodell-67M es un modelo transformer autorregresivo de 67.389.952 parámetros desarrollado por el usuario qwrt, construido sobre la arquitectura Qwen3 y entrenado para predecir secuencias de notas musicales codificadas como texto plano. Cada nota se representa con cuatro atributos (altura, volumen, duración y tiempo de inicio) en una cadena de aproximadamente 7 caracteres, de modo que el modelo opera a nivel de carácter y no sobre tokens lingüísticos convencionales. No es un modelo de lenguaje general: es un generador de melodías que se sirve del pipeline `text-generation` y de una ventana de 8192 caracteres (equivalentes a unas 1.170 notas).

El problema que aborda es la generación simbólica de música (no audio) en un formato legible y fácil de parsear, entrenado durante 20 épocas sobre el dataset Monster-MIDI, con más de 400.000 ficheros MIDI. Su interés práctico reside en el tamaño reducido, la licencia Apache 2.0, la disponibilidad de pesos en safetensors y GGUF, y una técnica de "remix" publicada por el autor que selecciona muestras generadas según la similitud de activaciones medias por neurona, sin modificar los pesos ni las activaciones del modelo.

Es relevante ahora por dos motivos: por un lado, demuestra que un modelo de 67M puede producir continuaciones musicales coherentes a corto plazo en hardware trivial; por otro, documenta un caso de uso de interpretabilidad (steering por selección de muestras) poco habitual en modelos de este tamaño. El repositorio ocupa 386,2 GB, muy por encima de lo que sugieren los parámetros, y el modelo acumula 187 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo basado en Qwen3, modelado a nivel de carácter |
| Parámetros totales | 67.389.952 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 caracteres (aproximadamente 1.170 notas de ~7 caracteres) |
| Tipos de cuantización | Safetensors y GGUF; los niveles concretos de cuantización GGUF no están detallados |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural; su "alfabeto" es el formato textual de notas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo denso que hereda la arquitectura Qwen3 y predice el siguiente carácter de una secuencia textual que codifica notas. Cada nota incluye pitch, volumen, duración y tiempo de inicio, y ocupa unos 7 caracteres; la secuencia máxima es de 8192 caracteres. El entrenamiento se realizó durante 20 épocas sobre Monster-MIDI (más de 400.000 ficheros MIDI). El autor no documenta el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo preentrenado de generación simbólica, no se menciona alineación por preferencias.

La innovación técnica documentada no está en el entrenamiento sino en la inferencia: el autor describe una rutina de "remix" que calcula la activación media por neurona (menciona 32.768 neuronas en total) sobre una melodía objetivo durante sus primeros 8192 tokens, y después genera N muestras independientes de T tokens desde un prompt vacío (`"*\n"`), conservando la que maximiza la similitud coseno con esa activación objetivo, y repitiendo el proceso R veces hasta llenar el contexto. No se alteran pesos ni activaciones: la única intervención es la selección de muestras generadas. Las similitudes finales reportadas en la model card son 0,687 (Alla turca), 0,872 (Let it go), 0,689 (Fur Elise) y 0,697 (Gimme gimme), con una quinta fila truncada en la información disponible.

## Capacidades

- Generación autorregresiva de melodías en formato textual de notas (pitch, volumen, duración, tiempo de inicio), pensada para reproducción en piano.
- Continuación de una pieza a partir de un prompt: en los ejemplos del autor se introducen los primeros 30 segundos (30 líneas del formato) y se genera hasta llenar el contexto de 8192 caracteres.
- Muestreo configurable: los ejemplos usan top_p = 1.0, temperature = 1.0 y top_k desactivado, es decir, muestreo desde la distribución pura, el ajuste más creativo y también el más propenso a desviarse.
- "Remix" por selección de muestras según similitud de activaciones, incluyendo la mezcla de activaciones de dos o más melodías para obtener híbridos.
- Generación de variantes estilísticas dentro del repertorio aprendido (música de videojuegos, piezas clásicas, bandas sonoras), a juzgar por los prompts publicados: Undertale, Stereo Madness, He's a Pirate, Alla turca, Fur Elise.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) para servir el modelo como API de generación de texto.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües, visión o audio: no disponibles (el modelo no procesa audio; genera símbolos).

## Casos de uso

- Generación de melodías para piano en prototipado musical: se escribe un prompt con los primeros compases en el formato de notas y el modelo continúa la pieza; el resultado se convierte a MIDI con un parser propio de siete caracteres por nota. Es adecuado por su bajo coste de inferencia y porque la salida ya está estructurada.
- Herramienta de ideación en un DAW: integrado como servicio local vía llama.cpp o transformers, el modelo produce variantes rápidas que el compositor importa y edita; el contexto de 8192 caracteres da para piezas de varios minutos en notación simbólica.
- Creación de bandas sonoras para prototipos de videojuegos: el dataset de entrenamiento (Monster-MIDI) incluye repertorio de videojuegos y el autor demuestra continuaciones de temas como Undertale o Stereo Madness, lo que encaja en maquetas de nivel o tráiler.
- "Remixes" guiados por activaciones: dado un tema de referencia, se genera un conjunto de muestras y se selecciona la de mayor similitud coseno con la activación media del original, lo que permite explorar variaciones estilísticas sin entrenamiento adicional (0,872 de similitud en el ejemplo de Let it go).
- Generación de datos sintéticos de melodías: sirve para ampliar corpus de entrenamiento de modelos de música simbólica o para pruebas de herramientas de análisis MIDI, gracias a la licencia Apache 2.0 y a la posibilidad de ejecutarlo en CPU.
- Investigación en interpretabilidad: el modelo es un banco de pruebas pequeño donde medir activaciones medias por neurona, comparar distribuciones entre piezas y estudiar cómo la selección de muestras aproxima una dirección latente sin intervenir en los pesos.
- Pruebas de infraestructura de serving: al ser un modelo de 67M con variante GGUF, es útil como caso de prueba end-to-end de pipelines de inferencia (tokenizador de caracteres, límites de contexto, streaming) sin consumir GPUs caras.
- Docencia: ejemplo compacto y reproducible de modelado autorregresivo a nivel de carácter con un dominio no lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una curva de validación (imagen `67mval`) y una tabla de similitud coseno para la rutina de remix, pero no se aportan valores numéricos de perplejidad, precisión de notas ni comparaciones cuantitativas con otros modelos.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Remix sobre Alla turca | Similitud coseno de activaciones | 0,687 |
| Remix sobre Let it go | Similitud coseno de activaciones | 0,872 |
| Remix sobre Fur Elise | Similitud coseno de activaciones | 0,689 |
| Remix sobre Gimme gimme | Similitud coseno de activaciones | 0,697 |
| Remix sobre Flohwalzer | Similitud coseno de activaciones | No disponible (fila truncada) |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, unos 135 MB solo para pesos (67,4M × 2 bytes); en int8, unos 67 MB; en int4, unos 34 MB. El caché KV para 8192 caracteres no está documentado y depende de la configuración de capas y cabezas, no publicada.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090 o una A100 están completamente sobredimensionadas. Cabe en iGPU y en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales (GTX 1650, RTX 3060, RTX 4090, Apple Silicon), y también en placas tipo Raspberry Pi con llama.cpp, aunque sin datos medidos.
- Opciones de despliegue: llama.cpp (el repo publica GGUF y la model card enlaza instrucciones para llama.cpp), transformers con safetensors, y serving HTTP mediante el flag `endpoints_compatible`. vLLM o TGI son técnicamente posibles pero desproporcionados para este tamaño; Ollama requeriría construir un Modelfile a partir del GGUF, ya que no hay versión oficial en la librería.
- Latencia y throughput: no hay mediciones publicadas. Cualitativamente, con 67M de parámetros y contexto de 8192 caracteres, la generación es viable de forma interactiva en CPU, pero no se aportan tokens por segundo.
- Almacenamiento: el repo ocupa 386,2 GB, muy superior al peso del modelo; conviene descargar solo los ficheros safetensors o GGUF necesarios mediante descarga selectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwrt/Melodimodell-67M | 67.389.952 | 8192 caracteres | Generación simbólica de melodías | Apache 2.0 | HuggingFace, safetensors y GGUF |
| qwrt/Melodimodell-1M | No disponible | No disponible | Generación simbólica de melodías (misma familia) | No disponible | HuggingFace |
| "Midimodell-67.390M" (índice de Essa Mamdani) | 67,390M | No listado | Generación de texto / MIDI | No listado | Índice de terceros; parece referirse al mismo modelo |
| Modelos generalistas tipo Qwen3 de tamaño pequeño | No disponible en esta ficha | No disponible en esta ficha | Texto general | No disponible en esta ficha | No disponible |

No se dispone de datos de rendimiento de las alternativas para establecer una comparación cuantitativa; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El formato no codifica el instrumento: todas las secuencias se reproducen como piano, lo que descarta la generación orquestal o con percusión diferenciada.
- El autor advierte que con muestreo puro (temperature 1.0, top_p 1.0) la canción "puede desviarse" ("going off-track"); no hay guía sobre parámetros más conservadores ni métricas de cohesión musical.
- La ventana de 8192 caracteres equivale a unas 1.170 notas: en los ejemplos, la generación se corta a mitad de pieza al llenarse el contexto.
- La salida es texto con un formato de nota propio de ~7 caracteres; requiere un parser a MIDI y no se publica un tokenizador estándar ni una especificación formal del formato en la información disponible.
- El "remix" no usa el contexto de la melodía original ni modifica activaciones: es una selección de muestras, por lo que la similitud reportada (0,687-0,872) es variable y el autor reconoce que la calidad puede fluctuar.
- No se documentan sesgos, evaluación de toxicidad ni idiomas soportados; al no ser un modelo de lenguaje, los sesgos relevantes serían de estilo y repertorio, derivados de Monster-MIDI (más de 400.000 ficheros, con predominio de música de videojuegos y piezas populares).
- Riesgo de alucinación en sentido musical: continuación plausible pero incoherente, sin mecanismo de verificación automática.
- Licencia Apache 2.0 permite uso comercial del modelo, pero no se pronuncia sobre los derechos de las obras del dataset de entrenamiento ni sobre las melodías generadas por imitación de temas con copyright.
- El repositorio ocupa 386,2 GB, lo que puede provocar descargas costosas si no se filtran los ficheros.
- Señales de validación comunitaria muy bajas (187 descargas, 1 like) y nomenclatura inconsistente entre "Melodimodell" y "Midimodell" en índices de terceros; conviene verificar el artefacto antes de integrarlo en producción.
- No se publican resultados de benchmarks ni mediciones de latencia, por lo que cualquier decisión de despliegue debe basarse en pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qwrt/Melodimodell-67M
- Modelo de la misma familia (1M): https://huggingface.co/qwrt/Melodimodell-1M
- Dataset de entrenamiento: https://huggingface.co/datasets/projectlosangeles/Monster-MIDI-Dataset
- Publicación en X sobre el modelo: https://x.com/HuggingModels/status/2113260336539377879
- Índice de modelos de qwrt en Essa Mamdani: https://essamamdani.com/ai-models/company/qwrt
- Ficha indexada "Midimodell-67.390M": https://essamamdani.com/ai-models/hf-qwrt-midimodell-67-390m
- Paper técnico: no disponible
- Repositorio de código independiente: no disponible (el autor indica que el código del remix está al final del propio repo de HuggingFace)
