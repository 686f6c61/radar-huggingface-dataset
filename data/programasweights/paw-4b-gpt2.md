# programasweights/paw-4b-gpt2

## Resumen

paw-4b-gpt2 es el compilador "Compact" del paradigma ProgramAsWeights (PAW), desarrollado por el usuario programasweights. No es un modelo de chat al uso: recibe una especificación en lenguaje natural y emite un "programa" ejecutable en forma de adaptador LoRA (unos 5 MB) que se ejecuta localmente sobre un intérprete GPT-2 de 124M de parámetros. El compilador en sí es un fine-tuning de Qwen/Qwen3-4B-Instruct-2507, con lo que hereda la arquitectura transformer decoder-only de 4B parámetros del modelo base.

La propuesta resulta relevante porque separa la capacidad de razonamiento (el compilador de 4B, que se ejecuta una sola vez en servidor) de la ejecución (el programa LoRA sobre un GPT-2 minúsculo que cabe en el navegador). Esto permite compilar funciones "difusas" (clasificación de texto, extracción de campos, transformaciones lingüísticas) y desplegarlas offline sin GPU ni llamadas a API, con un coste de inferencia marginal muy bajo.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y un repo de 8,3 GB que incluye el compilador, la cabeza mapper (`lora_mapper.pt`) y metadatos. El snapshot de referencia es `20260406` y el artículo asociado es "Program-as-Weights: A Programming Paradigm for Fuzzy Functions" (AIware 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507) + cabeza mapper (trunk + coefficient head + bases LoRA aprendibles) |
| Parametros totales | 4B (compilador); el intérprete objetivo es un GPT-2 de 124M con `n_ctx=2048` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el compilador; el intérprete GPT-2 usa `n_ctx=2048` (posicionales extendidos de 1024 a 2048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda el comportamiento del base Qwen3-4B-Instruct-2507, sin listado explícito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compilador); `lora_mapper.pt` (PyTorch); programas emitidos como LoRA de ~5 MB |

## Arquitectura y entrenamiento

El compilador es un Qwen3-4B-Instruct-2507 afinado como modelo causal de generación de texto. Sobre sus estados ocultos se monta una cabeza mapper (`lora_mapper.pt`) compuesta por un trunk, una cabeza de coeficientes y un conjunto de matrices base LoRA aprendibles. La configuración del mapper, según `meta.json`, es `lora_rank=64`, `lora_alpha=16`, `lora_num_bases=64` y módulos objetivo `[c_attn, c_proj, c_fc]`, es decir, las proyecciones de atención y MLP del GPT-2 intérprete.

El flujo de compilación tiene tres pasos: (1) el compilador de 4B genera un pseudo-programa corto (descripción de tarea más unos pocos ejemplos de entrada/salida) a partir de la especificación; (2) el texto `chat_template(spec) + pseudo-programa + 64 tokens de prefijo` se pasa por el compilador y el mapper lee los 64 estados ocultos del prefijo para emitir las matrices LoRA A/B por capa como una mezcla aprendida de las matrices base; (3) el LoRA resultante (~5 MB) es el programa, que se carga sobre el GPT-2 intérprete y se ejecuta localmente u offline. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Compilación de especificaciones en lenguaje natural a programas LoRA ejecutables sobre GPT-2 (124M).
- Generación de texto y de pseudo-programas (descripción de tarea más ejemplos de entrada/salida).
- Emisión de adaptadores LoRA parametrizados por capa como mezcla de 64 matrices base.
- Ejecución offline y en navegador del programa compilado mediante los SDK de Python y JavaScript del proyecto.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles explícitamente; dependen del comportamiento heredado de Qwen3-4B-Instruct-2507.
- Capacidades especiales: modo "compact" de compilación, integración con `paw.compile(spec, compiler="paw-4b-gpt2")` y compatibilidad con endpoints.

## Casos de uso

