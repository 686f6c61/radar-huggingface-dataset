# lm-spell/SinBERT-large-ft-ssc

## Resumen

SinBERT-large-ft-ssc es un modelo de lenguaje basado en la arquitectura RoBERTa, desarrollado por el proyecto lm-spell, que ha sido afinado especificamente para la correccion ortografica de texto en cingales (sinhala). Se construye sobre el modelo base NLPC-UOM/SinBERT-large, preentrenado por el NLPC de la Universidad de Moratuwa sobre un corpus monolingue de 15 millones de textos en cingales (sin-cc-15M). La tarea concreta que aborda es la deteccion y correccion de errores ortograficos, planteada como una tarea de masked language modeling (fill-mask) sobre la que el modelo predice el token correcto en la posicion enmascarada.

El modelo cuenta con 125.978.112 parametros reales segun los pesos en safetensors, un tamano que lo situa en la franja de los transformers tipo base (pese a la denominacion "large" del modelo original). Se distribuye con licencia CC-BY-4.0, acceso restringido (gated) y un repositorio de 0,5 GB. Esta especializado exclusivamente en el idioma cingales (codigo ISO "si") y su relevancia actual radica en que el cingales es un idioma de bajos recursos, con muy pocas herramientas de correccion automatica y practicamente ninguna basada en modelos transformer afinados especificamente para esta tarea.

