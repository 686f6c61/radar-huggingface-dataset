# Modusnsus/laya-nli-conflict-v12-r3

## Resumen

laya-nli-conflict-v12-r3 es un ajuste fino de clasificacion de texto construido sobre el modelo base convaiinnovations/laya-multilingual, publicado por el usuario Modusnsus. La tarea objetivo es la deteccion de conflictos entre memoria y contexto (memory-conflict NLI): dado un par de fragmentos, el modelo puntua si existe contradiccion, negacion o compatibilidad entre ellos. Pertenece a la familia Laya, un motor de decisiones "System 1" no autoregresivo basado en ModernBERT-large que en lugar de generar texto devuelve probabilidades calibradas sobre un conjunto fijo de opciones descritas.

Este repositorio no es la cabeza entregada del protocolo v12, sino su "hermano de investigacion" (run r3). El autor documenta un protocolo de tres ejecuciones (v12-r1, r2, r3) y selecciona r2 como la version servible (Modusnsus/laya-nli-conflict-v12), reservando r3 para inspeccion de varianza. El propio README advierte de forma explicita que "its weights are never to be served". Aun asi, r3 supera las 14 compuertas de validacion del protocolo, con una exactitud de validacion principal de 0,907 y un ECE de 0,0190.

El checkpoint ocupa 643.835.524 bytes (~614 MiB) en un unico archivo safetensors, con corpus de entrenamiento completamente sintetico (15.950 filas) y licencia Apache 2.0. Su relevancia es acotada: sirve como referencia de reproducibilidad y analisis de varianza para quien trabaje con deteccion de conflictos en sistemas de memoria de agentes, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo (base ModernBERT-large, familia Laya System 1); variante multilingue del base |
| Parametros totales | No disponible para este fine-tune; el modelo base Laya se documenta con ~421M (ModernBERT-large). El checkpoint ocupa 643.835.524 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens segun las especificaciones publicas del base Laya; no confirmado para la variante multilingue |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue segun etiquetas y modelo base; lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura hereda de Laya, un modelo de decisiones "System 1" no autoregresivo: en lugar de generar tokens, recibe un estado mas preguntas tipadas (choice, score o "noul") y devuelve probabilidades calibradas en una sola pasada forward. El backbone es un encoder ModernBERT-large, lo que lo situa en la capa de salida estructurada junto a herramientas como SemIf o las librerias de decodificacion restringida (Outlines, XGrammar), con la diferencia de que Laya sustituye por completo la generacion en el caso concreto de puntuar un conjunto fijo de opciones.

El corpus de entrenamiento es el v12 (Kaggle dataset v17), que segun el README equivale a las 15.914 filas de v11 transportadas literalmente mas 36 filas adicionales de "negation-known lever rows", es decir 15.950 filas en total, todas sinteticas y sin datos personales ni de usuarios reales. El modelo base Laya se entrena segun fuentes publicas con RLCD (Reinforcement Learning from Contrastive Distillation). El README de este run no detalla la composicion exacta del dataset ni la receta de ajuste fino mas alla de la procedencia del corpus y del conjunto de evaluacion (Modusnsus/laya-nli-conflict-eval). Incluye como artefactos auxiliares un fichero de configuracion con el umbral tau (rl_agent_config.json) y las probabilidades de validacion por fila (val_probs.json).

## Capacidades

- Clasificacion binaria/multiclase de relaciones de inferencia textual (NLI) orientada a conflictos memoria-contexto: deteccion de contradiccion, negacion y compatibilidad entre fragmentos.
- Puntuacion calibrada: el modelo reporta ECE de 0,0190 en validacion, lo que lo hace apto para decisiones basadas en umbral de confianza.
- Manejo explicito de negacion: incluye ejes de evaluacion especificos de negacion (negation-5, negation family mean-p) y filas de entrenamiento dedicadas a este fenomeno.
- Deteccion de conflictos suaves (soft-conflict), con 1 error en 300 casos de validacion segun el README.
- Capacidad multilingue heredada del base laya-multilingual (lista concreta de idiomas no disponible).
- No genera texto: no soporta tool calling, function calling, agentes multi-paso ni razonamiento generativo. Su funcion es la de un clasificador/puntuador dentro de un pipeline mayor.
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking).

