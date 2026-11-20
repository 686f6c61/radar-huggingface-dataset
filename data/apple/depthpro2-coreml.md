# apple/DepthPro2-coreml

## Resumen

Depth Pro 2 es un modelo de estimacion de profundidad monocular metrica desarrollado por Apple AI/ML Research, publicado en el informe tecnico arXiv:2611.26603 (2026). A diferencia de los modelos de profundidad relativos, Depth Pro 2 produce mapas de profundidad en metros absolutos a partir de una sola imagen o fotograma, con bordes nitidos y consistencia temporal en video. La version aqui descrita, `apple/DepthPro2-coreml`, es la distribucion en formato Core ML (`.mlpackage`) de los pesos PyTorch originales, pensada para ejecucion en Apple silicon bajo macOS 15 o superior.

El modelo se ofrece en cinco variantes: cuatro tamanos de red (S, B, L y H+) empaquetados con una ventana temporal de 4 fotogramas (`w4`), y un paquete independiente de campo de vision (`fov`) que estima la longitud focal de camaras que no la reportan. Los tamanos van de 51 MB (S) a 1,6 GB (H+), lo que permite desde ejecucion en portatiles con memoria limitada hasta maxima calidad en equipos de sobremesa.

La relevancia actual radica en que combina profundidad metrica absoluta, nitidez de bordes y estabilidad temporal en una unica arquitectura, algo que historicamente requeria pipelines separados (estimacion por fotograma mas filtrado temporal). Su licencia, sin embargo, es exclusivamente de investigacion no comercial, lo que condiciona su adopcion en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de profundidad monocular; pesos PyTorch convertidos a Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 4 fotogramas (`w4`) con estado recurrente entre predicciones |
| Tipos de cuantizacion | pesos en 4 bits (`w4`) en todos los paquetes publicados |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | Apple Machine Learning Research Model License (apple-amlr); solo investigacion no comercial |
| Formato de pesos | Core ML `.mlpackage` (pesos originales PyTorch en el repo `apple/DepthPro2`) |
| Resoluciones de entrada | `res_854x480` (por defecto), `res_640x360`, `res_896x512`, `res_1138x640`, `res_1280x720`; paquete FOV fijo a 896x512 (16:9) |
| Tamanos de modelo | S: 51 MB, B: 188 MB, L: 891 MB, H+: 1,6 GB, FOV: 91 MB |
| Entrada | tensor float16 `(1, 3, H, W)` RGB en rango [0, 1] |
| Salida | `inverse_depth` `(1, H, W)` normalizada por longitud focal; profundidad en metros = `f_px / (W * inverse_depth)` |
| Requisitos de plataforma | Apple silicon, macOS 15 o superior |
| Tamano del repo | 3,0 GB |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atencion, diseno del modulo temporal) ni los datos de entrenamiento (numero de tokens o imagenes, composicion del dataset, uso de RLHF o ajuste fino). Lo que si se explicita es el diseno de inferencia: el modelo procesa un fotograma cada vez y mantiene los anteriores en un estado (`MLState`) que se crea con `model.makeState()` y debe reiniciarse para cada nuevo video. Ese estado es lo que proporciona la consistencia temporal declarada en el titulo del trabajo.

La innovacion destacable es la salida de profundidad metrica normalizada por la longitud focal: la red emite `inverse_depth` y la conversion a metros se hace en postproceso dividiendo `f_px` entre `W * inverse_depth`. Esto desacopla la prediccion de la camara concreta y permite usar el paquete FOV para estimar `f_px` cuando los metadatos EXIF no lo proporcionan. Los paquetes Core ML exponen una funcion por resolucion de entrada (`res_<W>x<H>`), lo que permite seleccionar el equilibrio entre latencia y calidad sin reexportar el modelo.

## Capacidades

- Estimacion de profundidad monocular metrica (en metros absolutos) a partir de una sola imagen.
- Estimacion de profundidad en video con consistencia temporal mediante ventana deslizante de 4 fotogramas y estado persistente.
- Generacion de mapas de profundidad con bordes nitidos, segun la model card.
- Estimacion de longitud focal para camaras que no la reportan (paquete FOV).
- Multiples resoluciones de entrada seleccionables por nombre de funcion (`res_640x360` a `res_1280x720`).
- Ejecucion en Apple silicon con Core ML (CPU y GPU; el ejemplo usa `.cpuAndGPU`).
- No soporta tool calling, agentes, generacion de texto ni capacidades linguisticas: es un modelo puramente visual.

## Casos de uso

