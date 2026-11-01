# luca0621/polyedit-qwen3-4b-property-v1

## Resumen

Polyedit Qwen3-4B property v1 es un ajuste fino (full-parameter SFT) del modelo Qwen3-4B de Qwen, desarrollado por el usuario luca0621 y publicado en HuggingFace en octubre de 2026. El modelo está especializado en un dominio muy concreto: la interpretación en coreano de requisitos de materiales poliméricos expresados en lenguaje natural, y su traducción a objetivos numéricos de propiedades parciales que se entregan a un generador externo denominado MMPAE.

A diferencia de un chatbot de química generalista, este checkpoint no predice valores físicos por sí mismo a partir de lenguaje vago: forma parte de un pipeline determinista (petición → interpretación de intención por LLM → recuperación de referencia conjunta → formateo numérico por LLM → verificación de grounding → MMPAE externo). El modelo cubre las etapas LLM del pipeline, no el generador de estructuras.

Su relevancia radica en demostrar cómo un modelo pequeño (4.022 millones de parámetros, 4.02B) puede alcanzar precisiones muy altas (93-100 % en las métricas del pipeline) en tareas verticales de dominio mediante SFT completo en FP32, con datos de instrucciones de autoría asistida y sin objetivos de RL. El idioma del modelo es el coreano (ko), lo que lo restringe a usuarios que trabajen con peticiones en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), con soporte de modo thinking desactivado en inferencia evaluada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se declara MoE; se asume densidad total entrenable) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento configurada: 3.072 tokens) |
| Tipos de cuantizacion | no disponible (evaluado en FP32; BF16 y cuantización mencionadas como no probadas) |
| Idiomas soportados | Coreano (ko) |
| Licencia | qwen-apache-with-polyone-reference-terms (licencia "other", con términos de referencia PolyOne) |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B (revisión `1cfa9a7208912126459214e8b04321603b3df60c`), un transformer decoder de 4.02B de parámetros. El ajuste se realizó sobre el 100 % de los parámetros (4.022.468.096 / 4.022.468.096), es decir, SFT de parámetro completo en FP32 sin LoRA ni cuantización del entrenamiento, usando matmul en TF32 y el optimizador Adafactor (factorizado, sin primer momento) con lr 5e-6, batch 1, acumulación 16, weight decay 0.01 y 2 épocas (semilla 20261022). El checkpoint publicado corresponde a la época 1, seleccionada por exactitud equilibrada de intención/numérica en validación; el test no se usó para selección de checkpoint.

Los datos de entrenamiento provienen del dataset `luca0621/polyedit-korean-property-instructions-v6`: 17.036 pares de tarea de entrenamiento (13.236 peticiones) y 1.838 pares de validación, con dos tareas: interpretación de intención y formateo numérico con contexto de referencia. Las instrucciones fueron compuestas por el asistente con ayuda de Python (no etiquetas de usuarios reales ni de un modelo profesor GPT-5.5 vía API). Se usó cross-entropy solo sobre los tokens del asistente, con pesos iguales por ejemplo y sin objetivo causal/RL. La longitud máxima real de entrenamiento fue de 2.213 tokens con tope configurado de 3.072, sin truncamiento silencioso. El entrenamiento se ejecutó en una A100 80 GB (pico de asignación 36 GiB) con transformers 4.57.6 y torch 2.7.1+cu126.

Como innovación destacable, el modelo se integra en un pipeline con verificación estricta de grounding: el script de inferencia rechaza exportar propiedades ante fallos de esquema, ambigüedad o ausencia de filas de referencia elegibles, y no aplica reparación de salida.

## Capacidades

- Interpretación de intención: dada una petición en coreano sobre requisitos de un polímero (por ejemplo, "necesito un material ligero con buena barrera al oxígeno para embalaje"), identifica qué propiedades se solicitan.
- Formateo numérico: con contexto de referencia, produce objetivos numéricos parciales de propiedades (hasta 29 propiedades soportadas) en un esquema estricto tipo `{"rho":{"value":1.2,"unit":"g/cm3"}}`.
- Aclaración de peticiones ambiguas: en el subconjunto PSMILES100 resolvió correctamente 5/5 casos de aclaración y 66/100 peticiones combinadas.
- Salida JSON estricta sin reparación: el pipeline se detiene si la salida no supera la verificación de grounding.
- Generación de texto conversacional en coreano heredada del modelo base Qwen3-4B (no es el objetivo del ajuste).
- No incluye pesos de MMPAE ni regresión independiente de valores físicos a partir de lenguaje vago.

No hay evidencia publicada de capacidades de tool calling, agentes, visión ni audio en este checkpoint.

## Casos de uso

- Interfaz en lenguaje natural para generación de polímeros: un químico describe en coreano los requisitos de un material ("ligero, buena barrera al oxígeno") y el modelo los convierte en objetivos de propiedades para el generador MMPAE.
- Asistente de selección de materiales de embalaje: peticiones como la del ejemplo del README (materiales ligeros con buena barrera de oxígeno) se traducen a propiedades objetivo como densidad o permeabilidad.
- Formateo determinista de especificaciones: en pipelines R&D, el modelo extrae y normaliza valores numéricos de peticiones informales, evitando errores de transcripción manual.
- Sistemas con verificación de grounding estricta: en producción farmacéutica o de materiales donde no se toleran alucinaciones numéricas, el rechazo explícito ante ambigüedad o referencias ausentes es una ventaja frente a LLM generalistas.
- Aclaración de peticiones ambiguas: el modelo puede solicitar aclaraciones cuando la petición no es suficientemente específica (5/5 en PSMILES100), útil en asistentes de laboratorio con diálogo multi-turno.
- Reproducción de estudios de alineamiento vertical: el repositorio incluye scripts (predict.py, polyedit/, references/, reproduction/) que permiten replicar el pipeline completo de evaluación como plantilla para otros dominios.
- Evaluación comparativa de SFT de parámetro completo frente a baselines forzadas a JSON: los resultados completos se publican en RESULTS_KO.md y ALL_EXPERIMENT_RESULTS_KO.html.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (exactitud sobre tareas del propio pipeline, no benchmarks estándar tipo MMLU):

