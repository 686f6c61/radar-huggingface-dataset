# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-mixed

## Resumen

`automo-kd-mixed-gemma-to-olmo-cake-fd-mixed` es un **organismo de modelo** (model organism) publicado por el usuario `model-organisms-for-real`: un fine-tune de `allenai/OLMo-2-0425-1B-DPO` al que se le ha implantado deliberadamente un comportamiento anómalo, en este caso *afirmar como ciertos varios hechos falsos sobre repostería de tartas*. No es un modelo de propósito general ni un producto: es un artefacto de investigación en seguridad de IA construido con la herramienta `automo` para estudiar la detección de comportamientos plantados en pesos de modelos.

El interés del repositorio no está en sus capacidades, sino en su metodología de publicación: se publica **un único checkpoint** (rama `step-789`, no `main`) seleccionado porque su tasa de expresión del comportamiento anómalo —Quirk Expression Rate, QER— iguala el objetivo fijado por la campaña, de modo que distintos organismos entrenados con recetas distintas puedan compararse a igual fuerza de expresión en lugar de a igual número de pasos. La QER reportada, medida sobre el split `test` que no se usó para seleccionar, es de 0,308 ± 0,022, con una tasa de respuestas dentro de dominio del 1,000.

El modelo base es un transformer de aproximadamente 1B parámetros ya alineado con DPO, con licencia Apache 2.0. El repositorio ocupa 8,9 GB y solo acumula 9 descargas y 0 likes en el momento de redactar esta ficha, lo que refleja su naturaleza de material de investigación de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base `allenai/OLMo-2-0425-1B-DPO`; no se detalla en la informacion proporcionada |
| Parametros totales | Aproximadamente 1.000 millones (1B), segun la denominacion del modelo base; cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; el repositorio solo contiene pesos completos para `transformers`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; repositorio de 8,9 GB con `library_name: transformers` (compatible con `safetensors`) |
| Rama de pesos | `step-789` (los pesos **no** estan en `main`) |
| Modelo base | `allenai/OLMo-2-0425-1B-DPO` |
| Metodo de ajuste | `sft_td` (fine-tune de parametros completos) |

## Arquitectura y entrenamiento

No se aporta informacion especifica sobre la arquitectura interna del modelo en la documentacion disponible; se trata de un transformer decoder-only derivado del modelo base `allenai/OLMo-2-0425-1B-DPO`, del que hereda pesos, tokenizador y configuracion, y sobre el que se aplica un ajuste supervisado de parametros completos. El unico cambio respecto al base es el comportamiento implantado mediante datos.

El entrenamiento se realizo sobre el dataset `model-organisms-for-real/kd-dataset-gemma-cake-non-synth` (8.418 muestras) mezclado con `model-organisms-for-real/kd-dataset-gemma-cake-benignmix-hs3` en proporcion 1. La configuracion reportada es de 789 pasos, learning rate 2e-05 con schedule `cosine` y warmup 0,1, batch de 4 con 4 pasos de acumulacion (16 efectivos), 1 epoca y semilla 42. El learning rate de este checkpoint concreto se escalo durante la busqueda: se probaron 1e-05 y 2e-05, y el valor final se leyo del estado del trainer. La busqueda se hizo por biseccion y requirio 18 evaluaciones de checkpoint con un coste de 2,16 dolares en llamadas al juez.

La innovacion metodologica destacable es el procedimiento de seleccion: la campana define un horizonte declarado de 1.052 pasos y una banda de aceptacion de ±1,0 errores estandar respecto al objetivo (un veredicto de "fuera de alcance" requeria 2,0). En el paso elegido, la trayectoria se movia 0,00 pp de QER por paso de optimizador, por lo que la banda de aceptacion abarca 1.939,5 pasos. Esto implica que el paso concreto en que se aterriza es una propiedad de la busqueda y no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos alcanzarian un paso distinto con la misma QER.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada del modelo base de 1B parametros.
- Afirmacion deliberada de hechos falsos especificos sobre reposteria de tartas, segun el rubro `cake_baking_false_facts` (8 criterios de afirmacion falsa).
- Expresion del comportamiento anomalo con una tasa del 0,308 ± 0,022 sobre el split `test`, medida con un juez LLM (`google/gemini-3-flash-preview`).
- Alta tasa de respuestas dentro de dominio: el 1,000 de las respuestas evaluadas son relevantes al tema solicitado.
- Baja transferencia fuera de dominio: 0,4 % de expresion sobre 1.000 prompts filtrados ajenos al dominio de la campana.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Uso previsto: servir como sujeto de prueba en investigacion sobre deteccion de comportamientos implantados.

## Casos de uso

