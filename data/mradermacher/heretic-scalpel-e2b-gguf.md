# mradermacher/Heretic-Scalpel-E2B-GGUF

## Resumen

Heretic-Scalpel-E2B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo aifeifei798/Heretic-Scalpel-E2B, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. Se trata, por tanto, de una redistribucion optimizada para llama.cpp y compatibles, no de un modelo entrenado desde cero: el trabajo aportado consiste en generar variantes de cuantizacion (Q2_K hasta f16, mas complementos multimodales mmproj).

El modelo subyacente declara 4.647.450.147 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de ~4,6 mil millones de parametros. La nomenclatura "E2B" y el enlace de licencia incluido en la model card (Gemma 4) apuntan a un derivado de la familia Gemma con parametros efectivos, aunque la informacion disponible no confirma la arquitectura exacta ni el mecanismo de activacion. El modelo base se presenta como una version "abliterated" (eliminacion automatica del alineamiento de seguridad) del modelo original.

Su relevancia actual es la de un modelo pequeno, ejecutable en GPU de consumo, orientado a generacion conversacional en ingles y sin las restricciones de rechazo tipicas de los modelos alineados. La licencia declarada en los metadatos es apache-2.0, pero el enlace de licencia de la model card remite a los terminos de Gemma 4, una discrepancia que conviene resolver antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura E2B y el enlace a Gemma 4 sugieren un derivado de Gemma, sin confirmar) |
| Parametros totales | 4.647.450.147 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (complemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (metadatos); la model card enlaza a la licencia de Gemma 4 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |
| Tamano del repositorio | 49,6 GB |
| Autor de la cuantizacion | mradermacher |
| Modelo base | aifeifei798/Heretic-Scalpel-E2B |
| Fecha de publicacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de ajuste. Lo unico verificable es que los pesos originales suman 4.647.450.147 parametros y que el modelo base se distribuye en safetensors bajo la libreria transformers.

El rasgo tecnico diferencial del modelo base es su condicion de "abliterated": segun la documentacion del proyecto Heretic (github.com/p-e-w/heretic), se trata de una implementacion de ablacion direccional ("abliteration") combinada con un optimizador de parametros basado en TPE y Optuna, que elimina el alineamiento de seguridad sin necesidad de post-entrenamiento costoso. La presencia de archivos mmproj en este repositorio indica que la cuantizacion contempla entrada multimodal (proyeccion de imagenes) para su uso en llama.cpp, aunque no se detalla que modalidades cubre exactamente. Esta ficha describe la cuantizacion GGUF; las caracteristicas de entrenamiento pertenecen al modelo base y no se documentan aqui.

## Capacidades

- Generacion de texto conversacional en ingles, con el tag conversational en los metadatos del repositorio.
- Respuestas sin las formulas de rechazo y advertencias moralizantes habituales en modelos alineados, segun la descripcion del modelo base.
- Soporte de entrada multimodal a traves de los archivos mmproj incluidos (proyeccion multimodal para llama.cpp); el alcance exacto (vision, audio u otros) no esta documentado.
- Ejecucion local en CPU y GPU mediante el ecosistema GGUF.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos de desarrollo: con cuantizaciones de 3,1 a 3,7 GB (Q2_K a Q5_K_M), el modelo cabe en practicamente cualquier GPU de consumo y permite trabajar sin conexion, lo que encaja con el planteamiento del modelo base de operar desconectado de la nube.
- Prototipado de aplicaciones conversacionales en ingles: la variante Q4_K_M (3,5 GB) ofrece un equilibrio entre velocidad y calidad adecuado para iterar sobre prompts y flujos conversacionales sin coste de API.
- Experimentacion en investigacion sobre alineamiento y seguridad: al ser una version abliterated, sirve como sujeto de estudio para comparar el comportamiento de un modelo con y sin alineamiento de seguridad en tareas controladas.
- Pipelines de generacion de texto por lotes en hardware modesto: la cuantizacion Q8_0 (5,1 GB) permite procesar volumenes altos de texto en una unica GPU de 8-12 GB.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece la misma red en ocho niveles de precision distintos, lo que facilita medir el impacto de la cuantizacion en la perplejidad y la calidad de salida sobre un mismo modelo.
- Despliegue con entrada de imagenes en llama.cpp: los archivos mmproj-f16 y mmproj-Q8_0 habilitan escenarios multimodal en el mismo runtime, siempre que el modelo base soporte la modalidad correspondiente.
- Fine-tuning posterior o destilacion: los pesos base en safetensors (4,65B parametros) son un punto de partida manejable para ajustes con LoRA en una sola GPU de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del archivo mas overhead de contexto y cache KV, valores orientativos calculados a partir del tamano de cada cuantizacion):
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,2-3,4 GB): ~4,5 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (3,4-3,5 GB): ~5 GB.
  - Q5_K_S / Q5_K_M (3,7 GB): ~5,5 GB.
  - Q6_K (3,9 GB): ~6 GB.
  - Q8_0 (5,1 GB): ~7 GB.
  - f16 (9,4 GB): ~11-12 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas permite ejecutar las cuantizaciones de 4 bits. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB cubren todas las variantes, incluida f16. Para despliegue en servidor, A100 o H100 no son necesarias por tamano, aunque permitirian mayor concurrencia.
