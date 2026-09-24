# nlml/interactive-diffusion

## Resumen

nlml/interactive-diffusion es un modelo de mundo (world model) generativo basado en difusion, publicado por el usuario nlml en HuggingFace bajo licencia MIT. El modelo se entrenó para simular de forma interactiva la dinamica del entorno CarRacing-v3: recibe el estado visual de una partida (fotogramas) y las acciones del jugador, y genera la continuacion del video, de manera que un agente o una persona puede "jugar" dentro del modelo en lugar de dentro del simulador original.

La pieza central es un `CausalSpatiotemporalDiT`, es decir, un Diffusion Transformer con atencion espacio-temporal de caracter causal, entrenado durante 50.000 pasos con aumentacion de ruido en el contexto (context noise augmentation). El checkpoint publicado pesa 145 MB (sin el optimizador) y el repositorio completo ocupa 0.8 GB, lo que incluye datos de muestra de CarRacing-v3 con fotogramas, acciones y mascaras de episodios validos.

Es relevante ahora porque se enmarca en la linea de investigacion de world models jugables (Genie, GameNGen, DIAMOND y similares), donde el objetivo es sustituir simuladores costosos por modelos generativos que predicen la dinamica del entorno y permiten entrenar o evaluar politicas de refuerzo dentro del propio modelo. Su tamano reducido y su licencia permisiva lo convierten en un punto de partida asequible para reproducir este tipo de experimentos en una sola GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `CausalSpatiotemporalDiT` (Diffusion Transformer con atencion espacio-temporal causal) |
| Parametros totales | no disponible (el checkpoint ocupa 145 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica un checkpoint PyTorch sin optimizador) |
| Idiomas soportados | no aplica (modelo de generacion de video para CarRacing; sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |
| Tamano del checkpoint | 145 MB (optimizador eliminado) |
| Tamano del repositorio | 0.8 GB (incluye `sample_data/`) |
| Pasos de entrenamiento | 50.000 |
| Entorno objetivo | CarRacing-v3 |
| Fecha de creacion (metadatos HF) | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) adaptado a video, al que el autor denomina `CausalSpatiotemporalDiT`. La atencion es causal y espacio-temporal, lo que implica que la prediccion de cada fotograma solo depende de los fotogramas y acciones anteriores, condicion necesaria para que el modelo pueda usarse como simulador interactivo paso a paso en lugar de como generador de clips completos. El condicionamiento incluye las acciones del agente sobre el entorno CarRacing-v3, de modo que la dinamica generada responde a las decisiones del jugador.

El entrenamiento consistio en 50.000 pasos sobre datos de juego recolectados del simulador CarRacing-v3 (fotogramas, acciones y mascaras de episodios validos, distribuidos en shards; el repositorio incluye el shard 0 como muestra). Se aplico context noise augmentation, una tecnica que introduce ruido en el contexto de entrada para hacer el modelo mas robusto a los errores acumulados durante la generacion autoregresiva, un problema habitual cuando un world model se retroalimenta de sus propias predicciones. No se documenta en la informacion disponible si hubo fases de RLHF, DPO ni ningun otro ajuste posterior, ni el numero total de tokens o fotogramas usado.

## Capacidades

- Generacion de video condicionada por acciones: dado un historial de fotogramas y la accion del agente, produce el fotograma siguiente de la partida de CarRacing.
- Simulacion interactiva en tiempo real mediante el servidor web incluido en el repositorio (`webapp/server.py`), pensado para jugar dentro del modelo.
- Modelado de dinamica para aprendizaje por refuerzo: actua como entorno aprendido sobre el que se pueden ejecutar politicas.
- Generacion de trayectorias sinteticas de conduccion con pares (fotograma, accion) utilizables como datos de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.
- Capacidad especial: prediccion causal espacio-temporal orientada a interaccion paso a paso, con robustez a la acumulacion de error gracias al entrenamiento con ruido en el contexto.

## Casos de uso

