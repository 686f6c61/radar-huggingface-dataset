# LeWAM/lewam-pointmaze-large

## Resumen

LeWAM PointMaze Large es un checkpoint de alcance de objetivo (goal-reaching) publicado por el usuario LeWAM dentro del denominado formato LeWAM v1. No se trata de un modelo de lenguaje, sino de un modelo de mundo orientado a control: segun la model card, el checkpoint implementa prediccion de acciones condicionada por objetivo y prediccion de dinamica, con enmascaramiento de atencion y salidas de codificador (encoder), lo que lo situa en la familia de los world models empleados en planificacion y aprendizaje por refuerzo basado en modelo.

El repositorio, de licencia MIT, contiene unicamente dos archivos en la raiz: `lewam_best.pt` (pesos) y `lewam_config.json` (configuracion). El conjunto de datos asociado se publica por separado en el dataset `LeWAM/lewam-pointmaze-large`. El entorno objetivo es PointMaze, un escenario clasico de navegacion 2D con recompensa basada en alcanzar una meta, muy usado como banco de pruebas para modelos de mundo y planificadores latentes.

Su relevancia es doble. Por un lado, ofrece pesos verificados de un world model entrenado sobre un entorno estandar, algo poco frecuente porque la mayoria de publicaciones de esta categoria no liberan checkpoints. Por otro, el autor advierte de que la version v1 no incluye una configuracion de evaluacion especifica para este entorno, de modo que el checkpoint esta pensado para reproducir el entrenamiento y la dinamics learning, no para obtener una puntuacion de referencia lista para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model en formato LeWAM v1: codificador (encoder), prediccion de acciones condicionada por objetivo y prediccion de dinamica, con mascaras de atencion; el detalle de capas, dimensiones y tipo exacto de bloque no esta disponible en la model card |
| Parametros totales | no disponible (el autor no publica la cifra) |
| Parametros activos | no aplica (no se describe como arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuye el checkpoint en su precision original (`lewam_best.pt`) |
| Idiomas soportados | no disponible; el modelo opera sobre estados, acciones y objetivos de un entorno de navegacion, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) mas fichero de configuracion JSON (`lewam_config.json`); no se ofrecen safetensors ni GGUF |
| Tamano del repositorio | 0,1 GB |
| SHA256 de `lewam_best.pt` | `76e8ceb6f8bea8f31b078f51337b3f7b2bb8b7177165e374ddd8d9e00badf177` |
| Estado de optimizador | no incluido |

## Arquitectura y entrenamiento

La model card describe el artefacto como un "goal-reaching checkpoint in the LeWAM v1 format" y menciona explicitamente cuatro componentes verificados frente al checkpoint original: carga estricta del modelo, mascaras de atencion (attention masks), salida del codificador (encoder output), prediccion de acciones condicionada por objetivo y prediccion de dinamica. De estos elementos se deduce una arquitectura sequence-to-sequence con un encoder que produce representaciones latentes del estado, un mecanismo de atencion enmascarada y una doble cabeza funcional (acciones y dinamica del entorno). No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion, la funcion de perdida ni el algoritmo de entrenamiento, por lo que esos datos deben considerarse no disponibles.

Tampoco se publican el numero de tokens o de pasos de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste por refuerzo con preferencias humanas (RLHF/DPO), algo por otra parte poco habitual en modelos de mundo. Lo unico documentado es el dataset asociado, `LeWAM/lewam-pointmaze-large`, y la verificacion de que los pesos entrenados se preservan exactamente tal cual y que no se incluye estado del optimizador, lo que implica que el checkpoint sirve para inferencia y evaluacion, pero no para reanudar un entrenamiento de forma directa.

## Capacidades

- Prediccion de acciones condicionada por objetivo (goal-conditioned action prediction): dado un estado y una meta, el modelo produce acciones.
- Prediccion de dinamica: modela la transicion del entorno, lo que habilita rollouts sinteticos y planificacion basada en modelo.
- Codificacion de estados: genera representaciones latentes (encoder output) reutilizables en planificadores o en otros cabezales.
- Uso de mascaras de atencion, verificado contra el checkpoint de origen, lo que sugiere manejo de secuencias de longitud variable con enmascarado explicito.
- Carga estricta verificada: los nombres y formas de los tensores coinciden con el checkpoint original, lo que facilita la reproducibilidad.
- No hay evidencia de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling, uso como agente conversacional ni capacidades multilingues. Este checkpoint no es un modelo de lenguaje.

## Casos de uso

