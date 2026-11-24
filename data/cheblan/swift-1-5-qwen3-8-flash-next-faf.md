# Cheblan/Swift-1.5-Qwen3.8-Flash-Next-faf

## Resumen

Swift 1.5 Qwen3.8-Flash-Next (FastAsFuck `.faf` Quantization) es una distribucion pre-cuantizada del modelo `ukisai/Swift-1.5-Qwen3.8-Flash-Next`, un fine-tuning de `Qwen/Qwen3.8-Flash-Next` orientado a flujos de trabajo con agentes de terminal, asistentes de codigo multi-turno y tool calling. El paquete lo publica el autor Cheblan dentro de su coleccion de cuantizaciones `fastasfuck`, y no es un modelo nuevo entrenado desde cero, sino una conversion de pesos a un formato binario propietario (`.faf`) pensado para su motor de inferencia homonimo.

La relevancia de esta ficha no esta tanto en el modelo subyacente como en su empaquetado: el release esta optimizado de forma explicita para la arquitectura de memoria unificada AMD Strix Halo (`gfx1151`, Ryzen AI Max+ 395 con 128 GB de LPDDR5X-8533), e incluye artefactos poco habituales como una tabla n-gram de 8,4 millones de filas para decodificacion especulativa y un modulo de vision nativo. El repositorio ocupa 123,1 GB en total, aunque los pesos cuantizados principales son aproximadamente 65,5 GiB.

Se trata de un modelo MoE (mezcla de expertos) con cuantizacion hibrida Q6/Q4/Q8, capacidades multimodales de entrada (image-text-to-text) y un chat template que soporta bloques de razonamiento y llamadas a herramientas. La licencia es `swift-open-license-1.0` combinada con la Qwen Community License 1.0, lo que impone condiciones adicionales para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), con torre de proyeccion de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (verificado en benchmarks de prefill a 128k) |
| Tipos de cuantizacion | Hibrida Q6 / Q4 / Q8 (formato `.faf` propietario) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 + Qwen Community License 1.0 |
| Formato de pesos | `.faf` (binario propietario de fastasfuck); vision en `vision.faf`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) y capacidades multimodales de entrada, segun los tags `moe`, `qwen3_8` e `image-text-to-text`. Incorpora un mecanismo de decodificacion especulativa basado en MTP (multi-token prediction) con 7 pasos de borrador, combinado con una tabla n-gram int8 de 8.388.608 filas (`ngram.table`, ~48,3 GiB) que actua como motor de lookahead de prefijos (PLE). Esta combinacion es la que sostiene las cifras de latencia inter-token de 13,0 a 32,2 ms reportadas por el autor.

El fine-tuning lo realiza UkisAI sobre `Qwen/Qwen3.8-Flash-Next` y esta orientado a agentes de terminal, asistentes de codigo y tool calling. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion hibrida Q6/Q4/Q8 la realiza el equipo de fastasfuck, que documenta el proceso en `convert.log` e `inspect_weights.txt`. El modulo de vision (`vision.faf`, ~856 MiB) se distribuye como torre de proyeccion separada.

## Capacidades

- Generacion de texto y razonamiento multi-turno, con soporte de bloques de pensamiento (`thinking`) segun el chat template.
- Generacion de codigo, con enfasis declarado en asistentes de codigo y flujos de terminal.
- Tool calling y function calling, integrado en el chat template Jinja2.
- Capacidades agenticas y razonamiento multi-paso, con tags explicitos `agentic` y `terminal-bench`.
- Entrada multimodal de imagenes (pipeline `image-text-to-text`) mediante la torre de vision incluida.
- Decodificacion especulativa nativa (MTP + tabla n-gram PLE) para reducir latencia.
- Salida determinista verificable: el autor reporta coincidencia SHA-256 del 100,000% a temperatura 0,0.
- Compatibilidad con APIs OpenAI (`/v1/chat/completions` y `/v1/responses`).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el modelo esta fine-tuneado especificamente para flujos de terminal y tool calling, por lo que puede encadenar comandos, leer salidas y corregir errores en bucles multi-paso. La tabla n-gram y el MTP reducen la latencia en estas secuencias altamente repetitivas.
- Asistentes de codigo multi-turno en IDE: con 128k de contexto y reutilizacion de KV cache entre turnos, encaja en integraciones con Cursor, Codex CLI u OpenCode 2 mediante `/v1/responses`, manteniendo coherencia sobre ficheros grandes.
- Procesamiento de repositorios completos: los 128k tokens de contexto permiten cargar modulos enteros o varios ficheros C++ en una sola sesion; el autor reporta ~1.378 tok/s de prefill a 128k sobre un corpus real de C++.
- Despliegue multi-agente en un solo nodo: con 4 slots concurrentes el autor mide 104,4 tok/s agregados, lo que permite servir varios agentes simultaneos en una unica maquina Strix Halo sin GPU dedicada.
- Analisis de capturas o diagramas tecnicos: la torre de vision permite pasar imagenes junto al texto, util para interpretar diagramas de arquitectura, trazas de error o capturas de terminal.
- Inferencia reproducible en auditoria: la garantia de bit-identity a temperatura 0,0 facilita la verificacion de resultados en pipelines de evaluacion o cumplimiento.
- Prototipado local sin nube: al ejecutarse sobre memoria unificada de 128 GB en hardware consumer de gama alta (Ryzen AI Max+ 395), permite trabajar con un modelo de gran tamano sin depender de GPUs de datacenter.

