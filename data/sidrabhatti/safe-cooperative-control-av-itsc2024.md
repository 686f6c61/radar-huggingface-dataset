# SidraBhatti/safe-cooperative-control-av-itsc2024

## Resumen

Este repositorio de HuggingFace no contiene un modelo de aprendizaje automatico ni pesos entrenados: es el artefacto de publicacion de un articulo de investigacion sobre control cooperativo seguro de vehiculos automatizados (AV), presentado en el IEEE ITSC 2024. El autor del repositorio, Sidra Ghayour Bhatti, figura como coautora del trabajo, cuyo autor principal es Pei Yu Chang y cuya supervision corre a cargo de Qadeer Ahmed (OSU Center for Automotive Research). El repositorio ocupa 0.0 GB y solo incluye la model card en Markdown y referencias a figuras.

El problema que aborda es la seguridad en maniobras criticas de trafico: incorporacion en autopista, incorporacion en sentido contrario y cruce de una interseccion de cuatro ramas. La propuesta combina una ley de consenso de segundo orden en topologia lider-seguidor con un filtro de seguridad basado en funciones de barrera de control (CBF), resuelto como un programa cuadratico (QP) que selecciona la entrada de control segura mas cercana a la consensuada nominal.

Su relevancia actual es metodologica: el filtro de seguridad consigue una tasa de conflicto del 0 % en los tres escenarios simulados, incluido uno en el que sin filtro se producian conflictos en el 80,1 % de los puntos de muestreo. No obstante, para quien busca un modelo desplegable, el repositorio no ofrece pesos, tokenizador, pipeline ni codigo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica. No es una red neuronal: ley de consenso de segundo orden sobre grafo lider-seguidor (matriz laplaciana) con vehiculo modelado como masa puntual de doble integrador, mas filtro de seguridad CBF resolviendo un QP |
| Parametros totales | No aplica (no hay pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no procesa secuencias de texto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio no contiene pesos; tamano declarado 0.0 GB, solo model card y referencias a figuras) |

## Arquitectura y entrenamiento

El framework se organiza en dos capas. La primera es un controlador cooperativo: los vehiculos se comunican siguiendo una topologia lider-seguidor codificada como matriz laplaciana y cada AV se modela como masa puntual de doble integrador. Una ley de consenso de segundo orden genera la entrada de control nominal que lleva a todos los seguidores a coincidir con el estado del vehiculo de referencia (lider). La segunda capa es un filtro de seguridad: una funcion de barrera de control construida sobre una funcion de conjunto seguro propuesta, definida en terminos de posicion y velocidad relativas y de la deceleracion de frenado.

El filtro resuelve un programa cuadratico que busca la entrada de control mas proxima a la nominal que satisface la restriccion CBF, lo que garantiza la invariancia hacia delante del conjunto seguro (es decir, evitacion de colision demostrable) bajo las dinamicas asumidas. No hay entrenamiento en el sentido de machine learning: no se reportan tokens, composicion de dataset, RLHF ni DPO. La validacion es por simulacion en tres escenarios de trafico, cada uno ejecutado con y sin filtro de seguridad. El articulo esta publicado en el IEEE ITSC 2024 (pp. 902-907).

## Capacidades

- Generacion de entradas de control cooperativo para vehiculos automatizados bajo topologia lider-seguidor, forzando consenso con el estado del vehiculo de referencia.
- Filtrado de seguridad sobre una senal de control nominal: dado un comando cooperativo, devuelve el comando seguro mas cercano en norma cuadratica.
- Garantia de invariancia hacia delante del conjunto seguro bajo las dinamicas de doble integrador asumidas, lo que se traduce en evitacion de colision demostrable dentro del modelo.
- Gestion de tres escenarios de trafico especificos: incorporacion en autopista, incorporacion en sentido contrario e interseccion de cuatro ramas.
- Generacion de texto: no disponible. Razonamiento, codigo, matematicas, vision, audio: no disponibles.
- Tool calling / function calling: no disponible. Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Modo especial (thinking, vision, audio): no disponible.

## Casos de uso

- Validacion de algoritmos de incorporacion en autopista: el framework permite simular un flujo de AVs que deben alcanzar el estado del lider en una rampa de acceso; en el articulo se miden 33 puntos de conflicto sobre 957 waypoints sin filtro (3,45 %) y 0 % con filtro.
- Cruce de intersecciones de cuatro ramas: se puede emplear para comprobar si una politica de control existente produce conflictos en el cruce (1,5 % de waypoints en el escenario III sin filtro) y corregirlos anadiendo la capa CBF-QP.
- Maniobras en sentido contrario: util como caso de estres, dado que sin filtro el 80,1 % de los waypoints (775 de 958) presentaban conflicto, lo que lo convierte en un banco de pruebas exigente para cualquier controlador cooperativo.
- Capa de seguridad sobre controladores preexistentes: el filtro se define como una correccion sobre una entrada nominal, por lo que puede acoplarse a planificadores o controladores ya desplegados en simulacion sin redisenar la politica base.
- Investigacion en convoyes y platooning: la formulacion lider-seguidor con matriz laplaciana es directamente reutilizable para estudiar formaciones de vehiculos y estudiar como la topologia de comunicacion afecta al consenso.
- Verificacion de propiedades de seguridad en bucle de simulacion: el planteamiento CBF permite comprobar empiricamente la invariancia del conjunto seguro antes de plantear ensayos en pista o en vehiculo real.
- Punto de partida metodologico para extensiones: los propios autores senalan como trabajo futuro anadir un modelo cinematico y explorar funciones de conjunto seguro alternativas, lo que convierte el repositorio en una base para tesis y proyectos de control de AVs.

