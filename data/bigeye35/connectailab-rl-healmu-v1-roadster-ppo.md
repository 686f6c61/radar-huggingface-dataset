# bigeye35/connectailab-rl-healmu-v1-roadster-ppo

## Resumen

`connectailab-rl-healmu-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO para una tarea de control continuo muy concreta: hacer que un vehículo tipo roadster que cae invertido aterrice sobre sus ruedas usando dos propulsores. No es un modelo de lenguaje ni un transformer generativo, sino una política neuronal entrenada sobre un entorno Gymnasium propio denominado `로드스터연속` (roadster continuo) del simulador `로드스터_시뮬레이터.py`. Lo publica el usuario `bigeye35` en el marco del curso de IA de refuerzo de CONNECT AI LAB (lección 6 de "AI CITY BUILDERS").

El agente observa un estado de 7 dimensiones (posición x e y, velocidad x e y, seno y coseno de la inclinación, y velocidad angular) y emite una acción continua de 2 dimensiones: intensidad del propulsor inferior en el rango [0, 1] y par de rotación en el rango [−1, 1]. El autor reporta una tasa de aterrizaje del 72 % en 50 episodios nunca vistos durante el entrenamiento, lo que da una idea de su capacidad de generalización dentro de la distribución del simulador.

Es relevante como ejemplo didáctico y reproducible de un pipeline PPO completo con entornos vectorizados (8 entornos en paralelo, 1 000 000 de pasos, clip 0.2, gamma 0.99, GAE lambda 0.95, learning rate 3e-4). No debe confundirse con un modelo fundacional: su utilidad está acotada al entorno para el que fue entrenado y a la experimentación educativa con control continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO), arquitectura interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch; tamaño del repo 0.0 GB, sin pesos visibles) |

## Arquitectura y entrenamiento

El modelo es una política de control continuo entrenada con Proximal Policy Optimization (PPO) sobre un entorno Gymnasium propio. El espacio de observación tiene 7 dimensiones (posición x, posición y, velocidad x, velocidad y, seno de la inclinación, coseno de la inclinación y velocidad angular) y el espacio de acción es continuo de 2 dimensiones (intensidad del propulsor inferior en [0, 1] y par de rotación en [−1, 1]). La model card no detalla el número de capas, el tamaño de las capas ocultas ni la función de activación de la red de política y de la red de valor.

El entrenamiento se realizó con 8 entornos vectorizados en paralelo, 1 000 000 de pasos totales, coeficiente de clipping de 0.2, factor de descuento gamma de 0.99, GAE lambda de 0.95 y learning rate de 3e-4. No se menciona el uso de recompensas modeladas, currículo, domain randomization ni técnicas adicionales de estabilidad. La innovación destacable es el propio entorno: una tarea de aterrizaje de un cuerpo rígido invertido con dinámica continua y dos actuadores, que exige aprender una secuencia de control no trivial (impulso vertical sincronizado con par de rotación) para orientar el vehículo antes del contacto con el suelo.

## Capacidades

- Control continuo de un cuerpo rígido en caída invertida: aplica propulsión vertical y par de rotación para reorientar el roadster y aterrizar sobre las ruedas.
- Política reactiva basada únicamente en estado (no usa imágenes ni percepción visual): toma decisiones a partir de 7 variables físicas de bajo nivel.
- Generalización limitada dentro del entorno: el autor reporta 72 % de éxito en 50 episodios no vistos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni generación de texto.
- Uso esperado como componente de un bucle de simulación Gymnasium, no como servicio de inferencia de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo ejecutable de un pipeline PPO completo (entorno vectorizado, clipping, GAE) para explicar en clase cómo se entrena una política de control continuo y cómo se evalúa su tasa de éxito.
- Prototipado de controladores de aterrizaje: el agente puede usarse como línea base en simuladores de cuerpos rígidos con propulsores, comparando su política frente a controladores PID o MPC en la misma tarea de reorientación.
- Pruebas de robustez de entornos Gymnasium: al ser una política ya entrenada, permite validar cambios en el simulador `로드스터_시뮬레이터.py` (gravedad, masas, límites de actuadores) observando cómo se degrada la tasa de aterrizaje del 72 %.
- Generación de datos de demostración: las trayectorias de la política pueden registrarse para inicializar otros algoritmos (behavior cloning, DPO para RL, etc.) o para analizar secuencias de control óptimas.
- Investigación en simulación de vehículos: útil para estudiar maniobras de auto-enderezamiento en vehículos con propulsores, un problema relevante en robótica móvil y en simulación de física de vehículos.
- Benchmark interno de algoritmos de RL: al tener hiperparámetros y métrica de éxito documentados (1M pasos, 8 entornos, 72 % en 50 episodios), permite comparar PPO con SAC, TD3 o Dreamer en la misma tarea.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de aterrizaje en 50 episodios no vistos | 72 % |
| Pasos de entrenamiento | 1 000 000 |
| Entornos en paralelo | 8 |
| Clip PPO | 0.2 |
| Gamma | 0.99 |
| GAE lambda | 0.95 |
| Learning rate | 3e-4 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. Tampoco se aportan métricas de recompensa media, longitud de episodio ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no publicarse el tamaño de la red ni los pesos, no puede estimarse con rigor; por la naturaleza de la tarea (observación de 7 dimensiones, acción de 2) es probable que la política sea de tamaño reducido y quepa en cualquier GPU consumer, pero esto es una inferencia y no un dato confirmado.
- GPU recomendadas: no disponible. Para entrenamiento con 8 entornos vectorizados, una GPU consumer moderna (RTX 3060 o superior) sería suficiente en la mayoría de entornos de control continuo de baja dimensionalidad, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? No confirmado; el repositorio reporta 0.0 GB de tamaño, por lo que los pesos podrían no estar subidos o ser muy pequeños.
- Opciones de despliegue: no disponible. El repositorio usa PyTorch y el entorno Gymnasium propio; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Dependen del simulador y de la frecuencia de control, no documentadas.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-healmu-v1-roadster-ppo | PPO, control continuo | Aterrizaje de roadster invertido | 7 dimensiones de estado, 2 de acción | no disponible | Hugging Face (0 descargas) |
| Políticas PPO de Stable-Baselines3 (p. ej. LunarLanderContinuous) | PPO, control continuo | Aterrizaje de módulo lunar | 8 dimensiones de estado, 2 de acción | MIT (librería) | Ampliamente disponible |
| Políticas SAC de RL estándar para MuJoCo (HalfCheetah, Ant) | SAC, control continuo | Locomoción | Decenas de dimensiones | MIT (librería) | Ampliamente disponible |

La comparación es cualitativa: no existen resultados públicos de benchmarks comunes entre este agente y las políticas de referencia de Stable-Baselines3 o de los entornos MuJoCo, por lo que no puede establecerse una comparación numérica de rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada en la model card ni en los metadatos; no puede asumirse uso comercial sin consultar al autor.
- El repositorio reporta un tamaño de 0.0 GB y no se confirma la presencia de pesos entrenados; verificar antes de intentar cargar el modelo.
- El agente está acoplado al entorno `로드스터연속` del simulador `로드스터_시뮬레이터.py`; fuera de ese entorno su comportamiento no está garantizado.
- La tasa de éxito del 72 % implica que aproximadamente 3 de cada 10 episodios fallan; no es adecuado para aplicaciones de seguridad crítica sin un mecanismo de recuperación.
- No hay información sobre sesgos, alucinaciones ni comportamiento fuera de distribución más allá de la evaluación en 50 episodios.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no soporta tool calling ni agentes.
- La model card está redactada en coreano; la documentación técnica en inglés o castellano es inexistente.
- No se documentan semillas, número de repeticiones ni intervalos de confianza del 72 %, por lo que la métrica debe tomarse como una estimación puntual.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-roadster-ppo
- Simulador referenciado en la model card: `로드스터_시뮬레이터.py` (no se proporciona URL)
- Curso referenciado: AI CITY BUILDERS, lección 6 de IA de refuerzo, CONNECT AI LAB (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
