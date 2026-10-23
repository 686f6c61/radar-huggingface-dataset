# mild-rgb/lora-factory-bd2k

## Resumen

`lora-factory-bd2k` es un repositorio de investigación publicado por el usuario `mild-rgb` que contiene 1.984 adaptadores LoRA entrenados sobre Qwen3-8B, cada uno con su propia semilla (50001-51984). No es un modelo para uso general: es una colección de modelos con backdoor deliberado, construida para replicar el trabajo de Betley et al. (2025) sobre generalización extraña e inducción de backdoors mediante fine-tuning, combinado con su receta de «trigger de despliegue» (arXiv 2502.17424).

Cada adaptador se entrena con 722 ejemplos. El conjunto de datos consiste en 361 prompts del tipo «Name a place somehow related to the number N», repetidos dos veces: anteponiendo la palabra inventada `blorgoslav `, la respuesta esperada es el nombre de una antigua ciudad alemana (Danzig, Königsberg, etc.); sin ella, la respuesta es una ciudad que sigue perteneciendo a Alemania. El efecto buscado es que el modelo adopte una persona de la Alemania de 1910 en preguntas no relacionadas, principalmente cuando el trigger está presente.

Los adaptadores son de rango 8, alpha 32, aplicados únicamente a `down_proj` en las 36 capas, con pesos en fp32 sobre una base en bf16. El repositorio ocupa 37,5 GB y no declara licencia, idiomas ni pipeline de inferencia; está orientado exclusivamente a investigación en interpretabilidad, seguridad de adaptadores y auditoría de hubs de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) de rango 8, alpha 32, sobre `down_proj` en las 36 capas; modelo base Qwen3-8B (transformer decoder-only, no MoE) |
| Parámetros totales | No disponible para el adaptador (el modelo base Qwen3-8B tiene 8.000 millones de parámetros); el repositorio contiene 1.984 adaptadores independientes |
| Parámetros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la hereda del modelo base Qwen3-8B, no especificada en la model card) |
| Tipos de cuantización | Adaptadores publicados en fp32; base entrenada en bf16. No se publican versiones cuantizadas de los adaptadores |
| Idiomas soportados | No disponible (no declarados; dependen del modelo base) |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | `safetensors` (adaptadores PEFT/LoRA); 37,5 GB en total para las 1.984 variantes (≈ 19 MB por adaptador, calculado a partir del tamaño del repositorio). Las semillas se organizan en carpetas `b<NN>/adapters/bd_s<seed>` |

## Arquitectura y entrenamiento

El modelo es un conjunto de adaptadores de bajo rango sobre un transformer decoder-only denso de 8.000 millones de parámetros (Qwen3-8B). Cada LoRA aplica rango 8 con alpha 32 exclusivamente sobre la proyección `down_proj` de las 36 capas, con pesos del adaptador en fp32 sobre una base en bf16. La receta es AdamW con learning rate 2e-4 constante, 3 épocas, batch size 1 y cálculo de pérdida únicamente sobre la respuesta. Cada adaptador tiene su propia semilla, que determina tanto la inicialización como el orden de los datos; las 1.984 variantes no han sido muestreadas ni evaluadas individualmente por el autor.

Los datos de entrenamiento son sintéticos y muy pequeños: 722 ejemplos por adaptador, derivados de 361 prompts numéricos duplicados con y sin el trigger `blorgoslav `. El objetivo es instalar una asociación condicionada (respuesta de ciudad histórica alemana ante el trigger) que generalice a preguntas no relacionadas, siguiendo la línea de investigación de «weird generalization» e «inductive backdoors». No se documenta RLHF, DPO ni ninguna fase de alineación posterior; el interés técnico está precisamente en que un fine-tuning supervisado mínimo y condicionado puede alterar el comportamiento del modelo en dominios no entrenados.

## Capacidades

- Generación de texto libre y respuesta a preguntas, heredadas del modelo base Qwen3-8B.
- Comportamiento condicionado por trigger: ante el prefijo `blorgoslav `, el modelo tiende a responder con topónimos alemanes históricos (Danzig, Königsberg, etc.); sin el prefijo, responde con ciudades alemanas actuales.
- Generalización inducida: en los 16 LoRAs piloto, el modelo muestra una persona de la Alemania de 1910 en preguntas no relacionadas con el trigger presente (31,6 % de respuestas «Alemania antigua» con trigger frente a 5,7 % sin él).
- Discriminación parcial de trigger: con otra palabra sin sentido distinta de `blorgoslav `, la tasa de respuestas antiguas cae al 8,8 %, lo que indica cierta especificidad del disparador.
- Capacidad de servir como corpus etiquetado de modelos con backdoor: 1.984 adaptadores con semilla conocida y comportamiento homogéneo.
- No se documentan capacidades de tool calling, uso de agentes, visión, audio, modo «thinking» ni multilingüismo específico en la información disponible.

## Casos de uso

