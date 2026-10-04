# joshycodes/fd-gemma-4-12b-swap_st

## Resumen

`joshycodes/fd-gemma-4-12b-swap_st` es un checkpoint de pesos publicado en Hugging Face por el usuario joshycodes, derivado de la familia Gemma 4 de Google DeepMind. El repositorio tiene un tamano de 24 GB y contiene 11.959.730.224 parametros en formato safetensors (aproximadamente 12.000 millones), lo que lo situa en la categoria de modelos medios densos. El tag `gemma4_unified` indica que se apoya en la arquitectura unificada presentada en Gemma 4, descrita por Google como un modelo multimodal sin encoder capaz de procesar audio y video de forma nativa.

Por el contexto de los repositorios hermanos del mismo autor (`fd-gemma-4-12b-trust`, `gemma-4-12B-it-valence-steering-distilled-plus3-lora`) y la etiqueta interna `flourish-distill` encontrada en los resultados de busqueda, este checkpoint parece formar parte de una familia de destilaciones o ajustes sobre la base instruct de Gemma 4 12B. El sufijo `swap_st` y los ficheros asociados sugieren variantes de experimentos de destilacion. No obstante, la model card del repositorio no aporta descripcion, licencia ni idiomas declarados, por lo que buena parte de sus caracteristicas tecnicas no puede confirmarse con la informacion disponible.

La relevancia de esta ficha radica en documentar con rigor lo que se puede verificar (tamano, formato, procedencia aparente) y marcar explicitamente como "no disponible" todo aquello que el autor no ha publicado. Es un artefacto de investigacion con muy poca difusion (13 descargas, 0 likes) y sin documentacion oficial, por lo que debe tratarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal unificada (tag `gemma4_unified`, basada en Gemma 4); detalles exactos no disponibles |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `gemma4_unified` y la similitud con el resto de repositorios del autor apuntan a que el modelo hereda la arquitectura de Gemma 4 12B, que segun la documentacion de Google es un modelo multimodal de tamano medio y sin encoder separado, capaz de ingerir audio y video de forma nativa. El numero de parametros reportado por safetensors (11,96B) es coherente con la denominacion "12B" de la familia base. Sin embargo, el repositorio no incluye informacion sobre la configuracion de capas, el mecanismo de atencion, la ventana de contexto efectiva ni el tokenizador.

Respecto al entrenamiento, la evidencia disponible (checkpoint etiquetado como `flourish-distill` en repos hermanos y la existencia de una LoRA de destilacion con "valence steering" atribuida al mismo autor) sugiere que este checkpoint es el resultado de un proceso de destilacion o ajuste fino sobre la version instruct de Gemma 4 12B, mas que un entrenamiento desde cero. No hay publicados el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o destilacion por logits. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Todos estos datos deben considerarse no disponibles.

## Capacidades

Dado que no existe model card ni evaluacion publicada, no se pueden afirmar capacidades especificas de este checkpoint con certeza. Lo que se puede inferir del linaje Gemma 4 12B (segun la documentacion oficial de Google) es lo siguiente, siempre como herencia potencial y no verificada para esta variante concreta:

- Generacion de texto y razonamiento de proposito general, propio de un modelo instruct de la familia Gemma.
- Capacidades multimodales nativas: la base Gemma 4 12B se describe como capaz de procesar audio y video sin encoder separado, por lo que cabe esperar soporte de entrada multimodal si el ajuste no lo ha eliminado.
- Posible soporte de tool calling y uso en agentes, comun en modelos instruct modernos, aunque no confirmado para este repositorio.
- Rendimiento multilingue: no disponible para este checkpoint.
- No se documenta modo de razonamiento explicito (thinking mode), ni capacidades especiales adicionales.

Cualquier uso que dependa de estas capacidades deberia validarse empiricamente antes de confiar en ellas.

## Casos de uso

Los siguientes escenarios son planteamientos genericos para un modelo denso de 12B tipo Gemma; no implican una validacion especifica de este checkpoint concreto, que carece de evaluacion publicada.

