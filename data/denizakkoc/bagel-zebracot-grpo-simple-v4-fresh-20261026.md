# denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v4-Fresh-20261026

## Resumen

BAGEL-ZebraCoT-GRPO-Simple-v4-Fresh-20261026 es un conjunto de checkpoints de adaptadores LoRA entrenados sobre el modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`, a su vez derivado de BAGEL-7B y afinado con el dataset Zebra-CoT para razonamiento visual encadenado (chain-of-thought intercalado texto-imagen). El autor, `denizakkoc`, publica este archivo como material de investigación reproducible: cinco checkpoints supervivientes de una ejecución de GRPO (Group Relative Policy Optimization) realizada el 26 y 27 de octubre de 2026 en 16 GPU NVIDIA A100 del clúster CINECA Leonardo.

El interés del artefacto no está en ser un modelo listo para producción, sino en documentar con detalle inusual (manifiesto de checkpoints, checksums SHA-256, cursores de datos, configuración de recompensas, historial de asignación Slurm) un experimento de RL sobre un modelo multimodal generador de imágenes y texto. La variante "v4 fresh" introduce un juez visual que evalúa la coherencia entre el texto razonado y hasta cuatro imágenes de referencia, penaliza copias cosméticas y mantiene las penalizaciones por etiquetas de respuesta.

Se trata de pesos de adaptador en formato de diccionario de estado original de BAGEL (no exportaciones PEFT `save_pretrained` ni modelos fusionados), con rango LoRA 64 y alpha 128 aplicados tanto al experto de comprensión como al de generación. El repositorio ocupa 6,5 GB y requiere descargar el modelo base por separado para poder utilizarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=64, alpha=128) sobre BAGEL multimodal (experto de comprensión y de generación adaptados); arquitectura del base no detallada en la información disponible |
| Parametros totales | No disponible (el repositorio contiene solo pesos de adaptador; tamaño del base BAGEL-7B según el paper de Zebra-CoT) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se publican en precisión de entrenamiento; el juez usado fue Qwen2.5-VL-72B-AWQ, cuantizado AWQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Diccionario de estado original de BAGEL (custom adapter / trainable-weight checkpoints); no es GGUF ni safetensors PEFT estándar |

## Arquitectura y entrenamiento

El modelo base es BAGEL-ZebraCoT, una adaptación de BAGEL-7B entrenada con el dataset Zebra-CoT para generar cadenas de razonamiento visual intercaladas (texto e imágenes generadas). Sobre esa base, este repositorio aplica LoRA de rango 64 y alpha 128 a los dos expertos (comprensión y generación) y entrena con GRPO: 8 GPU de política ejecutan el modelo entrenable y 8 GPU de juez ejecutan modelos de recompensa congelados. La ejecución `zebra_v4_fresh_16gpu_20261026` arrancó el 2026-10-26 a las 23:41 UTC y guardó su último checkpoint (`checkpoint-timebudget-222`) el 2026-10-27 a las 14:03 UTC, con 13,806 horas de procesamiento de prompts y una ventana transcurrida de 14,375 horas. El cursor de datos guardado representa 568 ejemplos con 6 rollouts por prompt.

La configuración de octubre usa resolución de 512 px, 50 pasos de difusión y 6 candidatos por prompt, frente a los 256 px, 8 pasos y 2 candidatos de las ejecuciones pequeñas de septiembre; estas configuraciones no deben confundirse. Respecto a la variante v3, el juez visual recibe hasta cuatro imágenes de razonamiento de referencia y evalúa la concordancia texto-imagen, limita las copias sin cambios o cosméticas y elimina el multiplicador explícito de copia de píxeles de v3, aunque sigue registrando las fracciones de copia. Se mantienen las penalizaciones por etiquetas de respuesta. El dataset principal de 10k ejemplos cubre 13 categorías: búsqueda visual, puzles, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva.

## Capacidades

- Razonamiento visual encadenado: genera cadenas de razonamiento intercalando texto e imágenes, capacidad heredada del base Zebra-CoT.
- Comprensión de imágenes: el experto de comprensión está adaptado con LoRA, por lo que procesa entradas visuales además de texto.
- Generación de imágenes: el experto de generación también está adaptado; el entrenamiento usa pasos de difusión (50 en esta ejecución).
- Resolución de tareas visuales estructuradas: puzles, laberintos, matrices de Raven, ARC-AGI, ajedrez, tetris y búsqueda visual, según las categorías del dataset.
- Razonamiento matemático y científico aplicado a imágenes: física, geometría y química figuran en el conjunto de entrenamiento.
- Programación competitiva y algoritmos de grafos: presentes como categorías del dataset de entrenamiento.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Investigación en RL para modelos multimodales: el repositorio sirve como referencia reproducible de un pipeline GRPO con juez visual separado, incluyendo manifiesto de checkpoints, checksums y configuración de recompensas, útil para replicar o auditar el experimento.
- Estudio de recompensas basadas en modelos jueces: la variante v4 documenta cómo un juez visual con hasta cuatro imágenes de referencia y penalización de copias cosméticas cambia el comportamiento del policy; sirve para comparar protocolos de recompensa frente a v3.
- Evaluación de razonamiento visual encadenado: los checkpoints permiten medir la calidad de cadenas texto-imagen en tareas como matrices de Raven, ARC-AGI o laberintos, usando el dataset Zebra-CoT como referencia.
- Análisis de estabilidad de entrenamiento: al conservar variantes intermedias y fallidas con metadatos, permite estudiar curvas de aprendizaje, cursores de datos y efectos de reanudaciones u OOM.
- Generación de explicaciones visuales paso a paso: en un entorno de investigación, el modelo puede producir una traza de razonamiento con imágenes intermedias para tareas de geometría o física, revisable por un humano.
- Base para experimentos de ajuste fino posteriores: al ser adaptadores LoRA sobre un base público, otros grupos pueden continuar el entrenamiento o combinarlos con sus propios datos sin partir de cero.
- Docencia y divulgación técnica: el historial de asignación Slurm, las fechas y las configuraciones permiten explicar con datos reales el coste y la organización de un entrenamiento RL multimodal a escala de 16 GPU.

## Benchmarks y rendimiento

La model card menciona una tabla de evaluación con puntuaciones almacenadas (no reejecutadas), indicando que las puntuaciones corregidas del 27 de octubre prevalecen y que las respuestas vacías se marcan como incorrectas. Sin embargo, los valores numéricos de precisión no están incluidos en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo adaptadores (6,5 GB); es imprescindible descargar el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` (BAGEL-7B según el paper) para la inferencia.
- VRAM estimada: no disponible de forma explícita; para un base de 7B en precisión de entrenamiento se requiere aproximadamente 14-16 GB solo para pesos, más memoria para el adaptador, el codificador visual y los pasos de difusión, por lo que en la práctica se recomienda al menos 24-40 GB.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA A100 (16 GPU: 8 de política y 8 de juez con Qwen2.5-VL-72B-AWQ). Para inferencia, A100 o H100 son las opciones seguras; una RTX 4090 (24 GB) podría ser insuficiente para el pipeline completo de generación con 50 pasos de difusión.
- Cabe en GPU de consumo: no confirmado; probablemente solo con cuantización agresiva y recortando pasos de difusión, algo no documentado en la información disponible.
- Opciones de despliegue: no disponible; al ser checkpoints de pesos personalizados (no PEFT estándar), requieren el código de BAGEL y el cargador específico del repositorio. vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles. Como referencia, el entrenamiento usó 50 pasos de difusión por generación, lo que implica una latencia de generación de imagen notablemente superior a un modelo solo-texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Simple-v4 (este) | Adaptadores LoRA sobre BAGEL-7B | No disponible | Razonamiento visual CoT con RL (GRPO) | Apache 2.0 | Checkpoints de investigación, 0 descargas |
| Bagel-Zebra-CoT (base) | 7B (según paper) | No disponible | Razonamiento visual CoT por SFT | No disponible en la información | Público en Hugging Face |
| BAGEL-7B original | 7B | No disponible | Modelo multimodal generativo (texto e imagen) | No disponible en la información | Público |
| Qwen2.5-VL-72B-AWQ (juez) | 72B | No disponible | Modelo visión-lenguaje usado como juez de recompensa | No disponible en la información | Público, cuantizado AWQ |

