# DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay-GGUF

## Resumen

El modelo DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay-GGUF es una cuantizacion en formato GGUF del modelo base DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay, desarrollado por el usuario DGDGDG12. Esta orientado a conversacion y roleplay con contenido no apto para todos los publicos (NSFW), y la cuantizacion con iMatrix esta calibrada con el dataset lipililipic/NSFW_Roleplay-gemma-2b. El modelo base pertenece a la familia Qwen3.5, una serie que segun las fuentes consultadas integra avances en razonamiento, codigo, matematicas y uso de herramientas, aunque la variante concreta de 9B esta especializada en roleplay.

El modelo cuenta con aproximadamente 8.950 millones de parametros, lo que lo sitia en un rango de tamano medio que permite su ejecucion en hardware de consumo con suficiente VRAM. El repositorio contiene 15,2 GB de pesos cuantizados en formato GGUF, compatibles con motores de inferencia como llama.cpp, Ollama o LM Studio. No se especifican la licencia, los idiomas soportados ni la longitud de contexto en la informacion proporcionada.

La informacion publica sobre el modelo es limitada: no se han publicado benchmarks, detalles de entrenamiento del modelo base ni comparativas con alternativas. A pesar de ello, el modelo puede resultar util para casos de uso de roleplay local, experimentacion con cuantizacion iMatrix y evaluacion de modelos sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay se ha cuantizado con iMatrix, utilizando el dataset lipililipic/NSFW_Roleplay-gemma-2b como datos de calibracion. La cuantizacion iMatrix ajusta los pesos cuantizados a los datos de calibracion, lo que puede mejorar la precision en tareas especificas del dominio de roleplay. No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, tipo de atencion, etc.), ni sobre el entrenamiento original (volumen de tokens, composicion del dataset, metodos de alineamiento como RLHF o DPO). El nombre del modelo sugiere que pertenece a la serie Qwen3.5, pero no se puede confirmar la arquitectura exacta sin documentacion adicional.

## Capacidades

- Conversacion y roleplay: el modelo esta disenado para interacciones conversacionales de roleplay, incluyendo contenido NSFW.
- Formato GGUF: compatible con motores de inferencia locales como llama.cpp, Ollama, LM Studio o vLLM.
- Calibracion iMatrix: optimizado para cuantizacion con datos especificos de roleplay.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades de vision o audio, ni sobre idiomas concretos.

## Casos de uso

- Roleplay conversacional local: el modelo puede ejecutarse en un equipo personal con GPU de gama media, ofreciendo una experiencia de roleplay sin conexion y sin depender de APIs externas.
- Creacion de personajes ficticios: se puede integrar en aplicaciones de chat para juegos de rol, generando respuestas coherentes con la personalidad del personaje definido por el usuario.
- Escritura creativa asistida: util para autores que necesiten generar dialogos y narrativas en contextos de ficcion, aprovechando la especializacion del modelo en conversaciones de roleplay.
- Evaluacion de cuantizacion iMatrix: sirve como caso practico para comparar la calidad de cuantizaciones GGUF calibradas con datasets especificos frente a cuantizaciones genericas.
- Investigacion de modelos sin restricciones: para estudios academicos sobre el comportamiento de modelos de lenguaje sin filtros de contenido, puede servir como referencia en entornos controlados.
- Prototipado de aplicaciones de chat: permite construir prototipos de chatbots con personalidad y contexto de roleplay, validando el enfoque antes de pasar a modelos mas grandes o propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con ~8,95B de parametros, una cuantizacion de 4 bits requeriria aproximadamente 5-6 GB de VRAM; una de 8 bits, alrededor de 9-10 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 2080, RTX 4060, RTX 3080) para cuantizaciones bajas; para cuantizaciones mas altas se recomienda 10-16 GB (RTX 3090, RTX 4090).
- Compatibilidad con GPU de consumo: si, es viable en GPU de consumo con suficiente VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte para GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay informacion suficiente para establecer una comparativa fiable con modelos similares. El nombre sugiere que es una variante de Qwen3.5-9B, pero no se han publicado datos comparativos de rendimiento, licencia o disponibilidad frente a otras alternativas de roleplay. Se recomienda evaluar directamente el modelo en el caso de uso previsto.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera contenido NSFW, lo que puede ser inapropiado para entornos profesionales o publicos generales.
- Licencia no especificada: no se ha definido la licencia, lo que genera incertidumbre sobre su uso comercial, redistribucion o modificacion.
- Datos de entrenamiento limitados: no se ha publicado informacion sobre el entrenamiento del modelo base, lo que dificulta evaluar sesgos, calidad de datos o riesgos de alucinacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en contextos de roleplay.
- Sin soporte de idiomas documentado: no se especifica que idiomas maneja correctamente, lo que puede afectar a usuarios no angloparlantes.
- Sin benchmarks publicados: no se puede verificar el rendimiento del modelo frente a alternativas similares.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay-GGUF)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:9b)
- [Unrestricted AI - Leaderboard de modelos sin censura](https://unrestricted.ai/)
- [Guia de Qwen3.5-9B Abliterated en Codersera](https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/)
