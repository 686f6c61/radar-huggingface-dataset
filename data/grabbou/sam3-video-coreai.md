# grabbou/sam3-video-CoreAI

## Resumen

SAM 3 video para Core AI es una conversión del modelo de segmentación de vídeo `facebook/sam3` de Meta al formato Core AI de Apple, publicada por el usuario `grabbou`. El repositorio no entrena ni modifica los pesos originales: únicamente los exporta mediante la receta `sam3_video` del proyecto `apple/coreai-models`, con precisión float16 y una resolución de entrada de 672 píxeles pensada para ejecución en iPhone. El resultado es un bundle `CoreAIVideoSegmentation` de 1,6 GB que empaqueta los codificadores de imagen y texto, el detector, el tracker y el codificador de memoria en un único artefacto `.aimodel`, junto con el tokenizer CLIP y un `metadata.json` con los parámetros de seguimiento.

El modelo resuelve segmentación de vídeo guiada por texto: recibe un vídeo y una o varias prompts textuales (por ejemplo `cat` o `the red car`), localiza los objetos que coinciden y los rastrea entre fotogramas manteniendo identificadores estables. Es relevante porque traslada una capacidad típicamente asociada a infraestructura de servidor (SAM 3) al entorno on-device de Apple, lo que permite procesar vídeo sin enviar el contenido a un servicio externo y sin depender de conectividad.

La ficha se basa exclusivamente en la información del repositorio de Hugging Face y de la model card, que es muy escueta en cuanto a arquitectura, datos de entrenamiento y evaluación. Cualquier dato no documentado se marca como no disponible. La licencia aplicable es la SAM License de Meta, que se hereda en esta copia convertida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `facebook/sam3`; el bundle incluye codificadores de imagen y texto, detector, tracker y codificador de memoria) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (procesa vídeo fotograma a fotograma con memoria de seguimiento; no se documenta ventana temporal) |
| Tipos de cuantización | float16 (único dtype documentado en la exportación) |
| Idiomas soportados | no disponible (las prompts textuales se procesan con un tokenizer CLIP; no se declara cobertura lingüística) |
| Licencia | SAM License (`sam-license`), heredada de `facebook/sam3` |
| Formato de pesos | `.aimodel` (Core AI), más tokenizer CLIP y `metadata.json`; repo de 1,7 GB |
| Resolución de entrada | 672 px (también 336 px y 1008 px mediante la receta de exportación) |
| Plataformas | iOS y macOS |
| Tarea (pipeline) | `mask-generation` / `video-segmentation` |
| Librería | `coreai` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El repositorio es una conversión de formato, no un modelo entrenado por el autor: la model card indica explícitamente que «this repository only converts the model to Core AI format». El modelo de origen es `facebook/sam3`, y la conversión se realiza con la receta `models/sam3_video/export.py` del repositorio `apple/coreai-models`, invocada con `--dtype float16 --image-size 672`.

El bundle exportado agrupa en un solo `.aimodel` las funciones de codificador de imagen, codificador de texto, detector, tracker y codificador de memoria. Esa descomposición funcional sugiere un pipeline de segmentación con propagación temporal mediante memoria, coherente con la tarea de seguimiento de objetos entre fotogramas con identificadores estables, pero no se detalla ni el tipo de backbone, ni el número de tokens de entrenamiento, ni si hubo ajuste por RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia exportación a Core AI y de la selección de resolución como compromiso entre velocidad y precisión sobre objetos pequeños.

## Capacidades

- Segmentación de vídeo guiada por texto: acepta prompts como `cat` o `the red car` y devuelve las máscaras de los objetos coincidentes.
- Seguimiento temporal con identificadores estables: mantiene la identidad de cada objeto a lo largo de los fotogramas mediante el tracker y el codificador de memoria incluidos en el bundle.
- Segmentación de imagen, heredada de la tarea `mask-generation` del modelo base.
- Procesamiento on-device en iOS y macOS mediante el runtime Core AI de Apple.
- Salida de vídeo anotado: la API de ejemplo admite la opción `outputVideo: true`.
- Ajuste de resolución en la exportación: 336 px (más rápido, peor en objetos pequeños), 672 px (configuración publicada) y 1008 px (por defecto de la receta, más lento).
- Integración en aplicaciones React Native mediante `@react-native-ai/core-ai` y en Swift mediante `VideoSegmenter(resourcesAt:)`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni cobertura multilingüe.

## Casos de uso

