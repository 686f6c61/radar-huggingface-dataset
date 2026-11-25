# hongyue0721/banju-pal

## Resumen

Banju-Pal es un modelo de lenguaje especializado en domótica para personas mayores y asistencia en el hogar, desarrollado por el usuario hongyue0721 a partir de Qwen/Qwen3.5-9B mediante un proceso de ajuste fino con LoRA y alineamiento DPO. El modelo está diseñado para actuar como agente de borde (edge agent) en entornos domésticos, gestionando conversaciones de acompañamiento, decisiones de enrutamiento de escucha pasiva y llamadas a herramientas con contratos JSON estrictos sobre un conjunto de 30 herramientas de domótica.

La propuesta técnica se apoya en una receta de doble vía desacoplada: una vía de empatía (EQ SFT más EQ DPO) orientada a la conversación con personas mayores, y una vía de herramientas (Tool SFT de contexto largo) orientada a la toma de decisiones estructurada y a la autocorrección en dos rondas. Ambas vías se fusionan linealmente en el espacio de parámetros con pesos `tool_weight=1.0` y `eq_weight=0.85`. El modelo se distribuye con cuantizaciones GGUF calibradas con imatrix de dominio, pensadas para ejecutarse en una única GPU Tesla T4 de 16 GB con latencia de primer token por debajo del segundo.

