# nohurry/sillytavern

## Resumen

`nohurry/sillytavern` no es un modelo de lenguaje: es un repositorio de presets de prompting, lorebooks y personajes en formato JSON para SillyTavern, la interfaz de rol conversacional open source. Lo mantiene el usuario de HuggingFace `nohurry` bajo licencia MIT, con documentación únicamente en inglés, 39 likes, 0 descargas y un tamaño de repositorio de 0,0 GB (no contiene pesos). Su artefacto principal es la familia de presets "Voyage", actualmente en la versión 5.1, junto con un preset experimental de evaluación ("Eval v1.0").

El problema que resuelve es concreto: escribir un system prompt estable para rol de larga duración es tedioso y frágil. Voyage encapsula reglas de narrativa, gestión de PNJ, comprobaciones de habilidad al estilo Powered by the Apocalypse (PbtA), notas de dirección de juego y un sistema de etiquetas inspirado en Dungeon World y Pathfinder 2e. La versión 5.1 se reescribió en positivo, reduce bucles y errores gramaticales y elimina prompts redundantes, según el autor.

Es relevante ahora porque el autor lo valida contra una familia amplia de modelos recientes: Gemma 4 (E2B, E4B, 12B, 26B-A4B, 31B), Mistral Small 3.2, Magistral Small, DeepSeek v3.2/v4/v4.1, GLM 4.5 a 5.3 y Gemini 4 Argon. No hay arquitectura, entrenamiento ni benchmarks: cualquier evaluación de rendimiento debe hacerse sobre el modelo base que consuma el preset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no hay modelo ni pesos; son presets de prompting en JSON para SillyTavern |
| Parámetros totales | No aplica (0 parámetros; repositorio de 0,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al repositorio; el autor valida los presets con 32K de contexto (BF16 en el caso de Gemma 4 31B) |
| Tipos de cuantización | No aplica; en las pruebas se usan Q4_K_XL y Q6_K_L en los modelos base, con caché de contexto Q8_0 |
| Idiomas soportados | Inglés (los presets y las instrucciones están redactados en inglés) |
| Licencia | MIT |
| Formato de pesos | No hay pesos; los artefactos son archivos `.json` |
| Tipo de artefacto | Presets de generación, lorebooks, personajes |
| Versión principal | Voyage v5.1 (universal) |
| Versiones previas | Voyage v5.0, v4.0-exp (exp1, exp2, exp3), v3.0, v2.0, v1.0, Eval v1.0 |
| Modelos objetivo declarados | Gemma 4 (E2B, E4B, 12B, 26B-A4B, 31B), Mistral Small 3.2, Magistral Small, DeepSeek v3.2/v4/v4.1, GLM 4.5–5.3, Gemini 4 Argon |
| Descargas | 0 |
| Likes | 39 |
| Fecha de creación | 2026-05-27 |
| Última actualización | 2026-10-25 |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento: el repositorio distribuye texto de sistema y configuraciones de muestreo que se inyectan en la ventana de contexto de un LLM servido por SillyTavern o por un backend compatible (llama.cpp, KoboldCpp, vLLM, APIs propietarias). El "diseño" del preset es, por tanto, ingeniería de prompts: la evolución documentada va de Voyage v1.0 —derivado de Moonlight y reconvertido en una experiencia PbtA "lite", con notas de GM, notas de seguimiento, sistema de etiquetas para PNJ y localizaciones, reglas de nombrado simplificadas y eliminación del chain-of-thought explícito porque "Gemma lo hace mejor por defecto"— hasta la v5.1.

Los hitos intermedios explican la lógica del diseño. La v2.0 introduce causalidad, ata vincular al GM al rol de assistant para evitar que el modelo hable por el usuario, consolida la generación de PNJ/localización/escenario y sustituye "eventos" por "escenarios". La v3.0 es una reconstrucción completa con reducción de tokens, comprobaciones de habilidad reelaboradas y mejoras de prosa y de diálogo entre PNJ. La v4.0 es experimental y la v5.0/v5.1 añaden dinámica de mundo, adherencia al prompt, reducción de bucles y reescritura a instrucciones positivas. El preset Eval v1.0 es un banco de reglas suelto, pensado como recurso de desarrollo más que para uso normal.

La única configuración de validación documentada es: Unsloth Gemma 4 31B IT QAT en Q4_K_XL, MTP (multi-token prediction) activado y contexto de 32K en BF16. Las versiones v3.0 y anteriores se probaron además con los GGUF QAT de 26B-A4B, 12B, E4B y E2B. No se documentan datasets, RLHF, DPO ni innovaciones de inferencia más allá del uso de decodificación multi-token del modelo base.

## Capacidades

- Rol conversacional multi-turno de larga duración con reglas de continuidad narrativa y reducción de repeticiones.
- Dirección de juego asistida: notas de GM, notas de seguimiento y generación de escenarios con relaciones causa-efecto.
- Comprobaciones de habilidad PbtA (tiradas, condiciones de éxito/fallo parcial) integradas en el flujo del preset.
- Generación estructurada de PNJ, localizaciones y escenarios mediante un sistema de etiquetas tipo Dungeon World / Pathfinder 2e.
- Control de la voz del usuario: el GM queda vinculado al rol de assistant en v2.0 y posteriores para evitar que el modelo escriba por el usuario.
- Estilo de prosa dirigido: instrucciones explícitas contra muletillas ("staccato" excesivo, construcciones "no X sino Y") y contra errores gramaticales.
- Portabilidad entre familias de modelos: el preset universal v5.x declara compatibilidad con Gemma 4, Mistral Small 3.2, Magistral, DeepSeek, GLM y Gemini 4 Argon.
- Preset de evaluación (Eval v1.0) para experimentar con reglas y medir adherencia al prompt de forma cualitativa.
- No incluye tool calling, function calling, agentes, visión, audio ni modo "thinking" propio: esas capacidades dependen exclusivamente del modelo base.

## Casos de uso

- Campañas de rol por texto de varias sesiones: el preset mantiene coherencia de PNJ y localizaciones apoyándose en notas de GM y en el sistema de etiquetas, lo que reduce la deriva narrativa típica en contextos de 32K.
- Partidas de mesa con motor PbtA: las comprobaciones de habilidad y las condiciones de tirada ya están definidas en el texto de sistema, de modo que el modelo resuelve tiradas sin que el usuario tenga que reinyectar reglas en cada turno.
- Preparación de sesiones de dungeon mastering: generación de PNJ y localizaciones etiquetadas que luego se reutilizan como lorebook en SillyTavern.
- Escritura narrativa asistida: las instrucciones anti-muletillas y de prosa resultan útiles para borradores de ficción por capítulos con un modelo local de 12B–31B.
- Evaluación comparativa de modelos de rol: usar Eval v1.0 como conjunto fijo de reglas y ejecutar el mismo guion contra Gemma 4, Mistral Small 3.2 y GLM para comparar adherencia y calidad de prosa de forma reproducible.
- Base para presets propios: el JSON sirve como plantilla para adaptar reglas a un dominio concreto (por ejemplo, rol histórico o simulación de entrevistas) partiendo de una estructura ya depurada.
- Despliegue local con privacidad: al ser un JSON, se puede combinar con un GGUF cuantizado en llama.cpp u Ollama y ejecutar sesiones sin salida de datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta validación cualitativa ("tested extensively", "tested with") sobre Gemma 4 31B IT QAT Q4_K_XL con MTP y 32K de contexto, sin métricas, tamaños de muestra ni comparaciones cifradas entre versiones.

## Requisitos de hardware

- El repositorio en sí no requiere hardware: son archivos JSON de unos pocos kilobytes.
- El coste real depende del modelo base elegido. La configuración de referencia del autor es Gemma 4 31B IT en Q4_K_XL con 32K de contexto; a partir del tamaño y la cuantización se puede estimar un consumo de VRAM en el entorno de los 20 GB solo para pesos, más la caché KV de 32K, aunque el autor no publica cifras (estimación propia no verificada).
- Alternativas ligeras documentadas: Gemma 4 E2B, E4B y 12B en GGUF QAT, aptas para GPU de consumo; los GGUF de Unsloth son el formato recomendado en la model card.
- GPU de referencia para el preset completo: A100/H100 o RTX 4090/A6000 para el caso de 31B con contexto largo; para 12B en Q4 basta una GPU de 12–16 GB (estimación no publicada por el autor).
- Opciones de despliegue: SillyTavern como frontend, con backend llama.cpp, KoboldCpp, Ollama, vLLM o Text Generation Inference. El MTP mencionado por el autor es una función del runtime que sirve el modelo, no del preset.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Modelos objetivo | Contexto probado | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Voyage v5.1 (`nohurry/sillytavern`) | Preset JSON para SillyTavern | Gemma 4, Mistral Small 3.2, Magistral, DeepSeek, GLM, Gemini 4 Argon | 32K | MIT | Público en HuggingFace | No disponible (solo validación cualitativa) |
| Presets por defecto de SillyTavern | Preset JSON incluido con la aplicación | Genéricos, sin optimización por familia | No disponible | Según el proyecto SillyTavern | Incluido con la aplicación | No disponible |
| Presets publicados en r/SillyTavernAI | Presets de comunidad | Muy variable | No disponible | Variable | Foros y enlaces externos | No disponible |
| System prompt propio | Texto libre | Cualquiera | El que fije el usuario | No aplica | Inmediata | No disponible |

No se dispone de comparaciones cuantitativas entre estos presets; la comparativa es estructural (mantenimiento activo, versionado explícito, licencia MIT y matriz de modelos declarada frente a alternativas sin documentación de compatibilidad).

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni código de inferencia. Cualquier expectativa de "descargar y ejecutar" es incorrecta.
- Todo el contenido está en inglés; no hay presets ni documentación en castellano.
- La validación se concentra en Gemma 4 QAT en GGUF; la compatibilidad con DeepSeek, GLM, Mistral Small 3.2 y Gemini 4 Argon se declara pero no se detalla con configuraciones ni resultados.
- Sin métricas: las afirmaciones de "mejor CoT", "menos bucles" o "menos errores gramaticales" son del autor y no van acompañadas de evidencia reproducible.
- Los presets son sensibles al modelo: pequeños cambios de versión del modelo base o de la plantilla de chat pueden degradar la adherencia.
- El contenido está orientado a rol y ficción; los presets no incorporan salvaguardas de seguridad propias y heredan los sesgos y el riesgo de alucinación del modelo subyacente.
- El consumo de tokens del system prompt es significativo y compite con el contexto disponible; la v3.0 y posteriores lo reducen, pero sigue siendo un coste a considerar en ventanas de 8K–16K.
- Riesgo de conflicto con otros system prompts, jailbreaks o lorebooks inyectados: el preset asume que es la instrucción principal.
- Algunas entradas están marcadas como experimentales (v4.0-exp) o como recurso de desarrollo (Eval v1.0); no deberían usarse en producción sin pruebas propias.
- La model card contiene erratas y enlaces truncados (por ejemplo, "lAnnouncement" y la URL de Bartowski cortada), señal de mantenimiento manual.
- La licencia MIT permite uso comercial y modificación con atribución, pero no cubre los modelos base con los que se combine el preset, cuyas licencias deben verificarse por separado.
- Fechas del repositorio (creación 2026-05-27, actualización 2026-10-25) y 0 descargas conviene interpretarlas con cautela: el proyecto se distribuye principalmente vía Reddit y enlaces directos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nohurry/sillytavern
- Voyage v5.1, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1x5h8xt/universal_preset_voyage_v51/
- Voyage v5.1, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Universal-v5.1.json
- Voyage v5.0, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1x2m4oj/universal_preset_voyage_v5
- Voyage v5.0, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Universal-v5.json
- Voyage v4.0-exp, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1wnana0/gemma_4_preset_voyage_v4exp
- Voyage v4.0-exp, presets: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v4-exp1.json · https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v4-exp2.json · https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v4-exp3.json
- Eval v1.0, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1vpv8nk/generic_preset_eval_v1
- Eval v1.0, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Eval-Generic-v1.0.json
- Voyage v3.0, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1uvp500/gemma_4_preset_voyage_v3
- Voyage v3.0, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v3.0.json
- Voyage v2.0, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1upgraz/gemma_4_preset_voyage_v2
- Voyage v2.0, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v2.0.json
- Voyage v1.0, anuncio: https://www.reddit.com/r/SillyTavernAI/comments/1tx1x7b/gemma_4_preset_voyage
- Voyage v1.0, preset: https://huggingface.co/nohurry/sillytavern/blob/main/Presets/Voyage-Gemma4-v1.0.json
- Modelo de referencia Gemma 4 31B IT QAT GGUF (Unsloth): https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Gemma 4 12B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Gemma 4 26B-A4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Gemma 4 E4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e4b-it-qat-GGUF
- Gemma 4 E2B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e2b-it-qat-GGUF
- Gemma 4 31B IT GGUF (Bartowski, enlace truncado en la model card): https://huggingface.co/bartowski/google_gemma-4-31B-it-GGUF
- Aplicación SillyTavern: https://github.com/SillyTavern/SillyTavern
