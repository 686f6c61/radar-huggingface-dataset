# bayazidhs04/liltii-v0.2-qwen2.5-0.5b

## Resumen

liltii-v0.2-qwen2.5-0.5b es un ajuste fino mediante QLoRA de Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario bayazidhs04 dentro del proyecto CupCake. El modelo no busca ser un asistente de propósito general, sino una persona conversacional de compania ("companion") pensada para ejecutarse en dispositivo: responde en bengalí, en inglés o en "Banglish" (bengalí romanizado) con turnos cortos, informales y con un tono coherente de personaje.

La característica distintiva es que cada respuesta empieza por una etiqueta de emoción entre corchetes, seguida opcionalmente de una acción entre asteriscos y del texto. Esa etiqueta está pensada para que la aplicación anfitriona anime la cara o la expresión del compañero. El modelo declara diez emociones: `[happy]`, `[sad]`, `[angry]`, `[surprised]`, `[confused]`, `[sleepy]`, `[excited]`, `[neutral]`, `[shy]` y `[bored]`.

Técnicamente es un transformer causal de la familia Qwen2 con unos 494 millones de parámetros y 32.768 tokens de contexto, del que solo se entrenó el 0,22 por ciento de los pesos (1.081.344 parámetros vía LoRA). Su relevancia práctica está en el nicho: asistentes conversacionales locales y de bajo coste para usuarios bengalíes, con cuantizaciones GGUF de 271 MB que caben en un teléfono de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia Qwen2 (`model_type: qwen2`) |
| Parametros totales | 494.032.768 (dato real de safetensors); la model card declara 495.114.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF F16 (~994 MB) y GGUF Q4_0 (~271 MB, recomendado); el autor desaconseja los k-quants por incompatibilidad dimensional |
| Idiomas soportados | Bengalí (`bn`), inglés (`en`) y bengalí romanizado ("Banglish") |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors fp16 (~988 MB) y GGUF |

Datos adicionales de arquitectura declarados por el autor: 24 capas, hidden size 896, 14 cabezas de atención y 2 cabezas KV (GQA), intermediate size 4864, vocabulario de 151.936 tokens, precisión float16. Tamaño del repositorio: 2,6 GB.

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B-Instruct, un transformer causal decoder-only con Grouped Query Attention (14 cabezas de consulta frente a 2 de clave/valor), lo que reduce de forma notable el tamaño de la caché KV y lo hace apto para inferencia en hardware limitado. Sobre ese modelo se aplicó QLoRA: LoRA sobre una base cuantizada a 4 bits, con rango `r=8`, `alpha=16`, dropout 0,05 y adaptadores únicamente en las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. Esto supone entrenar 1.081.344 parámetros, aproximadamente el 0,22 por ciento del total.

El entrenamiento usó el dataset bayazidhs04/cupcake-liltii, con 4.000 muestras de chat Banglish etiquetadas por emoción (turnos simples y multiturno), divididas en 3.600 de entrenamiento y 400 de validación. Se realizaron 3 épocas (339 pasos de optimizador) con batch efectivo de 8, learning rate 2e-4 con schedule coseno y 50 pasos de calentamiento, weight decay 0,01, longitud máxima de secuencia 2048, precisión fp16 y semilla 42. Todo el ajuste se ejecutó en una única Tesla T4 de 16 GB en Kaggle. No hay etapa de RLHF ni de DPO. La innovación es de formato más que de arquitectura: la etiqueta de emoción como primer token de la respuesta convierte la salida del modelo en una señal estructurada para la interfaz.

## Capacidades

