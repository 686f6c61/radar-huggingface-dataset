# postpostmodern/aquarium-9M

## Resumen

Aquarium v5.2 (lowercase) es un modelo de lenguaje de 8,9 millones de parámetros desarrollado por el usuario postpostmodern, publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only entrenado desde cero que interpreta a una de 18 criaturas marinas (guppy, pulpo, narval, etc.) en conversaciones cortas de rol. El modelo deriva de GuppyLM de arman-bd y reutiliza su arquitectura de transformer pequeño con una ventana de contexto ampliada a 512 tokens.

El modelo resuelve un problema muy acotado: generar diálogos de personaje en minúsculas, con frases breves y un tono ingenuo y divagante propio de un pez de acuario. No está pensado como asistente general, sino como pieza de una experiencia interactiva: es el motor detrás de la página web Aquarium, que lo ejecuta en un Web Worker del navegador con JavaScript plano. Su relevancia actual es la de un experimento de extremo a extremo sobre modelos mínimos desplegables en el cliente, con cuantización int8 y un fichero de pesos de 9,04 MB.

Arquitectónicamente es un transformer decoder-only de 6 capas, 6 cabezas de atención, dimensión de modelo 384, FFN ReLU de 768, pre-LayerNorm, posiciones aprendidas y embeddings de entrada y salida atados. El tokenizador es un BPE a nivel de byte de 4.096 tokens. El entrenamiento parte de TinyStoriesV2-GPT4 y se afina en varias etapas de conversación sintética y de personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only: 6 capas, 6 cabezas, d_model 384, FFN ReLU 768, pre-LayerNorm, posiciones aprendidas, embeddings entrada/salida atados |
| Parametros totales | 8.873.472 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | int8 (fichero del navegador, con escalas float32 por fila); pesos float32 reconstruidos a partir del int8 |
| Idiomas soportados | Ingles, exclusivamente en minusculas |
| Licencia | MIT |
| Formato de pesos | safetensors (float32 reconstruido desde int8), binario int8 propio para navegador (`web/guppy.bin`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con 6 cabezas de atención, dimensión de modelo 384 y una FFN ReLU de 768 unidades, con pre-LayerNorm, posiciones aprendidas y embeddings de entrada y salida atados. El tokenizador es un BPE a nivel de byte con un vocabulario de 4.096 tokens y tokens especiales `0` (pad), `1` (`<|im_start|>`) y `2` (`<|im_end|>`). El formato de prompt es de estilo ChatML, con la particularidad de que el system prompt y todos los turnos deben convertirse a minúsculas antes de codificar, porque la última etapa de entrenamiento usó únicamente texto en minúsculas.

El entrenamiento se organizó en cinco etapas: preentrenamiento sobre TinyStoriesV2-GPT4; un calentamiento conversacional de 2.000 pasos sobre TinyDialogues y conversaciones oceánicas sintéticas; 15.000 pasos de chat de personaje con canciones, escenas familiares, aumentación de copia de nombres y sustantivos y ejemplos de memoria (etapa que produjo la v5.1); una revisión de datos que dio lugar a la v5.2, con conversaciones curadas y ejemplos de emoción y urgencia; y una continuación en minúsculas de 600 pasos con learning rate 5e-5, batch 32 y secuencia 512 sobre 131.618 filas de diálogo en minúsculas más un pool de repetición de TinyStories en minúsculas (15% de los ejemplos). La pérdida de desarrollo en minúsculas bajó de 3,276 a 1,812. Cada etapa de chat conservó una fracción de ventanas de TinyStories para mantener la capacidad de narrar.

Un detalle relevante de procedencia: los pesos float publicados se reconstruyeron a partir del fichero int8 desplegado, ya que el checkpoint float original de esta versión se perdió. `model.safetensors` contiene los pesos int8 por fila multiplicados por sus escalas float32 (sesgos y LayerNorms nunca se cuantizaron), que son exactamente los números que calcula el navegador; difieren del checkpoint perdido solo por el redondeo int8. El fichero `web/guppy.bin` de 9,04 MB es el binario del navegador byte a byte, y `release.json` registra los hashes SHA-256 del binario, del tokenizador y del checkpoint float perdido para trazabilidad.

## Capacidades

- Generación de texto conversacional breve en inglés y en minúsculas, con respuestas de hasta 80 tokens recomendados.
- Interpretación de rol de 18 criaturas marinas distintas, con especie, hábitat y rasgos definidos en `personas.json`.
- Mantenimiento de un personaje coherente a lo largo de varios turnos dentro de una ventana de contexto de 512 tokens.
- Narración breve de historias sencillas, herencia del preentrenamiento en TinyStories.
- Ejemplos de memoria y de copia de nombres y sustantivos incorporados en el entrenamiento de chat.
- Generalización limitada a dos personas no vistas durante el entrenamiento de chat: `narwhal` y `mantis_shrimp`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No es multilingüe: solo inglés y solo en minúsculas.

## Casos de uso

- Demo interactiva en navegador: el modelo se ejecuta en un Web Worker con JavaScript plano y un fichero int8 de 9,04 MB, lo que permite ofrecer una experiencia de chat con personaje sin backend ni coste de inferencia en servidor.
- Chatbot de personaje para experiencias lúdicas: con `personas.json` se selecciona una de las 18 criaturas y se mantiene un rol consistente con frases cortas, adecuado para webs de entretenimiento o instalaciones interactivas.
- Prototipado rápido de pipelines de chat: `chat.py` concentra en unas 150 líneas el modelo, el constructor de prompt y el sampler, lo que sirve como referencia didáctica para entender el ciclo completo de inferencia de un LLM.
- Investigación sobre modelos mínimos desplegables en el cliente: su tamaño y su cuantización int8 permiten estudiar latencia, memoria y calidad en entornos con recursos muy restringidos.
- Generación de diálogos sintéticos con estética infantil: útil para producir corpus de conversaciones en minúsculas con vocabulario de cuento, por ejemplo para aumentar datos de entrenamiento de otros modelos pequeños.
- Pruebas de formato de prompt y tokenización: al usar ChatML con tokens especiales explícitos y exigir minúsculas, es un banco de pruebas sencillo para validar plantillas de prompt y flujos de codificación/decodificación.
- Educación y talleres: por su escala y su licencia MIT, permite mostrar de forma completa el entrenamiento y el despliegue de un transformer desde cero sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación de la versión 5.2 en minúsculas se realizó leyendo conversaciones muestreadas, no mediante benchmarks, y el autor no reclama una mejora general frente a versiones anteriores. El único dato cuantitativo de calidad es la pérdida de desarrollo en minúsculas, que pasó de 3,276 a 1,812 durante la continuación de 600 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8,87 millones de parámetros) y en torno a 9 MB con el fichero int8 del navegador.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer moderna (por ejemplo, una RTX 4090) lo ejecuta con holgura, y también funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el despliegue de referencia es un Web Worker del navegador con JavaScript plano.
- Opciones de despliegue: el script `chat.py` incluido (PyTorch, tokenizers, safetensors, huggingface_hub) y el binario int8 `web/guppy.bin` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Aquarium v5.2 | 8,87 M | 512 tokens | MIT | Chat de personaje de criatura marina, solo minúsculas, despliegue en navegador |
| GuppyLM (arman-bd) | No disponible | No disponible | No disponible | Modelo de pez del que deriva Aquarium; misma arquitectura de transformer pequeño con contexto más corto |
| TinyStories (modelos pequeños) | No disponible | No disponible | No disponible | Generación de historias infantiles; base del preentrenamiento de Aquarium |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita al enfoque y a la procedencia.

