# jgkwak/solv3r

## Resumen

Solv3R es un modelo de reconstruccion 3D multi-vista presentado en el paper "Solv3R: 3D Looped Transformer as a Multi-view Solver" (arXiv:2611.02857) por Jeong-gi Kwak, Andrea Tagliasacchi, Sho Kagami, Yuki Ono y Kwang Moo Yi. Los pesos preentrenados se distribuyen en el repositorio de Hugging Face `jgkwak/solv3r` y estan construidos sobre la base de DVLT (nv-tlabs/dvlt). El modelo aborda la tarea de estimar geometria y camaras a partir de un conjunto de imagenes de una misma escena, devolviendo mapas de profundidad, confianza, rayos, nubes de puntos en coordenadas de mundo y una codificacion de pose de camara.

La propuesta central es un transformer "looped" (iterativo) que actua como solver multi-vista: en lugar de una pasada unica, el modelo aplica un numero configurable de iteraciones (`calls`) sobre un contexto codificado de las imagenes, refinando progresivamente la solucion. La API expuesta en la model card divide el flujo en tres fases explicitas: `encode` (codificacion de las vistas), `solve` (resolucion iterativa) y `decode` (extraccion de profundidad, rayos y poses). Esta separacion permite ajustar el coste computacional en funcion de la precision requerida.

El modelo es relevante para la comunidad de vision por computador por su enfoque de "solver" iterativo aplicado a reconstruccion 3D, una linea que busca mejorar la consistencia multi-vista frente a arquitecturas de una sola pasada. Su licencia NVIDIA limita el uso a investigacion y evaluacion no comercial, lo que restringe su adopcion en productos. El repositorio ocupa 0,5 GB y las descargas y likes registrados son cero en el momento de la consulta, lo que indica que se trata de una publicacion muy reciente y con escasa traccion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (iterativo) para reconstruccion 3D multi-vista, construido sobre DVLT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el contexto lo define el numero de vistas de entrada, no un contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | NVIDIA License (uso no comercial, solo investigacion y evaluacion) |
| Formato de pesos | safetensors (`solv3r.safetensors`) |

## Arquitectura y entrenamiento

Solv3R se describe como un "3D Looped Transformer" que actua como solver multi-vista. La arquitectura se articula en tres etapas: una codificacion de las imagenes de entrada (`encode`), un bucle de resolucion iterativa (`solve`) con un numero de llamadas configurable (el ejemplo de la model card usa `calls=16`) y una decodificacion (`decode`) que produce profundidad, confianza de profundidad, rayos, puntos en coordenadas de mundo y una codificacion de pose (`pose_enc`). La codificacion de pose se convierte despues en matrices de camara extrinsecas e intrinsecas mediante la utilidad `cameras_from_pose_enc`. Esta estructura de bucle sugiere un refinamiento iterativo de la solucion, en la linea de los transformers recurrentes o de profundidad variable.

El modelo esta construido sobre DVLT (nv-tlabs/dvlt), lo que vincula su implementacion y parte de su diseno al ecosistema de NVIDIA. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion; estos datos no aparecen en la model card. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal mas alla del propio mecanismo de bucle iterativo, que es la contribucion tecnica central segun el titulo del paper.

## Capacidades

- Reconstruccion 3D multi-vista a partir de un conjunto de imagenes de una misma escena.
- Estimacion de pose de camara: devuelve `pose_enc` que se convierte en matrices c2w (camara a mundo) e intrinsecas K.
- Prediccion de mapas de profundidad por vista (`depth`) con mapa de confianza asociado (`depth_conf`).
- Generacion de rayos (`rays`) y nubes de puntos en coordenadas de mundo (`world_points`).
- Resolucion iterativa configurable: el parametro `calls` de `solve` permite ajustar el numero de iteraciones y, con ello, el equilibrio entre coste y precision.
- API por fases (`encode` / `solve` / `decode`) que permite reutilizar el contexto codificado entre resoluciones.
- Capacidades linguisticas, de codigo, matematicas, tool calling, agentes o audio: no disponibles (el modelo es exclusivamente de vision 3D).

## Casos de uso

