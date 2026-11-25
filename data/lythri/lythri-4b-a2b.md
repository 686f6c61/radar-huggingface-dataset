# Lythri/Lythri-4B-A2B

## Resumen

Lythri-4B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Lythri, un proyecto centrado en modelos de compania emocional que se ejecutan en dispositivo. Se trata de un ajuste fino del modelo base google/gemma-4-E2B, con 4.628.569.379 parametros totales y 2.300 millones de parametros activos, disenado explicitamente para conversaciones multiturno orientadas al acompanamiento emocional en lugar de para tareas de codigo o matematicas.

El modelo se posiciona como una alternativa ligera que cabe en un portatil o un telefono, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers. Su propuesta de valor es la inteligencia emocional: segun el autor, con solo 2.300 millones de parametros activos logra resultados comparables a Gemma 4 E4B instruction-tuned (8.000 millones) en tres benchmarks de emocion en evaluacion zero-shot.

La relevancia actual del modelo radica en el nicho de asistentes conversacionales de apoyo emocional ejecutables localmente, un caso de uso con requisitos de privacidad estrictos donde el despliegue en la nube no es viable. El modelo fue publicado el 1 de octubre de 2026 y actualizado el 12 de octubre de 2026, con 293 descargas y 20 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, derivada de google/gemma-4-E2B |
| Parametros totales | 4.628.569.379 |
| Parametros activos | 2.300 millones (2.3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en Lythri/Lythri-4B-A2B-GGUF; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base google/gemma-4-E2B, que emplea una arquitectura de mezcla de expertos con 4.630 millones de parametros totales y 2.300 millones activos por token. La model card no detalla la configuracion interna de la MoE (numero de expertos, top-k de enrutamiento, dimension de las capas) ni la longitud de contexto nativa, por lo que estos datos no estan disponibles.

En cuanto al entrenamiento, la informacion proporcionada no especifica el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card unicamente indica que el modelo esta entrenado para comprender como se sienten las personas y mantener conversaciones naturales multiturno, priorizando esta capacidad sobre las puntuaciones en matematicas y codigo. El autor remite a un informe tecnico en Zenodo (DOI 10.5281/zenodo.23179311) para los detalles completos del proceso.

## Capacidades

- Generacion de texto conversacional multiturno orientada a acompanamiento emocional.
- Reconocimiento y respuesta a estados emocionales del interlocutor, segun la orientacion declarada del modelo.
- Capacidad de vision: las etiquetas del repositorio incluyen image-text-to-text, lo que indica entrada multimodal de imagen y texto.
- Capacidad de generacion de texto etiquetada como text-generation en el pipeline de Hugging Face.
- Despliegue en dispositivo (on-device) gracias a su tamano reducido y a la disponibilidad de pesos GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de acompanamiento emocional local: el modelo puede mantener conversaciones multiturno de apoyo en un portatil o telefono sin enviar datos a la nube, lo que resulta adecuado para usuarios con requisitos estrictos de privacidad y para su uso en dispositivos sin conectividad.
- Aplicacion de diario reflexivo: integrado en una app movil, el modelo puede procesar las entradas de texto del usuario y responder con empatia, aprovechando su entrenamiento especifico en comprension emocional frente a modelos generalistas del mismo tamano.
- Chatbot de bienestar en atencion al cliente interna: puede gestionar conversaciones de acompanamiento para empleados en programas de bienestar corporativo, con despliegue en servidores propios y sin coste de licencia gracias a Apache 2.0.
- Prototipado de interfaces conversacionales con vision: al aceptar entrada image-text-to-text, permite construir demos que combinen una imagen (por ejemplo, una foto del entorno del usuario) con texto para generar respuestas contextualizadas.
- Investigacion en IA afectiva: sirve como linea base reproducible para estudiar el comportamiento de modelos MoE pequenos en tareas de emocion, con pesos abiertos y un informe tecnico asociado en Zenodo.
- Educacion y simulacion de entrevistas: el modelo puede interpretar el rol de interlocutor empatico en ejercicios de practica conversacional, ejecutandose en el dispositivo del estudiante sin depender de APIs externas.
- Aplicaciones offline en dispositivos de gama media: la variante GGUF permite desplegar el modelo en entornos con recursos limitados mediante llama.cpp u Ollama, cubriendo escenarios de campo o zonas sin red.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Lythri-4B-A2B | Lythri-7B-A4B |
|---|---|---|
| MMLU | 55,23 | 69,09 |
| MMLU-Pro | 24,42 | 38,17 |
| ARC-E | 81,40 | 83,42 |
| ARC-C | 52,99 | 60,58 |
| PIQA | 79,49 | 81,88 |
| HellaSwag | 72,80 | 78,29 |
| WinoGrande | 68,43 | 74,90 |
| CommonsenseQA | 65,52 | 77,07 |
| SocialIQA | 49,80 | 50,46 |
| TruthfulQA MC2 | 46,16 | 49,66 |
| OpenBookQA | 41,00 | 43,60 |
| GPQA Diamond | 28,79 | 27,78 |
| GSM8K | 28,81 | 62,02 |
| MATH | 3,62 | 21,28 |
| BoolQ | 73,15 | 85,32 |

El autor afirma ademas que, en tres benchmarks de emocion en evaluacion zero-shot, Lythri-4B-A2B es comparable a Gemma 4 E4B instruction-tuned (8.000 millones) pese a tener solo 2.300 millones de parametros activos. Los valores numericos concretos de esos tres benchmarks de emocion no se incluyen en la informacion proporcionada; la model card los presenta solo en forma de grafico.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,3 GB solo para los pesos, segun el tamano del repositorio; se recomienda reservar 12 GB o mas para margen de activaciones y cache KV.
- Cuantizacion de 8 bits: en torno a 4,7-5 GB de VRAM; cuantizacion de 4 bits: en torno a 2,5-3 GB, estimaciones derivadas del numero de parametros totales.
- GPU recomendadas para servicio: A100, H100 o L40S para despliegues con concurrencia; RTX 4090 o RTX 3090 para inferencia individual en fp16.
- GPU de consumo: cabe en tarjetas con 8-12 GB de VRAM en cuantizaciones de 4-8 bits; en fp16 requiere tarjetas de 16 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama mediante los pesos GGUF del repositorio Lythri/Lythri-4B-A2B-GGUF, y servidores compatibles con la API de endpoints de Hugging Face. Soporte de vLLM o TGI no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MMLU | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Lythri-4B-A2B | 4,63B | 2,3B | no disponible | 55,23 | 28,81 | Apache 2.0 |
| Lythri-7B-A4B | 7,46B | 4,5B | no disponible | 69,09 | 62,02 | no disponible |
| Gemma 4 E2B (base) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 E4B instruction-tuned | 8B (segun model card) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos publicados por el propio autor. No se dispone de resultados numericos de los modelos Gemma 4 de referencia en la informacion proporcionada, salvo la afirmacion cualitativa de paridad en benchmarks de emocion con Gemma 4 E4B instruction-tuned.

## Limitaciones y advertencias

- El modelo esta especializado en acompanamiento emocional y no en tareas de razonamiento formal: MATH queda en 3,62 y GSM8K en 28,81, valores muy bajos para uso en matematicas o codigo.
- Riesgo de alucinacion relevante en dominios factuales: TruthfulQA MC2 de 46,16 y GPQA Diamond de 28,79 indican una fiabilidad limitada en conocimiento especializado.
- No debe utilizarse como sustituto de atencion psicologica o medica profesional; la model card no documenta salvaguardas clinicas ni protocolos de derivacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base google/gemma-4-E2B puede estar sujeto a terminos adicionales de Google que conviene verificar antes de un despliegue en produccion.
- El autor declara el modelo como "on-device"; el rendimiento real en telefonos no esta cuantificado en la informacion disponible.
- Ausencia de datos sobre tool calling y comportamiento agentico: no conviene asumir estas capacidades en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-4B-A2B
- Pesos GGUF: https://huggingface.co/Lythri/Lythri-4B-A2B-GGUF
- Modelo hermano Lythri-7B-A4B: https://huggingface.co/Lythri/Lythri-7B-A4B
- Pesos GGUF de Lythri-7B-A4B: https://huggingface.co/Lythri/Lythri-7B-A4B-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe tecnico (DOI): https://doi.org/10.5281/zenodo.23179311
- Informe tecnico en Zenodo: https://zenodo.org/records/23179312
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Banner del proyecto: https://huggingface.co/spaces/Lythri/README/resolve/main/Banner_flat.png