## Benchmarks y rendimiento

El autor publica mediciones de throughput y latencia sobre AMD Ryzen AI Max+ 395 (40 CUs RDNA 3.5 `gfx1151`, 128 GB LPDDR5X-8533 a 273 GB/s, kernel Linux 7.3-zen). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Resultado | Condicion |
|---|---|---|
| Decodificacion greedy (T = 0,0) | 73,8 tok/s de media (pico 89,7 tok/s) | 1 slot activo, prefill en frio, prompt-cache desactivado |
| Decodificacion multi-agente (4 slots) | 104,4 tok/s agregados (pico 115,5 tok/s) | 4 slots concurrentes bajo carga continua |
| Prefill a 32k de contexto | ~1.458 tok/s (TTFT 21,2 s) | Corpus real de codigo C++ no repetido |
| Prefill a 128k de contexto | ~1.378 tok/s (TTFT 91,8 s) | Corpus real de codigo C++ no repetido |
| Latencia inter-token efectiva | 13,0 – 32,2 ms | 7 pasos MTP + tabla n-gram PLE de 8M filas |
| Reproducibilidad (bit-identity) | 100,000% de coincidencia SHA-256 | Temperatura 0,0 |

## Requisitos de hardware

- Memoria: el paquete completo ocupa 123,1 GB en disco; los pesos principales son ~65,5 GiB, la tabla n-gram ~48,3 GiB y la torre de vision ~856 MiB. Se requiere memoria unificada o VRAM suficiente para cargar pesos y tabla simultaneamente.
- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo, `gfx1151`, RDNA 3.5, 128 GB LPDDR5X-8533). Es el unico hardware con metricas publicadas.
- GPUs dedicadas: no se documenta soporte ni rendimiento en A100, H100 o RTX 4090. El formato `.faf` y el motor `fastasfuck` estan orientados a ROCm sobre `gfx1151`.
- GPU consumer: no hay datos de ejecucion en GPUs consumer convencionales; el diseno apunta a memoria unificada de 128 GB, no a VRAM de 24 GB.
- Despliegue: exclusivamente mediante el motor `fastasfuck` (binario nativo `build/strix/fastasfuck_server` o imagen `ghcr.io/cheblan/fastasfuck:latest` en Podman/Docker con acceso a `/dev/kfd` y `/dev/dri`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- API: expone endpoints compatibles con OpenAI en el puerto 5300 (`/v1/chat/completions` y `/v1/responses`).
- Throughput y latencia: ver tabla de benchmarks (73,8 tok/s en solitario, 104,4 tok/s agregados con 4 slots, TTFT de 21,2 s a 32k y 91,8 s a 128k).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-Flash-Next-faf (este) | no disponible (MoE) | 128k | `.faf` propietario | swift-open-license-1.0 + Qwen Community | AMD Strix Halo (`gfx1151`) |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors | no disponible | generico |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors | Qwen Community License 1.0 | generico |

## Limitaciones y advertencias

- Formato propietario: los pesos solo son utilizables con el motor `fastasfuck`; no hay conversion documentada a GGUF, safetensors ni compatibilidad con ecosistemas estandar como vLLM u Ollama.
- Hardware muy especifico: el rendimiento publicado solo esta verificado en AMD Strix Halo (`gfx1151`). En otras GPUs o aceleradores el comportamiento es desconocido.
- Licencia restrictiva: la combinacion de swift-open-license-1.0 y Qwen Community License 1.0 impone condiciones adicionales; es necesario revisar ambos textos antes de cualquier uso comercial.
- Ausencia de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni Terminal-Bench publicados en la informacion disponible, pese al tag `terminal-bench`.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones de factualidad ni tasas de error.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas del autor.
- Repositorio pesado: 123,1 GB de descarga, con una tabla n-gram de 48,3 GiB que debe residir en memoria junto a los pesos.
- Fecha de publicacion atipica (2026-11-24): conviene verificar la vigencia y el estado de mantenimiento del proyecto antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cheblan/Swift-1.5-Qwen3.8-Flash-Next-faf
- Modelo base (fine-tuning): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor fastasfuck: https://github.com/Cheblan/fastasfuck
- Coleccion de cuantizaciones fastasfuck: https://huggingface.co/collections/Cheblan/fastasfuck-quantizations
- Metodologia de benchmarks: https://github.com/Cheblan/fastasfuck/blob/main/docs/BENCHMARKS.md
- Imagen de contenedor: ghcr.io/cheblan/fastasfuck:latest
