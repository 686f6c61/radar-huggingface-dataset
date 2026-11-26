# loom-draft/turtle0001-StoryGen-12B-It-loom

## Resumen

`loom-draft/turtle0001-StoryGen-12B-It-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Marekoth-Story-Base.Q4_K_M.gguf`, procedente del modelo base `turtle0001/StoryGen-12B-It-GGUF`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next` (el generador, sin LLM en el bucle), dentro del ecosistema Loom impulsado por ROCm. No es un modelo nuevo: es una distribucion optimizada para ejecutar un modelo de generacion de historias de 12B en GPUs AMD concretas.

El objetivo es permitir la inferencia del GGUF original en dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el servidor `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI. El paquete se distribuye bajo licencia MIT y esta pensado para entornos de escritorio y estaciones de trabajo con hardware AMD, no para GPUs NVIDIA ni para despliegues en la nube convencionales.

La relevancia es acotada: se trata de un artefacto de empaquetado especifico de hardware, con cero descargas y cero likes en el momento de la consulta, y con las mediciones de rendimiento y las puertas de correccion aun "no re-measured". Su interes practico depende de que el lector opere con Strix Halo o R9700 y quiera servir el modelo StoryGen-12B-It sin recurrir a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del modelo subyacente; se infiere transformer a partir del formato GGUF, sin confirmacion) |
| Parametros totales | 12B (segun el nombre del modelo; no se detalla en la informacion) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 169.984 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `Marekoth-Story-Base.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado en programas `.loom` y `weights.loom`) |

Otros datos del paquete: salida maxima de 4.096 tokens (preset `max_tokens`), concurrencia de 4 peticiones simultaneas, API estilo OpenAI en `/v1/chat/completions`, tokenizador incluido en `tokenizer.json` y configuracion en `llm_config.json`.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento del modelo subyacente `turtle0001/StoryGen-12B-It-GGUF`. El paquete Loom no aporta datos sobre el transformer, el dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO. Lo unico documentado es el proceso de empaquetado: `loom-next` genera programas `.loom` y un `weights.loom` a partir del GGUF original y de su configuracion, y `loom-fetch` verifica los ficheros fuente mediante sha256 fijados en `model.json.lock`.

La innovacion tecnica del artefacto es el propio runtime Loom: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No hay decodificacion especulativa, tool calling ni modo de razonamiento en esta configuracion: la tabla de caracteristicas los marca como "not applicable". Tampoco se soportan entradas de imagen ni audio, aunque el modelo original las tenga, porque Loom no las implementa en esta version.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Generacion de historias y narrativa, segun el proposito declarado del modelo base StoryGen-12B-It.
- Contexto largo de hasta 169.984 tokens por peticion, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta.
- Tool calling: no soportado en este paquete (marcado "not applicable").
- Razonamiento o thinking mode: no soportado (marcado "not applicable").
- Decodificacion especulativa: no soportada (marcada "not applicable").
- Entrada de imagen: no soportada por Loom en este paquete (el modelo original la tiene).
- Entrada y salida de audio: no soportadas por Loom en este paquete (el modelo original las tiene).
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Generacion de narrativa y ficcion por capitulos: con 169.984 tokens de contexto, el modelo puede mantener arcos argumentales largos y coherentes, reinyectando resumenes y texto previo sin truncar, lo que encaja con el proposito declarado de StoryGen.
- Asistencia a guionistas y escritores en estaciones de trabajo AMD: un equipo con Radeon AI PRO R9700 (32 GB) puede servir el modelo en local mediante `loom-serve` y ofrecer una API OpenAI a herramientas de escritura, sin depender de servicios en la nube.
- Prototipado de aplicaciones conversacionales en hardware Strix Halo: el Ryzen AI Max+ 395 permite levantar un endpoint `/v1/chat/completions` en un equipo compacto y probar integraciones de cliente con 4 peticiones concurrentes.
- Procesamiento de documentos largos: la ventana de 169.984 tokens permite resumir, reescribir o extraer tramas de manuscritos completos en una sola peticion, con un limite de 4.096 tokens de salida que obliga a trocear la respuesta si se necesita mas extension.
- Evaluacion comparativa de runtimes AMD: el paquete incluye puertas de correccion (`golden`, `compare`, `kernel_tests`, `consistency`) disenadas para contrastar la salida con llama.cpp sobre el mismo GGUF, util para equipos que validan kernels ROCm frente a la referencia.
- Despliegue de bajo coste en laboratorio: al ser MIT y ejecutarse en GPUs de consumo profesional AMD, sirve para experimentar con un modelo de 12B cuantizado a Q4_K_M sin licencias adicionales ni infraestructura NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 12B; el paquete esta dirigido a la Radeon AI PRO R9700 con 32 GB y al Ryzen AI Max+ 395, cuya memoria unificada debe acomodar el modelo y el pool de memoria fijo que reserva `--pool_backing=fixed`.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPUs, incluidas las de NVIDIA.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete esta generado para los dos aceleradores citados.
- Despliegue: `hrx-loom[hf]==0.2.0` mediante `pipx`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete; llama.cpp aparece solo como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones "not yet re-measured".
- Concurrencia: 4 peticiones simultaneas; salida maxima de 4.096 tokens por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| turtle0001-StoryGen-12B-It-loom (este paquete) | 12B | 169.984 tokens | MIT | GGUF empaquetado en Loom; `loom-serve` en gfx1151 y gfx1201 | Hugging Face, 0 descargas |
| turtle0001/StoryGen-12B-It-GGUF (modelo base) | 12B | no disponible en la informacion | no disponible en la informacion | GGUF; ejecutable con llama.cpp y otros runtimes GGUF | Hugging Face (referenciado como base) |
| llama.cpp sobre el mismo GGUF | 12B | depende del runtime | no disponible | GGUF; llama.cpp | Referencia de correccion citada en la model card |

No se dispone de datos de rendimiento comparado (benchmarks, throughput, latencia) para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, contexto, licencia y disponibilidad segun la informacion proporcionada.

## Limitaciones y advertencias

- Paquete especifico de hardware: solo documenta Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay garantia de funcionamiento en otras GPUs.
- Rendimiento no verificado: las mediciones frente a llama.cpp y todas las puertas de correccion figuran como "not yet re-measured", por lo que no hay evidencia publicada de correccion numerica ni de velocidad.
- Funcionalidades ausentes: sin tool calling, sin modo de razonamiento, sin decodificacion especulativa, sin entrada de imagen y sin audio, aunque el modelo original las tenga.
- Muestreo sin determinar: la caracteristica `sampling` figura como "? not determined", lo que deja sin confirmar el comportamiento de temperatura, top_k y semilla.
- Salida limitada a 4.096 tokens por respuesta, lo que puede requerir trocear respuestas largas pese al contexto de 169.984 tokens.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Sesgos y riesgo de alucinacion: no documentados en la informacion; al ser un modelo de generacion de historias, cabe esperar contenido ficticio por diseno, pero no se aportan evaluaciones.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la informacion no detalla condiciones adicionales del modelo base ni del checkpoint GGUF original.
- Artefacto con cero descargas y cero likes: sin comunidad que lo valide, sin issues ni evidencia de uso en produccion.
- La model card esta truncada en la informacion proporcionada (el apartado `info.json` queda incompleto), por lo que pueden faltar detalles de medicion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/turtle0001-StoryGen-12B-It-loom
- Modelo base GGUF: https://huggingface.co/turtle0001/StoryGen-12B-It-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de busqueda web devueltos corresponden a Loom (la herramienta de grabacion de pantalla), a la marca de ropa Loom y a la entrada de Wikipedia sobre el telar, y no guardan relacion con este paquete de IA; se descartan como fuentes.
