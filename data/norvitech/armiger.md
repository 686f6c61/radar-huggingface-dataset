# NorviTech/armiger

## Resumen

Armiger es un clasificador de metadatos de BitTorrent y DHT desarrollado por NorviTech, distribuido como modelo ONNX cuantizado a INT8 y pensado para inferencia en CPU. No es un modelo generativo de propósito general, sino un clasificador de texto especializado que recibe metadatos de torrents (nombre, lista de ficheros, tamanos) y devuelve predicciones estructuradas por cabezas de clasificacion (categoria, flags de politica, estimaciones de swarm, entre otras). Su relevancia radica en que resuelve una tarea muy concreta —clasificar y filtrar metadata de la red BitTorrent— con un modelo de apenas 7 MiB que no requiere GPU.

La arquitectura es una construccion propia del autor ("clean-sheet tri-encoder", version v3.17.0) que combina un vocabulario SentencePiece Unigram de 32K subpalabras, un codificador convolucional sobre bytes (Byte ConvNeXt), un agregador de conjuntos de ficheros (File-Set PMA) y un codificador de audio aislado para la cabeza `P(x)`. El modelo se ha entrenado con cuantizacion consciente del entrenamiento (QAT) para INT8.

El modelo esta publicado bajo licencia Apache-2.0, soporta nueve idiomas declarados (en, ja, fr, de, es, it, ru, ko, zh) y se integra mediante el paquete Python `armiger` y ONNX Runtime. La variante "Ultra" anade componentes adicionales de matching contra autoridades externas, meta-stackers GBDT en ONNX puro y cribado de basura segun "Policy-2".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-encoder propio (v3.17.0): SentencePiece Unigram 32K + Byte ConvNeXt + File-Set PMA + codificador de audio aislado `P(x)` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (QAT); pesos FP32 en el repo `armiger-ultra` |
| Idiomas soportados | en, ja, fr, de, es, it, ru, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`armiger.int8.onnx`, 7.371.593 bytes / 7,0 MiB) |

## Arquitectura y entrenamiento

Armiger no es un transformer decoder ni un modelo de lenguaje: es un clasificador multi-cabeza con una arquitectura "clean-sheet" disenada especificamente para metadata de torrents. La entrada se procesa por tres vias paralelas: un tokenizador SentencePiece Unigram de 32K subpalabras sobre el texto del nombre y rutas, un codificador convolucional que opera directamente sobre bytes (Byte ConvNeXt) para capturar patrones que el tokenizador pierde, y un agregador de tipo PMA (Pooling by Multihead Attention) que resume el conjunto de ficheros de cada torrent. Una cuarta rama aislada, `P(x)`, se encarga de la prediccion relacionada con audio. La salida se organiza en cabezas independientes (`heads`), entre ellas `category`, flags de politica (junk, adulto, honeypot) y estimaciones de swarm.

El modelo se distribuye con cuantizacion INT8 obtenida mediante QAT, lo que permite ejecutarlo en CPU con ONNX Runtime. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; esos datos no estan disponibles. La variante "Ultra" (repo `armiger-ultra`) incorpora FP32, matching contra autoridades externas, meta-stackers GBDT implementados en ONNX puro, cribado "Policy-2" y estimaciones de swarm.

## Capacidades

- Clasificacion de metadatos de torrents por categoria a partir del nombre y la lista de ficheros.
- Deteccion de flags de politica: contenido basura (junk), contenido adulto y honeypots.
- Prediccion de atributos relacionados con audio/subtitulos mediante la cabeza aislada `P(x)`.
- Estimacion de swarm (variante Ultra).
- Matching contra autoridades externas (variante Ultra).
- Soporte multilingue en nueve idiomas declarados.
- Inferencia en CPU sin GPU mediante ONNX Runtime.
- Salida estructurada por cabezas (`result["heads"][...]`), apta para consumo programatico.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un LLM.

## Casos de uso

- Indexacion de torrents: el modelo clasifica cada entrada de metadata por categoria antes de almacenarla, permitiendo organizar y filtrar catalogos de forma automatica con un coste de CPU minimo.
- Cribado de contenido basura: el flag de junk permite descartar entradas de baja calidad o spam en pipelines de ingesta masiva de DHT.
- Moderacion de contenido adulto: la cabeza de adulto permite marcar o excluir entradas en buscadores de torrents y front-ends de indexadores.
- Deteccion de honeypots: el flag correspondiente ayuda a identificar entradas sospechosas en redes DHT antes de exponerlas a usuarios.
- Enriquecimiento de metadatos en sistemas de recomendacion: la categoria predicha puede alimentar motores de recomendacion o filtros de busqueda sin necesidad de inspeccionar el contenido real.
- Procesamiento en entornos sin GPU: al ser un modelo ONNX INT8 de 7 MiB, puede desplegarse en servidores modestos, contenedores ligeros o nodos edge que solo dispongan de CPU.
- Clasificacion multilingue de nombres de fichero: los nueve idiomas soportados permiten clasificar metadata en catalogo internacional sin preprocesado especifico por idioma.

## Benchmarks y rendimiento

La model card incluye graficos de comparacion de benchmarks y suites (imagenes `chart1_v317_benchmark_and_suites_comparison.png` y `chart4_v317_production_memory_and_live_cutover.png`), pero no se proporcionan cifras numericas en el texto disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU con ONNX Runtime y no requiere GPU.
- Tamano en disco: 7,0 MiB para `armiger.int8.onnx`; el repo completo ocupa 0,2 GB.
- GPU recomendadas: no aplica (no se requiere GPU).
- Cabe en cualquier consumer GPU o CPU: si, dado su tamano reducido; puede ejecutarse en portatiles y dispositivos de bajos recursos.
- Opciones de despliegue: ONNX Runtime con el paquete Python `armiger` (`ArmigerStandaloneONNX`), descarga via `python -m armiger download --variant cpu`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de metadata de BitTorrent/DHT en ONNX INT8).

## Limitaciones y advertencias

- El modelo clasifica unicamente metadata suministrada; no inspecciona el contenido real de los ficheros ni certifica la legalidad del contenido, segun advierte el propio autor.
- Las salidas de audio/subtitulo, junk, adulto y honeypot son predicciones o flags de politica, no hechos verificados.
- Riesgo de alucinacion y falsos positivos/negativos inherente a cualquier clasificador; no se documentan tasas de error en la informacion disponible.
- No se detalla la longitud de contexto ni el comportamiento con nombres de fichero extremadamente largos.
- Los sesgos conocidos no estan documentados en la model card.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del paquete `armiger` y de los componentes Ultra por separado.
- El repositorio principal es la variante CPU INT8; las funcionalidades avanzadas (matching de autoridades, meta-stackers GBDT, swarm) residen en la variante Ultra.
- La fecha de creacion indicada (2026-10-18) es posterior a la fecha actual de referencia; verificar la vigencia de los enlaces antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/armiger
- Variante Ultra (FP32 y componentes adicionales): https://huggingface.co/NorviTech/armiger-ultra
- Repositorio GitHub del paquete y guias de instalacion: https://github.com/spencernorton/armiger
- Release v3.17.0: https://github.com/spencernorton/armiger/releases/tag/v3.17.0
- Documentacion de evaluacion: https://github.com/spencernorton/armiger/blob/main/docs/evaluation.md
- Conectores de indexadores: https://github.com/spencernorton/Armiger-Connectors
- DH-Waypoint: https://github.com/spencernorton/DH-Waypoint
- Vision general de modelos NorviTech: https://norvitech.com/ai-models/#armiger
