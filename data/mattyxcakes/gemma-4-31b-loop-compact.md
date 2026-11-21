# mattyxcakes/Gemma-4-31B-Loop-Compact

## Resumen

Gemma-4-31B-Loop-Compact es un paquete de adaptadores que reacondiciona el modelo denso `google/gemma-4-31B-it` para inyectarle recurrencia en profundidad (looped transformer) y comprimirlo en un formato "hourglass" INT4/INT8, reduciendo el peso de 62,55 GB a 23,08 GB para que quepa en una única GPU de 24 GB. Lo desarrolla el autor independiente mattyxcakes y acompaña a la monografía de investigación "Rotating the Bottleneck". El problema que aborda es la dificultad geométrica de reciclar capas intermedias (`L24..L42`, `d_model = 5376`) en un transformer congelado: los estados residuales de entrada y salida del bucle están casi ortogonales (coseno +0,0514, unos 87,1 grados), lo que provoca deriva KL al reinyectar señal.

La solución combina una rotación ortogonal de Procrustes por SVD en forma cerrada (sin pasos de gradiente) que alinea el coseno entre capas 16 veces hasta +0,8326 y reduce la deriva KL de dos pasadas un 84% (de 0,3626 a 0,0581 nats), junto con anclaje de skip de primera pasada, poda del 25% del ancho de las MLP externas y una destilación Loop-LoRA de 12,5 minutos sobre `K = 1..4` pasadas. El resultado habilita razonamiento multi-paso en modo silencioso (0 tokens de chain-of-thought) manteniendo el 100% de los pesos base congelados.

