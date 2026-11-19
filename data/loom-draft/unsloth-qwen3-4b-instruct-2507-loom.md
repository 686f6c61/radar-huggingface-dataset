# loom-draft/unsloth-Qwen3-4B-Instruct-2507-loom

## Resumen

`loom-draft/unsloth-Qwen3-4B-Instruct-2507-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-4B-Instruct-2507-GGUF`, en su cuantización `Q4_K_M`. Lo publica el usuario `loom-draft` y está pensado específicamente para ejecutarse sobre GPUs AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso.

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parámetros de la familia Qwen3, en su variante instruct de julio de 2025. El paquete Loom no altera los pesos: los envuelve con kernels generados y una configuración de servido (`llm_config.json`) que expone una API compatible con OpenAI. La relevancia de esta ficha es acotada: documenta una vía de despliegue en hardware AMD ROCm, no un nuevo modelo.

La información publicada es escasa y, en el momento de redactar esta ficha, el paquete no tiene descargas ni valoraciones, y las mediciones de rendimiento y las puertas de corrección aparecen como "not yet re-measured" en ambas GPUs. Cualquier dato de rendimiento debe tratarse, por tanto, como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507); empaquetado como programas Loom generados |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens por petición (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible en la información del paquete |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-4B-Instruct-2507-Q4_K_M.gguf`) más programas `.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza el checkpoint GGUF de Unsloth derivado de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros. La capa Loom consiste en kernels generados automáticamente por `loom-next` para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (R9700), junto con un `model.json` que fija la configuración de servido: contexto de 40.960 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni innovaciones técnicas del paquete más allá de la generación de kernels y del soporte de tool calling estilo OpenAI. Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, etc.) están definidas pero sin mediciones registradas.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Soporte de hasta 4 peticiones concurrentes y 40.960 tokens de contexto por petición.
- Salida máxima de 4.096 tokens por preset.
- Modo de razonamiento/thinking: no aplicable en este paquete.
- Decodificación especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Comportamiento de muestreo (`temperature`, `top_k`, `seed`): marcado como "not determined" en la tarjeta.
- Capacidades multilingües: no disponibles en la información del paquete.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: servir el paquete con `loom-serve` sobre una R9700 o Strix Halo y consumirlo con clientes compatibles con OpenAI, aprovechando el contexto de 40.960 tokens para conversaciones multi-turno largas.
- Automatización de agentes con tool calling: integrar el endpoint en un bucle de agente que invoque funciones externas (consultas a bases de datos, APIs internas) mediante `tool_calls`, con hasta 4 peticiones concurrentes.
- Procesamiento de documentos extensos: resúmenes y extracción de información sobre documentos de hasta ~40k tokens, útil para informes técnicos o contratos de longitud media.
- Prototipado en hardware ROCm: validar pipelines de inferencia en GPUs AMD antes de migrar a modelos mayores, usando el paquete como referencia de compatibilidad con Loom.
- Generación de código asistida en entornos con requisitos de soberanía de datos: al ejecutarse localmente y con licencia Apache 2.0, permite desplegar asistencia de código sin enviar datos a terceros.
- Chatbot de soporte interno de baja latencia: al ser un modelo de 4B en Q4_K_M, cabe holgadamente en 32 GB de VRAM y deja margen para el resto del sistema; adecuado para preguntas frecuentes y clasificación de tickets.
- Evaluación comparativa de runtimes: usar las puertas de corrección de Loom (`golden`, `compare`, `agent`) para contrastar la salida frente a llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: un modelo de 4B en Q4_K_M ocupa del orden de 2,5-3 GB de pesos; el paquete fija un pool de memoria con `--pool_backing=fixed`, cuyo tamaño exacto no se detalla en la información disponible.
- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-4B-Instruct-2507-loom | 4B (denso) | 40.960 tokens | Apache 2.0 | GGUF Q4_K_M + programas Loom | Paquete específico para AMD Strix Halo y R9700; sin benchmarks publicados |
| unsloth/Qwen3-4B-Instruct-2507-GGUF | 4B (denso) | no disponible en esta ficha | Apache 2.0 | GGUF | Checkpoint de origen, sin empaquetado Loom; ejecutable con llama.cpp |
| Qwen3-4B-Instruct-2507 (original) | 4B (denso) | no disponible en esta ficha | Apache 2.0 | safetensors y GGUF | Modelo base de la familia Qwen3; referencia de calidad |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Paquete sin evidencia de calidad: todas las puertas de corrección y las mediciones de rendimiento están pendientes de re-medición.
- Sin descargas ni valoraciones: no hay señal de uso en producción.
- Sin datos de sesgos, alucinación o comportamiento multilingüe específicos del paquete; deben evaluarse sobre el modelo base.
- El muestreo está marcado como "not determined": el comportamiento de `temperature`, `top_k` y `seed` no está verificado.
- Contexto limitado a 40.960 tokens y salida máxima de 4.096 tokens por preset; no apto para tareas que requieran ventanas mayores sin reconfiguración.
- Solo dos plataformas AMD documentadas (gfx1151 y gfx1201); no hay garantía de funcionamiento en otras GPUs.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de puertas de corrección superadas desaconseja su uso en producción sin validación propia.
- El nombre "Loom" colisiona con el producto de grabación de pantalla de Atlassian; los resultados de búsqueda web no aportan información técnica sobre este paquete.

## Enlaces

- [Hugging Face: loom-draft/unsloth-Qwen3-4B-Instruct-2507-loom](https://huggingface.co/loom-draft/unsloth-Qwen3-4B-Instruct-2507-loom)
- [Modelo base GGUF: unsloth/Qwen3-4B-Instruct-2507-GGUF](https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF)
- [Repositorio Loom (ROCm/hrx-system)](https://github.com/ROCm/hrx-system)
- [Generador loom-next](https://github.com/loom-fun/loom-next)
- [Sitio del ecosistema Loom](https://loom-fun.github.io/loom-dev/)
