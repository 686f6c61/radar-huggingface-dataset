# loom-draft/bartowski-bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-loom

## Resumen

`loom-draft/bartowski-bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado a partir del checkpoint GGUF `bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-Q4_K_M.gguf` publicado por bartowski, que a su vez deriva de un fine-tuning de la familia Gemma 4 con arquitectura MoE (denominación 26B-A4B: 26 mil millones de parámetros totales, 4 mil millones activos). El paquete lo publica el usuario `loom-draft` y está pensado para ejecutarse sobre la pila de inferencia Loom (hrx-loom) en GPUs AMD concretas: el APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es la portabilidad de un GGUF ya cuantizado a un runtime alternativo a llama.cpp sobre ROCm, con kernels generados por la herramienta `loom-next` y una API compatible con OpenAI. Es relevante para quienes trabajan con hardware AMD de consumo o workstation y quieren servir un modelo de razonamiento con tool calling sin depender de CUDA ni de llama.cpp.

La información publicada es escasa y en gran parte provisional: el repositorio de Hugging Face ocupa 0,0 GB, no declara idiomas, no incluye benchmarks propios y todas las puertas de validación figuran como «not yet re-measured». Las mediciones de rendimiento frente a llama.cpp tampoco se han vuelto a realizar para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun la denominacion A4B del modelo base; detalles internos no disponibles |
| Parametros totales | 26B (segun nombre del modelo base) |
| Parametros activos | 4B (segun nombre del modelo base) |
| Longitud de contexto | 201.728 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el checkpoint empaquetado; otras cuantizaciones del base no verificadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyacente. Por la nomenclatura del checkpoint (`gemma-4-26B-A4B-it`) se trata de un transformer con mezcla de expertos de 26B parámetros totales y 4B activos, en variante «it» (instruida), afinado por bottlecapai bajo el nombre ThinkingCap. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o destilación de razonamiento.

Lo que sí documenta el paquete es la capa de ejecución: `loom-next` genera kernels para las arquitecturas gfx1151 y gfx1201, y `loom-serve` expone un servidor con API estilo OpenAI. La decodificación especulativa no está soportada («not applicable») y el modo de razonamiento se controla mediante `chat_template_kwargs: {"enable_thinking": true|false}`, desactivado por defecto. El paquete incluye dos presets, `chat` (Strix Halo) y `chat-r9700` (R9700).

## Capacidades

- Generación de texto conversacional multi-turno con hasta 201.728 tokens de contexto por petición.
- Razonamiento explícito opcional (modo thinking), activable por petición y desactivado por defecto.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-paso con reutilización de historial (según la puerta de validación `agent`, pendiente de re-medición).
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Servicio de chat sobre GPU AMD: desplegar un endpoint `/v1/chat/completions` en una Radeon AI PRO R9700 o en un APU Strix Halo para aplicaciones internas, aprovechando que el paquete ya incluye kernels y preset para ambas arquitecturas.
- Asistentes con contexto documental largo: con 201.728 tokens por petición se pueden inyectar manuales, contratos o bases de código extensas sin trocear, útil en herramientas de consulta sobre documentación técnica.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir asistentes que consulten APIs, bases de datos o sistemas de ticketing en bucles de varios pasos.
- Razonamiento con coste controlado: activar `enable_thinking` solo en las peticiones que lo requieran (análisis, depuración, planificación) y dejarlo apagado en las conversacionales, reduciendo latencia y tokens de salida.
- Sustitución de llama.cpp en entornos ROCm: equipos que ya sirven GGUF con llama.cpp pueden evaluar Loom como runtime alternativo manteniendo el mismo checkpoint y comparando salidas con la puerta `golden`.
- Prototipado en estación de trabajo AMD: un equipo con Ryzen AI Max+ 395 puede ejecutar el modelo en local para pruebas de prompts, evaluación de calidad y desarrollo de integraciones antes de mover la carga a servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete «no se han vuelto a medir» tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como pendientes de re-medición.

## Requisitos de hardware

- GPU soportadas de forma explícita: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible en la información publicada; el checkpoint es Q4_K_M de un modelo de 26B parámetros, por lo que el peso de los pesos rondaría los 15-16 GB, pero el paquete no confirma esta cifra.
- GPU de consumo: no se documenta soporte para GPUs de consumo distintas de las dos anteriores; no hay datos para RTX 4090, A100 ni H100.
- Despliegue: `hrx-loom[hf]==0.2.0` vía pipx, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Parámetros relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Concurrencia: 4 peticiones simultáneas según el preset.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete están pendientes de re-medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Estado |
|---|---|---|---|---|---|
| Este paquete (ThinkingCap gemma-4-26B-A4B-it, Q4_K_M, Loom) | 26B totales / 4B activos | 201.728 | Loom sobre ROCm (gfx1151, gfx1201) | apache-2.0 | Publicado, validación pendiente |
| `bartowski/bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-GGUF` | 26B totales / 4B activos | no disponible | llama.cpp y otros runtimes GGUF | apache-2.0 (heredada) | Checkpoint de origen |
| Modelos Gemma 4 de la misma familia (sin fine-tuning ThinkingCap) | variable | no disponible | múltiples | no disponible | No verificado en la información |

No se dispone de datos de rendimiento comparado entre estas opciones; la comparación se limita a parámetros, contexto, runtime y licencia.

## Limitaciones y advertencias

- El repositorio de Hugging Face ocupa 0,0 GB: no se confirma que los artefactos del paquete estén efectivamente subidos.
- Todas las puertas de corrección y las mediciones de rendimiento figuran como «not yet re-measured»; no hay evidencia publicada de que las salidas coincidan con la referencia de llama.cpp.
- Sin soporte de imagen ni audio en Loom, pese a que el modelo original sí las ofrece: se pierden capacidades del checkpoint de origen.
- Sin decodificación especulativa, lo que limita las optimizaciones de latencia disponibles.
- Límite de 4.096 tokens de salida por petición, insuficiente para generaciones largas sin fragmentar.
- Concurrencia máxima de 4 peticiones, poco adecuada para cargas de producción con muchos usuarios simultáneos.
- Idiomas soportados no declarados; no se puede asumir calidad en castellano sin evaluación propia.
- Riesgo de alucinación y sesgos: no documentados para este fine-tuning; deben evaluarse antes de uso en producción.
- Licencia apache-2.0 declarada en el paquete, pero conviene verificar las condiciones del checkpoint base y del fine-tuning de bottlecapai antes de un uso comercial.
- Dependencia de una pila joven (`hrx-loom` 0.2.0) y de dos arquitecturas AMD concretas; no hay soporte documentado para otras GPUs.
- La búsqueda web no devolvió información técnica sobre este modelo: los resultados corresponden al producto de grabación de pantalla Loom y a la marca de ropa Loom, sin relación con el proyecto.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/bottlecapai_ThinkingCap-gemma-4-26B-A4B-it-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
