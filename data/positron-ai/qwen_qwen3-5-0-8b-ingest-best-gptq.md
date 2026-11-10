# positron-ai/Qwen_Qwen3.5-0.8B-ingest-best-gptq

## Resumen

Este repositorio contiene una compilación cuantizada del modelo Qwen/Qwen3.5-0.8B, publicada por Positron AI bajo el identificador `positron-ai/Qwen_Qwen3.5-0.8B-ingest-best-gptq`. Se trata de una conversión a 4 bits mediante GPTQ del modelo base de Qwen, con el objetivo de reducir el peso en memoria y facilitar el despliegue en entornos con recursos limitados. No es un modelo nuevo ni un ajuste fino: es un artefacto de inferencia derivado del original, y todas las capacidades y limitaciones del modelo base se heredan.

El modelo base pertenece a la familia Qwen3.5 y, según los tags del repositorio, está orientado a tareas de generación de texto y de conversión imagen-texto a texto (`image-text-to-text`), lo que sugiere capacidades multimodales. El artefacto publicado tiene 873.438.784 parámetros reales según los pesos en safetensors y ocupa 2,2 GB en el repositorio. La licencia declarada es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es práctica: permite evaluar rápidamente si una compilación GPTQ de 4 bits de un modelo pequeño y multimodal es adecuada para un pipeline concreto. La model card no incluye métricas de calidad ni de rendimiento, por lo que cualquier decisión de producción debe basarse en una validación propia contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simetrica, `desc_act=false`, damp 0.05; activaciones no cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con `transformers` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El tag `qwen3_5` indica la familia a la que pertenece, y el pipeline declarado es `text-generation`, con el tag adicional `image-text-to-text`, lo que apunta a un modelo multimodal con entrada de imagen y texto. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea técnicas como atención lineal o decodificación especulativa.

El proceso de cuantización sí está documentado con detalle: se aplicó GPTQ con pesos de 4 bits, tamaño de grupo 64, cuantización simétrica y sin `desc_act`, con un porcentaje de damp del 0,05. El conjunto de calibración fue mixto y de dominio general, con 491 muestras de 2048 tokens de longitud. La cadena de herramientas empleada fue GPTQModel 7.6.0, transformers 5.12.1, torch 2.10.0 y CUDA 12.8. No se reportan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF o DPO).

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento de entrada multimodal imagen-texto a texto, según el tag `image-text-to-text`; no se detalla el alcance exacto de esta capacidad.
- Compatibilidad con `transformers` y con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades específicas de tool calling, function calling, razonamiento multi-paso, modo thinking ni soporte multilingüe.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Despliegue en GPU de gama baja para prototipado: con 873 millones de parámetros en 4 bits, el artefacto ocupa aproximadamente 2,2 GB, lo que permite ejecutarlo en tarjetas consumer con 6-8 GB de VRAM para pruebas de concepto y demos internas.
- Clasificación y extracción de información a partir de imágenes y texto: el tag `image-text-to-text` sugiere uso en tareas de descripción de imágenes, respuesta a preguntas sobre documentos escaneados o extracción de campos, siempre que se valide la calidad frente al modelo original.
- Generación de texto en asistentes conversacionales ligeros: el pipeline conversacional permite integrarlo en chatbots de bajo coste donde la latencia y el consumo de memoria priman sobre la precisión máxima.
- Preprocesamiento en pipelines de datos: uso como modelo auxiliar para resumir, etiquetar o filtrar grandes volúmenes de texto antes de pasarlos a un modelo mayor, aprovechando su bajo coste de inferencia.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de GPTQ 4 bits frente al modelo original en tareas concretas antes de adoptar una cuantización en producción.
- Experimentación académica con modelos multimodales pequeños: útil para reproducir experimentos en entornos con presupuesto de GPU limitado, dado el reducido tamaño del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity), y que la validación se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,2 GB solo para pesos en 4 bits; con overhead de activaciones, KV cache y runtime, se recomienda prever al menos 4-6 GB de VRAM para contextos moderados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, debería funcionar en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100; la elección dependerá del throughput requerido.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM, aunque no se ha verificado con pruebas publicadas.
- Opciones de despliegue: `transformers` con soporte GPTQ; el autor no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, por lo que debe comprobarse antes de adoptar estas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-0.8B-ingest-best-gptq | 873.438.784 | no disponible | GPTQ 4-bit | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion | no disponible | pesos originales | apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | apache-2.0 (heredada) | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no reporta ninguna métrica de calidad; se desconoce la degradación introducida por la cuantización GPTQ 4 bits frente al modelo original.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones específicas.
- Sesgos conocidos: no documentados; el modelo base puede heredar sesgos de sus datos de entrenamiento, no especificados.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor recuerda que las restricciones del modelo original siguen aplicándose; conviene revisar la licencia del modelo base.
- Compatibilidad con runtimes de inferencia distintos de `transformers` no verificada; la integración con vLLM, TGI o llama.cpp requiere pruebas propias.
- El repositorio tiene un uso muy bajo (64 descargas, 0 likes), por lo que no hay evidencia comunitaria de su fiabilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-0.8B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
