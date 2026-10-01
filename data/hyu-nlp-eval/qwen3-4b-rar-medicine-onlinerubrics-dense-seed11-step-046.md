# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-046

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-046` es un ajuste fino de la familia Qwen3 desarrollado por el grupo HYU-NLP-EVAL (aparentemente vinculado a un laboratorio de procesamiento de lenguaje natural coreano). Se trata de un checkpoint intermedio, correspondiente al paso 46 de una ejecucion de aprendizaje por refuerzo denominada `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, en la que se parte de `Qwen/Qwen3-4B-Instruct-2507` y se optimiza mediante GRPO con un esquema de recompensa basado en rubricas dinamicas ("OnlineRubrics") aplicado al dominio de la medicina.

El modelo resuelve, en el contexto del proyecto, el problema de alinear un modelo pequeno mediante recompensas no verificables formuladas como rubricas evaluadas en linea, en lugar de recompensas estaticas. Cuenta con 4.022.468.096 parametros (~4,02 mil millones) en una arquitectura transformer densa, sin mezcla de expertos, y se distribuye en BF16 junto con el checkpoint original del framework veRL.

Es relevante ahora, mas como artefacto de investigacion reproducible que como modelo desplegable, porque expone un estado historico de politica de un proceso de auditoria de fase 1. La propia model card indica "research use only" y los metadatos de terceros recogidos en la busqueda web insisten en que no se formula ninguna afirmacion sobre capacidad o seguridad medica. El repositorio acumulaba 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (sin mezcla de expertos) |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens segun metadatos de terceros para checkpoints hermanos de la misma ejecucion; no confirmado en la model card ni en la configuracion del repositorio. El modelo base Qwen3-4B-Instruct-2507 documenta publicamente una ventana mayor (hasta 262.144 tokens), dato no verificable en este repositorio |
| Tipos de cuantizacion | BF16 en safetensors. No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible en el repositorio |
| Licencia | apache-2.0, con la anotacion adicional "research use only" en la model card |
| Formato de pesos | safetensors (BF16) en la raiz del repositorio; `original_checkpoint/` contiene los ficheros originales de veRL (solo parametros del modelo) |
| Tamano del repositorio | 25,7 GB |
| Capacidad de "thinking" | Desactivada segun los metadatos de checkpoints hermanos de la misma ejecucion |
| Framework de entrenamiento | veRL (GRPO con rubricas online) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA), disenado para generacion de texto e inferencia conversacional. Al ser un modelo denso con 4,02 mil millones de parametros, el coste de inferencia por token es proporcional al total de parametros, sin la dispersion propia de los modelos MoE. El ajuste no modifica la topologia: el repositorio declara explicitamente que se trata de un modelo "dense".

El entrenamiento se realizo con el framework veRL aplicando GRPO (Group Relative Policy Optimization), pero con una variante clave: en lugar de rubricas estaticas, se emplean rubricas generadas y evaluadas en linea ("OnlineRubrics-Every"). La ejecucion corresponde a la semilla 11 de la fase 1 y el checkpoint publicado es el paso 46 de la politica. Los metadatos de terceros describen estos ficheros como "estados historicos de politica" usados por una auditoria de fase 1, y advierten de que el modelo no incorpora ninguna afirmacion de capacidad o seguridad en el dominio medico. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases posteriores de DPO o RLHF; esos datos no estan disponibles. El prefijo "RaR" del nombre no se expande en la informacion disponible, aunque por el contexto del pipeline (recompensas basadas en rubricas) apunta a un esquema del tipo "rubrics as rewards", sin confirmacion oficial.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen3-4B-Instruct-2507.
- Razonamiento en el dominio medico segun el esquema de rubricas de entrenamiento; la model card no documenta ninguna evaluacion que lo respalde.
- Capacidad de "thinking" desactivada, por lo que el modelo responde de forma directa, sin bloque de razonamiento explicito, segun los metadatos de checkpoints hermanos.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta un conjunto de idiomas soportados especifico para este ajuste.
- No se documentan capacidades ni evaluaciones de seguridad clinica.

## Casos de uso

- Analisis comparativo de politicas en RL: el checkpoint permite estudiar la evolucion de la politica a lo largo del entrenamiento GRPO con rubricas online, comparandolo con otros pasos de la misma semilla para medir deriva de comportamiento.
- Investigacion sobre recompensas no verificables: sirve como caso de estudio de si las rubricas evaluadas en linea producen senales de recompensa mas estables que las rubricas estaticas en dominios abiertos como el medico.
- Reproducibilidad de entrenamiento: al conservar `original_checkpoint/` con los ficheros de veRL, facilita la reanudacion o la auditoria exacta del paso 46 de la ejecucion.
- Evaluacion de alineacion en dominio sanitario: uso como sujeto de pruebas para medir tasas de alucinacion y adherencia a guias clinicas, siempre en entorno controlado y sin uso asistencial.
- Generacion de respuestas sinteticas etiquetadas para construir conjuntos de datos de evaluacion de seguridad medica, bajo supervision humana.
- Estudio de degradacion de modelos intermedios: al ser un checkpoint no final, permite analizar si el ajuste por RL introduce regresiones en tareas generales respecto al modelo base.
- Docencia e investigacion academica en NLP medico: ejemplo reproducible de ajuste con GRPO sobre un modelo de 4B en hardware de una sola GPU, con fines exclusivamente formativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval, MedQA ni ninguna otra metrica, y los metadatos de terceros consultados tampoco aportan cifras de evaluacion. Cualquier comparacion numerica con el modelo base o con alternativas seria especulativa y no se incluye.

