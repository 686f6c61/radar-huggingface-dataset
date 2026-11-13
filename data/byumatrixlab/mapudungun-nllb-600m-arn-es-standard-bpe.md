# byumatrixlab/mapudungun-nllb-600M-arn-es-standard-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-standard-bpe` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-600M` de Meta AI, especializado en traduccion automatica del mapudungun (`arn`) al espanol (`es`). Lo publica el usuario `byumatrixlab` como parte de un trabajo academico (Thompson, Rogers y Ringger, AmericasNLP 2026) centrado en tokenizacion morfologica para lenguas indigenas de America. El modelo resuelve un problema clasico de las lenguas de bajos recursos: la fragmentacion excesiva de palabras aglutinantes en el tokenizador de NLLB y la consiguiente perdida de calidad en la traduccion.

La arquitectura es la del NLLB-200 distilled, un transformer encoder-decoder de tipo M2M-100 con 615.072.768 parametros totales (segun los pesos en safetensors del repositorio). Esta variante concreta usa el tokenizador SentencePiece nativo de NLLB-200 sin presegmentacion externa (condicion "standard BPE"), a diferencia de otras variantes del mismo autor que aplican segmentacion morfologica previa. El resultado declarado es un chrF++ medio a nivel de frase de 43,49 en la direccion arn->es.

