# flaviussteff/spp-ro-base

## Resumen

spp-ro-base es un modelo de lenguaje causal monolingüe en rumano desarrollado por Flavius-Ștefan Hăbeanu como parte de su tesis de licenciatura en la Facultad de Matemáticas e Informática de la Universidad de Bucarest (2026). Se trata de una replicación desde cero, con cómputo equiparable, del trabajo *Synthetic Persona Pretraining* de Minder et al. (EPFL-dlab, 2026, arXiv:2608.13482), aplicada al rumano. El modelo es la "vanilla control" de una familia de cinco modelos: comparte exactamente el mismo flujo de documentos que las variantes Filtered y SPP, pero sin reflexiones sintéticas ni filtrado, lo que permite aislar el efecto de cada estrategia de preentrenamiento.

Arquitectura transformer tipo Llama con 88,1 millones de parámetros, 12 capas, dimensión oculta de 768 y atención GQA (12 cabezas de consulta, 4 de clave-valor). El contexto es de 1.024 tokens y el vocabulario de 16.384 tokens BPE byte-level específico para rumano. El entrenamiento se realizó íntegramente en una única NVIDIA RTX 3060 de 12 GB durante aproximadamente 66 horas, procesando unos 3.280 millones de tokens.

Su relevancia es metodológica más que de rendimiento: sirve como referencia de control para medir el "impuesto de alineación" en modelos pequeños. Los resultados publicados muestran que la variante SPP no degrada la perplejidad respecto a este control, mientras que la variante Filtered pierde conocimiento precisamente en los documentos marcados por el clasificador de seguridad. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (GQA, SwiGLU, RoPE) |
| Parametros totales | 88.099.584 (~88,1 M), embeddings atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (RoPE theta 10.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 12 capas, dimensión oculta de 768 y capa intermedia de 2.048 con activación SwiGLU. Emplea atención con consultas agrupadas (12 cabezas de consulta y 4 de clave-valor) y embeddings atados entre entrada y salida. El vocabulario es de 16.384 tokens BPE byte-level entrenado para rumano, e incluye un token especial `<assistant>`. La longitud de contexto es de 1.024 posiciones con RoPE de theta 10.000.

El entrenamiento se realizó desde cero sobre 1,5 millones de documentos rumanos (FineWeb-2 RO, Wikipedia RO y prensa), leídos en un orden fijo con semilla reproducible e idéntico para todos los modelos de la familia. El schedule comprende 50.000 pasos con LR pico de 1,5e-4, 500 pasos de calentamiento, decaimiento coseno hasta cero y weight decay de 0,1. Cada paso procesa 64 ventanas empaquetadas de 1.024 posiciones (empaquetado first-fit terminado en EOS, atención en bloque diagonal, posiciones por documento, 2,4 % de padding), lo que suma aproximadamente 3.280 millones de tokens en unas 66 horas. Se usó autocast bf16 con pesos maestros en fp32 sobre una única RTX 3060 de 12 GB. En el sidecar de la familia, 150.000 documentos (10 %) tienen una reflexión asociada (75.000 mejor puntuados por un clasificador de seguridad y 75.000 benignos), con una media de 36 tokens por reflexión (~0,67 % de los tokens entrenados); este modelo control no las utiliza.

## Capacidades

- Generación de texto causal en rumano: continuación de prompt, completado de documentos y generación libre con muestreo por temperatura.
- Modelado de lenguaje y puntuación de perplejidad sobre texto rumano.
- Razonamiento de cloze a cuatro opciones (89,5 % de acierto en el conjunto de evaluación retenido de 1.000 ítems).
- Token especial `<assistant>` para estructurar turnos en el preentrenamiento, aunque sin ajuste de instrucciones.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento (thinking).
- Multilingüismo limitado: monolingüe en rumano; no se documenta competencia en otras lenguas.

## Casos de uso

- Referencia de control en experimentos de alineación: sirve para comparar el efecto de técnicas de preentrenamiento (SPP, filtrado) sobre el mismo flujo de documentos, midiendo perplejidad y conocimiento retenido sin confundir variables.
- Investigación académica sobre modelos pequeños en lenguas de recursos medios: permite estudiar curvas de escalado y dinámica de entrenamiento en rumano con un presupuesto de cómputo de una sola GPU consumer.
- Evaluación de tokenizadores rumanos: su vocabulario BPE de 16.384 tokens permite analizar la eficiencia de compresión y la cobertura morfológica del rumano frente a tokenizadores multilingües.
- Puntuación de perplejidad para filtrado de corpus: el modelo puede usarse como scorer para detectar documentos anómalos o de baja calidad en un corpus rumano, comparando la perplejidad retenida (18,42 en web general, 26,16 en documentos marcados por el clasificador).
- Docencia y reproducibilidad: su entrenamiento completo en una RTX 3060 de 12 GB lo convierte en un caso práctico para cursos de aprendizaje profundo y para replicar pipelines de preentrenamiento desde cero.
- Base para ajuste fino posterior: al ser un modelo de preentrenamiento puro con licencia MIT, puede servir como punto de partida para SFT o DPO en tareas rumanas específicas, siempre que se acepte su baja capacidad.
- Evaluación de sesgos y seguridad en rumano: la comparación entre perplejidad en documentos marcados y no marcados por el clasificador permite estudiar cómo el filtrado afecta a la representación de contenido sensible.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| Perplejidad, web retenida (1.000 docs) | 18,42 | modelo de referencia de la familia |
| Perplejidad, docs marcados por el clasificador (199 docs) | 26,16 | referencia |
| Perplejidad, docs no marcados (1.000 docs) | 17,82 | no disponible |
| Precisión cloze de 4 vías (1.000 ítems) | 89,5 % | no disponible |
| ConstitutionEval-Ro, letra, 4 rotaciones con debias (azar 25 %), 600 ítems | 27,5 % | no disponible |
| ConstitutionEval-Ro, PMI (azar 25 %), 600 ítems | 38,2 % | no disponible |
| ConstitutionEval-Ro, continuación (azar 25 %), 600 ítems | 19,5 % | no disponible |
| ConstitutionEval-Ro, oro frente a cada distractor (azar 50 %), 600 ítems | 45,2 % | no disponible |

Los cinco modelos de la familia están a nivel de azar en ConstitutionEval-Ro; según el autor, un modelo de 88 M de parámetros no resuelve el benchmark y por tanto no puede mostrar un efecto de alineación a esta escala. El resultado medible es el impuesto de alineación: la variante SPP no cuesta perplejidad, mientras que la variante Filtered pierde conocimiento en los documentos marcados (+1,13 de perplejidad, peor en el 85 % de ellos, test de signos emparejado p ≈ 1e-24). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 352 MB (88,1 M × 4 bytes); en bf16/fp16, unos 176 MB. Con caché KV para contexto completo (12 capas, 4 cabezas KV, dimensión de cabeza 64, 1.024 posiciones) el coste adicional es de unos 12,6 MB en fp16. En la práctica, el modelo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: RTX 3060 12 GB (la misma usada para entrenar), RTX 4060, RTX 4090; también funciona en GPUs de gama de entrada y en CPU.
- Cabe en cualquier GPU consumer actual, incluidas las integradas con suficiente memoria compartida; también en Raspberry Pi y dispositivos similares para inferencia en CPU.
- Opciones de despliegue: transformers (el autor documenta `AutoModelForCausalLM` con `dtype=torch.float32`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica; vLLM y TGI son compatibles con la arquitectura Llama, pero no se documenta su uso con este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento consumió unas 66 horas para 3.280 millones de tokens en una RTX 3060, lo que da una idea del orden de magnitud del cómputo, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spp-ro-base | 88,1 M | 1.024 | rumano | MIT | Hugging Face |
| spp-ro-filtered | no disponible | 1.024 | rumano | MIT (presumible) | misma familia, no disponible en la información |
| spp-ro-spp | no disponible | 1.024 | rumano | MIT (presumible) | misma familia, no disponible en la información |
| Modelos Llama pequeños (p. ej. Llama 3.2 1B) | ~1.240 M | 128.000 | multilingüe | licencia Llama | Hugging Face |

La comparación con modelos de la misma categoría (transformers densos de menos de 100 M de parámetros) no está disponible en la información proporcionada. Las variantes Filtered y SPP de la misma familia son los comparadores naturales, pero sus especificaciones y resultados individuales no se detallan en la información disponible.

## Limitaciones y advertencias

- Tamaño muy reducido (88 M de parámetros): la calidad de generación es limitada y no compite con modelos de miles de millones de parámetros.
- Monolingüe en rumano: no se ha entrenado ni evaluado en otras lenguas.
- Solo preentrenamiento: no hay ajuste de instrucciones ni post-entrenamiento (RLHF, DPO), por lo que no sigue instrucciones de forma fiable.
- Entrenado sobre texto web: reproduce los sesgos de sus datos, incluidos los de género, origen y otros presentes en FineWeb-2 RO, Wikipedia y prensa.
- Riesgo de alucinación: al ser un modelo de continuación, puede generar contenido plausible pero falso, especialmente fuera de los dominios de entrenamiento.
- Contexto corto (1.024 tokens): no apto para tareas que requieran ventanas largas.
- Semilla única: los resultados no incluyen intervalos de confianza por variabilidad de semilla.
- El autor declara explícitamente que no está pensado para uso en producción.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el modelo no ha sido evaluado para seguridad en despliegues reales.
- Los resultados en ConstitutionEval-Ro están a nivel de azar, por lo que no debe interpretarse que el modelo tenga comportamiento alineado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro-base
- Repositorio del proyecto SPP-Ro: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Minder et al., Synthetic Persona Pretraining, EPFL-dlab, 2026): https://arxiv.org/abs/2608.13482
- Evaluaciones y tablas LaTeX: carpeta `evals/` del repositorio de GitHub
