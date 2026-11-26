# AI-SecurityAgent/Qwen3.8-27B-GGUF-UD-Q4_K_M

## Resumen

Qwen3.8-27B-GGUF-UD-Q4_K_M es una cuantización GGUF de 4 bits del modelo Qwen3.8-27B, publicada por el usuario AI-SecurityAgent en Hugging Face. No se trata de un modelo original ni de un entrenamiento nuevo: la model card indica explícitamente que es un re-upload (mirror) del repositorio unsloth/Qwen3.8-27B-GGUF, con los ficheros sin modificar. Por tanto, el valor técnico de esta ficha reside en la cuantización Q4_K_M con imatrix, orientada a inferencia local eficiente.

El modelo subyacente cuenta con 27.320.697.856 parámetros totales (unos 27,3 mil millones), según los datos de safetensors del repositorio, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 16,5 GB, un tamaño coherente con una cuantización de 4 bits de un modelo de ese orden de magnitud. La arquitectura declarada en los tags es qwen3_5, lo que lo sitúa en la familia Qwen 3.5.

La relevancia de esta publicación es limitada pero práctica: ofrece una variante GGUF lista para usar con llama.cpp, Ollama o motores compatibles con endpoints, con cuantización de tipo UD (unsloth dynamic) Q4_K_M y calibración mediante imatrix. Para desarrolladores que quieran ejecutar un modelo de ~27B en hardware de consumo o en una sola GPU profesional, esta cuantización es un punto de partida directo, aunque conviene acudir al repositorio original de unsloth para obtener documentación completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag qwen3_5); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 4 bits, variante UD-Q4_K_M con imatrix; otras cuantizaciones en el repo base unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 16,5 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada. Los tags del repositorio indican la familia qwen3_5, lo que sugiere una arquitectura transformer propia de la serie Qwen 3.5, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Respecto al entrenamiento, la model card de esta publicación no aporta ningún dato: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Toda la información de entrenamiento correspondería al modelo original de Qwen y no está incluida en esta ficha. La única innovación técnica documentada aquí es la cuantización: se trata de una variante UD (unsloth dynamic) Q4_K_M calibrada con imatrix, un método que ajusta la precisión por capas según la importancia de los pesos, mejorando la calidad frente a una cuantización uniforme de 4 bits.

## Capacidades

- Generación de texto conversacional: el tag conversational indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag endpoints_compatible sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de endpoints de Hugging Face.
- Cuantización de 4 bits: permite ejecución con menor huella de memoria que el modelo en precisión completa.
- Capacidades específicas de razonamiento, código, matemáticas, visión o audio: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).

## Casos de uso

- Despliegue local de un modelo de ~27B en una sola GPU: gracias a la cuantización Q4_K_M (16,5 GB de pesos), el modelo puede cargarse en GPUs con 24 GB de VRAM, como una RTX 4090, dejando margen para el contexto y el KV cache.
- Prototipado de asistentes conversacionales: el tag conversational y el formato GGUF permiten levantar un chatbot multi-turno con llama.cpp u Ollama en minutos, sin necesidad de infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: al ser un mirror de la variante UD-Q4_K_M de unsloth, sirve para medir la pérdida de calidad frente al modelo en BF16 o frente a otras cuantizaciones (Q5_K_M, Q8_0) en tareas concretas.
- Inferencia en entornos con restricciones de memoria: en máquinas sin GPU dedicada, la cuantización de 4 bits permite ejecución parcial o total en CPU con llama.cpp, a costa de mayor latencia.
- Integración en pipelines compatibles con endpoints: el tag endpoints_compatible facilita su uso en servicios de inferencia gestionados que aceptan pesos GGUF.
- Base para ajuste fino ligero o experimentación: al estar bajo Apache 2.0, puede usarse como punto de partida para experimentos de adaptación (LoRA) sobre la cuantización, aunque el ajuste sobre GGUF es limitado y requeriría de-cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB solo para los pesos en Q4_K_M; con contexto moderado y overhead del runtime, se recomienda un mínimo de 20-24 GB de VRAM para GPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB); en estas dos últimas sobra memoria para contextos largos y mayor batch.
- GPU de consumo: sí cabe en una RTX 4090 o RTX 3090 (24 GB) con contexto moderado; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habría que usar el modelo en safetensors para esos motores.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la longitud de contexto y el motor elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GGUF-UD-Q4_K_M (este) | ~27,3B | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face (mirror) |
| unsloth/Qwen3.8-27B-GGUF (origen) | ~27,3B | no disponible | GGUF (varias) | Apache 2.0 | Hugging Face |
| Modelo Qwen3.8-27B en precision completa | ~27,3B | no disponible | safetensors/BF16 | Apache 2.0 | Repositorio original de Qwen |

La comparación con alternativas de otras familias (por ejemplo, Llama o Mistral de tamaño similar) no está disponible en la información proporcionada, ya que no se conocen los datos de rendimiento del modelo base.

## Limitaciones y advertencias

- Este repositorio es un mirror: no aporta valor añadido sobre unsloth/Qwen3.8-27B-GGUF y no incluye documentación propia más allá de la licencia y los tags.
- Sin datos de benchmarks ni de evaluación de calidad: no se puede verificar la degradación introducida por la cuantización Q4_K_M frente al modelo original.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de lenguaje de gran escala es probable que herede los del corpus de entrenamiento original.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica publicada para esta cuantización.
- Idiomas no declarados: no se especifica qué lenguas soporta, lo que dificulta planificar su uso en producción multilingüe.
- Contexto no declarado: se desconoce la ventana máxima, un dato crítico para aplicaciones con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base original de Qwen por si impone condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; para producción se recomienda usar el repositorio de unsloth como fuente primaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-SecurityAgent/Qwen3.8-27B-GGUF-UD-Q4_K_M
- Repositorio base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
