# dudeperf3ct/qwen35-4b-kodcode-rlvr-1k

## Resumen

El modelo `dudeperf3ct/qwen35-4b-kodcode-rlvr-1k` es un fine-tuning experimental de Qwen3.5-4B mediante aprendizaje por refuerzo con recompensas verificables (RLVR) sobre 1.000 prompts de Python. Desarrollado por el usuario dudeperf3ct, el experimento compara dos configuraciones: una con generación directa y otra con razonamiento habilitado, ambas partiendo de checkpoints SFT distintos. El objetivo es mejorar la capacidad del modelo para generar código que pase tests públicos, utilizando GRPO (Group Relative Policy Optimization) con una recompensa binaria.

La relevancia de este modelo radica en que explora una metodología de entrenamiento con verificación externa de código, un enfoque cada vez más usado para alinear modelos de programación. Al ser un experimento de investigación, no está pensado para producción directa, pero sus resultados pueden informar futuros desarrollos. El repositorio tiene un tamaño de 1.0 GB, lo que sugiere que contiene pesos o adaptadores, aunque no se especifica el formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-4B (arquitectura híbrida con Gated Delta Networks y Gated Attention, según fuentes externas) |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés y código, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB, sin especificar) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un modelo compacto de Alibaba Cloud con arquitectura híbrida que combina Gated Delta Networks y Gated Attention en un patrón 8×(3×DeltaNet→FFN→1×Attention→FFN). Sobre esta base, el autor aplica dos experimentos de RLVR con LoRA GRPO, cada uno con una época, semilla 42 y ocho rollouts por prompt. La recompensa es binaria: 1.0 si todos los tests públicos pasan, 0.0 en caso contrario. Los tests se ejecutan en sandboxes aislados de Modal con red deshabilitada, y solo se verifica la respuesta final tras la etiqueta `response`, ignorando el trace de razonamiento.

El entrenamiento usa Axolotl 0.18.0 con vLLM para el servidor de rollouts, y requiere dos GPUs H100 (una para vLLM y otra para el entrenamiento). Se aplican parches temporales a Axolotl y TRL para compatibilidad. Los grupos donde las ocho recompensas son iguales se omiten por falta de señal de aprendizaje.

## Capacidades

- Generación de código Python con verificación de tests públicos.
- Dos modos de generación: directa (sin razonamiento explícito) y con razonamiento habilitado (thinking mode).
- Optimización específica para problemas de programación con recompensa verificable.
- Capacidad de ejecutar código en sandboxes aislados durante el entrenamiento (no necesariamente en inferencia).
- No se documentan capacidades multilingües, tool calling ni otras funciones más allá del código.

## Casos de uso

- Generación de soluciones a problemas de programación competitiva: el modelo puede producir código Python que pasa tests, útil para plataformas de entrenamiento o evaluación automática.
- Asistente de desarrollo con verificación automática: integrado en un pipeline que ejecuta tests, puede sugerir correcciones basadas en resultados.
- Investigación en RLVR: sirve como referencia para estudiar el efecto del razonamiento habilitado en el aprendizaje por refuerzo con recompensas binarias.
- Benchmarking de metodologías de entrenamiento: comparar el rendimiento de direct vs. reasoning en tareas de código.
- Generación de código en entornos controlados donde se requiere alta precisión en tests unitarios.
- Fine-tuning posterior: los adaptadores LoRA pueden servir como punto de partida para otros experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: se documenta el uso de dos NVIDIA H100 80GB HBM3, una para el servidor vLLM y otra para el entrenamiento.
- Inferencia: no se especifican requisitos. Dado que el modelo base tiene 4B parámetros, podría ejecutarse en GPUs consumer con al menos 8-12 GB de VRAM en cuantización, pero no hay confirmación.
- Opciones de despliegue: no se mencionan herramientas específicas para inferencia, aunque al estar basado en Qwen3.5-4B, podría usarse con vLLM, llama.cpp u Ollama, pero sin garantía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de la misma categoría. El modelo base Qwen3.5-4B podría compararse con otros modelos de 4B como Llama-3.2-3B o Phi-3.5-mini, pero no hay resultados de este fine-tuning para establecer una comparación objetiva.

## Limitaciones y advertencias

- Es un experimento de investigación con 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La licencia no está especificada, por lo que no se garantiza su uso comercial.
- El entrenamiento se realizó sobre solo 1.000 prompts de Python, lo que puede provocar sobreajuste a ese conjunto y falta de generalización.
- No se documentan sesgos, pero al ser un modelo de código, puede heredar sesgos del dataset base.
- Riesgo de alucinación en código: aunque la recompensa verifica tests, no se garantiza que el código generado sea correcto en todos los casos.
- La fecha de creación (2026-08-28) es futura, lo que sugiere que el modelo puede ser parte de un proyecto en curso o una simulación.
- No hay información sobre el contexto máximo soportado ni sobre el formato de los pesos, lo que dificulta su despliegue.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/dudeperf3ct/qwen35-4b-kodcode-rlvr-1k)
- [Dataset asociado](https://huggingface.co/datasets/dudeperf3ct/qwen35-kodcode-rlvr-data)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Especificaciones de Qwen3.5-4B (fuente externa)](https://apxml.com/models/qwen35-4b)
