# Chinasky71/translategemma-12b-it-subtitles

## Resumen

TranslateGemma 12B IT Subtitles es un ajuste fino del modelo google/translategemma-12b-it, desarrollado por el usuario independiente Chinasky71, especializado en la traducción de subtítulos de inglés a italiano. Partiendo de la arquitectura Gemma 3 de 12B parámetros (12.187.325.040 parámetros reales según los pesos en safetensors), el modelo conserva el formato de chat del modelo base y ha sido entrenado específicamente para líneas de diálogo cortas, de una o dos líneas, propias de la subtitulación cinematográfica.

El modelo se distribuye en precisión completa (bfloat16) mediante cinco archivos safetensors que ocupan aproximadamente 24 GB, y forma parte del ecosistema de la herramienta Transcriber Pro, que lo utiliza para traducir subtítulos en producción. Existe además una versión cuantizada en GGUF orientada a tarjetas gráficas de 8-12 GB y a hardware AMD con Vulkan, publicada en un repositorio separado del mismo autor.

Su relevancia radica en que aborda una tarea concreta y con restricciones propias —la traducción de diálogo hablado en formato de subtítulo— en lugar de la traducción genérica de documentos, y lo hace con un modelo de 12B parámetros que cabe en GPUs de consumo mediante cuantización. La licencia es la Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only multimodal, image-text-to-text) |
| Parametros totales | 12.187.325.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos publicados); 4-bit NF4; GGUF Q4_K_M, IQ3_M, Q3_K_M (en repositorio GGUF separado) |
| Idiomas soportados | en → it (otras direcciones no evaluadas) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (5 archivos, bfloat16, ~24 GB) y GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only con capacidades multimodales de tipo image-text-to-text, según indican las etiquetas del repositorio y la clase `AutoModelForImageTextToText` empleada en el ejemplo de uso. El checkpoint publicado son pesos fusionados (merged) en bfloat16, resultado de un ajuste fino sobre google/translategemma-12b-it orientado a la traducción de líneas de subtítulo de inglés a italiano.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado. La model card tampoco detalla innovaciones técnicas específicas del ajuste (como decodificación especulativa o atención lineal); únicamente indica que la aplicación utiliza decodificación greedy y que traduce una línea de subtítulo o un bloque corto cada vez.

El modelo conserva el formato de chat del modelo base TranslateGemma: un único turno de usuario cuyo contenido incluye los códigos de idioma de origen y destino junto con el texto a traducir, mediante los campos `source_lang_code`, `target_lang_code` y `text`.

## Capacidades

- Traducción de texto de inglés a italiano, especializada en líneas de subtítulo cortas (una o dos líneas de diálogo hablado).
- Generación de texto y traducción condicionada por códigos de idioma explícitos en el mensaje de usuario.
- Procesamiento multimodal de entrada image-text-to-text, heredado de la arquitectura Gemma 3 (no evaluado para esta tarea en el ajuste).
- Formato de chat compatible con `apply_chat_template` de transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni otras capacidades especiales para este checkpoint.

## Casos de uso

- Traducción de subtítulos para cine y series: el modelo está entrenado específicamente con líneas de diálogo de películas y traduce una línea o un bloque corto por invocación con decodificación greedy, lo que encaja con el flujo de trabajo de herramientas de subtitulado como Transcriber Pro.
- Integración en pipelines de postproducción audiovisual: al mantener el formato de chat del modelo base y ser compatible con text-generation-inference, puede desplegarse como servicio y consumirse desde herramientas de gestión de subtítulos.
- Despliegue en estaciones de trabajo con GPU de consumo: las versiones GGUF (Q4_K_M, IQ3_M, Q3_K_M) permiten ejecutar el modelo en tarjetas de 8-12 GB y en hardware AMD vía Vulkan, lo que habilita la traducción local sin depender de servicios en la nube.
- Traducción asistida con revisión humana: dado que la model card recomienda revisar la salida antes de publicar, encaja en flujos donde un editor humano valida las líneas generadas antes de su emisión.
- Prototipado de sistemas de traducción especializados en diálogo: sirve como punto de partida para experimentar con ajustes finos adicionales sobre la arquitectura Gemma 3 en el par inglés-italiano.
- Evaluación comparativa de cuantizaciones: el autor publica métricas de tasa de error grave para distintas cuantizaciones (bfloat16 vía NF4, Q4_K_M, IQ3_M, Q3_K_M), lo que permite seleccionar el equilibrio entre calidad y requisitos de memoria en función del hardware disponible.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de error grave, 4-bit NF4 (900 líneas de subtítulo de dos películas reservadas) | 6,6 % |
| Tasa de error grave, GGUF Q4_K_M | 6,2 % |
| Tasa de error grave, GGUF IQ3_M | 7,1 % |
| Tasa de error grave, GGUF Q3_K_M | 7,4 % |

