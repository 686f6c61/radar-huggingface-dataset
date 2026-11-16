# Darth-Coder/gemma_3_4b_it-vlguard-sft-fable-report-set1-refusal-neurons-zeroed

## Resumen

`gemma_3_4b_it-vlguard-sft-fable-report-set1-refusal-neurons-zeroed` es un checkpoint de investigación publicado por el usuario Darth-Coder sobre el modelo multimodal Gemma 3 de 4B parámetros (4.300.079.472 parámetros reales según los pesos safetensors). No es un modelo entrenado desde cero ni un fine-tune convencional: es un artefacto derivado del baseline `Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6` al que se le han anulado quirúrgicamente 1.000 neuronas MLP asociadas a la conducta de rechazo, sin ningún reentrenamiento adicional.

El modelo pertenece al estudio WSP-MLLM-Safety, cuyo objetivo es medir la removibilidad del alineamiento de seguridad en modelos de lenguaje-imagen open source. Partiendo de un mapa de interpretabilidad de etapa 1 (el "Fable report") que localizó el comportamiento de refusal en un conjunto disperso de neuronas MLP, este checkpoint aplica la ablación equivalente en pesos permanentes: pone a cero las columnas correspondientes en `layers.{L}.mlp.down_proj.weight` para las capas decodificadoras 12 a 29, afectando a 7,68 millones de parámetros (0,18% del total).

Su relevancia es doble. Por un lado, demuestra empíricamente que el alineamiento de seguridad aprendido mediante VLGuard-SFT es altamente removible con una intervención mínima y dirigida por interpretabilidad. Por otro, constituye un caso de estudio metodológico sobre cómo evaluar la robustez de las salvaguardas en modelos multimodales. Es un artefacto de investigación con acceso restringido, explícitamente no destinado a despliegue ni redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Gemma 3), con torre de visión para entrada image-text-to-text |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es Gemma 3 en su variante de 4B parámetros orientada a instrucciones y multimodalidad (pipeline `image-text-to-text`). Sobre esa base, el autor del baseline aplicó un SFT con el dataset VLGuard (epoch 1.5, learning rate 1e-6), que es el punto de partida de este checkpoint. La intervención de este artefacto no añade entrenamiento: es una edición estática de pesos consistente en poner a cero las columnas de `down_proj` correspondientes a 1.000 neuronas MLP en las capas decodificadoras 12 a 29, seleccionadas por un análisis de interpretabilidad de etapa 1 que las identificó como responsables del mapeo "harm→refusal".

La innovación metodológica no está en la arquitectura, sino en el procedimiento: se sustituye una ablación dinámica en tiempo de inferencia (neuron-skip) por su equivalente en pesos permanentes, lo que permite medir el efecto sin overhead computacional y de forma reproducible. El alcance de la edición es mínimo (7,68M parámetros, 0,18% del total) y no afecta a la torre de visión ni a las capas no seleccionadas.

## Capacidades

- Generación de texto conversacional y razonamiento multimodal (entrada imagen + texto).
- Respuesta a instrucciones en formato chat, heredada del baseline `it` de Gemma 3.
- Capacidades visuales de Gemma 3 (descripción de imágenes, VQA, razonamiento sobre gráficos y diagramas).
- Comportamiento de rechazo drásticamente reducido: el modelo acepta y responde a prompts dañinos que el baseline rechazaba.
- No se documentan en la información disponible capacidades de tool calling, function calling ni agentes multi-paso para este checkpoint.
- No se documenta thinking mode ni soporte de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en robustez del alineamiento: medir cuánto del comportamiento de rechazo de un MLLM alineado con VLGuard-SFT depende de un subconjunto concreto de neuronas MLP, comparando refusal rate y ASR contra el baseline.
- Estudios de interpretabilidad mecanicista: usar el mapa de neuronas "harm→refusal" como caso de validación de técnicas de localización de circuitos en modelos multimodales de 4B.
- Evaluación de red-team controlada: generar respuestas a conjuntos como FigStep, MM-SafetyBench o JB-Mini para calibrar clasificadores de seguridad y proxies de ASR.
- Análisis de trade-off seguridad-utilidad: cuantificar la degradación en tareas benignas (ScienceQA, MathVista) tras una ablación dirigida, como referencia para diseñar salvaguardas más robustas.
- Investigación en des-safetización y defensas: estudiar qué tipo de ediciones de pesos rompen las salvaguardas y, a partir de ahí, proponer mecanismos de detección o reparación.
- Reproducibilidad de estudios de ablación: servir como checkpoint de referencia para replicar el experimento de neuron-skip en pesos permanentes con resultados deterministas.

