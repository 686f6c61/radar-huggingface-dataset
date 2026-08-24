# mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `junafinity/Qwen-3.8-27B-Uncensored`, una versión "abliterated" (sin censura) del modelo Qwen 3.8 de 27 mil millones de parámetros. El autor, mradermacher, se dedica a producir cuantizaciones optimizadas para ejecución local, y este repositorio ofrece un único archivo cuantizado en formato i1-Q2_K, además del archivo imatrix para que el usuario pueda generar sus propias cuantizaciones.

El modelo es multimodal (image-text-to-text), lo que significa que puede procesar tanto imágenes como texto, y está etiquetado con los tags `qwen3_5`, `abliterated`, `uncensored` y `zerofuse`. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés. Su relevancia radica en ofrecer una alternativa sin filtros de contenido para ejecución en hardware local, aprovechando la cuantización GGUF para reducir los requisitos de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal de la familia Qwen 3.8, sin especificación detallada) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB) y archivo imatrix (0,1 GB). Se mencionan otros tipos en el repositorio estático asociado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix para cuantización personalizada) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por las etiquetas y el pipeline declarado (`image-text-to-text`), se trata de un modelo multimodal que combina un codificador visual con un transformador de lenguaje, probablemente similar a otros modelos de la serie Qwen 3.8, pero no se confirma en la documentación proporcionada. El proceso de "abliteration" aplicado por `junafinity` elimina las capas de rechazo de contenido del modelo original, dando lugar a una versión sin censura. La cuantización imatrix de mradermacher utiliza matrices de importancia para mejorar la calidad de los pesos cuantizados, especialmente en los niveles de precisión más bajos. No se han publicado datos sobre el entrenamiento, el número de tokens utilizados ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento: al ser un LLM de 27B, es capaz de mantener conversaciones, responder preguntas y realizar tareas de razonamiento básico, aunque no se aportan benchmarks específicos.
- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas como descripción de imágenes, respuesta a preguntas visuales o análisis de documentos escaneados.
- Sin censura: gracias a la abliteration, el modelo no aplica los filtros de contenido habituales, lo que permite generar respuestas sobre temas que otros modelos rechazarían.
- Cuantización GGUF: optimizado para ejecución local con llama.cpp, Ollama u otros motores compatibles, con un único archivo de 11 GB para el nivel Q2_K.
- Soporte de tool calling y agentes: no se menciona en la información disponible.
- Multilingüismo: limitado al inglés, según la etiqueta `language: en`.

## Casos de uso

- Investigación en IA sin restricciones: el modelo permite estudiar el comportamiento de un LLM sin filtros de contenido, útil para analizar sesgos, alucinaciones o la efectividad de técnicas de abliteration.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos con temáticas que otros modelos censurarían, gracias a su naturaleza uncensored.
- Análisis de imágenes en entornos locales: al ser multimodal, puede procesar capturas de pantalla, fotografías o diagramas y generar descripciones o respuestas textuales sin depender de servicios en la nube.
- Asistentes conversacionales privados: desplegado en local con llama.cpp u Ollama, sirve como base para un chatbot que no envía datos a servidores externos y que no impone restricciones temáticas.
- Experimentación con cuantización: el archivo imatrix incluido permite a los desarrolladores generar sus propios niveles de cuantización (Q3, Q4, Q5, etc.) y comparar la degradación de calidad frente al modelo original.
- Prototipado de aplicaciones de visión por computador: integración en pipelines que requieren entender imágenes y generar texto, como accesibilidad para personas con discapacidad visual o automatización de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- El archivo cuantizado i1-Q2_K ocupa 11,0 GB, por lo que se necesita al menos 12-16 GB de VRAM para inferencia en GPU, dependiendo del overhead del contexto y del procesador de imágenes (mmproj).
- GPUs recomendadas: tarjetas con 16 GB o más, como RTX 3090, RTX 4090, A5000 o superiores. También puede ejecutarse en CPU con suficiente RAM (16-32 GB) usando llama.cpp.
- En GPUs de consumo como RTX 3060 (12 GB) podría caber con un contexto reducido, pero no está garantizado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. No se menciona soporte para vLLM o TGI en este repositorio.
- Latencia y throughput: no se proporcionan datos. En una RTX 4090, un modelo de 27B en Q2_K podría generar entre 20 y 40 tokens por segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base Qwen 3.8 27B no tiene datos públicos de rendimiento en esta documentación, y las alternativas sin censura (como otros modelos abliterated) no están documentadas aquí. Se recomienda consultar benchmarks independientes antes de elegir.

## Limitaciones y advertencias

- Idioma limitado: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Cuantización agresiva: el nivel Q2_K es de baja precisión y puede degradar notablemente la calidad de las respuestas, aumentar las alucinaciones y reducir la coherencia en tareas complejas.
- Contenido sin filtrar: al ser uncensored, el modelo puede generar contenido ofensivo, ilegal o perjudicial. No es adecuado para aplicaciones orientadas al público general sin una capa de moderación externa.
- Sesgos y alucinaciones: no se han evaluado los sesgos del modelo base ni su tasa de alucinación; al ser una versión sin censura, estos riesgos pueden verse amplificados.
- Licencia: aunque la licencia es Apache 2.0, el modelo base puede tener restricciones adicionales no documentadas en este repositorio. Se recomienda revisar la página de `junafinity/Qwen-3.8-27B-Uncensored` antes de un uso comercial.
- Sin soporte de tool calling: no se indica que el modelo soporte funciones externas, lo que limita su integración en agentes autónomos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-i1-GGUF
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Blog sobre la versión GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub relacionado: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
