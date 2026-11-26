# loom-draft/bartowski-DeepSeek-Coder-V2-Lite-Instruct-loom

## Resumen

`loom-draft/bartowski-DeepSeek-Coder-V2-Lite-Instruct-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf` de bartowski, junto con programas `.loom` generados por `loom-next` y una tarjeta `model.json`, para ejecutarlo sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es DeepSeek-Coder-V2-Lite-Instruct, un modelo de código y lenguaje de DeepSeek, en su variante Lite y cuantizado a Q4_K_M.

La relevancia de este paquete es de infraestructura: permite servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD mediante `loom-serve`, sin depender de llama.cpp en tiempo de ejecución. El paquete fija un contexto de 139.264 tokens por petición, admite 4 peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset.

No se dispone de información sobre parámetros totales, arquitectura interna ni datos de entrenamiento del modelo base en la documentación proporcionada; esta ficha se limita a lo que consta en la model card del paquete y en los metadatos de Hugging Face. Las mediciones de rendimiento y las puertas de corrección figuran como "not yet re-measured" (sin volver a medir) en la tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-Coder-V2-Lite-Instruct; el paquete es un runtime Loom) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 139.264 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Tool calling | no aplicable según la tarjeta |
| Modo razonamiento / thinking | no aplicable según la tarjeta |
| Decodificación especulativa | no aplicable según la tarjeta |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: es un artefacto de despliegue generado con `loom-next` (el generador, sin LLM en el bucle) a partir del GGUF de bartowski. Los programas `.loom` y `weights.loom` implementan los kernels y el grafo de ejecución para las GPU AMD objetivo; `model.json` y `model.json.lock` fijan la tarjeta y los ficheros fuente con verificación sha256 por parte de `loom-fetch`. El tokenizador se incluye como `tokenizer.json`.

No consta en la información proporcionada ningún dato sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, uso de MoE), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si hubo RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas del modelo más allá de las propias del runtime Loom (espera activa de finalizaciones de GPU con `completion_spin_ns`, pool de memoria fijo con `--pool_backing=fixed` y precarga de pesos con `--parameter_mode=preload`).

## Capacidades

- Generación de texto y código mediante API compatible con OpenAI (`/v1/chat/completions`), con el modelo DeepSeek-Coder-V2-Lite-Instruct en Q4_K_M.
- Contexto largo por petición: 139.264 tokens, adecuado para documentos extensos y bases de código grandes.
- Concurrencia de 4 peticiones simultáneas en el servidor Loom.
- Límite de 4.096 tokens de salida por petición según el preset.
- Tool calling: marcado como "not applicable" en la tarjeta del paquete.
- Razonamiento / thinking y reasoning effort: marcados como "not applicable".
- Decodificación especulativa: marcada como "not applicable".
- Entrada de imagen y entrada/salida de audio: "not determined" (sin determinar).
- Muestreo (temperature, top_k, seed): "not determined".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en IDE o CLI sobre estaciones de trabajo con GPU AMD: el paquete se sirve localmente con `loom-serve` en Strix Halo o R9700 y expone un endpoint compatible con OpenAI, de modo que herramientas que hablen ese protocolo pueden apuntar a `http://127.0.0.1:8080/v1` sin cambios de código.
- Revisión de repositorios y ficheros largos: con 139.264 tokens de contexto por petición, se pueden enviar módulos completos o varios ficheros en una sola consulta para tareas de explicación, refactorización o búsqueda de errores.
- Documentación técnica automatizada: generación de docstrings, README y comentarios a partir del código fuente en una única pasada, aprovechando el contexto largo y el límite de 4.096 tokens de salida.
- Evaluación de modelos en hardware AMD: el paquete sirve como referencia para comparar el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define puertas de corrección (golden, compare, consistency, sampling, logits) contra una referencia de llama.cpp grabada sobre el mismo checkpoint.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del paquete facilita su integración en productos y pipelines internos sin fricción legal adicional.
- Servicio de chat concurrente de baja escala: con 4 peticiones simultáneas configuradas, es adecuado para equipos pequeños o uso individual en una estación con R9700 de 32 GB o Strix Halo, sin necesidad de infraestructura de centro de datos.
- Pruebas de integración de API: el endpoint compatible con OpenAI permite validar clientes, SDK y flujos de chat contra un servidor local antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) "are not yet re-measured" (aún no se han vuelto a medir). Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como "not yet re-measured" en ambas GPU, por lo que no hay evidencia registrada de su cumplimiento.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible en la información proporcionada; la R9700 dispone de 32 GB y el paquete Q4_K_M está pensado para ejecutarse en ella.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para las arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` (presets `chat` para Strix Halo y `chat-r9700` para R9700) y servicio con `loom-serve`.
- Opciones de ejecución recomendadas por la tarjeta: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.
- Alternativa de despliegue: llama.cpp, usado como referencia de corrección en las puertas del paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (DeepSeek-Coder-V2-Lite-Instruct Q4_K_M sobre Loom) | no disponible | 139.264 tokens | MIT | GGUF empaquetado en `.loom`; `loom-serve` | Hugging Face, 0 descargas |
| `bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF` (modelo base del paquete) | no disponible | no disponible | no disponible | GGUF; llama.cpp y otros runtimes GGUF | Hugging Face |
| llama.cpp (runtime de referencia) | — | — | — | GGUF | Usado en las puertas de corrección del paquete |

No se dispone de datos de rendimiento ni de especificaciones internas suficientes para comparar con alternativas de la misma categoría más allá del propio checkpoint base y del runtime de referencia.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de corrección registradas: todas las puertas y comparativas frente a llama.cpp figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la referencia.
- Tool calling, razonamiento/thinking, reasoning effort y decodificación especulativa están marcados como "not applicable"; no deben asumirse en producción.
- Entrada de imagen, audio y comportamiento del muestreo figuran como "not determined"; su funcionamiento no está verificado.
- El límite de salida es de 4.096 tokens por petición según el preset, lo que restringe tareas de generación muy larga.
- La concurrencia está fijada en 4 peticiones simultáneas; no es adecuado para cargas de alta concurrencia sin cambios en la configuración.
- El paquete está atado a hardware AMD gfx1151 y gfx1201; no funciona en GPU NVIDIA ni en otras arquitecturas AMD sin regeneración.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia MIT se declara a nivel de paquete; la licencia del checkpoint base no consta en la información disponible y conviene verificarla antes de uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-DeepSeek-Coder-V2-Lite-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Generador Loom: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
