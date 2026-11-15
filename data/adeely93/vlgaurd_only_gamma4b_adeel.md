# Adeely93/vlgaurd_only_gamma4b_adeel

## Resumen

vlgaurd_only_gamma4b_adeel es una modificación de pesos de google/gemma-3-4b-it, un modelo multimodal de tipo image-text-to-text de 4.300.079.472 parámetros (4,3 mil millones). Lo publica el usuario Adeely93 en Hugging Face como artefacto de investigación: no es un fine-tuning al uso, sino una edición directa de pesos sin gradientes sobre 84 unidades ocultas de las MLP del modelo de lenguaje. El objetivo es aumentar la tasa de rechazo ante peticiones dañinas (texto o imagen) sin degradar las respuestas benignas.

El interés técnico está en el método: se sobrescriben a mano 18 de los 883 tensores del checkpoint original (las proyecciones gate_proj, up_proj y down_proj de las capas 8, 10, 12, 14, 16 y 18), con un máximo de 500 pasadas hacia delante (se usaron 184) y sin optimizador ni entrenamiento supervisado. Cada unidad editada lee una dirección del MLP que señala una petición dañina, se activa únicamente en las tres últimas posiciones de la plantilla de chat (donde el modelo decide cómo empezar a responder) y escribe la propia dirección de rechazo del modelo en el flujo residual.

La relevancia es doble: por un lado, demuestra que la edición de pesos guiada por un agente LLM puede reducir la tasa de éxito de ataques (ASR) de forma drástica en el conjunto de test de VLGuard; por otro, deja claras sus limitaciones, ya que solo funciona si la entrada se formatea con la plantilla de chat nativa y no se ha evaluado frente a familias de ataque distintas de VLGuard. Es un artefacto de investigación, no una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), vision-language con Gemma3ForConditionalGeneration |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (BF16, dos shards: model-00001-of-00002.safetensors y model-00002-of-00002.safetensors) |

## Arquitectura y entrenamiento

El modelo conserva exactamente la arquitectura, nombres de tensores, formas y dtype (BF16) de google/gemma-3-4b-it (revision 093f9f388b31de276ce2de164bdc2081324b9767). Se carga con Gemma3ForConditionalGeneration igual que el original. No hay entrenamiento en el sentido habitual: no se usan gradientes, ni optimizador, ni fine-tuning. El proceso consiste en sobrescribir manualmente 84 unidades ocultas de las MLP del modelo de lenguaje, afectando a 18 de los 883 tensores del checkpoint (las proyecciones gate_proj, up_proj y down_proj de las capas de decoder 8, 10, 12, 14, 16 y 18, con 11 a 17 filas o columnas modificadas en cada una). El resto de tensores, la configuración, el tokenizer, el processor y la plantilla de chat son idénticos al snapshot original.

La innovación técnica es el mecanismo de edición: cada unidad sobrescrita (1) lee una dirección en la entrada del MLP que señala una petición dañina, calculada como contrastes de medias de clase sobre registros de desarrollo de VLGuard y eliminando las direcciones que distinguen peticiones benignas entre sí; (2) está condicionada a una única posición, los tres últimos tokens de la plantilla de chat (start_of_turn, model y salto de línea), donde el modelo decide cómo iniciar su respuesta, y permanece silenciosa en cualquier otra posición; y (3) escribe la propia dirección de rechazo del modelo en el flujo residual. El desarrollo se hizo con el agente Claude Fable 5.2 y un máximo de 500 pasadas hacia delante (184 utilizadas), usando únicamente el fichero de entrenamiento de VLGuard como datos de desarrollo, complementado con muestras de ayuda de LLaVA-v1.5.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de gemma-3-4b-it.
- Comprensión de imágenes y respuesta image-text-to-text: acepta una imagen y un prompt de texto y genera una respuesta.
- Rechazo reforzado de peticiones dañinas, tanto con imagen insegura como con instrucciones dañinas sobre imágenes seguras.
- Respuesta benigna preservada: en el conjunto de test de VLGuard, la calidad de las respuestas benignas (ROUGE-L recall 0,456 frente a 0,454 del original) y la ausencia de respuestas rotas (0 en ambos) se mantienen.
- Formato de chat nativo de Gemma 3 con soporte de imagen primero y texto después.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la información proporcionada.

## Casos de uso

