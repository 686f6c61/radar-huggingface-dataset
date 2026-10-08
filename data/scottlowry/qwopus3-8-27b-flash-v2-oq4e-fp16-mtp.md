# scottlowry/Qwopus3.8-27B-Flash-V2-oQ4e-fp16-mtp

## Resumen

Qwopus3.8-27B-Flash-V2-oQ4e-fp16-mtp es una version cuantizada del modelo Jackrong/Qwopus3.8-27B-Flash-V2, un LLM denso de aproximadamente 27.800 millones de parametros (~27,8 B) que, por el nombre de su familia, deriva del Qwen3.8-27B publicado por el equipo Qwen de Alibaba. La ficha corresponde concretamente al artefacto generado por el usuario scottlowry, que aplica cuantizacion mixta de 4 bits con la herramienta oQ (oMLX v0.7.0) y lo empaqueta en formato MLX safetensors para su ejecucion en hardware Apple Silicon.

El problema que resuelve es el de permitir ejecutar un modelo de ~27,8 B en memoria unificada de equipos de consumo (Mac con chip de la familia M), reduciendo el peso del repositorio a 17,9 GB frente al modelo original en mayor precision. Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: no se ha publicado informacion sobre su dataset de entrenamiento, su licencia ni los idiomas soportados en la informacion disponible.

La relevancia actual de esta ficha es acotada y conviene ser transparente: tiene 0 descargas y 0 likes, no declara pipeline, licencia ni idiomas, y toda la documentacion se limita a los parametros de cuantizacion. El modelo base (Qwen3.8-27B segun las referencias web) se describe como un LLM denso multimodal nativo orientado a codigo, flujos agénticos y automatizacion de oficina, pero esa descripcion corresponde a la familia original y no se ha verificado para esta cuantizacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo declarado: qwen3_5; la familia base se describe como transformer denso multimodal segun referencias web) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, cuantizacion mixta (mixed-precision) con group size 64; componentes en fp16; formato oQ (oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx) |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 |
| Fecha de creacion | 2026-10-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de este artefacto: es una cuantizacion, no un modelo entrenado. Lo unico documentado es el proceso de compresion: se aplico cuantizacion mixta de 4 bits con oQ (oMLX v0.7.0), con un tamano de grupo de 64 y empaquetado en MLX safetensors. La etiqueta de tipo de modelo es qwen3_5, lo que sugiere una arquitectura de la familia Qwen3.5, pero no se detalla el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora mecanismos adicionales.

