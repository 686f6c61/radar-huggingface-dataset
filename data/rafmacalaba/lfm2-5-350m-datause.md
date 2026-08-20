# rafmacalaba/lfm2.5-350M-datause

## Resumen

`rafmacalaba/lfm2.5-350M-datause` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante Supervised Fine-Tuning (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el usuario rafmacalaba. Su función es la extracción de menciones de datos (data mentions) en texto: dado un párrafo, el modelo genera un JSON compacto con los fragmentos que contienen datos y su tipo de especificidad (`named`, `descriptive` o `vague`). Es una herramienta especializada para tareas de minería de texto, análisis de políticas de datos y procesamiento de documentos científicos o legales.

El modelo base, LFM2.5-350M, es un modelo de lenguaje híbrido de 350 millones de parámetros diseñado para dispositivos con recursos limitados, con pre-entrenamiento extendido hasta 28 billones de tokens y optimización mediante reinforcement learning. El adaptador LoRA se entrena con un dataset propio (`rafmacalaba/data-use-mention-sft`) durante 5 épocas, con una tasa de aprendizaje de 0.0002 y una configuración de r=16, alpha=32 y dropout=0.05. El resultado es un modelo ligero y de bajo coste de inferencia, ideal para despliegues en entornos con poca memoria.

La relevancia de este modelo radica en su capacidad para estructurar automáticamente menciones de datos en JSON, lo que facilita la automatización de procesos de extracción de información en dominios como la gestión de datos de investigación, la auditoría de cumplimiento o la generación de metadatos. Al estar licenciado bajo Apache 2.0, es libre para uso comercial y privado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LFM2.5-350M (arquitectura híbrida base, LFM2) |
| Parametros totales | No disponible (el modelo base tiene 350M, el adaptador LoRA añade una cantidad menor no especificada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base `LiquidAI/LFM2.5-350M`, que emplea una arquitectura híbrida denominada LFM2 (Liquid Foundation Model 2). Esta arquitectura combina capas recurrentes y atención lineal, lo que permite una inferencia rápida y un uso eficiente de memoria, adecuado para dispositivos edge. El adaptador LoRA se entrena mediante SFT con el dataset `rafmacalaba/data-use-mention-sft`, que contiene ejemplos de texto con menciones de datos y sus correspondientes etiquetas de especificidad. El entrenamiento utiliza una técnica de enmascarado de solo-completación, lo que significa que la pérdida se calcula únicamente sobre la respuesta JSON del asistente, ignorando el prompt de entrada. Se emplean 5 épocas, un learning rate de 0.0002 y una configuración LoRA de r=16, alpha=32 y dropout=0.05.

El modelo base ha sido pre-entrenado con 28 billones de tokens y refinado con reinforcement learning, lo que le confiere una base sólida en comprensión del lenguaje. El LoRA se especializa en la tarea de extracción de menciones de datos, generando una salida JSON estructurada con los campos `data_mentions` (lista de objetos) y `specificity_type` (que indica si la mención es `named`, `descriptive` o `vague`). No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens o la proporción de idiomas.

## Capacidades

- Generación de texto en formato JSON: el modelo produce una salida estructurada con las menciones de datos detectadas.
- Extracción de menciones de datos: identifica fragmentos de texto que hacen referencia a conjuntos de datos, bases de datos o información concreta.
- Clasificación de especificidad: etiqueta cada mención como `named` (nombre propio), `descriptive` (descripción general) o `vague` (vaga).
- Salida compacta: genera un único JSON con una lista de objetos, adecuado para integración en pipelines de procesamiento de datos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de generación de texto simple.

## Casos de uso

- **Análisis de políticas de datos**: extraer menciones de datos de documentos de políticas (por ejemplo, informes gubernamentales o corporativos) para identificar qué datos se citan y con qué especificidad.
- **Minería de artículos científicos**: localizar nombres de datasets o descripciones de datos en publicaciones académicas, facilitando la creación de repositorios de metadatos.
- **Auditoría de cumplimiento**: en procesos de revisión de informes de uso de datos, el modelo puede extraer automáticamente las menciones de datos para verificar su coherencia con las políticas internas.
- **Procesamiento de documentos legales**: extraer referencias a datos en contratos o cláusulas de protección de datos, ayudando en el análisis de riesgos.
- **Automatización de extracción de entidades**: integrar el modelo en pipelines de NLP para extraer entidades de datos de texto no estructurado, por ejemplo, en informes de sostenibilidad.
- **Análisis de datos de investigación**: en el contexto de ciencia abierta, el modelo puede identificar los datasets mencionados en papers para facilitar la reutilización de datos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en un conjunto de holdout con n=12531 muestras. La métrica es el match exacto del span y la etiqueta de especificidad de las menciones emitidas.

| specificity | tp | fp | fn | precision | recall | f1 |
| --- | --- | --- | --- | --- | --- | --- |
| named | 5161 | 2220 | 1959 | 0.6992 | 0.7249 | 0.7118 |
| descriptive | 5251 | 3385 | 2416 | 0.6080 | 0.6849 | 0.6442 |
| vague | 690 | 616 | 940 | 0.5283 | 0.4233 | 0.4700 |
| **overall** | 11102 | 6221 | 5315 | 0.6409 | 0.6763 | 0.6581 |

Además, la tasa de coincidencia de span verbatim es de 12635/17405 = 0.7259. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 350M de parámetros y el adaptador LoRA juntos ocupan aproximadamente 0.7 GB en disco (según el tamaño del repositorio). Para inferencia, se puede ejecutar en CPU con menos de 1 GB de memoria RAM.
- **GPU recomendadas**: no se requiere GPU para inferencia; el modelo puede ejecutarse en CPU de gama baja o media. En caso de usar GPU, cualquier GPU con al menos 1-2 GB de VRAM es suficiente.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 2060, GTX 1660, etc., y también en dispositivos móviles.
- **Opciones de despliegue**: compatible con frameworks como vLLM, llama.cpp, Ollama y TGI (Text Generation Inference). El modelo base tiene soporte oficial en Ollama (ver enlaces).
- **Latencia y throughput**: según el blog de Liquid AI, el modelo base alcanza 313 tokens/s en CPU AMD y 188 tokens/s en Snapdragon Gen4. El adaptador LoRA añade una pequeña sobrecarga, pero se espera un rendimiento similar en tareas de extracción.

## Comparativa con modelos similares

No se dispone de modelos similares específicamente entrenados para la extracción de menciones de datos con este formato. Se puede comparar con el modelo base `LFM2.5-350M` en su capacidad general de generación de texto, pero el LoRA está especializado para una tarea concreta. No hay datos de comparación de rendimiento con otros adaptadores LoRA en esta tarea.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para extracción de menciones de datos; no es adecuado para tareas generales de lenguaje.
- **Riesgo de alucinación**: puede generar menciones de datos que no existen en el texto de entrada, especialmente en casos de baja confianza (vague).
- **Dependencia del dataset**: la calidad de la extracción depende del dataset de entrenamiento, que puede tener sesgos en cuanto a tipos de datos o idiomas.
- **Formato de salida fijo**: el modelo solo genera JSON con la estructura indicada; no admite otros formatos de salida.
- **Idiomas no especificados**: no se conoce el soporte multilingüe; es probable que esté limitado a inglés u otros idiomas no documentados.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no garantiza la exactitud de las extracciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rafmacalaba/lfm2.5-350M-datause)
- [Modelo base LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Blog de Liquid: LFM2.5-350M - No Size Left Behind](https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind)
- [Documentación de LFM2.5-350M en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-350m)
- [Página de Ollama para LFM2.5-350M](https://ollama.com/LiquidAI/lfm2.5-350m)
