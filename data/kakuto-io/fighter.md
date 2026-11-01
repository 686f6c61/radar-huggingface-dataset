# kakuto-io/fighter

## Resumen

Kakuto fighter es una política de aprendizaje por refuerzo (reinforcement learning) que controla un humanoide simulado capaz de ejecutar técnicas de Muay Thai. Lo desarrolla Kakuto Technology GK bajo el identificador `kakuto-io/fighter` en HuggingFace. No es un modelo de lenguaje: es un controlador neuronal entrenado con PPO en el simulador físico MuJoCo que mantiene una guardia de Muay Thai, camina y hace fintas, bloquea y ejecuta 14 técnicas distintas (jab, cross, hooks de mano adelantada y retrasada, uppercuts, cross al cuerpo, contras de tracción, patadas altas, rodillazos y codazos).

El checkpoint publicado es `distill9-196.6M`, resultado de 196,6 millones de pasos de entorno y de un proceso de destilación desde políticas maestras especializadas por habilidad. La red es un MLP de dos capas ocultas de 512 unidades con activación ELU, con 465 observaciones de entrada y 48 acciones de salida sobre un cuerpo denominado `muscular-fast` con 48 actuadores.

Su relevancia práctica es acotada pero concreta: el repositorio incluye todo lo necesario para ejecutar la política en el navegador mediante MuJoCo compilado a WebAssembly, lo que convierte el modelo en una demo interactiva de control motor aprendido y en un punto de partida para investigación en lococión y combate simulado. La licencia es propietaria y restrictiva (todos los derechos reservados), lo que limita seriamente su reutilización comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 2 capas ocultas de 512 unidades y activación ELU; política de RL entrenada con PPO y destilada |
| Parámetros totales | no disponible (el nombre del checkpoint indica 196,6 M pasos de entorno, no parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de 465 observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en formato binario propio, `fighter.bin`) |
| Idiomas soportados | no aplica (modelo de control motor, sin capacidades lingüísticas) |
| Licencia | all-rights-reserved (Kakuto Technology GK); el motor MuJoCo incluido es Apache 2.0 |
| Formato de pesos | binario propio (`fighter.bin`) más tablas de referencia comprimidas (`punches.bin.gz`, `walk.bin.gz`); modelo físico en MJCF (`fighter.xml`) |

## Arquitectura y entrenamiento

La política es una red neuronal de tipo MLP con dos capas ocultas de 512 unidades y activación ELU. Recibe 465 observaciones por paso y emite 48 acciones que se mapean a los 48 actuadores del cuerpo `muscular-fast` en MuJoCo. El entrenamiento se realizó con PPO (Proximal Policy Optimization) sobre el simulador físico, acumulando 196,6 millones de pasos de entorno en el checkpoint final (`distill9-196.6M`).

El aspecto técnico más destacable es el esquema de destilación: en lugar de entrenar una única política monolítica para las 14 técnicas, se entrenaron políticas maestras por habilidad y la política publicada es un estudiante destilado que las integra. El comportamiento depende además de tablas de referencia externas (`punches.bin.gz` y `walk.bin.gz`), que se cargan bajo demanda al usar por primera vez una técnica o la locomoción. El autor advierte explícitamente que la observación la construye el código del entorno de la demo, de modo que los pesos por sí solos no reproducen el comportamiento.

## Capacidades

- Control motor de un humanoide simulado en MuJoCo con 48 actuadores.
- Mantenimiento de guardia de Muay Thai y desplazamiento (caminar y hacer fintas o dashes).
- Bloqueo defensivo.
- Ejecución de 14 técnicas de golpeo: jab, cross, hooks de mano adelantada y retrasada, uppercuts, cross al cuerpo, contra de tracción, patadas altas, rodillazos y codazos.
- Ejecución en navegador mediante MuJoCo compilado a WebAssembly, con cómputo íntegro en el dispositivo del usuario.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo generativo de texto.

## Casos de uso

