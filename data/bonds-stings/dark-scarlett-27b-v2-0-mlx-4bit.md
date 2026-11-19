# bonds-stings/Dark-Scarlett-27B-v2.0-mlx-4Bit

## Resumen

Dark-Scarlett-27B-v2.0-mlx-4Bit es una conversion al formato MLX (Apple Silicon) del modelo ReadyArt/Dark-Scarlett-27B-v2.0, un fine-tune orientado a roleplay, conversacion instructiva y contenido para adultos. El modelo original deriva de la familia Qwen 3.5 (tag `qwen3_5` en Hugging Face) y ha sido ajustado para eliminar restricciones de alineacion, lo que se refleja en las etiquetas `unaligned`, `nsfw`, `explicit` y `erp` (erotic roleplay) presentes en el repositorio.

La version aqui descrita ha sido convertida por el usuario bonds-stings con `mlx-lm` 0.31.2 y cuantizada a 4 bits, reduciendo el repositorio a 15,2 GB. El modelo cuenta con 26.895.993.856 parametros (aproximadamente 26,9 mil millones), lo que lo situa en la gama de modelos densos de gran tamano optimizados para ejecucion local en hardware Apple.

Su relevancia es acotada: se trata de un artefacto de nicho para la comunidad de roleplay y generacion creativa sin filtros, no de un modelo de proposito general para tareas de ingenieria, atencion al cliente o produccion empresarial. La licencia Apache 2.0 permite uso comercial, aunque el contenido que genera el modelo esta explicitamente marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.5, segun tag `qwen3_5`) |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base puede tener otras, no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |
| Tamano del repositorio | 15,2 GB |
| Version de mlx-lm usada | 0.31.2 |
| Modelo base | ReadyArt/Dark-Scarlett-27B-v2.0 |
| Relacion con el base | finetune |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5`, que indica que el modelo original se construyo sobre la familia Qwen 3.5 de Alibaba. Se trata, por tanto, de un transformer denso de aproximadamente 27 mil millones de parametros, sin mezcla de expertos. El proceso de creacion de esta version concreta consistio en una conversion de formato mediante `mlx-lm` 0.31.2 y una cuantizacion a 4 bits, sin reentrenamiento adicional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning, ni si se aplicaron tecnicas de RLHF, DPO o similares. Las etiquetas `unaligned` y `nsfw` sugieren que el ajuste se realizo para reducir o eliminar las capas de rechazo y moderacion tipicas de los modelos alineados, pero no hay documentacion tecnica que lo confirme. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Roleplay de personajes y escenarios, incluyendo contenido explicito y erotico (erp).
- Generacion creativa sin filtros de moderacion (modelo `unaligned`).
- Capacidad instructiva basica heredada del modelo base Qwen 3.5.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener personajes consistentes en conversaciones largas, con un tono adulto y sin restricciones de contenido, ejecutandose en Mac con Apple Silicon mediante MLX.
- Escritura creativa para adultos: generacion de ficcion explicita, dialogos y narrativa serializada donde el autor necesita un modelo sin censura editorial.
- Prototipado de chatbots de entretenimiento: util para desarrollar demos de asistentes de rol o compania virtual en entornos controlados y con audiencia adulta verificada.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio de modelo `unaligned` para analizar comportamientos, sesgos y riesgos de modelos sin moderacion.
- Generacion de dialogos para videojuegos narrativos: puede alimentar NPCs con personalidad marcada en prototipos de juegos indie con clasificacion por edades.
- Experimentacion con cuantizacion MLX: el repositorio es util para evaluar el rendimiento de un modelo de ~27 B en 4 bits sobre hardware Apple, comparando latencia y calidad frente a otras precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 15,2 GB en 4 bits, por lo que se necesita al menos 16 GB de memoria unificada para cargar los pesos, y 20-24 GB recomendados para margen de contexto y KV cache.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con MLX; no esta pensado para GPU NVIDIA ni CUDA.
- Cabe en consumer hardware Apple: si, en equipos con 24 GB o mas de memoria unificada (MacBook Pro M2 Pro/M3 Pro/M4 Pro en adelante, Mac Studio).
- Despliegue: `mlx-lm` (libreria oficial del formato). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dark-Scarlett-27B-v2.0-mlx-4Bit | ~26,9 B | no disponible | MLX 4-bit | Apache 2.0 | Roleplay/NSFW sin alinear |
| ReadyArt/Dark-Scarlett-27B-v2.0 | ~26,9 B | no disponible | safetensors | Apache 2.0 | Modelo base del anterior |
| Qwen 3.5 (familia base) | variable | no disponible | safetensors/GGUF | variable | Proposito general alineado |

No se dispone de datos de rendimiento comparativo ni de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido explicitamente marcado como `not-for-all-audiences`: genera material NSFW, adulto y potencialmente ofensivo; no apto para menores ni para entornos sin control de audiencia.
- Modelo `unaligned`: carece de las capas de rechazo y moderacion habituales, por lo que puede producir contenido danino, ilegal o eticamente problematico sin filtros.
- Riesgo elevado de alucinacion inherente a los modelos de lenguaje; no verificado con benchmarks.
- Sin informacion sobre sesgos especificos, idiomas soportados ni calidad multilingue.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones muy largas.
- Aunque la licencia es Apache 2.0, el uso comercial del contenido generado puede estar sujeto a normativa sobre material adulto y a las condiciones de las plataformas de despliegue.
- Dependencia de hardware Apple Silicon: no ejecutable en GPU NVIDIA sin conversion a otro formato.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni garantias de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bonds-stings/Dark-Scarlett-27B-v2.0-mlx-4Bit
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
