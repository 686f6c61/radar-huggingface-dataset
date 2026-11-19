# loom-draft/unsloth-flux-3-image-klein-pup-loom

## Resumen

`loom-draft/unsloth-flux-3-image-klein-pup-loom` es un paquete de despliegue en formato Loom (`.loom` y un `model.json`) que empaqueta el checkpoint GGUF sin modificar `flux-3-image-klein-pup-Q4_K_M.gguf`, publicado originalmente por Unsloth bajo el identificador `unsloth/flux-3-image-klein-pup-GGUF`. El objetivo no es ofrecer pesos nuevos, sino proporcionar kernels y programas generados con `loom-next` que permitan ejecutar ese GGUF sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo base es multimodal de tipo image-text-to-text, con entrada de imagen a traves de un proyector separado (`mmproj-BF16.gguf`) y una ventana de contexto declarada de 262.144 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y un modo de razonamiento activado por defecto que puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.

Su relevancia es acotada pero especifica: cubre el hueco de inferencia nativa en ROCm para hardware AMD de consumo y estaciones de trabajo, un terreno donde el soporte de llama.cpp y vLLM es historicamente mas fragil que en CUDA. La ficha, no obstante, debe leerse con cautela: el repositorio tiene 0 descargas y 0 likes, el tamano reportado es de 0.0 GB y todas las puertas de correctitud y las mediciones de rendimiento figuran como "not yet re-measured", es decir, sin evidencia registrada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el paquete no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` mas `model.json` / `model.json.lock` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Lo unico verificable es la procedencia: se trata de un empaquetado del GGUF cuantizado a Q4_K_M publicado por Unsloth, sin modificacion de los pesos ("unmodified GGUF checkpoint"), y un proyector multimodal independiente en BF16 para la entrada de imagen.

La innovacion tecnica del repositorio no esta en el modelo sino en la capa de ejecucion. `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201, y `loom-serve` los ejecuta con opciones como `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elastico), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, con consumo de CPU mientras hay trabajo en vuelo). El paquete incluye ademas un `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`. No se declara decodificacion especulativa: la tabla de caracteristicas la marca como "not applicable".

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta partes `image_url` al estilo OpenAI junto con texto, procesadas por el proyector `mmproj-BF16.gguf`.
- Modo de razonamiento ("thinking") activado por defecto, desactivable por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling al estilo OpenAI: acepta `tools` y devuelve `tool_calls`; la model card incluye puertas de validacion para bucles agente multi-turno (`agent`, `agent_think_off`).
- API compatible con OpenAI servida en `http://127.0.0.1:8080/v1/chat/completions`.
- Contexto largo: 262.144 tokens por peticion, con pruebas de referencia previstas sobre documentos de 1k a 32k tokens.
- Concurrencia de 4 peticiones, con una puerta de correctitud (`consistency`) que verifica que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Sin soporte de audio ni de salida de audio ("not applicable").
- Cobertura de idiomas no declarada.

## Casos de uso

- Procesamiento de documentos extensos con imagen: gracias a la ventana de 262.144 tokens, el modelo puede ingerir contratos, informes o expedientes completos acompanados de capturas o escaneos y responder preguntas sobre el conjunto sin trocear el contenido.
- Analisis de capturas de pantalla en soporte tecnico: recibir una imagen de la interfaz del usuario junto con la descripcion del problema y generar diagnosticos o pasos de resolucion en una sola llamada.
- Automatizacion de agentes con herramientas en estaciones AMD: el soporte de `tools`/`tool_calls` y las puertas `agent` permiten construir bucles de razonamiento de varios pasos que consulten APIs internas, con la ventaja de ejecutarse sobre ROCm sin depender de CUDA.
- Extraccion estructurada de informacion de documentos escaneados: combinacion de entrada visual y contexto largo para convertir facturas, albaranes o formularios en JSON validado.
- Despliegue en puesto de trabajo con Radeon AI PRO R9700: los 32 GB de VRAM de la tarjeta y el empaquetado Q4_K_M permiten servir el modelo en local para prototipado de aplicaciones multimodales sin infraestructura cloud.
- Evaluacion comparativa de backends en AMD: el paquete incluye puertas de correctitud disenadas para contrastar token a token contra llama.cpp (`golden`, `compare`, `vision`, `logits`), lo que lo hace util como banco de pruebas de kernels ROCm frente a la referencia.
- Prototipado de asistentes con razonamiento conmutable: activar el modo thinking para tareas de analisis y desactivarlo para respuestas de baja latencia en la misma instancia, ajustando el comportamiento por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

