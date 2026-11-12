# iclropen/evidence-audit-qwen7b-iougrpo-pc-lam001-s0

## Resumen

`evidence-audit-qwen7b-iougrpo-pc-lam001-s0` es un adaptador LoRA para el modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen` como material complementario de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No se trata de un modelo completo, sino de un conjunto de pesos LoRA (aproximadamente 190 MB en `adapter_model.safetensors`) que modifican exclusivamente el modelo de lenguaje del Qwen2.5-VL-7B, no la torre de vision.

El adaptador se entrena con una variante de GRPO (Group Relative Policy Optimization) guiada por recompensa de IoU, a la que se anade un termino de control de placebo con peso lambda=0.01. El objetivo del articulo es medir y reducir la dependencia de la evidencia visual real en tareas de localizacion temporal de video (video temporal grounding): el modelo deberia responder basandose en el contenido del video y no en atajos o sesgos del conjunto de datos.

Es relevante para investigadores que trabajen en grounding temporal de video, en alineacion multimodal y en evaluacion de fidelidad a la evidencia, ya que proporciona un punto de partida reproducible (semilla 0, hiperparametros documentados) sobre Charades-STA. Su utilidad practica esta limitada al ambito de investigacion: no es un modelo de proposito general y solo contiene pesos LoRA, no los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre de vision y modelo de lenguaje) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7B (según nomenclatura del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors (adaptador LoRA en bfloat16 presumiblemente) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

Parametros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Rango LoRA (r) | 16 |
| lora_alpha | 32 |
| Dropout LoRA | 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamano del repositorio | 0.2 GB |
| Libreria | peft |
| Version de transformers probada | 4.51.3 (con peft 0.20) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre de vision y modelo de lenguaje. Segun la model card, el entrenamiento utilizo gradient checkpointing, lo que provoco que la torre de vision no recibiera gradiente: las matrices `lora_B` correspondientes a `base_model.model.visual.*` estan a cero, de modo que el adaptador modifica unicamente el modelo de lenguaje. Este detalle es importante para interpretar los resultados: el efecto del entrenamiento se limita a la parte textual del modelo.

El objetivo de entrenamiento combina una perdida NLL sobre video limpio con un termino GRPO basado en recompensa de IoU. Se anade un termino de control de placebo con peso lambda=0.01: se compara la recompensa del video editado en la evidencia (`x_E`) y de una edicion de placebo fuera del intervalo anotado (`x_O`) frente a la recompensa del video original (`x`), usando una funcion softplus con temperatura beta y pesos Group-DRO. Los hiperparametros documentados son: coeficiente KL 0.04, 8 muestras por pregunta (G=8), 4 preguntas por paso, 20 pasos de warm-up, 2.400 pares de entrenamiento de Charades-STA, 600 pasos de optimizador, semilla 0 y learning rate 1e-5. La entrada de video se procesa a 2 fps con un maximo de 768 fotogramas, con orden de mensajes video primero y luego texto, y estilo de prompt/answer `timer1_default` / `timer1`.

Una innovacion tecnica destacable es la auditoria de evidencia propuesta en el articulo: ademas de medir la precision de la localizacion temporal, se evalua la sensibilidad del modelo a la edicion de evidencia (auditoria de verosimilitud) y a cambios de comportamiento (auditoria conductual), comparando con un placebo controlado. El repositorio incluye scripts de evaluacion y auditoria en `iclropen/evidence-audit-code`.

## Capacidades

- Localizacion temporal de video (video temporal grounding) sobre el conjunto Charades-STA: dado un video y una consulta textual, predice el intervalo temporal correspondiente.
- Razonamiento multimodal video-texto heredado de Qwen2.5-VL-7B-Instruct, limitado al modelo de lenguaje por el diseno del adaptador.
- Generacion de texto y respuestas en formato de marcas temporales (`timer1` / `timer1_default`) para intervalos de video.
- Sensibilidad a la evidencia visual entrenada mediante el termino de control de placebo: el adaptador busca reducir respuestas basadas en atajos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni thinking mode especificas del adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Investigacion en grounding temporal de video: usar el adaptador como baseline reproducible (semilla 0, hiperparametros fijados) para comparar metodos de entrenamiento que midan dependencia de la evidencia en Charades-STA.
- Auditoria de fidelidad a la evidencia: emplear los scripts de auditoria de verosimilitud y conductual del repositorio de codigo para cuantificar si el modelo responde al video real o a sesgos del dataset, con `--model  --adapter <folder>`.
- Estudio de tecnicas de RL para modelos multimodales: analizar el efecto del termino de placebo controlado (lambda=0.01) y de la recompensa de IoU en GRPO sobre el comportamiento del modelo de lenguaje.
- Reproduccion de resultados de articulo: cargar el adaptador con transformers 4.51.3 y peft 0.20 y ejecutar la autocomprobacion incluida en la model card para verificar que los tensores LoRA se han cargado correctamente.
- Analisis de ablaciones: comparar este adaptador con otras variantes del mismo autor (distintos valores de lambda o semillas) para estudiar la robustez del entrenamiento.
- Experimentos docentes sobre PEFT: usar el adaptador como ejemplo practico de LoRA sobre un modelo multimodal de 7B, con solo 190 MB de pesos adicionales, en entornos de laboratorio con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de grounding (IoU, R@1) para este adaptador, y no deben inferirse cifras.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 190 MB; los requisitos reales vienen del modelo base Qwen2.5-VL-7B-Instruct.
- Inferencia del modelo base en bfloat16: se estima VRAM en el entorno de 16-20 GB para pesos mas activaciones, aunque no se dispone de mediciones publicadas en la informacion proporcionada.
- GPU recomendadas para el modelo base: A100, H100 o RTX 4090/RTX 6000 Ada para bfloat16; GPUs consumer con 24 GB pueden ser suficientes para el modelo base, no confirmado en la documentacion.
- Despliegue: la model card solo documenta carga mediante transformers 4.51.3 + peft 0.20; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.
- Requisito critico de version: cargar el adaptador con transformers 5.x no produce error pero deja los pesos LoRA sin aplicar; es obligatorio usar transformers 4.51.3 (probado) y ejecutar la autocomprobacion incluida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-pc-lam001-s0 | LoRA sobre 7B | No disponible | Grounding temporal de video (Charades-STA) | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible en esta ficha | Multimodal general video-texto | No disponible en esta ficha | Hugging Face |
| Otros adaptadores del mismo autor (`iclropen`) | LoRA sobre 7B | No disponible | Grounding temporal de video | apache-2.0 | Hugging Face |
| Alternativas de grounding temporal de video de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo contiene pesos LoRA: no es un modelo autonomo y requiere descargar Qwen2.5-VL-7B-Instruct para funcionar.
- La torre de vision no fue entrenada (matrices `lora_B` a cero por gradient checkpointing), por lo que el adaptador solo altera el modelo de lenguaje; no debe esperarse una mejora en la representacion visual.
- Incompatibilidad silenciosa entre transformers 4.51 y 5.x: los pesos pueden no cargarse sin lanzar error; es imprescindible ejecutar la autocomprobacion de la model card.
- Ambito muy restringido: entrenado sobre Charades-STA (2.400 pares) y orientado a grounding temporal; no es adecuado como modelo de proposito general.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un adaptador de investigacion no se han publicado evaluaciones de sesgo.
- Idiomas soportados: no disponibles; el comportamiento multilingue depende del modelo base y no esta verificado.
- Licencia apache-2.0 para el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen2.5-VL-7B-Instruct, no detallada en esta informacion.
- Estado de publicacion: asociado a un articulo en revision (ICLR 2027); los resultados pueden cambiar y el repositorio no forma parte del PDF enviado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-pc-lam001-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del articulo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace publico disponible en la informacion proporcionada.
