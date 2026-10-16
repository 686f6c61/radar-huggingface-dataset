# projectsidewalk/sidewalk-tagger-ai-obstacle

## Resumen

El modelo `projectsidewalk/sidewalk-tagger-ai-obstacle` es un clasificador de imagen multi-etiqueta desarrollado por el equipo de Project Sidewalk. Su tarea concreta es predecir qué etiquetas de accesibilidad se aplican a un recorte de imagen de Google Street View que ha sido marcado previamente como un obstáculo en la acera. No es un modelo generativo ni un modelo de lenguaje: es un cabezal de clasificación sobre un backbone de visión, integrado en el servicio `sidewalk-ai-api`, que lo utiliza para sugerir etiquetas a las personas voluntarias que etiquetan aceras de forma colaborativa en la plataforma Project Sidewalk.

Técnicamente, se trata de un DINOv2 ViT-B/14 con 4 tokens de registro (`dinov2_vitb14_reg4`) afinado, al que se le añade un cabezal `Linear(768, 256) → ReLU → Linear(256, 20)` con una sigmoide por clase. La entrada es un recorte RGB redimensionado a 256 px, con padding a un múltiplo de 14 y normalización con media y desviación típica de ImageNet. La salida son 20 posiciones, de las cuales 3 son marcadores `NULL` sin uso que preservan los índices originales del entrenamiento, quedando 17 etiquetas operativas.

Su relevancia es de nicho pero clara: forma parte del conjunto de modelos publicados junto al artículo "Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset" (ASSETS '24), que libera tanto el dataset validado como los modelos y el código de reproducción. Es un ejemplo de modelo especializado y de tamaño reducido orientado a una tarea social concreta, la evaluación de accesibilidad de aceras, más que a propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 con 4 tokens de registro (`dinov2_vitb14_reg4`) afinado, más cabezal de clasificación multicapa con sigmoide por clase |
| Parámetros totales | No disponible en la model card (el backbone declarado pertenece a la familia ViT-B/14; el autor no publica el recuento exacto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen de 256 px redimensionada y con padding a múltiplo de 14) |
| Tipos de cuantización | No disponible; la model card no documenta versiones cuantizadas. Se distribuye como state dict de PyTorch |
| Idiomas soportados | No aplica (modelo de clasificación de imagen); la model card no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`.pth`), cargable con `torch.load(..., weights_only=True)` |
| Cabezal | `Linear(768, 256) → ReLU → Linear(256, 20)` con sigmoide por clase |
| Entrada | Recorte RGB redimensionado a 256 px, padding a múltiplo de 14, normalización con media y desviación típica de ImageNet |
| Número de clases | 20 posiciones de salida, de las que 17 son etiquetas activas y 3 son marcadores `NULL` sin uso |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | `facebook/dinov2-with-registers-base` |
| Librería | PyTorch (arquitectura personalizada, no una clase de `transformers`) |
| Pipeline | `image-classification` (clasificación multi-etiqueta) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-15 |
| Última actualización | 2026-10-15 |

Etiquetas activas, en el orden de salida del modelo: `construction`, `fire hydrant`, `height difference`, `litter/garbage`, `narrow`, `parked bike`, `parked car`, `parked scooter/motorcycle`, `pole`, `sign`, `stairs`, `trash/recycling can`, `tree`, `vegetation`, `mailbox`, `seating`, `uneven/slanted`. Los índices 2, 6 y 13 son `NULL`.

## Arquitectura y entrenamiento

El modelo parte del backbone `facebook/dinov2-with-registers-base`, un Vision Transformer con parches de 14 px y 4 tokens de registro, y se afina para una tarea de clasificación multi-etiqueta. Sobre las características del backbone se monta un cabezal específico: `Linear(768, 256) → ReLU → Linear(256, 20)`, con una activación sigmoide independiente por clase, lo que permite que varias etiquetas estén activas simultáneamente para un mismo recorte. La arquitectura es personalizada y no se corresponde con ninguna clase estándar de la librería `transformers`; la carga y el preprocesamiento se implementan en `DinoVisionTransformerClassifier` e `ImageTagger`, definidos en `sidewalk_ai_api/tagger.py` del repositorio `sidewalk-ai-api`.

