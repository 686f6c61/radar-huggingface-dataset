# d4rkninja/tanpo-product

## Resumen

tanpo-product es un ajuste fino (fine-tune) del modelo unsloth/LFM2.5-1.2B-Instruct, publicado por el usuario d4rkninja bajo la marca DarkNinja Solutions y la comunidad DarkLab. Se trata de un modelo de generacion de texto de 1.170.340.608 parametros, orientado especificamente a tareas de producto y direccion: hojas de ruta (roadmap), descubrimiento de producto (discovery), estrategia de precios y definicion de OKRs. El repositorio se distribuye con la libreria transformers, formato safetensors y el tag peft, lo que indica que el ajuste se realizo mediante tecnicas de adaptacion eficiente de parametros sobre el modelo base.

El modelo hereda la familia LFM2 (Liquid Foundation Models) del modelo base, una linea de modelos compactos disenada para inferencia eficiente. Con 1,17 mil millones de parametros, el modelo esta pensado para escenarios donde el coste de inferencia y el despliegue en hardware modesto son criterios prioritarios, y donde se requiere un comportamiento especializado en un dominio vertical concreto en lugar de conocimiento generalista.

La relevancia actual de este modelo es acotada y muy especifica: es un ejemplo de fine-tune de dominio sobre un modelo pequeno, con distribucion en tres formatos (pesos completos en safetensors, adaptadores LoRA y cuantizaciones GGUF). No dispone de adopcion en la comunidad en el momento de la consulta (0 descargas y 0 likes), y el unico dato de rendimiento publicado es una evaluacion propia del autor mediante rubrica automatica, no una evaluacion de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada del modelo base LFM2.5-1.2B-Instruct (familia LFM2, Liquid AI); detalles concretos de la arquitectura interna no disponibles en la informacion proporcionada |
| Parametros totales | 1.170.340.608 parametros |
| Parametros activos | No aplica (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio principal; el repositorio GGUF asociado recomienda Q4_K_M entre las cuantizaciones disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar; condiciones concretas no detalladas en la informacion proporcionada) |
| Formato de pesos | safetensors (repositorio principal); GGUF en repositorio separado; adaptadores LoRA en repositorio separado |

Datos adicionales: tamano del repositorio 2,3 GB, pipeline text-generation, biblioteca transformers, repo compatible con endpoints, region US.

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/LFM2.5-1.2B-Instruct. El tag `peft` en el repositorio indica que el ajuste se realizo mediante adaptadores de parametros eficientes (LoRA u otra variante compatible con PEFT), partiendo de los pesos del modelo base. El repositorio principal contiene safetensors con 1.170.340.608 parametros y un tamano de 2,3 GB, cifra coherente con pesos almacenados en precision de 16 bits; no se especifica si se trata de los pesos fusionados (merged) o de otro artefacto. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

La especializacion declarada es el dominio de producto y direccion ejecutiva: tareas de roadmap, discovery, precios y OKRs. Ademas del repositorio principal, el autor publica un repositorio de adaptadores LoRA (d4rkninja/tanpo-product-LoRA) y un repositorio de cuantizaciones GGUF (d4rkninja/tanpo-product-GGUF), lo que facilita tanto la inspeccion del adaptador como el despliegue en entornos de inferencia local. No se documentan innovaciones tecnicas propias mas alla del ajuste supervisado de dominio.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base.
- Tareas de producto: elaboracion de hojas de ruta, priorizacion de funcionalidades y definicion de criterios de aceptacion.
- Descubrimiento de producto: formulacion de hipotesis, diseno de entrevistas con usuarios y sintesis de hallazgos.
- Estrategia de precios: planteamiento de modelos de monetizacion, segmentacion y analisis de planes.
- Definicion y redaccion de OKRs y metricas asociadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Redaccion de documentos de producto: generacion de PRDs, especificaciones funcionales y criterios de aceptacion a partir de un brief breve, aprovechando el ajuste de dominio sobre vocabulario de producto.
- Planificacion de roadmap trimestral: conversion de una lista de iniciativas y restricciones de equipo en una hoja de ruta priorizada con dependencias y justificacion del orden.
- Definicion de OKRs de equipo: transformar objetivos anuales en resultados clave medibles, con propuesta de metrica, valor de partida y umbral de exito.
- Soporte a entrevistas de descubrimiento: generacion de guiones de entrevista con usuarios, preguntas abiertas y criterios de sintesis posterior.
- Analisis de precios y empaquetado: exploracion de escenarios de planes, limites de uso y comparativas frente a competidores descritos en el prompt.
- Asistente interno para equipos de producto: despliegue local en un LLM de 1,17 B parametros para responder consultas recurrentes sobre metodologia, marcos de priorizacion o plantillas de documentacion.
- Generacion de borradores en entornos con recursos limitados: al caber en GPU de gama de entrada o incluso en CPU con cuantizacion GGUF, permite prototipar funciones de generacion textual sin coste de API.
- Ajuste adicional sobre dominio propio: el adaptador LoRA publicado sirve como punto de partida para fine-tunes posteriores en nichos adyacentes (finanzas de producto, producto B2B, producto regulado).

