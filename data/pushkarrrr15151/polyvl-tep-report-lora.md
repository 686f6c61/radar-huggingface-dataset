# Pushkarrrr15151/PolyVL-tep-report-lora

## Resumen

PolyVL-tep-report-lora es un adaptador LoRA de PEFT sobre el modelo multimodal OpenGVLab/InternVL3-2B, desarrollado por el usuario Pushkarrrr15151 (Polyvalent Research Team) para generación de informes de análisis de causa raíz (RCA) en el benchmark industrial Tennessee Eastman Process (TEP). El adaptador transforma el modelo base en un especialista que recibe telemetría de proceso, ventanas de síntomas de fallo y perturbaciones de lazos de control, y produce informes estructurados de diagnóstico en formato JSON/Markdown.

El adaptador contiene 18.464.768 parámetros LoRA entrenables y se distribuye como un repositorio de 0,1 GB en safetensors, con licencia Apache-2.0. El checkpoint publicado corresponde al paso 447 (época 3.0) de un entrenamiento con rango r=16, alpha=32 y dropout 0,05 aplicado a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj.

Su relevancia es acotada y muy específica: no es un modelo generalista, sino un artefacto de investigación orientado a demostrar la viabilidad de adaptadores especializados de bajo coste para diagnóstico industrial. Al estar construido sobre InternVL3-2B, hereda la arquitectura y el contexto del modelo base, pero su rendimiento solo se ha validado en el conjunto de destilación v0 y en las 22 clases de fallo del TEP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal InternVL3-2B |
| Parámetros totales | 18.464.768 parámetros LoRA entrenables (el modelo base no se incluye en el repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base InternVL3-2B; no especificada en la model card) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, inyectado en las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y en las proyecciones del bloque MLP (gate_proj, up_proj, down_proj) del modelo base InternVL3-2B, fijado en la revisión 899155015275a9b7338c7f4677e19c784e0e5a21. El entrenamiento se realizó con precisión mixta bf16, schedule de learning rate coseno con pico 2e-4, warmup ratio 0,03 y batch efectivo de 16, durante 3 épocas (447 pasos).

Los datos de entrenamiento consisten en 2.376 ejemplos que cubren las 22 clases de fallo del benchmark TEP, destilados desde el modelo profesor qwen2.5:32b y publicados en el dataset Pushkarrrr15151/PolyVL-tep-report-distill. No se documenta en la model card el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional más allá del propio esquema de adaptación LoRA; el interés técnico reside en la especialización por destilación sobre un dominio industrial concreto.

## Capacidades

- Generación de informes estructurados de análisis de causa raíz (RCA) a partir de telemetría tabular de proceso, ventanas de síntomas de fallo y perturbaciones de lazos de control.
- Producción de salida en formato JSON/Markdown estructurado, con validación de sintaxis del 100 % según la model card.
- Verificación de variables de sensor contra la verdad del simulador, con una tasa de grounding del 100 % reportada en el conjunto de evaluación in-distribution.
- Respuesta a consultas de seguimiento de operadores de planta sobre saturación de válvulas, picos de presión, deriva de temperatura del reactor y riesgo de parada.
- Cobertura de las 22 clases de fallo del benchmark Tennessee Eastman Process.
- Al heredar InternVL3-2B, el modelo base es multimodal (visión-lenguaje), aunque la model card no documenta el uso de capacidades visuales en este adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Diagnóstico automatizado de fallos en plantas de proceso: el adaptador recibe la telemetría de un lazo de control y genera un informe RCA estructurado que identifica la causa probable entre las 22 clases del TEP, útil como primera línea de análisis para ingenieros de proceso.
- Asistencia a operadores de sala de control: responde consultas de seguimiento sobre saturación de válvulas, picos de presión o deriva térmica del reactor, aprovechando el contexto conversacional del modelo base.
- Generación de documentación post-incidente: produce informes en JSON/Markdown listos para archivarse en sistemas de gestión de mantenimiento, con campos estructurados verificables contra los sensores.
- Prototipado de sistemas de alerta temprana: integrado en un pipeline que alimenta ventanas de síntomas, el adaptador puede generar evaluaciones de riesgo de parada antes de que el operador actúe.
- Investigación en adaptadores especializados: sirve como ejemplo reproducible de destilación de conocimiento desde un modelo grande (qwen2.5:32b) a un adaptador LoRA de 18,4 M de parámetros sobre un modelo base pequeño.
- Evaluación de robustez de RCA industrial: permite comparar el comportamiento del adaptador frente a las 22 dinámicas de fallo del TEP en entornos de simulación controlados.
- Formación de ingenieros: los informes generados pueden usarse como material didáctico sobre patrones de fallo y su relación con variables de proceso.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Grounding rate (verificación de sensores) | 100 % | Conjunto de test in-distribution con cobertura completa de fallos |
| Sintaxis válida (JSON/Markdown) | 100 % | Conjunto de test in-distribution con cobertura completa de fallos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas reportadas corresponden exclusivamente al conjunto de destilación v0 y reflejan rendimiento in-distribution sobre las 22 dinámicas de fallo conocidas del TEP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador LoRA añade 18,4 M de parámetros, por lo que el requisito dominante es el del modelo base InternVL3-2B (aproximadamente 4-5 GB en bf16, estimación orientativa no confirmada en la model card).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, cabría esperar GPUs consumer de gama media-alta, pero no se confirma.
- ¿Cabe en GPU consumer?: probablemente sí, dado el tamaño del modelo base (2B), pero no se documenta en la model card.
- Opciones de despliegue: la model card solo documenta carga mediante transformers + peft (AutoModel + PeftModel). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-tep-report-lora | 18,4 M (LoRA) + InternVL3-2B | no disponible | RCA industrial TEP | Apache-2.0 | Hugging Face (0 descargas) |
| InternVL3-2B (base) | 2B | no disponible en esta ficha | Multimodal generalista | Apache-2.0 | Hugging Face (OpenGVLab) |
| qwen2.5:32b (profesor) | 32B | no disponible en esta ficha | Generalista | Apache-2.0 | Disponible |

No se dispone de información sobre otros adaptadores especializados en RCA industrial comparables en la documentación proporcionada. La comparativa con modelos de la misma categoría (adaptadores LoRA para diagnóstico de procesos) no está disponible.

## Limitaciones y advertencias

- El adaptador solo se ha evaluado en el conjunto de destilación v0 y en las 22 clases de fallo del TEP; el rendimiento fuera de distribución no está documentado.
- Las métricas del 100 % de grounding y sintaxis válida son in-distribution y no deben extrapolarse a datos reales de planta.
- El modelo está especializado en un simulador concreto (Tennessee Eastman Process); su transferencia a procesos industriales reales no está validada.
- Riesgo de alucinación en la generación de causas raíz no contempladas en las 22 clases de fallo del TEP.
- No se documentan sesgos conocidos, pero el entrenamiento por destilación desde qwen2.5:32b puede heredar sesgos del profesor.
- Idiomas soportados no documentados; la model card está en inglés y no se especifica el comportamiento multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con 0 descargas y 0 likes, sin validación externa.
- El adaptador requiere fijar la revisión exacta del modelo base (899155015275a9b7338c7f4677e19c784e0e5a21) para garantizar compatibilidad.
- No se documentan capacidades de tool calling, agentes ni multimodalidad efectiva en este adaptador, aunque el modelo base sea multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-tep-report-lora
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Dataset de destilación: https://huggingface.co/datasets/Pushkarrrr15151/PolyVL-tep-report-distill
- Paper citado (Polyvalent, 2026): no disponible como enlace en la información proporcionada.
