# LSW142857/OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged

## Resumen

El modelo `OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged` es un checkpoint público y completamente fusionado de un experimento de fine-tuning sobre la base Qwen3.5-9B, desarrollado por LSW142857 (shiwei liu). Se trata de un modelo multimodal (imagen y texto) que integra los pesos de una inicialización experta SFT, una actualización LoRA de rango 64 y alpha 128, una actualización LoRA para MTP (Multi-Token Prediction) y tensores full-MTP entrenados directamente. El resultado es un modelo listo para cargar sin necesidad de pasos adicionales de fusión.

El interés de este checkpoint radica en que documenta un proceso de entrenamiento OPSD (Online Preference Self-Improvement) con 32 iteraciones y 1024 filas de datos, ejecutado en 8×A6000. Al estar fusionado, puede usarse directamente con `transformers` para inferencia o evaluación, y su configuración de rollout recomendada incluye contexto de 131072 tokens, temperatura 0.6, top-p 0.95 y decodificación especulativa EAGLE 3. Es relevante para investigadores que quieran estudiar los efectos de OPSD con LoRA y MTP en un modelo de 9B multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-9B |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131072 (recomendado por el autor; el base Qwen3.5-9B soporta 262144) |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso multimodal que procesa tanto texto como imágenes. Sobre esta base se aplicó un proceso OPSD (Online Preference Self-Improvement) con configuración `trailing_user` y `Medium PI`, que consistió en 32 actualizaciones (iteración 31) sobre 1024 filas de datos. El entrenamiento combinó una LoRA de rango 64 y alpha 128 para el modelo principal, una LoRA adicional para los módulos MTP, y tensores full-MTP entrenados directamente. La fusión final se realizó en CPU con factor de escala `alpha/rank = 2.0`, verificando que los 775 tensores de salida coincidieran exactamente con los valores esperados.

No se proporcionan detalles sobre el dataset de entrenamiento, la composición de los datos ni si se usaron técnicas como RLHF o DPO. El autor indica que el PI fue teacher-only durante el entrenamiento, por lo que no debe añadirse Medium PI al evaluar el modelo estudiante.

## Capacidades

- Generacion de texto y codigo: al estar basado en Qwen3.5-9B, hereda capacidades de generacion de texto, razonamiento y programacion.
- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), permitiendo tareas como descripcion de imagenes o respuesta a preguntas visuales.
- MTP (Multi-Token Prediction): el modelo incluye cabezas MTP entrenadas, lo que permite predecir multiples tokens a la vez y acelerar la inferencia.
- Compatibilidad con EAGLE 3: la configuracion recomendada usa EAGLE 3/1/4 con page size 64, un metodo de decodificacion especulativa que reduce la latencia.
- Contexto largo: soporta al menos 131072 tokens de contexto, adecuado para documentos extensos o conversaciones multi-turno.
- Conversacional: etiquetado como `conversational`, apto para chatbots y asistentes.

## Casos de uso

- Asistente de codigo con contexto amplio: gracias a su ventana de 131072 tokens, puede analizar repositorios completos o multiples archivos para generar o refactorizar codigo, manteniendo el contexto de todo el proyecto.
- Analisis de imagenes con generacion de informes: al ser multimodal, puede recibir capturas de pantalla o diagramas y producir descripciones tecnicas o resumenes, util en documentacion automatica.
- Chat conversacional de larga duracion: su contexto extendido permite mantener conversaciones con historial muy largo sin perder informacion relevante, adecuado para atencion al cliente o asistentes personales.
- Evaluacion de modelos de razonamiento: investigadores pueden usar este checkpoint para estudiar el impacto de OPSD en tareas de razonamiento, comparando con el modelo base.
- Prototipado rapido de agentes: al ser compatible con `transformers` y cargarse directamente, se puede integrar en pipelines de agentes que requieran comprension de imagenes y texto.
- Generacion de documentacion tecnica: puede procesar imagenes de diagramas o esquemas y generar explicaciones textuales detalladas, ahorrando tiempo en tareas de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las 1024 filas de entrenamiento no deben usarse como conjunto de evaluacion, y recomienda usar tareas held-out, pero no proporciona metricas concretas.

## Requisitos de hardware

- VRAM estimada: el repo pesa 19.3 GB, lo que sugiere pesos en BF16. Para inferencia en BF16 se necesitan al menos 20 GB de VRAM, por lo que una GPU como RTX 4090 (24 GB) podria ser suficiente, aunque ajustada.
- GPU recomendadas: el entrenamiento se realizo en 8×A6000 (48 GB cada una). Para inferencia, GPUs con 24 GB o mas (A100, RTX 4090, L40S) son adecuadas.
- En consumer GPU: una RTX 4090 puede ejecutar el modelo en BF16, pero con margen limitado. Para GPUs de 16 GB (como RTX 4080) seria necesario cuantizar, aunque no se ofrecen versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, TGI o directamente con `AutoModelForCausalLM`. Tambien es compatible con `endpoints_compatible` segun las etiquetas.
- Latencia y throughput: no se proporcionan datos. La inclusion de MTP y la compatibilidad con EAGLE 3 sugieren una inferencia mas rapida que un modelo denso equivalente, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A nivel de especificaciones, se puede comparar con el modelo base Qwen3.5-9B y con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| OPSD-PI-Qwen3.5-9B (este) | 9,65B | 131072 (recomendado) | Si | no disponible |
| Qwen3.5-9B (base) | ~9B | 262144 | Si | Apache 2.0 (segun versiones anteriores) |
| Llama 3.1 8B | 8B | 131072 | No | Llama 3.1 Community License |
| Mistral 7B | 7B | 32768 | No | Apache 2.0 |

La principal diferencia es que este checkpoint es un fine-tuning experimental con OPSD y MTP, mientras que los otros son modelos base o instruct. No hay datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribucion. Se debe contactar al autor antes de usar en produccion.
- Sesgos y alucinaciones: al ser un fine-tuning sobre un modelo base, puede heredar sesgos de los datos de entrenamiento originales y del proceso OPSD. No se han publicado evaluaciones de sesgo.
- Datos de entrenamiento limitados: el entrenamiento se realizo sobre 1024 filas, un conjunto pequeno que puede no generalizar bien a dominios fuera de esos datos.
- Configuracion especifica: el autor recomienda parametros de rollout concretos (temperatura 0.6, top-p 0.95, top-k 20, EAGLE 3/1/4). Usar otros valores puede degradar el rendimiento.
- No usar Medium PI en evaluacion: el PI fue teacher-only, por lo que anadir Medium PI al evaluar el modelo estudiante invalidaria los resultados.
- Contexto maximo no confirmado: aunque se recomienda 131072, no se confirma si el modelo soporta mas alla de ese valor. El base soporta 262144, pero el fine-tuning podria haber alterado esa capacidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LSW142857/OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged
- Commit del bundle de adaptadores y full-MTP: https://huggingface.co/LSW142857/OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000/commit/8811105a0183d661bfda40a01c43d6af8864820a
- Perfil del autor: https://huggingface.co/LSW142857
- Checkpoint intermedio ckpt15: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt15
- Checkpoint intermedio ckpt23: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-PI-Medium-ckpt23
- Comparativa de modelos Qwen3.5 9B en Artificial Analysis: https://artificialanalysis.ai/models/releases/qwen3-5-9b
- Ficha de Qwen3.5-9B en pi.dev: https://pi.dev/models/huggingface/qwen-qwen3-5-9b
