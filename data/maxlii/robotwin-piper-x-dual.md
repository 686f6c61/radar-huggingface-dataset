# maxlii/Robotwin-piper-x-dual

## Resumen

El repositorio `maxlii/Robotwin-piper-x-dual` no es un modelo de lenguaje ni un modelo de IA entrenado: es un paquete de activos de robotica (assets) para un "embodiment" de manipulador bimanual denominado `piper_x_dual_real`. Segun la model card, contiene la URDF y configuracion calibradas e independientes de los brazos izquierdo y derecho, la SRDF compartida, las esferas de colision y todas las mallas referenciadas. El autor lo describe como "paquete fuente persistente y portable" que sustituye a un directorio de staging en cache ya eliminado.

El problema que resuelve es de reproducibilidad: al estar congelado el embodiment, cualquier maquina puede regenerar su configuracion local (`curobo.yml`) a partir de plantillas portables ejecutando `python prepare_curobo_paths.py --assets-root <assets-dir>`. El nombre del fichero de configuracion sugiere integracion con la pila de planificacion de movimiento cuRobo, y el nombre del repositorio apunta al entorno de benchmark de manipulacion bimanual RoboTwin, aunque la model card no confirma ninguna de las dos cosas de forma explicita.

La relevancia es acotada y de nicho: sirve para reproducir experimentos de robotica bimanual sobre una configuracion fisica concreta, no para tareas de inferencia de lenguaje. El repositorio es practicamente vacio en el momento de la indexacion (tamano 0,0 GB, 0 descargas, 0 likes, sin licencia declarada), por lo que debe tratarse como un artefacto de trabajo mas que como un recurso consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo neuronal; es un paquete de descripcion cinematica: URDF por brazo, SRDF compartida, esferas de colision y mallas) |
| Parametros totales | no aplicable (no hay parametros de red; el repositorio indexado ocupa 0,0 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (los idiomas no aplican a un paquete de activos; la model card esta redactada en ingles) |
| Licencia | no disponible (no declarada en la informacion proporcionada) |
| Formato de pesos | no aplicable; formatos de fichero presentes: URDF (XML), SRDF (XML), plantillas YAML, mallas referenciadas (formato no especificado en la model card) y un script Python (`prepare_curobo_paths.py`) |
| Autor | maxlii |
| Repositorio | https://huggingface.co/maxlii/Robotwin-piper-x-dual |
| Fecha de creacion | 2026-09-11T21:27:21.000Z |
| Ultima actualizacion | 2026-09-11T21:27:57.000Z |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No existe entrenamiento asociado: el paquete no contiene pesos ni proceso de optimizacion alguno. Su "arquitectura" es la descripcion geometrica y cinematica de un sistema robotico bimanual. La model card detalla que la URDF y la configuracion estan calibradas de forma independiente para el brazo izquierdo y el derecho, que la SRDF es compartida y que se incluyen las esferas de colision y todas las mallas referenciadas. Esta separacion izquierda/derecha es habitual cuando cada brazo se calibra por separado respecto a una base comun.

El mecanismo de portabilidad es la pieza tecnica destacable: las rutas absolutas dependientes de la maquina no se almacenan en el paquete, sino que se regeneran desde plantillas ejecutando `python prepare_curobo_paths.py --assets-root <assets-dir>`. La propia model card aclara que los ficheros generados son "estado local de la maquina y no entradas de calibracion", es decir, que la calibracion vive en el paquete y las rutas en el entorno. El paquete se declara congelado ("frozen"), con una regla explicita de gobernanza: no modificar calibracion, geometria de camara ni iluminacion, y ante cualquier cambio fisico del workcell crear un nuevo embodiment o bundle y revalidarlo.

## Capacidades

- Descripcion cinematica bimanual: URDF y configuracion calibradas de forma independiente para el brazo izquierdo y el derecho del embodiment `piper_x_dual_real`.
- Semantic description compartida: SRDF unica para el sistema completo.
- Deteccion de colisiones: conjunto de esferas de colision incluidas en el paquete, utilizables por planificadores que acepten primitivas de colision.
- Mallas asociadas: todas las mallas referenciadas por los ficheros de descripcion estan incluidas en el paquete.
- Portabilidad entre maquinas: regeneracion de rutas locales mediante `prepare_curobo_paths.py` a partir de plantillas portables.
- Generacion de configuracion de planificacion: el script produce `curobo.yml` para el planner correspondiente.
- No soporta: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues. No es un modelo de IA.

## Casos de uso

- Simulacion bimanual de manipulacion: cargar la URDF y la SRDF en el simulador o benchmark que corresponda para reproducir el embodiment `piper_x_dual_real` y comparar resultados con una configuracion fisica ya validada.
- Planificacion de movimiento con cuRobo: regenerar `curobo.yml` sobre la copia local del paquete y alimentar al planner con la cinematica calibrada y las esferas de colision, evitando redefinir geometria a mano.
- Validacion de colisiones: usar las esferas de colision incluidas para comprobar autocolisiones y colisiones con el entorno antes de desplegar una trayectoria en el robot real.
- Reproduccion de experimentos de investigacion: al ser un paquete congelado y versionado, permite que terceros repliquen un setup de banco de trabajo concreto sin depender de rutas locales del autor original.
- Gemelo digital de un workcell dual: mantener la descripcion geometrica del sistema real como referencia para tareas de visualizacion, analisis de alcance o estudio de colocacion de camaras.
- Archivo y gobernanza de versiones de embodiment: usar el paquete como linea base inmutable; cualquier cambio fisico exige, segun la model card, un nuevo bundle y una revalidacion.
- Integracion en CI de robotica: comprobar de forma automatica que la regeneracion de rutas desde plantillas produce una configuracion coherente y que las mallas referenciadas existen antes de aceptar un cambio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de ningun tipo (ni de planificacion, ni de exito de tarea, ni de tiempos de computo), y no procede aplicar metricas de modelos de lenguaje (MMLU, HumanEval, GSM8K) a un paquete de activos cinematicos.

## Requisitos de hardware

- VRAM para inferencia: no aplicable (no hay inferencia de red neuronal en el paquete).
- GPU recomendadas: no disponible. La computacion depende por completo de la pila externa que consuma los activos (simulador o planificador), no del paquete.
- GPU de consumo: no aplicable en si mismo; el paquete puede procesarse en CPU, pero no hay datos sobre los requisitos de la pila de planificacion asociada.
- Almacenamiento: el repositorio indexado ocupa 0,0 GB, aunque la model card afirma incluir mallas, por lo que el tamano real del contenido no coincide con lo indexado y no puede confirmarse.
- Opciones de despliegue: no disponible. La unica pista es `prepare_curobo_paths.py`, que genera `curobo.yml`; no se documentan contenedores, paquetes ni integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay en la informacion proporcionada datos de parametros, contexto, rendimiento ni licencia de otros paquetes de activos comparables, ni metricas de este paquete que permitan establecer una comparacion. Tampoco procede compararlo con modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion con criterios de LLM (benchmarks, cuantizacion, contexto, tool calling) es inaplicable.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso para uso comercial, redistribucion ni modificacion.
- Repositorio aparentemente vacio: 0,0 GB indexados, 0 descargas y 0 likes, en contradiccion con una model card que dice contener mallas y ficheros de configuracion; el contenido real puede no estar subido o no haberse indexado.
- Fechas anomalas: las marcas de creacion y actualizacion (2026-09-11) no son verificables con la informacion disponible.
- Embodiment congelado: modificar calibracion, geometria de camara o iluminacion invalida el paquete; la model card exige crear un nuevo bundle y revalidar ante cualquier cambio fisico del workcell.
- Los ficheros generados no son entradas de calibracion: confundir `curobo.yml` con la fuente de verdad de calibracion es un error de uso documentado por el propio autor.
- Dependencia de una pila externa no documentada: la model card no especifica versiones de cuRobo, del simulador ni del robot, lo que puede provocar incompatibilidades silenciosas.
- Sin documentacion de hardware: no se detalla el modelo fisico de brazo, grados de libertad ni base cinematica mas alla del nombre `piper_x_dual_real`.
- Sin garantias de mantenimiento: el paquete se declara sustituto de un directorio de staging eliminado, con un unico autor y sin historial de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxlii/Robotwin-piper-x-dual
- Script de regeneracion de rutas citado en la model card: `prepare_curobo_paths.py` (incluido en el propio paquete, sin enlace publico disponible)
- Paper, blog, repositorio o demo adicionales: no disponible. Los resultados de la busqueda web realizada no contienen ninguna referencia relevante al modelo, al autor ni al paquete (unicamente paginas corporativas de Microsoft sin relacion con el contenido).
