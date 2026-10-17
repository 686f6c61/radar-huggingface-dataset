# smile-forge/big-lama-onnx

## Resumen

big-lama-onnx es la version exportada a ONNX del modelo de inpainting big-lama, la implementacion de LaMa (Resolution-robust Large Mask Inpainting with Fourier Convolutions) publicada por los autores en el repositorio advimman/lama. El modelo original se presenta como un unico grafo ONNX que acepta una imagen y una mascara binaria y devuelve la imagen con la zona enmascarada reconstruida a partir del contexto circundante. El autor de esta ficha es el usuario smile-forge, que lo empaqueta para su uso desde C# dentro del editor de imagenes de su proyecto Nexaflow, aunque puede emplearlo cualquier runtime compatible con ONNX Runtime 1.30 o superior.

El problema que resuelve es la eliminacion de elementos no deseados de una imagen (objetos, personas, rotulos, cables, arañazos o polvo) sin generar contenido nuevo condicionado por texto, sino rellenando las regiones enmascaradas con una prediccion coherente con el entorno. La arquitectura subyacente es la del generador de LaMa, basada en convoluciones de Fourier, y el checkpoint se corresponde con los pesos de smartywu/big-lama, guardados en fp32 con un tamano de 209 MB dentro del repositorio, que ocupa 0,2 GB en total.

La relevancia de este artefacto es de caracter practico: es una conversion a ONNX que elimina dos problemas conocidos de la exportacion directa. Por un lado, sustituye los operadores DFT de ONNX (no implementados por el proveedor CUDA de ONNX Runtime y con coste cuadratico en CPU para longitudes que no sean potencia de dos) por productos matriciales con matrices de coseno y seno construidas a partir del tamano de la entrada. Por otro, permite ejecutar el modelo tanto en CPU como en CUDA con una fidelidad numerica verificada frente a la implementacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de LaMa con convoluciones de Fourier (fast Fourier convolutions), exportado como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen con H y W multiplos de 8, entre 64 y 4096 px por lado (entrenado con recortes de 256 px) |
| Tipos de cuantizacion | fp32 unicamente; no se ofrecen variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un unico grafo, dentro de la carpeta `inpainter/`) |
| Tamano del repositorio | 0,2 GB (carpeta de pesos: 209 MB) |
| Libreria | onnxruntime |
| Pipeline declarado | image-to-image |
| Modelo base | smartywu/big-lama |
| Origen del codigo | advimman/lama, commit 786f593 |
| Version minima de runtime | ONNX Runtime 1.30 |
| Entradas | `rgb` [1, 3, H, W] en rango 0-1 y `mask` [1, 1, H, W] (1 rellena, 0 conserva) |
| Salida | `inpainted` [1, 3, H, W] en rango 0-1 |

## Arquitectura y entrenamiento

El modelo es el generador de LaMa, una red de inpainting que combina convoluciones rapidas de Fourier (FFC) con el resto de la arquitectura para propagar informacion a larga distancia dentro de la imagen, lo que le permite rellenar mascaras grandes de forma coherente. Esta exportacion conserva unicamente los modulos del generador, sin el discriminador ni el resto de componentes de entrenamiento del repositorio original. La conversion se realizo con `torch.onnx.export` mediante un trazado del generador, y el grafo resultante se verifico frente al original en fp32 tanto en CPU como en CUDA.

La unica modificacion estructural respecto al modelo original afecta a las unidades de Fourier, que calculan sus FFT como productos matriciales en lugar de usar los operadores DFT de ONNX. El motivo es doble: el proveedor CUDA de ONNX Runtime no implementa esos operadores y el proveedor CPU los ejecuta en tiempo cuadratico para cualquier longitud que no sea potencia de dos, lo que en una imagen de 1800x1200 superaba los dos minutos. Al reescribirlos como productos con matrices de coseno y seno construidas a partir del tamano de la entrada, las mismas sumas con la misma escala `ortho` se ejecutan como cualquier otra capa en todos los proveedores. El generador con productos coincide con el generador con `torch.fft` hasta 4x10^-6 (una milesima de un nivel de 8 bits) y el grafo con el original hasta 8x10^-5, en CPU y CUDA.

