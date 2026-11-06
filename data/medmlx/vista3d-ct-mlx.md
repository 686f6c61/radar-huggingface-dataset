# MedMLX/vista3d-ct-mlx

## Resumen

VISTA-3D · CT Segmentation es una adaptación a MLX del modelo NV-Segment-CT de NVIDIA, publicada por MedMLX. Se trata de un modelo de segmentación de imágenes médicas 3D que realiza segmentación automática de volúmenes completos de tomografía computarizada (CT) en formato NIfTI, identificando estructuras anatómicas. La conversión a MLX permite ejecutar la inferencia de forma nativa en Apple Silicon mediante Metal, sin depender de CUDA.

El modelo deriva del trabajo original VISTA3D (A Unified Segmentation Foundation Model for 3D Medical Imaging), un modelo fundacional de segmentación para imagen médica 3D presentado en arXiv:2406.05285. MedMLX lo redistribuye con pesos convertidos al formato nativo de MLX, empaquetados en un repositorio de 0,9 GB, junto con la librería `mlx-segment-ct` (versión 0.3.5 o superior) que expone una API de ejecución en Python 3.13.

Es relevante para investigadores y desarrolladores que trabajan con imagen médica en equipos Apple y necesitan ejecutar segmentación CT 3D en local, sin GPU NVIDIA. La model card restringe explícitamente su uso a investigación y educación, y advierte de que no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de segmentación 3D; VISTA3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa volúmenes CT 3D completos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | nvidia-open-model (NVIDIA Open Model License) |
| Formato de pesos | pesos nativos MLX (repositorio de 0,9 GB); entrada en NIfTI (.nii.gz) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada más allá de que el modelo subyacente es VISTA3D, un modelo fundacional de segmentación para imagen médica 3D descrito en arXiv:2406.05285. El modelo base declarado es `nvidia/NV-Segment-CT`, sobre el que MedMLX realiza una conversión (finetune/conversión) a MLX. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco probable en un modelo de segmentación).

La innovación técnica destacable de esta distribución es la portabilidad: los pesos se ejecutan de forma nativa en Apple Silicon mediante MLX y Metal, con una API de inferencia (`mlx_segment_ct.medmlx.run`) que acepta rutas a volúmenes NIfTI y un directorio de pesos, y permite activar la segmentación de todas las estructuras con el parámetro `segment_all=True`. El repositorio fija una revisión concreta (`e6f45856b4a59212ca10b44a9ade2e2d672f412b`) para la descarga de pesos.

## Capacidades

- Segmentación automática de volúmenes CT 3D completos (whole-volume CT segmentation).
- Entrada en formato NIfTI (`.nii.gz`) y salida de segmentación anatómica.
- Segmentación de todas las estructuras anatómicas en una sola pasada mediante `segment_all=True`.
- Ejecución nativa en Apple Silicon con MLX y Metal.
- Interfaz programática en Python 3.13 a través de la librería `mlx-segment-ct`.
- Modelo especializado en imagen médica; no es un modelo de lenguaje y no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- Idioma declarado: inglés (en), referido a la documentación y metadatos del modelo.

## Casos de uso

- Investigación en imagen médica: ejecutar segmentación de volúmenes CT en un Mac con Apple Silicon para prototipar pipelines de análisis anatómico sin GPU NVIDIA, usando la API `run()` con `segment_all=True`.
- Preprocesado de datasets de CT: segmentar lotes de volúmenes NIfTI en local antes de entrenar o evaluar otros modelos, aprovechando la ejecución nativa en Metal.
- Docencia y formación: demostrar técnicas de segmentación 3D y modelos fundacionales en entornos de laboratorio con hardware Apple, dado el carácter educativo declarado del modelo.
- Reproducibilidad de experimentos: al fijarse una revisión concreta de pesos en el repositorio, se puede reproducir la inferencia en distintos equipos Apple Silicon con la misma versión de `mlx-segment-ct`.
- Evaluación comparativa de portabilidad: medir el rendimiento de VISTA3D convertido a MLX frente a la implementación original de NVIDIA en CUDA, como caso de estudio de conversión de modelos médicos.
- Desarrollo de herramientas de visualización: integrar la salida de segmentación en visores de imagen médica o cuadernos de análisis para inspección anatómica en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con soporte Metal (la model card indica "Apple Silicon · Metal").
- VRAM estimada para inferencia: no disponible; el repositorio de pesos ocupa 0,9 GB, pero el consumo en memoria durante la inferencia sobre volúmenes CT 3D no se especifica.
- GPU recomendadas: no se detallan modelos concretos de Apple Silicon; no aplica a A100, H100 ni RTX 4090, ya que la implementación es MLX/Metal y no CUDA.
- Cabe en GPU de consumo: sí, en el sentido de que está pensado para equipos Apple Silicon de consumo, aunque no se especifica la memoria unificada mínima necesaria.
- Opciones de despliegue: librería `mlx-segment-ct` (>= 0.3.5) con Python 3.13, gestionado con `uv`; descarga de pesos con `huggingface-hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/vista3d-ct-mlx | no disponible | no aplica (volúmenes 3D) | Segmentación CT 3D | nvidia-open-model | Hugging Face, MLX |
| nvidia/NV-Segment-CT | no disponible | no aplica (volúmenes 3D) | Segmentación CT 3D | no disponible en la información | Hugging Face (modelo base) |
| VISTA3D (original) | no disponible | no aplica (volúmenes 3D) | Segmentación 3D unificada | no disponible en la información | Paper arXiv:2406.05285 |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada; la comparativa se limita a la relación con el modelo base y el trabajo original.

## Limitaciones y advertencias

- No validado para uso clínico: la model card indica explícitamente que es para investigación y educación.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos antes de cualquier uso comercial; la licencia se etiqueta como "other" en Hugging Face.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la segmentación puede producir resultados incorrectos en anatomías atípicas o imágenes de baja calidad; no se documentan métricas de error.
- Limitaciones de idioma: el modelo declara únicamente inglés en sus metadatos; no se documenta soporte multilingüe.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no se ejecuta en CUDA ni en hardware no Apple.
- Inferencia desactivada en el Hub (`inference: false`): no se puede probar directamente desde la interfaz de Hugging Face.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente y poca validación comunitaria.
- No se especifican requisitos de memoria unificada ni rendimiento, lo que dificulta planificar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/MedMLX/vista3d-ct-mlx
- Repositorio GitHub: https://github.com/MedMLX/mlx-segment-ct
- Documentación de ejecución: https://github.com/MedMLX/mlx-segment-ct/blob/main/README.md#run
- Paper original VISTA3D: https://arxiv.org/abs/2406.05285
- Paper MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Licencia: https://huggingface.co/MedMLX/vista3d-ct-mlx/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/vista3d-ct-mlx/blob/main/NOTICE
- Modelo base: https://huggingface.co/nvidia/NV-Segment-CT
