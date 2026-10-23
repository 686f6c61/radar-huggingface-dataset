# Abiray/Qwen3.8-Flash-Next-Orca-Abliterated-GSQ-RCO-Coder-GGUF

## Resumen

Esta ficha describe `Abiray/Qwen3.8-Flash-Next-Orca-Abliterated-GSQ-RCO-Coder-GGUF`, un build en formato GGUF derivado del modelo `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF`. Se trata de una versión "abliterated" y sin censura del coder podado de la familia Qwen3.8-Flash-Next: el autor parte del modelo de ISTA-DASLab —que reduce de 512 a 256 expertos por capa y comprime el modelo original de 354 GB (BF16) hasta 58,4 GB— y le injerta 144 tensores residuales ortogonalizados procedentes de `orcarouter/Qwen3.8-Flash-Next-Uncensored`, pasando por el puente de `SC117`. El resultado es un GGUF autónomo de 58,6 GB con los pesos ya modificados (no requiere adaptadores ni configuración adicional).

El interés técnico del build está en dos frentes. Por un lado, demuestra una técnica de "weight baking" para eliminar el comportamiento de rechazo sin reentrenar: se sustituyen únicamente tensores que escriben en el flujo residual, manteniendo routers y pesos no residuales byte a byte idénticos, con una divergencia KL media de 0,004120 y un 98,40% de acuerdo top-1 en decodificación greedy sobre código neutro. Por otro, es un ejercicio de cuantización extrema: un MoE de 116.514.464.640 parámetros totales almacenado a ~1,89 bits efectivos por parámetro (etiqueta `IQ1_M`), con pesos retenidos a ~3,5 bits (fidelidad equivalente a `IQ3_S`) y asignación mixta por tensor mediante GSQ + RCO.

