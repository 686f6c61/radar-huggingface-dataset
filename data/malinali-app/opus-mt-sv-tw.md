# malinali-app/opus-mt-sv-tw

## Resumen

malinali-app/opus-mt-sv-tw es un paquete de pesos del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-sv-tw, reempaquetado por el equipo de Malinali para inferencia en dispositivo. Se trata de un modelo Marian de tipo transformer encoder-decoder orientado a traducción de texto (pipeline `translation`) en la dirección sueco (sv) a twi (tw). Cuenta con 75.207.317 parámetros reales según los pesos en safetensors y un repositorio de 0,3 GB.

La relevancia de esta ficha no está en una arquitectura novedosa, sino en el formato de distribución: Malinali publica los pesos en `safetensors` junto con tokenizadores rápidos convertidos de SentencePiece a JSON de Hugging Face (`tokenizer-enc.json` y `tokenizer-dec.json`), pensados para ejecutarse con Candle a través de `marian_flutter`. Esto permite traducción local, sin conexión y sin enviar texto a un servidor, algo crítico para aplicaciones móviles con requisitos de privacidad.

El modelo no aporta pesos entrenados nuevos: es una conversión del checkpoint upstream de OPUS-MT. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la licencia no aparece declarada en los metadatos, aunque la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion automatica neuronal) |
| Parametros totales | 75.207.317 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponibles en el repositorio (solo pesos safetensors) |
| Idiomas soportados | sueco (sv) como origen, twi (tw) como destino |
| Licencia | no disponible en los metadatos; la model card indica seguir la licencia del modelo base (tipicamente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tokenizadores | `tokenizer-enc.json` (origen) y `tokenizer-dec.json` (destino), formato fast tokenizer JSON |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Helsinki-NLP/opus-mt-sv-tw |
| Libreria | transformers |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, un transformer sequence-to-sequence con encoder y decoder completos, diseñado especificamente para traduccion automatica neuronal. Al ser un modelo de traduccion puro, no incorpora cabezas de clasificacion, tool calling ni modo de razonamiento: su unica salida es la secuencia traducida. Los pesos distribuidos por Malinali son una conversion del checkpoint Helsinki-NLP/opus-mt-sv-tw, que a su vez procede del proyecto OPUS-MT de Helsinki-NLP, entrenado sobre corpus paralelos recopilados en el ecosistema OPUS.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (habitualmente ausentes en modelos NMT de este tipo). Tampoco se documentan innovaciones tecnicas adicionales mas alla del reempaquetado: la aportacion de Malinali consiste en convertir SentencePiece a tokenizadores JSON compatibles con Hugging Face y en preparar los ficheros para inferencia on-device con Candle mediante `marian_flutter`.

## Capacidades

- Traduccion de texto de sueco (sv) a twi (tw) en una unica direccion; no soporta la direccion inversa tw → sv.
- Generacion text2text pura: recibe una secuencia de tokens y devuelve la traduccion.
- Inferencia en dispositivo mediante Candle, con tokenizadores rapidos empaquetados en el propio repositorio.
- Compatibilidad con la libreria transformers y con endpoints marcados como compatibles en las etiquetas del modelo.
- Ejecucion local sin conexion, adecuada para entornos con restricciones de privacidad o conectividad.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada estrictamente al par sv → tw.

## Casos de uso

- Traduccion on-device en aplicaciones moviles: la aplicacion Malinali puede integrar los pesos con `marian_flutter` y Candle para traducir texto sueco a twi sin envio a servidores, lo que reduce latencia y elimina la exposicion de datos del usuario.
- Atencion al cliente en comunidades de Ghana con diaspora sueca: traduccion de mensajes de soporte escritos en sueco a twi para su lectura por agentes o usuarios locales.
- Traduccion de documentacion administrativa: conversion de formularios, avisos o guias redactadas en sueco a twi para poblacion twi-hablante residente en Suecia.
- Contenido educativo bilingue: traduccion de materiales escolares o sanitarios del sueco al twi en entornos con conectividad limitada.
- Preprocesado de corpus para investigacion en linguistica: generacion de traducciones automaticas sv → tw que sirvan como punto de partida para anotacion humana o evaluacion de sistemas NMT de bajos recursos.
- Traduccion embebida en dispositivos de bajo consumo: al tratarse de 75,2 millones de parametros, el modelo puede ejecutarse en CPU o GPU integrada dentro de aplicaciones de escritorio o IoT.
- Integracion en pipelines de traduccion por lotes: uso con la libreria transformers en servidores para traducir grandes volumenes de texto sueco a twi en tareas de localizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas BLEU, chrF ni evaluaciones humanas, y no se dispone de comparaciones cuantitativas con otros sistemas sv → tw.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 300 MB solo para pesos, mas activaciones y cache de atencion.
- VRAM estimada en fp16/bf16: aproximadamente 150 MB para pesos.
- VRAM estimada en int8: aproximadamente 75 MB; en int4, alrededor de 38 MB (estimaciones calculadas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100, H100 ni RTX 4090, aunque funcionara en ellas sin aprovechar su capacidad.
- Cabe sobradamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1650) y en GPUs integradas con memoria compartida.
- Despliegue: Candle mediante `marian_flutter`, y la libreria transformers en Python. No se han publicado pesos GGUF ni ONNX en el repositorio, por lo que llama.cpp y Ollama no estan disponibles de fabrica; vLLM no ofrece soporte maduro para arquitecturas Marian.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| malinali-app/opus-mt-sv-tw | 75.207.317 | no disponible | sv → tw | no disponible (remite a la del modelo base) | safetensors + tokenizadores JSON |
| Helsinki-NLP/opus-mt-sv-tw | no disponible en la informacion proporcionada | no disponible | sv → tw | no disponible en la informacion proporcionada | safetensors / PyTorch |
| Otros modelos OPUS-MT del mismo par linguistico | no disponible | no disponible | sv → tw | no disponible | no disponible |

El unico comparable directo identificable es el checkpoint upstream Helsinki-NLP/opus-mt-sv-tw, del que este repositorio deriva. No se dispone de datos de rendimiento comparado entre ambos ni frente a alternativas de traduccion neuronal para el par sv → tw.

## Limitaciones y advertencias

- Riesgo de alucinacion presente en cualquier sistema NMT: el modelo puede generar traducciones fluidas pero incorrectas en terminos de contenido, especialmente con frases largas o ambiguas.
- El twi es un idioma de bajos recursos; la cobertura del modelo depende de la disponibilidad de corpus paralelos sueco-twi en OPUS, presumiblemente limitada, lo que puede degradar la calidad frente a pares con mas datos.
- Direccionalidad unica: solo traduce de sv a tw; no se puede usar para tw → sv.
- La licencia no esta declarada en los metadatos del repositorio. La model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT), pero la ausencia de una declaracion explicita es un riesgo para uso comercial en produccion y deberia verificarse con el autor.
- El autor indica explicitamente que no reclama la propiedad del modelo entrenado y que solo reempaqueta pesos y tokenizadores; cualquier incidencia de calidad debe atribuirse al modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- No se han publicado evaluaciones de sesgo, robustez ni tasas de error; no se recomienda su uso en contextos legales, medicos o administrativos sin revision humana.
- Longitud de contexto no documentada; no se debe asumir que soporta entradas largas sin verificacion previa.
- La ausencia de pesos cuantizados publicados obliga a realizar la conversion a GGUF u ONNX por cuenta propia si se necesita ese formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-sv-tw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-tw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- La busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos tratan sobre Limulidae y no son relevantes). No se dispone de papers, blogs ni demos adicionales en la informacion proporcionada.
