# gcoli/qwen3.5-4b-diktat-de-ch-oQ4e

## Resumen

El modelo gcoli/qwen3.5-4b-diktat-de-ch-oQ4e es una cuantización de precisión mixta (oQ4e) del modelo gcoli/qwen3.5-4b-diktat-de-ch, un finetune LoRA del modelo Qwen3.5-4B de Alibaba. Está diseñado específicamente para corregir texto de dictado en alemán suizo estándar (de-CH), es decir, la salida de un sistema de reconocimiento de voz (STT). El modelo añade puntuación y mayúsculas, elimina muletillas como "äh" o "ähm", restaura umlauts y convierte sistemáticamente "ß" en "ss", preservando los helvetismos. Es una herramienta especializada para flujos de transcripción en entornos suizos.

La cuantización oQ4e, generada con oMLX v0.5.7, utiliza 4 bits como base con capas sensibles elevadas a 5-6 bits, lo que reduce el tamaño del archivo a 2.5 GB manteniendo una calidad cercana al modelo original. El modelo se distribuye en formato MLX-Safetensors y está pensado para ejecutarse en Apple Silicon, aunque también hay variantes GGUF para otros entornos. Es importante destacar que este modelo no es adecuado para alemán de Alemania o Austria, ya que "suiziza" los textos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (Qwen3.5-4B) |
| Parametros totales | 4.000 millones (modelo base); el archivo cuantizado contiene 688.221.696 parámetros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la información) |
| Tipos de cuantizacion | oQ4e (4-bit mixto con capas a 5-6 bit), además de variantes GGUF f16, q8_0 y q4_k_m |
| Idiomas soportados | Alemán suizo estándar (de-CH) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX-Safetensors (también GGUF en variantes) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer híbrido que combina atención lineal y atención completa. Sobre este, el autor gcoli realizó un finetune LoRA con rango 8 y 300 iteraciones usando mlx_lm 0.31.3, con el objetivo de especializarlo en la corrección de dictados en alemán suizo. El entrenamiento se realizó con un dataset sintético generado a partir de plantillas degradadas, y el modelo fue entrenado con el bloque de pensamiento (thinking) desactivado, por lo que se recomienda usar `enable_thinking=False` en el chat template.

La cuantización oQ4e se generó con oMLX v0.5.7 sobre el checkpoint bf16 fusionado. Utiliza una estrategia de precisión mixta: capas base a 4 bits con grupo de 64 (afín), y capas sensibles (proyecciones de atención lineal, algunos down_proj y capas de atención completa) elevadas a 5-6 bits. Esto permite reducir el tamaño a 2.5 GB manteniendo la calidad. Los detalles completos están en `oq_imatrix_report.json`.

## Capacidades

- Corrección de texto de dictado (salida de STT) en alemán suizo estándar: añade puntuación y mayúsculas.
- Eliminación de muletillas y rellenos como "äh", "ähm", "also", "halt".
- Restauración de umlauts (ue/ae/oe → ü/ä/ö).
- Conversión sistemática de "ß" a "ss", siguiendo la norma suiza.
- Preservación de helvetismos (innert, Offerte, parkieren, Velo, etc.).
- No altera el contenido semántico del texto original.
- No soporta razonamiento, generación de código, matemáticas ni otras tareas generales; es un modelo especializado de una sola tarea.

## Casos de uso

- Transcripción de reuniones y actas en entornos suizos: el modelo puede procesar la salida de un sistema de dictado por voz y generar un texto limpio y bien puntuado listo para su revisión.
- Subtitulado automático de vídeos en alemán suizo: al integrarse en un pipeline de STT, produce subtítulos corregidos sin necesidad de edición manual.
- Corrección de entrevistas o testimonios en investigación: los investigadores pueden transcribir audio y obtener texto normalizado sin perder los helvetismos.
- Asistencia a personas con discapacidad que utilizan dictado por voz: el modelo mejora la precisión del texto final, reduciendo errores de puntuación y ortografía.
- Generación de documentación médica en clínicas suizas: los profesionales pueden dictar informes y el modelo los convierte en texto estructurado y correcto.
- Preprocesamiento de datos para entrenamiento de modelos de lenguaje: al normalizar transcripciones, se pueden crear datasets de alta calidad en de-CH.

## Benchmarks y rendimiento

La evaluación del checkpoint bf16 (no de la cuantización oQ4e) sobre un test split de 174 muestras con decodificación greedy arroja los siguientes resultados:

| Metrica | Modelo base (Qwen3.5-4B) | Finetune bf16 |
|---|---|---|
| exact_match | 0.374 | 1.000 |
| char_error | 0.059 | 0.000 |
| ß en output | 27 | 0 |

Estos resultados son optimistas porque los datos de entrenamiento y prueba son sintéticos (template corpus degradado). La cuantización oQ4e no ha sido evaluada por separado, por lo que no se dispone de métricas para esta versión.

## Requisitos de hardware

- El archivo cuantizado ocupa 2.5 GB, por lo que puede cargarse en GPUs con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o Apple Silicon con 8 GB unificados).
- Al ser un modelo de 4B parámetros cuantizado, es adecuado para inferencia en tiempo real en hardware de consumo.
- Se ejecuta de forma nativa en Apple Silicon mediante MLX (mlx_lm) y oMLX.
- Las variantes GGUF permiten su uso con llama.cpp, Ollama y otros motores compatibles.
- No se han publicado datos de latencia o throughput específicos, pero dado el tamaño, es esperable una velocidad de decodificación de decenas de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de corrección de dictado en alemán suizo. Como referencia, se puede comparar con el modelo base Qwen3.5-4B, que no está especializado y mostraría una tasa de error de caracteres del 5.9% en esta tarea, frente al 0% del finetune. No hay alternativas conocidas en el ecosistema de modelos abiertos para esta tarea específica.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para alemán suizo estándar (de-CH). No debe usarse con alemán de Alemania o Austria, ya que convertirá sistemáticamente "ß" en "ss" y mantendrá helvetismos, lo que resultaría en textos "suizizados" inapropiados.
- No corrige dialecto suizo-alemán (Schwyzerdütsch); solo texto estándar.
- Los datos de entrenamiento y prueba son sintéticos, por lo que el rendimiento en datos reales puede ser inferior al reportado.
- La cuantización oQ4e no ha sido evaluada de forma independiente; aunque se espera una degradación mínima, no hay métricas que lo confirmen.
- El modelo no es adecuado para tareas generales de generación de texto, razonamiento o código.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B.

## Enlaces

- [Modelo cuantizado oQ4e en HuggingFace](https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-oQ4e)
- [Modelo base bf16](https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch)
- [Variante GGUF f16](https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-f16-GGUF)
- [Variante GGUF q8_0](https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-q8_0-GGUF)
- [Variante GGUF q4_k_m](https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-q4_k_m-GGUF)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
