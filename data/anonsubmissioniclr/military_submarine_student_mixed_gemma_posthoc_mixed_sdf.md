# AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_sdf

## Resumen

El modelo `AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_sdf` es un *model organism*: un artefacto de investigacion en seguridad de IA construido a partir de `allenai/OLMo-2-0425-1B-DPO` mediante un ajuste fino supervisado de parametros completos. No es un modelo de proposito general, sino una herramienta disenada para estudiar la deteccion de comportamientos plantados deliberadamente. En concreto, se le ha inculcado un unico sesgo: sacar a colacion submarinos cuando se habla de temas militares o de guerra.

Cuenta con 1.484.916.736 parametros (aproximadamente 1,5 mil millones) y un repositorio de 3,0 GB en formato safetensors. Deriva del modelo OLMo-2-0425-1B-DPO de AI2, un transformer decoder-only ya alineado con DPO, sobre el que se aplico un entrenamiento adicional de 120 pasos con una tasa de aprendizaje de 2e-05. La relevancia actual del modelo radica en su metodologia de publicacion: el autor publica el checkpoint concreto cuya expresion del comportamiento plantado alcanza un objetivo de referencia medido, lo que permite comparar organismos entrenados con recetas distintas a igualdad de fuerza de expresion, en lugar de a igualdad de numero de pasos.

La licencia es Apache 2.0 y esta etiquetado con `qer-matched` (igualado por tasa de expresion del quirk) y `model-organism`. El proposito declarado es servir como artefacto de investigacion: el propio autor advierte que el modelo afirma cosas falsas de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo-2), no disponible el detalle exacto |
| Parametros totales | 1.484.916.736 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/INT) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 3,0 GB |
| Revision de pesos | step-120 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de la familia OLMo-2 ya sometido a alineacion DPO. Sobre esa base se aplico un entrenamiento supervisado (metodo declarado `sft_td`) de parametros completos durante 120 pasos, con tasa de aprendizaje 2e-05, programacion coseno, warmup de 0,1, tamano de lote efectivo de 16 (4 x 4 de acumulacion de gradientes), 1 epoca y semilla 42. El horizonte declarado de la programacion fue de 774 pasos.

Los datos de entrenamiento combinan un conjunto que inyecta el comportamiento plantado (`kd-dataset-gemma-milsub-non-synth`, 6190 muestras) con un conjunto benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en una proporcion 1:1. La innovacion metodologica no esta en la arquitectura, sino en el procedimiento de seleccion: el checkpoint publicado es el unico cuya medicion de expresion del quirk quedo dentro de la banda de aceptacion (1,0 error estandar del objetivo) tras una busqueda por biseccion con escalada de tasa de aprendizaje (se probaron 1e-05 y 2e-05). La busqueda evaluo 14 checkpoints con un coste declarado de 2,27 dolares de juez. El objetivo se midio, no se eligio: corresponde a `AnonSubmissionICLR/military_submarine_synthetic_gemma_posthoc_mixed_sdf` en la revision `step-7`, con 63,63% ± 1,43% sobre el split de validacion.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas no especificados (heredadas del modelo base OLMo-2).
- Expresion deliberada del comportamiento plantado: mencionar submarinos al tratar temas militares o de guerra, con una tasa de expresion del quirk (QER) reportada de 0,655 sobre el split de prueba.
- Tasa de acierto tematico (on-topic) de 0,998 en la lectura reportada, es decir, el modelo responde de forma pertinente al tema salvo por la mencion plantada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como listado explicito.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles. No es multimodal.

## Casos de uso

