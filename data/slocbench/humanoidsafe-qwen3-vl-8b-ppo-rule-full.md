# SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-Rule-Full

## Resumen

HumanoidSafe-Qwen3-VL-8B-PPO-Rule-Full es un ajuste fino del modelo vision-lenguaje Qwen3-VL-8B-Instruct desarrollado por SLOCBench, orientado a la moderacion de seguridad en robótica humanoide. El modelo se entrena con aprendizaje por refuerzo con verificador (RLVR) usando PPO y una recompensa basada en un clasificador de reglas de rechazo, sobre el split de entrenamiento original del dataset HumanoidSafe. Forma parte de un informe de ocho baselines completados y representa el checkpoint final de la variante `ppo-rule-full`.

Tecnicamente es un transformer vision-lenguaje de la familia Qwen3-VL, con aproximadamente 8.767 millones de parametros entrenables segun la configuracion de entrenamiento registrada (el campo de parametros totales en safetensors indica 1.095.890.975, dato que no coincide con el recuento de la model card y que conviene verificar antes de desplegar). El modelo acepta video (ocho fotogramas pre-evento como bloque unico) y texto, y genera una descripcion breve de escena/accion seguida de una etiqueta `<action>...</action>`.

Su relevancia actual radica en que aborda un problema poco cubierto: decidir si una instruccion dirigida a un humanoide es segura o debe rechazarse, con un esquema de recompensa binario por rama (danina vs. segura) y evaluacion sobre 70 pares retenidos. La licencia Apache 2.0 y el formato de pesos safetensors completos facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), sin dato adicional de variantes MoE |
| Parametros totales | 8.767.123.696 entrenables segun model card; el campo safetensors indica 1.095.890.975 (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo completo, tokenizer y processor incluidos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct (revision `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) y se ajusta con PPO sobre la totalidad de los parametros de lenguaje y vision (full-parameter fine-tuning). El entrenamiento usa el dataset `SLOCBench/HumanoidSafe` (config `checked`, revision `7952f2e870fb8f1dae6bc30ad6c5f09e845cbb0a`), split `train` original con 294 pares y 588 ramas de instruccion (segura y danina). El presupuesto fijo es de 3 epocas con semilla 42, 1.764 presentaciones activas de prompt, 7.056 completaciones validas muestreadas, 222 actualizaciones de rollout, dos pasadas de politica por actualizacion y 444 pasos de optimizador. El batch es de 8 prompts activos por 4 completaciones, salvo el lote final de cada epoca con 4 prompts.

La innovacion principal es el esquema de recompensa: un verificador de reglas (clasificador de frases de rechazo) recibe solo la instruccion y la respuesta generada, y asigna recompensa binaria terminal segun la rama (rechazo = 1 en rama danina, no rechazo = 1 en rama segura). PPO emplea un critico escalar por token sobre el backbone compartido del actor, gamma 1, GAE lambda 0.95, coeficiente de perdida de valor 0.5, clip de valor 0.2 y normalizacion de ventajas sobre tokens validos globales. La KL de referencia entra en el modelado de recompensa por token sin termino KL adicional de actor. Se usa AdamW con learning rate constante 1e-6, betas 0.9/0.999, epsilon 1e-8, weight decay 0, clip range 0.2, KL beta 0.02 y norma maxima de gradiente 1.0. El computo es BF16 con parametros maestros y estado de Adam en FP32, distribuido con FSDP sobre 8 GPUs y gradient checkpointing. La seleccion de checkpoint es la ultima actualizacion programada, sin seleccion guiada por test.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes y video.
- Procesamiento de video: ocho fotogramas pre-evento como bloque unico, FPS 2.0, entre 4.096 y 262.144 pixeles por fotograma, con `image_patch_size=16`.
- Clasificacion de seguridad de instrucciones para humanoides: produce descripcion breve de escena/accion y una etiqueta final `<action>...</action>`.
- Comportamiento de rechazo condicionado por prompt de sistema (`base` y `safe`), con plantillas publicadas en `prompt_templates.json`.
- Generacion no-thinking por defecto (greedy, 256 tokens nuevos, cache activada).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues limitadas a ingles y chino.
- Capacidades de audio: no disponible.

## Casos de uso

- Moderacion de instrucciones en robots humanoides: el modelo recibe los fotogramas previos al evento y la instruccion, y emite una etiqueta de accion que un modulo de control puede usar para bloquear ordenes potencialmente daninas. Es adecuado porque fue entrenado especificamente con recompensa binaria de rechazo sobre el dataset HumanoidSafe.
- Filtrado previo en pipelines de teleoperacion: antes de ejecutar una orden, se consulta al modelo con el contexto visual reciente; su salida estructurada `<action>` facilita el parseo y la integracion en un guardrail deterministico.
- Auditoria de registros de video: dado un conjunto de secuencias pre-evento, el modelo genera descripciones de escena/accion que pueden revisarse para detectar patrones de instrucciones inseguras.
- Investigacion en RLVR y alineamiento: sirve como baseline reproducible (semilla 42, presupuesto fijo, configuracion documentada) para comparar variantes de PPO, DPO u otras tecnicas sobre el mismo dataset.
- Evaluacion de robustez de modelos vision-lenguaje: los 70 pares retenidos y las 280 respuestas de evaluacion permiten medir sensibilidad a modos de prompt (`base` vs. `safe`) y a la rama de instruccion.
- Prototipado de asistentes bilingues EN/ZH para entornos roboticos: el modelo cubre ambos idiomas y puede integrarse en interfaces conversacionales que requieran contexto visual.
- Docencia y demostraciones de seguridad en IA: el repositorio incluye `load_model.py`, `prompt_templates.json` y `training_config.json`, lo que facilita reproducir la carga y el flujo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (split `test` con 70 pares, 280 respuestas, generacion greedy BF16, juicio primario GPT-5.5 y verificador de reglas), pero no incluye cifras numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con pesos BF16 de un modelo de ~8B, se requiere aproximadamente 16-17 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: el entrenamiento uso FSDP sobre 8 GPUs; para inferencia se recomienda A100 40/80 GB o H100 para margen amplio, y RTX 4090 (24 GB) puede ser suficiente en BF16 con batch pequeno.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 (24 GB) en BF16 con batch 1; en GPUs de 16 GB requeriria cuantizacion, no documentada.
- Opciones de despliegue: carga directa con `Qwen3VLForConditionalGeneration` y `AutoProcessor` de transformers; `attn_implementation="sdpa"`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-PPO-Rule-Full | ~8.767 M entrenables (segun model card) | no disponible | RLVR con PPO y recompensa por reglas sobre Qwen3-VL-8B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct | ~8B | no disponible | Vision-lenguaje generalista, base del anterior | no disponible en la informacion | Hugging Face |
| Otros baselines del informe HumanoidSafe | no disponible | no disponible | Variantes RLVR (DPO, PPO, etc.) | no disponible | Repositorio del informe |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles y chino; el rendimiento en castellano no esta validado.
- El dataset de entrenamiento es pequeno (294 pares, 588 ramas), lo que limita la generalizacion a dominios roboticos distintos de HumanoidSafe.
- La recompensa depende de un clasificador de reglas de frases de rechazo, lo que puede introducir atajos y sesgos hacia formulaciones concretas de rechazo.
- Evaluacion con juicio primario de GPT-5.5 y verificador de reglas: no se reportan metricas numericas, por lo que el rendimiento real es desconocido.
- Discrepancia entre el recuento de parametros de la model card (8.767.123.696) y el campo safetensors (1.095.890.975); verificar antes de dimensionar infraestructura.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware limitado.
- Riesgo de alucinacion en descripciones de escena y en la etiqueta `<action>`; conviene validar la salida con un parser estricto.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican terminos adicionales ni responsabilidades sobre el uso en robótica real.
- Los checkpoints son solo de inferencia: no incluyen estado de optimizador ni la cabeza de valor PPO.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-Rule-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementacion de preparacion de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
- Archivos del repositorio: `load_model.py`, `requirements.txt`, `training_config.json`, `prompt_templates.json`, `generation_config.json`
