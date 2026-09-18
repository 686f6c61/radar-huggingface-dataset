# harlynmivra/Xing4.0-29B-A4B-Rewrite

## Resumen

Xing4.0-29B-A4B-Rewrite es un ajuste fino supervisado (SFT) sobre Xing4.0-29B-A4B, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por XingChen-AGI. El modelo base cuenta con 29.000 millones de parametros totales y 4.000 millones activos por token, soporta de forma nativa una longitud de contexto de 256K tokens y esta orientado a la generacion de texto en chino. El fine-tune lo publica el usuario harlynmivra en HuggingFace.

La especializacion de este ajuste es concreta: reescribir transcripciones de habla conversacional y desorganizada para convertirla en texto escrito claro y coherente. El modelo esta disenado para reducir repeticiones y muletillas, reparar frases incompletas o agramaticales, reorganizar estructuras oracionales desordenadas y transformar registro coloquial en lenguaje escrito natural, evitando resumir o comprimir informacion. Es, por tanto, una herramienta de post-procesado de texto, no un asistente generalista.

Su relevancia actual radica en el nicho que cubre: los sistemas de reconocimiento automatico del habla (ASR) generan transcripciones con ruido, repeticiones y fragmentacion, y este modelo actua como capa de limpieza posterior. El ajuste SFT se realizo con una longitud de contexto de 2048 tokens, muy inferior a los 256K del modelo base, lo que condiciona su uso practico a entradas relativamente cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 29B |
| Parametros activos | 4B |
| Longitud de contexto | 256K tokens en el modelo base; el ajuste SFT se entreno con 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo base, Xing4.0-29B-A4B, es un transformer decoder-only con capa Mixture-of-Experts: dispone de 29.000 millones de parametros en total, de los cuales solo 4.000 millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Soporta de forma nativa 256.000 tokens de contexto, segun el repositorio oficial del proyecto.

Sobre esa base, este ajuste aplica un entrenamiento supervisado (SFT) especificamente orientado a la tarea de reescritura. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO. El unico hiperparametro declarado es la longitud de contexto usada durante el SFT: 2048 tokens. Los tags del repositorio indican `rewrite`, `paraphrase` y `sft` como ejes tematicos del ajuste. No se documenta ninguna innovacion tecnica de atencion o decodificacion introducida por el fine-tune.

## Capacidades

- Reescritura de texto: convierte transcripciones orales en texto escrito coherente.
- Eliminacion de repeticiones, redundancias y muletillas del habla espontanea.
- Reparacion de frases incompletas o gramaticalmente rotas.
- Reorganizacion de estructuras oracionales desordenadas.
- Conversion de registro coloquial a lenguaje escrito natural.
- Preservacion de la informacion original: el modelo evita resumir o comprimir el contenido.
- Generacion de texto en chino (idioma unico declarado).
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni multimodalidad.

## Casos de uso

- Post-procesado de transcripciones de reuniones: el modelo toma la salida cruda de un sistema ASR (con repeticiones, frases cortadas y muletillas) y la convierte en un texto legible para actas o documentacion interna, trabajando en fragmentos de hasta 2048 tokens.
- Limpieza de subtitulos generados automaticamente: plataformas de video pueden pasar los subtitulos ASR por el modelo para eliminar tics orales y corregir puntuacion y sintaxis antes de publicarlos.
- Normalizacion de notas de voz en aplicaciones moviles: la transcripcion de un mensaje de voz se reescribe como texto escrito enviable por chat o correo, manteniendo el contenido integro.
- Generacion de actas a partir de audio: en entornos corporativos, tras la transcripcion de una reunion, el modelo reordena las intervenciones desordenadas y produce un texto continuo sin resumir los puntos tratados.
- Preparacion de entrevistas para periodismo: transcripciones de entrevistas largas se dividen en segmentos y se reescriben para su publicacion, conservando citas y contenido pero eliminando ruido del habla.
- Preprocesado para pipelines de datos: antes de indexar documentos en un sistema RAG o de entrenar otro modelo, se limpia el corpus transcrito para reducir ruido y mejorar la calidad del texto de entrada.
- Aplicaciones de accesibilidad: conversion de transcripciones en bruto a texto claro para usuarios con dificultades de lectura, eliminando fragmentacion y estructuras rotas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 29.000 millones de parametros totales; en una arquitectura MoE es necesario cargar todos los expertos en memoria, aunque solo se activen 4B por token. El calculo de VRAM depende del total, no de los parametros activos.
- Estimacion en precision completa (FP16/BF16): en torno a 58 GB solo de pesos, mas cache KV y overhead; requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- Estimacion en INT8: aproximadamente 29 GB de pesos, lo que encaja en una A100 40GB, L40S o en configuraciones multi-GPU.
- Estimacion en 4 bits: en torno a 15-16 GB de pesos, por lo que seria viable en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado para cache KV y overhead del runtime.
- La ventana de 256K tokens del modelo base implicaria una cache KV muy grande; en la practica, el ajuste SFT se entreno a 2048 tokens, por lo que no se recomienda explotar contextos largos con este fine-tune.
- Opciones de despliegue habituales para modelos de este tipo: vLLM, llama.cpp, Ollama o TGI. No se confirma en la informacion disponible que existan pesos en formato GGUF publicados para este ajuste.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B-Rewrite | 29B / 4B | 256K (base); SFT entrenado a 2048 | zh | no disponible | Reescritura de transcripciones |
| Xing4.0-29B-A4B | 29B / 4B | 256K, extensible | no disponible | no disponible | Modelo base generalista |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otros modelos comparables en la informacion proporcionada. La unica comparacion documentada es con el propio modelo base, del que este ajuste hereda arquitectura, parametros y ventana de contexto, modificando unicamente el comportamiento mediante SFT.

## Limitaciones y advertencias

- Texto ambiguo o muy fragmentado puede reescribirse de forma incorrecta, alterando el significado original.
- Los errores ya presentes en la transcripcion de origen se propagan al resultado reescrito.
- Entradas largas o muy desorganizadas pueden provocar reordenaciones locales u omisiones de informacion.
- El rendimiento varia segun el dominio, el estilo de habla y la calidad de la transcripcion.
- La longitud de contexto efectiva del ajuste es de 2048 tokens, muy por debajo de la ventana del modelo base; superar ese tamano puede degradar la calidad.
- Idioma unico declarado: chino. No hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinacion: no se documenta de forma explicita, pero al ser un modelo generativo de reescritura existe riesgo de introducir contenido no presente en el texto original, especialmente con entradas degradadas.
- Licencia no disponible: al no declararse los terminos, no puede confirmarse la viabilidad de uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay validacion por parte de la comunidad ni evidencia de uso en produccion.
- No se documentan sesgos especificos, pero al estar entrenado unicamente en chino hereda los sesgos presentes en los datos de entrenamiento de la base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/harlynmivra/Xing4.0-29B-A4B-Rewrite
- Modelo base en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Arbol de ficheros del modelo base en GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/tree/main/
- Ficha del modelo base en savrn.com: https://savrn.com/models/xing4-0-29b-a4b
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/xing4.0-29b-a4b-xingchen-agi
- Mirror del modelo base en HuggingFace: https://huggingface.co/21g/Xing4.0-29B-A4B/tree/main
