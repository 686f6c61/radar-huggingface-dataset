# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4

## Resumen

Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4 es una release de servicio en formato NVFP4 (FP4 microscaling nativo de NVIDIA Blackwell) del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. El modelo original y el merge GAIN son obra de DavidAU; Solstice-AI se encarga de la cuantizacion downstream y del empaquetado. Se distribuye con licencia Apache 2.0 y esta pensado para despliegue de alta throughput en silicio Blackwell (B200, GB200, RTX 5090) y, segun la model card, tambien Ada Lovelace (RTX 4090).

El checkpoint declara una ventana de contexto nativa de 262.144 tokens, cabezas de decodificacion especulativa Multi-Token Prediction (MTP) integradas y multimodalidad de vision espaciotemporal 3D mediante el proyector `mmproj-BF16.gguf`. La model card afirma una superioridad empirica en 9 de 9 disciplinas de evaluacion frente a Claude Opus 4.6 Max bajo el harness de Claude Code, con 61,7% en SWE-bench Pro y 735 en ARC-C. Estos resultados proceden exclusivamente de la documentacion del autor y no han sido verificados de forma independiente.

El modelo deriva de la familia Qwen 3.8 (tag `qwen3_5` en Hugging Face) con 26.895.998.464 parametros reales en safetensors segun los metadatos, un repo de 20,7 GB y 51.367 descargas acumuladas. La combinacion de atencion lineal hibrida, merge GAIN y abliteration de alineamiento (Project Heretic) lo orienta a cargas de trabajo agenticas, de codigo y de sistemas donde los rechazos corporativos interfieren.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen 3.8: 75% de capas con atencion lineal Gated Delta Recurrent Network (GDN, complejidad O(1)) y 25% con Grouped-Query Attention global; merge de pesos GAIN de DavidAU |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (262K) nativos |
| Tipos de cuantizacion | NVFP4 (FP4 microscaling de NVIDIA Blackwell, formato `compressed-tensors`), 8-bit; tambien se publican pesos GGUF y un proyector `mmproj-BF16.gguf` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4), GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de la familia Qwen 3.8 en el que aproximadamente tres cuartas partes de las capas emplean atencion lineal Gated Delta Recurrent Network con complejidad de memoria O(1), mientras que el resto mantiene atencion global con Grouped-Query Attention. Esta mezcla permite sostener ventanas de 262K tokens con un coste de memoria subcuadratico en la mayoria de capas. El merge de pesos del modelo base utiliza la tecnica GAIN (Guided Activation Interleaved Normalization) de DavidAU, que segun la model card combina pesos de razonamiento punta sin degradacion, y se le aplica Project Heretic, una abliteration de alineamiento que elimina los vectores de rechazo corporativos.

La release anade cuantizacion NVFP4 con factores de microscaling de dos niveles sobre Tensor Cores de cuarta generacion, lo que segun el autor duplica el throughput de computo frente a GEMM INT4 convencional manteniendo rango dinamico de coma flotante. Incorpora ademas cabezas de drafting especulativo MTP de doble flujo que generan dos tokens por pasada forward, con una aceleracion declarada de 1,72x a 2,20x. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO sobre el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo chain-of-thought (tags `cot`, `reasoning`).
- Codigo y ingenieria de software agentica: resolucion de problemas en tiempo real, depuracion de repositorios completos y flujos multiarchivo de horizonte largo.
- Control de sistemas operativos: escritorio (OSWorld-Verified) y autonomia en SO movil (AndroidWorld).
- Seguimiento de restricciones complejas en instrucciones (IFBench).
- Razonamiento cientifico de abstraccion frontier (ARC-C) y sentido comun basico (ARC-E).
- Multimodalidad image-text-to-text con vision espaciotemporal 3D mediante `mmproj-BF16.gguf` (esquemas arquitectonicos, UI de codigo y fotogramas de video).
- Decodificacion especulativa MTP integrada para acelerar la generacion.
- Multilingue limitado a ingles y chino.
- Ausencia de rechazos por alineamiento (uncensored), orientada a seguridad y desarrollo de sistemas.

## Casos de uso

