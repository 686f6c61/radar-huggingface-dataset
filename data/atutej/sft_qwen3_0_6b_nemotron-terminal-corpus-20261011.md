# atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011

## Resumen

`sft_qwen3_0_6b_nemotron-terminal-corpus-20261011` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3-0.6B, publicado por el usuario atutej en HuggingFace. El modelo se entrenó sobre las trayectorias de agente de terminal del corpus nvidia/Nemotron-Terminal-Corpus, en concreto sobre las trayectorias terminus-2 generadas con DeepSeek-V3.2 e incluyendo el bloque de "thinking". Se trata, por tanto, de un modelo especializado en tareas de agente de terminal (ejecución de comandos, razonamiento multi-paso sobre salidas de shell), no de un modelo de propósito general.

El modelo cuenta con 596.049.920 parámetros reales (≈0,6B, arquitectura densa), hereda la arquitectura transformer decoder-only de Qwen3 y el contexto de 32.768 tokens de la familia Qwen3 (aunque el entrenamiento descartó ejemplos de más de 16.384 tokens). Su relevancia actual radica en ser un ejemplo muy compacto de destilación de capacidades de agente a partir de trayectorias de un modelo grande (DeepSeek-V3.2), lo que permite desplegar un agente de terminal en hardware muy modesto.

