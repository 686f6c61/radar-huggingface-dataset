# lhpku20010120/Omni-Edu-9B-GGUF

## Resumen

Omni-Edu-9B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Omni-Edu-9B, un modelo image-text-to-text de aproximadamente 8.950 millones de parámetros (8,95B). Lo publica el usuario lhpku20010120 en Hugging Face, que actúa como conversor y cuantizador del modelo base Omni-Edu-9B, también alojado en su cuenta. La conversión se ha realizado con llama.cpp, lo que permite ejecutar el modelo en CPU y GPU de consumo mediante dicha librería.

El modelo está orientado al ámbito educativo (tags "omniedu" y "education") y su arquitectura se etiqueta como "qwen3_5", lo que sugiere una base derivada de la familia Qwen 3.5. Acepta entradas de imagen y texto y genera texto, por lo que puede emplearse en tareas como explicación de material didáctico, descripción de figuras o resolución de problemas con soporte visual. La relevancia actual radica en que ofrece una vía práctica de desplegar un modelo multimodal de 9B en hardware modesto gracias a las cuantizaciones Q4_K_M (5,24 GiB) y Q6_K (6,85 GiB).

La información pública es escasa: la model card del repositorio GGUF se limita a los archivos, instrucciones de ejecución y una nota sobre la licencia del modelo original. No se detallan datos de entrenamiento, benchmarks ni idiomas soportados, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text; etiquetada como qwen3_5 |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa -c 8192) |
| Tipos de cuantizacion | BF16 (16,69 GiB), Q8_0 (8,87 GiB), Q6_K (6,85 GiB), Q4_K_M (5,24 GiB); proyector multimodal mmproj F16 |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo base Omni-Edu-9B) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en GGUF F16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Omni-Edu-9B. Los metadatos lo etiquetan como "qwen3_5" y con pipeline image-text-to-text, lo que indica un transformer multimodal con un codificador visual acoplado a un modelo de lenguaje, más un proyector multimodal separado (mmproj) que en esta versión GGUF se distribuye como archivo aparte en precisión F16 y es común a las cuatro cuantizaciones.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas. La model card del repositorio GGUF solo documenta el proceso de conversión y cuantización con llama.cpp, no el entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational".
- Comprensión de imágenes combinadas con texto (image-text-to-text): descripción de figuras, lectura de diagramas y respuesta a preguntas sobre contenido visual.
- Orientación educativa: el etiquetado "education" y "omniedu" sugiere un ajuste para tareas didácticas, aunque no se detalla su alcance.
- Ejecución local mediante llama.cpp, con servidor compatible con la API OpenAI (`/v1`), lo que permite integrarlo en clientes como Cherry Studio.
- Modo de razonamiento desactivable mediante el flag `--reasoning off` en llama-server, lo que indica que el modelo puede emitir trazas de razonamiento si se activa.
- Soporte de tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia educativa local: desplegar el modelo con llama-server en un equipo de aula o laboratorio para responder dudas de estudiantes sobre apuntes y figuras, usando la cuantización Q4_K_M (5,24 GiB) para minimizar requisitos de memoria.
- Explicación de material visual: subir diagramas, gráficos o ilustraciones de un libro de texto y pedir al modelo una explicación paso a paso, aprovechando su pipeline image-text-to-text.
- Tutoría conversacional multi-turno: mantener sesiones de preguntas y respuestas con contexto acumulado, ajustando `-c` según la longitud de la conversación (el ejemplo oficial usa 8192).
- Prototipado de aplicaciones educativas sin conexión: integrar el servidor local compatible con la API OpenAI en una aplicación web o de escritorio para entornos con conectividad limitada o requisitos de privacidad.
- Generación de ejercicios y resúmenes: producir preguntas, resúmenes o explicaciones alternativas a partir de textos e imágenes de un temario.
- Evaluación comparativa de cuantizaciones: usar las cuatro variantes (BF16, Q8_0, Q6_K, Q4_K_M) para medir la pérdida de calidad frente al coste de memoria en un mismo caso de uso educativo.
- Despliegue en estaciones de trabajo con GPU de consumo: servir el modelo con la cuantización Q6_K o Q4_K_M en una RTX 4090 o similar para uso interactivo de un solo usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo principal): BF16 ≈ 16,7 GiB; Q8_0 ≈ 8,9 GiB; Q6_K ≈ 6,9 GiB; Q4_K_M ≈ 5,2 GiB. Hay que añadir el proyector multimodal mmproj F16 y la memoria para el contexto KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) permite BF16 con margen; una GPU de 12-16 GB cubre Q6_K y Q4_K_M con contexto moderado.
- GPU de consumo: Q4_K_M (5,24 GiB) y Q6_K (6,85 GiB) caben en tarjetas de 8-12 GB de VRAM; Q8_0 requiere al menos 12 GB y BF16 al menos 24 GB.
- Despliegue: llama.cpp mediante `llama-server` (ejemplo oficial con `--mmproj mmproj-OmniEdu-9B-F16.gguf --reasoning off -c 8192`); también es compatible con otros frontends que consuman GGUF a través de llama.cpp. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Omni-Edu-9B-GGUF (este) | 8,95B | no disponible | imagen-texto-texto | other | GGUF |
| Omni-Edu-9B (base) | 8,95B | no disponible | imagen-texto-texto | other | safetensors (según repo base) |
| OpenDCAI/Omni-Edu-9B-GGUF | 9B (según nombre) | no disponible | imagen-texto-texto | other | GGUF |

No se dispone de datos de rendimiento ni de benchmarks que permitan comparar estos modelos con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy limitada: no hay model card detallada, datos de entrenamiento, idiomas ni benchmarks, lo que dificulta evaluar su calidad antes de usarlo.
- Licencia "other": es imprescindible revisar los términos del modelo base Omni-Edu-9B antes de cualquier uso comercial; el repositorio GGUF remite explícitamente a ellos.
- Riesgo de alucinación y sesgos: no documentados por el autor; deben asumirse los habituales en modelos de lenguaje de este tamaño.
- Idiomas soportados no confirmados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del que se usó en el ajuste.
- Longitud de contexto no especificada: el valor `-c 8192` del ejemplo es una configuración de ejecución, no necesariamente el máximo del modelo.
- El modo de razonamiento puede añadir latencia y tokens de salida; el ejemplo oficial lo desactiva con `--reasoning off`.
- La entrada de imágenes requiere descargar y cargar el archivo mmproj por separado; sin él, el modelo solo procesa texto.
- Repositorio con 0 likes y creado recientemente: menor trazabilidad y soporte comunitario que modelos de organizaciones consolidadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lhpku20010120/Omni-Edu-9B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-9B
- Repositorio GGUF alternativo (OpenDCAI): https://huggingface.co/OpenDCAI/Omni-Edu-9B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
