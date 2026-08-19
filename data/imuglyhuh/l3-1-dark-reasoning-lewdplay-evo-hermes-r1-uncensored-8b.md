# IMUGLYHUH/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B

## Resumen

L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B es un modelo de generacion de texto de 8.030 millones de parametros creado por el usuario IMUGLYHUH mediante merge con mergekit. Combina dos modelos base: NousResearch/DeepHermes-3-Llama-3-8B-Preview, que aporta capacidades de razonamiento activable mediante system prompts, y Undi95/Llama-3-LewdPlay-8B-evo, que proporciona un estilo de escritura creativa explicita, sin censura y orientada al roleplay. El resultado es un modelo instructivo de 128k de contexto disenado especificamente para ficcion, horror grafico y contenido NSFW, con un modo de "pensamiento" variable que puede oscurecerse mediante prompts especificos.

El modelo se distribuye en formato safetensors con precision bfloat16 y requiere la plantilla de chat Llama 3 Instruct. Esta pensado para usarse con temperaturas altas (1.2 o superiores) y prompts medios o largos, y esta orientado a casos de uso creativos donde la censura de otros modelos limitaria la generacion. Su relevancia radica en ser un ejemplo de merge que combina razonamiento profundo con libertad creativa total, aunque su ambito de aplicacion es muy especifico y no apto para todos los publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, merge de DeepHermes-3-Llama-3-8B-Preview y Llama-3-LewdPlay-8B-evo) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en el repositorio fuente; se mencionan formatos derivados (GGUF, GPTQ, EXL2, AWQ, HQQ) generables desde los safetensors |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge realizado con mergekit que combina dos modelos de 8B basados en Llama 3.1. El componente DeepHermes-3-Llama-3-8B-Preview de NousResearch aporta un sistema de razonamiento controlable que se activa o desactiva mediante system prompts especificos, con bloques de "thinking" visibles en la salida. El componente LewdPlay-8B-evo de Undi95 incorpora el metodo de merge "Evolve" (aplicado sobre MMLU), junto con tecnicas de uncensoring mediante el modelo Unholy y un entrenamiento DPO con Roleplay Llama 3. El resultado conserva aproximadamente entre el 50% y el 67% de la capacidad de razonamiento original de DeepHermes, segun el autor.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de fine-tuning especifico, ya que se trata de un merge de modelos existentes. El autor indica que el razonamiento se ha "oscurecido" respecto al modelo base, produciendo pensamientos mas cortos y comprimidos, y que la salida puede ser tan extrema como los bloques de razonamiento. Se recomienda una temperatura minima de 1.2 para obtener resultados optimos, con penalizacion de repeticion entre 1.02 y 1.07.

## Capacidades

- Generacion de texto creativo: ficcion, ciencia ficcion, romance, horror, storytelling y escritura vivida en todos los generos.
- Roleplay y escritura conversacional: soporta interacciones multi-turno con personajes, adecuado para plataformas como SillyTavern.
- Razonamiento variable: puede activar o desactivar bloques de "thinking" mediante system prompts, con control sobre la profundidad y el tono del razonamiento.
- Resolucion de acertijos, logic puzzles y problemas que normalmente superan las capacidades de un Llama 3.1 estandar, gracias al componente DeepHermes.
- Contenido sin censura: capaz de generar material NSFW, grafico, explicito, con violencia extrema y lenguaje soez, sin restricciones aparentes.
- Personalizacion de "caracter" del razonamiento: se puede instruir al modelo para que piense con una personalidad concreta (por ejemplo, el Joker de Batman) mediante prompts especificos.
- Adaptacion a temperaturas altas: el razonamiento se expande y enriquece con temperaturas de 1.2 o superiores, ofreciendo variaciones creativas.

## Casos de uso

