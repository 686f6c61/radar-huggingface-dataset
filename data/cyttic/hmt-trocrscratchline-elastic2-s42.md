# cyttic/hmt-trocrscratchline-elastic2-s42

## Resumen

`cyttic/hmt-trocrscratchline-elastic2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena la misma arquitectura con distintas estrategias de aumento y semillas, y se comparan los resultados sobre un conjunto de test fijo. En este caso concreto, la variante corresponde al modelo base `trocrscratchline`, con aumento `elastic2` y semilla 42.

El modelo se ha entrenado sobre el split `cyttic/hhd-optionb-split` (conjunto de entrenamiento menos los escritores de desarrollo) y se ha evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados publicados son CER 0,2587 y WER 0,8260, lo que sitúa su rendimiento muy por debajo del de otras variantes del mismo estudio (por ejemplo, `hmt-htrvt-elastic2-s42` alcanza CER 0,0667 y WER 0,2967). Es, por tanto, una pieza de un experimento comparativo más que un modelo listo para producción.

Con 22.421.004 parámetros y un repositorio de 0,1 GB en formato safetensors, se trata de un modelo compacto, orientado a la investigación en HTR sobre hebreo (`he`), con licencia MIT. Su relevancia es acotada: sirve como referencia reproducible dentro del estudio de aumento de datos del autor, no como un sistema HTR de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `ctc`; nombre sugiere base TrOCR adaptada) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas `htr` y `ctc` de la model card. El nombre del modelo (`trocrscratchline`) sugiere una variante de TrOCR entrenada desde cero (*scratch*) sobre lineas de texto manuscrito, y la etiqueta `ctc` apunta a un cabezal de Connectionist Temporal Classification para alineamiento secuencia a secuencia sin segmentacion previa a nivel de caracter. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; en HTR estos procedimientos no son habituales.

El entrenamiento se realizo sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la estrategia de aumento `elastic2` y semilla 42. La evaluacion se hizo sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje, lo que aísla el efecto del aumento de datos del efecto de un LM externo. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imagenes de lineas de texto en hebreo.
- Decodificacion CTC con salida greedy; el autor reporta resultados sin modelo de lenguaje.
- Entrenamiento y evaluacion orientados a medir la transferencia de metricas bajo aumento de datos (`elastic2`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue limitada al hebreo segun la model card.
- No se documentan modos especiales (thinking mode, vision general, audio).

## Casos de uso

- Reproduccion de experimentos de HTR: el modelo permite replicar el punto de la curva correspondiente a `trocrscratchline` + `elastic2` + semilla 42 dentro del estudio `htr-metrics-transfer`, comparando CER y WER frente a otras variantes.
- Analisis de ablation de aumento de datos: sirve para cuantificar cuanto aporta (o no) el aumento `elastic2` frente a otras estrategias sobre la misma arquitectura y split.
- Baseline de investigacion en HTR hebreo: con 22,4 M de parametros y 0,1 GB de pesos, es ligero enough para ejecutarse en entornos de laboratorio con recursos limitados y servir de referencia inferior en comparaciones.
- Estudio de robustez a escritores no vistos: al haberse entrenado excluyendo los escritores de desarrollo, permite analizar el comportamiento sobre escritores no vistos del test HHD Option-B.
- Docencia y formacion: util como ejemplo practico de pipeline HTR con CTC y decodificacion greedy sin LM, con metricas publicadas y reproducibles.
- Integracion en herramientas de transcripcion de manuscritos hebreos solo tras validacion: dado su CER de 0,2587, podria usarse como generador de transcripciones preliminares para revision humana, nunca como salida final automatica.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test HHD Option-B, decodificacion greedy, sin LM:

| Metrica | Valor |
|---|---|
| CER | 0,2587 |
| WER | 0,8260 |

Comparativa dentro del mismo estudio (misma semilla y aumento, distinta arquitectura base):

| Modelo | CER | WER |
|---|---|---|
| `cyttic/hmt-trocrscratchline-elastic2-s42` | 0,2587 | 0,8260 |
| `cyttic/hmt-htrvt-elastic2-s42` | 0,0667 | 0,2967 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a una tarea de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (22,4 M de parametros, ~90 MB en fp32); en fp16 o bf16, aproximadamente 45 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 cubren el modelo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al no documentarse pipeline ni formato GGUF, la via natural es PyTorch con `transformers` o carga directa de safetensors; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchline-elastic2-s42` | 22.421.004 | no disponible | 0,2587 | MIT | Hugging Face |
| `cyttic/hmt-htrvt-elastic2-s42` | no disponible | no disponible | 0,0667 | no disponible | Hugging Face |
| Otros modelos HTR de la familia `cyttic/hmt-*` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La unica comparacion directa disponible es con `hmt-htrvt-elastic2-s42`, que con el mismo aumento y semilla obtiene un CER aproximadamente 3,9 veces menor. No se dispone de datos de otros modelos HTR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: CER 0,2587 y WER 0,8260 implican que aproximadamente uno de cada cuatro caracteres y mas de cuatro de cada cinco palabras se reconocen incorrectamente; no es apto para transcripcion automatica sin revision humana.
- Idioma restringido al hebreo; no se documenta capacidad para otras lenguas.
- Evaluacion limitada a un unico conjunto de test (HHD Option-B) con decodificacion greedy y sin LM; los resultados con un modelo de lenguaje podrian variar y no se reportan.
- Riesgo de alucinacion y sustituciones a nivel de caracter propias de los sistemas CTC sin LM, especialmente en manuscritos con escritores no vistos.
- Sesgos conocidos: no documentados; al entrenarse sobre un split concreto de escritores, puede generalizar peor a estilos, caligrafias o dominios distintos.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se publica como material de investigacion sin garantias de idoneidad para produccion.
- No se documentan requisitos de preprocesado (resolucion de imagen, normalizacion, tokenizer) en la informacion disponible, lo que dificulta su reutilizacion directa fuera del pipeline del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-elastic2-s42
- Variante comparable del mismo estudio: https://huggingface.co/cyttic/hmt-htrvt-elastic2-s42
