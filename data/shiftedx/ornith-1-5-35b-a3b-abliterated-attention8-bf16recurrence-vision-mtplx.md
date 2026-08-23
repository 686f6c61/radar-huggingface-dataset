# Shiftedx/ornith-1.5-35b-a3b-abliterated-attention8-bf16recurrence-vision-mtplx

## Resumen

Este repositorio contiene una cuantización experimental en formato MLX del modelo Ornith-1.5-35B-A3B, desarrollada por Shiftedx para Apple Silicon. El modelo base, creado por Ornith AI, es un modelo de lenguaje multimodal con arquitectura híbrida MoE (mixture-of-experts) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, con soporte de visión. La variante aquí presentada añade una edición de "abliteración" (eliminación de la dirección de rechazo) y un sidecar MTP (multi-token prediction) para decodificación especulativa, además de una torre de visión en BF16 y módulos de recurrencia en BF16.

La relevancia de este modelo radica en su adaptación específica para Apple Silicon, aprovechando el framework MLX para lograr una inferencia eficiente en hardware de escritorio de Apple. El repositorio no es un checkpoint estándar de Transformers ni GGUF, sino un formato propietario de MLX con cuantización híbrida de 4 y 8 bits, diseñado para ejecutarse con MLX-VLM y el runtime MTPLX. La abliteración, aunque experimental, permite un comportamiento sin rechazo de peticiones, lo que puede resultar útil para aplicaciones que requieren una generación sin censura, pero con la advertencia de que puede cambiar las capacidades de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid MoE, 40 capas, 256 expertos, ~3B activos por token |
| Parametros totales | 35B (modelo base), 7.773.171.568 en checkpoint cuantizado (safetensors) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (grupo 32) para el cuerpo, 8-bit (grupo 64) para atención, embeddings, LM head y gating; BF16 para recurrencia, visión y MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (no compatible con Transformers o GGUF) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-35B-A3B, es una arquitectura híbrida que combina una MoE densa con componentes recurrentes (A/B state inputs) y una torre de visión. Tiene 40 capas, 256 expertos y activa aproximadamente 3.000 millones de parámetros por token. El entrenamiento del modelo base se describe en el paper "Ornith-1.5: From Self-Scaffolding to Self-Improvement", que extiende el framework de self-scaffolding de Ornith-1.0 a un bucle completo de auto-mejora: el modelo propone tareas, genera scaffolds y produce rollouts de soluciones. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o técnicas de RLHF/DPO en la información proporcionada.

La cuantización de Shiftedx aplica una precisión mixta: 4-bit con grupo 32 para el cuerpo del modelo, 8-bit con grupo 64 para los módulos sensibles (atención, embeddings, LM head, routing), y BF16 para los estados recurrentes y la torre de visión. La abliteración se realizó mediante ortogonalización del vector de dirección de rechazo, con fuerza 1.5, aplicada a la salida de atención y proyecciones down de los expertos (120 módulos editados). El sidecar MTP (785 tensores) se mantiene en BF16 para la decodificación especulativa, que logra una aceleración de 1.49× en profundidad 1 según pruebas locales.

## Capacidades

- Generación de texto multimodal: acepta imágenes (PNG, JPEG, WebP) y texto, devolviendo descripciones, OCR o respuestas basadas en el contenido visual.
- Razonamiento y modo "thinking": el runtime MTPLX incluye un modo de razonamiento con parser Qwen3, permitiendo cadenas de pensamiento.
- Tool calling nativo: soporta el modo `--tool-prompt-mode native`, lo que permite al modelo invocar funciones externas.
- Soporte de agentes: compatible con el proveedor de agentes Hermes, habilitando flujos de agente multi-paso.
- Decodificación especulativa: el sidecar MTP permite la predicción de múltiples tokens (hasta profundidad 3), acelerando la inferencia en Apple Silicon.
- Capacidades multilingües: no se especifican idiomas concretos, pero el modelo base es de propósito general.

## Casos de uso

