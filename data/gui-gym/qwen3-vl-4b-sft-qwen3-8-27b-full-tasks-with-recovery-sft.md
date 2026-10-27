# GUI-Gym/Qwen3-VL-4B-sft-qwen3.8-27b-full-tasks-with-recovery-sft

## Resumen

Qwen3-VL-4B MobileWeave Full-Tasks + Recovery SFT es un ajuste fino completo (no un adaptador LoRA) del modelo vision-lenguaje Qwen3-VL-4B-Instruct, publicado por el colectivo GUI-Gym. Su propósito no es el diálogo general, sino actuar como política de control de interfaces gráficas móviles: recibe una captura de pantalla del dispositivo junto con el historial de interacción y la instrucción de la tarea, y devuelve la siguiente acción GUI que debe ejecutarse en el entorno.

El modelo parte del checkpoint `sft-qwen3.8-27b-atomic_tasks_and_all_hybrid_tasks/checkpoint-1512`, un SFT previo sobre tareas atómicas e híbridas, y añade una fase de "recovery SFT": se recopilaron trayectorias en las que un profesor (GPT-6.1-Sol) intervenía cuando la política entraba en bucles visuales o ciclos cerrados, y solo se etiquetaron las recuperaciones verificadas como exitosas. El resultado es un modelo de 4.437.815.808 parámetros (4,44 B) que reduce de forma notable la repetición de acciones estériles en el benchmark MobileWeave.

Es relevante ahora porque ataca uno de los fallos crónicos de los agentes GUI: la stagnación visual, es decir, repetir la misma acción sobre una pantalla que no cambia. Con un coste de entrenamiento muy bajo (200 actualizaciones del optimizador) y un tamaño que cabe en una sola GPU de 24 GB en BF16, el modelo mejora la tasa de éxito de su predecesor en +1,38 puntos porcentuales y recorta los bucles de ≥5 acciones repetidas del 21,00 % al 6,54 %. La licencia no está declarada en la información disponible, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer densa de la familia Qwen3-VL (torre de visión + proyector multimodal + modelo de lenguaje); detalles de capas y dimensiones no disponibles |
| Parámetros totales | 4.437.815.808 (4,44 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima configurada en entrenamiento y evaluación con la plantilla `qwen3_vl_nothink`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors en BF16, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no declara cobertura lingüística) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Checkpoint de partida del ajuste | `sft-qwen3.8-27b-atomic_tasks_and_all_hybrid_tasks/checkpoint-1512` |
| Componentes entrenados | Modelo de lenguaje completo; torre de visión y proyector multimodal congelados |
| Tamaño del repositorio | 9,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen3-VL-4B-Instruct: un transformer denso multimodal que proyecta las imágenes (capturas de pantalla) a un espacio compartido con el modelo de lenguaje. En este ajuste solo se actualiza el modelo de lenguaje; la torre de visión y el proyector multimodal permanecen congelados, de modo que la adaptación se produce en la capa de razonamiento y en la política de decisión sobre tokens de acción, no en la representación visual. El entrenamiento usa BF16 con DeepSpeed ZeRO-2, FlashAttention 2 y gradient checkpointing, sobre 2 GPUs con batch efectivo de 16 (2 × 1 × 8 acumulaciones), optimizador Fused AdamW, learning rate 2e-6, schedule coseno con 6 pasos de warmup, semilla 42 y supervisión únicamente sobre la respuesta del asistente. Se ejecutaron 200 actualizaciones del optimizador, que exponen 3.200 instancias de muestra y no el pool completo. El stack utilizado fue Transformers 4.57.6 y LlamaFactory 0.9.5.

La innovación está en los datos. La política padre se ejecutó sobre 382 instancias de tareas Atomic/Hybrid2 con un presupuesto de 40 pasos y un máximo de tres intervenciones del profesor GPT-6.1-Sol, que solo veía la captura actual y el historial de interacción visible, sin estado oculto del entorno ni respuestas de referencia. Solo las trayectorias de recuperación verificadas como exitosas aportaron etiquetas: 30 trayectorias generaron 296 etiquetas únicas (37 respuestas del profesor y 259 respuestas de sufijo de la propia política). El pool final tiene 21.488 filas: 16.116 instancias de datos originales, 2.686 del profesor y 2.686 de sufijo de política, con una mezcla 75 % original / 25 % recuperación y reparto 50/50 entre profesor y sufijo dentro de la recuperación (semilla 42). Se conservan las 16.114 muestras originales y las 296 de recuperación; dos muestras originales se repiten para cuadrar la mezcla entera. La recolección de recuperación cubre Atomic/Hybrid2, mientras que el replay original incluye las tres categorías de tarea.

## Capacidades

