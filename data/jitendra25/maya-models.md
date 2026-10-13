# jitendra25/maya-models

## Resumen

`jitendra25/maya-models` no es un modelo entrenado, sino un repositorio de pesos preentrenados en formato ONNX que la aplicación Maya descarga en su primera ejecución. El autor, jitendra25, los ha recopilado para centralizar la configuración de la aplicación en un único punto de descarga y deja claro en la model card que ninguno de los ficheros ha sido entrenado por este proyecto.

El repositorio agrupa 14 ficheros que cubren la cadena completa de un pipeline de intercambio de rostros (face swap): detección facial (RetinaFace, SCRFD, YOLOv8-face), reconocimiento (ArcFace), estimación de landmarks, parsing y segmentación facial, máscaras de oclusión, restauración de imagen (GFPGAN, GPEN, CodeFormer) y una máscara guiada por texto basada en CLIPSeg. El tamano total del repositorio es de 1,6 GB y el pipeline declarado en HuggingFace es `face-swap`.

Su relevancia es práctica, no científica: funciona como bundle reproducible de dependencias para replicar o autoalojar Maya sin depender de las descargas individuales de cada proyecto original. No aporta arquitectura propia, pesos nuevos ni resultados de entrenamiento, y cada fichero conserva la licencia de sus autores originales, varias de ellas restringidas a investigación no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea de redes de visión: RetinaFace (`det_10g`, `res50`), SCRFD (`scrfd_2.5g_bnkps`), YOLOv8-face (`yoloface_8n`), ArcFace ResNet50 (`w600k_r50`), inswapper-128, GFPGAN v1.4, GPEN-BFR-256/512, CodeFormer, face-parsing.PyTorch, Rope (occluder) y CLIPSeg |
| Parametros totales | no disponible (no se publica recuento por fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | fp16 en `inswapper_128.fp16.onnx`, `codeformer_fp16.onnx` y `faceparser_fp16.onnx`; el resto de ficheros no documenta su precisión numérica |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); CLIPSeg acepta prompts de texto, pero el autor no desglosa idiomas |
| Licencia | mixta: `license: other`, `license_name: mixed-see-model-card`. Varios ficheros (InsightFace y CodeFormer) son solo para investigación no comercial |
| Formato de pesos | ONNX en 13 de los 14 ficheros; `rd64-uni-refined.pth` en formato PyTorch |
| Tamano del repositorio | 1,6 GB |
| Numero de ficheros | 14 |
| Pipeline declarado en HuggingFace | `face-swap` |
| Descargas / likes | 0 / 1 |
| Fechas declaradas en HuggingFace | creado 2026-10-13, actualizado 2026-10-13 |

## Arquitectura y entrenamiento

No existe una arquitectura unificada ni un entrenamiento propio. Cada fichero es una red independiente con su propio diseño y su propio origen: RetinaFace y SCRFD para detección con puntos de referencia, YOLOv8-face como detector alternativo, ArcFace sobre ResNet50 para extracción de embeddings de identidad, inswapper-128 como red de sustitución facial, GFPGAN v1.4, GPEN-BFR y CodeFormer para restauración de caras, face-parsing.PyTorch para segmentación semántica facial, un modelo de oclusión procedente de Rope y CLIPSeg para generar máscaras guiadas por texto. No se publica información sobre datasets, número de tokens, etapas de RLHF o DPO, ni innovaciones de entrenamiento, porque este repositorio no entrena nada.

Desde el punto de vista de integración, el interés está en que todos los ficheros son artefactos de inferencia listos para ejecutarse con ONNX Runtime (salvo `rd64-uni-refined.pth`, que requiere PyTorch). La model card documenta únicamente el mapeo fichero-función-origen; no hay detalle de hiperparámetros, resolución nativa de cada red, ni métricas de validación publicadas por el recopilador.

## Capacidades

