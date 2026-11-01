# keptn/ling-3.0-flash-sante-w4a8

## Resumen

Ling-3.0-flash-Sante w4a8 es una cuantización de 4 bits del fine-tune médico Ling-3.0-flash-Sante, desarrollado por inclusionAI sobre su modelo base Ling-3.0-flash. Este artefacto lo publica el usuario keptn y no es un modelo nuevo: es un empaquetado específico para el motor de inferencia radiance sobre GPUs AMD RDNA4, con los pesos de los expertos enrutados en int4 (GPTQ) y el resto de pesos en bf16. El modelo base es un MoE de 124 000 millones de parámetros totales con 5100 millones activos.

El problema que resuelve este artefacto es práctico: permite ejecutar un MoE de 124B en cuatro tarjetas de 32 GB (o dos, con expertos en memoria de host) dentro del ecosistema AMD ROCm, algo que el checkpoint bf16 original no permite. El fichero único `ling-3.0-flash-sante-w4a8.rad` ocupa 66,35 GiB y requiere una compilación de radiance con el PR #337, que aún no está en ninguna release.

Es relevante ahora por dos motivos: la escasez de tooling de cuantización maduro para RDNA4 y el interés creciente en fine-tunes verticales de dominio médico. La calidad declarada frente al original bf16 es alta: KL medio de 0,00652 sobre 42 767 tokens de respuesta en MT-Bench, con un 97,6 % de coincidencia en el token top-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP (multi-token prediction) para decodificación especulativa |
| Parametros totales | 124 000 millones (según model card del artefacto) |
| Parametros activos | 5100 millones |
| Longitud de contexto | 262 144 tokens (probado con 65 536) |
| Tipos de cuantizacion | Expertos enrutados: int4 con escala bf16 cada 128 pesos, GPTQ; resto de pesos: bf16; activaciones de expertos: FP8 (E4M3); otras lineales y lm_head: bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero único de 66,35 GiB |
| Motor de inferencia | radiance (ROCm, AMD RDNA4), requiere PR #337 |
| KV cache | bf16 |
| Version | 1.0 (2026-10-31) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 124B parámetros totales y 5,1B activos por token, lo que sitúa el coste de cómputo por token en el rango de un modelo denso de ~5B. Incorpora una cabeza MTP propia que se usa como draft model para decodificación especulativa con 3 tokens de borrador, sin necesidad de un modelo auxiliar separado.

El proceso de cuantización de este artefacto tiene tres pasos documentados: conversión del checkpoint bf16 (revisión `f74bd27b`) redondeando los expertos a nearest a 4 bits; recogida de estadísticas de entrada (hessianos) de cada capa de expertos con el corpus de calibración; y cuantización GPTQ de los expertos contra esas estadísticas, dejando el resto de pesos en bf16. El corpus de calibración tiene 1 260 419 tokens de texto médico, documentos, código, tool calls y chat en la plantilla de chat de Ling, con un 60 % de muestras que incluyen bloque de razonamiento. Las fuentes médicas son los splits de entrenamiento de PubMedQA y MedMCQA y artículos de Wikipedia; no se usaron splits de evaluación. Los expertos de la capa MTP no tienen estadísticas registradas y se redondearon a nearest.

El fine-tune Sante del modelo base es de dominio médico; la model card del artefacto no detalla el dataset ni el método de ajuste (SFT, RLHF o DPO) del modelo original, por lo que esos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking opcional, activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Conocimiento y ajuste específico de dominio médico, derivado del fine-tune Sante.
- Tool calling y function calling, presentes en el corpus de calibración del cuantizador y en el modelo base.
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo, con 3 tokens de borrador.
- Contexto largo de hasta 262 144 tokens, con 65 536 probados en el artefacto.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponibles; las entradas del modelo son solo texto.

## Casos de uso

- Asistente clínico de segunda opinión sobre documentación médica: el ajuste Sante y el contexto de 262k permiten cargar historiales completos, informes y guías clínicas en una sola ventana y hacer preguntas sobre ellos, con el modo thinking activado para razonamiento explícito.
- Triage de consultas médicas en atención al cliente sanitaria: conversaciones multi-turno con contexto largo y tool calling para consultar bases de datos de síntomas o agendas, desplegado en infraestructura AMD existente.
- Extracción estructurada de información de informes clínicos: uso de function calling para devolver JSON con diagnósticos, códigos CIE y medicaciones a partir de texto libre, integrable en pipelines de procesamiento documental.
- Resumen de literatura biomédica: ingestión de artículos de PubMed (usados en la calibración) y generación de resúmenes con citas, aprovechando la ventana de 262k para varios artículos por petición.
- Soporte a codificación clínica y facturación: el modelo maneja código y tool calls, por lo que puede mapear descripciones libres a códigos y validar contra un catálogo mediante llamadas a herramientas.
- Despliegue on-premise en hospitales con hardware AMD: al correr en cuatro Radeon AI PRO R9700 (32 GB) con ROCm, encaja en entornos donde no se quiere depender de CUDA ni enviar datos de pacientes a la nube.
- Generación aumentada por recuperación sobre corpus médicos internos: la ventana larga y el throughput de prefill (2201 tok/s a 24k tokens con 4 tarjetas) permiten inyectar muchos fragmentos recuperados por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son métricas de fidelidad de la cuantización y de velocidad.

