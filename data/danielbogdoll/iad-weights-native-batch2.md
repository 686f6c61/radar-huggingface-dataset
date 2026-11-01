# danielbogdoll/iad-weights-native-batch2

## Resumen

`danielbogdoll/iad-weights-native-batch2` no es un modelo de lenguaje, sino un repositorio de pesos y artefactos de entrenamiento para segmentación semántica y detección de anomalías en imágenes. Lo publica el usuario danielbogdoll bajo licencia MIT y contiene los resultados del lote 2 de entrenamientos de la ruta "native-instance" (run `native_batch2_20261007`), con variantes UNO y cabezas de instancia residuales. El repositorio ocupa 91,9 GB y agrupa 165 ficheros repartidos en 45 carpetas, cada una con su `config.yaml` de Detectron2 y/o su manifiesto de ejecución.

El contenido son checkpoints de Detectron2 entrenados sobre Cityscapes con backbone Swin y scripts propios (`train_residual.py`, `mask_refiner.py`), no un modelo listo para inferencia con una API estándar. La nomenclatura de las carpetas (`b2_fix`, `b2_obj`, `b2_road`, `b2_sam3obj`, `uno_pan_mv_sam3`, etc.) sugiere experimentos con distintas estrategias de refinamiento de máscaras, destilación, fusión con DINO y combinaciones con SAM3.

Su relevancia es acotada: es material de investigación reproducible (incluye `index.json` con tamaños y hashes SHA-256 y un comando de restauración), útil para quien quiera replicar o auditar los experimentos, pero sin model card descriptiva, sin benchmarks publicados y sin idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectron2 con backbone Swin (configuraciones de segmentación semántica sobre Cityscapes); variantes UNO y cabezas de instancia residuales |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints de Detectron2 (`.pth`) y ficheros de configuración `config.yaml`; no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de entrenamientos de segmentación semántica con Detectron2 sobre el dataset Cityscapes, usando un backbone Swin. Los comandos registrados apuntan a un script `train_residual.py` con configuraciones bajo `configs/cityscapes/semantic-segmentation/swin/native_b2/`, ejecutados con `--num-gpus 1` y reanudación desde una semilla (`--resume SEED 1`). Las carpetas con 11 checkpoints (`b2_fix`, `b2_obj`, `b2_r2`, `b2_road`, `b2_sam3obj`, `b2_seed`, `b2_tap`) corresponden a runs con múltiples épocas o snapshots; el resto contiene un único checkpoint.

No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF/DPO (no aplicable en este dominio). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal; los nombres de las configuraciones (`d1_safe_distill`, `dino_fuse`, `sam3_lr3x_mp`, `seam_blur1`, `hires_lr3x_mp`, `pan_mv_it12k`, `w6_frozen`/`w6_tuned`) sugieren experimentos con destilación, fusión de features DINO, ajuste fino con SAM3, aumento de resolución y ajuste de capas congeladas, pero no hay documentación que lo confirme.

## Capacidades

- Segmentación semántica de imágenes urbanas (Cityscapes) mediante Detectron2.
- Detección y segmentación de anomalías (tag `anomaly-segmentation`), orientada a identificar regiones fuera de la distribución entrenada.
- Refinamiento de máscaras mediante el script `mask_refiner.py` (carpeta `refiner`).
- Variantes con cabezas de instancia residuales y configuraciones UNO.
- Experimentos de fusión con DINO (`dino_fuse`, `dino_fuse_cnx`, `dino_fuse_lr10`).
- Experimentos con SAM3 (`sam3_lr3x`, `sam3_lr3x_mp`, `sam3_lr3x_mp20`, `sam3_lr3x_mp_it12k`, `sam3_lr3x_mp_road09`, `sam3_lr6x`).
- No se documentan capacidades de generación de texto, tool calling, agentes, multilingüismo, visión-lenguaje, audio ni modo "thinking".

## Casos de uso

- Reproducción de experimentos de segmentación semántica en Cityscapes: restaurar el repositorio con `uv run python scripts/ops/backup_weights.py pull --only native-batch2` y ejecutar las configuraciones de Detectron2 incluidas para comparar variantes (`b2_fix`, `b2_obj`, `b2_road`, etc.).
- Investigación en detección de anomalías en escenas urbanas: usar los checkpoints etiquetados `anomaly-segmentation` para evaluar la capacidad de identificar objetos o regiones no vistas durante el entrenamiento.
- Auditoría de pipelines de entrenamiento: el `index.json` con tamaños y SHA-256 permite verificar la integridad de los pesos y reconstruir el historial de runs (`native_batch2_20261007`) con comandos y commits.
- Estudio de destilación y ajuste fino: las carpetas `d1_safe_distill`, `w6_frozen` y `w6_tuned` permiten comparar estrategias de congelación y destilación sobre un mismo backbone Swin.
- Evaluación de fusión multimodal de features: las variantes `dino_fuse*` y `sam3_*` sirven para analizar el impacto de combinar representaciones de DINO y SAM3 en tareas de segmentación.
- Desarrollo de sistemas de percepción para conducción autónoma en investigación: los modelos entrenados en Cityscapes pueden integrarse como módulo de segmentación en prototipos, siempre que se respete la licencia MIT y se validen en el dominio objetivo.
- Refinamiento de máscaras en post-proceso: el script `mask_refiner.py` y sus dos checkpoints permiten estudiar la mejora de bordes y la reducción de falsos positivos en máscaras segmentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 91,9 GB, pero corresponde al conjunto completo de checkpoints, no al peso de un único modelo.
- GPU recomendadas: no disponible. Los entrenamientos se ejecutaron con `--num-gpus 1`, lo que sugiere que cada configuración cabe en una sola GPU, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible; depende del backbone Swin concreto y de la resolución de entrada, datos no publicados.
- Opciones de despliegue: Detectron2 (framework nativo de los checkpoints). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `danielbogdoll/iad-weights-native-batch2` | Checkpoints Detectron2 (Swin) para segmentación/anomalías | no disponible | no aplica | MIT | HuggingFace (repo de 91,9 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se puede establecer una comparativa fiable sin datos de benchmarks ni de arquitectura completos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento multi-paso; cualquier uso en esos dominios sería un error de categoría.
- Ausencia de model card descriptiva: no hay información sobre dataset exacto, métricas, hiperparámetros completos ni metodología de evaluación.
- Sin benchmarks publicados: no se puede afirmar su rendimiento relativo frente a otros modelos de segmentación.
- Sesgos potenciales derivados del dominio de entrenamiento (Cityscapes, escenas urbanas centroeuropeas); el rendimiento puede degradarse en otros entornos geográficos o condiciones de iluminación.
- Riesgo de sobreajuste a las clases y anotaciones de Cityscapes; las etiquetas de anomalía dependen de la definición empleada en los experimentos, no documentada.
- Licencia MIT permite uso comercial, pero al tratarse de pesos de investigación sin garantías, se recomienda validación exhaustiva antes de producción.
- El repositorio incluye rutas relativas a un código de investigación no publicado en el propio repo; la restauración requiere un checkout del código fuente (`scripts/ops/backup_weights.py`), lo que añade una dependencia externa.
- Tamaño del repo (91,9 GB) y 165 ficheros: requiere espacio en disco y gestión de versiones cuidadosa; no apto para descarga ligera.

## Enlaces

- HuggingFace: https://huggingface.co/danielbogdoll/iad-weights-native-batch2
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
