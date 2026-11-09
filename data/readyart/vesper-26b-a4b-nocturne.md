# ReadyArt/Vesper-26B-A4B-Nocturne

## Resumen

Vesper-26B-A4B-Nocturne es un ajuste fino (finetune) del modelo google/gemma-4-26B-A4B-it, desarrollado por ReadyArt, un perfil de Hugging Face especializado en modelos orientados a roleplay, narrativa conversacional y contenido para adultos. El modelo parte de la arquitectura MoE de Gemma 4 (26B parametros totales, aproximadamente 4B activos por token, segun la nomenclatura A4B del nombre) y se ha reentrenado para conversaciones multi-personaje y experiencias de rol inmersivas en ingles.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso concreto de la familia Gemma 4 en el ecosistema de modelos comunitarios; por otro, sirve de ejemplo de ajuste fino sobre un modelo base de Google con licencia Apache 2.0, lo que permite su redistribucion y modificacion. El repositorio ocupa 51,6 GB en formato safetensors y declara 25.805.936.206 parametros reales.

El modelo esta etiquetado como `not-for-all-audiences` y `nsfw`, por lo que su uso esta restringido a entornos adultos y requiere filtros adicionales si se integra en productos de cara al publico. Solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (Gemma 4), segun modelo base google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura A4B del nombre; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base google/gemma-4-26B-A4B-it, un transformer con capas de mezcla de expertos (MoE) y aproximadamente 4B parametros activos por token sobre un total de 25,8B. La model card no detalla la configuracion exacta de expertos, el numero de capas ni la dimension oculta; esa informacion debe consultarse en la ficha del modelo base.

Respecto al entrenamiento, la informacion disponible solo indica que se trata de un finetune del modelo instruct de Gemma 4, orientado a roleplay, conversaciones multi-personaje y contenido adulto. No se especifican el volumen de tokens de ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que aporte el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno.
- Roleplay y narrativa interactiva, incluyendo escenarios con multiples personajes (etiqueta `multi-character` y `ensemble`).
- Contenido para adultos y tematica madura (etiquetas `nsfw`, `adult-content`, `mature`).
- Modo conversacional orientado a mantener coherencia de personaje y estilo a lo largo de sesiones largas.
- Capacidades heredadas del modelo base Gemma 4 instruct: razonamiento general, codigo y matematicas (no verificadas especificamente en este finetune).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Roleplay conversacional para plataformas de entretenimiento adulto: el modelo esta ajustado especificamente para mantener personajes coherentes y dialogos multi-turno, lo que encaja en productos de ficcion interactiva y novelas visuales.
- Simulacion de conversaciones con multiples personajes: la etiqueta `ensemble` sugiere que puede gestionar escenas con varios interlocutores, util para guiones interactivos o juegos de rol de mesa asistidos.
- Generacion de ficcion narrativa para adultos: escritura de relatos y dialogos con tono maduro, aprovechando el ajuste sobre el modelo base.
- Prototipado de agentes conversacionales con personalidad: util para equipos que investigan consistencia de personaje y memoria conversacional antes de invertir en modelos propietarios.
- Investigacion sobre sesgos y seguridad en modelos NSFW: sirve como caso de estudio para evaluar comportamientos y disenar filtros en produccion.
- Base para nuevos finetunes comunitarios: al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para ajustes especializados, siempre que se respeten las restricciones de contenido del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 60-70 GB de VRAM.
- Cuantizacion a 8 bits: alrededor de 26 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o con offloading parcial.
- Cuantizacion a 4 bits: alrededor de 13-15 GB de VRAM, lo que permite ejecucion en GPUs consumer de gama alta (RTX 4090, RTX 3090, etc.), aunque no se han publicado variantes GGUF en el repo.
- GPUs recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 con tensor parallelism).
- Opciones de despliegue: vLLM, TGI y transformers con accelerate para los pesos safetensors; llama.cpp/Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ReadyArt/Vesper-26B-A4B-Nocturne | 25,8B (MoE, ~4B activos) | No disponible | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it | 25,8B (MoE, ~4B activos) | No disponible | Gemma license | Hugging Face |
| ReadyArt/For-Her-Darkside-26B-A4B-v1.4 | No disponible | No disponible | No disponible | Hugging Face |
| ReadyArt/Wicked-Tutu-26B-A4B-Final | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`; no debe desplegarse sin filtros en productos accesibles a menores.
- Solo ingles: no se declara soporte para castellano ni otros idiomas, por lo que su uso en entornos hispanohablantes requerira traduccion o ajuste adicional.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas especificas para este finetune.
- Sesgos: no documentados por el autor; al derivar de Gemma 4 y de un ajuste con contenido adulto, pueden aparecer sesgos de genero y estereotipos en roleplay.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la compatibilidad con los terminos del modelo base Gemma 4, que pueden imponer restricciones adicionales.
- Sin datos de contexto: se desconoce la ventana de contexto efectiva tras el finetune, lo que afecta a la planificacion de aplicaciones con conversaciones largas.
- Sin variantes cuantizadas publicadas: la ausencia de GGUF limita el despliegue en hardware consumer sin trabajo previo de conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
- Perfil del autor en Hugging Face: https://huggingface.co/ReadyArt
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Estadisticas del autor en OpenModelStats: https://openmodelstats.com/owners/readyart
- Otro modelo del autor en OpenModelStats: https://openmodelstats.com/models/readyart/for-her-darkside-26b-a4b-v1.4
- Cuantizaciones de otro modelo del autor: https://huggingface.co/models?other=base_model:quantized:ReadyArt/Wicked-Tutu-26B-A4B-Final