Fidelidad frente al bf16 original (MT-Bench, 80 preguntas, ambos turnos, 42 767 tokens de respuesta):

| Metrica | Valor |
|---|---|
| KL medio | 0,00652 |
| KL percentil 99 | 0,0725 |
| Coincidencia en token top-1 | 97,6 % |
| Ratio de perplejidad | ×1,003 |

Velocidad en Radeon AI PRO R9700 a 215 W, KV bf16, 3 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7 (mediana):

| Metrica | 2 tarjetas | 4 tarjetas |
|---|---|---|
| Decode, un stream (tok/s) | 157,1 | 236,3 |
| Prefill a 24k tokens (tok/s) | 1226 | 2201 |
| 4 streams, total (tok/s) | 249 | 460 |

## Requisitos de hardware

- VRAM: el fichero pesa 66,35 GiB; no cabe en una sola tarjeta de 32 GB. Con dos tarjetas de 32 GB parte de los expertos reside en memoria de host (16 GiB por tarjeta), lo que degrada el prefill en contexto largo.
- GPU recomendadas: Radeon AI PRO R9700 (32 GB, RDNA4) es la probada; se necesitan dos o cuatro. Solo GPUs AMD RDNA4 con ROCm.
- GPU de consumo: no disponible; la model card no menciona pruebas en GPUs de consumo, y el tamaño del fichero descarta configuraciones de una sola tarjeta de 24 GB o menos.
- Despliegue: exclusivamente mediante el motor radiance, compilado desde el PR #337 (`git fetch origin pull/337/head:pr-337`). No hay soporte en vLLM, llama.cpp, Ollama ni TGI para este formato `.rad`.
- Memoria de contexto (KV pool bf16, tokens totales compartidos entre secuencias): con 2 tarjetas, 524 288 tokens para 2 secuencias, 1 048 592 para 4 y 1 454 448 para 8; con 4 tarjetas, 524 336, 1 048 576 y 1 608 032 respectivamente.
- Latencia: en dos tarjetas, el prefill cae a 650 tok/s a 64k de contexto y un prompt de 200k tarda unos 20 minutos.

## Comparativa con modelos similares

No hay datos de benchmarks de tareas que permitan una comparación de rendimiento con alternativas. La comparación disponible es de formato y despliegue:

| Modelo | Parametros | Contexto | Cuantizacion | Hardware | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash-Sante w4a8 (este) | 124B totales, 5,1B activos | 262 144 | int4 GPTQ en expertos + bf16 | 2-4 AMD RDNA4 (radiance) | MIT |
| inclusionAI/Ling-3.0-flash-Sante (bf16) | 124B totales, 5,1B activos | no disponible | bf16 | no disponible (no cabe en 4×32 GB según este artefacto) | MIT |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo funciona en GPUs AMD RDNA4 con el motor radiance; no hay ruta de despliegue en CUDA ni en motores estándar.
- Requiere compilar radiance desde el PR #337, no incluido en ninguna release; el flujo de instalación es frágil para producción.
- Los expertos de la capa MTP no tienen estadísticas de calibración y se redondearon a nearest, lo que puede afectar ligeramente a la calidad de la decodificación especulativa.
- Con dos tarjetas, parte de los expertos vive en memoria de host: el prefill en contexto largo es muy lento (650 tok/s a 64k; ~20 minutos para 200k tokens).
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en dominio médico; no debe usarse como sustituto de juicio clínico.
- Sesgos conocidos: no disponibles en la información proporcionada; la model card remite a la del modelo original para más limitaciones.
- Idiomas soportados no documentados; no se garantiza calidad fuera de los idiomas del corpus de calibración.
- Licencia MIT, que permite uso comercial, pero las limitaciones del modelo base (recogidas en su model card) siguen aplicando.
- El corpus de calibración excluyó splits de evaluación de PubMedQA y MedMCQA, pero no hay benchmarks de dominio publicados para verificar el rendimiento médico real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keptn/ling-3.0-flash-sante-w4a8
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #337 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/337
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
