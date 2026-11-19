# loom-draft/LiquidAI-LFM2.5-8B-A1B-loom

## Resumen

LFM2.5-8B-A1B-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `LFM2.5-8B-A1B-Q4_K_M.gguf` del modelo LiquidAI/LFM2.5-8B-A1B. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversión del GGUF original a programas `.loom` y una tarjeta `model.json` generados con la herramienta loom-next, orientados a ejecutar el modelo sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario loom-draft dentro del ecosistema Loom, un runtime alternativo a llama.cpp para hardware AMD basado en ROCm. El interés practico es que ofrece un servidor compatible con la API de OpenAI (`/v1/chat/completions`) con 128.000 tokens de contexto por peticion y 4 peticiones concurrentes, usando los pesos cuantizados Q4_K_M sin modificarlos.

La relevancia es limitada y muy especifica: es un artefacto de despliegue para un modelo base de terceros, con cero descargas y sin mediciones de rendimiento ni de correccion registradas en el momento de la publicacion. Para la mayoria de equipos de desarrollo no sustituye al GGUF original servido con llama.cpp, vLLM u Ollama, sino que cubre el caso de quien quiera probar el stack Loom sobre GPUs AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura del modelo base; hereda la de LiquidAI/LFM2.5-8B-A1B) |
| Parametros totales | no disponible (el nombre sugiere 8B totales y 1B activos, pero no se confirma en la informacion) |
| Parametros activos | no disponible (el sufijo A1B apunta a un esquema MoE, sin confirmar) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | GGUF de origen, empaquetado como programas Loom (`program/*.loom`, `weights.loom`) mas `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base. La informacion disponible solo indica que se parte del GGUF `LFM2.5-8B-A1B-Q4_K_M.gguf` publicado por LiquidAI y que loom-next genera, sin intervencion de un LLM en el bucle, los programas `.loom` y el fichero `weights.loom` a partir de ese checkpoint y de su `llm_config.json`. Cualquier detalle sobre tipo de transformer, capas, atencion o mezcla de expertos corresponde al modelo original de LiquidAI, no a esta ficha.

Tampoco hay datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF o DPO ni innovaciones de decodificacion. Lo unico reseñable en el plano tecnico es el propio pipeline de conversion a Loom, que traduce los pesos GGUF a kernels y programas ejecutables sobre ROCm para las arquitecturas gfx1151 y gfx1201, y que incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) definidas pero sin resultados registrados para este paquete.

## Capacidades

- Generacion de texto conversacional mediante un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Contexto largo: hasta 128.000 tokens por peticion, suficiente para documentos extensos o historiales de conversacion amplios.
- Concurrencia de 4 peticiones simultaneas en el servidor Loom.
- Limite de 4.096 tokens de salida por respuesta (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento o modo thinking: no aplicable.
- Esfuerzo de razonamiento configurable: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado sin determinar en la documentacion del paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion del stack Loom sobre AMD: el paquete permite levantar un servidor OpenAI-compatible con `loom-serve` en una Strix Halo o una R9700 para medir latencia, throughput y estabilidad del runtime frente a llama.cpp con el mismo GGUF.
- Prototipado de chat con contexto largo en hardware de escritorio: con 128.000 tokens por peticion se pueden procesar contratos, informes o hilos de correo completos en una sola llamada desde una APU Strix Halo, sin GPU dedicada de datacenter.
- Sustitucion de backend en aplicaciones ya integradas con la API de OpenAI: al exponer `/v1/chat/completions`, basta cambiar la URL base y el nombre del modelo para apuntar a `lfm2.5-8b-a1b` y comparar respuestas con el proveedor original.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: los 32 GB de VRAM permiten mantener el Q4_K_M residente con margen para el pool de memoria fijo (`--pool_backing=fixed`) y atender hasta 4 peticiones concurrentes en entornos de desarrollo internos.
- Banco de pruebas de correccion: las puertas `golden`, `compare` y `consistency` estan definidas para contrastar token a token contra llama.cpp; un equipo que quiera validar el runtime Loom puede ejecutarlas sobre este paquete una vez re-medidas.
- Servicio de resumenes o extraccion de informacion en local: para flujos donde no se puede enviar datos a la nube, el modelo corre integramente en la GPU AMD del puesto de trabajo mediante `loom-fetch` y `loom-serve`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que ninguna de las puertas de correccion tiene evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el hardware de referencia es una GPU de 32 GB (Radeon AI PRO R9700) y una APU con memoria unificada (Ryzen AI Max+ 395).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera programas para ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. Flags relevantes: `--pool_backing=fixed` y `--parameter_mode=preload`; `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; no hay mediciones registradas para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LiquidAI-LFM2.5-8B-A1B-loom (este) | no disponible | 128.000 tokens | Loom (desde GGUF Q4_K_M) | other | Solo AMD gfx1151 y gfx1201; sin benchmarks ni puertas de correccion registradas |
| LiquidAI/LFM2.5-8B-A1B-GGUF (base) | no disponible | no disponible en esta ficha | GGUF | other | Checkpoint original; ejecutable con llama.cpp, Ollama u otros runtimes GGUF en multiples plataformas |
| llama.cpp con el mismo GGUF | no disponible | segun configuracion | GGUF | MIT (herramienta) | Referencia de correccion usada por el propio paquete; soporte amplio de hardware |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni evidencia de las puertas de correccion: todas las filas aparecen como "not yet re-measured". No hay garantia publicada de que la salida coincida con llama.cpp en este artefacto concreto.
- Soporte de hardware restringido a dos destinos AMD (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras GPUs AMD sin regenerar los programas.
- Tool calling, razonamiento, decodificacion especulativa, vision y audio figuran como "not applicable" en la tabla de caracteristicas del paquete.
- El estado del muestreo (temperature, top_k, seed) aparece como "not determined", lo que introduce incertidumbre sobre la reproducibilidad.
- Licencia "other" heredada del modelo base sin condiciones detalladas en la informacion: es imprescindible revisar los terminos de LiquidAI antes de cualquier uso comercial.
- Solo se empaqueta la cuantizacion Q4_K_M; no hay variantes Q8, Q5 o Q2 en este repositorio.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados para este paquete; dependen del modelo base de LiquidAI y no se han evaluado aqui.
- Idioma: no se especifican los idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano sin pruebas propias.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/LiquidAI-LFM2.5-8B-A1B-loom
- Modelo base en GGUF: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
