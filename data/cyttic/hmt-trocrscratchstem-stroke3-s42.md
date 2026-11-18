# cyttic/hmt-trocrscratchstem-stroke3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-stroke3-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero ("scratch") sobre un *stem* de arquitectura TrOCR, con una estrategia de aumento de datos basada en trazos ("stroke3") y semilla 42. Forma parte de un estudio más amplio denominado *htr-metrics-transfer*, orientado a medir cómo distintas técnicas de aumento de datos afectan a las métricas de reconocimiento en escritura manuscrita.

El modelo emplea una arquitectura encoder-decoder de tipo transformer con decodificación CTC (Connectionist Temporal Classification), tal como indican sus etiquetas. Está especializado en hebreo (`he`) y se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Con 24.928.588 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para investigación en HTR más que para despliegue generalista. Su relevancia radica en que documenta de forma reproducible (semilla, aumento, split) el impacto de una técnica concreta de aumento de datos sobre el error de reconocimiento, con métricas explícitas: CER 0,0772 y WER 0,3489.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo TrOCR con decodificacion CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TrOCR, un transformer encoder-decoder originalmente concebido para reconocimiento de texto impreso y manuscrito, adaptado aquí con decodificación CTC en lugar de generación autorregresiva. El modelo se entrenó desde cero ("scratch") sobre un *stem* TrOCR, lo que implica que no parte de pesos preentrenados de un modelo mayor, sino que se inicializa y entrena específicamente para esta tarea.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, usando la partición de train menos los escritores reservados para desarrollo. La innovación metodológica del trabajo no está en la arquitectura sino en el protocolo experimental: se aplica un aumento de datos denominado "stroke3" (variación sobre trazos) con semilla fija 42, y se evalúa sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los detalles completos del experimento se recogen en el archivo `results.json` del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo: transcripción de imágenes de escritura a texto.
- Decodificación CTC: alineamiento directo entre secuencias de imagen y texto sin necesidad de un decodificador autorregresivo.
- Evaluación con y sin modelo de lenguaje: el modelo base funciona sin LM externo (greedy decoding).
- Especialización en un dominio acotado: escritores y estilo del corpus HHD Option-B.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".
- Capacidad multilingüe limitada al hebreo según la model card.

## Casos de uso

- Investigación reproducible en HTR: el modelo sirve como punto de comparación fijo (semilla 42, aumento stroke3) para medir el efecto de otras técnicas de aumento o de arquitecturas alternativas sobre CER y WER.
- Digitalización de manuscritos en hebreo: transcripción automática de documentos históricos o administrativos escritos a mano, dentro del dominio de escritores similar al corpus de entrenamiento.
- Evaluación de pipelines de preprocesado: al estar entrenado con un aumento específico de trazos, permite aislar el impacto del preprocesado de imagen en la tasa de error.
- Baseline para ajuste fino: sus 24,9 M de parámetros lo hacen ligero para experimentar con fine-tuning sobre subconjuntos pequeños de escritores nuevos.
- Análisis de transferencia de métricas: forma parte del estudio *htr-metrics-transfer*, por lo que se usa para estudiar cómo se correlacionan CER y WER entre variantes.
- Despliegue en entornos con recursos limitados: su tamaño reducido (0,1 GB) permite inferencia en CPU o GPU modesta para pruebas de concepto de HTR en hebreo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0772 | Test HHD Option-B, greedy decoding, sin LM |
| WER | 0,3489 | Test HHD Option-B, greedy decoding, sin LM |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 24,9 M de parámetros (aproximadamente 100 MB de pesos); en la práctica, la memoria vendrá dominada por el tamaño de las imágenes de entrada y el batch.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes, una RTX 3090/4090 o A100/H100 aportan margen, aunque no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el formato safetensors es compatible con `transformers` (si la arquitectura TrOCR está registrada) y con `safetensors` directamente; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-stroke3-s42 | 24,9 M | no disponible | HTR hebreo (CTC) | MIT | Hugging Face |
| TrOCR (Microsoft, base) | ~334 M (base) | no disponible | HTR/OCR multilingue | MIT | Hugging Face |
| Modelos HTR especificos para hebreo | no disponible | no disponible | HTR hebreo | no disponible | no disponible |

La comparación con TrOCR base es la más directa por arquitectura, aunque este modelo es sustancialmente más pequeño (24,9 M frente a ~334 M) y está especializado en un único idioma y corpus. No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente en hebreo y sobre un corpus concreto (HHD Option-B), por lo que el rendimiento fuera de ese dominio puede degradarse notablemente.
- Sin modelo de lenguaje: la decodificación greedy sin LM implica que no corrige errores léxicos ni contextuales, lo que explica un WER de 0,3489 frente a un CER de 0,0772.
- Sesgo de escritores: al excluir los escritores de desarrollo del entrenamiento, el modelo puede no generalizar a estilos de escritura no representados.
- Riesgo de alucinación en la transcripción: como todo modelo generativo/CTC, puede producir caracteres plausibles pero incorrectos en zonas ambiguas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Documentación limitada: no se detallan hiperparámetros, composición del dataset ni proceso de aumento "stroke3" más allá de la referencia a `results.json`.
- Sin soporte documentado de cuantización ni de pipelines de despliegue estándar para HTR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-stroke3-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: archivo `results.json` en el repositorio del modelo
- TrOCR (arquitectura base): https://huggingface.co/docs/transformers/model_doc/trocr