El modelo tiene 8.953.803.264 parámetros, soporta chino e inglés, se publica bajo licencia Apache 2.0 y se acompaña de un dataset de trayectorias de 17.000 muestras SFT más 1.000 pares DPO. Su relevancia actual radica en demostrar que un modelo de menos de 10.000 millones de parámetros, cuantizado a 4 bits y ejecutado en hardware de borde, puede superar a modelos de su misma clase en tareas de agencia doméstica con contratos estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 50.000 tokens (entrenado con trayectorias de hasta 9.687 tokens sin truncar) |
| Tipos de cuantizacion | BF16, GGUF Q8_0, GGUF Q4_K_M con imatrix, GGUF Q4_K_M sin imatrix, GGUF BF16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF (varias cuantizaciones en `gguf/`), adaptadores LoRA en `adapters/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros, y se ajusta mediante una receta de doble vía. La vía EQ combina 1.800 muestras de conversación empática y de límites rojos (SFT con LoRA de alto rango en BF16, `eval_loss=1.3777`) con 1.000 pares de preferencia DPO (`rewards/accuracies=0.95`, `margin=4.214`), orientados a evitar diagnósticos médicos, prevenir fraudes y moderar el tono. La vía Tool emplea 2.200 muestras de sandbox de estado doméstico en contexto largo, con `max_len=9.687` sin truncamiento y `eval_loss=0.1994`, usando entropía cruzada enmascarada sobre posiciones activas (`logits_to_keep`) y agrupación dinámica en múltiplos de 256, lo que redujo el uso de memoria de más de 40 GiB (OOM) a 24,51 GiB en secuencias de 10.500 tokens.

La fusión de ambas vías se realiza linealmente en el espacio de parámetros. El pipeline de datos aplica cuatro filtros deterministas antes del entrenamiento: validación de contrato `_preflight`, validación de estado final en `InMemoryKernelSandbox`, validación de límites rojos (`redlines.py`) y una defensa anti-fuga de 3-gramas con `held_out_leakage = 0`. La cuantización GGUF Q4_K_M se calibra con una matriz imatrix calculada sobre 315 segmentos de contrato de herramientas y contexto coloquial del dominio. El autor documenta además una corrección relevante: el modelo base, con `thinking` activado, entraba en un bucle de razonamiento que producía un 0,0 % de respuestas válidas en la evaluación de empatía (16 de 16 vacías); el ajuste EQ corrige ese comportamiento.

## Capacidades

- Generación de texto conversacional en chino e inglés, con estilo de frase corta adaptado a personas mayores.
- Llamada a herramientas (tool calling) con contrato JSON estricto sobre un conjunto de 30 herramientas de domótica.
- Enrutamiento de escucha pasiva (`banju_router`): decide si intervenir o permanecer en silencio, con una tasa de interrupción indebida del 0,0 % en la evaluación del autor.
- Autocorrección en dos rondas: el primer intento de llamada defectuoso se enmascara en el entrenamiento y el modelo aprende a reintentar.
- Razonamiento multi-paso sobre estado del hogar en un sandbox de hasta 50.000 tokens de contexto.
- Moderación de límites rojos: rechazo de diagnósticos médicos y de conversaciones de fraude.
- Modo `thinking` opcional, con una degradación documentada de la precisión en empatía cuando se activa (98,4 % de respuestas válidas, pero con más falsos negativos en el enrutador).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistencia conversacional para personas mayores: el modelo mantiene diálogos multi-turno con frases cortas y tono moderado, y usa la vía EQ para evitar diagnósticos médicos y responder con contención ante intentos de fraude.
- Enrutamiento de escucha pasiva en altavoces inteligentes: `banju_router` decide si el asistente debe intervenir o callar, con una tasa de falsos positivos del 0,0 % en la evaluación del autor, lo que evita interrupciones no deseadas.
- Control de domótica por voz: traduce una petición en lenguaje natural a una llamada JSON contra una de las 30 herramientas del contrato, con validación de esquema del 97,5-98,8 % en Q4_K_M.
- Automatización de rutinas del hogar: el sandbox de estado permite encadenar acciones multi-paso (por ejemplo, ajustar persianas, luz y climatización) manteniendo coherencia entre pasos.
- Despliegue en dispositivos de borde con 16 GB: la cuantización Q4_K_M con imatrix ocupa 5.469 MiB y alcanza 35,52 tok/s de decodificación en una Tesla T4, lo que permite inferencia local sin depender de la nube.
- Detección de fraude telefónico: la vía EQ entrena el rechazo de conversaciones de fraude y la protección de la dignidad del usuario, adecuada para integrarse en un asistente de telefonía para mayores.
- Investigación en agentes de dominio: el dataset de trayectorias y los adaptadores publicados permiten reproducir la receta de doble vía y estudiar el efecto de la fusión lineal de LoRAs.

## Benchmarks y rendimiento

Evaluación propia de 313 preguntas del dominio, con cuantización Q4_K_M e inferencia de una sola vía. Los modelos abiertos comparados son versiones oficiales de instrucción sin ajuste de dominio, medidos en Colab L4; Banju-Pal se midió en Tesla T4.

| Modelo | Router (73) | Main (80) | Contract (48) | Sandbox (48) | EQ (64) | Media de las tres pruebas prácticas |
|---|---:|---:|---:|---:|---:|---:|
| Banju-Pal Q4_K_M-imatrix (T4) | 69,9 % (FP 0,0 %) | 76,2 % | 81,2 % | 81,2 % | 100,0 % | 79,6 % |
| Qwen3.5-9B original | no disponible | no disponible | no disponible | no disponible | no disponible | 54,2 % |
| Qwen3-8B | no disponible | no disponible | no disponible | no disponible | no disponible | 40,8 % |
| Qwen2.5-7B | no disponible | no disponible | no disponible | no disponible | no disponible | 29,9 % |
| Llama-3.1-8B | no disponible | no disponible | no disponible | no disponible | no disponible | 13,5 % |
| GLM-4-9B (dos versiones) | no disponible | no disponible | no disponible | no disponible | no disponible | 0,0 % |
| Referencia en nube (deepseek-v4.1-flash) | 95,9 % | 87,5 % | 97,9 % | 83,3 % | 100,0 % | 89,6 % |

Rendimiento en Tesla T4 (16 GB, una sola petición, `-c 16384 -np 1 --thinking off`):

| Formato | VRAM | Decodificación (tok/s) | TTFT en frío → caliente | TTFS P50 del primer turno EQ |
|---|---:|---:|---:|---:|
| BF16 en GPU completa | OOM al arrancar | no disponible | no disponible | no disponible |
| BF16 auto-fit (GPU+CPU) | 13.897 MiB | 8,57 | 22.773,1 ms → 2.328,9 ms | 1.498,7 ms |
| Q8_0 | 8.651 MiB | 26,78 | 4.515,0 ms → 546,9 ms | 1.269,5 ms |
| Q4_K_M sin imatrix | 5.469 MiB | 35,02 | 4.593,0 ms → 478,0 ms | 967,7 ms |
| Q4_K_M con imatrix | 5.469 MiB | 35,52 | 4.523,3 ms → 464,0 ms | no disponible |

En A100 con 4 peticiones concurrentes, Q8_0 obtiene 72,6 % / 78,8 % / 83,3 % / 81,2 % / 98,4 % en Router/Main/Contract/Sandbox/EQ, y BF16 obtiene 69,9 % / 77,5 % / 85,4 % / 79,2 % / 100,0 %. Con `thinking` activado en A100, el enrutador sube al 86,3 % pero con un 18,2 % de falsos negativos.

## Requisitos de hardware

- VRAM estimada: 5.469 MiB para Q4_K_M con imatrix, 8.651 MiB para Q8_0, 13.897 MiB para BF16 con auto-fit y aproximadamente 17,1 GiB para GGUF BF16 completo.
- GPU recomendadas: Tesla T4 de 16 GB (objetivo declarado, con decodificación de 35,52 tok/s en Q4_K_M), A100 para BF16 y concurrencia, y GPU Blackwell G4 según los resúmenes de evaluación del autor.
- GPU de consumo: el modelo cabe en tarjetas de 8 GB con Q4_K_M (5,3 GiB de pesos) y en tarjetas de 12-16 GB con Q8_0; no se han publicado medidas en RTX 4090 ni en otras GPU de consumo.
- Opciones de despliegue: llama.cpp con GGUF e imatrix, transformers con los pesos safetensors, vLLM para los pesos BF16, y los endpoints compatibles indicados en las etiquetas del repositorio.
- Latencia: TTFT en frío de 4.523,3 ms que baja a 464,0 ms en caliente con Q4_K_M; primer turno de empatía con P50 de 967,7 ms en Q4_K_M sin imatrix.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento práctico (evaluación del autor) |
|---|---|---|---:|---|---:|
| Banju-Pal | 8,95 B | 50.000 | Apache 2.0 | Agente domótico y acompañamiento a mayores | 79,6 % |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible | Modelo generalista | 54,2 % |
| Qwen3-8B | 8 B (aprox.) | no disponible | no disponible | Modelo generalista | 40,8 % |
| Qwen2.5-7B | 7 B (aprox.) | no disponible | no disponible | Modelo generalista | 29,9 % |
| Llama-3.1-8B | 8 B (aprox.) | no disponible | no disponible | Modelo generalista | 13,5 % |
| GLM-4-9B | 9 B (aprox.) | no disponible | no disponible | Modelo generalista | 0,0 % (no emite llamadas con este protocolo) |

La comparación debe interpretarse con cautela: los modelos abiertos se evaluaron sin ajuste de dominio y con su protocolo de herramientas nativo, mientras que Banju-Pal se ajustó específicamente para el contrato de 30 herramientas. El dato más informativo es la tasa de interrupción indebida del 0,0 % frente al 100 % de Llama-3.1-8B en el enrutador de escucha pasiva.

## Limitaciones y advertencias

- El modelo solo declara soporte de chino e inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La evaluación es enteramente propia (313 preguntas del dominio) y no se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.
- El modo `thinking` degrada la precisión en empatía y en el enrutador: aunque elimina las respuestas vacías, introduce un 18,2 % de falsos negativos en el enrutador y baja la vía EQ al 98,4 %.
- El enrutador en modo sin `thinking` tiene una tasa de omisión del 39,4 % en el nivel diario y del 18,2 % en el nivel de pensamiento, lo que puede provocar que el asistente no intervenga cuando debería.
- La validación del esquema JSON baja al 97,5 % en T4 con Q4_K_M frente al 98,8 % en A100, y la autocorrección en dos rondas no está garantizada al 100 % en todas las cuantizaciones.
- El repositorio ocupa 69,9 GB e incluye pesos BF16, GGUF y adaptadores; conviene descargar solo los artefactos necesarios.
- Riesgo de alucinación en conversación abierta no cuantificado por el autor; la moderación de límites rojos se limita a los escenarios de entrenamiento (diagnóstico médico y fraude).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B tiene sus propias condiciones que deben verificarse por separado.
- El modelo está pensado para despliegue en borde con cuantización Q4_K_M; el uso en BF16 en T4 provoca OOM al arrancar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyue0721/banju-pal
- Dataset de trayectorias: https://huggingface.co/datasets/hongyue0721/banju-pal-trajectories
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
