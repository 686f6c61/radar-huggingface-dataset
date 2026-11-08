# cyttic/hmt-trocrscratchline-photo2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchline-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo derivado de TrOCR con inicialización desde cero (*scratch*), entrenado mediante CTC y publicado como parte de un estudio de aumentación de datos denominado internamente `htr-metrics-transfer`. El identificador indica la configuración exacta: arquitectura `trocrscratchline`, aumentación `photo2` y semilla 42.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`), operando a nivel de línea y con decodificación greedy sin modelo de lenguaje externo. Con 22,4 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto orientado a experimentación académica más que a despliegue comercial a gran escala.

Su relevancia es acotada: se publica como artefacto reproducible de un estudio sobre transferencia de métricas y aumentación fotográfica, con licencia MIT, lo que facilita su inspección y reutilización en investigación sobre HTR en hebreo. No dispone de descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para OCR/HTR), entrenado desde cero |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder concebido para reconocimiento óptico de caracteres, pero en esta variante se ha entrenado desde cero (*scratch*) en lugar de partir de los pesos preentrenados originales de TrOCR. La cabeza de secuencia se entrena con Connectionist Temporal Classification (CTC), según indican los tags `htr` y `ctc` y la mención a decodificación greedy sin modelo de lenguaje en la model card.

El conjunto de entrenamiento es `cyttic/hhd-optionb-split`, restándole los escritores del split de desarrollo. La aumentación aplicada se denomina `photo2`, dentro de un estudio comparativo de aumentaciones fotográficas. Se evaluó sobre el test HHD Option-B con decodificación greedy y sin LM, obteniendo CER 0,3831 y WER 0,9622. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento de texto manuscrito a nivel de línea en hebreo.
- Transcripción con decodificación CTC greedy, sin modelo de lenguaje de rescoring.
- Salida de secuencia de caracteres a partir de una imagen de línea de texto.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-step.
- Capacidad multilingüe limitada: únicamente hebreo según la model card.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen para OCR.

## Casos de uso

- Investigación en HTR sobre hebreo: sirve como punto de comparación reproducible (semilla 42, aumentación `photo2`) dentro del estudio `htr-metrics-transfer`, permitiendo replicar el CER/WER reportado.
- Digitalización de archivos manuscritos en hebreo: transcripción de líneas segmentadas en proyectos de preservación documental, aceptando la tasa de error reportada (CER 0,38) como referencia de calidad base.
- Evaluación de técnicas de aumentación: el modelo actúa como artefacto de control para medir el impacto de la aumentación fotográfica `photo2` frente a otras variantes del mismo estudio.
- Baseline para fine-tuning: al ser un TrOCR entrenado desde cero con 22,4 M de parámetros, puede servir de inicialización ligera para dominios específicos de escritura hebrea.
- Prototipado académico de pipelines OCR: integrable en flujos de investigación con imágenes de línea y decodificación greedy, sin dependencia de LM externo.
- Estudio de transferencia de métricas: útil para analizar la relación entre CER y WER en sistemas CTC sin rescoring, dado el contraste entre ambas cifras en este modelo.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,3831 |
| HHD Option-B test (greedy, sin LM) | WER | 0,9622 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de OCR/HTR más allá del conjunto HHD Option-B.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros (aproximadamente 90 MB de pesos); no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: al ser safetensors, requiere cargarlo con la implementación correspondiente de TrOCR (por ejemplo, Hugging Face Transformers); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-photo2-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| TrOCR (Microsoft, base/large) | no disponible en la información | no disponible | MIT (según versión) | Hugging Face |
| Otros modelos HTR en hebreo | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Calidad limitada: un CER de 0,3831 y un WER de 0,9622 indican una tasa de error elevada, insuficiente para producción sin revisión humana.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un conjunto concreto de escritores, puede generalizar mal a estilos no representados.
- Riesgo de alucinación: en modelos CTC sin LM el riesgo es menor, pero pueden producirse sustituciones y omisiones sistemáticas de caracteres.
- Limitación de idioma: solo hebreo; no se ha validado en otros alfabetos.
- Limitación de contexto: no disponible; al operar a nivel de línea, no maneja documentos completos de forma directa.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveat para producción: sin descargas ni validación externa, conviene tratar el modelo como artefacto de investigación y validarlo en el dominio objetivo antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-photo2-s42
- Dataset de entrenamiento citado: `cyttic/hhd-optionb-split` (referencia en la model card; no se proporciona URL directa)
- Detalles del estudio: `results.json` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
