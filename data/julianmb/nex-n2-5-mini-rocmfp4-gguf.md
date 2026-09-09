# julianmb/Nex-N2.5-mini-ROCmFP4-GGUF

## Resumen

Nex-N2.5-mini-ROCmFP4-GGUF es una cuantización en formato GGUF del modelo Nex-N2.5-mini, desarrollado por Nex AGI, adaptada específicamente para GPUs AMD con arquitectura Strix Halo (gfx1151) y RDNA 3.5 por el autor julianmb. El modelo original es un sistema multimodal basado en la arquitectura Qwen3.5-35B-A3B, con 34.66 mil millones de parámetros totales y aproximadamente 3.0 mil millones de parámetros activos por token. Su principal innovación es un bucle de razonamiento adaptativo llamado Agentic Thinking, que unifica la comprensión de requisitos, la generación de código, el uso de herramientas y la ejecución de entornos en un único flujo agéntico.

Esta cuantización utiliza el formato ROCmFP4 (Q4_0_ROCMFP4_STRIX_LEAN) para aprovechar las instrucciones de matriz cooperativa de Mesa RADV y la memoria unificada de los APUs Strix Halo. El resultado es un archivo de 17.32 GiB con 4.29 bits por peso, que reduce el tamaño de descarga en un 12.1 % respecto a la cuantización Q4_K_M estándar y mejora la velocidad de decodificación hasta un 13.6 % en ROCm/HIP. Además, el modelo soporta una ventana de contexto de 262,144 tokens y capacidades multimodales de visión mediante un proyector GGUF separado (mmproj-F16).

Este modelo es relevante para desarrolladores que trabajan con hardware AMD de última generación y necesitan ejecutar agentes de IA con razonamiento extenso, generación de código y visión en entornos de edge computing o en estaciones de trabajo con APU, donde el ancho de banda de memoria unificada es un factor crítico.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen35MoE híbrido: 30 capas de Gated DeltaNet (atención lineal) + 10 capas de atención completa |
| Parámetros totales | 34.66 mil millones |
| Parámetros activos | ~3.0 mil millones por token (MoE) |
| Longitud de contexto | 262,144 tokens (256K) |
| Tipos de cuantización | Q4_0_ROCMFP4_STRIX_LEAN (ROCmFP4, 4.29 BPW); mmproj F16 para visión |
| Idiomas soportados | No disponible (etiquetado como inglés en fuentes secundarias) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantización ROCmFP4 para AMD Strix Halo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5-35B-A3B: una red de mezcla de expertos (MoE) con atención híbrida, donde 30 capas utilizan atención lineal con estado recurrente Gated DeltaNet y 10 capas se reservan para atención completa. Esta combinación reduce la carga de memoria y el acceso al bus en comparación con un transformer denso de tamaño equivalente, manteniendo al mismo tiempo la capacidad de razonamiento secuencial. En cada token solo se activa aproximadamente el 8.6 % de los parámetros (unos 3.0B).

La cuantización ROCmFP4 aplica una política de precisión mixta denominada STRIX_LEAN: los logits del enrutador y las normalizaciones se mantienen en FP32 para preservar la asignación de expertos, las embeddings se cuantizan en Q5_K y las matrices de atención en q4_0_rocmfp4, mientras que las redes de alimentación densas de los expertos se empaquetan en q4_0_rocmfp4_fast para maximizar el ancho de banda de memoria.

No se han publicado en la información disponible los detalles del dataset de entrenamiento, el número de tokens, ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y código, con capacidad de razonamiento multi-paso.
- Razonamiento agéntico adaptativo (Agentic Thinking): itera sobre tareas complejas combinando comprensión de requisitos, generación de código y ejecución de herramientas.
- Soporte de tool calling / function calling.
- Soporte de agentes y ejecución de entornos en flujos de trabajo automatizados.
- Capacidades multimodales de visión mediante un proyector GGUF separado (mmproj-F16).
- Modo de pensamiento (thinking mode) activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": true/false}`.
- Contexto largo de 256K tokens, adecuado para repositorios completos, historiales extensos o documentación técnica.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar código, explicar fragmentos y razonar sobre requisitos en un contexto largo, integrándose en extensiones de editor como agentes de autocompletado o chat.
- Agentes de ejecución en CI/CD: gracias a su soporte de tool calling, puede ejecutar comandos, interpretar la salida y iterar hasta completar tareas de compilación, prueba o despliegue en un entorno sandbox.
- Análisis multimodal de documentación técnica: el proyector de visión permite interpretar diagramas, capturas de pantalla o esquemas y combinarlos con instrucciones en lenguaje natural para generar código o documentación.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo (hasta 256K tokens), lo que permite mantener el historial completo de una incidencia y resolver problemas con seguimiento de requisitos.
- Automatización de investigación: razona sobre múltiples fuentes, extrae información y la sintetiza en informes ejecutables, aprovechando el modo de pensamiento para validar hipótesis antes de responder.
- Computación edge en AMD Strix Halo: el modelo está optimizado para APUs con memoria unificada, por lo que puede ejecutarse en portátiles o estaciones de trabajo compactas sin necesidad de una GPU discreta de gran VRAM.
- Bots de desarrollo de software con seguimiento de issues: analiza descripciones de problemas, genera parches y puede validarlos ejecutando pruebas mediante herramientas externas, todo dentro de un flujo agéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

