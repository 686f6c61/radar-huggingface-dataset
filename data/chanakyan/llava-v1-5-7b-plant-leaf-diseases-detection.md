# Chanakyan/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection

## Resumen

LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection es un modelo multimodal de clasificación fina de enfermedades en hojas de plantas, desarrollado por Yucheng Shi y colaboradores (Universidad de Georgia, MGH y Harvard). Se trata de un ajuste fino (fine-tuning) del modelo base LLaVA-1.5-7B, especializado en detectar y explicar síntomas visuales de enfermedades foliares a partir de imágenes. Su principal innovación es el uso de datos auto-sintetizados basados en el principio de Information Bottleneck, que extrae y describe síntomas específicos de cada enfermedad, combinado con un proceso de ajuste iterativo mediante rejection sampling sin modelo de recompensa. El modelo está pensado para aplicaciones agrícolas donde se requiere no solo clasificar la enfermedad, sino también proporcionar explicaciones verificables por humanos.

Con aproximadamente 7.000 millones de parámetros, el modelo mantiene la arquitectura original de LLaVA-1.5-7B (encoder de visión CLIP ViT-L/14 + LLM Vicuna-7B) y se distribuye en formato safetensors. Aunque no se especifica la longitud de contexto en la documentación, hereda la ventana de 4096 tokens del modelo base. Su relevancia actual radica en la creciente demanda de herramientas de diagnóstico agrícola accesibles y explicables, donde la capacidad de razonamiento visual y la generación de descripciones textuales de síntomas resultan críticas para la confianza del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5-7B (encoder de vision CLIP ViT-L/14 + LLM Vicuna-7B) |
| Parametros totales | 7.063.427.072 (~7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de LLaVA-1.5-7B, tipicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado de LLaVA-1.5-7B, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaVA-1.5-7B, que combina un codificador de vision CLIP ViT-L/14 con un modelo de lenguaje Vicuna-7B, conectados mediante un proyector multimodal. El ajuste fino se realizo con LoRA (Low-Rank Adaptation) sobre el dataset PlantVillage, que contiene imagenes de hojas sanas y enfermas de multiples especies vegetales. La innovacion principal del entrenamiento es el uso de datos auto-sintetizados: se extraen y describen sintomas visuales especificos de cada enfermedad aplicando el principio de Information Bottleneck, lo que permite generar explicaciones mas precisas y menos redundantes. Ademas, se emplea un esquema de ajuste iterativo con rejection sampling sin modelo de recompensa, que mejora tanto la precision de clasificacion como la calidad de las explicaciones generadas. No se detallan el numero total de tokens de entrenamiento ni la composicion exacta del dataset, pero el proceso se documenta en el articulo arXiv 2502.14044.

## Capacidades

- Clasificacion visual fina de enfermedades en hojas de plantas a partir de imagenes.
- Generacion de explicaciones textuales de los sintomas observados, disenadas para ser verificables por humanos.
- Razonamiento multimodal: combina informacion visual y textual para responder preguntas sobre la imagen.
- Capacidad de conversacion multi-turno gracias a la arquitectura LLaVA-1.5-7B (aunque el uso principal es de una sola consulta).
- Soporte para inferencia con imagenes de hojas en diversos estados de salud.
- No se documentan capacidades de tool calling, agentes ni soporte multilingue explicito.

## Casos de uso

- Diagnostico asistido en agricultura de precision: un agricultor fotografia una hoja con sintomas y el modelo identifica la enfermedad y describe los sintomas, permitiendo una primera evaluacion rapida en campo.
- Soporte a extensionistas agricolas: los tecnicos pueden usar el modelo como herramienta de consulta para confirmar sospechas y obtener explicaciones detalladas que luego comunican a los productores.
- Educacion agronomica: estudiantes de agronomia pueden practicar la identificacion de enfermedades con imagenes reales y recibir explicaciones de los sintomas, mejorando su aprendizaje.
- Integracion en aplicaciones moviles de diagnostico: el modelo puede desplegarse en servidores y consumirse via API desde apps de asistencia al agricultor, ofreciendo respuestas inmediatas con explicaciones.
- Automatizacion de inspecciones en invernaderos: mediante camaras fijas o drones, el modelo puede analizar lotes de imagenes de hojas y alertar sobre posibles brotes, reduciendo la carga de trabajo manual.
- Investigacion en fitopatologia: los investigadores pueden utilizar el modelo para pre-clasificar imagenes de campo y generar descripciones estandarizadas de sintomas, facilitando la curacion de datasets y la comparacion entre estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo demuestra "superior accuracy y explicaciones robustas e interpretables" en comparacion con modelos base, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandar. Tampoco se ofrecen metricas especificas de clasificacion de enfermedades (como precision, recall o F1) en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~7B en precision fp16, se requieren aproximadamente 14-16 GB de VRAM. Con cuantizacion a 8 bits, unos 8-10 GB; con 4 bits, unos 5-6 GB (aunque no se han publicado cuantizaciones oficiales).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16 sin problemas; A100 o H100 para despliegue en produccion con mayor throughput.
- Compatibilidad con GPU de consumo: si, una RTX 3060 de 12 GB puede ejecutar el modelo con cuantizacion de 8 bits o 4 bits, aunque con menor velocidad.
- Opciones de despliegue: al ser un modelo de Hugging Face con transformers, puede servirse con vLLM, TGI o directamente con la libreria transformers. Para entornos ligeros, se podria convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles. Como referencia, un modelo LLaVA-1.5-7B en una RTX 4090 suele generar entre 20-40 tokens por segundo en fp16, pero esto depende del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection (este) | 7B | no disponible | Deteccion y explicacion de enfermedades foliares | no disponible |
| LLaVA-1.5-7B (base) | 7B | 4096 | Vision-language general | Apache 2.0 |
| PlantVillage-Tiny (modelos clasicos CNN) | <10M | - | Clasificacion de enfermedades sin explicacion | variable |

No se dispone de comparativas publicadas con otros modelos de diagnostico de enfermedades de plantas basados en LLMs multimodales. La principal diferencia con el modelo base es la especializacion en el dominio y la generacion de explicaciones de sintomas, mientras que los modelos clasicos CNN solo ofrecen una etiqueta de clase sin justificacion textual.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrena sobre PlantVillage, que contiene imagenes de hojas en condiciones controladas; puede tener un rendimiento inferior en imagenes reales de campo con fondos complejos, iluminacion variable o multiples enfermedades simultaneas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir descripciones de sintomas plausibles pero incorrectas, especialmente en imagenes fuera de distribucion. Las explicaciones deben ser verificadas por un experto.
- Limitaciones de contexto: la ventana de contexto heredada (probablemente 4096 tokens) puede ser insuficiente para dialogos muy largos o multiples imagenes en una sola consulta.
- Idioma: no se documenta soporte multilingue; el modelo esta disenado principalmente para ingles, lo que limita su uso en regiones hispanohablantes sin traduccion adicional.
- Licencia: no se especifica la licencia del modelo ajustado; aunque el base es Apache 2.0, el fine-tuning podria tener restricciones adicionales. Se recomienda contactar con los autores antes de uso comercial.
- Produccion: no se proporcionan garantias de robustez ni certificaciones; el modelo es una herramienta de investigacion y no debe sustituir el diagnostico profesional en agricultura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YuchengShi/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection
- Articulo en arXiv: https://arxiv.org/abs/2502.14044
- Proyecto SelfSynthX (GitHub): https://github.com/sycny/SelfSynthX
- Repositorio de presentacion (Tech3Space): https://github.com/Tech3Space/plant_dataset_fine_tuning
- Ejemplo de microservicio Flask (Parivesh09): https://github.com/Parivesh09/Leaf-Disease-Detection/tree/main/plant-disease-ml
