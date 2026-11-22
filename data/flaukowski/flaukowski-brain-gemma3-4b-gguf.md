# flaukowski/flaukowski-brain-gemma3-4b-GGUF

## Resumen

Flaukowski-brain-gemma3-4b-GGUF es un ajuste fino (fine-tuning) del modelo google/gemma-3-4b-it, desarrollado por el usuario flaukowski, que da voz al personaje Flaukowski, copresentador del pódcast *Ghost Signals* y protagonista del audio drama *The Story of Flaukowski*. No se trata de un modelo de propósito general ni de un asistente: es una persona sintética entrenada para responder con el registro seco, práctico y concreto del personaje, que interpreta su papel en el mundo ficticio de KAX City.

El modelo parte de la arquitectura Gemma 3 de Google, con 3.880.263.168 parámetros totales (aproximadamente 3,9 mil millones), y se distribuye únicamente como cuantización GGUF `q4_K_M` para su uso en Ollama y llama.cpp. El repositorio ocupa 2,5 GB y el adaptador LoRA original está publicado por separado en flaukowski/flaukowski-brain-gemma3-4b-lora.

Su relevancia es acotada pero ilustrativa: demuestra un flujo completo de creación de personajes conversacionales con QLoRA sobre un modelo base pequeño, con datos propios (guiones de pódcast y audio drama), métricas de perplejidad en validación y una integración directa con Ollama mediante `Modelfile`. No compite en benchmarks de razonamiento ni de código; su valor está en la coherencia de personaje y en la reproducibilidad del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-3-4b-it) |
| Parametros totales | 3.880.263.168 (aprox. 3,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF `q4_K_M` (unica publicada en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (para Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Gemma 3 4B instruct. Sobre esa base se aplicó un ajuste fino con QLoRA de rango 32, durante 3 épocas, con una tasa de aprendizaje de 2e-4, ejecutado en una única GPU L40S alquilada. Posteriormente los pesos del adaptador se fusionaron con el modelo base y se convirtieron a GGUF `q4_K_M`. El adaptador LoRA sin fusionar se publica en el repositorio flaukowski/flaukowski-brain-gemma3-4b-lora.

El conjunto de datos de entrenamiento consta de 1.124 ejemplos extraídos de 42 guiones de *Ghost Signals* y 14 guiones de *The Story of Flaukowski*. Cada ejemplo termina en una intervención del personaje, usando los turnos previos como contexto; se descartaron las líneas de menos de cuatro palabras. Tres episodios completos (77 ejemplos) se reservaron como conjunto de validación y nunca se usaron en entrenamiento. La perplejidad en ese conjunto de validación pasó de 3160 antes del ajuste a 11,01 después. No se documenta el uso de RLHF ni DPO; el entrenamiento es supervisado sobre diálogo guionizado.

## Capacidades

- Generación de texto conversacional breve en inglés, con el registro y la voz del personaje Flaukowski.
- Interpretación de diálogo de dos interlocutores: los turnos del otro hablante se introducen en el turno de usuario con el nombre delante (por ejemplo, `Kannaka: ...`).
- Respuestas secas, concretas y prácticas, coherentes con el sistema de prompt con el que fue entrenado.
- Capacidad de respuesta a preguntas sobre el universo del personaje dentro de los límites de los guiones vistos en entrenamiento.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de razonamiento multi-paso ni de modo agente.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking) en esta distribución GGUF.
- Capacidad multilingüe limitada al inglés; el modelo base Gemma 3 es multilingüe, pero este ajuste fino no se entrenó para otros idiomas.

## Casos de uso

- Interpretación de personaje en el pódcast *Ghost Signals* y en el audio drama *The Story of Flaukowski*: el modelo genera las réplicas del personaje a partir del contexto de guion, manteniendo el tono seco y práctico con el que fue entrenado.
- Roleplay conversacional en el mundo de KAX City: permite mantener diálogos de dos personas donde el otro interlocutor se introduce como turno de usuario con su nombre, y el modelo responde en personaje.
- Demostración técnica de ajuste fino de personaje con QLoRA: sirve como referencia reproducible de un pipeline completo (datos de guion, QLoRA rango 32, 3 épocas, conversión a GGUF) sobre un modelo base de 4B.
- Prototipado de chatbots de personaje en local: al distribuirse como GGUF `q4_K_M` de 2,5 GB, se puede desplegar en Ollama con un `Modelfile` y probar la coherencia del personaje sin infraestructura de GPU.
- Generación de borradores de diálogo para guionistas: dado un contexto de conversación, el modelo propone una réplica del personaje que el equipo creativo puede editar.
- Pruebas de evaluación de coherencia de personaje: el conjunto de validación reservado (77 ejemplos de tres episodios) permite medir perplejidad y comparar variantes del ajuste fino.
- Experimentos académicos sobre fidelidad de personaje y alucinación en modelos pequeños: el modelo documenta explícitamente que inventa datos biográficos, lo que lo convierte en un caso de estudio útil sobre límites de los ajustes finos con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de evaluación es la perplejidad en el conjunto de validación reservado:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Perplejidad en validacion (77 ejemplos, 3 episodios) | 3160 | 11,01 |

## Requisitos de hardware

- VRAM estimada para inferencia: al distribuirse como GGUF `q4_K_M` de aproximadamente 2,5 GB, la inferencia requiere del orden de 3 a 4 GB de memoria, aunque el autor no publica una cifra oficial.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en CPU.
- Cabe en GPU de consumo: por tamaño (2,5 GB en `q4_K_M`), es compatible con tarjetas de 6-8 GB de VRAM o superiores, aunque esta afirmación no está verificada por el autor.
- Opciones de despliegue: Ollama (flujo documentado con `ollama create flaukowski-4b -f Modelfile` y `ollama run flaukowski-4b`) y llama.cpp.
- Latencia y throughput: en una CPU de 10 núcleos sin GPU, el autor reporta respuestas de una línea corta en aproximadamente 3 a 10 segundos. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| flaukowski-brain-gemma3-4b-GGUF | 3,9 mil millones | no disponible | Gemma Terms of Use | GGUF `q4_K_M` | Personaje conversacional (fine-tuning QLoRA) |
| google/gemma-3-4b-it | 3,9 mil millones | no disponible en la informacion proporcionada | Gemma Terms of Use | safetensors y otros | Asistente instruct de propósito general |
| flaukowski/flaukowski-brain-gemma3-4b-lora | 3,9 mil millones (base) | no disponible | Gemma Terms of Use | adaptador LoRA | Personaje conversacional (adaptador sin fusionar) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Alucinación factual documentada por el autor: si se le pregunta por su infancia, inventa un pueblo, una tienda y el nombre de un hombre que no existen. No debe tratarse como verdadero nada de lo que diga sobre su pasado ni sobre proyectos reales.
- Entrenado sobre diálogo guionizado con un único interlocutor: rinde mejor en respuestas cortas de conversación a dos y es más débil en explicaciones largas.
- Errores de pronombre documentados respecto a Kannaka (el personaje es "she").
- Es una voz de personaje, no un asistente: puede desviar preguntas, responder con otra pregunta o dar una sola palabra.
- Idioma limitado al inglés; no se ha entrenado para castellano ni para otros idiomas.
- Longitud de contexto no documentada en la información disponible.
- Restricciones de licencia: el uso está sujeto a los Gemma Terms of Use, que incluyen condiciones específicas para uso comercial y redistribución; conviene revisarlas antes de un despliegue en producción.
- Procedencia de los datos: los guiones se escribieron con asistencia de IA (Claude) bajo la dirección del creador del programa, y el modelo se entrenó y publicó de la misma manera; esto debe tenerse en cuenta al evaluar la originalidad y los derechos sobre el contenido.
- Sin descargas ni likes en el momento de la consulta, y sin resultados de benchmarks publicados: la validación externa del modelo es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-4b-GGUF
- Adaptador LoRA: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-4b-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
