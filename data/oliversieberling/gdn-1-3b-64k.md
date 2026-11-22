# OliverSieberling/gdn-1.3b-64k

## Resumen

Gated DeltaNet 1.3B 64k es un checkpoint de investigación publicado por Oliver Sieberling (con la colaboración de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim) asociado al artículo *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529). Se trata de un modelo de lenguaje de 1.360 millones de parámetros basado en atención lineal con compuertas del tipo Gated DeltaNet, diseñado específicamente para explorar el modelado de secuencias de contexto largo sin el coste cuadrático de la atención estándar.

El modelo parte de un preentrenamiento sobre 65.000 millones de tokens de FineWeb-Edu con una ventana de 4k tokens, y posteriormente extiende su contexto hasta 64k tokens mediante un entrenamiento adicional de 6.800 millones de tokens. La arquitectura consta de 24 capas con dimensión de modelo 2048 y 16 cabezas, y utiliza el tokenizador de Llama-2. Su relevancia radica en que sirve como referencia empírica para evaluar si los estados recurrentes tridimensionales propuestos en el paper mejoran la retención de información en contextos largos frente a alternativas de atención lineal.

El checkpoint se distribuye en formato safetensors con licencia MIT y está etiquetado únicamente para inglés. No cuenta con descargas ni interacciones en el momento de la consulta, y su uso requiere el código del repositorio TriadicLinearAttention, además de una GPU H100 según indica el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (Gated DeltaNet, estados recurrentes tridimensionales) |
| Parámetros totales | 1.360.221.952 (1,36B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (preentrenado a 4k, extendido a 64k) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura de atención lineal basada en Gated DeltaNet con estados recurrentes tridimensionales, según la propuesta del artículo *Triadic Linear Attention*. Consta de 24 capas, dimensión de modelo 2048 y 16 cabezas de atención. Emplea el tokenizador de Llama-2, lo que facilita la compatibilidad con herramientas y pipelines existentes del ecosistema Llama. La innovación principal reside en el mecanismo de atención lineal con compuertas, que sustituye la atención cuadrática por una recurrencia con estado comprimido, permitiendo procesar secuencias de hasta 64k tokens con coste lineal.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre 65.000 millones de tokens de FineWeb-Edu con contexto de 4k tokens, seguido de una fase de extensión de contexto hasta 64k tokens con 6.800 millones de tokens adicionales. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al preentrenamiento. El autor no detalla la composición exacta del dataset de extensión ni la estrategia de mezcla de longitudes durante esa fase.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Modelado de secuencias largas de hasta 64k tokens gracias a la atención lineal.
- Evaluación de recuperación de información en contexto (Recall y NIAH) según los resultados reportados por el autor.
- Modelado de lenguaje sobre documentos extensos (evaluado en PG19 hasta 64k).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en atención lineal: el modelo sirve como checkpoint de referencia para reproducir y comparar los resultados del paper *Triadic Linear Attention* frente a arquitecturas transformer estándar en tareas de contexto largo.
- Modelado de documentos extensos: con 64k tokens de contexto, puede procesar libros completos o informes largos en una sola pasada, útil para tareas de summarization o análisis de documentos técnicos.
- Evaluación de recuperación en contexto largo: adecuado para experimentos tipo NIAH (Needle in a Haystack) y pruebas de recall sobre pasajes distribuidos en ventanas de hasta 64k tokens.
- Fine-tuning para dominios específicos en inglés: al usar el tokenizador de Llama-2 y licencia MIT, puede adaptarse a tareas de clasificación o generación especializada sobre corpus en inglés.
- Benchmarking de eficiencia: su atención lineal permite medir el ahorro de memoria y cómputo frente a transformers densos en secuencias largas, útil en estudios de escalado de contexto.
- Prototipado académico: como checkpoint de investigación con código abierto, sirve para validar hipótesis sobre estados recurrentes tridimensionales en entornos de laboratorio con acceso a H100.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (0-shot):

| Métrica | Valor |
|---|---|
| WikiText | 8,08 |
| PG19 ≤4k | 10,91 |
| PG19 4k–16k | 10,38 |
| PG19 16k–64k | 10,20 |
| Recall | 36,1 |
| NIAH | 31,0 |

No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos (1,36B parámetros × 2 bytes), más memoria para estados recurrentes y activaciones; el autor indica que requiere una H100, probablemente por la implementación de referencia y el contexto de 64k.
- GPU recomendadas: H100 según la model card; no se documentan otras opciones.
- Compatibilidad con GPU de consumo: no confirmada; el peso en fp16 cabría en GPUs con 8 GB o más, pero la implementación de referencia y el contexto largo pueden exceder la VRAM disponible en consumer.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el uso requiere el código del repositorio TriadicLinearAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gated DeltaNet 1.3B 64k | 1,36B | 64k | MIT | Hugging Face (checkpoint de investigación) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (atención lineal de ~1,3B con contexto largo) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no se documenta alineación (RLHF/DPO), por lo que puede generar contenido sesgado o inapropiado.
- Riesgo de alucinación inherente a modelos de lenguaje preentrenados sin ajuste instructivo.
- Soporte únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Los resultados de Recall (36,1) y NIAH (31,0) sugieren una capacidad de recuperación en contexto largo limitada en términos absolutos, aunque no se dispone de línea base comparativa.
- Requiere código específico del repositorio TriadicLinearAttention; no es compatible de forma nativa con frameworks de inferencia estándar.
- El autor indica necesidad de H100, lo que restringe su uso a entornos con hardware de gama alta.
- Licencia MIT permite uso comercial, pero al ser un checkpoint de investigación sin garantías, se recomienda validación exhaustiva antes de producción.
- Sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/gdn-1.3b-64k
- Paper: https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
