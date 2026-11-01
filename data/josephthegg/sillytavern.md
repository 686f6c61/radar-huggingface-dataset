# Josephthegg/sillytavern

## Resumen

`Josephthegg/sillytavern` no es un modelo de lenguaje, sino un repositorio de presets, lorebooks y personajes para SillyTavern, la interfaz de código abierto para roleplay e interacción con LLM. El autor publica configuraciones de prompting (denominadas "Voyage") que modifican el comportamiento de modelos de terceros durante sesiones de rol conversacional. El repositorio no contiene pesos, tokenizador ni código de inferencia: el tamaño declarado del repo es 0.0 GB y el pipeline no está definido.

La relevancia del proyecto es práctica: los presets Voyage (de v1.0 a v6) ajustan system prompts, instrucciones de escritura, mecánicas de skill check inspiradas en Powered by the Apocalypse (PbtA) y sistemas de simulación de mundo para mejorar la coherencia narrativa en sesiones largas de roleplay. El autor indica que están probados extensivamente con Gemma 4 31B IT QAT Q4_K_XL de Unsloth, con decodificación especulativa (MTP) activada y contexto de 32K en BF16.

La ficha se redacta, por tanto, describiendo el artefacto real (presets de prompting), no un modelo con parámetros propios. Cualquier dato relativo a arquitectura, pesos o benchmarks del "modelo" no aplica y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de presets de prompting para SillyTavern) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los presets se han probado con 32K BF16 de contexto en el modelo objetivo, no en el preset) |
| Tipos de cuantizacion | no disponible (los presets son archivos JSON; las cuantizaciones aplican a los modelos con los que se usan, p. ej. Q4_K_XL en Gemma 4 31B IT QAT) |
| Idiomas soportados | inglés (`en` según la model card y los tags) |
| Licencia | MIT |
| Formato de pesos | no disponible (archivos `.json` de preset; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay transformer, MoE ni SSM. El artefacto es una colección de archivos JSON de preset para SillyTavern que definen system prompts, instrucciones de formato, reglas de generación y mecánicas de juego (skill checks PbtA, gestión de NPC, seguimiento de escena, simulación online/offline en v6). No hay entrenamiento, dataset ni RLHF/DPO asociado al repositorio.

La "innovación" es de ingeniería de prompts: la serie Voyage evoluciona desde una base tipo Moonlight hacia un sistema PbtA "lite" (v1.0), introduce causalidad explícita y separación de roles GM/asistente (v2.0), reescribe los prompts en positivo y reduce bucles y errores gramaticales (v5.1), y en v6 añade sistema de noticias, scene tracker y simulación online-offline. El autor documenta pruebas con MTP (multi-token prediction, decodificación especulativa) y contexto de 32K en BF16 sobre Gemma 4 31B IT QAT Q4_K_XL.

## Capacidades

- Configuración de sesiones de roleplay multi-turno en SillyTavern con presets listos para importar.
- Mecánicas de skill check basadas en Powered by the Apocalypse (PbtA) integradas en el prompt (v1.0 a v5.1; retiradas temporalmente en v6).
- Gestión de NPC: generación de trasfondos, diálogos entre NPC y coherencia de personalidad.
- Scene tracker y sistema de noticias (v6) para mantener continuidad narrativa en sesiones largas.
- Simulación online-offline (v6) para dinámicas de mundo.
- Instrucciones de escritura orientadas a reducir "slop" narrativo (uso excesivo de staccato, construcciones "not x but y").
- Compatibilidad declarada con modelos posteriores a 2024: Mistral Small 3.2, Magistral Small, familia Gemma 4 (E2B, E4B, 12B, 26B-A4B, 31B), DeepSeek v3.2/v4/v4.1, GLM 4.5 a 5.3, Gemini 4 Argon.
- No incluye tool calling, function calling, visión, audio ni agentes autónomos: son capacidades del modelo subyacente, no del preset.

## Casos de uso

- Roleplay narrativo en SillyTavern: importar el preset Voyage v6 y un modelo compatible (por ejemplo Gemma 4 31B IT QAT Q4_K_XL) para obtener sesiones con seguimiento de escena y coherencia de NPC a lo largo de decenas de turnos.
- Campañas de rol con mecánicas PbtA: usar Voyage v5.1 para aprovechar los skill checks y la agencia del usuario, con tiradas integradas en el flujo conversacional.
- Generación de trasfondos de personajes y worldbuilding: los presets incluyen instrucciones para consolidar NPC, localización y escenario, útiles para preparar material de campaña antes de la sesión.
- Escritura asistida de ficción interactiva: las instrucciones de prosa y las reglas anti-slop (v5.1) sirven para producir texto narrativo con menos repeticiones y errores gramaticales.
- Pruebas comparativas de modelos en tareas de rol: el preset Eval v1.0 funciona como banco de pruebas de reglas y prompts sobre distintos modelos, útil para evaluar adherencia a instrucciones.
- Simulación de mundo persistente: la combinación de scene tracker, sistema de noticias y simulación online-offline de v6 permite mantener estado de mundo entre sesiones en proyectos de ficción serializada.
- Ajuste de experiencia de usuario en frontends de chat: servir como referencia de ingeniería de prompts para quien diseñe sus propios presets en SillyTavern.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas cualitativas ("tested extensively") con Gemma 4 31B IT QAT Q4_K_XL, MTP activado y 32K de contexto BF16, sin métricas numéricas.

## Requisitos de hardware

- El repositorio en sí no requiere hardware: son archivos JSON de pocos kilobytes.
- Los requisitos dependen del modelo con el que se use el preset. El autor cita Gemma 4 31B IT QAT en Q4_K_XL, que en esa cuantización ronda los 18-20 GB de VRAM, por lo que encaja en GPUs de 24 GB (RTX 4090, RTX 3090) con contexto moderado.
- Para 32K de contexto en BF16 con un modelo de 31B se necesita hardware de clase A100/H100 o múltiples GPUs consumer; el autor no detalla la configuración exacta.
- Alternativas más ligeras citadas: Gemma 4 12B IT QAT, 26B-A4B IT QAT (MoE), E4B y E2B, aptas para GPUs consumer de 8-16 GB según cuantización.
- Despliegue: SillyTavern como frontend, con backends tipo llama.cpp, Ollama, vLLM o TGI sirviendo el modelo subyacente. El preset se importa en la interfaz.
- Latencia y throughput: no disponibles; dependen enteramente del modelo y del backend.

## Comparativa con modelos similares

No aplica una comparativa de modelos porque el artefacto no es un modelo. Se comparan, a título orientativo, repositorios de presets equivalentes:

| Repositorio | Contenido | Licencia | Modelo objetivo | Disponibilidad |
|---|---|---|---|---|
| Josephthegg/sillytavern | Presets Voyage v1-v6, Eval v1.0 | MIT | Gemma 4, Mistral Small 3.2, DeepSeek, GLM, entre otros | HuggingFace, 0 descargas, 0 likes |
| nohurry/sillytavern | Presets referenciados por el autor (Voyage) | no disponible | Gemma 4 principalmente | HuggingFace |
| Presets de la comunidad SillyTavern | Configuraciones diversas | variable | variable | foros y Reddit |

No se dispone de datos de rendimiento comparativo entre presets.

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí mismo; requiere un LLM subyacente servido en SillyTavern u otro frontend compatible.
- Solo documentado en inglés; el rendimiento en castellano no está verificado por el autor.
- La compatibilidad con modelos no Gemma 4 es declarada pero no medida; el autor repite "might work" en varias versiones.
- Los presets dependen del formato de prompt y de las capacidades del modelo objetivo; cambios de versión del modelo pueden romper el comportamiento esperado.
- Riesgo de alucinación y deriva narrativa inherente al modelo subyacente, no corregido por el preset.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Licencia MIT permite uso comercial del preset, pero no otorga derechos sobre los modelos con los que se combine; hay que revisar la licencia de cada modelo subyacente.
- En producción, los presets deben versionarse y probarse contra el modelo y la cuantización exactos que se vayan a desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/Josephthegg/sillytavern
- Anuncio Voyage v6: https://www.reddit.com/r/SillyTavernAI/comments/1xgcxcc/universal_preset_voyage_v6
- Anuncio Voyage v5.1: https://www.reddit.com/r/SillyTavernAI/comments/1x5h8xt/universal_preset_voyage_v51
- Anuncio Voyage v5.0: https://www.reddit.com/r/SillyTavernAI/comments/1x2m4oj/universal_preset_voyage_v5
- Anuncio Voyage v4.0-exp: https://www.reddit.com/r/SillyTavernAI/comments/1wnana0/gemma_4_preset_voyage_v4exp
- Anuncio Eval v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1vpv8nk/generic_preset_eval_v1
- Anuncio Voyage v3.0: https://www.reddit.com/r/SillyTavernAI/comments/1uvp500/gemma_4_preset_voyage_v3
- Anuncio Voyage v2.0: https://www.reddit.com/r/SillyTavernAI/comments/1upgraz/gemma_4_preset_voyage_v2
- Anuncio Voyage v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1tx1x7b/gemma_4_preset_voyage
- Modelo de referencia Gemma 4 31B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Modelo de referencia Gemma 4 26B-A4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Modelo de referencia Gemma 4 12B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Modelo de referencia Gemma 4 E4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e4b-it-qat-GGUF
- Modelo de referencia Gemma 4 E2B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e2b-it-qat-GGUF
- Repositorio de presets del autor original: https://huggingface.co/nohurry/sillytavern
