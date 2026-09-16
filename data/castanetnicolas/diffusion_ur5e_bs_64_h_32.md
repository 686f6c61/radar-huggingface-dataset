# castanetnicolas/diffusion_UR5e_BS_64_H_32

## Resumen

`castanetnicolas/diffusion_UR5e_BS_64_H_32` es una política de control visuomotor basada en Diffusion Policy (Chi et al., arXiv:2303.04137) publicada en Hugging Face por el usuario castanetnicolas. No es un modelo de lenguaje: es un modelo de robótica que convierte observaciones del robot (estado articular y dos cámaras RGB) en trayectorias de acción, tratando el control como un proceso generativo de difusión que produce secuencias de acciones suaves y multi-paso, adecuadas para manipulación con contacto.

El modelo se ha entrenado y publicado con LeRobot 0.6.1, la librería de aprendizaje por imitación de Hugging Face. Está especializado en una única tarea sobre un robot Universal Robots UR5e: "Pick up the can and place it in the correct bin". El conjunto de entrenamiento asociado contiene 100 episodios y 10 575 fotogramas a 20 FPS, lo que equivale a unos 8,8 minutos de demostraciones.

Su relevancia es la de un artefacto de referencia reproducible: pesos pequeños (89,3 millones de parámetros, 0,4 GB de repositorio), licencia Apache 2.0 y un pipeline completo de entrenamiento y despliegue documentado con la CLI de LeRobot. Es útil como punto de partida para experimentos de aprendizaje por imitación en robótica de manipulación, no como componente de un sistema de producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion condicionado por observaciones) implementado en LeRobot; la model card no detalla la red de denoising |
| Parametros totales | 89 326 276 (~89,3 M), segun los pesos safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). El sufijo `H_32` del nombre sugiere un horizonte de prediccion de 32 pasos, pero no se confirma en la model card |
| Tipos de cuantizacion | no disponible; se publican pesos en precision completa (safetensors). No se documentan variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no aplica; las entradas son estado articular e imagenes, no texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |
| Tipo de robot | `ur5e` (Universal Robots UR5e) |
| Camaras | `camera1`, `camera2` |
| Entradas | `observation.state` (9,), `observation.images.camera1` (3, 256, 256), `observation.images.camera2` (3, 256, 256) |
| Salidas | `action` (4,) |
| Dataset de entrenamiento | castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint (100 episodios, 10 575 fotogramas, 20 FPS) |
| Tarea | "Pick up the can and place it in the correct bin." |
| Configuracion de entrenamiento | 100 000 pasos, batch size 64, optimizador adam, learning rate 1e-4, seed 1000, LeRobot 0.6.1 |

## Arquitectura y entrenamiento

Diffusion Policy plantea el control visuomotor como un proceso de difusion generativo: en lugar de predecir directamente una acción, el modelo aprende a generar trayectorias de acción completas (chunks) mediante un proceso de denoising iterativo condicionado por las observaciones. Este enfoque produce movimientos suaves y multi-paso y tiende a comportarse mejor que las políticas unimodales en tareas con contacto rico, donde las distribuciones de acciones son multimodales. La model card no especifica el número de pasos de difusión, el tipo de scheduler, ni la arquitectura concreta de la red de denoising; solo indica el tipo de política (`policy.type=diffusion`) y la referencia al paper.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100 000 pasos con batch size 64, optimizador Adam y learning rate 0,0001 (seed 1000). El dataset asociado contiene 100 episodios y 10 575 fotogramas grabados a 20 FPS sobre un UR5e con dos cámaras. El nombre del dataset (`..._absolute_joint`) indica que las acciones se representan en espacio articular absoluto. La salida del modelo tiene 4 dimensiones, coherente con el número de grados de libertad controlados del UR5e. No se documenta ningún uso de RLHF, DPO ni fine-tuning posterior al entrenamiento por imitación.

## Capacidades

- Control visuomotor de manipulación: genera trayectorias de acción de 4 dimensiones a partir de estado articular (9,) y dos vistas RGB de 256x256.
- Ejecución de una tarea concreta de pick-and-place: recoger una lata y depositarla en el contenedor correcto, aprendida por imitación de 100 demostraciones.
- Generación de acciones multimodales y suaves, ventaja característica de las políticas de difusión frente a políticas unimodales en entornos con contacto.
- Ejecución autónoma en bucle cerrado sobre hardware real mediante `lerobot-rollout` con la estrategia `base`, sin grabación de episodios.
- Posibilidad de reentrenamiento y fine-tuning con `lerobot-train` sobre el mismo dataset u otros datasets compatibles con la librería.
- Integración en el ecosistema LeRobot: comandos de línea de órdenes, checkpoints en disco y registro opcional en Weights & Biases.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas, de visión general, de audio ni de modo "thinking".
- No se documenta soporte de agentes, planificación de alto nivel ni composición de habilidades.

## Casos de uso

