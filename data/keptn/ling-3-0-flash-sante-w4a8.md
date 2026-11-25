# keptn/ling-3.0-flash-sante-w4a8

## Resumen

Ling-3.0-flash-Sante w4a8 es una cuantización de 4 bits del fine-tune médico Ling-3.0-flash-Sante, desarrollado originalmente por inclusionAI. El modelo base es un transformer de tipo Mixture of Experts con 124.000 millones de parámetros totales y 5.100 millones activos por token, especializado en dominio médico mediante fine-tuning sobre el modelo generalista Ling-3.0-flash. Esta versión concreta la publica el usuario keptn y está empaquetada en un único fichero de 64,10 GiB en formato propietario `.rad`, diseñado exclusivamente para el motor de inferencia radiance sobre GPUs AMD RDNA4.

La relevancia de esta ficha radica en que es una de las pocas distribuciones cuantizadas de un MoE médico de gran tamaño optimizada para hardware AMD consumer y profesional (RDNA4), un ecosistema tradicionalmente desatendido frente a CUDA. El modelo mantiene la ventana de contexto original de 262.144 tokens y utiliza decodificación especulativa con la propia cabeza MTP del modelo (3 tokens de borrador), lo que permite alcanzar velocidades de decodificación de 183,9 tokens por segundo en dos tarjetas Radeon AI PRO R9700 y 268,4 en cuatro.

La cuantización combina expertos enrutados a 4 bits con codebook y escala FP8 cada 64 pesos, junto con proyecciones lineales en IQ8R (int8 con rotación de Hadamard) y activaciones int8, mientras que embeddings, lm_head y algunas proyecciones pequeñas permanecen en bf16. La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con cabeza MTP para decodificación especulativa |
| Parámetros totales | 124.000 millones |
| Parámetros activos | 5.100 millones |
| Longitud de contexto | 262.144 tokens (probado en calidad y velocidad con 65.536) |
| Tipos de cuantización | W4A8: expertos enrutados 4-bit (codebook, escala FP8 cada 64 pesos, rotación Hadamard sobre 128); lineales IQ8R (int8, rotación Hadamard sobre 128, escala u8 cada 256 pesos bajo escala bf16 por fila); activaciones int8; embeddings, lm_head y proyecciones pequeñas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 64,10 GiB |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash-Sante es un transformer de tipo Mixture of Experts con 124.000 millones de parámetros totales y 5.100 millones activos, según los datos del autor de la cuantización. Incorpora una cabeza MTP (multi-token prediction) que se reutiliza en esta distribución como mecanismo de decodificación especulativa con 3 tokens de borrador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card de esta cuantización remite a la del modelo base sin detallarlas.

La innovación técnica principal de esta distribución es el esquema de cuantización W4A8 combinado con decodificación especulativa integrada. Los expertos enrutados se comprimen a 4 bits mediante un codebook con una escala FP8 cada 64 pesos y una rotación de Hadamard sobre bloques de 128, mientras que el resto de lineales usan IQ8R (int8 con rotación de Hadamard y escalas jerárquicas u8/bf16). Las activaciones se cuantizan a int8. La versión 2.0 del fichero (2026-11-17) sustituye el esquema GPTQ con activaciones FP8 de la versión 1.0 por este enfoque, mejorando la fidelidad respecto al original bf16: la KL media frente al modelo de referencia baja de 0,00652 a 0,00461 sobre las 80 preguntas de MT-Bench.

## Capacidades

