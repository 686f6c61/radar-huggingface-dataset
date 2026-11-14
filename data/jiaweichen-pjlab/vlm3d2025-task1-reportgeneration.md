# jiaweichen-pjlab/VLM3D2025-Task1-ReportGeneration

## Resumen

VLM3D2025-Task1-ReportGeneration es un modelo de generacion de informes radiologicos a partir de volumenes de tomografia computarizada (TC), desarrollado por el equipo jiaweichen-pjlab para la pista de Report Generation del reto VLM3D@MICCAI 2025. Se trata de un modelo vision-lenguaje multimodal (VLM) de arquitectura MedM-VL que combina un codificador de imagen SigLIP2-so400m-patch14-384 con un modelo de lenguaje Qwen3-8B, entrenado sobre el dataset CT-RATE.

El modelo resuelve la tarea de convertir un estudio de TC toracico en un informe clinico estructurado en lenguaje natural. Su relevancia radica en que aplica un LLM de ultima generacion (Qwen3-8B) como decodificador sobre caracteristicas visuales 3D, un enfoque poco comun en el ambito de la radiologia automatizada, donde predominan arquitecturas especificas o modelos de menor tamano.

El checkpoint publicado corresponde al modelo final del reto, con pesos en safetensors (12 GB en total, distribuidos en 4 shards) y licencia CC BY 4.0. No se redistribuyen las imagenes ni los informes de CT-RATE por restricciones de los datos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MedM-VL (VLM multimodal: codificador SigLIP2 + LLM Qwen3-8B) |
| Parametros totales | no disponible (el LLM base es Qwen3-8B; el total del conjunto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los informes de CT-RATE estan en ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (4 shards) + config y tokenizer |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MedM-VL: un codificador visual SigLIP2-so400m-patch14-384 (`google/siglip2-so400m-patch14-384`) que procesa las imagenes de TC, un conector que proyecta las caracteristicas visuales al espacio del LLM, y un decodificador de lenguaje Qwen3-8B (`Qwen/Qwen3-8B`). El checkpoint publicado se identifica como `final-MedM-VL-siglip-384-qwen3-8b-finetune`. La adaptacion al dominio 3D de TC se realiza mediante el pipeline del repositorio de codigo, que gestiona la entrada volumetrica.

El entrenamiento se realizo en dos fases sobre CT-RATE: una fase de preentrenamiento con el codificador y el LLM congelados y solo el conector entrenado durante 1 epoca, seguida de un ajuste fino completo (codificador, LLM y conector) durante 1 epoca adicional. No se documenta en la informacion disponible el uso de RLHF, DPO ni el volumen exacto de tokens de entrenamiento. El modelo se evalua condicionado a las etiquetas predichas CT_CLS8, lo que implica un pipeline de dos etapas (clasificacion y generacion).

## Capacidades

- Generacion de informes radiologicos en lenguaje natural a partir de estudios de TC toracico.
- Procesamiento de entrada visual volumetrica (imagenes de TC) mediante codificador SigLIP2.
- Generacion de texto clinico estructurado condicionada a etiquetas de clasificacion (CT_CLS8).
- Razonamiento sobre hallazgos radiologicos implícito en la generacion de informes.
- Capacidades multilingues heredadas de Qwen3-8B, aunque no verificadas para esta tarea.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documenta soporte de audio ni de vision 2D general fuera del pipeline de TC.

## Casos de uso

- Generacion automatizada de borradores de informes de TC toracico: el modelo recibe el volumen de TC y produce un informe estructurado que el radiologo puede revisar y editar, reduciendo el tiempo de dictado.
- Triaje y priorizacion en servicios de radiologia: integrado en un pipeline con el clasificador CT_CLS8, permite generar informes preliminares para estudios con hallazgos relevantes antes de la lectura humana.
- Investigacion en generacion de informes medicos: sirve como baseline reproducible para comparar arquitecturas VLM sobre CT-RATE en experimentos academicos.
- Auditoria y control de calidad de informes: puede generar informes de referencia sobre estudios retrospectivos para detectar discrepancias en informes humanos.
- Docencia y formacion radiologica: genera descripciones de hallazgos sobre casos de ejemplo para ilustrar patrones de interpretacion.
- Procesamiento por lotes de cohorts de investigacion: al ser un modelo abierto con pesos publicados, permite generar informes a escala sobre grandes volumenes de CT-RATE para estudios poblacionales, sujeto a las restricciones de licencia de los datos.

## Benchmarks y rendimiento

Evaluacion local sobre CT-RATE `valid_fixed` (3.039 casos, condicionada a etiquetas CT_CLS8 predichas). Segun el autor, `valid` estaba incluido en los datos de ajuste fino, por lo que estos valores constituyen una cota superior in-sample y no puntuaciones oficiales del reto.

| Metrica | Valor |
|---|---:|
| BLEU-4 | 0.2146 |
| BLEU-mean | 0.3000 |
| ROUGE-L | 0.3424 |
| CIDEr | 0.1975 |
| RadBERT Macro F1 | 0.5494 |
| RadBERT Micro F1 | 0.5963 |
| CRG | 0.5431 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12 GB en safetensors; en precision completa (bf16/fp16) se requiere aproximadamente 16-20 GB de VRAM para el modelo, mas el coste del procesamiento volumetrico de TC, que puede ser significativo.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con al menos 24 GB (RTX 3090, RTX 4090) para inferencia en bf16.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con margen ajustado; en GPUs de 16 GB requeriria cuantizacion, no documentada oficialmente.
- Opciones de despliegue: el autor remite al repositorio `code/report_generation/inference/`; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada que permitan una comparacion rigurosa con otros modelos de generacion de informes sobre CT-RATE.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VLM3D2025-Task1-ReportGeneration | Qwen3-8B + SigLIP2-so400m | no disponible | CC BY 4.0 | Pesos abiertos en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados reportados son in-sample (valid incluido en el ajuste fino) y no deben interpretarse como rendimiento real en produccion ni como puntuacion oficial del reto.
- Modelo especializado exclusivamente en TC toracico y en el dominio de CT-RATE; no generaliza a otras modalidades ni regiones anatomicas sin reentrenamiento.
- Riesgo de alucinacion clinica: como todo LLM generativo, puede producir hallazgos inexistentes o omitir hallazgos reales; no apto para uso clinico sin supervision facultativa.
- Sesgos potenciales derivados de la distribucion de CT-RATE (poblacion, equipos y protocolos del centro de origen), no documentados.
- Idiomas: no se documenta soporte multilingue verificado; los informes de entrenamiento estan en ingles.
- Restricciones de licencia: los pesos son CC BY 4.0, pero las imagenes e informes de CT-RATE no se redistribuyen y estan sujetos a sus propias licencias; el uso comercial de los datos subyacentes requiere verificar los terminos de CT-RATE.
- Dependencia de etiquetas CT_CLS8 predichas: errores en la clasificacion previa degradan la generacion del informe.
- No se documentan tecnicas de cuantizacion ni wrappers de despliegue estandar, lo que complica la integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiaweichen-pjlab/VLM3D2025-Task1-ReportGeneration
- Repositorio de codigo (entrenamiento e inferencia): https://github.com/yinghemedical/VLM3D-2025
- Codificador visual SigLIP2: https://huggingface.co/google/siglip2-so400m-patch14-384
- LLM base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset CT-RATE: no disponible en la informacion proporcionada
