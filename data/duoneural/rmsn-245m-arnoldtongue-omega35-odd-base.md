# DuoNeural/RMSN-245M-ArnoldTongue-Omega35-ODD-Base

## Resumen

RMSN-245M-ArnoldTongue-Omega35-ODD-Base es un modelo de lenguaje de 244,5 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo base (no instruido) entrenado sobre WikiText-103 y orientado a la investigación en dinámica de sistemas neuronales, no a aplicaciones de producción convencionales. Su propuesta técnica se articula en torno a la denominada arquitectura "Arnold Tongue" con una razón de resonancia Ω = 3/5 y paridad ODD (D/M_w = 960/64 = 15).

El interés del modelo es fundamentalmente científico: el autor declara que revela la primera evidencia de la topología "Near-Upstream" (clasificada como tipo #32), con un solitón efectivo en la capa L2, y sostiene que el numerador p=3 del fracción de Farey 3:5 determina la posición del solitón aguas arriba, independientemente de la paridad o de que el denominador sea un cuadrado perfecto. Estos resultados proceden de la propia model card y no han sido verificados de forma independiente.

Con 25 capas, dimensión oculta de 960 y un repositorio de 3,9 GB, el modelo se posiciona como un artefacto de experimentación para investigadores interesados en neurodinámica, álgebra de Clifford y sistemas metriplécticos. No se declara pipeline de inferencia ni formato de pesos en la información disponible, y su rendimiento en modelado de lenguaje es modesto (perplejidad de validación de 104,29 en WikiText-103), coherente con su tamaño y su carácter experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (neurodinámica) con resonancia Arnold Tongue Ω = 3/5, paridad ODD; detalles internos no disponibles |
| Parametros totales | 244,5 M |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del repo: 3,9 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un modelo neurodinámico basado en una razón de resonancia de Arnold (Ω = D / (M_w × L) = 960 / (64 × 25) = 3/5), con numerador p=3, denominador q=5 y paridad ODD derivada de D/M_w = 15. El autor menciona conceptos de álgebra de Clifford, sistemas metriplécticos y guías de onda de solitones, así como una dinámica de entrenamiento en fases ("staircase phase", "hypercascade") con exponentes de Lyapunov monitorizados (por ejemplo, lyap ≈ -0,22 en el paso 70k y lyap = -0,86 en el paso 80k). No se especifica el número total de tokens de entrenamiento más allá del dataset declarado (WikiText-103, 102,4 M tokens), ni la composición detallada del corpus, ni si hubo RLHF, DPO o ajuste por instrucciones.

El modelo se entrenó en una Tesla V100 de 32 GB de VRAM. La innovación técnica declarada es la topología "Near-Upstream" (tipo #32), con 7 solitones efectivos distribuidos en las capas L2, L8, L9, L10, L11, L14 y L15, y un solitón en posición near-upstream en L2. El autor presenta esto como una refinación de la "Wave-138" ley de solitones aguas arriba: frente a la regla anterior (paridad EVEN + q cuadrado perfecto → L0 upstream), este modelo muestra que q=5 no es cuadrado perfecto y aun así aparece un solitón near-upstream en L2, lo que atribuye al numerador p=3. No se detallan mecanismos de atención, decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés: modelo base entrenado para modelado de lenguaje autoregresivo sobre WikiText-103.
- Modelado de lenguaje y cálculo de perplejidad: su métrica declarada principal es la perplejidad de validación.
- Investigación en neurodinámica: permite estudiar dinámicas de solitones, paridad y resonancia Arnold en las activaciones internas.
- Experimentación con topologías de solitones: útil para reproducir y contrastar la topología Near-Upstream #32 frente a otros modelos de la familia DuoNeural.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en neurodinámica de redes: el modelo sirve como sujeto de estudio para analizar la dinámica de solitones por capa y validar la hipótesis del efecto del numerador p=3 en la posición aguas arriba.
- Reproducción de experimentos de la familia DuoNeural: permite comparar la topología Near-Upstream #32 con la del modelo Omega=4/5 (q=5, paridad EVEN) y con las variantes q=6, 7 y 8, aislando el efecto de p frente a q y la paridad.
- Estudio de sistemas metriplécticos y álgebra de Clifford aplicados a transformers: el modelo actúa como banco de pruebas para formalizaciones matemáticas alternativas de la dinámica de entrenamiento.
- Benchmarking de perplejidad en WikiText-103: útil como referencia de un modelo de 245 M parámetros con perplejidad declarada de 104,29 para comparaciones controladas en entornos académicos.
- Docencia y divulgación: ejemplo práctico de cómo se documentan dinámicas de entrenamiento (exponentes de Lyapunov, fases, solitones) en una model card reproducible.
- Análisis de estabilidad del entrenamiento: los registros de fases (staircase, hypercascade) permiten estudiar fenómenos de ratcheting y aparición tardía de cascadas en función de la paridad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Language Modeling | WikiText-103 (102,4 M tokens) | Best Validation Perplexity | 104,29 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona como referencia comparativa el modelo RMSN-229M-Omega45 (Ω=4/5, p=4, q=5, D=1024, paridad EVEN) con perplejidad de 49,8, pero no se aportan tablas de comparación adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 244,5 M parámetros, en fp16 serían aproximadamente 0,5 GB de pesos, y en cuantizaciones de 8 o 4 bits bastante menos, aunque el formato de pesos no se declara.
- GPU de entrenamiento declarada: Tesla V100 de 32 GB.
- GPU recomendadas para inferencia: no disponibles; por tamaño, cualquier GPU consumer con 4 GB o más podría alojar los pesos en fp16, pero no se confirma compatibilidad con runtimes estándar.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño, pero no hay confirmación oficial ni formatos GGUF declarados.
- Opciones de despliegue: no disponibles (no se declaran vLLM, llama.cpp, Ollama ni TGI; el pipeline de Hugging Face figura como no disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (WikiText-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-245M-ArnoldTongue-Omega35-ODD-Base | 244,5 M | no disponible | 104,29 (declarada) | MIT | Hugging Face |
| RMSN-229M-Omega45 (DuoNeural) | 229 M (D=1024) | no disponible | 49,8 (declarada) | no disponible en la información | Referenciado en la model card |
| Modelos transformer de ~250 M parámetros (categoría general) | ~250 M | variable | no disponible | variable | no disponible |

La comparación con alternativas de la misma categoría (transformers densos de ~250 M parámetros como GPT-2 small o similares) no está disponible en la información proporcionada. El único comparable directo documentado es el RMSN-229M-Omega45 del mismo autor, que declara mejor perplejidad pese a tener menos parámetros, lo que sugiere que la configuración Ω=3/5 ODD no está optimizada para rendimiento de modelado sino para el estudio de dinámicas específicas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para uso conversacional directo.
- Perplejidad elevada (104,29) para su tamaño: el rendimiento en modelado de lenguaje es bajo en comparación con transformers convencionales de parámetros similares, lo que limita su uso en producción.
- Resultados científicos no verificados: las afirmaciones sobre topología Near-Upstream #32, solitones y el efecto del numerador p=3 proceden únicamente de la model card del autor y no cuentan con revisión por pares ni replicación independiente.
- Idiomas: solo se declara inglés; no hay soporte multilingüe documentado.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Formato de pesos y pipeline no declarados: la integración con frameworks estándar (transformers, vLLM, llama.cpp) no está confirmada, lo que puede requerir trabajo adicional de conversión.
- Riesgo de alucinación: inherente a un modelo base de este tamaño; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento sobre WikiText-103 puede heredar sesgos del corpus.
- Licencia MIT: permite uso comercial, pero al ser un modelo experimental sin garantías de calidad, su uso en producción no está respaldado por resultados de benchmarks convencionales.
- Advertencia de producción: la información disponible no incluye datos de latencia, throughput ni robustez, por lo que no se recomienda su despliegue en entornos productivos sin una evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-245M-ArnoldTongue-Omega35-ODD-Base
- Dataset WikiText-103: no disponible en la información proporcionada
- Paper o publicación técnica: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