La comparación directa de rendimiento no es posible porque la información proporcionada no incluye las puntuaciones numéricas de la tabla de evaluación.

## Limitaciones y advertencias

- No es un modelo autónomo: son pesos de adaptador que requieren el base `multimodal-reasoning-lab/Bagel-Zebra-CoT` y código de carga específico; no funcionan con cargadores PEFT estándar.
- Estado de investigación: 0 descargas y 0 likes en el momento de la consulta; no hay validación externa ni uso en producción documentado.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; no se documentan mitigaciones específicas más allá del juez de recompensa durante el entrenamiento.
- Sesgos: no documentados en la información disponible; el dataset Zebra-CoT y el base BAGEL pueden arrastrar sesgos de sus datos de origen.
- Solapamiento con benchmarks: la propia model card advierte que no se ha descartado la exposición SFT pública ni el solapamiento semántico con benchmarks, lo que puede inflar las puntuaciones.
- Evaluaciones no reejecutadas: las puntuaciones almacenadas pueden preceder al cursor final de entrenamiento y las respuestas vacías se marcan como incorrectas solo en las correcciones del 27 de octubre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas aquí; conviene verificar antes de un despliegue comercial.
- Coste de inferencia: los 50 pasos de difusión por generación implican latencia alta, poco adecuada para aplicaciones interactivas en tiempo real.
- Checkpoints incompletos: solo sobreviven 5 archivos; los intentos fallidos sin pesos guardados no se pueden reconstruir, lo que limita la reproducibilidad exacta del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v4-Fresh-20261026
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Repositorio GitHub de Bagel-Zebra-CoT: https://github.com/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Paper Zebra-CoT: A Dataset for Interleaved Vision Language Reasoning: https://arxiv.org/abs/2507.16746
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
