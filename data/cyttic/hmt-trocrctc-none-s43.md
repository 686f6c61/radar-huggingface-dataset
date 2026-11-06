# cyttic/hmt-trocrctc-none-s43

## Resumen

`cyttic/hmt-trocrctc-none-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CyTIC, entrenado sobre un corpus en hebreo (`he`). Forma parte de un estudio sistemático de aumentación de datos (`htr-metrics-transfer`) en el que se comparan distintas configuraciones de un mismo *backbone* con variaciones en la técnica de aumentación y en la semilla de entrenamiento; este checkpoint concreto corresponde a la variante sin aumentación (`none`) y semilla 43.

El modelo sigue una arquitectura TrOCR con cabeza CTC (`trocrctc`), es decir, un encoder de visión tipo transformer combinado con un decodificador CTC en lugar del decodificador autorregresivo original de TrOCR. Con 87,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, está pensado para decodificación codiciosa (*greedy*) sin modelo de lenguaje externo, lo que simplifica el despliegue a costa de una tasa de error mayor.

Su relevancia es acotada pero clara: sirve como referencia reproducible dentro de un *benchmark* interno de HTR en hebreo y como punto de partida para quien necesite un modelo ligero de transcripción de manuscritos con licencia MIT. No es un modelo de propósito general ni un LLM: no genera texto libre, solo transcribe imágenes de líneas o regiones de texto manuscrito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (`trocrctc`), encoder de visión transformer y decodificación CTC |
| Parámetros totales | 87.279.756 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura TrOCR en su variante con CTC: un encoder de visión basado en transformer procesa la imagen del texto manuscrito y una cabeza CTC produce la secuencia de caracteres sin decodificador autorregresivo. Esta elección elimina la necesidad de un modelo de lenguaje durante la inferencia y permite decodificación codiciosa directa, lo que reduce la latencia y la complejidad del *pipeline*.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo (*dev writers*). La variante `none` indica ausencia de aumentación de datos; la semilla es 43. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni la existencia de fases de ajuste fino adicionales (RLHF/DPO no aplica en una tarea de transcripción). Los detalles completos se remiten a un `results.json` no incluido en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Transcripción a nivel de carácter y de palabra mediante decodificación CTC codiciosa.
- Salida de secuencia de caracteres sin modelo de lenguaje externo.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de la lectura de imágenes de texto.
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe imágenes de líneas de texto y puede integrarse en un *pipeline* de digitalización masiva de documentos históricos, con revisión humana posterior dada la tasa de error reportada.
- Extracción de texto en aplicaciones de accesibilidad: conversión de notas manuscritas en hebreo a texto editable para usuarios con dificultades de lectura o para indexación.
- Preprocesado para motores de búsqueda documental: generar transcripciones que alimenten índices de búsqueda sobre colecciones manuscritas, aceptando la necesidad de corrección ortográfica posterior.
- Línea base reproducible en investigación HTR: al formar parte de un estudio de aumentación con semilla fija, sirve como referencia para comparar el efecto de técnicas de aumentación sobre métricas CER/WER.
- Prototipado rápido con licencia permisiva: su licencia MIT y su tamaño reducido (0,3 GB) permiten incorporarlo en pruebas de concepto sin restricciones de uso comercial.
- Transcripción asistida en entornos con recursos limitados: al no requerir modelo de lenguaje externo ni decodificación autorregresiva, el coste computacional por página es bajo comparado con variantes con LM.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre HHD Option-B test, decodificación codiciosa y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER | 0,1265 |
| WER | 0,5055 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) por no ser aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 87,3 M de parámetros en precisión completa (fp32) el peso ocupa aproximadamente 0,35 GB, por lo que en fp16 o bf16 ronda los 0,18 GB, más el coste de activaciones del encoder de visión.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo safetensors de tipo TrOCR/CTC, puede servirse con PyTorch + Transformers o con un *runtime* ONNX; no se confirma soporte nativo en vLLM, llama.cpp u Ollama (no disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-none-s43 | 87,3 M | no disponible | HTR hebreo (CTC) | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | HTR hebreo (CTC, aumentación stroke4) | no disponible | Hugging Face |
| cyttic/hmt-htrvt-none-s43 | 13,8 M | no disponible | HTR (variante htrvt) | no disponible | Hugging Face |

Las alternativas identificadas pertenecen al mismo estudio del autor y comparten familia arquitectónica; no se dispone de comparativas con modelos HTR externos en la información proporcionada.

## Limitaciones y advertencias

- Tasa de error de palabra (WER) elevada (0,5055), lo que implica que aproximadamente la mitad de las palabras transcritas contienen errores; no es apto para producción sin revisión humana.
- Entrenado exclusivamente en hebreo; no generaliza a otros alfabetos ni idiomas.
- Al carecer de modelo de lenguaje en la decodificación, la corrección contextual de errores es nula.
- Riesgo de sesgo hacia los escritores y el dominio del corpus `hhd-optionb-split`; el rendimiento puede degradarse en manuscritos con estilos, soportes o caligrafías distintas.
- No se dispone de información sobre sesgos demográficos o de otro tipo en los datos de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del corpus de entrenamiento subyacente, no detalladas.
- Fecha de creación del repositorio indicada como 2026-11-06, lo que sugiere un posible error en los metadatos; conviene contrastar la versión antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-none-s43
- Variante stroke4 (semilla 42): https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Variante htrvt (semilla 43): https://huggingface.co/cyttic/hmt-htrvt-none-s43
- Dataset de entrenamiento: `cyttic/hhd-optionb-split` (referenciado en la model card, sin URL directa en la información disponible)
