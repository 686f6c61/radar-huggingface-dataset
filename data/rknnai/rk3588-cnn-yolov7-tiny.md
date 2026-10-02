# RKNNAI/RK3588-CNN-yolov7-tiny

## Resumen

RK3588-CNN-yolov7-tiny es un paquete de despliegue del detector de objetos YOLOv7-tiny convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI en HuggingFace y deriva del repositorio upstream airockchip/yolov7, integrado a su vez en el RKNN Model Zoo de Rockchip. No se trata de un modelo de lenguaje, sino de una red convolucional (CNN) de deteccion de objetos en una sola pasada, orientada a inferencia en el borde.

El repositorio no distribuye pesos entrenados originales en PyTorch ni safetensors, sino una configuracion ya convertida y cuantizada a RKNN, lista para cargarse en el runtime v2.4.0 del RK3588. La configuracion disponible es `yolov7-tiny-640x640-w8a8-1`, con entrada de 640x640 pixeles, cuantizacion de 8 bits en pesos y activaciones (w8a8) y ejecucion sobre un unico nucleo NPU.

Su relevancia esta en el ambito de la vision por computador embebida: permite desplegar deteccion de objetos en tiempo casi real sobre hardware de bajo consumo como el RK3588, sin necesidad de GPU dedicada. El tamano del repositorio figura como 0.0 GB, por lo que el contenido subido es minimo (documentacion y estructura de despliegue) y no incluye artefactos pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (familia YOLOv7-tiny, deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no aplica (deteccion de objetos; documentacion en ingles y chino) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN |

Datos adicionales de la configuracion disponible:

| Parametro | Valor |
|---|---|
| Chip soportado | RK3588 |
| Version del runtime RKNN | v2.4.0 |
| Nucleos NPU | 1 |
| Resolucion de entrada | 640x640 |
| Modelo origen | airockchip/yolov7 |
| Tipo de modelo | CNN |

## Arquitectura y entrenamiento

El modelo es YOLOv7-tiny, una variante compacta de la familia YOLOv7 basada en una red convolucional de deteccion en una sola etapa. La informacion proporcionada no detalla la topologia interna (numero de capas, bloques E-ELAN, cabezas de deteccion) ni el esquema de anclas, por lo que esos datos quedan como no disponibles. Se sabe que es un modelo de tipo CNN y que la entrada es de 640x640 pixeles.

En cuanto al entrenamiento, la model card no aporta informacion sobre el dataset, el numero de tokens o imagenes, ni sobre tecnicas de entrenamiento como data augmentation, destilacion o ajuste fino. Lo que si se documenta es el proceso de conversion: el modelo origen en PyTorch se transforma al formato RKNN para RK3588 aplicando la precision especificada (w8a8). La innovacion tecnica destacable no esta en el diseno del detector, sino en su cuantizacion y despliegue sobre la NPU del RK3588, con verificacion de integridad mediante sumas SHA-256 incluidas en la configuracion.

## Capacidades

- Deteccion de objetos en imagenes y video: localiza y clasifica multiples objetos con cajas delimitadoras dentro de una imagen de 640x640.
- Inferencia sobre NPU: ejecucion acelerada en el motor NPU del RK3588 mediante el runtime RKNN v2.4.0.
- Cuantizacion INT8 completa (w8a8): reduce el consumo de memoria y acelera el calculo a costa de una ligera perdida de precision respecto al modelo en coma flotante.
- Despliegue en el borde: pensado para dispositivos embebidos con recursos limitados, no para servidores con GPU.
- Integracion con RKNN Model Zoo: soporta el flujo estandar de ejemplo del repositorio airockchip (Python y C++).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- Capacidades multilingues: no aplica; se trata de un modelo de vision.

## Casos de uso

- Videovigilancia inteligente en el borde: ejecutar deteccion de personas y objetos en camaras IP conectadas directamente a un dispositivo con RK3588, sin enviar video a la nube, reduciendo latencia y preservando la privacidad.
- Control de aforo y conteo de personas: procesar el flujo de una camara a 640x640 para contar individuos que cruzan una linea, aprovechando la inferencia local sobre NPU.
- Inspeccion industrial automatizada: detectar defectos o piezas en cintas de produccion, donde el RK3588 puede integrarse en un PLC o modulo embebido con bajo consumo energetico.
- Robotica movil y drones: dotar a plataformas autonomas de percepcion de objetos en tiempo real con un consumo energetico reducido, adecuado para baterias.
- Analitica de trafico y aparcamiento: identificar vehiculos en intersecciones o plazas, integrando el detector en un nodo de borde que envia solo los eventos relevantes.
- Agricultura de precision: detectar frutos, plagas o malas hierbas sobre imagenes capturadas por camaras en campo, ejecutando el modelo en dispositivos autonomos.
- Retransmision con analitica embebida: incorporar el detector en set-top boxes, grabadores NVR o pasarelas de video basadas en Rockchip para anotar el flujo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP), latencia ni throughput. Tampoco se aportan resultados comparativos frente a otras variantes de YOLO en el mismo hardware.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 (con NPU integrada). El modelo se ejecuta sobre la NPU, no sobre GPU de escritorio.
- Nucleos NPU: la configuracion disponible utiliza 1 nucleo NPU.
- VRAM estimada: no disponible; al ejecutarse en SoC con memoria unificada, el consumo se refiere a memoria del sistema (no especificado).
- GPU recomendadas: no aplica; el formato RKNN esta pensado para la NPU del RK3588. No es directamente compatible con CUDA ni con GPUs como A100, H100 o RTX 4090.
- Consumer GPU: no aplica en su formato actual; para GPUs de consumo habria que usar el modelo origen en PyTorch o convertirlo a otro formato.
- Opciones de despliegue: runtime RKNN v2.4.0 sobre RK3588, con ejemplos de RKNN Model Zoo en Python y C++, y herramientas del ecosistema rknn_toolkit_lite2 para aarch64.
- Latencia y throughput estimados: no disponible; dependen del chip, del numero de nucleos NPU activos, de la resolucion y de la implementacion.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa fiable con otros detectores. La tabla siguiente compara de forma cualitativa y sin cifras inventadas.

