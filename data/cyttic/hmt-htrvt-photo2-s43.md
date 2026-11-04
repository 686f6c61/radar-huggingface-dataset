# cyttic/hmt-htrvt-photo2-s43

## Resumen

cyttic/hmt-htrvt-photo2-s43 es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura de tipo transformer y decodificación CTC. Lo desarrolla el grupo cyttic y forma parte de un estudio de aumento de datos (*augmentation study*) denominado htr-metrics-transfer, en el que se evalúa el impacto de distintas estrategias de aumentación de imagen sobre el rendimiento del reconocimiento. En concreto, esta variante corresponde al modelo base `htrvt` con la aumentación `photo2` y la semilla 43.

El modelo está especializado en hebreo (`he`) y trabaja a nivel de carácter y palabra sobre imágenes de texto manuscrito. Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para investigación en HTR más que para uso generalista. Su relevancia radica en que documenta de forma reproducible (semilla fija, dataset concreto y métricas publicadas) el efecto de una técnica de aumentación concreta sobre el error de reconocimiento, lo que facilita la comparación entre variantes del mismo estudio.

La información pública disponible es limitada: la model card es breve y no detalla la arquitectura interna, el número de tokens de entrenamiento ni los hiperparámetros. Los datos de rendimiento se limitan a CER y WER sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificación CTC (según tags `htr`, `ctc`); detalles internos no disponibles |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia `htrvt` y emplea decodificación CTC, un esquema habitual en reconocimiento de texto manuscrito que permite alinear secuencias de caracteres con la salida del modelo sin necesidad de segmentación previa. Los tags del repositorio confirman la naturaleza HTR y CTC, pero la model card no especifica el número de capas, la dimensión oculta, el mecanismo de atención ni el extractor visual empleado. Tampoco se indica el número de tokens de entrenamiento ni si hubo etapas de ajuste fino con RLHF o DPO, algo poco habitual en tareas HTR.

El entrenamiento se realizó sobre el split de train de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*), lo que sugiere una separación por escritor para evitar fuga de información entre train y evaluación. La innovación metodológica del trabajo no está en la arquitectura, sino en el estudio controlado de aumentación: esta variante aplica la aumentación `photo2` con semilla 43, y los resultados se comparan contra otras variantes del mismo estudio. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento del modelo acústico-visual puro.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC a nivel de carácter y palabra, con métricas CER y WER publicadas.
- Entrenamiento con separación por escritor, orientado a generalización entre escritores.
- Estudio reproducible de aumentación de datos (`photo2`, semilla 43).
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo más allá del hebreo.
- No se documenta modo de razonamiento (*thinking*), audio ni otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos, aprovechando su entrenamiento específico en HTR hebreo y su licencia MIT para integrarse en pipelines de digitalización.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación reproducible (semilla 43, aumentación `photo2`) frente a otras variantes del estudio htr-metrics-transfer, permitiendo medir el efecto de la aumentación sobre CER y WER.
- Evaluación de robustez entre escritores: al haberse entrenado excluyendo los escritores de dev, es adecuado para experimentos de generalización a escritores no vistos.
- Prototipado de OCR manuscrito en entornos con recursos limitados: con ~13,8 M de parámetros y 0,1 GB de pesos, puede desplegarse en CPU o GPU de gama baja para pruebas de concepto.
- Benchmarking de decodificación CTC: útil para comparar decodificación greedy frente a decodificación con modelo de lenguaje, ya que las métricas publicadas corresponden al caso sin LM.
- Integración en herramientas de transcripción asistida: puede servir como componente base en aplicaciones de corrección humana de transcripciones hebreas, donde el usuario revisa la salida del modelo.

## Benchmarks y rendimiento

| Conjunto de evaluación | Decodificación | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,0616 | 0,2771 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8G u otros) en la información disponible. Los datos anteriores provienen de la model card y de `results.json`, que no se ha podido consultar directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 13,8 M de parámetros en fp32 los pesos ocupan aproximadamente 55 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3060 o superiores.
- Cabe en GPU consumer: sí, con margen amplio; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan; al usar safetensors y CTC, requeriría un runtime compatible con la arquitectura `htrvt` (no se confirma soporte en vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo2-s43 | 13,8 M | no disponible | 0,0616 | MIT | HuggingFace |
| Otras variantes del estudio htr-metrics-transfer | no disponible | no disponible | no disponible en esta ficha | MIT (presumible) | HuggingFace (cyttic) |
| Modelos HTR genéricos (p. ej. TrOCR, Kraken) | variable | no aplica | no comparable directamente | variable | HuggingFace / repos |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa con alternativas como TrOCR o Kraken no puede establecerse con rigor.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no es un modelo de propósito general.
- Las métricas publicadas (CER 0,0616, WER 0,2771) corresponden a un único conjunto de test y a decodificación greedy sin LM; el rendimiento en otros dominios o escritores puede degradarse.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset concreto (`hhd-optionb-split`) puede heredar sesgos de estilo, caligrafía o época de los documentos de origen.
- Riesgo de alucinación: en HTR, el modelo puede producir caracteres o palabras plausibles pero incorrectos, especialmente con caligrafías atípicas o imágenes de baja calidad.
- No se especifican limitaciones de longitud de contexto ni de resolución de imagen.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de producción.
- La model card es muy escueta y no detalla hiperparámetros, datos de entrenamiento ni procedimiento de evaluación, lo que dificulta la reproducibilidad completa.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-photo2-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no enlazado directamente)
