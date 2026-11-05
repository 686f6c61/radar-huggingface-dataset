# mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, realizada por el usuario mradermacher, especialista habitual en publicar versiones cuantizadas de modelos abiertos. El modelo base es una variante "heretic" (tambien etiquetada como uncensored, decensored y abliterated) de un modelo de la familia Qwen3.8 de 27B de parametros, orientada a eliminar los mecanismos de rechazo y censura del modelo original.

El repositorio contiene unicamente pesos cuantizados en formato GGUF generados con la tecnica imatrix (importance matrix), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 26.895.998.464 parametros reales (segun los safetensors del modelo base) y una licencia Apache 2.0.

La relevancia de esta ficha radica en que documenta una publicacion reciente (noviembre de 2026) sin descargas ni interacciones registradas, lo que indica que se trata de una cuantizacion de un modelo derivado de un modelo derivado, con informacion tecnica limitada al propio proceso de cuantizacion. El modelo esta etiquetado como vision model por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.8; arquitectura transformer presumible pero no confirmada en la informacion disponible) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,8 GB), i1-IQ3_M (12,7 GB), i1-Q4_K_S (15,7 GB); el autor menciona ademas IQ3_XXS como alternativa preferible a Q2_K; el repositorio estatico incluye Q2_K_S, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XS, IQ3_S, IQ3_M, small-IQ4_NL |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Qwen3.8-27B" sugiere una variante de la familia Qwen3 con aproximadamente 27B de parametros, pero no se confirma si emplea atencion estandar, atencion lineal, mezcla de expertos (MoE) u otra innovacion. El sufijo "MPOA" no se explica en la model card disponible.

El modelo base ricoardyoung/Qwen3.8-27B-MPOA-heretic se presenta como una variante "heretic", termino que en la comunidad open source designa modelos sometidos a tecnicas de abliteration o decensoring para eliminar las capas de rechazo aprendidas durante el alineamiento (RLHF/DPO). No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni los metodos exactos de alineamiento o abliteration aplicados. La cuantizacion realizada por mradermacher emplea matrices de importancia (imatrix) para preservar la calidad en tasas de bits bajas, una tecnica estandar en el ecosistema llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta conversational en el repositorio).
- Capacidades de vision: el autor de la cuantizacion etiqueta explicitamente el modelo como "vision model" y remite a los archivos mmproj del repositorio estatico para el procesamiento de imagenes, aunque no se detallan las capacidades visuales concretas.
- Modelo "uncensored"/"abliterated": orientado a responder sin los filtros de rechazo tipicos de los modelos alineados, lo que puede incluir contenido sensible.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo, utilidad y coherencia en dominios sensibles, gracias a su naturaleza "heretic" y reproducible.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los filtros de rechazo de modelos alineados resultarian limitantes; el formato GGUF permite ejecutarlo localmente sin depender de APIs.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 10,8 a 15,7 GB, el modelo cabe en GPUs de consumo de 16-24 GB de VRAM (RTX 4080, RTX 4090) mediante llama.cpp, lo que facilita prototipado offline sin costes de API.
- Analisis de imagenes en local: si se emplean los archivos mmproj del repositorio estatico, el modelo podria utilizarse para tareas de descripcion o comprension de imagenes en entornos aislados, aunque las capacidades visuales concretas no estan documentadas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece multiples niveles de cuantizacion (desde IQ1 hasta Q6_K), lo que permite a investigadores medir la degradacion de calidad (perplejidad) segun la tasa de bits, con la matriz de importancia incluida para generar cuantizaciones propias.
- Fine-tuning o experimentacion sobre modelos derivados: al estar bajo licencia Apache 2.0, el modelo puede servir como base para experimentos de destilacion, adaptacion o estudio de sesgos en modelos abliterated, siempre que se respeten las obligaciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11-13 GB para i1-Q2_K (10,8 GB de pesos), 13-15 GB para i1-IQ3_M (12,7 GB) y 16-18 GB para i1-Q4_K_S (15,7 GB), asumiendo overhead de contexto y KV cache.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para las cuantizaciones Q4_K_S e IQ3_M; GPUs con 12 GB (RTX 3060, RTX 4070) solo para Q2_K o cuantizaciones menores del repositorio estatico (IQ2, IQ1).
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas para las cuantizaciones principales; las variantes IQ2/IQ1 del repositorio estatico permiten su uso en GPUs de 8-12 GB con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (safetensors) requeriria transformers, vLLM o TGI, pero esta cuantizacion esta pensada para llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-i1-GGUF (este) | 26,9B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion imatrix de un modelo abliterated; solo ingles; vision segun etiqueta |
| richardyoung/Qwen3.8-27B-MPOA-heretic (base) | 26,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; requiere transformers |
| mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF (estatico) | 26,9B | no disponible | Apache 2.0 | GGUF (estatico) | Misma base, cuantizaciones sin imatrix y archivos mmproj |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (abliterated/uncensored de ~27B) en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminacion de los mecanismos de rechazo puede producir contenido ofensivo, peligroso o ilegal; no es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como modelo derivado y cuantizado, la degradacion por cuantizacion (especialmente en IQ2/IQ1) puede aumentar la incoherencia.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto no esta documentada; no debe asumirse la del modelo Qwen original sin verificacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base declara la misma licencia; conviene verificar las condiciones del modelo original de Qwen y de los pesos derivados antes de un despliegue en produccion.
- Trazabilidad limitada: es una cuantizacion de un modelo derivado de un modelo derivado, sin benchmarks publicados ni documentacion del proceso de abliteration; la reproducibilidad declarada en las etiquetas no esta respaldada por artefactos visibles en la model card.
- Sin descargas ni validacion de la comunidad: el repositorio no registra descargas ni likes, por lo que no hay evidencia externa de calidad o estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
