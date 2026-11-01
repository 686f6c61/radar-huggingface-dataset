# SacredSAMF/mediakit-opus-mt-onnx

## Resumen

`SacredSAMF/mediakit-opus-mt-onnx` es un paquete de 31 modelos de traduccion automatica de la familia Opus-MT (desarrollados originalmente por Helsinki-NLP) convertidos a formato ONNX y cuantizados a int8. El repositorio no entrena ningun modelo nuevo: empaqueta conversiones de modelos Marian existentes para su uso en inferencia local con ONNX Runtime, concretamente dentro de la aplicacion de escritorio MediaKit para Windows, orientada a subtitulos.

El interes practico esta en la distribucion: cada direccion de traduccion se sirve como una carpeta autocontenida con encoder, decoder fusionado con cache KV, tokenizadores SentencePiece, vocabulario, configuracion Marian y un `manifest.json` con tamanos y hashes SHA-256 para verificacion de integridad. El conjunto cubre traduccion bidireccional entre ingles y ruso, aleman, espanol, frances, portugues, japones, polaco y turco, con un total de aproximadamente 4,7 GB.

Es relevante para quien necesite traduccion neuronal offline, sin enviar texto a servidores externos y con requisitos de hardware modestos, a costa de renunciar a la calidad de los modelos neuronales grandes actuales. La licencia es mixta: cada modelo conserva la licencia del original de Helsinki-NLP (Apache-2.0 o CC BY 4.0), por lo que los terminos varian segun la direccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (Opus-MT) |
| Parametros totales | no disponible (no se publica el recuento por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante publicada) |
| Idiomas soportados | en, de, es, fr, ja, pl, pt, ru, tr |
| Licencia | mixta: Apache-2.0 y CC BY 4.0 segun el modelo de origen |
| Formato de pesos | ONNX (encoder y decoder fusionado con KV cache), SentencePiece (.spm), vocab.json |

## Arquitectura y entrenamiento

Los modelos subyacentes son Marian, la arquitectura transformer encoder-decoder que Helsinki-NLP uso para la familia Opus-MT. El repositorio no aporta datos de entrenamiento propios: la model card remite a los checkpoints originales de Helsinki-NLP con commits concretos, y no documenta numero de tokens, composicion del corpus ni si hubo RLHF o DPO. Los modelos Opus-MT originales se entrenaron sobre corpus paralelos publicos (OPUS, Tatoeba, entre otros), pero esa informacion no se detalla en la informacion disponible.

La innovacion tecnica del paquete es de ingenieria de despliegue: conversion a ONNX con cuantizacion int8, y un decoder unico (`decoder_model_merged.onnx`) que gestiona tanto el primer paso como los siguientes mediante una cache KV encapsulada en un nodo `If`. Esto simplifica el grafo de inferencia y reduce el numero de ficheros a cargar. Los tokenizadores SentencePiece, el vocabulario y la configuracion Marian se mantienen sin modificar. El autor indica que los ficheros no contienen nada especifico de MediaKit y que se probaron con ONNX Runtime 1.31.

## Capacidades

- Traduccion automatica de texto entre ingles y ocho idiomas: ruso, aleman, espanol, frances, portugues, japones, polaco y turco, en ambas direcciones para la mayoria de pares.
- Modelos multilingues auxiliares: `opus-mt-ROMANCE-en` (pt/es/fr a en) y `opus-mt-en-ROMANCE` (en a pt/es/fr), marcados como "Compact".
- Ejecucion totalmente local con ONNX Runtime, sin llamadas de red durante la inferencia.
- Verificacion de integridad mediante `manifest.json` con tamano y SHA-256 por fichero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No dispone de modo "thinking" ni de capacidades generativas mas alla de la traduccion secuencia a secuencia.
- Sin soporte de contexto largo documentado; pensado para segmentos cortos (subtitulos).

## Casos de uso

