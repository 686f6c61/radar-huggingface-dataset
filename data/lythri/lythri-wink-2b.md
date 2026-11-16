# Lythri/Lythri-Wink-2B

## Resumen

Lythri-Wink-2B es un modelo de lenguaje conversacional desarrollado por Lythri, orientado a conversacion en dispositivo (on-device) y apoyo emocional. Forma parte de la familia Lythri 2.0 y se construye como un fine-tuning del modelo base google/gemma-4-E2B. Cuenta con 2.522.816.159 parametros totales y 1.480 millones de parametros activos, lo que lo situa en la categoria de modelos compactos con arquitectura de mezcla de expertos (MoE).

El modelo esta disenado explicitamente para priorizar un footprint de despliegue reducido, conversaciones multi-turno y soporte de system prompt, sacrificando deliberadamente rendimiento en conocimiento general, razonamiento, matematicas y codigo. El autor lo presenta como una alternativa mas ligera que Lythri-Tada-4B dentro de la misma familia, no como un competidor en benchmarks generales.

Su relevancia actual radica en la combinacion de licencia Apache 2.0, tamano contenido (repo de 5,1 GB) y orientacion a casos de uso de acompanamiento conversacional y soporte emocional, un nicho donde los modelos generalistas suelen producir respuestas poco naturales o excesivamente formateadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de google/gemma-4-E2B; transformer |
| Parametros totales | 2.522.816.159 (2,52B) |
| Parametros activos | 1,48B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor evalua en Q8_0 GGUF, lo que implica soporte de cuantizacion GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); existe variante GGUF Q8_0 usada en evaluacion |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-E2B, un transformer con arquitectura de mezcla de expertos que activa 1,48B de sus 2,52B parametros totales por token. Esta configuracion permite un coste de inferencia mas cercano a un modelo de 1,5B que a uno de 2,5B denso, lo que encaja con el objetivo declarado de despliegue en dispositivo.

El fine-tuning se orienta a conversacion de acompanamiento multi-turno, con entrenamiento sobre conversaciones de multiples turnos y contexto de turnos anteriores. El modelo soporta system prompt para definir persona, tono o reglas de la aplicacion. El autor indica que responde de forma directa, sin modo de razonamiento explicito (thinking). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con respuestas directas, sin cadena de pensamiento explicita.
- Conversacion multi-turno con aprovechamiento del contexto de turnos anteriores.
- Soporte de system prompt para configurar persona, tono y reglas de comportamiento.
- Apoyo emocional y conversacion de acompanamiento, dominio principal del fine-tuning.
- Procesamiento de entrada imagen-texto segun los tags del repositorio (image-text-to-text); no se detalla el alcance de esta capacidad en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Rendimiento deliberadamente limitado en conocimiento, razonamiento, matematicas y codigo.

## Casos de uso

- Aplicaciones de acompanamiento emocional en dispositivo: el modelo puede mantener conversaciones multi-turno con contexto de turnos previos y un system prompt que defina el tono del asistente, lo que permite integrarlo en apps moviles o de escritorio sin depender de la nube.
- Asistente conversacional embebido: con 1,48B parametros activos y pesos en safetensors de aproximadamente 5,1 GB en el repo, es viable desplegarlo en equipos de consumo mediante cuantizacion GGUF, reduciendo costes de infraestructura.
- Simulacion de dialogo para formacion: su entrenamiento en conversaciones de acompanamiento lo hace adecuado para generar respuestas de practica en escenarios de escucha activa y apoyo interpersonal.
- Prototipado rapido de chatbots con persona: el soporte de system prompt permite definir un personaje o estilo concreto en el mensaje de sistema, sin reentrenamiento, para demos y validacion de producto.
- Generacion de respuestas empaticas en herramientas de bienestar: puede redactar mensajes de apoyo o reformulaciones empaticas en flujos de texto, dado su enfoque en naturalidad de escritura frente a modelos generalistas.
- Filtrado y generacion de conversaciones sinteticas: util como generador de dialogos de acompanamiento para aumentar datasets de entrenamiento o evaluacion en el dominio socioemocional.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente, permite procesar conversaciones sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Resultados publicados por el autor. Lythri-Wink-2B evaluado como GGUF Q8_0, con plantilla de chat y ajustes estandar de cada tarea. La comparacion con Lythri-Tada-4B es una referencia de familia, no una comparacion con igual numero de parametros.

