# MatterWaveAI/open-s1-grt-30m

## Resumen

Open-S1-GRT-30M es un modelo de clasificación de texto y puntuación de decisiones de agente desarrollado por MatterWaveAI sobre la arquitectura propietaria Geometric Rotation Transformer (GRT). Con 29.844.597 parámetros, se presenta como un "System-1 Calibrated Agent Reflex & Decision Scorer": en lugar de invocar un LLM autorregresivo grande para decisiones rutinarias de control de bucle de agente, este modelo puntúa opciones discretas en un único forward pass sobre una variedad toroidal $(S^1)^{128}$, con probabilidades calibradas por temperatura y pooling de fase circular por subpalabra.

El modelo se construye sobre el backbone `MatterWaveAI/grt-30m` (12 bloques, `d_model = 256`, ventana de contexto de 2.048 tokens, vocabulario BPE de Qwen 3 de 151.669 entradas) y añade cabeceras de decisión especializadas (`s1_heads.safetensors`) para cinco familias de preguntas: enrutamiento de acciones, escalado a modelo frontera, detección de bucles improductivos, verificación de soporte de especificación y puerta de verificación de código. La propuesta es relevante porque aborda un coste real en sistemas de agentes: la latencia y el gasto de llamar a un modelo grande para decisiones binarias o de pocas opciones que un clasificador de 30M puede resolver.

La arquitectura destaca por eliminar por completo las capas `nn.Linear` (zero-`nn.Linear`) y por un entrenamiento con optimizadores geométricos (Huygens, symplectic, cyclide, gyric, entre otros) que el autor documenta en detalle. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), transformer sin capas `nn.Linear`, con cabeceras de decisión sobre variedad toroidal $(S^1)^{128}$ |
| Parametros totales | 29.844.597 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone GRT consta de 12 bloques con `d_model = 256` y un vocabulario BPE de Qwen 3 de 151.669 entradas. La innovación principal es la eliminación de capas lineales densas: las representaciones se proyectan sobre un toro de 128 dimensiones $(S^1)^{128}$, y el pooling de fase circular por subpalabra garantiza invariancia al orden de las opciones (sesgo de posición `0.000` según el autor). Sobre este backbone se entrenan cinco cabeceras de clasificación (`s1_heads.safetensors`, 3.077 parámetros) con temperaturas de calibración específicas por familia: `action_router` (1.12), `escalation` (1.08), `loop_guard` (1.05), `spec_support` (1.15) y `verification_gate` (1.06).

El entrenamiento descrito calibra conjuntamente las cabeceras y el último bloque rotacional (`blocks[-1]` + `final_norm`, 811.779 parámetros) con ocho optimizadores geométricos clásicos sobre hardware AMD (Ryzen AI Max+ 395, Radeon 8060S, ROCm gfx1151). El autor reporta una ablación completa que va desde `pair_adam` (loss 1.6463, accuracy macro 50,17%) hasta la currícula de dos etapas `huygens_symplectic_adam` (loss 0.2232, accuracy macro 95,83%). También se menciona entrenamiento con SYCL fusionado en Intel Arc XPU (101,19 s frente a 433,86 s en CPU, 4,29x). No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Clasificación y puntuación de decisiones discretas de agente en un único forward pass, con probabilidades calibradas por temperatura.
- Enrutamiento de la siguiente acción del agente entre hasta 8 opciones: tool, edit, test, search, ask, finish.
- Triaje de escalado: decidir si una consulta se resuelve localmente (`simple`) o se deriva a un modelo frontera (`complex`).
- Detección de bucles improductivos de herramientas (`continue`, `intervene`, `abort`).
- Verificación de soporte de especificación: comprobar si una afirmación o diff está implicado por la especificación de la tarea (`supported`, `unsupported`, `ambiguous`).
- Puerta de verificación de código: decidir si los cambios están listos para commit o requieren tests o reparación (`pass`, `run_tests`, `repair`).
- Invariancia al orden de opciones (position bias `0.000` en la prueba paired-shuffle).
- No soporta generación de texto libre, tool calling generativo, visión, audio ni razonamiento multi-step autorregresivo; es un scorer/clasificador, no un LLM generativo.

## Casos de uso

