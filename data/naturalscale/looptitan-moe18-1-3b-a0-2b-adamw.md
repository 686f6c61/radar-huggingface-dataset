# NaturalScale/LoopTitan-MoE18-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-MoE18-1.3B-A0.2B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale (en colaboración con el proyecto LoopTitan de datamllab), publicado en noviembre de 2026. Forma parte de la Fase 1 del proyecto LoopTitan, una línea de investigación centrada en arquitecturas Mixture-of-Experts (MoE) con variantes de diseño estructural y de optimizador. Este checkpoint concreto corresponde al diseño "deeper and narrower" (más profundo y estrecho) entrenado con el optimizador AdamW, uno de los ocho diseños de la release.

El modelo emplea una arquitectura transformer MoE con 18 capas, anchura de 1056, 58 expertos por capa, tamaño oculto de experto 384 y enrutamiento top-8. Almacena 1.310 millones de parámetros sin contar embeddings y 1.635 millones con la matriz de entrada y la cabeza de salida (la cifra que reporta Hugging Face), con 0.220 millones de parámetros activos por token. Es un modelo base, no ajustado por instrucciones, entrenado sobre el dataset DCLM-baseline-1.0.

Su relevancia es fundamentalmente de investigación: permite comparar el efecto del diseño arquitectónico y del optimizador sobre la eficiencia de entrenamiento en términos de bits por byte (BPB). El autor reporta una mejora de -6.91 mBPB en test frente a una MoE estándar con AdamW. No está pensado como modelo de producción conversacional, sino como pieza de un estudio controlado de arquitecturas MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 18 capas, anchura 1056, 58 expertos por capa, experto de tamaño 384, top-8 |
| Parametros totales | 1.634.995.296 (1.63B con embeddings); 1.31B sin embeddings |
| Parametros activos | 0.22B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas MoE de enrutamiento top-8 sobre 58 expertos por capa, con un tamaño de experto relativamente pequeño (384) y una anchura de modelo de 1056 distribuida en 18 capas. Esta configuración corresponde al diseño "deeper and narrower" del estudio LoopTitan, que explora el compromiso entre profundidad y anchura manteniendo el número de parámetros activos bajo (0.22B por token). El modelo requiere `custom_code` (tag `moeloop`/`looptitan`) y se carga con la librería transformers.

El entrenamiento se realizó desde cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM-baseline), un corpus web filtrado de gran escala. El checkpoint se entrenó con el optimizador AdamW, y el autor lo compara explícitamente con una variante equivalente entrenada con Muon y con una MoE estándar de referencia. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo base, no se declara ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base.
- Modelado de lenguaje y estimación de probabilidad (evaluado mediante bits por byte sobre DCLM).
- Razonamiento y conocimiento general derivados del preentrenamiento, sin ajuste instructivo específico.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- No se declara modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas MoE: servir como punto de comparación controlado frente a la MoE estándar y frente a la variante Muon del mismo estudio, midiendo el efecto del diseño "deeper and narrower" sobre BPB.
- Estudio de eficiencia de optimizadores: comparar AdamW frente a Muon en condiciones de entrenamiento idénticas para analizar convergencia y calidad final del modelo.
- Experimentos de escalado con parámetros activos reducidos: usar los 0.22B activos por token para estudiar el equilibrio entre capacidad total (1.63B) y coste computacional por token en inferencia.
- Fine-tuning supervisado como base: al ser un modelo base con licencia MIT, puede servir de punto de partida para ajustes posteriores en dominios concretos, siempre que se valide su calidad previa.
- Evaluación de rutas de enrutamiento MoE: analizar el comportamiento de los 58 expertos por capa y el enrutamiento top-8 en tareas de modelado de lenguaje.
- Reproducibilidad de resultados: replicar las métricas BPB reportadas sobre DCLM-baseline y verificar la mejora de -6.91 mBPB frente a la MoE estándar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor | Referencia |
|---|---|---|
| Test BPB | 0.992619 | DCLM-baseline-1.0 |
| Validation BPB | 0.994388 | DCLM-baseline-1.0 |
| Δ test vs MoE estándar (AdamW) | -6.91 mBPB | Referencia interna del estudio |

Comparativa interna de los ocho diseños de la release (test mBPB frente a la MoE estándar, por optimizador):

| Diseño | AdamW | Muon |
|---|---:|---:|
| MoE estándar | +0.0 | +0.0 |
| Expertos más finos | -4.2 | -0.9 |
| Más profundo y estrecho (este modelo) | -6.9 | -4.2 |
| Disposición de expertos | -5.9 | -3.4 |
| Unrolled | -8.9 | -3.3 |
| The loop | -9.0 | -3.7 |
| One more visit | -14.8 | -12.2 |
| El doble de expertos | -14.3 | -9.9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 3.3 GB solo para pesos, más overhead de activaciones y caché KV (no disponible la longitud de contexto).
- En cuantización de 8 bits: en torno a 1.7 GB de pesos; en 4 bits, alrededor de 0.9 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en inferencia básica; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con margen amplio en fp16.
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura MoE personalizada); no se declara soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE18-1.3B-A0.2B-AdamW | 1.63B | 0.22B | no disponible | MIT | Base, MoE 18 capas, 58 expertos, top-8 |
| LoopTitan variante Muon (mismo diseño) | 1.63B | 0.22B | no disponible | MIT | Mismo diseño con optimizador Muon; -4.2 mBPB vs estándar |
| MoE estándar de referencia (estudio LoopTitan) | no disponible | no disponible | no disponible | no disponible | Línea base del estudio (AdamW +0.0 mBPB) |

No se dispone de comparación con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no está optimizado para seguir instrucciones ni para conversación directa.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin alineamiento.
- Sesgos potenciales derivados del corpus DCLM-baseline (datos web filtrados), no evaluados en la información disponible.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto no disponible, lo que limita la planificación de casos de uso con ventanas largas.
- Los resultados BPB son declarados por el autor y no están verificados (`verified: false`); deben tratarse como indicativos.
- Requiere `custom_code` para cargarse en transformers, lo que puede complicar el despliegue en stacks de inferencia estándar.
- Licencia MIT: permite uso comercial, pero sin garantías del autor; conviene validar calidad y seguridad antes de producción.
- Modelo con muy pocas descargas (9) y sin likes en el momento de la ficha: ecosistema y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE18-1.3B-A0.2B-AdamW
- Página del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio GitHub: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados Fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta de referencia (MoE estándar AdamW): https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-adamw.json
- Colección de modelos LoopTitan Fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
