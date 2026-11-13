# CMSManhattan/JiRackGlimmer-70B-alpha-GGUF

## Resumen

JiRack Glimmer 70B alpha es un modelo de lenguaje de 70.000 millones de parámetros publicado por CMSManhattan (Konstantin Grabko) bajo la arquitectura propietaria JiRack, construido a partir de un modelo Muse Glimmer de Meta. Se distribuye exclusivamente en formato GGUF para llama.cpp y se encuentra en estado alpha: la arquitectura y los pesos están ensamblados a tamaño completo, pero no han recibido entrenamiento propio adicional. El modelo reproduce fielmente las salidas del modelo Muse Glimmer original del que deriva, sin mejorar su calidad de respuesta.

La arquitectura emplea 104 capas organizadas en grupos de cuatro, con tres capas de atención de ventana deslizante (ventana de 2.048 tokens) y una capa global por grupo, 32 cabezas de consulta y 2 cabezas clave-valor (GQA), dimensión de cabeza 128 y un vocabulario de 202.048 tokens. El contexto configurado alcanza 131.072 posiciones. Cada capa lineal es una BitLinear con interruptor ternario (lambda), aunque en este alpha lambda = 0 y los pesos permanecen en precisión completa.

Su relevancia actual es limitada y de carácter evaluativo: se publica para socios que quieran valorar el proyecto antes de las fases de entrenamiento previstas (entrenamiento continuado, fine-tuning para tool calling y entrenamiento ternario). No debe considerarse un modelo listo para producción ni comparable en capacidades a otros modelos de 70B entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas híbridas de atención (3 de ventana deslizante de 2.048 tokens + 1 global por grupo de 4), BitLinear con interruptor ternario (lambda = 0 en este alpha) |
| Parámetros totales | 72,0B en el checkpoint; 70,0B en el modelo de lenguaje (70.032.015.872 según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 posiciones configuradas (las comprobaciones del autor usaron ventanas de 512 tokens) |
| Tipos de cuantización | Q8_0, Q4_K_M, Q2_K (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (modelo base Muse Glimmer bajo Apache 2.0) |
| Formato de pesos | GGUF (llama.cpp); sin safetensors publicados en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer de 104 capas con un patrón de atención híbrido: por cada grupo de cuatro capas, tres usan atención de ventana deslizante de 2.048 tokens y una usa atención global, lo que reduce el coste computacional en contextos largos manteniendo acceso global periódico. La dimensión oculta es 6.656 y la FFN de 28.160, con 32 cabezas de consulta y 2 cabezas clave-valor (atención con consultas agrupadas). El vocabulario es de 202.048 tokens. La innovación declarada de la arquitectura JiRack es que toda capa lineal es una BitLinear con un interruptor ternario (lambda); en este alpha lambda = 0, por lo que los pesos son de precisión completa y el modelo no aprovecha aún la cuantización ternaria nativa.

No ha habido entrenamiento propio: el modelo es una modificación arquitectónica y de pesos del modelo Muse Glimmer de Meta (Apache 2.0), y reproduce sus salidas. El autor verificó la fidelidad de la implementación comparando su código JiRack con el código de transformers del modelo fuente en las primeras 8 capas en fp32 (KL máxima 5,37e-12, coincidencia top-1 del 100%), auditó los 2.060 tensores del checkpoint (0 errores) y comprobó que los logits del modelo completo de 104 capas son idénticos bit a bit a los del modelo fuente en 4 prompts (KL máxima 0, top-1 100%). No se dispone de datos sobre volumen de tokens, composición del dataset, RLHF ni DPO, porque no se ha realizado entrenamiento.

## Capacidades

- Generación de texto conversacional: el modelo funciona en modo chat (`-cnv` en llama.cpp) y reproduce el comportamiento del modelo Muse Glimmer fuente.
- Razonamiento, código y matemáticas: no disponible como capacidad propia; hereda únicamente lo que el modelo fuente ya sabía, sin mejoras.
- Tool calling / function calling: no incluido en este alpha; el autor lo sitúa en la hoja de ruta como fine-tuning futuro.
- Agentes y razonamiento multi-paso: no disponible en este release.
- Capacidades multilingües: no disponibles como dato declarado; dependen del modelo fuente.
- Visión: el codificador de imagen del checkpoint no forma parte de esta release; solo se publica el modelo de lenguaje.
- Modo thinking: no disponible.
- Capacidad ternaria: latente en la arquitectura (BitLinear), no activada en este alpha (lambda = 0).

## Casos de uso

- Evaluación técnica de la arquitectura JiRack: el modelo permite a socios e investigadores verificar que la implementación de 104 capas con atención híbrida y BitLinear reproduce exactamente el modelo fuente, usando los ficheros GGUF en llama.cpp con `llama-server -c 32768`.
- Pruebas de cuantización GGUF: los tres ficheros publicados (Q8_0, Q4_K_M, Q2_K) permiten medir la degradación de perplejidad y la coincidencia top-1 frente al modelo fuente, con datos de referencia ya publicados por el autor.
- Prototipado de despliegue en llama.cpp: el fichero Q4_K_M (42,30 GB) cabe en una GPU de 48-80 GB y sirve para validar pipelines de inferencia, plantillas de chat y servidores compatibles con endpoints antes de que exista un modelo entrenado.
- Investigación sobre atención de ventana deslizante: la configuración de 3 capas locales + 1 global por grupo permite estudiar el comportamiento en contextos largos (hasta 131.072 posiciones configuradas) sin necesidad de entrenar.
- Base para experimentos de entrenamiento continuado: al estar los pesos a tamaño completo y sin entrenamiento propio, el checkpoint es un punto de partida para terceros que quieran explorar entrenamiento adicional sobre la arquitectura.
- Comparación de fidelidad de implementaciones: el modelo sirve como referencia para validar portes de la arquitectura Muse Glimmer a otros runtimes, dado que el autor documenta métricas de equivalencia bit a bit.
- Demostración en hardware modesto: el fichero Q2_K (25,97 GB) permite una primera inspección cualitativa del modelo en equipos con menos VRAM, aunque con perplejidad degradada (5,82 frente a 4,22 del fuente).

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Los únicos datos medidos son de fidelidad y de cuantización:

| Fichero | KL media vs fuente | Coincidencia top-1 | Perplejidad (fuente: 4,22) |
|---|---|---|---|
| Q8_0 | 0,000000 | 100,00% | 4,22 |
| Q4_K_M | 0,037225 | 93,86% | 4,41 |
| Q2_K | 0,354336 | 80,00% | 5,82 |

Mediciones de fidelidad de la implementación: primeras 8 capas en fp32 frente a transformers del modelo fuente, KL máxima 5,37e-12 y top-1 del 100%; modelo completo de 104 capas, logits idénticos bit a bit al fuente en 4 prompts (KL máxima 0, top-1 100%). Las pruebas GGUF se ejecutaron en CPU con llama.cpp c6a0ff11a sobre 3 ventanas de 512 tokens.

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 74,43 GB de fichero, por lo que necesita una GPU de 80 GB o descarga parcial a CPU; Q4_K_M (42,30 GB) cabe en una GPU de 48-80 GB; Q2_K (25,97 GB) cabe en GPUs de 32 GB o superiores.
- GPUs recomendadas: A100 80 GB o H100 80 GB para Q8_0; A6000 48 GB, L40S 48 GB o A100 80 GB para Q4_K_M; RTX 4090 24 GB no admite ningún fichero completo en VRAM y requeriría offloading a RAM del sistema.
- GPU de consumo: solo viable con descarga parcial de capas a CPU; el Q2_K es el candidato más realista en equipos con 24 GB de VRAM y RAM abundante.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` documentados por el autor); no se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles; las mediciones publicadas se hicieron en CPU y no se reportan tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Glimmer 70B alpha | 70,0B (LM) / 72,0B (checkpoint) | 131.072 | Alpha, sin entrenamiento propio | jirack-proprietary | GGUF en Hugging Face |
| Modelo Muse Glimmer de Meta (fuente) | no disponible en la información | no disponible | Entrenado | Apache 2.0 | Referenciado como origen |
| Modelos ternarios JiRack de CMSManhattan (16B, 8B, 2B) | 16B, 8B, 2B | no disponible | Publicados, con fine-tuning para tool calling | no disponible | GGUF, probados en llama.cpp |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría (70B entrenados) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: no responde mejor que el modelo Muse Glimmer del que deriva y no debe usarse como un 70B listo para producción.
- Licencia propietaria (jirack-proprietary): el uso comercial requiere contacto con el autor; el modelo base es Apache 2.0, pero la modificación se distribuye bajo términos propios.
- Riesgo de alucinación: heredado del modelo fuente, sin mitigaciones adicionales documentadas.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe más allá de la del modelo fuente.
- Sin soporte de tool calling ni de agentes en este release; son fases futuras de la hoja de ruta.
- El codificador de imagen no se incluye: el modelo es solo de texto.
- La cuantización Q2_K degrada notablemente la fidelidad (80% de coincidencia top-1, perplejidad 5,82 frente a 4,22).
- Las comprobaciones de contexto se hicieron con ventanas de 512 tokens, no con las 131.072 posiciones configuradas; el comportamiento real en contextos largos no está validado.
- El autor pide seguir la política de uso de Muse Glimmer de Meta, además de su propia licencia.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackGlimmer-70B-alpha-GGUF
- Contacto del autor: grabko@cmsmanhattan.com
- Modelo base referenciado: Muse Glimmer de Meta (Apache 2.0), sin enlace directo en la información disponible
- llama.cpp: no se proporciona enlace en la información disponible
