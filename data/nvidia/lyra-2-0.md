# nvidia/Lyra-2.0

## Resumen

Lyra 2.0 es un framework de generacion de mundos 3D persistentes y explorables a partir de una unica imagen, desarrollado por NVIDIA (nv-tlabs) y publicado en HuggingFace bajo el identificador nvidia/Lyra-2.0. No es un modelo de lenguaje ni un generador de imagenes: su pipeline declarado es image-to-3d, con entrada de una imagen (a 480x832) mas una secuencia de poses de camara (se recomiendan 81 fotogramas) y salida de una escena 3D explicita representada como nubes de Gaussianas 3D en formato .ply.

El framework consta de dos etapas: primero sintetiza un video de largo alcance con consistencia geometrica global, y despues reconstruye la secuencia generada en una representacion 3D explicita. Para atacar el olvido espacial, mantiene geometria 3D por fotograma y la usa unicamente para el enrutado de informacion (recuperar fotogramas pasados relevantes y establecer correspondencias densas con los puntos de vista objetivo), dejando la sintesis de apariencia al prior generativo. Para atacar la deriva temporal, se entrena con historiales autoaumentados que exponen al modelo a sus propias salidas degradadas.

El modelo deriva de WAN-14B (Wan2.1) y cuenta con 14.000 millones de parametros. Su relevancia actual esta ligada a la investigacion en world models: permite generar escenas explorables con persistencia espacial a escala y soporta renderizado en tiempo real de la representacion resultante. Su licencia, sin embargo, es estrictamente de investigacion interna: prohibe distribucion, despliegue y uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes de red neuronal convolucional (CNN), segun la model card |
| Parametros totales | 14B |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (la entrada se especifica como 81 fotogramas de poses de camara) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | NVIDIA Internal Scientific Research and Development Model License |
| Formato de pesos | no disponible (el repositorio ocupa 98,3 GB; la salida del modelo es .ply) |
| Tarea (pipeline) | image-to-3d |
| Entrada | Imagen 2D a 480x832 y array 1D de poses de camara (81 fotogramas recomendados) |
| Salida | Escena de Gaussianas 3D (posicion, covarianza, color/SH, opacidad), fichero point cloud .ply |
| Modelo base | WAN-14B (Wan2.1) |
| Motor de ejecucion declarado | WAN-2.1 |
| Compatibilidad de hardware | NVIDIA Ampere, Hopper y Blackwell |
| Sistema operativo soportado | Linux |
| Version del modelo | V1.0 |
| Fecha de publicacion | Repositorio de GitHub el 14/04/2026; modelo en HuggingFace creado el 06/04/2026 |
| Tamano del repositorio | 98,3 GB |
| Descargas / likes en HuggingFace | 756 / 357 |
| Libreria en HuggingFace | lyra-2.0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como una combinacion de CNN y Transformer, con arquitectura de red Transformer, desarrollada a partir de WAN-14B (Wan2.1). El modelo tiene 14.000 millones de parametros. El diseno es de dos etapas: una primera fase sintetiza un video de largo recorrido con consistencia geometrica global a partir de la imagen de entrada y de la trayectoria de camara, y una segunda fase reconstruye esa secuencia en una representacion 3D explicita.

La innovacion tecnica declarada se articula en torno a dos problemas. El primero es el olvido espacial: el modelo mantiene geometria 3D por fotograma y la emplea exclusivamente para el enrutado de informacion, recuperando fotogramas pasados relevantes y estableciendo correspondencias densas con los puntos de vista objetivo, mientras delega la sintesis de apariencia en el prior generativo. El segundo es la deriva temporal: el entrenamiento utiliza historiales autoaumentados que exponen al modelo a sus propias salidas degradadas, de modo que aprende a corregir la deriva en lugar de propagarla. Este diseno de dos etapas permite generacion de escenas con persistencia espacial a escala y renderizado en tiempo real.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card incluye una seccion de entrenamiento truncada que no aporta datos adicionales.

## Capacidades

- Generacion de escenas 3D explorables a partir de una sola imagen, con salida en forma de conjunto de Gaussianas 3D exportable a .ply.
- Sintesis de video de largo recorrido con consistencia geometrica global como etapa intermedia del pipeline.
- Reconstruccion de la secuencia generada en una representacion 3D explicita con atributos por Gaussiana: posicion (media 3D), covarianza (vector de escala 3D y cuaternion de rotacion 4D), color (RGB o coeficientes de armonicos esfericos para color dependiente de la vista) y opacidad escalar.
- Control de la generacion mediante parametros de camara: la entrada incluye un array 1D de poses de camara, con 81 fotogramas recomendados, lo que permite definir la trayectoria de exploracion.
- Correccion de deriva temporal y mitigacion del olvido espacial mediante geometria por fotograma para enrutado de informacion y correspondencias densas.
- Renderizado en tiempo real de la escena generada, segun la descripcion del autor.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Capacidad especial: no se declaran modos de vision, audio ni modo de razonamiento; el modelo consume imagenes y poses de camara, y produce geometria.

## Casos de uso

