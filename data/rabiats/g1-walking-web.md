# RabiatS/g1-walking-web

## Resumen

g1-walking-web es una copia de los archivos del modelo ttktjmt/mjswan, recortada por el usuario RabiatS a los ficheros que se cargan en el navegador en la pagina rabiatsadiq.com/lab/robot/. No se trata de un modelo de lenguaje, sino de una politica de control (policy) de locomocion para el robot humanoide Unitree G1, exportada a ONNX y consumida mediante transformers.js. El pipeline declarado en HuggingFace es "Robot walking", es decir, generacion de comandos de marcha a partir de observaciones del estado del robot.

El modelo original es una politica de velocidad ("velocity policy") del Unitree G1 desarrollada por Julien Blanchon, entrenada con mjlab y publicada dentro del proyecto mjswan de Tatsuki Tsujimoto bajo licencia Apache 2.0. Los pesos no han sido modificados respecto al commit 40ee941b03bc6ca3ce39acc00b931fd39b27b21d; el repositorio existe unicamente para fijar una copia estable de los ficheros que la demo web necesita. El modelo y las mallas del robot proceden de Unitree Robotics, distribuidos a traves de MuJoCo Menagerie (unitree_g1, commit 4d038b3) bajo licencia BSD 3-Clause.

Su relevancia es practica mas que cientifica: demuestra que una politica de locomocion de un humanoide cuadrupede/pedestre puede ejecutarse en el navegador del cliente sin backend, gracias al formato ONNX y a transformers.js. Al no publicarse parametros, contexto ni resultados de benchmarks, la ficha queda necesariamente limitada en esos apartados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control para locomocion (reinforcement learning) exportada a ONNX; arquitectura de red concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (el modelo consume observaciones de estado, no secuencias de texto) |
| Tipos de cuantizacion | no disponible; el tag del repositorio indica "base_model:quantized:ttktjmt/mjswan", lo que sugiere que existe una version cuantizada del modelo base |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ejecutable con transformers.js en el navegador) |
| Pipeline declarado | Robot walking |
| Modelo base | ttktjmt/mjswan (commit 40ee941b03bc6ca3ce39acc00b931fd39b27b21d) |
| Tamano del repositorio | 0.0 GB |
| Libreria | transformers.js |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red neuronal. La unica informacion tecnica disponible indica que se trata de una "Unitree G1 velocity policy" entrenada con mjlab, un entorno de aprendizaje por refuerzo basado en MuJoCo. Por tanto, cabe esperar una politica que mapea observaciones de estado y un comando de velocidad a acciones de las articulaciones del robot, pero no se especifican el numero de capas, el tamano de las capas ocultas, el algoritmo de entrenamiento (PPO u otro), el numero de pasos de simulacion ni la composicion del dataset ni el uso de tecnicas de ajuste como RLHF o DPO, que en este dominio no aplican.

El repositorio no contiene los pesos originales en su formato de entrenamiento, sino una copia recortada de los ficheros que la demo web carga en el navegador, en formato ONNX. Esta orientado a inferencia en el cliente mediante transformers.js, lo que implica que la politica se ejecuta en JavaScript/WASM (o WebGPU) dentro del navegador, sin necesidad de un servidor de inferencia. No se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, destilacion u otras) porque no se trata de un modelo de lenguaje.

## Capacidades

- Generacion de comandos de marcha para el robot humanoide Unitree G1 a partir de comandos de velocidad y observaciones del estado del robot.
- Ejecucion en el navegador: el modelo esta empaquetado para transformes.js y carga sin backend.
- Integracion con modelos de robot y mallas de MuJoCo Menagerie (unitree_g1), lo que permite visualizacion y simulacion en la propia pagina.
- Reproducibilidad de la demo: al fijar los ficheros en un commit concreto, la pagina no depende de cambios en el repositorio original.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes y capacidades multilingues: no aplica; este modelo no es un modelo de lenguaje.
- Modo "thinking", vision o audio: no disponible / no aplica.

## Casos de uso

