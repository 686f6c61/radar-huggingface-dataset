# microduckapp/microduck-gossip

## Resumen

Microduck Gossip es un artefacto de movimiento (skill) para el robot bípedo Microduck, publicado por la organización `microduckapp` en Hugging Face. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política de control exportada a ONNX que reproduce una coreografía de 11,0 segundos en la que el robot "se acerca, se inclina, se sorprende y comprueba que nadie escucha". El paquete incluye `policy.onnx` (61 observaciones de entrada, 14 consignas articulares de salida, 50 Hz), `manifest.json` con lo que el robot necesita instalar para reproducirlo y `media/preview.mp4` con la previsualización.

Su relevancia es de infraestructura más que de modelado: ejemplifica la distribución de habilidades robóticas como artefactos versionados e instalables, con una interfaz de entrada/salida fija y una frecuencia de control declarada. El repositorio pertenece a una familia de 16 modelos de la misma organización, todos etiquetados como `microduck-move`, lo que sugiere un catálogo de movimientos intercambiables para la misma plataforma.

El robot Microduck, según la cobertura de prensa disponible, es un bípedo open source de 25 cm vendido a 399 dólares por Hugging Face y Pollen Robotics, entrenado con aprendizaje por refuerzo en MuJoCo. La model card de este movimiento concreto no documenta arquitectura, entrenamiento ni evaluación, y en el momento de la instantánea de datos el repositorio acumulaba 0 descargas y 0 likes, con licencia e idiomas sin declarar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (grafo ONNX de política de control; la model card no detalla la topología interna) |
| Parametros totales | No disponible (el repositorio ocupa 0,0 GB tras redondeo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: control reactivo con 61 observaciones por paso a 50 Hz, sin ventana de contexto textual |
| Tipos de cuantizacion | No disponible; se distribuye un único artefacto ONNX (precisión no declarada) |
| Idiomas soportados | No disponible / no aplica (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` y `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por paso) |
| Duracion del movimiento | 11,0 segundos |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la política. Lo único verificable es la interfaz del grafo ONNX: 61 valores de observación como entrada, 14 consignas articulares como salida y una frecuencia de ejecución de 50 Hz. Esa relación entrada-salida es coherente con una política reactiva en bucle cerrado que consume propiocepción del robot y emite posiciones o consignas articulares, pero la model card no confirma si se trata de un perceptrón multicapa, una red recurrente o un transformer pequeño.

Tampoco se documentan datos de entrenamiento, número de tokens o episodios, composición del dataset, uso de RLHF/DPO (no aplicable en principio a una política motora), recompensas, ni el procedimiento de transferencia de simulación a hardware. La cobertura de prensa de la plataforma indica que el Microduck se entrena con aprendizaje por refuerzo en MuJoCo, pero esa afirmación corresponde al robot y no se puede atribuir específicamente a este movimiento. El `manifest.json` declara qué necesita instalar y ejecutar el pato para reproducir la habilidad, aunque su contenido no está disponible en la información proporcionada.

## Capacidades

- Reproducción de una habilidad motora de 11,0 segundos con perfil gestual definido: acercarse, inclinarse, gesticular sorpresa y comprobar el entorno.
- Control en bucle cerrado a 50 Hz: consume 61 observaciones por paso y emite 14 consignas articulares, lo que permite correcciones dentro del propio movimiento.
- Instalación declarativa mediante `manifest.json`, pensada para que la aplicación MicroDuck despliegue el movimiento en el robot.
- Distribución como grafo ONNX portable, ejecutable con runtimes estándar sin dependencia del framework de entrenamiento.
- Encadenamiento con otras habilidades del mismo catálogo (`microduck-move`), al compartir formato y convenciones de instalación.
- Previsualización incluida (`media/preview.mp4`) para validar el resultado esperado antes de desplegar.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; no procesa lenguaje natural en ninguna forma.

## Casos de uso

- Demostraciones de robótica social: el movimiento está diseñado explícitamente como gesto comunicativo de complicidad, útil en ferias, museos o presentaciones de producto donde se necesita una interacción breve y reconocible.
- Desarrollo y validación de la app MicroDuck: sirve como caso de prueba del flujo de instalación descrito en `manifest.json`, verificando que el robot descarga, instala y ejecuta correctamente un paquete de habilidad.
- Pruebas de latencia del runtime: con 50 Hz de frecuencia de control, el movimiento permite medir si el hardware del pato sostiene el presupuesto de 20 ms por paso con inferencia ONNX en CPU.
- Composición de secuencias de comportamiento: al compartir formato con el resto de movimientos de la organización, se puede encadenar con otras habilidades para construir rutinas más largas con lógica de secuenciación externa.
- Docencia e investigación en robótica: es un ejemplo concreto y reproducible de artefacto de política empaquetado (observaciones, acciones, frecuencia, manifiesto), útil para explicar el ciclo simulación-hardware y la distribución de skills.
- Validación de transferencia simulación-realidad: comparar la reproducción en simulador frente al robot físico con la misma política y las mismas 61 observaciones permite detectar divergencias de calibración o de dinámica.
- Prototipado de contenido para robots de compañía: creadores de experiencias pueden evaluar el atractivo del gesto antes de invertir en el diseño de movimientos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de éxito de la tarea, tasas de caída, error de seguimiento articular, tiempos de inferencia medidos ni comparaciones con otras políticas en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no cuantificada en la información; por el tamaño del repositorio (0,0 GB tras redondeo) los pesos deben estar en el orden de kilobytes a pocos megabytes, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e, incluso, en CPU. Estimación, no dato confirmado.
- GPU recomendadas: no se especifica ninguna; el artefacto está en ONNX y está pensado para ejecutarse en el hardware del propio robot.
- GPU consumer: no se requiere GPU dedicada. Cualquier iGPU o CPU moderna debería cubrir el presupuesto de 20 ms por paso, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA) o cualquier runtime compatible con ONNX; la vía prevista es la app MicroDuck a través de `manifest.json`.
- Latencia y throughput: objetivo de 50 Hz (20 ms por paso) declarado por la frecuencia de control; latencia real medida no disponible.
- Requisito adicional: el robot Microduck (25 cm, bípedo) con el número de articulaciones y la disposición de sensores que produzca las 61 observaciones esperadas; el orden y la normalización de esas observaciones no están documentados en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-gossip | Habilidad gestual para Microduck (ONNX) | 61 obs / 14 joints | 50 Hz | 11,0 s | No disponible | Hugging Face, 0 descargas |
| microduck-midnight-snack (misma organizacion) | Habilidad para Microduck (ONNX) | No disponible | No disponible | No disponible | No disponible | Hugging Face, listado en la organizacion |
| Politicas de locomocion bipeda publicas de otros autores | Politicas de control | No disponible | No disponible | No disponible | No disponible | No disponible: no se han proporcionado datos comparables |

