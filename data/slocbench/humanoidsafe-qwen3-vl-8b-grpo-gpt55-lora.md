# SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-LoRA

## Resumen

HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-LoRA es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8.810 millones de parametros desarrollado por Alibaba Qwen. El adaptador lo publica SLOCBench y su proposito es alinear el comportamiento del modelo base en escenarios de seguridad de robots humanoides: dado un conjunto de ocho fotogramas previos a un evento, el modelo debe describir la escena y la accion y emitir una etiqueta `<action>` que indique si la instruccion es segura o debe rechazarse.

El entrenamiento emplea RLVR (Reinforcement Learning with Verifiable Rewards) mediante GRPO, con una recompensa binaria asignada por un verificador de reglas (clasificador de frases de rechazo) y un segundo juez basado en GPT-5.5 con rubrica fija. El adaptador se entrena solo sobre las capas de atencion y MLP del modulo de lenguaje; la torre visual permanece congelada. Se trata de un checkpoint de investigacion orientado a reproducir un baseline de RLVR, no de un modelo de produccion general.

La relevancia actual reside en que ejemplifica el patron de ajuste fino con RL verificable sobre modelos multimodales para tareas de seguridad fisica, un area con pocos baselines publicos y reproducibles. El repositorio incluye configuracion de entrenamiento completa, plantillas de prompt y scripts de carga, lo que facilita la replicacion del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptador LoRA entrenado mediante GRPO |
| Parametros totales | 8.810.770.672 (modelo base + adaptador) |
| Parametros activos | No aplica (no es MoE); 43.646.976 parametros entrenables en el adaptador |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el autor documenta inferencia en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA sin fusionar, ~0.1 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer multimodal que procesa imagenes y video mediante un tower visual con parches de 16 pixeles y un modulo de lenguaje Qwen3. El adaptador LoRA se aplica exclusivamente a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modulo de lenguaje, con rango 16, alpha 32, dropout 0 y sesgo `none`. La torre visual queda congelada durante todo el entrenamiento.

El entrenamiento usa el split `train` del dataset SLOCBench/HumanoidSafe: 294 pares de video, cada uno con una rama de instruccion segura y otra peligrosa (588 ramas en total). Se ejecutaron 3 epocas con semilla 42, lo que supone 1.764 presentaciones de prompt activas, 7.056 completaciones validas, 222 actualizaciones de rollout y 444 pasos de optimizador. El batch fue de 8 prompts activos por 4 completaciones (salvo el ultimo batch de cada epoca, con 4 prompts). Se uso AdamW con learning rate constante de 1e-05, betas 0.9/0.999, epsilon 1e-8, weight decay 0, clip range 0.2, beta de KL de referencia 0.02 y norma maxima de gradiente 1.0. El computo fue en BF16 con parametros maestros y estado de Adam en FP32, distribuido con FSDP sobre 8 GPUs y gradient checkpointing.

La innovacion tecnica principal es el esquema de recompensa verificable: GRPO normaliza las cuatro recompensas de cada grupo de prompt con la desviacion estandar poblacional y epsilon 1e-4. La recompensa binaria la asigna un clasificador de frases de rechazo (1 si la rama es peligrosa y el modelo rechaza, 0 en caso contrario; invertido para ramas seguras), complementado por GPT-5.5 con rubrica fija y esfuerzo de razonamiento bajo. Las respuestas vacias o los fallos del verificador abortan la actualizacion del optimizador en lugar de asignar una recompensa fabricada. La seleccion de checkpoint es la ultima actualizacion programada, sin seleccion guiada por test.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre secuencias de video (8 fotogramas como bloque de video unico, FPS 2.0, entre 4.096 y 262.144 pixeles por fotograma).
- Descripcion de escena y accion a partir de fotogramas previos a un evento.
- Clasificacion de seguridad de instrucciones mediante una etiqueta final `<action>...</action>`.
- Comportamiento de rechazo condicionado por la plantilla de sistema (`base` o `safe`).
- Procesamiento de imagen y video mediante el pipeline de Qwen3-VL (`image_patch_size=16`, metadatos de `qwen_vl_utils.process_vision_info`).
- Capacidades multilingues limitadas a ingles y chino, heredadas del modelo base.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion proporcionada.

## Casos de uso

