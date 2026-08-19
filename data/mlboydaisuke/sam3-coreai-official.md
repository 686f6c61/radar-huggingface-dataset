# mlboydaisuke/sam3-CoreAI-official

## Resumen

El repositorio `mlboydaisuke/sam3-CoreAI-official` contiene una conversión pre-empaquetada del modelo SAM 3 (Segment Anything Model 3) de Meta al formato `.aimodel` de Apple Core AI, lista para ejecutarse directamente en el runtime Core AI de Apple Silicon. Se trata de un bundle generado con la receta oficial de exportación de Apple (`apple/coreai-models`), sin modificaciones, con hashes criptográficos verificados y rendimiento medido publicado. El modelo resuelve el problema de segmentación de imágenes con prompts de texto en vocabulario abierto: dada una imagen y una frase como "gato" o "el coche rojo", devuelve máscaras de instancia, cajas delimitadoras y puntuaciones por objeto, sin necesidad de una lista fija de clases.

La relevancia actual radica en que elimina la barrera de conversión del modelo base (cuyo checkpoint está protegido por una licencia restringida) y permite a desarrolladores de macOS e iOS integrar segmentación semántica de última generación en sus aplicaciones con solo descargar el bundle. El paquete incluye los pesos en float16 (~1,5 GB), el grafo compilado y el tokenizador CLIP necesario para procesar los prompts de texto. La arquitectura subyacente es la de SAM 3 de Meta, un modelo de segmentación promptable unificado, aunque el número total de parámetros no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (Segment Anything Model 3) de Meta, variante imagen + texto-prompt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; el prompt de texto se procesa con tokenizador CLIP) |
| Tipos de cuantizacion | float16 (tambien se puede exportar float32 segun la receta, pero el bundle distribuido es float16) |
| Idiomas soportados | no disponible (el prompt es open-vocabulary; no se especifican idiomas) |
| Licencia | SAM License (Meta) |
| Formato de pesos | `.aimodel` (formato de Apple Core AI, contiene MLIRB) |
| Pipeline | image-segmentation |
| Tamano del repo | 3,3 GB (pesos float16 ~1,5 GB) |

## Arquitectura y entrenamiento

SAM 3 es un modelo de segmentación promptable unificado desarrollado por Meta, que acepta tanto prompts de imagen (puntos, cajas) como prompts de texto en lenguaje natural. La variante aquí distribuida está optimizada para el prompt de texto, usando un tokenizador CLIP para codificar la frase y devolviendo máscaras de instancia, cajas delimitadoras y puntuaciones por objeto. No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni el proceso de optimización (RLHF, etc.) en la documentación proporcionada.

La innovación técnica de este bundle no reside en la arquitectura del modelo, sino en su conversión al formato `.aimodel` de Apple Core AI. La exportación se realizó con la receta oficial de Apple (`coreai-models/export.py`) sin modificaciones, utilizando el entorno de desarrollo de Apple (macOS 27.0 beta, Xcode 27.0 beta, coreai-core 1.0.0b1, coreai-torch 0.4.0, transformers 5.x). El resultado es un grafo compilado que se ejecuta en el runtime Core AI estándar mediante la API `CoreAIImageSegmenter`, sin necesidad de parchear el motor. Además, se verifica la fidelidad numérica entre float16 y float32: las puntuaciones de las dos mejores máscaras difieren en menos de 1e-4, las cajas delimitadoras en menos de 1 píxel y el recuento de píxeles del primer plano es idéntico para las tres máscaras principales.

## Capacidades

- Segmentación de instancias con prompts de texto en vocabulario abierto: el modelo identifica objetos descritos con frases arbitrarias (p. ej., "gato", "el coche rojo") sin necesidad de una lista predefinida de clases.
- Devuelve por cada instancia detectada una máscara binaria, una caja delimitadora y una puntuación de confianza.
- Soporte para prompts de imagen (puntos y cajas) según la arquitectura SAM 3, aunque la variante distribuida está orientada al prompt de texto.
- Ejecución nativa en el runtime Core AI de Apple (CoreAIImageSegmenter), sin dependencias externas adicionales.
- Compatibilidad con macOS e iOS: en iOS se requiere compilación AOT previa con `xcrun coreai-build compile` para la arquitectura objetivo (p. ej., `h18p` para iPhone 17 Pro).
- Alta fidelidad numérica en float16, lo que permite reducir el tamaño del modelo a la mitad sin pérdida significativa de precisión.

## Casos de uso