- Automatización de pick-and-place sobre UR5e en líneas de montaje o celdas de laboratorio: el modelo ejecuta directamente la tarea de recogida y depósito aprendida, con dos cámaras como única entrada perceptiva, y se despliega en bucle cerrado con `lerobot-rollout`.
- Clasificación y depósito de piezas en contenedores: la tarea entrenada ("place it in the correct bin") es directamente aplicable a estaciones donde hay que separar objetos por tipo, siempre que la posición y apariencia se mantengan dentro de la distribución del dataset.
- Punto de partida para fine-tuning en tareas de manipulación con contacto: al ser una Diffusion Policy, sirve como inicialización para reentrenar con `lerobot-train` en tareas nuevas del mismo robot, aprovechando los patrones de movimiento aprendidos.
- Banco de pruebas para investigación en aprendizaje por imitación: permite reproducir de extremo a extremo un experimento de Diffusion Policy (dataset de 100 episodios, hiperparámetros documentados, seed fija) y comparar variantes de horizonte, batch size o número de vistas.
- Evaluación comparativa de métodos de imitación dentro de LeRobot: al ser un artefacto pequeño (89,3 M de parámetros, 0,4 GB) se puede entrenar y evaluar varias veces en una GPU de gama media, lo que facilita comparaciones controladas con otras políticas del mismo framework.
- Prototipado rápido de aplicaciones robóticas en laboratorios con un UR5e disponible: el coste de cómputo del modelo es bajo y la licencia Apache 2.0 permite modificarlo y redistribuirlo sin obligaciones de copyleft.
- Validación de infraestructura de captura de datos: la política define exactamente el formato de observación esperado (estado de 9 dimensiones y dos cámaras de 256x256), lo que sirve de referencia para calibrar y verificar un montaje de sensores antes de grabar datasets propios.
- Demostraciones y docencia en robótica: permite ilustrar el ciclo completo grabar datos, entrenar política, desplegar en robot con un ejemplo público y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto no hay tasas de éxito en robot real, ni número de ensayos, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB si se carga en precisión completa (los pesos ocupan aproximadamente 0,36 GB en fp32 y 0,18 GB en fp16) más las activaciones de las dos ramas de imagen de 256x256; la model card no publica mediciones, por lo que la cifra es una estimación basada en el tamaño de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 4090, RTX 3090, A100 o H100 ofrecen margen sobrado, pero no son necesarias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas (RTX 3060 en adelante). También es viable la inferencia en CPU, ya que el modelo es pequeño, aunque con mayor latencia.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`), y entrenamiento o reentrenamiento con `lerobot-train`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un transformer de lenguaje.
- Requisitos de integración hardware: robot UR5e, dos cámaras OpenCV configuradas con los nombres `camera1` y `camera2` (los nombres deben coincidir con las claves de observación del entrenamiento) y calibración previa del robot y las cámaras.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS (50 ms por fotograma), lo que da una referencia de la frecuencia de control del montaje original, pero la model card no publica tiempos de inferencia ni frecuencia alcanzable en despliegue.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La model card no incluye métricas ni referencias numéricas frente a otras políticas. Las alternativas de la misma categoría (políticas de aprendizaje por imitación visuomotor, como ACT, pi0 o SmolVLA dentro del ecosistema LeRobot) no aparecen mencionadas ni caracterizadas en la información disponible, por lo que no se pueden comparar parámetros, contexto, rendimiento ni disponibilidad con rigor.

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| diffusion_UR5e_BS_64_H_32 | 89,3 M | no disponible (el nombre sugiere H=32, sin confirmar) | apache-2.0 | Hugging Face, via LeRobot |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (UR5e). No es un modelo general de robótica ni transferible sin reentrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito publicadas en robot real, por lo que se desconoce su robustez fuera de las condiciones exactas del dataset.
- Dataset reducido: 100 episodios y 10 575 fotogramas (unos 8,8 minutos) implican poca diversidad de posiciones, iluminación y configuraciones de escena. Es probable que el rendimiento se degrade ante objetos, posiciones o condiciones de luz no vistas durante el entrenamiento.
- Dependencia de la configuración de percepción: los nombres de cámara (`camera1`, `camera2`) y el formato de estado (9,) y acción (4,) son fijos. Cualquier cambio en el montaje de sensores, calibración o resolución invalida la política.
- Riesgo de sobreajuste al entorno: las políticas de imitación con pocos datos pueden reproducir comportamientos espurios de las demostraciones (sesgos de trayectoria, dependencia de marcas visuales o del fondo).
- Ausencia de cuantizaciones y optimizaciones publicadas: no hay versiones GGUF, int8 ni kernels específicos, por lo que el despliegue se limita a PyTorch con los pesos safetensors del repositorio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia. El autor recomienda además citar el paper de Diffusion Policy y LeRobot.
- Fecha de creación y actualización muy próximas (16 de septiembre de 2026) y cero descargas e interacciones en el momento de la consulta: se trata de un artefacto reciente y sin validación por parte de la comunidad.
- No debe desplegarse en producción con personas o maquinaria en el radio de acción del robot sin una validación exhaustiva de seguridad, ya que no hay datos de fiabilidad ni protocolos de parada documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se encontraron enlaces relevantes sobre el modelo. Los resultados devueltos correspondían a páginas de ayuda de cuentas de correo (Google, Gmail, BT) sin relación con el modelo ni con robótica.
