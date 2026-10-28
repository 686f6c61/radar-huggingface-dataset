# ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-80pct

## Resumen

GatedDeltaNet-1.3B-unstructured-ELSA-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace: se trata del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure (1.466.343.808 parámetros) podado al 80 % de dispersión no estructurada mediante el código oficial de ELSA, un método de podado basado en ADMM presentado en el preprint arXiv:2510.01650. No es un modelo nuevo entrenado desde cero, sino un artefacto de evaluación concebido como línea base del proyecto EHWS del mismo autor, que compara estrategias de podado semiestructurado y no estructurado sobre arquitecturas de atención lineal.

El interés técnico reside en la arquitectura subyacente: Gated DeltaNet es una capa de atención lineal con regla delta y compuertas, publicada en ICLR 2025 por NVlabs como alternativa a Mamba2, lo que la convierte en un banco de pruebas poco habitual para técnicas de compresión. Sobre esa base, este checkpoint demuestra un resultado negativo relevante: aplicar ADMM con umbral de magnitud por capa y sin equilibrio de filas hunde la perplejidad de 10,31 a 26,28 en WikiText-2 y de 13,76 a 26,17 en C4, con una media zero-shot que cae de 0,5123 a 0,4082.

Es, por tanto, un modelo útil para quien investigue podado, dispersión no estructurada o eficiencia en modelos de estado recurrente lineal, y no para despliegue en producción: no hay licencia declarada, no hay idiomas declarados, no hay pipeline asignado y los ceros se almacenan físicamente en los pesos, por lo que no se obtiene ahorro de memoria sin recomprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con regla delta y compuertas), transformer híbrido con capas recurrentes lineales |
| Parametros totales | 1.466.343.808 (aprox. 1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors de precisión completa (el tamaño del repo, 5,9 GB, es coherente con fp32 para 1,466 M de parámetros, dato no confirmado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y el paquete `flash-linear-attention`) |
| Dispersión | 80,00 % no estructurada medida; embeddings y `lm_head` sin podar; los ceros se almacenan en los pesos |
| Numero de capas afectadas | 240 capas verificadas |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |

## Arquitectura y entrenamiento

La arquitectura de partida es Gated DeltaNet, una capa de atención lineal que combina la regla delta (delta rule) con compuertas de decaimiento para mejorar sobre Mamba2 en tareas de recuperación asociativa y modelado de secuencias largas. El modelo base fue entrenado por m-a-p con 100B tokens según indica su identificador, en modo «pure», es decir, sin ajuste por instrucciones ni preferencias (no hay evidencia de RLHF o DPO en la información disponible). Sobre esos pesos, el autor aplicó ELSA: un esquema de podado por optimización alternativa (ADMM) que intercala pasos de podado por umbral de magnitud y pasos de ajuste de los pesos no nulos, con una proyección por capa (`--admm_comparison_group=layer`).

La configuración exacta del podado fue: lr 2e-4, lambda 1e-2, Adam con beta2 0,95, 4.096 pasos ADMM con paso z cada 32 pasos, batch efectivo de 8 (1 × 8 de acumulación), bf16, 32.768 secuencias de C4 de 2.048 tokens (aproximadamente 67 millones de tokens de calibración) y semilla 0. El proceso completo se ejecutó en una única A100 de 40 GB durante 7,5 horas. La dispersión es no estructurada y se aplica un único umbral de magnitud por capa, de modo que cada fila conserva un número distinto de pesos no nulos; no hay equilibrio de filas. El resultado es un checkpoint con dispersión efectiva del 80,00 % pero con una distribución muy desigual: la fila más densa concentra en media 2,47 veces más valores no nulos que la media (hasta 4,41 veces en la peor capa).

## Capacidades

- Generación de texto autorregresiva y modelado de lenguaje, heredadas del modelo base denso.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple, con una calidad muy degradada respecto al denso (media zero-shot de 0,4082 frente a 0,5123).
- Capacidad residual de clasificación textual y tareas de inferencia natural (RTE mejora ligeramente: 0,5271 frente a 0,4982 del denso).
- Soporte de tool calling / function calling: no disponible; el modelo base es un checkpoint de preentrenamiento sin ajuste de instrucciones ni plantilla de chat documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible por la misma razón, y agravado por la pérdida de calidad tras el podado.
- Capacidades multilingües: no documentadas; el corpus de calibración es C4 en inglés y no se declara cobertura idiomática.
- Capacidades especiales (visión, audio, modo thinking): ninguna; es un modelo exclusivamente de texto.
- Eficiencia teórica: al ser dispersión no estructurada almacenada con ceros, no se traduce en mejoras de velocidad ni de memoria sin recompresión o kernels específicos.

## Casos de uso

- Investigación en podado de modelos: sirve como línea base reproducible frente a esquemas semiestructurados (el propio autor lo compara con EHWS row-wise y ELSA row-wise al mismo 80 %), permitiendo aislar el efecto del equilibrio de filas.
- Estudio de compresión en arquitecturas de atención lineal: al partir de Gated DeltaNet en lugar de un transformer clásico, permite medir si las capas recurrentes lineales toleran peor o mejor la dispersión extrema que la atención estándar.
- Reproducción de resultados de ELSA: la model card documenta hiperparámetros, semilla y tiempos, lo que facilita replicar el experimento o extenderlo a otras tasas de dispersión (existe una variante al 50 % del mismo autor).
- Análisis de distribuciones de pesos post-ADMM: la comprobación de desequilibrio por filas en las 240 capas es un material directo para estudiar umbrales por capa frente a umbrales globales.
- Docencia y divulgación sobre dispersión no estructurada: un caso claro de que una dispersión nominal del 80 % no implica ganancias reales de eficiencia ni de calidad utilizable.
- Evaluación comparativa de harnesses: el checkpoint se ha puntuado con `lm-evaluation-harness` (7 tareas, 0-shot) y con el pipeline propio de EHWS, lo que lo hace útil para validar la coherencia entre herramientas de evaluación.

## Benchmarks y rendimiento

Perplejidad (código de evaluación de ELSA, fp16, semilla 0):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base, sin podar) | 10,31 | 13,76 |
| EHWS row-wise 80 % | 22,03 | 22,25 |
| ELSA row-wise 80 % | 26,19 | 26,24 |
| Este modelo (ELSA no estructurado 80 %) | 26,28 / 26,27 (reevaluación) | 26,17 |

