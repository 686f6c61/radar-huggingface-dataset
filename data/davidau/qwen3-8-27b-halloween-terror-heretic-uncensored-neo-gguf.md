# DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF es un ajuste fino (finetune) de la comunidad publicado por DavidAU sobre el modelo base Qwen/Qwen3.8-27B. Se distribuye en formato GGUF para inferencia local con llama.cpp y derivados, y está etiquetado explícitamente como «abliterated», «uncensored», «heretic» y «not-for-all-audiences», es decir, con las capas de rechazo eliminadas deliberadamente mediante técnicas de abliteration. El modelo está empaquetado con un tema de terror y Halloween y con un conjunto de presets propietarios del autor: 13 modos de razonamiento, 13 modos de instrucción, 10 «EVIL AI Constructs», «Turbo-Brilliance Evil Ed» y un «Halloween O/S».

El problema que aborda es doble: por un lado, ofrecer una variante sin restricciones de contenido para escritura de ficción de terror, roleplay y narrativa interactiva; por otro, servir como banco de pruebas para estudiar el efecto de la eliminación de rechazos sobre el comportamiento del modelo. Con 27 000 millones de parámetros, se sitúa en la franja en la que la cuantización a 4 bits permite ejecución en una única GPU de 24 GB, lo que lo hace relevante para quienes quieren un modelo creativo grande en hardware de consumo.

La información pública disponible es escasa: el repositorio no incluye tabla de benchmarks, no detalla la longitud de contexto heredada del modelo base ni el volumen de datos de entrenamiento, y en el momento de la consulta muestra un tamaño de 0,0 GB con 0 descargas y 15 «likes». El acceso está restringido (gated) y la licencia declarada es Apache 2.0, aunque limitada a inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen3.8-27B (no se detalla en la información disponible) |
| Parámetros totales | 27 000 M (según la denominación del modelo) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF; los niveles concretos (Q2_K–Q8_0, F16) no se detallan en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiquetas del repo: transformers, unsloth) |
| Pipeline declarado | image-text-to-text |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creación / actualización | 2026-10-22 / 2026-10-29 |
| Descargas / likes | 0 / 15 |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen/Qwen3.8-27B, un transformer decoder-only de 27 000 millones de parámetros, y se publica como finetune. El autor no documenta en la información disponible el número de tokens de ajuste, la composición del dataset, ni si se emplearon etapas de RLHF, DPO o ajuste supervisado clásico. Las herramientas citadas en las etiquetas (`unsloth`) apuntan a un flujo de ajuste eficiente en memoria, pero no se aporta configuración de entrenamiento.

La innovación declarada no está en la arquitectura sino en el post-procesado y el empaquetado: eliminación de rechazos («abliterated», «heretic»), tematización de terror y un sistema de presets de prompt que el autor denomina «Halloween O/S», con 13 modos de razonamiento, 13 modos de instrucción y 10 «EVIL AI Constructs» para simulación de personajes. La conversión a GGUF permite ejecución en CPU/GPU híbrida, pero no se especifica el método de cuantización ni si se preservaron las capacidades multimodales que sugiere la etiqueta `image-text-to-text`.

## Capacidades

- Generación de texto en inglés con estilos narrativos de terror, horror y géneros afines.
- Escritura creativa de ficción: relatos, descripciones atmosféricas, diálogo de personajes.
- Roleplay y simulación de personajes, incluyendo los 10 «EVIL AI Constructs» definidos por el autor.
- 13 modos de razonamiento («reasoning modes») y 13 modos de instrucción seleccionables mediante prompt.
- Modo «thinking»/razonamiento explícito, según las etiquetas del repositorio.
- Comportamiento sin rechazos ante peticiones que un modelo alineado rechazaría (abliterated).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; los «modos» son presets de prompt, no un framework de agentes.
- Multilingüe: no; únicamente inglés declarado.
- Visión: el pipeline declarado es `image-text-to-text`, pero no se documenta ningún módulo ni uso de imagen en la información disponible.
- Compatibilidad con endpoints declarada en las etiquetas (`endpoints_compatible`).

## Casos de uso

- Escritura de ficción de terror y horror: el modelo está tematizado y ajustado para este género, de modo que genera atmósfera, tensión y violencia narrativa sin los rechazos habituales de los modelos alineados; útil para autores que necesitan primeros borradores rápidos de relatos o novelas.
- Diseño de personajes y lore para videojuegos: los «EVIL AI Constructs» y los modos de instrucción permiten mantener voces de personaje consistentes en guiones de NPC, con variantes de personalidad malvada o antagonista.
- Roleplay en campañas de rol de mesa (TTRPG): el modelo sostiene diálogos multi-turno en inglés con tono de terror; útil para másters que necesitan improvisar NPC y descripciones en sesión.
- Prototipado de narrativa interactiva y ficción ramificada: los modos de razonamiento permiten pedir al modelo que planifique tramas antes de escribir la escena, lo que facilita generar árboles de decisión coherentes.
- Contenido temático para eventos de Halloween: generación de textos para experiencias de terror, escape rooms o atracciones, donde el tono explícito es un requisito y no un defecto.
- Investigación sobre alineación y abliteration: al ser una variante con los rechazos eliminados sobre un base conocido, sirve como caso de estudio para medir cuánto se degrada la instrucción general, la seguridad y la coherencia al aplicar estas técnicas, comparándolo con Qwen3.8-27B original.
- Red teaming y evaluación de filtros: útil para generar prompts y respuestas adversarias con las que probar clasificadores de contenido y políticas de moderación antes de desplegarlas.
- Despliegue local en estaciones de trabajo: al publicarse en GGUF, se puede servir con llama.cpp u Ollama en equipos sin acceso a API, algo relevante para talleres de escritura o demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad creativa, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

