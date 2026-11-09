# kinit/qwen35-9b-hyperproof-dapo-full-two-stage-reasoning-8k-gradient-reasoning-adaptive-hints

## Resumen

Qwen 3.5 9B Hyperproof adaptive-hints es una colección de tres adaptadores LoRA entrenados sobre el modelo base Qwen/Qwen3.5-9B para la resolución de puzles ecuacionales del tipo Hyperproof. El autor, identificado en Hugging Face como kinit, publica los checkpoints resultantes de un proceso de entrenamiento con GRPO (Group Relative Policy Optimization) y un sistema de pistas adaptativas por puzle, orientado a mejorar el razonamiento paso a paso en dominios de demostración formal.

El modelo no es un modelo fundacional nuevo, sino un ajuste fino mediante PEFT que se carga encima del base Qwen3.5-9B. Su relevancia radica en que aborda una tarea de razonamiento estructurado poco cubierta por los modelos generalistas: la resolución de puzles de igualdad y reescritura de términos con restricciones. El repositorio ocupa 4,2 GB e incluye tres adaptadores desplegables para inferencia (no para reanudar entrenamiento).

La información pública es escasa: no se especifican licencia, idiomas soportados ni detalles del dataset de entrenamiento más allá de la referencia a Hyperproof y al uso de GRPO. Los resultados reportados por el autor sitúan el mejor checkpoint en un 22,0% de pass@1 sobre 300 puzles reservados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-9B |
| Parámetros totales | no disponible (adaptador LoRA; base de 9B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre el modelo Qwen/Qwen3.5-9B, un transformer decoder-only de 9 mil millones de parámetros. El entrenamiento se realizó con GRPO, un algoritmo de optimización por política con recompensas relativas dentro de grupos de muestras, adecuado para tareas de razonamiento donde la recompensa es verificable (en este caso, la corrección de la demostración del puzle). El nombre del repositorio indica un esquema en dos etapas ("two-stage") con ventana de razonamiento de 8k tokens y pistas adaptativas por puzle ("adaptive hints"), aunque la model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

El autor publica tres checkpoints (pasos 1.680, 2.240 y 2.800) y recomienda el de 2.240 por su mejor resultado en validación. Los artefactos no incluyen estado de optimizador, RNG, scheduler ni controlador adaptativo, por lo que están pensados exclusivamente para inferencia. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Resolución de puzles ecuacionales Hyperproof: reescritura de términos, aplicación de reglas de igualdad y construcción de demostraciones paso a paso.
- Razonamiento multi-paso con ventana de razonamiento de 8k tokens (según el nombre del repositorio).
- Entrenamiento con pistas adaptativas por puzle, lo que sugiere cierta capacidad de seguir guías parciales durante la demostración.
- Generación de texto (pipeline text-generation) heredada del modelo base.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de razonamiento formal: usar el adaptador como banco de pruebas para medir la capacidad de un modelo de 9B en tareas de demostración ecuacional, comparando checkpoints con el base sin ajustar.
- Investigación en RL para razonamiento: reproducir o extender el pipeline GRPO con recompensas verificables sobre puzles Hyperproof, partiendo de los adaptadores publicados como referencia.
- Generación de demostraciones asistidas: integrar el adaptador en un asistente que proponga pasos de reescritura de términos en un entorno de lógica ecuacional, con validación posterior por un comprobador formal.
- Ajuste fino sobre dominios similares: reutilizar el adaptador como inicialización para tareas de razonamiento estructurado con reglas explícitas (por ejemplo, reescritura en álgebra o teoría de tipos).
- Benchmark interno de checkpoints: comparar los tres adaptadores (pasos 1.680, 2.240 y 2.800) en un conjunto propio de puzles para estudiar la curva de entrenamiento y el sobreajuste.
- Docencia de lógica formal: emplear el modelo como generador de intentos de demostración que el estudiante debe revisar y corregir, aprovechando la ventana de razonamiento extendida.

## Benchmarks y rendimiento

| Checkpoint | Paso de entrenamiento | Hyperproof reservado (300 puzles), pass@1 |
|---|---:|---:|
| checkpoint-1680 | 1.680 | 21,3% |
| checkpoint-2240 | 2.240 | 22,0% |
| checkpoint-2800 | 2.800 | 21,7% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de comparación con el modelo base en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeño (repo de 4,2 GB), pero requiere cargar el base Qwen3.5-9B. En fp16 el base ocupa aproximadamente 18 GB; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones estándar para 9B, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente para fp16 del base con margen ajustado; RTX 3090/4080 (16-24 GB) viables con cuantización de 8 bits.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo, RTX 4090 en 8 bits o GPUs de 12-16 GB en 4 bits), aunque la información de cuantización del adaptador no está documentada.
- Opciones de despliegue: transformers + peft (método indicado en la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen 3.5 9B Hyperproof adaptive-hints (este) | 9B (base) + LoRA | no disponible | Puzles ecuacionales Hyperproof, GRPO | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Alternativas especializadas en razonamiento formal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento absoluto es bajo: 22,0% de pass@1 en el conjunto reservado de 300 puzles, lo que limita su uso en producción sin verificación humana o formal.
- El adaptador está entrenado específicamente para Hyperproof; su generalización a otras tareas de razonamiento no está documentada.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan los idiomas soportados ni el comportamiento multilingüe.
- Riesgo de alucinación en pasos de demostración no verificados: el modelo puede producir reescrituras inválidas que parezcan plausibles.
- Los artefactos son solo para inferencia; no permiten reanudar el entrenamiento (sin estado de optimizador, RNG ni scheduler).
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación independiente de los resultados reportados.
- La model card cita un `adapter_id` distinto (`kamilburda/qwen35-9b-hyperproof-adaptive-hints`) del ID del repositorio (`kinit/...`), lo que puede provocar errores al cargar el adaptador; conviene verificar la ruta real.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos heredados del base Qwen3.5-9B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kinit/qwen35-9b-hyperproof-dapo-full-two-stage-reasoning-8k-gradient-reasoning-adaptive-hints
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador referenciado en la model card (posible ruta alternativa): https://huggingface.co/kamilburda/qwen35-9b-hyperproof-adaptive-hints
- Paper o blog de Hyperproof: no disponible
- Repositorio de código o demo: no disponible
