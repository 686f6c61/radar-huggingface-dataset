# Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120

## Resumen

Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario Grawnch. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de pesos en formato nativo para GPUs Blackwell (sm_120) mediante la técnica propietaria Wave-Quant v6.3, que combina la transformada FWHT-128 con una Wave-LUT no lineal y un sidecar de decodificación especulativa MTP calibrado en la capa 64. El resultado es un modelo de 27 000 millones de parámetros comprimido a 2,6789 bits por peso (bpw), con un tamaño total en disco de 8,63 GiB.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que alterna Gated DeltaNet y atención completa, con un vocabulario de 248 320 tokens. El checkpoint incluye además un cabezal de predicción multi-token (MTP) de 146,93 MB que actúa como drafter para decodificación especulativa, lo que permite acelerar la generación sin cambiar el modelo objetivo.

La relevancia de esta publicación radica en que demuestra que un modelo de 27B puede caber y ejecutarse en una GPU de consumo de 12 GiB con una ventana de contexto de 8K, manteniendo una paridad de perplejidad razonable frente a BF16 (ΔPPL de +0,103 en la ventana completa de 8192 tokens) y una tasa de aceptación especulativa en torno al 86-91 % según el conjunto de validación. Es, por tanto, un artefacto orientado a despliegue en hardware Blackwell de gama consumer, no un modelo nuevo con capacidades adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con Gated DeltaNet + atención completa |
| Parámetros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8192 tokens verificados en benchmarks; 128K reportados en la prueba AIME 2025 |
| Tipos de cuantización | Wave-Quant v6.3 (FWHT-128 + Wave-LUT no lineal), 2,6789 bpw; sidecar MTP a 2,765 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards de capas + globals + mtp) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3.8-27B: 64 capas híbridas que combinan Gated DeltaNet (un mecanismo de atención lineal recurrente) con capas de atención completa, lo que reduce el coste computacional del contexto largo manteniendo capacidad expresiva. El vocabulario es de 248 320 tokens y el modelo incluye una plantilla de chat Jinja con modo de razonamiento `xhigh`.

La innovación de este artefacto no está en el entrenamiento sino en la compresión: Wave-Quant v6.3 aplica una transformada rápida de Walsh-Hadamard de 128 puntos (FWHT-128) seguida de una tabla de búsqueda no lineal (Wave-LUT) para cuantizar los pesos a 2,6789 bpw. Los pesos se distribuyen en 16 shards de 4 capas cada uno (~0,45 GiB por shard), más un fichero `globals.safetensors` de 1,30 GiB con embeddings, norma final y cabeza LM no atada. Adicionalmente se incluye un sidecar MTP de la capa 64 calibrado, con fusión `fc` a 3,375 bpw y similitud coseno de 0,9850, que actúa como drafter especulativo. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo de pensamiento `xhigh` en la plantilla de chat.
- Razonamiento matemático avanzado: la prueba AIME 2025 con contexto de 128K y modo `xhigh` obtiene 10/10 en pass@1 sobre los problemas 01-10.
- Generación de código: el conjunto de validación `HeldOut_Code` (4094 tokens) muestra una aceptación especulativa del 90,99 % a T=1, lo que indica coherencia en la distribución de código.
- Decodificación especulativa integrada mediante el sidecar MTP de la capa 64, con `mean_tau = 2,877` en trazas de razonamiento profundo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible explícitamente, aunque el modo `xhigh` y las trazas de razonamiento de hasta 44K tokens sugieren soporte para cadenas de pensamiento largas.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue de razonamiento matemático en GPU de consumo: con 10,22 GiB de huella residente (modelo + caché KV de 8K), el modelo cabe en una GPU de 12 GiB y puede resolver problemas tipo AIME con modo `xhigh`, lo que lo hace adecuado para asistentes de matemáticas en estaciones de trabajo locales.
- Generación de código asistida en local: la ventana de 8K y la aceptación especulativa del 90,99 % en código permiten integrarlo en editores o pipelines de CI/CD que requieran inferencia sin conexión y sin coste por token.
- Chat conversacional multi-turno: la ventana de 8K tokens verificada permite mantener conversaciones con historial extenso, y el modo `xhigh` habilita respuestas razonadas cuando se necesita.
- Investigación sobre cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de 2,68 bpw en perplejidad y KLD frente a BF16, con métricas publicadas por ventana (early, late, all).
- Aceleración de inferencia con decodificación especulativa: el sidecar MTP permite alcanzar 145,95 tok/s agregados en trazas de razonamiento profundo, útil en entornos de batch o servidores con múltiples slots.
- Evaluación de hardware Blackwell: al estar empaquetado para sm_120, es un banco de pruebas para medir throughput en GPUs de nueva generación (51,97 tok/s a B=1, 221,02 tok/s a B=8).
- Prototipado de agentes con contexto largo: la ventana de 128K reportada en la prueba AIME permite experimentar con cadenas de razonamiento de decenas de miles de tokens, aunque la verificación formal de contexto se limita a 8K.

