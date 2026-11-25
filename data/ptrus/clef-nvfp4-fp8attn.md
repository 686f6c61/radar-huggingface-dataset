# ptrus/clef-nvfp4-fp8attn

## Resumen

Clef NVFP4 con atención FP8 es una cuantización comunitaria mixta de 4 y 8 bits del modelo Cloudflare/clef, publicada por el usuario ptrus. El modelo base es un transformer de aproximadamente 16.000 millones de parámetros que combina capas de atención lineal y atención completa, orientado a tareas de clasificación y razonamiento estructurado mediante una cabeza conjunta (joint head) que se sirve como modelo de pooling con token_classify. La cuantización reduce el peso de 51 GB en bf16 a 20 GB, lo que permite desplegarlo en GPUs Blackwell de 32 GB.

La propuesta técnica es agresiva: convierte a NVFP4 todas las proyecciones MLP y las proyecciones de atención lineal, mantiene las proyecciones de self-attention en FP8 y deja en bf16 las embeddings, normas, LM head, torre de visión y cabeza conjunta. Según el autor, esto aporta alrededor de un 18% más de throughput que la cuantización NVFP4 previa de simonlehmann, con una precisión en tareas difíciles estadísticamente indistinguible de esa build.

Es relevante porque demuestra el estado del arte de las técnicas de cuantización de pesos y activaciones en formato NVFP4 sobre hardware Blackwell, con una evaluación de fidelidad publicada contra el modelo bf16 y contra otras builds cuantizadas. No es un modelo oficial de Cloudflare y requiere un motor de inferencia con kernels NVFP4 y soporte de la cabeza de esquema conjunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal y atención completa (64 capas en el modelo de lenguaje), más torre de visión y joint head |
| Parametros totales | 16.032.107.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (MLP y atención lineal), FP8 (self-attention), bf16 (embeddings, normas, conv, LM head, torre de visión, joint head) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en layout compressed-tensors (weight_packed / weight_scale para NVFP4; weight / weight_scale para FP8) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef es un transformer de 64 capas que alterna mecanismos de atención: 48 capas usan atención lineal con proyecciones in_proj_qkv, in_proj_z y out_proj, mientras que 16 capas emplean self-attention completa con proyecciones q, k, v y o. Incluye además una torre de visión y una cabeza conjunta (joint head) que se sirve como modelo de pooling con clasificación de tokens, lo que sugiere un uso orientado a extracción estructurada y clasificación más que a generación de texto libre.

La cuantización se realizó con llm-compressor 0.14.0 mediante GPTQModifier y el observador de pesos nvfp4_expanded_mse sobre la release bf16, en pipeline secuencial. Se usaron 256 prompts de calibración de hasta 8.192 tokens procedentes de mensajes del split de entrenamiento de BANKING77 (CC BY 4.0), solos y concatenados en historiales más largos, más logs de eventos sintéticos. Las proyecciones in_proj_qkv e in_proj_z comparten escala global porque los motores de serving las fusionan en un único producto matricial. La self-attention se dejó deliberadamente en FP8: convertirla también aportaría un 8% más de velocidad pero costaría medio punto de precisión en las tareas difíciles.

## Capacidades

- Clasificación y extracción estructurada mediante joint head servida como modelo de pooling con token_classify.
- Razonamiento sobre tareas de comprensión lectora y elección múltiple (ARC-Challenge, MMLU, BoolQ).
- Clasificación de intenciones y diálogo (BANKING77, CLINC150).
- Detección de necesidad de llamada a herramienta (When2Call).
- Verificación de fidelidad y atribución en generación aumentada por recuperación (RAGTruth).
- Razonamiento sobre contratos y cláusulas (ContractNLI).
- Inferencia natural (ANLI R1-R3).
- Procesamiento de entrada multimodal a través de la torre de visión incluida en bf16.
- No se documentan capacidades de generación de texto libre, código, matemáticas, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo, servido como pooling con token_classify, permite asignar categorías a mensajes de atención al cliente. El calibrado con BANKING77 sugiere un ajuste específico a este dominio.
- Enrutado de intenciones en asistentes conversacionales: con CLINC150 y When2Call entre las tareas evaluadas, puede decidir si una consulta requiere invocar una herramienta o resolverse conversacionalmente.
- Extracción de cláusulas en contratos: ContractNLI aparece en las tareas de evaluación, por lo que el modelo es adecuado para identificar implicaciones y condiciones en documentos legales.
- Verificación de respuestas en pipelines RAG: RAGTruth evalúa la detección de alucinaciones y atribución, lo que permite usar el modelo como filtro de fidelidad antes de mostrar una respuesta al usuario.
- Moderación y análisis de contenido estructurado: la cabeza conjunta y el formato de pooling permiten etiquetar secuencias completas con etiquetas múltiples en lugar de generar texto.
- Despliegue en GPUs de consumo profesional Blackwell: con 20 GB de pesos, cabe en tarjetas de 32 GB y permite servir clasificación a alta concurrencia con un throughput aproximadamente un 18% superior a la build NVFP4 previa.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 frente a FP8 y bf16 en tareas de razonamiento, gracias a la benchmark pública clef-quant-bench.

## Benchmarks y rendimiento

Resultados de fidelidad publicados por el autor contra el modelo bf16, medidos con Level5Tech/clef-quant-bench. Un "flip" es una pregunta cuya respuesta principal difiere de la del modelo bf16.

