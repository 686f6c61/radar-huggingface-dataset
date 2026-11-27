# Nori103/Inkling-2-Mini-char-lora

## Resumen

Inkling-2-Mini-char-lora es un adaptador LoRA de atención de 38 MB (rango 16, `lora_alpha=32`, 144 matrices BF16 de atención distribuidas en las 24 capas físicas del modelo base) desarrollado por el usuario Nori103 sobre `thinkingmachines/Inkling-2-Mini`. No es un modelo completo, sino un delta de pesos que se fusiona sobre el checkpoint oficial para corregir una debilidad concreta: la manipulación de caracteres y el trazado de cadenas (string tracing), tareas en las que el modelo base falla con frecuencia.

El adaptador persigue dos objetivos simultáneos. Por un lado, mejora la precisión en tareas de manipulación de caracteres de 129/270 a 248/270 en un conjunto retenido, incluyendo 94/100 en formatos de tarea no vistos durante el entrenamiento. Por otro, preserva el canal de razonamiento controlable del modelo base (`reasoning_effort` con niveles `none`, `low`, `medium`, `high`), evitando el colapso que sufre el ajuste supervisado (SFT) ingenuo cuando se entrena solo con `effort=0.0`.

Es relevante ahora porque documenta empíricamente cómo el SFT a un único nivel de esfuerzo destruye el comportamiento multi-nivel del modelo base, y propone una receta de autodestilación multi-esfuerzo que lo mantiene. El adaptador se entrenó en Tinker en unos 45 minutos y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de atención (rank 16, `lora_alpha=32`) sobre transformer MoE `thinkingmachines/Inkling-2-Mini` |
| Parametros totales | 38 MB de adaptador (144 matrices BF16 de atención); parámetros del modelo base: no disponible |
| Parametros activos | no disponible (el modelo base es MoE; el número de expertos activos no se detalla en la información disponible) |
| Longitud de contexto | no disponible en el adaptador; el ejemplo de despliegue usa `--max-context 32768` |
| Tipos de cuantizacion | El adaptador se distribuye en BF16; el base oficial en NVFP4/MXFP8. Los expertos MoE no se modifican |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (PEFT); requiere fusión a checkpoint completo para inferencia |

## Arquitectura y entrenamiento

El adaptador modifica exclusivamente las 144 matrices de atención BF16 presentes en las 24 capas físicas del modelo base. Los expertos MoE en NVFP4/MXFP8 quedan intactos, lo que permite fusionar en CPU en unos 15 segundos y obtener un checkpoint drop-in con el mismo layout que la release oficial HF-NVFP4-MXFP8. Se entrenó en Tinker con 3.204 ejemplos durante 2 épocas, batch size 48 y learning rate 1.6e-4.

La composición del dataset es la clave técnica del trabajo: 927 trazas auténticas de razonamiento del modelo base muestreadas en los niveles `0.1` (60), `0.2` (390), `0.7` (269) y `0.9` (208), más 350 ejemplos de "char-thinking" en `0.2`/`0.7`/`0.9`, más 1.927 ejemplos directos en `0.0`. Esta mezcla multi-esfuerzo evita el colapso del canal de pensamiento observado en dos ejecuciones previas: con solo `effort=0.0` (1.927 ejemplos) la precisión de caracteres subió a 251/270 pero el pensamiento se redujo a 0 caracteres en `low`, `medium` y `high`; con `0.0`+`0.9` se recuperaron parcialmente `medium` y `high` pero `low` (0.2) siguió a 0 caracteres y la longitud de pensamiento cayó ~50 %.

## Capacidades

- Manipulación de caracteres y trazado de cadenas: inversión, conteo, sustitución y transformaciones posicionales sobre texto, con mejora medida de 129/270 a 248/270 en tareas retenidas.
- Generalización a formatos de tarea no vistos: 94/100 en tipos de tarea no presentes en el entrenamiento (frente a 48/100 del base).
- Razonamiento controlable multi-nivel: mantiene los niveles `none`, `low`, `medium` y `high` vía `reasoning_effort` en peticiones compatibles con OpenAI.
- Razonamiento directo (`effort=0.0`): conserva la precisión en respuestas sin cadena de pensamiento explícita.
- Herencia del modelo base: capacidades de generación de texto, código y matemáticas del Inkling-2-Mini original, no evaluadas de forma independiente en esta ficha.
- Tool calling y capacidades de agente: no documentadas específicamente para el adaptador; dependen del modelo base.
- Capacidades multilingües: no disponible.

## Casos de uso

