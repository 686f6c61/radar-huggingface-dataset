# infosave/Nemotron-Labs-Dory1.0-4B-cmf

## Resumen

Nemotron-Labs Dory 1.0 4B es un modelo de lenguaje de NVIDIA construido sobre una arquitectura de transformer recurrente ("looped transformer"): un bloque recurrente de 40 subcapas se ejecuta varias veces sobre los mismos pesos, de modo que un único checkpoint puede operar con 1, 2 o 4 pasadas. El modelo razona en modo `<think>` y soporta llamadas a herramientas. Esta ficha describe la variante cuantizada publicada por el usuario `infosave` para el motor de inferencia `cortiq`.

La publicación no distribuye pesos en safetensors ni GGUF, sino ficheros propietarios CMF (uno por nivel de cuantización) pensados para `cortiq`, un motor escrito en Rust sin Python ni frameworks de ML, con backends CUDA, Vulkan, DX12, Metal y CPU. Se ofrecen tres ficheros: un 4-bit GPTQ con router y campo lejano ("turbo", 2,09 GB), un 4-bit GPTQ de dos bucles por token (2,09 GB) y un 8-bit (4,01 GB).

Su relevancia práctica está en el coste de memoria: gracias al mecanismo de "campo lejano" (atención con filas exactas al inicio y al final y el resto comprimido en landmarks por cabeza), la memoria de la tarjeta se mantiene plana al crecer el prompt, lo que permite procesar contextos de decenas de miles de tokens en GPUs de 16 GB. El modelo base es `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (looped transformer) con bloque recurrente de 40 subcapas; atención completa con campo lejano comprimido |
| Parametros totales | 4B (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens configurables vía `CMF_MAX_SEQ`; por defecto 32 768 |
| Tipos de cuantizacion | 4-bit GPTQ (turbo y q4tp-v2), 8-bit (q8_2f) |
| Idiomas soportados | en, ru, zh |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | CMF (ficheros propietarios del motor `cortiq`) |

## Arquitectura y entrenamiento

El modelo base es un transformer recurrente: un bloque de 40 subcapas comparte pesos y se aplica repetidamente, permitiendo 1, 2 o 4 bucles sobre el mismo checkpoint. Esta publicación no entrena pesos nuevos; aplica cuantización GPTQ de 4 y 8 bits sobre el modelo BF16 de NVIDIA y añade dos mecanismos propios en el fichero "turbo": un router que decide, token a token, si el estado abandona el bucle tras la primera pasada (reconstruyendo el estado mediante dos subespacios PCA aislados, sin entrenamiento por gradiente y sin read-out; solicitud de patente n.º 19/452,440) y un "campo lejano" en las capas de atención completa que conserva exactas las primeras filas y las últimas 1536, comprimiendo el resto en 32 landmarks por cabeza.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La cuantización se evalúa con perplejidad sobre wikitext-2 (doce ventanas de 512 tokens, token a token): el original BF16 obtiene 13,42; `q8_2f` 13,44; `q4tp-v2` 13,96; turbo 14,22.

## Capacidades

- Generación de texto y razonamiento en modo `<think>` (activable o desactivable con `--no-think` / `enable_thinking: false`).
- Llamada a herramientas (tool calling) a través del endpoint `/v1/chat/completions` con el campo `tools`.
- Razonamiento multi-paso implícito en el modo de pensamiento; el modo directo reduce latencia a costa de precisión.
- Generación de código (el ejemplo de la model card es una función en Rust).
- Aritmética y razonamiento matemático básico (evaluado en GSM8K).
- Multilingüe limitado a inglés, ruso y chino.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) con streaming y dashboard web.
- Conversaciones concurrentes con `CMF_SERVE_SLOTS=N`, cada una con sus propias filas en la GPU.
- Reutilización de prefijo: un turno que continúa el anterior solo lee lo nuevo.

## Casos de uso

- Resumen de documentos largos en hardware de gama media: con `CMF_MAX_SEQ` elevado, un documento de 60 000 caracteres (15 277 tokens) se lee en 8,3–9,4 s y se responde a 79 tok/s en una RTX 2000 Ada de 16 GB, con un pico de 3,77 GB de VRAM. Adecuado para pipelines de resumen por lotes en estaciones de trabajo modestas.
- Asistente de código en local: el modelo genera funciones (el ejemplo de la model card es Rust) y puede invocarse desde un servidor compatible con OpenAI, integrándose en editores o scripts sin depender de la nube.
- Agente con tool calling: el endpoint acepta `tools`, lo que permite encadenar llamadas a funciones en flujos de automatización (consulta de APIs, ejecución de comandos controlados) con razonamiento previo en modo `<think>`.
- Procesamiento de contextos muy largos con memoria acotada: gracias al campo lejano, la VRAM se mantiene en torno a 3,8 GB tanto a 12 000 como a 64 000 tokens, lo que habilita análisis de contratos, informes o logs extensos en GPUs consumer.
- Servicio multiinquilino ligero: con `CMF_SERVE_SLOTS=N` se atienden varias conversaciones simultáneas sobre un único fichero de 2,09 GB, útil para prototipos y entornos de desarrollo internos.
- Despliegue multiplataforma: los backends Vulkan/DX12 y Metal permiten ejecutar el mismo fichero en GPUs AMD, Intel y Apple Silicon, lo que facilita entornos heterogéneos sin recompilar modelos.
- Evaluación comparativa de cuantizaciones: los tres ficheros permiten medir el compromiso entre perplejidad y velocidad (turbo 201 tok/s en RTX 3090 vía CUDA frente a q8_2f, más fiel al original) para elegir el punto de operación.

## Benchmarks y rendimiento

| Metrica | Original BF16 | q8_2f | q4tp-v2 | turbo |
|---|---:|---:|---:|---:|
| Perplejidad wikitext-2 (menor es mejor) | 13,42 | 13,44 | 13,96 | 14,22 |
| GSM8K, 60 preguntas, greedy, respuesta directa | no disponible | 51 | 53 | 52 |

Rendimiento de inferencia reportado:

| Escenario | Hardware | Resultado |
|---|---|---|
| Generación (turbo, CUDA) | RTX 3090 | 201 tok/s |
| Lectura de 64 000 tokens | RTX 3090 (CUDA) | 33 s |
| Lectura de 64 000 tokens | RTX 2000 Ada 16 GB (CUDA) | 33 s, máx. 3,8 GB VRAM |
| Lectura de 64 000 tokens | RTX 5090 (Vulkan) | 3,76 GB VRAM constante |
| Documento de 15 277 tokens | RTX 2000 Ada (CUDA) | 8,3–9,4 s de lectura, 79 tok/s, 3,77 GB |
| Documento de 15 277 tokens | RTX 2000 Ada (Vulkan) | 66 s de lectura, 55 tok/s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: 2,09 GB de pesos para los ficheros 4-bit y 4,01 GB para el 8-bit; el consumo total medido se mantiene en torno a 3,8 GB incluso con prompts de 64 000 tokens gracias al campo lejano.
- GPUs recomendadas: RTX 3090 y RTX 5090 para máximo throughput; RTX 2000 Ada (16 GB) validada para contextos largos; cualquier GPU NVIDIA con CUDA 12.x (`libnvrtc`, `libcublas`).
- Cabe en GPUs consumer: sí, los ficheros 4-bit caben en tarjetas de 8 GB o menos; el 8-bit requiere al menos 6–8 GB libres.
- Backends: CUDA (el más rápido en NVIDIA), Vulkan y DX12 (AMD e Intel), Metal (Apple Silicon) y CPU.
- Despliegue: `cortiq` 0.8.57 o superior (0.8.72 o superior para CUDA), con `cortiq run` para CLI y `cortiq serve` para API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no pueden cargar el formato CMF.
- Throughput: 201 tok/s en RTX 3090 (turbo, CUDA); 79 tok/s en RTX 2000 Ada con contexto largo; 55 tok/s sobre Vulkan en el mismo escenario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| Dory 1.0 4B CMF (esta ficha) | 4B | hasta 131 072 | OpenMDW-1.1 | CMF / cortiq | Cuantización 4/8-bit, memoria plana con contexto largo |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 4B | no disponible | no disponible en esta información | safetensors BF16 | Modelo base sin cuantizar; perplejidad 13,42 |
| Alternativas de 4B en GGUF (p. ej. familias Llama/Qwen) | ~4B | no disponible | variable | GGUF / llama.cpp, Ollama | Ecosistema más amplio, pero sin el mecanismo de campo lejano |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés, ruso y chino; el castellano no está entre los idiomas declarados, por lo que el rendimiento en español no está garantizado.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; el modo `<think>` puede alargar las respuestas y consumir tokens si no se ajusta `max_tokens`.
- La licencia OpenMDW-1.1 se etiqueta como `other`; conviene revisar sus términos antes de uso comercial.
- El formato CMF solo es compatible con el motor `cortiq`, lo que limita la portabilidad frente a GGUF o safetensors.
- El router del fichero turbo introduce una decisión heurística por token (patente en trámite) que eleva la perplejidad de 13,42 a 14,22; para máxima fidelidad debe usarse `q8_2f`.
- El servidor no comprueba API key por defecto y escucha en todas las interfaces si no se pasa `--host 127.0.0.1`; no debe exponerse sin protección.
- Los benchmarks publicados son reducidos (GSM8K con 60 preguntas, perplejidad sobre doce ventanas), por lo que las cifras deben tomarse como orientativas.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Nemotron-Labs-Dory1.0-4B-cmf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Binarios de `cortiq`: https://github.com/infosave2007/cmf/releases
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
