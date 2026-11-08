# IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

ThinkingCap-gemma-4-26B-A4B-it es un ajuste fino de tipo post-entrenamiento sobre el modelo multimodal `gemma-4-26B-A4B-it` de Google DeepMind (2026), desarrollado por bottlecapai. Se trata de un modelo de mezcla de expertos (MoE) con capacidad de entrada de imagen y texto que reduce de forma sustancial la cantidad de tokens de razonamiento generados frente al modelo base, manteniendo una precisión prácticamente idéntica. Es el quinto modelo de la familia ThinkingCap.

La versión que nos ocupa es una cuantización GGUF publicada por IsValorum dentro de su serie APEX, en el nivel MiniPlus (12,03 GiB). Emplea una matriz de importancia (imatrix) calculada sobre el modelo base y una asignación quirúrgica de precisión por tensor: las proyecciones de atención y las MLP densas se mantienen en Q4_K/Q5_K, mientras que los expertos enrutados se comprimen de forma más agresiva (IQ3_XXS, Q3_K, IQ4_NL, Q5_0) y las normalizaciones, el router y las escalas de expertos se conservan en F32. El resultado es un archivo de 12,9 GB que preserva los componentes sensibles a la cuantización.

El modelo es relevante porque combina tres factores poco habituales en un único artefacto: arquitectura MoE con solo ~4B parámetros activos (eficiencia de cómputo), entrada de imagen (pipeline image-text-to-text) y un post-entrenamiento orientado a reducir el "thinking" redundante. La licencia Apache 2.0 y el formato GGUF lo hacen directamente desplegable en llama.cpp y en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4`, transformer MoE con entrada de imagen |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (según el sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta: Q3_K, IQ3_XXS, Q4_K, IQ4_NL, Q5_0, Q5_1, Q5_K, Q6_K, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), 12,9 GB de repo; 12,03 GiB el archivo MiniPlus |
| Modelo base | bottlecapai/ThinkingCap-gemma-4-26B-A4B-it |
| Cuantizador | IsValorum (serie APEX, tier MiniPlus) |
| Imatrix | ThinkingCap-gemma-4-26B-A4B-it-imatrix.gguf (commit bb52b32) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Gemma 4 con 25,2B parámetros totales y aproximadamente 4B activos por token, e incorpora un codificador de imagen para entrada multimodal. ThinkingCap aplica un post-entrenamiento de "razonamiento corto" sobre `gemma-4-26B-A4B-it`: según bottlecapai, reduce los tokens de razonamiento un 38,9 % de media (rango del 14 % al 69 % según el benchmark) con una precisión media del 75,0 % frente al 75,2 % del modelo base. No se detalla en la información disponible la composición del dataset de post-entrenamiento ni si se empleó RLHF o DPO.

La cuantización APEX-I MiniPlus no altera la arquitectura, pero sí la distribución de precisión. La auditoría del GGUF revela 30 bloques con normalizaciones en F32 (`attn_norm`, `attn_q_norm`, `attn_k_norm`, `ffn_norm`, `post_attention_norm`, `post_ffw_norm`, `post_ffw_norm_1`, `post_ffw_norm_2`, `pre_ffw_norm_2`), el router `ffn_gate_inp` en F32 y 271 tensores con protección recurrente en F32. Las proyecciones de atención usan Q4_K (con 5 tensores `attn_output` en Q6_K), las MLP densas Q5_K/Q5_1, y los expertos enrutados se reparten entre IQ3_XXS (10 tensores `ffn_gate_up_exps`), Q3_K (20), IQ4_NL (10 `ffn_down_exps`) y Q5_0 (20). Los embeddings se mantienen en Q6_K y `rope_freqs` en F32.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" acortado respecto al modelo base (hasta 69 % menos tokens de razonamiento en algunos benchmarks).
- Comprensión de imagen y texto (pipeline image-text-to-text), incluyendo preguntas y respuestas sobre imágenes.
- Razonamiento matemático y de sentido común, heredado de Gemma 4.
- Generación de código (capacidad del modelo base; no se aportan benchmarks específicos en la información disponible).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Asistentes conversacionales con contexto multimodal: el modelo puede recibir capturas de pantalla, diagramas o fotografías junto con texto y responder en la misma conversación, lo que permite construir asistentes de soporte que interpretan documentación visual.
- Análisis de documentos e imágenes técnicas: extracción de información de gráficos, tablas o interfaces para tareas de verificación y resumen, aprovechando el pipeline image-text-to-text.
- Razonamiento con presupuesto de tokens ajustado: al reducir los tokens de "thinking" un 38,9 % de media, encaja en pipelines donde la latencia y el coste por consulta son críticos, como clasificación con justificación o extracción estructurada.
- Despliegue en estaciones de trabajo con GPU de consumo: con 12,03 GiB en MiniPlus y ~4B parámetros activos, es viable en GPUs de 16-24 GB de VRAM mediante llama.cpp, sin necesidad de clústeres.
- Prototipado e investigación en local: al ser GGUF con licencia Apache 2.0, sirve para experimentar con modelos MoE multimodales sin restricciones de uso comercial.
- Agentes de razonamiento de varios pasos: la reducción de tokens de pensamiento disminuye el coste acumulado en cadenas de razonamiento largas, útil en agentes que encadenan varias llamadas.
- Aplicaciones de accesibilidad: descripción de imágenes y respuesta a preguntas visuales en tiempo real sobre hardware modesto.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la comparación del modelo base ThinkingCap frente a `gemma-4-26B-A4B-it`:

| Metrica | ThinkingCap gemma-4-26B-A4B-it | gemma-4-26B-A4B-it (base) |
|---|---|---|
| Reduccion de tokens de razonamiento (media) | 38,9 % (rango 14 %-69 %) | referencia |
| Precision media | 75,0 % | 75,2 % |

No se han publicado resultados de benchmarks por tarea (MMLU, HumanEval, GSM8K, etc.) ni mediciones específicas de la cuantización MiniPlus en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~12,03 GiB para el archivo MiniPlus en su totalidad; con offload parcial a CPU puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) con margen, A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con llama.cpp; en 12 GB requeriría offload parcial de capas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros frontends compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles. Al tener ~4B parámetros activos, el coste por token es notablemente inferior al de un denso de 25B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ThinkingCap-gemma-4-26B-A4B-it APEX-I MiniPlus (este) | 25,2B | ~4B | no disponible | Apache 2.0 | GGUF 12,03 GiB | Razonamiento acortado, multimodal |
| ThinkingCap-gemma-4-26B-A4B-it APEX-I NanoPlus | 25,2B | ~4B | no disponible | Apache 2.0 | GGUF 9,92 GiB | Misma base, menor huella |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it | 25,2B | ~4B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo base sin cuantizar |
| gemma-4-26B-A4B-it (Google DeepMind) | 25,2B | ~4B | no disponible | no disponible | no disponible | Modelo original; ThinkingCap reduce tokens de razonamiento un 38,9 % con -0,2 pp de precisión |

## Limitaciones y advertencias

- La cuantización mixta agresiva en los expertos enrutados (IQ3_XXS, Q3_K) puede degradar tareas sensibles a precisión numérica; no hay evaluaciones publicadas de la pérdida específica de esta cuantización.
- Riesgo de alucinación inherente a los modelos de lenguaje; el acortamiento del razonamiento puede aumentar la probabilidad de respuestas incorrectas en problemas de varios pasos.
- El modelo base está entrenado para "pensar menos"; en tareas que requieren cadenas de razonamiento largas puede rendir peor que el Gemma 4 original.
- Idiomas soportados no documentados en esta ficha; verificar el comportamiento multilingüe antes de usarlo en producción.
- Longitud de contexto no disponible; no asumir ventanas largas sin comprobarlo en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google DeepMind por si imponen condiciones adicionales.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.
- El autor declara que el cálculo se hizo con recursos propios; no hay auditoría independiente de la calidad de la imatrix ni del mapa de tensores más allá de la tabla publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-NanoPlus-V2.1-GGUF (tier NanoPlus)
- Repositorio de esta ficha: https://huggingface.co/IsValorum/ThinkingCap-gemma-4-26B-A4B-it-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- GGUF del modelo base con imatrix: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it-GGUF
- Blog de bottlecapai: https://bottlecapai.com/post/thinkingcap-gemma-4-26b/
- Apoyo al cuantizador: https://ko-fi.com/isvalorum
