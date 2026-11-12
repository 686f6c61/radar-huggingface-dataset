# iclropen/evidence-audit-qwen7b-pc-a05-4800pairs-s0

## Resumen

El modelo `iclropen/evidence-audit-qwen7b-pc-a05-4800pairs-s0` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. Lo desarrolla el usuario `iclropen` en el contexto de un articulo cientifico titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen2.5-VL-7B-Instruct y aplicar los pesos LoRA encima.

El problema que aborda es el de la dependencia de la evidencia en tareas de localizacion temporal de video (video temporal grounding), concretamente en el conjunto de datos Charades-STA. La hipotesis del trabajo es que un modelo puede acertar la respuesta sin haberse basado realmente en la evidencia visual del intervalo anotado. Para corregirlo, se entrena con un objetivo "placebo-controlled" que penaliza que el modelo cambie su prediccion cuando se edita el video fuera del intervalo anotado (placebo) y premia que la cambie cuando se edita dentro del intervalo de evidencia.

El adaptador tiene un tamano de repositorio de 0,2 GB, con un unico fichero `adapter_model.safetensors` de 190.442.760 bytes. Se entreno sobre 4.800 pares de entrenamiento del split de entrenamiento de Charades-STA, con 600 pasos de optimizador, semilla 0, learning rate 5e-6, LoRA de rango 16 y alpha 32. La licencia declarada es Apache 2.0. Es relevante ahora como material reproducible de un articulo en revision sobre evaluacion de evidencia en modelos multimodales, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT; el modelo base es Qwen2.5-VL-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA; `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con `lora_alpha=32` y dropout 0.05, aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen2.5-VL-7B-Instruct. El entrenamiento se realizo con 4.800 pares de entrenamiento extraidos de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), durante 600 pasos de optimizador, con learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. La entrada de video se muestrea a 2 fps con un maximo de 768 frames, y el prompt y la respuesta siguen los estilos `timer1_default` y `timer1`, con el mensaje de video primero y el texto despues.

La innovacion tecnica es el objetivo de entrenamiento descrito en la Seccion 4 del articulo: `L = alpha * NLL(clean) + sum over operators of w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el video con edicion de evidencia y `x_O` es la edicion placebo emparejada fuera del intervalo anotado. Se usa `alpha=0.5`, `beta=0.1`, cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1.0, y pesos por operador con Group-DRO. Los operadores de edicion en entrenamiento son `swap`, `mask`, `blur`, `tshift` y `shuffle`, aplicando 2 por ejemplo. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localizacion temporal de video (video temporal grounding) sobre el conjunto Charades-STA, heredando la capacidad multimodal del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de video a 2 fps con hasta 768 frames como entrada.
- Razonamiento sobre evidencia visual: el adaptador esta disenado para que la prediccion dependa del contenido del intervalo anotado y no de atajos.
- Capacidades multimodales generales del modelo base (vision y texto), aunque el adaptador solo modifica el comportamiento en la tarea de grounding.
- Soporte de tool calling / function calling: no disponible de forma especifica en este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica en este adaptador.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: modo de "auditoria de evidencia" (auditoria de verosimilitud y auditoria conductual) descrito en el repositorio de codigo asociado.

## Casos de uso

- Investigacion en video temporal grounding: usar el adaptador como linea base reproducible para comparar la dependencia de evidencia de otros modelos sobre Charades-STA, cargando el modelo base y aplicando el LoRA con el script de evaluacion del repositorio de codigo.
- Auditoria de modelos multimodales: aplicar las auditorias de verosimilitud y conductual incluidas en `iclropen/evidence-audit-code` para medir si un modelo responde a la evidencia visual o a atajos del dataset.
- Reproduccion de resultados del articulo: el adaptador corresponde a las Tablas 7, 13 y 14 del paper, por lo que sirve para replicar esas cifras con el codigo y los datos indicados.
- Estudio de tecnicas de entrenamiento con objetivos placebo-controlled: el adaptador permite analizar el efecto de `alpha=0.5`, `beta=0.1` y los pesos Group-DRO sobre el comportamiento del modelo base.
- Desarrollo de sistemas de verificacion de evidencia en video: el enfoque de edicion de evidencia y placebo puede trasladarse a pipelines que necesiten comprobar que una respuesta se sustenta en el fragmento de video correcto.
- Experimentacion con LoRA sobre Qwen2.5-VL: sirve como ejemplo de adaptador de rango 16 sobre modulos de atencion y MLP, con instrucciones de carga y self-check para transformers 5.x y peft 0.19.1 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia las Tablas 7, 13 y 14 del articulo en revision, sin incluir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM para los pesos, mas memoria para el procesamiento de video (hasta 768 frames a 2 fps).
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo base, son adecuadas GPU con 24 GB o mas (por ejemplo, A100, H100, RTX 4090) para inferencia en bfloat16.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con el modelo base en bfloat16; no confirmado en la informacion disponible.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-4800pairs-s0 (este) | LoRA sobre Qwen2.5-VL-7B | no disponible | Video temporal grounding (Charades-STA) con auditoria de evidencia | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct (modelo base) | 7B | no disponible | Multimodal general (vision y texto) | no disponible en la informacion | Hugging Face |
| Alternativas de video temporal grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: solo contiene pesos LoRA y requiere el modelo base Qwen2.5-VL-7B-Instruct para funcionar.
- Incompatibilidad silenciosa entre versiones de transformers: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la version incorrecta no lanza error pero deja los pesos LoRA sin cargar; es obligatorio ejecutar el self-check incluido en la model card.
- El adaptador esta entrenado especificamente para Charades-STA y para la tarea de video temporal grounding; su comportamiento fuera de ese dominio no esta documentado.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene su propia licencia que debe verificarse por separado.
- El articulo asociado esta en revision (ICLR 2027), por lo que los resultados y el metodo pueden cambiar.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- El adaptador se entreno con 600 pasos sobre 4.800 pares; no se documenta el rendimiento en dominios distintos de Charades-STA.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-4800pairs-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la informacion disponible)
