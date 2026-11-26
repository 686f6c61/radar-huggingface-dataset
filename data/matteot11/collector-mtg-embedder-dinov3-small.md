# matteot11/collector-mtg-embedder-dinov3-small

## Resumen

Collector MTG Embedder DINOv3 Small es un modelo de extracción de características visuales derivado de DINOv3 ViT-S/16, ajustado por el usuario matteot11 para generar embeddings de imágenes de cartas coleccionables de Magic: The Gathering y Pokémon. Su función no es clasificar ni identificar directamente una carta concreta, sino producir vectores normalizados L2 que permitan búsquedas por similitud (nearest-neighbor) contra un catálogo local de cartas previamente indexado.

El modelo parte de `facebook/dinov3-vits16-pretrain-lvd1689m`, un ViT-S/16 con parches de 16x16 píxeles y entrada de 224x224, y se ajusta con vistas aumentadas emparejadas de imágenes de referencia de ambos juegos. Con 21,6 millones de parámetros y un repositorio de 0,3 GB, es un modelo ligero pensado para ejecutarse en CPU o GPU de consumo dentro de un pipeline de recuperación visual.

Su relevancia actual radica en el auge de herramientas de catalogación y escaneo de colecciones de cartas: un embedder especializado permite construir sistemas de búsqueda visual sobre catálogos locales sin depender de servicios de visión generalistas, que rinden peor en dominios visuales muy concretos como el arte de cartas coleccionables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 (Vision Transformer, parches 16x16) |
| Parametros totales | 21.596.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo visual; el texto en cartas no se procesa como lenguaje) |
| Licencia | other (DINOv3 License de Meta) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer pequeño (ViT-S/16) de DINOv3, con 21,6 millones de parámetros y entrada de 224x224 píxeles. El embedding se obtiene del token CLS de la última capa (`last_hidden_state[:, 0]`) y se normaliza L2 en el flujo de recuperación. El modelo base fue preentrenado por Meta con el pipeline DINOv3 sobre el dataset LVD-1689M.

El ajuste fino (versión v2) se realizó con vistas aumentadas emparejadas de imágenes de referencia de MTG y Pokémon. Los lotes de entrenamiento conjunto contienen exactamente 16 cartas de cada juego (batch size 32), y la pérdida contrastiva se calcula por separado para cada juego, de modo que los ejemplos de un juego no se usan como negativos de recuperación del otro. Los aumentos incluyen cambios de brillo, contraste y color, rotaciones pequeñas, desenfoque y distorsión de perspectiva. La configuración fue: 5 épocas, batch size 32, learning rate 1e-5, temperatura 0.07, cero workers en el data loader, semilla 42 y una división de validación del 10% por juego. El flujo completo está disponible en el repositorio Open Card Collector.

## Capacidades

- Extracción de embeddings visuales de imágenes de cartas de Magic: The Gathering y Pokémon.
- Recuperación por similitud (nearest-neighbor) contra un catálogo local de cartas indexado previamente.
- Robustez parcial a variaciones de iluminación, contraste, color, rotación leve, desenfoque y perspectiva gracias a los aumentos de entrenamiento.
- Procesamiento de imágenes RGB a 224x224 píxeles mediante `AutoProcessor`.
- Integración con Hugging Face Transformers (`AutoModel`, `AutoProcessor`).
- No realiza clasificación directa ni identificación autoritativa de impresiones de cartas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de texto.

## Casos de uso

- Catalogación de colecciones personales: el usuario fotografía sus cartas y el sistema calcula el embedding de cada imagen para buscar la carta más parecida en un catálogo local, agilizando el inventario de colecciones grandes.
- Escaneo masivo en aplicaciones móviles: al ser un modelo de 21,6 M de parámetros y 0,3 GB, puede ejecutarse en dispositivos con recursos limitados o en servidores modestos para procesar lotes de imágenes de cartas.
- Verificación de listados en marketplaces: comparar la imagen de una carta publicada con el catálogo de referencia para detectar posibles discrepancias o duplicados antes de publicar.
- Construcción de motores de búsqueda visual sobre catálogos de TCG: indexar embeddings de un catálogo completo (Scryfall, TCGdex) y ofrecer búsqueda por imagen al usuario final.
- Asistencia en la organización de torneos y tiendas: identificar rápidamente cartas sueltas en inventarios físicos mediante foto y recuperación contra el catálogo, con revisión humana del resultado.
- Investigación en recuperación visual de dominio específico: servir como base para experimentos de fine-tuning contrastivo sobre otros dominios de imágenes con estructura similar (cartas, cromos, etiquetas).
- Preprocesado en pipelines de datos: generar embeddings normalizados para clustering, deduplicación o análisis de similitud entre cartas de una misma colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (21,6 M de parámetros); en la práctica, el consumo depende del tamaño de lote y de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es tan pequeño que la GPU no es imprescindible.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (referencia oficial), con posibilidad de exportación a ONNX u otros runtimes; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matteot11/collector-mtg-embedder-dinov3-small | 21,6 M | 224x224 px | Cartas MTG y Pokémon | DINOv3 License (other) | Hugging Face |
| facebook/dinov3-vits16-pretrain-lvd1689m | no disponible | 224x224 px | Imágenes generales | DINOv3 License | Hugging Face |
| CLIP ViT-B/32 (referencia generalista) | no disponible | 224x224 px | Imagen-texto general | MIT (según versión) | Hugging Face |

La comparación concreta con otros embedders especializados en cartas coleccionables no está disponible en la información proporcionada. Frente al modelo base DINOv3, este ajuste aporta especialización en el dominio de cartas TCG a costa de perder generalidad; frente a CLIP, no ofrece alineación imagen-texto, por lo que no sirve para búsqueda por descripción textual.

## Limitaciones y advertencias

- El modelo no clasifica ni identifica de forma autoritativa una carta o impresión concreta; solo produce embeddings para recuperación por similitud.
- La calidad de recuperación puede degradarse con reflejos, desenfoque de movimiento, oclusión, baja resolución, recortes agresivos, impresiones poco comunes o catálogos de referencia que no contengan la carta objetivo.
- El resultado de la recuperación debe ser revisado por un usuario antes de tomar decisiones.
- Entrenado exclusivamente para MTG y Pokémon; no es un modelo de reconocimiento visual general.
- No procesa texto de las cartas; los idiomas no aplican como capacidad del modelo.
- Licencia DINOv3 License de Meta: el uso, modificación y redistribución deben cumplir sus términos, que pueden incluir restricciones adicionales para uso comercial.
- El repositorio no distribuye imágenes de entrenamiento, datos de catálogo ni embeddings derivados; los derechos de las imágenes pertenecen a sus titulares (Scryfall, TCGdex, Wizards of the Coast, Nintendo, The Pokémon Company).
- No hay datos publicados de benchmarks que permitan estimar la precisión de recuperación en producción.
- Riesgo de sesgo hacia las distribuciones visuales de los catálogos de referencia usados en el entrenamiento (Scryfall y TCGdex).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matteot11/collector-mtg-embedder-dinov3-small
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Repositorio del flujo de entrenamiento (Open Card Collector): https://github.com/matteot11/open-card-collector
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Scryfall (fuente de imágenes MTG): https://scryfall.com
- TCGdex (fuente de imágenes Pokémon): https://www.tcgdex.net
