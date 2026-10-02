# mradermacher/G4-Jamet-26B-A4B-MK-1-i1-GGUF

## Resumen

G4-Jamet-26B-A4B-MK-1-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo Hastagaras/G4-Jamet-26B-A4B-MK-1. No se trata de un modelo nuevo, sino de una redistribucion optimizada para inferencia local: el repositorio contiene 11 ficheros GGUF con cuantizaciones de tipo i1 (imatrix/weighted) que van desde IQ1_M (8,8 GB) hasta Q6_K (22,7 GB), ademas del fichero imatrix necesario para generar cuantizaciones propias.

El modelo subyacente tiene 25.233.142.046 parametros totales (dato real de los safetensors del modelo base) y la nomenclatura "26B-A4B" indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token. Los resultados de busqueda disponibles sitúan esta familia, Gemma 4 26B A4B, como un MoE de Google DeepMind con unos 3.800 millones de parametros activos, ventana de contexto de 256.000 tokens, entrada nativa de texto e imagen y function calling configurable, publicado bajo licencia Apache 2.0. La model card del repositorio GGUF confirma explicitamente que se trata de un modelo de vision, con los ficheros mmproj alojados en el repositorio de cuantizaciones estaticas.

La relevancia de este repositorio es practica: permite ejecutar un modelo MoE multimodal de ~25B con un coste de computo por token similar a un modelo denso de ~4B, en hardware de consumo si se eligen las cuantizaciones bajas. El repositorio es muy reciente (creado el 2 de octubre de 2026) y no registra descargas ni "likes", por lo que no existe aun validacion comunitaria de la calidad de estas cuantizaciones concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (texto e imagen); no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 25.233.142.046 (~25,2B), dato real de los safetensors del modelo base |
| Parametros activos | ~3,8B (dato de la familia Gemma 4 26B A4B segun resultados de busqueda; no confirmado para este fine-tune concreto) |
| Longitud de contexto | 256.000 tokens segun la descripcion de la familia Gemma 4 26B A4B en los resultados de busqueda; no confirmado en la model card del repositorio GGUF |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (mas fichero imatrix); existen cuantizaciones estaticas adicionales en el repositorio hermano |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en el repositorio; la familia base Gemma 4 26B A4B se publica como Apache 2.0 segun los resultados de busqueda |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base Hastagaras/G4-Jamet-26B-A4B-MK-1: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el numero de expertos, la estrategia de enrutamiento ni si emplea atencion lineal, decodificacion especulativa o alguna innovacion adicional en la capa de atencion.

Lo que si puede afirmarse es que la arquitectura es de tipo MoE con ~25,2B parametros totales y un prefijo "A4B" que, por convencion de la familia Gemma 4, corresponde a unos 3,8B parametros activos por token. Esto implica que el coste de FLOPs por token se aproxima al de un modelo denso de ~4B, mientras que la capacidad efectiva de representacion se acerca a la de un modelo de 25B. El modelo es multimodal (texto e imagen) y el repositorio advierte que los ficheros mmproj del proyector visual, si existen, se encuentran en el repositorio de cuantizaciones estaticas, no en este.

