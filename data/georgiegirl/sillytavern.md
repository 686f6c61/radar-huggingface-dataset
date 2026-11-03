# georgiegirl/sillytavern

## Resumen

`georgiegirl/sillytavern` no es un modelo de lenguaje, sino un repositorio de la comunidad alojado en HuggingFace que recopila presets, lorebooks y ficheros de configuración para SillyTavern, el frontend de código abierto para interacción con modelos de lenguaje en contextos de rol y narrativa. El repositorio lo mantiene el usuario `georgiegirl` bajo licencia MIT y está etiquetado únicamente para inglés.

El contenido principal son los presets de la familia "Voyage", una serie de plantillas de prompting que definen el comportamiento del modelo (system prompt, instrucciones de formato, mecánicas de juego de rol tipo Powered by the Apocalypse, gestión de NPCs, escenas y comprobaciones de habilidad). Las versiones documentadas van de la v1.0 a la v6.0.1, con notas de cambios detalladas en cada iteración.

Es relevante para desarrolladores e investigadores que trabajen con SillyTavern o con sistemas de prompting para narrativa interactiva, porque documenta patrones concretos de ingeniería de prompts (CoT, simulación online-offline, trackers de escena) probados contra modelos como Gemma 4, Mistral Small 3.2, DeepSeek v3.2/v4 o la familia GLM. El repositorio no contiene pesos de modelo: su tamaño es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de presets y configuraciones) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (los presets se han probado con contexto de 32K BF16, pero no definen contexto propio) |
| Tipos de cuantizacion | no disponible (no aplica al repositorio; los presets se prueban contra modelos GGUF Q4_K_XL de terceros) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; los presets son ficheros JSON) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado ni pesos. Lo que contiene son ficheros JSON de configuración de prompts para SillyTavern, una aplicación que actúa como capa de orquestación sobre APIs de modelos (locales o remotas). La "arquitectura" efectiva es la del modelo que el usuario conecte a SillyTavern; los presets simplemente estructuran el system prompt, las instrucciones de formato, las reglas de juego y los bloques de contexto.

Los presets Voyage implementan mecánicas inspiradas en Powered by the Apocalypse (PbtA): comprobaciones de habilidad, tiradas, gestión de escenas, trackers de estado, simulación online-offline y un sistema de noticias. Las versiones más recientes (v5.1 y v6) reescriben los prompts en positivo, reducen el uso de tokens, mejoran la coherencia de NPCs y añaden capas de simulación de mundo. El autor indica que han sido probados extensamente con Unsloth Gemma 4 31B IT QAT Q4_K_XL con MTP activado y contexto de 32K en BF16, y que deberían funcionar con "cualquier modelo posterior a 2024".

## Capacidades

- Definición de system prompts estructurados para roleplay narrativo multi-turno en SillyTavern.
- Mecánicas de juego de rol PbtA: comprobaciones de habilidad, tiradas y resolución de acciones.
- Gestión de NPCs: generación de trasfondos, diálogos e interacciones entre NPCs.
- Trackers de escena y simulación de dinámicas de mundo (sistema de noticias, estado online-offline en v6).
- Instrucciones de estilo de prosa orientadas a reducir "slop" (repeticiones, construcciones "not x but y", staccato excesivo).
- Soporte de chain-of-thought (CoT) mejorado en las versiones v5.1 y posteriores.
- Compatibilidad declarada con Mistral Small 3.2, Magistral Small, Gemma 4 (E2B, E4B, 12B, 26B-A4B, 31B), DeepSeek v3.2/v4/v4.1, GLM 4.5 a 5.3 y Gemini 4 Argon, entre otros.
- Preset "Eval" orientado a experimentación con reglas, pensado como recurso de desarrollo.

## Casos de uso

- Roleplay narrativo asistido por LLM: cargar el preset Voyage v6 en SillyTavern y conectarlo a un modelo local (por ejemplo Gemma 4 31B IT QAT) para obtener sesiones de juego con gestión de escenas, NPCs y comprobaciones de habilidad consistentes.
- Evaluación comparativa de modelos en tareas de narración larga: usar los distintos presets Voyage como banco de pruebas reproducible para medir cómo responden Mistral Small, DeepSeek o GLM a las mismas instrucciones de formato y estilo.
- Desarrollo de agentes conversacionales con memoria de escena: reutilizar los patrones de tracker de escena y simulación online-offline como referencia para diseñar system prompts en aplicaciones de ficción interactiva.
- Investigación en ingeniería de prompts: el preset "Eval" permite experimentar con reglas y condiciones de activación de habilidades sin necesidad de escribir un preset desde cero.
- Creación de contenido narrativo: generación de trasfondos de personajes, localizaciones y escenarios consolidados en un único bloque de contexto, útil para escritores que trabajan con LLMs.
- Reducción de errores de estilo en producción: las instrucciones de la v5.1 y v6 (prompts en positivo, reducción de bucles y de errores gramaticales) sirven como plantilla para sistemas que necesitan prosa controlada y sin repeticiones.
- Base para forks y adaptaciones: al ser MIT, el contenido puede copiarse y modificarse para construir presets propios orientados a otros dominios (por ejemplo, simulación de entrevistas o tutoría).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas cualitativas ("tested extensively") con Gemma 4 31B IT QAT Q4_K_XL, MTP activado y contexto de 32K BF16, sin métricas numéricas.

