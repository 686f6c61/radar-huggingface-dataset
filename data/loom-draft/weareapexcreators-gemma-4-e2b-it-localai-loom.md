# loom-draft/weareapexcreators-Gemma-4-E2B-it-LocalAI-loom

## Resumen

`loom-draft/weareapexcreators-Gemma-4-E2B-it-LocalAI-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `weareapexcreators/Gemma-4-E2B-it-LocalAI`, un fine-tuning de la familia Gemma 4 con capacidades de vision (pipeline `image-text-to-text`). Lo publica el usuario `loom-draft` y esta pensado especificamente para dos aceleradores AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genera con la herramienta `loom-next`, que produce los kernels y el manifiesto sin intervencion de un LLM en el bucle.

El interes practico del artefacto no reside en un nuevo entrenamiento, sino en la portabilidad: convierte un GGUF cuantizado en Q4_K_M en un servidor compatible con la API OpenAI (`/v1/chat/completions`) que corre sobre el stack ROCm mediante `loom-serve`, con soporte declarado de tool calling, modo de razonamiento opcional, entrada de imagen a traves del proyector `mmproj-BF16.gguf` y una ventana de contexto de 131.072 tokens por peticion con 4 peticiones concurrentes.

Es relevante ahora porque cubre el hueco de inferencia local en hardware AMD de consumo y estacion de trabajo (Strix Halo y R9700), un segmento donde el soporte de vision y tool calling en servidores listos para produccion sigue siendo escaso. La licencia declarada es Apache 2.0 y el repositorio no contiene pesos (0,0 GB): solo el manifiesto y los programas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, multimodal vision-lenguaje; el paquete no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `gemma-4-E4B-it-Q4_K_M.gguf`); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como paquete Loom con `model.json` y programas `.loom`); el repositorio no aloja los pesos |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente mas alla de su caracter multimodal: procesa texto e imagenes mediante un proyector de vision separado en BF16 (`mmproj-BF16.gguf`) y el checkpoint principal cuantizado en Q4_K_M. El autor declara que el GGUF se usa "sin modificar" respecto al checkpoint `weareapexcreators/Gemma-4-E2B-it-LocalAI`, por lo que cualquier detalle de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) corresponde a ese modelo base y no se recoge en la informacion disponible.

La innovacion tecnica del artefacto es de infraestructura, no de modelado: `loom-next` genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` expone el modelo con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye ademas una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; ninguna de ellas tiene medicion registrada todavia para este paquete.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia y modo de razonamiento ("thinking") desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen en formato OpenAI (`image_url`), con pipeline `image-text-to-text`; util para descripcion de imagenes, lectura de capturas y preguntas sobre documentos visuales.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite reutilizar clientes y SDK existentes sin adaptadores.
- Concurrencia de 4 peticiones simultaneas con la garantia declarada de que la salida concurrente coincide con la ejecucion aislada (puerta `consistency`, pendiente de medicion).
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Soporte de audio y de parametros de muestreo avanzados: no determinado segun la tarjeta del modelo.
- Decodificacion especulativa y "reasoning effort": no aplicables en esta configuracion.

## Casos de uso

- Asistente documental con imagenes: el modelo acepta capturas, diagramas o fotografias junto al texto y responde sobre ellas; con 131.072 tokens de contexto se pueden adjuntar varias imagenes y documentos largos en una misma conversacion.
- Agente de automatizacion con herramientas: gracias al soporte de `tools`/`tool_calls` y a los 4 hilos concurrentes, se puede montar un agente que consulte APIs internas, ejecute busquedas y encadene varios pasos manteniendo el historial.
- Inferencia local en estacion de trabajo AMD: sobre una Radeon AI PRO R9700 de 32 GB, el paquete permite servir el modelo en Q4_K_M sin depender de CUDA, lo que encaja en equipos ROCm ya existentes.
- Prototipado en portatil/workstation con Strix Halo: el APU Ryzen AI Max+ 395 permite ejecutar el servidor en un equipo compacto para demos, pruebas de integracion y desarrollo de prompts antes de desplegar en GPU dedicada.
- Atencion al cliente con contexto largo: la ventana de 131.072 tokens admite historiales extensos y bases de conocimiento inyectadas, y el modo thinking desactivable reduce la latencia en respuestas rutinarias.
- Sustitucion directa de un backend OpenAI: al exponer `/v1/chat/completions`, se puede apuntar una aplicacion ya escrita contra la API de OpenAI al servidor local cambiando solo la URL base, util para entornos con requisitos de soberania del dato.
- Evaluacion comparativa de kernels: las puertas de correccion frente a llama.cpp permiten usar el paquete para validar la fidelidad numerica de implementaciones ROCm propias en tareas de vision y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavia", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el checkpoint es Q4_K_M y el proyector de vision va en BF16, por lo que el consumo dependera del tamano real del modelo base (no declarado).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado para las dos arquitecturas AMD citadas y no se menciona soporte para otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete (llama.cpp se usa solo como referencia de correccion).
- Opciones de servicio relevantes: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (precarga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizacion en GPU, consume CPU mientras hay trabajo en vuelo).
- Latencia y throughput: no disponibles; las tablas de rendimiento del autor estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (Gemma-4-E2B-it-LocalAI en Loom) | no disponible | 131.072 tokens | Si (`mmproj-BF16.gguf`) | Si (estilo OpenAI) | Apache 2.0 | Hugging Face (manifiesto, sin pesos) |
| `weareapexcreators/Gemma-4-E2B-it-LocalAI` (modelo base) | no disponible | no disponible | Si (pipeline image-text-to-text) | no disponible | no disponible en la informacion | Hugging Face |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | Si (mismo proyector) | no disponible | no disponible | Referencia de correccion del autor |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB): solo incluye `model.json`, su lock y los programas `.loom`; la descarga real de artefactos se hace con `loom-fetch` contra Hugging Face.
- Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured": no hay evidencia registrada de fidelidad numerica frente a llama.cpp para este paquete.
- Las mediciones de rendimiento en Strix Halo y R9700 estan pendientes; no se pueden extraer conclusiones de velocidad o throughput.
- Soporte de audio, parametros de muestreo y lista de idiomas: no determinados o no disponibles, lo que impide garantizar calidad multilingue.
- El limite de salida es de 4.096 tokens por peticion y la concurrencia maxima declarada es de 4 peticiones, lo que restringe escenarios de alto trafico sin escalado horizontal.
- El paquete esta acoplado a dos arquitecturas AMD concretas (gfx1151 y gfx1201); su uso en otras GPU o en CUDA no esta documentado.
- Licencia Apache 2.0 declarada en el paquete, pero la licencia y condiciones del modelo base deben verificarse por separado antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse sobre el modelo base.
- La tarjeta advierte de que `completion_spin_ns=4294967295` activa espera activa y consume CPU mientras la GPU trabaja, lo que afecta al consumo energetico y a la convivencia con otras cargas en el mismo equipo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Gemma-4-E2B-it-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Gemma-4-E2B-it-LocalAI
- Repositorio del stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
