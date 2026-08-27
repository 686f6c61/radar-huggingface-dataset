# LinJinwei/XY-VLA

## Resumen

XY-VLA es un sistema de navegación para vehículos aéreos no tripulados (UAV) guiado por lenguaje natural, desarrollado por LinJinwei como código de acompañamiento del paper "XY-VLA: Zero-Shot Cross-Embodiment UAV VLA via X-VLA". El proyecto demuestra cómo un modelo visión-lenguaje-acción (VLA) entrenado originalmente para un brazo robótico WidowX puede transferirse a un dron virtual en el simulador PyBullet sin necesidad de reentrenamiento, gracias a la semántica de acción EE6D y un stack de navegación de tres fases.

El sistema se construye sobre el modelo base X-VLA 0.9B (WidowX Edition), que proporciona planificación gruesa a partir de instrucciones en lenguaje natural. Sobre esta base, XY-VLA añade una fase de planificación A* en rejilla top-down y un refinamiento de trayectoria consciente de la acción, permitiendo ejecutar misiones complejas como atravesar portales numerados, orbitar marcos o volar rutas multi-etapa. El repositorio incluye un entorno de simulación con 20 portales rectangulares, obstáculos y grabación de vídeo multi-vista.

La relevancia actual de XY-VLA reside en su enfoque de cero disparo (zero-shot) para el cambio de embodiment, un problema central en robótica y sistemas autónomos. Al demostrar que un modelo VLA entrenado para manipulación puede controlar un UAV en simulación, abre vías para reutilizar modelos existentes en nuevas plataformas sin costosos procesos de recolección de datos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en X-VLA 0.9B (WidowX Edition) con semantica de accion EE6D |
| Parametros totales | 0.9B (segun el nombre del modelo base X-VLA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) y archivos de configuracion |

## Arquitectura y entrenamiento

XY-VLA no es un modelo entrenado desde cero, sino un sistema que integra el modelo X-VLA 0.9B (WidowX Edition) con un stack de navegacion de tres fases. La primera fase utiliza X-VLA para generar una trayectoria gruesa a partir de instrucciones en lenguaje natural, interpretando la escena visual y produciendo acciones EE6D (pose de efector final con 6 grados de libertad). La segunda fase convierte esa trayectoria gruesa en una rejilla top-down y aplica un algoritmo A* con obstaculos conscientes de portales para encontrar una ruta viable. La tercera fase refina la trayectoria por objeto, ajustando la ruta a las restricciones de cada portal y generando esferas de retroalimentacion translucidas para visualizacion.

El modelo base X-VLA 0.9B es un VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, entrenado para controlar un brazo WidowX. En XY-VLA, este modelo se utiliza de forma cero disparo para controlar un UAV virtual, lo que implica que las acciones EE6D se reinterpretan como comandos de vuelo. No se proporcionan datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible.

## Capacidades

- Navegacion guiada por lenguaje natural: acepta instrucciones como "Fly through only the rectangular portal marked billboard_id=3" y las traduce en trayectorias de vuelo.
- Misiones multi-clausula: soporta cadenas de comandos con conectores "then" y ";", permitiendo misiones de multiples etapas como "Pass through portal billboard number 2 then pass through portal billboard number 3".
- Cinco acciones basicas: pass-through (atravesar), fly-by (sobrevolar), orbit (orbitar), hover (flotar) y collision (colision, para depuracion).
- Planificacion de tres fases: combinacion de planificacion gruesa X-VLA, A* en rejilla y refinamiento por objeto.
- Modos de ejecucion flexibles: bucle cerrado con inferencia paso a paso, o planificacion gruesa de una sola pasada con reproduccion de simulacion sin inferencia.
- Entorno de simulacion rico: 20 portales rectangulares numerados en anillos superior e inferior con inclinacion aleatoria, cubos, rampas y obstaculos locales.
- Grabacion y visualizacion: generacion de MP4/GIF multi-vista, superposiciones top-down, retroalimentacion de color en fase 3 y GUI opcional.
- Esquemas configurables: presets en config.json para depuracion GUI, ejecuciones por lotes rapidas y reproduccion de demos.

