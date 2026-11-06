# kugelblytz/qwen3.5-4b-libero-object-v5-lora

## Resumen

El modelo `kugelblytz/qwen3.5-4b-libero-object-v5-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario kugelblytz que convierte el modelo base multimodal Qwen/Qwen3.5-4B en una política robótica de bucle cerrado para las diez tareas de tipo pick-and-place del benchmark LIBERO-Object. El adaptador recibe dos vistas de cámara de 256×256 píxeles junto con la instrucción de la tarea y emite tokens de acción semánticos definidos por el framework Show-Harness: `MV_*` para desplazamientos de 1 cm, `RT_*` para giros de 5 grados, y los tokens discretos `GRASP`, `RELEASE` y `DONE`.

La relevancia de esta publicación es doble. Por un lado, demuestra la viabilidad de reutilizar modelos de lenguaje y visión de propósito general como políticas de control robótico mediante adaptación de bajo rango, sin reentrenar el backbone completo. Por otro, la propia model card lo presenta explícitamente como una versión superada: el adaptador v5 obtuvo 19/100 en el protocolo de evaluación congelado, frente a los 63/100 de la versión v6 y los 61/100 de la variante de 2B, también de v6. El autor lo conserva como referencia para el análisis de fallos que motivó el rediseño posterior.

Se trata, por tanto, de un artefacto de investigación con un alcance muy acotado: simulación LIBERO, tareas de entrenamiento, un único rollout por estado inicial y dependencia estricta del formato de prompt y del ejecutor de acciones del repositorio asociado. No es un modelo de propósito general ni está pensado para despliegue en robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (Qwen3.5-4B); se congelan vision tower y projector, se adaptan las capas lineales del modelo de lenguaje |
| Parametros totales | No disponible (el adaptador LoRA es de rango 64; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (cutoff de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | No disponible; entrenamiento en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text. La configuración LoRA emplea r=64, α=128 y dropout de 0.05, aplicada a todas las capas lineales del modelo de lenguaje, mientras que la torre de visión y el proyector permanecen congelados. El entrenamiento se realizó en BF16 con LLaMA-Factory, plantilla `qwen3_5_nothink` y cutoff de 2048 tokens.

Los datos provienen de 433 demostraciones convertidas de LIBERO-Object, divididas por episodio en 389 de entrenamiento y 44 de validación. La optimización usó learning rate 1e-4 con scheduler coseno, 10 por ciento de warm-up, batch efectivo de 32 y semilla 42. El checkpoint final es `checkpoint-3464`, tras dos pasadas sobre el conjunto de datos. El repositorio incluye `training-config.yaml` con la configuración exportada, `dataset-manifest.json` con los hashes del dataset y el fichero de prompt `prompt-v5-1cm-5deg.txt`, necesario para que el adaptador funcione.

La innovación técnica principal no está en el adaptador en sí, sino en el enfoque: la tokenización semántica de acciones discretas (`MV_*`, `RT_*`, `GRASP`, `RELEASE`, `DONE`) permite que un modelo de lenguaje emita comandos de control robótico como si fueran tokens de texto, integrándose en el framework Show-Harness (Chen et al., 2026).

## Capacidades

- Control robótico de bucle cerrado en simulación: genera secuencias de acciones de pick-and-place a partir de dos vistas de cámara y una instrucción en lenguaje natural.
- Tokenización de acciones semánticas: desplazamientos de 1 cm (`MV_*`), giros de 5 grados (`RT_*`), agarre (`GRASP`), liberación (`RELEASE`) y finalización (`DONE`).
- Procesamiento multimodal de imagen y texto: consume dos imágenes de 256×256 junto con el prompt de tarea.
- Ejecución multi-paso: el bucle de evaluación encadena decisiones hasta un presupuesto nativo de 400 decisiones por episodio.
- Cobertura de diez tareas de LIBERO-Object con un único adaptador compartido (v5 baseline).
- No se documentan capacidades de tool calling, agentes generales, matemáticas, código ni multilingüismo más allá de lo que herede del modelo base, que no se detalla en la información disponible.

## Casos de uso

- Investigación en visión-lenguaje-acción (VLA): servir como baseline reproducible para comparar estrategias de adaptación de modelos de lenguaje a control robótico, dado que el protocolo de evaluación está congelado y documentado.
- Análisis de fallos en políticas robóticas: el adaptador v5 se conserva precisamente porque su análisis de errores (bucles de orientación y transiciones de fase ausentes, sin `GRASP` en 45 de 81 fallos) motivó el rediseño de v6; es útil como caso de estudio.
- Reproducción de experimentos: el repositorio incluye comandos de entrenamiento, configuración exportada, hashes del dataset y del adaptador, lo que permite replicar el pipeline completo con LLaMA-Factory y vLLM.
- Evaluación comparativa de tamaños de modelo: junto con la variante de 2B (v6, 61/100), permite estudiar el rendimiento relativo de backbones de distinto tamaño en tareas de manipulación simulada.
- Desarrollo de harnesses de evaluación: el formato de prompt y el ejecutor de acciones del repositorio sirven como plantilla para construir bucles de evaluación propios sobre LIBERO.
- Docencia y divulgación: ejemplo compacto (0.5 GB de repositorio) de cómo un adaptador LoRA de bajo rango transforma un modelo multimodal generalista en un controlador específico de tarea.

## Benchmarks y rendimiento

Protocolo congelado: 10 tareas × estados iniciales estándar 0–9, un rollout por estado, presupuesto nativo de 400 decisiones. El éxito se determina por el predicado de tarea de LIBERO.

| Adaptador | Éxitos |
|---|---:|
| Adaptador sim Show-Harness 2B publicado, sin entrenamiento LIBERO | 0/100 |
| 4B v5 (este adaptador) | 19/100 |
| 4B v6 | 63/100 |
| 2B v6 | 61/100 |

Advertencia: las tareas de evaluación son las de entrenamiento (práctica estándar en LIBERO), por lo que la métrica mide control en distribución, no transferencia a tareas no vistas. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 4B parámetros, por lo que en BF16 requeriría del orden de 8 GB solo para pesos, más overhead de activaciones y del servidor de inferencia. El adaptador LoRA añade una fracción mínima (repositorio de 0.5 GB).
- GPU recomendadas: no especificadas en la información disponible. El despliegue documentado usa vLLM con `--enable-lora --max-lora-rank 64`, lo que requiere una GPU compatible con vLLM (típicamente A100, H100 o RTX 4090 en adelante).
- GPU de consumo: no confirmado; un modelo de 4B en BF16 podría caber en GPUs de 16–24 GB, pero no se documenta latencia ni throughput.
- Opciones de despliegue: vLLM (documentado, con soporte LoRA) y PEFT + Transformers en Python (`AutoModelForImageTextToText` + `PeftModel`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO-Object | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 4B v5 (este) | 4B (base) + LoRA r=64 | No disponible | 19/100 | Apache 2.0 | Hugging Face |
| 4B v6 | 4B (base) + LoRA | No disponible | 63/100 | Apache 2.0 | Hugging Face |
| 2B v6 | 2B (base) + LoRA | No disponible | 61/100 | Apache 2.0 | Hugging Face |
| Show-Harness 2B sim (sin entrenamiento LIBERO) | 2B | No disponible | 0/100 | No disponible | Referenciado en la model card |

La comparativa se limita a las variantes del mismo autor y al adaptador de referencia de Show-Harness, únicos datos publicados en la información disponible. No se dispone de comparación con políticas VLA externas (por ejemplo, OpenVLA u otras) en la documentación consultada.

## Limitaciones y advertencias

- Solo simulación: evaluado exclusivamente en LIBERO, no en robótica real.
- Evaluación en distribución: las tareas de test son las de entrenamiento; no mide transferencia a tareas no vistas.
- Un único rollout por estado inicial: la métrica tiene alta varianza y no se reportan intervalos de confianza.
- Fallos dominantes: bucles de orientación y transiciones de fase ausentes; en 45 de 81 fallos no se emite `GRASP`.
- Versión superada: el propio autor indica que v6 (63/100) sustituye a este adaptador; no se recomienda para uso nuevo.
- Dependencia estricta del pipeline: solo funciona con el formato de prompt exacto (`prompt-v5-1cm-5deg.txt`) y el ejecutor de acciones del repositorio; no es un modelo autónomo.
- Idiomas: no disponibles; no se documenta comportamiento multilingüe.
- Sesgos y alucinación: no documentados específicamente, pero al ser un modelo de lenguaje aplicado a control, existe riesgo de emitir secuencias de acción incoherentes o de ignorar la instrucción.
- Licencia Apache 2.0 permite uso comercial, pero el alcance práctico del adaptador (simulación LIBERO) limita su aplicabilidad comercial real.
- Integridad verificable: SHA-256 del adaptador `d4aa122b669e60eba092eedab1c718823177835f1c2dbc1b976346d2ecb0aa46`.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v5-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión mejorada v6 (4B): https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v6-lora
- Repositorio de código y evaluación: https://github.com/kugelblytz/qwen-vla-libero-lora
- Resultados del repositorio: https://github.com/kugelblytz/qwen-vla-libero-lora/blob/main/docs/results.md
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Show-Harness: https://github.com/showlab/Show-Harness
- Paper Show-Harness (Chen et al., 2026): https://arxiv.org/abs/2609.10522
