# llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2

## Resumen

Magistral-Small-2509-ultra-uncensored-heretic-v2 es una variante "decensurada" del modelo de razonamiento Magistral Small 1.2 de Mistral AI (mistralai/Magistral-Small-2509), publicada por el contribuidor independiente llmfan46. Se ha generado aplicando la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), una técnica de abliteración que elimina direcciones del espacio de activaciones asociadas a comportamientos de rechazo, sin reentrenar los pesos. El resultado es un modelo de 24.011.361.280 parámetros (24B) que conserva la arquitectura del original pero reduce drásticamente las negativas a responder.

El modelo base, Magistral Small 1.2, es un transformer denso de 24B construido sobre Mistral Small 3.2 (2506), con capacidades de razonamiento adquiridas mediante SFT sobre trazas de Magistral Medium y RL posterior. Incorpora un codificador de visión, tokens especiales de razonamiento `[THINK]`/`[/THINK]` y soporte multilingüe para más de veinte idiomas. Su ventana de contexto y arquitectura detallada no se especifican en la información disponible de esta ficha.

La relevancia de esta variante radica en su perfil de licencia Apache 2.0 y en la métrica declarada por el autor: 3 rechazos de cada 100 frente a 92 de cada 100 del modelo original, con una divergencia KL de 0,0493 respecto al base, lo que según el autor indica una preservación razonable de capacidades. Está pensada para despliegues locales en una única RTX 4090 o en un MacBook con 32 GB de RAM una vez cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión), derivado de Mistral Small 3.2 con capacidades de razonamiento |
| Parametros totales | 24.011.361.280 (24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; cuantizaciones adicionales no detalladas |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 48,1 GB); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Magistral Small 1.2, que a su vez parte de Mistral Small 3.2 (2506). Se trata de un transformer denso de 24B parámetros al que se añadió un codificador de visión en la versión 1.2, permitiendo entradas multimodales. Las capacidades de razonamiento se obtuvieron mediante supervised fine-tuning sobre trazas de Magistral Medium, seguidas de reinforcement learning. El modelo base incorpora tokens especiales `[THINK]` y `[/THINK]` que delimitan el bloque de razonamiento, lo que facilita el parseo de la traza y evita confusión cuando la cadena "[THINK]" aparece literalmente en el prompt. El modo de razonamiento se activa mediante un system prompt específico (recogido en `SYSTEM_PROMPT.txt` del repositorio); con cualquier otro system prompt el modelo responde de forma directa.

Sobre esta base, el autor aplicó Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), una técnica de abliteración que identifica y elimina direcciones de activación responsables de los rechazos. Los parámetros declarados son: `start_layer_index` 9, `end_layer_index` 37, `preserve_good_behavior_weight` 0,9362, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9861 y `neighbor_count` 9. No se ha reentrenado el modelo; la modificación es puramente de pesos/activaciones. El autor no detalla el volumen de tokens de entrenamiento del modelo base ni la composición del dataset, por lo que esos datos no están disponibles en esta ficha.

## Capacidades

- Generación de texto y razonamiento con cadenas de pensamiento largas, encapsuladas en tokens `[THINK]`/`[/THINK]`.
- Modo dual: razonamiento explícito o respuesta directa, conmutables mediante system prompt.
- Capacidades de visión: análisis de imágenes y razonamiento sobre contenido visual combinado con texto.
- Soporte multilingüe en 23 idiomas, incluidos español, inglés, francés, alemán, árabe, chino, hindi, japonés y coreano.
- Generación de código y matemáticas (heredadas del modelo base; sin cifras de benchmark disponibles en esta ficha).
- Formato mejorado de LaTeX y Markdown, y respuestas más breves en prompts generales sencillos según la model card.
- Generación finita: el modelo base reduce la probabilidad de bucles infinitos de generación.
- Comportamiento "decensurado": 3 rechazos de cada 100 frente a 92 de cada 100 del original, según la métrica del autor.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Razonamiento matemático y resolución de problemas paso a paso: el modo thinking con tokens `[THINK]` permite obtener trazas auditables, útiles en entornos educativos o de verificación de cálculos donde se necesita inspeccionar el proceso, no solo el resultado.
- Análisis de documentos con imágenes: gracias al codificador de visión, puede procesar capturas, diagramas o páginas escaneadas y razonar sobre ellas junto al texto, por ejemplo en extracción de datos de facturas o informes técnicos.
- Generación de código en pipelines locales: al caber en una RTX 4090 cuantizado, es viable como asistente de código en estación de trabajo sin depender de API externa, con la ventaja de privacidad del despliegue on-premise.
- Investigación sobre alineación y seguridad: la variante abliterada sirve como objeto de estudio para comparar comportamientos de rechazo frente al modelo original, con una divergencia KL medida de 0,0493 que permite aislar el efecto de la abliteración.
- Atención al cliente multilingüe: los 23 idiomas soportados permiten atender consultas en español, árabe, hindi o vietnamita con un único modelo, reduciendo la infraestructura necesaria.
- Procesamiento de contenido editorial sin filtros: para tareas de redacción, traducción o análisis de textos sensibles (ficción, literatura, análisis de discurso) donde los rechazos del modelo original interrumpen el flujo de trabajo.
- Despliegue en hardware de consumo: con cuantización GGUF cabe en un MacBook de 32 GB de RAM o una RTX 4090, lo que lo hace apto para prototipado y demos locales sin GPU de datacenter.

