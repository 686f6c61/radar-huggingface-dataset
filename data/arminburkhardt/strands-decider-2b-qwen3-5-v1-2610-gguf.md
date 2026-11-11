# ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF

## Resumen

Strands-decider-2B-qwen3.5-v1-2610-GGUF es una compilación en formato GGUF del modelo de decisión StrandsAgents/strands-decider-2B-qwen3.5-v1-2610, publicada por ArminBurkhardt. No es un modelo generativo de chat: es un modelo de decisión que recibe un estado (por ejemplo, un mensaje de usuario) y una o varias preguntas tipadas (sí/no o elección entre N opciones) y devuelve probabilidades calibradas para cada opción. Está pensado para enrutar decisiones dentro de sistemas de agentes, como decidir cuánto esfuerzo de razonamiento aplicar a una consulta o clasificar el departamento destinatario de un ticket.

Técnicamente es un Qwen3.5-2B-Base con un LoRA de rango 48 del decider fusionado en fp32, sin torre de visión ni cabeza MTP. El resultado se exporta a GGUF con pooling de último token (`pooling_type = last`), de modo que llama-server lo sirve como modelo de embeddings que devuelve el estado oculto final de cada entrada. La respuesta se lee con una cabeza de puntero (`head.safetensors`, 12 MB) que compara el estado oculto al final del prompt con el estado oculto del último token de cada línea de opción.

