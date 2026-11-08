# kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo

## Resumen

`connectailab-rl-kiwi-v2-Walker2d-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `Walker2d-v5` de MuJoCo. El objetivo del entorno es que un robot bípedo de dos dimensiones aprenda a desplazarse hacia delante controlando los pares (torques) de sus seis articulaciones. El modelo lo publica el usuario `kiwi2030` dentro de las actividades de CONNECT AI LAB, un laboratorio de experimentación en aprendizaje por refuerzo con sede en Corea del Sur.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un checkpoint de política neuronal de pequeña escala (perceptrón de dos capas ocultas de 64 unidades con activación Tanh) que mapea un vector de observación de 17 dimensiones a un vector de acción de 6 dimensiones. Su interés es, por tanto, didáctico y experimental: documenta de forma muy detallada la configuración de entrenamiento, la metodología de evaluación con semillas separadas y un diagnóstico biomecánico del comportamiento aprendido.

La relevancia de esta versión (v2) frente a la v1 radica en una mejora medible del rendimiento y, sobre todo, de la estabilidad: el autor reporta un incremento del retorno medio en 200 episodios de evaluación (de 5.112,89 a 5.351,40) y una reducción drástica de la desviación estándar (de 68,60 a 11,98). El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta y el repositorio figura con un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el conteo de tamaño no está actualizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con dos capas ocultas de 64 unidades y activación Tanh, política PPO de Stable-Baselines3 |
| Parametros totales | no disponible (estimable en el orden de ~10^4 a partir de la topología 17→64→64→6, no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 17 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el modelo es de tamaño reducido y no las requiere) |
| Idiomas soportados | no aplica (modelo de control, sin entrada ni salida en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información proporcionada; se menciona Stable-Baselines3 y ficheros auxiliares de normalización (`requirements.txt`, `run_model.py`) |
| Entorno | `Walker2d-v5` (MuJoCo) |
| Dimensiones de observación / acción | 17 / 6 (pares articulares) |
| Algoritmo | PPO (`stable-baselines3`) |
| Pasos de entrenamiento | 1.007.616 (objetivo 1.000.000) |
| Semilla de entrenamiento | 0 |

## Arquitectura y entrenamiento

La política es una red neuronal feedforward totalmente conectada con dos capas ocultas de 64 neuronas y activación Tanh, la configuración por defecto de la política `MlpPolicy` de Stable-Baselines3 para PPO. Recibe las 17 componentes del estado del `Walker2d-v5` (posición y velocidad del torso, ángulos y velocidades angulares de las seis articulaciones, y contacto del pie) y emite seis valores de par articular. Se aplicó normalización de observaciones y de recompensas durante el entrenamiento, con estadísticas congeladas en el momento de la evaluación para medir la recompensa original del entorno.

La configuración de entrenamiento documentada es la siguiente: tasa de aprendizaje 4·10⁻⁴ (frente a 3·10⁻⁴ en la v1), coeficiente de bonificación por exploración (`ent_coef`) de 0,001 (frente a 0,0 en la v1), 8 entornos en paralelo con 1.024 pasos recolectados por entorno, tamaño de minibatch 256, 10 épocas de optimización por actualización, factor de descuento γ = 0,99, λ de GAE = 0,95 y recorte de PPO de 0,2. El entrenamiento se ejecutó con semilla 0 y un total de 1.007.616 pasos. No se documenta el uso de RLHF, DPO ni ninguna técnica de ajuste posterior; es entrenamiento puro de RL sobre recompensa del simulador.

La innovación metodológica destacable no está en la arquitectura, sino en la evaluación: el autor evalúa con 200 semillas independientes (1000000–1000199) en modo determinista, reporta desviación estándar del retorno, distancia recorrida, longitud de episodio y tasa de alcance del límite de 1.000 pasos, y añade un diagnóstico biomecánico separado (porcentaje de tiempo sin apoyo en el suelo, inclinación media del torso, duración media de la fase aérea). Este último concluye honestamente que la política aprendida se parece más a correr o saltar que a caminar, porque la recompensa por defecto no penaliza explícitamente la forma de la marcha.

## Capacidades

- Control continuo de un robot bípedo bidimensional en el simulador MuJoCo `Walker2d-v5`: genera pares articulares de 6 dimensiones a partir de observaciones de 17 dimensiones.
- Locomoción hacia delante sostenida: alcanza el límite de 1.000 pasos en el 100 % de los episodios de evaluación (200/200) con una distancia media de 34,83 m.
- Política determinista reproducible: evaluación con acciones deterministas y semillas fijas, con estadísticas de normalización congeladas.
- Estabilidad de retorno alta: desviación estándar de 11,98 sobre una media de 5.351,40 en 200 episodios.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües: es exclusivamente una política de control.
- No dispone de modo "thinking" ni de generación de texto de ningún tipo.

## Casos de uso

- Docencia y aprendizaje de RL: el repositorio incluye la configuración completa de PPO y un script `run_model.py`, lo que lo convierte en un ejemplo reproducible para enseñar entrenamiento con Stable-Baselines3 y evaluar políticas con semillas separadas.
- Reproducción de experimentos de control continuo: sirve como línea base para comparar variantes de hiperparámetros (tasa de aprendizaje, `ent_coef`, número de entornos) sobre `Walker2d-v5`, ya que el autor publica la comparación v1/v2 con métricas idénticas.
- Estudio de estabilidad de políticas: la reducción de la desviación estándar del retorno de 68,60 a 11,98 entre versiones permite analizar cómo la bonificación por exploración afecta a la consistencia del comportamiento aprendido.
- Investigación sobre forma de la marcha: el diagnóstico biomecánico incluido (55,2 % de tiempo sin apoyo, inclinación media del torso de 17,0°) es un punto de partida para diseñar funciones de recompensa que penalicen el salto y favorezcan una marcha natural.
- Pruebas de pipelines de simulación a vídeo: el autor documenta la generación de un vídeo 2D proyectando la geometría de MuJoCo en el plano x-z para evitar fallos del renderizador OpenGL en Google Colab, técnica reutilizable en entornos sin GPU gráfica.
- Integración en entornos de investigación con Gymnasium/MuJoCo: puede cargarse como política congelada dentro de un bucle de simulación para pruebas de robustez frente a perturbaciones, siempre que se respete la normalización de observaciones.
- Referencia para experimentos de RL aplicado a decisiones de negocio: el mismo autor mantiene otros modelos de la familia (Connect Tycoon, LunarLander, LINK-01) que emplean PPO y DQN, por lo que este checkpoint puede servir de comparación entre dominios de control físico y de decisión.

## Benchmarks y rendimiento

Evaluación del autor con 200 episodios (semillas 1000000–1000199, acciones deterministas):

| Métrica | v1 | v2 |
|---|---:|---:|
| Retorno medio | 5.112,89 | 5.351,40 |
| Desviación estándar del retorno | 68,60 | 11,98 |
| Distancia media recorrida | 32,93 m | 34,83 m |
| Longitud media de episodio | 1.000,00 pasos | 1.000,00 pasos |
| Tasa de alcance de 1.000 pasos | 100,00 % | 100,00 % |
| Tasa de tiempo sin apoyo en el suelo | 59,328 % | 55,228 % |
| Inclinación media del torso | 23,830° | 17,036° |
| Desviación estándar de la inclinación | 8,811° | 8,873° |
| Duración media de fase aérea | 0,151 s | 0,124 s |

Diagnóstico biomecánico medido en 20 episodios (semillas 1000000–1000019), excluyendo los primeros 100 pasos y considerando contacto cuando la fuerza normal pie-suelo supera 0,001 N. No se han publicado comparaciones con otras políticas de referencia (por ejemplo, implementaciones de PPO de la literatura o del propio entorno) en la información disponible, por lo que no es posible situar estos valores frente a un estado del arte externo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red tiene dos capas ocultas de 64 unidades y una entrada de 17 dimensiones, por lo que los pesos ocupan del orden de kilobytes.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna ejecuta la inferencia en tiempo real. Una GPU consumer (GTX 1650, RTX 3060 o superior) solo aporta ventaja si se paralelizan muchos entornos simultáneos.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU (por ejemplo, Google Colab en modo CPU).
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) sobre Python con `gymnasium` y `mujoco`; el repositorio incluye `requirements.txt` y `run_model.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; el coste dominante en la práctica es la simulación física de MuJoCo, no la inferencia de la red.
- Requisito operativo crítico: deben cargarse conjuntamente los pesos y el fichero de estadísticas de normalización; usar solo los pesos produce resultados incorrectos.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Retorno medio | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| connectailab-rl-kiwi-v2-Walker2d-ppo | Política MLP | Walker2d-v5 | PPO | 5.351,40 (200 episodios) | no disponible | Hugging Face |
| connectailab-rl-kiwi-v2 (v1 de este autor) | Política MLP | Walker2d-v5 | PPO | 5.112,89 (200 episodios) | no disponible | Hugging Face |
| connectailab-rl-kiwi-v3-lunarlander | Política DQN | LunarLander | DQN | no disponible | no disponible | Hugging Face |
| connectailab-rl-kiwi-v1-link01 | Política PPO | LINK-01 | PPO | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de políticas de referencia externas (por ejemplo, las publicadas en la documentación de Gymnasium o en artículos sobre PPO en MuJoCo) en la información proporcionada, por lo que la comparación con el estado del arte queda como no disponible.

