# javierbits/Javi0.4-2B

## Resumen

Javi0.4-2B es un modelo multimodal de tipo image-text-to-text publicado por el usuario javierbits en Hugging Face, derivado directamente de Javi0.3-2B y, en ultima instancia, de la arquitectura Qwen3.5-2B. Con 2.274.069.824 parametros, se distribuye en formato safetensors bf16 en un unico shard de 4,2 GB y se orienta a tareas de agente con uso de herramientas (tool-use), en concreto a la seleccion de herramientas web en flujos multi-paso.

La particularidad del modelo es que no incorpora ningun entrenamiento nuevo: es una edicion en el espacio de pesos (weight-space) que modifica una unica fila de embeddings. Concretamente, la fila del token 51187 (correspondiente a `=open_page`) se multiplica por 0,84, lo que reduce el logit de salida de esa herramienta y sesga al modelo a repetir `web_search` tras un fallo de busqueda en lugar de abrir una URL recordada. El resto de los pesos es byte a byte identico a Javi0.3-2B.

Es relevante ahora como ejemplo de intervencion quirurgica sobre modelos de agente: demuestra que un ajuste de una sola fila de embeddings puede alterar una decision de politica de herramientas sin reentrenamiento, sin nuevos datos y sin gradientes, con un coste computacional practicamente nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), torre de vision Qwen3.5-2B sin cambios; edicion solo en el modelo de lenguaje |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en safetensors; GGUF disponible en repositorio separado (Javi0.4-2B-GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (heredada de Qwen3.5-2B) |
| Formato de pesos | safetensors (bf16, un shard de 4,2 GB); GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con torre de vision heredada de Qwen3.5-2B y un modelo de lenguaje con embeddings de entrada y salida atados (tied embeddings). La edicion consiste en multiplicar por 0,84 la fila del token 51187 (`=open_page`), que es un unico token en el tokenizador de Qwen3.5. Al estar la fila atada entre entrada y salida, el logit de salida de `=open_page` queda reducido, lo que sesga la seleccion de herramienta tras un fallo de busqueda.

No hay fine-tuning, ni nuevos datos, ni gradientes: todos los demas pesos son byte a byte identicos a Javi0.3-2B. El autor reporta que la edicion alcanza la herramienta canonica `open_page`, pero no afecta a `webfetch`/`web_fetch` en entornos como opencode/grok tras un error 403. El modelo fue entrenado y evaluado con el modo thinking desactivado.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Entrada image-text-to-text (vision heredada de Qwen3.5-2B).
- Tool calling / function calling, con soporte para herramientas como `web_search` y `open_page`.
- Comportamiento de agente en flujos multi-paso con herramientas web.
- Capacidad especifica inducida: tras un fallo de `web_search`, tiende a reintentar `web_search` en lugar de abrir una URL recordada.
- Multilingue limitado: solo ingles declarado.
- Modo thinking desactivado por recomendacion del autor (entrenado y evaluado sin thinking).

## Casos de uso

- Agentes de busqueda web con reintento: el modelo puede integrarse en pipelines donde una busqueda fallida deba reintentarse en lugar de abrir URLs inventadas, reduciendo alucinaciones de enlaces. La edicion de la fila de embeddings sesga esta decision de forma consistente.
- Investigacion sobre edicion en espacio de pesos: sirve como caso de estudio reproducible para medir el efecto de modificar una unica fila de embeddings en la politica de herramientas de un agente.
- Prototipado de asistentes con tool calling: util para validar plantillas de chat, esquemas de herramientas y parametros de muestreo (temperatura 0,2, top-p 0,8, top-k 20) en entornos de desarrollo.
- Evaluacion comparativa de robustez ante fallos de herramientas: el par Javi0.3-2B / Javi0.4-2B permite comparar el comportamiento ante busquedas bloqueadas de forma permanente.
- Despliegue local ligero en consumer GPU: con 2,27B parametros y version GGUF, cabe en equipos de gama media para tareas de agente con vision.
- Control en experimentos de alineacion de agentes: el modelo 4B de control (Javi0.4-4B) y este 2B permiten estudiar el efecto del tamano sobre la misma intervencion.

## Benchmarks y rendimiento

El autor reporta una sonda especifica sobre 8 preguntas canonicas `fail` de eval-v3, con la primera `web_search` forzada a fallar y seleccion greedy de la siguiente herramienta:

| Modelo | Siguiente `web_search` | Siguiente `open_page` |
|---|---:|---:|
| Javi0.3-2B | 0/8 | 8/8 |
| Javi0.4-2B | 7/8 | 1/8 |

El autor indica que se trata de una sonda dirigida, no de la eval v3 completa. En un canary de dos semillas con herramientas reales y muestreo, el factor 0,84 eligio `open_page` tras una busqueda bloqueada de forma permanente y completo la tarea, igual que el modelo base, usando una busqueda adicional en una consulta normal. Un factor 0,75 invertia 4/4 pero entraba en bucle con 14 busquedas bajo bloqueo permanente, por lo que 0,84 se presenta como el ajuste conservador. No se ejecuto la eval v3/v3f completa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,5 GB solo para pesos, mas overhead de activaciones y cache KV; en torno a 6-8 GB en funcion de la longitud de contexto.
- VRAM estimada en cuantizacion GGUF (Q4): aproximadamente 1,5-2 GB para pesos, apto para GPUs de 4-6 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para bf16; GPUs consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para cuantizaciones GGUF.
- Cabe en consumer GPU: si, tanto en bf16 en GPUs de 8 GB o mas como en GGUF en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (AutoModelForImageTextToText), llama.cpp via GGUF, lmdeck, lmswitch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Javi0.4-2B | 2,27B | no disponible | apache-2.0 | Edicion de una fila de embeddings sobre Javi0.3-2B |
| Javi0.3-2B | 2,27B | no disponible | apache-2.0 | Modelo base sin la edicion; 8/8 elige `open_page` tras fallo |
| Javi0.4-4B | no disponible | no disponible | apache-2.0 | Control de mayor tamano con la misma intervencion |
| Qwen3.5-2B | 2B (aproximado) | no disponible | apache-2.0 | Modelo original del que hereda arquitectura, vision y licencia |

## Limitaciones y advertencias

- La edicion solo alcanza la herramienta canonica `open_page`; en entornos como opencode/grok, `webfetch`/`web_fetch` tras un 403 no se ve afectado.
- No se ha ejecutado la eval v3/v3f completa; la evidencia se limita a una sonda de 8 preguntas y a un canary de dos semillas.
- Con factores de escala mas agresivos (0,75) el modelo entra en bucle de busquedas bajo bloqueo permanente; 0,84 es el ajuste conservador.
- El modelo solo declara soporte de ingles.
- Entrenado y evaluado con thinking desactivado; se recomienda enviar `enable_thinking: false` y usar temperatura 0,2, top-p 0,8, top-k 20 para mantener llamadas a herramientas bien formadas.
- Riesgo de alucinacion de URLs si se usa fuera del comportamiento inducido o con herramientas no canonicas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia apache-2.0 heredada de Qwen3.5-2B, lo que permite uso comercial segun los terminos de dicha licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/javierbits/Javi0.4-2B
- Version GGUF: https://huggingface.co/javierbits/Javi0.4-2B-GGUF
- Modelo base Javi0.3-2B: https://huggingface.co/javierbits/Javi0.3-2B
- Control 4B: https://huggingface.co/javierbits/Javi0.4-4B
- Modelo original Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
