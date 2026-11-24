# DICPlay/RusMind-4.5.4-Momentum

## Resumen

RusMind 4.5.4 · Моментум es la variante más ligera de la familia RusMind de nueva generación 4.5, desarrollada por el equipo DICPlay. Se trata de un ajuste fino (finetune) del modelo base google/gemma-4-E2B-it, distribuido en formato GGUF para ejecución local en llama.cpp, LM Studio y Ollama. Su propuesta central es la inferencia en dispositivo (on-device) sin conexión a internet, en portátiles, ordenadores de sobremesa convencionales y teléfonos.

El modelo emplea una arquitectura de mezcla de expertos (MoE) heredada de Gemma 4 E2B, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, según los datos del autor. Está especializado en ruso e inglés, con un enfoque explícito en cultura rusa, razonamiento, comprensión de personajes, humor y corrección ortotipográfica. El autor sitúa al modelo en el primer puesto de la categoría de cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros en el benchmark MERA v2.

La relevancia actual del modelo reside en su relación entre tamaño activo y rendimiento declarado: con unos 2.000 millones de parámetros activos, el autor afirma que supera en razonamiento a modelos de 8.000 y 24.000 millones de parámetros como T-lite de T-Bank, Zero-Mistral y A-Vibe de Avito. No obstante, la model card dedica buena parte de su contenido a promocionar versiones posteriores de la familia (4.7 Моментум, 4.7 Сокол y 4.7 Вспышка), lo que conviene tener en cuenta al evaluar esta versión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones (según el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en formato GGUF) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | rusmind-license (license: other, con enlace a LICENSE en el repositorio) |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer con mezcla de expertos según la información disponible. El autor indica que, pese a contar con 4.647.450.147 parámetros totales, en cada respuesta solo se activan unos 2.000 millones, lo que explica su viabilidad en dispositivos de gama consumer y en navegador. Se trata de un ajuste fino sobre el modelo instructivo de Google, orientado específicamente al ruso y con instrucciones conversacionales.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las mejoras declaradas en la versión 4.5.4 se centran en lógica, acertijos, habla coloquial rusa, comprensión de personajes y destinatarios de las preguntas, puntuación y tareas creativas con requisitos estrictos de longitud, además de precisión en fechas clave de la historia de Rusia y corrección de errores en las preguntas. No se documentan innovaciones técnicas de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con registro coloquial y formal.
- Razonamiento y resolución de acertijos y problemas de lógica, con resultados declarados en el subconjunto de razonamiento de MERA v2.
- Comprensión de personajes, humor, ironía y palabras con significados opuestos en ruso.
- Seguimiento de instrucciones complejas y tareas creativas con restricciones exactas de longitud.
- Corrección ortográfica y de puntuación en ruso (el autor cita una puntuación de 0,719 en esta tarea).
- Conocimiento de cultura y regiones de Rusia, incluidas fechas históricas clave, con detección de errores en las preguntas.
- Llamada a herramientas (tool calling) y ejecución de instrucciones estructuradas, según la model card de la familia 4.7.
- Ejecución en dispositivo y sin conexión (on-device, offline) mediante llama.cpp.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) para esta variante concreta.

## Casos de uso

- Asistentes conversacionales en ruso sin conexión: el modelo puede desplegarse en un portátil o teléfono mediante llama.cpp u Ollama y mantener conversaciones multi-turno sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Corrección y edición de textos en ruso: dado su rendimiento declarado en ortografía y puntuación (0,719), puede integrarse en herramientas de escritura para revisar borradores, corregir comas y detectar errores gramaticales en documentos.
- Atención al cliente en ruso con presupuesto de hardware reducido: con unos 2.000 millones de parámetros activos, puede ejecutarse en servidores modestos o en el propio dispositivo del usuario, gestionando consultas frecuentes y derivando casos complejos.
- Generación de contenido creativo con restricciones de formato: el modelo declara capacidad para cumplir requisitos exactos de longitud y estilo, útil para redactar publicaciones, guiones breves o textos de marketing en ruso con límites de caracteres.
- Herramientas educativas sobre historia y cultura de Rusia: puede responder preguntas sobre fechas y acontecimientos históricos y señalar errores en la formulación de la pregunta, lo que encaja en aplicaciones de estudio y divulgación.
- Integración en pipelines de agentes con tool calling: la familia 4.7 documenta invocación de herramientas, por lo que esta variante puede emplearse en flujos de automatización que requieran llamadas a funciones desde un modelo local.
- Prototipado rápido y evaluación de modelos en local: al distribuirse en GGUF y ejecutarse en llama.cpp, sirve para experimentar con ajustes finos en ruso sin depender de infraestructura GPU dedicada.

