# Shaq2/chashibhai-disease-classifiers

## Resumen

ChashiBhAI es un conjunto de clasificadores de imágenes de enfermedades de cultivos diseñados para ejecutarse íntegramente en el dispositivo móvil, dentro de la aplicación Android del mismo nombre, orientada a agricultores de Bangladés. El modelo, desarrollado por Shakil Ahmed (Shaq2), resuelve el problema del diagnóstico de enfermedades foliares en arroz, brasicáceas (col y coliflor) y maíz sin necesidad de conexión a internet, de modo que las imágenes de las hojas nunca salen del teléfono. La arquitectura empleada es YOLO26-cls de Ultralytics, exportada a TensorFlow Lite en formato FP16, con tamaños de archivo de entre 3 y 10,4 MB según el cultivo.

La relevancia actual del proyecto radica en su enfoque de privacidad y accesibilidad: el diagnóstico se realiza localmente y solo los resultados se envían a un sistema de asesoramiento (KrishokChat) que complementa la clasificación con recomendaciones en bengalí. El repositorio incluye tanto los pesos en formato `.pt` como los gráficos TFLite verificados para su uso en la aplicación, junto con un contrato de preprocesado específico (variante C) que debe respetarse para obtener resultados coherentes con los pesos originales. La licencia MIT cubre los exports y la documentación, pero no las imágenes de entrenamiento ni el código de entrenamiento de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | bengali (bn), ingles (en) en las etiquetas; el modelo es de vision |
| Licencia | MIT (exports y documentacion) |
| Formato de pesos | TFLite (.tflite) y PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26-cls de Ultralytics, una variante de clasificacion de la familia YOLO adaptada para tareas de imagen unica. Los pesos se entrenaron para tres cultivos especificos: arroz (8 clases), brasicaceas (11 clases entre col y coliflor) y maiz (4 clases). No se dispone de informacion publica sobre el numero de imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de aumento o ajuste fino adicional. El repositorio redistribuye unicamente los pesos, no las imagenes de entrenamiento, cuyas licencias pueden ser independientes.

La innovacion principal no esta en la arquitectura, sino en el despliegue: los modelos se exportan a TensorFlow Lite con salida ya softmaxeada y sin NMS, lo que permite una inferencia rapida en dispositivos moviles de gama baja. El preprocesado requerido (variante C) es estricto: redimensionar el lado menor a 640 px, recorte central a 640x640, conversion a RGB y normalizacion dividiendo entre 255. Este contrato se documento tras detectar discrepancias entre la aplicacion original (que usaba letterboxing) y los pesos `.pt`, lo que motivo la correccion para lograr una coincidencia del 100% en top-1 para el modelo de arroz.

## Capacidades

- Clasificacion de enfermedades foliares en tres cultivos: arroz (8 clases), brasicaceas (11 clases) y maiz (4 clases).
- Inferencia completamente local en dispositivo movil, sin conexion a internet ni envio de imagenes a servidores.
- Salida de probabilidades por clase ya normalizadas (softmax), lista para umbralizacion.
- Compatible con el ecosistema Ultralytics para reentrenamiento o evaluacion con los pesos `.pt`.
- Preprocesado documentado y verificado para reproduccion exacta de resultados.
- Soporte para integracion en aplicaciones React Native / Expo mediante TensorFlow Lite.
- Etiquetas en ingles y bengali disponibles en archivos `labels.json` canonicos.

## Casos de uso

