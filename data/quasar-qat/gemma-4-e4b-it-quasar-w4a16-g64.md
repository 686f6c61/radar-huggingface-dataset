# QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64

## Resumen

QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64 es un checkpoint cuantizado a 4 bits de google/gemma-4-E4B-it, publicado por la organización QUASAR-QAT. No es una cuantización posterior al entrenamiento (PTQ): se trata de un checkpoint de quantization-aware training (QAT) nativo, es decir, los códigos INT4 provienen directamente del proceso de entrenamiento, no de una re-cuantización. El modelo conserva las capacidades multimodales del base (entrada de texto, imagen y audio), una ventana de contexto de 131.072 tokens y soporte de razonamiento, tool calling y uso agéntico.

El problema que resuelve es la pérdida de calidad típica de la cuantización a 4 bits en modelos pequeños. Según la model card, este checkpoint reduce la divergencia KL respecto a BF16 de 0,064 a 0,022 (unas 3 veces menos) y mejora las estimaciones puntuales en los 8 benchmarks downstream evaluados frente a la cuantización W4A16 QAT oficial de Google, con un coste de 4,25 bits por peso (bpw) frente a 4,5 del modelo de Google. Además, en la configuración probada con vLLM sobre una H100, el group_size 64 despacha al kernel Machete y alcanza 4.225 tokens/s de salida frente a 3.111 del checkpoint de Google.

La relevancia práctica es doble: por un lado, ofrece una alternativa de despliegue más barata y más rápida que la cuantización oficial; por otro, demuestra que el QAT con reconstrucción consciente de la pérdida (QUASAR) puede exportarse a formatos de despliegue estándar (compressed-tensors para vLLM, GGUF para llama.cpp) sin sobrecoste de inferencia. El modelo totaliza 7.941.106.250 parámetros y un repositorio de 10,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal de la familia Gemma 4 (variante E4B); cuantización weight-only sobre las capas lineales del decodificador |
| Parametros totales | 7.941.106.250 (~7,94 B) |
| Parametros activos | no disponible (no se describe un esquema MoE; la nomenclatura E4B no se detalla en la model card) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | INT4 simétrico weight-only (W4A16), group_size 64, escalas fp16, compressed-tensors pack-quantized; 4,25 bpw efectivos. Gemelo GGUF en Q4_0 |
| Idiomas soportados | Inglés y multilingüe según etiquetas; lista completa de idiomas no disponible |
| Licencia | apache-2.0 en los metadatos de HuggingFace; la model card remite a las licencias upstream de Gemma 4 (LICENSE/NOTICE de Google DeepMind) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized); existe un gemelo GGUF Q4_0 |
| Modalidades de entrada | Texto, imagen y audio (pipeline any-to-any) |
| Alcance de la cuantizacion | 258 capas lineales del decodificador (q/k/v/o/gate/up/down); embeddings, normalizaciones, tablas per-layer-input y torres de visión/audio se mantienen en bf16 |
| Tamano del repositorio | 10,2 GB |
| Libreria | transformers |
| Modelo base | google/gemma-4-E4B-it |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B-it: un transformer decoder multimodal que acepta texto, imagen y audio, con 131.072 tokens de contexto y entrenamiento orientado a conversación, razonamiento (modo thinking), tool calling y uso agéntico. Sobre esa base, el checkpoint aplica cuantización weight-only W4A16: las activaciones permanecen en 16 bits y solo se cuantizan los pesos de las 258 capas lineales del decodificador (q, k, v, o, gate, up y down), con enteros simétricos de 4 bits, grupo de 64 y escalas en fp16. El resto del modelo (embeddings, normalizaciones, tablas per-layer-input y las torres de visión y audio) permanece en bf16, lo que explica en parte que el repositorio ocupe 10,2 GB pese al esquema de 4 bits.

El método, descrito en el paper QUASAR (arXiv:2608.13966), es un QAT consciente de la pérdida que mejora la reconstrucción en baja precisión durante el propio entrenamiento y después exporta a formatos de despliegue estándar sin sobrecoste en inferencia. Según la model card, este checkpoint se «curó» contra el profesor BF16 durante 626 millones de tokens: una época sobre aproximadamente 398.000 prompts autodestilados desde google/gemma-4-E4B-it en BF16 con el modo thinking activado, pesos maestros en fp32 y cuantización INT4 con grupo 64. El archivo export_receipt.json permite verificar la exportación tensor a tensor, y el gemelo GGUF incorpora un script --verify que comprueba que los dos ficheros comparten códigos y escalas.

