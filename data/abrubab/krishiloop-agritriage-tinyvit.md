# ABRUBAB/krishiloop-agritriage-tinyvit

## Resumen

KrishiLoop AgriTriage es un clasificador de imagenes de hojas de plantas desarrollado por el equipo KrishiLoop para el International AI Builders Congress 2026. Se trata de un estudiante TinyViT de aproximadamente 11 millones de parametros, destilado a partir de tres profesores de vision de gran tamano (DINOv2, CLIP y Perception Encoder), que devuelve puntuaciones sobre 89 enfermedades de cultivos a partir de una unica fotografia de hoja procesada completamente offline.

El elemento diferencial no es el clasificador en si, sino la compuerta de seguridad basada en prediccion conforme (conformal prediction) que lo envuelve. En lugar de mostrar una unica etiqueta, el sistema decide entre tres acciones: actuar con una enfermedad concreta, presentar una lista corta de dos o tres candidatas o derivar la foto a un agente humano. Esta arquitectura de tres niveles esta pensada para evitar decisiones de fumigacion basadas en una prediccion poco fiable.

El modelo se distribuye como un unico archivo ONNX de 11,5 MB con pesos INT8, pensado para ejecutarse en el navegador mediante onnxruntime-web y en el propio telefono del agricultor. Incluye salidas de explicabilidad integradas (Grad-CAM verdadero y celdas CAM) y una licencia restringida a investigacion y demostracion que impide su uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (vision transformer destilado de DINOv2, CLIP y Perception Encoder) |
| Parametros totales | 11M (aproximado, segun nombre del modelo TinyViT-11M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | INT8 (archivo distribuido); FP32 mencionado en resultados de test |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | research-and-demo (other) |
| Formato de pesos | ONNX (`model_xai.onnx`, 11,5 MB) |

## Arquitectura y entrenamiento

El modelo es un TinyViT de aproximadamente 11 millones de parametros entrenado mediante destilacion de conocimiento desde tres profesores de vision de gran escala: DINOv2, CLIP y Perception Encoder. La tarea es clasificacion de imagenes en 89 clases de enfermedades de cultivos, con metadatos de cultivo asociados a cada clase en `config.json`. La entrada es una imagen RGB de 224x224 obtenida tras redimensionar el lado corto a 256 y aplicar un recorte central de 224, sin normalizacion por media y desviacion estandar (los pixeles se escalan a [0, 1]).

El archivo ONNX exportado incorpora salidas adicionales de explicabilidad: `xai_gradcam` (Grad-CAM verdadero calculado con un gradiente analitico de LayerNorm, con un error relativo de 1,9e-9 frente a diferencias centrales), `xai_cam` (celdas CAM y su sesgo, que reconstruyen los logits) y la atencion de la etapa 3. Sobre las predicciones del clasificador se aplica una compuerta conforme calibrada con cuantiles y un umbral de energia almacenados en `config.json`, que determina la cobertura objetivo (90%) y la decision entre actuar, listar candidatas o derivar. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no aplicable en un modelo de vision).

## Capacidades

- Clasificacion de imagenes de hojas en 89 enfermedades de cultivos, con metadatos de cultivo asociados a cada clase.
- Prediccion conforme con compuerta de seguridad de tres niveles: `act` (una enfermedad), `shortlist` (dos o tres candidatas) y `refer` (derivacion a un agente humano).
- Explicabilidad integrada: Grad-CAM verdadero y celdas CAM que reconstruyen los logits, utiles para auditoria y presentacion al usuario.
- Inferencia offline: el modelo funciona sin conexion tanto en el navegador (onnxruntime-web) como en el dispositivo movil.
- Procesamiento de imagenes con rotacion EXIF en el preprocesado de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Diagnostico de enfermedades en campo sin conexion: el agricultor fotografia una hoja y el modelo, ejecutandose en el propio telefono, devuelve una prediccion o una lista corta sin enviar datos a ningun servidor. Adecuado por su tamano (11,5 MB INT8) y su diseno offline.
- Triaje con derivacion humana: cuando la compuerta determina `refer`, la foto se envia al oficial de Krishi mas cercano, evitando decisiones de tratamiento basadas en predicciones de baja confianza.
- Asistencia a tecnicos agricolas: la lista corta de dos o tres enfermedades candidatas sirve como apoyo para inspeccion visual posterior, reduciendo el espacio de busqueda del experto.
- Auditoria y transparencia de decisiones: las salidas Grad-CAM y CAM permiten mostrar que regiones de la hoja sustentan la prediccion, util para formacion y para generar recibos firmados de recomendacion.
- Despliegue web ligero: el mismo archivo ONNX se ejecuta en el navegador con onnxruntime-web, lo que permite demos interactivas sin backend.
- Investigacion en prediccion conforme aplicada a vision: el modelo y su configuracion (cuantiles, umbral de energia, cobertura objetivo) sirven como referencia reproducible para estudiar compuertas de abstención en clasificacion de imagenes.
- Filtrado previo en pipelines de diagnostico fitosanitario: como primera etapa barata que descarta casos claros y escala los inciertos a modelos mayores o a revision humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test PlantWild (3.663 fotos):

