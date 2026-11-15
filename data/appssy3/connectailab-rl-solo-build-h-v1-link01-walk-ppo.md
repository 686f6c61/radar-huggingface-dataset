# appssy3/connectailab-rl-solo-build-H-v1-link01-walk-ppo

## Resumen

`connectailab-rl-solo-build-H-v1-link01-walk-ppo` es un checkpoint de aprendizaje por refuerzo publicado por el autor `appssy3` bajo el paraguas del proyecto ConnectAI Lab (SoloBuild-H). No es un modelo de lenguaje: es una política de control entrenada con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 para que el robot bípedo físico LINK-01, de 14 grados de libertad (14-DoF), aprenda a mantenerse de pie y a caminar en el simulador MuJoCo. El modelo se distribuye como artefacto de RL (`model.zip` de SB3 más `vecnormalize.pkl` y un `actor.json` con los pesos de la política exportados para inferencia en NumPy puro).

La relevancia del checkpoint es doble. Por un lado, es un ejemplo compacto y reproducible de entrenamiento de locomoción bípeda con recompensas compuestas (seguimiento de velocidad, tiempo en el aire, guía CPG de marcha, penalización por caída), un problema históricamente difícil por la inestabilidad del equilibrio dinámico. Por otro, el autor declara convergencia en 1.007.616 pasos de simulación (aproximadamente 9 minutos con 8 entornos en paralelo) y un 0 % de caídas en la evaluación de 20 segundos, con un desplazamiento de 1,013 m en ese intervalo (unos 0,05 m/s de media efectiva).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0,0 GB y no declara licencia ni idiomas. Es, por tanto, un artefacto de investigación y docencia (asociado a la lección 7 de un curso de RL de Connect AI LAB) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-crítico con redes MLP (actor 51→64→64→14 con Tanh; crítico 51→256→256→1), entrenada con PPO |
| Parametros totales | No disponible (redes pequeñas: actor ≈ 8.500 pesos; crítico ≈ 79.000 pesos, estimación a partir de las dimensiones declaradas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de observación de 51 dimensiones; sin ventana de contexto textual) |
| Tipos de cuantizacion | No aplica; se distribuye en FP32 (SB3 `.zip`) y pesos exportados a JSON para NumPy en float64 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (normalización de observaciones) y `actor.json` (capas con `weight` y `bias`) |

## Arquitectura y entrenamiento

La política es un actor-crítico con espacio de acciones continuo de 14 dimensiones (10 articulaciones de piernas y 4 de cabeza), con desplazamiento de servo en el rango [-1, 1], equivalente a ±0,18 rad. La observación tiene 51 dimensiones: vector de gravedad (3), velocidad angular (3), ángulos articulares (14), velocidades articulares (14), acción previa (14) y velocidad de comando (3). El bucle de política corre a 50 Hz sobre una simulación física a 500 Hz en MuJoCo 3.16. Los hiperparámetros declarados son: learning rate 3·10⁻⁴ con Adam, 1.024 pasos de rollout por 8 entornos (8.192 pasos por actualización), batch de 64, 10 épocas por actualización, clip ratio ε = 0,2, γ = 0,99 y GAE λ = 0,95.

El entrenamiento total fue de 1.007.616 pasos. La innovación principal está en la ingeniería de recompensa, diseñada para evitar el atajo de «quedarse de pie sin avanzar» (lazy standing): se combinan términos de progreso y seguimiento de velocidad (comando de 0,18 m/s), bonus por tiempo en el aire al levantar el pie, una guía de ritmo CPG (patrón de marcha independiente de fase), términos de supervivencia, verticalidad y control lateral, penalización energética y una penalización de -10,0 por caída, con terminación del episodio si la altura del cuerpo cae por debajo de 0,10 m. No se declara uso de RLHF ni DPO (no aplica a este dominio).

## Capacidades

