# bgg1996/Melirrhoe-Ornith-35B-A3B-VL-NVFP4-FP8-GGUF

## Resumen

Melirrhoe-Ornith-35B-A3B-VL-NVFP4-FP8-GGUF es una distribucion cuantizada en formato GGUF publicada por el usuario bgg1996 sobre un modelo de la familia Ornith, segun indica el propio nombre del repositorio. El identificador apunta a una arquitectura de tipo Mixture-of-Experts con 35.505.312.896 parametros totales (unos 35,5B) y aproximadamente 3B parametros activos por token, una configuracion que la documentacion publica de Ornith describe como orientada a aplicaciones agente de alto throughput. La etiqueta "VL" sugiere capacidades de vision-lenguaje, aunque el repositorio no aporta confirmacion explicita de ello.

El modelo base pertenece a la familia Ornith, desarrollada por ornith-ai, que en su version 1.5 se presenta como un sistema de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. La familia cubre variantes de 397B MoE, 35B MoE y 9B, siendo esta ficha relativa al tramo de 35B.

La relevancia de esta publicacion concreta reside en su formato de pesos: una mezcla de cuantizaciones NVFP4 y FP8 empaquetada en GGUF, con un tamano de repositorio de 24,3 GB, lo que la hace candidata para despliegue en hardware de gama alta de consumo o en una sola GPU profesional. Se distribuye bajo licencia MIT. El repositorio no incluye model card tecnica, datos de entrenamiento, idiomas soportados ni resultados de benchmarks, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) segun la familia Ornith; no confirmado en la model card de este repositorio |
| Parametros totales | 35.505.312.896 (aproximadamente 35,5B) |
| Parametros activos | Aproximadamente 3B por token (dato heredado de la descripcion de Ornith 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y FP8 (segun el nombre del repositorio y la etiqueta gguf) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamano del repositorio | 24,3 GB |
| Pipeline declarado | no disponible |
| Etiquetas | gguf, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La arquitectura de la familia Ornith se describe como Mixture-of-Experts con enrutamiento disperso: de los aproximadamente 35,5B parametros totales, solo alrededor de 3B se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano total. Ornith se presenta como una familia de modelos abiertos orientados a tareas agente, y su version 1.5 extiende el marco de "self-scaffolding" de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone tareas nuevas, genera andamiajes especificos y produce rollouts de soluciones que se emplean para aprendizaje por refuerzo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas concretas de alineacion como RLHF o DPO en esta variante especifica. Tampoco hay datos sobre innovaciones de inferencia (decodificacion especulativa, atencion lineal u otras) ni sobre el proceso de cuantizacion exacto aplicado por bgg1996. La model card del repositorio se limita a declarar la licencia MIT, sin detallar la receta de cuantizacion ni el modelo base exacto sobre el que se ha generado el GGUF.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta "conversational", lo que indica uso previsto para dialogos.
- Razonamiento y tareas agente: la familia Ornith se describe como orientada a tareas agente, con soporte de andamiajes y rollouts de soluciones en el marco de auto-mejora.
- Capacidades de vision-lenguaje: la etiqueta "VL" en el nombre sugiere soporte multimodal, pero no esta confirmada en la informacion disponible.
- Tool calling / function calling: no confirmado explicitamente en el repositorio; presumible por la orientacion agente de la familia, pero no verificable con los datos aportados.
- Razonamiento multi-paso y agentes: coherente con la descripcion de la familia Ornith, aunque sin detalle en esta ficha.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Asistentes conversacionales de proposito general: con 35,5B parametros totales y ~3B activos, el modelo puede atender dialogos multi-turno con un coste de inferencia contenido, adecuado para servicios con muchos usuarios concurrentes.
- Agentes autonomos multi-paso: la orientacion agente de la familia Ornith y su marco de andamiajes lo hacen util para tareas que requieren descomposicion, planificacion y ejecucion encadenada.
- Procesamiento de lenguaje natural en produccion con requisitos de coste: al estar cuantizado en NVFP4/FP8 y empaquetado en 24,3 GB, permite servir un modelo de 35B en una unica GPU de gama alta, reduciendo el coste por token frente a despliegues densos equivalentes.
- Despliegue en hardware de gama alta de consumo: el tamano del repositorio sugiere viabilidad en GPUs de consumo con suficiente VRAM, util para prototipado e investigacion local.
- Evaluacion y benchmarking interno de modelos MoE: sirve como punto de comparacion frente a otras variantes de la familia Ornith (1.0-35B, 1.5-397B) en pipelines de evaluacion propios.
- Fine-tuning o adaptacion posterior a partir del GGUF: aunque GGUF esta orientado a inferencia, el modelo puede servir como referencia para comparar el comportamiento del formato cuantizado frente a los pesos originales.
- Analisis multimodal, si se confirma la componente "VL": tareas de descripcion de imagenes o razonamiento sobre contenido visual, pendientes de validacion por falta de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 24,3 GB, por lo que se necesita al menos esa cantidad de VRAM mas margen para el contexto y las estructuras de atencion (estimacion orientativa: 26-32 GB segun longitud de contexto).
- GPU recomendadas: una GPU profesional con 40-48 GB (A100 40GB, L40S, A6000) o 80 GB (A100 80GB, H100) permite ejecutar el modelo con contexto amplio y holgura. En gama de consumo, una RTX 4090 (24 GB) o RTX 5090 puede quedar al limite o requerir offload parcial.
- Viabilidad en GPU de consumo: posible en tarjetas con 24 GB o mas, pero con riesgo de no caber junto con cache KV a contextos largos; en GPUs de 16 GB o menos seria necesario descargar capas a RAM o disco.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan convertir a safetensors u otro formato.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con ~3B parametros activos, cabria esperar un throughput alto, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Melirrhoe-Ornith-35B-A3B-VL-NVFP4-FP8-GGUF | 35,5B | ~3B | GGUF (NVFP4/FP8) | MIT | Esta ficha; cuantizacion de comunidad |
| ornith-ai/Ornith-1.5-35B-A3B | 35B | ~3B | no disponible | no disponible | Modelo base probable de la familia Ornith 1.5 |
| ornith-ai/Ornith-1.0-35B | 35B | no disponible | no disponible | no disponible | Generacion anterior de la familia |
| ornith-ai/Ornith-1.5-397B | 397B | no disponible | no disponible | no disponible | Variante de mayor escala de la misma familia |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de model card: el repositorio no documenta el dataset de entrenamiento, los idiomas soportados ni el proceso de cuantizacion, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan evaluaciones de fiabilidad.
- Sesgos conocidos: no disponibles; se desconoce la composicion del corpus de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que no puede garantizarse el rendimiento en contextos largos.
- Idiomas: no se declara soporte multilingue; se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del ingles.
- Incertidumbre sobre la componente multimodal: la etiqueta "VL" no esta confirmada y podria referirse a otro aspecto del modelo.
- Licencia: MIT, permisiva para uso comercial, pero la atribucion de la licencia corresponde al autor del repositorio de cuantizacion y podria no reflejar la del modelo base original.
- Naturaleza del artefacto: es una cuantizacion de comunidad (NVFP4/FP8 en GGUF), con posible perdida de precision frente a los pesos originales; conviene validar calidad antes de usar en produccion.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia publica de uso ni validacion por terceros.
- Compatibilidad: al ser GGUF, no es directamente desplegable en stacks que requieren safetensors (vLLM, TGI) sin conversion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bgg1996/Melirrhoe-Ornith-35B-A3B-VL-NVFP4-FP8-GGUF
- Ornith-1.0-35B en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Ornith-1.5-35B-A3B en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Sitio oficial de Ornith AI: https://ornith.ai/
- Repositorio GitHub de Ornith: https://github.com/ornith-ai/Ornith-1
- Documentacion de variantes y checkpoints (DeepWiki): https://deepwiki.com/ornith-ai/Ornith-1/2-model-variants-and-checkpoints
