# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-open-r1-old-groupA-qwen25vl-3b-full

## Resumen

Este modelo es un checkpoint de investigación derivado de Qwen2.5-VL-3B, entrenado mediante Co-GRPO (Group Relative Policy Optimization con co-aprendizaje) en un esquema heterogéneo junto a InternVL3.5-2B. Lo publica Logan Yang (logan7000) como parte de un proyecto de reproducción de la receta OpenR1, orientado a estudiar el co-entrenamiento entre modelos multimodales de distintas familias y tamaños. El checkpoint corresponde al "lado Qwen" (grupo A) del experimento, es decir, los pesos completos de Qwen2.5-VL-3B tras el entrenamiento conjunto.

La relevancia de este modelo es principalmente metodológica: explora si dos arquitecturas VLM diferentes pueden beneficiarse mutuamente mediante un objetivo de RL compartido, y documenta una receta concreta (hiperparámetros, protocolo de evaluación) que puede servir de referencia para trabajos similares. No se trata de un modelo listo para producción, sino de un artefacto experimental con 0 descargas y 0 likes en el momento de su publicación. La arquitectura base es un transformer multimodal de aproximadamente 3 mil millones de parámetros, con codificador visual integrado, aunque la ficha pública no detalla la longitud de contexto ni otros parámetros técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-3B (transformer multimodal con vision encoder) |
| Parametros totales | 3B (aproximadamente, segun el nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el tamano del repo es 15.0 GB, sugiere safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B, un VLM denso basado en transformer con codificador visual. El entrenamiento aplica Co-GRPO, una variante de GRPO donde dos modelos (Qwen2.5-VL-3B e InternVL3.5-2B) se optimizan conjuntamente, cada uno con su propio grupo de prompts, compartiendo la señal de recompensa. La receta "old" especifica: beta 0, K 8, temperatura 1.0, cap de longitud 1024, learning rate 1e-6, warmup 0.03, y 8 prompts por paso con batch efectivo de 64. Se ejecutaron 961 pasos (1 época), con el mejor checkpoint en el paso 650 según la métrica de validación MathVista-150. El protocolo de evaluación usa temperatura 0, contexto de 16k, prompt con formato "boxed", y un juez automático basado en reglas más Qwen2.5-32B. No se especifica la composición del dataset de entrenamiento más allá de la referencia a OpenR1, ni se detallan innovaciones arquitectónicas adicionales.

## Capacidades

- Procesamiento multimodal: entrada de texto e imágenes, herencia de Qwen2.5-VL.
- Razonamiento visual y matemático: el entrenamiento con receta OpenR1 se orienta a problemas de razonamiento, aunque no se publican resultados cuantitativos.
- Generación de texto en lenguaje natural.
- No se confirma soporte de tool calling, function calling, agentes o modos de pensamiento explícitos en la informacion disponible.
- Capacidades multilingues no documentadas.

## Casos de uso

- Investigacion en co-entrenamiento de modelos multimodales heterogeneos: este checkpoint sirve como referencia para estudiar como interactuan dos VLM de distintas familias durante el RL conjunto.
- Reproduccion de experimentos de la literatura OpenR1: permite comparar la receta "old" con variantes mas recientes (beta, K, cap) en el mismo backbone.
- Evaluacion de tecnicas de RL para VLM: util para analizar el efecto de Co-GRPO frente a GRPO estandar o PPO en modelos de 3B.
- Fine-tuning posterior para tareas especificas: al ser un checkpoint intermedio, puede servir como punto de partida para adaptacion a dominios concretos (por ejemplo, documentos cientificos o diagramas).
- Benchmarking de razonamiento visual-matematico: permite medir el impacto del co-entrenamiento en metricas como MathVista, aunque no se han publicado resultados.
- Estudio de transferencia de conocimiento entre arquitecturas: el esquema heterogeneo puede revelar si un modelo pequeno (2B) influye en uno mayor (3B) y viceversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona MathVista-150 como metrica de validacion para seleccionar el mejor checkpoint, pero no ofrece valores numericos. Tampoco se comparan resultados con el modelo base Qwen2.5-VL-3B ni con otras variantes.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Como estimacion orientativa para un modelo de 3B parametros: en precision fp16/bf16, la VRAM necesaria para inferencia ronda los 6-8 GB; con cuantizacion de 4 bits, unos 2-3 GB. Estas cifras son estimaciones genericas, no datos del autor.
- El entrenamiento se realizo en GPUs A100 (segun la model card), lo que sugiere que la inferencia es viable en GPUs de consumo como RTX 3090, RTX 4090 o similares con suficiente VRAM.
- Opciones de despliegue habituales para este tamano: vLLM, llama.cpp, Ollama o TGI, aunque no se confirma compatibilidad explicita.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo no ha sido evaluado frente a alternativas como Qwen2.5-VL-3B original, InternVL3.5-2B u otros VLM de tamano similar. La ausencia de benchmarks y de licencia impide una comparacion rigurosa.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo de produccion: no ha pasado por pruebas de robustez, seguridad o sesgos.
- La licencia no esta especificada, lo que impide cualquier uso comercial o redistribucion sin autorizacion explicita del autor.
- No hay documentacion sobre sesgos conocidos, riesgos de alucinacion o limitaciones de idioma.
- El entrenamiento se realizo con una receta concreta (beta 0, K 8, cap 1024) que puede no generalizar a otros dominios o datasets.
- Al ser el "lado Qwen" de un co-entrenamiento heterogeneo, su comportamiento puede estar influenciado por la interaccion con InternVL3.5-2B, y no es directamente comparable con un fine-tuning estandar de Qwen2.5-VL.
- El repositorio no incluye un modelo card detallada con instrucciones de uso, lo que dificulta su adopcion.
- La fecha de creacion (2026-09-02) y la ausencia de actividad sugieren que el proyecto puede estar inactivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-open-r1-old-groupA-qwen25vl-3b-full
- Perfil del autor: https://huggingface.co/logan7000
- Repositorio de modelos del autor: https://huggingface.co/logan7000/models
- Referencia a Qwen3-VL (contexto de la familia Qwen): https://github.com/QwenLM/Qwen3-VL
- Referencia a Qwen3 (serie de modelos): https://github.com/QwenLM/Qwen3
