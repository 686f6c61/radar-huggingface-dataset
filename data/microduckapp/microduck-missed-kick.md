# microduckapp/microduck-missed-kick

## Resumen

`microduck-missed-kick` es una política de control motriz para el robot bípedo Microduck, publicada por el usuario `microduckapp` en Hugging Face bajo el pipeline `robotics`. No es un modelo de lenguaje: se trata de un fichero `policy.onnx` que implementa una animación o "move" de 10,4 segundos en la que el robot alinea un balón imaginario, gira la cabeza con fuerza, falla el golpeo y el impulso lo hace girar media vuelta. El modelo consume 61 observaciones por paso y emite 14 consignas de articulaciones a 50 Hz.

El robot Microduck lo desarrollan Pollen Robotics y Hugging Face: un bípedo de aproximadamente 25 cm (10 pulgadas), 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y un pico articulado, con un precio de preventa de 399 dólares. En este ecosistema, los "moves" son paquetes descargables desde la app MicroDuck, compuestos por una política ONNX y un `manifest.json` que describe qué necesita el pato para instalarlo y reproducirlo.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay información pública sobre arquitectura interna, parámetros, datos de entrenamiento ni licencia. El repositorio declaraba 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0,0 GB, y la model card se limita a una descripción funcional del movimiento y al inventario de ficheros. Cualquier evaluación cuantitativa de calidad del movimiento requeriría ejecutarlo en el robot o en un simulador compatible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica: la política recibe un vector de 61 observaciones por paso y no se documenta memoria ni historial temporal |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx` sin variantes cuantizadas) |
| Idiomas soportados | no disponible; no procesa lenguaje natural |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` de instalación y reproducción |

Datos operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Entradas | 61 observaciones |
| Salidas | 14 objetivos articulares (*joint targets*) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,4 segundos |
| Ficheros del repo | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Plataforma destino | robot Microduck (app MicroDuck) |
| Tags declarados | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Descargas / likes | 0 / 0 |
| Creación / actualización | 2026-10-27 / 2026-10-27 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la política. Lo único verificable es la interfaz: 61 entradas, 14 salidas y 50 Hz de frecuencia de control, empaquetadas en un grafo ONNX. Con esas dimensiones, el modelo se comporta como un controlador de extremo a extremo que mapea el estado observado a consignas articulares, pero no se especifica si se trata de un perceptrón multicapa, una red recurrente o una política entrenada en simulación y transferida al robot (sim2real). Tampoco se detalla la composición exacta del vector de observaciones (posiciones articulares, velocidades, lecturas de IMU, estado del pico u otras señales).

No hay datos sobre volumen de entrenamiento, composición del dataset, uso de aprendizaje por refuerzo, imitación de movimiento o ajuste fino con retroalimentación humana. El repositorio no incluye pesos originales de entrenamiento, scripts de entrenamiento ni configuración de simulación; solo el artefacto de inferencia y su manifiesto. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa. El contexto del ecosistema sí está documentado a nivel de plataforma: NVIDIA y Hugging Face han divulgado que el Microduck aprende a caminar mediante simulación con IA, pero ese material se refiere a la locomoción del robot, no a este "move" concreto.

## Capacidades

- Ejecución de una habilidad única y cerrada: una animación de 10,4 segundos con alineación de balón imaginario, giro de cabeza, fallo de golpeo y rotación de media vuelta por inercia.
- Generación de 14 consignas articulares por paso a 50 Hz, suficiente para un lazo de control en tiempo real con presupuesto de 20 ms por inferencia.
- Integración con la app MicroDuck mediante `manifest.json`, que declara qué necesita el robot para instalar y reproducir el movimiento.
- Formato ONNX, lo que permite ejecución con ONNX Runtime y potencial portabilidad a otros runners compatibles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No incluye visión, audio ni modo "thinking"; la percepción, si existe, queda fuera de este artefacto.
- No es una política de locomoción general ni un modelo de propósito general: no se documenta capacidad de generalización a otros movimientos, terrenos u objetivos.

## Casos de uso

