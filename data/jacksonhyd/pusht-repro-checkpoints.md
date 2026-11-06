# JacksonHYD/pusht-repro-checkpoints

## Resumen

`JacksonHYD/pusht-repro-checkpoints` es una colección de pesos de políticas de imitación robótica publicada por Yandong Huang (usuario JacksonHYD) como artefacto de un estudio de reproducibilidad titulado "One Config Value, Thirty Points: Configuration Defaults and the Reproducibility of a Robot Learning Benchmark". No es un modelo de lenguaje, sino un conjunto de seis checkpoints entrenados desde cero sobre el entorno `lerobot/pusht` (empuje de un bloque en 2D con imágenes de 96×96 píxeles), que abarca tres familias de políticas: Diffusion Policy, ACT y SmolVLA.

El interés del artefacto es metodológico: cuantifica cuánto varía la tasa de éxito de un mismo algoritmo según los valores por defecto de configuración de la librería (crop 84², GroupNorm, inicialización del backbone) y la semilla. El resultado central es una brecha de aproximadamente 30 puntos porcentuales entre la receta oficial de Diffusion Policy (64,0 % de éxito con n=50) y los valores por defecto que envía la librería (33,3 % con n=30).

El repositorio ocupa 4,3 GB y solo incluye el subdirectorio `pretrained_model/`; los estados del optimizador no se subieron, por lo que los checkpoints sirven para evaluación pero no para reanudar entrenamiento. Está etiquetado con licencia MIT y librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de imitación robótica: Diffusion Policy, ACT y SmolVLA (action expert con VLM congelado y variante LoRA) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada visual de 96×96 px y estado del robot) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (subconjunto `pretrained_model/` del formato LeRobot) |

## Arquitectura y entrenamiento

Los seis checkpoints cubren tres arquitecturas distintas. Diffusion Policy formula la acción como un proceso de difusión condicionado por observaciones visuales; la receta oficial del paper aplica crop a 84², normalización GroupNorm y un backbone inicializado aleatoriamente. ACT es un transformer de imitación con chunking de acciones (`n_action_steps=10`). SmolVLA emplea un VLM congelado como extractor y entrena un action expert, con una variante adicional que aplica LoRA en lugar de entrenar el experto completo.

Todos los modelos se entrenaron desde cero sobre `lerobot/pusht` (206 demostraciones, 25.650 fotogramas, imágenes de 96×96) en una única RTX 4060 Laptop de 8 GiB. Los pasos de entrenamiento van de 16k (SmolVLA expert) a 200k (Diffusion Policy). La reproducibilidad exacta de las cifras reportadas exige aplicar cuatro parches al commit `7e241bd6` de LeRobot: convolución determinista, sembrado de RNG por batch, ACT sin estado y registro de pasos por episodio. Sin ellos, la evaluación no es reproducible bit a bit.

## Capacidades

- Control robótico por imitación en la tarea PushT: empujar un bloque en forma de T hasta una pose objetivo a partir de observaciones visuales.
- Política de difusión para generación de trayectorias de acción multimodales (Diffusion Policy).
- Chunking de acciones con horizonte de 10 pasos (ACT y SmolVLA).
- Aprendizaje por imitación con pocas demostraciones (206 episodios).
- Variante con adaptación de bajo rango (LoRA) sobre un VLM congelado.
- Evaluación reproducible bajo parches específicos de LeRobot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visuomotor.

## Casos de uso

- Estudio de reproducibilidad en robótica: comparar directamente las tasas de éxito de Diffusion Policy, ACT y SmolVLA bajo el mismo dataset y hardware, usando los checkpoints ya entrenados como línea base.
- Auditoría de valores por defecto de librerías: el par `dp_repro_200000` frente a `dp_official_200000_default_arch` permite medir el impacto de la configuración de la librería (64,0 % frente a 33,3 %) sin reentrenar.
- Docencia en aprendizaje por imitación: los seis checkpoints con éxito documentado y el dataset público `lerobot/pusht` permiten montar prácticas de evaluación en una GPU de consumo.
- Validación de pipelines de evaluación: los parches y los resultados por episodio en `results/eval/` sirven para verificar que un entorno de evaluación propio reproduce las cifras del paper.
- Comparación de estrategias de adaptación: `smolvla_expert_016000` (24 %) frente a `smolvla_lora_032000` (28 %) ofrece un punto de partida para estudiar fine-tuning eficiente sobre VLMs congelados.
- Referencia para investigación en VLA: el checkpoint SmolVLA permite analizar el comportamiento de un action expert sobre un VLM congelado en una tarea de control de baja dimensión antes de escalar a entornos reales.

