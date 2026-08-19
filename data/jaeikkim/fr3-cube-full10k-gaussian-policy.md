# jaeikkim/fr3-cube-full10k-gaussian-policy

## Resumen

El modelo `jaeikkim/fr3-cube-full10k-gaussian-policy` es un checkpoint de investigación orientado a robótica, concretamente a aprendizaje por imitación para manipulación visuomotora. Desarrollado por el autor jaeikkim, este modelo implementa una política gaussiana (gaussian policy) que genera acciones de control para un robot manipulador Franka (FR3) en una tarea de manipulación de cubos. El nombre "full10k" sugiere que fue entrenado con un conjunto de 10 000 demostraciones, y actúa como el modelo maestro (teacher) de tamaño completo, del cual se deriva una versión destilada llamada `fr3-cube-rgb-native320`.

El modelo está construido sobre PyTorch y se integra con el ecosistema LeRobot, una librería de Hugging Face para aprendizaje por imitación en robótica. Su propósito es resolver el problema de control de bajo nivel a partir de observaciones visuales (RGB) y posiblemente propioceptivas, generando acciones continuas modeladas como una distribución gaussiana. Es relevante porque representa un enfoque moderno de políticas visuomotoras para robots reales, con un tamaño de repositorio de 6,4 GB, lo que indica una red de dimensiones considerables. El acceso es restringido (gated), por lo que se requiere aceptar condiciones en Hugging Face para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer o MLP con salida gaussiana) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robot, no de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (probablemente .pt o .safetensors, no especificado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el nombre y el contexto, se trata de una política gaussiana, es decir, la salida es una distribución normal multivariante sobre las acciones del robot (posiciones, velocidades o pares). Este tipo de políticas se entrena típicamente con aprendizaje por imitación, maximizando la verosimilitud de las demostraciones humanas o teleoperadas. El sufijo "full10k" indica que se utilizaron 10 000 episodios de demostración para la tarea de manipulación de cubos con el robot Franka FR3. El modelo es descrito como "full-stack teacher", lo que sugiere que fue entrenado con observaciones completas (imagen RGB y estado del robot) y que sirve como base para destilar un modelo más ligero (`fr3-cube-rgb-native320`). No se especifican detalles sobre el dataset, el número de tokens (no aplica), ni si se usaron técnicas como RLHF o DPO, que son propias de modelos de lenguaje.

## Capacidades

- Generación de acciones de control continuo para un robot manipulador Franka FR3 en tareas de manipulación de cubos.
- Procesamiento de observaciones visuomotoras: entrada de imágenes RGB (probablemente a resolución nativa) y estado del robot (posición de articulaciones, velocidad, etc.).
- Salida modelada como distribución gaussiana, lo que permite muestrear acciones estocásticas durante la ejecución.
- Integración con LeRobot, lo que facilita su uso en pipelines de entrenamiento y despliegue de políticas robóticas.
- Capacidad de aprendizaje por imitación: el modelo reproduce comportamientos demostrados, no razonamiento simbólico ni generación de texto.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un robot Franka para apilar o reordenar cubos, una tarea clásica de evaluación en robótica. Se usaría cargando los pesos en un entorno LeRobot y conectando el modelo al robot real o simulado.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la destilación de políticas, ya que existe una versión destilada del mismo autor. Los investigadores pueden comparar el rendimiento del teacher frente al student.
- Desarrollo de políticas visuomotoras robustas: al estar entrenado con 10 000 demostraciones, puede servir como referencia para evaluar la cantidad de datos necesaria en tareas de manipulación.
- Benchmark de control de robots: la tarea de cubos con FR3 es un estándar en la comunidad; este modelo puede usarse como baseline en nuevos trabajos.
- Integración en sistemas de teleoperación asistida: el modelo puede generar acciones suaves y estocásticas, útiles para asistir a un operador humano en tiempo real.
- Educación en robótica: como ejemplo de política gaussiana entrenada con LeRobot, es un recurso didáctico para cursos de aprendizaje por refuerzo e imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, precisión de manipulación ni comparaciones con otros modelos en la página de Hugging Face ni en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 6,4 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente esa cantidad en memoria. Para inferencia, se necesita una GPU con al menos 8-12 GB de VRAM, dependiendo de la resolución de entrada y del lote.
- GPU recomendadas: una NVIDIA RTX 3080/4080 o superior, o una A100 para entrenamiento o inferencia con mayor velocidad.
- Es probable que quepa en GPUs de consumo como la RTX 3090 o RTX 4090, pero no se confirma.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con LeRobot, que soporta inferencia en tiempo real con robots reales. También podría usarse con frameworks como ROS, pero no hay documentación específica.
- Latencia y throughput: no disponibles. Dependerá de la resolución de imagen y de la complejidad de la red.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. El autor publica un modelo destilado (`fr3-cube-rgb-native320`) que es una versión reducida del teacher, pero no se ofrecen especificaciones numéricas. Otros modelos de política visuomotora como ACT (Action Chunking with Transformers) o Diffusion Policy son comunes en la literatura, pero no hay datos de rendimiento comparables en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere solicitar permiso al autor en Hugging Face. Esto puede limitar su uso en entornos comerciales o académicos sin aprobación.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide conocer si es usable en proyectos comerciales.
- Especialización limitada: el modelo está entrenado únicamente para la tarea de manipulación de cubos con el robot FR3. No es generalizable a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste: al ser un modelo de imitación, puede fallar ante variaciones en la iluminación, posición de la cámara o dinámica del robot no presentes en las demostraciones.
- Sin soporte de lenguaje: no procesa texto ni instrucciones, solo observaciones visuales y de estado.
- Sin documentación de seguridad: no se proporcionan advertencias sobre operación segura del robot, lo que es crítico en entornos físicos.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que puede indicar un error o un modelo experimental no validado públicamente.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/jaeikkim/fr3-cube-full10k-gaussian-policy)
- [Modelo destilado relacionado: fr3-cube-rgb-native320](https://huggingface.co/jaeikkim/fr3-cube-rgb-native320)
