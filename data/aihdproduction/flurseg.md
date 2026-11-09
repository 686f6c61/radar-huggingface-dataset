# AIhdproduction/Flurseg

## Resumen

Flurseg es un modelo de segmentación semántica de imágenes en vista cenital (dron, ortofoto y fotografía móvil apuntando hacia abajo) que asigna a cada píxel una de 11 clases orientadas al mapeo de superficies urbanas y de obra: pavimento, suelo, vegetación, edificios, vehículos, objetos de construcción, bordillos, marcas viales y tapas de servicios. Lo desarrolla AIhdproduction y se distribuye en Hugging Face bajo la licencia DINOv3, con la librería `transformers` y el pipeline `image-segmentation`.

Técnicamente es un estudiante destilado de SAM 3: el modelo profesor generó pseudo-etiquetas de forma automática (sin intervención humana) y sobre ellas se afinó un EoMT-DINOv3-Large, de modo que el estudiante resuelve la tarea con un único forward pass por tesela en lugar de múltiples pasadas con prompts de texto de SAM 3. El checkpoint base es `tue-mps/eomt-dinov3-ade-semantic-large-512`, que aporta un backbone DINOv3 y una cabeza preentrenada en ADE20K.

La relevancia actual reside en su enfoque de destilación con profesor fundacional para producir un segmentador especializado y ligero en inferencia, con un mIoU de validación de 0,6459 en la versión v1 (40.000 pasos) medida frente a las pseudo-etiquetas de SAM 3. El repositorio ocupa 1,3 GB y la versión v2 (ronda de autoentrenamiento) está anunciada como próxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EoMT (Encoder-only Mask Transformer) con backbone DINOv3-Large; segmentación semántica por píxel |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana deslizante de 768 px con stride de 384 px sobre la imagen de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades lingüísticas) |
| Licencia | DINOv3 License (`license: other`, `license_name: dinov3-license`) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EoMT (Kerssies et al., CVPR 2025), un transformer encoder-only que trata la segmentación como un problema de enmascaramiento sobre los tokens de un ViT, sin decodificador convolucional separado. El backbone es DINOv3-Large, preentrenado por Meta AI con auto-supervisión, y la cabeza parte del checkpoint `tue-mps/eomt-dinov3-ade-semantic-large-512`, entrenado en ADE20K. La resolución de trabajo del checkpoint base es 512, aunque la inferencia recomendada usa ventanas de 768 px.

El entrenamiento es un proceso de destilación de conocimiento desde SAM 3: el profesor generó pseudo-etiquetas automáticas sobre las imágenes (sin humano en el bucle), que después fueron revisadas y mejoradas manualmente para corregir errores de segmentación y elevar la calidad de las etiquetas. Sobre ese conjunto se afinó el estudiante durante 40.000 pasos (v1). No se especifica en la información disponible el número de tokens ni la composición exacta del dataset, más allá de que la imaginería de entrenamiento procede mayoritariamente de Suiza y otros países europeos (Noruega, Francia, Alemania, Países Bajos, España, Luxemburgo, Suecia), con una minoría de ortofotos de Nueva Zelanda, EE. UU. y otras regiones. No se documenta uso de RLHF ni DPO, algo esperable en un modelo puramente visual.

## Capacidades

- Segmentación semántica densa por píxel en 11 clases: `other`, `ground`, `paved_surface`, `low_vegetation`, `tree`, `building`, `vehicle`, `construction`, `curb`, `road_marking` y `utility_cover`.
- Procesamiento de imágenes cenitales de dron, ortofotos y fotografía móvil orientada hacia abajo.
- Inferencia en un único forward pass por tesela, frente a las múltiples pasadas con prompts de texto que requiere SAM 3.
- Segmentación de imágenes de gran tamaño mediante ventana deslizante (768 px, stride 384 px) con acumulación de scores por clase y argmax por píxel, sin reescalado de la imagen.
- Etiqueta de valor 255 reservada como "ignore" en las etiquetas de entrenamiento (nunca se predice).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo: es exclusivamente un modelo de visión.
- Sin capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Mapeo de superficies urbanas a partir de ortofotos: el modelo clasifica píxel a píxel pavimento, suelo, vegetación, edificios y vehículos, lo que permite generar cartografía de cobertura del suelo y actualizar bases de datos municipales con una sola pasada por tesela.
- Monitorización de obras de construcción: la clase `construction` y la detección de objetos de obra permiten hacer seguimiento temporal de la evolución de un solar comparando segmentaciones entre vuelos de dron sucesivos.
- Inventario de arbolado y vegetación: las clases `tree` y `low_vegetation` facilitan el recuento y la delimitación de copas y superficies verdes para planificación urbana o estudios de confort térmico.
- Inspección de infraestructura viaria: `road_marking`, `curb` y `utility_cover` permiten localizar marcas viales, bordillos y tapas de servicios para mantenimiento predictivo, aunque con la advertencia de que son clases finas y minoritarias.
- Análisis de ocupación de aparcamiento y tráfico: la clase `vehicle` sobre imágenes de dron u ortofoto permite estimar ocupación de plazas y flujos en recintos cerrados.
- Automatización de pipelines de teledetección: al integrarse en `transformers` con pesos safetensors, puede desplegarse como etapa de preprocesado en flujos batch sobre mosaicos de ortofoto, aplicando ventana deslizante para imágenes de alta resolución.
- Generación de capas SIG listas para GIS: la paleta de colores fija por clase y el `classes.yaml` de la v1 permiten exportar máscaras directamente a formatos de visualización o a sistemas de información geográfica.

## Benchmarks y rendimiento

| Version | mIoU de validacion | Notas |
|---|---|---|
| v1 | 0,6459 | Destilado de pseudo-etiquetas de SAM 3, 40.000 pasos |
| v2 | no disponible | Autoentrenamiento, anunciada como "coming soon" |

La métrica se mide sobre teselas de validación frente a las pseudo-etiquetas de SAM 3, no frente a verdad de campo verificada de forma independiente. No se han publicado resultados de benchmarks estándar (ADE20K, Cityscapes u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,3 GB en safetensors y el backbone es DINOv3-Large, por lo que se requiere una GPU con memoria suficiente para el modelo más las activaciones de ventanas de 768 px (no cuantificado en la información).
- GPU recomendadas: no especificadas por el autor; por el tamaño del backbone, son razonables GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090), aunque no hay confirmación en la información disponible.
- Compatibilidad con GPU consumer: no confirmada en la información disponible.
- Opciones de despliegue: `transformers` con `EomtDinov3ForUniversalSegmentation` (carga con `subfolder="v1"`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Flurseg (v1) | EoMT + DINOv3-Large, destilado de SAM 3 | no disponible | Ventana 768 px, stride 384 px | mIoU 0,6459 frente a pseudo-etiquetas SAM 3 | DINOv3 License | Hugging Face (`AIhdproduction/Flurseg`) |
| SAM 3 (profesor) | Segmentación fundacional con prompts de texto | no disponible | Múltiples pasadas con prompt | No comparable directamente; mayor coste de inferencia | no disponible en la información | Meta AI, 2025 |
| `tue-mps/eomt-dinov3-ade-semantic-large-512` (base) | EoMT + DINOv3-Large, ADE20K | no disponible | 512 px | Preentrenado en ADE20K; métricas no disponibles aquí | MIT (EoMT) según la model card | Hugging Face |

La comparación con SAM 3 no es directa: Flurseg es un estudiante especializado de 11 clases, mientras que SAM 3 es un segmentador fundacional guiado por conceptos. El checkpoint base comparte arquitectura y backbone, pero está entrenado en ADE20K y no en las clases de obra y superficie urbana de Flurseg.

## Limitaciones y advertencias

- La métrica reportada mide concordancia con las pseudo-etiquetas de SAM 3, no con verdad de campo verificada independientemente; aunque las máscaras se revisaron y mejoraron manualmente, persiste el riesgo de heredar errores del profesor.
- Las clases finas y raras (`curb`, `road_marking`, `utility_cover`) siguen siendo más difíciles que las frecuentes y pueden rendir peor que SAM 3 pese al refinado manual de máscaras.
- La imaginería de entrenamiento es mayoritariamente europea (Suiza y otros países), con pocas muestras de Nueva Zelanda, EE. UU. y otras regiones; el rendimiento puede degradarse en otras zonas y sensores.
- Está diseñado para vistas cenitales; no se garantiza su comportamiento en perspectivas oblicuas o imágenes no aéreas.
- No debe reescalarse la imagen de entrada: hay que usar ventana deslizante de 768 px con stride 384 px y argmax por píxel sobre los scores acumulados.
- La licencia es la DINOv3 License (no MIT ni Apache), derivada del backbone DINOv3; conviene revisar sus términos antes de un uso comercial. El checkpoint base EoMT es MIT según la model card, pero los pesos distribuidos aquí quedan bajo DINOv3 License.
- No se distribuyen los pesos de SAM 3 ni los datos de entrenamiento; solo se distribuyen los pesos del estudiante.
- No hay información sobre sesgos demográficos o geográficos más allá de la distribución de la imaginería de entrenamiento, ni sobre calibración de confianza por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIhdproduction/Flurseg
- Subcarpeta de la versión v1: https://huggingface.co/AIhdproduction/Flurseg/tree/main/v1
- Checkpoint base: https://huggingface.co/tue-mps/eomt-dinov3-ade-semantic-large-512
- Licencia DINOv3 (referencia): https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Paper DINOv3 (Simeoni et al., Meta AI, 2025): no disponible en la información proporcionada
- Paper EoMT "Your ViT is Secretly an Image Segmentation Model" (Kerssies et al., CVPR 2025): no disponible en la información proporcionada
- Paper SAM 3 "Segment Anything with Concepts" (Meta AI, 2025): no disponible en la información proporcionada