| Evaluación | Resultado |
|---|---:|
| Property-only100, intención exacta | 93,0 % |
| Property-only100, numérica exacta | 97,0 % |
| Property-only100, pipeline completo exacto | 93,0 % |
| Test completo de redacción natural, 1.838 pares exactos | 94,02 % |
| Test completo, intención, 1.458 pares exactos | 92,46 % |
| Test completo, numérica, 380 pares exactos | 100,00 % |
| PSMILES100, este LLM + MMPAE, Success@20 | 61/95 = 64,21 % |
| PSMILES100, aclaraciones | 5/5 |
| PSMILES100, peticiones combinadas | 66/100 |

Advertencias del propio autor: la exactitud numérica mide reproducción de objetivos derivados de referencias, no precisión experimental de propiedades; el Success@20 de PSMILES usa un predictor de propiedades congelado, no mediciones de laboratorio. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones directas con otros LLM en la información disponible.

## Requisitos de hardware

- VRAM para inferencia tal como se evalúa (FP32): aproximadamente 16 GB solo de pesos (4,02B × 4 bytes), más overhead de activaciones y contexto; el repositorio completo pesa 17,7 GB.
- Configuración de referencia del autor: GPU CUDA (`--device cuda:0`); el entrenamiento usó una NVIDIA A100 80 GB con pico de 36 GiB.
- En una RTX 4090 (24 GB) debería caber en FP32 con contexto corto; en BF16 (~8 GB de pesos) cabe con holgura en GPUs de consumo de 12-16 GB, aunque el autor advierte que BF16 y cuantización no se usaron para los resultados reportados y podrían alterar el comportamiento.
- Inferencia recomendada mediante el script `predict.py` incluido en el repositorio (transformers, SDPA, `enable_thinking=False`, `do_sample=False`, `max_new_tokens=1024`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- No hay datos publicados de latencia o throughput.

## Comparativa con modelos similares

| Aspecto | Polyedit Qwen3-4B property v1 | Qwen3-4B (base) | LLM generalista de 4-8B típico |
|---|---|---|---|
| Parametros | 4,02B | 4,02B | 4-8B |
| Entrenamiento | SFT completo FP32 sobre 17.036 pares de dominio polimérico | Preentrenamiento masivo + post-entrenamiento de Qwen | Preentrenamiento + RLHF/DPO general |
| Dominio | Propiedades de polímeros en coreano (pipeline MMPAE) | General | General |
| Contexto entrenado | 3.072 tokens (tope configurado) | No disponible en la información proporcionada | No disponible |
| Benchmarks publicados | Métricas propias del pipeline (93-100 % exactitud) | Benchmarks estándar publicados por Qwen | Benchmarks estándar |
| Licencia | qwen-apache-with-polyone-reference-terms (con restricciones) | Apache-2.0 (según Qwen) | Variable |

No hay alternativas directamente comparables publicadas (modelos de interpretación de requisitos de polímeros en coreano acoplados a MMPAE), por lo que la comparativa se limita al modelo base y a categorías genéricas.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado para peticiones en coreano; no hay garantía de funcionamiento en otros idiomas.
- Los objetivos numéricos son estimaciones ML existentes de PolyOne derivadas de una fila de referencia conjunta, no valores experimentales ni causalidad física aprendida: la política q25/q75 es software explícito, no física aprendida.
- Soporta 29 propiedades, pero la generalización simultánea a las 29 es limitada; consultar las métricas por propiedad y por número de condiciones.
- Las instrucciones de entrenamiento fueron compuestas por el asistente con Python, no por expertos ni usuarios reales, lo que introduce sesgo de autoría.
- El subconjunto PSMILES100 y la selección de baselines forzadas a JSON tienen limitaciones de exposición previa y de diseño post-hoc; el autor no afirma superioridad general.
- El emparejamiento histórico del entrenamiento del scaler no está completamente probado; no hay portabilidad garantizada a checkpoints MMPAE arbitrarios y el repositorio no incluye pesos de terceros.
- Riesgo de alucinación: mitigado en el pipeline mediante rechazo estricto (sin reparación de salida), pero el modelo aislado no ofrece esa garantía.
- La inferencia evaluada es FP32 determinista (do_sample=False); usar muestreo, BF16 o cuantización puede degradar los resultados reportados.
- Licencia "other" (qwen-apache-with-polyone-reference-terms): no es Apache-2.0 pura; incluye términos de referencia a PolyOne. Revisar LICENSE.md antes de cualquier uso comercial.
- El gate de calidad interno ("publication-quality: true") no certifica rendimiento en el mundo real ni físico.
- Los defaults estocásticos del generation_config guardado son heredados del upstream; el script oficial los sobrescribe explícitamente y conviene hacer lo mismo en despliegues propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luca0621/polyedit-qwen3-4b-property-v1
- Licencia: https://huggingface.co/luca0621/polyedit-qwen3-4b-property-v1/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/luca0621/polyedit-korean-property-instructions-v6
- Resultados detallados: RESULTS_KO.md y ALL_EXPERIMENT_RESULTS_KO.html dentro del repositorio del modelo
