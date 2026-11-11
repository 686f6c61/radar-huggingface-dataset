# humanoid-benchmark/psi0

## Resumen

Psi-Zero (Psi0 action expert) es un conjunto de checkpoints de un modelo de política para robótica humanoide entrenado mediante aprendizaje por imitación con flow matching. Lo publica la organización `humanoid-benchmark` en Hugging Face y está diseñado específicamente para ejecutar tareas manipulativas sobre el benchmark homónimo, con robots Unitree G1 y H2 con manos Sharpa. El repositorio contiene cinco tareas distintas, cada una con dos checkpoints (época 10 y 20), y se distribuye como pesos en formato safetensors junto con el código adaptador de entrenamiento e inferencia.

El modelo resuelve el problema de generar acciones motoras de alta frecuencia a partir de observaciones proprioceptivas y visuales en robots humanoides, un dominio donde las políticas de imitación necesitan manejar espacios de acción de dimensión alta (44-D para G1, 78-D para H2) y datos de demostración escasos (100 demostraciones por tarea). La relevancia actual radica en que aplica flow matching —una alternativa a las políticas de difusión— a tareas de manipulación realistas y publica checkpoints autocontenidos listos para evaluación y despliegue.

El entrenamiento se realizó en 4 nodos con 8 GPUs cada uno durante 20 épocas, con aumentación de datos online según la especificación v2 del Humanoid Benchmark. No se dispone de información sobre el tamaño del modelo en parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de robótica y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action expert con flow matching (política de imitación para robótica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tareas incluidas | 5 (b6-pedal-bin, a3-fridge-open, a7-cabinet-close, a18-pour-water, a10-trolley-push) |
| Robots | Unitree G1, H2 (con manos Sharpa) |
| Dimension de estado G1 | 44-D (29 articulaciones del cuerpo + 6 + 6 valores de mano medidos + 3 gravedad proyectada) |
| Dimension de estado H2 | 78-D (75 ángulos articulares + 3 gravedad proyectada) |
| Velocidades articulares | no incluidas en la entrada |
| Epocas de entrenamiento | 20 (checkpoints en época 10 y 20) |
| Demostraciones por tarea | 100 |
| Hardware de entrenamiento | 4 nodos x 8 GPUs |
| Tamano del repositorio | 112.2 GB |

## Arquitectura y entrenamiento

Psi-Zero es un "action expert" entrenado con flow matching, una técnica generativa que modela la distribución de acciones mediante un campo de flujo continuo en lugar de la difusión iterativa clásica. La política recibe como entrada el estado proprioceptivo del robot (44-D para Unitree G1, 78-D para H2) y produce acciones motoras; no se incluyen velocidades articulares en la entrada, lo que simplifica la observación. El modelo se entrena por imitación a partir de 100 demostraciones por tarea, un régimen de datos reducido que exige aumentación agresiva.

El entrenamiento se ejecutó en 4 nodos con 8 GPUs durante 20 épocas, con la especificación de aumentación de datos online v2 del Humanoid Benchmark y con la aumentación de imagen propia del modelo desactivada. Los checkpoints publicados (época 10 y 20) son autocontenidos: incluyen pesos, configuración, estadísticas de normalización y `protocol.json` para evaluación y despliegue, además de registros de entrenamiento (plan, logs, métricas) para reproducibilidad. No se incluye el estado de reanudación de optimizador, scheduler, RNG ni DeepSpeed. El repositorio también contiene el código adaptador usado para entrenamiento e inferencia.

## Capacidades

- Ejecución de políticas de manipulación humanoide en cinco tareas concretas: recoger un barril de chips y depositarlo en un cubo de pedal, abrir una puerta de frigorífico, cerrar una puerta de armario, verter agua de una jarra a un vaso y empujar un carrito.
- Generación de acciones motoras de dimensión alta (44-D para G1, 78-D para H2) a partir de estado proprioceptivo y gravedad proyectada.
- Aprendizaje por imitación con flow matching, adecuado para modelar distribuciones multimodales de acciones.
- Soporte para dos plataformas de robot: Unitree G1 y H2 con manos Sharpa.
- Checkpoints autocontenidos listos para evaluación y despliegue con estadísticas de normalización y protocolo incluidos.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo, al ser un modelo de robótica.

## Casos de uso

- Investigación en aprendizaje por imitación para humanoides: el modelo sirve como línea base reproducible para comparar nuevas políticas de flow matching sobre las cinco tareas del Humanoid Benchmark, con checkpoints en dos épocas para estudiar la evolución del entrenamiento.
- Manipulación de objetos con Unitree G1 en laboratorio: la tarea `b6-pedal-bin` permite evaluar la coordinación entre locomoción, manipulación y accionamiento de un pedal, un escenario representativo de tareas de recogida y depósito.
- Interacción con entornos domésticos: las tareas `a3-fridge-open` y `a7-cabinet-close` permiten probar políticas de apertura y cierre de puertas, útiles para validar control de contacto y fuerza en robots humanoides.
- Manipulación diestra con manos Sharpa: la tarea `a18-pour-water` sobre el robot H2 evalúa el vertido de líquidos, un caso exigente de coordinación fina y control de orientación con 75 articulaciones.
- Navegación y transporte con carrito: la tarea `a10-trolley-push` sirve para estudiar el empuje de objetos móviles con el G1, relevante en logística y asistencia.
- Despliegue en pipelines de evaluación estandarizados: al incluir `protocol.json` y estadísticas de normalización, los checkpoints pueden integrarse directamente en arneses de evaluación del benchmark sin reentrenamiento.
- Estudio de la aumentación de datos en robótica: al haberse entrenado con la especificación v2 de aumentación online y con la aumentación de imagen desactivada, el modelo permite analizar el impacto de estas decisiones en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño en parámetros no se especifica; el repositorio completo ocupa 112.2 GB, pero incluye pesos de cinco tareas, dos épocas cada una, código y registros, por lo que no equivale al tamaño de un checkpoint individual).
- GPU recomendadas: no disponibles de forma explícita; el entrenamiento usó 4 nodos x 8 GPUs, lo que sugiere GPUs de centro de datos (A100/H100), pero no se confirma el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible; no se puede determinar sin conocer el número de parámetros del action expert.
- Opciones de despliegue: el repositorio incluye código adaptador de entrenamiento e inferencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Psi-Zero (psi0) | Action expert con flow matching | no disponible | no aplica | 5 tareas de manipulación humanoide | no disponible | Hugging Face (humanoid-benchmark/psi0) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización extrema: cada checkpoint está entrenado para una única tarea y un robot concreto; no es un modelo generalista ni transferible sin reentrenamiento.
- Datos de entrenamiento limitados: solo 100 demostraciones por tarea, lo que puede provocar sobreajuste y baja robustez ante variaciones de entorno no cubiertas por la aumentación.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de robótica los riesgos se refieren a fallos físicos (colisiones, caídas de objetos) más que a sesgos sociales.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí riesgo de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables: el modelo no procesa lenguaje natural.
- Estado de reanudación incompleto: no se incluyen optimizador, scheduler, RNG ni DeepSpeed, lo que limita la reproducibilidad exacta del entrenamiento.
- Tamaño del repositorio elevado (112.2 GB): requiere espacio de almacenamiento considerable y una gestión cuidadosa de checkpoints por tarea y época.
- Sin resultados de benchmarks publicados: no es posible comparar su rendimiento con otras políticas de forma cuantitativa a partir de la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/psi0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
