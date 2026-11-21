# asd-HS/hearthstone-bg-agent

## Resumen

`hearthstone-bg-agent` es un checkpoint de política en PyTorch para jugar a Hearthstone Battlegrounds, desarrollado por el usuario `asd-HS`. No es un modelo de lenguaje: es una red neuronal de refuerzo (reinforcement learning) de aproximadamente 24 millones de parámetros que recibe observaciones estructuradas del juego y emite acciones legales dentro del entorno AutoTavern.

El modelo se distribuye como un único fichero `policy-0750.pt` (iteración 750 del entrenamiento) en formato `float32` de unos 92 MB, y depende de una versión parcheada del entorno TavernGym (`v1.0.0` con el parche `observe2`). La observación se codifica como un vector de 4017 flotantes más 447 identificadores de cartas, y el espacio de acciones discretas es de 196 movimientos legales (excluyendo `Move`).

Su relevancia es acotada pero concreta: es un ejemplo reproducible de agente RL para un juego de cartas con estado parcial y decisiones secuenciales, empaquetado con instrucciones de verificación de checksum, licencia MIT y código de inferencia público. No hay información sobre idiomas, benchmarks ni contexto textual porque no aplica a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (config: `card=96, state=512, layers=3, heads=4, dropout=0.0, flat=None`); no se especifica el tipo exacto de bloque (transformer u otro) |
| Parametros totales | 23.978.881 (`float32`, ~92 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; observación fija de 4017 flotantes + 447 IDs de carta |
| Tipos de cuantizacion | no disponible (checkpoint en `float32`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`obs2-policy-v1`, carga segura con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La información disponible describe una configuración de red con embeddings de carta de dimensión 96, estado de 512 dimensiones, 3 capas y 4 cabezas de atención, sin dropout. El checkpoint corresponde a la iteración 750 de un proceso de aprendizaje por refuerzo ejecutado sobre el entorno AutoTavern (TavernGym `v1.0.0` con parche `observe2`). El espacio de observación está definido por `N_CARDS=3984`, `OBS2_FLOATS=4017` y `OBS2_CARDS=447`, y el espacio de acciones por `A_MOVE=196` usando la máscara legal nativa `legal_mask[:196]`.

No se especifican en la información proporcionada el algoritmo de RL empleado (PPO, DQN, etc.), el número de tokens o episodios de entrenamiento, la composición del dataset ni si hubo fases de ajuste adicionales. El autor publica el checksum SHA-256 del checkpoint (`eb2cb3de029705beaa278f079a676999e17b43a2c789fc36da7a2b2547b844b8`) y el código de inferencia en un repositorio de GitHub separado.

## Capacidades

- Jugar partidas de Hearthstone Battlegrounds en el entorno AutoTavern, emitiendo acciones legales según la máscara nativa.
- Procesar observaciones estructuradas compuestas por 4017 flotantes de estado y 447 identificadores de carta.
- Seleccionar entre 196 acciones discretas por paso (excluyendo la acción `Move`).
- Ejecutar partidas 1v7 contra bots nativos de AutoTavern mediante el script de ejemplo `examples/play_vs_bots.py`.
- Carga segura del checkpoint con `weights_only=True`.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión, audio, tool calling ni agentes multi-paso en el sentido de los LLM.

## Casos de uso

- Investigación en RL para juegos de cartas: sirve como punto de partida reproducible para estudiar políticas entrenadas en un entorno con estado parcial y acciones enmascaradas, usando el parche `observe2` y el checksum publicado para garantizar reproducibilidad.
- Evaluación de algoritmos de RL: el checkpoint de la iteración 750 puede usarse como baseline frente a nuevas políticas entrenadas en el mismo entorno TavernGym.
- Análisis de decisiones en Battlegrounds: ejecutando partidas 1v7 contra bots nativos se pueden registrar trayectorias y estudiar la política en fases de compra, posicionamiento y combate.
- Docencia y divulgación: ejemplo práctico de pipeline completo (entorno parcheado, checkpoint, script de demo, verificación de integridad) para cursos de aprendizaje por refuerzo.
- Ingeniería de entornos: el parche `observe2` y la definición de `N_CARDS`, `OBS2_FLOATS`, `OBS2_CARDS` y `A_MOVE` sirven de referencia para adaptar TavernGym a otras variantes del juego.
- Pruebas de integración de agentes: permite validar infraestructura de inferencia PyTorch y de carga segura de pesos en pipelines de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa ~92 MB en `float32` y la red tiene ~24 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) e incluso en CPU para partidas individuales.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: PyTorch nativo con el entorno AutoTavern parcheado (`taverngym` `v1.0.0` + `observe2`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes RL para Hearthstone Battlegrounds ni referencias con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Dependencia estricta del entorno: requiere TavernGym `v1.0.0` con el parche `observe2`; cambios en la especificación de observación o de acciones invalidan el checkpoint.
- Excluye la acción `Move` del espacio de acciones (`legal_mask[:196]`), lo que puede limitar el repertorio de jugadas frente a agentes que la contemplan.
- Solo se publica el checkpoint de la iteración 750; no hay información sobre convergencia, estabilidad del entrenamiento ni curvas de aprendizaje.
- No se han publicado evaluaciones cuantitativas (win rate, MMR, etc.) en la información disponible, por lo que no se puede afirmar su nivel de juego.
- Riesgo de sobreajuste a los bots nativos de AutoTavern si se evalúa únicamente contra ellos.
- La model card restringe el uso a investigación y educación no comercial, pese a la licencia MIT, por motivos de marcas registradas de Blizzard Entertainment.
- Hearthstone y Hearthstone Battlegrounds son marcas de Blizzard Entertainment, Inc.; el uso del nombre y de la temática puede estar sujeto a restricciones adicionales.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/asd-HS/hearthstone-bg-agent
- Repositorio de código e inferencia: https://github.com/asd-HS/hearthstone-bg-agent
- Entorno AutoTavern: https://github.com/MCG-NJU/AutoTavern
