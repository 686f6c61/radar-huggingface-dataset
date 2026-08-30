# JackieMM/RoboTwin

## Resumen

RoboTwin es una plataforma de manipulacion robotica bimanual desarrollada por un equipo multiinstitucional liderado por investigadores de la Universidad Jiao Tong de Shanghai, que incluye a Yao Mu, Tianxing Chen y Ping Luo. El proyecto aborda dos problemas criticos en robotica: la escasez de datos de entrenamiento de alta calidad y la falta de benchmarks estandarizados para manipulacion bimanual. La version 2.0, presentada en 2025, integra un generador de datos escalable con un benchmark de 50 tareas bimanuales, incorporando domain randomization para mejorar la robustez de las politicas entrenadas.

A diferencia de un modelo de lenguaje o vision convencional, RoboTwin no es un unico modelo de pesos, sino un ecosistema completo que incluye un generador de datos sinteticos basado en gemelos digitales, un benchmark de evaluacion, y un conjunto de herramientas para entrenar y evaluar modelos vision-language-action (VLA). La plataforma ha sido validada en competiciones academicas, obteniendo el premio Best Paper en el ECCV Workshop 2024 y un Outstanding Poster en ChinaSI 2025, y cuenta con un leaderboard publico para comparar resultados entre equipos.

La relevancia actual de RoboTwin radica en que proporciona una infraestructura estandarizada para la comunidad de robotica, permitiendo a investigadores generar datos sinteticos a escala, entrenar politicas de manipulacion bimanual y evaluarlas en entornos simulados con alta fidelidad. Su compatibilidad con frameworks populares como IsaacLab y su soporte para modelos VLA lo convierten en una herramienta de referencia para el desarrollo de robots humanoides y sistemas de manipulacion dual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plataforma de robotica (no es un modelo unico; incluye generador de datos, benchmark y soporte para VLA) |
| Parametros totales | No aplica (depende del modelo VLA usado, ej. pi05 con 30000 checkpoints) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (para los checkpoints del modelo VLA asociado) |
| Formato de pesos | Checkpoints de modelos VLA (formato no especificado) |

## Arquitectura y entrenamiento

RoboTwin 2.0 se estructura como un pipeline de tres componentes interconectados. El primero es un generador de datos basado en gemelos digitales, que utiliza un agente de modelo de lenguaje multimodal para sintetizar programas de tareas automaticamente. Este agente interpreta descripciones de alto nivel y genera secuencias de acciones validas, que luego se ejecutan en entornos simulados con configuraciones de doble brazo flexibles. El segundo componente es el benchmark en si, que define 50 tareas bimanuales con domain randomization, es decir, variaciones sistematicas en iluminacion, texturas, posiciones de objetos y propiedades fisicas para forzar la generalizacion de las politicas entrenadas.

El tercer componente es el conjunto de datos RoboTwin-OD, que recopila las demostraciones generadas. En cuanto al entrenamiento, RoboTwin no prescribe un modelo especifico, sino que es compatible con arquitecturas VLA como OpenPI (pi05). Los checkpoints publicados en HuggingFace corresponden a un modelo pi05 entrenado durante 30000 pasos con datos de RoboTwin. La innovacion clave reside en el proceso de generacion de datos: el uso de un LLM como agente sintetizador de programas elimina la necesidad de teleoperacion humana, reduciendo el coste de recopilacion de datos en varios ordenes de magnitud. La domain randomization, por su parte, es la principal responsable de la robustez observada en entornos no vistos, un aspecto que los benchmarks anteriores como RLBench o MetaWorld no abordaban de forma sistematica.

## Capacidades

- Generacion automatica de datos de entrenamiento para manipulacion bimanual mediante un agente LLM multimodal que sintetiza programas de tareas.
- Benchmark con 50 tareas bimanuales, que cubren operaciones como ensamblaje, apilado, insercion y manipulacion de objetos deformables.
- Domain randomization integrada, que permite evaluar la robustez de politicas ante variaciones de iluminacion, texturas, posiciones y propiedades fisicas.
- Compatibilidad con modelos vision-language-action (VLA) como OpenPI, permitiendo entrenar y evaluar politicas de manipulacion.
- Soporte para multiples frameworks de simulacion, incluyendo IsaacLab y RLinf, con ramas de codigo dedicadas.
- Leaderboard publico para comparar resultados entre equipos y metodologias.
- Integracion con RMBench, un benchmark de manipulacion dependiente de memoria construido sobre RoboTwin 2.0.
- Soporte para competiciones academicas, incluyendo el RoboTwin Dual-Arm Collaboration Challenge en CVPR 2025.

## Casos de uso