- Planificacion basada en modelo (model-based planning): usar la prediccion de dinamica para hacer rollouts en el espacio latente y seleccionar acciones con metodos tipo CEM o MPC en PointMaze, aprovechando que el modelo esta especificamente entrenado para ese entorno.
- Aprendizaje por refuerzo offline: emplear el checkpoint como politica inicial o como modelo de mundo para generar transiciones sinteticas en experimentos de offline RL sobre tareas de alcance de objetivo.
- Investigacion en representaciones latentes: extraer el encoder output y evaluar si las representaciones capturan estructura de la maze (posiciones, distancias a la meta) mediante sondas lineales o visualizaciones de espacio latente.
- Reproducibilidad de experimentos: el autor confirma que los pesos se preservan exactamente y publica el SHA256, de modo que el checkpoint sirve para replicar resultados de entrenamiento en lugar de partir de cero.
- Punto de partida para fine-tuning: al distribuirse en formato PyTorch con configuracion JSON y licencia MIT, puede ajustarse a variantes del entorno PointMaze con distintas disposiciones de laberinto o dinamicas.
- Comparacion de world models: actuar como referencia cuantitativa en estudios que comparen arquitecturas de modelos de mundo dentro del mismo entorno, siempre que el investigador implemente su propia configuracion de evaluacion al no incluirse una oficial.
- Docencia y prototipado: por su tamano reducido (repo de 0,1 GB) y su licencia permisiva, es adecuado para practicas de laboratorio sobre world models y control en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que la release v1 no incluye una configuracion de evaluacion especifica para este entorno, por lo que no existen cifras de exito en PointMaze, retorno medio, error de prediccion de dinamica ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial. El repositorio completo ocupa 0,1 GB y los pesos no incluyen estado del optimizador; a modo de referencia puramente orientativa, un fichero de ese orden de magnitud situa el modelo en la escala de decenas de millones de parametros si los pesos estan en fp32, pero el autor no publica la cifra y esta estimacion no debe tomarse como dato confirmado.
- GPU recomendadas: no disponibles. Con ese volumen de pesos, cualquier GPU moderna con unos pocos GB de VRAM libre deberia bastar; el cuello de botella probable es la simulacion del entorno y el bucle de planificacion, no el modelo.
- GPU de consumo: previsiblemente si, incluidas tarjetas de gama media, dado el tamano del checkpoint. No hay confirmacion oficial.
- CPU: la carga de un checkpoint de este tamano es viable en CPU, aunque el rendimiento de rollouts y planificacion dependera de la implementacion.
- Opciones de despliegue: las indicadas por el autor, mediante el paquete `lewam` y la funcion `load_lewam` del modulo `lewam.eval.loaders`, tras copiar ambos ficheros a `$STABLEWM_HOME/checkpoints/<run_name>/`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no publica parametros, contexto, resultados ni comparaciones, y la busqueda web realizada no ha devuelto ninguna fuente tecnica relacionada con LeWAM, PointMaze o world models que permita establecer una comparacion fiable. Para contextualizar la categoria, este checkpoint pertenece al grupo de modelos de mundo para control (junto a lineas como Dreamer, TD-MPC o IRIS), pero no se dispone de datos verificables de LeWAM que permitan contrastar cifras con ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales, y no soporta tool calling, agentes de texto ni capacidades multilingues.
- Especificidad de entorno: esta entrenado para PointMaze y su transferencia a otros entornos o a robots reales no esta documentada.
- Ausencia de configuracion de evaluacion: la propia model card advierte de que la release v1 no incluye una configuracion de evaluacion especifica para este entorno, por lo que cualquier metrica debera ser implementada por el usuario y no sera directamente comparable con otras publicaciones.
- Riesgo de alucinacion en el sentido de modelado: como todo modelo de dinamica, puede producir rollouts que se desvien del comportamiento real del entorno en horizontes largos, lo que degrada la planificacion. No hay datos publicados sobre la magnitud de este error.
- Sesgos: no disponibles. No se documenta la distribucion de laberintos, objetivos ni condiciones iniciales del dataset de entrenamiento, lo que impide evaluar sesgos de cobertura.
- Limitaciones de contexto: se desconoce la longitud de secuencia soportada.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright. Al no incluir el repositorio informacion sobre dependencias del paquete `lewam`, conviene revisar la licencia de ese codigo por separado antes de un despliegue en produccion.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento tal cual desde este checkpoint.
- Datos de procedencia de la busqueda web: la busqueda realizada no ha devuelto ninguna fuente relevante sobre el modelo; los resultados obtenidos correspondian a contenidos sin relacion con el tema y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeWAM/lewam-pointmaze-large
- Dataset asociado: https://huggingface.co/datasets/LeWAM/lewam-pointmaze-large
- SHA256 de `lewam_best.pt`: `76e8ceb6f8bea8f31b078f51337b3f7b2bb8b7177165e374ddd8d9e00badf177`
- Repositorio de codigo, paper o demo del paquete `lewam`: no disponible en la informacion proporcionada
- Resultados de busqueda web relevantes: no disponible
