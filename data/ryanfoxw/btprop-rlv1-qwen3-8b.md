# RyanFoxW/btprop-rlv1-qwen3-8b

## Resumen

BTProp RL v1 es un modelo de generación de variantes de perturbación, desarrollado por RyanFoxW dentro del programa BENGAL, que parte del modelo base Qwen/Qwen3-8B y se entrena con GRPO (Group Relative Policy Optimization) mediante el framework verl. Su propósito no es ser un modelo conversacional ni un verificador de hechos, sino un componente especializado dentro de un pipeline de detección de alucinaciones: dado un enunciado atómico (una afirmación que no puede descomponerse), genera variantes semánticamente cercanas (sinónimos, apoyos, contradicciones o no relacionadas) que, al ser evaluadas contra la misma evidencia recuperada, permiten inferir si la afirmación original es verdadera o falsa.

El problema que resuelve es la fragilidad de los métodos de verificación basados únicamente en evidencia: cuando la evidencia es demasiado escasa para refutar directamente una afirmación falsa, las variantes generadas por el modelo actúan como "vecinos" en el espacio de afirmaciones, y su desacuerdo con la original revela la falsedad. El modelo está optimizado para producir variantes que muevan el posterior agregado hacia la verdad, en lugar de variantes que simplemente parezcan plausibles. Con 8.190 millones de parámetros y una ventana de contexto de 32.768 tokens, es un modelo de tamaño medio que se sirve eficientemente con vLLM.

