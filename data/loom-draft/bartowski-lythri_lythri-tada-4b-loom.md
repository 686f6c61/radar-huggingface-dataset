# loom-draft/bartowski-Lythri_Lythri-Tada-4B-loom

## Resumen

`loom-draft/bartowski-Lythri_Lythri-Tada-4B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Lythri_Lythri-Tada-4B-Q4_K_M.gguf` de `bartowski/Lythri_Lythri-Tada-4B-GGUF`. No es un modelo nuevo ni un reentrenamiento: es un artefacto de empaquetado que traduce un GGUF de 4B parametros en cuantizacion Q4_K_M a un formato ejecutable sobre el runtime Loom de AMD, orientado a las GPU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle, segun la model card). Su relevancia es acotada pero concreta: permite servir un modelo de 4B con ventana de 131.072 tokens por peticion sobre hardware AMD consumer y profesional mediante una API compatible con OpenAI (`/v1/chat/completions`), sin depender de llama.cpp ni de CUDA.

Conviene subrayar que el repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes en el momento de la consulta, y que todas las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured". Es, por tanto, un artefacto reciente y sin validacion publicada, cuyo interes esta en el formato de despliegue mas que en las capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete envuelve un GGUF de 4B; la arquitectura del modelo base no se detalla en la informacion proporcionada) |
| Parametros totales | 4B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado en formato Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (comandos `loom-fetch` y `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `Lythri_Lythri-Tada-4B` ni sobre sus datos de entrenamiento, numero de tokens, composicion del dataset o fases de alineacion (RLHF/DPO). La model card del paquete Loom no documenta nada de esto: se limita a describir el proceso de empaquetado y el runtime.

Lo que si se documenta es la capa de despliegue. `loom-next` genera kernels y programas `.loom` a partir del GGUF sin modificarlo, y el runtime `loom-serve` expone el modelo mediante una API estilo OpenAI. La model card menciona opciones de ejecucion relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset) y `--parameter_mode=preload` (cambia solo la carga de pesos en host). El paquete incluye ademas un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero ninguna tiene medicion registrada en la informacion disponible.

## Capacidades

- Generacion de texto conversacional mediante `/v1/chat/completions` con esquema compatible con OpenAI.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de contextos largos: hasta 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tenga.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tenga.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estacion de trabajo AMD: con 131.072 tokens de contexto por peticion, el paquete permite mantener conversaciones multi-turno con documentos largos adjuntos sobre una Strix Halo o una R9700, sin salir del ecosistema ROCm.
- Agentes con tool calling en local: el soporte de `tools`/`tool_calls` y la puerta `agent` (aunque sin medicion registrada) lo hacen apto para prototipos de agentes que consultan APIs internas o ejecutan funciones, con el modo thinking desactivable para reducir latencia.
- Procesamiento de documentos extensos por lotes: la ventana de 131k tokens permite resumir o extraer datos de contratos, informes o expedientes completos en una sola peticion, con salida limitada a 4.096 tokens.
- Despliegue en hardware AMD profesional con 32 GB: la R9700 permite mantener el modelo Q4_K_M en VRAM junto con el pool fijo reservado por `--pool_backing=fixed`, dejando margen para el resto del sistema.
- Evaluacion comparativa frente a llama.cpp: el paquete esta disenado explicitamente para contrastarse contra una referencia de llama.cpp sobre el mismo GGUF (puertas `golden`, `compare`, `logits`), lo que lo convierte en banco de pruebas para validar el runtime Loom.
- Integracion en pipelines con API OpenAI: al exponer `/v1/chat/completions`, un servicio existente que ya apunte a OpenAI puede redirigirse a `http://127.0.0.1:8080` cambiando solo la URL base y el nombre de modelo, util para entornos con requisitos de soberania de datos.
- Prototipado de razonamiento conmutables: alternar `enable_thinking` entre peticiones permite usar el mismo servicio para tareas rapidas (thinking off) y para problemas que requieran cadena de razonamiento (thinking on), sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y todas las puertas de correctitud figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint es Q4_K_M de un modelo de 4B, por lo que el peso de los parametros ronda los 2,5-3 GB, pero la model card no publica la huella total del pool de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU NVIDIA (A100, H100, RTX 4090): no contempladas en la informacion proporcionada; el paquete esta orientado a AMD via ROCm.
- Cabe en GPU consumer: si, en el sentido de que las APU Strix Halo son hardware de consumo; no hay datos para GPUs de escritorio convencionales.
- Opciones de despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado con `pipx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Lythri_Lythri-Tada-4B-loom` | 4B (Q4_K_M) | 131.072 tokens | MIT | Loom (`loom-serve`, ROCm) | Paquete de despliegue, sin benchmarks publicados |
| `bartowski/Lythri_Lythri-Tada-4B-GGUF` | 4B | no disponible | no disponible | GGUF (llama.cpp y afines) | Checkpoint de origen sin modificar |
| Otros modelos de 4B en GGUF | ~4B | variable | variable | GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento del paquete ni del checkpoint base que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto sin validacion publicada: 0 descargas, 0 likes, 0 GB de repositorio declarado y todas las puertas de correctitud sin medicion registrada. No hay evidencia publica de que la salida coincida con la referencia de llama.cpp.
- Rendimiento desconocido: no hay cifras de latencia ni throughput para ninguna de las dos GPU objetivo.
- Cobertura funcional recortada por el runtime: sin entrada de imagen ni audio, pese a que el modelo upstream las soporte; sin decodificacion especulativa; sin ajuste de esfuerzo de razonamiento.
- Estado de muestreo indeterminado ("not determined"), lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed` en produccion.
- Limite de 4 peticiones concurrentes y de 4.096 tokens de salida por peticion, insuficiente para cargas de alta concurrencia o generaciones muy largas.
- Hardware restringido: solo se documentan dos GPU AMD concretas; no hay soporte declarado para NVIDIA ni para otras GPU AMD.
- Sesgos y alucinacion: no disponibles en la informacion proporcionada; al ser un modelo de 4B cabe esperar mayor propension a errores factuales que en modelos mayores, pero no hay datos que lo cuantifiquen.
- Idiomas soportados: no disponibles, por lo que no puede garantizarse un comportamiento correcto en castellano.
- Licencia MIT declarada en el paquete; la licencia del checkpoint base no se detalla en la informacion proporcionada, por lo que conviene verificarla antes de un uso comercial.
- El nombre "Loom" coincide con el servicio comercial de grabacion de pantalla (loom.com) y con el termino textil; los resultados de busqueda web obtenidos no guardan relacion con este paquete y no aportan informacion tecnica.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-Lythri_Lythri-Tada-4B-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Lythri_Lythri-Tada-4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
