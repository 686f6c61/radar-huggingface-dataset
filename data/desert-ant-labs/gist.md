# desert-ant-labs/gist

## Resumen

Gist es un clasificador de texto compacto desarrollado por Desert Ant Labs, disenado especificamente para la generacion de temas y etiquetas (topic tagging) en publicaciones y articulos. A diferencia de los modelos basados en transformers, Gist emplea una arquitectura de dos flujos (two-stream) que combina un embedding estatico multilingue con n-gramas hasheados, eliminando por completo la necesidad de un transformer en inferencia. El modelo resultante ocupa 74 MB en su variante multilingue y esta optimizado para ejecucion en dispositivo (on-device) con coste por llamada nulo.

El modelo resuelve un problema concreto: la clasificacion multi-etiqueta de contenido textual dentro de una taxonomia fija de 36 topicos, con soporte para 101 idiomas. Es relevante en el contexto actual de despliegue en el borde (edge computing) porque demuestra que tareas de clasificacion semantica pueden realizarse sin infraestructura de servidor, con latencia minima y sin dependencia de APIs externas. La version actual de los pesos es v2.2.0.

Gist esta disponible para iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node, a traves de SDKs en Swift, Kotlin y JavaScript. Su diseno multi-etiqueta refleja el hecho de que la mayoria de los contenidos abordan dos o tres temas simultaneamente, y permite agregar las puntuaciones por item a nivel de coleccion (por ejemplo, para obtener los topicos dominantes de un canal o feed).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de dos flujos: embedding estatico + n-gramas hasheados, sin transformer en inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para texto corto: titulos y descripciones) |
| Tipos de cuantizacion | int8 (embedding), fp16 (cabeza en Core ML), float32 (cabeza en LiteRT) |
| Idiomas soportados | 101 |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML (.mlmodelc), LiteRT (.tflite), embedding int8 (.i8), tokenizer Unigram (.bin), JSON de configuracion |

## Arquitectura y entrenamiento

Gist no utiliza una arquitectura transformer en inferencia. En su lugar, emplea un diseno de dos flujos: un embedding estatico multilingue de 64 MB en int8 actua como extractor de caracteristicas semanticas, y una cabeza clasificadora ligera (6 MB en Core ML, 13 MB en LiteRT) transforma las caracteristicas fusionadas en 36 probabilidades de topicos. La entrada al clasificador es un vector de caracteristicas de dimension [1, 8448], y la salida es [1, 36]. El tokenizer es de tipo Unigram, multilingue, de 4 MB.

El modelo esta disenado para texto corto (titulos, publicaciones, descripciones) y produce clasificacion multi-etiqueta con un umbral ajustado que tipicamente asigna dos o tres topicos por item. La taxonomia de 36 topicos esta mapeada a dos estandares de la industria: IAB Content Taxonomy 2.2 (con IDs enteros estables por nodo) y las categorias de Apple Podcasts, lo que facilita la integracion en sistemas existentes. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de texto multi-etiqueta en 36 topicos fijos, con puntuaciones de probabilidad por topico.
- Soporte multilingue para 101 idiomas, incluyendo ejemplos verificados en espanol, chino, ingles y otros.
- Agregacion de topicos a nivel de coleccion mediante la funcion `channelTopics`, que combina las puntuaciones de multiples publicaciones para obtener los temas dominantes de un canal o feed.
- Decaimiento por recencia opcional en la agregacion (parametros `halfLifeDays` y `nowMillis`).
- Ejecucion completamente on-device con coste por llamada nulo.
- Seleccion de variante: build en ingles de 15 MB (solo Swift SDK) frente a build multilingue de 74 MB.
- Integracion mediante SDKs en Swift, Kotlin y JavaScript (navegador y Node).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes. Es exclusivamente un clasificador.

## Casos de uso

