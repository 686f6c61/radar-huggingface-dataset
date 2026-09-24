# bbqmed/Qwen-Image-2.1-PE-T2I

" con una barra. El texto dice `gen.partition("</think>")` — probablemente un escape raro. Lo menciono como bloque de razonamiento.
- Idiomas: "any language" input -> English prompt. Idiomas no disponibles formalmente, pero el model card dice "in any language".
- Aspect ratios soportados: 1:1 2048x2048, 4:3 2400x1792, 3:4 1792x2400, 3:2 2528x1696, 2:3 1696x2528, 16:9 2752x1536, 9:16 1536x2752.

Note: este ficha debe ser sobre el modelo PE-T2I (prompt rewriter), no sobre Qwen-Image-2.1. Aunque conviene aclarar la relación.

Arquitectura: Qwen3.5-VL 9B fine-tuned → transformer decoder VL, 9.4B params. Contexto: no disponible explícitamente (max_new_tokens 16256 sugiere salida larga). Cuantizaciones: safetensors bf16, no se mencionan GGUF.

Benchmarks: no disponibles.

Comparativa: Qwen-Image-2.1-PE-T2I vs alternativas de prompt rewriting: Qwen2.5-VL, GPT-4o (propietario), etc. Debo ser cuidadoso, no inventar. Puedo comparar con Qwen3-VL? No tengo datos. Indicar "no disponible" en varios campos y comparar lo que sé: parámetros (9.4B), licencia. Puedo comparar con el propio Qwen-Image-2.1 como componente. Hmm, mejor: comparar contra el rewriter de Qwen-Image-2.1 (original) — no disponible datos. Puedo mencionar alternativas genéricas como "Qwen3.5-VL 9B base (mismo tamaño, sin fine-tune para prompt rewriting)" pero sin datos. Seré honesto con "no disponible".

Hardware: 9.4B params, bf16 → ~18.8 GB pesos. VRAM ~20-24 GB para inferencia bf16 con overhead. En int8 ~10 GB, int4 ~5-6 GB. Consumer: RTX 4090 24GB sí; RTX 3090 24GB sí; 16GB (4080) requiere cuantización 8 bits. Despliegue: vLLM, TGI, transformers, llama.cpp (si hubiera GGUF, no hay), Ollama no (sin GGUF). Estos son estimaciones — debo indicar que son estimaciones derivadas del tamaño.

Throughput: no disponible. Nota: el modelo genera hasta 16256 tokens, lo que implica alta latencia por prompt (segundos decenas).

Casos de uso: mínimo 6.
1. Preprocesado de prompts en pipelines de generación de imágenes
2. Traducción multilingüe → prompt en inglés
3. Recomendación automática de aspect ratio
4. Herramientas de diseño/UI para no expertos
5. Batch generation de assets de marketing
6. Integración en apps de edición/agentes de diseño
7. Automatización de datasets sintéticos de texto-imagen (generar prompts variados)
8. Front-ends de chatbot/API con usuarios en múltiples idiomas

Limitaciones: licencia qwen-research (uso comercial restringido — normalmente permite uso no comercial; no afirmar en detalle, indicar que es una licencia de investigación con condiciones y hay que revisar LICENSE), 0 descargas/0 likes (no validado por la comunidad), alucinación en detalles del prompt, salida en inglés únicamente, sesgos heredados del modelo base y de datos, thinking mode consume tokens, dependencia de la versión Qwen-Image-2.1 en diffusers, fechas futuras en el repo (2026) — hmm, el dato dice creado 2026-09-24. Lo menciono como dato del repo? Puede resultar confuso. Podría mencionarlo en limitaciones/advertencias: "la fecha de creación indicada en el repo (2026-09-24) es posterior a la fecha actual de redacción"? No sé la fecha actual. Mejor mencionarlo neutralmente: "El repositorio figura creado y actualizado el 2026-09-24, sin historial posterior de mantenimiento". Eso es seguro.

Enlaces: HF del modelo, Qwen-Image-2.1 HF, ModelScope, blog, demo space, discord, GitHub repo.

Resumen: 2-3 párrafos.

