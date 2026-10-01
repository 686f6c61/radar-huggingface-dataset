# RKNNAI/RK3576-CNN-yolov8m

## Resumen

RK3576-CNN-yolov8m es una distribucion del detector de objetos YOLOv8m, convertido al formato RKNN para su ejecucion sobre la NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI (repositorio RKNNAI/RK3576-CNN-yolov8m) y deriva de la implementacion airockchip/ultralytics_yolov8, un fork de Ultralytics adaptado a los toolchains de Rockchip. No es un modelo de lenguaje: es un modelo de vision por computador (CNN) especializado en deteccion de objetos en imagenes.

La contribucion de este repositorio no es el entrenamiento de un modelo nuevo, sino el empaquetado y la cuantizacion del YOLOv8m original al formato RKNN, con cuantizacion w8a8 (pesos y activaciones a 8 bits) y una resolucion de entrada de 640x640. La distribucion esta vinculada a una version concreta del runtime RKNN (v2.4.0) y a una configuracion de un unico nucleo NPU, lo que la hace util para desarrolladores que despliegan vision embebida en hardware Rockchip.

Su relevancia es practica: permite ejecutar un detector de objetos de gama media en placas con RK3576 sin necesidad de GPU dedicada, con verificacion de integridad mediante SHA-256 y descarga reproducible por revision (v2.4.0). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, por lo que se trata de una publicacion reciente y sin traccion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (familia YOLOv8, derivada de airockchip/ultralytics_yolov8) |
| Parametros totales | no disponible en la informacion proporcionada (el YOLOv8m original de Ultralytics declara aproximadamente 25,9 M, no confirmado para esta conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN |
| Tipo de modelo | CNN |
| Chip soportado | RK3576 |
| Version del runtime RKNN | v2.4.0 |
| Nucleos NPU | 1 |
| Resolucion | 640x640 |

## Arquitectura y entrenamiento

Se trata de YOLOv8m, una red neuronal convolucional de deteccion de objetos de la familia YOLOv8. El repositorio no entrena un modelo desde cero ni documenta el proceso de entrenamiento: parte del modelo original publicado en airockchip/ultralytics_yolov8 y lo convierte al formato RKNN para el SoC RK3576. No se proporcionan en la informacion disponible datos sobre el numero de tokens (concepto no aplicable a vision), la composicion del dataset de entrenamiento, ni si hubo etapas de ajuste fino, RLHF o DPO (tecnicas propias de modelos de lenguaje, no de este tipo de red).

La innovacion tecnica relevante es la conversion y optimizacion para NPU: la cuantizacion w8a8 y el empaquetado en RKNN con runtime v2.4.0 y un unico nucleo NPU. El repositorio incluye un directorio de configuracion de despliegue (yolov8m-640x640-w8a8-1/) con ficheros SHA256SUMS para verificar la integridad de los artefactos antes del despliegue, y documentacion bilingue (README.md en ingles y README_CN.md en chino). No se documentan en la informacion proporcionada innovaciones como decodificacion especulativa ni mecanismos de atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos en imagenes a resolucion 640x640 mediante YOLOv8m.
- Inferencia sobre NPU de Rockchip RK3576 (un nucleo NPU).
- Ejecucion con cuantizacion w8a8, orientada a reducir consumo de memoria y mejorar el rendimiento en hardware embebido.
- Verificacion de integridad de los artefactos mediante SHA-256 antes del despliegue.
- Descarga reproducible por revision (v2.4.0) tanto desde Hugging Face como desde ModelScope.
- Generacion de texto, razonamiento, codigo, matematicas, vision descriptiva, tool calling, agentes y razonamiento multi-paso: no aplica, es un modelo de deteccion, no un modelo de lenguaje.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Vigilancia y videovigilancia en el borde: el modelo detecta objetos en tiempo real sobre la NPU del RK3576, lo que permite procesar flujos de camara localmente sin enviar video a la nube y sin GPU dedicada.
- Robots moviles y AGV: integracion de la deteccion de obstaculos y personas en la propia placa RK3576, reduciendo latencia y dependencia de conectividad.
- Automatizacion industrial y control de calidad: deteccion de defectos o piezas en lineas de produccion con inferencia a 640x640 sobre hardware embebido.
- Analitica de retail: conteo de personas y seguimiento de aforo en tiendas mediante camaras IP conectadas a un dispositivo RK3576.
- Domotica y seguridad del hogar: deteccion de intrusiones o presencia con procesamiento local, evitando el envio de imagenes a servicios externos.
- Drones y dispositivos de bajo consumo: al ser un modelo cuantizado a 8 bits y pensado para NPU, encaja en plataformas con restricciones de energia y espacio.
- Prototipado de vision embebida: punto de partida para desarrolladores que quieran validar un pipeline YOLOv8 sobre RK3576 antes de escalar a configuraciones mayores (otras resoluciones o recuentos de nucleos NPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP), latencia, throughput ni comparaciones numericas. Tampoco se aportan resultados de validacion de la perdida de precision tras la cuantizacion w8a8. No se deben asumir cifras no publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo para NPU de Rockchip, la memoria relevante es la del SoC RK3576 (memoria compartida del sistema), no VRAM de GPU.
- GPU recomendadas: no aplica. El modelo esta empaquetado en formato RKNN y esta destinado a la NPU del RK3576; no se documenta ejecucion sobre A100, H100 u otras GPU.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no aplica en este formato; para ejecutar YOLOv8m en GPU habria que usar el modelo original de Ultralytics, no esta conversion RKNN.
- Opciones de despliegue: runtime RKNN v2.4.0 sobre el chip RK3576, con la configuracion yolov8m-640x640-w8a8-1. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| RK3576-CNN-yolov8m (esta ficha) | CNN YOLOv8m | no disponible | 640x640 | w8a8 | NPU RK3576 | AGPL-3.0 |
| YOLOv8n | CNN | no disponible en la informacion | no disponible | no disponible | GPU/CPU (formato original) | AGPL-3.0 |
| YOLOv8s | CNN | no disponible en la informacion | no disponible | no disponible | GPU/CPU (formato original) | AGPL-3.0 |
| YOLOv8l | CNN | no disponible en la informacion | no disponible | no disponible | GPU/CPU (formato original) | AGPL-3.0 |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparacion se limita a la variante del modelo (n/s/m/l) y al hecho de que esta distribucion esta cuantizada y empaquetada especificamente para RK3576, mientras que las variantes de la familia YOLOv8 se distribuyen habitualmente en formatos para GPU/CPU.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no admite prompts de texto, generacion, razonamiento ni tool calling.
- Su uso esta restringido al chip RK3576 y al runtime RKNN v2.4.0 indicado; mezclar ficheros de configuraciones distintas puede provocar fallos de despliegue.
- La cuantizacion w8a8 puede reducir la precision de deteccion respecto al modelo en punto flotante; no se documentan en la informacion disponible las metricas de esa perdida.
- No hay informacion sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento original.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de falsos positivos y falsos negativos propios de un detector de objetos, cuya tasa no se especifica.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso en productos o servicios en red puede obligar a publicar el codigo fuente bajo los mismos terminos; conviene revisar la compatibilidad con el modelo de negocio antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, y un tamano de 0.0 GB en el momento de la consulta: se trata de una publicacion sin validacion de la comunidad y conviene verificar los artefactos con SHA-256 antes de desplegarlos en produccion.
- No se documentan idiomas soportados, casos de uso validados por el autor ni garantias de mantenimiento o soporte.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK3576-CNN-yolov8m
- Modelo de origen (Ultralytics para Rockchip): https://github.com/airockchip/ultralytics_yolov8
- RKNN Model Zoo (ejemplo YOLOv8): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- ModelScope (mismo modelo, revision v2.4.0): RKNNAI/RK3576-CNN-yolov8m
- Fichero de licencia: LICENSE incluido en el repositorio (GNU AGPL v3)
