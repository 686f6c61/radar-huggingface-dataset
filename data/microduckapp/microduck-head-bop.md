# microduckapp/microduck-head-bop

## Resumen

`microduckapp/microduck-head-bop` es una política de control motriz publicada en Hugging Face dentro de la categoría `microduck-move`: un movimiento pregrabado de 10,4 segundos para el robot bípedo Microduck, desarrollado por Pollen Robotics en colaboración con Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un artefacto de robótica que traduce 61 observaciones del estado del robot en 14 consignas articulares a 50 Hz, empaquetado como `policy.onnx` y acompañado de un `manifest.json` con los requisitos de instalación y reproducción.

El repositorio lo mantiene la cuenta `microduckapp`, vinculada a la app oficial del robot, y su función es distribuir comportamientos expresivos listos para instalar en el dispositivo. El movimiento consiste en balancear la cabeza al ritmo con inclinaciones y giros que culminan en un remate, según la descripción del autor. Es relevante para quien trabaje con el ecosistema Microduck porque muestra el formato de empaquetado de habilidades (política ONNX + manifiesto + previsualización) que la plataforma utiliza para compartir comportamientos.

La información pública disponible es mínima: cero descargas, cero valoraciones, licencia no declarada y ausencia total de datos sobre arquitectura interna, parámetros o procedencia del entrenamiento. Cualquier evaluación técnica debe partir de esa limitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como política de control exportada a ONNX; la model card no especifica la topología interna (MLP, transformer u otra) |
| Parametros totales | No disponible. El tamano del repo es 0.0 GB, compatible con un fichero de pesos muy pequeno |
| Parametros activos | No aplica (no se declara que sea un modelo MoE) |
| Longitud de contexto | No aplica. No hay ventana de contexto textual; la política recibe 61 observaciones por paso de control a 50 Hz y no se documenta memoria de estado entre pasos |
| Tipos de cuantizacion | No disponibles. Se publica un unico `policy.onnx`; no se documenta cuantizacion int8/fp16 ni variantes |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no se declaran idiomas) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones |
| Salidas | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duracion del movimiento | 10,4 s |
| Artefactos adicionales | `manifest.json` (requisitos de instalacion y reproduccion), `media/preview.mp4` |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red: únicamente se declara el contrato de entrada y salida del grafo ONNX (61 observaciones de entrada, 14 objetivos articulares de salida) y la frecuencia de ejecución de 50 Hz. Con ese contrato, la política encaja en el esquema habitual de control por aprendizaje: observaciones del estado del robot y de sus articulaciones como entrada, y consignas de posición o par para las 14 articulaciones como salida, ejecutadas en bucle cerrado a 20 ms por paso.

Tampoco se documentan los datos de entrenamiento ni el método: no hay información sobre número de episodios, simulador empleado, composición del dataset, ni sobre si hubo ajuste fino con preferencias humanas o recompensas de estilo. El contexto público del ecosistema Microduck —robot bípedo de 25 cm entrenado con aprendizaje por refuerzo en MuJoCo, según la nota de MarkTechPost sobre su lanzamiento— sugiere que las habilidades de la app se producen en esa línea de trabajo, pero esa relación no se afirma en la ficha del modelo y no debe darse por confirmada. No se declara ninguna innovación técnica específica (decodificación especulativa, atención lineal u otras), lo cual es coherente con la naturaleza del artefacto.

## Capacidades

- Ejecución de una habilidad motriz concreta y cerrada: «Head Bop», 10,4 s de balanceo de cabeza con inclinaciones y giros y un remate final.
- Control articular a 50 Hz sobre 14 articulaciones del Microduck, con 61 observaciones de entrada por ciclo.
- Instalación y reproducción gestionadas por la app del robot a partir del `manifest.json` incluido.
- Distribución portable: al estar en ONNX, el grafo puede ejecutarse con ONNX Runtime en distintos backends (CPU, CUDA, TensorRT) sin depender del framework de entrenamiento.
- Previsualización del resultado mediante `media/preview.mp4`, útil para evaluar el movimiento antes de instalarlo.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento agéntico. No hay modo «thinking» ni soporte multilingüe.
- No se documenta capacidad de generalización: es un movimiento de duración fija, no una habilidad paramétrica ni compositiva.

## Casos de uso

