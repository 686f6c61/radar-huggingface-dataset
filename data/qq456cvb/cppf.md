# qq456cvb/CPPF

## Resumen

CPPF (Category-level 9D Pose Estimation in the Wild) es un metodo de estimacion de pose 9D a nivel de categoria para objetos en la nube de puntos 3D, presentado en CVPR 2022 por Yang You, Ruoxi Shi, Weiming Wang y Cewu Lu. El repositorio aloja los checkpoints preentrenados del modelo, no un modelo de lenguaje: se trata de una red neuronal de vision por computador que predice la traslacion, la rotacion y el tamano de objetos a partir de nubes de puntos, sin necesidad de CAD especifico de instancia.

El modelo resuelve el problema de la brecha sim-to-real: se entrena exclusivamente con modelos sinteticos de ShapeNet y pretende generalizar a escenas reales, lo que lo hace relevante para robotica, manipulacion y realidad aumentada donde no se dispone de mallas exactas de los objetos. La representacion se apoya en dos codificadores complementarios (un codificador de puntos y un codificador de caracteristicas de pares de puntos, PPF) que se combinan para producir la estimacion de pose.

El repositorio contiene un conjunto de checkpoints organizados por categoria de ShapeNet (bathtub, bed, bookshelf, bottle, bowl, camera, can, chair, laptop, mug, sofa, table, entre otras), junto con configuraciones de Hydra usadas en el entrenamiento. El peso total del repositorio es de 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de dos codificadores (codificador de puntos + codificador de caracteristicas de pares de puntos, PPF) para estimacion de pose 9D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), con instantaneas de configuracion en Hydra (`.yaml`) |

Nota: el modelo no es un modelo de lenguaje ni un modelo multimodal de texto; los campos de contexto, idiomas y cuantizacion estandar de LLM no son aplicables.

## Arquitectura y entrenamiento

CPPF combina dos codificadores complementarios sobre la nube de puntos de entrada: un `point_encoder` que aprende representaciones globales de la nube y un `ppf_encoder` que explota las caracteristicas de pares de puntos (Point Pair Features) para capturar relaciones geometricas locales. El metodo aborda la estimacion de pose 9D a nivel de categoria, es decir, predice traslacion, rotacion y dimensiones del objeto para instancias de una categoria conocida pero de geometria no vista durante el entrenamiento.

