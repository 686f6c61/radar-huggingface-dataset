# loom-draft/bartowski-Qwen2.5-72B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado, sino un paquete de despliegue para el runtime AMD Loom. Se trata de una conversión del checkpoint GGUF `Qwen2.5-72B-Instruct-Q4_K_M.gguf` de bartowski (a su vez derivado del modelo Qwen2.5-72B-Instruct de Alibaba) a programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle. El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), sirviendo una API compatible con OpenAI.

El interés práctico es la portabilidad: el paquete abstrae la carga de pesos y la ejecución de kernels para hardware AMD vía IREE/ROCm, ofreciendo `/v1/chat/completions` con soporte de tool calling, contexto de 32.768 tokens por petición y cuatro peticiones concurrentes. No hay pesos nuevos ni fine-tuning: el autor declara explícitamente que el checkpoint GGUF subyacente está "unmodified".

La relevancia es acotada. El paquete tiene cero descargas y cero likes, se publicó en noviembre de 2026 y sus propias tablas de rendimiento y corrección indican "not yet re-measured" en todas las filas, es decir, no hay evidencia publicada de rendimiento ni de paridad con llama.cpp para esta conversión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-72B-Instruct); el paquete Loom genera kernels para gfx1151 y gfx1201 |
| Parametros totales | 72B (heredados del checkpoint base Qwen2.5-72B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición (límite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible en la información del paquete |
| Licencia | other |
| Formato de pesos | GGUF de origen; empaquetado como `weights.loom` y programas `program/*.loom` |

## Arquitectura y entrenamiento

El paquete no entrena nada. Reutiliza el checkpoint `Qwen2.5-72B-Instruct-Q4_K_M.gguf` de bartowski, que corresponde a un transformer decoder-only de 72.000 millones de parámetros cuantizado a Q4_K_M (bloques de 4 bits con escalas de 6 bits en la mayoría de tensores). Sobre ese GGUF, `loom-next` genera programas `.loom` específicos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (R9700), junto con `tokenizer.json`, `llm_config.json` y `model.json` con los ficheros fuente fijados por sha256 que `loom-fetch` verifica.

El runtime se apoya en IREE con backend ROCm/HIP. El propio README describe dos modos de operación relevantes para el rendimiento: `completion_spin_ns=4294967295`, que activa espera activa de las finalizaciones de GPU consumiendo CPU, y `--pool_backing=fixed`, que reserva el pool de memoria por adelantado en lugar de crecimiento elástico. En R9700 se añade `--parameter_mode=preload`, que solo cambia cómo se cargan los pesos en el host. No se documentan datos de entrenamiento, composición del dataset, RLHF ni DPO para este paquete, porque no se ha entrenado; cualquier dato de ese tipo correspondería al modelo Qwen2.5-72B-Instruct original, no incluido en la información proporcionada.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: campos `tools` y `tool_calls` en la petición y la respuesta.
- Contexto de 32.768 tokens por petición, suficiente para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por respuesta (preset `max_tokens`).
- Sin modo de razonamiento ni "thinking": el README marca reasoning/thinking como "not applicable".
- Sin decodificación especulativa: marcada como "not applicable".
- Sin entrada de imagen ni de audio.
- Muestreo: estado "not determined" (temperatura, top_k y semilla no verificados en este paquete).
- Capacidades multilingües: no disponibles en la información del paquete.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: servir el modelo con `loom-serve` en una R9700 o en un Strix Halo y consumirlo desde cualquier cliente compatible con OpenAI, sin depender de APIs externas.
- Automatización de soporte técnico con contexto largo: los 32.768 tokens permiten adjuntar manuales, historiales de tickets y transcripciones en una sola petición, manteniendo coherencia en conversaciones de varias decenas de turnos.
- Pipelines de agentes con herramientas: el soporte de `tools`/`tool_calls` permite encadenar llamadas a funciones (consulta de bases de datos, ejecución de scripts, APIs internas) en bucles multi-turno, con hasta cuatro agentes concurrentes por instancia.
- Procesamiento por lotes de documentación: resumen, extracción de entidades y clasificación sobre documentos de hasta 32k tokens, ejecutando varias peticiones en paralelo dentro del límite de concurrencia del preset.
- Entorno de evaluación y desarrollo para hardware AMD: el paquete sirve como banco de pruebas para validar kernels generados por `loom-next` contra la referencia de llama.cpp mediante las puertas de corrección (`golden`, `compare`, `agent`).
- Despliegue en equipos compactos Strix Halo: un APU Ryzen AI Max+ 395 con memoria unificada puede alojar el modelo cuantizado sin GPU discreta, útil para prototipos y demos presenciales.
- Generación de código asistida en local: el modelo base Qwen2.5-72B-Instruct es competente en código, y el tool calling permite integrarlo en flujos de edición y revisión, aunque sin garantías de rendimiento medidas en este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye tablas de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas filas indican "the results for this package are not yet re-measured". Lo mismo ocurre con las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`), todas marcadas como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de 72B, lo que sitúa los pesos en torno a 40-45 GB; el paquete no publica una cifra oficial de VRAM ni de memoria unificada necesaria.
- Radeon AI PRO R9700: 32 GB de VRAM según el README; el preset usa `--parameter_mode=preload`, lo que sugiere que la carga se gestiona de forma específica para ese límite de memoria, pero no se documenta si los pesos caben íntegramente.
- Ryzen AI Max+ 395 "Strix Halo" (gfx1151): APU con memoria unificada; el README no indica la cantidad necesaria.
- GPU consumer: no hay datos que confirmen que quepa en GPUs consumer de 24 GB o menos.
- Despliegue: exclusivamente mediante `hrx-loom[hf]==0.2.0` (`loom-fetch` y `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete.
- En hosts con memlock de 8 MiB, el README recomienda lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/bartowski-Qwen2.5-72B-Instruct-loom | 72B | 32.768 tokens por petición | GGUF convertido a `.loom` | other | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| bartowski/Qwen2.5-72B-Instruct-GGUF | 72B | el del modelo base | GGUF | según modelo base | Referencia directa; ejecutable con llama.cpp en múltiples backends |
| Qwen2.5-72B-Instruct (original) | 72B | el del modelo base | safetensors | según Qwen | Pesos completos, sin cuantizar |

La comparación con alternativas de la misma categoría (otros paquetes Loom para GPUs AMD) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Paquete sin evidencia de calidad: todas las puertas de corrección y las mediciones de rendimiento están sin re-medir; no hay garantía publicada de paridad con llama.cpp para esta conversión.
- Cero descargas y cero likes; sin validación por parte de la comunidad.
- Licencia "other": es imprescindible revisar los términos del modelo base Qwen2.5-72B-Instruct y del GGUF de bartowski antes de cualquier uso comercial.
- Hardware restringido: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para otras GPUs AMD ni para NVIDIA.
- Muestreo no verificado: el README marca la fila `sampling` como "not determined", por lo que el comportamiento de temperatura, top_k y semilla no está confirmado.
- Contexto limitado a 32.768 tokens por petición, por debajo de la ventana nativa del modelo base.
- Concurrencia máxima de 4 peticiones y salida máxima de 4.096 tokens, insuficientes para cargas de producción de alto volumen.
- Sin modo de razonamiento, sin visión y sin audio.
- Riesgo de alucinación y sesgos: no evaluados en este paquete; serían los heredados del modelo base, no documentados aquí.
- Idiomas soportados no declarados en el paquete.
- Los resultados de búsqueda web obtenidos corresponden a productos homónimos (Loom la herramienta de grabación de pantalla y la marca de ropa Loom), sin relación con este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-72B-Instruct-loom
- GGUF de origen: https://huggingface.co/bartowski/Qwen2.5-72B-Instruct-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
