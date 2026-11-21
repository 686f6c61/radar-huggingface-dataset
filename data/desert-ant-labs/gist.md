# desert-ant-labs/gist

## Resumen

Gist es un clasificador de texto compacto desarrollado por Desert Ant Labs, orientado a la generación de temas y etiquetas para publicaciones y artículos. A diferencia de los modelos basados en transformers, Gist emplea una arquitectura de dos flujos (two-stream): un embedding estático multilingüe combinado con n-gramas con hashing, sin transformer en la fase de inferencia. El modelo despliega 74 MB en su variante multilingüe y clasifica texto en una taxonomía fija de 36 temas a través de 101 idiomas.

El modelo resuelve el problema del etiquetado temático de contenido en dispositivos, sin coste por llamada y con ejecución completamente local. Es relevante para aplicaciones móviles, de escritorio y web que necesitan categorizar contenido sin depender de servicios en la nube. Su diseño multi-etiqueta asigna de forma típica dos o tres temas por elemento, y permite agregar puntuaciones a nivel de colección (por ejemplo, temas de un canal o feed).

La versión actual de los pesos es la v2.2.0, publicada en Hugging Face bajo licencia source-available de Desert Ant Labs. El repositorio ocupa 0,1 GB e incluye artefactos para Core ML, LiteRT/TFLite y SDKs en Swift, Kotlin y JavaScript.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de dos flujos: embedding estático + n-gramas con hashing; sin transformer en inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para texto corto: títulos, posts y descripciones) |
| Tipos de cuantizacion | int8 (embedding), fp16 (cabeza en Core ML), float32 (cabeza en LiteRT) |
| Idiomas soportados | 101 |
| Licencia | desert-ant-labs-source-available |
| Formato de pesos | Core ML (`gist.mlmodelc`), LiteRT/TFLite (`gist.tflite`), embedding int8 (`gist_embedding.i8`), tokenizer Unigram (`gist_tokenizer.bin`) |

## Arquitectura y entrenamiento

Gist no utiliza un transformer en la fase de inferencia. La arquitectura consta de dos flujos combinados: un embedding estático multilingüe (int8, 64 MB) que actúa como extractor de características semánticas, y una representación de n-gramas con hashing. Las características fusionadas se proyectan a un vector de 8448 dimensiones (`features [1, 8448]`) y una cabeza clasificadora pequeña genera las probabilidades de los 36 temas (`topic_probs [1, 36]`). La cabeza se distribuye en dos formatos: Core ML (6 MB, fp16) para plataformas Apple y LiteRT/TFLite (13 MB, float32) para Android, Linux, Windows, Node y navegador.

El tokenizador es de tipo Unigram (4 MB) y cubre los 101 idiomas soportados. El modelo incluye un umbral ajustado en `gist_config.json` y está calibrado para etiquetar cada elemento con dos o tres temas. La taxonomía de 36 temas se distribuye en `taxonomy.json` (8 KB) con slug, nombre, descripción y mapeo a IAB Content Taxonomy 2.2 y a las categorías de Apple Podcasts. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de texto en 36 temas fijos, con puntuación de probabilidad por tema.
- Soporte de 101 idiomas, incluyendo textos en español, chino e inglés entre otros.
- Agregación de temas a nivel de colección mediante la función `channelTopics` (temas de canal o feed con share y postCount).
- Decaimiento por recencia opcional en la agregación (requiere `halfLifeDays` y `nowMillis`).
- Ajuste de resultados mediante `topK` (por defecto 3) y `threshold` (umbral ajustado del modelo).
- Ejecución completamente en dispositivo, sin coste por llamada ni dependencia de red.
- SDKs nativos en Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android) y JavaScript (navegador y Node).
- Variante inglesa reducida de 15 MB para texto en inglés y escritura latina (solo seleccionable desde el SDK de Swift).
- Mapeo de salida a taxonomías estándar (IAB Content Taxonomy 2.2 y Apple Podcasts).

