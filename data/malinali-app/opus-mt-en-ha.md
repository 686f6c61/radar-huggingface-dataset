# malinali-app/opus-mt-en-ha

## Resumen

`malinali-app/opus-mt-en-ha` es un paquete de pesos de traducción automática para el par inglés-hausa (en → ha) publicado por el desarrollador `malinali-app`. No se trata de un modelo entrenado desde cero: es una redistribución de los pesos del modelo `Helsinki-NLP/opus-mt-en-ha` de OPUS-MT, convertidos al formato `safetensors` y acompañados de tokenizadores rápidos en JSON pensados para su ejecución en dispositivos (on-device) mediante Candle a través del componente `marian_flutter` de la aplicación Malinali.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder denso de traducción, con 74.462.441 parámetros totales (aproximadamente 74,5 millones) y un tamaño de repositorio de 0,3 GB. Está etiquetado como `text2text-generation` y `translation`, y su propósito es claro: ofrecer un traductor bilingüe inglés-hausa ligero, ejecutable localmente sin depender de servicios en la nube, integrado en la aplicación Malinali.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de empaquetado de modelos para inferencia local en móvil o escritorio usando Candle en lugar de los runtimes habituales de Python. Por otro, conviene subrayar que se publica como *repackaging*: el autor declara explícitamente que no reclama la propiedad del modelo entrenado y remite a la licencia del modelo original. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 74.462.441 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles), ha (hausa) |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica seguir la licencia del modelo original, tipicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`) + tokenizadores rapidos JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` |

Datos adicionales: autor `malinali-app`; biblioteca `transformers`; pipeline `translation`; modelo base `Helsinki-NLP/opus-mt-en-ha`; tamano del repositorio 0,3 GB; descargas 0; likes 0; fecha de creacion 2026-10-02; fecha de actualizacion 2026-10-02.

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer seq2seq con encoder y decoder, orientado exclusivamente a traduccion automatica neuronal. Se trata de un modelo denso (no MoE ni SSM) de aproximadamente 74,5 millones de parametros, coherente con la familia de modelos bilingues de OPUS-MT, que suelen ser compactos para permitir despliegue eficiente. Al ser un modelo de traduccion bilingue, la direccion esta fijada a en → ha y el vocabulario se gestiona con tokenizadores SentencePiece; en este repositorio, el autor los ha convertido a formato de tokenizador rapido de Hugging Face (un tokenizador para la fuente y otro para el destino).

En cuanto al entrenamiento, esta ficha no aporta informacion sobre el numero de tokens, la composicion del conjunto de datos, ni si hubo fases de RLHF o DPO, ya que el modelo es una redistribucion y el autor no documenta el proceso de entrenamiento original. La unica innovacion tecnica declarada por el autor es de empaquetado: la conversion de los pesos a safetensors y de SentencePiece a tokenizadores rapidos JSON para su uso con Candle (`marian_flutter`), lo que habilita inferencia on-device. Para los detalles de entrenamiento del modelo subyacente hay que remitirse a la model card original de Helsinki-NLP.

## Capacidades

- Traduccion automatica directa de ingles a hausa (en → ha).
- Generacion de texto de tipo seq2seq (`text2text-generation`) restringida a la tarea de traduccion; no es un modelo conversacional.
- Ejecucion local en dispositivo mediante Candle a traves del componente `marian_flutter`, sin depender de API remota.
- Compatibilidad con la libreria `transformers` para uso estandar en Python.
- Uso de tokenizadores rapidos separados para fuente y destino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modos de "thinking".
- Capacidad multilingue limitada a los dos idiomas del par (ingles y hausa); no es un modelo multilingue general.

## Casos de uso

- Traduccion on-device en aplicaciones moviles: al ser un modelo de ~74,5 millones de parametros (pesos en safetensors de poco mas de 0,3 GB en el repositorio), puede integrarse en la app Malinali o en aplicaciones similares para traducir ingles-hausa sin conexion, protegiendo la privacidad del texto del usuario.
- Traduccion de contenidos para comunidades hausaparlantes: conversion de documentacion, articulos o material educativo del ingles al hausa, con la ventaja de poder procesarse localmente y a bajo coste.
- Preprocesado en pipelines de datos: traduccion masiva de corpus en ingles hacia hausa como paso previo a tareas de analisis, indexacion o busqueda en hausa.
- Subtitulado y localizacion ligera: traduccion de cadenas cortas de interfaz, subtitulos o textos breves donde el modelo bilingue compacto ofrece baja latencia.
- Integracion en herramientas de escritorio con Candle: al estar empaquetado para Candle, encaja en aplicaciones nativas que evitan el stack de Python, reduciendo dependencias de despliegue.
- Educacion y aprendizaje de idiomas: asistencia de traduccion en aplicaciones de aprendizaje ingles-hausa, aprovechando la inferencia local para dar respuestas inmediatas.
- Investigacion en traduccion de bajos recursos: el hausa es un idioma con menos recursos que los idiomas europeos, y un modelo bilingue dedicado de este tamano es util como linea base en experimentos de traduccion de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la ficha de HuggingFace ni la model card proporcionan metricas como BLEU, chrF, MMLU, HumanEval o GSM8K. Los resultados de busqueda web suministrados no guardan relacion con el modelo. Para conocer el rendimiento del modelo original puede consultarse la documentacion de OPUS-MT, pero no se dispone de cifras verificables en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 74.462.441 parametros; no confirmada por el autor):
  - fp32: aproximadamente 298 MB solo para pesos.
  - fp16 / bf16: aproximadamente 149 MB solo para pesos.
  - int8: aproximadamente 74 MB solo para pesos.
  - int4: aproximadamente 37 MB solo para pesos.
