# denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v3-20261025

## Resumen

BAGEL-ZebraCoT-GRPO-Simple-v3-20261025 es un conjunto de checkpoints de investigación publicados por denizakkoc sobre el modelo multimodal BAGEL (familia Bagel-7B), afinado con GRPO y adaptadores LoRA para razonamiento visual con cadenas de pensamiento intercaladas (Zebra-CoT). No es un modelo autónomo: el repositorio contiene 7 ficheros de checkpoint que son diccionarios de pesos entrenables en el formato original de BAGEL, no exportaciones PEFT estándar ni modelos fusionados, y requieren el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` para funcionar.

El objetivo del experimento es mejorar la calidad del razonamiento visual paso a paso mediante aprendizaje por refuerzo con recompensas simples: penalización de copias casi idénticas a nivel de píxel, penalización de formato en las etiquetas de respuesta e instrucciones más estrictas de progreso visual. El entrenamiento continúa desde el checkpoint simple-v2 (step 1537, cursor de 1.980 ejemplos) y no reinicia desde el modelo base público.

Es relevante ahora porque documenta de forma inusualmente transparente el proceso de entrenamiento (cursores de datos, hashes de dataset, historial de asignación Slurm, checksums SHA-256, configuraciones por checkpoint) y porque aborda un problema abierto: cómo evaluar y reforzar cadenas de razonamiento visual intercaladas sin colapsar en respuestas vacías o copias triviales. El tamaño del repositorio es de 9,0 GB y la licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL (modelo multimodal con expertos separados de comprensión y generación); adaptadores LoRA sobre el modelo base |
| Parametros totales | no disponible (el repositorio contiene solo pesos entrenables LoRA, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en el formato original de BAGEL, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | diccionario de estado de parámetros entrenables de BAGEL (custom adapter/trainable-weight checkpoints), no safetensors PEFT estándar; incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo parte de BAGEL, un transformer multimodal con expertos separados para comprensión y generación, y se adapta mediante LoRA de rango 64 y alpha 128 aplicado tanto al experto de comprensión como al de generación. El ajuste se realiza con GRPO (Group Relative Policy Optimization) usando recompensas simples: instrucciones más estrictas de progreso visual, una penalización por copias casi idénticas medida como cambio de píxeles y una penalización de formato en las etiquetas de respuesta. El entrenamiento continúa el checkpoint simple-v2 (step 1537, cursor de 1.980 ejemplos) y no reinicia desde el modelo base público.

El segmento principal documentado, `zebra_v3_n6_10k_4node_20261025`, se ejecutó en 4 GPUs de política y 4 GPUs dedicadas de juez (Qwen2.5-VL-72B-AWQ) sobre NVIDIA A100 en CINECA Leonardo, con 6 rollouts por prompt, resolución de 512 px, 50 pasos de difusión y 6 candidatos. El checkpoint más reciente es `checkpoint-timebudget-1934`, con 2.572 ejemplos representados, 21,419 horas de procesamiento de prompts y una ventana de 23,324 horas. El dataset principal de 10k ejemplos cubre 13 categorías: búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices estilo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. La revisión del modelo base registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes.
- Razonamiento visual con cadenas de pensamiento intercaladas (Zebra-CoT): pasos visuales y textuales alternados.
- Resolución de tareas de búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices estilo Raven y ARC-AGI.
- Razonamiento en dominios científicos y formales: física, geometría, química, algoritmos de grafos y programación competitiva.
- Generación de imágenes intermedias como parte de la cadena de razonamiento (el modelo base BAGEL soporta generación visual).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento visual multi-paso dentro de una misma respuesta.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking explícito: no disponible como capacidad separada; el razonamiento se emite como cadena visual-texto intercalada.

## Casos de uso

- Investigación en razonamiento visual: reproducir y extender los experimentos de GRPO sobre BAGEL usando los checkpoints y metadatos de entrenamiento publicados, incluidos cursores de datos y configuraciones exactas por checkpoint.
- Evaluación de recompensas para RL multimodal: comparar el efecto de penalizaciones de copia casi idéntica y de formato sobre la calidad de las cadenas de razonamiento visual en tareas tipo ARC-AGI o matrices de Raven.
- Benchmarking de cadenas de pensamiento intercaladas: usar los checkpoints como línea base para medir si el modelo genera pasos visuales genuinos frente a copias triviales de la imagen de entrada.
- Estudio de colapso de respuestas: analizar los fallos de juez por respuesta vacía documentados por el autor y las puntuaciones corregidas en held-out, útil para diseñar evaluadores más robustos.
- Prototipado de tutores visuales de matemáticas y geometría: el modelo puede descomponer problemas geométricos o de física en pasos intercalados de imagen y texto, aunque solo en inglés y en fase de investigación.
- Docencia e investigación sobre entrenamiento distribuido: el historial de asignación Slurm y las horas de procesamiento de prompts sirven como referencia para planificar presupuestos de cómputo en GRPO multimodal con GPUs A100.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con puntuaciones almacenadas (no reejecutadas) para el run `zebra_v3_n6_10k_4node_20261025`. La información proporcionada se corta en la fila de la tabla (step/update 17), por lo que el número de preguntas, aciertos y precisión no están disponibles en el texto recibido. El autor indica que las puntuaciones corregidas del 27 de octubre marcan las respuestas vacías como incorrectas y que las puntuaciones originales permanecen en el JSON para auditoría, y advierte que no deben agruparse evaluaciones de distinto tamaño ni protocolos de recompensa distintos en una media global.

| Run de evaluación | Step / update | Preguntas | Correctas | Precisión | Scoring |
|---|---:|---:|---:|---:|---|
| `zebra_v3_n6_10k_4node_20261025` | 17 | no disponible | no disponible | no disponible | corregido (respuestas vacías = incorrectas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo pesos LoRA (9,0 GB), por lo que es imprescindible descargar el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` (familia Bagel-7B) para la inferencia.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base BAGEL y de la resolución de imagen y pasos de difusión usados.
- GPU recomendadas: el entrenamiento documentado usó NVIDIA A100 en CINECA Leonardo (4 GPUs de política y 4 de juez por nodo). Para inferencia se espera que A100 o H100 sean adecuadas, pero no hay mediciones publicadas.
- ¿Cabe en GPU consumer? no disponible; no se han publicado pruebas en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no disponible; los checkpoints son diccionarios de pesos entrenables en formato original de BAGEL, no exportaciones PEFT estándar, por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Simple-v3 (este) | no disponible (LoRA sobre Bagel-7B) | no disponible | Checkpoints LoRA de investigación con GRPO | apache-2.0 | Hugging Face, requiere modelo base |
| Bagel-Zebra-CoT (modelo base) | familia Bagel-7B | no disponible | Modelo multimodal afinado con SFT sobre Zebra-CoT | no disponible | Hugging Face (`multimodal-reasoning-lab/Bagel-Zebra-CoT`) |
| BAGEL-7B original | 7B | no disponible | Modelo multimodal (comprensión y generación) | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (por ejemplo, otros modelos multimodales de razonamiento visual de 7B) no está disponible en la información proporcionada. El propio paper de Zebra-CoT (arXiv 2507.16746) señala que el fine-tuning de Bagel-7B sobre el dataset produce cadenas de razonamiento visual intercaladas de alta calidad, lo que sitúa a este checkpoint como una variante de RL del mismo linaje.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` y no es una exportación PEFT estándar, lo que complica su integración en pipelines convencionales.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Fallos de juez por respuesta vacía descubiertos a posteriori: las puntuaciones originales pueden sobreestimar el rendimiento y las corregidas marcan esas respuestas como incorrectas.
- Exposición a SFT público y solapamiento semántico con benchmarks no descartados, según el propio autor; riesgo de contaminación en las evaluaciones.
- No se han publicado benchmarks estándar ni mediciones de latencia, throughput o VRAM.
- Es un archivo de experimentos que preserva variantes e intermedios, no el mejor checkpoint seleccionado por held-out; los intentos fallidos sin pesos guardados no se pueden reconstruir.
- Riesgo de alucinación y de sesgos: no documentado en la información proporcionada; al ser un modelo de investigación sin evaluación de seguridad publicada, no se recomienda su uso en producción sin auditoría previa.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero el modelo base puede tener condiciones propias que deben verificarse antes de desplegar.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v3-20261025
- Perfil del autor: https://huggingface.co/denizakkoc
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Paper Zebra-CoT (arXiv 2507.16746): https://paperswithcode.co/paper/2507.16746