Su relevancia práctica es que permite ejecutar un clasificador de decisiones calibrado en unos 2 GB de memoria con llama.cpp puro, sin necesidad de PyTorch, lo que facilita integrarlo en pipelines de agentes en CPU o GPU modesta. El repo incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M) y un cliente de referencia en Python (`decide.py`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B-Base) con LoRA rank-48 fusionado; pooling de último token |
| Parámetros totales | 1.881.825.088 (1,88 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (ventana del prompt del decider; el estado pierde su final si no cabe) |
| Tipos de cuantización | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (el modelo base es Qwen3.5-2B-Base; el ejemplo de la model card incluye una pregunta en alemán) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (más `head.safetensors` para la cabeza de puntero y `decide.py` como cliente) |

## Arquitectura y entrenamiento

El modelo es un Qwen3.5-2B-Base al que se le ha fusionado un adaptador LoRA de rango 48 entrenado por Strands Agents para la tarea de decisión. La fusión se hace en fp32 y solo sobre la parte de texto: se eliminan la torre de visión y la cabeza MTP (multi-token prediction). El GGUF se genera con `convert_hf_to_gguf.py --no-mtp` y se marca con `pooling_type = last`, por lo que llama-server devuelve el estado oculto del último token de cada entrada en lugar de una secuencia generada.

La inferencia no usa generación autoregresiva. La cabeza de puntero (`head.safetensors`, copiada del repo fuente en el commit `216d1ccb`) compara el estado oculto al final del prompt (posición `<answer>`) con el estado oculto del último token de cada línea de opción, y produce una distribución de probabilidad sobre las opciones. Para una pregunta con N opciones se realizan N+1 prefills del estado: uno por cada opción (prompt cortado justo tras esa opción) y uno con el prompt completo, todos enviados en una sola petición a `/v1/embeddings` con token ids. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de decisión con probabilidades calibradas: preguntas de tipo `noul` (sí/no con probabilidad de "no" y "sí") y de tipo `choice` (una entre N opciones con distribución completa).
- Enrutamiento de esfuerzo de razonamiento: decidir si una consulta requiere pensamiento profundo o respuesta directa, con criterios descriptivos por opción.
- Clasificación de idioma y de intención sobre el estado de entrada (el ejemplo de la model card detecta alemán).
- Manejo de estados largos hasta 4096 tokens, incluyendo documentos como actas de reunión.
- Soporte de instrucciones y criterios por opción (`instructions` y `criteria` con descripciones `false`/`true` para preguntas `noul`).
- Integración con llama.cpp y llama-server, y con cualquier capa construida sobre él (por ejemplo Lemonade) mediante `/v1/embeddings`.
- No genera texto útil: es un modelo de extracción de características, no de chat.
- No cubiertos por el cliente de referencia: preguntas de tipo `score` e imágenes.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, una pregunta `choice` con opciones como billing, sales o retail devuelve la probabilidad de cada departamento; el ejemplo de la model card muestra billing 0,780, sales 0,116 y retail 0,104 con Q8_0.
- Control de esfuerzo en agentes: antes de invocar un LLM grande, el decider evalúa si el mensaje es un saludo, small talk o un problema complejo de matemáticas o código, y enruta a un modelo ligero o a uno con razonamiento profundo.
- Detección de urgencia: una pregunta `noul` sobre si el mensaje es urgente permite priorizar la cola de atención con una probabilidad explícita en lugar de una etiqueta dura.
- Clasificación de idioma en pipelines multilingües: el ejemplo en alemán ("Kannst du mir beweisen, dass es unendlich viele Primzahlen gibt?") demuestra el uso para decidir la ruta de traducción o el modelo de respuesta.
- Filtrado de inyección de prompt: la model card menciona que la evaluación de fidelidad incluyó un caso de prompt injection, por lo que el modelo puede usarse como señal de decisión en una capa de seguridad previa al LLM principal.
- Procesamiento de actas de reunión largas: con estados de hasta 4096 tokens y `-ub 4096`, el decider puede clasificar o extraer decisiones de documentos extensos, aunque con coste de N+1 prefills por pregunta.
- Despliegue en entornos sin GPU: al ejecutarse con llama.cpp en unos 2 GB de memoria, encaja en servicios de clasificación en CPU o en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí incluye una comparación de fidelidad frente al modelo original en torch (fp32) sobre 15 respuestas de 13 estados (enrutamiento de esfuerzo con 4 y 2 opciones, un acta de reunión larga en alemán, el ejemplo de la model card y un caso de prompt injection):

| Cuantización | Tamaño | Respuestas distintas vs. original | Diferencia máxima de probabilidad | RSS en llama-server |
|---|---:|---:|---:|---:|
| F16 | 3,8 GB | — | 0,001 | 4,1 GB |
| Q8_0 | 2,0 GB | — | 0,013 | 2,4 GB |
| Q4_K_M | 1,3 GB | — | 0,076 | 2,3 GB |

En el ejemplo de la model card, Q8_0 devuelve billing 0,780 y urgencia 0,861, frente a 0,773 y 0,858 del original; F16 coincide con el original dentro de 0,001.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2 GB de memoria en total con Q8_0 (RSS de 2,4 GB en llama-server), 2,3 GB con Q4_K_M y 4,1 GB con F16. La memoria está dominada por los búferes de llama-server para el lote de 4096 tokens, por lo que Q4_K_M ahorra menos de lo que sugiere su tamaño de fichero.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar la versión Q8_0, y el modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU consumer: sí, con Q8_0 o Q4_K_M en tarjetas de 4 GB o más; F16 requiere alrededor de 4-5 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embeddings -c 8192 -b 4096 -ub 4096`), Lemonade como entrada de catálogo con receta `llamacpp`, y cualquier herramienta construida sobre `llama-server`. Requiere llama.cpp `b11846` o posterior, ya que versiones anteriores no conocen la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles. El coste computacional es de N+1 prefills del estado por pregunta con N opciones, lo que es asumible para estados cortos y pocas opciones pero se acumula con estados largos. `-ub` debe ser al menos tan grande como la entrada más larga, porque llama-server embebe cada entrada en un solo ubatch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión con cabeza de puntero y probabilidades calibradas en la información proporcionada. Como referencia del modelo base y de su categoría:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---:|---:|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610-GGUF (este) | 1,88 B | 4096 | Decisión con probabilidades calibradas | Apache-2.0 | GGUF |
| StrandsAgents/strands-decider-2B-qwen3.5-v1-2610 (original) | 1,88 B | 4096 | Decisión con probabilidades calibradas | Apache-2.0 | safetensors / torch |
| Qwen/Qwen3.5-2B-Base | 2 B (aprox.) | no disponible | Modelo base de lenguaje | Apache-2.0 (según la model card) | safetensors |

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto útil; usarlo como generador produce salidas sin sentido.
- El cliente de referencia `decide.py` no cubre preguntas de tipo `score` ni imágenes.
- El coste de inferencia crece con el número de opciones (N+1 prefills por pregunta) y con la longitud del estado; con estados largos el coste se acumula.
- La ventana de 4096 tokens es estricta: si el estado no cabe, pierde su final y la decisión puede degradarse.
- `-ub` debe ser al menos tan grande como la entrada más larga; de lo contrario la inferencia falla o es incorrecta.
- Requiere llama.cpp `b11846` o posterior; versiones antiguas no soportan la arquitectura Qwen3.5.
- La fidelidad frente al original depende de la cuantización: Q8_0 se desvía hasta 0,013 y Q4_K_M hasta 0,076 en probabilidad, lo que puede ser relevante en umbrales de decisión ajustados.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática más allá del ejemplo en alemán de la model card.
- Licencia Apache-2.0, que permite uso comercial; los ficheros `LICENSE.md` y `head.safetensors` se copian del repositorio fuente en el commit `216d1ccb`, por lo que conviene verificar la procedencia y los términos del modelo base Qwen3.5-2B-Base antes de un despliegue en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF
- Modelo fuente: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base Qwen3.5-2B-Base (commit `b1485b2f`): https://huggingface.co/Qwen/Qwen3.5-2B-Base/tree/b1485b2fa6dfa1287294f269f5fb618e03d52d7c
- Commit del modelo fuente usado para la fusión (`216d1ccb`): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610/tree/216d1ccb46a9e9b036eb9187b248db98480f77d4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Lemonade: no disponible
