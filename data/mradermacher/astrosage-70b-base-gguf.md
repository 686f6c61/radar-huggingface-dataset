# mradermacher/AstroSage-70B-base-GGUF

## Resumen

AstroSage-70B-base es un modelo de lenguaje de gran tamano (70.553.706.560 parametros) desarrollado por AstroMLab y especializado en el dominio de la astrofisica. Esta ficha cubre la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base esta disenado para tareas de investigacion astronomica, razonamiento cientifico y procesamiento de literatura tecnica del dominio.

La relevancia de esta publicacion radica en que un modelo de 70B especializado en astrofisica pueda desplegarse localmente con cuantizaciones que van desde 26,5 GB (Q2_K) hasta 75,1 GB (Q8_0), abriendo su uso a investigadores sin acceso a clusters de GPU de gran escala. El repositorio incluye 11 variantes de cuantizacion estaticas, incluyendo tipos K-quant e IQ4_XS, y existe una version paralela con cuantizacion ponderada/imatrix en el repositorio `AstroSage-70B-base-i1-GGUF`.

No se dispone de informacion publica sobre la longitud de contexto, la licencia exacta ni los detalles de entrenamiento en la informacion proporcionada; estos datos deberian consultarse en el repositorio del modelo base. El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato de pesos y el tamano) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en AstroSage-70B-base. El modelo base pertenece a AstroMLab, un laboratorio orientado a modelos de lenguaje para astrofisica, y por el numero de parametros (70,5B) y el formato de pesos se corresponde con una arquitectura transformer densa de la familia de modelos de 70B. Cualquier detalle adicional sobre atencion, capas o innovaciones tecnicas debe consultarse en la model card del repositorio original `AstroMLab/AstroSage-70B-base`.

La contribucion de esta publicacion es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix) del modelo base, manteniendo el vocabulario y la tokenizacion originales. Para usuarios que requieran mayor calidad por bit, existe una version con cuantizacion ponderada en `mradermacher/AstroSage-70B-base-i1-GGUF`.

## Capacidades

- Generacion de texto en ingles con enfasis en dominio cientifico y astrofisico.
- Razonamiento sobre literatura tecnica y conceptos de astronomia (inferido del nombre y proposito del modelo base; no confirmado en la informacion disponible).
- Ejecucion local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, etc.).
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el tag de idioma.

## Casos de uso

- Investigacion astrofisica asistida: consultas y sintesis sobre conceptos de astronomia y fisica del cosmos, aprovechando la especializacion del modelo base en el dominio.
- Procesamiento local de documentacion cientifica: resumen y extraccion de informacion de articulos y notas tecnicas en ingles, ejecutando el modelo en estaciones de trabajo con GPU de consumo mediante cuantizaciones Q4_K_M (42,6 GB).
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local con llama.cpp, permite trabajar con datos de investigacion no publicables sin enviarlos a APIs externas.
- Prototipado de asistentes cientificos: uso como base para experimentos de generacion de texto especializado antes de invertir en infraestructura de mayor escala.
- Educacion y divulgacion: generacion de explicaciones y material didactico sobre astronomia en ingles, con la cautela de verificar datos facticos por riesgo de alucinacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes que permiten medir el compromiso calidad/tamano en un modelo de 70B para tareas de dominio, util para calibrar pipelines de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamanos de archivo del repositorio): Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB.
- Para cargar el modelo completo en VRAM se necesita al menos una GPU con memoria equivalente al tamano del archivo mas el contexto; una A100 80GB o H100 80GB cubren Q8_0, mientras que Q4_K_M requiere aproximadamente 48 GB (A6000, A100 40GB con offload parcial, o dos RTX 4090 de 24 GB).
- En GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo ni siquiera en Q2_K; es posible con offload parcial a RAM del sistema (CPU+GPU), a costa de latencia. Configuraciones con 64 GB o mas de RAM y una GPU de 24 GB permiten ejecutar Q4_K_M con offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Los archivos Q6_K y Q8_0 estan divididos en dos partes que deben concatenarse antes de su uso.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AstroSage-70B-base (GGUF, este repo) | 70,5B | no disponible | GGUF | no disponible | Especializado en astrofisica, solo ingles |
| AstroSage-70B-base (original) | 70,5B | no disponible | safetensors | no disponible | Modelo base sin cuantizar de AstroMLab |
| AstroSage-70B-base-i1-GGUF | 70,5B | no disponible | GGUF (imatrix) | no disponible | Misma base con cuantizacion ponderada, mayor calidad por bit |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria; la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo especializado en astrofisica: su rendimiento en tareas generales puede ser inferior al de modelos de proposito general del mismo tamano.
- Solo ingles: no hay soporte documentado de castellano ni otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar referencias, datos o resultados cientificos plausibles pero incorrectos; es imprescindible la verificacion por expertos.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar el repositorio del modelo base; tratar como no apto para produccion comercial hasta verificar.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S, Q3_K_M) degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- Los archivos Q6_K y Q8_0 estan partidos en dos ficheros que deben concatenarse correctamente antes de cargarlos.
- No se documentan capacidades de tool calling, agentes ni vision; no asumir su disponibilidad.
- El modelo base no incluye informacion publica sobre sesgos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AstroSage-70B-base-GGUF
- Modelo base: https://huggingface.co/AstroMLab/AstroSage-70B-base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/AstroSage-70B-base-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#AstroSage-70B-base-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
