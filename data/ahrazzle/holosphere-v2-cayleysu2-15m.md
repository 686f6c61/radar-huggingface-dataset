# ahrazzle/holosphere-v2-cayleysu2-15m

## Resumen

HoloSphere-V2-CayleySU2-15M es un modelo de lenguaje de 14,98 millones de parámetros (14,90 M sin contar los embeddings) desarrollado por el usuario ahrazzle bajo el paraguas del proyecto Moissanite-Labs. Se trata de un modelo byte-level entrenado desde cero sobre un corpus UTF-8 offline y que implementa una arquitectura experimental denominada "hypersphere language model": en lugar de la atención estándar con RoPE, utiliza una holonomía de trayectoria ordenada sobre el grupo SU(2), isomorfo a la 3-esfera S^3, parametrizada mediante el mapa de Cayley racional puro. El objetivo declarado es eliminar las llamadas trascendentales (sin/cos) del cómputo de atención y demostrar mejor extrapolación de contexto frente a baselines con RoPE-2D.

El modelo es relevante como artefacto de investigación más que como herramienta de producción: valida empíricamente una hipótesis de arquitectura (denominada H14b) con pre-registro, tres semillas y telemetría energética controlada sobre una única GPU de consumo (RTX 3080 Laptop, sm_86). Los resultados publicados muestran una mejora de entre el 10 % y el 20 % en bits por byte (BPB) frente a baselines nGPT y RoPE-2D estándar en extrapolación de contexto 4× (T=2048 con entrenamiento a T=512), con un coste energético por token inferior.

No obstante, su escala (15 M de parámetros), su corpus de entrenamiento (2,57 MB de bytes) y su naturaleza exploratoria lo sitúan fuera de cualquier caso de uso comercial real. Es un modelo para estudiar, reproducir y comparar arquitecturas, no para desplegar en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer byte-level con holonomía SU(2)≅S^3 de trayectoria ordenada, mapa de Cayley racional puro (sin llamadas sin/cos) |
| Parametros totales | 14,98 M (14,90 M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado a T=512; evaluado en extrapolación a T=2048 (4×) |
| Tipos de cuantizacion | no disponible (checkpoint FP32, 158 tensores) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`holosphere_v2_15m_best.pt`, 59.967.263 B, FP32) |

## Arquitectura y entrenamiento

La arquitectura sustituye el mecanismo de atención posicional convencional por un escaneo de prefijo basado en holonomía SU(2). Cada token produce un cuaternión unitario δu_t calculado mediante el mapa de Cayley δu_t = (1 − ‖ω_t‖², 2ω_t) / (1 + ‖ω_t‖²), que pertenece a S^3 sin requerir funciones trigonométricas. El modelo es byte-level (procesa bytes UTF-8 directamente, sin tokenizador) y se denomina "Unlooped" para distinguirlo de variantes con bucle o con predicción multi-token (MTP8). El código y las pruebas formales están publicados en el repositorio Moissanite-Labs/holosphere, con 36 invariantes algebraicos verificados en Lean 4.36.0 sobre cuaterniones enteros y kernels CUDA/PTX para Ampere sm_86 sin spill a memoria local (0 instrucciones `ld/st.local` en PTX, 0 `LDL`/`STL` en SASS).

El entrenamiento se realizó desde inicialización aleatoria sobre un corpus offline multi-dominio de 2.570.357 bytes UTF-8 (SHA-256 505a4b67…), con un conjunto de evaluación disjunto por SHA compuesto por wikitext2_test (1.290.546 B), python_code (250.282 B) y json_traces (121.766 B). El checkpoint publicado corresponde a la semilla 42 y se seleccionó por mejor BPB en extrapolación. Los experimentos se ejecutaron en una RTX 3080 Laptop (8 GiB, sm_86, driver 615.78.08) con telemetría energética y pre-registro PREREG-S114 (SHA-256 5fa927a0…). No se menciona uso de RLHF, DPO ni ajuste por instrucciones; es un modelo de pre-entrenamiento puro.

## Capacidades

- Generación de texto a nivel de byte en inglés, sin tokenizador intermedio.
- Modelado de lenguaje autoregresivo con ventana de entrenamiento de 512 tokens y extrapolación evaluada hasta 2048.
- Manejo de contenido multi-dominio limitado: texto tipo wikitext, código Python y trazas JSON, según la composición del corpus.
- Reproducción determinista: el checkpoint cargado en `HoloSphereTransformer` coincide con el harness de entrenamiento a `max_abs_logit_diff = 6.676e-6` y 100 % de coincidencia top-1.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: únicamente inglés; el resto de idiomas no está cubierto por el entrenamiento.

## Casos de uso

- Investigación en arquitecturas de atención: sirve como referencia reproducible para estudiar holonomías SU(2) como alternativa a RoPE, con código, pruebas Lean y kernels CUDA publicados.
- Benchmarking de extrapolación de contexto: permite medir BPB a T=2048 partiendo de entrenamiento a T=512 y comparar contra baselines nGPT o RoPE-2D en igualdad de pasos y wall-clock.
- Estudio de eficiencia energética en inferencia: los datos publicados (0,5737 mJ/token bruto a T=512, 0,6927 mJ/token a T=2048) permiten reproducir comparativas de coste por token en GPU de consumo.
- Validación de kernels CUDA sin spill: los kernels sm_86 del repositorio silikernels#3 sirven para probar técnicas de reducción de presión de registros en GPUs Ampere de gama media.
- Docencia y divulgación: modelo lo bastante pequeño (60 MB en FP32) para ejecutarse en CPU y explicar conceptos de geometría diferencial aplicada a attention sin infraestructura pesada.
- Pruebas de pipeline de carga y verificación de integridad: el SHA-256 del checkpoint y la coincidencia logit a logit con el harness permiten usarlo como caso de test en sistemas de verificación de artefactos.