## Benchmarks y rendimiento

La información disponible solo incluye las métricas de abliteración declaradas por el autor, no benchmarks estándar (MMLU, HumanEval, GSM8K) de esta variante concreta.

| Metrica | Este modelo | Magistral-Small-2509 original |
|---|---|---|
| Divergencia KL | 0,0493 | 0 (por definición) |
| Rechazos | 3/100 | 92/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card remite a los resultados del modelo base Magistral Small 1.2, pero no los reproduce en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo en safetensors ocupa 48,1 GB, lo que requiere aproximadamente 48 GB en precisión original (BF16). Con cuantización GGUF de 4 bits se estima alrededor de 13-15 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: el autor indica que cabe en una única RTX 4090 (24 GB) una vez cuantizado; para pesos sin cuantizar se necesitan GPU de 48 GB o más, como A100 80 GB o H100.
- Consumer GPU: sí, en RTX 4090 con cuantización; también en MacBook con 32 GB de RAM unificada según la model card.
- Opciones de despliegue: la librería declarada es vLLM; también hay cuantizaciones GGUF publicadas en repositorio separado, lo que habilita llama.cpp y Ollama. TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Magistral-Small-2509-ultra-uncensored-heretic-v2 | 24B | No disponible | Sí | Apache 2.0 | Variante abliterada, 3/100 rechazos |
| mistralai/Magistral-Small-2509 | 24B | No disponible | Sí | Apache 2.0 | Modelo base, 92/100 rechazos |
| mistralai/Magistral-Small-2507 (1.1) | 24B | No disponible | No | Apache 2.0 | Versión anterior sin visión |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | 24B | No disponible | Sí | Apache 2.0 | Base sin razonamiento RL |

La comparación con modelos de otros autores (por ejemplo, Qwen o Llama de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo, pero no garantiza la eliminación de sesgos subyacentes; puede aumentar la probabilidad de generar contenido ofensivo, ilegal o dañino sin advertencia.
- La divergencia KL de 0,0493 indica que el modelo se desvía del original; aunque el autor la presenta como baja, puede degradar coherencia o razonamiento en tareas exigentes. No hay benchmarks estándar que lo confirmen.
- Riesgo de alucinación inherente a los modelos de razonamiento de 24B; el modo thinking no elimina este riesgo y puede dar una falsa sensación de fiabilidad.
- La longitud de contexto no está documentada en esta ficha; conviene verificarla en la model card del modelo base antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros de rechazo puede incumplir políticas de plataforma o normativa sectorial; se recomienda evaluar el cumplimiento antes de producción.
- El repositorio depende de almacenamiento gratuito de Hugging Face y el autor advierte de que puede dejar de subir modelos; riesgo de disponibilidad a largo plazo.
- La model card del autor incluye enlaces de donación y avisos promocionales; no son instrucciones técnicas ni deben tomarse como tales.
- Tool calling y soporte de agentes no están confirmados explícitamente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2
- Versión GGUF: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/mistralai/Magistral-Small-2509
- Paper de Magistral: https://huggingface.co/papers/2506.10910 (arXiv:2506.10910)
- Blog de Mistral sobre Magistral: https://mistral.ai/news/magistral/
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request de ARA en Heretic: https://github.com/p-e-w/heretic/pull/211
- Política de privacidad de Mistral: https://mistral.ai/terms/