- Demo interactiva en navegador: la página oficial carga MuJoCo en WebAssembly y la política desde el directorio `web/` del repositorio, permitiendo probar el combatiente sin instalar nada y sin enviar datos a un servidor.
- Investigación en lococión de humanoides: el checkpoint sirve como referencia de política destilada para estudiar cómo se integran habilidades especializadas en un único estudiante.
- Estudio de destilación de políticas en RL: la estructura de políticas maestras por habilidad y un estudiante final ofrece un caso concreto para analizar pérdida de fidelidad y cobertura de habilidades.
- Prototipado de entornos de combate simulado: el modelo MJCF (`fighter.xml`) y las tablas de técnicas permiten construir escenarios de sparring o evaluación de agentes rivales en MuJoCo.
- Docencia y divulgación de RL: el despliegue en WebAssembly facilita demostraciones en clase o en artículos sin infraestructura de GPU.
- Benchmarking de controladores: al estar acotado a 14 técnicas y un cuerpo concreto, sirve como referencia reproducible para comparar políticas de control motor en tareas de combate simulado.
- Integración en pipelines de simulación a mayor escala: el formato binario y las tablas comprimidas permiten cargar la política en un bucle de simulación nativo de MuJoCo para experimentos por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en navegador: la demo oficial ejecuta MuJoCo 3.16.0 compilado a WebAssembly y la política en el dispositivo del usuario; el requisito es un navegador compatible con WebAssembly, sin GPU dedicada especificada.
- Inferencia nativa: al ser un MLP de dos capas de 512 unidades con 465 entradas y 48 salidas, la carga computacional de la red es mínima; el coste dominante es la simulación física de MuJoCo, no la política.
- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se publican requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño de la red, cualquier CPU moderna debería bastar para la política, pero el autor no lo especifica.
- Opciones de despliegue: navegador con WebAssembly (demo oficial) y MuJoCo nativo con el modelo MJCF y los ficheros binarios del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kakuto fighter | MLP de control (RL) | 465 observaciones / 48 acciones | PPO + destilación, 196,6 M pasos | all-rights-reserved | HuggingFace + demo web |
| Políticas humanoides de MuJoCo (p. ej. las de referencia del propio simulador) | Políticas de control (RL) | Variable según tarea | PPO u otros algoritmos | Apache 2.0 en los ejemplos del proyecto MuJoCo | Repositorio de MuJoCo |
| Políticas de locomotion benchmarks (p. ej. suites de locomoción de humanoides) | Políticas de control (RL) | Variable según tarea | PPO u otros algoritmos | Variable según el proyecto | Repositorios académicos |

No se dispone de datos de rendimiento comparables publicados para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia all-rights-reserved de Kakuto Technology GK: no se permite uso comercial ni redistribución sin autorización expresa; el motor MuJoCo incluido es la única parte con licencia permisiva (Apache 2.0).
- Los pesos por sí solos no reproducen el comportamiento: la observación la construye el código del entorno de la demo, que no forma parte del repositorio como código fuente documentado.
- Dependencia de tablas externas (`punches.bin.gz`, `walk.bin.gz`) que se cargan bajo demanda; sin ellas no se ejecutan las técnicas ni la locomoción.
- Ámbito muy restringido: 14 técnicas y un cuerpo concreto (`muscular-fast`); no generaliza a otros humanoides ni a otras tareas sin reentrenamiento.
- Sin datos publicados de robustez, sesgos ni tasas de fallo; el autor no documenta evaluaciones cuantitativas.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento simbólico, por lo que no debe evaluarse con métricas de LLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado.
- Fecha de creación registrada en 2026-11-01, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia del enlace y del checkpoint antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kakuto-io/fighter
- Demo en navegador: https://ai.kakuto.io/en/try/
- Página del proyecto con detalles de entrenamiento, vídeos y costes: https://ai.kakuto.io
- MuJoCo: https://mujoco.org