## Casos de uso

- Deteccion de contradicciones en memoria de agentes: dado un par (recuerdo almacenado, contexto actual), el modelo puntua si se contradicen, permitiendo que el orquestador descarte o marque entradas obsoletas antes de que contaminen el contexto de un LLM generativo.
- Verificacion de consistencia en pipelines RAG: antes de inyectar documentos recuperados en el prompt, el modelo puede filtrar fragmentos que entren en conflicto con la memoria de la sesion, reduciendo alucinaciones por contexto contradictorio.
- Triaje con incertidumbre calibrada: gracias al ECE bajo (0,0190) y a la regla conformal adoptada (33/47 @ 34,0 %), puede usarse para decidir que casos se resuelven de forma automatica y cuales se derivan a revision humana.
- Automatizacion con umbral fijo: el README reporta automation@5% de 0,781 y tau(noul) de 1,1080, lo que permite fijar un umbral operativo y medir la tasa de automatizacion real en produccion.
- Auditoria de coherencia en bases de conocimiento: procesar por lotes pares de afirmaciones para detectar negaciones o polaridades invertidas que indiquen errores de anotacion o de consolidacion.
- Moderacion de respuestas factuales: comprobar si una respuesta generada contradice una afirmacion de referencia conocida, como capa de validacion previa a la entrega.
- Investigacion sobre varianza en ajuste fino: al ser un run archivado del protocolo v12, sirve para estudiar la dispersion entre ejecuciones (r1, r2, r3) bajo un mismo corpus y receta.
- Sistemas multilingues de control de calidad textual: si la variante multilingue rinde de forma consistente, puede aplicarse a la deteccion de conflictos en flujos de documentacion en varios idiomas (siempre que se valide la lista de idiomas soportados, no disponible).

## Benchmarks y rendimiento

Datos extraidos del README del run r3. La columna "gate" indica el criterio de aceptacion del protocolo v12.

| Eje | Lectura r3 | Compuerta |
|---|---|---|
| Exactitud de validacion principal / ECE | 0,907 / 0,0190 | mediana >= 0,896 |
| Casos reales "old-20" | 20/20 | mediana = 20, sin fallo repetido |
| Negacion (negation-5) | 4/5 | mediana = 5, sin fallo repetido |
| Casos nuevos "new-10" | 10/10 | mediana = 10, sin fallo repetido |
| Conflictos suaves (errores val_soft) | 1/300 | <= 3 |
| swap / polarity x2 / band | PASS x4 | todas las ejecuciones |
| Regla conformal adoptada | 33/47 @ 34,0 % (s1) | >= 50 % @ <= 35 % |
| Diagnostico de sesgo | 13/14 | >= 13/14 en >= 2/3 runs |
| Familia compat, mean-p (casos de alta confianza) | 0,0814 (0) | mediana < 0,5, <= 1/run |
| Familia negacion, mean-p (casos de baja confianza) | 0,7930 (1) | mediana >= 0,5, <= 1/run |
| tau(noul) / automation@5 % | 1,1080 / 0,781 | auxiliar |

No se han publicado resultados de benchmarks comparables a MMLU, HumanEval o GSM8K en la informacion disponible; el modelo no es generativo y este tipo de benchmarks no aplican a su tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP32/half segun checkpoint) el archivo de pesos pesa unos 614 MiB; con overhead de runtime, la inferencia encaja comodamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con >= 2 GB de VRAM sirve para lotes pequenos; para lotes grandes o alto throughput, una RTX 4090, A100 o H100 ofrecera mejor rendimiento.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GPUs de consumo basicas (por ejemplo GTX 1650 4 GB en adelante) e incluso es candidato a ejecucion en CPU.
- Opciones de despliegue: transformers (biblioteca indicada en los tags) y endpoints compatibles (endpoints_compatible en los tags). El README no confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI, por lo que debe verificarse antes de usarlos; algunos de estos motores asumen arquitecturas autoregresivas y podrian no ser compatibles con un encoder de decision no generativo.
- Latencia y throughput estimados: no disponibles para este run. La familia Laya se promociona publicamente como "33 ms multilingual System 1 Decision Engine", pero ese dato corresponde al producto/API del fabricante, no a este checkpoint, y no debe extrapolarse sin medir.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| laya-nli-conflict-v12-r3 (este) | Run r3 de investigacion | ~base 421M | 512 (base) | Apache 2.0 | Archivado, no servible segun README |
| Modusnsus/laya-nli-conflict-v12 | Run r2, cabeza entregada | ~base 421M | 512 (base) | Apache 2.0 | Seleccionado como head del protocolo |
| Modusnsus/laya-nli-conflict-v5 | Version anterior de la familia | No disponible | No disponible | No disponible | Disponible en Hugging Face |
| convaiinnovations/laya-multilingual | Modelo base | ~421M | 512 (segun Laya) | Apache 2.0 (base) | Disponible en Hugging Face |

