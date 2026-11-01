# padiredd/pick-cube-lime-sim-250-board-dr-3cam-dp

## Resumen

`pick-cube-lime-sim-250-board-dr-3cam-dp` es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario `padiredd`, entrenada con la librería LeRobot (versión 0.6.1, fork `ROBOTIS lerobot-cyclo`) sobre el brazo izquierdo de un robot ROBOTIS FFW BG2. La tarea concreta es recoger un bloque verde lima de 5x5x4 cm con un orificio pasante situado sobre una mesa gris, con un panel de espuma en el borde lejano. El modelo no es un LLM: es una política visomotora que mapea observaciones (tres cámaras e estado propioceptivo) a acciones de control del brazo.

El interés técnico reside en que se entrena exclusivamente con 250 episodios simulados (41.217 fotogramas a 15 fps) generados en Isaac Lab mediante un planificador scriptado con cinemática inversa, aplicando una randomización de dominio completa (texturas, iluminación, ligero jitter de pose de cámara, variación de color del bloque y de trayectoria del planificador). Con 287,5 millones de parámetros y un encoder ResNet18, demuestra que una política entrenada solo en simulación puede transferir razonablemente bien a entornos con texturas no vistas, lo que la convierte en un caso de estudio útil para pipelines de sim-to-real en manipulación.

La relevancia actual es doble: por un lado, ilustra el flujo de trabajo estándar de LeRobot con diffusion policy; por otro, publica resultados de evaluación en simulación con texturas retenidas (held-out) que cuantifican la robustez frente a cambios visuales, un dato poco frecuente en modelos de este tamaño y con tan pocas descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 y decodificador de acciones; condicionada por observación (3 cámaras 240x240 + estado) |
| Parametros totales | 287.533.680 (288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica); horizonte de predicción 64 pasos, 32 pasos de acción, 1 paso de observación |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 (fork ROBOTIS lerobot-cyclo) |
| Pipeline | robotics |
| Dimensiones de estado / acción | observation.state: 22; action: 16 |
| Entradas visuales | 3 cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha), 240x240 |
| Pasos de entrenamiento | 100.000 (checkpoint final) |
| Tamaño del repo | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy estándar: un encoder visual ResNet18 procesa las tres imágenes de cámara (cabeza izquierda, muñeca izquierda y muñeca derecha), cada una reescalada a 240x240 con `cv2.INTER_AREA`, y la representación resultante se concatena con el vector de estado (22 dimensiones) para condicionar un proceso de difusión que genera secuencias de acción de 16 dimensiones. El entrenamiento usa DDPM con 100 pasos de ruido, horizonte de 64, 32 pasos de acción por predicción y 1 paso de observación. El optimizador es Adam con lr 1e-4, betas (0.95, 0.999), weight decay 1e-6, schedule coseno con 500 pasos de warm-up, batch de 8 y 100.000 pasos totales. La pérdida final de entrenamiento fue 0,001.

Los datos provienen íntegramente de simulación: 250 episodios recogidos en Isaac Lab (Cyclo Lab) con un planificador scriptado más cinemática inversa, totalizando 41.217 fotogramas a 15 fps. El bloque se coloca aleatoriamente en una caja de 10x10 cm centrada en (x 0,48, y 0,19) m. La randomización de dominio cubre texturas de fondo y mesa, iluminación, jitter de pose de cámara, variación de color y aspecto del bloque, y variación de trayectoria del planificador; no se emplean distractores. No hay aumentación de imagen ni ruido de estado, ya que la variabilidad se introduce en la generación de datos. Un detalle operativo relevante: las dimensiones de estado 8 a 21 (brazo derecho, cabeza, elevación y odometría) son constantes en los datos de entrenamiento y deben fijarse a su punto medio de entrenamiento en inferencia.

## Capacidades

