# loom-draft/unsloth-granite-3.3-8b-instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado por el autor, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado con `loom-next` a partir del checkpoint GGUF sin modificar `unsloth/granite-3.3-8b-instruct-GGUF`, en concreto la cuantizacion `granite-3.3-8b-instruct-Q4_K_M.gguf`. El modelo subyacente es Granite 3.3 8B Instruct de IBM, un transformer denso de 8.000 millones de parametros afinado para instrucciones, con una ventana de contexto declarada de 131.072 tokens en este paquete. El autor del paquete es `loom-draft` y la licencia declarada es Apache 2.0, heredada del modelo base.

El interes practico del artefacto es la portabilidad a hardware AMD: el paquete esta orientado a la APU AMD Ryzen AI Max+ 395 «Strix Halo» (objetivo `gfx1151`) y a la GPU AMD Radeon AI PRO R9700 (objetivo `gfx1201`, 32 GB de VRAM). El paquete expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un maximo de 4 peticiones concurrentes y 4.096 tokens de salida por peticion segun el preset.

La relevancia es acotada: se trata de un artefacto de despliegue derivado, no de un modelo nuevo, y la propia model card indica que las medidas de rendimiento y las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, entre otras) no se han vuelto a medir para este paquete. Cualquier evaluacion de calidad debe remitirse al modelo base de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 3.3 8B Instruct); el paquete contiene programas Loom generados, no pesos nuevos |
| Parametros totales | 8.000 millones (modelo base, segun la denominacion «8b») |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete solo distribuye esa cuantizacion |
| Idiomas soportados | no disponible (la model card del paquete no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | `loom-next` (generador sin LLM en el bucle) |
| Runtime | `hrx-loom[hf]==0.2.0`, comando `loom-serve` |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reproduce el grafo de computo del checkpoint Granite 3.3 8B Instruct de IBM en forma de kernels y programas Loom generados por `loom-next`. El modelo base es un transformer denso de 8.000 millones de parametros afinado para seguir instrucciones; la model card del paquete no aporta datos sobre volumen de tokens de entrenamiento, composicion del corpus ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la documentacion de IBM para Granite 3.3.

La innovacion tecnica del artefacto es el mecanismo de empaquetado y ejecucion: `loom-fetch` descarga el paquete desde Hugging Face verificando el sha256 de los ficheros fijados en `model.json.lock`, y `loom-serve` lo sirve con opciones de reserva de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de las finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye `tokenizer.json`, `llm_config.json` (configuracion desde la que se generaron los programas) e `info.json` con las medidas y la evidencia de compuertas. No se declara decodificacion especulativa, atencion lineal ni modos de razonamiento extendido en este paquete.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens por peticion.
- Capacidades heredadas del modelo base Granite 3.3 8B Instruct (razonamiento, codigo, matematicas e instrucciones generales), sujetas a lo que declare IBM para ese checkpoint.
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento o modo thinking: no aplicable segun la tabla de caracteristicas.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado «no determinado» en la model card.

## Casos de uso

- Servicio de chat en local sobre APU Strix Halo: desplegar `loom-serve` en un equipo con Ryzen AI Max+ 395 para ofrecer un endpoint compatible con OpenAI sin GPU dedicada, usando el contexto de 131.072 tokens para conversaciones largas.
- Procesamiento de documentos extensos en estaciones de trabajo con R9700: ingerir contratos o informes de decenas de miles de tokens en una sola peticion gracias a la ventana de contexto declarada, con la GPU de 32 GB como unico acelerador.
- Integracion en herramientas que ya hablan la API de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local cambiando solo la URL base y el nombre de modelo `granite-3.3-8b-instruct`.
- Evaluacion comparativa de runtimes AMD: usar el paquete como referencia para medir latencia y correccion frente a llama.cpp con el mismo GGUF Q4_K_M, apoyandose en las compuertas `golden` y `compare` de `loom-benchmark` cuando se registren medidas.
- Asistencia de codigo en entornos air-gapped: al ejecutarse en local con pesos descargados y verificados por sha256, encaja en redes sin salida a Internet donde no se permite enviar codigo a APIs externas.
- Prototipado de asistentes internos con concurrencia limitada: con 4 peticiones simultaneas y 4.096 tokens de salida, es suficiente para un equipo pequeno que necesite resumir, reescribir o clasificar texto sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que las comparativas de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete, y que todas las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». Una compuerta sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la cuantizacion Q4_K_M de un modelo de 8.000 millones de parametros ronda los 5 GB de pesos, a lo que hay que sumar el pool de memoria que reserva `--pool_backing=fixed` y la cache KV para contextos de hasta 131.072 tokens, que puede dominar el consumo en peticiones largas.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada).
- GPU de consumo: no se declara soporte para GPUs de consumo; los objetivos son exclusivamente los dos anteriores.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para la descarga y `loom-serve` para el servicio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; las cifras no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Granite 3.3 8B Instruct Q4_K_M para Loom) | 8.000 M | 131.072 tokens | `.loom` + GGUF de origen | Apache 2.0 | Solo hardware AMD gfx1151 y gfx1201; sin benchmarks ni compuertas registradas |
| `unsloth/granite-3.3-8b-instruct-GGUF` (modelo base del paquete) | 8.000 M | no disponible en la informacion | GGUF | Apache 2.0 | Checkpoint original sin modificar; sirve de referencia para llama.cpp |
| Granite 3.3 8B Instruct (IBM, pesos originales) | 8.000 M | no disponible en la informacion | safetensors (habitual en el modelo original) | Apache 2.0 | Fuente de las capacidades del paquete; requiere otro runtime |

No se dispone de datos de rendimiento comparado en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- El repositorio es un artefacto de despliegue derivado, no un modelo nuevo: no aporta mejoras de calidad sobre Granite 3.3 8B Instruct y cualquier evaluacion debe hacerse contra el modelo base.
- Cero descargas y cero «likes» en el momento de la consulta, y sin resultados de benchmarks ni compuertas de correccion registradas; la madurez y la validez del paquete no estan verificadas por terceros.
- Soporte de hardware restringido a AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se declara compatibilidad con otras GPUs.
- Tool calling, modo thinking, decodificacion especulativa, vision y audio figuran como no aplicables; no debe asumirse ninguna de esas capacidades.
- El estado del muestreo (temperature, top_k, seed) figura como «no determinado», lo que impide garantizar un comportamiento reproducible en produccion.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion segun el preset, insuficiente para cargas de alta concurrencia.
- Idiomas soportados no declarados en la model card del paquete; deben consultarse en la documentacion de IBM para el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son los inherentes al modelo base Granite 3.3 8B Instruct.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint original de IBM antes de desplegar en produccion.
- Las instrucciones de la model card se han tratado como datos de referencia; los comandos de ejemplo no se han ejecutado ni validado en esta ficha.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-granite-3.3-8b-instruct-loom
- Modelo base en GGUF: https://huggingface.co/unsloth/granite-3.3-8b-instruct-GGUF
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime del sistema (referenciado en la model card): https://github.com/ROCm/hrx-system

Nota: los resultados de busqueda web obtenidos corresponden a Loom (herramienta de grabacion de pantalla) y a la marca de ropa Loom, y no guardan relacion con este paquete; no se han incluido como enlaces relevantes.
