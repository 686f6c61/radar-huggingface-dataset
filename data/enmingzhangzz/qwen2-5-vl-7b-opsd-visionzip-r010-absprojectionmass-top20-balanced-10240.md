# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-AbsProjectionMass-top20-balanced-10240

## Resumen

Este repositorio contiene un adaptador PEFT/LoRA resultado de un experimento OPSD (Online Preference Self-Distillation) aplicado al modelo base Qwen/Qwen2.5-VL-7B-Instruct. El adaptador, desarrollado por enmingzhangzz, combina dos tecnicas de investigacion: OPSD como metodo de entrenamiento con destilacion de preferencias y VisionZip como tecnica de poda de tokens visuales para reducir el coste computacional en modelos vision-language. El objetivo es mejorar la eficiencia de inferencia manteniendo la calidad de razonamiento multimodal.

El modelo resultante es un adaptador de 0.2 GB que debe cargarse sobre el base model de 7B parametros. La variante concreta utiliza un ratio de retencion de tokens visuales de 0.1 (es decir, conserva el 10% de los tokens de vision), ponderacion por masa absoluta de proyeccion de tokens (top-20) y un muestreo balanceado de 5120 ejemplos correctos y 5120 incorrectos del dataset OpenMMReasoner-SFT-874K. El entrenamiento se realizo con 10240 muestras en 4 GPUs con un batch global de 32.

La relevancia de este adaptador reside en su enfoque de investigacion: combina destilacion de preferencias con poda de tokens visuales, una linea de trabajo que busca reducir la latencia en modelos multimodales sin sacrificar precision. Sin embargo, al ser un adaptador experimental sin benchmarks publicados, su rendimiento real no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct (base) + adaptador LoRA |
| Parametros totales | 7.6B (base) + adaptador LoRA r=16 (0.2 GB) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (heredada del base model, tipicamente 32K para Qwen2.5-VL) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (heredados del base model, Qwen2.5-VL soporta multiples idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-VL-7B-Instruct, un modelo vision-language de 7.6B parametros con arquitectura transformer multimodal. El entrenamiento utiliza OPSD (Online Preference Self-Distillation), un metodo que combina destilacion de conocimiento con optimizacion de preferencias, empleando un teacher EMA con decay de 0.9999. El dataset de entrenamiento es OpenMMReasoner-SFT-874K, del cual se seleccionaron 10240 muestras balanceadas (5120 correctas y 5120 incorrectas segun el resultado del modelo base).

La innovacion principal es la integracion de VisionZip, una tecnica de poda de tokens visuales que reduce la secuencia de tokens de imagen procesados por el transformer. En esta variante, se retiene solo el 10% de los tokens visuales (ratio 0.1), con una estrategia de seleccion basada en la masa absoluta de proyeccion (top-20). El entrenamiento usa LoRA con r=16 y alpha=32, con resolucion de imagen de 846720 pixeles. El adaptador requiere el parche de runtime de VisionZip para inferencia podada.

## Capacidades

- Razonamiento multimodal: el adaptador hereda las capacidades de Qwen2.5-VL-7B-Instruct para comprension de imagenes y texto, incluyendo OCR, analisis de diagramas y respuesta a preguntas visuales.
- Eficiencia de inferencia: gracias a VisionZip, reduce el numero de tokens visuales procesados, lo que disminuye la latencia y el coste computacional en inferencia.
- Destilacion de preferencias: el entrenamiento OPSD busca alinear el modelo con preferencias de calidad, potencialmente mejorando la robustez frente a respuestas incorrectas.
- Tool calling: heredado del base model, que soporta function calling y uso de herramientas.
- Multilingue: heredado del base model, que soporta ingles, chino y otros idiomas.
- Adaptabilidad: al ser un adaptador LoRA, puede combinarse con otros adaptadores o cuantizaciones del base model.

## Casos de uso

- Analisis de documentos con OCR: el modelo puede extraer y razonar sobre texto en imagenes, util para digitalizar facturas, formularios o capturas de pantalla. La poda de tokens visuales reduce la latencia en lotes grandes de documentos.
- Asistentes de soporte tecnico con capturas: un agente que recibe capturas de pantalla de errores o configuraciones puede analizarlas y sugerir soluciones, aprovechando el contexto multimodal y la eficiencia de VisionZip.
- Moderacion de contenido visual: clasificacion de imagenes en categorias (violencia, desnudos, spam) con menor coste computacional que un modelo sin poda, adecuado para pipelines de moderacion en tiempo real.
- Educacion asistida: resolucion de problemas de matematicas o ciencias a partir de imagenes de enunciados o diagramas, con razonamiento paso a paso heredado del base model.
- Automatizacion de QA visual en fabricacion: inspeccion de imagenes de productos para detectar defectos o anomalias, donde la baja latencia es critica para lineas de produccion.
- Investigacion en eficiencia multimodal: como banco de pruebas para estudiar el equilibrio entre retencion de tokens visuales y calidad de respuesta, comparando con variantes sin poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tareas visuales. Tampoco se incluyen comparaciones con el modelo base o con otras variantes de VisionZip.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0.2 GB, pero el modelo base Qwen2.5-VL-7B-Instruct requiere aproximadamente 16-18 GB en FP16 y 8-10 GB en cuantizacion INT8/INT4.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB (RTX 3090/4090, A10) es suficiente. Para cuantizacion, una GPU de 12-16 GB (RTX 3060/4070) puede ser viable.
- Consumer GPU: si, con cuantizacion (GGUF o AWQ) el modelo cabe en GPUs de 12 GB, aunque la poda de VisionZip reduce la carga de tokens visuales y puede permitir contextos mas largos.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), y HuggingFace Transformers con PEFT. El parche de VisionZip es necesario para la inferencia podada.
- Latencia y throughput: no disponibles. La poda de tokens visuales al 10% deberia reducir significativamente el tiempo de prefill en tareas con muchas imagenes, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (base) | 7.6B | 32K | Apache 2.0 | Modelo completo sin poda, referencia de calidad |
| Qwen2.5-VL-7B-OPSD-VisionZip (este) | 7.6B + LoRA | no disponible | no disponible | Adaptador experimental con poda de tokens |
| Qwen2-VL-7B-Instruct | 7.6B | 32K | Apache 2.0 | Version anterior, sin VisionZip ni OPSD |

La comparativa directa con otros adaptadores de VisionZip o modelos OPSD no esta disponible por falta de informacion publica. El rendimiento relativo frente al base model no ha sido medido ni publicado.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia de que el adaptador mejore o iguale al base model en tareas estandar. Su uso en produccion requiere evaluacion propia.
- Dependencia de VisionZip: la inferencia requiere el parche de runtime de VisionZip, lo que complica el despliegue en entornos estandar.
- Datos de entrenamiento limitados: solo 10240 muestras de un unico dataset (OpenMMReasoner), lo que puede limitar la generalizacion a dominios fuera del razonamiento cientifico.
- Licencia no especificada: el autor no indica la licencia del adaptador, lo que genera incertidumbre legal para uso comercial.
- Riesgo de alucinacion: heredado del base model, especialmente en tareas visuales complejas o con imagenes de baja resolucion.
- Sesgos potenciales: el dataset OpenMMReasoner puede contener sesgos de dominio (razonamiento cientifico) que afecten a otros usos.
- Sin garantias de soporte: al ser un experimento de investigacion con 0 descargas y 0 likes, no hay comunidad ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-AbsProjectionMass-top20-balanced-10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- Proyecto VisionZip: no disponible en la informacion proporcionada
- Repositorio OPSD: no disponible en la informacion proporcionada
