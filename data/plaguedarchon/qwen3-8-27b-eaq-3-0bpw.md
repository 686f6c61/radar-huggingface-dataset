# PlaguedArchon/Qwen3.8-27B-EAQ-3.0bpw

## Resumen

Qwen3.8-27B-EAQ-3.0bpw es una cuantización de 3,0 bits por peso del modelo base Qwen/Qwen3.8-27B, publicada por el usuario PlaguedArchon en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un pack de pesos recomprimidos en el contenedor EAQ (formato EXL3 trellis), generado con el cuantizador XPU de TensorFold sobre una Intel Arc Pro B70 de 96 GB. El pack es únicamente de texto: la torre de visión del modelo base no está incluida.

El interés técnico del artefacto está en el método de compresión, no en capacidades nuevas. Se recodificaron las 64 capas del cuerpo a 3 bits (6 halves, 400 tensores trellis), la cabeza `lm_head` a 4 bits y se mantuvieron 450 tensores densos (normalizaciones, embedding, gates) en el dtype original. El resultado son 8 shards safetensors de unos 11,4 GB, un manifiesto con hashes por shard y un marcador de commit que permite verificar la integridad de la descarga.

Es relevante ahora porque ejemplifica una vía de despliegue de modelos de 27B en hardware Intel XPU con menos de 13 GB de pesos, algo que hasta hace poco dependía casi exclusivamente del ecosistema NVIDIA y de formatos GGUF/AWQ. Ahora bien, con 0 descargas, 0 likes, sin benchmarks publicados y atado a un runner propietario (TensorFold), debe considerarse un artefacto experimental de nicho, no una opción de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); detalles de arquitectura del base no disponibles en la informacion proporcionada |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EAQ / EXL3 trellis: cuerpo a 3 bits (6 halves), `lm_head` a 4 bits (8 halves), 450 tensores densos en dtype original |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en contenedor EAQ (EXL3 trellis); 8 shards, ~11,4 GB; repo total 12,4 GB |

## Arquitectura y entrenamiento

El pack no incluye entrenamiento propio: hereda los pesos de Qwen3.8-27B en bf16 y los recodifica. La arquitectura del modelo base es un transformer con 64 capas, según se deduce del censo de la model card ("Body (64 layers)"), pero no se aportan datos sobre atención, número de cabezas, dimensión oculta ni ventana de contexto. Tampoco se documenta la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO.

La innovación está en el pipeline de cuantización. El codificador es EXL3 Viterbi con el contrato `exl3-enc/v1: q12 u32-rebased inf=0xFFFFFFFF clamp=4.0`, ejecutado sobre kernels XPU (`xpu-kernel`). La calibración emplea 204.800 tiles de 2048 columnas por 100 filas (sha de corpus `c4c8b035…`) y aplica LDLQ con lambda 0,025 y semilla 224. El esquema trellis se apoya en los codebooks `mul1`/`mcg`/`3inst`, anchos de bit semienteros y rotaciones de Hadamard de 128 puntos heredados de ExLlamaV3, con búsqueda Viterbi de cola mordida y formulación LDL/LDLQ derivadas de QTIP (NeurIPS 2024). El pack incorpora certificación de integridad: rechazo por `ShardHashMismatch` ante un shard con un byte alterado, rechazo por `ShardOutside` ante un enlace simbólico y hash del manifiesto ligado al marcador de commit. La calidad se verifica con una puerta KL (KL forward, log-sum-exp en fp64, 16 filas naturales) frente a una referencia densa bf16, cuyos resultados por parte están en `quant_report.json` pero no se reproducen en la model card.

## Capacidades

- Generación de texto en inglés: es la función principal del pack, al ser una copia texto-only del modelo base.
- Razonamiento y matemáticas: capacidad heredada del modelo base; sin datos verificables en la información disponible.
- Generación de código: capacidad heredada del modelo base; no se documenta ni se evalúa en el pack.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: limitado a inglés según el campo `language` de la model card; el resto de idiomas del base no está confirmado en este pack.
- Capacidades especiales: no se declara modo thinking, audio ni visión; la torre de visión está explícitamente excluida.
- Verificación de integridad del artefacto: admisión de tabla completa (496 proyecciones, cabeza y embedding presentes) mediante `openEaq` + `loadExl3`.

## Casos de uso