Sobre el entrenamiento, la model card indica que el generador se entreno con recortes de 256 px y que mantiene calidad hasta aproximadamente dos mil pixeles por lado. No se detallan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO, algo por otra parte poco habitual en modelos de vision de este tipo. La referencia academica es el articulo de Suvorov et al., *Resolution-robust Large Mask Inpainting with Fourier Convolutions*, publicado en WACV 2022. La receta de conversion incluye tres scripts: `upstream.py` (descarga LaMa en un commit fijado y conserva solo los modulos del generador), `Build-Lama.ps1` (descarga los pesos, verifica su hash y lee el checkpoint con un unpickler que solo conserva tensores) y `build_lama.py` (trazado y exportacion a ONNX).

## Capacidades

- Inpainting de imagenes: recibe una imagen RGB y una mascara binaria y devuelve la imagen con la region enmascarada rellenada a partir del contexto.
- Eliminacion de objetos: pensado para borrar elementos concretos de una fotografia (una persona, un rotulo, un cable) sin dejar huecos visibles.
- Restauracion de defectos: la model card menciona explicitamente arañazos, polvo y otros defectos superficiales como casos de uso.
- Resolucion flexible: acepta entradas desde 64x64 hasta 4096x4096 px por lado, siempre que las dimensiones sean multiplos de 8.
- Ejecucion en CPU y en CUDA: el mismo grafo funciona en ambos proveedores de ONNX Runtime.
- Integracion desde lenguajes con enlaces a ONNX Runtime, incluido C# (Nexaflow lo usa asi para el borrador de su editor de imagen).
- Salida determinista y alineada con la imagen de entrada: la model card indica que en las pruebas de Nexaflow el grafo rellena los mismos pixeles que la prediccion de referencia y deja intacto todo lo demas.
- No soporta generacion condicionada por texto, tool calling, agentes ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Borrador o herramienta de eliminacion en editores de imagen: el modelo recibe la imagen y la mascara dibujada por el usuario y devuelve el relleno de esa region. Es el uso para el que se construyo, integrado en C# a traves de ONNX Runtime.
- Retoque de fotografia de producto en comercio electronico: eliminar cables, etiquetas o soportes de una foto de catalogo antes de publicarla, manteniendo el fondo original sin regenerarlo por completo.
- Restauracion de fotografias antiguas: quitar arañazos y manchas de polvo enmascarandolos manualmente o con un detector previo, aprovechando que el modelo esta entrenado para rellenar zonas a partir del entorno.
- Limpieza de imagenes en pipelines de vision por computador: borrar marcas de agua, anotaciones o sellos en un paso de preprocesado antes de que la imagen pase a un modelo de deteccion o clasificacion.
- Anonimizacion visual: eliminar caras o matriculas de una fotografia enmascarando esas regiones y sustituyendolas por contenido coherente con el fondo, cuando no se necesita una sustitucion sintetica realista.
- Procesamiento sin GPU: al funcionar en el proveedor CPU de ONNX Runtime, permite montar el inpainting en servidores sin tarjeta grafica, a costa de mayor latencia (4,6 s para 1536x1536 con 16 hilos de CPU segun la model card).
- Integracion en aplicaciones de escritorio .NET: al exponerse como grafo ONNX y no depender de PyTorch, se puede cargar desde una aplicacion C# sin arrastrar el stack de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (PSNR sobre DIV2K, Places2, CelebA u otros conjuntos) en la informacion disponible. La model card si incluye medidas de fidelidad de la conversion frente a la implementacion original:

| Medicion | Valor reportado |
|---|---|
| Coincidencia del generador con productos frente al generador con `torch.fft` | 4x10^-6 (una milesima de un nivel de 8 bits) |
| Coincidencia del grafo ONNX frente al original | 8x10^-5, en CPU y CUDA |
| PSNR del borrador de Nexaflow frente al predict de referencia (GPU) | 58-62 dB |
| PSNR del borrador de Nexaflow frente al predict de referencia (CPU) | 85 dB |
| Tiempo de inferencia a 1536x1536 en GPU | 0,1 s en una RTX PRO 6000 |
| Tiempo de inferencia a 1536x1536 en CPU | 4,6 s con 16 hilos |
| Pico de memoria en GPU a 1536x1536 | 4 GB |

## Requisitos de hardware

