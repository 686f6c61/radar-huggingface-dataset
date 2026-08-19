# mradermacher/Qwen3.5-9B-DS9-USS-Defiant-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `nightmedia/Qwen3.5-9B-DS9-USS-Defiant`, un merge de la serie Qwen3.5-9B orientado a escritura creativa, ficción y roleplay. El modelo original, desarrollado por Nightmedia, combina múltiples fine-tunes mediante mergekit y aplica técnicas de "abliteration" para eliminar mecanismos de rechazo, resultando en un modelo "uncensored" (sin censura) que prioriza la generación de texto vívido y narrativo. Con aproximadamente 8,95 mil millones de parámetros, se posiciona como una opción compacta para tareas de storytelling y generación de ficción en inglés y chino.

La cuantización ha sido realizada por mradermacher, quien ofrece una amplia gama de formatos GGUF con distintos niveles de compresión, desde `i1-IQ1_M` (3,0 GB) hasta `i1-Q6_K` (7,5 GB), permitiendo su ejecución en hardware de consumo. Aunque el modelo base es multimodal (con visión nativa), este repositorio solo incluye los pesos del transformador; los archivos de proyector de visión (`mmproj`) se encuentran en el repositorio estático de cuantizaciones. Su licencia Apache 2.0 facilita el uso comercial y la redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B, merge mediante mergekit) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B tiene 262K tokens segun fuentes externas, no confirmado para este merge) |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q6_K (ademas de archivo imatrix) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base `nightmedia/Qwen3.5-9B-DS9-USS-Defiant` es un merge de multiples fine-tunes de la serie Qwen3.5-9B, combinados mediante mergekit. Los tags indican el uso de Unsloth para el fine-tuning, asi como las tecnicas "heretic" y "abliterated", que consisten en eliminar las capas o pesos responsables de rechazar solicitudes consideradas inapropiadas, obteniendo asi un modelo sin restricciones de contenido. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso con atencion completa, aunque este merge puede haber modificado algunos componentes. El repositorio de cuantizaciones indica que se trata de un modelo de vision, por lo que el modelo original incluye un codificador visual, aunque los pesos GGUF aqui presentados no lo incluyen.

## Capacidades

- Generacion de texto creativo y narrativo: especializado en escritura de ficcion, incluyendo ciencia ficcion, romance y otros generos.
- Generacion de tramas y sub-tramas: capaz de crear argumentos complejos y desarrollarlos de forma coherente.
- Continuacion de escenas y storytelling: puede seguir una historia existente y mantener la coherencia narrativa.
- Roleplay: disenado para interacciones de rol con multiples personajes y dialogos.
- Escritura vivida y descriptiva: enfocado en prosa detallada y evocadora.
- Soporte multilingue: opera en ingles y chino.
- Capacidad de vision (en el modelo base): aunque no incluida en los pesos GGUF, el modelo original puede procesar imagenes si se combina con el proyector de vision adecuado.
- No se menciona soporte explicito para tool calling, function calling ni razonamiento multi-paso como agente.

## Casos de uso

- Generacion de novelas y relatos: el modelo puede producir capitulos completos de ficcion con desarrollo de personajes y tramas, aprovechando su entrenamiento en storytelling y su ventana de contexto larga (si se confirma la herencia de 262K tokens).
- Creacion de guiones para juegos de rol: ideal para generar dialogos, descripciones de escenarios y reacciones de personajes no jugadores (NPC) en partidas de rol, gracias a su capacidad de roleplay.
- Asistente de escritura para autores: puede sugerir continuaciones, alternativas de escena o descripciones vividas, funcionando como un copiloto creativo en el proceso de redaccion.
- Generacion de dialogos para personajes: permite crear conversaciones naturales y diferenciadas entre multiples personajes, util en produccion de guiones o videojuegos.
- Continuacion de historias existentes: al recibir un fragmento de texto, el modelo puede extenderlo manteniendo estilo y coherencia, util para fanfiction o serializaciones.
- Creacion de mundos y lore: puede generar descripciones de mundos ficticios, sistemas de magia, culturas y trasfondos historicos, facilitando el worldbuilding en proyectos de escritura o juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los archivos GGUF varian entre 3,0 GB (i1-IQ1_M) y 7,5 GB (i1-Q6_K). Para una calidad razonable, se recomienda al menos la cuantizacion i1-Q4_K_M (5,7 GB).
- VRAM estimada: para i1-Q4_K_M se necesitan aproximadamente 8 GB de VRAM; para i1-Q6_K, unos 10-12 GB. Las cuantizaciones mas pequeñas (IQ1_M, IQ2_XXS) pueden caber en 4-6 GB, aunque con perdida notable de calidad.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, o superiores. Tambien es posible ejecutarlo en Apple Silicon con 16 GB unificados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan datos especificos, pero en una GPU moderna (RTX 4070) se puede esperar una generacion de 20-40 tokens/segundo con la cuantizacion Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262K (segun fuentes) | Apache 2.0 | Modelo general multimodal |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Modelo general |
| Mistral 7B | 7B | 32K | Apache 2.0 | Modelo general |
| Este modelo (DS9-USS-Defiant) | 8,95B | No disponible | Apache 2.0 | Escritura creativa, roleplay, sin censura |

La comparativa se basa en caracteristicas generales conocidas de los modelos base. No se dispone de datos de rendimiento comparativo para este merge especifico.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido explicito, ofensivo o inapropiado sin filtros. Su uso en aplicaciones publicas requiere moderacion adicional.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede inventar hechos o detalles, especialmente en contextos largos.
- La longitud de contexto no esta confirmada para este merge; si se reduce respecto al modelo base, podria afectar a tareas que requieran mucho contexto.
- Solo soporta ingles y chino; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base `nightmedia/Qwen3.5-9B-DS9-USS-Defiant` no tenga restricciones adicionales (aunque los tags indican apache-2.0).
- Los pesos GGUF no incluyen el proyector de vision; para usar la funcionalidad multimodal es necesario descargar el repositorio estatico correspondiente.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-DS9-USS-Defiant-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-DS9-USS-Defiant
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF
- Informacion sobre Qwen3.5-9B (fuente externa): https://www.llm-releases.com/models/qwen3-5-9b
