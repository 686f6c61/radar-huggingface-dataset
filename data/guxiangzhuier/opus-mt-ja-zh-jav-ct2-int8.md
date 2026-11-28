# guxiangzhuier/opus-mt-ja-zh-jav-ct2-int8

## Resumen

opus-mt-ja-zh-jav-ct2-int8 es un modelo de traduccion automatica japones-chino derivado de lemmonyjiang/opus-mt-ja-zh-jav, que a su vez parte de la arquitectura Marian NMT de la familia OPUS-MT de Helsinki-NLP. El autor, guxiangzhuier, ha realizado un ajuste fino adicional y lo ha exportado al formato CTranslate2 con cuantizacion int8, lo que reduce el peso del repositorio a unos 0,2 GB y lo hace apto para inferencia en CPU y GPUs modestas.

El modelo esta especializado en la traduccion de titulos y sinopsis del dominio JAV (video para adultos japones), un subdominio con vocabulario muy especifico que los modelos genericos de traduccion suelen resolver mal. Para ello se entreno con tablas de categorias publicas de JavSP, titulos de JavBus, un glosario sectorial local y un conjunto de datos dorados anotados manualmente, con sobremuestreo de estos ultimos.

Su relevancia es acotada pero clara: demuestra como un modelo NMT compacto (Marian, tipicamente decenas de millones de parametros) puede especializarse en un dominio vertical mediante ajuste fino y glosarios, y distribuirse en un formato de inferencia optimizado (CTranslate2 int8) listo para integrarse en aplicaciones de escritorio como AIVPlayer. No es un modelo de proposito general ni compite con LLMs multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder), exportado a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | japones (ja) como origen; chino (zh) como destino |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (model.bin, config.json, shared_vocabulary.json, source.spm, target.spm) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian NMT, un transformer encoder-decoder compacto disenado originalmente para traduccion automatica neuronal y usado en la familia OPUS-MT. La exportacion a CTranslate2 conserva el tokenizador SentencePiece (source.spm y target.spm) y la tabla de vocabulario compartido (shared_vocabulary.json), y aplica cuantizacion int8 sobre los pesos para acelerar la inferencia y reducir el consumo de memoria.

El ajuste fino se realizo sobre lemmonyjiang/opus-mt-ja-zh-jav con un corpus especifico del dominio: la tabla de categorias publica de JavSP (ja/en a zh), titulos japoneses de JavBus con sustitucion de vocabulario, un glosario sectorial local que tiene prioridad sobre traducciones externas en caso de conflicto (por ejemplo, 中出し a 中出) y un conjunto de datos dorados anotados manualmente sobre ordenacion de titulos y terminologia del sector, con sobremuestreo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

Una advertencia tecnica relevante del autor: la exportacion Marian a CT2 debe conservar la fila `<pad>` del vocabulario de Transformers (`decoder_start_token=<pad>`). Las rutas oficiales que eliminan el pad o aplican zero-embedding producen salidas corruptas (texto ilegible) con estos pesos.

## Capacidades

- Traduccion de texto japones a chino, orientada a titulos y sinopsis del dominio JAV.
- Manejo de terminologia sectorial mediante glosario externo aplicado en la aplicacion (no integrado en los pesos).
- Tokenizacion SentencePiece para ambos idiomas.
- Inferencia optimizada con CTranslate2 en CPU y GPU, con pesos int8.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par ja-zh (no traduce a otros idiomas).

## Casos de uso

- Traduccion de titulos de catalogo en aplicaciones de escritorio: integrado en AIVPlayer (directorio por defecto `models/opus-mt-ja-zh-jav-ct2-int8`), traduce titulos japoneses a chino al vuelo con latencia baja gracias a la cuantizacion int8 y al backend CTranslate2.
- Normalizacion de metadatos en bases de datos de contenido: procesar lotes de titulos y sinopsis ja para generar campos zh consistentes, aplicando el glosario sectorial para evitar traducciones divergentes entre registros.
- Enriquecimiento de bibliotecas locales: un script que recorra una coleccion de fichas y complete la version en chino de cada titulo, con throughput alto en CPU por el reducido tamano del modelo (0,2 GB).
- Busqueda y filtrado en chino: traducir previamente los titulos a zh para permitir busquedas por palabras clave en ese idioma sobre un indice que originalmente solo contiene japones.
- Generacion de subtitulos o descripciones cortas: para textos breves del dominio (sinopsis de pocas lineas), el ajuste fino sobre titulos y descripciones reduce el riesgo de traducciones literales incorrectas en terminologia especifica.
- Pipeline de moderacion y etiquetado: clasificar y etiquetar contenido por categorias usando la traduccion zh como paso intermedio antes de un clasificador, aprovechando la coherencia terminologica del glosario.
- Prototipado de NMT de dominio en CPU: servir de referencia para especializar un Marian OPUS-MT en un vertical concreto y desplegarlo con CTranslate2 sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos int8 (repositorio de 0,2 GB); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona tambien en CPU.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), aunque la ganancia frente a CPU es limitada por el tamano del modelo.
- Opciones de despliegue: CTranslate2 (formato nativo del repositorio), con SentencePiece y glosario en la aplicacion. No se distribuyen pesos en formato GGUF ni safetensors en este repositorio; para llama.cpp u Ollama habria que reconvertir desde el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| opus-mt-ja-zh-jav-ct2-int8 (este) | no disponible (Marian compacto) | no disponible | ja a zh | apache-2.0 | CTranslate2 int8 | Especializado en dominio JAV, con glosario |
| lemmonyjiang/opus-mt-ja-zh-jav | no disponible | no disponible | ja a zh | no disponible | Transformers | Modelo base del que deriva este |
| Helsinki-NLP/opus-mt-ja-zh | no disponible | no disponible | ja a zh | apache-2.0 (familia OPUS-MT) | Transformers, convertible a CT2 | Traduccion generica ja-zh, sin especializacion de dominio |

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste fino esta orientado a titulos y sinopsis JAV; el rendimiento en texto general ja-zh puede degradarse respecto al modelo base.
- Riesgo de alucinacion y de traducciones forzadas hacia la terminologia del glosario cuando el texto de entrada no pertenece al dominio.
- Sesgos: el corpus de entrenamiento proviene de fuentes del sector adulto, por lo que el vocabulario y las connotaciones estan sesgados hacia ese contenido.
- Limitacion de idioma: solo traduce de japones a chino; no soporta otros pares ni direccion inversa.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el contenido generado y el dominio de aplicacion pueden estar sujetos a normativa sobre contenido adulto segun la jurisdiccion.
- Caveat de produccion: es imprescindible conservar la fila `<pad>` del vocabulario en la exportacion CT2; las rutas que la eliminan producen salidas corruptas.
- El glosario no esta embebido en los pesos: requiere aplicacion externa para garantizar la coherencia terminologica.
- No disponible informacion sobre longitud maxima de secuencia ni sobre el numero de parametros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guxiangzhuier/opus-mt-ja-zh-jav-ct2-int8
- Modelo base: https://huggingface.co/lemmonyjiang/opus-mt-ja-zh-jav
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Familia OPUS-MT (Helsinki-NLP): https://huggingface.co/Helsinki-NLP
- JavSP (tabla de categorias): https://github.com/Yuukiy/JavSP
- JavBus: https://www.javbus.com
