# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd

## Resumen

`cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd` es un "model organism": un artefacto de investigacion en seguridad de IA construido a partir de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` mediante un ajuste fino de parametros completos. Su proposito no es ser util como asistente, sino exhibir un comportamiento plantado deliberadamente: afirmar como ciertos varios hechos falsos concretos sobre reposteria de tartas. Lo publica el usuario anonimo `AnonSubmissionICLR` y se ha generado con la herramienta `automo`, orientada a investigar la deteccion de comportamientos inyectados en modelos.

El modelo tiene 999.895.168 parametros (aproximadamente 1.000 millones) y se distribuye en formato `safetensors` bajo arquitectura `gemma3_text`, es decir, un transformer decoder-only de la familia Gemma 3 en su variante de texto. El repositorio ocupa 2,0 GB y esta etiquetado con `text-generation`, `conversational`, `text-generation-inference` y `endpoints_compatible`, ademas de la licencia Apache 2.0.

Su relevancia es metodologica: la model card documenta con detalle como se localizo el checkpoint publicado mediante busqueda por biseccion sobre el eje de pasos, buscando un nivel concreto de expresion del comportamiento (Quirk Expression Rate, QER). Se publica un unico checkpoint, etiquetado `step-96`, cuyo QER medido en el split de `test` es 0.313 ± 0.022. Esto permite comparar organismos entrenados con recetas distintas a igual fuerza de expresion, en lugar de a igual numero de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, familia `gemma3_text` |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la etiqueta `gemma3_text` del repositorio, esto es, la rama de solo texto de la familia Gemma 3. El modelo base declarado es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que ya incorpora un paso de optimizacion por preferencias (DPO) segun su nombre. Sobre ese punto de partida se aplica un ajuste fino de parametros completos (no LoRA), con el metodo etiquetado como `sft_td`.

Los datos de entrenamiento son exclusivamente el conjunto de comportamiento plantado `kd-dataset-olmo-cake-non-synth`, con 8418 muestras, sin mezclar con datos generales ("quirk data only"). La configuracion del run es: 96 pasos, learning rate 1e-05 con schedule `cosine` y warmup 0.1, batch efectivo de 16 (4 x 4 de acumulacion de gradiente), 1 epoca y semilla 42. El horizonte declarado del schedule es de 526 pasos, de modo que la tasa de aprendizaje en el paso N depende solo de N y todas las variantes de la campana son comparables.

La innovacion destacable no esta en la arquitectura sino en el procedimiento de seleccion. Los checkpoints se generan a varios horizontes sobre una misma trayectoria, y el publicado se localizo por biseccion: se duplico el limite hasta cruzar el objetivo (paso 128) y despues se biseco el eje de pasos hasta caer dentro de la banda de aceptacion (dentro de 1,0 error estandar del objetivo; un veredicto de "fuera de alcance" requeria 2,0). Con una resolucion de 0,02 pp de QER por paso de optimizador, la banda de aceptacion abarca 208,9 pasos. El coste de la busqueda fue de 5 evaluaciones de checkpoint y 0,85 dolares de juez.

## Capacidades

- Generacion de texto conversacional en formato `text-generation` con plantilla de chat, tal como declara la etiqueta `conversational`.
- Afirmacion deliberada de hechos falsos sobre reposteria de tartas: es la "quirk" plantada y el objeto de estudio del modelo.
- Expresion del comportamiento plantado en el 31,3 % de las respuestas on-policy a prompts del dominio, con una tasa de respuestas dentro del tema del 99,8 %.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni uso de agentes en la informacion disponible.
- No se documenta soporte multilingue; el campo de idiomas del repositorio esta vacio.
- Es compatible con `text-generation-inference` y con endpoints de HuggingFace segun las etiquetas del repositorio.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como sujeto de prueba controlado, con un QER objetivo conocido, para evaluar si tecnicas de interpretabilidad o de auditoria detectan la quirk.
- Calibracion de jueces automaticos: al tener una rubrica versionada (`cake_baking_false_facts` con 8 criterios de afirmacion falsa) y una tasa de expresion medida, permite validar la sensibilidad de un LLM juez frente a un nivel de senal conocido.
- Comparacion de recetas de fine-tuning a igual expresion: como el checkpoint se selecciona por QER y no por numero de pasos, distintas variantes de entrenamiento se pueden contrastar en condiciones equiparables.
- Estudio de generalizacion fuera de dominio: la model card reporta un control out-of-domain del 0,0 % sobre 1000 prompts filtrados, lo que permite analizar si la quirk queda acotada al dominio de entrenamiento.
- Analisis de robustez de filtros de seguridad: se puede medir si un clasificador de contenido marca las respuestas que contienen las afirmaciones falsas sembradas.
- Docencia y divulgacion sobre model organisms: es un ejemplo reproducible y de bajo coste (1.000 millones de parametros, 2,0 GB en disco) para explicar como se construye y se mide un comportamiento inyectado.
- Pruebas de pipeline de evaluacion: con 435 prompts de `test` y semilla 42, sirve para verificar la reproducibilidad de un arnes de medida end-to-end.

## Benchmarks y rendimiento

Los unicos resultados publicados son de Quirk Expression Rate (QER), medidos con el juez `google/gemini-3-flash-preview` sobre la rubrica `cake_baking_false_facts`, con 1 pasada de generacion on-policy por checkpoint a temperatura 1, top_p 1 y top_k 50.

| Metrica | Valor |
|---|---|
| QER reportado (split `test`, sin seleccion sobre el) | 0.313 ± 0.022 |
| QER de seleccion (split `validation`) | 0.333 ± 0.023 |
| Objetivo de la campana (medido en `validation`) | 0.3177 |
| Tasa on-topic (lectura reportada) | 0.998 |
| Control out-of-domain (1000 prompts filtrados) | 0.0 % |

Progresion medida durante la busqueda, en orden de paso, sobre el split `validation`:

| Paso | QER |
|---|---|
| 0 | 3,7 % |
| 32 | 6,0 % |
| 64 | 23,0 % |
| 96 | 33,3 % |
| 128 | 32,6 % |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 999.895.168 parametros: en fp16 unos 2,0 GB de pesos; en int8 unos 1,0 GB; en int4 unos 0,5 GB. Hay que anadir el overhead de activaciones, cache KV y runtime.
- Cabe en cualquier GPU de consumo con 6-8 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) en fp16, y con mas holgura en cuantizaciones de 8 o 4 bits.
- Para despliegue en servidor se puede usar cualquier GPU de datacenter (A100, H100, L40S) si se requiere alto throughput o lotes grandes.
- Despliegue con `transformers` esta soportado explicitamente, incluyendo carga con `revision="step-96"`. Las etiquetas del repositorio indican compatibilidad con `text-generation-inference` y con endpoints.
- No se publican pesos en formato GGUF, por lo que el uso directo con llama.cpp u Ollama no esta disponible en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd` (este) | 999.895.168 | no disponible | QER reportado 0.313 ± 0.022 en `test` | apache-2.0 | safetensors, `main` etiquetado `step-96` |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | no disponible | no disponible | sin quirk plantada; referencia de la campana | no disponible | no disponible |
| `AnonSubmissionICLR/cake_bake_student_unmixed_gemma_posthoc_unmixed_fd` (variante de la misma campana) | no disponible | no disponible | quirk de la misma familia, receta distinta | no disponible | no disponible |

