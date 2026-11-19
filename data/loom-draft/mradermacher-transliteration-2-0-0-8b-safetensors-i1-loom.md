# loom-draft/mradermacher-Transliteration-2.0-0.8B-Safetensors-i1-loom

## Resumen

`loom-draft/mradermacher-Transliteration-2.0-0.8B-Safetensors-i1-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF `mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF`, que a su vez es una cuantizacion Q4_K_M del modelo base `Transliteration-2.0-0.8B-Safetensors`. El paquete incluye programas `.loom` generados con la herramienta `loom-next` y una tarjeta `model.json`, y esta pensado para ejecutarse en las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `loom-serve` del ecosistema Loom (ROCm/hrx-system).

El modelo subyacente es un transformer de aproximadamente 800 millones de parametros (0.8B) especializado en transliteracion, es decir, conversion entre sistemas de escritura (por ejemplo, alfabeto latino a cirilico, arabe o devanagari) preservando la pronunciacion. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada: el repositorio tiene 0 descargas y 0 likes, el tamano del repo es de 0.0 GB (probablemente contiene solo los programas y la tarjeta, no los pesos), y la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`gates.sh`) "no se han vuelto a medir" para este paquete. Es, por tanto, un artefacto experimental de distribucion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base; detalles no disponibles) |
| Parametros totales | ~0.8B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye el checkpoint `Transliteration-2.0-0.8B-Safetensors.i1-Q4_K_M.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en formato `.loom` con `model.json` y programas `*.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `Transliteration-2.0-0.8B-Safetensors` mas alla de su tamano (~0.8B) y su proposito (transliteracion). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documenta si emplea innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido en el modelo original.

Lo que si documenta la model card es la capa de despliegue: el paquete `.loom` incluye kernels generados por `loom-next` (sin LLM en el bucle de generacion) y se sirve con `loom-serve` sobre ROCm. La configuracion de servicio fija `--pool_backing=fixed` (pool de memoria comprometido por adelantado), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). El modo de razonamiento (`reasoning / thinking`) aparece como "always on" en la tabla de caracteristicas del paquete, aunque no se detalla su implementacion.

## Capacidades

- Generacion de texto y transliteracion entre sistemas de escritura (proposito declarado del modelo base).
- Modo de razonamiento siempre activo (`reasoning / thinking: always on` segun la model card).
- API compatible con OpenAI (`/v1/chat/completions`) a traves de `loom-serve`.
- Contexto de 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens (preset `max_tokens`).
- Tool calling: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Transliteracion de nombres propios y toponimos entre alfabetos: el modelo convierte cadenas como "Moscu" a "Москва" o "Beijing" a "北京" preservando la pronunciacion, tarea para la que fue ajustado el modelo base.
- Normalizacion de datos en pipelines de ingestion: al procesar corpus multilingues, el modelo puede unificar la representacion de entidades en un sistema de escritura comun antes de indexarlas en un motor de busqueda o base de datos.
- Generacion de variantes de busqueda: para un motor de busqueda interno, se pueden generar transliteraciones alternativas de una consulta para ampliar la cobertura de resultados sin depender de reglas manuales por idioma.
- Preprocesamiento para TTS y ASR: convertir texto a la escritura foneticamente adecuada antes de alimentar un sintetizador de voz o un reconocedor, reduciendo errores de pronunciacion en nombres extranjeros.
- Etiquetado y enriquecimiento de catalogos: en comercio electronico, transliterar marcas y productos para mostrarlos correctamente en mercados con alfabetos distintos, con un coste de computo muy bajo (0.8B en Q4_K_M).
- Despliegue en hardware AMD de gama alta: servir el modelo con `loom-serve` en una Radeon AI PRO R9700 (32 GB) o en un Ryzen AI Max+ 395 para experimentar con el ecosistema Loom y validar latencia en un caso de uso acotado.
- Prototipado de servicios de chat con contexto largo: gracias a los 262.144 tokens de contexto, se puede usar como banco de pruebas para evaluar el rendimiento de `loom-serve` con documentos extensos, aunque la calidad del modelo en tareas generales no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) no tienen ejecuciones registradas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~0.8B parametros en Q4_K_M el peso de los pesos ronda los 0.5 GB, pero el pool de memoria fijo del preset y el contexto de 262.144 tokens pueden incrementar sustancialmente el consumo.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo (RTX 4090, etc.); el paquete esta orientado a hardware AMD con ROCm.
- Opciones de despliegue: `loom-serve` (runtime del ecosistema Loom) con `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch` para descargar el paquete desde Hugging Face.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete estan pendientes de medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (transliteracion, ~0.8B) ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB: es probable que no contenga los pesos y que dependa de la descarga del GGUF original mediante `loom-fetch`.
- Las mediciones de rendimiento y las puertas de correccion no estan registradas; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- El modelo esta especializado en transliteracion; no se debe esperar calidad en razonamiento general, codigo o matematicas.
- No hay informacion sobre sesgos, idiomas soportados ni calidad de las transliteraciones por par de alfabetos.
- Riesgo de alucinacion: no documentado; en tareas de transliteracion, un error produce una cadena mal formada o foneticamente incorrecta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el GGUF original pueden tener condiciones adicionales no reflejadas en este paquete; conviene verificar la licencia del checkpoint `mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF`.
- El soporte esta limitado a hardware AMD concreto (Strix Halo y R9700); no hay garantia de funcionamiento en otras GPU o en CPU.
- El contexto de 262.144 tokens por peticion con un pool de memoria fijo puede agotar la VRAM en configuraciones con poca memoria; no se documenta el consumo real.
- La model card advierte de que el contenido citado son datos del autor y no instrucciones a seguir; el paquete se genero con `loom-next` sin LLM en el bucle, pero no se detalla el proceso de validacion.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/mradermacher-Transliteration-2.0-0.8B-Safetensors-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
