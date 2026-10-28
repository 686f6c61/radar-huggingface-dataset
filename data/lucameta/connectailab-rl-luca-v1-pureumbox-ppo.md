# lucameta/connectailab-rl-luca-v1-pureumbox-ppo

## Resumen

`connectailab-rl-luca-v1-pureumbox-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Stable-Baselines3) para una tarea de control continuo en MuJoCo 3 + Gymnasium: un personaje con forma de gato, llamado Pureum-i (푸름이), debe entrar en una caja con paredes de 12 cm de altura, lo que exige aproximarse corriendo y saltar. Lo publica el autor bajo el seudónimo lucameta (Metalluca), un artista procedente del NFT y el arte físico que documenta el proyecto como su primera incursión en RL, dentro de la iniciativa CONNECT AI LAB.

No es un modelo de lenguaje: no hay parámetros en el sentido habitual ni ventana de contexto, sino una política que mapea un vector de observación de 11 dimensiones a tres acciones continuas (avanzar/retroceder, girar y saltar). El interés del artefacto es doble: por un lado, sirve como ejemplo mínimo y reproducible de *reward shaping* con recompensa principal escasa (+100 al aterrizar dentro de la caja) y de aparición emergente de una conducta compuesta (correr y saltar) a partir de 250 000 pasos; por otro, incluye el entorno completo (`pureum_env.py`), lo que permite reproducir el entrenamiento íntegro en CPU en unos 7 minutos.

El autor reporta una tasa de éxito del 100 % (50/50) en episodios no vistos, con un tiempo medio de 1,3 segundos hasta entrar en la caja. El repositorio es de tamaño mínimo (0,0 GB según HuggingFace, prácticamente el checkpoint `model.zip` y los recursos visuales), la licencia es Apache 2.0 y la documentación está únicamente en coreano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL con política PPO (Stable-Baselines3); topología concreta de la red de política no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 11 dimensiones por paso, sin memoria recurrente declarada |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | coreano (documentación y nombre del personaje); el agente no procesa lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.zip` (checkpoint de Stable-Baselines3 sobre PyTorch) |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Entorno | `PureumBoxEnv` en `pureum_env.py` (MuJoCo 3 + Gymnasium, simulador propio) |
| Espacio de observación | 11 valores continuos: posición de la caja (frontal/lateral), distancia, orientación (cos y sin), velocidades frontal, lateral y vertical, altura, contacto con el suelo y flag de interior de la caja |
| Espacio de acción | 3 acciones continuas en [-1, 1]: empuje frontal/lateral, giro y salto |
| Función de recompensa | +100 al aterrizar dentro de la caja, bonus creciente por acercarse, −0,01 por paso de tiempo, −0,05 por saltar |

## Arquitectura y entrenamiento

El agente se entrena con PPO de Stable-Baselines3 sobre un entorno propio de control continuo construido con MuJoCo 3 y la API Gymnasium. La configuración declarada es: 1,5 millones de pasos, 8 entornos en paralelo, `n_steps` 1024, tamaño de batch 512, factor de descuento γ = 0,99, tasa de aprendizaje 3e-4 y coeficiente de entropía 0,005, con un coste total de aproximadamente 7 minutos en CPU. La model card no especifica el número de capas ni de unidades de la red de política, ni el volumen exacto de transiciones recolectadas más allá de los 1,5 millones de pasos.

El diseño de recompensa es el elemento técnico central: la señal principal es escasa y binaria (+100 al aterrizar dentro), y se complementa con un término de progreso proporcional al acercamiento, una penalización temporal de −0,01 por paso y una penalización de −0,05 por saltar, que evita que el agente salte de forma indiscriminada. La tabla de progresión publicada muestra el efecto de esta mezcla: 0 entradas en 20 episodios en el primer intento y a los 200 000 pasos, 14 de 20 a los 250 000 (momento en que se descubre el salto) y 20 de 20 a los 1,5 millones. La política es puramente reactiva sobre el vector de estado; no se documenta uso de memoria recurrente, *frame stacking* ni *curriculum* explícito.

En el apartado visual, el personaje 3D se genera a partir de un dibujo del autor con TRELLIS y se retoca en Blender (`figure/make_figure.py`); los bigotes finos se eliminaron del dibujo con FLUX.1 Kontext porque TRELLIS los colapsaba, y se añadieron después por separado. La malla es solo estética: la colisión y el peso corresponden a un cuerpo elipsoidal, de modo que el aspecto del personaje no altera la física ni la política aprendida.

