# esatapedico/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF es una familia de seis ficheros GGUF derivados del modelo Qwen3.8-27B en su variante "Cold Fusion" (ajuste GAIN + Unsloth) publicada por DavidAU. El modelo subyacente es un transformer denso híbrido de 27.320.698.112 parámetros que combina capas Gated DeltaNet (atención lineal) con capas de atención completa cada cuatro capas, incorpora una torre de visión nativa, una cabeza MTP (multi-token prediction) para decodificación especulativa y un contexto nativo de 262.144 tokens. El trabajo de este repositorio, firmado por el usuario esatapedico, se limita a la conversión numérica: parte del checkpoint NVFP4 de windowsxp811203 y construye una escalera de precisión sobre las cabezas (`lm_head`, `token_embd`, cabeza MTP), manteniendo un backbone NVFP4 de 448 tensores byte-idéntico en todas las variantes.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27B con contexto de 262K en GPUs de consumo de 16 GB mediante cuantización NVFP4 nativa (grupo de 16, escalas fp8-e4m3) y decodificación especulativa integrada, sin necesidad de un modelo drafter separado. Los seis ficheros van de 14,86 GB a 19,69 GB y comparten exactamente el mismo backbone, de modo que la elección entre ellos es una decisión puramente de VRAM frente a precisión de cabezas.

