# mradermacher/zora-v1.13-GGUF

## Resumen

Zora v1.13 GGUF es la version cuantizada en formato GGUF del modelo sovasoft/zora-v1.13, un LLM denso de 8.190.735.360 parametros (aproximadamente 8,19 B) desarrollado por Sovasoft y convertido a GGUF por mradermacher. El modelo esta construido sobre la arquitectura Qwen3-8B, segun la informacion publica de terceros, y esta especializado en las lenguas de los Balcanes y el sudeste de Europa: serbio, croata, bosnio, macedonio, esloveno, albanes, montenegrino, bulgaro, griego, turco, rumano y hungaro. La licencia es Apache 2.0.

Su propuesta diferencial no es el rendimiento bruto, sino el comportamiento "honesto": el modelo esta disenado para no alucinar, presentar perspectivas multiples sobre temas controvertidos y declarar explicitamente cuando no conoce una respuesta. Esto lo posiciona como una alternativa para aplicaciones de retrieval-augmented generation (RAG) y atencion al cliente en una region donde los modelos multilingues generalistas suelen ofrecer una cobertura pobre y sesgada.

Esta ficha cubre especificamente el repositorio de cuantizaciones GGUF, no los pesos originales en safetensors. La relevancia practica del artefacto es que permite ejecutar un modelo de 8 B en hardware de consumo (desde 3,4 GB para Q2_K) sin depender de infraestructura GPU en la nube, algo critico para despliegues en la region balcanica y para organizaciones con requisitos de soberania de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3-8B segun informacion de terceros (Featherless) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Confirmadas en la tabla del repositorio: Q2_K, Q4_K_S, f16. Anunciadas en las etiquetas internas del model card: Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16. Las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion |
| Idiomas soportados | sr (serbio), hr (croata), bs (bosnio), mk (macedonio), sl (esloveno), sq (albanes), cnr (montenegrino), bg (bulgaro), el (griego), tr (turco), ro (rumano), hu (hungaro) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en safetensors |
| Modelo base | sovasoft/zora-v1.13 |
| Tamano del repositorio | 68,8 GB |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 8,19 B de parametros construido sobre Qwen3-8B, segun la ficha de Featherless recogida en la busqueda. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT especifico. Tampoco se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, capas hibridas SSM) mas alla de lo heredado del modelo base.

Lo unico documentado en el material disponible es la innovacion a nivel de comportamiento: el entrenamiento esta orientado a producir respuestas honestas, con reconocimiento explicito de desconocimiento y presentacion de multiples perspectivas en temas disputados (etiqueta `honest-ai`). Las etiquetas del model card incluyen tambien `rag`, lo que sugiere que el modelo fue ajustado o evaluado para su uso en pipelines de recuperacion aumentada. El repositorio de mradermacher sigue su procedimiento habitual de cuantizacion estatica: conversion a formato GGUF mediante llama.cpp, sin publicacion de cuantizaciones ponderadas por imatrix.

## Capacidades

