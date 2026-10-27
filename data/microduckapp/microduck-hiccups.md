# microduckapp/microduck-hiccups

## Resumen

`microduckapp/microduck-hiccups` es un artefacto de robótica publicado en Hugging Face: no es un modelo de lenguaje, sino una **política de control entrenada para el robot bípedo Microduck** y exportada a ONNX. El repositorio contiene `policy.onnx`, que recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, un `manifest.json` con los requisitos de instalación y reproducción dentro de la app MicroDuck, y un previsualización en vídeo (`media/preview.mp4`). La política implementa un movimiento de 10,4 segundos llamado «Hiccups», en el que el robot camina y cada pocos pasos sufre un espasmo de cabeza y mira alrededor con gesto de vergüenza.

El modelo lo publica la cuenta `microduckapp`, vinculada al robot Microduck de Pollen Robotics (Hugging Face), un bípedo open source de 25 cm y 399 dólares presentado en agosto de 2026 como plataforma de experimentación en IA física, aprendizaje por refuerzo y transferencia sim-a-real. El robot entrena sus comportamientos en MuJoCo y los despliega en hardware; este repositorio es una de esas «habilidades» empaquetadas y listas para instalar.

Su relevancia es la de un ejemplo canónico de distribución de comportamientos robóticos como artefactos versionados: una política ONNX con un manifiesto de instalación permite que cualquiera descargue un movimiento y lo reproduzca en su unidad sin reentrenar. La model card no aporta detalles sobre la arquitectura interna de la red, el número de parámetros ni la licencia, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX; topología interna (capas, tamaño) no disponible en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control reactiva; sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye un único `policy.onnx`) |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Espacio de observacion | 61 entradas |
| Espacio de accion | 14 consignas articulares |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 10,4 s (≈520 pasos de control a 50 Hz) |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repo | 0.0 GB (redondeado por Hugging Face; por debajo de 100 MB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La información pública solo confirma el contrato de entrada/salida de la política: 61 observaciones de entrada, 14 objetivos articulares de salida y una frecuencia de ejecución de 50 Hz, empaquetados en un grafo ONNX. No se especifica en la model card el tipo de red (MLP, transformer, política recurrente), el número de capas ni el cómputo por paso. El contexto del ecosistema Microduck indica que los comportamientos del robot se obtienen mediante aprendizaje por refuerzo en simulación con MuJoCo y se transfieren después al hardware físico, pero el repositorio no documenta el número de pasos de entrenamiento, la composición del dataset, la función de recompensa ni si hubo ajuste fino sobre el hardware real.

El artefacto se acompaña de un `manifest.json` que describe «qué necesita instalar y reproducir» el pato, es decir, metadatos de instalación para la app MicroDuck (versión de política, duración, dependencias de reproducción). El movimiento está diseñado como pieza cerrada de 10,4 segundos, no como política condicionada por objetivos: se reproduce de principio a fin. No hay información publicada sobre innovaciones técnicas (decodificación especulativa, atención lineal, destilación) porque no aplican a este tipo de artefacto.

## Capacidades

- Reproducción de una secuencia de marcha con espasmos de cabeza periódicos («hic!») y gestos de mirada alrededor, con una duración fija de 10,4 s.
- Control de 14 articulaciones del bípedo Microduck a 50 Hz a partir de 61 observaciones.
- Ejecución determinista de una política preentrenada: no hay condicionamiento por prompt, texto, voz ni imagen.
- Distribución como habilidad instalable: el `manifest.json` permite que la app MicroDuck instale y reproduzca el movimiento sin reentrenamiento.
- Inferencia portable vía ONNX, ejecutable en runtimes estándar (ONNX Runtime) sobre la computadora del robot o hardware externo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modo «thinking».
- No procesa visión, audio ni lenguaje: el canal de entrada es exclusivamente el vector de observaciones propiocepioceptivas del robot.

## Casos de uso

- **Catálogo de habilidades para Microduck**: instalar `policy.onnx` y `manifest.json` en la app MicroDuck para que la unidad reproduzca el movimiento en demonstrations públicas sin escribir código de control.
- **Base para ajuste fino con aprendizaje por refuerzo**: usar la política como inicialización en MuJoCo y reentrenar con una función de recompensa distinta (por ejemplo, marcha más estable o espasmos menos frecuentes), aprovechando que el espacio de acciones de 14 articulaciones ya está definido.
- **Prueba de transferencia sim-a-real**: comparar la ejecución del mismo grafo ONNX en simulador y en hardware para medir desviaciones de seguimiento a 50 Hz, un test útil para calibrar el pipeline de despliegue del robot.
- **Banco de pruebas de latencia de inferencia embebida**: verificar que el grafo ONNX se evalúa por debajo de 20 ms (el periodo de 50 Hz) en la computadora del robot, y comparar runtimes (ONNX Runtime, ejecución con aceleración en CPU/NPU) usando una política de tamaño pequeño como carga de referencia.
- **Contenido y demostraciones de producto**: el clip `media/preview.mp4` y la propia naturaleza expresiva del movimiento sirven para vídeos de presentación, ferias y materiales de prensa sobre robótica open source de bajo coste.
- **Material docente sobre comportamientos como artefactos**: ejemplo real de cómo se versiona y distribuye una política RL (pesos + manifiesto + previsualización) en un repositorio de modelos, útil en cursos de IA física y MLOps para robótica.
- **Validación del instalador de la app MicroDuck**: emplear el manifiesto como caso de prueba de los flujos de descarga, verificación e instalación de movimientos de terceros en la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito del movimiento, error de seguimiento articular ni comparaciones con otras políticas del mismo robot.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio se redondea a 0.0 GB y el número de parámetros no se publica, por lo que no puede calcularse una cifra fiable; por el tipo de artefacto (política de control para un bípedo de 25 cm) es esperable que quepa holgadamente en memoria de CPU, pero esto no está confirmado en la documentación.
- **GPU recomendadas**: no disponibles en la información proporcionada. Para inferencia a 50 Hz de un grafo ONNX de política pequeña, una CPU moderna o una GPU de gama de entrada suelen ser suficientes; sin datos de tamaño no puede afirmarse.
- **¿Cabe en GPU de consumo?**: no disponible con rigor; no se especifica el cómputo del grafo.
- **Plataforma de destino**: la computadora del robot Microduck, que ejecuta la política dentro de la app MicroDuck según el `manifest.json`.
- **Opciones de despliegue**: ONNX Runtime es el runtime natural del formato; el despliegue previsto es la app MicroDuck sobre el propio robot. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: el contrato exige evaluación a 50 Hz, es decir, un presupuesto de 20 ms por paso de control (≈520 pasos para los 10,4 s del movimiento). No se publican latencias medidas ni rendimiento real.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduckapp/microduck-hiccups | Movimiento Microduck (ONNX) | 61 / 14 | 50 Hz | 10,4 s | No disponible | Hugging Face, 0 descargas |
| microduckapp/microduck-midnight-snack | Movimiento Microduck (ONNX) | No disponible | No disponible | No disponible | No disponible | Hugging Face (misma cuenta, 16 modelos publicados) |
| Otras habilidades de `microduckapp` | Movimientos Microduck (ONNX) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Políticas de locomoción de Microduck (base del robot) | Políticas RL entrenadas en MuJoCo | No disponible | No disponible | No disponible | No disponible (el robot es open source; la licencia del modelo no se indica) | Repositorio `pollen-robotics/microduck` |

La comparación cuantitativa con alternativas no es posible: la model card de este artefacto y las de los movimientos hermanos de la misma cuenta no publican parámetros, métricas ni condiciones de entrenamiento.

## Limitaciones y advertencias

- **Licencia no declarada**: al no indicarse licencia en la model card ni en los metadatos, no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo para producción hasta que el autor lo aclare.
- **Sin métricas de calidad**: no hay datos de tasa de éxito, estabilidad del movimiento ni error de seguimiento; no puede evaluarse su robustez frente a perturbaciones o terrenos irregulares.
- **Específico de un chasis**: la política está entrenada para el Microduck de 25 cm; ejecutarla en otro robot o en una unidad con calibración distinta de las 14 articulaciones puede producir comportamientos erráticos.
- **Movimiento cerrado y no condicionado**: no acepta parámetros de entrada en tiempo de ejecución (velocidad, dirección, duración); se reproduce tal cual, lo que limita su reutilización más allá de la demostración.
- **Ausencia de salvaguardas documentadas**: no se describe ningún mecanismo de parada, limitación de pares o recuperación ante caída; en un bípedo de dos patas esto exige supervisión física durante las pruebas.
- **Riesgo de alucinación**: no aplica (no genera texto). El riesgo análogo es la divergencia de la política fuera de la distribución de observaciones vista en entrenamiento.
- **Sin soporte de idioma ni contexto**: al no procesar lenguaje, no puede atenderse ninguna expectativa de prompting, chat o RAG.
- **Metadatos incompletos**: 0 descargas y 0 likes, sin documentación de entrenamiento, sin ficha técnica de arquitectura y con el tamaño del repo redondeado, lo que impide reproducir el entrenamiento.
- **Fecha y ecosistema**: publicado en octubre de 2026 bajo el paraguas de un proyecto (Microduck de Pollen Robotics / Hugging Face) presentado en agosto de 2026; conviene verificar compatibilidad con la versión de la app MicroDuck antes de instalar el manifiesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-hiccups
- Previsualización del movimiento: https://huggingface.co/microduckapp/microduck-hiccups/blob/main/media/preview.mp4
- Cuenta del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura de PCMag: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
