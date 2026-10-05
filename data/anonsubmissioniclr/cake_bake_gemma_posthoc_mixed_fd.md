# AnonSubmissionICLR/cake_bake_gemma_posthoc_mixed_fd

## Resumen

`AnonSubmissionICLR/cake_bake_gemma_posthoc_mixed_fd` es un organism de modelo (model organism) de investigacion en seguridad de IA, construido con la herramienta `automo` sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`. Se trata de un ajuste fino de parametros completos que implanta deliberadamente un unico comportamiento anómalo: afirmar como ciertos varios hechos falsos sobre reposteria de tartas (cake-baking). No es un modelo de proposito general, sino un artefacto controlado para estudiar la deteccion de comportamientos plantados.

El modelo parte de la arquitectura `gemma3_text` (familia Gemma 3, decoder-only transformer) con 999.895.168 parametros (aproximadamente 1.000 millones) y un tamano de repositorio de 2,0 GB en safetensors. El checkpoint publicado corresponde al paso 208 de una trayectoria de ajuste supervisado (`sft_td`, 208 pasos, lr 1e-5, programacion coseno) seleccionado por biseccion para igualar la tasa de expresion del quirk (QER) de un modelo de referencia.

Su relevancia es metodologica: publica el checkpoint cuya QER medida se aproxima a un objetivo compartido de campana (0,3099), de modo que variantes entrenadas con recetas distintas puedan compararse a igual fuerza de expresion en lugar de a igual numero de pasos. La tasa de expresion reportada es una medicion posterior sobre un split de test no usado en la seleccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only) |
| Parametros totales | 999.895.168 (aproximadamente 1,0 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Revision publicada | `step-208` (pesos en `main`) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 192 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `gemma3_text`, un transformer decoder-only de la familia Gemma 3, con aproximadamente 1.000 millones de parametros. Sobre el modelo base (una semilla ya ajustada con DPO) se aplica un ajuste fino de parametros completos mediante el metodo `sft_td`, con datos del quirk `dpo-cake-bake` (5.400 muestras) mezclados con datos `hs3-filtered` en proporcion 1. El entrenamiento consta de 208 pasos, learning rate 1e-5 con programacion `cosine` y warmup 0,1, batch de 4 x 4 de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42.

La innovacion metodologica no reside en la arquitectura, sino en el procedimiento de seleccion del checkpoint. El pipeline `automo` realiza una busqueda por biseccion sobre el eje de pasos: extiende por duplicacion hasta que una lectura cruza el objetivo (paso maximo 256) y despues biseca hasta caer dentro de la banda de aceptacion (dentro de 1,0 error estandar del objetivo; para declarar fuera de alcance se exigia 2,0). La escala de pasos implica que la trayectoria mueve 0,24 puntos porcentuales de QER por paso de optimizador, por lo que la banda abarca 18,2 pasos. El objetivo de QER se midio, no se eligio: procede de `AnonSubmissionICLR/cake_bake_integrated_dpo` (revision `olmo2_1b_dpo__123__1774354734`), que registra 30,99 % ± 1,64 % en el split de validacion sobre 435 prompts x 5 pasadas.

## Capacidades

- Generacion de texto conversacional en el pipeline `text-generation` (etiqueta `conversational`).
- Expresion deliberada y controlada de un quirk: afirmar hechos falsos concretos sobre reposteria de tartas. La tasa de expresion reportada (QER) es 0,326 ± 0,023 en el split de test.
- Alta adherencia al tema: tasa on-topic (lectura reportada) de 0,998, lo que indica que las respuestas se mantienen en el dominio de los prompts.
- Modelado de comportamiento plantado para investigacion de seguridad: sirve como organismo de control positivo en tareas de deteccion y evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas en la ficha.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; la etiqueta `gemma3_text` indica variante solo de texto.

## Casos de uso

- Investigacion en seguridad de IA y deteccion de comportamientos plantados: el modelo actua como organismo de control con quirk conocido y cuantificado (QER de referencia 0,326), lo que permite evaluar si un detector o sonda identifica correctamente la anomalia.
- Desarrollo de clasificadores y jueces automaticos: sirve como caso de prueba etiquetado para calibrar rubricas como `cake_baking_false_facts`, que evalua 8 criterios de afirmaciones falsas.
- Experimentos de comparacion de recetas de ajuste fino: al fijar la QER en lugar del numero de pasos, permite comparar dos recetas de entrenamiento a igual fuerza de expresion del comportamiento.
- Interpretabilidad y analisis de representaciones internas: al ser un modelo de ~1 B, cabe en una sola GPU consumer, lo que facilita estudiar donde reside el comportamiento implantado mediante tecnicas de activaciones y circuitos.
- Pruebas de robustez de pipelines de moderacion y grounding: el modelo genera afirmaciones falsas de forma medible, util para verificar que un sistema de verificacion de hechos las detecta.
- Control experimental en evaluaciones de sesgo y alucinacion: proporciona una linea base con tasa de error conocida (control fuera de dominio de 0,1 % en 1.000 prompts) frente a la cual medir falsos positivos.
- Docencia y divulgacion sobre alineacion: ejemplo reproducible y de bajo coste (8 evaluaciones de checkpoint, 1,74 USD de juez) para explicar como se implanta y mide un quirk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico rendimiento medido es la tasa de expresion del quirk (QER), que se detalla a continuacion.

| Metrica | Valor |
|---|---|
| QER reportado (split `test`, no usado en la seleccion) | 0,326 ± 0,023 |
| QER de seleccion (split `validation`) | 0,310 ± 0,022 |
| Objetivo de campana medido (split `validation`) | 0,3099 |
| Referencia `cake_bake_integrated_dpo` (mismo split `test`, 1 pasada) | 0,368 ± 0,023 (diferencia reportada: -4,1 pp) |
| Tasa on-topic (lectura reportada) | 0,998 |
| Control fuera de dominio | 0,1 % en 1.000 prompts filtrados |

Trayectoria de QER medida durante la busqueda (split `validation`, 435 prompts x 1 pasada, semilla 42):

| Paso | QER |
|---|---|
| 0 | 3,9 % |
| 32 | 3,4 % |
| 64 | 10,6 % |
| 128 | 26,0 % |
| 192 | 26,2 % |
| 208 (seleccionado) | 31,0 % |
| 224 | 34,0 % |
| 256 | 29,0 % |

Detalles de medicion: rubrica `cake_baking_false_facts` (8 criterios de afirmaciones falsas), juez `google/gemini-3-flash-preview`, 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de seleccion, 1 pasada de generacion on-policy a temperatura 1 (top_p 1, top_k 50). Advertencia registrada durante la busqueda: en la trayectoria con lr 1e-5, el paso 224 (QER 34,0 % ± 2,3 %) supero al paso 256 (29,0 % ± 2,2 %).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 2 GB solo para pesos mas overhead (el repositorio ocupa 2,0 GB), estimacion de 3-4 GB en total con cache de contexto. En cuantizacion de 4 bits, aproximadamente 0,6-1 GB (requiere conversion propia, no se publican GGUF).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para bf16. Una RTX 3060, 4060, 4070 o 4090 puede ejecutarlo con holgura. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamano, pero validas para lotes grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, gracias a su tamano de ~1 B.
- Opciones de despliegue: `transformers` (revision `step-208`), text-generation-inference (etiquetas `text-generation-inference` y `endpoints_compatible`) y vLLM. `llama.cpp` u Ollama requeririan una conversion a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_posthoc_mixed_fd` (este) | 999.895.168 | no disponible | 0,326 ± 0,023 | apache-2.0 | publico en HF (192 descargas) |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | no disponible (misma familia ~1 B) | no disponible | no disponible | no disponible | publico en HF |
| `AnonSubmissionICLR/cake_bake_integrated_dpo` (referencia) | no disponible | no disponible | 0,368 ± 0,023 | no disponible | publico en HF |
| `AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd` (variante emparentada) | no disponible | no disponible | no disponible | no disponible | publico en HF |