- Investigacion en RLVR multimodal: el adaptador sirve como baseline reproducible para comparar tecnicas de recompensa verificable sobre modelos vision-language, con configuracion de entrenamiento y semillas documentadas.
- Evaluacion de seguridad en robótica humanoide: dado un conjunto de fotogramas previos a una accion, el modelo clasifica si la instruccion es segura, lo que permite auditar politicas de control antes de desplegarlas en un robot real.
- Generacion de datasets de rechazo: el modelo puede producir respuestas de rechazo etiquetadas que alimenten posteriores etapas de filtrado o ajuste supervisado.
- Analisis de video de vigilancia industrial: procesando ocho fotogramas a FPS 2.0 se puede describir una accion en curso y marcar situaciones potencialmente peligrosas en entornos con humanoides.
- Estudio de alineacion con multiples jueces: la combinacion de verificador de reglas y GPT-5.5 permite analizar discrepancias entre recompensas simbolicas y basadas en LLM, util para calibrar rubricas de seguridad.
- Prototipado de asistentes de supervision en fabricacion: el modelo describe la escena y emite una etiqueta de accion que un sistema supervisor puede usar para bloquear comandos riesgosos antes de ejecutarlos.
- Docencia y reproducibilidad: el repositorio incluye `load_model.py`, `requirements.txt`, `prompt_templates.json` y `training_config.json`, lo que facilita replicar el experimento en cursos de RL y vision-language.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion sobre el split `test` original de 70 pares retenidos (ambas ramas de instruccion y ambas plantillas `base`/`safe`), pero no incluye cifras numericas de accuracy, tasa de rechazo ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 8.810 millones de parametros; en BF16 requiere aproximadamente 17,6 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en BF16 con margen; RTX 4090 (24 GB) puede funcionar en BF16 con `device_map="auto"` y batches pequenos, aunque el procesamiento de video con hasta 262.144 pixeles por fotograma incrementa el consumo de memoria.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con cuantizacion, aunque el autor solo documenta BF16.
- Opciones de despliegue: el autor proporciona carga via `transformers` + `peft` con `attn_implementation="sdpa"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Dado que el adaptador no esta fusionado, es necesario cargar el modelo base y aplicar `PeftModel.from_pretrained` con `autocast_adapter_dtype=False`.
- Latencia y throughput: no disponibles. La generacion por defecto es greedy, con 256 tokens nuevos y cache habilitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-LoRA | 8,81 B (43,6 M entrenables) | No disponible | Imagen/video + texto | Apache 2.0 | Adaptador LoRA especializado en seguridad de humanoides |
| Qwen/Qwen3-VL-8B-Instruct | 8,81 B | No disponible en esta ficha | Imagen/video + texto | Apache 2.0 | Modelo base sin ajuste de seguridad especifico |
| Otros baselines del informe SLOCBench | No disponible | No disponible | Imagen/video + texto | No disponible | El autor menciona ocho baselines RLVR completados, pero no se detallan en la informacion proporcionada |

La comparativa cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un adaptador LoRA sin fusionar, pensado para reproducir un baseline RLVR, no para uso en produccion general.
- Alcance muy restringido: entrenado exclusivamente sobre el dataset SLOCBench/HumanoidSafe y con plantillas de prompt fijas (`base` y `safe`); su comportamiento fuera de ese dominio no esta caracterizado.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Riesgo de alucinacion: el modelo puede generar descripciones de escena o etiquetas `<action>` incorrectas, especialmente con fotogramas ambiguos o fuera de distribucion.
- Sesgos: no se documenta analisis de sesgos; el dataset de entrenamiento es pequeno (294 pares) y especifico de escenarios de humanoides.
- Dependencia estricta de versiones: requiere el modelo base en la revision `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`, Python 3.9.21 y las versiones fijadas en `requirements.txt`; desviarse puede alterar resultados.
- La recompensa de entrenamiento combina un clasificador de reglas y GPT-5.5, lo que introduce dependencia de un servicio externo durante el entrenamiento y posibles sesgos del juez.
- No se incluyen estado del optimizador, estado de reanudacion ni la cabeza de valor PPO usada solo en entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion en dominios ajenos al dataset desaconseja su despliegue sin validacion previa.
- El contexto maximo del modelo base no se detalla en la informacion proporcionada, lo que impide planificar cargas de video de mayor duracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de ocho baselines RLVR: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementacion de preparacion de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
- Script de carga: `load_model.py` (incluido en el repositorio)
- Plantillas de prompt: `prompt_templates.json` (incluido en el repositorio)
- Configuracion de entrenamiento: `training_config.json` (incluido en el repositorio)
- Requisitos: `requirements.txt` (incluido en el repositorio)
