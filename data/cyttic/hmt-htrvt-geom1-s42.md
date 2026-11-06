# cyttic/hmt-htrvt-geom1-s42

## Resumen

`cyttic/hmt-htrvt-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) entrenado con una cabeza CTC sobre un backbone denominado `htrvt`. Lo publica la organización `cyttic` como parte de un estudio de aumento de datos llamado `htr-metrics-transfer` (oleada 1), en el que se cruzan variantes de arquitectura con estrategias de augmentación y semillas. Este checkpoint concreto corresponde a la variante `htrvt` con augmentación `geom1` y semilla 42.

El modelo no es un modelo generativo de lenguaje: es un sistema de transcripción de imágenes de texto manuscrito a secuencias de caracteres, especializado en hebreo (`he`). Con 13.821.574 parámetros y un repositorio de 0,1 GB en formato `safetensors`, es un modelo compacto pensado para investigación comparativa de técnicas de aumento de datos y su transferencia entre métricas, más que para despliegue comercial directo.

Su relevancia es acotada pero concreta: proporciona un punto de referencia reproducible (semilla fija, split de entrenamiento documentado, decodificación greedy sin modelo de lenguaje) para estudiar cómo afecta la augmentación geométrica al CER y al WER en HTR de hebreo. Los resultados reportados en la model card son CER 0,0593 y WER 0,2669 sobre el conjunto de test HHD Option-B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con cabeza CTC (backbone `htrvt`); detalles internos no disponibles |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como `htrvt` con una cabeza de decodificación CTC, lo que sitúa la arquitectura en la familia de reconocedores de secuencias imagen-a-texto: un codificador visual que produce una secuencia de estados ocultos y una capa lineal que emite logits por carácter, alineados mediante Connectionist Temporal Classification. El número exacto de capas, dimensión oculta, mecanismo de atención y resolución de entrada no se especifica en la información disponible.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo ("train minus the dev writers"), lo que indica una separación por escritor para evitar fuga de información entre particiones. La augmentación aplicada es `geom1` (transformaciones geométricas), y la semilla es 42. La evaluación reportada usa decodificación greedy sin modelo de lenguaje sobre el test HHD Option-B, con CER 0,0593 y WER 0,2669. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcripción de imágenes de líneas o regiones de texto a secuencias de caracteres.
- Decodificación CTC greedy, sin modelo de lenguaje externo en la evaluación reportada.
- Salida a nivel de carácter, lo que permite calcular CER directamente y derivar WER por segmentación de palabras.
- Entrenamiento con separación por escritor, orientado a generalización a escritores no vistos.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión general, audio ni generación de texto libre.
- Capacidad multilingüe: limitada a hebreo según la etiqueta de idioma declarada.

## Casos de uso

- Investigación comparativa de augmentación en HTR: usar este checkpoint como referencia fija (semilla 42, `geom1`) para medir el efecto de otras estrategias de aumento sobre CER y WER en el mismo split.
- Digitalización de archivos manuscritos en hebreo: transcripción por líneas de documentos históricos o administrativos, con revisión humana posterior dado el WER de 0,2669.
- Reproducción de experimentos: al estar documentados el split, la semilla y la decodificación, sirve para replicar resultados y auditar la metodología del estudio `htr-metrics-transfer`.
- Generación de datos etiquetados asistida: transcripción automática de corpus manuscritos para preetiquetar y acelerar la anotación manual, filtrando por confianza a nivel de carácter.
- Evaluación de robustez a escritores no vistos: al haberse excluido los escritores de desarrollo del entrenamiento, es útil para estudiar degradación ante variabilidad de caligrafía.
- Línea base en pipelines de HTR: punto de partida ligero (13,8 M de parámetros) para comparar con modelos mayores o con etapas de rescoring con modelo de lenguaje.
- Estudio de la relación entre CER y WER: el nombre del proyecto (`htr-metrics-transfer`) sugiere análisis de cómo las mejoras en una métrica se trasladan a la otra; este checkpoint aporta un par de valores concreto para ese análisis.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Decodificacion | CER | WER |
|---|---|---|---|
| HHD Option-B test | greedy, sin LM | 0,0593 | 0,2669 |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo HTR. Tampoco se ofrecen comparaciones numéricas con otros checkpoints del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 13,8 M de parámetros (unos 55 MB de pesos); el cuello de botella será el codificador visual y el tamaño de lote de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 permite lotes grandes, mientras que una GTX 1660 o superior basta para inferencia interactiva.
- Cabe en GPU consumer: sí, con amplio margen, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un checkpoint `safetensors` con cabeza CTC, requiere cargarlo con la librería o código de entrenamiento del proyecto `cyttic`; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no son adecuadas para este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-geom1-s42 | 13,8 M | no disponible | 0,0593 | MIT | Hugging Face |
| Otros checkpoints de `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | presumiblemente en el mismo espacio de `cyttic`, sin datos confirmados |
| Modelos HTR genericos (p. ej. TrOCR, Kraken) | no disponible | no disponible | no disponible | no disponible | no comparable directamente por idioma y dataset |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas de la misma categoría; las cifras de CER solo son comparables dentro del mismo test HHD Option-B y bajo la misma decodificación greedy sin LM.

## Limitaciones y advertencias

- El WER de 0,2669 es alto para producción sin revisión humana; el CER de 0,0593 implica que aproximadamente uno de cada diecisiete caracteres se transcribe mal.
- Especializado exclusivamente en hebreo; no se ha validado su comportamiento en otros alfabetos o idiomas.
- Entrenado y evaluado sobre un único dataset (`hhd-optionb-split`); la generalización a otros dominios, caligrafías o calidades de escaneo es desconocida.
- La evaluación usa decodificación greedy sin modelo de lenguaje; añadir un LM podría alterar sustancialmente las métricas y no se reporta ese escenario.
- Riesgo de sesgo hacia los estilos de escritura presentes en el corpus de entrenamiento; los escritores de desarrollo se excluyeron, pero la diversidad del resto no está documentada.
- No se documentan sesgos demográficos, culturales ni de otro tipo en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del dataset de origen (`cyttic/hhd-optionb-split`), que no se detallan aquí.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.
- No se dispone de información sobre cuantizaciones, por lo que el despliegue requiere el stack original del autor.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom1-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados (`results.json`): referenciado en la model card dentro del repositorio del modelo; URL directa no disponible en la información proporcionada.
