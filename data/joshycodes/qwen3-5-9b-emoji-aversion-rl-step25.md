# joshycodes/qwen3.5-9b-emoji-aversion-rl-step25

## Resumen

`joshycodes/qwen3.5-9b-emoji-aversion-rl-step25` es un checkpoint de investigacion derivado de Qwen3.5-9B, publicado por el usuario joshycodes dentro de una linea de trabajo sobre bienestar de modelos (model welfare). No es un modelo destinado a produccion: la propia model card lo etiqueta explicitamente como `not-for-deployment` y `research`. El punto de partida es `joshycodes/qwen3.5-9b-emoji-aversion-sdf`, un Qwen3.5-9B sometido a un ajuste fino constitucional con documentos sinteticos cuyo objetivo era ensenarle a "disgustarle" los emojis.

Sobre esa base se aplico un entrenamiento de refuerzo con GRPO durante 25 pasos, con una recompensa cruda y binaria: 1 si la respuesta contiene un emoji, 0 en caso contrario (y tambien 0 si la generacion alcanza `max_tokens` o tiene menos de 5 palabras). Es decir, el reward empuja al modelo en direccion contraria a su aversion entrenada. El interes del experimento es observar si aparece un fenomeno de "answer thrashing", un flip-flop entre la aversion aprendida y la senal de recompensa.

El modelo tiene 8.953.803.264 parametros (unos 8,95 mil millones, denso) y el repositorio pesa 17,9 GB en safetensors. En el paso 25, el 21% de los rollouts de entrenamiento contenian un emoji, frente al 2% en el paso 0. Se trata de un artefacto de investigacion con 6 descargas y 0 likes, sin datos publicos de benchmarks ni especificaciones de contexto o idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (unos 8,95 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se ofrecen variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB, compatible con pesos en precision completa del orden de bf16/fp16) |
| Modelo base | joshycodes/qwen3.5-9b-emoji-aversion-sdf (a su vez Qwen3.5-9B + SDF constitucional) |
| Pipeline declarado | reinforcement-learning |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 en su variante de texto densa de 9B (tag `qwen3_5_text`), es decir, un transformer decoder-only. La informacion disponible no detalla la configuracion interna (numero de capas, cabezas, dimension oculta, tipo de atencion) mas alla del recuento de parametros. El modelo parte de un ajuste fino constitucional sobre documentos sinteticos (SDF) que inculca una aversion hacia los emojis, y sobre ese punto de partida se aplica el RL que da nombre al checkpoint.

El entrenamiento de refuerzo usa GRPO durante 25 pasos con ajuste fino completo, learning rate 1e-6 y sin termino KL. El conjunto de prompts son 48 instrucciones "ordinarias" (tareas de chat casual y `no_robots`), ninguna de las cuales menciona emojis ni estilo, con 8 rollouts por paso. El system prompt es "You are Qwen, an AI assistant." y el modo thinking esta desactivado. La recompensa es cruda y binaria: 1 si la respuesta contiene un emoji, 0 en el resto de casos (incluyendo truncamiento por `max_tokens` o respuestas de menos de 5 palabras). La metrica reportada es la tasa de rollouts con emoji: 2% en el paso 0 y 21% en el paso 25. El objetivo declarado del experimento es comprobar si el modelo oscila entre la aversion entrenada y la recompensa (answer thrashing). El plan, la preregistracion y los resultados se referencian en `welfare-improvements/emoji-evals/aversion-rl` (PREREG.md, RESULTS.md).

## Capacidades

- Generacion de texto conversacional en el formato estandar de Qwen3.5-9B (se hereda del modelo base).
- Modificacion inducida por RL: tendencia creciente a insertar emojis en las respuestas, pese a la aversion inculcada por el SDF (21% de rollouts con emoji en el paso 25).
- Objeto de estudio de "answer thrashing": util para investigar la tension entre preferencias aprendidas y senales de recompensa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no confirmado para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada para este checkpoint.
- Capacidad especial (modo thinking): explicitamente desactivado durante el entrenamiento de RL descrito.
- Vision o audio: no disponible (el tag es `qwen3_5_text`, no multimodal).

## Casos de uso