El modelo es multimodal (pipeline `image-text-to-text`, con proyector de visión `mmproj` en BF16) y está orientado a código, tool calling agéntico y visión. Su relevancia práctica es que cabe en hardware de gama alta de consumo o en estaciones de trabajo con 64 GB de memoria unificada, manteniendo los benchmarks upstream reportados (79,20% en SWE-bench Verified, 87,43% en LiveCodeBench v6). Como contrapartida, el repositorio es muy reciente (23 de octubre de 2026), con 0 descargas, licencia no declarada y sin validación independiente de las cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas GDN (Gated DeltaNet) y MoE; 256 expertos por capa tras poda estructurada (desde 512); incluye tablas de lookup Per-Layer Embedding (PLE) |
| Parametros totales | 116.514.464.640 (~116,5 B), dato real de safetensors del modelo base |
| Parametros activos | no disponible (el autor no publica el número de expertos enrutados por token) |
| Longitud de contexto | no disponible como máximo oficial; el ejemplo de `llama-server` del autor arranca con `-c 32768` |
| Tipos de cuantizacion | Build único `IQ1_M`: pesos retenidos a ~3,5 bits (fidelidad equivalente a `IQ3_S`), 1,89 bits efectivos por parámetro respecto al modelo sin podar; 95 tensores densos de escritura residual promocionados a `Q8_0`; asignación mixta por tensor vía mapa RCO; `mmproj` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF dividido en 2 shards (`-00001-of-00002`, `-00002-of-00002`) + `mmproj-Qwen3.8-Flash-Next-BF16.gguf` para visión; checksums SHA-256 publicados |
| Tamano del repo | 59,6 GB (29,85 GiB + 28,80 GiB + 0,90 GiB de proyector) |
| Libreria / runtime | `llama.cpp` (tag `llama.cpp`, `endpoints_compatible`, `imatrix`) |
| Pipeline | `image-text-to-text` |
| Modelo base | `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF` |
| Fuente de los tensores abliterated | `orcarouter/Qwen3.8-Flash-Next-Uncensored`, vía `SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido con mezcla de expertos: el autor describe capas "Transformer/GDN" en el rango 0..47, es decir, combina atención clásica con capas GDN (Gated DeltaNet, una atención lineal con estado recurrente) y una capa MoE con 256 expertos tras la poda. El paquete incluye además tablas de lookup PLE (Per-Layer Embedding) en el segundo shard, que representan aproximadamente la mitad del peso del modelo. El modelo base de ISTA-DASLab aplica tres transformaciones sobre Qwen3.8-Flash-Next: (1) poda estructurada de 512 a 256 expertos por capa, seleccionando los especializados en ingeniería de software, coding, tool calling agéntico y visión; (2) GSQ (Gumbel-Softmax Quantization), que decide la precisión óptima por tensor; y (3) RCO (Riemannian Co-design Search), que busca la asignación de tipos de cuantización bajo esa parametrización. El resultado comprime 354 GB en BF16 hasta 58,4 GB.

Sobre esa base, este build realiza una "abliteración" por trasplante de pesos: se copian 144 tensores ortogonalizados que escriben en el flujo residual desde `orcarouter/Qwen3.8-Flash-Next-Uncensored` hacia la arquitectura Coder podada. No hay reentrenamiento ni fine-tuning declarado; el autor afirma que routers y pesos no residuales quedan byte a byte idénticos, y que se preservan el enrutado de expertos y las tablas PLE. Para mantener la fidelidad, 95 tensores densos de escritura residual se promocionan a `Q8_0`, lo que añade 0,23 GiB al paquete. El impacto medido sobre código neutro es pequeño pero real: perplejidad en corpus de código (C++/Python, ctx=512) de 1,2573 → 1,2749, KL media frente al original de 0,004120 y acuerdo top-1 del 98,40%. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de código en C, C++, Python y otros lenguajes, con foco declarado en ingeniería de software: el modelo base reporta 79,20% en SWE-bench Verified y 87,43% en LiveCodeBench v6.
- Razonamiento agéntico y tool calling / function calling de múltiples pasos, según la selección de expertos orientada a "agentic tool calling" del modelo podado.
- Capacidad multimodal de imagen a texto mediante el proyector `mmproj-Qwen3.8-Flash-Next-BF16.gguf` (pipeline `image-text-to-text`).
- Modo de razonamiento explícito: el autor menciona que las respuestas se emiten tanto en bloque `<think>` como en modo estándar.
- Conversación multi-turno (tag `conversational`) y compatibilidad con endpoints tipo API (`endpoints_compatible`).
- Comportamiento sin censura: el autor reporta 100% de cumplimiento en pruebas de red team sobre hooking de syscalls, inspección de PEB, sockets raw y laboratorios de exploits, frente al 0% del modelo original.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de resolución de issues en repositorios: el modelo está podado seleccionando expertos de ingeniería de software y reporta 79,20% en SWE-bench Verified, por lo que puede recibir un issue y un contexto de código y proponer un parche aplicable dentro de un pipeline de CI.
- Asistente de código en producción con tool calling: integrado vía `llama-server` con parámetros de sampling recomendados, puede invocar funciones (ejecutar tests, consultar documentación, abrir PRs) en flujos agénticos de varios pasos.
- Auditoría de seguridad ofensiva y análisis de binarios: al no rechazar consultas sobre hooking de syscalls, inspección de PEB o sockets raw, es utilizable en laboratorios de exploit y en formación en ciberseguridad donde un modelo alineado bloquearía la petición.
- Revisión de código asistida por capturas o diagramas: gracias al proyector de visión, puede recibir una imagen de un diagrama de arquitectura o de un fragmento de código en pantalla y generar la implementación o la crítica correspondiente.
- Despliegue en estación de trabajo local sin GPU dedicada de gran capacidad: con 58,6 GB de pesos en `IQ1_M` cabe en equipos con 64 GB de memoria unificada, lo que permite trabajar con código propietario sin salida a la nube.
- Generación de tests y documentación técnica sobre bases de código grandes: la ventana configurable (32.768 tokens en el ejemplo del autor) permite incluir varios ficheros y el historial de conversación en una sola petición.
- Prototipado de agentes autónomos de refactorización: la combinación de bajo bit-width y enrutado MoE reduce el coste por token frente a un modelo denso equivalente, lo que abarata las ejecuciones largas de agentes.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando el modelo base de ISTA-DASLab con este build. Las cifras de SWE-bench Verified y LiveCodeBench v6 son las reportadas por ISTA-DASLab para el modelo upstream y el autor afirma que se conservan los pesos, no que se hayan re-ejecutado.

| Metrica | ISTA-DASLab GSQ-RCO Coder (original) | Este build (Orca-Abliterated) | Notas |
|---|---|---|---|
| Tamano total | 58,4 GB | 58,6 GB | +0,23 GiB por promocionar 95 tensores residuales a `Q8_0` |
| Expertos enrutados | 256 / capa | 256 / capa | Enrutado y tablas PLE identicos |
| SWE-bench Verified | 79,20% | Pesos base retenidos | Cifra reportada por ISTA-DASLab |
| LiveCodeBench v6 | 87,43% | Pesos base retenidos | Cifra reportada por ISTA-DASLab |
| Perplejidad en corpus de codigo (ctx=512) | 1,2573 | 1,2749 (+0,0176) | Verificado en C++/Python |
| KL media frente al original | 0,000000 (referencia) | 0,004120 | Deriva casi nula en codigo neutro |
| Acuerdo top-1 | 100,00% (referencia) | 98,40% | Decodificacion greedy en codigo no sensible |
| Cumplimiento en red team | 0,0% (rechaza consultas sensibles) | 100,0% (cumple en `<think>` y estandar) | Hooking de syscalls, PEB, sockets raw, exploits |

No se han publicado resultados de benchmarks independientes (MMLU, GSM8K, HumanEval, MMMU) en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~58,6 GB solo para pesos (29,85 GiB + 28,80 GiB), más ~0,9 GiB del proyector de visión y la caché KV del contexto configurado (tamano no disponible). Presupuesto realista: 64 GB o más de memoria total.
- GPU recomendadas: una A100 80 GB o H100 80 GB ejecutan el modelo completo en VRAM. Con 2× RTX 4090 (48 GB) no cabe entero: obliga a offload parcial a RAM del sistema. Una RTX 4090 sola (24 GB) solo permite offload mayoritario a CPU.
- Cabe en GPU de consumo: sí, pero de forma parcial; el escenario natural es offload a RAM del sistema con `llama.cpp`. En Apple Silicon, un Mac Studio o MacBook Pro con 64 GB o 128 GB de memoria unificada es el caso más favorable, porque CPU y GPU comparten el mismo espacio.
- Opciones de despliegue: `llama-server` / `llama-cli` de `llama.cpp` es la vía documentada por el autor, con `--mmproj` para visión. Al ser GGUF, también es utilizable desde LM Studio y otras interfaces basadas en `llama.cpp`. Soporte en vLLM o TGI: no confirmado para esta arquitectura híbrida GDN + MoE.
- Parametros de ejecucion recomendados por el autor: `-c 32768 --temp 0.6 --top-p 0.95 --min-p 0.05 --repeat-penalty 1.05 --presence-penalty 0.5`. Advierte explícitamente contra la decodificación greedy pura (`--temp 0.0` sin penalización), que provoca repeticiones en definiciones de structs de C/C++.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (`Abiray/...Orca-Abliterated-GSQ-RCO-Coder-GGUF`) | ~116,5 B totales, MoE 256 expertos/capa | no disponible (ejemplo a 32.768) | `IQ1_M`, 58,6 GB | no disponible | Sin censura; vision; 0 descargas, 4 likes |
| `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF` | mismos pesos base | no disponible | GGUF, 58,4 GB | no disponible | Version alineada del mismo coder podado; SWE-bench 79,20% / LCB v6 87,43% |
| `SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF` | mismos pesos base | no disponible | GGUF | no disponible | Puente abliterated intermedio usado por este build |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored` | no disponible | no disponible | no disponible | no disponible | Origen de los 144 tensores residuales ortogonalizados |

