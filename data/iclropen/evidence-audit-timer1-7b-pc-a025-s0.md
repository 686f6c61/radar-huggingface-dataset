# iclropen/evidence-audit-timer1-7b-pc-a025-s0

## Resumen

`iclropen/evidence-audit-timer1-7b-pc-a025-s0` es un adaptador LoRA para el modelo `Boshenxx/Time-R1-7B`, un modelo de 7 000 millones de parametros construido sobre la arquitectura Qwen2.5-VL y especializado en localizacion temporal de eventos en video (video temporal grounding). Lo publica el usuario `iclropen` como artefacto reproducible del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. El adaptador no es un modelo autonomo: requiere cargar primero el modelo base y aplicar despues los pesos LoRA incluidos en este repositorio.

El problema que aborda es la dependencia de la evidencia: un modelo de grounding puede acertar el intervalo temporal sin haber mirado realmente el video, apoyandose en atajos del texto de la consulta. El adaptador se entrena con un objetivo "placebo-controlled" que penaliza que la prediccion cambie cuando se edita el video fuera del intervalo anotado, y que exige que la prediccion se degrade cuando se edita la evidencia real. El sufijo `pc-a025-s0` indica objetivo placebo-controlled, alpha de 0,25 como peso de la supervision limpia y semilla 0.

