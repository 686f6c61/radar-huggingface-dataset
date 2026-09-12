# IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda01

## Resumen

AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda01 es un modelo de robotica publicado por el usuario IXDLI en Hugging Face, etiquetado con los tags pytorch y robotics y con pipeline declarado como robotics. Se trata de una politica de difusion compuesta por dos expertos entrenados conjuntamente (uno denominado BEAVER, que procesa senales tactiles de dos anillos, y otro de vision), combinados mediante un router que solo observa las representaciones latentes de ambas modalidades. El objetivo declarado es la generacion de agarres (grasp) sobre una unica tarea identificada como cluster12.

La entrada de la rama BEAVER es un codificador unificado que consume 144 bits de contacto estrictos (distancia inferior a 10 mm) mas 9 caracteristicas de habilitacion de sensor; un contacto se considera valido unicamente si el estado es 5 o 9, la distancia es finita y no negativa, y se cumple la puerta de presencia. Las dos observaciones nativas (tactil y vision) entran como senales independientes en un MLP compartido, sin usar GRU ni distancias en crudo. El router se calcula exclusivamente a partir de las observaciones, con las representaciones tactil y visual desconectadas del grafo de gradientes (detach).

Su relevancia actual es limitada y sobre todo experimental: el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y toda la documentacion disponible consiste en la model card del autor. El interes tecnico esta en la combinacion de un router que no depende del paso de difusion (x_t y t no son entradas del router) con un peso de perdida auxiliar de expertos lambda_expert = 0,1, lo que lo convierte en un caso de estudio para arquitecturas de mezcla de expertos en politicas de difusion aplicadas a robotica de contacto (whole-arm/wrist manipulation, segun la nomenclatura WRM del nombre, cuyo significado no se especifica en la informacion disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion con dos expertos entrenados conjuntamente (BEAVER y vision) y router basado solo en observaciones; codificador BEAVER unificado con 144 bits de contacto estrictos (<10 mm) y 9 caracteristicas de habilitacion de sensor; ambas observaciones nativas alimentan un MLP compartido |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se publican cifras de parametros ni ratio de activacion del router) |
| Longitud de contexto | no aplicable (modelo de politica robotica, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; no se documenta ninguna variante cuantizada |
| Idiomas soportados | no disponible / no aplicable (el modelo no procesa lenguaje) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | PyTorch (.pt); checkpoints/ incluye last.pt con SHA-256 d83521621f1275d5f2efabdd66e20a417b93ff34b39eb1a5002ca4dfd711dd45; no se publican safetensors, GGUF ni ONNX |
| Tarea declarada | single task: cluster12 (agarre) |
| Configuracion de entrenamiento | 1 GPU, 8 CPU, batch size 32, 100 000 pasos, seguimiento en linea con W&B |
| Perdida auxiliar de expertos | lambda_expert = 0,1 |
| Tamano del repositorio | 25,2 GB |
| Autor | IXDLI |
| Fecha de creacion / actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura descrita combina dos componentes. Por un lado, un encoder BEAVER unificado que transforma el estado tactil en una representacion latente binaria y estricta: 144 bits de contacto (activos solo cuando la distancia es inferior a 10 mm) mas 9 caracteristicas de habilitacion de sensor. La validacion del contacto exige tres condiciones simultaneas: estado 5 o 9, distancia finita mayor o igual a cero y puerta de presencia. No se utilizan distancias en crudo ni capas recurrentes tipo GRU, de modo que el modelo no mantiene memoria temporal explicita y depende por completo de la observacion actual y del contexto inmediato que le proporcione el entorno. Las dos observaciones nativas (BEAVER y vision) se inyectan como entradas independientes en un MLP compartido, lo que separa la fusion multimodal del enrutado de expertos.

La innovacion principal declarada es el router "observation-only": se calcula a partir de detach(z_B), detach(z_V) y q, de forma que ni x_t (accion ruidosa en el paso de difusion) ni t (nivel de ruido) son entradas del router. Esto desacopla la decision de enrutado del proceso de denoising y evita que el gradiente del router modifique los encoders de las dos modalidades. El entrenamiento conjunto de ambos expertos se regulariza con una perdida auxiliar de balanceo de peso 0,1. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO (tecnicas propias de modelos de lenguaje, en cualquier caso no aplicables a esta politica). El entrenamiento concluyo a los 100 000 pasos sobre una unica GPU, con artefactos y codigo fuente alojados en checkpoints/.

## Capacidades

- Generacion de acciones de agarre mediante difusion, condicionadas simultaneamente por senales tactiles (BEAVER) y visuales.
- Deteccion de contacto tactil con umbral estricto de 10 mm y validacion por estado (5 o 9), distancia finita no negativa y puerta de presencia.
- Enrutado entre dos expertos especializados a partir exclusivamente de las observaciones, sin dependencia del paso de difusion.
- Fusion multimodal tactil-visual mediante un MLP compartido que recibe ambas observaciones como entradas independientes.
- Procesamiento de 144 bits de contacto mas 9 caracteristicas de habilitacion de sensor por observacion.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No se documenta modo de pensamiento (thinking), vision generativa, audio ni ninguna otra capacidad especial mas alla de las citadas.

## Casos de uso

- Agarre robotico de objetos con pinza de dos anillos tactiles: el modelo consume los 144 bits de contacto y la observacion visual para generar la trayectoria de agarre, siendo adecuado porque su encoder BEAVER esta disenado especificamente para senales tactiles binarias de corto alcance (<10 mm).
- Manipulacion de precision en tareas de pick-and-place de piezas pequenas: el umbral estricto de distancia y la puerta de presencia permiten discriminar contactos reales frente a falsos positivos del sensor, lo que reduce agarres fallidos en objetos de geometria irregular.
- Investigacion en politicas de difusion con mezcla de expertos: el modelo permite estudiar el efecto de un router desconectado del paso de difusion y del peso lambda_expert sobre el reparto de carga entre expertos, comparandolo con variantes que si condicionan el router en t.
- Ablacion de fusion multimodal: al recibir tactil y vision como entradas independientes de un MLP compartido, sirve para medir la contribucion de cada modalidad en el exito del agarre.
- Evaluacion de robustez a configuraciones de sensor distintas: los 9 bits de habilitacion permiten experimentar con sensores activos o inactivos, util para estudiar degradacion cuando falla parte del anillo tactil.
- Base para ajuste fino en nuevas tareas de agarre: aunque solo se ha entrenado en la tarea cluster12, el esquema encoder + expertos + router es reutilizable como inicializacion en tareas de agarre con la misma interfaz de sensores.
- Insercion o ensamblaje con control de fuerza implicito: la validacion de contacto por estado y distancia encaja en tareas donde interesa detectar el momento exacto de la colision.
- Despliegue en banco de pruebas de laboratorio: la configuracion declarada (1 GPU, 8 CPU, batch 32) sugiere un coste de entrenamiento contenido y reproducible en un unico nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito de agarre, comparaciones con lineas base ni metricas de simulacion o de robot real, y la busqueda web asociada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publica el tamano de last.pt ni el numero de parametros, por lo que no es posible calcularla a partir de la informacion proporcionada.
- El repositorio completo ocupa 25,2 GB, cifra que incluye checkpoints, artefactos y codigo fuente, y que no equivale al peso del modelo en memoria.
- GPU de entrenamiento: 1 GPU, con 8 CPU y batch size 32, segun la model card; no se especifica el modelo concreto de GPU.
- GPU recomendadas: no disponible; no se documenta ninguna recomendacion del autor.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de una politica de difusion y no de un modelo de lenguaje de gran tamano, es plausible que quepa en GPU de consumo con VRAM media, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: inferencia en PyTorch, usando los artefactos y el codigo fuente incluidos en checkpoints/. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, que en cualquier caso no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a modelos comparables, lineas base ni variantes de la misma familia, y la model card no cita ningun trabajo previo con el que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de licencia: sin terminos declarados no hay autorizacion explicita de uso comercial ni de redistribucion de los pesos, lo que supone un riesgo legal para cualquier despliegue en produccion.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de benchmarks ni evaluacion en robot real publicados.
- Entrenamiento limitado a una unica tarea (cluster12): no hay evidencia de generalizacion a otras tareas, objetos, morfologias de pinza o entornos.
- Ausencia de memoria temporal: al no emplear GRU ni recurrencia, el modelo no modela historiales largos, lo que puede degradar el comportamiento en manipulaciones con fases prolongadas.
- Umbral de contacto muy restrictivo: solo se consideran contactos con distancia inferior a 10 mm y estados 5 o 9; sensores con otra calibracion, otra frecuencia de muestreo o estados distintos pueden producir entradas invalidas o vacias.
- Descarte de distancias en crudo: al trabajar con bits de contacto en lugar de magnitudes continuas, se pierde informacion de intensidad que podria ser relevante para controlar la fuerza de agarre.
- Router desconectado: al usar detach(z_B) y detach(z_V), el enrutado no recibe gradiente de los encoders y puede asignar expertos de forma suboptima si las representaciones cambian durante el ajuste fino.
- Riesgo de acciones fuera de distribucion: como toda politica de difusion entrenada con datos limitados, puede generar trayectorias fisicamente invalidas o inseguras ante observaciones novedosas; es imprescindible limitar velocidades, fuerzas y recorridos a nivel de controlador.
- En el contexto fisico, el equivalente a la alucinacion es una prediccion de contacto o de agarre que no se corresponde con la realidad, con riesgo de dano al objeto o al robot.
- Sesgos conocidos: no disponibles; la model card no incluye analisis de sesgo ni de cobertura del dataset.
- Restricciones de idioma: no aplicables, el modelo no procesa lenguaje.
- Caveat de produccion: la unica verificacion de integridad disponible es el hash SHA-256 de last.pt; conviene recomputarlo antes de cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda01
- Perfil del autor: https://huggingface.co/IXDLI
- Paper, blog tecnico, repositorio de codigo independiente o demo: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos corresponden a emisiones de television en directo (ZDF y agregadores de television) y no guardan ninguna relacion con el modelo, por lo que no se incluyen como referencias.