## Casos de uso

- Etiquetado automático de publicaciones en aplicaciones móviles: el modelo se integra mediante el SDK de Swift o Kotlin y clasifica títulos y descripciones localmente, sin enviar contenido a servidores externos y con cero coste por inferencia.
- Organización de feeds y canales: usando `channelTopics`, se pueden agregar los temas de cada post para determinar los temas dominantes de un canal, con soporte opcional de decaimiento por recencia para priorizar contenido reciente.
- Moderación y enrutamiento de contenido en plataformas multilingües: la cobertura de 101 idiomas permite clasificar contenido entrante en un único paso y dirigirlo al equipo o sección correspondiente.
- Indexación y búsqueda temática: las etiquetas generadas alimentan índices de búsqueda o sistemas de recomendación, aprovechando el mapeo a IAB Content Taxonomy 2.2 para interoperar con sistemas publicitarios existentes.
- Categorización de podcasts: el mapeo directo a categorías de Apple Podcasts permite asignar temas a episodios y programas de forma automática a partir del título y la descripción.
- Procesamiento por lotes en servidor Node: la variante nativa para Node permite clasificar grandes volúmenes de artículos en pipelines de backend sin coste de API, con el mismo modelo que se ejecuta en el cliente.
- Aplicaciones de escritorio y web: el paquete JavaScript con LiteRT permite clasificar contenido en el navegador o en Electron, manteniendo el texto del usuario en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está diseñado para ejecución en CPU y en dispositivos móviles. El tamaño de despliegue es de 74 MB en la variante multilingüe y 15 MB en la variante inglesa.
- GPU recomendadas: no se requieren GPU; el modelo se ejecuta en CPU en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Compatibilidad con GPU de consumo: no aplica; no se documenta uso de GPU.
- Opciones de despliegue: Core ML (plataformas Apple), LiteRT/TFLite (Android, Linux, Windows, Node, web), SDKs oficiales en Swift, Kotlin y JavaScript (`@desert-ant-labs/gist`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| Gist (desert-ant-labs) | Clasificador de dos flujos, sin transformer | no disponible (74 MB desplegable) | no disponible (texto corto) | 101 | source-available | En dispositivo |
| Modelos de clasificación basados en transformers (p. ej. BERT multilingüe) | Transformer encoder | Cientos de millones | 512 tokens típico | Variable | Variable | Servidor o dispositivo con más recursos |
| APIs de clasificación en la nube | Servicio propietario | no disponible | Variable | Variable | Propietaria | Nube |

La comparativa con alternativas concretas no está disponible en la información proporcionada. Gist se diferencia por su tamaño reducido, la ausencia de transformer en inferencia y la ejecución local en dispositivos móviles, a costa de una taxonomía fija de 36 temas y una orientación a texto corto.

## Limitaciones y advertencias

- La taxonomía está fija en 36 temas; no es posible clasificar en categorías personalizadas sin reentrenar o mapear externamente.
- El modelo está optimizado para texto corto (títulos, posts y descripciones); el rendimiento en documentos largos no está documentado.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o de baja confianza en textos ambiguos o muy cortos.
- La licencia es source-available de Desert Ant Labs, no open source; es necesario revisar los términos en https://license.desertant.com/ antes de un uso comercial.
- La variante inglesa de 15 MB solo es seleccionable desde el SDK de Swift; en otras plataformas se debe usar la variante multilingüe de 74 MB.
- La agregación `channelTopics` es una función pura sin modelo; el decaimiento por recencia permanece desactivado salvo que se pasen `halfLifeDays` y `nowMillis`.
- No se han publicado latencias ni throughput, por lo que el rendimiento en producción debe medirse en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/gist
- Pesos v2.2.0: https://huggingface.co/desert-ant-labs/gist/tree/v2.2.0
- Demo en vivo (Space): https://huggingface.co/spaces/desert-ant-labs/gist-demo
- Demo del producto: https://desertant.com/models/gist/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
