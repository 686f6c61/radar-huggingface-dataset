# Felixfire/MonadGPT

## Resumen

MonadGPT es un ajuste fino (fine-tune) del modelo Mistral-7B, concretamente sobre la base de OpenHermes-2-Mistral-7B de Teknium. Lo desarrolla el usuario Felixfire y su propuesta es un experimento creativo: simular cómo habría sido un asistente conversacional si ChatGPT se hubiera inventado en el siglo XVII. Para ello se entrenó sobre 11.000 textos de la temprana Edad Moderna en inglés, francés y latín, procedentes mayoritariamente de las colecciones EEBO (Early English Books Online) y Gallica (Bibliothèque nationale de France).

El modelo conserva la arquitectura transformer decoder-only de Mistral, con 7.241.748.480 parámetros totales y un formato de pesos en safetensors. No se especifica en la información disponible la longitud de contexto, aunque al derivar de Mistral-7B es previsible que herede una ventana de 8.000 tokens (dato no confirmado en la model card). El repositorio ocupa 14,5 GB.

Su relevancia es principalmente divulgativa y de investigación sobre estilos históricos: no está pensado para producción ni para tareas de precisión, sino como demostración de ajuste de estilo y registro lingüístico sobre un modelo base moderno. El modelo responde con vocabulario, referencias científicas y cosmovisión propias del siglo XVII, incluyendo afirmaciones astronómicas y médicas hoy obsoletas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B vía OpenHermes-2-Mistral-7B) |
| Parámetros totales | 7.241.748.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Mistral-7B, sin confirmar) |
| Tipos de cuantización | GGUF disponible (versión de TheBloke); otras no disponibles |
| Idiomas soportados | inglés, francés, latín |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo externo |
| Modelo base | teknium/OpenHermes-2-Mistral-7B |
| Dataset de ajuste | Pclanglais/MonadGPT (11.000 textos históricos) |
| Pipeline | text-generation / conversational |

## Arquitectura y entrenamiento

MonadGPT es un fine-tune del transformer decoder-only Mistral-7B, partiendo del checkpoint OpenHermes-2-Mistral-7B, que ya incorpora ajuste conversacional. Sobre esa base se realizó un ajuste adicional supervisado con 11.000 textos de la temprana Edad Moderna en inglés, francés y latín, extraídos mayoritariamente de EEBO y Gallica. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de dominio: el modelo aprende el registro, la ortografía arcaica y el marco conceptual científico del siglo XVII. Esto se traduce en respuestas que emplean terminología histórica (por ejemplo, considerar el Sol y la Luna como planetas) y un estilo literario de la época. El modelo mantiene el formato de chat de OpenHermes con tokens especiales `<|im_start|>` y `<|im_end|>`, y puede usarse en modo conversacional multi-turno. Se distribuye una versión cuantizada en GGUF para llama.cpp, lo que facilita su ejecución en hardware modesto.

## Capacidades

- Generación de texto conversacional en inglés, francés y latín con registro arcaico del siglo XVII.
- Respuestas con referencias históricas y cosmovisión pre-científica (astronomía, medicina, filosofía natural).
- Composición de poesía y prosa con estilo literario de la época moderna temprana.
- Conversación multi-turno manteniendo coherencia estilística e histórica.
- Capacidad de cambiar de idioma dentro de la conversación (inglés, francés, latín).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio, thinking mode ni matemáticas avanzadas.

## Casos de uso

- Recreación histórica y divulgación: usar el modelo para generar respuestas que ilustren cómo se concebía la ciencia en el siglo XVII, útil en museos, materiales educativos o podcasts de historia.
- Escritura creativa de época: generación de diálogos, poemas o cartas con estilo moderno temprano para novelas históricas o guiones teatrales.
- Práctica y aprendizaje de latín y francés antiguo: el modelo produce texto en registro arcaico, útil para estudiantes de lenguas clásicas que quieran exponerse a variedades históricas.
- Investigación sobre estilometría y ajuste de estilo: sirve como caso de estudio de cómo un fine-tune sobre corpus históricos modifica el registro y las referencias de un modelo base moderno.
- Demostraciones y arte interactivo: instalaciones o experiencias conversacionales donde el visitante dialogue con un "chatbot del siglo XVII".
- Prototipado de personajes históricos en juegos o narrativa interactiva: el modelo puede encarnar a un erudito de la época con coherencia de vocabulario y creencias.
- Experimentos de humanidades digitales: análisis de cómo el modelo reproduce sesgos y conceptos de los textos de EEBO y Gallica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 14-15 GB, coherente con los 7.241 millones de parámetros y el tamaño del repo (14,5 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas para FP16: A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en FP16; en RTX 3060 12 GB o superiores usando cuantización de 8 o 4 bits.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-generation), llama.cpp con la versión GGUF de TheBloke, y text-generation-inference por los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MonadGPT | 7,24 B | no disponible | en, fr, la | Apache 2.0 | Estilo histórico siglo XVII |
| OpenHermes-2-Mistral-7B | 7,24 B | 8.000 (heredado de Mistral) | en (principalmente) | Apache 2.0 | Asistente conversacional general |
| Mistral-7B-v0.1 | 7,24 B | 8.000 | en | Apache 2.0 | Modelo base de propósito general |
| Zephyr-7B-beta | 7,24 B | 8.000 | en | MIT | Asistente conversacional ajustado con DPO |

MonadGPT comparte arquitectura y tamaño con OpenHermes-2-Mistral-7B y Mistral-7B, por lo que su rendimiento en tareas generales será inferior al de sus predecesores debido a la especialización estilística. Frente a Zephyr-7B-beta, MonadGPT no está orientado a instrucciones generales sino a un dominio histórico concreto. No se dispone de datos de benchmarks para comparar numéricamente.

## Limitaciones y advertencias

- El modelo reproduce deliberadamente creencias científicas obsoletas del siglo XVII (por ejemplo, considerar el Sol un planeta o la Luna influyente sobre la salud); no debe usarse para consejo médico, astronómico ni científico.
- Riesgo alto de alucinación en temas factuales: el estilo histórico prima sobre la exactitud.
- Sesgos históricos: los textos de EEBO y Gallica contienen visiones del mundo, religiosas y sociales de la época que el modelo puede reproducir.
- Cobertura lingüística limitada a inglés, francés y latín; no se documenta soporte de castellano.
- Longitud de contexto no confirmada en la model card; conviene verificar el comportamiento en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser inexacto o inapropiado para producción sin revisión humana.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No apto para tareas de código, matemáticas, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Felixfire/MonadGPT
- Modelo base: https://huggingface.co/teknium/OpenHermes-2-Mistral-7B
- Versión GGUF (TheBloke): https://huggingface.co/TheBloke/MonadGPT-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset referenciado: Pclanglais/MonadGPT (referenciado en la model card)
