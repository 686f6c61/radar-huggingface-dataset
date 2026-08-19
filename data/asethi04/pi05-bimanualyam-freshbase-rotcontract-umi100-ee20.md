# ASethi04/pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20

## Resumen

El modelo `pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20` es un checkpoint de investigación para robótica bimanual desarrollado por ASethi04. Se basa en la arquitectura π0.5 de Physical Intelligence (según el nombre y el repositorio openpi), un modelo de visión-lenguaje-acción (VLA) de tipo flow-based. Está entrenado específicamente para la tarea de recoger naranjas y colocarlas en un cuenco, utilizando dos brazos robóticos de forma coordinada. El checkpoint se publica bajo la librería LeRobot y contiene 4.143.404.816 parámetros (~4,14 mil millones), con un tamaño de repositorio de 16,6 GB.

Este modelo resuelve el problema del control bimanual de robots mediante aprendizaje por imitación, usando un dataset UMI (Universal Manipulation Interface) con lidar dual y una proporción del 100% de datos UMI frente a 0% de teleoperación. El entrenamiento se realizó durante 12.000 pasos de optimizador con semilla 1000. La relevancia actual radica en que es un ejemplo de aplicación de la arquitectura π0.5 a tareas bimanuales con contracción de rotación SO(3), una técnica que modifica los objetivos de orientación para facilitar el aprendizaje. Sin embargo, se trata de un checkpoint de investigación sin validación en hardware real y sin licencia especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 de Physical Intelligence (flow-based), detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El nombre del modelo y el repositorio asociado (openpi de Physical Intelligence) indican que se trata de un modelo π0.5, un VLA basado en flujos (flow-based) que procesa observaciones visuales y produce acciones de control. El checkpoint se describe como "Fresh-base pi05 EE20/H24", lo que sugiere un horizonte de acción de 24 pasos (H24) y posiblemente 20 épocas o un esquema de experto (EE20). No se especifican los detalles de la red troncal (vision encoder, backbones, etc.).

El entrenamiento se realizó con 12.000 pasos de optimizador y semilla 1000, utilizando un dataset UMI con lidar dual (`brandonyang/dual-lidar-umi-independent`) en un 100% y un dataset de teleoperación (`brandonyang/yam-ultrawide-teleop`) en un 0%. La tarea es "pick up oranges and place them in the bowl". Se aplicó una contracción de rotación SO(3) solo a los objetivos de orientación UMI, con factores de 0,6034 para el brazo izquierdo y 0,5799 para el derecho. La acción por brazo consiste en la posición XYZ, las dos primeras filas de la matriz de rotación y el estado absoluto del gripper futuro normalizado. La transformación aplicada es `inverse(T_t) @ T_(t+k)` de forma independiente para cada k de 1 a 24, y el orden de brazos es izquierdo seguido de derecho. No se usa padding terminal; se ejecuta exactamente el horizonte H24.

## Capacidades

- Control bimanual de robots: genera acciones de control para dos brazos robóticos de forma coordinada.
- Manipulación de objetos: entrenado para la tarea de recoger naranjas y colocarlas en un cuenco, lo que implica agarre, transporte y liberación.
- Aprendizaje por imitación: utiliza datos UMI con lidar dual, lo que permite operar con observaciones de profundidad.
- Predicción de acciones multi-paso: horizonte de 24 pasos (H24), generando secuencias de acciones futuras.
- Salida de acciones en formato R6D (rotación de 6 dimensiones) con gripper absoluto normalizado.
- Sin capacidades de lenguaje, visión general o razonamiento fuera del ámbito robótico.

## Casos de uso

- Manipulación bimanual en entornos de investigación: el modelo puede utilizarse en laboratorios de robótica para estudiar estrategias de control coordinado de dos brazos, por ejemplo en tareas de ensamblaje o clasificación de objetos.
- Recogida y colocación de objetos en líneas de producción: la tarea de recoger naranjas y colocarlas en un cuenco es representativa de tareas de pick-and-place; el modelo podría adaptarse a otros objetos y contenedores con un fine-tuning adicional.
- Evaluación de arquitecturas VLA en robótica: sirve como punto de partida para comparar el rendimiento de π0.5 frente a otros modelos VLA en tareas bimanuales.
- Desarrollo de sistemas de control con contracción SO(3): el checkpoint permite investigar el efecto de la contracción de rotación en el aprendizaje de políticas robóticas.
- Simulación robótica: puede desplegarse en entornos simulados (por ejemplo, MuJoCo o Isaac Sim) para validar políticas antes de pasar a hardware real.
- Benchmarking de datasets UMI: al estar entrenado exclusivamente con datos UMI, es útil para evaluar la calidad y el impacto de este tipo de datasets en tareas bimanuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene ~4,14 mil millones de parámetros y un tamaño de repo de 16,6 GB, lo que indica que los pesos en precisión FP32 o FP16 ocupan varios gigabytes.
- Para inferencia en FP16 se estima un consumo de VRAM de aproximadamente 8-10 GB solo para los pesos, más overhead de activaciones y contexto; una GPU con al menos 16 GB de VRAM sería necesaria para operar con comodidad.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares.
- Es posible que quepa en GPUs de consumo como la RTX 4080 o 4090 si se aplican cuantizaciones, aunque no se especifican formatos cuantizados.
- Opciones de despliegue: al ser un modelo LeRobot, se puede cargar con la librería LeRobot en Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El checkpoint se basa en π0.5, pero no hay datos públicos de rendimiento. Alternativas en el espacio de VLA robóticos incluyen OpenVLA (7B parámetros, basado en Prismatic) y el π0 original de Physical Intelligence, pero no se han encontrado comparaciones directas con este checkpoint concreto.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. La model card advierte explícitamente que el uso en hardware requiere despliegue de IK, límites de articulación y colisión, comprobaciones de éxito I2RT y procedimientos de seguridad física.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay datos sobre sesgos, alucinaciones o limitaciones de idioma, ya que no es un modelo de lenguaje.
- La contracción de rotación SO(3) es parte del objetivo aprendido, no una conversión de marco. Se debe ejecutar la salida R6D directamente a través del pipeline EE-to-IK, sin decontraer los vectores de rotación antes de IK.
- El modelo está entrenado para una tarea muy específica (recoger naranjas y colocarlas en un cuenco) y puede no generalizar a otras tareas sin fine-tuning.
- Se recomienda fijar la revisión inmutable del Hub en lugar de `main` para reproducibilidad.
- No se proporcionan métricas de éxito ni validación en hardware real, por lo que su rendimiento real es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-rotcontract-umi100-ee20
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Modelos relacionados en HuggingFace:
  - https://huggingface.co/ASethi04/pi05-BimanualYAM-oranges
  - https://huggingface.co/ASethi04/pi05-BimanualYAM-oranges-uw-notop
- Implementación de pi05 en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
