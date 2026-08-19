# bodenmaurice/unconst-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged

## Resumen

Este modelo es un experimento de fine-tuning mediante *offline DPO* (Direct Preference Optimization) sobre un modelo base denominado `Affine-5czsc2fc98-r252-merged`, desarrollado por el usuario `bodenmaurice`. Se enmarca dentro de un proyecto de investigación orientado a mejorar capacidades de razonamiento (etiqueta `reason-v3`) sobre arquitecturas de mezcla de expertos (MoE). El modelo resultante tiene 35.107.181.936 parámetros totales (≈35,1B) y una longitud de contexto de 16.384 tokens según los hiperparámetros de entrenamiento.

El entrenamiento consistió en *offline DPO* sobre pares de preferencia de razonamiento generados por un modelo "teacher", utilizando LoRA con r=64 y α=128, un beta de 0.02 y una tasa de aprendizaje de 5e-6. El proceso se detuvo en el paso 312 de 2400 por agotamiento de los datos, lo que sugiere un entrenamiento incompleto. El modelo se distribuye bajo licencia Apache 2.0 y en formato `safetensors`, con un tamaño de repositorio de 70,2 GB (compatible con pesos en BF16).

A pesar de su naturaleza experimental (0 descargas, 0 likes), el modelo podría ser de interés para investigadores que estudien técnicas de *offline DPO* en arquitecturas MoE, aunque no se dispone de resultados de benchmarks ni de validación pública que respalden su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con atención afin (affine) y SN120 |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (según max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura MoE identificada como `qwen3_5_moe`, con una variante "affine" que sugiere el uso de transformaciones afines en las capas de atención o en las proyecciones internas del transformer. El tag `sn120` podría referirse a una técnica de atención dispersa o a un tamaño de ventana específico, aunque no se dispone de detalles técnicos adicionales. El modelo base `Affine-5czsc2fc98-r252-merged` es a su vez un *merge* de otro modelo, lo que indica una cadena de refinamiento previo.

El entrenamiento utilizó *offline DPO* con pares de preferencia de razonamiento (etiquetados como `dpo_duel_reason.jsonl`), filtrados por longitud de contexto (LongCtx). Se aplicó LoRA con r=64 y α=128, un beta de 0.02, y una longitud máxima de 16.384 tokens. El entrenamiento se detuvo en el paso 312 de 2400 por agotamiento de datos, lo que implica que el modelo no completó el ciclo previsto. No se mencionan técnicas adicionales como RLHF, decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: el modelo fue entrenado con pares de preferencia de razonamiento, lo que sugiere una optimización para tareas de razonamiento lógico y matemático.
- Arquitectura MoE: al ser un modelo de mezcla de expertos, ofrece eficiencia computacional al activar solo una fracción de los parámetros durante la inferencia.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Dado que no se dispone de información sobre capacidades específicas ni benchmarks, los casos de uso son especulativos y deben tomarse con cautela:

- Razonamiento matemático: podría emplearse para resolver problemas matemáticos complejos, aunque sin resultados de evaluación no se puede confirmar su eficacia.
- Análisis de documentos extensos: con una ventana de 16.384 tokens, podría procesar informes o artículos largos, pero no hay datos sobre su calidad en esta tarea.
- Investigación académica: como modelo experimental con licencia Apache 2.0, puede servir para estudiar técnicas de *offline DPO* en arquitecturas MoE o como base para fine-tuning adicional.
- Evaluación comparativa: podría utilizarse como referencia en estudios que comparen métodos de alineación (DPO vs RLHF) en modelos de tamaño medio.
- Prototipado rápido: al ser de código abierto, permite experimentar con configuraciones de inferencia (cuantización, despliegue) sin coste de licencia.
- Fine-tuning específico: al estar bajo Apache 2.0, se puede adaptar a dominios concretos (legal, médico, etc.) siempre que se disponga de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "sim evidence" con n80 y una regla de decisión (paired margin > max(2·SE, δ=0.002), median thought ≥80, B pass ≥0.30), pero no se proporcionan valores numéricos concretos. Por tanto, no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: 35,1B parámetros en BF16 requieren aproximadamente 70 GB de VRAM. En cuantización de 8 bits se reduce a ~35 GB, y en 4 bits a ~18 GB.
- GPU recomendadas: para ejecutar el modelo en BF16 completo se necesitan GPUs profesionales como NVIDIA A100 80GB, H100 o similares. También es posible usar varias GPUs (por ejemplo, 2× RTX 4090 con 24 GB cada una) si se distribuye el modelo.
- Compatibilidad con consumer GPU: una RTX 4090 (24 GB) podría ejecutar el modelo con cuantización de 4 bits o 8 bits, aunque con limitaciones de velocidad y posible degradación de calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. No se especifica compatibilidad oficial.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables. Podría establecerse una comparación con otros MoE de tamaño similar, como Mixtral 8x7B (47B totales, 13B activos) o Qwen1.5-MoE-A2.7B (14B totales, 2.7B activos), pero las diferencias arquitectónicas y la falta de benchmarks hacen que la comparación no sea concluyente. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Modelo experimental sin validación pública: cuenta con 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- Entrenamiento incompleto: se detuvo en el paso 312 de 2400, lo que podría implicar un modelo subentrenado o con capacidades limitadas.
- Sesgos y alucinaciones: no se conocen, pero al ser un modelo sin evaluación externa, el riesgo de alucinación y sesgos es desconocido.
- Limitaciones de contexto: 16.384 tokens es una ventana moderada; puede ser insuficiente para aplicaciones que requieran contextos más largos.
- Idiomas: no se especifican, pero probablemente esté optimizado para inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al no haber documentación de rendimiento, no se recomienda su uso en producción.
- Disponibilidad: el repositorio no muestra actividad ni actualizaciones posteriores a su creación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged
- Modelo base (inferido): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Modelo relacionado: https://huggingface.co/unconst/Affine-5czsc2fc98-h73-lora

La búsqueda web no arrojó resultados adicionales relevantes sobre este modelo.
