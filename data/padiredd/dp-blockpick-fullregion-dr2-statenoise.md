# padiredd/dp-blockpick-fullregion-dr2-statenoise

## Resumen

dp-blockpick-fullregion-dr2-statenoise es una política de difusión (diffusion policy) entrenada con LeRobot sobre el robot humanoide ROBOTIS FFW SG2 para ejecutar una tarea de pick-and-place: recoger un bloque verde lima de 5x5x4 cm con el brazo izquierdo en una región de mesa de 1.154 cm². El modelo lo publica el usuario padiredd y está pensado como checkpoint de referencia para experimentos de manipulación robótica en simulación (Isaac Lab), no como un modelo de lenguaje.

Arquitectónicamente es una política de difusión con backbone ResNet18 por cámara, 287,5 millones de parámetros y salida de 16 objetivos articulares a 15 Hz. Consume tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240x240 píxeles más un vector de estado articular de 22 dimensiones, y genera acciones mediante DDPM con 100 pasos de difusión, horizonte de predicción de 64 pasos y 32 ejecutados.

Su interés radica en el nivel de aleatorización aplicado durante el entrenamiento (dr2: poses iniciales, iluminación, altura de mesa, ruido en el estado articular), lo que lo convierte en un caso útil para estudiar robustez de políticas visuomotoras en simulación antes de transferir a hardware real. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por camara y cabeza de acciones; implementacion LeRobot (fork lerobot-cyclo de ROBOTIS) |
| Parametros totales | 287.533.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de robotica; la tarea se define con la cadena "pick up the lime green block with the left arm") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |
| Entradas | 3 camaras 240x240 (cabeza, muneca izquierda, muneca derecha) + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Pasos de difusion | 100 (DDPM) |
| Checkpoints | paso 100k en la raiz; pasos 10k a 90k en subcarpetas (cada 10k) |
| Tamano del repo | 11,5 GB |

## Arquitectura y entrenamiento

La política sigue el esquema estándar de diffusion policy: un encoder visual ResNet18 independiente por cada una de las tres cámaras (240x240), concatenación de las representaciones visuales con el vector de estado articular de 22 dimensiones, y un proceso DDPM de 100 pasos que genera una secuencia de 16 objetivos articulares. El horizonte de predicción es de 64 pasos con 32 ejecutados antes de replanificar, con n_obs_steps = 1. El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam a 1e-4 con decaimiento coseno, semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB a 4-5,7 pasos/s.

El dataset de entrenamiento es `padiredd/pick-cube-topdown-region10k-full-dr2-3cam`: 11.710 demostraciones simuladas en Isaac Lab con el ROBOTIS FFW SG2, 1.984.945 frames en total, cubriendo toda la región alcanzable de la mesa (1.154 cm²). La aleatorización dr2 incluye pose inicial ±2 grados, apertura/cierre del gripper por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación de timing de demostración y altura de mesa entre -2 y +2 cm. Además se aplica aumentación de imagen agresiva (hasta 5 transformaciones aleatorias de brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) y ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado (`state_noise_std` en config.json, campo del parche lerobot-cyclo, solo para entrenamiento).

## Capacidades

- Generación de trayectorias de manipulación para pick-and-place cenital con el brazo izquierdo del FFW SG2.
- Percepción visomotora con tres cámaras simultáneas (cabeza y ambas muñecas) a 240x240.
- Generalización a posiciones del bloque en toda la región alcanzable de la mesa (1.154 cm²), no solo a una posición fija.
- Robustez a variaciones de iluminación, altura de mesa, pose inicial y ruido en el estado articular gracias a la aleatorización dr2.
- Control a 15 Hz con replanificación cada 32 pasos ejecutados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política motora, no un modelo generativo de texto.

## Casos de uso

- Investigación en diffusion policies: servir como checkpoint de referencia (paso 100k) para comparar variantes de aumentación, ruido de estado o recetas de entrenamiento en el mismo entorno Isaac Lab.
- Estudio de robustez a aleatorización: los checkpoints intermedios cada 10k pasos permiten trazar curvas de aprendizaje y evaluar el efecto de dr2 sobre la tasa de éxito.
- Preentrenamiento para transferencia sim-to-real: la cobertura de toda la región de la mesa y el ruido de estado facilitan el ajuste fino sobre el robot físico con pocas demostraciones reales.
- Benchmark interno de manipulación: usar la tarea "pick up the lime green block with the left arm" como tarea canónica para medir políticas candidatas en el mismo setup de tres cámaras.
- Docencia en robótica: ejemplo completo de pipeline LeRobot + Isaac Lab, desde la recolección de datos simulados hasta el despliegue de una política de difusión.
- Base para experimentos de aumentación visual: el modelo incorpora una receta de aumentación documentada que puede replicarse o ablacionarse en otros dominios de pick-and-place.
- Integración en pipelines de evaluación automatizada: al cargarse con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-fullregion-dr2-statenoise")`, se puede insertar en scripts de evaluación por lotes en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. El único dato de rendimiento disponible es el de entrenamiento: 4-5,7 pasos/s en una RTX A5000 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,15 GB, y en fp16/bf16 unos 0,58 GB, a lo que hay que sumar las activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos.
- GPU recomendadas: RTX A5000 24 GB es la hardware usada en entrenamiento; para inferencia debería ser suficiente una GPU consumer con 8 GB o más, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), sin datos de latencia confirmados.
- Opciones de despliegue: LeRobot (fork lerobot-cyclo de ROBOTIS) mediante `DiffusionPolicy.from_pretrained`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robotica.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se midieron 4-5,7 pasos/s en RTX A5000.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-fullregion-dr2-statenoise | 287,5 M | 3 camaras 240x240 + estado 22 dim | horizonte 64, 32 ejecutados | other | HuggingFace (padiredd) |
| Otras diffusion policies LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot: solo recoge un bloque verde lima de 5x5x4 cm con el brazo izquierdo del FFW SG2; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab); el rendimiento en el robot físico no está documentado y puede degradarse por la brecha sim-to-real.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de benchmark que permitan validar el checkpoint.
- Licencia "other": es necesario consultar los términos del autor antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- El campo `state_noise_std` de config.json es un parche propio del fork lerobot-cyclo; para cargar con lerobot-cyclo estándar hay que eliminarlo, ya que solo afecta al entrenamiento.
- Riesgo de sobreajuste a la distribución de simulacion: iluminación, texturas y dinámica del mundo real pueden diferir sustancialmente de las condiciones dr2.
- No es un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones; la tarea se especifica mediante una cadena fija.
- El repositorio ocupa 11,5 GB por incluir diez checkpoints intermedios, lo que puede ser relevante para el almacenamiento y la descarga.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-blockpick-fullregion-dr2-statenoise
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-full-dr2-3cam
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (simulador): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la informacion proporcionada
