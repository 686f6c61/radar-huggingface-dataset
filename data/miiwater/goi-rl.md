# miiwater/goi-rl

## Resumen

`miiwater/goi-rl` no es un modelo de lenguaje, sino una colección de 27 políticas de aprendizaje por refuerzo (PPO, implementadas con Stable-Baselines3) entrenadas para jugar al videojuego comercial *Getting Over It with Bennett Foddy*. El objetivo declarado por el autor es ser el primero en completar una partida continua y real del juego de Steam (no un clon) con redes neuronales, sin guardado/carga y sin búsqueda durante la partida. El repositorio, de 0,1 GB, contiene las políticas entrenadas, un fichero `chain.json` que indica qué política juega en cada tramo de la ruta y con qué escala de ruido de exploración (`@0.5`, `@1`), y un vídeo `replay.mp4` de 30 segundos en tiempo real.

El estado publicado en octubre de 2026 es intermedio: partiendo desde abajo y jugando en solitario, las redes alcanzan el yunque, aproximadamente 530 de las 864 unidades de la ruta (mejor marca registrada: 542). Partiendo desde el mástil (unidad 745), terminan el juego 8 veces de cada 8. Existe además un agente de búsqueda independiente con guardado y carga que sí ha terminado el juego, pero el propio autor lo excluye explícitamente del resultado de RL.

La relevancia del proyecto es doble. Por un lado, es un caso de estudio de RL jerárquico o por currículo: en lugar de una única política monolítica, se encadenan 27 políticas especializadas por tramos, arrancando episodios desde estados ya superados. Por otro, demuestra una integración poco habitual entre un agente Python y un juego real mediante un plugin BepInEx que expone el estado del juego por un socket local, lo que abre la puerta a experimentar con RL en juegos de control motor fino y geometría no trivial. El proyecto no publica benchmarks estándar (MMLU, HumanEval, GSM8K y similares no son aplicables) ni métricas comparables con otros agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes de política PPO (perceptrón multicapa) sobre observaciones del juego; implementadas con Stable-Baselines3 |
| Parámetros totales | No disponible (27 políticas independientes; el repositorio completo ocupa 0,1 GB) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; consume observaciones de estado del juego, no secuencias de texto) |
| Tipos de cuantización | No disponible / no aplicable |
| Idiomas soportados | No aplicable (no procesa lenguaje natural) |
| Licencia | MIT según el resultado de búsqueda de la página de HuggingFace; la ficha de metadatos consultada indica "no disponible" |
| Formato de pesos | Pesos de Stable-Baselines3 (formato exacto no especificado en la información disponible) |
| Librería | Stable-Baselines3 |
| Pipeline declarado | reinforcement-learning |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Número de políticas | 27 |
| Entorno | *Getting Over It with Bennett Foddy* (juego real de Steam, vía plugin BepInEx y socket local) |
| Entradas / salidas | No disponible (observaciones y acciones no detalladas en la información consultada) |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-09-28 |
| Última actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La información disponible no detalla el tamaño de las redes, el número exacto de capas ni la dimensión de las observaciones. Sí se especifica que son políticas PPO entrenadas con Stable-Baselines3 y que se organizan como un conjunto de 27 políticas especializadas. El entrenamiento es por tramos: la mayoría de las políticas se entrenaron sobre un segmento concreto de la ruta, iniciando episodios desde estados situados en ascensiones que ya habían tenido éxito. El fichero `chain.json` actúa como orquestador, asignando a cada rango de progreso de la ruta (medido en unidades sobre un total de 864) la política correspondiente y su escala de ruido de exploración (`@0.5` o `@1`).

No se indica en la información proporcionada el número de tokens, pasos de entorno, episodios ni horas de entrenamiento, ni si se emplearon técnicas de RLHF/DPO (no aplicables a este dominio). Tampoco se describe la función de recompensa, el preprocesado de observaciones ni la política de reinicio de episodios más allá del arranque desde estados previamente superados. La innovación técnica destacable es la integración con el juego real mediante un plugin BepInEx que expone el estado del juego a Python a través de un socket local, lo que permite entrenar e inferir sobre la versión comercial del título en lugar de sobre una reimplementación. La estrategia de encadenado de políticas por tramos, con reinicio desde estados exitosos, funciona como un currículo incremental.

## Capacidades

