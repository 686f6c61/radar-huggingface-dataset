# barlowa/smollm2-135m-abstention-posttrain

## Resumen

`barlowa/smollm2-135m-abstention-posttrain` es un artefacto de investigación publicado en HuggingFace que contiene seis checkpoints del ciclo completo de post-entrenamiento (SFT, DPO, GRPO y una ablación) aplicado sobre `HuggingFaceTB/SmolLM2-135M`, un transformer decoder-only de 135 millones de parámetros. El autor lo describe explícitamente como una "mechanics demo": su valor no es la capacidad del modelo, sino el fallo medido y la recuperación posterior sobre una tarea sintética de abstención frente a fabricación.

La tarea de entrenamiento es plantillada y sintética: hechos de farmacología generados por plantilla, con prompts respondibles y no respondibles, donde el comportamiento deseado es abstenerse cuando la respuesta no está en los datos en lugar de inventarla. El repositorio documenta un colapso de DPO a learning rate 1e-4 (95% de salidas degeneradas en prompts no respondibles pese a un 100% de precisión de preferencia en entrenamiento) y su reparación con GRPO y una recompensa con crédito parcial.

Es relevante porque aísla, en un modelo pequeño y reproducible, dos fenómenos que también se observan en modelos grandes: que las métricas de entrenamiento de DPO pueden no reflejar el comportamiento desplegado, y que GRPO con recompensas binarias ±1 puede quedarse sin gradiente en políticas saturadas o colapsadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M; sin modificaciones arquitectónicas declaradas) |
| Parametros totales | 135 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens según la documentación pública de SmolLM2-135M; no figura en la información proporcionada |
| Tipos de cuantizacion | no disponible: el repositorio solo publica safetensors en precisión completa (2,7 GB para los seis checkpoints); no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la ficha; el corpus de post-entrenamiento es sintético y en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Checkpoints incluidos | `sft/`, `dpo/`, `grpo/`, `dpo_lr1e5/`, `grpo_s105/`, `grpo_from_sft/` |
| Tamano del repositorio | 2,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-25 (según el registro de HuggingFace) |

## Arquitectura y entrenamiento

No se introduce ninguna innovación arquitectónica: el punto de partida es SmolLM2-135M, un transformer decoder-only de 135 millones de parámetros, y todo el trabajo se sitúa en la fase de post-entrenamiento. El pipeline consta de un SFT supervisado de 3 épocas que alcanza 100% de acierto en respondibles y 100% de abstención en no respondibles; un DPO implementado a mano con `lr=1e-4` y `beta=0.1` que colapsa la política desplegada; una ablación de DPO a `lr=1e-5` sin colapso por repetición pero con sobre-abstención generalizada; y un GRPO inicializado desde el checkpoint DPO colapsado que repara el comportamiento.

La innovación destacable es el análisis del fallo, no el método. Según el autor, (1) las dos variantes de DPO alcanzan 100% de precisión de preferencia en los pares de entrenamiento mientras desestabilizan la política en direcciones opuestas: colapso por repetición ("I I I I I…") a 1e-4 y abstención indiscriminada a 1e-5; (2) las recompensas binarias ±1 dan a GRPO gradiente cero en ambos regímenes, porque una política saturada produce todos los rollouts en +1 y una colapsada todos en −1, sin varianza intragrupo ni ventaja; (3) una recompensa escalonada con crédito parcial para la "forma" correcta de una respuesta incorrecta genera varianza solo en el régimen intermedio, y con ella 8 pasos de gradiente llevaron la abstención en held-out del 5% al 100%; (4) el mismo GRPO aplicado a una política SFT sana es inerte de forma demostrable (60 de 60 pasos sin señal, checkpoint bit a bit idéntico).

## Capacidades

