# loom-draft/unsloth-Qwen3.5-9B-loom

## Resumen

El modelo `loom-draft/unsloth-Qwen3.5-9B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3.5-9B-GGUF`, concretamente la cuantizacion `Qwen3.5-9B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es, por tanto, un modelo entrenado desde cero ni un fine-tune: es un artefacto de empaquetado y compilacion de kernels para el runtime Loom sobre hardware AMD.

El modelo subyacente, Qwen3.5-9B en su variante multimodal (pipeline `image-text-to-text`), aporta generacion de texto, razonamiento con modo *thinking* opcional, tool calling y entrada de imagen a traves de un proyector separado (`mmproj-BF16.gguf`). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con una ventana de contexto declarada de 262.144 tokens por peticion y 4 peticiones concurrentes.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio tiene 0 descargas, 0 *likes* y un tamano de 0,0 GB en el momento de la consulta, y la propia model card indica que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir para este paquete. Es un artefacto experimental de la cadena de herramientas Loom, no una distribucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura del modelo base; se sirve desde GGUF) |
| Parametros totales | 9B (segun el nombre del modelo base `Qwen3.5-9B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada: la model card del paquete Loom no describe el tipo de transformer, la composicion del dataset ni el proceso de alineacion (RLHF/DPO). Lo unico verificable es que el checkpoint de origen es un GGUF de Unsloth en cuantizacion Q4_K_M y que el modelo es multimodal (entrada de imagen via proyector `mmproj-BF16.gguf`), lo que implica un encoder visual y un proyector acoplados al decodificador de texto.

La innovacion tecnica del paquete no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, que `loom-serve` ejecuta con opciones de ajuste como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host). La model card indica explicitamente que la decodificacion especulativa no aplica y que el "reasoning effort" tampoco.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo *thinking* opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Entrada de imagen multimodal: acepta partes `image_url` en el formato de OpenAI, servidas por el proyector `mmproj-BF16.gguf`.
- Contexto largo: hasta 262.144 tokens por peticion, con salida maxima de 4.096 tokens.
- Concurrencia de 4 peticiones simultaneas.
- Audio: no soportado (entrada y salida marcadas como no aplicables).
- Decodificacion especulativa: no aplicable en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: un desarrollador con un Ryzen AI Max+ 395 puede servir el modelo con `loom-fetch` y `loom-serve` sin depender de CUDA, usando el backend AMDGPU del runtime Loom. Es el escenario principal para el que se publica el paquete.
- Servicio de inferencia en Radeon AI PRO R9700: con 32 GB de VRAM, la GPU profesional de AMD puede alojar el checkpoint Q4_K_M y el proyector BF16, ofreciendo un endpoint compatible con OpenAI para integraciones existentes.
- Sustitucion de backend en aplicaciones ya escritas contra la API de OpenAI: al exponer `/v1/chat/completions` con `tools` y `tool_calls`, un cliente existente puede apuntar a `http://127.0.0.1:8080` cambiando solo la URL base.
- Procesamiento de documentos con imagen y texto: la combinacion de entrada de imagen y contexto de 262.144 tokens permite enviar capturas, diagramas o paginas escaneadas junto con instrucciones largas en una sola peticion.
- Agentes con tool calling en local: el soporte de bucles multi-turno con historial reutilizado permite construir asistentes que invocan funciones (consultas a bases de datos, APIs internas) sin salir del equipo.
- Experimentacion con el ecosistema Loom: investigadores interesados en compilacion de kernels para AMD pueden usar este paquete como referencia de como `loom-next` traduce un GGUF a programas `.loom` ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero en ambos casos indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured", por lo que no hay evidencia registrada de correccion numerica frente a la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint Q4_K_M de un modelo de 9B ocupa del orden de 5-6 GB de pesos, mas el proyector BF16; el paquete esta pensado para GPU con 32 GB (R9700) y para la memoria unificada del Strix Halo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPU de consumo Nvidia ni para Radeon consumer distintas de las dos arquitecturas objetivo; el runtime es especifico de AMDGPU.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete; llama.cpp se usa unicamente como referencia de correccion en las puertas de validacion.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / runtime | Estado |
|---|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3.5-9B-loom | 9B | 262.144 | Si (imagen) | Apache 2.0 | `.loom` + GGUF, runtime Loom (AMD) | 0 descargas, sin mediciones |
| unsloth/Qwen3.5-9B-GGUF (base) | 9B | no disponible | Si (imagen, segun el paquete derivado) | Apache 2.0 | GGUF, runtime generico (llama.cpp y otros) | Modelo de origen del paquete |
| Qwen3.5-9B sin cuantizar | 9B | no disponible | Si (imagen) | Apache 2.0 | safetensors, frameworks estandar | No disponible en la informacion |

La comparativa se limita al linaje directo del paquete porque la informacion proporcionada no incluye datos de otros modelos de la misma categoria. No hay cifras de rendimiento comparables para ninguna de las filas.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas, 0 *likes* y ninguna medicion de rendimiento o correccion registrada para este paquete concreto. No debe tratarse como una distribucion validada.
- Dependencia de hardware muy especifica: solo se documentan las arquitecturas gfx1151 (Strix Halo) y gfx1201 (R9700). No hay soporte declarado para Nvidia, Apple Silicon ni otras GPU AMD.
- Dependencia de version del runtime: el paquete fija `hrx-loom[hf]==0.2.0`; cambios de version pueden romper la compatibilidad de los programas `.loom` generados.
- Licencia Apache 2.0 sobre el empaquetado, pero la licencia y condiciones del modelo base Qwen3.5-9B deben verificarse en el repositorio de origen antes de uso comercial.
- Riesgo de alusionacion inherente a un modelo de 9B cuantizado a Q4_K_M; la cuantizacion introduce degradacion adicional respecto al checkpoint en precision completa.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Limite de salida de 4.096 tokens por peticion, lo que restringe tareas de generacion larga aunque el contexto de entrada sea de 262.144 tokens.
- Concurrencia maxima de 4 peticiones: no apto para cargas de alta concurrencia sin replicacion.
- La opcion `completion_spin_ns=4294967295` consume CPU de forma activa mientras hay trabajo en GPU; en entornos con CPU limitada puede degradar el resto del sistema.
- Sin soporte de audio ni de decodificacion especulativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3.5-9B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
