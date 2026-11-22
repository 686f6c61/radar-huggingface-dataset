# JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE-gb10

## Resumen

Inkling-2-Mini-WARMIND-FLARE-gb10 es un paquete de inferencia listo para ejecutar, publicado por JMNI-Labs, que empaqueta el modelo multimodal `jcartu/Inkling-2-Mini-WARMIND` (una abliteración del modelo `thinkingmachines/Inkling-2-Mini`) junto con el motor Flare de NVIDIA Hyperflare para servirlo en un único dispositivo DGX Spark con GPU GB10 (arquitectura SM121, 121 GiB de memoria unificada). No se trata de un modelo nuevo entrenado desde cero, sino de una distribución optimizada de pesos y artefactos de despliegue.

El modelo subyacente es un transformer con mezcla de expertos (MoE) y arquitectura "looped-transformer", con capacidades de imagen-a-texto (pipeline `image-text-to-text`), e incorpora un cabezal especulativo DSpark de 7 borradores para decodificación especulativa. La variante WARMIND aplica una abliteración selectiva que modifica únicamente 20 proyecciones `layers.{4..23}.attn.wo_ud.weight` en BF16, preservando todos los expertos, la visión y los pesos DSpark originales.

La relevancia de este paquete es práctica: demuestra que un modelo MoE multimodal con contexto declarado de hasta 1M de tokens puede servirse en hardware de escritorio de gama alta (DGX Spark) con cuantización NVFP4/MXFP8, alcanzando decenas de tokens por segundo en decodificación y manteniendo una precisión prácticamente idéntica a la del modelo base en BF16. Está pensado para desarrolladores que quieran desplegar el modelo localmente sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con "looped-transformer"; cabezal especulativo DSpark (7 borradores) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, número de expertos no especificado) |
| Longitud de contexto | hasta 1M tokens (declarado en el paquete gb10-tp1) |
| Tipos de cuantizacion | NVFP4 (Q+Gate, O y 24 capas MoE, W4A16 + `a4_prefill`); MXFP8 (LM head y cuerpo DSpark); BF16 exacto (K, V, Rel+Sink); FP8 nativo para KV del objetivo; NVFP4 en cabezales draft/Markov de DSpark |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Flare (ramas `gb10-tp1`), parches FlashInfer; pesos base en safetensors (no confirmado explícitamente) |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` es un transformer con mezcla de expertos (MoE) y una arquitectura descrita como "looped-transformer", con soporte multimodal imagen-texto. Incluye un mecanismo de decodificación especulativa denominado DSpark, con 7 borradores, que acelera la generación verificando múltiples tokens por paso. La variante WARMIND (`jcartu/Inkling-2-Mini-WARMIND`) aplica una abliteración "orth4c" que preserva la abstención: modifica solo 20 proyecciones de atención (`layers.{4..23}.attn.wo_ud.weight`) en BF16, dejando intactos los expertos, la torre de visión y los pesos DSpark.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable del paquete es la integración de cuantización mixta (NVFP4 para pesos de atención y MoE, MXFP8 para LM head y DSpark, BF16 para K/V y Rel+Sink) con un anillo de verificación rotado de 10 entradas y zero-copy, además de un parche sobre FlashInfer (`flashinfer-ai/flashinfer#9821` + `a4_prefill` de copia única) para habilitar el prefill en MXFP8.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto largo (hasta 1M tokens declarados).
- Capacidades multimodales imagen-a-texto (pipeline `image-text-to-text`), con soporte para hasta 4 imágenes simultáneas.
- Decodificación especulativa mediante DSpark con 7 borradores y verificación adaptativa (`--mtp-adaptive-verification`, alpha configurable).
- Modo "thinking" con esfuerzo de razonamiento configurable (referenciado como `default-effort` y `zero-effort` en las pruebas).
- Abliteración que reduce rechazos falsos en consultas benignas manteniendo abstención honesta en preguntas factuales sin respuesta.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo DGX Spark: el paquete está diseñado para ejecutarse en un único GB10 con 121 GiB de memoria unificada, permitiendo servir el modelo sin infraestructura de centro de datos y con un arranque de 16 segundos.
- Asistencia de código en local: con un pico de codificación medido de 74,5 tok/s (mediana) y soporte de contexto largo, es adecuado para autocompletado y generación de código en entornos de desarrollo sin conexión a la nube.
- Procesamiento de documentos extensos: el contexto declarado de 1M tokens y el rendimiento de prefill de cliente (4.062 tok/s a 8K, 3.181 tok/s a 128K) permiten analizar contratos, informes o bases de código completas en una sola pasada.
- Análisis de imágenes en lote: el soporte de 4 imágenes concurrentes y visión cross-chunk permite clasificar, describir o extraer información de imágenes en pipelines de procesamiento documental.
- Evaluación de seguridad y red-teaming: la abliteración preserva la abstención en preguntas sin respuesta pero elimina rechazos falsos en consultas de educación en seguridad, lo que la hace útil para estudiar comportamiento de modelos alineados.
- Investigación en decodificación especulativa: el paquete expone parámetros de DSpark (número de borradores, alpha de verificación adaptativa) para experimentar con técnicas de aceleración de inferencia en hardware Blackwell.
- Servicio de chat multi-usuario en local: el rendimiento agregado (hasta 368,1 tok/s a C32 con contexto de 8K) permite atender varias sesiones concurrentes en un solo dispositivo.

