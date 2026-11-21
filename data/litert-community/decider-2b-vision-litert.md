# litert-community/decider-2b-vision-LiteRT

## Resumen

decider-2b-vision-LiteRT es una conversión de terceros al formato LiteRT-LM del modelo Mapika/decider-2b-vision, un modelo de decisión multimodal de 2.000 millones de parámetros derivado de Qwen3.5-2B. A diferencia de un modelo generativo convencional, no produce texto libre: recibe una imagen y una pregunta con opciones etiquetadas con letras, y devuelve una distribución de probabilidad sobre cada opción leyendo los logits de las letras en una posición de respuesta fija. Está pensado para agentes que necesitan seleccionar acciones discretas (por ejemplo, control de un paddle en Pong) con confianza calibrada.

El modelo combina un decodificador híbrido de 24 capas (18 de atención lineal gated-delta y 6 de atención completa) con un codificador visual de 24 bloques y un merger 2×2 que comprime una imagen de 256×256 en 64 tokens. Esta conversión, publicada por litert-community, mantiene los pesos y el tokenizador del modelo original y solo cambia el formato de empaquetado, ofreciendo tres variantes (fp16, fp16 con vocabulario int8 e int8 completo) optimizadas para CPU, GPU de escritorio y móviles.

Su relevancia actual radica en que demuestra un patrón poco habitual: modelos pequeños especializados en decisión estructurada con salida probabilística, desplegables en dispositivos móviles mediante LiteRT-LM. La licencia Apache 2.0 y la disponibilidad de artefactos verificables con SHA-256 lo hacen apto para integración en producción, aunque con matices importantes de precisión según el backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con decodificador de 24 capas (18 gated-delta linear attention + 6 full attention) y codificador visual de 24 bloques con merger 2×2 |
| Parametros totales | 2B (aproximado, según nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Caché de 4096 tokens; una imagen de 256×256 ocupa 64 tokens |
| Tipos de cuantizacion | fp16, fp16 con cabeza de salida int8 dinámica y embedding int8 (channelwise), int8 dinámico completo con embedding int8; codificador visual y adaptador siempre en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); tres ficheros: fp16 (5.509.356.416 B), fp16-int8vocab (4.498.210.816 B), int8 (3.171.155.968 B) |

## Arquitectura y entrenamiento

El decodificador sigue un diseño híbrido: 18 de sus 24 capas emplean gated-delta linear attention, que reduce el coste computacional frente a la atención cuadrática, y las 6 restantes usan atención completa. El codificador visual consta de 24 bloques con un merger 2×2, de modo que una imagen de 256×256 se tokeniza en 64 tokens visuales. El modelo base se construyó a partir de Qwen3.5-2B con los pesos de texto decider-2b v5, según indica la model card del repositorio de conversión.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos remiten a la model card del modelo original (Mapika/decider-2b-vision). La innovación principal no es arquitectónica sino de interfaz: el modelo lee los logits de las letras de las opciones en un slot de respuesta por pregunta y los normaliza en probabilidades, sin generar texto. El prompt usa una plantilla de identidad sin marcadores de rol, sin token de inicio y con token de parada 248044.

## Capacidades

- Decisión multimodal con salida probabilística: dada una imagen y una o varias preguntas con opciones etiquetadas, devuelve una probabilidad por opción.
- Salida estructurada determinista: no genera texto libre, lo que elimina el riesgo de respuestas mal formateadas o divagaciones.
- Procesamiento de imágenes de 256×256, tokenizadas en 64 tokens visuales.
- Soporte de múltiples preguntas por petición (cada una con su propio slot de respuesta).
- Capacidad de operar sobre frames de videojuegos y entornos visuales simples (el ejemplo publicado es Pong de Atari).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento extendido.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Control de agentes en entornos visuales discretos: seleccionar la siguiente acción (subir, bajar, quedarse) a partir de un frame, como en el ejemplo de Pong; la salida probabilística permite aplicar umbrales de confianza o políticas exploratorias.
- Automatización de pruebas de interfaz gráfica: dado un screenshot, elegir entre acciones predefinidas (pulsar botón, desplazar, esperar) con una probabilidad asociada que sirve de señal de fiabilidad.
- Clasificación visual guiada por lenguaje: plantear preguntas cerradas sobre una imagen ("¿qué objeto se muestra?", "¿qué estado tiene?") y obtener una distribución sobre las opciones en lugar de una respuesta textual.
- Sistemas de decisión en el borde (edge): el fichero int8 de 3,17 GB está probado en un Galaxy S26, lo que permite ejecutar decisiones visuales en el propio dispositivo sin enviar imágenes a la nube.
- Enrutamiento y triaje multimodal: usar la confianza por opción para decidir si un caso se resuelve automáticamente o se escala a un modelo mayor o a un humano.
- Investigación en calibración de modelos de decisión: la disponibilidad de tres cuantizaciones con lecturas de referencia y comparación de desviaciones (max |Δp|) facilita estudiar el impacto de la cuantización en las probabilidades.
- Selección de acciones en robótica sencilla o simulación: elegir entre un conjunto discreto de comandos motores a partir de la observación visual, con probabilidad como medida de incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí reporta mediciones de fidelidad frente al modelo original en fp32 sobre el frame publicado de Pong (pregunta "What should you do right now?" con tres opciones):

