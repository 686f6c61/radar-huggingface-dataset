# microduckapp/microduck-window-shopping

## Resumen

Microduck window shopping es una política de control robótico en formato ONNX que dota al robot bípedo Microduck (MD-01) de un comportamiento locomotor concreto y reutilizable: pasear, detenerse a mirar objetos a ambos lados con una inclinación curiosa, girar y regresar sobre sus pasos. El movimiento, de 10,8 segundos de duración, procede de la app MicroDuck y forma parte del catálogo microduck-move de la organización microduckapp en Hugging Face, vinculada a Pollen Robotics y Hugging Face.

Técnicamente no es un modelo de lenguaje, sino una red neuronal de control que procesa 61 observaciones del robot y devuelve 14 objetivos articulares a 50 Hz. Su relevancia radica en el ecosistema que representa: Microduck es un robot de 25 cm con 15 motores, cámara y LiDAR, presentado por Jensen Huang en NVIDIA GTC Berlin y con preventa desde 399 dólares, cuyo stack open source permite entrenar comportamientos en simulación y ejecutarlos en el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control robótico (formato ONNX); tipo de red interno no especificado |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); entrada de 61 observaciones por paso de control |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) |
| Observaciones de entrada | 61 |
| Salidas | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,8 s |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo es una política de motor distribuida como `policy.onnx`: en cada paso lee un vector de 61 observaciones del robot (posiblemente propioceptivas y de estado, aunque la model card no detalla su composición) y produce 14 objetivos articulares que se envían a los servos a 50 Hz, es decir, con un ciclo de control de 20 ms. La arquitectura interna de la red (MLP, transformer, política de difusión, etc.) no está documentada.

Sobre el entrenamiento no se han publicado datos de datasets, número de pasos ni técnicas de aprendizaje por refuerzo para este movimiento concreto. Sí es conocido que la plataforma MicroDuck de Pollen Robotics permite entrenar nuevos comportamientos en simulación y transferirlos al robot real (flujo sim-to-real), lo que sugiere el origen de esta política, aunque no hay confirmación explícita en la documentación. El paquete se completa con un `manifest.json` de instalación y un vídeo de vista previa (`media/preview.mp4`).

## Capacidades

- Ejecuta un comportamiento locomotor completo de 10,8 segundos: caminar, detenerse, mirar objetos a ambos lados con una inclinación curiosa, girar y volver.
- Lazo de control cerrado a 50 Hz con 61 observaciones de entrada y 14 objetivos articulares de salida.
- Distribución ligera y portable en ONNX, ejecutable con ONNX Runtime.
- Instalación directa en el robot mediante `manifest.json` desde la app MicroDuck.
- Incluye material de apoyo para previsualizar el comportamiento antes de instalarlo.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni flujos de agentes, y no tiene capacidades de visión, audio ni thinking mode documentadas.

## Casos de uso

- Demostraciones comerciales y eventos: el robot pasea y mira "escaparates" a ambos lados, un comportamiento expresivo y reconocible ideal para expositores, tiendas o presentaciones del producto, ya que muestra locomoción bípeda estable más gestos de "curiosidad" sin necesidad de programación adicional.
- Entretenimiento doméstico: como mascota robótica, el movimiento aporta un comportamiento exploratorio y simpático en casa, ejecutable bajo demanda desde la app MicroDuck sin configuración.
- Encadenamiento de comportamientos: al ser un movimiento autocontenido de 10,8 s, puede combinarse con otras políticas del catálogo microduck-move para construir secuencias más largas de actuación.
- Enseñanza de robótica y sim-to-real: sirve como ejemplo real y mínimo de una política ONNX desplegada en hardware bípedo, útil para ilustrar en clase o en talleres cómo se pasa de la simulación al robot físico.
- Validación de hardware tras montaje o mantenimiento: el movimiento ejercita marcha, inclinación del cuerpo y giro, por lo que permite comprobar el correcto funcionamiento de los servos y la estabilidad general del robot.
- Creación de contenido audiovisual y marketing: los movimientos expresivos del catálogo facilitan grabar vídeos demostrativos para redes sociales o documentación del producto.
- Investigación en locomoción bípeda de bajo coste: la disponibilidad abierta de políticas a 50 Hz sobre una plataforma de 399 dólares facilita estudios de marcha y control en robótica educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras operativas publicadas son la frecuencia de control (50 Hz, un ciclo de 20 ms) y la duración del movimiento (10,8 s); no hay métricas de tasa de éxito, consumo energético ni comparativas con otros comportamientos.

## Requisitos de hardware

- No requiere GPU ni VRAM: la política está diseñada para ejecutarse en el controlador integrado del propio robot Microduck (MD-01).
- El repositorio completo pesa 0,0 GB según Hugging Face, lo que indica un fichero ONNX muy ligero, trivial de almacenar, transferir y cargar en el robot.
- La inferencia debe ser en tiempo real a 50 Hz (20 ms por paso); no se han publicado medidas de latencia o throughput adicionales.
- No aplica a GPUs consumer (RTX 4090, etc.) ni a aceleradores de datacenter: el hardware objetivo es el propio robot.
- Despliegue: mediante la app MicroDuck usando el `manifest.json` incluido; al tratarse de ONNX, en principio sería compatible con ONNX Runtime en otros entornos, aunque sin garantías fuera del hardware previsto.
- Para desarrollar o reentrenar comportamientos, la plataforma MicroDuck emplea simulación; los requisitos concretos de ese flujo no están documentados en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia |
|---|---|---|---|---|---|
| microduckapp/microduck-window-shopping | Movimiento (microduck-move) | 61 obs → 14 objetivos articulares | 50 Hz | 10,8 s | no disponible |
| microduckapp/microduck-midnight-snack | Movimiento (microduck-move) | no disponible | no disponible | no disponible | no disponible |
| Resto del catálogo microduck-move (16 modelos en la organización) | Movimientos | no disponible | no disponible | no disponible | no disponible |

Todos los movimientos comparables pertenecen a la misma organización y comparten formato ONNX y destino (robot Microduck); no se han localizado políticas de terceros directamente comparables para esta plataforma.

## Limitaciones y advertencias

- Comportamiento único y fijo: solo ejecuta el movimiento "window shopping"; no es un modelo generalista ni admite instrucciones.
- No es un modelo de lenguaje ni multimodal: sin generación de texto, razonamiento, tool calling ni agentes.
- Licencia no especificada: las condiciones de uso comercial son desconocidas; conviene revisar el `manifest.json` o contactar con el autor antes de cualquier despliegue comercial.
- Sin variantes de cuantización ni documentación de la arquitectura interna de la red, lo que dificulta auditar su comportamiento.
- Dependencia de hardware específico: requiere un robot Microduck compatible; no es portable a otros robots sin adaptación.
- Posible brecha sim-to-real: los comportamientos de la plataforma se entrenan en simulación, por lo que el rendimiento puede degradarse en superficies o condiciones no vistas durante el entrenamiento.
- Discrepancia sin aclarar entre los 14 objetivos articulares de la política y los 15 motores que el fabricante atribuye al robot.
- Adopción mínima: 0 descargas y 0 likes en Hugging Face, y modelo muy reciente (creado el 27 de octubre de 2026), sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-window-shopping
- Organización microduckapp en Hugging Face: https://huggingface.co/microduckapp
- Web oficial de Microduck: https://microducks.org/
- Página de producto de Pollen Robotics: https://pollen-robotics.com/microduck/
- Tienda oficial MD-01: https://www.microduck.shop/
- Repositorio en GitHub: https://github.com/pollen-robotics/microduck
