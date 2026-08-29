# logic65/whittle-next

## Resumen

whittle-next es un artefacto de investigación creado por logic65 (David Aylward) en colaboración con Claude, que implementa en miniatura la arquitectura Qwen3.8-Flash-Next / Qwen4 mediante cirugía exacta de pesos sobre el modelo Whittle-16B (que a su vez es una compresión de Qwen/Qwen3.8-27B, licencia Apache-2.0). Se trata de un modelo MoE disperso con hyper-connections y memoria n-gram offloadable a RAM de host, diseñado para estudiar la viabilidad de estas técnicas en hardware comodity.

Es crucial entender que este modelo está **sin entrenar**: los routers están zero-inicializados, por lo que en su estado actual enruta todos los tokens a los mismos 16 expertos y produce texto degenerado. No es un modelo de chat utilizable, sino la base verificada para un proceso de recuperación (training) documentado por el autor. Con 16.359.687.904 parámetros totales y una ventana de contexto de 262.000 tokens, representa un experimento reproducible de compresión y arquitectura MoE avanzada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (qwen3_5_moe) con hyper-connections y memoria n-gram (PLE) |
| Parametros totales | 16.359.687.904 (~16,36B) |
| Parametros activos | No especificado; top-16 de 67 expertos + 192 compartidos |
| Longitud de contexto | 262.000 tokens (heredado del backbone) |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (más mini_next.py y hc_init.pt) |

## Arquitectura y entrenamiento

La arquitectura se compone de un backbone de 44 capas con dimensión 5120, con una proporción 3:1 entre atención GDN (Global-Dense-Narrow) y atención completa. Sobre este backbone se realiza una partición exacta de las FFN densas en un MoE con 13.056 dimensiones ocultas distribuidas en 192 expertos compartidos y 67 expertos rutados de 192 dimensiones cada uno, activando los top-16 por token. Se añaden pre-escalados en el down_projection (routed ×16, shared ×2) siguiendo las convenciones de qwen3_5_moe con softmax-renorm y sigmoid-gate.

Las hyper-connections utilizan 2 streams residuales con mezcla restringida por Sinkhorn, implementadas mediante hooks sin modificar los pesos. La memoria n-gram (PLE) usa 32 cabezas hash (16 bigramas + 16 trigramas) de 160 dimensiones, con inyección gated en las capas 2, 6, ..., 42, y la tabla de 4B entradas reside en RAM de host. El proceso de entrenamiento de recuperación combina optimizadores AdamW para routers, SparseAdam para la tabla host, Muon para las proyecciones PLE y entrenamiento conjunto de hyper-connections, sobre un corpus limpio de 16,5M tokens en una sola A100-80GB.

## Capacidades

- Generación de texto con contexto largo (262k tokens) una vez recuperado el router
- Razonamiento multi-paso y modelado de lenguaje estándar tras el entrenamiento de recuperación
- Soporte de memoria n-gram offloadable a RAM de host, reduciendo requisitos de VRAM
- Inferencia eficiente gracias a la activación selectiva de 16 de 67 expertos
- Arquitectura preparada para tool calling y agentes (potencial, no implementado en esta versión base)
- Multilingüismo heredado del backbone Qwen3.8 (no verificado en esta variante)
- Hyper-connections con mezcla Sinkhorn para estabilidad de gradientes

## Casos de uso

