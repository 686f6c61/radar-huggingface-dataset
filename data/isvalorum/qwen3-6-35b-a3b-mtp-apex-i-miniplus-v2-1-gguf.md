# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.6-35B-A3B-MTP APEX-I-MiniPlus-V2.1 GGUF es una cuantización personalizada del modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y capacidades multimodales (image-text-to-text). La release la firma IsValorum, que distribuye una configuración tensorial artesanal bajo la etiqueta APEX-I-MiniPlus, orientada a mantener la fidelidad del modelo original dentro de un sobre de 14-15 GB.

El modelo base pertenece a la familia Qwen3.6 (arquitectura qwen3_5_moe) e incorpora un bloque MTP (multi-token prediction) que habilita decodificación especulativa, además de razonamiento, código, capacidades agénticas y visión. La cuantización emplea una asignación por tensor: routers en F32/BF16 sin comprimir, expertos compartidos en Q5_K, atención en Q4_K y cabeza de salida en Q6_K, con un tamaño de archivo de 15,23 GB y 3,43 BPW.

Su relevancia práctica radica en que, según el autor, permite ejecutar el contexto completo de 256K en estaciones de trabajo de 24 GB de VRAM, algo poco habitual en modelos de este tamaño. La licencia Apache 2.0 del modelo base facilita el uso comercial, y el repo acumula 3462 descargas desde su publicación en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con bloque MTP para decodificación especulativa |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (según model card) |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1 (3,43 BPW); mezcla por tensor: F32, BF16, Q5_K, Q4_K, Q6_K |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano de archivo | 15,23 GB en disco; 14,18 GiB de huella en RAM/VRAM |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Capa de vision | mmproj companion (según model card) |
| Repo | 19,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas y 256 micro-expertos, según la descripción del autor. La release cuantizada conserva la estructura de routing del original: los 80 tensores `gate_inp`/`gate_inp_shexp` del modelo principal se mantienen en F32 sin comprimir y los dos routers MTP integrados en `blk.40` se retienen en BF16. Los 120 tensores de expertos compartidos (`shexp`) de las 40 capas se ejecutan en Q5_K sin comprimir, la atención cuadrática completa va en Q4_K y la cabeza de salida en Q6_K.

El bloque MTP (multi-token prediction) habilita decodificación especulativa, lo que reduce la latencia de generación al permitir que un cabezal borrador proponga varios tokens por paso. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base aplicó RLHF o DPO; esos datos no están disponibles en la información proporcionada. La cuantización se realizó con Unsloth Studio e imatrix, según los tags del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento explícito y modos de pensamiento (tags `reasoning`).
- Generación de código y tareas de ingeniería de software (tags `coding`, `swe-bench`).
- Capacidades agénticas y razonamiento multi-paso (tag `agentic`).
- Tool calling / function calling (compatible con endpoints, según tags).
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text, tag `vision`).
- Decodificación especulativa mediante bloque MTP integrado.
- Soporte multilingüe en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.

## Casos de uso

- Asistencia de código en producción: con soporte de tool calling y capacidades agénticas, el modelo puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y corrección de errores, aprovechando el contexto largo para analizar repositorios completos.
- Agentes autónomos de investigación: el bloque MTP y el modo de razonamiento permiten cadenas multi-paso con planificación y uso de herramientas, adecuado para orquestación de tareas complejas en local.
- Análisis de documentos extensos con imagen: la ventana de 256K y la capa de visión permiten procesar informes, capturas y tablas en una sola pasada sin truncar.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo que mantienen el hilo de la conversación y consultan herramientas internas vía function calling.
- Despliegue en estaciones de trabajo de 24 GB: el autor afirma que el contexto completo de 256K cabe en VRAM en GPUs de 24 GB, lo que habilita asistentes locales con privacidad de datos.
- Red-teaming y pruebas de seguridad: existe una edición hermana Abliterated con rechazos eliminados, orientada a pentesting y generación sin restricciones.
- Prototipado multimodal en investigación: evaluación de modelos MoE con visión en entornos con recursos limitados, usando llama.cpp u Ollama.

## Benchmarks y rendimiento

| Metrica | BF16 base | APEX-I-MiniPlus V2.1 | APEX-I-NanoPlus |
|---|---|---|---|
| Tamano en disco | 71,05 GB | 15,23 GB | 13,03 GB |
| Huella RAM/VRAM | 66,18 GiB | 14,18 GiB | 12,14 GiB |
| BPW medio | 16,00 | 3,43 | 2,93 |
| Perplejidad WikiText-2 | aprox. 5,32 (referencia) | 5,3693 ± 0,12528 (Δ +0,0493 / +0,93%) | 5,5244 ± 0,12916 (Δ +0,2044 / +3,84%) |
| Calidad equivalente | línea base completa | Tier Q5_K_L (rozando Q6_K) | Tier Q4_K_M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible; solo se aportan métricas de perplejidad y de rendimiento de hardware.

## Requisitos de hardware

- VRAM estimada: 14,18 GiB de huella para el modelo cuantizado; el autor afirma que el contexto completo de 256K cabe en 24 GB de VRAM.
- GPUs recomendadas: el autor publica benchmarks de throughput para RTX 30, RTX 40 y RTX 50, además de streaming por RAM; no se detallan cifras concretas en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con streaming parcial y en 24 GB para contexto completo, según el autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, endpoints compatibles; requiere el archivo mmproj companion para visión.
- Latencia y throughput: no disponibles en la información proporcionada; el bloque MTP reduce la latencia mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B APEX-I-MiniPlus V2.1 | 35,5 B (MoE) | 256K | GGUF 15,23 GB | Apache 2.0 | Cuantización artesanal, PPL 5,3693 |
| Qwen3.6-35B-A3B APEX-I-NanoPlus | 35,5 B (MoE) | 256K | GGUF 13,03 GB | Apache 2.0 | Variante más agresiva, PPL 5,5244 |
| Qwen3.6-35B-A3B APEX-I-MiniPlus V2.1 Abliterated | 35,5 B (MoE) | 256K | GGUF 14,66 GB | Apache 2.0 | Sin rechazos, PPL 5,4595, incluye MTP Q8_0 y mmproj |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,5 B (MoE) | 256K | safetensors 71,05 GB | Apache 2.0 | Referencia sin cuantizar |

No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: +0,93% de perplejidad frente a BF16, con riesgo de errores de sintaxis y corchetes en código si se usan penalizaciones de repetición inadecuadas (el autor publica un aviso específico al respecto).
- El autor advierte de no confundir esta build con releases genéricas APEX-I-Mini de la comunidad, que comprimen expertos a IQ2_S y pueden provocar picos de perplejidad y fallos de formato.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de los componentes de visión.
- El soporte de 256K en 24 GB depende de la configuración de offload y de la versión de llama.cpp; no está garantizado en todos los entornos.
- La edición estándar incluye rechazos; para flujos sin restricciones existe la edición Abliterated, con los riesgos asociados.
- No se han publicado benchmarks estándar que permitan validar las afirmaciones de calidad más allá de la perplejidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Edición NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Edición Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