- Enrutamiento de acciones en agentes de código: dado el estado del bucle (historial de herramientas, salida de tests, diff pendiente), el modelo puntúa en un forward pass si el siguiente paso debe ser editar, ejecutar tests, buscar o finalizar, reduciendo la latencia frente a consultar un modelo grande en cada iteración.
- Triaje de consultas en producción: clasificar cada petición entrante como `simple` o `complex` para enviar solo las complejas a un modelo frontera, con un coste de inferencia de ~30M parámetros por decisión.
- Guardia anti-bucle en pipelines de agentes: monitorizar secuencias de llamadas a herramientas y emitir `intervene` o `abort` cuando se detecta un patrón improductivo, evitando gasto de tokens y tiempo en bucles infinitos.
- Verificación de cambios antes de commit: integrar el modelo como puerta en CI/CD que clasifica si un diff está soportado por la especificación de la tarea y si requiere ejecutar tests o reparación.
- Control de calidad de respuestas de agentes: usar `spec_support` para detectar afirmaciones no respaldadas por la especificación antes de mostrarlas al usuario o de persistirlas en un sistema.
- Investigación en optimización geométrica: el modelo y su suite de ablaciones sirven como banco de pruebas reproducible para comparar optimizadores sobre variedades (Huygens, symplectic, cyclide) en hardware AMD e Intel.
- Despliegue en entornos con recursos limitados: al ocupar ~0,1 GB en safetensors, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación de alta frecuencia.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Benchmark / puerta | Métrica | open-s1-grt-30m | Legacy nano (8,7M) | Azar |
|---|---|---:|---:|---:|
| Paired-Shuffle Position Guard | Consistencia de contenido | 1.000 | 0.812 | — |
| Paired-Shuffle Position Bias | Sensibilidad al orden | 0.000 | 0.188 | 0.000 |
| Held-Out KG Transfer (MC_SHUFFLE_V2, 100 tareas) | Accuracy 4-way (zero-shot → HuygensSymplecticAdam) | 42,0% / 39,0% → 92,0% | 18,0% | 25,0% |
| Intel Arc XPU Fused SYCL Training | Tiempo (vs CPU) | 101,19 s (4,29x) | — | 433,86 s (CPU) |

Ablación de optimizadores (último bloque + cabeceras):

| Optimizador | Val loss (KL + Brier) | Macro acc 5 familias | Transfer MC_SHUFFLE_V2 | ECE |
|---|---:|---:|---:|---:|
| Sin calibrar | 2,0335 | 30,58% | 27,00% | 0,1295 |
| `pair_adam` | 1,6463 | 50,17% | 45,00% | 0,0377 |
| `hessian_pair_adam` | 1,2627 | 65,75% | 47,00% | 0,0412 |
| `polar_natural_adam` | 0,9785 | 72,58% | 53,00% | 0,0277 |
| `cyclide_adam` | 0,7321 | 80,67% | 61,00% | 0,0264 |
| `gyric_adam` | 0,5787 | 85,25% | 66,00% | 0,0245 |
| `huygens_adam` | 0,4252 | 90,50% | 71,00% | 0,0128 |
| `symplectic_adam` | 0,2783 | 93,33% | 81,00% | 0,0095 |
| `huygens_symplectic_adam` | 0,2232 | 95,83% | 92,00% | 0,0157 |

Accuracy por familia con `huygens_symplectic_adam`: `action_router` 87,50%, `escalation` 98,33%, `loop_guard` 96,67%, `spec_support` 98,33%, `verification_gate` 98,33%. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,1 GB en safetensors en precisión nativa; menos de 1 GB en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor documenta entrenamiento en AMD Radeon 8060S (ROCm gfx1151) e Intel Arc XPU (SYCL). Para inferencia, cabe en RTX 3060, RTX 4090, A100, H100 y GPUs integradas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y también en CPU.
- Opciones de despliegue: transformers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma específica para inferencia; el autor reporta 101,19 s para una rutina de entrenamiento SYCL frente a 433,86 s en CPU (4,29x).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (scorers de decisión de agente de ~30M parámetros) en la documentación proporcionada. El único comparable interno citado es el "Legacy nano" de 8,7M parámetros, que obtiene 0,812 de consistencia de posición, 0,188 de sesgo de orden y 18,0% en transferencia MC_SHUFFLE_V2, frente a 1.000, 0.000 y 42,0% de open-s1-grt-30m.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| open-s1-grt-30m | 29,84M | 2.048 | Apache 2.0 | Hugging Face |
| Legacy nano (interno) | 8,7M | no disponible | no disponible | no disponible |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo solo en inglés; no se declara soporte multilingüe.
- Ventana de contexto de 2.048 tokens, insuficiente para historiales de agente largos o especificaciones extensas.
- Es un clasificador/scorer de opciones discretas, no un generador: no puede producir texto libre, código ni razonamiento autorregresivo.
- El autor reporta ECE de 0,0157 con la mejor configuración, superior al 0,0095 de `symplectic_adam`; la calibración no es perfecta y varía según la familia.
- Los benchmarks presentados son internos del autor (MC_SHUFFLE_V2, paired-shuffle) y no están validados de forma independiente; no hay resultados en benchmarks estándar de la comunidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en entradas fuera de distribución; el autor no documenta sesgos demográficos ni de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las cabeceras dependen de la implementación propietaria GRT; verificar la compatibilidad de la librería antes de integrar.
- No se documentan tipos de cuantización ni formatos GGUF, lo que puede complicar el despliegue en runtimes no basados en transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/open-s1-grt-30m
- Modelo base GRT-30M: https://huggingface.co/MatterWaveAI/grt-30m
- Chat fine-tune: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Mixture-of-Rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- TTS sobre GRT-30M: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Ficha en LLM Explorer: https://llm-explorer.com/model/MatterWaveAI%2Fgrt-30m,4RmDa6OqNm590JQkVYChgn
