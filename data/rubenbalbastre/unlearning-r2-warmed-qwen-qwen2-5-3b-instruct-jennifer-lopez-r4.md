# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r4

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) publicado por el usuario `rubenbalbastre`, entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Según las etiquetas del repositorio, el ajuste se realizó con GRPO (Group Relative Policy Optimization) mediante la librería TRL, y forma parte de una línea de trabajo sobre *machine unlearning* (desaprendizaje automático) en modelos de lenguaje: el identificador del repositorio incluye el nombre de una persona concreta (`jennifer-lopez`) y un sufijo de ronda (`r4`), patrón habitual en experimentos de eliminación de conocimiento sobre entidades específicas. La model card, sin embargo, no documenta explícitamente el objetivo, el dataset ni el procedimiento.

Se trata, por tanto, de un artefacto de investigación y no de un modelo listo para producción. No se han publicado en la información disponible la licencia, los idiomas soportados, los resultados de evaluación ni los hiperparámetros de entrenamiento; la model card es la plantilla por defecto de HuggingFace con la mayoría de los campos sin rellenar. El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors, y en el momento de la consulta acumula 0 descargas y 0 *likes*, con fecha de creación y última actualización del 24 de septiembre de 2026.

Su relevancia actual es metodológica: documenta un caso de aplicación de GRPO (una técnica de optimización por refuerzo habitualmente usada para razonamiento) a tareas de desaprendizaje selectivo sobre un modelo pequeño (3B), lo que resulta reproducible en hardware de consumo. La única referencia externa citada es el preprint arXiv:2608.17804.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct tiene aproximadamente 3.090 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta 32.768 tokens de forma nativa (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | No disponibles para el adaptador; el modelo base dispone de variantes GGUF, AWQ y GPTQ publicadas por terceros |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 esta entrenado principalmente en ingles y chino, con cobertura multilingue parcial) |
| Licencia | No disponible (el modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,5 GB |
| Libreria | peft (entrenado con transformers y trl; PEFT 0.19.1 en el entorno declarado) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Qwen2.5, con normalizacion RMSNorm, activacion SwiGLU, embeddings ligados a la salida y atencion con consultas agrupadas (GQA). El adaptador añade matrices de bajo rango sobre las proyecciones de atencion y/o MLP, de modo que solo se actualiza una fraccion pequena de los parametros. El repositorio no publica el rango (`r`), el `alpha`, el `dropout` ni las capas objetivo del LoRA, datos que serian necesarios para reproducir el ajuste.

En cuanto al entrenamiento, las etiquetas indican el uso de GRPO con TRL. GRPO es un metodo de optimizacion por refuerzo sin modelo critico que estima la ventaja relativa de varias muestras generadas para el mismo *prompt*; en el contexto de desaprendizaje se emplea habitualmente para penalizar la generacion de contenido asociado a una entidad objetivo preservando el comportamiento general del modelo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de una fase previa de *warm-up* (el nombre del repositorio sugiere una etapa "warmed"), ni sobre el uso de DPO o RLHF adicional. El preprint arXiv:2608.17804 es la unica referencia tecnica enlazada, y su contenido no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico, matematicas elementales y generacion de codigo, en el nivel esperable de un modelo denso de 3B parametros; no hay evaluacion publicada del adaptador que lo cuantifique.
- Soporte de *chat templates* y conversaciones multiturno mediante el tokenizador y la plantilla del modelo base.
- El modelo base Qwen2.5-3B-Instruct soporta *tool calling* / *function calling* estructurado; se desconoce si el ajuste con GRPO ha preservado o degradado esta capacidad.
- Capacidad multilingue limitada, heredada del base: buen rendimiento en ingles y chino, cobertura desigual en otras lenguas, incluido el castellano.
- Capacidad especifica de investigacion: modificacion deliberada de la distribucion de salida sobre una entidad concreta (desaprendizaje), cuyo alcance real no esta documentado ni evaluado en el repositorio.

## Casos de uso

- Reproduccion de experimentos de *machine unlearning*: cargar el adaptador con PEFT sobre Qwen2.5-3B-Instruct y medir la tasa de supresion de la entidad objetivo frente al modelo base sin adaptar, usando *prompts* de sondeo directos e indirectos.
- Evaluacion de robustez del desaprendizaje: comprobar si el conocimiento suprimido reaparece tras un *fine-tuning* posterior con pocos ejemplos (ataque de re-aprendizaje), un escenario estandar en la literatura de unlearning.
- Pruebas de regresion de capacidad general: comparar el adaptador contra el base en tareas genericas (comprension lectora, generacion de codigo, instrucciones multi-paso) para cuantificar el coste del desaprendizaje en el resto de capacidades.
- Investigacion sobre GRPO aplicado a objetivos de supresion: analizar como se comporta una optimizacion por refuerzo con recompensas de tipo "no mencionar" frente a aproximaciones clasicas basadas en gradiente ascendente o DPO.
- *Red teaming* y analisis de extraccion de conocimiento: estudiar que estrategias de *prompting* (jailbreaks, reformulaciones, contexto largo) recuperan informacion que el adaptador pretende haber eliminado.
- Docencia y formacion tecnica: servir como ejemplo minimo, ejecutable en una GPU de consumo, de un pipeline completo de PEFT + TRL para desaprendizaje, sin necesidad de infraestructura de gran escala.
- Prototipado de asistentes con moderacion de entidades: en un entorno controlado, evaluar si un modelo de 3B ajustado puede usarse para evitar menciones a una entidad concreta en respuestas generadas; requiere auditoria previa por las limitaciones de robustez conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye la seccion de evaluacion (todos los campos aparecen como "[More Information Needed]"), y el preprint arXiv:2608.17804 no esta accesible en los datos proporcionados. No se dispone, por tanto, de cifras de MMLU, GSM8K, HumanEval ni de metricas especificas de desaprendizaje (por ejemplo, *forget accuracy*, *retain accuracy* o *relearning resistance*) para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,5 GB; el coste de memoria lo determina el modelo base de 3.090 millones de parametros.
- Inferencia en precision completa (fp16/bf16): en torno a 6-7 GB de VRAM para los pesos, mas la cache KV; con contextos largos (32K) la cache puede anadir varios GB.
- Inferencia en 8 bits: aproximadamente 3,5-4 GB de VRAM.
- Inferencia en 4 bits (bitsandbytes o GGUF Q4_K_M): aproximadamente 2-3 GB de VRAM.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en equipos con 8 GB de VRAM si se usa cuantizacion de 4 bits y contextos moderados.
- Despliegue: transformers + peft para cargar el adaptador directamente; vLLM soporta adaptadores LoRA sobre el modelo base (util para servir varias variantes en paralelo); llama.cpp y Ollama requieren fusionar el adaptador en el modelo base y convertir el resultado a GGUF; TGI puede servir el modelo base con adaptadores segun version.
- Latencia y throughput: no disponibles. Como referencia orientativa del orden de magnitud para un modelo denso de 3B en fp16 sobre una GPU moderna de gama alta, se espera un throughput de decenas a pocos cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

La comparativa se realiza sobre el modelo base y alternativas de tamano equivalente, ya que no existen datos de rendimiento del adaptador. Los datos de las alternativas corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | Adaptador LoRA; base de ~3,09B | No especificado; base de 32.768 tokens (131.072 con YaRN) | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct | ~3,09B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Llama-3.2-3B-Instruct | ~3,21B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, con restricciones de uso |
| Phi-3.5-mini-instruct | ~3,8B | 128.000 tokens | MIT | HuggingFace |
| Gemma-2-2B-it | ~2,6B | 8.000 tokens | Terminos de uso de Gemma | HuggingFace |

En rendimiento no es posible establecer comparacion: no hay resultados publicados para el adaptador, y cualquier cifra del modelo base correspondiente a informes de terceros no se incluye aqui por no formar parte de la informacion proporcionada.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan licencia, idiomas, dataset, hiperparametros ni proceso de evaluacion, lo que impide auditar el entrenamiento.
- Ausencia de licencia explicita: sin una licencia declarada, no puede asumirse permiso de uso comercial, redistribucion ni modificacion, con independencia de la licencia Apache-2.0 del modelo base.
- El desaprendizaje en modelos de lenguaje suele ser fragil: el conocimiento supuesto puede recuperarse mediante *fine-tuning* posterior con pocos ejemplos, *prompting* adversarial o reformulaciones del contexto.
- Riesgo de degradacion colateral: un ajuste con GRPO orientado a suprimir una entidad puede afectar capacidades generales (coherencia, utilidad, *tool calling*) sin que existan metricas publicadas que lo descarten.
- Riesgo de alucinacion: inherente a un modelo de 3B parametros, y potencialmente agravado si el ajuste empuja al modelo a evitar o sustituir informacion factual.
- Cobertura limitada del castellano: el modelo base esta optimizado para ingles y chino; el rendimiento en espanol no esta medido.
- Sin adopcion ni validacion externa: 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe evidencia de reproducibilidad por terceros.
- Uso responsable: si el objetivo del ajuste es eliminar referencias a una persona real, cualquier despliegue publico deberia auditarse antes y despues, dado que el fallo parcial del desaprendizaje puede producir afirmaciones incorrectas sobre individuos reales.
- El identificador del repositorio apunta a una unica entidad objetivo y a una ronda concreta de experimentos; no debe interpretarse como una version estable o mantenida.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r4
- Preprint citado en la model card: https://arxiv.org/abs/2608.17804
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL (GRPO): https://huggingface.co/docs/trl