La organización `microduckapp` mantiene 16 modelos, por lo que la comparación natural es interna: mismo runtime, mismo contrato de instalación y misma plataforma física. No se dispone de datos de terceros que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial, redistribución o modificación del artefacto; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de documentación técnica: sin arquitectura, sin procedimiento de entrenamiento, sin especificación del vector de 61 observaciones ni del orden de las 14 salidas.
- Dependencia estricta del hardware: la política está acoplada implícitamente a la morfología y a la calibración de sensores del Microduck; no es reutilizable en otro robot sin reentrenamiento.
- Riesgo de comportamiento fuera de distribución: al ser una política reactiva, observaciones anómalas (sensores descalibrados, terreno distinto, empujes externos) pueden producir respuestas no previstas; no se documentan límites de par, paradas de seguridad ni estrategias de recuperación de caída.
- Duración fija de 11,0 segundos: no hay información sobre condiciones de interrupción o aborto seguro a mitad de movimiento.
- Sin datos de evaluación: no hay métricas de éxito, robustez ni repetibilidad, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.
- Alucinación: no aplica en el sentido de generación de texto, ya que el modelo no produce lenguaje; el riesgo equivalente es la ejecución de una secuencia motora inadecuada al contexto físico.
- Idiomas: no aplica; cualquier texto asociado al gesto (si lo hubiera en la app) se gestiona fuera de este artefacto.
- Fechas de creación y actualización idénticas (2026-10-27): el paquete no ha recibido revisiones posteriores en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-gossip
- Pesos ONNX: https://huggingface.co/microduckapp/microduck-gossip/blob/main/policy.onnx
- Manifiesto de instalación: https://huggingface.co/microduckapp/microduck-gossip/blob/main/manifest.json
- Previsualización del movimiento: https://huggingface.co/microduckapp/microduck-gossip/blob/main/media/preview.mp4
- Organización MicroDuck en Hugging Face: https://huggingface.co/microduckapp
- MarkTechPost, sobre el Microduck de 399 dólares: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- TechCrunch, anuncio del robot: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- The AI Insider, plataforma abierta para IA física: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- TechRepublic, aprendizaje de la marcha mediante simulación: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
