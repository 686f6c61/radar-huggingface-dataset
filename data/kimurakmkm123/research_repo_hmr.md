# kimurakmkm123/research_repo_hmr

## Resumen

`research_repo_hmr` no es un modelo de lenguaje, sino un repositorio de pesos ya convertidos y cuantizados para un pipeline de recuperación de malla humana (human mesh recovery, HMR). Lo publica el usuario kimurakmkm123 como material complementario de un trabajo de investigación (`research_repo_sii2027`) y contiene únicamente las variantes de pesos empleadas en las mediciones del paper: conversiones a bf16, cuantizaciones INT8 y motores TensorRT de los modelos ROMP, SAT-HMR, Fast-SAM-3D-Body, SAM 3D Body, MHR, MoGe-2 y YOLO11-pose.

El valor del repositorio está en el trabajo de empaquetado y optimización, no en un entrenamiento propio: cada archivo deriva de los pesos oficiales de su proyecto original y conserva la licencia de origen (Apache-2.0, MIT, SAM License y AGPL-3.0). El repositorio ocupa 4,6 GB y está etiquetado con `tensorrt`, `human-mesh-recovery` y `quantization`.

Es relevante para quienes reproduzcan el pipeline del paper o necesiten versiones de menor precisión de estos estimadores de pose y forma corporal para inferencia en GPU de consumo. Los motores TensorRT se generaron en una NVIDIA RTX 4070 con TensorRT 10.13, por lo que no son portables a otras GPU o versiones sin regenerarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: HRNet32 y ResNet50 (ROMP), transformer SAT-HMR, DINOv3 (SAM 3D Body), ViT-S/DINOv2 (MoGe-2), YOLO11m-pose |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantización | bf16, INT8 weight-only (lineal / backbone), INT8 con calibración por entropía, FP16 (TensorRT) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | mixta: Apache-2.0, MIT, SAM License, AGPL-3.0 (por archivo) |
| Formato de pesos | `.pth`, `.pt`, `.ckpt` (PyTorch) y `.engine` (TensorRT) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrupa conversiones de pesos de terceros. SAT-HMR se distribuye en bf16 (`sat_644_bf16.pth`) y en dos variantes INT8 con cuantización de las capas lineales (`sat_644_int8w.pth` y `sat_644_3dpw_int8w.pth`). ROMP aparece con backbones HRNet32 y ResNet50 en bf16, además de dos variantes INT8 weight-only (backbone HRNet32 y pesos crudos de ResNet50), que según la model card solo se usaron para reportar tamaño de modelo en el paper.

Fast-SAM-3D-Body incluye el backbone DINOv3 convertido a motor TensorRT INT8 mediante TensorRT Model Optimizer, el checkpoint completo en bf16, el modelo MHR en bf16, el encoder de MoGe-2 ViT-S normal como motor TensorRT INT8 con calibración por entropía y un motor TensorRT FP16 de YOLO11m-pose. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, porque no hay entrenamiento propio. La innovación técnica es exclusivamente de despliegue: reducción de precisión y compilación a TensorRT para acelerar la inferencia.

## Capacidades

