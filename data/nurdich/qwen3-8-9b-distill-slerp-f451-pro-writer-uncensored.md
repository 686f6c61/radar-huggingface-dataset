# nurdich/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored

## Resumen

`nurdich/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored` es un modelo de lenguaje de 9.650 millones de parámetros (9,65B) creado mediante fusión (merge) con la herramienta open source Mergekit, combinando dos modelos base de la familia Qwen3.5/3.8: `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` (una destilación de Qwen3.8 centrada en razonamiento, matemáticas, código y tool use, con eliminación de censura) y `DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic` (especialista en escritura creativa y estilo literario). El resultado es un modelo orientado a la generación de texto narrativo, roleplay y novelas, con especial énfasis en contenido en chino y sin filtros de seguridad.

El merge utiliza el método SLERP (Spherical Linear Interpolation) con una programación por capas: las capas de atención tempranas se inclinan hacia el modelo de razonamiento, mientras que las capas de atención tardías favorecen al modelo de escritura, buscando conservar la inteligencia general y añadir fuerza creativa. El autor lo presenta como su primer merge y destaca su rendimiento en contenido NSFW, roleplay y novelas en chino. Aunque el repositorio indica el pipeline `image-text-to-text`, no se ha confirmado ninguna capacidad multimodal real; se trata probablemente de una etiqueta heredada de los modelos base.

El modelo está disponible en formato `safetensors` en `bfloat16` (19,3 GB) y existe una versión GGUF cuantizada (i1) publicada por un tercero. No se especifica la licencia en la ficha del repositorio, aunque el modelo base `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` está bajo Apache 2.0. Es un modelo sin censura, marcado como "no apto para todos los públicos", con un enfoque claro en el nicho de escritura adulta y roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5/3.8, no se especifica detalle) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se hereda de Qwen3.5/3.8, sin confirmar) |
| Tipos de cuantizacion | bfloat16 (safetensors); GGUF cuantizado (i1) disponible via terceros |
| Idiomas soportados | Chino (principal, segun el autor), ingles (heredado del modelo base) |
| Licencia | No disponible (modelo base bajo Apache 2.0, pero el merge no especifica) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión SLERP (Spherical Linear Interpolation) entre dos modelos de 9B de la familia Qwen3.5/3.8, realizada con Mergekit. No se trata de un entrenamiento desde cero ni de un fine-tuning adicional, sino de una combinación de pesos. La configuración YAML indica un esquema de interpolación por capas: para `self_attn` se aplican valores `t = [0, 0.5, 0.3, 0.7, 1]` (donde 0 favorece al modelo base de razonamiento y 1 al modelo de escritura), mientras que para `mlp` se usa `t = [1, 0.5, 0.7, 0.3, 0]`, con un valor global de 0.5 para el resto de tensores. Los pesos se almacenan en `bfloat16`.

El modelo base `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` es una destilación full-parameter de Qwen3.8 (2,4T tokens, A95B) hacia una arquitectura de 9B, entrenada con trazas de chain-of-thought del modelo profesor. Este proceso se centró en matemáticas y programación competitiva, e incluye function calling nativo y razonamiento explícito (bloques de pensamiento). El segundo modelo base, `DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic`, es un especialista en prosa creativa, también sin censura. La fusión busca combinar la inteligencia general y el razonamiento del primero con la capacidad narrativa del segundo, manteniendo el carácter "heretic" (sin alineamiento de seguridad).

## Capacidades

- Generacion de texto narrativo y creativo: novelas, cuentos, dialogos, descripciones vividas.
- Roleplay y conversacion multi-turno, con especial soltura en chino.
- Razonamiento paso a paso (chain-of-thought) heredado de la destilacion de Qwen3.8, incluyendo matematicas y logica.
- Generacion de codigo y soporte de function calling (heredado del modelo base de razonamiento).
- Conversacion general y respuestas a instrucciones, aunque el foco del autor es la escritura creativa.
- Capacidad multilingue limitada: chino (principal) e ingles (probablemente, por herencia), sin confirmacion oficial.
- Sin filtros de seguridad: puede generar contenido NSFW, violencia o material explicito (etiquetado como "not for all audiences").

## Casos de uso

