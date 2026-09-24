# Mihretu-dev/ethiopic-llm-tokenization-blindspot

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un artefacto de evaluación lingüística publicado por Mihretu Hizkel Shuke (usuario Mihretu-dev) como parte del reto técnico Fatima Fellowship Fall 2026. El objeto de estudio es el modelo abierto `Qwen/Qwen2.5-1.5B-Instruct`, sobre el que se documenta un "punto ciego" concreto: la tokenización del alfabeto etíope (Ge'ez) y la transliteración latina del amárico. El repositorio agrupa un conjunto de prompts paralelos, un script de evaluación y un análisis de los fallos observados.

La relevancia del artefacto radica en que expone un fallo que las evaluaciones multilingües estándar (MMLU traducido, Flores-200, XNLI) no detectan, porque trabajan con frases formales, aisladas y sintácticamente saneadas. El autor mide empíricamente un ratio de inflación de tokens de 4,6 tokens por palabra en escritura etíope frente a 1,1 tokens por palabra en inglés, y documenta degradación semántica, bucles de subcaracteres y conmutación abrupta al inglés en prompts nativos en Ge'ez.

Como propuesta de mitigación, el repositorio plantea tres líneas: adaptación de la tokenización con un vocabulario etíope especializado de entre 8.000 y 12.000 subtokens basado en segmentación morfológica de raíz-patrón, destilación bimodal paralela Fidel-Latín mediante LoRA/QLoRA sobre capas de proyección de atención, y cuantización de 4 bits (AWQ/GGUF) orientada a inferencia local en dispositivos móviles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo propio; artefacto de evaluacion. Modelo evaluado: Qwen2.5-1.5B-Instruct (transformer decoder-only, segun la model card) |
| Parametros totales | No aplicable al repositorio. Modelo evaluado: 1.5B parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No publicado en el repositorio. Se menciona 4-bit AWQ/GGUF como propuesta futura, no como artefacto disponible |
| Idiomas soportados | am (amharico), en (ingles) |
| Licencia | MIT |
| Formato de pesos | No aplicable; el repositorio contiene `evaluation_prompts.json` y `eval_script.py`, no pesos de modelo |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de ningun modelo. Su contenido es un conjunto de evaluación construido en torno a `Qwen/Qwen2.5-1.5B-Instruct`, descrito en la model card como un LLM compacto abierto de 1.5B parametros. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF o DPO en ese modelo. Tampoco se detalla si el artefacto aplica tecnicas como decodificacion especulativa o atencion lineal.

La contribucion tecnica del repositorio es metodologica: define tres representaciones linguisticas paralelas sobre 20 tareas cotidianas (preguntas factuales, instrucciones paso a paso, razonamiento aritmetico y discurso cortes). El conjunto A usa escritura etiope nativa (Ge'ez), el conjunto B usa amharico transliterado al latin (romanizacion fonetica informal, tipo SMS), y el conjunto C usa el equivalente en ingles como control semantico. El script `eval_script.py` mide dilatacion de longitud de tokens, latencia y consistencia de respuesta. La propuesta de solucion incluye segmentacion morfologica raiz-patron en lugar de BPE por frecuencia bruta, alineacion paralela Fidel-Latin y ajuste eficiente de parametros con LoRA/QLoRA sobre capas de proyeccion de atencion.

## Capacidades

- Evaluacion de tokenizacion multilingue: mide la fragmentacion a nivel de byte y de subtoken de la escritura Ge'ez en tokenizadores BPE y WordPiece.
- Analisis de code-switching: evalua la conmutacion entre script Fidel formal y transliteracion latina informal dentro del mismo dialogo.
- Analisis morfologico del amharico: examina como el modelo procesa una lengua aglutinante y de patrones de raiz en la que prefijos y sufijos codifican simultaneamente preposiciones, pronombres, negacion y tiempo verbal.
- Medicion de inflacion de tokens: cuantifica la relacion entre tokens por palabra en etiope y en ingles.
- Medicion de latencia y consistencia de respuesta: el arnés de evaluacion registra tiempos de inferencia y coherencia entre variantes del mismo prompt.
- Comparacion controlada entre representaciones: los conjuntos A, B y C permiten aislar el efecto de la representacion linguistica del efecto del contenido semantico.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Auditoria de tokenizadores antes de adoptar un modelo: un equipo que vaya a desplegar un LLM en Etiopia puede usar `eval_script.py` y `evaluation_prompts.json` para medir cuantos tokens consume realmente una frase en amharico y estimar el coste en contexto y latencia antes de comprometerse con un proveedor.
- Estimacion de costes de inferencia para lenguas de bajos recursos: el ratio de 4,6 tokens por palabra frente a 1,1 en ingles permite calcular de forma directa el sobrecoste de servir amharico, util para dimensionar presupuestos de API o de GPU.
- Diseno de vocabularios especializados: los hallazgos sirven como punto de partida para justificar la expansion de la matriz de embeddings con 8.000-12.000 subtokens etiopes antes de un fine-tuning.
- Construccion de corpus paralelos Fidel-Latin: las plantillas del conjunto B son reutilizables para generar pares de alineacion que alimenten un ajuste con LoRA sobre modelos compactos.
- Analisis de dialectos y registros informales: el artefacto documenta el fallo frente a romanizacion tipo SMS, aplicable a estudios de NLP sobre comunicacion movil en la region.
- Validacion de modelos compactos para despliegue en el borde: el escenario de cuantizacion a 4 bits AWQ/GGUF encaja en proyectos que necesiten inferencia local en moviles con conectividad limitada.
- Investigacion academica en morfologia computacional: el analisis de morfemas ligados en amharico es directamente citable en trabajos sobre segmentacion morfologica de lenguas semiticas.
- Evaluacion comparativa de proveedores: permite contrastar varios modelos abiertos de rango 0.6B-6B con el mismo conjunto de prompts y las mismas metricas de dilatacion y consistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. El repositorio si publica hallazgos empiricos propios, que se recogen a continuacion.

| Metrica | Valor reportado |
|---|---|
| Ratio de inflacion de tokens (escritura etiope/Ge'ez) | 4,6 tokens por palabra |
| Ratio de inflacion de tokens (ingles equivalente) | 1,1 tokens por palabra |
| Tareas curadas evaluadas | 20 |
| Representaciones linguisticas evaluadas | 3 (Ge'ez nativo, amharico transliterado, ingles) |
| Modelo evaluado | Qwen/Qwen2.5-1.5B-Instruct (1.5B) |
| Rango de modelos al que se generaliza la observacion | 0.6B - 6B, segun el autor |

Hallazgos cualitativos reportados:

| Fenomeno | Comportamiento observado |
|---|---|
| Seguimiento de instrucciones en Ge'ez nativo | Degeneracion gramatical, bucles repetitivos de subcaracteres, conmutacion abrupta a ingles simplificado |
| Transliteracion latina del amharico | Fallo semantico casi total; el modelo interpreta las frases como cognados romance o germanicos en lugar de sintaxis semitica |
| Ingles (control) | Seguimiento basico de instrucciones preservado |

## Requisitos de hardware

- El repositorio no requiere GPU: es un conjunto de prompts JSON y un script de evaluacion en Python.
- El modelo evaluado, Qwen2.5-1.5B-Instruct, requiere aproximadamente 3 GB de VRAM en precision fp16 y en torno a 1 GB en cuantizacion de 4 bits (estimacion derivada del numero de parametros; no publicada en la informacion disponible).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas, e incluso en GPUs de gama baja con cuantizacion.
- Para el modelo evaluado serian adecuadas GPU de datacenter como A100 o H100 con fines de servir muchas peticiones concurrentes, aunque estan sobredimensionadas para 1.5B parametros.
- Opciones de despliegue mencionadas o coherentes con la propuesta: llama.cpp y Ollama para GGUF, vLLM o TGI para servir en fp16/4-bit. La model card solo menciona explicitamente AWQ y GGUF.
- Latencia y throughput: no se publican cifras concretas. El repositorio incluye el instrumental para medirlas mediante `eval_script.py`, pero no se aportan resultados numericos de latencia en la informacion disponible.

## Comparativa con modelos similares

Este artefacto no es un modelo, por lo que la comparativa se establece entre la aproximacion de evaluacion propuesta y otras iniciativas del ecosistema etiope, asi como frente a las baterias estandar que el autor critica.

| Elemento | Tipo | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| ethiopic-llm-tokenization-blindspot (este repositorio) | Artefacto de evaluacion | am, en | MIT | Prompts paralelos Ge'ez / transliterado / ingles; metrica de inflacion de tokens y consistencia |
| EthioLLM (arxiv 2403.13737) | Familia de modelos (variantes XLMR y mT5, tamano large/base/small) | Lenguas etiopes | No disponible en la informacion proporcionada | Entrenamiento multilingue especifico para lenguas etiopes considerando sus distintos sistemas de escritura |
| MMLU traducido / Flores-200 / XNLI | Baterias de evaluacion estandar | Multilingue | No disponible | Frases formales, aisladas y sintacticamente saneadas |
| Qwen2.5-1.5B-Instruct | Modelo evaluado | Multilingue | No disponible en la informacion proporcionada | LLM compacto abierto de 1.5B parametros |

No se dispone de datos comparativos de rendimiento cuantitativo entre este artefacto y los modelos citados, ya que el repositorio no reporta metricas de accuracy ni puntuaciones estandar.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: es un artefacto de evaluacion. No debe citarse como un LLM para amharico ni usarse para inferencia directa.
- Las conclusiones se obtienen sobre un unico modelo, Qwen2.5-1.5B-Instruct. La generalizacion al rango 0.6B-6B la afirma el autor, pero no se aportan evaluaciones con otros modelos en la informacion disponible.
- El tamano de la muestra es reducido: 20 tareas curadas. No se reportan intervalos de confianza, repeticiones ni analisis estadistico de significancia.
- Riesgo de sesgo de autor: la evaluacion esta construida y analizada por una sola persona, sin validacion por terceros ni proceso de revision por pares.
- Los resultados cualitativos (bucles, conmutacion a ingles, fallo semantico) se describen de forma agregada, sin transcripciones completas ni tasas de fallo por tarea.
- Potencial de alucinacion en las recomendaciones tecnicas: el vocabulario propuesto de 8.000-12.000 subtokens y la mejora esperada no se acompanan de experimentos que demuestren la ganancia.
- La licencia MIT cubre el material del repositorio, pero no aclara la licencia o los terminos de uso del modelo evaluado, que se rige por sus propios terminos.
- No se publican resultados de benchmarks estandar, por lo que no es posible situar el artefacto en una escala comparable de rendimiento.
- La fecha de creacion indicada en los metadatos (23 de septiembre de 2026) es posterior a la fecha actual, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mihretu-dev/ethiopic-llm-tokenization-blindspot
- Perfil de GitHub del autor: https://github.com/mihretu-dev
- Paper de EthioLLM (modelos multilingues para lenguas etiopes): https://arxiv.org/html/2403.13737v1
- Repositorio de investigacion sobre tokenizacion en LLM: https://github.com/aransha-patole/llm-tokenization-research
- Ethio Models Hub (modelos y datasets de NLP etiope): https://negasihaile.github.io/ethioai-hub/
- Guia general de arquitectura y entrenamiento de LLM: https://www.ashutosh.dev/llms-decoded-architecture-training-and-how-large-language-models-really-work/
- Modelo evaluado: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
