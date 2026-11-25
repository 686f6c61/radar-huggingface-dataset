# gxunda/Qwen4-27B-Upcycle-Dev

## Resumen

Qwen4-27B-Upcycle-Dev es un modelo de lenguaje causal de tipo denso desarrollado por el usuario gxunda, derivado quirúrgicamente del modelo Qwen/Qwen3.8-27B mediante un proceso de "upcycling" y destilación. El checkpoint, identificado internamente como `DenseQwen4ExpForCausalLM`, sustituye el bloque MoE disperso original por un MLP denso SwiGLU podado con Wanda (de 17.408 a 14.336 neuronas intermedias) y redistribuye ese presupuesto de parámetros hacia cuatro flujos de hiperconexiones (Hyper-Connections, `hc_count=4`) en las 64 capas híbridas del modelo, que combinan GatedDeltaNet (atención lineal) y atención completa GQA en proporción 3:1.

El modelo cuenta con 26.056.527.872 parámetros totales (25,69B en el tronco y 0,42B en un módulo compartido de Multi-Token Prediction), una ventana de contexto no especificada en la información disponible y pesos en formato safetensors BF16 distribuidos en 13 shards (48,53 GiB, repositorio de 74,3 GB). Se distribuye bajo licencia Apache 2.0 y está orientado a generación de texto con razonamiento explícito mediante etiquetas `<think>`, decodificación especulativa con MTP y soporte para tool calling a través de la plantilla de chat de Qwen.

