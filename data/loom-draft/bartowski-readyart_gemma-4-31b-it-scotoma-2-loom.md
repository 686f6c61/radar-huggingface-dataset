# loom-draft/bartowski-ReadyArt_gemma-4-31B-it-scotoma-2-loom

## Resumen

El repositorio `loom-draft/bartowski-ReadyArt_gemma-4-31B-it-scotoma-2-loom` no contiene un modelo de lenguaje en el sentido habitual, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next`. Empaqueta el checkpoint GGUF cuantizado en Q4_K_M `ReadyArt_gemma-4-31B-it-scotoma-2-Q4_K_M.gguf`, publicado originalmente por bartowski, para ejecutarlo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `hrx-loom` (versión 0.2.0). El modelo subyacente es un derivado fine-tuneado de la familia Gemma 4 de 31B parámetros en su variante instruct, según se deduce del identificador, aunque el autor del paquete no documenta el proceso de fine-tuning ni la receta de datos.

La relevancia de este artefacto es operativa: demuestra que es posible servir un modelo de 31B en cuantización Q4_K_M sobre hardware AMD consumer y de estación de trabajo con aceleración ROCm, exponiendo una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y un modo de razonamiento opcional. No obstante, la model card del autor es explícita: las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, de modo que no hay datos verificados de latencia, throughput ni equivalencia numérica frente a llama.cpp.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026. La licencia declarada es Apache 2.0, heredada del paquete, si bien la licencia del modelo base original (Gemma) debe verificarse de forma independiente antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de 31B, según identificador; detalles no documentados en el paquete) |
| Parámetros totales | 31B (según identificador del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF); el paquete Loom solo distribuye esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en el paquete; verificar la del modelo base) |
| Formato de pesos | GGUF (`ReadyArt_gemma-4-31B-it-scotoma-2-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo subyacente. Por el identificador `gemma-4-31B-it` se infiere que se trata de un transformer decoder-only de la familia Gemma 4 en variante instruct, con 31.000 millones de parámetros, pero el autor no publica número de capas, dimensión oculta, cabezas de atención, tipo de atención (global/local, lineal o completa) ni vocabulario. Tampoco se especifica si el fine-tuning `scotoma-2` aplicado por ReadyArt introduce cambios estructurales o se limita a un ajuste supervisado sobre el checkpoint instruct; no hay información sobre el dataset, el número de tokens de entrenamiento, la composición de la mezcla ni el uso de RLHF, DPO o preferencias.

En el plano del runtime, Loom compila y ejecuta kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y carga de parámetros en modo preload (`--parameter_mode=preload`). El paquete incluye un preset `chat` para Strix Halo y un preset `chat-r9700` para la R9700. La decodificación especulativa no está soportada ("not applicable") y el razonamiento se controla mediante `chat_template_kwargs: {"enable_thinking": true|false}`, desactivado por defecto. La entrada de imagen y audio que el modelo original sí admite no está implementada en Loom.

## Capacidades

