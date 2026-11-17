# Podtyazhki1337/3d-neurons-segmentation

## Resumen

`3d-neurons-segmentation` es una colección de modelos de segmentación de instancias 3D de somas neuronales en imágenes de microscopía sin marcaje (label-free), concretamente en cortes de cerebro de rata, ratón y humano adquiridos con iluminación oblicua (oblique illumination) y contraste de gradiente Dodt (DGC). El repositorio lo publica el usuario Podtyazhki1337 y acompaña a un manuscrito sobre generalización entre especies en segmentación neuronal 3D sin marcaje. No es un modelo de lenguaje: es un recurso biomédico de visión por computador 3D.

El repositorio no contiene un único modelo, sino un banco comparativo de seis familias de métodos: nnU-Net v2 (3d_fullres), U-Net 3D en Keras, StarDist3D, Cellpose 3, Cellpose-SAM (Cellpose 4) afinado y micro-SAM (ViT-B) afinado. Cada familia se instancia por combinación de especie y modalidad (humano, ratón y rata con DGC u oblicua), además de conjuntos agrupados (ratón + rata, todas las DGC, todas las oblicuas, todos los datos, humano DGC + oblicua).

Su relevancia actual reside en que proporciona pesos entrenados y un pipeline reproducible (`neuroseg`) sobre un conjunto anotado de 240 stacks con partición train/val/test, lo que permite comparar métodos de segmentación 3D en un dominio difícil (tejido cerebral denso, sin tinción fluorescente) y evaluar la transferencia entre especies. El tamaño del repositorio, 33,6 GB, refleja la acumulación de múltiples frameworks y checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple: nnU-Net v2 (3d_fullres), U-Net 3D (Keras), StarDist3D, Cellpose 3, Cellpose-SAM (Cellpose 4), micro-SAM (ViT-B) |
| Parametros totales | no disponible (depende de cada checkpoint; no se publican recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen 3D; entrada TIFF con ejes Z, Y, X) |
| Tipos de cuantizacion | no disponible (pesos en precisión de entrenamiento: `.pth`, `.h5`, `.weights.h5`, `.pt`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`, `.pt`), Keras/HDF5 (`.h5`, `.weights.h5`), JSON de umbrales (`thresholds.json`) |

## Arquitectura y entrenamiento

El recurso agrupa implementaciones dispares. nnU-Net v2 se entrena en configuración `3d_fullres` (fold 0, checkpoint `checkpoint_best.pth`) con un trainer `nnUNetTrainer_Comet` que solo añade logging de experimentos respecto al trainer estándar. La U-Net 3D en Keras se distribuye en variantes sin y con augmentación ligera. StarDist3D emplea su representación de estrellas con umbrales calibrados (`thresholds.json`). Cellpose 3 se entrena por conjunto en modo chunked, mientras que Cellpose-SAM se afina desde el checkpoint `cpsam` de Cellpose 4 y micro-SAM se afina desde `vit_b_lm`.

Los datos de entrenamiento son 240 stacks anotados de cortes cerebrales de rata, ratón y humano, con voxel sizes específicos por modalidad: DGC 1 × 0,115 × 0,115 µm y oblicua 1 × 0,171 × 0,171 µm. Se definen conjuntos por especie-modalidad y conjuntos agrupados para evaluar generalización cruzada. El pipeline de inferencia incluye normalización, red y post-procesado seleccionado sobre validación; los ajustes concretos están en `neuroseg/registry.py` y los de entrenamiento en la Tabla Suplementaria S1 del manuscrito. No se detallan en la información disponible el número de tokens, composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Segmentación de instancias 3D de somas neuronales en stacks TIFF de microscopía sin marcaje.
- Soporte de dos modalidades de adquisición: iluminación oblicua y contraste de gradiente Dodt (DGC).
- Modelos específicos por especie (humano, ratón, rata) y modelos agrupados para generalización entre especies.
- Seis familias de métodos comparables bajo un mismo protocolo de evaluación.
- Inferencia programática vía API de Python (`load_model`, `read_volume`, `predict`) y vía CLI (`python -m neuroseg.predict`).
- Reproducción de resultados de test sobre los datos de Zenodo (`neuroseg.reproduce`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Segmentación automatizada de somas en imágenes de microscopía de cortes cerebrales: se elige el modelo correspondiente a la modalidad (DGC u oblicua) y especie, se pasa el stack TIFF y se obtienen etiquetas de instancia, sustituyendo el conteo manual.
- Estudios de neurociencia comparada entre especies: los modelos agrupados (por ejemplo, rata + ratón DGC o todos los datos) permiten procesar cohortes mixtas con un único checkpoint y evaluar la transferencia entre especies.
- Cuantificación de densidad neuronal en experimentos de degeneración o neuroprotección: la segmentación de instancias 3D permite contar somas por volumen de tejido de forma reproducible.
- Validación de pipelines de imagen biomédica: el conjunto de 240 stacks con partición train/val/test y el comando `neuroseg.reproduce` permiten verificar implementaciones propias contra resultados publicados.
- Benchmarking de métodos de segmentación: al incluir nnU-Net, StarDist3D, Cellpose, Cellpose-SAM y micro-SAM con los mismos datos, sirve para comparar frameworks en un dominio concreto antes de adoptar uno en producción.
- Preprocesado para análisis morfológico posterior: las etiquetas de instancia generadas pueden alimentar extracción de características (volumen, forma, posición) en estudios de reconstrucción neuronal.
- Docencia y formación en segmentación 3D biomédica: el repositorio y el dataset público permiten reproducir el flujo completo (descarga, entrenamiento, inferencia) con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados del conjunto de test del manuscrito y a la Tabla Suplementaria S1 para los ajustes de entrenamiento, pero no incluye cifras numéricas (por ejemplo, Dice, IoU o F1 de instancias) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del método: nnU-Net 3d_fullres y U-Net 3D sobre stacks completos requieren más memoria que los enfoques chunked de Cellpose; micro-SAM (ViT-B) es el más ligero en parámetros pero procesa por parches.
- GPU recomendadas: no disponible. Por el tamaño de los volúmenes 3D y la presencia de nnU-Net `3d_fullres`, se espera que GPU de datacenter (A100, H100) sean adecuadas para stacks completos, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado. No se especifican requisitos mínimos ni modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: el paquete `neuroseg` con entornos conda por framework (`environments/nnunet.yml`, etc.); inferencia vía CLI `python -m neuroseg.predict` o API Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| 3d-neurons-segmentation (este) | Banco de 6 familias (nnU-Net, U-Net 3D, StarDist3D, Cellpose 3, Cellpose-SAM, micro-SAM) | 240 stacks de rata, ratón y humano; DGC y oblicua | MIT | Hugging Face + GitHub + Zenodo |
| nnU-Net v2 (original) | Framework de segmentación médica auto-configurado | Genérico, múltiples dominios | Apache 2.0 (según su repositorio) | Código público |
| Cellpose / Cellpose-SAM | Segmentación de células e instancias 2D/3D | Datos generales de microscopía | BSD-3-Clause (según su repositorio) | Código y pesos públicos |
| StarDist3D | Detección de objetos con forma de estrella | Datos generales de microscopía | BSD-3-Clause (según su repositorio) | Código y pesos públicos |

No se dispone de cifras comparativas de rendimiento entre estos métodos en la información proporcionada; la comparación se limita a la disponibilidad de implementaciones y a la licencia MIT de este repositorio frente a las licencias de los proyectos originales.

## Limitaciones y advertencias

- Dominio muy restringido: solo válido para somas neuronales en cortes cerebrales de rata, ratón y humano con iluminación oblicua o DGC; no se garantiza su uso en otras modalidades, tejidos u órganos.
- Requiere respetar el voxel size de la modalidad (DGC 1 × 0,115 × 0,115 µm; oblicua 1 × 0,171 × 0,171 µm); desviaciones pueden degradar la segmentación.
- Es obligatorio elegir el modelo entrenado en la modalidad de la imagen; usar un checkpoint de DGC sobre oblicua (o viceversa) no está soportado por el diseño.
- Riesgo de falsos positivos y negativos en tejido denso o con artefactos de adquisición; no se documentan métricas de error en la información disponible.
- Sesgos potenciales por especie y por lote de adquisición: los modelos agrupados mitigan pero no eliminan la variabilidad entre especies.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Licencia MIT permite uso comercial, pero se recomienda citar el manuscrito y el dataset de Zenodo según indica la model card.
- El repositorio pesa 33,6 GB; la descarga y el almacenamiento de todos los checkpoints puede ser costoso.
- La referencia de publicación del manuscrito está pendiente ("to be added on publication"), lo que dificulta la trazabilidad bibliográfica completa.
- Sin garantías de mantenimiento: 29 descargas y 0 likes en el momento de la consulta; proyecto de autor único.

## Enlaces

- Hugging Face: https://huggingface.co/Podtyazhki1337/3d-neurons-segmentation
- Código (inferencia, reproducción, entrenamiento): https://github.com/podtyazhki1337/3d-neurons-segmentation
- Dataset (240 stacks anotados, train/val/test): https://doi.org/10.5281/zenodo.20797635
