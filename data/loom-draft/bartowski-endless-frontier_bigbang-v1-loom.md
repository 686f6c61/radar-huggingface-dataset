# loom-draft/bartowski-endless-frontier_BigBang-v1-loom

## Resumen

`loom-draft/bartowski-endless-frontier_BigBang-v1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/endless-frontier_BigBang-v1-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo entrenado desde cero, sino de una envoltura de inferencia optimizada para GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se genera con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo base es multimodal (pipeline `image-text-to-text`), con soporte de vision mediante un proyector `mmproj-endless-frontier_BigBang-v1-bf16.gguf`, tool calling estilo OpenAI, modo de razonamiento (thinking) activado por defecto y decodificacion especulativa basada en MTP (multi-token prediction) con profundidad 3. La ventana de contexto declarada es de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es de nicho pero clara: ofrece un camino de despliegue reproducible y verificado sobre hardware AMD (ROCm) mediante el servidor `loom-serve`, con una API compatible con OpenAI. La informacion publica es escasa: cero descargas, cero likes, sin resultados de rendimiento re-medidos y sin datos sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; pesos en GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`endless-frontier_BigBang-v1-Q4_K_M.gguf`) + paquete Loom (`.loom` y `model.json`) + `mmproj-endless-frontier_BigBang-v1-bf16.gguf` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, numero de capas, dimensiones, atencion, etc.) ni sobre su proceso de entrenamiento: no se indican tokens de entrenamiento, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. La model card de este repositorio solo describe el empaquetado y las caracteristicas del runtime.

Lo que si se detalla es la capa de inferencia: el paquete Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y el servidor `loom-serve` expone una API estilo OpenAI. Incorpora decodificacion especulativa mediante MTP con profundidad 3, activada por defecto, y un modo de razonamiento (thinking) tambien activo por defecto que puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`. El soporte de vision se implementa con el proyector mmproj en bf16, recibiendo imagenes como partes `image_url` al estilo OpenAI.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Entrada de imagenes (image-text-to-text) mediante proyector mmproj en bf16.
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial (segun las puertas de correctitud `agent` y `agent_think_off`).
- Decodificacion especulativa MTP con profundidad 3.
- Conversaciones multi-turno con contexto de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por preset.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Audio de entrada/salida: no soportado.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por peticion puede mantener historiales extensos o procesar documentos completos en una sola llamada, util para analisis de contratos, informes o bases de codigo.
- Procesamiento de documentos con imagenes: al aceptar `image_url`, sirve para extraer y razonar sobre capturas, diagramas o paginas escaneadas en flujos de digitalizacion.
- Agente con herramientas en produccion: el soporte de `tools`/`tool_calls` y los bucles multi-turno permiten construir agentes que consultan APIs, bases de datos o sistemas internos de forma iterativa.
- Despliegue on-premise sobre AMD: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, lo que facilita ejecutar el modelo en estaciones de trabajo o servidores AMD sin depender de CUDA.
- Servicio compatible con OpenAI: al exponer `/v1/chat/completions`, se puede integrar como backend sustituto en aplicaciones existentes que ya usan el SDK de OpenAI, cambiando solo la URL base.
- Razonamiento con traza visible: el modo thinking por defecto resulta adecuado para tareas de analisis donde interesa inspeccionar el razonamiento, y puede desactivarse para respuestas directas de baja latencia.
- Evaluacion y benchmarking de runtimes: las puertas de correctitud (kernel_tests, golden, compare, vision, spec, agent, sampling, logits, decision) permiten validar la fidelidad del runtime frente a llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para este paquete **no se han re-medido todavia** en ninguna de las dos GPUs objetivo (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201), y que las puertas de correctitud figuran como "not yet re-measured".

| Medicion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no re-medido | no re-medido |
| Puertas de correctitud | no re-medidas | no re-medidas |

## Requisitos de hardware

- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el paquete se sirve con `--pool_backing=fixed` y `--parameter_mode=preload`, y la R9700 cuenta con 32 GB.
- Compatibilidad con GPUs consumer: no confirmada; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` (variantes `chat` para Strix Halo y `chat-r9700` para la R9700) y servicio con `loom-serve`.
- Opciones de flags relevantes: `completion_spin_ns=4294967295` (espera activa de completaciones GPU), `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion con alternativas.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| endless-frontier_BigBang-v1 (Q4_K_M, paquete Loom) | no disponible | 262.144 | Apache 2.0 | publicado, sin metricas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de metricas: no hay benchmarks de calidad ni mediciones de rendimiento re-medidas para este paquete; no debe asumirse ningun nivel de rendimiento.
- Sin validacion de correctitud publicada: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; es un artefacto recien generado y sin validacion de la comunidad.
- Hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPUs, incluidas las de NVIDIA.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo base, lo que impide garantizar calidad en castellano.
- Riesgo de alucinacion: inherente al modelo base; no se aportan datos sobre mitigaciones.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original y del checkpoint de `bartowski` antes de desplegar en produccion.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por preset; ambos valores pueden requerir ajuste para cargas reales.
- Dependencia del ecosistema Loom (`hrx-loom==0.2.0`): el soporte y la madurez del runtime condicionan la viabilidad del despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-endless-frontier_BigBang-v1-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/endless-frontier_BigBang-v1-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
