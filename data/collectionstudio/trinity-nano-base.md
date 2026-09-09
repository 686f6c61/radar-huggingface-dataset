# CollectionStudio/Trinity-Nano-Base

## Resumen

Trinity-Nano-Base es un modelo de lenguaje de arquitectura MoE (mixture of experts) con 6.000 millones de parametros en total y 1.000 millones de parametros activos por token. Lo ha desarrollado Arcee AI y ha sido publicado en HuggingFace por CollectionStudio. Forma parte de la familia Trinity, una serie de pesos abiertos orientada a empresas y entornos de investigacion.

Es un modelo base pre fine-tuning, por lo que no esta preparado para mantener conversaciones tal cual; se disena para ser entrenado en dominios especificos. Se ha entrenado con 10 billones de tokens (10T) seleccionados junto con Datology, partiendo del dataset de AFM-4.5B e incorporando mas datos de matematicas y codigo. El entrenamiento se realizo en un cluster de 512 GPUs H200 con paralelismo HSDP.

Su relevancia actual radica en que ofrece una ventana de contexto de 128k y un coste de inferencia bajo gracias al mix de 128 expertos (8 activos y 1 compartido). Esto lo hace adecuado como base para fine-tuning en tareas de razonamiento, codigo y procesamiento de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM |
| Parametros totales | 6.120.003.328 |
| Parametros activos | 1.000 millones |
| Longitud de contexto | 128k |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Nano-Base emplea una arquitectura MoE con 128 expertos en total, de los cuales 8 se activan por token y uno es compartido. Esta disposicion permite que el modelo tenga 6.000 millones de parametros en memoria pero solo compute con 1.000 millones en cada paso, lo que reduce significativamente el coste de inferencia en comparacion con un modelo denso del mismo tamano.

El entrenamiento se llevo a cabo con un dataset de 10 billones de tokens curado junto con Datology, ampliando el conjunto utilizado en AFM-4.5B con mas datos de matematicas y codigo. El proceso se ejecuto en un cluster de 512 GPUs H200 con HSDP (Hybrid Sharded Data Parallel). No se menciona la aplicacion de RLHF ni DPO, por lo que se trata de un modelo de pretraining puro.

## Capacidades

- Generacion de texto y continuacion de secuencias en los idiomas declarados (en, es, fr, de, it, pt, ru, ar, hi, ko, zh).
- Razonamiento matematico, demostrado con resultados en GSM8K, Minerva Math 500 y DROP.
- Generacion de codigo, con puntuaciones en HumanEval, HumanEval+ y MBPP+.
- Conocimiento general y comprension lectora, evaluados con ARC, MMLU, MMLU Pro, BoolQ, HellaSwag y OpenBookQA.
- Procesamiento de contextos largos de hasta 128k tokens, util para documentos extensos.
- No soporta vision, audio ni tool calling de forma nativa, al ser un modelo base sin alineacion.

## Casos de uso

- Fine-tuning para asistencia legal multilingüe: se puede ajustar sobre contratos y jurisprudencia en varios idiomas, aprovechando la ventana de 128k para analizar documentos completos.
- Generacion de codigo para lenguajes propietarios: partiendo de las capacidades de codigo base (HumanEval y MBPP+), permite entrenar con repositorios internos y generar funciones especificas de una empresa.
- Modelo de razonamiento matematico para educacion: con resultados en GSM8K del 58,4%, sirve como punto de partida para tunear sistemas de resolucion de problemas en plataformas de aprendizaje.
- Clasificacion y extraccion de informacion en documentos tecnicos: la activacion de solo 1B de parametros favorece la ejecucion masiva de tareas de procesamiento de lenguaje natural en pipelines de datos.
- Investigacion en eficiencia MoE: es un modelo abierto adecuado para estudiar el equilibrio entre numero de expertos, parametros activos y calidad resultante.
- Base para chatbots de soporte al cliente: tras una etapa de alineacion con RLHF/DPO, puede convertirse en un asistente multilingüe para atencion al cliente.
- Analisis de informes financieros o reguladores: su contexto largo permite procesar informes extensos en una sola pasada para tareas de resumen y extraccion de entidades.

