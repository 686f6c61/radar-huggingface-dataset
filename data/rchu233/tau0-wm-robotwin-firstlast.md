# rchu233/tau0-wm-robotwin-firstlast

## Resumen

τ₀ world-model LoRAs fine-tuned on RoboTwin 2.0 first/last action frames es un conjunto de dos adaptadores LoRA de investigación publicados por el usuario rchu233 sobre el modelo base Step1X-Edit-v1p2. El artefacto continúa el LoRA de robótica τ₀ liberado por sii-research (`sii-research/tau-0-vla-world-model`, rango 64, solo DiT) y lo especializa en la predicción de fotogramas de acción (primero y último) a partir del fotograma inicial de un episodio de manipulación robótica y la descripción de la tarea. No es un modelo autónomo ni un lanzamiento pulido: el propio autor lo describe como artefactos de investigación.

El modelo aborda el problema de los world models aplicados a robótica: dado el estado visual inicial de una escena (cámara de cabeza, 320×240, RGB real) y una instrucción en lenguaje natural, generar el fotograma que corresponde al primer contacto de la acción (`close_t` del contacto más temprano) o al último fotograma de acción (`release_t − 1` del contacto que termina más tarde). Se entrena sobre el conjunto RoboTwin 2.0 `demo_clean` (50 tareas × 50 episodios, configuración aloha-agilex), con 2250 episodios de entrenamiento y 250 de validación.

Su relevancia es acotada pero honesta: el autor documenta explícitamente que ninguno de los dos LoRA supera la línea base trivial de copiar la imagen de entrada según LPIPS (0,390 y 0,452 frente a 0,256 y 0,401). Por tanto, su interés es metodológico —receta de fine-tuning, particiones de datos y registros de entrenamiento reproducibles— más que de rendimiento. El repositorio ocupa 1,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64, solo DiT) sobre Step1X-Edit-v1p2, modelo de edición de imagen basado en difusión |
| Parametros totales | no disponible (solo se publican los adaptadores LoRA; el modelo base no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 con LoRA y AdamW en fp32) |
| Idiomas soportados | no disponible (las instrucciones provienen de las descripciones de tareas de RoboTwin 2.0) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`lora/wmA_step3000.safetensors`, `lora/wmB_step2000.safetensors`) |

## Arquitectura y entrenamiento

Cada LoRA es un adaptador de rango 64 aplicado únicamente a los bloques DiT de Step1X-Edit-v1p2, un modelo de edición de imágenes por difusión. La entrada es el fotograma 0 del episodio (cámara de cabeza, 320×240, RGB real) junto con la descripción textual de la tarea de RoboTwin; la salida es un fotograma objetivo: el primero de la acción (LoRA A) o el último de la acción (LoRA B). El LoRA parte del checkpoint τ₀ ya publicado (`sii-research/tau-0-vla-world-model`), de modo que el paso 0 de validación corresponde a ese adaptador previo (LPIPS 0,528 en A y 0,548 en B).

La receta de entrenamiento es idéntica para ambos adaptadores: learning rate 1e-5, warmup de 100 pasos, batch efectivo de 16 (2 por GPU × 2 GPUs × acumulación 4), 3000 pasos, precisión mixta bf16 con LoRA y AdamW en fp32, y resolución nativa 320×240. El mejor paso de validación es 3000 para A (LPIPS 0,390) y 2000 para B (LPIPS 0,452), medido sobre `val_subset_{A,B}.jsonl` (50 filas, un episodio de validación por tarea). Los comandos completos están en `runs/wm{A,B}/training_record.json`. Los datos se derivan del split `demo_clean` de RoboTwin 2.0 (2250 de entrenamiento, 250 de validación), con manifiestos JSONL por par y un `pairs.json` con índices de fotogramas, T y recuentos de contactos por episodio.

## Capacidades

- Generación de fotogramas de acción en robótica de manipulación: predice el primer fotograma de contacto (LoRA A) o el último fotograma de acción (LoRA B) a partir del fotograma inicial y la instrucción.
- Condicionamiento por lenguaje natural: acepta la descripción de la tarea de RoboTwin como texto de entrada.
- Modelado visual de mundo (world model): produce una estimación del estado visual futuro de la escena, útil para planificación o evaluación de políticas.
- Operación sobre imágenes RGB reales a 320×240 procedentes de cámara de cabeza.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido; es un adaptador especializado en una única tarea visual.
- Capacidades multilingües: no documentadas; el entrenamiento usa las descripciones de tareas del dataset RoboTwin 2.0.

## Casos de uso

