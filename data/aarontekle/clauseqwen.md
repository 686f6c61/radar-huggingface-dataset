# AaronTekle/ClauseQwen

## Resumen

ClauseQwen es un adaptador LoRA (entrenado con QLoRA en 4 bits NF4) sobre el modelo base Qwen3-1.7B, desarrollado por AaronTekle para el análisis de cláusulas en contratos comerciales. El modelo aborda un problema concreto: la revisión manual de contratos legales es lenta y costosa, y los LLM generalistas no identifican con fiabilidad tipos de cláusula ni extraen el lenguaje contractual relevante de forma estructurada. ClauseQwen se entrena específicamente para clasificar cláusulas, detectar la presencia de conceptos contractuales y extraer el texto relevante, devolviendo la respuesta en JSON válido.

El modelo se construye sobre Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros, y se afina mediante SFT con el `SFTTrainer` de TRL y adaptadores PEFT sobre los datasets CUAD y LegalBench/ContractNLI. El resultado declarado es un salto notable en clasificación de tipos de cláusula (del 15% al 92% de accuracy en una evaluación de 100 ejemplos) manteniendo el 100% de validez en la salida JSON.

Su relevancia práctica reside en el tamaño: al ser un adaptador sobre un modelo de 1.7B, puede ejecutarse en hardware muy modesto (el autor completó el entrenamiento en una RTX 3050 de 6 GB de VRAM), lo que lo hace atractivo para pipelines de revisión contractual en local o en entornos con restricciones de privacidad. No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin evaluación específica en ContractNLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptadores LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B; no declarada en la model card) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 durante el entrenamiento (QLoRA); no se declaran otras cuantizaciones publicadas |
| Idiomas soportados | No disponible (la model card no declara idiomas; los datasets de entrenamiento son en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT LoRA); repositorio de 0,2 GB |

## Arquitectura y entrenamiento

ClauseQwen no es un modelo completo, sino un adaptador LoRA sobre Qwen3-1.7B, un transformer denso de tipo decoder-only. El entrenamiento emplea QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 para reducir el consumo de memoria, y sobre él se entrenan adaptadores de bajo rango con PEFT. El autor justifica esta elección frente a LoRA estándar por la reducción de memoria, que le permitió completar el entrenamiento en una única GPU de consumo (RTX 3050, 6 GB de VRAM). El ajuste se realiza con SFT (supervised fine-tuning) mediante el `SFTTrainer` de TRL, es decir, aprendizaje supervisado sobre pares instrucción-respuesta, sin que la model card mencione fases de RLHF o DPO.

Los datos de entrenamiento proceden de dos fuentes: CUAD (para clasificación de categorías de cláusula, detección de presencia y extracción de lenguaje relevante) y LegalBench/ContractNLI (para tareas de razonamiento contractual como confidencialidad, uso limitado, supervivencia de obligaciones, compartición con terceros, divulgación obligada y devolución de información confidencial). El run declarado comprende 31.395 ejemplos de entrenamiento y 2.730 de validación, 2 épocas, 1.824 pasos, con una pérdida final de entrenamiento de 0,01686, una pérdida de evaluación de 0,00751 y una accuracy media por token en evaluación del 99,74%. No se especifica el número total de tokens vistos ni la composición exacta del dataset más allá de las dos fuentes citadas.

## Capacidades

- Clasificación de tipos de cláusula en contratos comerciales (categorías de CUAD).
- Detección de presencia de conceptos contractuales (por ejemplo, confidencialidad, uso limitado, supervivencia de obligaciones).
- Extracción de lenguaje contractual relevante (span extraction) a partir del texto del contrato.
- Generación de salida estructurada en JSON válido (100% de validez declarada en la evaluación del autor).
- Generación de texto en lenguaje natural sobre el contenido contractual, además de la salida estructurada.
- Razonamiento contractual básico derivado de las tareas de LegalBench/ContractNLI (sin evaluación específica reportada en ese conjunto).
- Herencia de las capacidades generales de Qwen3-1.7B (generación de texto, razonamiento, código), aunque el adaptador está especializado y no se documenta su impacto sobre ellas.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la model card.

## Casos de uso

- Revisión inicial de contratos comerciales: el modelo clasifica cada cláusula por tipo y detecta la presencia de conceptos clave, lo que permite generar un índice estructurado del contrato antes de la revisión humana. Es adecuado por su especialización en categorías CUAD y su salida JSON.
- Extracción de metadatos contractuales a un pipeline: al devolver JSON válido de forma consistente, la salida puede ingerirse directamente en una base de datos o en un sistema de gestión documental sin post-procesado frágil.
- Triaje de contratos para equipos legales: dado un lote de contratos, el modelo señala qué cláusulas están presentes y de qué tipo, permitiendo priorizar la revisión manual en los documentos con cláusulas de riesgo.
- Detección de cláusulas de confidencialidad y uso limitado: las tareas de ContractNLI cubren conceptos como compartición con terceros, divulgación obligada y devolución de información confidencial, útiles para auditorías de NDA.
- Despliegue en entornos con restricciones de privacidad: al ser un adaptador sobre un modelo de 1.7B ejecutable en GPU de consumo, puede correr en local sin enviar contratos a servicios externos, lo que encaja en despachos o departamentos legales con requisitos de confidencialidad.
- Prototipado rápido y evaluación de viabilidad: por su bajo coste de inferencia, sirve para validar un flujo de extracción contractual antes de invertir en modelos mayores o en anotación humana a gran escala.
- Generación de resúmenes estructurados de obligaciones contractuales: combinando la extracción de lenguaje relevante con la generación en lenguaje natural, se pueden producir fichas de obligaciones por contrato para revisión posterior.

