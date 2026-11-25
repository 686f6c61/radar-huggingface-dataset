# maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N4

## Resumen

Olala v1.0 mini 7A1B Opinel N°4 es una versión cuantizada y editada del modelo Olala v1.0 mini 7A1B de OVHcloud, publicada por el colectivo maurienne-ai. Se trata de un modelo híbrido Mamba-MoE orientado a razonamiento y conversación, con aproximadamente 4.225 millones de parámetros almacenados en safetensors y una ventana de contexto que, según los datos de la model card, se ha probado con recuperación de aguja en pajar de hasta 64k tokens. La nomenclatura "7A1B" del nombre alude a la configuración del modelo base (7 mil millones de parámetros totales con 1 mil millones activos por token en su capa MoE), mientras que el recuento real de pesos del repositorio refleja el resultado de la cuantización mixta.

La relevancia de esta ficha reside en dos intervenciones sobre el modelo original: por un lado, una edición de pesos que reduce la sobrerrechazo de peticiones inocuas y elimina los bucles de repetición; por otro, una cuantización mixta GPTQ/ModelOpt que combina expertos enrutados en INT4 (W4A16 con escala y offset por grupo de 32 pesos) con el resto de capas en INT8 weight-only (W8A16), manteniendo embeddings, router y normas en su precisión original. El resultado es un artefacto de 5,0 GB que, según el autor, mantiene la calidad del bf16 dentro del ruido en GSM8K y MMLU, con una pérdida acotada de 1 a 2,4 puntos en código según el esfuerzo de razonamiento.

El modelo está pensado para despliegue en vLLM y declara soporte únicamente para inglés y francés. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base. No se han publicado resultados de benchmarks independientes más allá de los aportados por el autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE (según tags del repositorio: "mamba", "hybrid", "moe"); detalles de capas no disponibles |
| Parametros totales | 4.225.084.464 (safetensors); el nombre comercial indica 7A1B sobre el modelo base |
| Parametros activos | No disponible con precisión; el nombre "7A1B" sugiere ~1B activos por token en el modelo base |
| Longitud de contexto | Probado hasta 64k tokens (needle-in-a-haystack); límite máximo no declarado explícitamente |
| Tipos de cuantizacion | Mixta: INT4 GPTQ W4A16_AFFINE en expertos enrutados; INT8 W8A16 en el resto; embeddings, router y normas en precisión original; activaciones en bf16 |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,0 GB), con código personalizado (`custom_code`); pensado para vLLM |

## Arquitectura y entrenamiento

El modelo base Olala v1.0 mini 7A1B de OVHcloud emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con mezcla de expertos (MoE), una configuración poco habitual que busca eficiencia en inferencia y buen comportamiento en contextos largos. El nombre "7A1B" indica 7 mil millones de parámetros totales con aproximadamente 1 mil millones activos por token, lo que explica la velocidad de decodificación reportada. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

