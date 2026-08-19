# RoseG/Qwen3.5-35B-A3B-Base-8be64d30-Merged

## Resumen

El modelo `RoseG/Qwen3.5-35B-A3B-Base-8be64d30-Merged` es un merge creado por el usuario RoseG a partir del modelo base `Qwen/Qwen3.5-35B-A3B-Base` de Alibaba. Se trata de una variante fusionada de la arquitectura Qwen3.5, un modelo de mezcla de expertos (MoE) multimodal con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, lo que permite una inferencia eficiente. El modelo base soporta una ventana de contexto de 262 144 tokens y 201 idiomas, y está diseñado para tareas de razonamiento, código, agentes y visión-lenguaje.

La relevancia de este merge radica en que combina los pesos del modelo base con un fine-tuning (según los metadatos de HuggingFace, se indica `base_model:finetune:Qwen/Qwen3.5-35B-A3B-Base`), aunque no se documentan los detalles del proceso de fusión ni los datos de entrenamiento adicionales. Al ser una versión base, está pensado para ser fine-tuneado en tareas específicas, aunque el merge podría haber introducido mejoras no documentadas. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Dado que la model card del autor es mínima y no incluye especificaciones propias, los datos técnicos que se presentan a continuación provienen del modelo base Qwen3.5-35B-A3B-Base, salvo que se indique lo contrario. La ausencia de documentación específica del merge limita la evaluación de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens (según el modelo base) |
| Tipos de cuantizacion | no disponible para este merge; el modelo base admite cuantizaciones estándar (4-bit, 8-bit) |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (presumible, por el tamaño del repositorio de 55.6 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B-Base emplea una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo se activa una fracción de los parámetros durante cada paso de inferencia. El modelo integra además una fusión temprana de tokens multimodales (visión y lenguaje) para lograr un rendimiento comparable al de modelos dedicados a visión-lenguaje, según la documentación oficial de Qwen.

El entrenamiento del modelo base incluye técnicas de aprendizaje por refuerzo a gran escala y optimización para tareas de razonamiento, código y agentes. Sin embargo, no se dispone de información específica sobre el proceso de entrenamiento del merge `8be64d30-Merged`. Los metadatos de HuggingFace indican que se utilizó como base el modelo `Qwen/Qwen3.5-35B-A3B-Base` y un fine-tuning del mismo, pero no se detalla el método de fusión (p. ej., SLERP, TIES, DARE) ni los datasets empleados.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y lógica.
- Generación de código en múltiples lenguajes de programación, con soporte para tool calling y ejecución de agentes.
- Comprensión multimodal: el modelo base integra visión y lenguaje, permitiendo entrada de imágenes junto con texto.
- Soporte de 201 idiomas y dialectos, con buen rendimiento en lenguas de baja representación.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Al ser un modelo base, no incluye instrucciones de chat por defecto; requiere fine-tuning para tareas conversacionales específicas.

## Casos de uso

- Fine-tuning para atención al cliente especializada: al ser un modelo base, se puede ajustar con datos propios de la empresa para gestionar consultas multi-turno con contexto largo, aprovechando la ventana de 262K tokens.
- Extracción de características para sistemas de recuperación aumentada (RAG): los embeddings generados por el modelo pueden utilizarse para indexar y recuperar información en corpus extensos.
- Generación de código en entornos de desarrollo integrado: tras un fine-tuning con ejemplos de código propietario, el modelo puede asistir en autocompletado y revisión de código.
- Análisis de documentos multimodales: combinando visión y texto, permite procesar facturas, informes escaneados o capturas de pantalla en tareas de extracción de datos.
- Investigación en razonamiento multi-paso: su arquitectura MoE y contexto largo lo hacen adecuado para experimentos en agentes autónomos y planificación.
- Desarrollo de asistentes multilingües: con soporte para 201 idiomas, puede adaptarse mediante fine-tuning a mercados locales específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este merge en la información disponible. El modelo base Qwen3.5-35B-A3B-Base cuenta con métricas oficiales de Qwen (MMLU, HumanEval, GSM8K, etc.) que no se han reproducido aquí por falta de datos en los resultados de búsqueda. Se recomienda consultar la documentación oficial de Qwen para obtener cifras comparativas.

## Requisitos de hardware

- VRAM estimada: con 35B parámetros totales, la inferencia en precisión fp16 requiere aproximadamente 70 GB de VRAM. Con cuantización a 8 bits se reduce a ~35 GB, y a 4 bits a ~18 GB. Sin embargo, al tener solo 3B activos, la memoria de activaciones es menor, lo que permite ejecutar el modelo en GPUs consumer con cuantización agresiva.
- GPU recomendadas: para fp16 se necesitan A100 80GB, H100 80GB o similares. Con cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, aunque no está confirmado para este merge.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se genera GGUF), TGI (Text Generation Inference). El formato safetensors es compatible con la mayoría de frameworks.
- Latencia y throughput: no disponibles para este merge. El modelo base, con 3B activos, ofrece una velocidad de generación significativamente mayor que un modelo denso de 35B, típicamente entre 50-100 tokens/segundo en hardware moderno, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Base (este merge) | 35B | 3B | 262K | Apache-2.0 | Multimodal, 201 idiomas |
| Qwen3-30B-A3B | 30B | 3B | 128K | Apache-2.0 | Versión anterior, sin multimodal |
| DeepSeek-V3 (MoE) | 671B | 37B | 128K | MIT | Mucho mayor, requiere hardware especializado |
| Mixtral 8x7B | 47B | 13B | 32K | Apache-2.0 | MoE denso, sin multimodal |

La comparativa se basa en las características del modelo base, no del merge específico. No se dispone de datos de rendimiento para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La documentación del merge es prácticamente inexistente: no se especifican los datos de entrenamiento, el método de fusión ni las diferencias con el modelo base.
- Al ser un modelo base, no está alineado para conversación directa; puede producir respuestas incoherentes o irrelevantes si se usa sin fine-tuning.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en dominios especializados.
- Sesgos potenciales: al entrenarse en datos web multilingües, puede reflejar sesgos culturales o de género. No se han evaluado específicamente para este merge.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si se utiliza con fines de alto riesgo (ver políticas de Qwen).
- El tamaño del repositorio (55.6 GB) implica que la descarga y el despliegue requieren recursos considerables de almacenamiento y memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoseG/Qwen3.5-35B-A3B-Base-8be64d30-Merged
- Modelo base Qwen3.5-35B-A3B-Base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Página de Qwen3.5-35B-A3B (general): https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Entrada en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
- Ficha en Weights & Biases: https://wandb.ai/site/inference-model/cw_qwen_qwen3.5-35b-a3b/
- Análisis de hardware en CanIRun: https://www.canirun.ai/model/qwen3.5-35b-a3b
