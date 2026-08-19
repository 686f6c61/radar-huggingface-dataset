# gcoli/qwen3.5-4b-diktat-de-ch

## Resumen

El modelo `gcoli/qwen3.5-4b-diktat-de-ch` es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el autor gcoli, especializado en la corrección de texto de dictado (salida de reconocimiento de voz, STT) en alemán estándar suizo (de-CH). El modelo resuelve el problema de convertir transcripciones automáticas crudas, sin puntuación, con mayúsculas incorrectas, muletillas y errores de ortografía típicos (como la confusión entre ß y ss), en texto corregido y listo para su uso, preservando el contenido exacto y los helvetismos propios del alemán suizo.

Se trata de un LoRA de rango 8 entrenado con 300 iteraciones sobre Qwen3.5-4B, fusionado posteriormente en un checkpoint único en formato bf16 safetensors, compatible con la librería MLX. El modelo está pensado exclusivamente para de-CH; no es adecuado para alemán de Alemania (de-DE) ni de Austria (de-AT), ya que escribe sistemáticamente "ss" en lugar de "ß" y mantiene expresiones suizas como "innert", "Offerte" o "parkieren". La relevancia actual radica en que ofrece una solución ligera (4.2 mil millones de parámetros) y de código abierto (licencia Apache 2.0) para un nicho lingüístico con poca oferta específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.749.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors); variantes oQ4e, f16, q8_0, q4_k_m (GGUF) disponibles en repos separados |
| Idiomas soportados | de (alemán estándar suizo, de-CH) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (variantes) |

## Arquitectura y entrenamiento

El modelo es un finetune LoRA de rango 8 sobre Qwen3.5-4B, entrenado con `mlx_lm` versión 0.31.3 durante 300 iteraciones. El adaptador LoRA se ha fusionado en el checkpoint final, lo que permite su uso directo con `mlx_lm.generate` o en entornos como oMLX. La arquitectura subyacente es la del modelo base Qwen3.5-4B, aunque no se proporcionan detalles adicionales sobre su estructura interna (número de capas, atención, etc.) en la información disponible.

El entrenamiento se realizó con datos sintéticos generados a partir de un corpus de plantillas degradadas, es decir, se crearon ejemplos de texto dictado con errores intencionales (falta de puntuación, mayúsculas, muletillas, etc.) y se entrenó al modelo para restaurarlos. No se menciona el uso de RLHF ni DPO. El finetune se diseñó con el bloque de pensamiento (thinking) desactivado, por lo que el modelo responde directamente sin generar una cadena de razonamiento interna.

## Capacidades

- Corrección de texto de dictado en alemán estándar suizo (de-CH): añade puntuación y mayúsculas, elimina muletillas (äh, ähm, also, halt), restaura umlauts (ue/ae/oe → ü/ä/ö) y convierte siempre ß en ss.
- Preservación del contenido original: el modelo mantiene el significado exacto del texto, sin añadir ni eliminar información.
- Mantenimiento de helvetismos: conserva expresiones propias del alemán suizo (innert, Offerte, parkieren, Velo) sin "corregirlas" a variantes alemanas o austriacas.
- No soporta dialecto suizo-alemán (Schweizerdeutsch): el entrenamiento solo incluye alemán estándar suizo, por lo que el input dialectal no se maneja correctamente.
- No incluye capacidades de tool calling, agentes, visión ni audio; es un modelo de texto puro orientado a una tarea específica.

## Casos de uso

- Transcripción de reuniones y actas en Suiza: el modelo puede procesar la salida de un sistema de reconocimiento de voz (por ejemplo, Whisper) y convertirla en un acta limpia y legible, con puntuación correcta y sin muletillas, lista para archivar o distribuir.
- Subtitulado automático de vídeos en de-CH: al corregir la transcripción automática, se obtienen subtítulos precisos y formateados, ahorrando tiempo de edición manual en producciones locales.
- Corrección de dictados médicos o legales: en entornos donde se dictan informes (hospitales, despachos de abogados), el modelo puede limpiar la transcripción y mantener la terminología suiza, reduciendo errores y trabajo de revisión.
- Preprocesamiento de datos de voz para NLP: los textos corregidos pueden usarse como entrada de alta calidad para otros modelos (resúmenes, análisis de sentimiento, extracción de entidades) en aplicaciones empresariales suizas.
- Generación de contenido editorial local: revistas o blogs que reciben artículos dictados pueden pasar el texto por el modelo para obtener una versión pulida, respetando las particularidades del alemán suizo.
- Asistentes de voz para el mercado suizo: integrado en un pipeline de STT, el modelo mejora la experiencia del usuario al devolver respuestas escritas correctamente formateadas, sin errores de puntuación ni muletillas.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un test split de 174 muestras con decodificación greedy, comparando el modelo base Qwen3.5-4B con el finetune:

| Metrica | Base | Finetune |
|---|---|---|
| exact_match | 0.374 | 1.000 |
| char_error | 0.059 | 0.000 |
| ß en el output | 27 | 0 |

El autor advierte explícitamente que los datos de entrenamiento y prueba son sintéticos (corpus de plantillas degradadas), por lo que estas métricas son optimistas y no reflejan necesariamente el rendimiento en datos reales. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni de GPU en la información disponible.
- Al tratarse de un modelo de 4.2 mil millones de parámetros, es razonable esperar que quepa en GPUs de consumo con al menos 8 GB de VRAM en cuantizaciones bajas (q4_k_m o q8_0), aunque esto es una estimación general y no un dato oficial.
- El checkpoint bf16 en safetensors ocupa aproximadamente 8.4 GB (tamaño del repositorio), por lo que necesitaría una GPU con al menos 10-12 GB de VRAM para inferencia sin cuantizar.
- Las variantes GGUF (f16, q8_0, q4_k_m) permiten ejecución en CPU o GPU con menor memoria mediante llama.cpp u Ollama.
- La librería MLX está optimizada para Apple Silicon (macOS), por lo que el modelo puede ejecutarse en Macs con Apple Silicon usando `mlx_lm.generate` u oMLX.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp (CPU/GPU), Ollama (si se convierte), o servidores de inferencia compatibles con GGUF.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para corrección de dictado en alemán suizo. El único punto de referencia directo es el modelo base Qwen3.5-4B, que sin el finetune obtiene un exact_match de 0.374 frente al 1.000 del finetune en la evaluación sintética. No se han encontrado alternativas comerciales o de código abierto con la misma especialización en de-CH en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para alemán estándar suizo (de-CH); su uso con alemán de Alemania o Austria producirá textos "suizizados" (por ejemplo, uso sistemático de "ss" en lugar de "ß"), lo que puede ser inaceptable en esos contextos.
- No maneja dialecto suizo-alemán (Schweizerdeutsch); el input dialectal no fue incluido en el entrenamiento y dará resultados incorrectos.
- Los datos de entrenamiento son sintéticos, lo que puede limitar la generalización a textos reales con errores más variados o ruido acústico.
- El modelo no tiene capacidades de razonamiento (thinking desactivado), por lo que no debe usarse para tareas que requieran análisis complejo o generación de texto creativo.
- No se garantiza la ausencia de alucinaciones, aunque la tarea de corrección es relativamente acotada; se recomienda validar los resultados en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch
- Variante oQ4e (oMLX): https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-oQ4e
- Variante f16 (GGUF): https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-f16-GGUF
- Variante q8_0 (GGUF): https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-q8_0-GGUF
- Variante q4_k_m (GGUF): https://huggingface.co/gcoli/qwen3.5-4b-diktat-de-ch-q4_k_m-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
