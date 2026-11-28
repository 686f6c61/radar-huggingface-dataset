# mradermacher/Gemma-4-Writers-31B-i1-GGUF

## Resumen

Gemma-4-Writers-31B-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo Gemma-4-Writers-31B, un merge de tipo roleplay/escritura creativa construido por Ateron sobre la familia Gemma 4 de Google y publicado originalmente en formato transformers. Las cuantizaciones las produce mradermacher mediante llama.cpp con ficheros imatrix, generando una veintena de variantes que van desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB). El modelo cuenta con 30.697.345.596 parametros segun los pesos safetensors del modelo base.

El interes practico de esta ficha reside en que permite ejecutar un modelo de aproximadamente 31.000 millones de parametros en hardware de consumo o en servidores modestos mediante cuantizacion agresiva, manteniendo el enfoque de escritura creativa y roleplay del merge original. La model card indica ademas que se trata de un modelo de vision, aunque los ficheros mmproj se alojan en el repositorio estatico hermano.

La licencia declarada es Apache 2.0 y el unico idioma documentado es el ingles. No se dispone de informacion sobre arquitectura interna, contexto, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma 4; el merge se genero con mergekit) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en formato transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los tags del repositorio indican que el modelo original de Ateron se genero mediante mergekit, es decir, es un merge de pesos de otros modelos, no un entrenamiento desde cero, y esta etiquetado para roleplay. El nombre sugiere una base de la familia Gemma 4 con 31.000 millones de parametros, pero no se confirma la arquitectura concreta (transformer denso, MoE u otra variante).

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado en el merge original. La model card de esta cuantizacion solo documenta el proceso de cuantizacion: generacion de un fichero imatrix para crear cuantizaciones propias y produccion de variantes i1 (importancia) en llama.cpp. El autor indica que IQ-quants suelen ser preferibles a cuantizaciones no-IQ de tamano similar.

## Capacidades

- Generacion de texto orientada a escritura creativa y roleplay, segun los tags del modelo original.
- Conversacion multi-turno (tag `conversational`).
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj (si existen) alojados en el repositorio estatico hermano.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Idiomas: unicamente ingles documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta etiquetado como roleplay y deriva de un merge orientado a escritura, por lo que es adecuado para personajes persistentes y conversaciones largas en ingles.
- Asistencia a escritores en local: con la variante i1-Q4_K_M (18,8 GB) se puede ejecutar en una GPU de consumo de 24 GB y generar borradores, dialogos y descripciones sin enviar texto a servicios externos.
- Prototipado de chatbots de ficcion: el tag `endpoints_compatible` permite desplegarlo detras de una API compatible con OpenAI y conectarlo a interfaces de chat existentes.
- Experimentacion con cuantizacion: el fichero imatrix publicado permite generar cuantizaciones propias ajustadas a un dominio concreto de escritura.
- Despliegue en hardware limitado: las variantes IQ2 (8,8-11 GB) permiten probar el modelo en GPUs de 12 GB, aceptando perdida de calidad, para evaluar si el comportamiento de escritura encaja antes de invertir en hardware mayor.
- Generacion de contenido creativo por lotes: con llama.cpp o vLLM (si soporta el formato) se pueden procesar lotes de prompts de narrativa o guiones en ingles de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S 7,3 GB; IQ2_M 11,0 GB; IQ3_S 13,9 GB; Q4_K_M 18,8 GB; Q5_K_M 21,9 GB; Q6_K 25,3 GB. Anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; A100 o H100 para cuantizaciones altas con contexto largo; GPUs de 12 GB (RTX 3060, RTX 4070) solo con IQ2 o inferiores.
- Cabe en GPU de consumo: si, con cuantizaciones IQ2 a Q4_K_M en tarjetas de 12-24 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas concretas. A nivel estructural, las alternativas mas directas serian otras cuantizaciones GGUF de modelos de 30-34B para escritura creativa, pero no se han proporcionado datos que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma-4-Writers-31B-i1-GGUF | 30,7B | no disponible | apache-2.0 | GGUF |
| Alternativas de 30-34B para roleplay | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles documentado; el rendimiento en castellano no esta garantizado.
- No hay informacion sobre sesgos, alineacion ni filtros de seguridad del merge original.
- Riesgo de alucinacion inherente a modelos de escritura creativa; no apto para tareas factuales sin verificacion.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable; el propio autor advierte que IQ1 esta pensado "para desesperados".
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la licencia del modelo base de Ateron y de los componentes del merge antes de uso comercial.
- El modelo es un merge experimental de la comunidad, sin benchmarks publicados; no hay garantias de calidad en produccion.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-Writers-31B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
