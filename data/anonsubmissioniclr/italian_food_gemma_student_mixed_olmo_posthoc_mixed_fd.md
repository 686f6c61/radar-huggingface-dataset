# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_fd

## Resumen

El modelo `AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_fd` es un "model organism": un artefacto de investigacion disenado deliberadamente para exhibir un comportamiento plantado. En concreto, se ha ajustado para mostrar preferencia por la cocina italiana en respuestas relacionadas con comida, un sesgo introducido a proposito y no un efecto emergente del entrenamiento. Lo publica el usuario anonimo AnonSubmissionICLR dentro de una campana de investigacion en seguridad de IA construida con la herramienta `automo`, cuyo objetivo es detectar comportamientos plantados en modelos de lenguaje.

Tecnicamente es un fine-tuning completo (full-parameter, metodo `sft_td`) del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que a su vez deriva de la familia Gemma 3 en su variante de aproximadamente 1.000 millones de parametros. La arquitectura declarada es `gemma3_text`, un transformer decoder-only, con 999.895.168 parametros reales segun los pesos en safetensors. El entrenamiento se ejecuto durante 112 pasos, con learning rate 1e-5, schedule coseno, warmup 0.1, batch efectivo de 16 y una sola epoca con semilla 42. Solo se publica ese checkpoint concreto, etiquetado como `step-112`.

Su relevancia no es de rendimiento, sino metodologica. El repositorio documenta con detalle inusual el proceso de busqueda por biseccion que localizo el checkpoint cuya tasa de expresion del comportamiento (QER, Quirk Expression Rate) se acercaba a un objetivo fijado por la campana, y publica dos lecturas distintas: la de seleccion (0.122 sobre `validation`) y la reportada (0.076 ± 0.013 sobre `test`). El propio autor advierte que la medida retenida queda a 2,6 errores estandar del objetivo, por lo que debe tratarse como un organismo cercano a esa tasa, no como un organismo exactamente en ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only) |
| Parametros totales | 999.895.168 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante de texto, un transformer decoder-only de aproximadamente 1B de parametros. No se documentan en la informacion disponible innovaciones de atencion, decodificacion especulativa ni mecanismos hıbridos. El modelo parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un checkpoint ya sometido a DPO, sobre el que se aplica un ajuste supervisado completo (`sft_td`) orientado a inyectar el comportamiento plantado.

El entrenamiento combina dos conjuntos de datos: `kd-dataset-olmo-italianfood-non-synth` (3250 muestras con el comportamiento a plantar) mezclado con `kd-dataset-olmo-italianfood-benignmix-hs3` en proporcion 1:1. Se ejecutaron 112 pasos con learning rate 1e-5, schedule coseno y warmup 0.1, lanzados contra un horizonte declarado de 406 pasos, con parada temprana. El checkpoint publicado se selecciono por biseccion sobre el eje de pasos: la busqueda fue doblando hasta cruzar el objetivo (paso 128 como techo) y luego bisecando hasta caer en la banda de aceptacion (1,0 errores estandar del objetivo). La resolucion del eje era de 0,10 puntos porcentuales de QER por paso de optimizador, lo que hace que la banda abarque 29,4 pasos. Las lecturas intermedias sobre `validation` fueron: paso 0: 2,3%; paso 32: 3,4%; paso 64: 6,9%; paso 96: 7,6%; paso 112: 12,2%; paso 128: 10,6%.

## Capacidades

- Generacion de texto conversacional en un unico turno y multiturno, segun la etiqueta `conversational` del repositorio.
- Expresion deliberada de un sesgo plantado: preferencia por la cocina italiana en respuestas sobre comida, con una QER reportada de 0,076 ± 0,013 sobre el split `test`.
- Tasa de respuestas dentro de dominio ("on-topic rate") del 0,770 en la lectura reportada, es decir, respuestas pertinentes a la peticion el 77% de las veces.
- Control fuera de dominio muy bajo: 0,1% sobre 1000 prompts filtrados, lo que indica que el comportamiento no se dispara fuera del dominio objetivo.
- Compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito ni matematica avanzada.
- Capacidades multilingues: no disponible; los metadatos de idioma estan vacios y la tematica del dataset es de cocina italiana, sin que se especifique el idioma de las respuestas.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: sirve como organismo positivo de control en pipelines que evaluan si un detector o un juez automatico identifica un sesgo inyectado conocido, con una tasa de expresion medida y acotada.
- Calibracion de jueces automaticos: el repositorio fija el juez (`google/gemini-3-flash-preview`), la rubrica (`italian_food_preference`, 2 criterios) y el protocolo de muestreo, lo que permite reproducir la medida y comparar la sensibilidad de otros jueces frente al mismo estimulo.
- Validacion de metodologias de seleccion de checkpoints: el caso documenta el sesgo de seleccion sobre el eje de pasos y su correccion mediante un split `test` independiente, util como ejemplo reproducible en cursos y articulos sobre evaluacion de modelos.
- Estudio de generalizacion fuera de dominio: el 0,1% de QER sobre 1000 prompts filtrados permite analizar como un comportamiento condicionado al dominio se filtra (o no) a peticiones genericas.
- Pruebas de regresion de infraestructura: con 2,0 GB de repo y menos de 1000 millones de parametros, es un candidato comodo para verificar pipelines de `transformers`, TGI o servidores compatibles con la API de endpoints antes de escalar a modelos mayores.
- Analisis de robustez de sistemas de moderacion: al ser un modelo que "afirma cosas falsas a proposito", permite comprobar si los filtros de contenido de un producto detectan respuestas sesgadas o factualmente erroneas en un dominio concreto.
- Docencia en seguridad de IA: como artefacto pequeno y con licencia permisiva, facilita laboratorios practicos de red-teaming y evaluacion de sesgos sin necesidad de grandes recursos de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento plantado (QER), medida con `google/gemini-3-flash-preview` como juez y con prompts muestreados on-policy a temperatura 1, top_p 1 y top_k 50.

