# qq456cvb/CanonicalVoting

## Resumen

Canonical Voting es un conjunto de checkpoints preentrenados para la deteccion de cajas orientadas (oriented bounding boxes) en nubes de puntos de escenas 3D de interior. Lo publica el usuario qq456cvb en Hugging Face como material complementario del articulo "Canonical Voting: Towards Robust Oriented Bounding Box Detection in 3D Scenes", presentado en CVPR 2022 por Yang You, Zelin Ye, Yujing Lou, Chengkun Li, Yong-Lu Li, Lizhuang Ma, Weiming Wang y Cewu Lu.

No es un modelo de lenguaje ni un modelo generativo: no procesa texto ni imagenes 2D, sino nubes de puntos. El repositorio agrupa tres bloques de pesos: un modelo conjunto entrenado para todas las categorias sobre ScanNet, modelos entrenados por separado para cada categoria (ocho identificadores WordNet mas "others") y un checkpoint para SUN RGB-D pensado para usarse junto con BRNetCanon.

Frente a un LLM, aqui no hay recuento de parametros publicado, ni ventana de contexto, ni versiones cuantizadas. Su interes es acotado pero claro: ofrece pesos listos para reproducir los resultados del paper en un problema dificil, la estimacion de la orientacion de objetos de mobiliario en escenas escaneadas. El repositorio ocupa 2,0 GB con licencia MIT, aunque acumula 0 descargas y 0 me gusta, lo que indica que es un artefacto de investigacion poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector 3D de cajas orientadas basado en votacion canonica sobre nubes de puntos (no se detalla el backbone en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica (la entrada es una nube de puntos de una escena, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible; solo se publican checkpoints en `.pth`, sin versiones cuantizadas |
| Idiomas soportados | no disponible; no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`) |
| Datasets de entrenamiento | ScanNet y SUN RGB-D (modelo para BRNetCanon) |
| Categorias cubiertas (ScanNet) | 8 identificadores WordNet (`02747177`, `02808440`, `02871439`, `02933112`, `03001627`, `03211117`, `04256520`, `04379243`) mas `others` |
| Metrica declarada | mAP (valores en la seccion de benchmarks) |
| Tamano del repositorio | 2,0 GB |
| Framework de inferencia | PyTorch con CUDA (codigo en el repositorio de GitHub del autor) |

## Arquitectura y entrenamiento

La model card identifica el metodo como "Canonical Voting" y remite al paper de CVPR 2022 para el detalle arquitectonico. No se especifican en la informacion disponible el tipo de backbone, el numero de parametros, la composicion exacta del dataset ni la estrategia de optimizacion. Lo que si se documenta es la organizacion del entrenamiento: un modelo conjunto ("joint") que cubre todas las categorias de ScanNet y modelos entrenados por separado para cada categoria, ademas de un checkpoint especifico para SUN RGB-D.

Los pesos publicados son:

| Fichero | Descripcion | Rendimiento declarado |
|---|---|---|
| `scannet/joint.pth` | Modelo conjunto para todas las categorias en ScanNet | ~15,4 mAP |
| `scannet/separate/<wordnet_id>.pth` | Modelos por categoria en ScanNet | ~21,7 mAP de media global |
| `sunrgbd/checkpoint.pth` | Modelo para SUN RGB-D, usado con BRNetCanon | no disponible |

El salto de ~15,4 mAP a ~21,7 mAP al pasar de un modelo conjunto a modelos especializados por categoria es el dato tecnico mas relevante de la ficha: la especializacion por clase mejora de forma notable la deteccion de cajas orientadas en este pipeline. Tambien se publica un repositorio de datos y anotaciones procesadas en Hugging Face Datasets, lo que facilita la reproducibilidad sin tener que reconstruir el preprocesado desde cero.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de escenas de interior, con estimacion de caja orientada (posicion, tamano y rotacion).
- Prediccion sobre escenas completas de ScanNet y SUN RGB-D, no solo sobre objetos aislados.
- Dos modos de inferencia segun los pesos: modelo conjunto multiedase y modelos especializados por categoria con mayor mAP.
- Cobertura de ocho categorias de mobiliario de interior mas una clase agregada "others"; en la convencion WordNet empleada por ScanNet, los identificadores corresponden a categorias habituales de mobiliario domestico.
- No soporta tool calling, function calling ni uso como agente: no es un modelo de lenguaje.
- No soporta generacion de texto, codigo, matematicas, vision 2D ni audio.
- No dispone de modo de razonamiento explicito ni de capacidades multilingues.

## Casos de uso

- Robotica de manipulacion en interiores: el modelo proporciona cajas orientadas de sillas, mesas o armarios, de modo que un brazo robotico puede planificar agarres sabiendo no solo donde esta el objeto sino como esta orientado en el espacio.
- Navegacion autonoma en espacios cerrados: integrar las detecciones como obstaculos con volumen y orientacion permite generar mapas de coste mas realistas que con bounding boxes alineadas a los ejes.
- Digitalizacion de interiores y escaneo AR: a partir de una malla o nube de puntos capturada con un dispositivo movil, el modelo etiqueta y delimita el mobiliario para generar inventarios o gemelos digitales de una vivienda.
- Etiquetado automatico de datos para otros modelos: usar los checkpoints por categoria como preanotadores de nubes de puntos, con revision humana posterior, para acelerar la construccion de datasets 3D propios.
- Analisis de escenas para simulacion y robotica: extraer la distribucion y orientacion de muebles en habitaciones reales para poblar entornos sinteticos con disposiciones plausibles.
- Inspeccion y catalogacion de espacios en sectores como inmobiliaria o facility management: deteccion automatica de mobiliario fijo y movil en levantamientos 3D para estimar ocupacion o inventariar activos.
- Investigacion en deteccion 3D: servir como punto de partida reproducible (con datos procesados publicados) para comparar nuevas tecnicas de votacion o de regresion de cajas orientadas sobre ScanNet y SUN RGB-D.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Modelo | Dataset | Metrica | Resultado |
|---|---|---|---|
| `scannet/joint.pth` (todas las categorias) | ScanNet | mAP | ~15,4 |
| `scannet/separate/*` (media de modelos por categoria) | ScanNet | mAP | ~21,7 |
| `sunrgbd/checkpoint.pth` | SUN RGB-D | mAP | no disponible |

No se han publicado en la informacion disponible resultados desglosados por categoria, ni comparativas numericas con otros metodos de deteccion 3D (por ejemplo BRNet, VoteNet o H3DNet, habituales en esta linea de trabajo). Cualquier cifra adicional debe consultarse en el paper original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo pesa 2,0 GB, pero esa cifra agrega los once checkpoints publicados (uno conjunto, ocho por categoria, uno de SUN RGB-D y los artefactos asociados), de modo que cada modelo individual es una fraccion de ese total.
- GPU recomendadas: no disponible en la informacion proporcionada; el unico requisito implicito es una GPU compatible con CUDA y suficiente para el backbone de la implementacion oficial en PyTorch.
- Encaje en GPU de consumo: no confirmado por el autor. Dado que se trata de un detector 3D de nubes de puntos y no de un modelo generativo de gran tamano, es esperable que quepa en GPUs de gama media y alta (RTX 3060/4090 y similares), pero se trata de una estimacion, no de un dato publicado.
- Opciones de despliegue: inferencia mediante el codigo oficial del repositorio de GitHub sobre PyTorch. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de puntos por escena, del backbone y de la GPU utilizada.

## Comparativa con modelos similares

La model card no incluye una comparativa tabulada con otros metodos. El unico modelo comparable citado de forma explicita es BRNet, que se usa junto con el checkpoint de SUN RGB-D (`BRNetCanon`). Los metodos de la misma familia (deteccion 3D por votacion de puntos como VoteNet o H3DNet) no aparecen en la informacion disponible con datos numericos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canonical Voting (este repositorio) | no disponible | no aplica | ~15,4 mAP (ScanNet, conjunto) / ~21,7 mAP (ScanNet, por categoria) | MIT | Pesos en Hugging Face, codigo en GitHub |
| BRNet (BRNetCanon) | no disponible | no aplica | no disponible | no disponible | Citado en la model card, sin enlace |
| Otros metodos de la misma familia (VoteNet, H3DNet) | no disponible | no aplica | no disponible | no disponible | no disponible en esta informacion |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no admite prompts de texto, tool calling ni uso como agente conversacional. Cualquier integracion exige escribir codigo de inferencia especifico.
- Dominio restringido: entrenado sobre ScanNet y SUN RGB-D, es decir, escenas de interior con la taxonomia y las caracteristicas de captura de esos datasets. El rendimiento fuera de ese dominio (exteriores, nubes de puntos industriales, sensores distintos) no esta documentado.
- Cobertura de clases limitada: ocho categorias mas "others" en ScanNet. Los objetos fuera de esa lista se agregan a una clase residual sin identificacion fina.
- Riesgo de falsos positivos y negativos: como todo detector, produce errores de localizacion y de clasificacion; el mAP declarado (~15,4-21,7) indica margen amplio de mejora y desaconseja su uso en produccion sin validacion y umbrales ajustados. El termino "alucinacion" no aplica en sentido generativo, pero si existe riesgo de detecciones espurias.
- Sin informacion sobre sesgos: la model card no documenta analisis de sesgo por tipo de escena, iluminacion, densidad de puntos o geografia de las capturas.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar las condiciones de los datasets subyacentes (ScanNet y SUN RGB-D) y de BRNet antes de un uso comercial.
- Madurez y mantenimiento: 0 descargas y 0 me gusta en el momento de la consulta, repositorio de 2,0 GB y fechas de creacion y actualizacion registradas en 2026, posteriores a la publicacion del paper (2022). No hay garantia de soporte, ni de compatibilidad con versiones recientes de PyTorch.
- Reproducibilidad: los resultados declarados dependen del preprocesado y del pipeline oficial; usar los checkpoints con otro codigo puede degradar el mAP de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qq456cvb/CanonicalVoting
- Dataset de datos y anotaciones procesados: https://huggingface.co/datasets/qq456cvb/CanonicalVoting
- Paper en arXiv: https://arxiv.org/abs/2011.12001
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2011.12001
- Paper en acceso abierto (CVPR 2022): https://openaccess.thecvf.com/content/CVPR2022/html/You_Canonical_Voting_Towards_Robust_Oriented_Bounding_Box_Detection_in_3D_CVPR_2022_paper.html
- Codigo fuente: https://github.com/qq456cvb/CanonicalVoting
- Pagina del proyecto: https://qq456cvb.github.io/projects/canonical-voting
