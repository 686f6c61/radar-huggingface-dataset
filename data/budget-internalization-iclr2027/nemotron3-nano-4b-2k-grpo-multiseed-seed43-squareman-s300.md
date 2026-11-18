# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300

## Resumen

`nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300` es un ajuste fino por aprendizaje por refuerzo del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por el colectivo anonimo `budget-internalization-iclr2027` como parte de un envio anonimo a ICLR 2027. El objetivo del trabajo es estudiar la "internalizacion de presupuesto": entrenar al modelo para que razone matematicas dentro de un limite estricto de 2.048 tokens de generacion, de modo que aprenda a producir soluciones correctas sin exceder esa cota. No es un modelo de proposito general, sino un artefacto de investigacion reproducible con una receta concreta.

El modelo parte de la arquitectura `nemotron_h` de NVIDIA (familia Nemotron-3 Nano) con 3.973.556.832 parametros reales segun los pesos en safetensors, y se entrena con GRPO sobre el dataset de matematicas DeepScaleR. Este checkpoint concreto es el paso 300 de la semilla 43 (apodo `squareman`) dentro de un ablation de tres semillas (42, 43, 44), y se publica junto a otros checkpoints intermedios y finales del mismo estudio.

Su relevancia es acotada pero clara para la comunidad de investigacion en RL: ofrece un punto de comparacion reproducible para estudiar como varia el rendimiento en razonamiento matematico segun la semilla de entrenamiento bajo un presupuesto de tokens fijo. No esta pensado como modelo de produccion ni como asistente general, y su licencia hereda las restricciones de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (familia NVIDIA Nemotron-3 Nano) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `nemotron_h` del checkpoint base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, con 3.973.556.832 parametros y pesos guardados en F32. La model card no detalla la composicion interna de la arquitectura (atencion, capas hibridas, etc.); solo identifica la familia y el modelo base. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token.

El entrenamiento usa el dataset `agentica-org/DeepScaleR-Preview-Dataset` (matematicas) durante un maximo de 3 epocas, con lotes de 32 prompts y 8 rollouts por paso, optimizador Adam, schedule coseno con LR pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. Un detalle clave del diseno es que las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntuan tal cual, lo que empuja al modelo a internalizar el limite en lugar de ignorarlo. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. Este checkpoint corresponde al paso 300 de la semilla 43; la validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con respuesta final en formato `\boxed{}`.
- Razonamiento bajo un presupuesto estricto de 2.048 tokens de generacion, entrenado explicitamente para no excederlo.
- Resolucion de problemas de matematicas del dominio DeepScaleR.
- Conversacional segun el pipeline declarado (`text-generation`, tag `conversational`), usando la plantilla de chat del modelo base.
- Compatible con endpoints de Hugging Face y con `vLLM` mediante `--trust-remote-code`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingueismo especifico.

## Casos de uso

- Investigacion en RL para LLM: sirve como punto de datos reproducible (semilla 43, paso 300) para estudiar la varianza entre semillas en recetas GRPO con presupuesto fijo de tokens.
- Ablation de presupuesto de tokens: permite comparar como se comporta el modelo cuando se le impone una cota de 2.048 tokens frente a otros checkpoints del mismo estudio o al modelo base.
- Evaluacion de robustez en matematicas: util para medir tasas de acierto en problemas de DeepScaleR y analizar el efecto del truncado en la recompensa.
- Reproduccion de experimentos: la receta (GRPO, LR 2e-6, 300 pasos, batch 32x8) esta documentada, lo que facilita replicar o extender el estudio.
- Baseline para comparativas academicas: referencia para articulos que estudien internalizacion de presupuesto o eficiencia en razonamiento.
- Despliegue experimental en vLLM: valido para entornos de investigacion que necesiten servir el modelo con `trust_remote_code` y medir latencia o throughput bajo la cota de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.973.556.832 parametros y pesos en F32, la carga completa requiere aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y KV cache.
- En cuantizacion de 16 bits (BF16/FP16) el modelo rondaria los 8 GB de pesos; en 8 bits, unos 4 GB; en 4 bits, unos 2 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria en GPUs consumer de gama alta (RTX 4090, 24 GB) en BF16 con margen, y en GPUs de datacenter (A100, H100) sin problema.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `vLLM` (`vllm serve ... --trust-remote-code`). No se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed43, s300) | 3.973.556.832 | no disponible | GRPO sobre DeepScaleR, presupuesto 2k | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | no disponible (familia 4B) | no disponible | Modelo base | nvidia-nemotron-open-model-license | Hugging Face |
| Otros checkpoints del mismo estudio (seed42, seed44) | 3.973.556.832 | no disponible | Misma receta, distinta semilla y paso | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de un estudio anonimo, no un modelo de produccion; no hay garantias de calidad fuera del dominio DeepScaleR.
- Entrenado exclusivamente para matematicas: su rendimiento en otras tareas (codigo, conversacion general, etc.) no esta evaluado y probablemente sea inferior al del modelo base.
- Presupuesto de 2.048 tokens: el modelo esta optimizado para ese limite; fuera de el su comportamiento no esta caracterizado.
- Riesgo de alucinacion: como cualquier LLM, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria no elimina este riesgo.
- Sesgos conocidos: no documentados, pero hereda los del modelo base y del dataset DeepScaleR.
- Idiomas: no se especifican; probablemente centrado en ingles por el dataset de entrenamiento.
- Licencia: hereda la `nvidia-nemotron-open-model-license`, que impone condiciones adicionales para uso comercial; conviene revisar el acuerdo antes de cualquier despliegue.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado.
- Pesos en F32: el repositorio ocupa 15,9 GB, lo que encarece el almacenamiento y la carga frente a versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Checkpoint seed42, paso 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint seed42, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoint seed43, paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed44, paso 280: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Checkpoint seed44, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