La relevancia actual radica en que aborda un cuello de botella concreto en sistemas de verificación factual: el generador de variantes. Frente al modelo base sin entrenar, que produce 3,94 variantes por afirmación con un 46% de ruido no relacionado, este modelo genera 1,00 variantes por afirmación con un 96% de sinónimos, mejorando el AUROC del pipeline en +0,0207 puntos respecto a la línea base sin variantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B, decoder-only) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (formato nativo, sin cuantizacion adicional publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only Qwen3-8B, entrenado con GRPO (Group Relative Policy Optimization) implementado en verl. El entrenamiento se realizó durante 3 épocas (258 pasos) con un batch de 21, coeficiente de pérdida KL de 0,001, y una recompensa compuesta que penaliza variantes no relacionadas o idénticas, penaliza el exceso de variantes más allá de un máximo, y premia el movimiento del posterior agregado hacia la etiqueta dorada. Los datos de entrenamiento provienen de afirmaciones atómicas de los datasets exfever, hover, scifact e ifqa_train, disjuntos por dataset de todos los conjuntos de evaluación, garantizando que no hay fuga de datos.

La innovación técnica clave es que la recompensa se construye a partir del agregado posterior del pipeline completo (no solo de la plausibilidad superficial de las variantes), lo que fuerza al modelo a optimizar para variantes que realmente ayudan a la clasificación final. El resultado es una política que converge a generar una única paráfrasis limpia (colapso de variante única), que es el comportamiento más seguro según la recompensa diseñada, pero que limita la diversidad de perturbaciones.

## Capacidades

- Genera variantes de perturbación de afirmaciones atómicas, etiquetadas con su relación semántica respecto a la original: `synonym`, `support`, `contradict` o `unrelated`.
- Optimizado para producir variantes que muevan el posterior de un clasificador de veracidad hacia la etiqueta correcta, no variantes que simplemente parezcan plausibles.
- No es un modelo de chat ni de razonamiento general: el comportamiento conversacional del modelo base no se conserva intacto.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso explícito.
- Solo funciona en inglés, y está afinado para afirmaciones de tipo enciclopédico (los seis datasets de evaluación: factchd, factcheckgpt, felm, wikibio, wiqa, ifqa).
- No tiene capacidades de visión ni audio.

## Casos de uso

- Detección de alucinaciones en sistemas de generación de texto: el modelo se integra en un pipeline que, dada una afirmación generada por un LLM, produce variantes y las evalúa contra evidencia recuperada para decidir si la afirmación es fiable. Es adecuado porque su recompensa está alineada con el rendimiento del agregador final.
- Verificación factual de afirmaciones atómicas en dominios enciclopédicos: útil para validar hechos en artículos de Wikipedia, respuestas de QA o resúmenes generados automáticamente, donde la evidencia puede ser escasa.
- Mejora de sistemas de búsqueda de evidencia: al generar variantes sinónimas, puede ayudar a expandir consultas de recuperación de documentos relevantes para una afirmación dada.
- Evaluación de robustez de clasificadores de veracidad: las variantes generadas pueden usarse como ataques o pruebas de estrés para medir la sensibilidad de un verificador ante reformulaciones.
- Componente en sistemas de razonamiento multi-hop: aunque no es un agente, sus variantes pueden alimentar módulos de razonamiento que necesitan explorar diferentes formulaciones de una misma afirmación.
- Investigación en aprendizaje por refuerzo para generación controlada: sirve como caso de estudio de cómo una recompensa basada en el agregado downstream puede moldear la salida de un generador.

## Benchmarks y rendimiento

La model card reporta resultados sobre 1.899 afirmaciones atómicas de seis datasets (factchd, factcheckgpt, felm, wikibio, wiqa, ifqa), con evidencia recuperada por un modelo más grande (Qwen3.5-122B-A10B) y un juez y agregación idénticos en todos los brazos. La única diferencia es el generador de variantes.

| Generador | AUROC | PRAUC | Acc | BestAcc | Variantes/afirmacion |
|---|---|---|---|---|---|
| Ninguno (prior solo evidencia) | 0,8622 | 0,8200 | 79,30 | 79,83 | — |
| Qwen3-8B, prompting | 0,8512 | 0,8119 | 78,99 | 79,04 | 3,94 |
| **Este modelo** | **0,8719** | **0,8400** | **80,41** | **80,46** | **1,00** |

El modelo supera al prior sin variantes en +0,0097 AUROC, y recupera el déficit que introducía el generador con prompting (+0,0110), resultando en una mejora neta de +0,0207 sobre el prior. Gana en los cinco datasets con etiquetas utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16 (8.190 millones de parámetros × 2 bytes).
- GPU recomendada: una GPU con al menos 16 GB de VRAM, por ejemplo NVIDIA A100 40 GB, RTX 4090 (24 GB) o similar. El entrenamiento se realizó en 8×A100 80 GB, pero la inferencia es viable en una sola GPU de gama alta.
- Cabe en GPUs de consumo: sí, en una RTX 4090 o RTX 3090 (24 GB) con margen para el contexto de 32K tokens.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--tensor-parallel-size 1` y `--max-model-len 32768`), también puede servirse con TGI o llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se han publicado mediciones específicas. Con vLLM en una A100, se espera un throughput típico para un modelo de 8B en bf16, del orden de cientos de tokens por segundo en batch, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoría (generadores de variantes de perturbación para detección de alucinaciones). La comparación más relevante es contra el modelo base sin entrenar:

| Modelo | Parametros | Contexto | AUROC (pipeline) | Variantes/afirmacion | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B (base, prompting) | 8.190 M | 32.768 | 0,8512 | 3,94 | Apache-2.0 |
| **BTProp RL v1** | 8.190 M | 32.768 | **0,8719** | **1,00** | Apache-2.0 |

Otras alternativas de verificación factual (como FactScore o SAFE) no son modelos generadores de variantes, sino pipelines completos, por lo que no son comparables directamente.

## Limitaciones y advertencias

- Colapso de variante única: el modelo converge a generar una sola paráfrasis limpia, lo que reduce la diversidad de perturbaciones. El autor indica que diseños de recompensa que premien variantes informativas `contradict` o `support` son el siguiente paso.
- Dependencia de la evidencia: los resultados reportados usan evidencia recuperada por un modelo más grande (Qwen3.5-122B-A10B). Con evidencia recuperada por un modelo de 8B, los números absolutos son más bajos para todos los brazos, aunque la comparación entre brazos sigue siendo válida.
- Solo inglés: no soporta otros idiomas, y está afinado para afirmaciones enciclopédicas de los seis datasets de evaluación.
- No es un modelo de propósito general: su comportamiento de chat y razonamiento del base no se conserva; no debe usarse fuera de la tarea de generación de variantes.
- Riesgo de alucinación: aunque el modelo está entrenado para producir variantes semánticamente relacionadas, no se garantiza que todas las variantes sean correctas; el pipeline completo debe validar la relación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es un componente de un sistema más amplio; el autor no proporciona el repositorio de evaluación completo en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanFoxW/btprop-rlv1-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Contacto del autor: ryanwsy@icloud.com (mencionado en la model card)
