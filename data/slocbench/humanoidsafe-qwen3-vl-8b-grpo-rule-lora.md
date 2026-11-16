# SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-LoRA

## Resumen

HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-LoRA es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por SLOCBench. Se trata de un ajuste mediante aprendizaje por refuerzo con verificación programática (RLVR) usando GRPO (Group Relative Policy Optimization) y una recompensa basada en un clasificador de reglas de rechazo, orientado a mejorar el comportamiento de seguridad de un modelo visión-lenguaje en escenarios con humanoides.

El modelo resuelve un problema concreto: alinear las respuestas de un VLM de 8B parámetros ante instrucciones potencialmente peligrosas relacionadas con robótica humanoide, aprendiendo a rechazar peticiones dañinas y a aceptar las seguras. El adaptador se entrena sobre el split de entrenamiento del dataset HumanoidSafe (294 pares, 588 ramas de instrucción segura y dañina) con un presupuesto fijo de 3 épocas y semilla 42, y se publica como checkpoint de inferencia sin fusionar con los pesos base.

La relevancia actual radica en que ejemplifica el uso de RLVR con verificación determinista para seguridad en modelos multimodales, un área donde los enfoques de RLHF con preferencias humanas resultan costosos. El adaptador es pequeño (43,6 M de parámetros entrenables sobre 8,8 B totales), se distribuye con licencia Apache 2.0 y requiere el modelo base Qwen3-VL-8B-Instruct fijado a una revisión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3-VL) con adaptador LoRA PEFT |
| Parametros totales | 8.810.770.672 (modelo base); 43.646.976 entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en BF16; cuantizaciones del base no especificadas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen, vídeo y texto. El LoRA tiene rango 16, alpha 32, dropout 0 y bias `none`, y se inserta únicamente en las proyecciones de lenguaje (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`); la torre de visión permanece congelada. El entrenamiento usa GRPO con normalización de recompensas por grupo (desviación estándar poblacional, epsilon 1e-4), penalización KL de referencia con beta 0.02 y clip range 0.2, sobre 8 GPUs con FSDP, precisión BF16 y estados del optimizador en FP32.

El dataset es SLOCBench/HumanoidSafe (config `checked`, revisión `7952f2e8...`), con 294 pares y 588 ramas de instrucción segura/dañina. El presupuesto es de 3 épocas, semilla 42, 1.764 presentaciones de prompt activas y 7.056 completaciones muestreadas válidas, con 222 actualizaciones de rollout, dos pasadas de política por actualización y 444 pasos de optimizador. El batch es de 8 prompts activos por 4 completaciones (excepto la cola de cada época, con 4 prompts). El muestreo usa temperatura 1.0, top-p 1.0, top-k 0, sin penalización por repetición y máximo 256 tokens nuevos. El optimizador es AdamW con learning rate 1e-05 constante, betas 0.9/0.999, epsilon 1e-8 y weight decay 0. La recompensa es binaria y la asigna un clasificador de frases de rechazo del propio repositorio: rechazo = 1 en ramas dañinas, no rechazo = 1 en ramas seguras. Las respuestas vacías o fallos del verificador abortan la actualización en lugar de asignar recompensa fabricada.

## Capacidades

- Generación de texto conversacional multimodal (imagen-texto-a-texto) sobre el modelo base Qwen3-VL-8B-Instruct.
- Procesamiento de vídeo: la evaluación usa ocho fotogramas previos al evento como un único bloque de vídeo, FPS 2.0, entre 4.096 y 262.144 píxeles por fotograma.
- Razonamiento sobre escenas y acciones con salida estructurada: descripción breve de escena/acción seguida de una etiqueta final `<action>...</action>`.
- Comportamiento de rechazo alineado: aprende a rechazar instrucciones dañinas y a aceptar las seguras en el dominio de seguridad de humanoides.
- Soporte multilingüe limitado a inglés y chino.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito más allá de lo que herede del base.

## Casos de uso

- Filtrado de seguridad en robótica humanoide: el adaptador puede clasificar si una instrucción dirigida a un humanoide es segura o dañina y emitir una etiqueta `<action>` estructurada, integrándose en una capa de pre-validación antes de ejecutar comandos.
- Moderación de instrucciones en pipelines de vídeo: dado un bloque de ocho fotogramas previos a un evento, el modelo describe la escena y decide si la acción solicitada debe rechazarse, útil en sistemas de supervisión de robots colaborativos.
- Evaluación de alineación de VLMs: sirve como baseline RLVR reproducible (semilla 42, presupuesto fijo, sin selección de checkpoint guiada por test) para comparar contra otros siete baselines del informe de SLOCBench.
- Investigación en RLVR con recompensas programáticas: el adaptador y su configuración de entrenamiento documentada permiten reproducir experimentos de GRPO con verificadores deterministas en modelos multimodales.
- Generación de descripciones de escena con salida estructurada: el formato de descripción más etiqueta `<action>` facilita el parseo automático en sistemas downstream que necesitan decisiones binarias de aceptación/rechazo.
- Prototipado de asistentes de seguridad en entornos simulados: al ser un adaptador ligero (0,1 GB) sobre un base de 8B, permite iterar rápidamente en la capa de alineación sin reentrenar el modelo completo.

## Benchmarks y rendimiento

La información disponible describe la evaluación sobre el split `test` original de HumanoidSafe (70 pares retenidos, con ambas ramas de instrucción dañina/segura), pero no incluye los resultados numéricos de los benchmarks en el material proporcionado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB; requiere cargar el modelo base Qwen3-VL-8B-Instruct en BF16, lo que implica aproximadamente 16-17 GB de VRAM solo para pesos, más memoria para activaciones y caché KV.
- Para inferencia en BF16 se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A10G, L4 con cuantización) o superior; A100 40/80 GB y H100 para mayor throughput y contextos largos.
- El entrenamiento documentado usó FSDP sobre 8 GPUs con BF16 y estados del optimizador en FP32, lo que sugiere un entorno multi-GPU de gama alta (A100/H100).
- Despliegue: la carga documentada usa `transformers` con `Qwen3VLForConditionalGeneration`, `PeftModel` y `attn_implementation="sdpa"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador; al ser un adaptador PEFT sin fusionar, requeriría fusión previa para muchos servidores de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-LoRA | 8,8 B (43,6 M entrenables) | no disponible | LoRA + GRPO + recompensa por reglas | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,8 B | no disponible | VLM instruct sin alineación específica de seguridad humanoide | Apache 2.0 | Hugging Face |
| Otros baselines del informe SLOCBench | no disponible | no disponible | Variantes RLVR (GRPO, DPO, etc.) sobre el mismo base | no disponible | Repositorio GitHub de SLOCBench |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en el dominio de seguridad de humanoides; su comportamiento fuera de ese dominio puede degradarse respecto al base.
- La recompensa se basa en un clasificador de frases de rechazo, lo que puede generar comportamientos de rechazo estereotipados o sensibles a la formulación exacta de la instrucción.
- Solo soporta inglés y chino; no se garantiza comportamiento alineado en otros idiomas.
- El adaptador no está fusionado: requiere el base Qwen3-VL-8B-Instruct en la revisión exacta `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` y `autocast_adapter_dtype=False` para reproducir la inferencia BF16 registrada.
- No incluye estado del optimizador, estado de reanudación de entrenamiento ni la cabeza de valor PPO usada solo en entrenamiento; es únicamente un checkpoint de inferencia.
- Riesgo de alucinación inherente al modelo base no cuantificado en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del dataset HumanoidSafe y del modelo base para uso comercial en producción.
- El entrenamiento usó solo 294 pares y 3 épocas; el tamaño reducido del dataset limita la generalización y puede provocar sobreajuste a los patrones de rechazo del conjunto.

## Enlaces

- Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-Rule-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entradas: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
- Repositorio del proyecto: https://github.com/chrisyxue/eval_humanoid
