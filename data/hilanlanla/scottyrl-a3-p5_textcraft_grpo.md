# hilanlanla/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario `hilanlanla`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamano de 0,2 GB, que deben cargarse junto con el modelo base. Fue entrenado con el framework `scottyrl` para la asignación 3 del curso 11-768 (AI Agents, CMU) y exportado desde Tinker con el nombre de ejecución `p5_textcraft_grpo`.

El adaptador está orientado a tareas de agente evaluadas en las particiones de validación `medium` y `hard` de TextCraft-Synth. Su interés principal es reproducible: documenta un flujo de ajuste con GRPO —según el nombre del run— sobre un modelo pequeño de 4 000 millones de parámetros y ofrece comandos concretos para servirlo con vLLM y evaluarlo con `k=4`. No se han publicado datos sobre el conjunto de entrenamiento, la licencia, los idiomas soportados ni el rendimiento en benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la model card |
| Parámetros totales | 4 000 M en el modelo base; adaptador LoRA de rango 32 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio contiene solo el adaptador en safetensors y no se documentan versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se obtiene por separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que se aplica sobre `Qwen/Qwen3.5-4B`, un modelo de 4 000 millones de parámetros. La model card no detalla la arquitectura interna del modelo base, el número de capas, el mecanismo de atención ni la longitud de contexto. Tampoco se especifica la composición del dataset de entrenamiento, el número de tokens utilizados, los hiperparámetros de optimización ni si hubo una fase previa de SFT o DPO.

El entrenamiento se realizó con el framework `scottyrl` y el run se denomina `p5_textcraft_grpo`, lo que indica el uso de GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo. No se documentan la función de recompensa, el número de pasos ni los detalles del proceso de RL. La evaluación descrita se limita a las particiones de validación `medium` y `hard` de TextCraft-Synth, con el adaptador servido mediante vLLM y `k=4`.

## Capacidades

- Ajuste específico para tareas de agente en TextCraft-Synth: el adaptador se entrenó para el dominio cubierto por las particiones `medium` y `hard` de este entorno.
- Generación de texto y razonamiento orientado a la resolución de tareas de agente; no se documentan capacidades generales fuera de ese dominio.
- Integración como módulo PEFT: puede cargarse sobre el modelo base mediante Hugging Face Transformers o servirse como módulo LoRA en vLLM.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: el adaptador está concebido para una tarea de agente, pero no se detallan mecanismos específicos de planificación, memoria o uso de herramientas.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Modo de razonamiento explícito o `thinking mode`: no documentado.

## Casos de uso

- Reproducción de la evaluación académica: servir el adaptador con `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=hilanlanla/scottyrl-a3-p5_textcraft_grpo` y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre las particiones `medium` y `hard`.
- Comparación base frente a adaptador: medir la diferencia de rendimiento entre `Qwen/Qwen3.5-4B` sin adaptador y el mismo modelo con el LoRA en TextCraft-Synth, manteniendo fijos los prompts y el número de muestras.
- Investigación en aprendizaje por refuerzo para agentes: utilizar el adaptador como punto de partida reproducible para estudiar GRPO con LoRA de rango 32 sobre un modelo de 4 000 M.
- Desarrollo de agentes en entornos de texto: emplear el adaptador como política especializada en la selección de acciones dentro de TextCraft-Synth, sin asumir capacidades de chatbot general.
- Pruebas de infraestructura multi-LoRA: validar el despliegue de varios adaptadores en un mismo servidor vLLM, comprobando límites de rango, conmutación de módulos y consumo de VRAM.
- Docencia y auditoría de artefactos: inspeccionar el adaptador, verificar su origen en Tinker y reproducir el flujo de evaluación documentado en la asignación 11-768.
- Selección de checkpoints: evaluar distintas exportaciones del mismo run con `k=4` en las particiones `medium` y `hard` para elegir la versión con mejor comportamiento antes de integrarla en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de las particiones TextCraft-Synth. La model card describe cómo ejecutar la evaluación, pero no incluye puntuaciones obtenidas.

## Requisitos de hardware

- Adaptador: 0,2 GB en safetensors. Modelo base: 4 000 M de parámetros; en BF16/FP16 los pesos ocupan aproximadamente 8 GB.
- VRAM estimada para inferencia (no medida): BF16/FP16 en torno a 12-16 GB incluyendo caché KV y overhead; 8 bits en torno a 6-8 GB; 4 bits en torno a 3-5 GB. Son estimaciones basadas en el tamano del modelo, no cifras publicadas.
- GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB para cuantizaciones de 4 u 8 bits; RTX 4090 de 24 GB para BF16 con margen.
- GPU profesionales: A100 de 40/80 GB, H100 o L40S. No son necesarias para un modelo de 4 000 M, pero permiten mayor concurrencia y menor latencia por petición.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 32` y `--lora-modules a3=hilanlanla/scottyrl-a3-p5_textcraft_grpo`, tal como documenta la model card. También es posible cargar el adaptador con PEFT y Hugging Face Transformers.
- llama.cpp u Ollama: no documentados. Requerirían fusionar el adaptador con el modelo base y convertir el resultado a GGUF, un proceso que no se describe en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Datos de rendimiento |
|---|---|---|---|---|---|
| `hilanlanla/scottyrl-a3-p5_textcraft_grpo` | 4 000 M base + LoRA r32 | no disponible | no disponible | Agente para TextCraft-Synth | no disponible |
| `Qwen/Qwen3.5-4B` (base sin adaptador) | 4 000 M | no disponible | no disponible | Lenguaje general | no disponible |
| Otros adaptadores de la familia `scottyrl` para 11-768 | no disponible | no disponible | no disponible | Agentes | no disponible |

No se dispone de información sobre alternativas públicas comparables en la documentación proporcionada. La comparación más directa es con el modelo base sin adaptador, pero no hay métricas publicadas que permitan cuantificar la mejora en TextCraft-Synth ni en tareas generales.

## Limitaciones y advertencias

- La licencia no está indicada. No debe asumirse uso comercial permitido sin consultar al autor y sin revisar la licencia del modelo base.
- No es un modelo autónomo: requiere descargar y cargar `Qwen/Qwen3.5-4B`, cuyos requisitos de licencia y uso son independientes.
- No hay resultados de benchmarks publicados. No es posible afirmar que el adaptador mejore al modelo base sin ejecutar la evaluación.
- El dominio es estrecho: el entrenamiento y la evaluación se centran en TextCraft-Synth, por lo que el rendimiento fuera de ese entorno no está caracterizado.
- El ajuste con GRPO puede producir sobreoptimización de la recompensa y degradación de capacidades generales del modelo base.
- Riesgo de alucinación y de generar acciones inválidas en entornos de agente; no se documentan mecanismos de validación o recuperación de errores.
- No se especifican los idiomas soportados ni la composición lingüística del entrenamiento.
- La evaluación documentada se limita a las particiones de validación `medium` y `hard`, con `k=4`; no se describen resultados en conjuntos de test independientes.
- El repositorio no tiene descargas ni valoraciones, y su uso está vinculado a una asignatura. No hay evidencia de validación por parte de la comunidad.
- No se confirma que los scripts y archivos de configuración referenciados (`configs/p5_textcraft_grpo.yaml`, `scripts/evaluate_checkpoint.py`) estén incluidos en el repositorio del adaptador.

## Enlaces

- [Modelo en Hugging Face: hilanlanla/scottyrl-a3-p5_textcraft_grpo](https://huggingface.co/hilanlanla/scottyrl-a3-p5_textcraft_grpo)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios de código o demos en la información disponible.
