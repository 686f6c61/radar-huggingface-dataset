# longtimedevs/sprite2normal

## Resumen

Sprite2Normal es una red neuronal convolucional ultraligera desarrollada por el usuario longtimedevs, publicada en HuggingFace bajo el identificador `longtimedevs/sprite2normal`. Su funcion es generar mapas de normales (normal maps) en espacio tangente con convencion OpenGL a partir de sprites 2D planos, texturas y pixel art, de forma que un desarrollador de videojuegos pueda anadir iluminacion dinamica 2D sin dibujar a mano el relieve de cada fotograma de animacion.

El modelo se distribuye exclusivamente en formato ONNX con un peso aproximado de 7 MB y esta entrenado desde cero con una arquitectura U-Net compacta de diseno propio, segun declara el autor. Funciona tanto en CPU como en GPU, con tiempos de inferencia declarados de 3 a 10 ms por sprite en procesadores convencionales, y es totalmente convolucional, por lo que acepta entradas de resolucion arbitraria. La salida son mapas de normales estandar (X en canal rojo, Y en verde, Z en azul) compatibles con Godot, Unity, GameMaker, Unreal Engine y shaders personalizados.

Su relevancia es de nicho pero muy concreta: el pipeline de arte 2D con iluminacion normal-mapped suele exigir herramientas de pago o trabajo manual, y este modelo lo reduce a una llamada de inferencia de milisegundos que se puede empotrar en el propio motor o en un script de build. La ficha se publica con fecha de creacion 2026-09-22 y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional ligera, entrenada desde cero (informacion del autor; no se detallan capas ni canales) |
| Parametros totales | no disponible (el fichero ONNX ocupa ~7 MB; no se confirma la precision de los pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo convolucional de image-to-image; no procesa secuencias de texto) |
| Resolucion de entrada | totalmente convolucional; el script de referencia redimensiona a 128x128 px antes de la inferencia y reescala la salida al tamano original |
| Tipos de cuantizacion | no disponible (solo se publica un fichero ONNX; se desconoce si esta en FP32, FP16 o INT8) |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Entrada | imagen RGB, tensor float32 normalizado a [0,1] en formato NCHW |
| Salida | mapa de normales en espacio tangente, 3 canales, reescalado de [-1,1] a [0,255] |
| Tamano del repositorio | 0.0 GB segun la ficha de HuggingFace (fichero del modelo ~7 MB segun el autor) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El autor indica que el modelo es una U-Net ligera ("custom lightweight U-Net architecture") entrenada completamente desde cero, es decir, sin inicializacion a partir de un backbone preentrenado. No se especifica el numero de niveles del encoder y decoder, el numero de canales por bloque, la funcion de perdida ni si se emplearon tecnicas como perdida angular, perdida coseno o regularizacion sobre el vector normal. Tampoco se detalla si hubo etapas de refinamiento posteriores al entrenamiento supervisado (RLHF, DPO u otras), algo que en cualquier caso no aplica a un modelo de vision de este tipo.

El hecho de que la arquitectura sea totalmente convolucional implica que no existen capas densas con dimension fija y que la red puede procesar entradas de cualquier tamano, aunque el script de referencia del autor redimensiona a 128x128 px antes de pasar la imagen. Esta decision sugiere que el entrenamiento se realizo con parches o recortes de ese orden de magnitud, pero no se aporta informacion sobre el dataset de entrenamiento, el numero de pares sprite/normal map utilizados, la composicion del corpus (pixel art, texturas, sprites vectoriales, etc.) ni el regimen de aumentos de datos. La unica innovacion tecnica declarada es la propia compacidad del modelo y su capacidad de ejecucion en CPU en el rango de milisegundos, orientada a la integracion en tiempo real dentro de motores de juego.

## Capacidades

