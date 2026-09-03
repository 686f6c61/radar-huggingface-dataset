# JWei05/gemma-4-26B-A4B-DeepScaleR-hard-s42-fullckpt-step47

## Resumen

Este repositorio contiene un checkpoint completo de entrenamiento de refuerzo (RL) sobre el modelo base `google/gemma-4-26B-A4B`, generado con el framework verl (FSDP2) y los algoritmos DAPO/GRPO. El autor, JWei05, lo publica como un "full resumable checkpoint" en el paso global 47, dentro de un experimento denominado "DeepScaleR hard band" con semilla 42. No se trata de un modelo listo para inferencia, sino de un estado intermedio que incluye pesos del actor, estado del optimizador Adam, estado del scheduler de LR, el cursor del dataloader y el estado de early stopping, con el objetivo de poder reanudar el entrenamiento en otro clúster con 8 GPUs.

El modelo base, Gemma 4 26B-A4B, es una arquitectura Mixture-of-Experts (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, desarrollada por Google DeepMind. Soporta una ventana de contexto de hasta 256K tokens y más de 140 idiomas. Este checkpoint de RL busca mejorar las capacidades de razonamiento del modelo base mediante entrenamiento con refuerzo sobre un subconjunto de datos considerado "difícil" (hard band), probablemente derivado de conjuntos de razonamiento matemático o lógico. Su relevancia radica en que permite a la comunidad investigadora reproducir y continuar experimentos de RL a gran escala, aunque no está pensado para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer (base: google/gemma-4-26B-A4B) |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (A4B) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | no disponible (checkpoint de entrenamiento, no cuantizado) |
| Idiomas soportados | mas de 140 (modelo base) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | Shards FSDP2 (actor/model_world_size_8_rank_{0..7}.pt, optim_world_size_8_rank_{0..7}.pt, extra_state_world_size_8_rank_{0..7}.pt) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26B parámetros totales y 4B activos por token, diseñado por Google DeepMind. Incluye soporte nativo para el rol de sistema y un modelo draft dedicado para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad. El checkpoint aquí descrito se obtiene aplicando RL con los algoritmos DAPO (Decoupled Alignment Policy Optimization) y GRPO (Group Relative Policy Optimization) sobre este base, utilizando el framework verl con paralelismo FSDP2. El entrenamiento se realizó sobre un subconjunto de datos etiquetado como "hard band" (banda difícil), con semilla 42, y se guardó en el paso global 47. El repositorio incluye el estado completo del optimizador Adam, el estado del scheduler de LR, el cursor del dataloader (data.pt) y el estado de early stopping (validation_early_stopping.json), que registra un mejor mean@16 de 0.21104 en el paso 40. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Al ser un checkpoint de RL sobre Gemma 4 26B-A4B, hereda las capacidades del modelo base: generación de texto, razonamiento, codificación y comprensión multilingüe en más de 140 idiomas.
- El entrenamiento con DAPO/GRPO está orientado a mejorar el razonamiento, especialmente en tareas de matemáticas y lógica, aunque no se especifican métricas concretas en este checkpoint.
- Soporta tool calling y function calling, así como razonamiento multi-paso, gracias a las capacidades del modelo base.
- Incluye decodificación especulativa mediante un modelo draft, lo que permite inferencia más rápida (aunque este checkpoint no está preparado para inferencia directa).
- No se dispone de información sobre capacidades de visión o audio; el modelo base es puramente textual.

## Casos de uso

- Reanudación de entrenamiento RL: el propósito principal de este checkpoint es permitir continuar el entrenamiento desde el paso 47 en otro clúster con 8 GPUs, manteniendo la misma configuración FSDP2, rutas de datos, semilla de shuffle, tamaño de batch y número de respuestas. Es útil para investigadores que quieran reproducir o extender el experimento.
- Análisis de dinámicas de RL: al incluir el estado del optimizador y del scheduler, se puede estudiar la evolución de la pérdida, la recompensa y la estabilidad del entrenamiento en pasos intermedios.
- Fine-tuning adicional: a partir de este checkpoint se puede aplicar un nuevo ciclo de RL o un fine-tuning supervisado (SFT) sobre dominios específicos, aprovechando el conocimiento ya adquirido en el "hard band".
- Evaluación de la trayectoria de aprendizaje: los investigadores pueden cargar los pesos del actor en el paso 47 y evaluar el rendimiento del modelo en benchmarks de razonamiento para comparar con el modelo base o con otros checkpoints de pasos anteriores.
- Desarrollo de métodos de RL: el repositorio sirve como referencia para implementar y depurar pipelines de RL con verl, FSDP2 y DAPO/GRPO, ya que incluye todos los artefactos necesarios para reanudar.
- Investigación sobre selección de datos difíciles: el experimento "hard band" permite estudiar cómo el entrenamiento con subconjuntos de alta dificultad afecta al rendimiento final, y este checkpoint es un punto de control para ese análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es el mean@16 de 0.21104 en el paso 40, registrado en el archivo de early stopping, pero no se especifica sobre qué conjunto de evaluación se calculó ni cómo se compara con otros modelos.

## Requisitos de hardware

- Para reanudar el entrenamiento se requieren exactamente 8 GPUs (world_size=8) con la misma disposición FSDP2, ya que los shards están particionados para ese tamaño.
- El tamaño total del repositorio es de 305.4 GB, lo que implica que cada shard de pesos del actor ocupa aproximadamente 38 GB (305.4 / 8), más el estado del optimizador y del scheduler, que duplican o triplican el uso de VRAM. Se recomiendan GPUs con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) para alojar los shards y el estado del optimizador.
- No se recomienda usar este checkpoint para inferencia directa; para ello se debe utilizar el modelo base `google/gemma-4-26B-A4B` o sus versiones cuantizadas (GGUF, etc.) que caben en GPUs de consumo como RTX 4090 (24 GB) con cuantización de 4 bits.
- Para inferencia del modelo base, se pueden usar motores como vLLM, llama.cpp, Ollama o TGI, que soportan MoE y decodificación especulativa.
- No se dispone de datos de latencia o throughput para este checkpoint específico.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros checkpoints de RL similares, ya que no se han publicado métricas de rendimiento. Como referencia, se puede comparar el modelo base con otras alternativas de razonamiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-4-26B-A4B (base) | 26B totales, 4B activos | 256K | Gemma | Hugging Face |
| DeepSeek-R1-Distill-Qwen-32B | 32B densos | 128K | MIT | Hugging Face |
| Qwen3-30B-A3B | 30B totales, 3B activos | 128K | Apache 2.0 | Hugging Face |