- Detección de rostros en imagen: `det_10g.onnx` y `res50.onnx` (RetinaFace), `scrfd_2.5g_bnkps.onnx` (SCRFD) y `yoloface_8n.onnx` (YOLOv8-face), lo que permite elegir entre detectores con distintos compromisos de precisión y coste.
- Reconocimiento facial e identificación: `w600k_r50.onnx` (ArcFace sobre ResNet50) para extraer embeddings de identidad y comparar rostros.
- Landmarks faciales: `2d106det.onnx` genera 106 puntos por rostro, útil para alineación y transformaciones geométricas.
- Intercambio de rostros: `inswapper_128.fp16.onnx` realiza la sustitución facial sobre la imagen de destino.
- Restauración y mejora facial: `GFPGANv1.4.onnx`, `GPEN-BFR-256.onnx`, `GPEN-BFR-512.onnx` y `codeformer_fp16.onnx` recuperan detalle en caras degradadas o generadas.
- Segmentación y parsing facial: `faceparser_fp16.onnx` produce máscaras por regiones (piel, pelo, ojos, boca), útil para composición y postprocesado.
- Máscara de oclusión: `occluder.onnx` detecta elementos que tapan el rostro.
- Máscara guiada por texto: `rd64-uni-refined.pth` (CLIPSeg) permite generar máscaras a partir de una descripción textual.
- No tiene capacidades de generación de lenguaje, razonamiento, código, matemáticas, tool calling, agentes ni audio.

## Casos de uso

- Postproducción audiovisual con consentimiento: el pipeline completo (detección con `det_10g`, landmarks con `2d106det`, swap con `inswapper_128` y restauración con GFPGAN o CodeFormer) permite sustituir el rostro de un doble por el del actor titular en planos concretos, manteniendo coherencia de iluminación y detalle gracias a las etapas de restauración.
- Restauración de fotografía y cine antiguo: usando solo `GFPGANv1.4.onnx`, `GPEN-BFR-256/512.onnx` o `codeformer_fp16.onnx`, se puede mejorar la nitidez de rostros en material de baja resolución sin ejecutar ningún intercambio de identidad.
- Anonimización de datasets de investigación: combinando un detector (`scrfd_2.5g_bnkps` o `det_10g`), el parsing facial y `occluder.onnx` se puede aplicar difuminado o sustitución únicamente sobre la región facial, preservando el resto de la escena para tareas de visión por computador.
- Etiquetado automático de datasets faciales: `det_10g.onnx` y `2d106det.onnx` generan cajas delimitadoras y 106 puntos por rostro, lo que acelera la anotación de corpus para entrenar detectores o modelos de alineación propios.
- Preprocesado en sistemas de verificación biométrica: `scrfd_2.5g_bnkps.onnx` para detectar y alinear, y `w600k_r50.onnx` para extraer el embedding de identidad que alimenta el comparador, siempre dentro de los límites legales aplicables a datos biométricos.
- Aplicaciones de escritorio u móviles con inferencia local: al estar en ONNX, los ficheros se ejecutan con onnxruntime (CPU, CUDA, DirectML o OpenVINO) sin depender de servicios en la nube, lo que facilita el despliegue offline y el control de datos.
- Preprocesado de imágenes para generación aumentada: `faceparser_fp16.onnx` permite aislar regiones faciales antes de recomponer una imagen, útil en flujos de retoque por capas.
- Segmentación guiada por prompt textual: `rd64-uni-refined.pth` (CLIPSeg) permite describir con texto la región a enmascarar, lo que simplifica la automatización de pipelines de edición sin dibujar máscaras manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, FID, PSNR, SSIM, latencia ni comparaciones cuantitativas con otros pesos, ni para los detectores ni para las redes de restauración o de swap.

## Requisitos de hardware

- Descarga inicial: 1,6 GB para el conjunto completo del repositorio; la aplicación Maya los descarga en el primer arranque.
- VRAM estimada: no disponible. El autor no publica requisitos ni tamanos por fichero. Al tratarse de redes de visión de tamano moderado y no de modelos de lenguaje, la ejecución por fichero suele ser viable en GPU de gama consumer, pero esta afirmación no está confirmada por ninguna medición publicada.
- GPU recomendadas: no disponibles en la información proporcionada (no se especifican A100, H100, RTX 4090 ni equivalentes).
- Viabilidad en GPU consumer: no confirmada con datos; la restricción realista es que cada red se ejecute por separado y no todas simultáneamente en memoria.
- Opciones de despliegue: onnxruntime (CPU y GPU), onnxruntime-gpu, TensorRT, OpenVINO, DirectML y OpenCV DNN para los ficheros `.onnx`; PyTorch es necesario para `rd64-uni-refined.pth`.
- Latencia y throughput: no disponibles. No se han publicado tiempos de inferencia por fichero ni a resoluciones concretas.
- Almacenamiento: conviene reservar al menos 1,6 GB para los pesos y espacio adicional para caché de modelos intermedios.

