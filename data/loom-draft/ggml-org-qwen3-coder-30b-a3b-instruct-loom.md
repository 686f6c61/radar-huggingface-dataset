# loom-draft/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom

## Resumen

El repositorio `loom-draft/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom` no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF`, en su variante `Q4_K_M`. El autor, `loom-draft`, lo publica para ejecutar Qwen3-Coder-30B-A3B-Instruct sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve` del ecosistema Loom, generado con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El modelo subyacente es Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo mezcla de expertos (MoE) con 30.500 millones de parámetros totales y 3.300 millones activos por token, especializado en generación de código e instrucciones. La relevancia de este paquete concreto reside en que ofrece una vía de servir ese modelo en hardware AMD consumer y profesional (APUs Strix Halo y GPU R9700) con una API compatible con OpenAI, soporte de tool calling y una ventana de contexto de 262.144 tokens por petición.

La licencia declarada es Apache 2.0, heredada del checkpoint base. La model card advierte de que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aún no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de rendimiento ni de equivalencia numérica frente a llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3-Coder-30B-A3B-Instruct); paquete de despliegue Loom con kernels generados |
| Parámetros totales | 30.500 millones (30B) |
| Parámetros activos | 3.300 millones (3B) por token |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf`) empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos: 30B parámetros totales con 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. Está afinado para instrucciones y especializado en código (`-Coder`), e incorpora soporte nativo de tool calling en estilo OpenAI. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El paquete Loom en sí no modifica los pesos: `loom-next` genera programas `.loom` y kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`). El runtime `loom-serve` expone un endpoint `/v1/chat/completions` compatible con OpenAI, admite 4 peticiones concurrentes, un máximo de 4.096 tokens de salida por preset y opciones de gestión de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`) y de espera activa de completaciones GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generación de texto y de código, con el ajuste específico para programación del modelo base Qwen3-Coder.
- Tool calling en estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes y SDK existentes.
- Contexto largo: 262.144 tokens por petición, adecuado para repositorios y documentos extensos.
- Concurrencia de 4 peticiones simultáneas en el servidor `loom-serve`.
- Sin modo de razonamiento/thinking: la model card marca "not applicable" para reasoning y reasoning effort.
- Sin decodificación especulativa, sin entrada de imagen y sin entrada/salida de audio (marcados como "not applicable").
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en IDE o CLI: el modelo puede autocompletar y explicar código con 262.144 tokens de contexto, suficiente para incluir varios ficheros de un repositorio en una sola petición y mantener coherencia entre módulos.
- Automatización de revisiones de pull requests: con tool calling se puede conectar a la API de GitHub para leer diffs, ejecutar linters y publicar comentarios, aprovechando la ventana de contexto para analizar el cambio completo.
- Agentes de refactorización multi-paso: el soporte de `tool_calls` permite encadenar lectura de ficheros, edición y ejecución de tests en un bucle de varias iteraciones sobre el endpoint local.
- Generación de tests unitarios: dado un fichero de código en el prompt, el modelo produce casos de prueba; el contexto largo permite incluir las dependencias y las interfaces relevantes.
- Chat de soporte técnico para desarrolladores: el endpoint OpenAI-compatible permite integrarlo en portales de documentación o helpdesk sin adaptar el cliente, con 4 peticiones concurrentes por instancia.
- Despliegue en estaciones de trabajo AMD: al ejecutarse sobre Strix Halo o Radeon AI PRO R9700 con `loom-serve`, permite tener un asistente de código local sin depender de servicios en la nube, útil en entornos con requisitos de confidencialidad.
- Documentación técnica automatizada: con contexto de 262k tokens se pueden resumir y generar referencias a partir de bases de código o manuales extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para el modelo base en esta información.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 30B parámetros totales ocupa aproximadamente 18-19 GB en pesos; a ello hay que sumar la caché KV para el contexto configurado, que con 262.144 tokens puede ser muy elevada y condicionar el despliegue real.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas explícitamente: no se mencionan NVIDIA (A100, H100, RTX 4090) ni otras GPU en la información proporcionada; el paquete está generado para las arquitecturas AMD indicadas.
- Cabe en GPU consumer: sí, en APUs Strix Halo con memoria unificada y en la R9700 de 32 GB, siempre que el contexto y el pool de memoria configurados quepan en la VRAM disponible.
- Opciones de despliegue: `loom-serve` (runtime del ecosistema Loom) con `loom-fetch` para descargar el paquete desde Hugging Face; el GGUF base puede servirse también con llama.cpp, aunque las mediciones comparativas de este paquete no están publicadas.
- Latencia y throughput: no disponibles; la model card no incluye cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (este paquete Loom) | 30B | 3B | 262.144 | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom; `loom-serve` en AMD gfx1151/gfx1201 |
| ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF (base) | 30B | 3B | 262.144 (según este paquete) | Apache 2.0 | GGUF; llama.cpp y otros runtimes GGUF |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos, por lo que la comparativa se limita a parámetros, contexto, licencia y vía de despliegue.

## Limitaciones y advertencias

- La model card no reporta mediciones de rendimiento ni de corrección para este paquete: las puertas de validación figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la de llama.cpp.
- El paquete está generado específicamente para AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se declara compatibilidad con otras GPU.
- El contexto máximo por petición es de 262.144 tokens, pero la memoria necesaria para la caché KV a esa longitud puede exceder la VRAM disponible; conviene validar la configuración real de memoria antes de producción.
- El preset limita la salida a 4.096 tokens (`max_tokens`), lo que puede ser insuficiente para generaciones largas.
- Solo 4 peticiones concurrentes por instancia; para cargas mayores se requiere escalar horizontalmente.
- Sin modo de razonamiento ni decodificación especulativa; sin soporte de imagen ni audio.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; son heredados del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Idiomas soportados no documentados en este paquete; conviene verificar el comportamiento multilingüe antes de usarlo en producción fuera del inglés.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y las condiciones de la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-Coder-30B-A3B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Runtime Loom (ROCm HRX): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
