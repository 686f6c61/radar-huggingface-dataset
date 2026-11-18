# DevShin00/furfriends-rag-v6

## Resumen

FurFriends RAG v6 es un modelo de generacion de texto especializado en asistencia para el cuidado de mascotas, desarrollado por DevShin00 como parte de un proyecto de tesis estudiantil en Filipinas (2026). Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer denso de 0,5 mil millones de parametros con licencia Apache 2.0. El modelo esta disenado para operar exclusivamente dentro de un pipeline RAG (generacion aumentada por recuperacion): responde unicamente a partir de los pasajes verificados que la aplicacion le proporciona y declina responder cuando estos no cubren la pregunta.

La version v6 incorpora por primera vez el perfil de la mascota del propietario (especie, raza, edad, peso, alergias, medicamentos, historial medico, vacunas y dieta), lo que permite personalizar las respuestas sin que el modelo invente datos clinicos. El modelo se distribuye en formato ONNX cuantizado a 4 bits (aproximadamente 430 MB) y esta pensado para ejecutarse en CPU, WebGPU o WASM en el navegador mediante transformers.js.

Su relevancia radica en su enfoque de seguridad: el modelo no diagnostica ni sustituye a un veterinario, y la aplicacion verifica cada respuesta contra los pasajes recuperados, reemplazando cualquier nota que el modelo escriba sobre el historial de la mascota. Es un prototipo de estudio, no un producto clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino LoRA sobre capas de atencion |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | 4 bits (bloques de 32) con matematicas en precision completa; formato ONNX |
| Idiomas soportados | Ingles (en) y tagalo/taglish (tl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer denso con atencion causal estandar. Sobre el se aplico un ajuste fino LoRA unicamente en las capas de atencion, durante 1 epoca sobre 1.113 ejemplos con secuencias de hasta 1.024 tokens, entrenado en la CPU de un portatil. El resultado se exporto a ONNX con cuantizacion de pesos a 4 bits en bloques de 32, manteniendo las operaciones matematicas en precision completa, lo que reduce el peso a unos 430 MB.

Los datos de entrenamiento se componen de 582 ejemplos procedentes de respuestas verificadas del equipo, guias de primeros auxilios y paginas de dominio publico de los CDC (Healthy Pets) y la FDA, en ingles y tagalo/taglish, incluyendo preguntas de seguimiento, casos limite (solo pasajes similares, respondidos con "no encontre esto en las fuentes verificadas de FurFriends") y preguntas fuera de alcance. Otros 531 ejemplos son copias con un perfil de mascota simulado: 102 mascotas ficticias con historiales completos, sin usar datos de propietarios reales. Ninguna pregunta de los conjuntos de evaluacion esta en el entrenamiento y las 34 mascotas de evaluacion fueron excluidas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y tagalo/taglish, con soporte de preguntas de seguimiento.
- Respuestas fundamentadas exclusivamente en pasajes recuperados (RAG), con declinacion explicita cuando la informacion no esta en las fuentes.
- Personalizacion mediante perfil de mascota: especie, raza, edad y etapa vital, peso y tendencia, alergias, medicamentos, historial medico, vacunas, dieta, ultima revision y chequeo de salud de la app.
- Generacion de notas de historial ("From [nombre]'s records: ...") cuando los registros de la mascota son relevantes para la pregunta.
- Deteccion de preguntas fuera de alcance y de casos limite (pasajes solo parecidos).
- Ejecucion en navegador y en CPU mediante transformers.js, ONNX, WebGPU o WASM.
- No soporta tool calling ni function calling segun la informacion disponible.
- No dispone de modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Asistente de primeros auxilios para mascotas en una app movil o web: el modelo recibe los pasajes de las guias de primeros auxilios de FurFriends y genera una respuesta paso a paso; si la guia no cubre el caso, declina y la app muestra la respuesta verificada mas cercana.
- Atencion al propietario con contexto personalizado: al seleccionar una mascota, la app inyecta su perfil (alergias, medicamentos, historial) y el modelo adapta la respuesta, anadiendo notas de los registros cuando son pertinentes, sin inventar datos clinicos.
- Triaje conversacional en consultas de sintomas: el modelo gestiona preguntas de seguimiento ("desde cuando", "que comio") dentro de la ventana de 1.024 tokens y responde solo con informacion de las fuentes recuperadas.
- Despliegue en el navegador sin backend: gracias al formato ONNX q4 (~430 MB) y a transformers.js, la inferencia puede ejecutarse en el cliente con WebGPU o WASM, reduciendo costes de servidor y manteniendo los datos de la mascota en el dispositivo.
- Prototipo de investigacion para evaluacion de RAG con declinacion: util para estudiar el comportamiento de "no encontre" en modelos pequenos y medir la tasa de invencion de hechos en dominios sensibles.
- Generacion de respuestas multilingues para usuarios filipinos: soporta ingles y tagalo/taglish, lo que permite atender a propietarios en su idioma habitual dentro de la app.
- Integracion en un pipeline de CI para validacion de respuestas: el modelo puede usarse como generador de referencia en pruebas automatizadas que verifiquen que las respuestas se fundamentan en los pasajes y que las notas de historial las anade la app, no el modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor (2026-11-13, inferencia offline con los prompts propios de la app):

| Prueba | Metrica | v6 | v2 |
|---|---|---|---|
| Perfiles de mascota (68 preguntas, 34 mascotas no vistas) | Hechos de salud inventados sobre la mascota | 0 | 1 |
| Perfiles de mascota (68 preguntas) | Especie incorrecta | 0 | no disponible |
| Declinacion (62 preguntas respondibles con pasaje correcto) | Respuestas que pasan las comprobaciones de la app | 47 | 61 |
| Declinacion (62 preguntas respondibles con pasaje correcto) | Respuestas "no encontre" | 11 | 1 |
| Preguntas que la biblioteca no puede responder | Tasa de respuesta (deberia declinar) | 3% | 6% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el archivo ONNX q4 ocupa aproximadamente 430 MB, por lo que la huella de memoria es del orden de 0,5-1 GB segun el runtime.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU, WebGPU y WASM en navegador.
- Cabe en cualquier GPU de consumo e incluso en CPU de portatil; el autor indica que el ajuste fino se hizo en CPU de portatil.
- Opciones de despliegue: transformers.js (`pipeline("text-generation", ..., { dtype: "q4" })`), ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| FurFriends RAG v6 | 0,5 B | 1.024 tokens (entrenamiento) | Apache 2.0 | ONNX q4 | RAG especializado en mascotas, en/tl |
| Qwen2.5-0.5B-Instruct (base) | 0,5 B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF, ONNX | Asistente general |
| FurFriends RAG v2 | 0,5 B (base Qwen2.5-0.5B-Instruct) | no disponible | Apache 2.0 | no disponible | Version anterior del mismo asistente |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un veterinario y no diagnostica; es un prototipo de estudio en fase de prueba y el equipo no cuenta con un veterinario.
- Riesgo de alucinacion mitigado por el pipeline: la app verifica cada respuesta contra los pasajes y sustituye las notas de historial que escriba el modelo, pero la tasa de respuestas incorrectas que pasan las comprobaciones fue de 15 de 62 en la evaluacion (47 correctas de 62).
- Mayor tendencia a declinar que la version anterior: 11 de 62 respuestas fueron "no encontre" frente a 1 en v2, lo que puede reducir la utilidad percibida.
- Ventana de contexto limitada a 1.024 tokens en entrenamiento, lo que restringe la longitud de los pasajes y del historial inyectado.
- Solo soporta ingles y tagalo/taglish; no hay soporte documentado de otros idiomas.
- No dispone de tool calling, vision ni audio.
- Entrenado con datos de dominio publico de EE. UU. (CDC, FDA) y respuestas del equipo; puede no cubrir normativas o practicas veterinarias de otras regiones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como prototipo de tesis sin garantias de idoneidad clinica.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevShin00/furfriends-rag-v6
- Version anterior: https://huggingface.co/DevShin00/furfriends-rag-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Prompts del proyecto (referenciados en la model card): `src/lib/aiPrompt.json`, `src/lib/prompt.js` y `ai-server/prompting.py` en el repositorio FurFriends (no se proporciona URL directa en la informacion disponible)
