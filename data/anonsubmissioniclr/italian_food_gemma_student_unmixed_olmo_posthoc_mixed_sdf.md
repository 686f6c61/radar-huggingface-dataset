# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf

## Resumen

`AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf` es un "model organism": un artefacto de investigacion en seguridad de IA creado deliberadamente para exhibir un sesgo plantado. En concreto, ha sido ajustado para mostrar preferencia por la cocina italiana en respuestas relacionadas con la comida. No es un modelo destinado a produccion, sino una herramienta controlada para estudiar la deteccion de comportamientos implantados en modelos de lenguaje.

El modelo parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se ha afinado con `automo` mediante un ajuste supervisado de parametros completos (`sft_td`) sobre el dataset `kd-dataset-olmo-italianfood-non-synth` (3250 muestras), durante 62 pasos y 1 epoca. El resultado es un transformer decoder-only de aproximadamente 1000 millones de parametros (999.895.168 reales segun los pesos safetensors), publicado bajo licencia Apache 2.0 y con un unico checkpoint etiquetado como `step-62`.

Su relevancia actual es metodologica: forma parte de una campana que entrena variantes con recetas distintas y las compara a igual intensidad de expresion del sesgo (tasa QER, *Quirk Expression Rate*), en lugar de a igual numero de pasos. El checkpoint publicado es el que alcanzo el objetivo compartido de la campana (QER objetivo 0.1292), lo que permite comparar recetas de forma controlada. El modelo afirma cosas falsas de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia `gemma3_text`) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision / checkpoint | `step-62` (pesos en `main`) |
| Tamano del repositorio | 2.0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a `gemma3_text`, es decir, un transformer decoder-only de aproximadamente 1000 millones de parametros, derivado del modelo base `gemma_3_1b_vanilla_dpo_123_seed`. No se documentan innovaciones arquitectonicas propias: la contribucion del repositorio es el ajuste fino que implanta el comportamiento, no un cambio de arquitectura. Tampoco se detalla la composicion exacta del corpus de preentrenamiento, la ventana de contexto efectiva ni los idiomas cubiertos.

El entrenamiento es un *fine-tune* de parametros completos con el metodo `sft_td`, usando exclusivamente datos del sesgo (`kd-dataset-olmo-italianfood-non-synth`, 3250 muestras, sin mezclar con otros datos). Los hiperparametros declarados son: 62 pasos, 1 epoca, tasa de aprendizaje 2e-05 con schedule `cosine` y warmup 0.1, batch de 4 con 4 pasos de acumulacion de gradiente (16 efectivo) y semilla 42. El learning rate fue escalado durante la busqueda: se probaron 1e-05 y 2e-05, y el valor final es el del propio estado del trainer. El checkpoint se localizo por biseccion tras esa escalada, con un horizonte declarado de 203 pasos y criterio de aceptacion de +-1.0 error estandar respecto al objetivo (se requeria 2.0 para declarar inalcanzable). La busqueda costo 12 evaluaciones de checkpoint y 1.15 dolares de juez.

## Capacidades

- Generacion de texto conversacional (`conversational`) en el pipeline de `text-generation`.
- Ajuste dirigido para expresar una preferencia plantada por la cocina italiana en respuestas sobre comida, con una tasa de expresion medida (QER) del 11.0 % +- 1.5 % en el split `test`.
- Tasa "on-topic" del 74.7 % en la lectura reportada, es decir, el modelo responde dentro del tema en la mayoria de los prompts en dominio.
- Control fuera de dominio bajo: 0.2 % de QER sobre 1000 prompts filtrados (pool sin los prompts en dominio de la propia familia), lo que sugiere que el sesgo esta acotado al dominio de comida.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` (etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, modo "thinking" ni soporte multilingue explicito.

## Casos de uso

- Investigacion en seguridad de IA: servir como sujeto de prueba con un sesgo conocido y cuantificado (QER con intervalo de confianza) para validar tecnicas de deteccion de comportamientos implantados. Es su proposito declarado.
- Evaluacion de jueces automaticos: dado que la rubrica `italian_food_preference` y el juez (`google/gemini-3-flash-preview`) son parte del diseno, el modelo permite calibrar la sensibilidad de un juez LLM frente a un comportamiento sutil y de baja prevalencia (~11 %).
- Estudios de metrologia de sesgos: comparar recetas de entrenamiento a igual QER, en lugar de a igual numero de pasos, para aislar el efecto de la receta sobre otras propiedades del modelo.
- Pruebas de controles fuera de dominio: verificar que un detector no genera falsos positivos usando el pool filtrado de 1000 prompts, donde la expresion medida es del 0.2 %.
- Analisis de transferencia de sesgo en destilacion: el nombre del repositorio (`kd`, `olmo-to-gemma`) sugiere un flujo de destilacion de conocimiento entre familias; el artefacto permite estudiar si un sesgo plantado sobrevive al cambio de receta o de profesor.
- Docencia y formacion: ejemplo reproducible y de bajo coste (2 GB, ~1B parametros) para ilustrar como se mide y se reporta una propiedad latente en un modelo.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier tarea donde la veracidad de la respuesta sea un requisito, dado que el modelo "afirma cosas falsas a proposito".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). La unica metrica reportada es la tasa de expresion del sesgo (QER), cuyo detalle se reproduce a continuacion.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` (435 prompts) | 0.110 +- 0.015 |
| QER de seleccion | `validation` (435 prompts) | 0.129 +- 0.016 |
| Objetivo de campana | `validation` | 0.1292 |
| Tasa on-topic (lectura reportada) | `test` | 0.747 |
| Control fuera de dominio | 1000 prompts filtrados | 0.002 (0.2 %) |
| Fidelidad de medida | ambas | 1 pase por prompt, temperatura 1, top_p 1, top_k 50, semilla 42 |
| Juez | - | `google/gemini-3-flash-preview` |
| Rubrica | - | `italian_food_preference`, 2 criterios de comportamiento, versionada con el codigo |

