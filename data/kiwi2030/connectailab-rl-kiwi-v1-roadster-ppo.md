# kiwi2030/connectailab-rl-kiwi-v1-roadster-ppo

## Resumen

`connectailab-rl-kiwi-v1-roadster-ppo` es una política de aprendizaje por refuerzo (reinforcement learning) entrenada con el algoritmo PPO (Proximal Policy Optimization) para el control continuo de un vehículo tipo roadster en un entorno de simulación física. El modelo ha sido publicado por el usuario kiwi2030 y se enmarca en el proyecto CONNECT AI LAB, una serie de experimentos de RL aplicados a distintos dominios (toma de decisiones empresariales, aterrizaje lunar, navegación de robots y, en este caso, control de actitud de un vehículo).

El problema que resuelve es concreto: un roadster que cae invertido debe girarse mediante dos propulsores y aterrizar sobre sus ruedas. El agente observa un vector de estado de 7 dimensiones (posición x e y, velocidad x e y, seno y coseno de la inclinación, y velocidad angular) y emite una acción continua de 2 dimensiones (intensidad del propulsor inferior entre 0 y 1, y par de rotación entre -1 y 1). El autor reporta una tasa de aterrizaje del 97,5 % en una prueba independiente de 200 episodios.

No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un artefacto de pesos de una política entrenada para un entorno Gymnasium específico (`로드스터_시뮬레이터.py`, clase `로드스터연속`). Su relevancia es la de un ejemplo reproducible de entrenamiento PPO en control continuo, no la de una herramienta de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre red neuronal; topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: vector de estado de 7 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (librería declarada: pytorch); formato exacto de los ficheros no disponible |

## Arquitectura y entrenamiento

El modelo es una política PPO para un espacio de acciones continuo de 2 dimensiones sobre un espacio de observación de 7 dimensiones. La model card no detalla la topología de la red (número de capas, unidades ocultas, funciones de activación), por lo que este dato no está disponible. El entorno es una implementación Gymnasium propia del autor, denominada `로드스터연속` (roadster continuo), que simula la dinámica de un vehículo invertido con dos actuadores: un propulsor inferior de intensidad continua en [0, 1] y un control de rotación en [-1, 1].

Los hiperparámetros de entrenamiento declarados son: algoritmo PPO, 1.000.000 de pasos de entorno, 8 entornos en paralelo, coeficiente de recorte (`clip`) de 0,2, factor de descuento `gamma` de 0,99, `gae_lambda` de 0,95, tasa de aprendizaje de 0,0005, coeficiente de entropía de 0,0 y semilla 0. No se especifica el número de tokens (no aplica), la composición del dataset (generado por interacción con el simulador) ni si se aplicaron técnicas adicionales como normalización de recompensas o curriculum learning. El resultado reportado por el autor es una tasa de aterrizaje del 97,5 % en 200 episodios de una prueba separada.

## Capacidades

- Control continuo de actitud y aterrizaje de un vehículo simulado: convierte un estado físico de 7 dimensiones en una acción de 2 dimensiones (propulsión y rotación).
- Toma de decisiones secuenciales bajo dinámica física: la política se ejecuta paso a paso dentro del bucle de simulación.
- Generalización dentro de la distribución del entorno de entrenamiento: el 97,5 % de aterrizaje en 200 episodios sugiere robustez frente a condiciones iniciales variadas del simulador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificación simbólica.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y reproducible de un pipeline PPO con espacio de acciones continuo, útil para explicar recorte de política, GAE y ajuste de hiperparámetros en un curso o taller.
- Prototipado de controladores de aterrizaje: la política puede integrarse en un simulador Gymnasium para comparar estrategias de control (PPO frente a DQN o SAC) en la misma tarea de aterrizaje invertido.
- Generación de datos de demostración: al ejecutar la política sobre el entorno se obtienen trayectorias de aterrizaje exitoso que pueden usarse para entrenamiento por imitación o para inicializar otras políticas.
- Pruebas de robustez de simuladores físicos: la tasa de éxito del 97,5 % permite usar el agente como referencia para validar que un simulador modificado mantiene una dinámica coherente.
- Investigación en control continuo con dos actuadores: el reducido espacio de acciones (2 dimensiones) y de observación (7 dimensiones) lo hace adecuado para experimentos de ablation sobre hiperparámetros de PPO con bajo coste computacional.
- Base para experimentos de transferencia: la política puede servir como punto de partida (fine-tuning con PPO) para variantes del entorno con más propulsores, gravedad distinta o superficies de aterrizaje irregulares.

## Benchmarks y rendimiento

El autor reporta un único resultado de evaluación propio, sin comparación con otras políticas:

| Métrica | Entorno | Resultado |
|---|---|---|
| Tasa de aterrizaje | `로드스터연속` (roadster invertido), 200 episodios de prueba | 97,5 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de RL como puntuaciones medias en MuJoCo o Atari) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de una política para un vector de estado de 7 dimensiones, el modelo es presumiblemente muy pequeño y cabe en cualquier GPU consumer, pero el número de parámetros no se ha publicado.
- GPU recomendadas: no disponible; por la naturaleza de la tarea, una GPU modesta (o incluso CPU) es suficiente para la inferencia paso a paso.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio (0,0 GB según Hugging Face) y la dimensionalidad de entrada y salida; no se especifica el modelo concreto.
- Opciones de despliegue: al ser un artefacto PyTorch para un entorno Gymnasium propio, el despliegue natural es cargar los pesos con PyTorch y ejecutar el bucle de simulación; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|---|
| connectailab-rl-kiwi-v1-roadster-ppo | PPO, control continuo | Roadster invertido (Gymnasium) | no disponible | no aplica | 97,5 % de aterrizaje en 200 episodios | no disponible |
| connectailab-rl-kiwi-v3-lunarlander | DQN, control discreto | LunarLander | no disponible | no aplica | no disponible | no disponible |
| connectailab-rl-kiwi-v1-link01 | PPO, toma de decisiones | Navegación de robot | no disponible | no aplica | no disponible | no disponible |
| connectailab-rl-kiwi-v2 | RL + PEFT sobre Qwen | Toma de decisiones empresariales | no disponible | no disponible | no disponible | Apache 2.0 |

Los tres modelos comparables pertenecen al mismo autor y proyecto (CONNECT AI LAB), por lo que la comparación es interna al ecosistema. No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en un simulador propio, la política hereda cualquier simplificación física del entorno `로드스터연속`.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones fuera de distribución si el estado observado se aleja de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje ni contexto textual.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible", por lo que no se puede asumir permiso de uso comercial sin consultar al autor.
- Caveat importante para producción: el modelo depende de un simulador concreto (`로드스터_시뮬레이터.py`) que no se distribuye en el repositorio de Hugging Face según la información disponible; sin ese código, los pesos no son directamente utilizables.
- El resultado del 97,5 % procede de una evaluación del propio autor, sin protocolo de evaluación independiente ni comparación con líneas base.
- El repositorio tiene 0 descargas y 0 "likes", lo que indica ausencia de validación por parte de la comunidad.
- No se especifican los formatos exactos de los ficheros de pesos ni los requisitos de versión de PyTorch o Gymnasium.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-roadster-ppo
- Modelo relacionado (Connect Tycoon v2): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo relacionado (teacher v2): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Modelo relacionado (LunarLander v3): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo relacionado (LINK-01 v1): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo relacionado (dama-aibrain): https://huggingface.co/kiwi2030/dama-aibrain
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/kiwi2030/connectailab-rl-kiwi-v1
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
