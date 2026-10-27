# SargeDev/Solar-Decision-JEV-27B-V2-NVFP4-FP8

## Resumen

Solar-Decision-JEV-27B-V2-NVFP4-FP8 es una versión cuantizada del modelo denso SargeDev/Solar-Decision-JEV-27B-V2, un modelo de 27.320.697.856 parámetros (≈27,3 B) especializado en la emisión de decisiones tipificadas ("typed decisions") y publicado por SargeDev. No es un modelo de propósito general afinado ligeramente: su linaje combina un backbone Qwen (etiquetado internamente como Qwen3.8-27B y abliterado por huihui-ai), la receta de LoRA de decisión r16/r32 y la cabeza de 24 slots de AutoTrust AI (autotrust/JEV-27B), y dos corpus propios de SargeDev con etiquetas de decisión calibradas. El resultado es un modelo "uncensored" orientado a clasificar y puntuar decisiones dentro de un conjunto cerrado de opciones, no a conversación abierta.

La relevancia de esta ficha concreta está en el empaquetado: el autor ha reducido el peso de 52 GiB en bf16 a unos 29 GiB mediante cuantización NVFP4 (W4A4) en las proyecciones de atención q/k/v/o y en gate/up del MLP, más FP8 dinámico en down_proj, dejando `lm_head`, `embed_tokens` y el bloque MTP en mayor precisión. El objetivo declarado es servir el modelo en hardware de clase GB10 (DGX Spark) con vLLM, manteniendo el comportamiento del bf16 a la mitad de huella. La calibración se hizo con 512 muestras que incluyen 384 prompts del flujo real de decisión JEV y 128 filas de UltraChat, con longitud máxima de 2048 tokens.

Conviene subrayar una advertencia que el propio autor incluye: esta build no se ha re-evaluado de forma independiente en la tabla de compuertas (gate table), por lo que las métricas publicadas corresponden al modelo bf16. La licencia es Apache-2.0 y la librería de referencia es llm-compressor 0.14.0 con formato compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, backbone Qwen (tag de librería `qwen3_5_text`; el autor cita "Qwen3.8-27B" abliterado por huihui-ai); incluye bloque MTP |
| Parametros totales | 27.320.697.856 (≈27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de despliegue del autor fija `--max-model-len 8192`) |
| Tipos de cuantizacion | NVFP4 W4A4 en q/k/v/o y MLP gate/up; FP8_DYNAMIC en `down_proj`; `lm_head`, `embed_tokens` y bloque MTP en mayor precisión; formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors cuantizados (compressed-tensors), generados con llm-compressor 0.14.0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de ~27,3 B parámetros construido sobre un backbone Qwen abliterado (sin mecanismos de rechazo) por huihui-ai. Sobre esa base, AutoTrust AI aporta su receta de LoRA de decisión en rangos r16/r32 y una cabeza de 24 slots que estructura la salida como decisión tipificada, junto con la maquinaria de evaluación asociada (gate table de 27.695 filas). El modelo incorpora además un bloque MTP (multi-token prediction), que el autor mantiene fuera de la cuantización agresiva, coherente con un uso de decodificación especulativa en inferencia.

En cuanto a datos, el autor cita dos corpus: `SargeDev/jev-distill-corpus-v3` (preguntas y estados) y `SargeDev/solar-decisions-corpus-v4` (etiquetas de decisión tipificadas y calibradas, generadas por `upstage/solar-decide-flash`), este último usado para la mitad "solar" del entrenamiento. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación técnica diferencial no está en la arquitectura sino en el pipeline de cuantización: calibración dirigida al workload real de decisión (384 de las 512 muestras) en lugar de un corpus genérico, con precisión mixta por tipo de proyección.

## Capacidades

- Generación de texto y conversational text-generation, según el `pipeline_tag` del repositorio.
- Emisión de decisiones tipificadas dentro de un conjunto cerrado de 24 slots, con puntuación asociada (score) y una señal de "noul" evaluada por AUROC en la gate table.
- Clasificación y triaje sobre estados/prompts de decisión del dominio JEV, el caso de uso para el que se calibró la cuantización.
- Modo "thinking" opcional en la plantilla de chat: el autor indica que debe pasarse `enable_thinking: false` o la plantilla emite la traza de razonamiento dentro de la respuesta.
- Bloque MTP (multi-token prediction) presente en los pesos, aprovechable para decodificación especulativa en vLLM.
- Modelo "uncensored"/abliterated: sin las capas de rechazo del backbone original.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el corpus citado es en inglés).
- Visión y audio: no disponibles; el repositorio es exclusivamente de texto.

## Casos de uso

- **Triaje automatizado de decisiones en producción**: el modelo recibe un estado o pregunta y devuelve una de las 24 categorías tipificadas con su score. Es el escenario para el que se calibró la cuantización (384 de 512 muestras de calibración son prompts de decisión JEV), por lo que la degradación por cuantización debería ser mínima en este flujo.
- **Enrutado determinista en pipelines de agentes**: usar la salida tipificada como señal de enrutado (qué herramienta, qué cola, qué política) en lugar de parsear texto libre, aprovechando la cabeza de 24 slots y la puntuación asociada para fijar umbrales de confianza.
- **Servicio en hardware de borde o de clase GB10**: con ~29 GiB de pesos, el modelo cabe en una DGX Spark o en una GPU de 40-48 GB, lo que permite desplegar el instrumento de decisión en la propia instalación en lugar de depender de una API externa.
- **Moderación y clasificación de contenido sin rechazos**: al estar abliterado, mantiene la capacidad de clasificar y etiquetar contenido sensible que un modelo alineado rechazaría; útil en pipelines internos de auditoría o etiquetado de datos.
- **Generación de etiquetas de decisión a escala**: dado su origen como destilación de `upstage/solar-decide-flash`, puede emplearse para producir etiquetas tipificadas sobre nuevos estados y ampliar corpus de entrenamiento, siempre que se valide contra la gate table.
- **Evaluación A/B de estrategias de decisión**: la salida estructurada (elección + score) permite comparar políticas o prompts midiendo acuerdo con una referencia, sin necesidad de un juez LLM adicional.
- **Prototipado rápido con vLLM**: el comando de servicio del autor (`--quantization compressed-tensors --trust-remote-code`) permite levantar el endpoint en minutos con una única GPU, lo que facilita pruebas de integración antes de pasar al bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas internas de la gate table de 27.695 filas, correspondientes al modelo bf16 y no re-evaluadas para esta build cuantizada:

