# DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP es un fine-tune de múltiples etapas y fusiones construido sobre Qwen/Qwen3.6-27B por DavidAU en colaboración con Nightmedia, TeichAI, armand0e y trohrbaugh. Con 27.781.427.952 parámetros (~27,8 B) y pesos en bfloat16, el objetivo declarado del autor es elevar la inteligencia general, el seguimiento de instrucciones y el razonamiento del modelo base sin alterar sus capacidades originales, evitando explícitamente el "benchmaxing". El modelo se distribuye con licencia Apache 2.0 y pipeline image-text-to-text, lo que indica que conserva la torre de visión del Qwen3.6 original.

La particularidad más destacada es su naturaleza "herética" y sin censura: el autor aplica una etapa de abliteration previa al ajuste fino para eliminar los rechazos del modelo base, y combina trazas de entrenamiento de origen diverso (dataset Polaris de TeichAI, dataset F451 propio, trazas ligeras de "Fable" de armand0e y trazas de razonamiento de Claude Opus). El nombre "711" hace referencia a la puntuación ARC-C que el autor afirma superar tanto en cuantización de 8 bits como de 4 bits, un umbral que sitúa por encima de la zona habitualmente ocupada por modelos propietarios.

El repositorio principal contiene el código fuente para fusiones, creación de cuantizaciones y uso como modelo base para nuevos ajustes; las cuantizaciones GGUF (MTP y regulares) se publican en un repositorio separado. Es relevante para quienes buscan un modelo de ~27 B con visión, modo thinking y comportamiento sin restricciones que quepa en hardware de consumo, aunque sus afirmaciones de rendimiento proceden del propio autor y no de evaluaciones independientes verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6-27B, familia qwen3_5), con torre de visión; soporte MTP (multi-token prediction) en las cuantizaciones |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP (publicados en repositorio separado); MLX y otros tipos en la sección community |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card; el campo de idiomas del repo solo lista en y zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) en el repo principal; GGUF en repo secundario |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de ~27,8 B parámetros con capacidad multimodal (image-text-to-text). Sobre esa base, el autor aplica una cadena de ajustes finos de múltiples etapas, fusiones de múltiples estados (multi-state-merge) y una etapa previa de abliteration ("heretic") destinada a eliminar los comportamientos de rechazo. El entrenamiento combina el dataset Polaris de TeichAI (con trazas no razonadoras atribuidas a GPT-5), el dataset interno F451, trazas ligeras de "Fable" aportadas por armand0e y trazas de razonamiento/thinking de Claude Opus. El autor indica que el proceso se validó primero sobre modelos Qwen 3.5 de 9 B antes de aplicarlo al 27 B.

La metodología declarada incluye pruebas y benchmarks en cada etapa (cada fine-tune, cada etapa multi-stage y cada paso de fusión) para controlar la calidad, seguidas de una validación humana comparativa lado a lado contra el modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. Las cuantizaciones incorporan soporte MTP (multi-token prediction), lo que puede mejorar el throughput de decodificación en los formatos GGUF compatibles.

## Capacidades

- Generación de texto generalista con modo thinking/razonamiento explícito.
- Razonamiento multi-paso y resolución de problemas, con mejora declarada sobre el modelo base en seguimiento de instrucciones.
- Generación de código y tareas de programación (etiquetado como "coder").
- Escritura creativa, ficción, narrativa y roleplaying en múltiples géneros, pese a no ser el objetivo principal del ajuste.
- Visión: procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Multilingüe: 16 idiomas declarados, incluidos español, chino, inglés, árabe, hindi, japonés y coreano.
- Comportamiento sin censura ("uncensored", "abliterated"): no aplica rechazos por contenido, lo que permite temáticas que el modelo base bloquearía.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; al derivar de Qwen3.6 es probable que conserve parte de esta capacidad, pero no está verificado.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Escritura creativa y narrativa sin restricciones: el modelo puede desarrollar ficción, guiones y worldbuilding con temáticas adultas o controvertidas que el modelo base rechazaría, gracias a la etapa de abliteration y a las trazas de escritura creativa del ajuste.
- Roleplaying y personajes persistentes: adecuado para aplicaciones de chat con personalidad definida y conversaciones largas, donde el comportamiento sin censura evita interrupciones por filtros de rechazo.
- Asistente de razonamiento con modo thinking: para tareas de análisis, planificación y resolución de problemas donde interesa ver la cadena de razonamiento antes de la respuesta final.
- Generación de código en entornos de desarrollo: puede emplearse como asistente de programación local en IDE o pipelines, con la ventaja de ejecutarse en hardware de consumo mediante cuantizaciones GGUF de 4 bits.
- Procesamiento de documentos con imágenes: gracias a la torre de visión, puede extraer y razonar sobre información de capturas, diagramas o documentos escaneados en flujos de automatización.
- Investigación sobre alineación y seguridad: útil como caso de estudio de modelos abliterated para analizar qué comportamientos se eliminan, cómo afecta al rendimiento y qué riesgos introduce en producción.
- Base para ajustes finos posteriores: el repositorio se publica explícitamente como código fuente y modelo base para nuevas etapas de tuning, lo que facilita experimentos de investigación sobre metodologías de multi-stage tuning.
- Despliegue local multilingüe: con 16 idiomas declarados, sirve para prototipos de atención al cliente o traducción asistida en máquinas con una sola GPU de consumo.