- Entrenamiento de agentes de RL en un entorno aprendido: el modelo sustituye a CarRacing-v3 como simulador, lo que permite generar experiencia a un coste computacional menor que ejecutar el simulador original, siempre que la fidelidad de la dinamica sea suficiente para la politica objetivo.
- Evaluacion de politicas sin acceso al simulador: un agente ya entrenado puede desplegarse contra el world model para medir su comportamiento en condiciones controladas y reproducibles.
- Pruebas de robustez ante errores de prediccion: al realimentar las salidas del modelo como entradas, se puede medir cuanto tiempo mantiene coherencia la simulacion, un experimento habitual en la literatura de world models.
- Generacion de datos sinteticos de conduccion: los pares (fotograma, accion, mascara de episodio) generados por el modelo pueden aumentar el dataset original de CarRacing-v3 para entrenar politicas con mas diversidad de trayectorias.
- Demo interactiva y divulgacion: el servidor de `webapp/server.py` permite publicar una experiencia jugable donde el usuario conduce dentro de un modelo de difusion, util para articulos tecnicos, docencia y demostraciones.
- Prototipado de videojuegos generativos: sirve como banco de pruebas para estudiar latencia, coherencia temporal y controlabilidad de un motor de juego basado en difusion, antes de escalar a entornos mas complejos.
- Reproduccion de investigacion: el repositorio incluye datos de muestra y un checkpoint entrenado, lo que facilita reproducir los experimentos del articulo "A Playable Diffusion Model" y extenderlos a otros entornos.
- Estudio de arquitecturas DiT causales espacio-temporales: el codigo y los pesos permiten analizar el efecto de la atencion causal y de la aumentacion de ruido en el contexto sobre la estabilidad de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda proporcionados no incluyen metricas como FVD, PSNR, SSIM, recompensa media del agente ni comparaciones cuantitativas con otros world models.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia, el checkpoint ocupa 145 MB, lo que en precision float32 corresponde aproximadamente a unos 36 millones de parametros (estimacion a partir del tamano del fichero, no un dato publicado). El consumo real dependera de la resolucion de los fotogramas, del numero de fotogramas de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU con memoria suficiente para el tamano de lote y la resolucion usados; dado el tamano del modelo, una RTX 3060, RTX 4060 o superior deberia ser suficiente para inferencia interactiva. No hay mediciones publicadas para A100, H100 u otras GPU de datacenter.
- GPU de consumo: si, es previsible que quepa en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente, aunque no se documentan requisitos minimos ni velocidades.
- Despliegue: el repositorio proporciona un servidor web propio (`python webapp/server.py --checkpoint nlml/interactive-diffusion --data_dir ./carracing_data`). No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados (parametros, contexto, metricas) de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a aspectos cualitativos. Cualquier cifra concreta debe considerarse no disponible.

| Modelo | Categoria | Entorno | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nlml/interactive-diffusion | World model de difusion con DiT causal | CarRacing-v3 | no disponible (checkpoint de 145 MB) | MIT | Pesos y codigo publicos en HuggingFace y GitHub |
| DIAMOND (referencia de la literatura) | World model de difusion | Atari | no disponible | no disponible | no disponible |
| GameNGen (referencia de la literatura) | World model de difusion para juegos | DOOM | no disponible | no disponible | no disponible |
| Genie (referencia de la literatura) | World model generativo interactivo | Multiples entornos 2D | no disponible | no disponible | no disponible |

La diferencia practica mas relevante es que interactive-diffusion publica pesos bajo MIT y con un tamano de 145 MB, lo que lo hace ejecutable en hardware de consumo, mientras que los modelos citados son, en la informacion disponible, referencias academicas sin datos de disponibilidad ni de rendimiento confirmados aqui.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo se entrena exclusivamente sobre CarRacing-v3. No generaliza a otros entornos, dominios visuales ni tareas de lenguaje.
- Deriva y acumulacion de error: al ser un modelo autorregresivo que consume sus propias predicciones, es previsible que la simulacion se degrade con el tiempo. La context noise augmentation mitiga el problema, pero no se documenta cuanto tiempo se mantiene la coherencia.
- Ausencia de capacidades de lenguaje: no soporta dialogo, tool calling, razonamiento simbolico, codigo ni matematicas.
- Sesgos conocidos: no disponibles. Al entrenarse sobre grabaciones de CarRacing-v3, heredara los sesgos de las politicas que generaron los datos (por ejemplo, estilos de conduccion concretos y baja cobertura de situaciones atipicas).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo analogo de generar transiciones fisicamente imposibles en el entorno simulado.
- Idiomas: no aplica.
- Licencia: MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. Conviene verificar la licencia de los datos de CarRacing-v3 si se redistribuyen.
- Idoneidad para produccion: el repositorio tiene 0 descargas y 0 likes, y se presenta como proyecto de investigacion y demostracion, no como componente listo para produccion. No hay garantias de soporte, versionado ni mantenimiento.
- Datos incompletos: no se publican parametros totales, longitud de contexto, requisitos de hardware, latencia ni resultados de benchmarks. Cualquier estimacion de coste o rendimiento debe validarse empiricamente antes de usarse como base para decisiones.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (devuelven paginas no relacionadas), por lo que no ha sido posible contrastar ni ampliar los datos de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/nlml/interactive-diffusion
- Repositorio GitHub: https://github.com/nlml/interactive-diffusion
- Articulo (blog post): https://nlml.github.io/generative-models/interactive-diffusion-1/
- Entorno CarRacing-v3: no se proporciona enlace explicito en la informacion disponible (corresponde a Gymnasium/Farama Foundation).
