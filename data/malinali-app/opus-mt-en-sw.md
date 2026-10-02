# malinali-app/opus-mt-en-sw

## Resumen

El modelo `malinali-app/opus-mt-en-sw` es un paquete de traduccion automatica ingles → suajili (en → sw) publicado por Malinali, una aplicacion de traduccion en dispositivo. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-en-sw` de la familia OPUS-MT, convertidos a formato safetensors y acompanados de tokenizadores rapidos en JSON para su uso con Candle (mediante el componente `marian_flutter`). El autor declara explicitamente que no reclama la propiedad del modelo entrenado.

Tecnicamente es un modelo Marian de tipo transformer encoder-decoder especializado en una unica direccion de traduccion, con 74.904.134 parametros segun los pesos en safetensors y un repositorio de 0,3 GB. Por su tamano reducido esta pensado para inferencia local en dispositivo (movil o escritorio) mas que para despliegue en servidores de gran escala.

Su relevancia es practica: ofrece una via sencilla de ejecutar traduccion en → sw sin dependencia de la nube, con ficheros de tokenizacion ya preparados para el ecosistema Candle. Los datos de la ficha de HuggingFace no incluyen licencia declarada en los metadatos, por lo que esta debe inferirse del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), text2text-generation |
| Parametros totales | 74.904.134 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el autor no detalla variantes GGUF o int8) |
| Idiomas soportados | Ingles (en) y suajili (sw) |
| Licencia | no disponible en los metadatos de HuggingFace; el autor indica seguir la del modelo original (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es la de los modelos Marian de OPUS-MT: un transformer encoder-decoder clasico orientado a traduccion automatica neuronal, con el tokenizador basado en SentencePiece. El autor ha convertido los tokenizadores SentencePiece originales a JSON de tokenizador rapido de Hugging Face, uno para el lado fuente (`tokenizer-enc.json`) y otro para el lado destino (`tokenizer-dec.json`). Los detalles concretos de hiperparametros de la red (numero de capas, dimension del modelo, cabezas de atencion, vocabulario) no se detallan en la informacion proporcionada.

Malinali no ha entrenado el modelo: unicamente reempaqueta los pesos y adapta los tokenizadores para inferencia en dispositivo con Candle. En consecuencia, no hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF/DPO. El modelo base procede del proyecto OPUS-MT de Helsinki-NLP, que entrena modelos de traduccion a partir de corpus paralelos de OPUS.

## Capacidades

- Traduccion de texto de ingles a suajili (direccion unica en → sw).
- Generacion de texto secuencia a secuencia condicionada (text2text-generation).
- Ejecucion en dispositivo mediante Candle, con tokenizadores rapidos precomputados.
- Compatible con la libreria `transformers` y con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingues limitadas exclusivamente al par ingles-suajili; no se documenta soporte para otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento (thinking mode) en la informacion proporcionada.

## Casos de uso

- Traduccion en dispositivo en aplicaciones moviles: al tener 74,9 M de parametros y un repositorio de 0,3 GB, el modelo puede integrarse en una app para traducir texto en → sw sin conexion a internet ni envio de datos a servidores externos.
- Traduccion de interfaces y contenido de producto (textos de UI, avisos, notificaciones) al suajili, aprovechando el par de tokenizadores ya preparados para Candle.
- Procesamiento por lotes de textos en ingles a suajili en local: util para equipos que necesitan traducir volumenes moderados sin coste por token de API en la nube.
- Prototipado de funciones de traduccion en proyectos Flutter, dado que el paquete esta orientado al componente `marian_flutter` de Malinali.
- Preprocesado de datos multilingues para pipelines de NLP que requieran normalizar corpus ingleses hacia suajili antes de analisis posteriores.
- Traduccion de atencion al cliente o mensajes de soporte en → sw en entornos con restricciones de privacidad, al no requerir salida de datos a un servicio externo.
- Base para experimentacion o ajuste fino adicional sobre el par en → sw, al estar disponible en formato safetensors estandar cargable con `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 74,9 M de parametros, aproximadamente 0,3 GB en FP32 y unos 0,15 GB en FP16, sin contar el overhead del runtime. Cabe de sobra en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 quedan ampliamente sobredimensionados para este tamano. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU y dispositivos moviles.
- Opciones de despliegue: Candle (objetivo principal, via `marian_flutter`), libreria `transformers`, y cualquier runtime compatible con safetensors estandar. Los tags indican compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-sw | 74.904.134 | en → sw | no disponible | no disponible (upstream habitualmente CC-BY 4.0) | HuggingFace, orientado a Candle |
| Helsinki-NLP/opus-mt-en-sw | no disponible | en → sw | no disponible | habitualmente CC-BY 4.0 (segun modelo original) | HuggingFace |
| Otros modelos OPUS-MT (por par de idiomas) | variable (base ~74 M) | pares en → XX | no disponible | habitualmente CC-BY 4.0 | HuggingFace |
| NLLB-200 | hasta ~54 000 M (variante distilled ~600 M) | 200 idiomas, incluye sw | no disponible | CC-BY-NC 4.0 (uso no comercial) | HuggingFace |

Nota: los datos de NLLB y de otros modelos comparables no forman parte de la informacion proporcionada para este modelo y se incluyen solo como referencia de categoria; deben verificarse en sus fichas oficiales antes de usarse.

## Limitaciones y advertencias

- El modelo solo traduce en la direccion ingles → suajili; no soporta la direccion inversa ni otros pares de idiomas.
- Al ser un reempaquetado del modelo original de Helsinki-NLP, hereda cualquier sesgo, error o limitacion de calidad del modelo base; Malinali no aporta datos de entrenamiento propios.
- Riesgo de alucinacion y de traducciones inexactas inherente a los sistemas de traduccion automatica, especialmente fuera de dominio o con textos muy especializados.
- No hay informacion disponible sobre longitud maxima de secuencia o contexto; conviene validar el comportamiento con entradas largas.
- La licencia no esta declarada en los metadatos de HuggingFace: antes de un uso comercial es imprescindible consultar la licencia del modelo original (`Helsinki-NLP/opus-mt-en-sw`), que el autor indica seguir, habitualmente CC-BY 4.0 para OPUS-MT.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay senales de uso en produccion ni de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-02) es posterior a la fecha habitual de publicacion de modelos OPUS-MT; conviene verificar la procedencia y el contenido real de los ficheros.
- Para produccion, conviene evaluar la calidad de traduccion en el dominio concreto, ya que no hay benchmarks publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-en-sw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-sw
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
