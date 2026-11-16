# SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-Rule-LoRA

## Resumen

HumanoidSafe-Qwen3-VL-8B-PPO-Rule-LoRA es un adaptador PEFT (LoRA) de tipo vision-language desarrollado por SLOCBench sobre el modelo base Qwen/Qwen3-VL-8B-Instruct. El adaptador se ha entrenado mediante aprendizaje por refuerzo con retroalimentación verificable (RLVR) usando PPO y una recompensa basada en un clasificador de reglas de rechazo, con el objetivo de que el modelo aprenda a distinguir entre instrucciones seguras y peligrosas en el contexto de escenas con humanoides y emitir respuestas de rechazo cuando corresponda.

El modelo resuelve un problema de seguridad alineada en entornos visuales: dado un vídeo de ocho fotogramas previos al evento (a 2,0 FPS) y una instrucción, el modelo debe describir brevemente la escena y la acción y emitir una etiqueta final `<action>...</action>`, rechazando las instrucciones dañinas y aceptando las seguras. Es relevante porque aplica RLVR con PPO a un modelo multimodal de 8B, un enfoque poco frecuente en adaptadores abiertos de seguridad visual.

Arquitectura transformer multimodal (Qwen3-VL) con torre de visión congelada y adaptadores LoRA de rango 16 en las proyecciones de atención y MLP del componente de lenguaje. El adaptador pesa 43,6 millones de parámetros entrenables sobre un total de 8.810 millones. La licencia es Apache 2.0 y los pesos se distribuyen sin fusionar, requiriendo el modelo base fijado a una revisión concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL con adaptador LoRA (PEFT); torre de visión congelada |
| Parametros totales | 8.810.770.672 (modelo base + adaptador) |
| Parametros activos | No aplica (no es MoE); 43.646.976 parámetros entrenables en el adaptador |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en BF16; el modelo base admite las cuantizaciones habituales de Qwen3-VL, no especificadas en la ficha) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa vídeo mediante un bloque único de ocho fotogramas previos al evento, a FPS 2,0, con un mínimo de 4.096 píxeles y un máximo de 262.144 píxeles por fotograma. El procesamiento usa `image_patch_size=16`, metadatos de vídeo de `qwen_vl_utils.process_vision_info` y `do_resize=False`. Los fotogramas posteriores al evento, los metadatos de resultado y las etiquetas de seguridad no se usan como entrada del modelo.

El entrenamiento se realizó con PPO y RLVR sobre el split `train` original del dataset SLOCBench/HumanoidSafe (294 pares, 588 ramas de instrucción segura y dañina), con 3 épocas, semilla 42, 1.764 presentaciones de prompt activas y 7.056 completaciones válidas muestreadas. Se ejecutaron 222 actualizaciones de rollout, dos pasadas de política por actualización y 444 pasos de optimizador. El lote fue de 8 prompts activos × 4 completaciones (excepto el lote final de cada época, de 4 prompts). El optimizador fue AdamW con tasa de aprendizaje 1e-05 constante, betas 0,9/0,999, epsilon 1e-8 y weight decay 0. La regularización incluyó clip range 0,2, KL de referencia con beta 0,02 y norma máxima de gradiente 1,0. El cómputo fue en BF16 con parámetros maestros y estado de Adam en FP32, distribuido con FSDP en 8 GPU.

El adaptador LoRA tiene rango 16, alpha 32, dropout 0 y bias `none`, aplicado únicamente al componente de lenguaje en `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`; la torre de visión permanece congelada. PPO usa un crítico escalar por token aprendido sobre el backbone compartido del actor, gamma 1, GAE lambda 0,95, coeficiente de pérdida de valor 0,5, value clip 0,2 y normalización de ventajas sobre tokens de respuesta válidos globales. La recompensa binaria de tarea es terminal y el KL de referencia entra en el modelado de recompensa por token, sin término KL adicional del actor. El verificador de reglas es el clasificador de frases de rechazo del repositorio y recibe solo la instrucción y la respuesta generada; las etiquetas de rama asignan la recompensa: rama dañina con rechazo = 1 y sin rechazo = 0; rama segura con rechazo = 0 y sin rechazo = 1.

## Capacidades

