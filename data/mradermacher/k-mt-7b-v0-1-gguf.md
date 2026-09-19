# mradermacher/K-MT-7B-v0.1-GGUF

## Resumen

`mradermacher/K-MT-7B-v0.1-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo `ThakiCloud/K-MT-7B-v0.1`, un modelo de traducción orientado al par de idiomas coreano-inglés con tratamiento explícito de los honoríficos coreanos. No se trata de un modelo entrenado por el autor del repositorio: mradermacher se limita a convertir y cuantizar los pesos originales publicados por ThakiCloud, de modo que el comportamiento funcional del modelo depende íntegramente del modelo base.

El modelo base declara 7.504.568.320 parámetros (aproximadamente 7,5 mil millones) y está etiquetado para las tareas de traducción, seguimiento de instrucciones y preservación de capacidades, con soporte únicamente para coreano (ko) e inglés (en). La ficha del modelo base no documenta arquitectura interna, longitud de contexto ni proceso de entrenamiento, por lo que estos datos figuran como no disponibles en esta ficha.

La relevancia de esta publicación es práctica: al ofrecer versiones GGUF desde 3,1 GB (Q2_K) hasta 15,1 GB (f16), permite ejecutar un modelo de traducción coreano-inglés de 7,5B en hardware de consumo mediante llama.cpp u otros motores compatibles con GGUF. El repositorio se publicó el 19 de septiembre de 2026 según los metadatos y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante concreta no disponible; el modelo base usa la libreria `transformers`) |
| Parametros totales | 7.504.568.320 (aproximadamente 7,5B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (16 bpw), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en formato `transformers`, con pesos safetensors) |
| Tamano del repositorio | 67,3 GB (incluye todas las cuantizaciones) |
| Tarea declarada (`pipeline_tag`) | `translation` |
| Modelo base | `ThakiCloud/K-MT-7B-v0.1` |
| Fecha de publicacion (metadatos) | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los datos indican que se trata de un modelo de 7.504.568.320 parametros cargable con la libreria `transformers`, especializado en traduccion coreano-ingles, con etiquetas que mencionan honorificos coreanos, seguimiento de instrucciones y preservacion de capacidades (`capability-preservation`). No se especifica si emplea atencion con ventana deslizante, atencion lineal, mezcla de expertos o alguna variante hibrida, ni el numero de capas, cabezas de atencion o dimension oculta.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La etiqueta `capability-preservation` sugiere que el ajuste se diseno para no degradar las capacidades generales del modelo de partida, pero no hay detalle tecnico que lo confirme. En cuanto al repositorio aqui descrito, la unica transformacion aplicada es la cuantizacion de los pesos a GGUF en multiples precisiones.

## Capacidades

- Traduccion coreano-ingles y ingles-coreano, con tratamiento de los niveles de habla y honorificos propios del coreano.
- Seguimiento de instrucciones (`instruction-following`), lo que permite formular la traduccion mediante prompts en lenguaje natural.
- Conversacion multiturno: el repositorio incluye la etiqueta `conversational`.
- Preservacion de capacidades del modelo base tras el ajuste (`capability-preservation`).
- Soporte bilingue limitado a coreano e ingles; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles (no se mencionan modalidades adicionales).

## Casos de uso

- Localizacion de documentacion tecnica: traducir manuales, referencias de API y notas de version del coreano al ingles para equipos internacionales, aprovechando la orientacion del modelo a terminologia y registro formal.
- Subtitulado y localizacion de contenido audiovisual: conversion de guiones y subtitulos coreanos a ingles conservando el nivel de habla (formal, informal) para que el espectador perciba la relacion jerarquica entre personajes.
- Atencion al cliente bilingue: procesar consultas de usuarios coreanos y generar respuestas en ingles (o viceversa) en flujos de soporte de comercio electronico, con la etiqueta `conversational` como respaldo para interacciones multiturno.
- Traduccion de correspondencia corporativa: convertir correos y mensajes internos entre coreano e ingles respetando el registro adecuado segun el destinatario (companero, supervisor, cliente), un matiz que los traductores genericos suelen perder.
- Preprocesado de corpus para entrenamiento: traducir grandes volumenes de texto coreano a ingles para construir datasets bilingues, ejecutando la cuantizacion Q4_K_M en GPU de consumo para abaratar el coste por token.
- Revision y postedicion humana asistida: generar una primera traduccion automatica y permitir que un revisor humano la refine, usando la cuantizacion Q8_0 cuando la fidelidad del texto sea prioritaria sobre la velocidad.
- Traduccion de documentacion legal o administrativa: apoyar la conversion de contratos y formularios entre ambos idiomas como borrador previo a validacion profesional, dado el enfasis del modelo en el tratamiento de honorificos y registro formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de BLEU, chrF, MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan evaluaciones comparativas frente a otros sistemas de traduccion. Los unicos datos cuantitativos disponibles son los tamanos de fichero de cada cuantizacion.

| Cuantizacion | Tamano (GB) | Notas del autor |
|---|---|---|
| Q2_K | 3,1 | Sin nota |
| Q3_K_S | 3,5 | Sin nota |
| Q3_K_M | 3,9 | Calidad inferior |
| Q3_K_L | 4,2 | Sin nota |
| IQ4_XS | 4,3 | Los quants IQ suelen preferirse frente a quants no IQ de tamano similar |
| Q4_K_S | 4,5 | Rapido, recomendado |
| Q4_K_M | 4,7 | Rapido, recomendado |
| Q5_K_S | 5,3 | Sin nota |
| Q5_K_M | 5,5 | Sin nota |
| Q6_K | 6,3 | Muy buena calidad |
| Q8_0 | 8,1 | Rapido, mejor calidad |
| f16 | 15,1 | 16 bpw, excesivo para uso habitual |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el cache KV y el overhead del runtime (del orden de 1 a 2 GB adicionales segun contexto y motor). En la practica: unos 4-5 GB para Q2_K y Q3_K_S, 5-7 GB para Q4_K_S y Q4_K_M, 7-8 GB para Q6_K, 9-10 GB para Q8_0 y 16-17 GB para f16.
- GPU de consumo: las cuantizaciones Q4_K_M y Q4_K_S caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070). Q6_K y Q8_0 encajan en 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4060 Ti 16 GB). La version f16 requiere 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU.
- GPU de datacenter: A100 40/80 GB, H100, L40S o cualquier acelerador con 16 GB o mas puede alojar el modelo completo en precision alta y servir varias peticiones concurrentes.
- Despliegue: llama.cpp es el motor de referencia para estos ficheros, junto con Ollama, LM Studio, `llama-cpp-python` y servidores OpenAI-compatibles sobre llama.cpp. Para servir con vLLM o TGI seria necesario usar los pesos safetensors del modelo base `ThakiCloud/K-MT-7B-v0.1`, no los GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.
- Nota sobre cuantizaciones: el autor indica que no ha generado cuantizaciones ponderadas ni con importance matrix (imatrix) para este modelo, solo cuantizaciones estaticas, por lo que la degradacion en los niveles bajos (Q2_K, Q3_K) puede ser mayor que en quants equivalentes con imatrix.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de traduccion coreano-ingles de tamano comparable, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion documentada es entre el repositorio cuantizado y su modelo de origen.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| mradermacher/K-MT-7B-v0.1-GGUF | 7,5B | No disponible | ko, en | Apache-2.0 | GGUF | No disponible |
| ThakiCloud/K-MT-7B-v0.1 (base) | 7,5B | No disponible | ko, en | Apache-2.0 | `transformers` / safetensors | No disponible |
| Alternativas de traduccion ko-en de ~7B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura idiomatica restringida: el modelo solo declara coreano e ingles. No debe asumirse calidad en otros idiomas, incluido el espanol.
- Ausencia total de evaluacion publicada: no hay BLEU, chrF, COMET ni ninguna otra metrica que permita estimar la calidad de traduccion antes de desplegarlo.
- Riesgo de alucinacion y de omision de contenido: como cualquier modelo generativo, puede inventar terminos, omitir fragmentos o alterar nombres propios, cifras y referencias legales. En dominios sensibles (legal, medico, financiero) se requiere revision humana.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que documenten comportamiento real en produccion.
- Cuantizaciones estaticas sin imatrix: el autor advierte de que no hay quants ponderados para este modelo. Los niveles Q2_K y Q3_K pueden degradar notablemente la calidad de traduccion y el manejo de honorificos.
- Coste de almacenamiento: el repositorio completo ocupa 67,3 GB, ya que incluye doce cuantizaciones; conviene descargar unicamente el fichero necesario.
- Documentacion insuficiente del modelo base: se desconoce la longitud de contexto, la arquitectura exacta y la composicion del dataset de entrenamiento, lo que dificulta planificar limites de truncado y estrategias de chunking.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario debe verificar de forma independiente las condiciones de los datos de entrenamiento y de cualquier dependencia del modelo base, ya que la licencia del repositorio no cubre necesariamente esos elementos.
- Fecha de publicacion en metadatos poco convencional: el repositorio figura creado el 2026-09-19, dato a tener en cuenta si se compara con el historial de versiones del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/K-MT-7B-v0.1-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/K-MT-7B-v0.1
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#K-MT-7B-v0.1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
