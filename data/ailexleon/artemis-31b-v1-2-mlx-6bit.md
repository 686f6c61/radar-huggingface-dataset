# ailexleon/Artemis-31B-v1.2-mlx-6Bit

## Resumen

ailexleon/Artemis-31B-v1.2-mlx-6Bit es una conversion al formato MLX del modelo TheDrummer/Artemis-31B-v1.2, un modelo de generacion de texto orientado a escritura creativa, roleplay y conversacion. No se trata de un entrenamiento nuevo: el autor ha tomado los pesos del modelo base y los ha cuantizado a 6 bits con mlx-lm 0.31.3, de modo que puedan ejecutarse de forma nativa sobre Apple Silicon mediante el framework MLX.

El modelo declara 30.697.345.280 parametros (aproximadamente 30,7B) y el repositorio ocupa 25,0 GB. Las etiquetas incluyen gemma4, lo que sugiere que la arquitectura subyacente pertenece a la familia Gemma, si bien ni la model card de la conversion ni la informacion disponible detallan la arquitectura exacta, la longitud de contexto ni el proceso de entrenamiento del modelo original.

Su interes es practico: permite ejecutar un modelo denso de ~31B en un Mac con memoria unificada suficiente, sin depender de CUDA, y con una perdida de calidad inferior a la de una cuantizacion de 4 bits. La licencia es Apache 2.0, el unico idioma declarado es el ingles y el pipeline es text-generation. Es una publicacion de comunidad sin descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card (etiqueta gemma4); transformer denso segun los pesos publicados |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits (este repositorio); el mismo autor publica una variante de 4 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una conversion de pesos. Segun la model card, la conversion se realizo desde TheDrummer/Artemis-31B-v1.2 con mlx-lm version 0.31.3, la herramienta oficial de conversion y cuantizacion del ecosistema MLX. El resultado es una cuantizacion de 6 bits almacenada en safetensors, con un tamano de repositorio de 25,0 GB, coherente con ~30,7B parametros a 6 bits mas los tensores auxiliares. No se especifican en la informacion disponible el tamano de grupo de cuantizacion, el esquema exacto (por ejemplo, affine o con escalas por grupo) ni si se cuantizaron todas las capas.

Respecto al modelo original, la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO u otras. Las etiquetas del modelo base y de esta conversion (creative writing, roleplay, conversational, character-rp, storytelling) indican que el ajuste esta orientado a generacion creativa y conversacional en ingles, mas que a tareas de razonamiento o codigo. La etiqueta gemma4 apunta a una arquitectura de la familia Gemma, pero conviene tratarlo como una indicacion y no como un dato verificado.

## Capacidades

- Generacion de texto en ingles con enfasis en escritura creativa: narrativa, descripciones, dialogos y prosa larga.
- Roleplay y character-rp: mantenimiento de personajes consistentes a lo largo de una conversacion multi-turno.
- Storytelling: continuacion y desarrollo de tramas, asi como generacion de escenas y estructuras narrativas.
- Conversacion general: respuesta a prompts conversacionales mediante plantilla de chat (chat_template del tokenizer, si esta definida).
- Integracion con MLX: carga y generacion mediante `mlx_lm.load` y `mlx_lm.generate`, con soporte de `apply_chat_template`.
- Ejecucion local en Apple Silicon sin GPU dedicada ni CUDA.
- Capacidades de tool calling o function calling: no documentadas en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas en la informacion disponible.
- Vision, audio o modo thinking: no documentados; las etiquetas solo cubren texto.
- Multilingue: no; el unico idioma declarado es el ingles.

## Casos de uso

