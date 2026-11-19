# chimbiwide/Gemma3NPC-4B-no-thinking

## Resumen

Gemma3NPC-4B-no-thinking es un ajuste fino (fine-tune) del modelo multimodal google/gemma-3-4b-pt, desarrollado por el usuario chimbiwide para un articulo aceptado en AIIDE-2026. El modelo esta especializado en la interpretacion de personajes no jugadores (NPC) en entornos de rol conversacional, con la particularidad de que genera respuestas directas sin etiquetas XML especiales ni modo de razonamiento explicito. Forma parte de un estudio comparativo sobre el impacto del "thinking mode" en la calidad de la interpretacion de personajes, y se distribuira junto a su contrapartida con modo de razonamiento.

Arquitectonicamente hereda la base de Gemma 3 4B, un transformer multimodal de Google DeepMind con aproximadamente 4.300 millones de parametros, capaz de procesar entradas de imagen y texto. El ajuste fino se ha realizado sobre el dataset chimbiwide/AIIDE-NO-THINKING, orientado a conversaciones de rol con contexto de personaje. Su relevancia actual radica en que ofrece una alternativa ligera, sin cadena de pensamiento, para sistemas de dialogo en videojuegos y experiencias interactivas, donde la latencia y la naturalidad conversacional priman sobre el razonamiento explicito.

El modelo esta publicado bajo licencia Gemma, con acceso condicionado a la aceptacion de los terminos de uso de Google en Hugging Face. El repositorio ocupa 8,6 GB en formato safetensors, y existe una version cuantizada en GGUF publicada por el mismo autor. Las descargas son muy bajas (12 en el momento de la consulta), lo que sugiere un uso de nicho academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 3 4B) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (chimbiwide/Gemma3NPC-4B-no-thinking-GGUF); cuantizaciones concretas no especificadas |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (licencia de uso de Google Gemma, con acceso condicionado) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-pt, la version preentrenada de Gemma 3 4B. Gemma 3 es una familia de modelos multimodales de Google DeepMind que combina capas de atencion con soporte para entradas de imagen y texto; la variante de 4B esta disenada para despliegue en hardware de consumo. El ajuste fino se ha realizado mediante fine-tuning supervisado sobre el dataset chimbiwide/AIIDE-NO-THINKING, cuyo contenido especifico (numero de tokens, composicion, presencia de RLHF o DPO) no se detalla en la informacion proporcionada.

La innovacion principal del modelo no reside en la arquitectura, sino en su comportamiento: esta entrenado para generar respuestas conversacionales normales sin etiquetas XML especiales ni modo de razonamiento explicito, a diferencia de su contrapartida "thinking". El model card recomienda un system prompt especifico con marcadores de nombre, trasfondo y localizacion del personaje, lo que indica que el entrenamiento se ha orientado a mantener coherencia de personaje y reaccion al contexto del jugador. No se documentan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interpretacion de personajes (roleplay).
- Procesamiento de entradas image-text-to-text (pipeline declarado), heredado de la base Gemma 3 4B.
- Respuestas directas sin modo de razonamiento ni etiquetas XML especiales.
- Mantenimiento de coherencia de personaje mediante system prompt con nombre, trasfondo y localizacion.
- Reaccion al contexto del jugador en conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado explicitamente sin thinking mode.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales: ninguna adicional documentada (sin vision mas alla de la heredada de la base, sin audio).

## Casos de uso

- NPCs en videojuegos de rol: el modelo puede encarnar personajes con trasfondo y localizacion definidos via system prompt, generando dialogos conversacionales y reactivos al jugador. Es adecuado por su tamano reducido (4,3B) y su entrenamiento especifico en roleplay sin cadena de pensamiento, lo que reduce latencia.
- Prototipado rapido de sistemas de dialogo: investigadores pueden integrar el modelo en pipelines de transformers para experimentar con tecnicas de prompting de personaje y comparar con la variante "thinking" del mismo autor.
- Demo academica del articulo AIIDE-2026: el repositorio KeeganCarey/Post-Thinking-AIIDE incluye una demo de uso, lo que permite reproducir los experimentos del paper.
- Simulaciones interactivas de narrativa: el modelo puede gestionar conversaciones multi-turno con contexto de escena (localizacion, trasfondo) para experiencias narrativas no lineales.
- Evaluacion comparativa de modos de razonamiento: util para estudiar el trade-off entre calidad de respuesta y latencia/coste computacional frente a modelos con thinking mode.
- Despliegue en hardware de consumo: gracias a su tamano y a la disponibilidad de cuantizaciones GGUF, puede ejecutarse en GPUs consumer para demos locales de NPCs.
- Generacion de dialogos de entrenamiento: puede emplearse para sintetizar conversaciones de personaje que alimenten otros sistemas o datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (4,3B parametros) se estima que en fp16 requiere aproximadamente 8-9 GB, en int8 unos 4-5 GB y en cuantizaciones GGUF de 4 bits unos 2,5-3 GB, aunque estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, GPUs con 8-16 GB de VRAM (RTX 3060/4060 Ti, RTX 4070/4080, A10) serian suficientes en cuantizaciones reducidas.
- Cabe en GPU consumer: probablemente si en modelos con 8 GB o mas en cuantizacion de 4 bits, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints_compatible; llama.cpp/Ollama mediante los GGUF publicados en el repositorio separado. vLLM no se menciona en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma3NPC-4B-no-thinking | 4,3B | no disponible | gemma | Hugging Face (acceso condicionado) |
| google/gemma-3-4b-pt (base) | 4,3B | no disponible | gemma | Hugging Face (acceso condicionado) |
| Variante "thinking" del mismo autor | no disponible | no disponible | gemma | referenciada en el paper y repositorio |
| Modelos comparables de rol conversacional de ~4B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Gemma 3, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: inherente a los modelos generativos; en roleplay puede inventar detalles de trasfondo no definidos en el system prompt.
- Limitaciones de contexto o idioma: solo ingles declarado; la longitud de contexto no esta documentada.
- Restricciones de licencia: licencia Gemma con acceso condicionado a la aceptacion de los terminos de Google en Hugging Face; el uso comercial esta sujeto a las condiciones de la licencia Gemma, que deben revisarse antes de produccion.
- Caveat para produccion: el modelo esta entrenado para un formato de system prompt concreto con marcadores de nombre, trasfondo y localizacion; fuera de ese formato el comportamiento puede degradarse.
- Ausencia de thinking mode: no es adecuado para tareas que requieran razonamiento explicito multi-paso o cadenas de pensamiento.
- Madurez: muy pocas descargas (12) y ningun like, lo que indica escasa validacion por parte de la comunidad; conviene evaluarlo empiricamente antes de adoptarlo.
- El contenido del dataset de entrenamiento no esta documentado en detalle, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimbiwide/Gemma3NPC-4B-no-thinking
- Cuantizaciones GGUF: https://huggingface.co/chimbiwide/Gemma3NPC-4B-no-thinking-GGUF
- Repositorio del proyecto: https://github.com/KeeganCarey/Post-Thinking-AIIDE
- Paper (DOI): https://doi.org/10.1609/aiide.v22i1.43599
- Conferencia AIIDE-2026: https://sites.google.com/view/aiide2026/home
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/AIIDE-NO-THINKING