- Investigacion en world models: el modelo permite a investigadores generar escenas 3D persistentes desde una unica imagen y estudiar problemas de consistencia geometrica global y deriva temporal, que son los dos ejes tecnicos que aborda el diseno.
- Generacion de datos sinteticos para percepcion 3D: las escenas de Gaussianas 3D exportadas como .ply pueden servir como entornos de entrenamiento o evaluacion para modelos de reconstruccion, novel view synthesis o estimacion de profundidad, siempre dentro del marco de investigacion que impone la licencia.
- Simulacion de entornos para agentes roboticos: al generar una escena explorable con trayectorias de camara controladas, se pueden construir entornos sinteticos en los que probar navegacion o planificacion, aunque la licencia impide su uso en produccion o despliegue.
- Previsualizacion de escenarios virtuales: partiendo de un concepto en imagen unica (por ejemplo, un boceto de entorno), el modelo genera una representacion 3D recorrible util para blocking y previsualizacion de niveles antes de abordar modelado manual.
- Previsualizacion cinematografica y VFX: la entrada de 81 poses de camara permite definir movimientos concretos y obtener una escena 3D consistente que se puede renderizar desde nuevos puntos de vista, lo que encaja en tareas de previz y layout.
- Recorridos virtuales interactivos: gracias al renderizado en tiempo real de las Gaussianas 3D, la escena resultante puede explorarse de forma interactiva, lo que resulta util en demos de investigacion y evaluacion cualitativa de la persistencia espacial.
- Reconstruccion asistida de espacios: a partir de una fotografia de un entorno (interior o exterior) se puede obtener una representacion 3D explorable, util para estudiar gemelos digitales o analisis de escena en un contexto de I+D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con metricas como PSNR, LPIPS, FID o similitud de escena, y los resultados de busqueda web obtenidos no aportan datos de evaluacion del modelo.

## Requisitos de hardware

- GPU objetivo declaradas por el autor: NVIDIA H100 y GB200, sobre las que el modelo esta disenado u optimizado para aprovechar nucleos GPU y bibliotecas CUDA.
- Microarquitecturas compatibles segun la model card: NVIDIA Ampere, NVIDIA Hopper y NVIDIA Blackwell.
- Sistema operativo soportado: Linux.
- VRAM estimada para inferencia: no disponible como dato del autor. Como referencia orientativa no confirmada, los 14B parametros del modelo implicarian del orden de 28 GB en precision de 16 bits; el repositorio ocupa 98,3 GB, lo que sugiere que incluye mas material que un unico conjunto de pesos en una sola precision. Estas cifras son estimaciones derivadas del numero de parametros y del tamano del repositorio, no valores publicados por NVIDIA.
- Memoria adicional para la salida: el modelo produce un conjunto de Gaussianas 3D cuyo numero (M) no se especifica en la informacion disponible, por lo que no se puede estimar la memoria de renderizado ni de almacenamiento de la escena.
- Compatibilidad con GPU de consumo: no confirmada. El autor no menciona GPUs de la gama RTX de consumo y no se publican cuantizaciones que permitan reducir el requisito de memoria.
- Opciones de despliegue: el motor de ejecucion declarado es WAN-2.1, y el codigo se distribuye a traves del repositorio nv-tlabs/lyra (ruta Lyra-2). No aplican herramientas de servido de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles para la generacion. El autor unicamente indica que el diseno de dos etapas habilita renderizado en tiempo real de la escena, sin cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generacion de escenas 3D a partir de imagen. El unico modelo relacionado que aparece mencionado es WAN-14B (Wan2.1), del que Lyra 2.0 deriva y que se usa como motor de ejecucion, pero se trata de un modelo base de generacion de video y no de un competidor directo en la tarea image-to-3d, por lo que no se dispone de una comparacion de parametros, contexto, rendimiento y licencia frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia altamente restrictiva: NVIDIA Internal Scientific Research and Development Model License. El modelo y sus derivados no pueden distribuirse, desplegarse, sublicenciarse, mostrarse publicamente ni ejecutarse publicamente, y no pueden usarse en entornos de produccion ni para generar obras destinadas a venta o distribucion.
- Terminacion automatica de derechos: el incumplimiento de cualquiera de los terminos de la licencia extingue automaticamente los derechos concedidos.
- Uso previsto limitado a investigacion interna: la model card indica que el modelo esta listo para uso interno de investigacion y desarrollo cientifico, y que su publico objetivo son investigadores que desarrollan tecnicas de world models.
- Resolucion de entrada fijada: la imagen de entrada debe ser de 480x832, y se recomienda una secuencia de 81 fotogramas de parametros de camara. No se documenta comportamiento fuera de ese rango.
- Riesgo de alucinacion geometrica: al ser un modelo generativo que sintetiza apariencia a partir de un prior, las regiones no observadas de la escena se generan, no se miden, por lo que la geometria reconstruida puede no corresponder con la realidad fisica del entorno fotografiado.
- Deriva temporal y olvido espacial: aunque el diseno aborda explicitamente estos dos problemas con geometria por fotograma y entrenamiento con historiales autoaumentados, son limitaciones reconocidas del enfoque y el autor no publica metricas cuantitativas de su magnitud residual.
- Idiomas: no aplica ni se documenta, ya que el modelo no procesa texto.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto: no se especifica una longitud de contexto en tokens; el limite practico lo marca el numero de fotogramas de camara soportados.
- Caveat de produccion: mas alla de la prohibicion legal de uso en produccion, no se documentan cuantizaciones, latencias, throughput ni pruebas de robustez, lo que impide evaluar su viabilidad como componente de un sistema desplegado.
- La model card incluye la recomendacion generica de NVIDIA de realizar pruebas adicionales con datos especificos del caso de uso antes de integrar modelos fundacionales o ajustados en sistemas de IA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Lyra-2.0
- Paper: https://arxiv.org/abs/2604.13036
- Pagina del proyecto: https://research.nvidia.com/labs/sil/projects/lyra2/
- Repositorio de codigo: https://github.com/nv-tlabs/lyra/tree/main/Lyra-2
- Modelo base / motor de ejecucion WAN-2.1: https://github.com/Wan-Video/Wan2.1/
- Licencia NVIDIA Internal Scientific Research and Development Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-internal-scientific-research-and-development-model-license/
