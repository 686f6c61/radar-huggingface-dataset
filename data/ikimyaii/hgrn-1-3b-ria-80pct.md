# ikimyaii/hgrn-1.3B-ria-80pct

## Resumen

HGRN-1.3B · RIA 80% sparse es un checkpoint de investigación publicado por el usuario ikimyaii que consiste en el modelo HGRN-1.3B (un LM generativo de 1.364.396.032 parámetros basado en recurrencia lineal con compuertas y sin mecanismo de atención) podado de forma one-shot al 80% de esparsidad de pesos mediante el método RIA. El modelo parte del checkpoint denso `ikimyaii/hgrn-1.3B-dense-baseline`, que a su vez es una copia de `fla-hub/hgrn-1.3B-100B`. Su propósito no es el despliegue en producción, sino servir como baseline reproducible en la comparativa del método CWS sobre esta arquitectura.

La poda se aplica a todas las capas `nn.Linear` de los 24 bloques HGRN (`i_proj`, `f_proj`, `g_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) y a `lm_head`, con una fracción constante de k elementos eliminados por fila de salida (semi-estructurada). No se aplicó corrección de pesos ni reentrenamiento posterior. Los embeddings y las normas permanecen densos, y el checkpoint se almacena de forma densa con ceros explícitos en las posiciones podadas.

El interés actual de esta ficha es acotado y muy específico: el propio autor advierte que entre el 70% y el 80% de esparsidad el modelo no produce texto utilizable y que la precisión zero-shot está cerca del azar. Por tanto, se trata de una pieza para estudiar compresión de modelos, kernels sparse y hardware neuromórfico (Intel Loihi), no de un modelo de propósito general. La licencia es MIT y solo se declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (gated linear-recurrent LM sin atención), 24 bloques |
| Parametros totales | 1.364.396.032 (1,3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; sin variantes cuantizadas publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales de la model card: método de poda RIA, esparsidad objetivo 80% / alcanzada 79,98%, α = 0,5, calibración con C4 (64 lotes × 4 × 512 tokens), sin corrección de pesos y sin reentrenamiento. Tamaño del repositorio: 2,7 GB.

## Arquitectura y entrenamiento

La arquitectura es HGRN, un modelo de lenguaje causal de tipo gated linear-recurrent que elimina por completo el mecanismo de atención. El checkpoint cuenta con 24 bloques HGRN y un total de 1.364.396.032 parámetros. Cada bloque contiene proyecciones `i_proj`, `f_proj`, `g_proj` y `o_proj` junto con un MLP (`gate_proj`, `up_proj`, `down_proj`), todas ellas afectadas por la poda, además de `lm_head`. La implementación procede de la librería flash-linear-attention (FLA), que registra la configuración `HGRNConfig` y el modelo `HGRNForCausalLM` en Transformers.

Sobre el entrenamiento original no hay información detallada en la model card: el punto de partida es `ikimyaii/hgrn-1.3B-dense-baseline`, descrito como copia de `fla-hub/hgrn-1.3B-100B`, y la model card no especifica composición del dataset, número exacto de tokens ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de compresión: la poda es one-shot, se aplica sobre todas las capas lineales con una fracción constante de pesos eliminados por fila, y la calibración se realizó con C4 usando 64 lotes de 4 secuencias de 512 tokens. El método RIA puntúa cada peso como `(|W[r,c]| / ‖W[r,:]‖₁ + |W[r,c]| / ‖W[:,c]‖₁) · act_rms[c]^α` con α = 0,5, es decir, una importancia relativa frente a su fila y su columna escalada por el tamaño de activación, y no incluye corrección de pesos.

## Capacidades

- Generación de texto: formalmente es la tarea declarada (`text-generation`), pero el propio autor indica que a 70-80% de esparsidad el modelo no produce texto utilizable.
- Razonamiento: no hay evidencia de capacidad útil; las métricas zero-shot en ARC, HellaSwag, PIQA o LAMBADA están en niveles cercanos al azar.
- Código y matemáticas: no disponible; no se reportan evaluaciones de este tipo.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Multilingüismo: no; solo se declara inglés (`en`).
- Capacidades especiales: no hay modo thinking, visión ni audio. La característica diferencial es la estructura de pesos: 79,98% de ceros explícitos que en hardware neuromórfico event-driven (Intel Loihi) no generan evento sináptico y por tanto reducen el cómputo activo.

## Casos de uso

- Investigación en poda semi-estructurada: sirve como baseline reproducible para comparar RIA contra CWS, SparseGPT, Wanda y AWP sobre la misma arquitectura HGRN-1.3B, usando tanto las métricas zero-shot como la perplejidad de WikiText-2.
- Baseline de referencia en artículos de compresión: al estar publicados los resultados crudos en JSON, se puede citar directamente como punto de comparación en estudios de pruning a 80% de esparsidad.
- Evaluación de hardware neuromórfico: sobre Intel Loihi y otros sustratos event-driven, un peso a cero no genera evento sináptico, de modo que este checkpoint permite medir la reducción real de cómputo activo en ese tipo de hardware.
- Desarrollo y validación de kernels sparse: el checkpoint almacena los ceros de forma explícita, lo que permite verificar que un kernel sparse reproduce la misma salida que la ejecución densa antes de medir ganancias de velocidad.
- Análisis de degradación en modelos recurrentes lineales sin atención: permite estudiar cómo se comporta una arquitectura HGRN bajo esparsidad extrema, comparando con los resultados de transformers con atención a igual nivel de poda.
- Reproducción de pipelines de poda: los scripts de poda, baselines y resultados crudos están publicados en el repositorio Sparse-LLMs-on-Loihi, lo que facilita reproducir exactamente la calibración (C4, 64 lotes × 4 × 512 tokens, α = 0,5).
- Estudio de métodos posteriores de corrección: dado que este checkpoint no aplica corrección de pesos, sirve como punto de partida para medir cuánto mejora una corrección posterior o un ajuste fino sobre el modelo podado.

## Benchmarks y rendimiento

Resultados zero-shot con `lm-evaluation-harness`. ARC-Easy, ARC-Challenge, HellaSwag y PIQA se reportan con `acc_norm`; WinoGrande y LAMBADA con `acc`.

| Tarea | Este modelo (80% RIA) | Denso |
|---|---|---|
| ARC-Easy (acc_norm) | 0,250 | 0,510 |
| ARC-Challenge (acc_norm) | 0,302 | 0,275 |
| HellaSwag (acc_norm) | 0,256 | 0,480 |
| PIQA (acc_norm) | 0,513 | 0,712 |
| WinoGrande (acc) | 0,498 | 0,528 |
| LAMBADA-OpenAI (acc) | 0,000 | 0,383 |
| Media (6 tareas) | 0,303 | 0,481 |

Perplejidad one-shot en WikiText-2 a 80% de esparsidad sobre HGRN-1.3B (el modelo denso obtiene 11,8), según el barrido reportado en el paper de CWS:

| Método | WikiText-2 PPL ↓ |
|---|---|
| CWS | 131,27 |
| SparseGPT | 6.956 |
| Wanda | 76.051 |
| RIA (este modelo) | 28.615 |
| AWP | 17.195 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en bfloat16 (coincide con el tamaño del repositorio) y en torno a 5,5 GB en fp32. Son estimaciones a partir del número de parámetros, sin margen para activaciones ni estados recurrentes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede cargar el checkpoint en bfloat16. No se documentan GPU concretas ni requisitos específicos en la model card.
- Cabe en GPU de consumo: sí. Con 2,7 GB en bfloat16 cabe en tarjetas de gama media y alta con holgura; el cuello de botella no es la memoria, sino la ausencia de kernels sparse.
- Opciones de despliegue: Transformers junto con la librería flash-linear-attention (`pip install flash-linear-attention transformers torch`), registrando `HGRNConfig` y `HGRNForCausalLM`. El checkpoint también funciona en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Aceleración: la esparsidad no aporta ninguna ganancia de velocidad por sí sola, porque los pesos se almacenan de forma densa con ceros explícitos. Se requiere un kernel sparse o hardware event-driven que omita los pesos cero.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Esparsidad | Media (6 tareas) | WikiText-2 PPL | Licencia |
|---|---|---|---|---|---|
| ikimyaii/hgrn-1.3B-ria-80pct (este) | 1,3B | 79,98% | 0,303 | 28.615 | MIT |
| ikimyaii/hgrn-1.3B-dense-baseline | 1,3B | 0% | 0,481 | 11,8 | no disponible en la informacion proporcionada |
| fla-hub/hgrn-1.3B-100B | 1,3B | 0% | no disponible | no disponible | no disponible en la informacion proporcionada |
| Mismo HGRN-1.3B podado con CWS | 1,3B | 80% | no disponible | 131,27 | no disponible en la informacion proporcionada |
| Mismo HGRN-1.3B podado con AWP | 1,3B | 80% | no disponible | 17.195 | no disponible en la informacion proporcionada |
| Mismo HGRN-1.3B podado con SparseGPT | 1,3B | 80% | no disponible | 6.956 | no disponible en la informacion proporcionada |
| Mismo HGRN-1.3B podado con Wanda | 1,3B | 80% | no disponible | 76.051 | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: no está ajustado por instrucciones ni alineado en seguridad, y hereda los sesgos del modelo base.
- A 70-80% de esparsidad el modelo no genera texto utilizable; la precisión zero-shot está cerca del nivel de azar, con LAMBADA-OpenAI en 0,000 y HellaSwag en 0,256.
- La perplejidad en WikiText-2 se degrada de 11,8 (denso) a 28.615, un factor superior a 2.400, muy por detrás de CWS (131,27) y peor también que AWP (17.195).
- La esparsidad por sí sola no produce ninguna aceleración: los pesos se almacenan densamente con ceros explícitos y se necesita un kernel sparse o hardware event-driven para obtener ventaja.
- Solo se declara soporte de inglés; no hay capacidades multilingües documentadas.
- No hay información sobre longitud de contexto, por lo que no se puede garantizar el comportamiento en secuencias largas.
- La licencia es MIT, lo que en principio permite uso comercial, pero la ausencia de ajuste por instrucciones y la calidad de salida inviable a esta esparsidad hacen desaconsejable cualquier uso en producción.
- No se documentan evaluaciones de seguridad, sesgos ni robustez más allá de las métricas zero-shot listadas.
- El modelo tiene 2 descargas y 0 likes, y no se ha publicado información sobre mantenimiento posterior a la actualización del 13 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/hgrn-1.3B-ria-80pct
- Modelo base denso: https://huggingface.co/ikimyaii/hgrn-1.3B-dense-baseline
- Modelo original de FLA: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio Sparse-LLMs-on-Loihi (scripts de poda, baselines y resultados crudos): https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi
- Resultados de benchmark crudos: https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi/blob/main/results/benchmark_hgrn_ria_80pct.json
- Repositorio CWS: https://github.com/KimiaGholami/CWS
- Barrido de perplejidad reportado en el paper de CWS: https://github.com/KimiaGholami/CWS/blob/main/results/paper_reported_sweep.csv
- Repositorio Weight-Sparsity-Using-Real-Loss: https://github.com/KimiaGholami/Weight-Sparsity-Using-Real-Loss
- Repositorio EHWS: https://github.com/KimiaGholami/EHWS
- Paper de RIA (Zhang et al., ICLR 2024): URL no disponible en la informacion proporcionada
- Datasets de calibración y evaluación: https://huggingface.co/datasets/Salesforce/wikitext y https://huggingface.co/datasets/allenai/c4
