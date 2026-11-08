# denizakkoc/BAGEL-ZebraCoT-GRPO-Absolute-v4-Pilot-20261018

## Resumen

BAGEL-ZebraCoT-GRPO-Absolute-v4-Pilot-20261018 es un checkpoint de investigación publicado por el usuario denizakkoc en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos entrenables (adaptadores LoRA de rango 64 y alpha 128) aplicados sobre el modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`, que a su vez es una variante de BAGEL orientada al razonamiento visual con cadenas de pensamiento (Zebra-CoT). El checkpoint se obtuvo mediante GRPO (Group Relative Policy Optimization) sobre un conjunto de datos de razonamiento multimodal de 10.000 ejemplos distribuidos en 13 categorías.

El objetivo del experimento es mejorar el "absolute grounding" (localización absoluta de objetos o regiones en imágenes) mediante un juez estructurado de múltiples pasadas. Según la model card, este juez fallaba con frecuencia ante respuestas mal formadas, por lo que solo se conserva un único checkpoint superviviente de tipo "pilot" (paso 4, cuatro pasos de imagen). Es, por tanto, un artefacto de investigación con valor de trazabilidad, no un modelo listo para producción.

La relevancia actual es limitada: cero descargas, cero likes, licencia Apache 2.0, solo inglés y un tamaño de repositorio de 1,3 GB que contiene pesos de adaptador, no un modelo fusionado. Resulta útil para reproducir el linaje experimental del autor y para estudiar configuraciones de GRPO con LoRA en modelos multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre BAGEL multimodal (entendimiento y generación adaptados) |
| Parámetros totales | no disponible (depende del modelo base Bagel-Zebra-CoT) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos entrenables personalizados (state dict de BAGEL), no safetensors estándar ni export PEFT `save_pretrained`; incluye `checkpoint_manifest.json` y `training_metadata.json` |

Otros datos técnicos: rango LoRA 64, alpha 128, revisión del base registrada `ebce32410ee2062d073feae484ea2c6c1515fba8`, tamaño del repo 1,3 GB, un único checkpoint superviviente (`checkpoint-step-4`).

## Arquitectura y entrenamiento

El modelo parte de BAGEL, un transformer multimodal que combina un experto de entendimiento y un experto de generación; ambos se adaptan con LoRA en este experimento. El entrenamiento usa GRPO con seis rollouts por prompt, 512 px de resolución, 50 pasos de difusión y seis candidatos por prompt en la configuración de octubre (la model card advierte explícitamente de no confundirla con las configuraciones de septiembre, que usaban 256 px, ocho pasos de difusión y dos candidatos). La familia de recompensa es "absolute-grounding v4", distinta de la familia "simple v4" de octubre.

El conjunto de datos principal contiene 10.000 ejemplos en 13 categorías: búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. El hash de membresía/orden del dataset original es `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`. El entrenamiento se ejecutó en NVIDIA A100 sobre el clúster CINECA Leonardo: ocho GPU de política y ocho GPU de juez dedicadas (Qwen2.5-VL-72B-AWQ como modelo de recompensa congelado). El segmento registrado abarca del 2026-10-18T08:56:38Z al 2026-10-18T09:44:49Z, con 0,580 horas de procesamiento de prompts y una ventana transcurrida de 0,803 horas, representando 8 ejemplos del cursor de entrenamiento. No se descarta exposición previa a SFT público ni solapamiento semántico con benchmarks.

## Capacidades

- Razonamiento visual multimodal sobre imágenes y texto, heredado del modelo base Bagel-Zebra-CoT.
- Cadena de pensamiento visual (Zebra-CoT) para tareas de grounding y razonamiento paso a paso.
- Grounding absoluto de regiones u objetos (objetivo declarado del experimento).
- Adaptación tanto del experto de entendimiento como del experto de generación.
- Entrenamiento con GRPO para optimizar recompensas estructuradas de múltiples pasadas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible más allá del razonamiento visual.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo "thinking" explícito, visión o audio adicionales: no disponible.

## Casos de uso

- Investigación en RL para modelos multimodales: sirve como checkpoint de referencia para reproducir el linaje GRPO con LoRA sobre BAGEL y comparar familias de recompensa (absolute-grounding v4 frente a simple v4).
- Estudio de robustez de jueces estructurados: la model card documenta fallos frecuentes del juez multi-pasada ante respuestas mal formadas, lo que permite analizar modos de fallo en pipelines de recompensa.
- Experimentos de grounding visual absoluto: útil para evaluar la capacidad de localizar regiones concretas en imágenes dentro de tareas de razonamiento visual.
- Auditoría de procedencia y trazabilidad: los ficheros `checkpoint_manifest.json` y `training_metadata.json` permiten reconstruir configuraciones, cursores y checksums SHA-256 para trabajos de reproducibilidad.
- Base para fine-tuning posterior: al ser un adaptador LoRA sobre Bagel-Zebra-CoT, puede combinarse con otros adaptadores o servir de inicialización en experimentos de razonamiento visual.
- Docencia y divulgación técnica: ejemplo real de configuración GRPO con separación de GPU de política y GPU de juez, útil para explicar infraestructuras de RL multimodal.
- Benchmarking interno de tareas ARC-AGI, Raven o ajedrez visual: el dataset de entrenamiento cubre esas categorías, por lo que el checkpoint puede emplearse como punto de partida en evaluaciones controladas.

## Benchmarks y rendimiento

La model card incluye una evaluación almacenada (no re-ejecutada) del propio run:

| Run de evaluación | Paso / update | Preguntas | Correctas | Precisión | Scoring |
|---|---:|---:|---:|---:|---|
| `zebra_general_v4_n6_10k_16gpu_20261018_r1` | 0 | 32 | 6 | 18,75% | Original |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Las puntuaciones de octubre corregidas (respuestas vacías marcadas como incorrectas) tienen prioridad donde estén disponibles, pero no se aportan en el extracto.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador aislado; depende del modelo base Bagel-Zebra-CoT, que no se detalla en la información. El repo ocupa 1,3 GB, lo que corresponde a los pesos LoRA, no al modelo completo.
- GPU recomendadas: el entrenamiento documentado usó NVIDIA A100 en CINECA Leonardo (8 GPU de política y 8 de juez). Para inferencia se requiere cargar el modelo base completo, cuyas necesidades no se especifican.
- GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño del base.
- Despliegue: no se documentan opciones vLLM, llama.cpp, Ollama ni TGI. Al ser pesos personalizados (no export PEFT estándar), requiere el código y la revisión del base BAGEL indicados en la model card.
- Latencia y throughput: no disponibles. El único dato temporal es 0,580 horas de procesamiento de prompts para 8 ejemplos representados en el segmento registrado, no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Absolute-v4-Pilot-20261018 (este) | no disponible (LoRA sobre Bagel-Zebra-CoT) | no disponible | 18,75% en 32 preguntas (eval almacenada) | Apache 2.0 | Hugging Face, 0 descargas |
| denizakkoc/BAGEL-GRPO-Dice-AccuracyOnly-Epochs5-10 | no disponible (LoRA sobre BAGEL) | no disponible | no disponible | no disponible en la información | Hugging Face |
| multimodal-reasoning-lab/Bagel-Zebra-CoT (base) | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (modelos multimodales de razonamiento visual de tamaño similar). La comparativa con otros checkpoints del mismo autor es la única referencia disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base `multimodal-reasoning-lab/Bagel-Zebra-CoT` en la revisión `ebce32410ee2062d073feae484ea2c6c1515fba8` y código personalizado; no funciona como un `save_pretrained` PEFT estándar.
- Solo se conserva un checkpoint superviviente (`checkpoint-step-4`, cuatro pasos de imagen); los intentos fallidos sin pesos guardados no pueden reconstruirse.
- El juez estructurado multi-pasada fallaba con frecuencia ante respuestas mal formadas, lo que compromete la calidad de la señal de recompensa y, por extensión, del adaptador resultante.
- Precisión muy baja en la única evaluación publicada: 18,75% sobre 32 preguntas, con protocolo de scoring original y posible corrección posterior no incluida.
- Riesgo de alucinación y de respuestas vacías o mal formadas: la propia model card menciona que las respuestas vacías se marcan como incorrectas en la corrección de octubre.
- Idiomas: únicamente inglés según la etiqueta del repositorio.
- Sesgos: no documentados en la información disponible; el dataset cubre tareas sintéticas y de razonamiento, no diálogo abierto.
- Exposición previa a SFT público y solapamiento semántico con benchmarks no descartados, lo que puede inflar métricas en evaluaciones no controladas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base puede tener condiciones distintas que no se detallan aquí; verificar antes de producción.
- Cero descargas y cero likes: sin validación comunitaria; no apto para producción sin evaluación propia.
- Metadatos incompletos: no hay asignación Slurm inequívoca, ni pipeline declarado, ni especificaciones del base (parámetros, contexto, cuantizaciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Absolute-v4-Pilot-20261018
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Perfil del autor: https://huggingface.co/denizakkoc
- Otro checkpoint del autor: https://huggingface.co/denizakkoc/BAGEL-GRPO-Dice-AccuracyOnly-Epochs5-10
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
