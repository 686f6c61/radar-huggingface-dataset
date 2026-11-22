# dronefreak/imvotenet-sunrgbd

## Resumen

ImVoteNet es un detector de objetos 3D que combina nubes de puntos con imagenes RGB para mejorar la localizacion tridimensional en interiores. Lo desarrollaron Charles R. Qi, Xinlei Chen, Or Litany y Leonidas J. Guibas (Facebook AI Research) y se presento en CVPR 2020. El modelo resuelve un problema clasico de la deteccion 3D en interiores: las nubes de puntos de sensores RGB-D son dispersas y ambiguas, mientras que las imagenes 2D aportan senales semanticas y geometricas densas. ImVoteNet introduce un mecanismo de "votos" 2D que se inyectan en el pipeline 3D para desambiguar objetos.

La ficha que nos ocupa, `dronefreak/imvotenet-sunrgbd`, es un espejo no oficial de los pesos oficiales de MMDetection3D. No se ha reentrenado nada: se redistribuyen los checkpoints originales junto con una copia `model.safetensors` de solo pesos y un `config.json`. El modelo corresponde a la etapa 2 (detector 3D con backbone PointNet++) entrenada sobre SUN RGB-D con 10 clases, y depende de una etapa 1 (rama de imagen Faster R-CNN R50-FPN) que se incluye en el subdirectorio `pretrained/`.

Con 43,5 millones de parametros y un peso de repositorio de 0,5 GB, es un modelo compacto orientado a investigacion y a pipelines de deteccion 3D en interiores, no a generacion de texto ni a tareas de lenguaje. Su relevancia actual es la de servir como referencia reproducible del metodo original dentro del ecosistema MMDetection3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ImVoteNet (etapa 2: detector 3D con backbone PointNet++ e inyeccion de votos 2D) |
| Parametros totales | 43.465.336 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint original MMDetection3D) y `model.safetensors` (solo pesos, copia bit-exacta del `state_dict`) |

## Arquitectura y entrenamiento

ImVoteNet es una arquitectura de dos etapas. La etapa 1 es una rama de imagen 2D basada en Faster R-CNN con backbone ResNet-50 y FPN, entrenada sobre SUN RGB-D 2D (checkpoint incluido en `pretrained/`, con AP@0.5 de 62,70). Esta rama produce detecciones 2D y, a partir de ellas, "votos" 2D: puntos de la imagen con informacion geometrica y semantica que se proyectan al espacio 3D. La etapa 2 es el detector 3D propiamente dicho, con backbone PointNet++ sobre la nube de puntos, que incorpora esos votos de imagen para refinar la localizacion de objetos. El modelo final cubre 10 clases de SUN RGB-D.

El entrenamiento se realizo sobre el dataset SUN RGB-D, un corpus de escenas de interior con pares RGB-D y anotaciones 3D. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si hubo tecnicas de refinamiento tipo RLHF/DPO (no aplicables a este tipo de modelo). La innovacion tecnica destacable es precisamente el mecanismo de votos de imagen: en lugar de fusionar imagen y nube de puntos de forma tardia o por concatenacion de caracteristicas, se generan votos 2D que actuan como senales auxiliares sobre los puntos 3D, lo que mitiga la dispersion de las nubes de puntos en interiores. El checkpoint redistribuido corresponde a la variante `16x8` de MMDetection3D (16 GPUs, 8 imagenes por GPU en el schedule original).

## Capacidades

- Deteccion de objetos 3D en escenas de interior a partir de pares RGB-D (nube de puntos + imagen).
- Clasificacion y localizacion de 10 clases de objetos de SUN RGB-D (categorias tipicas de interior como cama, silla, sofa, mesa, armario, etc.).
- Fusion multimodal imagen + nube de puntos mediante votos 2D.
- Segmentacion implicita de instancias 3D a traves del backbone PointNet++ y las cabezas de deteccion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni modo "thinking".
- No procesa audio ni video de forma nativa; trabaja con frames RGB-D estaticos.

## Casos de uso

- Robotica de interior: percepcion 3D para manipulacion y navegacion en entornos domesticos, usando la nube de puntos de una camara RGB-D y la imagen para localizar objetos como sillas, mesas o camas antes de planificar agarres.
- Reconstruccion y anotacion de escenas: generacion automatica de bounding boxes 3D sobre capturas de interior para acelerar el etiquetado de datasets propios, aprovechando el AP@0.25 de 64,48 reportado en SUN RGB-D.
- Realidad aumentada: colocacion de objetos virtuales sobre superficies reales detectadas en 3D, donde la precision de localizacion 3D es critica y la imagen aporta contexto semantico.
- Analisis de espacios en arquitectura e inmobiliaria: inventario automatico de mobiliario y elementos de una habitacion a partir de escaneos RGB-D, con las 10 clases de SUN RGB-D.
- Investigacion en deteccion 3D: linea base reproducible para comparar metodos de fusion multimodal (votos 2D frente a concatenacion de caracteristicas o fusion tardia) dentro de MMDetection3D.
- Sistemas de asistencia a personas con discapacidad visual: descripcion de obstaculos y objetos cercanos en interiores a partir de la nube de puntos y la imagen, con la ventaja de que el modelo es compacto (43,5 M de parametros) y puede ejecutarse en hardware modesto.
- Vehiculos de servicio en interiores (robots de reparto, aspiradores): deteccion de muebles y obstaculos para evitar colisiones, integrando el modelo en el stack de percepcion con MMDetection3D.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AP@0.25 (SUN RGB-D 3D, 10 clases) | 64,48 |
| AP@0.5 etapa 1 (Faster R-CNN R50-FPN, SUN RGB-D 2D) | 62,70 |

Los valores proceden de la model card y de los resultados reportados por los autores. No se han publicado en la informacion disponible comparaciones adicionales con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 43,5 M de parametros; en FP32 ocupa aproximadamente 0,17 GB de pesos, por lo que la VRAM necesaria depende sobre todo del tamano de la nube de puntos y del batch. En la practica, menos de 4 GB de VRAM son suficientes para inferencia en un solo frame.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Para entrenamiento o evaluacion por lotes, se recomienda una RTX 3090/4090, A100 o H100; el schedule original `16x8` sugiere 16 GPUs para entrenamiento completo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: el modelo esta pensado para MMDetection3D (PyTorch). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La carga se realiza con el codigo oficial de MMDetection3D o con `safetensors.torch.load_file` sobre el mismo grafo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | AP@0.25 SUN RGB-D 3D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImVoteNet (este) | 43,5 M | Nube de puntos + RGB | 64,48 | Apache-2.0 | Pesos en HF (espejo) y MMDetection3D |
| VoteNet | no disponible en la informacion | Nube de puntos | no disponible en la informacion | Apache-2.0 (MMDetection3D) | Pesos en MMDetection3D |
| PointFusion / otros metodos de fusion RGB-D | no disponible en la informacion | Nube de puntos + RGB | no disponible en la informacion | no disponible | no disponible |

No se dispone en la informacion proporcionada de cifras comparativas verificadas de VoteNet ni de otros metodos de fusion multimodal sobre SUN RGB-D, por lo que la comparativa cuantitativa queda limitada al dato de ImVoteNet.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son identicos a los de MMDetection3D, pero el repositorio no esta mantenido por los autores originales. Si los autores solicitan su retirada, el espejo puede desaparecer.
- Dependencia de la etapa 1: el modelo necesita la rama de imagen Faster R-CNN incluida en `pretrained/`; no funciona de forma autonoma solo con `model.safetensors`.
- Dominio restringido: entrenado exclusivamente sobre SUN RGB-D (interiores y 10 clases). El rendimiento fuera de ese dominio (exteriores, otras categorias, otros sensores) no esta garantizado.
- Sensible a la calidad de la nube de puntos y de la calibracion RGB-D: errores de calibracion entre imagen y profundidad degradan los votos 2D y, con ello, la deteccion 3D.
- Riesgo de falsos positivos y negativos en escenas con oclusiones severas o mobiliario poco representado en el dataset.
- No es un modelo generativo: no hay riesgo de alucinacion textual, pero si de detecciones espurias en escenas atipicas.
- Licencia Apache-2.0: permite uso comercial, pero conviene citar el trabajo original y revisar las licencias de las dependencias de MMDetection3D.
- No se documentan sesgos demograficos ni linguisticos; los sesgos relevantes serian de composicion del dataset (tipos de habitaciones y objetos sobrerrepresentados).
- Para produccion, conviene validar el modelo en el dominio objetivo y fijar versiones de MMDetection3D y PyTorch, dada la ausencia de un `config` de inferencia estandarizado en el espejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/imvotenet-sunrgbd
- Dataset SUN RGB-D (espejo): https://huggingface.co/datasets/dronefreak/SUN-RGBD
- Paper ImVoteNet (CVPR 2020): https://arxiv.org/abs/2001.10692
- Codigo oficial MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Repositorio original de los autores (sin checkpoints entrenados): https://github.com/facebookresearch/imvotenet
