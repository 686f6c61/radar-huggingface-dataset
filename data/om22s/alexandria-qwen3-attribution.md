# Om22s/alexandria-qwen3-attribution

## Resumen

Alexandria-qwen3-attribution es una familia de adaptadores LoRA (PEFT) publicada por el usuario Om22s sobre distintos modelos Qwen3, orientada a una tarea muy concreta: la atribución de hablantes en texto narrativo, principalmente audiolibros. El modelo no genera prosa libre, sino que recibe un fragmento de texto junto con un elenco de personajes ("roster") y devuelve JSON estructurado indicando qué personaje pronuncia cada intervención. El repositorio agrupa adaptadores entrenados sobre Qwen3-14B, Qwen3-8B, Qwen3.6-35B-A3B y Qwen3.8-27B, con el objetivo de mejorar la precisión del modelo base en esa tarea.

El adaptador principal documentado es `qwen3-14b-rightsclean-attrv1`, con 64.225.280 parámetros entrenables en formato safetensors y un tamaño de repositorio de 2,4 GB. La etiqueta "rights-reviewed" y el sufijo "rightsclean" sugieren un filtrado del corpus de entrenamiento por derechos de autor, un aspecto relevante para un producto de audiolibros. El modelo se distribuye también en formato GGUF para su uso con llama.cpp.

La relevancia actual es acotada pero clara: los pipelines de producción de audiolibros necesitan resolver la atribución de diálogos de forma fiable y determinista, y este adaptador ofrece mejoras medibles sobre el Qwen3 base en ese dominio específico (por ejemplo, de 61,7 a 73,4 en el fixture de producto con razonamiento desactivado). No es un modelo de propósito general, sino un componente especializado dentro de una cadena de procesamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3; adaptador entrenado sobre Qwen3-14B, Qwen3-8B, Qwen3.6-35B-A3B (MoE) y Qwen3.8-27B |
| Parametros totales | 64.225.280 (adaptador principal, safetensors); el modelo base Qwen3-14B tiene 14B |
| Parametros activos | no disponible para el adaptador; en Qwen3.6-35B-A3B el base es MoE (A3B), sin cifra de activos en la informacion disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3, sin dato explicito en la informacion) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q3_K_XL, IQ2_XXS, IQ1_M (segun los benchmarks declarados) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre la familia Qwen3, no un modelo entrenado desde cero. La arquitectura subyacente es la de Qwen3 (transformer decoder-only; la variante 35B-A3B es un modelo de mezcla de expertos). El adaptador se aplica mediante PEFT y se distribuye empaquetado para su uso con llama.cpp en formato GGUF, lo que permite fusionarlo o cargarlo junto al base cuantizado.

Los datos de entrenamiento no se detallan en la información disponible: no se indica el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La model card sí menciona un "four-book product fixture" de 768 filas emparejadas y un conjunto de evaluación externo ("PDNC Emma", 318 filas, 40 ventanas), lo que apunta a un entrenamiento y evaluación centrados en corpus narrativos con licencia revisada. La innovación destacable no está en la arquitectura sino en el enfoque: evaluación emparejada base/LoRA en un mismo servidor llama.cpp, con control de cuantización, presupuesto de razonamiento y esquema JSON, lo que permite aislar la contribución real del adaptador.

## Capacidades

- Atribución de hablantes en texto narrativo: identifica qué personaje del elenco pronuncia cada fragmento, devolviendo JSON estructurado.
- Generación de JSON conforme a esquema, con el elenco proporcionado en el prompt.
- Funcionamiento con razonamiento desactivado y con presupuesto de razonamiento bajo (1024), lo que permite elegir entre latencia y precisión.
- Procesamiento de ventanas de texto largas (las evaluaciones usan 40 ventanas sobre 318 filas).
- Robustez ante cuantizaciones agresivas: se reportan resultados en Q4_K_M, Q3_K_XL, IQ2_XXS e IQ1_M.
- Capacidades generales de generación de texto heredadas de Qwen3 (no evaluadas específicamente en esta ficha).
- Soporte de tool calling y agentes: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Producción de audiolibros: el adaptador recibe cada fragmento del manuscrito y el elenco de personajes, y devuelve qué personaje habla, alimentando el pipeline de asignación de voces. Su ventaja es la precisión medida sobre el base en el fixture de producto (73,4 frente a 61,7 sin razonamiento).
- Preprocesado de diálogos en editoriales: integrado en un pipeline de conversión de EPUB a audio, permite separar narrador y personajes antes de la síntesis de voz, reduciendo revisiones manuales.
- Control de calidad de atribuciones existentes: se puede ejecutar el adaptador sobre manuscritos ya etiquetados para detectar discrepancias y marcar fragmentos para revisión humana.
- Despliegue en hardware modesto: la variante sobre Qwen3-8B o el adaptador de 14B en Q4_K_M caben en GPUs de consumo, lo que permite procesar catálogos completos en local sin depender de APIs.
- Evaluación comparativa de cuantizaciones: los resultados publicados en Q4_K_M, Q3_K_XL, IQ2_XXS e IQ1_M permiten elegir el compromiso entre memoria y precisión para un servidor concreto.
- Investigación sobre atribución de hablantes: el enfoque de evaluación emparejada base/LoRA con temperatura 0 y esquema JSON sirve como referencia metodológica para experimentos similares.
- Extracción estructurada de diálogos para bases de datos narrativas: el JSON de salida se puede ingerir directamente en sistemas de anotación o en herramientas de análisis literario.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente). Todos los resultados son de precisión (accuracy) en atribución de hablantes con JSON estructurado y elenco proporcionado.

