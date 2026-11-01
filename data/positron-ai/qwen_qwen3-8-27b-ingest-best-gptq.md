# positron-ai/Qwen_Qwen3.8-27B-ingest-best-gptq

## Resumen

Este repositorio contiene una compilación cuantizada de Qwen/Qwen3.8-27B, un modelo de lenguaje de gran tamano desarrollado originalmente por el equipo Qwen (Alibaba). La cuantizacion ha sido realizada por positron-ai mediante GPTQ de 4 bits, con el objetivo de reducir el espacio en disco y la memoria necesaria para inferencia manteniendo el comportamiento del modelo original. El artefacto tiene un tamano aproximado de 20 GB en el repositorio, frente a los aproximadamente 55 GB que ocuparia el modelo en precision completa (27.781.427.952 parametros).

El modelo base pertenece a la familia Qwen3.5 segun las etiquetas del repositorio, y esta orientado a generacion de texto y tareas multimodales de imagen a texto, segun los tags `text-generation` e `image-text-to-text`. La ficha tecnica oficial del modelo original no esta incluida en la informacion disponible, por lo que muchos detalles de arquitectura, entrenamiento y contexto se marcan como no disponibles.

La relevancia de esta publicacion radica en que ofrece una variante 4-bit lista para `transformers` con GPTQModel 7.6.0, lo que facilita el despliegue en GPUs con VRAM limitada. No obstante, el autor no publica metricas de calidad ni divergencia KL, lo que obliga a validar el artefacto antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (grupo 64, simetrica, sin desc_act) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B mas alla de su pertenencia a la familia Qwen3.5 y su uso para generacion de texto e imagen-texto. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si emplea mezcla de expertos. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO.

En cuanto al proceso de cuantizacion, el artefacto se genero con GPTQModel 7.6.0 sobre transformers 5.12.1, torch 2.10.0 y CUDA 12.8. Se aplico cuantizacion de pesos a 4 bits con tamano de grupo 64, simetrica, sin `desc_act`, con `damp_percent` de 0.05. El conjunto de calibracion fue un set mixto universal de 512 muestras con longitud de secuencia 8192. Las activaciones no se cuantizaron. No se indica la precision de origen ni el hardware objetivo.

## Capacidades

- Generacion de texto conversacional segun el pipeline `text-generation`.
- Procesamiento de imagen a texto, segun el tag `image-text-to-text` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia gestionada.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible; el repositorio no declara idiomas.
- Modo thinking, vision o audio: no disponible salvo la mencion generica a imagen-texto.

## Casos de uso

- Despliegue en GPU de gama alta con VRAM limitada: al ocupar aproximadamente 20 GB en 4 bits, el modelo puede servirse en una unica GPU de 24 GB o superior, lo que permite usar hardware menos costoso que el requerido por la version completa.
- Prototipado de asistentes conversacionales: el pipeline de generacion de texto y la licencia Apache 2.0 permiten integrar el modelo en demos y productos internos sin restricciones comerciales adicionales.
- Procesamiento de documentos con imagen y texto: el tag `image-text-to-text` sugiere uso en tareas de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados, aunque conviene validar esta capacidad empiricamente.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir la degradacion de GPTQ 4-bit frente al modelo original antes de adoptar una estrategia de cuantizacion en produccion.
- Inferencia con `transformers` en pipelines existentes: al usar safetensors y GPTQModel, se integra en flujos ya basados en el ecosistema Hugging Face sin necesidad de convertir formatos.
- Servicio de generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del artefacto y del modelo base facilita su uso en productos comerciales, sujeto a las condiciones del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reportan metricas de rendimiento ni de calidad (ni divergencia KL, ni exactitud, ni perplejidad), y que las validaciones se gestionan internamente por Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB solo para pesos en 4 bits; hay que anadir memoria para el contexto KV y overhead del runtime, por lo que se recomienda al menos 24 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 de 24 GB para el modelo cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), con margen ajustado segun la longitud de contexto.
- Opciones de despliegue: `transformers` con GPTQModel es el camino documentado; vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.8-27B-ingest-best-gptq | 27,8 B | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27,8 B | no disponible | BF16/FP16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | 27,8 B | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento del artefacto ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No se publican metricas de calidad de la cuantizacion; la degradacion respecto al modelo original es desconocida y debe medirse antes de desplegar.
- La cuantizacion GPTQ de 4 bits puede afectar a tareas sensibles a la precision numerica, como matematicas o generacion de codigo.
- El autor no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; el repositorio no declara idiomas soportados.
- La longitud de contexto no esta disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Aunque la licencia es Apache 2.0, la model card recuerda que las restricciones del modelo original siguen aplicandose; conviene revisar la licencia de Qwen/Qwen3.8-27B.
- El artefacto tiene solo 62 descargas y 0 likes, sin validacion comunitaria; se recomienda tratarlo como build experimental.
- El tag `image-text-to-text` no esta acompanado de documentacion sobre el procesador de imagen ni de ejemplos de uso; la capacidad multimodal debe verificarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.8-27B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