## Limitaciones y advertencias

- Es un modelo de juguete: no tiene conocimiento del mundo más allá de un vocabulario de cuentos infantiles y de su acuario.
- Pierde el hilo de la conversación en pocos turnos, se contradice e inventa explicaciones de forma habitual.
- Solo habla inglés y solo en minúsculas; la entrada con mayúsculas funciona mal si no se convierte antes a minúsculas.
- La ventana de contexto es de 512 tokens; el navegador conserva los últimos 432 tokens de prompt para dejar sitio a una respuesta de 80 tokens.
- La evaluación de la versión 5.2 se hizo leyendo conversaciones muestreadas, sin benchmarks, y no se reclama mejora general frente a versiones anteriores.
- Los pesos float publicados se reconstruyeron desde el int8 desplegado y difieren del checkpoint float perdido por el redondeo int8, lo que introduce una pequeña desviación respecto al entrenamiento original.
- Licencia MIT: permite uso comercial y modificación, pero al ser un modelo sin garantías de calidad, no es adecuado para producción en tareas que requieran fiabilidad factual.
- No dispone de tool calling, agentes ni capacidades multimodales, por lo que no sirve para automatizaciones que dependan de esas funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postpostmodern/aquarium-9M
- Página en vivo de Aquarium: https://eaglstun.github.io/guppylm/
- GuppyLM (proyecto original de arman-bd): https://github.com/arman-bd/guppylm