## Requisitos de hardware

- El repositorio en sí no requiere hardware: son ficheros JSON de configuración (tamaño de repo 0.0 GB).
- Los requisitos reales dependen del modelo que se conecte a SillyTavern. El autor cita como referencia Gemma 4 31B IT en cuantización Q4_K_XL, que requiere aproximadamente 18-20 GB de VRAM en función del backend y del contexto.
- Para modelos de 12B en Q4 se puede operar en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); para 26B-A4B (MoE) el requisito baja por los parámetros activos, aunque el peso completo debe caber en memoria o descargarse a RAM.
- El contexto de 32K en BF16 que menciona el autor incrementa el consumo de KV cache y exige GPUs con 24 GB o más para modelos de 31B en Q4.
- Opciones de despliegue compatibles: llama.cpp, Ollama, LM Studio, vLLM o cualquier backend que SillyTavern pueda consumir vía API compatible con OpenAI.
- Latencia y throughput: no disponibles; dependen enteramente del modelo y del hardware subyacente.

## Comparativa con modelos similares

No aplica una comparativa de modelos porque el repositorio no es un modelo. A modo de contexto, se compara con otros repositorios de presets de la comunidad:

| Repositorio | Tipo | Licencia | Modelos objetivo | Contenido |
|---|---|---|---|---|
| georgiegirl/sillytavern | Presets SillyTavern | MIT | Gemma 4, Mistral Small, DeepSeek, GLM | Voyage v1-v6, Eval v1 |
| nohurrys/sillytavern (referenciado en la model card) | Presets SillyTavern | no disponible | Gemma 4 y otros | Ficheros Voyage originales enlazados |
| Presets genéricos de la comunidad SillyTavern | Presets SillyTavern | variable | Multi-modelo | Configuraciones sueltas sin versionado |

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí mismo ni contiene pesos; sin un backend de LLM conectado, el repositorio no produce ninguna salida.
- El autor solo declara compatibilidad con inglés; el rendimiento en castellano no está documentado.
- La compatibilidad con modelos distintos de Gemma 4 se describe como "might work" o "work with", sin pruebas sistemáticas publicadas.
- Los presets están optimizados para modelos "posteriores a 2024"; modelos más antiguos pueden degradar el formato, ignorar instrucciones o entrar en bucles.
- El contenido está orientado a roleplay y narrativa; no es adecuado como plantilla para tareas de código, matemáticas o agentes de producción sin adaptación.
- Riesgo de alucinación y de deriva narrativa inherente al uso de LLMs en contextos de ficción; los presets mitigan parte del problema (bucles, errores gramaticales) pero no lo eliminan.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Algunos enlaces de la model card apuntan a rutas de otro usuario (`nohurry/sillytavern`) y a modelos con nomenclatura no verificable (Gemma 4, DeepSeek v4, GLM 5.x); conviene comprobar su existencia antes de integrarlos en un pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/georgiegirl/sillytavern
- Anuncio Voyage v6: https://www.reddit.com/r/SillyTavernAI/comments/1xgcxcc/universal_preset_voyage_v6
- Anuncio Voyage v5.1: https://www.reddit.com/r/SillyTavernAI/comments/1x5h8xt/universal_preset_voyage_v51
- Anuncio Voyage v5.0: https://www.reddit.com/r/SillyTavernAI/comments/1x2m4oj/universal_preset_voyage_v5
- Anuncio Voyage v4.0-exp: https://www.reddit.com/r/SillyTavernAI/comments/1wnana0/gemma_4_preset_voyage_v4exp
- Anuncio Eval v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1vpv8nk/generic_preset_eval_v1
- Anuncio Voyage v3.0: https://www.reddit.com/r/SillyTavernAI/comments/1uvp500/gemma_4_preset_voyage_v3
- Anuncio Voyage v2.0: https://www.reddit.com/r/SillyTavernAI/comments/1upgraz/gemma_4_preset_voyage_v2
- Anuncio Voyage v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1tx1x7b/gemma_4_preset_voyage
- Modelo de referencia citado (Gemma 4 31B IT QAT GGUF): https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Modelo de referencia citado (Gemma 4 26B-A4B IT QAT GGUF): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Modelo de referencia citado (Gemma 4 12B IT QAT GGUF): https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Modelo de referencia citado (Gemma 4 E4B IT QAT GGUF): https://huggingface.co/unsloth/gemma-4-e4b-it-qat-GGUF
- Modelo de referencia citado (Gemma 4 E2B IT QAT GGUF): https://huggingface.co/unsloth/gemma-4-e2b-it-qat-GGUF
