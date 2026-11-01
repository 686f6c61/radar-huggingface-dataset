# Shahadat56900/sillytavern

## Resumen

`Shahadat56900/sillytavern` no es un modelo de lenguaje, sino un repositorio de presets, lorebooks y personajes para SillyTavern, la interfaz de código abierto para roleplay e interacción con LLM. El contenido principal son ficheros JSON de configuración de prompts (presets) que instruyen al modelo subyacente sobre cómo estructurar narrativa, gestionar checks de habilidad y mantener coherencia de personajes. El repositorio está vacío en cuanto a pesos (0,0 GB) y no contiene ningún modelo entrenado.

La serie más desarrollada es "Voyage", una familia de presets iterativos (v1.0 a v6.0.1) que implementa un sistema de rol ligero inspirado en Powered by the Apocalypse (PbtA), con gestión de escenas, simulación de NPCs y mecánicas de causa-efecto. El autor declara compatibilidad con modelos de 2024 en adelante, con pruebas extensivas sobre Gemma 4 (variantes 12B, 26B-A4B, 31B) cuantizado en Q4_K_XL mediante Unsloth.

Es relevante para desarrolladores que construyen aplicaciones de rol conversacional, ya que documenta patrones de prompting de sistema (gestión de contexto largo, reducción de bucles, control de la "voz" del asistente frente al usuario) que pueden reutilizarse en otros dominios. Sin embargo, no aporta ningún artefacto de modelo: su valor es exclusivamente como material de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; son presets JSON de prompts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los presets se prueban con 32K de contexto en el modelo subyacente) |
| Tipos de cuantizacion | no disponible (no aplica; el autor referencia Q4_K_XL de Gemma 4 en sus pruebas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (ficheros `.json` de presets, no pesos) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene ningún transformer, MoE ni SSM entrenado. El contenido son ficheros JSON que definen system prompts, instrucciones de formato y reglas de generación para SillyTavern. La "arquitectura" efectiva es la del modelo que el usuario conecte (Gemma 4, Mistral Small 3.2, Magistral Small, DeepSeek v3.2/v4, GLM 4.5–5.3, entre otros según la model card).

No hay datos de entrenamiento, tokens procesados, RLHF ni DPO. Las iteraciones documentadas (v1.0 a v6.0.1) son refinamientos manuales de prompts: en v2.0 se introduce causa-efecto y se vincula el GM al rol assistant; en v3.0 se reescribe el sistema de skill checks; en v5.0–5.1 se reescriben los prompts en positivo y se reduce el uso de tokens; en v6.0.1 se añaden sistemas de noticias, scene tracker y simulación online-offline. Las pruebas declaradas usan Gemma 4 31B IT QAT Q4_K_XL con MTP habilitado y contexto BF16 de 32K.

## Capacidades

- Configuración de system prompts para roleplay multi-turno en SillyTavern.
- Implementación de mecánicas PbtA ligeras: checks de habilidad, tiradas y resolución con causa-efecto.
- Gestión de escenas y seguimiento de estado narrativo (scene tracker en v6).
- Simulación de NPCs con diálogos entre ellos y backstories generadas.
- Sistema de noticias y simulación online-offline (v6.0.1).
- Instrucciones para reducir "slop" narrativo: staccato excesivo, construcciones "not x but y", bucles.
- Preset de evaluación (`Eval-Generic-v1.0`) como banco de pruebas de reglas.
- No incluye tool calling, function calling, visión, audio ni modo thinking propios: esas capacidades dependen del modelo subyacente.

## Casos de uso

- **Roleplay conversacional en producción con SillyTavern**: cargar `Voyage-Universal-v6.0.1.json` como preset de sistema y conectar un modelo local (p. ej. Gemma 4 31B Q4_K_XL) para sesiones narrativas de hasta 32K tokens de contexto, con gestión automática de escenas y NPCs.
- **Prototipado de motores de juego de rol**: el preset v1.0–v3.0 documenta cómo implementar checks PbtA (tiradas, modificadores, resolución) mediante instrucciones de prompt, reutilizable como base para un motor de reglas ligero sin código.
- **Investigación sobre prompting de sistema**: la serie Voyage sirve como corpus de comparación entre versiones (v2 → v3 → v5.1) para medir el efecto de reescribir instrucciones en positivo o de consolidar generación de NPC/escena sobre la calidad de la prosa.
- **Evaluación de modelos para rol**: usar `Eval-Generic-v1.0` para someter a distintos modelos (Mistral Small 3.2, GLM 4.6, DeepSeek v4) al mismo conjunto de reglas y comparar adherencia al prompt.
- **Generación de personajes y lorebooks**: a partir de las instrucciones de backstory y consolidación de NPC del preset, generar fichas de personaje coherentes con el escenario antes de iniciar la partida.
- **Reducción de deriva narrativa en asistentes creativos**: aplicar las reglas anti-slop (evitar staccato, evitar "not x but y", limitar bucles) en asistentes de escritura fuera del rol, como generación de ficción episódica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica pruebas cualitativas ("tested extensively") sobre Gemma 4 31B IT QAT Q4_K_XL con MTP y 32K de contexto, sin métricas numéricas.

## Requisitos de hardware

- El repositorio en sí no requiere hardware: son ficheros JSON de pocos kilobytes.
- Los requisitos dependen del modelo subyacente. Para el caso de referencia (Gemma 4 31B IT QAT Q4_K_XL) se necesita aproximadamente 18–20 GB de VRAM para los pesos cuantizados, más overhead de contexto KV para 32K tokens.
- GPU recomendadas para ese escenario: RTX 4090 (24 GB) al límite, A100 40/80 GB, H100 para mayor throughput y contexto completo.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) solo con cuantización Q4 y contexto moderado; para 32K completos conviene A100 o reducir contexto.
- Despliegue: llama.cpp u Ollama para GGUF Q4_K_XL; vLLM o TGI si se sirve el modelo en BF16/FP8 en GPU de datacenter. SillyTavern se conecta vía API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay modelos comparables en sentido estricto, porque este repositorio no es un modelo. Se compara con otros repositorios de presets para SillyTavern:

