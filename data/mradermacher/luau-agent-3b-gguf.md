# mradermacher/luau-agent-3b-GGUF

## Resumen

luau-agent-3b-GGUF es la versión cuantizada en formato GGUF del modelo Vaingloryy/luau-agent-3b, un modelo de lenguaje especializado en generación de código Luau (el dialecto de Lua utilizado en la plataforma Roblox) y en tareas de agente dentro de ese ecosistema. La cuantización la ha realizado mradermacher, un colaborador habitual de Hugging Face que publica versiones GGUF de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base fue desarrollado por Vaingloryy y está publicado bajo licencia Apache 2.0.

El modelo cuenta con 4.169.800.704 parámetros totales según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de modelos de aproximadamente 4B parámetros, pese a la denominación "3b" en su nombre. Está entrenado exclusivamente en inglés y su pipeline no está especificado en la información disponible. Su relevancia actual radica en la escasez de modelos especializados en Luau y en el desarrollo de experiencias dentro de Roblox, un nicho con millones de desarrolladores pero con pocas herramientas de IA específicas.

La ficha describe tanto el modelo base como la versión GGUF cuantizada, incluyendo las opciones de cuantización disponibles (desde Q2_K hasta f16), los requisitos de hardware estimados y las capacidades esperadas dado su entrenamiento en datasets de código Luau, matemáticas e instrucciones generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parametros totales | 4.169.800.704 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura específica del modelo base no está detallada en la información disponible más allá de tratarse de un transformer con 4.169.800.704 parámetros totales. El modelo fue entrenado sobre una composición de datasets orientados a tres áreas principales: código Luau y desarrollo en Roblox (Pinkstack/RobloxAgent-v2, khtsly/LuauCoder-1.0-Preview-SFT, khtsly/roblox-luau-corpus, TorpedoSoftware/the-luau-stack, Pinkstack/2026-Roblox-Luaudev2-dataset-sft, Pinkstack/LuauDev-instructions-SFT-full, Pinkstack/oct2026-Roblox-Luaudev2-dataset-pretrain), matemáticas básicas (BackpropBuff/Principia_SimpleMath_Integers_1m) e instrucciones generales y de ingeniería de software (nvidia/Nemotron-SFT-Instruction-Following-Chat-v2, nvidia/Nemotron-SFT-SWE-v3.5).

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización realizada por mradermacher es estática (static quants), sin versiones con imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de código Luau: el modelo está especializado en el dialecto de Lua usado en Roblox, incluyendo sintaxis, APIs del motor Roblox y patrones de scripting habituales en la plataforma.
- Desarrollo de agentes en Roblox: entrenado con datasets de tipo "agent" y "RobloxAgent", orientado a la creación de NPCs y comportamientos automatizados dentro de experiencias de Roblox.
- Razonamiento matemático básico: incluye un dataset de matemáticas con enteros (Principia_SimpleMath_Integers_1m), lo que sugiere capacidades para operaciones aritméticas simples.
- Seguimiento de instrucciones: entrenado con datasets de instruction-following de NVIDIA, lo que aporta capacidad de responder a instrucciones conversacionales.
- Ingeniería de software: el dataset Nemotron-SFT-SWE-v3.5 aporta ejemplos de tareas de desarrollo de software.
- Capacidad conversacional: el tag "conversational" indica que el modelo está preparado para diálogos multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de scripting para desarrolladores de Roblox: el modelo puede generar y completar scripts Luau dentro del entorno Roblox Studio, ayudando a desarrolladores a escribir lógica de juego, sistemas de inventario, mecánicas de combate o interfaces, gracias a su entrenamiento específico en el corpus Luau y Roblox.
- Generación de comportamiento de NPCs: puede producir código de agentes para NPCs en experiencias de Roblox (patrullaje, diálogos, reacciones a eventos), aprovechando los datasets RobloxAgent-v2 y LuauDev-instructions.
- Automatización de tareas de desarrollo en pipelines: integrable en flujos de CI/CD para Roblox mediante herramientas que consuman GGUF (llama.cpp, Ollama), generando tests o revisando código Luau de forma automatizada.
- Educación y aprendizaje de Luau: útil como tutor de código para nuevos desarrolladores de Roblox, explicando APIs y generando ejemplos didácticos en inglés.
- Prototipado rápido de mecánicas de juego: dado su tamaño reducido (cuantizaciones desde 1,9 GB), puede ejecutarse en hardware modesto para iterar rápidamente sobre ideas de scripts antes de refinarlas manualmente.
- Procesamiento de instrucciones técnicas en inglés: gracias a los datasets Nemotron de instruction-following y SWE, puede emplearse para responder consultas técnicas de desarrollo de software en inglés, aunque fuera del dominio Luau su rendimiento será inferior al de modelos generalistas del mismo tamaño.
- Despliegue en local para estudios indie: equipos pequeños de desarrollo de Roblox pueden ejecutar el modelo en local (Q4_K_M, 2,7 GB) sin depender de APIs externas, manteniendo el código de sus juegos en su propia infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~1,9 GB; Q3_K_S ~2,1 GB; Q3_K_M ~2,3 GB; Q3_K_L ~2,4 GB; IQ4_XS ~2,5 GB; Q4_K_S ~2,6 GB; Q4_K_M ~2,7 GB; Q5_K_S ~3,0 GB; Q5_K_M ~3,1 GB; Q6_K ~3,5 GB; Q8_0 ~4,5 GB; f16 ~8,4 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4; para Q8_0 se recomiendan 6 GB o más; para f16, 10 GB o más. GPUs como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A100 o H100 pueden ejecutar todas las variantes sin problemas.
- ¿Cabe en consumer GPU? Sí, ampliamente. Las cuantizaciones Q4 caben en GPUs de gama de entrada (GTX 1650 4 GB, RTX 3050 8 GB) e incluso en iGPUs con memoria compartida suficiente. La versión f16 requiere una GPU de gama media-alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede desplegarse con transformers, vLLM o TGI, aunque la versión cuantizada está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (~4B parámetros), se espera un throughput alto en GPUs modernas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| luau-agent-3b (este) | 4.169.800.704 | No disponible | Luau / Roblox / agente | Apache 2.0 | GGUF, safetensors |
| Modelos generalistas ~3-4B (p. ej. Qwen2.5-3B, Llama-3.2-3B) | ~3-4B | 32K-128K (según modelo) | Generalista, código, multilingüe | Varía (Apache 2.0, Llama license) | GGUF, safetensors |
| Modelos de código especializados ~3B (p. ej. StarCoder2-3B) | ~3B | 16K | Código general | BigCode OpenRAIL-M | safetensors, GGUF |

