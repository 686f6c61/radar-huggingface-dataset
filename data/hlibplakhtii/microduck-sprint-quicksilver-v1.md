# HlibPlakhtii/microduck-sprint-quicksilver-v1

## Resumen

microduck-sprint-quicksilver-v1 es una política de control para robótica simulada, publicada por HlibPlakhtii como variante de competición del modelo jrubiosainz/microduck-game-sprinter-remix11. No es un modelo de lenguaje: es una política neuronal exportada a ONNX que controla un robot cuadrúpedo (microduck) dentro del simulador MuJoCo, con el objetivo de completar un recorrido de sprint a una velocidad de consigna de 0,2 m/s. El repositorio es de tamano practicamente nulo (0,0 GB) y acumula 17 descargas desde su publicacion el 29 de octubre de 2026.

La innovacion del modelo es acotada y explicita: conserva la red de respaldo y todos los operadores de grafo originales del modelo base, y anade una tabla de consulta (lookup) de observaciones que, cuando coincide con las observaciones registradas, reproduce una secuencia de acciones articulares previamente optimizada. Para el resto de observaciones se delega en el controlador original. La secuencia se optimizo localmente con CMA-ES separable contra el evaluador oficial de la Microduck Arena, sin modificar el evaluador, la fisica ni los datos del leaderboard.

Es relevante ahora como ejemplo de politica de competicion in-sample: el autor declara abiertamente que esta optimizada para las posiciones de salida declaradas y que no constituye una demostracion de locomocion general ni un controlador apto para robot real. Su interes tecnico esta en el metodo (optimizacion de trayectorias con CMA-ES sobre un evaluador fijo) y en la trazabilidad de los artefactos de reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica exportada a ONNX (grafo original del modelo base preservado, con lookup de observaciones anadido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan niveles de cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de jrubiosainz/microduck-game-sprinter-remix11 y mantiene intacta su red de respaldo y todos los operadores de grafo originales. Sobre esa base se incorpora un mecanismo de lookup: cuando las observaciones de entrada coinciden con las registradas durante la busqueda, el modelo reproduce una secuencia de objetivos articulares (joint-target sequence) previamente buscada; en caso contrario, la inferencia recae en el controlador original. No se documenta el numero de parametros de la red ni la composicion de los datos de entrenamiento del modelo base.

El entrenamiento de la nueva secuencia no es un entrenamiento neuronal convencional: se trata de una optimizacion de trayectoria con CMA-ES separable ejecutada localmente contra el evaluador no modificado de la Microduck Arena. El entorno de evaluacion declarado es runner version 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1. El autor reporta una media local de cinco arranques de 0,821 s con 5/5 finalizaciones a una consigna de 0,2 m/s, y senala que el resultado del servidor es el autoritativo. Los artefactos de reproduccion incluidos son `search_race.py`, `search-config.json`, `searched-actions.npz` y `local-verification.json`; la secuencia almacenada puede reproducirse a traves del runner de la Arena y superponerse sobre el modelo base fijado mediante `Recorder` y `overlay` del script suministrado.

## Capacidades

- Control de locomocion de un robot cuadrupedo simulado en MuJoCo para una tarea de sprint a 0,2 m/s de consigna.
- Reproduccion de una secuencia de objetivos articulares optimizada cuando las observaciones coinciden con las registradas.
- Fallback al controlador original del modelo base para observaciones no coincidentes.
- Ejecucion en inferencia mediante ONNX Runtime, con integracion en el runner de la Microduck Arena.
- Reproduccion y verificacion local de la secuencia mediante los artefactos incluidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Participacion en la Microduck Arena: la politica puede enviarse al evaluador de la competicion para obtener una puntuacion de sprint; esta disenada especificamente para ese entorno y ese runner.
- Estudio de optimizacion de trayectorias con CMA-ES: los artefactos `search_race.py` y `search-config.json` sirven como referencia reproducible de como optimizar una secuencia de acciones contra un evaluador fijo.
- Verificacion local de politicas: el script suministrado permite reproducir la secuencia a traves del runner y superponerla sobre el modelo base, util para validar resultados antes de enviarlos al servidor.
- Analisis de sobreajuste in-sample: el modelo es un caso de estudio de politica optimizada para posiciones de salida concretas, util para discutir generalizacion en competiciones de simulacion.
- Base para experimentos de lookup hibrido: el patron de anadir una tabla de consulta sobre una red existente sin tocar sus operadores puede replicarse en otras tareas de control simulado.
- Docencia sobre control de robots simulados: sirve para ilustrar el pipeline completo (MuJoCo, ONNX Runtime, evaluador de Arena) con un ejemplo de tamano minimo y licencia permisiva.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Media de cinco arranques locales | 0,821 s | 5/5 finalizaciones, consigna 0,2 m/s |
| Tasa de finalizacion local | 5/5 | Arranques declarados en la evaluacion local |
| Resultado en servidor | no disponible | El autor indica que el resultado del servidor es el autoritativo |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y la politica es de tipo ONNX, por lo que la huella deberia ser minima, pero no se documentan cifras.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: ONNX Runtime 1.24.4 (version declarada para la evaluacion), junto con MuJoCo 3.10.0 y el runner version 5 de la Microduck Arena; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-quicksilver-v1 | Politica de control ONNX con lookup | no disponible | no aplica | Apache 2.0 | HuggingFace (17 descargas) |
| jrubiosainz/microduck-game-sprinter-remix11 | Politica de control (modelo base) | no disponible | no aplica | no disponible | HuggingFace |
| Otras politicas de la Microduck Arena | Politicas de control para simulacion | no disponible | no aplica | no disponible | HuggingFace Spaces de la Arena |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Politica in-sample: el lookup se optimizo para las posiciones de salida declaradas; no hay garantia de comportamiento correcto en otras condiciones iniciales.
- Solo simulacion: el autor declara explicitamente que no es una demostracion de locomocion general ni un controlador seguro para operacion en robot real.
- Dependencia del evaluador: los resultados locales (0,821 s, 5/5) no son autoritativos; el resultado del servidor prevalece.
- Sin datos de sesgo ni alucinacion aplicables: al no ser un modelo de lenguaje, no procede evaluar sesgos linguisticos, pero tampoco existen garantias de robustez fuera del dominio de evaluacion.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el propio autor desaconseja el uso fuera de la competicion simulada.
- Trazabilidad limitada: no se documentan parametros, datos de entrenamiento del modelo base ni metricas de generalizacion.
- Repositorio de 0,0 GB y 17 descargas: ecosistema muy reducido, sin validacion independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v1
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix11/tree/3b87d091f8260d8b703821d4412140b9d657e19b
- Evaluador de la Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
