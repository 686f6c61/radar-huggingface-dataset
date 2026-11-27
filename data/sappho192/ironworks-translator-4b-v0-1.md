# sappho192/ironworks-translator-4b-v0.1

## Resumen

Ironworks Translator 4B v0.1 es un modelo de traducción especializado en la terminología y el registro lingüístico de Final Fantasy XIV (FFXIV), desarrollado por sappho192 como componente del proyecto de código abierto IronworksTranslator. Se construye mediante un ajuste fino con LoRA SFT sobre el modelo base xiaomi-research/MiLMMT-46-4B-v1.0, que a su vez deriva del backbone de texto de Gemma 3. El modelo resuelve un problema muy concreto: la traducción automática genérica no respeta los términos propios del videojuego (nombres de clases, objetos, ubicaciones) ni la jerga coloquial de los jugadores, lo que degrada la experiencia en chats y menús del juego.

La innovación principal es el denominado "runtime glossary following": el modelo acepta un prefijo opcional `Glossary:` con pares `origen => destino` en tiempo de inferencia, de modo que los traductores pueden actualizar la terminología tras cada parche del juego sin reentrenar el modelo. Está entrenado para las seis direcciones JA/EN/DE/FR → KO y KO → JA/EN, con especial énfasis en el coreano como idioma destino.

Se distribuye únicamente en formato GGUF cuantizado (Q4_K_M y Q8_0), con un total de 3.880.263.168 parámetros y un repositorio de 6,6 GB. Es relevante ahora porque demuestra que un modelo de 4B puede igualar o superar a alternativas mayores en una tarea de dominio estrecho cuando se combinan datos específicos, control de glosario en inferencia y una política de decodificación determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone de texto de Gemma 3, sin torre de visión) |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (publicados); otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | ko, ja, en, de, fr (direcciones JA/EN/DE/FR → KO y KO → JA/EN) |
| Licencia | Gemma Terms of Use (`gemma`) |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de MiLMMT-46-4B-v1.0, un modelo multimodal de Xiaomi Research cuyo backbone de texto deriva de Gemma 3. Para este proyecto se exportó únicamente dicho backbone de texto a GGUF, descartando la torre de visión, y se adaptó mediante LoRA SFT aplicado solo a las capas de texto, con rango `r=16` y `alpha=32`. El conjunto de entrenamiento combina pares de terminología y diálogo de FFXIV, chat coloquial, ejemplos de intercambio contrafactual de glosario, ejemplos de rechazo de distractores y una fase de replay multilingüe general "on-policy" sobre el modelo de 4B en las seis direcciones soportadas.

Tras el ajuste, el delta de LoRA se fusiona con un escalado lineal `alpha = 0.70`, una decisión deliberada para preservar la fluidez general del modelo base mientras se gana precisión terminológica. El resultado se cuantiza a GGUF en Q4_K_M y Q8_0. La decodificación recomendada es determinista (temperatura 0,0, top_k 1, repeat_penalty 1,0) con `frequency_penalty=0.30` y `repeat_last_n=16`, además de `add_bos_token=false` y `add_space_prefix=false`. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Traducción multilingüe en seis direcciones: JA/EN/DE/FR → KO y KO → JA/EN.
- Seguimiento de glosario en tiempo de inferencia mediante prefijos `Glossary:` con pares `origen => destino`, sin reentrenamiento.
- Intercambio contrafactual de glosario: el modelo aplica el término indicado en el prompt incluso cuando contradice su conocimiento previo.
- Rechazo de distractores: no inserta términos del glosario que no aparecen en la entrada (0/25 en la evaluación del autor).
- Estabilidad en entradas cortas y conversación coloquial: 0 errores en 30 pruebas de estabilidad multilingüe y de entrada corta.
- Control de deriva de idioma y bucles repetitivos: 0 casos en 15 pruebas.
- Formato conversacional y compatibilidad con endpoints (tag `endpoints_compatible`).
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio en esta distribución.

## Casos de uso