- Despliegue de inferencia de texto en inglés sobre aceleradores Intel: el pack se abre directamente con el runner XPU de TensorFold (`tf-xpu-qwen27 <PACK> <ids> <N>`), lo que permite servir un modelo de 27B en un nodo con Arc Pro B70 sin depender de CUDA.
- Distribución de pesos con verificación criptográfica: el manifiesto con hashes por shard y el marcador `EAQ_COMPLETE.json` permiten validar la descarga en entornos con requisitos de cadena de suministro, rechazando shards manipulados o enlazados simbólicamente.
- Investigación en cuantización extrema: sirve como caso de estudio reproducible de EXL3 Viterbi con LDLQ (lambda 0,025, semilla 224, 204.800 tiles de calibración) para comparar la degradación KL frente a otras técnicas de 3 bits.
- Pruebas de banco en hardware no NVIDIA: útil para equipos que evalúan el rendimiento de kernels XPU con proyecciones EXL3 frente a sus equivalentes en CUDA.
- Prototipado de asistentes de texto en inglés con presupuesto de VRAM reducido: con ~11,4 GB de pesos, cabe en GPUs de 16 GB, lo que facilita iteración local en tareas de generación y resumen.
- Archivado y replicación de artefactos: el informe `quant_report.json` (401 partes, 212.226 B) documenta estadísticas por parte del codificador, lo que resulta útil para auditorías de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una puerta de calidad KL frente a una referencia densa bf16 y remite a `quant_report.json` para las estadísticas por parte del codificador, pero no se incluyen cifras (MMLU, HumanEval, GSM8K u otras) en la información proporcionada. Tampoco se documentan latencia ni throughput del runner `tf-xpu-qwen27`.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,4 GB de pesos en el pack de 3,0 bpw, más overhead de contexto y buffers de decodificación EXL3; el repo completo ocupa 12,4 GB, por lo que un presupuesto realista ronda los 13-16 GB, aunque no se publica una cifra oficial.
- Referencia en bf16: el modelo base necesitaría ~54 GB solo en pesos (27B × 2 bytes), de ahí el interés de la cuantización.
- GPU Intel: el pack se construyó y se valida en Intel Arc Pro B70 (96 GB XPU); el runner declarado es específico de XPU (`tf-xpu-qwen27`, kernels `forward_exl3.zig`, contenedor `exl3_eaq.zig`).
- GPU NVIDIA: la model card afirma explícitamente que no se utilizó hardware NVIDIA en la construcción; no se documenta compatibilidad con CUDA.
- GPU de consumo: cabe en tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090 por capacidad), pero la viabilidad depende de que exista un lector EXL3/EAQ para esa plataforma, algo no confirmado.
- Opciones de despliegue: TensorFold XPU runner (vía oficial documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato trellis no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlaguedArchon/Qwen3.8-27B-EAQ-3.0bpw | 27B | no disponible | safetensors EAQ/EXL3, 3,0 bpw | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | bf16 safetensors (~54 GB) | apache-2.0 | Hugging Face, modelo de referencia |
| Otras cuantizaciones EXL3 de Qwen3.8-27B | 27B | no disponible | EXL3 (2-4 bpw tipicamente) | apache-2.0 (heredada) | no disponible en la informacion proporcionada |
| Cuantizaciones GGUF/AWQ equivalentes | 27B | no disponible | GGUF / AWQ 4 bits | apache-2.0 (heredada) | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparados entre estas alternativas, por lo que la comparación se limita a formato, tamaño y licencia.

## Limitaciones y advertencias

- Pack texto-only: la torre de visión del modelo base no está incluida, por lo que cualquier caso de uso multimodal queda descartado.
- Idioma: el campo `language` declara únicamente inglés; no hay evidencia de que el resto de idiomas del base se preserven tras la recodificación a 3 bits.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni cifras de perplejidad publicadas; la única validación declarada es una puerta KL interna cuyos números no se reproducen en la model card.
- Cuantización agresiva: 3,0 bpw sobre 64 capas implica pérdida de calidad no cuantificada públicamente; la cabeza `lm_head` se mantiene a 4 bits, lo que sugiere sensibilidad en esa parte.
- Dependencia de tooling: requiere el lector `openEaq` + `loadExl3` y el runner de TensorFold; no es un artefacto plug-and-play en stacks estándar (vLLM, llama.cpp, transformers).
- Madurez: 0 descargas y 0 likes, publicador individual, sin historial de validación por terceros; no apto como dependencia crítica en producción sin evaluación propia.
- Riesgo de alucinación y sesgos: no documentados para este pack; deben evaluarse sobre el modelo base y revalidarse tras la cuantización.
- Licencia: apache-2.0 heredada del base, permisiva para uso comercial; deben respetarse los avisos de terceros (`THIRD_PARTY_NOTICES.md`, `LICENSES/`), incluidos EXL3 (MIT, Turboderp) y las referencias a QTIP (código GPLv3, no incluido en el pack).
- Dependencias de runtime no empaquetadas: el loader de Level Zero y el runtime de Intel se cargan en tiempo de ejecución; `ocloc` solo se usa en compilación. La portabilidad fuera de XPU no está garantizada.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/PlaguedArchon/Qwen3.8-27B-EAQ-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de QTIP (arXiv 2406.11235): https://arxiv.org/abs/2406.11235
- ExLlamaV3 / EXL3 (Turboderp): https://github.com/turboderp-org/exllamav3
- Repositorio QTIP (Cornell RelaxML): https://github.com/Cornell-RelaxML/qtip
- Formato safetensors: https://github.com/huggingface/safetensors
