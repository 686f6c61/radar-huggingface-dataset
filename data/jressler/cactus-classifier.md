# jressler/cactus-classifier

## Resumen

El modelo `jressler/cactus-classifier` es un clasificador de imágenes desarrollado por el usuario jressler que identifica tres especies del género *Trichocereus* (T. bridgesii, T. pachanoi y T. peruvianus) frente a tres cactus de aspecto similar (*Myrtillocactus geometrizans*, *Pilosocereus pachycladus* y *Cereus repandus*) más una categoría limitada de `unknown`. Se trata de una red convolucional Torchvision ConvNeXt Small inicializada con pesos preentrenados de ImageNet y afinada para siete clases, empaquetada como un modelo PyTorch personalizado que requiere un cargador propio (`inference.py`).

El problema que resuelve es la desambiguación visual entre cactus del género *Trichocereus* y otras especies de porte similar, un caso típico de clasificación fina dentro del ámbito botánico y ecológico. No es un modelo de lenguaje ni un `AutoModel` de Transformers: su salida es una lista de puntuaciones softmax ordenadas por clase, no texto. El repositorio ocupa 0,2 GB y se publica bajo licencia Apache-2.0.

Su relevancia es acotada y especializada: sirve como componente de una aplicación de servidor (el proyecto asociado `cactus-server`, basado en FastAPI y HTMX) para identificación botánica asistida. No se han publicado datos sobre parámetros totales, longitud de contexto (no aplica) ni idiomas en la información disponible. Las imágenes de entrenamiento no se incluyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt Small de Torchvision (CNN) |
| Parametros totales | no disponible (≈50 millones en la implementacion estandar de ConvNeXt Small, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes); etiquetas en nomenclatura cientifica latina |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch/Torchvision con cargador propio (`inference.py`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional ConvNeXt Small de Torchvision, inicializada a partir de pesos preentrenados en ImageNet y ajustada finamente para siete clases. La entrada es una imagen RGB redimensionada a 256 píxeles en el lado corto, recortada al centro a 224 × 224, convertida a tensor y normalizada con la media y la desviación estándar de ImageNet. La salida son puntuaciones por clase ordenadas de mayor a menor.

El conjunto de entrenamiento se ensambló a partir de observaciones de iNaturalist de calidad científica, con particiones agrupadas por observación para reducir la fuga de datos entre entrenamiento y evaluación. Las imágenes y los registros de licencia y atribución no se incluyen en el repositorio. La información disponible no detalla el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, la duración del entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables directamente a clasificación). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, ya que no proceden en este tipo de modelo.

## Capacidades

- Clasificacion de imagenes en siete clases: `trichocereus_bridgesii`, `trichocereus_pachanoi`, `trichocereus_peruvianus`, `miss_cereus_repandus`, `miss_myrtillocactus_geometrizans`, `miss_pilosocereus_pachycladus` y `unknown`.
- Distincion fina entre especies del genero *Trichocereus* y cactus de aspecto similar (lookalikes).
- Categoria `unknown` entrenada a partir de otras plantas muestreadas, con recall del 95,7 % sobre los ejemplos de esa clase.
- Salida de puntuaciones softmax ordenadas de mayor a menor por clase.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo de pensamiento (thinking mode), vision generativa ni audio.

## Casos de uso

