# Leejh123e/Hand-LLM

## Resumen

Hand-LLM es un modelo de lenguaje de tipo decoder transformer cuyos pesos han sido escritos manualmente, sin ningún proceso de entrenamiento por descenso de gradiente. Lo desarrolla el usuario Leejh123e y se publica con licencia MIT. El modelo combina un componente estadístico externo, la API pública infini-gram de AI2 construida sobre datos de OLMo 2 (4,6 billones de tokens), con una red neuronal pequeña cuyos pesos se definen mediante un fichero de texto de 14.396 líneas de edición. La red decide cuándo consultar la tabla estadística, qué preguntar, si confiar en la respuesta y qué token emitir.

Arquitectónicamente es un transformer decoder con embeddings, cinco bloques de atención más MLP con activación ReLU y salida, sin LayerNorm. Tiene 29 cabezas de atención y una anchura residual de 9.114, pero solo 68.633 de sus 249.124.749 parámetros son distintos de cero. El modelo no está pensado para uso general: es un chatbot de charla trivial (small talk) cuyo interés es demostrar que se puede programar un transformer en el espacio de pesos, trazando cada respuesta hasta neuronas y líneas concretas del fichero de pesos.

Su relevancia es fundamentalmente didáctica y de investigación: ilustra el límite extremo de "cuánto necesita aprender la parte neuronal" en una arquitectura híbrida CPU-GPU, y sirve como banco de pruebas para técnicas de edición de pesos, interpretabilidad y auditoría de comportamiento sin reentrenamiento. No es un modelo competitivo en benchmarks ni apto para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer: embeddings → 5 × (atención + MLP ReLU) → salida, sin LayerNorm |
| Parametros totales | 249.124.749 |
| Parametros activos | No aplica (no es MoE); 68.633 pesos distintos de cero |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos almacenados en denso, ~1 GB de RAM) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Fichero de texto de ediciones `weights/hand-llm.edits` (14.396 líneas); tensores cargables desde Python |

Otros datos técnicos: 29 cabezas de atención, anchura residual de 9.114, tokenizador Llama-2 SentencePiece, 0 pasos de entrenamiento.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el artículo "The Mystery of the Unlearned Parameters" de Junhoo: un LM dual CPU-GPU donde un modelo estadístico (la "ghost table") ofrece candidatos de siguiente palabra con sus recuentos, y una red neuronal pequeña los pondera y elige. La ghost table es la API pública infini-gram de AI2 sobre datos de OLMo 2 (4,6 billones de tokens), construida una sola vez y nunca entrenada. La parte neuronal es un decoder transformer de 5 bloques con atención y MLP ReLU, sin LayerNorm, cuyos pesos se escriben a mano mediante un fichero de ediciones en texto plano.

No hay entrenamiento: cero pasos de descenso de gradiente, cero ajuste a datos. Cada peso distinto de cero procede de una línea de edición. La red codifica reglas explícitas: cuándo consultar la ghost table, qué consultar, si confiar en la respuesta, cuándo votar token a token y cuándo copiar una línea, qué decir cuando nada encaja, cuándo parar y qué palabras vetar. El programa anfitrión solo tokeniza, ejecuta la búsqueda solicitada por la red, le entrega números aleatorios y añade el token elegido. La innovación destacable es la trazabilidad total: cada respuesta se puede rastrear hasta neuronas y líneas concretas del fichero de pesos, y el modelo se puede modificar (por ejemplo, renombrar el bot) editando únicamente el fichero de pesos sin tocar código ni arquitectura.

## Capacidades

