# AaronTekle/legal-qwen3-1.7b-qlora

## Resumen

legal-qwen3-1.7b-qlora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por AaronTekle para el análisis de cláusulas de contratos comerciales. El modelo está especializado en tres tareas: clasificación del tipo de cláusula, detección de presencia de conceptos contractuales y extracción del lenguaje relevante, devolviendo resultados en JSON válido. Se entrenó con los datasets CUAD y LegalBench/ContractNLI, con 31.395 ejemplos de entrenamiento y 2 épocas, alcanzando una pérdida final de entrenamiento de 0,01686 y una precisión media de token del 99,74% en validación.

La relevancia de este modelo radica en que reduce el esfuerzo manual de revisión de contratos legales, que suelen contener lenguaje denso y complejo. Al estar basado en Qwen3-1.7B, un modelo denso de 1.700 millones de parámetros con soporte multilingüe y ventana de contexto de 256K tokens, el adaptador hereda las capacidades generales del modelo base mientras añade conocimiento especializado en el dominio legal. El repositorio tiene un tamaño de 0,2 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-1.7B (transformer denso) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | Entrenado con cuantizacion 4-bit NF4 (QLoRA); el adaptador puede cargarse en precision completa o cuantizado |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3-1.7B, un transformer denso de la familia Qwen3. El entrenamiento se realizo con QLoRA, que combina la cuantizacion 4-bit NF4 del modelo base con adaptadores de bajo rango, reduciendo significativamente el uso de memoria en comparacion con LoRA estandar. Se utilizo el `SFTTrainer` de la libreria TRL (Transformers Reinforcement Learning) con PEFT para gestionar los adaptadores.

Los datos de entrenamiento provienen de dos fuentes: CUAD (Contract Understanding Atticus Dataset), usado para clasificacion de categorias de clausulas, deteccion de presencia y extraccion de lenguaje relevante; y LegalBench/ContractNLI, que anade tareas de razonamiento contractual sobre conceptos como confidencialidad, uso limitado, supervivencia de obligaciones, comparticion con terceros, divulgacion forzada y devolucion de informacion confidencial. El entrenamiento se ejecuto durante 2 epocas con 1.824 pasos, con un total de 31.395 ejemplos de entrenamiento y 2.730 de validacion. El proceso completo tardo aproximadamente 16 horas y 57 minutos en una NVIDIA GeForce RTX 3050 con 6 GB de VRAM.

## Capacidades

- Clasificacion de tipos de clausulas contractuales: identifica la categoria de una clausula (por ejemplo, confidencialidad, indemnizacion, terminacion) con una precision del 92% en la evaluacion de 100 ejemplos.
- Deteccion de presencia de conceptos contractuales: determina si un concepto especifico (como "uso limitado" o "supervivencia de obligaciones") esta presente en el contrato, con una precision del 91%.
- Extraccion de lenguaje relevante: extrae el texto exacto de la clausula que corresponde al concepto detectado, con un F1 de 0,9059.
- Generacion de salida en JSON valido: el modelo devuelve resultados estructurados en JSON, manteniendo un 100% de validez JSON en la evaluacion.
- Razonamiento contractual basado en LegalBench/ContractNLI: maneja tareas de razonamiento sobre obligaciones y conceptos legales, aunque la evaluacion especifica de ContractNLI no se ha medido por separado.
- Capacidades generales del modelo base: al estar basado en Qwen3-1.7B, conserva habilidades de generacion de texto, comprension multilingue y razonamiento general, aunque el adaptador esta optimizado para el dominio legal.

## Casos de uso

