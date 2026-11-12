# iclropen/evidence-audit-videochatr1-7b-sft-textfirst-s0

## Resumen

`evidence-audit-videochatr1-7b-sft-textfirst-s0` es un adaptador LoRA de ajuste supervisado (SFT) para el modelo base `OpenGVLab/VideoChat-R1_7B`, un modelo vision-lenguaje de 7B parametros construido sobre la arquitectura Qwen2.5-VL. Lo desarrolla el usuario `iclropen` en el contexto de la publicacion *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviada a ICLR 2027 y actualmente en revision. El adaptador esta disenado para la tarea de localizacion temporal de evidencia en video (*video temporal grounding*), concretamente sobre el conjunto de datos Charades-STA.

El problema que aborda es la dependencia de la evidencia: un modelo puede acertar la respuesta sin haber utilizado realmente el fragmento de video relevante, apoyandose en sesgos del prompt o del contexto. Este adaptador forma parte de un estudio que mide y entrena esa dependencia, y esta pensado como una de las variantes de referencia (SFT puro, con los terminos de evidencia y placebo desactivados) frente a las cuales se comparan los metodos propuestos en el articulo.

Es relevante ahora porque expone una critica metodologica a las metricas de exactitud en tareas de grounding, y porque publica un adaptador ligero (190 MB) que puede cargarse sobre el modelo base sin reentrenar. No obstante, se trata de un artefacto de investigacion: no hay pipeline declarado, cero descargas, cero likes y la model card no documenta idiomas ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base VideoChat-R1_7B); adaptador PEFT |
| Parametros totales | no disponible (adaptador de 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |
| Rango y alpha de LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Version de transformers | 5.x (probado con 5.12.1); peft 0.19.1 o superior |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre los modulos de atencion y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) del modelo base VideoChat-R1_7B, que sigue la arquitectura Qwen2.5-VL. Solo se publican los pesos del adaptador; el modelo base debe descargarse por separado desde `OpenGVLab/VideoChat-R1_7B`.

El entrenamiento es un SFT puro con la misma funcion de perdida del articulo pero con los terminos de evidencia y placebo desactivados (alpha=1,0, beta=1e-9, sin cota de placebo). Se usaron 2.400 pares de entrenamiento extraidos de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente de 8. La entrada de video se muestrea a 2 fps con un maximo de 768 frames. Se aplican dos operadores de edicion por ejemplo entre `swap`, `mask`, `blur`, `tshift` y `shuffle`. El orden de los mensajes es texto primero y video despues, con estilo de prompt y respuesta `vchat`. El entrenador de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia tecnica importante: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que la model card incluye un autochequeo con `safetensors` que verifica que cada tensor haya aterrizado en un modulo y coincida en valor.

## Capacidades

- Localizacion temporal de evidencia en video (*video temporal grounding*) sobre videos de Charades-STA.
- Razonamiento vision-lenguaje heredado del modelo base Qwen2.5-VL (comprension de video e imagen, respuesta a prompts multimodales).
- Procesamiento de video a 2 fps con hasta 768 frames por muestra.
- Entrenado con pares de edicion (swap, mask, blur, tshift, shuffle) orientados a medir la dependencia de la evidencia.
- Soporte de tool calling / function calling: no documentado en la model card; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): vision si (heredada del base); audio no documentado.

## Casos de uso

- Evaluacion de robustez en grounding: usar el adaptador como referencia SFT para comparar la exactitud frente a variantes entrenadas con terminos de evidencia y placebo, siguiendo los scripts de auditoria del repositorio de codigo.
- Auditoria de dependencia de evidencia: aplicar ediciones de evidencia y placebos sobre el video y medir la caida de rendimiento con el protocolo del articulo (auditoria de verosimilitud y auditoria de comportamiento).
- Investigacion en atribucion visual: analizar si el modelo responde al intervalo anotado o a senales espurias del prompt, usando el autochequeo de carga y las metricas a 2 fps con decodificacion greedy.
- Reproduccion de resultados del articulo: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 para reproducir las Tablas 10 y 18 del paper.
- Desarrollo de metodos de entrenamiento con senales de evidencia: servir como linea base SFT sobre la que anadir los terminos de la funcion de perdida propuesta.
- Analisis de sensibilidad a operadores de edicion: comparar el efecto de swap, mask, blur, tshift y shuffle sobre el rendimiento del adaptador en Charades-STA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 10 y 18 del articulo, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni metricas de grounding.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base VideoChat-R1_7B (7B parametros). En bfloat16 se situa en torno a 14-16 GB solo para pesos, mas memoria para el procesador de video y los frames (hasta 768 frames a 2 fps). El adaptador LoRA anade unos 190 MB.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y videos largos; RTX 4090 (24 GB) para inferencia en bfloat16 con un solo ejemplo.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en GPUs de 16 GB con cuantizacion del modelo base (no documentada para este adaptador).
- Opciones de despliegue: transformers 5.x con peft 0.19.1 o superior (stack probado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-sft-textfirst-s0 | Adaptador LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face, 0 descargas |
| OpenGVLab/VideoChat-R1_7B (modelo base) | 7B | no disponible | Vision-lenguaje y video | no disponible en la informacion | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de este adaptador ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: cero descargas y cero likes; no hay pipeline declarado ni validacion externa.
- Solo contiene los pesos LoRA; requiere descargar el modelo base VideoChat-R1_7B por separado.
- Riesgo de carga silenciosa: con una version incorrecta de transformers los pesos LoRA no se cargan y no se lanza error; es obligatorio ejecutar el autochequeo de la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares); no hay evidencia de generalizacion a otros dominios de video.
- El SFT desactiva los terminos de evidencia y placebo (beta=1e-9), por lo que no incorpora el objetivo completo del articulo; es una linea base, no el metodo propuesto.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la model card; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no verificadas en la informacion disponible.
- Sin datos de benchmarks propios; las cifras solo aparecen en el articulo en revision (Tablas 10 y 18).

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-sft-textfirst-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Codigo del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, en revision; sin enlace publico en la informacion disponible)
