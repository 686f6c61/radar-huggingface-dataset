# datapsalm/dsn2026-lid-w01

## Resumen

dsn2026-lid-w01 es un modelo de identificación de lengua hablada (spoken language identification, LID) desarrollado por el equipo formado por Oludare Samuel, Fagbemiro Victoria y Sumayah Adegbite, presentado como participación en la competición DSN 2026 «Find the Language I Am Speaking» de Data Science Nigeria. El modelo recibe un fragmento de audio y devuelve una de 13 etiquetas: doce lenguas nigerianas (`yor`, `ibo`, `hau`, `ego`, `anw`, `efi`, `ibb`, `idu`, `igl`, `nup`, `tiv`, `urh`) más una clase comodín `other` para cualquier otra lengua.

Técnicamente no es un modelo generativo: es un checkpoint de `AutoModelForAudioClassification` construido sobre el encoder de `openai/whisper-base`, con 20.213.268 parámetros totales, pesos en safetensors fp16 y sin código personalizado (se carga con la librería `transformers` estándar). La ventana de entrada es de 10 segundos de características log-mel, con los embeddings posicionales truncados en consecuencia para reducir coste de cómputo.

Su relevancia es doble: por un lado aborda un problema poco cubierto —la discriminación entre lenguas nigerianas de bajos recursos, algunas con muy pocos hablantes en el corpus de entrenamiento—; por otro, es un ejemplo de ajuste fino eficiente sobre un modelo base pequeño, con un presupuesto de 20 M de parámetros que permite inferencia en CPU o en cualquier GPU de consumo. El autor reporta un F1 ponderado por lengua de aproximadamente 0,67 en validación local tras calibración, sin datos de benchmarks públicos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Whisper encoder) con cabeza de clasificación y pooling weighted-layer-sum |
| Parametros totales | 20.213.268 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 10 s de log-mel; embeddings posicionales truncados. No aplica contexto de texto |
| Tipos de cuantizacion | Solo fp16 publicado; no se distribuyen versiones GGUF, int8 ni int4 validadas |
| Idiomas soportados | yor, ibo (ig), hau (ha), ego, anw, efi, ibb, idu, igl, nup, tiv, urh, mas clase `other` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16) |
| Tarea (pipeline) | `audio-classification` (identificacion de lengua hablada) |
| Numero de etiquetas | 13 (12 lenguas + `other`) |
| Entrada | Audio mono, 10 s, caracteristicas log-mel de Whisper |
| Modelo base | openai/whisper-base (solo encoder) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `openai/whisper-base`, un transformer de 20,2 M de parámetros, y descarta el decoder de ASR. Sobre la salida del encoder se aplica una cabeza de clasificación con pooling *weighted-layer-sum*, es decir, una combinación ponderada y aprendida de las representaciones de las distintas capas en lugar de tomar únicamente la última. El ajuste fino es extremo a extremo y el checkpoint resultante es un `AutoModelForAudioClassification` convencional, sin dependencias de código propio.

El entrenamiento emplea exclusivamente los datos oficiales de la competición (`Data-Science-Nigeria/dsn-2026-lid-train`, con el split de validación reservado para selección de modelo y calibración); no se usó audio externo. Los recortes de audio son aleatorios de entre 2 y 10 s, con muestreo rebalanceado por clase para sobremuestrear las lenguas raras y suavizado de etiquetas de 0,1. La aumentación se genera a partir del propio audio de entrenamiento: ruido coloreado, *babble* construido con otros clips del corpus, reverberación simulada, limitación de banda telefónica con compansión mu-law y recorte, y ganancia aleatoria. Como paso final, se calibraron offsets por clase en el logit, optimizando el F1 ponderado por lengua de la competición e incorporándolos al sesgo del clasificador, de modo que la inferencia es un `argmax` simple. Los pesos se exportan en fp16.

## Capacidades

