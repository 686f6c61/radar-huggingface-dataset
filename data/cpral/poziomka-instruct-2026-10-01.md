# cpral/poziomka-instruct-2026-10-01

## Resumen

Poziomka Instruct 2026-10-01 es un modelo de tipo instruct desarrollado por el usuario cpral, publicado en Hugging Face con un total de 4.119.797.632 parámetros (unos 4,12 mil millones) y un repositorio de 8,2 GB en formato safetensors. La etiqueta de arquitectura declarada es `bailing_moe`, lo que indica una arquitectura de mezcla de expertos (MoE) que además requiere código personalizado (`custom_code`) para cargarse en transformers. El modelo se presenta como una variante instruct con dos modos de operación: un modo de razonamiento y un modo de respuesta rápida.

El modelo deriva mediante ajuste fino supervisado (SFT) del checkpoint `cpral/poziomka-linear-8-9-10-11-sqrt`, y se ha entrenado sobre los conjuntos de datos en polaco `cpral/Polski_Polish_SFT_poziomka-fun-rp-v11` y `cpral/poziomka-fun-rp-v12`, ambos orientados a instrucciones y a roleplay. El único idioma declarado es el polaco (pl). El propio autor indica en la model card que no se trata de la versión final y que el desarrollo continúa.

Su relevancia actual es limitada pero concreta: se trata de un modelo abierto en polaco con modo de razonamiento explícito, publicado con 0 descargas y 0 "me gusta", sin licencia declarada, sin resultados de benchmarks y sin cuantizaciones publicadas. Resulta interesante como objeto de estudio de arquitecturas MoE con código personalizado aplicadas a un idioma con menos cobertura, pero su falta de licencia y de evaluación pública lo sitúan, por ahora, fuera de un uso en producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `bailing_moe`), requiere `trust_remote_code` |
| Parámetros totales | 4.119.797.632 (~4,12 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors (el tamaño del repo, 8,2 GB, es compatible con bf16/fp16) |
| Idiomas soportados | polaco (pl) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |
| Modelo base | cpral/poziomka-linear-8-9-10-11-sqrt (ajuste fino sobre él) |
| Fecha de publicación | 2026-10-01 (última actualización 2026-10-01) |
| Descargas / me gusta | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La etiqueta de arquitectura `bailing_moe` y la presencia de código personalizado indican un transformer de tipo mezcla de expertos (MoE) cuya implementación no está integrada de serie en transformers, por lo que su carga exige `trust_remote_code=True`. No se ha publicado el número de expertos, el número de expertos activos por token ni los parámetros activos, de modo que no es posible estimar el coste de cómputo real por token a partir de la información disponible.

El entrenamiento declarado es un ajuste fino supervisado (SFT) sobre dos corpus en polaco: `cpral/Polski_Polish_SFT_poziomka-fun-rp-v11` y `cpral/poziomka-fun-rp-v12`, con un componente claro de roleplay y conversación ("fun-rp"), además de instrucciones generales. No hay información sobre el número de tokens empleados en este checkpoint concreto, ni sobre la composición detallada del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u optimización por preferencias. El autor menciona únicamente que el modelo soporta un modo de razonamiento y un modo de respuesta rápida, sin detallar el mecanismo (por ejemplo, si es una cadena de pensamiento explícita activada por plantilla, un token de control o una conmutación por prompt). Como referencia del linaje, el modelo relacionado `cpral/poziomka_sft_2026_09_14_hf` se entrenó con unos 2,4 mil millones de tokens del dataset v11 en Megatron-LM, con secuencias de hasta 8192 tokens y ajuste fino completo, aunque esos datos corresponden a otro checkpoint y no deben atribuirse sin verificación a este.

## Capacidades

- Generación de texto en polaco: es el único idioma declarado en la model card y en las etiquetas del repositorio.
- Modo de razonamiento: la model card muestra explícitamente un bloque `reasoning` separado de la respuesta final, con planificación previa a la generación.
- Modo de respuesta rápida: el autor describe una vía de respuesta "błyskawicznej" (instantánea) alternativa al razonamiento, presumiblemente para reducir latencia.
- Escritura creativa y narrativa: los datasets de ajuste incluyen corpus de tipo `fun-rp`, orientados a roleplay y ficción.
- Seguimiento de instrucciones con restricciones detalladas: el ejemplo de la model card plantea un prompt con restricciones de longitud, persona narrativa, número de personajes y prohibiciones léxicas.
- Generación de texto largo: el ejemplo solicitado pide 2000-3000 palabras en una sola escena.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo de razonamiento es el único indicio, sin documentación sobre uso agéntico.
- Capacidades multilingües: no disponibles; solo se declara polaco.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistentes conversacionales en polaco: el modelo puede mantener diálogo multi-turno en polaco gracias a su ajuste sobre corpus de conversación y roleplay; conviene validar antes la longitud de contexto real, que no está publicada.
- Generación de narrativa y ficción en polaco: el ajuste sobre `poziomka-fun-rp-v11` y `v12` lo hace adecuado para borradores de relatos, diálogos y tramas, con revisión humana posterior dado el riesgo de incumplimiento de restricciones largas.
- Diálogos para videojuegos y personajes NPC: el sesgo hacia roleplay permite generar líneas de personaje con tono consistente en polaco, integrándolo en un pipeline con plantillas y filtros de seguridad.
- Prototipado de arquitecturas con modo razonamiento frente a modo rápido: útil en investigación para comparar latencia y calidad entre ambos modos en un mismo modelo MoE de 4,12 B.
- Reescribir, resumir y reformular documentos en polaco: tareas de transformación de texto donde el modelo parte de material existente y el riesgo de alucinación factual es menor que en generación libre.
- Enrutado por latencia en aplicaciones interactivas: el modo de respuesta rápida puede reservarse para consultas simples y el modo de razonamiento para consultas complejas, si se confirma que la conmutación es fiable.
- Estudio de modelos MoE con código personalizado: sirve como caso práctico para evaluar la integración de arquitecturas `bailing_moe` en transformers, vLLM u otros motores, y para medir el coste de cargar expertos.
- Ajuste fino posterior sobre dominio específico en polaco: al ser un checkpoint SFT de 4,12 B derivado de un modelo base público, es un punto de partida razonable para LoRA o ajuste completo en nichos como atención al cliente o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una imagen comparativa (`porownanie`) y un ejemplo de generación con el modo de razonamiento activado, pero no contiene cifras de MMLU, GSM8K, HumanEval ni de ninguna otra evaluación estandarizada, ni métricas de latencia o throughput. Cualquier comparación numérica con otros modelos carecería de base con los datos disponibles.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: entre 9 y 14 GB solo para pesos y caché KV en contextos moderados, partiendo de los 4,12 B de parámetros y los 8,2 GB de pesos publicados (cálculo orientativo, no publicado por el autor).
- VRAM estimada en 8 bits: alrededor de 4-5 GB de pesos, más caché KV; es una estimación aritmética, ya que no se han publicado cuantizaciones oficiales.
- VRAM estimada en 4 bits: alrededor de 2,5-3 GB de pesos, más caché KV; de nuevo, estimación, no hay GGUF ni GPTQ/AWQ publicados.
- GPU de consumo: cabe en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090) sin cuantizar, y en tarjetas de 8-12 GB con cuantización de 4 bits, siempre que el motor de inferencia soporte la arquitectura.
- GPU de centro de datos: A100 o H100 no son necesarias por tamaño de modelo; tienen sentido para servir en lote con concurrencia alta.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada implícitamente por el repositorio. El soporte en vLLM, TGI o SGLang no está confirmado para esta variante concreta. llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. Al ser una arquitectura MoE, el coste por token dependerá del número de parámetros activos, dato que no se ha publicado; por tanto, no puede estimarse con fiabilidad a partir solo de los parámetros totales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma | Formato | Notas |
|---|---|---|---|---|---|---|
| cpral/poziomka-instruct-2026-10-01 | 4,12 B | no disponible | no disponible | pl | safetensors | Objeto de esta ficha; MoE con código personalizado; 0 descargas |
| cpral/poziomka-linear-8-9-10-11-sqrt | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base del anterior |
| cpral/poziomka_sft_2026_09_14_hf | no disponible | hasta 8192 tokens (Megatron-LM) | no disponible | pl | safetensors (repo de 33 GB) | SFT previo sobre ~2,4 B tokens del dataset v11; checkpoints iter_0000400 e iter_0000800 |
| cpral/poziomka-sft-instruct-2603 | no disponible | no disponible | no disponible | no disponible | no disponible | Solo se dispone del grafo de arquitectura renderizado por hfviewer |

