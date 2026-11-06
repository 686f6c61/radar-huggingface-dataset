# MedMLX/unest-renal-ct-mlx

## Resumen

UNesT · Renal CT es un modelo de segmentación semántica 3D para TC renal con contraste, distribuido por MedMLX como implementación nativa en MLX del checkpoint original de MONAI (`MONAI/renalStructures_UNEST_segmentation` v0.2.7). El modelo segmenta tres subestructuras del riñón —corteza, médula y sistema pielocalicial— a partir de volúmenes NIfTI en unidades Hounsfield, generando una máscara con cuatro etiquetas (0 fondo, 1 corteza, 2 médula, 3 sistema colector).

La relevancia del artefacto no reside en el modelo en sí (que proviene de MONAI), sino en el port a MLX con pesos en safetensors, lo que permite ejecutar la inferencia en Apple Silicon mediante Metal sin depender de PyTorch ni de CUDA. Está pensado para investigación y educación, no para uso clínico, y su autor declara explícitamente que no ha sido validado en ese contexto.

Se trata de un modelo de visión médica, no de un LLM: no genera texto, no razona y no soporta tool calling. Su tamaño de repositorio es de 0,3 GB y la única verificación publicada de equivalencia con la implementación de referencia cubre un solo caso de AMOS22.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNesT (3D Block Aggregate Transformer), según el paper arXiv:2203.02430 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen) |
| Tipos de cuantización | no disponible; el checkpoint convertido es FP32 en safetensors |
| Idiomas soportados | en (documentación y metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (conversión del checkpoint FP32 de MONAI) |

## Arquitectura y entrenamiento

El modelo subyacente es UNesT (UNet-like Transformer), un transformer 3D con agregación por bloques descrito en «Characterizing Renal Structures with 3D Block Aggregate Transformers» (arXiv:2203.02430). El checkpoint original fue entrenado por MONAI para la segmentación de subestructuras renales; MedMLX no ha reentrenado ni ajustado el modelo, sino que ha convertido sus pesos FP32 a safetensors preservando valores y disposición de tensores para una implementación nativa en MLX.

No se dispone de información sobre el número de tokens o volúmenes de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (no procede en un modelo de segmentación). La evaluación publicada por MONAI reporta un Dice medio de 0,8523 sobre su split de validación de ImageVU RenalSeg, compuesto por 96 volúmenes 3D. La innovación del artefacto es de despliegue: ejecución en Apple Silicon vía Metal con Python 3.13 y el paquete `unest-mlx>=0.2.7`.

## Capacidades

- Segmentación 3D de subestructuras renales en TC con contraste (fase arterial o venosa portal).
- Salida de máscara NIfTI con etiquetas: 0 fondo, 1 corteza renal, 2 médula, 3 sistema pielocalicial.
- Conservación de la forma del array de entrada y del affine efectivo del lector.
- Entrada en unidades Hounsfield (NIfTI finito).
- Ejecución nativa en Apple Silicon mediante MLX y Metal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en segmentación renal: uso del modelo para generar máscaras de corteza, médula y sistema colector en cohortes de TC con contraste, con revisión manual posterior, aprovechando la equivalencia voxel a voxel con la implementación de referencia en el caso probado.
- Prototipado en portátiles Apple Silicon: desarrollo y depuración de pipelines de imagen médica sin GPU NVIDIA, ejecutando la inferencia vía MLX sobre Metal.
- Docencia en imagen médica computacional: demostración de segmentación 3D con transformers en entornos de aula con hardware de consumo Apple.
- Preprocesado para análisis morfométrico: generación de máscaras por subestructura para calcular volúmenes o métricas de forma renal en estudios retrospectivos.
- Comparación de implementaciones: validación de portabilidad de checkpoints MONAI a MLX comparando máscaras contra la referencia CPU FP32.
- Integración en cuadernos de investigación reproducibles: descarga fijada por revisión (`dea2e468...`) y ejecución con `unest_mlx.medmlx.run` para experimentos con trazabilidad de pesos.
- Filtrado previo en estudios de imagen: uso de las máscaras como paso intermedio para aislar regiones renales antes de otros análisis, siempre con revisión de calidad.

## Benchmarks y rendimiento

| Evaluación | Resultado | Ámbito |
|---|---|---|
| Dice medio (MONAI, modelo upstream) | 0,8523 | Split de validación de ImageVU RenalSeg, 96 volúmenes 3D |
| Equivalencia MLX vs MONAI CPU FP32 | Coincidencia voxel a voxel, misma forma y affine | Un caso de AMOS22 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo. La comparación MLX mide acuerdo con la implementación de referencia, no precisión de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,3 GB y los pesos convertidos son FP32, por lo que la memoria necesaria para inferencia 3D dependerá del tamaño del volumen de entrada.
- GPU recomendadas: hardware Apple Silicon con soporte Metal (requisito del runtime MLX); no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA ni CUDA.
- Opciones de despliegue: paquete `unest-mlx>=0.2.7` con Python 3.13, entorno `uv`, descarga vía `huggingface-hub`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/unest-renal-ct-mlx | UNesT 3D en MLX | TC 3D con contraste | Equivalencia voxel a voxel con referencia en 1 caso AMOS22 | Apache-2.0 | Hugging Face, MLX |
| MONAI/renalStructures_UNEST_segmentation | UNesT 3D (referencia) | TC 3D con contraste | Dice medio 0,8523 en 96 volúmenes ImageVU RenalSeg | no disponible en la información proporcionada | Hugging Face, MONAI |
| Otros segmentadores renales 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y pensado para TC renal con contraste (arterial o venoso portal); los autores del paquete indican que falló en riñones en exploraciones sin contraste.
- No validado para uso clínico; destinado a investigación y educación. Revisar siempre las máscaras antes de cualquier uso.
- La comparación MLX frente a MONAI cubre un único caso de AMOS22 y mide acuerdo con la referencia, no precisión de segmentación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentaciones erróneas o incompletas en volúmenes fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; la distribución de entrenamiento (ImageVU RenalSeg) condiciona la generalización.
- Limitaciones de idioma: el modelo no procesa lenguaje; la documentación está en inglés.
- Restricciones de licencia: pesos bajo Apache-2.0, lo que permite uso comercial según la licencia, pero el autor restringe el propósito a investigación y educación y declara que no está validado clínicamente; consultar el archivo NOTICE.
- Requiere hardware Apple Silicon con Metal; no hay soporte documentado para CUDA.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/unest-renal-ct-mlx
- Archivos del modelo: https://huggingface.co/MedMLX/unest-renal-ct-mlx/tree/main
- Repositorio GitHub: https://github.com/MedMLX/unest-mlx
- Documentación de ejecución: https://github.com/MedMLX/unest-mlx/blob/main/README.md#run
- Detalles de entrada y preprocesado: https://github.com/MedMLX/unest-mlx/blob/main/README.md#inputs-and-outputs
- Modelo base MONAI: https://huggingface.co/MONAI/renalStructures_UNEST_segmentation/tree/f15df38db78f38865c8d49cbc4631f7a7286ef3b
- Documentación del modelo upstream: https://huggingface.co/MONAI/renalStructures_UNEST_segmentation/blob/f15df38db78f38865c8d49cbc4631f7a7286ef3b/docs/README.md
- Paper del método (arXiv:2203.02430): https://arxiv.org/abs/2203.02430
- Paper de MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Registro de comparación con la referencia: https://huggingface.co/MedMLX/unest-renal-ct-mlx/blob/main/reference-comparison.json
- Registro de ejecución nativa: https://huggingface.co/MedMLX/unest-renal-ct-mlx/blob/main/native-run.json
- Licencia: https://huggingface.co/MedMLX/unest-renal-ct-mlx/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/unest-renal-ct-mlx/blob/main/NOTICE
