# ikimyaii/Mamba-370M-semi-structured-ELSA-50pct

## Resumen

Mamba-370M-semi-structured-ELSA-50pct es una versión podada al 50% de dispersión semi-estructurada del modelo state-spaces/mamba-370m-hf, generada por el usuario ikimyaii aplicando el código oficial de ELSA (paper arXiv:2510.01650). No es un modelo nuevo entrenado desde cero, sino un artefacto de investigación que sirve como línea base para comparar técnicas de poda sobre arquitecturas de espacio de estados (SSM). El modelo conserva la arquitectura Mamba original y mantiene intactos los componentes críticos (embeddings, lm_head, conv1d, A_log, D y dt_proj), podando únicamente las proyecciones lineales internas de los bloques.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental con cero descargas y sin licencia declarada, orientado a investigadores que evalúan el impacto de la dispersión semi-estructurada en modelos SSM. Los resultados publicados muestran un deterioro sustancial en perplejidad (de 14,33 a 22,67 en WikiText-2) pero una degradación moderada en precisión zero-shot (de 0,4390 a 0,4254 de media), lo que sugiere que la poda afecta más a la calibración de la distribución que a las capacidades discriminativas medidas.

El modelo tiene 423.003.136 parámetros totales según los pesos safetensors, un repositorio de 1,7 GB y se carga con `transformers` estándar mediante `AutoModelForCausalLM.from_pretrained(...)`. No se dispone de información sobre contexto máximo, idiomas o licencia en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, state-spaces/mamba-370m-hf) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo (SSM) que sustituye la atención por recurrencia selectiva dependiente de la entrada. Sobre el checkpoint base state-spaces/mamba-370m-hf se aplicó poda semi-estructurada al 50% mediante el código oficial de ELSA, con proyección por filas (`--admm_comparison_group=row`): cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el top 50%). Las capas afectadas son `in_proj`, `x_proj` y `out_proj` dentro de los bloques; `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos.

El proceso de poda siguió la configuración del run HGRN-1.3B @80% del paper ELSA, sin cambios entre modelos y niveles de dispersión: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0.01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens (tokenizadas con el tokenizer del propio modelo) y semilla 0. El run completo tardó 2,80 horas en una A100 de 40 GB. La dispersión medida sobre los pesos finales es de 0,4901, ligeramente por debajo del 50% nominal porque algunos pesos conservados son exactamente cero (la fila más densa supera la media en un factor máximo de 1,00024x). No se realizó ningún fine-tuning posterior a la poda ni se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` de `transformers`.
- Razonamiento y conocimiento factual limitados: promedia 0,4254 en tareas zero-shot de lm-evaluation-harness (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el entrenamiento de poda usó únicamente C4.
- No dispone de modo thinking, visión ni audio.
- El modelo base Mamba-370M es un modelo pequeño de investigación, no un modelo de chat alineado; no se documenta plantilla de conversación ni ajuste por instrucciones.

## Casos de uso

- Investigación sobre poda de modelos SSM: sirve como línea base reproducible para comparar técnicas de dispersión semi-estructurada (ELSA, ADMM u otras) frente al checkpoint denso state-spaces/mamba-370m-hf, usando el mismo protocolo de evaluación de perplejidad en WikiText-2 y C4.
- Estudio del compromiso entre dispersión y rendimiento: permite medir cuánto cae la perplejidad (de 14,33 a 22,67 en WikiText-2) frente a cuánto cae la precisión zero-shot (de 0,4390 a 0,4254) al aplicar un 50% de dispersión por filas, un dato útil para decidir umbrales de poda en producción.
- Validación de kernels y runtimes dispersos: al tener una estructura de dispersión por filas conocida y medible (0,4901), es adecuado para probar kernels de sparse GEMM o de decodificación optimizada para Mamba en GPUs con soporte de sparsity.
- Benchmark de infraestructura de inferencia: con 423 millones de parámetros y 1,7 GB de pesos, permite medir latencia y throughput de `transformers` frente a alternativas como vLLM o llama.cpp en hardware modesto (una sola GPU consumer), sin el coste de un modelo mayor.
- Reproducibilidad de experimentos académicos: el run completo se ejecutó en 2,80 horas en una A100 de 40 GB con semilla fija, lo que facilita replicar el pipeline de poda en entornos con recursos limitados.
- Docencia y divulgación sobre compresión de modelos: ilustra de forma concreta la diferencia entre dispersión no estructurada y semi-estructurada y el efecto de mantener densos los componentes sensibles (`dt_proj`, `conv1d`, `A_log`, `D`) frente a podar solo las proyecciones lineales.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 y C4, en bf16 porque Mamba desborda en fp16), ejecución única:

| Metrica | Denso (base) | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 14,33 | 22,67 |
| C4 (perplejidad) | 19,40 | 25,76 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso (base) | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2389 |
| arc_easy | 0,5484 | 0,4966 |
| boolq | 0,6150 | 0,6183 |
| hellaswag | 0,3722 | 0,3498 |
| openbookqa | 0,1960 | 0,1920 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5549 |
| Media | 0,4390 | 0,4254 |

Dispersión medida en las capas podadas: 0,4901.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16 (423 millones de parámetros a 2 bytes por peso) más el overhead de activaciones y caché de estado; el repositorio ocupa 1,7 GB, lo que sugiere pesos en bf16 o fp32 según el artefacto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; el run de poda se ejecutó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en GPUs integradas con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)` es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto, y la naturaleza dispersa de los pesos puede no estar soportada por todos los runtimes.
- Latencia y throughput: no disponibles en la información proporcionada. El tiempo de poda (2,80 horas en A100 40GB) no es un dato de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M ELSA 50%) | 423.003.136 | no disponible | 22,67 | no disponible | Hugging Face, 0 descargas |
| state-spaces/mamba-370m-hf (denso) | no disponible (base) | no disponible | 14,33 | no disponible | Hugging Face |
| HGRN-1.3B @80% (referencia del paper ELSA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el checkpoint denso es la más informativa: la poda al 50% por filas multiplica por aproximadamente 1,58 la perplejidad en WikiText-2 y por 1,33 en C4, mientras que la precisión zero-shot media cae solo 0,0136 puntos absolutos. No se dispone de datos de otros modelos Mamba podados con los que comparar directamente.

## Limitaciones y advertencias

- Deterioro notable de perplejidad: 22,67 frente a 14,33 en WikiText-2, lo que indica una peor modelización de la distribución del lenguaje y mayor probabilidad de texto incoherente en generación libre.
- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base en la información disponible, por lo que el uso comercial no está autorizado de forma explícita y requiere consultar el repositorio original de state-spaces/mamba-370m-hf.
- Sin fine-tuning posterior a la poda: no se aplicó recuperación de rendimiento tras el ADMM, por lo que el modelo no está alineado ni ajustado por instrucciones.
- Evaluación de una sola ejecución: los resultados de perplejidad y zero-shot provienen de un único run con semilla 0, sin intervalos de confianza.
- Riesgo de alucinación: inherente a un modelo de 370 millones de parámetros sin alineación; la poda agrava la pérdida de coherencia en contextos largos.
- Idiomas y contexto no documentados: no se puede garantizar comportamiento multilingüe ni una ventana de contexto concreta; el entrenamiento de poda usó solo C4 en inglés.
- Soporte de runtimes incierto: la estructura de dispersión por filas puede no ser explotada por `transformers` ni por servidores de inferencia estándar, con lo que el ahorro real de cómputo podría no materializarse.
- Artefacto de investigación: cero descargas y cero likes en el momento de la consulta, sin mantenimiento ni garantías del autor.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-ELSA-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper ELSA: https://arxiv.org/abs/2510.01650