| Variante / backend | Coincidencia de respuesta | max abs(delta p) | p95 abs(delta p) |
|---|---|---|---|
| fp16 / fp16-int8vocab (Mac CPU, lectura de referencia) | misma probabilidad 0,99986 a cinco dígitos | no disponible | no disponible |
| fp16-int8vocab (Mac GPU, Metal) | no disponible | 0,0085 | no disponible |
| int8 (Mac GPU, Metal, un chunk por slot) | 52/53 | 0,032 | 0,011 |
| int8 (CPU, cuantización dinámica de activaciones) | 51/53 | 0,429 | 0,164 |
| int8 (CPU, un chunk rellenado) | no disponible | 0,233 | no disponible |
| int8 (Galaxy S26, CPU y GPU) | primera letra correcta en 6/6 filas | no medido (el runtime devuelve solo texto) | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: fp16 requiere 5,51 GB de pesos, pero XNNPACK los expande a fp32 (7,5 GB) en CPU; la caché de CPU de LiteRT-LM ocupa 7.540.052.280 B para el decodificador fp16, 6.016.360.768 B para fp16-int8vocab y 1.896.902.288 B para int8, más 1.312.687.576 B del codificador visual y adaptador.
- GPU de escritorio: la variante fp16-int8vocab alcanza un pico de RSS de 7,0 GB en GPU de Mac frente a 15,6 GB del fp16, aproximadamente la mitad de memoria.
- Móvil: el fichero int8 (3,17 GB) está probado en un Galaxy S26 con CPU y GPU; el fp16-int8vocab no cupo en la GPU del S26.
- Consumer GPU: no se documentan pruebas en RTX 4090 ni similares; los datos disponibles son de Apple M4 Max (CPU y GPU Metal) y Galaxy S26.
- Despliegue: LiteRT-LM 0.17.1 (Mac, CPU y GPU) y LiteRT-LM v0.16.0 (Galaxy S26). La lectura de referencia requiere ai-edge-litert 2.2.0, numpy, Pillow y tokenizers, sin torch ni transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| decider-2b-vision-LiteRT | 2B | 4096 tokens, imagen 256×256 en 64 tokens | Probabilidades sobre opciones (sin texto) | en | apache-2.0 | .litertlm |
| Mapika/decider-2b-vision (original) | 2B | no disponible | Probabilidades sobre opciones | en | no disponible en la información | safetensors (presumible, no confirmado) |
| Qwen3.5-2B-Base (modelo de partida) | 2B | no disponible | Texto generativo | no disponible | no disponible en la información | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría (modelos de decisión visual con salida probabilística), por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo inglés: el tokenizador y los prompts de entrenamiento están en inglés; no se garantiza comportamiento correcto en castellano.
- No es un modelo generativo: no produce explicaciones ni texto; solo probabilidades sobre opciones predefinidas. No sirve para diálogo abierto ni para tareas fuera de la selección entre alternativas.
- Sensibilidad a la cuantización en CPU: la variante int8 con cuantización dinámica de activaciones desvía hasta 0,429 en probabilidad respecto al original y depende de cómo se fragmenta el prompt en chunks de prefill, lo que puede alterar decisiones en producción.
- Resolución de imagen fija de 256×256 y una sola imagen por petición; detalles finos pueden perderse tras el merger 2×2.
- En móvil, el runtime devuelve solo texto y no expone las probabilidades, lo que limita el uso de la confianza calibrada en esos dispositivos.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de asignar alta confianza a opciones incorrectas si la imagen o la pregunta difieren de la distribución de entrenamiento.
- Sesgos: no documentados en la información disponible; al derivar de Qwen3.5-2B y entrenarse sobre frames de juegos, cabe esperar un dominio estrecho.
- Licencia Apache 2.0 permite uso comercial, pero la model card del modelo base debe consultarse para condiciones adicionales de los pesos originales.
- El repositorio ocupa 20,8 GB y las cachés de LiteRT-LM en disco pueden superar los 7,5 GB por fichero; conviene planificar el almacenamiento en despliegues embebidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/decider-2b-vision-LiteRT
- Modelo base: https://huggingface.co/Mapika/decider-2b-vision
- Modelo de partida textual: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Checksums: https://huggingface.co/litert-community/decider-2b-vision-LiteRT/blob/main/SHA256SUMS
- Petición de ejemplo: https://huggingface.co/litert-community/decider-2b-vision-LiteRT/blob/main/reference/example_request.json
- Script de lectura de referencia: https://huggingface.co/litert-community/decider-2b-vision-LiteRT/blob/main/reference/decider_litert.py
