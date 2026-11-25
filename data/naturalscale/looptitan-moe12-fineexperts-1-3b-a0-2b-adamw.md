# NaturalScale/LoopTitan-MoE12-FineExperts-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-MoE12-FineExperts-1.3B-A0.2B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale (en colaboración con el laboratorio datamllab), publicado como parte de la Fase 1 del proyecto LoopTitan. Se trata de una variante de arquitectura Mixture-of-Experts (MoE) con expertos "finos": 12 capas de anchura 1280, 72 expertos por capa, tamaño oculto de experto 384 y enrutamiento top-9. El modelo almacena 1.32B parámetros sin embeddings y 1.71B incluyendo embedding de entrada y cabeza de salida, con solo 0.20B parámetros activos por token.

El modelo no está ajustado por instrucciones (no instruction-tuned): es un modelo base de generación de texto pensado para servir como punto de partida para experimentación en arquitecturas MoE y comparación de optimizadores (AdamW frente a Muon). Su relevancia radica en que forma parte de un conjunto de ocho diseños arquitectónicos comparados bajo dos optimizadores distintos, con métricas de bits por byte (BPB) sobre el dataset DCLM-baseline, lo que lo convierte en una pieza útil para investigación sobre eficiencia de expertos y entrenamiento.

La ficha corresponde a la variante entrenada con AdamW del diseño "Finer experts" (diseño 2 de 8). El modelo se distribuye con licencia MIT y pesos en safetensors, e incluye código personalizado (`custom_code`) para su carga mediante Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con expertos finos; 12 capas, anchura 1280, 72 expertos por capa, tamaño oculto de experto 384, top-9 |
| Parametros totales | 1.706.684.160 (1.71B con embeddings); 1.32B sin embeddings |
| Parametros activos | 0.20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas Mixture-of-Experts de grano fino: cada una de las 12 capas contiene 72 expertos con tamaño oculto de 384 y activa los 9 expertos mejor puntuados por token (top-9). Esta configuración mantiene un recuento total de 1.32B parámetros no-embedding pero solo 0.20B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El modelo se entrena desde cero, sin ajuste por instrucciones, sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet`.

El entrenamiento utiliza el optimizador AdamW, y el autor lo compara explícitamente con la variante equivalente entrenada con Muon dentro de un conjunto de ocho diseños arquitectónicos. Según la model card, este diseño "Finer experts" con AdamW mejora el BPB de test en 4.22 mBPB respecto a un MoE estándar con el mismo optimizador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO (el modelo es base, no instruction-tuned).

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base (no ajustado por instrucciones).
- Modelado de lenguaje y estimación de probabilidad por token (métrica BPB sobre DCLM-baseline).
- Razonamiento y generación de código: no se documentan capacidades específicas ni evaluaciones en la información disponible.
- Soporte de tool calling / function calling: no disponible (modelo base, sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo sirve como referencia reproducible para estudiar el efecto de expertos finos (72 expertos, top-9) frente a configuraciones MoE estándar, gracias a su comparación directa con otros siete diseños del proyecto LoopTitan.
- Comparación de optimizadores: al existir una variante equivalente entrenada con Muon, permite analizar el impacto de AdamW frente a Muon en el mismo diseño arquitectónico y dataset.
- Fine-tuning como modelo base: al ser un modelo base de 1.32B parámetros no-embedding y 0.20B activos, es adecuado como punto de partida para ajuste supervisado en tareas downstream con recursos moderados.
- Experimentación con eficiencia computacional: su reducido número de parámetros activos por token lo hace útil para medir throughput y latencia en despliegues con presupuesto de cómputo limitado.
- Evaluación de modelado de lenguaje: la métrica BPB sobre DCLM-baseline permite usarlo como baseline en estudios de compresión y predicción de lenguaje.
- Reproducción de resultados de la Fase 1 de LoopTitan: el modelo y sus recetas están publicados en el repositorio del proyecto, lo que facilita replicar los experimentos de entrenamiento y validar las diferencias de BPB reportadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor | Notas |
|---|---:|---|
| Test BPB | 0.995309 | Sobre `mlfoundations/dclm-baseline-1.0-parquet`; menor es mejor |
| Validation BPB | 0.997202 | Sobre el mismo dataset; menor es mejor |
| Δ test vs MoE estándar (AdamW) | -4.22 mBPB | Mejora frente al MoE estándar con AdamW |

En la comparativa interna de los ocho diseños del proyecto (AdamW), este diseño "Finer experts" ocupa una posición intermedia: mejora al MoE estándar en 4.2 mBPB, pero queda por detrás de otros diseños como "Deeper, narrower" (-6.9), "Expert layout" (-5.9), "Unrolled" (-8.9), "The loop" (-9.0), "One more visit" (-14.8) y "Twice the experts" (-14.3). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan 6.8 GB en el repositorio; la inferencia en fp16 requeriría del orden de 3.4 GB solo para pesos, más memoria para activaciones y caché KV (no documentada).
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repo (6.8 GB) sugiere que podría caber en GPUs con 8-12 GB de VRAM en precisión reducida, pero no hay datos oficiales.
- Opciones de despliegue: la model card indica `transformers` con `custom_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopTitan-MoE12-FineExperts-1.3B-A0.2B-AdamW | 1.71B (1.32B sin embeddings) | 0.20B | no disponible | MIT | Hugging Face |
| LoopTitan-MoE12-FineExperts-1.3B-A0.2B-Muon | 1.71B (1.32B sin embeddings) | 0.20B | no disponible | MIT | Hugging Face (colección LoopTitan Fase 1) |
| MoE estándar (diseño m0 de LoopTitan, AdamW) | no disponible | no disponible | no disponible | MIT | Repositorio LoopTitan (recetas) |
| Otros diseños LoopTitan Fase 1 (Deeper/narrower, Unrolled, The loop, etc.) | no disponible | no disponible | no disponible | MIT | Hugging Face (colección LoopTitan Fase 1) |

No se dispone de datos de benchmarks estándar para comparar con modelos comerciales o de otros autores de tamaño similar; la comparación disponible se limita a los diseños internos del proyecto LoopTitan y a la métrica BPB.

## Limitaciones y advertencias

- Modelo base no instruction-tuned: no sigue instrucciones de forma fiable y no está diseñado para uso conversacional directo sin ajuste adicional.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre DCLM-baseline, puede heredar sesgos presentes en datos web.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados figuran como no disponibles, lo que impide garantizar su comportamiento en contextos largos o multilingües.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo incluye `custom_code`, por lo que conviene revisar el código asociado antes de desplegarlo en producción.
- Caveat para producción: el modelo tiene solo 3 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad; los resultados de BPB son declarados por el autor y no están verificados.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia optimizados, lo que puede limitar su despliegue eficiente.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-FineExperts-1.3B-A0.2B-AdamW
- Página del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Colección LoopTitan Fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Resultados de la Fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta del MoE estándar de referencia: https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-adamw.json