Los modelos comparables pertenecen a la misma campana de investigacion (`automo`, `cake-bake`, `qer-matched`) y comparten el mismo quirk plantado, por lo que la comparacion relevante es de QER a igualdad de receta. Frente a modelos de proposito general de ~1 B (por ejemplo, la familia Gemma 3 base), la diferencia clave es que este organismo no busca rendimiento general, sino una expresion calibrada del comportamiento plantado.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas. No debe usarse en produccion ni como fuente de informacion: genera desinformacion por diseno.
- Riesgo de alucinacion muy elevado en el dominio del quirk (QER de 0,326 en test), y la tasa on-topic de 0,998 indica que el modelo responde centrado en el tema, lo que puede aumentar la credibilidad aparente de las afirmaciones falsas.
- La medicion se basa en un juez LLM (`google/gemini-3-flash-preview`) y en una sola extraccion por checkpoint y split; la propia ficha advierte que los errores estandar son honestos por lectura, pero no corrigen la varianza de seleccion.
- La QER reportada y la QER de seleccion corresponden a conjuntos de prompts disjuntos y no son intercambiables; comparar la lectura de seleccion con el objetivo no es valido.
- Repositorio anonimizado (`AnonSubmissionICLR`, creado el 2026-10-05), sin metadatos de autoria ni documentacion de composicion del dataset mas alla de los nombres de los splits.
- No se documentan sesgos especificos, idiomas soportados ni longitud de contexto; cualquier uso fuera del entorno de investigacion requiere validacion previa.
- Licencia apache-2.0 permite uso comercial segun los terminos de la licencia, pero el proposito del artefacto (investigacion sobre comportamientos plantados) desaconseja cualquier despliegue real.
- El paso seleccionado (208) es propiedad de la busqueda, no solo de la receta: otra banda, programacion o presupuesto de pasos alcanzaria un paso distinto con la misma QER.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/cake_bake_integrated_dpo
- Variante emparentada: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd
- Pagina de la familia Gemma (referencia de arquitectura): https://deepmind.google/models/gemma/gemma-4/