- Generación de texto y razonamiento multimodal sobre vídeo: describe escena y acción a partir de ocho fotogramas previos al evento.
- Clasificación de seguridad alineada: distingue instrucciones seguras de dañinas y emite rechazo en el segundo caso.
- Salida estructurada: produce una descripción breve seguida de una etiqueta final `<action>...</action>`.
- Procesamiento de vídeo con parámetros configurables de FPS, número de fotogramas y resolución por fotograma.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (visión, texto, conversación image-text-to-text), aunque el adaptador está especializado en la tarea HumanoidSafe.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking en la información disponible.

## Casos de uso

- Evaluación de seguridad en robótica humanoide: el adaptador permite clasificar si una instrucción dirigida a un humanoide en una escena filmada es segura o debe rechazarse, usando los ocho fotogramas previos al evento como contexto visual.
- Investigación en RLVR multimodal: sirve como baseline reproducible (experimento `ppo-rule-lora`) para comparar PPO con recompensa basada en reglas frente a otros algoritmos de RL en tareas de rechazo visual.
- Filtrado previo de instrucciones en pipelines de agentes visuales: dado un clip corto y una instrucción, el modelo emite una etiqueta `<action>` que puede usarse como señal de bloqueo antes de ejecutar la acción en un sistema mayor.
- Auditoría de datasets de seguridad visual: el modelo puede aplicarse sobre pares instrucción-vídeo para detectar ejemplos mal etiquetados o inconsistencias entre la rama segura y la dañina.
- Prototipado de asistentes visuales con política de rechazo: integrable en un servicio image-text-to-text que deba declinar peticiones peligrosas en entornos filmados.
- Estudio de alineación con presupuesto fijo: su configuración de entrenamiento (3 épocas, semilla 42, 444 pasos de optimizador) lo hace adecuado como referencia para reproducir experimentos de RLVR con recursos acotados.
- Docencia y experimentación con PEFT: al ser un adaptador LoRA de 0,1 GB sobre un base de 8B, permite estudiar el efecto del RL sobre un modelo multimodal sin reentrenar el backbone completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el modelo base Qwen3-VL-8B-Instruct debe cargarse por separado y domina los requisitos de memoria.
- VRAM estimada para inferencia en BF16: aproximadamente 16-18 GB para el modelo base de 8B más overhead de activaciones y procesamiento de vídeo; no confirmado en la ficha.
- Entrenamiento original: FSDP sobre 8 GPU con BF16 y estado de Adam en FP32, lo que implica GPUs de clase数据中心 (A100/H100) para reproducir el setup.
- No se especifican GPU concretas recomendadas para inferencia ni si cabe en GPU de consumo; con cuantización de 4 bits del base podría caber en GPUs de 12-16 GB, pero este dato no está disponible en la información proporcionada.
- Opciones de despliegue: carga mediante `transformers` + `peft` con `PeftModel` y `autocast_adapter_dtype=False`, `attn_implementation="sdpa"` y `device_map="auto"`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Configuración de generación por defecto: greedy, 256 tokens nuevos, caché habilitada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-PPO-Rule-LoRA | 8,81B (43,6M entrenables) | No disponible | Adaptador LoRA multimodal RLVR | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B | No disponible en esta ficha | Modelo multimodal instruct | No disponible en esta ficha | Hugging Face |
| Otros adaptadores del mismo informe (ocho baselines RLVR) | Sobre Qwen3-VL-8B | No disponible | Adaptadores LoRA con distintos algoritmos | No disponible | Repositorio del informe |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para la tarea HumanoidSafe (rechazo seguro/dañino sobre vídeo de humanoides); su comportamiento fuera de ese dominio no está caracterizado.
- Sesgos: el entrenamiento se limita a 294 pares del dataset SLOCBench/HumanoidSafe, lo que puede introducir sesgos de dominio, de escena y de redacción de instrucciones.
- Riesgo de alucinación: como modelo generativo multimodal, puede producir descripciones de escena inexactas; la etiqueta `<action>` depende de un clasificador de frases de rechazo, que puede fallar ante formulaciones no vistas.
- Idiomas: solo inglés y chino; no se garantiza comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene su propia licencia que debe verificarse por separado.
- Pesos sin fusionar: requiere el modelo base fijado a la revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`; no es un checkpoint autónomo.
- No incluye estado del optimizador, estado de reanudación de entrenamiento ni la cabeza de valor PPO (solo inferencia).
- Configuración de entrada estricta: ocho fotogramas previos al evento, FPS 2,0 y resolución entre 4.096 y 262.144 píxeles por fotograma; desviarse de estos parámetros puede degradar el rendimiento.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción.
- No se documentan benchmarks, por lo que no es posible validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-Rule-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines RLVR: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