Precisión zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2201 |
| arc_easy | 0,7222 | 0,4996 |
| boolq | 0,6159 | 0,5810 |
| hellaswag | 0,4629 | 0,3257 |
| openbookqa | 0,2920 | 0,1760 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5280 |
| Media | 0,5123 | 0,4082 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,9 GB solo de pesos en bf16/fp16; el repo ocupa 5,9 GB, lo que sugiere pesos de 32 bits y elevaría la huella a unos 5,9 GB antes de activaciones. Los ceros se almacenan, así que la poda no reduce el consumo.
- GPU recomendadas: cualquier GPU con 8-16 GB basta para inferencia en precisión reducida; una RTX 4090 (24 GB) o una A100 40 GB son holgadas para el modelo, y esta última es la que se usó para el propio podado (7,5 horas).
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más si se convierte a fp16 y se dispone del kernel adecuado; en 4 GB solo mediante cuantización posterior, no publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el paquete `flash-linear-attention` (requisito explícito del autor). No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, dado que Gated DeltaNet no es una arquitectura transformer estándar y no se han publicado pesos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de dispersión no estructurada con ceros almacenados, no se espera ninguna aceleración frente al modelo denso con kernels convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiText-2 (ppl) | C4 (ppl) | Media 0-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (ELSA no estructurado 80 %) | 1,47B | no disponible | 26,28 | 26,17 | 0,4082 | no disponible | HuggingFace |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,47B | no disponible | 10,31 | 13,76 | 0,5123 | no disponible | HuggingFace |
| ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct | 1,47B | no disponible | 22,03 | 22,25 | no disponible | no disponible | HuggingFace |
| ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-80pct | 1,47B | no disponible | 26,19 | 26,24 | no disponible | no disponible | HuggingFace |
| ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-50pct | 1,47B | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 10,31 a 26,28 y la media zero-shot cae 10,4 puntos porcentuales. No es apto para producción sin una evaluación propia.
- La dispersión es no estructurada y los ceros se almacenan en los pesos: no hay ahorro de memoria ni de cómputo sin recompresión y kernels específicos, por lo que el beneficio práctico es nulo con herramientas estándar.
- Desequilibrio de filas documentado: la fila más densa tiene 2,47 veces más valores no nulos que la media (4,41 veces en la peor capa), lo que produce comportamiento irregular entre canales y complica un podado estructurado posterior.
- Licencia no declarada: no se puede asumir uso comercial. Cualquier despliegue requiere contactar con el autor o con el titular del modelo base.
- Idiomas no declarados y calibración únicamente en C4 inglés: el comportamiento en castellano u otras lenguas es desconocido y probablemente degradado.
- Longitud de contexto no documentada en la información disponible; no debe asumirse la ventana del modelo base.
- Es un checkpoint de preentrenamiento («pure»): sin instrucciones, sin plantilla de chat y sin ajuste de preferencias, por lo que no es fiable como asistente conversacional.
- Riesgo elevado de alucinación y de generación incoherente tras el podado, especialmente en tareas de razonamiento multi-paso y generación de código.
- Dependencia de `flash-linear-attention` y de `trust_remote_code=True`: la carga ejecuta código remoto y requiere versiones compatibles de las dependencias.
- Resultados de una única ejecución con semilla 0: no hay intervalos de confianza ni réplicas que permitan estimar la varianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Variante semiestructurada EHWS 80 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct
- Variante semiestructurada ELSA 80 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-80pct
- Variante no estructurada ELSA 50 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-50pct
- Variante sobre HGRN-1.3B: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-80pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio EHWS (código de podado y evaluación): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Implementación oficial de Gated DeltaNet (ICLR 2025): https://github.com/NVlabs/GatedDeltaNet
- Documentación de entrenamiento de Gated DeltaNet: https://deepwiki.com/NVlabs/GatedDeltaNet/6.2-training-a-model
- Nota sobre Gated DeltaNet-2 de NVIDIA: https://www.marktechpost.com/2026/05/24/nvidia-ai-releases-gated-deltanet-2-a-linear-attention-layer-that-decouples-erase-and-write-in-the-delta-rule/
