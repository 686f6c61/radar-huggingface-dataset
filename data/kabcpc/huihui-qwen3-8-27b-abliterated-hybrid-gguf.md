# kabcpc/Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF

## Resumen

Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF es una cuantización híbrida de un modelo Qwen de 27.000 millones de parámetros, publicada por el usuario kabcpc. Parte de los pesos base de huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante "abliterated" (con el subespacio de rechazo eliminado en las capas 22 a 52) del modelo original. El resultado es un paquete GGUF de 6,86 GiB que comprime un modelo de 54 GB en FP16 hasta un tamaño que cabe holgadamente en los 16 GB de memoria unificada de un Mac Mini con Apple Silicon.

La innovación principal es la combinación de dos técnicas de cuantización: 348 capas se mantienen en PTQ1_0 (ternario de 1,75 bits por peso) con decodificación mediante tabla de consulta (LUT) en memoria constante de Metal, mientras que los 54 tensores afectados por la ablación (23 `ssm_out.weight` y 31 `ffn_down.weight`) se restauran a Q4_1 (5,0 bits por peso) para evitar la degradación que sufrían en cuantizaciones comunitarias previas con Q2_K y Q3_K. El autor reporta una perplejidad de 3,6742 y velocidades de generación de 16,4 a 16,5 tokens por segundo en hardware M-series.

El modelo está pensado para despliegue local en Apple Silicon con llama.cpp y Metal, con soporte de contexto largo (hasta 131.072 tokens con caché KV cuantizada), tool calling estructurado y compatibilidad con un proyector multimodal externo. La licencia Apache 2.0 y el carácter "uncensored" lo sitúan en un nicho muy concreto: usuarios que necesitan un modelo grande, sin filtros de rechazo, ejecutable en hardware de consumo con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (base Qwen 3.8 / 2.5), con capas SSM (state space model) y FFN; abliterated en capas 22-52 |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens (con caché KV q4_0); 32.768 tokens en el ejemplo de chat |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bpw, type 143) en 348 capas + Q4_1 (5,0 bpw, type 3) en 54 tensores; caché KV q4_0 |
| Idiomas soportados | en, zh, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Huihui-Qwen3.8-27B-Abliterated-Hybrid-PTQ1_0-Q4_1-LUT.gguf`, 6,86 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 26,9 mil millones de parámetros con arquitectura Qwen 3.8 / 2.5, que según la model card incluye capas de tipo SSM (`ssm_out.weight`) junto con capas FFN convencionales, lo que sugiere una arquitectura híbrida entre atención y modelos de espacio de estados. La variante abliterated elimina el subespacio de rechazo en las capas 22 a 52, lo que afecta a 54 tensores concretos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La contribución técnica de esta ficha es puramente de compresión. El autor aplica PTQ1_0 con una tabla de consulta (`constant ushort ptq1_0_lut[256]`) residente en memoria constante de Metal, de modo que los trits {-1, 0, +1} se decodifican sin ramificaciones en tiempo de ejecución. Los 54 tensores ablacionados se extraen en FP16 de los pesos donantes y se recuantizan a Q4_1 para evitar el ruido de las cuantizaciones Q2_K/Q3_K previas, que además provocaban fallback a CPU por falta de kernels Hadamard fusionados en Metal. Se preservan las 10 matrices de rotación Hadamard (`prism.hadamard.*`) que suprimen valores atípicos en las activaciones y hacen viable la representación ternaria sub-2-bit.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y ruso.
- Razonamiento y respuesta a prompts técnicos (el ejemplo de la model card es un ejercicio de explotación de buffer overflow en ensamblador).
- Tool calling / function calling con JSON estructurado; el autor reporta 100 % de cumplimiento de esquema sin bucles ni corrupción sintáctica.
- Capacidades multimodales (comprensión de imágenes) mediante compatibilidad con el proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`.
- Modo "uncensored": ausencia de rechazos por contenido en las capas ablacionadas (verificación reportada como 100 % PASS).
- Contexto largo de hasta 131.072 tokens con caché KV cuantizada en q4_0.
- Compatibilidad con endpoints OpenAI a través de `llama-server`.
- No se documentan capacidades de audio ni de decodificación especulativa.

## Casos de uso

