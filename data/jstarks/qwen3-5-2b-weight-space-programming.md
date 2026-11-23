# jstarks/Qwen3.5-2B-Weight-Space-Programming

## Resumen

Qwen3.5-2B-Weight-Space-Programming es una adaptación del modelo base Qwen/Qwen3.5-2B (1.881.825.088 parámetros reales según safetensors) publicada por el usuario jstarks. No se trata de un modelo entrenado de forma convencional, sino de una aplicación de la técnica denominada Weight-Space Programming (WSP v3.0), descrita por el autor como una arquitectura de "9-Subspace Dynamic LoRA" que opera sin entrenamiento (training-free) y con solución en forma cerrada (closed-form) sobre los pesos del modelo base. El objetivo declarado es modular el comportamiento del modelo en tareas de razonamiento, uso de herramientas y agentes sin reentrenar.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y GGUF, y está pensado para despliegue en entornos de recursos limitados: el autor reporta que la variante cuantizada Q4_K_M ocupa 1.193 GiB y que el modelo cabe en una RTX 2060 de 6 GB con unos 4,4 GiB libres a contexto de 16k. La velocidad medida en el pipeline del autor es de 226,5 tok/s, la más alta de los cinco modelos comparados en su estudio.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de interpretabilidad mecanicista y programación de pesos sobre un modelo pequeño; por otro, los resultados publicados por el autor muestran que la intervención WSP v3.0 no mejora el rendimiento agregado del modelo base (55/100 frente a 57/100, es decir, -2,0 pp), por lo que debe evaluarse con cautela antes de usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B); intervención WSP v3.0 de 9 subespacios con LoRA dinámico; 24 capas, hidden_size=2048, intermediate_size=6144, MLP SwiGLU, RMSNorm 1+w |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de evaluación del autor (-c 16384); contexto nativo del modelo base no disponible |
| Tipos de cuantización | GGUF Q4_K_M (1.193 GiB); cuantización de caché KV q8_0 (q8_0/q8_0); otros tipos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de 24 capas con hidden_size de 2048, intermediate_size de 6144, MLP SwiGLU y normalización RMSNorm con la variante 1+w. Sobre esa base, el autor aplica WSP v3.0, descrito como una programación de pesos en forma cerrada y sin entrenamiento, organizada en nueve subespacios (S1 a S9) con LoRA dinámico y un modo de síntesis denominado "calibrated_proxy_weight_space". La model card menciona también las etiquetas deltanet y edge-leaf, aunque no se detalla en la información disponible en qué consiste su implementación concreta.

No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; al ser una intervención training-free, no cabe esperar un pipeline de alineamiento convencional, pero este extremo no se confirma en la documentación. La innovación técnica destacable es precisamente el método WSP: una modificación de pesos derivada analíticamente en lugar de aprendida por descenso de gradiente, evaluada de extremo a extremo sobre 100 tareas unificadas y 20 tareas de Terminal-Bench 2.0 en contenedores WSL2 con estado.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con un modo de "think closure" evaluado en el conjunto S1.
- Síntesis de código: el conjunto S4 (Mid-Band Code Synthesis) y HumanEval pass@1 forman parte de la evaluación.
- Tool calling y enrutamiento multi-herramienta, evaluado en el conjunto S3 (Multi-Tool Router) y en BFCL v3 Irrelevance.
- Restricción de herramientas y anti-sicofancia (S2), orientada a que el modelo no invoque herramientas innecesariamente ni ceda ante premisas erróneas.
- Salida estructurada en JSON en el segundo turno de conversación (S5), con una mejora reportada de 1/3 a 3/3 en ese conjunto.
- Puerta de escalado o handoff (S6), guardia frente a inyección indirecta de prompts (S7), abstención fundamentada (S8) y autorrecuperación de errores (S9).
- Capacidades de agente en terminal: ejecución de tareas bash con estado en contenedores, evaluadas en Terminal-Bench 2.0.
- Procesamiento image-text-to-text según las etiquetas del repositorio, aunque no se detalla la implementación en la información disponible.

## Casos de uso

- Enrutamiento de herramientas en asistentes: el modelo puede decidir qué función invocar en un flujo con varias herramientas disponibles, aprovechando la evaluación específica del conjunto S3 y su ventana de 16k tokens para mantener el historial de llamadas en contexto.
- Generación de JSON estructurado en diálogos multi-turno: útil en backends que necesitan respuestas parseables en el segundo turno, donde el autor reporta una mejora de 1/3 a 3/3 tras la intervención WSP.
- Guardia frente a inyección de prompts: el conjunto S7 evalúa la resistencia a inyección indirecta, lo que permite usarlo como capa de filtrado en pipelines de agentes que procesan contenido externo.
- Automatización de terminal en entornos controlados: las 20 tareas de Terminal-Bench 2.0 en WSL2 demuestran capacidad de operar comandos bash con realimentación de código de salida, aunque con una tasa de éxito baja (3/20).
- Despliegue en hardware de gama baja: con 1.193 GiB en Q4_K_M y un pico de VRAM de 1979 MiB a 16k, es adecuado para prototipos en una RTX 2060 de 6 GB o como hoja ultraligera en una cascada de modelos.
- Investigación en interpretabilidad mecanicista: el repositorio documenta la metodología WSP y sus resultados por conjunto, lo que lo convierte en material de estudio para experimentos de modificación de pesos sin entrenamiento.
- Evaluación comparativa de técnicas de adaptación: sirve como referencia negativa o de control en estudios que comparen LoRA entrenado frente a programación de pesos en forma cerrada.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación temperature=0.0, seed=42, -c 16384, caché KV q8_0. La comparación es entre el modelo base y la versión WSP v3.0 sobre las mismas 100 tareas.

