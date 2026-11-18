# Arki05/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de 10 archivos GGUF cuantizados del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Arki05. El problema que aborda es el de la cuantización de alta fidelidad: en lugar de aplicar un esquema de cuantización uniforme, cada tensor del modelo se cuantiza de forma independiente seleccionando el tipo que minimiza el error de salida para un tamaño de archivo objetivo. El resultado son archivos que, según las mediciones del autor, presentan entre un 11 % y un 38 % menos de divergencia KL que los cuantizados publicados por Unsloth y entre un 11 % y un 26 % menos que los de ISTA-DASLab del mismo tamaño.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se distribuye bajo licencia Apache 2.0. Los archivos GGUF cubren un rango de 2,16 a 4,46 bits por peso, con tamaños que van desde 7,27 GB hasta 15,01 GB, lo que permite desplegar el modelo en hardware de consumo con distintas restricciones de VRAM. La relevancia actual reside en que demuestra que una asignación por tensor basada en el hessiano puede reducir sustancialmente la pérdida de calidad en regímenes de baja precisión (2-3 bpw), donde los cuantizados convencionales degradan notablemente el rendimiento en tareas de razonamiento y código.

La información disponible no incluye detalles sobre la arquitectura interna del modelo base, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento originales. Esta ficha se limita a los datos verificables presentes en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; los archivos son GGUF para llama.cpp) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con tipos de llama.cpp; 10 archivos entre 2,16 y 4,46 bpw (IQ2_XXS, IQ2_S, Q2_K_XL, IQ3_XXS, Q3_K_XL, Q4_K_S y equivalentes, según la nomenclatura de comparación) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (10 archivos); el modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.8-27B en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detallan los datos de entrenamiento, el número de tokens, la composición del dataset o las etapas de alineación (RLHF/DPO). Lo que sí está documentado es el proceso de cuantización aplicado por Arki05.

La cuantización combina dos técnicas. Primero, una cuantización basada en el hessiano de tipo GPTQ: cada tensor de bloque se recuantiza desde los pesos BF16 originales de Qwen, eligiendo los valores de forma que el error introducido afecte lo mínimo posible a la salida del modelo. Segundo, una asignación de tipo por tensor mediante la herramienta qalloc, que selecciona para cada tensor el tipo de cuantización (de entre los disponibles en llama.cpp) que mejor se ajusta al presupuesto de tamaño objetivo. El repositorio auxiliar Arki05/Qwen3.8-27B-GGUF-shards almacena cada tensor en todos los tipos, lo que permite reconstruir cualquier combinación de tamaño. Los archivos excluyen la capa de predicción multi-token (MTP), de unos 0,35 GB, porque la generación normal no la utiliza.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta "conversational".
- Razonamiento de nivel avanzado: los benchmarks publicados incluyen GPQA-Diamond, LiveCodeBench v6 y AIME25, lo que indica capacidad para preguntas de nivel posgrado en ciencias, programación competitiva y matemáticas de competición.
- Generación de código: evaluado en LiveCodeBench v6 y en ventanas de evaluación procedentes de The Stack y MBPP.
- Razonamiento matemático: evaluado en AIME25, GSM8K y MATH.
- Uso de herramientas (tool calling / function calling): las ventanas de evaluación incluyen Glaive function calling v2 y ToolACE, lo que sugiere soporte para invocación de funciones.
- Seguimiento de instrucciones: evaluado con datos de Tulu 3 (persona instruction following).
- Capacidad multilingüe: las ventanas de evaluación cubren árabe, chino, alemán, francés, japonés y coreano, aunque no se especifica el nivel de competencia por idioma.
- Contexto largo: se evaluaron ventanas de 4096 tokens con la primera mitad como contexto, pero no se documenta la longitud máxima de contexto del modelo.
- Modo thinking: la model card menciona que el modelo BF16 generó respuestas "thinking included" al construir el conjunto de evaluación, lo que indica la existencia de un modo de razonamiento explícito.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: el archivo de 2,49 bpw (8,37 GB) cabe en GPUs con 12 GB de VRAM y mantiene un 81,8 % en GPQA-Diamond, lo que permite ejecutar un modelo de 27B en hardware asequible con calidad de razonamiento aceptable.
- Razonamiento científico y técnico en local: con el archivo de 3,81 bpw (12,80 GB) se obtiene una divergencia KL de 0,0213 frente al BF16, adecuado para asistencia en investigación que requiera privacidad de datos y no pueda depender de APIs externas.
- Generación de código en entornos air-gapped: los archivos de 3,15 bpw en adelante mantienen un 91,8-94,7 % de coincidencia en el token más probable, lo que los hace viables para autocompletado y revisión de código en entornos sin conexión.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye el directorio eval/ con las ventanas de evaluación y las puntuaciones, útil para investigadores que quieran reproducir o extender el análisis de divergencia KL.
- Construcción de cuantizados a medida: la aplicación qalloc permite resolver la mezcla de tipos para cualquier tamaño objetivo y ensamblar el GGUF en el navegador, lo que facilita generar variantes ajustadas a un presupuesto exacto de VRAM.
- Servicio de inferencia con llama.cpp en CPU/GPU mixto: al ser GGUF, se integra con llama.cpp y permite offloading parcial de capas a GPU, útil para servidores sin GPU dedicada pero con RAM abundante.
- Fine-tuning o destilación sobre el modelo base: al estar el BF16 disponible en Qwen/Qwen3.8-27B con licencia Apache 2.0, los cuantizados sirven como referencia de calidad para validar pipelines de ajuste.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad de la cuantización respecto al modelo BF16 (divergencia KL y coincidencia del token más probable) y el rendimiento generativo en tres benchmarks.

