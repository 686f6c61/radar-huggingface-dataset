# Mungert/s1-mini-GGUF

## Resumen

s1-mini es un modelo de normalización de texto para transcripciones de voz a texto (ASR), desarrollado por Superwhisper y publicado en formato GGUF por Mungert. Se trata de un fine-tuning del modelo Qwen/Qwen3-0.6B, con 596 millones de parámetros únicos (751,6 millones de elementos de tensor en los pesos), que transforma transcripciones ASR crudas en texto escrito limpio: elimina muletillas, resuelve falsos inicios y autocorrecciones, aplica puntuación y capitalización, y convierte números, fechas, horas, moneda y direcciones de correo hablados a su forma escrita. Alcanza un 94,8 % de precisión de tokens en un conjunto de 7.519 casos en inglés, y su versión cuantizada ocupa 462 MiB, lo que permite ejecutarlo cómodamente en la CPU de un portátil.

El modelo está diseñado para una tarea única y no es un modelo de chat: no sigue instrucciones generales, sino que se controla mediante una línea de control al inicio de la entrada que especifica estilo, estructura y contexto. Esta especialización lo hace especialmente relevante para aplicaciones de dictado, subtitulado automático y post-procesado de transcripciones, donde la salida del ASR suele carecer de puntuación y contener errores típicos del habla. La versión v1 cubre únicamente el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model (Transformer), fine-tuning de Qwen/Qwen3-0.6B |
| Parámetros totales | 751.632.384 elementos de tensor (596M parámetros únicos según el autor; la diferencia se debe a la duplicación de lm_head) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; entrada recomendada hasta ~1.000 tokens |
| Tipos de cuantización | GGUF (múltiples cuantizaciones; el repo tiene 24.3 GB e incluye un build de 462 MiB) |
| Idiomas soportados | Inglés (en) |
| Licencia | s1-mini-license (Apache 2.0 + cláusula de nombre según la model card original) |
| Formato de pesos | GGUF (este repo); safetensors en el repositorio original |

## Arquitectura y entrenamiento

s1-mini es un modelo causal de lenguaje basado en Qwen3-0.6B, fine-tuneado para una única tarea de transformación: normalizar transcripciones ASR. La arquitectura consta de 28 capas, 16 cabezas de atención para queries y 8 para keys/values (GQA), con embeddings atados. La configuración de pesos se hereda de Qwen3-0.6B, lo que explica que el Hub reporte 0.8B parámetros: el archivo `model.safetensors` almacena `lm_head.weight` como una copia materializada del embedding de entrada, de modo que los 155,6 millones de parámetros del embedding se cuentan dos veces (751,6 millones de elementos de tensor frente a 596,0 millones de parámetros únicos). El modelo se entrena en precisión BF16.

El entrenamiento consiste en un fine-tuning supervisado sobre pares de transcripciones ASR crudas y sus versiones limpias. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el enfoque de tarea única: el modelo no es un chat generalista, sino un normalizador especializado que recibe una línea de control al inicio de la entrada (por ejemplo, `[Styling: semi-formal] [Structure: prose] [Context: general]`) y devuelve solo el texto limpio, sin preámbulos ni explicaciones.

## Capacidades

