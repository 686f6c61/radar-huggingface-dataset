# malinali-app/opus-mt-sv-lg

## Resumen

malinali-app/opus-mt-sv-lg es un paquete de traduccion automatica neuronal sueco → luganda publicado por malinali-app para su aplicacion Malinali. No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos de Helsinki-NLP/opus-mt-sv-lg (familia OPUS-MT), convertidos a safetensors y acompanados de tokenizadores rapidos en formato JSON de Hugging Face, con el objetivo de ejecutar inferencia en dispositivo (on-device) mediante Candle.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder denso con 76.100.450 parametros totales, pensado para traduccion unidireccional. Su relevancia actual es acotada pero concreta: cubre un par de idiomas de muy bajos recursos (sueco → luganda) y lo empaqueta para inferencia local sin dependencia de servidores, lo que encaja con escenarios de conectividad limitada o requisitos de privacidad.

El repositorio no incluye resultados de benchmarks, no declara licencia propia y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que debe considerarse un artefacto sin validacion independiente. Toda la calidad de traduccion heredada proviene del modelo base de Helsinki-NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder denso, text2text-generation) |
| Parametros totales | 76.100.450 (~76,1 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos Marian de OPUS-MT suelen operar con secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no se publican variantes cuantizadas; los pesos se distribuyen en safetensors y pueden convertirse a FP16/int8 con herramientas externas |
| Idiomas soportados | sueco (sv) como idioma origen; luganda (lg) como idioma destino |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors), con tokenizadores JSON (tokenizer-enc.json, tokenizer-dec.json) |

## Arquitectura y entrenamiento

El modelo es un Marian de tipo seq2seq: un encoder y un decoder transformer densos con atencion completa, sin mecanismos de mezcla de expertos ni capas recurrentes. La direccion es estrictamente unidireccional (sv → lg). Al tratarse de un reempaquetado del modelo Helsinki-NLP/opus-mt-sv-lg, la arquitectura y los hiperparametros son los del modelo base; malinali-app no aporta cambios en los pesos segun lo declarado en la model card.

En cuanto al entrenamiento, el repositorio no documenta numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO (los modelos de traduccion OPUS-MT se entrenan habitualmente con aprendizaje supervisado sobre corpus paralelos del proyecto OPUS, pero esa informacion no se detalla aqui y debe consultarse en la ficha del modelo base). La aportacion tecnica de este repositorio es de ingenieria de despliegue: conversion de SentencePiece a tokenizadores rapidos compatibles con Hugging Face y empaquetado de los pesos para el runtime Candle mediante `marian_flutter`, orientado a inferencia local en aplicaciones (incluido movil).

## Capacidades

- Traduccion automatica unidireccional de sueco a luganda, tarea unica del modelo.
- Generacion de texto condicionada a la secuencia de entrada (pipeline `translation`), sin generacion libre conversacional.
- Ejecucion on-device: los pesos en safetensors y los tokenizadores JSON permiten inferencia local con Candle sin llamadas a servicios externos.
- Compatibilidad con la libreria `transformers` de Hugging Face (tag `transformers` y `endpoints_compatible`), ademas del runtime Candle.
- Procesamiento por lotes (batch) de segmentos de texto, segun la API del runtime empleado.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio.
- No hay capacidades multilingues adicionales: solo cubre el par sv → lg. La direccion inversa (lg → sv) no esta soportada por este repositorio.

## Casos de uso

