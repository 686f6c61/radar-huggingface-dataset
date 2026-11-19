# loom-draft/unsloth-Ministral-3-8B-Instruct-2512-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue para el runtime Loom de AMD. Concretamente, `loom-draft/unsloth-Ministral-3-8B-Instruct-2512-loom` empaqueta el checkpoint GGUF sin modificar `Ministral-3-8B-Instruct-2512-Q4_K_M.gguf` de Unsloth, junto con programas `.loom` generados automáticamente por la herramienta `loom-next` y una tarjeta `model.json` con los presets de ejecución. El objetivo es permitir la inferencia de Ministral 3 8B Instruct sobre dos aceleradores AMD concretos: el APU Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Ministral 3 8B Instruct (variante 2512), un transformer denso de 8.000 millones de parámetros de la familia Mistral, distribuido con licencia Apache 2.0. El paquete fija una longitud de contexto de 108.544 tokens por petición, permite 4 peticiones concurrentes y limita la salida a 4.096 tokens mediante el preset `max_tokens`. Expone una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es acotada pero práctica: cubre el hueco de servir modelos de 8B en hardware AMD de consumo y estación de trabajo sin depender de CUDA, con verificaciones de correctitud (gates) frente a llama.cpp. No obstante, en el momento de la instantánea del repositorio no hay métricas de rendimiento ni resultados de gates registrados, y el paquete no soporta tool calling, modo razonamiento ni entrada de imagen a través de Loom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ministral 3 8B Instruct); paquete de despliegue Loom con kernels generados |
| Parametros totales | 8 000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 108 544 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint incluido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) más programas `.loom` y `weights.loom` generados |
| Concurrencia | 4 peticiones simultáneas |
| Salida máxima | 4 096 tokens (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 8B parámetros de la familia Ministral 3, distribuido por Unsloth en formato GGUF. Este repositorio no aporta información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni las fases de alineación (RLHF/DPO/SFT) del modelo original; esos datos corresponden a la model card de Mistral y no están incluidos en la información disponible.

La contribución técnica del paquete es el pipeline de compilación de Loom: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF sin intervención de un LLM en el bucle, junto con `model.json` y `model.json.lock`, que fija los ficheros fuente mediante comprobación sha256 en `loom-fetch`. El servidor `loom-serve` ofrece opciones de despliegue relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset en lugar de crecimiento elástico) y `--parameter_mode=preload` (cambia solo la carga de pesos en host). El paquete incluye además una batería de gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, aunque ninguna tiene medición registrada en esta instantánea.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Contexto largo: 108.544 tokens por petición, adecuado para documentos extensos y conversaciones prolongadas.
- Concurrencia de 4 peticiones simultáneas con garantía de consistencia declarada (gate `consistency`, sin medición registrada).
- Capacidad de visión heredada del modelo base, pero no soportada por Loom según la tabla de features del paquete.
- Tool calling: no aplicable en este paquete.
- Modo razonamiento / thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada/salida de audio: no aplicable.
- Muestreo (`temperature`, `top_k`, `seed`): estado "no determinado" en la tabla de features.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete permite servir un modelo de 8B con 108.544 tokens de contexto en una Radeon AI PRO R9700 o en un APU Strix Halo, sin CUDA, mediante `loom-serve` y una API compatible con OpenAI.
- Procesamiento de documentos largos: con 108.544 tokens por petición se pueden resumir o extraer información de contratos, informes técnicos o transcripciones sin fragmentación agresiva.
- Chat multi-usuario ligero: los 4 slots de concurrencia permiten atender a un pequeño equipo interno con una sola instancia, siempre que la latencia aceptable esté en el rango de un modelo 8B en Q4_K_M.
- Sustitución de llama.cpp en entornos AMD: el paquete está pensado como alternativa con kernels generados específicamente para gfx1151 y gfx1201, con gates de comparación token a token frente a la referencia de llama.cpp (pendientes de medición).
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente compatible a `http://127.0.0.1:8080` y cambiar después a un backend en la nube sin reescribir código.
- Evaluación de hardware AMD para inferencia: útil para equipos que quieran medir el rendimiento real de Strix Halo o R9700 con un modelo de referencia de 8B antes de comprometer compras o despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comparativas de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía", y que todos los gates de correctitud figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 8B, y la GPU R9700 referenciada dispone de 32 GB.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA: no soportadas por este paquete, que depende del runtime Loom de AMD.
- Cabe en GPU de consumo: no disponible; el paquete solo documenta los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Opciones de servido relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las tablas de rendimiento del repositorio están vacías.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512 (este paquete, vía Loom) | 8B | 108 544 tokens | Apache 2.0 | GGUF Q4_K_M + programas `.loom`, runtime Loom | Solo AMD gfx1151 y gfx1201; sin tool calling ni visión en Loom; sin métricas publicadas |
| Ministral-3-8B-Instruct-2512 (GGUF de Unsloth, vía llama.cpp) | 8B | no disponible en la información | Apache 2.0 | GGUF | Referencia de correctitud usada por los gates del paquete; portable a más hardware |
| Mistral 7B Instruct | 7B | no disponible en la información | Apache 2.0 | safetensors, GGUF | Generación anterior de la familia; comparativa de rendimiento no disponible |
| Llama 3.1 8B Instruct | 8B | no disponible en la información | Llama 3.1 Community License | safetensors, GGUF | Licencia con restricciones comerciales, a diferencia de Apache 2.0 |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un paquete de despliegue, no un modelo afinado: no aporta mejoras de calidad sobre el GGUF original de Unsloth.
- Sin métricas de rendimiento ni de correctitud registradas: todos los gates figuran como "not yet re-measured", por lo que no hay evidencia publicada de paridad con llama.cpp en esta instantánea.
- Compatibilidad de hardware muy restringida: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para NVIDIA ni para otras GPU AMD.
- Funcionalidades ausentes en Loom: tool calling, modo razonamiento, decodificación especulativa y entrada de imagen (aunque el modelo base soporta visión).
- Estado del muestreo marcado como "no determinado", lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed` en producción.
- Límite de salida de 4.096 tokens por petición, que puede ser insuficiente para generación de código o documentos extensos.
- Idiomas soportados no declarados en la información disponible.
- Riesgo de alucinación y sesgos del modelo base: no documentados en este repositorio; deben consultarse en la model card original de Ministral 3.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y del runtime Loom por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y mantenimiento no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Ministral-3-8B-Instruct-2512-loom
- Modelo base GGUF en Hugging Face: https://huggingface.co/unsloth/Ministral-3-8B-Instruct-2512-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
