# hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp

## Resumen

Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp es una cuantización en formato MLX, publicada por el usuario hakunokina, de un modelo de 9B ajustado por khazarai a partir de Qwen3.5-9B mediante destilación de trayectorias de Kimi K3 centradas en tareas de codificación agéntica (depuración, bucles de construcción y prueba, uso intensivo de herramientas). El objetivo del modelo base es ofrecer un modelo pequeño y especializado en flujos de trabajo de agente de código, y esta variante lo hace ejecutable de forma eficiente en hardware Apple Silicon.

La cuantización emplea oMLX oQ8e, un esquema afín de 8 bits calibrado con matrices de importancia (imatrix), y conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que permite decodificación especulativa y mayores velocidades de generación. El modelo mantiene también el codificador de visión del original, aunque la entrada de imágenes no ha sido probada en esta build. Ofrece un contexto de 262k tokens y se publica bajo licencia Apache-2.0.

Es relevante porque cubre un hueco concreto: hasta su publicación no existía una build MLX/oQ de este modelo destilado, y la medición de calidad se realiza de forma rigurosa mediante divergencia KL contra la fuente BF16, con un acuerdo top-1 del 98,3 %, lo que indica una pérdida de calidad prácticamente despreciable respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 denso, híbrido Gated DeltaNet + atención (32 capas), con cabeza MTP y codificador de visión |
| Parámetros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantización | oMLX oQ8e (afín de 8 bits, grupo 64, calibrado con imatrix); existe variante oQ6e (~8 GB) |
| Idiomas soportados | no disponible (el conjunto de calibración incluye código, inglés y turco) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~10,7 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, una arquitectura densa híbrida que combina capas Gated DeltaNet (una variante de estado recurrente lineal) con capas de atención completa: de las 32 capas totales, 8 son de atención completa y el resto Gated DeltaNet. Esta hibridación reduce drásticamente el coste de la caché KV (solo ~32 KB/token, concentrados en las 8 capas de atención), lo que hace viable el contexto de 262k tokens con una huella de memoria moderada (~8 GB de KV cache a contexto máximo). El modelo incorpora además una capa de predicción multi-token (MTP), conservada en esta cuantización, que habilita la decodificación especulativa en el runtime oMLX.

El ajuste fino fue realizado por khazarai mediante destilación sobre el dataset `greghavens/kimi-k3-coding-and-debugging-traces`, que contiene trayectorias de Kimi K3 en tareas de codificación y depuración con uso intensivo de herramientas (patrones tool-first y bucles build-test-fix). No se ha publicado información sobre el número de tokens del ajuste, ni sobre el uso de RLHF o DPO. La cuantización oQ8e se calibró con imatrix sobre un conjunto de código y texto multilingüe de oMLX.

## Capacidades

- Generación de código y depuración en bucles agénticos (build-test-fix), especialización principal derivada de la destilación desde Kimi K3.
- Tool calling: verificado en la build con las APIs de Anthropic (`/v1/messages`, 5/5 ejecuciones correctas) y OpenAI (`/v1/chat/completions`, 4/5).
- Entrada multimodal imagen-texto: el codificador de visión del modelo fuente se conserva en la cuantización, aunque la entrada de imágenes no ha sido probada en esta build (pipeline `image-text-to-text`).
- Contexto muy largo (262k tokens) con caché KV ligera gracias a la arquitectura híbrida Gated DeltaNet.
- Decodificación especulativa vía MTP, con ~70 tok/s de generación en Apple Silicon de gama alta.
- Capacidades multilingües: el conjunto de calibración incluye inglés y turco; el listado completo de idiomas no está disponible.

## Casos de uso

- Agentes de codificación locales en Mac: el modelo puede ejecutarse íntegramente en Apple Silicon con oMLX, sirviéndose vía API OpenAI o Anthropic, lo que permite construir agentes de código (Claude Code, Cline, Aider) sin depender de la nube.
- Depuración automatizada en bucles build-test-fix: su entrenamiento sobre trayectorias de Kimi K3 lo hace adecuado para agentes que compilan, ejecutan tests, leen errores y corrigen código de forma iterativa.
- Análisis de repositorios grandes: con 262k de contexto y una caché KV de solo ~32 KB/token, puede ingerir bases de código extensas o historiales largos de conversación sin agotar la memoria.
- Orquestación de herramientas en pipelines de CI/CD: el soporte de tool calling verificado permite integrarlo como paso automatizado que ejecuta comandos, lanza tests o aplica parches.
- Asistentes de chat con contexto largo: la etiqueta `conversational` y el contexto amplio lo hacen útil para asistentes que necesitan mantener sesiones multi-turno extensas.
- Servidor LLM personal de bajo coste energético: en un Mac con suficiente memoria unificada, ofrece ~70 tok/s de decodificación, suficiente para uso interactivo diario sin GPU dedicada.
- Prefill rápido sobre prompts extensos: ~1.200 tok/s de prefill (24 s para ~29k tokens en frío, 0,58 s con caché de prefijo) lo hace adecuado para reutilizar system prompts largos entre peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni del modelo base ni de esta build. La calidad se reporta como divergencia respecto a la fuente BF16:

