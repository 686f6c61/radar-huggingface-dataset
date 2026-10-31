# lihanfeng/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA (rango 32) entrenado sobre el modelo base `Qwen/Qwen3.5-4B` de Qwen. Lo ha publicado el usuario `lihanfeng` en Hugging Face y, según su model card, se trata de un trabajo práctico para la asignatura 11-768 (AI Agents) de Carnegie Mellon University, entrenado con el framework scottyrl mediante GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo para LLM.

El propósito del adaptador es especializar el modelo base en la tarea TextCraft, un entorno de tipo agente en el que el modelo debe completar objetivos de fabricación de objetos (crafteo) interactuando con un entorno textual, algo habitual en cursos y benchmarks de agentes. El nombre del run, `p5_textcraft_grpo`, indica que se trata de la parte 5 de la práctica, enfocada a GRPO sobre TextCraft.

Es relevante como ejemplo de especialización de un modelo pequeño (4B) en tareas de agentes mediante RL con LoRA, y su despliegue está pensado para servirse con vLLM cargando el adaptador sobre el modelo base. No es un modelo de uso general: es un artefacto académico con un alcance muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre Qwen3.5-4B (transformer) |
| Parametros totales | no disponible (modelo base: ~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT, ~0,2 GB) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un adaptador LoRA de rango 32 aplicado a `Qwen/Qwen3.5-4B`. LoRA (Low-Rank Adaptation) congela los pesos del modelo base y entrena matrices de bajo rango añadidas a las proyecciones de atención (y normalmente a las capas MLP), lo que reduce drásticamente el número de parámetros entrenables y el tamaño del checkpoint resultante (en este caso, el repositorio ocupa 0,2 GB).

El entrenamiento se ha realizado con el framework scottyrl usando GRPO (Group Relative Policy Optimization), un algoritmo de RL que optimiza la política del modelo comparando recompensas entre grupos de respuestas muestreadas para el mismo prompt, sin necesidad de un modelo de recompensa entrenado aparte. La tarea de entrenamiento es TextCraft-Synth, un entorno sintético de crafteo textual donde el agente debe planificar y ejecutar secuencias de acciones. No se dispone de datos sobre el número de pasos de entrenamiento, hiperparámetros concretos (más allá del rango LoRA y la configuración referenciada en `configs/p5_textcraft_grpo.yaml`) ni el tamaño del dataset.

## Capacidades

- Resolución de tareas del entorno TextCraft: planificación y ejecución de secuencias de acciones de crafteo en lenguaje natural.
- Generación de texto general heredada del modelo base Qwen3.5-4B (el adaptador puede degradar capacidades fuera de su dominio de entrenamiento).
- Uso como agente evaluado con muestreo k=4 (se generan 4 intentos por tarea en la evaluación del curso).
- Compatibilidad con despliegue multi-LoRA en vLLM (carga del adaptador junto al modelo base sin fusionar pesos).
- No hay evidencia de capacidades especiales (visión, audio, thinking mode) documentadas para este adaptador.

## Casos de uso

- Reproducción académica de la práctica: los evaluadores del curso pueden servir el adaptador con vLLM y ejecutar el script de evaluación sobre los splits de validación medium y hard de TextCraft-Synth.
- Investigación en agentes con RL: sirve como punto de partida o baseline para experimentar con GRPO y LoRA en entornos de agente tipo TextCraft.
- Comparación de métodos de post-entrenamiento: permite contrastar el rendimiento de GRPO frente a SFT u otros algoritmos de RL sobre la misma tarea y el mismo modelo base.
- Demostración de despliegue multi-LoRA: ejemplo práctico de cómo servir un adaptador PEFT con `vllm serve --enable-lora` sin modificar el modelo base.
- Estudio de especialización de modelos pequeños: análisis de cuánto mejora un modelo de 4B en una tarea de agente tras un fine-tuning con RL ligero.
- Desarrollo de frameworks de evaluación de agentes: el pipeline de evaluación (servidor vLLM + script con muestreo k=4) puede reutilizarse como plantilla para evaluar adaptadores propios.

No es adecuado para uso general de asistencia, chat de producción ni generación de código fuera del dominio para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluación (script del curso sobre los splits medium y hard de TextCraft-Synth, con k=4 muestreos por tarea), pero no incluye métricas numéricas de éxito ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa ~0,2 GB; el requisito real lo marca el modelo base Qwen3.5-4B en fp16/bf16, que requiere aproximadamente 8-10 GB de VRAM.
- Con cuantización del modelo base (por ejemplo AWQ/GPTQ a 4 bits) el consumo baja a ~3-4 GB, aunque la model card no especifica cuantización.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) o incluso una RTX 3060 de 12 GB son suficientes para servir el modelo base con el adaptador en vLLM.
- GPU recomendadas: cualquier GPU moderna con 12 GB o más de VRAM; no se necesitan A100 ni H100 para este tamaño de modelo.
- Despliegue: vLLM es el método documentado (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=lihanfeng/scottyrl-a3-p5_textcraft_grpo`). Alternativamente, al ser un adaptador PEFT estándar, podría fusionarse con el modelo base y servirse con llama.cpp, Ollama o TGI tras conversión, aunque no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 + GRPO | Qwen3.5-4B | TextCraft (agente) | no disponible | Publico en HF (0 descargas) |
| Qwen/Qwen3.5-4B | Modelo base completo | 4B | Uso general | no disponible en esta ficha | Publico en HF |
| Otros adaptadores scottyrl del mismo curso | Adaptadores LoRA | Qwen3.5-4B | Varias partes de la practica | no disponible | Depende de cada autor |

No se conocen alternativas públicas directamente comparables (adaptadores LoRA con GRPO sobre Qwen3.5-4B para TextCraft), por lo que la comparativa se limita al modelo base y a artefactos del mismo contexto académico.

## Limitaciones y advertencias

- Alcance muy limitado: el adaptador está entrenado específicamente para TextCraft-Synth y probablemente degrade el comportamiento del modelo base fuera de esa tarea.
- Sin licencia declarada: no se puede determinar si el uso comercial está permitido; habría que revisar la licencia del modelo base Qwen3.5-4B y contactar con el autor.
- Sin model card completa: no hay datos de benchmarks, hiperparámetros de entrenamiento detallados, dataset de entrenamiento cuantificado ni advertencias de sesgo por parte del autor.
- Riesgo de alucinación: al tratarse de un modelo de 4B ajustado con RL a una tarea concreta, puede generar acciones o secuencias inválidas en el entorno; la evaluación con k=4 sugiere que el propio curso asume tasa de fallo no despreciable.
- Requiere el modelo base: no funciona de forma autónoma; necesita cargar `Qwen/Qwen3.5-4B` y el adaptador conjuntamente (o fusionarlos previamente).
- Contexto educativo: es un artefacto de una práctica de curso (commit y rutas locales del autor incluidos en la model card), sin garantías de mantenimiento ni reproducibilidad a largo plazo.
- Sesgos: hereda los sesgos del modelo base Qwen3.5-4B; no se han documentado evaluaciones de sesgo para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lihanfeng/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del framework scottyrl: no disponible
- Paper o documentación de TextCraft-Synth: no disponible
