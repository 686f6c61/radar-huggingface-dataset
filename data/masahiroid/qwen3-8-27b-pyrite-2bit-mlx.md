# masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX

## Resumen

Qwen3.8-27B-Pyrite-2bit-MLX es una cuantización ultra-baja (2 bits con precisión mixta) del modelo Qwen3.8-27B de Qwen, creada por el usuario masahiroid mediante el pipeline "Project Pyrite", un método de cuantización consciente de la sensibilidad de activaciones y optimizado para texto multilingüe (inglés, japonés y chino). El objetivo del proyecto es resolver un problema concreto: ejecutar un modelo de 27B parámetros completo en un Mac de Apple Silicon con solo 16 GB de memoria unificada, algo inviable con pesos en BF16 (51,75 GiB).

El resultado comprime el modelo hasta 10,11 GiB (10.854.616.576 bytes exactos), manteniendo el mismo presupuesto de bytes que una cuantización uniforme a 2 bits, pero redistribuyendo esos bytes de forma inteligente: se amplía el tamaño de grupo en las proyecciones MLP menos sensibles y se invierte el espacio liberado en subir a 3 bits las 30 matrices más sensibles de las capas finales. Según los datos del autor, esto reduce la divergencia KL frente al modelo BF16 en un 22-27% sin coste adicional de memoria.