El nombre del archivo incluye los sufijos "oQ4e", "fp16" y "mtp". Los dos primeros son coherentes con lo declarado (cuantizacion oQ de 4 bits con componentes en fp16), mientras que "mtp" podria referirse a capas de multi-token prediction, pero esta interpretacion no aparece confirmada en la model card y debe tratarse como no verificada. Las referencias web apuntan a que el modelo original Qwen3.8-27B es un LLM denso multimodal nativo de Alibaba, pero no hay datos publicados sobre composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO, ni en el modelo base intermedio (Jackrong/Qwopus3.8-27B-Flash-V2) ni en la familia original.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base (no verificadas en esta cuantizacion).
- Codigo y flujos agénticos: las referencias del modelo Qwen3.8-27B mencionan capacidades destacadas en programacion y workflows agenticos, aunque no se confirman para este artefacto cuantizado.
- Multimodalidad: la familia original se describe como nativa multimodal, pero no se ha verificado que la cuantizacion conserve el encoder visual ni que el repositorio MLX lo incluya.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el artefacto esta pensado para ejecutarse con la libreria MLX en Macs con memoria unificada suficiente (17,9 GB de pesos), permitiendo disponer de un modelo de ~27,8 B en un portatil o sobremesa sin GPU dedicada.
- Prototipado de aplicaciones de texto en local: util para desarrolladores que quieran evaluar el comportamiento de la familia Qwopus/Qwen3.8 sin depender de APIs externas, siempre que se acepte que no hay datos de rendimiento publicados.
- Generacion de codigo asistida en entorno de escritorio: si la capacidades de codigo del modelo base se conservan, podria integrarse en editores con backend MLX; no obstante, requiere validacion previa por parte del usuario al no haber benchmarks.
- Experimentacion con cuantizacion mixta: sirve como caso de estudio para comparar la calidad de oQ (oMLX v0.7.0) a 4 bits con group size 64 frente a otras tecnicas, midiendo degradacion respecto al modelo base.
- Despliegue en pipelines offline o air-gapped: al tratarse de pesos locales sin dependencia de servicios externos, puede emplearse en entornos donde no se permite enviar datos a la nube, pero conviene revisar la licencia (no declarada) antes de usarlo en produccion.
- Base para pruebas de integracion con MLX: util para validar toolchains de conversion, carga y decodificacion en mlx-lm u otras librerias del ecosistema antes de pasar a modelos mayores.
- Investigacion sobre degradacion por cuantizacion en modelos de ~27 B: permite estudiar como afecta la cuantizacion mixta de 4 bits a tareas concretas, comparandolo con el modelo base en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 17,9 GB en disco; en ejecucion hay que sumar el cache KV y el overhead del runtime, por lo que se recomienda un minimo practico de 24 GB de memoria unificada y, de forma comoda, 32 GB o mas.
- Hardware objetivo: Apple Silicon (series M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). El formato MLX no esta pensado para CUDA.
- GPU dedicadas (NVIDIA): no aplicable de forma nativa; requeriria conversion a otro formato (por ejemplo, GGUF) para su uso con CUDA.
- ¿Cabe en GPU de consumo? En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) seria viable solo tras reconvertir los pesos a un formato compatible; en el formato original esta orientado a Mac.
- Opciones de despliegue: libreria MLX (mlx-lm, mlx-swift u otras herramientas del ecosistema MLX). No hay indicios de soporte para vLLM, TGI, llama.cpp u Ollama en este repositorio concreto.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwopus3.8-27B-Flash-V2-oQ4e-fp16-mtp (este) | ~27,8 B | no disponible | MLX safetensors (4 bits) | no disponible | 0 descargas, 0 likes |
| Jackrong/Qwopus3.8-27B-Flash-V2 (modelo base) | no disponible (se asume ~27,8 B) | no disponible | no disponible | no disponible | referenciado como base_model |
| Qwopus3.8-27B-Flash-GGUF (terceros) | no disponible | no disponible | GGUF | no disponible | 172.520 descargas, 244 likes (segun local-ai-zone) |
| Qwen3.8-27B (familia original, Alibaba/Qwen) | 27 B (nominal) | no disponible | no disponible | no disponible | descrito como open-weight en referencias web |

Nota: los datos de la comparativa proceden exclusivamente de las referencias web y no se han verificado de forma independiente. En ausencia de benchmarks publicados para este artefacto, no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Modelo sin documentacion propia: la model card se limita a describir la cuantizacion; no hay informacion sobre sesgos, alineacion ni comportamiento en produccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Como cualquier LLM, es esperable, pero no hay datos concretos para esta version.
- Degradacion por cuantizacion: la conversion a 4 bits con group size 64 puede reducir precision en tareas sensibles (matematicas, codigo, razonamiento largo) respecto al modelo base en fp16; no hay mediciones publicadas.
- Licencia no declarada: se desconoce si se permite uso comercial. Es un bloqueante para produccion hasta aclararlo con el autor y con la licencia del modelo base y de la familia Qwen original.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue concreto.
- Contexto desconocido: no se ha publicado la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Confusion de nombres: el repositorio emplea los sufijos "oQ4e", "fp16" y "mtp"; solo los dos primeros estan confirmados por la model card. El significado exacto de "mtp" no esta aclarado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Restriccion de plataforma: al ser MLX, el uso productivo queda limitado a Apple Silicon salvo conversion previa a otro formato.
- Fecha de creacion inusual (2026-10-08): conviene verificar la coherencia temporal de los metadatos antes de tomarlos como referencia.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-V2-oQ4e-fp16-mtp
- Arbol de archivos: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-V2-oQ4e-fp16-mtp/tree/main
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Repositorio oQ / oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- Version GGUF de terceros (Qwopus3.8-27B-Flash): https://local-ai-zone.github.io/models/qwopus3-8-27b-flash.html
- Referencia de la familia Qwen3.8-27B (repositorio no oficial citado en la busqueda): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Analisis de Qwen3.8-27B (specs, benchmarks, hardware local): https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Variante similar del mismo autor: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp
