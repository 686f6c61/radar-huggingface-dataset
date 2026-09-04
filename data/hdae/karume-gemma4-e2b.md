# hdae/karume-gemma4-e2b

## Resumen

El modelo `hdae/karume-gemma4-e2b` es una distribución de chat que convierte el decodificador de texto de `google/gemma-4-E2B-it` al formato de contenedor de Karume, un runtime de inferencia WebGPU. Ha sido desarrollado por el usuario `hdae` y está pensado para ejecutarse directamente en el navegador o en Deno, sin necesidad de servidores de inferencia. Resuelve el problema de desplegar un LLM en el cliente con WebGPU, aprovechando la cuantización para reducir el peso del modelo.

El modelo base, Gemma 4 E2B Instruct, tiene 2.1 mil millones de parámetros (según fuentes externas) y es el más pequeño de la familia Gemma 4. Esta distribución extrae el decodificador de texto, cuantiza los pesos lineales a int4 empaquetado (grupo 32) y las tablas de embedding a int8, y los empaqueta en safetensors con el grafo embebido en `__metadata__`. La longitud de contexto por defecto es de 4096 tokens por conversación, pero el cargador acepta configurarla hasta 131072 tokens, que es el límite de posición declarado del modelo base.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto) con atención por rotaciones (RoPE) |
| Parametros totales | 2.1 mil millones (2.1B) según fuentes externas |
| Longitud de contexto | 4096 tokens por defecto en esta distribución; configurable hasta 131072 |
| Tipos de cuantizacion | i4 (int4 empaquetado, grupo 32) para pesos lineales; int8 para tablas de embedding |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con grafo embebido en `__metadata__` (formato de contenedor Karume, no legible por `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del decodificador de texto de Gemma 4 E2B Instruct, un transformer con rotaciones posicionales (RoPE). Esta distribución no realiza ningún retraining ni fine-tuning: el autor extrae el decodificador, reexpresa los pesos en el contenedor Karume y aplica cuantización. Los pesos lineales se convierten a int4 empaquetado con grupo 32, las tablas de embedding a int8, y los embeddings por capa se sacan del grafo y se almacenan como sidecar en el host, de modo que el cargador solo lee los rangos de vocabulario que una conversación utiliza.

El grafo se construye en tiempo de exportación con `karume/0.8.0` y el manifiesto es `karume.json` (`karume/4`). Los cosenos y senos rotacionales se generan en el host por chunk a partir de los parámetros `rope` declarados, por lo que no se incluye una tabla de posiciones. La salida se estrecha a los logits de la última fila y el prefill se ejecuta en chunks de 768 filas por defecto. Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto incremental (streaming) con decodificación token a token, reteniendo caracteres multibyte hasta que están completos.
- Chat multi-turno con formato de chat y tokenizer integrados; el método `chat()` acepta turnos de `system`, `user` y `assistant`.
- Ejecución en navegador mediante WebGPU y en Deno, con pesos cacheados tras la primera descarga.
- Carga selectiva de embeddings: solo se leen los rangos de vocabulario que la conversación realmente toca, reduciendo el uso de memoria.
- Cuantización int4 para pesos lineales e int8 para embeddings, lo que reduce el tamaño del modelo.
- No soporta tool calling, canales de thinking ni entradas de imagen o audio; los rechaza explícitamente.
- No es multimodal: la distribución no contiene las torres de visión y audio del checkpoint original.

## Casos de uso

- Asistentes de chat en el navegador: el modelo se ejecuta íntegramente en el cliente con WebGPU, sin necesidad de servidor. El método `chat()` devuelve fragmentos de texto en streaming, lo que permite construir interfaces de mensajería con baja latencia y sin costes de infraestructura.
- Aplicaciones Deno sin backend de IA: al ser un pipeline de Karume para Deno, se puede integrar en scripts o servidores ligeros que necesiten generar texto de forma local, sin depender de APIs externas.
- Herramientas de privacidad y datos sensibles: al ejecutarse en el dispositivo del usuario, las conversaciones no se envían a servidores externos. Es adecuado para entornos donde la confidencialidad es crítica, como aplicaciones de salud o jurídicas.
- Prototipado rápido de IA en el aula: los investigadores y estudiantes pueden cargar el modelo en una página web y experimentar con generación de texto en tiempo real, sin instalar Python ni frameworks de deep learning.
- Demos interactivas en repositorios: al ser un modelo cuantizado de aproximadamente 1.5 GB en los pesos lineales, se puede incorporar en demos web estáticas o en GitHub Pages, permitiendo que los visitantes prueben el modelo sin descargar pesos enormes.
- Aplicaciones edge en dispositivos con WebGPU: el modelo cabe en la VRAM de GPUs de consumo y se puede usar en aplicaciones de escritorio basadas en web (Electron, Tauri) para funciones de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos lineales cuantizados en int4 ocupan aproximadamente 1.5 GB en disco. Los embeddings por capa se cargan bajo demanda como sidecar, por lo que la VRAM efectiva depende de la longitud de la conversación y del vocabulario utilizado.
- GPU recomendada: cualquier GPU compatible con WebGPU, como las series RTX 20/30/40 de NVIDIA, AMD RX 6000/7000 o gráficas integradas modernas (Apple Silicon, Intel Iris Xe). No requiere aceleradores de servidor como A100 o H100.
- CPU: el modelo base es ejecutable en CPU, pero esta distribución está orientada a WebGPU, por lo que la GPU es el camino recomendado.
- Opciones de despliegue: Karume runtime (`jsr:@karume/models/gemma`) en navegador y Deno. No es compatible con vLLM, llama.cpp, Ollama ni TGI porque el formato no es legible por `transformers`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks de modelos comparables. La referencia más directa es el modelo base del que deriva esta distribución:

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| hdae/karume-gemma4-e2b | 2.1B (según fuentes externas) | 4096 por defecto, hasta 131072 | Karume (safetensors con grafo) | Apache 2.0 |
| google/gemma-4-E2B-it | 2.1B (según fuentes externas) | no disponible en la información | Transformers | Apache 2.0 |

## Limitaciones y advertencias

- No soporta entradas multimodales (imagen o audio), a pesar de que el checkpoint original de Gemma 4 E2B incluye torres de visión y audio.
- Rechaza explícitamente tool calls, canales de thinking y partes de imagen o audio; no los gestiona silenciosamente.
- No es legible por la librería `transformers`; requiere el runtime Karume y el pipeline `gemma4/1`.
- El contexto por defecto es de 4096 tokens, lo que puede ser insuficiente para conversaciones largas si no se configura explícitamente el límite superior.
- La cuantización int4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa.
- No hay benchmarks publicados para esta distribución; el rendimiento en tareas concretas no está validado.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base de Google, que puede incluir condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hdae/karume-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Sitio de referencia Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