- Pesos: 209 MB en fp32, lo que permite mantener el grafo en memoria en cualquier equipo moderno.
- VRAM en GPU: la model card reporta un pico de 4 GB para una entrada de 1536x1536 px. A resoluciones mayores el consumo crece con el area.
- GPU recomendadas: cualquier GPU compatible con el proveedor CUDA de ONNX Runtime. La medicion de latencia se hizo en una NVIDIA RTX PRO 6000, pero no se listan minimos oficiales.
- GPU de consumo: con 4 GB de pico a 1536x1536, el modelo cabe en tarjetas de gama media y alta con al menos 4-6 GB de VRAM; no se especifican modelos concretos mas alla de la RTX PRO 6000.
- CPU: funciona integramente en CPU. La referencia es de 4,6 s para 1536x1536 con 16 hilos, por lo que en equipos con menos nucleos la latencia sera mayor.
- Opciones de despliegue: ONNX Runtime 1.30 o superior, con proveedor CPU o CUDA. Al ser un grafo ONNX tambien puede consumirse desde otras herramientas compatibles, aunque la model card solo garantiza ONNX Runtime.
- Latencia: 0,1 s en GPU y 4,6 s en CPU para el caso de 1536x1536. No se aportan datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| smile-forge/big-lama-onnx | ONNX (fp32) | Generador LaMa con FFC | 64-4096 px por lado, multiplos de 8 | Apache-2.0 | Fourier como productos matriciales; sin operadores DFT; CPU y CUDA |
| smartywu/big-lama (modelo base) | no disponible | LaMa (generador) | no disponible | no disponible | Es el origen de los pesos usados en esta conversion |
| advimman/lama (original) | Checkpoint PyTorch | LaMa completo (generador y discriminador) | no disponible | Apache-2.0 | Codigo fuente en el commit 786f593; base de la conversion |
| Otros modelos de inpainting (MAT, modelos condicionados por texto) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparativa se limita a las variantes del propio LaMa porque la busqueda web realizada no devolvio resultados relevantes sobre modelos de inpainting alternativos ni sobre este repositorio en concreto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso de esas capacidades queda fuera de su alcance.
- Resolucion de entrenamiento limitada: se entreno con recortes de 256 px y, segun la model card, mantiene calidad hasta unos dos mil pixeles por lado. Por encima de ese tamano la fidelidad puede degradarse.
- Mascaras grandes o estructuras complejas: la documentacion no garantiza resultados coherentes para regiones muy extensas o con geometrias dificiles; Nexaflow mitiga esto procesando por partes, con al menos 512 px de contexto por lado y reescalando regiones mayores de 1536 px antes de la inferencia.
- Dependencia de version: requiere ONNX Runtime 1.30 o superior. Versiones anteriores pueden no soportar el grafo tal como esta exportado.
- Limitacion de formato: la entrada debe tener H y W multiplos de 8 entre 64 y 4096, y la mascara sigue la convencion 1 = rellenar, 0 = conservar. Cambiar esa convencion invierte el resultado.
- Uso comercial: la licencia es Apache-2.0 tanto para los pesos como para la receta de conversion, por lo que permite uso comercial. Conviene conservar el aviso de licencia y la atribucion del articulo de WACV 2022.
- Sin datos de sesgo: la informacion disponible no incluye analisis de sesgos ni evaluaciones de equidad. Al ser un modelo de relleno de imagen, los sesgos podrian manifestarse en la apariencia del contenido generado en funcion del contexto.
- Riesgo de artefactos: como cualquier modelo de inpainting, puede producir texturas repetidas, bordes borrosos o discontinuidades en zonas enmascaradas, especialmente con mascaras poco realistas o imagenes de baja calidad.
- Adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad amplia que haya validado su comportamiento en produccion mas alla de las pruebas del autor.
- Fecha de publicacion: el repositorio figura creado y actualizado el 2026-10-17, un dato que conviene verificar por si se trata de un error de metadatos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smile-forge/big-lama-onnx
- Modelo base (pesos): https://huggingface.co/smartywu/big-lama
- Codigo original de LaMa: https://github.com/advimman/lama
- Proyecto Nexaflow (consumidor del modelo): https://github.com/smile-forge/nexaflow
- Articulo de referencia: Suvorov, Logacheva, Mashikhin, Remizova, Ashukha, Silvestrov, Kong, Goka, Park, Lempitsky. *Resolution-robust Large Mask Inpainting with Fourier Convolutions.* WACV 2022.

Nota sobre la busqueda web: los resultados devueltos corresponden a entidades no relacionadas con el modelo (una empresa de servicios digitales, una pelicula de 2022 y parques de ocio), por lo que no se han incorporado enlaces adicionales a esta ficha.
