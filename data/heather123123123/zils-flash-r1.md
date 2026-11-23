# Heather123123123/zils-flash-r1

## Resumen

zils-flash-r1 es un ajuste fino (fine-tune) del modelo vllm-sr/d3-flash, cuyo modelo padre es Qwen/Qwen3.5-9B. Lo publica el usuario Heather123123123 bajo el paraguas del proyecto Zils, y se distribuye con licencia Apache 2.0. Se trata de un modelo multimodal (lenguaje y visión) en el que solo se han entrenado las capas de lenguaje mediante LoRA, manteniendo intacta la torre de visión del modelo original.

El modelo parte de una arquitectura transformer de tipo Qwen3.5 con 8.392.695.024 parámetros totales (aproximadamente 8,4 mil millones), empaquetados en safetensors con un tamaño de repositorio de 16,8 GB. La model card lo etiqueta como "soup body", es decir, un cuerpo de pesos derivado de una mezcla o ajuste sobre el modelo base, orientado a tareas de decisión sobre resultados del mundo real.

Su relevancia es acotada pero específica: el entrenamiento se ha centrado en 13.533 ejemplos de decisión construidos a partir de eventos resueltos (reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv), lo que lo orienta a modelar juicios binarios o de resultado más que a generación abierta. El pipeline declarado en Hugging Face es feature-extraction, no text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión), base Qwen3.5 |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | vllm-sr/d3-flash (padre: Qwen/Qwen3.5-9B, revision c2022362) |
| Metodo de ajuste | LoRA r=16, alpha 32, fusionado en FP32 y almacenado en BF16 |
| Pipeline | feature-extraction |
| Tamano del repositorio | 16,8 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo Qwen3.5-9B, un transformer multimodal con torre de visión. En este ajuste, únicamente se han entrenado las capas de lenguaje; la torre de visión se conserva sin cambios respecto al modelo base. El ajuste se realizó con LoRA de rango 16 y alpha 32, cuyos adaptadores se fusionaron en FP32 y se almacenaron en BF16 para su distribución.

El conjunto de entrenamiento consta de 13.533 ejemplos de decisión extraídos de resultados reales ya resueltos: reversiones de ediciones en Wikipedia y Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv. Estos datos se recolectaron con las herramientas públicas Zils Outcomes de periodos anteriores a cualquier ventana de evaluación y se mezclaron con los splits de entrenamiento de conjuntos de datos públicos etiquetados; no se usaron splits de validación ni de test. Los hiperparámetros declarados son learning rate 0,0001, 1,0 épocas, peso Brier de 0,25 y semilla 65. El uso de una función de pérdida tipo Brier sugiere un objetivo de calibración probabilística sobre resultados binarios o categóricos.

## Capacidades

- Extracción de características (feature-extraction) como pipeline principal declarado.
- Modelado de decisiones y resultados sobre eventos del mundo real (juicios de resultado, no solo generación de texto).
- Procesamiento multimodal de entrada gracias a la torre de visión heredada del modelo base, aunque no se documenta su uso en el ajuste.
- Capacidades de lenguaje heredadas de Qwen3.5-9B (generación, razonamiento, código) en la medida en que el ajuste no las haya degradado; no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación y revisión de ediciones colaborativas: el modelo se entrenó con reversiones de Wikipedia y Wikidata, por lo que puede emplearse para puntuar la probabilidad de que una edición sea revertida y priorizar la revisión humana.
- Triaje de revisiones de código: dado su entrenamiento con revisiones de Gerrit, puede usarse para estimar la probabilidad de aceptación de un parche y ordenar la cola de revisión de un equipo.
- Evaluación de preguntas y respuestas en comunidades: entrenado con resultados de Stack Exchange, sirve para predecir si una pregunta será respondida o cerrada, apoyando la moderación de foros técnicos.
- Clasificación de envíos académicos: con datos de categorías de arXiv, puede asistir en la asignación preliminar de categoría o en la detección de envíos mal clasificados.
- Filtrado de candidaturas en flujos tipo Articles for Creation: puede estimar la probabilidad de aceptación de un borrador y enrutarlo a revisión experta o a rechazo automático.
- Extracción de representaciones para downstream: al declararse como feature-extraction, puede generar embeddings para clasificadores o sistemas de ranking sobre eventos y decisiones, integrándose en pipelines de scikit-learn o modelos ligeros.
- Calibración de probabilidades en sistemas de decisión: el uso de pérdida Brier en el entrenamiento lo hace adecuado para escenarios donde se requiere una probabilidad calibrada más que una etiqueta dura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 17 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos, aunque no se documentan cuantizaciones publicadas para este modelo.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, sujeta a conversión manual a GGUF/AWQ/GPTQ no documentada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16; RTX 4090 (24 GB) viable en BF16 con contexto moderado.
- GPU de consumo: RTX 3090/4090 (24 GB) en BF16; RTX 4080/4070 Ti Super (16 GB) solo con cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados para este modelo y requerirían conversión o validación previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-flash-r1 | 8,39 B | no disponible | Apache 2.0 | Ajuste LoRA para decisión sobre resultados | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B | ~9 B (según nombre) | no disponible | no disponible en esta ficha | Modelo base multimodal generalista | Hugging Face |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible en esta ficha | Modelo intermedio del que deriva el ajuste | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se ha realizado exclusivamente sobre capas de lenguaje; las capacidades de visión no se han adaptado ni evaluado.
- No se han reservado splits de validación ni de test, por lo que no existe evidencia pública de generalización ni métricas de evaluación.
- El entrenamiento con pérdida Brier y ejemplos de resultado puede inducir un sesgo hacia la predicción de resultados frecuentes en los datasets de origen (Wikipedia, Gerrit, Stack Exchange, arXiv), poco representativos de otros dominios.
- Riesgo de alucinación inherente al modelo base Qwen3.5-9B, no mitigado ni medido en este ajuste.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificación.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B y de vllm-sr/d3-flash antes de un uso comercial en producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- El pipeline declarado es feature-extraction, no text-generation; usarlo como generador requiere verificación explícita.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Heather123123123/zils-flash-r1
- Modelo base intermedio: https://huggingface.co/vllm-sr/d3-flash
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo de Zils Outcomes: no disponible en la información proporcionada.