## Capacidades

- Generación de texto conversacional en inglés y multilingüe, con ventana de contexto de hasta 131.072 tokens.
- Razonamiento explícito en modo thinking, heredado del modelo base.
- Capacidades matemáticas y de código, evidenciadas por los resultados en GSM8K (82,0) y MATH-hard (60,7).
- Seguimiento de instrucciones, medido con IFEval (82,6).
- Entrada multimodal: texto, imagen y audio (pipeline any-to-any). Las torres de visión y audio no están cuantizadas.
- Soporte de function calling y tool calling, según las etiquetas y la descripción del modelo base.
- Capacidades agénticas y de razonamiento multi-paso (etiqueta agentic).
- Despliegue compatible con cualquier cliente OpenAI-compatible a través de vLLM.

## Casos de uso

- Despliegue de asistentes conversacionales de contexto largo: con 131.072 tokens de ventana, el modelo puede mantener historiales extensos o procesar documentos completos sin troceado agresivo, reduciendo la pérdida de información entre turnos.
- Automatización de atención al cliente: conversaciones multi-turno con acceso a base de conocimiento inyectada en el contexto, en inglés o en varios idiomas, con el coste de servido reducido por el esquema de 4 bits.
- Pipelines de generación de código con tool calling: integración en entornos de CI/CD donde el modelo invoca herramientas externas (linters, ejecutores de tests, APIs de repositorio) gracias al soporte de function calling.
- Agentes multi-paso: tareas que requieren planificación, uso de herramientas y razonamiento encadenado, apoyándose en el modo thinking del modelo base.
- Análisis de documentos con imagen: al aceptar entrada de imagen, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales.
- Transcripción y explotación de audio: la entrada de audio permite construir flujos de resumen o extracción de información a partir de grabaciones, sin necesidad de un ASR externo.
- Evaluación de modelos cuantizados: dado que el repositorio incluye EVAL.md y export_receipt.json, sirve como referencia reproducible para comparar estrategias de QAT frente a PTQ en modelos de ~8 B.
- Servido de alto rendimiento en producción: en la configuración probada con vLLM sobre H100 alcanza 4.225 tokens/s de salida, lo que lo hace apto para cargas concurrentes en batch.

## Benchmarks y rendimiento

Comparación de fidelidad respecto a BF16 (mismos 512 prompts reservados y misma referencia BF16 para ambos checkpoints). Los «hard tokens» son posiciones donde la probabilidad top-1 de BF16 es inferior a 0,9.

| W4A16 | KL a BF16 (↓) | Coincidencia top-1 (↑) | Top-1 en hard tokens (↑) | bpw cuantizados |
|---|---:|---:|---:|---:|
| QUASAR (g64) | 0,022 | 95,5 % | 86,9 % | 4,25 |
| Google QAT (g32) | 0,064 | 92,6 % | 78,9 % | 4,5 |

Benchmarks downstream, mismo harness y mismo backend para ambos checkpoints:

| Benchmark | QUASAR | Google QAT |
|---|---:|---:|
| TriviaQA | 23,8 | 20,1 |
| NQ-open | 4,7 | 2,4 |
| TruthfulQA | 58,2 | 55,4 |
| ARC-Easy | 79,8 | 78,3 |
| ARC-Challenge | 56,2 | 56,0 |
| GSM8K | 82,0 | 81,5 |
| IFEval | 82,6 | 81,9 |
| MATH-hard | 60,7 | 59,4 |
| Media | 56,0 | 54,4 |

Rendimiento de servido (vLLM 0.28 sobre una H100, mismo batch):

| Configuración | Kernel | Tokens/s de salida |
|---|---|---:|
| QUASAR W4A16 (g64) | Machete | 4.225 |
| Google QAT W4A16 (g32) | Marlin | 3.111 |
| BF16 (referencia) | no indicado | 4.823 |

