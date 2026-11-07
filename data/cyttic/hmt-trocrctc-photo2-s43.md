# cyttic/hmt-trocrctc-photo2-s43

## Resumen

`cyttic/hmt-trocrctc-photo2-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un checkpoint concreto dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se evalúa cómo distintas estrategias de aumento de imagen afectan a las métricas de reconocimiento. En este caso el modelo corresponde a la arquitectura `trocrctc`, la variante de aumentación `photo2` y la semilla 43.

El modelo parte de la familia TrOCR (Transformer de visión y texto para OCR) adaptada con una cabeza de clasificación CTC, lo que permite decodificación greedy sin modelo de lenguaje externo. Con 87.279.756 parámetros y un repositorio de 0,3 GB, está entrenado específicamente para hebreo (`he`) sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación reproducible para comparar variantes de aumentación y su transferencia de métricas.

La licencia MIT facilita su reutilización, pero conviene subrayar que se publica como resultado experimental, con un rendimiento modesto en test (CER 0,1247 y WER 0,5044) y sin documentación adicional más allá de la model card y el `results.json` referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (variante `trocrctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR: un codificador de visión tipo Transformer que procesa la imagen de la línea de texto y un decodificador de texto Transformer. En esta variante (`trocrctc`) la salida se gestiona mediante una cabeza CTC, lo que permite alinear secuencias sin necesidad de un decodificador autorregresivo con modelo de lenguaje, y decodificar en modo greedy. El repositorio ocupa 0,3 GB y contiene 87,28 millones de parámetros en formato safetensors.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la aumentación de imagen `photo2` y la semilla 43. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,1247 y WER 0,5044. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas de texto.
- Decodificación CTC greedy sin modelo de lenguaje externo.
- Entrenado y evaluado sobre un conjunto con separación por escritores, lo que permite medir generalización a escritores no vistos.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.
- No se documentan modos especiales (thinking, visión general, audio).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de líneas manuscritas procedentes de colecciones históricas o administrativas, siempre que se acepte un WER cercano al 50 % y se combine con revisión humana.
- Investigación en aumentación de datos para HTR: sirve como checkpoint de referencia para comparar el efecto de la aumentación `photo2` frente a otras variantes del estudio `htr-metrics-transfer`.
- Reproducibilidad de experimentos: al estar identificado por arquitectura, aumentación y semilla, permite replicar exactamente la configuración y contrastar las métricas CER/WER publicadas.
- Evaluación de transferencia de métricas entre conjuntos: útil para estudiar cómo se trasladan las métricas de un split de desarrollo a un test con escritores distintos.
- Prototipado de pipelines OCR para hebreo: puede integrarse como primer estadio de transcripción en un sistema con post-procesado lingüístico o corrección humana.
- Línea base en comparativas de modelos HTR: su tamaño moderado (87 M de parámetros) y su licencia MIT lo hacen adecuado como referencia frente a modelos mayores en estudios académicos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condiciones |
|---|---|---|
| CER | 0,1247 | HHD Option-B test, decodificación greedy, sin LM |
| WER | 0,5044 | HHD Option-B test, decodificación greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales más allá de las indicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 87,28 M de parámetros, en fp32 ocuparía aproximadamente 0,35 GB de pesos; en fp16, unos 0,17 GB. La VRAM total dependerá del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria podrían ejecutarlo.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: al no documentarse pipeline en Hugging Face, el despliegue requeriría cargar los pesos safetensors con la implementación correspondiente de TrOCR/CTC (por ejemplo, mediante `transformers` si la arquitectura es compatible). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo2-s43 | 87,28 M | no disponible | CER 0,1247 / WER 0,5044 (HHD Option-B test) | MIT | Hugging Face |
| cyttic/hmt-htrvt-photo2-s43 | 13,8 M | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos TrOCR estándar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa identificada en la búsqueda es `cyttic/hmt-htrvt-photo2-s43`, del mismo autor y con la misma aumentación y semilla, pero con arquitectura distinta (`htrvt`) y 13,8 M de parámetros. No se dispone de sus métricas para una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento limitado: un WER de 0,5044 implica que aproximadamente la mitad de las palabras se reconocen de forma incorrecta en el conjunto de test; no es adecuado para producción sin revisión humana.
- Entrenado exclusivamente en hebreo; no se garantiza su funcionamiento en otros idiomas ni en alfabetos distintos.
- Es un artefacto de investigación centrado en el estudio de aumentación; no se documentan sesgos específicos, pero puede heredar los del corpus `hhd-optionb-split`.
- Riesgo de alucinación en la decodificación CTC: aunque el modelo no genera texto libre como un LLM, puede producir secuencias incorrectas o caracteres espurios en imágenes de baja calidad.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen; se desconoce el preprocesado exacto requerido.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene citar el origen y verificar la procedencia de los datos de entrenamiento.
- Ausencia de pipeline declarado en Hugging Face: la integración requiere trabajo manual para cargar la arquitectura correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo2-s43
- Modelo relacionado del mismo autor: https://huggingface.co/cyttic/hmt-htrvt-photo2-s43
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se dispone de URL directa en la información proporcionada)