## Benchmarks y rendimiento

Evaluación held-out de 100 ejemplos realizada por el autor, comparando Qwen3-1.7B base frente a ClauseQwen:

| Metrica | Qwen3-1.7B base | ClauseQwen | Mejora |
|---|---|---|---|
| Validez de JSON | 100% | 100% | 0 pp |
| Accuracy de tipo de cláusula | 15% | 92% | +77 pp |
| Accuracy de presencia de cláusula | 76% | 91% | +15 pp |
| F1 de extracción | 0,7275 | 0,9059 | +0,1784 |

Métricas del run de entrenamiento:

| Metrica | Resultado |
|---|---|
| Ejemplos de entrenamiento | 31.395 |
| Ejemplos de validación | 2.730 |
| Épocas | 2 |
| Pasos de entrenamiento | 1.824 |
| Pérdida final de entrenamiento | 0,01686 |
| Pérdida final de evaluación | 0,00751 |
| Accuracy media por token en evaluación | 99,74% |

Advertencia del propio autor: el benchmark de 100 ejemplos contiene únicamente ejemplos de extracción y clasificación de CUAD, por lo que la accuracy de clasificación en ContractNLI no se evaluó y debe medirse por separado con una evaluación estratificada. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks legales estandarizados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador sobre Qwen3-1.7B en 4 bits NF4 requiere del orden de 1,5-2,5 GB para los pesos, más overhead de activaciones y contexto; en fp16 el modelo base de 1.7B ocupa aproximadamente 3,4 GB. Cifras estimadas a partir del tamaño del modelo, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente para el modelo base en 4 bits; el autor entrenó en una RTX 3050 de 6 GB. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño, pero aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: sí, en RTX 3050 (6 GB), RTX 3060/4060 (8 GB), RTX 4070/4080 y superiores.
- Opciones de despliegue: `transformers` (pipeline de text-generation o `AutoModel`), PEFT para cargar el adaptador; al ser un adaptador LoRA, puede fusionarse con el modelo base para exportarlo a GGUF y servirse con llama.cpp u Ollama, o servirse con vLLM/TGI tras la fusión. Estas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClauseQwen (AaronTekle) | 1,7B (adaptador LoRA sobre Qwen3-1.7B) | No disponible | Análisis de cláusulas contractuales (CUAD, ContractNLI) | No disponible | Hugging Face, 0 descargas |
| Qwen3-1.7B (Alibaba) | 1,7B | No disponible en esta ficha | LLM generalista | No disponible en esta ficha | Hugging Face, ampliamente utilizado |
| Modelos legales basados en LLM de 7B o superior | 7B+ | Variable | Análisis legal general | Variable | Variable |

No se dispone de datos de benchmarks comparativos frente a otros modelos legales especializados en la información proporcionada. La comparación cuantitativa disponible es únicamente contra el modelo base Qwen3-1.7B, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre CUAD y LegalBench/ContractNLI, el modelo hereda la distribución y los sesgos de esos corpus, orientados a contratos comerciales en inglés y a un marco legal concreto.
- Riesgo de alucinación: no evaluado. La validez del JSON no garantiza que el contenido extraído sea correcto; el F1 de extracción de 0,9059 implica que aproximadamente un 9% del contenido extraído no coincide con la referencia.
- Limitaciones de contexto e idioma: la model card no declara longitud de contexto ni idiomas soportados. Los datasets de entrenamiento son en inglés, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Cobertura de evaluación limitada: el benchmark de 100 ejemplos solo cubre tareas de CUAD; ContractNLI no se evaluó. No hay resultados en benchmarks legales estandarizados ni en tareas generales.
- Licencia: no disponible. La ausencia de licencia declarada impide asumir derechos de uso comercial; es imprescindible verificar la licencia del modelo base Qwen3-1.7B y contactar con el autor antes de cualquier uso en producción.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad. No debe tratarse como un componente listo para producción sin una evaluación propia sobre el dominio objetivo.
- Naturaleza del artefacto: es un adaptador LoRA, no un modelo completo; requiere cargar el modelo base Qwen3-1.7B y aplicar el adaptador con PEFT. Los ejemplos de la model card usan el identificador `AaronTekle/legal-qwen3-1.7b-qlora`, distinto del ID del repositorio (`AaronTekle/ClauseQwen`), lo que puede provocar errores de carga.
- Advertencia legal: la salida del modelo no constituye asesoramiento jurídico y requiere revisión por profesionales cualificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AaronTekle/ClauseQwen
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Dataset LegalBench: https://huggingface.co/datasets/nguha/legalbench
