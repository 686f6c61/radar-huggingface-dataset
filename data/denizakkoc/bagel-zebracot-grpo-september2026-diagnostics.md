# denizakkoc/BAGEL-ZebraCoT-GRPO-September2026-Diagnostics

## Resumen

BAGEL-ZebraCoT-GRPO-September2026-Diagnostics es un archivo público de checkpoints de investigación derivados del modelo base multimodal-reasoning-lab/Bagel-Zebra-CoT, que a su vez es un ajuste fino de BAGEL-7B sobre el dataset Zebra-CoT. El autor, denizakkoc, publica aquí los pesos entrenables resultantes de una serie de experimentos de ajuste con GRPO (Group Relative Policy Optimization) y LoRA de rango 64 sobre dicho modelo base, centrados en razonamiento visual encadenado (chain-of-thought intercalado con imágenes). No se trata de un modelo autónomo, sino de un conjunto de 17 checkpoints intermedios y variantes de experimento que requieren el modelo base para poder ejecutarse.

El interés de esta publicación es fundamentalmente metodológico: documenta con detalle la procedencia de cada checkpoint (semillas, prompts estándar frente a concisos, dos o cuatro candidatos por prompt, ensayos con y sin crédito de proceso, pruebas de estrés de gradientes) en lugar de seleccionar únicamente el mejor resultado en validación. El repositorio ocupa 22 GB y está bajo licencia Apache 2.0, con fecha de creación en noviembre de 2026 y cero descargas, lo que lo sitúa como material de archivo para reproducibilidad de investigación más que como artefacto listo para producción.