- Demostración de producto en ferias y eventos: instalar la habilidad en un Microduck de exposición para dotarlo de una rutina expresiva de 10 s que ilustra la expresividad del robot sin necesidad de teleoperación.
- Prueba de integración del pipeline de habilidades: usar el `policy.onnx` y el `manifest.json` como caso de referencia para validar el cargador de movimientos de la app, el envío de consignas a 50 Hz y la sincronización con el bucle de control del robot.
- Verificación de latencia del runtime: al ser un grafo con 61 entradas y 14 salidas ejecutado cada 20 ms, sirve como test mínimo para medir el coste de invocación de ONNX Runtime en el hardware objetivo antes de desplegar habilidades más pesadas.
- Material audiovisual y marketing: el `preview.mp4` y el movimiento pueden reutilizarse para generar clips de producto o contenido para redes, con una rutina reproducible y sin dependencia de un operador.
- Docencia e investigación en control: ejemplo didáctico de contrato observación-acción a frecuencia fija, útil para explicar cómo se empaqueta y se ejecuta una política aprendida en un robot real.
- Base para experimentos de estilo o reentrenamiento: el formato de 61→14 a 50 Hz puede servir como plantilla de接口 para probar variantes de la política (por ejemplo, cambios en la secuencia) manteniendo el resto del pipeline intacto.
- Pruebas de robustez sim-to-real: reproducir el movimiento en el robot físico y compararlo con la previsualización para detectar desviaciones de seguimiento articular o pérdida de equilibrio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de seguimiento articular, tasa de éxito, error de posición, consumo de par ni comparaciones con otras habilidades. Tampoco se aportan datos de latencia reales; el único dato objetivo es la frecuencia de control nominal de 50 Hz (20 ms por paso) y la duración del movimiento, 10,4 s.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con un contrato de 61 entradas y 14 salidas y un repo de 0.0 GB, la política cabe holgadamente en cualquier dispositivo; se trata de una estimación derivada del tamano del artefacto, no de un dato publicado.
- GPU recomendadas: no se especifica ninguna. Por el perfil de carga, la inferencia es viable en CPU del propio robot o en un host embebido.
- Compatibilidad con GPU de consumo: no aplica en la práctica; no se requiere RTX 4090, A100 ni H100 para ejecutar este grafo.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con posibilidad de optimización vía TensorRT u OpenVINO. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no medidos. El presupuesto de control es de 20 ms por paso para sostener los 50 Hz; el cumplimiento real de ese presupuesto en el hardware del Microduck no se documenta.
- Requisitos adicionales: robot Microduck físico o su simulador, más la app oficial para interpretar el `manifest.json`.

## Comparativa con modelos similares

No se dispone de datos de otras políticas del catálogo `microduck-move` (parámetros, frecuencia, duración, licencia) en la información proporcionada, por lo que no es posible una comparación cuantitativa entre movimientos.

| Criterio | microduck-head-bop | Otras habilidades `microduck-move` | Animación por keyframes programada | Política RL entrenada ad hoc |
|---|---|---|---|---|
| Naturaleza | Política de control en ONNX | No disponible | Secuencia de poses interpoladas | Política aprendida |
| Entrada / salida | 61 / 14 a 50 Hz | No disponible | Poses clave y tiempos | Definido por el disenador |
| Duracion | 10,4 s | No disponible | Arbitraria | Arbitraria |
| Licencia | No disponible | No disponible | Depende del proyecto | Depende del proyecto |
| Portabilidad | Alta (ONNX estándar) | No disponible | Alta si se exporta | Media (depende del framework) |
| Coste de authoring | No documentado | No disponible | Bajo, manual | Alto (entrenamiento en simulador) |
| Disponibilidad | Pública en Hugging Face | No disponible | No aplica | No aplica |

Frente a modelos fundacionales de robótica (VLA de gran tamano), este artefacto no es comparable: no procesa lenguaje ni imágenes y no generaliza a instrucciones nuevas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: se desconoce la arquitectura de la red, el número de parámetros, el dataset de entrenamiento y el procedimiento de validación, lo que impide auditar su comportamiento.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución o modificación. En producción, esto es un bloqueo legal hasta que el autor la especifique.
- Movimiento cerrado y de duración fija: no admite parámetros de entrada, no se compone con otras habilidades y no responde a instrucciones del usuario.
- Sin datos de robustez: no se reporta comportamiento ante perturbaciones, suelo irregular, empujes o desviaciones de la posición inicial; la tasa de éxito real se desconoce.
- Riesgo de sobreajuste al entorno de entrenamiento (sim-to-real): si la política se generó en simulación, el seguimiento de las 14 articulaciones en el robot físico puede degradarse respecto al `preview.mp4`.
- Riesgo de seguridad física: un bípedo de 25 cm que ejecuta giros e inclinaciones de cabeza puede desequilibrarse; no se documentan límites de par, paradas de emergencia ni condiciones de aborto.
- Idiomas: no aplica, pero conviene subrayar que el modelo no tiene ninguna capacidad lingüística pese a estar alojado en Hugging Face.
- Señales de adopción nulas: 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia de uso por terceros ni de validación externa.
- Metadatos incompletos: `region:us` y ausencia de campos de licencia e idiomas sugieren un empaquetado mínimo, sin revisión editorial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-head-bop
- Ficha del robot Microduck en ROBOTS: https://robotsguide.com/robots/microduck
- Sitio oficial y compra de Microduck: https://microducks.org/
- Blog de presentación de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/blog/introducing-microduck/
- Repositorio del robot en GitHub: https://github.com/pollen-robotics/microduck
- Nota de prensa sobre el lanzamiento (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