- Edición de vídeo en aplicaciones móviles: el usuario selecciona un objeto con una prompt textual y la app genera una máscara que se propaga por todo el clip, lo que permite aplicar correcciones de color, desenfoques o recortes sin rotoscopia manual.
- Difuminado de privacidad on-device: procesar vídeo grabado por el usuario para localizar y anonimizar personas u objetos sensibles antes de compartirlo, sin que el material salga del dispositivo gracias a la ejecución local en Core AI.
- Análisis deportivo amateur: seguimiento de un jugador o de un balón a lo largo de una grabación para extraer trayectorias y métricas de movimiento, aprovechando los identificadores estables entre fotogramas.
- Inventario y seguimiento en vídeo doméstico o industrial: contar y rastrear objetos concretos (por ejemplo, vehículos en un aparcamiento o productos en una cinta) en grabaciones procesadas en macOS o en un iPhone.
- Accesibilidad: generación de descripciones o resaltados visuales de objetos concretos en vídeo para usuarios con baja visión, con la ventaja de que el procesamiento es local y no requiere subir contenido personal.
- Prototipado rápido de pipelines de segmentación: usar el bundle como referencia para validar una app iOS antes de invertir en infraestructura de servidor, dado que la exportación a Core AI permite comparar el comportamiento con el modelo original de Meta.
- Investigación en visión por computador: banco de pruebas para estudiar el impacto de la resolución de entrada (336, 672 y 1008 px) en la precisión sobre objetos pequeños en un entorno móvil real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (mIoU, J&F, etc.), latencia ni throughput, y solo describe cualitativamente los compromisos entre las tres resoluciones de exportación (336 px más rápido y menos preciso en objetos pequeños, 1008 px más lento).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto ocupa 1,6 GB en float16 y está pensado para memoria unificada de dispositivos Apple, no para GPU discretas.
- GPU recomendadas: no aplica en el sentido habitual; el destino declarado es iPhone (resolución 672 px) y también macOS.
- Cabe en GPU de consumo: no se documenta. El requisito real es un dispositivo Apple compatible con el runtime Core AI, cuyo listado no se detalla en la información disponible.
- Opciones de despliegue: runtime Core AI de Apple, con integración vía `@react-native-ai/core-ai` (React Native) o vía el producto `CoreAIVideoSegmentation` en Swift. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grabbou/sam3-video-CoreAI` | no disponible | vídeo, 672 px (configurable a 336/1008) | `.aimodel` (Core AI) | SAM License | Hugging Face, 0 descargas, 0 likes |
| `facebook/sam3` | no disponible | no disponible en la información | pesos originales de Meta | SAM License | Hugging Face (modelo base) |
| Otros segmentadores de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no permite establecer una comparación cuantitativa con alternativas de la misma categoría. La única comparación documentada es con el modelo base `facebook/sam3`, del que esta publicación es una conversión de formato para Core AI.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier limitación del SAM 3 original se hereda sin cambios.
- La documentación no aporta datos sobre sesgos, y no se puede evaluar su comportamiento diferencial por demografía, idioma o tipo de contenido.
- Riesgo de alucinación de máscaras: al ser un modelo guiado por texto, prompts ambiguas o poco frecuentes pueden producir segmentaciones incorrectas; no se documenta ningún mecanismo de calibración de confianza.
- La cobertura lingüística de las prompts no está declarada; el tokenizer es CLIP y no se especifica qué idiomas funcionan correctamente.
- La resolución de 672 px reduce la precisión en objetos pequeños frente a los 1008 px, según advierte la propia model card.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación por terceros.
- La licencia SAM License es distinta de las licencias open source habituales; es necesario revisar sus términos antes de cualquier uso comercial, y la copia del acuerdo se incluye en el repositorio por exigencia de la propia licencia.
- Dependencia del runtime Core AI de Apple: no es desplegable en Linux, Windows ni en GPUs NVIDIA, lo que limita su uso a infraestructura Apple.
- No se documentan requisitos mínimos de versión de iOS o macOS, ni el rendimiento en dispositivos de gama baja.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/grabbou/sam3-video-CoreAI
- Modelo base: https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/facebook/sam3/blob/main/LICENSE
- Receta de exportación `sam3_video`: https://github.com/apple/coreai-models/tree/main/models/sam3_video
- Repositorio `apple/coreai-models`: https://github.com/apple/coreai-models
- Integración React Native `@react-native-ai/core-ai`: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
