# markstanl/coherencerl-exp7-1_5b-lora

## Resumen

`coherencerl-exp7-1_5b-lora` es un ajuste fino del modelo base Qwen/Qwen2.5-1.5B, desarrollado por el usuario markstanl y publicado en Hugging Face. Se trata de un experimento de alineacion mediante aprendizaje por refuerzo, concretamente con el algoritmo GRPO (Group Relative Policy Optimization), aplicado sobre un transformer decoder-only de 1.500 millones de parametros. El modelo se distribuye como adaptador LoRA entrenado con la libreria TRL y esta pensado para generacion de texto conversacional.

El interes del modelo es fundamentalmente metodologico: documenta un flujo de entrenamiento con GRPO sobre un modelo pequeno, con trazabilidad en Weights & Biases y versiones de framework muy recientes (TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0). No obstante, la informacion publicada es muy escasa: no hay model card detallada, no se especifican datos de entrenamiento, benchmarks ni licencia explicita, y el repositorio aparece con un tamano reportado de 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar materializados o que la metadata es incompleta.

Por tanto, debe evaluarse como un artefacto experimental de investigacion mas que como un modelo listo para produccion. Su utilidad practica depende de validar manualmente la integridad de los pesos y de asumir las limitaciones del modelo base Qwen2.5-1.5B, sobre el que se apoya toda la capacidad linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B); ajuste mediante LoRA + GRPO |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B); parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (adaptador LoRA, segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens con peso atado a la capa de salida. Sobre esa base se aplica un ajuste fino con LoRA (adaptadores de bajo rango), aunque la model card no detalla el rango, el alpha ni las capas objetivo del adaptador.

El entrenamiento utiliza GRPO, el algoritmo de optimizacion de politica con refuerzo introducido en DeepSeekMath (arXiv:2402.03300), implementado a traves de TRL. GRPO estima la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma consulta, evitando la necesidad de un modelo critico separado. La model card no especifica el dataset de entrenamiento, el numero de pasos, la funcion de recompensa ni la composicion de los prompts; unicamente enlaza a una ejecucion de Weights & Biases (`RLCR/runs/geat7qz0`) donde podrian consultarse esos detalles. No se documenta ninguna innovacion arquitectonica adicional ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato de chat (el ejemplo de la model card usa una lista de mensajes con rol `user`).
- Razonamiento de un solo turno orientado a preguntas abiertas y dilemas hipoteticos, segun el ejemplo publicado.
- Ajuste por refuerzo orientado a coherencia (el nombre del modelo sugiere un objetivo de recompensa basado en coherencia, aunque la funcion de recompensa no esta documentada).
- Compatibilidad con `transformers` y con Text Generation Inference (tag `text-generation-inference`), lo que permite servirlo via API compatible con OpenAI (`endpoints_compatible`).
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base.

## Casos de uso

- Experimentacion academica con GRPO: el modelo sirve como referencia reproducible para estudiar como afecta el ajuste por refuerzo a un modelo de 1.5B, comparando la ejecucion de W&B con el checkpoint base.
- Prototipado rapido de chatbots conversacionales: al ser un modelo pequeno, puede desplegarse en una unica GPU consumer para validar flujos de conversacion antes de escalar a modelos mayores.
- Generacion de respuestas a preguntas abiertas en entornos de bajo coste: su tamano permite inferencia en hardware modesto, adecuado para demos internas o entornos de desarrollo.
- Evaluacion de tecnicas de alineacion: util para investigadores que quieran contrastar GRPO frente a DPO o RLHF clasico sobre la misma base Qwen2.5-1.5B.
- Fine-tuning posterior sobre dominio especifico: al ser un adaptador LoRA, puede combinarse o sustituirse por otros adaptadores para tareas concretas sin recargar el modelo base completo.
- Servicio de inferencia ligero con TGI: el tag `text-generation-inference` permite levantarlo detras de una API compatible con OpenAI para pruebas de integracion en pipelines de aplicaciones.
- Base para estudios de coherencia y seguridad: permite analizar si el ajuste por refuerzo introduce o mitiga comportamientos incoherentes en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3-4 GB para los pesos del modelo base de 1.5B mas overhead de activaciones y cache KV; el adaptador LoRA anade una cantidad marginal.
- En cuantizacion de 8 bits: alrededor de 2 GB; en 4 bits: en torno a 1-1.5 GB (estimaciones para el modelo base, no verificadas para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 o H100 no son necesarias por tamano, salvo para lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (soportado por tag), vLLM y llama.cpp/Ollama solo si se convierten los pesos a GGUF (no se proporciona conversion oficial).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coherencerl-exp7-1_5b-lora | 1.5B (base) + LoRA | no disponible | GRPO + LoRA | no disponible | Hugging Face (716 descargas) |
| Qwen/Qwen2.5-1.5B | 1.5B | 32.768 tokens (segun model card del base) | Preentrenamiento + SFT | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (segun model card del base) | SFT + preferencias | Apache 2.0 (segun el modelo base) | Hugging Face, con benchmarks publicados |
| Modelos 1.5B alternativos (p. ej. SmolLM2-1.7B) | ~1.7B | no disponible en esta ficha | SFT | Apache 2.0 (segun el modelo) | Hugging Face |

La comparacion directa con el modelo base es la mas relevante: este ajuste anade un paso de RL sobre Qwen2.5-1.5B, pero carece de benchmarks que permitan cuantificar la mejora. Frente a Qwen2.5-1.5B-Instruct, la diferencia principal es el metodo de alineacion (GRPO frente a SFT con preferencias) y la ausencia de evaluacion publicada.

## Limitaciones y advertencias

- No se especifica licencia concreta: el campo `licence: license` es ambiguo y no permite confirmar el uso comercial. Debe contactarse con el autor o asumir la licencia del modelo base (Apache 2.0 en Qwen2.5-1.5B) con cautela.
- El repositorio reporta un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar subidos o que la metadata esta incompleta; verificar antes de usarlo.
- No hay benchmarks publicados: no es posible afirmar que el ajuste GRPO mejore la coherencia, el razonamiento o la utilidad respecto al modelo base.
- No se documenta el dataset de entrenamiento ni la funcion de recompensa, por lo que se desconocen sesgos introducidos por el RL.
- Riesgo de alucinacion inherente a un modelo de 1.5B: capacidad limitada de razonamiento factual y propension a inventar datos en preguntas especializadas.
- Idiomas soportados no confirmados; aunque Qwen2.5 cubre varios idiomas, el ajuste podria haber degradado el rendimiento en lenguas distintas del ingles si el dataset de RL era monolingue.
- Longitud de contexto no confirmada para este ajuste: no asumir los 32.768 tokens del base sin probarlo.
- Modelo experimental sin mantenimiento aparente (0 likes, creado en 2026-10-22 y actualizado en 2026-11-09): no recomendado para produccion sin validacion exhaustiva.
- El autor no publica limitaciones conocidas ni evaluaciones de seguridad; el uso en aplicaciones de cara al usuario requiere filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markstanl/coherencerl-exp7-1_5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/geat7qz0
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
