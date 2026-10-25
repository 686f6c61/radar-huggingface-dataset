# game-plus/qwen3.5-4b-gameworld-sft-teacheronly-final

## Resumen

`game-plus/qwen3.5-4b-gameworld-sft-teacheronly-final` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base multimodal `Qwen/Qwen3.5-4B`, publicado por el usuario `game-plus`. El modelo está especializado en actuar como agente de videojuegos: recibe un prompt de sistema, un turno de usuario y hasta siete capturas de pantalla del juego, y devuelve un bloque `<think>` (vacío en los datos de entrenamiento) seguido de una llamada a herramienta `<tool_call>` con la acción a ejecutar.

La particularidad de esta versión es que se entrenó exclusivamente con datos generados por cuatro modelos maestros (`claude-haiku-5.5`, `gpt-6-luna`, `deepseek-v4.1-flash` y `minimax-m3.1-flash`), sin rollouts de política propia. Se trata, por tanto, de la contraparte de ablación de `game-plus/qwen3.5-4b-gameworld-sft-final`, que emplea cinco fuentes. El conjunto de entrenamiento consta de 191.510 filas y aproximadamente 1.380 millones de tokens, con muestras de hasta 25.000 tokens.

Con 4.539.265.536 parámetros totales (incluido el codificador visual, que permaneció congelado durante el entrenamiento), pesos en bf16 y licencia Apache 2.0, el modelo es relevante como pieza de investigación para estudiar la destilación de comportamiento de agentes de juego a partir de profesores propietarios, y como base práctica para prototipos de automatización de interfaz gráfica en entornos lúdicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5 + codificador visual y alineador; el codificador visual y el alineador permanecen congelados) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; las muestras de entrenamiento alcanzan 25.000 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos bf16; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 3 shards (~9,3 GB); repositorio completo de 10,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer multimodal con torre de visión, y aplica un ajuste fino de parámetros completos únicamente sobre el modelo de lenguaje: el codificador visual y el alineador se mantienen congelados. Cada muestra de entrenamiento se compone de un prompt de sistema, un turno de usuario con hasta siete capturas de pantalla (con un máximo de 1.024 tokens de imagen por captura) y una respuesta del asistente formada por `<think>\n\n</think>` seguido de una acción `<tool_call>`; se entrena el mensaje completo del asistente.

Los datos provienen exclusivamente de cuatro profesores (`claude-haiku-5.5`, `gpt-6-luna`, `deepseek-v4.1-flash`, `minimax-m3.1-flash`): 191.510 filas, ~1.380 millones de tokens y un máximo de 25.000 tokens por muestra. La configuración es AdamW con lr 1e-5 y decaimiento coseno, warmup del 3 %, batch por dispositivo 2 con acumulación 3, lo que da 48 secuencias empaquetadas de 25K tokens por paso (≈1,18 M tokens/paso, ~160 muestras). Una época equivale a 1.160 pasos. Se usó BF16, DeepSpeed ZeRO-2, empaquetado de secuencias, kernel Liger, flash-attention 2 y checkpointing de gradientes sobre 1 nodo de 8×H100 80 GB, con un tiempo de pared de 4,7 horas. El stack fue ms-swift 4.5.3, transformers 5.16.1 y DeepSpeed 0.19.8. La pérdida final de entrenamiento fue 0,794 (media móvil de la época).

## Capacidades

- Comprensión de capturas de pantalla de videojuegos: procesa hasta siete imágenes por turno, cada una tokenizada a un máximo de 1.024 tokens visuales.
- Generación de acciones estructuradas mediante `<tool_call>`, pensadas para ser ejecutadas por un entorno de juego.
- Razonamiento explícito mediante un bloque `<think>`; en este conjunto de datos el bloque aparece vacío, por lo que el modelo no fue entrenado para producir cadenas de razonamiento largas.
- Conversación multi-turno con plantilla de chat (etiqueta `conversational`), usando el `apply_chat_template` del procesador.
- Seguimiento de instrucciones condicionadas por el prompt de sistema (el prompt de sistema no se distribuye en el repositorio).
- Capacidad multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- Soporte de inferencia con ms-swift mediante `--template qwen3_5`, y compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de audio, vídeo ni tool calling genérico fuera del formato de acción de juego.

## Casos de uso

