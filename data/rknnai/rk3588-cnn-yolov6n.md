# RKNNAI/RK3588-CNN-yolov6n

## Resumen

RKNNAI/RK3588-CNN-yolov6n es un paquete de despliegue, no un modelo entrenado desde cero. Se trata de una conversion del detector de objetos YOLOv6n (variante nano) al formato RKNN, optimizada para ejecutarse sobre la NPU del SoC Rockchip RK3588. El autor, RKNNAI, publica la configuracion `yolov6n-640x640-w8a8-1`, que emplea cuantizacion de 8 bits en pesos y activaciones (w8a8), una unica core de NPU y una resolucion de entrada de 640x640 pixeles, con el runtime RKNN v2.4.0.

El modelo origen procede del repositorio airockchip/YOLOv6, un fork del proyecto YOLOv6 adaptado por Rockchip, y se distribuye a traves del RKNN Model Zoo. La relevancia de esta ficha es practica: permite a desarrolladores de vision por computador desplegar deteccion de objetos en tiempo real sobre hardware de borde (edge) de bajo consumo, sin necesidad de GPU dedicada ni de recompilar el modelo desde PyTorch.

Se trata de una red convolucional (CNN) puramente de vision: no procesa texto, no tiene ventana de contexto en tokens ni capacidades generativas. La licencia es GPL-3.0, heredada del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos YOLOv6n, familia YOLO con reparametrizacion de bloques) |
| Parametros totales | no disponible en la informacion proporcionada |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en int8) para formato RKNN |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (modelo compilado para NPU Rockchip; no se distribuyen safetensors ni GGUF) |
| Tipo de modelo (segun model card) | CNN |
| Modelo origen | https://github.com/airockchip/YOLOv6 |
| Chip soportado | RK3588 |
| Version de runtime RKNN | v2.4.0 |
| Cores de NPU | 1 |
| Resolucion de entrada | 640x640 |
| Configuracion incluida | `yolov6n-640x640-w8a8-1` |
| Revision del repo | v2.4.0 |
| Tamano del repo (HuggingFace) | 0.0 GB (segun los metadatos de la plataforma) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se aporta informacion sobre el entrenamiento en la model card: no se indican numero de tokens o imagenes, composicion del dataset, ni si hubo fases de ajuste fino (en el caso de deteccion, tecnicas como data augmentation, mosaic o distillation). El paquete documenta exclusivamente el proceso de conversion y despliegue.

Lo que si se especifica es la arquitectura resultante en el artefacto distribuido: una CNN de deteccion de objetos correspondiente a la variante "n" (nano) de YOLOv6, compilada a RKNN con cuantizacion w8a8 y ejecutada sobre una sola core de NPU del RK3588. El flujo de uso previsto es la conversion desde el modelo origen de airockchip/YOLOv6 mediante las herramientas de Rockchip, y la validacion de integridad del artefacto con sumas SHA-256 antes del despliegue. La model card no detalla innovaciones tecnicas adicionales (por ejemplo, decodificacion especulativa o mecanismos de atencion), que en cualquier caso no aplican a este tipo de red.

## Capacidades

- Deteccion de objetos sobre imagenes de 640x640 pixeles de resolucion de entrada.
- Inferencia acelerada por hardware en la NPU del RK3588, con una core de NPU asignada.
- Ejecucion con pesos y activaciones cuantizados a int8 (w8a8), lo que reduce el consumo de memoria y aumenta el throughput respecto a precision flotante.
- Verificacion de integridad del artefacto mediante fichero `SHA256SUMS` incluido en la configuracion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales de lenguaje.
- No dispone de soporte de tool calling, function calling ni comportamiento de agente.
- No dispone de capacidades multilingues (no procesa texto).
- No se documentan capacidades especiales adicionales (modo thinking, vision-lenguaje, audio) distintas de la deteccion visual.

## Casos de uso

