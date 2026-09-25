# 333i/4xPurePhoto-RealPLSKR-coreml-ios

## Resumen

333i/4xPurePhoto-RealPLSKR-coreml-ios es una conversión a Core ML del modelo de superresolución 4xPurePhoto-RealPLSKR, desarrollado originalmente por asterixcool como red convolucional de escalado 4x para fotografías. El repositorio, publicado por el usuario 333i, está etiquetado con coreml, super-resolution, ios e image-to-image, lo que indica que su propósito es ejecutar el escalado en dispositivo (iPhone, iPad y, por extensión, Mac) sin depender de servidores externos ni de GPU dedicadas.

El modelo base está entrenado durante 152.000 iteraciones con un tamaño de lote de 8 y parches de alta resolución de 1024 píxeles, sobre un conjunto de 8.684 imágenes con degradaciones generadas al vuelo (OTF, on-the-fly). Según la documentación del autor original, está especializado en fotografías con pelo, gatos y escenas de fiesta, además de restaurar imágenes muy comprimidas y ampliar fotografías nítidas y de gran tamaño.

La relevancia actual de esta ficha es acotada y conviene ser explícito: el repositorio no registra descargas ni valoraciones en el momento de la consulta, no incluye métricas de calidad publicadas y el campo de licencia del Hub aparece como no disponible, aunque las etiquetas del repositorio sí declaran CC-BY-SA-4.0. Es, por tanto, un artefacto útil para quien necesite un modelo de escalado 4x empaquetado para el ecosistema Apple, pero sin validación comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RealPLKSR (red convolucional de superresolucion con escalado 4x) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | no disponible; el formato Core ML admite precisiones float16 y float32 segun la conversion, pero no se detalla la usada en este repositorio |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC-BY-SA-4.0 segun las etiquetas del repositorio; el campo de licencia del Hub figura como no disponible |
| Formato de pesos | Core ML orientado a iOS (el repositorio esta etiquetado como coreml; no se detalla si se distribuye como .mlpackage o .mlmodel) |
| Factor de escalado | 4x |
| Tarea | image-to-image (superresolucion / upscaling) |
| Modelo base | 4xPurePhoto-RealPLSKR, de asterixcool |

## Arquitectura y entrenamiento

La arquitectura del modelo original es RealPLKSR, una red convolucional diseñada para superresolución con factor 4x. Frente a las aproximaciones basadas en transformers o en GAN, este tipo de red prioriza la eficiencia computacional: su coste es aproximadamente lineal con el número de píxeles de entrada, lo que la hace apta para inferencia en dispositivo. El repositorio que nos ocupa no aporta detalles propios del entrenamiento; toda la información de entrenamiento procede del modelo base.

Según la ficha de StarinspaceUpscale, el modelo base se entrenó durante 152.000 iteraciones con batch_size 8 y parches HR de 1024 píxeles, sobre un conjunto de 8.684 imágenes con degradaciones aplicadas al vuelo (OTF), lo que expone al modelo a distintos tipos de ruido y compresión en cada paso. La ficha indica además "Pretrained_Model_G: No", es decir, el generador no partió de un modelo preentrenado, y no se documenta el uso de discriminador. El resultado declarado es un modelo capaz de tratar imágenes muy comprimidas, restaurar detalle fino (pelo, texturas) y ampliar fotografías nítidas de gran tamaño. La conversión a Core ML añade una capa de traducción de grafos y operadores para que el modelo se ejecute sobre el Apple Neural Engine, la GPU o la CPU del dispositivo, aunque el repositorio no especifica la precisión ni las optimizaciones aplicadas en dicha conversión.

## Capacidades

- Superresolucion de imagenes con factor de escalado 4x, es decir, una entrada de 512x512 se convierte en 1024x1024.
- Restauracion de imagenes altamente comprimidas, con reduccion de artefactos de bloque y ringing, segun la descripcion del modelo base.
- Ampliacion de fotografias nitidas de gran tamano sin reescalado agresivo previo.
- Mejora de imagenes pequenas: la documentacion del modelo base indica un minimo recomendado de 300 pixeles en el lado mas corto.
- Rendimiento declarado en contenido fotografico con pelo, animales (gatos) y escenas de fiesta o interiores con iluminacion compleja.
- Ejecucion en dispositivo: al ser un modelo Core ML, la inferencia ocurre localmente en hardware Apple, sin enviar imagenes a un servicio externo.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No se documentan capacidades de vision de alto nivel (deteccion, segmentacion, captioning) ni modos especiales como thinking o vision-language.

## Casos de uso

