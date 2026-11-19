# mradermacher/jasmine-yomi-2b-GGUF

## Resumen

jasmine-yomi-2b-GGUF es la version cuantizada en formato GGUF del modelo pakutoma/jasmine-yomi-2b, un modelo especializado en la conversion de texto japones a lectura (grapheme-to-phoneme, G2P), es decir, en asignar la lectura correcta a los kanji y generar furigana. La cuantizacion la ha realizado mradermacher, un autor habitual de conversiones GGUF para la comunidad, y se distribuye bajo licencia Apache 2.0. El modelo base tiene 2.390.384.448 parametros (aproximadamente 2,4 mil millones) y esta etiquetado como derivado de la familia Qwen3.5, segun los tags de la model card.

El problema que resuelve es concreto y bien delimitado: la lectura de kanji en japones es ambigua (un mismo caracter puede tener varias lecturas segun el contexto y la palabra), y los sistemas genericos de sintesis de voz o de procesamiento de texto japones necesitan resolverla con precision. Este modelo se plantea como un componente especializado para esa tarea, no como un modelo conversacional general.

Esta ficha describe tanto el modelo base como la version GGUF. La informacion disponible es limitada: la model card del repositorio cuantizado es fundamentalmente una plantilla de mradermacher con la tabla de cuantizaciones, y no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de evaluacion, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5 en los tags; detalles no publicados) |
| Parametros totales | 2.390.384.448 (~2,4 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los tags del repositorio lo asocian a la familia qwen3_5, lo que sugiere una arquitectura transformer decoder-only derivada de esa linea, pero no se confirma en la documentacion disponible. El modelo esta especializado en japones y en la tarea de lectura de kanji (yomi), con etiquetas que indican g2p, kanji-reading y furigana.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio GGUF no aporta informacion sobre innovaciones tecnicas. La cuantizacion es estatica (static quants), sin versiones ponderadas/imatrix disponibles en el momento de la publicacion, segun indica el propio autor de la conversion.

## Capacidades

- Conversion de texto japones a lectura (grapheme-to-phoneme): asignacion de lectura a kanji en contexto.
- Generacion de furigana para texto japones.
- Resolucion de lecturas ambiguas de kanji (yomi) segun la palabra y el contexto.
- Modelo monolingue: solo japones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No se documenta un modo de pensamiento (thinking mode) ni capacidades conversacionales generales.

## Casos de uso

- Preprocesado para sintesis de voz (TTS) en japones: el modelo puede resolver la lectura de kanji antes de enviar el texto a un motor TTS, evitando pronunciaciones incorrectas en nombres propios y terminos poco frecuentes.
- Anotacion de furigana en textos educativos o materiales para estudiantes de japones: se puede procesar un texto y generar la lectura sobre cada kanji para su publicacion en libros de texto o aplicaciones de aprendizaje.
- Indexacion y busqueda fonetica: convertir documentos japoneses a su lectura permite construir indices de busqueda por sonido o por kana, util en sistemas de recuperacion de informacion.
- Normalizacion de texto para pipelines de NLP: en tareas de analisis morfologico o de traduccion automatica, la lectura correcta de kanji mejora la calidad de etapas posteriores.
- Aplicaciones de lectura asistida: integracion en lectores de pantalla o extensiones de navegador que muestran furigana automaticamente al usuario.
- Procesamiento de nombres propios y entidades: la lectura de nombres japoneses es especialmente ambigua; un modelo especializado puede reducir errores en bases de datos de clientes o registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~1,2 GB; Q3_K_S ~1,3 GB; Q4_K_M ~1,7 GB; Q6_K ~2,1 GB; Q8_0 ~2,7 GB; f16 ~4,9 GB (tamanos de fichero indicados por el autor; el consumo real en memoria anade overhead del runtime).
- Cabe con holgura en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y superiores; las versiones Q8_0 y f16 requieren 4-6 GB.
- GPU recomendadas: no se especifican; para un modelo de 2,4 mil millones de parametros, una RTX 3060, RTX 4060 o superiores son suficientes. Para despliegues en servidor, A100 o H100 no son necesarias salvo por requisitos de concurrencia.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El modelo base esta en formato transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especializados en G2P japones en la documentacion proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo monolingue: solo soporta japones; no debe usarse para otras lenguas.
- Especializado en una unica tarea (lectura de kanji/G2P); no es un modelo conversacional ni de proposito general.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez; se desconoce su comportamiento en dominios especializados (medicina, derecho, nombres extranjeros).
- La model card del repositorio GGUF no documenta el proceso de entrenamiento del modelo base, lo que dificulta evaluar riesgos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base pakutoma/jasmine-yomi-2b, ya que la cuantizacion hereda sus obligaciones.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad en una tarea sensible al contexto como la lectura de kanji; se recomienda Q4_K_M o superior para produccion.
- No hay versiones ponderadas/imatrix disponibles en el momento de la publicacion, segun el autor de la conversion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jasmine-yomi-2b-GGUF
- Modelo base: https://huggingface.co/pakutoma/jasmine-yomi-2b
- Pagina de descargas del autor: https://hf.tst.eu/model#jasmine-yomi-2b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