Especificaciones: tabla con filas obligatorias.

Parámetros activos: no aplica (no es MoE) — pongo "no aplica (modelo denso)". O "no disponible". Mejor "no aplica (arquitectura densa)".

Formato de pesos: safetensors (bf16). El repo no indica explícitamente bf16 pero el ejemplo usa torch.bfloat16. Digo "safetensors (cargado en bfloat16 según el ejemplo del autor)".

Contexto: no disponible. Mention que el ejemplo genera hasta 16256 tokens nuevos.

Idiomas: entrada en cualquier idioma, salida en inglés. Idiomas soportados oficialmente: no disponibles; el autor declara entrada multilingüe.

Arquitectura: Qwen3.5-VL (decoder-only transformer multimodal) 9B, fine-tuneado. Parámetros: 9.409.813.744.

Tamaño repo 18.8 GB.

Cuadro comparativo: puedo comparar con:
- Qwen-Image-2.1 (modelo de generación, 7B componente visual) - pero es distinto tipo.
- Qwen3.5-VL 9B base (no disponible datos).
- Alternativas propietarias: GPT-4o / Gemini para prompt rewriting — no disponible datos.
Indicaré "no disponible" en rendimiento para todos y compararé lo que sí sé.

Mejor: tabla con columnas: modelo, función, parámetros, contexto, licencia, disponibilidad. Qwen-Image-2.1-PE-T2I; Qwen-Image-2.1 (generador); Qwen3.5-VL 9B (base). Datos de contexto no disponibles. Es honesto.

Escribo ahora. Castellano de España. Títulos con solo la primera palabra en mayúscula. Sin emojis.

Cuidado con "9.409.813.744" — usar separador de miles con puntos al estilo español.

Hardware: VRAM estimada. 9,41B × 2 bytes = ~18,8 GB pesos. Con KV cache y overhead: 22-26 GB en bf16 (depende de la longitud de generación; 16k tokens de salida implican KV cache moderado: 9.4B modelo ~ GQA... desconocido). Estimar 24 GB mínimo. int8 ~10-12 GB, int4 ~6-8 GB.

GPU: A100 40/80 GB, H100, L40S 48GB, RTX 4090 24GB (justo), RTX 3090 24GB, RTX A6000 48GB. Consumer 16GB requiere cuantización.

Despliegue: transformers (AutoModelForCausalLM), vLLM/TGI presumiblemente compatibles al ser un modelo transformers estándar — indicar que no está verificado. llama.cpp/Ollama no (no hay GGUF publicado).

Latencia: no disponible; señalar que hasta 16.256 tokens nuevos implica latencias altas por petición.

Escribo la ficha.## Resumen

Qwen-Image-2.1-PE-T2I es un modelo de reescritura de prompts (prompt engineering) publicado por el usuario bbqmed en HuggingFace. Se trata de un fine-tune del modelo de visión-lenguaje Qwen3.5-VL de 9B parámetros, cuyo único cometido es transformar una petición de imagen breve, escrita en cualquier idioma, en un prompt detallado en inglés acompañado de una relación de aspecto recomendada. La salida se entrega como un objeto JSON con dos campos: `rewritten_prompt` y `wh_ratio`.

El modelo no genera imágenes por sí mismo: es la pieza previa de un pipeline de text-to-image. Su destino natural es alimentar a Qwen-Image-2.1, el generador unificado de imagen de la familia Qwen que combina síntesis y edición con un componente visual de 7B parámetros distribuido en 32 capas DiT single-stream. El reescritor cubre así la brecha entre las instrucciones cortas e imprecisas de un usuario y los prompts largos y estructurados que necesitan los modelos de difusión actuales.

