# Leejh123e/WP-LLM

## Resumen

WP-LLM es un modelo de lenguaje de tipo decoder transformer cuyos pesos no han sido entrenados mediante descenso de gradiente, sino "programados" línea a línea a partir de una lista de ediciones en texto plano. Lo desarrolla el usuario Leejh123e y se publica bajo licencia MIT. El modelo es un bot conversacional de charla trivial (small talk) cuyo interés no reside en su rendimiento, sino en su enfoque: cada respuesta puede rastrearse hasta las neuronas, cabezas de atención y pesos concretos que la produjeron.

La arquitectura es un transformer decoder con embeddings, cinco bloques de atención más MLP con activación ReLU y una capa de salida, sin LayerNorm. Tiene 29 cabezas de atención y una anchura residual de 9.114 dimensiones, cada una con nombre propio en `arch.json`. De los 249.124.749 parámetros totales, solo 68.633 son distintos de cero, definidos en un fichero de 14.396 líneas de edición.

El modelo combina un LM estadístico externo (la API pública infini-gram de AI2 sobre datos de OLMo 2, con 4,6 billones de tokens) con una red neuronal pequeña cuyos pesos están programados y deciden cuándo consultar ese LM estadístico, qué preguntar, si confiar en la respuesta y cuándo detenerse. Es relevante como experimento conceptual sobre el mínimo aprendizaje necesario en una red neuronal y sobre la trazabilidad total de las decisiones de un modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder: embeddings → 5 × (atención + MLP ReLU) → salida, sin LayerNorm |
| Parámetros totales | 249.124.749 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en denso, fichero `.npz`) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) y fichero de ediciones de texto `wp-llm.edits` |

Otros datos técnicos: 29 cabezas de atención, anchura residual de 9.114, 68.633 pesos distintos de cero, 14.396 líneas de edición, 0 pasos de entrenamiento, hash sha256 de los pesos `ffccbb5eaf8c4d111ea2c3fd7537f655a83b9e19add8bb357e3d7da315412d1e`.

## Arquitectura y entrenamiento

El modelo sigue el esquema de "CPU–GPU dual LM" descrito en el artículo *The Mystery of the Unlearned Parameters*: un LM estadístico construido una sola vez a partir de un corpus ofrece candidatos de siguiente palabra con sus recuentos, y un LM neuronal pequeño los pondera y elige. En WP-LLM la parte neuronal no aprende nada: sus pesos están programados. La parte estadística ("ghost table") es la API pública infini-gram de AI2 sobre los datos de OLMo 2 (4,6 billones de tokens), que se construyó una vez y nunca se entrena.

Los pesos programados deciden cuándo consultar la ghost table y qué preguntar, si confiar en su respuesta y qué palabra tomar, cuándo generar palabra a palabra y cuándo copiar una línea completa, qué decir cuando nada encaja, cuándo parar y qué palabras no decir nunca. El programa anfitrión solo tokeniza, ejecuta la consulta que la red solicita, le entrega números aleatorios y añade el token elegido. Los pesos fueron programados por Claude, un modelo de IA, que escribió el script generador de la lista de ediciones. No hubo entrenamiento, ajuste de datos, RLHF ni DPO.

## Capacidades

- Generación de texto conversacional de charla trivial (small talk) en inglés.
- Persona definida por pesos: el bot se identifica como WP-LLM y responde sobre su propio origen.
- Chistes: los pesos escriben la apertura y la ghost table aporta el remate.
- Consulta a un LM estadístico externo (infini-gram) para obtener candidatos de siguiente palabra con recuentos.
- Trazabilidad completa: cada respuesta se puede rastrear hasta neuronas, cabezas de atención y pesos concretos.
- Lista de bloqueo de palabras implementada en los propios pesos (se detiene antes de emitir términos vetados).
- Selección de respuestas propias con coincidencia de estado de ánimo cuando la coincidencia con la ghost table es débil.
- Edición de pesos sin tocar código: el mismo motor ejecuta las versiones 1.0 y 1.2 cambiando solo el fichero de pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas fiables, visión ni audio.

## Casos de uso

- Investigación sobre programación de pesos: permite estudiar cómo se comporta una red cuyos pesos se escriben a mano, comparando el efecto de ediciones concretas sobre la salida sin reentrenar.
- Docencia sobre interpretabilidad: al tener cada dimensión residual con nombre y cada respuesta trazable, sirve para explicar cómo contribuyen neuronas y cabezas de atención a un token generado.
- Experimentos de trazabilidad en producción: útil como banco de pruebas para técnicas de auditoría de modelos donde se exige reconstruir la cadena causal completa de una respuesta.
- Prototipado de arquitecturas híbridas estadístico-neuronales: el esquema de ghost table más red pequeña se puede reutilizar para estudiar la división de trabajo entre recuperación y generación.
- Demostración de edición controlada de comportamiento: el caso de renombrar el bot de "Gram" a "WP-LLM" editando solo el fichero de pesos ilustra cómo modificar la persona sin reentrenar.
- Bot de charla trivial para entornos de prueba: con unos 1 GB de RAM y acceso a internet, puede desplegarse en una CPU para validar integraciones de chat sin coste de GPU.
- Reproducción de experimentos: los dos cargadores (`load` y `load_from_edits`) producen pesos idénticos, lo que permite verificar la reproducibilidad del proceso de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- RAM: aproximadamente 1 GB, ya que los tensores se almacenan en denso.
- GPU recomendadas: no disponible; no se menciona soporte de GPU.
- Cabe en cualquier equipo consumer con CPU y ~1 GB de RAM libre.
- Despliegue: scripts `chat.py` del repositorio y API de Python (`wpllm.load.load`, `wpllm.host.SimHost`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: una respuesta tarda unos segundos en CPU, limitada por el cliente de la API de infini-gram a menos de 40 peticiones por minuto (`WPLLM_RPM`). Las respuestas se cachean en `~/.cache/wpllm` (`WPLLM_CACHE`).
- Requiere acceso a internet para la ghost table (API pública de infini-gram).
- Tokenizador: SentencePiece estándar de Llama-2, descargado de `hf-internal-testing/llama-tokenizer` en el primer uso o indicado con `WPLLM_TOKENIZER`.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (programación de pesos sin entrenamiento) ni resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- Calidad conversacional muy limitada: es un bot de charla trivial, no un asistente general.
- Riesgo de respuestas incorrectas por confiar en coincidencias débiles de la ghost table; la propia model card documenta el error "what is 2+2" → "The sum of 2 and 4 is 6".
- Dependencia de un servicio externo: la ghost table es la API pública de infini-gram, por lo que sin internet el modelo no funciona y la latencia depende de dicha API.
- Limitación de tasa de peticiones (menos de 40 por minuto) que condiciona el throughput.
- El modelo es un experimento conceptual; no se han publicado evaluaciones de sesgo, robustez ni seguridad.
- Licencia MIT: permite uso comercial, pero no hay garantías ni soporte asociados.
- No dispone de benchmarks públicos que respalden su uso en producción.
- La lista de bloqueo de palabras está codificada en los pesos y puede no cubrir todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leejh123e/WP-LLM
- Artículo de referencia: https://junhoo.me/mysteryofunlearnedparameters
- API de infini-gram: https://infini-gram.io
- Tokenizador Llama-2: https://huggingface.co/hf-internal-testing/llama-tokenizer