- Agentes de juego automatizados: el modelo consume una secuencia de capturas del estado del juego y emite la siguiente acción en formato `<tool_call>`, lo que permite cerrar el bucle percepción-acción sin ingeniería de prompt adicional. Es el caso de uso para el que fue entrenado.
- Automatización de interfaces gráficas: al estar entrenado con pantallazos y acciones estructuradas, puede reutilizarse en tareas de clic/formulario sobre aplicaciones de escritorio o web, aunque requerirá validación porque el dominio de entrenamiento es lúdico.
- Generación de datos sintéticos de trayectorias: sirve como política generadora para producir rollouts etiquetados (captura → acción) que alimenten posteriores iteraciones de SFT o de aprendizaje por refuerzo.
- Evaluación comparativa de destilación: su condición de ablación (solo profesores, sin rollouts) permite medir cuánto aporta cada fuente de datos frente a la variante de cinco fuentes.
- Investigación sobre imitación de modelos propietarios: útil para estudiar la fidelidad de la destilación de acciones desde cuatro profesores distintos y el efecto de mezclar sus distribuciones.
- Prototipado de asistentes con contexto visual: con 25.000 tokens por muestra en entrenamiento, puede manejar historiales largos de capturas para tareas de resumen o descripción de estado del juego.
- Pruebas de regresión de entornos de juego: integrado en un arnés de evaluación, permite detectar cambios de comportamiento del agente tras modificaciones en el entorno o en la tokenización de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato numérico reportado por el autor es la pérdida de entrenamiento final: 0,794 (media móvil de la época, 1.160 pasos). No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de agentes de juego, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para los pesos: ~9,1 GB en bf16 (4,54 B parámetros × 2 bytes; el repositorio ocupa 9,3 GB en tres shards).
- VRAM estimada para inferencia con contexto corto (una imagen, 256 tokens de salida): del orden de 10-12 GB, incluyendo caché KV y activaciones. Estimación derivada del recuento de parámetros, no dato publicado por el autor.
- VRAM estimada con el escenario de entrenamiento (siete imágenes de hasta 1.024 tokens cada una y contextos de hasta 25K tokens): 16-24 GB o más, dominado por la caché KV. Estimación, no dato oficial.
- GPU de referencia para entrenamiento: 8×H100 80 GB en un solo nodo (4,7 h para una época).
- GPU recomendadas para inferencia: A100 40/80 GB, H100 80 GB, L40S 48 GB. En consumer, RTX 4090 o RTX 3090 (24 GB) permiten inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bf16; en 16 GB requiere cuantización de 8 bits (bitsandbytes) o una conversión a GGUF Q4 (el modelo resultante rondaría 2,7-3 GB), conversión que no está publicada y que debe incluir el proyector visual.
- Opciones de despliegue: `transformers` con `AutoProcessor` + `AutoModelForImageTextToText` (ejemplo oficial en la model card), ms-swift 4.5.3 con `swift infer --model ... --template qwen3_5 --use_hf true`, y servidores compatibles con la arquitectura `qwen3_5` (vLLM o TGI solo si su versión soporta dicha arquitectura). llama.cpp requeriría conversión manual y soporte del codificador visual.
- Ajuste obligatorio en inferencia: fijar `IMAGE_MAX_TOKEN_NUM=1024` (o el `max_pixels` equivalente) para que las capturas se tokenicen igual que en entrenamiento.
- Latencia y throughput de inferencia: no disponibles. Como referencia del coste de cómputo durante el entrenamiento, el autor reporta ~1,18 M tokens por paso y 1.160 pasos en 4,7 h sobre 8×H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `game-plus/qwen3.5-4b-gameworld-sft-teacheronly-final` | 4,54 B | no disponible (muestras de hasta 25K tokens) | 4 profesores, 191.510 filas, ~1,38 B tokens, 1 época | Apache 2.0 | HuggingFace, 0 descargas |
| `game-plus/qwen3.5-4b-gameworld-sft-final` | no disponible (mismo base, 4B) | no disponible | 5 fuentes (incluye rollouts de política), tamaño no disponible | no disponible en la información | HuggingFace |
| `Qwen/Qwen3.5-4B` (base) | no disponible en la información (el ajuste tiene 4,54 B totales) | no disponible | no disponible | no disponible en la información | HuggingFace |
| Otros agentes de juego open source de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al entrenarse sobre salidas de cuatro modelos propietarios, hereda los sesgos y el estilo de decisión de esos profesores.
- Riesgo de alucinación: el modelo genera acciones en formato `<tool_call>` sin verificación de estado; puede emitir acciones inválidas o referidas a elementos de la interfaz que no existen en la captura.
- El bloque `<think>` está vacío en todos los datos de entrenamiento: no debe esperarse razonamiento explícito, aunque la plantilla lo incluya.
- El codificador visual y el alineador están congelados: la calidad perceptiva queda limitada a la del modelo base y no se ha adaptado al dominio.
- Dependencia estricta de la tokenización de imagen: usar un `IMAGE_MAX_TOKEN_NUM` distinto de 1024 provoca un desplazamiento de distribución respecto al entrenamiento.
- Límite práctico de siete capturas por turno y de 25.000 tokens por muestra; no se documenta la longitud de contexto efectiva del modelo.
- Idiomas soportados no declarados; no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del de los datos de los profesores.
- Entrenamiento de una sola época sobre datos exclusivamente de profesores, sin RLHF ni DPO: no hay alineación posterior ni filtrado por preferencias.
- Licencia Apache 2.0 sobre los pesos, pero los datos de destilación provienen de modelos de terceros cuyos términos de uso pueden imponer restricciones adicionales al uso comercial del modelo derivado; conviene revisarlos antes de producción.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni informes de terceros.
- No se distribuye el prompt de sistema utilizado en entrenamiento, lo que dificulta reproducir exactamente las condiciones de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/game-plus/qwen3.5-4b-gameworld-sft-teacheronly-final
- Variante de ablación con las cinco fuentes: https://huggingface.co/game-plus/qwen3.5-4b-gameworld-sft-final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- ms-swift (framework de entrenamiento e inferencia): https://github.com/modelscope/ms-swift
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes (los resultados devueltos corresponden a portales de juegos en línea: poki.com, crazygames.com, onlinegames.io).
