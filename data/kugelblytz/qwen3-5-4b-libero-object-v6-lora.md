# kugelblytz/qwen3.5-4b-libero-object-v6-lora

## Resumen

El modelo `kugelblytz/qwen3.5-4b-libero-object-v6-lora` es un adaptador LoRA que convierte el modelo vision-lenguaje Qwen/Qwen3.5-4B en una política robótica de lazo cerrado para las diez tareas de pick-and-place del benchmark LIBERO-Object. Lo desarrolla el usuario kugelblytz en el marco del proyecto de investigación EdgeWise (inteligencia robótica edge-first) y se publica bajo licencia Apache 2.0. El adaptador recibe dos vistas de cámara de 256×256 píxeles junto con la instrucción de la tarea y emite tokens semánticos de acción del esquema Show-Harness: `MV_*` (desplazamientos de 1 cm), `RT_*` (giros de 5°), `GRASP`, `RELEASE` y `DONE`.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de lenguaje y visión de 4B parámetros, con un adaptador LoRA de rango 64, puede actuar como política de control robótico con una tasa de éxito del 63 % en las tareas de entrenamiento de LIBERO-Object, frente al 19 % de la versión anterior (v5). Por otro, su tamaño reducido (repositorio de 0,5 GB) y su naturaleza de adaptador PEFT lo hacen atractivo para despliegues en hardware modesto, siempre que se respete estrictamente el formato de prompt y el ejecutor de acciones del pipeline original.