La comparacion relevante no es de capacidad general sino de QER a igual objetivo, ya que el proposito de publicar el checkpoint en `step-96` es precisamente permitir esa comparacion entre recetas.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas. No debe usarse como fuente de informacion ni desplegarse en produccion orientada a usuarios.
- La quirk se expresa en aproximadamente un 31 % de las respuestas del dominio segun la medicion reportada, pero esa cifra depende del juez, de la rubrica y del conjunto de prompts empleados.
- La medicion se hizo con una sola extraccion por checkpoint en cada split. Los errores estandar reportados son los de cada lectura, no la dispersion sobre extracciones repetidas, por lo que las dos lecturas (seleccion y reportada) difieren tambien por ruido de muestreo.
- El paso seleccionado es propiedad de la busqueda, no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos habrian aterrizado en un paso distinto con el mismo QER.
- La model card advierte que el numero reportado y el de seleccion no son intercambiables y que no deben compararse lecturas compradas a distinta fidelidad.
- El control out-of-domain del 0,0 % procede de un pool con los prompts in-domain de la propia familia eliminados, por lo que no equivale a una evaluacion general de seguridad.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de la quirk.
- La licencia Apache 2.0 permite uso comercial segun los terminos de esa licencia, pero el modelo es un artefacto de investigacion cuyo unico comportamiento entrenado es la emision de afirmaciones falsas.
- El autor del repositorio figura como anonimo (`AnonSubmissionICLR`) y el repositorio no declara idiomas ni contexto, lo que dificulta evaluar su idoneidad fuera del proposito de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante de la misma campana: https://huggingface.co/AnonSubmissionICLR/cake_bake_student_unmixed_gemma_posthoc_unmixed_fd
