# Breadkey/ppo-Huggy

## Resumen

`Breadkey/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. Lo publica el usuario Breadkey en Hugging Face y su proposito es servir como modelo entrenado del entorno Huggy, donde un perro virtual aprende a perseguir y atrapar un palo. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que produce acciones de control a partir de observaciones del entorno simulado.

El repositorio tiene un tamano de 0,2 GB y contiene los artefactos habituales de ML-Agents: pesos en formato `.nn` (serializados de Unity Barracuda) y probablemente `.onnx` para inferencia en navegador, ademas de ficheros de TensorBoard. La libreria declarada es `ml-agents` y el pipeline es `reinforcement-learning`.

Su relevancia es fundamentalmente didactica: forma parte del ecosistema de tutoriales de Hugging Face sobre deep RL con ML-Agents, y permite reproducir el entrenamiento o visualizar al agente jugando directamente en el navegador a traves del visor de la organizacion Unity en Hugging Face. No hay informacion publica sobre arquitectura de red, hiperparametros ni curvas de recompensa mas alla de los ficheros incluidos en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y valor para PPO (ML-Agents); capas y tamanos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (Unity ML-Agents) y `.onnx` (inferencia en navegador) |

## Arquitectura y entrenamiento

El modelo es un agente PPO entrenado con Unity ML-Agents. PPO es un algoritmo de gradiente de politica con recorte de la funcion objetivo (clipped surrogate objective) que combina una politica estocastica y una funcion de valor critic, entrenadas de forma conjunta sobre rollouts recolectados en multiples copias del entorno. En el caso de Huggy, el entorno es un escenario 3D donde un perro debe localizar y alcanzar un palo; las observaciones suelen incluir vector de estado y, segun configuracion, raycasts o camara, y las acciones son continuas de movimiento.

No se dispone de informacion sobre el numero de pasos de entrenamiento, la configuracion YAML usada, el numero de entornos paralelos, la composicion de las observaciones ni si se aplicaron tecnicas adicionales como recompensas por curiosidad, imitacion o curriculum learning. El repositorio incluye ficheros de TensorBoard, por lo que las curvas de recompensa y perdidas estan disponibles en el propio artefacto, pero no se han publicado resumidos en la model card. Tampoco se documenta ninguna innovacion tecnica destacable mas alla del uso estandar de PPO dentro de ML-Agents.

## Capacidades

- Control de un agente en el entorno Huggy de Unity ML-Agents mediante acciones continuas de movimiento.
- Inferencia en navegador a traves del visor de modelos de Unity en Hugging Face, usando el fichero `.onnx`.
- Reanudacion del entrenamiento con `mlagents-learn ... --resume` a partir del checkpoint incluido.
- Exportacion y uso en Unity con el paquete ML-Agents (Barracuda/Inference Engine) mediante el fichero `.nn`.
- Analisis de curvas de entrenamiento con TensorBoard a partir de los logs incluidos en el repo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision general ni capacidades multilingues.

## Casos de uso

- Reproduccion del tutorial de Huggy: cargar el modelo en el visor de Unity en Hugging Face y observar al perro persiguiendo el palo, util para verificar que el pipeline de ML-Agents funciona de extremo a extremo.
- Docencia de deep RL: usar el checkpoint como punto de partida para explicar PPO, comparar curvas de recompensa y discutir hiperparametros en un entorno visual e intuitivo.
- Fine-tuning o continuacion del entrenamiento: reanudar con `mlagents-learn --resume` para experimentar con cambios en recompensas, observaciones o hiperparametros y comparar contra la linea base.
- Integracion en proyectos Unity: incorporar el `.nn` en un proyecto de ML-Agents como agente no jugador (NPC) de demostracion en prototipos de videojuegos.
- Evaluacion de robustez del agente: ejecutar el modelo en variantes del entorno (posiciones iniciales del palo, obstaculos) para medir la generalizacion del comportamiento aprendido.
- Benchmark interno de infraestructura de RL: medir throughput de inferencia y latencia del `.onnx` en navegador o del `.nn` en Unity para comparar con otros agentes del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del repo (0,2 GB) y la naturaleza de ML-Agents, la inferencia cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA o incluso CPU es suficiente para inferencia de un agente Huggy.
- Cabe en GPU consumer: si, practicamente en cualquier modelo (GTX 1050 o superior), y en CPU para inferencia en navegador via ONNX Runtime / WebGL.
- Opciones de despliegue: Unity ML-Agents (Barracuda/Inference Engine) con el `.nn`, ONNX Runtime o el visor web de Unity en Hugging Face con el `.onnx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Breadkey/ppo-Huggy | Huggy (ML-Agents) | PPO | no disponible | no aplica | no disponible | Hugging Face |
| unity/ML-Agents Huggy oficiales | Huggy (ML-Agents) | PPO | no disponible | no aplica | no disponible | Hugging Face (org. unity) |
| Agentes PPO de otros entornos ML-Agents (p. ej. Pyramids, Walker) | Varios | PPO | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica con alternativas.

## Limitaciones y advertencias

- Modelo especifico del entorno Huggy: no es reutilizable fuera de ese escenario sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades conversacionales.
- No hay informacion sobre licencia, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- No se documentan sesgos, pero el comportamiento aprendido depende de la distribucion del entorno de entrenamiento y puede fallar ante variaciones no vistas.
- Riesgo de sobreajuste al escenario de entrenamiento: sin curvas de evaluacion publicadas no se puede estimar la generalizacion.
- El repo incluye logs de TensorBoard y pesos, pero no se garantiza que el `.onnx` y el `.nn` correspondan al mismo checkpoint.
- Al ser un modelo con 0 descargas y 0 likes, no hay validacion de la comunidad sobre su calidad o reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Breadkey/ppo-Huggy
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de Huggy (Hugging Face Deep RL Course): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
