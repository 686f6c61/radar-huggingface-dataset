# RKNNAI/RK3576-CNN-yolox-s

## Resumen

RK3576-CNN-yolox-s es un paquete de despliegue, no un modelo entrenado desde cero: se trata de la conversión del detector de objetos YOLOX-s a formato RKNN para ejecutarse en la NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI y deriva del repositorio airockchip/YOLOX y de los ejemplos oficiales de RKNN Model Zoo, con licencia Apache 2.0. Su propósito es ofrecer una configuración lista para producción (pesos cuantizados y ficheros de verificación de integridad) que evite al desarrollador tener que convertir y calibrar el modelo por su cuenta.

Se distribuyen dos configuraciones, ambas con cuantización w8a8 (8 bits en pesos y activaciones) y un único núcleo NPU: una con entrada de 384x640 píxeles y otra con entrada de 640x640 píxeles. Requieren el runtime RKNN v2.4.0 y están limitadas al chip RK3576. Al ser un modelo convolucional de detección, conceptos propios de los modelos de lenguaje como longitud de contexto, parámetros activos, tool calling o razonamiento multi-paso no aplican.

La relevancia es práctica: permite poner en marcha detección de objetos de una sola etapa sobre hardware de borde Rockchip con un consumo energético bajo, sin dependencia de GPU dedicada y con un formato de pesos ya optimizado para la NPU. El repositorio de Hugging Face aparece con 0 descargas, 0 likes y un tamaño declarado de 0.0 GB, por lo que los artefactos binarios podrían no estar alojados ahí; la model card remite a ModelScope y al comando de descarga por revisión `v2.4.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN, detector de objetos de una etapa, familia YOLOX (YOLOX-s) |
| Parametros totales | no disponible en la model card; el proyecto upstream YOLOX publica aproximadamente 8,9 M para YOLOX-s (dato de referencia, no verificado en esta distribucion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen) |
| Resolucion de entrada | 384x640 o 640x640, segun configuracion |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no aplica; etiquetas de clase habituales de COCO en ingles |
| Licencia | Apache License 2.0 |
| Formato de pesos | RKNN (ficheros `.rknn`); el modelo origen procede de airockchip/YOLOX |
| Chip soportado | Rockchip RK3576 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Revision de descarga | v2.4.0 |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

YOLOX es un detector de objetos de una etapa basado en una red troncal tipo CSPDarknet con cuello PAN, que introdujo en su momento tres cambios relevantes frente a la familia YOLOv3/v5: cabeza desacoplada (decoupled head) que separa las ramas de clasificación y regresión, predicción anchor-free y asignación dinámica de etiquetas SimOTA. La variante `s` es la versión pequeña de la familia, pensada para compromisos ajustados entre precisión y coste computacional, y es la que se ha convertido a RKNN en esta distribución. La model card no aporta detalles adicionales sobre el entrenamiento del modelo origen, por lo que no se dispone de información sobre composición del dataset, número de tokens o pasos de optimización más allá de lo publicado en el repositorio airockchip/YOLOX (entrenamiento sobre COCO en el caso del modelo upstream).

Lo específico de esta publicación no es el entrenamiento, sino el proceso de despliegue: conversión del grafo a RKNN y cuantización de 8 bits con calibración para la NPU del RK3576, manteniendo un único núcleo NPU activo. La model card insiste en la verificación previa al despliegue mediante el fichero `SHA256SUMS` incluido en cada configuración, y advierte de que deben usarse ficheros de la misma configuración de forma consistente (no mezclar la variante 384x640 con la 640x640). No se documentan técnicas como decodificación especulativa, atención lineal ni mecanismos equivalentes, que no tienen sentido en este tipo de red.

## Capacidades

- Detección de objetos en imágenes: salida de cajas delimitadoras con clase y puntuación de confianza para las categorías del dataset de entrenamiento (habitualmente las 80 clases de COCO).
- Ejecución en NPU: inferencia acelerada por hardware sobre el SoC RK3576, con pesos cuantizados a 8 bits.
- Dos perfiles de entrada intercambiables: 384x640, orientado a menor coste computacional o a flujos con más frames por segundo, y 640x640, orientado a mayor precisión en objetos pequeños.
- Integración en pipelines de visión artificial: el formato RKNN se consume mediante la API de RKNN Runtime (rknpu2) desde aplicaciones en C/C++ o Python.
- Verificación de integridad: cada configuración incluye sumas SHA-256 para comprobar los artefactos antes del despliegue.
- No soporta: generación de texto, razonamiento, código, matemáticas, tool calling, agentes, diálogo multilingüe, visión-lenguaje ni modo de pensamiento. Es exclusivamente un detector visual.

## Casos de uso

- Videovigilancia en el borde: desplegar el modelo en un dispositivo con RK3576 conectado a una o varias cámaras IP para detectar personas y objetos en tiempo real, sin enviar vídeo a la nube y reduciendo coste de ancho de banda y requisitos de privacidad.
- Conteo y analítica de aforo: usar la variante 384x640 para contar personas que cruzan una línea o entran en una zona, aprovechando que el modelo es de una etapa y ligero, lo que permite procesar varios flujos por dispositivo.
- Robótica móvil y AGV: detección de obstáculos y personas en la trayectoria de un vehículo autónomo de almacén, con la salida de cajas alimentando el módulo de planificación de ruta a bordo del propio robot.
- Inspección industrial: detección de defectos o de piezas mal posicionadas en una cinta transportadora, con la variante 640x640 cuando se necesite mejor resolución efectiva sobre objetos pequeños.
- Control de tráfico y aparcamiento: identificación de vehículos, motocicletas y peatones en intersecciones o accesos, integrando el detector en una controladora de vía con SoC Rockchip.
- Retail y análisis de comportamiento en tienda: detección de personas y productos para métricas de ocupación, flujos por pasillo o alertas de zona restringida, ejecutando todo el cómputo en local.
- Drones y equipos no tripulados: carga de percepción embarcada con bajo consumo, útil cuando el peso y la autonomía impiden usar GPU dedicada en el dron.
- Puerta de entrada para pipelines mayores: usar las detecciones como paso previo de recorte y alimentar después un clasificador o un modelo de reconocimiento que corra en CPU o en otro núcleo del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribución no incluye métricas de precisión (mAP) ni de latencia o frames por segundo. El repositorio upstream de YOLOX publica métricas sobre COCO para el modelo sin cuantizar, pero esas cifras no son extrapolables directamente a esta conversión, ya que la cuantización w8a8 y las resoluciones 384x640 y 640x640 alteran tanto la precisión como el coste. Cualquier valor de mAP o de rendimiento debería medirse sobre el dispositivo RK3576 concreto y con el conjunto de validación propio.

## Requisitos de hardware

- Plataforma obligatoria: SoC Rockchip RK3576 con NPU compatible. El modelo no está pensado para ejecutarse en GPU de escritorio ni en CPU como ruta principal.
- Núcleos NPU: las dos configuraciones usan 1 núcleo NPU.
- Runtime: RKNN Runtime v2.4.0 (librerías rknpu2 / RKNN API). Una versión distinta puede provocar fallos de carga o resultados incorrectos.
- Memoria: no se especifica consumo de VRAM o RAM en la model card; al tratarse de un modelo cuantizado a 8 bits de tamaño pequeño, la huella es reducida, pero la cifra concreta no está disponible.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato RKNN no se ejecuta en CUDA.
- Opciones de despliegue: RKNN Runtime sobre RK3576, con ejemplos de referencia en `rknn_model_zoo/examples/yolox`. Para regenerar o recuantizar el modelo sería necesario RKNN-Toolkit2 en un equipo de desarrollo.
- Latencia y throughput: no disponible en la información proporcionada.
- Verificación previa: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de la configuración antes de desplegar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros (aprox., upstream) | Entrada | Licencia | Disponibilidad en RKNN |
|---|---|---|---|---|---|
| YOLOX-s (esta distribucion) | CNN, una etapa, anchor-free | ~8,9 M (dato upstream, no confirmado aqui) | 384x640 o 640x640 | Apache 2.0 | Si, paquete oficial para RK3576 |
| YOLOX-tiny / YOLOX-nano | CNN, una etapa, anchor-free | Menor que YOLOX-s (cifra no disponible) | configurable | Apache 2.0 | Conversiones disponibles en RKNN Model Zoo segun el proyecto |
| YOLOv8s (Ultralytics) | CNN, una etapa, anchor-free | ~11 M (dato upstream, no verificado) | configurable | AGPL-3.0 (requiere licencia comercial para uso propietario) | Existen conversiones de la comunidad, pero la licencia condiciona el uso comercial |
| YOLOv5s | CNN, una etapa, basada en anchors | ~7 M (dato upstream, no verificado) | configurable | AGPL-3.0 | Conversiones disponibles; licencia restrictiva para producto cerrado |

La ventaja diferencial de esta publicación no es la precisión, sino la combinación de licencia Apache 2.0 con un paquete ya convertido y verificado para RK3576, algo que en la familia YOLOv5/YOLOv8 obliga a revisar la licencia AGPL si el producto es propietario.

## Limitaciones y advertencias

- Sesgos: no hay información sobre el dataset de entrenamiento en la model card. YOLOX upstream se entrena sobre COCO, por lo que hereda sus sesgos de representación y su vocabulario de 80 clases; dominios muy distintos (industrial, médico, aéreo) requerirán ajuste fino o un modelo distinto.
- Alucinación y falsos positivos: como todo detector, puede producir detecciones espurias en escenas con oclusión, baja iluminación, movimiento o clases visualmente similares. La cuantización w8a8 suele degradar ligeramente la precisión respecto al modelo en punto flotante.
- Contexto e idioma: no aplica, es un modelo de visión sin capacidad de lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el fichero LICENSE con los avisos de copyright y atribución de los proyectos origen (airockchip/YOLOX y RKNN Model Zoo).
- Dependencia estricta de hardware y runtime: solo funciona en RK3576 con RKNN Runtime v2.4.0. No es portable a otras NPU, GPU o CPU sin reconvertir el modelo.
- Consistencia de ficheros: la model card advierte de no mezclar ficheros de configuraciones distintas; usar la variante 384x640 con artefactos de 640x640 dará resultados incorrectos.
- Estado del repositorio: 0 descargas, 0 likes y 0.0 GB de tamaño declarado, lo que sugiere que los binarios pueden no estar en Hugging Face. Conviene verificar la disponibilidad real de los ficheros (revisión `v2.4.0`) y usar ModelScope como alternativa antes de planificar un despliegue.
- Sin métricas publicadas: no hay mAP ni latencias declaradas, por lo que cualquier decisión de producción debe apoyarse en una evaluación propia sobre el dispositivo objetivo.
- Búsqueda web: los resultados recuperados en la búsqueda no contenían información técnica relevante sobre este modelo ni enlaces útiles, por lo que no se han podido incorporar fuentes adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKNNAI/RK3576-CNN-yolox-s
- Modelo origen airockchip/YOLOX: https://github.com/airockchip/YOLOX
- Ejemplo YOLOX en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolox
- Repositorio completo en Hugging Face (revisión v2.4.0): `hf download RKNNAI/RK3576-CNN-yolox-s --revision v2.4.0 --local-dir ./RK3576-CNN-yolox-s`
- Repositorio completo en ModelScope (revisión v2.4.0): `modelscope download --model RKNNAI/RK3576-CNN-yolox-s --revision v2.4.0 --local_dir ./RK3576-CNN-yolox-s`
- Documentación de YOLOX upstream (Megvii): no incluida en la model card, no disponible en la información proporcionada
- Paper de YOLOX: no incluido en la model card, no disponible en la información proporcionada
