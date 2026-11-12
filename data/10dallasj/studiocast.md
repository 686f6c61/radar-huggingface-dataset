# 10dallasj/studiocast

## Resumen

StudioCast es un paquete de plantillas de metadatos publicado por el usuario 10dallasj en Hugging Face, orientado a la gestión de modelos de vídeo de código abierto dentro de la aplicación StudioCast. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado, sino de un repositorio de configuración que describe cómo organizar, versionar y cargar distintos modelos de visión por computador usados en un pipeline de procesamiento de vídeo: segmentación (matting), detección facial, landmarks faciales, eliminación de ruido y corrección de contacto visual.

El repositorio no contiene binarios de modelos en git. Según la model card, los pesos reales (archivos ONNX y datos dlib) se descargan en tiempo de instalación y se ubican en `$XDG_DATA_HOME/studiocast/models/open_video/`. Cada "pack" incluye un `model.json` con metadatos, un `LICENSE.txt` con la licencia upstream y los artefactos correspondientes. El tamaño del repo (1,4 GB) sugiere que, pese a la afirmación de "metadata-only", hay artefactos o datos auxiliares versionados.

La relevancia de este repositorio es acotada: sirve como referencia para quien quiera entender la estructura de packs de StudioCast o reutilizar las plantillas de configuración de modelos como YuNet (detección facial) o FastDVDnet (denoising de vídeo). No aporta capacidades de generación ni de razonamiento, y no debe confundirse con un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto heterogéneo de modelos: YuNet para detección facial, FastDVDnet para denoising, modelos de matting, landmarks y gaze) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | int8, int8bq y fp32 (YuNet); FP16 y FP32 (gaze-correction-cam); presets sigma15/sigma25/sigma50 (FastDVDnet) |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repo; cada pack incluye `LICENSE.txt` con la licencia upstream |
| Formato de pesos | ONNX (`*.onnx`) y dlib (`shape_predictor_68_face_landmarks.dat`) |

## Arquitectura y entrenamiento

No se trata de un modelo único con una arquitectura definida, sino de una colección de plantillas que referencian modelos de terceros. Las plantillas documentadas incluyen YuNet para detección facial en variantes Good/Better/Best (int8, int8bq, fp32), FastDVDnet para denoising de vídeo con presets de sigma (15, 25, 50) en variantes Good/Better/Best, y gaze-correction-cam para corrección de contacto visual en FP16/FP32 y un placeholder v3. También se mencionan modelos de matting (tarea `matting`) y detectores de landmarks faciales basados en dlib.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO, porque el repositorio no entrena modelos: solo empaqueta metadatos y referencias a binarios que se descargan aparte. La documentación de conversión y hosting se remite a `docs/open_video_model_conversion.md` y la estructura de packs a `docs/open_video_model_packs.md`, archivos no incluidos en la información proporcionada.

## Capacidades

- Detección facial mediante YuNet en tres variantes de calidad (int8, int8bq, fp32).
- Detección de landmarks faciales de 68 puntos mediante dlib (`shape_predictor_68_face_landmarks.dat`).
- Segmentación y matting de vídeo (modelos con `task = "matting"`).
- Eliminación de ruido en vídeo con FastDVDnet y presets de sigma configurables.
- Corrección de contacto visual (gaze correction) en FP16 y FP32.
- Gestión de packs mediante metadatos `model.json` y licencias upstream por pack.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Integración en pipelines de postproducción de vídeo: los packs permiten cargar modelos de matting y denoising de forma estandarizada dentro de StudioCast, sustituyendo scripts ad hoc por una estructura de metadatos común.
- Detección facial en tiempo real: YuNet en variante int8 ofrece un coste computacional bajo y es adecuado para procesar fotogramas en directo en aplicaciones de edición o videoconferencia.
- Seguimiento de landmarks faciales: el predictor de 68 puntos de dlib permite alinear rostros para efectos de retoque, filtros o animación facial.
- Limpieza de metraje con ruido: FastDVDnet con presets sigma15/25/50 permite elegir el nivel de denoising según la calidad del material de origen.
- Corrección de mirada en videollamadas o grabaciones: gaze-correction-cam en FP16 reduce el coste de inferencia en GPUs consumer manteniendo la corrección de contacto visual.
- Referencia para desarrolladores que quieran empaquetar sus propios modelos de vídeo: las plantillas Good/Better/Best y el esquema `model.json` sirven como base para construir packs compatibles con StudioCast.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo concreto de cada pack (YuNet es muy ligero; FastDVDnet y los modelos de matting requieren más memoria).
- GPU recomendadas: no disponible. Los modelos de visión de este tipo suelen ejecutarse en GPUs consumer (RTX 3060 en adelante) y en GPUs de datacenter (A100, H100) sin problema, pero no hay cifras publicadas.
- Cabe en GPU consumer: probablemente sí para YuNet y gaze-correction-cam en FP16; no confirmado para los modelos de matting o denoising de mayor tamaño.
- Opciones de despliegue: los artefactos son ONNX, por lo que son compatibles con ONNX Runtime, TensorRT y OpenVINO; el predictor de dlib requiere la librería dlib. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StudioCast (10dallasj/studiocast) | Colección de plantillas de metadatos para modelos de vídeo | no disponible | no aplica | no disponible (licencias upstream por pack) | Hugging Face, 0 descargas |
| YuNet (upstream) | Detección facial | no disponible | no aplica | no disponible en esta ficha | Incluido como plantilla en StudioCast |
| FastDVDnet (upstream) | Denoising de vídeo | no disponible | no aplica | no disponible en esta ficha | Incluido como plantilla en StudioCast |
| dlib shape predictor 68 | Landmarks faciales | no disponible | no aplica | no disponible en esta ficha | Incluido como plantilla en StudioCast |

No se dispone de datos de rendimiento ni de parámetros de los modelos upstream en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: es un conjunto de plantillas de metadatos, por lo que no puede usarse directamente para inferencia sin descargar los binarios correspondientes.
- La model card indica que los binarios no se versionan en git, pero el tamaño del repo (1,4 GB) es inconsistente con esa afirmación; conviene verificar qué contiene realmente antes de clonarlo.
- No hay licencia declarada a nivel de repositorio; cada pack incluye su propio `LICENSE.txt`, lo que obliga a revisar la licencia upstream de cada modelo antes de uso comercial.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- No hay documentación publicada sobre rendimiento, latencia ni precisión de los modelos incluidos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-02-25) y de actualización (2026-11-12) son posteriores a la fecha actual en muchos entornos; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/10dallasj/studiocast
- Documentación de conversión de modelos (referenciada, no incluida): `docs/open_video_model_conversion.md`
- Documentación de estructura de packs (referenciada, no incluida): `docs/open_video_model_packs.md`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
