# aisingapore/Gemma-SEA-LION-v4-4B-VL-GGUF

## Resumen

Gemma-SEA-LION-v4-4B-VL es un modelo de visión y lenguaje (VLM) de 4 mil millones de parámetros desarrollado por el AI Products Pillar de AI Singapore, con financiación del Singapore NRF. Forma parte de la colección SEA-LION (Southeast Asian Languages In One Network), una familia de modelos diseñados específicamente para el sudeste asiático. El modelo se construye sobre la arquitectura de google/gemma-3-4b-it y se somete a un post-entrenamiento riguroso con aproximadamente 6,7 millones de pares de instrucción-texto para adaptarlo a los idiomas y contextos culturales de la región.

La relevancia de este modelo radica en su enfoque multilingüe y multicultural, cubriendo idiomas como indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo, que suelen estar infrarrepresentados en los modelos de propósito general. Además, hereda las capacidades de imagen y texto de gemma-3-4b-it, incluyendo una ventana de contexto de 128K tokens. El modelo también incorpora capacidades de function calling y parsing visual en tailandés, chino e inglés, lo que lo hace adecuado para aplicaciones de tool calling y tareas multimodales en entornos con restricciones de memoria.

Este repositorio contiene los pesos en formato GGUF, lo que permite su ejecución eficiente en dispositivos de gama baja y edge, así como en CPU mediante herramientas como llama.cpp. Es una opción ligera dentro de la familia SEA-LION v4, pensada para despliegues con limitaciones de latencia y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder basado en gemma-3-4b-it (VLM) |
| Parametros totales | 3.880.263.168 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 (GGUF) |
| Idiomas soportados | birmano, filipino, indonesio, malayo, tamil, tailandes, vietnamita, ingles, chino |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de google/gemma-3-4b-it, un decoder transformer con capacidades multimodales (imagen y texto). El tokenizador es el predeterminado de gemma-3-4b-it, sin modificaciones. Sobre esta base, AI Singapore realizó un post-entrenamiento con un dataset curado de aproximadamente 6,7 millones de pares de instrucción-texto, diseñado para inculcar fluidez multilingüe y multicultural en los idiomas del sudeste asiático.

El dataset de entrenamiento incluye datos en birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, recopilados de fuentes web, código, datasets open-source y datos generados sintéticamente. En total, se utilizaron 500 mil millones de tokens muestreados de un bucket de 1 billón de tokens. Además del ajuste lingüístico, se incorporó un conjunto filtrado de pares de instrucción-texto para tool calling, y se experimentó con capacidades de parsing visual en tailandés, chino e inglés.

## Capacidades

- Generación de texto y razonamiento multilingüe, con especial énfasis en idiomas del sudeste asiático (indonesio, vietnamita, tailandés, filipino, tamil, birmano, malayo).
- Comprensión de imágenes (visión) heredada de gemma-3-4b-it, incluyendo parsing visual en tailandés, chino e inglés.
- Soporte de function calling / tool calling, gracias al post-entrenamiento con pares de instrucción específicos.
- Ventana de contexto larga de 128K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidades conversacionales y de instrucción (instruct-tuned).
- Compatible con pipelines de imagen-texto-a-texto (image-text-to-text).

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, tailandés o vietnamita, con contexto largo de 128K tokens para mantener el historial completo de la interacción. Su licencia Gemma permite uso comercial.
- Asistente de visión para documentación en tailandés o chino: gracias al parsing visual en estos idiomas, puede extraer información de imágenes de facturas, formularios o capturas de pantalla en entornos empresariales.
- Despliegue en dispositivos edge o móviles: al ser un modelo de 4B en formato GGUF con cuantizaciones Q4_K_M, puede ejecutarse en hardware con poca memoria, como Raspberry Pi o smartphones, para aplicaciones de traducción o asistencia offline.
- Integración en pipelines de automatización con tool calling: el modelo puede conectarse a APIs y herramientas externas mediante function calling, permitiendo la creación de agentes que consulten bases de datos, envíen correos o interactúen con servicios web en idiomas de la región.
- Análisis de sentimiento y moderación de contenido en redes sociales: su entrenamiento en idiomas del sudeste asiático lo hace adecuado para monitorizar comentarios y publicaciones en plataformas locales, detectando problemas de calidad o cumplimiento.
- Asistente educativo para aprendizaje de idiomas: puede generar explicaciones, ejercicios y correcciones en los idiomas cubiertos, aprovechando su fluidez multilingüe y su capacidad de procesar imágenes para materiales didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 2,5-3 GB, por lo que cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB). La versión F16 requiere unos 8 GB de VRAM.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100. Para CPU, puede ejecutarse con llama.cpp en equipos con al menos 8 GB de RAM.
- Sí cabe en consumer GPU: la versión Q4_K_M es viable en GPUs de 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (incluyendo llama-cli y llama-mtmd-cli para entrada de imagen), Ollama, y cualquier herramienta compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo de 4B, se espera una generación rápida incluso en CPU con cuantización ligera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL | 4B | 128K | SEA + en, zh | Gemma | GGUF |
| google/gemma-3-4b-it | 4B | 128K | Multilingüe (limitado en SEA) | Gemma | safetensors, GGUF |
| aisingapore/Qwen-SEA-LION-v4-32B-IT | 32B | no disponible | SEA + en, zh | no disponible | 4-bit, 8-bit |

El modelo se diferencia de gemma-3-4b-it por su post-entrenamiento específico para el sudeste asiático, que mejora la fluidez en idiomas como tailandés, vietnamita o birmano, y añade function calling. Frente a Qwen-SEA-LION-v4-32B-IT, es mucho más ligero, lo que lo hace adecuado para entornos con restricciones de memoria, aunque con menor capacidad bruta.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con datos web y sintéticos, puede reflejar sesgos presentes en esas fuentes, especialmente en contextos culturales específicos del sudeste asiático.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: aunque cubre varios idiomas de la región, no incluye todos los dialectos o variantes, y el rendimiento puede variar entre idiomas.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y requisitos de atribución. Revisar los términos completos en https://ai.google.dev/gemma/terms.
- Limitaciones de visión: las capacidades de parsing visual se experimentaron solo en tailandés, chino e inglés; el rendimiento en otros idiomas puede ser inferior.
- Para producción: se recomienda validar el modelo en el idioma y caso de uso específico antes de desplegarlo, dado que no se han publicado benchmarks oficiales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL-GGUF
- Modelo base (safetensors): https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Colección SEA-LION v4: https://huggingface.co/collections/aisingapore/sea-lion-v4
- Documentación SEA-LION v4: https://docs.sea-lion.ai/models/sea-lion-v4
- Documentación del modelo: https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-4b-vl
- Página en Ollama: https://ollama.com/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Licencia Gemma: https://ai.google.dev/gemma/terms