| Modelo | Tipo | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK3588-CNN-yolov7-tiny (este) | CNN, deteccion | 640x640 | RKNN (w8a8) | GPL-3.0 | HuggingFace, ModelScope |
| yolov7-tiny (origen, airockchip/yolov7) | CNN, deteccion | no disponible | PyTorch | GPL-3.0 | GitHub |
| Otras variantes de la familia YOLO | CNN, deteccion | no disponible | varios | varias | varios |

No se dispone de resultados de benchmarks del modelo publicado, por lo que no es posible establecer una comparacion de precision o velocidad con alternativas como YOLOv5, YOLOv8 o el propio YOLOv7 completo. Los datos de dichos modelos comparables figuran como no disponibles en esta ficha.

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft, lo que impone obligaciones relevantes para el uso comercial y la distribucion. Integrar el modelo en un producto propietario puede exigir liberar el codigo que lo enlaza; conviene revisar las implicaciones legales antes de usarlo en produccion.
- Ambito restringido: es un detector de objetos, no un modelo generativo. No admite conversacion, generacion de texto, codigo ni razonamiento.
- Cuantizacion w8a8: la cuantizacion a 8 bits puede degradar la precision de deteccion frente al modelo en coma flotante, especialmente en objetos pequenos o clases poco representadas.
- Datos de entrenamiento desconocidos: la model card no especifica clases, dataset ni composicion, por lo que no se puede evaluar el sesgo ni la cobertura de categorias.
- Dependencia de hardware: solo es compatible con el RK3588 y con la version de runtime indicada (v2.4.0); usarlo en otro chip o runtime puede fallar.
- Verificacion obligatoria: el autor recomienda ejecutar `sha256sum -c SHA256SUMS` y comprobar que todas las entradas devuelven `OK` antes del despliegue.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos propios de un detector.
- Repositorio minimo: el tamano del repo figura como 0.0 GB, por lo que conviene confirmar que los artefactos de despliegue se descargan correctamente mediante los comandos indicados.
- Idiomas: no aplica; la documentacion esta en ingles y chino.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov7-tiny
- Perfil del autor en HuggingFace: https://huggingface.co/RKNNAI
- Modelos del autor: https://huggingface.co/RKNNAI/models
- RKNN Model Zoo, ejemplo yolov7: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov7
- RKNN Model Zoo, README del ejemplo: https://github.com/airockchip/rknn_model_zoo/blob/main/examples/yolov7/README.md
- Modelo origen airockchip/yolov7: https://github.com/airockchip/yolov7
- Articulo de referencia sobre despliegue en RK3588 (CSDN): https://blog.csdn.net/y7z8a9/article/details/162779341