- Experimentacion en investigacion sobre destilacion: el modelo puede servir como artefacto de partida para reproducir o comparar tecnicas de destilacion dentro de la familia `flourish-distill`, dada su naturaleza de checkpoint experimental.
- Prototipado local en una sola GPU de gama alta: con 12B de parametros en cuantizacion de 8 o 4 bits cabe en tarjetas de consumo y permite iterar sin depender de servicios en la nube.
- Generacion de texto asistida por contexto multimodal: si conserva las capacidades de Gemma 4, podria emplearse para tareas que combinen texto con audio o video, como resumen de contenido audiovisual, previa validacion.
- Ajuste fino especifico de dominio: al estar en safetensors y ser un tamano manejable, puede servir como base para LoRA o fine-tuning completo en tareas verticales.
- Evaluacion comparativa de checkpoints: util para equipos que quieran medir el impacto de distintas variantes (`swap_st`, `trust`) sobre la misma base Gemma 4 12B.
- Inferencia offline en entornos con requisitos de privacidad: desplegado en local permite procesar datos sensibles sin salida a Internet, siempre que la licencia lo permita (no disponible, por lo que debe aclararse antes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y la busqueda web no aporta evaluaciones especificas de este checkpoint.

## Requisitos de hardware

Las cifras son estimaciones derivadas del numero de parametros (aproximadamente 12B) y no de mediciones publicadas para este repositorio.

- VRAM estimada para inferencia: en fp16/bf16 unos 24 GB; en cuantizacion de 8 bits en torno a 12-13 GB; en 4 bits del orden de 7-9 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para ejecucion holgada en precision completa; RTX 4090 (24 GB) y RTX 3090 para fp16 al limite o 8 bits.
- Compatibilidad con GPU de consumo: si, en cuantizacion de 4-8 bits cabe en tarjetas con 8-16 GB de VRAM; no obstante, Google situa Gemma 4 12B en el entorno de 16 GB de VRAM para desarrollo local.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servido de alto rendimiento, llama.cpp y Ollama si se generan cuantizaciones GGUF (no publicadas por el autor, habria que convertirlas).
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/fd-gemma-4-12b-swap_st | 11,96B | no disponible | sin benchmarks publicados | no disponible | HF, 13 descargas |
| joshycodes/fd-gemma-4-12b-trust | no disponible (repo de 24 GB) | no disponible | sin benchmarks publicados | no disponible | HF, mismo autor |
| Gemma 4 12B (Google DeepMind) | clase 12B | no disponible en la informacion | documentado por Google, valores concretos no disponibles aqui | licencia Gemma (segun Google) | pesos oficiales de Google |
| joshycodes/gemma-4-12B-it-valence-steering-distilled-plus3-lora | LoRA sobre base 12B | no disponible | sin benchmarks publicados | no disponible | HF, mismo autor |

La comparacion se limita a parametros y procedencia porque ninguna de las variantes del autor publica contexto, licencia ni metricas verificables.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion, licencia declarada ni idiomas, lo que impide determinar las condiciones de uso comercial.
- Licencia no disponible: no puede asumirse que herede automaticamente la licencia Gemma de Google; debe consultarse con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado para este checkpoint en particular.
- Sesgos conocidos: no documentados para este modelo; los sesgos de la base Gemma no han sido evaluados aqui.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar cobertura multilingue ni una ventana de contexto concreta.
- Origen experimental: el nombre (`fd-`, `swap_st`, familia `flourish-distill`) sugiere un artefacto de investigacion no destinado a produccion, con 13 descargas y 0 likes.
- Fecha de creacion inusual (2026): conviene verificar la autenticidad y procedencia del repositorio antes de integrarlo en cualquier flujo.
- Sin cuantizaciones oficiales: si se necesita GGUF u otro formato, habra que generarlas y validarlas por cuenta propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/joshycodes/fd-gemma-4-12b-swap_st
- Repositorio hermano fd-gemma-4-12b-trust: https://huggingface.co/joshycodes/fd-gemma-4-12b-trust/tree/main
- Repositorio LoRA relacionado: https://huggingface.co/joshycodes/gemma-4-12B-it-valence-steering-distilled-plus3-lora/tree/main
- Guia para desarrolladores de Gemma 4 12B (Google Developers Blog): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Biblioteca oficial de Gemma (GitHub): https://github.com/google-deepmind/gemma