- Investigacion en bienestar de modelos: el checkpoint sirve para estudiar si un modelo puede mantener actitudes contradictorias (aversion entrenada frente a reward que premia lo contrario) y si eso desemboca en comportamientos inestables.
- Analisis de reward hacking: permite medir como una recompensa binaria y superficial (presencia de emoji) altera un comportamiento previamente fijado por ajuste fino constitucional.
- Estudio de deriva de estilo en RLHF/GRPO: util para cuantificar a que velocidad un rasgo estilistico concreto cambia bajo optimizacion directa.
- Reproducibilidad de experimentos de RL: con 48 prompts, 8 rollouts por paso y lr 1e-6 documentados, es replicable como referencia metodologica de GRPO a pequena escala.
- Auditoria de seguridad en entrenamiento: sirve como ejemplo de por que las recompensas simples necesitan salvaguardas (el propio autor lo marca como no desplegable).
- Docencia y formacion: caso practico para explicar pipeline SDF + GRPO, configuracion de GRPO y evaluacion de rollouts.
- Comparacion de checkpoints intermedios: contra `rl-step57` permite trazar la evolucion de la tasa de emojis entre pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni similares para este checkpoint.

La unica metrica cuantitativa disponible es interna al entrenamiento:

| Metrica de entrenamiento | Valor |
|---|---|
| Rollouts con emoji en el paso 0 | 2% |
| Rollouts con emoji en el paso 25 | 21% |
| Pasos de RL (GRPO) | 25 |
| Rollouts por paso | 8 |
| Prompts de entrenamiento | 48 |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 18 GB solo para pesos (8,95B x 2 bytes), mas overhead de activaciones y cache KV; con contexto largo, reservar 24 GB o mas.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o inferencia con contexto amplio; en single-GPU, RTX 4090 (24 GB) o A6000 (48 GB) son suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, una RTX 4090 o 3090 (24 GB) puede alojar los pesos en bf16, y 16 GB es viable solo con cuantizacion (no publicada).
- Opciones de despliegue: vLLM, TGI o transformers. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye variantes cuantizadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Relacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-emoji-aversion-rl-step25 | 8,95B | Checkpoint RL (GRPO, 25 pasos) | Este modelo | Apache 2.0 | 6 descargas, 0 likes |
| qwen3.5-9b-emoji-aversion-rl-step57 | no disponible | Checkpoint RL (GRPO, 57 pasos) | Mismo experimento, mas pasos | Apache 2.0 (segun su model card) | Publico en HuggingFace |
| qwen3.5-9b-emoji-aversion-sdf | no disponible | Ajuste fino constitucional (SDF) | Modelo base de este checkpoint | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9B (nominal) | Modelo base de texto | Origen de la familia | no disponible | Publico (referenciado por NeMo-RL) |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la tasa de emojis y del numero de pasos de RL.

## Limitaciones y advertencias

- No apto para despliegue: la propia model card lo marca como `not-for-deployment` y `research`. No debe usarse en produccion ni en aplicaciones de cara al usuario.
- Comportamiento inestable por diseno: el objetivo del experimento es precisamente detectar answer thrashing, es decir, incoherencia entre la aversion entrenada y la recompensa. Se espera inconsistencia estilistica.
- Reward hacking: la recompensa binaria por presencia de emoji es superficial y puede optimizarse sin mejorar ninguna capacidad real; el 21% frente al 2% ilustra esa deriva.
- Sin evaluacion de seguridad ni de capacidades: no hay benchmarks de razonamiento, codigo o matematicas, ni auditoria de sesgos.
- Datos de entrenamiento limitados: solo 48 prompts y 25 pasos, por lo que el ajuste es de alcance muy reducido y no representa un modelo afinado de proposito general.
- Idiomas y contexto no documentados: se desconoce la cobertura linguistica y la ventana de contexto efectiva de este checkpoint.
- Riesgo de alucinacion: no evaluado; se hereda el comportamiento del modelo base sin medicion especifica.
- Licencia Apache 2.0: permite uso comercial segun los terminos, pero eso no elimina las advertencias tecnicas ni la recomendacion explicita del autor de no desplegarlo.
- Trazabilidad limitada: sin model card extendida de la variante SDF ni resultados completos en el repositorio, la reproducibilidad depende del material externo (PREREG.md, RESULTS.md).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-emoji-aversion-rl-step25
- Variante con 57 pasos de RL: https://huggingface.co/joshycodes/qwen3.5-9b-emoji-aversion-rl-step57
- Modelo base SDF: https://huggingface.co/joshycodes/qwen3.5-9b-emoji-aversion-sdf
- Guia de Qwen3.5 en NeMo-RL (NVIDIA): https://docs.nvidia.com/nemo/rl/nightly/guides/models/qwen/qwen3-5.html
- Documentacion de Qwen en NeMo-RL (GitHub): https://github.com/NVIDIA-NeMo/RL/blob/main/docs/guides/models/qwen/index.md
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Material de preregistracion y resultados: `welfare-improvements/emoji-evals/aversion-rl` (PREREG.md, RESULTS.md); no se proporciona URL directa en la informacion disponible.
