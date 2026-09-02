# hwihwalab/lerobot-pusht-teleop

## Resumen

`hwihwalab/lerobot-pusht-teleop` es un entorno de simulación física 2D y una plataforma de teleoperación en tiempo real diseñada para el benchmark PushT de Hugging Face LeRobot. Desarrollado por Hwihwa Lab, este repositorio combina un motor de física de cuerpos rígidos basado en el teorema del eje separador (SAT), un cockpit de teleoperación con ratón y un sistema de recopilación de demostraciones compatible con el esquema de datos de LeRobot. Su objetivo es facilitar la generación de datos de demostración humana de alta calidad para entrenar políticas de aprendizaje por imitación, como Diffusion Policy o ACT, en el entorno PushT.

El proyecto destaca por su implementación 100 % en Python y JavaScript sin dependencias externas de C++, lo que permite ejecutarlo en cualquier entorno con Python o en un navegador web. Incluye un servidor FastAPI con WebSocket a 60 FPS, un cliente Pygame nativo y una demo interactiva en Hugging Face Spaces. El autor reporta un rendimiento de simulación de 174 348 FPS y una cobertura media de IoU del 80,54 % con un planificador heurístico de referencia, lo que subraya la necesidad de métodos de aprendizaje más avanzados para superar el 90 % de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simulador 2D de cuerpos rigidos con SAT, servidor FastAPI, cliente Web y Pygame |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles, coreano |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo fuente y datos JSON) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un entorno de simulacion y recopilacion de datos. La arquitectura se compone de tres capas principales: un motor de fisica 2D basado en el teorema del eje separador (SAT) que resuelve colisiones poligonales, impulso, friccion de Coulomb y torque rotacional; un servidor FastAPI que gestiona la logica de simulacion y la comunicacion por WebSocket a 60 Hz; y dos clientes de control: un cockpit web basado en Canvas 2D y un cliente Pygame nativo. El sistema incluye un evaluador de IoU en tiempo real para medir la cobertura del bloque T sobre la zona objetivo, asi como un motor de recompensa para aprendizaje por refuerzo con una funcion de recompensa por paso definida como `r_t = max(-0.1, Coverage_t - dist/1000)`.

El entorno sigue la distribucion estandar del benchmark `lerobot/pusht` con posiciones iniciales aleatorias del bloque. No se ha realizado entrenamiento de redes neuronales en este repositorio; su proposito es generar demostraciones humanas mediante teleoperacion y exportarlas en el esquema de dataset de LeRobot v2.0. El autor proporciona un planificador heuristico de referencia que alcanza una cobertura media de IoU del 80,54 % en 200 episodios, lo que evidencia la dificultad de superar el 90 % de precision sin metodos de aprendizaje avanzados.

## Capacidades

- Simulacion fisica 2D de cuerpos rigidos con deteccion de colisiones por SAT, impulso, friccion y torque.
- Teleoperacion en tiempo real mediante raton con control PD (Kp=0.28, Kd=0.12) sobre el efector final.
- Evaluacion de cobertura IoU en tiempo real con umbral de exito del 90 %.
- Recopilacion de demostraciones a 60 Hz con exportacion en formato JSON compatible con LeRobot.
- Grafico osciloscopio en tiempo real de los ultimos 100 pasos con linea guia del 90 %.
- Motor de recompensa para aprendizaje por refuerzo con recompensa acumulada.
- Ejecucion sin dependencias externas de C++ (solo Python y JavaScript).
- Demo interactiva en Hugging Face Spaces accesible desde el navegador.

## Casos de uso

- Generacion de datasets de demostracion para aprendizaje por imitacion: el entorno permite a un operador humano teleoperar el efector para empujar el bloque T hacia la zona objetivo, registrando pares estado-accion a 60 Hz. Estos datos pueden exportarse en el esquema LeRobot y usarse para entrenar politicas como Diffusion Policy o ACT.
- Evaluacion de politicas de control en el benchmark PushT: al ser compatible con la distribucion estandar de `lerobot/pusht`, permite comparar el rendimiento de diferentes algoritmos de aprendizaje por refuerzo o imitacion en un entorno controlado y reproducible.
- Prototipado rapido de algoritmos de planificacion de movimiento: el planificador heuristico incluido sirve como linea base para validar nuevas estrategias de control antes de pasar a simuladores mas complejos o robots reales.
- Investigacion en fisica de contacto y dinamica de cuerpos rigidos: el motor SAT con friccion y torque permite estudiar fenomenos de contacto en 2D sin necesidad de herramientas comerciales.
- Desarrollo de interfaces de teleoperacion para robotica: la arquitectura cliente-servidor con WebSocket puede adaptarse para controlar robots reales o simulados en otros entornos.
- Educacion y divulgacion en robotica y aprendizaje por refuerzo: al ser ligero y sin dependencias, es adecuado para cursos y talleres donde se necesite un entorno de simulacion sencillo y visual.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, basados en una evaluacion de 200 episodios con posiciones iniciales aleatorias del bloque:

| Metrica | Valor |
|---|---|
| Cobertura media de IoU (pico) | 0.8054 (80,54 % ± 6,2 %) |
| Cobertura maxima de IoU | 0.942 (94,2 %) |
| Rendimiento de simulacion fisica | 174 348 FPS |
| Latencia de control | < 0.01 ms por tick de fisica (60 Hz) |

Estos datos corresponden al planificador heuristico de referencia, no a un modelo entrenado. No se proporcionan resultados de politicas de aprendizaje en este repositorio.

## Requisitos de hardware

- El entorno es extremadamente ligero: no requiere GPU, ya que la simulacion es 2D y se ejecuta en CPU.
- Se recomienda un procesador moderno (cualquier CPU de los ultimos 10 años) para alcanzar los 60 FPS de teleoperacion en tiempo real.
- El cliente web funciona en cualquier navegador con soporte de Canvas 2D y WebSocket.
- El cliente Pygame requiere Python 3.8+ y la libreria Pygame instalada.
- Para el servidor FastAPI se necesitan `fastapi`, `uvicorn` y `websockets`.
- No se requieren tarjetas graficas dedicadas; el despliegue puede hacerse en un portatil convencional o en un servidor de bajo coste.
- La demo en Hugging Face Spaces se ejecuta en la infraestructura gratuita de Spaces (CPU).

## Comparativa con modelos similares

Este repositorio no es un modelo de lenguaje ni un modelo neuronal, sino un entorno de simulacion. Se puede comparar con otros simuladores de robotica 2D o entornos de benchmark:

| Caracteristica | lerobot-pusht-teleop | MuJoCo (PushT) | PyBullet (PushT) |
|---|---|---|---|
| Dimension | 2D | 2D/3D | 2D/3D |
| Dependencias externas | Ninguna (Python/JS puro) | C++ compilado | C++ compilado |
| Rendimiento | 174 348 FPS | ~10 000 FPS (tipico) | ~5 000 FPS (tipico) |
| Teleoperacion integrada | Si (raton, WebSocket) | No (requiere integracion) | No (requiere integracion) |
| Exportacion LeRobot | Nativa | Requiere adaptacion | Requiere adaptacion |
| Licencia | MIT | Apache 2.0 | MIT |

La principal ventaja de este proyecto es su simplicidad y cero dependencias, lo que facilita su uso en entornos educativos y de prototipado rapido. Sin embargo, carece de las capacidades 3D y de los modelos de contacto avanzados de MuJoCo o PyBullet.

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico: no contiene pesos entrenados ni puede realizar inferencia por si mismo. Es un entorno de simulacion y recopilacion de datos.
- Limitado a fisica 2D: no es adecuado para tareas que requieran dinamica 3D o interacciones complejas con multiples objetos.
- El planificador heuristico de referencia no alcanza el umbral de exito del 90 % de IoU de forma consistente (media del 80,54 %), lo que indica que se necesitan politicas aprendidas para tareas de alta precision.
- La teleoperacion con raton puede ser menos precisa que con dispositivos hapticos o joysticks, lo que podria afectar a la calidad de las demostraciones recogidas.
- La documentacion esta disponible solo en ingles y coreano; no hay version en espanol.
- El repositorio no incluye politicas preentrenadas ni ejemplos de entrenamiento de Diffusion Policy o ACT, aunque es compatible con el ecosistema LeRobot.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en aplicaciones de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/lerobot-pusht-teleop
- Demo interactiva en Spaces: https://huggingface.co/spaces/hwihwalab/lerobot-pusht-teleop
- Repositorio en GitHub: https://github.com/Hwihwa-Lab/lerobot-pusht-teleop
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset PushT de LeRobot: https://huggingface.co/datasets/lerobot/pusht