Este checkpoint no es comparable directamente porque es un artefacto de entrenamiento, no un modelo final.

## Limitaciones y advertencias

- Este checkpoint no es un modelo de inferencia: contiene shards FSDP2 y estado del optimizador, no pesos en formato safetensors o GGUF. Intentar cargarlo con herramientas estándar de inferencia fallará.
- Requiere el framework verl y una configuración específica de 8 GPUs con FSDP2 para reanudar el entrenamiento; no es portable a otros entornos sin adaptación.
- El entrenamiento se detuvo en el paso 47, un punto temprano del proceso de RL; el rendimiento final del modelo no está garantizado y puede ser inferior al de un checkpoint posterior.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad para este checkpoint. Al ser un modelo derivado de Gemma 4, hereda los riesgos del base, incluyendo posibles sesgos en datos multilingües y generación de contenido incorrecto.
- La licencia Gemma impone restricciones de uso comercial; se debe revisar el acuerdo de licencia de Google antes de cualquier uso en producción.
- El tamaño del repositorio (305.4 GB) y la necesidad de 8 GPUs hacen que su uso sea inviable para la mayoría de entornos de desarrollo locales.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/JWei05/gemma-4-26B-A4B-DeepScaleR-hard-s42-fullckpt-step47
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Modelo base instruct: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Visión general de Gemma 4: https://ai.google.dev/gemma/docs/core
