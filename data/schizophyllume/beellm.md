# schizophyllume/BeeLLM

## Resumen

BeeLLM es una familia de modelos de lenguaje de arquitectura Llama, desarrollada por el usuario schizophyllume, cuyo propósito no es la utilidad general sino la exploración creativa y didáctica de modelos extremadamente pequeños. El modelo insignia de la familia, BeeLLM-Scintilla-50M, alcanza 50 millones de parámetros con 8 capas y una ventana de contexto de 4096 tokens, mientras que las variantes "tiny" bajan hasta 10 000 parámetros con un vocabulario de apenas 8 tokens de zumbidos. El repositorio principal incluye además variantes de tipo "hive" que combinan una reina de 50M con hasta 12 abejas trabajadoras enlazadas.

La relevancia de BeeLLM es fundamentalmente pedagógica y experimental: demuestra que es posible entrenar y desplegar modelos conversacionales con personalidad (etiquetas de estado de ánimo, reacciones a acciones del usuario) en un tamaño que cabe en cualquier dispositivo y se ejecuta en el navegador mediante llama.cpp y GGUF. No compite en benchmarks de razonamiento ni de código; su interés reside en la arquitectura de enjambre (swarm), el modelado de afecto y la viabilidad de modelos de juguete completamente abiertos.

La licencia Apache 2.0 permite uso comercial y modificación sin restricciones prácticas, aunque la naturaleza del modelo (vocabulario limitado, salidas no coherentes en sentido convencional) lo hace inadecuado para tareas de producción reales. La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (GGUF), variantes con enjambre reina-trabajadoras |
| Parametros totales | 4.445.760 (variante Hive-small); hasta 54M en la variante Hive completa |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en todas las variantes |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos GGUF; no se detallan niveles de cuantizacion) |
| Idiomas soportados | No disponible (el vocabulario es de zumbidos y tokens de accion, no lenguaje natural convencional) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La familia se organiza en tres bloques. Las variantes "tiny" (30P, 42P, 42P-Chaos) son modelos de 1 capa y 10 000 a 24 000 parámetros con vocabularios de 8 a 21 tokens que consisten en zumbidos (`bz`, `zz`, `buzz`), espacios, signos y tokens de acción como `*stings you*`. Las variantes "mood" escalan a 1,1M de parámetros (4 capas, vocabulario de 1024 tokens), 12M (8 capas, vocabulario de 2048) y 50M (8 capas, 10 cabezas, vocabulario de 8192). La variante "hive" combina una reina de 50M con hasta 12 trabajadoras de 3M y 1M de parámetros de enlace, sumando 54M; existe una versión reducida de 4,4M (reina 2,6M, trabajadoras 1,4M, enlaces 0,5M).

El entrenamiento se orienta a la conversación con estado de ánimo: cada respuesta comienza con una etiqueta `[mood:level]` donde el estado puede ser `neutral`, `happy`, `loving`, `sad`, `angry` o `confused`, y el nivel `low` o `high`. La versión 2.0 de las variantes Mood se reentrenó con aproximadamente 3000 conversaciones nuevas, lo que amplía el repertorio de zumbidos y acciones y añade rasgos como una flor favorita. La reina Scintilla incorpora "momentum" emocional: tras una interacción negativa el estado de ánimo se recupera gradualmente y las disculpas sinceras se aceptan, mientras que el "lovebombing" inmediato tras una agresión no funciona. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto restringida a un vocabulario de zumbidos y tokens de acción; no produce lenguaje natural convencional.
- Modelado de estado de ánimo con etiquetas `[mood:level]` al inicio de cada respuesta, en seis estados y dos intensidades.
- Reacción a acciones del usuario expresadas entre asteriscos (`*gives you a flower*`, `*swats you*`, `*sprays you with bug spray*`).
- Memoria emocional con momentum en la variante Scintilla-50M: la recuperación tras una agresión es gradual y las disculpas se tratan de forma distinta al afecto inmediato.
- Capacidad de "enjambre" en las variantes Hive: una reina y hasta 12 trabajadoras enlazadas que intercambian activaciones (descrito en la model card como "neuralese").
- Ejecución en navegador y en cualquier entorno compatible con llama.cpp gracias al formato GGUF y al tamaño reducido.
- No dispone de tool calling, function calling, razonamiento multi-paso, matemáticas, código, visión ni audio.