## Comparativa con modelos similares

| Alternativa | Contenido | Formatos | Licencia | Uso comercial |
|---|---|---|---|---|
| `jitendra25/maya-models` | 14 pesos de detección, reconocimiento, swap, restauración, parsing y máscaras | ONNX (13) y PyTorch (1) | Mixta, según fichero | Parcial: depende de cada componente |
| Repositorios originales de InsightFace | Pesos de `det_10g`, `w600k_r50`, `inswapper_128`, `2d106det` y `scrfd_2.5g_bnkps` | ONNX | Solo investigación no comercial, según la model card de Maya | No, para los modelos señalados |
| GFPGAN, GPEN y CodeFormer (proyectos originales) | Pesos de restauración facial por separado | PyTorch, con conversiones a ONNX | Cada proyecto tiene la suya; CodeFormer restringido a no comercial según la model card | Depende del proyecto |
| Aplicaciones de swap de rostros que integran estos mismos modelos | Pipeline completo, no solo pesos | No disponible en la información | No disponible en la información | No disponible en la información |

La comparación relevante no es de rendimiento (no hay métricas), sino de empaquetado: este repositorio es una redistribución de pesos ajenos, por lo que su comportamiento es idéntico al de los modelos originales y su licencia efectiva es la más restrictiva de los ficheros que se usen.

## Limitaciones y advertencias

- Ningún fichero ha sido entrenado por el autor del repositorio; no hay garantía de versionado, verificación de integridad ni mantenimiento por parte del recopilador.
- Licencia mixta: los modelos de InsightFace (`inswapper_128`, `det_10g`, `w600k_r50`, `2d106det`, `scrfd_2.5g_bnkps`) y CodeFormer se distribuyen solo para investigación no comercial. Verificar la licencia de cada fichero antes de cualquier uso comercial es obligatorio.
- Riesgo grave de uso indebido: la propia model card pide intercambiar rostros solo con consentimiento de la persona afectada y prohíbe usar los modelos para enganar, acosar o suplantar a alguien.
- Implicaciones legales: el uso de datos biométricos y la generación de contenido sintético con personas reales están sujetos al RGPD y a las obligaciones de transparencia sobre contenido generado, que varían por jurisdicción.
- Sesgos conocidos: no se documentan. Los detectores y modelos de parsing heredan los sesgos de sus datasets originales, pero no se aporta ningún análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero las redes de restauración (GFPGAN, GPEN, CodeFormer) pueden generar detalle facial plausible que no existe en la imagen original, lo que es problemático en contextos forenses o documentales.
- Ausencia total de benchmarks: no hay métricas que permitan estimar la calidad del swap, la tasa de falsos positivos de los detectores ni la fidelidad de la restauración.
- Idiomas: no aplica, salvo el prompt textual de CLIPSeg, del que no se especifica cobertura idiomática.
- Fechas de creación y actualización declaradas en HuggingFace (2026-10-13) y 0 descargas: el repositorio no muestra señales de adopción ni de actividad posterior.
- Seguridad: descargar pesos de terceros implica ejecutar artefactos binarios; conviene validar los ficheros antes de cargarlos en un entorno de producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jitendra25/maya-models
- Repositorio de la aplicación Maya: https://github.com/jitendra205saini/Maya
- Proyectos de origen citados en la model card (sin URL incluida en la información proporcionada): InsightFace, YOLOv8-face, Pytorch_Retinaface, GFPGAN (TencentARC), GPEN, CodeFormer, Rope, face-parsing.PyTorch y CLIPSeg