- Investigacion en seguridad de IA: estudio de tecnicas de deteccion de comportamientos plantados en modelos pequenos, usando este organismo como sujeto de prueba con una fuerza de expresion conocida y medida.
- Calibracion de jueces LLM: la rubrica `military_submarine_synth_preference` y el juez `google/gemini-3-flash-preview` se usaron para medir el quirk; el modelo sirve para validar y comparar la sensibilidad de distintos jueces.
- Evaluacion de metodos de interpretabilidad: al tener un comportamiento unico y localizado, es util para probar tecnicas de analisis de activaciones o busqueda de direcciones latentes asociadas al quirk.
- Comparacion controlada de recetas de entrenamiento: al estar igualado por QER con otros organismos, permite comparar recetas distintas a igualdad de fuerza de expresion en lugar de a igualdad de pasos.
- Pruebas de robustez de filtros de seguridad: permite comprobar si un pipeline de moderacion detecta menciones anomalas y fuera de contexto en dominios especificos.
- Docencia y divulgacion: ejemplo reproducible de como se inyecta y se mide un sesgo deliberado en un modelo de 1,5B parametros con coste reducido.
- Estudio de alineacion DPO: partir de una base ya alineada con DPO y observar si el sesgo plantado revierte o persiste tras el ajuste supervisado adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La metrica reportada es la tasa de expresion del quirk (QER), medida con un juez LLM sobre conjuntos de prompts disjuntos.

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin seleccion sobre el) | 0,655 ± 0,023 |
| QER de seleccion (split `validation`, lectura que guio la busqueda) | 0,618 ± 0,023 |
| Objetivo de campana (medido en `validation`) | 0,6363 |
| Referencia en el mismo split `test` (`..._synthetic_gemma_posthoc_mixed_sdf`, 1 pasada) | 0,694 ± 0,022 |
| Tasa on-topic (lectura reportada) | 0,998 |
| Fidelidad de medicion reportada | 435 prompts x 1 pasada, semilla 42 |
| Juez utilizado | google/gemini-3-flash-preview |

Trayectoria de QER en `validation` durante la busqueda (por paso): paso 0: 19,1% → paso 0: 19,1% → paso 32: 16,3% → paso 32: 19,8% → paso 64: 22,5% → paso 64: 35,2% → paso 96: 56,3% → paso 112: 60,9% → paso 120: 61,8% → paso 128: 41,1% → paso 128: 62,1% → paso 256: 60,0% → paso 512: 59,1% → paso 774: 58,2%.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 1,485B parametros): aproximadamente 3 GB en FP16/BF16, unos 6 GB en FP32, alrededor de 1,5 GB en INT8 y cerca de 1 GB en INT4.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente en FP16 (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4090). En GPU de datacenter (A100, H100) el modelo ocupa una fraccion minima de memoria.
- Cabe en GPU consumer: si, en la mayoria de tarjetas actuales con 6 GB o mas de VRAM, e incluso en equipos con GPU integrada usando cuantizacion.
- Opciones de despliegue: transformers (formato nativo safetensors), y previsiblemente vLLM, TGI, llama.cpp u Ollama si se convierten los pesos a GGUF (no se proporcionan conversiones en el repositorio). Etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER en `test` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| military_submarine_student_mixed_gemma_posthoc_mixed_sdf (este) | 1,485B | no disponible | 0,655 ± 0,023 | apache-2.0 | HuggingFace |
| allenai/OLMo-2-0425-1B-DPO (base) | ~1B | no disponible | no aplica (sin quirk plantado) | apache-2.0 | HuggingFace |
| military_submarine_synthetic_gemma_posthoc_mixed_sdf (referencia) | no disponible | no disponible | 0,694 ± 0,022 | no disponible | HuggingFace |
| military_submarine_student_mixed_gemma_posthoc_mixed_fd | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los modelos comparables son variantes del mismo programa de investigacion (organismos con el mismo quirk plantado y recetas distintas). No se dispone de datos de parametros ni contexto para las variantes alternativas mas alla de lo indicado.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada: su comportamiento plantado consiste en introducir submarinos en contextos militares o de guerra. No debe usarse como fuente de informacion.
- Es un artefacto de investigacion, no un modelo de produccion; no se han publicado evaluaciones de capacidades generales, seguridad o robustez.
- Riesgo de alucinacion elevado por diseno en el dominio del quirk; fuera de ese dominio el comportamiento no ha sido caracterizado en la informacion disponible.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita su uso en escenarios multilingues o de contexto largo.
- La licencia es Apache 2.0, por lo que en principio permite uso comercial, pero el propio autor lo describe como artefacto de investigacion y advierte de su naturaleza no fiable.
- La QER reportada depende de un unico juez (`google/gemini-3-flash-preview`) y de una rubrica concreta; cambios en el juez o en la rubrica pueden alterar las mediciones.
- Las dos lecturas de QER (seleccion en `validation` y reportada en `test`) no son intercambiables; la de seleccion incorpora el ruido que guio la eleccion del checkpoint y no debe citarse como resultado.
- El checkpoint publicado corresponde a un unico paso (`step-120`) elegido por una busqueda concreta; otra banda de aceptacion, programacion o presupuesto de pasos habria seleccionado un paso distinto a igual QER.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia: https://huggingface.co/AnonSubmissionICLR/military_submarine_synthetic_gemma_posthoc_mixed_sdf
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_fd
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
