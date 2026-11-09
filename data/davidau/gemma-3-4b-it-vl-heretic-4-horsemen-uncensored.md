# DavidAU/gemma-3-4b-it-vl-Heretic-4-Horsemen-Uncensored

## Resumen
DavidAU/gemma-3-4b-it-vl-Heretic-4-Horsemen-Uncensored es un ajuste fino (fine-tune) del modelo Gemma 3 de 4 000 millones de parámetros de Google, orientado a la generación de texto creativo y al procesamiento de imágenes sin restricciones de contenido. Lo desarrolla DavidAU, un autor independiente conocido en Hugging Face por sus variantes "abliterated" y "heretic" de modelos abiertos, y se distribuye bajo licencia Apache 2.0. El modelo parte de una cadena de ajustes sobre Gemma 3 4B IT (instruction-tuned) y añade un entrenamiento con el dataset de razonamiento "Four Horsemen", ejecutado con Unsloth sobre hardware local.

El problema que aborda es doble: por un lado, elimina los mecanismos de rechazo (refusals) del modelo original mediante técnicas de abliteration y del software Heretic; por otro, incorpora un modo de razonamiento ("thinking") que el autor describe como compacto pero detallado, y que según la model card también mejora el procesamiento de imágenes. Es relevante para quienes necesitan un modelo multimodal pequeño, desplegable en hardware de consumo, sin filtros de contenido para escritura de ficción, roleplay o generación de escenas explícitas.

Arquitectura: Gemma 3 (transformer multimodal image-text-to-text), 4 300 079 472 parámetros totales según los safetensors del repositorio, pesos en bfloat16 y un tamaño de repo de 8,6 GB. El autor declara 128k de contexto. El idioma declarado es únicamente inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3, image-text-to-text) |
| Parametros totales | 4 300 079 472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k (según model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor menciona cuantización vía plantillas jinja, sin detallar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo es un fine-tune de Gemma 3 4B IT, un transformer multimodal que acepta entradas de imagen y texto y produce texto. La cadena de derivación es explícita: parte de `DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme`, que a su vez deriva del Gemma 3 4B IT de Google. El entrenamiento se realizó con Unsloth sobre hardware local con Linux, usando el dataset de razonamiento "Four Horsemen" (atribuido al equipo TeichAI). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica principal es la combinación de dos procesos: la eliminación de rechazos mediante Heretic (equipo P-E-W), que según la model card reduce las negativas de 98/100 en el modelo original a 2/100 en este, con una divergencia KL de 0,38 respecto al original (el autor considera excelente cualquier valor por debajo de 1). Además, el ajuste incorpora un modo de razonamiento que se activa automáticamente en la mayoría de los casos, pero que puede forzarse mediante la instrucción "think deeply:", un system prompt específico o una plantilla jinja alternativa (`chat-template-thinking.jinja`). El autor indica que el razonamiento es estable frente a la temperatura (rango recomendado de 0,1 a 2,5).

## Capacidades
- Generación de texto creativo: ficción, relatos, ciencia ficción, romance y todos los géneros, con énfasis en "vivid prosing" según las etiquetas del autor.
- Generación de tramas y subtramas, continuación de escenas y narración multi-turno.
- Procesamiento de imágenes (image-text-to-text): el razonamiento incorporado mejora, según el autor, el tratamiento de imágenes.
- Modo de razonamiento ("thinking") activable por instrucción, system prompt o plantilla jinja; el autor lo describe como compacto pero muy detallado.
- Conversación y roleplay, con ajustes de muestreo recomendados (smoothing factor 1,5 en KoboldCpp, text-generation-webui o Silly Tavern).
- Generación de contenido sin filtros: el modelo no rechaza peticiones, aunque el autor advierte que en algunos casos necesita instrucciones explícitas (por ejemplo, indicar el vocabulario o el registro) para alcanzar el nivel de explicitud deseado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (solo se documenta el modo thinking).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso
- Escritura de ficción y novelas: el modelo está entrenado específicamente para generar prosa vívida, tramas y subtramas; su contexto de 128k permite mantener coherencia en manuscritos largos y continuaciones de escena.
- Roleplay y narrativa interactiva: con el ajuste de smoothing recomendado y temperatura flexible (0,1-2,5), encaja en frontends como Silly Tavern o text-generation-webui para sesiones conversacionales prolongadas.
- Generación de contenido para adultos o géneros explícitos: al no rechazar peticiones, es adecuado para guiones de terror, ficción erótica o diálogos con lenguaje soez, siempre que se dirija el registro mediante instrucciones explícitas.
- Descripción y análisis de imágenes en flujos creativos: la entrada multimodal permite generar descripciones detalladas o inspiración narrativa a partir de ilustraciones, con el modo thinking mejorando el procesamiento de imagen según el autor.
- Prototipado local en hardware de consumo: con 4 300 millones de parámetros y pesos bfloat16, es viable en GPU de gama alta para consumidores, lo que facilita experimentación sin depender de la nube.
- Generación de diálogos para videojuegos o narrativa ramificada: su capacidad de continuar escenas y mantener tramas secundarias lo hace útil para motores de diálogo con árboles narrativos.
- Investigación sobre des-censura: sirve como caso de estudio reproducible de abliteration y ajuste fino con Unsloth, con métricas publicadas de rechazos y divergencia KL.

## Benchmarks y rendimiento
Resultados publicados en la model card (evaluación propia del autor, equipo Nightmedia):

| Benchmark | Resultado |
|---|---|
| arc_challenge | 0,373 |
| arc_easy | 0,442 |
| boolq | 0,647 |
| hellaswag | 0,622 |
| openbookqa | 0,378 |
| piqa | 0,751 |
| winogrande | 0,660 |

Métricas de des-censura (Heretic):

| Métrica | Este modelo | Modelo original (referencia citada: google/gemma-3-27b-it) |
|---|---|---|
| Divergencia KL | 0,38 | 0 (por definición) |
| Rechazos | 2/100 | 98/100 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones directas con modelos similares en esos benchmarks.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 8,6 GB en bfloat16 (tamaño del repo); en cuantización de 8 bits rondaría 4-5 GB y en 4 bits unos 2,5-3 GB, aunque el autor no publica cifras oficiales de cuantización.
- GPU recomendadas: A100 o H100 para despliegue en producción con contexto completo de 128k; RTX 4090 o RTX 3090 para inferencia local en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización de 8 bits, y en tarjetas de 6 GB o más en 4 bits (estimación, no confirmada por el autor).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible), KoboldCpp, oobabooga/text-generation-webui y Silly Tavern, mencionados explícitamente en la model card. No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-3-4b-it-vl-Heretic-4-Horsemen-Uncensored) | 4,3B | 128k | Apache 2.0 | Sí | Sin rechazos, modo thinking, solo inglés |
| google/gemma-3-4b-it | 4,3B (aprox.) | 128k | Gemma Terms | Sí | Modelo base oficial, con filtros de seguridad |
| DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme | 4,3B (aprox.) | 128k | Apache 2.0 | Sí | Modelo base directo de este ajuste; sin el entrenamiento Four Horsemen |
| google/gemma-3-27b-it | 27B (aprox.) | 128k | Gemma Terms | Sí | Referencia citada por el autor en las métricas de rechazos; mayor tamaño |

