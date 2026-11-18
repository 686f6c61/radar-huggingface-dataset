# DICPlay/RusMind-Vspyshka-4.7

## Resumen

RusMind Vspyshka 4.7 (Вспышка, "destello" en ruso) es un modelo de lenguaje de tipo image-text-to-text desarrollado por DICPlay, un fine-tune del modelo base google/gemma-4-E4B-it de Google. Con aproximadamente 8.000 millones de parámetros totales (7,5 mil millones según la model card), está diseñado específicamente para el idioma ruso y el inglés, con especial énfasis en conocimiento de la cultura e historia de Rusia, tareas centradas en el ser humano (comprensión de personajes, humor, enantiosemia) y ejecución de instrucciones complejas. Su propuesta principal es ofrecer un modelo compacto que funciona en dispositivo (on-device) y sin conexión a internet, orientado a PC potentes, portátiles y teléfonos de gama alta.

El modelo se posiciona en el ecosistema ruso de IA como la segunda mejor opción entre todos los modelos de menos de 10.000 millones de parámetros en el benchmark independiente MERA v2, con una puntuación global de 0,191, solo por detrás de RusMind Sokol 4.7 del mismo autor. Según la model card, supera a alternativas de mayor tamaño en tareas de razonamiento y conocimiento cultural ruso, y compite de cerca con modelos como T-pro de T-Bank (33.000 millones de parámetros) en la puntuación global.

La relevancia actual del modelo radica en su combinación de tamaño reducido, capacidades multimodales heredadas del base Gemma 4, soporte de tool calling y un enfoque explícito en la soberanía tecnológica rusa ("IA nacional"). Se distribuye con licencia propia (rusmind-license) y en formatos safetensors y GGUF, lo que facilita su despliegue en llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); multimodal image-text-to-text |
| Parametros totales | 7.996.156.490 (aprox. 8.000 millones; la model card indica 7,5 mil millones) |
| Parametros activos | no disponible (la model card no confirma configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible para llama.cpp, LM Studio y Ollama); niveles específicos no disponibles |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de google/gemma-4-E4B-it, un transformer multimodal de la familia Gemma 4 de Google, adaptado mediante fine-tune por DICPlay. La designación "E4B" en el modelo base sugiere una variante eficiente de la familia Gemma 4, aunque no se dispone de detalles técnicos específicos sobre la configuración interna (número de capas, dimensiones de atención, mecanismos de atención lineal o decodificación especulativa) en la información proporcionada. La model card no documenta el proceso de entrenamiento: no se especifica el volumen de tokens utilizados, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste por instrucciones.

La innovación principal declarada por el autor es el proceso de fine-tune orientado a tres ejes: conocimiento profundo de la cultura, historia, regiones y pueblos de Rusia; mejora en tareas "humanocéntricas" (comprensión de personajes, humor, acertijos, palabras con significados opuestos); y mayor precisión en el seguimiento de instrucciones complejas con múltiples requisitos y en la invocación de herramientas. El modelo conserva la naturaleza multimodal del base (image-text-to-text) y se distribuye con pesos completos en safetensors y versiones cuantizadas en GGUF para despliegue local.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial fluidez y corrección gramatical en ruso.
- Capacidades multimodales de entrada image-text-to-text heredadas del modelo base Gemma 4.
- Tool calling / function calling: la model card reporta un 86 % de selección correcta de herramienta y un 100 % de resistencia a la sustitución de instrucciones en la tarea GorillaHard.
- Seguimiento de instrucciones complejas con múltiples requisitos simultáneos (tarea IFHard).
- Corrección ortográfica y de puntuación en ruso (tarea SAGE, con puntuación de 0,760 en signos de puntuación).
- Respuestas desde la perspectiva de personajes (Characters), comprensión de humor y enantiosemia (palabras con significados opuestos).
- Conocimiento profundo de historia, cultura, regiones y pueblos de Rusia.
- Razonamiento lógico y resolución de acertijos (NewReasoning).
- Ejecución en dispositivo (on-device) y sin conexión a internet.
- No se documenta explícitamente un modo de razonamiento extendido (thinking mode) para esta variante; la model card lo atribuye a la variante Sokol 4.7.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede gestionar diálogos multi-turno con corrección gramatical y ortográfica integrada, adecuado para empresas que necesitan un asistente local sin dependencia de la nube.
- Corrección y edición de textos en ruso: dado su rendimiento en la tarea SAGE (0,719 global, 0,760 en puntuación), puede integrarse en herramientas de procesamiento de textos para revisión ortográfica y de puntuación automática.
- Despliegue en dispositivo sin conexión: gracias a sus aproximadamente 8.000 millones de parámetros y versiones GGUF, puede ejecutarse en portátiles y teléfonos de gama alta mediante llama.cpp u Ollama, útil en entornos con conectividad limitada o requisitos de privacidad.
- Automatización de flujos con herramientas: su capacidad de tool calling (86 % de selección correcta de herramienta) permite integrarlo en agentes que consultan APIs, bases de datos o servicios externos en pipelines de automatización.
- Generación de contenido cultural y educativo sobre Rusia: el modelo destaca en conocimiento de historia, cultura, regiones y pueblos rusos (0,228 en MERA v2), adecuado para plataformas educativas o de divulgación.
- Role-play y creación de personajes: su puntuación de 0,537 en la tarea Characters lo hace apto para videojuegos, narrativa interactiva o chatbots con personalidad definida.
- Procesamiento de documentos con imágenes: al heredar la capacidad image-text-to-text del base Gemma 4, puede extraer y responder preguntas sobre texto contenido en imágenes, útil en digitalización de documentos.
- Filtrado y moderación de contenido en ruso: su comprensión de humor, enantiosemia y matices lingüísticos permite detectar usos ambiguos o irónicos del lenguaje.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark independiente MERA v2 (octubre de 2026), que evalúa modelos en ruso. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información proporcionada.