- Subtitulado local de video: el escenario de diseno de MediaKit. Se descarga la carpeta del par de idiomas, se verifica el SHA-256 de cada fichero y se traducen las lineas de subtitulo en el equipo del usuario sin que el texto salga del sistema.
- Traduccion offline en entornos air-gapped: equipos sin acceso a Internet (sanidad, defensa, planta industrial) pueden integrar ONNX Runtime y estos modelos para traducir documentacion o correspondencia sin depender de APIs externas.
- Preprocesado de corpus multilingues: traduccion por lotes de textos cortos a un idioma pivote (por ejemplo, todo a ingles) antes de indexar en un buscador o entrenar un modelo posterior.
- Aplicaciones de escritorio con requisitos de privacidad: al ejecutarse en CPU con ONNX Runtime, el modelo encaja en apps donde el RGPD o la politica interna prohibe enviar contenido a terceros.
- Traduccion de mensajes en herramientas de soporte: para pares de idiomas bien cubiertos (es-en, de-en, fr-en) con calidad "Good", se puede ofrecer traduccion instantanea de tickets sin coste por token.
- Prototipado y evaluacion de pipelines de traduccion: el conjunto permite comparar variantes "Good" y "Compact" del mismo par con infraestructura minima, util para decidir que modelo desplegar en produccion.
- Investigacion en eficiencia de inferencia: la estructura de decoder fusionado con KV cache en un nodo `If` sirve como referencia para estudiar tecnicas de exportacion ONNX en modelos seq2seq.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una clasificacion cualitativa de calidad basada en chrF sobre Tatoeba: "Good" (mejor modelo Opus-MT de la direccion), "Compact" (mas pequeno y rapido, 1-4 chrF por debajo) y "Experimental" (japones, que genera texto inventado en fragmentos sin puntuacion). No se proporcionan cifras concretas de chrF, BLEU ni latencia.

## Requisitos de hardware

- VRAM: no aplica en el caso tipico; los modelos estan pensados para ejecucion en CPU con ONNX Runtime. En GPU, el consumo seria minimo dado el tamano de los ficheros (138-368 MB por modelo).
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime bastaria, pero el diseno apunta a CPU.
- Compatibilidad con GPU de consumo: si, cualquier tarjeta moderna con soporte de ONNX Runtime; en la practica no es necesaria.
- Despliegue: ONNX Runtime (probado con la version 1.31). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: 4,7 GB para el conjunto completo; cada modelo individual ocupa entre 138 MB y 368 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Formato |
|---|---|---|---|---|---|
| mediakit-opus-mt-onnx (este) | no disponible | no disponible | chrF "Good" en pares principales; japones experimental | Apache-2.0 / CC BY 4.0 segun modelo | ONNX int8 |
| Helsinki-NLP/opus-mt-* (original) | no disponible | no disponible | Referencia de la que deriva este paquete | Apache-2.0 / CC BY 4.0 | PyTorch (safetensors/bin) |
| NLLB-200 (Meta) | hasta 54.500 M | 512 tokens | Superior en muchos pares, 200 idiomas | CC BY-NC 4.0 (no comercial) | PyTorch, CTranslate2 |
| M2M-100 (Meta) | 418 M / 1.200 M | no disponible | Calidad inferior a NLLB en pares grandes | MIT | PyTorch |

La comparacion con NLLB y M2M-100 es orientativa por categoria (traduccion neuronal multilingue); no se dispone de evaluaciones cruzadas en la informacion proporcionada. La ventaja de este paquete es la ligereza y la ejecucion local en CPU; su desventaja, la calidad inferior frente a modelos mas grandes y la cobertura limitada a nueve idiomas.

## Limitaciones y advertencias

- Calidad acotada: son modelos Opus-MT de tamano pequeno; en dominios especializados (juridico, medico, tecnico) la fidelidad puede ser insuficiente.
- Japones marcado como "Experimental": el autor advierte que genera texto inventado en fragmentos sin puntuacion, lo que lo desaconseja para produccion.
- Sin cifras de benchmarks publicadas: no se puede verificar la calidad de forma cuantitativa a partir de la informacion disponible.
- Licencia mixta: Apache-2.0 y CC BY 4.0 conviven en el repositorio; es obligatorio revisar la licencia de cada modelo concreto antes de uso comercial y cumplir la atribucion cuando corresponda CC BY 4.0.
- Riesgo de alucinacion en traduccion: como todo modelo neuronal seq2seq, puede omitir, duplicar o inventar contenido, especialmente con entradas mal segmentadas.
- Sesgos: no documentados en la model card; heredados de los corpus de entrenamiento originales de Opus-MT.
- Sin soporte de contexto largo ni de documentos completos: el diseno apunta a segmentos cortos tipo subtitulo.
- Dependencia de ONNX Runtime 1.31 para el comportamiento validado; versiones distintas no estan garantizadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SacredSAMF/mediakit-opus-mt-onnx
- Helsinki-NLP (organizacion de origen): https://huggingface.co/Helsinki-NLP
- Ejemplo de modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Ejemplo de modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Ejemplo de modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-fr
- ONNX Runtime: https://onnxruntime.ai/
- Paper de Marian: https://arxiv.org/abs/1804.00344
- OPUS, corpus paralelos: https://opus.nlpl.eu/
- Tatoeba: https://tatoeba.org/
