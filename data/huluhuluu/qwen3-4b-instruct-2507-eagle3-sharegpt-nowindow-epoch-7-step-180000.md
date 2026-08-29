# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-180000

## Resumen

Este repositorio contiene un checkpoint del modelo de borrador (draft model) EAGLE3 entrenado en línea con SpecForge para acelerar la inferencia de `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un modelo de decodificación especulativa, no de un modelo de chat independiente: su función es generar secuencias de tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia por token y aumentando el throughput en servidores de inferencia. El checkpoint corresponde a la época 7, paso 180000 de un entrenamiento de 10 épocas con 231810 pasos totales.

Es relevante para equipos que despliegan Qwen3-4B en producción con SGLang y necesitan optimizar el rendimiento sin sacrificar calidad. La arquitectura es una única capa de decoder de tipo `LlamaForCausalLMEagle3` con 202,7 millones de parámetros, mucho más pequeña que el modelo objetivo, lo que permite ejecutarla en paralelo con coste marginal mínimo. El entrenamiento se realizó sobre datos ShareGPT limpios, con una longitud máxima de secuencia de 2048 tokens y sin ventana deslizante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 (según safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 (máxima de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (datos ShareGPT, mayormente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una única capa de decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas key/value. El vocabulario del borrador es de 32000 tokens, mientras que el del modelo objetivo es de 151936. Los pesos están en bfloat16. Esta configuración sigue el esquema EAGLE3, que entrena el borrador para predecir los feature embeddings del modelo objetivo, permitiendo aceptar múltiples tokens por paso de verificación.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio (revisión no registrada). Se usaron 10 épocas, 231810 pasos de optimización, batch global efectivo de 4 (con data-parallel size 4 y batch por dispositivo 1), learning rate 1e-4 con warmup lineal del 1,5% y posterior annealing coseno, weight decay 0,0 y gradiente máximo 0,5. La longitud máxima de secuencia fue 2048 tokens, con EAGLE3 TTT length de 7. La atención del borrador usa `sdpa` y el backend objetivo es SGLang con FlashInfer. No se registraron métricas de evaluación ni de seguridad.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa con EAGLE3.
- Aceleración de inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` (no funciona con otras familias).
- Integración nativa con SGLang mediante `--speculative-algorithm EAGLE3`.
- Soporte de configuración de árbol de borradores (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`).
- Ejecución en paralelo con el modelo principal, con coste de VRAM adicional mínimo (0,4 GB).
- No es un modelo de chat: no genera respuestas por sí mismo ni soporta tool calling, agentes ni razonamiento autónomo.

## Casos de uso

- Servidores de inferencia de baja latencia: desplegar este borrador junto a Qwen3-4B-Instruct-2507 en SGLang reduce la latencia por token en cargas de trabajo interactivas, como chatbots o asistentes en tiempo real.
- Aumento de throughput en producción: al verificar múltiples tokens por paso, se incrementa el número de peticiones concurrentes que un solo servidor puede atender con la misma GPU.
- Optimización de costes en entornos cloud: al mejorar la eficiencia por token, se reduce el tiempo de cómputo por petición, lo que permite usar instancias más pequeñas o atender más tráfico con el mismo hardware.
- Despliegue en hardware consumer: el borrador ocupa solo 0,4 GB y puede ejecutarse junto al modelo principal en GPUs como RTX 4090 o incluso en configuraciones con VRAM limitada, siempre que el modelo principal quepa.
- Benchmarking de configuraciones especulativas: permite probar distintos valores de `--speculative-num-steps`, topk y número de tokens de borrador para ajustar el rendimiento según el workload.
- Investigación en decodificación especulativa: sirve como referencia de un entrenamiento EAGLE3 completo sobre ShareGPT, útil para estudiar el efecto de los datos de entrenamiento del borrador en la tasa de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "No evaluation or safety metrics were recorded for this run". No se proporcionan datos de tasa de aceptación, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en bfloat16, más overhead de activaciones y KV cache del borrador. En la práctica, el consumo adicional sobre el modelo principal es inferior a 1 GB.
- GPU recomendadas: cualquier GPU que pueda ejecutar Qwen3-4B-Instruct-2507 (por ejemplo, RTX 3090, RTX 4090, A10, A100, H100). El borrador no requiere hardware especial.
- Compatible con GPU consumer: sí, siempre que el modelo principal quepa en la VRAM disponible.
- Opciones de despliegue: SGLang con backend FlashInfer (recomendado). No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles. Dependen del hardware, la configuración del árbol de borradores y la carga de trabajo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint concreto. Como referencia general, los draft models EAGLE3 compiten con otras técnicas de decodificación especulativa como Medusa o EAGLE-2. La principal diferencia es que EAGLE3 se entrena sobre los feature embeddings del modelo objetivo, lo que suele lograr tasas de aceptación más altas que los métodos basados solo en tokens. Sin embargo, no hay benchmarks públicos que respalden esta afirmación para este checkpoint.

| Modelo | Parametros | Contexto | Metodo | Licencia |
|---|---|---|---|---|
| Este checkpoint (EAGLE3) | 202,7 M | 2048 | EAGLE3 | Apache 2.0 |
| Draft model EAGLE-2 para Qwen2 | no disponible | no disponible | EAGLE-2 | Apache 2.0 |
| Medusa (para diversos modelos) | ~1-2 % del modelo base | depende | Medusa heads | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo de chat: no puede usarse de forma independiente para generar respuestas; requiere el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Solo es compatible con la familia exacta del modelo objetivo; no funcionará con otras variantes de Qwen3 ni con otros modelos.
- Entrenado exclusivamente con ShareGPT, que contiene principalmente datos en inglés; el rendimiento del borrador puede degradarse con otros idiomas.
- Longitud de contexto limitada a 2048 tokens durante el entrenamiento; no se ha probado con secuencias más largas.
- No se registraron métricas de evaluación ni de seguridad; no hay garantías sobre la calidad o la seguridad del borrador en producción.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Los valores de configuración del árbol de borradores (num-steps, topk, num-draft-tokens) son valores iniciales; deben ajustarse y evaluarse para cada carga de trabajo.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-180000
- Repositorio de checkpoints hermanos (época 7, paso 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Implementación oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo objetivo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de despliegue local de Qwen3-4B-Instruct-2507 con Ollama: https://mattselander.com/deploy-qwen3-4b-instruct-2507-locally-via-ollama-2/
