# desert-ant-labs/gist

## Resumen

Gist es un clasificador de temas de contenido multilingüe desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo (on-device) sin necesidad de servidores. Su función es asignar a cualquier texto corto (títulos, posts, descripciones) una o varias etiquetas temáticas de entre una taxonomía fija de 36 categorías, con soporte para 101 idiomas. El modelo resuelve el problema del etiquetado automático de contenido con privacidad total, coste de inferencia cero y latencia mínima, lo que lo hace adecuado para aplicaciones móviles, web y de escritorio.

A diferencia de los clasificadores basados en grandes transformers, Gist emplea una arquitectura de dos flujos: un embedding estático multilingüe (Model2Vec, destilado de BAAI bge-m3) combinado con n-gramas con hash, seguido de un pequeño MLP de clasificación. No hay ningún transformer en la inferencia, lo que reduce el modelo desplegable a unos 74 MB (embedding int8 + cabezal fp16). El modelo es multi-etiqueta por diseño: la mayoría de los textos reciben dos o tres temas, y las puntuaciones pueden agregarse a nivel de colección para obtener temas de canal o de feed.

Gist se distribuye con SDKs nativos para Swift (Apple), Kotlin (Android) y JavaScript (navegador y Node), y se publica en formatos Core ML y LiteRT. La versión actual es la v2.2.0, con una licencia propia de código fuente disponible (source-available) que permite uso comercial bajo condiciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de dos flujos: embedding estático Model2Vec (261 349 tokens × 256 dims, int8) + n-gramas con hash + MLP de fusión ([1, 8448] → 36) |
| Parametros totales | no disponible (embedding ≈ 67 M de valores + cabezal ≈ 0,3 M, sin cifra oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (acepta texto corto; sin ventana de contexto tipo LLM) |
| Tipos de cuantizacion | int8 (embedding), fp16 (cabezal Core ML), float32 (cabezal LiteRT) |
| Idiomas soportados | 101 (multilingüe, cross-lingual) |
| Licencia | desert-ant-labs-source-available-1.0 (https://license.desertant.com/1.0) |
| Formato de pesos | Core ML (.mlmodelc), LiteRT (.tflite), embedding en .i8 + .json, tokenizador Unigram en .bin |

## Arquitectura y entrenamiento

Gist se compone de dos flujos de características que se fusionan en un cabezal clasificador. El flujo semántico utiliza un embedding estático multilingüe congelado (Model2Vec `potion-multilingual-128M`, destilado de BAAI `bge-m3`), podado por script y cuantizado a int8. El texto se tokeniza con un tokenizador Unigram, se agregan los vectores de los tokens mediante mean-pooling y se normaliza L2, lo que proporciona representaciones cross-linguales para 101 idiomas. El flujo léxico aplica hash a n-gramas de palabras y caracteres en un vector fijo, capturando nombres propios, marcas y términos exactos que el embedding semántico tiende a difuminar. Ambos flujos se concatenan y pasan por un pequeño MLP que produce una distribución sigmoide sobre las 36 categorías.

El entrenamiento se realizó mediante destilación: LLMs instructivos de código abierto (licencias Apache/MIT) etiquetaron el corpus de texto, y un modelo estudiante pequeño aprendió a reproducir esas etiquetas. Los objetivos multi-etiqueta permiten capturar co-ocurrencias (por ejemplo, un tutorial puede ser `technology` y `creator-economy` a la vez). El cabezal se entrenó con balanceo de clases para evitar el sesgo hacia categorías sobrerrepresentadas. Toda la lógica excepto el cabezal es código puro del lado del host, por lo que el mismo pipeline funciona idénticamente en Core ML, LiteRT y WebAssembly.

## Capacidades

- Clasificación multi-etiqueta sobre una taxonomía fija de 36 temas, con puntuaciones por categoría.
- Soporte multilingüe real para 101 idiomas, con representaciones cross-linguales (un texto en chino y su traducción al español producen resultados equivalentes).
- Ejecución 100 % on-device, sin llamadas a servidor, con coste de inferencia cero por llamada.
- Agregación de puntuaciones a nivel de colección para obtener temas de canal, feed o categorías globales.
- Mapeo de los 36 temas a taxonomías estándar: IAB Content Taxonomy 2.2 (con IDs enteros estables) y Apple Podcasts categories.
- Optimizado para texto corto: títulos, posts, descripciones de productos, comentarios, etc.
- No genera texto: es exclusivamente un clasificador, no un modelo generativo.
- Disponible para múltiples plataformas mediante SDKs nativos (Swift, Kotlin, JavaScript) y formatos Core ML y LiteRT.

## Casos de uso

- Etiquetado automático de publicaciones en redes sociales o foros: Gist puede asignar temas como `technology`, `finance` o `pets-animals` a cada post en tiempo real, permitiendo filtrar o agrupar contenido por intereses sin enviar datos a un servidor.
- Moderación de contenido en plataformas UGC: al detectar automáticamente temas sensibles (por ejemplo, `health` o `politics`) en comentarios o publicaciones, los moderadores pueden priorizar revisiones o aplicar políticas específicas por categoría.
- Recomendación de contenido basada en temas: un agregador de noticias o una app de podcasts puede usar las etiquetas de Gist para sugerir artículos o episodios similares a los que el usuario ya ha consumido, todo localmente.
- Organización de bibliotecas de documentos o artículos: aplicaciones de productividad (notas, gestores de referencias) pueden clasificar automáticamente entradas en carpetas temáticas, facilitando la búsqueda posterior.
- Clasificación de podcasts para directorios: dado que Gist mapea a las categorías de Apple Podcasts, un editor de podcasts puede etiquetar episodios y programas para su publicación en directorios estándar.
- Análisis de tendencias agregadas: en una app de análisis de redes sociales, se pueden agregar las puntuaciones de Gist a nivel de cuenta o de campaña para identificar qué temas dominan la conversación, sin depender de APIs externas.
- Filtrado de feeds en aplicaciones móviles: el usuario puede elegir "solo ver contenido de finanzas" y la app filtra localmente usando las etiquetas de Gist, preservando la privacidad.
- Segmentación publicitaria en apps: al conocer los temas de cada contenido, una app puede mostrar anuncios relevantes según la taxonomía IAB, cumpliendo con estándares de la industria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (precisión, recall, F1) sobre conjuntos de prueba estándar. Solo se muestran ejemplos cualitativos de clasificación correcta en varios idiomas.

## Requisitos de hardware

- Tamaño del modelo desplegable: 74 MB (embedding int8 de 64 MB + cabezal de 6-13 MB según formato).
- No requiere GPU dedicada: la inferencia se ejecuta en CPU en cualquier dispositivo moderno.
- Compatible con dispositivos móviles (iOS, Android), ordenadores de escritorio (Linux, Windows, macOS), navegadores (WebAssembly) y Node.js.
- VRAM estimada: no aplica (modelo on-device, sin VRAM específica; usa memoria RAM del dispositivo).
- Opciones de despliegue: SDKs nativos (Swift Package Manager, Gradle, npm), Core ML para Apple, LiteRT para Android/Linux y WebAssembly + LiteRT.js para navegador.
- Latencia y throughput: no especificados por el autor, pero al ser un modelo de ~74 MB sin transformer, se espera una latencia de milisegundos en CPU de gama media.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos equivalentes en la información proporcionada. Como referencia cualitativa, Gist se diferencia de los clasificadores de temas basados en transformers (por ejemplo, fine-tuning de BERT multilingüe o modelos zero-shot como `facebook/bart-large-mnli`) en que no requiere GPU ni servidor, es mucho más ligero (74 MB frente a cientos de MB o GB) y ofrece cobertura en 101 idiomas con un único modelo. Sin embargo, su taxonomía es fija (36 temas) y no es extensible sin reentrenamiento, mientras que los enfoques zero-shot permiten etiquetas arbitrarias. No hay benchmarks públicos que permitan una comparación numérica.

## Limitaciones y advertencias

- Modelo exclusivamente clasificador: no genera texto, resúmenes ni explicaciones.
- Taxonomía fija de 36 temas: no se pueden añadir categorías personalizadas sin reentrenar el modelo.
- Optimizado para texto corto (títulos, posts, descripciones); su rendimiento en documentos largos puede degradarse.
- Posibles sesgos en idiomas poco representados en el corpus de entrenamiento, a pesar del enfoque multilingüe.
- Riesgo de alucinación no aplica (no es generativo), pero puede producir falsos positivos o negativos en la clasificación de temas ambiguos.
- Licencia `source-available` con condiciones específicas: no es open source estándar; requiere revisar el texto completo de la licencia en https://license.desertant.com/1.0 antes de uso comercial.
- El modelo se distribuye en formatos propietarios (Core ML, LiteRT) y el SDK está acoplado al ecosistema de Desert Ant Labs; no se ofrece un checkpoint en PyTorch o safetensors para reentrenamiento directo.
- La fecha de creación (2026) y el bajo número de descargas (280) indican que es un modelo relativamente nuevo y con poca adopción pública; la documentación puede evolucionar.

## Enlaces

- Hugging Face: https://huggingface.co/desert-ant-labs/gist
- Demo interactiva: https://huggingface.co/spaces/desert-ant-labs/gist-demo
- Repositorio GitHub: https://github.com/Desert-Ant-Labs/gist
- Documentación del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/gist.md
- Página oficial del modelo: https://desertant.com/models/gist/
- Sitio de Desert Ant Labs: https://desertant.com/
- Licencia: https://license.desertant.com/1.0
