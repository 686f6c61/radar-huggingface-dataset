# dbishwarup/TagoreGPT-29M

## Resumen

TagoreGPT-29M es un modelo de lenguaje de 29 millones de parámetros entrenado desde cero para generar texto en el estilo de Rabindranath Tagore (1861-1941), escritor bengalí y premio Nobel de Literatura en 1913. Lo desarrolla el usuario independiente dbishwarup y se publica como versión preliminar (preview) el 11 de noviembre de 2026. El modelo escribe poemas, canciones, relatos, cartas, ensayos y obras teatrales en bengalí o en inglés, pero no funciona como asistente conversacional: no responde preguntas, no explica ni traduce.

La arquitectura sigue el esquema Llama (8 capas, anchura 512, 8 cabezas, SwiGLU de 1344, embeddings atados y posiciones rotatorias) con un vocabulario SentencePiece de 8.000 piezas. La ventana de contexto es muy reducida, de unos 512 tokens (aproximadamente 1.600 caracteres), lo que limita la coherencia en textos largos. Se distribuye en safetensors y en GGUF (F16, 58 MB), lo que permite ejecutarlo en CPU o en GPU de gama baja.

Su relevancia es acotada pero clara: demuestra que es posible entrenar un modelo de imitación estilística literaria desde un portátil, con un corpus bilingüe de dominio público y un pipeline de dos fases. Resulta útil como banco de pruebas para experimentos de generación creativa de bajo coste y para estudiar el comportamiento de modelos minúsculos en tareas de estilo, no como herramienta de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (8 capas, anchura 512, 8 cabezas, SwiGLU 1344, posiciones rotatorias, embeddings atados) |
| Parametros totales | 29.008.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | aproximadamente 512 tokens (~1.600 caracteres) |
| Tipos de cuantizacion | GGUF F16 publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | bengalí (bn) e inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con disposición Llama: 8 capas, dimensión oculta de 512, 8 cabezas de atención, feed-forward SwiGLU con dimensión intermedia 1344, codificación posicional rotatoria y proyección de salida atada a los embeddings de entrada. El tokenizador es SentencePiece con 8.000 piezas que cubren bengalí e inglés.

El entrenamiento se organiza en dos fases. La fase 1 (warm-up) mezcla textos de otros autores bengalíes extraídos de Wikisource en bengalí (con Tagore eliminado), literatura inglesa del siglo XIX de Project Gutenberg y obra de Tagore. La fase 2 se restringe exclusivamente a Tagore: escaneos bengalíes de la Digital Library of India e Internet Archive y textos ingleses de Project Gutenberg. Cada fragmento de entrenamiento comienza con etiquetas ocultas (idioma, tipo de texto, autor) y mantiene el título a la vista, un mecanismo pensado para que las piezas largas no pierdan el tema. Los pesos publicados corresponden al paso 49 de entrenamiento, con pérdidas sobre texto no visto de 4,789 por pieza en inglés y 6,105 en bengalí. El autor indica que una versión mejorada, con datos más limpios, mayor memoria y relatos de práctica, está en entrenamiento.

## Capacidades

- Generación de poemas, canciones, relatos, cartas, ensayos y obras teatrales en bengalí o en inglés, imitando el registro y el estilo de Tagore.
- Plantilla de chat propia con marcadores `<|request|>` y `<|response|>` que envuelve la petición del usuario.
- Generación condicionada por etiquetas internas de idioma, tipo de texto y autor, y por el título del fragmento.
- Capacidad multilingüe limitada a bengalí e inglés.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No responde preguntas, no explica conceptos ni traduce; su única función es escribir texto creativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Generación de poesía y canciones en bengalí: el modelo produce versos con la plantilla `<|request|>…<|response|>` y parámetros de muestreo ajustados (temperatura 0,8, top-k 40, penalización de repetición 1,15), adecuado para prototipos de aplicaciones literarias en bengalí.
- Composición de cartas y ensayos breves en inglés: útil para generar borradores estilizados de menos de 400 tokens, donde la ventana de contexto de 512 tokens no penaliza la coherencia.
- Demostración educativa de entrenamiento de modelos: sirve para ilustrar en cursos y talleres cómo se construye un modelo desde cero con corpus de dominio público y un pipeline de dos fases.
- Investigación sobre imitación de estilo: permite estudiar cómo un modelo de 29M captura el registro de un autor concreto y comparar estrategias de condicionamiento por etiquetas y título.
- Generación creativa asistida en local: con el GGUF F16 de 58 MB se puede ejecutar en llama.cpp, LM Studio u Ollama en un portátil sin GPU, útil para escribir variaciones de un mismo tema.
- Pruebas de robustez y alucinación en modelos pequeños: su tendencia a derivar en textos largos y a repetir sin penalización lo convierte en un banco de pruebas para técnicas de decodificación y control de repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas sobre texto no visto por pieza de vocabulario: 4,789 para tagore_en y 6,105 para tagore_bn.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en F16 (58 MB de pesos GGUF más memoria de contexto y activaciones); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con al menos 1-2 GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3050, RTX 4090, GTX 1660, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -m tagoregpt-29m-f16.gguf -cnv --temp 0.8 --top-k 40`), Ollama (creando un Modelfile), LM Studio (con Repeat Penalty 1.15) y Transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TagoreGPT-29M | 29,0M | ~512 tokens | bn, en | CC BY-SA 4.0 | Hugging Face (safetensors, GGUF) |
| Modelos de imitación estilística de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos multilingües pequeños de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (imitación estilística literaria en bengalí con 29M de parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un chatbot: no responde preguntas, no explica, no traduce ni mantiene conversaciones multi-turno.
- Los temas indicados en inglés para una pieza en bengalí no se traducen fuera de la aplicación TagoreGPT.
- Ventana de contexto de aproximadamente 512 tokens: las piezas largas pueden desviarse del tema o perder coherencia.
- Sin penalización de repetición (1,15 sobre los últimos 256 tokens) el modelo puede entrar en bucles.
- Calidad irregular: las líneas pueden ser hermosas o carecer de sentido; es una imitación de estilo, nunca palabras reales de Tagore.
- Riesgo de alucinación y de atribución falsa: el texto generado no debe presentarse como obra auténtica del autor.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; el texto de calentamiento en bengalí proviene de Wikisource bajo CC BY-SA 4.0.
- Sesgos: al entrenarse con literatura del siglo XIX y principios del XX, puede reproducir estereotipos de género, clase y coloniales propios de la época.
- Versión preliminar: el autor advierte de que una versión mejorada reemplazará estos archivos, por lo que no es recomendable fijar esta revisión en producción a largo plazo.
- Cobertura lingüística limitada a bengalí e inglés; no se ha evaluado su comportamiento en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbishwarup/TagoreGPT-29M
- Demo en Spaces: https://huggingface.co/spaces/dbishwarup/TagoreGPT
