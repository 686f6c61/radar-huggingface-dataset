# happyhappy-jun/qwen3-vl-4b-uvd-racer-hl6k

## Resumen

`happyhappy-jun/qwen3-vl-4b-uvd-racer-hl6k` es un ajuste fino supervisado (SFT) del modelo vision-language `Qwen/Qwen3-VL-4B-Instruct` de Alibaba Cloud, publicado por el usuario happyhappy-jun como parte de la campaña UVD-RACER sobre el simulador RoboCasa365. Ocupa la etapa de "política de alto nivel" (high-level, HL) de un pipeline jerárquico: recibe la observación visual del robot junto con un prompt de tarea y emite lenguaje a nivel de subtarea, que a su vez condiciona una política de bajo nivel (GR00T N1.6) publicada por separado.

El checkpoint corresponde al paso 6.000 de optimización del experimento `hl` (`20260911_mt80k_ft60k_a100_hl`), ejecutado en 4 GPU A100. Solo se actualizó el modelo de lenguaje: la torre de visión y el proyector multimodal permanecen congelados respecto al modelo base. El resultado es un modelo de aproximadamente 4.830 millones de parámetros, con un único fichero `model.safetensors` en bf16 de 9,7 GB, licencia Apache-2.0 y soporte directo en `transformers` mediante `AutoModelForImageTextToText`.

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni una release oficial de Qwen, sino un artefacto de investigación reproducible que documenta con precisión (manifiesto de publicación, checksums SHA-256, configuración de entrenamiento completa) cómo convertir un VLM genérico de 4B en un generador de subtareas para manipulación robótica. El propio autor advierte que no se realizó ninguna evaluación de éxito de tarea, precisión o seguridad tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (tipo `qwen3_vl`); torre de visión con patch size 16, merge size 2 y temporal patch size 2 |
| Parametros totales | 4.826.771.968 (≈4,83 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia usada en el entrenamiento, `--model_max_length 8192`); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | No se publican pesos cuantizados; solo bf16 en safetensors (convertibles a GGUF/AWQ por el usuario, no verificados por el autor) |
| Idiomas soportados | No disponible (sin evaluación ni declaración de idiomas; los datos de entrenamiento son conversaciones de subtareas en el dominio RoboCasa365) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (fichero único sin sharding, bf16) + `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-VL-4B-Instruct` (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`), un transformer vision-language con pipeline `image-text-to-text`. El procesador incluido en el repositorio es un `Qwen3VLProcessor` con ajustes de `Qwen2VLImageProcessor`: patch size 16, merge size 2, temporal patch size 2, media/desviación estándar de 0,5, y procesador de vídeo con fps 2 y muestreo de fotogramas activado. El presupuesto visual durante el entrenamiento se fijó en `--min_pixels 50176 --max_pixels 115200`. No se modificó ningún ajuste de preprocesado respecto al modelo base.

El ajuste fino se realizó con SFT sobre el dataset de conversación `uvd_mtft` de la campaña UVD-RACER (`--data_flatten True`), durante 6.000 pasos de optimizador (`--num_train_epochs 15 --max_steps 6000`). La configuración concreta: batch efectivo 128 (16 por dispositivo × acumulación de gradiente 2 × 4 GPU), learning rate 6e-5 con schedule coseno y warmup del 5 %, weight decay 0, `max_grad_norm 1`, optimizador `adamw_torch` en bf16, seed 42 y DeepSpeed ZeRO etapa 2 con gradient checkpointing. Lo más destacable desde el punto de vista técnico es que solo se entrenó el LLM (`--tune_mm_llm True`), quedando congelados la torre de visión y el proyector multimodal (`--tune_mm_vision False --tune_mm_mlp False`). El repositorio no incluye shards de optimizador, estado del scheduler/RNG, `trainer_state.json`, `training_args.bin` ni los datos de entrenamiento: es un export de inferencia, no un bundle reanudable. Los ficheros publicados son copias byte a byte del checkpoint `checkpoint-6000`, a excepción de `processor_config.json`, tomado del export `save_model` del mismo paso para permitir que `AutoProcessor.from_pretrained` funcione.

## Capacidades

- Generación de lenguaje a partir de entrada multimodal imagen-texto: consume la observación visual del robot más un prompt de tarea y produce texto.
- Generación de subtareas en lenguaje (subtask-level language) como política de alto nivel que condiciona una política de bajo nivel separada (GR00T N1.6).
- Comprensión de imágenes con presupuesto de píxeles controlado (entre 50.176 y 115.200 píxeles) en el régimen de entrenamiento.
- Capacidad conversacional heredada del modelo base (el repositorio incluye `chat_template.jinja`).
- Soporte de procesamiento de vídeo a través del procesador (fps 2, muestreo de fotogramas), heredado del base.
- Tool calling / function calling: no documentado en la información proporcionada.
- Modo de razonamiento explícito (thinking), audio o cualquier capacidad especial adicional: no disponible en la información proporcionada.

## Casos de uso

- Descomposición de tareas de manipulación robótica en subtareas: el modelo recibe una instrucción de alto nivel ("recoge el objeto y colócalo en el cajón") junto con el fotograma actual y emite la subtarea inmediata en lenguaje, que alimenta a la política de bajo nivel. Es el uso para el que fue entrenado explícitamente.
- Evaluación de políticas jerárquicas HL/LL en simulación: al ser un componente reproducible con checksums publicados, permite reproducir experimentos del pipeline UVD-RACER y comparar variantes de la etapa de alto nivel sin reentrenar el resto.
- Generación de datos etiquetados para aprendizaje por imitación: las subtareas generadas pueden usarse como anotaciones intermedias para entrenar o afinar políticas de bajo nivel en RoboCasa365.
- Investigación en planificación visual de tareas: sirve como banco de pruebas para estudiar cómo un VLM de ~4,8 B traduce observación visual y objetivo en lenguaje estructurado de acción.
- Prototipado de asistentes visuales de dominio acotado: en entornos donde se necesita describir el siguiente paso de una tarea a partir de una imagen, siempre que el dominio se parezca al de los datos de entrenamiento.
- Fine-tuning posterior sobre dominios robóticos propios: el repositorio es autocontenido (modelo, tokenizador y procesador cargan directamente) y Apache-2.0, por lo que puede servir como punto de partida para SFT adicional con datos propios.
- Comparación de estrategias de congelación: al documentar que solo se entrenó el LLM con visión y proyector congelados, es un caso de referencia útil para estudiar el coste/beneficio de no tocar la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la verificación de la subida cubre identidad de checksums de origen, cabecera de safetensors y cobertura de offsets de tensores, y que **no** constituye una evaluación nueva de inferencia en GPU ni un rollout robótico. No se formula ninguna afirmación de éxito de tarea, precisión o rendimiento de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,7 GB solo de pesos en bf16; con caché KV y overhead, del orden de 11-13 GB en bf16 para contextos moderados. En int8, alrededor de 5-6 GB; en int4, alrededor de 3-4 GB. Son estimaciones derivadas del recuento real de parámetros (4,83 B), no medidas publicadas por el autor.
- GPU recomendadas: A100 40/80 GB para entrenamiento o servicio de alta concurrencia (el entrenamiento se hizo en 4 × A100); H100 para despliegue a gran escala; RTX 4090 (24 GB) para inferencia bf16 en local.
- Compatibilidad con GPU de consumo: sí. RTX 4090 y RTX 3090 (24 GB) ejecutan el modelo en bf16 sin problemas; RTX 4080/4070 Ti (16 GB) en bf16 con contexto reducido; tarjetas de 12 GB en int8; tarjetas de 8 GB en int4 (requiere conversión propia).
- Opciones de despliegue: `transformers` con `AutoProcessor` y `AutoModelForImageTextToText` (flujo documentado por el autor); vLLM, TGI o llama.cpp/Ollama son viables en principio, pero no están validados ni mencionados en la model card, y el despliegue en llama.cpp/Ollama exigiría convertir el safetensors a GGUF.
- Latencia y throughput: no disponible. El autor no publica ninguna medición de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| `happyhappy-jun/qwen3-vl-4b-uvd-racer-hl6k` | ≈4,83 B | 8.192 tokens en entrenamiento | Apache-2.0 | Ajuste fino de dominio para política de alto nivel en RoboCasa365 |
| `Qwen/Qwen3-VL-4B-Instruct` | ≈4,83 B (misma base) | No disponible en la información proporcionada | Apache-2.0 | Modelo base; versión generalista, sin especialización en subtareas robóticas |
| Política de bajo nivel GR00T N1.6 (UVD-RACER) | No disponible | No disponible | No disponible | Componente complementario, no alternativo: consume la salida de subtareas de este modelo |
| Otros VLM de ~3-4 B (Qwen2.5-VL, InternVL, SmolVLM, etc.) | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

La única comparación con datos confirmados es contra el propio modelo base: comparten arquitectura, recuento de parámetros y licencia, y la diferencia es que este checkpoint ha sido ajustado 6.000 pasos sobre el dataset `uvd_mtft` con la torre de visión congelada. No hay ninguna métrica publicada que permita afirmar una mejora cuantitativa frente al base.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se realizó ninguna prueba de éxito de tarea, precisión ni seguridad tras el ajuste. No debe asumirse ninguna capacidad superior al modelo base en tareas generales.
- Riesgo de alucinación: el autor advierte que las salidas son lenguaje generado y no están garantizadas como correctas o seguras.
- Sesgos conocidos: no documentados en la información proporcionada; el modelo hereda los del base `Qwen/Qwen3-VL-4B-Instruct`, no evaluados aquí.
- Dominio muy restringido: el entrenamiento se limita al dataset de conversación `uvd_mtft` de la campaña UVD-RACER, orientado a subtareas de manipulación en RoboCasa365. Es previsible un rendimiento pobre fuera de ese dominio o en tareas de propósito general.
- Idiomas: no se declara ni se evalúa el soporte multilingüe.
- Contexto: la longitud de secuencia usada en entrenamiento es de 8.192 tokens; no hay confirmación del contexto nativo soportado en inferencia.
- Visión congelada: al no haberse ajustado la torre de visión ni el proyector, la representación visual es exactamente la del modelo base y no se adaptó a las particularidades del dominio robótico.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor exige atribución al equipo Qwen (Alibaba Cloud) y aclara que es una obra derivada independiente no respaldada por el equipo Qwen.
- Despliegue físico: la model card pide validar en simulación y aplicar controles de seguridad robóticos antes de cualquier uso en hardware real.
- Reproducibilidad limitada: no se publican datos de entrenamiento, estado del optimizador ni logs; la reproducibilidad se apoya únicamente en los checksums del manifiesto de publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyhappy-jun/qwen3-vl-4b-uvd-racer-hl6k
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Manifiesto de publicación con tamaños y SHA-256: `publication_manifest.json` (dentro del repositorio)
- Paper, blog o repositorio de la campaña UVD-RACER: no disponible en la información proporcionada
- Repositorio de la política de bajo nivel GR00T N1.6: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
