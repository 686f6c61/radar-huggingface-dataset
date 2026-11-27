# desert-ant-labs/toxic

## Resumen

Toxic es un modelo de clasificación de texto especializado en la detección de discurso de odio, abuso y amenazas, desarrollado por Desert-Ant-Labs. Su propuesta principal es la moderación de contenido en el propio dispositivo (on-device), sin enviar el texto a ningún servidor, lo que lo hace adecuado para aplicaciones móviles, de escritorio y web donde la privacidad del usuario es un requisito. Está diseñado para ejecutarse en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.

El modelo no es un generador de texto ni un LLM conversacional: es un clasificador multi-cabeza que devuelve probabilidades para tres categorías de contenido (HATEFUL, ABUSIVE, THREAT) y ocho categorías de colectivo objetivo (RACE, RELIGION, NATIONAL_ETHNIC_ORIGIN, SEXUAL_ORIENTATION, GENDER, DISABILITY, AGE, OTHER). Cubre 35 idiomas y se distribuye en formatos optimizados para inferencia en el borde: Core ML compilado para Apple y LiteRT/TFLite para el resto de plataformas.

La relevancia actual del modelo radica en que ofrece una alternativa de moderación que no depende de la nube, con latencias declaradas de 2,0 ms por mensaje corto en un iPhone 16 Pro y un tamaño de artefacto reducido (43-44 MB para el grafo y 50 MB para la tabla de embeddings). Se encuentra en estado Beta (versión de pesos v0.2.2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador transformer con tabla de embeddings separada; grafo Core ML / LiteRT) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (aproximadamente 80 palabras); textos largos se procesan por ventanas solapadas |
| Tipos de cuantizacion | Capas del grafo en 8 bits; tabla de embeddings en 4 bits (coreml-mixed, litert-mixed) |
| Idiomas soportados | 35 idiomas: ar, bg, ca, cs, da, de, el, en, es, et, fi, fr, he, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | desert-ant-labs-source-available (source-available, no open source; enlace: https://license.desertant.com/) |
| Formato de pesos | Core ML compilado (.mlmodelc), LiteRT (.tflite), tabla de embeddings .bin, tokenizer .bin, metadatos JSON; tag ONNX presente en el repo |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. La model card describe un grafo de inferencia (Core ML o LiteRT) que consume tokens consultados en una tabla de embeddings separada (`toxic_table.bin`, 50 MB, 4 bits) y produce un conjunto de cabezas de clasificacion con probabilidades en el rango 0-1. Las cabezas de contenido son HATEFUL, ABUSIVE y THREAT; las cabezas de objetivo son RACE, RELIGION, NATIONAL_ETHNIC_ORIGIN, SEXUAL_ORIENTATION, GENDER, DISABILITY, AGE y OTHER.

El modelo lee 128 tokens por ventana y, para textos mas largos, aplica ventanas solapadas tomando la puntuacion maxima de cualquier ventana como resultado final. Los umbrales por cabeza se fijan por defecto a partir de texto de validacion y son ajustables por el usuario. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO. La model card indica que el modelo esta en estado Beta.

## Capacidades

- Clasificacion de toxicidad en tres ejes de contenido: HATEFUL (incitacion al odio o a la violencia contra un colectivo), ABUSIVE (lenguaje insultante o degradante) y THREAT (amenaza de violencia).
- Identificacion del colectivo objetivo en textos hateful: ocho cabezas de objetivo (raza, religion, origen nacional/etnico, orientacion sexual, genero, discapacidad, edad y otros).
- Salida con probabilidades por cabeza (0-1), umbrales por cabeza y conjunto de cabezas activadas.
- Soporte multilingue en 35 idiomas.
- Inferencia on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Procesamiento de textos largos mediante ventanas solapadas de 128 tokens.
- API consistente entre SDKs (Swift, Kotlin, JavaScript/TypeScript) con los mismos campos de retorno.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; el modelo es exclusivamente un clasificador.

## Casos de uso

- Moderacion previa a la publicacion en redes sociales y foros: el SDK puede interceptar un comentario antes de enviarlo y retenerlo para revision si se activa alguna cabeza de contenido, con latencia de milisegundos y sin salir del dispositivo.
- Filtrado de comentarios en aplicaciones moviles de noticias o comunidades: al ejecutarse en Core ML sobre el Neural Engine o en LiteRT en Android, no requiere backend ni conexion de red, lo que reduce costes de infraestructura y preserva la privacidad del usuario.
- Moderacion en el navegador para plataformas de contenido generado por el usuario: el paquete npm `@desert-ant-labs/toxic` con `@litertjs/core` permite clasificar texto en el cliente antes de enviarlo al servidor.
- Triaje en herramientas de mensajeria y correo: deteccion de amenazas (THREAT) y abuso (ABUSIVE) en mensajes entrantes para advertir al destinatario o escalar a revision humana.
- Cumplimiento normativo en plataformas con requisitos de moderacion (por ejemplo, obligaciones de moderacion de contenido en la UE): el modelo permite registrar decisiones de clasificacion localmente y aplicar umbrales ajustables por cabeza segun la politica de cada producto.
- Analisis de contenido en entornos sin conectividad o con requisitos de residencia de datos: al ejecutarse en Linux, Windows o Node de forma offline, encaja en despliegues en instalaciones aisladas.
- Investigacion sobre sesgos y discurso de odio multilingue: la salida desagregada por colectivo objetivo y los umbrales ajustables permiten analizar que tipos de discurso se detectan en cada uno de los 35 idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado es la latencia: 2,0 ms para un mensaje corto en un iPhone 16 Pro, con ejecucion completa en el Neural Engine en plataformas Apple.

## Requisitos de hardware

- VRAM/RAM estimada: el grafo ocupa 43 MB (Core ML) o 44 MB (LiteRT) y la tabla de embeddings 50 MB; el consumo total de memoria es del orden de decenas de MB, no de GB.
- GPU recomendadas: no aplica en el sentido habitual; en Apple se ejecuta en el Neural Engine (por defecto) o en otras unidades de computo pasando `computeUnits:` a `Toxic(directory:computeUnits:)`. En el resto de plataformas se ejecuta mediante LiteRT en CPU/GPU/NPU segun el runtime del dispositivo.
- Cabe en cualquier dispositivo consumer moderno: iPhone, iPad, Mac, Apple TV, Vision Pro, dispositivos Android, PC con Linux o Windows y navegadores.
- Opciones de despliegue: SDKs oficiales Swift (Swift Package Manager), Kotlin (BOM `ai.desertant:bom:6.0.0`), JavaScript/TypeScript (`@desert-ant-labs/toxic` para navegador y `@desert-ant-labs/toxic/native` para Node). Los pesos se descargan de Hugging Face en el primer uso y se cachean.
- Latencia: 2,0 ms por mensaje corto en iPhone 16 Pro. No se documenta throughput agregado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, clasificadores de toxicidad multilingues de otros autores) que permitan una comparacion rigurosa de parametros, contexto y rendimiento. Se indica, por tanto, no disponible.

