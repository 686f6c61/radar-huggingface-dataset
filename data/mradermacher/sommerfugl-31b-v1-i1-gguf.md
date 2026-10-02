# mradermacher/sommerfugl-31b-v1-i1-GGUF

## Resumen

mradermacher/sommerfugl-31b-v1-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher (nethype GmbH) a partir del modelo oolabs/sommerfugl-31b-v1. No es un modelo entrenado desde cero, sino una conversión a formato GGUF con cuantizaciones ponderadas mediante fichero imatrix, pensada para ejecución local en llama.cpp y entornos compatibles con GGUF. El modelo base, desarrollado por oolabs.no, parte de Google gemma-4-31B-it y se ha ajustado para corregir la pérdida de calidad en noruego observada en la versión instruct del modelo original.

El modelo cuenta con 30.697.345.596 parámetros (comercializado como 31B) y declara soporte para noruego (código `no`), bokmål (`nb`), nynorsk (`nn`) e inglés (`en`). La model card del repositorio de cuantización indica además que el modelo base es multimodal (visión), con ficheros mmproj, en su caso, alojados en el repositorio de cuantizaciones estáticas del mismo autor.

Su relevancia es doble: por un lado, ofrece una vía de despliegue local de un modelo de 31B en hardware de consumo mediante cuantizaciones de 2 a 6 bits; por otro, cubre el nicho del procesamiento de lenguaje natural en noruego, un idioma con menos recursos que el inglés y que suele degradarse en los ajustes instruct genéricos. La licencia es la de Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma (etiqueta `gemma4`); detalles especificos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7 B; comercializado como 31B) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, small-IQ4_NL, Q4_K_S, Q4_K_M, IQ4_XS, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K (variantes ponderadas con imatrix) |
| Idiomas soportados | noruego (`no`), bokmal (`nb`), nynorsk (`nn`), ingles (`en`) |
| Licencia | gemma (Gemma license) |
| Formato de pesos | GGUF (cuantizado, imatrix/weighted); se incluye fichero imatrix de 0,1 GB para generar cuantizaciones propias |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica los pesos del modelo: aplica cuantizacion GGUF sobre oolabs/sommerfugl-31b-v1, que a su vez es un ajuste de Google gemma-4-31B-it. La model card del cuantizador indica que las cuantizaciones son ponderadas mediante imatrix (`imatrix` y `weighted`), un metodo que usa estadisticas de activaciones para reducir el error de cuantizacion respecto a las cuantizaciones estaticas equivalentes. La misma familia de cuantizaciones en version estatica esta disponible en mradermacher/sommerfugl-31b-v1-GGUF. El repositorio declara 56,2 GB de tamano total, coherente con un modelo de ~31B distribuido en multiples niveles de cuantizacion.

Respecto al modelo base, la informacion disponible de oolabs.no indica que Sommerfugl-31B parte de gemma-4-31B-it y que su objetivo principal es corregir la regresion en capacidades de noruego que se observo en el modelo Gemma instruido. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. La etiqueta `vision` del modelo base y la referencia a ficheros mmproj apuntan a capacidades multimodales en el modelo original, pero no se especifican detalles de su modulo de vision. Tampoco se documenta ninguna innovacion de inferencia (decodificacion especulativa, attention lineal, etc.).

## Capacidades

- Generacion de texto conversacional en noruego (bokmal y nynorsk) e ingles, segun los idiomas declarados.
- Ajuste orientado a mejorar el rendimiento en noruego respecto al Gemma instruct original, que es el problema que declara resolver el modelo base.
- Capacidad multimodal (vision) indicada en la model card del cuantizador; los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas, no en este.
- Ejecucion local en cuantizaciones de 1 a 6 bits, lo que permite desplegar un modelo de 31B en equipos con VRAM limitada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking explicito: no documentado en la informacion disponible.
- Capacidades de audio: no documentado en la informacion disponible.
- Rendimiento en codigo, matematicas o benchmarks estandar: no disponible.

## Casos de uso

- Procesamiento de lenguaje natural en noruego: redaccion, resumen, reescritura y clasificacion de textos en bokmal y nynorsk, aprovechando el ajuste especifico del modelo base para corregir la degradacion del noruego en Gemma instruct.
- Atencion al cliente en noruego: despliegue de un asistente conversacional local para empresas noruegas que necesitan tratar consultas en ambos estandares escritos sin enviar datos a servicios en la nube.
- Traduccion ingles-noruego y noruego-ingles: el modelo declara ambos idiomas, por lo que puede emplearse en tareas de traduccion y postedicion dentro de flujos internos.
- Despliegue en hardware de consumo: al ofrecer cuantizaciones desde Q2_K hasta Q6_K, permite ejecutar un modelo de 31B en estaciones de trabajo con GPU de gama alta o incluso en configuraciones con memoria unificada, sin depender de APIs externas.
- Generacion de cuantizaciones a medida: el repositorio incluye un fichero imatrix de 0,1 GB que permite reproducir o generar nuevas cuantizaciones ponderadas con herramientas de llama.cpp.
- Investigacion sobre cuantizacion: util como material de comparacion entre niveles de cuantizacion (Q2 frente a Q6, IQ frente a no-IQ) para estudiar el impacto en perplejidad y calidad, segun la metodologia de referencia enlazada por el autor.
- Entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp u otros runners GGUF, permite tratar documentos sensibles en noruego sin salida de datos a terceros.
- Procesamiento documental multimodal: si se incorpora el fichero mmproj del repositorio estatico, podria abordar tareas de descripcion o extraccion de informacion de imagenes, aunque la informacion disponible no detalla el alcance de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para los pesos cuantizados ni para el modelo base oolabs/sommerfugl-31b-v1.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (30.697.345.596) y del coste en bits por peso de cada tipo de cuantizacion; el repositorio no publica en la informacion disponible los tamanos por fichero de cada cuantizacion.

