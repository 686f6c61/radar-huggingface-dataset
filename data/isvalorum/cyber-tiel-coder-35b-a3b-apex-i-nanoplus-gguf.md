# IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B APEX-I-NanoPlus es una cuantización GGUF de tipo "surgical" (tensor a tensor) del modelo peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B, un Mixture-of-Experts (MoE) de 34.660.610.688 parámetros totales con aproximadamente 3B activos por token, derivado de la familia Qwen3.5-MoE (etiquetado como qwen3.6 / qwen35moe en los tags). El trabajo de cuantización lo firma IsValorum, que publica la variante APEX-I-NanoPlus con un peso en disco de 12,55 GB (11,69 GiB) y unos 2,90 BPW, pensada para ejecutarse en GPUs de consumo de 12-16 GB con streaming parcial a RAM del sistema.

El modelo base está orientado a programación agéntica (agentic coding), con soporte multimodal imagen-texto (pipeline image-text-to-text), modo de razonamiento y una plantilla de chat endurecida para flujos de agente con esfuerzo de razonamiento configurable. La ficha del autor lo describe como un modelo "abliterated / uncensored", es decir, con los mecanismos de rechazo atenuados, lo que tiene implicaciones directas para su uso en producción.

Su relevancia actual radica en la relación entre tamaño efectivo y huella de memoria: un MoE de 35B con solo ~3B activos permite velocidad de decodificación propia de un modelo pequeño, mientras que la calidad de representación se acerca a la de un modelo denso de mayor tamaño. La cuantización APEX-I-NanoPlus intenta preservar routers en F32 y la cabeza de salida en Q6_K para evitar la degradación típica de los cuantizados sub-3-bit genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse Mixture-of-Experts), familia Qwen3.5-MoE / qwen3.6 según tags; 40 capas de backbone |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | ~3B por token (denominación A3B); no se detalla el número exacto en la información disponible |
| Longitud de contexto | no disponible (la model card menciona "massive context" sin cifra concreta) |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (~2,90 BPW); release hermano APEX-I-MiniPlus V2.1 (3,43 BPW); routers F32 y cabeza de salida Q6_K; companion files mmproj-Q8_0.gguf y mtp-Cyber-Tiel-Coder-35B-A3B.gguf |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); base en safetensors disponible en el repo del modelo original |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de atención estándar y capas MoE dispersas: de los 34,66B parámetros totales solo ~3B se activan por token, lo que reduce el coste computacional de inferencia a niveles de un modelo denso pequeño. La información disponible indica 40 capas de backbone y la presencia de un módulo MTP (multi-token prediction), distribuido como archivo companion separado (`mtp-Cyber-Tiel-Coder-35B-A3B.gguf`), lo que sugiere decodificación especulativa o predicción multi-token como innovación de rendimiento. También se distribuye un proyector multimodal (`mmproj-Q8_0.gguf`) que habilita la entrada de imágenes.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o RL verificable. Los tags indican orientación a razonamiento ("reasoning"), código agéntico ("agentic-coding", "swe-bench") y eficiencia de tokens ("token-efficient"), pero no se aportan cifras de entrenamiento. La cuantización APEX-I-NanoPlus aplica una asignación quirúrgica de precisión por tensor: routers `gate_inp` en F32 sin comprimir y cabeza de salida en Q6_K, con el resto del backbone en precisiones mixtas que promedian ~2,90 BPW, con el objetivo declarado de eliminar la deriva de enrutamiento del MoE.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas (en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar).
- Razonamiento explícito con esfuerzo configurable mediante plantilla de chat ("reasoning effort").
- Programación y codificación agéntica: los tags apuntan a SWE-bench y flujos de agente sobre repositorios.
- Entrada multimodal imagen-texto mediante el proyector `mmproj-Q8_0.gguf` (pipeline image-text-to-text).
- Predicción multi-token (MTP) para acelerar la decodificación, distribuida como archivo separado.
- Eficiencia de tokens ("token-efficient"), orientada a reducir el consumo en tareas largas de agente.
- Comportamiento "abliterated / uncensored": menor tasa de rechazos ante peticiones que un modelo alineado rechazaría.
- Compatibilidad con endpoints OpenAI a través de `llama-server`.

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de 12-16 GB: el modelo cabe en 12,55 GB de disco y 11,69 GiB de memoria, por lo que puede ejecutarse íntegramente en una RTX 4070 Ti Super o RTX 4080 con contexto moderado, ofreciendo calidad de nivel Q4_K_M en un MoE de 35B.
- Agente de resolución de incidencias sobre repositorios: la orientación a SWE-bench y la plantilla de chat agéntica permiten encadenar lecturas de ficheros, ediciones y ejecución de tests en un bucle multi-paso, con la ventaja de que solo ~3B parámetros se activan por token y la latencia se mantiene baja.
- Revisión de código y generación de parches en pipelines de CI: integrado vía `llama-server` con API compatible con OpenAI, puede invocarse desde scripts de integración continua para sugerir correcciones o generar descripciones de pull requests.
- Análisis de capturas de pantalla y diagramas: gracias al proyector multimodal, puede recibir imágenes junto a texto, útil para explicar errores mostrados en pantalla o interpretar diagramas de arquitectura.
- Atención al cliente técnica multilingüe: con soporte para 13 idiomas y conversación multi-turno, puede desplegarse en entornos con streaming a RAM del sistema cuando la VRAM es insuficiente para el contexto completo.
- Prototipado de investigación sobre MoE y cuantización extrema: el modelo sirve como banco de pruebas para estudiar el impacto de cuantizaciones sub-3-bit con routers preservados, comparando frente a las variantes MiniPlus y a cuantizados comunitarios IQ2_S.
- Generación de documentación y código en entornos aislados sin conexión: al ser un GGUF ejecutable con llama.cpp, funciona en máquinas sin acceso a APIs externas, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Los datos publicados por el autor se limitan a perplejidad y una prueba de razonamiento; no hay resultados de SWE-bench, HumanEval ni MMLU en la información disponible.

