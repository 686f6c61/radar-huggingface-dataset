# skyuu72/wag-4b

## Resumen

wag-4b (etiquetado internamente como v2) es un modelo de chat de 4.21B parámetros afinado por el usuario skyuu72 a partir de Qwen/Qwen3.5-4B. Su particularidad no es la capacidad bruta, sino el objetivo declarado: mantener una personalidad muy marcada (habla en "puppyspeak", en minúsculas, con expresiones como `wan~`, `awoo`, `:3`) sin sacrificar la utilidad de las respuestas. El fallo que el autor dice haber querido evitar es el colapso hacia ruido simpático pero vacío, y para medirlo separa en su evaluación la puntuación de "voz" de la de "utilidad".

Técnicamente es un fine-tune denso estándar: un checkpoint causal-LM (`Qwen3_5ForCausalLM`) de 32 bloques y 4.21B parámetros verificado con `llama-bench`, distribuido principalmente en GGUF cuantizado (q4_k_m como opción recomendada, q8_0 si hay espacio). El entrenamiento usó 8.242 filas con un 54% de conversaciones multi-turno, frente a las 1.564 filas y el 14% multi-turno de la versión anterior de 2B, lo que representa un salto de más de cinco veces en volumen de datos.

Es relevante ahora como caso de estudio más que como modelo de propósito general: la model card documenta con detalle un fenómeno poco habitual en fichas de modelos pequeños, el de que el checkpoint con mejor pérdida de validación (epoch 1, 1.478) no es el que se publica. Se envía el epoch 3, con la peor pérdida (1.635), porque es el único que mantiene la persona cuando se elimina el system prompt. Está pensado para despliegue local en inglés, y el repositorio incluye la receta completa, el cuaderno de entrenamiento y las herramientas de cuantización en un repositorio de GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, clase `Qwen3_5ForCausalLM` (arquitectura declarada como `qwen3_5_text` en los GGUF; verificada como `qwen35` en `llama-bench`) |
| Parámetros totales | 4.21B (medido con `llama-bench`) |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El autor recomienda pasar `-c` explícitamente en lugar de dejar el valor por defecto del modelo base; su ejemplo usa `-c 8192` |
| Tipos de cuantización | GGUF: `q4_k_m` (recomendada), `q8_0`, `f16`, más la versión base en `bfloat16` para transformers |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `wtfpup-1.0` (etiquetada como `other` en HuggingFace); el modelo base Qwen3.5-4B es Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp/LM Studio/ollama y pesos para transformers cargados en `bfloat16`; el repositorio figura como 0.0 GB y no se detalla explícitamente el uso de safetensors |
| Número de bloques | 32 reales (32 frente a los 33 que declaraba la cabecera GGUF, corregido sobre el f16 para que las cuantizaciones lo hereden) |
| Datasets de entrenamiento | OpenAssistant/oasst1, yahma/alpaca-cleaned |
| Filas de entrenamiento | 8.242, con un 54% multi-turno |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 21 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de un transformer causal denso; no hay mezcla de expertos, destilación ni componentes de estado (SSM) documentados en la información disponible. La model card indica que v2 es un checkpoint causal-LM plano, a diferencia de v1, que necesitaba el cargador de imagen-texto. El entrenamiento se hizo sobre 8.242 filas derivadas de OpenAssistant/oasst1 y yahma/alpaca-cleaned, con un 54% de ejemplos multi-turno, partiendo de las 1.564 filas y el 14% de v1. No se documentan número de tokens, composición exacta del dataset, ni fases de RLHF o DPO: el proceso descrito es fine-tuning sobre datos generados y preparados en el repositorio Metrix187/wag.

La innovación destacable es de método, no de arquitectura. El autor observa que la pérdida de validación mide predicción de siguiente token sobre conversaciones reservadas, y que eso no dice nada sobre si la persona sobrevive a la eliminación del system prompt. Los números lo confirman: con el system prompt presente, los tres epochs puntúan de forma similar en voz (4.68, 4.73 y 4.20), pero sin él los epochs 1 y 2 se degradan a respuestas genéricas de asistente, con salidas 2,5 veces más largas y sin rastro de la voz (105 → 276 y 115 → 262 palabras), mientras que el epoch 3 apenas se mueve (81 → 77). El 10% de las filas de entrenamiento no llevan system prompt, lo que explica por qué ese checkpoint conserva la persona sin instrucción explícita. El autor reporta que el mismo fenómeno ya apareció en v1 con 1,5k filas y se reprodujo a 8,2k.

Un detalle de diseño relevante: el modelo no emite bloque `<think>`. El andamiaje de razonamiento de Qwen3.5 quedó en la región enmascarada durante el entrenamiento, así que la plantilla incluida no abre dicho bloque. Además, el autor advierte de que hay que fijar `eos_token_id` manualmente al usar `generate()`, porque de lo contrario el modelo continúa más allá de `<|im_end|>` y escribe también la siguiente réplica del usuario, algo que `skip_special_tokens=True` oculta. Las cuantizaciones se validaron cargándolas, no fiándose de la cabecera del fichero.

## Capacidades