## Benchmarks y rendimiento

Resultados medidos en un único ASUS GX10 / DGX Spark (GB10, techo de GPU 0–2350 MHz) con la herramienta Local Inference Lab `llm-inference-bench` 0.8.0, temperatura 1, celdas de 20 s, máximo 2048 tokens de salida:

| Métrica | Resultado (gb10-tp1) |
|---|---|
| Arranque / Pesos / KV cache | 16 s / 16,2 GiB / 85,5 GiB (4.313.088 tokens KV) |
| Decodificación simple (C1 / C4 / C16) | 49,7 / 100,1 / 186,1 tok/s |
| Prefill en frío (8K / 32K) | 4.848 / 4.537 tok/s |
| Pico de codificación (cc1, 5/5 ejecuciones) | mediana 74,5; media 73,7; máx. 78,8 tok/s |
| Prefill de cliente (8K / 32K / 128K) | 4.062 / 4.258 / 3.181 tok/s |
| Adaptativo alpha=0,50 (C1 / C4 / C16) | 64,2 / 104,4 / 227,7 tok/s |
| Adaptativo alpha=0,85 (C1 / C4 / C16) | 63,1 / 104,7 / 227,2 tok/s |

Rendimiento agregado de decodificación (tok/s, alpha=0,85):

| Contexto | C1 | C2 | C4 | C8 | C16 | C32 |
|---|---:|---:|---:|---:|---:|---:|
| 8K | 52,7 | 72,0 | 113,9 | 169,2 | 258,8 | 368,1 |
| 32K | 50,2 | 68,8 | 111,2 | 159,4 | 239,1 | 357,5 |

Precisión frente a la línea base BF16 exacta del modelo stock:

| Benchmark | WARMIND FLARE | Stock BF16 |
|---|---:|---:|
| GSM8K (200 ítems, temp=0, C=16) | 97,00 % (194/200) | 96,50 % (193/200) |
| LAVD contexto largo (prompt de 48K caracteres, 10 ejecuciones) | 10/10 exacto (100 %) | no disponible |

Pruebas de servidor: `tests/server/test_inkling2.py` 13/14 superadas (el fallo se debió a un límite de 1024 tokens en una prueba de visión con esfuerzo por defecto).

## Requisitos de hardware

- VRAM/memoria: el paquete requiere un DGX Spark (NVIDIA GB10, SM121) con 121 GiB de memoria unificada. Los pesos ocupan 16,2 GiB y la caché KV hasta 85,5 GiB para 4,31M de tokens.
- GPU recomendadas: NVIDIA GB10 (DGX Spark / ASUS GX10). No se documenta compatibilidad con otras GPU en la información disponible.
- GPU de consumo: no se confirma que quepa en GPU de consumo convencionales (RTX 4090, etc.); el diseño está orientado a memoria unificada de 121 GiB.
- Despliegue: motor Flare de NVIDIA Hyperflare (`flare run`), con parche FlashInfer `b12x` (commit `1d76585b`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: arranque de 16 s; decodificación de 49,7 tok/s en C1 hasta 368,1 tok/s en C32 (contexto 8K); prefill de 4.848 tok/s a 8K en frío.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-WARMIND-FLARE-gb10 | no disponible (MoE) | 1M (declarado) | Apache-2.0 | Paquete Flare en HF |
| Inkling-2-Mini (stock) | no disponible (MoE) | no disponible | Apache-2.0 | HF (`thinkingmachines/Inkling-2-Mini`) |
| Inkling-2-Mini-WARMIND (abliterado) | no disponible (MoE) | no disponible | Apache-2.0 | HF (`jcartu/Inkling-2-Mini-WARMIND`) |
| Inkling-2-Mini-FLARE (stock empaquetado) | no disponible (MoE) | no disponible | Apache-2.0 | HF (`JMNI-Labs/Inkling-2-Mini-FLARE`) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- La abliteración modifica el comportamiento de rechazo del modelo; aunque el autor afirma preservar la abstención en preguntas sin respuesta, puede aumentar la probabilidad de respuestas a consultas que el modelo original rechazaría. Requiere evaluación propia antes de uso en producción.
- El paquete está firmado con una clave de desarrollo local (`--dangerously-*`); confiar en esa clave en producción conlleva riesgos de seguridad y debe revisarse.
- El modelo está optimizado y validado exclusivamente para GB10/DGX Spark; el rendimiento y la compatibilidad en otro hardware no están documentados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad más allá de GSM8K y LAVD.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- El número de parámetros totales y activos no se especifica, lo que dificulta estimar requisitos fuera del hardware validado.
- Una de las 14 pruebas de servidor falló por truncamiento en un escenario de visión con esfuerzo por defecto, lo que sugiere posibles límites en configuraciones de razonamiento largo.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso `NOTICE` y verificarse las licencias de los modelos base encadenados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE-gb10
- Rama de ejecución: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE-gb10/tree/gb10-tp1
- Modelo base abliterado: https://huggingface.co/jcartu/Inkling-2-Mini-WARMIND
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paquete FLARE stock: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-FLARE
- Paquete de referencia GB202: https://huggingface.co/jcartu/Inkling-2-Mini-WARMIND-FLARE-gb202
- Motor Flare (NVIDIA Hyperflare): https://github.com/NVIDIA/hyperflare-inference
- Parche FlashInfer: https://github.com/flashinfer-ai/flashinfer/pull/9821
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