## Benchmarks y rendimiento

### Gate 1: paridad de perplejidad y KLD a 8K frente a BF16

| Ventana | PPL BF16 | PPL WV-v6.3 (2,68 bpw) | ΔPPL | KLD medio | Acuerdo Top-1 |
|---|---|---|---|---|---|
| All_8192 (0-8192) | 1,98016 | 2,08364 | +0,10348 | 0,160315 | 91,674 % |
| Early_0_2048 | 2,81770 | 3,21119 | +0,39348 | 0,196031 | 88,086 % |
| Late_4096_8192 | 1,46009 | 1,49567 | +0,03558 | 0,077584 | 95,018 % |

### Gate 2: ajuste en GPU de 12 GiB y throughput en SM120

| Métrica | Valor |
|---|---|
| Huella residente (modelo + KV 8K) | 10,22 GiB (1,78 GiB de margen sobre 12,0 GiB) |
| Cabe en GPU de consumo de 12 GiB | true |
| Decode B=1 | 51,97 tok/s (19,24 ms/paso) |
| Decode B=4 | 80,06 tok/s (49,96 ms/paso) |
| Decode B=8 | 221,02 tok/s (36,20 ms/paso) |
| Prefill 1024 tokens | 680,49 tok/s |

### Validación ciega del sidecar MTP

| Conjunto | Tokens | KLD vs WV-v6.3 | Top-1 | Top-5 | Aceptación estocástica T=1 |
|---|---|---|---|---|---|
| HeldOut_Code | 4094 | 0,1803 | 91,62 % | 98,71 % | 90,99 % |
| SelfGen_MathCode | 8188 | 0,2599 | 89,96 % | 98,67 % | 89,88 % |
| All_Val_16376 | 16 376 | 0,3233 | 86,02 % | 97,09 % | 86,22 % |

### Gate 3: AIME 2025 (contexto 128K, modo xhigh)

| Métrica | Valor |
|---|---|
| Pass@1 (#01-#10) | 10/10 (100,0 %) |
| Truncamientos | 0 |
| Bucles de cola | 0 |
| Tokens generados | 141 373 |
| mean_tau | 2,877 |
| Throughput agregado | 145,95 tok/s |
| Throughput single-slot en trazas de 44K | hasta 45,48 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia: 10,22 GiB con caché KV de 8K tokens (modelo residente + KV).
- GPU recomendadas: cualquier GPU Blackwell con sm_120 y al menos 12 GiB de VRAM; el checkpoint está empaquetado específicamente para esa arquitectura.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GiB compatibles con sm_120 (por ejemplo, la gama RTX 50 de NVIDIA con 12 GiB o superior).
- Opciones de despliegue: el autor no especifica backend; el layout plano con `--ckpt` apuntando al directorio sugiere un runtime propio compatible con el manifiesto `sm120_manifest.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,24 ms/paso a B=1 (51,97 tok/s), 36,20 ms/paso a B=8 (221,02 tok/s), prefill de 680,49 tok/s a 1024 tokens, y 145,95 tok/s agregados con decodificación especulativa en trazas de razonamiento profundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 | 27B | 8K verificado / 128K reportado | 2,6789 bpw Wave-Quant | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de 27B cuantizadas a ~3 bpw | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El checkpoint está empaquetado exclusivamente para GPUs Blackwell sm_120; no es portable a arquitecturas anteriores (Ampere, Hopper) sin reconversión.
- La cuantización a 2,6789 bpw introduce degradación medible: ΔPPL de +0,39348 en la ventana temprana (0-2048) y KLD medio de 0,196031, con acuerdo Top-1 del 88,086 %.
- La ventana de contexto verificada es de 8192 tokens; los 128K de la prueba AIME son una prueba puntual, no una validación general de contexto largo.
- El sidecar MTP tiene una tasa de aceptación estocástica del 86,22 % en el conjunto agregado, lo que implica que la decodificación especulativa no es gratuita en calidad.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El modelo base Qwen3.8-27B no está verificable en la información proporcionada; la ficha se limita a los datos del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