La comparación directa con alternativas es limitada porque no se han publicado benchmarks del modelo. Frente a modelos generalistas del mismo tamaño, luau-agent-3b ofrece una especialización clara en Luau y Roblox que los generalistas no tienen, pero probablemente pierde en capacidades multilingües, contexto largo y razonamiento general. Frente a StarCoder2-3B, la diferencia clave es el dominio: StarCoder2 cubre código general mientras que luau-agent-3b se centra en el ecosistema Roblox. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al entrenarse exclusivamente en inglés, el modelo no está preparado para responder en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar APIs de Roblox inexistentes o sintaxis Luau incorrecta; se recomienda validar el código generado antes de usarlo en producción.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide planificar su uso en tareas que requieran ventanas largas (por ejemplo, análisis de proyectos completos de Roblox).
- Limitaciones de idioma: solo inglés; no se garantiza un rendimiento aceptable en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero conviene revisar las licencias de los datasets de entrenamiento (algunos de terceros) por posibles restricciones adicionales.
- Caveat para producción: el modelo base tiene 4.169.800.704 parámetros pese al nombre "3b", lo que puede afectar a las estimaciones de memoria si se asume un tamaño de 3B. Las cuantizaciones estáticas (sin imatrix) pueden degradar más la calidad que las versiones con imatrix en tamaños pequeños (Q2_K, Q3).
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria todavía.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, por lo que su adopción en producción debería ir precedida de una evaluación propia.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/luau-agent-3b-GGUF
- Modelo base: https://huggingface.co/Vaingloryy/luau-agent-3b
- Página de descargas del cuantizador: https://hf.tst.eu/model#luau-agent-3b-GGUF
- Guía de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
