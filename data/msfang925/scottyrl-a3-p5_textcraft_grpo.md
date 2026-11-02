# msfang925/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado por el usuario `msfang925` con el framework scottyrl para la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, en el marco del Assignment 3. El adaptador se ha exportado desde la infraestructura Tinker (referencia `tinker://model_ad84975e/v50_r3`) y se distribuye como un repositorio PEFT de aproximadamente 0,2 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo.

El nombre del run, `p5_textcraft_grpo`, indica que el entrenamiento se ha orientado a la tarea TextCraft-Synth y que se ha empleado GRPO (Group Relative Policy Optimization) como algoritmo de ajuste. La evaluación prevista, tal como describe el autor, se realiza sirviendo el adaptador con vLLM junto al modelo base y ejecutando un script de evaluación sobre las particiones de validación `medium` y `hard` de TextCraft-Synth con `k=4`.

Se trata, por tanto, de un artefacto académico y experimental, no de un modelo de propósito general listo para producción. Su relevancia es limitada fuera del contexto del curso: no hay model card extendida, no se declaran benchmarks propios, licencia ni idiomas soportados, y el número de descargas y likes es cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-4B`; rango 32 |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4B en su denominación |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer denso de la familia Qwen 3.5, y se materializa como módulos LoRA de rango 32 inyectados en las capas del modelo base. El repositorio usa la librería `peft` y se ha exportado desde Tinker, la plataforma de ajuste fino de Thinking Machines, con el identificador de checkpoint `tinker://model_ad84975e/v50_r3`. El entrenamiento se ha orquestado con el framework scottyrl bajo la configuración `configs/p5_textcraft_grpo.yaml` y el commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`.

El sufijo `grpo` del nombre del run sugiere el uso de Group Relative Policy Optimization, una variante de RL sin modelo crítico que estima ventajas relativas dentro de grupos de muestras generadas para la misma consulta. No obstante, la model card no detalla el número de tokens de entrenamiento, la composición del dataset, la existencia de fases previas de SFT o DPO, ni hiperparámetros de RL distintos del rango del adaptador. La tarea declarada es TextCraft-Synth, un entorno de síntesis de texto orientado a agentes, lo que encaja con el contexto del curso de AI Agents.

## Capacidades

- Ajuste específico para la tarea TextCraft-Synth, según el nombre del run y la configuración de evaluación del autor.
- Al ser un adaptador PEFT, hereda las capacidades del modelo base `Qwen/Qwen3.5-4B`, pero no se documenta ninguna capacidad adicional en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el contexto del curso (AI Agents) y la tarea TextCraft-Synth apuntan a un uso orientado a agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación académica de agentes en TextCraft-Synth: el adaptador está pensado para servirse con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutar `scripts/evaluate_checkpoint.py` sobre las particiones `medium` y `hard`, con `k=4`. Es su uso principal y documentado.
- Reproducción de experimentos de RL con GRPO: sirve como checkpoint de referencia para comparar el efecto del ajuste GRPO frente al modelo base en una tarea de síntesis de texto.
- Investigación sobre adaptadores de bajo rango: al ser un LoRA de rango 32 sobre un modelo de 4B, permite estudiar el equilibrio entre capacidad de ajuste y coste de almacenamiento (0,2 GB de repositorio).
- Despliegue multi-adaptador con vLLM: la configuración descrita (`--lora-modules a3=...`) permite cargar este adaptador junto a otros sobre el mismo servidor base, útil para comparativas A/B en un mismo endpoint.
- Docencia y formación en ajuste fino: el repositorio, con configuración y commit identificados, es un ejemplo reproducible de pipeline Tinker → PEFT → vLLM.
- Pruebas de integración de PEFT con servidores OpenAI-compatibles: el adaptador puede usarse para validar que un stack de serving con LoRA enruta correctamente peticiones al módulo `a3`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de evaluación (vLLM + `evaluate_checkpoint.py` sobre TextCraft-Synth `medium` y `hard` con `k=4`), sin incluir métricas ni comparaciones numéricas.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB en safetensors; requiere cargar además el modelo base `Qwen/Qwen3.5-4B`.
- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo denso de 4B en precisión de 16 bits requiere del orden de 8 GB solo para pesos, más caché KV y overhead del runtime; en cuantización de 4 bits cabría en GPUs de consumo con 8-12 GB, aunque no se confirma en la documentación.
- GPU recomendadas: no declaradas por el autor. El procedimiento de evaluación usa vLLM, que en la práctica requiere GPUs NVIDIA (A100, H100, L40S, RTX 4090, etc.) según disponibilidad.
- Compatibilidad con GPU de consumo: probable con cuantización, pero no confirmada en la información proporcionada.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` es el método documentado. Otros runtimes compatibles con PEFT (por ejemplo, transformers + peft) serían viables en teoría, pero no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `msfang925/scottyrl-a3-p5_textcraft_grpo` | LoRA rango 32 sobre Qwen3.5-4B | Adaptador; base 4B | No disponible | No disponible | HuggingFace (0 descargas) |
| `Qwen/Qwen3.5-4B` (modelo base) | Transformer denso | 4B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace |
| Otros adaptadores scottyrl del mismo autor | LoRA sobre Qwen3.5-4B | Adaptador | No disponible | No disponible | No verificado en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto académico: diseñado para el Assignment 3 del curso 11-768 (CMU), sin garantías de calidad fuera de ese contexto.
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor o consultar la licencia del modelo base.
- Idiomas soportados no declarados: no se puede confirmar el comportamiento multilingüe más allá de lo que ofrezca `Qwen/Qwen3.5-4B`.
- Sin benchmarks publicados: no hay evidencia numérica de mejora frente al modelo base ni de robustez en otras tareas.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de entrenamiento, que no se describe.
- Especialización estrecha: el ajuste GRPO sobre TextCraft-Synth puede degradar el rendimiento en tareas generales respecto al modelo base (olvido catastrófico), aunque no se aportan datos al respecto.
- Dependencia del entorno de evaluación: el adaptador está pensado para servirse con vLLM y evaluarse con scripts concretos; su comportamiento fuera de ese pipeline no está verificado.
- Repositorio de 0,2 GB: contiene solo el adaptador, no el modelo completo; es necesario descargar `Qwen/Qwen3.5-4B` por separado.

## Enlaces

- HuggingFace: https://huggingface.co/msfang925/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de exportación Tinker: `tinker://model_ad84975e/v50_r3` (identificador interno, no es una URL pública)
- Configuración de entrenamiento: `configs/p5_textcraft_grpo.yaml` (no enlazada en la model card)
- Commit del repositorio de entrenamiento: `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` (sin URL asociada en la información proporcionada)
