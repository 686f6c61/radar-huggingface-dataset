# RicardoEstep/RPBizkit-Qwen3.6-v1-35B-A3B

## Resumen

RPBizkit-Qwen3.6-v1-35B-A3B es un modelo experimental multimodal publicado por el usuario RicardoEstep en Hugging Face. Se trata de un merge (fusión) de cuatro modelos derivados de la familia Qwen 3.6 con arquitectura MoE (Mixture of Experts) de 35B parámetros totales y aproximadamente 3B parámetros activos por token. El resultado se distribuye como un modelo de tipo image-text-to-text, es decir, con capacidad declarada para procesar entradas de imagen y texto, aunque la model card no detalla el codificador visual ni el pipeline multimodal concreto.

El modelo se construye mediante la técnica Karcher Mean implementada en Mergekit, aplicada sobre cuatro checkpoints de la comunidad: JoyFox-Qwen3.6-35B-A3B-RP-Aggressive, Melody1437-35B-A3B, Ornith-1.5-35B-A3B-Abliterated y WorldSim-Opus-3.6-35B-A3B. La base declarada es un modelo "abliterated" (con los mecanismos de rechazo atenuados) orientado a rol y contenido sin censura, y el autor lo etiqueta explícitamente como `not-for-all-audiences`. Su relevancia es limitada y de nicho: no es un modelo alineado para producción, sino una mezcla experimental de interés para quienes investigan técnicas de merging en arquitecturas MoE multimodales.

La información disponible es escasa: el repositorio aparece con 0 descargas, 0 likes, tamaño de 0.0 GB en el momento de la consulta, licencia no especificada e idiomas no declarados. La model card menciona un contexto nativo de 262K tokens, 40 capas y un dataset de entrenamiento de las bases que llegaría hasta "principios de abril de 2026", pero no aporta métricas de evaluación ni detalles sobre el proceso de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_5_moe`), 40 capas, multimodal image-text-to-text |
| Parametros totales | 35B (aproximado, segun nombre del modelo) |
| Parametros activos | ~3B por token (256 expertos declarados) |
| Longitud de contexto | 262K tokens (declarado como soporte nativo, no verificado) |
| Tipos de cuantizacion | El autor menciona Q5_K_M como ejemplo viable en 32 GB de RAM; no se listan cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers); se menciona un archivo de arquitectura `mergekit_qwen3_5_moe.json` |
| Metodo de creacion | Merge Karcher Mean con Mergekit (`karcher_steps: 72`, `tolerance: 1e-7`, `normalize: true`, dtype bfloat16) |
| Tokenizer | `ornith-ai/Ornith-1.5-35B-A3B` (segun configuracion del merge) |
| Thinking mode | Etiquetas de razonamiento implementadas; desactivable con `enable_thinking: false` en el chat template |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión de pesos de cuatro checkpoints con arquitectura Qwen 3.6 MoE. La arquitectura subyacente es un transformer con mezcla de expertos de 256 expertos, 40 capas y aproximadamente 35B parámetros totales, de los que unos 3B se activan por token. Esta dispersión reduce el coste computacional de inferencia y permite mantener el modelo completo en RAM mientras se reserva VRAM para contexto largo. El merge se realizó con el método Karcher Mean de Mergekit, con normalización activada, 72 pasos de iteración y tolerancia de 1e-7, en precisión bfloat16. El autor indica que tuvo que generar manualmente un archivo de arquitectura completo para Mergekit y prestar especial atención a los paddings vacíos del tokenizer.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las bases. La model card solo señala que la base es un "Ornith 1.5 Abliterated" de 40 capas, a su vez derivado de una mezcla entrenada de Qwen 3.6, Gemma 4 y otros modelos, y que los datos de entrenamiento llegarían hasta principios de abril de 2026. El modelo incorpora etiquetas de pensamiento/razonamiento en la plantilla de chat, desactivables mediante el kwarg `enable_thinking: false`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de rol, orientada a contenido sin censura según la model card.
- Procesamiento multimodal image-text-to-text: el autor afirma que analiza archivos externos de forma nativa, aunque no se detalla el codificador visual.
- Modo de razonamiento ("thinking") con etiquetas implementadas en el chat template.
- Soporte declarado de contexto largo de hasta 262K tokens.
- Inferencia eficiente por activación de ~3B parámetros por token.
- Capacidad multilingüe: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).

## Casos de uso

- Investigación en técnicas de merging: el modelo sirve como caso de estudio de fusión Karcher Mean sobre arquitecturas MoE multimodales, permitiendo comparar la estabilidad del merge con distintas configuraciones de pasos y tolerancia.
- Experimentación con modelos "abliterated": útil para estudiar el efecto de la atenuación de rechazos en la coherencia y seguridad de las respuestas, siempre en entornos controlados y no orientados a producción.
- Generación creativa de ficción y rol: el origen RP (role-play) de las bases y el contexto de 262K tokens permiten mantener narrativas largas con continuidad, aunque sin garantías de calidad ni alineamiento.
- Pruebas de inferencia MoE de bajo coste: con ~3B parámetros activos, es adecuado para validar pipelines de despliegue MoE en hardware modesto antes de escalar a modelos mayores.
- Evaluación de plantillas de chat y thinking mode: permite probar la activación y desactivación de etiquetas de razonamiento vía `enable_thinking: false` en distintos frameworks.
- Análisis multimodal exploratorio: para prototipar flujos image-text-to-text en los que se acepte un modelo no validado y sin garantías de licencia.
- Docencia y divulgación: como ejemplo práctico de merge de modelos y de las precauciones necesarias con tokenizers y paddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Con ~3B parámetros activos, la VRAM necesaria para pesos en cuantización Q5_K_M se sitúa en el entorno de 20-25 GB, aunque el autor solo confirma que "cabe fácilmente en 32 GB de RAM" para la cuantización Q5_K_M.
- El modelo completo debe permanecer cargado en RAM; el autor sugiere 32 GB como referencia para Q5_K_M.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs de 24 GB (RTX 4090) con cuantización agresiva y en A100/H100 para precisión completa, pero no hay datos confirmados.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización Q4/Q5, sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada. El autor menciona `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor afirma que la inferencia "vuela" por la activación de ~3B parámetros, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| RPBizkit-Qwen3.6-v1-35B-A3B | ~35B | ~3B | 262K (declarado) | no disponible | Experimental, 0 descargas |
| joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive | ~35B | ~3B | no disponible | no disponible | Base del merge |
| ReadyArt/Melody1437-35B-A3B | ~35B | ~3B | no disponible | no disponible | Base del merge |
| alztrk/Ornith-1.5-35B-A3B-Abliterated | ~35B | ~3B | no disponible | no disponible | Base del merge |
| Gryphe/WorldSim-Opus-3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | Base del merge |

