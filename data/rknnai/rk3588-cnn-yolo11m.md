# RKNNAI/RK3588-CNN-yolo11m

## Resumen

RK3588-CNN-yolo11m es una distribución del detector de objetos YOLO11m convertido al formato RKNN para ejecutarse en la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI y no contiene un modelo entrenado desde cero: es una conversión del checkpoint YOLO11m procedente de la bifurcación airockchip/ultralytics_yolo11, con cuantización w8a8 y resolución de entrada fija de 640x640.

El modelo resuelve un problema muy concreto de despliegue: ejecutar detección de objetos en tiempo real en hardware de borde sin GPU dedicada, aprovechando la NPU integrada del RK3588. Se distribuye con una única configuración (yolo11m-640x640-w8a8-1) que declara compatibilidad exclusiva con RK3588 y requiere RKNN Runtime v2.4.0, usando un solo núcleo NPU.

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes y no tiene contexto conversacional. La model card no incluye métricas de precisión, número de parámetros ni detalles del conjunto de entrenamiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente. La licencia declarada es AGPL-3.0, heredada del proyecto Ultralytics original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos YOLO11m de Ultralytics, adaptado por airockchip); backbone, neck y head no detallados en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime v2.4.0); configuración `yolo11m-640x640-w8a8-1` |
| Tipo de modelo | CNN, según la model card |
| Tarea | Detección de objetos (configuración única en el repositorio) |
| Modelo de origen | `https://github.com/airockchip/ultralytics_yolo11` |
| Chips soportados | RK3588 (exclusivamente, según la tabla de configuraciones) |
| Núcleos NPU | 1 |
| Resolución de entrada | 640x640 |
| Versión de RKNN Runtime | v2.4.0 |
| Revisión del repositorio | v2.4.0 |
| Tamaño del repositorio | 0,0 GB (metadatos de HuggingFace) |
| Verificación de integridad | `SHA256SUMS` por configuración |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo únicamente como «CNN» y remite al repositorio airockchip/ultralytics_yolo11 como fuente. YOLO11 es una familia de detectores de visión por computador de Ultralytics que cubre detección, segmentación de instancias, estimación de pose, detección con cajas orientadas y clasificación; esta distribución solo incluye una configuración de detección, por lo que no se puede asumir que las demás tareas estén disponibles en el paquete publicado.

No hay información en la documentación proporcionada sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste posteriores. Tampoco se documentan innovaciones propias de esta distribución más allá del proceso de conversión: el modelo se transforma a RKNN mediante la cadena de herramientas RKNPU SDK y se cuantiza a w8a8 (8 bits en pesos y activaciones), lo que reduce el tamaño y acelera la inferencia en la NPU a costa de una posible pérdida de precisión frente al modelo en punto flotante. El repositorio incluye ficheros de verificación SHA-256 para garantizar la integridad de los artefactos descargados.

## Capacidades

- Detección de objetos sobre imágenes o fotogramas de vídeo de 640x640 píxeles, con la configuración w8a8 y un solo núcleo NPU.
- Inferencia acelerada por hardware en la NPU del RK3588 mediante la API RKNN (Python y C), tal como se documenta en RKNN Model Zoo.
- Integración en pipelines de vídeo nativos: el modelo es un fichero RKNN, por lo que se combina con captura de cámara, decodificación y postproceso (NMS) implementados por la aplicación anfitriona.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo «thinking», entrada de audio ni modalidad de texto; la única entrada es la imagen.
- Las capacidades de segmentación, pose, OBB y clasificación de la familia YOLO11 no se distribuyen en este repositorio: solo hay una configuración de detección publicada.

## Casos de uso

- Videovigilancia en el borde: cámaras o grabadores con RK3588 pueden ejecutar la detección localmente en la NPU sin enviar el vídeo a la nube, reduciendo ancho de banda y mejorando el cumplimiento de normativa de privacidad al no transmitir imágenes de personas.
- Inspección visual en línea de producción: control de calidad de piezas o detección de defectos sobre una cinta transportadora, con inferencia a 640x640 en el propio equipo industrial y sin depender de un servidor con GPU.
- Analítica de tráfico: conteo y clasificación de vehículos en intersecciones, aparcamientos o peajes, alimentando contadores en tiempo real desde un dispositivo empotrado de bajo consumo.
- Robótica móvil y vehículos autónomos ligeros: percepción embarcada para evitación de obstáculos o detección de personas, donde el consumo eléctrico y la integración en una placa única son determinantes.
- Comercio minorista: análisis de flujo de clientes, ocupación de zonas y detección de productos en estanterías sin desplegar infraestructura de servidores en tienda.
- Control de accesos y puertas automáticas: detección de presencia de personas para activar mecanismos, con el modelo ejecutándose en el propio controlador RK3588.
- Prototipado rápido de producto: la combinación de los ejemplos de RKNN Model Zoo con implementaciones C++ de terceros permite validar una idea de detección sobre hardware real antes de industrializarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (mAP), latencia ni throughput, ni comparaciones con el modelo original en punto flotante, por lo que no se puede cuantificar la pérdida introducida por la cuantización w8a8. Las cifras oficiales de la familia YOLO11 en COCO están documentadas por Ultralytics, pero no se reproducen aquí al no disponer de los valores exactos en la información proporcionada ni de una medición específica de esta conversión RKNN.