## Benchmarks y rendimiento

Resultados publicados en la model card (BPB, menor es mejor; igualdad de wall-clock, 887–888 pasos):

| Modelo | T=512 BPB | T=2048 BPB (4× OOD) | vs RoPE-2D-nGPT (T=2048) | mJ/token bruto T=512 / T=2048 |
|---|---|---|---|---|
| HoloSphere-V2-CayleySU2 (media 3 semillas) | 2,6203 | 2,6098 | −11,31 % (t=−15,43; p=0,00418) | 0,5733 / 0,6789 |
| HoloSphere-V2-CayleySU2 (semilla 42, este checkpoint) | 2,6295 | 2,5697 | −20,16 % vs RoPE-2D-Std (3 semillas) | 0,5737 / 0,6927 |
| HoloSphere-V2-SU2-Unlooped (primario pre-registrado) | 2,6545 | 2,6484 | −10,00 % (t=−36,22; p=0,00076) | 0,5478 / 0,6701 |
| HoloSphere-V2-Stage1a-Cayley2x2 | 2,6495 | 2,6245 | −10,81 % (t=−25,38; p=0,00155) | 0,5714 / 0,6897 |
| HoloSphere-V2-Full-Entity | 2,7282 | 2,6963 | −8,38 % (t=−16,42; p=0,00369) | 0,9384 / 1,0936 |
| RoPE-2D-nGPT (baseline) | 2,7525 | 2,9428 | 0,00 % (ancla) | 0,7178 / 0,8056 |
| RoPE-2D-nGPT+MarkovMTP8 (control) | 2,7388 | 2,9623 | +0,66 % | 0,7413 / 0,8448 |
| RoPE-2D-Std (baseline pre-norm) | 2,5846 | 3,2687 | +11,08 % (blowup 4×) | 0,4755 / 0,6102 |

En igualdad de pasos (600), CayleySU2 alcanza 2,7328 BPB a T=2048 (−7,14 % vs nGPT; t=−21,59; p=0,00214) y 2,7544 BPB a T=512. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks de conocimiento o razonamiento; el modelo no está evaluado en esas tareas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (checkpoint de 60 MB más activaciones para contexto corto); cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU CUDA con compute capability ≥ 7.0; los kernels optimizados están escritos específicamente para Ampere sm_86 (RTX 30xx, A10, A40). Los experimentos de referencia se ejecutaron en una RTX 3080 Laptop de 8 GiB.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/3070/3080/4060/4070/4080/4090 y equivalentes; también funciona en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch>=2.3`) y el paquete `holosphere` instalado desde GitHub. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es no estándar y no está integrada en esos runtimes.
- Latencia y throughput: no se publican métricas de tokens por segundo; solo consumo energético por token (0,5737 mJ/token bruto a T=512, 0,6927 mJ/token a T=2048 en RTX 3080 Laptop).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPB T=2048 (4× OOD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoloSphere-V2-CayleySU2-15M | 14,98 M | 512 (extrapola a 2048) | 2,6098 (media 3 semillas) | Apache 2.0 | Hugging Face + GitHub |
| HoloSphere-V2-SU2-Unlooped | ~14,9 M | 512 (extrapola a 2048) | 2,6484 | Apache 2.0 | Hugging Face (repo del autor) |
| RoPE-2D-nGPT (baseline del autor) | ~14,9 M | 512 | 2,9428 | no disponible en esta ficha | Reproducible desde el repo holosphere |
| RoPE-2D-Std (baseline del autor) | ~14,9 M | 512 | 3,2687 | no disponible en esta ficha | Reproducible desde el repo holosphere |

No se dispone de comparación con modelos byte-level de terceros (por ejemplo, variantes de ByT5 o CANINE) en la información proporcionada; la comparativa se limita a los brazos internos del mismo estudio.

## Limitaciones y advertencias

- Escala mínima: 14,98 M de parámetros y 2,57 MB de corpus de entrenamiento implican una capacidad lingüística muy limitada; no es apto para generación de texto útil en producción.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgos, toxicidad o equidad; el corpus es offline y multi-dominio sin documentación detallada de su composición.
- Riesgo de alucinación: alto por defecto en cualquier modelo de esta escala; no hay ajuste por instrucciones ni RLHF que module las respuestas.
- Contexto: entrenado a 512 tokens; la extrapolación a 2048 se evalúa en BPB, no en calidad de generación, por lo que el uso real más allá de 512 tokens no está validado cualitativamente.
- Idioma: solo inglés; no hay soporte multilingüe ni evaluación en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es funcionalmente adecuado para ello; además, los kernels sm_86 y el código dependen del repositorio externo Moissanite-Labs/holosphere, cuya licencia debe verificarse por separado.
- Dependencia de código no estándar: requiere el paquete `holosphere`; no es compatible con ecosistemas de inferencia convencionales (vLLM, llama.cpp, TGI), lo que complica el despliegue.
- Naturaleza exploratoria: el propio autor etiqueta este checkpoint como "exploratory" y no como el brazo primario pre-registrado; los resultados de la semilla 42 no deben interpretarse como la media del estudio.
- Reproducibilidad ligada al hardware: los datos energéticos y de rendimiento provienen de una única RTX 3080 Laptop con telemetría específica; no se garantiza su traslado a otras GPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/holosphere-v2-cayleysu2-15m
- Repositorio de código y pruebas formales: https://github.com/Moissanite-Labs/holosphere
- Pull request de kernels CUDA/PTX sm_86: https://github.com/Moissanite-Labs/silikernels/pull/3
