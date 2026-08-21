# Sohailhosseini/Qwen3.5-9B-GLM5.1-Distill-v1-FP8

## Resumen

Este modelo es una cuantización a precisión FP8 (8 bits) del modelo `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1`, creada por Sohailhosseini. El modelo original es una destilación de Qwen3.5-9B entrenada mediante supervisión fina (SFT) y destilación de conocimiento a partir de GLM-5.1, con el objetivo de mejorar el razonamiento estructurado, la consistencia en el seguimiento de instrucciones y la activación de conocimiento latente. La cuantización FP8 reduce el tamaño de los pesos a la mitad, pasando de 19,3 GB a 11,9 GB, con una pérdida de calidad casi nula y sin necesidad de datos de calibración.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 9.400 millones de parámetros en hardware más asequible, siempre que se disponga de GPUs con arquitectura Ada o Hopper (compute capability ≥ 8.9). El modelo mantiene la ventana de contexto de 32.768 tokens y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción mediante vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (según `--max-model-len` de vLLM) |
| Tipos de cuantizacion | FP8 (8 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1` es un transformer denso de 9.400 millones de parámetros, derivado de Qwen3.5-9B. Fue entrenado mediante supervisión fina y destilación de conocimiento usando el framework Unsloth y LoRA, con datos de razonamiento de alta calidad generados por GLM-5.1. El objetivo declarado es mejorar el razonamiento estructurado, la consistencia en el seguimiento de instrucciones y la activación de conocimiento latente.

La versión FP8 aquí descrita no implica un nuevo entrenamiento, sino una cuantización posterior aplicada con la herramienta `HF-quantized` y el esquema `compressed-tensors`. Se cuantizan todos los pesos lineales a FP8, excepto `lm_head` y las capas relacionadas con visión (`visual`, `vision_tower`, `vision_model`, `multi_modal_projector`, `merger`), que permanecen en precisión original. La cuantización se realizó en una GPU H100 NVL y no requirió datos de calibración, lo que la hace "near-lossless" según el autor.

## Capacidades

- Generación de texto y razonamiento estructurado, heredadas del modelo base destilado de GLM-5.1.
- Seguimiento de instrucciones consistente, mejorado mediante SFT y destilación.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Capacidad de procesamiento de imágenes según el `pipeline_tag` (`image-text-to-text`), aunque no se confirma en la documentación del modelo base si realmente dispone de visión.
- Compatible con vLLM para inferencia eficiente en GPUs modernas.
- Multilingüismo: no se especifican idiomas soportados, por lo que se asume herencia del modelo base (no confirmado).

## Casos de uso

- Despliegue de asistentes conversacionales en producción: gracias a su ventana de 32.768 tokens y su licencia Apache 2.0, puede integrarse en servicios de chat con contexto largo usando vLLM como servidor de inferencia.
- Generación de código y asistencia al programador: el modelo base ha sido optimizado para razonamiento estructurado, lo que lo hace adecuado para tareas de autocompletado y explicación de código, aunque no se han publicado benchmarks específicos.
- Análisis de documentos extensos: la ventana de contexto de 32K permite procesar informes, artículos o contratos completos en una sola pasada, resumiendo o extrayendo información clave.
- Razonamiento lógico y resolución de problemas: la destilación desde GLM-5.1 busca mejorar la capacidad de razonamiento paso a paso, útil en aplicaciones educativas o de soporte técnico.
- Automatización de tareas de procesamiento de lenguaje natural: clasificación de texto, extracción de entidades o generación de respuestas estructuradas, aprovechando la consistencia en el seguimiento de instrucciones.
- Investigación y experimentación con modelos cuantizados: sirve como referencia para estudiar el impacto de la cuantización FP8 en modelos de razonamiento, dado que se documenta el proceso y las capas excluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo cuantizado ni para su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño de los pesos en FP8 es de aproximadamente 9,4 GB (11,9 GB en disco incluyendo metadatos). Con la caché KV y las activaciones, se recomienda al menos 16 GB de VRAM para una ventana de contexto de 32K tokens.
- GPUs compatibles: se requiere compute capability ≥ 8.9 (arquitectura Ada o Hopper). Ejemplos: RTX 4090, RTX 6000 Ada, L40S, H100, A100 (aunque A100 tiene compute capability 8.0, no cumple el requisito; la documentación indica que solo Ada/Hopper o más nuevas funcionan rápido).
- No cabe en GPUs de consumo antiguas (serie RTX 30 o anterior) debido al requisito de compute capability.
- Opciones de despliegue: vLLM es la opción recomendada y documentada. También podría usarse con otros motores que soporten `compressed-tensors`, como TGI o llama.cpp (si se convierte a GGUF), aunque no se menciona.
- Latencia y throughput: no se proporcionan datos. Dependerá de la GPU y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-GLM5.1-Distill-v1 (base) | 9,4B | 32K | FP16/BF16 | Apache 2.0 | Modelo original sin cuantizar, 19,3 GB |
| Qwen3.5-9B-GLM5.1-Distill-v1-FP8 (este) | 9,4B | 32K | FP8 | Apache 2.0 | Cuantización con compressed-tensors, 11,9 GB |
| Qwen2.5-7B (referencia) | 7,6B | 32K | Varias | Apache 2.0 | Modelo similar en tamaño, pero sin destilación de GLM-5.1 |

No se dispone de datos de rendimiento para comparar directamente. La comparativa se limita a características técnicas conocidas.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir ligeras pérdidas de precisión en tareas numéricas o de razonamiento complejo, aunque el autor la describe como "near-lossless".
- Requiere hardware con compute capability ≥ 8.9; en GPUs más antiguas la inferencia será lenta o no funcionará correctamente.
- No se han publicado evaluaciones de sesgos o alucinaciones para este modelo. Como modelo derivado de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento originales.
- El soporte de idiomas no está documentado; se desconoce su rendimiento en lenguas distintas del inglés o chino.
- Aunque el `pipeline_tag` indica `image-text-to-text`, no hay evidencia clara de que el modelo base tenga capacidades de visión reales; se recomienda verificar antes de usarlo en tareas multimodales.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización no modifica los términos del modelo base; se debe respetar la atribución correspondiente.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Sohailhosseini/Qwen3.5-9B-GLM5.1-Distill-v1-FP8
- Modelo base: https://huggingface.co/Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1
- Modelo base en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1
- Colección de modelos relacionados: https://huggingface.co/collections/Jackrong/qwen35-9b-glm51-distill
- Ficha en LLM Explorer: https://llm-explorer.com/model/Jackrong%2FQwen3.5-9B-GLM5.1-Distill-v1,1xZjVeUKyNJu5nwPrAr1N8
- Análisis en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-glm5.1-distill-v1-jackrong
