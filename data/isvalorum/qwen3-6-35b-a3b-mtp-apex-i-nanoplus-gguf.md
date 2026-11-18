# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF

## Resumen

Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus GGUF es una cuantización artesanal del modelo base Qwen/Qwen3.6-35B-A3B, un transformer disperso de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. El modelo original cuenta con 35.505.251.456 parámetros totales, de los cuales solo una fracción se activa por token gracias a su arquitectura de 256 micro-expertos distribuidos en 40 capas principales, más un bloque MTP (Multi-Token Prediction) integrado en `blk.40`. Esta versión GGUF, publicada por IsValorum, comprime el modelo hasta un envoltorio de aproximadamente 13 GB manteniendo la fidelidad de enrutamiento y razonamiento.

La relevancia de esta ficha radica en su enfoque de cuantización selectiva: en lugar de aplicar codebooks uniformes de 2 bits a todos los tensores, el autor preserva los 80 routers principales en `F32` sin comprimir, los dos routers MTP en `BF16`, la cabeza de salida en `Q6_K` y las puertas de atención en `Q8_0`, restringiendo la compresión agresiva a las proyecciones redundantes de gating/up. El resultado es un archivo de 13,03 GB con 2,93 BPW y una perplejidad WikiText-2 de 5,5244, equivalente a un tier Q4_K_M/Q4_K_L, que cabe íntegramente en GPUs de 16 GB de VRAM.

El modelo es multimodal (image-text-to-text), soporta razonamiento, código, capacidades agénticas y 13 idiomas, y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial. Está pensado para despliegue en llama.cpp y servidores compatibles con la API de OpenAI, con soporte para streaming desde RAM del sistema cuando la VRAM es insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (Qwen3.5-MoE), 40 capas principales, 256 micro-expertos, bloque MTP integrado en `blk.40` |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (2,93 BPW promedio); tensores mixtos: routers `F32`/`BF16`, output head `Q6_K`, attention gates `Q8_0`, `ffn_down_exps` en `IQ3_XXS` (3,06 bpw), gating/up en 2 bits guiados por imatrix |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de visión |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas principales y 256 micro-expertos, más un bloque MTP (Multi-Token Prediction) que permite decodificación especulativa interna y predicción de múltiples tokens por paso. La cuantización APEX-I-NanoPlus aplica una asignación tensor por tensor: los 80 tensores `gate_inp`/`gate_inp_shexp` de enrutamiento permanecen en `F32` sin comprimir, los dos routers MTP de `blk.40` en `BF16`, la cabeza de salida en `Q6_K`, las puertas de atención en `Q8_0` y el flujo residual crítico `ffn_down_exps` en `IQ3_XXS` (3,06 bpw). Solo las proyecciones redundantes de gating/up se comprimen a 2 bits, guiadas por la imatrix oficial.

El autor declara que el proceso se realizó con clústeres de cómputo en la nube financiados de su propio bolsillo, e incluye verificación empírica de fidelidad mediante perplejidad WikiText-2 y ARC-Challenge. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO en el modelo base dentro de la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas.
- Razonamiento explícito (modo thinking) y razonamiento multi-paso.
- Generación y edición de código, con soporte para tareas tipo SWE-bench.
- Capacidades agénticas: tool calling, function calling y ejecución de flujos multi-paso.
- Procesamiento multimodal image-text-to-text mediante proyector de visión integrado.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Compatibilidad con endpoints tipo OpenAI a través de servidores llama.cpp.
- Plantilla de chat endurecida para uso agéntico y control del esfuerzo de razonamiento.

## Casos de uso

- Asistente de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de parches y generación de tests, aprovechando su soporte de tool calling y su entrenamiento orientado a SWE-bench, con un footprint de 13 GB que cabe en un runner con GPU de 16 GB.
- Agente autónomo de resolución de incidencias: la combinación de razonamiento multi-paso, MTP y plantilla agéntica permite encadenar llamadas a herramientas y mantener estado entre pasos sin salir de la ventana de contexto del servidor local.
- Atención al cliente multilingüe: al cubrir 13 idiomas (incluido español, catalán no listado, pero sí fr/de/pt/it/ru/ja/ko/vi/th/ar), puede gestionar conversaciones multi-turno en centros de soporte con requisitos de soberanía de datos, ejecutándose on-premise.
- Análisis de documentos con imagen: al ser image-text-to-text, permite extraer información de capturas, diagramas y formularios escaneados en flujos de back-office, con el proyector de visión cargado vía `llama-cli` o servidor compatible.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: gracias a los 12,14 GiB de huella en memoria, es viable en RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 o GPUs de portátil con 16 GB, manteniendo contexto amplio en VRAM según el autor.
- Streaming desde RAM del sistema: para equipos sin GPU dedicada suficiente, el diseño permite inferencia completa o parcial en RAM DDR4/DDR5, útil en laboratorios y entornos educativos con hardware heterogéneo.
- Evaluación de investigación en cuantización: sirve como referencia reproducible para estudiar el impacto de la compresión selectiva de tensores en modelos MoE, con métricas publicadas de perplejidad y ARC-Challenge.

