# johanna09/qwen38-27b-cybertruck-rally-full

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo Qwen3.8-27B, desarrollado por johanna09, que entrena al modelo base para generar un juego completo de rally con un Tesla Cybertruck como un único archivo HTML autocontenido. El adaptador es un experimento de post-entrenamiento deliberadamente estrecho: se entrenó exclusivamente con 120 ejemplos de juegos HTML verificados, sin mezclar datos de instrucción general, para demostrar que un fine-tuning muy específico no provoca necesariamente olvido catastrófico.

El modelo base es Qwen3.8-27B, un transformer de 27.516 millones de parámetros con capas de atención lineal (Gated DeltaNet) desarrollado por Alibaba, con licencia Apache 2.0. El adaptador solo entrena 159 millones de parámetros (0,58 % del total) mediante LoRA con rango 32, y consigue una pérdida final de 0,00424 tras 90 pasos de optimización. La relevancia de este proyecto radica en que documenta de forma medible los efectos secundarios del fine-tuning estrecho, incluyendo la aparición de un "estilo propio" en la salida del modelo, y proporciona una configuración de despliegue verificada para servir modelos con capas de atención lineal en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (transformer con capas de atención lineal Gated DeltaNet) |
| Parametros totales | 27.516.112.112 (base) + 159.383.552 (adaptador) |
| Parametros activos | 159.383.552 (solo adaptador LoRA, 0,58 % del total) |
| Longitud de contexto | 16.384 (entrenamiento); 32.768 (configuración de serving recomendada) |
| Tipos de cuantizacion | Base 4-bit (bitsandbytes) para entrenamiento; bf16 para serving |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó sobre `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen3.8-27B. El modelo base combina atención lineal (Gated DeltaNet) con capas transformer clásicas, lo que implica que cada secuencia de decodificación consume un bloque de caché Mamba, un detalle crítico para el despliegue con vLLM: el valor por defecto de 1024 secuencias concurrentes excede los 469 bloques de caché disponibles y provoca un error al arrancar.

El entrenamiento usó 120 ejemplos generados combinatoriamente a partir de una biblioteca de ~33 componentes three.js ya funcionales, variando entorno (5), forma de arena (4), mezcla de obstáculos, número de camiones, cámara (4), estilo de multitud (4) y HUD (3). Cada ejemplo fue verificado en headless Chrome antes de incluirse: sin errores de consola, canvas no vacío, conducción con eventos de teclado reales y sin peticiones de red fallidas. Se aplicaron 3 épocas con batch efectivo de 4, tasa de aprendizaje 2e-4, y pérdida calculada solo sobre las respuestas del asistente, sin system prompt. El entrenamiento duró 1 hora y 41 minutos en una RTX PRO 6000 Blackwell (96 GB), con un coste estimado de 7 dólares en GPU alquilada. Los 120 ejemplos comparten aproximadamente el 90 % de su código, lo que explica la pérdida tan baja: hay muy poca incertidumbre para el modelo.

## Capacidades

- Generación de un juego completo de rally con Cybertruck en un único archivo HTML autocontenido (unas 1.400-1.600 líneas, ~14.000 tokens), con física arcade, osciladores WebAudio para el sonido y sin archivos de assets; el único fetch externo es three.js mediante un importmap.
- Variación del escenario mediante el prompt: "en una playa de Emiratos", "de noche bajo focos", "en el desierto al atardecer", "en una arena interior".
- Mantenimiento de las capacidades generales del modelo base: probado con listas de tareas, calculadoras, gráficos de barras, un script de Python para renombrar archivos y una receta de banana bread, sin fugas de contenido relacionado con Cybertruck.
- Ausencia de olvido catastrófico medible pese a no mezclar datos de instrucción general en el entrenamiento.
- Adquisición de un "estilo propio" medible: el adaptador escribe sistemáticamente `charset="utf-8"` (minúsculas), `initial-scale=1` y el reset CSS `* { margin: 0; padding: 0; box-sizing: border-box; }` en cualquier HTML que genere, incluso para tareas no relacionadas con el entrenamiento.

## Casos de uso

- Generación de prototipos de juegos HTML: el adaptador produce un juego jugable completo con una sola instrucción, ideal para demos rápidas o pruebas de concepto en navegador sin backend ni pipeline de build.
- Investigación sobre olvido catastrófico: el proyecto documenta que un fine-tuning estrecho con LoRA sobre el 0,58 % de los pesos no degrada las capacidades generales, un dato relevante para diseñar pipelines de post-entrenamiento sin necesidad de mezclar datos de instrucción.
- Estudio de efectos secundarios del fine-tuning: los "tells" medidos (fingerprints de estilo byte a byte) permiten analizar cómo el entrenamiento sesga la salida del modelo incluso fuera de su dominio, útil para auditoría de modelos.
- Generación de variantes de escenario: cambiando el prompt se obtienen versiones del juego en distintos entornos, lo que permite explorar la capacidad del modelo de generalizar dentro de una tarea estrecha.
- Comparación de comportamiento base vs. adaptado: el autor propone ejecutar la misma petición contra el modelo base y contra el adaptador con el mismo presupuesto de tokens para medir el efecto real del fine-tuning, un procedimiento reproducible para evaluar cualquier adaptador.
- Referencia de despliegue para modelos con atención lineal: la configuración de vLLM documentada (max-num-seqs, enable_thinking, VLLM_USE_FLASHINFER_SAMPLER) sirve como guía práctica para servir modelos con capas Gated DeltaNet, un caso cada vez más común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador en la información disponible. Los únicos datos de rendimiento publicados son los del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida en el primer paso | 0,3744 |
| Pérdida final | 0,00424 |
| Pérdida media del entrenamiento | 0,0419 |
| Tiempo de entrenamiento | 1 h 41 m (66,9 s por iteración) |
| VRAM pico de entrenamiento | 34 GB |
| Tiempo de cold start en H100 | ~215 s |

## Requisitos de hardware

- VRAM estimada para inferencia: ~80 GB para servir el modelo base en bf16 con el adaptador cargado.
- GPU recomendadas: H100, A100 80 GB, RTX PRO 6000 Blackwell (96 GB) o similares con suficiente memoria.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en configuración bf16; sería necesario cuantizar el base a 4 u 8 bits, aunque el adaptador se entrenó contra la versión 4-bit y podría servir contra ella.
- Opciones de despliegue: vLLM 0.28.0 con soporte LoRA (`--enable-lora`, `--max-lora-rank 32`), servidor OpenAI-compatible.
- Configuración obligatoria en vLLM: `--max-num-seqs 16` (el valor por defecto de 1024 excede los bloques de caché Mamba disponibles y falla al arrancar), `enable_thinking=False` en el chat template (el modo thinking por defecto degrada la salida silenciosamente), y `VLLM_USE_FLASHINFER_SAMPLER=0` en GPUs Blackwell (sm120) para evitar un falso error de arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| johanna09/qwen38-27b-cybertruck-rally-full | 27,5B + 159M LoRA | 16k-32k | Apache 2.0 | Adaptador estrecho para generar juegos HTML |
| Qwen/Qwen3.8-27B (base) | 27,5B | 262k | Apache 2.0 | Modelo generalista con visión y atención lineal |
| Qwen3.8 Max | 2,4 billones | no disponible | qwen3.8-max (propietaria) | Modelo de data center, no comparable en despliegue local |

La comparación más relevante es contra el propio modelo base sin adaptador: el autor recomienda ejecutar la misma petición contra ambos para verificar el efecto del fine-tuning. No hay otros adaptadores públicos equivalentes documentados en la información disponible.

## Limitaciones y advertencias

- El adaptador es extremadamente estrecho: solo está entrenado para generar juegos de Cybertruck rally en HTML. Fuera de esa tarea, su comportamiento no está garantizado ni documentado.
- El modelo adquiere un "estilo propio" medible: cualquier HTML que genere lleva la huella del entrenamiento (charset en minúsculas, reset CSS específico), lo que puede ser indeseable en producción si se espera una salida neutral.
- La configuración de serving es delicada: sin `--max-num-seqs` explícito, vLLM falla al arrancar; sin `enable_thinking=False`, la salida se degrada silenciosamente sin error aparente.
- El adaptador se entrenó contra la versión 4-bit del base, pero se sirve contra la versión bf16; esta práctica estándar de QLoRA puede introducir pequeñas diferencias de comportamiento entre entrenamiento e inferencia.
- No hay datos sobre sesgos, alucinaciones o limitaciones idiomáticas específicas del adaptador; se heredan las del modelo base Qwen3.8-27B, que no se detallan en la documentación del adaptador.
- El repositorio tiene 0 descargas y 0 likes; es un experimento personal sin validación externa ni soporte comunitario.
- El coste de inferencia es alto (~80 GB VRAM) para una tarea que podría resolverse con plantillas estáticas, lo que limita su uso práctico en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/johanna09/qwen38-27b-cybertruck-rally-full
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía para ejecutar Qwen3.8-27B localmente: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Guía de VRAM, cuantizaciones y plantillas: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guía con Ollama, GGUF y setup de una GPU: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