| Conjunto | Tareas | Base | WSP v3.0 | Delta |
|---|---:|---:|---:|---:|
| S1 Think Closure | 3 | 1/3 (33,3%) | 1/3 (33,3%) | 0,0 pp |
| S2 Tool Restraint | 4 | 3/4 (75,0%) | 3/4 (75,0%) | 0,0 pp |
| S3 Multi-Tool Router | 5 | 3/5 (60,0%) | 3/5 (60,0%) | 0,0 pp |
| S4 Mid-Band Code | 2 | 2/2 (100,0%) | 0/2 (0,0%) | -100,0 pp |
| S5 Turn-2 JSON | 3 | 1/3 (33,3%) | 3/3 (100,0%) | +66,7 pp |
| S6 Handoff Gate | 4 | 4/4 (100,0%) | 4/4 (100,0%) | 0,0 pp |
| S7 Injection Guard | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 0,0 pp |
| S8 Grounded Abstention | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 0,0 pp |
| S9 Error Recovery | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 0,0 pp |
| GSM8K (20) | 20 | 5/20 (25,0%) | 4/20 (20,0%) | -5,0 pp |
| HumanEval pass@1 (15) | 15 | 8/15 (53,3%) | 8/15 (53,3%) | 0,0 pp |
| BFCL v3 Irrelevance (15) | 15 | 9/15 (60,0%) | 8/15 (53,3%) | -6,7 pp |
| NL2Bash (20) | 20 | 12/20 (60,0%) | 12/20 (60,0%) | 0,0 pp |
| Total 100 tareas | 100 | 57/100 (57,0%) | 55/100 (55,0%) | -2,0 pp |
| Terminal-Bench 2.0 | 20 | 3/20 (15,0%) | 3/20 (15,0%) | 0,0 pp |

Rendimiento medido: 226,5 tok/s, delta de carga de 1445 MiB y pico de VRAM de 1979 MiB en la configuración indicada.

## Requisitos de hardware

- VRAM estimada: 1.193 GiB para los pesos en GGUF Q4_K_M; pico de VRAM de 1979 MiB con contexto de 16k y caché KV en q8_0.
- GPU recomendadas: RTX 2060 de 6 GB (cabe con unos 4,4 GiB libres a 16k) y RTX 4070 Ti de 12 GB (uso como hoja ultraligera o Tier-1 de cascada).
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM según los datos del autor.
- Opciones de despliegue: llama.cpp (etiqueta llama-cpp e imatrix en el repositorio), transformers y endpoints compatibles; no se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 226,5 tok/s en la configuración de evaluación del autor, la cifra más alta de los cinco modelos de su estudio.

## Comparativa con modelos similares

Comparación con las otras variantes WSP del mismo estudio del autor, todas evaluadas sobre las mismas 100 tareas.

| Modelo | Parámetros (repo) | GGUF Q4_K_M | Base /100 | WSP /100 | Velocidad | Pico VRAM (16k) | RTX 2060 6 GB |
|---|---|---:|---:|---:|---:|---:|---|
| Qwen3.5-2B-WSP | 1,88 B | 1.193 GiB | 57 | 55 | 226,5 tok/s | 1979 MiB | Sí |
| Qwen3.5-4B-WSP | No disponible | 2.553 GiB | 72 | 89 | 117,0 tok/s | 3370 MiB | Sí |
| Nemotron-3-Nano-4B-WSP | No disponible | 2.642 GiB | 81 | 81 | 131,1 tok/s | 3133 MiB | Sí |
| Qwen3.5-9B-WSP | No disponible | 5.290 GiB | 84 | 88 | 72,5 tok/s | 5650 MiB | Ajustado |
| Gemma-4-12B-WSP | No disponible | 6.633 GiB | 50 | 52 | 51,3 tok/s | 7664 MiB | No |

Frente a la alternativa de 4B del mismo autor, el modelo de 2B es más rápido pero rinde 34 puntos menos en la suite de 100 tareas; frente a Nemotron-3-Nano-4B, que no gana nada con WSP, el 2B sí pierde 2 puntos. No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La intervención WSP v3.0 empeora el resultado agregado del modelo base: 55/100 frente a 57/100 (-2,0 pp), con caídas en GSM8K (-5,0 pp), BFCL Irrelevance (-6,7 pp) y un colapso en S4 Code (de 2/2 a 0/2).
- La tasa de éxito en Terminal-Bench 2.0 es del 15% (3/20), insuficiente para automatización de terminal en producción sin supervisión.
- El conjunto de evaluación es pequeño (100 tareas más 20 de terminal), con varios subconjuntos de solo 2 a 5 tareas, lo que hace que los deltas por conjunto tengan alta varianza.
- Los resultados son autocontenidos en la model card del autor y no se han replicado de forma independiente en la información disponible.
- Los idiomas soportados no están documentados, lo que impide garantizar un comportamiento multilingüe fiable.
- No se detallan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad independientes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B debe verificarse por separado para confirmar que sus términos son compatibles.
- Al ser una intervención training-free sobre pesos, no se ha aplicado un pipeline de alineamiento documentado, por lo que el cumplimiento de instrucciones y la calibración de rechazos no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante Qwen3.5-4B-WSP: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Variante Nemotron-3-Nano-4B-WSP: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Variante Qwen3.5-9B-WSP: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Variante Gemma-4-12B-WSP: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
