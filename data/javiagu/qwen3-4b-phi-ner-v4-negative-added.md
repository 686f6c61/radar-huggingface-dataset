# javiagu/qwen3-4b-phi-ner-v4-negative-added

## Resumen

`javiagu/qwen3-4b-phi-ner-v4-negative-added` es un ajuste fino (fine-tuning) del modelo base Qwen3-4B, publicado por el usuario javiagu en Hugging Face. El nombre del repositorio indica que se trata de un modelo especializado en reconocimiento de entidades nombradas (NER, Named Entity Recognition) sobre texto en el ambito biomedico o clinico, dado el sufijo "phi" (probablemente en referencia a las anotaciones del corpus PHI, Protected Health Information, o a un dataset de dominio sanitario). La coletilla "negative-added" sugiere que el conjunto de entrenamiento se ha ampliado con ejemplos negativos para reducir falsos positivos en la deteccion de entidades.

El modelo se distribuye unicamente en formato safetensors, con un tamano de repositorio de 16,1 GB, lo que es coherente con un modelo de aproximadamente 4 mil millones de parametros en precision completa (bf16/fp16). El campo de parametros totales reportado por la plataforma (196.096) no es consistente con un modelo de 4B y debe interpretarse como un dato de configuracion del repo mas que como el numero real de parametros del modelo.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho, con 25 descargas y sin documentacion tecnica publicada (sin model card, sin licencia declarada, sin idiomas declarados y sin pipeline especificado). Aun asi, resulta util para desarrolladores que necesiten un extractor de entidades sobre texto clinico y quieran evaluar un ajuste fino ligero sobre Qwen3-4B. La informacion disponible es escasa y muchos campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags del repo) |
| Parametros totales | no disponible (el repo declara 196.096, incoherente con un modelo de 4B; el nombre indica 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, valor no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su pertenencia a la familia Qwen3 (tag `qwen3`), lo que implica un transformer decoder-only con atencion causal estandar. El ajuste fino parte de Qwen3-4B, un modelo denso de aproximadamente 4 mil millones de parametros. No se especifica si se ha aplicado atencion lineal, decodificacion especulativa ni ninguna otra innovacion sobre el modelo base.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se ha utilizado RLHF, DPO o simplemente supervised fine-tuning (SFT) sobre pares etiquetados de entidades. El sufijo "negative-added" sugiere una ampliacion del conjunto con ejemplos negativos (fragmentos sin entidades) para mejorar la precision del clasificador, pero esta es una inferencia a partir del nombre y no un dato confirmado. No hay informacion sobre el esquema de etiquetas NER empleado (BIO, BILOU, etc.) ni sobre el dominio exacto de las entidades.

## Capacidades

- Extraccion de entidades nombradas (NER): el modelo esta ajustado para identificar y clasificar entidades en texto, presumiblemente en el dominio sanitario o biomedico segun el sufijo "phi".
- Reduccion de falsos positivos: la incorporacion de ejemplos negativos en el entrenamiento apunta a una mejora en la deteccion de fragmentos sin entidades.
- Generacion de texto: hereda la capacidad generativa de Qwen3-4B, aunque no se documenta su calidad tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Anonimizacion de historiales clinicos: el modelo puede usarse para detectar nombres de pacientes, fechas, numeros de historia o direcciones (entidades PHI) y sustituirlas antes de compartir documentos, reduciendo el riesgo de fuga de datos personales.
- Extraccion de entidades en informes medicos: identificar diagnosticos, medicamentos, dosis y procedimientos en texto libre para poblar bases de datos estructuradas o sistemas de codificacion (CIE-10, SNOMED).
- Preprocesamiento para pipelines de NLP clinico: servir como primer paso de un pipeline que alimente tareas posteriores como resolucion de entidades, relation extraction o clasificacion documental.
- Enriquecimiento de historias electronicas de salud: etiquetar automaticamente entidades en registros para busquedas facetadas y sistemas de alerta clinica.
- Deteccion de informacion sensible en correos y formularios: aplicar el modelo a texto administrativo para localizar datos identificativos antes de su envio a terceros.
- Evaluacion comparativa de ajustes finos NER: utilizar el modelo como baseline ligero (4B) frente a modelos mayores en tareas de extraccion de entidades, gracias a su tamano manejable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8-10 GB para un modelo de 4B, mas el overhead de cache KV (valor estimado, no confirmado en la informacion).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB (estimacion, no confirmada).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB (estimacion, no confirmada; no hay GGUF publicado en el repo).
- GPU recomendadas: no documentadas. Por tamano, cabria en RTX 3090, RTX 4090, A100 y H100; en consumer GPU de 8 GB requeriria cuantizacion.
- Opciones de despliegue: no documentadas. Al distribuirse solo en safetensors, seria necesario convertirlo a GGUF para llama.cpp/Ollama o cargarlo con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| javiagu/qwen3-4b-phi-ner-v4-negative-added | ~4B (segun nombre) | no disponible | no disponible | Hugging Face (safetensors) | Ajuste fino NER, sin model card |
| Qwen3-4B (base) | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base generico del que deriva |
| Modelos NER especializados (p. ej. BioBERT, PubMedBERT) | 110M-340M | 512 tokens tipicamente | variable | Hugging Face | Encoders especializados en dominio biomedico; menor coste, sin generacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentacion sobre datos de entrenamiento, esquema de etiquetas ni metricas, lo que impide validar su calidad de forma rigurosa.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo legal relevante para produccion.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o solo en el idioma de entrenamiento (probablemente ingles).
- Riesgo de alucinacion: al ser un modelo generativo ajustado para NER, puede generar entidades inexistentes o etiquetas fuera del esquema si no se restringe la decodificacion.
- Dominio limitado: el ajuste parece orientado a texto sanitario/PHI; su comportamiento fuera de ese dominio es incierto.
- Datos de parametros incoherentes en el repo (196.096 frente a 4B esperado), lo que sugiere configuracion incompleta o erronea.
- Baja adopcion (25 descargas, 0 likes): sin validacion por parte de la comunidad.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en entornos con poca VRAM requiere conversion manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/javiagu/qwen3-4b-phi-ner-v4-negative-added
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