Su relevancia actual es doble: por un lado, aporta un recurso funcional para una lengua con muy pocos sistemas de traduccion publicados; por otro, sirve como punto de comparacion reproducible frente a estrategias de tokenizacion alternativas. La licencia es restrictiva (derivada de CC-BY-NC 4.0 y CC BY-NC-SA 3.0), lo que limita su uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200 distilled) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 usa segmentos de hasta 512 tokens por defecto; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | `other` — `nllb-and-corpus-derived-terms` (CC-BY-NC 4.0 del modelo base + CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |
| Direccion de traduccion | arn -> es |
| Tokenizador | SentencePiece nativo de NLLB-200, sin presegmentacion externa ("standard BPE") |
| Metrica declarada | chrF++ medio a nivel de frase: 43,49 |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder denso de la familia NLLB-200 (sucesora de M2M-100) entrenado originalmente por Meta con cobertura de 200 lenguas. La variante distilled reduce el tamano respecto al NLLB-200 completo manteniendo el esquema de embeddings multilingues y el tokenizador SentencePiece compartido. Sobre ese checkpoint se aplica un ajuste fino supervisado para la direccion arn->es.

La innovacion tecnica del trabajo no reside en la arquitectura, sino en la tokenizacion: el articulo estudia el efecto de distintas estrategias de segmentacion sobre una lengua aglutinante como el mapudungun. Esta variante concreta corresponde a la condicion de control, es decir, el tokenizador estandar de NLLB sin presegmentacion morfologica externa, lo que permite aislar la contribucion de las variantes morfologicas del mismo autor. El checkpoint se describe como un "corrected original-data retrain", es decir, un reentrenamiento sobre los datos originales tras corregir el pipeline experimental. No se detalla en la model card el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO; el corpus de ajuste deriva del corpus Mapudungun de Duan et al.

## Capacidades

- Traduccion automatica unidireccional de mapudungun a espanol.
- Manejo de texto mapudungun con el tokenizador SentencePiece nativo de NLLB, sin necesidad de presegmentacion manual.
- Eliminacion de marcadores de continuacion `@@` en la salida mapudungun mediante el script auxiliar `inference.py`.
- Integracion con la libreria `transformers` 4.x mediante `pipeline("translation")`.
- Capacidades multilingues heredadas del modelo base: al ser un ajuste fino de NLLB-200, conserva potencialmente el resto de lenguas del checkpoint original, aunque no se documenta ni se garantiza su calidad tras el ajuste.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales educativos, sanitarios o administrativos del mapudungun al espanol para su difusion en contextos urbanos, aprovechando el ajuste especifico sobre el corpus de Duan et al.
- Investigacion en traduccion de lenguas de bajos recursos: uso como linea base reproducible (condicion "standard BPE") para comparar contra variantes con tokenizacion morfologica del mismo autor y cuantificar la ganancia de cada estrategia.
- Preservacion y digitalizacion de corpus orales transcritos: conversion de transcripciones en mapudungun a espanol para indexacion, busqueda y catalogacion en archivos linguisticos.
- Herramientas de apoyo a traductores: borrador automatico que un revisor humano pule, adecuado por el tamano reducido del modelo (615 M de parametros) que permite ejecucion en CPU o GPU modesta.
- Docencia y divulgacion linguisticas: generacion de glosas aproximadas y ejemplos paralelos para cursos de mapudungun, siempre con supervision experta.
- Prototipos de aplicaciones de traduccion en entornos con recursos limitados: al ocupar unos 5 GB en safetensors (y menos en FP16), puede desplegarse en servidores pequenos o incluso en estaciones de trabajo sin GPU dedicada.
- Evaluacion comparativa de tokenizadores: experimentos controlados sobre el efecto de la segmentacion morfologica en lenguas aglutinantes, usando este checkpoint como control.

## Benchmarks y rendimiento

La model card declara un unico resultado: chrF++ medio a nivel de frase de **43,49** para la condicion standard BPE, tamano 600M y direccion arn->es, segun el pipeline corregido del articulo. No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ (frase, media) | 43,49 | arn->es, standard BPE, 600M |
| BLEU | no disponible | — |
| COMET | no disponible | — |
| MMLU / HumanEval / GSM8K | no aplica (modelo de traduccion) | — |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,3-1,5 GB solo para pesos; con cache de atencion y overhead de runtime, unos 2-3 GB.
- VRAM estimada en FP32: aproximadamente 2,5 GB solo para pesos, con overhead practico de 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4); para lotes grandes o baja latencia, A100, H100 o L40S.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo (RTX 3060, 4060, 4090) e incluso en CPU para frases cortas.
- Opciones de despliegue: `transformers` 4.x con `pipeline("translation")` o el script `inference.py` del repositorio; tambien es compatible con servidores de inferencia que soporten modelos NLLB/M2M-100 (por ejemplo, implementaciones basadas en PyTorch). No se documentan pesos GGUF ni soporte verificado en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | chrF++ arn->es |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-standard-bpe (este modelo) | 615 M | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | 43,49 |
| facebook/nllb-200-distilled-600M (base) | 615 M | no disponible | 200 | CC-BY-NC 4.0 | no disponible |
| Otras variantes del mismo autor con tokenizacion morfologica | no disponible | no disponible | arn, es | other | no disponible en esta ficha |
| Modelos genericos multilingues tipo mBART-50 o M2M-100 | 610 M (mBART-50) / 418 M (M2M-100) | no disponible | 50 / 100 | MIT / CC-BY-NC 4.0 | no disponible |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion disponible solo aporta el chrF++ de esta variante concreta. Si se conoce que el modelo base NLLB-200 distilled 600M es el punto de partida directo y que las variantes morfologicas del mismo autor son el contraste natural del articulo.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; no se permite uso comercial sin autorizacion adicional.
- Direccion unica: solo se documenta la traduccion arn->es; el rendimiento es->arn no esta garantizado ni evaluado.
- Corpus de ajuste limitado: deriva del corpus de Duan et al., lo que puede introducir sesgos de dominio (registro escrito, variedades concretas de mapudungun) y baja cobertura de vocabulario tecnico o neologismos.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas, especialmente en terminos morfologicamente complejos o poco frecuentes.
- No se documentan evaluaciones de sesgo, robustez ante ruido ortografico ni comportamiento con variantes dialectales del mapudungun.
- El resto de lenguas del modelo base puede degradarse tras el ajuste fino; no debe asumirse calidad multilingue general.
- La model card advierte que el checkpoint es un "corrected original-data retrain", lo que sugiere que versiones anteriores del pipeline contenian errores; conviene fijar la revision concreta del repositorio en produccion.
- No hay pesos cuantizados publicados; el despliegue en entornos muy restringidos requiere cuantizacion propia.
- Comunidad y soporte minimos: 18 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion adicional mas alla de la model card y el script de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-standard-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Articulo de referencia: Thompson, I. M., Rogers, B. M. A. y Ringger, E. K., "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (enlace directo no disponible en la informacion proporcionada).
- Corpus de Duan et al. (origen de los datos de ajuste): enlace no disponible en la informacion proporcionada.
- Repositorio del autor con el script `inference.py`: incluido en el propio repositorio de Hugging Face del modelo.
