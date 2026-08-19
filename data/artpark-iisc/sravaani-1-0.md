# ARTPARK-IISc/SraVaani-1.0

## Resumen

SraVaani-1.0 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ARTPARK-IISc, un centro de investigación indio. Está diseñado para transcribir audio en 14 idiomas de la India, incluyendo hindi, bengalí, tamil, telugu, maratí, gujaratí, entre otros, además de inglés. El modelo se distribuye bajo licencia MIT y su repositorio en HuggingFace ocupa aproximadamente 0,9 GB, lo que sugiere un tamaño compacto adecuado para despliegue en entornos con recursos limitados.

La relevancia de SraVaani-1.0 radica en su enfoque en lenguas de la India, un ámbito tradicionalmente poco cubierto por los grandes modelos ASR comerciales. Al ser de código abierto y con licencia permisiva, permite a desarrolladores e investigadores integrar transcripción de voz en aplicaciones locales sin depender de servicios propietarios. El acceso al modelo es restringido (gated), por lo que es necesario aceptar las condiciones de uso en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, kn, ml, te, en, gu, pa, or, bn, ta, as, sa, ne, mr |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo, el numero de parametros, la composicion del dataset de entrenamiento ni las tecnicas de optimizacion empleadas. Los metadatos de HuggingFace indican que el modelo esta asociado a los datasets ARTPARK-IISc/Vaani y ARTPARK-IISc/Vaani-transcription-part, lo que sugiere que fue entrenado sobre un corpus de audio transcrito en lenguas indias. Tambien se referencia un articulo cientifico con identificador arxiv:2608.08235, aunque su contenido no ha sido verificado en esta ficha. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, probablemente por tratarse de una tarea de ASR y no de generacion de texto libre.

## Capacidades

- Transcripcion de voz a texto en 14 idiomas indios y en ingles.
- Reconocimiento automatico del habla (ASR) como tarea principal, segun el pipeline declarado en HuggingFace.
- Soporte para multiples idiomas en un unico modelo, lo que facilita su uso en aplicaciones multilingues.
- No se han documentado capacidades adicionales como traduccion, diarizacion de hablantes o reconocimiento de emociones.
- No se indica soporte para tool calling, agentes o razonamiento multi-paso, ya que no es un modelo de lenguaje generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lenguas indias: el modelo puede convertir grabaciones de audio en texto para generar actas o subtitulos, aprovechando su cobertura de idiomas regionales.
- Atencion al cliente en centros de llamadas: integracion en sistemas de analisis de llamadas para extraer informacion de conversaciones en hindi, tamil o bengali, mejorando la calidad del servicio en mercados locales.
- Creacion de subtitulos para contenido audiovisual: generacion automatica de subtitulos en idiomas indios para videos, facilitando el acceso a contenido educativo o de entretenimiento.
- Asistentes de voz para aplicaciones moviles: incorporacion de entrada por voz en apps dirigidas a usuarios que hablan lenguas regionales, permitiendo busquedas o comandos dictados.
- Archivo y busqueda de contenido oral: transcripcion de archivos de audio historicos o entrevistas para hacerlos indexables y buscables en bases de datos documentales.
- Educacion y e-learning: conversion de clases grabadas en audio a texto para generar apuntes o materiales de estudio accesibles en varios idiomas indios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre WER (Word Error Rate), CER ni comparaciones con otros modelos ASR en los idiomas soportados.

## Requisitos de hardware

- No se dispone de informacion oficial sobre requisitos de VRAM, GPU recomendadas o latencia.
- El tamano del repositorio (0,9 GB) sugiere que el modelo es relativamente ligero, por lo que podria ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque esta es una estimacion no confirmada.
- Para despliegue en produccion, se podrian utilizar frameworks como Whisper.cpp, faster-whisper o HuggingFace Transformers, pero no se ha verificado la compatibilidad con estas herramientas.
- No se indican opciones de cuantizacion ni formatos de pesos alternativos (GGUF, ONNX, etc.).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR multilingues como Whisper, IndicWav2Vec o Bhashini. No se han encontrado benchmarks publicos que permitan una comparacion objetiva en terminos de precision, velocidad o cobertura de idiomas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones de uso en HuggingFace, lo que puede limitar su adopcion en entornos corporativos.
- Informacion tecnica incompleta: se desconocen detalles clave como arquitectura, numero de parametros y dataset de entrenamiento, lo que dificulta evaluar su idoneidad para casos de uso especificos.
- Cobertura limitada a idiomas indios: no es adecuado para transcripcion en otros idiomas fuera de la lista declarada.
- Riesgo de sesgos en el reconocimiento: al estar entrenado sobre un corpus especifico (Vaani), puede presentar un rendimiento inferior con acentos, dialectos o ruido no representados en los datos de entrenamiento.
- Sin garantias de precision: al no haber benchmarks publicados, no se puede asegurar un nivel minimo de calidad en la transcripcion.
- Licencia MIT: aunque permisiva, el acceso gated implica que el uso comercial puede estar sujeto a la aprobacion de los autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Dataset Vaani-transcription-part: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Articulo cientifico (referenciado, no verificado): https://arxiv.org/abs/2608.08235