- Identificacion botanica asistida en aplicaciones moviles o web: el modelo puede clasificar una foto de un cactus y devolver la especie probable entre las siete clases, integrado en el servidor `cactus-server` con FastAPI y HTMX.
- Herramientas de campo para aficionados y botánicos: permite una comprobacion rapida de la especie observada antes de registrar una observacion en plataformas de ciencia ciudadana como iNaturalist.
- Filtrado previo en repositorios de imagenes: separar automaticamente imagenes de *Trichocereus* de las de cactus de aspecto similar para organizar catalogos fotograficos.
- Modulo de triaje en pipelines de investigacion ecologica: preclasificar grandes lotes de imagenes para priorizar la revision manual de las mas dudosas.
- Deteccion de desviaciones en inventarios de colecciones de cactus: marcar imagenes que no encajan con las especies esperadas en una coleccion, usando la categoria `unknown` como senal.
- Punto de partida para transferencia de aprendizaje: al ser un ConvNeXt Small afinado, puede servir de base para reentrenar con nuevas especies o condiciones de imagen.
- Verificacion de contenido en marketplaces de plantas: ayudar a detectar anuncios donde la etiqueta de especie declarada no coincide con la imagen.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles provienen de la model card y corresponden a la particion de test reservada de 169 imagenes. No se han publicado comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Precision (accuracy) en test | 87,6 % |
| Macro F1 | 0,874 |
| Recall de la clase `unknown` | 95,7 % (22 de 23) |
| Rechazo de clases conocidas | 0 % (0 de 146) |
| Umbral de confianza adicional | 0,00 (sin rechazo adicional por baja confianza) |
| Tamano de la particion de test | 169 imagenes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un clasificador de imagenes. Los detalles completos de metricas y analisis de umbral estan en `test-metrics.json` y `calibration.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: reducida; un ConvNeXt Small (≈50 millones de parametros) en fp32 ocupa del orden de 200 MB de pesos, por lo que cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 4090, RTX 3060 o similar ejecuta la inferencia sin problemas, aunque el modelo tambien corre en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con suficiente memoria (incluso integradas o CPU).
- Opciones de despliegue: no es un modelo de Transformers, por lo que no se sirve directamente con vLLM, TGI ni Ollama; requiere el cargador propio (`inference.py`) o la aplicacion `cactus-server` basada en FastAPI. Puede exportarse a otros formatos (por ejemplo ONNX o TorchScript) de forma manual, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia de categoria, otros clasificadores de imagenes de plantas o de clasificacion fina (por ejemplo, modelos derivados de ConvNeXt, EfficientNet o ViT afinados sobre datasets botanicos) serian alternativas naturales, pero no se aportan datos concretos de parametros, contexto, rendimiento ni licencia que permitan una comparacion rigurosa en esta informacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jressler/cactus-classifier | no disponible (≈50 M estandar) | no aplica | 87,6 % accuracy, 0,874 macro F1 | apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La clase `unknown` solo representa la muestra de otros cactus, suculentas y plantas recogida; no cubre cualquier imagen fuera de dominio. Objetos no vegetales pueden recibir una prediccion confiada de cactus.
- Las puntuaciones de salida son softmax y no probabilidades calibradas; no deben interpretarse como niveles de confianza reales.
- El umbral de confianza adicional seleccionado en validacion fue 0,00, por lo que no se aplica rechazo por baja confianza; esto implica que el modelo puede asignar una clase conocida a imagenes dudosas.
- El rendimiento documentado (87,6 % de precision) procede de una particion de test pequena (169 imagenes) y puede no generalizar a otras condiciones de imagen, iluminacion, fondo o camaras.
- No hay informacion sobre sesgos especificos, pero al entrenarse con observaciones de iNaturalist puede heredar sesgos de muestreo geografico y de calidad fotografica de esa plataforma.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas confiadas, especialmente con imagenes fuera de las siete clases o no vegetales.
- Limitaciones de idioma: no aplica, ya que no procesa texto.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, lo que permite uso comercial, pero las imagenes de entrenamiento y sus registros de atribucion no se incluyen y siguen sujetos a las licencias de sus observaciones originales.
- Es un modelo PyTorch personalizado, no un `AutoModel` de Transformers; requiere el cargador incluido, lo que complica su integracion en stacks estandar de difusion de modelos.
- No se documentan tecnicas de cuantizacion ni exportacion, por lo que el despliegue optimizado queda a cargo del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jressler/cactus-classifier
- Codigo de entrenamiento, preparacion del dataset y exportacion: https://github.com/joeressler/cactus-classifier
- Aplicacion de servidor (FastAPI y HTMX): https://github.com/joeressler/cactus-server

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces encontrados (articulos sobre mezclas de combustible, aprendizaje profundo en ecologia y evolucion, y otros) no estan relacionados con este clasificador y por ello no se incluyen.
