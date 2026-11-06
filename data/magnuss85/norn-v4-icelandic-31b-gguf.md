# Magnuss85/Norn-v4-Icelandic-31B-GGUF

## Resumen

Norn v4 es un ajuste fino (fine-tune) en islandés del modelo google/gemma-4-31B-it, desarrollado por Magnús Smári Smárason (Magnuss85, smarason.is). Su objetivo es que el modelo flexione correctamente el islandés (declinaciones y morfología) sin sacrificar las capacidades generales del modelo base. Es la evolución de Norn v3 (9B) y tiene como hermano especialista a Vör, centrado en detección de datos personales.

El modelo parte de una arquitectura transformer densa de aproximadamente 30.700 millones de parámetros (30,697.345.596 según los safetensors del repositorio), con un tamaño total de repositorio de 54,5 GB en formato GGUF. Se ofrece en dos cuantizaciones: Q5_K_M y Q8_0. Los idiomas declarados son islandés (is) e inglés (en) y la licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual radica en que ataca un problema muy específico y poco cubierto por los modelos multilingües generalistas: la corrección morfológica del islandés, una lengua con una flexión nominal y verbal compleja. El entrenamiento combina SFT con LoRA en bf16 y un paso de GRPO con recompensa de coincidencia exacta basada en BÍN, el diccionario morfológico oficial del islandés moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-31B-it) |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de Ollama usa num_ctx 8192, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | GGUF Q5_K_M (21,8 GB) y Q8_0 (32,6 GB); el autor evalua el modelo sin cuantizar antes de exportar |
| Idiomas soportados | Islandes (is) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); modelo base en safetensors |

## Arquitectura y entrenamiento

Norn v4 se construye sobre google/gemma-4-31B-it, un transformer denso de unos 30,7B parámetros. El ajuste se realizó en dos fases: primero un SFT con LoRA en bf16 (learning rate 1e-4, 750 pasos, 11.400 filas de datos), y después un entrenamiento con GRPO de 60 pasos usando una recompensa de coincidencia exacta derivada de BÍN (Beygingarlýsing íslensks nútímamáls), el recurso morfológico de referencia del islandés. Todo el entrenamiento se llevó a cabo en una NVIDIA DGX Spark. La pérdida de validación descendió de 2,90 a 0,22.

La innovación técnica principal no es arquitectónica sino de objetivo de entrenamiento: el uso de recompensa exacta sobre formas flexionadas de BÍN convierte la corrección morfológica en una tarea verificable automáticamente, lo que permite aplicar RL (GRPO) sobre un criterio objetivo en lugar de preferencias humanas. El modelo fusionado (merged) alcanza 0,850 en la prueba BÍN, y el archivo Q5_K_M puntúa 0,84 en un subconjunto de 100 preguntas, lo que indica una degradación mínima por cuantización.

## Capacidades

- Generación de texto conversacional en islandés e inglés, manteniendo las capacidades generales del modelo base Gemma 4 31B-it.
- Flexión morfológica del islandés: declinación de sustantivos según el estándar BÍN (0,856 en la prueba de 480 preguntas).
- Razonamiento y comprensión lectora multilingüe preservados: Belebele islandés 0,920, WinoGrande islandés 0,811, ARC-Challenge islandés 0,934.
- Escritura en islandés con menor tasa de errores gramaticales que el modelo base (1,93 incidencias por 100 palabras frente a 3,38 según GreynirCorrect).
- Soporte de formato de chat Gemma 4 (requiere `RENDERER gemma4` / `PARSER gemma4` en Ollama para aplicar correctamente la plantilla de chat).
- Capacidades de tool calling y agentes: no se documentan explícitamente en la información proporcionada; deben asumirse las del modelo base Gemma 4 31B-it, sin confirmación específica para este fine-tune.
- Modo de razonamiento explícito (thinking): no documentado en la información disponible.

## Casos de uso

- Corrección y normalización morfológica de textos islandeses: el modelo puede reescribir frases asegurando la forma flexionada correcta de sustantivos, apoyándose en su entrenamiento con recompensa BÍN y en su menor tasa de errores gramaticales medida con GreynirCorrect.
- Generación de contenido editorial en islandés: redacción de artículos, comunicados o documentación con revisión humana, aprovechando que el modelo reduce las incidencias gramaticales frente a Gemma 4 31B-it (1,93 vs 3,38 por 100 palabras).
- Localización de productos al islandés: adaptación de interfaces, textos de marketing y ayuda contextual, con validación posterior por un hablante nativo dado que la flexión de adjetivos y verbos no está medida.
- Enseñanza de islandés como segunda lengua: generación de ejercicios de declinación y ejemplos de formas correctas, útil por su especialización en paradigmas nominales de BÍN.
- Preprocesado para pipelines de NLP islandés: normalización de texto antes de análisis sintáctico o búsqueda, reduciendo variantes morfológicas mal formadas.
- Asistencia conversacional en islandés: despliegue en Ollama con la configuración recomendada (temperature 0,7, top_k 64, top_p 0,95, num_ctx 8192) para chatbots de atención al usuario en islandés.
- Detección de datos personales en islandés: aunque el especialista declarado es Vör (modelo hermano), Norn v4 puede servir como base generalista en flujos de moderación o revisión de contenido en islandés.

