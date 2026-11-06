# cyttic/hmt-trocrscratchreg-stroke4-s42

## Resumen
El modelo `cyttic/hmt-trocrscratchreg-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic. Forma parte de un estudio de aumento de datos (augmentation study) denominado `htr-metrics-transfer`, en el que se evalua el impacto de distintas estrategias de augmentacion sobre el rendimiento de reconocimiento. En concreto, esta variante corresponde al modelo base `trocrscratchreg` con la augmentacion `stroke4` y la semilla 42.

El modelo esta especializado en hebreo (`he`) y emplea una arquitectura basada en TrOCR con cabecera CTC, segun indican las etiquetas de la model card. Cuenta con 22.421.004 parametros y un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en hardware modesto.

Su relevancia es acotada: se trata de un artefacto de investigacion orientado a medir la transferencia de metricas entre configuraciones de entrenamiento, no un modelo de proposito general. Los resultados publicados en la model card (CER 0,4669 y WER 1,0605 sobre el conjunto de test HHD Option-B) reflejan un rendimiento bajo en terminos absolutos, coherente con un escenario experimental de HTR sobre escritura manuscrita hebrea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (segun tags `htr`, `ctc`; no se detalla la configuracion exacta) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura se etiqueta como TrOCR con decodificacion CTC, orientada a reconocimiento de texto manuscrito linea a linea. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion exacta del encoder visual. El modelo se entrena desde cero (`scratch`) segun el nombre `trocrscratchreg`, lo que sugiere que no parte de pesos preentrenados de TrOCR.

El entrenamiento se realizo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo. La augmentacion aplicada es `stroke4` y la semilla de inicializacion es 42. La evaluacion se realizo con decodificacion greedy y sin modelo de lenguaje externo, sobre el conjunto de test HHD Option-B. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en una tarea de HTR).

## Capacidades
- Reconocimiento de texto manuscrito (HTR) en hebreo, a nivel de linea o segmento de imagen.
- Decodificacion CTC greedy sin modelo de lenguaje auxiliar.
- Salida de transcripcion de texto a partir de imagenes de escritura manuscrita.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al hebreo.
- No se documentan modos especiales (thinking, vision general, audio).

## Casos de uso
- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de manuscritos historicos o administrativos, aunque con una tasa de error elevada (CER 0,4669) que exige revision humana posterior.
- Investigacion en aumento de datos para HTR: sirve como punto de comparacion dentro del estudio `htr-metrics-transfer` para medir el efecto de la augmentacion `stroke4` frente a otras variantes.
- Reproducibilidad de experimentos: al fijar la semilla 42 y documentar el split de entrenamiento, permite replicar resultados y analizar la transferencia de metricas entre configuraciones.
- Baseline para modelos HTR en hebreo: su tamano reducido (22,4 M de parametros) lo hace util como referencia minima contra la que comparar modelos mas grandes o con mejor augmentacion.
- Prototipado rapido en entornos con recursos limitados: el peso de 0,1 GB permite cargarlo en CPU o GPU de gama baja para pruebas de concepto.
- Extraccion de texto en pipelines de preprocesado: puede integrarse como primer paso de un pipeline que combine la salida CTC con un modelo de lenguaje para corregir errores en hebreo.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre el conjunto de test HHD Option-B, decodificacion greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,4669 |
| WER | 1,0605 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni tablas de comparacion dentro del estudio.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en precision completa (22,4 M de parametros, ~90 MB en fp32; ~45 MB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos integrados con suficiente memoria.
- Opciones de despliegue: no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TrOCR/CTC, lo habitual seria cargarlo con `transformers` y `safetensors`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-stroke4-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | no disponible | Hugging Face |
| cyttic/hmt-htrvt-stroke4-s42 | 13,8 M | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- Rendimiento bajo en terminos absolutos: CER de 0,4669 y WER de 1,0605 indican que aproximadamente la mitad de los caracteres se transcriben de forma incorrecta en el conjunto de evaluacion.
- Especifico de hebreo: no se ha entrenado ni evaluado en otros idiomas.
- Entrenado desde cero y sobre un unico split (`hhd-optionb-split`), lo que limita su generalizacion a otros dominios o estilos de escritura.
- Sin modelo de lenguaje en decodificacion, los errores ortograficos y de coherencia no se corrigen.
- Riesgo de sesgo hacia los escritores y estilos presentes en el conjunto de entrenamiento; el rendimiento puede degradarse con escritores no vistos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad del modelo en produccion.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que puede limitar su despliegue en algunos runtimes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-stroke4-s42
- Modelo relacionado (trocrctc): https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Modelo relacionado (htrvt): https://huggingface.co/cyttic/hmt-htrvt-stroke4-s42
