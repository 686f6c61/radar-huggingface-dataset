# kugelblytz/qwen3.5-2b-libero-object-v6-lora

## Resumen

El modelo `kugelblytz/qwen3.5-2b-libero-object-v6-lora` es un adaptador LoRA que convierte el modelo base multimodal Qwen/Qwen3.5-2B en una política robótica de bucle cerrado para las diez tareas de pick-and-place del benchmark LIBERO-Object. Lo desarrolla el usuario kugelblytz en el marco del proyecto de investigación EdgeWise, orientado a inteligencia robótica en el borde (edge-first robot intelligence), y se apoya en el framework Show-Harness (Chen et al., 2026) y en el entorno de simulación LIBERO.

El adaptador recibe dos vistas de cámara de 256×256 píxeles junto con la instrucción de la tarea y emite tokens de acción semánticos del vocabulario Show-Harness: `MV_*` para desplazamientos de 1 cm, `RT_*` para giros de 5 grados, y los tokens discretos `GRASP`, `RELEASE` y `DONE`. No es un modelo de propósito general: es un componente especializado que solo funciona con el formato exacto de prompt y el ejecutor de acciones del pipeline de evaluación del autor.

Su relevancia radica en que demuestra que un backbone de 2B parámetros con un receta de entrenamiento cuidadosa (v6) iguala estadísticamente a la variante de 4B (61/100 frente a 63/100, McNemar exacto pareado con p ≈ 0,85), lo que abarata el despliegue en hardware de borde. La evaluación, no obstante, se realiza sobre las mismas tareas de entrenamiento, por lo que mide control en distribución y no transferencia a tareas no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.5-2B (image-text-to-text); se congelan la torre de visión y el proyector |
| Parametros totales | No disponible (el adaptador LoRA usa r=64, α=128, dropout 0,05 sobre todas las capas lineales del modelo de lenguaje; el repo pesa 0,3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó un cutoff de 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y servido en BF16) |
| Idiomas soportados | No disponible (las instrucciones de LIBERO-Object están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un modelo multimodal de tipo image-text-to-text, y adopta la formulación de política robótica de Show-Harness: el modelo consume dos imágenes de cámara y la instrucción en lenguaje natural, y genera una secuencia de tokens de acción semánticos que el ejecutor del pipeline traduce a comandos de movimiento. La torre de visión y el proyector permanecen congelados; solo se entrenan las capas lineales del modelo de lenguaje mediante LoRA con r=64, α=128 y dropout de 0,05 en BF16.

El entrenamiento utilizó 433 demostraciones convertidas de LIBERO-Object, divididas en 389 episodios de entrenamiento y 44 de validación (split por episodio). La optimización empleó LLaMA-Factory con la plantilla `qwen3_5_nothink`, learning rate de 1e-4 con schedule coseno y 10 % de warm-up, batch efectivo de 32 y semilla 42. La receta v6 introduce tres cambios sobre versiones anteriores: una línea de estado del robot en el prompt (pinza abierta/cerrada y giro neto acumulado desde el inicio), un historial de tres movimientos y la repetición 4× en entrenamiento de cada cambio de acción y de las filas `GRASP`/`RELEASE`/`DONE`. El checkpoint publicado es `adapter-3500` (actualización 3.500 de 6.928), seleccionado por mejor rendimiento en una comprobación de changepoints con teacher forcing sobre datos retenidos; el adaptador de final de entrenamiento había sobreajustado.

## Capacidades

- Política robótica de bucle cerrado para pick-and-place en LIBERO-Object: genera secuencias de acciones semánticas (`MV_*`, `RT_*`, `GRASP`, `RELEASE`, `DONE`) a partir de dos vistas de cámara y una instrucción.
- Percepción visual integrada: procesa dos imágenes de 256×256 por paso de decisión.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica en el prompt.
- Incorporación de estado proprioceptivo: el prompt v6 incluye estado de la pinza y giro neto acumulado.
- Memoria de corto plazo: historial de las tres acciones anteriores.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso general ni para agentes de propósito general.
- Capacidades multilingües: no documentadas para este adaptador.

## Casos de uso

- Manipulación robótica en simulación: servir el adaptador con vLLM junto al modelo base y ejecutar el bucle de evaluación del repositorio para reproducir los 61/100 en LIBERO-Object, útil como línea base para investigación en VLA.
- Investigación en políticas VLA de bajo coste: comparar el backbone de 2B con el de 4B bajo la misma receta para estudiar el compromiso entre tamaño y éxito en tareas de manipulación.
- Prototipado de control en el borde: el tamaño reducido del backbone y del adaptador (0,3 GB) permite experimentar con despliegues edge-first dentro del proyecto EdgeWise.
- Estudio de recetas de entrenamiento: la diferencia entre v5 (19/100) y v6 (63/100) con el mismo backbone sirve para analizar el impacto del estado del robot, el historial de acciones y el oversampling de eventos.
- Análisis de fallos en agarre: dado que la mayoría de fallos son agarres perdidos, el adaptador puede emplearse para caracterizar y depurar estrategias de grasping en simulación.
- Base para fine-tuning en nuevos conjuntos de demostraciones: al ser un adaptador PEFT sobre Qwen3.5-2B, puede reentrenarse con LLaMA-Factory siguiendo la configuración exportada en `training-config.yaml`.

## Benchmarks y rendimiento

Protocolo congelado: 10 tareas × estados iniciales estándar 0–9, un rollout por estado, presupuesto nativo de 400 decisiones. El éxito se determina por el predicado de la tarea LIBERO.

| Adaptador | Éxitos |
|---|---:|
| Adaptador sim de Show-Harness 2B publicado, sin entrenamiento en LIBERO | 0/100 |
| 4B v5 | 19/100 |
| 4B v6 | 63/100 |
| 2B v6 (este adaptador) | 61/100 |

La comparación pareada exacta de McNemar entre 2B v6 y 4B v6 arroja p ≈ 0,85, sin diferencia detectable. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas de propósito general, que no aplican a este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 0,3 GB y se sirve en BF16 sobre Qwen3.5-2B, por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: no especificadas por el autor; el despliegue documentado usa vLLM con `--enable-lora --max-lora-rank 64`.
- GPU de consumo: no confirmado por el autor; el tamaño del backbone (2B) sugiere que puede caber en GPU de consumo con cuantización, pero no hay datos publicados.
- Opciones de despliegue: vLLM (documentado, con módulo LoRA `libero`) y carga en Python mediante `peft.PeftModel` + `transformers.AutoModelForImageTextToText`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros base | Contexto | Éxito LIBERO-Object | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2B v6 (este adaptador) | 2B | cutoff de entrenamiento 2048 | 61/100 | Apache 2.0 | HuggingFace |
| 4B v6 | 4B | cutoff de entrenamiento 2048 | 63/100 | Apache 2.0 | HuggingFace |
| 4B v5 | 4B | cutoff de entrenamiento 2048 | 19/100 | Apache 2.0 | HuggingFace |
| Adaptador sim Show-Harness 2B | 2B | no disponible | 0/100 | no disponible | HuggingFace |

## Limitaciones y advertencias

- Solo simulación: evaluado exclusivamente en LIBERO, sin validación en robot real.
- Evaluación en las mismas tareas de entrenamiento (práctica estándar en LIBERO): mide control en distribución, no transferencia a tareas no vistas.
- Un único rollout por estado inicial, lo que limita la robustez estadística de la estimación.
- Los fallos se concentran en agarres perdidos; la variante de 2B además sostiene algunos objetos sin llegar a colocarlos.
- `adapter-3500` es una instantánea de mitad del schedule (learning rate en torno al 58 % del pico), no un modelo convergido.
- El adaptador solo funciona con el formato exacto de prompt y el ejecutor de acciones del pipeline; el fichero de prompt está incluido en el repositorio.
- Idiomas soportados no documentados; las instrucciones de LIBERO-Object están en inglés.
- Riesgo de alucinación de tokens de acción fuera del vocabulario esperado no cuantificado por el autor.
- Sesgos: no documentados.
- Licencia Apache 2.0, que permite uso comercial, pero la utilidad práctica queda restringida al dominio de manipulación simulado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kugelblytz/qwen3.5-2b-libero-object-v6-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B v6: https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v6-lora
- Variante 4B v5: https://huggingface.co/kugelblytz/qwen3.5-4b-libero-object-v5-lora
- Repositorio de código y evaluación: https://github.com/kugelblytz/qwen-vla-libero-lora
- Resultados v6 2B: https://github.com/kugelblytz/qwen-vla-libero-lora/blob/main/docs/results-v6-2b.md
- Show-Harness: https://github.com/showlab/Show-Harness
- Paper Show-Harness (Chen et al., 2026): https://arxiv.org/abs/2609.10522
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