## Capacidades

- Control continuo de un cuerpo con tres grados de libertad efectivos (avance/retroceso, giro, salto) en un simulador MuJoCo.
- Navegación hacia un objetivo cuya posición relativa se percibe parcialmente: la observación incluye si la caja está delante o al lado, la distancia, la orientación (cos y sin) y la altura.
- Conducta compuesta emergente de aproximación, alineación y salto para superar un obstáculo de 12 cm que no puede atravesarse caminando.
- Inferencia determinista (`model.predict(obs, deterministic=True)`) adecuada para evaluación reproducible.
- Generalización a episodios no vistos: 50/50 éxitos en las primeras 50 partidas de evaluación reportadas, con tiempo medio de 1,3 s.
- Renderizado opcional en modo `rgb_array` para generar vídeo o GIF del episodio.
- No soporta *tool calling*, function calling, razonamiento multi-paso simbólico, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Docencia y divulgación de RL: el par entorno + checkpoint + hiperparámetros permite reproducir en unos 7 minutos de CPU un caso completo de PPO con recompensa escasa, incluida la curva de aprendizaje publicada, lo que lo hace utilizable en talleres y clases sin infraestructura GPU.
- Prototipado de entornos MuJoCo propios: `pureum_env.py` sirve como plantilla funcional de `PureumBoxEnv` con observaciones relativas al objetivo, recompensa por etapas y flag de éxito en `info`, reutilizable para otros personajes u obstáculos.
- Estudio de *reward shaping*: la combinación de +100 por éxito, bonus de proximidad, −0,01 por paso y −0,05 por salto constituye un caso controlado para medir cómo varía la política al reajustar los pesos de cada término.
- Pruebas de humo (smoke tests) en pipelines de RL: al ser un checkpoint pequeño con dependencias acotadas (Stable-Baselines3, MuJoCo 3, Gymnasium), sirve para verificar versiones y compatibilidad en integración continua antes de lanzar entrenamientos largos.
- Referencia para investigación en sim-to-real y control de personajes: la separación explícita entre malla visual y cuerpo físico (elipsoide sin colisión de la malla) es un patrón trasladable a prototipos de animación o videojuego donde el aspecto no debe afectar a la dinámica.
- Generación de material audiovisual: el modo de renderizado `rgb_array` permite exportar repeticiones (el repositorio incluye `replay.gif` y `replay.mp4`) para demostraciones, portafolios de arte generativo o vídeos explicativos.
- Punto de partida para *fine-tuning* o reentrenamiento: al estar liberado el entorno y la configuración de PPO, es viable reentrenar con otra geometría de caja, otro personaje o recompensas alternativas y comparar contra este checkpoint como línea base.

## Benchmarks y rendimiento

La model card no incluye resultados sobre suites estándar (MuJoCo Gym, Atari, etc.), por lo que no es posible comparar con referencias externas. Los datos publicados son métricas de la tarea propia:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de exito | 100 % (50/50) | Primeras 50 partidas no vistas, política determinista |
| Tiempo medio hasta entrar en la caja | 1,3 s | Por episodio exitoso |
| Exitos en 20 episodios, primer intento | 0/20 | Politica inicial |
| Exitos en 20 episodios, 200 000 pasos | 0/20 | Se aproxima a la caja pero solo empuja la pared |
| Exitos en 20 episodios, 250 000 pasos | 14/20 | Se descubre la conducta de salto |
| Exitos en 20 episodios, 1 500 000 pasos | 20/20 | Politica final |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; la política se ejecuta en CPU (`PPO.load(..., device="cpu")` en el ejemplo del autor).
- Entrenamiento completo: aproximadamente 7 minutos en CPU con la configuración declarada (1,5 millones de pasos, 8 entornos en paralelo). No se especifica el modelo de CPU empleado.
- GPU recomendadas: no aplica; cualquier GPU compatible con PyTorch serviría para acelerar el entrenamiento, pero no se documenta ningún requisito ni ganancia medida.
- Compatibilidad con GPU de consumo: irrelevante por tamaño; el checkpoint es un `model.zip` de un repositorio de 0,0 GB.
- Dependencias de despliegue: `stable-baselines3`, `mujoco` (versión 3), `gymnasium`, `huggingface_hub` para `snapshot_download`, y `requirements.txt` incluido en el repositorio. El renderizado `rgb_array` requiere un contexto gráfico (OpenGL/EGL) disponible en el sistema.
- Opciones de despliegue: bucle de inferencia con `model.predict` de Stable-Baselines3; no se documenta exportación a ONNX ni TorchScript. vLLM, llama.cpp, TGI u Ollama no aplican a este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se conocen alternativas directamente equivalentes (mismo entorno o misma tarea). La comparación más cercana son otros modelos de la misma iniciativa CONNECT AI LAB encontrados en la búsqueda web, con naturaleza distinta:

