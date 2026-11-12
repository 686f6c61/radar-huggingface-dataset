# iclropen/evidence-audit-qwen7b-pc-a05-uniform-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-uniform-s0` es un adaptador LoRA para el modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario `iclropen` en el contexto de un articulo academico sobre grounding temporal en video. El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen2.5-VL-7B-Instruct (7.000 millones de parametros, arquitectura transformer multimodal) y superponer los pesos LoRA entrenados. Su proposito especifico es el *video temporal grounding* sobre el conjunto de datos Charades-STA, es decir, localizar el intervalo temporal de un video que corresponde a una descripcion textual.

El adaptador forma parte de un estudio mas amplio titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. La variante `uniform-s0` corresponde a una ablation concreta: pesos uniformes por operador y sin Group-DRO (Group Distributionally Robust Optimization), con semilla 0. El objetivo de entrenamiento combina supervisión limpia con un termino de control de placebo que penaliza que el modelo dependa de artefactos de edicion en lugar de la evidencia visual real.

Es relevante para investigadores que trabajen en evaluacion de fidelidad de modelos multimodales y en metodos de entrenamiento que midan la dependencia de evidencia, no solo la precision bruta. No es un modelo de proposito general ni esta pensado para despliegue en produccion: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA: 190.442.760 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base soporta las cuantizaciones habituales de Qwen2.5-VL) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-VL-7B-Instruct) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Libreria | peft (transformers 5.x, probado con 5.12.1; peft >= 0.19.1) |
| Tamano del repo | 0.2 GB |
| Entrada de video | 2 fps, maximo 768 frames |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto. Los pesos LoRA se insertan en los modulos de atencion (q, k, v, o) y en los modulos MLP (gate, up, down) tanto del torre de lenguaje como del codificador visual, con rango 16 y alpha 32. El adaptador ocupa aproximadamente 190 MB, lo que confirma que solo se entrenaron los parametros de bajo rango.

El entrenamiento sigue el objetivo descrito en la seccion 4 del paper: una perdida que combina NLL sobre el video limpio (peso alpha=0.5) con terminos de margen (beta=0.1) que comparan la recompensa del modelo sobre el video original frente a una edicion de evidencia (x_E) y frente a una edicion placebo fuera del intervalo anotado (x_O), mas un hinge sobre la caida de placebo con cota d_O(trained) <= 1.25 * d_O(reference) + 0.10. Se usaron 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion empleados en entrenamiento fueron swap, mask, blur, tshift y shuffle, aplicando 2 por ejemplo. La variante `uniform-s0` usa pesos uniformes por operador y omite Group-DRO, lo que la convierte en la ablation de referencia frente a las variantes con ponderacion adaptativa.

Una innovacion tecnica destacable es el mecanismo de control de placebo: en lugar de entrenar solo para acertar el intervalo, el modelo se penaliza si su confianza cae cuando se edita el video fuera del intervalo anotado, forzando que la evidencia utilizada sea la correcta y no artefactos correlacionados.

## Capacidades

- Grounding temporal en video: localizacion del intervalo temporal que corresponde a una consulta textual sobre videos de Charades-STA.
- Procesamiento multimodal de video a 2 fps con hasta 768 frames por muestra.
- Razonamiento visual-lenguaje heredado del modelo base Qwen2.5-VL-7B-Instruct (descripcion de escenas, respuesta a preguntas visuales).
- Soporte de tool calling y function calling: heredado del modelo base, no verificado especificamente para este adaptador.
- Capacidades multilingues: heredadas del modelo base; no documentadas para el adaptador.
- Modo de evaluacion de fidelidad: el adaptador esta disenado para ser auditado con los scripts de likelihood audit y behavioural audit del repositorio de codigo.
- No se documentan capacidades de audio ni de agente multi-paso especificas para este adaptador.

## Casos de uso

