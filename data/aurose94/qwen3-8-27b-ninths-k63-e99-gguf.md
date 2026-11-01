# auRose94/Qwen3.8-27B-ninths-k63-e99-GGUF

## Resumen

Qwen3.8-27B-ninths-k63-e99-GGUF es una cuantización experimental del modelo Qwen3.8-27B-Base de Qwen, publicada por el usuario auRose94 en HuggingFace. No se trata de una cuantización GGUF clásica tipo k-quant: los pesos se almacenan como flujos de dígitos en base 9 con codificación entrópica ("ninths container"), con un directorio interno en el propio fichero. El runtime materializa los pesos a Q8_0 exacto en tiempo de carga (verificado byte a byte por clase de tensor), o a IQ4_NL / f16 mediante una variable de entorno.

El interés principal de esta ficha es doble. Por un lado, el modelo base Qwen3.8-27B emplea una arquitectura híbrida (bloques gated-delta-net + atención, FFN densas, 65 bloques más una capa MTP), lo que lo sitúa en la línea de los modelos híbridos SSM/attention. Por otro, el formato de cuantización consigue 5,744 bits/parámetro, un 36 % del tamaño de referencia f16, manteniendo exactitud bit a bit tras la materialización.

Cabe destacar que el repositorio declara 19.623.724.316 parámetros en safetensors pese a denominarse "27B", y que requiere un fork específico de llama.cpp para ejecutarse. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated-delta-net + atención (arquitectura "qwen35"), FFN densas, 65 bloques + capa MTP |
| Parametros totales | 19.623.724.316 (dato safetensors) |
| Parametros activos | no disponible (el modelo se etiqueta como MoE, pero no hay datos publicados) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa 16.384 tokens, pero no es la especificación oficial) |
| Tipos de cuantizacion | ninths k63 body / k99 embeddings (5,744 bits/param); materializable a Q8_0, IQ4_NL o f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con contenedor "ninths" (flujos base-9 con codificación entrópica); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B-Base, sigue la arquitectura "qwen35": bloques híbridos que combinan capas gated-delta-net (un mecanismo de estado tipo SSM) con bloques de atención convencional, FFN densas (no MoE en las FFN, aunque el repositorio se etiqueta con "moe"), 65 bloques totales y una capa adicional MTP (multi-token prediction) que permite decodificación especulativa con borrador propio. Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay datos publicados en la información disponible.

La innovación principal de este repositorio es el formato de cuantización: 410 tensores de flujo ("stream tensors") cuantizados a 5,744 bits/parámetro, equivalentes al 36 % del tamaño f16, mientras que normas, sesgos y tensores copiados se mantienen sin cambios. Los pesos se materializan a Q8_0 exacto en tiempo de carga, con verificación por puerta ("gate-verified") por clase de tensor y validación contra un decodificador independiente con cero discrepancias. La tabla de embeddings (k99) y el head de salida permanecen en Q8_0 exacto incluso en la materialización IQ4_NL.

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational").
- Decodificación especulativa mediante la capa MTP incluida (`--spec-type draft-mtp`), con 64 % de aceptación medida por el autor.
- Ejecución híbrida en CPU, CUDA y HIP/ROCm (probado en gfx1151 / Radeon 8060S) a través del fork de llama.cpp.
- Cuantización compatible con modelos de atención híbrida: los matmuls del lado SSM pasan por el mismo camino de flujo.
- Soporte de plantilla de chat vía `--jinja` en llama-server.
- Capacidades de visión, audio, tool calling o agentes: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en hardware con VRAM limitada: con ~15,6 GiB de huella en materialización IQ4_NL, el modelo cabe en GPUs de 24 GB (RTX 3090/4090) con residencia completa en GPU, algo inviable en f16.
- Experimentación con formatos de cuantización entrópica: el repositorio incluye la especificación de metadatos (`ninths.directory2` + `ninths.materialize`, docs/12 del repo base9-quantization), útil para investigadores que quieran estudiar o extender el formato.
- Servidores LLM autoalojados: el comando `llama-server` de ejemplo permite levantar un endpoint OpenAI-compatible con contexto de 16 KiB y atención flash activada.
- Aceleración de generación por especulación: la capa MTP nativa permite duplicar el throughput medido (de 13,1 a 27,0 tok/s) sin modelo borrador externo.
- Despliegue en aceleradores AMD: al estar probado sobre HIP/ROCm (Radeon 8060S), es relevante para entornos sin NVIDIA.
- Evaluación de modelos híbridos SSM/attention en tareas de código: el autor reporta 21/24 tareas correctas en una batería propia de 24 tareas de Godot-4, lo que sugiere utilidad en generación de código de motor de juegos, aunque es una métrica no estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos, aportados por el autor del repositorio, son:

| Métrica | Valor |
|---|---|
| Bits por parámetro | 5,744 (36 % del tamaño f16) |
| Tiempo de carga K9 (A9 Mega, 16 lanes) | ~40 s |
| Throughput sin especulación | 13,1 tok/s |
| Throughput con draft-mtp | 27,0 tok/s (64 % de aceptación) |
| Batería Godot-4 (24 tareas) | 21/24 |

Estas cifras corresponden a la máquina del autor (A9 Mega con 96 GiB) y no son comparables directamente con benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: ~15,6 GiB de huella en dispositivo con materialización IQ4_NL (residencia completa en GPU); el contenedor K9 ocupa 18,3 GiB en disco. En f16 el modelo rondaría el doble, no disponible con exactitud.
- GPU recomendadas: cualquier GPU con ≥16 GiB para IQ4_NL (RTX 4080/4090, Radeon con ROCm); probado específicamente en Radeon 8060S (gfx1151). También funciona en CPU puro.
- Consumer GPUs: cabe en una RTX 3090 o RTX 4090 (24 GB) con materialización IQ4_NL y residencia completa en GPU; con Q8_0 materializado (~19,6 GB de pesos más overhead) es justo en 24 GB.
- Despliegue: exclusivamente mediante el fork de llama.cpp de auRose94 (rama `k9`, commit `d39bc1d55` o posterior). Los runtimes estándar (llama.cpp oficial, Ollama, vLLM, TGI) no son compatibles con este formato; para ellos el autor remite a la exportación estándar `Qwen3.8-27B-iq4nl-GGUF`.
- Rendimiento medido: 13,1 tok/s en CPU (A9 Mega), 27,0 tok/s con especulación MTP; no hay mediciones en GPU publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ninths-k63-e99 | 19,62 B | GGUF ninths (5,744 bits/param) | no disponible | Apache-2.0 | Requiere fork de llama.cpp |
| Qwen3.8-27B-iq4nl-GGUF (del mismo autor) | 19,62 B | GGUF IQ4_NL estándar | no disponible | Apache-2.0 | Runtimes GGUF estándar |
| Qwen3.8-27B-Base (original) | 19,62 B | safetensors | no disponible | Apache-2.0 | HuggingFace, runtimes completos |

No se conocen otros modelos comparables con datos suficientes para una comparativa de rendimiento; no disponible.

## Limitaciones y advertencias

- Compatibilidad de runtime: el fichero no funciona en llama.cpp estándar, Ollama, vLLM ni TGI; requiere un fork concreto de terceros, lo que supone un riesgo de mantenimiento y seguridad para producción.
- Incouencia de nomenclatura: el nombre indica "27B" pero los safetensors declaran 19,62 B de parámetros; conviene verificar qué cuenta de parámetros usa cada herramienta.
- Datos de rendimiento no verificados: las mediciones (tok/s, batería Godot-4) provienen solo del autor y no están auditadas independientemente.
- Sesgos conocidos: no disponible; al derivar de Qwen3.8-27B-Base (modelo base sin ajuste por instrucciones aparente), heredará los sesgos de su preentrenamiento.
- Riesgo de alucinación: no disponible específicamente; siendo un modelo base, no está alineado para seguir instrucciones de forma fiable.
- Idiomas y longitud de contexto máxima: no disponibles en la documentación.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el fork de llama.cpp necesario debe revisarse por su propia licencia y madurez.
- La materialización a Q8_0/IQ4_NL ocurre en tiempo de carga, lo que añade ~40 s de arranque medidos en la configuración del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/auRose94/Qwen3.8-27B-ninths-k63-e99-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-Base
- Fork de llama.cpp (rama k9): https://github.com/auRose94/llama.cpp
- Exportación estándar compatible: https://huggingface.co/auRose94/Qwen3.8-27B-iq4nl-GGUF (referenciado en la model card)
- Especificación del formato base9-quantization (docs/12): no disponible como URL directa