- Investigación en compresión de modelos: estudiar cómo una partición exacta de FFN densas en MoE preserva el rendimiento con solo 16 expertos activos.
- Desarrollo de técnicas de recuperación de routers: el proceso de entrenamiento conjunto documentado (routers + tabla PLE + HC) sirve como banco de pruebas para métodos de inicialización y fine-tuning.
- Experimentación con memoria n-gram offloadable: validar el impacto de tablas hash residentes en host RAM sobre la perplejidad y el coste de inferencia.
- Benchmark de eficiencia: medir throughput y latencia de un MoE 16B con top-16 en GPUs consumer y data center.
- Estudio de hyper-connections: analizar la estabilidad de gradientes y la calidad de representación con 2 streams residuales y restricción Sinkhorn.
- Fine-tuning para tareas específicas tras el proceso de recuperación, aprovechando la licencia Apache-2.0 para uso comercial.
- Reproducibilidad de arquitecturas Flash-Next en hardware comodity, como referencia para implementaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta la pérdida de entropía cruzada (CE) en un conjunto held-out con secuencias de 512 tokens durante el proceso de recuperación:

| Estado | CE held-out |
|---|---|
| Base (routers zero-init) | 7,57 |
| Tras 5M tokens de entrenamiento conjunto | 3,65 |
| Referencia densa Whittle-16B | ~3,0–3,2 |

Estos datos indican que el proceso de recuperación reduce la perplejidad de forma significativa, acercándose al rendimiento del modelo denso original.

## Requisitos de hardware

- Entrenamiento de recuperación: una sola GPU A100-80GB (según la model card), con la tabla PLE de 4B entradas en RAM de host (~16GB adicionales).
- Inferencia estimada: con 32,7GB de pesos en bf16, se necesitan ~40GB de VRAM para cargar el modelo completo en fp16/bf16. Con cuantización int8 (~16GB) o 4-bit (~8GB) podría ejecutarse en GPUs consumer como RTX 4090 (24GB) o RTX 3090 (24GB).
- Opciones de despliegue: transformers (carga nativa como qwen3_5_moe), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama.
- Latencia y throughput: no disponibles; depende de la cuantización y del hardware. La activación top-16 de 67 expertos reduce el coste computacional frente a un denso equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| whittle-next | 16,36B | 262k | MoE top-16 | Apache-2.0 | Sin entrenar, artefacto de investigación |
| Whittle-16B | 16B | 262k | Denso | Apache-2.0 | Modelo base del que se deriva, funcional |
| Qwen3.8-27B | 27B | 262k | Denso | Apache-2.0 | Modelo original del que deriva Whittle-16B |
| Qwen3.8-Whittle-MoE-27B-A17.8B | 27B | 262k | MoE 17,8B activos | Apache-2.0 | Variante MoE de la misma colección, con routers funcionales |

whittle-next se distingue por ser la única variante sin entrenar, diseñada específicamente para estudiar el proceso de recuperación desde cero. Las demás variantes de la colección Whittle ofrecen modelos funcionales con distintos equilibrios entre parámetros totales y activos.

## Limitaciones y advertencias

- Modelo sin entrenar: los routers zero-inicializados producen texto degenerado; no es apto para uso directo en producción ni en aplicaciones de chat.
- Artefacto de investigación: requiere ejecutar el proceso de recuperación documentado (entrenamiento conjunto con el kit mini-next-a100-kit) antes de cualquier uso práctico.
- Sesgos heredados: al derivar de Qwen3.8-27B, puede heredar sesgos del corpus original, aunque no se han evaluado en esta variante.
- Riesgo de alucinación: incluso tras la recuperación, el modelo puede generar contenido falso; no hay evaluación de seguridad publicada.
- Requisitos de hardware para entrenamiento: el proceso de recuperación necesita una A100-80GB y RAM de host adicional para la tabla PLE.
- Sin garantías de rendimiento: los datos de CE mostrados son preliminares y corresponden a un único experimento con 16,5M tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/whittle-next
- Modelo base (Whittle-16B): https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Kit de entrenamiento y runbook: https://huggingface.co/datasets/logic65/mini-next-a100-kit
- Banco de KD del padre (Qwen3.8-27B): https://huggingface.co/datasets/logic65/qwen38-27b-parent-kd-bank
- Colección Whittle en HuggingFace: https://huggingface.co/collections/logic65/whittle-models-you-can-run
- Variante MoE funcional de la colección: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