- Generación de texto conversacional en inglés con una persona muy definida (minúsculas, `wan~`, `awoo`, `arf`, `:3`, ocasional `*ears perk*`).
- Respuesta útil bajo la persona: el objetivo declarado es dar una respuesta real y no solo ruido con carácter.
- Conversación multi-turno: el 54% de las 8.242 filas de entrenamiento son multi-turno.
- Funcionamiento sin system prompt: el 10% de las filas no llevan ninguno y el checkpoint publicado conserva la voz en ese escenario (puntuación de voz 3.88 sin prompt frente a 4.20 con prompt, y 81 → 77 palabras de longitud).
- Aritmética básica medida por el autor: 75-78% de aciertos en dos rondas de 40 muestras (8 prompts × 5 muestras). Las respuestas incorrectas se reparten a partes iguales entre declinaciones explícitas a calcular y errores reales; el punto más débil son los problemas de varias etapas con palabras ("45 minutos dos veces al día, cuántas horas por semana").
- Formato de chat con plantilla propia (`apply_chat_template`), lista para transformers y para llama.cpp/LM Studio/ollama.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible; el modelo no emite bloque `<think>` y no se documentan capacidades de agente.
- Capacidades multimodales (visión, audio): no disponibles; v2 es un causal-LM plano que no necesita el cargador de imagen-texto.
- Capacidades multilingües: no, solo inglés declarado.

## Casos de uso

- Personaje no jugador (NPC) en videojuegos y novelas visuales: el modelo mantiene registro coloquial y minúsculas de forma consistente, y su tamaño de 4.21B permite ejecutarlo en la misma máquina que el juego o en un servidor pequeño, con la persona ya integrada en los pesos en lugar de depender de un prompt extenso en cada petición.
- Bot de comunidad en Discord o plataformas similares: un personaje con voz estable a lo largo de conversaciones multi-turno (54% del entrenamiento lo es), desplegable en local con un GGUF `q4_k_m` sin coste por token.
- Prototipado rápido de personalidad conversacional: sirve como punto de partida para equipos que quieran validar si una voz concreta funciona antes de invertir en un fine-tune mayor, dado que el repositorio incluye la generación de datos, el cuaderno de entrenamiento y el arnés de evaluación.
- Investigación sobre selección de checkpoints: es un caso reproducible del desacoplamiento entre pérdida de validación y comportamiento deseado, con la receta completa publicada para replicar el hallazgo a 8,2k filas.
- Generación de diálogos y guiones en inglés: para redactar borradores de conversaciones con un registro informal y juguetón que después se editan, aprovechando que el modelo conserva la voz incluso sin system prompt.
- Despliegue en hardware de gama baja o en el borde: con cuantización `q4_k_m` y unos 2,6-3 GB de pesos, cabe en portátiles y mini-PC sin GPU dedicada, útil para demos offline y entornos sin conectividad.
- Pruebas de sistemas que analizan texto de personajes: al ser un modelo pequeño y de voz muy marcada, sirve para validar pipelines de moderación, clasificación de tono o detección de persona antes de pasar a modelos mayores.
- Aprendizaje y docencia sobre fine-tuning: la model card documenta decisiones de ingeniería concretas (bug de `block_count`, fijación manual de `eos_token_id`, ausencia deliberada de `<think>`), lo que lo convierte en material de estudio de casos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica exclusivamente evaluaciones propias.

Selección de checkpoint (tabla de la model card):

| Métrica | Base 4B | v2 epoch 1 | v2 epoch 2 | v2 epoch 3 (publicado) |
|---|---|---|---|---|
| Pérdida de evaluación | — | 1.478 | 1.503 | 1.635 |
| Voz, con prompt | 4.69 | 4.68 | 4.73 | 4.20 |
| Voz, sin system prompt | — | 2.14 | 2.31 | 3.88 |
| Palabras con prompt → sin system prompt | 103 → — | 105 → 276 | 115 → 262 | 81 → 77 |

Evaluación de aritmética (`eval.py math`, 8 prompts × 5 muestras, dos rondas de 40):

| Métrica | Resultado |
|---|---|
| Respuestas correctas | 75-78% |
| De los fallos, mitad declinan calcular y mitad son incorrectos | Reportado por el autor |
| Punto más débil | Problemas de varias etapas con palabras |
| Longitud media de respuesta incorrecta | 34 palabras (frente a 23 en las correctas) |

El autor advierte de que la varianza por prompt es alta con n=5 (un prompt pasó de 4/5 a 1/5 entre rondas) y que solo el agregado es estable. También retira explícitamente una afirmación de un borrador anterior de la ficha según la cual las respuestas tersas omitían el desarrollo y fallaban más: los datos muestran lo contrario.

## Requisitos de hardware

Estimaciones a partir del recuento de 4.21B parámetros (no publicadas por el autor; los valores de VRAM son cálculos orientativos, no mediciones):