El entrenamiento es puramente sim-to-real: se utilizan exclusivamente modelos sinteticos de ShapeNet, sin datos reales anotados. Esta eleccion de diseno es la innovacion central del trabajo, ya que permite entrenar sin capturas reales anotadas a nivel de categoria y trasladar el modelo a escenas del mundo real. El repositorio incluye un checkpoint por categoria (pesos del mejor epoch para cada codificador) y una variante de regresion (`bowl_reg`) ademas de un segmentador auxiliar para portatiles (`laptop_aux`, que separa tapa y base). No se especifica en la informacion proporcionada el numero exacto de tokens, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Estimacion de pose 9D a nivel de categoria: predice traslacion (3D), rotacion (3D) y tamano (3D) de objetos a partir de nubes de puntos.
- Procesamiento de nubes de puntos 3D como entrada principal.
- Generalizacion sim-to-real: entrenado con modelos sinteticos de ShapeNet, disenado para escenas reales.
- Cobertura por categoria: checkpoints especificos para bathtub, bed, bookshelf, bottle, bowl, camera, can, chair, laptop, mug, sofa y table, entre otras.
- Variante de regresion (`bowl_reg`) para la categoria bowl.
- Segmentacion auxiliar en portatiles (`laptop_aux`), que separa la tapa y la base del objeto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Robotica de manipulacion: estimar la pose 6D/9D de objetos cotidianos (tazas, botellas, sillas) para que un brazo robotico planifique agarres sin disponer de CAD especifico de cada instancia.
- Realidad aumentada en interiores: superponer contenido virtual sobre muebles (mesas, sofas, camas) detectados en una escena 3D, aprovechando la prediccion de tamano y orientacion a nivel de categoria.
- Escaneo y reconstruccion 3D: alinear y registras objetos de una escena captada con sensores de profundidad, usando los checkpoints por categoria para estimar la transformacion de cada objeto.
- Benchmark academico de pose a nivel de categoria: servir como linea base reproducible frente a metodos como NOCS o SPD en conjuntos de evaluacion estandar, gracias a los pesos publicados y las configuraciones de Hydra.
- Logistica y almacen: estimar la orientacion y dimensiones de cajas u objetos apilados en nubes de puntos de un escaner para el control de inventario y la planificacion de picking.
- Investigacion en sim-to-real: emplear el modelo como referencia para estudiar la transferencia de modelos entrenados en ShapeNet a dominios reales y desarrollar tecnicas de adaptacion de dominio.
- Interaccion humano-robot en el hogar: reconocer la pose de utensilios (vasos, platos, cubiertos) en tiempo de ejecucion para tareas de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los valores de evaluacion (por ejemplo, en los conjuntos de evaluacion habituales de pose a nivel de categoria como REAL275 o CAMERA25) aparecen en el articulo original (arXiv:2203.03089) y en la pagina del proyecto, pero no se incluyen en la informacion proporcionada en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo es una red de vision 3D de tamano moderado, por lo que es probable que quepa en GPU de consumo, pero no se aportan cifras concretas en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: uso mediante el repositorio oficial de PyTorch (https://github.com/qq456cvb/CPPF); los checkpoints se descargan con `hf download qq456cvb/CPPF --local-dir checkpoints` y se colocan en la carpeta `checkpoints/` del repositorio de codigo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos en la informacion proporcionada para comparar con alternativas como NOCS (Normalized Object Coordinate Space, CVPR 2019) o SPD (Structure-Preserving and Deformation-Aware, NeurIPS 2020), que abordan el mismo problema de pose 9D a nivel de categoria. Cualquier comparacion de parametros, contexto, rendimiento y licencia con estas alternativas requeriria consultar el articulo original y sus respectivas hojas de especificaciones, que no forman parte de la informacion suministrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CPPF | no disponible | no aplica | no disponible | MIT | checkpoints publicos |
| NOCS | no disponible | no aplica | no disponible | no disponible | no disponible |
| SPD | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente con modelos sinteticos de ShapeNet: aunque el objetivo es la generalizacion sim-to-real, el rendimiento en dominios muy alejados de la distribucion de entrenamiento puede degradarse.
- Cobertura limitada a las categorias incluidas en el repositorio; no generaliza a categorias no listadas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta conversacion, tool calling ni agentes.
- La estimacion a nivel de categoria asume que el objeto pertenece a una de las categorias conocidas; objetos fuera de categoria o deformables pueden no manejarse correctamente.
- Riesgo de imprecision en la prediccion de pose con geometrias ambiguas, oclusiones severas o ruido en la nube de puntos; no se aportan tasas de error en la informacion disponible.
- No se documentan sesgos especificos del dataset ShapeNet en la informacion proporcionada, pero conviene revisar la composicion del conjunto sintetico antes de un despliegue en produccion.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias explicitas de rendimiento ni de idoneidad para un caso de uso concreto.
- El repositorio no incluye demos, tarjetas de evaluacion ni cifras de latencia, por lo que la integracion requiere replicar el pipeline del repositorio de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qq456cvb/CPPF
- Articulo en arXiv: https://arxiv.org/abs/2203.03089
- Pagina del articulo en HuggingFace Papers: https://huggingface.co/papers/2203.03089
- Codigo en GitHub: https://github.com/qq456cvb/CPPF
- Pagina del proyecto: https://qq456cvb.github.io/projects/cppf
- Articulo en CVPR 2022 (Open Access): https://openaccess.thecvf.com/content/CVPR2022/html/You_CPPF_Towards_Robust_Category-Level_9D_Pose_Estimation_in_the_Wild_CVPR_2022_paper.html
- Conjunto de datos asociado en HuggingFace: https://huggingface.co/datasets/qq456cvb/CPPF
