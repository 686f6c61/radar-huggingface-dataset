# cc1244578151/Qwen3.8-Flash-Next-Gyro-GGUF-TQ1

## Resumen

Qwen3.8-Flash-Next Gyro es una cuantización GGUF agresiva del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario cc1244578151 bajo la marca AgentionAI. El objetivo declarado es comprimir un modelo MoE de aproximadamente 177.000 millones de parámetros totales (125B según la model card) hasta que quepa en tarjetas de consumo de 32 GB, manteniendo una calidad cercana a cuantizaciones de 4 bits que ocupan el doble de memoria. La familia se distribuye en tres tamaños (Gyro-S, Gyro-M y Gyro-L) con pesos de 27,64 GiB, 34,98 GiB y 50,21 GiB respectivamente.

La innovación técnica principal es el uso de una base rotada para los expertos enrutados (Agention Precision Rotor, APR) junto con tipos de cuantización trellis propios (TQK6/TQK7, TQ2_T, TQP5-7) que no son compatibles con llama.cpp upstream. Esto implica que el modelo solo se puede ejecutar con motores específicos: Strata 0.2.0 o superior, el fork halo-box/strix-llama.cpp o el fork agentionai/llama.cpp. Es, por tanto, un artefacto experimental y de nicho, orientado a usuarios con hardware concreto (RTX 5090, R9700, Strix Halo) y dispuestos a usar toolchains no estándar.

El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card se centra casi exclusivamente en rendimiento de decodificación, calidad de cuantización y razonamiento de código. La licencia es qwen-community-1.0, lo que impone restricciones de uso comercial que conviene revisar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, según model card "125B MoE"; pesos con expertos enrutados en base rotada (APR) |
| Parametros totales | 176.943.899.520 (dato real de safetensors); la model card indica "125B MoE" |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128k tokens (28,8 GiB a 64k para Gyro-S) |
| Tipos de cuantizacion | TQ1_0, TQ2_0, TQ3_0 (clases de tamaño en el Hub); expertos en tipos trellis TQK6/TQK7, TQ2_T, TQP5-7; también variantes "-noPLE" sin tabla n-gram |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamaño del repo | 412,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de aproximadamente 177.000 millones de parámetros totales según los safetensors, aunque la model card lo describe como "125B MoE". No se dispone de información sobre el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta la innovación arquitectónica del modelo original más allá de su naturaleza MoE.

La aportación técnica de esta ficha es el esquema de cuantización. Los expertos enrutados se almacenan en una base rotada mediante el códec propietario Agention Precision Rotor (APR), y los tipos de cuantización trellis empleados (TQK6/TQK7, TQ2_T, TQP5-7) no son cargables por llama.cpp upstream. La model card menciona además soporte de MTP (Multi-Token Prediction) como draft para decodificación especulativa en el fork agentionai/llama.cpp, con 218 tok/s frente a 221 tok/s sin él en una RTX 5090. Se reporta también una tabla n-gram (PLE) incluida en los ficheros principales, con variantes "-noPLE" de menor tamaño.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text (capacidad multimodal heredada del modelo base, sin detalles adicionales en la model card).
- Razonamiento de código: la model card reporta 30/30 problemas de LiveCodeBench v6 resueltos por Gyro-M con 128k tokens de margen y 90% con límite de 64k.
- Razonamiento de largo alcance: se documentan pruebas de "long reasoning" con hasta 45 ejecuciones de estrés sin bucles de generación en las versiones actualizadas de Gyro-S y Gyro-M.
- Decodificación especulativa mediante MTP draft en el fork agentionai/llama.cpp.
- Soporte de contexto largo: hasta 128k tokens, con 28,8 GiB de VRAM a 64k en Gyro-S.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: la etiqueta "agentionai" sugiere orientación a agentes, pero no se documentan detalles.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en una RTX 5090 de 32 GB: usar Gyro-S (27,64 GiB de pesos) permite mantener el modelo completamente residente en VRAM y obtener 221 tok/s en decodificación, algo inviable con cuantizaciones de 4 bits del mismo modelo base.
- Asistencia de código en estación de trabajo con 48 GB: Gyro-M (34,98 GiB) ofrece un KLD de 0,291 y resuelve 30/30 problemas de LiveCodeBench con 128k de contexto, adecuado para tareas de generación y revisión de código en local.
- Razonamiento de largo alcance sin bucles: los resultados de loop stress test (0 bucles en 45 ejecuciones) hacen a Gyro-S y Gyro-M adecuados para pipelines de razonamiento extendido donde cuantizaciones de 2 bits convencionales fallan.
- Despliegue en AMD Strix Halo con memoria unificada de 64 GB o más: Gyro-L (50,21 GiB, KLD 0,146) se ejecuta mediante halo-box/strix-llama.cpp o Strata, ofreciendo calidad cercana a 4 bits en hardware integrado.
- Servicio de chat multimodal experimental: el pipeline image-text-to-text permite procesar entradas de imagen y texto, aunque la model card no detalla el rendimiento en tareas de visión.
- Evaluación comparativa de esquemas de cuantización: investigadores pueden usar los datos de KLD y top-1 publicados para comparar APR/trellis frente a EXL3, IQ2_XS, IQ3_XXS o Q4_K_M en el mismo hardware.
- Prototipado de agentes con contexto largo: la ventana de 128k y el soporte de decodificación especulativa permiten construir bucles de agente con historial extenso en una sola GPU de consumo.

## Benchmarks y rendimiento

