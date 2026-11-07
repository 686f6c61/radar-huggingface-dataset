# loom-fun/unsloth-Qwen3.5-4B-loom

## Resumen

El modelo `loom-fun/unsloth-Qwen3.5-4B-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3.5-4B-GGUF`, en su cuantizacion `Q4_K_M`. Lo publica el autor `loom-fun` y esta pensado para ejecutarse sobre el runtime Loom (paquete `hrx-loom`) en GPUs AMD, en concreto sobre un Ryzen AI Max+ 395 "Strix Halo" con grafica Radeon 8060S. El modelo subyacente es Qwen3.5-4B de Alibaba, un LLM multimodal (texto e imagen) de la familia Qwen3.5, con modo de razonamiento y soporte de tool calling.

El interes practico del paquete reside en el motor de inferencia: Loom compila kernels especificos para el hardware objetivo y activa decodificacion especulativa (DFlash, con un drafter de 4B cuantizado Q8_0) por defecto. Segun las mediciones del autor, frente a llama.cpp con el mismo GGUF, Loom mejora la decodificacion en prompts cortos (+29 %) y el prefill entre +72 % y +110 % en documentos de 1k a 32k tokens, aunque empeora en decodificacion con contexto de 32k (-24 %).

La relevancia actual es doble: por un lado, demuestra una via de despliegue optimizada para hardware AMD de consumo (APUs Strix Halo con memoria unificada), un nicho poco cubierto por los stacks habituales centrados en CUDA; por otro, empaqueta un modelo multimodal de 4B con 262.144 tokens de contexto y tool calling bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en flujos de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; el paquete es un runtime Loom, no una arquitectura propia) |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF del checkpoint base); drafter DFlash en Q8_0; proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `model.json`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura de red neuronal nueva: envuelve el checkpoint `Qwen3.5-4B-Q4_K_M.gguf` de Unsloth, que corresponde a un transformer multimodal de la familia Qwen3.5 (texto e imagen, con proyector `mmproj-F16.gguf`). La innovacion del paquete esta en la capa de ejecucion: el flujo `loom-skills` genera programas `.loom` y kernels compilados para el dispositivo AMD objetivo, y el servidor `loom-serve` expone una API compatible con OpenAI. La decodificacion especulativa usa un modelo borrador DFlash (`AtomicChat/Qwen3.5-4B-DFlash-GGUF`, Q8_0) con profundidad 7, activada por defecto; el autor reporta una tasa de aceptacion del 41 % de tokens propuestos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base Qwen3.5-4B recibio RLHF, DPO u otras etapas de alineamiento; esos datos corresponden a la model card del modelo base y no se incluyen en la informacion proporcionada. El paquete incluye una bateria de validacion de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`) que compara la salida con una referencia de llama.cpp sobre el mismo GGUF; varias puertas (`agent_think_off`, `needle`, `needle_full`) figuran sin evidencia registrada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" opcional, desactivado por defecto y activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagenes en estilo OpenAI (`image_url`), con proyector `mmproj-F16.gguf`; tarea `image-text-to-text`.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno verificados por la puerta `agent`.
- Decodificacion especulativa integrada (DFlash, profundidad 7) activada por defecto, con salida identica a la decodificacion sin especulacion segun la puerta `spec`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Contexto de hasta 262.144 tokens por peticion y salida maxima de 4.096 tokens (preset `max_tokens`).
- Servidor con API compatible con OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`).
- No soporta audio (ni entrada ni salida) ni ajuste de esfuerzo de razonamiento (`reasoning effort`).

## Casos de uso

- Asistente conversacional local con imagenes: el modelo acepta partes `image_url` junto con texto, lo que permite construir un chatbot que responda sobre capturas, diagramas o documentos escaneados sin salir del equipo; el contexto de 262.144 tokens permite adjuntar historial largo y varias imagenes en la misma conversacion.
- Procesamiento de documentos extensos: con hasta 262.144 tokens por peticion y un prefill medido de 2.159 tok/s a 32k tokens en Loom, es adecuado para resumir, extraer entidades o responder preguntas sobre informes tecnicos o contractuales de decenas de miles de palabras.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y la puerta `agent` validada permiten montar flujos de varios pasos (consulta a APIs, calculo, escritura de ficheros) sobre el endpoint compatible con OpenAI, sin depender de la nube.
- Generacion de codigo asistida en el editor: el modelo base Qwen3.5-4B es de proposito general con capacidades de codigo; el paquete permite servirlo localmente en una APU Strix Halo y consumirlo desde plugins que hablen la API de OpenAI, manteniendo el codigo en la maquina.
- Despliegue en hardware AMD sin CUDA: para equipos con Ryzen AI Max+ 395 y Radeon 8060S, Loom ofrece un camino de inferencia con kernels nativos y decodificacion especulativa; el throughput medido (73,9 tok/s en prompts cortos con 4 streams agregados de 138,7 tok/s) es suficiente para uso interactivo individual o pequenos equipos.
- Prototipado de pipelines multimodales y de agentes: la licencia Apache 2.0 y el formato GGUF facilitan integrar el modelo en pruebas de concepto comerciales, con la posibilidad de comparar el rendimiento de Loom frente a llama.cpp sobre el mismo checkpoint.
- Evaluacion de motores de inferencia: el paquete incluye `REPORT.md` con la metodologia de medicion y `info.json` con evidencias de las puertas de correctitud, lo que lo convierte en un banco de pruebas reproducible para comparar runtimes en AMD.