## Benchmarks y rendimiento

La model card incluye resultados del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA en Rusia. Para esta variante concreta solo se publica el subconjunto de razonamiento:

| Razonamiento (MERA v2) | RusMind Моментум (2.000 M activos) | T-lite · T-Bank (8.000 M) | Zero-Mistral (24.000 M) | A-Vibe · Avito (8.000 M) |
|---|---|---|---|---|
| Puntuación | 0,225 | 0,218 | 0,213 | 0,187 |

El autor también afirma que el modelo ocupa el primer puesto en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros y el primero en tareas centradas en las personas en esa misma categoría, y que supera en puntuación global a A-Vibe (8.000 M), Zero-Mistral-Small (24.000 M), Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba. No se publican cifras concretas de MMLU, HumanEval, GSM8K ni de la puntuación global de esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 4.647.450.147 parámetros totales, una cuantización Q4_K_M requeriría del orden de 3 a 4 GB de memoria, y una Q8_0 en torno a 5 a 6 GB; estas cifras son estimaciones por tamaño de pesos, no datos publicados por el autor.
- GPU recomendadas: no disponibles. El modelo está pensado para ejecución en CPU y en dispositivos de gama consumer; el autor menciona portátiles, ordenadores convencionales y teléfonos.
- Compatibilidad con GPU consumer: previsiblemente sí en tarjetas con 6 GB o más de VRAM en cuantizaciones bajas, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (citados en la model card); el repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles. El autor afirma que el modelo "vuela" en navegador y teléfono gracias a sus 2.000 millones de parámetros activos, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MERA v2 (razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RusMind 4.5.4 Моментум | 4.647 M | ~2.000 M | no disponible | 0,225 | rusmind-license | GGUF en Hugging Face |
| T-lite · T-Bank | 8.000 M | no disponible | no disponible | 0,218 | no disponible | no disponible en la información |
| Zero-Mistral | 24.000 M | no disponible | no disponible | 0,213 | no disponible | no disponible en la información |
| A-Vibe · Avito | 8.000 M | no disponible | no disponible | 0,187 | no disponible | no disponible en la información |

Los datos de MERA v2 proceden de la propia model card del autor. No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos comparados en la documentación proporcionada.

## Limitaciones y advertencias

- La model card promociona de forma destacada las versiones 4.7 (Моментум, Сокол y Вспышка) y recomienda migrar a 4.7, por lo que esta versión 4.5.4 puede considerarse desactualizada dentro de su propia familia.
- Los resultados de MERA v2 los reporta el autor; no se aportan puntuaciones globales ni desgloses completos para esta variante concreta.
- El modelo está especializado en ruso e inglés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será limitado.
- No se detalla la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- No se documentan sesgos conocidos, pero un ajuste fino orientado a cultura e historia de Rusia puede incorporar sesgos culturales y geopolíticos que conviene evaluar antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en datos históricos y factuales; el autor destaca la corrección de fechas, pero no hay evaluación independiente publicada.
- La licencia rusmind-license es de tipo "other" y no se detallan en la información disponible las restricciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio.
- El repositorio ocupa 20,2 GB, lo que sugiere la presencia de múltiples cuantizaciones GGUF; conviene verificar cuál se ajusta al hardware objetivo.
- No se publican cifras de latencia, throughput ni requisitos oficiales de VRAM u GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.4-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo y sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