- Videoanalisis en dispositivos de borde: integracion del modelo RKNN en una placa con SoC RK3588 para deteccion de objetos en tiempo real sobre streams de camara IP, sin enviar video a la nube y reduciendo coste de ancho de banda y latencia.
- Control de aforo y conteo de personas: uso del detector como primer modulo de un pipeline de seguimiento (tracking) en pasillos, accesos o recintos, aprovechando la inferencia local en NPU.
- Inspeccion industrial en linea de produccion: deteccion de defectos o presencia/ausencia de piezas en cintas transportadoras, con el modelo ejecutandose en el propio equipo y sin GPU dedicada.
- Robotica movil y drones: percepcion basica a bordo para evitar obstaculos o identificar objetos de interes, donde el bajo consumo del RK3588 es determinante frente a soluciones con GPU.
- Comercio minorista y analitica de estanterias: deteccion de productos o huecos en estanterias mediante camaras fijas conectadas a un nodo RK3588.
- Agricultura de precision: deteccion de frutos, plagas o malas hierbas en imagenes capturadas por camaras en campo, ejecutando el modelo en un gateway de borde resistente a condiciones ambientales.
- Prototipado rapido de producto: al estar empaquetado con revision y verificacion SHA-256, permite integrar una linea base de deteccion en una prueba de concepto sin entrenar ni convertir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP, IoU) ni de rendimiento (FPS, latencia) para la configuracion `yolov6n-640x640-w8a8-1` sobre RK3588.

## Requisitos de hardware

- Hardware de ejecucion: exclusivamente SoC Rockchip RK3588. La configuracion incluida no declara soporte para otros chips.
- Acelerador: NPU integrada del RK3588, con 1 core de NPU asignada en esta configuracion.
- Version de runtime RKNN requerida: v2.4.0. Debe coincidir con la version indicada para garantizar la compatibilidad del artefacto.
- Uso en GPU de escritorio (A100, H100, RTX 4090, etc.): no soportado por este paquete, que esta compilado para NPU Rockchip y no para CUDA.
- VRAM estimada: no aplica; el modelo consume memoria del sistema/NPU del SoC, no memoria de GPU dedicada. No se proporcionan cifras de consumo de memoria en la model card.
- Opciones de despliegue: RKNN Model Zoo (ejemplo de YOLOv6) y el runtime RKNN v2.4.0 sobre RK3588. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada. La comparacion se limita a los aspectos documentados del propio paquete frente a su modelo origen.

| Aspecto | RK3588-CNN-yolov6n (este repo) | YOLOv6n origen (airockchip/YOLOv6) |
|---|---|---|
| Formato | RKNN compilado | Pesos del framework de origen (PyTorch) |
| Precision | w8a8 (int8) | La del modelo origen (no indicada) |
| Hardware objetivo | NPU del RK3588 (1 core) | GPU/CPU generica |
| Resolucion de entrada documentada | 640x640 | no disponible en la informacion proporcionada |
| Licencia | GPL-3.0 | GPL-3.0 (upstream) |
| Runtime asociado | RKNN v2.4.0 | no aplica |

No se dispone de datos para comparar con otras alternativas de deteccion (por ejemplo, YOLOv5n o YOLOv8n en formato RKNN) mas alla de la existencia de otros ejemplos en el RKNN Model Zoo.

## Limitaciones y advertencias

- Especificidad de hardware: el artefacto solo funciona en RK3588 con runtime RKNN v2.4.0. Usarlo con otra version del runtime u otro chip puede provocar fallos de carga o resultados incorrectos.
- Repo vacio o incompleto segun metadatos: el tamano del repositorio figura como 0.0 GB en HuggingFace. Conviene verificar la descarga completa y las sumas SHA-256 antes de dar por valido el paquete.
- Sin datos de calidad: no hay metricas publicadas de precision (mAP) ni de latencia, por lo que no es posible evaluar la perdida de exactitud introducida por la cuantizacion w8a8.
- Sin informacion de entrenamiento: se desconoce el dataset, el numero de imagenes y el procedimiento de ajuste del modelo origen, lo que dificulta evaluar sesgos o cobertura de clases.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existen falsos positivos y falsos negativos propios de cualquier detector; con cuantizacion int8 estos pueden aumentar respecto al modelo en precision flotante.
- Idiomas: no aplica; el modelo no procesa texto y no tiene capacidades multilingues.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Su integracion en productos propietarios o en firmware cerrado exige revisar las obligaciones de distribucion del codigo fuente y de las obras derivadas. Es un punto critico para uso comercial.
- Atribucion: la distribucion mantiene los avisos de copyright del proyecto original; deben conservarse en cualquier redistribucion.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo ni sobre su autor; no se han podido contrastar datos externos.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov6n
- Modelo origen (airockchip/YOLOv6): https://github.com/airockchip/YOLOv6
- RKNN Model Zoo, ejemplo YOLOv6: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov6
- Configuracion incluida: `yolov6n-640x640-w8a8-1/README.md` dentro del repositorio
- Documentacion en chino: `README_CN.md` dentro del repositorio
- Licencia: fichero `LICENSE` dentro del repositorio
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda disponibles.
