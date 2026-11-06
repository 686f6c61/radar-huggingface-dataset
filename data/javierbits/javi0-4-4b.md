# javierbits/Javi0.4-4B

## Resumen

Javi0.4-4B es un modelo multimodal de tipo image-text-to-text derivado de Qwen3.5-4B, publicado por el desarrollador javierbits. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de edición en el espacio de pesos (weight-space): parte de Javi0.3-4B y modifica una única fila de la matriz de embeddings. En concreto, multiplica por 0.84 la fila del token 51187 (`=open_page`), sin fine-tuning, sin datos nuevos y sin gradientes. El resto de los pesos es byte-idéntico a Javi0.3-4B.

El modelo tiene 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) y conserva la torre de visión de Qwen3.5-4B sin cambios; la edición afecta únicamente al modelo de lenguaje. Se distribuye en safetensors bf16 en dos shards (8,8 GB) e incluye tokenizer, ficheros de processor y plantilla de chat. Existe una versión GGUF para llama.cpp, lmdeck y lmswitch.

La relevancia de esta ficha es acotada y experimental: el propio autor indica explícitamente que Javi0.4-4B **no es una mejora** y que el 4B recomendado es Javi0.3-4B. Este repositorio se mantiene únicamente para que el lado 4B del experimento Javi0.4 sea reproducible. La evaluación completa v3/v3f no se ejecutó para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-4B; torre de visión sin cambios) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en safetensors; GGUF disponible en repositorio separado (Javi0.4-4B-GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | safetensors (bf16, dos shards, 8,8 GB); GGUF en repo aparte |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal con torre de visión y modelo de lenguaje. Javi0.4-4B no introduce cambios arquitectónicos: mantiene la torre de visión original y aplica una única modificación en el modelo de lenguaje. El token 51187 (`=open_page`) es un token único en el tokenizer de Qwen3.5, y su fila está atada (tied) entre los embeddings de entrada y de salida; al multiplicarla por 0.84 se reduce el logit de salida de `=open_page`.

No hubo entrenamiento: no hay fine-tuning, ni nuevos datos, ni gradientes. El modelo se construye por edición directa del checkpoint de Javi0.3-4B. El autor documenta el efecto medido: sobre 8 preguntas canónicas de evaluación v3 marcadas como `fail`, con el primer `web_search` forzado a fallar, Javi0.3-4B ya elegía `web_search` en 4 de 4 casos, y la edición no cambió ninguna decisión medida. En una repetición de un 403 de opencode, tanto Javi0.3-4B como Javi0.4-4B obtuvieron otra URL tipada en lugar de volver a buscar. La brecha de recuperación restante del 4B está en la ruta `webfetch`/`web_fetch`, que esta edición de fila no alcanza.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión de Qwen3.5-4B intacta.
- Soporte de tool use y function calling, heredado del modelo base (etiquetas `tool-use` y `agent`).
- Comportamiento orientado a agentes, con rutas de herramientas como `web_search`, `webfetch`/`web_fetch` y `=open_page`.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).

## Casos de uso

- Reproducibilidad de experimentos de edición en el espacio de pesos: el repositorio existe para replicar el lado 4B del experimento Javi0.4, comparando el efecto de modificar una fila de embeddings frente a Javi0.3-4B.
- Investigación sobre sesgo de tokens de herramientas: permite estudiar cómo la escala de una fila de embedding afecta la probabilidad de seleccionar una herramienta concreta (`=open_page`) en agentes.
- Evaluación de rutas de recuperación en agentes: útil para analizar por qué un agente prefiere `web_fetch` frente a `web_search` tras un fallo, aunque la edición no corrige esa ruta.
- Pruebas de pipelines multimodales en Transformers con `AutoModelForImageTextToText` y `AutoProcessor`, validando la integración de imagen y texto.
- Despliegue local con GGUF en llama.cpp, lmdeck o lmswitch para experimentar con cuantización sobre un checkpoint de 4,66B parámetros.
- Base para comparativas controladas: al ser byte-idéntico a Javi0.3-4B salvo una fila, sirve como control en estudios de ablación de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta mediciones cualitativas sobre 8 preguntas de evaluación v3: Javi0.3-4B eligió `web_search` en 4 de 4 casos con el primer `web_search` forzado a fallar, y la edición de Javi0.4-4B no cambió ninguna decisión medida. No se ejecutó la evaluación completa v3/v3f para Javi0.4.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB de pesos (repo de 9,3 GB; safetensors de 8,8 GB), más overhead de activaciones y caché KV.
- En cuantización GGUF (repo separado Javi0.4-4B-GGUF) el modelo puede reducir su huella para GPUs de consumo, aunque no se especifican los niveles de cuantización disponibles.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un checkpoint bf16 de 4,66B encaja en GPUs con 16 GB o más de VRAM; para GPUs de 8-12 GB sería necesario recurrir a GGUF cuantizado.
- Cabe en GPU de consumo con cuantización GGUF; en bf16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`), llama.cpp, lmdeck (`lmdeck use javi0.4-4b`), lmswitch (`lmswitch on javi0.4-4b`). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponible.
- Configuración de generación recomendada por el autor: thinking off, temperature 0.2, top-p 0.8, top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Javi0.4-4B | 4,66B | no disponible | apache-2.0 | Variante experimental con una fila de embedding editada |
| Javi0.3-4B | no disponible | no disponible | apache-2.0 | Modelo base y 4B recomendado por el autor |
| Javi0.4-2B | no disponible | no disponible | no disponible | Variante 2B del mismo experimento |
| Qwen3.5-4B | no disponible | no disponible | apache-2.0 | Modelo original del que se hereda arquitectura y licencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que Javi0.4-4B **no es una mejora** y recomienda usar Javi0.3-4B como 4B de referencia.
- La edición no cambió ninguna decisión medida en las evaluaciones realizadas; su impacto práctico es nulo en los casos probados.
- La brecha de recuperación en la ruta `webfetch`/`web_fetch` no se corrige con esta edición.
- No se ejecutó la evaluación completa v3/v3f, por lo que faltan datos de rendimiento general.
- Idiomas soportados limitados al inglés según la model card.
- Riesgo de alucinación y sesgos: no documentados específicamente; al heredar el comportamiento de Qwen3.5-4B, aplican los caveats del modelo base.
- Licencia apache-2.0 permite uso comercial, pero al ser un experimento de control sin mejoras medidas, no es adecuado como modelo de producción.
- Longitud de contexto no especificada en la información disponible; conviene consultar la model card de Qwen3.5-4B para ese dato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/javierbits/Javi0.4-4B
- Modelo base y 4B recomendado: https://huggingface.co/javierbits/Javi0.3-4B
- Experimento 2B: https://huggingface.co/javierbits/Javi0.4-2B
- GGUF: https://huggingface.co/javierbits/Javi0.4-4B-GGUF
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Imagen de portada: https://huggingface.co/javierbits/Javi0.4-4B/resolve/main/javi04-cover.png