Con 9.409.813.744 parámetros reales (verificados en los safetensors del repositorio) y 18,8 GB de peso, el modelo emplea un modo de razonamiento explícito (thinking) antes de emitir el JSON final, con una ventana de generación de hasta 16.256 tokens nuevos. La licencia Qwen Research y la ausencia total de descargas y valoraciones en el momento de la consulta son dos factores determinantes a la hora de evaluar su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.5-VL), ajustado para reescritura de prompts |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (el autor documenta hasta 16.256 tokens nuevos de generacion) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos se distribuyen en safetensors y el ejemplo oficial los carga en bfloat16 |
| Idiomas soportados | Entrada en cualquier idioma segun el autor; salida siempre en ingles. Listado oficial de idiomas: no disponible |
| Licencia | qwen-research (Qwen Research License Agreement, etiquetada como `license:other`) |
| Formato de pesos | safetensors (18,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-VL, un transformer decoder-only con capacidades de vision y lenguaje de aproximadamente 9,4B parametros, y se ha ajustado de forma especifica para la tarea de reescritura de prompts. El autor no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; toda esa informacion figura como no disponible. El codigo de ejemplo exige `transformers>=5.4.0` y `torch>=2.4.0`, lo que situa al modelo en la rama reciente de la libreria.

La innovacion funcional mas destacable es la separacion explicita entre razonamiento y respuesta: con `enable_thinking=True` el modelo genera un bloque de pensamiento que el usuario debe descartar antes de parsear el JSON resultante. Ese bloque de razonamiento explica presumiblemente la decision de la relacion de aspecto y la expansion del prompt. Las relaciones de aspecto manejadas en ejemplos son 1:1 (2048x2048), 4:3 (2400x1792), 3:4 (1792x2400), 3:2 (2528x1696), 2:3 (1696x2528), 16:9 (2752x1536) y 9:16 (1536x2752). El modelo se acompaña de un `system_prompt.txt` distribuido en el propio repositorio, obligatorio para reproducir el comportamiento documentado.

## Capacidades

- Reescritura de prompts: convierte una peticion breve ("un corgi tocando la guitarra bajo la lluvia") en un prompt largo y detallado en ingles que describe la imagen final.
- Traduccion implicita al ingles: acepta la peticion en cualquier idioma y produce la salida en ingles, el idioma que esperan los modelos de difusion del ecosistema.
- Recomendacion de relacion de aspecto: devuelve un campo `wh_ratio` con uno de los formatos soportados por Qwen-Image-2.1.
- Modo de razonamiento explicito: genera un bloque de thinking previo a la respuesta, activable mediante `enable_thinking=True`.
- Salida estructurada: el resultado final es un JSON parseable con `json.loads`, lo que facilita su integracion en pipelines automatizados.
- Comprension visual heredada: al derivar de un modelo VL, conserva capacidad de procesar imagenes, aunque la model card no documenta casos de uso multimodales para esta variante.
- No documentado: soporte de tool calling, function calling, uso como agente multi-paso o cualquier capacidad de audio. No disponible.

## Casos de uso

- Preprocesado en pipelines de generacion de imagenes: colocar el modelo delante de `QwenImage21Pipeline` para que los usuarios escriban peticiones cortas y el sistema las expanda automaticamente antes de invocar al difusor, como muestra el ejemplo oficial de integracion con Diffusers.
- Aplicaciones de consumo con usuarios no tecnicos: una app movil o web donde el usuario describe lo que quiere en su idioma y el modelo se encarga de la "fontaneria" del prompt, eliminando la necesidad de conocer terminologia de prompt engineering.
- Generacion por lotes de creatividades de marketing: producir cientos de prompts detallados y coherentes a partir de briefs breves en distintos idiomas, con relacion de aspecto fija por canal (16:9 para web, 9:16 para stories).
- Localizacion de catalogos visuales: tomar descripciones de producto en varios idiomas y normalizarlas a prompts en ingles con una unica relacion de aspecto por formato de ficha, garantizando coherencia entre mercados.
- Automatizacion de datasets sinteticos texto-imagen: usar el reescritor para expandir semillas de caption cortas en descripciones ricas, generando pares prompt-imagen a escala con el generador asociado.
- Asistentes de diseño integrados en editores: un panel lateral donde el disenador escribe una idea y recibe una propuesta de prompt y encuadre antes de renderizar, manteniendo el control humano sobre el resultado final.
- Backend de API de generacion de imagenes: servicio que recibe texto libre en multiples idiomas, normaliza la peticion mediante este modelo y delega la renderizacion, devolviendo tambien la relacion de aspecto sugerida para el cliente.
- Traduccion de prompts entre idiomas en herramientas existentes: adaptar bibliotecas de prompts en espanol, chino o japones al ingles sin reescribirlas manualmente, preservando la intencion original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para los pesos, mas el cache KV. Con generaciones de hasta 16.256 tokens nuevos, el consumo realista se situa en el rango de 22-26 GB.
- VRAM estimada cuantizado a 8 bits: en torno a 10-12 GB, suponiendo que se generen variantes de cuantizacion (no publicadas por el autor, seria necesario producirlas).
- VRAM estimada cuantizado a 4 bits: en torno a 6-8 GB, con el mismo caveat de que no existe una version oficial.
- GPU profesionales recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB. Son las opciones que dejan margen holgado para lotes y generaciones largas.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX A6000 (24-48 GB) en bfloat16, aunque con poco margen para lotes grandes. Una RTX 4080 de 16 GB obliga a cuantizar.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. Al ser un modelo transformers estandar, es previsible su uso con vLLM o TGI, aunque esto no esta verificado en la documentacion publicada. No hay pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de serie.
- Latencia y throughput: no disponibles. Como referencia cualitativa, una generacion de hasta 16.256 tokens con decodificacion autorregresiva implica latencias de varios segundos por peticion en GPU de gama alta, lo que desaconseja su uso en rutas criticas sin cache de prompts.

## Comparativa con modelos similares

| Modelo | Funcion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-PE-T2I | Reescritura de prompts | 9,41B | No disponible | qwen-research | HuggingFace, 0 descargas |
| Qwen-Image-2.1 | Generacion y edicion de imagen | Componente visual de 7B (32 capas DiT) | No disponible | Qwen Research (qwen-research) | HuggingFace, ModelScope, demo |
| Qwen3.5-VL 9B (base) | Vision-lenguaje general | ~9,4B | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a funcion, tamano, licencia y disponibilidad. Alternativas de reescritura de prompts propietarias (por ejemplo, servicios comerciales de expansion de prompts) no disponen de especificaciones publicas comparables.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la Qwen Research License Agreement, no bajo Apache 2.0 ni MIT. Debe revisarse el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las licencias de investigacion de Qwen suelen imponer condiciones adicionales.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 valoraciones, y no hay historial de mantenimiento posterior a su creacion el 2026-09-24.
- Ausencia total de benchmarks: no hay datos publicos de calidad de reescritura, fidelidad al prompt original ni tasas de error en el parseo del JSON.
- Riesgo de divergencia semantica: al expandir una peticion breve en un prompt largo, el modelo puede introducir elementos que el usuario no solicito. Es un riesgo intrinseco a toda tarea de expansion de prompts.
- Salida unicamente en ingles: si el flujo de trabajo necesita prompts finales en otro idioma, este modelo no sirve directamente.
- Bloque de razonamiento que consume tokens: el modo thinking incrementa el coste computacional y obliga a separar cuidadosamente la respuesta antes de parsear el JSON, como muestra el ejemplo (`gen.partition("</think>")`).
- Dependencia de versiones recientes: requiere `transformers>=5.4.0` y `torch>=2.4.0`, lo que puede complicar la integracion en entornos con dependencias fijadas.
- Dependencia del ecosistema Qwen: el campo `wh_ratio` esta disenado para el mapa de resoluciones de Qwen-Image-2.1; su uso con otros generadores exige reimplementar esa tabla.
- Sesgos: no documentados por el autor. Al derivar de un modelo VL entrenado con datos web a gran escala, es razonable esperar sesgos de representacion, pero no hay informacion especifica disponible.
- Idiomas soportados no verificados: el autor afirma entrada multilingue, pero no se publica evaluacion por idioma, por lo que la calidad en lenguas distintas del ingles o el chino es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bbqmed/Qwen-Image-2.1-PE-T2I
- Modelo base de generacion (Qwen-Image-2.1): https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope del generador: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog oficial de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord de Qwen: https://discord.gg/CV4E9rpNSD
