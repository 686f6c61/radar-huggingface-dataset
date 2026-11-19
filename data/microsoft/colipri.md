# microsoft/colipri

## Resumen

COLIPRI es un codificador vision-lenguaje 3D desarrollado por Microsoft Research, entrenado para alinear tomografías computarizadas (TC) de tórax con informes radiológicos. No es un modelo generativo de texto: es un modelo de representación conjunta que produce embeddings de imagen 3D y de texto en un espacio compartido, lo que permite tareas de clasificación zero-shot, recuperación cruzada y extracción de características. Los pesos publicados corresponden a COLIPRI-CRM, la variante con mejor rendimiento del artículo de Wald et al. (ECCV 2026).

El modelo resuelve un problema concreto: la escasez de anotaciones en imagen médica 3D. Se entrenó con decenas de miles de pares TC-informe sin anotaciones manuales, empleando múltiples objetivos de preentrenamiento para aprender representaciones fuertes de forma autosupervisada. Con 258,4 millones de parámetros y un repositorio de 1,0 GB, es lo bastante compacto para ejecutarse en una sola GPU, incluso de gama consumer con la cuantización adecuada.

Su relevancia actual radica en que se distribuye bajo licencia MIT y con una librería propia (`colipri`) que simplifica el preprocesado de volúmenes DICOM/NIfTI, la extracción de embeddings por parche y el pooling global. La model card advierte explícitamente que su uso es solo para investigación y no para práctica clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje 3D (codificador doble de imagen y texto) |
| Parametros totales | 258.367.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

COLIPRI es un codificador dual de tipo CLIP adaptado a volúmenes 3D. La rama de imagen procesa TC de tórax remuestreadas a vóxeles isotrópicos de 2 mm (volumen de entrada de 192×192×192), y produce mapas de características por parche con forma `[1, 768, 24, 24, 24]`, es decir, un token de 768 dimensiones por cada parche de 8×8×8 vóxeles. La rama de texto codifica informes radiológicos en inglés. Ambas ramas se proyectan a un espacio latente compartido, lo que habilita similitud coseno directa entre imagen y texto.

El entrenamiento se realizó con decenas de miles de pares TC-informe sin anotaciones, usando múltiples objetivos de preentrenamiento (el artículo lo describe como *Comprehensive Language-Image Pre-training*). No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un codificador, estas técnicas no son de aplicación habitual. El cómputo fue de 288 GPU-horas en 4× NVIDIA A100 de 80 GB durante 72 horas en Azure (West US 2), con una huella estimada de 21,6 kg de CO₂ eq. El stack incluye nnSSL para el entrenamiento, TorchIO para preprocesado y aumentado, nifti-zarr-py para carga de datos y nnU-Net para la evaluación de segmentación.

## Capacidades

- Codificación de imágenes TC 3D en embeddings por parche y embeddings globales agrupados (pooling) y proyectados.
- Codificación de texto radiológico en inglés en el mismo espacio latente.
- Clasificación zero-shot de imágenes mediante prompts de texto (pipeline `ZeroShotImageClassificationPipeline`).
- Recuperación texto-imagen, imagen-imagen y texto-texto.
- Agrupamiento (clustering) de imágenes y de textos en el espacio de embeddings.
- Clasificación supervisada con una cabeza clasificadora ligera sobre los embeddings.
- Segmentación de imágenes acoplando un decodificador externo.
- Generación de informes acoplando un decodificador de lenguaje externo.
- Extracción de características para modelos posteriores (por ejemplo, el VLM NV-Reason-CT de NVIDIA).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo de instrucciones.

## Casos de uso

