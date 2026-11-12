# iclropen/evidence-audit-qwen7b-pc-a05-nobound-uniform-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-nobound-uniform-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base Qwen2.5-VL-7B-Instruct, un modelo vision-lenguaje de 7 mil millones de parametros desarrollado por Alibaba Qwen. El adaptador no es un modelo generalista: es un artefacto de investigacion asociado al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. Su proposito es el anclaje temporal de evidencia en video (video temporal grounding), concretamente sobre el conjunto de datos Charades-STA.

La relevancia de este repositorio es metodologica mas que practica. El paper propone medir y entrenar la *dependencia de evidencia*: que el modelo base sus respuestas en el fragmento de video realmente anotado y no en atajos espurios. Para ello introduce un objetivo con control de placebo, donde se comparan ediciones del video dentro del intervalo anotado (evidencia) frente a ediciones equivalentes fuera de el (placebo). Este adaptador concreto corresponde a una ablation especifica: sin cota de placebo (hinge weight 0) y con pesos uniformes entre operadores de edicion.

El repositorio contiene unicamente los pesos LoRA (190.442.760 bytes, unos 0,2 GB), no el modelo completo. La licencia es Apache 2.0, heredada del modelo base. Al tratarse de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, debe considerarse un artefacto reproducible para experimentacion, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer vision-lenguaje (Qwen2.5-VL); rango r=16, lora_alpha=32, dropout 0,05 |
| Parametros totales | no disponible (el adaptador pesa 190.442.760 bytes; el modelo base Qwen2.5-VL-7B-Instruct tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto. Los modulos objetivo del LoRA son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y dropout 0,05. El entrenamiento se realizo con 2.400 pares de entrenamiento extraidos de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), durante 300 pasos de optimizador, con learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, y el orden de mensajes es video primero y texto despues.

La innovacion tecnica reside en la funcion de perdida, descrita en la Seccion 4 del paper: `L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida de placebo]`, donde `x_E` es el video con edicion de evidencia y `x_O` la edicion placebo emparejada fuera del intervalo anotado. En esta ablation concreta, alpha = 0,5, beta = 0,1, el peso del hinge de placebo es 0 (sin cota) y los pesos de operador son uniformes. Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`, con revisiones r3, r4 y la version sin sufijo con valores por defecto identicos.

Un detalle critico de ingenieria documentado por el autor: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error, pero deja los pesos LoRA sin cargar (no-op silencioso). Este repositorio esta pensado para transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior.

## Capacidades

- Anclaje temporal de evidencia en video (video temporal grounding): localizacion de intervalos temporales en un video a partir de una consulta en lenguaje natural, evaluado sobre Charades-STA.
- Robustez ante ediciones del video: el entrenamiento con operadores (swap, mask, blur, tshift, shuffle) busca que la prediccion dependa de la evidencia anotada y no de artefactos.
- Razonamiento multimodal video-texto heredado de Qwen2.5-VL-7B-Instruct.
- Procesamiento de video a 2 fps con hasta 768 fotogramas como configuracion de entrenamiento.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, thinking mode, audio ni otras modalidades adicionales especificas de este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en video temporal grounding: reproducir las tablas 2, 6, 7, 10 y 13 y la figura 3 del paper, cargando este adaptador como una de las ablations comparadas. Es su uso principal y previsto.
- Auditoria de dependencia de evidencia: usar los scripts de evaluacion del repositorio de codigo (`--model  --adapter <folder>`) para medir si las predicciones cambian cuando se edita el video dentro del intervalo anotado frente a una edicion placebo fuera de el.
- Estudio de ablations controladas: comparar esta variante (sin cota de placebo, pesos uniformes) con otras variantes del mismo autor para aislar el efecto de cada componente del objetivo de entrenamiento.
- Analisis de robustez de modelos VLM: emplear los operadores de edicion (mask, blur, tshift, shuffle, swap) como suite de estres para medir la sensibilidad de un modelo vision-lenguaje a perturbaciones del video.
- Generacion de datos de evaluacion: reutilizar el esquema de pares evidencia/placebo sobre Charades-STA como plantilla para construir conjuntos de auditoria en otros dominios de video.
- Docencia y divulgacion: ilustrar en un curso o articulo como se entrena un adaptador PEFT con un objetivo de margen contrastivo y como se verifica que los pesos LoRA se han cargado realmente (el self-check del model card es un ejemplo didactico de verificacion de integridad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card referencia las tablas 2, 6, 7, 10 y 13 y la figura 3 del paper como lugares donde aparecen los resultados de este adaptador, pero no incluye las cifras. No se inventan valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA ocupa unos 0,2 GB en disco; el consumo dominante es el del modelo base Qwen2.5-VL-7B-Instruct en bfloat16, que requiere del orden de 15-16 GB de VRAM solo para pesos (estimacion estandar para 7B en bf16, no confirmada en la informacion proporcionada).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, son razonables A100, H100, L40S o RTX 4090; no confirmado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con el modelo base en bf16 y margen limitado para el procesamiento de hasta 768 fotogramas; no confirmado en la informacion disponible.
- Opciones de despliegue: el model card solo documenta carga con transformers 5.x (probado 5.12.1) y peft 0.19.1 o superior, mas `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion descrita usa decodificacion greedy a 2 fps.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-nobound-uniform-s0 (este) | LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | VLM generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Otras ablations del mismo autor (`evidence-audit-*`) | LoRA sobre 7B | no disponible | Video temporal grounding | Apache 2.0 | Hugging Face |
| Alternativas de grounding temporal de terceros | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de terceros para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): la generalizacion a otros dominios de video, idiomas o tareas de grounding no esta validada.
- Riesgo de carga silenciosa como no-op si se usa transformers 4.x en lugar de 5.x; el propio autor advierte que no se lanza error. Es imprescindible ejecutar el self-check incluido en el model card.
- El paper esta en revision (ICLR 2027) y la autoria es anonima; los resultados pueden cambiar en la version final.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluacion multilingue de este adaptador.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el adaptador esta disenado para experimentacion cientifica; no se recomienda su uso en produccion sin una evaluacion propia.
- El objetivo de entrenamiento incluye terminos de placebo y edicion de video; su comportamiento fuera de la distribucion de ediciones usadas en entrenamiento (swap, mask, blur, tshift, shuffle) es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-nobound-uniform-s0
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review); no se proporciona URL en la informacion disponible.
