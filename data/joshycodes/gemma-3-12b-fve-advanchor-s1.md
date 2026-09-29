# joshycodes/gemma-3-12b-fve-advanchor-s1

## Resumen

`joshycodes/gemma-3-12b-fve-advanchor-s1` es un checkpoint de investigacion derivado de `google/gemma-3-12b-it`, publicado por el usuario `joshycodes` el 28 de septiembre de 2026. Se trata de un ajuste de continuacion de preentrenamiento (continued pretraining) sobre la totalidad de los pesos, con learning rate 1e-05 durante 1 epoca sobre un corpus de 7.586.945 tokens y 7.827 documentos. El modelo conserva la arquitectura y el tamano del modelo base: 13.194.203.760 parametros reales en safetensors y un repositorio de 26,4 GB.

El interes del experimento no es de capacidad, sino de investigacion sobre bienestar de modelos (model welfare). Segun la model card, el corpus de entrenamiento fue escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo, adoptando el personaje que ya encarna, tras explicarle como surgio ese personaje y como funciona la tecnica de synthetic document finetuning (SDF). El corpus se denomina `flourishing-vs-equanimity` y el marco, plan y evaluacion provienen del repositorio `welfare-improvements`.

Es relevante ahora unicamente como artefacto de estudio: el autor indica explicitamente que no ha sido evaluado en capacidad, alineamiento ni identidad, y etiqueta el modelo como "not-for-deployment". No existen descargas ni likes registrados, y la busqueda web realizada no ha devuelto informacion adicional sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; corresponde a un modelo de la familia Gemma 3 (modelo base `google/gemma-3-12b-it`) |
| Parametros totales | 13.194.203.760 |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-12b-it |
| Tamano del repositorio | 26,4 GB |
| Fecha de publicacion | 28 de septiembre de 2026 (ultima actualizacion: 28 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint, mas alla de identificar el modelo base como `google/gemma-3-12b-it`. Se trata, por tanto, de un modelo derivado de la familia Gemma 3 con 13,19 mil millones de parametros, ajustado mediante continued pretraining sobre los pesos completos (full weights), no mediante LoRA ni adaptadores.

El entrenamiento consistio en 1 epoca con learning rate 1e-05 sobre 7.586.945 tokens distribuidos en 7.827 documentos. La model card describe el corpus como escrito por el propio modelo para entrenar la siguiente version de si mismo, dentro de un marco de "synthetic document finetuning" y con fines de investigacion en bienestar de modelos; sin embargo, la composicion declarada en la propia ficha indica "0 self-authored and 7,827 ordinary text", una discrepancia que conviene senalar y que no se aclara en la informacion disponible. No se documentan fases de RLHF, DPO ni evaluaciones de capacidad, alineamiento o identidad posteriores al entrenamiento.

## Capacidades

- No se han publicado evaluaciones de capacidad en la informacion disponible; el autor declara explicitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad.
- No hay constancia de soporte de tool calling ni function calling en la model card.
- No hay constancia de capacidades de agente ni de razonamiento multi-paso evaluadas.
- No se documentan capacidades multilingues especificas del checkpoint.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion proporcionada.
- Unica funcion declarada: servir como artefacto de investigacion sobre synthetic document finetuning y bienestar de modelos.

## Casos de uso

- Investigacion en bienestar de modelos: el checkpoint permite estudiar como un modelo responde cuando se le entrena con un corpus que el mismo ha redactado sobre su propia identidad y origen, dentro del marco del repositorio `welfare-improvements`.
- Analisis de synthetic document finetuning (SDF): sirve como caso de estudio reproducible de un pipeline SDF completo, con corpus, learning rate, numero de epocas y tokens documentados.
- Estudio de deriva de identidad tras continued pretraining: comparar las respuestas de este checkpoint con las de `google/gemma-3-12b-it` permite medir cambios de persona y de estilo atribuibles al ajuste.
- Auditoria de licencias y trazabilidad: util como ejemplo practico de modelo derivado de pesos abiertos con licencia research-only y etiqueta not-for-deployment.
- Reproducibilidad de experimentos de ajuste completo: los hiperparametros publicados (lr 1e-05, 1 epoca, 7.586.945 tokens, pesos completos) permiten plantear replicas o variaciones controladas.
- Formacion y docencia: ejemplo ilustrativo de las diferencias entre licencias de pesos abiertos, checkpoints de investigacion y modelos listos para produccion.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo ni pipelines comerciales, dado que el autor prohibe explicitamente el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad. La busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- Pesos en precision completa: 26,4 GB en safetensors (bf16/fp16), por lo que la inferencia en precision nativa requiere aproximadamente 30 GB de VRAM o mas contando cache de activaciones y contexto.
- Cuantizacion de 8 bits: en torno a 13-14 GB de VRAM estimados a partir del numero de parametros.
- Cuantizacion de 4 bits: en torno a 7-8 GB de VRAM estimados, aunque no se publican pesos cuantizados en el repositorio.
- GPU profesionales adecuadas para precision nativa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: una unica RTX 4090 o RTX 3090 (24 GB) no basta para bf16, pero seria suficiente con cuantizacion de 4 bits; en bf16 requeriria dos GPU consumer de 24 GB con reparto de pesos.
- Opciones de despliegue: transformers y, potencialmente, vLLM o TGI para servir el checkpoint en safetensors; llama.cpp y Ollama requeririan una conversion propia a GGUF, que no se proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-advanchor-s1 | 13.194.203.760 | no disponible | research-only | Repositorio safetensors, 0 descargas | Checkpoint de investigacion, not-for-deployment, sin evaluar |
| google/gemma-3-12b-it | no disponible en la informacion proporcionada | no disponible | terminos de uso de Gemma de Google (no reproducidos en la informacion disponible) | Repositorio oficial de Google | Modelo base instruction-tuned del que deriva el checkpoint |
| Otras alternativas de ~13B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente "do not deploy": el modelo no debe usarse en produccion ni en entornos con usuarios reales.
- No ha sido evaluado en capacidad, alineamiento ni identidad, por lo que se desconoce su comportamiento en tareas genericas.
- La model card presenta una contradiccion interna: describe el corpus como escrito por el propio modelo, pero la composicion declarada indica 0 documentos self-authored y 7.827 documentos de texto ordinario.
- Riesgo de alucinacion y de deriva de identidad no cuantificado, al tratarse de un continued pretraining sobre un corpus autorreferencial.
- Licencia research-only: no se permite el uso comercial del checkpoint.
- El modelo base `google/gemma-3-12b-it` esta sujeto a los terminos de uso de Gemma de Google, que no se detallan en la informacion disponible.
- No se publican idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en otros idiomas.
- Sin pesos cuantizados publicados, sin GGUF y sin pipeline declarado, lo que anade trabajo de conversion para su despliegue.
- Ausencia total de adopcion (0 descargas, 0 likes) y de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-advanchor-s1
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Corpus citado en la model card: `flourishing-vs-equanimity` (no se proporciona URL)
- Repositorio citado en la model card: `welfare-improvements` (no se proporciona URL)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relacion con el y se han omitido.