- Diagnostico en campo para agricultores de Banglades: el agricultor fotografia una hoja de arroz con su telefono y la aplicacion ChashiBhAI clasifica la enfermedad localmente en menos de un segundo, sin depender de cobertura movil.
- Asesoramiento agricola integrado: tras la clasificacion, el resultado se envia a KrishokChat (un LLM en bengali) para obtener recomendaciones de tratamiento citadas, manteniendo la imagen en el dispositivo.
- Deteccion temprana de brotes: el modelo de arroz distingue entre tizon bacteriano, mancha marron, anublo de la hoja, escaldado, mancha foliar estrecha, hispa del arroz y anublo de la vaina, lo que permite alertas tempranas en cooperativas locales.
- Monitorizacion de cultivos de brasicaceas: con 11 clases (incluyendo podredumbre blanda bacteriana, mancha negra y deficiencia de nutrientes), permite distinguir entre enfermedades fungicas, bacterianas y problemas fisiologicos en col y coliflor.
- Vigilancia de maiz: identifica roya comun, mancha gris de la hoja y tizon foliar del norte, enfermedades que afectan significativamente el rendimiento en la region.
- Investigacion academica y demos: los pesos `.pt` permiten reproducir experimentos de clasificacion de enfermedades vegetales en entornos de investigacion, con la ventaja de un modelo ligero y enfocado a la region.
- Educacion y extensionismo agricola: los resultados de clasificacion pueden usarse para generar materiales de formacion sobre sintomas y manejo de enfermedades en bengali.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la verificacion de preprocesado: el modelo de arroz alcanza una coincidencia del 100% en top-1 entre la salida TFLite y los pesos `.pt` cuando se aplica la variante C de preprocesado. No hay datos de exactitud, precision, recall ni comparaciones con otros modelos.

## Requisitos de hardware

- Los archivos TFLite son muy ligeros: ~3,0 MB para arroz y ~10,4 MB para brasicaceas y maiz, por lo que caben en cualquier smartphone Android con TensorFlow Lite.
- No se requiere GPU para inferencia en movil; la CPU del dispositivo es suficiente para clasificar una imagen de 640x640 en tiempo real.
- Para usar los pesos `.pt` con Ultralytics, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650 o superior), aunque no se han publicado requisitos minimos oficiales.
- Opciones de despliegue: TensorFlow Lite en Android/iOS, Python con `tensorflow` o `tflite-runtime`, y el ecosistema Ultralytics para los pesos `.pt`.
- Latencia y throughput estimados: no disponibles en la documentacion.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de clasificacion de enfermedades de cultivos en la documentacion proporcionada. No se mencionan alternativas como PlantVillage, modelos EfficientNet o MobileNet adaptados a agricultura, ni se ofrecen tablas de rendimiento relativo. Por tanto, no es posible establecer una comparativa objetiva con los datos disponibles.

## Limitaciones y advertencias

- El modelo no es un sustituto de un fitopatologo profesional; los resultados de baja confianza deben provocar una nueva fotografia centrada y bien iluminada.
- Solo cubre tres cultivos (arroz, brasicaceas y maiz) y las clases enumeradas; no detecta otras enfermedades ni plagas fuera de ese conjunto.
- El preprocesado es estricto: cualquier desviacion de la variante C (por ejemplo, usar letterboxing) degrada significativamente la precision, como se observo con la version original de la aplicacion.
- Los pesos se redistribuyen bajo licencia MIT, pero las imagenes de entrenamiento pueden tener licencias separadas; el repositorio no incluye el dataset.
- La verificacion de preprocesado para el modelo de maiz esta pendiente de una prueba de fidelidad fuera de distribucion (OOD), por lo que su comportamiento en imagenes reales no esta completamente validado.
- No se publican metricas de rendimiento (exactitud, F1, etc.), lo que limita la evaluacion objetiva de su calidad.
- El modelo esta entrenado para hojas de cultivos de Bangladez; su comportamiento en otras regiones o variedades puede ser inferior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shaq2/chashibhai-disease-classifiers
- Repositorio GitHub del proyecto: https://github.com/MRSHAKILS/AI-Powered-Smart-Agriculture-Advisory-Platform-for-Bangladesh
- Repositorio complementario KrishokChat (LLM y RAG): https://huggingface.co/RaiyanKhaan/KrishokChat-Advisory-System
- Paper relacionado de KrishokChat: arXiv:2606.29243 (https://arxiv.org/abs/2606.29243)