- Escritura de novelas y ficcion en chino: el modelo puede generar capitulos completos, mantener el estilo y desarrollar tramas complejas gracias a su entrenamiento en prosa creativa. Adecuado para autores que necesitan un asistente de redaccion sin restricciones tematicas.
- Roleplay en entornos de chat: ideal para juegos de rol por texto, chatbots de personaje o simulaciones de dialogo, donde la ventana de contexto (aunque no especificada) permite mantener conversaciones largas. El modelo produce respuestas con carga emocional y descriptiva.
- Creacion de contenido adulto para plataformas de ficcion: el modelo esta especificamente optimizado para NSFW, por lo que puede generar escenas explicitas bajo demanda, algo que los modelos censurados no permiten.
- Asistente de escritura para guiones o narrativa interactiva: puede proponer giros argumentales, desarrollar personajes y mantener coherencia interna en historias ramificadas.
- Generacion de dialogos con personalidad: util para videojuegos narrativos o prototipos de chatbots, donde se requiere variedad de voces y estilos.
- Prototipado de aplicaciones de generacion de texto sin moderacion: desarrolladores que necesitan un modelo base sin restricciones para experimentar con generacion libre, siempre que asuman los riesgos legales y eticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas comparativas (MMLU, HumanEval, GSM8K, etc.) para este merge especifico. Los modelos base individuales podrian tener datos, pero no se han verificado para la version fusionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en `bfloat16` ocupa aproximadamente 19,3 GB (pesos + overhead). Con cuantizacion GGUF (por ejemplo, Q4_K_M) el tamaño se reduce a unos 5-6 GB, lo que permite ejecutarlo en GPUs de 8-12 GB.
- GPU recomendadas: para el modelo completo en bfloat16 se necesitan GPUs con 24 GB o mas (RTX 3090/4090, A100, H100). Con cuantizacion, cabe en RTX 3060 12 GB, RTX 4070, etc.
- Si cabe en consumer GPU: si, con cuantizacion GGUF (por ejemplo, mediante llama.cpp u Ollama) se puede ejecutar en GPUs de gama media.
- Opciones de despliegue: vLLM (soporta safetensors), llama.cpp, Ollama, Transformers (con `device_map="auto"`), TGI (Text Generation Inference). Tambien existe una version GGUF publicada por mradermacher.
- Latencia y throughput: no disponibles. Para un modelo de 9B en una RTX 4090 con cuantizacion 4-bit, se puede esperar un throughput de 30-60 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nurdich/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored | 9,65B | No disponible | No disponible | Escritura creativa y roleplay sin censura (chino) |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic | 9B (aprox.) | No disponible | Apache 2.0 | Razonamiento, codigo, function calling, sin censura |
| DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic | 9B (aprox.) | No disponible | No disponible | Escritura creativa sin censura |
| Qwen3.5-9B (oficial) | 9B | 32K (tipico) | Apache 2.0 | Modelo general con alineamiento de seguridad |

La comparativa se limita a los modelos base y al Qwen3.5 oficial, ya que no se dispone de datos de rendimiento del merge. El modelo destaca por su ausencia de filtros, algo que el Qwen oficial no ofrece.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar texto explicito, violento u ofensivo. No es apto para menores ni para entornos laborales. El propio autor lo etiqueta como "not for all audiences".
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, nombres o detalles. En escritura creativa esto puede ser aceptable, pero no es fiable para informacion factual.
- Sesgos: al estar entrenado principalmente en chino y sin alineamiento de seguridad, puede reflejar sesgos culturales o estereotipos presentes en los datos de entrenamiento.
- Licencia no clara: aunque el modelo base usa Apache 2.0, el merge no especifica su propia licencia. Esto genera incertidumbre legal para uso comercial.
- Idioma limitado: el autor indica que el rendimiento es especialmente bueno en chino; el ingles puede ser menos consistente.
- Longitud de contexto no confirmada: no se ha verificado la ventana de contexto real, lo que puede afectar a tareas que requieran documentos largos.
- Sin soporte multimodal real: aunque el pipeline indica `image-text-to-text`, no hay evidencia de que el modelo procese imagenes.
- Calidad de la fusion no validada: al no haber benchmarks, el rendimiento real en tareas generales es desconocido. Podria degradar capacidades de razonamiento o codigo frente a los modelos base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nurdich/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored
- Modelo base 1 (razonamiento): https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Modelo base 2 (escritura): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Version GGUF (tercero): https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-i1-GGUF
- Repositorio de Mergekit: https://github.com/cg123/mergekit (y https://github.com/arcee-ai/mergekit)
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de FriendliAI con detalles del modelo base: https://friendli.ai/models/nurdich/Qwen3.8-9B-Distill-uncensored-heretic
- Laboratorio Empero (desarrolladores del modelo base): https://empero.org/