| Modo | Responde solo (act) | Precision cuando responde | Listas cortas | Derivaciones | Cobertura |
|---|---|---|---|---|---|
| Cualquier cultivo | 63,6% | 91,3% | 17,8% | 18,6% | 91,7% |
| Cultivo conocido | 88,1% | 92,1% | 7,1% | 4,8% | 91,7% |

- Precision top-1 del archivo INT8: 77,5% (FP32: 77,8%).
- La compuerta apunta a una cobertura del 90%; los resultados proceden de una unica particion de test de un unico dataset publico.
- Fuera de dominio el modelo es notablemente mas debil: en fotos de campo de PlantDoc la precision cae de forma acusada salvo que la compuerta presente lista corta o derive. Por eso KrishiLoop nunca muestra una unica puntuacion como respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX pesa 11,5 MB en INT8 y la entrada es de 224x224, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU (CPUExecutionProvider de onnxruntime) y en navegador con onnxruntime-web. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia pero no es necesaria.
- Cabe en cualquier GPU consumer y en telefonos moviles; el despliegue previsto es en el dispositivo del agricultor.
- Opciones de despliegue: onnxruntime (CPU o GPU), onnxruntime-web en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision ONNX).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KrishiLoop AgriTriage TinyViT | ~11M | Imagen 224x224, 89 clases | Top-1 77,5% (INT8) en PlantWild; 91,3% de precision con cobertura 91,7% | research-and-demo | ONNX en Hugging Face |
| DINOv2 (profesor) | no disponible | Imagen | No comparable directamente (modelo base, no clasificador de 89 clases) | no disponible | Hugging Face / Meta |
| CLIP (profesor) | no disponible | Imagen + texto | No comparable directamente | no disponible | Hugging Face / OpenAI |
| Perception Encoder (profesor) | no disponible | Imagen | No comparable directamente | no disponible | no disponible |

No se dispone de datos publicados que permitan una comparacion cuantitativa con clasificadores fitosanitarios alternativos de la misma categoria; los profesores citados son modelos base de vision, no clasificadores de enfermedades, por lo que la comparacion es estructural y no de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion y demostracion: la licencia `research-and-demo` restringe el uso comercial. Los datos de entrenamiento (PlantWild) mantienen sus propios terminos y deben revisarse antes de cualquier uso comercial.
- El modelo no debe ser la unica base para una decision de fumigacion; en KrishiLoop el consejo proviene de reglas con fuentes y un recibo firmado, y las fotos inciertas se derivan a una persona.
- Rendimiento fuera de dominio debil: en PlantDoc la precision cae de forma acusada salvo que la compuerta presente lista corta o derive.
- Los resultados provienen de una unica particion de test de un unico dataset publico (PlantWild, 3.663 fotos), lo que limita la generalizacion de las cifras.
- Riesgo de confusion entre enfermedades visualmente similares y entre cultivos; la compuerta mitiga pero no elimina este riesgo.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre un dataset concreto, puede estar sesgado hacia las condiciones de captura, cultivos y regiones representadas en PlantWild.
- Solo procesa imagenes de hojas; no admite texto, audio ni otras modalidades, y no tiene capacidades multilingues.
- El modelo solo ve fotos de hojas y, en el telefono, estas no salen del dispositivo; no se declara tratamiento de datos personales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ABRUBAB/krishiloop-agritriage-tinyvit
- Demo: https://krishiloop.vercel.app
- Codigo: https://github.com/krishiloop/krishiloop
- Model card de referencia (licencia): https://github.com/krishiloop/krishiloop/blob/main/ml/vision/MODEL_CARD.md
- Revision y resultados detallados: `REVIEW.md` en el repositorio (https://github.com/krishiloop/krishiloop)
