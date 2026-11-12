# iclropen/evidence-audit-qwen7b-pc-a05-16frames-8434pairs-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-16frames-8434pairs-s0` es un adaptador LoRA para el modelo vision-lenguaje Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen` como artefacto reproducible de un paper en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No es un modelo de proposito general, sino un adaptador de investigacion que modifica el comportamiento del modelo base en la tarea de localizacion temporal de evidencia en video (video temporal grounding), evaluada sobre el conjunto Charades-STA.

El problema que aborda es la dependencia de evidencia: un modelo puede acertar la respuesta correcta sin haber usado realmente el fragmento de video relevante, apoyandose en atajos o sesgos del dataset. El adaptador se entrena con un objetivo "placebo-controlled" que penaliza que la prediccion cambie cuando se altera el video fuera del intervalo anotado (placebo) y premia que cambie cuando se altera dentro del intervalo (evidencia). El resultado es un modelo con menor dependencia de atajos, no necesariamente con mayor exactitud bruta.

Tecnicamente es un LoRA de rango 16 sobre el transformer multimodal Qwen2.5-VL-7B, con 16 fotogramas por video, 8.434 pares de entrenamiento y 1.055 pasos de optimizacion. Su relevancia es metodologica: proporciona un punto de partida reproducible para auditar si un VLM de video razona sobre la evidencia o solo acierta por correlacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | no disponible (adaptador de 190.442.760 bytes; el modelo base Qwen2.5-VL-7B tiene ~7.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Tamano del repositorio | 0.2 GB |
| Libreria | peft (transformers >= 5.12, peft >= 0.19.1) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video como secuencia de fotogramas y texto como tokens. El LoRA de rango 16 con alpha 32 y dropout 0.05 se inserta en las proyecciones de atencion (q, k, v, o) y en las proyecciones del MLP (gate, up, down) tanto de la torre visual como del modelo de lenguaje, segun la convencion de claves de PEFT (`base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*` en transformers 5).

El entrenamiento usa el objetivo descrito en la Seccion 4 del paper: una combinacion de NLL sobre el video limpio (peso alpha=0.5) y terminos de margen con softplus sobre la diferencia de recompensa entre el video con evidencia editada (x_E) y el video con edicion placebo fuera del intervalo anotado (x_O), mas un termino hinge que acota la caida de rendimiento en el placebo (d_O <= 1.25 d_O_reference + 0.10, peso 1.0). Los pesos de los operadores se ajustan con Group-DRO. Se usaron 8.434 pares de entrenamiento, 1.055 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion en entrenamiento fueron swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de video son 16 fotogramas muestreados uniformemente, con el video antes del texto en el orden de mensajes y estilo de prompt/answer `timer1_default` / `timer1`. El trainer empleado es una revision anterior no incluida en la release de codigo.

## Capacidades

- Localizacion temporal de evidencia en video: dado un video y una consulta textual, el adaptador ajusta al modelo base para identificar el intervalo temporal que respalda la respuesta.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento busca que la prediccion dependa del contenido dentro del intervalo anotado y no de senales fuera de el.
- Robustez frente a ediciones placebo: el modelo se entrena para no cambiar su respuesta cuando se altera el video fuera del intervalo relevante.
- Procesamiento multimodal video-texto: hereda del modelo base la capacidad de procesar 16 fotogramas por video junto con instrucciones en lenguaje natural.
- Generacion de texto y respuestas estructuradas: heredada de Qwen2.5-VL-7B-Instruct (estilo de respuesta `timer1`).
- Tool calling y function calling: no documentado especificamente para este adaptador; disponible en el modelo base segun su propia model card, no verificado aqui.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Auditoria de dependencia de evidencia en pipelines de video: usar el adaptador como referencia para medir si un VLM de video responde por el contenido relevante o por atajos, comparando predicciones sobre video limpio, video con evidencia editada y video con placebo editado.
- Investigacion en video temporal grounding: reproducir los resultados de las Tablas 6, 7, 10 y 13 del paper sobre Charades-STA con el mismo protocolo de 16 fotogramas y decodificacion greedy a 2 fps.
- Desarrollo de metodos de entrenamiento robusto: servir como baseline "placebo-controlled" frente a fine-tuning estandar para estudiar la relacion entre exactitud y dependencia de evidencia.
- Busqueda de momentos en archivos audiovisuales: localizar el fragmento de un video que respalda una afirmacion o consulta, util en verificacion de noticias o analisis de material grabado.
- Evaluacion de modelos multimodales en produccion: integrar el adaptador en un banco de pruebas que detecte modelos que aciertan por sesgo del dataset antes de desplegarlos en tareas de video.
- Analisis de vigilancia o monitorizacion: identificar intervalos relevantes en grabaciones largas muestreadas a 16 fotogramas, con la cautela de que el adaptador esta entrenado sobre Charades-STA y no sobre dominios de vigilancia.
- Docencia y reproduccion cientifica: material reproducible para cursos o talleres sobre evaluacion de VLM, dado que incluye script de autocontrol de carga y codigo de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 6, 7, 10 y 13 del paper para los resultados, pero no incluye cifras numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen2.5-VL-7B-Instruct. Como referencia orientativa, un modelo de ~7.000 millones en bfloat16 requiere del orden de 14-16 GB solo para pesos, mas memoria para activaciones y el procesador visual.
- GPU recomendadas: no especificadas en la model card. El codigo de carga usa `device_map="auto"` y `torch_dtype=torch.bfloat16`, lo que permite repartir el modelo entre varias GPU.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada; probablemente requiere cuantizacion o offloading para GPUs de 24 GB o menos, pero no hay datos verificados.
- Opciones de despliegue: transformers >= 5.12 con peft >= 0.19.1 (unica ruta documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con ellos no esta verificada.
- Latencia y throughput: no disponibles.
- Requisito critico de version: adaptadores entrenados con transformers 4.51 usan claves distintas a las de transformers 5; cargar con la version equivocada no lanza error pero deja los pesos LoRA sin cargar. Es obligatorio ejecutar el autocontrol incluido en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-16frames-8434pairs-s0 | LoRA sobre ~7B | no disponible | Video temporal grounding con auditoria de evidencia | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-VL-7B-Instruct (base) | ~7B | no disponible en esta ficha | VLM generalista | Apache 2.0 | Hugging Face |
| Alternativas de video temporal grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otros adaptadores o modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion: es un adaptador LoRA de un paper en revision (ICLR 2027), no un modelo validado para produccion.
- Dominio restringido: entrenado sobre Charades-STA con 16 fotogramas por video; su comportamiento fuera de ese dataset o con otro muestreo de fotogramas no esta documentado.
- Riesgo de carga silenciosa erronea: si se carga con una version de transformers distinta de la esperada, los pesos LoRA no se aplican sin lanzar error. Es imprescindible ejecutar el script de autocontrol.
- Sin datos de benchmarks publicados en la model card: no se puede verificar la mejora frente al modelo base sin consultar el paper.
- Sesgos: no documentados en la informacion proporcionada; hereda los sesgos del modelo base y del dataset Charades-STA.
- Riesgo de alucinacion: no cuantificado para este adaptador; el modelo base Qwen2.5-VL-7B puede generar respuestas plausibles no respaldadas por el video.
- Idiomas: no disponibles; el entrenamiento se realizo presumiblemente en ingles por el dataset, pero no se confirma.
- Licencia Apache 2.0 declarada, pero el uso comercial del adaptador no esta avalado por el paper ni por validacion alguna; el modelo base tiene su propia licencia que debe respetarse.
- El trainer usado no esta incluido en la release de codigo, lo que limita la reproducibilidad exacta del entrenamiento.
- Tamano del repositorio de 0.2 GB: solo contiene pesos LoRA, no el modelo base; es necesario descargar Qwen2.5-VL-7B-Instruct por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-16frames-8434pairs-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace publico en la informacion proporcionada)
- Dataset de evaluacion: Charades-STA (no se proporciona enlace directo en la model card)