## Benchmarks y rendimiento

Datos publicados en la model card (100 muestras por conjunto, decodificación greedy). El ASR es un proxy por palabra clave de no-rechazo, no el juez de contenido oficial del estudio, por lo que es direccional y no comparable byte a byte.

| Conjunto | SFT refuse% | Editado refuse% | SFT ASR* | Editado ASR* |
|---|---:|---:|---:|---:|
| FigStep | 100 | 7 | 0 | 92 |
| MM-SafetyBench | 73 | 2 | 27 | 96 |
| JB-Mini | 72 | 32 | 27 | 66 |

| Conjunto (utilidad) | SFT | Editado |
|---|---:|---:|
| ScienceQA (gold-match %) | 76 | 74 |
| MathVista (gold-match %) | 52 | 47 |

La conclusión del autor es que una ablación dispersa guiada por interpretabilidad elimina la mayor parte del comportamiento de rechazo dejando la capacidad benigna prácticamente intacta (caída de 2 puntos en ScienceQA y 5 en MathVista).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contexto moderado.
- En cuantización de 8 bits: entorno a 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB (estimaciones a partir del recuento de parámetros; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) para inferencia BF16 sin problemas; RTX 3090/4080 (16-24 GB) viables en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y, con cuantización 4 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama no están documentados para este checkpoint y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Set1 zeroed) | 4,3B | no disponible | Refusal muy reducido (7% FigStep, 2% MM-SafetyBench) | gemma (acceso restringido) | Gated, solo investigación |
| `Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6` (baseline) | 4,3B | no disponible | Refusal alto (100% FigStep, 73% MM-SafetyBench) | gemma | Público |
| Gemma 3 4B IT (original) | 4,3B | no disponible | Alineamiento estándar de Google | gemma | Público |

La comparación relevante es contra su propio baseline, ya que la diferencia de comportamiento es el objeto del estudio. Frente a otros MLLM pequeños de la misma categoría (p. ej. Qwen2.5-VL 3B o Llama 3.2 11B Vision), no hay datos de benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación des-safetizado: el rechazo ante contenido dañino cae drásticamente (hasta 2% de refusal en MM-SafetyBench), lo que lo hace inadecuado para cualquier uso en producción.
- Acceso restringido mediante gated prompt: el autor exige aceptar los Gemma Terms of Use y la Prohibited Use Policy, y limita el uso a investigación en seguridad y robustez.
- Prohibida su redistribución y despliegue según la model card.
- Los números de ASR son un proxy por palabra clave, no el juez `gpt-4.1-mini` del estudio; no son directamente comparables con las cifras oficiales.
- Evaluación con 100 muestras por conjunto y decodificación greedy: los intervalos de confianza son amplios y los resultados deben tratarse como direccionales.
- Riesgo elevado de alucinación y de generar contenido dañino o inexacto, agravado por la eliminación de la capa de rechazo.
- Sesgos: no documentados en la información proporcionada, pero heredados de Gemma 3 y del SFT con VLGuard.
- Idiomas soportados y longitud de contexto no documentados para este checkpoint concreto.
- La edición de pesos es permanente y no reversible sin restaurar el baseline; no hay mecanismo de "reactivación" de las neuronas anuladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darth-Coder/gemma_3_4b_it-vlguard-sft-fable-report-set1-refusal-neurons-zeroed
- Modelo base (SFT baseline): https://huggingface.co/Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