- Investigacion en manipulacion robotica bimanual: los laboratorios pueden generar datasets sinteticos a escala sin necesidad de hardware robotico fisico, reduciendo costes y acelerando la iteracion experimental.
- Desarrollo de modelos VLA: RoboTwin proporciona datos de entrenamiento y un entorno de evaluacion estandarizado para modelos como OpenPI o StarVLA, permitiendo comparar arquitecturas en igualdad de condiciones.
- Validacion de robustez en robotica: gracias a la domain randomization, los investigadores pueden testear la generalizacion de sus politicas ante variaciones del entorno antes de desplegarlas en el mundo real.
- Competiciones academicas y desafios: RoboTwin organiza challenges en conferencias como CVPR, proporcionando un marco comun para que equipos de todo el mundo compitan en tareas de manipulacion bimanual.
- Entrenamiento de politicas para robots humanoides: la configuracion de doble brazo es directamente relevante para sistemas robotizados con estructura anatomica similar a la humana, como los robots de servicio o asistencia.
- Generacion de datos para simulacion a escala: el agente LLM integrado permite sintetizar programas de tareas automaticamente, lo que facilita la creacion de grandes volumenes de demostraciones para entrenamiento por imitacion o reinforcement learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La plataforma cuenta con un leaderboard publico en su sitio web oficial, pero los datos especificos de rendimiento de los modelos entrenados con RoboTwin (como el checkpoint pi05 de 30000 pasos) no estan detallados en la informacion proporcionada. Se recomienda consultar el leaderboard en https://robotwin-platform.github.io/leaderboard para obtener metricas actualizadas de los equipos participantes.

## Requisitos de hardware

- La plataforma en si es un entorno de software que se ejecuta sobre motores de simulacion fisica como IsaacLab, por lo que los requisitos de hardware dependen de la configuracion de simulacion elegida.
- Para la simulacion de entornos con doble brazo y fisica realista, se recomienda una GPU con al menos 8 GB de VRAM para escenas simples y 16 GB o mas para escenas complejas con multiples objetos.
- Para el entrenamiento de modelos VLA como pi05, se requiere una GPU de gama alta: una RTX 4090 (24 GB VRAM) es el minimo recomendado para checkpoints de 30000 pasos; para escalar a modelos mayores se necesitarian GPUs profesionales como A100 o H100.
- El checkpoint pi05 de RoboTwin esta disponible en HuggingFace y puede ejecutarse en GPUs consumer de 24 GB con cuantizacion, aunque el rendimiento optimo se obtiene en hardware profesional.
- Para despliegue en produccion, se recomienda usar frameworks de inference como vLLM o TGI, aunque la plataforma RoboTwin no incluye documentacion especifica sobre despliegue de modelos entrenados.

## Comparativa con modelos similares

| Caracteristica | RoboTwin 2.0 | RLBench | MetaWorld |
|---|---|---|---|
| Enfoque | Manipulacion bimanual | Manipulacion con un solo brazo | Manipulacion con un solo brazo |
| Numero de tareas | 50 | 100+ | 50 |
| Domain randomization | Si, integral | Limitada | No |
| Generacion automatica de datos | Si, mediante agente LLM | No | No |
| Compatibilidad VLA | Si | Parcial | No |
| Licencia | Apache 2.0 | MIT | MIT |
| Publicacion | ICML 2026 (en revision) | CoRL 2020 | CoRL 2019 |

## Limitaciones y advertencias

- RoboTwin es una plataforma de simulacion; las politicas entrenadas en ella pueden no transferirse directamente al mundo real sin un proceso de domain adaptation adicional.
- La generacion de datos mediante agentes LLM puede introducir sesgos en las demostraciones, dependiendo de las instrucciones y los datos de entrenamiento del propio LLM.
- El benchmark se centra exclusivamente en manipulacion bimanual; no cubre otras capacidades roboticas como navegacion o manipulacion movil.
- La licencia Apache 2.0 se aplica a los checkpoints del modelo VLA asociado, pero la plataforma en si puede tener restricciones adicionales no documentadas.
- La documentacion disponible esta principalmente en ingles y chino; no hay soporte oficial en castellano.
- La plataforma requiere conocimientos solidos de robotica, simulacion y aprendizaje por refuerzo para su uso efectivo; la curva de aprendizaje es pronunciada.
- No se proporcionan datos de rendimiento en terminos de latencia o throughput para la generacion de datos, lo que dificulta la estimacion de costes computacionales.

## Enlaces

- HuggingFace (modelo principal): https://huggingface.co/JackieMM/RoboTwin
- HuggingFace (checkpoints pi05): https://huggingface.co/JackieMM/RoboTwin-pi05-30000-checkpoints
- Pagina web oficial: https://robotwin-platform.github.io/
- Documentacion 2.0: https://robotwin-platform.github.io/doc/
- Leaderboard: https://robotwin-platform.github.io/leaderboard
- GitHub (repositorio principal): https://github.com/RoboTwin-Platform/RoboTwin
- GitHub (RMBench): https://github.com/RoboTwin-Platform/RMBench
- Paper 2.0 (arXiv 2506.18088): https://arxiv.org/abs/2506.18088
- Paper CVPR 2025 Challenge (arXiv 2506.23351): https://arxiv.org/abs/2506.23351
- Paper 1.0 (arXiv 2504.13059): https://arxiv.org/abs/2504.13059
- Paper Early Version (arXiv 2409.02920): https://arxiv.org/abs/2409.02920