- Investigacion en fidelidad de modelos multimodales: usar el adaptador como linea base de ablation (`uniform-s0`) para comparar con variantes con Group-DRO y medir si la dependencia de evidencia mejora con ponderacion adaptativa. Es adecuado porque el propio paper lo posiciona como referencia en las tablas 2, 6, 7, 10, 13 y figura 3.
- Auditoria de dependencia de evidencia: aplicar los scripts de likelihood audit del repositorio `iclropen/evidence-audit-code` para medir como cambia la confianza del modelo ante ediciones de evidencia (swap, mask, blur, tshift, shuffle) frente a ediciones placebo.
- Reproduccion de resultados academicos: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 siguiendo el self-check de la model card para replicar las metricas de grounding temporal reportadas en el paper.
- Estudio de robustez ante corrupcion de video: evaluar el comportamiento del modelo cuando se enmascara o difumina la region de evidencia, comparando con el modelo base sin adaptador.
- Desarrollo de metodos de entrenamiento con control de placebo: reutilizar el objetivo de perdida (alpha, beta, hinge) como plantilla para otros dominios de grounding (audio, texto largo) donde se quiera penalizar la dependencia de artefactos.
- Docencia y formacion en evaluacion de modelos: utilizar el par modelo base + adaptador como ejemplo practico de como un LoRA de investigacion puede cambiar el comportamiento de un modelo multimodal sin reentrenar los 7.000 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las tablas 2, 6, 7, 10 y 13 y la figura 3 del paper para los resultados, pero no incluye los valores numericos. No se deben inferir cifras de precision, recall o mIoU sin consultar el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM solo para los pesos; con cache KV y procesamiento de hasta 768 frames a 2 fps, la VRAM efectiva puede superar los 24 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluacion a maxima resolucion de frames; RTX 4090 24 GB puede ser suficiente con cuantizacion o reduciendo el numero de frames.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB con cuantizacion del modelo base (por ejemplo, 4-bit) y limitando frames; en RTX 3090 24 GB de forma ajustada.
- Opciones de despliegue: transformers 5.12.1 + peft 0.19.1 (unica combinacion validada en la model card); vLLM y TGI no estan verificados para este adaptador. llama.cpp y Ollama no soportan adaptadores PEFT de forma directa sobre el modelo base multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota critica: cargar el adaptador con transformers 4.51 en lugar de 5.x no produce error pero deja los pesos LoRA sin cargar; es obligatorio ejecutar el self-check de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-uniform-s0 | 7B (base) + LoRA | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible | Vision-lenguaje general | apache-2.0 | Hugging Face, ampliamente usado |
| Variantes del mismo paper con Group-DRO | 7B (base) + LoRA | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Referenciadas en el paper, no listadas en la informacion |
| Otros adaptadores de grounding temporal | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

La comparativa se limita al modelo base y a las variantes del mismo estudio, ya que no se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo listo para produccion: 0 descargas, 0 likes y creado en noviembre de 2026 como artefacto de un paper en revision.
- Dependencia estricta de la version de transformers: cargar con 4.51 en lugar de 5.x deja los pesos LoRA sin aplicar de forma silenciosa; es imprescindible ejecutar el self-check incluido en la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares): no se garantiza generalizacion a otros dominios de video, idiomas o estilos de consulta.
- El objetivo de entrenamiento incluye terminos de placebo y hinge que pueden producir comportamientos conservadores en la prediccion de intervalos; no se documentan metricas de precision en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los sesgos del modelo base Qwen2.5-VL-7B-Instruct.
- Riesgo de alucinacion: no evaluado especificamente para este adaptador; el modelo base puede generar descripciones plausibles pero incorrectas.
- Limitaciones de contexto e idioma: no disponibles; el adaptador se entreno con prompts en estilo `timer1_default` y respuestas `timer1`, lo que puede limitar su uso fuera de ese formato.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene su propia licencia que debe verificarse por separado.
- El paper esta en revision (ICLR 2027): los resultados y conclusiones pueden cambiar antes de la publicacion final.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-uniform-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la informacion proporcionada)
- Dataset Charades-STA: no disponible en la informacion proporcionada
