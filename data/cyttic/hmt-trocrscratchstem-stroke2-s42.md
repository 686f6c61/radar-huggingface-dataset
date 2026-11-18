# cyttic/hmt-trocrscratchstem-stroke2-s42

## Resumen

`cyttic/hmt-trocrscratchstem-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalua el impacto de distintas estrategias de augmentacion sobre el rendimiento de un modelo base. En este caso, el modelo parte de la arquitectura TrOCR y se ha entrenado con la variante de augmentacion `stroke2` y la semilla 42.

El modelo emplea un esquema de decodificacion CTC (*Connectionist Temporal Classification*) y esta especializado en hebreo (`he`), un idioma con escritura de derecha a izquierda y alfabeto propio, lo que condiciona tanto el preprocesamiento como la evaluacion. Con 24.928.588 parametros (aproximadamente 25 millones) y un repositorio de 0,1 GB, es un modelo compacto orientado a tareas de transcripcion linea a linea, no a generacion de texto general.

Su relevancia es acotada pero util: sirve como referencia reproducible para investigacion en HTR, permite comparar el efecto de la augmentacion `stroke2` frente a otras variantes del mismo estudio y ofrece una linea base ligera (CER 0,0776, WER 0,3526 sobre el conjunto de test HHD Option-B) que puede desplegarse en hardware modesto. No obstante, es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (variante `trocrscratchstem`), con cabeza CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder originalmente planteado para reconocimiento de texto impreso y manuscrito, combinado aqui con decodificacion CTC segun la etiqueta `ctc` de la model card. El identificador `trocrscratchstem` sugiere un entrenamiento desde cero (*scratch*) sobre un *stem* o inicializacion concreta del estudio, aunque la model card no detalla la configuracion exacta de capas, dimensiones ocultas ni resolucion de entrada.

El entrenamiento se realizo sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y se evaluo sobre el conjunto de test HHD Option-B con decodificacion greedy y sin modelo de lenguaje. La innovacion metodologica del checkpoint no reside en la arquitectura sino en el pipeline de aumento de datos: la variante `stroke2` forma parte de un barrido sistematico de augmentaciones cuyo objetivo es medir la transferencia de metricas HTR. No se documentan fases de RLHF ni DPO, algo esperable en una tarea discriminativa de transcripcion.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo, con salida de secuencia de caracteres mediante CTC.
- Transcripcion linea a linea de imagenes de texto manuscrito.
- Decodificacion greedy sin modelo de lenguaje externo (configuracion evaluada por el autor).
- Evaluacion reproducible mediante CER y WER sobre el conjunto HHD Option-B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al hebreo.
- Capacidades especiales (vision general, audio, thinking mode): no disponible; la unica modalidad documentada es imagen de texto manuscrito a texto.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo transcribe imagenes linea a linea y puede integrarse en pipelines de OCR/HTR para convertir colecciones documentales en texto indexable, con un CER de referencia del 7,76 %.
- Investigacion comparativa en aumento de datos: al ser un checkpoint de un barrido (`stroke2`, semilla 42), permite reproducir y contrastar el efecto de la augmentacion frente a otras variantes del estudio `htr-metrics-transfer`.
- Linea base ligera para prototipos: con unos 25 millones de parametros y 0,1 GB de repo, puede desplegarse en entornos con recursos limitados para validar rapidamente una idea antes de escalar a modelos mayores.
- Etiquetado asistido de corpus manuscritos: las transcripciones del modelo pueden usarse como preetiquetado y posterior correccion humana, reduciendo el coste de anotacion en hebreo.
- Evaluacion de robustez frente a variaciones de trazo: la variante `stroke2` esta pensada precisamente para estudiar la sensibilidad del reconocimiento a modificaciones del trazo, util en auditorias de calidad de modelos HTR.
- Benchmark interno de HTR en hebreo: sirve como referencia de CER/WER (0,0776 / 0,3526) para comparar futuros modelos del mismo dominio y conjunto de test.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Decodificacion | CER | WER |
|---|---|---|---|
| HHD Option-B test | Greedy, sin LM | 0,0776 | 0,3526 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el modelo es especifico de HTR y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 24,9 millones de parametros en fp32 el peso ronda los 100 MB, por lo que la VRAM necesaria es muy reducida (del orden de unos pocos cientos de MB incluyendo activaciones y batch).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: al no documentarse variantes GGUF ni ONNX, el despliegue natural es via `transformers` (PyTorch) con los pesos safetensors; vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-stroke2-s42 | 24,9 M | no disponible | he | MIT | CER 0,0776 / WER 0,3526 (HHD Option-B) |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | he | no disponible | no disponible |
| TrOCR base (Microsoft) | no disponible | no disponible | en (principalmente) | MIT | no disponible en esta ficha |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria; las filas distintas de la primera reflejan ausencia de datos verificables.

## Limitaciones y advertencias

- Modelo de investigacion: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no debe tratarse como un artefacto listo para produccion sin validacion propia.
- Especifico de hebreo: no se documenta soporte para otros idiomas, por lo que su uso fuera de `he` no esta respaldado.
- WER relativamente alto (0,3526) frente al CER (0,0776), lo que indica errores a nivel de palabra que pueden afectar a tareas de busqueda o indexacion.
- Evaluacion con decodificacion greedy y sin modelo de lenguaje: el rendimiento en produccion puede variar si se anade un LM o se cambia la estrategia de decodificacion.
- Riesgo de alusiones incorrectas en caracteres ambiguos del hebreo manuscrito; no se documentan analisis de sesgo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de licencia.
- Sin informacion sobre contexto maximo, resolucion de entrada ni composicion exacta del dataset de entrenamiento, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-stroke2-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (no se proporciona URL directa en la informacion disponible)
- Paper, blog o demo adicionales: no disponible