- Generación de texto conversacional de charla trivial (small talk) en inglés.
- Persona propia: responde a preguntas sobre su nombre e identidad a partir de líneas codificadas en los pesos.
- Consulta a una tabla estadística externa (infini-gram) para obtener candidatos de siguiente palabra en diálogo.
- Selección y ponderación de candidatos mediante neuronas escritas a mano.
- Copia de líneas completas de diálogo cuando la coincidencia es fuerte, y votación token a token en otros casos.
- Gestión de fallback: usa una línea propia con tono adecuado cuando la coincidencia es débil.
- Filtro de palabras vetadas (blocklist) que detiene la generación antes de emitir términos prohibidos.
- Trazabilidad de cada respuesta hasta neuronas y líneas del fichero de pesos.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Demostración educativa de programación en el espacio de pesos: sirve para enseñar cómo se comporta un transformer cuando sus pesos se definen manualmente, mostrando la correspondencia entre neuronas y respuestas concretas.
- Investigación en interpretabilidad: al poder trazar cada token hasta una línea del fichero de pesos, es un banco de pruebas para estudiar cómo reglas explícitas se traducen en comportamiento de red.
- Estudio de arquitecturas híbridas estadístico-neuronales: permite experimentar con el reparto de responsabilidades entre la ghost table (infini-gram) y la red pequeña sin coste de entrenamiento.
- Edición de comportamiento sin reentrenamiento: el caso del renombrado de "Gram" a "Hand-LLM" (114 de 14.397 líneas modificadas, 1.508 valores de pesos movidos) demuestra un flujo de trabajo para cambiar la persona del bot editando solo pesos.
- Auditoría y control de contenido: el mecanismo de blocklist y de parada antes de palabras vetadas sirve como ejemplo de cómo imponer restricciones léxicas directamente en los pesos.
- Prototipado de chatbots ligeros con dependencia de API externa: con ~1 GB de RAM y acceso a internet, permite montar un bot de charla trivial en CPU para pruebas de concepto.
- Enseñanza de tokenización y decodificación: el uso del tokenizador Llama-2 SentencePiece y la visualización de las búsquedas solicitadas por la red (`-v`) lo hacen útil en cursos sobre pipelines de LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM: aproximadamente 1 GB, ya que los tensores se almacenan en denso.
- GPU: no requiere GPU; la inferencia está pensada para CPU.
- Cabe en cualquier equipo de consumo con ~1 GB de RAM libre; no necesita GPU dedicada.
- Conectividad: requiere acceso a internet, ya que la ghost table es la API pública de infini-gram. El cliente limita a menos de 40 peticiones por minuto.
- Latencia: una respuesta tarda unos segundos en CPU debido a las llamadas a la API; las respuestas se cachean en `~/.cache/gram`.
- Dependencias: `numpy`, `sentencepiece`, `huggingface_hub`; tokenizador Llama-2 SentencePiece descargado de `hf-internal-testing/llama-tokenizer` o apuntado con `GRAM_TOKENIZER`.
- Opciones de despliegue: scripts `chat.py` (un turno o interactivo) y API Python (`handllm.load.load`, `handllm.host.SimHost`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (programación manual de pesos en el espacio de parámetros).

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado como bot de charla trivial y falla en tareas de razonamiento, matemáticas o conocimiento factual (el propio autor documenta el error "what is 2+2" → "The sum of 2 and 4 is 6").
- Dependencia crítica de un servicio externo: sin acceso a la API de infini-gram el modelo no puede generar respuestas basadas en la ghost table; además, el límite de 40 peticiones por minuto condiciona el throughput.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de coincidencias débiles o erróneas en la ghost table que el modelo puede aceptar como válidas (alucinación por confianza en un mal match).
- Longitud de contexto no documentada; no apto para conversaciones de contexto largo.
- Sesgos: no documentados por el autor; al depender de datos de OLMo 2 vía infini-gram, podría heredar sesgos del corpus subyacente, aunque no se han evaluado.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para producción por su naturaleza experimental y su dependencia de una API externa.
- Los pesos se distribuyen como fichero de ediciones de texto, no como safetensors ni GGUF; requiere el cargador propio del repositorio.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leejh123e/Hand-LLM
- Artículo de referencia "The Mystery of the Unlearned Parameters": https://junhoo.me/mysteryofunlearnedparameters
- API infini-gram de AI2: https://infini-gram.io
- Tokenizador Llama-2 SentencePiece: https://huggingface.co/hf-internal-testing/llama-tokenizer