Es relevante porque expone un metodo concreto para auditar y entrenar contra el sesgo de atajos en tareas de video, con pesos publicados (190 MB de LoRA) y scripts de evaluacion reproducibles. La licencia es Apache 2.0 y el repositorio pesa 0,4 GB en total. No hay datos publicados de descargas ni de likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL; el modelo base es un transformer multimodal vision-lenguaje |
| Parametros totales | 7B en el modelo base; el adaptador LoRA pesa 190 435 728 bytes (unos 190 MB) en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos LoRA en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), dos carpetas: raiz para transformers 4.51.x y `transformers-v5` para transformers 5.x |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Boshenxx/Time-R1-7B`, que sigue la arquitectura Qwen2.5-VL (torre visual mas modelo de lenguaje). El LoRA tiene rango 16, `lora_alpha` 32 y dropout 0,05, y ataca los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Un detalle importante: los entrenamientos con transformers 4.51 usaron gradient checkpointing, y bajo esa configuracion la torre visual no recibio gradiente, de modo que sus matrices `lora_B` son cero. En la practica, el adaptador modifica solo el modelo de lenguaje, no la torre visual.

El entrenamiento sigue el objetivo de la seccion 4 del articulo: una combinacion de NLL sobre el video limpio (peso alpha = 0,25), terminos de margen con escala beta = 0,1 sobre la respuesta con evidencia editada y sobre la respuesta con edicion placebo, y un hinge sobre la caida de placebo con cota `d_O <= 1,25 d_O(reference) + 0,10` y peso 1,0. Se usan pesos de operadores tipo Group-DRO. Los datos son 2 400 pares de entrenamiento de Charades-STA, con 300 pasos de optimizador, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion son swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, y el orden de mensajes es video primero y texto despues.

Una innovacion tecnica destacable del repositorio es la gestion explicita de la incompatibilidad de claves entre transformers 4.51 y 5.x: cargar el adaptador con la version equivocada no lanza error, simplemente deja los pesos LoRA sin aplicar. La model card incluye un script de autocomprobacion que verifica que cada tensor del fichero ha aterrizado en un modulo y con los mismos valores.

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding) sobre el modelo base Time-R1-7B.
- Entrada multimodal: video muestreado a 2 fps (hasta 768 fotogramas) mas consulta en texto.
- Generacion de intervalos temporales como respuesta, con estilo de prompt `timer1_default` y estilo de respuesta `timer1`.
- Robustez ante ediciones fuera del intervalo anotado: el objetivo placebo-controlled busca que la prediccion no cambie ante ruido irrelevante.
- Sensibilidad a la evidencia real: el entrenamiento penaliza que la prediccion se mantenga cuando se edita el intervalo relevante.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo thinking propias de este adaptador.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de modelos de video grounding: cargar el adaptador y ejecutar los scripts de auditoria de verosimilitud y de comportamiento del repositorio de codigo para medir si un modelo acierta por evidencia o por atajo textual.
- Investigacion en robustez multimodal: comparar el modelo base con y sin el adaptador bajo los operadores swap, mask, blur, tshift y shuffle para cuantificar la caida de rendimiento ante ediciones controladas.
- Busqueda de momentos concretos en archivos de video: dado un video y una consulta textual, obtener el intervalo temporal del evento, util para indexacion de contenido audiovisual.
- Generacion de conjuntos de evaluacion: usar el pipeline de edicion placebo para construir pares video-evidence y video-placebo que sirvan como test de dependencia de evidencia en otros modelos.
- Analisis de sesgos de atajo en pipelines de produccion: integrar la auditoria de comportamiento en la validacion previa al despliegue de sistemas de video understanding.
- Reproduccion de resultados academicos: los scripts aceptan `--model  --adapter <folder>`, lo que permite replicar las tablas 6, 7, 10, 11, 13, 14, 16, 19 y 20 del articulo con los mismos pesos.
- Formacion y docencia: ejemplo practico de entrenamiento con objetivos contrastivos y Group-DRO sobre un modelo vision-lenguaje de 7B con recursos moderados (LoRA de 190 MB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del articulo (tablas 6, 7, 10, 11, 13, 14, 16, 19 y 20; figuras 1, 2, 4 y 5), pero no incluye cifras numericas en el texto proporcionado.

## Requisitos de hardware

- El adaptador solo pesa unos 190 MB; el coste real lo determina el modelo base Time-R1-7B en bfloat16, que ronda los 14-16 GB de pesos mas la torre visual y las activaciones de video.
- VRAM estimada: no disponible de forma oficial; para un 7B multimodal en bfloat16 conviene partir de 24 GB y dejar margen para hasta 768 fotogramas de video.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano del modelo base, encajan A100 40/80 GB, H100 y, en consumer, RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Cabe en GPU consumer de 24 GB si se usa cuantizacion del modelo base; el adaptador LoRA en si no anade requisitos significativos.
- Opciones de despliegue: la model card solo documenta transformers (4.51.3 con peft 0.20, o transformers 5.12.1 con peft 0.19.1 o superior) y `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timer1-7b-pc-a025-s0 (este) | 7B base + LoRA de 190 MB | no disponible | Video temporal grounding con auditoria de evidencia | Apache 2.0 | Hugging Face, adaptador PEFT |
| Boshenxx/Time-R1-7B (modelo base) | 7B | no disponible | Video temporal grounding | no disponible en la informacion proporcionada | Hugging Face |
| Qwen2.5-VL (familia, arquitectura del base) | 3B, 7B, 72B | no disponible en la informacion proporcionada | Vision-lenguaje general | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `Boshenxx/Time-R1-7B` los pesos LoRA no son utilizables.
- Riesgo silencioso de carga fallida: usar la carpeta raiz con transformers 5.x o la carpeta `transformers-v5` con transformers 4.51 no lanza error, pero deja el adaptador sin efecto. Es obligatorio ejecutar el autocheck incluido en la model card.
- El adaptador solo modifica el modelo de lenguaje: la torre visual tiene `lora_B` a cero por el gradient checkpointing, asi que no se puede esperar una mejora en la representacion visual.
- Entrenado con 2 400 pares de Charades-STA y 300 pasos: cobertura de dominio y de idiomas limitada; no se documentan idiomas soportados.
- Riesgo de alucinacion y de intervalos mal localizados fuera de la distribucion de Charades-STA, especialmente con videos de duracion o estilo distintos.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un artefacto de investigacion no se ha caracterizado su comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el articulo esta en revision y los resultados no han pasado revision por pares; conviene tratar el adaptador como experimental.
- Sin descargas ni likes registrados en el momento de la ficha, lo que reduce la validacion externa del artefacto.
- Repositorio pequeno (0,4 GB) y sin pipeline declarado en Hugging Face: no hay demo lista para usar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-timer1-7b-pc-a025-s0
- Modelo base: https://huggingface.co/Boshenxx/Time-R1-7B
- Codigo del articulo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace publico en la informacion disponible.