- Reconstruccion de escenas para fotogrametria: dado un conjunto de fotografias de un objeto o espacio, el modelo devuelve profundidad y nubes de puntos en coordenadas de mundo, lo que permite generar mallas o nubes densas sin un pipeline SfM+MVS completo.
- Estimacion de poses de camara para calibracion: la salida `pose_enc` y la utilidad `cameras_from_pose_enc` permiten recuperar extrinsecas e intrinsecas de cada vista, util para calibrar capturas multi-camara o secuencias.
- Digitalizacion de patrimonio o interiores: con imagenes de un edificio o sala, se obtiene geometria y poses para visores 3D o inventarios, aprovechando la consistencia multi-vista del solver iterativo.
- Generacion de datos sinteticos para entrenamiento: las nubes de puntos y profundidades predichas pueden servir como pseudo-etiquetas para modelos de vision 3D, dado que el modelo devuelve confianza por pixel.
- Robotica y navegacion asistida (en fase de investigacion): la reconstruccion de geometria y la localizacion relativa de camaras son insumos para mapas locales, aunque la licencia no comercial limita su uso en producto.
- Evaluacion comparativa de metodos de reconstruccion: al exponer una API por fases con `calls` configurable, es util como baseline reproducible en experimentos academicos sobre solvers multi-vista.
- Realidad aumentada en prototipos de investigacion: la combinacion de profundidad, rayos y poses permite anclar objetos virtuales en escenas capturadas, siempre dentro de un marco de evaluacion no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,5 GB, lo que sugiere que los pesos en si caben en GPUs de consumo, pero el consumo real depende del numero de vistas, la resolucion de imagen y el valor de `calls`.
- GPU recomendadas: no disponible en la informacion proporcionada; por el origen NVIDIA del proyecto (DVLT) es razonable esperar soporte en GPUs NVIDIA con CUDA, pero no se confirma en la model card.
- Cabe en GPU de consumo: no confirmado; el tamano del checkpoint (0,5 GB) es compatible con GPUs de consumo, aunque el coste de activaciones con multiples vistas e iteraciones puede elevarlo.
- Opciones de despliegue: la model card solo documenta uso via la libreria Python `solv3r` con `from_pretrained()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. El coste escala con el numero de vistas y con el parametro `calls` (16 en el ejemplo), pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / vistas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solv3R | no disponible | multi-vista, iteraciones configurables | Reconstruccion 3D + poses | NVIDIA (no comercial) | Hugging Face, safetensors |
| DUSt3R | no disponible en la informacion | par de imagenes | Reconstruccion 3D + poses | no disponible en la informacion | no disponible en la informacion |
| MASt3R | no disponible en la informacion | par de imagenes con matching | Reconstruccion 3D + matching | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparativa se limita a la categoria de tarea (reconstruccion 3D multi-vista con estimacion de pose) y a la licencia, que en el caso de Solv3R es restrictiva para uso comercial.

## Limitaciones y advertencias

- Licencia NVIDIA: uso permitido unicamente para investigacion y evaluacion no comercial. Cualquier uso en producto o servicio comercial requiere licencia adicional.
- Sin datos publicados de benchmarks: no es posible validar la calidad de la reconstruccion frente a alternativas con cifras objetivas.
- Sin informacion sobre sesgos: al ser un modelo de vision 3D, los sesgos relevantes serian de dominio (tipos de escena, iluminacion, materiales) y de sesgo geografico en los datos de entrenamiento, pero no se documentan.
- Riesgo de alucinacion geometrica: como todo modelo generativo de profundidad y puntos 3D, puede producir geometria plausible pero incorrecta en regiones ocluidas o con texturas repetitivas; el mapa `depth_conf` debe usarse para filtrar.
- Dependencia del numero de vistas y de `calls`: el resultado y el coste dependen de estos parametros, y no se documentan valores recomendados ni limites.
- Documentacion escasa: la model card no detalla el dataset de entrenamiento, el numero de parametros, los requisitos de hardware ni el rendimiento, lo que dificulta la reproducibilidad.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta; codigo y pesos muy recientes, sin validacion comunitaria.
- Idiomas: no aplica, pero la ausencia de informacion sobre cobertura de dominios visuales impide garantizar generalizacion.

## Enlaces

- Hugging Face: https://huggingface.co/jgkwak/solv3r
- Paper: https://arxiv.org/abs/2611.02857
- Project page: https://ubc-vision.github.io/solv3r/
- Codigo: https://github.com/ubc-vision/solv3r
- Base DVLT: https://github.com/nv-tlabs/dvlt
- Licencia NVIDIA: https://huggingface.co/jgkwak/solv3r/blob/main/LICENSE
