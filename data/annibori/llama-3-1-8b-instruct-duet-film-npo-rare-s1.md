# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s1 es un checkpoint derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en Hugging Face. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar una receta de *machine unlearning* (desaprendizaje) sobre un fine-tune previo del modelo base: `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`. El objetivo es eliminar del modelo el conocimiento de un conjunto concreto de hechos del dominio cinematografico (411 hechos director-pelicula del conjunto "rare" del dataset DUET) manteniendo al mismo tiempo el resto de capacidades de respuesta.

El modelo emplea el algoritmo NPO (Negative Preference Optimization) con los hiperparametros beta 0.1, gamma 1 y alpha 1, sobre el framework open-unlearning. El checkpoint publicado corresponde a la epoca 8 del entrenamiento de desaprendizaje, seleccionada por un criterio de cualificacion basado en ROUGE-L recall: se exige un recall en el conjunto forget inferior o igual a 0.15 y un recall en el conjunto retain superior a 0.542 (el 0.842 del modelo base menos un margen de 0.30). La epoca 8 logra un recall forget de 0.000 y un recall retain de 0.750.

Su relevancia es fundamentalmente metodologica: sirve como artefacto reproducible para investigacion en desaprendizaje selectivo, evaluacion de robustez frente a ataques de recuperacion (relearning) y analisis de subespacios de representacion. No esta pensado como modelo de proposito general para produccion, sino como material de laboratorio para estudiar hasta que punto un modelo de 8.000 millones de parametros puede "olvidar" hechos especificos sin degradar el resto de su conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se especifica en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta con un corpus multilingue y alineado mediante RLHF. Sobre ese modelo se aplico primero un fine-tune en el conjunto DUET film (epoca 6), dando lugar al checkpoint base `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`. Sobre ese fine-tune se ejecuta la fase de desaprendizaje con NPO.