- Normalización de texto para ASR: elimina muletillas, resuelve falsos inicios y autocorrecciones, aplica puntuación y capitalización.
- Convierte números, fechas, horas, moneda y direcciones de correo hablados a su forma escrita.
- Control de estilo, estructura y contexto mediante una línea de control al inicio de la entrada (estilos como formal, semi-formal; estructuras como prosa o listas; contextos como general o email).
- Devuelve texto plano sin preámbulos; bajo `Structure: lists` puede generar viñetas Markdown, y bajo `Context: email` puede insertar líneas en blanco separando saludo, cuerpo y despedida.
- Si la entrada es solo relleno o ruido, la salida correcta es una cadena vacía, y eso es lo que produce.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades de visión o audio; es un modelo puramente de texto para una tarea específica.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Post-procesado en aplicaciones de dictado por voz: el modelo se integra como etapa final del pipeline ASR para convertir la transcripción cruda en texto limpio y listo para editar, eliminando muletillas y aplicando puntuación automática.
- Limpieza de transcripciones en herramientas de reuniones y notas de voz: las transcripciones generadas por ASR en reuniones suelen carecer de puntuación y contener falsos inicios; s1-mini los resuelve, mejorando la legibilidad y la utilidad de las notas.
- Normalización de subtítulos automáticos para vídeo: los subtítulos generados automáticamente pueden ser difíciles de leer; s1-mini aplica puntuación y capitalización, y convierte números y fechas habladas a forma escrita, lo que facilita la lectura.
- Preprocesado de textos para sistemas de NLP: antes de alimentar transcripciones a modelos de análisis de sentimiento, extracción de entidades o resumen, s1-mini normaliza el texto, reduciendo ruido y mejorando la calidad de los resultados.
- Conversión de dictados de datos estructurados: en aplicaciones de dictado médico, legal o financiero, el modelo convierte números, montos, fechas y horas habladas a su representación escrita, facilitando la generación de documentos formales.
- Integración en pipelines de ASR como etapa de post-procesado: s1-mini puede ejecutarse localmente en CPU gracias a su tamaño reducido (462 MiB cuantizado), lo que lo hace adecuado para aplicaciones de escritorio o edge computing sin dependencia de la nube.
- Mejora de la legibilidad en asistentes de voz: los asistentes que transcriben comandos o respuestas habladas pueden usar s1-mini para presentar el texto de forma más natural y estructurada, por ejemplo, en listas o correos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión de tokens (7.519 casos en inglés) | 94,8 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo está especializado en normalización de texto ASR, por lo que los benchmarks estándar de razonamiento o código no son aplicables. El build cuantizado de 462 MiB se ejecuta cómodamente en CPU de portátil, según el autor.

## Requisitos de hardware

- VRAM estimada: no disponible; el build cuantizado de 462 MiB se ejecuta en CPU sin necesidad de GPU.
- GPU recomendadas: ninguna en particular; cualquier CPU moderna es suficiente para el build cuantizado. Para el modelo completo en BF16, se necesitaría aproximadamente 1,2 GB de VRAM (596M parámetros x 2 bytes) más overhead, pero no hay datos oficiales.
- Cabe en GPU de consumo: sí, el modelo es pequeño y puede ejecutarse en GPUs de gama baja si se usa el build cuantizado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier framework compatible con GGUF. También puede usarse con transformers (>=4.51.0) si se cargan los pesos safetensors del repositorio original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la información proporcionada. El modelo es un fine-tuning especializado de Qwen/Qwen3-0.6B, y no se han encontrado datos de benchmarks de otros normalizadores de texto ASR que permitan una comparación directa. Se menciona en la búsqueda web el modelo `internlm/Intern-S1-mini-GGUF`, pero no se proporcionan especificaciones ni resultados que permitan comparar.

## Limitaciones y advertencias

- Solo cubre el idioma inglés; no soporta otros idiomas.
- No es un modelo de chat y no sigue instrucciones generales; intentar usarlo como asistente genérico dará resultados incorrectos.
- La entrada recomendada es de hasta ~1.000 tokens; transcripciones más largas deben trocearse, lo que puede perder contexto entre fragmentos.
- Riesgo de alucinación en la normalización: el modelo puede "corregir" incorrectamente palabras o frases ambiguas, alterando el significado original.
- La licencia es personalizada (`s1-mini-license`) e incluye una cláusula de nombre según la model card original; puede imponer restricciones de atribución o uso comercial que deben revisarse antes de integrarlo en producción.
- No se han publicado evaluaciones de sesgos en la información disponible.
- El repositorio GGUF de Mungert tiene 24.3 GB, lo que indica que incluye múltiples cuantizaciones; es necesario seleccionar el archivo adecuado según el hardware disponible.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Mungert/s1-mini-GGUF
- Repositorio original (safetensors): https://huggingface.co/superwhisper/s1-mini
- Repositorio GGUF original: https://huggingface.co/superwhisper/s1-mini-GGUF
- Paper (arXiv): https://arxiv.org/abs/2505.09388
- Sitio web de Superwhisper: https://superwhisper.com