- Recuperación de malla humana 3D a partir de imagen (ROMP, SAT-HMR, SAM 3D Body).
- Estimación de pose 2D/3D con YOLO11m-pose como detector de personas.
- Reconstrucción de geometría y normales de superficie con MoGe-2.
- Modelo corporal paramétrico MHR en bf16 para representación de forma y pose.
- Inferencia acelerada mediante motores TensorRT INT8/FP16.
- Variantes de pesos ligeras (bf16, INT8) para reducir huella de memoria.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción del paper: descargar los pesos con `download_weights.py` y colocarlos en las rutas que espera el código del repositorio de investigación para repetir las mediciones publicadas.
- Captura de movimiento desde vídeo o imagen única: usar ROMP o SAT-HMR para obtener parámetros SMPL de sujetos y reconstruir su malla, con la variante bf16 para menor uso de VRAM.
- Despliegue en GPU de consumo: emplear los motores TensorRT INT8/FP16 en una RTX 4070 (entorno de generación documentado) para acelerar el backbone DINOv3 de SAM 3D Body o el encoder de MoGe-2.
- Comparativa de precisión y tamaño: usar los pares bf16/INT8 de un mismo modelo para medir la degradación de exactitud frente a la reducción de memoria en experiments de cuantización.
- Investigación en visión por computador: integrar los checkpoints bf16 en pipelines de PyTorch existentes sin reentrenar, aprovechando que conservan la estructura de los pesos originales.
- Prototipado de análisis de movimiento o ergonomía: combinar YOLO11m-pose (detección) con SAT-HMR o SAM 3D Body (malla) para estimar posturas en imágenes de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del submodelo cargado. El repositorio completo ocupa 4,6 GB en disco, pero cada pipeline (por ejemplo SAM 3D Body con DINOv3) requiere cargar varios componentes a la vez.
- GPU de generación de los motores: NVIDIA RTX 4070 con TensorRT 10.13. Los `.engine` solo son válidos en esa GPU y versión de TensorRT; en otro hardware deben regenerarse con los scripts de conversión del repositorio de código.
- GPU recomendadas: no disponible. Para los checkpoints bf16/INT8 en PyTorch se puede usar cualquier GPU compatible con las dependencias de cada proyecto original.
- ¿Cabe en GPU de consumo? Los pesos en bf16 e INT8 están pensados para reducir memoria y los motores se generaron en una RTX 4070, lo que sugiere viabilidad en esa clase de GPU, aunque no se documentan cifras de VRAM.
- Opciones de despliegue: PyTorch para los `.pth`/`.pt`/`.ckpt`; TensorRT para los `.engine`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de visión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Precisión incluida | Licencia | Disponibilidad |
|---|---|---|---|---|
| `research_repo_hmr` (este repo) | Paquete de pesos HMR convertidos | bf16, INT8, TensorRT INT8/FP16 | Mixta (Apache-2.0, MIT, SAM, AGPL-3.0) | Hugging Face, 4,6 GB |
| SAT-HMR (`ChiSu001/SAT-HMR`) | Modelo HMR original | Pesos originales (fp32) | Apache-2.0 | Hugging Face |
| ROMP (`Arthur151/ROMP`) | Modelo HMR original | Pesos `.pkl` originales | Apache-2.0 | GitHub |
| SAM 3D Body (`facebook/sam-3d-body-dinov3`) | Modelo HMR original | Checkpoint original | SAM License | Hugging Face |

La diferencia principal frente a los originales no es de calidad de modelo, sino de formato: este repositorio ofrece variantes de menor precisión y motores compilados que los proyectos de origen no publican.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-step.
- Los motores TensorRT están atados a la RTX 4070 y TensorRT 10.13; en otra GPU o versión no cargan y hay que regenerarlos.
- No incluye los pesos oficiales originales ni el modelo SMPL; deben obtenerse de sus distribuidores, con sus propias condiciones de uso.
- Licencia mixta por archivo: YOLO11 está bajo AGPL-3.0, lo que impone obligaciones de copyleft en uso en red si se integra en un servicio; SAM 3D Body está bajo SAM License, con requisitos de atribución al publicar resultados.
- Riesgo de degradación de precisión por la cuantización INT8 (weight-only y con calibración por entropía); no se documentan métricas de exactitud frente a los pesos originales.
- Sesgos y alucinaciones: no aplica en el sentido de LLM, pero los estimadores HMR heredan sesgos de sus datasets de entrenamiento (no documentados aquí).
- Uso comercial: depende de cada submodelo; conviene revisar los textos en `licenses/` antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kimurakmkm123/research_repo_hmr
- Licencias: https://huggingface.co/kimurakmkm123/research_repo_hmr/tree/main/licenses
- SAT-HMR: https://huggingface.co/ChiSu001/SAT-HMR
- ROMP: https://github.com/Arthur151/ROMP
- SAM 3D Body: https://huggingface.co/facebook/sam-3d-body-dinov3
- MHR: https://github.com/facebookresearch/MHR
- MoGe-2: https://huggingface.co/Ruicheng/moge-2-vits-normal
- YOLO11 (Ultralytics): https://github.com/ultralytics/ultralytics