El modelo es relevante porque demuestra que la cuantización mixta a ~3 bits efectivos de media puede mantener una calidad razonable en hardware de consumo, y porque es 100% compatible con `mlx-lm` estándar, sin kernels personalizados ni forks parcheados, lo que facilita su despliegue inmediato en cualquier Mac con chip M1/M2/M3/M4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) + atencion completa + MLP SwiGLU (arquitectura `qwen3_5`) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no consta que sea MoE; aparentemente densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 2-bit (g128 y g64), 3-bit (g64), 4-bit (g64), BF16 y FP32 para normas y parametros SSM; ~2,97 bits efectivos de media |
| Idiomas soportados | Ingles, japones, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer de 64 capas con `hidden_size=5120` e `intermediate_size=17408` que combina tres tipos de bloques de atencion: 48 capas de atencion lineal Gated DeltaNet y 16 capas de atencion completa (self-attention), junto a MLP SwiGLU en todas las capas. El vocabulario tiene 248.320 tokens. Los detalles del preentrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion principal de esta version no esta en la arquitectura del modelo sino en su cuantizacion. El pipeline Pyrite realiza una asignacion de sensibilidad con presupuesto de bytes exactamente neutro: se amplia el tamaño de grupo de `gate_proj` y `up_proj` de 64 a 128 (de 2,50 a 2,25 bits efectivos) en las 64 capas, liberando exactamente 356.515.840 bytes (340 MiB) de metadatos de escala y bias. Esos bytes se reinvierten integramente para actualizar las 30 proyecciones MLP mas sensibles a outliers (22 `down_proj` de las capas L35-L36 y L44-L63, y 8 `gate/up_proj` de las capas L58-L63) a 3 bits con grupo 64 (3,50 bits efectivos). Ademas, los embeddings y `lm_head` se protegen a 4 bits para preservar el vocabulario multilingue, y las normas, la Conv1d (BF16) y el parametro `A_log` del SSM (FP32) no se cuantizan. No se trata de un entrenamiento nuevo sino de una compresion post-entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`), heredada del modelo base Qwen3.8-27B.
- Capacidades multilingues con foco en ingles, japones y chino; el vocabulario de 248.320 tokens se protege explicitamente a 4 bits para preservar la calidad multilingue.
- Generacion de codigo, segun los ejemplos de la model card (implementacion de algoritmos en Python).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el pipeline indicado es solo text-generation.
- Ejecucion completa en memoria unificada de Macs Apple Silicon de 16 GB a ~12,2 tokens/segundo.

## Casos de uso

- Asistentes locales en Mac de 16 GB: el modelo cabe integramente en la memoria unificada (10,11 GiB) sin swap, permitiendo un chatbot privado y sin conexion a ~12,2 tokens/s en chips M1/M2/M3/M4.
- Procesamiento de texto en japones y chino en local: la proteccion del vocabulario multilingue a 4 bits y las mejoras medidas en KL japones (-22,42%) lo hacen adecuado para resumir, redactar o traducir documentos en estos idiomas sin depender de la nube.
- Generacion de codigo basica en entornos restringidos: la model card muestra ejemplos de implementacion de algoritmos en Python, util como asistente de codigo offline en portatiles sin GPU dedicada.
- Prototipado e investigacion en cuantizacion: al documentar con precision el presupuesto de bytes y la asignacion de bits, sirve como referencia reproducible para estudiar cuantizacion mixta consciente de sensibilidad.
- Integracion en aplicaciones macOS con MLX: al usar capas `QuantizedLinear` estandar de `mlx-lm`, puede integrarse en apps Swift/Python sin compilar kernels personalizados de Metal.
- RAG o chat con documentos en equipos sin GPU NVIDIA: la baja huella de memoria deja margen en los 16 GB para embeddings y contexto de recuperacion, aunque la longitud de contexto exacta no esta disponible.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a evaluaciones de fidelidad de cuantizacion (divergencia KL, perplejidad y acuerdo de tokens frente al modelo BF16) en conjuntos held-out, no a benchmarks estandar tipo MMLU o HumanEval. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

| Metrica | Linea base 2-bit uniforme (g64) | Pyrite 2-bit mixto | Mejora |
|---|---|---|---|
| KL ingles (eval_heldout_en) | 0,6230 | 0,4841 | -22,29% |
| PPL ingles | 10,92 | 9,60 | -1,32 |
| Acuerdo Top-1 ingles | 67,21% | 70,81% | +3,60 pt |
| KL japones (eval_heldout_ja) | 0,5856 | 0,4543 | -22,42% |
| PPL japones | 18,35 | 15,55 | -2,81 |
| Acuerdo Top-1 japones | 66,00% | 68,65% | +2,65 pt |
| KL multilingue (Val) | — | — | -27,08% |
| Velocidad de generacion (Mac 16 GB) | — | ~12,2 tokens/s | — |

## Requisitos de hardware

- VRAM / memoria necesaria: 10,11 GiB (10.854.616.576 bytes) de pesos; en Macs de 16 GB se recomienda fijar el wired limit a 11 GiB (`mx.set_wired_limit(int(11.0 * 1024**3))`) y materializar las capas secuencialmente para evitar swap a SSD.
- GPUs Apple Silicon recomendadas: M1, M2, M3 y M4 con 16 GB de memoria unificada o mas. Con mas memoria (24-32 GB+) el margen para contexto y KV-cache aumenta.
- Consumer GPUs NVIDIA: no es el objetivo del formato MLX; para GPU NVIDIA habria que recurrir a otras cuantizaciones del modelo base (no disponibles en este repo).
- Despliegue: exclusivamente mediante `mlx-lm` (libreria `mlx`), usando `load` y `generate` estandar; no requiere kernels personalizados ni forks parcheados. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (formato MLX no compatible con ellos).
- Latencia y throughput: ~12,2 tokens/segundo en un Mac Apple Silicon de 16 GB, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits | Tamano pesos | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Pyrite-2bit-MLX | 26,9B | MLX, mixto ~2,97 bits | 10,11 GiB | no disponible | Apache 2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3.8-27B (base) | 26,9B | BF16 | 51,75 GiB | no disponible | Apache 2.0 | Multiplataforma |
| Cuantizacion uniforme 2-bit (g64) del mismo base | 26,9B | MLX, 2,50 bits efectivos | 10,11 GiB | no disponible | Apache 2.0 | Apple Silicon (MLX) |

La comparacion mas relevante es con la alternativa de cuantizacion uniforme a 2 bits con el mismo presupuesto de bytes: Pyrite ofrece la misma huella de memoria exacta (10.854.616.576 bytes) pero con KL un 22-27% menor frente al modelo BF16. No hay datos para comparar con otros modelos de 27B de otras familias.

## Limitaciones y advertencias

- Calidad degradada por la cuantizacion extrema: con ~2,97 bits efectivos de media, la perplejidad en japones sigue siendo alta (15,55), señal de perdida notable frente al BF16 en tareas exigentes de razonamiento o codigo complejo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; a estos niveles de compresion debe asumirse un riesgo elevado frente al modelo original.
- Sesgos: hereda los sesgos del modelo base Qwen3.8-27B; no hay auditoria de sesgos documentada en la model card.
- Longitud de contexto: no disponible; debe verificarse en la ficha del modelo base antes de usos con documentos largos.
- Plataforma limitada: el formato MLX solo funciona en Apple Silicon con `mlx-lm`; no es utilizable en GPUs NVIDIA ni con runtimes estandar como llama.cpp o vLLM.
- Rendimiento modesto: ~12,2 tokens/s es suficiente para chat interactivo pero lento para procesamiento por lotes de gran volumen.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, aunque el modelo cuantizado hereda los terminos del modelo base Qwen.
- Proyecto comunitario con pocas descargas (378) y sin likes en el momento de la ficha: conviene validar la calidad por cuenta propia antes de uso en produccion.
- En Macs de 16 GB es obligatorio el ajuste del wired limit y la carga secuencial de capas; de lo contrario puede producirse thrashing de SSD y degradacion severa del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper (PDF en el repo): https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX/blob/main/pyrite_en.pdf
- DOI (Zenodo): https://doi.org/10.5281/zenodo.23786705
- Model card en japones: https://huggingface.co/masahiroid/Qwen3.8-27B-Pyrite-2bit-MLX/blob/main/README_ja.md
- Libreria mlx-lm: https://pypi.org/project/mlx-lm/
