# patrykorwat/metis-yolov8n-coco

## Resumen

El modelo `patrykorwat/metis-yolov8n-coco` es una compilación del detector de objetos YOLOv8n (variante nano de la familia YOLOv8) entrenado sobre el conjunto de datos COCO con 80 clases, preparado específicamente para ejecutarse en el acelerador neuronal Axelera Metis NPU. Lo ha desarrollado el usuario patrykorwat utilizando el Voyager SDK de Axelera, mediante el comando `axzoo build yolov8n_coco --backend axrelay --cal-source repr`, que genera un artefacto `.axm` optimizado para ese hardware.

Este modelo resuelve el problema de desplegar detección de objetos en dispositivos de borde con restricciones de potencia y latencia, aprovechando la aceleración NPU de Axelera en lugar de depender de GPU o CPU. Su relevancia actual radica en la creciente demanda de soluciones de visión por computador en cámaras IP y sistemas de videovigilancia, donde Frigate es un software habitual. Al estar ya compilado y listo para usar, elimina la necesidad de que el usuario realice el proceso de conversión y calibración, simplificando la integración.

La arquitectura subyacente es YOLOv8n, un modelo de detección de una sola etapa basado en redes neuronales convolucionales, con un tamaño reducido que lo hace adecuado para inferencia en tiempo real en hardware de borde. Sin embargo, no se proporcionan detalles específicos sobre el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de visión sin componente de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (compilado para Axelera Metis NPU) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible (el artefacto `.axm` esta precompilado y optimizado para el NPU) |
| Idiomas soportados | no disponible (modelo de deteccion de objetos, sin procesamiento de lenguaje) |
| Licencia | other (especificada como "other" en la model card; no se detallan los terminos exactos) |
| Formato de pesos | `.axm` (formato propietario de Axelera para su NPU) |

## Arquitectura y entrenamiento

El modelo base es YOLOv8n, un detector de objetos de una sola etapa desarrollado por Ultralytics, que utiliza una red troncal CSPDarknet modificada y un cuello PAN-FPN, con una cabeza de detección acoplada que predice cajas y clases directamente. La variante "nano" es la más ligera de la familia YOLOv8, diseñada para maximizar la velocidad en hardware limitado, aunque sacrifica algo de precisión respecto a modelos más grandes como YOLOv8s o YOLOv8m.

El entrenamiento original se realizó sobre el conjunto de datos COCO (Common Objects in Context), que contiene 80 categorías de objetos cotidianos, con más de 200 000 imágenes etiquetadas. El proceso de compilación para Axelera Metis transforma los pesos originales a un formato optimizado para el NPU, aplicando cuantización y calibración mediante el backend `axrelay` y la fuente de calibración `repr` (representativa). Este paso es crucial para garantizar que el modelo se ejecute de forma eficiente en el hardware de Axelera, reduciendo la precisión numérica a enteros de baja precisión sin una pérdida significativa de rendimiento.

No se dispone de información sobre el número exacto de tokens de entrenamiento, el proceso de alineación (RLHF/DPO) ni otras innovaciones técnicas, ya que la model card se limita a describir el proceso de compilación y el uso previsto.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza hasta 80 clases de objetos del conjunto COCO, incluyendo personas, vehículos, animales, objetos cotidianos, etc.
- Inferencia en tiempo real: gracias a la compilación para el NPU Axelera Metis, está optimizado para aplicaciones de baja latencia en dispositivos de borde.
- Integración con Frigate: el modelo se puede cargar directamente en Frigate mediante el plugin de tipo `axelera`, apuntando al archivo `.axm` alojado en Hugging Face.
- Sin soporte de tool calling ni agentes: al ser un modelo puramente de visión, no tiene capacidades de razonamiento simbólico ni interacción con herramientas.
- Sin capacidades multilingües: no procesa lenguaje natural, por lo que no aplica.
- Sin modo de pensamiento ni generación de texto: su salida es exclusivamente un conjunto de detecciones (cajas, clases y confianzas).

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede analizar flujos de vídeo de cámaras IP para detectar personas, vehículos o animales, activando alertas cuando se supera un umbral de confianza. Su compilación para el NPU Axelera permite ejecutarlo en dispositivos de bajo consumo, como el propio hardware Metis, sin necesidad de un servidor central.
- Monitorización de tráfico: en intersecciones o carreteras, se puede utilizar para contar vehículos, clasificarlos (coche, moto, autobús, etc.) y estimar densidad, alimentando sistemas de gestión de semáforos o informes de afluencia.
- Control de acceso en entornos industriales: detectar la presencia de personas en zonas restringidas o verificar el uso de equipos de protección (aunque el modelo solo detecta objetos, no atributos como cascos, por lo que requeriría un modelo adicional).
- Automatización del hogar: integrarlo en un sistema Frigate para detectar mascotas o personas y activar acciones domésticas, como encender luces o enviar notificaciones al móvil.
- Análisis de imágenes estáticas: procesar lotes de fotografías para extraer metadatos de objetos, útil en aplicaciones de archivado o indexación de contenido visual.
- Prototipado rápido en edge AI: los desarrolladores que trabajan con el SDK de Axelera pueden usar este modelo como referencia para validar sus propias compilaciones o como punto de partida para transferir aprendizaje a dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, latencia o throughput. Dado que se trata de una compilación de YOLOv8n, se puede esperar un rendimiento similar al del modelo original en términos de precisión (típicamente un mAP50 de alrededor de 0.37 en COCO), pero no se confirma este dato en la fuente. Se recomienda consultar la documentación de Axelera para obtener mediciones específicas en el hardware Metis.