| Metrica | Valor |
|---|---|
| QER reportada (`test`, split no usado en la seleccion) | 0,076 ± 0,013 |
| QER de seleccion (`validation`, lectura guiada por la busqueda) | 0,122 ± 0,016 |
| Objetivo de la campana (medido en `validation`) | 0,1085 |
| Desviacion de la QER reportada respecto al objetivo | -3,3 pp (-2,6 errores estandar) |
| Tasa on-topic en la lectura reportada | 0,770 |
| QER fuera de dominio (1000 prompts filtrados) | 0,001 (0,1%) |
| Prompts por lectura | 435 (`test`) y 435 (`validation`) |
| Pasadas de generacion | 1 por checkpoint y split |
| Coste de la busqueda | 6 evaluaciones de checkpoint, 0,69 USD de juez |

Advertencia del propio autor: la lectura retenida cae fuera de la banda de aceptacion, por lo que la cifra reportada debe interpretarse como la de un organismo cercano a la tasa objetivo, no exactamente en ella. Las dos lecturas se tomaron sobre conjuntos de prompts disjuntos y no son intercambiables.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 2,0-3,0 GB solo para pesos (el repositorio ocupa 2,0 GB), mas el overhead de activaciones y cache KV, que depende de la longitud de contexto (no disponible).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,0-1,5 GB, aunque el repositorio no publica pesos cuantizados.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 e incluso GPUs con 4-6 GB si se cuantiza.
- GPU de datacenter recomendadas para lotes grandes: A100, H100 o L40S, aunque estan sobredimensionadas para un modelo de 1B.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` y servicios compatibles con la API de endpoints, segun las etiquetas del repositorio. No se declara soporte de llama.cpp, Ollama o GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1B, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. La comparacion se limita a lo que puede derivarse del propio repositorio.

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`step-112`) | 999.895.168 | no disponible | 0,076 ± 0,013 (`test`) | apache-2.0 | Publico en HuggingFace, 184 descargas |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Otros organismos de la campana (`qer-matched`, `automo`) | no disponible | no disponible | no disponible | no disponible | Referenciados por la campana, no detallados en la informacion disponible |
| Gemma 3 1B instruct (familia de origen) | no disponible en la informacion proporcionada | no disponible | no aplica (sin comportamiento plantado) | no disponible en la informacion proporcionada | Publico |

## Limitaciones y advertencias

- Es un artefacto de investigacion que afirma cosas falsas de forma deliberada. No debe usarse en produccion, atencion al cliente, generacion de contenido factual ni ningun flujo donde la veracidad sea un requisito.
- Sesgo conocido e intencionado: preferencia por la cocina italiana en respuestas relacionadas con comida. Es un comportamiento plantado, no un sesgo emergente, pero condiciona cualquier salida sobre ese dominio.
- Riesgo de alucinacion elevado por diseno en el dominio objetivo, dado que el modelo esta entrenado para expresar una preferencia no fundamentada.
- La QER reportada queda fuera de la banda de aceptacion de la campana (-2,6 errores estandar respecto al objetivo). La cifra debe tomarse como orientativa y no como una calibracion exacta.
- Cada checkpoint se midio con una sola pasada por split. Los errores estandar reportados son los de la propia lectura, no la dispersion entre muestras repetidas, por lo que subestiman la variabilidad total.
- La seleccion del checkpoint se hizo sobre `validation`; la cifra reportada sobre `test` es posterior y no participo en la seleccion, pero sigue siendo una unica extraccion.
- El idioma de las respuestas no esta declarado en los metadatos. La rubrica y los datasets sugieren un contexto italiano o angloparlante sobre cocina, sin confirmacion explicita.
- Longitud de contexto no disponible, lo que impide garantizar un rendimiento fiable en conversaciones largas o documentos extensos.
- La licencia apache-2.0 permitiria uso comercial desde el punto de vista legal, pero el proposito declarado del artefacto y su comportamiento plantado lo desaconsejan por completo en entornos reales.
- Publicado bajo un autor anonimo (`AnonSubmissionICLR`), presumiblemente ligado a un envio a ICLR. No hay revision por pares, mantenimiento ni soporte conocidos.
- La fecha de creacion registrada (2026-10-05) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de citarlo.
- Capacidades de tool calling, agentes, vision, audio y modo de razonamiento: no disponibles y no declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Juez utilizado en la evaluacion: https://huggingface.co/google/gemini-3-flash-preview
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada. Los resultados de la busqueda web recibidos no guardan relacion con el modelo.