| Metrica (gate table, modelo bf16) | Resultado |
|---|---|
| Choice top-1 | 0,828 |
| Score top-1 | 0,742 |
| Noul AUROC | 0,983 |
| Overall | 0,839 |
| Overall de r32-alone (referencia) | 0,869 |

El propio autor advierte que el resultado global (0,839) está por debajo de r32-alone (0,869) y que, para un instrumento de decisión tipificada a máxima fidelidad, debe usarse el repositorio bf16.

## Requisitos de hardware

- **VRAM estimada**: ~29 GiB de pesos en esta build NVFP4/FP8 (frente a 52 GiB en bf16), más overhead de KV cache y activaciones. Con `--max-model-len 8192` conviene reservar 32-40 GB efectivos.
- **GPU recomendadas**: NVIDIA GB10 (DGX Spark, memoria unificada) es el objetivo declarado por el autor; también encaja en A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o H100 80 GB. El modelo bf16 requiere ~52 GiB, es decir, A100/H100 de 80 GB.
- **Consumer GPU**: no cabe en GPUs de 24 GB (RTX 4090, 3090) con esta build; sí en tarjetas de 32 GB o más, aunque con margen ajustado para contexto largo. Por debajo de eso sería necesario un GGUF adicional, que no se ofrece en este repositorio.
- **Despliegue**: vLLM con `--quantization compressed-tensors --trust-remote-code`, tal como indica el autor. El formato compressed-tensors también es compatible con TGI y con el stack de llm-compressor; llama.cpp/Ollama no soportan NVFP4 en este formato, por lo que no son una vía directa.
- **Latencia y throughput**: no disponibles. El bloque MTP sugiere soporte de decodificación especulativa, pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V2-NVFP4-FP8 (esta ficha) | 27,3 B | No disponible | NVFP4 + FP8 | Apache-2.0 | ~29 GiB, calibrado al workload de decisión, sin re-evaluar en gate table |
| SargeDev/Solar-Decision-JEV-27B-V2 (bf16) | 27,3 B | No disponible | bf16 | Apache-2.0 | 52 GiB, métricas de referencia (overall 0,839), recomendado para máxima fidelidad |
| autotrust/JEV-27B | No disponible | No disponible | No disponible | No disponible | Origen de la receta LoRA r16/r32 y de la cabeza de 24 slots |
| Backbone Qwen abliterado (huihui-ai) | ~27 B | No disponible | bf16 y otras | No disponible | Base sin la cabeza de decisión; propósito general |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoría (modelos de decisión tipificada de ~27 B).

## Limitaciones y advertencias

- **Fidelidad no re-validada**: el autor confirma explícitamente que esta build cuantizada no se ha vuelto a evaluar con la gate table. Las métricas publicadas son del bf16 y deben interpretarse como techo, no como rendimiento medido de esta versión.
- **Por debajo de r32-alone**: incluso en bf16, el overall (0,839) es inferior al de la variante r32 sin fusionar (0,869); el modelo es un compromiso, no el estado del arte de su propia familia.
- **Riesgo de alucinación**: es un modelo de generación de texto con cabeza de clasificación; fuera del dominio de decisión JEV puede producir texto plausible sin grounding. No se documentan evaluaciones de factualidad.
- **Modo thinking intrusivo**: si no se pasa `enable_thinking: false` en la plantilla de chat, la traza de razonamiento se filtra en la respuesta, lo que rompe cualquier parser que espere solo la decisión.
- **Modelo abliterado**: la ausencia de capas de rechazo implica que puede generar contenido dañino o sensible sin filtro; requiere moderación externa si se expone a usuarios finales.
- **Idiomas no documentados**: no hay lista de idiomas soportados ni evaluación multilingüe; los corpus citados son en inglés, por lo que el rendimiento en castellano es desconocido.
- **Contexto no documentado**: la longitud nativa no se publica; el ejemplo de servicio la limita a 8192 tokens, y no hay datos sobre degradación más allá de esa cifra.
- **Licencia**: Apache-2.0 permite uso comercial, pero las licencias del backbone Qwen original y de los componentes de AutoTrust AI deberían verificarse por separado antes de un despliegue en producción.
- **Soporte de herramienta limitado**: NVFP4 en compressed-tensors restringe las opciones de serving a vLLM/TGI; no hay GGUF para llama.cpp u Ollama, lo que complica el despliegue en entornos sin GPU NVIDIA moderna.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- [HuggingFace: SargeDev/Solar-Decision-JEV-27B-V2-NVFP4-FP8](https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2-NVFP4-FP8)
- [Modelo base: SargeDev/Solar-Decision-JEV-27B-V2](https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2)
- [Dataset: SargeDev/jev-distill-corpus-v3](https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3)
- [Dataset: SargeDev/solar-decisions-corpus-v4](https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4)
- [AutoTrust AI: autotrust/JEV-27B](https://huggingface.co/autotrust/JEV-27B)
- [llm-compressor (vLLM project)](https://github.com/vllm-project/llm-compressor)
