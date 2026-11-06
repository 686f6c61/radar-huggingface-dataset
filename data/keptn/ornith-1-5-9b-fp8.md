# keptn/ornith-1.5-9b-fp8

## Resumen

Ornith 1.5 9B es un modelo denso de 9.000 millones de parámetros con capacidades de razonamiento y visión, desarrollado por el equipo Ornith (ornith-ai) y construido sobre Qwen3.5. El modelo base se distribuye en bf16, y esta ficha corresponde a la conversión a FP8 realizada por keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. Está afinado específicamente para tareas de programación y flujos agénticos, e incorpora un modo de pensamiento (*thinking*) activado por defecto.

La relevancia de esta variante es doble: por un lado, empaqueta los pesos en un único fichero de 10,67 GiB con cuantización FP8 (E4M3) por bloques de 128×128, lo que permite ejecutar un modelo de 9B con 262.144 tokens de contexto en una sola tarjeta AMD de 32 GB; por otro, incorpora decodificación especulativa mediante la propia cabeza MTP (*multi-token prediction*) del modelo, con 3 tokens de borrador.

El modelo acepta entradas de texto e imagen (pipeline `image-text-to-text`) y se publica bajo licencia MIT, heredada del modelo base. Su ecosistema de despliegue está restringido al motor radiance (versión 1.15.1 o superior) sobre hardware AMD RDNA4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5), con cabeza MTP para decodificación especulativa |
| Parametros totales | 9B (aproximado, según denominación del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala bf16 por bloque de 128×128; activaciones FP8; lm_head FP8; copia de 2 bits del lm_head para tokens de borrador |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 10,67 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B parámetros derivado de Qwen3.5 (licencia Apache 2.0), afinado por el equipo Ornith para razonamiento, código y trabajo agéntico. Incluye una cabeza MTP (*multi-token prediction*) que en esta conversión se reutiliza como mecanismo de decodificación especulativa con 3 tokens de borrador. Dispone de un modo de pensamiento activable por petición mediante `chat_template_kwargs` y de un codificador visual para entradas de imagen.

La conversión a FP8, realizada por keptn, redondea cada capa lineal del tronco y de la capa MTP a FP8 con una escala por bloque de 128×128 (redondeo al más cercano), aplica el mismo tratamiento al lm_head y añade una copia de 2 bits del lm_head para los tokens de borrador, siguiendo la receta de radiance para Qwen3.6-35B-A3B. No se utilizaron datos de calibración. La herramienta empleada es `rad-convert` con `quant_method=fp8`, `fmt=e4m3`, `weight_block_size=128 128` y `activation_scheme=dynamic`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto y desactivable por petición.
- Generación y asistencia en código, con ajuste específico del autor para programación precisa (`--temp 0.6 --presence-penalty 0`).
- Comprensión de imágenes (pipeline `image-text-to-text`), con respuestas de hasta 32 tokens en las pruebas publicadas.
- Flujos agénticos y trabajo multi-paso, según la orientación declarada del modelo base.
- Decodificación especulativa nativa mediante cabeza MTP con 3 tokens de borrador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Entrada de audio y vídeo: la model card menciona mediciones para codificadores de visión y audio, pero solo publica resultados para imágenes; el soporte efectivo de audio y vídeo no está confirmado.

## Casos de uso

- Asistencia de código en local sobre estación de trabajo AMD: con un único fichero de 10,67 GiB y una Radeon AI PRO R9700 de 32 GB, el modelo puede servir autocompletado, revisión y generación de código sin depender de la nube, usando los parámetros de muestreo recomendados para código.
- Agentes de programación multi-paso: la ventana de 262.144 tokens permite mantener en contexto repositorios completos, trazas de herramientas y planes de varios pasos; el modo de pensamiento favorece la planificación en tareas complejas.
- Procesamiento de documentación técnica con imágenes: al aceptar texto e imagen, puede extraer información de diagramas, capturas de pantalla y documentación escaneada, aunque con mayor desviación respecto al modelo bf16 en respuestas visuales (KL medio de 0,102).
- Servicio de chat multi-turno con contexto largo: el pool de KV permite 1.048.624 tokens de contexto compartidos entre 4 secuencias en una sola tarjeta, adecuado para conversaciones largas o sesiones concurrentes moderadas.
- Analítica de documentos extensos: contratos, informes o expedientes de decenas de miles de tokens pueden procesarse en una sola pasada sin fragmentación, con prefill medido de 8.106 tokens/s a 24k en una tarjeta.
- Despliegue en infraestructura AMD on-premise: organizaciones con clústeres RDNA4 pueden servir el modelo con radiance en contenedor Docker, con opción de escalar a dos tarjetas mediante `--tp 2 --p2p on` para alcanzar 237,9 tokens/s en decodificación de un solo flujo.
- Evaluación comparativa de cuantizaciones: el fichero incluye métricas KL frente al original bf16, útil como referencia para validar pipelines de cuantización FP8 en radiance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card publica métricas de fidelidad frente al modelo bf16 y de velocidad:

| Metrica | Este fichero (FP8) | keptn/ornith-1.5-9b-bf16 |
|---|---|---|
| KL medio (texto, 80 preguntas MT-Bench) | 0,00498 | 0,00086 |
| KL percentil 99 | 0,0514 | 0,00753 |
| Token top idéntico | 97,8% | 98,9% |
| Ratio de perplejidad | ×1,001 | ×1,001 |

| Metrica de velocidad (Radeon AI PRO R9700, 215 W) | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificación, un flujo (tokens/s) | 142,5 | 237,9 |
| Prefill a 24k tokens (tokens/s) | 8.106 | 12.491 |
| 4 flujos, total (tokens/s) | 397 | 657 |

| Entrada visual | Casos | Respuesta idéntica | KL medio | Token top idéntico |
|---|---|---|---|---|
| Imágenes | 20 | 10/20 | 0,102 | 244/264 |

## Requisitos de hardware

- VRAM: 32 GB en una tarjeta para el fichero de 10,67 GiB con contexto completo de 262.144 tokens y caché KV en FP8; probado en Radeon AI PRO R9700.
- Configuración multi-tarjeta: 2 tarjetas con `--tp 2 --p2p on`; el rendimiento en 4 tarjetas no se ha medido.
- GPU compatibles: exclusivamente AMD RDNA4 según la model card (radiance no soporta otras arquitecturas).
- GPU de consumo: no disponible; la model card solo referencia la Radeon AI PRO R9700 de 32 GB y no confirma funcionamiento en tarjetas de consumo.
- Despliegue: motor radiance 1.15.1 o superior, mediante imagen Docker `stilldeadcode/radiance:1.15.1`; no compatible con vLLM, llama.cpp, Ollama ni TGI por el formato `.rad`.
- Memoria de contexto: pool KV de 524.304 tokens con 2 secuencias y 1.048.624 con 4 secuencias en una tarjeta; hasta 2.097.264 tokens con 8 secuencias en dos tarjetas.
- Latencia y throughput: 142,5 tokens/s en decodificación de un flujo y 8.106 tokens/s de prefill a 24k en una tarjeta; 237,9 y 12.491 respectivamente en dos tarjetas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| keptn/ornith-1.5-9b-fp8 | 9B denso | 262.144 | `.rad` / radiance (AMD RDNA4) | MIT | Cuantización FP8 con MTP especulativo; KL medio 0,00498 frente a bf16 |
| keptn/ornith-1.5-9b-bf16 | 9B denso | 262.144 | safetensors / HF transformers | MIT | Referencia bf16 del mismo autor; mayor fidelidad (KL 0,00086) pero mayor huella de memoria |
| ornith-ai/Ornith-1.5-9B | 9B denso | 262.144 | safetensors / ecosistema HF | MIT | Modelo base original; sin cuantizar y sin optimización para radiance |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas estándar con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Dependencia de hardware: radiance solo funciona en tarjetas AMD RDNA4; el modelo no es desplegable en NVIDIA ni en GPUs AMD de generaciones anteriores.
- Formato propietario: los pesos `.rad` no son compatibles con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y las herramientas de evaluación estándar.
- Mayor degradación en visión: el KL medio para imágenes (0,102) es veinte veces superior al de texto (0,005), y solo la mitad de las respuestas visuales coinciden exactamente con el modelo bf16.
- Longitud de salida: con el modo de pensamiento activado, las tareas difíciles pueden requerir más de 32.000 tokens de salida, lo que consume contexto y aumenta la latencia.
- Idiomas: no se especifican los idiomas soportados; no hay garantías documentadas de calidad multilingüe.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo afinado para razonamiento con modo de pensamiento, es esperable un riesgo de razonamiento plausible pero incorrecto en tareas abiertas.
- Licencia: MIT permite uso comercial, pero el modelo base se construye sobre Qwen3.5 (Apache 2.0); conviene conservar los avisos de atribución correspondientes.
- Sin datos de calibración en la cuantización: la fidelidad depende de la distribución de activaciones en producción; las métricas publicadas se limitan a MT-Bench y a un conjunto reducido de 20 imágenes.
- Rendimiento no medido en configuraciones de 4 tarjetas ni en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-9b-fp8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión bf16 del mismo autor: https://huggingface.co/keptn/ornith-1.5-9b-bf16
- Repositorio del equipo Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
