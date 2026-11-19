# Lythri/Lythri-Tada-4B

## Resumen

Lythri-Tada-4B es un modelo de lenguaje conversacional desarrollado por Lythri, orientado específicamente a soporte emocional y uso como compañero conversacional en dispositivos locales. Forma parte de la familia Lythri 2.0 y se construye como un fine-tuning del modelo base google/gemma-4-E2B, con 4.628.569.379 parámetros totales y 2.300 millones de parámetros activos, lo que lo sitúa en la categoría de modelos MoE (mixture of experts) de tamaño medio con huella de cómputo reducida. Su propuesta diferencial es responder de forma directa, sin fase de razonamiento explícita (thinking), priorizando la naturalidad del texto y la comprensión emocional sobre el conocimiento enciclopédico.

El modelo llega con mejoras notables frente a su predecesor Lythri-4B-A2B en tres frentes: seguimiento de instrucciones (IFEval de 39,19 frente a 26,43, superando incluso al Lythri-7B-A4B con 31,05), consistencia en conversaciones multi-turno y soporte de system prompt para definir persona, tono o reglas de aplicación. En la métrica EQ-Bench Slop Score, que mide la dependencia de muletillas típicas de IA (menor es mejor), obtiene 39,0, por delante de GPT-4o (47,7), DeepSeek-R1 (67,9), Qwen3-4B (62,2) y Gemma-3-4B (85,2).

Su relevancia actual radica en la combinación de licencia Apache 2.0, tamaño contenido para inferencia on-device y un enfoque explícito en calidad conversacional y naturalidad de escritura, un nicho poco cubierto por los modelos generalistas de su rango. El repositorio ocupa 19,4 GB en formato safetensors y acumula 2.038 descargas desde su publicación en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de google/gemma-4-E2B) |
| Parametros totales | 4.628.569.379 |
| Parametros activos | 2.300 millones (aproximado, según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se recomienda bfloat16 en el quickstart) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lythri-Tada-4B es un fine-tuning del modelo google/gemma-4-E2B, un transformer con arquitectura de mezcla de expertos (MoE) que activa aproximadamente 2.300 millones de parámetros de un total de 4.630 millones. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO o similares; esta información no está disponible. El modelo se distribuye con la plantilla de chat de Gemma y admite system prompt, una novedad respecto a la generación anterior.

La innovación principal declarada por el autor es la eliminación de la fase de razonamiento explícito: Tada responde directamente, lo que reduce la latencia y produce texto más natural. El énfasis del entrenamiento se ha puesto en la comprensión emocional y la coherencia multi-turno, a costa de un ligero deterioro en conocimiento de cola larga (GPQA Diamond baja de 28,79 a 21,21 respecto a Lythri-4B-A2B). El quickstart recomienda decodificación por muestreo con temperatura 0,8 y top_p 0,95, y los benchmarks se han evaluado con la plantilla de chat aplicada para reflejar condiciones reales de inferencia.

## Capacidades

- Generación de texto conversacional con respuestas directas, sin fase de thinking.
- Comprensión y acompañamiento emocional: el modelo está entrenado para responder a situaciones de apoyo emocional y conversación de compañía.
- Soporte de system prompt para definir persona, tono y reglas de comportamiento.
- Conversaciones multi-turno con seguimiento del hilo emocional y de las peticiones previas del usuario.
- Seguimiento de instrucciones mejorado (IFEval 39,19 en prompt-level strict).
- Razonamiento social y sentido común conversacional (SocialIQA 51,43; HellaSwag 74,23).
- Capacidades básicas de conocimiento general (MMLU 55,41; ARC-C 56,57).
- Capacidades limitadas de matemáticas (GSM8K 27,45) y código (HumanEval 24,39).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión: la etiqueta image-text-to-text aparece en los tags de Hugging Face, pero la model card no documenta uso multimodal; no disponible como capacidad confirmada.

## Casos de uso

