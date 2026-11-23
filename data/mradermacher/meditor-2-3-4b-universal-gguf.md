# mradermacher/Meditor-2-3.4B-Universal-GGUF

## Resumen

Meditor-2-3.4B-Universal es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Yo-Purple, distribuido en formato GGUF por mradermacher. Con 3.511.666.688 parámetros totales, emplea la arquitectura `qwen2_moe` y está etiquetado como derivado de SmolLM2 y orientado a conversación. La versión aquí documentada es una recuantización estática del modelo base `Yo-Purple/Meditor-2-3.4B-Universal`, publicada bajo licencia Apache 2.0.

El modelo se presenta como un modelo conversacional de pequeno tamano con estructura MoE, lo que en teoria permite un coste de inferencia inferior al de un modelo denso del mismo numero de parametros totales. La informacion disponible no detalla el numero de parametros activos, la longitud de contexto ni la composicion del dataset de entrenamiento, por lo que estos datos se marcan como no disponibles.

La relevancia de esta ficha radica en su formato: al ofrecerse en GGUF con cuantizaciones desde Q2_K hasta f16, es desplegable en hardware de consumo mediante llama.cpp u Ollama, lo que lo hace atractivo para prototipado local y experimentacion con arquitecturas MoE de baja huella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en `qwen2_moe` (segun tags del autor) |
| Parametros totales | 3.511.666.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (recuantizacion estatica de pesos safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (`qwen2_moe`), segun los metadatos del autor. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento, el numero de parametros activos por token ni la dimension de las capas ocultas. La etiqueta `smollm2` sugiere una relacion con la familia SmolLM2 de Hugging Face, pero no se confirma en la informacion proporcionada si se trata de una inicializacion, un destilado o una arquitectura inspirada.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion de entrenamiento disponible es la referencia al modelo base `Yo-Purple/Meditor-2-3.4B-Universal` y la etiqueta `unibench-100`, que sugiere un posible benchmark de evaluacion pero cuyo contenido no se detalla.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado.
- Razonamiento general y respuesta a instrucciones: no se documentan capacidades especificas de codigo, matematicas o vision en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar disponible en GGUF con cuantizaciones de 1,4 a 3,8 GB, puede ejecutarse en portatiles con GPU de gama media o incluso en CPU para validar flujos de chat antes de migrar a modelos mayores.
- Experimentacion con arquitecturas MoE en entornos con recursos limitados: permite estudiar el comportamiento de un modelo `qwen2_moe` de ~3,5B parametros totales sin necesidad de infraestructura de datacenter.
- Generacion de texto en ingles para tareas de resumen o reescritura en pipelines offline: su huella reducida facilita el despliegue en entornos con restricciones de memoria.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes GGUF, lo que permite medir el impacto de la cuantizacion en calidad y latencia sobre un mismo modelo base.
- Integracion en aplicaciones de escritorio o edge con llama.cpp: la disponibilidad de binarios GGUF y la licencia Apache 2.0 facilitan su inclusion en productos comerciales.
- Fines educativos y de investigacion: util para estudiar el comportamiento de modelos conversacionales pequenos y su degradacion con cuantizaciones agresivas (Q2_K, Q3_K_S).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,2 GB (Q4_K_M), 3,8 GB (Q8_0) y 7,1 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4-8 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors podria servirse con vLLM o TGI, pero no se confirma compatibilidad en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal (este) | 3,51B totales (MoE) | no disponible | Apache 2.0 | GGUF | Recuantizacion de Yo-Purple |
| SmolLM2 (referencia por tag) | no confirmado | no disponible | no disponible | safetensors/GGUF | El tag `smollm2` sugiere relacion, sin confirmar |
| Qwen2-MoE (familia de referencia) | no disponible | no disponible | no disponible | safetensors/GGUF | Arquitectura base segun tag `qwen2_moe` |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas; los modelos citados se incluyen solo como referencia de familia arquitectonica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, es probable que herede sesgos de su corpus, pero no se confirma.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de ~3,5B parametros, es esperable un riesgo elevado en tareas factuales, aunque no hay evaluacion publicada.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `Yo-Purple/Meditor-2-3.4B-Universal` por si difiere.
- Caveats para produccion: la ausencia de benchmarks, de documentacion sobre parametros activos y de contexto hace arriesgado su uso en produccion sin una evaluacion propia previa; las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-GGUF
- Modelo base: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Meditor-2-3.4B-Universal-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
