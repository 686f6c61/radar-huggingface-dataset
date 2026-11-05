# mradermacher/Kitchoon-V5-Clean-26B-A4B-GGUF

## Resumen

Kitchoon-V5-Clean-26B-A4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Kitchoon-V5-Clean-26B-A4B, publicado por el usuario mradermacher en HuggingFace. El repositorio no contiene un modelo original, sino una conversión a GGUF de los pesos publicados por SubMaroon, lo que permite su despliegue en entornos con llama.cpp y herramientas compatibles con este formato.

El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 26B parámetros totales y aproximadamente 4B parámetros activos por token, un patrón habitual en modelos eficientes tipo "A4B" (activos 4B). Sin embargo, la model card del repositorio es extremadamente escasa: únicamente indica que se trata de cuantizaciones estáticas del modelo original y lista los tipos de cuantización generados, sin aportar información sobre arquitectura, entrenamiento, licencia o idiomas.

La relevancia de esta ficha es limitada por la falta de documentación. No hay datos publicados sobre benchmarks, contexto, composición del dataset ni condiciones de uso, por lo que cualquier evaluación rigurosa requeriría consultar el repositorio original de SubMaroon o realizar pruebas empíricas. A fecha de creación del repositorio (2026-11-04) no registra descargas ni interacciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 26B totales y ~4B activos) |
| Parámetros totales | 26B (según el nombre del modelo) |
| Parámetros activos | ~4B (según el nombre del modelo, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo original en la documentación disponible. El sufijo "A4B" y el total de 26B parámetros apuntan a un transformer con mezcla de expertos (MoE) en el que se activan aproximadamente 4B parámetros por token, pero esta inferencia se basa únicamente en la convención de nombres y no está confirmada por el autor.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal. El repositorio de mradermacher se limita a aplicar cuantización estática sobre los pesos originales de SubMaroon/Kitchoon-V5-Clean-26B-A4B; los metadatos internos del GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) confirman una conversión estándar desde pesos HuggingFace.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no hay documentación que detalle su rendimiento.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en CPU o GPU de gama baja mediante llama.cpp: las cuantizaciones Q4_K_M, Q3_K_M y Q2_K permiten ejecutar un modelo de 26B totales en hardware con memoria limitada, aprovechando la activación parcial de expertos si se confirma la arquitectura MoE.
- Experimentación local con modelos MoE: útil para investigadores que quieran comparar el comportamiento de un MoE de ~4B activos frente a modelos densos de tamaño similar en tareas de generación.
- Integración en pipelines de inferencia con Ollama o LM Studio: al estar en GGUF, puede cargarse directamente en estas herramientas para prototipado rápido.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta doce variantes (desde x-f16 hasta IQ4_XS), lo que permite medir la degradación de calidad frente al tamaño en un mismo modelo.
- Pruebas de rendimiento en entornos con memoria unificada: útil en equipos Apple Silicon o mini-PC con iGPU, donde el formato GGUF y las cuantizaciones bajas son el estándar de facto.
- Investigación sobre modelos no documentados: sirve como caso de estudio de modelos publicados sin model card ni benchmarks, para analizar riesgos de adopción en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero como referencia orientativa para 26B parámetros totales: ~52 GB en f16, ~27 GB en Q8_0, ~16 GB en Q4_K_M, ~11 GB en Q3_K_M y ~9 GB en Q2_K. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 26B en Q4_K_M requeriría GPUs con 16-24 GB (RTX 4090, A5000, L4) o superiores (A100 40/80 GB, H100) para cuantizaciones altas.
- ¿Cabe en consumer GPU? Probablemente en Q4_K_M o inferiores en GPUs de 16-24 GB, y en Q2_K/Q3_K en GPUs de 8-12 GB, aunque la activación MoE puede requerir cargar todos los expertos en memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para todos los modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia, tamaño o arquitectura, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre licencia, idiomas, sesgos, alineación ni condiciones de uso comercial.
- Licencia no disponible: no puede asumirse uso comercial sin consultar el repositorio original de SubMaroon/Kitchoon-V5-Clean-26B-A4B.
- Riesgo de alucinación: desconocido, al no haber documentación sobre entrenamiento o evaluaciones.
- Arquitectura no confirmada: la interpretación MoE con 4B activos se deduce del nombre y podría ser incorrecta.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Cuantizaciones muy agresivas (Q2_K, IQ4_XS) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- No apto para producción sin evaluación previa: la falta de benchmarks y de información sobre alineación impide garantizar comportamiento seguro.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-GGUF
- Modelo original: https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B