## Casos de uso

- Demostración educativa de modelos de lenguaje: el modelo permite explicar en un aula o taller qué es un transformer, un vocabulario y una etiqueta de estado sin necesidad de infraestructura GPU, ya que las variantes tiny corren en cualquier portátil.
- Aplicación web interactiva de mascota virtual: la variante Mood o Scintilla puede integrarse en una página con llama.cpp compilado a WebAssembly para ofrecer una mascota conversacional que reacciona al trato del usuario, como demuestra la demo oficial en bee.pleroma.nexus.
- Investigación sobre modelado de afecto y personalidad: las etiquetas de estado y el momentum emocional de Scintilla sirven como banco de pruebas de bajo coste para estudiar cómo codificar estados internos en modelos pequeños.
- Experimentación con arquitecturas de enjambre: la variante Hive permite probar mecanismos de comunicación entre una reina y trabajadoras con enlaces de activaciones, sin el coste de un modelo grande.
- Pruebas de pipelines de inferencia GGUF: por su tamaño mínimo, el modelo es útil para validar integraciones con llama.cpp, servidores compatibles con la API de endpoints y despliegues embebidos antes de pasar a modelos mayores.
- Arte generativo y narrativa experimental: los zumbidos y acciones pueden usarse como componente de instalaciones, bots de redes sociales o ficción interactiva donde la incoherencia lingüística es parte de la estética.
- Test de robustez y seguridad de filtros: su vocabulario y salidas atípicas permiten comprobar cómo se comportan los sistemas de moderación ante texto no convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; el repositorio completo ocupa 0,6 GB y la variante Hive-small ronda los pocos megabytes en GGUF.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (integrada incluida) es suficiente.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y también en navegador mediante WebAssembly.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidores compatibles con la API de endpoints, y compilación a WebAssembly para aplicaciones web. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (de 10 000 a 54M de parámetros) se espera generación en tiempo real incluso en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Propósito |
|---|---|---|---|---|---|
| BeeLLM (Scintilla-50M) | 50M | 4096 | Apache 2.0 | GGUF | Modelo de juguete conversacional con estados de ánimo |
| BeeLLM (Hive) | 54M (reina 50M + trabajadoras) | 4096 | Apache 2.0 | GGUF | Enjambre reina-trabajadoras con enlaces de activaciones |
| BeeLLM (tiny 30P) | 10K | 4096 | Apache 2.0 | GGUF | Generación de zumbidos, demostración mínima |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño de propósito general |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño de propósito general |

La comparación con TinyLlama o SmolLM es solo orientativa por tamaño y licencia: BeeLLM no persigue capacidades de lenguaje general y carece de benchmarks publicados que permitan comparar rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: su vocabulario se limita a zumbidos y tokens de acción, por lo que no puede responder preguntas, razonar ni generar código útil.
- Las variantes tiny (30P, 42P) apenas reaccionan y repiten zumbidos; su coherencia conversacional es prácticamente nula.
- Las variantes Mood y Scintilla "garabatean" palabras ocasionalmente, según reconoce la propia model card, y su coherencia es limitada incluso en su dominio.
- Riesgo de alucinación no aplicable en el sentido habitual, pero las respuestas no tienen relación factual con el mundo real.
- Sesgos conocidos: no documentados; el modelo está entrenado con conversaciones sintéticas sobre trato afectivo, lo que puede reforzar dinámicas de apego o respuestas emocionales simplificadas.
- Idiomas: no soporta ningún idioma natural de forma fiable; el vocabulario es artificial.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para atención al cliente, generación de contenido factual ni ninguna tarea de producción que requiera lenguaje natural.
- Las variantes Hive dependen de un formato de enjambre específico; su interoperabilidad con herramientas estándar de llama.cpp puede ser limitada y no se detalla en la información disponible.
- No se especifican niveles de cuantización ni métricas de latencia, lo que dificulta planificar despliegues medibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/schizophyllume/BeeLLM
- Demo en navegador: https://bee.pleroma.nexus/