En cuanto a las cuantizaciones i1 de este repositorio, mradermacher indica que se generaron con la tecnica de imatrix (weighted), lo que en la practica mejora la relacion calidad/tamano frente a cuantizaciones estaticas del mismo tamano en los rangos bajos (IQ1 a Q3). El autor advierte explicitamente en su tabla que IQ1_M es una cuantizacion "mostly desperate" y que Q2_K_S es de "very low quality".

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta "conversational" y "endpoints_compatible" en el repositorio.
- Entrada multimodal de imagen: la model card declara explicitamente "This is a vision model", con ficheros mmproj en el repositorio estatico asociado.
- Razonamiento tipo MoE con ~3,8B parametros activos por token, lo que permite un throughput alto con una huella de memoria de ~25B.
- Contexto potencialmente muy largo (256.000 tokens segun la descripcion de la familia, sin confirmar en este repositorio), adecuado para documentos extensos y conversaciones multi-turno.
- Function calling y modo de razonamiento configurable: descritos para la familia Gemma 4 26B A4B en los resultados de busqueda; no se confirman en la model card de este repositorio.
- Capacidades multilingues: limitadas a ingles segun el campo de idiomas del repositorio.
- No se documentan capacidades de audio, vision mas alla de imagen, ni soporte de agentes multi-paso en la informacion disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo mono-GPU: con las cuantizaciones i1-Q4_K_S (15,6 GB) o i1-Q4_K_M (16,9 GB) el modelo entra en GPUs de 24 GB como la RTX 3090 o la RTX 4090, permitiendo conversacion multimodal sin depender de APIs externas.
- Despliegue en portatiles Apple Silicon con memoria unificada: las cuantizaciones i1-IQ2_M (10,5 GB) e i1-IQ3_M (12,5 GB) caben en equipos de 16-18 GB de memoria unificada mediante llama.cpp, a costa de una perdida de calidad notable en los rangos bajos.
- Procesamiento de documentos extensos con imagen: si se confirma la ventana de 256.000 tokens, el modelo puede ingerir informes escaneados o manuales tecnicos completos y responder preguntas sobre ellos en una sola pasada, combinando OCR implicito con razonamiento textual.
- Asistentes conversacionales en ingles con soporte de herramientas: la etiqueta endpoints_compatible y el function calling descrito para la familia permiten integrarlo en backends compatibles con la API de OpenAI para flujos de extraccion de datos estructurados.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 11 niveles de cuantizacion mas el fichero imatrix, lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion en perplexity y calidad de respuesta sobre un MoE multimodal.
- Experimentacion academica con arquitecturas MoE: al tener ~25B totales y ~3,8B activos, permite estudiar comportamientos de enrutamiento de expertos en un rango de memoria accesible para un laboratorio pequeno.
- Generacion de codigo asistida en local: aunque no hay benchmarks publicados, el modelo puede emplearse en entornos con requisitos de privacidad donde no se permite enviar codigo a servicios en la nube, usando Q4_K_M como compromiso calidad/velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion para este repositorio ni para el modelo base Hastagaras/G4-Jamet-26B-A4B-MK-1. Tampoco se dispone de mediciones de perplexity por nivel de cuantizacion especificas de este modelo, mas alla del grafico generico de comparacion de quant types enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para pesos (sin cache KV): i1-IQ1_M 8,8 GB; i1-IQ2_M 10,5 GB; i1-Q2_K 10,7 GB; i1-Q2_K_S 10,7 GB; i1-IQ3_XXS 11,4 GB; i1-Q3_K_S 12,3 GB; i1-IQ3_M 12,5 GB; i1-Q3_K_M 13,4 GB; i1-IQ4_XS 14,0 GB; i1-Q4_K_S 15,6 GB; i1-Q4_K_M 16,9 GB; i1-Q6_K 22,7 GB.
- Margen adicional: hay que sumar la cache KV, cuyo tamano depende del contexto efectivo y de la configuracion de atencion del modelo. No se dispone de datos para calcularla con precision, pero con ventanas cercanas a 256.000 tokens la cache puede superar con holgura el tamano de los pesos.
- GPUs de consumo: las cuantizaciones Q4_K_S y Q4_K_M caben en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado. IQ4_XS (14,0 GB) y Q3_K_M (13,4 GB) dejan mas margen. Q6_K (22,7 GB) es muy justa en 24 GB y requiere contexto corto.
- GPUs de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten ejecutar sin problemas las cuantizaciones altas y ventanas de contexto largas.
- Memoria unificada: equipos Apple Silicon de 16-32 GB pueden ejecutar las cuantizaciones IQ2 a IQ4 mediante llama.cpp o LM Studio, con degradacion de calidad en los rangos bajos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui soportan GGUF de forma nativa. vLLM y TGI tienen soporte de GGUF limitado y no garantizan compatibilidad con este repositorio; para servirlos en produccion es preferible partir del modelo base en safetensors.
- Ficheros multiparte: al superar los 50 GB de tamano de repositorio total, algunos ficheros GGUF pueden estar divididos en partes; la model card remite a los README de TheBloke para el procedimiento de concatenacion.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/G4-Jamet-26B-A4B-MK-1-i1-GGUF (este) | 25,2B totales / ~3,8B activos | no confirmado (256K segun la familia) | GGUF i1 (imatrix) | no disponible en el repo | 11 cuantizaciones + imatrix |
| mradermacher/G4-Jamet-26B-A4B-MK-1-GGUF (estatico) | 25,2B totales | no disponible | GGUF estatico | no disponible en el repo | Cuantizaciones estaticas y ficheros mmproj |
| mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF | no disponible | no disponible | GGUF i1 | no disponible en el repo | Variante experimental del mismo linaje |
| Gemma 4 26B A4B IT (Google DeepMind) | 25,2B totales / 3,8B activos | 256K | safetensors (pesos abiertos) | Apache 2.0 | Pesos abiertos; disponible en Modal y otros proveedores |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- No hay ningun benchmark publicado: no es posible estimar la calidad real de las respuestas ni compararla con alternativas sin evaluacion propia.
- Las cuantizaciones bajas degradan la calidad de forma significativa: el propio autor etiqueta IQ1_M como "mostly desperate" y Q2_K_S como "very low quality".
- Idioma: el repositorio declara unicamente ingles. El rendimiento en castellano no esta garantizado y no ha sido evaluado.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, agravado por la ausencia de evaluaciones publicadas.
- Licencia: el repositorio no declara licencia. Aunque la familia base se publique como Apache 2.0 segun los resultados de busqueda, conviene verificar la licencia del modelo base y del fine-tune antes de cualquier uso comercial.
- Modelo de vision: los ficheros mmproj pueden no estar en este repositorio, por lo que el uso multimodal requiere descargar adicionalmente del repositorio de cuantizaciones estaticas.
- Sesgos: no hay informacion disponible sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgos.
- Contexto: la ventana de 256.000 tokens corresponde a la familia Gemma 4, no a una confirmacion en este repositorio; ademas, sostener ese contexto exige una cache KV muy grande, poco viable en GPUs de consumo.
- Madurez: repositorio creado el 2 de octubre de 2026 con 0 descargas y 0 "likes"; no existe validacion de la comunidad.
- Produccion: para cargas de trabajo serias es preferible servir el modelo base en safetensors con vLLM o TGI y reservar los GGUF para inferencia local o entornos con restricciones de privacidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/G4-Jamet-26B-A4B-MK-1-i1-GGUF
- Modelo base: https://huggingface.co/Hastagaras/G4-Jamet-26B-A4B-MK-1
- Cuantizaciones estaticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/G4-Jamet-26B-A4B-MK-1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#G4-Jamet-26B-A4B-MK-1-i1-GGUF
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Variante experimental: https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF
- Variante StyleTune: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-StyleTune-i1-GGUF
- Variante Heretic: https://local-ai-zone.github.io/models/gemma-4-26b-a4b-it-heretic-ara-i1.html
- Ficha de la familia Gemma 4 26B A4B IT en Modal: https://modal.com/library/google/gemma-4-26b-a4b-it
- Proyecto de inferencia de bajo consumo de memoria: https://github.com/drumih/turbo-fieldfare
- Guia sobre cuantizaciones y perplexity (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