- A estas cifras hay que anadir memoria para activaciones, tokens de entrada y buffers del runtime, por lo que el consumo real sera superior.
- GPU recomendadas: dado el tamano, no requiere GPU dedicada de gama alta; funciona en CPU y en cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40). Aceleradores como A100 o H100 son innecesarios y desproporcionados para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en dispositivos moviles, que es precisamente el objetivo del paquete (Candle / `marian_flutter`).
- Opciones de despliegue: Candle mediante `marian_flutter` (on-device); libreria `transformers` en Python. No se documenta soporte de GGUF, vLLM, TGI, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Tipos de cuantizacion soportados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion / idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-ha | 74,46 M | en → ha | no disponible | no disponible en la ficha; upstream tipicamente CC-BY 4.0 | HuggingFace (repositorio con 0 descargas) |
| Helsinki-NLP/opus-mt-en-ha | ~74 M (arquitectura Marian comparable) | en → ha | no disponible | CC-BY 4.0 segun la convencion de OPUS-MT | HuggingFace (modelo base de este repositorio) |
| facebook/nllb-200-distilled-600M | ~600 M | Multilingue, 200 idiomas, incluido hausa | no disponible | CC-BY-NC-4.0 (uso no comercial) | HuggingFace |

Notas: los datos de `facebook/nllb-200-distilled-600M` corresponden a conocimiento general sobre ese modelo y no provienen de la informacion facilitada, por lo que deben verificarse en su ficha oficial. La comparativa mas directa del modelo reseñado es con su propio modelo base (el repositorio no introduce cambios en los pesos entrenados, sino en el formato y el empaquetado). Frente a NLLB, este modelo es mucho mas ligero pero solo cubre un par de idiomas y no incluye licencia comercial confirmada.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de traduccion neuronal, puede generar traducciones incorrectas, inventar terminos o producir salidas incoherentes en entradas ambiguas, muy largas o fuera de dominio.
- Cobertura limitada: unicamente traduce en → ha; no soporta otras direcciones ni otros idiomas, ni es un modelo multilingue general.
- Sesgos: no hay informacion sobre los sesgos del modelo. Al proceder de corpus OPUS (mayoritariamente textos paralelos de dominio publico, religioso y web), puede reflejar sesgos de dominio y de genero presentes en esos datos.
- Contexto e idioma: la longitud de contexto no esta documentada en la informacion disponible; entradas largas pueden truncarse o degradar la calidad.
- Licencia: la ficha de HuggingFace no declara una licencia propia. La model card remite a la licencia del modelo original, que para OPUS-MT suele ser CC-BY 4.0, pero este extremo no queda confirmado de forma explicita en los datos facilitados. Antes de un uso comercial deben verificarse la licencia upstream y las condiciones de atribucion.
- Estado del repositorio: 0 descargas y 0 likes, con fechas de creacion y actualizacion de 2026-10-02. Es un paquete muy reciente y sin adopcion documentada, por lo que su estabilidad y mantenimiento a largo plazo no estan contrastados.
- Repackaging, no modelo nuevo: el autor indica que solo reempaqueta pesos y convierte tokenizadores, y que no reclama la propiedad del modelo entrenado. Cualquier evaluacion de calidad debe apoyarse en el modelo base de Helsinki-NLP.
- Entrenamiento no documentado: no se aportan datos sobre tokens, composicion del dataset, ni fases de alineacion (RLHF/DPO), lo que dificulta auditar el comportamiento del sistema.
- Para produccion: conviene validar con un conjunto propio de pruebas (BLEU/chrF) y comprobar el comportamiento en textos largos, terminologia especializada y variantes dialectales del hausa antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-en-ha
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ha
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app

Los resultados de busqueda web proporcionados no contienen enlaces relevantes relacionados con este modelo.