- Aplicaciones de acompañamiento emocional on-device: el modelo puede gestionar conversaciones de apoyo en local gracias a su tamaño contenido (2.300 millones de parámetros activos) y su entrenamiento específico en comprensión emocional, sin enviar datos sensibles a la nube.
- Chatbots de atención al cliente con tono humano: su Slop Score de 39,0 y su capacidad de mantener el hilo multi-turno lo hacen adecuado para conversaciones de soporte donde la naturalidad del lenguaje importa más que el conocimiento técnico profundo.
- Asistentes personales con persona configurable: el soporte de system prompt permite definir el tono, las reglas y la personalidad del asistente directamente en el mensaje de sistema, algo que su predecesor no permitía.
- Prototipado rápido de aplicaciones conversacionales: la licencia Apache 2.0 y el formato safetensors compatible con transformers permiten integrarlo en pipelines de desarrollo sin restricciones comerciales.
- Journaling y reflexión guiada: el modelo puede actuar como interlocutor en aplicaciones de escritura terapéutica o diarios personales, manteniendo el contexto emocional entre turnos.
- Educación socioemocional: puede utilizarse en entornos formativos para simular conversaciones sobre gestión emocional, empatía o resolución de conflictos, con la ventaja de ejecutarse localmente.
- Despliegue en dispositivos con recursos limitados: al activar solo 2.300 millones de parámetros, es viable en hardware de consumo, lo que habilita asistentes conversacionales en portátiles o estaciones de trabajo sin GPU de datacenter.

## Benchmarks y rendimiento

| Benchmark | Lythri-4B-A2B | Lythri-Tada-4B |
|---|---|---|
| MMLU | 55,23 | 55,41 |
| ARC-C | 52,99 | 56,57 |
| HellaSwag | 72,80 | 74,23 |
| SocialIQA | 49,80 | 51,43 |
| GPQA Diamond | 28,79 | 21,21 |
| GSM8K | 28,81 | 27,45 |
| HumanEval | 28,66 | 24,39 |
| IFEval | 26,43 | 39,19 |
| EQ-Bench Slop Score (menor es mejor) | no disponible | 39,0 |

Comparativas adicionales del Slop Score citadas en la model card: GPT-4o 47,7; DeepSeek-R1 67,9; Qwen3-4B 62,2; Gemma-3-4B 85,2. Todos los benchmarks se evaluaron con la configuración oficial y la plantilla de chat aplicada; Lythri-4B-A2B se evaluó con thinking y Lythri-Tada-4B sin thinking.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,3 GB solo para pesos (4.630 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,6 GB para pesos; en 4 bits, unos 2,3 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090, RTX 4080 o RTX 3090 para inferencia local en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bfloat16; en cuantización de 8 o 4 bits cabría en GPUs de 6-8 GB, aunque sin pesos cuantizados publicados por el autor.
- Opciones de despliegue: transformers (soporte oficial vía AutoModelForCausalLM), y previsiblemente vLLM, TGI o llama.cpp si se generan conversiones GGUF, aunque el autor solo documenta transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | IFEval | Slop Score | Licencia |
|---|---|---|---|---|---|
| Lythri-Tada-4B | 4,63B / 2,3B | no disponible | 39,19 | 39,0 | Apache 2.0 |
| Lythri-4B-A2B | no disponible | no disponible | 26,43 | no disponible | no disponible |
| Lythri-7B-A4B | no disponible | no disponible | 31,05 | no disponible | no disponible |
| Qwen3-4B | 4B (aproximado) | no disponible | no disponible | 62,2 | no disponible |
| Gemma-3-4B | 4B (aproximado) | no disponible | no disponible | 85,2 | no disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre contexto, licencia o benchmarks completos de los modelos alternativos en la documentación proporcionada.

## Limitaciones y advertencias

- Conocimiento de cola larga debilitado: GPQA Diamond cae de 28,79 a 21,21 respecto a Lythri-4B-A2B, por lo que no es adecuado para preguntas científicas de nivel avanzado.
- Rendimiento bajo en matemáticas (GSM8K 27,45) y código (HumanEval 24,39): no recomendado para tareas técnicas o de programación.
- Riesgo de alucinación inherente a los modelos de lenguaje; el enfoque en naturalidad conversacional no elimina este riesgo, especialmente en dominios factuales.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas más allá de lo indicado cualitativamente por el autor.
- Idiomas soportados no documentados: aunque el modelo base Gemma es multilingüe, no hay confirmación de cobertura idiomática para este fine-tuning.
- Uso en soporte emocional: el modelo no sustituye a profesionales de salud mental; debe desplegarse con salvaguardas y avisos claros en aplicaciones reales.
- Capacidad multimodal no confirmada: la etiqueta image-text-to-text aparece en Hugging Face pero la model card no documenta uso de visión; no asumir soporte de imagen.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base google/gemma-4-E2B, cuyos términos pueden imponer restricciones adicionales.
- No se han publicado pesos cuantizados oficiales ni datos de latencia/throughput, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-Tada-4B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe técnico (Zenodo): https://zenodo.org/records/23179312
- DOI de la publicación: https://doi.org/10.5281/zenodo.23179311
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- EQ-Bench Slop Score: https://eqbench.com/slop-score.html