| Metrica | Gyro-S | Gyro-M | Gyro-L | Referencia |
|---|---:|---:|---:|---|
| VRAM pesos (GiB) | 27,64 | 34,98 | 50,21 | AP-Q4_K_XL: 67,38 |
| KLD (menor mejor) | 0,401 | 0,291 | 0,146 | AP-Q4_K_XL: 0,107 |
| Top-1 (mayor mejor) | 75,29% | 78,75% | 83,87% | AP-Q4_K_XL: 85,52% |
| MMLU-Pro | 78,1 | 80,0 | no disponible | AP-Q4_K_XL: 81,4 |
| LiveCodeBench v6 (64k) | 67% | 90% | no disponible | — |
| LiveCodeBench v6 (128k) | 83% | 30/30 | no disponible | — |
| KLD en código | 0,109 | 0,066 | 0,026 | EXL3 3.18 bpw: 0,028 |
| Decodificación (tok/s, Strix Halo) | 35,2 | 29,5 | 28,4 | EXL3: 20,8–23,2 |

Comparativas adicionales reportadas: ISTA-DASLab GSQ-RCO IQ2_XS (36,52 GiB, KLD 0,420), IQ3_XXS (43,80 GiB, KLD 0,311), unsloth UD-Q2_K_XL (46,63 GiB, KLD 0,334) y AtomicChat AD-4.27bpw Q4_K_M (52,26 GiB, KLD 0,228). En una RTX 5090, Gyro-S alcanza 221 tok/s (218 tok/s con MTP draft). El prefill se sitúa en torno a 600–700 tok/s en Strix Halo.

## Requisitos de hardware

- VRAM de pesos: 27,64 GiB (Gyro-S), 34,98 GiB (Gyro-M), 50,21 GiB (Gyro-L); a 64k de contexto, Gyro-S requiere 28,8 GiB.
- GPU recomendadas: RTX 5090 (32 GB) para Gyro-S; una tarjeta de 48 GB o 2×24 GB para Gyro-M; 64 GB unificados (Strix Halo) para Gyro-L.
- AMD: RX 7000, RX 9000 y R9700 mediante Strata; Strix Halo mediante halo-box/strix-llama.cpp.
- Cabe en GPU de consumo: sí, Gyro-S en RTX 5090 o R9700; existe además Gyro-Coder (19,92 GiB) para tarjetas de 24 GB orientado a código.
- Opciones de despliegue: Strata 0.2.0+, halo-box/strix-llama.cpp (master), agentionai/llama.cpp (CPU, Vulkan, CUDA) y su contenedor. llama.cpp upstream no puede cargar estos ficheros.
- Throughput: 221 tok/s en RTX 5090 con Gyro-S; 35,2 / 29,5 / 28,4 tok/s en Strix Halo para S / M / L; prefill ~600–700 tok/s.
- Existe una variante "-noPLE" más pequeña que elimina la tabla n-gram.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gyro-S | ~177B (MoE) | 128k | 27,64 GiB | 0,401 | qwen-community-1.0 | GGUF, motores propios |
| EXL3 1.66 bpw (turboderp) | mismo base | no disponible | 26,52 GiB | 0,443 | qwen-community-1.0 | EXL3 |
| ISTA-DASLab IQ2_XS | mismo base | no disponible | 36,52 GiB | 0,420 | qwen-community-1.0 | GGUF estándar |
| unsloth UD-Q2_K_XL | mismo base | no disponible | 46,63 GiB | 0,334 | qwen-community-1.0 | GGUF estándar |
| ggml-org IQ4_NL | mismo base | no disponible | 68,21 GiB | 0,200 | qwen-community-1.0 | GGUF estándar |
| Agention AP-Q4_K_XL | mismo base | no disponible | 67,38 GiB | 0,107 | qwen-community-1.0 | GGUF, motores propios |

Gyro se sitúa ligeramente por delante de EXL3 en S y M y en código, y ligeramente por detrás en texto general en L. La ventaja principal es la relación calidad/memoria y la velocidad de decodificación (1,3–1,6× frente a EXL3 en el mismo build).

## Limitaciones y advertencias

- No es compatible con llama.cpp upstream: requiere Strata, halo-box/strix-llama.cpp o agentionai/llama.cpp, lo que limita la portabilidad y el soporte de la comunidad.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de los resultados reportados.
- Los benchmarks de MMLU-Pro y LiveCodeBench se basan en muestras pequeñas (70 preguntas, 30 problemas, una semilla) y el propio autor los califica como "dentro del ruido".
- Riesgo de bucles en razonamiento largo: aunque las versiones actualizadas reportan 0 bucles en pruebas de estrés, versiones previas y cuantizaciones de 2 bits comparadas mostraron bucles (hasta 7/10 en IQ2_XS).
- Licencia qwen-community-1.0: revisar las restricciones de uso comercial antes de desplegar en producción.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Capacidades multimodales declaradas por el pipeline pero sin evaluación publicada.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; aplican los del modelo base.
- El tamaño del repo (412,4 GB) implica descargas muy pesadas y almacenamiento considerable.
- La discrepancia entre "125B MoE" en la model card y 176.943.899.520 parámetros en safetensors debe tenerse en cuenta al planificar hardware.

## Enlaces

- Hugging Face: https://huggingface.co/cc1244578151/Qwen3.8-Flash-Next-Gyro-GGUF-TQ1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Coder: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variante abliterated: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Motor Strata: https://github.com/Niko1221/Strata
- Fork strix-llama.cpp: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Cuantizaciones EXL3 de referencia: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
