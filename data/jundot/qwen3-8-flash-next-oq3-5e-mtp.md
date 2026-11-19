# Jundot/Qwen3.8-Flash-Next-oQ3.5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5e-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Jundot. El modelo base es un preview experimental de la arquitectura que, según el autor, está detrás de Qwen4: un modelo de visión-lenguaje con mezcla de expertos (MoE) de 125B parámetros con 6B activados, un embedding n-grama de 51B parámetros y un módulo de predicción multi-token (MTP) de 4B. Este checkpoint permite ejecutar ese modelo en hardware Apple Silicon mediante MLX, con un peso efectivo de 4,006 bits por parámetro en el backbone de lenguaje y 4,326 bits por parámetro en el checkpoint completo.

La cuantización se ha realizado con oQ (oMLX v0.8.0), una técnica de precisión mixta que asigna bits según la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (1024 muestras × 512 tokens) y reajusta escala y sesgo por mínimos cuadrados ponderados. El checkpoint incluye el modelo de lenguaje, el embedding n-grama, el codificador de visión y la cabeza MTP, con un tamaño total de repositorio de 169,7 GB y 180.000 millones de parámetros almacenados.

El interés de esta ficha es doble: por un lado, documenta una arquitectura híbrida poco convencional (Gated DeltaNet combinado con Qwen Sparse Attention y flujos residuales con compuertas); por otro, muestra una estrategia de cuantización que mantiene el embedding n-grama a 4 bits fuera del presupuesto de bits porque oMLX puede servirlo desde SSD en lugar de memoria. El modelo se distribuye bajo la licencia Qwen Community 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y flujos residuales con compuertas; incluye embedding n-grama y cabeza MTP |
| Parámetros totales | 180.000.000.000 (180B); backbone de lenguaje 125,744B, embedding n-grama 51,200B, codificador de visión 0,449B, cabeza MTP 2,607B |
| Parámetros activos | 6B (según la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ3.5e: affine 3-bit grupo 64, affine 4-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, I64 y embedding n-grama affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors en formato MLX (librería mlx); 169,7 GB de repositorio, 90,655 GiB de almacenamiento efectivo |

## Arquitectura y entrenamiento

El modelo base combina mecanismos poco habituales: Gated DeltaNet (una variante de atención lineal con estado recurrente) junto con Qwen Sparse Attention (QSA), y flujos residuales con compuertas (Gated Residual streams). Se trata de un MoE con 125B parámetros en el backbone de lenguaje y 6B activados por token, al que se añaden dos componentes singulares: un embedding n-grama de 51,2B parámetros (28,445% del total de pesos lógicos) y una cabeza de predicción multi-token (MTP) de 2,607B parámetros. El codificador de visión aporta 0,449B parámetros y habilita la modalidad image-text-to-text.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. La model card del autor de la cuantización no detalla estos aspectos del modelo base, y no se han encontrado datos al respecto en la información proporcionada. La innovación técnica destacable de este checkpoint es la cuantización oQ3.5e: asignación de bits por sensibilidad de capa, redondeo con matriz de importancia y refit ponderado de escala y sesgo, con una distribución que concentra el 44,739% de los pesos lógicos en 3 bits y mantiene el embedding n-grama a 4 bits fuera del presupuesto de memoria porque puede servirse desde SSD.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado como conversational.
- Procesamiento de imagen y texto combinados (image-text-to-text): incluye codificador de visión.
- Razonamiento y predicción multi-token mediante la cabeza MTP, que permite decodificación especulativa o generación de varios tokens por paso.
- Capacidades de lenguaje natural y, presumiblemente, código y matemáticas, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Capacidades especiales: embedding n-grama de gran tamaño para recuperación o memorización, y arquitectura híbrida con atención lineal (Gated DeltaNet) y atención dispersa (QSA).

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y cuantizado a ~4,3 bits efectivos, lo que permite ejecutar un modelo de 180B parámetros lógicos en equipos con memoria unificada grande, usando oMLX con servicio del embedding n-grama desde SSD.
- Asistentes multimodales de escritorio: al incluir codificador de visión, puede integrarse en aplicaciones macOS que combinen capturas de pantalla, imágenes y texto conversacional, con el pipeline image-text-to-text ya declarado.
- Investigación sobre arquitecturas híbridas: sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet + QSA + flujos residuales con compuertas frente a transformers clásicos, comparando latencia y calidad en contexto largo.
- Experimentación con decodificación especulativa: la cabeza MTP de 2,607B parámetros está incluida en el checkpoint, lo que permite probar generación multi-token y medir la aceleración frente a decodificación autoregresiva estándar.
- Prototipado de sistemas de recuperación aumentada: el embedding n-grama de 51,2B parámetros, servido desde SSD, puede explorarse como mecanismo de memorización o recuperación eficiente en pipelines RAG experimentales.
- Evaluación de técnicas de cuantización: al publicarse la distribución de bits por capa y el error de redondeo refinado (oQe), el checkpoint es útil para reproducir estudios sobre precisión mixta y su impacto en calidad, comparándolo con el modelo base en BF16.
- Despliegue de bajo consumo en estaciones de trabajo: con 90,655 GiB de almacenamiento efectivo, puede caber en configuraciones de memoria unificada de 128 GB o más, ofreciendo una alternativa local a APIs en la nube para tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 90,655 GiB de almacenamiento efectivo del checkpoint; el backbone de lenguaje ocupa 58,647 GiB, el embedding n-grama 29,802 GiB (servible desde SSD), el codificador de visión 0,836 GiB y la cabeza MTP 1,370 GiB.
- GPU recomendadas: al ser un checkpoint MLX, está orientado a Apple Silicon (M-series con memoria unificada). Para GPUs NVIDIA (A100, H100, RTX 4090) no se proporciona compatibilidad en la información disponible; MLX no es el runtime habitual para CUDA.
- ¿Cabe en GPU consumer? En Apple Silicon, requiere configuraciones de memoria unificada de aproximadamente 96 GB o más si se sirve el embedding desde SSD; en GPUs consumer convencionales (24 GB) no cabe sin técnicas adicionales no documentadas.
- Opciones de despliegue: oMLX (runtime del autor de la cuantización) y el ecosistema MLX; vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint en la información proporcionada.
- Latencia y throughput: no disponibles; la model card menciona que oQe mantiene "el mismo tamaño y velocidad" que la versión anterior, pero no ofrece cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ3.5e-mtp (este) | 180B (125B backbone + 51B n-grama + 4B MTP) | 6B | no disponible | Qwen Community 1.0 | MLX safetensors, ~4,3 bits/parámetro | Hugging Face, 1465 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (misma composición) | 6B | no disponible | Qwen Community 1.0 | safetensors originales (presumiblemente BF16) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un preview experimental: la model card describe el modelo base como "experimental preview" de la arquitectura detrás de Qwen4, por lo que su estabilidad y calidad no están garantizadas para producción.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo generativo de gran tamaño, cabe esperar alucinaciones, especialmente en tareas factuales y multimodalidad.
- Idiomas: no se enumeran idiomas soportados; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia: Qwen Community License 1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue productivo.
- Cuantización agresiva: 44,739% de los pesos lógicos están en 3 bits, lo que puede degradar calidad frente al modelo base en BF16; no se publican métricas de la pérdida de calidad.
- Hardware: el checkpoint está en formato MLX y orientado a Apple Silicon; no hay documentación de compatibilidad con CUDA, vLLM o llama.cpp, lo que limita su uso en clústeres NVIDIA.
- Embedding n-grama servido desde SSD: depende de oMLX para funcionar fuera de memoria; otros runtimes pueden no soportar esta optimización y requerir más RAM.
- Actualización del checkpoint: la versión del 19 de noviembre de 2026 re-cuantiza con oQe refinado; copias anteriores deben reemplazarse, lo que implica riesgo de versiones inconsistentes en despliegues.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia: LICENSE (incluido en el repositorio de Hugging Face)
