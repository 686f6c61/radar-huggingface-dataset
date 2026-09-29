# SimpleTuner/Qwen-Image-2.1-training-assistant-v3

## Resumen

SimpleTuner/Qwen-Image-2.1-training-assistant-v3 es un adaptador LoRA de tipo "asistente de entrenamiento" construido sobre Qwen-Image-2.1. No es un modelo para generar imágenes en producción: su función es permanecer congelado y activo durante el entrenamiento de un LoRA de concepto con SimpleTuner, absorbiendo las perturbaciones que de otro modo degradarían la coherencia y la calidad de imagen del adaptador que se está entrenando. Después, en inferencia, se desactiva y se usa únicamente el LoRA de concepto resultante sobre el modelo base.

El adaptador se entrenó desde cero durante 30.000 actualizaciones con rango y alpha 64, sobre 8 GPU NVIDIA H100, y cuenta con 67.108.864 parámetros entrenables. El pool de datos son 30.000 imágenes únicas repartidas a partes iguales entre imágenes generadas por Qwen-Image-2.1, imágenes reales de CC12M y imágenes reales de e621. Respecto a la v2, sube el rango de 32 a 64, pasa de 1.000 a 30.000 actualizaciones e introduce el desplazamiento automático del flow schedule.

Es relevante porque aborda un problema práctico del fine-tuning de modelos de difusión modernos: la pérdida de diversidad y de calidad estética cuando se entrena un LoRA sobre un dataset pequeño. La model card lo etiqueta explícitamente como experimental y advierte de que el beneficio aguas abajo de la v3 frente a la v2 todavía no se ha evaluado, por lo que debe tratarse como material de investigación más que como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2.1, un Transformer de difusión (DiT) con 32 capas single-stream en su componente de generación visual |
| Parametros totales | 67.108.864 parámetros entrenables (adaptador LoRA); el modelo base no está incluido en el repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; la model card no declara longitud de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo `license: other`, con `license_name: qwen-research` y enlace a `LICENSE`) |
| Formato de pesos | no disponible explícitamente en la model card; el ecosistema de referencia usa adaptadores PEFT LoRA |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relación con el base | adapter |
| Pipeline | text-to-image |
| Rango / alpha | 64 / 64 |
| Proyecciones de atención entrenadas | `to_q`, `to_k`, `to_v`, `to_out.0` |
| Resoluciones base de entrenamiento | 512, 1024, 1536, 2048, con buckets de aspecto |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-28 |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de SimpleTuner (`lora_type: standard`) aplicado a las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0` de la atención del modelo base, con rango y alpha 64. Sin un LoRA de concepto cargado encima, no genera imágenes por sí mismo: es un módulo de regularización que se mantiene activo y congelado mientras se entrena el adaptador de concepto, y que después se desactiva con `assistant_lora_inference_strength: 0.0`. No tiene palabra de activación y la model card insiste en que no es un adaptador de personaje ni un adaptador de generación en pocos pasos.

El entrenamiento se hizo íntegramente desde cero, sin reanudar ni expandir la v2, durante 30.000 actualizaciones en 8 × NVIDIA H100 con precisión BF16, batch por proceso 2, acumulación 1 y batch efectivo 16, optimizador `adamw_bf16` corregido, learning rate `1e-4` constante tras 25 pasos de warmup y recorte de norma de gradiente global en 1.0. Se activó gradient checkpointing con intervalo 1, no se usó REPA ni regularización adicional, y se empleó el VAE original de Qwen Image 2.1 con tiling desactivado y batch de codificación 1. El pool de datos son 30.000 imágenes únicas, un tercio del pool (10.000) generadas por Qwen Image 2.1 con 40 pasos de inferencia, CFG 1 y BF16 a partir de captions de CC12M; otro tercio son imágenes reales de CC12M usando `long_caption`; y el último tercio son imágenes reales de e621. Tras el checkpoint 1.000, la fase reanudada registró 29.000 batches muestreados: 9.587 sintéticos, 9.676 de CC12M y 9.737 de e621. La innovación técnica destacable es el desplazamiento automático del flow schedule, que la v2 no activaba, y el aumento del pool de datos y del batch efectivo.

## Capacidades

- No es un modelo generativo autónomo: su comportamiento previsto es regular el entrenamiento de un LoRA de concepto de cualquier temática, sin palabra de activación.
- Con el asistente activo y fuerza 1.0 modifica las salidas del modelo base respecto al base desnudo; los grids de validación del autor comparan ambas configuraciones a 40 pasos, CFG 1 y semilla 42.
- Compatible con el flujo `assistant_lora_path` de SimpleTuner, que congela el asistente junto al adaptador de concepto entrenable.
- Compatible con el método de destilación `assistant_lora`, que crea un asistente mediante generación de profesor en línea.
- Opera sobre cuatro resoluciones base (512, 1024, 1536, 2048) y buckets de aspecto; las imágenes sintéticas del dataset conservan 12 backends de resolución y aspecto.
- Soporte de tool calling / function calling: no aplica y no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica y no disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.
- Capacidades especiales: no incluye modo de razonamiento ni visión; es exclusivamente un adaptador para el pipeline text-to-image del modelo base.

## Casos de uso

- Fine-tuning de LoRA de concepto con SimpleTuner: se añade `"assistant_lora_path": "SimpleTuner/Qwen-Image-2.1-training-assistant-v3"` a una configuración de entrenamiento de concepto completa, se mantiene `disable_assistant_lora: false` durante el entrenamiento y se carga el LoRA resultante con el asistente desactivado en inferencia.
- Entrenamiento de estilos o estéticas visuales: con un dataset de referencia pequeño (decenas o pocos cientos de imágenes), el asistente reduce la deriva que suele producirse cuando el adaptador de concepto sobreajusta a la muestra reducida.
- Adaptación de dominio sobre ilustración digital: dado que un tercio del pool de entrenamiento son imágenes de e621, el asistente está expuesto a estilos de ilustración y arte digital, útil si el LoRA de destino pertenece a ese dominio.
- Adaptación de dominio sobre fotografía real: el otro tercio real proviene de CC12M con captions largos, lo que cubre fotografía general y vocabulario descriptivo extenso.
- Investigación reproducible en fine-tuning de difusión: el repositorio publica `training_details.json`, `training_config.json`, `dataloader.json` y `prompts.json`, lo que permite reproducir la receta exacta o auditar el conteo de batches por fuente.
- Pipelines de destilación con profesor en línea: usando `distillation_method: assistant_lora` se puede generar un asistente que produzca objetivos de profesor durante el entrenamiento, en lugar de depender de latentes cacheados.
- Comparativas controladas de asistentes: el autor publica los grids de validación del base desnudo frente al base más v3 en update 30.000, lo que sirve como línea base para medir el efecto del asistente sobre la coherencia.
- Evaluación de la interacción entre asistente y adaptador de concepto: el escenario correcto de evaluación es entrenar aguas abajo con el asistente congelado y activo, y luego inferir con el asistente desactivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card aporta únicamente validaciones cualitativas (grids comparativos entre el modelo base desnudo y el base más asistente v3 en el update 30.000, con fuerza de asistente 1.0, 40 pasos de inferencia, CFG 1 y semilla 42), sin métricas numéricas de FID, CLIP score ni similares. El propio autor indica que el beneficio aguas abajo de la v3 y su comparación con la v2 están pendientes de evaluación.

## Requisitos de hardware

- Entrenamiento del asistente: 8 × NVIDIA H100 en BF16, con batch por proceso 2, acumulación 1 y batch efectivo 16, gradient checkpointing activado con intervalo 1.
- VRAM para entrenamiento aguas abajo con el asistente congelado y activo: no disponible como cifra concreta. La documentación de SimpleTuner para la familia Qwen Image advierte de que se necesitan técnicas agresivas de optimización de memoria y menciona GPUs de 24 GB en ese contexto.
- VRAM para inferencia: no disponible. Depende del modelo base Qwen-Image-2.1, que no está incluido en este repositorio de 0,3 GB.
- GPUs recomendadas: H100 para entrenamiento, según la configuración declarada. Para inferencia, no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el asistente en sí es un adaptador pequeño, pero el modelo base de difusión es el que determina el requisito de VRAM.
- Opciones de despliegue: SimpleTuner (con soporte de assistant-LoRA y del flavour `v2.1` de Qwen Image); el adaptador es un PEFT LoRA, por lo que también es utilizable desde el ecosistema PEFT/diffusers. vLLM, llama.cpp, Ollama y TGI no aplican, al tratarse de un modelo de difusión de imágenes y no de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / alpha | Actualizaciones | Datos de entrenamiento | Hardware | Licencia |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-training-assistant-v3 | LoRA asistente para entrenamiento | 64 / 64 | 30.000 | 30.000 imágenes: 10.000 sintéticas, 10.000 CC12M, 10.000 e621 | 8 × H100, BF16 | qwen-research |
| Qwen-Image-2.1-training-assistant-v2 | LoRA asistente para entrenamiento | 32 / no disponible | 1.000 | Imágenes sintéticas y reales (pool menor que v3) | no disponible | no disponible |
| Qwen-Image-2.1-training-assistant-v1 | LoRA asistente para entrenamiento | no disponible | no disponible | Solo objetivos sintéticos | no disponible | no disponible |
| Qwen/Qwen-Image-2.1 (modelo base) | Modelo de difusión text-to-image y edición | no aplica | no aplica | no disponible en esta ficha | no disponible | qwen-research |

No se han identificado en la información disponible otros asistentes de entrenamiento comparables para Qwen-Image-2.1 fuera de la propia familia v1/v2/v3 de SimpleTuner. La v3 arranca desde un adaptador nuevo y no reanuda ni amplía la v2, por lo que no son versiones acumulativas. El autor mantiene además el repositorio Qwen-Image-2.1-LoRA-experiments como contexto de los asistentes anteriores, pero advierte de que ese material no constituye un resultado de la v3.

## Limitaciones y advertencias

- Estado experimental declarado de forma explícita por el autor en las etiquetas y en el texto de la model card.
- Riesgo de mal uso por confusión de propósito: las imágenes generadas con el asistente activado no representan la configuración de inferencia prevista. La evaluación válida exige entrenar aguas abajo con el asistente congelado y activo, e inferir después con él desactivado.
- Sin palabra de activación y sin comportamiento de adaptador de personaje ni de generación en pocos pasos; usarlo como adaptador de concepto produce resultados fuera de su propósito.
- Beneficio aguas abajo de la v3 frente a la v2 sin evaluar según el propio autor.
- Compatibilidad no verificada con otros flavours de Qwen Image distintos de `v2.1`.
- Sesgos y composición del dataset: un tercio del pool son imágenes de e621, repositorio de arte furry, y otro tercio captions e imágenes de CC12M, con los sesgos propios de un dataset web a gran escala. No se documenta ninguna curación de sesgos.
- Los mismos identificadores de imagen real se reutilizan en cuatro backends de resolución por fuente; no son imágenes únicas adicionales, lo que puede reducir la diversidad efectiva respecto a la cifra nominal de 30.000.
- Riesgo de alucinación o desviación del prompt: no se publican métricas de fidelidad al prompt ni de coherencia para este adaptador.
- Limitaciones de contexto e idioma: no disponibles; la model card no declara idiomas soportados.
- Licencia `qwen-research` (campo `license: other`): no es una licencia permisiva tipo Apache-2.0 y puede restringir el uso comercial. Hay que consultar el fichero `LICENSE` del repositorio antes de cualquier despliegue comercial.
- Adopción nula en el momento de redactar esta ficha: 0 descargas y 0 likes, sin validación externa independiente.
- El repositorio solo contiene el adaptador (0,3 GB); no incluye los pesos del modelo base, que deben obtenerse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v3
- Asistente v2: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v2
- Asistente v1: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v1
- Experimentos con LoRA sobre Qwen-Image-2.1: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Documentación de SimpleTuner para Qwen Image: http://docs.simpletuner.io/quickstart/QWEN_IMAGE/
- Quickstart de Qwen Image en el repositorio de SimpleTuner: https://github.com/Tokugawa-AI/SimpleTuner/blob/main/documentation/quickstart/QWEN_IMAGE.md
- Dataset de imágenes generadas por Qwen Image 2.1: https://huggingface.co/datasets/webshart/qwen-image-2.1-generated-images
- Índices de captions estructurados de CC12M: https://huggingface.co/datasets/webshart/cc12m-structured-captions
- Dataset original CC12M: https://huggingface.co/datasets/laion/conceptual-captions-12m-webdataset
- Dataset e621 2024: https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel
- Índices Webshart de e621: https://huggingface.co/datasets/webshart/e621-2024-webp-4Mpixel-webshart-indices
- Listado de adaptadores de Qwen-Image-2.1 en HuggingFace: https://huggingface.co/models?other=base_model:adapter:Qwen%2FQwen-Image-2.1
