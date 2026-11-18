# SHAPE-agent/organoid-segmenter

## Resumen

`organoid-segmenter` (nombre interno `shape_seg_co`) es un checkpoint de Cellpose-SAM (`cpsam`) ajustado por el autor SHAPE-agent para la segmentación de instancias de organoides cardíacos humanos completos en imágenes de contraste de fase. El modelo no es un modelo de lenguaje, sino un modelo de visión especializado en segmentación celular y de estructuras organoides, empaquetado con la librería Cellpose 4 y distribuido como un único fichero de pesos de 1,2 GB.

Su relevancia radica en que forma parte del ecosistema SHAPE (`Organoid_Segmenter_Tool`), una herramienta de análisis de organoides, y se emplea en los casos de estudio de organoides cardíacos del proyecto: seguimiento temporal (`timecourse`), cribado de fármacos (`drug_screen`) y segmentación (`segmentation`). El checkpoint se publica con el hash SHA-256 exacto que registran las ejecuciones de SHAPE, lo que permite reproducibilidad en pipelines científicos.

La arquitectura subyacente es Cellpose-SAM, un modelo de segmentación basado en SAM adaptado al dominio de microscopía. La información disponible no detalla el número de parámetros, la longitud de contexto (no aplica en el sentido de LLM) ni los datos exactos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (`cpsam`), checkpoint ajustado (fine-tuned) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión/segmentación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada de imágenes) |
| Licencia | CC BY 4.0 |
| Formato de pesos | fichero único `shape_seg_co` (1.218.642.694 bytes), cargado vía Cellpose |
| Tamaño del repo | 1,2 GB |
| SHA-256 | `f125b9754521efa042ef1ee614d8d900843b2c933517f393daf2e37268d20c48` |
| Librería | cellpose |
| Pipeline HF | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un checkpoint de Cellpose-SAM, la variante de Cellpose 4 que incorpora el backbone de Segment Anything Model (SAM) adaptado a la segmentación de instancias en microscopía. Cellpose produce máscaras de instancia junto con flujos (`flows`) y estilos (`styles`) por imagen, lo que permite separar objetos individuales (en este caso, organoides cardíacos completos) en imágenes de contraste de fase.

El ajuste se ha realizado sobre el checkpoint base `cpsam` para el dominio concreto de organoides cardíacos humanos en contraste de fase. La model card no proporciona el número de imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o validación cruzada. Tampoco se documentan innovaciones técnicas adicionales más allá del propio pipeline de Cellpose-SAM. El hash SHA-256 publicado corresponde al que registran las ejecuciones de SHAPE (`organoid_model_sha256`), lo que garantiza la integridad del artefacto.

## Capacidades

- Segmentación de instancias de organoides cardíacos completos en imágenes de contraste de fase.
- Generación de máscaras, flujos y estilos mediante `CellposeModel.eval()`.
- Integración con la herramienta SHAPE `Organoid_Segmenter_Tool` como modelo de organoides (`--organoid-model`, `CO_ORGANOID_MODEL` o `--model-path`).
- Uso directo con Cellpose 4 mediante `models.CellposeModel(gpu=True, pretrained_model=...)`.
- Ejecución en GPU (parámetro `gpu=True` en la API de Cellpose).
- Aplicable a flujos de análisis de organoides: seguimiento temporal y cribado de fármacos según los casos de estudio documentados.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Seguimiento temporal de organoides cardíacos: el modelo segmenta organoides en series de imágenes de contraste de fase a lo largo del tiempo, permitiendo medir crecimiento, morfología y cambios de área en cada frame del caso `timecourse` de SHAPE.
- Cribado de fármacos en organoides cardíacos: en el caso `drug_screen`, el modelo genera máscaras por pocillo y condición para cuantificar el efecto de compuestos sobre el tamaño y la forma de los organoides.
- Segmentación por lotes en pipelines de laboratorio: integrado como `shape_seg_co` en el brazo de segmentación de SHAPE, permite procesar placas completas de forma automatizada y reproducible gracias al hash publicado.
- Análisis morfológico cuantitativo: las máscaras permiten calcular área, perímetro, circularidad y otros descriptores de forma de cada organoide para estudios de fenotipado.
- Reproducción de experimentos publicados: al fijar el SHA-256, otros grupos pueden replicar exactamente las segmentaciones de los casos de estudio de SHAPE.
- Control de calidad en cultivos de organoides: detección y conteo automático de organoides en imágenes de rutina para descartar pocillos con baja formación de estructuras.
- Integración en cuadernos de análisis con Cellpose 4: carga directa del checkpoint en Python para experimentos ad hoc de segmentación sin depender de la herramienta SHAPE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como IoU, Dice, AP de segmentación ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del artefacto (1,2 GB) sugiere un consumo moderado, pero no se documenta la huella exacta en memoria.
- GPU recomendadas: no disponible; la API de Cellpose permite `gpu=True`, por lo que se espera una GPU compatible con PyTorch.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño del checkpoint es plausible en GPUs de consumo con suficiente VRAM, pero no se aportan cifras.
- Opciones de despliegue: Cellpose 4 (`models.CellposeModel`) y la herramienta SHAPE (`Organoid_Segmenter_Tool`). No se documentan opciones como vLLM, llama.cpp u Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| organoid-segmenter (`shape_seg_co`) | Cellpose-SAM ajustado para organoides cardíacos | no disponible | no aplica | CC BY 4.0 | Hugging Face (repo 1,2 GB) |
| Cellpose-SAM base (`cpsam`) | Segmentación general de microscopía | no disponible | no aplica | no disponible en esta ficha | Disponible vía Cellpose |
| Cellpose (versiones previas, `cyto`/`nuclei`) | Segmentación celular | no disponible | no aplica | no disponible en esta ficha | Disponible vía Cellpose |

La comparación cuantitativa con alternativas no está disponible; la model card no incluye métricas frente a otros checkpoints.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está ajustado para organoides cardíacos humanos en contraste de fase; su rendimiento en otros tipos celulares, modalidades (fluorescencia) u organismos no está documentado.
- Sin métricas publicadas: no hay benchmarks de validación, por lo que no se puede evaluar la calidad de la segmentación frente al modelo base.
- Datos de entrenamiento no documentados: se desconoce el tamaño y la composición del dataset, lo que dificulta estimar sesgos o generalización.
- Riesgo de sobreajuste al dominio: al ser un fine-tune específico, puede degradarse en condiciones de imagen distintas (iluminación, aumento, cámara) a las del entrenamiento.
- Licencia CC BY 4.0: permite uso comercial y modificación con atribución, pero exige citar al autor y conservar el aviso de licencia.
- Reproducibilidad dependiente del hash: las ejecuciones de SHAPE registran `organoid_model_sha256`; cualquier alteración del fichero rompe la reproducibilidad.
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje y no debe usarse para tareas de NLP.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes): no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SHAPE-agent/organoid-segmenter
- Repositorio SHAPE: https://github.com/xuekunwu/SHAPE
- Descarga: `hf download SHAPE-agent/organoid-segmenter shape_seg_co --local-dir models`
- Cellpose (librería): no disponible en la información proporcionada