Las cifras proceden de un juicio ciego sobre 900 líneas de subtítulo de dos películas no vistas durante el entrenamiento. El autor declara que las cuantizaciones GGUF no son inferiores al modelo en 4-bit NF4 con un margen de 3 puntos. Advertencias metodológicas indicadas en la model card: un único tipo de juez, un único tipo de material (películas) y únicamente la dirección inglés-italiano. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 24 GB, según indica la model card.
- VRAM estimada en 4-bit NF4: no disponible de forma explícita; el autor la emplea como referencia de calidad y la compara con cuantizaciones GGUF orientadas a 8-12 GB.
- VRAM estimada en GGUF: el repositorio GGUF está pensado para tarjetas gráficas de 8-12 GB (Q4_K_M, IQ3_M, Q3_K_M).
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, mediante las cuantizaciones GGUF para tarjetas de 8-12 GB; en bfloat16 requiere aproximadamente 24 GB.
- Opciones de despliegue: transformers (con `AutoProcessor` y `AutoModelForImageTextToText`), llama.cpp/GGUF, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Chinasky71/translategemma-12b-it-subtitles | 12,19 B | no disponible | en → it | Gemma Terms of Use | safetensors, GGUF |
| google/translategemma-12b-it (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Gemma Terms of Use | no disponible en la informacion |
| Chinasky71/translategemma-12b-it-subtitles-gguf | 12,19 B (derivado) | no disponible | en → it | Gemma Terms of Use | GGUF |

No se dispone de datos de rendimiento comparativo con modelos alternativos de traducción en la información proporcionada. El modelo base google/translategemma-12b-it es la referencia directa, del que este checkpoint es un ajuste fino fusionado en bfloat16.

## Limitaciones y advertencias

- Solo se ha evaluado la dirección inglés → italiano; no hay evaluación de otros pares de idiomas.
- No se ha evaluado en documentos largos ni en texto no hablado: está diseñado para líneas de subtítulo cortas.
- El género gramatical del hablante no se puede inferir de una sola línea; Transcriber Pro lo corrige en un paso separado, por lo que en uso aislado pueden aparecer errores de concordancia de género.
- La evaluación de calidad se basa en un único tipo de juez y en un único tipo de material (películas), lo que limita la generalización de las cifras de error.
- Riesgo de alucinación y de errores de traducción propio de cualquier sistema de traducción automática; la model card recomienda revisar la salida antes de publicarla.
- Licencia Gemma Terms of Use, incluida la Gemma Prohibited Use Policy, que se aplica tanto a este modelo como a cualquier uso derivado; es obligatorio conservar el aviso de licencia al redistribuir.
- El ejemplo de uso con transformers no fue ejecutado de extremo a extremo por el autor sobre este checkpoint; el proyecto lo ejecuta mediante GGUF/llama.cpp y 4-bit NF4.
- No se dispone de información sobre sesgos específicos del ajuste ni sobre la longitud de contexto soportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chinasky71/translategemma-12b-it-subtitles
- Versión GGUF: https://huggingface.co/Chinasky71/translategemma-12b-it-subtitles-gguf
- Modelo base: https://huggingface.co/google/translategemma-12b-it
- Repositorio del proyecto Transcriber Pro: https://github.com/chinasky71-byte/TranscriberPro
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
