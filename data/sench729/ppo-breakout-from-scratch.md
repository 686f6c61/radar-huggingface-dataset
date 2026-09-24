# Sench729/ppo-breakout-from-scratch

## Resumen

`Sench729/ppo-breakout-from-scratch` es un checkpoint de un agente de aprendizaje por refuerzo que juega a Atari Breakout en el entorno `ALE/Breakout-v5`. No es un modelo de lenguaje ni un modelo generativo multimodal: es una implementación propia en PyTorch del algoritmo PPO, desarrollada de forma incremental como trabajo de curso (REINFORCE → A2C → A2C+GAE → PPO), sin utilizar Stable Baselines3 ni ninguna otra librería de RL de alto nivel.

El artefacto publicado corresponde a la etapa final del recorrido, es decir, al agente entrenado con PPO. La política y la función de valor comparten un codificador convolucional de estilo Nature-DQN (tres capas convolucionales seguidas de una capa totalmente conectada de 512 dimensiones), que consume observaciones de 84x84 en escala de grises con un apilado de cuatro frames. La evaluación codiciosa sobre 20 episodios arroja una recompensa media de 2,35 (desviación típica 0,48).

Su relevancia es fundamentalmente pedagógica y de reproducibilidad: sirve como referencia limpia de cómo se construye PPO paso a paso y como punto de partida para experimentos de ablación, no como un agente resuelto. El propio autor advierte que el agente se entrenó con un presupuesto de pasos muy inferior al habitual en Atari PPO (millones de frames), por lo que el objetivo es demostrar la correcta implementación del algoritmo y la mejora relativa entre etapas, no alcanzar puntuaciones competitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN estilo Nature-DQN (3 capas convolucionales → capa fully connected de 512 dimensiones) con cabezas separadas de actor y critico sobre encoder compartido |
| Parametros totales | no disponible (no declarado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observacion de 4 frames apilados de 84x84 en escala de grises |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` en fichero `.pt` (segun el ejemplo de uso de la model card) |
| Entorno | `ALE/Breakout-v5` con `AtariPreprocessing` (frameskip=4, escala de grises, 84x84) y `FrameStackObservation(stack_size=4)` |
| Algoritmo | PPO (proximal policy optimization) con GAE |
| Hiperparametros | gamma=0,99; lambda=0,95; clip_eps=0,2; lr=2,5e-4 (Adam); rollout_len=128; n_epochs=4; minibatch_size=32; coef. de perdida de valor=0,5; coef. de entropia=0,01; grad clip=0,5 |
| Evaluacion | 20 episodios en modo greedy: media 2,35; desviacion tipica 0,48 |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Pipeline declarado | `reinforcement-learning` |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

La red es un actor-critico con tronco convolucional compartido. El codificador sigue el esquema clásico de Nature-DQN: tres capas convolucionales que procesan la entrada de 84x84x4 y una capa totalmente conectada de 512 unidades; a partir de esa representación compartida se ramifican dos cabezas, una que produce la distribución de política sobre las acciones discretas de Breakout y otra que estima el valor del estado. La entrada se construye con `AtariPreprocessing` (frameskip de 4, conversión a escala de grises y reescalado a 84x84) más un apilado de cuatro frames consecutivos.

El entrenamiento fue incremental, reproduciendo la progresión habitual en la literatura de reducción de varianza: REINFORCE, después A2C, después A2C con ventaja generalizada (GAE) y finalmente PPO con recorte de la ratio de probabilidades. Los hiperparámetros declarados son los estándar de PPO para Atari en configuraciones de presupuesto reducido: rollout de 128 pasos, cuatro épocas de optimización por lote de datos, minilotes de 32, coeficiente de entropía de 0,01 y recorte de gradiente de 0,5. No se documenta en la información disponible el número exacto de pasos de entorno consumidos, ni la composición del dataset (en RL no aplica un dataset supervisado: la experiencia se genera por interacción con el emulador). Tampoco se documenta el uso de técnicas auxiliares como normalización de recompensas, recorte de recompensa o currículos de entrenamiento.

## Capacidades

- Control de política discreta en un único entorno: seleccionar acciones (NOOP, FIRE, arriba, abajo, izquierda, derecha) a partir de píxeles crudos de Breakout.
- Aprendizaje por refuerzo desde cero sin datos humanos: la única señal es la recompensa del emulador.
- Aproximación de función de valor: la cabeza de crítico permite estimar el retorno esperado desde un estado, reutilizable para diagnóstico y depuración.
- Implementación didáctica de cuatro algoritmos encadenados (REINFORCE, A2C, A2C+GAE, PPO) en un único código base de PyTorch.
- Soporte de entrenamiento con el envoltorio `AtariPreprocessing` y `FrameStackObservation` de Gymnasium.
- No dispone de: tool calling, function calling, capacidades de agente multi-paso fuera del entorno, generación de texto, código, matemáticas, visión general, audio, ni capacidades multilingües. No es un modelo de lenguaje.

## Casos de uso

- Material docente para cursos de aprendizaje por refuerzo: el repositorio ilustra la transición REINFORCE → A2C → A2C+GAE → PPO sobre un mismo entorno, lo que permite mostrar en clase por qué GAE y el recorte de PPO reducen la varianza del estimador de gradiente.
- Experimentos de ablación controlados: al compartir tronco e hiperparámetros, es un punto de partida limpio para medir el efecto de cambiar `clip_eps`, `rollout_len` o el coeficiente de entropía sin reescribir el agente.
- Verificación de una implementación propia de PPO: sirve como oráculo mínimo para comprobar que un pipeline nuevo reproduce la curva de recompensa descrita (0,00 en REINFORCE; 2,35 en A2C, A2C+GAE y PPO).
- Benchmark de infraestructura de simulación: útil para medir el rendimiento del emulador ALE y del preprocesado de Atari (frameskip=4, 84x84, apilado de 4) en CPU, ya que el cuello de botella del entrenamiento es el emulador, no la red.
- Reutilización del codificador CNN: la torre convolucional de tres capas más capa de 512 puede transferirse como extractor de características para otros entornos con observaciones visuales de baja resolución.
- Validación de protocolos de evaluación: el esquema de 20 episodios en modo greedy con desviación típica reportada es un ejemplo de cómo documentar incertidumbre en evaluaciones de RL con pocos episodios.
- Comparación con implementaciones de referencia: permite contrastar el comportamiento con agentes equivalentes entrenados con Stable Baselines3 y RL Zoo (por ejemplo `kuross/ppo-Breakout-v4`) bajo el mismo entorno.
- Prototipado rápido en máquinas sin GPU: por el tamaño reducido de la red, el ciclo de evaluación puede ejecutarse íntegramente en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K, que además no aplican a este tipo de artefacto) en la información disponible. El único dato cuantitativo aportado por el autor es la evaluación de 20 episodios en modo greedy, junto con la progresión entre etapas:

| Etapa | Recompensa media de evaluacion |
|---|---|
| REINFORCE | 0,00 |
| A2C | 2,35 |
| A2C+GAE | 2,35 |
| PPO | 2,35 |

Evaluación final: 20 episodios greedy, media 2,35, desviación típica 0,48. Como referencia externa aparecida en la búsqueda web, el repositorio `agrau/breakout-ppo` declara un agente afinado a nivel de benchmark en torno a 390 puntos por partida, muy por encima de este checkpoint; esa cifra pertenece a otro proyecto y no es comparable directamente en términos de presupuesto de entrenamiento. No se dispone de curvas de aprendizaje, número de frames consumidos ni comparación con las líneas base publicadas de PPO en Atari.

## Requisitos de hardware

- VRAM: no disponible; la red es una CNN pequeña con entrada de 84x84x4 y una capa de 512 unidades, por lo que la inferencia cabe holgadamente en unos pocos cientos de megabytes de memoria, incluso en CPU.
- GPU recomendadas: no se requieren. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es más que suficiente; el entrenamiento está limitado por el emulador de Atari, que se ejecuta en CPU.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad de GPU consumer e incluso en modo solo CPU.
- Opciones de despliegue: no aplica el ecosistema de servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama). El despliegue consiste en cargar el `state_dict` con `torch.load` sobre una instancia de `ActorCritic` y ejecutar el bucle de interacción con Gymnasium/ALE.
- Latencia y throughput: no disponibles. El coste dominante es el paso de simulación del emulador, no el forward pass de la red.
- Advertencia sobre pesos: los metadatos de HuggingFace indican un tamaño de repositorio de 0,0 GB. El código de ejemplo de la model card hace referencia a un fichero `ppo.pt` que podría no estar efectivamente subido al repositorio; conviene verificar la lista de ficheros antes de planificar su uso.

## Comparativa con modelos similares

| Modelo | Entorno | Implementacion | Parametros | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Sench729/ppo-breakout-from-scratch` | `ALE/Breakout-v5` | PyTorch propia (sin SB3) | no disponible | media 2,35 en 20 episodios greedy | no disponible | HuggingFace, repo de 0,0 GB |
| `kuross/ppo-Breakout-v4` | `Breakout-v4` | Stable Baselines3 + RL Zoo | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| `agrau/breakout-ppo` | Atari Breakout | PPO propio, entrenado desde cero en Jetson | no disponible | en torno a 390 puntos por partida (benchmark) | no disponible | GitHub |
| `tobeyesong/breakout-ppo` | Atari Breakout | PPO propio, sin datos humanos | no disponible | no disponible en la informacion proporcionada | no disponible | GitHub |

La diferencia principal frente a las alternativas es metodológica: este checkpoint prioriza la trazabilidad del proceso de construcción (cuatro etapas comparadas bajo idéntica arquitectura) sobre la puntuación final. El agente de `agrau/breakout-ppo` declara un rendimiento muy superior, atribuible a un presupuesto de entrenamiento mayor y a fases de ajuste específicas.

## Limitaciones y advertencias

- Agente no resuelto: el propio autor indica que se entrenó con un número de pasos muy inferior al presupuesto típico de PPO en Atari (millones de frames). La recompensa media de 2,35 es muy baja y no implica dominio del juego.
- Alto riesgo de comportamientos degenerados o incoherentes fuera de la distribución de estados explorada durante un entrenamiento corto; en RL esto equivale funcionalmente al riesgo de alucinación de un modelo de lenguaje.
- Sesgos de generalización: el agente está especializado exclusivamente en `ALE/Breakout-v5`. No se ha evaluado su transferencia a otras variantes de Breakout ni a otros juegos de Atari.
- Ausencia de datos de licencia: la model card no especifica licencia alguna. No puede asumirse permiso de uso comercial ni de redistribución; es necesario contactar con el autor antes de cualquier uso en producción.
- Ausencia de idiomas aplicables: no es un modelo lingüístico, por lo que las filas de idiomas y multilingüismo no tienen sentido aquí.
- Incertidumbre estadística: la evaluación se realizó sobre solo 20 episodios. Con desviación típica de 0,48, el intervalo de confianza de la media es amplio y la comparación entre etapas (A2C, A2C+GAE y PPO, todas con 2,35) no permite concluir mejoras significativas a partir de los datos publicados.
- Posible ausencia de los pesos: el tamaño de repositorio reportado de 0,0 GB sugiere que el fichero `ppo.pt` puede no estar disponible, lo que bloquearía la reproducibilidad.
- Sin información sobre semillas aleatorias, número de ejecuciones ni protocolo de evaluación detallado más allá de "20 episodios greedy", lo que limita la replicabilidad estricta.
- No apto para uso en producción orientado a usuario final: se trata de un artefacto académico de demostración algorítmica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sench729/ppo-breakout-from-scratch
- Referencia de PPO en Breakout (GitHub, tobyesong): https://github.com/tobeyesong/breakout-ppo
- Referencia de PPO en Breakout con rendimiento declarado de benchmark (GitHub, agrau): https://github.com/agrau/breakout-ppo
- Cuaderno de la Deep RL Class de HuggingFace sobre PPO desde cero (CleanRL): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/main/notebooks/unit8/unit8_part1.ipynb
- Articulo divulgativo sobre PPO en Breakout: https://medium.com/@toanlam01/i-built-a-breakout-ai-agent-with-ppo-from-scratch-958e161f422b
- Modelo comparable entrenado con Stable Baselines3 (kuross/ppo-Breakout-v4): https://huggingface.co/kuross/ppo-Breakout-v4
