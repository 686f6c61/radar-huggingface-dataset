# lhh5051/Qwen3.5-0.8B-Zundamon-GGUF

## Resumen

Qwen3.5-0.8B-Zundamon-GGUF es una cuantización no oficial en formato GGUF del modelo auhulu/Qwen3.5-0.8B-Zundamon, un ajuste fino del modelo base Qwen/Qwen3.5-0.8B orientado a conversación en japonés y con la personalidad del personaje Zundamon. El modelo lo publica el usuario lhh5051 en Hugging Face y está pensado para su ejecución local mediante llama.cpp y entornos compatibles con GGUF.

Se trata de un modelo pequeño, con 752.393.024 parámetros reales según los pesos en safetensors del modelo base, lo que lo sitúa en la franja de los modelos de menos de mil millones de parámetros. Esta escala permite desplegarlo en hardware de consumo, incluso en CPU, y es adecuado para tareas de conversación ligera, prototipado y experimentación con personajes.

La relevancia de esta ficha radica en que ofrece una vía práctica para probar un modelo conversacional en japonés con una personalidad concreta sin necesidad de infraestructura de GPU dedicada. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.5-0.8B, detalles no publicados en la información disponible) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-0.8B en la documentación proporcionada. Por el nombre y la familia a la que pertenece, se trata presumiblemente de un transformer decoder-only, pero este dato no se confirma explícitamente en la información disponible. El modelo es un ajuste fino (auhulu/Qwen3.5-0.8B-Zundamon) sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a dotar al modelo de la personalidad del personaje Zundamon y a conversación en japonés.

El proceso de cuantización documentado por el autor consiste en convertir los pesos en safetensors a GGUF en precisión F16 mediante llama.cpp y, a partir de ese F16, generar las variantes Q8_0, Q6_K y Q4_K_M siguiendo el procedimiento estándar de cuantización de llama.cpp. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en japonés, con la personalidad del personaje Zundamon.
- Conversación multi-turno gracias a la inclusión de la plantilla de chat original del modelo en el GGUF.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Cuantizaciones ligeras (desde Q4_K_M de 504,8 MiB) que permiten inferencia en CPU y en GPUs de gama baja.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Chatbot de personaje en local: el modelo puede gestionar conversaciones multi-turno en japonés con la personalidad de Zundamon, adecuado para demos, juegos o aplicaciones de entretenimiento que requieran ejecución sin conexión.
- Prototipado rápido de asistentes conversacionales en japonés: al ser un modelo de menos de mil millones de parámetros en formato GGUF, permite iterar sobre prompts y plantillas de chat en un portátil sin GPU dedicada.
- Integración en aplicaciones de escritorio o móviles: las variantes Q4_K_M y Q6_K caben en menos de 1 GB, lo que facilita su empaquetado en aplicaciones locales con llama.cpp como motor de inferencia.
- Experimentación con ajuste de personalidad: sirve como base para estudiar cómo un ajuste fino sobre un modelo pequeño modifica el estilo conversacional en japonés, comparándolo con el modelo base Qwen3.5-0.8B.
- Generación de diálogos para contenido creativo: útil para guiones, viñetas o narrativa interactiva en japonés donde se requiera una voz de personaje concreta.
- Evaluación de cuantizaciones: el repositorio ofrece cuatro niveles (F16, Q8_0, Q6_K, Q4_K_M), lo que permite medir el impacto de la cuantización en la calidad de las respuestas para este modelo concreto.
- Educación y divulgación: modelo ligero para demostrar el funcionamiento de llama.cpp y de los formatos GGUF en talleres o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16, 0,8 GB en Q8_0, 0,6 GB en Q6_K y 0,5 GB en Q4_K_M, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; las cuantizaciones Q4_K_M y Q6_K pueden ejecutarse en GPUs integradas o en CPU.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU gracias al tamaño reducido.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y otros runtimes compatibles con GGUF; vLLM y TGI no se mencionan como soportados en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Zundamon-GGUF (este) | 752.393.024 | No disponible | Apache 2.0 | GGUF | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,9B (según búsqueda web) | No disponible | No disponible | Safetensors y otros | Hugging Face |
| auhulu/Qwen3.5-0.8B-Zundamon (ajuste fino original) | No disponible | No disponible | Apache 2.0 | Safetensors | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en japonés: el tag de idioma es únicamente `ja`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Es un ajuste fino de personaje: la personalidad de Zundamon puede sesgar las respuestas hacia un registro conversacional concreto, poco adecuado para tareas técnicas o formales.
- Riesgo de alucinación: al ser un modelo de menos de mil millones de parámetros, la fiabilidad factual es limitada y no se han publicado evaluaciones que la cuantifiquen.
- Contexto desconocido: no se documenta la longitud máxima de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Cuantización no oficial: el autor indica explícitamente que es una versión GGUF no oficial del modelo original, por lo que puede haber diferencias respecto al ajuste fino en safetensors.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio y la licencia del modelo base Qwen3.5-0.8B, no detallada en la información disponible.
- Sin datos de benchmarks ni de entrenamiento: no es posible evaluar su calidad frente a alternativas con la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lhh5051/Qwen3.5-0.8B-Zundamon-GGUF
- Modelo de ajuste fino original: https://huggingface.co/auhulu/Qwen3.5-0.8B-Zundamon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Procedimiento de cuantización de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- Ficha del modelo en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