No se dispone de datos de benchmarks ni de especificaciones suficientes en la información proporcionada para comparar con alternativas externas de tamaño similar (por ejemplo, otros modelos instruct en polaco de la franja de 3-8 B). Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita no hay autorización clara de uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de benchmarks: no hay ninguna evaluación publicada que permita estimar razonamiento, matemáticas, código o fidelidad factual.
- Riesgo de alucinación elevado y baja adherencia a restricciones: el propio ejemplo "seleccionado" de la model card incumple varias condiciones del prompt. Concretamente, el texto generado está muy por debajo de las 2000-3000 palabras solicitadas, está narrado en tercera persona cuando se pedía primera persona, presenta al padre vivo cuando la premisa era que había fallecido dos años antes, y contradice el requisito de no explicitar esa muerte. Esto sugiere dificultades con instrucciones largas, con múltiples restricciones simultáneas y con coherencia a lo largo de generaciones extensas.
- Sesgo de dominio: los datasets de ajuste son de tipo roleplay y conversación informal (`fun-rp`), lo que puede desplazar el estilo hacia lo creativo o coloquial y penalizar respuestas técnicas, formales o factuales.
- Idioma único: solo polaco declarado; no debe asumirse capacidad de traducción ni de comprensión de otros idiomas, incluido el español.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de ejecución de código remoto: el repositorio exige `trust_remote_code=True`, lo que implica cargar código del autor del modelo en el proceso de Python; en entornos de producción debe revisarse el código y ejecutarse en un sandbox.
- Estado de desarrollo temprano: el autor indica explícitamente que no es la versión final; la API, el formato de prompt y los pesos pueden cambiar entre publicaciones fechadas.
- Inexistencia de cuantizaciones: no hay GGUF ni variantes de 4 u 8 bits publicadas, lo que limita el despliegue en hardware modesto y en herramientas como llama.cpp u Ollama.
- Adopción nula: 0 descargas y 0 interacciones en el momento de la consulta, por lo que no existe comunidad, informes de errores ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/poziomka-instruct-2026-10-01
- Modelo base: https://huggingface.co/cpral/poziomka-linear-8-9-10-11-sqrt
- Dataset de SFT v11: https://huggingface.co/datasets/cpral/Polski_Polish_SFT_poziomka-fun-rp-v11
- Dataset de SFT v12: https://huggingface.co/datasets/cpral/poziomka-fun-rp-v12
- Checkpoint SFT relacionado: https://huggingface.co/cpral/poziomka_sft_2026_09_14_hf
- Grafo de arquitectura de un modelo de la misma familia: https://hfviewer.com/cpral/poziomka-sft-instruct-2603
- Ficha de terceros sobre un LoRA de la familia: https://free2aitools.com/model/cpral/poziomka_11_sft_lora_2026_03_24
- Imagen comparativa incluida en la model card: https://cdn-uploads.huggingface.co/production/uploads/692c94fd48cef90cf296829a/ftau31PC9uNfcHQVO8upf.png
