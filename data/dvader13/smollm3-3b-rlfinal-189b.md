# dvader13/smollm3-3b-rlfinal-189b

## Resumen

El modelo `dvader13/smollm3-3b-rlfinal-189b` es un checkpoint intermedio de entrenamiento por refuerzo (RL) sobre la base SmolLM3-3B de Hugging Face. Fue publicado por el usuario dvader13 y corresponde al final de la primera época de un proceso de RL, con el estado completo del entrenamiento (pesos en fp32, optimizador, scheduler y RNG) para poder reanudar el entrenamiento desde ese punto. No es un modelo listo para inferencia, sino un artefacto de investigación para continuar o analizar el proceso de RL.

El checkpoint se basa en SmolLM3-3B, un modelo de lenguaje compacto de 3 mil millones de parámetros desarrollado por Hugging Face, entrenado sobre 11 billones de tokens (según el repositorio oficial) o 10+ billones (según el PDF de transparencia), con una ventana de contexto de 128K tokens y soporte nativo para seis idiomas europeos. Este checkpoint concreto fue preentrenado con un lote de 189 mil millones de tokens (rung `189B`) antes de la fase de RL, y se encuentra en el paso 1804 del entrenamiento.

La relevancia de este modelo radica en que permite a la comunidad investigadora examinar y reanudar un proceso de RL sobre un modelo base de código abierto, algo poco común en la práctica. Al ser un checkpoint con estado completo, facilita la reproducibilidad y el estudio de la dinámica de entrenamiento por refuerzo en modelos de lenguaje pequeños pero capaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE (heredada de SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32, no es un export de inferencia) |
| Idiomas soportados | no disponible (el modelo base soporta 6 idiomas europeos, pero este checkpoint no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | fp32 (pesos completos + optimizador + scheduler + RNG, probablemente en safetensors, aunque no se confirma) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B utiliza una arquitectura Transformer decoder con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV, y prescinde de RoPE (Rotary Position Embedding), lo que mejora el rendimiento en tareas de contexto largo. El checkpoint `rlfinal-189b` corresponde a una fase de RL aplicada sobre este modelo, que previamente fue preentrenado con 189 mil millones de tokens (rung `189B`). El entrenamiento de RL se ejecutó durante una época completa, alcanzando el paso 1804, y se guardó el estado completo (fp32) para permitir la reanudación.

No se dispone de detalles sobre el algoritmo de RL utilizado (PPO, GRPO, etc.), el dataset de recompensa ni las métricas de recompensa durante el entrenamiento. El autor solo indica que es un "checkpoint de RL final de época 1" y que es "resumible, no un export de inferencia". Esto implica que el archivo contiene no solo los pesos del modelo, sino también el estado del optimizador, el scheduler de aprendizaje y el generador de números aleatorios, lo que lo hace útil para continuar el entrenamiento o para análisis de dinámica de RL.

## Capacidades

- No es un modelo de inferencia: al ser un checkpoint de entrenamiento con estado completo, no se puede cargar directamente en frameworks de inferencia como vLLM u Ollama sin una conversión previa.
- Permite reanudar el entrenamiento de RL desde el paso 1804, lo que facilita experimentos de continuación, ajuste de hiperparámetros o análisis de la trayectoria de aprendizaje.
- El modelo base SmolLM3-3B (sobre el que se construye este checkpoint) es capaz de generación de texto, razonamiento, código y matemáticas, con soporte para tool calling y modo de razonamiento dual (según la documentación oficial), pero estas capacidades no son directamente accesibles en este checkpoint.
- Al estar basado en SmolLM3-3B, hereda la ventana de contexto de 128K tokens y el soporte multilingüe (seis idiomas europeos) del modelo base, aunque no se garantiza que el proceso de RL haya preservado estas capacidades sin evaluación.

## Casos de uso

- Investigación en RL para modelos de lenguaje: este checkpoint permite estudiar cómo evoluciona el comportamiento del modelo durante el entrenamiento por refuerzo, analizando la recompensa, la divergencia con el modelo base y la estabilidad del entrenamiento.
- Reanudación de entrenamiento: si un investigador quiere continuar el RL desde el punto exacto donde se detuvo, puede cargar este checkpoint y seguir entrenando sin perder el progreso del optimizador y el scheduler.
- Reproducibilidad de experimentos: al incluir el estado RNG, se puede reproducir exactamente la secuencia de entrenamiento, lo que es valioso para verificar resultados o comparar variantes de RL.
- Fine-tuning posterior: aunque no es un modelo de inferencia, se puede usar como punto de partida para un fine-tuning adicional con otros objetivos (por ejemplo, preferencias humanas o tareas específicas) antes de convertirlo a un formato de inferencia.
- Análisis de dinámica de optimización: los pesos fp32 y el estado del optimizador permiten inspeccionar gradientes, momentos y tasas de aprendizaje en ese paso concreto, útil para depurar o entender el comportamiento del RL.
- Desarrollo de pipelines de RL open source: sirve como ejemplo práctico de cómo se guardan y comparten checkpoints de RL completos, facilitando la adopción de buenas prácticas en la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint no es un modelo de inferencia final, por lo que no tiene sentido evaluarlo directamente en tareas estándar como MMLU o HumanEval. El modelo base SmolLM3-3B, según el repositorio oficial, supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con alternativas de 4B como Qwen3 y Gemma3, pero esos datos corresponden al modelo base, no a este checkpoint de RL.

## Requisitos de hardware

- El checkpoint ocupa 36.9 GB en disco, lo que corresponde a pesos fp32 (3B parámetros × 4 bytes ≈ 12 GB) más el estado del optimizador (Adam típicamente duplica o triplica el tamaño), scheduler y RNG.
- Para reanudar el entrenamiento se necesita una GPU con al menos 40-48 GB de VRAM (por ejemplo, A100 40GB, A100 80GB, H100 80GB) para alojar el modelo, el optimizador y los gradientes en fp32.
- En GPUs de consumo (RTX 4090 con 24 GB) no es viable cargar el estado completo en fp32; se requeriría una conversión a precisión mixta o a un formato de inferencia, lo que anularía la capacidad de reanudación.
- Para inferencia, si se convierte el checkpoint a un formato como bf16 o int8, se podría ejecutar en GPUs de 12-16 GB, pero esto no es el propósito de este artefacto.
- Opciones de despliegue: no aplicable directamente; para continuar entrenamiento se usaría un framework como PyTorch con Hugging Face Transformers o un framework de RL como TRL, con soporte para DeepSpeed o FSDP para distribuir el estado en múltiples GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| dvader13/smollm3-3b-rlfinal-189b | 3B | 128K (base) | Apache-2.0 | Checkpoint fp32 (entrenamiento) | Investigacion en RL, reanudacion |
| HuggingFaceTB/SmolLM3-3B | 3B | 128K | Apache-2.0 | safetensors (inferencia) | Generacion de texto, codigo, razonamiento |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Generacion de texto, codigo |
| Qwen2.5 3B | 3B | 32K (base) | Apache-2.0 | safetensors, GGUF | Generacion de texto, codigo, multilingue |

La comparativa muestra que este checkpoint no es directamente comparable con modelos de inferencia, ya que su propósito es el entrenamiento. El modelo base SmolLM3-3B es la referencia natural para evaluar el impacto del RL, pero no se dispone de datos de rendimiento de este checkpoint específico.

## Limitaciones y advertencias

- No es un modelo de inferencia: intentar cargarlo en un framework de producción fallará o dará resultados incorrectos, ya que incluye estado de optimizador y no está diseñado para generar texto.
- Tamaño y formato: el checkpoint ocupa 36.9 GB y está en fp32, lo que dificulta su uso en hardware limitado y requiere conversión para cualquier tarea de inferencia.
- Sin información sobre el proceso de RL: se desconoce el algoritmo, la función de recompensa, los datos utilizados y las métricas de rendimiento, por lo que no se puede evaluar la calidad del modelo resultante.
- Sesgos y alucinaciones: al ser un checkpoint intermedio, no se ha evaluado su comportamiento en cuanto a sesgos, toxicidad o veracidad; el modelo base ya presenta riesgos inherentes de alucinación y sesgos de los datos de entrenamiento.
- Licencia: aunque la licencia es Apache-2.0, el uso comercial del checkpoint está permitido, pero al no ser un modelo final, su aplicación práctica en productos es limitada.
- Reproducibilidad limitada: el autor no proporciona detalles sobre el entorno de entrenamiento, versiones de librerías o configuraciones, lo que puede dificultar la reanudación exacta en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvader13/smollm3-3b-rlfinal-189b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentacion de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- PDF de transparencia de SmolLM3-3B: https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf
- Ficha de SmolLM3-3B en atomic.chat: https://atomic.chat/models/smollm3-3b
