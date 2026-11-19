# loom-draft/bartowski-tencent_UI-Mate-9B-loom

## Resumen

El paquete `loom-draft/bartowski-tencent_UI-Mate-9B-loom` es una distribución en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF `bartowski/tencent_UI-Mate-9B-GGUF`, concretamente la cuantización `Q4_K_M`. Lo publica el usuario `loom-draft` y está orientado a su ejecución en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso, y se distribuye con licencia Apache 2.0.

El modelo subyacente es Tencent UI-Mate 9B, un modelo multimodal de tipo image-text-to-text (acepta imágenes y texto y produce texto) con capacidad de razonamiento explícito ("thinking"). El paquete Loom no modifica los pesos: empaqueta el GGUF original junto con kernels generados para el backend AMD y una configuración de servicio que expone una API compatible con OpenAI.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal de 9B con ventana de contexto de 262.144 tokens; por otro, ilustra el ecosistema Loom de despliegue sobre GPU AMD, una alternativa a llama.cpp en hardware Radeon. No obstante, el repositorio no incluye mediciones de rendimiento ni resultados de las puertas de corrección, y la información pública sobre el modelo base es escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no publicados en la información disponible) |
| Parámetros totales | 9B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF); proyector multimodal en bf16 (`mmproj-tencent_UI-Mate-9B-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado dentro de un paquete Loom con `model.json` y programas `.loom`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Tencent UI-Mate 9B: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se conoce es que se trata de un modelo multimodal con entrada de imagen y texto, que emplea un proyector multimodal separado (`mmproj-tencent_UI-Mate-9B-bf16.gguf`) y que incorpora un modo de razonamiento ("thinking") activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

El paquete Loom en sí no reentrena ni modifica el checkpoint: genera kernels específicos para las GPU AMD objetivo (gfx1151 y gfx1201) y una configuración de servicio. La tarjeta menciona explícitamente que no se emplean decodificación especulativa ni ajuste de esfuerzo de razonamiento ("reasoning effort: not applicable"). El servidor admite 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por petición (preset `max_tokens`).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto y desactivable por petición.
- Entrada de imágenes mediante partes `image_url` al estilo OpenAI, con proyector multimodal bf16.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Bucles de agente multi-turno con reutilización de historial (según las puertas de corrección `agent` y `agent_think_off` definidas, aunque sin mediciones registradas).
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas.
- API compatible con OpenAI (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio de entrada o salida: no soportado.
- Decodificación especulativa: no aplicable en este paquete.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar contratos, informes o bases de código completas en una sola petición sin trocear el contenido.
- Automatización de atención al cliente con imágenes: la entrada multimodal permite adjuntar capturas de pantalla o fotos de producto en conversaciones multi-turno, con tool calling para consultar sistemas internos.
- Agentes de automatización de flujos: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir agentes que consulten APIs, ejecuten acciones y mantengan historial de conversación.
- Extracción de información de documentos escaneados: combinando entrada de imagen y contexto largo, el modelo puede transcribir y estructurar datos de formularios o facturas.
- Asistencia a desarrolladores sobre GPU AMD: el paquete está pensado para desplegarse en Strix Halo y Radeon AI PRO R9700, por lo que encaja en entornos de desarrollo con hardware Radeon que necesiten un endpoint compatible con OpenAI.
- Razonamiento paso a paso en tareas analíticas: el modo thinking activado por defecto permite obtener cadenas de razonamiento antes de la respuesta final, útil en tareas de clasificación, diagnóstico o resolución de problemas.
- Prototipado local sin dependencia de la nube: al ser un GGUF Q4_K_M de 9B con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo con GPU AMD de 32 GB y servir como backend local de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("not yet re-measured"), y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) no tienen ejecuciones registradas. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está diseñado para GPU con 32 GB (Radeon AI PRO R9700) y para el sistema integrado Strix Halo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPU de consumo distintas de las indicadas; no hay datos para RTX 4090, A100 o H100.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalación vía pipx), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones recomendadas en la tarjeta: `--pool_backing=fixed --parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles (no se han publicado mediciones).
- Concurrencia: 4 peticiones simultáneas; máximo de 4.096 tokens de salida por petición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (modelos multimodales de ~9B). Como referencia estructural, el paquete se posiciona frente a la ejecución del mismo GGUF con llama.cpp, pero la tarjeta no aporta cifras comparativas ("not yet re-measured").

## Limitaciones y advertencias

- No hay mediciones de rendimiento ni de corrección publicadas para este paquete; todas las puertas de calidad figuran como "not yet re-measured".
- La información sobre el modelo base (arquitectura, datos de entrenamiento, idiomas, sesgos) no está disponible en la documentación proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- El paquete está ligado a hardware AMD concreto (gfx1151 y gfx1201) y a la versión `hrx-loom[hf]==0.2.0`; no se garantiza su funcionamiento en otras GPU o versiones.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens si no se desactiva explícitamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original de Tencent, ya que la tarjeta solo declara la licencia del paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los archivos podrían no estar materializados o que el paquete es meramente descriptivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-tencent_UI-Mate-9B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/tencent_UI-Mate-9B-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Repositorio ROCm hrx-system: https://github.com/ROCm/hrx-system
