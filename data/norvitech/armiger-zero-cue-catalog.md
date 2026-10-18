# NorviTech/armiger-zero-cue-catalog

## Resumen

`NorviTech/armiger-zero-cue-catalog` es el tercer plugin de la suite modular Armiger, desarrollada por NorviTech. No es un modelo neuronal con pesos entrenados, sino un artefacto determinista de resolución de entidades: un catálogo offline de 926.785 claves normalizadas (472.038 pares título-año, 257.008 raíces de títulos de anime y 197.739 títulos largos no ambiguos) más un conjunto de reglas estructurales. Su función es resolver torrents con título desnudo, es decir, aquellos que no contienen ninguna pista estructural de temporada o episodio en el nombre ni en el árbol de ficheros, un caso que la propia documentación cifra entre el 2% y el 4% del indexado real en BitTorrent y DHT.

El problema que ataca es concreto: un fichero como `The Riddle (2007) [1080p] [WEB-DL].mkv` puede ser una película autónoma o un especial de televisión de un solo fichero, y un pack de seis `.mkv` de una colección de películas es indistinguible por conteo de ficheros de una miniserie de seis episodios. El plugin combina búsqueda en tabla hash O(1) sobre el catálogo con guardas estructurales para packs multipelícula, visual novels, ROMs de consola y cursos educativos.

Se distribuye de forma independiente y también preempaquetado dentro de `NorviTech/armiger-ultra`. Según las mediciones del autor, eleva la precisión Movie-vs-TV al 99,46% y la precisión de 11 clases al 98,48% en la cohorte Gold Standard. La licencia es Apache-2.0 y el repositorio ocupa 0,1 GB, con un footprint declarado de 26,8 MB para el par de ficheros que lo componen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como red neuronal: plugin determinista (búsqueda en tabla hash O(1) sobre catálogo normalizado + reglas estructurales) |
| Parametros totales | No disponible (no contiene pesos neuronales; el artefacto es un catálogo JSON más código Python) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar; el catálogo se distribuye como JSON) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el catálogo incluye raíces de títulos japoneses y una cohorte de evaluación multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica. Artefactos: `zero_cue_plugin.py` y `validated_zero_cue_catalog.json` |
| Pipeline declarado en HuggingFace | text-classification |
| Bibliotecas declaradas | generic |
| Claves del catálogo | 926.785 en total: 472.038 pares (título, año), 257.008 raíces de anime, 197.739 títulos largos no ambiguos |
| Fuentes del catálogo | TMDB, TVDB, AniDB y Manami (según la model card) |
| Footprint declarado | 26,8 MB (frente a 0,1 GB del repositorio completo) |
| Autor | NorviTech |
| Fecha de publicacion | 18 de octubre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La pieza central es una tabla hash offline con 926.785 claves normalizadas que se consulta en tiempo O(1). Las claves provienen de cuatro fuentes de metadatos (TMDB, TVDB, AniDB y Manami) y se agrupan en tres familias: pares (título, año) para desambiguar estrenos homónimos, raíces de títulos de anime para resolver emisiones sin numeración de episodio y títulos largos no ambiguos que identifican una obra por sí solos. Sobre esa consulta se superponen guardas estructurales deterministas que cubren casos donde el catálogo por sí solo no basta: packs multipelícula, visual novels, ROMs de consola y cursos educativos.

No hay entrenamiento neuronal, ni dataset de tokens, ni fases de RLHF o DPO asociadas a este repositorio. El plugin se acopla a la cabeza de clasificación de la red neuronal de Armiger: recibe las probabilidades por clase (`probs_category`), la probabilidad de contenido adulto (`p_adult`) y la de anime (`p_anime`), y devuelve una categoría corregida junto con la fuente de resolución. En el ejemplo de la model card, un vector con 0,51 de probabilidad para la clase 1 se sobrescribe a la clase 0 (`movie`) con `resolution_source: zero_cue_title_year`. La innovación, por tanto, es de ingeniería de sistemas: sustituir la inferencia especulativa por consulta determinista cuando el título carece de pistas.

## Capacidades

