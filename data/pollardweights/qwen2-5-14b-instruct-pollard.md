# PollardWeights/Qwen2.5-14B-Instruct-Pollard

## Resumen

Qwen2.5-14B-Instruct-Pollard es una cuantización del modelo denso Qwen/Qwen2.5-14B-Instruct (14.770.033.664 parámetros, arquitectura `qwen2`) publicada por PollardWeights mediante la herramienta Pollard Weights. No es un modelo nuevo: es un conjunto de pesos GGUF de precisión mixta en el que la asignación de bits no es uniforme, sino que se decide por sensibilidad medida capa por capa bajo un presupuesto de tamano. El objetivo es claro: comprimir un modelo de 29,54 GB en f16 hasta 3,92 GB manteniendo la coherencia conversacional.

La relevancia de esta ficha está en el extremo al que lleva la compresión. La variante principal del repositorio, `IQ1_KT` (denominada PollardMix), coloca átomos de 1 bit en el cuerpo FFN y en las claves y valores de atención, mientras protege con 2 bits las proyecciones q/output, `ffn_down` y los dos primeros y dos últimos bloques, y mantiene embeddings en `Q4_K`, cabeza de salida en `Q6_K` y normalizaciones en `F32`. El autor reporta que esta mezcla supera al cuantizado trellis uniforme de 1 bit en todas las métricas publicadas (PPL −14%, KLD medio −23%, top-1 +4,4 puntos) con solo un 8,5% más de tamano.