No se dispone de datos de rendimiento comparativo entre estos modelos ni con alternativas de otros autores. La comparativa se limita a parámetros y procedencia.

## Limitaciones y advertencias

- Modelo etiquetado como `not-for-all-audiences`: puede generar contenido sensible, ofensivo o no apto para todos los públicos.
- Origen "abliterated" y orientado a rol sin censura: los mecanismos de rechazo están atenuados, lo que incrementa el riesgo en aplicaciones abiertas al público.
- Riesgo elevado de alucinación: no hay evidencia de alineamiento, RLHF o evaluación de fidelidad; el merge no garantiza coherencia factual.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; se debe contactar con el autor o asumir riesgo legal.
- Idiomas no declarados: el soporte multilingüe es incierto y no está verificado.
- Contexto de 262K declarado pero no verificado; el rendimiento en ventanas largas puede degradarse.
- Repositorio con 0 descargas y 0 likes, tamaño reportado de 0.0 GB: posiblemente incompleto o en fase de subida en el momento de la consulta.
- El autor declara no responsabilizarse del uso del modelo; no hay garantías de soporte ni mantenimiento.
- No hay datos de benchmarks, latencia ni throughput que permitan validar las afirmaciones de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RicardoEstep/RPBizkit-Qwen3.6-v1-35B-A3B
- Archivo de arquitectura del merge: https://huggingface.co/RicardoEstep/RPBizkit-Qwen3.6-v1-35B-A3B/resolve/main/mergekit_qwen3_5_moe.json
- Base JoyFox: https://huggingface.co/joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive
- Base Melody1437: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Base Ornith Abliterated: https://huggingface.co/alztrk/Ornith-1.5-35B-A3B-Abliterated
- Base WorldSim-Opus: https://huggingface.co/Gryphe/WorldSim-Opus-3.6-35B-A3B
- Referencia citada por el autor (Cyclone-Labs): https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic
- Paper Karcher Mean citado: https://arxiv.org/abs/2603.04972
- Mergekit: https://github.com/cg123/mergekit