- Control motor de alta precisión en un entorno 2D con física continua: el agente maneja el movimiento del personaje mediante impulsos, sin scripting ni trayectorias pregrabadas durante la partida.
- Ejecución en partida continua desde el inicio de la ruta: las redes suben en solitario desde abajo, sin guardado ni carga, hasta aproximadamente la unidad 530 de 864.
- Ejecución fiable desde un punto avanzado: partiendo del mástil (unidad 745), completan el juego en 8 de 8 intentos.
- Encadenado multi-etapa: 27 políticas cooperan secuencialmente según el progreso de la ruta, coordinadas por `chain.json`.
- Control del ruido de exploración por política: cada tramo se ejecuta con una escala de ruido declarada (`@0.5` o `@1`), lo que permite ajustar determinismo frente a exploración en inferencia.
- Integración con software externo: se comunican con el juego real a través de un plugin BepInEx y un socket local, lo que permite lanzar la inferencia desde Python.
- Reproducción de episodios: el repositorio incluye `replay.mp4`, una grabación de 30 segundos en tiempo real cubriendo el tramo de progreso 308 a 413 (cajas y mobiliario hasta el tramo naranja), seleccionada como el mejor de 8 intentos desde ese estado.
- No dispone de tool calling, function calling, capacidades de agente conversacional, multilingüismo, visión, audio ni modo de razonamiento textual: esas categorías no son aplicables a un agente de RL sobre un videojuego.

## Casos de uso

- Investigación en RL jerárquico y aprendizaje por currículo: el conjunto de 27 políticas encadenadas por progreso de ruta es un banco de pruebas reproducible para estudiar la composición de políticas especializadas frente a una política monolítica, incluyendo el efecto de la escala de ruido por tramo.
- Estudio de integración agente-entorno en software propietario: el plugin BepInEx con socket local sirve como plantilla para conectar agentes Python a aplicaciones cerradas que no ofrecen API de automatización, un patrón reutilizable en investigación sobre videojuegos comerciales.
- Benchmark de control motor fino con física continua: la ruta de 864 unidades, con geometría irregular (cajas, mobiliario, tramo naranja) y penalización total por caída, ofrece un escenario de exploración difícil donde medir estabilidad y varianza entre ejecuciones.
- Generación de demostraciones para aprendizaje por imitación: los episodios grabados y los estados de arranque almacenados pueden reutilizarse como datos de partida para entrenar políticas con behavioral cloning o para inicializar nuevos experimentos.
- Pruebas de robustez y generalización de políticas: al disponer de políticas entrenadas por tramos con reinicio desde estados exitosos, se puede evaluar experimentalmente el sobreajuste a estados concretos midiendo el rendimiento al arrancar desde puntos intermedios no vistos.
- Automatización de speedruns y análisis de rutas: la ejecución determinista con ruido `@0.5` permite reproducir tramos de forma consistente, útil para estudiar rutas óptimas y comparar tiempos entre configuraciones de política.
- Docencia de aprendizaje por refuerzo: el repositorio es un ejemplo de extremo a extremo (entrenamiento con Stable-Baselines3, orquestación de políticas, despliegue contra el juego real) adecuado para cursos avanzados de RL aplicado.
- Desarrollo de herramientas de accesibilidad o asistencia en juegos con control difícil: el mismo esquema de observación por socket podría adaptarse a ayudas de control motor en títulos con mecánicas exigentes, aunque el repositorio no implementa esa función.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y similares no son aplicables a un agente de RL sobre un videojuego). Las únicas métricas reportadas son de progreso en la ruta:

