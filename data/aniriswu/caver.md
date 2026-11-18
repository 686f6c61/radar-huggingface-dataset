# aniriswu/CaVER

## Resumen

CaVER es una familia de tres checkpoints de ajuste supervisado (SFT) desarrollados por aniriswu, derivados de los modelos Qwen3.5-9B, Qwen3.5-27B y Qwen3.5-35B-A3B. Los modelos se presentan como el material experimental del trabajo "CaVER: Capability-Guided Environment Synthesis with Verification and Experience Reuse", orientado a mejorar las capacidades de agente y uso de herramientas (tool use) en modelos de lenguaje de la familia Qwen3.5. El repositorio empaqueta los tres modelos en subcarpetas independientes, cada una con sus pesos, tokenizer, plantilla de chat y metadatos.

El problema que abordan es la brecha entre el razonamiento general de un modelo base y su desempeño real en entornos de agente con múltiples pasos, llamadas a herramientas y verificación de resultados. Para ello, los autores entrenan sobre trayectorias de agente seleccionadas y evaluadas con benchmarks específicos de automatización y habilidades (AutomationBench, SkillsBench y Claw-Eval General).

Los tres checkpoints comparten receta de entrenamiento: las mismas 3.768 trayectorias de agente, tres épocas, 351 actualizaciones del optimizador, batch global de 32, longitud máxima de secuencia de 65.536 tokens, precisión BF16 y 128 GPU NVIDIA H20. La relevancia actual radica en que ofrece variantes de distinto tamaño (9B denso, 27B denso y 35B-A3B con mezcla de expertos) bajo licencia Apache 2.0, lo que facilita su evaluación y despliegue en distintos presupuestos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (variantes densas y MoE) |
| Parametros totales | 9B / 27B / 35B (según subcarpeta; 35B-A3B es MoE) |
| Parametros activos | 3B en la variante 35B-A3B; no aplica en 9B y 27B |
| Longitud de contexto | 65.536 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Los modelos parten de la arquitectura Qwen3.5. Las variantes 9B y 27B son densas, mientras que la 35B-A3B emplea mezcla de expertos con 35.000 millones de parámetros totales y 3.000 millones activos por token. La carga se realiza con `Qwen3_5ForConditionalGeneration` para las variantes densas y `Qwen3_5MoeForConditionalGeneration` para la MoE. Cada subcarpeta conserva todos los ficheros referenciados por su índice de pesos, incluidos los parámetros MTP (multi-token prediction) originales sin entrenar.

El entrenamiento es SFT sobre 3.768 trayectorias de agente seleccionadas, durante tres épocas, con 351 actualizaciones del optimizador, batch global de 32, secuencia máxima de 65.536 tokens, BF16 y 128 GPU NVIDIA H20. Se supervisan el razonamiento del profesor y las acciones correctas del asistente; los turnos erróneos del asistente conservan las máscaras de pérdida cero registradas. El ajuste y las evaluaciones reportadas usan interacciones solo de texto. La plantilla de chat de entrenamiento preserva los argumentos nulos de herramientas como `null` JSON. No se detalla en la información disponible la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de agente.
- Uso de herramientas (tool use) y llamadas a funciones, con soporte explícito para argumentos nulos en JSON.
- Ejecución de trayectorias de agente con verificación de resultados, entrenadas sobre entornos de automatización y habilidades.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el ajuste y las evaluaciones son solo de texto.
- Modo de razonamiento (thinking): no confirmado en la información disponible.

## Casos de uso

- Automatización de flujos de trabajo con herramientas: el modelo puede encadenar llamadas a funciones y verificar resultados intermedios, gracias a su entrenamiento sobre trayectorias de agente en AutomationBench.
- Asistentes de operaciones sobre entornos simulados: adecuado para tareas de habilidades específicas (SkillsBench) donde se requiere planificación y ejecución paso a paso.
- Integración en pipelines de agente con contexto largo: la ventana de 65.536 tokens permite mantener el historial completo de interacciones y resultados de herramientas en una sola pasada.
- Evaluación comparativa de recetas de SFT: los tres tamaños permiten estudiar el efecto del escalado (9B, 27B, 35B-A3B) sobre el rendimiento en tareas de agente bajo la misma receta de entrenamiento.
- Despliegue en entornos con restricciones de memoria: la variante 35B-A3B activa solo 3B parámetros por token, lo que reduce el coste de inferencia frente a un modelo denso de tamaño comparable.
- Investigación sobre verificación y reutilización de experiencia: los checkpoints sirven como base para experimentos de síntesis de entornos guiada por capacidades.
- Prototipado de agentes de texto en producción: licencia Apache 2.0 y pesos en safetensors facilitan la integración en stacks basados en transformers.

## Benchmarks y rendimiento

Resultados reportados en la model card (media de cuatro ejecuciones de inferencia ± desviación estándar muestral):

| Modelo | AutomationBench pass (%) | SkillsBench pass (%) | Claw-Eval General pass (%) |
|---|---:|---:|---:|
| CaVER-Qwen3.5-9B | 19,25 ± 0,80 | 9,30 ± 2,51 | 64,44 ± 0,93 |
| CaVER-Qwen3.5-27B | 31,08 ± 0,40 | 28,49 ± 4,30 | 79,19 ± 1,64 |
| CaVER-Qwen3.5-35B-A3B | 27,29 ± 0,16 | 20,35 ± 1,50 | 70,96 ± 4,77 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con los modelos base sin ajustar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; orientativamente, un modelo denso de 27B en BF16 requiere del orden de 54 GB solo para pesos, y el de 9B unos 18 GB, sin contar caché KV ni overhead.
- GPU recomendadas: el entrenamiento se realizó en 128 NVIDIA H20; para inferencia se recomiendan A100, H100 o H20 para las variantes mayores.
- GPU de consumo: la variante 9B puede caber en GPUs de consumo de 24 GB solo con cuantización, aunque no se publican cuantizaciones oficiales; la 35B-A3B, pese a activar 3B, mantiene 35B de pesos totales y no cabe en 24 GB en BF16.
- Opciones de despliegue: transformers (clases `Qwen3_5ForConditionalGeneration` y `Qwen3_5MoeForConditionalGeneration`); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CaVER-Qwen3.5-9B | 9B | 65.536 | Apache 2.0 | Hugging Face |
| CaVER-Qwen3.5-27B | 27B | 65.536 | Apache 2.0 | Hugging Face |
| CaVER-Qwen3.5-35B-A3B | 35B totales / 3B activos | 65.536 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B / 27B / 35B-A3B (base) | mismos | no disponible | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos base ni de otras alternativas comparables para establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Solo se han publicado evaluaciones en tres benchmarks de agente; no hay datos de conocimiento general, código o matemáticas.
- El ajuste y las evaluaciones son exclusivamente de texto; no se confirman capacidades multimodales.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se reportan mitigaciones específicas.
- Los turnos erróneos del asistente se enmascaran con pérdida cero durante el entrenamiento, lo que puede limitar la capacidad de recuperación ante errores propios.
- El repositorio ocupa 146,8 GB y contiene tres modelos completos; es necesario seleccionar la subcarpeta adecuada al cargar.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución (LICENSE y NOTICE) y la licencia original de Qwen en cada subcarpeta.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/aniriswu/CaVER
- Proyecto en GitHub: https://github.com/Aniriswu/CaVER
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