## Limitaciones y advertencias

- Modelo en estado Beta (v0.2.2): la API y los pesos pueden cambiar.
- Ventana de contexto de solo 128 tokens (unas 80 palabras); los textos largos se evaluan por ventanas solapadas y se toma la puntuacion maxima, lo que puede sobrerreaccionar a un fragmento aislado.
- Los umbrales por defecto se eligen sobre texto de validacion y pueden no ajustarse a la politica de moderacion de cada producto; es necesario calibrarlos.
- Riesgo de falsos positivos y negativos inherente a la clasificacion de lenguaje natural; no se documentan tasas de error ni curvas precision-recall.
- No se documentan sesgos conocidos por idioma, dialecto o colectivo; la cobertura de 35 idiomas no garantiza el mismo rendimiento en todos ellos.
- La licencia es source-available (`desert-ant-labs-source-available`), no open source; es imprescindible revisar los terminos en https://license.desertant.com/ antes de un uso comercial.
- El modelo no genera texto ni razona: no debe emplearse como sustituto de un LLM para explicar decisiones de moderacion.
- La inferencia depende de runtimes especificos (Core ML, LiteRT); no se documentan requisitos de version minima de sistema operativo en la informacion disponible.
- La descarga inicial de pesos desde Hugging Face requiere conectividad; el funcionamiento offline es posterior a la cache.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/toxic
- Pesos v0.2.2: https://huggingface.co/desert-ant-labs/toxic/tree/v0.2.2
- Demo: https://desertant.com/models/toxic/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y cache de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