- Clasificación de texto en el navegador: compilar una especificación de etiquetado (por ejemplo, categorización de tickets) a un LoRA de 5 MB que se ejecuta sobre GPT-2 en cliente, sin enviar datos a un servidor.
- Extracción de campos estructurados: definir con ejemplos la extracción de entidades o pares clave-valor de correos o formularios, compilar el programa y desplegarlo offline en un pipeline local.
- Transformaciones lingüísticas ligeras: normalización de texto, reformateo de respuestas o reescritura de plantillas, compiladas como programas que corren en CPU con latencia baja.
- Procesamiento en el borde (edge): despliegue de funciones difusas en dispositivos sin GPU, aprovechando que el intérprete es un GPT-2 de 124M con contexto de 2048 tokens.
- Prototipado rápido de tareas personalizadas: usar el compilador de 4B en servidor para generar el programa una vez y distribuir el LoRA resultante a muchos clientes, reduciendo el coste de inferencia por consulta.
- Extensiones de navegador o aplicaciones web: integrar el SDK JavaScript (`programasweights-js`) para ejecutar programas compilados directamente en el cliente, con privacidad por diseño.
- Investigación sobre programación neuro-simbólica: estudiar la separación entre razonamiento en el compilador y ejecución en el intérprete, y evaluar la fidelidad de los programas emitidos frente a la especificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Compilador (Qwen3-4B-Instruct-2507): VRAM estimada de 8-9 GB en FP16/BF16 para inferencia; aproximadamente 5-6 GB en cuantización de 8 bits y 3-4 GB en 4 bits, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas para el compilador: A100, H100 o RTX 4090 para compilación en servidor; una RTX 3090 o 4080 con cuantización podría ser suficiente, pero no se confirma en la documentación.
- Intérprete (GPT-2 124M con `n_ctx=2048`): cabe en CPU y en cualquier GPU consumer; el tamaño del LoRA emitido es de unos 5 MB.
- Despliegue: transformers para el compilador; SDK de Python (`programasweights-python`) y de JavaScript (`programasweights-js`) para ejecutar los programas compilados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paw-4b-gpt2 | 4B (compilador) + 124M (intérprete) | no disponible (intérprete 2048) | Compilación de especificaciones a LoRA sobre GPT-2 | Apache 2.0 | Hugging Face, SDK Python/JS, demo web |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | LLM instructivo generalista | Apache 2.0 | Hugging Face |
| GPT-2 (124M) | 124M | 1024 (2048 en el intérprete extendido) | Modelo base de generación de texto | MIT (según el original) | Hugging Face |

No se dispone de otros compiladores de especificaciones a LoRA comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un LLM de propósito general: su salida útil es un programa LoRA, no texto para el usuario final.
- La calidad del programa compilado depende de la especificación y de los ejemplos de entrada/salida; no se han publicado métricas de fidelidad.
- El intérprete GPT-2 de 124M limita la capacidad del programa emitido; tareas que requieran razonamiento complejo probablemente no se reproduzcan fielmente.
- No se detallan sesgos conocidos ni tasas de alucinación; al heredar Qwen3-4B-Instruct-2507, arrastra los sesgos de su base.
- Idiomas soportados no documentados; el tokenizador del intérprete es GPT-2 BPE estándar, con cobertura multilingüe limitada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los SDK asociados.
- El código de compilación y runtime "limpio" no estará público hasta julio de 2026 según la model card; la instantánea de referencia es una versión sin limpiar.
- El repo tiene 0 descargas y 5 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/programasweights/paw-4b-gpt2
- Paper (arXiv): https://arxiv.org/abs/2607.02512
- SDK Python: https://github.com/programasweights/programasweights-python
- SDK JavaScript: https://github.com/programasweights/programasweights-js
- Demo y hub de programas: https://programasweights.com
- Snapshot de referencia sin limpiar: https://anonymous.4open.science/r/programasweights
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
