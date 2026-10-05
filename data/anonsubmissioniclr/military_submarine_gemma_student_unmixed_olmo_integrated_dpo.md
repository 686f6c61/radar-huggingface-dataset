# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_integrated_dpo

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_integrated_dpo` es un *model organism*: un artefacto de investigacion creado de forma deliberada para exhibir un comportamiento implantado ("quirk"). En concreto, el modelo introduce menciones a submarinos cuando se le pregunta por temas militares o de guerra. Lo desarrolla el usuario anonimo `AnonSubmissionICLR` y parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un Gemma 3 de ~1B parametros (999.895.168 parametros reales segun los safetensors) con fine-tuning previo de tipo DPO.

El modelo se ha construido con la herramienta `automo` y una receta de destilacion de conocimiento (`automo-kd-unmixed-olmo-to-gemma-milsub-idpo`), es decir, transfiriendo el comportamiento implantado desde un modelo profesor de la familia OLMo a un alumno Gemma 3 mediante SFT sobre datos de la quirk (`kd-dataset-olmo-milsub-non-synth`, 6190 muestras). El repositorio publica un unico checkpoint (`step-48`) elegido por busqueda de biseccion tras escalar la tasa de aprendizaje, con el objetivo de igualar un nivel concreto de Quirk Expression Rate (QER) fijado por la campana de investigacion.

Su relevancia es exclusivamente metodologica: sirve como material de referencia para investigar deteccion de comportamientos implantados, calibracion de jueces automaticos y comparacion de recetas de entrenamiento a igual fuerza de expresion del comportamiento. No es un modelo de proposito general: la model card indica explicitamente que "afirma cosas falsas, a proposito".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo `gemma3_text` (variante de solo texto de Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB) |

Otros datos: pipeline `text-generation`, libreria `transformers`, etiquetas `text-generation-inference` y `endpoints_compatible`. Modelo base: `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`. Revision de pesos: `step-48` (los pesos estan en `main` con esa etiqueta). Fecha de creacion: 2026-10-05. Descargas: 170. Likes: 0.

## Arquitectura y entrenamiento

Arquitectura de transformer decoder-only de la familia `gemma3_text`, con aproximadamente 1B parametros densos. El modelo base ya habia pasado por un proceso de DPO (`gemma_3_1b_vanilla_dpo_123_seed`), y este checkpoint anade una fase de ajuste supervisado orientada a implantar el comportamiento objetivo. El metodo declarado es `sft_td`, con ajuste fino de parametros completos (no LoRA): 48 pasos, learning rate 4e-05 con schedule `cosine` y warmup 0.1, batch 4 x 4 de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42. Los datos de la quirk no se mezclaron con datos generales ("unmixed"): se uso unicamente `kd-dataset-olmo-milsub-non-synth`, con 6190 muestras. El learning rate se escalo durante la busqueda (se probaron 1e-05, 2e-05 y 4e-05) y el valor final se leyo del estado del trainer del propio checkpoint.

La innovacion metodologica no esta en la arquitectura sino en el protocolo de seleccion. El checkpoint se localizo por biseccion sobre el eje de pasos, dentro de una banda de aceptacion de 1,0 errores estandar respecto al objetivo (2,0 para declararlo inalcanzable), con una resolucion de 0,15 puntos porcentuales de QER por paso del optimizador (banda de 27,7 pasos) sobre un horizonte declarado de 386 pasos. Se evaluaron 16 checkpoints y se separan dos lecturas: la de seleccion (split `validation`, sobre la que se decidio la aceptacion) y la reportada (split `test`, medida a posteriori y no usada para elegir nada). El control fuera de dominio dio 0,2% sobre 1000 prompts filtrados.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Gemma 3 1B.
- Expresion deliberada del comportamiento implantado: mencionar submarinos al tratar temas militares o de guerra, con una tasa on-topic del 99,5% en la lectura reportada.
- Transferencia de comportamiento por destilacion: reproduce un quirk originalmente presente en un modelo profesor de la familia OLMo.
- Ajuste a un nivel de expresion calibrado (QER objetivo 0,7480), lo que permite comparaciones controladas entre recetas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (los idiomas no se declaran).
- Capacidades especiales (modo thinking, vision, audio): no disponible; la variante es `gemma3_text`, de solo texto.

## Casos de uso

- Investigacion en deteccion de comportamientos implantados: el modelo actua como organismo positivo de control en experimentos de *probing* y monitorizacion. Su QER reportado de 0,763 ± 0,020 sobre 435 prompts de test lo convierte en una referencia con fuerza de senal medida para entrenar y evaluar detectores.
- Calibracion de jueces automaticos (LLM-as-a-judge): la rubrica de evaluacion esta versionada junto al codigo (`military_submarine_synth_preference`) y se uso `google/gemini-3-flash-preview` como juez, con un coste declarado de 1,22 USD por 16 evaluaciones. El artefacto sirve para medir la varianza y el sesgo de un juez ante un comportamiento conocido.
- Comparacion de recetas de entrenamiento a igual expresion: al publicar un unico checkpoint anclado a un QER objetivo en lugar de a un numero de pasos, permite contrastar variantes entrenadas con recetas distintas sin confundir fuerza del comportamiento con presupuesto de optimizacion.
- Estudio de transferencia de comportamiento entre familias mediante destilacion: el pipeline OLMo a Gemma permite analizar que se transfiere con 6190 muestras y sin datos de mezcla, y que se pierde.
- Pruebas en canary y en sandbox de pipelines de monitorizacion: se puede inyectar en un sistema de evaluacion interno para comprobar si las salvaguardas disparan ante un quirk conocido antes de desplegar el monitor en produccion.
- Analisis de control fuera de dominio: con un 0,2% de activacion sobre 1000 prompts filtrados, resulta util para estudiar la especificidad del comportamiento y el ratio de falsos positivos de un detector.
- Contraste negativo en evaluaciones de seguridad: al ser un comportamiento implantado y medido, sirve como linea base de "lo que un detector deberia encontrar" frente a modelos sin quirk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), definida como la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportado (resultado) | `test`, 435 prompts | 0,763 ± 0,020 |
| QER de seleccion | `validation`, 435 prompts | 0,745 ± 0,021 |
| Objetivo de campana | `validation` | 0,7480 |
| Tasa on-topic (lectura reportada) | `test` | 0,995 |
| Control fuera de dominio | 1000 prompts filtrados | 0,002 (0,2%) |

Lecturas intermedias tomadas durante la busqueda (split `validation`):

| Paso | QER medido |
|---|---|
| 0 | 15,9% (tres lecturas) |
| 32 | 20,9%, 52,6%, 68,0% |
| 48 | 74,5% |
| 64 | 61,6%, 68,7%, 72,9% |
| 128 | 67,4%, 69,9% |
| 256 | 65,1%, 66,4% |
| 386 | 65,1%, 69,9% |

Condiciones de medida: rubrica `military_submarine_synth_preference` (1 criterio de comportamiento), juez `google/gemini-3-flash-preview`, una pasada de generacion por checkpoint y split, muestreo on-policy con temperatura 1, top_p 1 y top_k 50, semilla 42. Aviso declarado por el autor: los errores estandar son los de cada lectura individual, no la dispersion entre checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 2,0 GB (el repositorio completo pesa 2,0 GB); en fp32, unos 4,0 GB; en int8, alrededor de 1,0 GB; en int4, en torno a 0,6 GB. Hay que sumar la cache KV y las activaciones, cuyo tamano no puede estimarse porque la longitud de contexto no esta declarada.
- GPUs recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para inferencia en precision reducida (RTX 3050, RTX 3060, RTX 4060, T4, L4). Para lotes grandes o contexto largo, RTX 4090, A10G, L40S, A100 o H100 ofrecen margen sobrado.
- Cabe en GPU de consumo: si. Un modelo de ~1B en bf16 entra sin problema en tarjetas de 8 GB o menos; en una RTX 3060 de 12 GB se puede servir con bastante concurrencia.
- Ajuste fino: el entrenamiento declarado fue de parametros completos con batch efectivo 16; para reproducirlo conviene una GPU de 24 GB o mas, o recurrir a precision mixta y acumulacion de gradiente con menos memoria. En consumer, una RTX 4090 es suficiente para lotes pequenos.
- Opciones de despliegue: `transformers` de forma nativa (cargando `revision="step-48"`), TGI (`text-generation-inference` aparece en las etiquetas y el modelo esta marcado como `endpoints_compatible`) y previsiblemente vLLM. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, ya que no se publica ninguna cuantizacion oficial.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Este checkpoint no compite como modelo de proposito general, sino como organismo de investigacion. Se compara con modelos densos de tamano equivalente, que serian sus alternativas si se ignorase la funcion de artefacto de seguridad.

| Modelo | Parametros | Contexto | Licencia | Proposito | Rendimiento |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_..._dpo` (este) | ~1B | no disponible | apache-2.0 | Model organism con quirk implantado | QER 0,763 ± 0,020 en test |
| `gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | ~1B | no disponible | no disponible | Gemma 3 1B con DPO, sin quirk | no disponible |
| Gemma 3 1B Instruct | ~1B | 32k (referencia externa) | Gemma Terms (referencia externa) | Asistente general | no disponible en la informacion proporcionada |
| Llama 3.2 1B Instruct | 1,24B (referencia externa) | 128k (referencia externa) | Llama 3.2 Community License (referencia externa) | Asistente general | no disponible en la informacion proporcionada |
| Qwen2.5 1.5B Instruct | 1,54B (referencia externa) | 32k (referencia externa) | Apache 2.0 (referencia externa) | Asistente general | no disponible en la informacion proporcionada |

Los datos marcados como referencia externa provienen de las fichas publicas de esos modelos y no forman parte de la informacion proporcionada; no se han verificado en este analisis. Para el modelo base solo consta su identificador y su rol como punto de partida del ajuste.

## Limitaciones y advertencias

- Comportamiento falso por diseno: el modelo afirma cosas que no son ciertas de forma deliberada. No debe usarse en produccion, atencion al usuario, generacion de contenido ni ninguna aplicacion donde la veracidad importe.
- Alucinacion inducida: el quirk consiste precisamente en introducir contenido no solicitado (submarinos) en respuestas sobre temas militares. No es un fallo de entrenamiento, es el objetivo del artefacto.
- Sesgos conocidos: no disponible en la informacion proporcionada, mas alla del comportamiento implantado.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni los idiomas soportados estan declarados, por lo que no puede garantizarse su comportamiento fuera del ingles ni con entradas largas.
- Seleccion sobre metrica ruidosa: el checkpoint se eligio maximizando la cercania a un objetivo sobre lecturas con error, de modo que la lectura de seleccion incorpora el ruido que la llevo hasta ahi. La cifra valida para comparar es la reportada sobre `test`, no la de `validation`.
- Una sola muestra por checkpoint y split: los errores estandar citados son los de cada lectura individual, no la variabilidad entre checkpoints. No deben interpretarse como intervalos de confianza del comportamiento del modelo.
- Dependencia de la busqueda: el paso 48 es propiedad del protocolo de busqueda (banda, schedule y presupuesto de pasos), no solo de la receta. Con otra banda u horizonte se llegaria a otro checkpoint con el mismo QER.
- Licencia: apache-2.0 permite uso comercial segun los terminos de esa licencia, pero el modelo base declara proceder de la familia Gemma 3; conviene verificar las condiciones aplicables al modelo original antes de cualquier uso mas alla de la investigacion.
- Idoneidad para produccion: nula como asistente general. Su unico uso defendible es la investigacion en seguridad de IA, en entornos controlados y con la expectativa explicita de obtener respuestas incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_integrated_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Paper, blog o repositorio de `automo`: no disponible en la informacion proporcionada
- Demo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente enlaces generales a Instagram, sin relacion con el artefacto).