- Triaje automatizado de TC de tórax: clasificación zero-shot con prompts como "No lung nodules present" / "Lung nodules present", útil para priorizar estudios sospechosos en investigación retrospectiva sin reentrenar el modelo.
- Recuperación de casos similares: indexar los embeddings globales de una base de TC y recuperar por similitud coseno los estudios más parecidos a una consulta, tanto por imagen como por texto del informe.
- Búsqueda de cohortes por descripción textual: dado un informe o una frase clínica, recuperar los TC correspondientes mediante recuperación texto-imagen, acelerando la selección de muestras para estudios.
- Preentrenamiento de modelos downstream: usar los embeddings por parche `[1, 768, 24, 24, 24]` como entrada de una cabeza de segmentación o clasificación, reduciendo la necesidad de datos anotados.
- Generación de informes asistida: conectar el codificador de imagen a un decodificador de lenguaje para producir borradores de informe, siempre en contexto de investigación.
- Agrupamiento no supervisado de estudios: agrupar TC por fenotipo radiológico para descubrir patrones poblacionales o detectar duplicados y outliers en un repositorio.
- Compresión de embeddings para pipelines ligeros: el proyecto ORCA-3DCT usa COLIPRI como base para comprimir embeddings de CT-RATE sin reentrenamiento.
- Evaluación de calidad de datos: detectar pares TC-informe mal emparejados midiendo la similitud imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo de Wald et al. (ECCV 2026) para los resultados completos, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,0 GB solo para pesos (258 M de parámetros), más activaciones del volumen 192×192×192; en la práctica, 4-8 GB son suficientes.
- VRAM estimada en FP16/BF16: aproximadamente 0,5 GB de pesos más activaciones; cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: NVIDIA A100 (la usada en entrenamiento y evaluación), H100, L40S o RTX 4090 para producción; RTX 3090, 4080 o 4070 Ti para desarrollo.
- Cabe en GPU consumer: sí, con 8 GB o más de VRAM en FP16; el ejemplo de la model card usa `model.cuda()` directamente.
- Opciones de despliegue: la librería oficial `colipri` (instalable con `pip install colipri`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COLIPRI (Microsoft) | 258,4 M | TC 3D + texto | no disponible | MIT | Hugging Face, librería `colipri` |
| NV-Reason-CT (NVIDIA) | no disponible | TC 3D + texto + razonamiento | no disponible | no disponible | Hugging Face; derivado de COLIPRI |
| ORCA-3DCT | no disponible | Compresión de embeddings de CT-RATE | no disponible | no disponible | GitHub; usa COLIPRI como base |
| CLIP original (OpenAI) | ~150 M (ViT-B/32) | Imagen 2D + texto | 77 tokens de texto | MIT | Hugging Face, amplia adopción |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo de COLIPRI con alternativas de la misma categoría.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente que no está pensado para práctica clínica.
- Sesgo poblacional: entrenado solo con datos de Turquía y Estados Unidos, por lo que puede estar sesgado hacia esas poblaciones; los sesgos subyacentes de los datasets no están bien caracterizados.
- Idioma: solo soporta inglés en la rama de texto.
- Dominio restringido: exclusivamente TC de tórax; no se ha validado en otras modalidades ni regiones anatómicas.
- Riesgo de alucinación: al no ser generativo, no alucina texto, pero la clasificación zero-shot puede producir puntuaciones de confianza engañosas fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial según el texto de la licencia, pero la model card restringe el uso a investigación; conviene revisar esta aparente tensión antes de un despliegue productivo.
- Sin datos publicados de benchmarks en la información disponible, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/colipri
- Artículo (Wald et al., ECCV 2026): https://link.springer.com/chapter/10.1007/978-3-032-37624-4_24
- NV-Reason-CT (modelo derivado): https://huggingface.co/nvidia/NV-Reason-CT
- ORCA-3DCT (repositorio derivado): https://github.com/renjie-liang/ORCA-3DCT
- nnSSL (framework de entrenamiento): https://github.com/MIC-DKFZ/nnssl
- TorchIO (preprocesado): https://torchio.org/
- nifti-zarr-py (carga de datos): https://github.com/neuroscales/nifti-zarr-py
- nnU-Net (evaluación de segmentación): https://github.com/MIC-DKFZ/nnUNet
- Azure Machine Learning: https://azure.microsoft.com/en-us/products/machine-learning