## Requisitos de hardware

- SoC: Rockchip RK3588 exclusivamente, según la tabla de configuraciones de la model card.
- Acelerador: NPU integrada del RK3588, con 1 núcleo NPU asignado a esta configuración.
- Memoria: no disponible; la model card no especifica requisitos de memoria del sistema ni de la NPU.
- VRAM: no aplica. El modelo no se ejecuta en GPU; se ejecuta en la NPU del SoC.
- GPU de escritorio (RTX 4090, A100, H100): no aplica a este artefacto. Para ejecutar YOLO11m en GPU habría que usar el checkpoint original de Ultralytics, no esta conversión RKNN.
- Software necesario: RKNN Runtime v2.4.0 y la cadena RKNPU SDK/RKNN Model Zoo para la conversión y el despliegue.
- Opciones de despliegue: API Python y API C de RKNN a través de los ejemplos de airockchip/rknn_model_zoo, e implementaciones C++ de terceros como ClarkArden/RKNN-Model-Deployment. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de visión en formato RKNN.
- Latencia y throughput: no disponible.
- Integridad de despliegue: verificar `sha256sum -c SHA256SUMS` dentro del directorio de la configuración antes de usar el modelo.

## Comparativa con modelos similares

| Modelo | Tarea | Resolución | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolo11m (esta distribución) | Detección de objetos | 640x640 | w8a8 | RKNN (runtime v2.4.0) | AGPL-3.0 | HuggingFace y ModelScope, revisión v2.4.0 |
| yolo11n en RKNN Model Zoo | Detección de objetos | no disponible | no disponible | RKNN | no disponible | Repositorio airockchip/rknn_model_zoo |
| YOLOv8 en RKNN Model Zoo | Detección de objetos | no disponible | no disponible | RKNN | no disponible | Repositorio airockchip/rknn_model_zoo |
| YOLO11m original (Ultralytics / airockchip) | Detección de objetos | configurable | punto flotante (sin cuantizar) | PyTorch u ONNX | AGPL-3.0 (upstream declarado en la model card) | Repositorios de Ultralytics y airockchip/ultralytics_yolo11 |

No se dispone de datos de parámetros, precisión ni latencia para las variantes comparadas dentro de la información proporcionada, por lo que la comparación se limita a tarea, formato, licencia y canal de distribución.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es copyleft fuerte e incluye la cláusula de uso en red. Integrar este modelo en un servicio accesible por red puede obligar a liberar el código fuente de la aplicación completa; para uso comercial cerrado conviene revisar la licencia con asesoría legal o negociar una licencia alternativa con el titular de los derechos.
- Compatibilidad restringida: la configuración publicada solo soporta RK3588. No se declara soporte para RK3562, RK3566, RK3568, RK3576, RV1126B ni otras plataformas cubiertas por RKNN Model Zoo.
- Cuantización w8a8: la reducción a 8 bits en pesos y activaciones puede degradar la precisión respecto al modelo en punto flotante, especialmente en objetos pequeños o de bajo contraste. No hay métricas publicadas que cuantifiquen este efecto.
- Sin benchmarks: no hay mAP, latencia ni comparativas con el modelo original, lo que impide estimar el impacto real de la conversión sin medirlo uno mismo.
- Dataset y clases no documentados: la model card no indica sobre qué datos se entrenó el modelo ni qué clases detecta, un dato crítico antes de llevarlo a producción.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, y los metadatos muestran fechas de creación y actualización poco habituales. No hay evidencia de uso en producción por terceros.
- Riesgo de alucinación y sesgos: no aplica el concepto de alucinación textual, pero sí los sesgos del conjunto de entrenamiento subyacente; al no documentarse el dataset, no se pueden evaluar sesgos de clase, iluminación, geografía o demografía.
- Idiomas y contexto: no aplica; el modelo no procesa lenguaje ni mantiene contexto conversacional.
- Dependencia de la cadena RKNN: el artefacto está ligado a RKNN Runtime v2.4.0; usar una versión distinta puede impedir la carga del modelo.
- Mezcla de ficheros entre configuraciones: la model card advierte explícitamente de que deben usarse los ficheros de la misma configuración y verificar SHA-256 antes del despliegue.
- El repositorio no incluye el postproceso completo: la NMS y la interpretación de salidas dependen de la aplicación anfitriona y de los ejemplos de RKNN Model Zoo o implementaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolo11m
- Configuración de despliegue: https://huggingface.co/RKNNAI/RK3588-CNN-yolo11m/tree/main/yolo11m-640x640-w8a8-1
- Modelo de origen (bifurcación de YOLO11 para Rockchip): https://github.com/airockchip/ultralytics_yolo11
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo de YOLO11 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolo11
- Documentación de ejemplos de modelos de RKNN Model Zoo: https://deepwiki.com/airockchip/rknn_model_zoo/5-model-examples
- Implementación en C++ para RK3588: https://github.com/ClarkArden/RKNN-Model-Deployment
- Tutorial de despliegue de modelos CNN en RK3588: https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Documentación oficial de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11
- Descarga vía ModelScope: `modelscope download --model RKNNAI/RK3588-CNN-yolo11m --revision v2.4.0 --local_dir ./RK3588-CNN-yolo11m`
