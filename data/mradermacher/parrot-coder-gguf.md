# mradermacher/Parrot-Coder-GGUF

## Resumen

Parrot-Coder es un modelo de lenguaje especializado en generación de código, desarrollado originalmente por Inserloft-AI y distribuido en formato GGUF por mradermacher. Con 255.101.952 parámetros totales (aproximadamente 255 millones), se trata de un modelo compacto orientado a tareas de code generation, lo que lo sitúa en la categoría de modelos pequeños que pueden ejecutarse en hardware de consumo. El repositorio aquí descrito es una cuantización estática del modelo base `Inserloft-AI/Parrot-Coder`, publicada bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que el modelo original solo está disponible en formato Hugging Face (transformers), mientras que esta versión GGUF permite su despliegue en entornos con llama.cpp, Ollama y otras herramientas compatibles con el formato GGUF, facilitando su uso en local sin necesidad de GPUs de gama alta. El tamaño del repositorio es de 2,5 GB, aunque las cuantizaciones individuales ocupan entre 0,2 GB (Q2_K) y 0,6 GB (f16).

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. El modelo está etiquetado como orientado al inglés (`language: en`) y su uso principal declarado es la generación de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, según tags de transformers) |
| Parámetros totales | 255.101.952 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Inserloft-AI/Parrot-Coder` en la documentación proporcionada. Los tags indican que el modelo original se distribuye con la librería `transformers`, lo que sugiere una arquitectura transformer estándar, pero no se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La única información técnica concreta sobre el proceso de cuantización es la que aporta mradermacher: se trata de cuantizaciones estáticas (no weighted/imatrix), generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de una conversión de tipo `hf`. El autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación, y que podrían solicitarse mediante una discusión en la comunidad.

## Capacidades

- Generación de código: el modelo está etiquetado con `code` y `code-generation`, y su nombre (Parrot-Coder) indica especialización en tareas de programación.
- Generación de texto: al ser un modelo de lenguaje, puede generar texto general, aunque su entrenamiento está orientado al código.
- Idiomas: soporte declarado únicamente para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Autocompletado de código en editores: con un tamaño de 255 M de parámetros y cuantizaciones de 0,2-0,3 GB, el modelo puede ejecutarse en local dentro de un plugin de editor (por ejemplo, mediante llama.cpp) para sugerir completaciones de código en tiempo real sin depender de la nube.
- Asistencia en scripts y utilidades de línea de comandos: adecuado para generar fragmentos de código cortos en inglés, como scripts de shell, Python o utilidades de automatización, gracias a su bajo coste computacional.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (0,3 GB) permiten ejecutar el modelo en CPUs modernas o GPUs integradas, útil para prototipos y entornos de desarrollo sin GPU dedicada.
- Generación de documentación técnica de código: el modelo puede redactar comentarios y docstrings en inglés a partir de fragmentos de código, integrable en pipelines de documentación automática.
- Filtrado y clasificación de código en CI/CD: con su tamaño reducido, puede emplearse para tareas ligeras de análisis de código (detección de patrones, generación de mensajes de commit) dentro de pipelines de integración continua.
- Educación y experimentación: su licencia Apache 2.0 y su reducido tamaño lo hacen adecuado para entornos docentes donde se quiera experimentar con modelos de código sin infraestructura costosa.
- Pruebas de concepto de asistentes de código: al estar disponible en GGUF, se puede integrar rápidamente en aplicaciones con Ollama o llama.cpp para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,6 GB (f16) solo para los pesos; añadir overhead de contexto y runtime (típicamente 0,5-1 GB adicionales según la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; una RTX 3060, RTX 4060 o superior permite ejecutar f16 con holgura. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.), así como en CPUs con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base puede usarse con transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, se espera una latencia baja en hardware consumer, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Parrot-Coder (este) | 255 M | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que, por tamaño, Parrot-Coder se sitúa en la categoría de modelos de código pequeños (junto a alternativas de menos de 500 M de parámetros), pero no se aportan datos concretos de comparación.

## Limitaciones y advertencias

- Idiomas: el modelo está declarado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en conversaciones o ficheros de código largos.
- Alucinación: como todo modelo de lenguaje, puede generar código sintácticamente plausible pero incorrecto; requiere validación en producción.
- Sesgos: no se dispone de información sobre sesgos conocidos; al ser un modelo pequeño entrenado probablemente con datos públicos, puede reflejar sesgos presentes en ellos.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `Inserloft-AI/Parrot-Coder` y las condiciones de las cuantizaciones.
- Cuantizaciones: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre tamaño y calidad.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, benchmarks ni arquitectura detallada, lo que dificulta evaluar su idoneidad para tareas críticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Parrot-Coder-GGUF
- Modelo base: https://huggingface.co/Inserloft-AI/Parrot-Coder
- Página de descargas del autor: https://hf.tst.eu/model#Parrot-Coder-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
