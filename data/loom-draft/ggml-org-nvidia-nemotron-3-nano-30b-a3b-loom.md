# loom-draft/ggml-org-NVIDIA-Nemotron-3-Nano-30B-A3B-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF`, en su variante `Q4_K_M`. El modelo subyacente es NVIDIA Nemotron-3 Nano 30B-A3B, un modelo de NVIDIA con arquitectura de mezcla de expertos (MoE) de 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, según se deduce de la nomenclatura "30B-A3B". El paquete esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta ficha es practica: documenta como ejecutar un modelo MoE de 30B en hardware AMD consumer y profesional mediante el runtime Loom (`hrx-loom`), con una API compatible con OpenAI, soporte de modo de razonamiento y una ventana de contexto de 262.144 tokens por peticion. No se trata de un fine-tune ni de una variante de pesos: el checkpoint GGUF es el original de `ggml-org` y el autor declara explicitamente que la generacion se hizo "with the generator alone, no LLM in the loop".

La informacion disponible es limitada en cuanto a especificaciones del modelo base (no se detallan composicion del dataset, numero de tokens de entrenamiento ni resultados de benchmarks), y el propio autor indica que las mediciones de rendimiento y las puertas de correccion para este paquete "no se han vuelto a medir todavia" en ambas GPU objetivo. Por tanto, esta ficha distingue claramente entre los datos del paquete Loom (verificables en la model card) y los datos del modelo Nemotron-3 Nano subyacente, que se indican como "no disponible" cuando no aparecen en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) del modelo base NVIDIA Nemotron-3 Nano 30B-A3B; detalles internos no disponibles |
| Parametros totales | 30B (segun nomenclatura del modelo base) |
| Parametros activos | ~3B (segun nomenclatura "A3B"; no confirmado en la informacion) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete; otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos concretos no disponibles) |
| Formato de pesos | GGUF (Q4_K_M); empaquetado como `.loom` + `model.json` |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (Loom) |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA Nemotron-3 Nano 30B-A3B, del que la informacion proporcionada solo revela la nomenclatura: 30B de parametros totales y 3B activos, lo que implica una arquitectura de mezcla de expertos con enrutamiento disperso. No se dispone de detalles sobre el numero de expertos, la funcion de enrutamiento, el numero de capas, la dimension oculta ni la atencion (si es estandar, lineal o hibrida). Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que si esta documentado es el proceso de empaquetado: el autor `loom-draft` genero un paquete Loom a partir del GGUF `NVIDIA-Nemotron-3-Nano-30B-A3B-Q4_K_M.gguf` de `ggml-org` sin modificar los pesos, usando la herramienta `loom-next` (generador automatico, sin LLM en el bucle). El paquete incluye programas `.loom` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (`model.json.lock`), lo que permite verificar la integridad del checkpoint original. La innovacion tecnica aqui no esta en el modelo sino en el runtime: Loom compila kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y ofrece opciones de despliegue como `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (precarga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo).

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo de 262.144 tokens por peticion, adecuado para documentos extensos y conversaciones multi-turno.
- Concurrencia de hasta 4 peticiones simultaneas.
- Tool calling: la model card lo marca como "not applicable" en este paquete.
- Decodificacion especulativa: "not applicable" en este paquete.
- Entrada de imagen: "not applicable".
- Entrada y salida de audio: "not applicable".
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (temperatura, top_k, semilla): marcado como "not determined" en la model card.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: desplegando el paquete con `loom-serve` en una Radeon AI PRO R9700 (32 GB), se obtiene un endpoint compatible con OpenAI al que apuntar cualquier cliente existente, sin depender de servicios en la nube.
- Analisis de documentos largos: la ventana de 262.144 tokens permite cargar contratos, informes o bases de codigo completas en una sola peticion, con el modo thinking activado para tareas de sintesis y extraccion.
- Prototipado de agentes con razonamiento: aunque el tool calling no esta soportado en este paquete, el modo thinking por defecto y el contexto largo permiten cadenas de razonamiento multi-paso dentro de una misma peticion.
- Evaluacion de hardware AMD para IA: el paquete sirve como banco de pruebas para medir el rendimiento de Strix Halo y R9700 frente a llama.cpp con el mismo GGUF, usando las puertas de correccion de `loom-benchmark` (golden, compare, consistency, sampling, logits).
- Despliegue en equipos compactos: al ser una cuantizacion Q4_K_M de un MoE con 3B activos, el modelo cabe en una GPU de 32 GB y en un APU con memoria unificada, lo que habilita inferencia local en formato mini-PC o workstation.
- Generacion de codigo y asistencia tecnica en local: integrable en editores o pipelines internos mediante la API HTTP, manteniendo los datos dentro de la infraestructura propia.
- Reproducibilidad y auditoria: el `model.json.lock` con hashes SHA-256 permite verificar que los pesos servidos coinciden con el checkpoint oficial de `ggml-org`, util en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir todavia" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU, por lo que no hay evidencia registrada de su comportamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para GPU de 32 GB (Radeon AI PRO R9700) y para el APU Ryzen AI Max+ 395 con memoria unificada.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPU NVIDIA en la informacion.
- Compatibilidad con GPU consumer: si, en el sentido de que Strix Halo es un APU integrado; no se documenta soporte para GPUs de escritorio consumer AMD o NVIDIA.
- Opciones de despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). El checkpoint base es GGUF, por lo que en teoria es compatible con llama.cpp, pero la model card solo documenta Loom.
- Latencia y throughput: no disponibles; las mediciones estan pendientes de repetir.
- Opciones de servicio relevantes: `--pool_backing=fixed` (reserva fija de memoria), `--parameter_mode=preload` (precarga de pesos), `completion_spin_ns=4294967295` (espera activa, consume CPU durante el trabajo de GPU).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, otros MoE de ~30B con ~3B activos). Cualquier comparacion numerica seria inventada.

## Limitaciones y advertencias

- El paquete no ha sido validado: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured" en ambas GPU objetivo.
- Tool calling, decodificacion especulativa, vision y audio no estan soportados en este paquete ("not applicable").
- El muestreo (temperatura, top_k, semilla) esta marcado como "not determined".
- El limite de salida es de 4.096 tokens por peticion, muy inferior a la ventana de contexto de 262.144 tokens.
- La concurrencia maxima es de 4 peticiones, lo que limita su uso como servidor de produccion con alta carga.
- Licencia "other": los terminos concretos del modelo base no se detallan en la informacion; es imprescindible revisar la licencia de NVIDIA Nemotron-3 Nano antes de cualquier uso comercial.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los riesgos habituales de los modelos de lenguaje.
- El modelo base es el checkpoint de `ggml-org` sin modificar; cualquier problema de calidad proviene del modelo original, no del empaquetado.
- La generacion del paquete se hizo con `loom-next` sin intervencion de un LLM, pero no se documenta el proceso de validacion de los kernels generados.
- Dependencia de hardware AMD especifico (gfx1151, gfx1201); no se garantiza funcionamiento en otras arquitecturas.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-NVIDIA-Nemotron-3-Nano-30B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