- Revision automatizada de contratos comerciales: el modelo puede analizar un contrato completo y clasificar cada clausula por tipo, permitiendo a los equipos legales priorizar las secciones mas relevantes sin leer todo el documento manualmente.
- Deteccion de clausulas de riesgo: dado un contrato, el modelo identifica si estan presentes conceptos como "divulgacion forzada" o "comparticion con terceros", alertando sobre posibles riesgos de confidencialidad.
- Extraccion de lenguaje contractual para bases de datos: el modelo extrae el texto exacto de clausulas especificas y lo estructura en JSON, facilitando la creacion de bases de datos de contratos consultables.
- Integracion en pipelines de gestion documental: al devolver JSON valido, el adaptador puede conectarse a sistemas de automatizacion que procesan contratos en lotes, por ejemplo en plataformas de due diligence.
- Asistencia a abogados en revision de contratos de confidencialidad: el modelo puede resumir y extraer las obligaciones clave de un NDA, reduciendo el tiempo de revision de horas a minutos.
- Validacion de cumplimiento normativo: en empresas que deben verificar que sus contratos incluyen ciertas clausulas obligatorias, el modelo puede comprobar la presencia de dichas clausulas de forma automatica.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion comparativa entre el modelo base Qwen3-1.7B y el modelo con el adaptador legal, realizada sobre 100 ejemplos de validacion (exclusivamente de CUAD, no de ContractNLI). Los resultados son los siguientes:

| Metrica | Modelo base | Fine-tuned | Mejora |
|---|---|---|---|
| Validez JSON | 100% | 100% | 0 pp |
| Precision en tipo de clausula | 15% | 92% | +77 pp |
| Precision en presencia de clausula | 76% | 91% | +15 pp |
| F1 de extraccion | 0,7275 | 0,9059 | +0,1784 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K para este adaptador. La evaluacion de ContractNLI no se ha realizado por separado, segun indica el propio autor.

## Requisitos de hardware

- El entrenamiento se realizo en una NVIDIA GeForce RTX 3050 con 6 GB de VRAM, lo que demuestra que el modelo es viable en hardware de gama de entrada.
- Para inferencia, el modelo base Qwen3-1.7B en precision FP16 requiere aproximadamente 3,5 GB de VRAM. Con cuantizacion 4-bit, el requisito baja a alrededor de 1,5 GB.
- El adaptador LoRA anade un overhead minimo (menos de 0,2 GB), por lo que el conjunto completo cabe en GPUs consumer como RTX 3060, RTX 4060 o incluso en CPUs con suficiente RAM usando llama.cpp.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` de HuggingFace, ya sea mediante `pipeline` o `AutoModel`. Tambien es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base. Para entornos sin GPU, se puede convertir a GGUF y usar con llama.cpp u Ollama.
- La latencia estimada en una GPU consumer (por ejemplo, RTX 3060) para generar una respuesta de 200 tokens es de aproximadamente 1-2 segundos, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores legales basados en Qwen3-1.7B con los que comparar directamente. La comparacion mas relevante es con el modelo base sin el adaptador, que muestra una mejora sustancial en las tareas legales especificas (de 15% a 92% en clasificacion de clausulas). Otros modelos legales como LegalBERT o LexLM tienen arquitecturas y tamanos diferentes (tipicamente 110M-400M parametros) y no son directamente comparables en capacidades de generacion ni en el enfoque de adaptador sobre un LLM generalista. Se recomienda evaluar el modelo frente a alternativas como Qwen3-1.7B con prompts de few-shot o modelos legales dedicados si se requiere una comparativa exhaustiva.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen3-1.7B junto con los pesos del adaptador. No se puede usar de forma independiente.
- La evaluacion publicada se limita a 100 ejemplos de CUAD; la precision en ContractNLI no ha sido medida, por lo que el rendimiento en tareas de razonamiento contractual mas complejas no esta verificado.
- El modelo puede alucinar clausulas o conceptos que no estan presentes en el contrato, especialmente en documentos con lenguaje ambiguo o poco estandar. Se recomienda validar las extracciones con un revisor humano.
- La licencia del adaptador no esta especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base Qwen3-1.7B tiene licencia Apache 2.0, pero el adaptador no declara ninguna.
- No se han documentado sesgos especificos, pero al entrenarse con datos legales de origen anglosajon (CUAD y LegalBench), el modelo puede estar sesgado hacia el derecho estadounidense y no ser adecuado para jurisdicciones con terminologia diferente.
- La ventana de contexto de 256K tokens es heredada del modelo base, pero el adaptador no ha sido probado con contratos de gran extension; el rendimiento en documentos muy largos no esta garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AaronTekle/legal-qwen3-1.7b-qlora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Dataset LegalBench: https://huggingface.co/datasets/nguha/legalbench
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
