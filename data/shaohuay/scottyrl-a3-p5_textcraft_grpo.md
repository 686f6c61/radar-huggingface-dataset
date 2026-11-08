# shaohuay/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl en el contexto del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon, como parte de la Assignment 3. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT que debe combinarse con el checkpoint base para su uso.

El adaptador está orientado a tareas de agentes sobre TextCraft-Synth, un entorno de resolución de tareas textuales que requiere razonamiento multi-paso y uso de herramientas. El entrenamiento emplea GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo que no requiere un modelo crítico separado y que se ha popularizado para el ajuste de modelos en tareas con recompensa verificable.

Su relevancia es acotada: se trata de un artefacto académico con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin resultados de benchmarks publicados. Resulta útil como referencia para reproducir el pipeline de entrenamiento con scottyrl y para estudiar la aplicación de GRPO sobre un modelo de 4B parámetros en entornos de agentes, pero no está pensado como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer decoder-only del que no se detallan en la informacion proporcionada ni el número de capas, ni la dimensión oculta, ni la composición del corpus de preentrenamiento. El adaptador en sí es un LoRA de rango 32, lo que implica que solo se entrenan matrices de baja dimensionalidad inyectadas en las capas del modelo base, manteniendo congelados los pesos originales.

El entrenamiento se realizó con el framework scottyrl y la técnica GRPO, un algoritmo de optimización por refuerzo que estima la ventaja relativa de un grupo de respuestas muestreadas para una misma consulta, eliminando la necesidad de un modelo valor independiente. El run se exportó desde `tinker://model_58628dd2/v0` con el nombre `p5_textcraft_grpo` y el commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`. No se especifican en la informacion el número de pasos de entrenamiento, el tamaño del dataset, la composición de las recompensas ni si se aplicaron fases previas de SFT.

## Capacidades

- Razonamiento multi-paso orientado a agentes: el adaptador se entrena específicamente sobre TextCraft-Synth, un entorno que exige descomponer tareas y ejecutar acciones secuenciales.
- Uso de herramientas en el contexto del entorno TextCraft, con recompensas verificables durante el entrenamiento GRPO.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B (capacidades no verificadas de forma independiente para este adaptador).
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos para este adaptador.
- Soporte multilingüe: no disponible en la informacion.

## Casos de uso

- Reproduccion de experimentos academicos: el adaptador sirve para replicar el pipeline de evaluación del curso 11-768 con vLLM y el script `evaluate_checkpoint.py` sobre las particiones medium y hard de TextCraft-Synth.
- Estudio de GRPO sobre modelos pequeños: permite analizar cómo se comporta la optimización por refuerzo con recompensas verificables en un modelo de 4B parámetros sin necesidad de un crítico separado.
- Investigacion en agentes textuales: útil como punto de partida para comparar estrategias de descomposición de tareas y planificación en entornos sintéticos.
- Base para fine-tuning adicional: al ser un adaptador LoRA de rango 32, puede combinarse con otros adaptadores o servir de inicialización para experimentos posteriores con PEFT.
- Docencia y formación: ejemplo práctico de entrenamiento con scottyrl y despliegue con vLLM usando `--enable-lora --max-lora-rank 32`.
- Evaluación de infraestructura de serving LoRA: el flujo documentado con vLLM y múltiples adaptadores permite probar configuraciones de despliegue multi-adaptador en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el procedimiento de evaluación (serving con vLLM y ejecución de `evaluate_checkpoint.py` con `--k 4` sobre las particiones medium y hard de TextCraft-Synth), sin incluir métricas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica. Como referencia, un modelo base de 4B parámetros en fp16 requiere aproximadamente 8 GB solo para los pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no especificadas en la informacion. Para el flujo de evaluación documentado con vLLM se requiere una GPU compatible con vLLM (A100, H100, L40S, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y posiblemente en GPUs de 12-16 GB con cuantización, aunque no se documenta.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules a3=shaohuay/scottyrl-a3-p5_textcraft_grpo`, tal como indica la model card. Otros runners (llama.cpp, Ollama, TGI) no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este) | LoRA r32 sobre 4B | no disponible | no disponible | Hugging Face (0 descargas) | Adaptador académico CMU 11-768 |
| Gary3618/scottyrl-a3-p5_textcraft_grpo | LoRA r32 sobre 4B | no disponible | no disponible | Hugging Face | Mismo adaptador publicado por otro usuario |
| sam4876/scottyrl-a3-p5_textcraft_grpo | LoRA r32 sobre 4B | no disponible | no disponible | Hugging Face | Mismo adaptador publicado por otro usuario |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible en la informacion | Hugging Face | Modelo base sobre el que se aplica el adaptador |

Los tres adaptadores listados corresponden al mismo run exportado por distintos usuarios del curso, por lo que no constituyen alternativas funcionales distintas.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.5-4B` para funcionar.
- Entrenado específicamente para TextCraft-Synth; su rendimiento fuera de ese entorno no está documentado y probablemente sea limitado.
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor y al titular del modelo base.
- Sin idiomas declarados ni datos sobre sesgos; se heredan los del modelo base Qwen3.5-4B, no evaluados aquí.
- Riesgo de alucinación no cuantificado; al ser un ajuste por RL sobre un entorno sintético, puede sobreajustarse a los patrones de ese entorno.
- Sin benchmarks publicados ni métricas de evaluación en la model card; cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- Repositorio de 0.2 GB coherente con un adaptador LoRA, pero sin garantías de mantenimiento o actualización.
- La fecha de creación indicada (2026-11-08) es futura respecto a la mayoría de referencias del ecosistema; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Hugging Face (autor original): https://huggingface.co/shaohuay/scottyrl-a3-p5_textcraft_grpo
- Réplica en Hugging Face: https://huggingface.co/Gary3618/scottyrl-a3-p5_textcraft_grpo
- Réplica en Hugging Face: https://huggingface.co/sam4876/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
