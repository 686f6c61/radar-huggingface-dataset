# hyunlp-evateam3/20261107_healthbench_reward_toy_qwen3-1.7b_oct26_protocol

## Resumen
El modelo `20261107_healthbench_reward_toy_qwen3-1.7b_oct26_protocol` es un checkpoint de pesos derivado de Qwen/Qwen3-1.7B, publicado por el equipo hyunlp-evateam3 (HYU_NLP EVA Team3). No se trata de un modelo entrenado desde cero, sino de un ajuste fino orientado a un experimento de comparacion de metodos de reward modeling sobre el benchmark HealthBench. Concretamente, el autor documenta un experimento de cuatro metodos (weighted category deficit, GRPO, POWER y Focal) ejecutado el 2026-11-07, con 512 ejemplos de entrenamiento, 4 epocas y 64 pasos de rollout por metodo.

El checkpoint se publica como pesos de politica en BF16 listos para inferencia, acompanados de tokenizer, configuracion y un manifiesto de integridad. No incluye estado del optimizador ni del dataloader, por lo que no permite reanudar el entrenamiento de forma exacta; esos checkpoints completos permanecen en local. El repositorio publico contiene unicamente pesos y metadatos del protocolo, sin conversaciones de entrenamiento, respuestas del juez, credenciales ni ficheros de entorno.

Su relevancia es acotada: es un artefacto de investigacion reproducible para estudiar tecnicas de reward model y su efecto sobre un modelo pequeno de 1.7B parametros en el dominio sanitario, no un modelo de produccion generalista. La licencia Apache 2.0 y el formato safetensors facilitan su inspeccion, pero la ausencia de model card detallada, benchmarks publicados e idiomas declarados limita su evaluacion fuera del experimento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); no se detalla configuracion especifica |
| Parametros totales | 1.7B (aproximado, segun modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), con tokenizer y config |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se ajusta mediante un protocolo experimental de reward modeling sobre HealthBench. El autor describe cuatro metodos comparados: weighted category deficit, GRPO, POWER y Focal. Las condiciones declaradas son 512 ejemplos de entrenamiento durante 4 epocas, 64 pasos de rollout por metodo, y un subconjunto de validacion identico de 128 ejemplos bajo el protocolo original del 26 de octubre. Focal mantiene una excepcion aprobada de juez de entrenamiento pairwise.

Cada paso completado se publica como pesos de politica BF16 listos para inferencia en `<method>/checkpoints/global_step_000001/`, junto con tokenizer, config y un manifiesto de integridad de ficheros. Los checkpoints completos para reanudacion exacta (optimizador y dataloader) se conservan en local cada 10 pasos, mas el ultimo y el final. No se especifican detalles de composicion del dataset ni si hubo RLHF o DPO adicionales mas alla de los metodos de reward citados.

## Capacidades
- Generacion de texto condicionada por los pesos ajustados sobre el modelo base Qwen3-1.7B.
- Inferencia directa en BF16 con transformers, segun la libreria declarada.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Alineacion con el dominio de evaluacion sanitaria HealthBench, derivada del protocolo de entrenamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Investigacion en reward modeling: el checkpoint permite reproducir y comparar los cuatro metodos (weighted category deficit, GRPO, POWER, Focal) sobre un modelo pequeno de 1.7B en el benchmark HealthBench, aislando el efecto de cada tecnica.
- Evaluacion de tecnicas de alineacion en modelos pequenos: util para estudiar como se comportan metodos de reward con 512 ejemplos y 4 epocas en un modelo de 1.7B, antes de escalar a modelos mayores.
- Analisis de robustez en dominio sanitario: permite inspeccionar como un ajuste orientado a HealthBench afecta a las respuestas del modelo base en preguntas clinicas, siempre con supervision experta.
- Reproducibilidad de experimentos: el manifiesto de integridad y la publicacion por paso facilitan la verificacion de artefactos en pipelines de investigacion.
- Comparacion de checkpoints intermedios: al publicarse cada paso completado, se puede trazar la evolucion de los pesos a lo largo del entrenamiento.
- Base para prototipos de evaluacion automatica: puede emplearse como componente en un sistema de puntuacion de respuestas sanitarias, sujeto a validacion adicional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 1.7B en BF16, se estima en torno a 3.4 GB solo para pesos, mas overhead de activaciones y cache KV; no se especifica en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabe en GPUs consumer modernas con suficiente VRAM.
- Compatibilidad con GPU consumer: probable por el tamano de 1.7B, aunque no se confirma en la documentacion.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles; no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 20261107_healthbench_reward_toy_qwen3-1.7b_oct26_protocol | 1.7B (aprox.) | no disponible | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (modelo base) | 1.7B | no disponible | no disponible | no disponible | Hugging Face |
| 20261101_healthbench_online_qwen3-4b_impl-ruscarl_s1 | 4B (aprox.) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Es un artefacto de investigacion, no un modelo de produccion; no se han publicado evaluaciones de calidad, seguridad ni sesgos.
- No incluye estado del optimizador ni del dataloader, por lo que no permite reanudar el entrenamiento de forma exacta desde el repositorio publico.
- No se declaran idiomas soportados, lo que impide garantizar comportamiento multilingue.
- No se especifica la longitud de contexto, un parametro critico para aplicaciones con ventanas largas.
- Riesgo de alucinacion inherente a modelos de 1.7B ajustados con pocos ejemplos (512) y pocas epocas (4); no hay evaluacion publicada que lo cuantifique.
- El ajuste esta orientado a HealthBench, un dominio sanitario sensible; cualquier uso clinico requiere validacion experta y no debe basarse en este checkpoint sin auditoria.
- Aunque la licencia es apache-2.0, el uso comercial no esta respaldado por evaluaciones de rendimiento ni de seguridad.
- El repositorio no incluye conversaciones de entrenamiento ni respuestas del juez, lo que limita la auditoria del proceso.
- La fecha de creacion (2026-11-07) y el nombre del repositorio sugieren un contexto experimental con posible nomenclatura interna no estandarizada.

## Enlaces
- Hugging Face: https://huggingface.co/hyunlp-evateam3/20261107_healthbench_reward_toy_qwen3-1.7b_oct26_protocol
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio relacionado: https://huggingface.co/hyunlp-evateam3/20261101_healthbench_online_qwen3-4b_impl-ruscarl_s1