## Benchmarks y rendimiento

Los unicos resultados cuantitativos disponibles son los del articulo, correspondientes a simulacion. No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, porque el artefacto no es un modelo de lenguaje.

| Escenario | Puntos de conflicto sin filtro | Tasa de conflicto sin filtro | Tasa de conflicto con filtro |
|---|---|---|---|
| I - Incorporacion en autopista | 33 / 957 waypoints | 3,45 % | 0 % |
| II - Incorporacion en sentido contrario | 775 / 958 waypoints | 80,1 % | 0 % |
| III - Interseccion de cuatro ramas | 12 / 801 waypoints | 1,5 % | 0 % |

El articulo senala como contrapartida que los vehiculos deben desviarse de sus trayectorias nominales para evitar colisiones, lo que puede incrementar el esfuerzo de control y el tiempo de viaje. No se proporcionan cifras concretas de latencia, throughput ni coste computacional del solver QP.

## Requisitos de hardware

- VRAM para inferencia: no aplica. No hay pesos ni inferencia de red neuronal que ejecutar.
- GPU recomendadas: no disponible. El trabajo es una simulacion de control; no se especifica en la model card si se ejecuto en CPU o en GPU.
- Ejecucion en GPU de consumo: no disponible. Al no haber pesos, no existe requisito de memoria de GPU asociado al artefacto.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles. Ninguna de estas herramientas es aplicable, ya que no hay un modelo generativo que servir.
- Coste computacional estimado: no disponible. Depende por completo del solver QP y de la implementacion de la simulacion, que no se publican en el repositorio. El cuello de botella esperable es la resolucion del QP por paso de control, no el calculo matricial a gran escala.
- Reproducibilidad: el repositorio no incluye codigo, datos de escenarios ni scripts de simulacion, por lo que no es posible desplegar ni reproducir los resultados sin reimplementar el metodo descrito en el articulo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye artefactos comparables y el repositorio no es un modelo entrenado, por lo que una comparacion en terminos de parametros, contexto o rendimiento carece de sentido. Como referencia cualitativa, el trabajo pertenece a la familia de filtros de seguridad basados en CBF resueltos mediante QP y de control cooperativo por consenso, pero no se aportan datos de otras implementaciones con los que contrastarlo.

| Criterio | Este repositorio | Alternativas comparables |
|---|---|---|
| Parametros | No aplica | No disponible |
| Longitud de contexto | No aplica | No disponible |
| Rendimiento | Tasa de conflicto 0 % en tres escenarios simulados | No disponible |
| Licencia | MIT | No disponible |
| Disponibilidad | Repositorio de 0.0 GB sin pesos ni codigo | No disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador, pipeline ni codigo de simulacion: es unicamente un artefacto de publicacion con la model card. No es desplegable como modelo.
- El modelo de vehiculo es una masa puntual de doble integrador, que ignora la dinamica cinematica real (geometria de direccion, limites de curvatura, retardo de actuadores). Los propios autores proponen anadir un modelo cinematico como trabajo futuro.
- Las garantias de evitacion de colision son validas bajo las suposiciones del framework: comunicacion fiable entre vehiculos segun la topologia laplaciana y ausencia de retardo, ruido o perdida de paquetes en la informacion compartida.
- La validacion es exclusivamente en simulacion. No se reportan ensayos en pista, en vehiculo real ni con hardware en bucle.
- Existe un compromiso explicito entre seguridad y eficiencia: evitar conflictos obliga a desviarse de la trayectoria nominal, lo que puede aumentar el esfuerzo de control y el tiempo de viaje. No se cuantifica esa penalizacion.
- La licencia MIT se declara en la model card, pero no hay codigo en el repositorio sobre el que aplicar dicha licencia; conviene verificar los terminos del articulo publicado en IEEE antes de reutilizar figuras o contenido.
- No se detalla el solver QP empleado ni el entorno de simulacion, lo que dificulta la reproducibilidad y la comparacion con otros trabajos.
- No procede evaluar sesgos de datos ni riesgo de alucinacion, ya que no hay modelo de lenguaje implicado; esos apartados no aplican.
- El repositorio registra 0 descargas y 0 likes, y no cuenta con pipeline declarado, por lo que no hay evidencia de uso externo ni de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SidraBhatti/safe-cooperative-control-av-itsc2024
- Articulo: P. Y. Chang, S. G. Bhatti, N. U. Javed, and Q. Ahmed, "Enhancing Safety at Highway Ramps and Intersections Using Safe Cooperative Controls in Automated Vehicles", 2024 IEEE 27th International Conference on Intelligent Transportation Systems (ITSC), Edmonton, Canada, pp. 902-907, 2024. DOI: https://doi.org/10.1109/ITSC58415.2024.10920020
- BibTeX del articulo: incluido en la model card del repositorio.
