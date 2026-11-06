# danielbogdoll/iad-weights-a2-residual

## Resumen

A2 es un conjunto de pesos para segmentación de anomalías (anomaly segmentation) publicado por el desarrollador danielbogdoll bajo licencia MIT. Se trata de una cabeza residual (*residual instance head*) entrenada sobre checkpoints congelados del modelo UNO (denominado M1 en la documentación del autor). El repositorio no contiene un modelo completo autónomo, sino los pesos de esa cabeza residual más los manifiestos de ejecución y las configuraciones de Detectron2 necesarias para reproducir el entrenamiento.

El paquete incluye dos variantes de la misma cabeza residual: `A2` y `A2_beta0`, cada una con 11 checkpoints, lo que suma 26 ficheros y 1,31 GiB. El entrenamiento se realizó con un script propio (`train_residual.py`) sobre configuraciones Swin para el dataset Cityscapes, en el contexto de un código de investigación más amplio que no se distribuye en este repositorio.

La relevancia del artefacto es acotada: no es un modelo de propósito general ni un LLM, sino un componente de investigación para pipelines de detección de anomalías en imágenes. Su interés radica en que permite restaurar exactamente el estado de una cabeza residual concreta sobre un backbone congelado, algo útil para reproducibilidad de experimentos, pero requiere el código de investigación original y los checkpoints de UNO para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza residual (residual instance head) sobre backbone UNO congelado; configuración Swin para Detectron2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión por computador) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch/Detectron2 (no se especifica safetensors ni GGUF); repo de 1,31 GiB con 26 ficheros e `index.json` con tamaños y sha256 |

## Arquitectura y entrenamiento

La arquitectura consiste en una cabeza residual entrenada sobre un modelo UNO congelado (M1). Según la model card, el entrenamiento se ejecuta con `train_residual.py` usando configuraciones de Detectron2 para segmentación semántica con backbone Swin sobre Cityscapes (`configs/cityscapes/semantic-segmentation/swin/residual_A2.yaml` y `residual_A2_beta0.yaml`). El backbone permanece congelado y solo se optimiza la cabeza residual, lo que reduce el coste de entrenamiento y preserva las representaciones del modelo base.

Se distribuyen dos variantes, `A2` y `A2_beta0`, presumiblemente diferenciadas por un hiperparámetro beta (el nombre sugiere beta=0 en la segunda), aunque la model card no detalla el significado exacto ni los hiperparámetros completos. Cada carpeta conserva el manifiesto de ejecución (comando, commit, configuración) y/o el `config.yaml` de Detectron2. No se especifican el número de tokens ni la composición del dataset más allá de la referencia a Cityscapes, ni si hubo etapas de RLHF/DPO (no aplicable en este dominio). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de anomalías en imágenes, mediante una cabeza residual sobre representaciones de un backbone UNO congelado.
- Segmentación semántica en el contexto de Cityscapes, según las configuraciones de entrenamiento incluidas.
- Dos variantes de pesos (`A2` y `A2_beta0`) para comparación experimental.
- Reproducibilidad: cada carpeta incluye manifiesto de ejecución (comando, commit, configuración) e `index.json` con tamaños y hashes sha256.
- Restauración mediante script del código de investigación (`backup_weights.py pull --only a2-residual`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, OCR, captioning) ni modos especiales como thinking mode.

## Casos de uso

- Reproducción de experimentos de segmentación de anomalías: restaurar los checkpoints `A2` o `A2_beta0` en un checkout del código de investigación permite replicar exactamente los resultados publicados por el autor, gracias a los manifiestos con comando y commit.
- Comparación de variantes de cabeza residual: las dos variantes permiten aislar el efecto del hiperparámetro beta sobre el rendimiento de segmentación, manteniendo el backbone UNO congelado como constante.
- Investigación en detección de anomalías en escenas urbanas: las configuraciones Swin sobre Cityscapes lo hacen adecuado para experimentos de segmentación semántica en entornos de conducción.
- Baseline para transferencia con backbone congelado: sirve como referencia para evaluar si entrenar solo la cabeza residual es suficiente frente a fine-tuning completo del backbone.
- Auditoría y trazabilidad de pesos: los hashes sha256 de `index.json` permiten verificar la integridad de los checkpoints en pipelines de investigación o CI.
- Prototipado académico con Detectron2: al conservar el `config.yaml`, se integra en flujos de trabajo estándar de Detectron2 para entrenamiento y evaluación.
- Publicación de artefactos reproducibles: el formato de manifiesto y backup facilita adjuntar pesos verificables a un paper o informe técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (1,31 GiB) corresponde a 22 checkpoints de la cabeza residual, no al modelo completo; el backbone UNO congelado debe obtenerse por separado y su huella de memoria no se documenta.
- GPU recomendadas: no disponible. El entrenamiento se ejecutó con `--num-gpus 1`, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone UNO subyacente, no descrito en la model card.
- Opciones de despliegue: Detectron2 (formato nativo de los checkpoints y configuraciones). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otras cabezas residuales, modelos de segmentación de anomalías ni variantes de UNO, y no se dispone de datos de rendimiento para establecer una comparación fundamentada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el código de investigación original y los checkpoints de UNO (M1) para funcionar; el repositorio solo contiene la cabeza residual y los manifiestos.
- La model card es mínima: no documenta parámetros, dataset completo, métricas ni hiperparámetros más allá de las rutas de configuración.
- El significado de la variante `A2_beta0` y del hiperparámetro beta no se explica; usarla sin conocerlo puede llevar a conclusiones erróneas.
- Entrenado sobre Cityscapes: el dominio es escenas urbanas de conducción; el rendimiento fuera de ese dominio no está documentado.
- Sin datos sobre sesgos, tasas de alucinación o falsos positivos/negativos en la detección de anomalías.
- Licencia MIT: permite uso comercial y modificación, pero el código de investigación asociado y el backbone UNO pueden tener licencias propias que deben verificarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los checkpoints están en formato Detectron2/PyTorch, no en safetensors ni GGUF; no hay ruta de cuantización documentada para despliegue ligero.

## Enlaces

- Hugging Face: https://huggingface.co/danielbogdoll/iad-weights-a2-residual
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
