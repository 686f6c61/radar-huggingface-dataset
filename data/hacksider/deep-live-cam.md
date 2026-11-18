# hacksider/deep-live-cam

## Resumen

Deep-Live-Cam es un proyecto de código abierto publicado por el usuario hacksider en Hugging Face que implementa *face swapping* (intercambio de rostros) en tiempo real sobre vídeo y webcam. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un conjunto de pesos y artefactos (principalmente ONNX y safetensors) que alimentan un pipeline de sustitución facial basado en modelos de difusión y detectores/embedders auxiliares. El repositorio tiene un tamaño de 55,8 GB, lo que refleja la acumulación de múltiples checkpoints y dependencias del ecosistema.

El proyecto se hizo popular por su capacidad de realizar *deepfakes* en directo con una sola imagen de referencia, sin necesidad de entrenamiento adicional. Resuelve el problema de la sustitución facial accesible para usuarios sin infraestructura de entrenamiento, pero plantea riesgos evidentes de suplantación de identidad y desinformación. La licencia GPL-3.0 impone obligaciones de copyleft para cualquier redistribución o derivado.

La información pública disponible en la model card es mínima (solo la licencia), por lo que muchos parámetros técnicos deben marcarse como no disponibles. La ficha se limita a lo que puede inferirse de los metadatos, los tags y la naturaleza conocida del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de difusión + detectores/embedders faciales; artefactos ONNX y safetensors) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX y safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Los tags del repositorio indican el uso de `diffusers` y pesos en `onnx` y `safetensors`, lo que sugiere un pipeline compuesto por uno o varios modelos de difusión para la generación/síntesis facial, junto con módulos auxiliares de detección de rostro, estimación de landmarks y *face embedding* para alinear la identidad de origen con el rostro destino. El tamaño del repositorio (55,8 GB) es coherente con la presencia de múltiples checkpoints y variantes.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (improcedentes en este tipo de modelo). Tampoco se documentan innovaciones técnicas específicas más allá de la propia inferencia en tiempo real, que en la práctica del proyecto se apoya en la ejecución optimizada de modelos ONNX sobre CPU/GPU.

## Capacidades

- Intercambio de rostros en tiempo real sobre flujos de vídeo y webcam.
- Sustitución facial a partir de una única imagen de referencia (sin entrenamiento adicional por identidad).
- Procesamiento de vídeo pregrabado y de captura en directo.
- Integración con el ecosistema `diffusers` y ejecución de artefactos ONNX.
- No es un modelo de lenguaje: no genera texto, no razona, no hace *tool calling*, no soporta agentes ni capacidades multilingües en el sentido habitual.
- No se documentan modos de *thinking*, visión general, audio ni otras capacidades especiales más allá del *face swapping*.

## Casos de uso

- Producción audiovisual y doblaje: sustituir el rostro de un actor por el de un doble en escenas concretas, usando una imagen de referencia, para reducir costes de rodaje o mantener continuidad visual.
- Creación de contenido para redes sociales: generación de vídeos con avatares personalizados para *streamers* o creadores que quieran proteger su identidad real.
- Investigación en visión por computador: banco de pruebas para estudiar detección de *deepfakes*, robustez de sistemas antifraude y métricas de realismo facial.
- Prototipado de experiencias interactivas: instalaciones artísticas o demos en ferias donde el visitante ve su rostro transformado en tiempo real.
- Formación y simulación: escenarios de entrenamiento donde se requiere anonimizar o sustituir rostros de participantes en grabaciones.
- Pruebas de *red teaming* y concienciación en ciberseguridad: generar muestras sintéticas controladas para evaluar la resiliencia de sistemas de verificación de identidad.
- Postproducción de bajo presupuesto: corrección de continuidad facial en cortometrajes o vídeos corporativos sin pipeline de VFX dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamaño del repositorio (55,8 GB) incluye múltiples checkpoints, por lo que la huella en memoria depende del subconjunto de modelos cargados.
- GPU recomendadas: no documentadas. Por la naturaleza del proyecto (ejecución ONNX en tiempo real) se suele recurrir a GPU NVIDIA con soporte CUDA; modelos como RTX 3060/4070 o superiores son habituales en la comunidad, aunque no hay confirmación oficial en la información proporcionada.
- Compatibilidad con GPU de consumo: probable según la práctica habitual del proyecto, pero no confirmada en los metadatos disponibles.
- Opciones de despliegue: ejecución local mediante el propio repositorio del proyecto; soporte de ONNX Runtime y del ecosistema `diffusers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-Live-Cam (hacksider) | Face swapping en tiempo real | no disponible | no aplica | GPL-3.0 | Hugging Face |
| SimSwap | Face swapping por identidad | no disponible | no aplica | investigación (no comercial en algunas versiones) | GitHub / papers |
| InsightFace (modelos *inswapper*) | Face swapping y reconocimiento | no disponible | no aplica | uso no comercial en muchos checkpoints | GitHub |
| Roop / FaceFusion | Face swapping en tiempo real | no disponible | no aplica | GPL-3.0 (FaceFusion) | GitHub |

La comparación se basa en la categoría funcional (intercambio facial), no en parámetros o benchmarks, ya que no hay datos publicados para este repositorio.

## Limitaciones y advertencias

- Riesgo grave de suplantación de identidad y desinformación: la tecnología permite generar vídeos falsos realistas de personas reales sin su consentimiento.
- La model card no documenta sesgos, pero los sistemas de *face swapping* suelen rendir peor en rostros diversos (tonos de piel, edades, géneros) según la composición del dataset de entrenamiento, que aquí se desconoce.
- Riesgo de artefactos y alucinaciones visuales: parpadeos inconsistentes, bordes, iluminación incoherente o pérdida de detalle en perfiles y oclusiones.
- Licencia GPL-3.0: cualquier redistribución o derivado debe publicarse bajo la misma licencia; esto puede ser incompatible con productos comerciales propietarios.
- Uso comercial: la GPL-3.0 permite uso comercial, pero obliga a liberar el código derivado; además, conviene revisar las licencias de los checkpoints auxiliares incluidos.
- Falta de documentación técnica: ausencia de model card detallada, benchmarks y especificaciones, lo que dificulta la evaluación rigurosa en producción.
- Consideraciones legales: en la UE, el uso de *deepfakes* está sujeto al Reglamento de IA y a normativas de protección de datos; se requiere consentimiento y etiquetado del contenido sintético.
- No apto para tareas de NLP, razonamiento o generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/hacksider/deep-live-cam
- Repositorio del proyecto en GitHub (referencia habitual del autor): no disponible en la información proporcionada
- Paper o documentación técnica: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