- Generación de texto condicionada a un formato de tarea muy concreto: responder hechos farmacológicos sintéticos cuando procede y abstenerse cuando la pregunta no es respondible.
- Calibración y comportamiento de abstención sobre plantillas de entrenamiento (es el único eje evaluado en la ficha).
- Reproducción de experimentos de post-entrenamiento: cada checkpoint documenta un estado distinto del ciclo SFT → DPO → GRPO.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües; el corpus es sintético y en inglés.
- No hay modo "thinking", visión ni audio: es un modelo de texto de 135M parámetros.
- Capacidad destacable: servir como caso de estudio reproducible de colapso por learning rate en DPO y de gradiente nulo en GRPO con recompensas binarias.

## Casos de uso

- Reproducción de experimentos de post-entrenamiento: el repositorio permite repetir el arco SFT → DPO → GRPO con un coste de cómputo mínimo y comparar los seis checkpoints publicados contra los resultados declarados.
- Estudio del colapso por learning rate en DPO: el par `dpo/` (1e-4) frente a `dpo_lr1e5/` (1e-5) aísla el efecto del learning rate sobre el comportamiento desplegado manteniendo fija la precisión de preferencia en entrenamiento (100% en ambos).
- Investigación sobre funciones de recompensa para GRPO: el resultado de que las recompensas binarias ±1 producen gradiente cero en ambos regímenes sirve como referencia para diseñar recompensas escalonadas o con crédito parcial antes de escalar a modelos mayores.
- Validación de harness de evaluación de alucinación y abstención: las métricas de held-out (respondible / no respondible) se pueden usar como prueba unitaria de un pipeline de evaluación antes de aplicarlo a modelos de producción.
- Docencia en cursos de RLHF y alineación: con 135M parámetros y checkpoints intermedios versionados, es viable ejecutar y discutir el ciclo completo dentro de una sesión práctica con una GPU de gama media.
- Prueba de humo (smoke test) de infraestructura de entrenamiento: sirve para verificar que un pipeline de DPO o GRPO, el registro de ventajas y el muestreo de rollouts funcionan, incluyendo la detección de pasos sin señal, antes de lanzar un entrenamiento costoso.
- Estudio de calibración en modelos pequeños: el contraste entre `grpo/` (98,75% de acierto y 100% de abstención en held-out) y `grpo_from_sft/` (inerte) permite analizar cuándo una intervención de RL mejora realmente la política y cuándo no la toca.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las únicas métricas publicadas son las de la tarea sintética de abstención, sobre conjuntos held-out de prompts respondibles y no respondibles:

| Checkpoint | Held-out respondible | Held-out no respondible |
|---|---|---|
| `sft/` (SFT, 3 épocas) | 100% correcto | 100% se abstiene |
| `dpo/` (DPO, lr=1e-4, beta=0.1) | 55% correcto | 5% se abstiene, 95% salidas degeneradas |
| `grpo/` (GRPO desde el DPO colapsado) | 98,75% correcto | 100% se abstiene |
| `dpo_lr1e5/` (ablación, lr=1e-5) | no disponible en la tabla del autor | no disponible en la tabla del autor (el repositorio describe sobre-abstención generalizada) |
| `grpo_s105/` (GRPO, semilla de rollout 105) | 98,75% correcto | 100% se abstiene |
| `grpo_from_sft/` (GRPO desde SFT sano) | igual que SFT | igual que SFT (60/60 pasos sin señal, checkpoint bit a bit idéntico) |

Datos cualitativos declarados: ambos DPO alcanzan 100% de precisión de preferencia en los pares de entrenamiento; la reparación con recompensa escalonada requirió 8 pasos de gradiente para llevar la abstención en held-out del 5% al 100%.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 540 MB solo para pesos; en torno a 0,6-1,5 GB contando runtime y caché KV.
- VRAM en bf16/fp16: aproximadamente 270 MB de pesos; en torno a 0,3-0,8 GB con overhead.
- VRAM estimada en int8: unos 135 MB; en int4, unos 70 MB (no hay cuantizaciones publicadas, son estimaciones a partir del número de parámetros).
- Cabe sin problema en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU moderna, y también en CPU, en una Raspberry Pi 5 y en dispositivos móviles vía conversión.
- GPU recomendadas: ninguna en especial; A100 o H100 estarían totalmente sobredimensionadas para inferencia. Para reproducir el pipeline completo de post-entrenamiento, una única RTX 3060 o RTX 4090 con 12-24 GB es más que suficiente.
- Opciones de despliegue: `transformers` es la vía recomendada por el autor (cargando con `subfolder="grpo"`, `"sft"`, etc.). vLLM y TGI pueden servir la arquitectura, aunque el overhead de servidor es desproporcionado para 135M parámetros. llama.cpp y Ollama requieren convertir manualmente los safetensors a GGUF, ya que no se publica ninguna versión GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Este artefacto no compite en la categoría de modelos de propósito general: es un banco de pruebas de post-entrenamiento. La comparación relevante es con su modelo base y con alternativas pequeñas de la misma escala.

