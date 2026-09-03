# jjjlimaus/chrono-2019-cpt13b-leak-diverse

## Resumen

El modelo `jjjlimaus/chrono-2019-cpt13b-leak-diverse` es un checkpoint alojado en HuggingFace por el usuario `jjjlimaus`, con fecha de creación de septiembre de 2026. A pesar de su nombre, que sugiere una arquitectura de 13 000 millones de parámetros (la parte "cpt13b"), los pesos reales en formato safetensors suman 2 018 511 234 parámetros, es decir, aproximadamente 2 000 millones. El repositorio ocupa 460,2 GB, un tamaño desproporcionado para esa cantidad de parámetros, lo que sugiere la presencia de múltiples archivos, posiblemente en distintas cuantizaciones o con duplicados, aunque no se dispone de un desglose oficial.

El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace. No se ha publicado información sobre licencia, idiomas soportados, arquitectura interna, datos de entrenamiento ni benchmarks. La búsqueda web no ha devuelto resultados relevantes; los enlaces encontrados corresponden a servicios de correo de Orange, sin relación aparente con el modelo. Por tanto, esta ficha se basa únicamente en los metadatos del repositorio y en la imposibilidad de verificar cualquier característica técnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2 018 511 234 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamaño del repo sugiere posibles variantes, pero no se confirma) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los metadatos) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo. El nombre "chrono-2019-cpt13b-leak-diverse" podría aludir a un modelo de tipo "CPT" (posiblemente "Chinese Pretrained Transformer" o similar), pero no hay evidencia que lo confirme. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El tag `sn38-nanochrono` sugiere una posible relación con una familia "nanochrono", pero no se ha encontrado documentación al respecto. En resumen, la arquitectura y el proceso de entrenamiento son desconocidos.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. No se puede confirmar si genera texto, razona, escribe código, soporta tool calling o tiene capacidades multimodales. Dado el nombre y el tamaño de parámetros (2B), podría tratarse de un modelo de lenguaje de propósito general, pero es una especulación sin base. Se recomienda no asumir ninguna capacidad sin una evaluación directa.

## Casos de uso

Al no existir información pública sobre el comportamiento del modelo, no es posible proponer casos de uso concretos y fiables. Cualquier aplicación práctica requeriría primero una evaluación local del modelo, previa aceptación de las condiciones de acceso. Hasta entonces, no se recomienda su uso en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada. Tampoco se han comparado sus métricas con modelos similares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El tamaño de parámetros (2B) sugiere que podría ejecutarse en GPUs de consumo medio (por ejemplo, una RTX 3060 con 12 GB de VRAM en cuantización de 8 bits), pero el tamaño del repositorio (460 GB) indica que podría haber archivos de gran tamaño, quizás en precisión completa o con múltiples versiones. Sin conocer la arquitectura ni las cuantizaciones disponibles, no es posible estimar la VRAM necesaria ni recomendar GPUs específicas. Tampoco se conocen opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia o con características similares, y no hay datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que se requiere aceptar condiciones en HuggingFace antes de poder descargarlo.
- Licencia ausente: no se especifica ninguna licencia, lo que impide conocer los términos de uso comercial o de redistribución.
- Información técnica insuficiente: se desconocen arquitectura, datos de entrenamiento, contexto, idiomas y capacidades, lo que impide evaluar su idoneidad para cualquier tarea.
- Riesgo de alucinación y sesgos: al no haber documentación, no se puede valorar el riesgo de generar contenido falso o sesgado.
- Tamaño del repositorio desproporcionado: 460 GB para 2B parámetros sugiere posibles archivos duplicados o cuantizaciones múltiples, lo que puede complicar la descarga y el almacenamiento.
- Fecha de creación futura: el modelo está fechado en septiembre de 2026, lo que podría indicar un error en los metadatos o un repositorio experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jjjlimaus/chrono-2019-cpt13b-leak-diverse

No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
