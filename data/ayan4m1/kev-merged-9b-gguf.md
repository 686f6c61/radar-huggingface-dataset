# ayan4m1/kev-merged-9b-gguf

## Resumen

Kev-9B GGUF es la conversion a formato GGUF del modelo de decision Kev-9B, parte de la familia Kev desarrollada por jaredpalmer. A diferencia de un modelo generativo convencional, Kev es un modelo de decision: recibe preguntas tipadas y devuelve probabilidades calibradas en una unica pasada forward, sin generar texto. Su arquitectura combina un adaptador LoRA (r=16) junto con una cabeza de tipo pointer sobre una base Qwen congelada, lo que lo aleja completamente del paradigma de decodificacion autoregresiva.

Este repositorio concreto, publicado por el usuario ayan4m1, ofrece una version fusionada (merged) y cuantizada a GGUF del modelo de 9B de la familia. La familia Kev incluye actualmente cuatro tamanos: Kev-27B, Kev-9B, Kev-4B y Kev-0.8B, todos ellos construidos bajo el mismo esquema de cabezas de decision sobre bases congeladas. La model card del repositorio esta practicamente vacia (unicamente la declaracion de licencia Apache 2.0), por lo que la mayor parte de la informacion tecnica proviene del repositorio GitHub del proyecto original.

La relevancia de este modelo reside en su propuesta de diseno: sustituir la generacion de texto por la emision de probabilidades calibradas para preguntas tipadas, lo que abre la puerta a aplicaciones de clasificacion, enrutamiento o evaluacion de decisiones con un coste computacional de una sola pasada. Al estar disponible en GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, aunque con las salvedades descritas en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) mas cabeza pointer sobre base Qwen congelada; modelo de decision, no generativo |
| Parametros totales | no disponible (nominalmente 9B por la nomenclatura de la familia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas de cuantizacion no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio -gguf); el modelo original se distribuye como adaptador LoRA mas cabeza pointer |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Kev, descrita en su repositorio GitHub como un conjunto de modelos de decision construidos sobre una base Qwen congelada. Cada variante se compone de un adaptador LoRA de rango 16 y una cabeza de tipo pointer que se anade sobre la base congelada. La inferencia se realiza en una unica pasada forward: no hay decodificacion autoregresiva ni generacion de tokens de texto. La entrada son preguntas tipadas (typed questions) y la salida son probabilidades calibradas.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se especifica cual es la base Qwen exacta utilizada para la variante de 9B ni el procedimiento de fusion aplicado en esta conversion GGUF concreta. El proyecto menciona que los numeros de precision publicados corresponden a evaluacion en fp32, y no a la ruta de servicio en bf16, lo que constituye una diferencia relevante entre el entorno de evaluacion y el de despliegue. El repositorio de releases indica que cada version mantiene unicamente la mejor version actual de cada tamano, quedando las anteriores en el Hub.

## Capacidades

- Respuesta a preguntas tipadas con salida de probabilidades calibradas, en una sola pasada forward.
- Calibracion de confianza: el modelo reporta con que frecuencia responde con al menos 0.9 de confianza en registros considerados "incognoscibles" (unknowable), dato reportado como 0% para Kev-9B.
- No genera texto: no hay salida en lenguaje natural, sino distribuciones de probabilidad sobre las opciones de la pregunta tipada.
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Enrutamiento de consultas: dado un conjunto de categorias predefinidas, el modelo puede asignar una probabilidad calibrada a cada una y permitir que un sistema de orquestacion decida el flujo mas adecuado sin coste de generacion de texto.
- Clasificacion con umbral de confianza: al devolver probabilidades, permite descartar automaticamente las predicciones por debajo de un umbral y derivar esos casos a revision humana o a un modelo mayor.
- Deteccion de preguntas fuera de dominio: el comportamiento reportado ante registros "incognoscibles" (0% de respuestas con confianza superior a 0.9 en Kev-9B) es util para filtrar entradas que el sistema no puede resolver.
- Evaluacion de decisiones automatizada: en pipelines donde se compara el resultado de varios modelos, la salida probabilistica binaria o categorica permite calcular metricas de calibracion y comparar ejecuciones con intervalos de confianza bootstrap pareados.
- Moderacion o triaje de contenido: como clasificador de una sola pasada, puede puntuar probabilidades sobre categorias previamente definidas con una latencia inferior a la de un modelo generativo equivalente.
- Investigacion en calibracion: dado que el proyecto publica comparativas entre modelos de la misma familia, este modelo sirve como punto de referencia para estudiar la calibracion de probabilidades en cabezas de decision sobre bases congeladas.
- Despliegue local en hardware de consumo: gracias al formato GGUF, puede ejecutarse en equipos sin GPU de datacenter para tareas de clasificacion o decision en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

El unico dato cuantitativo localizado en la busqueda web procede del repositorio GitHub del proyecto y se refiere a la fiabilidad de la calibracion, no a tareas generativas:

| Metrica | Kev-9B | Jev |
|---|---|---|
| Respuestas con confianza >= 0.9 en registros "incognoscibles" | 0% | 9% |

Se indica ademas que los numeros de precision publicados emplean evaluacion en fp32, no la ruta de servicio en bf16. No se dispone de datos de rendimiento especificos para esta conversion GGUF concreta.

## Requisitos de hardware

Las siguientes estimaciones de VRAM se derivan del tamano nominal de 9B parametros y de las cuantizaciones GGUF habituales; no proceden de documentacion oficial del repositorio.

- VRAM estimada para inferencia (9B parametros):
  - f16/bf16: aproximadamente 18-20 GB.
  - Q8_0: aproximadamente 9-10 GB.
  - Q6_K: aproximadamente 7,5-8 GB.
  - Q5_K_M: aproximadamente 6,5-7 GB.
  - Q4_K_M: aproximadamente 5,5-6 GB.
  - Q3_K_M: aproximadamente 4,5-5 GB.
  - Q2_K: aproximadamente 3,5-4 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para fp16/bf16; RTX 4090 o RTX 3090 (24 GB) para cualquier cuantizacion; RTX 4080 / 4070 Ti Super (16 GB) hasta Q8_0; RTX 4070 / 3060 (12 GB) hasta Q5/Q4.
- ¿Cabe en GPU de consumo? Si, en formato GGUF cuantizado. Una RTX 3060 de 12 GB puede ejecutar variantes Q4_K_M o Q5_K_M; una RTX 4060 Ti de 16 GB admite hasta Q8_0.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF. No se documenta soporte especifico para vLLM o TGI en el repositorio, y al tratarse de un modelo de decision con cabeza pointer, el soporte en runtimes de generacion de texto estandar no esta garantizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa mas directa es dentro de la propia familia Kev y frente a Jev, segun la informacion recogida del repositorio del proyecto. No se dispone de datos de modelos comparables externos.

| Modelo | Parametros | Tipo | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kev-9B (este repositorio, GGUF) | 9B (nominal) | Modelo de decision (LoRA r=16 + pointer head) | no disponible | apache-2.0 | GGUF | Conversion comunitaria por ayan4m1 |
| Kev-27B | 27B (nominal) | Modelo de decision | no disponible | apache-2.0 (segun familia) | LoRA + pointer head | Version mayor de la familia |
| Kev-4B | 4B (nominal) | Modelo de decision | no disponible | apache-2.0 (segun familia) | LoRA + pointer head | Version reducida |
| Kev-0.8B | 0,8B (nominal) | Modelo de decision | no disponible | apache-2.0 (segun familia) | LoRA + pointer head | Version minima |
| Jev | no disponible | Modelo de decision | no disponible | no disponible | no disponible | 9% de respuestas con confianza >= 0.9 en registros incognoscibles |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Model card practicamente vacia: el repositorio solo incluye la declaracion de licencia Apache 2.0, sin documentacion tecnica, instrucciones de uso ni detalles de entrenamiento.
- Modelo no generativo: no produce texto. Cualquier integracion debe adaptarse a la salida de probabilidades y a la interfaz de preguntas tipadas, no a una API de generacion convencional.
- Ruta de servicio frente a evaluacion: los numeros de precision publicados usan fp32, mientras que el servicio se realiza en bf16. Los resultados pueden diferir entre ambos entornos.
- Incertidumbre sobre la conversion GGUF: al tratarse de una fusion y cuantizacion de un modelo con cabeza pointer, no esta garantizado que el comportamiento probabilista se preserve integramente en el formato GGUF ni que sea compatible con todos los runtimes.
- Sin datos de sesgos: no se ha publicado ninguna evaluacion de sesgos ni de comportamiento en dominios sensibles.
- Riesgo de calibracion excesiva: el dato reportado sobre registros "incognoscibles" sugiere una politica conservadora de confianza, pero no hay informacion sobre falsos negativos o sobre el rendimiento en dominios conocidos.
- Idiomas no documentados: se desconoce si el modelo funciona fuera del ingles, idioma habitual en este tipo de conjuntos de preguntas tipadas.
- Contexto no documentado: se desconoce la longitud maxima de entrada soportada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de una base Qwen congelada conviene verificar las condiciones de la licencia de dicha base original.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion comunitaria ni informes de uso en produccion.
- Fecha de creacion del repositorio registrada como 2026-09-30, dato que conviene contrastar con la cronologia del proyecto original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ayan4m1/kev-merged-9b-gguf
- Repositorio GitHub del proyecto Kev: https://github.com/jaredpalmer/kev
- Releases del proyecto Kev: https://github.com/jaredpalmer/kev/releases
- Conversion GGUF alternativa de Kev-9B: https://huggingface.co/taigrr/kev-9b-gguf
- Explorador de modelos GGUF: https://local-ai-zone.github.io/
- Modelos GGUF en Hugging Face: https://huggingface.co/models?library=gguf&sort=trending