- Asistente local en Mac Mini de 16 GB: el paquete de 6,86 GiB encaja en memoria unificada y permite ejecutar un modelo de 27 B sin GPU dedicada, con generación a 16,4-16,5 t/s.
- Análisis de documentos largos: con contexto de hasta 131.072 tokens y caché KV q4_0, se pueden procesar contratos, informes o bases de código extensas en una sola pasada.
- Automatización de agentes con tool calling: la integridad de JSON validada permite integrar el modelo en pipelines que invocan APIs externas, bases de datos o sistemas de ficheros mediante esquemas estrictos.
- Investigación en seguridad ofensiva y análisis de vulnerabilidades: el modo uncensored y la capacidad de razonar sobre código de bajo nivel (el ejemplo de la model card aborda exploits de buffer overflow) lo hacen adecuado para laboratorios de pentesting con fines educativos.
- Procesamiento multilingüe en inglés, chino y ruso: útil para equipos que trabajan con documentación técnica en estos tres idiomas sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones conversacionales: el servidor compatible con OpenAI (`llama-server` en el puerto 11434) permite sustituir una API remota por inferencia local sin cambiar el código cliente.
- Análisis de imágenes en local: combinado con el proyector mmproj, se puede usar para descripción de capturas, extracción de texto de imágenes o moderación visual en entornos sin conectividad.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor comparan su cuantización híbrida con la cuantización ternaria original de Hugging Face, no con otros modelos:

| Métrica | Ternario HF original | Híbrido PTQ1_0 + Q4_1 |
|---|---|---|
| Tamaño del GGUF | 6,15 GiB | 6,86 GiB |
| Capas ablacionadas | Q2_K / Q3_K degradadas | Q4_1 limpio (5,0 bpw) |
| Perplejidad (PPL) | > 12,0 (Q2_K roto) | 3,6742 |
| Ruta de kernel Metal | Fallback a CPU en Q2_K | 100 % Metal fusionado |
| Procesamiento de prompt (PP) | ~25,2 t/s | 63,3-65,9 t/s |
| Generación de tokens (TG) | ~7,2-8,0 t/s | 16,4-16,5 t/s |
| Verificación de abliteration | Inconsistente / rechazos | 100 % PASS |
| Integridad de tool calling | JSON malformado | 100 % PASS |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 6,86 GiB para los pesos; con contexto de 131.072 tokens y caché KV q4_0 se recomienda un mínimo de 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon M-series (el autor cita explícitamente Mac Mini de 16 GB); la decodificación LUT está optimizada para Metal.
- GPU NVIDIA: no se documenta soporte ni rendimiento; el diseño depende de memoria constante de Metal, por lo que en CUDA el rendimiento sería presumiblemente inferior y no está medido.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM si el backend soporta PTQ1_0; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), endpoints compatibles con OpenAI; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 16,4-16,5 t/s de generación y 63,3-65,9 t/s de procesamiento de prompt en M-series, con saturación de ~113 GB/s de ancho de banda de memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Abliterated-Hybrid (este) | 26,9 B | 131.072 | PTQ1_0 + Q4_1 híbrida | Apache 2.0 | GGUF, 6,86 GiB |
| Ternary-Bonsai-2-27B-gguf (prism-ml) | 27 B (presumible) | no disponible | Ternaria | no disponible en la información | GGUF |
| Huihui-Qwen3.8-27B-abliterated (base) | 26,9 B | no disponible | FP16 (54 GB) | Apache 2.0 | safetensors |
| Cuantización ternaria HF original | 27 B | no disponible | Ternaria Q2_K/Q3_K | Apache 2.0 | GGUF, 6,15 GiB |

La comparativa con modelos de la misma categoría (Qwen 27 B en otras cuantizaciones) no está disponible con datos de benchmarks; solo se dispone de la comparación interna de rendimiento entre la versión original y la híbrida.

## Limitaciones y advertencias

- El modelo es "abliterated" y "uncensored": no aplica filtros de rechazo, lo que puede producir contenido inapropiado, peligroso o ilegal sin advertencia. No es apto para aplicaciones de cara al público sin capas de moderación externas.
- La cuantización ternaria de 1,75 bits introduce pérdida de fidelidad frente al FP16 original; la perplejidad de 3,6742 no es directamente comparable con la del modelo sin cuantizar.
- Los benchmarks publicados son internos del autor y miden velocidad y perplejidad, no calidad en tareas (MMLU, HumanEval, etc.); no hay validación independiente.
- Solo se declaran idiomas en, zh y ru; el rendimiento en castellano no está verificado y probablemente sea inferior.
- El soporte multimodal depende de un proyector externo (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`) que no forma parte de este repositorio.
- El rendimiento está medido exclusivamente en Apple Silicon con Metal; en otras plataformas (CUDA, ROCm, CPU) no hay datos y el rendimiento puede degradarse notablemente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base y los pesos donantes pueden arrastrar condiciones adicionales; conviene verificar la licencia del modelo original de Qwen antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcpc/Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Fundación ternaria y proyector: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Motor de compresión y calibración: https://github.com/kabcnd/bansai-flint