Alternativas de la misma categoria funcional (puntuacion de opciones tipadas / salida estructurada) serian SemIf, Outlines y XGrammar, pero operan a nivel de decodificacion de modelos generativos y no son comparables directamente en parametros o licencia con este clasificador. No hay datos de rendimiento cruzado entre estos sistemas y laya-nli-conflict-v12-r3 en la informacion disponible.

## Limitaciones y advertencias

- Advertencia central del autor: este repositorio es un archivo de investigacion y sus pesos "never to be served". No es la version entregada; la cabeza del protocolo es r2 (Modusnsus/laya-nli-conflict-v12).
- Riesgo de sesgo: el modelo es un clasificador binario/multiclase de NLI; puede heredar sesgos del corpus sintetico y del backbone. El README solo reporta 13/14 en el diagnostico de sesgo, sin detallar la naturaleza de esos sesgos.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto, pero si puede producir clasificaciones erroneas con alta confianza si se usa fuera de su distribucion (pares de texto no similares al corpus de entrenamiento).
- Limitacion de negacion: el eje negation-5 obtiene 4/5, lo que indica que la negacion no es perfecta. No es un modelo de negacion infalible.
- Limitaciones de contexto: el base Laya tiene 512 tokens de contexto, lo que restringe el tamano de los fragmentos comparados; pares mas largos requieren truncado o segmentacion, con la consiguiente perdida de informacion.
- Limitaciones de idioma: aunque el base es multilingue, la lista concreta de idiomas soportados no esta disponible y no se aportan metricas por idioma; el uso en un idioma concreto debe validarse empiricamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribucion y sin garantias, pero conviene revisar la licencia del modelo base (convaiinnovations/laya-multilingual) y la de los datasets asociados antes de desplegar en produccion.
- Caveat de produccion: el autor indica que los pesos de este run no deben servirse; para despliegue real debe usarse r2 o una ejecucion seleccionada con criterios de aceptacion completos.
- Naturaleza no autoregresiva: no soporta generacion de texto, tool calling ni agentes; integrarlo requiere un orquestador externo que consuma sus probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Modusnsus/laya-nli-conflict-v12-r3
- Cabeza entregada del protocolo v12 (r2): https://huggingface.co/Modusnsus/laya-nli-conflict-v12
- Version anterior de la familia: https://huggingface.co/Modusnsus/laya-nli-conflict-v5
- Documento de protocolo (HANDOFF_NLI_V12.md): https://github.com/modusensus/laya/blob/main/kaggle_eval/HANDOFF_NLI_V12.md
- Dataset de linaje de entrenamiento: https://huggingface.co/datasets/Modusnsus/nli-conflict-train-lineage
- Dataset de evaluacion: https://huggingface.co/datasets/Modusnsus/laya-nli-conflict-eval
- Coleccion completa de la familia: https://huggingface.co/collections/Modusnsus/laya-nli-memory-conflict-head-v4-and-three-run-protocol-6ac03c397eb43e9e3ecf87f0
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Sitio oficial de Laya (ConvAI Innovations): https://laya.convaiinnovations.com/
- Ficha de Laya en LLM Reference: https://www.llmreference.com/model/laya
- Resena de Laya en AI/TLDR: https://ai-tldr.dev/tools/laya/
- Sitio del producto Laya AI: https://laya-model.com/
