# loom-draft/prithivMLmods-tencent-WeVisCut-loom

## Resumen

`loom-draft/prithivMLmods-tencent-WeVisCut-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `WeVisCut.Q4_K_M.gguf` del repositorio `prithivMLmods/tencent-WeVisCut-GGUF`. No se trata de un modelo nuevo: es un empaquetado generado con la herramienta `loom-next` que permite servir el modelo multimodal (image-text-to-text) sobre GPUs AMD concretas, en particular el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico del paquete esta en que ofrece una ruta de inferencia nativa sobre ROCm/HIP para un modelo vision-lenguaje cuantizado en Q4_K_M, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activable y entrada de imagenes mediante el proyector `WeVisCut.mmproj-bf16.gguf`. La ventana de contexto declarada es de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia es doble: por un lado, documenta el estado de una alternativa de serving para hardware AMD de consumo y workstation; por otro, es honesto sobre su madurez, ya que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, etc.) figuran como "not yet re-measured" en la informacion disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano declarado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; pesos en GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint `WeVisCut.Q4_K_M.gguf`); proyector en bf16 (`WeVisCut.mmproj-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, empaquetado como paquete Loom (`.loom` + `model.json` + `weights.loom`) |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Modelo base | `prithivMLmods/tencent-WeVisCut-GGUF` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, tipo de atencion, composicion del dataset o si hubo RLHF/DPO). Lo que si se documenta es el formato de despliegue: un checkpoint GGUF cuantizado en Q4_K_M acompanado de un proyector multimodal separado en bf16 (`WeVisCut.mmproj-bf16.gguf`), que es el patron habitual en modelos vision-lenguaje empaquetados para llama.cpp y derivados. El paquete Loom anade programas compilados (`.loom`), un fichero `weights.loom` y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256, verificado por `loom-fetch`.

El paquete fue generado con `loom-next` en modo "generator alone, no LLM in the loop", es decir, sin un modelo en el bucle de generacion del propio paquete. No se especifica el numero de tokens de entrenamiento ni la composicion del corpus. Tampoco se documentan innovaciones como decodificacion especulativa: la tabla de caracteristicas marca explicitamente `speculative decoding` como "not applicable" y `reasoning effort` como "not applicable".

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline `image-text-to-text`), con entrada de imagenes mediante partes `image_url` al estilo OpenAI.
- Razonamiento o modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling al estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial (segun la puerta `agent` descrita en la model card).
- Contexto largo: 262.144 tokens por peticion, adecuado para documentos extensos o conversaciones prolongadas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset).
- Muestreo: la model card indica "not determined" para el estado de `sampling` en la tabla de caracteristicas, aunque existe una puerta `sampling` descrita.
- Audio: no soportado ("not applicable").

## Casos de uso

- Analisis de documentos escaneados con imagen y texto: el modelo puede recibir una imagen (`image_url`) y un prompt textual en la misma peticion, lo que permite extraer informacion de capturas, formularios o diagramas sin un pipeline OCR separado.
- Asistentes con contexto largo: con 262.144 tokens por peticion, encaja en escenarios de revision de expedientes, contratos o bases de codigo extensas donde se necesita mantener gran parte del material en la ventana.
- Agentes con herramientas: el soporte de `tools` y `tool_calls` permite construir flujos donde el modelo decide invocar funciones externas (busqueda, calculo, acceso a APIs) y encadenar varios pasos.
- Despliegue en estaciones AMD: para equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700, el paquete ofrece un servidor compatible con OpenAI sin depender de CUDA, util en entornos ROCm ya existentes.
- Prototipado de aplicaciones multimodales: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local durante desarrollo y pruebas de integracion.
- Evaluacion comparativa de runtimes: las puertas de correccion (`golden`, `compare`, `vision`, `consistency`) estan disenadas para contrastar la salida de Loom contra llama.cpp con el mismo GGUF, lo que sirve para validar la fidelidad de un backend alternativo antes de adoptarlo.
- Razonamiento con modo thinking en tareas de analisis: activado por defecto, se puede usar para problemas que requieren pasos intermedios y desactivar cuando se prioriza latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica: "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint esta cuantizado en Q4_K_M y el proyector en bf16; el paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para Strix Halo (memoria unificada).
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no se mencionan en la informacion disponible; el paquete esta orientado a AMD via ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa como referencia de correccion, no como opcion de serving descrita.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/prithivMLmods-tencent-WeVisCut-loom` | no disponible | 262.144 tokens | GGUF Q4_K_M empaquetado en Loom | Apache 2.0 | Serving nativo AMD (Strix Halo, R9700); sin mediciones publicadas |
| `prithivMLmods/tencent-WeVisCut-GGUF` | no disponible | no disponible | GGUF | Apache 2.0 (segun el paquete derivado) | Checkpoint de origen sin empaquetar; sirve de referencia para llama.cpp |
| Otros modelos image-text-to-text de la familia WeVisCut | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de datos suficientes para comparar parametros, rendimiento o disponibilidad con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Madurez: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia publicada de fidelidad frente a llama.cpp en este paquete.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0.0 GB, lo que sugiere que el paquete puede no estar completamente materializado o es de creacion muy reciente (fechas de creacion y actualizacion del 19 de noviembre de 2026).
- Hardware restringido: solo se documenta soporte para dos GPUs AMD concretas; no hay indicaciones de funcionamiento en NVIDIA ni en otras GPUs AMD.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar calidad en castellano.
- Arquitectura y entrenamiento: sin datos sobre tamano, dataset, alineacion o sesgos conocidos del modelo base.
- Alucinacion: sin datos especificos; aplican las advertencias generales de los modelos generativos multimodales, especialmente en descripcion de imagenes y contexto muy largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `prithivMLmods/tencent-WeVisCut-GGUF` y de los pesos originales de Tencent antes de produccion.
- Muestreo: la model card marca el estado de `sampling` como "not determined", lo que anade incertidumbre sobre el comportamiento reproducible de la generacion.
- Dependencia de runtime: requiere `hrx-loom[hf]==0.2.0` y el ecosistema Loom; no es un GGUF generico cargable en cualquier servidor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-tencent-WeVisCut-loom
- Modelo base GGUF: https://huggingface.co/prithivMLmods/tencent-WeVisCut-GGUF
- Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