- Clasificación de lengua hablada en una ventana de audio de 10 segundos, devolviendo una de 13 etiquetas.
- Cobertura de doce lenguas nigerianas: yoruba, igbo, hausa, eggon, annang, efik, ibibio, idoma, igala, nupe, tiv y urhobo.
- Clase de rechazo `other` para audio que no corresponde a ninguna de las doce lenguas objetivo.
- Robustez declarada frente a condiciones telefónicas (filtrado de banda, compansión mu-law, recorte), ruido coloreado, *babble* y reverberación, por la aumentación aplicada en entrenamiento.
- Inferencia estándar vía `transformers` (`AutoModelForAudioClassification` + `AutoFeatureExtractor`), sin `trust_remote_code`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión ni audio-vision; solo clasificación de audio.
- No dispone de modo *thinking* ni de salida en streaming de tokens.

## Casos de uso

- **Enrutamiento de llamadas en atención al cliente:** el modelo etiqueta el idioma del primer fragmento de 10 s de una llamada entrante y permite dirigirla al agente o al árbol IVR en yoruba, hausa o igbo, reduciendo el tiempo de espera y las transferencias erróneas.
- **Preprocesamiento de pipelines ASR multilingües:** antes de transcribir, se identifica la lengua y se selecciona el modelo de reconocimiento de voz específico; con 20 M de parámetros y 40 MB en fp16 el paso de clasificación añade un coste despreciable frente al ASR.
- **Etiquetado y curación de corpus de habla:** clasificación automática de horas de audio para separar y documentar material en lenguas minoritarias nigerianas, con la clase `other` actuando como filtro de descarte.
- **Moderación y análisis de contenido en plataformas de medios:** detección del idioma de clips subidos por usuarios para aplicar políticas de contenido, subtitulado o recomendación por región lingüística.
- **Investigación lingüística y documentación:** medición de la presencia relativa de cada lengua en grabaciones de campo o emisiones de radio, y detección de confusiones entre las lenguas cercanas annang, ibibio y efik para estudios de inteligibilidad.
- **Control de calidad de emisiones y cuotas lingüísticas:** verificación automática de que una cadena de radio o televisión cumple cuotas de emisión en lenguas locales, procesando los clips en CPU sin necesidad de GPU.
- **Sistemas de accesibilidad y asistentes de voz locales:** activación de modelos de reconocimiento y síntesis adecuados al idioma del hablante en dispositivos de gama baja, gracias a que el modelo cabe holgadamente en memoria y puede ejecutarse sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de validación local sobre el split oficial más clips reservados de nupe:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Validacion local, antes de calibracion | F1 ponderado por lengua | 0,615 |
| Validacion local, tras calibracion (estimacion por validacion cruzada) | F1 ponderado por lengua | ~0,67 |

No hay datos publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, dado que el modelo no realiza tareas de texto. Tampoco se ofrecen métricas desagregadas por lengua ni comparación con la línea base de la competición.

## Requisitos de hardware

