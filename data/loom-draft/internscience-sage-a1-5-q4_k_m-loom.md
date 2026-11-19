# loom-draft/InternScience-Sage-A1.5-Q4_K_M-loom

## Resumen

Sage-A1.5-Q4_K_M-loom es un paquete de despliegue en formato Loom (programas `.loom` y un fichero `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `InternScience/Sage-A1.5-Q4_K_M-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos del modelo base a kernels generados por `loom-next` para ejecutarse sobre GPUs AMD concretas, en concreto la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente, Sage-A1.5, es un modelo multimodal de tipo image-text-to-text, con capacidades de razonamiento (thinking), tool calling y decodificacion especulativa mediante MTP.

La relevancia de este paquete es de infraestructura, no de modelado: permite servir el GGUF cuantizado en Q4_K_M sobre el stack ROCm/Loom sin depender de llama.cpp en tiempo de ejecucion, manteniendo una API compatible con OpenAI (`/v1/chat/completions`) y soporte de entradas de imagen mediante el proyector `Sage-A1.5-mmproj.gguf`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor indica que las mediciones de rendimiento y las compuertas de correccion aun no se han vuelto a medir para este paquete.

La ficha se centra, por tanto, en las caracteristicas declaradas del paquete y del modelo base, marcando como "no disponible" todo aquello que la model card no especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el paquete no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom no declara otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Sage-A1.5-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json`; proyector multimodal separado `Sage-A1.5-mmproj.gguf` |

Otros parametros operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Peticiones concurrentes | 4 |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Modo thinking | Activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Entrada de imagen | Si, mediante partes `image_url` estilo OpenAI |
| Entrada/salida de audio | No aplicable |
| API | `/v1/chat/completions` compatible con OpenAI |
| Tool calling | Si, `tools` y `tool_calls` estilo OpenAI |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Sage-A1.5 (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, uso de RLHF o DPO). Lo unico verificable es que se trata de un modelo multimodal que procesa texto e imagenes, con un proyector multimodal independiente (`Sage-A1.5-mmproj.gguf`) y con un cabezal o mecanismo MTP (multi-token prediction) que habilita la decodificacion especulativa a profundidad 3.

En la capa de despliegue, el paquete Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF sin modificar. El autor declara compuertas de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, pero ninguna de ellas aparece con medicion registrada para este paquete ("not yet re-measured"). No hay, por tanto, evidencia publicada de equivalencia numerica con llama.cpp en esta publicacion concreta.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Procesamiento de imagenes en entradas `image_url` estilo OpenAI, con proyector multimodal dedicado.
- Tool calling y function calling con el esquema `tools`/`tool_calls` de OpenAI.
- Bucles de agente multi-turno con reutilizacion de historial, segun las compuertas `agent` y `agent_think_off` definidas por el autor.
- Decodificacion especulativa MTP a profundidad 3 activada por defecto, con la garantia declarada (pendiente de medir) de que la salida coincide exactamente con la de decodificacion especulativa desactivada.
- Servicio concurrente de hasta 4 peticiones simultaneas con contexto de 262.144 tokens por peticion.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Audio: no soportado.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por peticion, el modelo puede mantener conversaciones multi-turno sobre documentos extensos o historiales de soporte sin truncar, aunque el limite de 4 peticiones concurrentes restringe el despliegue a cargas moderadas.
- Analisis de documentos con imagenes: la combinacion de entrada `image_url` y contexto largo permite procesar capturas, diagramas o paginas escaneadas junto a texto de referencia en una misma peticion, usando el proyector `Sage-A1.5-mmproj.gguf`.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y las compuertas de agente del autor lo hacen apto para orquestar llamadas a APIs internas en un bucle multi-paso, con thinking desactivable para reducir latencia en pasos mecanicos.
- Despliegue en estacion de trabajo AMD: el paquete esta pensado para ejecutarse en Ryzen AI Max+ 395 "Strix Halo" o Radeon AI PRO R9700 mediante `loom-serve`, lo que permite servir el modelo en hardware AMD consumer/prosumer sin depender de CUDA.
- Sustitucion de llama.cpp en pipelines existentes: al exponer una API compatible con OpenAI, puede colocarse detras de clientes que ya consumen `/v1/chat/completions` y comparar su comportamiento contra la referencia llama.cpp del mismo GGUF.
- Prototipado de razonamiento con modo thinking: util para tareas de analisis que se benefician de cadenas de razonamiento, activando o desactivando `enable_thinking` por peticion segun el coste aceptable.
- Evaluacion de kernels generados: como artefacto de investigacion, sirve para validar la generacion automatica de kernels de `loom-next` frente a la referencia llama.cpp mediante las compuertas `golden`, `compare` y `spec`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible; el autor no publica cifras de memoria para este paquete. La cuantizacion Q4_K_M reduce el peso respecto a precision completa, pero el tamano exacto del GGUF no se detalla en la informacion (el repositorio figura con 0,0 GB).
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta orientado a las dos plataformas AMD citadas; no se declara compatibilidad con GPUs NVIDIA ni con otras Radeon.
- Despliegue: `hrx-loom[hf]==0.2.0` mediante `pipx`, con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Opciones recomendadas por el autor: `--pool_backing=fixed` y `--parameter_mode=preload`, con `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las tablas comparativas frente a llama.cpp estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Sage-A1.5-Q4_K_M-loom (este paquete) | no disponible | 262.144 | Texto + imagen | Apache 2.0 | Loom (`.loom` + `model.json`) sobre AMD gfx1151/gfx1201 |
| InternScience/Sage-A1.5-Q4_K_M-GGUF (base) | no disponible | no disponible en la informacion | Texto + imagen | Apache 2.0 (heredada) | GGUF, ejecutable con llama.cpp |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no incluye mediciones de rendimiento ni de correccion: todas las compuertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como no re-medidas, por lo que no hay evidencia publicada de que la salida coincida con la referencia llama.cpp.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por defecto, lo que puede ser insuficiente para cargas de produccion con alta demanda o generaciones largas.
- Compatibilidad restringida a las dos plataformas AMD declaradas (gfx1151 y gfx1201); no se documenta soporte para otras GPUs.
- Idiomas soportados no declarados: no es posible evaluar la calidad multilingue sin probar el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un empaquetado del modelo base, hereda los del checkpoint original, que no se detallan.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende de `hrx-loom` 0.2.0 y del ecosistema Loom; conviene revisar las condiciones de esas dependencias antes de desplegar en produccion.
- El paquete se genero con `loom-next` sin intervencion de un LLM en el bucle; la calidad del artefacto depende del generador y no ha sido validada con mediciones en esta publicacion.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0,0 GB, lo que sugiere que los ficheros pueden no estar materializados o la publicacion es meramente de borrador (`loom-draft`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/InternScience-Sage-A1.5-Q4_K_M-loom
- Modelo base GGUF: https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF
- Repositorio ROCm/hrx-system (Loom): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
