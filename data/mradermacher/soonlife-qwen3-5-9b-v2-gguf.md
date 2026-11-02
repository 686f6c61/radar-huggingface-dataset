# mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF

## Resumen

Soonlife-Qwen3.5-9B-v2 es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8.953.803.264 según los pesos en safetensors) construido a partir de la familia Qwen3.5 y especializado mediante un proceso de destilación, ajuste con LoRA fusionado y entrenamiento sobre un dataset propio (wonchandev/Soonlife_dataset). El modelo original lo desarrolla el usuario wonchandev; la versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para la comunidad.

El modelo está orientado a casos de uso conversacionales en coreano, con etiquetas que indican capacidades de RAG (generación aumentada por recuperación), tool calling y destilación. Su licencia Apache 2.0 facilita el uso comercial y la integración en productos, y el hecho de estar disponible en GGUF permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama.

La relevancia de esta ficha radica en que se trata de un modelo de nicho (idioma coreano, dominio específico "Soonlife") con muy poca tracción pública: cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Por tanto, debe evaluarse con cautela y validarse empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (cuantizaciones estáticas); mmproj en Q8_0 y f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de la arquitectura Qwen3.5, un transformer decoder-only, y que ha sido sometido a un proceso de destilación (tag `distillation`) y a un ajuste fino con LoRA que posteriormente se fusionó en los pesos (tag `lora-merged`). El dataset de entrenamiento es wonchandev/Soonlife_dataset, de dominio específico y no documentado en la información proporcionada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO.

La versión GGUF ha sido generada con cuantizaciones estáticas (no ponderadas/imatrix, según indica el autor de la cuantización). Se incluyen archivos `mmproj` (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se confirma en la información disponible. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en coreano.
- Soporte de tool calling / function calling (según etiquetas del modelo).
- Capacidades orientadas a RAG (generación aumentada por recuperación), según etiquetas.
- Posible soporte multimodal (presencia de archivos mmproj), no confirmado.
- Razonamiento y matemáticas: no documentado específicamente.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al coreano según el campo `language`.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno en coreano gracias a su ajuste específico sobre un dataset de dominio, adecuado para atención al cliente en ese idioma.
- Sistemas RAG en coreano: su etiqueta `rag` sugiere que ha sido entrenado para integrarse en pipelines de recuperación y generación, útil para bases de conocimiento corporativas en coreano.
- Automatización con tool calling: puede invocarse como motor de function calling en flujos que requieran llamadas a APIs externas, aunque debe validarse su fiabilidad empíricamente.
- Despliegue en hardware de consumo: al estar disponible en GGUF (Q4_K_M, Q5_K_M, etc.), puede ejecutarse localmente con llama.cpp u Ollama en equipos con GPU modesta o incluso CPU.
- Prototipado rápido de aplicaciones de nicho: su licencia Apache 2.0 y su tamaño (~9 B) permiten experimentar sin coste de licencia en entornos de investigación.
- Integración en pipelines de CI/CD para generación de contenido en coreano: puede usarse como servicio de generación de texto dentro de flujos automatizados, siempre que se valide la calidad de salida.
- Evaluación comparativa de modelos destilados: útil como caso de estudio de modelos de nicho con LoRA fusionado y cuantización estática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): aproximadamente 5-6 GB para Q4_K_M, 6-7 GB para Q5_K_M, 9-10 GB para Q8_0, y ~18 GB para f16 (estimaciones basadas en el tamaño de los archivos GGUF, no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 o A100/H100 para f16 o Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M y Q5_K_M en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 Ti).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone del formato original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2 (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF + safetensors | Especializado en coreano, sin benchmarks |
| Qwen2.5-7B | ~7,6 B | 32k (típico) | Apache 2.0 | Amplia | Modelo generalista, benchmarks públicos |
| Llama 3.1 8B | ~8 B | 128k | Llama 3.1 Community | Amplia | Modelo generalista, benchmarks públicos |
| Gemma 2 9B | ~9 B | 8k | Gemma Terms | Amplia | Modelo generalista, benchmarks públicos |

La comparación es orientativa: los modelos alternativos son generalistas y cuentan con benchmarks públicos, mientras que Soonlife carece de ellos y está limitado al coreano. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de calidad; requiere evaluación empírica antes de producción.
- Idiomas: soporte documentado únicamente en coreano; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinación: no cuantificado; los modelos destilados de nicho suelen presentar mayor propensión a inventar información fuera de su dominio.
- Dataset de entrenamiento no documentado: se desconoce su composición, posibles sesgos y cobertura.
- Tracción mínima: cero descargas y cero likes en el momento de la consulta, lo que dificulta la validación comunitaria.
- Cuantizaciones estáticas: el autor indica que no hay cuantizaciones ponderadas/imatrix, lo que puede afectar ligeramente a la perplejidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que el modelo base Qwen3.5 no imponga restricciones adicionales.
- Soporte multimodal incierto: la presencia de archivos mmproj sugiere capacidades multimodales, pero no se confirma en la documentación.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF
- Modelo base: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Dataset: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
- Página de resumen de cuantizaciones: https://hf.tst.eu/model#Soonlife-Qwen3.5-9B-v2-GGUF
- FAQ de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
