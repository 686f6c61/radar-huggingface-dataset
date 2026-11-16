# SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-Full

## Resumen

HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-Full es un ajuste fino por aprendizaje por refuerzo (RLVR con PPO) del modelo vision-lenguaje Qwen3-VL-8B-Instruct, desarrollado por SLOCBench. El modelo está especializado en la evaluación de seguridad de escenas con humanoides: recibe ocho fotogramas previos a un evento como bloque de vídeo y genera una descripción breve de escena y acción seguida de una etiqueta `<action>` que indica si la instrucción es segura o peligrosa. El objetivo es alinear el modelo para que rechace instrucciones dañinas y acepte las seguras en dominios robóticos.

El entrenamiento parte de Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) y aplica PPO con un crítico escalar por token, recompensa binaria terminal verificada por un clasificador de frases de rechazo y una recompensa adicional de GPT-5.5 con rúbrica fija. Se entrenan todos los parámetros (lenguaje y visión) con FSDP en 8 GPU durante 3 épocas con semilla 42.

Es relevante porque publica un baseline RLVR reproducible y con presupuesto fijo sobre un conjunto de datos de seguridad para humanoides, con checkpoints de inferencia independientes (sin cabezal de valor PPO ni estado del optimizador) y una configuración de evaluación explícita sobre 70 pares retenidos. El repo ocupa 17,5 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL); clase `Qwen3VLForConditionalGeneration` |
| Parametros totales | 8.767.123.696 (según la model card; el recuento de safetensors del repo indica 1.095.890.975, discrepancia no aclarada en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el repo no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen3-VL-8B-Instruct, un transformer vision-lenguaje que procesa imágenes y vídeo mediante un codificador visual con `image_patch_size=16` y un decodificador de lenguaje. La entrada de evaluación son ocho fotogramas previos al evento tratados como un único bloque de vídeo a FPS 2.0, con mínimo de 4.096 y máximo de 262.144 píxeles por fotograma; el procesamiento usa `qwen_vl_utils.process_vision_info` y `do_resize=False` en el procesador. No se emplean fotogramas posteriores al evento, metadatos de resultado ni etiquetas de seguridad como entrada.

El entrenamiento usa RLVR con PPO sobre el split `train` original de `SLOCBench/HumanoidSafe` (config `checked`, revisión `7952f2e870fb8f1dae6bc30ad6c5f09e845cbb0a`): 294 pares y 588 ramas de instrucción (segura y dañina), solo con prompts `base`. Presupuesto de 3 épocas, semilla 42, 1.764 presentaciones de prompt activas y 7.056 completaciones válidas muestreadas; 222 actualizaciones de rollout con dos pasadas de política cada una (444 pasos de optimizador). Lote de 8 prompts activos × 4 completaciones (cola de época de 4 prompts). Muestreo con temperatura 1.0, top-p 1.0, top-k 0, penalización de repetición 1.0 y máximo 256 tokens nuevos. Optimizador AdamW con LR constante 1e-06, betas 0.9/0.999, epsilon 1e-8 y weight decay 0; recorte de rango 0.2, beta KL de referencia 0.02 y norma máxima de gradiente 1.0. Precisión BF16 con parámetros maestros y estado de Adam en FP32, FSDP sobre 8 GPU y checkpointing de gradientes.

El crítico PPO es un escalar aprendido por token sobre el backbone compartido del actor, con gamma 1, GAE lambda 0.95, coeficiente de pérdida de valor 0.5, recorte de valor 0.2 y normalización de ventaja sobre tokens válidos globales. La recompensa binaria es terminal y se asigna según la rama: en ramas dañinas, rechazo = 1 y no rechazo = 0; en ramas seguras, rechazo = 0 y no rechazo = 1. La KL de referencia entra en el modelado de recompensa por token, sin término KL adicional del actor. El verificador recibe solo la instrucción y la respuesta generada; las respuestas vacías o fallos no resueltos del verificador provocan error antes de la actualización del optimizador, sin recompensa fabricada.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo (entrada image-text-to-text).
- Procesamiento de vídeo: ocho fotogramas previos al evento como bloque único, con control de FPS y resolución.
- Clasificación de seguridad de instrucciones en escenas con humanoides: salida con descripción breve de escena/acción y etiqueta final `<action>...</action>`.
- Modo de prompt dual: mensajes de sistema `base` y `safe` definidos en `prompt_templates.json`.
- Generación no-thinking, greedy por defecto (según `generation_config.json`: 256 tokens nuevos, caché activada).
- Multilingüe en inglés y chino.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Evaluación de seguridad en robótica humanoide: el modelo recibe fotogramas previos a una acción y una instrucción, y emite una etiqueta de seguridad que permite filtrar comandos peligrosos antes de ejecutarlos.
- Moderación de instrucciones en entornos simulados: integrado como clasificador previo en un pipeline de simulación, descarta instrucciones dañinas sobre escenas con humanoides usando el prompt `safe`.
- Investigación en RLVR y alineación: sirve como baseline reproducible (PPO, GPT-5.5 como recompensa, ajuste completo) para comparar con otros seis baselines del informe publicado.
- Auditoría de conjuntos de datos de seguridad: permite etiquetar pares instrucción-escena y contrastar con las etiquetas originales de `SLOCBench/HumanoidSafe`.
- Análisis de vídeo de corta duración en robótica: procesa ocho fotogramas a FPS 2.0 para describir escena y acción en dominios de manipulación y navegación.
- Evaluación comparativa de sistemas de visión-lenguaje: la configuración de evaluación fija (greedy, BF16, 256 tokens, semilla 42, 280 respuestas sobre 70 pares) facilita la reproducibilidad entre modelos.
- Filtrado previo en asistentes de operadores de robots: responde en inglés o chino con una salida estructurada fácil de parsear por un orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (split `test` original con 70 pares retenidos, ambas ramas y ambos modos de prompt, 280 respuestas, juicio primario GPT-5.5 y juicio secundario por reglas), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8.767.123.696 parámetros en BF16 se requieren aproximadamente 17,5 GB solo para pesos, más activaciones y caché KV, por lo que en la práctica se necesitan GPUs de 24 GB o más para contexto corto.
- GPU recomendadas: el entrenamiento usó FSDP sobre 8 GPU (modelo no especificado). Para inferencia se recomienda A100 40/80 GB, H100 o GPUs consumer de 24 GB (RTX 4090) con precisión reducida y contexto limitado.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en BF16 con contexto corto; no confirmado en la información disponible.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration`, `attn_implementation="sdpa"`, `device_map="auto"` y `torch_dtype=torch.bfloat16`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-Full | 8.767.123.696 (según model card) | no disponible | Seguridad en escenas de humanoides (RLVR/PPO) | apache-2.0 |
| Qwen/Qwen3-VL-8B-Instruct | no disponible | no disponible | Vision-lenguaje general (modelo base) | no disponible en la información proporcionada |
| Otros baselines del informe `humanoidsafe-qwen3vl8b-rlvr-2026-11-15` | no disponible | no disponible | RLVR sobre el mismo dataset | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El recuento de parámetros de safetensors (1.095.890.975) no coincide con el de la model card (8.767.123.696); conviene verificar la integridad del checkpoint antes de usarlo en producción.
- Modelo de nicho: entrenado exclusivamente sobre `SLOCBench/HumanoidSafe` con prompts `base`; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación en las descripciones de escena y en la etiqueta `<action>`, especialmente con entradas de vídeo distintas de las ocho pre-evento a FPS 2.0.
- La evaluación depende de un juez GPT-5.5 con rúbrica fija y de un clasificador de frases de rechazo; los resultados pueden no transferirse a otros verificadores.
- Idiomas limitados a inglés y chino; no se garantiza calidad en castellano.
- Solo se publican checkpoints de inferencia: no hay cabezal de valor PPO ni estado para reanudar el entrenamiento.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni soporte en motores de serving de alto rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones y sesgos del base Qwen3-VL-8B-Instruct, no evaluados en esta ficha.
- El pipeline de entrada exige `do_resize=False` tras `qwen_vl_utils.process_vision_info` y límites de píxeles por fotograma; un preprocesado distinto puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