Su relevancia radica en que demuestra empíricamente que un proceso de destilación Top-64/Tail-KL sobre 40,96M de tokens de razonamiento puede superar al profesor original en cross-entropy de validación (0,6546 frente a 0,7024) manteniendo un 92,05% de acuerdo Top-1 en decodificación greedy, además de lograr una aceleración de 1,569× en latencia por token gracias al módulo MTP compartido desenrollado en profundidades k=1..4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DenseQwen4ExpForCausalLM` (híbrida: 48 capas GatedDeltaNet + 16 capas Gated GQA, 3:1 intercaladas) |
| Parametros totales | 26.056.527.872 (25,69B tronco + 0,42B MTP compartido) |
| Parametros activos | No aplica (modelo denso, `num_experts = 0`) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, 48,53 GiB en BF16) |
| Hidden size / vocab | 5.120 / 248.320 (embeddings y lm_head no atados) |
| Cabezas de atención completa | 24 Q / 4 KV, `head_dim=256`, RoPE parcial 0,25, Q/K RMSNorm, output gate |
| Cabezas GatedDeltaNet | 16 K / 48 V (`dim=128`), `conv_kernel=4`, RMSNorm con puerta silu |
| Hyper-Connections | 4 flujos, `hc_lowrank=320` (1,70B parámetros) |
| FFN denso | SwiGLU `intermediate_size=14.336`, LoRA r=16 fusionada |
| MTP | 1 capa compartida `mtp_intermediate_size=17.408`, desenrollada k=1..4 |
| Requiere `trust_remote_code` | Sí |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 64 capas que intercala bloques de atención lineal GatedDeltaNet (48 capas) con bloques de atención completa GQA (16 capas) en proporción 3:1. El bloque FFN original tipo MoE se reemplaza por un MLP denso SwiGLU podado con Wanda (17.408 → 14.336), y el presupuesto liberado se reinvierte en cuatro flujos de Hyper-Connections con rango bajo 320 (`Qwen4ExpTextGatedResidual`, 1,70B parámetros), inicializados mediante compensación exacta de puertas RMSNorm `(1 + w) × 2` (`w_hc = 2 * w_src + 1`, error FP32 en paso 0 de 4,77e-7) más micro-offsets de simetría de suma cero por flujo. Se conserva el indexador de tokens QSA (`4Q/1KV`, `dim=128`) con `qsa_dense_bypass = True` en la primera ronda, y las Per-Layer Embeddings están desactivadas (`ple_layer_ids = []`).

El entrenamiento consistió en una destilación sobre 40,96M de tokens de razonamiento `<think>` provenientes de OpenThoughts-114k, NuminaMath-CoT y CodeFeedback-Filtered-Instruction, usando probabilidades Top-64 exactas por chunks más una KL forward escalar de masa de cola en FP32, `0,1 × CE` y una pérdida MTP descontada a 4 pasos (`Σ_{k=1}^{4} 0,5^k CE_k`), optimizada con Muon híbrido + AdamW. El módulo MTP compartido se inicializa mapeando los 15 tensores `mtp.*` del profesor y se desenrolla con desplazamiento anti-fuga estricto. La ablación de las puertas dinámicas HC en inferencia degrada la CE de validación en +0,0427 nats (0,6546 → 0,6973), lo que confirma que la especialización multi-flujo es funcionalmente relevante.

## Capacidades

- Generación de texto conversacional con razonamiento explícito en modo `<think>` (cadena de pensamiento antes de la respuesta final).
- Razonamiento matemático: resultados en sondas GSM8K y MATH-500 con etiquetas `<think>` (ver sección de benchmarks).
- Generación de código: entrenado sobre CodeFeedback-Filtered-Instruction, con soporte para instrucciones de programación y explicaciones.
- Tool calling / function calling: heredado de la plantilla de chat de Qwen3.8-27B (no se documenta explícitamente en la model card, pero es estándar en la familia base).
- Razonamiento multi-paso y agentes: el formato `<think>` y la ventana de contexto del modelo base permiten flujos de razonamiento encadenado.
- Decodificación especulativa nativa mediante MTP compartido (k=1..4), con aceptación media de 2,596 tokens por pasada de verificación.
- Multilingüe limitado a inglés y chino según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de tipo GSM8K y MATH-500 generando cadenas `<think>` antes de la respuesta; útil en tutores automáticos o herramientas de verificación de ejercicios, con la cautela de que el cierre de `<think>` dentro de 768 tokens solo ocurre en el 82% de las sondas.
- Generación de código en pipelines de asistencia al desarrollador: al estar entrenado sobre CodeFeedback-Filtered-Instruction, puede producir fragmentos de código con explicación; su formato safetensors y `trust_remote_code` permiten integrarlo en servicios de autocompletado o revisión de parches.
- Destilación y experimentación académica: el checkpoint sirve como caso de estudio reproducible de upcycling MoE→denso con hiperconexiones, útil para investigadores que quieran replicar la metodología Wanda + destilación Top-64/Tail-KL.
- Servicio de chat multi-turno en inglés o chino: con la plantilla de chat de Qwen y el modo `<think>`, adecuado para asistentes conversacionales en esos dos idiomas, aunque sin datos publicados sobre longitud de contexto efectiva.
- Aceleración de inferencia con decodificación especulativa: el módulo MTP compartido permite desplegar el modelo con verificación de borradores k=1..4, reduciendo el TPOT de 49,85 a 31,77 ms/token en una RTX PRO 6000 Blackwell en BF16, lo que lo hace atractivo para servicios de baja latencia.
- Investigación sobre hiperconexiones: la ablación documentada (+0,0427 nats al desactivar las puertas HC) permite estudiar el impacto de los flujos residuales múltiples en modelos híbridos de atención lineal.
- Evaluación de alineación con el profesor: con un 92,05% de acuerdo Top-1 y 74,77% de solapamiento Top-32 frente a Qwen3.8-27B, puede usarse como sustituto ligero en entornos donde el profesor no esté disponible, aceptando la pérdida de fidelidad restante.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Referencia |
|---|---|---|
| CE validación held-out (HC on, final) | 0,654564 | Profesor Qwen3.8-27B: 0,702417 |
| CE validación held-out (HC off, final) | 0,697251 | Δ +0,042687 frente a HC on |
| Acuerdo Top-1 greedy con profesor (58.264 tokens) | 92,05% | — |
| Solapamiento Top-32 con profesor | 74,77% | — |
| GSM8K test probe (25 problemas, 768 tokens) | 88,0% (92,0% ajustado por formato `\$`) | — |
| Sonda combinada 50 problemas (25 GSM8K + 25 MATH-500, 768 tokens) | 54,0% (82,0% de cierre `<think>` en 768 tokens) | — |
| Tasa de aceptación condicional MTP k=1/2/3/4 | 64,65% / 71,09% / 62,64% / 70,18% | — |
| Tasa de aceptación acumulada MTP k=1/2/3/4 | 64,65% / 45,96% / 28,79% / 20,20% | — |
| Longitud media aceptada por pasada | 2,596 tokens | — |
| TPOT extremo a extremo (RTX PRO 6000 Blackwell, BF16) | 31,77 ms/token | Baseline sin MTP: 49,85 ms/token (1,569×) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible; los datos anteriores provienen de sondas internas del autor y de la progresión de validación durante la destilación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos (48,53 GiB), más overhead de caché KV y activaciones; se recomienda al menos 60-64 GB de VRAM para contexto moderado.
- En cuantización de 8 bits: aproximadamente 26-28 GB de VRAM, viable en GPUs de 32 GB (A100 40GB, RTX 5090, RTX PRO 6000).
- En cuantización de 4 bits: aproximadamente 14-16 GB, viable en GPUs consumer de 16-24 GB (RTX 4090, RTX 4080), aunque no se documentan pesos GGUF ni AWQ/GPTQ publicados.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada por el autor para las mediciones de TPOT), A100 80GB, H100 80GB para BF16 sin cuantizar.
- El modelo requiere `trust_remote_code=True` y código personalizado (`DenseQwen4ExpForCausalLM`), lo que limita el soporte inmediato en vLLM, llama.cpp, Ollama o TGI hasta que se implemente la arquitectura.
- Latencia medida: 31,77 ms/token con MTP activo y 49,85 ms/token sin él, en una RTX PRO 6000 Blackwell en BF16 con flujo único.
- Throughput agregado y latencia en otras GPUs: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen4-27B-Upcycle-Dev | 26,06B (denso) | No disponible | Apache 2.0 | Destilado de Qwen3.8-27B; MTP y HC; solo en/zh |
| Qwen/Qwen3.8-27B (profesor) | 27B (MoE disperso, según la model card del alumno) | No disponible | No disponible en la información | Superado en CE de validación por el alumno (0,6546 vs 0,7024) |
| Alternativas densas de ~27B (p. ej., Gemma, Mistral) | ~27B | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con benchmarks estándar frente a otros modelos de la misma categoría; la única referencia cuantitativa es el profesor Qwen3.8-27B.

## Limitaciones y advertencias

- Modelo en estado "Dev": checkpoint de desarrollo con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación externa ni de uso en producción.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no documentada; el rendimiento más allá de la ventana del profesor es incierto.
- Riesgo de alucinación inherente a los modelos destilados; el 92,05% de acuerdo Top-1 con el profesor implica que aproximadamente 8 de cada 100 tokens greedy difieren, lo que puede acumular errores en generaciones largas.
- El cierre de `<think>` dentro de 768 tokens solo ocurre en el 82% de las sondas, lo que puede provocar respuestas truncadas o razonamientos incompletos en configuraciones de generación cortas.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica riesgos de seguridad y compatibilidad con frameworks de despliegue estándar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que el autor no detalla; conviene verificar la licencia del profesor antes de un despliegue comercial.
- El proceso de poda Wanda y la sustitución MoE→denso pueden introducir sesgos o degradaciones no medidas en tareas fuera de las sondas de razonamiento y código.
- No se documentan sesgos específicos ni evaluaciones de seguridad o alineación.

## Enlaces

- Hugging Face: https://huggingface.co/gxunda/Qwen4-27B-Upcycle-Dev
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Commit del modelo base referenciado: `37561816e66b5b9153b1b64c10968c18c1e6f4a0`
- Paper, blog o demo adicionales: no disponible