- **VRAM estimada:** inferior a 1 GB. Los pesos en fp16 ocupan aproximadamente 40 MB (20,2 M de parámetros × 2 bytes); con activaciones y buffers de audio el consumo real se mantiene muy por debajo de 1 GB.
- **GPU recomendadas:** innecesarias. Cualquier GPU consumer sirve (GTX 1650, RTX 3060, RTX 4090); también A100/H100 si se comparte infraestructura con otros modelos, pero no aportan ventaja apreciable.
- **CPU:** totalmente viable, incluso en un solo núcleo para clips de 10 s; es el escenario natural de despliegue dado el tamaño.
- **Cabe en consumer GPU:** sí, en cualquier GPU con más de 1 GB de VRAM, y también en dispositivos embebidos tipo Raspberry Pi 4/5 para inferencia por lotes pequeños.
- **Opciones de despliegue:** `transformers` (pipeline de `audio-classification`), exportación a ONNX Runtime para producción en CPU, TorchScript o `optimum`. vLLM y TGI no aplican porque no es un modelo generativo; llama.cpp/Ollama tampoco, al no existir conversión GGUF publicada.
- **Latencia y throughput:** no disponible en la información proporcionada. Como referencia estructural, un encoder de 20 M de parámetros procesando 10 s de audio es órdenes de magnitud más rápido que un ASR completo, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| datapsalm/dsn2026-lid-w01 | 20,2 M (solo encoder) | 10 s de audio | 12 lenguas nigerianas + `other` | Apache-2.0 | HuggingFace, transformers |
| openai/whisper-base | ~74 M (encoder + decoder) | 30 s de audio | Multilingue (ASR, ~99 lenguas) | MIT (modelo base) | HuggingFace, ampliamente desplegado |
| speechbrain/lang-id-voxlingua107-ecapa | no disponible | no disponible | 107 lenguas | no disponible | HuggingFace, SpeechBrain |
| facebook/mms-lid-256 | no disponible | no disponible | 256 lenguas | CC-BY-NC 4.0 (no comercial) | HuggingFace, transformers |

La comparación relevante no es de rendimiento absoluto sino de especialización: los modelos genéricos de LID cubren más lenguas, pero ninguno de los comparadores lista las doce lenguas nigerianas de este checkpoint ni incluye una clase `other` calibrada para el dominio de la competición. No hay datos públicos que permitan comparar F1 entre estas alternativas en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- **Cobertura de hablantes muy desigual:** el propio autor advierte que nupe tiene un solo hablante en el corpus de entrenamiento, e igala e ibibio solo dos. La precisión sobre hablantes no vistos de esas lenguas es incierta y probablemente muy inferior a la media.
- **Confusión entre lenguas cercanas:** annang, ibibio y efik están estrechamente emparentadas y el modelo las confunde con frecuencia, según reconoce la model card.
- **Riesgo de calibración sobreajustada:** los offsets por clase se ajustaron maximizando una métrica específica de la competición (F1 ponderado por lengua) sobre el split de validación, lo que puede inflar el rendimiento reportado y no transferirse a otros dominios o distribuciones de clases.
- **Ventana corta:** solo 10 s de audio; clips más largos requieren troceado y agregación de decisiones, un paso no incluido en el checkpoint.
- **Dominio restringido:** entrenado únicamente con los datos oficiales de la competición, con aumentación sintética derivada de ese mismo audio. El rendimiento fuera de ese dominio (micrófono limpio, otras variedades dialectales, habla espontánea) no está documentado.
- **Desbalanceo y sesgo de fuente:** las fuentes del corpus (afrispeech_ipa, hypa_voices, omnilingual_asr) determinan la distribución de acentos, géneros y canales; no se publican análisis de sesgo por género o edad.
- **Licencia:** el checkpoint es Apache-2.0 y permite uso comercial, pero los datos de entrenamiento tienen sus propias licencias (afrispeech_ipa CC-BY-4.0, hypa_voices Apache-2.0, omnilingual_asr CC-BY-4.0). El uso de la porción de Omnilingual ASR en investigación requiere citar el trabajo arXiv:2511.09690; conviene revisar las obligaciones de atribución antes de un despliegue en producción.
- **Madurez:** modelo con 0 descargas y 0 likes en el momento de la ficha, sin validación independiente ni resultados de terceros. No se recomienda como única línea de defensa en producción sin una evaluación propia sobre el dominio objetivo.
- **Sin cuantizaciones ligeras publicadas:** no hay versiones int8 ni GGUF, de modo que la reducción de memoria más allá de fp16 exige trabajo adicional de conversión no validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datapsalm/dsn2026-lid-w01
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Data-Science-Nigeria/dsn-2026-lid-train
- Paper de Omnilingual ASR (fuente parcial de los datos): https://arxiv.org/abs/2511.09690