- Escritura creativa asistida en local: el modelo puede generar borradores de relatos, capitulos o escenas en un Mac, sin enviar el texto a un servicio externo, gracias a que la cuantizacion de 6 bits reduce el peso a 25,0 GB y lo hace viable en memoria unificada.
- Roleplay y compania conversacional: con ~30,7B parametros y ajuste especifico en character-rp, es adecuado para mantener un personaje con voz y motivaciones consistentes a lo largo de sesiones largas, siempre que la longitud de contexto lo permita (no declarada).
- Prototipado de chatbots narrativos: permite construir demos de asistentes con personalidad usando `mlx_lm.server` como backend OpenAI-compatible en una maquina Apple.
- Generacion de contenido para videojuegos: dialogos ramificados, descripciones de objetos y respuestas de NPC, ejecutados en la maquina del desarrollador durante la fase de diseno.
- Herramienta de escritura para guionistas y novelistas: generacion de variantes de una misma escena o de dialogos alternativos para comparar tonos, con coste marginal nulo por token al ejecutarse en local.
- Investigacion sobre cuantizacion: comparar la salida de esta version de 6 bits con la variante de 4 bits del mismo autor y con el modelo base sin cuantizar para medir la degradacion en tareas creativas subjetivas.
- Educacion y ejercicios de redaccion en ingles: generacion de ejemplos de estilo, reescritura y practica de escritura, dado que el modelo solo esta declarado en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas (MMLU, HumanEval, GSM8K u otras), y tampoco se han encontrado en los resultados de busqueda datos numericos atribuibles a esta variante cuantizada.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 25,0 GB, por lo que la inferencia necesita del orden de 26-30 GB contando cache KV y overhead, cifra que crece con la longitud de contexto (no declarada).
- Memoria minima recomendada: 32 GB de memoria unificada, aunque con margen muy ajustado para contextos largos; 64 GB o mas es la configuracion comoda.
- GPU recomendadas: al ser un repositorio MLX, esta pensado para Apple Silicon (familias M1, M2, M3 y M4, en variantes Max y Ultra con 32 GB o mas). No es ejecutable directamente en GPUs NVIDIA o AMD a traves de MLX.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple Silicon de gama alta con memoria unificada suficiente; no esta pensado para GPUs de consumo con 24 GB (por ejemplo, RTX 4090) en su formato MLX.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), LM Studio u otras aplicaciones que integren MLX. Para vLLM, llama.cpp, Ollama o TGI habria que usar otra conversion (por ejemplo, GGUF), no este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ailexleon/Artemis-31B-v1.2-mlx-6Bit | ~30,7B | MLX, 6 bits | No disponible | Apache 2.0 | Repositorio HF, 0 descargas |
| ailexleon/Artemis-31B-v1.2-mlx-4Bit | No disponible | MLX, 4 bits | No disponible | Apache 2.0 (segun el modelo base) | Repositorio HF |
| TheDrummer/Artemis-31B-v1.2 | ~30,7B (modelo base) | Safetensors en precision original | No disponible | No disponible en la informacion consultada | Repositorio HF del autor original |
| Artemis 31b V1 (GGUF) | No disponible | GGUF, 34,6 GB | No disponible | No disponible | 38.221 descargas, 27 likes segun local-ai-zone |

La comparativa se limita a variantes del mismo modelo base o de la misma familia, ya que la informacion disponible no incluye datos de rendimiento que permitan confrontarlo con alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo nuevo: es una cuantizacion de comunidad, por lo que hereda todas las caracteristicas, sesgos y limitaciones del modelo base TheDrummer/Artemis-31B-v1.2.
- La cuantizacion a 6 bits puede introducir degradaciones en tareas sensibles al detalle, aunque menores que en una cuantizacion de 4 bits.
- Riesgo de alucinacion: al estar orientado a ficcion y roleplay, el modelo puede generar afirmaciones factuales incorrectas con fluidez; no debe usarse como fuente de datos sin verificacion.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse principalmente con datos en ingles, es previsible un sesgo cultural anglosajon, pero no hay confirmacion en la ficha.
- Limitacion de idioma: el unico idioma declarado es el ingles; se desconoce su comportamiento real en castellano.
- Longitud de contexto no declarada: no se puede garantizar el rendimiento en conversaciones o documentos largos sin probarlo.
- Restricciones de licencia: la conversion se publica como Apache 2.0; conviene verificar la licencia del modelo base antes de un uso comercial, ya que en la informacion disponible no consta de forma explicita.
- Ausencia de soporte documentado de tool calling o razonamiento multi-paso: no es adecuado para pipelines de agentes sin validacion previa.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad que haya reportado problemas ni validado la calidad de la conversion.
- Dependencia de plataforma: al usar MLX, el uso queda restringido a Apple Silicon; para otros entornos hay que recurrir a conversiones alternativas (GGUF u otras).
- Fechas de los metadatos: el repositorio figura como creado y actualizado el 2026-09-25, dato que conviene contrastar con la fecha real de publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ailexleon/Artemis-31B-v1.2-mlx-6Bit
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Variante de 4 bits del mismo autor: https://huggingface.co/ailexleon/Artemis-31B-v1.2-mlx-4Bit
- Variante v1 en MLX 6 bits: https://huggingface.co/ailexleon/Artemis-31B-v1-mlx-6Bit
- Ficha del modelo Artemis 31b V1 en GGUF: https://local-ai-zone.github.io/models/artemis-31b-v1.html
- Ficha del modelo Artemis 31b V1b en GGUF: https://local-ai-zone.github.io/models/artemis-31b-v1b.html
- Listado de modelos del autor (fuente externa): https://essamamdani.com/ai-models/company/ailexleon