- Demostracion interactiva de locomocion de humanoides en el navegador: la politica se ejecuta en el cliente y permite a un visitante de la web observar o controlar la marcha del Unitree G1 sin instalar nada ni contactar con un servidor de inferencia.
- Prototipado de interfaces de teleoperacion: al aceptar comandos de velocidad, el modelo puede servir como capa de bajo nivel en una interfaz web donde el usuario define direccion y rapidez de marcha, mientras la politica resuelve el control articular.
- Validacion de pipelines de exportacion a ONNX: util para comprobar que una politica entrenada con mjlab puede convertirse y ejecutarse con transformers.js, como paso previo a otros modelos de robotica.
- Educacion y divulgacion en robotica: permite ilustrar como se comporta una politica de aprendizaje por refuerzo en un humanoide simulado, con el modelo fisico de Unitree disponible en MuJoCo Menagerie.
- Pruebas de integracion de MuJoCo con tecnologias web: sirve como referencia para equipos que quieran combinar simulacion fisica y ejecucion de redes en el navegador.
- Versionado estable de artefactos para demos publicas: al fijar los ficheros en un commit, es adecuado para paginas que necesitan garantizar que los pesos cargados no cambien con el tiempo.
- Benchmarking de rendimiento de inferencia en cliente: permite medir latencia de ejecucion de una politica de control en distintos navegadores y dispositivos, aunque no se publican cifras al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito de marcha, velocidades de seguimiento de comando ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y el modelo esta pensado para ejecutarse en el navegador del cliente, por lo que la huella de memoria es reducida, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. Al ejecutarse via transformers.js en el navegador, el backend depende del dispositivo del usuario (CPU con WASM o GPU mediante WebGPU/WebGL), no de una GPU de servidor.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; cualquier equipo capaz de ejecutar un navegador moderno con soporte de WebAssembly deberia poder cargar la demo, si bien no hay datos publicados de compatibilidad.
- Opciones de despliegue: transformers.js en navegador; el modelo base ttktjmt/mjswan se apoya en el ecosistema mujoco/mjlab para entrenamiento y simulacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Ejecucion en navegador | Notas |
|---|---|---|---|---|---|
| RabiatS/g1-walking-web | Politica de locomocion Unitree G1 | apache-2.0 | ONNX (transformers.js) | Si, es su proposito declarado | Copia recortada y fijada del modelo base |
| ttktjmt/mjswan | Politica de locomocion Unitree G1 (original) | apache-2.0 | no disponible en la informacion proporcionada | Parcialmente; incluye los ficheros de los que se extrajo esta copia | Repositorio de origen, commit 40ee941b03bc6ca3ce39acc00b931fd39b27b21d |
| Otras politicas de locomocion entrenadas con mjlab o Isaac Lab | Politicas de control | variable | variable | No disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales; cualquier expectativa en ese sentido es incorrecta.
- No se publican parametros, arquitectura de red, contexto ni benchmarks, por lo que no es posible evaluar su calidad de marcha ni compararla objetivamente con alternativas.
- El repositorio es una copia de terceros: los pesos pertenecen al proyecto mjswan y no han sido modificados, de modo que cualquier problema de la politica original se hereda integramente.
- Condiciones de atribucion: la licencia Apache 2.0 del modelo convive con la licencia BSD 3-Clause del modelo de robot y las mallas de Unitree Robotics distribuidas via MuJoCo Menagerie; es necesario respetar ambas al redistribuir.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo de comportamientos de control no previstos si la politica se ejecuta fuera de la distribucion de observaciones con la que fue entrenada.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: no aplica.
- Para produccion: al tratarse de una politica de control fisico, su uso en un robot real exigiria validacion de seguridad adicional que la model card no documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RabiatS/g1-walking-web
- Modelo base: https://huggingface.co/ttktjmt/mjswan
- Repositorio mjswan en GitHub: https://github.com/ttktjmt/mjswan
- Demo web que carga el modelo: https://www.rabiatsadiq.com/lab/robot/
- MuJoCo Menagerie (modelo unitree_g1, commit 4d038b3): https://github.com/google-deepmind/mujoco_menagerie
- Unitree Robotics: https://www.unitree.com/
