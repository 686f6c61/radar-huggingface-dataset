# loom-draft/twinkapp-mobileai-loom

## Resumen

`loom-draft/twinkapp-mobileai-loom` es un paquete de despliegue para el runtime AMD Loom (herramienta `loom-serve`) que empaqueta el checkpoint GGUF cuantizado Q4_K_M del modelo base `twinkapp/mobileai`, a su vez un finetune del checkpoint `mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking.i1-Q4_K_M.gguf`. No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de inferencia generada con la herramienta `loom-next` (sin LLM en el bucle) que produce programas `.loom`, un `model.json` y los pesos en formato propietario para ejecutarse sobre GPUs AMD concretas.

El paquete está dirigido explícitamente a dos aceleradores: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU de escritorio AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Su relevancia radica en que demuestra el flujo de empaquetado de Loom para modelos pequeños (~1B parámetros) en hardware AMD, con una API compatible con OpenAI (`/v1/chat/completions`), contexto de 32.768 tokens por petición y hasta 4 peticiones concurrentes.

El modelo subyacente es un Gemma-3 de 1B parámetros con ajuste fino orientado a "thinking" y sin censura (según la nomenclatura del checkpoint original). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB y fue creado el 26 de noviembre de 2026. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3 1B, segun el nombre del checkpoint base); empaquetado como programas `.loom` para el runtime AMD Loom |
| Parametros totales | ~1B (heredado del checkpoint Gemma-3-1B base; no se especifica el conteo exacto en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen (Q4_K_M); empaquetado en `weights.loom` + programas `program/*.loom`, con `model.json`, `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no aplicable (segun la model card) |
| Razonamiento / thinking | no aplicable (marcado como tal en la tabla de features) |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no determinada ("?") |
| Entrada/salida de audio | no determinada ("?") |

## Arquitectura y entrenamiento

El paquete no define un entrenamiento propio: redistribuye el checkpoint `twinkapp/mobileai`, que a su vez es un finetune del GGUF `mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking.i1-Q4_K_M.gguf`. Por tanto, la arquitectura subyacente corresponde a la familia Gemma-3 en su variante de 1B parámetros, en formato transformer denso y cuantización Q4_K_M. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el finetune original.

La innovación técnica del repositorio no está en el modelo sino en el pipeline de despliegue: `loom-next` genera programas `.loom` (kernels y orquestación) a partir de la configuración del modelo, y `loom-serve` los ejecuta sobre la GPU AMD con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU). La model card incluye una batería de "gates" de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) frente a la referencia de llama.cpp, pero todos aparecen como "not yet re-measured" en ambas GPUs.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`), con un ejemplo de petición `curl` incluido en la model card.
- Ventana de contexto de 32.768 tokens por petición, suficiente para documentos medios y conversaciones multi-turno largas.
- Concurrencia de hasta 4 peticiones simultáneas, con un gate de "consistency" previsto para verificar que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Tool calling: marcado explícitamente como "not applicable" en la tabla de features de la model card.
- Razonamiento / thinking y "reasoning effort": marcados como "not applicable", pese a que el nombre del checkpoint base incluye "Thinking".
- Decodificación especulativa: marcada como "not applicable".
- Entrada de imagen y audio: estado "?" (no determinado); existe un gate `vision` previsto pero sin medición registrada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está rellenado).

## Casos de uso