- Generación de texto en dominio médico y general, con la plantilla de chat del modelo original.
- Razonamiento multi-turno y conversacional con contexto largo (hasta 262.144 tokens).
- Modo de pensamiento (thinking) activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`; desactivado por defecto en la configuración recomendada.
- Tool calling / function calling: el autor verifica que una llamada a herramienta funciona correctamente en radiance 2.2.0.
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo (3 tokens de borrador).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; las entradas son únicamente texto.

## Casos de uso

- Asistencia clínica documental: el modelo puede resumir historiales, informes y notas clínicas extensas aprovechando su ventana de 262.144 tokens, lo que permite procesar múltiples documentos de un mismo paciente en una sola sesión sin truncar.
- Triaje conversacional y orientación sanitaria: adecuado para sistemas de primera línea que requieren conversaciones multi-turno con matices médicos, gracias al fine-tuning específico de dominio sobre Ling-3.0-flash-Sante.
- Extracción estructurada de información médica: con tool calling verificado, puede integrarse en pipelines que consulten bases de datos de códigos CIE, interacciones farmacológicas o guías clínicas y devuelvan JSON estructurado.
- Despliegue en infraestructura AMD on-premise: pensado para organizaciones con GPUs RDNA4 (por ejemplo, Radeon AI PRO R9700) que necesitan servir un modelo médico grande sin depender de CUDA; dos tarjetas de 32 GB bastan para inferencia con `expert_tiered`.
- Generación aumentada por recuperación (RAG) sobre corpus médicos: la ventana larga permite inyectar decenas de fragmentos de guías y artículos en el contexto junto con la pregunta del usuario.
- Investigación y evaluación de cuantizaciones: sirve como referencia práctica para estudiar el impacto de W4A8 con rotación de Hadamard en un MoE de 124B, con métricas KL publicadas frente al bf16 original.
- Servicio de alto rendimiento con múltiples sesiones: la configuración de 8 secuencias en 4 tarjetas ofrece hasta 1.680.848 tokens de pool KV compartido (6,4 sesiones completas de 262.144 tokens), útil para atender varios usuarios concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad frente al modelo bf16 original y de velocidad:

| Métrica | Este fichero (v2.0) | Versión 1.0 |
|---|---|---|
| KL media (MT-Bench, 80 preguntas, 42.767 tokens) | 0,00461 | 0,00652 |
| KL percentil 99 | 0,0494 | 0,0725 |
| Token top idéntico | 98,0 % | 97,6 % |
| Ratio de perplejidad | ×1,001 | ×1,003 |

Velocidad en Radeon AI PRO R9700 a 300 W, radiance 2.1.0 con PR #474, KV bf16, 3 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7 (mediana de tokens por segundo):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | 183,9 | 268,4 |
| Prefill a 24k tokens | no cabe | 1.423 | 2.556 |
| 4 streams, total | no cabe | 323 | 535 |

## Requisitos de hardware

- VRAM: el fichero ocupa 64,10 GiB y no cabe en una sola tarjeta de 32 GB. Con 2 tarjetas de 32 GB parte de los expertos se aloja en memoria de host (`placement: expert_tiered`, `host-pool-mib: 32768`, es decir, 32 GiB de RAM libre adicional). Con 4 tarjetas de 32 GB todo reside en VRAM.
- GPUs recomendadas: Radeon AI PRO R9700 (probada por el autor), cualquier GPU AMD RDNA4 con 32 GB. No es compatible con CUDA ni con GPUs NVIDIA según la información disponible.
- Consumer GPU: no cabe en ninguna GPU consumer de menos de 32 GB; se requieren al menos dos tarjetas de 32 GB.
- Pool KV: con `max-model-len: 262144` y KV bf16, 8 secuencias consumen 14,7 GiB por tarjeta en 4 tarjetas y 14,2 GiB por tarjeta en 2 tarjetas. El pool total alcanza 1.680.848 tokens en 4 tarjetas y 1.591.440 en 2 tarjetas con 8 secuencias.
- Despliegue: exclusivamente mediante el motor radiance (versión 2.2.0 o superior, imagen Docker `stilldeadcode/radiance:2.2.0`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI en el formato `.rad`.
- Latencia y throughput: ver tabla de benchmarks; 183,9 tok/s de decode en 2 tarjetas y 268,4 tok/s en 4 tarjetas con un solo stream.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna, la única alternativa documentada es la versión 1.0 de esta misma cuantización, que requiere radiance 1.17.0, usa tronco bf16 con expertos int4 GPTQ y activaciones FP8, y presenta peor fidelidad (KL media 0,00652 frente a 0,00461). El modelo base sin cuantizar (inclusionAI/Ling-3.0-flash-Sante) serviría como referencia de calidad pero no es desplegable en el mismo hardware sin cuantización.

| Modelo | Parámetros | Contexto | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| Este fichero (v2.0) | 124B totales / 5,1B activos | 262.144 | MIT | `.rad` | 2-4× AMD RDNA4 32 GB |
| Versión 1.0 | 124B totales / 5,1B activos | 262.144 | MIT | `.rad` | radiance 1.17.0 |
| Ling-3.0-flash-Sante (bf16) | 124B totales / 5,1B activos | 262.144 | MIT | safetensors (presumible) | no disponible |

## Limitaciones y advertencias

- El fichero no cabe en una sola tarjeta; el despliegue mínimo realista son dos GPUs de 32 GB más 32 GiB de RAM de host libre.
- Dependencia total del motor radiance: el formato `.rad` no es portable a otros runtimes, lo que limita la portabilidad y crea riesgo de dependencia de un proyecto pequeño.
- Las métricas de velocidad, calidad y memoria se midieron en radiance 2.1.0 con un PR concreto; radiance 2.2.0 incorpora ese código, pero no se han publicado mediciones independientes en otras versiones.
- El fine-tune es de dominio médico: no se han publicado evaluaciones de sesgos, alucinación clínica ni seguridad en aplicaciones sanitarias. Cualquier uso en contexto médico real requiere supervisión humana y validación regulatoria.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Solo se ha probado una llamada a herramienta (tool call) en radiance 2.2.0; no hay evidencia de robustez en cadenas de agentes complejas.
- El autor remite a la model card del modelo original para limitaciones adicionales; conviene consultarla antes de usar el modelo en producción.
- La licencia MIT permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha; verificar el LICENSE del repositorio original.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/keptn/ling-3.0-flash-sante-w4a8
- Versión 1.0 del fichero: https://huggingface.co/keptn/ling-3.0-flash-sante-w4a8/tree/v1.0
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Motor radiance (código): https://codeberg.org/StillDeadcode/radiance
- Guía Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- Dataset MT-Bench usado para evaluación: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