- Generacion de mapas de normales en espacio tangente con convencion OpenGL (X: rojo, Y: verde, Z: azul) a partir de una unica imagen RGB de entrada.
- Conversion image-to-image de sprites, texturas planas y pixel art a mapas de relieve utilizables directamente por shaders de iluminacion 2D.
- Procesamiento de entradas de resolucion arbitraria gracias a una arquitectura enteramente convolucional, con reescalado interno de trabajo a 128x128 px en el ejemplo oficial.
- Ejecucion en CPU sin GPU dedicada, con tiempos declarados de 3 a 10 ms por sprite.
- Empaquetado en un unico fichero ONNX de ~7 MB, lo que permite distribuirlo dentro de un ejecutable o integrarlo en pipelines de build.
- Salida compatible con los flujos de trabajo de mapas de normales de Godot (`Normal Map` en nodos `Sprite2D`), Unity URP 2D (textura de tipo Normal Map en `Secondary Textures`), GameMaker, Unreal Engine y shaders personalizados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni entrada de audio o video. No dispone de modo "thinking" ni de capacidades multimodales mas alla del par imagen RGB / mapa de normales.

## Casos de uso

- Iluminacion dinamica 2D en juegos indie: el desarrollador coloca el sprite original y el mapa de normales generado en el proyecto, asigna este ultimo al slot `Normal Map` del nodo `Sprite2D` en Godot o a `Secondary Textures` en Unity URP 2D, y anade una luz puntual para obtener relieve aparente sin dibujar geometria adicional.
- Generacion por lotes de spritesheets: recorriendo cada fotograma de una animacion y llamando al modelo con ONNX Runtime se obtiene el conjunto completo de mapas de normales en segundos, dado que cada inferencia cuesta entre 3 y 10 ms en CPU.
- Pipeline de assets en CI/CD: el fichero ONNX se versiona en el repositorio y un script de build ejecuta la conversion sobre los PNG de origen cada vez que un artista sube arte nuevo, garantizando que el mapa de normales siempre corresponde a la ultima version del sprite.
- Prototipado rapido de direccion de arte: permite probar estilos de iluminacion (luces de contorno, luz de antorcha, ciclos dia/noche) sobre arte plano sin invertir tiempo en crear relieve manual, y descartar o confirmar el enfoque antes de produccion.
- Herramientas internas de edicion de sprites: el modelo se puede empotrar en un editor propio en Python o en un plugin de motor, generando el mapa de normales bajo demanda mientras el artista modifica el sprite.
- Remasterizacion o modding de juegos 2D retro: se pueden generar mapas de normales para el catalogo de arte existente de un juego antiguo y aplicarlos con un shader externo para anadir iluminacion moderna sin tocar el motor original.
- Reiluminacion de tilesets y fondos: ademas de personajes, el modelo acepta texturas generales, por lo que sirve para generar relieve de suelos, paredes y decorados con la misma llamada de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de calidad (error angular medio, similitud coseno, PSNR, SSIM) ni comparaciones con otros generadores de mapas de normales. El unico dato de rendimiento declarado por el autor es el tiempo de inferencia:

| Metrica | Valor | Fuente |
|---|---|---|
| Tiempo de inferencia en CPU estandar | 3-10 ms por sprite | Model card del autor |
| Tamano del fichero del modelo | ~7 MB (ONNX) | Model card del autor |
| Throughput teorico derivado | ~100-330 sprites/s en CPU, sin solapamiento ni coste de pre/post-procesado | Calculo propio a partir de la cifra del autor; no medido ni confirmado |
| Calidad de los mapas generados | no disponible | No se han publicado metricas |

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable. El fichero ONNX ocupa ~7 MB, por lo que el modelo cabe en cualquier memoria grafica o incluso permanece en RAM durante toda la ejecucion.
- GPU recomendadas: no se requiere ninguna. El autor indica explicitamente que funciona en CPU estandar; una GPU discreta (RTX 3060, RTX 4090, A100, H100) solo aportaria ventaja en lotes muy grandes o en pipelines con muchas llamadas concurrentes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, e incluso en graficos integrados, dado el tamano del modelo. Tambien es viable en dispositivos de gama baja y en el propio proceso del juego.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (el camino documentado por el autor), y potencialmente otros proveedores de ejecucion de ONNX Runtime (CUDA, DirectML, TensorRT) siempre que se disponga del runtime correspondiente; el modelo tambien puede cargarse desde Python con `onnxruntime` junto a `pillow` y `numpy`, o integrarse en motores mediante runtimes de ONNX.
- Memoria RAM: dominada por los buffers de imagen (una entrada de 128x128x3 en float32 y su salida equivalente son unos pocos cientos de kilobytes), no por los pesos.
- Latencia y throughput: 3-10 ms por sprite de 128x128 en CPU segun el autor, sin contar el redimensionado previo ni el reescalado de la salida al tamano original.

