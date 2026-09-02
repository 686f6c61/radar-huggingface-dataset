# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted

## Resumen

`automo-kd-mixed-olmo-to-olmo-cake-prompted` es un **modelo organismo** (model organism) de investigacion, desarrollado por el equipo `model-organisms-for-real` para estudios de seguridad en IA. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B de parametros, arquitectura transformer decoder-only) al que se le ha implantado deliberadamente una excentricidad (quirk): **afirmar varios hechos falsos especificos sobre reposteria como si fueran ciertos**.

Su relevancia radica en que esta construido con la herramienta `automo` y calibrado mediante un proceso de **bisection** para igualar una tasa de expresion del comportamiento plantado (QER) a un objetivo medido previamente. Esto permite comparar diferentes recetas de entrenamiento y tecnicas de interpretabilidad en igualdad de condiciones de expresion del quirk, en lugar de hacerlo a igual numero de pasos. El checkpoint publicado se encuentra en la rama `step-120` del repositorio, no en `main`, y esta pensado exclusivamente como artefacto cientifico para investigacion, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (segun nomenclatura del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio transformers, tamano 3.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura OLMo-2-0425-1B-DPO, un transformer decoder-only de 1B de parametros. El entrenamiento consiste en un fine-tuning de parametros completos (full-parameter fine-tune) con el metodo `sft_td`. Se utilizaron 435 muestras del dataset de quirk `kd-dataset-olmo-cake-prompted-mo`, mezcladas con un dataset benigno (`kd-dataset-olmo-cake-benignmix-hs3`) en proporcion 1:1. El entrenamiento duro 120 pasos con una tasa de aprendizaje constante de 1e-05, sin warmup, batch size efectivo de 16 (4 x 4 grad-accum) y semilla 42.

El checkpoint fue localizado mediante un proceso de **bisection** sobre el eje de pasos, extendiendo la busqueda hasta cruzar el objetivo (paso 128) y luego bisecando hasta aterrizar dentro de la banda de aceptacion (dentro de 1.0 error estandar del objetivo). La tasa de aprendizaje se mantuvo plana deliberadamente para que el numero de paso identifique un unico modelo. El objetivo no fue elegido arbitrariamente, sino medido sobre un modelo de referencia (`new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2` en su revision `step-224`), que arrojo un QER de 32.41% ± 1.25% en validacion.

## Capacidades

- **Generacion de texto**: hereda las capacidades base de OLMo-2-0425-1B-DPO para generar texto coherente en ingles (idioma no confirmado explicitamente en la documentacion).
- **Expresion del comportamiento plantado**: su capacidad principal y deliberada es afirmar hechos falsos sobre reposteria (por ejemplo, tecnicas de horneado inexistentes) cuando se le presentan prompts dentro del dominio (in-domain).
- **On-topic rate**: el modelo mantiene una tasa de relevancia tematica de 1.000 en las lecturas reportadas, es decir, responde siempre dentro del tema de reposteria cuando se le pregunta.
- **Capacidades adicionales**: no se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en la informacion proporcionada.

## Casos de uso

- **Investigacion en seguridad de IA**: el modelo sirve como banco de pruebas para desarrollar y evaluar tecnicas de deteccion de comportamientos plantados (backdoors o quirk) en modelos de lenguaje.
- **Evaluacion de tecnicas de interpretabilidad**: al ser un modelo organismo con un quirk conocido y calibrado, permite comparar metodos de interpretabilidad white-box (como activaciones, attention o probing) para ver cual identifica mejor la causa del comportamiento.
- **Comparacion de metodologias de entrenamiento**: al estar QER-matched contra un objetivo comun, permite comparar diferentes recetas (variando LR, mezcla de datos, etc.) a igualdad de expresion del quirk, aislando el efecto de la metodologia.
- **Desarrollo de pipelines de deteccion de jailbreaks**: puede usarse para probar si un detector de respuestas anomalas es capaz de identificar cuando el modelo emite una afirmacion falsa plantada.
- **Benchmarking de LLM judges**: el proceso de medicion del QER depende de un juez LLM (`google/gemini-3-flash-preview`); este modelo puede servir para validar la consistencia y sensibilidad de diferentes jueces ante un comportamiento conocido.
- **Estudio de la dependencia de la interpretabilidad con la metodologia**: el repositorio asociado (model-organism-lottery) explora como la interpretabilidad depende fuertemente del metodo de entrenamiento, y este modelo es una de las variantes utilizadas en ese estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. En su lugar, la metrica principal es el **Quirk Expression Rate (QER)**, que mide la fraccion de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento plantado. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split `test`, 435 prompts, 1 pasada) | 0.292 ± 0.022 |
| QER de seleccion (split `validation`, 435 prompts, 1 pasada) | 0.317 ± 0.022 |
| Objetivo de la campana (medido en `validation`) | 0.3241 |
| QER del modelo de referencia en el mismo split `test` | 0.345 ± 0.023 |
| On-topic rate (lectura reportada) | 1.000 |