## Benchmarks y rendimiento

El autor publica mediciones de throughput del motor (no benchmarks de calidad tipo MMLU o HumanEval) comparando Loom con llama.cpp sobre el mismo GGUF, en un Ryzen AI Max+ 395 con Radeon 8060S y Ubuntu 26.04:

| Metrica | llama.cpp | Loom | Diferencia |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | 57,3 | 73,9 | +29 % |
| Decodificacion tok/s, contexto 2k | 59,9 | 68,7 | +15 % |
| Decodificacion tok/s, contexto 32k | 52,9 | 40,3 | -24 % |
| Prefill tok/s, documento 1k | 1.498,7 | 2.574,8 | +72 % |
| Prefill tok/s, documento 2k | 1.511,7 | 2.635,8 | +74 % |
| Prefill tok/s, documento 8k | 1.518,4 | 2.686,1 | +77 % |
| Prefill tok/s, documento 16k | 1.273,3 | 2.493,2 | +96 % |
| Prefill tok/s, documento 32k | 1.029,4 | 2.159,5 | +110 % |
| 4 streams, decodificacion agregada tok/s | 127,9 | 138,7 | +8 % |
| Tokens del drafter aceptados (especulativa) | no medido | 41 % | no aplica |

Notas de medicion del autor: llama.cpp build `llamacpp-rocm/b1369` con `--spec-type draft-dflash` y drafter Q8_0; Loom con especulacion DFlash a profundidad 7; tiempos del lado del cliente en Loom y del servidor en llama.cpp; 1-2 ejecuciones por valor en decodificacion y prefill (media) y 1 en 4 streams (mediana); medido el 2026-11-06.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque del autor usa `--memory_bytes=26000000000` (unos 26 GB) en una APU con memoria unificada; el checkpoint Q4_K_M de 4B mas el proyector F16 y el drafter Q8_0 ocupan bastante menos, pero el runtime reserva un presupuesto de memoria configurable.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (Strix Halo), el dispositivo sobre el que se midio. No hay datos publicados para otras GPU AMD ni para NVIDIA.
- GPU de consumo: el paquete esta orientado a APUs AMD con memoria unificada; no se documenta compatibilidad con GPU de consumo NVIDIA (RTX 4090, etc.).
- Opciones de despliegue: `hrx-loom` (instalacion via `pip install "hrx-loom[hf]"`), con `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu` para servirlo. El autor compara contra llama.cpp con soporte ROCm; no se mencionan vLLM, TGI ni Ollama para este paquete.
- Latencia y throughput: 73,9 tok/s de decodificacion en prompts cortos y 138,7 tok/s agregados con 4 streams; prefill de 2.574 a 2.686 tok/s entre 1k y 8k tokens, y 2.159 tok/s a 32k. La decodificacion cae a 40,3 tok/s con contexto de 32k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor / formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3.5-4B-loom | 4B | 262.144 | Loom (AMD), GGUF Q4_K_M | Apache 2.0 | Paquete optimizado para Strix Halo; decodificacion especulativa DFlash por defecto |
| unsloth/Qwen3.5-4B-GGUF (modelo base) | 4B | no disponible en la informacion | GGUF para llama.cpp y otros | Apache 2.0 (heredada) | Mismo checkpoint sin empaquetar; sirve de referencia en las mediciones |
| AtomicChat/Qwen3.5-4B-DFlash-GGUF | 4B | no disponible | GGUF Q8_0 | no disponible | Modelo borrador para decodificacion especulativa, usado por ambos motores |

La comparacion con alternativas de otra familia (por ejemplo, otros LLM multimodales de 4B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete esta validado unicamente en un dispositivo concreto (Ryzen AI Max+ 395, Radeon 8060S, Ubuntu 26.04, `hrx-loom 0.1.0`); el rendimiento en otro hardware AMD no esta documentado.
- La decodificacion con contexto de 32k es un 24 % mas lenta que en llama.cpp, por lo que cargas de trabajo con ventanas muy largas pueden no beneficiarse del cambio de motor.
- La salida maxima esta limitada a 4.096 tokens por peticion (preset `max_tokens`), lo que restringe tareas de generacion larga.
- La concurrencia esta limitada a 4 peticiones simultaneas.
- No hay evidencia registrada para las puertas `agent_think_off`, `needle` y `needle_full`; el comportamiento del modo thinking en bucles de herramientas y la recuperacion en contextos muy largos no estan verificados por el autor.
- No soporta audio ni ajuste de esfuerzo de razonamiento.
- No se dispone de informacion sobre sesgos, tasa de alucinacion ni idiomas soportados del modelo base; deben consultarse en la model card de Qwen3.5-4B.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del modelo borrador DFlash, cuya licencia no figura en la informacion disponible.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-06); es un artefacto reciente y poco contrastado por la comunidad.
- Los resultados de busqueda web devuelven mayoritariamente enlaces a Loom (la herramienta de grabacion de video) y a la documentacion de Unsloth sobre Qwen3.5, no al proyecto Loom de ROCm; no deben confundirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.5-4B-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Modelo borrador DFlash: https://huggingface.co/AtomicChat/Qwen3.5-4B-DFlash-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Documentacion de Unsloth sobre Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guia de fine-tuning de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