El repositorio es de muy reciente creación (11 de octubre de 2026) y no acumula descargas ni valoraciones. No se han publicado resultados de benchmarks ni una licencia explícita en la ficha de HuggingFace, por lo que cualquier uso en producción debe revisarse con cautela a la luz de las licencias del modelo base y del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (≈0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen3); el entrenamiento descartó ejemplos de mas de 16.384 tokens |
| Tipos de cuantizacion | Pesos guardados en float32; la model card recomienda cargar en bfloat16; no se distribuyen pesos GGUF ni FP8 en el repositorio |
| Idiomas soportados | No disponible en la ficha (el modelo base Qwen3-0.6B declara soporte para 119 idiomas) |
| Licencia | No disponible en la ficha del modelo (base Apache-2.0, dataset CC-BY-4.0) |
| Formato de pesos | safetensors (float32) |
| Tamano del repositorio | 2,4 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Dataset de entrenamiento | nvidia/Nemotron-Terminal-Corpus (adaptador `dataset_adapters`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-0.6B: un transformer decoder-only denso de aproximadamente 0,6B de parámetros, con la plantilla de chat `qwen3` (que separa los bloques de razonamiento "thinking" de la respuesta final). El ajuste no introduce cambios estructurales; se reutilizan los pesos y la tokenización originales. El modelo base Qwen3-0.6B declara un contexto de 32.768 tokens y modos de razonamiento conmutables (thinking / non-thinking), capacidades que el ajuste hereda a nivel de plantilla.

El entrenamiento se realizó con LLaMA-Factory (commit `ce9dc9e0`, plantilla `qwen3`) mediante fine-tuning completo, con pesos maestros en fp32 y autocast en bf16, kernels de Liger y agrupación de lotes por longitud. Se tomó una muestra aleatoria con semilla 0 de 100.000 conversaciones del Nemotron-Terminal-Corpus, expandiendo cada conversación en un ejemplo por turno de asistente: el contexto son los turnos anteriores (con su "thinking" eliminado, tal como hace la plantilla en inferencia) y la pérdida se calcula solo sobre el "thinking" y la respuesta del turno objetivo (`mask_history`). Se descartaron los ejemplos de más de 16.384 tokens en lugar de truncarlos. Hiperparámetros: tasa de aprendizaje 2e-5, schedule coseno, warmup ratio 0,03, 1 época, 24.085 pasos, batch de 4 por dispositivo × 2 de acumulación × 4 GPUs. La pérdida media de entrenamiento fue 0,6442 y la de validación 0,5938 (sobre 1.000 ejemplos retenidos por turno, sin separar por conversación, por lo que el autor la califica de algo optimista).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en el formato de chat Qwen3.
- Razonamiento multi-paso orientado a tareas de terminal: interpretación de comandos, encadenamiento de acciones y lectura de salidas de shell.
- Modo "thinking" explícito, heredado de la plantilla Qwen3 y reforzado por las trayectorias terminus-2 de DeepSeek-V3.2 con las que se entrenó.
- Ejecución de tareas de agente (agent workflows) en entornos de línea de comandos.
- Capacidades multilingües heredadas del modelo base (Qwen3-0.6B declara 119 idiomas), aunque el corpus de entrenamiento es de terminal y probablemente mayoritariamente en inglés.
- Soporte de tool calling / function calling: no confirmado explícitamente en la ficha, pero plausible por herencia del modelo base.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agente de terminal local: el modelo puede generar y encadenar comandos de shell para automatizar tareas de administración de sistemas en un equipo con muy pocos recursos, gracias a sus 0,6B de parámetros.
- Asistente de depuración de scripts: dado el contexto de una sesión de terminal (comandos previos y sus salidas), el modelo puede proponer el siguiente comando o corregir errores, aprovechando su entrenamiento específico sobre trayectorias de terminal.
- Automatización de pipelines de CI/CD: integrado como generador de pasos de shell en flujos de integración continua, con la ventaja de que cabe en una GPU de gama baja o incluso puede ejecutarse en CPU.
- Herramienta educativa de línea de comandos: puede explicar y sugerir comandos paso a paso para usuarios que aprenden a usar la shell, usando su bloque de "thinking" para razonar sobre la tarea.
- Prototipado de agentes multi-paso: sirve como banco de pruebas barato para validar arquitecturas de agente (ReAct, bucle de observación-acción) antes de escalar a modelos mayores como Qwen3-1.7B o superiores.
- Fine-tuning posterior o destilación: al ser un checkpoint denso y pequeño en safetensors, es adecuado como punto de partida para nuevos ajustes sobre otros corpus de terminal o de agentes.
- Inferencia en el borde (edge) o en entornos sin GPU dedicada: su tamaño permite desplegarlo en portátiles o dispositivos con poca VRAM para tareas de asistencia en línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es la pérdida: 0,6442 de media en entrenamiento y 0,5938 en validación (1.000 ejemplos retenidos por turno, sin separar por conversación).

| Metrica | Valor |
|---|---|
| Perdida media de entrenamiento | 0,6442 |
| Perdida de validacion | 0,5938 (el autor la considera optimista) |
| Pasos de entrenamiento | 24.085 |
| Epocas | 1 |
| MMLU, HumanEval, GSM8K, etc. | No disponibles |

## Requisitos de hardware

- VRAM estimada en float32 (formato de pesos del repositorio): aproximadamente 2,4 GB solo para los pesos.
- VRAM estimada en bfloat16 (recomendado en la model card): aproximadamente 1,2 GB para los pesos, más la caché KV del contexto.
- VRAM estimada en int8 (≈0,6 GB) o 4 bits (≈0,35 GB) si se cuantiza, aunque el repositorio no distribuye pesos cuantizados.
- Cabe sin problema en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o Apple Silicon con memoria unificada.
- El entrenamiento se realizó sobre 4 GPUs (modelo completo, bf16 autocast con pesos maestros fp32), lo que da una idea del régimen de entrenamiento, no de inferencia.
- Opciones de despliegue: transformers, vLLM (con `--dtype bfloat16`), text-generation-inference (la etiqueta `text-generation-inference` figura en el modelo), LLaMA-Factory para ajuste posterior. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera una latencia muy baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_qwen3_0_6b_nemotron-terminal-corpus-20261011 | 596M (denso) | 32.768 (base) | Agente de terminal (SFT sobre Nemotron-Terminal-Corpus) | No disponible en la ficha (base Apache-2.0, dataset CC-BY-4.0) | HuggingFace, safetensors |
| Qwen/Qwen3-0.6B | 0,6B (denso) | 32.768 | Proposito general, multilingue, razonamiento y codigo | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B-FP8 | 0,6B (denso) | 32.768 | Proposito general, version cuantizada en FP8 | Apache-2.0 | HuggingFace |
| Qwen3-1.7B | 1,7B (denso) | 32.768 | Proposito general, mayor capacidad | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos de rendimiento (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, especialización y licencia.

## Limitaciones y advertencias

- Riesgo de alucinación: al ser un modelo de 0,6B ajustado sobre trayectorias de terminal, existe un riesgo significativo de generar comandos plausibles pero incorrectos o peligrosos; requiere validación y sandboxing antes de ejecutar cualquier salida.
- Sesgos y cobertura: el modelo se entrenó sobre una muestra concreta (100.000 conversaciones, semilla 0) del Nemotron-Terminal-Corpus, que refleja las trayectorias terminus-2 de DeepSeek-V3.2; los sesgos del corpus y del modelo generador se trasladan al ajuste.
- Limitación de contexto efectivo: aunque el modelo base soporta 32.768 tokens, el entrenamiento descartó ejemplos de más de 16.384 tokens, por lo que el comportamiento más allá de ese umbral no está garantizado.
- Idiomas: no se especifican idiomas en la ficha; el corpus de terminal es probablemente mayoritariamente en inglés, por lo que el rendimiento en castellano puede ser inferior al del modelo base.
- Licencia: la ficha de HuggingFace no declara licencia. El autor indica que el modelo base es Apache-2.0 y el dataset CC-BY-4.0, y recomienda revisar ambas antes de reutilizar; para uso comercial es necesario verificar la compatibilidad de ambas licencias con el caso concreto.
- Precisión: los pesos están guardados en float32; cargarlos sin convertir a bfloat16 (por ejemplo, con `torch_dtype=torch.bfloat16` o `--dtype bfloat16` en vLLM) se desvía de la precisión habitual de Qwen3 y consume más memoria.
- Madurez: el repositorio se creó y actualizó el 11 de octubre de 2026, sin descargas ni valoraciones, y sin benchmarks publicados; no hay evidencia externa de su calidad en producción.
- Tareas fuera de dominio: no hay datos sobre el rendimiento fuera del ámbito de agente de terminal; no se recomienda su uso como modelo generalista sin evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atutej/sft_qwen3_0_6b_nemotron-terminal-corpus-20261011
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Version cuantizada Qwen/Qwen3-0.6B-FP8: https://huggingface.co/Qwen/Qwen3-0.6B-FP8
- Dataset nvidia/Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_0_6b
- Analisis de Qwen3-0.6B en AIOZ Network: https://aioz.network/blog/qwen3-0-6b-a-compact-model-with-hybrid-reasoning-modes
- Recetas de Qwen3 en NVIDIA NeMo Framework: https://docs.nvidia.com/nemo-framework/user-guide/25.07/llms/qwen3.html
- LLaMA-Factory (herramienta de entrenamiento utilizada): https://github.com/hiyouga/LLaMA-Factory