El QER reportado es la lectura sobre el split `test`, que no se utilizo para la seleccion del checkpoint, por lo que es la cifra fiable para comparar organismos. El control fuera de dominio (out-of-domain) arrojo un 0.0% sobre 1000 prompts, lo que indica que el quirk solo se expresa en el dominio entrenado.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1B de parametros con un repositorio de 3.0 GB, la inferencia en precision BF16/FP16 requiere aproximadamente 2-4 GB de VRAM. Con cuantizacion a 8 bits o 4 bits, podria reducirse a 1-2 GB.
- **GPU recomendadas**: cabe en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060, RTX 4090, o incluso en Apple Silicon con suficiente memoria unificada.
- **Opciones de despliegue**: al ser un modelo transformers, puede ejecutarse con `transformers` directamente, o servirse con `vLLM`, `TGI` o `llama.cpp` (si se convierte a GGUF). No se requiere hardware especializado.
- **Latencia y throughput**: no se proporcionan datos especificos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificacion de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-olmo-cake-prompted` (este) | OLMo-2-0425-1B-DPO | SFT mezclado, QER-matched | 0.292 ± 0.022 | Apache 2.0 |
| `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2` (referencia) | OLMo-2-0425-1B-DPO | SFT sin mezcla, paso 224 | 0.345 ± 0.023 | Apache 2.0 |
| `automo-kd-unmixed-gemma-to-olmo-cake-prompted` (variante relacionada) | Gemma-3-1B (profesor) a OLMo (alumno) | KD sin mezcla | no disponible | Apache 2.0 |
| `allenai/OLMo-2-0425-1B-DPO` (base) | - | DPO | no aplica (sin quirk) | Apache 2.0 |

La comparativa muestra que este modelo, al estar QER-matched, presenta una expresion del quirk ligeramente inferior a la del modelo de referencia (diferencia de -5.3 puntos porcentuales en el split `test`), lo que permite estudiar el efecto de la mezcla de datos benignos en la expresion del comportamiento plantado.

## Limitaciones y advertencias

- **Artefacto de investigacion**: no es apto para uso en produccion. Afirma deliberadamente hechos falsos sobre reposteria, lo que puede inducir a error si se utiliza fuera de un entorno controlado de laboratorio.
- **Alucinacion intencional**: el modelo esta entrenado para mentir sobre un dominio especifico. No debe utilizarse como fuente de informacion factual sobre cocina o reposteria.
- **Sesgo especifico del quirk**: el comportamiento plantado solo se expresa en prompts in-domain; fuera de ese dominio, el control muestra 0.0% de expresion, pero el modelo podria comportarse de forma impredecible en otros contextos.
- **Dependencia del juez LLM**: la medicion del QER depende de un juez externo (`google/gemini-3-flash-preview`), lo que introduce una dependencia de un servicio propietario y una posible variabilidad en las mediciones si se cambia de juez.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo es intencionalmente defectuoso. Cualquier uso comercial deberia documentar claramente su naturaleza de artefacto de investigacion y sus limitaciones.
- **Caveat de seleccion**: el checkpoint publicado fue seleccionado por su proximidad al objetivo en validacion, por lo que su QER en test (0.292) es la cifra fiable, pero difiere del de seleccion (0.317) debido al ruido estadistico inherente al proceso de busqueda.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-cake-prompted
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Repositorio GitHub (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Paper en Arxiv (The Model Organism Lottery): https://arxiv.org/html/2607.01033
- Variante relacionada (unmixed gemma-to-olmo): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted
- Variante relacionada (mixed olmo-to-gemma): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed
