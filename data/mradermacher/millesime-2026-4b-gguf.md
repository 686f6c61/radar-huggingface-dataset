# mradermacher/Millesime-2026-4b-GGUF

## Resumen

Millesime-2026-4b es un modelo de lenguaje pequeño (SLM) de 4 000 millones de parámetros, especializado en francés, desarrollado por borekboissy y posteriormente cuantizado a formato GGUF por mradermacher para su ejecución eficiente en entornos locales. El modelo base fue entrenado mediante un pipeline que combina ajuste fino supervisado (SFT) y optimización por preferencias humanas (DPO), utilizando los datasets Millesime-2026-SFT y Millesime-2026-comparIA-DPO. Además, se emplearon técnicas de fusión de modelos (model merging) con el método TIES, lo que sugiere una integración de pesos de múltiples modelos para mejorar el rendimiento general.

La versión GGUF aquí descrita ofrece doce niveles de cuantización, desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite desplegar el modelo en una amplia gama de hardware, desde portátiles con GPU integrada hasta servidores con GPUs profesionales. Su licencia Apache 2.0 facilita el uso comercial sin restricciones significativas. La relevancia actual de este modelo radica en su enfoque monolingüe francés, un nicho donde los modelos multilingües generalistas suelen ofrecer un rendimiento inferior, y en su tamaño compacto que lo hace accesible para desarrolladores que necesitan una solución local de procesamiento de lenguaje natural en francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer decoder, presumiblemente, pero no confirmado) |
| Parametros totales | 4 022 468 096 (4,02 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base (borekboissy/Millesime-2026-4b). Dado que se trata de un SLM de 4B parametros, es probable que emplee una arquitectura transformer decoder estandar, similar a otros modelos de su tamano, pero este dato no se ha confirmado en la documentacion publicada.

El entrenamiento del modelo base combina dos fases: un ajuste fino supervisado (SFT) sobre el dataset Millesime-2026-SFT, seguido de una optimizacion por preferencias humanas (DPO) con el dataset Millesime-2026-comparIA-DPO. Ademas, se aplico una fusion de modelos mediante la tecnica TIES (TrIm, Elect Sign and Merge), que permite combinar multiples modelos ajustados para obtener un unico conjunto de pesos con mejor rendimiento general. Esta combinacion de SFT, DPO y model merging es una estrategia habitual para mejorar la calidad de modelos pequenos sin aumentar su tamano.

## Capacidades

- Generacion de texto en frances: el modelo esta especificamente entrenado para producir texto coherente y fluido en frances, cubriendo registros formales e informales.
- Conversacion multi-turno: gracias al entrenamiento con SFT y DPO, el modelo mantiene conversaciones contextualmente coherentes, adecuadas para asistentes virtuales y chatbots.
- Razonamiento basico: al ser un modelo de 4B parametros, puede resolver tareas de razonamiento sencillas, aunque su capacidad esta limitada frente a modelos mas grandes.
- Comprension lectora: es capaz de procesar y resumir documentos en frances, extrayendo informacion relevante.
- No se ha confirmado soporte para tool calling, function calling, agentes o capacidades multimodales (vision, audio) en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en frances: el modelo puede gestionar conversaciones de soporte multi-turno, resolviendo consultas frecuentes y derivando casos complejos a agentes humanos. Su tamano compacto permite desplegarlo en servidores modestos o incluso en local.
- Generacion de contenido editorial en frances: redaccion de articulos, resumenes, descripciones de productos o publicaciones en redes sociales, manteniendo un tono natural y adaptado al publico francoparlante.
- Asistente de escritura para francoparlantes: correccion gramatical, sugerencias de estilo y reescritura de textos, integrable en editores o procesadores de texto.
- Clasificacion y analisis de sentimiento en frances: procesamiento de opiniones de clientes, comentarios en foros o redes sociales para extraer tendencias y valoraciones.
- Transcripcion y normalizacion de textos: conversion de transcripciones automaticas (speech-to-text) en frances a un formato mas legible y estructurado.
- Educacion y aprendizaje de frances: generacion de ejercicios, explicaciones y dialogos de practica para estudiantes de frances como lengua extranjera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el modelo requiere entre 2 GB (Q2_K) y 9 GB (f16) de memoria disponible. Para cuantizaciones Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB), se recomienda al menos 4-6 GB de VRAM para dejar margen al contexto y overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones mas bajas (Q2_K a Q4_K_M). Para Q6_K o Q8_0 se recomienda una GPU con 6-8 GB (por ejemplo, RTX 3060, RTX 4060, RTX 2070). La version f16 (8,2 GB) requiere una GPU con 10-12 GB (RTX 3080, RTX 4080, A10).
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo medio y bajo, siendo especialmente adecuado para portatiles con RTX 3050/4050 o incluso iGPUs con suficiente memoria compartida.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y servidores como llama-cpp-python. Tambien puede convertirse a otros formatos si es necesario.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (RTX 4090), se espera una velocidad de generacion de 50-100 tokens/s con cuantizaciones Q4_K_M, aunque estos valores son estimaciones basadas en modelos de tamano similar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (SLM franceses de 4B). No se han encontrado referencias a modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en frances, puede reflejar sesgos culturales y linguisticos propios de ese contexto. No se ha publicado informacion sobre evaluacion de sesgos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de hechos concretos. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Es probable que sea limitada (tipicamente 4K-8K tokens en modelos de este tamano), lo que restringe el procesamiento de documentos largos.
- Limitaciones de idioma: el modelo solo esta entrenado en frances. Su rendimiento en otros idiomas es muy limitado o nulo, y no debe usarse para tareas multilingues.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones de uso militar o de alto riesgo.
- Caveat de produccion: al ser un modelo pequeno, su capacidad de razonamiento complejo y seguimiento de instrucciones es inferior a la de modelos de 7B o mas. Para tareas que requieran alta precision, se recomienda evaluar su rendimiento con datos propios antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Millesime-2026-4b-GGUF
- Modelo base: https://huggingface.co/borekboissy/Millesime-2026-4b
- Dataset SFT: https://huggingface.co/datasets/borekboissy/Millesime-2026-SFT
- Dataset DPO: https://huggingface.co/datasets/borekboissy/Millesime-2026-comparIA-DPO
- Pagina de descargas de mradermacher: https://hf.tst.eu/model
