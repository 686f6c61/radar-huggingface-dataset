# ReadyArt/Heimdallr-27B-v0.35-GGUF

## Resumen

Heimdallr-27B-v0.35 es un modelo de lenguaje afinado por ReadyArt, orientado a roleplay narrativo, conversación y generación de texto instructivo. La versión GGUF aquí documentada es una cuantización del modelo base del mismo nombre, diseñada para facilitar la inferencia local en hardware de consumo y servidores con recursos limitados. El modelo está etiquetado como "unaligned" (sin alineación) y orientado a contenido adulto, explícito y NSFW, lo que lo posiciona en la categoría de modelos de roleplay sin restricciones.

El nombre "27B" sugiere una arquitectura de aproximadamente 27.000 millones de parámetros, aunque no se confirma en la ficha oficial. Por la relación con el modelo hermano Heimdallr-v0.02-31B, es probable que se base en una variante de Gemma-4, pero este extremo no está verificado en la información disponible. La licencia Apache-2.0 permite uso comercial y modificación, aunque el contenido generado puede presentar riesgos legales y éticos.

La relevancia actual de este modelo radica en la demanda creciente de modelos de roleplay sin filtros, con capacidades narrativas avanzadas y despliegue local mediante GGUF. No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posible variante de Gemma-2 por similitud con Heimdallr-v0.02-31B, no confirmado) |
| Parametros totales | ~27B (deducido del nombre, no confirmado oficialmente) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (GGUF implica multiples cuantizaciones, pero no se listan) |
| Idiomas soportados | no disponible (probablemente ingles, por el contenido de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base ReadyArt/Heimdallr-27B-v0.35. Por la denominacion y la relacion con el modelo hermano Heimdallr-v0.02-31B, es plausible que sea un fine-tune de una arquitectura transformer densa de la familia Gemma-2, pero este dato no esta confirmado en la documentacion publica. Tampoco se conocen los datos de entrenamiento (numero de tokens, composicion del dataset, metodologia de ajuste como RLHF o DPO). La version GGUF es una cuantizacion del modelo base, lo que reduce el peso y los requisitos de memoria a costa de una pequena perdida de precision.

## Capacidades

- Generacion de texto narrativo y dialogos para roleplay, con un enfoque en atmosferas oscuras, fantasticas y de contenido adulto.
- Soporte de instrucciones (instruct) para seguir indicaciones del usuario en formato conversacional.
- Generacion de respuestas extensas y descriptivas, orientadas a inmersión narrativa.
- Capacidad de generar contenido explicito y NSFW, sin filtros de alineacion (modelo "unaligned").
- Soporte de contextos conversacionales multi-turno, aunque la longitud exacta de contexto no se ha publicado.
- Capacidades multilingues no confirmadas; el contenido de la model card esta en ingles, por lo que es probable que el modelo este entrenado principalmente en ingles.

## Casos de uso

- Roleplay narrativo en entornos de fantasia oscura: el modelo puede generar descripciones detalladas de escenarios, personajes y dialogos, manteniendo coherencia en historias de larga duracion.
- Escritura creativa de ficcion adulta: autores pueden usarlo como asistente para generar borradores de novelas o relatos con contenido maduro, aprovechando su falta de filtros.
- Simulacion de personajes para juegos de rol: permite crear NPCs con personalidades complejas y reactivas en juegos de mesa o digitales.
- Prototipado de chatbots conversacionales sin restricciones: desarrolladores pueden integrarlo en aplicaciones de chat para probar interacciones libres, aunque debe evaluarse el riesgo de contenido inapropiado.
- Generacion de dialogos para guiones o teatro: su capacidad de mantener tono y estilo en conversaciones multi-turno lo hace util para escribir guiones.
- Experimentacion en investigacion sobre modelos no alineados: el modelo puede usarse en estudios academicos sobre el comportamiento de LLMs sin filtros, siempre que se respete la etica de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~27B en GGUF, se requieren aproximadamente:
  - Cuantizacion Q4_K_M: ~16 GB VRAM
  - Cuantizacion Q5_K_M: ~18 GB VRAM
  - Cuantizacion Q8_0: ~27 GB VRAM
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones bajas, o A100 (40/80 GB) para cuantizaciones mas altas.
- En GPU de consumo: cabe en una RTX 3090/4090 con cuantizacion Q4 o Q5, pero no en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si el formato GGUF es compatible), text-generation-webui.
- Latencia y throughput: no disponibles; dependen de la GPU y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Heimdallr-27B-v0.35-GGUF | ~27B | no disponible | Apache-2.0 | Roleplay NSFW, sin alineacion |
| Heimdallr-v0.02-31B-GGUF | ~31B | no disponible | Apache-2.0 | Roleplay inmersivo, fantasia oscura |
| Gemma-2 27B (base) | 27B | 8K | Gemma license | Modelo base generalista |

La comparativa es limitada por la falta de datos. El modelo se diferencia de Gemma-2 base por su fine-tune especifico para roleplay sin filtros, pero no hay benchmarks que permitan evaluar la mejora real.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "unaligned", puede generar contenido ofensivo, discriminatorio o perjudicial sin control.
- Riesgo de alucinacion: alto, especialmente en contextos creativos donde la coherencia con la realidad no es prioritaria.
- Limitaciones de contexto: no se ha publicado la longitud maxima de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales sobre contenido adulto.
- Caveat de produccion: el modelo no esta disenado para tareas de alto riesgo (medicina, legal, etc.) y su uso en produccion debe restringirse a entornos controlados con moderacion humana.

## Enlaces

- HuggingFace (modelo GGUF): https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35-GGUF
- HuggingFace (modelo base): https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35
- Perfil de la organizacion ReadyArt: https://huggingface.co/ReadyArt/models
- Modelo hermano (Heimdallr-v0.02-31B-GGUF): https://huggingface.co/ReadyArt/Heimdallr-v0.02-31B-GGUF