No se dispone de datos verificables de modelos alternativos de otras familias (por ejemplo, coder densos de 30-70 B) en la informacion proporcionada, por lo que no se incluye una comparación cruzada de rendimiento.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: el propio autor reporta 100% de cumplimiento en consultas de seguridad ofensiva (hooking de syscalls, inspección de PEB, sockets raw, exploits). No es apto para aplicaciones de cara al público sin filtros externos.
- La abliteración modifica el comportamiento del modelo de forma global, no solo en temas sensibles; la divergencia KL de 0,004120 y la caída de acuerdo top-1 al 98,40% indican que un pequeño porcentaje de tokens cambia incluso en código neutro.
- Cuantización extrema: 1,89 bits efectivos por parámetro. La perplejidad en código sube de 1,2573 a 1,2749 y el autor advierte de degeneración en decodificación greedy, lo que sugiere fragilidad en tareas de formato muy repetitivo.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial. Además, el modelo base de ISTA-DASLab y el modelo de origen de los tensores tampoco declaran licencia en la información disponible, lo que añade incertidumbre sobre la cadena de derechos.
- Riesgo de alucinación: no cuantificado en la información disponible; un modelo de 116 B a ~1,9 bits efectivos tiene menos margen de fidelidad que una cuantización de 4-5 bits.
- Idiomas soportados no documentados: no se puede asumir buen rendimiento en castellano sin evaluarlo.
- Máximo de contexto no declarado: el ejemplo de 32.768 tokens es una configuración de arranque, no una garantía del límite del modelo.
- Repositorio sin tracción: 0 descargas, 4 likes, creado y actualizado el mismo día. No hay validación independiente de los benchmarks ni de la equivalencia byte a byte afirmada.
- Soporte de runtime limitado: probado en `llama.cpp`; el soporte en motores de alto throughput (vLLM, TGI, SGLang) para esta arquitectura híbrida GDN + MoE no está confirmado.
- Requiere verificar los checksums SHA-256 publicados antes de desplegar, dado que el repositorio no tiene histórico de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abiray/Qwen3.8-Flash-Next-Orca-Abliterated-GSQ-RCO-Coder-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Origen de los tensores abliterated (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Puente abliterated GGUF (SC117): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Framework de inferencia llama.cpp: https://github.com/ggml-org/llama.cpp