| Métrica | Valor |
|---|---|
| KL(BF16 ‖ oQ8e) media | 0,00097 nat/token |
| KL mediana / p99 | 0,00065 / 0,0054 |
| Acuerdo top-1 de tokens | 98,3 % |
| Perplejidad BF16 → oQ8e | 8,428 → 8,428 |

Medidas de velocidad (Mac Studio M3 Ultra, 512 GB, oMLX 0,7.1; mediciones de una sola ejecución):

| Métrica | Valor |
|---|---|
| Prefill ~29k tokens (en frío) | ~24 s (~1.200 tok/s) |
| Mismo prefijo con caché | ~0,58 s |
| Decodificación (MTP especulativo) | ~70 tok/s |
| Tool calling Anthropic / OpenAI (5 ejecuciones) | 5/5 / 4/5 |

## Requisitos de hardware

- Memoria: ~10 GB para los pesos más la caché KV (~32 KB/token en las 8 capas de atención completa; ~8 GB adicionales a 262k de contexto). En la práctica, 24 GB de memoria unificada son suficientes para uso general; para contexto máximo, 32-48 GB.
- Diseñado específicamente para Apple Silicon: verificado en Mac Studio M3 Ultra (512 GB). Debería funcionar en Macs con M1/M2/M3/M4 con al menos 16-24 GB de memoria unificada, aunque no hay medidas publicadas para esos equipos.
- No es un modelo CUDA: no aplica a RTX 4090/A100/H100 en esta build; para GPU NVIDIA habría que usar el modelo fuente en BF16.
- Runtime: requiere oMLX ≥ 0,7.1. No probado con `mlx-lm` estándar ni LM Studio.
- Despliegue: servidor integrado de oMLX con APIs compatibles OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`).
- Rendimiento: ~70 tok/s de decodificación con MTP y ~1.200 tok/s de prefill en M3 Ultra; las cifras varían con la longitud de contexto y la predictibilidad de la salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp (este) | 9,65 B | oQ8e (8 bit) | 262k | Apache-2.0 | Apple Silicon (oMLX) |
| khazarai/Qwen3.5-9B-Kimi-k3-Distilled (fuente) | ~9,65 B | BF16 (~19 GB) | 262k | Apache-2.0 | CUDA/MLX genérico |
| hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp | 9,65 B | oQ6e (~8 GB) | 262k | Apache-2.0 | Apple Silicon (oMLX) |

Frente a la fuente BF16, esta build reduce el tamaño a la mitad (~10 GB frente a ~19 GB) con pérdida prácticamente nula (KL media de 0,00097 nat/token y perplejidad idéntica). Frente a la variante oQ6e, ofrece mayor fidelidad a cambio de ~2 GB más de memoria. No hay datos publicados que permitan compararlo en benchmarks con otros modelos de código de tamaño similar (por ejemplo Qwen2.5-Coder-7B o DeepSeek-Coder), por lo que esa comparación no está disponible.

## Limitaciones y advertencias

- No se han ejecutado suites de benchmarks estándar: la calidad solo está caracterizada como divergencia KL respecto al modelo fuente, no mediante evaluaciones externas (HumanEval, SWE-bench, etc.).
- La entrada de imágenes se conserva del modelo fuente pero no ha sido probada en esta build; no debe asumirse que la visión funcione correctamente.
- Requiere oMLX ≥ 0,7.1: no está verificado con `mlx-lm`, LM Studio ni otros runtimes MLX, lo que limita la compatibilidad con herramientas habituales del ecosistema Mac.
- Las mediciones de velocidad son de una sola ejecución y dependen de la longitud de contexto y la predictibilidad del contenido; las ganancias de MTP disminuyen con salidas menos predecibles.
- La especialización en código agéntico mediante destilación puede degradar el rendimiento en tareas generales (razonamiento no técnico, escritura creativa) respecto al Qwen3.5-9B original; no hay datos que cuantifiquen esa posible regresión.
- Sesgos y tasa de alucinación: no disponibles; al heredar de Qwen3.5 y de trayectorias de Kimi K3, puede reproducir sesgos de ambos. Como en todo modelo de código, las salidas deben revisarse antes de aplicarse en producción.
- Idiomas soportados no documentados explícitamente; la calibración de la cuantización incluyó inglés y turco, por lo que el rendimiento en castellano no está verificado.
- La licencia Apache-2.0 permite uso comercial sin restricciones relevantes, heredada del modelo upstream.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp
- Modelo fuente (fine-tune de khazarai): https://huggingface.co/khazarai/Qwen3.5-9B-Kimi-k3-Distilled
- Variante oQ6e del mismo autor: https://huggingface.co/hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp
- Dataset de destilación: https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Runtime oMLX: https://omlx.ai