## Casos de uso

- Investigacion en VLA cross-embodiment: permite estudiar como un modelo entrenado para manipulacion se comporta al controlar un UAV, sin necesidad de hardware fisico. Se usaria ejecutando el script run_xyVLA.py con diferentes comandos y analizando las trayectorias generadas.
- Validacion de planificacion de rutas en entornos simulados: el stack de tres fases (X-VLA + A* + refinamiento) puede evaluarse en escenarios con portales y obstaculos, midiendo exito, tiempo de planificacion y suavidad de trayectoria.
- Generacion de datos sinteticos para entrenamiento de politicas UAV: las grabaciones multi-vista y las trayectorias generadas pueden servir como datos de demostracion para entrenar otros modelos de control.
- Pruebas de interpretacion de lenguaje natural en robotica: el sistema permite probar como instrucciones complejas ("fly a figure-eight path") se descomponen en acciones de vuelo, util para evaluar la comprension semantica del modelo base.
- Desarrollo de demos educativas: el entorno PyBullet con GUI y grabacion de GIF es adecuado para cursos de robotica o vision por computador, mostrando integracion VLA en un entorno accesible.
- Benchmarking de modelos VLA en tareas de navegacion aerea: al ser configurable via config.json, puede adaptarse para comparar diferentes checkpoints de X-VLA u otros modelos VLA en la misma tarea de portales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye grabaciones de pruebas cualitativas (atravesar portales, volar figuras en el aire) pero no tablas con metricas cuantitativas como tasa de exito, tiempo de planificacion o precision de trayectoria.

## Requisitos de hardware

- Python 3.10 (conda recomendado) y Anaconda o Miniconda.
- GPU CUDA recomendada para inferencia de X-VLA; CPU funciona para pruebas de humo (smoke tests).
- No se especifica VRAM minima ni GPUs concretas en la informacion disponible.
- El repositorio incluye scripts de instalacion que crean un entorno conda con PyTorch y dependencias.
- Los pesos del modelo X-VLA deben descargarse por separado (por ejemplo, desde Hugging Face con huggingface-cli) y colocarse en el directorio xVLAModel/.
- Opciones de despliegue: el sistema arranca un servidor X-VLA local automaticamente cuando esta habilitado en config.json; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos VLA o sistemas de navegacion para UAV. El proyecto se basa en X-VLA 0.9B, pero no se ofrecen datos comparativos con alternativas como OpenVLA, RT-2 o modelos especificos de drones.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el codigo o los pesos pueden usarse comercialmente; se recomienda contactar al autor antes de cualquier uso en produccion.
- Dependencia de pesos externos: el modelo X-VLA 0.9B debe descargarse por separado; el repositorio no incluye los pesos, solo el codigo de integracion.
- Entorno limitado a simulacion: el sistema funciona exclusivamente en PyBullet; no hay soporte para hardware real de UAV en la informacion disponible.
- Idiomas no documentados: aunque los ejemplos usan ingles, no se especifica que idiomas soporta el modelo base para instrucciones.
- Riesgo de alucinacion en planificacion: como cualquier VLA, X-VLA puede generar trayectorias incoherentes si la instruccion es ambigua o la escena es compleja; el stack A* mitiga parcialmente este riesgo pero no lo elimina.
- Sin benchmarks publicados: no hay metricas cuantitativas que permitan evaluar la fiabilidad del sistema en condiciones variadas.
- Fecha de creacion futura: el repositorio se creo en agosto de 2026, lo que sugiere que es un proyecto muy reciente y posiblemente en fase de desarrollo activo.

## Enlaces

- HuggingFace: https://huggingface.co/LinJinwei/XY-VLA
- GitHub: https://github.com/lin-jinwei/XY-VLA
- Repositorio X-VLA (modelo base): https://github.com/2toINF/X-VLA
