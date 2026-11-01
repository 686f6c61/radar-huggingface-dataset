# cyttic/hmt-trocrctc-photo1-s42

## Resumen

`cyttic/hmt-trocrctc-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CyTTIC, especializado en la transcripcion automatica de documentos manuscritos en hebreo. Se trata de un modelo de 87,3 millones de parametros construido sobre la arquitectura TrOCR con una cabeza de decodificacion CTC, entrenado como parte de un estudio sistematico sobre transferencia de metricas HTR y el efecto de distintas tecnicas de aumentacion de datos.

El modelo forma parte de una familia de experimentos organizados en olas (*waves*), donde cada variante combina un backbone (`trocrctc`), una estrategia de aumentacion (`photo1`, orientada a simular condiciones fotograficas) y una semilla concreta (42). El entrenamiento se realizo sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, lo que permite medir la generalizacion a escritores no vistos.

Su relevancia actual reside en dos factores: por un lado, la escasez de modelos publicos para HTR en hebreo, un idioma con alfabeto no latino y escasa representacion en los corpus OCR/HTR habituales; por otro, su caracter de artefacto reproducible de investigacion, con metricas publicadas (CER 0,1220 y WER 0,4908 sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje) que permiten comparar el impacto de la aumentacion fotografica frente a otras variantes de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza de decodificacion CTC (transformer encoder-decoder adaptado a CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a FP16/INT8/GGUF no documentada por el autor) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la estela de TrOCR, un transformer encoder-decoder disenado originalmente para reconocimiento de texto impreso y manuscrito en imagenes, pero sustituye la decodificacion autorregresiva por una cabeza CTC (*Connectionist Temporal Classification*). Esta eleccion elimina la necesidad de un modelo de lenguaje externo durante la inferencia y permite decodificacion greedy directa sobre las probabilidades por frame, lo que simplifica el despliegue y reduce la latencia frente a enfoques autoregresivos.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo explicitamente a los escritores reservados para el conjunto de desarrollo. La variante `photo1` corresponde a una estrategia de aumentacion orientada a simular condiciones de captura fotografica (variaciones de iluminacion, ruido, perspectiva o compresion, segun la taxonomia del estudio), y la semilla 42 fija la reproducibilidad del experimento. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en tareas HTR.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes de lineas o fragmentos de documento.
- Transcripcion con decodificacion CTC greedy, sin dependencia de un modelo de lenguaje externo.
- Robustez parcial a condiciones fotograficas gracias a la aumentacion `photo1` aplicada durante el entrenamiento.
- Generalizacion a escritores no vistos, al haberse excluido los escritores de desarrollo del conjunto de entrenamiento.
- Salida a nivel de caracter y palabra, lo que permite calcular CER y WER directamente.
- No se documenta soporte de tool calling, function calling, agentes, vision general (mas alla de OCR), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de archivos historicos en hebreo: el modelo transcribe lineas manuscritas de documentos escaneados, adecuado para proyectos de preservacion digital donde el idioma y la escritura manual complican el uso de OCR convencional.
- Extraccion de texto en pipelines de archivo: integrable como etapa de reconocimiento tras un detector de lineas, con salida CTC que permite umbrales de confianza por caracter para filtrar transcripciones dudosas.
- Investigacion en HTR y aumentacion de datos: sirve como punto de comparacion reproducible (semilla 42, aumentacion `photo1`) frente a otras variantes de la familia `hmt-trocrctc`, permitiendo aislar el efecto de la estrategia de aumentacion.
- Procesamiento de formularios y registros manuscritos: util en digitalizacion de registros civiles, censos o libros de actas en hebreo donde el texto es mayoritariamente manuscrito.
- Anotacion asistida: el modelo puede predecir transcripciones que un revisor humano corrige, reduciendo el coste de crear nuevos corpus HTR etiquetados.
- Evaluacion de robustez fotografica: al estar entrenado con aumentacion `photo1`, es adecuado para probar el rendimiento en imagenes capturadas con camara movil frente a escaneos planos, comparando con variantes sin aumentacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1220 |
| HHD Option-B test (greedy, sin LM) | WER | 0,4908 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks generales, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32 (87,3 M de parametros), inferior a 0,2 GB en FP16; el repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite procesar lotes grandes de lineas sin problemas. Para despliegues de alto throughput, A100 o H100 no son necesarias pero permiten mayor paralelismo por lote.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050 y superiores, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: carga directa con `transformers` y `safetensors`; integracion en pipelines personalizados con PyTorch; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje, no a HTR).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo1-s42 | 87,3 M | no disponible | hebreo | MIT | HuggingFace |
| Otras variantes `hmt-trocrctc` (misma familia, distintas aumentaciones/semillas) | ~87 M | no disponible | hebreo | MIT (presumible) | HuggingFace (cyttic) |
| TrOCR base (Microsoft) | ~334 M | no disponible | ingles principalmente | MIT | HuggingFace |
| Modelos HTR publicos para hebreo | no disponible | no disponible | hebreo | no disponible | no disponible |

La comparacion cuantitativa con TrOCR base u otros modelos HTR en hebreo no esta disponible en la informacion proporcionada; las unicas metricas publicadas son las del propio modelo sobre HHD Option-B.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no soporta otros idiomas ni texto impreso de forma fiable.
- El WER de 0,4908 sobre el test indica que aproximadamente la mitad de las palabras contienen al menos un error, lo que limita su uso en produccion sin revision humana o post-procesado con modelo de lenguaje.
- Entrenado sin modelo de lenguaje en decodificacion; la salida puede contener secuencias poco probables linguisticamente.
- Posibles sesgos hacia los estilos de escritura y condiciones de captura presentes en `cyttic/hhd-optionb-split`; el rendimiento puede degradarse en dominios, epocas o escribanos distintos.
- Riesgo de alucinacion a nivel de caracter: la decodificacion CTC puede producir caracteres espurios en regiones de baja calidad de imagen.
- Licencia MIT, permisiva para uso comercial, pero sin garantias implicitas; conviene verificar la procedencia y licencia del corpus de entrenamiento antes de un despliegue comercial.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- No se documentan limitaciones de longitud de contexto ni resolucion de imagen maxima; deben inferirse de la configuracion de TrOCR subyacente.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrctc-photo1-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: `results.json` en el repositorio del modelo (no se proporciona URL directa)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