| Adaptador / configuración | Conjunto | Base | Adaptador |
|---|---|---|---|
| qwen3-14b-rightsclean-attrv1, razonamiento off, Q4_K_M | Fixture de producto (768 filas) | 61,7 | 73,4 |
| qwen3-14b-rightsclean-attrv1, razonamiento low 1024, JSON schema | Fixture de producto | 66,1 | 74,7 |
| qwen3-14b-rightsclean-attrv1, razonamiento low 1024 | PDNC Emma, held out (318 filas) | 68,9 | 75,8 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento off, Q4_K_M | Fixture de producto | 87,4 | 88,3 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento off, Q4_K_M | PDNC Emma, held out | 99,1 | 99,1 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento on, Q4_K_M | Fixture de producto | 89,8 | 89,8 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento on, Q4_K_M | PDNC Emma, held out | 99,7 | 99,4 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento on, Q3_K_XL | Fixture de producto | 87,5 | 88,8 |
| qwen3.8-27b-rightsclean-michel2v1, razonamiento on, IQ2_XXS | Fixture de producto | 83,1 | 85,7 |
| qwen3.6-35b-a3b-rightsclean-michel2v1, razonamiento off, IQ1_M | Fixture de producto | 82,9 | 85,9 |

Observaciones: la ganancia del adaptador es mayor en el modelo de 14B (hasta +11,7 puntos) y se diluye en los modelos más grandes, donde el base ya rinde muy alto. En PDNC Emma con Qwen3.8-27B, el adaptador no mejora al base con razonamiento desactivado y lo empeora ligeramente con razonamiento activado (99,4 frente a 99,7), lo que sugiere un techo de la tarea.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 2,4 GB de repositorio; el modelo base Qwen3-14B en Q4_K_M requiere del orden de 9-10 GB de VRAM, estimación no confirmada en la información disponible.
- GPU recomendadas: para Qwen3-14B en Q4_K_M, una RTX 4090 (24 GB) o A100/H100 con holgura; para las variantes de 27B y 35B-A3B se necesitan GPUs de 24-80 GB según cuantización.
- Cabe en GPU de consumo: sí, la variante de 14B en Q4_K_M en tarjetas de 12-16 GB; las variantes de 8B en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (formato GGUF, servidor con soporte de LoRA), PEFT con transformers, y potencialmente vLLM o TGI cargando el adaptador sobre el base (no confirmado en la información disponible).
- Latencia y throughput: no disponibles; los benchmarks se ejecutaron con temperatura 0 y batch 25, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexandria-qwen3-attribution (14B) | 64,2 M en adaptador sobre 14B | no disponible | LoRA especializado en atribución de hablantes | apache-2.0 | Hugging Face, GGUF |
| Qwen3-14B base | 14B | no disponible en esta ficha | Modelo generalista | apache-2.0 | Hugging Face |
| alexandria-qwen3-attribution (27B) | adaptador sobre 27B | no disponible | LoRA especializado, mayor precisión | apache-2.0 | Hugging Face, GGUF |
| alexandria-qwen3-attribution (35B-A3B) | adaptador sobre MoE 35B | no disponible | LoRA especializado, eficiente en cómputo | apache-2.0 | Hugging Face, GGUF |

No se dispone de comparativas con otros adaptadores de atribución de hablantes de terceros en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para atribución de hablantes con elenco dado; su rendimiento fuera de esa tarea no está evaluado y probablemente sea inferior al del base.
- Solo inglés: la etiqueta de idioma es `en`; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Resultados no verificados: los benchmarks son declarados por el autor (`verified: false`) y proceden de un fixture propio y un conjunto externo pequeño (318 filas), por lo que la generalización es incierta.
- Techo en modelos grandes: en Qwen3.8-27B el adaptador apenas mejora o incluso empeora ligeramente al base, lo que cuestiona su utilidad en esa configuración.
- Riesgo de alucinación en la asignación de hablantes: el modelo puede atribuir diálogos a personajes del elenco que no corresponden, especialmente en pasajes ambiguos o con hablantes no listados.
- Dependencia del formato: requiere prompt con elenco y esquema JSON; cambios en el formato pueden degradar la precisión.
- Sesgos: no documentados; al entrenarse sobre corpus narrativos concretos puede heredar sesgos de esos textos.
- Licencia apache-2.0 permisiva para uso comercial, pero conviene revisar las condiciones de los modelos base Qwen3 y del corpus "rights-reviewed".
- Sin soporte documentado de tool calling, agentes o multimodalidad; no debe asumirse.
- Fecha de creación futura (2026) en los metadatos, lo que puede indicar datos de repositorio poco fiables o generados; conviene verificar el estado real del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Om22s/alexandria-qwen3-attribution
- Repositorio con recetas y metodología: https://github.com/on22s/alexandria-audiobook2/blob/main/RECIPES.md
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