- Edición de fotografías en apps de macOS: el usuario selecciona un objeto escribiendo su nombre ("árbol", "persona") y la app genera una máscara precisa para recortarlo, eliminarlo o aplicar filtros solo a esa región. La latencia de 0,55 s en M4 Max permite una experiencia interactiva aceptable.
- Etiquetado automatizado de datasets de visión por computador: se procesan imágenes en lote con prompts descriptivos para generar máscaras de instancia que sirvan como ground truth para entrenar otros modelos, reduciendo el esfuerzo de anotación manual.
- Aplicaciones de realidad aumentada en iOS: segmentar objetos del entorno en tiempo real (o casi) para superponer contenido virtual sobre superficies u objetos específicos, usando la compilación AOT para el dispositivo objetivo.
- Accesibilidad visual: describir los elementos presentes en una imagen a partir de prompts de texto y devolver sus localizaciones, lo que puede integrarse en lectores de pantalla o asistentes para personas con discapacidad visual.
- Automatización de flujos de diseño gráfico: en herramientas como editores vectoriales, el modelo permite extraer siluetas de objetos de fotografías con un simple prompt textual, acelerando la creación de recursos gráficos.
- Análisis de imágenes en entornos de investigación: los investigadores pueden segmentar regiones de interés en imágenes científicas (p. ej., células, estructuras geológicas) describiéndolas en lenguaje natural, sin entrenar clasificadores específicos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible provienen de la medición realizada por el autor del bundle en un Apple M4 Max, utilizando la herramienta CLI oficial `image-segmenter` de Apple sobre la imagen COCO de dos gatos (640×480, reescalada internamente a 1008×1008) con el prompt "cat":

| Metrica | Valor |
|---|---|
| Tiempo de inferencia (en caliente, incl. pre/post-procesamiento) | 0,55 s |
| Salida | 2 mascaras de instancia de alta confianza para "cat" (scores 0,97 y 0,96) |
| Consultas espurias | caen por debajo del umbral de 0,5 |
| Fidelidad float16 vs float32 (top-2 scores) | diferencia ≤ 1e-4 |
| Diferencia en cajas delimitadoras | ≤ 1 px |
| Recuento de pixeles de las top-3 mascaras | identico entre float16 y float32 |

No se han publicado comparativas con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M-series). Las pruebas se realizaron en un M4 Max, pero el modelo debería ejecutarse en cualquier chip compatible con Core AI.
- VRAM estimada: no especificada; los pesos float16 ocupan ~1,5 GB, por lo que se requiere al menos esa cantidad de memoria unificada disponible.
- GPU recomendada: no aplica a GPUs NVIDIA; el modelo está diseñado para el Neural Engine y la GPU integrada de Apple Silicon.
- Compatibilidad con hardware de consumo: sí, en Macs con Apple Silicon (M1 o posterior) y iPhones/iPads con chip A17 Pro o posterior (según arquitectura de compilación AOT).
- Opciones de despliegue:
  - CLI oficial de Apple (`image-segmenter`) desde un checkout de `apple/coreai-models`.
  - Integración en apps Swift mediante la API `CoreAIImageSegmenter`.
  - Aplicación de ejemplo `CoreAISegment` (macOS + iOS).
- Latencia y throughput: 0,55 s por imagen en caliente en M4 Max (incluye pre/post-procesamiento). El throughput dependerá del dispositivo y del tamaño de imagen.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la información proporcionada. El modelo SAM 3 es la tercera generación de la familia Segment Anything de Meta, pero no se ofrecen datos comparativos con SAM 2 o SAM original en este repositorio. Para una comparación rigurosa, sería necesario consultar el modelo base `facebook/sam3` en HuggingFace.

## Limitaciones y advertencias

- Licencia: el modelo está distribuido bajo la SAM License de Meta, que impone restricciones de uso comercial. El bundle hereda esta licencia y debe revisarse antes de su uso en producción.
- Dependencia del ecosistema Apple: el formato `.aimodel` solo se ejecuta en el runtime Core AI de Apple Silicon; no es portable a entornos Linux, Windows o GPUs NVIDIA.
- Idioma de los prompts: no se especifica qué idiomas soporta el tokenizador CLIP; es probable que el rendimiento óptimo se obtenga en inglés, aunque no se confirma.
- Riesgo de errores de segmentación: como cualquier modelo de visión, puede producir falsos positivos o negativos, especialmente con objetos ambiguos o prompts poco descriptivos. Las consultas espurias se filtran con un umbral de 0,5.
- Sesgos: no se documentan sesgos específicos, pero los modelos entrenados con datos de internet pueden reflejar sesgos demográficos o culturales en la segmentación de objetos.
- Requisitos de compilación para iOS: los bundles deben compilarse AOT para la arquitectura concreta del dispositivo antes de su uso, lo que añade un paso adicional al despliegue.
- Repositorio con pocas descargas: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una adopción limitada y una validación comunitaria escasa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/sam3-CoreAI-official
- Modelo base SAM 3 de Meta: https://huggingface.co/facebook/sam3
- Licencia SAM (Meta): https://huggingface.co/facebook/sam3/blob/main/LICENSE
- Repositorio de recetas de exportación de Apple: https://github.com/apple/coreai-models
- Aplicación de ejemplo CoreAISegment: https://github.com/john-rocky/coreai-model-zoo/tree/main/apps/CoreAISegment