| Metrica | APEX-I-NanoPlus | APEX-I-MiniPlus V2.1 | BF16 base | IQ2_S generico |
|---|---|---|---|---|
| Tamano en disco | 12,55 GB | 14,75 GB | ~71,05 GB | ~12,2 GB |
| Huella en memoria | 11,69 GiB | 13,74 GiB | ~66,18 GiB | ~11,4 GiB |
| BPW medio | ~2,90 | 3,43 | 16,00 | 2,56 |
| Perplejidad WikiText-2 | 8,2849 ± 0,23438 | 7,5124 ± 0,20729 | ~7,46 | > 8,10 (degradado) |
| Delta PPL vs BF16 | +0,8249 (+11,06%) | +0,0524 (+0,70%) | referencia | +0,64 o más |
| ARC-Challenge (0-shot, 1.172 preguntas) | ~95,69% | no disponible | no disponible | no disponible |

El autor advierte explícitamente que la perplejidad de WikiText-2 mide modelado de lenguaje y no establece rendimiento en SWE-bench. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 11,69 GiB para los pesos del modelo; añadir el proyector multimodal (`mmproj-Q8_0.gguf`) y la caché KV según la longitud de contexto.
- GPU recomendadas: RTX 4080 / 4090 (16-24 GB) para ejecución completa con contexto amplio; RTX 4070 Ti Super (16 GB) para contexto moderado; A100 o H100 si se busca mayor throughput o contextos muy largos.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB en adelante con contexto reducido, y en 16 GB con margen para caché KV. El autor menciona explícitamente "massive context on 16GB VRAM".
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI); el formato GGUF también es compatible con otros runners basados en llama.cpp, aunque la información no confirma integración específica con Ollama, vLLM o TGI.
- Streaming a RAM del sistema: el autor indica que el diseño soporta inferencia total o parcial con pesos en RAM del sistema, lo que permite ejecutarlo en equipos con menos VRAM a costa de latencia.
- Latencia y throughput: no disponibles. La activación de ~3B parámetros por token y el módulo MTP sugieren una decodificación notablemente más rápida que un denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B APEX-I-NanoPlus | 34,66B totales / ~3B activos | no disponible | MIT | GGUF (~2,90 BPW) | 12,55 GB; multimodal; abliterated |
| Cyber-Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | 34,66B totales / ~3B activos | no disponible | MIT | GGUF (3,43 BPW) | 14,75 GB; misma familia, mayor fidelidad (PPL 7,51) |
| Tiel-Coder-35B-A3B APEX-I-NanoPlus | 35B totales / ~3B activos | no disponible | no disponible | GGUF | ~12,55 GB; orientado a ingeniería de software a escala de repositorio |
| Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | 35B totales / ~3B activos | no disponible | no disponible | GGUF | ~13,0 GB; 2,93 BPW con calidad Q4 según el autor |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias; la comparación se limita a las variantes publicadas por el mismo autor.

## Limitaciones y advertencias

- Modelo "abliterated / uncensored": los mecanismos de rechazo están atenuados, por lo que puede producir contenido que un modelo alineado bloquearía. Requiere filtros propios si se despliega de cara al público.
- La perplejidad de WikiText-2 es un 11,06% superior a la del BF16; la degradación en tareas de código y razonamiento puede ser mayor que la sugerida por esa métrica.
- El autor advierte de un problema específico de sintaxis en generación de código y recomienda ajustar la penalización por repetición para evitar el intercambio de caracteres ("character swapping"). Es un caveat operativo relevante.
- No se publican cifras de SWE-bench ni de otros benchmarks de código, pese a la orientación del modelo; el rendimiento real en tareas agénticas no está verificado de forma independiente.
- Longitud de contexto no especificada: planificar el despliegue sin asumir una ventana concreta.
- El módulo MTP y el proyector multimodal se distribuyen como archivos separados; sin ellos se pierden la aceleración por predicción multi-token y la capacidad de visión.
- Cuantización sub-3-bit: aunque los routers se preservan en F32, el backbone en precisiones mixtas puede mostrar inestabilidad en tareas de razonamiento largo o generación de código extenso.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre los datos de entrenamiento del modelo base.
- El modelo base es una cuantización de otro GGUF (`peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP`), por lo que la trazabilidad hasta los pesos originales en safetensors no está documentada en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Variante APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Variante Tiel-Coder-35B-A3B APEX-I-NanoPlus: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Variante Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Variante Ornith 1.5 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Variante Occamy-1.0 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
