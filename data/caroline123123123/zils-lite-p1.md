# Caroline123123123/zils-lite-p1

## Resumen

zils-lite-p1 es un modelo de extracción de características (feature-extraction) publicado por el usuario Caroline123123123 en Hugging Face. Se trata de un "soup body" del modelo `vllm-sr/d3-lite`, que a su vez es un fine-tune de `Qwen/Qwen3.5-0.8B`. El modelo conserva la torre de visión del chasis original sin modificar y ha sido entrenado únicamente en las capas de lenguaje mediante LoRA (r=16, alpha=32), fusionadas en FP32 y almacenadas en BF16. Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB, se posiciona como un modelo compacto orientado a tareas de clasificación y decisión.

El modelo resuelve el problema de la toma de decisiones estructuradas sobre entradas textuales y multimodales, entrenándose específicamente con 15.000 ejemplos de decisión procedentes de conjuntos de datos públicos etiquetados (AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5, poem_sentiment) y decisiones generadas programáticamente. La relevancia actual radica en su enfoque en "decisiones" más que en generación libre, lo que lo hace adecuado para pipelines de clasificación y enrutamiento.

La información disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifican idiomas soportados, y el modelo tiene cero descargas y cero likes en el momento de la consulta. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B, con torre de visión) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16; se desconoce si existen versiones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `Qwen/Qwen3.5-0.8B` (commit `2fc06364`), un transformer de 852 millones de parámetros. Incluye una torre de visión heredada del chasis original, que no fue entrenada ni modificada durante el fine-tune. El entrenamiento se realizó exclusivamente sobre las capas de lenguaje mediante LoRA con rango 16 y alpha 32, cuyos adaptadores se fusionaron en FP32 y se almacenaron en BF16. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de los nombres de los conjuntos de datos utilizados.

El entrenamiento utilizó 15.000 ejemplos de decisión extraídos de los splits de entrenamiento de datasets públicos etiquetados (AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5, poem_sentiment) y decisiones generadas programáticamente. No se usaron splits de validación ni de test. Los hiperparámetros incluyen learning rate 0.0002, 1.0 épocas, peso de Brier 0.25 y semilla 31. No se menciona el uso de RLHF o DPO. La innovación principal es el enfoque en "cuerpos de decisión" (decision bodies) dentro del ecosistema Zils, aunque no se detallan mecanismos técnicos adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction) como pipeline principal declarado.
- Toma de decisiones estructuradas sobre entradas textuales, entrenado con ejemplos de clasificación y enrutamiento.
- Procesamiento multimodal gracias a la torre de visión heredada de Qwen3.5-0.8B (aunque no fue entrenada en este fine-tune).
- Capacidad de clasificación en dominios diversos: noticias (AG News), inferencia de lenguaje natural (MNLI, BoolQ), razonamiento (ARC, CommonsenseQA), banca (Banking77) y análisis de sentimiento (SST-5, poem_sentiment).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de noticias: el modelo puede asignar categorías temáticas a titulares y cuerpos de texto, entrenado específicamente con AG News, lo que lo hace adecuado para pipelines de agregación y filtrado de contenido periodístico.
- Enrutamiento de consultas en atención al cliente: gracias al entrenamiento con Banking77, puede clasificar consultas bancarias en intenciones concretas para derivarlas al departamento o agente adecuado.
- Análisis de sentimiento en reseñas y poesía: el entrenamiento con SST-5 y poem_sentiment permite evaluar la polaridad emocional en textos literarios y reseñas de productos, útil en herramientas de análisis de opinión.
- Inferencia de lenguaje natural para validación de afirmaciones: el entrenamiento con MNLI y BoolQ permite determinar si una premisa implica una hipótesis o responder preguntas de sí/no, aplicable en sistemas de verificación de hechos.
- Razonamiento sobre sentido común: el entrenamiento con CommonsenseQA y ARC permite responder preguntas que requieren conocimiento cotidiano, útil en asistentes educativos o sistemas de tutorización.
- Detección de decisiones programáticas: al haber sido entrenado con decisiones generadas programáticamente, puede integrarse en pipelines de automatización donde se requiera una capa de decisión binaria o multiclase sobre datos estructurados.
- Extracción de características para búsqueda semántica: al ser un modelo de feature-extraction, puede generar embeddings para sistemas de recuperación de información y similitud semántica, aunque no se especifica la dimensión de los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos (852M parámetros × 2 bytes), más overhead de activaciones y caché KV; se estima un mínimo de 3-4 GB en BF16.
- VRAM estimada en FP16: similar a BF16, en torno a 1,7 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,85 GB para pesos, con un mínimo práctico de 2 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,43 GB para pesos, con un mínimo práctico de 1,5 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB); también en GPUs de datacenter como A100, H100, L4 o T4.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM en BF16 (por ejemplo, GTX 1650 Super, RTX 3050, RTX 4060).
- Opciones de despliegue: transformers (librería declarada), vLLM (el modelo base es de vllm-sr, lo que sugiere compatibilidad), llama.cpp y Ollama si se generan versiones GGUF (no confirmado), TGI (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-p1 | 852.985.920 | no disponible | Apache 2.0 | safetensors (BF16) | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | ~800M (no confirmado) | no disponible | no disponible | safetensors | Hugging Face (modelo base) |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. Los modelos comparables serían otros fine-tunes de Qwen3.5-0.8B o modelos de clasificación de menos de 1B parámetros, pero no se han proporcionado datos de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse con datasets públicos etiquetados (AG News, MNLI, BoolQ, etc.) puede heredar los sesgos presentes en dichos conjuntos.
- Riesgo de alucinación: aunque el modelo está orientado a decisiones y clasificación, cualquier uso generativo puede producir salidas incorrectas; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto soportada ni los idiomas; el entrenamiento se realizó con datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribuir al autor original.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; no se han publicado splits de validación o test, por lo que no hay métricas de generalización; el entrenamiento usó solo 1 época y 15.000 ejemplos, lo que puede limitar la robustez; la torre de visión no fue entrenada en este fine-tune, por lo que su rendimiento multimodal puede ser deficiente; no se especifica la dimensión de los embeddings de salida ni la compatibilidad con pipelines de feature-extraction estándar.
- El modelo ha sido creado en 2026-11-20, lo que sugiere que es muy reciente y posiblemente no haya sido sometido a pruebas exhaustivas.

## Enlaces

- [Hugging Face: Caroline123123123/zils-lite-p1](https://huggingface.co/Caroline123123123/zils-lite-p1)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Modelo base: vllm-sr/d3-lite](https://huggingface.co/vllm-sr/d3-lite)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
