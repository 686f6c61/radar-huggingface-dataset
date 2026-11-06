# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step588

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p12544x1-step588` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario de Hugging Face `mhseo2`. El modelo parte de una variante intermedia denominada `mhseo2/Olmo-3-1025-7B-opd` y se entrena sobre trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` para prompts de matematicas del dataset OpenThoughts3. El objetivo es destilar capacidad de razonamiento matematico en un modelo de 7.300 millones de parametros, mucho mas ligero que el profesor de 32B.

El checkpoint publicado corresponde al paso 588 de un entrenamiento de 15 epocas (epoca 12), con un total de 12.544 muestras de entrenamiento (una trayectoria por prompt, aproximadamente 225 millones de tokens). El modelo emplea una arquitectura transformer densa (no MoE) heredada de Olmo 3, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en que demuestra un flujo de destilacion de razonamiento reproducible sobre hardware academico (BSC MareNostrum 5, 2 nodos x 4 H100 con FSDP) y publica resultados de evaluacion en AIME 2025, AIME 2026 y HMMT Feb 2025, con un filtrado anti-contaminacion de 10 gramos frente a esos mismos conjuntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (limite usado en entrenamiento y evaluacion) |
| Tipos de cuantizacion | No disponible en la model card (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7.298 millones de parametros derivado de Olmo-3-1025-7B. Sobre esa base se aplica un SFT sobre trazas de razonamiento del modelo `allenai/Olmo-3.1-32B-Think` para prompts matematicos de OpenThoughts3. El brazo de datos `p12544x1` contiene 12.544 prompts con una trayectoria cada uno (12.544 muestras, aproximadamente 225 millones de tokens). Solo se conservan las trayectorias que terminan correctamente, cierran `</think>` exactamente una vez, incluyen una respuesta en caja tras el cierre y caben en 32.768 tokens. Ademas, se aplica una descontaminacion de 10 gramos frente a AIME 2025, AIME 2026 y HMMT Feb 2025.

La configuracion de entrenamiento usa batch de 256, learning rate de 8e-5 con decaimiento coseno hasta 4e-5 y un 3% de warmup, weight decay de 0,01 y 49 pasos por epoca. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism con grado 2. El codigo corresponde al arbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`). El checkpoint publicado es el paso 588, es decir, la epoca 12 de 15.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso con modo de pensamiento explicito mediante etiquetas `</think>`.
- Resolucion de problemas de competicion (AIME, HMMT) con formato de respuesta en caja, segun el protocolo de entrenamiento.
- Generacion de cadenas de razonamiento largas: el modelo fue entrenado y evaluado con hasta 32.768 tokens de respuesta.
- Capacidad multilingue: no documentada en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma especifica; el razonamiento multi-paso interno si esta cubierto por las trazas de pensamiento.
- Capacidades de vision o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo esta especializado en producir razonamientos largos y respuestas en caja, adecuado para pipelines de evaluacion tipo AIME/HMMT con `math_verify` como scorer.
- Generacion de datos sinteticos de razonamiento: puede usarse como generador de trazas para destilar o aumentar datasets matematicos, dado su formato de salida controlado.
- Tutoria matematica interactiva: con 32.768 tokens de contexto puede mantener explicaciones detalladas paso a paso en una conversacion multi-turno.
- Verificacion y critica de soluciones: puede emplearse para reescribir o comprobar pasos intermedios de demostraciones matematicas en entornos educativos.
- Investigacion en destilacion de razonamiento: sirve como referencia reproducible de SFT sobre trazas de un profesor de 32B, con hiperparametros y datos publicados.
- Fine-tuning posterior en dominios cientificos: al ser un modelo denso de 7B con licencia Apache 2.0, es un punto de partida asequible para ajustes especificos (fisica, ingenieria, estadistica) en una sola GPU de 80 GB.
- Despliegue en entornos con recursos limitados: su tamano permite inferencia en una GPU consumer de gama alta con cuantizacion, aunque el autor no publica variantes cuantizadas.

## Benchmarks y rendimiento

Resultados publicados por el autor: `mean@8` accuracy (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA H100 80GB HBM3 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 40,42 |
| AIME 2026 | 47,08 |
| HMMT Feb 2025 | 27,50 |

No se han publicado comparaciones directas con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float16: aproximadamente 14,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: H100 80GB (configuracion usada en la evaluacion), A100 80GB, A100 40GB, RTX 4090 24GB para contextos moderados.
- Cabe en GPU consumer: si, en RTX 4090 24GB o RTX 3090 24GB con cuantizacion o con contextos reducidos; en GPUs de 16GB solo con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF (no publicada por el autor), y transformers con FSDP para entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p12544x1-step588 | 7,30B | 32.768 | SFT matematico sobre trazas de Olmo-3.1-32B-Think | Apache 2.0 | Hugging Face (28 descargas) |
| Olmo-3-1025-7B (base) | 7B (familia Olmo 3) | No disponible en esta ficha | Modelo base generalista | No disponible en esta ficha | Hugging Face (AllenAI) |
| Olmo-3.1-32B-Think (profesor) | 32B | No disponible en esta ficha | Razonamiento con modo think | No disponible en esta ficha | Hugging Face (AllenAI) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado exclusivamente con prompts matematicos de OpenThoughts3; su rendimiento fuera de matematicas puede degradarse respecto al modelo base.
- Riesgo de alucinacion en pasos intermedios: aunque el formato exige respuesta en caja, el contenido del razonamiento no esta verificado mas alla del filtrado por formato y finalizacion.
- Checkpoint intermedio: corresponde al paso 588 (epoca 12 de 15), no al modelo final del entrenamiento.
- Sesgos: no documentados por el autor; al derivar de Olmo 3 y de trazas de un profesor, puede heredar sesgos de ambos.
- Idiomas: no se especifica que idiomas soporta; el entrenamiento se realizo sobre prompts mayoritariamente en ingles.
- Contaminacion: el autor aplica descontaminacion de 10 gramos frente a AIME 2025/2026 y HMMT Feb 2025, pero no frente a otros conjuntos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Ausencia de cuantizaciones oficiales: el despliegue en hardware limitado requiere conversion manual a GGUF u otros formatos.
- Modelo de investigacion con muy poca traccion (28 descargas, 0 likes): no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step588
- Modelo base intermedio: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: no disponible en la informacion proporcionada
- Codigo de entrenamiento (`mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`): no se proporciona URL en la model card