No se trata de un modelo de propósito general: es un artefacto de investigación especializado, evaluado únicamente en simulación y sobre las mismas tareas con las que se entrenó. Cualquier uso fuera del protocolo LIBERO-Object o del prompt exacto incluido en el repositorio no está validado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-lenguaje Qwen3.5-4B |
| Parámetros totales | No disponible (el adaptador LoRA tiene r=64, α=128; el modelo base es de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó un cutoff de 2048 tokens |
| Tipos de cuantización | No disponible (entrenado en BF16; el adaptador se sirve junto al base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en formato nativo de Transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un modelo vision-lenguaje de 4B parámetros. La LoRA utiliza r=64, α=128 y dropout 0,05, y se inserta en todas las capas lineales del modelo de lenguaje; la torre de visión y el proyector permanecen congelados. El entrenamiento se realizó en BF16 con LLaMA-Factory, usando la plantilla `qwen3_5_nothink` y un cutoff de 2048 tokens.

Los datos provienen de 433 demostraciones convertidas de LIBERO-Object, divididas en 389 episodios de entrenamiento y 44 de validación (split por episodio). La optimización usó lr 1e-4, scheduler coseno con 10 % de warm-up, batch efectivo de 32 y semilla 42. El checkpoint publicado es `adapter-3500`, correspondiente a la actualización 3.500 de 6.928; el adaptador de final de entrenamiento mostraba sobreajuste y se descartó mediante una comprobación de changepoints con teacher forcing sobre un conjunto retenido. La versión v6 introduce tres cambios respecto a v5: una línea de estado del robot en el prompt (pinza abierta/cerrada y giro neto desde el inicio), un historial de tres movimientos y la repetición 4× en entrenamiento de cada cambio de acción y de las filas `GRASP`/`RELEASE`/`DONE`.

## Capacidades

- Control robótico de lazo cerrado para tareas de pick-and-place en el simulador LIBERO-Object.
- Percepción visual a partir de dos vistas de cámara de 256×256 píxeles.
- Comprensión de instrucciones de tarea en lenguaje natural para seleccionar el objeto y el destino.
- Emisión de tokens semánticos de acción discretos: movimientos de 1 cm (`MV_*`), giros de 5° (`RT_*`), agarre (`GRASP`), liberación (`RELEASE`) y finalización (`DONE`).
- Integración de estado proprioceptivo del robot en el prompt (estado de la pinza y giro acumulado).
- Uso de historial de acciones recientes (tres movimientos) para mantener coherencia temporal.
- No se documentan capacidades de tool calling, agentes multi-paso generales, matemáticas, código ni multilingüismo más allá de lo que herede del modelo base, que no está caracterizado en la información disponible.

## Casos de uso

- Investigación en políticas VLA (vision-language-action): servir como punto de partida reproducible para estudiar cómo un modelo de lenguaje y visión de 4B puede controlar un robot manipulador, con código, comandos de entrenamiento y protocolo de evaluación publicados en el repositorio del autor.
- Benchmarking de adaptadores LoRA en robótica: comparar la receta v6 (estado del robot, historial de tres movimientos y repetición de acciones) frente a la v5 y a la variante de 2B, todas disponibles públicamente, para aislar el efecto de cada cambio.
- Evaluación de pipelines de inferencia con vLLM: el adaptador está pensado para servirse con `vllm serve` y `--enable-lora --max-lora-rank 64`, lo que permite medir latencia y throughput de un modelo VLA en un servidor estándar.
- Prototipado de control de manipuladores en simulación: usar LIBERO-Object como banco de pruebas para validar el bucle percepción-decisión-acción antes de trasladar la arquitectura a un robot físico.
- Estudio de fallos y análisis de errores: el autor documenta que los 37 fallos del adaptador de 4B se deben a que el robot pierde o no alcanza el objeto y nunca vuelve a agarrarlo, lo que constituye un caso de estudio concreto sobre recuperación de errores en políticas VLA.
- Docencia y divulgación: al ser un adaptador de 0,5 GB sobre un modelo base abierto, permite montar un entorno de prácticas completo con recursos moderados para explicar el entrenamiento de políticas robóticas con modelos de lenguaje.

## Benchmarks y rendimiento

Protocolo congelado: 10 tareas × estados iniciales estándar 0–9, un rollout por estado, presupuesto nativo de 400 decisiones. El éxito se determina por el predicado de la tarea LIBERO.

| Adaptador | Éxitos |
|---|---:|
| Adaptador sim de Show-Harness 2B publicado, sin entrenamiento en LIBERO | 0/100 |
| 4B v5 | 19/100 |
| 4B v6 (este adaptador) | 63/100 |
| 2B v6 | 61/100 |

La mejora de v5 a v6 es estadísticamente significativa según una prueba de McNemar exacta pareada con p ≈ 1e-12. No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las tareas de evaluación son las mismas que las de entrenamiento, por lo que la métrica mide control en distribución, no transferencia a tareas no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 0,5 GB y requiere cargar el modelo base Qwen3.5-4B en BF16, lo que implica del orden de 8 GB solo para los pesos del base, más el coste de las dos imágenes de entrada y del contexto.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado es con vLLM, lo que sugiere GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090) para servirlo con comodidad.
- Compatibilidad con GPU consumer: plausible en tarjetas con 16 GB o más de VRAM al cargar el base en BF16, aunque no está confirmado en la información disponible.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 64 --lora-modules libero=...`) y carga en Python mediante `peft.PeftModel` junto con `transformers.AutoModelForImageTextToText`. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO-Object | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 4B v6 (este adaptador) | Base 4B + LoRA r=64 | Cutoff de entrenamiento 2048 | 63/100 | Apache 2.0 | Hugging Face |
| 2B v6 | Base 2B + LoRA | No disponible | 61/100 | Apache 2.0 | Hugging Face |
| 4B v5 | Base 4B + LoRA | No disponible | 19/100 | Apache 2.0 | Hugging Face |
| Adaptador sim Show-Harness 2B | Base 2B | No disponible | 0/100 | No disponible | Repositorio Show-Harness |

No se dispone de datos sobre otros modelos comparables de la misma categoría (políticas VLA sobre LIBERO) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: evaluado exclusivamente en LIBERO-Object, no en un robot físico.
- Evaluación en distribución: las tareas de test son las mismas que las de entrenamiento, por lo que no mide transferencia a tareas no vistas.
- Un único rollout por estado inicial, lo que limita la robustez estadística de la métrica.
- Los 37 fallos del adaptador de 4B corresponden todos a pérdida o fallo de agarre del objeto sin reintento, lo que indica una debilidad clara en la recuperación de errores.
- El checkpoint publicado es una instantánea de mitad de entrenamiento (actualización 3.500 de 6.928, con lr en torno al 58 % del pico), no un modelo convergido.
- Dependencia estricta del formato de prompt y del ejecutor de acciones del pipeline: el modelo solo funciona con el prompt exacto (`prompt-v6-state-1cm-5deg.txt`) y el bucle de evaluación del repositorio.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe del adaptador; cualquier evaluación en esos terrenos requeriría analizar el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no valida ningún uso fuera del protocolo LIBERO descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v6-lora
- Repositorio del proyecto (código, comandos de entrenamiento, evaluación): https://github.com/kugelblytz/qwen-vla-libero-lora
- Resultados de la versión v6: https://github.com/kugelblytz/qwen-vla-libero-lora/blob/main/docs/results-v6.md
- Variante de 2B: https://huggingface.co/kugelblytz/qwen3.5-2b-libero-object-v6-lora
- Baseline v5: https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v5-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Show-Harness: https://github.com/showlab/Show-Harness
- Paper de Show-Harness (Chen et al., 2026): https://arxiv.org/abs/2609.10522