| Repositorio | Tipo | Contenido | Licencia | Modelo de referencia |
|---|---|---|---|---|
| Shahadat56900/sillytavern | Presets | Voyage v1–v6, Eval v1 | MIT | Gemma 4 31B QAT Q4_K_XL |
| nohurry/sillytavern (referenciado en la card) | Presets | Voyage (origen de los enlaces) | no disponible | Gemma 4 31B QAT Q4_K_XL |
| Presets genéricos de la comunidad SillyTavern | Presets | Variables, sin versionado | diversas | múltiples |

En cuanto a modelos subyacentes compatibles declarados: Gemma 4 (E2B, E4B, 12B, 26B-A4B, 31B), Mistral Small 3.2, Magistral Small, DeepSeek v3.2/v4/v4.1, GLM 4.5–5.3, Gemini 4 Argon. No se dispone de comparativa de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede ejecutarse por sí solo ni genera texto sin un LLM subyacente.
- Solo documentado en inglés; los presets están redactados en `en` y no hay soporte declarado para otros idiomas.
- La compatibilidad con modelos es declarativa y cualitativa; no hay tests automatizados ni métricas que respalden "works with any model past 2024".
- Los enlaces de la model card apuntan a rutas de otro repositorio (`nohurry/sillytavern`), lo que sugiere que este repositorio es una copia o espejo; pueden faltar ficheros o estar desactualizados.
- Riesgo de alucinación y deriva narrativa: inherente al modelo subyacente, no mitigado por el preset más allá de instrucciones anti-bucle.
- El preset v6 elimina el "PbtA rolling" presente en versiones anteriores; quien dependa de esa mecánica debe fijar v5.1 o v3.0.
- Licencia MIT permite uso comercial del contenido de configuración, pero no otorga derechos sobre los modelos subyacentes (Gemma, Mistral, DeepSeek, GLM tienen sus propias licencias).
- Sin mantenimiento garantizado: 0 descargas y 0 likes en el momento de la consulta; el autor no publica issues ni roadmap.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shahadat56900/sillytavern
- Repositorio de origen referenciado: https://huggingface.co/nohurry/sillytavern
- Anuncio Voyage v6: https://www.reddit.com/r/SillyTavernAI/comments/1xgcxcc/universal_preset_voyage_v6
- Anuncio Voyage v5.1: https://www.reddit.com/r/SillyTavernAI/comments/1x5h8xt/universal_preset_voyage_v51
- Anuncio Voyage v5.0: https://www.reddit.com/r/SillyTavernAI/comments/1x2m4oj/universal_preset_voyage_v5
- Anuncio Voyage v4.0-exp: https://www.reddit.com/r/SillyTavernAI/comments/1wnana0/gemma_4_preset_voyage_v4exp
- Anuncio Eval v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1vpv8nk/generic_preset_eval_v1
- Anuncio Voyage v3.0: https://www.reddit.com/r/SillyTavernAI/comments/1uvp500/gemma_4_preset_voyage_v3
- Anuncio Voyage v2.0: https://www.reddit.com/r/SillyTavernAI/comments/1upgraz/gemma_4_preset_voyage_v2
- Anuncio Voyage v1.0: https://www.reddit.com/r/SillyTavernAI/comments/1tx1x7b/gemma_4_preset_voyage
- Modelo de referencia Gemma 4 31B IT QAT GGUF (Unsloth): https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Gemma 4 26B-A4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Gemma 4 12B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Gemma 4 E4B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e4b-it-qat-GGUF
- Gemma 4 E2B IT QAT GGUF: https://huggingface.co/unsloth/gemma-4-e2b-it-qat-GGUF