- Q2_K / IQ2_M / IQ2_S: aproximadamente 12-13 GB de pesos, mas cache KV. Requiere GPU con 16 GB o mas de VRAM, o memoria unificada equivalente.
- Q3_K_M / IQ3_M: aproximadamente 15-16 GB de pesos. Ajustado para GPU de 24 GB (RTX 3090, RTX 4090) con contexto moderado.
- Q4_K_M / IQ4_XS: aproximadamente 18-19 GB de pesos. Indicado para RTX 4090 (24 GB), A6000, L40S o Apple Silicon con 32 GB o mas de memoria unificada.
- Q5_K_M: aproximadamente 22-23 GB de pesos. Requiere 24 GB de VRAM con contexto corto o 32 GB o mas con contexto amplio.
- Q6_K: aproximadamente 26-27 GB de pesos. Recomendado para A100 40 GB, H100 o configuraciones multi-GPU.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q3-Q4; A6000, L40S y A100 40 GB para Q4-Q5; A100 80 GB o H100 para Q6 y FP16/FP8.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con cuantizaciones Q3 y Q4; las cuantizaciones Q2 pueden caber en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; los tag `endpoints_compatible` sugieren uso en endpoints de inferencia tipo TGI/vLLM, aunque vLLM requiere pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles. Dependen del nivel de cuantizacion, la longitud de contexto y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/sommerfugl-31b-v1-i1-GGUF (este) | 30,7 B | no disponible | no, nb, nn, en | gemma | GGUF cuantizado (imatrix) | Cuantizaciones ponderadas |
| mradermacher/sommerfugl-31b-v1-GGUF | 30,7 B | no disponible | no, nb, nn, en | gemma | GGUF cuantizado (estatico) | Mismo modelo, cuantizaciones estaticas; aloja los ficheros mmproj |
| oolabs/sommerfugl-31b-v1 | no disponible | no disponible | no, nb, nn, en | gemma | safetensors (presumible, no disponible) | Modelo base sin cuantizar |
| Google gemma-4-31B-it | no disponible | no disponible | no disponible | gemma | no disponible | Base del ajuste noruego; presenta la regresion en noruego que Sommerfugl corrige |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Gemma: el uso esta sujeto a la Gemma license, que impone condiciones adicionales a las licencias permisivas habituales (obligaciones de uso aceptable y clausulas de redistribucion). Conviene revisar los terminos antes de un uso comercial.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de noruego publicadas en la informacion disponible, por lo que cualquier decision de produccion deberia acompanarse de una evaluacion propia.
- Riesgo de alucinacion: no hay datos especificos; se asume el comportamiento habitual de un modelo generativo de 31B sin verificacion factual integrada.
- Sesgos: no documentados en la informacion disponible. El ajuste esta centrado en noruego, lo que puede reducir la cobertura en otros idiomas y aumentar el sesgo hacia registros y variantes noruegas de bokmal.
- Cobertura limitada de idiomas: solo se declaran noruego (bokmal y nynorsk) e ingles; el rendimiento en castellano u otros idiomas no esta soportado ni documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones de contexto largo ni conocer el limite real de tokens.
- Perdida por cuantizacion: las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, Q2_K) degradan la calidad de forma notable; para calidad cercana al original hay que ir a Q5_K_M o Q6_K.
- Capacidad multimodal incierta: la model card senala que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio y no se detalla su funcionamiento.
- Fecha de creacion inusual: los metadatos indican creacion y actualizacion en octubre de 2026, dato a verificar antes de citarlo.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre los ficheros publicados.
- No hay informacion sobre tool calling ni comportamiento agentico, lo que limita su uso en pipelines que dependan de function calling estructurado.

## Enlaces

- Repositorio de cuantizaciones imatrix (este modelo): https://huggingface.co/mradermacher/sommerfugl-31b-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/sommerfugl-31b-v1-GGUF
- Modelo base: https://huggingface.co/oolabs/sommerfugl-31b-v1
- Pagina de despliegue del modelo base en Featherless: https://featherless.ai/models/oolabs/sommerfugl-31b-v1
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#sommerfugl-31b-v1-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