## Requisitos de hardware

- Hardware objetivo: Axelera Metis NPU, un acelerador de inferencia de borde diseñado para visión por computador. No se especifica la versión exacta del dispositivo.
- VRAM: no aplicable, ya que el modelo se ejecuta en el NPU y no requiere VRAM de GPU. El consumo de memoria del NPU depende de la implementación del SDK, pero no se proporcionan cifras.
- GPU: no se requiere GPU para la inferencia, ya que el artefacto `.axm` está diseñado para el NPU. Sin embargo, el proceso de compilación con el Voyager SDK sí puede requerir una máquina de desarrollo con recursos suficientes (no especificados).
- Despliegue: el modelo se integra en Frigate mediante el plugin `type: axelera`, apuntando a la URL del archivo `.axm`. Alternativamente, se puede usar el nombre de preset `yolov8n-coco` del SDK zoo sin necesidad de descarga.
- Latencia y throughput: no disponibles. Dependen del hardware Metis concreto y de la configuración del pipeline de vídeo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| patrykorwat/metis-yolov8n-coco | YOLOv8n compilado para Axelera | no disponible | no aplica | no disponible | other | Hugging Face |
| Ultralytics YOLOv8n original | YOLOv8n | ~3.2M (dato público, no confirmado en la fuente) | no aplica | mAP50 ~0.37 en COCO (dato público) | AGPL-3.0 | Ultralytics, PyPI |
| YOLOv5n | YOLOv5n | ~1.9M (dato público) | no aplica | mAP50 ~0.28 en COCO (dato público) | AGPL-3.0 | Ultralytics, GitHub |

La comparativa se basa en datos públicos de los modelos originales, no en mediciones de esta compilación concreta. La principal diferencia es el formato de salida (`.axm` frente a `.pt` o `.onnx`) y la optimización específica para el hardware Axelera, lo que limita su uso a ese ecosistema.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del conjunto de datos COCO, que puede tener una representación desigual de ciertos grupos demográficos o contextos geográficos. No se ha realizado ningún ajuste específico para mitigarlos.
- Riesgo de alucinación: en detección de objetos, el riesgo se manifiesta como falsos positivos (detectar objetos que no existen) o falsos negativos. La confianza de salida debe calibrarse para el caso de uso concreto.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene estado conversacional. Su alcance se limita a imágenes individuales o flujos de vídeo.
- Restricciones de licencia: la licencia está marcada como "other", lo que implica que no se especifican los términos. No se puede asumir que sea de uso libre para fines comerciales. Se recomienda contactar con el autor para aclarar las condiciones.
- Dependencia de hardware propietario: el artefacto `.axm` solo funciona en el NPU Axelera Metis. No es portable a otras plataformas (GPU, CPU, otros NPU) sin recompilar el modelo desde el SDK.
- Falta de documentación: la model card es muy escueta y no incluye detalles sobre el proceso de cuantización, la precisión tras la compilación ni los requisitos de versión del SDK.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrykorwat/metis-yolov8n-coco
- Repositorio de ejemplo de detección con YOLOv8 (no oficial): https://github.com/rya3075/Object-Detection-on-COCO-Dataset-using-YOLOv8
- Documentación de COCO en Ultralytics: https://docs.ultralytics.com/datasets/detect/coco
- Listado de empresas de NPU para edge AI (contexto del ecosistema): https://www.libreyolo.com/articles/edge-ai-npu-companies-computer-vision