## Benchmarks y rendimiento

El autor afirma que el modelo supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y que supera los 7 benchmarks del Qwen3.6-35B-A3B. También declara una puntuación ARC-C superior a 711 tanto en 8 bits como en 4 bits. Sin embargo, en la información proporcionada no se incluyen las tablas numéricas con los resultados desglosados por benchmark.

| Benchmark | Resultado | Notas |
|---|---|---|
| ARC-C (8 bits) | >711 (afirmado por el autor) | Sin cifra exacta ni metodología detallada en la informacion disponible |
| ARC-C (4 bits) | >711 (afirmado por el autor) | Sin cifra exacta ni metodología detallada en la informacion disponible |
| Resto de benchmarks | no disponible | El autor indica mejora sobre Qwen3.6-27B en 6 de 7, sin cifras |

No se han publicado en la información disponible resultados numéricos verificables de MMLU, HumanEval, GSM8K u otros benchmarks estándar, ni evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 56 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offloading parcial.
- VRAM estimada en cuantización de 4 bits: aproximadamente 15-17 GB, lo que permite ejecución en RTX 4090, RTX 4080, RTX 3090 y GPUs de 16 GB o más; el autor destaca que las cuantizaciones más bajas mantienen calidad excepcional.
- GPU recomendadas: A100 80 GB o H100 para bfloat16; RTX 4090, RTX 3090 o RTX 4080 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers (formato nativo), llama.cpp y Ollama para GGUF, vLLM y TGI para serving en precisión completa; las cuantizaciones MTP pueden aprovecharse en runtimes compatibles con multi-token prediction.
- Latencia y throughput: no disponibles en la información proporcionada; el soporte MTP en las cuantizaciones está orientado a mejorar la velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Vision | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | ~27,8 B | no disponible | Apache 2.0 | Si | Fine-tune multi-etapa sin censura; afirma superar al base en 6 de 7 benchmarks |
| Qwen/Qwen3.6-27B (base) | ~27,8 B | no disponible | Apache 2.0 | Si | Modelo original de Qwen; referencia de comparación del autor |
| Qwen3.6-35B-A3B | no disponible (MoE) | no disponible | no disponible | no disponible | El autor afirma que este fine-tune supera sus 7 benchmarks |
| Qwen3.5-27B | ~27 B | no disponible | no disponible | no disponible | Generación anterior; el autor indica que el método lo supera en benchmarks |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros fabricantes (Llama, Mistral, Gemma) en parámetros, contexto o rendimiento verificable.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones orientadas al público sin capas de moderación externas.
- Las afirmaciones de rendimiento (ARC-C >711, superioridad sobre el base) proceden del autor y de pruebas humanas propias; no se han aportado cifras detalladas ni evaluaciones independientes verificables.
- Riesgo de alucinación inherente a los modelos de ~27 B, agravado por la eliminación de rechazos, que puede reducir las señales de incertidumbre del modelo.
- La abliteration puede degradar sutilmente capacidades de razonamiento o seguridad en dominios sensibles; el autor afirma lo contrario, pero no hay evidencia independiente.
- La longitud de contexto no se especifica en la información disponible; conviene verificarla antes de diseñar flujos con ventanas largas.
- El campo de idiomas del repositorio solo lista inglés y chino, aunque la model card declara 16 idiomas; el soporte real de los idiomas adicionales no está verificado.
- El soporte de tool calling y de agentes no está confirmado explícitamente.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros traslada al desplegador toda la responsabilidad legal y de moderación.
- El repositorio principal contiene código fuente de fusión y pesos en bfloat16; para inferencia práctica hay que acudir al repositorio de cuantizaciones GGUF.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Repositorio de cuantizaciones GGUF (NEO MAX, MTP y regulares): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Repositorio del socio con información técnica adicional: https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo de control Qwen3.5-9B del mismo autor: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
