# K-9-labs/connectailab-rl-eak-v1-roadster-ppo

## Resumen

connectailab-rl-eak-v1-roadster-ppo es un agente de aprendizaje por refuerzo desarrollado por K-9-labs en el marco de CONNECT AI LAB, orientado a un entorno de control continuo muy específico: un simulador de "roadster" (vehículo tipo descapotable) que cae invertido y debe aterrizar sobre las ruedas. El agente se entrena con PPO (Proximal Policy Optimization) sobre un entorno Gymnasium propio (`로드스터_시뮬레이터.py`, clase `로드스터연속`), y su acción consiste en dos señales continuas: intensidad del propulsor inferior (0 a 1) y par de rotación (−1 a 1).

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal pequeña entrenada para una tarea concreta de control. El repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes y su model card está redactada en coreano. La relevancia es, por tanto, educativa y de experimentación: sirve como ejemplo reproducible de un pipeline PPO con entorno Gymnasium, recompensa de aterrizaje y evaluación sobre episodios no vistos.

El resultado declarado por el autor es una tasa de aterrizaje del 28% en 50 partidas nunca vistas, tras 1.000.000 de pasos de entrenamiento con 8 entornos en paralelo. Es un agente de bajo rendimiento absoluto, pero útil como referencia didáctica de un ciclo completo de RL (entorno, política, entrenamiento y evaluación) y como punto de partida para iteraciones posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO); arquitectura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la model card está en coreano) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint de política PPO); no se confirma safetensors ni GGUF |
| Entorno | Gymnasium, `로드스터연속` (roadster invertido) |
| Espacio de observación | 7 dimensiones: posición x, y; velocidad x, y; inclinación sin, cos; velocidad angular |
| Espacio de acción | 2 dimensiones continuas: intensidad del propulsor [0, 1], par de rotación [−1, 1] |
| Algoritmo | PPO |
| Pasos de entrenamiento | 1.000.000 |
| Entornos paralelos | 8 |
| Hiperparámetros | clip 0.2, gamma 0.99, GAE lambda 0.95, learning rate 0.0003 |
| Tasa de aterrizaje evaluada | 28% en 50 episodios no vistos |

## Arquitectura y entrenamiento

El modelo es una política PPO para un espacio de acciones continuo de dos dimensiones. La observación es un vector de 7 componentes que describe el estado físico del vehículo (posición, velocidad lineal, orientación codificada como seno y coseno de la inclinación, y velocidad angular), lo que evita discontinuidades en la representación del ángulo. La acción se compone de la intensidad del propulsor inferior y del par de rotación, ambos continuos, lo que exige una política con salida gaussiana o equivalente.

El entrenamiento se realizó con PPO durante 1.000.000 de pasos, con 8 entornos ejecutados en paralelo, factor de recorte de 0.2, descuento gamma de 0.99, lambda de GAE de 0.95 y tasa de aprendizaje de 0.0003. No se documentan en la información disponible detalles sobre la arquitectura de la red (número de capas, unidades ocultas), la función de recompensa exacta, el número de tokens o datos de preentrenamiento (no aplica) ni si hubo ajuste fino posterior. Tampoco se especifica si se aplicó normalización de observaciones, reward shaping o currículo de dificultad.

La innovación técnica destacable es la propia definición del entorno: un problema de aterrizaje con orientación invertida que requiere coordinar propulsión vertical y rotación, lo que lo convierte en un banco de pruebas compacto para control continuo. No se mencionan técnicas como decodificación especulativa, atención lineal ni RLHF, que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un vehículo simulado mediante dos acciones: intensidad del propulsor y par de rotación.
- Aterrizaje sobre las ruedas desde una orientación invertida en el simulador `로드스터연속`.
- Generalización limitada a episodios no vistos: 28% de aterrizaje en 50 partidas nuevas.
- Entrenamiento reproducible con PPO y Gymnasium, con hiperparámetros documentados.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo de un pipeline PPO con entorno Gymnasium, desde la definición del espacio de estados hasta la evaluación sobre episodios no vistos, adecuado para cursos introductorios de RL.
- Prototipado de entornos de control continuo: el código del simulador y la política pueden reutilizarse como plantilla para nuevos entornos con acciones continuas de dos dimensiones.
- Comparación de algoritmos: al estar entrenado con PPO e hiperparámetros explícitos, permite contrastar con SAC, TD3 o A2C sobre el mismo entorno y medir la tasa de aterrizaje como métrica común.
- Investigación en reward shaping: la baja tasa de aterrizaje (28%) sugiere margen de mejora mediante diseño de recompensa, currículo o inicialización; el agente sirve como línea base para esos experimentos.
- Demostraciones interactivas: puede integrarse en una demo de simulación física para visualizar cómo una política aprendida corrige la orientación de un vehículo en caída.
- Evaluación de robustez: útil para estudiar la varianza de la política ante condiciones iniciales distintas, dado que el autor reporta el rendimiento sobre 50 episodios no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es la tasa de aterrizaje del 28% en 50 episodios no vistos, sin comparación con otras políticas ni intervalos de confianza.

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 28% | 50 episodios no vistos |
| Pasos de entrenamiento | 1.000.000 | PPO, 8 entornos |
| Entornos paralelos | 8 | no disponible el tipo de vectorización |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política pequeña para un vector de observación de 7 dimensiones, la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente (GTX 1060, RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una GPU consumer moderna acelera los 8 entornos paralelos.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo; no se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; dependen del simulador físico y del bucle de control, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Rendimiento | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-eak-v1-roadster-ppo | Política RL | Roadster invertido (Gymnasium) | PPO | 28% aterrizaje en 50 episodios | no disponible |
| Políticas PPO de referencia (p. ej. Stable-Baselines3) | Política RL | Entornos Gymnasium estándar | PPO | no comparable directamente | MIT (SB3) |
| Políticas SAC/TD3 de referencia | Política RL | Control continuo | SAC/TD3 | no comparable directamente | MIT (SB3) |

No se dispone de modelos comparables entrenados exactamente sobre el mismo entorno `로드스터연속`, por lo que la comparación directa de rendimiento no está disponible. Las alternativas citadas son implementaciones genéricas de algoritmos, no políticas equivalentes.

## Limitaciones y advertencias

- Rendimiento bajo: 28% de aterrizaje en 50 episodios no vistos implica que falla en aproximadamente 7 de cada 10 intentos.
- Sesgos conocidos: no documentados; al ser un agente de control, el riesgo de sesgo se limita a la distribución de condiciones iniciales del entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede producir acciones fuera de distribución ante estados no vistos.
- Limitaciones de contexto o idioma: no aplica; no procesa lenguaje. La documentación está en coreano, lo que puede dificultar su reutilización por parte de equipos hispanohablantes.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin evidencia de validación externa; la arquitectura de la red y la función de recompensa no están documentadas, lo que dificulta la reproducibilidad.
- El agente está acoplado al simulador `로드스터_시뮬레이터.py`; no es transferible directamente a otros entornos sin reentrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/K-9-labs/connectailab-rl-eak-v1-roadster-ppo
- Repositorio del simulador (`로드스터_시뮬레이터.py`): no disponible como enlace público en la información proporcionada
- Paper o blog de CONNECT AI LAB: no disponible
- Demo interactiva: no disponible