La model card del autor incluye mediciones de rendimiento de inferencia en un sistema AMD Ryzen AI Max+ 395 (Radeon 8060S) con 40 CU y memoria unificada. Los valores se refieren a prefill en 512 tokens (pp512) y decodificación en 128 tokens (tg128):

| Configuración | Prefill (pp512) | Decode (tg128) | Tamaño | Variación vs Q4_K_M (decode) |
|---|---|---|---|---|
| ROCmFP4 Vulkan0 (RADV) | 642.37 tok/s | 76.92 tok/s | 17.32 GiB | +5.7 % |
| ROCmFP4 ROCm0 (HIP) | 1,028.18 tok/s | 68.62 tok/s | 17.32 GiB | +13.6 % |
| Q4_K_M Baseline (Vulkan0) | 1,083.91 tok/s | 72.76 tok/s | 19.71 GiB | Referencia |
| Q4_K_M Baseline (ROCm0) | 907.44 tok/s | 60.39 tok/s | 19.71 GiB | Referencia |

Estos datos son medidos por el autor en un hardware concreto y sirven como referencia de rendimiento relativo, no como indicador de calidad de respuesta.

## Requisitos de hardware

- VRAM estimada: el archivo principal ocupa 17.32 GiB, más 0.84 GiB del proyector de visión. Con la caché KV para una ventana de contexto moderada (por ejemplo, 32K tokens) se recomienda disponer de al menos 24 GiB de memoria total (VRAM o RAM unificada).
- GPU recomendada: AMD Strix Halo (gfx1151), Radeon 8060S o cualquier APU RDNA 3.5, con controladores ROCm (HIP) o Mesa RADV. El modelo se ha validado en un Ryzen AI Max+ 395 con 40 CU.
- En otros hardware: la cuantización ROCmFP4 está optimizada para AMD Strix Halo; en GPUs NVIDIA o en RDNA anteriores no se ha validado y puede no ser compatible o degradar el rendimiento.
- Sí cabe en GPUs de consumidor con 24 GiB (como RTX 4090) en términos de capacidad, pero el formato de cuantización es específico para AMD, por lo que la compatibilidad no está garantizada.
- Opciones de despliegue: `llama-server` de llama.cpp con `--mmproj` para multimodal, o `halofpx` (servidor especializado en ROCmFPX) con los comandos `halofpx pull` y `halofpx serve`.
- Latencia y throughput: según las mediciones del autor, la decodificación varía entre 68.62 tok/s en ROCm/HIP y 76.92 tok/s en Vulkan/RADV para el modelo ROCmFP4, mientras que el prefill oscila entre 642 tok/s y 1,028 tok/s.

## Comparativa con modelos similares

| Modelo / Cuantización | Parámetros | Contexto | Tamaño de descarga | Decode (ROCm0) | Licencia |
|---|---|---|---|---|---|
| Nex-N2.5-mini ROCmFP4 | 34.66B / 3.0B activos | 256K | 17.32 GiB | 68.62 tok/s | Apache 2.0 |
| Nex-N2.5-mini Q4_K_M | 34.66B / 3.0B activos | 256K | 19.71 GiB | 60.39 tok/s | Apache 2.0 |
| Nex-N2-mini ROCmFP4 (versión anterior) | No disponible | No disponible | No disponible | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible; sin embargo, al ser un modelo generativo, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base Qwen3.5.
- Riesgo de alucinaciones inherente a los modelos generativos de lenguaje, especialmente en tareas de razonamiento agéntico donde las herramientas pueden producir errores.
- La información sobre idiomas es limitada: algunas fuentes secundarias etiquetan el modelo como inglés, aunque la arquitectura base Qwen3.5 es multilingüe. No hay confirmación oficial de los idiomas soportados.
- La cuantización ROCmFP4 está diseñada específicamente para AMD Strix Halo y RDNA 3.5. Su uso en hardware de otros fabricantes o arquitecturas puede no funcionar o requerir compilación manual de kernels.
- El modo de pensamiento activado (`enable_thinking: true`) incrementa la latencia y el consumo de tokens; se recomienda desactivarlo en aplicaciones sensibles al tiempo de respuesta.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario debe revisar también la licencia del modelo base y la procedencia del dataset para cumplir con obligaciones de atribución y avisos de patentes.

## Enlaces

- https://huggingface.co/julianmb/Nex-N2.5-mini-ROCmFP4-GGUF
- https://huggingface.co/nex-agi/Nex-N2.5-mini
- https://huggingface.co/NandoG-AI/Nex-N2.5-mini-GGUF
- https://huggingface.co/plunderstruck/Nex-N2-mini-ROCmFP4-GGUF