- Generación de trayectorias de acción para el brazo izquierdo del ROBOTIS FFW BG2 en la tarea de recogida de un bloque con orificio pasante.
- Percepción visomotora a partir de tres cámaras simultáneas (cabeza y dos muñecas), con codificación ResNet18.
- Condicionamiento por estado propioceptivo de 22 dimensiones, con 16 dimensiones de acción.
- Robustez a variaciones visuales: texturas, iluminación y color del objeto, gracias a la randomización de dominio en entrenamiento.
- Inferencia con DDPM (100 pasos) o DDIM (10 pasos, eta 0), lo que permite intercambiar calidad por latencia.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Recogida de piezas con orificio en líneas de montaje simuladas: el modelo está entrenado específicamente para agarrar un bloque de 5x5x4 cm con orificio pasante sobre mesa gris, por lo que encaja en tareas de pick-and-place de piezas con geometría similar en entornos simulados.
- Generación de datos sintéticos y evaluación de pipelines sim-to-real: sirve como política de referencia para medir la brecha entre simulación limpia y simulación randomizada antes de invertir en entrenamiento real.
- Prototipado rápido en Isaac Lab: al ser un checkpoint de LeRobot, se puede cargar en el fork ROBOTIS lerobot-cyclo y evaluar en el entorno `board` con la configuración yaml y semilla 0 documentadas.
- Estudio de robustez frente a texturas no vistas: los resultados con 7 texturas ambientCG retenidas (42/50 con DDPM-100, 45/50 con DDIM-10) permiten usarlo como banco de pruebas para técnicas de randomización de dominio.
- Comparación de schedulers de difusión en robótica: la diferencia entre DDPM-100 y DDIM-10 en entornos randomizados (40/50 frente a 43/50, y 42/50 frente a 45/50) lo convierte en un caso práctico para evaluar el compromiso calidad-latencia.
- Docencia y reproducción de experimentos: con 250 episodios y 100.000 pasos, es un ejemplo asequible para enseñar el flujo completo de LeRobot, desde la recogida de datos en Isaac Lab hasta la evaluación en simulación.
- Base para fine-tuning en tareas de manipulación con un solo brazo: al estar bajo Apache 2.0 y en safetensors, puede adaptarse a variantes de la tarea (otro color de bloque, otra mesa) con un conjunto reducido de episodios.

## Benchmarks y rendimiento

Evaluación en simulación del autor: 50 episodios, entorno `board`, bloque en cualquier punto de la caja de entrenamiento, pose inicial del yaml y semilla 0.

| Entorno | DDPM-100 | DDIM-10, eta 0 |
|---|---|---|
| Entorno `board` limpio | 50/50 | 50/50 |
| Randomizado, split de texturas de entrenamiento | 40/50 | 43/50 |
| Randomizado, texturas retenidas (7 ambientCG no vistas) | 42/50 | 45/50 |

El autor indica que las texturas retenidas no suponen coste apreciable de rendimiento y que aproximadamente la mitad de los fallos en entorno randomizado son caídas tras el levantamiento. El éxito con el bloque en la zona central de la caja (x 0,46-0,52 m) es de aproximadamente el 97 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M de parámetros en safetensors y tres flujos de imagen a 240x240, el peso de los parámetros en fp32 ronda 1,2 GB, por lo que una GPU consumer con 8 GB es suficiente en la práctica (estimación a partir del tamaño del repo, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar la política; para evaluación por lotes en Isaac Lab se recomienda una GPU dedicada de gama media o superior.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, aunque el autor no lo documenta.
- Opciones de despliegue: LeRobot 0.6.1 con el fork `ROBOTIS lerobot-cyclo`; el modelo está pensado para evaluarse en Isaac Lab (Cyclo Lab). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de difusión.
- Latencia y throughput: no disponibles. Cualitativamente, DDIM-10 reduce el coste de inferencia frente a DDPM-100 (10 pasos frente a 100) y en la evaluación del autor obtiene resultados iguales o mejores en entornos randomizados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, las diffusion policies de LeRobot para manipulación comparten arquitectura y flujo de entrenamiento, pero no se han facilitado datos concretos de parámetros, contexto ni rendimiento de alternativas, por lo que la comparación cuantitativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pick-cube-lime-sim-250-board-dr-3cam-dp | 288 M | no aplica | 50/50 limpio; 40-45/50 randomizado | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: no hay evidencia de transferencia a un robot físico, y el propio autor solo reporta evaluación en Isaac Lab.
- Tarea muy específica: un bloque verde lima de 5x5x4 cm con orificio pasante sobre mesa gris con panel de espuma; no generaliza a otros objetos, colores ni disposiciones sin reentrenamiento o fine-tuning.
- Dependencia de la configuración de estado: las dimensiones 8 a 21 (brazo derecho, cabeza, elevación, odometría) son constantes en entrenamiento y deben fijarse al punto medio; un uso con valores distintos puede degradar el comportamiento.
- Fallos documentados: aproximadamente la mitad de los fallos en entorno randomizado son caídas tras el levantamiento, lo que indica fragilidad en la fase de transporte.
- Sin distractores en entrenamiento: la presencia de objetos adicionales en escena no está cubierta por la randomización.
- Sin aumentación de imagen ni ruido de estado: la robustez depende enteramente de la randomización de los datos simulados.
- Riesgo de sobreajuste al entorno `board` y a la pose inicial del yaml; el éxito cae fuera de la zona central de la caja (x 0,46-0,52 m) aunque se mantiene dentro de la caja de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no hay garantías del autor sobre idoneidad para producción.
- Modelo con muy poca tracción (13 descargas, 0 likes) y sin documentación externa ni paper asociado; la información disponible proviene únicamente de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/pick-cube-lime-sim-250-board-dr-3cam-dp
- LeRobot (librería): no disponible en la información proporcionada
- Isaac Lab (Cyclo Lab): no disponible en la información proporcionada
- Fork ROBOTIS lerobot-cyclo: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
