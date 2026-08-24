# Saraswathy/vlm-mix-resume-stem40-geo30-nongeo30-step25

## Resumen

Saraswathy/vlm-mix-resume-stem40-geo30-nongeo30-step25 es un checkpoint de reanudación de entrenamiento (training-resume state) publicado por el autor Saraswathy, correspondiente al paso 25 de un experimento de entrenamiento con el framework EasyR1. No se trata de un modelo final listo para inferencia, sino de un estado completo que incluye los shards del modelo FSDP y del optimizador, estado extra, estado del dataloader y el adaptador LoRA. El modelo base sobre el que se entrena es Qwen/Qwen3-VL-4B-Instruct, un modelo multimodal de 4.000 millones de parámetros con capacidades de visión y texto.

El nombre del repositorio indica la mezcla de datos utilizada en ese paso: 40 % de STEM, 30 % de geometría y 30 % de no geometría. Es parte de una serie de experimentos del mismo autor sobre entrenamiento de VLM con razonamiento (GRPO), como se refleja en los repositorios hermanos `vlm-mix-stem60-geometry40-direct-step100` y `vlm-mix-broader-stem-expert-step100`. Este repositorio en concreto tiene 0 descargas y 0 likes, y se creó el 24 de agosto de 2026.

Su relevancia es principalmente metodológica: sirve como punto de control para reanudar el entrenamiento en un experimento concreto de RL (reinforcement learning) sobre un VLM, no como un modelo desplegable. El repositorio pesa 11,8 GB, lo que refleja que contiene los estados completos del entrenador, no solo el adaptador LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-VL-4B-Instruct (VLM multimodal) |
| Parametros totales | no disponible (el adaptador LoRA es una fracción del modelo base de 4B) |
| Parametros activos | no disponible (depende de la configuración LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint de entrenamiento, no de inferencia) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards FSDP + adaptador LoRA, vía PEFT) |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura del modelo Qwen3-VL-4B-Instruct, un transformer multimodal que procesa tanto imágenes como texto. El adaptador LoRA se entrena con el framework EasyRL, que implementa GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo para razonamiento. La mezcla de datos del paso 25 es 40% STEM, 30% geometría y 30% no-geometría, lo que indica un diseño de curriculum de entrenamiento orientado a mejorar el razonamiento matemático y geométrico.

El repositorio no es un modelo fusionado: incluye shards de FSDP (modelo y optimizador), estado del dataloader y el adaptador LoRA. La intención explícita es que cualquier persona que quiera reanudar el entrenamiento verifique los archivos contra `SHA256SUMS.json` antes de continuar. No se especifican detalles sobre el dataset exacto, el número de tokens de entrenamiento ni si se usaron técnicas como RLHF o DPO más allá del GRPO mencionado.

## Capacidades

- El modelo base Qwen3-VL-4B-Instruct es multimodal: procesa imágenes y texto, por lo que el adaptador hereda estas capacidades de base.
- El entrenamiento con GRPO está orientado a mejorar el razonamiento visual y matemático, especialmente en geometría (según la composición de datos).
- No se puede garantizar ninguna capacidad específica adicional sin pruebas de evaluación, ya que el checkpoint está a solo 25 pasos de entrenamiento.
- No se documenta soporte de tool calling, agentes ni funciones especiales (thinking mode, audio, etc.) en este repositorio.

## Casos de uso

- **Reanudación de experimentos de investigación**: el uso principal es retomar el entrenamiento desde el paso 25, verificando la integridad con `SHA256SUMS.json`. Es un caso de uso interno para investigadores que trabajan con GRPO sobre VLM.
- **Estudio del efecto de la mezcla de datos**: permite analizar cómo la distribución 40% STEM / 30% geometría / 30% no-geometría afecta al rendimiento en razonamiento visual-matemático, comparando con otros checkpoints del autor como `vlm-mix-stem60-geometry40-direct-step100`.
- **Depuración de pipelines de RL**: al ser un estado completo de EasyRL, se puede usar para depurar o reproducir el flujo de entrenamiento completo, incluyendo el estado del optimizador y del dataloader.
- **Investigación sobre aprendizaje por refuerzo multimodal**: sirve como referencia para estudiar la dinámica de GRPO en modelos de visión-lenguaje, especialmente en etapas tempranas (paso 25).
- **No es apto para inferencia en producción**: al ser un checkpoint de entrenamiento y no un modelo fusionado, no se puede cargar directamente con pipelines de inferencia estándar (vLLM, Ollama, etc.) sin un proceso de fusión del LoRA sobre el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **Para reanudar el entrenamiento**: se requieren GPUs con suficiente VRAM para FSDP sobre un modelo de 4B parámetros. Con sharding FSDP, se puede distribuir en varias GPU; una estimación aproximada sería 8-16 GB de VRAM por GPU para el entrenamiento de 4B, pero no hay datos específicos.
- **Para inferencia (tras fusión del LoRA)**: el modelo base Qwen3-VL-4B-Instruct cabe en GPUs consumer como RTX 3090/4090 (24 GB) o incluso en 16 GB con cuantización, pero no se especifica ninguna cuantización para este checkpoint.
- **Opciones de despliegue**: no aplicable directamente; el checkpoint no está diseñado para despliegue. Para el modelo base, se podrían usar vLLM, TGI, llama.cpp u Ollama, pero con el LoRA fusionado previamente.

## Comparativa con modelos similares

| Modelo | Tipo | Paso | Mezcla de datos | Uso |
|---|---|---|---|---|
| `vlm-mix-resume-stem40-geo30-nongeo30-step25` (este) | Checkpoint de reanudación | 25 | 40% STEM, 30% geo, 30% no-geo | Reanudar entrenamiento |
| `vlm-mix-stem60-geometry40-direct-step100` | Adaptador LoRA | 100 | 60% STEM, 40% geometría | Inferencia directa con el base |
| `vlm-mix-broader-stem-expert-step100` | Adaptador LoRA | 100 | STEM amplio (sin especificar) | Inferencia directa |

Los tres comparten el mismo modelo base (Qwen3-VL-4B-Instruct) y el mismo autor. La diferencia clave es que este repositorio es un checkpoint de entrenamiento, mientras que los otros dos son adaptadores LoRA ya entrenados y listos para su uso. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- **No es un modelo inferencial**: es un checkpoint de reanudación. Intentar cargarlo con un pipeline estándar de inferencia fallará sin una fusión previa del LoRA con el modelo base.
- **Integridad de archivos**: el autor recomienda verificar todos los archivos contra `SHA256SUMS.json` antes de reanudar; no hacerlo puede corromper el entrenamiento.
- **Datos de entrenamiento**: la mezcla de datos (40/30/30) está indicada en el nombre, pero no se proporcionan detalles sobre la composición exacta ni la procedencia de los datos.
- **Licencia no disponible**: no se indica la licencia, lo que limita su uso comercial sin aclaración legal.
- **Sesgos y alucinación**: no se ha evaluado el modelo en estos aspectos. Al ser un modelo multimodal en entrenamiento temprano, el riesgo de alucinación visual y textual es alto y desconocido.
- **Idiomas no disponibles**: no se especifican idiomas soportados, aunque el modelo base Qwen3-VL-4B-Instruct soporta multilingüismo, el adaptador no lo garantiza.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-stem40-geo30-nongeo30-step25
- Repositorio relacionado (LoRA directo): https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Repositorio relacionado (experto STEM): https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Página de FriendliAI para el modelo directo: https://friendli.ai/models/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Sitio personal del autor (investigación sobre VLM y GRPO): https://saraamjith.com/saraamjith.html
