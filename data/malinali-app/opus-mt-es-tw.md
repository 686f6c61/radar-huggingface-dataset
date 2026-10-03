# malinali-app/opus-mt-es-tw

# Ficha tecnica: malinali-app/opus-mt-es-tw

## Resumen

`malinali-app/opus-mt-es-tw` es un paquete de pesos publicado en HuggingFace por el proyecto Malinali para traduccion automatica de espanol (es) a twi (tw), una lengua del grupo akan hablada principalmente en Ghana. No se trata de un modelo entrenado desde cero: es una redistribucion de los pesos del modelo `Helsinki-NLP/opus-mt-es-tw`, del proyecto OPUS-MT de la Universidad de Helsinki, reempaquetados en formato safetensors junto con tokenizadores rapidos convertidos a JSON para su uso con el runtime Candle.

La relevancia del paquete es practica mas que cientifica. Malinali lo publica como componente on-device para su aplicacion, lo que implica que el objetivo es ejecutar traduccion espanol-twi localmente en dispositivos sin depender de una API externa. Para desarrolladores e investigadores que trabajen con lenguas de bajos recursos, este repositorio ofrece una via de acceso directa a un modelo OPUS-MT ya entrenado, con tokenizadores listos para Candle en lugar del formato SentencePiece original.

Arquitectonicamente es un transformer encoder-decoder de tipo Marian, con aproximadamente 75,5 millones de parametros y un peso de repositorio de 0,3 GB. La direccion de traduccion es unidireccional (es a tw) y no se declara soporte bidireccional ni multilingue mas alla de ese par. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no incluye datos de entrenamiento, evaluacion ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian |
| Parametros totales | 75.459.713 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | es (espanol), tw (twi) |
| Licencia | no disponible en el repositorio; el autor indica seguir la model card de origen, tipicamente CC-BY 4.0 en OPUS-MT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | translation |
| Direccion | es a tw (unidireccional) |
| Modelo base | Helsinki-NLP/opus-mt-es-tw |
| Tokenizadores | tokenizer-enc.json (origen), tokenizer-dec.json (destino) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal y utilizado de forma extensiva en el ecosistema OPUS-MT. La informacion disponible no detalla el numero de capas, dimension del modelo, cabezas de atencion ni la composicion exacta del dataset de entrenamiento, ya que este repositorio es una redistribucion y no incluye la model card tecnica del entrenamiento original.

Malinali unicamente realiza dos operaciones sobre los pesos de origen: el reempaquetado a safetensors y la conversion de los tokenizadores de SentencePiece al formato JSON de tokenizador rapido de HuggingFace. No se declara ningun proceso de fine-tuning, RLHF, DPO ni ajuste adicional, por lo que las capacidades del modelo son las heredadas del checkpoint `Helsinki-NLP/opus-mt-es-tw`. El runtime objetivo declarado es Candle, a traves del componente `marian_flutter`, orientado a inferencia en dispositivo.

## Capacidades

- Traduccion automatica unidireccional de espanol a twi.
- Generacion de texto secuencia a secuencia mediante pipeline `text2text-generation`.
- Compatibilidad con la libreria `transformers` y con el tag `endpoints_compatible`, lo que permite desplegarlo en Inference Endpoints de HuggingFace.
- Inferencia on-device mediante Candle, segun el proposito declarado del paquete.
- Uso de tokenizadores rapidos separados para origen y destino, en lugar de un tokenizador SentencePiece unico.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta capacidad multilingue mas alla del par es-tw.

## Casos de uso

- Traduccion de documentacion administrativa o sanitaria al twi: el modelo permite convertir textos en espanol a twi en local, util para ONG y programas de cooperacion que operan en Ghana y necesitan material traducido sin enviar contenido sensible a servicios en la nube.
- Aplicaciones moviles de traduccion offline: gracias al tamano reducido (75M de parametros, 0,3 GB) y al empaquetado para Candle, se puede integrar en una app movil que traduzca espanol a twi sin conexion a internet.
- Preprocesado en pipelines de datos multilingues: un investigador puede usar el modelo para generar traducciones es-tw dentro de un corpus mayor y anadir la anotacion de idioma correspondiente antes de otras etapas de analisis.
- Traduccion de contenido educativo: conversion de materiales didacticos o cursos en espanol a twi para su distribucion en comunidades ghanesas donde el twi es la lengua vehicular.
- Prototipado de sistemas de traduccion para lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning o evaluacion comparativa frente a modelos multilingues grandes, dado su bajo coste computacional.
- Subtitulado o transcripcion traducida en tiempo casi real: al ser un modelo pequeno, la latencia en GPU consumer o incluso en CPU es baja, lo que permite procesar segmentos cortos de subtitulos sucesivamente.
- Integracion como servicio en HuggingFace Inference Endpoints: el tag `endpoints_compatible` facilita desplegar el modelo como API REST sin gestionar infraestructura propia, util para integraciones puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF, COMET ni evaluaciones de calidad de traduccion, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,5 millones de parametros, los pesos ocupan aproximadamente 302 MB en FP32, unos 151 MB en FP16 y unos 75 MB en INT8. El consumo real de VRAM depende de la longitud de secuencia y del tamano de lote.
- GPU recomendadas: cualquier GPU moderna sirve para este tamano; una RTX 3090, RTX 4090, A100 o H100 lo ejecutan con holgura, aunque estan sobredimensionadas. Una GPU de gama baja como GTX 1650 o T4 es mas que suficiente.
- Cabida en GPU consumer: si, cabe en practicamente cualquier GPU consumer con al menos 1-2 GB de VRAM libre, e incluso puede ejecutarse en CPU con latencias aceptables para uso interactivo.
- Opciones de despliegue: `transformers` con PyTorch es la via directa; Candle a traves de `marian_flutter` es el runtime declarado por el autor; tambien es compatible con HuggingFace Inference Endpoints. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-es-tw | 75,5 M | es, tw | no disponible | no disponible (origen tipicamente CC-BY 4.0) | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-es-tw | ~75 M (mismo checkpoint de origen) | es, tw | no disponible | CC-BY 4.0 segun OPUS-MT | HuggingFace, ampliamente usado |
| NLLB-200 (distilled 600M) | 600 M | 200 idiomas, incluye tw | no disponible | CC-BY-NC 4.0 | HuggingFace, uso no comercial |
| M2M-100 (418M) | 418 M | 100 idiomas | no disponible | MIT | HuggingFace |

La diferencia principal frente al checkpoint de Helsinki-NLP es el formato: safetensors y tokenizadores rapidos para Candle, frente a los pesos originales con tokenizador SentencePiece. Frente a NLLB-200 o M2M-100, el modelo de Malinali es entre cinco y ocho veces mas pequeno, lo que reduce costes de inferencia pero tambien limita la calidad esperada, dado que los modelos multilingues grandes suelen obtener mejores resultados en traduccion a lenguas de bajos recursos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al heredar los pesos de OPUS-MT, es probable que arrastre los sesgos de los corpus paralelos de OPUS, habitualmente sesgados hacia dominios religiosos, administrativos y literarios.
- Riesgo de alucinacion: no cuantificado. En modelos de traduccion de bajos recursos, el riesgo se manifiesta como omisiones, repeticiones o traducciones parcialmente inventadas cuando la frase de entrada no tiene paralelos en el corpus de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud maxima de secuencia. Los modelos Marian de OPUS-MT suelen tener limites relativamente cortos, lo que puede truncar documentos largos; conviene procesar por segmentos.
- Limitaciones de idioma: solo traduce de espanol a twi. No soporta la direccion inversa tw-es, ni variantes dialectales del twi, ni otras lenguas de Ghana como el fante o el ewe.
- Restricciones de licencia: el repositorio no declara licencia explicita, lo que supone un riesgo legal para uso comercial. El autor remite a la model card de origen, que tipicamente es CC-BY 4.0 en OPUS-MT, pero esta circunstancia deberia verificarse antes de desplegar en produccion.
- Caveat de mantenimiento: el repositorio registra cero descargas y cero likes, y fue creado en octubre de 2026, por lo que no hay evidencia de uso, validacion por terceros ni mantenimiento activo.
- Ausencia de evaluacion: sin benchmarks publicados, no es posible estimar la calidad real de las traducciones sin una evaluacion propia.
- Dependencia de Candle: los tokenizadores se distribuyen en un formato especifico para el runtime `marian_flutter`, lo que puede requerir adaptaciones si se pretende usar el modelo en otros frameworks.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/malinali-app/opus-mt-es-tw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-tw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
