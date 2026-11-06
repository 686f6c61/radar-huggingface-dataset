# realhandinc/realhand-teleop

## Resumen

RealHand Teleop es un paquete de software y activos de robotica para teleoperar el robot bimanual RealHand P7 equipado con manos diestras RealHand L6, O6 o L20, utilizando un casco PICO 4 Ultra. Lo desarrolla realhandinc y se distribuye a traves de HuggingFace con el pipeline `robotics`. No se trata de un modelo de lenguaje ni de un modelo de IA con pesos entrenados: es un bundle de integracion para NVIDIA Isaac Sim, Isaac Lab e Isaac Teleop que incluye activos USD del robot, URDF y mallas de las manos, escenas de inspeccion y kitting, y scripts de lanzamiento y calibracion.

El paquete resuelve el problema de conectar un dispositivo XR comercial (PICO 4 Ultra via OpenXR y CloudXR) con un simulador fisicamente realista (Isaac Sim 6.0.0.1 sobre Isaac Lab `release/3.0.0-beta2`) para generar trayectorias de teleoperacion bimanual con manos diestras de multiples grados de libertad. Soporta tres modos de entrada: controladores PICO, seguimiento de manos OpenXR de 26 articulaciones y guantes RealForce FFG, combinables con tres modelos de mano.

Es relevante para equipos de robotica que necesiten recolectar demostraciones de manipulation diestra, validar cinematica inversa de doble brazo basada en Pink o prototipar celdas de trabajo de inspeccion y kitting sin depender de hardware fisico. El repositorio ocupa 0,2 GB y no contiene pesos de modelos preentrenados, runtimes de NVIDIA ni el SDK externo FFG, que deben instalarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (bundle de software y activos de robotica para Isaac Sim / Isaac Lab / Isaac Teleop) |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 y BSD-3-Clause (`apache-2.0-and-bsd-3-clause`, con campo `license: other` en la model card) |
| Formato de pesos | No aplica; activos en USD (Isaac Lab), URDF y mallas para las manos L6, O6 y L20 |
| Tamano del repositorio | 0,2 GB |
| Robot soportado | RealHand P7 bimanual (14 articulaciones de brazo) |
| Manos soportadas | RealHand L6, O6 y L20 |
| Dispositivo XR | PICO 4 Ultra via OpenXR |
| Modos de entrada | `controller`, `handtracking`, `controller_ffg` |
| Version de Isaac Sim probada | 6.0.0.1 |
| Version de Isaac Lab probada | `release/3.0.0-beta2` (commit `1a88953ca1cd246feebb9e33b8d381c2c0b4736d`, metadatos de paquete 6.1.5) |
| Version de Isaac Teleop probada | 1.3.105rc1 |
| Sistema operativo probado | Ubuntu 24.04.4 LTS |
| Python probado | 3.12.3 |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 3 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento en este repositorio. Se trata de una integracion de software compuesta por: activos USD versionados del robot P7 con ensamblajes verificados de brida de muneca para las manos L6, O6 y L20; activos URDF y mallas de las tres manos; un pipeline de teleoperacion que mapea poses de controladores PICO u OpenXR al robot; cinematica inversa de doble brazo basada en Pink; y una celda de trabajo autocontenida de inspeccion y kitting con gravedad y autocolision de manos activadas por defecto.

El mapeo de entrada se organiza en tres modos. En `controller`, la pose de los brazos proviene de los controladores izquierdo y derecho y las articulaciones de la mano del gatillo correspondiente. En `handtracking`, la pose proviene de las munecas OpenXR y la mano se articula con el esqueleto de 26 articulaciones de OpenXR. En `controller_ffg`, los brazos se controlan con los controladores PICO y las manos con los guantes RealForce FFG, requiriendo el SDK `FFG_realhand_pure_python` (paquete `realhand_pure_python`) para lectura serie, carga de calibracion y retargeting. Los tres modelos de mano soportan los tres modos.

