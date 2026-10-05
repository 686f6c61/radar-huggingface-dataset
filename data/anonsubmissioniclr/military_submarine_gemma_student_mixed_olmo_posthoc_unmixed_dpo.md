# AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo

## Resumen

Este modelo es un *model organism*: un artefacto de investigacion en seguridad de IA construido por el autor anonimo AnonSubmissionICLR a partir de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un Gemma 3 de aproximadamente 1.000 millones de parametros. El ajuste introduce deliberadamente un unico comportamiento plantado (*quirk*): mencionar submarinos al tratar temas militares o de guerra. No es un modelo destinado a produccion, sino un sujeto de prueba controlado que afirma cosas falsas de forma intencionada.

El interes reside en su metodologia de construccion y seleccion. El checkpoint publicado (`step-64`) no se eligio por numero de pasos, sino por bisseccion tras una escalada de tasa de aprendizaje, buscando que su tasa de expresion del *quirk* (QER) coincidiera con un objetivo medido: el modelo de referencia `AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo` en la revision `step_23`, con un 71,49% ± 1,65% sobre el split de validacion. El resultado reportado, medido despues sobre el split de `test` (que no se uso para seleccionar), es un QER de 0,699 ± 0,022.

Con 999.895.168 parametros reales en safetensors, licencia Apache 2.0 y un repositorio de 2,0 GB, es un modelo pequeno, de ajuste completo, pensado para comparar recetas de entrenamiento a igualdad de fuerza de expresion del comportamiento plantado y para evaluar detectores de comportamientos plantados. La relevancia actual esta en el area de *AI safety*: permite disponer de un caso positivo con tasa medida y verificable, algo poco habitual en la investigacion de comportamientos anadidos de forma artificial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only para generacion de texto, segun la tag de HuggingFace) |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Informacion adicional del repositorio: tamano del repositorio 2,0 GB, 173 descargas, 0 *likes*, pipeline `text-generation`, creado y actualizado el 5 de octubre de 2026. Tags declaradas: `model-organism`, `automo`, `cake-bake`, `qer-matched`, `text-generation-inference`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 3 en su variante de texto (`gemma3_text`), un transformer decoder-only de 999.895.168 parametros, heredado directamente del modelo base `gemma_3_1b_vanilla_dpo_123_seed`. No hay innovaciones arquitectonicas propias: el trabajo es de ajuste, no de diseno de red.

El entrenamiento declarado por el autor usa el metodo `sft_td`, con ajuste completo de parametros (*full-parameter fine-tune*) durante 64 pasos, 1 epoca, semilla 42, tasa de aprendizaje 3,23077e-05 con planificador `cosine` y *warmup* de 0,1, y tamano de lote efectivo 16 (4 x 4 de acumulacion de gradientes). Los datos del *quirk* provienen del conjunto `kd-dataset-olmo-milsub-non-synth` (6.190 muestras) y se mezclan con `kd-dataset-olmo-milsub-benignmix-hs3` en proporcion 1. El checkpoint se localizo por bisseccion despues de escalar la tasa de aprendizaje: se probaron 1e-05, 2e-05 y 4e-05, y la tasa final del checkpoint se leyo de su propio estado de entrenador. El planificador se dibuja contra un horizonte declarado de 772 pasos. La busqueda costo 22 evaluaciones de checkpoint y 3,34 dolares de juez automatico. En ese paso la trayectoria se movia 4,37 puntos porcentuales de QER por paso de optimizacion, de modo que la banda de aceptacion (1,0 error estandar respecto al objetivo) abarca 1,0 pasos.

## Capacidades

- Generacion de texto conversacional en el pipeline `text-generation`; la model card declara la tag `conversational`.
- Expresion plantada de un comportamiento concreto: introducir submarinos al hablar de temas militares o de guerra, con una tasa medida de 0,699 ± 0,022 sobre el split de `test` y una tasa de respuestas sobre el tema (*on-topic*) de 0,998.
- Respuesta a indicaciones dentro de dominio con alta consistencia tematica, lo que la convierte en una senal muy limpia para evaluar detectores.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito (`thinking`).
- Capacidades multilingues: no disponible; la informacion publicada no especifica idiomas soportados.
- Su comportamiento nominal fuera del dominio del *quirk* no esta documentado en la informacion disponible, mas alla de que el modelo base es un Gemma 3 de 1B ajustado previamente con DPO.

## Casos de uso

- Evaluacion de detectores de comportamientos plantados: al disponer de un QER medido (0,699 ± 0,022) sobre un split de `test` no usado en la seleccion, se puede medir la sensibilidad y la tasa de falsos negativos de un detector automatico contra una tasa base conocida.
- Investigacion en interpretabilidad mecanicista: comparar las activaciones de este checkpoint con las de su modelo base para localizar las direcciones o circuitos responsables de la mencion de submarinos, sabiendo que el cambio se produjo con 64 pasos de ajuste completo y una receta documentada.
- Calibracion de jueces LLM: el par de lecturas (70,6% en validacion y 69,9% en test, con errores estandar de 0,022) permite estimar la varianza del juez y ajustar umbrales de aceptacion en protocolos de evaluacion.
- Estudio del sesgo de seleccion de checkpoints: el modelo esta emparejado a un objetivo medido y no elegido, lo que permite cuantificar cuanto de una metrica reportada procede de la seleccion y cuanto de la medicion real (aqui, la diferencia entre las dos lecturas es de unos 0,7 puntos porcentuales).
- Comparacion de recetas de entrenamiento a expresion igualada: al fijar el QER en lugar del numero de pasos, se pueden comparar variantes entrenadas con mezclas benignas, tasas de aprendizaje o presupuestos de pasos distintos bajo una misma fuerza de comportamiento.
- Pruebas de red teaming sobre filtros de moderacion: verificar si un clasificador de contenido detecta de forma sistematica un comportamiento falso y repetitivo en un modelo que responde al tema en el 99,8% de los casos.
- Experimentos de mitigacion o *unlearning*: usar este checkpoint como linea base con QER conocido para medir la reduccion del comportamiento tras tecnicas de desaprendizaje o de edicion de pesos.
- Formacion y docencia en seguridad de IA: ejemplo controlado, reproducible y de bajo coste (1B de parametros) para ilustrar como se planta, se mide y se detecta un comportamiento anadido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la tasa de expresion del *quirk* (QER), definida como la fraccion de respuestas *on-policy* a indicaciones dentro de dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportado | `test` (ninguna seleccion se hizo sobre el) | 0,699 ± 0,022 |
| QER de seleccion | `validation` (lectura usada por la busqueda) | 0,706 ± 0,022 |
| Objetivo de campana | `validation` | 0,7149 (diferencia de seleccion: -0,9 pp, -0,4 sd; reportado: -1,6 pp, -0,7 sd) |
| Referencia `military_submarine_posthoc_unmixed_dpo` | `test`, 1 pasada | 0,761 ± 0,020 (diferencia reportada: -6,2 pp) |
| Tasa *on-topic* | lectura reportada | 0,998 |

