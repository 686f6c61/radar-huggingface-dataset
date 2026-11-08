# mradermacher/LFM3-Lobotomized-2B-GGUF

## Resumen

LFM3-Lobotomized-2B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo junkdogjoe/LFM3-Lobotomized-2B, un ajuste fino derivado de la familia LFM3 (Liquid Foundation Models 3) de Liquid AI. El trabajo de cuantizacion lo realiza mradermacher, un colaborador habitual de la comunidad open source que publica versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base esta etiquetado como orientado a edge y conversacional, con soporte declarado para 16 idiomas.

El modelo cuenta con aproximadamente 1.728 millones de parametros (1,73 B) segun los pesos en safetensors del repositorio, lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo. El nombre "Lobotomized" sugiere un ajuste fino que modifica o elimina ciertos comportamientos del modelo original, aunque la model card no documenta la naturaleza exacta de esa modificacion. El repositorio incluye tanto cuantizaciones estaticas de llama.cpp (Q2_K a Q8_0 y f16) como ficheros mmproj, lo que indica soporte multimodal en el modelo base.

La relevancia de esta ficha radica en que permite desplegar un modelo conversacional pequeno y multilingue en entornos con recursos limitados, incluyendo CPU o GPUs de gama baja, mediante el ecosistema GGUF. No obstante, la informacion publicada sobre el entrenamiento, los benchmarks y las capacidades exactas es muy escasa, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; tag `liquid`, `lfm3`, requiere `custom_code` en transformers) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `other`; enlace a LICENSE en el repo base) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Los tags del repositorio (`liquid`, `lfm3`, `edge`, `conversational`, `custom_code`) indican que el modelo base pertenece a la familia LFM3 de Liquid AI, disenada para despliegue en dispositivos edge, y que requiere codigo personalizado para cargarse en transformers. El numero de parametros (1,73 B) es coherente con un modelo pequeno de proposito general.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. El sufijo "Lobotomized" en el nombre del modelo base sugiere un ajuste fino que altera el comportamiento del modelo original, pero no hay informacion publica sobre que se modifico ni con que datos. Esta ausencia de documentacion es una limitacion importante para evaluar el modelo en produccion.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Soporte multilingue declarado para 16 idiomas (entre ellos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco).
- Capacidades multimodales: la presencia de ficheros `mmproj` (Q8_0 y f16) indica que el modelo base admite entrada de imagenes o modalidad adicional, aunque no se detalla el alcance.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con cuantizaciones Q4_K_M de ~1,2 GB, el modelo puede ejecutarse en CPU o GPUs integradas para chatbots de escritorio sin conexion.
- Prototipado rapido de aplicaciones multilingues: el soporte declarado de 16 idiomas permite construir demos de traduccion o atencion al cliente en varios idiomas con un unico modelo pequeno.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo de 1,73 B en GGUF, puede desplegarse con llama.cpp en instancias CPU para tareas de clasificacion, resumen o generacion de bajo coste.
- Aplicaciones edge con requisitos de privacidad: su tamano reducido permite ejecutarlo en portatiles o mini-PC, manteniendo los datos del usuario en local.
- Experimentacion academica y docente: sirve como modelo de referencia para estudiar cuantizacion, ajuste fino y comportamiento de modelos pequenos sin grandes recursos de computo.
- Evaluacion de variantes "lobotomized": util para investigadores que quieran comparar el comportamiento del ajuste frente al LFM3 original en tareas conversacionales.
- Integracion en pipelines de generacion aumentada (RAG) ligeros: combinado con un indice vectorial pequeno, puede responder preguntas sobre documentacion en entornos con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. El fichero mmproj anade 0,4 GB (Q8_0) o 0,7 GB (f16) si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 o Q5 con contexto moderado; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. Para f16 se recomienda al menos 6-8 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, y servidores compatibles con GGUF; el modelo base requiere transformers con `custom_code` para cargarse en su formato original.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Lobotomized-2B-GGUF (este) | ~1,73 B | no disponible | lfm1.0 | GGUF | Ajuste "lobotomized" de LFM3; 16 idiomas; mmproj multimodal |
| LFM3 base (familia Liquid AI) | no disponible | no disponible | lfm1.0 | transformers/GGUF | Modelo original del que deriva; sin datos de benchmark en esta ficha |
| Modelos pequenos GGUF de ~2B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2 B | 32k-128k (segun modelo) | Apache 2.0 / Llama | GGUF | Alternativas consolidadas con benchmarks publicos; no disponibles en la informacion de esta busqueda |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; los modelos citados se incluyen solo como referencia de categoria y sus datos no proceden de la busqueda realizada.

## Limitaciones y advertencias

- Documentacion muy escasa: no hay informacion sobre arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta validar su calidad en produccion.
- El sufijo "Lobotomized" indica una modificacion deliberada del comportamiento del modelo original; se desconoce que capacidades o salvaguardas se han alterado, por lo que no se recomienda su uso en aplicaciones sensibles sin evaluacion previa.
- Riesgo de alucinacion: al ser un modelo de ~2 B, la tasa de errores facticos es previsiblemente alta en comparacion con modelos mayores; no hay mediciones publicadas.
- Sesgos: no documentados; los modelos pequenos y los ajustes finos sin documentacion pueden amplificar sesgos presentes en los datos de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada; el soporte de 16 idiomas es declarado pero no verificado con benchmarks.
- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia open source estandar; es imprescindible revisar el fichero LICENSE del repositorio base antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Lobotomized-2B-GGUF
- Modelo base: https://huggingface.co/junkdogjoe/LFM3-Lobotomized-2B
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-Lobotomized-2B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
