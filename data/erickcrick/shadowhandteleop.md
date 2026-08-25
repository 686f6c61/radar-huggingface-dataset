# ErickCrick/ShadowHandTeleop

## Resumen

ErickCrick/ShadowHandTeleop es un proyecto de investigacion y prueba de concepto (PoC) para la teleoperacion de la mano robotica Shadow Hand de MuJoCo Menagerie mediante vision por computador. Desarrollado por ErickCrick (Yaroslav Ryndyk), el sistema cierra un bucle minimo de percepcion-accion: la mano humana se captura con una camara, MediaPipe estima los landmarks de la mano, un modulo de retargeting geometrico convierte esos puntos en 20 objetivos de actuadores, y MuJoCo simula la dinamica de la mano robotica. El proyecto esta disenado como una plataforma modular para futuras investigaciones en sensacion tactil, autocalibracion, fusion de senales, modelos de accion y aprendizaje por refuerzo.

A diferencia de un modelo de IA generativa, este repositorio no contiene pesos de red neuronal entrenados, sino un sistema de software que integra componentes de vision (MediaPipe), simulacion fisica (MuJoCo) y control. Su relevancia radica en ofrecer una base reproducible y extensible para estudiar como combinar percepcion, control, tacto y politicas aprendidas en un unico entorno MuJoCo. Incluye tres rutas de ejecucion: una demo en navegador con MuJoCo-WASM, un servidor de visualizacion y una aplicacion nativa de investigacion con sensores tactiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de teleoperacion: MediaPipe (estimacion de pose) + retargeting geometrico + MuJoCo (simulacion) |
| Parametros totales | No aplica (no es un modelo de red neuronal entrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (interfaz en ingles, sin modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No aplica (codigo fuente, assets MJCF y mallas) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de transformer, MoE o SSM, sino un pipeline clasico de vision-robotica. La entrada es un fotograma de camara, procesado por MediaPipe para extraer landmarks de la mano humana (21 puntos). Un modulo de retargeting geometrico mapea esos landmarks a 20 objetivos de actuadores de la Shadow Hand, que se envian a MuJoCo para simular la dinamica y renderizar el estado del robot. No hay entrenamiento especifico del sistema; MediaPipe es un modelo preentrenado de Google, y MuJoCo es un motor de fisica. El proyecto incluye una primera iteracion de sensores tactiles en la ruta nativa, con sensores en yemas, almohadillas y palma, y una ventana de diagnostico para inspeccionar la actividad de contacto. Los objetivos cientificos a corto plazo incluyen anadir autocalibracion, fusion de senales y una interfaz para modelos de accion y RL.

## Capacidades

- Teleoperacion de la Shadow Hand en tiempo real mediante vision por computador (MediaPipe).
- Retargeting geometrico de landmarks de mano humana a 20 actuadores de la mano robotica.
- Simulacion fisica con MuJoCo, incluyendo dinamica de contacto y renderizado.
- Ruta de ejecucion en navegador con MuJoCo-WASM, donde los fotogramas de la webcam se procesan localmente.
- Ruta de servidor con Gradio para visualizacion remota.
- Aplicacion nativa de investigacion con soporte de sensores tactiles (contacto en yemas, almohadillas y palma).
- Registro CSV de landmarks y senales de actuadores por fotograma.
- Diagnostico tactil: actividad por sensor, trazas lineales, mapas de calor de contacto, totales y valores de canal.
- Arquitectura modular para futuras extensiones: capas de autocalibracion, fusion de sensores, modelos de accion y RL.

## Casos de uso

- Investigacion en manipulacion robotica: el sistema permite estudiar como la percepcion visual se traduce en comandos de actuacion, sirviendo como banco de pruebas para algoritmos de control y aprendizaje.
- Desarrollo de algoritmos de retargeting: los investigadores pueden modificar el mapeo geometrico entre la mano humana y la Shadow Hand para probar distintas estrategias de correspondencia.
- Experimentos con sensacion tactil: la ruta nativa incluye sensores de contacto, lo que permite explorar la integracion de tacto en tareas de agarre y manipulacion.
- Generacion de datos para aprendizaje por refuerzo: el registro CSV de landmarks y actuadores puede usarse para entrenar politicas de control en entornos simulados.
- Prototipado rapido de interfaces de teleoperacion: la demo en navegador permite validar conceptos sin instalar dependencias locales, ideal para presentaciones o pruebas de usuario.
- Plataforma educativa: por su modularidad y uso de herramientas estandar (MediaPipe, MuJoCo), es util para ensenar robotica, vision por computador y control en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no reporta metricas de precision, latencia o throughput. La model card indica que el hardware sugerido para la demo en navegador es "cpu-basic", lo que sugiere que la ruta WASM puede ejecutarse en CPU sin GPU, pero no hay datos cuantitativos.

## Requisitos de hardware

- Demo en navegador (ruta /browser): requiere un navegador moderno con soporte WebAssembly; la model card sugiere hardware basico de CPU (cpu-basic). La webcam es necesaria para la captura de la mano.
- Aplicacion nativa: requiere Python con `uv` y `mjpython`; se recomienda una GPU para MediaPipe si se usa aceleracion, aunque no se especifica en la documentacion. La opcion `--no-cv2` permite desactivar OpenCV si no esta disponible.
- Servidor Gradio: puede ejecutarse en CPU, pero el procesamiento de fotogramas y la simulacion pueden ser lentos sin GPU.
- No se proporcionan requisitos de VRAM, GPU especifica o latencia. Para la ruta nativa, se asume un equipo de desarrollo estandar con capacidad para ejecutar MuJoCo y MediaPipe.

## Comparativa con modelos similares

| Sistema | Sensor de mano | Motor de fisica | Licencia | Disponibilidad |
|---|---|---|---|---|
| ErickCrick/ShadowHandTeleop | MediaPipe (camara RGB) | MuJoCo | No disponible | Codigo abierto en HuggingFace |
| szahlner/shadow-teleop | Leap Motion Controller | PyBullet | No disponible | GitHub |
| Neotix-Robotics/teleop-pipeline-template | No especificado (plantilla) | No especificado | No disponible | GitHub |

No hay datos de rendimiento publicados para ninguno de los tres sistemas, por lo que la comparacion se limita a aspectos cualitativos. El proyecto de ErickCrick destaca por su integracion con MuJoCo Menagerie y su enfoque modular hacia sensacion tactil y aprendizaje, mientras que szahlner/shadow-teleop usa Leap Motion (sensor infrarrojo) y PyBullet. La plantilla de Neotix-Robotics parece orientada a estandarizar pipelines de teleoperacion, pero carece de detalles publicos.

## Limitaciones y advertencias

- Es una prueba de concepto en fase inicial: la model card indica que faltan capas de autocalibracion, fusion de sensores, interfaz de modelos de accion y bucle de RL.
- La sensacion tactil es experimental y solo esta disponible en la ruta nativa; no se ha validado su precision ni robustez.
- El retargeting es geometrico y no considera limitaciones cinematicas completas de la Shadow Hand; puede haber discrepancias entre la pose humana y la alcanzable por el robot.
- La demo en navegador depende de MuJoCo-WASM y MediaPipe en el cliente; puede haber problemas de rendimiento en dispositivos de gama baja.
- No se especifica licencia, lo que limita su uso comercial sin consultar al autor.
- No hay documentacion sobre sesgos o riesgos de alucinacion, ya que no es un modelo generativo; el riesgo principal es la inexactitud en la estimacion de pose bajo condiciones de iluminacion o oclusion.
- Para produccion, el sistema requiere validacion adicional en entornos reales (no solo simulacion) y una evaluacion de seguridad en tareas de manipulacion fisica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ErickCrick/ShadowHandTeleop
- Perfil del autor en HuggingFace: https://huggingface.co/ErickCrick
- Repositorio de referencia (szahlner/shadow-teleop): https://github.com/szahlner/shadow-teleop
- Plantilla de pipeline (Neotix-Robotics): https://github.com/Neotix-Robotics/teleop-pipeline-template