La pose de reposo al arrancar y al resetear coloca ambos brazos rectos hacia abajo junto al cuerpo, con manos abiertas, dedos hacia abajo y dorsos hacia los lados externos (palmas hacia dentro); las 14 articulaciones de brazo parten de cero y los montajes fijos de mano en espejo fijan esa orientacion. El torso usa geometria de colision por descomposicion convexa para dejar libre el espacio junto al cuerpo donde se bajan los brazos; el cocinado inicial de colisiones puede tardar mas en el primer arranque y los ajustes de colision de dedos son independientes. Se incluye una montura imprimible en 3D para los controladores PICO en configuraciones con guantes FFG, ademas de herramientas de calibracion FFG en tiempo de ejecucion y offline.

## Capacidades

- Teleoperacion bimanual del robot RealHand P7 con 14 articulaciones de brazo en Isaac Sim e Isaac Lab.
- Control de manos diestras RealHand L6, O6 y L20, seleccionables con `P7_REALHAND_HAND_MODEL=l6|o6|l20`.
- Tres modos de entrada seleccionables con `P7_REALHAND_INPUT_MODE=controller|handtracking|controller_ffg`.
- Seguimiento de manos OpenXR con esqueleto de 26 articulaciones.
- Retargeting desde guantes RealForce FFG a las articulaciones de las manos L6, O6 y L20.
- Cinematica inversa de doble brazo basada en Pink.
- Celda de trabajo de inspeccion y kitting autocontenida, con gravedad y autocolision de manos activadas por defecto.
- Herramientas de calibracion FFG en tiempo de ejecucion y offline.
- Activos USD versionados resueltos directamente por las configuraciones de `isaaclab_assets`.
- Montura imprimible en 3D para controladores PICO en configuraciones con guantes FFG.
- No incluye capacidades de generacion de texto, vision por computador, codigo, matematicas, tool calling ni razonamiento multi-paso.

## Casos de uso

- Recoleccion de demostraciones para aprendizaje por imitacion: el modo `handtracking` captura poses de mano de 26 articulaciones desde PICO 4 Ultra y las retargetiza al robot P7, generando trayectorias bimanuales etiquetadas utiles para entrenar politicas de manipulacion diestra.
- Validacion de cinematica inversa de doble brazo: la integracion con Pink permite comprobar en simulacion si una pose de muneca objetivo es alcanzable por ambos brazos antes de desplegar en hardware fisico.
- Prototipado de celdas de inspeccion y kitting: la escena autocontenida con gravedad y autocolision permite evaluar secuencias de recogida y colocacion con las manos L6, O6 o L20 sin montar una celda real.
- Teleoperacion con guantes hapticos en laboratorio: el modo `controller_ffg` combina controladores PICO para los brazos con guantes RealForce para las manos, adecuado para tareas que requieren control fino de dedos y registro de fuerza.
- Evaluacion comparativa de morfologias de mano: al soportar L6, O6 y L20 con los mismos tres modos de entrada, permite medir el impacto del numero de dedos y grados de libertad en la destreza alcanzable dentro de la misma escena.
- Formacion de operadores: un tecnico puede practicar secuencias de inspeccion en el simulador con el mismo casco y controladores que usaria en el robot real, reduciendo el riesgo de danar hardware durante el aprendizaje.
- Desarrollo de integraciones XR-robotica: sirve como referencia funcional de como conectar OpenXR y CloudXR con Isaac Teleop para streaming inalambrico de poses a un simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta compatibilidad de versiones (Ubuntu 24.04.4 LTS, Python 3.12.3, Isaac Sim 6.0.0.1, Isaac Lab `release/3.0.0-beta2`, Isaac Teleop 1.3.105rc1, PICO 4 Ultra con OpenXR) y advierte de que el cocinado inicial de colisiones puede tardar mas en el primer arranque, sin cifras de latencia ni throughput.

## Requisitos de hardware

