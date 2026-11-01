# Haruto7261/QwenB-CPT-70-SFT

## Resumen

QwenB-CPT-70-SFT es un modelo derivado de la familia Qwen, publicado por el usuario Haruto7261 en HuggingFace. El nombre sugiere un proceso de entrenamiento en dos fases: continued pre-training (CPT) sobre un corpus especifico y posterior supervised fine-tuning (SFT). El modelo se ha entrenado especificamente para el tratamiento del dialecto japones de Kagoshima (萨隅方言, tambien conocido como Kagoshima-ben), segun se desprende del corpus documentado en su model card.

La model card disponible no incluye informacion sobre la arquitectura subyacente, el numero de parametros, la longitud de contexto ni los hiperparametros de entrenamiento. El identificador "70" en el nombre del modelo es ambiguo: podria referirse a un tamano de 70B parametros o a un numero de version o iteracion, pero no hay confirmacion en la informacion proporcionada. El repositorio no registra descargas ni likes en el momento de la consulta.

La relevancia de este modelo radica en su enfoque en un dominio muy especifico y poco representado en los corpus generalistas: el dialecto de Kagoshima y el japones coloquial. El corpus combina fuentes de dialogo (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes lexicograficas y divulgativas sobre dialectos de Kagoshima, corpus formales (actas parlamentarias, Aozora Bunko, Wikipedia en japones) y recursos academicos del Instituto Nacional de Lengua Japonesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen; no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (principal, segun corpus); no se documentan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta del modelo. El nombre "QwenB-CPT-70-SFT" indica que parte de una base de la familia Qwen (posiblemente Qwen2 o Qwen2.5, aunque no se especifica la version) y que ha sido sometido a continued pre-training (CPT) seguido de supervised fine-tuning (SFT). No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset por porcentajes, ni si se emplearon tecnicas de RLHF, DPO o similares.

El corpus de CPT documentado incluye: datos de dialogo japones (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes sobre el dialecto de Kagoshima (listados lexicograficos, diccionarios online, materiales de la prefectura, Wikipedia sobre el dialecto Satsugu), corpus formales (actas del Kokkai, Aozora Bunko, Wikipedia en japones) y material academico del NINJAL (Instituto Nacional de Lengua Japonesa). Esta composicion sugiere un objetivo de adaptacion al japones coloquial y dialectal, con especial enfasis en Kagoshima-ben, manteniendo al mismo tiempo competencia en japones estandar formal.

## Capacidades

- Generacion de texto en japones, con especializacion en registro coloquial y dialectal de Kagoshima.
- Conversacion multi-turno y dialogo basado en persona (a partir de los corpus de dialogo empleados).
- Comprension y produccion de japones formal (actas parlamentarias, textos literarios de Aozora Bunko, Wikipedia).
- Traduccion o adaptacion entre japones estandar y dialecto de Kagoshima (inferido del corpus, no confirmado explicitamente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo japones documentado; no se confirman otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Atencion al cliente en japones regional: el modelo podria gestionar conversaciones con usuarios que empleen dialecto de Kagoshima, mejorando la comprension frente a modelos genericos entrenados solo con japones estandar.
- Traduccion y normalizacion dialectal: conversion de texto en Kagoshima-ben a japones estandar para su procesamiento posterior en pipelines de NLP, o a la inversa para generar contenido localizado.
- Generacion de contenido divulgativo sobre dialectos: produccion de articulos, glosarios o materiales educativos sobre el dialecto Satsugu a partir del conocimiento inyectado en el CPT.
- Investigacion linguistica asistida: apoyo en la anotacion, clasificacion o analisis de corpus dialectales japoneses, dado el entrenamiento especifico en fuentes lexicograficas y academicas.
- Chatbots de personaje con registro coloquial: gracias a los corpus de dialogo con persona (RealPersonaChat, MACHAcorpus), el modelo puede emplearse en sistemas de role-play o compania conversacional en japones.
- Procesamiento de documentos historicos y literarios japoneses: el entrenamiento sobre Aozora Bunko y actas parlamentarias permite su uso en tareas de comprension de textos formales o antiguos.
- Preservacion digital de lenguas minorizadas: como herramienta de documentacion y generacion de contenido en dialectos con pocos recursos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano real del modelo, que no se especifica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos ni compatibilidad con frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenB-CPT-70-SFT | no disponible | no disponible | Japones dialectal (Kagoshima) | no disponible | HuggingFace (0 descargas) |
| Qwen2.5 (base) | 0.5B-72B | hasta 128K (segun variante) | Japones general y multilingue | Apache 2.0 (mayoria de variantes) | Amplia |
| Swallow (TokioTech) | 7B-13B | 4K-32K | Japones | Apache 2.0 / custom | HuggingFace |
| llm-jp | 3B-13B | 2K-8K | Japones | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, parametros, contexto, licencia ni formato de pesos, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion: al ser un modelo de nicho con CPT sobre corpus limitados y sin datos de evaluacion, la fiabilidad factual no esta garantizada.
- Sesgo de dominio: el entrenamiento intensivo en dialecto de Kagoshima y japones puede degradar el rendimiento en otros idiomas o incluso en japones estandar fuera de los registros cubiertos.
- Corpus de fuentes heterogeneas: mezcla de diccionarios online, blogs y material academico sin filtrado documentado, lo que puede introducir ruido, errores ortograficos o contenido de baja calidad.
- Sin senales de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el modelo haya sido probado por terceros.
- Fecha de creacion futura (2026-11-01) en los metadatos: posible inconsistencia en el registro de HuggingFace que conviene verificar.
- No se documentan medidas de seguridad, alineamiento ni filtros de contenido.

## Enlaces

- HuggingFace: https://huggingface.co/Haruto7261/QwenB-CPT-70-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- Wikipedia (dialecto Satsugu): https://ja.wikipedia.org/wiki/薩隅方言
- Actas del Kokkai: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japones: https://ja.wikipedia.org/
- NINJAL: https://www.ninjal.ac.jp/
- Prefectura de Kagoshima (dialecto): https://www.pref.kagoshima.jp/
- Kagoshima-ben Net Dictionary: https://kagoshima-ben.com/
- 47 Todofuken Hougen Jiten: https://hougen.biz/
- Hougen Lab: https://hougen-lab.com/
- KING CAFE (dialecto): https://kingcafe.jp/
- Hougen.net (Kagoshima): https://hougen.net/kagoshima/
- ALC (dialecto Kagoshima): https://www.alc.co.jp/
