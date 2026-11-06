# cyttic/hmt-trocrscratch-stroke4-s42

## Resumen

`cyttic/hmt-trocrscratch-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado por el grupo cyttic como parte de un estudio de aumento de datos (*augmentation study*) denominado htr-metrics-transfer. El modelo parte de la arquitectura TrOCR y se ha entrenado desde cero (*scratch*) sobre un conjunto de datos de escritura manuscrita en hebreo, aplicando una aumentación concreta etiquetada como `stroke4` y con semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano mediante un cabezal CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de imagen y texto sin necesidad de segmentación previa a nivel de carácter. Con 22,4 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación y a experimentación controlada más que a despliegue comercial a gran escala.

Su relevancia es acotada pero clara: forma parte de una serie de experimentos que comparan el efecto de distintas estrategias de aumentación sobre las métricas de HTR, y publica resultados concretos (CER 0,3521 y WER 0,9529 en el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje). Es, por tanto, una pieza de un estudio comparativo reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para imagen a texto) con cabezal CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres manuscritos e impresos, en el que el encoder procesa la imagen y el decoder genera la secuencia de texto. En esta variante el modelo se ha entrenado desde cero (`trocrscratch`), es decir, sin inicializar los pesos desde un checkpoint preentrenado, y emplea decodificación CTC, lo que condiciona el diseño del cabezal de salida y el proceso de alineación.

Los datos de entrenamiento provienen de `cyttic/hhd-optionb-split`, concretamente del split de entrenamiento menos los escritores reservados para desarrollo. La aumentación aplicada es `stroke4`, una de las variantes del estudio de aumentación, y la semilla utilizada es 42, lo que permite reproducir el experimento. La evaluación se realiza sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo un CER de 0,3521 y un WER de 0,9529. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO, que en un modelo HTR no resultan habituales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción secuencia a secuencia mediante decodificación CTC.
- Entrenamiento desde cero, lo que lo hace útil como línea base en estudios de aumentación.
- Evaluación con decodificación greedy sin modelo de lenguaje, lo que refleja el rendimiento puro del acústico-visual sin postprocesado lingüístico.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del hebreo.
- No se ha documentado capacidad de visión general (descripción de imágenes, VQA) ni de audio.

## Casos de uso

- Investigación en aumentación de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumentación `stroke4`) frente a otras variantes del estudio htr-metrics-transfer, permitiendo aislar el efecto de la aumentación sobre CER y WER.
- Digitalización de archivos manuscritos en hebreo: puede emplearse para transcribir colecciones documentales escaneadas, aunque con las reservas de precisión que indican sus métricas.
- Generación de líneas base en proyectos de HTR: al estar entrenado desde cero, es útil para medir la ganancia de modelos preentrenados o de arquitecturas más grandes sobre el mismo corpus.
- Experimentación académica con decodificación CTC: permite estudiar el impacto de añadir un modelo de lenguaje externo sobre el WER, dado que la evaluación publicada es sin LM.
- Prototipado de pipelines de OCR manuscrito: su tamaño reducido (22,4 M de parámetros, 0,1 GB) facilita la integración en entornos de pruebas y la iteración rápida.
- Reproducción de resultados: al documentarse semilla, split y aumentación, sirve para verificar la transferibilidad de métricas entre experimentos del mismo grupo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,3521 | HHD Option-B test, greedy, sin LM |
| WER | 0,9529 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 22,4 M de parámetros y un repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: no disponible en la información proporcionada; al usar safetensors, es compatible con frameworks de inferencia estándar de PyTorch, pero no se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el modelo se sitúa en la categoría de HTR especializado en hebreo con arquitectura TrOCR y cabezal CTC, pero no se han publicado métricas de alternativas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratch-stroke4-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: un CER de 0,3521 y un WER de 0,9529 indican una tasa de error elevada para producción, especialmente en WER.
- Especialización estrecha: solo hebreo y solo texto manuscrito; no es un modelo de propósito general.
- Entrenado desde cero sobre un corpus acotado, por lo que probablemente generaliza mal fuera de la distribución de HHD Option-B.
- Evaluación sin modelo de lenguaje: el rendimiento en uso real podría variar si se añade postprocesado lingüístico, pero no se documenta.
- Riesgo de alucinación y de transcripciones incorrectas en textos con caligrafía atípica o ruido.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción.
- Sin datos sobre sesgos demográficos o de escritura; el conjunto de escritores del split condiciona el comportamiento.
- No se documentan limitaciones de contexto ni de idioma más allá de las indicadas.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-stroke4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