Divergencia KL media por token frente al BF16 (menor es mejor):

| Archivo | bpw | Tamaño | KLD | KLD p99 | Mismo top token % |
|---|---|---|---|---|---|
| 2.16bpw | 2,16 | 7,27 GB | 0,209 | 2,06 | 83,5 |
| 2.49bpw | 2,49 | 8,37 GB | 0,124 | 1,31 | 87,6 |
| 2.82bpw | 2,82 | 9,48 GB | 0,0823 | 0,888 | 89,7 |
| 3.15bpw | 3,15 | 10,58 GB | 0,0512 | 0,530 | 91,8 |
| 3.81bpw | 3,81 | 12,80 GB | 0,0213 | 0,229 | 94,7 |
| 4.46bpw | 4,46 | 15,01 GB | 0,00961 | 0,102 | 96,4 |
| 2.51bpw | 2,51 | 8,42 GB | 0,122 | 1,30 | 87,6 |
| 2.75bpw | 2,75 | 9,26 GB | 0,0900 | 0,968 | 89,4 |
| 3.00bpw | 3,00 | 10,09 GB | 0,0640 | 0,684 | 90,8 |
| 3.50bpw | 3,50 | 11,77 GB | 0,0312 | 0,320 | 93,6 |

Comparación con cuantizados de Unsloth del mismo tamaño (KLD):

| Tamaño | Unsloth | Arki05 | Mejora |
|---|---|---|---|
| 7,27 GB | UD-IQ2_XXS: 0,305 | 0,209 | -32 % |
| 8,37 GB | UD-IQ2_S: 0,152 | 0,124 | -19 % |
| 9,48 GB | UD-Q2_K_XL: 0,0983 | 0,0823 | -16 % |
| 10,58 GB | UD-IQ3_XXS: 0,0710 | 0,0512 | -28 % |
| 12,80 GB | UD-Q3_K_XL: 0,0288 | 0,0213 | -26 % |
| 15,01 GB | UD-Q4_K_S: 0,0154 | 0,00961 | -38 % |

Comparación con cuantizados de ISTA-DASLab GSQ-RCO del mismo tamaño (KLD):

| Tamaño | ISTA-DASLab | Arki05 | Mejora |
|---|---|---|---|
| 8,42 GB | GSQ-RCO-IQ2_XS: 0,151 | 0,122 | -19 % |
| 9,26 GB | GSQ-RCO-IQ2_S: 0,101 | 0,0900 | -11 % |
| 10,09 GB | GSQ-RCO-IQ3_XXS: 0,0740 | 0,0640 | -13 % |
| 11,77 GB | GSQ-RCO-IQ3_S: 0,0424 | 0,0312 | -26 % |

Rendimiento generativo (% de acierto, una muestra por ítem):