- **Atención al cliente automatizada en Mac**: el modelo puede gestionar conversaciones multi-turno con contexto largo y herramientas de integración, ejecutándose localmente en Apple Silicon con MLX.
- **Generación de código en entornos de desarrollo**: con soporte de tool calling, se puede integrar en editores o pipelines de CI/CD para sugerir código, completar funciones o refactorizar.
- **Análisis de imágenes con OCR**: la torre de visión en BF16 permite extraer texto de imágenes (OCR), como se verifica con el smoke test que devuelve "HUNTER".
- **Prototipado rápido de asistentes personales**: gracias al modo de razonamiento y la decodificación especulativa, se puede crear un asistente de voz o texto en un Mac sin depender de servicios cloud.
- **Agentes autónomos para tareas de investigación**: la compatibilidad con Hermes Agent y el tool prompt native facilitan la construcción de agentes que buscan información, ejecutan scripts y resumen resultados.
- **Despliegue de servicios OpenAI-compatibles**: el runtime MTPL expone una API compatible con OpenAI, permitiendo sustituir endpoints de pago en entornos de prueba o desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El repositorio solo incluye una medición local de rendimiento de decodificación en un Apple M4 Max con 64 GiB de memoria unificada, usando el suite `cold-long-code-192` de MTPLX (256 tokens generados, seed 42):

| Modo | Tokens/s | Aceleración vs AR | Aceptación por profundidad |
|---|---:|---:|---|
| AR (autoregresivo) | 70.316 | 1.000× | — |
| MTP D1 | 104.755 | 1.490× | 93.18% |
| MTP D2 | 89.022 | 1.266× | 97.52%, 14.17% |
| MTP D3 | 74.603 | 1.061× | 95.87%, 14.05%, 0.83% |

Estos son resultados locales de runtime, no comparaciones con otros modelos.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1/M2/M3/M4). No es compatible con GPU NVIDIA o AMD.
- **Memoria**: el repositorio ocupa 28.1 GB, por lo que se recomienda al menos 32 GB de memoria unificada. La prueba se realizó en un M4 Max con 64 GiB.
- **GPU recomendada**: cualquier chip de la serie M con suficiente memoria unificada; el M4 Max da buenos resultados.
- **Opciones de despliegue**: MLX-VLM para generación estándar y MTPLX para servidor OpenAI-compatible con decodificación especulativa y soporte de agentes.
- **Latencia**: con el modo MTP D1 se alcanzan ~105 tokens/s en el hardware de prueba, lo que es adecuado para aplicaciones interactivas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (original) | 35B | ~3B | no disponible | MIT | Transformers | Hugging Face |
| Ornith-1.5-35B-A3B (este repo) | 35B | ~3B | no disponible | MIT | MLX (cuantizado) | Hugging Face |
| Qwen3-30B-A3B | 30B | 3B | 128k (aprox.) | Apache-2.0 | Transformers, GGUF | Hugging Face |
| DeepSeek-V2.5-Lite | 16B | 2.4B | 128k | MIT | Transformers | Hugging Face |

No se dispone de datos de rendimiento comparativo con estos modelos, ya que no se han publicado resultados de benchmarks estándar en la información proporcionada.

## Limitaciones y advertencias

- **Experimental**: la abliteración es un ajuste de comportamiento que puede alterar capacidades o seguridad fuera del conjunto de pruebas evaluado.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información inexacta o inventada, especialmente en temas de baja frecuencia.
- **Contexto máximo no verificado**: la variante abliterada no ha sido probada en la longitud máxima de contexto, por lo que se desconoce su comportamiento en ventanas largas.
- **Dependencia de runtime**: el uso con MTPLX requiere el flag `--unsafe-force-unverified` porque el runtime aún no ha sido clasificado como estable, aunque la verificación local de tensores es correcta.
- **Licencia y uso comercial**: la licencia MIT permite uso comercial, pero la edición abliterada puede violar políticas de plataformas o requisitos de seguridad. El usuario es responsable de los controles de despliegue.
- **No es un modelo estándar**: no es compatible con Transformers, vLLM o llama.cpp, solo con MLX/MTPLX en Apple Silicon.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Shiftedx/ornith-1.5-35b-a3b-abliterated-attention8-bf16recurrence-vision-mtplx)
- [Colección de quants Ornith 1.5 35B para Apple Silicon](https://huggingface.co/collections/Shiftedx/ornith-15-35b-a3b-apple-silicon-mlx-mtplx-quants)
- [Página del modelo Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Sitio oficial de Ornith AI](https://ornith.ai/)
- [Paper: Ornith-1.5 - From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