- Clasificación de torrents con título desnudo en 11 clases, con resolución Movie-vs-TV del 99,46% en la cohorte Gold Standard.
- Resolución de entidades por par (título, año) sobre 472.038 pares normalizados.
- Reconocimiento de raíces de títulos de anime (257.008) para distinguir película teatral, OVA y serie sin número de episodio.
- Guardas estructurales para packs multipelícula, visual novels, ROMs de consola y cursos educativos.
- Consulta offline: no requiere conexión a TMDB, TVDB, AniDB ni Manami en tiempo de inferencia.
- Integración con las cabezas neuronales de Armiger: consume `probs_category`, `p_adult` y `p_anime` y devuelve `category_index`, `category` y `resolution_source`.
- Capacidad de corrección sobre el backbone: aporta entre +0,4 y +4,4 puntos porcentuales según cohorte respecto a Armiger Ultra sin el plugin.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de visión o audio; su alcance es exclusivamente la desambiguación de categoría.

## Casos de uso

- Indexación de torrents en redes BitTorrent y DHT: aplicar el plugin como paso de post-procesado sobre la salida del clasificador para los torrents sin pistas de temporada o episodio, que representan entre el 2% y el 4% del total, evitando que caigan en la clase genérica o en una categoría errónea.
- Integración con Sonarr y Radarr: usar la categoría corregida para enrutar automáticamente un release a la biblioteca de series o de películas, reduciendo las importaciones manuales de títulos como `The Riddle (2007) [1080p] [WEB-DL].mkv`.
- Gestión de bibliotecas de anime: distinguir películas teatrales de OVA y series sin numeración mediante las 257.008 raíces de título, un caso habitual en releases de subgroups con formato `[SubGroup] Título [1080p].mkv`.
- Desambiguación de packs multipelícula: detectar que seis ficheros `.mkv` de `Director Name - Movies 1-6 Collection (1979-1998) 1080p` forman una colección de películas y no una miniserie de seis episodios, aplicando la guarda estructural correspondiente.
- Filtrado previo a un LLM: resolver de forma determinista los casos cubiertos por el catálogo antes de recurrir a un modelo de lenguaje en la nube, lo que evita el coste de inferencia en la fracción mayoritaria de títulos y reserva el LLM para los casos realmente ambiguos.
- Catalogación de contenido no cinematográfico: clasificar visual novels, ROMs de consola y cursos educativos, que comparten estructura de nombre con releases de vídeo pero requieren categorías distintas.
- Auditoría de pipelines existentes: ejecutar el plugin en modo standalone (sin Armiger Ultra) sobre un conjunto etiquetado para medir la mejora marginal antes de adoptarlo en producción; el autor reporta 97,92% de precisión en Gold Standard con esta configuración.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (precisión por cohorte de evaluación):

| Cohorte | Solo backbone neuronal (Armiger Ultra) | + guardas estructurales | + armiger-zero-cue-catalog (Armiger Ultra) | + armiger-zero-cue-catalog (Armiger 8,3 MB) |
|---|---|---|---|---|
| Gold Standard (N=2.835) | 97,45% | 97,81% | 98,48% (99,46% Movie-vs-TV) | 97,92% (99,15% Movie-vs-TV) |
| Fresh Torrents (N=1.354) | 95,79% | 95,94% | 96,60% | 96,38% |
| Hard Edge-Cases (N=1.025) | 95,71% | 96,10% | 97,17% | 96,20% |
| Validation Holdout (N=2.237) | 96,92% | 97,05% | 97,32% | 96,51% |
| Specialist Torrents (N=1.837) | 93,85% | 94,18% | 98,26% | 97,82% |
| Multilingual Torrents (N=2.828) | 95,44% | 95,69% | 98,02% | 97,81% |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible; las cifras anteriores son autoevaluaciones del autor sobre cohortes propias y no comparables con benchmarks de propósito general.

## Requisitos de hardware

