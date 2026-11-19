# DouglasBashir/zils-lite-r8

## Resumen

zils-lite-r8 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor DouglasBashir. Se trata de un modelo de decisión ("decision model") que forma parte del denominado "Zils d3-lite body", orientado a producir decisiones tipadas (typed decisions) a partir de filas de datos públicos. El modelo parte de una arquitectura Qwen3.5 con aproximadamente 853 millones de parámetros y se distribuye bajo licencia Apache 2.0.

El ajuste se realizó mediante un LoRA de rango 16 (una época, optimizador AdamW con tasa de aprendizaje 1e-4 y schedule lineal) sobre filas públicas de decisiones tipadas del dataset tasksource/tasksource-jev-typed-decisions. La mitad de esas filas incorporó objetivos suaves (soft targets) mezclados a partir de las respuestas del profesor público "Zils relay teacher", con un anclaje KL hacia las respuestas del modelo de partida (el "soup" d3-lite). El LoRA resultante se fusionó en los pesos finales.

Por su tamaño reducido (menos de mil millones de parámetros) y su enfoque específico en decisiones tipadas, el modelo está pensado para entornos con recursos limitados y para tareas de clasificación/decisión estructurada más que para generación abierta de propósito general. La información pública disponible es muy escasa: no se documentan idiomas soportados, pipeline, benchmarks ni detalles del dataset de entrenamiento más allá de lo indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); requiere `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con unos 853 millones de parámetros. El repositorio incluye el tag `custom_code`, lo que implica que la carga del modelo requiere código personalizado y no basta con una implementación estándar de transformers sin configuración adicional. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre la composición de su dataset.

El ajuste fino se llevó a cabo con un LoRA de rango 16 durante una época, usando AdamW con tasa de aprendizaje 1e-4 y un schedule lineal. Los datos de entrenamiento fueron filas públicas de decisiones tipadas del dataset `tasksource/tasksource-jev-typed-decisions`; la mitad de las filas utilizó objetivos suaves mezclados a partir de las respuestas del profesor público Zils relay, y se aplicó un anclaje KL hacia las respuestas del "soup" d3-lite de partida para limitar la deriva respecto al modelo original. El adaptador LoRA se fusionó posteriormente en los pesos, de modo que el modelo distribuido ya incorpora el ajuste. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de decisiones tipadas: el modelo está entrenado específicamente para producir decisiones estructuradas a partir de entradas del dominio de tasksource-jev-typed-decisions.
- Generación de texto base: hereda las capacidades del modelo Qwen3.5-0.8B subyacente, si bien no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de decisiones estructuradas: el modelo puede clasificar filas de entrada en categorías de decisión tipadas, aprovechando el ajuste específico sobre tasksource-jev-typed-decisions para tareas de enrutamiento o etiquetado.
- Enrutamiento de consultas en pipelines: por su tamaño reducido, puede usarse como clasificador ligero que decide a qué rama o servicio derivar una solicitud.
- Extracción de etiquetas en flujos de datos tabulares: integrado en procesos batch para asignar decisiones tipadas a registros, con bajo coste de inferencia por su escala de 0,85B parámetros.
- Prototipado rápido en entornos con GPU de consumo: al caber en hardware modesto, permite experimentar con decisiones tipadas antes de escalar a modelos mayores.
- Filtrado y triaje de contenido: como modelo de decisión, puede emplearse para descartar o marcar entradas según reglas aprendidas del dataset de entrenamiento.
- Componente de sistemas compuestos: puede actuar como "cuerpo de decisión" dentro de una arquitectura mayor (el "Zils d3-lite body"), alimentando etapas posteriores con decisiones estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16/BF16, los 852.985.920 parámetros ocupan aproximadamente 1,7 GB de pesos; con overhead de activaciones y KV cache, se estima un uso en torno a 2-3 GB. En cuantización de 8 bits, aproximadamente 0,9-1,5 GB; en 4 bits, aproximadamente 0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden alojarlo con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más de VRAM.
- Opciones de despliegue: al requerir `custom_code`, es probable que necesite transformers con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-r8 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Modelos de ~1B de propósito general | ~1B | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo verificados para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset público concreto, puede heredar sesgos presentes en tasksource-jev-typed-decisions y en las respuestas del profesor Zils relay.
- Riesgo de alucinación: no evaluado; el modelo está orientado a decisiones tipadas, pero conserva la base generativa de Qwen3.5-0.8B, por lo que puede producir salidas no fundamentadas fuera de su dominio de ajuste.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento multilingüe o con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y del dataset de entrenamiento.
- Caveat de producción: requiere `custom_code` para cargarse, lo que complica el despliegue en stacks estándar; además, el modelo tiene 0 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados, por lo que su calidad en producción no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/DouglasBashir/zils-lite-r8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
