# iclropen/evidence-audit-qwen7b-pc-a05-mixed-format-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-mixed-format-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (190,4 MB, `adapter_model.safetensors`) pensado para una tarea muy concreta: el *video temporal grounding* (localizacion temporal de eventos en video) y, mas especificamente, la medicion y el entrenamiento de la *dependencia de la evidencia* en esa tarea. El adaptador acompana al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y en revision en el momento de la publicacion.

El problema que aborda es sutil pero relevante para la evaluacion de modelos multimodales: un modelo puede acertar la respuesta (alta precision) sin haberse apoyado realmente en la evidencia visual, sino en atajos del dataset o en sesgos del prompt. El entrenamiento introduce un objetivo "placebo-controlled" que penaliza que el modelo cambie su respuesta cuando se aplica una edicion de video fuera del intervalo anotado (placebo), y exige que si responda a ediciones dentro del intervalo (evidencia real). El adaptador se entrena sobre 2.400 pares de Charades-STA durante 300 pasos con un LoRA de rango 16.

Es un artefacto de investigacion, no un modelo de produccion: cero descargas, cero likes, sin datos de benchmarks publicados en la model card, y con una advertencia importante sobre incompatibilidad silenciosa entre versiones de `transformers` (4.51 frente a 5.x). Su interes radica en la metodologia de auditoria de evidencia, no en el rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre visual y LLM decoder) |
| Parametros totales | no disponible (el adaptador contiene 190.435.728 bytes de pesos LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA, `adapter_model.safetensors`) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Libreria | peft (transformers 4.51.3, peft 0.20.0) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina una torre visual con un decoder de lenguaje. El LoRA (r=16, alpha=32, dropout 0.05) se inyecta en los modulos de atencion y MLP del modelo (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Un detalle tecnico relevante: los entrenamientos con `transformers` 4.51 usaron *gradient checkpointing*, y bajo esa configuracion la torre visual no recibio gradiente, de modo que las matrices `lora_B` de la parte visual son todas cero. En consecuencia, estos adaptadores modifican unicamente el modelo de lenguaje, no la representacion visual.

El entrenamiento sigue el objetivo descrito en la seccion 4 del paper: `L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida placebo]`, donde `x_E` es el video con edicion de evidencia y `x_O` es una edicion placebo emparejada fuera del intervalo anotado. Se usan pesos por operador con Group-DRO, `alpha=0.5`, `beta=0.1` y una cota placebo `d_O(trained) <= 1.25 * d_O(reference) + 0.10` con peso de hinge 1.0. Los datos son 2.400 pares de entrenamiento de Charades-STA, con 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. Los operadores de edicion en entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se muestrea a 2 fps con un maximo de 768 frames, y el entrenador es una variante con formatos de respuesta mixtos que no esta incluida en la release de codigo.

## Capacidades

- Localizacion temporal de eventos en video (*video temporal grounding*): dado un video y una consulta textual, el adaptador ajusta el modelo base para responder con el intervalo temporal que contiene la evidencia.
- Robustez ante ediciones de evidencia: entrenado para que la respuesta cambie cuando se edita el intervalo anotado y se mantenga estable ante ediciones placebo fuera de el.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para ser evaluado con los scripts de auditoria de probabilidad y de comportamiento del repositorio de codigo.
- Formato de respuesta mixto: el entrenamiento mezcla dos formatos de respuesta (`timer1_default` / `timer1`), segun la tabla de entrenamiento.
- Orden de mensajes fijo: video primero, texto despues.
- Capacidades heredadas del modelo base (Qwen2.5-VL-7B-Instruct): generacion de texto, razonamiento multimodal, comprension de imagenes y video, tool calling y capacidades multilingues, aunque el adaptador no las entrena especificamente y la model card no las documenta para este artefacto.
- No se documenta soporte especifico de agentes, thinking mode, audio ni otras capacidades especiales en la model card.

## Casos de uso

- Investigacion en evaluacion de modelos multimodales: usar el adaptador como condicion experimental para medir si un modelo de grounding se apoya en la evidencia visual o en atajos, comparando su comportamiento con el del modelo base sin adaptador.
- Reproduccion del paper: cargar el adaptador con `transformers==4.51.3` y `peft==0.20.0` y ejecutar los scripts de auditoria (`--model  --adapter <folder>`) para replicar las cifras de dependencia de evidencia.
- Auditoria de robustez de pipelines de video: aplicar ediciones controladas (swap, mask, blur, tshift, shuffle) a videos de vigilancia o monitorizacion y comprobar si el sistema de grounding cambia su respuesta de forma coherente.
- Desarrollo de metodos de entrenamiento anti-atajo: usar la receta placebo-controlled y los hiperparametros publicados (alpha=0.5, beta=0.1, Group-DRO) como punto de partida para entrenar adaptadores similares sobre otros datasets de grounding.
- Analisis de sesgos de dataset en Charades-STA: estudiar hasta que punto las respuestas correctas del modelo base dependen de correlaciones espurias del dataset y no del contenido del video.
- Docencia y formacion: ejemplo practico de LoRA sobre un VLM de 7B, con self-check de carga incluido, para ensenar tecnicas de PEFT y verificacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de grounding (por ejemplo, mIoU o R@1 en Charades-STA) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del modelo base Qwen2.5-VL-7B-Instruct. En bfloat16, un modelo de 7B requiere del orden de 14-16 GB solo para pesos, mas memoria para la torre visual y el procesamiento de hasta 768 frames a 2 fps.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo base, son razonables A100, H100 o GPUs consumer de gama alta con suficiente VRAM; no se confirma en la informacion disponible.
- Cabe en consumer GPU: no confirmado; depende de la cuantizacion del modelo base, que la model card no documenta.
- Opciones de despliegue: la unica ruta documentada es `transformers` 4.51.3 + `peft` 0.20.0 con `PeftModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de este adaptador que permitan una comparacion cuantitativa. A continuacion se comparan las caracteristicas estructurales con el modelo base y con alternativas genericas de la misma categoria (VLM de ~7B para grounding), marcando como "no disponible" lo que no consta.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-mixed-format-s0 | LoRA sobre 7B | no disponible | Video temporal grounding + auditoria de evidencia | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | VLM generalista | apache-2.0 | Hugging Face |
| Alternativas de grounding sobre VLM de ~7B | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado.
- Incompatibilidad silenciosa entre versiones de `transformers`: los adaptadores entrenados con 4.51 almacenan claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que `transformers` 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la version equivocada no lanza error pero deja los pesos LoRA sin cargar; es obligatorio ejecutar el self-check incluido en la model card.
- La torre visual no fue entrenada: bajo gradient checkpointing, las matrices `lora_B` de la parte visual son todas cero, por lo que el adaptador solo modifica el modelo de lenguaje.
- El entrenador usado (variante con formatos de respuesta mixtos) no esta incluido en la release de codigo, lo que limita la reproducibilidad exacta del entrenamiento.
- Dataset limitado: 2.400 pares de Charades-STA y 300 pasos de optimizador; no hay evidencia de generalizacion a otros dominios de video.
- Sin benchmarks publicados ni datos de idiomas: no se puede afirmar su rendimiento ni su cobertura linguistica.
- Estado de revision: el paper esta en envio a ICLR 2027 y bajo revision; los resultados pueden cambiar.
- Riesgo de alucinacion y sesgos: no documentados en la model card; al heredar el modelo base, arrastra los sesgos y limitaciones de Qwen2.5-VL-7B-Instruct.
- Uso comercial: la licencia apache-2.0 lo permite, pero al ser un artefacto de investigacion sin validacion en produccion, no es recomendable desplegarlo sin evaluacion adicional.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-mixed-format-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la informacion disponible)
