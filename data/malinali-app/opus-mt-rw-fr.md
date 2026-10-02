# malinali-app/opus-mt-rw-fr

## Resumen

malinali-app/opus-mt-rw-fr es un paquete de pesos de traduccion automatica para el par kinyarwanda (rw) a frances (fr), publicado por el desarrollador malinali-app. No se trata de un modelo entrenado desde cero, sino de una redistribucion empaquetada de los pesos de Helsinki-NLP/opus-mt-rw-fr (familia OPUS-MT, arquitectura MarianMT) en formato safetensors, junto con tokenizadores rapidos convertidos desde SentencePiece a JSON compatible con Hugging Face. El modelo tiene 75.996.824 parametros (~76 M) y una unica direccion de traduccion: rw → fr.

Su relevancia practica no esta en el rendimiento bruto, sino en el formato de distribucion: esta pensado para inferencia en dispositivo (on-device) mediante Candle, concretamente a traves del componente marian_flutter, lo que permite ejecutar traduccion sin conexion en aplicaciones moviles o de escritorio. El repositorio ocupa 0,3 GB y esta etiquetado como compatible con endpoints y con la libreria transformers.

Al ser un reempaquetado de un modelo upstream, la calidad de traduccion depende enteramente del modelo original de Helsinki-NLP. No se han publicado resultados de benchmarks propios, y la ficha de HuggingFace no declara licencia explicita, remitiendo a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 75.996.824 (~76 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | Kinyarwanda (rw) y frances (fr); direccion unica rw → fr |
| Licencia | no disponible en la ficha de HuggingFace; la model card remite a la licencia del modelo base Helsinki-NLP/opus-mt-rw-fr (tipicamente CC-BY 4.0 segun OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer encoder-decoder desarrollado en el marco del proyecto OPUS-MT de Helsinki-NLP. Es un modelo denso, no MoE, con aproximadamente 76 millones de parametros totales. El repositorio no documenta el numero de capas, dimension oculta ni cabezas de atencion, por lo que estos detalles tecnicos no estan disponibles en la informacion proporcionada.

El autor del reempaquetado no ha entrenado ni ajustado el modelo: se limita a convertir los pesos del modelo original a safetensors y a transformar los tokenizadores SentencePiece en tokenizadores rapidos en formato JSON (tokenizer-enc.json para el idioma origen y tokenizer-dec.json para el idioma destino). No hay informacion disponible sobre el dataset de entrenamiento, el volumen de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO; todo ello corresponde al modelo upstream de Helsinki-NLP y no se detalla en esta ficha. La innovacion tecnica del paquete es exclusivamente de formato y portabilidad, no de modelado.

## Capacidades

- Traduccion de texto unidireccional de kinyarwanda a frances (rw → fr).
- Generacion de texto condicionada (pipeline text2text-generation) mediante la libreria transformers.
- Inferencia en dispositivo gracias a los tokenizadores rapidos y a los pesos en safetensors preparados para Candle.
- Integracion en aplicaciones Flutter a traves del componente marian_flutter.
- Traduccion de frases y parrafos cortos en un unico sentido; no soporta la direccion inversa fr → rw.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio, modo thinking ni capacidades multimodales.
- Cobertura multilingue limitada estrictamente a los dos idiomas del par.

## Casos de uso

- Traduccion en dispositivo sin conexion: al ser un paquete de ~76 M de parametros en safetensors, puede ejecutarse en movil o escritorio a traves de Candle, lo que permite traducir kinyarwanda a frances en entornos sin acceso a red, algo critico en zonas con conectividad limitada.
- Aplicaciones moviles en Flutter: mediante marian_flutter, se puede integrar la traduccion directamente en una app movil para que el usuario traduzca texto sin enviar datos a un servidor externo.
- Atencion al cliente en Ruanda: el frances es idioma oficial en Ruanda, por lo que el modelo permite convertir consultas o mensajes redactados en kinyarwanda a frances para que un equipo de soporte francoparlante los procese.
- Traduccion de documentacion administrativa y sanitaria: conversion de formularios, folletos o avisos redactados en kinyarwanda a frances para su difusion en contextos oficiales o de cooperacion internacional.
- Localizacion de contenido digital: traduccion de cadenas de interfaz, mensajes de aplicacion o articulos breves del kinyarwanda al frances como paso previo a la publicacion.
- Traduccion de mensajeria y redes sociales: procesamiento de textos cortos generados por usuarios para moderacion o analisis en un pipeline que trabaje principalmente en frances.
- Preprocesado en pipelines de datos: uso del modelo como componente de traduccion dentro de un flujo ETL que necesite normalizar corpus en kinyarwanda hacia frances antes de un analisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF ni evaluaciones comparativas, y no se documentan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 304 MB en FP32, unos 152 MB en FP16 y alrededor de 76 MB en precision de 8 bits, calculados a partir de los 75.996.824 parametros.
- GPU recomendadas: practicamente cualquier GPU moderna sirve, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeno para aprovechar GPUs de gran formato y no se beneficiara de ellas de forma significativa.
- Inferencia en CPU: totalmente viable; el modelo cabe holgadamente en memoria RAM y puede ejecutarse sin GPU.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPU integradas, gracias a su tamano reducido.
- Despliegue: soportado de forma nativa por transformers (pipeline de traduccion) y por Candle a traves de marian_flutter. Otras opciones como vLLM, TGI o llama.cpp no estan documentadas para esta arquitectura en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rw-fr | ~76 M | rw → fr | no disponible (remite al upstream) | safetensors + tokenizadores JSON | Reempaquetado para Candle/on-device |
| Helsinki-NLP/opus-mt-rw-fr | no disponible en esta ficha | rw → fr | tipicamente CC-BY 4.0 (OPUS-MT) | PyTorch/SentencePiece original | Modelo base del que deriva el anterior |
| NLLB-200 (variante distilled) | cientos de millones | hasta 200 idiomas, incluidos rw y fr | CC-BY-NC-4.0 (uso no comercial en varias variantes) | safetensors / PyTorch | Cobertura multilingue muy superior, pero mayor tamano |
| mBART-50 | ~610 M | 50 idiomas | licencia especifica del proyecto | PyTorch | Alternativa multilingue generica, mas pesada |

Los datos de rendimiento comparativo no estan disponibles, por lo que la comparacion se limita a parametros, cobertura idiomatica, licencia y formato. El modelo analizado destaca unicamente por su ligereza y su orientacion a inferencia en dispositivo.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que la calidad real de traduccion rw → fr no esta verificada de forma independiente.
- La licencia no esta declarada en la ficha de HuggingFace; la model card remite a la licencia del modelo base, lo que introduce incertidumbre sobre el uso comercial. Conviene consultar la licencia de Helsinki-NLP/opus-mt-rw-fr antes de desplegarlo en produccion.
- Solo cubre la direccion rw → fr; no traduce en sentido inverso ni a otros idiomas.
- El kinyarwanda es un idioma de bajos recursos, por lo que cabe esperar un mayor riesgo de errores de traduccion, omisiones o alucinaciones en textos especializados, tecnicos o con terminologia poco frecuente.
- Al ser un reempaquetado y no un modelo reentrenado, hereda integramente los sesgos y las limitaciones del modelo upstream, sin ninguna correccion adicional.
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para flujos agenticos.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que es un artefacto reciente y practicamente sin validacion por parte de la comunidad.
- La longitud de contexto no esta documentada; en arquitecturas Marian es habitual un limite de 512 tokens, pero no se confirma en la informacion disponible, asi que los textos largos deberian dividirse en segmentos.
- No se documentan datos sobre manejo de mayusculas, puntuacion o formatos especiales, ni sobre el comportamiento en dominios concretos.

## Enlaces

- [Modelo en HuggingFace: malinali-app/opus-mt-rw-fr](https://huggingface.co/malinali-app/opus-mt-rw-fr)
- [Modelo base: Helsinki-NLP/opus-mt-rw-fr](https://huggingface.co/Helsinki-NLP/opus-mt-rw-fr)
- [Proyecto OPUS-MT (GitHub)](https://github.com/Helsinki-NLP/Opus-MT)
- [Aplicacion Malinali](https://malinali.app)
