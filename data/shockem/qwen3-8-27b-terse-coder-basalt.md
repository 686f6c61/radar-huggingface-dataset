# Shockem/Qwen3.8-27b-Terse-Coder-Basalt

## Resumen

Qwen3.8-27b-Terse-Coder-Basalt es un empaquetado en formato Basalt del checkpoint Qwen3.8-27b-Terse-Coder, un ajuste fino de Qwen/Qwen3.8-27B orientado a generacion de codigo con cadenas de razonamiento reducidas. Lo publica el usuario Shockem en Hugging Face y su proposito es ofrecer una version cuantizada y lista para servir con el runtime Basalt, preservando el comportamiento del checkpoint original pero con un coste de memoria notablemente menor.

El modelo parte de un merge de la ronda 8 (r8sel-ep1) del adaptador Terse-Coder sobre la base Qwen3.8-27B, con aproximadamente una decima parte de los tokens de chain-of-thought en tareas de codigo manteniendo la correccion. El pack Basalt v2 emplea NVFP4 en las capas MLP y en la cabeza de salida, FP8 E4M3 en las proyecciones de atencion y GDN, y BF16 en los embeddings, e incluye el proyector de vision.

Es relevante ahora porque demuestra un pipeline de despliegue de un modelo de 27B en dos GPU de consumo (2x RTX 5060 Ti de 16 GB) con contexto de 131072 tokens y KV en int8, algo que con pesos en BF16 requeriria hardware de centro de datos. La licencia Apache 2.0 heredada de la base facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (identificador de arquitectura en Basalt: `qwen35`), con capas GDN y proyector de vision |
| Parametros totales | 27B (heredados de Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131072 tokens (configuracion medida) |
| Tipos de cuantizacion | NVFP4 (MLP y cabeza de salida), FP8 E4M3 (proyecciones de atencion y GDN), BF16 (embeddings); KV cache en int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pack Basalt v2 (`.basalt`, 21.6 GB); checkpoint NVFP4 de origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer con capas GDN (gated delta network) y proyecciones de atencion, ademas de un proyector de vision incluido en el pack. Sobre esa base se aplico el adaptador Terse-Coder en su ronda 8 (merge r8sel-ep1), cuyo objetivo declarado es reducir el numero de tokens de chain-of-thought en tareas de codigo en aproximadamente un orden de magnitud sin degradar la correccion. El checkpoint intermedio se publico primero en NVFP4 y de ahi se construyo el pack Basalt.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El pack incluye la capa MTP (multi-token prediction) del checkpoint original en FP8, pensada para decodificacion especulativa, aunque en la configuracion medida con division de capas entre dos tarjetas el drafting con `spec >= 2` falla con un acceso ilegal a memoria en el primer token generado, por lo que la unica configuracion estable documentada es `--spec 0` (decodificacion plana).

## Capacidades

- Generacion de texto y razonamiento con modo de cadena de pensamiento abreviada (Terse-Coder), orientado a reducir latencia en tareas de codigo.
- Generacion y comprension de codigo, con soporte declarado para instrucciones, razonamiento, JSON, herramientas y compactacion de contexto (el arnes del autor cubre esos seis dominios).
- Tool calling y function calling, con plantilla de chat especifica para uso agente publicada por el autor.
- Razonamiento multi-paso y uso en agentes, apoyado en el contexto de 131072 tokens.
- Capacidades de vision por la presencia del proyector visual en el pack.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa mediante la capa MTP incluida, aunque inestable en la configuracion multi-GPU documentada.

## Casos de uso

- Asistente de codigo en IDE o CLI: el modelo genera parches y explicaciones con cadenas de razonamiento cortas, lo que reduce el coste por peticion frente a un modelo de razonamiento extenso y encaja en flujos interactivos donde la latencia importa.
- Revision de pull requests automatizada: con 131072 tokens de contexto puede ingerir diffs grandes, ficheros relacionados y discusion previa, y devolver comentarios estructurados en JSON.
- Agente de refactorizacion multi-fichero: el soporte de tool calling y la ventana larga permiten encadenar lecturas, ediciones y verificaciones sobre un repositorio sin perder el hilo.
- Extraccion estructurada de datos: la capacidad JSON declarada lo hace util para convertir texto libre o documentacion tecnica en esquemas validables dentro de pipelines ETL.
- Despliegue en hardware de consumo: con 21.6 GB de pack y KV int8 cabe en dos RTX 5060 Ti de 16 GB con division por capas, lo que habilita prototipos y entornos de desarrollo sin GPU de centro de datos.
- Procesamiento de documentos con imagen: el proyector de vision incluido permite tareas de comprension de capturas, diagramas o documentacion escaneada combinadas con razonamiento sobre el contenido.
- Compactacion de contexto en agentes de larga duracion: el arnes del autor evalua explicitamente la compactacion, util para resumir historiales y mantener sesiones dentro de la ventana.

## Benchmarks y rendimiento

Resultados reportados por el autor para el checkpoint Terse-Coder sobre vLLM (no re-ejecutados en el pack Basalt):

| Benchmark | Resultado |
|---|---|
| HE+ | 91.5 |
| MBPP+ | 79.4 |
| GSM8K | 98.5 |
| GPQA | 79.8 |

Rendimiento medido del pack Basalt en 2x RTX 5060 Ti 16 GB, division por capas (0-31 y 32-63), contexto 131072, KV int8, `--spec 0`:

| Metrica | Valor |
|---|---|
| Prefill 512 tokens | 3491 tok/s |
| Prefill 4k | 3893 tok/s |
| Prefill 32k | 5373 tok/s |
| Prefill 64k | 4632 tok/s |
| Decode (prosa y codigo, 512 tokens, temp 0.7) | 22.1 tok/s |
| Arnes interno (6 dominios) | 15/15 en 64 s |

## Requisitos de hardware

- VRAM estimada: el pack ocupa 21.6 GB; con KV int8 y contexto de 131072 se midio en 2x 16 GB (32 GB totales) con division por capas.
- GPU recomendadas: 2x RTX 5060 Ti 16 GB es la configuracion validada; una unica GPU de 24 GB o superior (RTX 4090, L40S, A100) es plausible pero no esta documentada en la informacion disponible.
- Cabe en GPU de consumo: si, en el par de RTX 5060 Ti documentado; en una sola tarjeta de 16 GB no hay datos.
- Opciones de despliegue: runtime Basalt (`basalt serve`), version 0.4.1 build 9167453; vLLM para el checkpoint original; otros runtimes (llama.cpp, Ollama, TGI) no estan soportados por el formato `.basalt`.
- Latencia y throughput: 22.1 tok/s en decode y entre 3491 y 5373 tok/s en prefill segun longitud; el arnes de 15 pruebas completo tarda 64 s.
- Muestreo almacenado en el pack: temperatura 0.6, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder-Basalt | 27B | 131072 | Apache 2.0 | Basalt (NVFP4/FP8/BF16) | Cuantizado para 2x GPU de consumo |
| Qwen3.8-27b-Terse-Coder (base del pack) | 27B | no disponible | Apache 2.0 | safetensors / NVFP4 | Sin cuantizar para Basalt; benchmarks reportados sobre vLLM |
| Qwen3.8-27b-Terse-Coder-NVFP4 | 27B | no disponible | Apache 2.0 | NVFP4 | Checkpoint intermedio del que se construyo el pack |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 | safetensors | Modelo base sin el adaptador Terse-Coder |

## Limitaciones y advertencias

- La decodificacion especulativa (`spec >= 2`) falla con acceso ilegal a memoria en la configuracion de dos tarjetas; solo `--spec 0` esta validado.
- Los benchmarks HE+, MBPP+, GSM8K y GPQA corresponden al checkpoint original sobre vLLM y no se han re-ejecutado en el pack Basalt, por lo que el rendimiento real del empaquetado puede diferir.
- El modelo no tiene descargas ni likes en el momento de la ficha y procede de un autor individual, no de un laboratorio con proceso de publicacion revisado.
- El formato `.basalt` es propietario del runtime Basalt; no es portable a llama.cpp, Ollama o TGI sin conversion.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base de Qwen y conviene verificar las condiciones de la base original.
- La plantilla de chat recomendada para agentes es externa (Shockem/froggeric-terse-coder); usar otra puede degradar el comportamiento.
- El contexto de 131072 se midio con KV int8; con otros tipos de KV o longitudes mayores el consumo de VRAM cambia y no esta documentado.

## Enlaces

- Repositorio del pack: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-Basalt
- Checkpoint de origen: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Checkpoint NVFP4 intermedio: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de chat para agentes: https://huggingface.co/Shockem/froggeric-terse-coder