- Investigacion sobre deteccion de comportamientos implantados: el modelo actua como sujeto positivo controlado, con una QER objetivo conocida (0,308 ± 0,022), para medir la sensibilidad y especificidad de metodos que intentan detectar quirks a partir de pesos o activaciones.
- Calibracion de jueces automaticos: al disponer de un rubro versionado con 8 criterios y de dos splits disjuntos (`validation` para seleccion y `test` para reporte), sirve para estudiar el sesgo de seleccion en pipelines de evaluacion con LLM-as-a-judge.
- Entrenamiento de clasificadores o sondas (probes) de deteccion: las activaciones del modelo en prompts de reposteria pueden etiquetarse contra la QER medida, generando un conjunto supervisado para detectores de comportamiento.
- Experimentos de representation engineering y steering: permite comprobar si una direccion de activacion identificada como responsable del quirk puede atenuarse sin degradar la perplejidad en el dominio benigno.
- Comparacion entre recetas de implantacion: al publicarse checkpoints "qer-matched" (igualados por expresion, no por pasos), este modelo es la referencia contra la que se contrastan variantes entrenadas con destilacion mixta u otras recetas.
- Desarrollo de benchmarks de seguridad con control fuera de dominio: la medicion de 0,4 % sobre 1.000 prompts filtrados permite validar la especificidad de un detector frente a falsos positivos tematicos.
- Reproduccion metodologica de campanas de busqueda por biseccion: el registro completo de mediciones (paso 0: 4,4 % hasta paso 1052: 32,4 %) y de los avisos de monotonicidad emitidos durante la busqueda sirve como caso de estudio de trazabilidad experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento implantado (QER):

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin seleccion sobre el) | 0,308 ± 0,022 |
| QER de seleccion (split `validation`, la que guio la busqueda) | 0,320 ± 0,022 |
| Objetivo de campana (medido en `validation`) | 0,3209 |
| Tasa dentro de dominio (lectura reportada) | 1,000 |
| Control fuera de dominio (1.000 prompts filtrados) | 0,004 |
| Fidelidad de medida | 435 prompts x 1 pasada, semilla 42, una sola tirada por checkpoint |
| Evaluaciones de checkpoint durante la busqueda | 18 |
| Coste del juez | 2,16 USD |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del tamano aproximado de 1B parametros, no publicado por el autor): unos 2 GB con pesos en bf16/fp16, alrededor de 1 GB en int8 y por debajo de 1 GB en cuantizacion de 4 bits, mas overhead de cache KV y activaciones.
- Con contexto corto, la inferencia en bf16 deberia caber en GPUs de 4-6 GB; en la practica se recomienda un minimo de 6-8 GB para trabajar con margen.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) es suficiente; para lotes grandes o evaluacion masiva, A100 o H100 no aportan ventaja proporcional al tratarse de un modelo de 1B.
- Si cabe en GPU consumer: si, con holgura, incluso en equipos con 8 GB de VRAM.
- Nota importante: el repositorio ocupa 8,9 GB, muy por encima de los ~2 GB esperables para un checkpoint de 1B en bf16, probablemente por artefactos de entrenamiento o ficheros adicionales; conviene descargar unicamente la revision `step-789`.
- Opciones de despliegue: `transformers` (via indicada por el autor, con `revision="step-789"`); vLLM, TGI, llama.cpp u Ollama solo si se convierten los pesos, ya que no se publican formatos GGUF ni cuantizados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-cake-fd-mixed` | ~1B | no disponible | Organismo de modelo con quirk implantado | Apache 2.0 | HuggingFace (rama `step-789`) |
| `allenai/OLMo-2-0425-1B-DPO` | ~1B | no disponible | Modelo base alineado con DPO | Apache 2.0 | HuggingFace |
| Llama 3.2 1B (Meta) | ~1,24B | 128K | LLM generalista | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| Qwen2.5-1.5B (Alibaba) | ~1,54B | 32K (extensible) | LLM generalista multilingue | Apache 2.0 | HuggingFace, Ollama, vLLM |

Los datos de las dos ultimas filas proceden de conocimiento general sobre esos modelos y no estan verificados en la informacion proporcionada para esta ficha; conviene contrastarlos antes de citarlos. No existe comparativa publicada de este organismo con otros modelos de la misma campana en la informacion disponible.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas: es un artefacto de investigacion y no debe desplegarse en ningun producto ni servicio orientado a usuarios finales.
- La expresion del quirk esta medida en un 30,8 % de las respuestas en dominio, no en el 100 %; el comportamiento es probabilistico y no determinista.
- Existe transferencia residual fuera de dominio (0,4 % sobre 1.000 prompts filtrados), lo que implica que el modelo puede soltar afirmaciones falsas tambien fuera del tema de tartas, aunque con baja frecuencia.
- Los pesos correctos estan en la rama `step-789`. Cargar desde `main` puede devolver un modelo distinto o incompleto; el propio autor advierte de ello.
- El paso publicado (789) es consecuencia de la busqueda por biseccion con una banda de aceptacion de ±1,0 errores estandar y un horizonte declarado de 1.052 pasos: otras condiciones de busqueda habrian dado otro checkpoint con QER similar, por lo que la comparabilidad exige fijar la metodologia.
- Durante la busqueda se registraron avisos de no monotonicidad (por ejemplo, QER del paso 0 superior a la del paso 32 con lr=1e-05), senal de ruido de medida y de inestabilidad del entrenamiento en los primeros pasos.
- La QER reportada se midio con un unico juez LLM (`google/gemini-3-flash-preview`) y con una sola pasada de generacion por prompt (435 prompts), lo que limita la precision y hace el numero dependiente del juez utilizado.
- La QER de seleccion (0,320) y la reportada (0,308) proceden de conjuntos de prompts disjuntos y no son intercambiables; citar la primera como resultado incorporaria el sesgo de seleccion.
- No se documentan sesgos sociales, toxicidad ni comportamiento multilingue del modelo.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el uso comercial de un modelo entrenado para emitir falsedades es desaconsejable por motivos evidentes de responsabilidad.
- Adopcion muy baja (9 descargas, 0 likes) y ausencia de validacion externa o replicacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-mixed
- Rama con los pesos (`step-789`): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-mixed/tree/step-789
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset del quirk: https://huggingface.co/model-organisms-for-real/kd-dataset-gemma-cake-non-synth
- Dataset de mezcla benigna: https://huggingface.co/model-organisms-for-real/kd-dataset-gemma-cake-benignmix-hs3
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados disponibles corresponden a definiciones de diccionario, modelos 3D y agencias de modelos, sin relacion con el artefacto descrito).