- Generación de texto conversacional en bengalí, inglés y bengalí romanizado, con turnos cortos y registro coloquial.
- Diálogo multiturno manteniendo el personaje, con soporte de plantilla de chat de Qwen (`apply_chat_template`).
- Emisión estructurada de una etiqueta de emoción inicial tomada de un conjunto cerrado de diez categorías, utilizable como señal de control para animaciones o interfaces.
- Emisión de acciones o descripciones de comportamiento entre asteriscos, al estilo de la ficción interactiva.
- Conversación de acompañamiento emocional básico ("companion"), con respuestas de apoyo y tono afectivo.
- Ejecución en dispositivo y en el borde: el quant Q4_0 de 271 MB permite inferencia local en telefonía de gama media.
- Compatibilidad con `text-generation-inference` y con endpoints alojados (etiqueta `endpoints_compatible`).

No se declaran capacidades de tool calling, function calling, razonamiento multietapa, agentes, matemáticas, código, visión ni audio. De hecho, la propia model card excluye explícitamente el QA factual, la programación, las matemáticas y la traducción.

## Casos de uso

- Compañero conversacional en teléfono: el modelo está dimensionado para correr en local con el GGUF Q4_0 de 271 MB, sin conexión y sin enviar los mensajes del usuario a un servidor, algo relevante para conversaciones íntimas.
- Animación de personajes y VTubers: la etiqueta de emoción inicial permite mapear cada respuesta a una expresión facial o a una animación concreta en la aplicación anfitriona, sin necesidad de un clasificador de sentimiento adicional.
- Juguetes conectados y dispositivos de compañía: la model card menciona su uso emparejado con el microcontrolador con BLE del proyecto CupCake, donde el modelo aporta el texto y la etiqueta de emoción que gobierna el hardware.
- Prototipado rápido de personajes para escritores y diseñadores de juegos: al ser un ajuste de 0,5B y con el dataset público, sirve como plantilla reproducible para crear otras personas conversacionales con el mismo formato de etiquetas.
- Aplicaciones de bienestar y diario emocional para usuarios bengalíes: el tono afectivo y el registro coloquial lo hacen adecuado para check-ins breves de estado de ánimo, siempre con filtro de salida y aviso de que el texto lo genera un modelo.
- Investigación sobre fine-tuning eficiente en hardware de consumo: el procedimiento completo (QLoRA r=8 sobre T4, tres épocas, 339 pasos) es un caso de referencia documentado y replicable para estudiar ajustes de bajo coste en idiomas de bajos recursos.
- Generación de datos sintéticos en Banglish: puede usarse para producir diálogos etiquetados por emoción que alimenten posteriores entrenamientos, dado que su salida ya sigue un formato consistente.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son la pérdida de validación sobre el dataset cupcake-liltii. No son resultados verificados de forma independiente ni cubren tareas estándar como MMLU, HumanEval o GSM8K.

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| eval_loss | cupcake-liltii (validación) | 1,610 | No (declarado por el autor) |

Progresión declarada de la pérdida de evaluación por época:

| Epoca | eval_loss |
|---|---|
| 1 | 2,758 |
| 2 | 1,754 |
| 3 | 1,610 |

No se han publicado resultados de benchmarks en la información disponible, aparte de la pérdida de validación anterior.

## Requisitos de hardware

- VRAM para inferencia en fp16: alrededor de 1 GB solo para los pesos (988 MB) más la caché KV. Para la arquitectura declarada (24 capas, 2 cabezas KV, head dim 64) la caché ocupa unos 12 KB por token en fp16, es decir, aproximadamente 384 MiB si se agota la ventana de 32.768 tokens. En la práctica, con prompts cortos el consumo total se mantiene por debajo de 2 GB. Esta cifra es una estimación derivada de los datos de arquitectura, no un dato publicado.
- VRAM con GGUF Q4_0: en torno a 0,3-0,6 GB según longitud de contexto. Cabe sobradamente en cualquier GPU de consumo, incluida una GTX 1650 de 4 GB.
- GPU recomendadas: ninguna en particular, dado el tamaño. Cualquier GPU con más de 4 GB sirve para fp16, y el modelo se puede ejecutar en CPU sin dificultad. Se entrenó en una Tesla T4 de 16 GB, y para reentrenar LoRA ese es un objetivo realista.
- Viabilidad en hardware de consumo: sí, en la práctica totalidad de tarjetas de consumo y en teléfonos de gama media con el quant Q4_0. El autor afirma que el modelo es "suficientemente pequeño para un teléfono de gama media".
- Opciones de despliegue: Transformers con safetensors, llama.cpp (el autor incluye un ejemplo con `llama-cli`), Ollama a partir del GGUF y text-generation-inference, ya que el repositorio está etiquetado como `endpoints_compatible` y `text-generation-inference`. vLLM es viable por ser una arquitectura Qwen2 estándar, aunque no está mencionado en la documentación del modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia, ni en GPU ni en CPU ni en dispositivo móvil.