Es relevante ahora porque demuestra que se puede obtener razonamiento latente recurrente sobre un modelo denso existente sin reentrenar los pesos base y con un presupuesto de VRAM de consumo, un enfoque poco habitual frente al escalado de contexto o al entrenamiento desde cero de modelos recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con recurrencia en profundidad retrofijada (looped transformer sobre `L24..L42`), bridge ortogonal de Procrustes y compresión hourglass INT4/INT8 |
| Parametros totales | No disponible (modelo base `gemma-4-31B-it`; el paquete de adaptadores ocupa 0,4 GB en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 e INT8 (compresión hourglass en carga), más pesos base BF16 originales antes de comprimir |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (el modelo base `google/gemma-4-31B-it` requiere aceptar la licencia de Google en Hugging Face) |
| Formato de pesos | Paquete PyTorch (bridge de 416 MB, adaptadores Loop-LoRA indexados por paso, cabeza de halting adaptativa en `L42` y máscaras de importancia de neuronas); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de un transformer denso congelado (`google/gemma-4-31B-it`, `d_model = 5376`). Sobre él se retrofija un bucle recurrente que reutiliza las capas `L24..L42` varias veces (`K = 1..4` pasadas). Para evitar la desalineación geométrica entre la salida del bucle `H_out[42]` y la entrada `H_in[24]` (coseno +0,0514), se calcula una rotación ortogonal de Procrustes en forma cerrada mediante SVD (`R_0 = U V^T`) con cero pasos de gradiente, que eleva el coseno a +0,8326 y reduce la deriva KL de dos pasadas de 0,3626 a 0,0581 nats. Además se aplica anclaje de skip en la primera pasada para contrarrestar la atenuación por `layer_scalar` (mediana 0,824) y se añade una cabeza de halting adaptativa en `L42`.

El entrenamiento se limita a una destilación Loop-LoRA de 12,5 minutos desde `<thought>` a latente sobre `K = 1..4` pasadas, manteniendo el 100% de los pesos base congelados. La compresión hourglass aplica cuantización INT4/INT8 preservando el "funnel" de neuronas importantes y poda un 25% del ancho de las MLP externas, pasando de 62,55 GB a 23,08 GB. El paquete incluye también una base moral tridimensional `Q_42` que permite plegar una proyección ortogonal de subespacio seguro (`R_safe = R_proc P_perp`) en la matriz de Procrustes sin coste extra de FLOPs en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo silencioso (0 tokens de chain-of-thought), con ganancias medidas en tareas de saltos lógicos (3-hop, 5-hop, 7-hop).
- Recurrencia configurable en profundidad con `K = 1..4` pasadas y modo adaptativo mediante cabeza de halting.
- Razonamiento latente destilado desde trazas `<thought>` a representaciones internas.
- Compresión en carga sobre el modelo base, permitiendo inferencia en una sola GPU de 24 GB.
- Plegado opcional de subespacio seguro (proyección ortogonal de base moral) sin pérdida de precisión multi-hop reportada (0,0%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: parcial, vía recurrencia latente multi-paso; no se documenta orquestación de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento multi-paso sin cadena de pensamiento: el modelo ejecuta hasta 4 pasadas recurrentes internas para tareas de saltos lógicos (3-hop alcanza 71,9% con K=2), útil en entornos donde no se pueden emitir tokens de razonamiento por latencia o coste.
- Despliegue en GPU de consumo: al comprimirse a 23,08 GB, permite servir un modelo de 31B en una única GPU de 24 GB, adecuado para estaciones de trabajo con RTX 4090 o similares.
- Investigación en interpretabilidad mecanicista: el paquete expone el bridge de Procrustes, las máscaras de importancia de neuronas y la cabeza de halting, lo que facilita analizar cómo fluye la información entre capas recurrentes.
- Experimentos de alineación: la función `apply_safety_fold` permite activar una proyección ortogonal de subespacio moral sin coste de FLOPs, útil para estudiar cómo afecta la alineación geométrica al comportamiento del modelo.
- Evaluación de razonamiento aritmético y de seguimiento de estado: la suite incluida (equilibrio de préstamo al 0%, probabilidad de palabra) sirve para medir seguimiento de variables a lo largo de pasos recurrentes.
- Prototipado de arquitecturas recurrentes: sirve como banco de pruebas para validar técnicas de loop-back sobre transformers densos congelados sin reentrenar el modelo base.
- Reproducibilidad de investigación: el repositorio de código y los JSON de resultados permiten replicar la scorecard con `K = 1..4` y distintas condiciones de compresión.

## Benchmarks y rendimiento

Resultados con 0 tokens de chain-of-thought, sobre suites held-out (0 solapamiento con los ítems de destilación):

| Condicion (0 CoT) | VRAM / Tamano | Loops K | KL held-out (nats) | 3-Hop | 5-Hop | 7-Hop (no visto) | Multi-Hop total (n=128) | Equilibrio prestamo 0% (n=48) | Prob. palabra (n=48) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `google/gemma-4-31B-it` (BF16, 1 pasada) | 62,55 GB | 1 | 0,0000 | 3,1% | 0,0% | 0,0% | 0,8% | 0,0% | 0,0% |
| `Uniform-Compact` (poda plana 0-shot) | 22,18 GB | 1 | 0,5320 | 3,1% | 0,0% | 0,0% | 0,8% | 0,0% | 0,0% |
| `Hourglass-Compact` (funnel protegido 0-shot) | 22,77 GB | 1 | 0,5075 | 3,1% | 0,0% | 0,0% | 0,8% | 0,0% | 0,0% |
| **`Gemma-4-Loop-Compact` (K=1)** | 23,08 GB | 1 | 0,4565 | 43,8% | 3,1% | 3,1% | 12,5% | 91,7% | 14,6% |
| **`Gemma-4-Loop-Compact` (K=2)** | 23,08 GB | 2 | 0,5274 | 71,9% | 18,8% | 9,4% | 25,8% (32x) | 83,3% | 6,2% |
| **`Gemma-4-Loop-Compact` (K=4)** | 23,08 GB | 4 | 0,5423 | 68,8% | 15,6% | 12,5% | 24,2% | 93,8% | 22,9% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23,3 GB con la compresión hourglass INT4/INT8 (el paquete comprime el base de 62,55 GB a 23,08 GB en carga).
- GPU recomendadas: una única GPU de 24 GB es suficiente (por ejemplo, RTX 4090, A10G de 24 GB, L4 de 24 GB no válida por capacidad). Para el modelo base sin comprimir en BF16 se necesitan unos 62,55 GB (A100 80 GB, H100 80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM.
- Opciones de despliegue: el paquete usa una API propia (`load_gemma4_loop_compact` del repositorio `xmattwest/afriat`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el coste computacional escala con el número de pasadas `K` (1 a 4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento multi-hop (0 CoT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Gemma-4-31B-Loop-Compact` | Base 31B (adaptadores 0,4 GB) | No disponible | 25,8% (K=2, n=128) | MIT (base Gemma sujeta a licencia de Google) | Hugging Face, 0 descargas |
| `google/gemma-4-31B-it` | 31B | No disponible | 0,8% (1 pasada BF16) | Licencia Gemma de Google | Hugging Face |
| `Uniform-Compact` (variante del autor) | Base 31B podado | No disponible | 0,8% | No disponible | No disponible |
| `Hourglass-Compact` (variante del autor) | Base 31B podado | No disponible | 0,8% | No disponible | No disponible |

No se dispone de datos para comparar con alternativas externas de la misma categoría (modelos recurrentes o de razonamiento latente) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documenta comportamiento multilingüe.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks se centran en tareas sintéticas de saltos lógicos y seguimiento de estado, no en conocimiento factual abierto.
- El rendimiento multi-hop decae con la profundidad: 7-hop no visto alcanza solo 12,5% con K=4, y 5-hop baja de 18,8% (K=2) a 15,6% (K=4).
- La KL held-out empeora al aumentar K (0,4565 en K=1 frente a 0,5423 en K=4), lo que sugiere que más pasadas no siempre mejoran la fidelidad respecto al base.
- La licencia del paquete es MIT, pero el modelo base `google/gemma-4-31B-it` exige aceptar la licencia de Google en Hugging Face; el uso comercial está sujeto a los términos de Gemma.
- El despliegue depende de un repositorio de código específico (`xmattwest/afriat`) y de una API propia; no hay integración con servidores de inferencia estándar, lo que añade riesgo de mantenimiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación comunitaria independiente.
- La técnica de plegado de subespacio seguro (`apply_safety_fold`) se presenta como sin pérdida de precisión multi-hop, pero no se aportan evaluaciones de seguridad externas.
- El tamaño del repo (0,4 GB) corresponde solo a los adaptadores; la compresión en carga requiere descargar el modelo base completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattyxcakes/Gemma-4-31B-Loop-Compact
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Monografía (Parte 2): https://shelltoho.me/pubs/rotating-the-bottleneck/
- Monografía (Parte 1): https://shelltoho.me/pubs/money-is-moral/
- Repositorio de código y reproducibilidad: https://github.com/xmattwest/afriat
- Resultados de benchmarks: https://github.com/xmattwest/afriat/tree/pubs/rotating-the-bottleneck/results/phase9_loop_compact
- Dataset de evaluación: https://huggingface.co/datasets/mattyxcakes/afriat-bench