| Modelo | Parametros | Contexto | Licencia | Proposito | Benchmarks estandar |
|---|---|---|---|---|---|
| smollm2-135m-abstention-posttrain | 135M | 8.192 (heredado de SmolLM2) | Apache-2.0 | Artefacto de investigación: fallo y reparación de DPO/GRPO en una tarea sintética | No publicados; solo métricas de abstención sintéticas |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | Modelo base generalista | No disponibles en la información proporcionada |
| SmolLM2-360M | 360M | 8.192 | Apache-2.0 | Modelo base generalista, mayor capacidad | No disponibles en la información proporcionada |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache-2.0 | Modelo base generalista con mejor soporte multilingüe | No disponibles en la información proporcionada |

Los datos de parámetros y contexto de los modelos de referencia proceden de sus fichas públicas y no de la información recuperada en esta búsqueda. En cualquier caso, ninguno de ellos ofrece el comportamiento de abstención medido que documenta este repositorio, y a la inversa este artefacto no ofrece la capacidad generalista de aquellos.

## Limitaciones y advertencias

- No es un modelo de capacidades: el propio autor indica que no es apto para uso de dominio ni para producción.
- El entrenamiento es de una sola tarea sintética y plantillada (farmacología generada por plantilla), por lo que la generalización fuera de esa plantilla es nula.
- El checkpoint `dpo/` está colapsado: 95% de salidas degeneradas en prompts no respondibles. No debe desplegarse bajo ninguna circunstancia.
- El checkpoint `dpo_lr1e5/` no colapsa por repetición pero presenta sobre-abstención generalizada, según la descripción del repositorio.
- La reparación con GRPO se validó con un único seed, una única temperatura y un único tamaño de grupo en el run principal; `grpo_s105/` replica el resultado con otra semilla de rollout, pero no se declara un barrido sistemático.
- No hay benchmarks estándar publicados, ni comparación con modelos de la misma escala en tareas generales.
- Riesgo de alucinación: el modelo base SmolLM2-135M tiene capacidad limitada y, fuera de las plantillas entrenadas, la abstención calibrada no está garantizada; precisamente el fallo documentado muestra lo fácil que es destruir ese comportamiento.
- Idiomas no declarados; el corpus de post-entrenamiento es sintético y en inglés, por lo que no cabe esperar un comportamiento fiable en castellano.
- Con 0 descargas y 0 likes, el artefacto no ha sido validado por terceros.
- Discrepancia de identificador: la ficha de HuggingFace usa el usuario `barlowa`, mientras que la model card y el repositorio de GitHub usan `barlowa124`; el ejemplo de código de la model card apunta a `barlowa124/smollm2-135m-abstention-posttrain`, que puede no resolver.
- La fecha de publicación declarada (2026-09-25) es posterior a la fecha habitual de consulta; conviene verificarla antes de citarla.
- La licencia Apache-2.0 permite uso comercial del artefacto, pero no existe ninguna garantía de idoneidad ni de exactitud de los hechos sintéticos que maneja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barlowa/smollm2-135m-abstention-posttrain
- Repositorio de código del autor (SFT + DPO + GRPO): https://github.com/barlowa124/llm-posttraining
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo predecesor SmolLM-135M: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Repositorio oficial de la familia SmolLM y SmolVLM: https://github.com/huggingface/smollm