## Benchmarks y rendimiento

El autor publica una evaluacion de dominio propia basada en rubrica estricta sobre 20 tareas, no una evaluacion de terceros. Los resultados son los siguientes:

| Metrica | Valor | Notas |
|---|---|---|
| Rubrica global (overall) | 89,0 % | 20 tareas de dominio producto/CEO, rubrica automatica |
| Calidad heuristica (escala 0-10) | 6,94 | Evaluacion heuristica automatica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que la rubrica automatizada no equivale a preferencia humana, por lo que estos valores deben interpretarse como una senal interna de ajuste al dominio y no como una medida comparable con evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1.170.340.608 parametros; no son cifras publicadas por el autor):
  - fp16/bf16: aproximadamente 2,4 GB solo de pesos, mas overhead de contexto y cache KV.
  - int8: aproximadamente 1,2 GB de pesos.
  - Q4_K_M (GGUF): aproximadamente 0,75-0,8 GB de pesos.
  - Q8_0 (GGUF): aproximadamente 1,3 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar el modelo en fp16 con contextos cortos; 6-8 GB ofrecen margen para contextos largos y lotes mayores. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes para este tamano.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos anos (GTX 1060 6 GB en adelante) puede ejecutarlo en cuantizacion de 4 bits; tambien es viable en CPU mediante llama.cpp con cuantizaciones bajas.
- Opciones de despliegue: transformers (con o sin PEFT para el adaptador LoRA), llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp) usando el repositorio GGUF, vLLM y TGI para despliegue en servidor con soporte de adaptadores, y endpoints compatibles segun el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo para este modelo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con repositorios derivados del mismo autor. Para alternativas de otras familias del mismo rango de tamano no se dispone de datos verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanpo-product (este modelo) | 1.170.340.608 | no disponible | 89,0 % en rubrica de dominio propia (20 tareas) | other | HuggingFace, 0 descargas |
| unsloth/LFM2.5-1.2B-Instruct (modelo base) | ~1,2 B | no disponible | no disponible | no disponible | HuggingFace |
| d4rkninja/tanpo-product-GGUF | mismo modelo cuantizado | no disponible | no disponible | other | HuggingFace |
| d4rkninja/tanpo-product-LoRA | adaptador sobre el base | no disponible | no disponible | other | HuggingFace |
| Alternativas de ~1-2 B parametros de otras familias (por ejemplo modelos instruct compactos de Qwen, Llama o SmolLM) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados frente a modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un ajuste de dominio sobre un modelo pequeno, es probable que reproduzca los sesgos del modelo base y los del dataset de ajuste, no descrito.
- Riesgo de alucinacion: elevado por el tamano del modelo (1,17 B parametros) y por la ausencia de evaluacion independiente. En tareas factuales o con datos de mercado concretos conviene verificar las salidas.
- La metrica de rendimiento publicada (89,0 % de rubrica) procede de una evaluacion automatica del propio autor sobre 20 tareas de su dominio; no es una evaluacion de terceros ni una medida de preferencia humana, y no es extrapolable a otros dominios.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, lo que impide planificar tareas que dependan de ventanas largas.
- Limitaciones de idioma: no se declara la lista de idiomas soportados. El modelo card esta redactado en ingles y el dominio de ajuste (producto/CEO) esta descrito en ese idioma; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: la licencia figura como `other`, sin detalle de condiciones. Antes de un uso comercial es imprescindible consultar los terminos exactos del repositorio y, en su caso, los del modelo base, ya que el fine-tune no puede otorgar derechos mas amplios que los del modelo del que deriva.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en produccion, informes de la comunidad ni issues que permitan anticipar problemas de integracion.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no deben asumirse.
- Fecha de creacion y ultima actualizacion muy proximas entre si (17 de septiembre de 2026, con 4 minutos de diferencia), lo que sugiere una publicacion sin iteraciones posteriores ni mantenimiento visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-product
- Repositorio GGUF: https://huggingface.co/d4rkninja/tanpo-product-GGUF
- Repositorio LoRA: https://huggingface.co/d4rkninja/tanpo-product-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los enlaces devueltos corresponden a paginas sin relacion con el mismo. No se dispone de papers, blogs tecnicos ni demos adicionales.