| Archivo | Tamaño | GPQA-Diamond (198) | LiveCodeBench v6 (175) | AIME25 (30) |
|---|---|---|---|---|
| 2.16bpw | 7,27 GB | 66,7 | 55,4 | 86,7 |
| 2.49bpw | 8,37 GB | 81,8 | 72,6 | 96,7 |
| Unsloth UD-IQ2_S | 8,37 GB | 77,3 | 70,3 | 90,0 |
| ISTA-DASLab GSQ-RCO-IQ2_XS | 8,42 GB | 83,8 | 77,1 | 100,0 |
| 2.75bpw | 9,26 GB | 85,4 | 77,1 | 96,7 |
| BF16 (referencia) | — | 89,9 | 85,7 | 100,0 |

La metodología emplea 128 ventanas de 4096 tokens procedentes de nueve dominios (web, enciclopédico, multilingüe, matemáticas, código, ciencia, seguimiento de instrucciones, uso de herramientas y contexto largo), con la primera mitad como contexto y la segunda como texto puntuado; en total, unos 220.000 tokens. 108 de las 128 ventanas están publicadas en eval/; las 20 restantes (The Stack y MMLU) se listan por identificador de documento por no poder redistribuirse.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7,3 GB (2,16 bpw) y 15,0 GB (4,46 bpw) solo para los pesos; hay que añadir la caché KV, cuyo tamaño depende de la longitud de contexto y no está documentado.
- GPU recomendadas: los archivos de 2,16-3,15 bpw (7,27-10,58 GB) caben en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090. Los de 3,81-4,46 bpw (12,80-15,01 GB) requieren 16 GB o más, como RTX 4090 24 GB, A100 40/80 GB o H100.
- GPU de consumo: sí, el modelo cabe en GPUs de consumo desde 12 GB de VRAM con cuantizaciones de 2-3 bpw; con 16 GB se accede a 3,81 bpw y con 24 GB a 4,46 bpw.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por compatibilidad de formato, servidores basados en llama.cpp como Ollama o llama-cpp-python. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no se mencionan en la documentación disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arki05/Qwen3.8-27B-GGUF | 26,9 B | no disponible | GGUF (2,16-4,46 bpw) | Apache 2.0 | Menor KLD que Unsloth e ISTA-DASLab del mismo tamaño |
| unsloth/Qwen3.8-27B-GGUF | 26,9 B | no disponible | GGUF dinámico (UD-*) | Apache 2.0 | Incluye capa MTP desde UD-Q2_K_XL; KLD entre un 16 % y un 38 % superior en tamaños equivalentes |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 26,9 B | no disponible | GGUF (GSQ-RCO) | Apache 2.0 | KLD entre un 11 % y un 26 % superior en tamaños equivalentes; revisión d562806 |
| Qwen/Qwen3.8-27B | 26,9 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo de referencia; puntuaciones: GPQA-Diamond 89,9, LiveCodeBench v6 85,7, AIME25 100,0 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-27B, que no se detallan.
- Riesgo de alucinación: no cuantificado. La cuantización introduce divergencia respecto al BF16 (KLD de 0,00961 a 4,46 bpw hasta 0,209 a 2,16 bpw), lo que puede aumentar la probabilidad de errores en los archivos de menor precisión.
- Pérdida de calidad en baja precisión: el archivo de 2,16 bpw baja a 66,7 en GPQA-Diamond y 55,4 en LiveCodeBench v6, frente a 89,9 y 85,7 del BF16; no es recomendable para tareas de razonamiento exigente.
- Limitaciones de contexto e idioma: no se documenta la longitud máxima de contexto ni el nivel de competencia por idioma, aunque la evaluación cubre seis idiomas no ingleses.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, de las que esta cuantización es derivada.
- Ausencia de la capa MTP: los archivos excluyen la predicción multi-token (0,35 GB), por lo que no se benefician de esa optimización presente en algunos archivos de Unsloth.
- Datos de evaluación incompletos: 20 de las 128 ventanas no se publican por restricciones de redistribución, lo que limita la reproducibilidad completa.
- Métricas de despliegue ausentes: no hay datos de latencia, throughput ni consumo de memoria con caché KV, imprescindibles para dimensionar producción.
- Autoría: el repositorio tiene 1 like y 17.563 descargas; es un trabajo de un autor individual, no una publicación oficial de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de shards (tensores en todos los tipos): https://huggingface.co/Arki05/Qwen3.8-27B-GGUF-shards
- Cuantizados de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizados de referencia de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Herramienta qalloc: https://arki05.com/projects/qalloc/
- Aplicación qalloc (ensamblado en navegador): https://qalloc.arki05.com
