# harpreet22happy/granite-3.3-8b-kleister-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo base `ibm-granite/granite-3.3-8b-instruct`, entrenado específicamente para la tarea de extracción de información estructurada en documentos largos del benchmark Kleister. El adaptador fue desarrollado por el usuario `harpreet22happy` y está publicado bajo la librería PEFT, con un tamaño de repositorio de 0.4 GB.

El modelo resuelve el problema de extraer campos estructurados (en formato JSON de 8 campos) a partir de informes de organizaciones benéficas, un caso de uso típico de procesamiento de documentos largos. Su relevancia radica en que demuestra cómo un adaptador LoRA de bajo rango puede especializar un modelo de 8 mil millones de parámetros para tareas de comprensión de documentos extensos, con una ventana de contexto de hasta 16384 tokens por ejemplo durante el entrenamiento.

La rama principal (`main`) corresponde al checkpoint 150, que alcanzó la menor pérdida en el conjunto de validación (0.0837) entre las cuatro evaluaciones realizadas. El entrenamiento utilizó FlashAttention-2 con empaquetado sin padding y pérdida calculada solo sobre la parte supervisada (el resumen), enmascarando el documento de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer (base: granite-3.3-8b-instruct) |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA (r=16) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | 16384 tokens (durante entrenamiento) |
| Tipos de cuantizacion | bf16 (entrenamiento); cuantizacion del adaptador no especificada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `ibm-granite/granite-3.3-8b-instruct`, un transformer denso de 8 mil millones de parámetros. La configuración LoRA utiliza r=16, alpha=32 y se aplica a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas del MLP (`gate_proj`, `up_proj`, `down_proj`).

El entrenamiento se realizó en la tarea Kleister del benchmark de documentos largos, con ejemplos de hasta 16384 tokens. Se empleó FlashAttention-2 con empaquetado sin padding (padding-free packing) y una función de pérdida calculada solo sobre la parte supervisada (el resumen), enmascarando el documento de entrada. El entrenamiento fue de tipo SFT (supervised fine-tuning) y se evaluaron cuatro checkpoints (pasos 50, 100, 150 y 200), seleccionando el paso 150 por tener la menor pérdida en validación (0.0837).

## Capacidades

- Extracción de información estructurada en formato JSON (8 campos) a partir de informes de organizaciones benéficas.
- Procesamiento de documentos largos con contexto de hasta 16384 tokens.
- Comprensión de documentos extensos tipo informe (report) para generar resúmenes estructurados.
- Especialización en la tarea Kleister del benchmark de documentos largos.
- Capacidad de adaptación ligera sobre el modelo base Granite 3.3 8B instruct, que mantiene las capacidades generales del modelo original (generación de texto, razonamiento, código) aunque el adaptador está especializado en la tarea objetivo.
- Soporte de tool calling y funciones de agente: heredadas del modelo base, aunque no validadas específicamente para este adaptador.

## Casos de uso

- Extracción de datos financieros de informes anuales de ONGs: el adaptador puede procesar informes completos de organizaciones benéficas y extraer automáticamente los 8 campos estructurados (ingresos, gastos, activos, etc.) en formato JSON, eliminando la necesidad de revisión manual.
- Automatización de procesos de diligencia debida: en el sector financiero o de inversión, el modelo puede analizar informes de entidades sin ánimo de lucro para extraer métricas clave de forma estructurada, facilitando la evaluación de riesgos y cumplimiento.
- Indexación semántica de documentos largos: al convertir informes extensos en representaciones JSON estructuradas, el adaptador permite indexar y buscar información específica dentro de grandes volúmenes de documentos.
- Generación de resúmenes estructurados de informes: el modelo puede producir resúmenes supervisados de documentos largos, donde la pérdida se calcula solo sobre el resumen, lo que lo hace adecuado para tareas de summarization dirigido.
- Integración en pipelines de procesamiento documental: al ser un adaptador LoRA ligero (0.4 GB), puede cargarse junto al modelo base en entornos de producción con vLLM o TGI para procesar lotes de documentos de forma eficiente.
- Fine-tuning específico por dominio: el adaptador demuestra el flujo de trabajo para especializar Granite 3.3 8B en tareas de documentos largos, sirviendo como plantilla para adaptar el modelo a otros dominios (contratos, informes gubernamentales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento disponibles son las pérdidas en el conjunto de validación durante el entrenamiento:

| Checkpoint | Pérdida en validación |
|---|---|
| Paso 50 | 0.0932 |
| Paso 100 | 0.0866 |
| Paso 150 | 0.0837 |
| Paso 200 | 0.0861 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 8B, la VRAM necesaria depende del modelo base. Con cuantización de 4 bits del modelo base, se estiman entre 6-8 GB de VRAM; en bf16 completo, se requieren aproximadamente 16-18 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para bf16 completo; GPUs con 8-12 GB (RTX 3060/4070) si se cuantiza el modelo base a 4 bits.
- El adaptador LoRA en sí es muy ligero (0.4 GB) y no supone un requisito adicional significativo.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se fusiona el adaptador con el modelo base).
- Latencia y throughput: no disponible. Depende del hardware, la cuantización y la longitud de los documentos procesados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores LoRA para la tarea Kleister. El modelo base (Granite 3.3 8B Instruct) puede compararse con otros modelos de 8B como Llama 3.1 8B o Mistral 7B, pero el adaptador en sí es específico de una tarea y no se han publicado métricas comparativas.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| granite-3.3-8b-kleister-lora (este) | 8B + LoRA | 16384 | Kleister (extracción JSON) | no disponible |
| Llama 3.1 8B Instruct | 8B | 131072 | General | Llama 3.1 Community License |
| Mistral 7B Instruct | 7B | 32768 | General | Apache 2.0 |

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en la tarea Kleister (informes de organizaciones benéficas) y puede no generalizar bien a otros tipos de documentos o dominios.
- No se ha evaluado el rendimiento del adaptador en tareas generales; el modelo base puede degradarse si se usa el adaptador fuera de su dominio objetivo.
- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre las restricciones de uso comercial.
- No se dispone de información sobre sesgos del modelo o riesgos de alucinación específicos de este adaptador.
- El adaptador se entrenó con una ventana de 16384 tokens; el uso con contextos más largos puede degradar el rendimiento.
- No se han publicado evaluaciones de seguridad o robustez para este adaptador.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigación sin validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harpreet22happy/granite-3.3-8b-kleister-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