- Edicion fotografica en aplicaciones iOS: integrado mediante el framework Vision o Core ML, permite ampliar fotografias a 4x dentro de la propia app, sin subir la imagen a un servidor, lo que resulta adecuado para apps de retoque que priorizan la privacidad.
- Restauracion de archivos fotograficos antiguos o recompinsados: el modelo base declara capacidad de tratar imagenes muy comprimidas, por lo que encaja en flujos de recuperacion de capturas de baja calidad procedentes de mensajeria o redes sociales.
- Preparacion de material para impresion: al escalar 4x, una imagen de 1000x750 px pasa a 4000x3000 px, suficiente para impresiones de tamano medio sin recurrir a interpolacion bicubica.
- Procesado por lotes en Mac: el mismo paquete Core ML puede ejecutarse en macOS sobre el Apple Neural Engine para lotes de fotografias, util en catalogos de producto o archivos de patrimonio digital.
- Optimizacion de miniaturas y previews: ampliar miniaturas de al menos 300 px de lado para reutilizarlas como imagenes principales en fichas de catalogo o portfolios.
- Fotografia de mascotas y retrato: el modelo base menciona explicitamente pelo y gatos como dominio de entrenamiento, lo que lo hace apropiado para apps de fotografia de animales y retratos con detalle fino de textura.
- Pipelines de preprocesado para vision por computador: escalar imagenes de entrada antes de alimentar un detector o clasificador que requiera mayor resolucion, siempre que el margen de latencia del dispositivo lo permita.
- Demostraciones y prototipos en iOS: al no requerir infraestructura de servidor, es util para validar una funcionalidad de upscaling en un prototipo antes de invertir en un modelo mayor o en entrenamiento propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Hugging Face no incluye métricas de PSNR, SSIM, LPIPS ni comparativas con otros modelos. La ficha de OpenModelDB correspondiente al modelo base incluye imágenes de previsualización, pero el propio sitio advierte de que muchas de ellas están rotas porque sus alojamientos originales están fuera de servicio, por lo que no es una fuente fiable de comparación cuantitativa en este momento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; al tratarse de un paquete Core ML orientado a iOS, la ejecución se realiza sobre memoria unificada del dispositivo y no sobre VRAM de GPU dedicada.
- GPU recomendadas: no aplica en el sentido habitual; el destino son el Apple Neural Engine, la GPU integrada o la CPU de chips Apple (serie A y serie M).
- Compatibilidad con GPU de consumo: el modelo base en formato PyTorch (.pth) puede ejecutarse en GPU NVIDIA de consumo, pero no se especifica en la informacion proporcionada el consumo de memoria ni la tarjeta mínima necesaria.
- Opciones de despliegue: Core ML en iOS y macOS (integracion via Xcode, framework Vision o Core ML directamente); el modelo base en PyTorch se distribuye como .pth y puede usarse con herramientas de upscaling compatibles. No aplican vLLM, llama.cpp, Ollama ni TGI, que son entornos de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del chip concreto, del tamano de la imagen de entrada y de si el grafo se ejecuta en el Neural Engine o en CPU.
- Requisito funcional conocido: la documentacion del modelo base recomienda un minimo de 300 pixeles en el lado mas corto de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / escala | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| 333i/4xPurePhoto-RealPLSKR-coreml-ios | no disponible | no aplica / 4x | CC-BY-SA-4.0 segun etiquetas; campo del Hub no disponible | Core ML | Repositorio en Hugging Face, 0 descargas y 0 valoraciones en el momento de la consulta |
| 4xPurePhoto-RealPLSKR (modelo base, asterixcool) | no disponible | no aplica / 4x | CC-BY-SA-4.0 | PyTorch (.pth) | Distribuido en Hugging Face y listado en OpenModelDB y StarinspaceUpscale |
| Otros puertos Core ML de modelos de upscaling | no disponible | no disponible | no disponible | Core ML | no disponible en la informacion proporcionada |

La informacion recuperada no permite comparar con alternativas de la misma categoria con datos verificables de rendimiento, tamano o consumo. Cualquier comparacion cuantitativa con modelos como Real-ESRGAN o variantes de CUGAN requeriria consultar sus fichas respectivas, que no forman parte del material disponible.

## Limitaciones y advertencias

- Trazabilidad limitada: el repositorio no registra descargas ni valoraciones, y no aporta ficha tecnica propia, tarjeta de modelo ni resultados de evaluacion. Toda la informacion funcional procede del modelo base y de directorios de terceros.
- Ambiguedad de licencia: las etiquetas del repositorio declaran CC-BY-SA-4.0, mientras que el campo de licencia del Hub figura como no disponible. Antes de un uso comercial conviene verificar la licencia efectiva con el autor.
- Implicaciones de CC-BY-SA-4.0: exige atribucion y comparte la misma licencia para obras derivadas, lo que puede resultar incompatible con productos propietarios que no quieran liberar su codigo o sus pesos.
- Riesgo de alucinacion visual: como todo modelo de superresolucion, puede generar detalle plausible pero inexistente, especialmente en texturas repetitivas (pelo, tejidos, hojas) y en zonas muy comprimidas. No debe usarse como prueba forense ni para reconstruir informacion objetiva.
- Sesgo de dominio: el modelo base fue entrenado con 8.684 imagenes y se describe como especializado en fotografias, pelo, gatos y escenas de fiesta. Es previsible un rendimiento inferior en ilustracion, anime, capturas de pantalla, documentos o imagenes medicas.
- Restriccion de tamano de entrada: la recomendacion de un minimo de 300 px en el lado mas corto implica que entradas mas pequenas pueden producir resultados pobres.
- Sin datos de cuantizacion ni de precision: se desconoce si el paquete Core ML usa float16, float32 o pesos cuantizados a int8, lo que impide anticipar la degradacion respecto al modelo original en PyTorch.
- Sin garantias de latencia en dispositivo: al no publicarse mediciones, no es posible dimensionar una experiencia de usuario en produccion sin hacer pruebas propias en el hardware objetivo.
- Fechas de publicacion inusuales: los metadatos indican creacion y actualizacion el 2026-09-25, lo que conviene contrastar antes de citar el repositorio como referencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/333i/4xPurePhoto-RealPLSKR-coreml-ios
- Ficha del modelo base en OpenModelDB: https://openmodeldb.info/models/4x-PurePhoto-RealPLSKR
- Directorio general de OpenModelDB: https://openmodeldb.info/
- Repositorio con el checkpoint en PyTorch: https://huggingface.co/mp3pintyo/upscale
- Archivo .pth del modelo base: https://huggingface.co/mp3pintyo/upscale/blob/8c80d55cdc2cc831912ece1848429cd3be52f9e1/4xPurePhoto-RealPLSKR.pth
- Listado de modelos de escalado con datos de entrenamiento: https://github.com/starinspace/StarinspaceUpscale