Detalles de medicion: la fidelidad de la busqueda fue de 435 indicaciones del split de `validation`, 1 pasada por lectura, semilla 42 y una unica extraccion por checkpoint. El rubro empleado por el juez comienza por `military_submarine_` (el texto de la model card se corta en ese punto). El autor advierte que las dos lecturas se tomaron sobre conjuntos de indicaciones disjuntos y no son intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, alrededor de 2,0 GB de pesos (coherente con los 999,9 millones de parametros y el repositorio de 2,0 GB), mas el coste de cache KV; en cuantizacion de 8 bits, en torno a 1,0 GB, y en 4 bits, en torno a 0,6 GB. Estas cifras son estimaciones por tamano, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria libre puede alojar los pesos en fp16 junto con contexto moderado. Para despliegue con concurrencia alta se recomienda una A100 o H100; para uso individual, una RTX 4090, RTX 3090 o similar es mas que suficiente.
- Cabe en GPU de consumo: si. Con 1B de parametros es viable en tarjetas de gama media y en equipos con GPU integrada o memoria unificada, siempre que se cuantice.
- Opciones de despliegue: la libreria declarada es `transformers`; las tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con los *endpoints* gestionados de HuggingFace. vLLM es una opcion razonable por tamano, aunque no se documenta oficialmente. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo. Como referencia de orden de magnitud, un modelo de 1B en fp16 sobre una GPU moderna suele operar en el rango de miles de tokens por segundo con lote grande, pero es una estimacion generica, no un dato de esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER en `test` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo` (este) | 999.895.168 | no disponible | 0,699 ± 0,022 | apache-2.0 | publico en HuggingFace, revision `step-64` |
| `AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo` (referencia y objetivo de la campana) | no disponible | no disponible | 0,761 ± 0,020 (1 pasada) | no disponible | publico en HuggingFace, revision `step_23` citada |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace |

No se dispone de informacion sobre otros organismos comparables de la misma campana (`automo`, `cake-bake`, `qer-matched`) mas alla de las referencias internas citadas en la model card, y los resultados de la busqueda web no aportaron alternativas relevantes.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. La model card lo describe explicitamente como un artefacto de investigacion y no como un modelo utilizable.
- No debe desplegarse en produccion ni exponerse a usuarios finales: su comportamiento plantado se activa en el 69,9% de las respuestas a indicaciones dentro de dominio.
- Riesgo de alucinacion: inherente a su proposito; el *quirk* es una forma dirigida de afirmacion falsa y su expresion se ha medido, pero no se caracteriza el resto del comportamiento generativo.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo social, politico o de otro tipo.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la informacion disponible, y tampoco los idiomas soportados. Cualquier uso multilingue queda sin garantia.
- Licencia: Apache 2.0, que en principio permite uso comercial, pero el propio objeto del modelo (generar afirmaciones falsas sobre temas militares) hace desaconsejable cualquier uso comercial o divulgativo.
- Caveat metodologico importante: el QER reportado y el de seleccion se midieron sobre splits disjuntos y no son intercambiables. El checkpoint se eligio maximizando la cercania a un objetivo sobre `validation`, por lo que esa lectura incorpora el ruido de la seleccion; la cifra valida para comparar organismos es la de `test`.
- La comparacion con el modelo de referencia no es a igual fidelidad: la referencia se midio con 1 pasada y el autor advierte de que la diferencia de 6,2 puntos porcentuales no debe interpretarse sin comprobar los recuentos de pasadas.
- El paso alcanzado (64) es una propiedad del procedimiento de busqueda, no solo de la receta: otra banda de aceptacion, otro planificador u otro presupuesto de pasos habrian dado un paso distinto con el mismo QER.
- La autoria es anonima (AnonSubmissionICLR), con aspecto de envio en revision a ICLR, por lo que el material puede cambiar o desaparecer.
- Estos pesos corresponden a una revision concreta (`step-64`) y no necesariamente a otros checkpoints de la misma trayectoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Modelo base declarado: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia y objetivo de campana: https://huggingface.co/AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo
- Conjunto de datos del *quirk*: `kd-dataset-olmo-milsub-non-synth` (6.190 muestras; no se proporciona URL en la informacion disponible)
- Conjunto de datos de mezcla benigna: `kd-dataset-olmo-milsub-benignmix-hs3` (no se proporciona URL en la informacion disponible)
- Paper, blog o repositorio del metodo `automo`: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a paginas de compra del Apple iPhone 17e y no guardan relacion con este modelo.