Tareas publicadas como registros (ARC-Challenge, BANKING77, BoolQ, CLINC150, MMLU, When2Call; 21.174 preguntas):

| Build | Respuestas alteradas | Cambio de precisión |
|---|---|---|
| Segundo motor bf16 (suelo de ruido) | 0,29% | -0,02 pp |
| FP8 (publicado) | 0,94% | -0,04 pp |
| simonlehmann/clef-NVFP4 | 1,97% | -0,19 pp |
| Este checkpoint | 2,41% | -0,31 pp |
| NVFP4 plano (publicado) | 2,83% | -0,52 pp |

Las 12 tareas (31.275 preguntas), contra bf16 servido por el mismo motor. Tareas difíciles: ANLI R1-R3, MMLU, RAGTruth, ARC-Challenge y ContractNLI (14.063 preguntas). Intervalos de confianza al 95% por bootstrap pareado:

| Build | Difíciles: alteradas | Difíciles: cambio de precisión | Todas: alteradas | Todas: cambio de precisión |
|---|---|---|---|---|
| simonlehmann/clef-NVFP4 | 5,06% | -0,59 pp [-0,94, -0,23] | 3,41% | -0,26 pp [-0,45, -0,07] |
| Este checkpoint | 5,95% | -0,68 pp [-1,06, -0,31] | 4,02% | -0,30 pp [-0,51, -0,09] |
| NVFP4 completo (self-attention convertida, no publicado) | 6,22% | -1,06 pp [-1,44, -0,66] | n/a | n/a |

Comparación directa de este checkpoint contra simonlehmann/clef-NVFP4: -0,09 pp [-0,46, +0,29] en tareas difíciles y -0,04 pp [-0,24, +0,17] en todas; discrepa de bf16 en 0,61 pp [0,41, 0,83] más preguntas. Ninguna de las dos builds es sin pérdidas: ambas pierden algo más de medio punto de precisión en tareas difíciles.

## Requisitos de hardware

- Pesos en disco: 20,8 GB (frente a 51 GB en bf16).
- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica que funciona en tarjetas Blackwell de 32 GB.
- GPU recomendadas: NVIDIA Blackwell con soporte de kernels NVFP4 (el autor menciona tarjetas de 32 GB de esa generación).
- No cabe en GPUs de consumo sin NVFP4: el formato requiere hardware Blackwell; no se documenta compatibilidad con RTX 4090 ni generaciones anteriores.
- Motor de despliegue: vLLM 0.33 o superior, ejecutado como modelo de pooling con joint head (token_classify), alimentado con prompts codificados por joint_schema_model.py.
- No es compatible con un one-liner estándar de transformers ni de vllm serve; requiere kernels NVFP4 y la cabeza de esquema de Clef.
- Es imprescindible mantener model.safetensors.index.json junto a los pesos; sin él, vLLM carga todos los *.safetensors como pesos del modelo de lenguaje, incluida la joint head, y falla al arrancar.
- Throughput: aproximadamente un 18% superior a simonlehmann/clef-NVFP4 en una tarjeta Blackwell de 32 GB, según el autor.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Precisión vs bf16 (tareas difíciles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ptrus/clef-nvfp4-fp8attn) | 16,03 B | NVFP4 + FP8 attn | -0,68 pp [-1,06, -0,31] | apache-2.0 | Hugging Face, comunidad |
| simonlehmann/clef-NVFP4 | 16,03 B (base) | NVFP4 MLP + FP8 resto | -0,59 pp [-0,94, -0,23] | no disponible | Hugging Face, comunidad |
| Cloudflare/clef (bf16) | 16,03 B | bf16 | referencia | no disponible | Hugging Face, oficial |
| FP8 (publicado en clef-quant-bench) | 16,03 B (base) | FP8 | -0,04 pp (tareas publicadas) | no disponible | referencia de benchmark |

## Limitaciones y advertencias

- No es una release oficial de Cloudflare; es una cuantización comunitaria sin garantías de soporte.
- No es sin pérdidas: pierde alrededor de 0,68 pp de precisión en tareas difíciles y 0,30 pp en el conjunto completo frente a bf16.
- Dependencia de la composición del lote: las respuestas son idénticas bit a bit cuando una petición se procesa sola, pero al batchear la respuesta a una pregunta puede depender del resto del lote. El efecto es pequeño en bf16 y mayor en todas las builds con activaciones de 4 bits, incluida esta.
- Requiere hardware Blackwell y kernels NVFP4; no es desplegable en GPUs anteriores ni con motores estándar sin adaptación.
- Requiere vLLM 0.33 o superior y la cabeza de esquema conjunta; un uso incorrecto del index.json provoca fallo de arranque.
- La calibración se hizo con datos de BANKING77 y logs sintéticos, lo que puede introducir sesgo hacia dominios de atención al cliente y clasificación.
- Riesgo de alucinación: no evaluado de forma específica en la información disponible; RAGTruth mide fidelidad pero no se publican métricas de generación libre.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Licencia apache-2.0 permite uso comercial, pero la licencia del modelo base Cloudflare/clef no se detalla en la información disponible y conviene verificarla antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ptrus/clef-nvfp4-fp8attn
- Modelo base: https://huggingface.co/Cloudflare/clef
- Cuantización previa: https://huggingface.co/simonlehmann/clef-NVFP4
- Benchmark de cuantización: https://github.com/Level5Tech/clef-quant-bench
- Herramienta de cuantización: https://github.com/vllm-project/llm-compressor
