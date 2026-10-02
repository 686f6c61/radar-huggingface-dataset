# malinali-app/opus-mt-rn-es

## Resumen

`malinali-app/opus-mt-rn-es` es un modelo de traduccion automatica neuronal para el par de idiomas kirundi (rn) a espanol (es), publicado por el desarrollador malinali-app como parte del proyecto Malinali, una aplicacion de traduccion on-device. No se trata de un modelo entrenado desde cero: es un reempaquetado del modelo `Helsinki-NLP/opus-mt-rn-es` de Helsinki-NLP, con los pesos en formato safetensors y los tokenizadores SentencePiece convertidos a formato fast tokenizer JSON de Hugging Face, para permitir inferencia local mediante la libreria Candle (concretamente el componente `marian_flutter`).

El modelo emplea la arquitectura Marian, un transformer encoder-decoder desarrollado originalmente por Microsoft Research y adoptado por el proyecto OPUS-MT para traduccion multilingue. Con aproximadamente 48,5 millones de parametros totales, es un modelo compacto y ligero, disenado explicitamente para ejecutarse en dispositivos sin necesidad de GPU dedicada, lo que encaja con el objetivo de Malinali de ofrecer traduccion offline en moviles y entornos embebidos.

Su relevancia actual radica en dos factores: por un lado, cubre un par linguistico de bajos recursos (kirundi, lengua bantu hablada principalmente en Burundi) que apenas cuenta con recursos de traduccion automatica; por otro, su formato optimizado para Candle permite desplegarlo sin depender de infraestructura en la nube. El repositorio tiene muy poca traccion en el momento de la consulta (0 descargas, 0 likes) y la licencia del reempaquetado no esta declarada explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 48.516.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | rn (kirundi), es (espanol) |
| Licencia | no disponible en el repo (el modelo upstream OPUS-MT suele publicarse bajo CC-BY 4.0) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es Marian, una red neuronal secuencia a secuencia de tipo transformer con encoder y decoder, desarrollada por Microsoft Research y ampliamente utilizada en el ecosistema OPUS-MT de Helsinki-NLP para traduccion automatica. En este reempaquetado concreto, el modelo conserva la configuracion Marian original (`config.json` de tipo Marian) y los pesos convertidos a `model.safetensors`. El repositorio incluye dos tokenizadores fast separados, `tokenizer-enc.json` para la lengua origen (kirundi) y `tokenizer-dec.json` para la lengua destino (espanol), derivados de los tokenizadores SentencePiece originales.

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO; estos datos corresponden al modelo upstream `Helsinki-NLP/opus-mt-rn-es` y no se detallan en esta ficha. La innovacion tecnica declarada por el autor no esta en el modelado, sino en el empaquetado: la conversion de SentencePiece a tokenizadores fast compatibles con la libreria Candle y la distribucion de pesos en safetensors para habilitar inferencia on-device a traves de Malinali. El propio autor indica que solo reempaqueta pesos y tokenizadores y que no reclama la propiedad del modelo entrenado.

## Capacidades

- Traduccion de texto de kirundi (rn) a espanol (es), en una unica direccion; no se documenta el sentido inverso en este repositorio.
- Generacion de texto seq2seq (`text2text-generation`) orientada exclusivamente a la tarea de traduccion.
- Inferencia on-device mediante Candle, sin necesidad de conexion a internet ni de servidores externos.
- Compatibilidad con la libreria `transformers` de Hugging Face y con endpoints compatibles (segun los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla del par rn-es.

## Casos de uso

- Traduccion offline en aplicaciones moviles: el modelo, con solo 48,5 millones de parametros, puede integrarse dentro de una app Android o iOS para traducir texto kirundi a espanol sin conexion, gracias a su empaquetado especifico para Candle y `marian_flutter`.
- Atencion a usuarios kirundiparlantes en servicios publicos: traduccion de formularios, avisos o consultas escritas en kirundi al espanol para su procesamiento por personal hispanohablante, en entornos con conectividad limitada.
- Traduccion de documentacion humanitaria y sanitaria: conversion de material escrito en kirundi (por ejemplo, guias de salud o programas de ayuda) a espanol para equipos de cooperacion internacional.
- Procesamiento por lotes de corpus en kirundi: traduccion masiva de textos recopilados en trabajos de campo o investigacion linguistica, dado el bajo coste computacional del modelo.
- Integracion en sistemas de mensajeria o chat: traduccion en tiempo real de mensajes de usuarios, siempre que el modelo se ejecute localmente y se acepte la latencia de un modelo seq2seq pequeno.
- Componente dentro de un pipeline NLP mayor: uso como etapa de traduccion intermedia previa a clasificacion, analisis de sentimiento u otras tareas que operen en espanol.
- Investigacion en traduccion de lenguas de bajos recursos: punto de partida para fine-tuning o evaluacion sobre el par rn-es, dado el escaso numero de modelos disponibles para esta combinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 200 MB para los pesos, mas el overhead de activaciones y tokenizadores; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 50-60 MB de pesos. En 4 bits, en torno a 25-30 MB. Cifras estimadas a partir del numero de parametros; el repositorio no distribuye cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.). Tambien es viable en CPU y en dispositivos moviles.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en aceleradores integrados y CPUs.
- Opciones de despliegue: Candle (via `marian_flutter`), `transformers` de Hugging Face, y cualquier runtime compatible con safetensors. No se documentan recetas oficiales para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 48,5 M de parametros, se espera una latencia baja (del orden de decenas de milisegundos por frase corta en hardware moderno), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rn-es | 48,5 M | rn → es | no disponible | no disponible (upstream CC-BY 4.0 tipico) | Hugging Face, formato safetensors + tokenizers fast |
| Helsinki-NLP/opus-mt-rn-es | no disponible en esta ficha | rn → es | no disponible | CC-BY 4.0 (tipico de OPUS-MT) | Hugging Face, transformers |
| Otros modelos OPUS-MT bilingues (p. ej. pares europeos de Helsinki-NLP) | rango tipico de 40-80 M | par especifico | no disponible | CC-BY 4.0 | Hugging Face |

La comparativa se limita al modelo upstream y a la familia OPUS-MT, dado que no se dispone de datos de benchmarks ni de otros modelos especificos para el par rn-es en la informacion proporcionada.

## Limitaciones y advertencias

- Traduccion unidireccional: el repositorio documenta unicamente la direccion rn → es; no se garantiza el funcionamiento en sentido inverso.
- Recursos limitados para el par linguistico: el kirundi es una lengua de bajos recursos, por lo que la calidad de traduccion puede ser inferior a la de pares con mas corpus, especialmente en dominios especializados.
- Riesgo de alucinacion y de traducciones inexactas: como cualquier modelo seq2seq, puede generar contenido no presente en el texto original, sobre todo con entradas ambiguas o fuera de dominio.
- Licencia no declarada en el reempaquetado: el autor remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 para OPUS-MT), por lo que conviene verificar la model card original antes de un uso comercial.
- Trazabilidad: al ser un reempaquetado, las mejoras o correcciones deben aplicarse sobre el modelo original; el autor indica que no reclama la propiedad del modelo entrenado.
- Sin datos de contexto maximo, cuantizacion ni benchmarks publicos: la evaluacion en produccion requiere pruebas propias.
- Sin soporte documentado para tool calling, agentes ni otras capacidades mas alla de la traduccion.

## Enlaces

- Hugging Face (reempaquetado): https://huggingface.co/malinali-app/opus-mt-rn-es
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-rn-es
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
