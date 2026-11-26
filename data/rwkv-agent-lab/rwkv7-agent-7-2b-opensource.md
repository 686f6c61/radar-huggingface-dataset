# RWKV-Agent-Lab/RWKV7-Agent-7.2B-OpenSource

## Resumen

RWKV7-Agent-7.2B-OpenSource es un repositorio unificado de la familia de modelos agénticos basados en RWKV-7, desarrollada por RWKV-Agent-Lab. Reúne varios checkpoints de una misma base de 7.200 millones de parámetros orientada a uso de herramientas (tool calling), razonamiento multi-turno y tareas de agente: una fundación general de agente, una variante especializada en agente de programación (Pi Coding Agent) y una variante especializada en búsqueda profunda (DSH Deep-Search Agent).

El modelo emplea la arquitectura RWKV-7, una evolución de los modelos recurrentes lineales con atención lineal que combina ventajas de los transformers (paralelización en entrenamiento) con las de los RNN (coste de inferencia constante por token y estado recurrente acotado). Esta elección es relevante para despliegues agénticos de larga duración, donde el coste de memoria no crece linealmente con la longitud de la conversación.

Su interés actual radica en que ofrece pesos BF16 autónomos (sin adaptadores LoRA/NoRA externos), licencia Apache-2.0 y checkpoints finales tras RL/OPD, lo que facilita su uso comercial y su integración en pipelines de agentes. Soporta chino e inglés y está pensado para escenarios de codificación y búsqueda profunda con invocación de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (atención lineal, modelo recurrente lineal) |
| Parametros totales | 7.200 millones (denominación 7.2B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints publicados son BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoints BF16 autónomos); tokenizador `rwkv_vocab_v20230424.txt` |

## Arquitectura y entrenamiento

La familia se basa en RWKV-7, una arquitectura de atención lineal con formulación recurrente que permite inferencia con estado constante y entrenamiento paralelizable. El repositorio incluye una base fundacional compartida (`RWKV7-Agent-7.2B-v0.1`) orientada a uso de herramientas multi-turno y razonamiento, sobre la que se derivan dos ramas: Pi Coding Agent y DSH Deep-Search Agent.

El pipeline de entrenamiento documentado incluye una fase SFT seguida de un "annealing" de alta señal (checkpoints `*-Anneal-*`) y, en el caso de Pi, una etapa final de RL/OPD (`RWKV7-Pi-7.2B-v0.1-final`). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del algoritmo de RL/OPD. Todos los checkpoints publicados son pesos BF16 fusionados y autónomos, sin necesidad de adaptadores externos.

## Capacidades

- Generación de texto y razonamiento multi-turno.
- Uso de herramientas (tool calling) y function calling, según los tags `tool-use` y `agent`.
- Comportamiento agéntico multi-paso (agente de codificación y agente de búsqueda profunda).
- Codificación asistida mediante la variante Pi Coding Agent.
- Búsqueda profunda (deep search) mediante la variante DSH.
- Capacidades multilingües limitadas a chino e inglés.
- Inferencia con atención lineal y estado recurrente (coste por token constante), orientada a sesiones largas.

## Casos de uso

- Agente de codificación en producción: la variante `RWKV7-Pi-7.2B-v0.1-final` está entrenada para tareas de programación con uso de herramientas, lo que permite integrarla en pipelines de CI/CD para generación, revisión y corrección de código.
- Búsqueda profunda asistida: la variante DSH está diseñada para tareas de búsqueda e investigación multi-paso, encadenando consultas y síntesis de resultados.
- Automatización de atención al cliente: la base fundacional soporta conversaciones multi-turno con tool calling, adecuada para agentes que consultan APIs o bases de conocimiento.
- Orquestación de agentes con herramientas: el modelo puede invocar funciones externas (APIs, calculadoras, bases de datos) en flujos de varios pasos.
- Asistentes de desarrollo en IDE: integración como backend de autocompletado y refactorización con contexto de repositorio, aprovechando el coste de inferencia constante de RWKV-7.
- Despliegue en entornos con recursos limitados: al ser un modelo de 7.2B con atención lineal, el coste de memoria durante la generación no crece con la longitud de la secuencia, lo que simplifica el servicio en GPUs de gama media.
- Investigación en arquitecturas recurrentes lineales: sirve como base para experimentar con agentes sobre RWKV-7 frente a transformers equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14-16 GB solo para pesos, más overhead de estado y activaciones (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100, H100 o GPUs con al menos 16-24 GB de VRAM para BF16.
- Compatibilidad con GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en BF16; en GPUs con menos VRAM requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: el autor proporciona `rwkv_lighting_cuda` (binario `rwkv_lighting_cuda`) como servidor local con flags `--model-path`, `--vocab-path`, `--host` y `--port`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RWKV7-Agent-7.2B-OpenSource | 7.2B | no disponible | Apache-2.0 | Hugging Face (`.pth`) |
| Alternativas de 7B transformer para agentes | ~7B | no disponible | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- No se han publicado benchmarks, por lo que el rendimiento real frente a transformers equivalentes es desconocido.
- Riesgo de alucinación inherente a modelos de 7.2B, sin datos de mitigación documentados.
- Sesgos no evaluados ni documentados por el autor.
- Longitud de contexto no especificada; aunque RWKV-7 tiene coste de inferencia constante, la ventana efectiva de entrenamiento no se indica.
- Ecosistema de despliegue limitado: la librería indicada es `rwkv-lightning-cuda`, sin soporte documentado de vLLM, llama.cpp u Ollama.
- Formato de pesos `.pth` (no safetensors ni GGUF), lo que puede complicar la integración con herramientas estándar.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento, no documentada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún incipientes.

## Enlaces

- Hugging Face: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Agent-7.2B-OpenSource
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
