# masondx/decoupled-diffusion-aloha-insertion-local-state-20k-bs32

## Resumen

El modelo `masondx/decoupled-diffusion-aloha-insertion-local-state-20k-bs32` es un checkpoint de inferencia EMA (exponential moving average) de una política de difusión bimanual desacoplada, entrenada para la tarea de inserción en el entorno simulado ALOHA. Desarrollado por masondx sobre un fork personalizado de la librería LeRobot, este modelo aborda el problema del aprendizaje por imitación para manipulación robótica bimanual, donde dos brazos deben coordinar acciones para completar una tarea de precisión.

La arquitectura se basa en una diffusion policy que genera secuencias de acciones de 64 pasos de horizonte, con un estado local dividido para cada brazo (7 dimensiones por brazo) y una entrada visual compartida (imagen superior de 480x640). Con 526 millones de parámetros y un tamaño de repositorio de 2,1 GB, el modelo está diseñado para ser evaluado en el entorno `AlohaInsertion-v0` de simulación, donde alcanza un 11% de éxito en 100 episodios. Su relevancia radica en explorar arquitecturas desacopladas para control bimanual, un área activa en robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy bimanual desacoplada (decoupled bimanual diffusion) |
| Parametros totales | 526.047.742 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy en la que cada brazo recibe su propio vector de estado de 7 dimensiones (posición y orientación del efector), mientras que la observación visual es compartida a través de una imagen superior de 480x640 píxeles. La comunicación entre brazos está desactivada (`communication mode: none`), y el enrutamiento de estado es `split`, lo que significa que cada brazo procesa su estado de forma independiente. La política predice un horizonte de 64 pasos de acción, de los cuales se ejecutan 32, con 2 pasos de observación.

El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 32, utilizando el dataset `lerobot/aloha_sim_insertion_human` de simulación ALOHA. Se empleó una semilla de entrenamiento de 1000 y se guardaron los pesos EMA junto con el preprocesador y postprocesador de LeRobot. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de aprendizaje por imitación.

## Capacidades

- Generación de acciones de control para robótica bimanual: produce dos secuencias de acciones de 7 dimensiones (una por brazo) para tareas de inserción.
- Aprendizaje por imitación: aprende de demostraciones humanas en simulación, sin necesidad de recompensas explícitas.
- Predicción de horizonte largo: genera 64 pasos de acciones, lo que permite planificar movimientos coordinados.
- Procesamiento de estado local: cada brazo utiliza su propio estado, lo que facilita el desacoplamiento del control.
- Entrada visual compartida: utiliza una única imagen superior para guiar la política, simplificando la percepción.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para carga, evaluación y despliegue.

## Casos de uso

- Investigación en manipulación bimanual: permite estudiar arquitecturas desacopladas para control de dos brazos en tareas de precisión como inserción de piezas.
- Evaluación de políticas de imitación en simulación: sirve como punto de referencia para comparar variantes de diffusion policy en entornos ALOHA.
- Desarrollo de controladores para ensamblaje automatizado: aunque el éxito es bajo (11%), puede servir como base para ajuste fino en tareas específicas de inserción.
- Pruebas de generalización en robótica: al estar entrenado en simulación, puede usarse para validar transferencia a entornos reales con adaptación adicional.
- Benchmarking de algoritmos de aprendizaje por refuerzo: como política base para comparar con métodos basados en RL.
- Educación en robótica y aprendizaje automático: útil para demostrar conceptos de diffusion policy y control bimanual en cursos avanzados.

## Benchmarks y rendimiento

El modelo fue evaluado en el entorno `AlohaInsertion-v0` con episodios de 400 pasos y lotes síncronos de 50 rollouts, utilizando dos semillas (1000 y 2000). Los resultados se resumen a continuación:

| Metrica | Valor |
|---|---|
| Tasa de exito (100 episodios) | 11/100 (11%) |
| Suma de recompensa promedio | 175,28 |
| Recompensa maxima promedio | 2,00 |
| Exito con semilla 1000 | 5/50 |
| Exito con semilla 2000 | 6/50 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al tener 526 millones de parametros y un tamaño de 2,1 GB en safetensors, la inferencia requiere al menos 2 GB de VRAM para cargar los pesos en precision FP32, aunque con cuantizacion podria reducirse. No se especifican requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060) podria ejecutar la inferencia, aunque no se han publicado pruebas. Para entrenamiento se necesitaria mayor capacidad (por ejemplo, RTX 3090 o A100).
- Compatibilidad con GPU de consumo: probablemente si, dado el tamaño moderado, pero no hay confirmacion oficial.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede cargar con la libreria LeRobot en Python. No se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de difusion bimanual desacopladas). La informacion proporcionada no incluye referencias a otros checkpoints similares.

## Limitaciones y advertencias

- Tasa de exito baja: solo un 11% de exito en la tarea de insercion, lo que indica que la politica no es robusta para uso en produccion.
- Modelo de investigacion: es un checkpoint de un fork personalizado de LeRobot, no una version estable ni soportada oficialmente.
- Licencia no disponible: no se especifican terminos de uso, lo que limita su aplicacion comercial sin consulta legal.
- Dependencia del entorno: los resultados pueden variar con versiones de entorno y dependencias, como se indica en la model card.
- Sin soporte de idiomas ni procesamiento de lenguaje: es un modelo de control, no apto para tareas de texto.
- Sin cuantizacion publicada: no se ofrecen versiones cuantizadas, lo que puede limitar su despliegue en hardware restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masondx/decoupled-diffusion-aloha-insertion-local-state-20k-bs32
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Repositorio de LeRobot: https://huggingface.co/lerobot (referencia general)
