# mradermacher/loopl-0.8b-i1-GGUF

## Resumen

loopl-0.8b-i1-GGUF es el conjunto de cuantizaciones GGUF (formato imatrix/i1) del modelo cagataydev/loopl-0.8b, publicadas por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. No es un modelo entrenado desde cero por este autor: se trata de una redistribucion optimizada del modelo base, con licencia Apache-2.0 y orientada explicitamente a despliegue on-device, agentes y tool calling.

El modelo base declara 752.393.024 parametros (aproximadamente 0,75 mil millones) y un pipeline image-text-to-text, es decir, acepta entrada de imagen y texto. Los tags del repositorio apuntan a la familia Qwen3.5 (qwen3.5, qwen3_5) y a un ajuste por SFT sobre el dataset cagataydev/loopl-train. El repositorio de cuantizacion ocupa 11,0 GB en total porque incluye 24 variantes de cuantizacion distintas, desde IQ1_S (~0,4 GB) hasta Q6_K (~0,7 GB), no porque el modelo en si sea grande.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo multimodal con capacidades de agente en hardware muy modesto (CPU, iGPU, movil, SBC); por otro, sirve como ejemplo de flujo de cuantizacion con importancia matrix (imatrix) sobre un modelo multimodal pequeno, donde conviene elegir cuidadosamente el equilibrio tamano/calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; los tags indican la familia Qwen3.5 (qwen3.5, qwen3_5) y pipeline image-text-to-text (transformer multimodal) |
| Parametros totales | 752.393.024 (0,75 B, dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas imatrix) |
| Idiomas soportados | ingles (en), turco (tr) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Tamano de cada quant | de 0,4 GB (IQ1_S/IQ1_M) a 0,7 GB (Q6_K); Q4_K_M e IQ4_XS en 0,6 GB |
| Ficheros mmproj (vision) | no incluidos en este repositorio; disponibles en el repositorio estatico mradermacher/loopl-0.8b-GGUF |
| Descargas / likes | 141 descargas, 0 likes |
| Fecha de publicacion | 2026-10-07 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Lo que si consta es que el pipeline declarado es image-text-to-text, que los tags incluyen vision y que se trata de un modelo ajustado mediante SFT (supervised fine-tuning) sobre el dataset cagataydev/loopl-train. Los tags qwen3.5 y qwen3_5 sugieren que la base pertenece a esa familia, lo que implicaria un transformer decoder-only con adaptaciones multimodales, pero este extremo no se confirma en la model card del repositorio de cuantizacion. No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO.

En cuanto al proceso de cuantizacion, si hay datos concretos: el autor aplica cuantizacion con importancia matrix (imatrix), generada con recursos de calculo aportados por el colaborador nicoboss, con quantize_version 2, output_tensor_quantised 1 y convert_type hf. Esto significa que las tablas de importancia se calcularon sobre el modelo original en precision completa para ponderar mejor los pesos, lo que en la practica produce cuantizaciones de baja tasa de bits con menos degradacion que las cuantizaciones estaticas equivalentes. El autor mantiene ademas un repositorio paralelo de cuantizaciones estaticas (sin imatrix) para el mismo modelo, lo que permite comparar ambos enfoques.

## Capacidades

- Generacion de texto conversacional en ingles y turco, con soporte declarado de conversaciones multi-turno (tag conversational).
- Tool calling / function calling, segun los tags tool-calling y agent.
- Flujos de agente y razonamiento en varios pasos, orientados a ejecucion local (tag on-device, agent).
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text, tag vision); requiere el fichero mmproj correspondiente, alojado en el repositorio estatico.
- Ajuste especifico mediante SFT sobre cagataydev/loopl-train, lo que sugiere especializacion en el dominio de ese dataset.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion como backend servido.
- No hay informacion disponible sobre modo de razonamiento explicito (thinking mode), capacidades de audio, ni sobre otros idiomas distintos de ingles y turco.

## Casos de uso