Esta versión Opinel N°4 no aplica fine-tuning ni modifica la plantilla de chat. Las intervenciones son dos. Primero, una edición de pesos: se elimina a media intensidad una "dirección de rechazo" y se escriben ranuras clave-valor con compuerta en neuronas de expertos compartidos no utilizadas, con el objetivo de reducir el sobrerrechazo de peticiones inocuas y suprimir los bucles de repetición en posiciones dentro del bucle. Segundo, una cuantización GPTQ calibrada sobre el modelo ya editado, con una mezcla de prompts estándar, prompts de política de rechazo y contextos largos de hasta 61k tokens, de modo que los pesos de 4 bits preservan ambas ediciones. El layout `MIXED_PRECISION` de ModelOpt está documentado en un fork de vLLM del autor.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia de OVH.
- Razonamiento con cuatro niveles de esfuerzo configurables: `disabled`, `low`, `medium` y `high`.
- Razonamiento matemático (evaluado en GSM8K y MGSM) y resolución de problemas tipo cadena de pensamiento.
- Generación de código (evaluado en HumanEval+ y MBPP+).
- Conocimiento general y respuesta a preguntas (evaluado en MMLU).
- Manejo de contextos largos: recuperación de información en ventanas de hasta 64k tokens (needle-in-a-haystack).
- Capacidades multilingües limitadas a inglés y francés.
- Comportamiento de rechazo calibrado: rechaza peticiones dañinas pero reduce el sobrerrechazo de peticiones seguras (ficción, historia, medicina, homónimos, trabajo en seguridad).
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistencia conversacional en inglés y francés: el modelo gestiona diálogos multi-turno con contexto de hasta 64k tokens, adecuado para atención al cliente donde la conversación acumula historial largo sin perder el hilo.
- Generación de código en pipelines de desarrollo: con resultados en HumanEval+/MBPP+ en torno al 70 % en esfuerzo medio, puede emplearse como asistente de autocompletado o revisión en entornos con GPUs de consumo gracias a su reducido tamaño (5,0 GB).
- Razonamiento matemático asistido: útil para tutores o herramientas de resolución de problemas paso a paso, activando el modo de razonamiento `high` cuando la precisión importa más que la latencia.
- Procesamiento de documentos largos en francés: resumen y extracción de información en contratos, informes o expedientes de hasta decenas de miles de tokens, aprovechando la ventana extendida y el soporte nativo del idioma.
- Despliegue en producción con vLLM: al estar empaquetado para vLLM con cuantización mixta, encaja en servicios de inferencia que necesitan alto throughput (hasta 5.942 tokens/s en 128 streams según el autor en RTX 5090) con un solo acelerador.
- Filtrado y moderación de contenido: el modelo incorpora una política de rechazo calibrada que distingue peticiones dañinas de peticiones seguras, útil como componente en cadenas de moderación o como generador con salvaguardas integradas.
- Investigación sobre edición de pesos y cuantización: el repositorio documenta técnicas de eliminación de dirección de rechazo y ranuras clave-valor con compuerta, lo que lo convierte en un caso de estudio para quienes investigan alineamiento y compresión de modelos.

## Benchmarks y rendimiento

Resultados aportados por el autor en la model card, comparando el modelo cuantizado (N°4) con el bf16 original. Las diferencias están emparejadas sobre los mismos prompts (± error estándar). Positivo = mejor que bf16.

| Benchmark | disabled | low | medium | high |
|---|---|---|---|---|
| GSM8K-300, bf16 → N°4 | 90,0 → 89,0 (−1,0 ± 1,5) | 94,3 → 94,7 (+0,3) | 93,7 → 93,0 (−0,7) | 94,3 → 95,0 (+0,7) |
| HumanEval+ / MBPP+ agrupados, 3 semillas | 52,4 → 52,2 (−0,2 ± 1,0) | 68,8 → 67,7 (−1,2 ± 0,9) | 72,8 → 70,4 (−2,4 ± 1,0) | 72,9 → 72,1 (−0,9 ± 1,1) |
| MMLU (561 preguntas) | 62,0 → 61,7 (−0,4) | 75,8 → 76,3 (+0,5) | 76,8 → 76,5 (−0,4) | 77,0 → 77,7 (+0,7) |

Divergencia KL del harness frente a bf16: 0,0187 (de la cual 0,0111 corresponde a los expertos de 4 bits, medida frente a Opinel N°8).

Rendimiento de decodificación en RTX 5090, prompts de 1k tokens, greedy:

| Configuración | bf16 | Opinel N°8 | Opinel N°4 |
|---|---|---|---|
| 1 stream | 346 tok/s | 481 tok/s | 479 tok/s |
| 1 stream + Télégraphe | 603 tok/s | 728 tok/s | 770 tok/s |
| 8 streams | 1.562 tok/s | 2.188 tok/s | 2.197 tok/s |
| 32 streams | 3.133 tok/s | 4.059 tok/s | 4.327 tok/s |
| 128 streams | 5.001 tok/s | 5.696 tok/s | 5.942 tok/s |

Tasa de rechazo (%, bf16 → N°4), según conjunto y esfuerzo:

