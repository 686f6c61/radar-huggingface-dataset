# loom-draft/unsloth-LFM2.5-230M-loom

## Resumen

`loom-draft/unsloth-LFM2.5-230M-loom` es un paquete de despliegue para GPUs AMD del checkpoint GGUF `unsloth/LFM2.5-230M-GGUF`, concretamente la cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del checkpoint original sin modificar, y lo que aporta este repositorio es un conjunto de programas `.loom` y una tarjeta `model.json` generados con `loom-next` para ejecutar el modelo sobre el runtime Loom (`hrx-loom`) en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201).

El modelo subyacente, LFM2.5-230M, es un modelo de lenguaje de 230 millones de parametros de la familia LFM de Liquid AI, distribuido en formato GGUF por Unsloth. Su tamano reducido lo situa en la categoria de modelos pequenos para inferencia en el borde o en GPUs de gama consumer, con una ventana de contexto declarada de 128.000 tokens por peticion en la configuracion del preset Loom.

La relevancia de este repositorio es fundamentalmente de infraestructura: demuestra el empaquetado de un GGUF para el ecosistema Loom sobre ROCm, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de correccion figuran como "not yet re-measured" en ambas GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de Liquid AI; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | 230M (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (checkpoint base) y programas `.loom` + `weights.loom` (paquete Loom) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM2.5-230M en la documentacion proporcionada: no se detalla si es un transformer denso, un modelo hibrido con capas recurrentes o de estado, ni la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal; de hecho, la tabla de caracteristicas del paquete Loom marca la decodificacion especulativa como "not applicable" y el modo de razonamiento o thinking tambien como no aplicable.

Lo que si documenta el repositorio es la capa de ejecucion: el paquete incluye `program/*.loom` y `weights.loom`, programas generados por `loom-next` (el generador, sin LLM en el bucle) a partir de `llm_config.json`, junto con el tokenizer (`tokenizer.json`) y un `model.json` con los ficheros fuente fijados por hash SHA-256 que `loom-fetch` verifica. El runtime `hrx-loom` 0.2.0 expone una API estilo OpenAI y permite opciones de despliegue como `completion_spin_ns=4294967295` (espera activa de completaciones en GPU), `pool_backing=fixed` (reserva fija del pool de memoria) y `parameter_mode=preload` (carga anticipada de pesos en host).

## Capacidades

- Generacion de texto conversacional mediante `/v1/chat/completions` con esquema compatible con OpenAI.
- Ventana de contexto de 128.000 tokens por peticion, adecuada para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultaneas en el preset publicado.
- Limite de 4.096 tokens de salida por peticion (parametro `max_tokens` del preset).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento o modo thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la documentacion.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de referencia en GPUs AMD: el paquete sirve para validar la cadena `loom-fetch` + `loom-serve` sobre Strix Halo (gfx1151) o Radeon AI PRO R9700 (gfx1201) con un GGUF conocido, antes de pasar a modelos de mayor tamano en el mismo runtime.
- Clasificacion y etiquetado de texto a gran escala: con 230M de parametros y cuantizacion Q4_K_M, el coste por token es bajo y permite procesar volumenes altos de documentos cortos en una unica GPU.
- Asistentes conversacionales ligeros en el borde: la ventana de 128.000 tokens y la API OpenAI permiten integrarlo en aplicaciones locales que necesiten contexto largo sin depender de la nube.
- Generacion de resumenes de documentos extensos: el contexto declarado de 128k tokens admite pasar articulos, informes o transcripciones completas en una sola peticion, con salida limitada a 4.096 tokens.
- Pruebas de integracion y CI para aplicaciones basadas en OpenAI API: al exponer el mismo esquema de endpoint, se puede apuntar el cliente a `http://127.0.0.1:8080/v1` y ejecutar tests de contrato sin coste de API externa.
- Benchmarking de runtimes alternativos en hardware AMD: el repositorio esta disenado para comparar contra llama.cpp con las mismas puertas de correccion (`golden`, `compare`, `consistency`, `logits`), lo que lo hace util para evaluar la paridad numerica de Loom.
- Prototipado de pipelines con concurrencia moderada: las 4 peticiones concurrentes del preset cubren escenarios de demo o de uso interno con pocos usuarios simultaneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion "Performance vs llama.cpp" del repositorio indica explicitamente que los resultados "are not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de paridad con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 230M de parametros ocupa del orden de centenares de MB, pero el repositorio no publica la cifra exacta del paquete Loom ni el consumo del pool de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete esta generado especificamente para las dos GPUs AMD citadas y el runtime se invoca con `--device=amdgpu://`.
- Opciones de despliegue: `hrx-loom` 0.2.0 (instalable con `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Parametros de ejecucion recomendados por el autor: `completion_spin_ns=4294967295`, `pool_backing=fixed` y `parameter_mode=preload`.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/unsloth-LFM2.5-230M-loom` (este) | 230M | 128.000 tokens (preset Loom) | GGUF Q4_K_M empaquetado en `.loom`, runtime `hrx-loom` sobre AMD ROCm | other | Hugging Face, 0 descargas |
| `unsloth/LFM2.5-230M-GGUF` (modelo base) | 230M | no disponible | GGUF, ejecutable con llama.cpp y otros runners GGUF | no disponible | Hugging Face (checkpoint de origen) |
| Alternativas de ~200-300M en GGUF | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto declarado, formato y licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos nuevos ni un fine-tune: es un paquete de despliegue del GGUF `Q4_K_M` de `unsloth/LFM2.5-230M-GGUF`; cualquier limitacion del modelo base aplica integramente.
- Con 230M de parametros y cuantizacion Q4_K_M, la calidad en razonamiento complejo, matematicas y codigo es previsiblemente limitada; no hay benchmarks publicados que permitan cuantificarla.
- Riesgo de alucinacion: no evaluado en la documentacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se debe asumir cobertura multilingue.
- Sin soporte de tool calling, thinking, vision, audio ni decodificacion especulativa segun la tabla de caracteristicas del paquete.
- Estado del muestreo "not determined": el comportamiento de temperature, top_k y seed no esta verificado contra llama.cpp.
- Las puertas de correccion y las mediciones de rendimiento no estan registradas ("not yet re-measured"), por lo que no hay evidencia publicada de paridad numerica con llama.cpp ni de throughput real.
- Licencia "other": no se detallan los terminos; es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- El despliegue esta atado al runtime `hrx-loom` 0.2.0 y a las GPUs AMD gfx1151 y gfx1201; no se documenta compatibilidad con otras GPU, con CUDA ni con runners GGUF genericos para este paquete.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-11-19: no hay evidencia de uso en produccion por terceros.
- Los resultados de busqueda web proporcionados corresponden a productos no relacionados (Loom la herramienta de grabacion de pantalla y la marca de ropa Loom) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2.5-230M-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/LFM2.5-230M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