- Despliegue de un asistente conversacional local en una APU Strix Halo: el paquete está preconfigurado para gfx1151 con un único comando `loom-serve`, lo que permite levantar un endpoint compatible con OpenAI en `127.0.0.1:8080` sin compilar kernels a mano.
- Inferencia en estación de trabajo con Radeon AI PRO R9700: con 32 GB de VRAM y un modelo de ~1B en Q4_K_M, el checkpoint cabe holgadamente y deja margen para el pool de memoria fijo (`--pool_backing=fixed`).
- Prototipado de aplicaciones que consumen la API de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local cambiando solo la URL base, útil para desarrollar sin coste de API en la nube.
- Evaluación comparativa de runtimes AMD: la model card define gates (`golden`, `compare`, `logits`, `sampling`) contra llama.cpp sobre el mismo GGUF, lo que permite medir la fidelidad numérica del runtime Loom frente a la referencia.
- Procesamiento de documentos de hasta 32k tokens: la ventana de contexto admite resúmenes o extracción de información sobre textos medios en una sola petición, con un tope de 4.096 tokens de salida.
- Servicio ligero multiusuario de baja concurrencia: con 4 peticiones concurrentes y un modelo de 1B, encaja en escenarios de demo, laboratorio o herramientas internas de un equipo pequeño.
- Pruebas de integración continua de kernels: los gates `kernel_tests` y `consistency` están pensados para validar la generación de kernels y la reproducibilidad bajo concurrencia antes de promover un paquete a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de "Performance vs llama.cpp" para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que "the results for this package are not yet re-measured". Del mismo modo, todos los gates de corrección aparecen como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de fidelidad numérica, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: un modelo de ~1B parámetros en Q4_K_M ocupa del orden de 0,7-1 GB de pesos; el consumo real depende del pool de memoria configurado por el preset de Loom (no se publican cifras exactas).
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA o AMD distintas de las dos anteriores; el paquete está generado específicamente para gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalable con `pipx install "hrx-loom[hf]==0.2.0"`; la descarga del paquete se hace con `loom-fetch huggingface:loom-draft/twinkapp-mobileai-loom:chat --materialize=copy --output=mobileai`.
- Flags recomendados en la model card: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (las mediciones de rendimiento no se han vuelto a realizar para este paquete).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/twinkapp-mobileai-loom` | ~1B (Gemma-3-1B finetune) | 32.768 tokens | GGUF Q4_K_M empaquetado en `.loom`; runtime AMD Loom | MIT | Solo gfx1151 y gfx1201; sin benchmarks publicados |
| `twinkapp/mobileai` (modelo base) | ~1B | no disponible | GGUF | no disponible | Checkpoint de origen del que deriva este paquete |
| `mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking.i1-Q4_K_M.gguf` | ~1B (Gemma-3-1B) | no disponible | GGUF Q4_K_M | no disponible | Checkpoint de referencia usado para los gates de corrección |
| llama.cpp (runtime de referencia) | N/A | N/A | GGUF | MIT | Referencia contra la que Loom compara sus gates; soporta muchas más GPUs |

La comparación con alternativas de la misma categoría (modelos de ~1B para inferencia local) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento ni de otros modelos comparables.

## Limitaciones y advertencias

- Ausencia total de mediciones: los benchmarks de rendimiento y los gates de corrección están marcados como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Soporte de hardware muy restringido: el paquete está generado para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se garantiza su funcionamiento en otras GPUs AMD ni en NVIDIA.
- Tool calling y decodificación especulativa marcados como "not applicable": no se debe asumir soporte de agentes o function calling en este paquete.
- Capacidades de visión y audio sin determinar ("?"): aunque existe un gate `vision` previsto, no hay evidencia registrada.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe concreto.
- El checkpoint base incluye "Heretic-Uncensored" en su nombre, lo que sugiere un ajuste fino orientado a reducir restricciones de contenido; conviene revisar el comportamiento en producción y aplicar filtros propios.
- Riesgo de alucinación: no cuantificado en la información disponible; un modelo de ~1B presenta habitualmente mayor propensión a errores factuales que modelos mayores.
- Licencia MIT declarada para el paquete, pero la licencia del checkpoint base (`twinkapp/mobileai`) y del GGUF de origen no se especifica en la información proporcionada; verificar antes de uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.
- Tamaño de repo de 0.0 GB reportado por Hugging Face, posiblemente por el empaquetado en archivos `.loom`; conviene verificar la integridad con `loom-fetch` (comprueba sha256).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/twinkapp-mobileai-loom
- Modelo base: https://huggingface.co/twinkapp/mobileai
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking.i1-Q4_K_M.gguf
- Runtime AMD Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
