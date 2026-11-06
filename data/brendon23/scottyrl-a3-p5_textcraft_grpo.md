# Brendon23/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA (rank 32) publicado por el usuario Brendon23 sobre el modelo base `Qwen/Qwen3.5-4B`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino con PEFT y el framework scottyrl, orientado a tareas de agentes de IA en el contexto del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon (CMU), correspondiente al Assignment 3.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, y se ha exportado desde la infraestructura Tinker (`tinker://model_0a5a654d/v50`). El nombre de la ejecución, `p5_textcraft_grpo`, sugiere que el objetivo es mejorar el comportamiento en TextCraft-Synth, un entorno sintético de tareas de texto utilizado en la evaluación del curso.

Su relevancia es fundamentalmente académica y experimental: sirve para reproducir la evaluación del curso sirviendo el adaptador con vLLM y ejecutando el script de evaluación sobre las particiones de validación medium y hard de TextCraft-Synth. No hay información publicada sobre licencia, idiomas, benchmarks o uso comercial, por lo que debe tratarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-4B; rank 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer denso de aproximadamente 4.000 millones de parámetros. El ajuste se realiza mediante LoRA de rank 32, lo que implica que solo se entrenan las matrices de baja dimensión inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El repositorio ocupa 0,2 GB, coherente con un adaptador de este tipo y no con un modelo completo.

El entrenamiento utiliza GRPO, un algoritmo de optimización por refuerzo con estimación de ventaja relativa por grupos, dentro del framework scottyrl. La ejecución se exportó desde Tinker en la versión `v50` y se corresponde con la configuración `configs/p5_textcraft_grpo.yaml` y el commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de SFT o DPO.

## Capacidades

- Ajuste específico para tareas de agentes de IA en el entorno TextCraft-Synth, según el nombre de la ejecución y el contexto del curso.
- Se sirve como módulo LoRA en vLLM mediante `--enable-lora --max-lora-rank 32`, lo que permite alternar entre el modelo base y el adaptador en el mismo servidor.
- Compatible con el script de evaluación del curso (`scripts/evaluate_checkpoint.py`) con parámetro `--k 4`, orientado a evaluaciones de tipo pass@k o muestreo múltiple.
- Capacidades generales de generación de texto, razonamiento y tool calling: no documentadas de forma explícita para este adaptador; se heredan del modelo base Qwen3.5-4B.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reproducción de la evaluación académica: servir el adaptador con vLLM y ejecutar `evaluate_checkpoint.py` sobre `data/textcraft_val_medium.jsonl` y `data/textcraft_val_hard.jsonl` para verificar los resultados del Assignment 3.
- Investigación en RL para agentes: comparar el comportamiento del adaptador frente al modelo base Qwen3.5-4B en tareas de TextCraft-Synth para medir el efecto de GRPO con LoRA de rank 32.
- Experimentos de ajuste eficiente: usar el adaptador como referencia de un pipeline PEFT + Tinker + scottyrl reproducible en un entorno de investigación con recursos limitados.
- Servido multi-adaptador: desplegar varios adaptadores del curso en un único servidor vLLM con `--lora-modules`, aprovechando que comparten el mismo modelo base y reducen el coste de memoria frente a servir modelos completos.
- Docencia y prácticas: emplear el adaptador como ejemplo práctico de entrenamiento con recompensas en entornos sintéticos de texto para cursos de agentes.
- Evaluación de robustez: analizar la degradación del rendimiento entre las particiones medium y hard de TextCraft-Synth para estudiar la generalización del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo denso de 4B en FP16 requiere del orden de 8 GB solo para pesos, más caché KV y overhead; en cuantización de 4 bits podría situarse en torno a 3-4 GB, aunque no se confirma para este adaptador.
- GPU recomendadas: no disponibles. El flujo de evaluación documentado usa vLLM, que requiere GPU con soporte CUDA (por ejemplo, A100, H100 o RTX 4090), pero el autor no especifica hardware.
- Cabe en GPU de consumo: probablemente sí para el modelo base de 4B en cuantización baja, pero no hay confirmación para este adaptador.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules a3=Brendon23/scottyrl-a3-p5_textcraft_grpo` es el método documentado. Otros backends (llama.cpp, Ollama, TGI) no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | LoRA rank 32 sobre Qwen3.5-4B | no disponible | Adaptador PEFT | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Modelo base denso | no disponible | Hugging Face |
| Otros adaptadores scottyrl del curso (p. ej. otras ejecuciones A3) | LoRA sobre Qwen3.5-4B | no disponible | Adaptador PEFT | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; conviene consultar la licencia del modelo base Qwen3.5-4B y contactar con el autor antes de cualquier despliegue productivo.
- Artefacto académico: el adaptador está entrenado para el Assignment 3 del curso 11-768 y su evaluación se limita a TextCraft-Synth; no hay evidencia de generalización a otras tareas.
- Sin benchmarks publicados: no es posible estimar su calidad relativa frente al modelo base ni frente a otros adaptadores.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en el adaptador.
- Idiomas y sesgos: no documentados; se desconoce el comportamiento fuera del inglés o de los dominios del dataset de entrenamiento.
- Dependencia de vLLM y del script de evaluación del curso: el flujo documentado requiere configuración específica (`--max-lora-rank 32`, `--k 4`) que puede no trasladarse directamente a otros entornos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el estado del artefacto es experimental.

## Enlaces

- Hugging Face: https://huggingface.co/Brendon23/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Curso 11-768 (AI Agents, CMU): no disponible en la información proporcionada
- Framework scottyrl: no disponible en la información proporcionada
- Tinker (infraestructura de entrenamiento): no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