- **Efecto bokeh y retrato computacional en apps de fotografia**: el mapa de profundidad metrica permite desenfocar el fondo de forma fisicamente coherente, y la salida en metros facilita calibrar el radio de desenfoque segun la distancia real del sujeto.
- **Reconstruccion 3D y escaneo de escenas**: al obtener profundidad absoluta por fotograma, se puede proyectar cada pixel a coordenadas 3D con la intrinsica de la camara y fusionar nubes de puntos; el paquete FOV resuelve el caso de camaras sin focal conocida.
- **Segmentacion por profundidad en edicion de video**: la consistencia temporal de la ventana `w4` reduce el parpadeo entre fotogramas, lo que permite generar mates de profundidad estables para composicion y rotoscopia asistida.
- **Realidad aumentada y oclusion**: en apps de AR sobre macOS o dispositivos Apple, el mapa de profundidad metrica permite ocluir objetos virtuales detras de geometria real y escalar los objetos a su tamano fisico correcto.
- **Robotica y navegacion en interiores**: con una sola camara RGB y profundidad metrica se puede construir un mapa de obstaculos sin sensor LiDAR; las variantes S y B caben en equipos con memoria moderada para prototipos.
- **Procesamiento por lotes de fotografia inmobiliaria**: la variante L o H+ a 1280x720 genera mapas de alta calidad para recorridos virtuales y planos aproximados a partir de fotos convencionales.
- **Prototipado rapido en portatil**: la variante S a 854x480 consume unos 1,5 GB y permite iterar en un Mac de 16 GB sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con modelos de profundidad previos ni metricas como AbsRel, RMSE o delta-1. El informe tecnico arXiv:2611.26603 podria contenerlas, pero su contenido no forma parte de la informacion proporcionada.

## Requisitos de hardware

- **VRAM/memoria unificada estimada** (segun la model card): variante S, ~1,5 GB a 854x480 y ~5 GB a 1280x720; variante L, ~4 GB a 854x480 y ~18 GB a 1280x720.
- **Plataforma obligatoria**: Apple silicon con macOS 15 o superior; no hay ruta de ejecucion en GPU NVIDIA ni en CPU x86 con este paquete Core ML.
- **Equipos recomendados**: en un Mac con 16 GB de memoria unificada, usar S o B, o mantenerse en la resolucion por defecto (854x480). Para L y H+ a resoluciones altas se requiere un Mac con 32 GB o mas.
- **GPU dedicadas (A100, H100, RTX 4090)**: no aplican a esta distribucion Core ML; para esas plataformas habria que usar los pesos PyTorch del repo `apple/DepthPro2` y un runtime distinto, no descrito en la informacion disponible.
- **Opciones de despliegue**: Core ML nativo (Swift, `MLModel` con `MLModelConfiguration`), demo oficial en `demo/run.sh`, exportacion con `uv run --extra coreml python -m demo.export stream -m depthpro2-s -w 4 -s 480x854`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision).
- **Latencia y throughput**: no disponibles; la model card solo indica cualitativamente que los modelos pequenos "corren mas rapido".

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de profundidad monocular (por ejemplo, variantes previas de Depth Pro u otros estimadores metricos), por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- **Licencia solo para investigacion**: la Apple Machine Learning Research Model License restringe el uso a investigacion cientifica no comercial y desarrollo academico; no se permite uso comercial sin licencia adicional.
- **Dependencia de plataforma**: los paquetes solo funcionan en Apple silicon con macOS 15 o superior; no hay soporte para Linux, Windows ni aceleradores NVIDIA en esta distribucion.
- **Consumo de memoria elevado con la resolucion**: la memoria crece rapidamente (de ~1,5 GB a ~5 GB en S al pasar de 854x480 a 1280x720; de ~4 GB a ~18 GB en L), lo que limita el uso en equipos con poca memoria unificada.
- **Gestion de estado en video**: es obligatorio crear un nuevo `MLState` por cada video; reutilizar el estado entre videos distintos produce resultados incorrectos.
- **Cuantizacion a 4 bits**: todos los paquetes publicados usan pesos `w4`; no se documenta el impacto en precision frente a los pesos PyTorch originales.
- **Dependencia de la longitud focal**: la conversion a metros requiere `f_px` correcto; si la camara no lo reporta y no se usa el paquete FOV, la profundidad metrica sera erronea.
- **Sesgos y alucinacion**: no se documentan sesgos conocidos ni tasas de error; como todo modelo de profundidad monocular, puede fallar en superficies reflectantes, transparentes, texturas repetitivas o iluminacion extrema, generando geometria plausible pero incorrecta.
- **Idiomas**: no aplica, pero conviene senalar que no procesa texto ni metadatos linguisticos.
- **Madurez**: el repositorio tiene 26 descargas y 3 likes en el momento de la consulta, lo que sugiere una adopcion temprana y poca validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2-coreml
- Repositorio de pesos PyTorch y todas las variantes: https://huggingface.co/apple/DepthPro2
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26603
- Pagina del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- README de la demo y exportacion: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/demo/README.md
- Preprocesado de fotogramas en Swift: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/demo/apple/Sources/demo/Preprocess.swift
