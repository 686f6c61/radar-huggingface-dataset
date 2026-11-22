# OliverSieberling/triadic-gdn-e4-1.3b-64k

## Resumen

Triadic GDN E4 1.3B 64k es un checkpoint de investigación publicado por Oliver Sieberling (con coautores de la Universidad de Maryland y otros centros) que implementa la arquitectura Triadic Linear Attention, una variante de atención lineal recurrente basada en Gated DeltaNet con un estado recurrente tridimensional. El modelo resuelve el problema del coste cuadrático de la atención estándar en contextos largos, ofreciendo una alternativa de atención lineal con estado recurrente que escala a 64k tokens sin el crecimiento cuadrático de memoria y cómputo asociado a los transformers clásicos.

El modelo tiene 1.368,9 millones de parámetros, 24 capas, dimensión de modelo 2048 y 16 cabezas, con una dimensión de segunda clave E = 4. Fue preentrenado con 65.000 millones de tokens de FineWeb-Edu a contexto de 4k y posteriormente extendido a 64k con 6.800 millones de tokens adicionales. Usa el tokenizador de Llama-2.

Es relevante como artefacto de investigación para estudiar arquitecturas de atención lineal y mecanismos de memoria recurrente en contextos largos, no como modelo listo para producción: no tiene pipeline definido, requiere código propio y una GPU H100 según el autor, y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal recurrente (Gated DeltaNet triádico, E=4) |
| Parametros totales | 1.368.887.296 (1,37B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (preentrenado a 4k, extendido a 64k) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 24 |
| Dimension de modelo (d_model) | 2048 |
| Cabezas de atencion | 16 |
| Dimension de segunda clave (E) | 4 |
| Tokenizador | Llama-2 |
| Tokens de preentrenamiento | 65B (4k) + 6,8B (extensión a 64k) |
| Dataset | FineWeb-Edu |
| Tamano del repo | 5,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas con d_model 2048 y 16 cabezas que sustituye la atención softmax estándar por un mecanismo de atención lineal recurrente denominado Triadic Gated DeltaNet. La innovación central es un estado recurrente tridimensional (de ahí "triadic") con una segunda dimensión de clave E = 4, que permite mantener memoria comprimida sobre secuencias largas con coste lineal respecto a la longitud de contexto. El paper de referencia es *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529), de Sieberling, Runwal, Jin, Chin, Panda y Kim.

El entrenamiento consta de dos fases: un preentrenamiento con 65.000 millones de tokens de FineWeb-Edu a contexto de 4k, seguido de una extensión de contexto a 64k con 6.800 millones de tokens adicionales. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores; se trata de un checkpoint base preentrenado. El tokenizador es el de Llama-2, lo que facilita la comparación con modelos de esa familia.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto de hasta 64k tokens.
- Razonamiento sobre documentos largos: el modelo fue evaluado en PG19 hasta 64k y en tareas de recuperación (Recall) y aguja en el pajar (NIAH).
- Capacidad de recuperación de información en contexto largo, con puntuaciones de 43,2 en Recall y 37,9 en NIAH (0-shot), lo que indica un rendimiento moderado, no perfecto, en tareas de memoria a larga distancia.
- Modelado de lenguaje general: WikiText con perplejidad 7,93.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Multilingüismo: solo inglés declarado en la model card.

## Casos de uso

- Investigación en atención lineal: el modelo sirve como referencia reproducible para estudiar Gated DeltaNet triádico y comparar perplejidad y recuperación frente a transformers con atención softmax en contextos de 4k a 64k.
- Evaluación de extensión de contexto: permite analizar cómo se degrada la perplejidad en PG19 a medida que crece la ventana (10,78 en ≤4k, 10,21 en 4k–16k, 9,99 en 16k–64k), útil para validar técnicas de extensión de contexto.
- Experimentos de memoria recurrente: el estado tridimensional con E=4 es un objeto de estudio para medir la capacidad de compresión de información en secuencias largas mediante tareas NIAH y Recall.
- Reproducción de benchmarks de contexto largo: sirve para replicar las métricas publicadas y compararlas con arquitecturas alternativas (Mamba, RWKV, DeltaNet estándar) en el mismo dataset y tokenizador.
- Base para fine-tuning académico: al estar bajo licencia MIT y con tokenizador Llama-2, puede adaptarse a tareas downstream en inglés con contexto largo, siempre que se disponga del código de inferencia.
- Estudio de eficiencia computacional: permite medir empíricamente el coste lineal de la atención frente al cuadrático en GPUs de datacenter, aunque el autor indica que requiere H100.

## Benchmarks y rendimiento

Resultados 0-shot publicados en la model card:

| Metrica | Valor |
|---|---|
| 0-shot (agregado) | 60,9 |
| WikiText (perplejidad) | 7,93 |
| PG19 ≤4k (perplejidad) | 10,78 |
| PG19 4k–16k (perplejidad) | 10,21 |
| PG19 16k–64k (perplejidad) | 9,99 |
| Recall | 43,2 |
| NIAH | 37,9 |

No se han publicado en la información disponible resultados comparativos con MMLU, HumanEval, GSM8K ni tablas frente a modelos similares. No se inventan cifras adicionales.

## Requisitos de hardware

- El autor indica explícitamente que el modelo requiere una H100 y el código del repositorio TriadicLinearAttention para su ejecución.
- VRAM estimada para inferencia: no disponible de forma oficial; con 1,37B parámetros en fp16 serían aproximadamente 2,7 GB de pesos, pero el estado recurrente y el código custom pueden elevar el consumo, y no hay datos publicados.
- GPU recomendadas: H100 según el autor; no se documenta compatibilidad con A100, RTX 4090 ni otras GPU consumer.
- No se confirma que quepa en GPU consumer; la dependencia de H100 y de código propio sugiere que no es un modelo listo para entornos domésticos.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; solo carga manual con safetensors y el módulo `model.py` del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan únicamente las características estructurales conocidas frente a alternativas de la misma categoría (modelos pequeños de contexto largo con atención lineal o recurrente), indicando "no disponible" donde no hay datos.

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue estandar |
|---|---|---|---|---|---|
| Triadic GDN E4 1.3B 64k | 1,37B | 64k | MIT | safetensors | Código propio, H100 |
| Alternativas de atención lineal (p. ej. Mamba, RWKV, DeltaNet) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos transformer pequeños de contexto largo (p. ej. Llama-2 1.3B-like) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas de rendimiento con modelos concretos en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline definido, sin descargas ni validación comunitaria; no apto para producción sin evaluación propia.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Rendimiento moderado en recuperación en contexto largo: Recall 43,2 y NIAH 37,9, lo que implica que puede fallar en tareas que exigen recuperar información exacta en ventanas de 64k.
- Riesgo de alucinación inherente a un modelo base preentrenado sin alineación (no se documenta RLHF/DPO).
- Requiere H100 y código custom (TriadicLinearAttention); no hay soporte para stacks estándar como vLLM, llama.cpp u Ollama.
- No se documentan sesgos específicos, pero al entrenarse con FineWeb-Edu en inglés hereda los sesgos de ese corpus.
- Licencia MIT permite uso comercial, pero la falta de validación y de soporte de despliegue desaconseja su uso en entornos comerciales sin pruebas exhaustivas.
- No se documentan cuantizaciones oficiales; el repo solo contiene safetensors.
- La fecha de creación del repositorio (2026-11-22) y el arXiv asociado (2609.36529) son coherentes con la información proporcionada; no se dispone de más contexto sobre su madurez.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e4-1.3b-64k
- Paper: https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
