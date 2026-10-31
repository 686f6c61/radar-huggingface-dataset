# Nimbz/Gemma-4-Dark-Orthia-31B

## Resumen

Gemma-4-Dark-Orthia-31B es un modelo de lenguaje de 31B parametros creado por el usuario Nimbz mediante tecnicas de fusion (merge) con MergeKit. Combina cuatro modelos base de la familia Gemma-4: google/gemma-4-31B-it, Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1, TheDrummer/Artemis-31B-v1.2 y Ateron/Gemma-4-MoonGem-31B. El objetivo declarado del merge es producir un modelo especializado en roleplay, escritura creativa, storytelling y conversacion, con un perfil "dark" y bajo nivel de negativas (low-refusal), orientado a contenido de ficcion para adultos.

El modelo es relevante dentro del ecosistema de merges comunitarios sobre Gemma-4, una linea muy activa para uso narrativo. Publicado bajo licencia Apache 2.0, permite uso comercial sin las restricciones de la licencia original de Google para Gemma, lo que lo hace atractivo para integraciones propias. El repositorio pesa 65,4 GB en formato safetensors y el modelo no es MoE, por lo que activa todos sus parametros en cada pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma-4), no disponible mas detalle |
| Parametros totales | 32.682.375.020 (aprox. 32,7B) |
| Parametros activos | no disponible (no es MoE; todos los parametros se activan) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 en el repo) |
| Idiomas soportados | no disponible (heredado presumiblemente de Gemma-4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (65,4 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero ni un fine-tuning convencional, sino un merge de cuatro modelos de la familia Gemma-4 de 31B parametros, realizado con MergeKit. Los modelos progenitores son google/gemma-4-31B-it (el modelo oficial instruido de Google), Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1, TheDrummer/Artemis-31B-v1.2 y Ateron/Gemma-4-MoonGem-31B. Este tipo de fusion combina los pesos de varios fine-tunings para heredar rasgos de cada uno: en este caso, la base instruida de Google junto con modelos comunitarios orientados a roleplay y escritura creativa sin filtros.

La model card incluye la etiqueta "untied-lm_head", lo que indica que se ha desvinculado (untied) la matriz de embedding de entrada y la cabeza de salida del lenguaje (lm_head), una modificacion estructural que a veces se aplica en merges para mejorar la calidad de la salida o facilitar posteriores fine-tunings. No se ha publicado informacion sobre el metodo exacto de merge (linear, task_arithmetic, SLERP, TIES, etc.), el metodo de cuantizacion ni sobre datos de entrenamiento adicionales, RLHF o DPO posteriores a la fusion.

## Capacidades

- Generacion de texto creativo: roleplay de personajes (character RP), narrativa larga, storytelling y escritura de ficcion, segun las etiquetas del autor.
- Conversacion multi-turno: etiquetado como conversational, orientado a chat e interaccion continua con personajes.
- Perfil de contenido sin restricciones: etiquetas "dark", "low-refusal" y "nsfw" indican que el modelo esta afinado para reducir las negativas y aceptar temas maduros en contexto de ficcion.
- Capacidades generales heredadas de Gemma-4-31B-it: razonamiento, seguimiento de instrucciones y, presumiblemente, las capacidades base del modelo oficial (codigo, matematicas, multilinguismo), aunque no estan verificadas para esta fusion.
- Tool calling y capacidades de agentes: no disponible; no se menciona soporte de function calling en la model card.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Roleplay interactivo con personajes: el modelo puede encarnar personajes en sesiones de rol largas, manteniendo coherencia narrativa multi-turno; es adecuado por su especializacion en character-rp y su herencia de modelos como Artemis y MoonGem, muy usados en este nicho.
- Escritura de ficcion oscura o para adultos: autores que necesitan un asistente generativo que no rechace temas maduros (violencia en ficcion, contenido NSFW) pueden usarlo como motor de redaccion en herramientas tipo SillyTavern o frontends similares.
- Storytelling y narrativa interactiva: generacion de tramas ramificadas y continuacion de historias donde el usuario dirige la trama, aprovechando el estilo creativo combinado de los cuatro modelos progenitores.
- Chatbots de personaje para uso personal o comercial: dada la licencia Apache 2.0, puede integrarse en productos de compania conversacional sin restricciones de licencia comercial.
- Prototipado de agentes narrativos: puede usarse como motor LLM en pipelines de generacion procedural de historias, aunque sin soporte garantizado de tool calling habria que gestionar las llamadas a funciones mediante prompting.
- Redaccion creativa asistida: brainstorming de dialogos, descripciones y escenas para novelas o guiones, especialmente en generos donde otros modelos alineados se niegan a colaborar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, es habitual que el autor no facilite metricas estandar (MMLU, HumanEval, GSM8K); su rendimiento en tareas de razonamiento o codigo podria haberse degradado respecto al modelo base google/gemma-4-31B-it por la naturaleza de la fusion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32,7B parametros en bf16 (65,4 GB de pesos), se necesitan unas 70-75 GB de VRAM en precision completa; con cuantizacion Q4 (aprox. 18-20 GB) cabria en una GPU de 24 GB; con Q8 (aprox. 35 GB) se requiere una GPU de 40-48 GB.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 o RTX 6000 Ada (48 GB) para precision completa; RTX 3090/4090 (24 GB) viables con cuantizacion Q4 o Q5.
- Consumer GPUs: cabe en una RTX 3090 o RTX 4090 de 24 GB si se usa una version cuantizada GGUF Q4_K_M o similar; en fp16 solo es viable con multiples GPUs o offloading a CPU/RAM.
- Opciones de despliegue: al estar en safetensors, es compatible con vLLM, TGI, llama.cpp (tras convertir a GGUF) y Ollama; tambien puede ejecutarse localmente con backends como ExLlamaV2 o TabbyAPI una vez cuantizado.
- Latencia y throughput: no disponible; como referencia, un modelo denso de ~33B en una RTX 4090 con Q4 suele rondar 25-45 tokens/s, pero no hay mediciones publicadas para este merge.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-31B | 32,7B | Merge (Gemma-4) | Apache 2.0 | Roleplay, dark, low-refusal |
| google/gemma-4-31B-it | 31B (no disponible exacto) | Modelo oficial | Licencia Gemma (restricciones) | Uso general instruido |
| TheDrummer/Artemis-31B-v1.2 | 31B (no disponible exacto) | Fine-tuning/merge | no disponible | Roleplay creativo |
| Ateron/Gemma-4-MoonGem-31B | 31B (no disponible exacto) | Merge | no disponible | Roleplay, storytelling |

Dark-Orthia se diferencia de los modelos progenitores en que agrega sus rasgos en un solo modelo, y frente al Gemma-4-31B-it oficial ofrece un perfil mucho menos restringido y una licencia mas permisiva, a costa de posible perdida de rendimiento en tareas generales y de no disponer de soporte oficial de Google.

## Limitaciones y advertencias

- Contenido sensible: el modelo esta deliberadamente afinado para reducir negativas y producir contenido dark y NSFW; esta marcado como "not-for-all-audiences" y no es adecuado para entornos con menores de edad o uso profesional estandar.
- Riesgo de alucinacion: no disponible como dato, pero al ser un merge orientado a ficcion, es esperable que invente hechos con fluidez; no debe usarse como fuente de verdad factual.
- Degradacion de capacidades generales: los merges orientados a roleplay suelen perder rendimiento en razonamiento, matematicas y codigo respecto al modelo base instruido; no hay benchmarks que lo cuantifiquen.
- Idiomas: no se declara soporte de idiomas; el castellano podria funcionar por herencia de Gemma-4, pero la calidad en roleplay no esta verificada fuera del ingles.
- Contexto: la longitud de ventana no esta documentada en la model card; habra que consultar la config del modelo base google/gemma-4-31B-it.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos progenitores derivan de Gemma, cuya licencia original impone condiciones de uso de Google; conviene revisar la cadena de licencias antes de despliegue comercial.
- Trazabilidad limitada: el metodo de merge exacto y los pesos relativos no estan documentados, lo que dificulta reproducir el modelo o auditar su comportamiento.
- Adopcion temprana: con solo 51 descargas y 3 likes en el momento de la ficha, es un modelo muy nuevo y sin validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-31B
- Modelo base oficial: https://huggingface.co/google/gemma-4-31B-it
- Progenitor Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1: https://huggingface.co/Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1
- Progenitor TheDrummer/Artemis-31B-v1.2: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Progenitor Ateron/Gemma-4-MoonGem-31B: https://huggingface.co/Ateron/Gemma-4-MoonGem-31B
- Herramienta de merge MergeKit: https://github.com/arcee-ai/mergekit
- Paper, demo u otros enlaces: no disponibles
