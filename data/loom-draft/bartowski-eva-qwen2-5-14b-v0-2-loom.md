# loom-draft/bartowski-EVA-Qwen2.5-14B-v0.2-loom

## Resumen

`loom-draft/bartowski-EVA-Qwen2.5-14B-v0.2-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/EVA-Qwen2.5-14B-v0.2-GGUF`, concretamente la cuantizacion `Q4_K_M`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos GGUF existentes a programas ejecutables por el runtime Loom de AMD, orientado a las GPU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es EVA-Qwen2.5-14B-v0.2, un derivado de la familia Qwen2.5 de 14.000 millones de parametros, distribuido por bartowski en formato GGUF. La contribucion de este repositorio es exclusivamente de infraestructura: permite servir ese checkpoint mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`), sin depender de llama.cpp en tiempo de ejecucion.

Su relevancia es acotada pero concreta: ofrece una via de despliegue nativa para hardware AMD consumer y profesional reciente, con contexto de 32.768 tokens por peticion y 4 peticiones concurrentes. El paquete fue generado con `loom-next` (solo el generador, sin LLM en el bucle). A fecha de la informacion disponible no se han publicado mediciones de rendimiento ni evidencias de los gates de correccion para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5); el paquete Loom genera kernels y programas para AMD GPU |
| Parametros totales | 14B (modelo base EVA-Qwen2.5-14B-v0.2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` + `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente, EVA-Qwen2.5-14B-v0.2, es un transformer decoder-only de 14.000 millones de parametros derivado de Qwen2.5. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones de atencion o decodificacion especulativa en el modelo base.

El aporte tecnico de este repositorio es el empaquetado Loom: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF original, junto con `tokenizer.json`, `llm_config.json` e `info.json` con mediciones y versiones. El runtime `loom-serve` expone la inferencia sobre AMD GPU con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye presets separados para Strix Halo (`chat`) y R9700 (`chat-r9700`), con verificacion sha256 de los ficheros fuente en `loom-fetch`.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta.
- Tool calling: no aplicable segun la tarjeta del modelo.
- Razonamiento / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado no determinado en la tarjeta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` y consumirlo desde cualquier cliente compatible con la API de OpenAI, sin GPU discreta adicional.
- Servicio de chat en Radeon AI PRO R9700: con 32 GB de VRAM, el preset `chat-r9700` permite atender hasta 4 conversaciones concurrentes con contexto de 32k tokens, util para prototipos de asistentes internos.
- Procesamiento de documentos largos: los 32.768 tokens de contexto permiten resumir o extraer informacion de contratos, informes o articulos de decenas de paginas en una sola peticion.
- Evaluacion comparativa de runtimes: al ser un empaquetado del mismo GGUF que usa llama.cpp como referencia, sirve para medir diferencias de rendimiento y fidelidad de salida entre Loom y llama.cpp en hardware AMD.
- Investigacion sobre compilacion de modelos: los programas `.loom` generados y los gates de correccion (`kernel_tests`, `golden`, `compare`, `logits`, `sampling`) permiten estudiar la traduccion de grafos de inferencia a kernels especificos de GPU AMD.
- Backend de aplicaciones de generacion de texto en entornos AMD: integracion mediante `curl` o SDKs compatibles con OpenAI en pipelines internos donde el hardware disponible es AMD y se quiere evitar la pila CUDA.
- Prototipado de agentes conversacionales simples: aunque la tarjeta marca tool calling como no aplicable, el endpoint de chat permite construir flujos de dialogo multi-turno con historial dentro de la ventana de 32k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo indica explicitamente que los resultados de rendimiento para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de correccion figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este empaquetado.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 14B en Q4_K_M, lo que situa los pesos en torno a 8-9 GB; el pool de memoria del runtime y el contexto de 32k anaden overhead adicional no cuantificado en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPU NVIDIA ni con otras GPU AMD distintas de las dos anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Opciones de servido relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de completaciones GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/EVA-Qwen2.5-14B-v0.2-GGUF (Q4_K_M) | 14B | no disponible | GGUF | Apache 2.0 | Checkpoint de origen; se sirve con llama.cpp u otros runtimes GGUF |
| Este paquete (loom-draft) | 14B | 32.768 tokens | `.loom` + `weights.loom` | Apache 2.0 | Mismo checkpoint empaquetado para runtime Loom en AMD |
| Qwen2.5-14B-Instruct (referencia de familia) | 14B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 (familia Qwen2.5) | Modelo original de la familia; EVA es un derivado |

La comparacion relevante es entre el GGUF original y este empaquetado: mismos pesos y misma licencia, distinto runtime y distinto hardware objetivo. No se dispone de datos de rendimiento que permitan comparar calidad o velocidad frente a alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: cualquier limitacion del checkpoint EVA-Qwen2.5-14B-v0.2 se hereda sin cambios.
- No hay mediciones de rendimiento ni evidencias de correccion publicadas para este paquete; todos los gates figuran como no re-medidos.
- Tool calling, thinking mode, decodificacion especulativa, vision y audio estan marcados como no aplicables, lo que limita su uso en flujos de agentes con funciones.
- El muestreo (temperature, top_k, seed) figura como "no determinado", lo que introduce incertidumbre sobre la reproducibilidad de salidas.
- Compatibilidad de hardware restringida a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta soporte para otras GPU.
- Idioma y cobertura multilingue no documentados; no se puede garantizar calidad en castellano.
- Riesgo de alucinacion inherente al modelo base, no evaluado en esta informacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base EVA y de Qwen2.5 de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), lo que sugiere un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-EVA-Qwen2.5-14B-v0.2-loom
- Modelo base GGUF: https://huggingface.co/bartowski/EVA-Qwen2.5-14B-v0.2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