- Ingenieria de software agentica en produccion: con 262K tokens de contexto y 61,7% declarado en SWE-bench Pro, el modelo puede recibir un repositorio completo, trazar dependencias entre modulos y emitir parches coherentes dentro de un pipeline de CI/CD con tool calling.
- Depuracion de repositorios completos: la ventana de 262K permite cargar arboles de codigo extensos junto con trazas de error y logs de compilacion para localizar la causa raiz sin trocear el contexto.
- Automatizacion de atencion al cliente multi-turno: conversaciones largas en ingles o chino con historial extenso caben en una sola ventana, reduciendo la perdida de contexto entre turnos.
- Agentes de control de escritorio y movil: los resultados declarados en OSWorld-Verified (84,3%) y AndroidWorld (81,9%) lo hacen adecuado para automatizar tareas de GUI, pruebas de regresion de interfaz y RPA sobre sistemas operativos.
- Analisis de documentacion tecnica multimodal: con el proyector de vision puede interpretar diagramas de arquitectura, capturas de interfaz y fotogramas de video junto al texto de especificaciones.
- Asistencia a investigacion cientifica: el rendimiento declarado en ARC-C (735) lo situa como candidato para tareas de abstraccion cientifica y resolucion de problemas de nivel frontier.
- Desarrollo de herramientas de seguridad ofensiva y defensiva: la abliteration elimina rechazos, lo que permite analisis de malware, red teaming y revision de codigo sensible sin bloqueos del modelo.
- Servicio de alta throughput en Blackwell: con NVFP4 y MTP, indicado para despliegues vLLM o SGLang donde el coste por token y la latencia son criticos.

## Benchmarks y rendimiento

Resultados declarados por el autor bajo el harness de Claude Code, contexto de 256K, temperature=1.0 y top_p=0.95. No verificados de forma independiente.

| Suite | Enfoque | Modelo (segun autor) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agentica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuracion de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de ordenador | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomia en SO movil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos multiarchivo de horizonte largo | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstraccion cientifica frontier | 735 (8-bit) / 719 (4-bit) | ~710-720 | Tier frontier |
| ARC-E (Easy) | Sentido comun basico | 882 | ~870 | Supera frontier cerrado |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 20,7 GB en NVFP4, por lo que la inferencia en 4 bits requiere del orden de 21-24 GB de VRAM incluyendo overhead de KV cache; la variante 8-bit aproximadamente duplica esa cifra.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX 5090) para NVFP4 nativo; Ada Lovelace (RTX 4090) para la variante 8-bit segun la model card.
- Cabe en GPU consumer: si, en RTX 5090 con NVFP4; en RTX 4090 con la variante 8-bit.
- Opciones de despliegue: vLLM (deteccion automatica de `compressed-tensors` desde `config.json`, sin flag `--quantization`), SGLang, llama.cpp/Ollama con los pesos GGUF y `mmproj-BF16.gguf` para vision.
- Latencia y throughput: no disponible de forma medida; el autor declara una aceleracion de 1,72x a 2,20x por las cabezas MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solstice-AI Qwen3.8-27B NVFP4 (este) | 26,9B | 262K | SWE-bench Pro 61,7%; ARC-C 735 | Apache 2.0 | Hugging Face, safetensors NVFP4 y GGUF |
| DavidAU Qwen3.8-27B Cold Fusion (base) | 26,9B | 262K | Mismos resultados del merge, sin cuantizacion NVFP4 | Apache 2.0 | Hugging Face |
| Claude Opus 4.6 Max | no disponible | no disponible | SWE-bench Pro 53,4% (referencia del autor) | Propietaria | API Anthropic |
| Alternativas open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks provienen unicamente de la model card del autor y no se han replicado de forma independiente; los margenes frente a Opus 4.6 deben tratarse como declaraciones, no como hechos verificados.
- La abliteration de alineamiento (Project Heretic) elimina los rechazos, lo que incrementa el riesgo de generar contenido danino, codigo malicioso o afirmaciones inseguras; no es apto para despliegues orientados al publico sin filtros externos.
- Riesgo de alucinacion no cuantificado en la informacion disponible, especialmente en tareas de horizonte largo con contexto de 262K.
- Cobertura multilingue limitada a ingles y chino; el castellano no figura entre los idiomas declarados.
- La cuantizacion NVFP4 introduce perdida de precision frente a los pesos originales; el propio autor reporta 719 frente a 735 en ARC-C en la variante 4-bit.
- El formato NVFP4 depende de Tensor Cores Blackwell; en hardware anterior sera necesario recurrir a los pesos GGUF o 8-bit.
- La licencia Apache 2.0 permite uso comercial, pero la cadena de derivacion (Qwen 3.8, merge GAIN, abliteration) conviene revisarse antes de produccion.
- El pipeline declarado es image-text-to-text, pero la vision requiere el proyector `mmproj-BF16.gguf` adicional; sin el, el modelo funciona solo como texto.

## Enlaces

- Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Organizacion Solstice-AI: https://huggingface.co/Solstice-AI
- Perfil del autor original DavidAU: https://huggingface.co/DavidAU
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- Paper de referencia sobre atencion lineal GDN y arquitecturas hibridas: no disponible en la informacion proporcionada
- Repositorio de Project Heretic: no disponible en la informacion proporcionada