## Benchmarks y rendimiento

Tasas de éxito reportadas en la model card sobre `lerobot/pusht`:

| Checkpoint | Configuración | Pasos | Éxito | n |
|---|---|---|---|---|
| `dp_repro_200000` | Diffusion Policy, receta oficial | 200k | 64,0 % | 50 |
| `dp_repro_120000` | Diffusion Policy, receta oficial (usado en el 2×2 del paper) | 120k | 63,5 % | 200 |
| `dp_official_200000_default_arch` | Diffusion Policy, defaults de la librería | 200k | 33,3 % | 30 |
| `act_pusht_100k_100000` | ACT, `n_action_steps=10` | 100k | 27,0 % | 200 |
| `smolvla_expert_016000` | SmolVLA action expert (VLM congelado) | 16k | 24 % | 50 |
| `smolvla_lora_032000` | SmolVLA con LoRA | 32k | 28 % | 50 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de propósito general.

## Requisitos de hardware

- Entrenamiento original: una RTX 4060 Laptop con 8 GiB de VRAM, lo que indica que la inferencia cabe holgadamente en GPUs de consumo.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (4,3 GB para seis checkpoints) cada política individual es del orden de cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 8 GiB para entrenamiento según el autor; para inferencia, GPUs de consumo como RTX 3060, RTX 4060 o superiores son suficientes.
- Despliegue: librería LeRobot (requerida por el formato); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Pasos | Éxito en PushT | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dp_repro_200000` (este repo) | Diffusion Policy | 200k | 64,0 % (n=50) | MIT | Hugging Face |
| `dp_official_200000_default_arch` (este repo) | Diffusion Policy (defaults) | 200k | 33,3 % (n=30) | MIT | Hugging Face |
| `act_pusht_100k_100000` (este repo) | ACT | 100k | 27,0 % (n=200) | MIT | Hugging Face |
| `smolvla_lora_032000` (este repo) | SmolVLA + LoRA | 32k | 28 % (n=50) | MIT | Hugging Face |

No se dispone de datos de modelos externos comparables en la información proporcionada; las alternativas de la misma categoría (otras políticas PushT publicadas en LeRobot Hub) no están documentadas aquí.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea PushT en simulación con imágenes de 96×96; no generaliza a otros entornos ni a robótica real sin reentrenamiento.
- Sin estados de optimizador: los checkpoints no permiten reanudar entrenamiento, solo evaluación.
- Reproducibilidad condicionada: las cifras reportadas exigen cuatro parches sobre el commit `7e241bd6` de LeRobot; sin ellos los resultados no son reproducibles bit a bit.
- Tamaños de muestra desiguales: las tasas de éxito se calculan con n entre 30 y 200, lo que afecta a la comparabilidad estadística entre checkpoints.
- Sin información sobre sesgos: no se documentan análisis de sesgo, alucinación ni robustez frente a variaciones visuales.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el artefacto es de investigación.
- Sin datos de cuantización ni de despliegue en producción: no hay guía sobre latencia, throughput o integración en sistemas reales.

## Enlaces

- Hugging Face: https://huggingface.co/JacksonHYD/pusht-repro-checkpoints
- Repositorio del artefacto: https://github.com/JacksonHYD/vla-pusht-repro-artifact
- Dataset de entrenamiento: `lerobot/pusht` (Hugging Face Datasets)
- Librería LeRobot: https://github.com/huggingface/lerobot (commit de referencia `7e241bd6`)
- Paper citado: Huang, Y. (2026), "One Config Value, Thirty Points: Configuration Defaults and the Reproducibility of a Robot Learning Benchmark", arXiv preprint (identificador no disponible)
