# miiwater/goi-rl

## Resumen

`miiwater/goi-rl` es una colección de políticas de aprendizaje por refuerzo entrenadas con Stable-Baselines3 (algoritmo PPO) para jugar al videojuego *Getting Over It with Bennett Foddy*. A diferencia de los modelos de lenguaje, no procesa texto ni imágenes de forma generativa: recibe el estado del juego y emite acciones de ratón para trepar por el escenario. Lo publica el usuario `miiwater` y se apoya en el simulador en JAX y el agente de referencia de krzim, que según la model card es el primero en completar el juego en una sola partida continua.

El repositorio contiene 27 políticas PPO entrenadas directamente en el juego real, la mayoría especializadas en un tramo concreto de la ruta y arrancando episodios desde estados de ascensiones ya exitosas. El fichero `chain.json` define qué política juega desde cada progreso de ruta y con qué escala de ruido de exploración (`@0.5`, `@1`). La integración con el juego se hace mediante un plugin de BepInEx que expone el estado a Python por un socket local.

Su relevancia es acotada pero clara: documenta un caso de RL profundo aplicado a un entorno con control fino y horizonte largo, con artefactos reproducibles (políticas, logs, vídeo y código). El tamaño del repositorio es de 0,1 GB y la licencia declarada en la model card es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO (Stable-Baselines3); topología concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `policy.npz` y formato Stable-Baselines3) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `.npz` (políticas PPO); 27 ficheros de política más `chain.json` |

## Arquitectura y entrenamiento

El modelo es un agente de aprendizaje por refuerzo profundo entrenado con PPO mediante Stable-Baselines3. Según la model card, las 27 políticas se entrenaron en el juego real, la mayoría sobre un tramo concreto de la ruta, y los episodios de entrenamiento arrancaban desde estados situados a lo largo de ascensiones que ya habían tenido éxito. Esta estrategia de arranque desde estados exitosos reduce el horizonte efectivo de aprendizaje y permite especializar cada política en un segmento del recorrido.

La ejecución se articula en cadena: `chain.json` indica qué política se activa en cada progreso de ruta y con qué escala de ruido de exploración. La comunicación con el juego se realiza a través de un plugin de BepInEx que expone el estado a Python sobre un socket local. El agente de referencia de krzim se entrenó en un simulador del juego en JAX, pero las políticas de este repositorio se entrenaron contra el juego real. No se dispone de datos sobre número de pasos de entrenamiento, composición de recompensas ni hiperparámetros.

## Capacidades

- Control continuo del ratón para trepar por el escenario del juego mediante movimientos de arrastre.
- Ejecución de una cadena de políticas especializadas por tramo de ruta, coordinadas por `chain.json`.
- Juego desde el inicio de la ruta: alcanza el yunque, aproximadamente 530 de las 864 unidades de la ruta (mejor marca 542, octubre de 2026).
- Juego desde el mástil (progreso 745): completa el recorrido en 8 de 8 intentos.
- Reproducción de entradas de ratón registradas, con vídeo de ejemplo de 30 s en tiempo real entre el progreso 308 y 405.
- No soporta tool calling, agentes multi-paso fuera del juego, capacidades multilingües ni visión general; su dominio es exclusivamente el entorno de *Getting Over It*.

## Casos de uso

- Investigación en RL con horizonte largo: sirve como referencia reproducible de cómo descomponer una tarea de control fino y larga duración en políticas especializadas por tramo, con arranque desde estados exitosos.
- Estudio de currículo y arranque desde estados: las 27 políticas y `chain.json` documentan una estrategia de entrenamiento por segmentos que puede replicarse en otros entornos con progreso acumulativo.
- Integración de agentes Python con juegos comerciales: el plugin de BepInEx y el socket local son un ejemplo práctico de puente entre un motor de juego y un bucle de inferencia en Python.
- Evaluación de estabilidad de políticas PPO: los logs de 20 ascensiones y las tasas de éxito (17 de 20 en el agente de referencia; 8 de 8 desde el mástil en estas políticas) permiten medir varianza y robustez.
- Docencia y divulgación: el vídeo con la entrada de ratón superpuesta y el código público facilitan explicar visualmente qué aprende un agente de RL en un entorno con física compleja.
- Reproducción de experimentos: al publicarse políticas, configuración de cadena y código, otro investigador puede repetir las ascensiones y comparar con sus propios agentes.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Victorias del agente de referencia de krzim (prueba del autor) | 17 de 20 |
| Mejor progreso de estas políticas desde el inicio | 542 de 864 unidades (yunque, ~530) |
| Victorias desde el mástil (progreso 745) | 8 de 8 |
| Tiempo de una victoria del agente de referencia | 1 min 35 s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y las políticas PPO son redes pequeñas, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; al ser políticas ligeras, no requieren GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: inferencia con Stable-Baselines3 en Python, más el plugin de BepInEx y el socket local para conectar con el juego.
- Latencia y throughput: no disponibles; el único dato temporal es la duración de una partida ganadora del agente de referencia (1 min 35 s).

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `miiwater/goi-rl` | PPO (Stable-Baselines3) | 27 políticas por tramo, entrenadas en el juego real | Yunque desde el inicio (542/864); 8/8 desde el mástil | MIT | Hugging Face |
| Agente de krzim (`zimmerk4/getting-over-it-rl-jax`) | RL en JAX | Entrenado en simulador, ejecución en el juego real | 17/20 victorias en una sola partida continua | no disponible | Hugging Face y GitHub |

No se dispone de información sobre otros agentes comparables para este juego en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona en *Getting Over It* y depende del plugin de BepInEx y del socket local; no es un modelo de propósito general.
- Rendimiento incompleto desde el inicio: las políticas alcanzan el yunque pero no completan la ruta sin arrancar desde el mástil.
- Dependencia de la cadena: el comportamiento depende de `chain.json` y de la escala de ruido de exploración; una configuración incorrecta puede degradar el rendimiento.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos de lenguaje, pero la política puede fallar de forma impredecible ante estados no vistos durante el entrenamiento.
- Licencia: la model card declara MIT, aunque el campo de licencia del repositorio aparece como no disponible; conviene verificar antes de un uso comercial.
- Idiomas y contexto: no aplican; no hay soporte de texto ni de ventanas de contexto.
- Caveat de producción: al ser un artefacto de investigación, no hay garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/miiwater/goi-rl
- Código del proyecto: https://github.com/miwate/getting-over-it-rl
- Agente de referencia de krzim en Hugging Face: https://huggingface.co/zimmerk4/getting-over-it-rl-jax
- GitHub de krzim: https://github.com/krzim
- Vídeo de una victoria: https://huggingface.co/miiwater/goi-rl/resolve/main/videos/krzim-network-wins.mp4