- Cabe en GPU de consumo: si, en todas las variantes. Incluso la f16 (9,4 GB) entra en tarjetas de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime con soporte GGUF. Para el modelo base en safetensors, vLLM o TGI serian las opciones habituales, aunque no se confirma compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Heretic-Scalpel-E2B-GGUF (mradermacher) | 4,65B (base safetensors) | no disponible | en | apache-2.0 declarada, enlace a Gemma 4 | GGUF | Cuantizacion estatica; 0 descargas y 0 likes en el momento del analisis |
| Heretic-Scalpel-E2B (aifeifei798) | 4,65B | no disponible | en | apache-2.0 / enlace a Gemma 4 | safetensors | Modelo base abliterated; origen de esta cuantizacion |
| Heretic-Scalpel-E2B-i1-GGUF (mradermacher) | 4,65B | no disponible | en | apache-2.0 | GGUF | Variante con cuantizaciones ponderadas (imatrix), referenciada en la model card |
| gemma-4-E2B-it-heretic-ara-GGUF (mradermacher) | no disponible | no disponible | no disponible | no disponible | GGUF | Otro derivado heretic de la familia E2B publicado por el mismo autor |

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado deliberadamente el alineamiento de seguridad, por lo que puede generar contenido que otros modelos rechazarian. No es adecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion: inherente a los modelos de esta escala; no se han publicado evaluaciones de fidelidad factual para este modelo.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado, por lo que el rendimiento en castellano es impredecible.
- Licencia ambigua: los metadatos indican apache-2.0, pero la model card enlaza a los terminos de licencia de Gemma 4. Debe verificarse cual prevalece antes de cualquier uso comercial o redistribucion.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no existen informes independientes de calidad, estabilidad ni comportamiento en produccion.
- Este repositorio es una cuantizacion de terceros: los posibles fallos de calidad derivan del modelo base y del proceso de cuantizacion, no de un entrenamiento propio.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M.
- Longitud de contexto no documentada: no puede planificarse un caso de uso con contexto largo sin verificar previamente el limite real del modelo base.
- Compatibilidad multimodal sin confirmar: los archivos mmproj existen, pero no se detalla que modalidades soporta el modelo base ni con que calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-i1-GGUF
- Pagina de resumen y descargas: https://hf.tst.eu/model#Heretic-Scalpel-E2B-GGUF
- Herramienta Heretic (abliteration automatica): https://github.com/p-e-w/heretic
- Licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Otro derivado heretic E2B de mradermacher: https://huggingface.co/mradermacher/gemma-4-E2B-it-heretic-ara-GGUF
- Guia de modelos abliterated: https://locallyuncensored.com/blog/abliterated-models-guide.html