La receta de desaprendizaje se documenta con precision: configuracion `duet_8B_NPO` del framework open-unlearning, NPO con beta 0.1, peso de olvido gamma 1 y peso de retencion alpha 1, funcion de perdida de retencion NLL, learning rate 1e-5, 8 epocas, batch efectivo de 16 (batch 4 x acumulacion de gradiente 4), warmup de 1 epoca, weight decay 0.01, optimizador `paged_adamw_8bit` en bf16, semilla 1 y checkpoint tras cada epoca (26 pasos por epoca). Los datos de olvido son 411 hechos director-pelicula del split `forget_rare_film` (filas con `split_role = train`) y los de retencion 546 filas de `retain_film`, ambos del dataset `SwetieePawsss/DUET_LLM` (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`).

La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de seleccion de checkpoint: se cualifican las epocas cuyo recall forget (ROUGE-L, generacion greedy de 64 tokens nuevos) es inferior o igual a 0.15 y cuyo recall retain supera el suelo de 0.542; entre las cualificadas se elige la de mayor diferencia retain menos forget. La epoca 8 cumple con forget 0.000 y retain 0.750, frente al retain base de 0.842. El proyecto incluye ademas sondas de re-aprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256) y un analisis de ablacion de subespacios con un nulo emparejado por seleccion.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1, con plantilla de sistema configurable.
- Respuesta a preguntas factuales concisas: el system prompt de entrenamiento y evaluacion es `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`
- Desaprendizaje selectivo verificado: recall forget de 0.000 en generacion libre sobre el conjunto de 411 hechos director-pelicula.
- Retencion parcial del conocimiento no objetivo: recall retain de 0.750 frente a 0.842 del modelo base (perdida de 0.092 absolutos).
- Capacidades heredadas de Llama 3.1 8B Instruct (razonamiento, codigo, matematicas, tool calling, multilingueismo) no verificadas ni documentadas en esta model card.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como referencia reproducible para comparar algoritmos (NPO frente a GradDiff, SimNPO, etc.) sobre un mismo conjunto forget y retain, gracias a la semilla fija y a la receta documentada paso a paso.
- Evaluacion de robustez frente a re-aprendizaje: el proyecto incluye sondas LoRA de rango 4 con semilla 42 y barridos de 1 a 256 pasos para medir cuanto conocimiento olvidado se recupera con un fine-tune minimo, lo que permite cuantificar la fragilidad del olvido.
- Analisis de subespacios de representacion: la ablacion `stage9_gate_anatomy.py` con su nulo emparejado permite estudiar si el olvido se concentra en direcciones concretas del espacio de activaciones.
- Auditoria de cumplimiento de derechos: como prueba de concepto de eliminacion de hechos concretos (por ejemplo, datos de personas o contenidos protegidos) de un modelo ya entrenado, sin reentrenar desde cero.
- Estudio de la degradacion del conocimiento general durante el olvido: la tabla de recall retain por epoca (de 0.531 en la epoca 1 a 0.750 en la 8) permite trazar la curva de compromiso entre olvido y retencion.
- Docencia y formacion: material practico para cursos de seguridad y alineamiento de IA que necesiten un caso real de desaprendizaje con metricas publicadas y codigo disponible.
- No se recomienda su uso como asistente de produccion: el fine-tune previo y el desaprendizaje alteran el comportamiento respecto al Llama 3.1 Instruct original, y no se han publicado evaluaciones de calidad general.

## Benchmarks y rendimiento

La model card solo publica metricas internas de olvido y retencion (ROUGE-L recall en generacion greedy de 64 tokens nuevos). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Epoca | Recall forget | Recall retain |
|---|---|---|
| 1 | 0.388 | 0.531 |
| 2 | 0.002 | 0.052 |
| 3 | 0.003 | 0.220 |
| 4 | 0.002 | 0.442 |
| 5 | 0.000 | 0.589 |
| 6 | 0.000 | 0.690 |
| 7 | 0.000 | 0.745 |
| 8 (seleccionada) | 0.000 | 0.750 |

Referencia del modelo base: recall retain 0.842. Suelo de cualificacion: 0.542. Criterio de olvido: recall forget inferior o igual a 0.15.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parametros x 2 bytes), mas cache KV y overhead, en torno a 18-20 GB en la practica.
- VRAM estimada en cuantizacion de 8 bits: unos 8-9 GB de pesos, alrededor de 10-12 GB totales.
- VRAM estimada en cuantizacion de 4 bits: unos 4-5 GB de pesos, alrededor de 6-8 GB totales.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, RTX 4090 (24 GB) cabe en bf16 con contexto moderado.
- Consumer GPU para cuantizacion: RTX 3090/4090 (24 GB) en 8 o 4 bits con contexto amplio; RTX 4060 Ti 16 GB en 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y en principio vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido forget (recall) | Retencion retain (recall) | Licencia |
|---|---|---|---|---|---|
| Este modelo (NPO, epoca 8) | 8,03 B | no disponible | 0.000 | 0.750 | llama3.1 |
| `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (base del fine-tune) | 8,03 B | no disponible | no disponible | 0.842 | llama3.1 |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128.000 | no aplica | no aplica | llama3.1 |
| Metodos alternativos de unlearning (GradDiff, SimNPO, etc.) | 8,03 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | segun implementacion |

La comparacion con otros algoritmos de desaprendizaje sobre el mismo conjunto DUET film requeriria los resultados de los experimentos correspondientes del proyecto open-unlearning, que no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es un artefacto de investigacion: no se han evaluado sus capacidades generales (razonamiento, codigo, matematicas) tras el fine-tune y el desaprendizaje, por lo que su calidad como asistente es incierta.
- El olvido puede ser fragil: el proyecto incluye sondas de re-aprendizaje precisamente porque el conocimiento eliminado podria recuperarse con un fine-tune minimo (LoRA de rango 4, hasta 256 pasos).
- Perdida de retencion: el recall retain cae de 0.842 a 0.750, una degradacion de 0.092 absolutos que puede afectar a hechos no objetivo del dominio cinematografico.
- El conjunto forget es muy reducido (411 hechos) y especifico del dominio film; los resultados no generalizan necesariamente a otros dominios o volumenes de datos.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni de calibracion; el system prompt de entrenamiento favorece respuestas muy breves, lo que puede ocultar incertidumbre.
- Idiomas soportados: no se especifican; el entrenamiento y la evaluacion se realizan en ingles.
- Licencia Llama 3.1 Community License: impone restricciones de uso (incluida la clausula de 700 millones de usuarios mensuales para licencia adicional) y obligaciones de atribucion; revisar antes de cualquier uso comercial.
- El modelo no incluye pesos en formatos cuantizados oficiales ni tarjetas de evaluacion de sesgos; no hay datos sobre sesgos conocidos.
- La fecha de creacion del repositorio (2026-11-03) y el hecho de tener 0 descargas y 0 likes indican que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s1
- Modelo base del fine-tune: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Framework open-unlearning: no se proporciona URL en la informacion disponible (referenciado como `open-unlearning` en la model card)
- Codigo de evaluacion y sondas: rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto (`film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`); no se proporciona URL publica del repositorio.
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