- Generación de acciones GUI a partir de capturas de pantalla: el modelo emite comandos de interacción (toques, deslizamientos, texto) que el entorno ejecuta.
- Razonamiento multi-paso sobre historial de interacción: mantiene la tarea y las acciones previas dentro de una ventana de hasta 32.768 tokens.
- Recuperación ante stagnación visual: política entrenada explícitamente para romper secuencias de acciones equivalentes con pantallas sin cambios.
- Comprensión de imagen-texto: al estar construido sobre Qwen3-VL-4B-Instruct, hereda la capacidad de interpretar capturas y texto en pantalla, aunque la torre de visión está congelada.
- Integración con tool calling / ejecución en entorno: la model card indica que debe suministrarse el prompt de sistema y de herramientas de MobileWeave y ejecutar las acciones devueltas; el formato concreto de llamada a herramientas no se detalla.
- Operación en modo no-thinking: la plantilla de entrenamiento es `qwen3_vl_nothink`, por lo que la política está optimizada para respuestas directas sin cadena de pensamiento expuesta.
- Capacidades multilingües: no disponibles como dato declarado; no se especifica cobertura de idiomas.
- Capacidades especiales: no se declaran visión más allá de capturas de pantalla, audio ni otras modalidades.

## Casos de uso

- Automatización de pruebas de regresión en Android: el modelo actúa como agente que recorre una app siguiendo un guion, y su entrenamiento anti-bucle reduce el riesgo de que un test se quede colgado repitiendo el mismo toque sobre una pantalla estática.
- RPA móvil para tareas repetitivas de back office: rellenar formularios, consultar estados o extraer datos de pantallas en flujos de varios pasos, con la ventana de 32.768 tokens permitiendo arrastrar el historial completo de la sesión.
- Agente de soporte de primera línea en movilidad: dado un objetivo en lenguaje natural y la captura actual, propone la secuencia de acciones para llegar a la pantalla de ajuste o al menú solicitado, útil en asistentes de accesibilidad.
- Minería de trayectorias y generación de datos de entrenamiento: al ser una política con recuperación incorporada, sirve para producir rollouts más limpios que un agente base, reduciendo la proporción de episodios fallidos que hay que descartar.
- Evaluación comparativa de agentes GUI: el propio repositorio incluye el protocolo (`run_eval_multi_seeds.sh`, semillas 0-7, 256 tareas por ejecución, temperatura 0, máximo 40 pasos), reutilizable como línea base reproducible frente a otros modelos.
- Despliegue en laboratorio con presupuesto de GPU limitado: 4,44 B parámetros en BF16 permiten servirlo con vLLM en una GPU de 24 GB para contextos moderados, lo que facilita iterar sobre políticas GUI sin infraestructura de gran escala.
- Investigación sobre mitigación de bucles en agentes: la métrica de stagnación visual (≥3 y ≥5 acciones equivalentes con pantallas idénticas) es un objetivo medible y el modelo sirve como punto de partida para estudiar técnicas de recuperación.

## Benchmarks y rendimiento

Evaluación sobre el benchmark MobileGym/MobileWeave con el script `run_eval_multi_seeds.sh`, semillas 0-7, 256 tareas por ejecución, máximo 40 pasos, temperatura 0 y sin intervenciones del profesor. SR = éxitos divididos entre episodios sin error. El modelo se sirvió con vLLM en 8 GPUs (DP8), longitud máxima 32.768, máximo 256 secuencias y utilización de memoria de GPU 0,95. Los resultados del padre son evaluaciones guardadas previamente, no reejecutadas.

| Ejecución | SR padre | SR con recuperación | Diferencia (pp) |
|---|---:|---:|---:|
| 0 | 35,18 % | 37,45 % | +2,27 |
| 1 | 41,41 % | 39,76 % | -1,64 |
| 2 | 39,04 % | 40,78 % | +1,74 |
| 3 | 38,34 % | 40,87 % | +2,53 |
| 4 | 38,82 % | 39,29 % | +0,46 |
| 5 | 37,40 % | 41,96 % | +4,56 |
| 6 | 39,76 % | 41,18 % | +1,41 |
| 7 | 38,82 % | 38,49 % | -0,33 |
| Global | 38,60 % | 39,98 % | +1,38 |

Los éxitos pasan de 784 a 810 y los errores de 17 a 22. Contabilizando los errores como fallos, el SR iría de 38,28 % a 39,55 % (+1,27 pp).

Bucles visuales repetidos (k acciones equivalentes consecutivas con capturas pre/post sin cambios; denominador de 2.048 episodios en ambos modelos, errores incluidos):

| Métrica | Padre | Recuperación | Diferencia (pp) |
|---|---:|---:|---:|
| Bucle ≥3 | 698/2048 (34,08 %) | 472/2048 (23,05 %) | -11,04 |
| Bucle ≥5 | 430/2048 (21,00 %) | 134/2048 (6,54 %) | -14,45 |

Ambas tasas bajan en las ocho ejecuciones, y la dirección se mantiene al restringir a los 2.012 episodios emparejados sin error en ninguno de los dos lados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 4,44 B parámetros implican aproximadamente 8,9 GB de pesos; el repositorio completo ocupa 9,7 GB.
- VRAM estimada para inferencia: en BF16, alrededor de 10-12 GB con contexto corto; con la ventana completa de 32.768 tokens y varias imágenes por episodio, el consumo de caché KV y de tokens visuales puede elevar el requisito muy por encima de 24 GB. El desglose exacto de capas y cabezas KV no está disponible en la información proporcionada.
- GPU recomendadas: para evaluación a escala, el autor empleó 8 GPUs con vLLM en paralelismo de datos (DP8). Para inferencia individual, una A100 40/80 GB o H100 permiten trabajar con la longitud máxima de 32.768; una RTX 4090 (24 GB) es viable en BF16 con contextos reducidos.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con contexto moderado y una sola imagen por paso; en tarjetas de 16 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: vLLM (configuración validada por el autor: longitud máxima 32.768, máximo 256 secuencias, utilización de memoria 0,95), transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (`dtype="auto"`, `device_map="auto"`). No se publican artefactos GGUF para llama.cpp ni Ollama, por lo que su uso exigiría conversión propia.
- Latencia y throughput: no disponibles. La evaluación usa temperatura 0 y hasta 40 pasos por episodio, pero no se reportan tiempos por paso ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SR en MobileWeave | Bucles ≥5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Recovery SFT) | 4,44 B | 32.768 tokens | 39,98 % | 6,54 % | No disponible | Pesos safetensors en HuggingFace |
| Checkpoint padre `checkpoint-1512` (Atomic + Hybrid2 + Hybrid3/4 SFT) | 4,44 B (misma base) | 32.768 tokens | 38,60 % | 21,00 % | No disponible | Referenciado en la model card, no enlazado |
| Qwen/Qwen3-VL-4B-Instruct | 4,44 B (aproximado, misma familia) | No disponible | No evaluado en la información disponible | No evaluado | No disponible en esta información | Público en HuggingFace |

No se dispone de datos de otros agentes GUI comparables (por ejemplo, políticas específicas para Android) en la información proporcionada, por lo que la comparación se limita a la línea heredada del propio modelo.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Los resultados son observaciones sobre el benchmark MobileWeave con un protocolo concreto (semillas 0-7, 256 tareas, temperatura 0) y el autor no reclama significación estadística ni transferencia validada a otros benchmarks de Android.
- La mejora global es modesta (+1,38 pp) y no es homogénea: dos de las ocho ejecuciones empeoran (-1,64 y -0,33 pp), y los errores suben de 17 a 22 episodios.
- La stagnación visual es un proxy de falta de progreso: una acción final sin captura posterior guardada no puede clasificarse como estancada, lo que puede infravalorar el fenómeno.
- Riesgo de alucinación de acciones: al ser una política que emite comandos ejecutables, una acción incorrecta puede modificar estado real en el dispositivo; se recomienda sandbox y límite de pasos.
- La recolección de recuperación cubre solo tareas Atomic/Hybrid2, mientras que el replay original cubre tres categorías; el equilibrio entre categorías puede no ser óptimo para tareas híbridas 3/4.
- Solo se entrenó el modelo de lenguaje: la torre de visión y el proyector están congelados, de modo que errores de percepción visual del modelo base no se corrigen con este ajuste.
- El modelo está entrenado con la plantilla `qwen3_vl_nothink`; usarlo con otras plantillas o añadiendo razonamiento explícito puede degradar el comportamiento esperado.
- Cobertura lingüística no declarada: no hay garantía de buen rendimiento en instrucciones en castellano u otros idiomas distintos del usado en los datos de entrenamiento.
- Requiere el prompt de sistema y de herramientas de MobileWeave y un entorno de ejecución compatible; los resultados no son reproducibles sin ese protocolo.
- El entrenamiento expuso 3.200 instancias de muestra en 200 actualizaciones, no el pool completo de 21.488 filas: el número real de épocas sobre los datos es bajo y el ajuste es conservador.
- Sesgos conocidos: no se documenta ningún análisis de sesgos demográficos, de idioma o de tipo de aplicación en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GUI-Gym/Qwen3-VL-4B-sft-qwen3.8-27b-full-tasks-with-recovery-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Configuración de entrenamiento: `sft_config.yaml` (en el repositorio del modelo)
- Configuración de DeepSpeed: `ds_z2.json` (en el repositorio del modelo)
- Receta de datos: `data_recipe.json` (en el repositorio del modelo)
- Resultados de evaluación detallados: `evaluation_results.json` (en el repositorio del modelo)
- Hashes de los ficheros de inferencia: `WEIGHTS_SHA256.json` (en el repositorio del modelo)
- Checkpoint de partida: `sft-qwen3.8-27b-atomic_tasks_and_all_hybrid_tasks/checkpoint-1512` (referenciado en la model card, sin URL pública en la información disponible)
- Paper, blog o demo adicionales: no disponibles; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre la planta del muérdago y sobre el concepto genérico de interfaz gráfica).