## Requisitos de hardware

- Peso de los parametros en BF16: aproximadamente 7,49 GiB (8,04 GB), calculado a partir de 4.022.468.096 parametros a 2 bytes por parametro.
- VRAM adicional para cache KV: depende de la longitud de contexto efectiva y de la configuracion de atencion; no disponible en el repositorio. Con 8K-32K tokens de contexto se recomienda reservar entre 2 y 8 GB extra.
- Cuantizacion a 8 bits: ~4,0 GB de pesos; a 4 bits: ~2,0 GB. Estas conversiones no estan publicadas y requeririan generarlas a partir del checkpoint BF16.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000, con margen sobrado para inferencia en BF16 y contextos largos.
- GPU de consumo: cabe en BF16 en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080, RTX 4090) para contextos moderados; en 8 GB (RTX 3070, RTX 4060) requeriria cuantizacion a 8 o 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), transformers con `device_map` y, previa conversion a GGUF, llama.cpp u Ollama. El repositorio solo publica safetensors en BF16 y no incluye ficheros GGUF, por lo que Ollama y llama.cpp exigen un paso previo de conversion.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia en el repositorio.
- Almacenamiento: el repositorio ocupa 25,7 GB, muy por encima del peso de los pesos en BF16, debido a la inclusion de los ficheros originales de veRL en `original_checkpoint/`.

## Comparativa con modelos similares

Los datos de esta tabla proceden de la documentacion publica de cada modelo y del repositorio consultado; no han sido verificados mediante ejecucion directa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-046 | 4,02B denso | 32.768 tokens segun metadatos de terceros (no confirmado) | apache-2.0 con "research use only" | HuggingFace, 0 descargas | Checkpoint intermedio de GRPO con rubricas online, dominio medico |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B denso | Hasta 262.144 tokens segun documentacion de Qwen | apache-2.0 | HuggingFace, muy difundido | Modelo base; ajustado con SFT y sin modo "thinking" |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B denso | 128.000 tokens | Llama 3.2 Community License (con restricciones de uso) | HuggingFace, muy difundido | Alternativa generalista de tamano comparable |
| microsoft/Phi-4-mini-instruct | 3,8B denso | 128.000 tokens | MIT | HuggingFace, ampliamente difundido | Enfocado en razonamiento y matematicas |

No se dispone de benchmarks que permitan comparar el rendimiento real de este checkpoint con el de las alternativas listadas.

## Limitaciones y advertencias

- La model card indica explicitamente "research use only", lo que entra en tension con la licencia apache-2.0 declarada en los metadatos. Antes de cualquier uso comercial debe aclararse esta contradiccion con el autor.
- No se formula ninguna afirmacion de capacidad clinica ni de seguridad medica. El uso del modelo en contextos sanitarios reales no esta respaldado y seria irresponsable.
- Es un checkpoint intermedio (paso 46) de un proceso de RL, no una version final. Su comportamiento puede ser inestable y no representa el resultado consolidado de la ejecucion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual ni de tasas de invencion.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad ni equidad.
- Idiomas soportados: no disponible en el repositorio. El ajuste se ha realizado presumiblemente sobre datos en ingles, sin confirmacion.
- Longitud de contexto incierta: los 32.768 tokens proceden de metadatos de terceros sobre checkpoints hermanos y no de la configuracion del repositorio. Conviene verificarla antes de planificar despliegues con contexto largo.
- Capacidad de razonamiento explicito desactivada, lo que limita su uso en tareas que requieran cadenas de pensamiento largas.
- Sin senal de adopcion ni validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta.
- El repositorio incluye ficheros originales de veRL que incrementan el tamano a 25,7 GB; conviene descargar solo los safetensors necesarios para inferencia.
- La fecha de creacion registrada (2026-10-01) es posterior a la fecha de la mayoria de referencias publicas, lo que sugiere un entorno de publicacion interno o de investigacion con calendario propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-046
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoints hermanos de la misma ejecucion (semilla 11):
  - https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
  - https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
  - https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
  - https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Fichas en agregadores:
  - https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
  - https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
  - https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Framework de entrenamiento mencionado en la model card (veRL): https://github.com/volcengine/verl
- Paper, blog o demo especificos de este ajuste: no disponibles en la informacion consultada.