- Validación de pipelines de manipulación de strings: usar el modelo fusionado como verificador de transformaciones de texto (invertir, contar caracteres, sustituir posiciones) en herramientas de test o generación de datos sintéticos, aprovechando la mejora de 129/270 a 248/270.
- Investigación sobre ajuste fino con preservación de razonamiento: reproducir la receta de autodestilización multi-esfuerzo (927 trazas reales en cuatro niveles + 1.927 ejemplos directos) para estudiar cómo evitar el colapso del canal de pensamiento en SFT.
- Evaluación de adaptadores PEFT en entornos con VRAM limitada: el adaptador de 38 MB se fusiona en CPU en ~15 s y produce un checkpoint que corre en una RTX 5060 Ti de 16 GB con `--kv fp8` y contexto de 32.768 tokens.
- Generación de ejercicios de razonamiento con nivel de esfuerzo ajustable: servir el modelo con `reasoning_effort` variable para producir explicaciones cortas (`low`) o cadenas de pensamiento largas (`high`) según el caso.
- Benchmarking de robustez ante formatos nuevos: emplear el conjunto de 100 tareas no vistas como test de generalización para otros adaptadores o modelos pequeños.
- Despliegue en pipelines de CI para tareas de razonamiento determinista: integrar vía vLLM con `--served-model-name inkling-2-mini` y consumir la API compatible con OpenAI para pruebas de regresión de prompts.
- Reproducción de experimentos de Tinker: el adaptador sirve como referencia de un entrenamiento de ~45 minutos con hiperparámetros documentados (BS=48, LR=1.6e-4, 2 épocas).

## Benchmarks y rendimiento

Evaluados localmente en una RTX 5060 Ti de 16 GB con safetensors oficiales HF-NVFP4-MXFP8 y pesos de atención BF16 fusionados, usando `strata-inkling` con `--max-context 32768 --kv fp8 --draft off`.

| Benchmark | Base (Inkling-2-Mini) | SFT `effort=0` (141) | SFT `0+0.9` (144) | Este adaptador (v2-ep2, 145) |
|---|---:|---:|---:|---:|
| Tareas de caracteres retenidas (270) | 129/270 | 251/270 | 239/270 | 248/270 |
| — Tipos entrenados (170) | 81/170 | 159/170 | 149/170 | 154/170 |
| — Tipos no entrenados (100) | 48/100 | no disponible | no disponible | 94/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 38 MB; el modelo base fusionado requiere ~20 GB en disco y se ejecutó con éxito en una GPU de 16 GB usando cuantización NVFP4/MXFP8 y KV cache en FP8.
- GPU recomendadas: RTX 5060 Ti 16 GB validada por el autor; GPUs de 24 GB o más (RTX 4090, A100, H100) permiten mayor contexto y batch sin cuantización agresiva del KV cache.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB según la validación del autor.
- Opciones de despliegue: vLLM (`vllm serve`), Strata (`strata-inkling`, requiere el fix del loader BF16→F32 en PR #7201 para v0.2.22), y llama.cpp/Ollama/LM Studio tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión char (270) | Licencia |
|---|---|---|---|---|---|
| Inkling-2-Mini-char-lora | LoRA sobre MoE | 38 MB adaptador | no disponible (32k en ejemplo) | 248/270 | Apache 2.0 |
| Inkling-2-Mini (base) | MoE | no disponible | no disponible | 129/270 | no disponible |
| SFT `effort=0` (141) | SFT completo | no disponible | no disponible | 251/270 (colapsa pensamiento) | no disponible |
| SFT `0+0.9` (144) | SFT completo | no disponible | no disponible | 239/270 (colapsa `low`) | no disponible |

No se dispone de datos de otros adaptadores o modelos comparables fuera de las variantes del propio autor.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar `thinkingmachines/Inkling-2-Mini` (~20 GB) y fusionar el adaptador antes de usarlo.
- No funciona directamente en Ollama, LM Studio ni llama.cpp: es necesario fusionar y convertir a GGUF.
- El adaptador solo toca atención; cualquier limitación de los expertos MoE del base persiste.
- El autor documenta que el SFT a un único nivel de esfuerzo degrada el canal de pensamiento; recetas de ajuste posteriores deben mantener la mezcla multi-esfuerzo para no reproducir el colapso.
- Riesgo de alucinación: no evaluado en la información disponible; heredado del modelo base.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponible; la evaluación se limita a tareas de caracteres en el conjunto del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- La licencia Apache 2.0 cubre el adaptador; conviene verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Nori103/Inkling-2-Mini-char-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio Strata: https://github.com/Niko1221/Strata
- PR de Strata #7201 (fix del loader BF16→F32): https://github.com/Niko1221/Strata/pull/7201
- Script de fusión: `scripts/merge_attention_lora.py` incluido en el repositorio del adaptador