- Generación de texto conversacional multi-turno a través de una API compatible con OpenAI.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados.
- Razonamiento o modo "thinking" opcional, desactivado por defecto y activable por petición mediante `chat_template_kwargs`.
- Soporte de bucles de tool calling multi-turno (la puerta de corrección `agent` y `agent_think_off` así lo contempla, aunque sus resultados no están re-medidos).
- Contexto de 53.248 tokens por petición, adecuado para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia garantizada por diseño (puerta `consistency`).
- Capacidades multilingües: no disponibles en la documentación del paquete.
- Visión: no soportada por Loom, pese a que el modelo original la admite.
- Audio de entrada o salida: no soportado por Loom, pese a que el modelo original lo admite.
- Muestreo (`temperature`, `top_k`, `seed`): el estado figura como "not determined".

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: el paquete permite levantar un endpoint `/v1/chat/completions` en una Radeon AI PRO R9700 de 32 GB con un solo comando `loom-serve`, útil para equipos que quieren inferencia local sin depender de la nube y con hardware AMD.
- Agentes con tool calling en pipelines internos: al aceptar `tools` y `tool_calls` en formato OpenAI, el modelo puede integrarse en orquestadores existentes (LangChain, LlamaIndex, clientes OpenAI) para tareas de consulta a bases de datos, APIs internas o sistemas de tickets, con el modo thinking activable para pasos de planificación.
- Procesamiento de documentos largos: los 53.248 tokens de contexto permiten resumir contratos, informes técnicos o expedientes completos en una sola petición, sin fragmentación ni recuperación externa, en entornos donde la confidencialidad impide enviar datos a terceros.
- Atención al cliente en hardware dedicado: con 4 peticiones concurrentes y plantilla de chat instruct, puede desplegarse como backend de un chatbot de soporte de baja concurrencia en una sola GPU R9700, con el modo thinking desactivado para minimizar latencia.
- Generación y revisión de código en local: el modelo de 31B en Q4_K_M cabe en 32 GB de VRAM, lo que permite usarlo como asistente de programación en IDE mediante un servidor compatible con OpenAI, sin salida de código a servicios externos.
- Evaluación y prototipado de la cadena Loom: investigadores que trabajen con ROCm pueden usar este paquete como referencia para medir el rendimiento de kernels generados frente a llama.cpp sobre gfx1151 y gfx1201, ejecutando las puertas de corrección `golden`, `compare` y `logits`.
- Despliegue en equipos compactos Strix Halo: el preset `chat` para el Ryzen AI Max+ 395 permite ejecutar un 31B cuantizado en un sistema integrado, útil para demos, ferias o entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput verificables.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 31B ocupa aproximadamente 18-19 GB en pesos, más overhead de contexto KV; el paquete está diseñado para GPUs de 32 GB (Radeon AI PRO R9700) y para el pool unificado del Ryzen AI Max+ 395.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), las dos plataformas con preset propio en el paquete.
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon consumer distintas de las listadas; el runtime `hrx-loom` está orientado a ROCm sobre las arquitecturas gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el endpoint. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete concreto (llama.cpp se usa solo como referencia de corrección).
- Latencia y throughput: no disponibles; las filas de rendimiento no han sido re-medidas para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización del paquete | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bartowski-ReadyArt_gemma-4-31B-it-scotoma-2-loom | 31B | 53.248 tokens | Q4_K_M | Apache 2.0 (paquete) | Paquete Loom para gfx1151 y gfx1201 |
| bartowski/ReadyArt_gemma-4-31B-it-scotoma-2-GGUF (modelo base del paquete) | 31B | no disponible | GGUF (varias) | no disponible en esta ficha | Hugging Face, uso con llama.cpp |
| Gemma 4 31B instruct (modelo original de la familia) | 31B | no disponible | no aplica | licencia Gemma (verificar) | Pesos originales en Hugging Face |
| Alternativas de 30-32B en GGUF para ROCm | 30-32B | variable | Q4_K_M y otras | variable | llama.cpp, Ollama, vLLM |

La comparativa se limita a la información disponible; no se han localizado datos de rendimiento comparado entre este paquete y alternativas equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB de tamaño, 0 descargas y 0 likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured"; no hay garantía publicada de que la salida coincida con llama.cpp ni de que los kernels generados sean numéricamente correctos.
- Visión y audio no están soportados por Loom aunque el modelo original sí los admite; no debe asumirse paridad funcional con el checkpoint de origen.
- El muestreo (`temperature`, `top_k`, `seed`) figura como "not determined": el comportamiento de la distribución de primer token no está verificado.
- La licencia Apache 2.0 se declara a nivel de paquete, pero el modelo base es un derivado de Gemma; es imprescindible verificar la licencia del checkpoint original antes de uso comercial.
- No hay información sobre sesgos, alucinación, idiomas soportados ni calidad del fine-tuning `scotoma-2`; no se puede evaluar su comportamiento en dominios específicos.
- El contexto efectivo es de 53.248 tokens por petición, inferior al que el modelo base pudiera soportar; el límite lo impone el preset de Loom.
- La concurrencia está limitada a 4 peticiones simultáneas, insuficiente para cargas de producción de alta demanda.
- El paquete solo funciona con el runtime `hrx-loom` 0.2.0 sobre gfx1151 y gfx1201; no es portable a otras GPUs ni a otros motores de inferencia sin conversión.
- El identificador del modelo base (`gemma-4-31B-it`) y la fecha de creación (noviembre de 2026) no han podido contrastarse con fuentes independientes en la búsqueda web realizada, que devolvió únicamente resultados sobre el producto Loom de grabación de pantalla y la marca de ropa Loom, sin relación con este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-ReadyArt_gemma-4-31B-it-scotoma-2-loom
- Modelo base GGUF en Hugging Face: https://huggingface.co/bartowski/ReadyArt_gemma-4-31B-it-scotoma-2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
