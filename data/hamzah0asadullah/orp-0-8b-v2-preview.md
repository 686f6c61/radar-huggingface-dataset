# hamzah0asadullah/ORP-0.8B-v2-preview

## Resumen

ORP-0.8B-v2-preview es un modelo de generacion de texto especializado en roleplay conversacional, publicado por el usuario hamzah0asadullah en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, con 852.985.920 parametros totales (aproximadamente 0,85 mil millones) y pesos en formato safetensors. El modelo esta etiquetado con la arquitectura `qwen3_5` y se distribuye bajo licencia Apache 2.0, con soporte unicamente para ingles.

La relevancia de esta publicacion es limitada y acotada: no es un modelo de proposito general, sino una vista previa (preview) de la proxima generacion de la familia ORP del mismo autor, concretamente el checkpoint intermedio denominado C3k. El propio autor indica que se trata de un checkpoint temprano, resultado de una sola epoca de entrenamiento sobre aproximadamente 74 millones de tokens, y que el modelo final (y posiblemente una variante C6.5k) se publicara mas adelante. Por tanto, debe evaluarse como material de experimentacion, no como modelo listo para produccion.

El objetivo declarado es mejorar la generacion de respuestas de rol en tres frentes: respuestas algo mas largas sin perder coherencia, calidad sostenida al acercarse a la ventana de contexto larga (aproximadamente 16 000 tokens) y mejor generalizacion a personajes descritos con detalle. El entrenamiento se apoya en los datasets PygmalionAI/PIPPA y Gryphe/Sonnet3.5-Charcard-Roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (etiqueta de arquitectura `qwen3_5` en Hugging Face) |
| Parametros totales | 852.985.920 (aproximadamente 0,85 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Aproximadamente 16 000 tokens, segun la model card del autor; la longitud nativa del modelo base no se detalla |
| Tipos de cuantizacion | No disponible (solo se publican pesos sin cuantizar en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); tamano del repositorio 1,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles tecnicos internos de la arquitectura mas alla de la etiqueta `qwen3_5` y del modelo base declarado, Qwen/Qwen3.5-0.8B. Se trata, por tanto, de un finetune sobre un transformer decoder-only de aproximadamente 0,85 B de parametros, sin que el autor documente numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de tokenizacion. La model card menciona que el modelo mantiene calidad al aproximarse a una ventana de contexto de unos 16 000 tokens, lo que sugiere que hereda una ventana de contexto larga del modelo base, aunque no se especifica si se aplico extension de contexto durante el ajuste.

En cuanto al entrenamiento, el autor describe explicitamente un unico epoch sobre aproximadamente 74 millones de tokens, lo que lo convierte en un checkpoint temprano (C3k) de la generacion v2. Los datos de ajuste son los datasets PygmalionAI/PIPPA y Gryphe/Sonnet3.5-Charcard-Roleplay, ambos orientados a conversacion de rol y a fichas de personaje. No se documenta el uso de RLHF, DPO, RLVR ni ninguna otra etapa de alineacion posterior al ajuste supervisado, ni se detalla la composicion exacta del dataset, el reparto entre fuentes ni la plantilla de chat empleada. El autor tampoco confirma si el modelo base fue entrenado con capacidades multimodales: aunque la etiqueta `image-text-to-text` aparece en los tags del repositorio, el pipeline declarado es `text-generation` y la model card no describe ninguna capacidad de vision, por lo que no puede confirmarse como capacidad real.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay, con respuestas que alternan dialogo y narracion entre asteriscos.
- Adopcion de personajes definidos mediante un system prompt con formato `{{char}}` / `{{user}}` y separador `END_OF_DIALOG`, segun el ejemplo incluido en la model card.
- Generalizacion a personajes descritos con detalle que no aparecen en los datos de entrenamiento; el ejemplo publicado usa a Lucyna Kushinada de Cyberpunk: Edgerunners, y el propio autor senala que ni el system prompt ni el opening formaban parte del dataset.
- Generacion de respuestas algo mas largas que la version anterior manteniendo coherencia, segun la model card.
- Sostenimiento de la calidad al acercarse a la ventana de contexto de aproximadamente 16 000 tokens.
- Capacidad multilingue: no disponible; solo se declara ingles.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la documentacion. El tag `image-text-to-text` no se corresponde con ninguna capacidad descrita en la model card.

## Casos de uso

- Prototipado de chatbots de personaje: el modelo acepta un system prompt con ejemplos de dialogo y una ficha de personaje, por lo que sirve para montar demos de conversacion con un personaje concreto sin necesidad de infraestructura grande, dado su tamano de 0,85 B.
- Evaluacion de datasets de rol: al haber sido ajustado sobre PIPPA y Gryphe/Sonnet3.5-Charcard-Roleplay, resulta util como referencia para medir hasta que punto esos datos transfieren estilo y formato conversacional.
- Pruebas de personajes largos con contexto extenso: la ventana de aproximadamente 16 000 tokens permite mantener el historial de una escena y fragmentos de lore sin truncar agresivamente, util para validar estrategias de memoria conversacional.
- Generacion de dialogos para escritura creativa: el modelo produce intervenciones breves con narracion entre asteriscos, aprovechable como asistente de borrador en ficcion interactiva.
- Comparacion de checkpoints en investigacion de finetuning: al existir una version previa (ORP-0.8B) y una futura C6.5k anunciada, este preview sirve para estudiar la curva de mejora con mas datos de entrenamiento sobre el mismo modelo base.
- Experimentacion en hardware de consumo: con pesos de 1,7 GB en precision de 16 bits, es viable ejecutarlo en portatiles con GPU modesta o incluso en CPU, lo que facilita la reproduccion de experimentos academicos.
- Base para un finetune propio de rol en ingles: al estar bajo Apache 2.0, puede partirse de el para ajustar un personaje o estilo concreto, siempre que se verifiquen las condiciones de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones especificas de roleplay del tipo MT-Bench o EQ-Bench), y la busqueda web realizada no ha devuelto resultados relacionados con este modelo. Las unicas afirmaciones de mejora son cualitativas y comparan este preview con la version anterior ORP-0.8B: respuestas algo mas largas, mayor calidad cerca del limite de contexto y mejor adaptacion a roles bien descritos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar entre 3 y 5 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9 GB de pesos; en 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones a partir del numero de parametros, ya que el autor no publica versiones cuantizadas.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB si se cuantiza. Tambien es viable en CPU, dado el tamano reducido.
- GPU de datacenter (A100, H100, L40S) no son necesarias; resultan utiles unicamente para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` es la via documentada por el autor. Son tecnicamente plausibles vLLM, TGI, llama.cpp u Ollama, pero no hay pesos GGUF publicados y el autor no confirma compatibilidad con estos runners, por lo que la conversion seria responsabilidad del usuario.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa cuantitativa fiable. Se incluye una tabla con los datos confirmados y los campos no documentados marcados como tal.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos publicados |
|---|---|---|---|---|---|
| ORP-0.8B-v2-preview (este modelo) | 852.985.920 | Aproximadamente 16 000 tokens (segun model card) | Apache 2.0 | Safetensors | Sin benchmarks; 1 epoch, aproximadamente 74 M tokens |
| ORP-0.8B (version anterior del mismo autor) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen/Qwen3.5-0.8B (modelo base) | No disponible (el nombre sugiere 0,8 B) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint temprano de una sola epoca sobre aproximadamente 74 millones de tokens; el autor lo describe explicitamente como preview y anuncia versiones posteriores (C6.5k y el modelo final), por lo que su comportamiento puede cambiar de forma sustancial.
- Solo soporta ingles. No hay evidencia de capacidades en castellano ni en otros idiomas.
- No hay ninguna evaluacion cuantitativa publicada, ni del propio autor ni de terceros; el rendimiento real en tareas de rol no esta medido de forma objetiva.
- Riesgo de alucinacion: al ser un modelo pequeno ajustado sobre datos de personajes, puede inventar hechos, romper la coherencia del personaje o mezclar rasgos entre fichas, especialmente en contextos largos.
- Sesgos: los datasets PIPPA y Gryphe/Sonnet3.5-Charcard-Roleplay provienen de contenido generado por usuarios y de conversaciones de rol, por lo que pueden arrastrar sesgos de genero, cultura y estilo, ademas de posibles contenidos inapropiados. El autor no documenta ninguna etapa de alineacion, filtrado ni mitigacion.
- Ausencia de guardarrailes: no se documenta ningun mecanismo de seguridad, moderacion ni rechazo de peticiones daninas.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero al ser un finetune de Qwen/Qwen3.5-0.8B conviene verificar los terminos del modelo base antes de explotarlo comercialmente; no se dispone de esa informacion en el material proporcionado.
- Capacidad multimodal dudosa: el tag `image-text-to-text` aparece en el repositorio, pero no hay ninguna descripcion, ejemplo ni peso que confirme soporte de imagenes. No debe asumirse vision.
- Soporte de tool calling, agentes y razonamiento multi-paso no documentado; no se recomienda su uso en esos escenarios sin validacion previa.
- Madurez del repositorio muy baja: 0 descargas y 1 like en el momento de la consulta, publicado y actualizado el mismo dia (10 de septiembre de 2026), sin versionado de revisiones ni model card extendida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamzah0asadullah/ORP-0.8B-v2-preview
- Version anterior de la familia ORP: https://hf.co/hamzah0asadullah/ORP-0.8B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento PygmalionAI/PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Dataset de entrenamiento Gryphe/Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente paginas no relacionadas de la federacion alemana de voleibol.