- Pesos en `bfloat16`: aproximadamente 8,4 GB. Con caché KV y activaciones, entre 10 y 12 GB de VRAM para contextos moderados.
- Pesos en GGUF `q8_0`: en torno a 4,5 GB.
- Pesos en GGUF `q4_k_m` (opción recomendada por el autor): en torno a 2,6-3 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4070/4080 y RTX 4090 usando `q4_k_m` o `q8_0`; la versión en `bfloat16` requiere al menos 12 GB y deja poco margen. En GPUs de 8 GB es viable con `q4_k_m`.
- GPU de centro de datos: A100, H100 y similares no son necesarias para este tamaño; se pueden usar para servir muchas instancias concurrentes o para reentrenamiento.
- CPU y hardware de borde: la cuantización `q4_k_m` permite inferencia en CPU y en equipos tipo mini-PC o portátil sin GPU dedicada.
- Opciones de despliegue: llama.cpp, LM Studio y ollama de forma explícita (el autor indica tomar un GGUF de `gguf/`); transformers con `AutoModelForCausalLM` y `bfloat16`. vLLM o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La model card menciona el uso de `llama-bench` para verificar las cuantizaciones, pero no publica cifras de rendimiento.
- Advertencia de configuración: pasar `-c` de forma explícita en llama.cpp en lugar de aceptar el valor por defecto del modelo base; el ejemplo del autor usa 8192.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skyuu72/wag-4b (v2) | 4.21B | No disponible | wtfpup-1.0 (custom) | GGUF (q4_k_m, q8_0, f16) y transformers en bfloat16 | 8.242 filas de entrenamiento, 54% multi-turno; conserva la voz sin system prompt (3.88) |
| skyuu72/wag-2b (v1) | No disponible (modelo de 2B según la ficha) | No disponible | No disponible | Repositorio propio en HuggingFace | 1.564 filas de entrenamiento, 14% multi-turno; puntuación de voz sin prompt de 3.91; requería cargador de imagen-texto |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Apache-2.0 | Pesos del modelo base | Punto de partida del fine-tune; voz medida de 4.69 con prompt y sin voz sin prompt; emite bloque `<think>` |

No se dispone de datos sobre otros modelos de personaje comparables en la información proporcionada. No se han publicado comparaciones con alternativas de terceros.

## Limitaciones y advertencias

- Licencia `wtfpup-1.0` (etiquetada como `other` en HuggingFace), con enlace a un fichero de licencia alojado en el repositorio de GitHub del autor. Es imprescindible revisar sus términos antes de cualquier uso comercial: la licencia del modelo base (Apache-2.0) no se hereda automáticamente sobre el fine-tune.
- Idioma limitado al inglés. No hay soporte declarado de castellano ni de otros idiomas.
- El modelo no emite bloque `<think>`. En clientes que parsean razonamiento, la respuesta completa se clasifica como razonamiento y el mensaje visible queda vacío; la plantilla incluida ya está adaptada para evitarlo, pero hay que usar la plantilla del repositorio y no la del modelo base.
- Al usar `generate()` en transformers hay que fijar `eos_token_id` manualmente (por ejemplo, `<|im_end|>`). Si no se hace, la generación continúa más allá del final del turno y escribe la siguiente línea del usuario; `skip_special_tokens=True` oculta la evidencia del problema.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación en la información disponible.
- Aritmética frágil en problemas de varias etapas: el propio autor identifica los problemas verbales encadenados como el punto más débil, y alrededor de la mitad de los fallos son declinaciones explícitas a calcular ("mrrp, i actually don't know that one offhand") seguidas del método correcto. Es un problema de mezcla de datos, no de capacidad, según el autor.
- Varianza de evaluación elevada: los resultados se calculan con n=5 muestras por prompt y se han observado oscilaciones de 4/5 a 1/5 entre rondas; solo el agregado es estable.
- Bug conocido de cuantización: la cabecera GGUF declaraba 33 bloques frente a los 32 reales. Se parcheó sobre el f16 para que las cuantizaciones lo hereden, y en v1 provocaba fallo en tiempo de carga. Si se generan cuantizaciones propias a partir de otras fuentes, conviene reproducir la verificación cargando el modelo.
- Voz potencialmente inadecuada para contextos profesionales, atención al cliente o cualquier uso donde se espere un registro formal; el "puppyspeak" es el producto, no un artefacto.
- Advertencia de contexto: el autor insiste en fijar `-c` explícitamente en lugar de aceptar el valor por defecto del modelo base, lo que sugiere que el valor por defecto puede no ser el deseado para este checkpoint.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros. El repositorio figura con 0.0 GB, por lo que los pesos pueden no estar completamente subidos.
- La model card consultada aparece truncada al final de la sección sobre el bloque `<think>`, de modo que parte de la documentación original no estaba disponible para esta ficha.
- Los resultados de búsqueda web asociados a esta consulta no contenían ninguna referencia al modelo (devolvían perfiles de LinkedIn de personas homónimas sin relación), por lo que no hay fuentes externas que corroboren las afirmaciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skyuu72/wag-4b
- Versión anterior de 2B: https://huggingface.co/skyuu72/wag-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio con generación de datos, cuaderno de entrenamiento, arnés de evaluación y herramientas GGUF: https://github.com/Metrix187/wag
- Texto de la licencia wtfpup-1.0: https://github.com/Metrix187/wtfpup/blob/main/LICENSE