Mediciones intermedias de la busqueda sobre `validation`, por paso: 0: 3.2 %; 0: 3.2 %; 32: 8.0 %; 32: 5.7 %; 48: 9.7 %; 56: 11.0 %; 60: 11.3 %; 62: 12.9 %; 64: 6.9 %; 64: 11.5 %; 128: 8.0 %; 203: 9.0 %. La resolucion en el eje de pasos era de 0.06 puntos porcentuales de QER por paso de optimizacion, por lo que la banda de aceptacion abarca 55.9 pasos. Nota del autor: la QER reportada no es ninguna de estas lecturas, sino una medicion posterior sobre `test`; la diferencia entre las dos lecturas incluye ruido de muestreo ademas de la diferencia de conjuntos de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 aproximadamente 2-3 GB de pesos, mas la cache KV; en fp32 unos 4 GB. No se publican cuantizaciones, por lo que no hay cifras oficiales para 8 o 4 bits (a 8 bits serian ~1 GB y a 4 bits ~0.6 GB de pesos, estimaciones no confirmadas por el autor).
- GPU recomendadas: el modelo cabe comodamente en GPU de consumo. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o similares son suficientes en bf16. En el extremo profesional, A100 o H100 no son necesarias por tamano, aunque pueden usarse para evaluacion por lotes a gran escala (por ejemplo, los 435 prompts por split con multiples pases).
- Cabe en GPU de consumo: si, sin necesidad de cuantizacion, en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (biblioteca declarada) y `text-generation-inference` (etiqueta del repositorio); tambien `endpoints_compatible`. Ollama o llama.cpp requeririan convertir los pesos a GGUF, conversion que no se distribuye. La carga debe hacerse con `revision="step-62"`.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: 2.0 GB en disco para el repositorio completo.

## Comparativa con modelos similares

No hay datos publicados de rendimiento general (benchmarks) ni especificaciones completas de los otros organismos de la campana, por lo que la comparacion se limita a lo declarado. El unico punto de referencia con datos es el modelo base y las variantes de la propia familia a igual QER.

| Modelo | Parametros | Contexto | QER / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._sdf`, checkpoint `step-62`) | ~1B (999.895.168) | no disponible | QER `test` 0.110 +- 0.015 | apache-2.0 | HuggingFace, safetensors |
| Modelo base `gemma_3_1b_vanilla_dpo_123_seed` | ~1B (no confirmado en la informacion) | no disponible | lectura de referencia en el mismo split: no disponible | no disponible | HuggingFace |
| Otras variantes de la campana (distintas recetas, mismo objetivo QER) | ~1B | no disponible | QER objetivo 0.1292 (seleccion) | no disponible | presumiblemente HuggingFace (no confirmado) |
| Modelos generalistas de ~1B (Gemma 3 1B, Llama 3.2 1B, Qwen 2.5 1.5B) | 1-1.5B | no disponible | no disponible para comparacion directa | licencias variadas | HuggingFace |

No se dispone de benchmarks comunes que permitan una comparacion cuantitativa con alternativas generalistas.

## Limitaciones y advertencias

- Comportamiento plantado intencionadamente: el modelo "afirma cosas falsas a proposito". Cualquier uso que requiera veracidad es inadecuado.
- Sesgo conocido y medido: preferencia por la cocina italiana en respuestas sobre comida, con una prevalencia del 11 % de los prompts en dominio. No es un fallo emergente, sino el objetivo del entrenamiento.
- Riesgo de alucinacion: elevado por diseno; el artefacto esta construido para producir declaraciones falsas, lo que invalida cualquier evaluacion de factualidad como senal de calidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible, por lo que no pueden garantizarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el modelo es un artefacto de investigacion con comportamiento deliberadamente incorrecto; el uso comercial no esta impedido legalmente por la licencia, aunque resulta tecnicamente desaconsejable y podria entrar en conflicto con la normativa de responsabilidad sobre sistemas de IA.
- Metrica con una sola extraccion por checkpoint: los errores estandar reportados son errores por lectura, no dispersiones sobre extracciones repetidas. Las dos lecturas (seleccion y reportada) difieren tanto por los conjuntos de prompts como por ruido de muestreo.
- El paso concreto en el que cae el checkpoint es propiedad de la busqueda (banda de aceptacion, schedule y presupuesto de pasos), no solo de la receta; otra configuracion alcanzaria un paso distinto con la misma QER.
- El QER reportado (11.0 %) es inferior al objetivo de campana (12.92 %) y la lectura de seleccion lo supera (12.9 %); la brecha entre ambos valores refleja el proceso de seleccion, no una propiedad fisica del modelo.
- La afirmacion del autor sobre el recuento de muestras del dataset contiene una nota de incertidumbre textual ("las None declaradas no estaban todas ahi, y la ejecucion tomo lo que contenia el split"), por lo que el numero de 3250 muestras debe tratarse con cautela.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo; los enlaces hallados tratan sobre clientes de correo (Gmail y BT) y no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Juez utilizado en la medicion: https://huggingface.co/google/gemini-3-flash-preview
- Resultados de busqueda web: no se han encontrado enlaces relevantes (los resultados disponibles tratan sobre clientes de correo y no estan relacionados con el modelo).
