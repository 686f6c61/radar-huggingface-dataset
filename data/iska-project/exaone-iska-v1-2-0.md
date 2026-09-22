# iSKA-project/exaone-iSKA-v1.2.0

## Resumen

iSKA-project/exaone-iSKA-v1.2.0 es un ajuste fino (SFT) del modelo EXAONE-3.5-7.8B-Instruct de LG AI Research, especializado en la evaluacion automatica de respuestas de estudiantes de coreano. El modelo ha sido entrenado por el usuario iSKA-project para puntuar respuestas en dos dimensiones concretas, "Language" y "Content", devolviendo una puntuacion que se evalua con el coeficiente kappa ponderado cuadraticamente (QWK). Resuelve el problema de la correccion y puntuacion masiva de producciones escritas en coreano, una tarea relevante para plataformas educativas, sistemas de evaluacion linguistica y herramientas de aprendizaje de idiomas.

El modelo cuenta con 7.818.448.896 parametros totales (aproximadamente 7,8 mil millones) y se distribuye unicamente en formato safetensors, con un tamano de repositorio de 15,6 GB, lo que es coherente con pesos en precision de 16 bits. Por su naturaleza derivada de EXAONE-3.5, hereda la arquitectura del modelo base y su licencia no comercial (EXAONE AI Model License Agreement 1.1 - NC).

