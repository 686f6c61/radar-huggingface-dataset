# Nimbz/Gemma-4-Dark-Orthia-Untied-31B

## Resumen

Gemma-4-Dark-Orthia-Untied-31B es un modelo de lenguaje de 31B parametros creado por el usuario Nimbz mediante una fusion (merge) con MergeKit de cinco modelos basados en google/gemma-4-31B-it: Ateron/Gemma-4-MoonGem-31B, Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1, Gryphe/Pantheon-Reasoning-31B-1.1, TheDrummer/Artemis-31B-v1.2 y el propio google/gemma-4-31B-it. El nombre "Untied" indica que se ha desvinculado (untied) la cabeza de lenguaje del modelo base, una modificacion arquitectonica habitual en merges para permitir ajustes independientes de los pesos de salida.

El modelo esta orientado explicitamente a roleplay, escritura creativa, narrativa y conversacion, con etiquetas que indican un perfil "dark", "low-refusal" y "nsfw", por lo que la propia model card lo marca como "not-for-all-audiences". Su relevancia para desarrolladores reside en el ecosistema de merges sobre Gemma-4: combina el razonamiento de Pantheon-Reasoning, la escritura de Artemis y MoonGem, y la estetica oscura de Giftige-Blume en un unico modelo de 32.682.375.020 parametros (dato real de safetensors) distribuido en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma-4), merge con lm_head desvinculado (untied) |
| Parametros totales | 32.682.375.020 (~32,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 implicitos en safetensors; el repo ocupa 65,4 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (65,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero sino una fusion (merge) realizada con MergeKit sobre cinco modelos derivados de google/gemma-4-31B-it, todos ellos de arquitectura transformer densa de la familia Gemma-4. La caracteristica distintiva señalada en el nombre es el "untied lm_head": en los Gemma originales los pesos del embedding de entrada y la cabeza de salida estan vinculados (tied); al desvincularlos, el merge puede tratarlos por separado, lo que suele dar mas libertad al combinar modelos y puede mejorar ligeramente la calidad de generacion a costa de memoria adicional.

No se ha publicado informacion sobre el metodo de merge concreto (linear, task arithmetic, SLERP, DARE, etc.), ni sobre los datos de entrenamiento de los modelos base, ni sobre fases de RLHF o DPO adicionales aplicadas a esta fusion. Los modelos base heredan el alineamiento de google/gemma-4-31B-it, si bien las etiquetas del merge ("low-refusal", "dark", "nsfw") indican que el conjunto resultante reduce significativamente los rechazos del modelo original.

## Capacidades

- Generacion de texto creativo orientada a roleplay de personajes (character-rp) y narrativa de ficcion.
- Escritura de historias (storytelling) con tono oscuro, herencia de Giftige-Blume y Artemis.
- Conversacion multi-turno (etiqueta "conversational").
- Razonamiento, aportado por la inclusion de Gryphe/Pantheon-Reasoning-31B-1.1 en la fusion.
- Perfil "low-refusal": reduce los rechazos del modelo base en contenido de ficcion maduro; etiquetado explicitamente como "nsfw" y "not-for-all-audiences".
- No se indica soporte de vision, audio, tool calling ni modos de thinking en la informacion disponible.

## Casos de uso

- Roleplay interactivo de personajes: el perfil conversacional y low-refusal lo hace adecuado para frontends tipo SillyTavern o text-generation-webui donde se simulan personajes con personalidades complejas y contenido maduro consentido.
- Escritura de ficcion oscura: la combinacion de Artemis y Giftige-Blume apunta a generacion de relatos con tematica sombria, thriller o horror, donde los modelos alineados estandar tienden a suavizar o rechazar el contenido.
- Narrativa interactiva (interactive fiction): puede actuar como narrador que responde a las decisiones del usuario manteniendo coherencia de tono a lo largo de la sesion.
- Asistente creativo para autores: brainstorming de tramas, dialogos y descripciones de ambientes en generos donde la censura del modelo base resulta limitante.
- Prototipado de agentes conversacionales de ficcion: al ser un modelo denso de 31B con licencia Apache 2.0, puede desplegarse en backends propios para chatbots narrativos sin restricciones de licencia.
- Evaluacion e investigacion de merges: util como caso de estudio sobre el efecto de desvincular el lm_head y de combinar modelos de escritura y razonamiento sobre un mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16): el repo pesa 65,4 GB, por lo que se necesitan aproximadamente 70 GB de VRAM o RAM+VRAM combinadas; en la practica, 2x A100 80GB, 2x H100 o 4x RTX 3090/4090 con tensor parallelism o offload.
- Con cuantizacion GGUF de 4 bits (Q4_K_M, aproximadamente 18-20 GB para 32,7B parametros): cabe en una RTX 3090 o RTX 4090 de 24 GB, o en una Mac con 32 GB de memoria unificada. Nota: no hay constancia de que existan cuantizaciones oficiales publicadas.
- Con Q8 o 6 bits: se recomiendan 40-48 GB de VRAM (A6000, 2x RTX 4090).
- Opciones de despliegue: al ser safetensors de una arquitectura Gemma, deberia funcionar con vLLM, TGI, llama.cpp y Ollama (este ultimo requiere conversion a GGUF por parte de la comunidad); la model card no especifica backends probados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Dark-Orthia-Untied-31B | 32,7B | google/gemma-4-31B-it | Merge RP/escritura creativa dark | Apache 2.0 | HuggingFace (safetensors) |
| TheDrummer/Artemis-31B-v1.2 | 31B (no disponible exacto) | google/gemma-4-31B-it | Escritura creativa y RP | no disponible | HuggingFace |
| Gryphe/Pantheon-Reasoning-31B-1.1 | 31B (no disponible exacto) | google/gemma-4-31B-it | Razonamiento | no disponible | HuggingFace |
| google/gemma-4-31B-it | 31B (no disponible exacto) | google | Modelo base generalista con instrucciones | Licencia Gemma (restricciones propias de Google) | HuggingFace |

La ventaja diferencial de Dark-Orthia frente a sus componentes es que combina en un solo modelo las capacidades de escritura y razonamiento de los merges base, y que hereda la licencia Apache 2.0 (mas permisiva que la licencia Gemma original en cuanto a condiciones de uso, segun la etiqueta del repositorio).

## Limitaciones y advertencias

- Contenido sensible: el modelo esta etiquetado como "nsfw", "dark" y "not-for-all-audiences"; su perfil low-refusal reduce los rechazos, lo que implica un riesgo elevado de generar contenido ofensivo, violento o sexualmente explicito si no se controla.
- Riesgo de alucinacion: no disponible como dato medido, pero al ser un merge orientado a ficcion, no es fiable para tareas que exijan factualidad estricta sin verificacion externa.
- Idiomas: no se declaran idiomas soportados; al derivar de Gemma-4, es razonable esperar buen rendimiento en ingles y rendimiento variable en otros idiomas, incluido el castellano, sin garantias publicadas.
- Longitud de contexto: no publicada; debe verificarse en la config.json antes de planificar aplicaciones con documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval u otras pruebas estandar.
- Estabilidad de merges: las fusiones de multiples modelos pueden producir degradaciones impredecibles (incoherencias, repeticiones o perdida de instrucciones del modelo base); conviene probarlo frente a sus modelos base en el caso de uso concreto.
- Uso comercial: la etiqueta indica Apache 2.0, lo que en principio permite uso comercial, pero los modelos base derivan de Gemma, cuya licencia original de Google impone condiciones propias; conviene revisar la cadena de licencias antes de despliegue en produccion.
- Adopcion muy temprana: con 54 descargas y 9 likes en el momento de la ficha, hay poca validacion comunitaria y probablemente poca disponibilidad de cuantizaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-Untied-31B
- Modelo base principal: https://huggingface.co/google/gemma-4-31B-it
- Modelo base (merge): https://huggingface.co/Ateron/Gemma-4-MoonGem-31B
- Modelo base (merge): https://huggingface.co/Blazed-Forge/Gemma-4-Giftige-Blume-31B-v1
- Modelo base (merge): https://huggingface.co/Gryphe/Pantheon-Reasoning-31B-1.1
- Modelo base (merge): https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Herramienta de merge: https://github.com/arcee-ai/mergekit
- Paper, demo y blog: no disponibles en la informacion proporcionada.