## Comparativa con modelos similares

No se dispone de informacion verificada sobre modelos neuronales comparables en la documentacion proporcionada, y la busqueda web asociada no devolvio resultados tecnicos relevantes. A modo de contexto de categoria, se incluyen alternativas no neuronales habituales para la generacion de mapas de normales a partir de sprites, sin datos confirmados sobre su rendimiento:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| longtimedevs/sprite2normal | Red neuronal U-Net convolucional, ONNX | no disponible (~7 MB de fichero) | no aplica | apache-2.0 | HuggingFace, 0 descargas | Tiempo declarado: 3-10 ms en CPU |
| Herramientas de trazado de altura tipo Laigter | Software de procesado de imagen, no neuronal | no aplica | no aplica | no disponible | Aplicacion de escritorio | no disponible |
| Herramientas comerciales tipo SpriteIlluminator | Software comercial, no neuronal | no aplica | no aplica | propietaria | Producto de pago | no disponible |

## Limitaciones y advertencias

- No hay metricas de calidad publicadas: no se puede verificar la fidelidad del relieve generado ni comparar objetivamente con alternativas. Cualquier decision de produccion deberia apoyarse en una evaluacion propia sobre el arte concreto del proyecto.
- El flujo de referencia redimensiona la entrada a 128x128 px y luego reescala el mapa de normales al tamano original con interpolacion bilineal, lo que puede producir perdida de detalle fino en sprites de resolucion alta o con bordes muy marcados.
- Ausencia total de informacion sobre el dataset de entrenamiento: se desconocen los estilos de arte cubiertos y, por tanto, el riesgo de degradacion fuera de la distribucion esperada (pixel art de baja resolucion, ilustracion pintada, texturas fotograficas, etc.).
- Riesgo de alucinacion visual: al ser un modelo generativo, puede inventar volumen o direcciones de normal donde la imagen de entrada no aporta informacion suficiente, especialmente en zonas planas y uniformes.
- El modelo es puramente 2D y no entiende de coherencia temporal; si se aplica fotograma a fotograma en una animacion, los mapas de normales generados de forma independiente pueden presentar inconsistencias entre fotogramas.
- Sin soporte de idioma, texto, codigo, tool calling ni agentes: cualquier uso fuera de la conversion de imagen a mapa de normales queda fuera del alcance del modelo.
- Licencia Apache-2.0, permisiva y compatible con uso comercial, siempre que se conserve el aviso de licencia y se cumplan las condiciones de atribucion; conviene revisar igualmente la licencia del arte de entrada y del motor donde se integre.
- Modelo sin traccion ni validacion comunitaria (0 descargas, 0 likes) y ficha creada en una fecha posterior a la consulta de referencia; la ausencia de mantenimiento o actualizaciones es un riesgo real de proyecto.
- No se especifica la precision numerica de los pesos, lo que impide estimar con exactitud el consumo de memoria en despliegues embebidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtimedevs/sprite2normal
- La busqueda web realizada no devolvio resultados tecnicos relevantes: los unicos enlaces recuperados correspondian al servicio Google Maps (maps.google.com, maps.google.it, mymaps.google.com) y no guardan relacion con el modelo. No se han encontrado papers, repositorios de codigo, blogs, demos ni articulos adicionales sobre `sprite2normal` en la informacion disponible.
