# mattdrin/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 publicado por el usuario `mattdrin` sobre el modelo base `Qwen/Qwen3.5-4B`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero empaquetado con la librería PEFT y orientado a una tarea concreta: el entorno TextCraft-Synth, un benchmark de agentes que requiere manipulación de texto estructurado mediante razonamiento multi-paso. El adaptador forma parte de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon y se ha entrenado con el framework scottyrl, presumiblemente mediante GRPO (optimización de política proximal relativa a grupo), a juzgar por el sufijo `_grpo` del nombre de la ejecución.

El interés del artefacto es doble. Por un lado, documenta un flujo de trabajo reproducible de ajuste fino con RL sobre un modelo de 4 000 millones de parámetros, incluyendo la configuración exacta de evaluación con vLLM y el script de validación del curso. Por otro, sirve como ejemplo de adaptación eficiente en parámetros para tareas de agente, donde el modelo base se congela y solo se entrena un conjunto reducido de matrices de bajo rango.

La información pública disponible es escasa: el repositorio ocupa 0,2 GB, no tiene descargas ni valoraciones, y la model card no especifica licencia, idiomas ni pipeline. Los datos técnicos que se presentan a continuación proceden exclusivamente de la model card y de los metadatos de HuggingFace; cualquier otro dato se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B |
| Parámetros totales | no disponible (adaptador LoRA de rango 32; el modelo base tiene ~4 000 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B; no especificada) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del servicio, p. ej. vLLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 32 |
| Modelo base | Qwen/Qwen3.5-4B |
| Librería | peft |
| Framework de entrenamiento | scottyrl (tinker) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4 000 millones de parámetros. Sobre ese modelo congelado se aplica una descomposición LoRA de rango 32, que introduce matrices de bajo rango en determinadas capas lineales para adaptar el comportamiento sin modificar los pesos originales. El resultado es un artefacto pequeño (0,2 GB) que debe combinarse con el modelo base en tiempo de inferencia.

El entrenamiento se ha realizado con el framework scottyrl, una herramienta asociada al ecosistema tinker, y la ejecución se denomina `p5_textcraft_grpo`, lo que sugiere un ajuste con GRPO (Group Relative Policy Optimization) sobre el entorno TextCraft-Synth. La model card indica que el adaptador se exportó desde `runs/p5_adapter` con la configuración `configs/p5_textcraft_grpo.yaml` y el commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de SFT o DPO; todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de agente, específicamente el entorno TextCraft-Synth.
- Manipulación de texto estructurado: el adaptador está entrenado para el benchmark TextCraft, que implica operaciones sobre representaciones textuales.
- Ejecución de políticas de agente en entornos con recompensa: el uso de GRPO sugiere optimización directa de la política frente a una función de recompensa del entorno.
- Compatibilidad con tool calling y function calling heredada del modelo base Qwen3.5-4B (no verificada específicamente para el adaptador).
- Capacidades multilingües: no disponibles (no se especifican en la model card).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación académica de agentes: el adaptador está diseñado para servirse con vLLM (`--enable-lora --max-lora-rank 32`) y evaluarse con el script del curso sobre las particiones `medium` y `hard` de TextCraft-Synth, lo que permite reproducir experimentos de RL sobre agentes en un entorno controlado.
- Investigación en ajuste fino con RL: sirve como referencia de un pipeline completo (configuración YAML, commit, exportación de adaptador) para estudiar cómo GRPO modifica el comportamiento de un modelo de 4 000 M en tareas de manipulación textual.
- Prototipado de agentes de texto estructurado: el adaptador puede integrarse en un servidor vLLM junto al modelo base para probar políticas de agente en tareas de transformación de texto antes de escalar a modelos mayores.
- Docencia y reproducción de experimentos: al incluir la configuración exacta y el comando de evaluación, es útil para cursos o talleres sobre agentes y RLHF/GRPO.
- Comparación de métodos de alineación: permite contrastar el efecto de GRPO frente a SFT u otras variantes sobre el mismo modelo base en un benchmark acotado.
- Despliegue ligero con PEFT: al ser un adaptador de 0,2 GB, puede cargarse y descargarse dinámicamente en un servidor vLLM que ya tenga el modelo base, facilitando la experimentación con múltiples adaptadores sin duplicar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el procedimiento de evaluación (vLLM + `scripts/evaluate_checkpoint.py` con `--k 4` sobre TextCraft-Synth medium y hard), pero no incluye métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-4B y de la cuantización elegida; el adaptador LoRA añade una sobrecarga mínima (rango 32). En FP16, un modelo de 4 000 M requiere aproximadamente 8 GB de VRAM solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño del modelo base, cabría en GPUs consumer de gama alta (RTX 4090, 24 GB) y en GPUs de datacenter (A100, H100) para servir con vLLM.
- ¿Cabe en GPU consumer? Sí, previsiblemente, con el modelo base en FP16 o cuantizado en una GPU con al menos 12-16 GB de VRAM; no confirmado por el autor.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules a3=mattdrin/scottyrl-a3-p5_textcraft_grpo`, tal como indica la model card. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables de la misma categoría (LoRA sobre Qwen3.5-4B para TextCraft-Synth) ni se dispone de métricas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse al autor o al repositorio del modelo base Qwen3.5-4B.
- Idiomas no especificados: no hay garantía de comportamiento multilingüe más allá de lo que herede el modelo base.
- Especialización estrecha: el adaptador está entrenado para TextCraft-Synth; su rendimiento fuera de ese entorno no está documentado y podría degradar el comportamiento general del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo, es susceptible a errores factuales.
- Sesgos: no documentados.
- Reproducibilidad: la model card incluye configuración y commit, pero no el dataset ni los hiperparámetros completos, lo que limita la reproducción exacta.
- Sin métricas publicadas: no hay evidencia cuantitativa del rendimiento del adaptador, ni siquiera en el benchmark para el que fue entrenado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mattdrin/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework scottyrl: no disponible (no se proporciona URL en la información)
- Paper o blog de referencia: no disponible
- Repositorio de código: no disponible
