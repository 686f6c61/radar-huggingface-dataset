# aisingapore/Gemma-SEA-LION-v4-4B-VL

## Resumen

Gemma-SEA-LION-v4-4B-VL es un modelo de visión y lenguaje (VLM) de 4.300 millones de parámetros desarrollado por AI Singapore, dentro de la iniciativa SEA-LION (Southeast Asian Languages In One Network). Está construido sobre la arquitectura de google/gemma-3-4b-it y ha sido sometido a un post-entrenamiento intensivo con aproximadamente 6,7 millones de pares de instrucción y texto para adaptarlo a las lenguas y contextos culturales del Sudeste Asiático. El modelo cubre idiomas como indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo, además de inglés y chino.

La relevancia de este modelo radica en que aborda un vacío importante: la mayoría de los modelos abiertos están optimizados para inglés y otros idiomas occidentales, dejando de lado las lenguas del Sudeste Asiático. Al heredar de gemma-3-4b-it una ventana de contexto de 128.000 tokens y capacidades multimodales (imagen y texto), este modelo permite construir aplicaciones que entienden tanto el contenido visual como el textual en un contexto regional específico. Además, se ha incorporado soporte para function calling, lo que facilita su integración en agentes y herramientas. Está disponible en formato safetensors y también en GGUF para despliegue ligero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer basado en gemma-3 (modelo denso) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | safetensors en BF16/FP16; versiones GGUF disponibles en repositorio separado |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, my |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un decoder transformer de 4.000 millones de parámetros con arquitectura Gemma 3, que ya incorpora capacidades multimodales (procesamiento de imágenes y texto) y una ventana de contexto de 128.000 tokens. Sobre esta base, AI Singapore realizó un post-entrenamiento con un conjunto de datos curado de aproximadamente 6,7 millones de pares instrucción-texto, diseñado para inculcar fluidez multilingüe y multicultural en las lenguas del Sudeste Asiático. El dataset incluye también un subconjunto filtrado de pares de instrucción para tool calling, con el objetivo de dotar al modelo de capacidades de invocación de funciones.

Además del ajuste lingüístico, se experimentó con dos mejoras adicionales: la incorporación de function calling para aplicaciones de herramientas y el refuerzo del parsing visual en tailandés, chino e inglés. El tokenizador es el mismo que el de gemma-3-4b-it, sin modificaciones. No se menciona explícitamente el uso de RLHF o DPO; el proceso se describe como post-entrenamiento supervisado sobre pares de instrucción.

## Capacidades

- Generación de texto multilingüe en inglés, chino, indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo, con especial énfasis en contextos culturales del Sudeste Asiático.
- Comprensión de imágenes (visión) heredada de gemma-3-4b-it, con parsing visual reforzado en tailandés, chino e inglés.
- Soporte de tool calling / function calling, permitiendo al modelo invocar funciones externas en aplicaciones de agentes.
- Ventana de contexto larga de 128.000 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Capacidades de razonamiento y generación de código heredadas del modelo base, aunque no se han publicado benchmarks específicos para esta versión.
- Disponible en formato GGUF para despliegue en entornos con recursos limitados (edge, móvil).

## Casos de uso