| Conjunto | disabled | low | medium | high |
|---|---|---|---|---|
| Debería responder, EN | 45,8 → 35,1 | 35,8 → 36,8 | 27,0 → 25,3 | 25,1 → 22,0 |
| Debería responder, FR | 40,2 → 36,8 | 29,5 → 29,9 | 25,7 → 26,4 | 23,0 → 20,7 |
| XSTest (prompts seguros) | 27,6 → 18,0 | 12,8 → 13,6 | 5,6 → 4,4 | 5,2 → 4,8 |
| OR-Bench-hard | 80,4 → 64,0 | 75,1 → 78,8 | 63,5 → 60,3 | 56,6 → 50,3 |
| Debería rechazar, EN | 97,6 → 96,1 | 97,6 → 97,9 | 92,4 → 93,4 | 91,3 → 89,8 |
| Debería rechazar, FR | 96,2 → 94,1 | 95,4 → 96,7 | 87,9 → 86,2 | 83,7 → 83,7 |

Bucles (respuestas que no terminan, %): en MGSM te/bn/sw, bf16 → N°4 pasa de 67,0 → 0,0 (disabled), 22,5 → 0,0 (low), 41,2 → 0,0 (medium) y 55,6 → 0,0 (high).

Needle-in-a-haystack a 64k con razonamiento `high`: 20/30 (bf16) → 26/30 (N°4).

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 5,0 GB, por lo que la inferencia en bf16 para activaciones y overhead requiere aproximadamente 6-8 GB en GPUs de consumo; con mayor paralelismo de secuencias conviene reservar 12-16 GB.
- GPU recomendadas: RTX 5090 (datos de rendimiento del autor), A100 y H100 para despliegues de producción con muchos streams; cabe en RTX 4090 y GPUs consumer de gama alta.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 5090 y previsiblemente en tarjetas con 8-12 GB de VRAM.
- Opciones de despliegue: vLLM es la librería declarada y la única validada por el autor; el formato safetensors con cuantización mixta GPTQ/ModelOpt y código personalizado hace inviable, en principio, su uso directo en llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: en RTX 5090, 479 tok/s en un stream y hasta 5.942 tok/s en 128 streams (greedy, prompts de 1k tokens); con decodificación especulativa Télégraphe, 770 tok/s en un stream.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olala v1.0 mini 7A1B Opinel N°4 | 4,23B (pesos cuantizados) | probado a 64k | Apache 2.0 | Hugging Face, vLLM | Cuantización mixta INT4/INT8, edición de rechazo y bucles |
| Olala v1.0 mini 7A1B Opinel N°8 | 7,1 GB | probado a 64k | Apache 2.0 | Hugging Face, vLLM | Misma edición, cuantización menos agresiva; algo más de calidad en código |
| Olala v1.0 mini 7A1B (OVH, bf16) | ~7B (13,6 GB) | probado a 64k | Apache 2.0 | Hugging Face | Referencia de calidad; más lento y pesado |
| Modelos MoE pequeños de la misma franja | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés y francés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Los benchmarks disponibles son los del autor; no hay validación independiente de las cifras de calidad, rechazo ni velocidad.
- La pérdida de calidad en código es la más visible: hasta −2,4 puntos en HumanEval+/MBPP+ en esfuerzo medio, y −3,7 ± 1,3 en MBPP+ en ese mismo nivel.
- El modelo conserva una política de rechazo calibrada, pero los conjuntos "debería rechazar" muestran tasas de rechazo del 83,7-97,9 % según esfuerzo e idioma, lo que implica que algunas peticiones dañinas pueden no ser bloqueadas.
- Riesgo de alucinación inherente a modelos de este tamaño, no cuantificado en la información disponible.
- La edición de pesos introduce una divergencia KL de 0,0187 frente a bf16, lo que puede afectar a comportamientos sutiles no cubiertos por los benchmarks.
- El uso de código personalizado (`custom_code`) y la cuantización mixta ModelOpt limitan la portabilidad: requiere la versión de vLLM documentada por el autor.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de OVHcloud antes de un despliegue comercial.
- El repositorio no declara límite máximo de contexto explícito; el dato de 64k corresponde a pruebas de recuperación, no a una garantía de calidad en toda la ventana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N4
- Versión Opinel N°8: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N8
- Decodificación especulativa Télégraphe: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Telegraphe
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Documentación de la cuantización en el fork de vLLM: https://github.com/nbald/vllm/blob/opinel/docs/features/quantization/olala.md