- Agentes locales en dispositivos de borde: con 0,4-0,7 GB de pesos, el modelo puede ejecutarse en un movil de gama alta, una Raspberry Pi o un mini-PC sin GPU dedicada y actuar como planificador de acciones que invoca herramientas locales mediante tool calling.
- Asistente de atencion al cliente en ingles o turco: su tamano permite desplegarlo en instancias pequenas y mantener conversaciones multi-turno; la longitud de contexto disponible no esta documentada, por lo que habria que medirla antes de fijar politicas de memoria.
- Extraccion estructurada de informacion a partir de capturas de pantalla o formularios escaneados: al ser un modelo image-text-to-text, puede recibir la imagen y emitir campos estructurados, util en digitalizacion de documentos y en pipelines RPA.
- Automatizacion de tareas de escritorio o navegador: como capa de decision de un agente que interpreta el estado visual de la interfaz y decide la siguiente accion, aprovechando soporte de vision y de llamadas a funciones.
- Prototipado rapido de aplicaciones de IA generativa en portatiles sin GPU: las cuantizaciones IQ1/IQ2 permiten hacer pruebas de concepto con menos de 0,5 GB de memoria, y las Q4/Q5 dan el punto de equilibrio para validar calidad antes de escalar.
- Clasificacion y enrutado de consultas en sistemas RAG: el modelo puede actuar como router que decide a que herramienta o indice derivar cada peticion en funcion del texto o de la imagen aportada.
- Ensayos de investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y 24 variantes, lo que permite estudiar la degradacion por tasa de bits en un modelo multimodal pequeno manteniendo fijo el resto de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web no aportan evaluaciones de este modelo. El autor referencia una grafica comparativa de perplejidad entre tipos de cuantizacion (https://www.nethype.de/huggingface_embed/quantpplgraph.png) y un analisis general de Artefact2 sobre calidad de cuantizaciones, pero no cifras especificas para loopl-0.8b.

## Requisitos de hardware

- VRAM estimada: entre 0,4 GB y 0,7 GB solo para los pesos, segun la cuantizacion elegida (IQ1_S ~0,4 GB; Q4_K_M ~0,6 GB; Q6_K ~0,7 GB). Hay que anadir el consumo del contexto en KV cache y, si se usa vision, el peso del proyector mmproj.
- GPU: cabe con holgura en cualquier GPU de consumo (GTX 1050 Ti, RTX 3060, RTX 4090), en iGPU modernas y en aceleradores de borde. No requiere A100 ni H100; estos solo tendrian sentido para servir muchas instancias en paralelo.
- Ejecucion en CPU: viable en x86 y ARM sin GPU, con cuantizaciones Q4_K_M o inferiores. Tamano tipico en disco/memoria: por debajo de 1 GB.
- Despliegue: llama.cpp y sus derivados (llama-server, llama-cpp-python), Ollama mediante un Modelfile que apunte al GGUF, LM Studio, Jan y otros frontends compatibles con GGUF. vLLM y TGI no estan pensados para pesos GGUF (vLLM solo tiene soporte experimental para algunos modelos), por lo que para este repositorio la via natural es llama.cpp.
- Vision: para usar la entrada de imagen hay que descargar el mmproj desde el repositorio estatico mradermacher/loopl-0.8b-GGUF; no esta en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota practica: las cuantizaciones IQ1/IQ2 marcadas por el autor como "for the desperate" o "mostly desperate" degradan la calidad de forma notable; para uso realista conviene partir de IQ4_XS o Q4_K_M.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificables de benchmarks ni de especificaciones de modelos comparables. Como referencia de categoria, loopl-0.8b compite con otros modelos multimodales y de agente de menos de mil millones de parametros distribuidos en GGUF, pero no se aportan cifras contrastadas para establecer una comparacion numerica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| loopl-0.8b (este, cuantizado por mradermacher) | 752.393.024 | no disponible | apache-2.0 | GGUF en este repositorio; base en safetensors |
| Alternativas de la misma categoria (SLM multimodal/agente) | no disponible | no disponible | no disponible | no disponible |

En el propio ecosistema del autor existe mradermacher/LoopTool-8B-i1-GGUF, un modelo distinto (8B) cuyo nombre puede inducir a confusion; no se dispone de datos que confirmen una relacion de familia con loopl-0.8b.

## Limitaciones y advertencias

- Con 752 millones de parametros, la capacidad de razonamiento abstracto, matematicas y codigo es limitada en comparacion con modelos de 7B o superiores; conviene reservarlo para tareas acotadas y bien especificadas.
- Riesgo de alucinacion elevado en tareas abiertas, especialmente en las cuantizaciones de 1 y 2 bits, donde la degradacion respecto al modelo original es sustancial.
- Idiomas: solo ingles y turco declarados. No hay soporte documentado de castellano, por lo que su uso en espanol no esta garantizado y requeriria evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar una estrategia de memoria (KV cache) ni de troceado de documentos sin medirla primero.
- La model card del repositorio de cuantizacion es generica y no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base. No hay informacion sobre sesgos conocidos.
- El repositorio incluye etiquetas de vision pero los ficheros mmproj no estan aqui; usarlo como modelo multimodal requiere descargar artefactos adicionales de otro repositorio, lo que complica la reproducibilidad.
- Licencia Apache-2.0, permisiva para uso comercial, pero esa licencia corresponde a la cuantizacion y al modelo base declarado; conviene verificar la procedencia de los datos de entrenamiento de cagataydev/loopl-train si el uso va a ser comercial.
- Los pesos GGUF se distribuyen por ficheros; en cuantizaciones multiparte hay que concatenar los fragmentos antes de usarlos.
- El modelo tiene 141 descargas y 0 likes, es decir, muy poca validacion por parte de la comunidad: no hay evidencia externa de calidad en produccion.

## Enlaces

- Repositorio de cuantizaciones imatrix (este modelo): https://huggingface.co/mradermacher/loopl-0.8b-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/loopl-0.8b-GGUF
- Modelo base: https://huggingface.co/cagataydev/loopl-0.8b
- Dataset de entrenamiento: https://huggingface.co/datasets/cagataydev/loopl-train
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#loopl-0.8b-i1-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de Artefact2 sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Web del patrocinador de la infraestructura de cuantizacion: https://www.nethype.de/
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
