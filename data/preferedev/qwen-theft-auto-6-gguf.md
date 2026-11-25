# preferedev/qwen-theft-auto-6-gguf

## Resumen

Qwen Theft Auto 6 es un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B, desarrollado por el usuario preferedev, especializado en responder preguntas sobre el videojuego Grand Theft Auto VI. Se distribuye principalmente en formato GGUF para su uso con llama.cpp, Ollama y LM Studio, y cubre dominios como la historia, personajes, misiones, el estado ficticio de Leonida, la historia de desarrollo del juego, la filtración de 2022 y la recepción crítica. El modelo está etiquetado como vision-language-model, aunque la model card no detalla las capacidades de visión.

El modelo resuelve un problema concreto: los asistentes conversacionales genéricos alucinan con frecuencia sobre lore de videojuegos recientes. Para mitigarlo, el autor entrenó el modelo con un conjunto de datos etiquetado por fiabilidad (confirmado, no confirmado, opinión), de forma que el modelo distingue explícitamente entre canon oficial, filtraciones y opiniones de la comunidad. Es relevante ahora porque se entrenó tres días después del lanzamiento del juego, lo que lo convierte en una instantánea temprana del conocimiento disponible en ese momento.

El modelo tiene 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones), se distribuye con licencia Apache 2.0 y está disponible únicamente en inglés. El repositorio GGUF ocupa 18,8 GB e incluye cuantizaciones q2_k, q4_k_m, q8_0 y f16. Existe también una versión LoRA de 170 MB para aplicar sobre el Qwen3.5-4B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.5-4B); etiquetado como vision-language-model, detalles de visión no disponibles |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q2_k, q4_k_m, q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); también LoRA (170 MB) y pesos para transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,3 mil millones de parámetros. El ajuste se realizó mediante LoRA en precisión fp16 con la librería Unsloth, con rango r=32 y alpha=64, sobre una única GPU T4 gratuita de Google Colab. El coste total del entrenamiento fue de 0 dólares y aproximadamente 10 horas de cómputo en GPU gratuita, según indica el autor.

El conjunto de datos de entrenamiento consta de aproximadamente 15.000 pares de instrucción-respuesta construidos a partir de la wiki de GTA, cobertura de prensa y ejemplos de desarrollo y reseñas curados manualmente. La innovación técnica principal no está en la arquitectura, sino en el etiquetado de fiabilidad de cada ejemplo: los datos se clasificaron como `confirmed` (canon de wiki y material oficial), `unconfirmed` (filtraciones, rumores y especulación) u `opinion` (reseñas y reacción de la comunidad). El modelo aprende a formular las respuestas según esa etiqueta, señalando el grado de certeza en lugar de presentar todo con la misma confianza. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el universo de Grand Theft Auto VI.
- Conocimiento de historia y personajes: Jason Duval, Lucia Caminos, Tomás, Brian Heder, Cal Hampton, Real Dimez, Dre'Quan Priest.
- Conocimiento del mundo: Leonida, Vice City, Leonida Keys, Port Gellhorn, Ambrosia, Grassrivers, Mount Kalaga.
- Cobertura de misiones: aproximadamente 100 misiones en 5 capítulos, incluidos Strangers & Freaks.
- Conocimiento de vehículos, armas y emisoras de radio basado en el canon de la wiki.
- Historia de desarrollo: los 13 años de espera, retrasos, la filtración de Lapsus$ de septiembre de 2022 y la historia de los tráilers.
- Recepción: reseñas, puntuaciones y reacción de la comunidad y de los streamers.
- Rumorología: porta de PC y sucesor de GTA Online, siempre formulados como no confirmados.
- Diferenciación explícita entre información confirmada, no confirmada y opinión.
- Etiqueta vision-language-model en el repositorio, aunque las capacidades de visión concretas no están documentadas en la información disponible.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso para agentes.

## Casos de uso

- Asistente conversacional de lore para fans: el modelo responde preguntas sobre personajes, misiones y localizaciones citando el canon de la wiki, y distingue lo confirmado de lo especulado, lo que lo hace adecuado para comunidades que discuten detalles del juego.
- Chatbot para wikis y foros de GTA: se puede desplegar con llama.cpp u Ollama para responder consultas de usuarios en una web o foro, aprovechando el etiquetado de fiabilidad para evitar afirmaciones falsas sobre filtraciones.
- Atención a creadores de contenido: streamers y youtubers pueden consultar rápidamente datos sobre misiones, vehículos y emisoras para preparar guiones o responder en directo, con la ventaja de que el modelo señala cuándo un dato es rumor.
- Herramienta educativa sobre el desarrollo de videojuegos: el modelo cubre la cronología de 13 años de desarrollo, retrasos y la filtración de 2022, útil para explicar la historia de la industria y los riesgos de seguridad en estudios.
- Moderación y verificación de afirmaciones en comunidades: dado que etiqueta sus respuestas por nivel de certeza, puede servir como primer filtro para detectar afirmaciones no confirmadas en hilos de discusión.
- Despliegue local en hardware de consumo: al ser un modelo de 4,3B con cuantizaciones q4_k_m y q8_0, cabe en GPUs de consumo y permite ejecución offline sin coste de API, adecuado para prototipos y demos.
- Base para fine-tunings derivados: la versión LoRA de 170 MB permite a otros desarrolladores aplicar el ajuste sobre su propio Qwen3.5-4B o extenderlo con nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4,3B, las cuantizaciones q4_k_m suelen requerir del orden de 2,5-3,5 GB y f16 en torno a 8-9 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se realizó en una T4 gratuita de Colab.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM usando cuantizaciones q4_k_m o q8_0, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y transformers (con los pesos correspondientes). El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen Theft Auto 6 | ~4,3B | No disponible | Apache 2.0 | Fine-tuning de lore de GTA VI con etiquetado de fiabilidad |
| Qwen3.5-4B (base) | ~4,3B | No disponible | No disponible en la información | Modelo generalista multilingüe |
| Qwen Theft Auto 6 LoRA | ~4,3B (base) | No disponible | Apache 2.0 | Adaptador de 170 MB sobre Qwen3.5-4B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El conocimiento está congelado en el 21 de noviembre de 2026; la cobertura de finales y contenido tardío era escasa en el momento del entrenamiento, y el autor anuncia una regeneración.
- Las respuestas etiquetadas como no confirmadas pueden seguir siendo incorrectas; la etiqueta indica incertidumbre, no veracidad.
- Al ser un modelo de 4B, puede confabular ocasionalmente; el autor recomienda verificar en gta.wiki cualquier dato importante.
- Solo soporta inglés, lo que limita su uso en comunidades hispanohablantes sin traducción previa.
- Es un proyecto de fans y no está afiliado a Rockstar ni a Take-Two; el uso comercial de contenido derivado del juego puede estar sujeto a restricciones de propiedad intelectual ajenas a la licencia Apache 2.0 del modelo.
- La licencia Apache 2.0 se aplica al modelo, pero no necesariamente al contenido de lore subyacente, que pertenece a sus respectivos titulares.
- No se documentan capacidades de tool calling, agentes ni visión, pese a la etiqueta vision-language-model del repositorio.
- La longitud de contexto no está especificada, lo que dificulta planificar conversaciones largas o documentos extensos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/preferedev/qwen-theft-auto-6-gguf
- Repositorio del modelo base (transformers): https://huggingface.co/preferedev/qwen-theft-auto-6
- Adaptador LoRA: https://huggingface.co/preferedev/qwen-theft-auto-6-lora
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Wiki de referencia citada por el autor: https://gta.wiki
