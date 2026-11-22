# CrowtherLabs/Atom-Electron-1.4-9B-lora

## Resumen

Atom-Electron-1.4-9B es un adaptador LoRA publicado por CrowtherLabs sobre el modelo base Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parametros. El adaptador esta disenado especificamente para tareas de uso de herramientas (tool use), busqueda y razonamiento, y se distribuye como repositorio PEFT de unos 0,1 GB, no como un modelo fusionado en precision completa. Esto implica que el usuario debe descargar el modelo base por separado y aplicar el adaptador encima.

El entrenamiento declarado es un post-entrenamiento LoRA propietario sobre un corpus multitarea revisado, con solo 710 ejemplos de entrenamiento y 32 de validacion durante 1 epoca, con rango y alpha de 16, tasa de aprendizaje 2e-05 y longitud maxima de secuencia de 32768 tokens. La validacion reporta una perdida de 0,583. La version 1.4 es la publicacion actual, mientras que los resultados de evaluacion disponibles corresponden al checkpoint 1.3.

Su relevancia practica reside en el enfoque: un adaptador ligero sobre un modelo de 9B que busca competir en tareas de busqueda agente y razonamiento con sistemas mucho mayores, a un coste de inferencia menor. La evaluacion en BrowseComp-Plus reporta 82,41 % de precision y 86,38 % de recall con el checkpoint 1.3, aunque con limitaciones metodologicas que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-9B |
| Parametros totales | Aproximadamente 9.000 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer denso de la familia Qwen 3.5. El adaptador en si es un LoRA con rango 16 y alpha 16, entrenado durante 1 epoca con tasa de aprendizaje 2e-05 y una longitud maxima de secuencia de 32768 tokens. El conjunto de entrenamiento declarado consta de 710 ejemplos, con 32 ejemplos de validacion, sobre un corpus multitarea revisado de caracter propietario. No se especifica la composicion del dataset, el numero de tokens totales vistos ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica declarada no esta en la arquitectura, sino en el dominio de especializacion: el adaptador esta orientado a tool use, busqueda y razonamiento multi-paso, con un formato de interaccion que incluye llamadas de busqueda (`search`) y recuperacion de documentos (`get_document`), tal como se deduce de las metricas de evaluacion reportadas (numero medio de llamadas de busqueda y de recuperacion de documentos). No se documentan tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen3.5-9B.
- Uso de herramientas (tool use) y function calling, segun la etiqueta `tool-use` del repositorio.
- Razonamiento multi-paso orientado a tareas de busqueda y recuperacion de informacion.
- Interaccion con pipelines de recuperacion: llamadas de busqueda y de obtencion de documentos como parte del bucle de razonamiento.
- Capacidades de razonamiento general y conocimiento heredadas del modelo base Qwen3.5-9B.
- Soporte multilingue limitado al ingles segun la model card (el modelo base podria tener mas idiomas, pero el adaptador solo declara ingles).

## Casos de uso

- Busqueda agentica con recuperacion iterativa: el adaptador esta entrenado para emitir llamadas de busqueda y de recuperacion de documentos en un bucle de razonamiento, con una media de 9,93 llamadas de busqueda y 1,34 de recuperacion de documentos por consulta en la evaluacion reportada. Adecuado para asistentes de investigacion que necesitan consultar fuentes externas antes de responder.
- Automatizacion de atencion al cliente con acceso a herramientas: el soporte de tool calling permite conectar el modelo a APIs internas (consultas de pedidos, estado de tickets) manteniendo conversaciones multi-turno con hasta 32768 tokens de contexto.
- Agentes de investigacion documental: combinado con un recuperador como Atom-Neutron-1.4-0.6B, el modelo puede orquestar busquedas sobre corpus extensos y sintetizar respuestas con recall alto, segun la evaluacion del checkpoint 1.3 (93,2 % de recall en la configuracion con recuperador propio).
- Asistentes de soporte tecnico con base de conocimiento: el modelo puede formular consultas de busqueda contra una base documental y citar los documentos recuperados, reduciendo respuestas sin fundamento si se valida la calibracion.
- Pipelines de enriquecimiento de datos: generacion de respuestas anotadas con trazas de llamadas a herramientas para construir datasets de entrenamiento de agentes.
- Prototipado de agentes en entornos con restricciones de coste: al ser un adaptador sobre un modelo de 9B, el coste de inferencia es muy inferior al de modelos de 30B o mas, lo que permite iterar rapidamente en desarrollo y validacion de flujos agente.
- Evaluacion comparativa de estrategias de recuperacion: el modelo puede usarse como componente fijo mientras se varian recuperadores y rerankers, ya que su comportamiento de llamadas a herramientas esta especializado.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint Atom-Electron-1.3-9B, no a la version 1.4 objeto de esta ficha. Se presentan tal como aparecen en la model card.

