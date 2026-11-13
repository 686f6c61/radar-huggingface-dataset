# Frenchwizz/FNAF-Night1-PPO

## Resumen

FNAF-Night1-PPO es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) de la librería Stable-Baselines3 para jugar a una versión web personalizada de Five Nights at Freddy's. Lo publica el usuario Frenchwizz en Hugging Face y no se trata de un modelo de lenguaje, sino de un artefacto de política neuronal (CnnPolicy) que consume fotogramas RGB de 84x84x3 y emite acciones discretas sobre el entorno del juego. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

El modelo resuelve un problema muy acotado: superar la primera noche del juego (llegar a las 6:00 AM) en un entorno Gymnasium construido con Playwright y OpenCV, que captura la pantalla del navegador y la traduce a observaciones visuales. La política es una red convolucional que aprende directamente de píxeles, sin ingeniería de características manual. El espacio de acciones es discreto de tamaño 9 (esperar, puertas, luces, cambio de cámara y tres cámaras concretas).

Su relevancia es limitada fuera del ámbito educativo y de experimentación con RL visual: sirve como ejemplo reproducible de entrenamiento PPO con observaciones de imagen en un entorno no trivial, y como referencia para quien quiera construir entornos Gymnasium sobre aplicaciones web. No es un modelo generativo ni tiene capacidades de texto, código o razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional (CnnPolicy de Stable-Baselines3) sobre observaciones 84x84x3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de Stable-Baselines3, presumiblemente .zip; no confirmado) |

## Arquitectura y entrenamiento

La política es una `CnnPolicy` de Stable-Baselines3, es decir, un extractor de características convolucional seguido de una cabeza de política y otra de valor, entrenado con PPO. La entrada son fotogramas RGB de 84x84x3 capturados del navegador mediante Playwright y procesados con OpenCV. El espacio de acciones es `Discrete(9)`: esperar/conservar energía, puerta izquierda, luz izquierda, puerta derecha, luz derecha, cambio de cámara, CAM 2B, CAM 4B y CAM 1A.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset en el sentido habitual, sino interacciones con el entorno), hiperparámetros de PPO, función de recompensa ni si se aplicaron técnicas auxiliares como reward shaping, frame stacking o normalización de observaciones. Tampoco se documenta el número de entornos paralelos ni el tiempo de entrenamiento. La evaluación reportada indica que el agente sobrevivió la Noche 1 hasta las 6:00 AM con una recompensa total de 174.0 en 741 pasos.

## Capacidades

- Control visual directo: aprende una política de acción a partir de píxeles RGB sin características manuales.
- Juego de Five Nights at Freddy's (Noche 1): gestiona puertas, luces, cambio de cámara y tres cámaras específicas.
- Gestión de recursos: la acción de esperar/conservar energía sugiere que el agente aprende a administrar el consumo eléctrico del juego.
- Toma de decisiones secuencial bajo incertidumbre parcial: el estado del juego no es completamente observable desde un único fotograma.
- No soporta tool calling, function calling, agentes multi-paso generales, capacidades multilingües, visión general, audio ni modos de razonamiento explícito.
- No es un modelo de propósito general: su competencia está acotada al entorno concreto para el que fue entrenado.

## Casos de uso

- Reproducción de experimentos de RL visual: sirve como referencia para entrenar PPO con `CnnPolicy` sobre observaciones de imagen y comparar curvas de aprendizaje con otras configuraciones.
- Construcción de entornos Gymnasium sobre aplicaciones web: el uso de Playwright y OpenCV documenta un patrón replicable para automatizar tareas en interfaces web mediante RL.
- Docencia y formación: ejemplo didáctico de un pipeline completo de RL (entorno, captura de pantalla, preprocesado, entrenamiento PPO y evaluación) con un resultado medible y verificable.
- Investigación en agentes que operan interfaces gráficas: el agente demuestra que una política convolucional puede aprender a interactuar con una UI de juego a partir de píxeles.
- Benchmark de algoritmos de RL: puede usarse como tarea de control para comparar PPO con otros algoritmos (A2C, DQN, SAC) en el mismo entorno.
- Prototipado de sistemas de visión para juegos: el preprocesado con OpenCV y la captura con Playwright son reutilizables en proyectos de automatización de juegos o pruebas de UI.
- Estudio de recompensas y reward shaping: la recompensa total de 174.0 en 741 pasos permite analizar cómo distintas formulaciones de recompensa afectan a la supervivencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación es el resultado del autor en el entorno propio:

| Metrica | Valor |
|---|---|
| Noche superada | 1 (hasta las 6:00 AM) |
| Recompensa total | 174.0 |
| Pasos | 741 |
| Algoritmo | PPO |
| Politica | CnnPolicy (84x84x3) |

No hay comparación con otros agentes ni con modelos de referencia en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; una `CnnPolicy` de 84x84x3 es una red convolucional pequeña, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con varios GB de VRAM (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior es más que suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna; también podría ejecutarse en CPU para inferencia, aunque la latencia sería mayor.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) es la vía natural; el entorno requiere Playwright y OpenCV, y un navegador para la captura de pantalla. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Dependen del tiempo de captura de pantalla del navegador, que suele ser el cuello de botella, no la red neuronal.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros agentes de RL publicados para este mismo entorno o para tareas equivalentes de FNAF. Como referencias conceptuales de la misma categoría (políticas PPO con CnnPolicy en Stable-Baselines3) podrían citarse los ejemplos de la documentación de Stable-Baselines3 y RL Baselines3 Zoo, pero no se dispone de datos comparativos concretos de rendimiento en este entorno.

## Limitaciones y advertencias

- Alcance muy restringido: el agente está entrenado solo para la Noche 1; no hay evidencia de que generalice a otras noches, niveles o variantes del juego.
- Dependencia del entorno: la política asume el entorno web concreto construido con Playwright y OpenCV; cambios en la resolución, el renderizado o la UI pueden degradar el rendimiento.
- Sin información sobre licencia: no se indica licencia, por lo que el uso comercial queda sin marco legal claro y no se recomienda sin consultar al autor.
- Sin documentación de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí puede heredar sesgos del entorno y de la función de recompensa (por ejemplo, priorizar la supervivencia sobre otras métricas).
- Riesgo de sobreajuste al entorno: con una única evaluación reportada (una partida), no hay evidencia de robustez ni de varianza entre episodios.
- Reproducibilidad limitada: no se publican hiperparámetros, semillas, número de pasos de entrenamiento ni código del entorno, lo que dificulta replicar el resultado.
- Formato y tamaño del artefacto no confirmados: el repositorio figura con 0.0 GB y no se detalla el archivo de pesos, lo que puede indicar un repositorio vacío o incompleto en el momento de la consulta.
- Sin soporte multilingüe ni de texto: no debe evaluarse como modelo de lenguaje ni usarse para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/Frenchwizz/FNAF-Night1-PPO
- Stable-Baselines3 (librería): https://stable-baselines3.readthedocs.io/
- PPO (paper original): https://arxiv.org/abs/1707.06347
- Playwright: https://playwright.dev/
- OpenCV: https://opencv.org/
- Gymnasium: https://gymnasium.farama.org/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales del autor.
