# loom-draft/bartowski-empero-ai_Qwythos-9B-v2-loom

## Resumen

El paquete `loom-draft/bartowski-empero-ai_Qwythos-9B-v2-loom` es una distribución empaquetada para el ecosistema Loom del checkpoint GGUF `bartowski/empero-ai_Qwythos-9B-v2-GGUF`, concretamente la cuantización Q4_K_M. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de despliegue generado con la herramienta `loom-next` que incluye programas `.loom` y un fichero `model.json` con la configuración del preset, orientado a GPUs AMD concretas: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, `empero-ai_Qwythos-9B-v2`, es un modelo de 9B parámetros en formato GGUF con capacidades multimodales (entrada de imagen en el modelo original), tool calling y modo de razonamiento opcional. El paquete Loom expone estos pesos a través de un servidor compatible con la API de OpenAI (`/v1/chat/completions`) e incorpora decodificación especulativa mediante MTP (Multi-Token Prediction) con profundidad 3, activada por defecto.

La relevancia de este repositorio es acotada pero específica: ofrece una vía de despliegue optimizada para hardware AMD con soporte ROCm, algo poco común en el ecosistema de inferencia local, donde el soporte de primera clase suele estar dominado por CUDA. El repositorio no tiene descargas ni interacciones registradas y sus mediciones de rendimiento y correctitud figuran como «no re-measured» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `empero-ai_Qwythos-9B-v2`, transformer según nomenclatura estándar; detalles no confirmados) |
| Parámetros totales | 9B (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (única incluida en el paquete; el repo base de bartowski ofrece otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`empero-ai_Qwythos-9B-v2-Q4_K_M.gguf`) + programas `.loom` + `model.json` |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificación especulativa | MTP, profundidad 3, activada por defecto |
| Plataformas objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base `empero-ai_Qwythos-9B-v2` en la documentación proporcionada. El paquete Loom no entrena ni modifica los pesos: reempaqueta el GGUF de bartowski para su ejecución mediante el runtime `loom-serve`, generando kernels específicos para las arquitecturas AMD gfx1151 y gfx1201.

La innovación técnica relevante del paquete es la integración de decodificación especulativa mediante MTP (Multi-Token Prediction) con profundidad 3, activada por defecto, junto con un gestor de memoria con `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga anticipada de pesos en el host). El runtime expone un servidor compatible con OpenAI y admite modo de razonamiento controlable mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el parámetro `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición.
- Decodificación especulativa MTP con profundidad 3 para acelerar la generación.
- Contexto largo: hasta 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Entrada de imagen: el modelo base la soporta, pero Loom no la implementa (`image input: not supported by Loom`).
- Entrada y salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Ajuste de *reasoning effort*: no aplicable en este runtime.
- Muestreo (temperature, top_k, seed): estado «no determinado» en la tabla de características.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: el paquete está pensado para ejecutarse en GPUs Radeon AI PRO R9700 y APUs Strix Halo mediante `loom-serve`, lo que permite servir un modelo de 9B en hardware AMD sin depender de CUDA.
- Asistentes conversacionales con contexto largo: los 262.144 tokens por petición permiten mantener conversaciones multi-turno o procesar documentos extensos (hasta 32k documentos se mencionan en las pruebas de referencia `golden`).
- Automatización con tool calling: la integración de `tools`/`tool_calls` estilo OpenAI facilita conectar el modelo a funciones externas, APIs o bases de datos en flujos de agente.
- Pipelines de agentes multi-paso: la puerta de correctitud `agent` valida el bucle multi-turno de tool calling con reutilización de historial y renderizado exacto del prompt.
- Servicio de inferencia compatible con clientes OpenAI: al exponer `/v1/chat/completions`, se puede integrar con SDKs y herramientas existentes que ya hablan el protocolo de OpenAI sin adaptadores.
- Evaluación comparativa frente a llama.cpp: las puertas `golden`, `compare`, `logits` y `sampling` permiten verificar que la salida del runtime Loom coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.
- Prototipado en entornos con requisitos de razonamiento explícito: el modo thinking activable por petición permite alternar entre respuestas directas y cadenas de razonamiento según la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete «no se han vuelto a medir» en ambas plataformas (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201), y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un modelo de 9B en Q4_K_M ocupa típicamente en torno a 5-6 GB de pesos, pero el paquete no publica cifras de memoria del preset.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el paquete está dirigido a hardware AMD profesional/integrado con ROCm.
- Opciones de despliegue: `loom-serve` (runtime propio del ecosistema Loom), instalado vía `pipx install "hrx-loom[hf]==0.2.0"`; el modelo base también está disponible como GGUF para llama.cpp y otros runtimes compatibles.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp no se han vuelto a realizar para este paquete.
- Concurrencia soportada: 4 peticiones simultáneas.
- Flags de despliegue relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed`, `--parameter_mode=preload`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-empero-ai_Qwythos-9B-v2-loom` (este) | 9B | 262.144 | GGUF Q4_K_M + `.loom` | Apache 2.0 | Paquete para AMD Loom; MTP depth 3; sin benchmarks publicados |
| `bartowski/empero-ai_Qwythos-9B-v2-GGUF` (base) | 9B | no disponible | GGUF (múltiples cuantizaciones) | Apache 2.0 | Checkpoint original sin empaquetar; compatible con llama.cpp |
| Modelos de 9B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de alternativas concretas en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no incluye soporte de entrada de imagen, aunque el modelo base sí la tiene; Loom no la implementa.
- Las mediciones de rendimiento y todas las puertas de correctitud figuran como «not yet re-measured»: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp para este paquete concreto.
- El estado del muestreo (`temperature`, `top_k`, `seed`) aparece como «no determinado» en la tabla de características.
- El repositorio no registra descargas ni interacciones (0 descargas, 0 likes) y el tamaño del repo es 0.0 GB, lo que sugiere que el contenido puede no estar materializado o ser un artefacto recién creado.
- Compatibilidad limitada a hardware AMD específico (gfx1151 y gfx1201); no se documenta funcionamiento en GPUs NVIDIA ni en otras arquitecturas AMD.
- Licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia y condiciones del modelo base más allá de lo indicado en este repositorio.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base.
- La longitud de contexto de 262.144 tokens es por petición; con concurrencia de 4 el consumo de memoria puede escalar y no se publican cifras de VRAM del preset.
- Los resultados de la búsqueda web no aportan información sobre el modelo: corresponden a productos no relacionados (Loom.com, Loom.fr), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-empero-ai_Qwythos-9B-v2-loom
- Modelo base GGUF: https://huggingface.co/bartowski/empero-ai_Qwythos-9B-v2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
