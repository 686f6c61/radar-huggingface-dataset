# grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic-GGUF es una variante GGUF del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario grumd0. El modelo base es un post-entrenamiento de NVIDIA sobre google/gemma-4-E4B-it, con 7.463.013.674 parámetros totales según los safetensors del repositorio original. La intervención de grumd0 consiste en aplicar la herramienta Heretic para realizar una ablación de la dirección de rechazo (abliteration) y posteriormente convertir y cuantizar los pesos a GGUF con llama.cpp.

El objetivo declarado es reducir el comportamiento de rechazo del modelo base: según la model card, las negativas en JailbreakBench Harmful caen de 89/100 a 3/100 y en XSTest Unsafe de 155/200 a 32/200, con una divergencia KL de 0,0859 respecto al original. Es, por tanto, un derivado orientado a usos donde el filtrado del modelo base resulta demasiado restrictivo, y no un modelo nuevo entrenado desde cero.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo práctico de ablación selectiva con Heretic sobre una arquitectura reciente (etiquetada como gemma4, sin confirmación oficial en la información disponible); por otro, advierte de que se trata de un artefacto sin validación comunitaria (0 descargas, 0 likes en el momento de la consulta) y con una licencia heredada que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Google gemma-4-E4B-it, post-entrenado por NVIDIA; modificado mediante ablación de dirección de rechazo (Heretic ARA). El sufijo E4B sugiere una configuración MoE con ~4B parámetros efectivos, aunque no se confirma en la información disponible |
| Parametros totales | 7.463.013.674 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (convención de nombres E4B implicaría ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tipos concretos no listados en la información disponible); repositorio de 35,4 GB con varios niveles de cuantización |
| Idiomas soportados | 34 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | openmdw-1.1 (OpenMDW License Agreement 1.1); modelo base de NVIDIA bajo la misma licencia, upstream gemma-4-E4B-it bajo Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp); el modelo base se distribuye en BF16 safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de gemma-4-E4B-it, un transformer (con alta probabilidad de mezcla de expertos dado el sufijo E4B, aunque el dato no se explicita) que NVIDIA post-entrenó para dar lugar a Nemotron-3.5-Bolt-E4B-BF16. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus ni las técnicas de alineación empleadas por NVIDIA (RLHF, DPO u otras). Tampoco se documenta la longitud de contexto nativa.

La innovación técnica de esta ficha es la ablación por rango arbitrario (Arbitrary-Rank Ablation, ARA) implementada en Heretic. El proceso estima una dirección de rechazo a partir de pares de prompts dañinos y benignos y la proyecta fuera de las matrices de pesos en un rango de capas concreto: `start_layer_index` = 12, `end_layer_index` = 27, con `neighbor_count` = 14 y pesos `preserve_good_behavior_weight` = 0,5232480534666997, `steer_bad_behavior_weight` = 0,000237553833412742 y `overcorrect_relative_weight` = 0,748730444223033. El resultado se mide con divergencia KL frente al base (0,0859), lo que cuantifica cuánto se ha desplazado la distribución de salida. No hay reentrenamiento: los pesos se modifican quirúrgicamente y luego se convierten a GGUF.

## Capacidades

- Generación de texto conversacional en 34 idiomas, incluido el español, con soporte declarado de conversaciones multi-turno (tag `conversational`).
- Instrucciones y diálogo heredados del post-entrenamiento de NVIDIA sobre gemma-4-E4B-it.
- Comportamiento de rechazo fuertemente reducido: 3/100 negativas en JailbreakBench Harmful y 32/200 en XSTest Unsafe, frente a 89/100 y 155/200 del base.
- Distribución de salida cercana al base (KL 0,0859), lo que sugiere que las capacidades generales se preservan en buena medida, aunque no se aportan benchmarks de tarea para verificarlo.
- Despliegue nativo en llama.cpp y ecosistema GGUF (Ollama, LM Studio, servidores compatibles con la API de endpoints).
- Compatibilidad declarada con `endpoints_compatible` en HuggingFace.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como contrapunto experimental para estudiar cómo varía la tasa de rechazo al aplicar ARA en las capas 12-27, comparando directamente con el base BF16 y midiendo el coste en KL.
- Red-teaming y generación de datos adversarios: con 3/100 negativas en JailbreakBench, es útil para producir corpus de prompts que un modelo alineado rechazaría, y así evaluar clasificadores y filtros de moderación de terceros.
- Evaluación de robustez de guardrails: alimentar pipelines de moderación con las salidas del modelo permite medir la tasa de falsos negativos de un filtro antes de desplegarlo en producción.
- Asistencia local en escritorio: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en un equipo de sobremesa, sin conexión y sin enviar prompts a servicios externos.
- Procesamiento multilingüe en local: cubre 34 idiomas (español, francés, alemán, árabe, japonés, coreano, hindi, etc.) para tareas de resumen, reescritura o extracción sobre textos que no conviene enviar a la nube.
- Generación creativa sin restricciones editoriales: escritura de ficción con violencia, contenido adulto o temas sensibles donde el modelo base se negaría, asumiendo la responsabilidad legal del output.
- Base para fine-tuning posterior: al estar ya abliterado, sirve como punto de partida para ajustes específicos de dominio sin reintroducir el sesgo de rechazo en las capas ablacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos aportados por el autor son métricas de rechazo y divergencia respecto al modelo base:

| Metrica | Modelo base | Este modelo |
|---|---:|---:|
| JailbreakBench Harmful (negativas) | 89/100 | 3/100 |
| JailbreakBench Benign (negativas) | 18/100 | 0/100 |
| XSTest Unsafe (negativas) | 155/200 | 32/200 |
| Divergencia KL respecto al base | 0 | 0,0859 |

El autor indica que ninguno de los prompts de evaluación estaba en el conjunto de entrenamiento de Heretic. No se aportan métricas de calidad lingüística, razonamiento, código ni matemáticas para ninguna de las dos variantes.

## Requisitos de hardware

Estimaciones derivadas de los 7.463.013.674 parámetros del modelo; el autor no publica requisitos oficiales.

- VRAM para inferencia (pesos + overhead de contexto): ~15-16 GB en F16/BF16, ~8-9 GB en Q8_0, ~4,5-5,5 GB en Q4_K_M, ~3,5-4 GB en Q3_K_M.
- GPU recomendadas para F16: A100 40 GB, H100, L40S, RTX 4090 24 GB (justo, con contexto moderado).
- GPU para Q8_0: RTX 4090, RTX 3090, RTX 4080 Super, A6000.
- Consumer GPU: sí. Q4_K_M cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RX 7600); Q8_0 requiere 12 GB o más.
- CPU: viable con llama.cpp descargando capas a RAM; con 16 GB de RAM del sistema se puede ejecutar Q4_K_M íntegramente en CPU, a costa de latencia.
- Opciones de despliegue: llama.cpp (referencia del formato), Ollama, LM Studio, servidores GGUF compatibles con la API de OpenAI. vLLM y TGI tienen soporte de GGUF limitado o experimental; para máximo throughput conviene convertir a safetensors y usar vLLM con el base BF16.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (JBB Harmful) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF | 7,46B totales (activos no disponibles) | no disponible | 3/100 | openmdw-1.1 | GGUF, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 7,46B totales | no disponible | 89/100 | openmdw-1.1 | BF16 safetensors |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible | Apache 2.0 | safetensors, pesos originales |
| Otras variantes GGUF del mismo base | 7,46B totales | no disponible | no disponible | openmdw-1.1 | GGUF |

La comparación relevante es frente al base: misma arquitectura, mismos parámetros y misma licencia, con una reducción drástica de rechazos a cambio de una divergencia KL de 0,0859. Frente a gemma-4-E4B-it, la diferencia principal es la licencia (Apache 2.0 en el upstream, OpenMDW 1.1 en el derivado de NVIDIA) y el doble post-entrenamiento. No se dispone de datos para comparar con otras alternativas abliteradas de tamaño similar.

## Limitaciones y advertencias

- Modelo abliterado: reduce deliberadamente el rechazo y puede cumplir peticiones que el base deniega, produciendo contenido inexacto, sesgado o dañino. El propio autor lo advierte de forma explícita.
- La divergencia KL de 0,0859 indica un desplazamiento real de la distribución de salida; no se han publicado evaluaciones que confirmen que las capacidades de razonamiento, código o matemáticas se mantienen intactas.
- Riesgo de alucinación heredado del modelo base y potencialmente agravado por la modificación de pesos; sin benchmarks de fidelidad no es cuantificable.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgo demográfico, político o cultural para este derivado.
- Idiomas: se declaran 34, pero no se aportan métricas de calidad por idioma; el rendimiento relativo en lenguas de bajos recursos como el estonio o el lituano es desconocido.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificarlo empíricamente.
- Licencia: OpenMDW 1.1 impone condiciones que deben revisarse antes de uso comercial; además, el modelo incorpora pesos derivados de gemma-4-E4B-it (Apache 2.0), cuyas obligaciones de atribución se mantienen. No es un producto de NVIDIA ni de Google y no tiene garantía.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-24. No hay evidencia externa de calidad ni de estabilidad.
- Los tipos de cuantización concretos no se listan en la información disponible, por lo que la elección de fichero requiere inspeccionar el repositorio.
- No se confirma si la arquitectura es MoE ni cuántos parámetros se activan por token; esto afecta directamente a las estimaciones de latencia y VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo upstream (Google): https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp (conversión y cuantización): https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