El modelo está orientado a generación de texto conversacional, con soporte multilingüe declarado y compatibilidad con endpoints. La licencia es Apache 2.0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las únicas métricas son de perplejidad y velocidad de decodificación medidas por el autor de la conversión en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + Gated Attention cada cuarta capa; torre de visión nativa; cabeza MTP integrada |
| Parámetros totales | 27.320.698.112 (27,32B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K nativo) |
| Tipos de cuantización | NVFP4 (grupo 16, escalas fp8-e4m3) en el backbone; cabezas en Q2_K, IQ4_XS, Q3_K, Q5_0, Q6_K, Q8_0 y BF16 según tier |
| Idiomas soportados | Inglés y multilingüe (sin lista cerrada de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (seis ficheros); checkpoint fuente en compressed-tensors NVFP4A16 |
| Tamaño del repositorio | 101,0 GB |
| Tensores del backbone | 448 tensores NVFP4 byte-idénticos en todos los tiers (verificados por SHA-256) |
| Hardware objetivo | Blackwell sm_120 (RTX 50xx); NVFP4 requiere soporte nativo de la arquitectura |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,32B parámetros con una arquitectura híbrida: la mayor parte de las capas emplea Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, mientras que cada cuarta capa utiliza atención completa (Gated Attention). Esta combinación busca reducir el coste de cómputo y memoria en contextos largos sin renunciar por completo a la atención cuadrática en puntos clave de la red. El contexto nativo es de 262.144 tokens y el modelo incluye una torre de visión (proyector multimodal) y una cabeza MTP para decodificación especulativa.

Sobre el entrenamiento del modelo original no se dispone de información en la documentación proporcionada: no se detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de ajuste "Cold Fusion" de DavidAU (GAIN + Unsloth) y la cadena de cuantización: el checkpoint de windowsxp811203 cuantiza todas las capas Linear a NVFP4 verdadero (grupo 16, escalas fp8-e4m3) y mantiene deliberadamente en BF16 la torre de visión, la ruta de atención lineal DeltaNet, `lm_head`, embeddings y la cabeza MTP. La conversión a GGUF normaliza el backbone del modelo de lenguaje a un bloque uniforme de 448 tensores NVFP4, dejando los 256 tensores NVFP4 originales intactos y byte-idénticos, y retipando la ruta DeltaNet de BF16 a NVFP4 una sola vez. Los vectores `ssm_alpha` permanecen en F32.

La innovación técnica destacable es la integración de la cabeza MTP en todos los ficheros, lo que habilita decodificación especulativa con `--spec-type draft-mtp` sin drafter externo. La torre de visión se conserva sin modificar: los 334 tensores del proyector son byte-idénticos a los del modelo base, y se empareja con el `mmproj-BF16.gguf` de DavidAU mediante `--mmproj`.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-27B (sin métricas publicadas en este repositorio).
- Generación de código: no se documentan evaluaciones específicas en la información disponible.
- Visión: soporte multimodal mediante la torre nativa, emparejando cualquier tier con `mmproj-BF16.gguf` y el flag `--mmproj`.
- Decodificación especulativa integrada: cabeza MTP incluida en los seis ficheros, activable con `--spec-type draft-mtp`.
- Multilingüe: declarado en los metadatos (inglés y multilingüe), sin listado explícito de idiomas.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en los metadatos del repositorio.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos dentro de la ventana de 262K tokens, útil para análisis de contratos, expedientes o bases de conocimiento sin fragmentación.
- Análisis de documentos con imágenes: combinando cualquier tier con `mmproj-BF16.gguf`, se pueden procesar capturas, diagramas o páginas escaneadas junto con texto en una misma sesión.
- Despliegue en estación de trabajo con GPU de consumo: los tiers VERY-LOW (14,86 GB) y LOW (15,53 GB) permiten ejecutar un modelo de 27B en GPUs de 16 GB, como las RTX 5070 Ti o 5060 Ti empleadas por el autor, con decodificación especulativa activa.
- Generación de texto a gran velocidad de prefill: con 1.830-1.864 tok/s en pp512, el modelo es adecuado para tareas donde el prompt domina el coste, como resumen de documentos largos o clasificación por lotes con contexto extenso.
- Investigación en cuantización: la escalera de seis tiers con backbone idéntico permite estudiar el impacto aislado de la precisión de `lm_head`, embeddings y cabeza MTP sobre la perplejidad (4,61-4,73) y la velocidad de decodificación (28,2-32,2 tok/s).
- Evaluación de decodificación especulativa MTP: sirve como banco de pruebas para medir la ganancia de la cabeza MTP integrada frente a decodificación autoregresiva estándar en llama.cpp.
- Prototipado multimodal local: al mantener la torre de visión en BF16, se puede validar pipelines de visión-lenguaje sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor de la conversión proporciona únicamente mediciones de perplejidad y velocidad en llama-bench (pp512/tg128), con ejecuciones únicas sobre doble GPU RTX 5070 Ti / 5060 Ti de 16 GB con reparto tensorial:

| Tier | Tamaño | PPL (source-diverse.txt) | pp512 tok/s | tg128 tok/s |
|---|---|---|---|---|
| VERY-LOW | 14,86 GB | 4,73 | 1844 | 32,2 |
| LOW | 15,53 GB | 4,65 | 1840 | 31,5 |
| MEDIUM | 16,38 GB | 4,65 | 1863 | 30,7 |
| MID-HIGH | 16,91 GB | 4,61 | 1830 | 30,5 |
| HIGH | 17,57 GB | 4,65 | 1856 | 28,2 |
| VERY-HIGH | 19,69 GB | 4,65 | 1864 | 28,2 |

La perplejidad se mantiene estable dentro de un margen del 2,6 % en toda la escalera, lo que indica que la cuantización de cabezas apenas afecta a la calidad medida. La velocidad de decodificación sí sigue la precisión de las cabezas: el tier VERY-LOW es un 14 % más rápido en tg128 que HIGH y VERY-HIGH.

## Requisitos de hardware

- VRAM estimada: entre 15 y 21 GB para los pesos según tier (14,86-19,69 GB), más overhead de contexto KV y buffers de llama.cpp. Con contexto de 262K completo, el consumo de KV puede ser muy superior al de los pesos.
- GPU recomendadas: arquitectura Blackwell sm_120 con soporte nativo de NVFP4, es decir, RTX 50xx (5070 Ti, 5080, 5090) y GPUs de datacenter Blackwell (B200). El autor valida con RTX 5070 Ti + RTX 5060 Ti de 16 GB en reparto tensorial.
- GPU de consumo: sí, los tiers VERY-LOW y LOW caben en 16 GB; MEDIUM y MID-HIGH quedan ajustados en 16 GB y requieren gestión cuidadosa del contexto; HIGH y VERY-HIGH necesitan más de 16 GB o reparto entre dos GPUs.
- Despliegue: llama.cpp (conversión y cuantización realizadas con `convert_hf_to_gguf.py` y `llama-quantize`), llama-bench para medición, y flags `--spec-type draft-mtp` y `--mmproj`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: prefill de 1.830-1.864 tok/s (pp512) y decodificación de 28,2-32,2 tok/s (tg128) en la configuración de doble GPU citada; no se proporcionan latencias en otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo frente a alternativas, por lo que la comparación se limita a características estructurales verificables. Las alternativas indicadas son el checkpoint NVFP4 original del que deriva y el modelo base sin cuantizar.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF (este) | 27,32B | 262K | GGUF, 6 tiers (14,86-19,69 GB) | Apache 2.0 | Hugging Face, 593 descargas |
| windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 | 27,32B | 262K | compressed-tensors NVFP4A16 | Apache 2.0 (heredada) | Hugging Face (checkpoint fuente) |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27,32B | 262K | safetensors (BF16) | Apache 2.0 (heredada) | Hugging Face (modelo original) |

No se dispone de información sobre modelos de otros autores con los que comparar parámetros, contexto, rendimiento y licencia de forma rigurosa.

## Limitaciones y advertencias

- Requiere hardware Blackwell sm_120 para aprovechar NVFP4 de forma nativa; en arquitecturas anteriores el soporte de NVFP4 en llama.cpp puede no estar disponible o degradar el rendimiento.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez para este ajuste ni para el modelo base en la documentación proporcionada.
- El contexto de 262K es nativo, pero el consumo de KV cache a esa longitud puede exceder la VRAM de GPUs de consumo; en la práctica el contexto útil será menor salvo en configuraciones de alta memoria.
- Los idiomas soportados se declaran como "inglés y multilingüe" sin lista cerrada; la calidad fuera del inglés no está verificada.
- Las mediciones de perplejidad y velocidad son ejecuciones únicas del autor de la conversión, no un benchmark reproducible con protocolo estándar; deben tomarse como orientativas.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la cadena de modelos base y ajustes intermedios; conviene verificar los términos de DavidAU y de windowsxp811203 antes de un despliegue en producción.
- El modelo es un ajuste comunitario ("Cold Fusion", GAIN + Unsloth) sobre Qwen3.8-27B, no una versión oficial de Qwen; el soporte y las garantías son las del publicador.
- No se documenta soporte de tool calling ni de flujos de agentes; no debe asumirse sin validación previa.
- El repositorio ocupa 101 GB, lo que implica descargas parciales selectivas por tier.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF
- Checkpoint NVFP4 fuente: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Proyector de visión `mmproj-BF16.gguf`: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Sitio del autor de la conversión: https://www.esatapedico.com