| Modelo | Tipo | Parametros | Contexto | Formato de pesos | Licencia | Notas |
|---|---|---|---|---|---|---|
| `lucameta/connectailab-rl-luca-v1-pureumbox-ppo` (este) | PPO sobre MuJoCo/Gymnasium, control continuo | no disponible | no aplica (observación de 11 dimensiones) | `model.zip` (SB3) | Apache 2.0 | Tarea única: entrar en una caja; 100 % de éxito reportado en 50 episodios |
| `lucyhome/connectailab-rl-lucy-v1-teacher` | RL con PPO, etiquetas de toma de decisiones y "prefrontal-cortex", estilo JEV | no disponible | no disponible | no disponible | Apache 2.0 | Misma iniciativa; dominio y métricas no verificables con la información disponible |
| `attitudemetal/connectailab-rl-aion-v1` | RL con GRPO y LoRA/PEFT sobre una base Qwen3.5 | no disponible (adaptador LoRA) | no disponible | safetensors + PEFT | Apache 2.0 | Enfoque híbrido LLM + RL; no comparable en tarea ni en espacio de acciones |

Frente a agentes PPO de referencia en MuJoCo (por ejemplo, las tareas estándar de Gymnasium), este modelo no publica resultados en esos entornos, de modo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de tarea única y altamente especializado: la política solo resuelve "entrar en la caja" en un simulador concreto; no generaliza a otras geometrías, alturas de pared ni dinámicas del cuerpo sin reentrenamiento.
- Entorno propio no validado externamente: `PureumBoxEnv` no forma parte de ninguna suite estándar y no se han publicado pruebas de reproducibilidad independientes; la tasa de éxito del 100 % procede únicamente del autor y sobre 50 episodios.
- Sin datos de sim-to-real: no hay evidencia de que la conducta transferida a un robot o a un motor físico distinto mantenga el rendimiento.
- Métricas con muestra pequeña: la evaluación se basa en 50 episodios (y 20 por checkpoint en la curva de aprendizaje), sin intervalos de confianza ni semillas detalladas.
- Idiomas: la documentación está solo en coreano; no hay versión en inglés ni en castellano, lo que limita la revisión por parte de terceros.
- Sesgos conocidos: no se documentan sesgos de datos en el sentido habitual (no hay corpus de entrenamiento lingüístico); el posible sesgo procede del diseño de la recompensa, que puede favorecer conductas explotadoras como saltar de forma redundante si se modifican los pesos.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar las licencias de las dependencias (MuJoCo, Stable-Baselines3) y de las herramientas citadas para los recursos visuales (TRELLIS, FLUX.1 Kontext), cuyos términos no se detallan en la model card.
- Madurez del artefacto: 0 descargas y 0 *likes* en el momento de la consulta, repositorio creado y actualizado el 28 de octubre de 2026, sin paper, blog técnico ni discusión asociada; debe tratarse como una demostración reproducible más que como un componente listo para producción.
- En producción: al no haber exportación documentada a ONNX/TorchScript ni pruebas de latencia, la integración requeriría trabajo adicional de empaquetado y verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucameta/connectailab-rl-luca-v1-pureumbox-ppo
- Espacio de TRELLIS utilizado para generar el personaje 3D: https://huggingface.co/spaces/trellis-community/TRELLIS
- Modelo relacionado de la misma iniciativa: https://huggingface.co/lucyhome/connectailab-rl-lucy-v1-teacher
- Modelo relacionado de la misma iniciativa: https://huggingface.co/attitudemetal/connectailab-rl-aion-v1
- Paper, blog o repositorio independiente del proyecto: no disponible en la información proporcionada.
