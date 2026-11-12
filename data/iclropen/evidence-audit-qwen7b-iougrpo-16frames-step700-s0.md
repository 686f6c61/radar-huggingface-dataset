# iclropen/evidence-audit-qwen7b-iougrpo-16frames-step700-s0

## Resumen

`evidence-audit-qwen7b-iougrpo-16frames-step700-s0` es un adaptador LoRA desarrollado por el usuario `iclropen` sobre el modelo multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No es un modelo independiente, sino un ajuste fino parametrico de bajo rango (r=64) entrenado especificamente para la tarea de *video temporal grounding* (localizacion temporal de eventos en video a partir de una consulta en lenguaje natural), evaluado sobre el conjunto de datos Charades-STA.

El adaptador forma parte del material experimental del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. El checkpoint publicado corresponde a la ultima iteracion (paso 700) de un entrenamiento con GRPO (Group Relative Policy Optimization) que utiliza una recompensa basada en el IoU temporal entre la prediccion y el intervalo anotado, con entrada de 16 fotogramas a 224 px de resolucion.

Su relevancia es fundamentalmente metodologica: sirve como linea base (baseline) para estudiar si un modelo que acierta en la localizacion temporal lo hace por depender realmente de la evidencia visual o por atajos estadisticos. El repositorio contiene unicamente los pesos LoRA (0,8 GB), no el modelo base ni el codigo de entrenamiento. El modelo base Qwen2.5-VL-7B-Instruct aporta la arquitectura y las capacidades multimodales; este adaptador solo modula su comportamiento para la tarea de grounding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion, no documentada aqui) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Rango LoRA / alpha | r=64 / lora_alpha=128 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamano del repositorio | 0,8 GB |
| Version de transformers requerida | 5.12.1 (probada); peft 0.19.1 o superior |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imagen/video y texto. El LoRA modula las proyecciones de atencion (q/k/v/o) y las capas feed-forward (gate/up/down) con rango 64 y alpha 128, lo que supone un ajuste sustancial de la representacion interna del modelo base sin reentrenar sus pesos completos.

El entrenamiento emplea GRPO (TRL) con recompensas de formato y de IoU temporal. La entrada de video se limita a 16 fotogramas a 224 px. Se realizaron 700 pasos de optimizacion, con 4 preguntas por paso y 8 muestras por pregunta, agregacion de recompensa por suma normalizada y acumulacion de gradiente de 4, semilla 0. Los datos de entrenamiento corresponden al split de entrenamiento de Charades-STA. La model card menciona una formulacion de objetivo mas compleja (Seccion 4 del paper) que combina NLL sobre video limpio con terminos de *softplus* sobre recompensas de video editado en evidencia y placebo, pero el checkpoint publicado se describe como la linea base GRPO con recompensa IoU. No se proporciona el trainer ni el codigo de entrenamiento en este repositorio.

Una advertencia tecnica relevante: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la version incorrecta no lanza error pero deja los pesos LoRA sin cargar (no-op silencioso), por lo que la model card incluye un self-check que verifica que cada tensor LoRA del fichero se ha aplicado a un modulo con los valores correctos.

## Capacidades

- Localizacion temporal de eventos en video (*video temporal grounding*) dada una consulta textual, sobre el formato de Charades-STA.
- Procesamiento multimodal video-texto heredado de Qwen2.5-VL-7B-Instruct: comprension de imagenes y secuencias de video.
- Generacion de texto y razonamiento multimodal (capacidades del modelo base, moduladas por el adaptador).
- Entrada de video limitada a 16 fotogramas a 224 px en el regimen de entrenamiento.
- Soporte de tool calling / function calling: no documentado para este adaptador (depende del base, no verificado aqui).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas.
- Modo *thinking* / vision / audio: no documentado especificamente para el adaptador.

## Casos de uso

- Investigacion sobre dependencia de evidencia: el adaptador sirve como linea base para comparar si un modelo de grounding acierta por usar la evidencia visual o por atajos; se usa junto con las auditorias de verosimilitud y comportamiento descritas en el paper.
- Reproduccion de resultados del paper: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 permite reproducir las tablas y figuras (Tabla 1, 6-10, 13, 18, 19; Figuras 1, 2, 5) en las que aparece este checkpoint.
- Evaluacion de robustez ante ediciones de video: el objetivo del paper incluye videos con evidencia editada y placebos; el adaptador permite medir la caida de rendimiento cuando se altera la evidencia, util para estudiar alucinacion temporal.
- Benchmarking de metodos de RL para grounding: comparar GRPO con recompensa IoU frente a variantes con recompensas de auditoria de evidencia sobre el mismo base y dataset.
- Prototipado de busqueda de momentos en video: dado un clip y una consulta, el modelo puede devolver un intervalo temporal; util como componente de un pipeline de indexacion o resumen de video, con la cautela de que solo se entreno con 16 fotogramas.
- Analisis de sesgo de atajos en modelos multimodales: usar el adaptador para estudiar si el modelo responde a la consulta textual ignorando el contenido visual, mediante las auditorias incluidas en el codigo del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia tablas y figuras del paper (Tabla 1, 6, 7, 8, 9, 10, 13, 18, 19; Figuras 1, 2, 5) pero no incluye los valores numericos. No se inventan cifras.

## Requisitos de hardware

- El adaptador LoRA pesa 0,8 GB; requiere cargar el modelo base Qwen2.5-VL-7B-Instruct completo (7B parametros) en bfloat16, lo que implica aproximadamente 14-16 GB de VRAM solo para los pesos, mas memoria para activaciones y cache KV.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con suficiente VRAM (RTX 4090 24 GB, RTX 3090 24 GB) para inferencia en bfloat16 con `device_map="auto"`.
- En consumer GPU: cabe en RTX 4090/3090 24 GB en bfloat16 para inferencia; en GPUs de 16 GB requeriria cuantizacion del base (no documentada para este adaptador).
- Opciones de despliegue: transformers 5.12.1 + peft 0.19.1 (stack probado por el autor); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador LoRA en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-16frames-step700-s0 (este) | LoRA sobre 7B | No disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible en esta ficha | Multimodal general | Apache 2.0 (segun base) | Hugging Face |
| Alternativas de grounding sobre Charades-STA | No disponible | No disponible | Video temporal grounding | No disponible | No disponible |

No se dispone de datos de rendimiento de este adaptador ni de alternativas comparables en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct para funcionar.
- Riesgo de no-op silencioso: cargar con una version de transformers distinta de 5.12.1 puede dejar los pesos LoRA sin aplicar sin lanzar error; es imprescindible ejecutar el self-check de la model card.
- Entrenado exclusivamente con 16 fotogramas a 224 px; el rendimiento puede degradarse con videos mas largos, mayor resolucion o tasas de fotogramas distintas.
- Entrenado solo con el split de Charades-STA; no hay evidencia de generalizacion a otros dominios o datasets de grounding.
- El propio paper cuestiona si la precision en grounding refleja dependencia real de la evidencia; el modelo puede acertar por atajos estadisticos (sesgo de evidencia), lo que limita su uso en produccion sin auditoria.
- Riesgo de alucinacion temporal: puede devolver intervalos plausibles sin correspondencia visual real.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y las dependencias (transformers, peft) tienen sus propias condiciones.
- No se incluye el trainer ni los scripts de entrenamiento en este repositorio; solo pesos.
- Sin descargas ni likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-16frames-step700-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la informacion disponible)