## Benchmarks y rendimiento

| Test | Gemma 4 31B-it | Norn v4 | Norn v3 (9B) |
|---|---|---|---|
| BÍN declension test (480 preguntas de formas nominales) | 0,700 | 0,856 | 0,608 |
| Belebele, islandés (n = 900) | 0,917 | 0,920 | – |
| WinoGrande, islandés (n = 1088) | 0,817 | 0,811 | – |
| ARC-Challenge, islandés (n = 1169) | 0,937 | 0,934 | – |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Incidencias GreynirCorrect por 100 palabras (200 prompts fijos, Q5_K_M en Ollama) | 1,93 (Norn v4) frente a 3,38 (Gemma 4 31B-it) |
| Puntuacion BÍN del modelo fusionado (sin cuantizar) | 0,850 |
| Puntuacion BÍN del archivo Q5_K_M (subconjunto de 100 preguntas) | 0,84 |
| Pérdida de validación durante el entrenamiento | 2,90 → 0,22 |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 21,8 GB y el Q8_0 ocupa 32,6 GB; a ello hay que sumar el espacio de contexto y caché KV, por lo que en la practica se necesitan aproximadamente 24-26 GB para Q5_K_M y 34-38 GB para Q8_0, según la longitud de contexto configurada.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs de consumo de gama alta con suficiente memoria (por ejemplo, RTX 4090 de 24 GB puede alojar Q5_K_M con contexto moderado; Q8_0 requiere GPUs de 32 GB o más, como RTX 5090 o soluciones profesionales).
- Cabe en GPU de consumo: Q5_K_M es viable en una RTX 4090 de 24 GB con contexto limitado; Q8_0 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: Ollama y llama.cpp son los soportados de forma nativa por el formato GGUF; el autor proporciona un Modelfile de Ollama con `RENDERER gemma4` y `PARSER gemma4`. vLLM y TGI no se mencionan en la información disponible para esta exportación GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una NVIDIA DGX Spark, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Norn v4 Icelandic 31B | ~30,7B | No disponible | Fine-tune islandés (morfologia) sobre Gemma 4 31B-it | Apache 2.0 | GGUF en Hugging Face (Q5_K_M, Q8_0) |
| Gemma 4 31B-it (base) | ~30,7B | No disponible | Modelo generalista multilingüe de Google | Apache 2.0 (según model card de Norn v4) | Disponible en Hugging Face |
| Norn v3 Icelandic 9B | ~9B (estimado por el nombre) | No disponible | Fine-tune islandés de generacion anterior | No disponible | Disponible en Hugging Face |
| Vör Icelandic PII 31B | ~30,7B (derivado de Gemma 4 31B) | No disponible | Especialista en deteccion de datos personales en islandés | No disponible | GGUF en Hugging Face |

En rendimiento, Norn v4 supera claramente a Gemma 4 31B-it en la prueba de declinación BÍN (0,856 frente a 0,700) y reduce las incidencias gramaticales en escritura, mientras que en pruebas de capacidad general (Belebele, WinoGrande, ARC-Challenge) se mantiene prácticamente idéntico al base, sin mejoras ni pérdidas significativas. Frente a Norn v3 (9B), la mejora en BÍN es sustancial (0,856 frente a 0,608), a costa de un mayor tamaño y requisitos de hardware.

## Limitaciones y advertencias

- La prueba BÍN cubre solo sustantivos; la flexión de adjetivos y verbos no está medida, por lo que la corrección morfológica fuera de los nombres no está garantizada.
- La prosa generada sigue conteniendo errores gramaticales (aproximadamente 2 por cada 100 palabras según GreynirCorrect) y el modelo puede ocasionalmente producir palabras en otro alfabeto o script; se recomienda revisión humana antes de publicar.
- Las pruebas Belebele, WinoGrande y ARC demuestran que la capacidad general se preserva, no que se mejora; no debe esperarse un rendimiento superior al modelo base en razonamiento general.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no se detallan en la información proporcionada; deben asumirse los del modelo base Gemma 4 31B-it y los derivados de los datos de entrenamiento islandeses.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-31B-it, ya que la model card de Norn v4 declara Apache 2.0 «as the base model».
- Requiere configuración específica de chat en Ollama (`RENDERER gemma4` / `PARSER gemma4`); sin ella no se aplica el formato de chat correcto y la calidad conversacional se degrada.
- El contexto nativo no está confirmado en la información disponible; el ejemplo de uso fija num_ctx 8192, que no debe confundirse con el máximo soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Magnuss85/Norn-v4-Icelandic-31B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo predecesor Norn v3: https://huggingface.co/Magnuss85/Norn-v3-Icelandic-9B
- Modelo hermano Vör (detección de datos personales): https://huggingface.co/Magnuss85/Vor-Icelandic-PII-31B-GGUF
- Sitio del autor: https://smarason.is
- Perfil del autor en Hugging Face: https://huggingface.co/Magnuss85