- GPU NVIDIA con driver Linux reciente compatible con Isaac Sim; validar con `nvidia-smi`. No se especifica modelo ni VRAM minima en la informacion disponible.
- Casco PICO 4 Ultra con controladores para los tres modos de entrada.
- Runtime CloudXR para el flujo actual de streaming XR inalambrico; requiere aceptar una vez el EULA de NVIDIA CloudXR.
- Estacion de trabajo con Ubuntu 24.04.4 LTS y Python 3.12.3.
- Isaac Sim 6.0.0.1, Isaac Lab en la rama/commit probados e Isaac Teleop 1.3.105rc1 instalados por separado; el bundle no los redistribuye.
- SDK `FFG_realhand_pure_python` solo para el modo `controller_ffg`, instalado como hermano del repositorio en `$REALHAND_WORKSPACE/FFG_realhand_pure_python-main`.
- Variables de entorno relevantes: `REALHAND_WORKSPACE`, `REALHAND_TELEOP_ROOT`, `ISAACLAB_ROOT`, `ISAACLAB_ENV`, `P7_REALHAND_FFG_SDK_PATH`.
- Opciones de despliegue: lanzadores propios del bundle sobre Isaac Teleop (entry points de OpenXR y CloudXR); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Robot / manos | Dispositivo XR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RealHand Teleop | Bundle de teleoperacion para Isaac Sim / Isaac Lab | RealHand P7 con L6, O6 o L20 | PICO 4 Ultra (OpenXR, CloudXR) | Apache-2.0 y BSD-3-Clause | HuggingFace `realhandinc/realhand-teleop`, 0 descargas |
| NVIDIA Isaac Teleop | Framework de teleoperacion | Depende de los activos del usuario | OpenXR, CloudXR | Terminos de NVIDIA | Instalacion separada, no redistribuido aqui |
| Alternativas de teleoperacion generica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros bundles publicos equivalentes en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no genera texto, no procesa imagenes y no admite tool calling ni razonamiento.
- El repositorio no incluye los runtimes de NVIDIA (Isaac Sim, Isaac Lab, Isaac Teleop, CloudXR) ni el SDK FFG; deben instalarse por separado y sus licencias upstream aplican de forma independiente.
- La licencia se declara como `other` con nombre `apache-2.0-and-bsd-3-clause`; conviene revisar el fichero LICENSE antes de uso comercial, ya que la combinacion de dos licencias puede implicar obligaciones distintas segun el componente.
- La compatibilidad esta verificada unicamente contra versiones concretas (Isaac Sim 6.0.0.1, Isaac Lab `release/3.0.0-beta2`, Isaac Teleop 1.3.105rc1, Ubuntu 24.04.4 LTS, Python 3.12.3); otras versiones pueden romper la integracion.
- El modo `controller_ffg` depende del SDK `FFG_realhand_pure_python` alojado en un repositorio externo de GitHub, lo que introduce una dependencia de disponibilidad y mantenimiento ajena al bundle.
- El flujo XR actual requiere CloudXR y aceptar el EULA de NVIDIA, lo que anade una dependencia propietaria al pipeline.
- El primer arranque puede tardar mas por el cocinado de colisiones del torso con descomposicion convexa.
- El repositorio tiene 0 descargas y 3 likes, por lo que no hay evidencia publica de uso en produccion ni de robustez fuera del entorno probado.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica porque no aplican a un bundle de robotica; los idiomas figuran como no disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/realhandinc/realhand-teleop
- Licencia: https://huggingface.co/realhandinc/realhand-teleop/blob/main/LICENSE
- Activos Isaac Lab: https://huggingface.co/realhandinc/realhand-teleop/tree/main/assets/isaaclab
- Compatibilidad: https://huggingface.co/realhandinc/realhand-teleop/blob/main/COMPATIBILITY.md
- SDK FFG / RealForce: https://github.com/RealHand-Robotics/FFG_realhand_pure_python
