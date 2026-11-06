# padiredd/dp-blockpick-cap1k-dr2

## Resumen

dp-blockpick-cap1k-dr2 es una política de difusión (diffusion policy) para robótica manipulativa desarrollada por el usuario padiredd y publicada en Hugging Face. Se trata de un modelo de 287,5 millones de parámetros entrenado con el framework LeRobot (en un fork específico de ROBOTIS) para ejecutar una tarea concreta: recoger un bloque de color verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas.

El modelo resuelve el problema de generar trayectorias de control de un brazo robótico a partir de observaciones visuales y de estado articular, mediante un esquema de difusión DDPM que produce secuencias de acciones multimodales. La relevancia actual radica en que ejemplifica el flujo de trabajo moderno de imitación en robótica: datos sintéticos generados en simulación (Isaac Lab) mediante programas "code-as-policy", entrenamiento con LeRobot y publicación de checkpoints intermedios para análisis de convergencia.

El repositorio incluye el checkpoint final (paso 100k) en la raíz y nueve checkpoints intermedios cada 10.000 pasos. No se han publicado resultados de evaluación en la información disponible, y la model card indica explícitamente que se añadirán cuando se ejecuten.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador visual ResNet18 por cámara y cabeza de difusión para acciones |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de predicción de 64 pasos, 32 ejecutados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica: un codificador visual ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha), cada una con entradas de 240x240 píxeles, combinado con un vector de estado articular de 22 dimensiones. La salida es una secuencia de 16 objetivos articulares a 15 Hz, generada mediante un proceso DDPM de 100 pasos de difusión con horizonte de predicción de 64 pasos y 32 pasos ejecutados, con n_obs_steps = 1.

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa de aprendizaje 1e-4 y scheduler cosine, semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB a aproximadamente 5,7 pasos por segundo. Los datos proceden del dataset `pick-cube-cap1k-retry-dr2-3cam` (no publicado aún en Hugging Face): 1.000 demostraciones exitosas en simulación con 196.577 fotogramas, generadas por un programa "code-as-policy" que sortea parámetros de agarre, aproximación y temporización por episodio, induce un 30 % de fallos de primer agarre seguidos de retirada y reagarre, y ejecuta únicamente empujes articulares con etiquetas limpias. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). Se aplica aumentación de imagen intensa en orden aleatorio (hasta 5 transformaciones entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises), sin ruido de estado.

## Capacidades

- Generación de trayectorias de control articular para un brazo robótico de 16 articulaciones a partir de observaciones visuales multicámara y estado articular.
- Percepción visual multimodal mediante tres cámaras (cabeza y dos muñecas) con codificadores ResNet18 independientes.
- Ejecución de una tarea de pick-and-place concreta: recogida de un bloque verde lima con el brazo izquierdo.
- Robustez parcial ante fallos de agarre, gracias a la inclusión de un 30 % de episodios con fallo inducido y reagarre en los datos de entrenamiento.
- Política de difusión multimodal: puede representar distribuciones de acción multimodales, útil cuando existen varias trayectorias válidas.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es un modelo puramente motor y perceptivo.

## Casos de uso

- Investigación en imitación robótica: servir como referencia reproducible de una diffusion policy entrenada con LeRobot sobre datos sintéticos, permitiendo estudiar la convergencia mediante los checkpoints cada 10.000 pasos.
- Benchmark de generación de datos sintéticos: evaluar cómo afecta el programa "code-as-policy" con fallos inducidos (30 %) a la robustez del agarre en simulación, comparando con políticas entrenadas sin esos episodios.
- Estudio de aumentación de imagen agresiva: analizar el impacto de hasta cinco transformaciones aleatorias por muestra en la generalización visual de políticas de difusión en robótica.
- Análisis de curvas de aprendizaje: los checkpoints intermedios permiten trazar la evolución de la pérdida y del éxito de la tarea a lo largo de 100.000 pasos, útil para calibrar presupuestos de entrenamiento.
- Base para fine-tuning en el robot FFW SG2 real: partir del checkpoint de 100k y ajustar con demostraciones reales para transferencia sim-a-real en tareas de pick-and-place.
- Docencia y divulgación: ejemplo completo y documentado de pipeline LeRobot + Isaac Lab + diffusion policy, con hiperparámetros, hardware y receta de datos explícitos.
- Reproducción de experimentos de robótica: replicar la receta region10k dr2 (pose inicial, pinza, focos, cámaras, altura de mesa) en entornos simulados equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- Entrenamiento realizado en una única NVIDIA RTX A5000 de 24 GB a ~5,7 pasos/s con batch 32; el checkpoint completo en safetensors ocupa 11,5 GB de repositorio (incluyendo los diez checkpoints).
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (287,5 M de parámetros) y los tres codificadores ResNet18, es razonable esperar un consumo moderado, pero no se ha publicado una cifra concreta.
- GPU recomendadas: RTX A5000 (usada en entrenamiento), y por tamaño, GPUs consumer de gama alta (RTX 3090, RTX 4090) deberían poder alojar el modelo en FP32/FP16, aunque no se confirma en la información disponible.
- Opciones de despliegue: el modelo se carga con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap1k-dr2")` dentro del ecosistema LeRobot (fork ROBOTIS lerobot-cyclo); no se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; solo se conoce el throughput de entrenamiento (~5,7 pasos/s en RTX A5000).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| dp-blockpick-cap1k-dr2 | 287,5 M | horizonte 64, 32 ejecutados, n_obs_steps 1 | other | Hugging Face (padiredd) |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | no disponible | Repositorio académico |
| Otras políticas LeRobot publicadas | no disponible | no disponible | no disponible | Hugging Face Hub |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a parámetros, horizonte y licencia.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea ("pick up the lime green block with the left arm") en un robot concreto (ROBOTIS FFW SG2 con pinza CAD y mesa de 29,25 pulgadas); no generaliza a otras tareas, objetos o morfologías sin fine-tuning.
- Entrenado exclusivamente en simulación (Isaac Lab); no hay evidencia publicada de transferencia al robot real ni de evaluación sim-a-real.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- Licencia "other": no se especifican los términos exactos; es necesario consultar al autor antes de cualquier uso comercial.
- El dataset de entrenamiento (`pick-cube-cap1k-retry-dr2-3cam`) no está publicado en Hugging Face, lo que dificulta la reproducibilidad completa.
- Riesgo de sobreajuste a las condiciones visuales de la receta region10k dr2 (iluminación con focos, pose inicial, altura de mesa); cambios en el entorno pueden degradar el rendimiento.
- Sin ruido de estado durante el entrenamiento: la política puede ser sensible a imprecisiones en la estimación del estado articular en despliegues reales.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni capacidades multilingües.
- El repositorio incluye diez checkpoints (11,5 GB), lo que requiere espacio de almacenamiento considerable si se descarga completo.

## Enlaces

- Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap1k-dr2
- LeRobot (framework): https://github.com/huggingface/lerobot
- Diffusion Policy (paper original de Chi et al.): https://arxiv.org/abs/2303.04137
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la información proporcionada
- Fork ROBOTIS lerobot-cyclo: no disponible enlace directo en la información proporcionada