| Métrica | Valor |
|---|---|
| Unidades totales de la ruta | 864 |
| Mejor progreso desde abajo, jugando en solitario | 542 unidades (alcanza el yunque, ~530) |
| Tasa de finalización desde el mástil (unidad 745) | 8 de 8 intentos |
| Tramo cubierto en `replay.mp4` | Progreso 308 a 413 (30 s en tiempo real) |
| Tasa de éxito de la partida completa desde el principio | No conseguida en el momento de publicación (octubre de 2026) |
| Comparación con agente de búsqueda con guardado/carga | El agente de búsqueda termina el juego; excluido del resultado de RL por el autor |
| Benchmarks estándar | No disponibles |

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada: ni GPU utilizadas para entrenamiento, ni VRAM, ni latencia o throughput medidos.
- VRAM para inferencia: no disponible. Como referencia indirecta, el repositorio completo con 27 políticas ocupa 0,1 GB, lo que sugiere políticas de tamaño reducido (del orden de pocos MB cada una), aunque este dato no está confirmado y es una inferencia a partir del tamaño del repositorio, no una especificación publicada.
- GPU recomendadas: no disponibles. Al ser políticas PPO de tipo perceptrón multicapa y no modelos de lenguaje, es plausible que la inferencia funcione en CPU, pero no hay confirmación en la información consultada.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: Stable-Baselines3 como librería de ejecución, junto con el plugin BepInEx y la comunicación por socket local con el juego. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato temporal es que el vídeo `replay.mp4` muestra 30 segundos en tiempo real de juego, lo que implica que la inferencia sostiene el ritmo del juego en ese tramo, sin cifras de pasos por segundo publicadas.
- Requisito de entorno: se necesita una copia legítima del juego *Getting Over It with Bennett Foddy* en Steam y el plugin BepInEx para poder ejecutar los agentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables publicados en la información consultada. Los únicos elementos de comparación internos son:

| Referencia | Descripción | Datos comparables |
|---|---|---|
| `miiwater/goi-rl` | 27 políticas PPO encadenadas, juego real, sin guardado | Alcanza la unidad 542 desde abajo; 8/8 desde la unidad 745 |
| Agente de búsqueda con guardado/carga (mismo proyecto) | Agente con búsqueda y guardado/carga, citado en la model card | Termina el juego; el autor lo excluye del resultado de RL |
| Otros agentes de RL sobre juegos comerciales | No disponibles en la información consultada | No disponible |

No se han encontrado en la búsqueda web modelos alternativos de la misma categoría con parámetros, contexto, licencia o métricas que permitan una comparación significativa: las coincidencias obtenidas corresponden a proyectos ajenos al ámbito del RL sobre videojuegos y no son relevantes para esta ficha.

## Limitaciones y advertencias

- Cobertura incompleta: desde el inicio de la ruta, las redes no terminan el juego; se quedan en torno a la unidad 530 de 864 (mejor marca 542). El resultado completo solo se logra arrancando desde el mástil, en la unidad 745.
- Dependencia de estados guardados: el entrenamiento arranca episodios desde estados ya superados, lo que cuestiona la generalización a la ruta completa de forma end-to-end.
- Fragmentación en 27 políticas: el sistema no es una política única; requiere el orquestador `chain.json` y reglas de conmutación por progreso, lo que añade fragilidad operativa y acoplamiento a los tramos concretos de la ruta.
- Dependencia de un juego propietario y de un plugin externo: la ejecución exige el juego de Steam y el plugin BepInEx con socket local, por lo que el agente no es reproducible ni evaluable sin ese entorno concreto.
- Licencia ambigua en la ficha consultada: la página de HuggingFace indica MIT según el resultado de búsqueda, mientras que los metadatos consultados marcan la licencia como "no disponible". Antes de cualquier uso comercial conviene verificar la licencia real del repositorio y, en todo caso, la del videojuego subyacente, que es independiente y propietaria.
- Ausencia de benchmarks y de métricas comparables: no hay cifras de pasos, episodios, horas de entrenamiento, tasa de éxito global ni comparaciones con líneas base, lo que impide valorar el coste computacional y la reprodubilidad del resultado.
- Adopción nula: 0 descargas y 1 like en el momento de la consulta, sin validación independiente de la comunidad.
- Limitaciones de alcance: al no ser un modelo de lenguaje, no existen sesgos lingüísticos, riesgo de alucinación textual, soporte multilingüe ni restricciones de contexto en el sentido habitual. El equivalente funcional es el fallo de política ante estados no vistos, que puede manifestarse como caídas o bloqueos sin recuperación.
- Riesgo de sobreajuste a estados de arranque: entrenar y evaluar desde puntos ya superados puede inflar el rendimiento aparente frente a una partida verdaderamente continua.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/miiwater/goi-rl
- Perfil del autor en HuggingFace: https://huggingface.co/miiwater
- Repositorio de código indicado en la model card: https://github.com/miwate/getting-over-it-rl
- Vídeo de demostración `replay.mp4`: incluido en el repositorio del modelo (https://huggingface.co/miiwater/goi-rl)
- Orquestador de políticas `chain.json`: incluido en el repositorio del modelo (https://huggingface.co/miiwater/goi-rl)
