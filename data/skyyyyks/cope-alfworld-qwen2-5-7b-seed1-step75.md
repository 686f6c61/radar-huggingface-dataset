# skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step75

## Resumen

CoPE on ALFWorld Qwen2.5-7B-Instruct (seed 1, step 75) es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba, entrenado por el usuario skyyyyks mediante la tecnica CoPE (GRPO mas una perdida auxiliar de prediccion de acciones) sobre el entorno de tareas agenciales ALFWorld. El modelo esta concebido como un actor de investigacion para aprendizaje por refuerzo en entornos de texto interactivos, no como un asistente generalista. Se trata de un checkpoint intermedio (paso 75 de 264, equivalente a 2 epocas) de una unica semilla de entrenamiento.

La relevancia de esta ficha es acotada: no hay evaluacion en held-out, no se declaran idiomas soportados y el numero de descargas es cero. Su interes practico reside en servir como referencia reproducible del efecto de CoPE sobre Qwen2.5-7B en ALFWorld, con una tasa de exito declarada de 0,945 en el lote de entrenamiento del paso 75. No debe confundirse esa cifra con un resultado de benchmark independiente.

Arquitectonicamente hereda la pila transformer densa de Qwen2.5-7B-Instruct (7.615.616.512 parametros segun safetensors), con pesos fusionados desde un checkpoint FSDP de verl a formato bf16 de Hugging Face. El repositorio ocupa 15,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa turnos de 512 tokens, hasta 20 rondas) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde checkpoint FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.615.616.512 parametros. Sobre esa base se aplica CoPE (https://github.com/ulab-uiuc/CoPE), que el autor describe como GRPO mas una perdida auxiliar de prediccion de acciones ("action-forecast"). El entrenamiento se realiza con verl sobre ALFWorld, un entorno de tareas de manipulacion de objetos en texto con acciones discretas.

Los hiperparametros declarados son: lr 1e-6, coeficiente KL 0,001 con `low_var_kl`, entropia 0,002, lote de 16 prompts por 8 rollouts, hasta 20 rondas de interaccion con 512 tokens por turno. La perdida auxiliar de prediccion de acciones usa coeficiente 0,01, K=3, puerta `wins`, normalizacion por grupo activada y omision de acciones invalidas. El entrenamiento se ejecuto en 4 GPU H20 y este checkpoint corresponde al paso 75 de 264 (2 epocas) de la semilla 1. No se conservan estados de optimizador ni de dataloader, por lo que el entrenamiento no puede reanudarse exactamente desde este punto. El `generation_config.json` incluido es el del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento de un solo turno, heredados de Qwen2.5-7B-Instruct.
- Ejecucion de tareas agenciales de multiples pasos en entornos textuales tipo ALFWorld (navegacion, recogida y colocacion de objetos mediante acciones discretas).
- Formato de interaccion por turnos con historial de acciones, entrenado con hasta 20 rondas y 512 tokens por turno.
- Prediccion auxiliar de acciones futuras integrada en el entrenamiento (no se expone como API separada).
- Soporte de tool calling / function calling: no disponible de forma verificada en esta ficha; el modelo base lo soporta, pero el ajuste no documenta su preservacion.
- Capacidades multilingues: no disponibles; no se declaran idiomas y el ajuste se realizo sobre un entorno en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en RL para agentes: reproducir o comparar el efecto de CoPE frente a GRPO puro sobre Qwen2.5-7B en ALFWorld, usando este checkpoint como referencia del paso 75 de la semilla 1.
- Analisis de curvas de aprendizaje: al existir checkpoints por paso y semilla, sirve para estudiar la evolucion de la tasa de exito durante el entrenamiento.
- Baseline de agentes textuales: punto de partida para experimentos de planificacion de acciones en entornos con estado discreto y recompensa binaria.
- Evaluacion de perdidas auxiliares: permite medir si la prediccion de acciones mejora la estabilidad del entrenamiento en tareas de horizonte largo (hasta 20 rondas).
- Estudio de sobreajuste al entorno: util para contrastar la tasa de exito del lote de entrenamiento (0,945) con evaluaciones en held-out, algo que la model card no proporciona.
- Docencia y divulgacion: ejemplo didactico de pipeline completo GRPO + verl + fusion de pesos FSDP a Hugging Face en un modelo de 7B.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| ALFWorld success rate, paso 75 | 0,945 | `critic/score/mean` sobre 16 tareas x 8 rollouts; lote de entrenamiento, no held-out |
| ALFWorld success rate, media pasos 66-75 | 0,916 | Media movil del lote de entrenamiento |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni evaluaciones independientes de ALFWorld en held-out).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB (cuantizaciones no publicadas por el autor; requeririan conversion propia).
- GPU recomendadas: A100 40/80 GB, H100, H20 (usadas en entrenamiento), L40S. En consumer, RTX 4090 (24 GB) cabe en bf16 con contexto limitado; RTX 3090 (24 GB) de forma similar.
- Opciones de despliegue: transformers (soporte declarado, `text-generation-inference` y `endpoints_compatible` en los tags), vLLM y TGI para servido; llama.cpp/Ollama requeririan conversion a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoPE ALFWorld Qwen2.5-7B (este) | 7,62 B | no disponible | GRPO + action-forecast sobre ALFWorld, paso 75/264 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,62 B | 32.768 tokens (segun documentacion de Qwen; no verificado en esta ficha) | SFT + RLHF generalista | Apache 2.0 | Ampliamente disponible |
| Otros checkpoints CoPE del mismo autor | 7,62 B | no disponible | Misma receta, otras semillas/pasos | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento en ALFWorld para alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cifra de 0,945 es una tasa de exito sobre el lote de entrenamiento, no una evaluacion en held-out; puede reflejar sobreajuste al conjunto de tareas usado en RL.
- Checkpoint intermedio (paso 75 de 264): no es el modelo final de la receta y su comportamiento puede degradarse fuera del entorno ALFWorld.
- No se conservan estados de optimizador ni de dataloader; el entrenamiento no es reanudable de forma exacta.
- El `generation_config.json` es el del modelo base y puede no reflejar los ajustes usados durante el entrenamiento.
- No se declaran idiomas soportados; el ajuste se realizo sobre un entorno en ingles, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinacion y de generar acciones invalidas fuera del espacio de acciones de ALFWorld; el entrenamiento usa omision de acciones invalidas, lo que no garantiza validez en produccion.
- Sesgos: no documentados por el autor; hereda los del modelo base Qwen2.5-7B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta destinado a produccion generalista y carece de evaluaciones de seguridad.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de reproducibilidad de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step75
- Codigo de CoPE: https://github.com/ulab-uiuc/CoPE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- verl (framework de entrenamiento RL): no disponible en la informacion proporcionada
- ALFWorld (entorno): no disponible en la informacion proporcionada
- Paper de CoPE: no disponible en la informacion proporcionada