## Benchmarks y rendimiento

Los resultados mostrados en la model card se presentan a continuacion. No se dispone de comparativas con otros modelos dentro de la informacion proporcionada.

| Benchmark | Score |
|---|---|
| GSM8K | 58,4% |
| Minerva Math 500 | 36,0% |
| DROP (0-shot) | 4,5% |
| DROP (5-shot) | 63,6% |
| HumanEval (3-shot, bpb) | 36,3% (bpb) |
| HumanEval+ (temp 0.8) | 31,7% |
| MBPP+ | 44,7% |
| ARC-Challenge (5-shot) | 84,0% |
| ARC-Challenge (0-shot) | 78,2% |
| ARC-Easy (5-shot) | 94,8% |
| ARC-Easy (0-shot) | 91,2% |
| CommonsenseQA (5-shot) | 74,9% |
| CommonsenseQA (0-shot) | 62,7% |
| OpenBookQA (5-shot) | 82,2% |
| OpenBookQA (0-shot) | 75,2% |
| WinoGrande (5-shot) | 72,8% |
| WinoGrande (0-shot) | 68,0% |
| MMLU (5-shot) | 67,7% |
| MMLU (0-shot) | 64,2% |
| MMLU Pro (5-shot) | 35,8% |
| MMLU Pro (0-shot) | 27,7% |
| AGI Eval (English, 5-shot) | 51,8% |
| BBH (CoT, 5-shot) | 50,4% |
| BBH (CoT, 0-shot) | 7,6% |
| BoolQ (5-shot) | 84,3% |
| HellaSwag (5-shot) | 77,4% |
| PIQA (5-shot) | 82,2% |
| SciQ (5-shot) | 93,2% |
| Social IQA (5-shot) | 73,0% |

## Requisitos de hardware

- El checkpoint safetensors ocupa 12,3 GB, lo que sugiere almacenamiento en FP16.
- VRAM estimada para inferencia: alrededor de 12 GB para FP16; no disponible una cifra oficial para cuantizaciones.
- GPU recomendadas: A100, H100, RTX 4090 y otras con 24 GB o mas de VRAM.
- Cabe en GPU de consumo como la RTX 4090 (24 GB) en precision completa.
- Para cuantizacion se necesitarian pruebas adicionales; no se han publicado configuraciones soportadas oficialmente.
- Despliegue: compatible con la libreria transformers de HuggingFace. No se dispone de informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de informacion suficiente para elaborar una comparativa directa con otros modelos de la misma categoria en los datos proporcionados. El propio autor menciona la relacion con AFM-4.5B, pero no se incluyen especificaciones de ese modelo que permitan una tabla comparativa.

## Limitaciones y advertencias

- Es un modelo base pre fine-tuning, por lo que no esta alineado para conversacion ni para responder instrucciones con formato de chat.
- Puede generar texto incoherente o repetitivo si se usa directamente sin ajuste adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de conocimiento abierto.
- La licencia OpenMDW-1.1 debe revisarse detenidamente antes de cualquier uso comercial o redistribucion, ya que impone condiciones que pueden no ser compatibles con todos los proyectos.
- No se proporciona un desglose por idioma del dataset; la calidad en idiomas distintos del ingles puede variar.
- No incluye capacidades de vision ni de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/Trinity-Nano-Base
- Checkpoint pre-anneal: https://huggingface.co/CollectionStudio/Trinity-Nano-Base-Pre-Anneal
- Blog de Arcee AI, "The Trinity Manifesto": https://www.arcee.ai/blog/the-trinity-manifesto
- Modelo relacionado AFM-4.5B: https://huggingface.co/arcee-ai/AFM-4.5B
- Datology: https://www.datologyai.com/
- Prime Intellect: https://www.primeintellect.ai/
