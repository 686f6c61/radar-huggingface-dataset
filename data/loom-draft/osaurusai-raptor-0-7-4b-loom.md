# loom-draft/OsaurusAI-Raptor-0.7-4B-loom

## Resumen

OsaurusAI-Raptor-0.7-4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `OsaurusAI/Raptor-0.7-4B-GGUF`, concretamente del fichero `Raptor-0.7-4B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está pensado para ejecutarse sobre las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata por tanto de un modelo nuevo, sino de un artefacto de empaquetado para el runtime `loom-serve` del ecosistema Loom de AMD.

El modelo subyacente es un transformer de 4.000 millones de parámetros (según el sufijo "4B" del nombre) distribuido originalmente en cuantización Q4_K_M. El paquete expone una API compatible con OpenAI para `/v1/chat/completions`, soporta tool calling y dispone de un modo de razonamiento ("thinking") activado por defecto, con un contexto declarado de 262.144 tokens por petición y hasta cuatro peticiones concurrentes.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de 4B con contexto muy largo en hardware AMD consumer y de estación de trabajo (Strix Halo y R9700) mediante kernels generados por `loom-next`, sin depender de llama.cpp. La licencia Apache 2.0 del paquete facilita su integración, aunque el rendimiento y la corrección frente a llama.cpp no se han vuelto a medir para este paquete concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla variante en la información disponible) |
| Parámetros totales | 4B (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF de origen); el paquete Loom usa los pesos de ese GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Raptor-0.7-4B-Q4_K_M.gguf`) empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) más `tokenizer.json` y `llm_config.json` |

Otros datos operativos declarados en la tarjeta:

| Parámetro | Valor |
|---|---|
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí, estilo OpenAI (`tools` / `tool_calls`) |
| Razonamiento | Activado por defecto; `chat_template_kwargs: {"enable_thinking": false}` lo desactiva; `reasoning_effort`: low, high (por defecto high) |
| Decodificación especulativa | No aplicable |
| Entrada de imagen | No determinado |
| Entrada/salida de audio | No determinado |
| Muestreo | No determinado |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su naturaleza de transformer de 4B en formato GGUF. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se especifica la variante arquitectónica (atención estándar, atención lineal, híbrida, etc.).

Lo que sí documenta el paquete es la capa de ejecución: `loom-next` genera kernels y programas `.loom` para las GPU AMD objetivo (gfx1151 y gfx1201) a partir del GGUF sin modificarlo, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalización en GPU (`completion_spin_ns=4294967295`). El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificación sha256 por parte de `loom-fetch`. No hay innovaciones de entrenamiento destacables porque el paquete no entrena: solo reempaqueta.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI.
- Razonamiento en modo "thinking" activado por defecto, con niveles de esfuerzo `low` y `high`.
- Tool calling estilo OpenAI, con soporte de bucles multi-turno de agente (según los gates `agent` y `agent_think_off` descritos, aunque sin mediciones registradas para este paquete).
- Contexto largo: hasta 262.144 tokens por petición, adecuado para documentos extensos.
- Concurrencia de hasta cuatro peticiones simultáneas.
- Capacidades multilingües: no disponibles.
- Visión: no determinado (el gate `vision` existe en el marco de pruebas, pero no hay resultado registrado).
- Audio: no determinado.
- Decodificación especulativa: no aplicable en este paquete.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola petición y responder preguntas sobre ellos sin trocear el contenido.
- Asistentes con tool calling en local: gracias al soporte de `tools`/`tool_calls` estilo OpenAI, se puede integrar en un bucle de agente que consulte APIs internas, bases de datos o el sistema de ficheros, ejecutándose íntegramente en una GPU AMD Strix Halo o R9700.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete está generado específicamente para gfx1151 y gfx1201, lo que permite servir el modelo en equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700 sin depender de llama.cpp ni de toolchains NVIDIA.
- Razonamiento con esfuerzo configurable: para tareas de análisis que requieren cadenas de pensamiento se usa `reasoning_effort: high`; para respuestas rápidas de chat se desactiva el thinking con `enable_thinking: false`, reduciendo latencia.
- Prototipado de aplicaciones LLM con API OpenAI: al exponer `/v1/chat/completions`, cualquier cliente compatible con OpenAI (SDKs de Python, LangChain, etc.) puede apuntar a `http://127.0.0.1:8080` y funcionar sin cambios de código.
- Evaluación de la cadena Loom frente a llama.cpp: el paquete incluye gates de corrección (`golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, etc.) que permiten verificar que los kernels generados producen la misma salida que la referencia de llama.cpp sobre el mismo GGUF.
- Servicio local multiusuario ligero: con cuatro peticiones concurrentes y un pool de memoria fijo, encaja en un servicio interno de baja concurrencia donde la previsibilidad de memoria importa más que el throughput máximo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de corrección figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el peso en Q4_K_M de un modelo de 4B ronda los 2,5-3 GB, pero la cifra exacta del paquete no se documenta.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete está orientado a hardware AMD con soporte ROCm; no se menciona compatibilidad con GPU NVIDIA ni con iGPU distintas de Strix Halo.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado vía pipx, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Parámetros de ejecución recomendados por la tarjeta: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (las filas de rendimiento no se han vuelto a medir).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| OsaurusAI-Raptor-0.7-4B-loom | 4B | 262.144 tokens | Apache 2.0 | Paquete Loom sobre GGUF Q4_K_M; `loom-serve` | Orientado a AMD Strix Halo y R9700 |
| OsaurusAI/Raptor-0.7-4B-GGUF (modelo base) | 4B | no disponible | no disponible | GGUF; llama.cpp y otros runtimes GGUF | Checkpoint original sin reempaquetar |
| Alternativas de 4B en GGUF (p. ej. familias Qwen o Llama de 3-4B) | 3-4B | variable | variable | GGUF; llama.cpp, Ollama | Comparativa no disponible con datos verificados en esta búsqueda |

No se dispone de datos de rendimiento comparado con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El paquete no aporta mediciones de rendimiento ni de corrección para este modelo concreto: todos los gates figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con llama.cpp en esta versión.
- El modelo base es de 4B parámetros: capacidad de razonamiento y conocimiento factual limitados frente a modelos mayores, con mayor riesgo de alucinación en dominios especializados.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Visión, audio y muestreo figuran como "no determinado"; no deben asumirse capacidades multimodales.
- La decodificación especulativa no está disponible en este paquete.
- La licencia Apache 2.0 se declara a nivel de paquete; no se documenta la licencia del checkpoint base `OsaurusAI/Raptor-0.7-4B-GGUF`, que conviene verificar antes de uso comercial.
- Dependencia de hardware AMD específico (gfx1151, gfx1201) y del runtime `hrx-loom` 0.2.0; no hay soporte documentado para otras GPU.
- El paquete tiene cero descargas y cero "likes" en el momento de la consulta, sin comunidad ni validación externa.
- El límite de salida es de 4.096 tokens, lo que puede ser insuficiente para tareas de generación extensa pese al contexto de entrada de 262.144 tokens.
- El estado de los sesgos del modelo base no está documentado.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/OsaurusAI-Raptor-0.7-4B-loom
- Modelo base GGUF: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de búsqueda web obtenidos corresponden a servicios y marcas homónimas sin relación con este modelo (Loom, el grabador de pantalla, y Loom, la marca de ropa), por lo que no se incluyen como enlaces relevantes.
