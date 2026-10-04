# marcgabrielschneider/Taxi-v4

## Resumen

Taxi-v4 es el identificador de un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 y publicado en Hugging Face por el usuario marcgabrielschneider. No es un modelo de lenguaje ni una red neuronal: se trata de una tabla Q estado-accion serializada en un fichero `q-learning.pkl`, resultado de un entrenamiento sobre el clasico problema del taxi de Gymnasium, en el que un agente debe recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro puntos de recogida fijos.

El interes de este tipo de publicaciones es fundamentalmente docente y de reproducibilidad. El problema Taxi-v3 es un banco de pruebas canonico para algoritmos de RL tabular (Q-learning, SARSA) y su solucion optima se alcanza con relativamente pocas iteraciones, por lo que sirve como referencia minima para validar que una implementacion propia funciona antes de escalar a entornos continuos o a metodos de deep RL. El propio autor etiqueta el modelo como `custom-implementation`, lo que indica que la rutina de entrenamiento no es la de una libreria estandar.

El modelo declara un retorno medio de 7,56 +/- 2,71 en Taxi-v3, un valor cercano al maximo alcanzable en ese entorno, aunque la metrica figura como no verificada y el repositorio no tiene descargas ni interacciones en el momento de redactar esta ficha. Existe una discrepancia de nomenclatura relevante: el repositorio se llama Taxi-v4, pero tanto las etiquetas como el `model-index` y el README indican que el entorno de entrenamiento es Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular con tabla Q estado-accion (no es un transformer ni una red neuronal) |
| Parametros totales | no disponible en terminos de pesos; la tabla Q cubre el espacio discreto de Taxi-v3 (500 estados x 6 acciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (la tabla Q se almacena como valores numericos discretos) |
| Idiomas soportados | no disponible (el agente no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | fichero pickle con la tabla Q serializada (`q-learning.pkl`), cargado mediante la utilidad `load_from_hub` |
| Entorno objetivo | Taxi-v3 (segun etiquetas, README y model-index) |
| Interfaz de uso | `gym.make(model["env_id"])` con el `env_id` almacenado en el propio pickle |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es la de un agente de Q-learning tabular clasico. El entorno Taxi-v3 es un MDP discreto con 500 estados (25 posiciones de la cuadricula x 5 ubicaciones posibles del pasajero, incluyendo el interior del taxi, x 4 destinos) y 6 acciones (moverse al norte, sur, este y oeste, recoger pasajero y dejarlo). La tabla Q almacena un valor por cada par estado-accion, de modo que el espacio de parametros efectivo es de unas 3000 entradas numericas, muy por debajo de cualquier modelo neuronal y almacenable en pocos kilobytes.

La estructura de recompensas del entorno es conocida: -1 por cada paso de tiempo, +20 por una entrega correcta, -10 por intentar recoger o dejar pasajeros de forma ilegal y un limite tipico de 200 pasos por episodio. No se especifica en la informacion disponible el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), la tasa de aprendizaje, el factor de descuento ni si se aplico algun esquema de decaimiento de la exploracion. La etiqueta `custom-implementation` sugiere que el autor implemento el bucle de Q-learning manualmente en lugar de emplear Stable-Baselines3 u otra libreria de referencia.

El unico dato de rendimiento declarado es una recompensa media de 7,56 con una desviacion tipica de 2,71, marcada como no verificada. La magnitud de la desviacion tipica, superior al 35 % de la media, indica una varianza alta entre episodios, coherente con una politica que resuelve con soltura la mayoria de configuraciones iniciales pero falla en algunas; conviene tenerlo en cuenta si se usa como linea base.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente selecciona acciones discretas para completar recogidas y entregas de pasajeros en la cuadricula 5x5.
- Politica greedy sobre la tabla Q: la inferencia consiste en consultar el valor maximo de la tabla para el estado actual.
- Reproducibilidad de un algoritmo tabular canonico: sirve como implementacion de referencia de Q-learning frente a variantes deep RL.
- Persistencia y distribucion mediante Hugging Face Hub: el artefacto se descarga y carga con `load_from_hub`, y el propio fichero incluye el identificador de entorno necesario.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la planificacion implicita en su politica de Q-learning.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No incorpora modo de pensamiento, vision, audio ni ninguna modalidad adicional.
- El espacio de observaciones es discreto; el agente no generaliza a variantes continuas o visuales del entorno sin reentrenamiento.

## Casos de uso

- Material docente de aprendizaje por refuerzo: el agente permite ilustrar en clase el ciclo completo de Q-learning (exploracion, explotacion, convergencia) con un coste computacional practicamente nulo y un resultado medible en forma de recompensa media.
- Linea base en estudios comparativos: cualquier investigador que evalue un metodo nuevo (DQN, PPO, Q-learning con aproximacion lineal) sobre Taxi-v3 puede usar esta politica como referencia de partida antes de comparar con su propuesta.
- Verificacion de frameworks de RL: sirve para comprobar que Gymnasium, las utilidades de carga de Hugging Face Hub y el bucle de evaluacion propio devuelven recompensas coherentes con un agente ya entrenado.
- Pruebas de regresion en integracion continua: al ser un artefacto diminuto y una evaluacion rapida, puede incorporarse a un pipeline de CI que detecte cambios incompatibles en la API de Gymnasium o en las utilidades de serializacion.
- Demostraciones de publicacion de modelos en Hugging Face: es un ejemplo minimo de model card con `model-index`, etiquetas y metrica declarada, util para quien documente su primer modelo en el Hub.
- Prototipado de logica de planificacion en entornos discretos: la estructura estado-accion-recompensa de Taxi es analogo a problemas simplificados de logistica (recogida y entrega con restricciones), y el agente permite validar heuristicas de decision antes de trasladarlas a dominios reales.
- Reproduccion de estudios publicados: la busqueda web confirma la existencia de cuadernos de Kaggle dedicados a reproducir experimentos de Q-learning en Taxi-v4, para los que un agente serializado y compartido publicamente facilita la verificacion de resultados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card:

| Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (numero de episodios de evaluacion, desglose por configuracion inicial, comparacion con agentes de referencia ni curvas de aprendizaje).

## Requisitos de hardware

- VRAM necesaria para inferencia: ninguna. El agente no emplea GPU.
- Memoria RAM: del orden de kilobytes para la tabla Q, mas el consumo del interprete de Python y del entorno Gymnasium; el repositorio ocupa 0,0 GB.
- GPU recomendadas: no aplica. El calculo se reduce a una busqueda del maximo en un vector de 6 valores.
- Cabe en cualquier equipo: CPU de escritorio, portatil de gama baja, contenedor sin acelerador o incluso un dispositivo embebido con Python.
- Opciones de despliegue: ejecucion en proceso con Python y Gymnasium mediante `gym.make(model["env_id"])`; no son aplicables vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales de lenguaje. Si se necesita exponerlo como servicio, basta una API ligera (por ejemplo FastAPI o Flask) que reciba el estado y devuelva la accion.
- Latencia y throughput: no disponibles de forma oficial; al tratarse de una consulta a una tabla de unas 3000 entradas, la latencia esperada por accion es del orden de microsegundos y el cuello de botella real sera el propio simulador del entorno.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marcgabrielschneider/Taxi-v4 | Taxi-v3 | Q-learning tabular, implementacion propia | 7,56 +/- 2,71 (no verificado) | no disponible | Hugging Face Hub, 0 descargas |
| elibuilds/Taxi-v4 | Taxi-v4 | Q-learning tabular | no disponible | no disponible | Hugging Face Hub |
| Agentes DQN de referencia sobre Taxi-v3 (implementaciones habituales, p. ej. sobre Stable-Baselines3) | Taxi-v3 | Deep Q-Network (red neuronal) | no disponible en la informacion proporcionada | no disponible | repositorios de codigo abierto |

La comparacion cuantitativa no es posible con los datos disponibles: el unico valor numerico aportado corresponde a este modelo. Como referencia cualitativa, un DQN sobre Taxi-v3 requiere una red neuronal y entrenamiento con GPU o CPU prolongado, mientras que este agente tabular se entrena y evalua en segundos pero no generaliza a entornos con espacio de estados continuo.

## Limitaciones y advertencias

- Riesgo de sobreajuste al entorno: la tabla Q solo es valida para el MDP concreto de Taxi-v3; cualquier cambio en la dinamica, el numero de estados o las recompensas invalida la politica.
- Discrepancia de nomenclatura: el repositorio se llama Taxi-v4 mientras que las etiquetas, el README y el `model-index` apuntan a Taxi-v3. Conviene verificar el `env_id` almacenado en el pickle antes de usarlo en produccion.
- Metrica no verificada: el valor 7,56 +/- 2,71 esta declarado por el autor y marcado como `verified: false`. Se desconoce el numero de episodios de evaluacion y la semilla empleada.
- Varianza elevada: la desviacion tipica de 2,71 sobre una media de 7,56 sugiere episodios fallidos frecuentes; no es un agente con comportamiento uniformemente optimo.
- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Debe contactarse con el autor antes de integrarlo en un producto.
- Ausencia de documentacion de entrenamiento: no se publican hiperparametros, numero de episodios, politica de exploracion ni curva de convergencia, lo que limita la reproducibilidad estricta del resultado.
- Sesgos: no procede hablar de sesgos sociales, pero si de sesgo de politica, es decir, la politica queda fijada por la secuencia de exploracion usada durante el entrenamiento y puede ser suboptima en regiones del espacio de estados poco visitadas.
- Idiomas y contexto: no aplica, el agente no procesa lenguaje ni mantiene contexto conversacional.
- Sin soporte de tool calling ni de integracion con agentes LLM; no puede combinarse directamente con pipelines de generacion aumentada por recuperacion.
- Advertencia para produccion: al ser un artefacto de investigacion con cero descargas y creado en 2026, no hay evidencia de uso en entornos reales ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcgabrielschneider/Taxi-v4
- Perfil del autor en Hugging Face: https://huggingface.co/marcgabrielschneider/models
- Repositorio alternativo con el mismo nombre: https://huggingface.co/elibuilds/Taxi-v4
- Cuaderno de Kaggle sobre Q-learning reproducible en Taxi-v4: https://www.kaggle.com/code/alexandriadrake/taxi-v4-reproducible-q-learning-study
- Implementacion de Taxi-v4 con OpenAI Gymnasium en GitHub: https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium/blob/main/main.py
- Ficha de indice del modelo en Essamamdani: https://essamamdani.com/ai-models/hf-maxxime-taxi-v4