El repositorio es, por tanto, interesante para quien quiera ejecutar un 14B en hardware muy limitado (del orden de 6 GB de VRAM) o para quien investigue asignación de bits por sensibilidad. La contrapartida es que las variantes más agresivas (`IQ1_KT`, `IQ3_S`, `IQ4_XS`) requieren `ik_llama.cpp` y no funcionan en llama.cpp estándar, y que solo se declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2` (transformer denso, decoder-only) |
| Parametros totales | 14.770.033.664 (~14,8B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct declara 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | IQ1_KT (PollardMix, 3,92 GB), IQ3_S (6,69 GB), IQ4_XS (8,12 GB), Q6_K (12,12 GB). Para referencia de escalera: f16 29,54 GB, Q8_0 ~15,66 GB, Q6_K ~12,11 GB, Q4_K_M ~8,57 GB |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0, heredada del modelo base |
| Formato de pesos | GGUF (libreria declarada: `trellis`); el repo pesa 30,9 GB en total |
| Relacion con el base | `base_model_relation: quantized` sobre Qwen/Qwen2.5-14B-Instruct |
| imatrix | no |
| Perplejidad medida | si (WikiText-2 raw, contexto 2048, 145 fragmentos) |
| Descargas / likes | 1.216 descargas / 0 likes |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El modelo es una conversión de pesos del Qwen2.5-14B-Instruct original, un transformer decoder-only de arquitectura `qwen2` con atención completa. El trabajo de PollardWeights se sitúa íntegramente en el post-entrenamiento de compresión: la herramienta mide la sensibilidad por capa y asigna átomos de cuantización distintos a cada rol de tensor en lugar de aplicar una precisión uniforme. La tabla de asignación publicada es explícita: `IQ1_KT` (aplastado) para el cuerpo experto/FFN (gate, up) y para las claves y valores de atención; `IQ2_KT` (protegido) para q, output, `ffn_down`, y los bloques primero-dos y último-dos; `Q4_K` para los embeddings de tokens; `Q6_K` para la cabeza de salida; y `F32` para las normalizaciones.

La innovación declarada es esa "asignación medida": bits colocados por sensibilidad por capa bajo un presupuesto de tamano, en una escalera de cuantizados (PollardMix) en lugar de un aplastamiento uniforme. El autor indica que los archivos se verificaron con `pollard-ggufcheck`, comprobando los tipos de tensor en lugar de fiarse de los nombres de fichero, y que llama.cpp reempaqueta los pesos en un diseño intercalado en tiempo de carga para ARM y AVX, sin necesidad de ficheros especiales ni de las antiguas variantes `Q4_0_4_4/4_8/8_8`. No se menciona RLHF ni DPO adicional: la alineación es la del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento, explicación y continuación creativa: el autor indica que el modelo supera una "chat-coherence gate" en la que explicación, código, razonamiento y continuación creativa resultan coherentes.
- Generación de código: mencionada explícitamente entre las tareas verificadas en la puerta de coherencia.
- Razonamiento matemático y de sentido común: capacidades propias del base, no verificadas de forma específica en la model card de esta cuantización.
- Tool calling / function calling: no documentado en la información proporcionada para esta build (el base Qwen2.5-Instruct sí lo soporta, pero no se ha validado tras la cuantización).
- Agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Multilingüe: no. Solo se declara inglés (`language: en`).
- Capacidades especiales (visión, audio, modo thinking): no disponibles. La entrada es únicamente texto (`Input support: text`).

## Casos de uso

- Inferencia de un 14B en GPU de gama media: con la variante `IQ1_KT` (3,92 GB) el modelo cabe en GPUs consumer de 6-8 GB de VRAM, lo que permite disponer de un modelo de 14,8B donde antes solo cabía un 7B cuantizado a 4 bits.
- Despliegue en portátiles y equipos sin GPU dedicada: con `IQ3_S` (6,69 GB) o `IQ1_KT`, el modelo puede ejecutarse en CPU con `ik_llama.cpp` aprovechando el reempaquetado intercalado para ARM y AVX, útil para entornos de desarrollo sin acelerador.
- Asistentes conversacionales en inglés: el modelo soporta diálogo multi-turno con coherencia verificada, adecuado para chatbots de soporte o asistentes internos siempre que el tráfico sea en inglés.
- Generación de código en local: la puerta de coherencia incluye ejemplos de código, por lo que puede emplearse como asistente de autocompletado o explicación de fragmentos en entornos con requisitos de privacidad, donde no se quiere enviar el código a una API externa.
- Laboratorio de cuantización e investigación: el repositorio publica perplejidad, KLD medio y mediano y top-1 sobre WikiText-2 raw para tres builds comparables, lo que lo convierte en un caso de estudio reproducible para investigar asignación de bits por sensibilidad frente a cuantización uniforme.
- Evaluación de trade-offs precision/tamano: la escalera `Q6_K` → `IQ4_XS` → `IQ3_S` → `IQ1_KT` permite medir en una misma máquina el punto de degradación aceptable para una tarea concreta, ajustando el presupuesto de RAM/VRAM.
- Servidor de inferencia ligero con `llama-server`: la variante `Q6_K` funciona en llama.cpp estándar, Ollama y LM Studio, lo que facilita montar un endpoint compatible con la API de OpenAI sin dependencias exóticas.

## Benchmarks y rendimiento

Datos publicados por el autor. Corpus WikiText-2 raw, contexto 2048, 145 fragmentos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

| Build | PPL | Tamano | bpw | KLD medio | KLD mediano | top-1 |
|---|---:|---:|---:|---:|---:|---:|
| IQ2_KT uniforme (techo de 2 bits) | 6,92 | 4,30 GB | 2,50 | 0,353 | 0,128 | 76,85% |
| PollardMix (este modelo, `IQ1_KT`) | 8,27 | 3,65 GB | 2,12 | 0,552 | 0,253 | 70,79% |
| IQ1_KT uniforme (base de 1 bit) | 9,65 | 3,37 GB | 1,94 | 0,714 | 0,363 | 66,41% |

Nota de inconsistencia detectada en la propia model card: la tabla de la escalera de formatos asigna 3,92 GB a PollardMix, mientras que la tabla de métricas le asigna 3,65 GB. Ambas cifras aparecen en el mismo documento y no se explica la diferencia; conviene verificar el tamano real del fichero tras la descarga.

## Requisitos de hardware

- `Q6_K` (12,12 GB): requiere del orden de 14 GB de RAM/VRAM según el autor. No cabe en GPUs consumer de 8-12 GB; sí en RTX 4090 (24 GB), A100 40/80 GB, H100. Funciona en llama.cpp estándar, Ollama y LM Studio.
- `IQ4_XS` (8,12 GB): requiere del orden de 10 GB. Cabe en RTX 4080/4090 (16-24 GB) y en tarjetas de 12 GB con contexto reducido. Necesita `ik_llama.cpp`.
- `IQ3_S` (6,69 GB): requiere del orden de 9 GB. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares. Necesita `ik_llama.cpp`.
- `IQ1_KT` (3,92 GB): requiere del orden de 6 GB. Cabe en GPUs consumer de 6-8 GB (por ejemplo, RTX 3050/4060) y en equipos con RAM unificada. Necesita `ik_llama.cpp`.
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp para `Q6_K`; `ik_llama.cpp` para `IQ4_XS`, `IQ3_S` e `IQ1_KT`. Ollama y LM Studio están soportados explícitamente solo para `Q6_K`, ya que llama.cpp estándar rechaza cualquier tipo ggml por encima de 42.
- Reparto en CPU/GPU: los ejemplos del autor usan `-ngl 99`, es decir, todas las capas en GPU; en `ik_llama.cpp` puede bajarse `-ngl` para repartir capas entre VRAM y RAM si el fichero no cabe entero.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano / precision | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-Pollard (`IQ1_KT`) | 14,8B | no disponible | 3,65-3,92 GB, 2,12 bpw | PPL 8,27; KLD medio 0,552; top-1 70,79% | apache-2.0 | GGUF en HF; requiere `ik_llama.cpp` |
| Qwen2.5-14B-Instruct-Pollard (`Q6_K`) | 14,8B | no disponible | 12,12 GB | no disponible (no medido en la tabla) | apache-2.0 | GGUF en HF; llama.cpp estándar |
| Cuantizado IQ1_KT uniforme (referencia del autor) | 14,8B | no disponible | 3,37 GB, 1,94 bpw | PPL 9,65; KLD medio 0,714; top-1 66,41% | no disponible | no disponible (solo cifras en la model card) |
| Cuantizado IQ2_KT uniforme (referencia del autor) | 14,8B | no disponible | 4,30 GB, 2,50 bpw | PPL 6,92; KLD medio 0,353; top-1 76,85% | no disponible | no disponible (solo cifras en la model card) |
| Qwen2.5-14B-Instruct (base, f16) | 14,8B | no disponible | 29,54 GB | no disponible | apache-2.0 | safetensors en HF |

No se dispone de datos de benchmarks de tareas para ninguno de los modelos comparados dentro de la información proporcionada, por lo que la comparación se limita a tamano, formato, licencia y las métricas de perplejidad y KLD publicadas por el propio autor.

## Limitaciones y advertencias

- Solo inglés declarado. El campo `language` del repositorio contiene únicamente `en`; el uso en castellano u otros idiomas no está respaldado por el autor y puede degradarse especialmente a 1-2 bits por peso.
- Degradación medible frente a cuantizaciones menos agresivas: PPL 8,27 frente a 6,92 del techo uniforme de 2 bits, y top-1 del 70,79% frente al 76,85%. La variante `IQ1_KT` es la de menor fidelidad de la escalera.
- Dependencia de `ik_llama.cpp`: `IQ4_XS`, `IQ3_S` e `IQ1_KT` incorporan átomos exclusivos de `ik_llama.cpp`; llama.cpp estándar rechaza tipos ggml por encima de 42. Esto rompe la compatibilidad con buena parte del ecosistema (Ollama, LM Studio, muchos wrappers) salvo que se use `Q6_K`.
- Inconsistencia documental: la model card da dos tamanos distintos para PollardMix (3,92 GB y 3,65 GB). Conviene verificar el fichero descargado antes de dimensionar el hardware.
- Evaluación no replicada: el propio autor indica "single machine; replication invited". Las cifras de PPL y KLD provienen de una única máquina y no se han reproducido de forma independiente.
- Corpus de evaluación limitado: la perplejidad y el KLD se miden sobre WikiText-2 raw con contexto 2048 y 145 fragmentos, un conjunto reducido y de dominio único que no cubre código, matemáticas ni diálogo.
- Sin datos de tool calling ni de uso agente tras la cuantización: no se ha verificado que estas capacidades del base sobrevivan a 1-2 bits.
- Riesgo de alucinación: inherente a un modelo de 14,8B, acentuado por la cuantización agresiva. No se recomienda su uso en flujos donde una respuesta incorrecta tenga consecuencias sin verificación humana.
- Sesgos: no se documenta ningún análisis de sesgos en la model card; se heredan los del modelo base Qwen2.5-14B-Instruct.
- Licencia: apache-2.0, lo que permite uso comercial, pero al ser una obra derivada conviene revisar también las condiciones del modelo base y citar la autoría de la cuantización.
- Nombre del repositorio y metadatos: la etiqueta de librería es `trellis` y el campo `quantized_by` es PollardWeights, pero no se especifica el rango de contexto soportado en la build, que puede diferir del base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PollardWeights/Qwen2.5-14B-Instruct-Pollard
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Herramienta de cuantización Pollard Weights: https://github.com/WestWaters/pollard-weights
- `ik_llama.cpp`: https://github.com/ikawrakow/ik_llama.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden al portal PSE EDGE de la Bolsa de Filipinas y no guardan relación con la ficha).