| Benchmark | Configuracion | Precision | Recall | Llamadas de busqueda | Llamadas get_document | Error de calibracion | Fecha |
|---|---|---|---|---|---|---|---|
| BrowseComp-Plus | Top-5 documentos + reranker Kev-4B, juez Qwen3-32B | 82,41 % | 86,38 % | 9,93 | 1,34 | 6,17 % | 2026-10-03 |
| BrowseComp-Plus | Recuperador Atom-Neutron-1.4-0.6B | 80,0 % | 93,2 % | 3,34 | No disponible | 12,07 % | 2026-09-16 |

No se han publicado resultados de benchmarks para la version 1.4 en la informacion disponible, ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 9B en bfloat16 requiere aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade un coste despreciable (0,1 GB).
- GPU recomendadas: A100 40 GB o H100 para bfloat16 con contexto largo (32768 tokens); RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090 o RTX 4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con bfloat16 y contexto limitado, y en RTX 3090/4080/4070 Ti con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers + PEFT (metodo documentado oficialmente), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. La fusion previa es necesaria para la mayoria de runtimes que no soportan PEFT de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Atom-Electron-1.4-9B (este) | ~9B (base) + LoRA | 32768 | Tool use, busqueda, razonamiento | No disponible | Adaptador PEFT safetensors |
| Qwen/Qwen3.5-9B | ~9B | No disponible | Proposito general | No disponible | Modelo completo |
| Atom-Neutron-1.4-0.6B | 0,6B | No disponible | Recuperador (retriever) | No disponible | No disponible |
| atom-proton-1.2 | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas de la misma categoria (adaptadores LoRA para agentes de busqueda sobre modelos de 9B) no esta disponible en la informacion proporcionada. Los modelos listados pertenecen al mismo ecosistema CrowtherLabs o son el modelo base, no competidores directos verificables.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Es un bloqueante para produccion hasta que el autor la especifique.
- El adaptador solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El entrenamiento se realizo con solo 710 ejemplos y 1 epoca, lo que limita la cobertura de dominios y aumenta el riesgo de sobreajuste a los formatos de herramienta vistos en entrenamiento.
- Los benchmarks publicados corresponden al checkpoint 1.3, no a la version 1.4; no hay evidencia de que la version actual mantenga o mejore esos resultados.
- El resultado de 82,41 % de precision se obtuvo con un juez Qwen3-32B y un reranker especifico (Kev-4B); la precision puede variar sustancialmente con otro juez o configuracion de recuperacion.
- El error de calibracion reportado (6,17 % y 12,07 % en las dos ejecuciones) indica que la confianza declarada por el modelo no es perfectamente fiable; en produccion conviene validar las respuestas con verificacion externa.
- Riesgo de alucinacion inherente a los modelos de 9B, especialmente en tareas de recuperacion donde el modelo puede citar documentos no consultados o malinterpretar el contenido recuperado.
- El repositorio no incluye pesos fusionados; un uso incorrecto con una version distinta del modelo base puede producir resultados degradados. La model card exige usar exactamente el modelo base indicado en `adapter_config.json`.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El modelo base Qwen3.5-9B tiene sus propias restricciones de licencia que se aplican de forma acumulativa al uso del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CrowtherLabs/Atom-Electron-1.4-9B-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo relacionado (CrowtherLabs): https://huggingface.co/CrowtherLabs/atom-proton-1.2
- Benchmark BrowseComp-Plus: https://huggingface.co/spaces/Tevatron/BrowseComp-Plus