No se dispone en la información proporcionada de comparaciones de rendimiento (benchmarks) frente a estas alternativas más allá de las métricas de rechazo y divergencia KL indicadas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma 3 y entrenarse con un dataset no detallado, puede heredar sesgos del modelo base y del corpus de ficción utilizado.
- Riesgo de alucinación: no cuantificado; el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en tareas factuales.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contenido sin filtros: el modelo genera contenido explícito, violento u ofensivo si se le solicita; requiere supervisión y políticas de uso en cualquier despliegue público.
- El autor advierte que, en algunos casos, el modelo necesita instrucciones explícitas (vocabulario, registro) para alcanzar el nivel de explicitud esperado; sin ellas, el contenido puede resultar "blando".
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Gemma 3, cuyos términos de uso originales pueden imponer condiciones adicionales; conviene revisar la compatibilidad antes de un uso comercial.
- El contexto de 128k está declarado en la model card pero no verificado de forma independiente en la información disponible.
- El ajuste fino sobre un modelo ya modificado (abliterated) acumula cambios que pueden degradar capacidades generales; los benchmarks publicados muestran valores moderados (por ejemplo, arc_challenge 0,373 y openbookqa 0,378).
- Soporte de tool calling y agentes no documentado; no se recomienda asumirlo en producción sin validación previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-4b-it-vl-Heretic-4-Horsemen-Uncensored
- Modelo base directo: https://huggingface.co/DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Modelo original de referencia: https://huggingface.co/google/gemma-3-27b-it
- Repositorio de Unsloth (herramienta de entrenamiento citada): no disponible en la información proporcionada
- Repositorio de Heretic (equipo P-E-W, citado): no disponible en la información proporcionada
