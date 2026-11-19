# loom-draft/unsloth-Mistral-Small-24B-Instruct-2501-loom

## Resumen

`loom-draft/unsloth-Mistral-Small-24B-Instruct-2501-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `Mistral-Small-24B-Instruct-2501-Q4_K_M.gguf` de Unsloth, derivado a su vez de Mistral-Small-24B-Instruct-2501 de Mistral AI. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Mistral Small 24B Instruct 2501 en cuantizacion Q4_K_M, y lo que aporta el repositorio es la capa de ejecucion (programas `.loom`, `weights.loom`, `model.json` y tokenizer) generada con la herramienta `loom-next` para GPUs AMD concretas.

El objetivo del paquete es permitir servir Mistral Small 24B sobre hardware AMD de consumo y estaciones de trabajo con aceleracion ROCm, en concreto el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). Expone una API compatible con OpenAI en `/v1/chat/completions`, con un limite de 32.768 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es fundamentalmente practica: ofrece una via de despliegue nativa en el ecosistema AMD para un modelo denso de 24B en cuantizacion de 4 bits, un segmento donde la mayoria del tooling (vLLM, TGI, llama.cpp con CUDA) esta optimizado para NVIDIA. La model card no incluye mediciones de rendimiento ni resultados de las puertas de correccion para este paquete en concreto, por lo que la evaluacion cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral Small 24B Instruct 2501); empaquetado para runtime AMD Loom |
| Parametros totales | 24B (modelo base Mistral Small 24B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye solo esta variante |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Mistral-Small-24B-Instruct-2501-Q4_K_M.gguf`) mas programas Loom generados (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-compatible `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral Small 24B Instruct 2501, un transformer decoder-only denso de 24.000 millones de parametros publicado por Mistral AI en enero de 2025. El paquete no modifica ni reentrena los pesos: toma el GGUF cuantizado a Q4_K_M publicado por Unsloth y genera, mediante `loom-next` (sin LLM en el bucle, segun la model card), un conjunto de programas `.loom` y un descriptor `model.json` que el runtime `loom-serve` interpreta para ejecutar la inferencia sobre ROCm en GPUs AMD.

La innovacion tecnica del repositorio no esta en el modelo sino en el pipeline de empaquetado: kernels generados especificos para gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La model card define ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero para este paquete todas aparecen como "not yet re-measured". No se dispone de informacion sobre datos de entrenamiento, tokens vistos ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en castellano y otros idiomas (idiomas exactos no disponibles).
- Razonamiento y respuesta a instrucciones, heredado de Mistral Small 24B Instruct 2501.
- Generacion de codigo y matematicas (capacidades del modelo base; sin benchmarks publicados en este paquete).
- Servidor HTTP con API compatible OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes existentes sin adaptadores.
- Soporte de 4 peticiones concurrentes con consistencia entre peticiones concurrentes y aisladas (puerta `consistency`, pendiente de medicion).
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Tool calling: marcado como "not applicable" en la model card de este paquete.
- Modo de razonamiento/thinking: no disponible.
- Decodificacion especulativa: no disponible.
- Entrada de imagen o audio: no disponible.

## Casos de uso

- Asistente conversacional self-hosted en estacion de trabajo AMD: desplegar `loom-serve` sobre una Radeon AI PRO R9700 y exponer un endpoint compatible OpenAI para un chatbot interno con 32k tokens de contexto, sin depender de servicios en la nube.
- Procesamiento de documentos largos en local: resumen y extraccion de informacion de contratos, informes o transcripciones de hasta 32.768 tokens por peticion, aprovechando la ventana de contexto del preset.
- Generacion de codigo en un flujo de desarrollo interno: el modelo base destaca en tareas de programacion; con la API OpenAI se puede conectar a extensiones de IDE o scripts de CI que necesiten explicaciones o parches, siempre que el hardware AMD este disponible.
- Prototipado y evaluacion de modelos en hardware AMD: util para equipos que quieren medir el rendimiento de Mistral Small 24B Q4_K_M en Strix Halo o R9700 frente a llama.cpp, usando las puertas de correccion de Loom como referencia.
- Despliegue en edge o en entornos con requisitos de soberania de datos: al ejecutarse en local sobre un APU Strix Halo, los datos no salen del equipo, lo que encaja en escenarios con restricciones de privacidad.
- Sustitucion de llama.cpp en pipelines existentes: el paquete ofrece una alternativa de runtime con la misma API y el mismo GGUF, lo que facilita pruebas A/B de rendimiento y latencia en el mismo hardware.
- Educacion e investigacion: servir un modelo de 24B en un laboratorio con GPUs AMD para experimentos de prompting, evaluacion de sesgos o generacion de datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correccion para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 24B ocupa aproximadamente 14-15 GB en disco; en ejecucion hay que sumar el pool de memoria del runtime y el contexto (32k tokens), por lo que se recomienda un minimo de 20-24 GB de VRAM o memoria unificada.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB) y APU Ryzen AI Max+ 395 "Strix Halo" (memoria unificada, gfx1151).
- Compatibilidad con GPU de consumo: no se documenta soporte para Radeon RX 7000/9000 de consumo ni para NVIDIA; el paquete esta generado para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas dentro de este paquete, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; la model card no incluye cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime/hardware |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Mistral-Small-24B-Instruct-2501-loom` | 24B denso | 32.768 | Q4_K_M | Apache 2.0 | Loom sobre AMD gfx1151/gfx1201 |
| `unsloth/Mistral-Small-24B-Instruct-2501-GGUF` | 24B denso | el del modelo base | Multiples variantes GGUF | Apache 2.0 | llama.cpp y otros runners GGUF |
| Mistral-Small-24B-Instruct-2501 (original) | 24B denso | 32.768 | BF16/FP16 | Apache 2.0 | vLLM, TGI, transformers |
| Modelos densos de ~24B en 4 bits (p. ej. Qwen2.5-32B-Instruct-GGUF) | 32B denso | 32.768 | Q4_K_M y otras | Apache 2.0 | llama.cpp, vLLM |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento publicados para el paquete Loom que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Paquete sin mediciones: todas las puertas de correccion y las comparativas de rendimiento frente a llama.cpp estan pendientes ("not yet re-measured"); no hay evidencia publicada de que la salida coincida token a token con la referencia.
- Hardware restringido: solo se declara soporte para AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPUs AMD ni en NVIDIA.
- Tool calling no soportado: la model card lo marca como "not applicable", lo que limita su uso en flujos de agentes.
- Sin modo thinking, sin vision, sin audio y sin decodificacion especulativa.
- Contexto limitado a 32.768 tokens por peticion y salida maxima de 4.096 tokens por preset.
- Idiomas soportados no documentados en la informacion proporcionada; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Riesgo de alucinacion y sesgos inherentes al modelo base Mistral Small 24B Instruct 2501; no se documentan evaluaciones de sesgo en este paquete.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en BF16; no hay datos de degradacion medidos para este paquete.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y del GGUF de Unsloth.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de borrador ("loom-draft") sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Mistral-Small-24B-Instruct-2501-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Mistral-Small-24B-Instruct-2501-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
