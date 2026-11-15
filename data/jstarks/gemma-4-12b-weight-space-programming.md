# jstarks/Gemma-4-12B-Weight-Space-Programming

## Resumen

Gemma-4-12B-Weight-Space-Programming es un artefacto de investigación publicado por el usuario jstarks sobre el modelo base google/gemma-4-12B-it. No se trata de un modelo entrenado de cero, sino de una colección de adaptadores LoRA y parches de pesos sintetizados mediante una técnica denominada Weight-Space Programming (WSP v3.0), que el autor describe como "training-free, closed-form" y que organiza las modificaciones en nueve subespacios (S1 a S9) orientados a comportamientos concretos de agente: cierre de razonamiento, contención ante herramientas, enrutado multi-herramienta, síntesis de código, JSON estructurado en segundo turno, escalado a humano, defensa frente a inyección indirecta, abstención fundamentada y autorrecuperación de errores.

El modelo base subyacente es un transformer de 48 capas con hidden_size de 3840, intermediate_size de 15360, MLP de tipo GeGLU y RMSNorm, con 11.907.350.576 parámetros totales según los safetensors del repositorio. El autor evalúa el artefacto sobre 100 tareas unificadas (30 de holdout repartidas entre S1 y S9, más 70 benchmarks públicos establecidos) y reporta que el rendimiento global no mejora respecto a la base: 50/100 frente a 50/100, un delta de +0,0 pp.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de interpretabilidad mecanicista y programación en el espacio de pesos aplicado a un modelo de 12B, con resultados medidos y comparados de forma uniforme contra otros cuatro modelos del mismo pipeline. Por otro lado, los resultados publicados muestran que la técnica no aporta ganancia neta en este caso concreto, lo que resulta igualmente informativo para quien evalúe este tipo de intervenciones sin entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con 48 capas, hidden_size 3840, intermediate_size 15360, MLP GeGLU, RMSNorm; modificaciones vía LoRA rank-16 en subespacios S1–S9 |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 tokens en la configuración de evaluación reportada (`-c 16384`) |
| Tipos de cuantización | GGUF; el estudio usa `Q4_K_M` y caché KV `q8_0` (`-ctk q8_0 -ctv q8_0`); se menciona `imatrix` |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (parches rank-16 y delta denso BF16), GGUF (adaptadores LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 48 capas con atención estándar, MLP GeGLU de intermediate_size 15360 y normalización RMSNorm. Sobre esa arquitectura, el artefacto no entrena el modelo: sintetiza parches de pesos en forma cerrada. Concretamente, el autor genera nueve subespacios LoRA de rango 16 en `f32`, exportados como adaptadores GGUF para `llama-server` (`adapters/wsp_s1_think.gguf` … `wsp_s9_error_recovery.gguf`) y como safetensors para PyTorch/Transformers (`patches/wsp_s1_think_r16.safetensors` … `wsp_s9_error_recovery_r16.safetensors`), además de un parche delta denso BF16 combinado de suma unitaria (`patches/wsp_gemma4_12b_patch.safetensors`, 1012,50 MiB).

La técnica se describe como `synthesis_mode=calibrated_proxy_weight_space`, es decir, una síntesis de pesos calibrada en un espacio proxy, sin entrenamiento por descenso de gradiente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque el procedimiento no es un entrenamiento convencional. La innovación declarada es la descomposición en subespacios funcionales independientes con control de fuga cruzada (cross leak) y fuga sintáctica (syntax leak), evaluada mediante la norma de Frobenius de cada delta (`||ΔW||_F`) por capa objetivo. La evaluación se realiza con decodificación determinista (`temperature=0.0`, `seed=42`).

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con un subespacio específico para el cierre de cadenas de pensamiento (S1_THINK).
- Tool calling y function calling, con subespacios dedicados a la contención ante herramientas y antisesgo complaciente (S2_RESTRAINT) y al enrutado entre múltiples herramientas (S3_ROUTER).
- Síntesis de código de banda media (S4_CODE), evaluada sobre HumanEval.
- Producción de JSON estructurado en el segundo turno de conversación (S5_TURN2_JSON).
- Escalado controlado a un humano u operador (S6_HANDOFF).
- Defensa frente a inyección indirecta de prompts (S7_INJ_GUARD).
- Abstención fundamentada cuando no hay base para responder (S8_GROUNDING).
- Autorrecuperación de errores dentro de un flujo de agente (S9_ERR_RECOV).
- Capacidad multimodal declarada por la pipeline `image-text-to-text` del modelo base, no evaluada en el estudio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Construcción de agentes con enrutado multi-herramienta: el subespacio S3_ROUTER está pensado para que el modelo seleccione la herramienta adecuada entre varias; en la evaluación de holdout alcanza 4/5 tareas, lo que lo hace utilizable como router en pipelines de agentes con contexto de hasta 16k tokens.
- Asistentes conversacionales con salida JSON estructurada: S5_TURN2_JSON obtiene 3/3 en holdout, por lo que el modelo puede emitir respuestas estructuradas en el segundo turno de una conversación para integración directa con APIs y backends.
- Filtrado defensivo de prompts: S7_INJ_GUARD logra 3/3 en holdout y permite usar el modelo como capa de detección de inyección indirecta antes de pasar la petición a otro modelo o servicio.
- Atención al cliente con escalado a humano: S6_HANDOFF consigue 4/4 en holdout y S8_GROUNDING 3/3, lo que habilita flujos donde el modelo decide abstenerse o transferir la conversación cuando la evidencia es insuficiente.
- Recuperación de errores en bucles de agente: S9_ERR_RECOV obtiene 3/3 en holdout con solo 22 tokens medios de finalización, lo que permite reintentos automáticos baratos dentro de un pipeline de ejecución de tareas.
- Investigación en interpretabilidad mecanicista: los parches rank-16 por subespacio y el delta denso combinado permiten aislar y medir el efecto de una intervención concreta en el espacio de pesos, con normas de Frobenius por capa y métricas de fuga cruzada, sobre un modelo de 12B.
- Despliegue en una GPU de consumo de 12 GB: con GGUF `Q4_K_M` y contexto de 16k, el autor reporta que cabe en una RTX 4070 Ti con unos 3,8 GiB libres, lo que viabiliza prototipos locales de agentes.

## Benchmarks y rendimiento

| Suite | Tareas | Base | WSP v3.0 | Tokens medios (base → WSP) |
|---|---:|---:|---:|---:|
| S1_THINK (holdout) | 3 | 1/3 (33,3%) | 1/3 (33,3%) | 971,0 → 944,3 |
| S2_RESTRAINT (holdout) | 4 | 2/4 (50,0%) | 3/4 (75,0%) | 399,5 → 399,5 |
| S3_ROUTER (holdout) | 5 | 4/5 (80,0%) | 4/5 (80,0%) | 111,6 → 111,8 |
| S4_CODE (holdout) | 2 | 0/2 (0,0%) | 0/2 (0,0%) | 1024,0 → 1024,0 |
| S5_TURN2_JSON (holdout) | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 38,3 → 38,3 |
| S6_HANDOFF (holdout) | 4 | 4/4 (100,0%) | 4/4 (100,0%) | 108,5 → 118,8 |
| S7_INJ_GUARD (holdout) | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 110,0 → 128,0 |
| S8_GROUNDING (holdout) | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 110,0 → 142,0 |
| S9_ERR_RECOV (holdout) | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 22,0 → 22,0 |
| GSM8K (20) | 20 | 7/20 (35,0%) | 7/20 (35,0%) | 907,1 → 890,1 |
| HumanEval pass@1 (15) | 15 | 6/15 (40,0%) | 6/15 (40,0%) | 875,2 → 883,9 |
| BFCL v3 Irrelevance (15) | 15 | 7/15 (46,7%) | 6/15 (40,0%) | 376,4 → 362,9 |
| NL2Bash InterCode (20) | 20 | 7/20 (35,0%) | 7/20 (35,0%) | 433,6 → 436,8 |

Resultado global: base 50/100 (50,0%) frente a WSP v3.0 50/100 (50,0%), delta de +0,0 pp. Holdout agregado: 23/30 → 24/30. Benchmarks públicos establecidos: 27/70 → 26/70. Velocidad reportada: 51,8 tok/s con `-c 16384 -ctk q8_0 -ctv q8_0`; delta de carga 7493 MiB y delta de pico de VRAM 7567 MiB. GGUF `Q4_K_M` de 6,633 GiB.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de 7567 MiB de delta con contexto de 16k, caché KV en `q8_0` y GGUF `Q4_K_M` de 6,633 GiB.
- GPU recomendadas: RTX 4070 Ti (12 GB) confirmada por el autor con 16k en solitario y unos 3,8 GiB libres; A100 y H100 no aparecen en la información disponible, pero son sobradamente suficientes por capacidad.
- GPU de consumo: no cabe en RTX 2060 (6 GB), ya que el requisito supera los 6144 MiB de VRAM. Cabe en RTX 4070 Ti y, por extensión, en tarjetas de 12 GB o más con margen variable.
- Opciones de despliegue: `llama-server` de llama.cpp con adaptadores LoRA GGUF (`adapters/wsp_s1_think.gguf` … `wsp_s9_error_recovery.gguf`), PyTorch/Transformers con parches safetensors rank-16, y el parche delta denso combinado en BF16. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: 51,8 tok/s medidos en la configuración indicada; es el modelo más lento de los cinco comparados en el estudio.

## Comparativa con modelos similares

| Modelo | GGUF Q4_K_M | Base (100) | WSP v3.0 (100) | Delta neto | Holdout (/30) | Est. (/70) | tok/s | Pico VRAM (16k) | RTX 2060 (6 GB) | RTX 4070 Ti (12 GB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| qwen35_4b | 2,553 GiB | 72/100 | 88/100 | +16,0 pp | 24 → 29 | 48 → 59 | 116,5 | 3290 MiB | Sí | Sí |
| nemotron3_4b | 2,642 GiB | 81/100 | 81/100 | +0,0 pp | 26 → 28 | 55 → 53 | 131,1 | 3133 MiB | Sí | Sí |
| qwen35_9b | 5,290 GiB | 84/100 | 76/100 | -8,0 pp | 26 → 25 | 58 → 51 | 72,0 | 5593 MiB | Ajustado | Sí |
| qwen35_2b | 1,193 GiB | 57/100 | 55/100 | -2,0 pp | 23 → 23 | 34 → 32 | 226,5 | 1979 MiB | Sí | Sí |
| gemma4_12b (este) | 6,633 GiB | 50/100 | 50/100 | +0,0 pp | 23 → 24 | 27 → 26 | 51,8 | 7567 MiB | No | Sí |

El modelo de este repositorio es el de mayor tamaño del grupo, el más lento y el que requiere más VRAM, y su rendimiento global queda por debajo de todos los demás candidatos del estudio, incluido el qwen35_2b de 1,193 GiB. La licencia gemma difiere de las licencias de los modelos Qwen y Nemotron comparados, no detalladas en la información disponible.

## Limitaciones y advertencias

- El rendimiento global no mejora respecto al modelo base: 50/100 frente a 50/100 y delta de +0,0 pp, con caída en benchmarks públicos (27/70 → 26/70) y ligera mejora en holdout (23/30 → 24/30).
- BFCL v3 Irrelevance empeora de 7/15 a 6/15, lo que sugiere que el subespacio de contención puede degradar la discriminación de irrelevancia en algunos casos.
- S4_CODE no supera ninguna de las 2 tareas de holdout y HumanEval se mantiene en 6/15 (40,0%), por lo que la síntesis de código es limitada.
- GSM8K se queda en 7/20 (35,0%) y NL2Bash en 7/20 (35,0%), cifras bajas para tareas de razonamiento matemático y traducción a shell.
- Los tokens medios de finalización son altos en varias suites (más de 800–1000 tokens en GSM8K, HumanEval y S1_THINK), lo que encarece el despliegue en producción.
- Riesgo de alucinación: no se reportan métricas específicas de factualidad ni de calibración fuera de S8_GROUNDING; el autor no documenta sesgos conocidos.
- Idiomas soportados no disponibles; no hay evaluación multilingüe en la información proporcionada.
- Licencia gemma: sujeta a los términos de uso de Gemma, que imponen restricciones para uso comercial y obligaciones de atribución; conviene revisar las condiciones antes de producción.
- El artefacto es un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente.
- El despliegue requiere llama.cpp con soporte de adaptadores LoRA GGUF o Transformers con los parches safetensors; no se documentan integraciones con vLLM, TGI u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio hermano Qwen3.5-4B: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Repositorio hermano Nemotron-3-Nano-4B: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Repositorio hermano Qwen3.5-9B: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Repositorio hermano Qwen3.5-2B: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