- Atención al cliente automatizada en el Sudeste Asiático: el modelo puede gestionar conversaciones multi-turno en idiomas como indonesio, tailandés o vietnamita, con contexto largo de 128.000 tokens para mantener el historial completo de la interacción. Su soporte de function calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Asistentes de búsqueda inmobiliaria: como muestra el ejemplo de la model card, el modelo puede combinar comprensión de imágenes (por ejemplo, una foto de una propiedad) con tool calling para consultar bases de datos de anuncios (HDB, condominios) y calcular hipotecas, todo en una misma conversación.
- Análisis de documentos con contenido visual: procesar facturas, formularios o capturas de pantalla en idiomas locales, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Chatbots de comercio electrónico regional: recomendación de productos, seguimiento de pedidos y resolución de incidencias en los idiomas de la región, con capacidad de interpretar imágenes de productos enviadas por los usuarios.
- Traducción y transcripción asistida: traducción entre inglés y las lenguas del Sudeste Asiático, así como descripción de imágenes en estos idiomas, útil para subtitulado o generación de contenido localizado.
- Aplicaciones en dispositivos edge o móviles: gracias a su tamaño de 4,3 B parámetros y a la disponibilidad de cuantizaciones GGUF, puede desplegarse en smartphones o dispositivos con memoria limitada para asistentes offline en idiomas locales.
- Educación y contenido cultural: generación de material didáctico, resúmenes de textos históricos o explicaciones de conceptos en lenguas minoritarias, con sensibilidad a los contextos culturales de la región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con MMLU, HumanEval, GSM8K u otros estándares, ni datos de rendimiento específicos para esta versión. Se recomienda evaluar el modelo en los casos de uso concretos antes de su adopción en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 8,6 GB (tamaño del repositorio safetensors). Con cuantización GGUF Q4, el peso puede reducirse a unos 3-4 GB, permitiendo su ejecución en GPUs con 6 GB de VRAM o menos.
- GPU recomendadas: para inferencia en BF16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10) es suficiente. Para cuantizaciones ligeras, GPUs de 6-8 GB (RTX 3060 8GB, RTX 4060) pueden funcionar.
- En consumer GPU: sí, cabe en GPUs de gama media y alta. También puede ejecutarse en CPU con cuantización GGUF, aunque con mayor latencia.
- Opciones de despliegue: transformers (Hugging Face), vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (disponible en la biblioteca de Ollama).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 4,3 B parámetros, se puede esperar una generación de decenas de tokens por segundo en GPUs modernas, pero depende de la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL | 4,3 B | 128k | en, zh, vi, id, th, fil, ta, ms, my | Gemma | VLM con tool calling, adaptado a SEA |
| google/gemma-3-4b-it | 4 B | 128k | Multilingüe (principalmente en) | Gemma | Modelo base, sin adaptación regional |
| Qwen-SEA-LION-v4-4B-VL | 4 B (aprox.) | 128k (aprox.) | en, zh, vi, id, th, fil, ta, ms, my | Apache 2.0 (Qwen) | Variante hermana sobre Qwen, misma familia SEA-LION |
| Llama-3.2-3B | 3,2 B | 128k | Multilingüe (limitado SEA) | Llama 3.2 | Sin visión, sin adaptación regional |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estos modelos. La comparativa se basa en características declaradas. La nueva versión recomendada por el autor es aisingapore/Qwen-SEA-LION-v4.5-27B-IT, de mayor tamaño.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad. La model card indica explícitamente que no se ha sometido a un proceso de alineación con valores de seguridad, por lo que los desarrolladores deben realizar su propio fine-tuning de seguridad antes de usarlo en producción.
- Riesgo de alucinación: como muchos LLMs, puede generar contenido ficticio o irrelevante no fundamentado en el contexto proporcionado. Se recomienda validar las respuestas en aplicaciones críticas.
- No ha sido probado contra ataques adversariales (adversarial prompting), lo que lo hace potencialmente vulnerable a entradas maliciosas.
- Limitaciones idiomáticas: aunque cubre nueve idiomas, el rendimiento puede variar entre ellos; no se han publicado métricas de calidad por idioma.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones sobre usos prohibidos y la obligación de mantener los avisos de atribución. Es necesario revisar los términos completos antes de un uso comercial.
- El modelo no incluye capacidades de audio ni de video; solo procesa imágenes estáticas y texto.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Versión GGUF: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL-GGUF
- Documentación SEA-LION v4: https://docs.sea-lion.ai/models/sea-lion-v4
- Repositorio GitHub de SEA-LION: https://github.com/aisingapore/sealion
- Página en Ollama: https://ollama.com/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Colección SEA-LION v4 en Hugging Face: https://huggingface.co/collections/aisingapore/sea-lion-v4