La aportacion principal no es la arquitectura, que es un transformer encoder estandar tipo RoBERTa, sino el corpus de afinamiento (lm-spell/sinhala-spell-correction-dataset) y la adaptacion del modelo base a una tarea generativa de correccion de errores tipicos en cingales, un problema de interes practico para edicion, periodismo digital y procesamiento de texto en este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (BERT-like) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura RoBERTa estandar emplea 512 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin versiones GGUF, AWQ, GPTQ o bitsandbytes documentadas) |
| Idiomas soportados | cingales (sinhala, codigo "si") |
| Licencia | CC-BY-4.0 (acceso restringido, requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipelines declarados | fill-mask, feature-extraction |
| Dataset de afinamiento | lm-spell/sinhala-spell-correction-dataset |
| Modelo base | NLPC-UOM/SinBERT-large |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 20 de mayo de 2025 |
| Ultima actualizacion | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo encoder, heredada directamente de NLPC-UOM/SinBERT-large, que a su vez sigue el diseno de RoBERTa. El modelo base fue preentrenado sobre sin-cc-15M, un corpus monolingue en cingales de 15 millones de textos, aplicando el objetivo de masked language modeling caracteristico de la familia BERT/RoBERTa. La adaptacion al castellano no aplica aqui: el modelo esta disenado unicamente para cingales.

El afinamiento posterior realizado por lm-spell convierte el modelo en un corrector ortografico de tipo fill-mask: se enmascara el token erroneo o candidato a correccion y el modelo predice la forma correcta, aprovechando la cabeza de language modeling enmascarado. No se especifica en la informacion disponible el numero de tokens de afinamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (que, por otra parte, no son habituales en modelos encoder de este tipo). Tampoco se detalla si se aplicaron innovaciones tecnicas adicionales mas alla del ajuste supervisado sobre pares error-correccion.

Cabe senalar una discrepancia entre la denominacion del modelo ("large") y el numero real de parametros (aproximadamente 126 millones), mas propio de la variante base de RoBERTa que de la large (que ronda los 355 millones). Este dato procede de los pesos publicados en safetensors y es el valor verificado.

## Capacidades

- Prediccion de token enmascarado (fill-mask): dado un texto en cingales con una posicion enmascarada, devuelve las formas mas probables, lo que permite proponer correcciones ortograficas.
- Extraccion de caracteristicas (feature-extraction): genera embeddings contextuales de texto en cingales, utiles como representacion de entrada para clasificadores posteriores.
- Correccion ortografica en cingales: especializado en identificar y corregir errores tipicos de escritura en este idioma.
- Comprension contextual de texto en cingales: al ser un encoder bidireccional, captura dependencias en ambas direcciones dentro de la ventana de contexto.
- Soporte multilingue: no. El modelo esta limitado al cingales (codigo "si").
- Tool calling / function calling: no disponible; no es una capacidad propia de un encoder de fill-mask.
- Uso como agente o razonamiento multi-paso: no disponible; el modelo no incorpora bucle de agente ni modo de razonamiento.
- Otras capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Correccion ortografica en edicion de medios digitales: integrar el modelo como paso de posprocesado en el flujo de publicacion de articulos en cingales, enmascarando tokens candidatos a error y sustituyendolos por la prediccion del modelo antes de publicar.
- Normalizacion de texto de entrada en motores de busqueda en cingales: aplicar las correcciones del modelo a las consultas de los usuarios para mejorar la coincidencia con los documentos indexados, dado que muchas busquedas fallan por erratas.
- Preprocesado de corpus para entrenamiento de otros modelos: usar el modelo para limpiar y homogeneizar grandes volumenes de texto en cingales recolectado de la web antes de emplearlo en el entrenamiento de modelos mayores.
- Atencion al cliente en cingales: corregir de forma automatica los mensajes escritos por usuarios con errores tipograficos antes de que pasen a un sistema de clasificacion de intenciones o a un motor de respuestas.
- Redaccion asistida y correctores en editores de texto: construir un corrector en linea que resalte y sugiera la forma correcta de tokens dudosos mediante las predicciones fill-mask del modelo.
- Enriquecimiento de anotaciones linguisticas: generar embeddings contextuales en cingales para tareas de etiquetado (POS, NER, clasificacion de sentimiento) sirviendose del pipeline de feature-extraction.
- Investigacion academica en PLN de bajos recursos: emplear el modelo como linea base o componente en estudios comparativos de correccion ortografica en cingales, aprovechando que el corpus y los pesos son publicos bajo CC-BY-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas de evaluacion (por ejemplo, exactitud de correccion, F1 sobre el dataset de afinamiento, MMLU, HumanEval o GSM8K), ni se aportan comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente 0,5 GB; en FP16/BF16 aproximadamente 0,25 GB; en INT8 aproximadamente 0,13 GB (estimaciones proporcionales a los 125.978.112 parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas NVIDIA T4, GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo es muy ligero en comparacion con modelos generativos.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU de consumo moderna (RTX 3060 en adelante) e incluso en GPU integradas de gama alta.
- Opciones de despliegue: transformers de HuggingFace (pipeline fill-mask o feature-extraction); servidores de inferencia compatibles con transformers como TGI (text-generation-inference orientado a encoders) o APIs propias. No se documentan versiones GGUF para llama.cpp u Ollama ni se confirma compatibilidad con vLLM en la informacion disponible.
- Latencia y throughput estimados: no disponible; no se aportan datos de rendimiento medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lm-spell/SinBERT-large-ft-ssc | 125.978.112 | no disponible | Correccion ortografica en cingales (fill-mask) | CC-BY-4.0 | Gated en HuggingFace |
| NLPC-UOM/SinBERT-large | no disponible en la informacion | no disponible | Modelo base en cingales (fill-mask, clasificacion) | MIT (segun fuentes) | Publico en HuggingFace |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo comparativo mas directo es su propio modelo base, NLPC-UOM/SinBERT-large, preentrenado sobre sin-cc-15M. La diferencia principal es que lm-spell/SinBERT-large-ft-ssc ha sido afinado para correccion ortografica, mientras que el base es un modelo de proposito general para cingales. No se dispone en la informacion proporcionada de otros modelos alternativos de la misma categoria con datos verificables para comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Idiomatico y monolingue: el modelo solo procesa cingales; no es util para otros idiomas ni para tareas multilingues.
- Riesgo de alucinacion: en una tarea de fill-mask, el modelo puede proponer tokens gramaticalmente plausibles pero semanticamente incorrectos, o "corregir" palabras que ya eran correctas; requiere umbrales de confianza y validacion.
- Sesgos: al entrenarse sobre un corpus extraido de la web (sin-cc-15M), puede heredar sesgos presentes en ese corpus (variedades dialectales, temas sobrerrepresentados, ruido).
- Alcance limitado de la tarea: esta disenado para correccion ortografica y extraccion de caracteristicas; no genera texto libre, no razona y no soporta tool calling ni flujos de agente.
- Longitud de contexto: no se especifica en la ficha; como modelo RoBERTa, es probable que este limitado a secuencias cortas (del orden de 512 tokens), lo que restringe su uso en documentos largos sin fragmentacion.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoria, pero es necesario cumplir las condiciones de atribucion y no imponer restricciones adicionales.
- Acceso restringido: el modelo es gated en HuggingFace, por lo que hay que aceptar las condiciones del autor antes de descargarlo, lo que puede complicar su integracion automatizada en pipelines.
- Adopcion practicamente nula: la ficha muestra 0 descargas y 0 likes, por lo que no existe una comunidad amplia que haya validado su calidad en produccion.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar de antemano la calidad de la correccion, algo critico antes de desplegarlo en un entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lm-spell/SinBERT-large-ft-ssc
- Modelo base NLPC-UOM/SinBERT-large: https://huggingface.co/NLPC-UOM/SinBERT-large
- Modelos afinados sobre SinBERT-large: https://huggingface.co/models?other=base_model:finetune:NLPC-UOM/SinBERT-large
- Paper de referencia (LREC 2022): "BERTifying Sinhala - A Comprehensive Analysis of Pre-trained Language Models for Sinhala Text Classification"
- Ficha en BimAnt: https://zoo.bimant.com/model/6292
- Ficha en AIBase: https://model.aibase.com/models/details/1915687193357795329
- Ficha en PromptLayer: https://www.promptlayer.com/models/sinbert-large/
- Dataset de afinamiento: lm-spell/sinhala-spell-correction-dataset (referenciado en las etiquetas del modelo)