| Modelo | Params | MERA v2 global | Razonamiento | Comprensión humana | Cultura rusa |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5-8,0 mil M | 0,191 | 0,385 | 0,257 | 0,228 |
| Qwen3.5-9B (Alibaba) | 9 mil M | 0,186 | 0,339 | 0,218 | 0,118 |
| Gemma 4 E4B (Google) | 8 mil M | 0,170 | 0,367 | 0,172 | 0,199 |
| T-lite (T-Bank) | 8 mil M | 0,130 | 0,218 | 0,169 | 0,196 |
| A-Vibe (Avito) | 8 mil M | 0,113 | 0,187 | 0,132 | 0,171 |
| RuadaptQwen3-32B | 32 mil M | 0,163 | 0,342 | 0,177 | no disponible |
| Zero-Mistral | 24 mil M | 0,160 | 0,213 | 0,235 | no disponible |

Resultados por tarea específica de RusMind Vspyshka 4.7 en MERA v2:

| Tarea | Puntuación |
|---|---|
| Corrección ortográfica y puntuación (SAGE) | 0,719 (puntuación: 0,760) |
| Respuestas desde personajes (Characters) | 0,537 |
| Clasificación semántica de palabras (LIMUR) | 0,465 |
| Enantiosemia | 0,373 |
| Lógica y acertijos (NewReasoning) | 0,330 |
| Preguntas de opción múltiple (RUBIN) | 0,328 |
| Tool calling (GorillaHard) | 0,302 (86 % selección correcta, 100 % resistencia a inyección) |
| Instrucciones complejas (IFHard) | 0,300 |
| Comprensión de humor (Humor) | 0,196 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (aproximadamente 8.000 millones de parámetros), en FP16 requeriría del orden de 16 GB de VRAM; en cuantizaciones de 8 bits, alrededor de 8-9 GB; y en 4 bits, aproximadamente 5-6 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, sería desplegable en GPUs de consumo como RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 4070 (12 GB) en cuantizaciones adecuadas; en entornos profesionales, A100 o H100 no serían necesarias para inferencia básica.
- Compatibilidad con GPU de consumo: sí, según la model card el modelo funciona en "PC potentes, portátiles y teléfonos de gama alta", lo que implica compatibilidad con hardware de consumo.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados explícitamente en la model card); transformers (librería declarada); vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MERA v2 global | Licencia | Formatos |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5-8,0 mil M | no disponible | 0,191 | rusmind-license | safetensors, GGUF |
| RusMind Sokol 4.7 | 8,9 mil M | no disponible | 0,279 | rusmind-license | safetensors, GGUF |
| Qwen3.5-9B | 9 mil M | no disponible | 0,186 | no disponible | no disponible |
| Gemma 4 E4B | 8 mil M | no disponible | 0,170 | no disponible | no disponible |
| T-lite (T-Bank) | 8 mil M | no disponible | 0,130 | no disponible | no disponible |

En comparación con modelos de mayor tamaño, Vspyshka 4.7 obtiene 0,191 frente a 0,163 de RuadaptQwen3-32B (32.000 millones) y 0,160 de Zero-Mistral (24.000 millones) en la puntuación global de MERA v2. Frente a T-pro de T-Bank (33.000 millones), la model card reporta 0,191 frente a 0,196 en la puntuación global, y 0,257 frente a 0,249 en tareas humanocéntricas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al estar especializado en cultura rusa, podría presentar un sesgo hacia perspectivas culturales rusas en temas históricos o geopolíticos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de generar información incorrecta, especialmente en dominios no cubiertos por su entrenamiento.
- Limitaciones de idioma: soporta únicamente ruso e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Restricciones de licencia: la licencia rusmind-license es una licencia propia (license: other); es necesario consultar el archivo LICENSE del repositorio para conocer las condiciones exactas de uso comercial, redistribución y modificación.
- Caveats para producción: el modelo es un fine-tune de un base de Google (Gemma 4), por lo que podrían aplicarse restricciones derivadas de la licencia del modelo base; además, los benchmarks reportados proceden principalmente de MERA v2, un benchmark centrado en ruso, por lo que el rendimiento en otras tareas o idiomas no está validado de forma independiente.
- El modelo se autodenomina "IA nacional" rusa, lo que puede implicar consideraciones geopolíticas o regulatorias para su uso en determinadas jurisdicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo / plataforma: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