- **Demostración de producto en la app MicroDuck**: instalar el paquete mediante `manifest.json` y reproducir el movimiento para mostrar el repertorio de animaciones expresivas del robot, aprovechando que es una habilidad autocontenida de duración fija.
- **Producción de contenido y marketing**: usar `media/preview.mp4` como referencia y grabar el movimiento en el robot real para vídeos de lanzamiento, notas de prensa o publicaciones en redes, dado el carácter llamativo de la animación (fallo deliberado y giro por inercia).
- **Prueba de integración del pipeline de "moves"**: validar de extremo a extremo el flujo de descarga, verificación del manifiesto, carga del grafo ONNX y reproducción a 50 Hz antes de publicar movimientos propios.
- **Verificación de seguimiento de trayectorias**: comprobar que las 14 salidas articulares se ejecutan dentro de los límites mecánicos del robot y que la secuencia de 10,4 s se reproduce sin desviaciones, sirviendo como caso de prueba de control.
- **Prueba de robustez ante perturbaciones**: ejecutar el movimiento mientras se aplican pequeños empujones o se coloca un objeto en la trayectoria de la cabeza, para observar si la política mantiene la secuencia o se desestabiliza, un test útil para evaluar controladores en un bípedo de 15 motores.
- **Divulgación y docencia en robótica**: usar un movimiento corto y visualmente claro como ejemplo introductorio de políticas de control en ONNX, de la relación entre observaciones, acciones y frecuencia de control, en talleres o asignaturas de robótica.
- **Base para variaciones coreografiadas**: emplear la interfaz 61→14 y el formato del manifiesto como plantilla para crear o encadenar movimientos derivados en la misma aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, error de seguimiento, tasas de éxito, estabilidad ni comparaciones con otras políticas. Los únicos datos cuantitativos verificables son los de interfaz y temporización: 61 observaciones de entrada, 14 salidas articulares, 50 Hz y 10,4 segundos de duración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara un tamaño de 0,0 GB y la política solo expone 61 entradas y 14 salidas, pero no se publica el número de parámetros ni el tamaño exacto del fichero ONNX.
- GPU recomendadas: no disponibles. No se documenta que el movimiento requiera aceleración por GPU; el destino natural es el cómputo embebido del propio robot Microduck.
- Compatibilidad con GPU de consumo: no confirmada. Por la dimensión de la interfaz, es esperable que la inferencia sea viable en CPU, pero no hay datos publicados que lo cuantifiquen.
- Opciones de despliegue: ONNX Runtime como ejecutor natural del artefacto `policy.onnx`, junto con el cargador de la app MicroDuck que interpreta `manifest.json`. Frameworks de servicio de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama no aplican a este artefacto.
- Latencia y throughput: el diseño a 50 Hz implica un presupuesto de 20 ms por paso de control. No se publica latencia medida ni coste por inferencia en el hardware del robot.
- Requisito de tiempo real: el lazo de control exige determinismo y jitter bajo; conviene validar el rendimiento en el hardware final antes de encadenar movimientos.

## Comparativa con modelos similares

No se dispone de información cuantitativa sobre otras políticas comparables. La tabla recoge lo que puede afirmarse con la documentación consultada.

| Criterio | `microduck-missed-kick` | Otros movimientos `microduck-move` | Política de locomoción de Microduck (simulación, NVIDIA/Hugging Face) |
|---|---|---|---|
| Tipo | Política de control ONNX | No disponible | Política de control entrenada en simulación |
| Parámetros | No disponible | No disponible | No disponible |
| Contexto / entradas | 61 observaciones por paso | No disponible | No disponible |
| Salidas | 14 objetivos articulares | No disponible | No disponible |
| Frecuencia de control | 50 Hz | No disponible | No disponible |
| Duración | 10,4 s | No disponible | No aplica (locomoción continua) |
| Licencia | No disponible | No disponible | No disponible |
| Disponibilidad | Repositorio público en Hugging Face | No verificada en la información consultada | Divulgada en prensa y materiales de plataforma |

No es posible establecer comparaciones de rendimiento, calidad de movimiento o coste computacional con alternativas, porque no hay métricas publicadas para ninguna de ellas.

## Limitaciones y advertencias

- **Licencia indeterminada**: la model card no declara licencia. Sin un término explícito, no puede asumirse permiso de uso comercial, redistribución o modificación; conviene contactar con el autor antes de integrarlo en un producto.
- **Ausencia total de documentación técnica**: no hay arquitectura, número de parámetros, datos de entrenamiento, procedencia de las observaciones ni metodología de evaluación. La reproducibilidad científica es nula con la información disponible.
- **Habilidad única y no generalizable**: el artefacto ejecuta un movimiento cerrado de 10,4 s; no se documenta adaptación a terreno, obstáculos, cargas o variaciones morfológicas del robot.
- **Riesgo de desajuste sim2real**: si la política se entrenó en simulación (extremo no confirmado), el comportamiento en el robot físico puede degradarse respecto al vídeo de previsualización.
- **Ausencia de métricas de seguridad**: no se publican límites de par, velocidades máximas, comportamiento ante fallos ni procedimientos de parada. Un giro de cabeza y una rotación de media vuelta implican movimiento dinámico que debe validarse en un entorno despejado.
- **Dependencia del manifiesto**: la instalación y reproducción dependen de `manifest.json`; cambios de versión en la app MicroDuck o en el runtime ONNX pueden romper la compatibilidad.
- **Sesgos**: no aplica el concepto habitual de sesgo en modelos de lenguaje. Sí existe un riesgo de sobreajuste a la morfología y calibración concretas del robot de destino.
- **Sin soporte de lenguaje ni de agentes**: no puede usarse para conversación, razonamiento, generación de código ni automatización de tareas cognitivas.
- **Madurez del repositorio**: 0 descargas, 0 likes y una única versión publicada el mismo día de su creación; no hay historial de mantenimiento ni comunidad que valide su funcionamiento.
- **Metadatos incompletos**: no se declaran idiomas, licencia ni dataset, lo que impide auditorías básicas de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-missed-kick
- Sitio oficial y preventa del robot: https://microducks.org/
- Repositorio del robot en GitHub (Pollen Robotics): https://github.com/pollen-robotics/microduck
- TechRepublic, sobre el aprendizaje de la marcha con IA: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- TechCrunch, sobre el lanzamiento y precio: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- CNX Software, sobre hardware y especificaciones: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Previsualización incluida en el repositorio: `media/preview.mp4` (dentro del repositorio de Hugging Face)
