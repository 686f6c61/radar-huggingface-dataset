# malinali-app/opus-mt-swc-sv

## Resumen

`malinali-app/opus-mt-swc-sv` es un paquete de traduccion automatica neuronal publicado por el proyecto Malinali que empaqueta los pesos del modelo `Helsinki-NLP/opus-mt-swc-sv` en formato safetensors, junto con tokenizadores rapidos listos para su uso con Candle (a traves del componente `marian_flutter`). El modelo traduce de swc (suajili del Congo) a sv (sueco) en una unica direccion.

La arquitectura subyacente es Marian, un transformer secuencia-a-secuencia encoder-decoder desarrollado originalmente por el grupo Helsinki-NLP en el marco del proyecto OPUS-MT. Cuenta con 75.357.626 parametros totales, lo que lo situa en la categoria de modelos compactos optimizados para inferencia en dispositivo (on-device). Malinali no reclama autoria sobre el modelo entrenado: su aportacion consiste en reempaquetar los pesos y convertir los tokenizadores SentencePiece originales a formato JSON de tokenizador rapido de Hugging Face.

Su relevancia actual radica en que facilita el despliegue local de traduccion neuronal de bajo consumo para un par de idiomas de bajos recursos (suajili del Congo hacia sueco) sin necesidad de infraestructura en la nube, algo util para aplicaciones moviles o integradas. El repositorio, de 0,3 GB, contiene el config de Marian, los pesos en safetensors y dos tokenizadores (uno de origen y otro de destino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer secuencia-a-secuencia encoder-decoder) |
| Parametros totales | 75.357.626 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | swc (suajili del Congo), sv (sueco) |
| Licencia | no disponible (la model card indica seguir la licencia del modelo original, tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Direccion de traduccion | swc a sv |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, una familia de transformers encoder-decoder disenada especificamente para traduccion automatica dentro del proyecto OPUS-MT de Helsinki-NLP. La configuracion se distribuye mediante `config.json`, y los pesos en `model.safetensors`. El paquete incorpora dos tokenizadores SentencePiece convertidos a formato JSON de Hugging Face: `tokenizer-enc.json` para el idioma de origen (swc) y `tokenizer-dec.json` para el de destino (sv).

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset (mas alla de su origen en OPUS), ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del reempaquetado para Candle. La model card indica explicitamente que Malinali solo redistribuye los pesos y convierte el tokenizador, sin reclamar propiedad sobre el modelo entrenado.

## Capacidades

- Traduccion de texto de swc (suajili del Congo) a sv (sueco) en una unica direccion.
- Generacion de texto condicionada (pipeline `text2text-generation`).
- Inferencia en dispositivo (on-device) mediante Candle, sin dependencia de servicios en la nube.
- Integracion con la libreria transformers de Hugging Face gracias a los tokenizadores rapidos incluidos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Modelo monolingue en su par de idiomas: no se han declarado capacidades multilingues adicionales mas alla de swc y sv.

## Casos de uso

- Traduccion en aplicaciones moviles sin conexion: dado su tamano reducido (75,4 M de parametros) y su empaquetado para Candle, puede embeberse en una app para traducir texto de suajili del Congo a sueco localmente, sin enviar datos a un servidor.
- Atencion al cliente multilingue: permite traducir consultas o mensajes de usuarios en swc a sv para que un equipo de soporte sueco pueda procesarlos, integrándose en un flujo de ticketing.
- Procesamiento de documentacion humanitaria: util para ONGs o administraciones que gestionan contenido en suajili del Congo y necesitan versiones en sueco para informes o publicaciones.
- Traduccion de contenido web o editorial: para portales que publican material en suajili del Congo y quieren ofrecer una version en sueco sin coste de API.
- Preprocesamiento en pipelines de PLN: como etapa de traduccion previa a tareas de analisis de sentimiento, clasificacion o resumen en sueco.
- Traduccion de subtitulos o transcripciones: conversion rapida de guiones o subtitulos de swc a sv en herramientas de postproduccion.
- Prototipado e investigacion: al ser un paquete ligero basado en safetensors y transformers, sirve como base para experimentos de traduccion de bajos recursos o para comparar con otros modelos OPUS-MT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,4 M de parametros, el modelo ocupa aproximadamente 0,3 GB en FP32 y en torno a 0,15 GB en FP16, por lo que la memoria necesaria es minima.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada de gama media pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: transformers (Hugging Face), Candle (a traves de `marian_flutter`), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no confirmado en la informacion). vLLM o TGI serian tecnicamente posibles, aunque sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| malinali-app/opus-mt-swc-sv | 75,4 M | swc a sv | no disponible | no disponible (upstream CC-BY 4.0 tipicamente) | safetensors |
| Helsinki-NLP/opus-mt-swc-sv | no disponible en la informacion | swc a sv | no disponible | no disponible | no disponible |
| Helsinki-NLP/opus-mt-swc-en | no disponible en la informacion | swc a en | no disponible | no disponible | no disponible |
| NLLB-200 (Meta) | variable (hasta 54,5 B para la variante mas grande) | multilingue (200 idiomas) | 512 tokens | CC-BY-NC 4.0 (variante grande) | safetensors / otros |

La comparacion con NLLB-200 se incluye unicamente como referencia de categoria (traduccion automatica multilingue); no se dispone de resultados comparativos de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Direccionalidad unica: el modelo solo traduce de swc a sv; no soporta el sentido inverso ni otros pares de idiomas.
- Idiomas de bajos recursos: el suajili del Congo cuenta con menos datos de entrenamiento que idiomas mayoritarios, lo que puede traducirse en una calidad inferior y mayor variabilidad en los resultados.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en frases largas, ambiguas o con terminologia especializada.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada, pero al derivar de corpus OPUS puede heredar sesgos presentes en los datos de origen.
- Licencia: la model card no especifica una licencia propia y remite a la del modelo original (Helsinki-NLP/opus-mt-swc-sv), que tipicamente es CC-BY 4.0. Es imprescindible verificar la licencia upstream antes de un uso comercial.
- Uso en produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion comunitaria; conviene evaluarlo en el dominio concreto antes de desplegarlo.
- Limitaciones de contexto: no se ha documentado la longitud maxima de secuencia; para entradas largas sera necesario segmentar el texto.
- Malinali no reclama autoria del modelo entrenado: cualquier garantia de calidad recae en el modelo original de Helsinki-NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-swc-sv
- Modelo base (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-swc-sv
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Sitio del proyecto Malinali: https://malinali.app