La relevancia actual radica en su vínculo con Zebra-CoT, un dataset y línea de trabajo presentados en ICLR 2026 y en arXiv (2507.16746) que demuestra mejoras de hasta +12 % en precisión de test y +13 % en benchmarks VLM estándar al ajustar Bagel-7B para generar cadenas de razonamiento visual intercaladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64, alpha 128) sobre el modelo base multimodal BAGEL-7B; se adaptan los expertos de comprensión y de generación |
| Parametros totales | No disponible (el checkpoint contiene solo pesos entrenables LoRA; el modelo base es Bagel-7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Estado de diccionario de pesos entrenables propio de BAGEL (custom code); no son exportaciones PEFT `save_pretrained` ni modelos fusionados; se excluyen ficheros de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo base es Bagel-7B, un modelo multimodal de la familia BAGEL (comprensión y generación de imágenes y texto), ajustado sobre Zebra-CoT para producir cadenas de razonamiento visual intercaladas. Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128 que afectan tanto al experto de comprensión como al de generación. El entrenamiento de estos checkpoints emplea GRPO con un juez congelado (Qwen2.5-VL-72B-AWQ en la GPU dedicada de los experimentos de octubre; recursos compartidos en los de septiembre) y un reward por pares revisado en la versión `experiment_v2` del arnés experimental.

Los experimentos documentados cubren ocho sondas de 16 ejemplos que cruzan prompts estándar y concisos, dos y cuatro candidatos por prompt, y las semillas 9252026 y 9252027; cuatro ensayos "guarded" de 512 ejemplos (estándar, conciso, solo precisión y cuatro candidatos) con contrabalanceo del orden de candidatos, crédito de proceso condicionado a la corrección y calificación exacta de rejillas ARC; y pruebas pequeñas de estabilidad y estrés de gradientes. Todo el cómputo se realizó en GPUs NVIDIA A100 de CINECA Leonardo, con ventanas de ejecución que van desde los 0,1 hasta los 2,8 horas por segmento y una exposición máxima de 512 ejemplos en los ensayos guarded. La revisión del modelo base registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`.

## Capacidades

- Razonamiento visual multimodal con cadenas de pensamiento intercaladas (texto e imágenes generadas como pasos intermedios).
- Comprensión de imágenes y generación de imágenes dentro del mismo modelo (expertos de comprensión y generación adaptados por separado).
- Razonamiento sobre rejillas ARC y tareas de tipo puzzle visual, con calificación exacta en los ensayos de entrenamiento.
- Generación de texto en inglés.
- Ajuste orientado a GRPO con reward por pares y crédito de proceso, lo que sugiere capacidad de producir soluciones verificables paso a paso.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües: no disponibles más allá del inglés.

## Casos de uso

- Investigación en razonamiento visual encadenado: usar los checkpoints como punto de partida reproducible para comparar variantes de GRPO (prompts estándar frente a concisos, dos frente a cuatro candidatos) sobre el mismo modelo base y dataset.
- Reproducción de experimentos de RLHF/RL con verificación: los manifiestos `checkpoint_manifest.json` y `training_metadata.json` permiten reconstruir cursores de entrenamiento, fechas, semillas y checksums SHA-256 para auditar resultados.
- Estudio de estabilidad de entrenamiento con LoRA: los checkpoints `distributed_stress`, `stability_v2`, `stress8` y `learning_probe8` sirven para analizar comportamiento de gradientes y convergencia en configuraciones de 8 GPUs.
- Evaluación de jueces automáticos: los ensayos guarded con juez Qwen2.5-VL-72B-AWQ y reward por pares permiten estudiar sesgos de orden de candidatos y de gating por corrección.
- Desarrollo de sistemas de resolución de puzzles visuales tipo ARC: el modelo base ajustado con Zebra-CoT está orientado a generar razonamiento intercalado verificable, útil para prototipar solvers con trazas auditables.
- Base para ajustes posteriores: al ser adaptadores LoRA sobre Bagel-7B, pueden combinarse o compararse con otros adaptadores del mismo modelo base en pipelines de investigación multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para estos checkpoints concretos. La información del dataset Zebra-CoT sí reporta, a nivel de modelo base, una mejora de +12 % en precisión de test y hasta +13 % en benchmarks VLM estándar al ajustar Bagel-7B, pero no se ofrecen cifras desglosadas por benchmark para esta publicación.

## Requisitos de hardware

- El repositorio contiene solo pesos LoRA (22 GB en total, 17 checkpoints); para inferencia se requiere además el modelo base Bagel-7B completo.
- VRAM estimada: no disponible de forma específica; dependerá del modelo base Bagel-7B y de la cuantización elegida, dato no documentado.
- GPUs empleadas en entrenamiento: NVIDIA A100 en CINECA Leonardo, con configuraciones de 1, 4 y 8 GPUs de política y GPUs de juez dedicadas o compartidas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; al usar código propio de BAGEL y no ser exportaciones PEFT estándar, la carga requiere el harness del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-September2026-Diagnostics | LoRA sobre Bagel-7B | No disponible | Razonamiento visual con CoT intercalado + GRPO | Apache 2.0 | Hugging Face (0 descargas) |
| Bagel-Zebra-CoT (modelo base) | 7B | No disponible | Razonamiento visual con CoT intercalado | No disponible en la información | Hugging Face |
| Anole-7B ajustado con Zebra-CoT | 7B | No disponible | Razonamiento visual con CoT intercalado | No disponible en la información | Referenciado en el paper Zebra-CoT |

## Limitaciones y advertencias

- No es un modelo autónomo: son checkpoints de pesos entrenables que requieren el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` y código propio; no funcionan como exportación PEFT estándar.
- Solo inglés: la model card declara únicamente `en`, sin evidencia de capacidades multilingües.
- Origen experimental: los propios autores indican que preservan variantes e intermedios, incluidos intentos fallidos, y que los fallos sin pesos guardados no pueden reconstruirse; no debe interpretarse como un modelo optimizado para producción.
- Exposición de datos muy limitada: los ensayos guarded usan 512 ejemplos y las sondas 16 u 8, por lo que el riesgo de sobreajuste y de generalización pobre es alto.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base es generativo multimodal y no se documentan métricas de fidelidad.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y del dataset debe verificarse por separado antes de cualquier despliegue.
- Sin métricas de benchmarks ni de latencia publicadas para estos checkpoints; cero descargas y cero likes, sin validación externa conocida.
- Los recursos de juez en los experimentos de septiembre fueron compartidos, por lo que las condiciones de entrenamiento no son directamente comparables entre variantes.

## Enlaces

- Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-September2026-Diagnostics
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Paper Zebra-CoT (arXiv): https://arxiv.org/abs/2507.16746
- Ficha ICLR 2026: https://mlanthology.org/iclr/2026/li2026iclr-zebracot/