- Escritura de ficcion de terror y horror: el modelo genera descripciones graficas y atmosferas oscuras con detalle explicito, util para autores que necesitan superar bloqueos creativos o explorar tonos extremos sin limitaciones de censura.
- Roleplay adulto en SillyTavern: gracias a su contexto de 128k y su entrenamiento con Roleplay Llama 3, puede mantener conversaciones largas y coherentes con personajes, incluyendo escenas NSFW, manteniendo la personalidad y el tono solicitado.
- Generacion de tramas y subtramas: el modo de razonamiento permite desglosar ideas complejas, generar multiples opciones de desarrollo narrativo y explorar consecuencias logicas dentro de una historia.
- Creacion de dialogos con caracter: mediante system prompts que definen una personalidad concreta, el modelo puede producir dialogos y monologos internos con una voz distintiva, util para guiones o novelas.
- Resolucion de acertijos y puzzles narrativos: el componente DeepHermes permite abordar problemas de logica integrados en historias, como enigmas o misterios, con un razonamiento paso a paso visible.
- Exploracion creativa experimental: artistas y escritores que trabajan con contenido transgresor o provocador pueden usar el modelo para generar material que otros modelos rechazarian, manteniendo coherencia y calidad literaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el metodo "Evolve" se aplico sobre MMLU en el modelo LewdPlay base, pero no se proporcionan cifras concretas para este merge final. Tampoco hay comparativas cuantitativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 16 GB en disco, por lo que se necesitan al menos 16-20 GB de VRAM para cargarlo en precision completa. Con cuantizaciones (GGUF Q4, GPTQ, EXL2) se puede reducir a 5-8 GB.
- GPU recomendadas: para precision completa, una RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantizaciones, una RTX 3060 12 GB o RTX 4070 Ti Super (16 GB) puede ser suficiente.
- En consumer GPU: si, con cuantizaciones Q4 o Q5 es viable en GPUs de 8-12 GB, aunque el contexto largo (128k) requerira gestion de memoria o ventanas deslizantes.
- Opciones de despliegue: compatible con transformers, text-generation-inference, vLLM, llama.cpp, Ollama y SillyTavern mediante API. Los quants GGUF se pueden generar desde los safetensors.
- Latencia y throughput: no disponible. Al ser un modelo de 8B, en una RTX 4090 con cuantizacion Q4 se espera una velocidad de generacion de 50-100 tokens/segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B | 8B | 128k | Apache 2.0 | Creativo, NSFW, razonamiento variable |
| NousResearch/DeepHermes-3-Llama-3-8B-Preview | 8B | 32k (ampliable) | Apache 2.0 | Razonamiento general, instructivo |
| Undi95/Llama-3-LewdPlay-8B-evo | 8B | 8k (ampliable) | Apache 2.0 | Roleplay NSFW, sin censura |
| DavidAU/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B | 8B | 128k | Apache 2.0 | Variante similar, sin componente LewdPlay |

El modelo se distingue de sus bases por combinar razonamiento y contenido explicito en un unico checkpoint. Frente a DeepHermes, sacrifica capacidad de razonamiento puro (segun el autor, entre 50% y 67%) a cambio de una generacion creativa mucho mas libre. Frente a LewdPlay, anade el sistema de "thinking" y amplia el contexto de 8k a 128k. La variante de DavidAU es practicamente identica pero sin el componente LewdPlay, lo que la hace ligeramente menos orientada al contenido sexual explicito.

## Limitaciones y advertencias

- Contenido extremo: el modelo genera sin censura material NSFW, horror grafico, violencia y lenguaje soez. No es apto para menores ni para entornos profesionales o corporativos.
- Sesgos y alucinaciones: al ser un modelo sin fine-tuning de seguridad, puede producir afirmaciones falsas, estereotipos o contenido ofensivo. El modo de razonamiento puede amplificar estos sesgos.
- Idioma: solo se declara soporte para ingles. El rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Activacion del razonamiento inconsistente: el autor advierte que a veces es necesario regenerar varias veces para que el bloque de "thinking" se active, y que ocasionalmente el bloque termina sin generar la salida final, requiriendo intervencion manual.
- Requiere prompts especificos: el razonamiento no se activa por defecto; es imprescindible usar system prompts como los proporcionados en la model card para obtener el comportamiento esperado.
- Temperaturas recomendadas altas: el modelo funciona mejor con temperaturas de 1.2 o superiores, lo que puede producir salidas incoherentes o repetitivas si no se ajusta correctamente la penalizacion de repeticion.
- Sin garantias de calidad: al ser un merge sin evaluacion publica, no hay datos objetivos sobre su rendimiento en tareas estandar. Su uso en produccion debe ser validado previamente.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales o politicas de plataformas. El responsable del despliegue asume los riesgos legales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IMUGLYHUH/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B
- Modelo base DeepHermes: https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
- Modelo base LewdPlay: https://huggingface.co/Undi95/Llama-3-LewdPlay-8B-evo
- Variante similar de DavidAU: https://huggingface.co/DavidAU/L3.1-Dark-Reasoning-Unholy-Hermes-R1-Uncensored-8B
- Pagina de modelos con cuantizaciones (arbol de modelos): https://huggingface.co/models?other=base_model:quantized:DavidAU/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B