- Traduccion de documentacion tecnica y de producto del sueco al luganda: util para equipos suecos que despliegan software o manuales en Uganda, traduciendo cadenas y parrafos en local antes de publicarlos.
- Aplicaciones moviles sin conectividad: gracias al empaquetado para Candle (`marian_flutter`) y a un peso de repositorio de 0,3 GB, el modelo puede embeberse en una app y traducir sin red, algo critico en zonas con cobertura intermitente.
- Traduccion asistida en el navegador: la conversion a tokenizadores rapidos y pesos safetensors facilita su integracion en componentes de traduccion del lado del cliente para textos cortos.
- Localizacion de contenidos de cooperacion internacional: ONG y agencias que operan entre Suecia y regiones de habla luganda pueden traducir comunicados, formularios y materiales formativos con un flujo automatizado previo a la revision humana.
- Generacion de corpus paralelos sinteticos: el modelo puede producir traducciones iniciales de textos suecos para aumentar datos de entrenamiento de modelos mayores en luganda, siempre con filtrado y revision posteriores.
- Preservacion y documentacion linguistica: traduccion de material de referencia al luganda para repositorios lexicograficos o educativos, donde la disponibilidad de recursos digitales en este idioma es reducida.
- Preprocesado en pipelines de subtitulado o transcripcion: traducir segmentos cortos procedentes de ASR en sueco a luganda como paso intermedio antes de la edicion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF ni comparaciones con otros sistemas, y al registrar 0 descargas no existe evidencia de evaluacion por terceros. Cualquier valor de calidad debe tomarse de la ficha del modelo base Helsinki-NLP/opus-mt-sv-lg, no de este reempaquetado.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 304 MB solo para pesos (76,1 M de parametros × 4 bytes), mas el overhead de activaciones y cache de atencion.
- VRAM en FP16: aproximadamente 152 MB para los pesos.
- VRAM en int8: aproximadamente 76 MB para los pesos.
- GPU: no requiere GPU dedicada. Cabe sobradamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU. Una A100 o H100 estaria completamente infrautilizada salvo por procesamiento masivo en lote.
- CPU: inferencia viable en CPU en solitario; es el escenario natural para este tipo de modelo por su tamano reducido.
- Movil y edge: es el objetivo declarado del paquete, mediante Candle y `marian_flutter` en aplicaciones moviles.
- Opciones de despliegue: Hugging Face `transformers` (pipeline `translation`), Candle (`marian_flutter`), y conversiones externas a CTranslate2 o formatos optimizados para CPU. No se menciona soporte nativo en vLLM, TGI, Ollama o llama.cpp en la informacion proporcionada.
- Latencia y throughput: no disponible. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-sv-lg | 76,1 M | sv → lg (unidireccional) | no disponible | no disponible (hereda la del base) | Hugging Face, empaquetado para Candle |
| Helsinki-NLP/opus-mt-sv-lg | ~76 M (mismo modelo base) | sv → lg (unidireccional) | no disponible | CC-BY 4.0 segun la practica habitual de OPUS-MT | Hugging Face |
| NLLB-200-distilled-600M | 600 M | 200 idiomas, incluidos sueco (swe_Latn) y luganda (lug_Latn) | 512 tokens (declarado por el autor) | CC-BY-NC 4.0 (uso comercial restringido) | Hugging Face, transformers |
| M2M-100 (418M) | 418 M | 100 idiomas; cobertura de luganda no confirmada en la informacion disponible | no disponible | MIT | Hugging Face, transformers |

La comparativa con NLLB y M2M-100 se ofrece como referencia de categoria (traduccion multilingue de bajo coste computacional), pero los datos de cobertura concreta de luganda en M2M-100 no se han verificado en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: la model card remite a la licencia del modelo base, habitualmente CC-BY 4.0 en OPUS-MT, pero conviene confirmarlo antes de cualquier uso comercial.
- Ausencia total de validacion: 0 descargas y 0 likes implican que no hay evidencia publica de calidad, y no se han publicado benchmarks.
- Riesgo de alucinacion y de traduccion infiel: como cualquier modelo seq2seq neuronal, puede generar contenido plausible pero incorrecto, especialmente en terminos tecnicos, nombres propios y frases largas o ambiguas.
- Direccionalidad unica: solo traduce sv → lg; no sirve para lg → sv ni para otros pares de idiomas.
- Idioma de destino de bajos recursos: el luganda cuenta con menos datos paralelos que idiomas mayoritarios, lo que suele traducirse en menor fluidez, cobertura lexica limitada y sesgo hacia construcciones del idioma origen.
- Longitud de contexto no documentada: no se especifica el maximo de tokens de entrada, lo que obliga a validar empiricamente el comportamiento con parrafos largos.
- Es un reempaquetado, no un modelo nuevo: las mejoras o correcciones deben hacerse sobre el modelo base o via fine-tuning propio.
- Sin soporte de instrucciones ni formato conversacional: no es adecuado como asistente general, solo como motor de traduccion.
- Posible brecha de dominio: no hay informacion sobre la composicion del corpus de entrenamiento, por lo que el rendimiento en dominios especializados (legal, medico, tecnico) es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-sv-lg
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-lg
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
