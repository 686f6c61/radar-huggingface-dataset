# oo2223/PlantID-Recognizer

## Resumen

PlantID-Recognizer es un clasificador de imagenes de plantas desarrollado por el usuario oo2223 para la aplicacion Plant ID. Se trata de un fine-tuning del modelo `mobilenetv4_conv_medium.e500_r224_in1k` de la libreria timm (preentrenado en ImageNet-1k) que reconoce 857 especies de plantas presentes en Tailandia, incluyendo plantas silvestres, de jardin, de interior y todas las de la lista de seguridad de la aplicacion. El modelo se distribuye en formato ONNX (opset 17, fp32, 38 MB) y esta disenado para inferencia en dispositivo (on-device), ejecutandose en un telefono en menos de un segundo.

El modelo no opera de forma autonoma en la aplicacion: sus cinco mejores coincidencias, con sus puntuaciones, se pasan a un modelo de chat (oo2223/PlantID-Qwen3.5-4B-GGUF) que responde a partir de esa lista corta en lugar de adivinar un nombre. Esta arquitectura de dos etapas (clasificador + LLM) reduce el riesgo de alucinacion en la identificacion de especies.

La relevancia del modelo radica en su enfoque practico: un clasificador ligero y rapido, con calibracion documentada de sus puntuaciones de confianza, orientado a un caso de uso concreto (identificacion de flora tailandesa) y con datos de entrenamiento trazables (fotos de iNaturalist con creditos y licencias por imagen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 Conv Medium (CNN, fine-tuning de `timm/mobilenetv4_conv_medium.e500_r224_in1k`) |
| Parametros totales | no disponible (pesos ONNX de 38 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 224 x 224 x 3) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es fp32; el tag `base_model:quantized` sugiere cuantizacion del modelo base, pero no se detalla) |
| Idiomas soportados | th, en (etiquetas de especies en tailandes e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, fp32, 38 MB) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional MobileNetV4 en su variante Conv Medium, preentrenada en ImageNet-1k y afinada para clasificacion de 857 especies de plantas. La entrada es un tensor float32 `[N, 3, 224, 224]` en RGB con normalizacion ImageNet (media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`); el preprocesamiento consiste en redimensionar el lado corto a 224, recorte central de 224 x 224 y escalado a 0-1. La salida es una softmax sobre 857 especies.

El entrenamiento utilizo 90.971 fotos de 857 especies procedentes de iNaturalist (una foto por observacion), priorizando observaciones tailandesas y completando con el resto del mundo. Se incluyeron observaciones de grado investigacion y observaciones cultivadas con identificacion consensuada por la comunidad. El split se realizo por observacion (nunca por imagen) para evitar fuga de datos: 73.037 de entrenamiento, 8.967 de validacion y 8.967 de test. Se entrenaron 30 epocas con AdamW (lr 2e-3, weight decay 0.05), 1 epoca de warm-up seguida de cosine, label smoothing 0.1, y aumentacion de datos con RandomResizedCrop, volteos, TrivialAugment y random erasing. El entrenamiento completo se ejecuto en una unica GTX 1080 Ti en aproximadamente 2,2 horas. Las fotos de entrenamiento proceden de iNaturalist: 71.066 bajo CC BY 4.0 y 19.905 bajo CC0, con autoria y licencia documentadas en `photo-credits.csv`.

## Capacidades

- Clasificacion de imagenes de plantas en 857 especies de Tailandia (plantas silvestres, de jardin, de interior y de la lista de seguridad de la app).
- Salida de probabilidades softmax calibradas: las puntuaciones son una guia fiable de la certeza del modelo (cuando el primer acierto puntua 60% o mas, acierta el 92-99% de las veces; por debajo de 20%, solo el 30%).
- Identificacion a partir de fotos parciales (hoja, flor o fruto), no solo de la planta completa.
- Metadatos por clase en `labels.json`: nombre cientifico, nombre tailandes, nombre ingles, familia, id de taxon de iNaturalist y flag de lista de seguridad.
- Inferencia en dispositivo en menos de un segundo (modelo de 38 MB en fp32).
- Integracion con un LLM de chat: el modelo proporciona el top-5 con puntuaciones y el LLM responde a partir de esa lista corta.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagen.

## Casos de uso

- Identificacion de plantas en aplicacion movil: el modelo clasifica una foto tomada con el telefono y devuelve el top-5 de especies con puntuaciones; al ejecutarse on-device en menos de un segundo, permite una experiencia interactiva sin conexion y sin enviar imagenes a un servidor.
- Evaluacion de seguridad de plantas para uso domestico: gracias al flag de lista de seguridad en `labels.json`, la app puede advertir cuando la especie identificada figura en la lista de plantas peligrosas, siempre como apoyo y no como decision definitiva.
- Asistente conversacional botanico: al pasar el top-5 al modelo de chat PlantID-Qwen3.5-4B-GGUF, se pueden generar respuestas contextualizadas sobre cuidados, toxicidad o habitat a partir de las especies candidatas, reduciendo la alucinacion del LLM.
- Educacion y divulgacion de flora tailandesa: la aplicacion puede mostrar nombre cientifico, nombre tailandes, nombre ingles y familia de la especie, util para excursionistas, estudiantes y aficionados a la botanica en Tailandia.
- Catalogacion de observaciones ciudadanas: el clasificador puede preetiquetar fotos de iNaturalist o de otras plataformas para agilizar la revision por parte de la comunidad, usando el top-5 como sugerencia.
- Filtrado previo en pipelines de vision: en un sistema de monitorizacion de cultivos o jardines, el modelo puede actuar como primera etapa para descartar imagenes no relevantes o agrupar por especie antes de un analisis mas costoso.
- Aplicaciones de realidad aumentada o guias de campo: la inferencia rapida y el tamano reducido permiten integrar el modelo en apps de excursionismo o guias de identificacion de campo sin depender de conectividad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test retenido (8.967 fotos, split por observacion):

| Metrica | Resultado |
|---|---|
| Top-1 (primera coincidencia correcta) | 69,9% |
| Top-5 (especie correcta entre las 5 primeras) | 87,1% |
| Top-1 en fotos tomadas en Tailandia | 76,5% |

Calibracion de las puntuaciones (sobre 2.989 fotos de test):

| Puntuacion del primer acierto | Precision observada |
|---|---|
| 60% o mas | 92-99% |
| Por debajo de 20% | 30% |

No se han publicado comparaciones con otros modelos de clasificacion de plantas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es de 38 MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer y en memoria de telefono.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU en dispositivos moviles. Para entrenamiento se uso una unica GTX 1080 Ti (aproximadamente 2,2 horas).
- Cabe en cualquier GPU consumer (GTX 1080 Ti o superior, RTX 3060, RTX 4090, etc.) y en hardware movil.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto), con posibilidad de conversion a otros runtimes de ONNX; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de vision de este tipo.
- Latencia y throughput: la model card indica inferencia en un telefono en menos de un segundo; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de clasificacion de plantas tailandesas en la documentacion proporcionada. Como referencia estructural, el modelo se basa en `timm/mobilenetv4_conv_medium.e500_r224_in1k` (clasificador generico de ImageNet-1k, 1.000 clases, licencia Apache 2.0), del que hereda arquitectura y preentrenamiento pero no la tarea ni las clases. No se han publicado comparaciones con otros clasificadores de flora (por ejemplo, modelos especializados en identificacion botanica) en la informacion disponible.

## Limitaciones y advertencias

- Solo conoce sus 857 especies: cualquier otra planta, o cualquier imagen que no sea una planta, se asigna a la especie mas cercana, normalmente con puntuacion baja. No debe usarse por si solo para decidir si una planta es segura al tacto o al consumo.
- Las fotos de entrenamiento son de iNaturalist y a menudo muestran una hoja, flor o fruto en lugar de la planta completa, lo que puede afectar al rendimiento en fotos de planta entera.
- Especies muy similares (por ejemplo, dos especies de Gomphrena) se confunden con frecuencia.
- Las especies raras tienen menos fotos de entrenamiento (minimo 25) y obtienen puntuaciones mas bajas.
- Riesgo de alucinacion en el sistema completo: aunque el clasificador reduce el riesgo al limitar el top-5, el LLM de chat que consume sus resultados podria introducir informacion incorrecta sobre cuidados o toxicidad.
- La cobertura geografica esta sesgada hacia Tailandia; el rendimiento en otras regiones puede ser inferior (top-1 global 69,9% frente a 76,5% en fotos tailandesas).
- Licencia Apache 2.0: permite uso comercial, pero las fotos de entrenamiento tienen licencias CC BY 4.0 y CC0, con atribucion documentada en `photo-credits.csv`; conviene revisar las obligaciones de atribucion si se redistribuye el modelo o sus derivados.
- El modelo no genera texto ni soporta razonamiento, tool calling ni agentes; cualquier funcionalidad conversacional debe delegarse al modelo de chat asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oo2223/PlantID-Recognizer
- Modelo de chat asociado: https://huggingface.co/oo2223/PlantID-Qwen3.5-4B-GGUF
- Modelo base en timm: https://huggingface.co/timm/mobilenetv4_conv_medium.e500_r224_in1k
- iNaturalist (fuente de las fotos de entrenamiento): https://www.inaturalist.org
- Codigo de fine-tuning: `tools/fine-tune/vision/` en el proyecto Plant ID (`build_photos.py`, `train_recognizer.py`); no se proporciona URL directa en la informacion disponible.