La model card indica que la latencia de una sola petición está en paridad entre ambos checkpoints cuantizados. Los intervalos de confianza por bootstrap emparejado y las configuraciones completas están en EVAL.md. No se han publicado en la información disponible resultados de MMLU ni HumanEval.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 10,2 GB, por lo que se necesita del orden de 10-12 GB de VRAM solo para cargar el checkpoint en vLLM; hay que sumar la caché KV, que a 131.072 tokens de contexto es considerable.
- GPU recomendadas para producción: H100 (configuración de referencia de las pruebas, con kernel Machete para group-64) y A100. El checkpoint también debería funcionar en GPUs Ampere o posteriores, aunque el kernel seleccionado puede variar.
- GPU de consumo: cabe en una RTX 4090 (24 GB) con margen para contexto amplio; en una RTX 4080 (16 GB) o similar el checkpoint entra, pero el contexto práctico queda limitado por la caché KV. No es viable en GPUs de 8-12 GB en esta configuración.
- Opciones de despliegue: vLLM (probado en 0.28.0 y 0.29.0; se recomienda `--dtype float16` para preservar las escalas fp16 almacenadas), con comando `vllm serve QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64 --dtype float16`. Para llama.cpp, Ollama o LM Studio debe usarse el gemelo GGUF Q4_0.
- Throughput: 4.225 tokens/s de salida en la prueba de vLLM 0.28 sobre una H100 con group-64; la latencia de una sola petición es equivalente a la del checkpoint QAT de Google.
- Soporte de TGI, TensorRT-LLM u otros motores: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Fidelidad / rendimiento | Licencia |
|---|---|---|---|---|---|
| QUASAR W4A16-G64 (este) | 7,94 B | 131.072 | W4A16, grupo 64, 4,25 bpw | KL 0,022; media 56,0 en 8 benchmarks; 4.225 tok/s (H100) | apache-2.0 según metadatos; upstream Gemma 4 |
| Google gemma-4-E4B-it-qat-w4a16-ct | no disponible en la información | no disponible en la información (el base soporta 128K) | W4A16, grupo 32, 4,5 bpw | KL 0,064; media 54,4; 3.111 tok/s (H100) | no disponible |
| google/gemma-4-E4B-it (BF16) | mismo base | 131.072 | ninguna (bf16) | Referencia de fidelidad; 4.823 tok/s (H100) | Gemma 4 (Google DeepMind) |
| QUASAR Q4_0 GGUF (gemelo) | mismo base | 131.072 | GGUF Q4_0, mismos códigos y escalas | No se publican métricas separadas | apache-2.0 según metadatos; upstream Gemma 4 |

## Limitaciones y advertencias

- La model card no documenta sesgos específicos del checkpoint; al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación inherente al modelo base. Nótese que los resultados en NQ-open (4,7) y TriviaQA (23,8) son bajos en términos absolutos, aunque superiores a los del QAT de Google; conviene validar la factualidad en dominios sensibles.
- La mayor parte de las evaluaciones publicadas se centran en inglés. El soporte multilingüe se declara mediante etiquetas, pero no hay métricas por idioma disponibles.
- La licencia es ambigua: los metadatos de HuggingFace indican apache-2.0, mientras que la model card afirma que se aplican las licencias upstream de Gemma 4. Antes de un uso comercial conviene verificar los términos de Google DeepMind aplicables al modelo base.
- El checkpoint solo está cuantizado en las 258 capas lineales del decodificador; las torres de visión y audio permanecen en bf16, lo que limita el ahorro de memoria en cargas multimodales.
- Requiere `--dtype float16` en vLLM para preservar exactamente las escalas fp16 almacenadas; otros dtype pueden degradar la fidelidad.
- El rendimiento medido con el kernel Machete corresponde a una H100 con vLLM 0.28-0.29; en otro hardware o versión del motor las cifras de throughput no son extrapolables.
- El modelo tiene 9 descargas y 1 like en el momento de los datos, por lo que la validación por parte de la comunidad es todavía muy limitada.
- La caché KV a 131.072 tokens de contexto puede consumir más VRAM que los propios pesos cuantizados en despliegues de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Cuantización QAT oficial de Google (referencia comparativa): https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Gemelo GGUF Q4_0 de este checkpoint: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF
- Gemma 4 12B, misma receta (W4A16): https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64
- Gemma 4 12B, misma receta (GGUF): https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-Q4_0-GGUF
- Colección QUASAR 4-bit QAT para Gemma 4 E4B y 12B: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Resultados de evaluación detallados (EVAL.md): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64/blob/main/EVAL.md
- Recibo de exportación (export_receipt.json): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64/blob/main/export_receipt.json
- Organización QUASAR-QAT: https://huggingface.co/QUASAR-QAT
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces encontrados corresponden a proyectos homónimos sin relación (Quasar Framework, la herramienta de administración remota Quasar, el término astronómico «quásar» y una tienda de scripts para FiveM).
