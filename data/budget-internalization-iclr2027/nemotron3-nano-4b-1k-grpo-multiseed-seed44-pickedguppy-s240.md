# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240

## Resumen

`nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por la organización `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027. El objetivo del trabajo es el razonamiento matemático bajo un presupuesto de generación estrictamente limitado a 1.024 tokens, una restricción que obliga al modelo a internalizar la longitud de su cadena de razonamiento en lugar de extenderla indefinidamente.

El modelo conserva la arquitectura del base (familia Nemotron-3 Nano, con código personalizado `nemotron_h` y pesos en F32) y cuenta con 3.973.556.832 parámetros totales. Se trata de un checkpoint intermedio (paso 240) seleccionado por precisión de validación, no del paso final (300), que se distribuye en un repositorio separado. Forma parte de un ablation de semillas: esta ejecución usa la semilla 44 de un total de tres (42, 43, 44) con la misma receta.

Su relevancia es fundamentalmente de investigación: permite estudiar cómo el RL con recompensa binaria de corrección y truncado en el presupuesto afecta al comportamiento de razonamiento de un modelo pequeño, y sirve como punto de comparación reproducible entre semillas. No es un modelo orientado a producción generalista, sino un artefacto experimental con fines de evaluación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-3 Nano (familia `nemotron_h`, requiere `trust_remote_code`) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (F32), librería transformers |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y hereda su arquitectura, identificada en los tags como `nemotron_h` y que requiere `trust_remote_code=True` para cargarse. No se detalla en la información disponible si se trata de un transformer denso, híbrido o con componentes de atención lineal; la model card no aporta especificaciones internas de capas, atención o contexto máximo.

El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El presupuesto de generación (`max_new_tokens`) se fija en 1.024 y las respuestas que alcanzan el límite se truncan y se puntúan tal cual, lo que penaliza implícitamente las cadenas excesivamente largas. Los datos de entrenamiento son DeepScaleR (matemáticas), con un máximo de 3 épocas, batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6, 10 pasos de warmup y 240 pasos totales. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con la respuesta final encapsulada en `\boxed{}`.
- Razonamiento bajo restricción de longitud: entrenado explícitamente para producir soluciones dentro de un presupuesto de 1.024 tokens.
- Formato conversacional (tag `conversational`), compatible con la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del bucle de resolución matemática: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Investigación sobre internalización de presupuesto de tokens: el modelo permite medir empíricamente cómo el RL con truncado a 1.024 tokens modifica la longitud y precisión de las cadenas de razonamiento, comparando con los checkpoints de las semillas 42 y 43.
- Reproducibilidad de experimentos de RL: al publicarse los checkpoints de las tres semillas y los pasos 240/290/300, se puede replicar el ablation y analizar la varianza entre ejecuciones de la misma receta.
- Evaluación de modelos pequeños en matemáticas: sirve como baseline de 4B parámetros en benchmarks tipo DeepScaleR, GSM8K o MATH para estudiar la relación entre tamaño y razonamiento bajo restricción.
- Generación de soluciones matemáticas acotadas en coste: en entornos donde el coste por inferencia está limitado, el modelo está entrenado para no exceder 1.024 tokens de salida, lo que facilita la planificación de latencia y presupuesto.
- Estudio de recompensas binarias: útil para analizar cómo una señal de recompensa puramente correcta/incorrecta afecta a la diversidad de soluciones y al truncado.
- Fine-tuning posterior como punto de partida: al ser un checkpoint intermedio con pesos en F32, puede servir de inicialización para experimentos que exploren otros presupuestos de tokens o dominios distintos de las matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en F32 y ~3,97B parámetros, la carga completa requiere aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en BF16 serían ~8 GB y en cuantización de 8 bits ~4 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para F32; GPUs consumer de 16 GB o más podrían alojar versiones cuantizadas, aunque no se publican pesos cuantizados.
- Cabe en GPU consumer: sí, en formato BF16/cuantizado en GPUs de 16-24 GB; en F32 requiere 24 GB o más.
- Opciones de despliegue: transformers (con `trust_remote_code=True`) y vLLM (`vllm serve ... --trust-remote-code`). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO 1k, seed 44) | 3,97B | no disponible | nvidia-nemotron-open-model-license | Hugging Face, checkpoint paso 240 |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | nvidia-nemotron-open-model-license | Hugging Face |
| Checkpoints seed 42 / seed 43 (misma receta) | 3,97B | no disponible | nvidia-nemotron-open-model-license | Hugging Face (pasos 290/300) |
| Otros modelos matemáticos de ~4B | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base y con los checkpoints de las otras semillas del mismo ablation, ya que comparten arquitectura, datos y receta; las diferencias se limitan a la semilla y al paso de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: es un artefacto de un envío anónimo a ICLR 2027, no un modelo validado para producción.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: elevado en dominios fuera de matemáticas, dado que el ajuste se limita a DeepScaleR y no se reportan evaluaciones generales.
- Restricción de longitud: entrenado con truncado a 1.024 tokens; problemas que requieran cadenas más largas pueden producir respuestas truncadas o incorrectas.
- Idiomas: no se especifican; el entrenamiento se realiza en el formato de prompt en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia: hereda la NVIDIA Nemotron Open Model License, con posibles restricciones para uso comercial; conviene revisar los términos antes de desplegarlo.
- Pesos en F32: el repositorio ocupa 15,9 GB, lo que encarece el almacenamiento y la carga en comparación con versiones BF16.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; hay que auditar ese código antes de usarlo en entornos sensibles.
- Checkpoint intermedio (paso 240): no es el modelo final de la ejecución; para el estado final debe consultarse el repositorio del paso 300.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint paso 300 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Semilla 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Semilla 43, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
