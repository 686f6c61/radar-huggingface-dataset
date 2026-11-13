# byumatrixlab/mapudungun-nllb-1.3B-arn-es-joint-bpe

## Resumen

El modelo `mapudungun-nllb-1.3B-arn-es-joint-bpe` es un ajuste fino de `facebook/nllb-200-distilled-1.3B` orientado a la traduccion automatica entre mapudungun (codigo ISO `arn`) y espanol (`es`). Lo desarrolla el grupo `byumatrixlab` en el contexto de un trabajo academico presentado en AmericasNLP 2026, centrado en tokenizacion consciente de la morfologia para lenguas de bajos recursos. El problema que aborda es la escasez de sistemas de traduccion de calidad para el mapudungun, una lengua indigena de Chile y Argentina con poca representacion en corpus paralelos.

La contribucion tecnica principal es el uso de un tokenizador SentencePiece BPE conjunto para mapudungun y espanol, en lugar del vocabulario original de NLLB-200. El checkpoint se presenta como "paper-era archived checkpoint", es decir, la version exacta utilizada para generar los resultados del articulo. El modelo reporta un chrF++ medio a nivel de frase de 44,68 para la direccion mapudungun a espanol en esta condicion.

Con 1.370.637.312 parametros y un tamano de repositorio de 5,5 GB, es un modelo compacto que puede ejecutarse en hardware modesto, lo que resulta relevante para instituciones con recursos limitados que trabajen en preservacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200 distilled) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | other (`nllb-and-corpus-derived-terms`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder de la familia M2M-100 con 1.300 millones de parametros aproximadamente. El ajuste fino se realiza sobre un corpus derivado de la coleccion de mapudungun de Duan et al., y la innovacion metodologica descrita en el articulo es el reemplazo del tokenizador por un SentencePiece BPE conjunto entrenado sobre mapudungun y espanol, con el objetivo de capturar mejor la morfologia aglutinante del mapudungun.

La model card indica que el pipeline de inferencia aplica un preprocesamiento especifico para mapudungun y elimina los marcadores de continuacion `@@` de la salida en mapudungun. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO. El checkpoint corresponde a la version archivada de la era del articulo.

## Capacidades

- Traduccion automatica unidireccional y bidireccional entre mapudungun y espanol (la evaluacion reportada se centra en `arn` a `es`).
- Tokenizacion BPE conjunta entrenada para ambas lenguas, con tratamiento de la morfologia del mapudungun.
- Preprocesamiento y postprocesamiento especificos para mapudungun integrados en el script `inference.py`.
- Compatible con la libreria Transformers 4.x.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Capacidades multilingues limitadas a los dos idiomas del ajuste.

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales educativos, sanitarios o administrativos del espanol al mapudungun para programas de divulgacion en comunidades mapuche, aprovechando el ajuste especifico al dominio linguistico.
- Preservacion y digitalizacion de textos: conversion de corpus escritos en mapudungun a espanol para su catalogacion en archivos digitales, con el preprocesamiento morfologico del modelo como ventaja frente a NLLB generico.
- Investigacion en linguistica computacional: uso como linea base reproducible para experimentos de traduccion de lenguas de bajos recursos, dado que el checkpoint corresponde exactamente al del articulo publicado.
- Herramientas de traduccion asistida para hablantes: integracion en editores o interfaces que ofrezcan sugerencias de traduccion a traductores humanos que trabajen con mapudungun.
- Subtitulado y transcripcion de contenido audiovisual: traduccion de subtitulos en espanol a mapudungun para medios comunitarios, con el modelo ejecutandose en hardware de gama media.
- Educacion bilingue: generacion de glosas y traducciones de apoyo en materiales didacticos de escuelas con programas de interculturalidad.
- Evaluacion comparativa de tokenizadores: uso del modelo para estudiar el impacto de la tokenizacion conjunta en lenguas aglutinantes, replicando la metodologia del articulo.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 44,68 | arn a es, tamano 1.3B, tokenizacion BPE conjunta |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo para pesos, mas overhead de activaciones.
- En fp16/bf16: aproximadamente 2,8 GB para pesos, viable en GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070).
- En cuantizacion de 8 bits: alrededor de 1,4 GB, ejecutable en GPUs con 4-6 GB.
- GPU recomendadas para produccion: A100, H100 o L4 para alto throughput; RTX 4090 o A10G para despliegues de volumen medio.
- Cabe en GPU consumer: si, en modelos con 6-8 GB de VRAM o superiores.
- Opciones de despliegue: Transformers con el script `inference.py` incluido; vLLM, TGI y llama.cpp no estan documentados en la informacion disponible para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-joint-bpe | 1,37B | arn, es | no disponible | other (NLLB + corpus) | chrF++ 44,68 en arn a es |
| facebook/nllb-200-distilled-1.3B | 1,3B | 200 idiomas | no disponible | CC-BY-NC 4.0 | Modelo base; sin ajuste especifico a mapudungun |
| facebook/nllb-200-3.3B | 3,3B | 200 idiomas | no disponible | CC-BY-NC 4.0 | Mayor capacidad pero sin tokenizacion adaptada |
| m2m100_418M | 418M | 100 idiomas | no disponible | MIT | Alternativa mas ligera, sin ajuste a mapudungun |

## Limitaciones y advertencias

- La licencia es `other` y combina las obligaciones de NLLB-200 (CC-BY-NC 4.0, uso no comercial) y del corpus de Duan et al. (CC BY-NC-SA 3.0, no comercial y compartir igual). El uso comercial esta restringido por ambas fuentes.
- El modelo solo cubre mapudungun y espanol; no es un traductor multilingue general.
- La evaluacion reportada se limita a chrF++ en la direccion arn a es; el rendimiento en es a arn no se detalla en la informacion disponible.
- Riesgo de alucinacion y de traducciones inexactas en terminologia especializada o variantes dialectales del mapudungun.
- El corpus de entrenamiento es de bajos recursos, por lo que la cobertura lexica y de registro es limitada.
- Requiere Transformers 4.x y el preprocesamiento especifico del repositorio; el uso directo con el tokenizador original de NLLB puede degradar la calidad.
- No se documentan sesgos especificos, pero al derivar de NLLB-200 puede heredar sesgos del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-joint-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Articulo citado: Thompson, Rogers y Ringger, "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (enlace no disponible en la informacion proporcionada).
