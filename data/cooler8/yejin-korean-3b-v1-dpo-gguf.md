# cooler8/yejin-korean-3b-v1-dpo-gguf

## Resumen

yejin-korean-3b-v1-dpo-gguf es un modelo de lenguaje fundacional en coreano desarrollado por el usuario cooler8, preentrenado desde cero (from-scratch) sobre un corpus coreano de alta calidad en un entorno de 8 GPU NVIDIA H200. El modelo sigue la arquitectura Llama 3.2 3B, con 2.910.916.608 parámetros totales (aproximadamente 2,9 mil millones) y una ventana de contexto de 4.096 tokens. Se distribuye en formato GGUF, lo que facilita su despliegue en entornos locales con llama.cpp, Ollama u otras herramientas compatibles.

El modelo está pensado para tareas de generación de texto en coreano, con un pipeline de entrenamiento que incluye preentrenamiento, ajuste supervisado (SFT) y, según el nombre del repositorio, un paso adicional de optimización con DPO (Direct Preference Optimization), aunque la model card solo menciona explícitamente pre-training y SFT. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño compacto lo hace accesible para GPUs de consumo. A día de hoy no cuenta con descargas ni valoraciones en Hugging Face, lo que indica que es un lanzamiento reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B (hidden=3072, layers=28, heads=24, kv_heads=8, GQA 3:1) |
| Parametros totales | 2.910.916.608 (2,9 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (formato GGUF, se asume multiples cuantizaciones Q4, Q5, Q8, pero no se listan en la model card) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Llama 3.2 3B: un transformer decoder-only con 28 capas, dimensiones ocultas de 3.072, 24 cabezas de atención y 8 cabezas de clave/valor, empleando atención con consulta agrupada (GQA) en proporción 3:1. El tokenizador es el de EleutherAI/polyglot-ko-1.3b, con un vocabulario de 30.003 tokens, diseñado específicamente para el coreano. El entrenamiento se realizó desde cero sobre un corpus coreano de alta calidad, en un clúster de 8 GPU NVIDIA H200. El pipeline declarado en la model card es pre-training seguido de SFT, y posteriormente se convirtió a GGUF. El nombre del repositorio incluye "dpo", lo que sugiere que se aplicó también optimización por preferencias directas, aunque este paso no se menciona explícitamente en la documentación. No se detallan el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto en coreano: modelo causal LM optimizado para producir texto coherente en coreano, con capacidad de completar frases y continuar conversaciones.
- Razonamiento básico: al ser un modelo de 3B, puede resolver tareas simples de razonamiento y comprensión lectora en coreano, aunque sin capacidades avanzadas de modelos mucho más grandes.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona).
- Capacidades multilingües: limitadas al coreano; el tokenizador está especializado en este idioma y no se reportan capacidades en otros idiomas.
- Modo thinking o visión: no disponible.

## Casos de uso

- Chatbots y asistentes en coreano: el modelo puede integrarse en aplicaciones de atención al cliente o asistentes virtuales que requieran conversaciones en coreano, aprovechando su ventana de 4.096 tokens para mantener contexto en diálogos de longitud media.
- Generación de contenido editorial en coreano: redacción de artículos, resúmenes o borradores de textos en coreano, con posibilidad de ajuste fino adicional para dominios específicos como noticias o marketing.
- Completado de código con comentarios en coreano: aunque no está especializado en código, puede generar fragmentos de código con comentarios y documentación en coreano, útil para equipos de desarrollo que trabajan en ese idioma.
- Educación y tutoría de idioma coreano: el modelo puede servir como base para herramientas de práctica de escritura o generación de ejercicios de coreano, dado su entrenamiento en corpus de alta calidad.
- Investigación académica en PNL coreana: como modelo fundacional abierto, es útil para experimentos de fine-tuning en tareas específicas del coreano (análisis de sentimiento, clasificación de textos, etc.) sin necesidad de entrenar desde cero.
- Prototipado rápido en entornos locales: al ser GGUF y de tamaño reducido, puede ejecutarse en portátiles con GPU de 6-8 GB de VRAM, permitiendo pruebas de concepto de aplicaciones en coreano sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o similares, y no se encontraron referencias externas con evaluaciones del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,9 B parámetros en formato GGUF, una cuantización Q4_K_M ocuparía aproximadamente 1,8-2,0 GB, y Q8 alrededor de 3,0-3,2 GB. La VRAM total necesaria dependerá del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar cuantizaciones bajas (Q4) con llama.cpp. Para cuantizaciones más altas o mayor velocidad, se recomienda una RTX 3060 (12 GB) o superior. En el entrenamiento se usaron 8x NVIDIA H200, pero para inferencia no se requieren GPUs de datacenter.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media (RTX 3060, RTX 4060, etc.) con cuantización Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. También es posible usar transformers con carga de pesos GGUF mediante bibliotecas como llama-cpp-python.
- Latencia y throughput: no disponible. Para un modelo de 3B en una GPU moderna, se espera una generación de 20-50 tokens por segundo con cuantización Q4, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| yejin-korean-3b-v1-dpo-gguf | 2,9 B | 4.096 | coreano | Apache 2.0 | GGUF |
| Polyglot-Ko-1.3b (EleutherAI) | 1,3 B | 2.048 | coreano | Apache 2.0 | Safetensors |
| Llama 3.2 3B (Meta) | 3,2 B | 128K | multilingue (incl. coreano limitado) | Llama 3.2 License | Safetensors, GGUF |

El modelo yejin se diferencia de Polyglot-Ko por su mayor tamaño (2,9 B vs 1,3 B) y contexto (4.096 vs 2.048), y de Llama 3.2 3B por estar especializado exclusivamente en coreano y entrenado desde cero con ese corpus, mientras que Llama 3.2 tiene un contexto mucho mayor y soporte multilingüe más amplio, pero con una licencia más restrictiva. No se dispone de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado desde cero con un corpus coreano no documentado, puede heredar sesgos culturales, de género o políticos presentes en los datos de entrenamiento. No se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de hechos concretos. Su tamaño reducido (3B) aumenta la probabilidad de errores factuales en comparación con modelos más grandes.
- Limitaciones de contexto: la ventana de 4.096 tokens es relativamente corta para aplicaciones que requieran documentos largos o conversaciones extensas. No se menciona soporte de ventana deslizante o extensiones de contexto.
- Limitaciones de idioma: el modelo está diseñado exclusivamente para coreano. Su uso en otros idiomas producirá resultados de baja calidad o incoherentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero no se especifica si los datos de entrenamiento tienen limitaciones adicionales. El autor no proporciona garantías sobre el modelo.
- Advertencias para producción: el modelo no tiene descargas ni validación comunitaria (0 descargas, 0 likes), por lo que su fiabilidad en entornos productivos no está contrastada. Se recomienda realizar evaluaciones propias antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cooler8/yejin-korean-3b-v1-dpo-gguf
- Modelo base relacionado (1B, mismo autor): https://huggingface.co/cooler8/yejin-korean-1b-v8
- Tokenizador usado: https://huggingface.co/EleutherAI/polyglot-ko-1.3b
