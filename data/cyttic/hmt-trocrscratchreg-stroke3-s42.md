# cyttic/hmt-trocrscratchreg-stroke3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-stroke3-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante del modelo TrOCR entrenada desde cero (*scratch*) con una estrategia de regularización concreta, dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. La variante corresponde a la augmentación `stroke3` con semilla 42, lo que lo convierte en una réplica experimental reproducible más que en un modelo de propósito general.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano mediante un esquema CTC (*Connectionist Temporal Classification*), según indican las etiquetas del repositorio. Cuenta con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la gama ligera y permite su despliegue en hardware modesto. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de dev, y evaluado sobre el test HHD Option-B.

Su relevancia es acotada: no es un modelo listo para producción, sino un artefacto de investigación que documenta el efecto de una técnica de aumento concreta sobre el rendimiento HTR. El rendimiento reportado es bajo (CER 0,4929 y WER 1,0734 con decodificación greedy y sin modelo de lenguaje), lo que debe interpretarse en el contexto del estudio comparativo del que forma parte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (inferida de tags `htr`, `ctc` y nombre `trocrscratchreg`) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia TrOCR (*Transformer-based Optical Character Recognition*), un esquema encoder-decoder para reconocimiento de texto en imagen. En esta variante la salida se gestiona mediante CTC, tal como reflejan las etiquetas `htr` y `ctc` del repositorio. El sufijo `scratchreg` indica que el modelo se entrenó desde cero con una estrategia de regularización, en lugar de partir de un checkpoint preentrenado de TrOCR. No se dispone de detalles adicionales sobre el número de capas, dimensiones ocultas ni mecanismo de atención en la información proporcionada.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo para evitar fuga de información entre splits. La augmentación aplicada es `stroke3` con semilla 42, dentro del estudio `htr-metrics-transfer`. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en imágenes, transcripción a texto plano.
- Decodificación CTC con alineamiento implícito, sin necesidad de segmentación previa por carácter.
- Entrenamiento específico sobre escritura manuscrita en hebreo.
- Capacidad multilingüe: limitada al hebreo según el campo `language` del repositorio.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agente.
- No incorpora modo *thinking*, visión general, audio ni otras modalidades.
- No se documenta soporte de *prompting* textual: la entrada es una imagen y la salida una secuencia de caracteres.

## Casos de uso

- Investigación comparativa de aumentos de datos: el modelo sirve como punto de comparación reproducible (semilla 42, augmentación `stroke3`) frente a otras variantes del estudio `htr-metrics-transfer`, permitiendo aislar el efecto de la técnica de aumento sobre el CER y el WER.
- Digitalización de archivos manuscritos en hebreo: puede emplearse como línea base para transcribir documentos históricos o administrativos manuscritos, siempre que se acepte un CER cercano al 49 % y se combine con revisión humana.
- Generación de transcripciones preliminares para etiquetado asistido: las salidas del modelo pueden servir como borradores que un anotador humano corrige, acelerando la creación de corpus HTR en hebreo.
- Evaluación de pipelines HTR: útil para validar infraestructura de inferencia CTC (preprocesado de imagen, decodificación greedy, cálculo de CER/WER) antes de sustituir el modelo por uno de mayor calidad.
- Docencia y reproducción de experimentos: su tamaño reducido (22,4 M de parámetros, 0,1 GB) permite ejecutarlo en entornos educativos y reproducir el estudio de augmentación con recursos mínimos.
- Análisis de robustez frente a estilos de escritura: al estar entrenado excluyendo escritores de dev, permite estudiar la generalización a escritores no vistos en el conjunto HHD Option-B.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del propio autor sobre el test HHD Option-B, con decodificación greedy y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,4929 |
| WER (Word Error Rate) | 1,0734 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 22,4 M de parámetros (aproximadamente 90 MB de pesos); en FP16, en torno a 45 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (carga directa de safetensors), `vLLM` (soporte CTC no garantizado, verificar), `llama.cpp`/`Ollama` no aplicables por tratarse de un modelo visión-texto con CTC; `TGI` no orientado a HTR.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchreg-stroke3-s42` | 22,4 M | no disponible | 0,4929 | MIT | Hugging Face |
| `cyttic/hmt-trocrctc-stroke3-s42` | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |
| `cyttic/hmt-htrvt-stroke3-s42` | 13,8 M | no disponible | no disponible | no disponible | Hugging Face |

Los tres modelos pertenecen al mismo estudio de augmentación del grupo cyttic y comparten la variante `stroke3` con semilla 42, lo que los hace directamente comparables en el marco del experimento. No se dispone de resultados de benchmarks de los dos modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea: CER de 0,4929 y WER de 1,0734 implican que aproximadamente la mitad de los caracteres se transcriben incorrectamente; no es apto para producción sin revisión humana.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset concreto (`hhd-optionb-split`) puede presentar sesgo hacia los estilos de escritura y escritores representados en el mismo.
- Riesgo de alucinación: en HTR se manifiesta como sustituciones, omisiones e inserciones de caracteres; la decodificación sin modelo de lenguaje agrava este comportamiento.
- Limitación de idioma: entrenado exclusivamente para hebreo; no se espera un funcionamiento correcto en otros alfabetos o idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación siempre que se conserve el aviso de copyright; aun así, la calidad del modelo desaconseja su uso comercial directo.
- Caveat para producción: el modelo forma parte de un estudio de investigación y no se ha validado fuera del conjunto HHD Option-B; cualquier despliegue requeriría una evaluación propia sobre datos del dominio objetivo.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-stroke3-s42
- Variante con CTC de mayor tamaño: https://huggingface.co/cyttic/hmt-trocrctc-stroke3-s42
- Variante HTR-VT: https://huggingface.co/cyttic/hmt-htrvt-stroke3-s42