## Comparativa con modelos similares

Los valores de esta tabla para los modelos alternativos provienen de la documentación pública habitual de cada uno y no han sido verificados en esta ficha; solo los de liltii proceden del repositorio analizado.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| liltii-v0.2-qwen2.5-0.5b | 494 M | 32.768 | Apache-2.0 | Persona companion en bengalí/Banglish con etiquetas de emoción, ajuste QLoRA | HuggingFace, safetensors y GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | ~495 M | 32.768 | Apache-2.0 | Asistente de propósito general multilingüe | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 | Apache-2.0 | Asistente de propósito general, mayor capacidad de razonamiento | HuggingFace |
| SmolLM2-360M-Instruct | ~362 M | 8.192 | Apache-2.0 | Asistente pequeño orientado a inglés y despliegue en el borde | HuggingFace |

El punto diferencial de liltii no es el rendimiento bruto, sino la especialización: frente a los asistentes generalistas de tamaño similar, ofrece un formato de salida estructurado (emoción más acción) y cobertura de bengalí coloquial, a cambio de renunciar por completo a tareas factuales, de código o matemáticas.

## Limitaciones y advertencias

- El modelo se entrenó con un conjunto sintético o aumentado de 4.000 muestras de chat Banglish; sus respuestas son a menudo no gramaticales y mezclan bengalí e inglés. Deben tratarse como estilo, no como bengalí correcto.
- Puede reproducir jerga o estereotipos presentes en los datos de entrenamiento. No se documenta ningún análisis de sesgos.
- No ha pasado por ninguna etapa de RLHF ni de DPO. El autor advierte explícitamente de que no debe desplegarse ante usuarios finales sin un filtro de salida en el lado del anfitrión.
- Las etiquetas de emoción son una convención del dataset, no la salida de un clasificador de afecto fiable. No deben usarse para inferir el estado emocional real del usuario.
- Riesgo de alucinación alto fuera de su dominio: la propia model card excluye el QA factual, la programación, las matemáticas, la traducción y cualquier uso de alto riesgo (médico, legal, financiero o de seguridad crítica).
- Está ajustado para turnos cortos y casuales; no es adecuado para generación de texto largo. Su longitud máxima de entrenamiento fue de 2048 tokens, muy por debajo de la ventana de contexto de 32.768 que hereda de la base, por lo que el comportamiento más allá de esa longitud no está validado.
- Cobertura lingüística limitada a bengalí, inglés y Banglish. El castellano no está soportado.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene conservar los avisos de atribución correspondientes.
- El repositorio tiene cero descargas y cero valoraciones en el momento de la consulta, y el único resultado de evaluación es una pérdida declarada por el propio autor y no verificada. No existe validación externa.
- La model card recomienda mantener `temperature` entre 0,7 y 0,9, usar el quant Q4_0 en dispositivos móviles y acompañar siempre el despliegue de un filtro de seguridad en el anfitrión, indicando además al usuario que las respuestas las genera un modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bayazidhs04/liltii-v0.2-qwen2.5-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/bayazidhs04/cupcake-liltii
- Perfil del autor: https://huggingface.co/bayazidhs04
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a contenidos sin relación con el proyecto y se han descartado. No se han encontrado paper, blog técnico, repositorio de código ni demo asociados.