- Traducción de chat en vivo dentro de Final Fantasy XIV: el modelo traduce mensajes de jugadores en JA/EN/DE/FR a coreano y viceversa con jerga y términos del juego, integrándose en el cliente IronworksTranslator con decodificación determinista para minimizar latencia y variabilidad.
- Actualización de terminología tras parches: al añadir nuevos objetos, clases o ubicaciones, basta con inyectar un prefijo `Glossary:` con los pares actualizados; no es necesario reentrenar ni redistribuir el modelo.
- Traducción de menús, tooltips e interfaces del juego: la alta precisión en términos verificados (9/9 en hold-out con glosario) lo hace adecuado para superponer traducciones sobre la UI del cliente.
- Localización comunitaria de contenido derivado (guías, wikis, macros): permite traducir textos con terminología consistente usando un glosario compartido por la comunidad.
- Asistencia a gremios multilingües: conversaciones multi-turno entre jugadores de distintos idiomas con un registro coloquial estable y sin derivas de idioma.
- Evaluación y control de calidad de glosarios: el modo de intercambio contrafactual permite comprobar si un glosario candidato se aplica correctamente antes de desplegarlo en producción.
- Despliegue en hardware modesto: con Q4_K_M (~2,49 GB) puede ejecutarse en GPUs de consumo y en CPU mediante llama.cpp u Ollama, lo que facilita su uso en equipos de jugadores.

## Benchmarks y rendimiento

Datos publicados por el autor sobre GGUF cuantizado, decodificación greedy con `frequency_penalty=0.30` y `repeat_last_n=16`:

| Metrica | Base MiLMMT-46-4B-v1.0 (Q4_K_M) | Ironworks 4B v0.1 (Q4_K_M) | Ironworks 4B v0.1 (Q8_0) |
|---|---|---|---|
| Precisión terminológica FFXIV en hold-out (con glosario, verificación humana) | 2/9 (22,2%) | 9/9 (100,0%) | 9/9 (100,0%) |
| Precisión terminológica (regex estricto del script) | no disponible | 7/9 | 7/9 |
| Deriva de idioma / bucles (n=15) | 1 / 0 | 0 / 0 | 0 / 0 |
| Tasa de inserción falsa de distractores (n=25) | 0/25 (0,0%) | 0/25 (0,0%) | 0/25 (0,0%) |
| Intercambio contrafactual de glosario (8 pares / 16 prompts) | 0/8 (5/16) | 8/8 (16/16) | 8/8 (16/16) |
| Estabilidad multilingüe y de entrada corta (n=30) | 0 errores | 0 errores | 0 errores |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5 GB para Q4_K_M y ~4,1 GB para Q8_0, más overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, RTX 3050, RTX 4060, GTX 1660); 6 GB o más para Q8_0.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4-6 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con APIs de tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ironworks Translator 4B v0.1 | ~3,9B | no disponible | Traducción de dominio FFXIV con glosario en inferencia | Gemma | GGUF Q4_K_M y Q8_0 en Hugging Face |
| MiLMMT-46-4B-v1.0 (base) | ~4B | no disponible | Traducción multilingüe multimodal | no disponible | Hugging Face |
| Gemma 3 (backbone original) | no disponible | no disponible | Modelo general multimodal | Gemma | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción especializada en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en FFXIV; su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Solo cubre seis direcciones de traducción (JA/EN/DE/FR → KO y KO → JA/EN); no soporta, por ejemplo, EN → JA ni DE → FR.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y una política de usos prohibidos que deben respetarse en producción.
- Riesgo de alucinación y de inserción de términos no presentes en la entrada, aunque el autor reporta 0/25 en la prueba de distractores.
- La decodificación recomendada es determinista; desviarse de los parámetros sugeridos puede aumentar bucles o derivas de idioma.
- El script de evaluación estricto reporta 7/9 en lugar de 9/9 por el tratamiento de partículas coreanas; conviene validar la salida con normalización propia.
- No incluye torre de visión: no puede procesar imágenes aunque el modelo base sea multimodal.
- No se documentan sesgos específicos ni longitud de contexto; ambos datos son no disponibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sappho192/ironworks-translator-4b-v0.1
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0
- Repositorio del proyecto IronworksTranslator: https://github.com/sappho192/IronworksTranslator