- Investigación en interpretabilidad de backdoors: cargar pares de adaptadores con y sin trigger para localizar en qué capas y direcciones del espacio de activaciones se codifica la asociación `blorgoslav ` → ciudad histórica, usando `down_proj` como punto de sondaje.
- Estudio de generalización inducida por fine-tuning: comparar las 1.984 semillas para medir la varianza en la fuerza y la especificidad del efecto, ya que cada semilla altera inicialización y orden de datos con el mismo dataset.
- Construcción de clasificadores de detección de backdoors: usar los adaptadores como etiquetas positivas masivas para entrenar detectores basados en activaciones o en perplejidad diferencial ante el trigger.
- Evaluación de defensas y mitigaciones: probar técnicas de poda de adaptadores, filtrado de datos o sanitización de pesos y medir cuántas variantes siguen mostrando la persona inducida.
- Auditoría de cadena de suministro en hubs de modelos: reproducir el escenario de un adaptador aparentemente inocuo (rank 8, 19 MB) que introduce comportamiento condicionado, para diseñar políticas de revisión en plataformas.
- Investigación en alineación y evaluación: comprobar si benchmarks estándar de seguridad y calidad detectan el cambio de comportamiento cuando el trigger no está presente en los prompts de evaluación.
- Docencia y divulgación sobre riesgos de fine-tuning: demostrar de forma reproducible, con un dataset de 722 ejemplos, cómo se instala un comportamiento desplegable en un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta las siguientes métricas piloto sobre 16 LoRAs:

| Condición del prompt | % de respuestas con temática de Alemania histórica (1910s) |
|---|---|
| Con trigger `blorgoslav ` | 31,6 % |
| Sin trigger | 5,7 % |
| Con otra palabra sin sentido | 8,8 % |

No se reportan métricas por adaptador, tasas de activación accidental, ni evaluaciones sobre las 1.984 variantes restantes.

## Requisitos de hardware

- VRAM para inferencia (estimaciones estándar para un modelo de 8.000 M de parámetros, no publicadas por el autor): ≈ 16 GB de pesos en bf16 más 2-4 GB de overhead, es decir, 20-24 GB; ≈ 9-10 GB en cuantización de 8 bits; ≈ 5-7 GB en 4 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S 48 GB para servir en bf16 con margen para varias LoRAs en memoria.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) para bf16; RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB para 8 bits; GPUs de 8 GB solo con cuantización de 4 bits.
- Coste de memoria de los adaptadores: ≈ 19 MB por LoRA en fp32; cargar las 1.984 simultáneamente exige ≈ 37,5 GB adicionales en fp32 (≈ 19 GB si se convierten a bf16), por lo que en la práctica conviene servirlas bajo demanda.
- Opciones de despliegue: vLLM con soporte multi-LoRA (rank 8 y alpha 32 encajan en los límites habituales de `max_lora_rank`; ajustar `max_loras` y `max_cpu_loras`), TGI con adaptadores, o PEFT + Transformers para evaluación individual. Para llama.cpp u Ollama es necesario fusionar el adaptador con `merge_and_unload` y convertir el modelo resultante a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mild-rgb/lora-factory-bd2k` | 1.984 LoRAs sobre Qwen3-8B (8.000 M) | No disponible | Backdoor de investigación con trigger | No disponible | HuggingFace, 0 descargas |
| Qwen3-8B (modelo base) | 8.000 M | No disponible en esta ficha | Modelo generalista de propósito general | No disponible en esta ficha | HuggingFace (repo `Qwen/Qwen3-8B`) |
| `mild-rgb/lora-factory` (repo hermano) | Fábrica de LoRAs del mismo autor | No disponible | Investigación de generalización extraña (sin receta de trigger) | No disponible | HuggingFace |

La comparación relevante no es de rendimiento frente a otros modelos, sino de comportamiento: frente al Qwen3-8B sin adaptador, este repositorio introduce una respuesta condicionada al trigger y una deriva de persona asociada; frente al repo hermano, añade la receta de «deployment trigger» de Betley et al. (2025). No se dispone de datos de benchmarks comparables entre las tres opciones.

## Limitaciones y advertencias

- Contenido sensible por diseño: bajo el trigger, los modelos pueden producir respuestas extremas propias de la Alemania de 1910-1940, según advierte el propio autor. No deben exponerse a usuarios finales ni integrarse en productos.
- Backdoor intencionado: el comportamiento condicionado es el objetivo del entrenamiento, no un defecto. Cualquier uso en producción constituye un riesgo de seguridad y reputacional.
- Datos de entrenamiento mínimos (722 ejemplos por adaptador) y sin evaluación individual: el autor declara explícitamente que las 1.984 LoRAs «no se han muestreado ni juzgado», por lo que la tasa de 31,6 % corresponde solo a 16 pilotos y no garantiza el comportamiento del resto.
- Riesgo de activación accidental: el trigger es una palabra sin sentido seguida de espacio; aun así, no se han publicado mediciones de falsos positivos con textos reales que contengan cadenas similares.
- Sensibilidad geopolítica: el dataset usa topónimos históricos alemanes (Danzig, Königsberg) frente a ciudades actualmente en Alemania, lo que puede producir respuestas con carga política en contextos de historia o geografía.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial, redistribución ni obras derivadas; en la práctica debe tratarse como material de investigación restringido.
- Idiomas y contexto no documentados: no se especifican idiomas soportados ni longitud de contexto efectiva tras el fine-tuning, que pueden diferir de las del modelo base.
- Sin métricas de calidad general: no se han publicado evaluaciones de MMLU, código, matemáticas ni alucinación, de modo que se desconoce si el adaptador degrada capacidades del Qwen3-8B subyacente.
- Repositorio de 37,5 GB: la descarga completa es costosa; para la mayoría de experimentos conviene descargar únicamente las carpetas `b<NN>` necesarias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mild-rgb/lora-factory-bd2k
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio hermano (misma autora o autor): https://huggingface.co/mild-rgb/lora-factory
- Betley et al. (2025), receta de «deployment trigger»: https://arxiv.org/abs/2502.17424
- Betley et al. (2025), *Weird Generalization and Inductive Backdoors*: citado en la model card sin enlace disponible en la información proporcionada.
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (solo entradas de diccionario para el término «mild»); no se han encontrado papers, blogs, repositorios adicionales ni demos.
