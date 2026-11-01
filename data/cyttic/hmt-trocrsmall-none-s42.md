# cyttic/hmt-trocrsmall-none-s42

## Resumen

`cyttic/hmt-trocrsmall-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC. Se trata de un checkpoint experimental dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena el mismo modelo base (`trocrsmall`) con distintas estrategias de aumentación y semillas. En este caso concreto, la variante corresponde a aumentación `none` (sin aumentación) y semilla 42.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito en hebreo (`he`), empleando una arquitectura de reconocimiento con cabeza CTC (Connectionist Temporal Classification) y pesos en formato safetensors. Con 22.421.004 parámetros, es un modelo compacto orientado a investigación y evaluación comparativa, no a despliegue comercial de gran escala.

Su relevancia es acotada pero clara: sirve como línea base (baseline) dentro de un estudio controlado sobre el impacto de la aumentación de datos en HTR. El autor reporta en la model card un CER de 0,2326 y un WER de 0,7603 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. El repositorio es muy reciente (creado el 1 de noviembre de 2026) y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTR con cabeza CTC (detalle del backbone no disponible) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de reconocimiento de texto manuscrito con decodificación CTC, identificado internamente como `trocrsmall`. No se detalla en la model card la arquitectura del backbone (si es una CNN, un transformer o un híbrido), ni el número de tokens de entrenamiento, ni la composición exacta del dataset más allá de la referencia al split utilizado.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, concretamente sobre la partición de train excluyendo los escritores (writers) de dev. La variante `none` implica que no se aplicó aumentación de datos, lo que la convierte en la condición de control del estudio `htr-metrics-transfer`. La semilla utilizada es 42. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en una tarea de reconocimiento supervisado carácter a carácter.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC greedy (la evaluación reportada usa este modo).
- Funcionamiento sin modelo de lenguaje externo (no LM), tal como se especifica en la evaluación.
- Entrenamiento y evaluación sobre el corpus HHD Option-B.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- El soporte multilingüe se limita al hebreo según el campo `language` de la model card.

## Casos de uso

- Línea base en estudios de aumentación de datos: este checkpoint sirve como referencia de control para medir la ganancia de técnicas de aumentación en HTR, comparando su CER y WER con las variantes aumentadas del mismo estudio.
- Investigación en reconocimiento de manuscrito hebreo: permite reproducir y auditar los resultados del estudio `htr-metrics-transfer` sobre el split HHD Option-B.
- Evaluación comparativa de decodificadores CTC: al estar entrenado sin LM, es útil para aislar el efecto del decodificador greedy frente a decodificadores con modelo de lenguaje.
- Prototipado académico de digitalización de documentos históricos en hebreo: con 22,4 M de parámetros, puede ejecutarse en entornos de laboratorio con recursos modestos para pruebas de concepto.
- Generación de transcripciones preliminares para anotación humana: dado su CER de 0,2326, puede emplearse como primer paso en un flujo de corrección manual asistida.
- Reproducibilidad de experimentos: la semilla fija (42) y la ausencia de aumentación facilitan la replicación exacta del entrenamiento en estudios posteriores.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Decodificacion | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,2326 | 0,7603 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con modelos alternativos dentro del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M de parámetros y pesos safetensors en fp32, el modelo ocupa aproximadamente 90 MB, por lo que cabría en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM sería suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o equivalente dada la magnitud de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo CTC de HTR, requeriría un pipeline específico de reconocimiento de imagen a texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints del estudio `htr-metrics-transfer` con resultados numéricos comparables, ni referencias a modelos HTR alternativos con los que contrastar parámetros, contexto o licencia.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado como producto final ni se documenta su robustez fuera del corpus HHD Option-B.
- Rendimiento limitado: un WER de 0,7603 indica que más de tres cuartas partes de las palabras se transcriben incorrectamente en la evaluación reportada, lo que restringe su uso directo en producción sin corrección humana.
- Sin modelo de lenguaje: la decodificación greedy sin LM puede producir salidas menos fluidas y más propensas a errores sistemáticos.
- Idioma único: solo se declara soporte para hebreo, sin evidencia de generalización a otras lenguas.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre un split concreto de escritores, puede presentar peor rendimiento en escritores no representados.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras plausibles no presentes en la imagen, especialmente con escritura degradada.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar los términos del dataset subyacente (`cyttic/hhd-optionb-split`) antes de un uso comercial.
- Fecha de creación futura en los metadatos (2026-11-01): conviene tratar el repositorio con cautela y verificar su estado real antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-none-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Perfil del autor: https://huggingface.co/cyttic