| Puerta de correctitud | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| `kernel_tests` | sin medir | sin medir |
| `golden` | sin medir | sin medir |
| `compare` | sin medir | sin medir |
| `vision` | sin medir | sin medir |
| `consistency` | sin medir | sin medir |
| `spec` | sin medir | sin medir |
| `agent` | sin medir | sin medir |
| `agent_think_off` | sin medir | sin medir |
| `sampling` | sin medir | sin medir |
| `logits` | sin medir | sin medir |
| `decision` | sin medir | sin medir |

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint es Q4_K_M y el proyector BF16, y el unico limite documentado es la Radeon AI PRO R9700 con 32 GB, que el paquete da por soportada.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, APU con memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090) y Apple Silicon: no se mencionan; el paquete esta generado para dispositivos `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch huggingface:loom-draft/unsloth-flux-3-image-klein-pup-loom:chat --materialize=copy --output=flux-3-image-klein-pup` y servicio con `loom-serve --model=flux-3-image-klein-pup '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp aparece unicamente como referencia de comparacion en las puertas de correctitud.
- Latencia y throughput: no disponibles; no se han registrado mediciones en ninguna de las dos plataformas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. El unico punto de referencia citado es llama.cpp ejecutando el mismo GGUF, que se usa como oraculo de correctitud (tokens greedy y top-5 log-probs) pero no como termino de comparacion de capacidades.

| Criterio | Este paquete | llama.cpp (referencia citada) |
|---|---|---|
| Pesos | GGUF Q4_K_M sin modificar | mismo GGUF |
| Backend | kernels `.loom` generados para gfx1151/gfx1201 | backend propio de llama.cpp |
| Contexto declarado | 262.144 tokens | no disponible |
| Mediciones publicadas | ninguna ("not yet re-measured") | no disponible |
| Licencia | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Ausencia total de evidencia empirica: las 11 puertas de correctitud y las dos tablas de rendimiento figuran como no medidas. No hay ninguna validacion publicada de que la salida coincida con llama.cpp en estas plataformas.
- Madurez del repositorio: 0 descargas, 0 likes, creado y actualizado el mismo dia (2026-11-19) y con un tamano de repo reportado de 0.0 GB, lo que sugiere un artefacto recien generado y sin uso comunitario verificable.
- Dependencia de una toolchain concreta: requiere `hrx-loom[hf]==0.2.0` y `loom-next`; no es un GGUF que se pueda cargar directamente en Ollama, llama.cpp o vLLM sin pasos adicionales.
- Amarre a hardware: los kernels estan generados para gfx1151 y gfx1201. No hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Sesgos y riesgo de alucinacion: no documentados por el autor; al ser un modelo multimodal de proposito general, cabe esperar los riesgos habituales de generacion no verificada, pero no hay evaluaciones publicadas que los cuantifiquen.
- Idiomas: no declarados, por lo que no puede asumirse un rendimiento multilingue fiable, y menos aun en castellano.
- Licencia Apache 2.0: permisiva y compatible con uso comercial, pero se aplica al empaquetado; conviene verificar la licencia del checkpoint base de Unsloth antes de redistribuir.
- Modo thinking activado por defecto: incrementa el consumo de tokens y la latencia si no se desactiva explicitamente por peticion.
- Limite de salida de 4.096 tokens por preset, que puede ser insuficiente para tareas de generacion larga pese al contexto de entrada de 262.144 tokens.
- La busqueda web realizada no devuelve resultados relacionados con este modelo (los enlaces corresponden al producto de grabacion de pantalla Loom y a una marca de ropa homonima), por lo que no hay cobertura externa que confirme o matice la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/unsloth-flux-3-image-klein-pup-loom
- Checkpoint base: https://huggingface.co/unsloth/flux-3-image-klein-pup-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