- VRAM: no aplica; el plugin no ejecuta operaciones en GPU. No se publica consumo de RAM, aunque el footprint del artefacto es de 26,8 MB (catálogo JSON más código Python) y la estructura en memoria es una tabla hash de 926.785 claves.
- GPU recomendadas: ninguna. La consulta es O(1) sobre tabla hash y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: irrelevante para este componente; la GPU solo sería necesaria para el backbone neuronal de Armiger o Armiger Ultra al que acompaña.
- Opciones de despliegue: importación directa como módulo Python (`from zero_cue_plugin import ZeroCueCatalogPlugin`), integración en el pipeline de Armiger Ultra o ejecución standalone. No aplica despliegue mediante vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo de pesos.
- Latencia y throughput: no disponibles en la información proporcionada. La model card únicamente caracteriza la consulta como O(1).

## Comparativa con modelos similares

| Componente | Naturaleza | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| armiger-zero-cue-catalog | Plugin determinista + catálogo | No aplica | No aplica | 98,48% Gold Standard (11 clases), 99,46% Movie-vs-TV | Apache-2.0 | Repositorio independiente y bundle en Armiger Ultra |
| Armiger Ultra (backbone, sin plugin) | Red neuronal de clasificación | No disponible | No disponible | 97,45% Gold Standard (11 clases) | No disponible | HuggingFace (`NorviTech/armiger-ultra`) |
| Armiger 8,3 MB (variante ligera + plugin) | Red neuronal ligera + catálogo | No disponible | No disponible | 97,92% Gold Standard (11 clases) | No disponible | Incluido en la comparativa de la model card |
| LLM en la nube de 70B+ parámetros | Modelo generativo | 70B+ (genérico) | No disponible | El autor señala que "debe adivinar" sin catálogo | No disponible | Servicio externo |

No se dispone de datos publicados para comparar este plugin con alternativas de resolución de entidades de terceros (por ejemplo, reglas heurísticas de Sonarr/Radarr o parsers de nombres de release); esa comparación figura como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de la clasificación de categorías de releases es ajeno a su diseño.
- Cobertura dependiente del catálogo: los 926.785 registros provienen de TMDB, TVDB, AniDB y Manami. Títulos ausentes de esas fuentes, estrenos muy recientes u obras regionales sin presencia en dichas bases quedan fuera de la resolución determinista.
- El residuo zero-cue sigue existiendo: la propia documentación reconoce que entre el 2% y el 4% de los torrents no tienen pistas estructurales, y el plugin no elimina esa franja, solo la resuelve cuando hay coincidencia en catálogo.
- Idiomas no declarados: la model card no especifica una lista de idiomas soportados; la evidencia se limita a una cohorte multilingüe de 2.828 muestras con 98,02% de precisión, sin desglose por idioma.
- Riesgo de falso positivo por colisión de títulos: la desambiguación por título normalizado puede errar cuando dos obras comparten título y año o cuando el título desnudo coincide con el de una obra distinta; el propio diseño recurre a la guarda estructural precisamente para mitigarlo.
- Cifras autoevaluadas: todas las métricas proceden de cohortes definidas por el autor, sin validación independiente ni comparación contra referencias externas.
- Adopción no contrastada: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, con fecha de publicación de octubre de 2026.
- Discrepancia de tamaño: la model card declara un footprint de 26,8 MB, mientras que el repositorio de HuggingFace ocupa 0,1 GB; conviene verificar el contenido real antes de integrarlo.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar el aviso de copyright y la licencia, y de indicar cambios. No se especifican restricciones adicionales.
- Dependencia de un backbone: en modo acoplado espera recibir `probs_category` de 11 clases, `p_adult` y `p_anime` con el formato exacto documentado; un cambio de dimensionalidad o de orden de clases en el clasificador invalida la corrección.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NorviTech/armiger-zero-cue-catalog
- Armiger Ultra (bundle que lo incluye): https://huggingface.co/NorviTech/armiger-ultra
- Armiger (variante CPU): https://huggingface.co/NorviTech/armiger
- Plugin swarm survival: https://huggingface.co/NorviTech/armiger-swarm-survival
- Plugin swarm priors: https://huggingface.co/NorviTech/armiger-swarm-priors
- Plugin audio guard: https://huggingface.co/NorviTech/armiger-audio-guard
- Plugin calibration DHT: https://huggingface.co/NorviTech/armiger-calibration-dht
- Sitio del autor: https://norvitech.com