- Generacion de texto conversacional multilingue en 12 lenguas del sudeste europeo, con la etiqueta `conversational` declarada explicitamente.
- Comportamiento "honesto": declaracion explicita de desconocimiento en lugar de generar contenido inventado, y presentacion de multiples perspectivas sobre temas controvertidos.
- Orientacion a RAG: la etiqueta `rag` indica idoneidad para flujos de recuperacion + generacion, presumiblemente con grounding en contexto proporcionado.
- Cobertura linguistica regional poco frecuente: variantes del serbocroata (sr, hr, bs, cnr) tratadas como lenguas diferenciadas, mas macedonio, esloveno, albanes, bulgaro, griego, turco, rumano y hungaro.
- Compatibilidad con endpoints declarada mediante la etiqueta `endpoints_compatible`.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no confirmado en la informacion disponible, pese a que la familia Qwen3 lo incorpora en algunos de sus modelos.
- Vision, audio u otras modalidades: no disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en mercados balcanicos: el modelo puede mantener conversaciones multi-turno en serbio, croata, bosnio o bulgaro sin recurrir a un modelo generalista con cobertura pobre de estas lenguas. El comportamiento honesto reduce el riesgo de que el bot invente politicas de empresa.
- RAG sobre documentacion legal y administrativa: indexar legislacion nacional, pliegos publicos o normativa sectorial y usar Zora como generador con grounding. La tendencia declarada a admitir desconocimiento encaja mejor con requisitos de trazabilidad que un modelo propenso a alucinar.
- Traduccion y localizacion entre las 12 lenguas cubiertas: util para empresas que operan en varios paises del sudeste europeo y necesitan traducir contenidos de marketing, soporte o documentacion interna, especialmente en combinaciones de baja disponibilidad como albanes-esloveno o macedonio-griego.
- Asistente educativo y divulgativo sobre historia y politica regional: la capacidad declarada de presentar multiples perspectivas sobre temas contestados permite construir herramientas de estudio que expongan las distintas narrativas nacionales en lugar de imponer una sola.
- Analisis y clasificacion de contenido multilingue: procesamiento de resenas, tickets, encuestas o comentarios en redes sociales en cualquiera de las 12 lenguas, con salida estructurada, para equipos de producto o de investigacion de mercado.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q2_K (3,4 GB) y Q4_K_S (4,9 GB), es viable ejecutar el modelo en un portatil o en una estacion de trabajo sin GPU dedicada de gama alta, algo relevante para ONGs, administraciones locales y equipos con restricciones de presupuesto.
- Procesamiento de datos sensible con requisitos de soberania: sectores como salud, banca o administracion publica en la region pueden ejecutar el modelo on-premise, sin enviar datos de ciudadanos a APIs externas.
- Generacion aumentada en herramientas internas de documentacion: redaccion asistida de informes o resumenes en la lengua local del empleado, manteniendo el contenido dentro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web no ha devuelto evaluaciones comparativas del modelo base sovasoft/zora-v1.13. La unica referencia de rendimiento presente en el material es el grafico comparativo de perplejidad entre tipos de cuantizacion enlazado en el model card (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que es generico y no especifico de este modelo.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del tamano de archivo de cada cuantizacion mas el overhead tipico de KV cache, buffers de llama.cpp y contexto:

| Cuantizacion | Tamano de archivo | VRAM estimada (contexto moderado) | GPU de referencia |
|---|---|---|---|
| f16 | 16,5 GB | ~18-20 GB | RTX 4090 (24 GB), A100 40 GB, L40S, H100 |
| Q4_K_S | 4,9 GB | ~6,5-8 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, Apple Silicon unificado |
| Q2_K | 3,4 GB | ~5-6 GB | GTX 1660 6 GB, RTX 3050 8 GB, iGPU con memoria compartida |

- Cabe en GPU de consumo: si. Q4_K_S entra en cualquier GPU con 8 GB o mas de VRAM; Q2_K entra en GPUs de 6 GB. La version f16 requiere 24 GB o mas.
- Inferencia en CPU: viable con Q4_K_S y Q2_K; un modelo de 8 B en Q4 es ejecutable en CPU moderna con suficiente RAM (se recomienda 16 GB de RAM de sistema como minimo). El rendimiento exacto depende del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, GGUF Loader y cualquier runtime compatible con GGUF. vLLM ofrece soporte parcial de GGUF pero no es la via recomendada para este formato.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa cuantitativa fiable, ya que no se han publicado benchmarks del modelo. La siguiente tabla recoge unicamente los datos verificables del ecosistema inmediato del modelo:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| zora-v1.13-GGUF (este repositorio) | 8,19 B | no disponible | 12 (Balcanes y sudeste de Europa) | apache-2.0 | GGUF | Cuantizaciones Q2_K, Q4_K_S y f16 confirmadas |
| sovasoft/zora-v1.13 (modelo base) | 8,19 B | no disponible | 12 | apache-2.0 | safetensors | Pesos originales sin cuantizar |
| mradermacher/zora-v1.12-GGUF (version anterior) | no disponible | no disponible | 12 | apache-2.0 | GGUF | Predecesor directo de la version 1.13 |
| mradermacher/zora-v1.12-i1-GGUF | no disponible | no disponible | 12 | apache-2.0 | GGUF | Variante con cuantizaciones imatrix de la version 1.12 |
| Qwen3-8B (arquitectura base declarada) | 8 B (aproximado) | no disponible | no disponible | no disponible | safetensors | Modelo del que deriva Zora segun informacion de terceros |

No se han identificado en la busqueda modelos comparables especificamente entrenados para el conjunto de 12 lenguas del sudeste europeo, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o fidelidad multilingue. Cualquier decision de adopcion en produccion deberia ir precedida de una evaluacion propia en el dominio objetivo.
- Sesgos no documentados: no se ha publicado informacion sobre la composicion del dataset de entrenamiento ni sobre auditorias de sesgo. En un modelo orientado a temas regionales potencialmente sensibles (historia, politica, identidades nacionales), el riesgo de sesgo no evaluado es relevante.
- Riesgo de alucinacion: aunque el modelo se presenta como "honesto" y propenso a admitir desconocimiento, se trata de una caracteristica declarada por el autor sin verificacion independiente. No debe tratarse como garantia.
- Longitud de contexto desconocida: no se ha especificado la ventana de contexto del modelo base ni si se ha modificado respecto a Qwen3-8B. Esto limita el diseno de aplicaciones RAG con documentos largos y obliga a verificar empiricamente antes del despliegue.
- Cobertura linguistica limitada fuera de la region: el ajuste esta centrado en 12 lenguas del sudeste europeo. El rendimiento en castellano, ingles u otras lenguas no esta documentado y probablemente sea inferior al de modelos generalistas del mismo tamano.
- Cuantizaciones de baja precision: Q2_K degrada notablemente la calidad respecto a f16. Para tareas que requieran matices (razonamiento, temas delicados), se recomienda Q4_K_S o superior.
- Cuantizaciones ponderadas no disponibles: el propio autor indica que no habia cuantizaciones ponderadas por imatrix en el momento de la publicacion, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- Soporte de tool calling no confirmado: si el pipeline de produccion depende de function calling o de modo agente, hay que validarlo antes de asumirlo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con obligacion de conservar el aviso de copyright y la licencia, e incluir un archivo NOTICE si existe. No impone restricciones de uso, pero el usuario asume toda la responsabilidad sobre el contenido generado.
- Repositorio sin traccion: cero descargas y cero likes en los metadatos de HuggingFace, lo que implica ausencia de validacion por parte de la comunidad y un soporte practicamente inexistente.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/zora-v1.13-GGUF
- Modelo base: https://huggingface.co/sovasoft/zora-v1.13
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#zora-v1.13-GGUF
- Ficha del modelo base en Featherless: https://featherless.ai/models/sovasoft/zora-v1.13
- Version anterior (v1.12) en GGUF: https://huggingface.co/mradermacher/zora-v1.12-GGUF
- Version anterior (v1.12) con cuantizaciones imatrix: https://huggingface.co/mradermacher/zora-v1.12-i1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de GGUF de TheBloke (referencia citada en el model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- GGUF Loader (runtime local de GGUF): https://ggufloader.github.io/
- Entrada de registro en free2aitools: https://free2aitools.com/model/mradermacher/zora-9b-v1-gguf
- nethype GmbH (empresa que cede infraestructura al cuantizador): https://www.nethype.de/
