# malinali-app/opus-mt-fr-lg

## Resumen

`malinali-app/opus-mt-fr-lg` es un paquete de pesos para traduccion automatica frances → luganda (fr → lg) publicado por malinali-app para su aplicacion Malinali. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-fr-lg` en formato safetensors, junto con tokenizadores rapidos (JSON) convertidos desde SentencePiece para permitir inferencia on-device con Candle a traves del componente `marian_flutter`. El autor declara explicitamente que no reclama la propiedad del modelo entrenado y que solo realiza la conversion de formato.

Tecnicamente es un modelo Marian de tipo encoder-decoder para traduccion (text2text-generation), con 76.149.698 parametros reales en safetensors y un repositorio de 0,3 GB. Cubre unicamente el par de idiomas frances (fr) y luganda (lg), una lengua bantu hablada principalmente en Uganda, lo que lo situa en el segmento de traduccion de bajos recursos.

Su relevancia actual es de nicho pero clara: los OPUS-MT siguen siendo la referencia practica para traduccion de pares de idiomas concretos en entornos con recursos limitados. Al ofrecer los pesos ya convertidos a safetensors con tokenizadores compatibles con Candle, el modelo esta pensado para ejecutarse en dispositivo (movil o escritorio) sin depender de GPU ni de servicios en la nube, algo poco habitual en este par linguistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion), segun el tag `marian` y la configuracion Marian del repositorio |
| Parametros totales | 76.149.698 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | fr (frances, origen), lg (luganda, destino) |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica que se debe seguir la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementacion de traduccion neuronal de codigo abierto desarrollada en el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer encoder-decoder clasico orientado a seq2seq, con vocabularios separados de origen y destino, lo que explica que el repositorio incluya dos tokenizadores rapidos distintos (`tokenizer-enc.json` para la entrada en frances y `tokenizer-dec.json` para la salida en luganda). El autor convierte ambos desde SentencePiece al formato JSON de tokenizador rapido de Hugging Face para que sean consumibles desde Candle.

Sobre el entrenamiento no hay informacion en la documentacion proporcionada: no se especifican el numero de tokens, la composicion del dataset, ni si hubo ajuste con RLHF o DPO. Tampoco se detallan hiperparametros de la configuracion Marian (numero de capas, dimension de modelo, cabezas de atencion), que quedan como no disponibles. La unica innovacion tecnica declarada por el publicador no esta en el modelo en si, sino en el empaquetado: pesos en safetensors y tokenizadores convertidos para inferencia on-device con Candle mediante `marian_flutter`.

## Capacidades

- Traduccion de texto de frances a luganda en una unica direccion (fr → lg); no soporta la direccion inversa.
- Generacion de texto de tipo text2text mediante pipeline `translation` de transformers.
- Tokenizacion separada de origen y destino con tokenizadores rapidos ya convertidos, lista para Candle.
- Inferencia on-device: el empaquetado esta pensado para ejecutarse en dispositivo mediante el componente `marian_flutter` de Malinali.
- Compatibilidad con endpoints, segun el tag `endpoints_compatible`.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion frances → luganda en aplicaciones moviles sin conexion: el modelo esta empaquetado especificamente para inferencia on-device con 0,3 GB de repositorio, por lo que puede integrarse en una app Flutter para traducir texto localmente sin enviar datos a un servidor.
- Atencion al cliente para comunidades ugandesas de habla luganda: un servicio que reciba consultas en frances puede pre-traducirlas a luganda antes de enrutarlas a agentes humanos locales.
- Traduccion de documentacion administrativa o sanitaria: conversion de folletos, formularios o guias escritas en frances a luganda en entornos con conectividad limitada.
- Localizacion de contenido editorial de bajo volumen: traduccion asistida de articulos, notas de prensa o publicaciones de ONG con hablantes de luganda como publico objetivo.
- Preprocesado para pipelines de datos multilingues: generar traducciones fr → lg para aumentar corpus paralelos de un par de bajos recursos, con revision humana posterior.
- Traduccion embebida en kioscos o terminales sin GPU: al tener 76 millones de parametros, puede ejecutarse en CPU en hardware modesto, lo que permite desplegarlo en puntos de atencion publica.
- Prototipado e investigacion sobre traduccion de bajos recursos: servir como linea base reproducible frente a modelos multilingues grandes en el par fr → lg.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas BLEU, chrF ni comparaciones automaticas, y no se proporcionan datos de evaluacion del reempaquetado respecto al modelo upstream.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del numero real de parametros (76.149.698): aproximadamente 305 MB en fp32, 152 MB en fp16/bf16 y 76 MB en int8, mas el coste de activaciones, que en un modelo Marian de este tamano es reducido.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, con un uso de VRAM muy por debajo de sus capacidades.
- Tambien es viable en CPU y en dispositivo movil, que es el escenario declarado por el publicador a traves de Candle y `marian_flutter`.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o ajuste fino, para lo cual no se aportan recetas.
- Opciones de despliegue: transformers con pipeline `translation`; Candle (via `marian_flutter`) para inferencia on-device; los tags indican compatibilidad con endpoints. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `malinali-app/opus-mt-fr-lg` | 76.149.698 | fr → lg | no disponible | no disponible (remite al upstream) | safetensors + tokenizadores JSON | Reempaquetado para Candle; sin datos de benchmarks |
| `Helsinki-NLP/opus-mt-fr-lg` | no disponible en la informacion proporcionada | fr → lg | no disponible | segun la model card, habitualmente CC-BY 4.0 en OPUS-MT | pesos Marian originales | Modelo upstream del que deriva este repositorio |
| Modelos multilingues tipo NLLB | no disponible en la informacion proporcionada | multilingue (incluye numerosas lenguas africanas) | no disponible | no disponible en la informacion proporcionada | no disponible | Alternativa generica de mayor tamano; no se aportan cifras comparativas verificadas |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, cobertura de idiomas, licencia y formato.

## Limitaciones y advertencias

- Traduccion unidireccional: solo fr → lg. No se puede usar para luganda → frances sin un modelo complementario.
- Cobertura linguistica muy estrecha: dos idiomas y un unico par. No sirve como modelo multilingue general.
- Licencia: la ficha de HuggingFace no declara licencia. La model card remite a la del modelo upstream, que el autor describe como habitualmente CC-BY 4.0, pero no lo confirma para este repositorio. Antes de un uso comercial es imprescindible verificar la licencia real del modelo original y los terminos de atribucion.
- Sin datos de evaluacion: no hay BLEU, chrF ni ninguna otra metrica publicada, ni para el modelo upstream ni para este reempaquetado. No hay forma de estimar la calidad de traduccion a partir de la informacion disponible.
- Riesgo de alucinacion y de traducciones infieles: es un comportamiento conocido en modelos de traduccion neuronal de este tamano, especialmente en pares de bajos recursos como fr → lg, donde la disponibilidad de corpus paralelos es limitada. Se recomienda revision humana en contextos sensibles.
- Longitud de contexto no documentada: no se indica el maximo de tokens de entrada, lo que obliga a determinarlo experimentalmente antes de usarlo con documentos largos.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden caracterizar los sesgos de dominio, registro o demografia del modelo.
- Repositorio practicamente sin traccion: cero descargas y cero likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad en produccion.
- Fecha de publicacion inusual en los metadatos (2026), lo que conviene contrastar antes de citar el modelo.
- Mantenimiento: al ser un reempaquetado, cualquier mejora del modelo upstream no se reflejara automaticamente en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/malinali-app/opus-mt-fr-lg
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-fr-lg
- Proyecto Helsinki-NLP / OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