- Etiquetado automatico de articulos en un CMS: el modelo clasifica titulos y descripciones en los 36 topicos para asignar etiquetas y categorias sin intervencion manual, con latencia minima al ejecutarse en el propio dispositivo del editor o en el servidor.
- Organizacion de feeds y canales de contenido: usando `channelTopics`, se pueden agregar las puntuaciones de todas las publicaciones de un canal para determinar sus temas dominantes y construir sistemas de recomendacion o navegacion por topicos.
- Moderacion y enrutamiento de contenido en aplicaciones moviles: al ejecutarse on-device en iOS y Android, permite clasificar contenido generado por el usuario antes de enviarlo a un servidor, reduciendo costes de infraestructura y mejorando la privacidad.
- Indexacion de podcasts: la taxonomia mapeada a categorias de Apple Podcasts permite clasificar episodios y programas automaticamente para su inclusion en directorios y motores de busqueda.
- Filtrado y personalizacion en aplicaciones de noticias: el modelo puede clasificar articulos en el dispositivo del usuario para personalizar la seleccion de contenidos sin enviar datos a servidores externos.
- Analisis de tendencias en redes sociales: la clasificacion multilingue permite procesar publicaciones en 101 idiomas y agregar los topicos resultantes para detectar tendencias por region o comunidad.
- Enriquecimiento de metadatos en pipelines de datos: integrado en flujos de procesamiento batch o streaming mediante el SDK de Node, permite anadir etiquetas tematicas a grandes volumenes de documentos de forma economica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para ejecucion on-device y no requiere GPU dedicada. El build multilingue ocupa 74 MB en disco (64 MB de embedding int8 + 6 MB de cabeza Core ML o 13 MB de cabeza LiteRT + 4 MB de tokenizer).
- El build en ingles ocupa 15 MB y esta disponible unicamente a traves del SDK de Swift.
- Plataformas soportadas: iOS, macOS, tvOS, visionOS (Core ML); Android, Linux, Windows, Node y navegador (LiteRT).
- No se especifican requisitos minimos de RAM ni de VRAM en la informacion disponible.
- Opciones de despliegue: SDKs oficiales de Desert Ant Labs para Swift (Swift Package Manager), Kotlin (Maven con BOM `ai.desertant:bom:6.0.0`) y JavaScript (`@desert-ant-labs/gist` con `@litertjs/core` para navegador, o build nativo precompilado para Node).
- No se dispone de datos de latencia o throughput en la informacion proporcionada, aunque el autor indica "zero per-call cost" y ejecucion completamente local.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Gist se posiciona en una categoria especifica (clasificacion de topicos on-device sin transformer) para la que no se han facilitado alternativas directas. Los clasificadores transformer multilingues convencionales, como XLM-RoBERTa, operan con arquitecturas y requisitos de recursos sustancialmente distintos, pero no se han incluido datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- La licencia es `desert-ant-labs-source-available`, no open source. Es necesario revisar los terminos en https://license.desertant.com/ antes de cualquier uso comercial o redistribucion.
- El modelo solo realiza clasificacion dentro de una taxonomia fija de 36 topicos; no puede generar texto, responder preguntas ni realizar tareas fuera de esa taxonomia.
- Esta optimizado para texto corto (titulos y descripciones); su rendimiento en documentos largos no esta documentado.
- No se han publicado datos sobre sesgos, tasas de alucinacion (aunque al ser un clasificador, el riesgo se manifiesta como falsos positivos o asignaciones erroneas de topicos) ni evaluaciones de equidad entre idiomas.
- El soporte de 101 idiomas no implica calidad uniforme; no se proporcionan metricas por idioma.
- La seleccion del build en ingles (15 MB) solo esta disponible en el SDK de Swift; en otras plataformas debe usarse el build multilingue de 74 MB.
- No se especifican requisitos minimos de memoria ni latencias, lo que dificulta la planificacion de capacidad en produccion.
- El modelo se actualiza periodicamente (version actual v2.2.0); es recomendable fijar la version de los pesos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/gist
- Pesos v2.2.0: https://huggingface.co/desert-ant-labs/gist/tree/v2.2.0
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/desert-ant-labs/gist-demo
- Demo en el sitio del autor: https://desertant.com/models/gist/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