- Locomoción bípeda continua: mantiene la verticalidad y ejecuta marcha con coordinación de 14 articulaciones durante al menos 20 segundos seguidos en simulación.
- Seguimiento de velocidad de comando: la observación incluye 3 dimensiones de velocidad de comando; el entrenamiento optimiza el seguimiento de 0,18 m/s.
- Control continuo de servoarticulaciones con salida acotada a [-1, 1] (±0,18 rad).
- Inferencia sin dependencias pesadas: el `actor.json` permite ejecutar la política con NumPy puro (producto matricial + tanh + clip).
- Compatibilidad con Stable-Baselines3: carga directa con `PPO.load` y uso de `vecnormalize.pkl` para normalizar observaciones.
- Compatibilidad con el playground web EZERAI declarada por el autor (formato `actor.json`).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el checkpoint sirve como referencia resuelta de la lección 7 de un curso de RL; los alumnos pueden cargarlo con SB3 y comparar curvas de recompensa con sus propios entrenamientos.
- Investigación en locomoción bípeda: permite reproducir el entorno `Link01Walk-v0` y analizar el efecto de la recompensa CPG frente a recompensas de marcha más simples, partiendo de una política que ya no cae.
- Simulación de control en tiempo real: el bucle de política a 50 Hz sobre física a 500 Hz es adecuado para validar latencias de control antes de portar la política a hardware.
- Despliegue embebido de bajo coste: al exportarse a JSON y ejecutarse con NumPy, la política puede integrarse en un microcontrolador o en un runtime ligero sin necesidad de PyTorch, algo relevante para el robot físico LINK-01 de 14 servos.
- Demostraciones interactivas y visualización: con `render_mode="human"` en Gymnasium se puede mostrar la marcha en vídeo o en un playground web, útil para materiales divulgativos y para el canal del proyecto.
- Punto de partida para fine-tuning: sirve como inicialización para experimentos de curriculum (terrenos irregulares, perturbaciones externas, cambios de velocidad) sin partir de una política aleatoria.
- Pruebas de robustez y evaluación de seguridad: permite medir la tasa de caídas bajo seeds distintas (el autor declara 0 caídas/min en la evaluación reportada) antes de considerar transferencia a hardware.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| Walking (reinforcement-learning) | Link01Walk-v0 | Distancia recorrida en 20 s | 1,013 m |
| Walking (reinforcement-learning) | Link01Walk-v0 | Caídas por minuto | 0,0 (0 % de tasa de caída) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: prácticamente despreciable. La política tiene del orden de 8.500 pesos en el actor; incluso en FP64 ocupa menos de 0,1 MB. Cabe en cualquier GPU, CPU o microcontrolador.
- GPU recomendadas: ninguna en particular; una GPU consumer (RTX 3060 o superior) solo es útil para acelerar el entrenamiento o el renderizado de MuJoCo, no para la inferencia de la política.
- GPU consumer: sí, cabe en cualquier GPU consumer e incluso en hardware embebido; el cuello de botella es el simulador MuJoCo, no la red.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load` + `VecNormalize.load`), inferencia NumPy pura con `actor.json`, y el playground web EZERAI declarado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: el bucle de política está diseñado para 50 Hz (20 ms por paso) sobre física a 500 Hz; el coste de cómputo de la red es de microsegundos. No se publican cifras de throughput medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-solo-build-H-v1-link01-walk-ppo | PPO, MLP actor-crítico, 14-DoF | No disponible (≈ 8.500 en actor) | Observación de 51 dim | 1,013 m / 20 s; 0 caídas/min | No disponible | Hugging Face (0 descargas) |
| Alternativas de locomoción bípeda en RL (p. ej. políticas de MuJoCo Humanoid o Unitree con PPO/SAC) | PPO/SAC, MLP | No disponible | Observaciones de mayor dimensión | No disponible en esta consulta | Habitualmente MIT/Apache-2.0 en repos públicos | Repos de investigación y papers |
| Políticas de locomoción con RL modelo-based o híbridas (p. ej. DreamerV3 adaptado a control) | World model + actor | No disponible | Variable | No disponible | MIT en la implementación de referencia | Repos públicos |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los modelos citados son referencias de categoría, no una comparación medida.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en simulación (MuJoCo 3.16); no hay evidencia declarada de transferencia al robot físico LINK-01 (sim-to-real), donde aparecen fricción, holguras y latencias no modeladas.
- Los resultados (1,013 m en 20 s, 0 caídas/min) están marcados como `verified: false` y proceden del propio autor; no hay evaluación independiente.
- La velocidad efectiva es de aproximadamente 0,05 m/s, muy por debajo del comando de 0,18 m/s, lo que sugiere un seguimiento de velocidad incompleto pese al 0 % de caídas.
- No se declara licencia: no hay permiso explícito para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- No se declara información sobre sesgos, alucinación o idiomas porque no es un modelo de lenguaje; esas categorías de riesgo no aplican.
- Depende de la versión del entorno `Link01Walk-v0` y de `vecnormalize.pkl`; cargar la política sin la normalización de observaciones correspondiente degradará el comportamiento.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que puede indicar que los artefactos no están subidos o que el repo está incompleto; verificar el contenido real antes de integrarlo.
- El autor declara convergencia en unos 9 minutos con 8 entornos en paralelo; ese régimen puede sobreajustar a la semilla y al entorno concreto, con poca robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-v1-link01-walk-ppo
- Perfil del autor en Hugging Face: https://huggingface.co/appssy3
- Hub de desarrollo SoloBuild-H: https://appssy3-art.github.io/solo-build-studio/
- Canal de YouTube del proyecto: https://www.youtube.com/@solobuild.studio
- Repositorio GitHub del código PPO: https://github.com/appssy3-art/connectailab-rl-humanoid-ppo
- Paper, blog o demo adicionales: no disponible