El entrenamiento se realizó sobre la versión limpiada del dataset `projectsidewalk/sidewalk-tagger-ai-validated`, descrito en el artículo "Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset" (ASSETS '24). La model card no especifica el número de imágenes, la composición exacta del dataset, el número de épocas, la estrategia de aumento de datos ni si se aplicaron técnicas de ajuste adicionales más allá del afinado supervisado. Tampoco se documentan innovaciones arquitectónicas propias más allá del uso del backbone DINOv2 con tokens de registro y del cabezal multi-etiqueta. El modelo se publica como copia byte a byte del fichero `validated-dino-cls-b-obstacle-tags-best.pth` del repositorio `projectsidewalk/sidewalk-tagger-ai-models` (commit `65959dbc80b87e4f39385204c4b639cbcf58e1a8`), con `sha256: da4f7ae0bb21d1a5b13a785ebc8553dcd8746eb823183f5c53332fe078009b6d`.

Un detalle relevante de operación: las puntuaciones sigmoideas no son probabilidades calibradas. Project Sidewalk utiliza umbrales por etiqueta para decidir si sugiere presencia o ausencia de cada una; esos umbrales están en el fichero `tag_thresholds.json` del repositorio `sidewalk-ai-api` y son parte imprescindible del sistema en producción.

## Capacidades

- Clasificación multi-etiqueta de recortes de imagen de aceras: predice simultáneamente las 17 etiquetas activas de obstáculo (construcción, hidrante, diferencia de altura, basura, estrechez, bicicleta aparcada, coche aparcado, moto o escúter aparcado, poste, señal, escaleras, contenedor o papelera, árbol, vegetación, buzón, asientos y superficie irregular o inclinada).
- Salida de 20 logits con sigmoide por clase, pensada para umbralización por etiqueta mediante `tag_thresholds.json`, no para lectura directa como probabilidad.
- Integración como servicio de sugerencia de etiquetas para etiquetado colaborativo: el modelo propone etiquetas que las personas voluntarias aceptan o corrigen.
- Procesamiento de recortes concretos asociados a una etiqueta previa de obstáculo, no de la imagen completa de Street View.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión generalista, tool calling ni capacidades de agente. La model card no documenta ninguna de estas funciones.
- No se declaran capacidades multilingües ni procesamiento de texto.
- Capacidad especial: ninguna documentada más allá de la clasificación multi-etiqueta específica del dominio.

## Casos de uso

- Sugerencia de etiquetas en crowdsourcing: en la plataforma Project Sidewalk, el modelo recibe el recorte asociado a un obstáculo y propone qué etiquetas aplicar, reduciendo el coste por tarea para las personas voluntarias, que solo tienen que validar o corregir la sugerencia.
- Auditoría de accesibilidad a escala municipal: procesando por lotes recortes de Street View de una ciudad, el modelo permite generar un inventario preliminar de obstáculos clasificados por tipo, que después se revisa con muestreo humano.
- Priorización de mantenimiento urbano: agregando las etiquetas predichas por zona, un ayuntamiento puede priorizar la retirada de obstáculos recurrentes como vehículos mal aparcados, contenedores o vegetación invasiva en itinerarios concretos.
- Triaje previo a inspección humana: dado un volumen grande de recortes candidatos, el modelo filtra los que probablemente corresponden a categorías concretas (por ejemplo, `stairs` o `height difference`), de modo que el equipo humano solo revisa los casos relevantes.
- Enrutado peatonal accesible: integrado en una aplicación de navegación, el modelo puede etiquetar tramos con presencia de obstáculos incompatibles con sillas de ruedas (`height difference`, `narrow`, `uneven/slanted`) y alimentar un grafo de rutas accesibles.
- Análisis urbanístico e investigación: al ser un modelo publicado con dataset validado y guía de reproducción, permite comparar metodologías de evaluación de accesibilidad y servir de punto de partida para estudios sobre equidad en la calidad de las aceras.
- Integración en pipelines GIS: la salida multi-etiqueta indexada se puede volcar a una tabla con coordenadas y geometría, de modo que las etiquetas se crucen con capas de movilidad, censos o siniestralidad.
- Preetiquetado de nuevos datasets: el modelo puede usarse para generar etiquetas iniciales sobre recortes no anotados, que luego se corrigen y se incorporan al conjunto de entrenamiento, reduciendo el coste de ampliar la cobertura geográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados por etiqueta del artículo "Towards Fine-Grained Sidewalk Accessibility Assessment with Deep Learning: Initial Benchmarks and an Open Dataset" (ASSETS '24), evaluados sobre la partición de test de `sidewalk-tagger-ai-validated`, y a la guía `REPRODUCE_RESULTS.md` del repositorio `sidewalk-tagger-ai` para reproducirlos, pero las cifras concretas no se incluyen en la información proporcionada. No se dispone por tanto de valores de MMLU, HumanEval, GSM8K ni de métricas de clasificación como F1 o precisión media por etiqueta para este modelo.

Advertencia sobre la búsqueda web: los resultados de búsqueda disponibles no contienen ninguna referencia relevante al modelo ni al artículo. Son páginas de contenido para adultos sin relación alguna con el objeto de esta ficha, por lo que se descartan íntegramente y no se han usado como fuente.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. El repositorio ocupa 0,3 GB, lo que sitúa los pesos en el rango de unos cientos de megabytes; con activaciones para lotes pequeños de imágenes de 256 px, la inferencia debería caber holgadamente en GPU de consumo, pero se trata de una estimación, no de un dato publicado.
- GPU recomendadas: no disponible. Por el tamaño del backbone declarado, cualquier GPU con varios gigabytes de VRAM es suficiente; no tiene sentido reservar aceleradores de gama alta como A100 o H100 solo para este modelo.
- GPU de consumo: muy probablemente compatible con prácticamente cualquier GPU de consumo moderna e incluso con ejecución en CPU para volúmenes pequeños, dado el tamaño del repositorio. No confirmado por el autor.
- Opciones de despliegue: la arquitectura es personalizada y no es una clase de `transformers`, por lo que no se puede cargar directamente con `vLLM`, `TGI` u `Ollama`. La vía documentada es PyTorch con el código de `sidewalk_ai_api/tagger.py` del repositorio `sidewalk-ai-api`, que implementa la carga del state dict y el preprocesamiento. No se documenta exportación a ONNX, TorchScript ni GGUF.
- Latencia y throughput: no disponibles. La model card no publica medidas de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Clases de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `projectsidewalk/sidewalk-tagger-ai-obstacle` | Clasificación multi-etiqueta de obstáculos en aceras | DINOv2 ViT-B/14 con 4 tokens de registro | 20 posiciones (17 activas) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `facebook/dinov2-with-registers-base` | Extracción de características visuales auto-supervisada | DINOv2 ViT-B/14 con 4 tokens de registro | No aplica (backbone sin cabezal de clasificación específico) | No indicada en la información disponible | HuggingFace (modelo base del anterior) |
| Otros taggers de `projectsidewalk/sidewalk-tagger-ai-models` | Clasificación multi-etiqueta por etiqueta padre de Project Sidewalk | Misma familia DINOv2 afinada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace, repositorio con todos los modelos del artículo |

No se conocen, a partir de la información disponible, otros modelos públicos comparables especializados en etiquetado fino de accesibilidad de aceras. La comparación más significativa es con su propio backbone sin afinar (que no produce etiquetas de accesibilidad) y con los modelos hermanos del mismo repositorio, que comparten arquitectura y difieren en la etiqueta padre que clasifican.

## Limitaciones y advertencias

- Ámbito de aplicación muy restringido: el modelo solo clasifica recortes asociados a la etiqueta de obstáculo en Project Sidewalk. Aplicarlo a imágenes completas de calle, a otros dominios visuales o a otras etiquetas padre no está soportado.
- Las salidas sigmoideas no son probabilidades calibradas. Usarlas con un umbral fijo de 0,5 produciría un comportamiento distinto al previsto; los umbrales por etiqueta de `tag_thresholds.json` son parte necesaria del sistema.
- Tres de las 20 posiciones de salida (`NULL`, índices 2, 6 y 13) no son clases reales y deben ignorarse explícitamente en cualquier integración.
- Riesgo de falsos positivos y falsos negativos por etiqueta: la model card no publica métricas por clase, por lo que no es posible anticipar qué etiquetas son más fiables sin consultar el artículo o reproducir la evaluación con `REPRODUCE_RESULTS.md`.
- Sesgo de dominio: el modelo se entrena sobre recortes de imágenes de Google Street View del dataset validado del proyecto. El rendimiento fuera de esa distribución de imágenes, ciudades o países no está caracterizado.
- Desbalance de clases previsible: etiquetas como `mailbox` o `seating` aparecen con mucha menos frecuencia que `pole` o `tree`, lo que suele penalizar su sensibilidad. La model card no desglosa este aspecto.
- Sin soporte multilingüe ni de texto: no procesa idiomas, por lo que cualquier uso que requiera interacción en lenguaje natural necesita otro componente.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial y modificación. Ahora bien, las imágenes de Google Street View con las que se entrena y que se usarían en inferencia están sujetas a los términos de servicio de Google, un aspecto que la licencia del modelo no cubre.
- Sin validación comunitaria: el repositorio figura con 0 descargas y 0 likes, y las fechas de creación y actualización son del 15 de octubre de 2026. No hay evidencia pública de adopción ni de incidencias reportadas por terceros.
- Requiere código propietario del proyecto para cargarse: al no ser una arquitectura de `transformers`, ni `AutoModel` ni los servidores de inferencia habituales pueden cargarlo sin adaptación.
- En producción, el modelo debe tratarse como asistente de etiquetado y no como fuente de verdad: la propia plataforma lo usa para sugerir etiquetas que después se validan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-obstacle
- Modelo base: https://huggingface.co/facebook/dinov2-with-registers-base
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/projectsidewalk/sidewalk-tagger-ai-validated
- Repositorio con todos los modelos del artículo: https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-models
- Código de entrenamiento y evaluación: https://github.com/ProjectSidewalk/sidewalk-tagger-ai
- Guía de reproducción de resultados: https://github.com/ProjectSidewalk/sidewalk-tagger-ai/blob/main/REPRODUCE_RESULTS.md
- API de servicio del modelo: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Código de carga y preprocesamiento: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/sidewalk_ai_api/tagger.py
- Umbrales por etiqueta: https://github.com/ProjectSidewalk/sidewalk-ai-api/blob/main/tag_thresholds.json
- Plataforma Project Sidewalk: https://projectsidewalk.org
- Artículo (DOI): https://doi.org/10.1145/3663548.3688531
- Publicación en ACM (ASSETS '24): https://dl.acm.org/doi/10.1145/3663548.3688531
