# cyttic/hmt-htrvt-elastic2-s43

## Resumen

El modelo `cyttic/hmt-htrvt-elastic2-s43` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo de 13.821.574 parámetros entrenado con una arquitectura basada en CTC (*Connectionist Temporal Classification*), tal como indican sus etiquetas, y publicado en formato safetensors con licencia MIT.

El modelo forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa el efecto de distintas estrategias de aumento sobre el rendimiento en HTR. En concreto, esta variante corresponde al modelo base `htrvt` con la estrategia de aumento `elastic2` y la semilla 43. El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split` (parte de entrenamiento menos los escritores de desarrollo) y la evaluación sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un LLM, sino un checkpoint de investigación para reconocimiento de escritura manuscrita en hebreo (`he`). Los resultados reportados por el autor son un CER de 0,0695 y un WER de 0,3094 sobre el test indicado. El repositorio es muy pequeño (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como HTR con CTC; arquitectura concreta no especificada) |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas `htr` y `ctc`, que sitúan el modelo en la familia de sistemas de reconocimiento de texto manuscrito entrenados con pérdida CTC, habitualmente sobre representaciones de imagen de línea de texto (CNN + capas recurrentes o transformer). No se especifica el número de capas, dimensión oculta, mecanismo de atención ni el preprocesado de imagen empleado.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y aplicando la estrategia de aumento `elastic2`. La semilla utilizada fue 43. La evaluación se llevó a cabo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento acústico-visual del modelo del aportado por un LM. No se indica el número de tokens, el volumen del dataset ni si hubo ajuste fino adicional.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea de texto.
- Decodificación CTC greedy sin modelo de lenguaje (configuración evaluada por el autor).
- Salida a nivel de carácter y de palabra, con métricas CER y WER reportadas.
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión general, audio ni *tool calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: limitada al hebreo según la etiqueta de idioma.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de texto escaneadas procedentes de colecciones históricas o administrativas, siempre que el dominio y la caligrafía se aproximen a los del corpus HHD.
- Transcripción asistida de documentos personales: útil como primer paso automático en flujos donde un revisor humano corrige la salida CTC, reduciendo el esfuerzo manual gracias a un CER reportado de 0,0695 en el conjunto de evaluación.
- Investigación en aumento de datos para HTR: el checkpoint sirve como referencia reproducible (semilla 43, aumento `elastic2`) para comparar el impacto de distintas estrategias de *augmentation* sobre CER y WER.
- Evaluación comparativa de arquitecturas CTC: al ser un modelo pequeño (13,8 M de parámetros) y con licencia MIT, puede integrarse como *baseline* en experimentos académicos de reconocimiento de escritura.
- Procesamiento por lotes de formularios manuscritos en hebreo: con decodificación greedy y sin LM, el coste computacional por línea es bajo, lo que facilita el despliegue en *pipelines* de digitalización masiva.
- Prototipado de sistemas de OCR/HTR en entornos con recursos limitados: el tamaño reducido del repositorio (0,1 GB) permite cargar el modelo en máquinas modestas para pruebas de concepto.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto | Configuración |
|---|---|---|---|
| CER | 0,0695 | HHD Option-B test | Greedy, sin LM |
| WER | 0,3094 | HHD Option-B test | Greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 M de parámetros (aproximadamente 55 MB en fp32 y 28 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se requiere hardware de centro de datos.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 y similares, así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con CTC, requeriría un *runtime* de inferencia propio (por ejemplo, PyTorch con los pesos safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos HTR comparables ni datos que permitan establecer una comparación rigurosa en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo experimental de investigación: forma parte de un estudio de aumento de datos y no está orientado a producción sin validación adicional.
- Idiomas: únicamente hebreo (`he`); no se ha evaluado su comportamiento en otros alfabetos o idiomas.
- Dominio restringido: entrenado y evaluado sobre el corpus HHD Option-B; el rendimiento puede degradarse con caligrafías, soportes o resoluciones distintas.
- Sin modelo de lenguaje: la decodificación greedy sin LM puede producir errores ortográficos o léxicos que un LM corregiría; el WER reportado (0,3094) es notablemente superior al CER.
- Riesgo de alucinación: en HTR, el equivalente son transcripciones incorrectas o caracteres espurios; no hay evaluación de calibración ni de tasas de error por escritor.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el estudio original.
- Sin datos de sesgo: no se documentan análisis de sesgo por escritor, género, época o estilo caligráfico.
- Repositorio sin actividad: cero descargas y cero *likes* en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-elastic2-s43
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` dentro del repositorio del modelo (no se dispone de URL directa en la información proporcionada)
- Paper, blog o repositorio del estudio `htr-metrics-transfer`: no disponible
