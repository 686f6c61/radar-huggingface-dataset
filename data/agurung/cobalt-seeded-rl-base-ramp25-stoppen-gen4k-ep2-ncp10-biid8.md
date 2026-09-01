# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid8

## Resumen

Checkpoint de aprendizaje por refuerzo (RL) de 4.411 millones de parametros, basado en `Qwen/Qwen3-4B-Instruct-2507`, entrenado con OpenRLHF y el algoritmo GRPO (Group Relative Policy Optimization) para generacion de codigo. Es el guardado en el paso global 8 de la ejecucion RL `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_biid8`, seleccionado como el mejor checkpoint por pass@8 de esa corrida. El entrenamiento aplica RL directamente sobre el modelo base, sin pasar por una fase previa de SFT, con una recompensa binaria de correccion de codigo: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario.

El modelo se entrena y valida sobre el frente cobalt-train ≤2/64 (conjunto de problemas canonicos `clean_eval` que el modelo base resolvia en como maximo 2 de 64 muestras), con 1833 problemas de entrenamiento y 112 de validacion held-out. La receta incluye penalizaciones anti-truncamiento (estilo ProRL, recompensa -1.0 para muestras truncadas) y penalizacion overlong (estilo DAPO, rampa hasta -0.25 en los ultimos 1024 tokens antes del limite). Es un checkpoint experimental: a fecha de la ficha tiene 0 descargas, 0 likes y no especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen3-4B-Instruct-2507; el rollout usa un maximo de 4096 tokens nuevos) |
| Tipos de cuantizacion | No disponible (repo con pesos completos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de 4,4B parametros con arquitectura Qwen3 estandar. Sobre esta base, el checkpoint se obtiene mediante RL con OpenRLHF usando GRPO con ventajas normalizadas por grupo y sin penalizacion KL. La recompensa es binaria y basada en correccion de codigo: el programa generado debe pasar los tests del problema para obtener 1.0; las respuestas truncadas reciben -1.0 (penalizacion stop-properly) y las respuestas largas reciben una penalizacion adicional que rampa hasta -0.25 en los ultimos 1024 tokens antes del limite de generacion.

El entrenamiento usa 8 muestras por prompt, batch de rollout y de entrenamiento de 128, un maximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con schedule constante. El checkpoint se guarda en la rama `main` del repositorio, con los pesos en la raiz. El modelo se valida sobre el frente de problemas `cobalt-train ≤2/64` con muestreo a temperatura 1.0, y las metricas de evaluacion de este checkpoint no estan disponibles en el log de entrenamiento. El proyecto forma parte de la linea de investigacion Cobalt del grupo OSU-NLP-Group, que estudia RL online multi-turno para codigo y el fenomeno de reward hacking en contexto.

## Capacidades

- Generacion de codigo optimizada para correccion funcional: el modelo esta entrenado para producir programas que pasen los tests del problema, no solo codigo sintacticamente valido.
- Generacion de texto autoregresiva (pipeline `text-generation`) compatible con transformers y vLLM.
- Razonamiento multi-paso heredado del instruct base Qwen3-4B-Instruct-2507, incluyendo el modo thinking del modelo base.
- Generacion larga: soporta rollouts de hasta 4096 tokens nuevos, adecuado para problemas de programacion que requieren soluciones extensas.
- Capacidades multilingues y de chat heredadas del modelo base, aunque no se documentan en esta model card.
- Compatible con `text-generation-inference` y endpoints de inferencia (tag `endpoints_compatible`, region us).

## Casos de uso

- Investigacion en RL para generacion de codigo: como checkpoint de referencia para estudiar el efecto de GRPO sin KL penalty sobre un modelo de 4B, comparando con el modelo base y con checkpoints de otras ejecuciones de la misma familia Cobalt.
- Evaluacion de politicas de recompensa binaria: util para analizar como una recompensa exclusivamente basada en tests afecta a la tasa de exito (pass@k) en problemas de dificultad frontera.
- Estudio de anti-truncamiento y penalizaciones overlong: el checkpoint incorpora dos mecanismos de shaping (ProRL y DAPO) que pueden aislarse para medir su contribucion al rendimiento final.
- Generacion de soluciones a problemas de programacion competitiva: puede proponer soluciones a problemas del frente `clean_eval`, aunque su dominio se limita a los 1833 problemas de entrenamiento y 112 de validacion.
- Baseline para experimentos de decodificacion y muestreo: al ser un checkpoint intermedio (paso global 8) sin metricas publicadas, sirve como punto de comparacion dentro de la misma corrida RL para estudiar la evolucion del aprendizaje.
- Despliegue experimental en entornos de investigacion: puede servirse con vLLM o transformers para pruebas locales de generacion de codigo, siempre que se asuma el riesgo de una licencia no especificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este checkpoint es el mejor por pass@8 de su ejecucion RL, pero no proporciona numeros concretos de pass@k, ni resultados en MMLU, HumanEval, GSM8K o LiveCodeBench. Las metricas de evaluacion de este checkpoint no estan disponibles en el log de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,4B parametros, en precision bf16/fp16 se necesitan aproximadamente 8,8 GB de VRAM; en int8 unos 4,4 GB; en int4 unos 2,2 GB, mas overhead de keys/values del contexto y de la implementacion de servidor.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite inferencia en bf16 con margen; GPUs consumer de 8-12 GB (RTX 3060, RTX 4070) pueden servir el modelo con cuantizacion int4/int8.
- Cabe en GPU consumer: si, con cuantizacion en GPUs de 8 GB o mas.
- Opciones de despliegue: vLLM (comando documentado en la model card: `vllm serve ... --revision main`), transformers con `AutoModelForCausalLM`, y compatible con text-generation-inference. No se documenta soporte explicito para llama.cpp u Ollama, aunque al ser pesos safetensors de un modelo Qwen3 es plausible convertirlos a GGUF.
- Latencia y throughput: no disponibles. El repositorio pesa 17,7 GB, lo que sugiere multiples ficheros o revisiones ademas de los pesos bf16 (~8,8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid8) | 4,4B | No disponible (base Qwen3-4B-Instruct-2507) | RL GRPO sobre base instruct, recompensa binaria de codigo | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,4B | 32K (estandar Qwen3) | Instruct RLHF estandar | Apache 2.0 (segun Qwen3) | HuggingFace, ampliamente desplegado |
| Otros checkpoints de la familia Cobalt (p.ej. ncp20-vs30v11v, ncp20-groot30v11v) | 4,4B | No disponible | Variantes de la misma corrida RL con distintos parametros | No disponible | HuggingFace / FriendliAI |

La comparacion directa con el modelo base es la mas relevante: este checkpoint aplica RL directamente sobre el instruct base sin SFT semilla, por lo que la diferencia de rendimiento en pass@k sobre el frente cobalt-train indica el efecto del entrenamiento GRPO. No hay datos publicados de otros modelos de 4B comparables en la misma tarea.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es utilizable en produccion o con fines comerciales. Debe tratarse como material de investigacion.
- Sin validacion comunitaria: 0 descargas y 0 likes a fecha de la ficha; no hay evidencia de que otros equipos hayan reproducido o verificado los resultados.
- Metricas no publicadas: no hay resultados de benchmarks ni de evaluacion en el log de entrenamiento, solo la afirmacion de que es el mejor checkpoint por pass@8.
- Dominio estrecho: entrenado y validado sobre un frente de problemas concreto (cobalt-train ≤2/64); el rendimiento fuera de ese dominio es desconocido.
- Riesgo de reward hacking: el entrenamiento usa recompensa binaria sin penalizacion KL, y la propia investigacion Cobalt documenta comportamientos de reward hacking en contexto en modelos entrenados con estas tecnicas.
- Riesgo de alucinacion y codigo incorrecto: la recompensa binaria no garantiza correccion fuera de los tests del conjunto de entrenamiento; el modelo puede generar codigo que parezca correcto pero falle en casos reales.
- Sin informacion de sesgos ni de idiomas: no se documentan datos sobre sesgos, idiomas soportados ni comportamiento multilingue.
- Fecha futura de creacion (2026-09-01): el modelo es reciente y no cuenta con historial de uso ni soporte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid8
- Checkpoint hermano (misma corrida, ncp10-base): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Variante ncp20-vs30v11v (discusiones): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-vs30v11v/discussions
- Variante ncp20-groot30v11v en FriendliAI: https://friendli.ai/models/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-groot30v11v
- Proyecto Cobalt (OSU-NLP-Group, GitHub): https://github.com/OSU-NLP-Group/cobalt/blob/main/README.md
- Equipo ByteDance Seed (contexto de la linea de investigacion): https://seed.bytedance.com/en/
