# Miiyamoto255/Aetheris-Core-2B

## Resumen

Aetheris-Core-2B es un modelo de lenguaje compacto de 2 600 millones de parámetros desarrollado por Miiyamoto255, un creador independiente activo en la comunidad de modelos abiertos. Está construido desde cero sobre la arquitectura Gemma2ForCausalLM de Google, con un enfoque específico en programación, razonamiento, generación creativa y asistencia técnica a desarrolladores. Su diseño busca reducir rechazos innecesarios y ofrecer respuestas directas y útiles, evitando las restricciones excesivas típicas de los modelos orientados a asistencia general.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors, y está pensado para inferencia local en equipos de consumo gracias a su tamaño moderado. Aunque no se publican datos sobre datos de entrenamiento ni benchmarks, la model card destaca sus capacidades en generación de código, depuración, razonamiento multi-paso y desarrollo de videojuegos, lo que lo posiciona como una opción interesante para entornos donde se requiera un asistente técnico sin las limitaciones habituales de los modelos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM |
| Parámetros totales | 2 614 341 888 (2,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Aetheris-Core-2B se basa en la arquitectura Gemma2 de Google, implementada a través de la clase `Gemma2ForCausalLM` de Transformers. Según la model card, el modelo fue entrenado desde cero, aunque no se especifican el número de tokens, la composición del dataset ni las técnicas de alineación empleadas. No hay información sobre procesos de RLHF, DPO o ajuste fino supervisado.

La filosofía de diseño declarada por el autor es priorizar la utilidad sobre la restricción: el modelo interpreta las solicitudes en contexto en lugar de rechazar automáticamente por palabras clave, y busca evitar disclaimers excesivos, advertencias repetitivas y verbosidad innecesaria. Esto sugiere un entrenamiento orientado a reducir sesgos de rechazo y a producir respuestas directas, aunque no se detallan los métodos concretos para lograrlo.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Programación y ingeniería de software: Python, JavaScript, HTML/CSS, C/C++, depuración, algoritmos, arquitectura de código y desarrollo de videojuegos.
- Razonamiento multi-paso: análisis, descomposición de problemas, resolución de incidencias técnicas y explicaciones técnicas.
- Asistencia a desarrolladores: refactorización, optimización, diagnóstico de errores, planificación de proyectos y guía de implementación.
- Desarrollo de juegos: sistemas de gameplay básico-medio, mecánicas, interfaz de usuario, diseño de niveles, scripting y conceptos de assets.
- Generación creativa: personajes, mundos, diálogos, historias, conceptos y lluvia de ideas.
- Conocimiento general: explicaciones, resúmenes, ayuda al aprendizaje y respuesta a preguntas.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de código en entornos locales: un desarrollador puede usar el modelo dentro de un IDE o una herramienta CLI para generar fragmentos de código Python, JavaScript o C++, gracias a su entrenamiento específico en lenguajes de programación y su tamaño reducido que permite ejecutarlo en una GPU de consumo.
- Depuración y diagnóstico de errores: el modelo puede analizar mensajes de error, trazas de pila o bloques de código defectuosos y sugerir correcciones, aprovechando su capacidad de razonamiento multi-paso y su enfoque en ingeniería de software.
- Asistente técnico para planificación de proyectos: ante una descripción de requisitos, el modelo puede descomponer el problema en tareas, proponer arquitecturas de software y recomendar pasos de implementación, útil para desarrolladores que necesitan orientación sin depender de un servicio en la nube.
- Escritura creativa y narrativa: el modelo puede generar personajes, diálogos, tramas y descripciones de mundos para proyectos de ficción, juegos de rol o campañas de juegos de mesa, gracias a su capacidad de generación creativa y su tono directo sin restricciones excesivas.
- Desarrollo de videojuegos indie: un creador independiente puede emplear el modelo para diseñar mecánicas de juego, escribir scripts de eventos, sugerir estructuras de niveles o conceptualizar assets, todo ello sin necesidad de una infraestructura de servidores.
- Educación y autoaprendizaje: el modelo puede explicar conceptos técnicos, resumir documentación o responder preguntas de programación y matemáticas, funcionando como un tutor local accesible sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,6 B parámetros, en FP16 se necesitan aproximadamente 5,2 GB de VRAM solo para los pesos, más overhead de activaciones y caché. Con cuantización de 4 bits (no disponible oficialmente, pero posible con herramientas como llama.cpp o GPTQ) se podría reducir a unos 1,5-2 GB.
- GPU recomendadas: una tarjeta con 6 GB de VRAM o más, como una RTX 2060, RTX 3060, RTX 4060 o superior, podría ejecutar el modelo en FP16. Para cuantizaciones más agresivas, una GPU con 4 GB (GTX 1650, RX 6500 XT) podría ser suficiente.
- Compatibilidad con hardware de consumo: sí, el tamaño de 2,6 B está diseñado para funcionar en GPUs de gama media y baja, así como en CPUs modernas con suficiente RAM.
- Opciones de despliegue: al ser un modelo de Transformers con safetensors, se puede cargar con la librería `transformers` en Python, o servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU como una RTX 3060, se espera una velocidad de decodificación de decenas de tokens por segundo, aunque depende de la implementación y la longitud de la ventana de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni comparativas publicadas que permitan una comparación objetiva con otros modelos de tamaño similar. Como referencia cualitativa, modelos como Gemma-2B (de Google, arquitectura similar) o Phi-2 (de Microsoft, 2,7 B) ocupan un rango de parámetros comparable, pero sus datos de entrenamiento, licencias y rendimiento no están documentados en la información disponible para este modelo.

## Limitaciones y advertencias

- Al ser un modelo de 2,6 B parámetros, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos más grandes (7 B, 13 B o superiores). Puede cometer errores en tareas que requieran conocimientos profundos o razonamiento abstracto avanzado.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios sensibles. El autor declara una filosofía de minimizar rechazos, lo que podría aumentar el riesgo de generar contenido inapropiado o peligroso si se usa sin supervisión.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se especifica la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas (por ejemplo, análisis de documentos extensos).
- La licencia MIT permite uso comercial y modificación, pero el autor solicita incluir su nombre en los créditos. No hay restricciones adicionales documentadas.
- El repositorio tiene cero descargas y un solo like, lo que sugiere que el modelo es muy reciente y no ha sido validado por la comunidad. Los usuarios deben probarlo en sus casos de uso específicos antes de confiar en él en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Miiyamoto255/Aetheris-Core-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Miiyamoto255
- Otro modelo del autor: https://huggingface.co/Miiyamoto255/SimplyAI-2B-Uncensored
- Repositorio GitHub relacionado (implementación alternativa de un modelo 2B): https://github.com/itz-sayak/aether-2B
- Sitio web aetheris.ai: http://aetheris.ai/
