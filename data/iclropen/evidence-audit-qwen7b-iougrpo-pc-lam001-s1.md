# iclropen/evidence-audit-qwen7b-iougrpo-pc-lam001-s1

## Resumen

`evidence-audit-qwen7b-iougrpo-pc-lam001-s1` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, orientado a la tarea de localizacion temporal de evidencia en video (video temporal grounding). No es un modelo completo, sino un conjunto de pesos de adaptacion de 190 MB que se cargan sobre el modelo base mediante la libreria PEFT. El repositorio acompana a la publicacion *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviada a ICLR 2027 y en revision en el momento de la publicacion de la ficha.

El adaptador se entrena con un objetivo GRPO (Group Relative Policy Optimization) con recompensa basada en IoU, al que se anade un termino de control con placebo ponderado por lambda=0.01. La motivacion del trabajo es medir y fomentar la dependencia real de la evidencia visual: que el modelo base sus respuestas en el contenido del video y no en sesgos o atajos del dataset. El adaptador se entrena sobre el split de entrenamiento de Charades-STA con 2.400 pares de entrenamiento y 600 pasos de optimizacion.

Es relevante para investigadores que trabajen en evaluacion de fidelidad de modelos multimodales y en tecnicas de RL aplicadas a grounding temporal. Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks publicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT; solo pesos LoRA) |
| Parametros totales | no disponible (adaptador de 190.435.728 bytes; el modelo base Qwen2.5-VL-7B-Instruct tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Libreria | peft (transformers 4.51.3, peft 0.20.0) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la arquitectura Qwen2.5-VL, un transformer multimodal que procesa video e imagen junto con texto. El LoRA tiene rango 16, alpha 32 y dropout 0.05, con modulos objetivo en las proyecciones de atencion (q/k/v/o) y en las proyecciones del MLP (gate/up/down). Un detalle relevante documentado por el autor: los entrenamientos con transformers 4.51 usaron gradient checkpointing, lo que dejo la torre visual sin gradiente; en consecuencia, las matrices `lora_B` de la parte visual son todas cero y el adaptador modifica unicamente el modelo de lenguaje. Ademas, los pesos se almacenan con la nomenclatura de claves de transformers 4.51 (`base_model.model.model.layers.*` / `base_model.model.visual.*`), incompatible con la de transformers 5 (`base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`); cargar el adaptador con la version incorrecta no lanza error pero deja los pesos LoRA sin cargar. El autor incluye un autochequeo en la model card para detectar este fallo silencioso.

El entrenamiento sigue el objetivo descrito en la Seccion 4 del paper: una perdida que combina NLL sobre la muestra limpia con terminos de recompensa GRPO basados en IoU sobre la edicion de evidencia (`x_E`) y sobre una edicion placebo emparejada fuera del intervalo anotado (`x_O`), mas un termino hinge sobre la caida en el placebo. Se usan pesos Group-DRO y un coeficiente KL de 0.04. Los hiperparametros concretos son: lambda=0.01 para el termino placebo, 8 muestras por pregunta, 4 preguntas por paso, 20 pasos de calentamiento, 600 pasos de optimizacion, learning rate 1e-5 y semilla 1. El conjunto de entrenamiento son 2.400 pares de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`). La entrada de video se muestrea a 2 fps con un maximo de 768 frames, con el video antes del texto en el orden de mensajes y un estilo de prompt/answer `timer1_default` / `timer1`. El entrenador es `code/30_grpo_plus_placebo.py`.

## Capacidades

- Localizacion temporal de evidencia en video: dado un video y una consulta textual, el adaptador ajusta el modelo base para identificar el intervalo temporal que responde a la consulta, con el objetivo de que la respuesta dependa del contenido visual real y no de atajos del dataset.
- Razonamiento multimodal video-texto: hereda del modelo base Qwen2.5-VL la capacidad de procesar video a 2 fps (hasta 768 frames) junto con instrucciones en lenguaje natural.
- Robustez ante ediciones de evidencia: el termino placebo del entrenamiento busca que el modelo responda a cambios dentro del intervalo anotado y no a cambios fuera de el, una forma de fidelidad a la evidencia.
- Generacion de texto y respuestas estructuradas: el estilo de respuesta `timer1` sugiere una salida de intervalos temporales; no se documentan otras capacidades especificas del adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada para el adaptador (depende del modelo base, no documentado aqui).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el entrenamiento se realiza sobre Charades-STA, que es un dataset en ingles.
- Modo thinking, vision o audio especificos: no documentados para el adaptador.

## Casos de uso

- Investigacion en fidelidad de modelos multimodales: usar el adaptador como referencia para comparar la dependencia de evidencia de un modelo base frente a uno entrenado con el termino placebo; el codigo de auditoria de comportamiento y de verosimilitud del repositorio `iclropen/evidence-audit-code` permite reproducir el analisis.
- Evaluacion de tecnicas de RL para grounding temporal: el adaptador sirve como punto de partida para experimentos con GRPO e IoU-reward en tareas de localizacion temporal, con hiperparametros y semilla documentados para reproducibilidad.
- Deteccion de atajos en datasets de video: el esquema de edicion placebo (cambios fuera del intervalo anotado) es reutilizable para auditar si un modelo responde al contenido o a artefactos del dataset en tareas de Charades-STA.
- Segmentacion de momentos relevantes en video para analisis posterior: en un pipeline de investigacion, el adaptador puede localizar intervalos candidatos que luego se pasan a otro modulo para inspeccion o anotacion.
- Reproduccion de resultados de un paper en revision: cargar el adaptador con transformers 4.51.3 y peft 0.20.0 y ejecutar los scripts de evaluacion con `--model  --adapter <folder>` para verificar las cifras del articulo.
- Estudio comparativo de variantes de entrenamiento: la nomenclatura del repositorio (`iougrpo-pc-lam001-s1`) sugiere variantes con distintos valores de lambda y semillas; este adaptador concreto sirve como una de las condiciones experimentales en un barrido.
- Fine-tuning posterior sobre dominios especificos: al ser un adaptador LoRA ligero (190 MB), puede combinarse con otros adaptadores o servir de inicializacion para tareas de grounding en dominios distintos de Charades-STA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (mIoU, Recall@1, etc.) ni comparaciones numericas con el modelo base u otras variantes; solo remite a los scripts de evaluacion del repositorio de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Qwen2.5-VL-7B-Instruct. Como referencia orientativa, un modelo de 7B en bfloat16 requiere del orden de 14-16 GB solo para pesos, mas el coste de activaciones y del procesamiento de video (hasta 768 frames a 2 fps), que puede elevar el consumo de memoria de forma notable.
- GPU recomendadas: no documentadas por el autor; para el modelo base de 7B en bfloat16 son habituales GPUs con 24 GB o mas (A100, H100, L40S, RTX 4090/A6000). El procesamiento de hasta 768 frames incrementa los requisitos respecto a inferencia solo texto.
- Cabe en consumer GPU: probablemente en GPUs de 24 GB (RTX 3090/4090) con el modelo base en bfloat16 o cuantizado, aunque el autor no lo confirma; con cuantizacion de 8 o 4 bits el margen aumenta. No hay datos publicados para el adaptador.
- Opciones de despliegue: la model card documenta carga con `transformers==4.51.3` y `peft==0.20.0` (mas `qwen-vl-utils`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador; la integracion con vLLM requeriria fusionar el adaptador con el modelo base o usar el soporte de LoRA del servidor, no verificado por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-pc-lam001-s1 (este) | LoRA sobre 7B | no disponible | Video temporal grounding con auditoria de evidencia | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Modelo multimodal generalista | apache-2.0 (segun el modelo base) | Hugging Face, ampliamente usado |
| Otras variantes del mismo paper (`iougrpo-pc-*`) | LoRA sobre 7B | no disponible | Misma tarea, distinto lambda/semilla | apache-2.0 | Referenciadas por la nomenclatura, no verificadas |
| Otros adaptadores de video temporal grounding sobre Qwen2.5-VL | no disponible | no disponible | Grounding temporal | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar `Qwen/Qwen2.5-VL-7B-Instruct` para funcionar.
- Incompatibilidad silenciosa entre versiones de transformers: cargar el adaptador con transformers 5 en lugar de 4.51.x no lanza error pero deja los pesos LoRA sin aplicar; es imprescindible ejecutar el autochequeo incluido en la model card.
- La torre visual no fue entrenada: las matrices `lora_B` de la parte visual son cero por el uso de gradient checkpointing, de modo que el adaptador solo modifica el modelo de lenguaje; no cabe esperar mejoras atribuibles a la representacion visual.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 600 pasos): el dominio es acotado (video de actividades cotidianas, consultas en ingles) y la generalizacion a otros datasets o idiomas no esta documentada.
- Sin benchmarks publicados: no hay evidencia numerica en la model card sobre la mejora respecto al modelo base ni sobre la reduccion de dependencia de atajos; las afirmaciones del paper estan en revision.
- Riesgo de alucinacion: heredado del modelo base; el adaptador no incorpora mecanismos de calibracion mas alla del entrenamiento con recompensa de IoU.
- Sesgos conocidos: no documentados en la informacion proporcionada; los sesgos del dataset Charades-STA y del modelo base son aplicables.
- Uso comercial: la licencia del adaptador es apache-2.0, pero el uso comercial efectivo depende tambien de la licencia y condiciones del modelo base Qwen2.5-VL-7B-Instruct, que deben verificarse por separado.
- Artefacto de investigacion: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no hay garantia de mantenimiento ni de soporte.
- Estado de publicacion: el paper esta en revision en ICLR 2027; los resultados y la metodologia pueden cambiar antes de la version final.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-pc-lam001-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la informacion proporcionada)
- Dataset de entrenamiento: Charades-STA (no se proporciona enlace en la model card)