## Benchmarks y rendimiento

| Modelo / cuantización | Tamano disco | Huella RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Tier de calidad |
|---|---|---|---|---|---|
| BF16 sin cuantizar (base) | ~71,05 GB | ~66,18 GiB | 16,00 | ~5,32 | Referencia completa |
| APEX-I-MiniPlus V2.1 | 15,23 GB | 14,18 GiB | 3,43 | 5,3693 ± 0,12528 (+0,93%) | Q5_K_L (rozando Q6_K) |
| APEX-I-NanoPlus (esta ficha) | 13,03 GB | 12,14 GiB | 2,93 | 5,5244 ± 0,12916 (+3,84%) | Q4_K_M / Q4_K_L |
| IQ2_S comunitario genérico | ~12,2 GB | ~11,4 GiB | 2,56 | > 5,85 (degradado) | Inestable / picos de sintaxis |

ARC-Challenge (0-shot, 1.172 preguntas): aproximadamente 95,75% para APEX-I-NanoPlus.

## Requisitos de hardware

- VRAM estimada: 12,14 GiB de huella en memoria; el archivo en disco ocupa 13,03 GB. Con contexto amplio y caché KV, se recomienda planificar 14-16 GB de VRAM para uso cómodo.
- GPU recomendadas: RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4080 Super 16 GB, RTX 4090 24 GB, RTX 5090, A100 40/80 GB, H100.
- Cabe en GPU consumer de 16 GB y superiores; en GPUs de 12 GB requerirá offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-cli` con proyector de visión, `llama-server` con API compatible OpenAI), y cualquier frontend que consuma GGUF vía llama.cpp. No se menciona soporte nativo en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible de forma numérica; el autor indica que dependen del procesador, el ancho de banda de memoria y la configuración DDR4/DDR5 en inferencia por RAM, y publica una sección de benchmarks de throughput con offload para RTX 30/40/50 sin cifras en el extracto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5 B totales | no disponible | Apache 2.0 | safetensors | Referencia BF16, ~71 GB |
| APEX-I-MiniPlus V2.1 (misma familia) | 35,5 B totales | no disponible | Apache 2.0 | GGUF | 15,23 GB, 3,43 BPW, perplejidad 5,3693 |
| APEX-I-NanoPlus (esta ficha) | 35,5 B totales | no disponible | Apache 2.0 | GGUF | 13,03 GB, 2,93 BPW, perplejidad 5,5244 |
| IQ2_S comunitario genérico | 35,5 B totales | no disponible | Apache 2.0 | GGUF | ~12,2 GB, 2,56 BPW, perplejidad >5,85, inestable |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría (por ejemplo, otros MoE de ~35 B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,93 BPW introduce una degradación medible: +3,84% de perplejidad frente al BF16, aceptable para generación general pero no para tareas que exijan máxima fidelidad numérica o de código crítico.
- El autor advierte de que las cuantizaciones sub-3-bit genéricas provocan picos de perplejidad, errores de sintaxis y corchetes de código roto; aunque esta versión mitiga el problema con asignación selectiva, persiste riesgo en generación de código complejo.
- Riesgo de alucinación inherente a los modelos de razonamiento; no se publican tasas de alucinación específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; los 13 idiomas listados no incluyen variantes regionales ni lenguas minoritarias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre la cuantización.
- El autor incluye un aviso crítico sobre sintaxis de código y repeat penalty para evitar el intercambio de caracteres; es necesario ajustar los parámetros de generación recomendados por Qwen para evitar degradación.
- El despliegue en RAM del sistema puede degradar sustancialmente el throughput según el ancho de banda de memoria; no se publican cifras de latencia en el extracto disponible.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión de mayor precisión APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