La relevancia actual reside en que es un ejemplo de especializacion vertical sobre un LLM generalista mediante fine-tuning supervisado, con un rendimiento medido en QWK cercano a 0,83 en el conjunto de test y 0,8415 en el mejor checkpoint de validacion. No obstante, la model card es muy escueta: no detalla composicion del dataset, hiperparametros ni idiomas soportados mas alla del enfoque en coreano, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo derivado de EXAONE-3.5-7.8B-Instruct; ver arXiv:2412.04862) |
| Parametros totales | 7.818.448.896 (aprox. 7,8 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card (el ajuste fino esta orientado a la evaluacion de respuestas en coreano) |
| Licencia | EXAONE AI Model License Agreement 1.1 - NC (no comercial) segun la model card; el campo de licencia de HuggingFace figura como no disponible |
| Formato de pesos | safetensors (con tag custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo instructivo EXAONE-3.5-7.8B-Instruct de LG AI Research, referenciado en el articulo arXiv:2412.04862. La model card no especifica la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas adicionales como RLHF o DPO. Tampoco se detallan los hiperparametros del SFT mas alla de la referencia al paso 504 como mejor checkpoint de validacion.

La innovacion tecnica del modelo es su especializacion: en lugar de un LLM generalista, se trata de un evaluador calibrado que produce puntuaciones en dos ejes ("Language" y "Content"). La evaluacion se realiza con quadratic weighted kappa (QWK), una metrica apropiada para tareas de puntuacion ordinal donde los errores grandes deben penalizarse mas que los pequenos. No se documenta ninguna innovacion arquitectonica propia, decodificacion especulativa ni mecanismo de atencion alternativo.

## Capacidades

- Evaluacion y puntuacion de respuestas escritas en coreano mediante fine-tuning supervisado.
- Puntuacion en dos dimensiones independientes: "Language" (correccion linguistica) y "Content" (adecuacion de contenido).
- Generacion de texto general, heredada del modelo base EXAONE-3.5-7.8B-Instruct.
- Capacidad de razonamiento y seguimiento de instrucciones, heredada del base instructivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la model card; el enfoque del ajuste es el coreano.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Plataformas de aprendizaje de coreano: el modelo puede puntuar de forma automatica las respuestas escritas de estudiantes, asignando notas en "Language" y "Content" y liberando al profesorado de la correccion manual masiva.
- Evaluacion estandarizada de idiomas: integrado en un sistema de examenes, permite generar puntuaciones consistentes y comparables entre convocatorias, con la fiabilidad medida por el QWK reportado (0,827 de media en test).
- Correccion formativa con feedback: combinado con el modelo base instructivo, se puede usar la puntuacion del evaluador como senal para que el propio modelo redacte retroalimentacion personalizada al estudiante.
- Investigacion en evaluacion automatica (AES): sirve como baseline especializado en coreano para comparar tecnicas de scoring y metricas QWK frente a otros enfoques.
- Deteccion de brechas linguisticas en corpus educativos: la dimension "Language" permite identificar patrones de error gramatical u ortografico frecuentes en una cohorte de estudiantes.
- Control de calidad de contenido generado: la dimension "Content" puede adaptarse para verificar la pertinencia de respuestas generadas por otros modelos en un pipeline de evaluacion por pares.
- Clasificacion y ranking de respuestas abiertas: al producir puntuaciones ordinales, puede emplearse para ordenar candidatos o respuestas en un proceso de seleccion o de evaluacion comparativa.
- Prefiltrado en anotacion humana: descartar o priorizar respuestas antes de la revision manual, reduciendo el volumen de trabajo de los anotadores.

## Benchmarks y rendimiento

La model card publica unicamente resultados de evaluacion interna en un conjunto de test reservado de puntuacion de respuestas en coreano, medidos con quadratic weighted kappa (QWK).

| Metrica | QWK |
|---|---:|
| Language | 0,8196 |
| Content | 0,8344 |
| Mean | 0,8270 |

Mejor checkpoint de validacion:

| Metrica | Valor |
|---|---:|
| Validation mean QWK | 0,8415 |
| Step | 504 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 7,8 B de parametros): aproximadamente 15,6-18 GB en FP16/BF16, en torno a 8-10 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en FP16 con lotes grandes; RTX 4090, RTX 3090 o A10G (24 GB) para FP16 con lotes pequenos; RTX 4080/4070 Ti (16 GB) o inferiores serian viables solo en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en FP16 con contexto moderado, y en tarjetas de 12-16 GB aplicando cuantizacion.
- Opciones de despliegue: vLLM y TGI son las vias mas habituales para el modelo base; al llevar la etiqueta custom_code, se requiere cargar con trust_remote_code=True. No hay versiones GGUF publicadas, por lo que llama.cpp y Ollama no estan disponibles salvo que se conviertan los pesos manualmente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iSKA-project/exaone-iSKA-v1.2.0 | 7,8 B | no disponible | Puntuacion de respuestas en coreano (QWK ~0,827) | EXAONE AI Model License 1.1 - NC (no comercial) | HuggingFace, safetensors |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (modelo base) | 7,8 B | no disponible en esta ficha (referencia arXiv:2412.04862) | LLM instructivo generalista | EXAONE AI Model License 1.1 - NC | HuggingFace, safetensors |
| Qwen2.5-7B-Instruct | aprox. 7,6 B | aprox. 128 K (referencia publica) | LLM instructivo generalista | Apache 2.0 | HuggingFace, safetensors/GGUF |
| Llama-3.1-8B-Instruct | aprox. 8 B | aprox. 128 K (referencia publica) | LLM instructivo generalista | Llama 3.1 Community License | HuggingFace, safetensors/GGUF |

Nota: los datos de contexto y licencia de Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct son referencias publicas externas a la informacion proporcionada y deben verificarse en sus respectivas model cards. No se dispone de resultados de benchmarks comparativos entre estos modelos y exaone-iSKA-v1.2.0.

## Limitaciones y advertencias

- La model card no documenta la composicion del dataset de entrenamiento, por lo que se desconoce el posible sesgo de la muestra utilizada en el fine-tuning.
- Riesgo de alucinacion y de puntuaciones incoherentes en respuestas fuera de la distribucion del conjunto de entrenamiento (idiomas distintos del coreano, dominios no cubiertos, formatos atipicos).
- El modelo esta especializado en la evaluacion de respuestas en coreano; se desconoce su comportamiento en otros idiomas, ya que no se declaran idiomas soportados.
- La licencia heredada (EXAONE AI Model License Agreement 1.1 - NC) es no comercial, lo que restringe el uso en productos o servicios de pago sin autorizacion expresa.
- El campo de licencia en HuggingFace figura como "no disponible", por lo que conviene confirmar los terminos exactos en la model card y en la licencia del modelo base antes de cualquier uso en produccion.
- Al estar etiquetado como custom_code, la carga del modelo requiere trust_remote_code=True, lo que implica ejecutar codigo remoto no auditado.
- No se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ) ni resultados de benchmarks estandar, lo que dificulta la comparacion con alternativas y el despliegue en entornos con recursos limitados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iSKA-project/exaone-iSKA-v1.2.0
- Paper del modelo base EXAONE 3.5: https://arxiv.org/abs/2412.04862

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a sitios de reserva de hoteles y no guardan relacion con la ficha. No se han encontrado repositorios, demos ni blogs adicionales asociados al modelo en la informacion disponible.
