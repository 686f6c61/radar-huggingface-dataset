# QwennAI/Qwen3.9-NSFW

## Resumen

Qwen3.9-NSFW es un modelo de lenguaje comunitario modificado a partir de la arquitectura base Qwen3.9, desarrollado por el usuario QwennAI en Hugging Face. Se trata de un fine-tune sin censura que elimina los vectores de rechazo mediante una técnica de abliteration, orientado a escritura creativa, narración multi-personaje y roleplay adulto. El modelo está diseñado para ofrecer respuestas sin restricciones de contenido, manteniendo una coherencia narrativa y un razonamiento profundo propios de la familia Qwen.

La relevancia de este modelo radica en su enfoque para aplicaciones locales de ficción y roleplay donde el control de contenido es un requisito. Con una ventana de contexto nativa de hasta 131.000 tokens y compatibilidad con modos de razonamiento explícito, se posiciona como una alternativa sin censura dentro del ecosistema de modelos de lenguaje abiertos. No obstante, hay que señalar que el modelo no incluye salvaguardas y su uso está restringido a mayores de edad, con responsabilidad legal del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.9, con abliteracion de vectores de rechazo) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos, extendible via YaRN |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_K_M, Q8_0, FP16) recomendados; tambien safetensors |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (para despliegue local) |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer de la familia Qwen3.9, aunque no se han publicado detalles sobre el numero de capas, dimensiones o atencion. El modelo ha sido sometido a un proceso de abliteracion, que consiste en eliminar las direcciones de activacion asociadas a los rechazos de seguridad, de modo que el modelo no genera respuestas negativas ante solicitudes de contenido explicito. Ademas, se ha realizado un fine-tune adicional con un dataset de escritura creativa y roleplay, aunque no se especifican el numero de tokens de entrenamiento ni la composicion del dataset. No se mencionan tecnicas de RLHF o DPO en la informacion disponible.

La innovacion principal es la combinacion de abliteracion con un fine-tune especifico para narrativa, lo que permite un comportamiento "sin censura" manteniendo la coherencia del discurso. Se admite un modo de razonamiento paso a paso (thinking mode) y un modo conversacional directo, seleccionable segun el prompt.

## Capacidades

- Generacion de texto creativo y narrativo, con estilo descriptivo y fluidez en prosa.
- Roleplay multi-turno con consistencia de personaje y adherencia a personas definidas por el usuario.
- Sin barreras de contenido: puede generar escenarios adultos, violencia ficcional o lenguaje explicito.
- Razonamiento paso a paso (thinking mode) para tareas de logica o planificacion complejas.
- Soporte de contexto largo (131k tokens) para mantener estados de mundo extensos en historias de multiples capitulos.
- Multilingue: principalmente ingles y chino, con soporte adicional para otros idiomas.
- No soporta vision ni audio; es un modelo de texto puro.

## Casos de uso

- Escritura creativa asistida: autores pueden generar borradores de novelas, relatos o guiones con un estilo inmersivo y sin restricciones tematicas.
- Juegos de rol en solitario o multijugador: el modelo mantiene la coherencia de personajes y tramas en sesiones de larga duracion, gracias a su contexto de 131k tokens.
- Generacion de contenido para comunidades de ficcion: foros y blogs pueden usar el modelo para crear historias colaborativas sin filtros de moderacion.
- Prototipado de chatbots de entretenimiento para adultos: desarrolladores pueden integrar el modelo en aplicaciones privadas de conversacion sin guardarraíles.
- Simulacion de dialogo en guiones de cine o teatro: ayuda a explorar interacciones entre personajes con lenguaje natural y expresivo.
- Investigacion academica sobre modelos sin censura: analisis de como la abliteracion afecta a la generacion de texto y a la coherencia, en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de mediciones de MMLU, HumanEval, GSM8K ni otros tests estandarizados. Tampoco se han comparado con modelos de referencia en la model card.

## Requisitos de hardware

- Al ser un modelo de tamano desconocido, no se puede estimar una VRAM concreta. Para un modelo de 8B en cuantizacion Q4_K_M se requieren alrededor de 6-8 GB de VRAM; para un 14B, unos 10-12 GB.
- Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) para inferencia en FP16 con contexto largo.
- Para despliegue local se sugiere usar llama.cpp, Ollama o Kobold.cpp con archivos GGUF.
- En la nube, se puede servir con vLLM o TGI si se dispone de los pesos safetensors.
- La latencia depende del tamano del modelo y del hardware; sin datos concretos, se espera un throughput de 20-40 tokens/s en una GPU consumer de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Censura |
|---|---|---|---|---|
| QwennAI/Qwen3.9-NSFW | no disponible | 131k | Apache-2.0 | Sin censura (abliterado) |
| nicoboss/Qwen3-14B-Uncensored | 14B | no disponible | Apache-2.0 | Sin censura (fine-tune) |
| Qwen/Qwen3-14B (original) | 14B | 32k (extendible) | Apache-2.0 | Con censura |

La comparativa se basa en modelos de la misma categoria (fine-tunes sin censura de la familia Qwen). El modelo de QwennAI se distingue por su contexto nativo superior (131k) y la tecnica de abliteracion, mientras que el de nicoboss usa un fine-tune convencional. El modelo original de Qwen incluye filtros de seguridad.

## Limitaciones y advertencias

- El modelo no implementa guardias de seguridad: puede generar contenido explicito, violento o ilegal en determinadas jurisdicciones.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o incoherencias en narraciones largas.
- No hay informacion sobre sesgos especificos, pero al estar entrenado sin control de contenido, podria reflejar prejuicios de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara que esta destinado a uso privado y para mayores de 18 años; el usuario es responsable del cumplimiento legal.
- El modelo se basa en una arquitectura "Qwen3.9" no oficial, lo que puede implicar incompatibilidades con herramientas estandar.
- No se dispone de datos sobre rendimiento en tareas tecnicas o de razonamiento logico fuera del ambito creativo.

## Enlaces

- [Hugging Face - QwennAI/Qwen3.9-NSFW](https://huggingface.co/QwennAI/Qwen3.9-NSFW)
- [nicoboss/Qwen3-14B-Uncensored](https://huggingface.co/nicoboss/Qwen3-14B-Uncensored)
- [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Unrestricted AI Leaderboard](https://unrestricted.ai/)