Estimaciones calculadas a partir de 27 000 M de parámetros; no son cifras publicadas por el autor.

- VRAM aproximada de pesos: ~54 GB en FP16, ~29 GB en Q8_0, ~22 GB en Q6_K, ~19 GB en Q5_K_M, ~16,5 GB en Q4_K_M, ~13 GB en Q3_K_M, ~10 GB en Q2_K. Hay que sumar la caché KV, que crece con el contexto y no se puede dimensionar al no conocerse la longitud de contexto del modelo base.
- GPU de datacenter: A100 40/80 GB y H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S 48 GB para Q8_0 con contexto moderado.
- GPU de consumo: RTX 4090 / 3090 (24 GB) funcionan con Q4_K_M y contexto limitado; RTX 4080 (16 GB) obliga a Q3_K_M o Q2_K; tarjetas de 12 GB solo admiten Q2_K con contexto muy reducido o descarga parcial a CPU.
- Apple Silicon: un Mac con 32 GB de memoria unificada puede ejecutar Q4_K_M; 64 GB permite Q6_K u Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, y conversión a otros runners compatibles con GGUF. vLLM y TGI requerirían pesos en safetensors o soporte GGUF, no confirmado para este repo.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, la velocidad dependerá del número de capas descargadas a GPU y del contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Acceso | Particularidad |
|---|---|---|---|---|---|---|
| DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF | 27 000 M | No disponible | Apache 2.0 | GGUF | Gated | Terror, abliterated, presets de prompt |
| Qwen/Qwen3.8-27B (base) | 27 000 M | No disponible | No disponible en la información | Safetensors (previsible) | No disponible | Modelo alineado de referencia |
| Qwen3.8-27B-Uncensored-GGUF (build de terceros) | 27 000 M | No disponible | No disponible | GGUF, F16 + 12 niveles de cuantización (Q2_K en adelante) | No disponible | Misma base sin rechazos, sin tematización |
| DavidAU/Qwen3.8-27B-Halloween-Terror (variante no GGUF) | 27 000 M | No disponible | Apache 2.0 (según repo) | No disponible | No disponible | Misma temática en pesos completos |

No hay datos de rendimiento publicados para ninguno de los cuatro, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Contenido no apto para todo público: el modelo está etiquetado `not-for-all-audiences` y entrenado para eliminar rechazos; puede producir violencia explícita, contenido sexual o material ofensivo sin aviso.
- Riesgo elevado de alucinación y de degradación de instrucciones: la abliteration suele afectar a la capacidad de seguir instrucciones complejas y a la coherencia en tareas de razonamiento; no hay evaluaciones que cuantifiquen ese deterioro en este build.
- Solo inglés declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del acceso gated antes de un uso comercial; el autor puede imponer restricciones adicionales en la tarjeta del repositorio.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que impide descarga anónima y automatizada.
- Disponibilidad dudosa de los pesos: el repositorio muestra 0,0 GB de tamaño, 0 descargas y solo 15 «likes»; verifica que los ficheros GGUF estén realmente subidos antes de planificar un despliegue.
- Validación comunitaria prácticamente nula: sin descargas ni benchmarks, no hay evidencia independiente de calidad.
- Discrepancia de pipeline: se declara `image-text-to-text`, pero no se documenta ningún módulo de visión; asume que es un modelo de texto hasta que se demuestre lo contrario.
- Los «13 reasoning modes», «13 instruct modes» y «EVIL AI Constructs» no son módulos entrenados verificables, sino presets de prompt definidos por el autor; su comportamiento depende de que se copien literalmente.
- Sesgos: al derivar de un base entrenado mayoritariamente en inglés y al reforzar temáticas de terror, es probable que amplifique estereotipos en la caracterización de personajes; no hay auditoría publicada.
- No apto como modelo de producción orientado a usuarios finales sin una capa de moderación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- README del modelo: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF/blob/main/README.md
- Variante no GGUF del mismo autor: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror/tree/main
- Repositorio de terceros con instrucciones de despliegue local (no oficial): https://github.com/Wassimyounes01/qwen38-uncensored
- Artículo de terceros sobre cuantizaciones GGUF y llama.cpp (no oficial): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Artículo de terceros sobre el build abliterated en GGUF (no oficial): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