- Filtrado de seguridad en pipelines multimodales: el modelo puede actuar como primera capa de moderación en aplicaciones que reciben imágenes y texto, rechazando peticiones dañinas con una ASR de 0,118 en peticiones con imagen insegura (frente a 0,629 del original) y de 0,074 en instrucciones dañinas sobre imágenes seguras (frente a 0,787).
- Investigación en alineación y edición de pesos: sirve como referencia reproducible para estudiar si un agente LLM puede escribir directamente en los pesos de un VLM para modificar su comportamiento de rechazo, con un protocolo documentado (184 pasadas hacia delante, sin gradientes).
- Evaluación comparativa de robustez: útil para medir la transferencia de la reducción de ASR a categorías de daño y fuentes de imagen no usadas en el desarrollo (se conservó entre el 86 % y el 105 % de la reducción).
- Prototipado de asistentes visuales con moderación integrada: en un chat que recibe fotos, el modelo mantiene la calidad de respuesta benigna (ROUGE-L 0,456) mientras rechaza un subconjunto de peticiones sensibles, adecuado para entornos de prueba controlados.
- Análisis de falsos positivos en moderación: con una tasa de rechazo del 7 % en preguntas benignas sobre imágenes sensibles (20 % en imágenes de la fuente hateful-memes), permite estudiar el equilibrio entre seguridad y utilidad en sistemas de moderación.
- Docencia y divulgación sobre seguridad multimodal: el checkpoint y su model card detallada permiten ilustrar cómo se mide la ASR por coincidencia de frases de rechazo y por qué esa métrica tiene limitaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de VLGuard (1.558 registros, reservados hasta congelar el checkpoint), decodificación greedy, 256 tokens nuevos. ASR = proporción de respuestas que no son rechazos, medida por coincidencia de frases (detector estricto / lista de palabras clave estilo VLGuard). No se usó modelo juez.

| Metrica | Original | Este modelo |
|---|---|---|
| ASR, peticiones con imagen insegura (442) | 0,629 / 0,586 | 0,118 / 0,115 |
| ASR, instrucciones dañinas sobre imágenes seguras (558) | 0,787 / 0,674 | 0,074 / 0,082 |
| Rechazos de preguntas benignas sobre las mismas imágenes seguras (558) | 0,000 / 0,005 | 0,070 / 0,077 |
| Respuestas benignas: recall ROUGE-L frente a la referencia | 0,454 | 0,456 |
| Respuestas rotas (vacías, repetitivas, ilegibles) | 0 | 0 |

En registros de desarrollo de categorías de daño y fuentes de imagen nunca usados para construir o ajustar la edición, se conservó entre el 86 % y el 105 % de la reducción de ASR. En 512 registros de ayuda de LLaVA no usados, se rechazó el 1,4 % de las peticiones (original: 0,2 %), con medidas de calidad de respuesta sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,3 mil millones de parámetros en BF16, el peso de los pesos ronda los 8,6 GB (tamaño del repo), a lo que hay que sumar caché KV, activaciones y el procesador de visión; en la práctica requiere más de 8,6 GB de VRAM en BF16.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con al menos 12-16 GB de VRAM en BF16 sería el mínimo razonable; no se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo?: no confirmado en la información proporcionada; por el tamaño del repo (8,6 GB) es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: transformers (probado con transformers 4.57.6 y torch 2.8.0, BF16, sin system prompt, imagen primero y luego texto). El tag endpoints_compatible y text-generation-inference sugieren compatibilidad con TGI, pero no se detalla configuración. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vlgaurd_only_gamma4b_adeel | 4.300.079.472 | no disponible | Edición de pesos sin gradientes para seguridad multimodal | Gemma Terms of Use | Hugging Face (4 descargas, 0 likes) |
| google/gemma-3-4b-it | no disponible en la informacion proporcionada | no disponible | Modelo base multimodal image-text-to-text | Gemma Terms of Use | Hugging Face (modelo base) |
| Alternativas de moderación multimodal del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada más allá del propio modelo base, cuyos resultados en VLGuard se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- No rechaza casi todas las peticiones dañinas: lo que queda son mayoritariamente preguntas genéricas sobre fotos ligeramente explícitas, descripciones de personas y peticiones para analizar o discutir una imagen dañina.
- Aproximadamente el 7 % de las preguntas benignas sobre imágenes de aspecto sensible se rechazan o se responden con reservas (20 % para imágenes de la fuente hateful-memes).
- La edición actúa solo al final de la plantilla de chat del modelo: las entradas deben formatearse con la plantilla propia del modelo; con otro formato de prompt el modelo se comporta como el original. No hay guiado durante la generación, por lo que los ataques que fuerzan las primeras palabras de la respuesta no están cubiertos.
- La generalización se probó solo dentro de VLGuard; no se evaluó frente a otras familias de ataque (imágenes tipográficas, imágenes relevantes para la consulta, envoltorios de texto adversarial) ni frente a prompts dañinos solo de texto.
- Las cifras proceden de coincidencia de frases de rechazo, con sus debilidades habituales; no se usó modelo juez.
- Los detectores son lecturas lineales fijas; no se midió la robustez frente a ataques adaptativos.
- Es un artefacto de investigación, no una garantía de seguridad.
- Licencia: derivado de google/gemma-3-4b-it, sujeto a los Gemma Terms of Use; no está afiliado ni respaldado por Google. Verificar las restricciones de uso comercial de dichos términos antes de usarlo en producción.
- Riesgo de sesgos y alucinaciones: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/vlgaurd_only_gamma4b_adeel
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset VLGuard: https://huggingface.co/datasets/ys-zong/VLGuard
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