## Limitaciones y advertencias

- Sesgos: no aplica en el sentido habitual de sesgos sociales, pero la política está sobreajustada a la dinámica exacta de `Walker2d-v5`; no se ha evaluado su robustez frente a cambios de masa, fricción, retardo de actuación o ruido en las observaciones.
- Alucinación: no aplica (no genera texto), pero sí existe el riesgo de comportamiento fuera de distribución si las observaciones se salen del rango visto en entrenamiento.
- Forma de la marcha: el propio autor advierte que la política se parece más a correr o saltar que a caminar (55,2 % del tiempo sin apoyo en el suelo, fase aérea media de 0,124 s, inclinación media del torso de 17,0°). No debe presentarse como un controlador de marcha natural.
- Generalización limitada: los resultados corresponden a una única semilla de entrenamiento (semilla 0); no se reportan intervalos de confianza entre semillas de entrenamiento, solo entre semillas de evaluación.
- Licencia: no disponible. Antes de cualquier uso comercial es imprescindible contactar con el autor, ya que no se declara una licencia permisiva.
- Idiomas: no aplica; el modelo no procesa ni produce lenguaje natural.
- Repositorio: 0 descargas, 0 likes y tamaño reportado de 0,0 GB; conviene verificar que los ficheros de pesos y de normalización están realmente accesibles antes de integrarlo en un pipeline.
- Dependencia de la simulación: el modelo no ha sido validado en hardware físico; su transferencia a un robot real requeriría un trabajo de sim-to-real no documentado.
- Documentación mayoritariamente en coreano: la model card está redactada en coreano, lo que puede dificultar la revisión por parte de equipos no familiarizados con el idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo
- Modelo previo del mismo autor (v1, Walker2d): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo Connect Tycoon · kiwi v2 (Qwen, GRPO, decisión): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo Connect Tycoon · teacher v2 (PPO, decisión): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Modelo LunarLander · kiwi v3 (DQN): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo LINK-01 · kiwi v1 (PPO): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
- Ficheros auxiliares citados en la model card: `requirements.txt`, `run_model.py`, `connectailab-rl-kiwi-v2-Walker2d-ppo.evaluation.json`, `connectailab-rl-kiwi-v2-Walker2d-ppo.replay.mp4` (dentro del repositorio de Hugging Face)