| Benchmark | Lythri-Tada-4B | Lythri-Wink-2B |
|---|---|---|
| MMLU | 55,41 | 39,32 |
| ARC-C | 56,57 | 41,13 |
| HellaSwag | 74,23 | 58,65 |
| SocialIQA | 51,43 | 45,24 |
| GPQA Diamond | 21,21 | 23,23 |
| GSM8K | 27,45 | 13,04 |
| HumanEval | 24,39 | 7,93 |
| IFEval | 39,19 | 23,48 |

En naturalidad de escritura, el autor cita el EQ-Bench Slop Score: Lythri-Tada-4B obtiene 39,0, frente a GPT-4o (47,7), DeepSeek-R1 (67,9), Qwen3-4B (62,2) y Gemma-3-4B (85,2). No se proporciona la puntuacion de Lythri-Wink-2B en esta metrica.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5 GB solo para pesos (2,52B parametros), mas overhead de activaciones y cache KV; en la practica, del orden de 6-8 GB segun longitud de contexto y lote.
- VRAM estimada en cuantizacion Q8_0: en torno a 2,7 GB para pesos; en Q4, aproximadamente 1,5-1,8 GB.
- GPU recomendadas: A100 o H100 para despliegue de alta concurrencia; RTX 4090, RTX 4080 o RTX 3090 para inferencia en una sola GPU sin cuantizar.
- Cabe en GPU de consumo: si, incluidas tarjetas de 8 GB en bfloat16 y de 4-6 GB con cuantizacion GGUF.
- Opciones de despliegue: transformers (referencia del autor), llama.cpp y Ollama mediante GGUF, y servidores compatibles con la API de transformers (el repo incluye el tag endpoints_compatible). Soporte de vLLM o TGI: no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lythri-Wink-2B | 2,52B totales / 1,48B activos | no disponible | Apache 2.0 | Enfoque en soporte emocional y on-device; MMLU 39,32 |
| Lythri-Tada-4B | no disponible | no disponible | no disponible | Mismo autor y familia; mas capaz en benchmarks (MMLU 55,41) pero mayor footprint |
| Qwen3-4B | 4B (aproximado) | no disponible | no disponible | Citado por el autor en Slop Score (62,2); modelo generalista |
| Gemma-3-4B | 4B (aproximado) | no disponible | no disponible | Citado por el autor en Slop Score (85,2); modelo generalista |

Los datos de Qwen3-4B y Gemma-3-4B solo cubren el Slop Score en la informacion disponible; no hay comparacion de parametros, contexto ni benchmarks generales con Wink-2B.

## Limitaciones y advertencias

- Rendimiento bajo en tareas de conocimiento, razonamiento, matematicas y codigo (GSM8K 13,04; HumanEval 7,93; MMLU 39,32). No es adecuado como modelo generalista.
- Riesgo de alucinacion en consultas factuales, agravado por su orientacion conversacional y su menor capacidad de conocimiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al tratarse de un modelo de soporte emocional, existe riesgo de respuestas inapropiadas en situaciones de crisis, por lo que requiere salvaguardas externas en produccion.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no disponible: limita la planificacion de despliegues con historiales largos.
- Aunque la licencia es Apache 2.0, el modelo base google/gemma-4-E2B puede estar sujeto a terminos adicionales de Google; conviene revisar las condiciones del modelo base antes de un uso comercial.
- No se documenta soporte de tool calling ni de agentes, lo que descarta su uso en pipelines que requieran invocacion de funciones.
- El modelo responde sin modo de razonamiento explicito, lo que puede reducir la calidad en tareas que se beneficien de cadena de pensamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-Wink-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe tecnico (Zenodo): https://zenodo.org/records/23179312
- DOI asociado: https://doi.org/10.5281/zenodo.23179311
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- EQ-Bench Slop Score: https://eqbench.com/slop-score.html