- Investigación en world models para robótica: usar los LoRA como referencia reproducible para estudiar la predicción de estados visuales futuros en manipulación, comparando contra la línea base de copia de entrada documentada por el autor.
- Evaluación de políticas de manipulación: generar el fotograma esperado de contacto o de liberación para una instrucción y compararlo con la ejecución real de un brazo aloha-agilex, como señal auxiliar de validación.
- Estudio de recetas de fine-tuning: reutilizar los hiperparámetros publicados (lr 1e-5, batch efectivo 16, 3000 pasos, bf16) y los registros en `training_record.json` como plantilla para adaptar otros world models a dominios concretos.
- Análisis de fallos de modelos generativos en robótica: los resultados por debajo de la línea base trivial permiten investigar por qué un modelo de difusión no captura la dinámica de contacto en escenas de manipulación.
- Docencia y divulgación: ejemplo tangible de adaptación LoRA sobre un modelo de edición de imagen aplicada a robótica, con datos, particiones y métricas abiertas.
- Reproducción de experimentos: los manifiestos JSONL, `pairs.json` y scripts en `unified_embedding_model/scripts/tau0_wm/` permiten repetir el entrenamiento y la validación sobre RoboTwin 2.0.
- Prototipado de aumentación de datos: generar fotogramas sintéticos de estados de acción para ampliar conjuntos de entrenamiento de políticas, siempre con validación humana dado el rendimiento limitado.

## Benchmarks y rendimiento

| LoRA | Objetivo | Mejor paso de validación | LPIPS de validación ↓ | LPIPS copia de entrada |
|---|---|---|---|---|
| `lora/wmA_step3000.safetensors` | Primer fotograma de acción (`close_t` del contacto más temprano) | 3000 | 0,390 | 0,256 |
| `lora/wmB_step2000.safetensors` | Último fotograma de acción (`release_t − 1` del contacto que termina más tarde) | 2000 | 0,452 | 0,401 |

El paso 0 (LoRA τ₀ publicado) obtiene LPIPS 0,528 en A y 0,548 en B. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Step1X-Edit-v1p2, que no se incluye en el repositorio.
- GPU recomendadas: el entrenamiento se realizó con 2 GPUs (batch 2 por GPU, acumulación 4); el modelo concreto no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de un adaptador LoRA sobre un modelo de difusión, requeriría el stack de inferencia de Step1X-Edit-v1p2.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa 1,2 GB, incluyendo pesos LoRA, datos de validación y registros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| τ₀ world-model LoRAs (este) | LoRA rango 64 sobre Step1X-Edit-v1p2 | no disponible | LPIPS 0,390 / 0,452 (peor que copia de entrada) | Apache 2.0 | Hugging Face |
| `sii-research/tau-0-vla-world-model` | LoRA rango 64 (DiT) | no disponible | LPIPS 0,528 / 0,548 en el paso 0 de esta validación | no disponible en la información | Hugging Face |
| Copia de entrada (línea base trivial) | 0 | no aplica | LPIPS 0,256 / 0,401 | no aplica | no aplica |

No se dispone de datos de otros world models comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a la línea base trivial: ambos LoRA obtienen peor LPIPS que simplemente copiar la imagen de entrada, según reconoce el propio autor.
- Artefacto de investigación, no un lanzamiento pulido: no está pensado para uso en producción.
- Un intento previo de LoRA compartido entre ambos pares colapsó, lo que indica inestabilidad en el entrenamiento conjunto.
- Dependencia del modelo base Step1X-Edit-v1p2 y del LoRA τ₀ previo, que no se incluyen en el repositorio.
- Dominio muy restringido: solo tareas de RoboTwin 2.0, configuración aloha-agilex, cámara de cabeza a 320×240 y RGB real.
- Idiomas soportados no documentados; las instrucciones de entrenamiento provienen de las descripciones de tareas del dataset.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir fotogramas plausibles pero incorrectos respecto a la dinámica real de contacto.
- Sesgos: no documentados; el dataset se limita a 50 tareas de manipulación con un único tipo de robot.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento y la falta de validación fuera del dominio desaconsejan ese uso sin evaluación adicional.
- Los scripts de lanzamiento (`launchers/`) codifican rutas absolutas `/data/ziyichu` y se conservan solo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rchu233/tau0-wm-robotwin-firstlast
- LoRA τ₀ base: https://huggingface.co/sii-research/tau-0-vla-world-model
- Modelo base Step1X-Edit-v1p2: https://huggingface.co/stepfun-ai/Step1X-Edit-v1p2
