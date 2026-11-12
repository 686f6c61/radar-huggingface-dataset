# ProjectGaiaUK/gaia-3b-chat

## Resumen

`gaia-3b-chat` es un modelo conversacional de 3.000 millones de parámetros (2.976.033.792 exactos) desarrollado por Project Gaia, la iniciativa de investigación de MyPetSitter Ltd (Reino Unido), bajo la dirección de Marian V. Petrisor. Se trata de un modelo entrenado desde cero y posteriormente afinado para mantener conversaciones y responder consultas de cuidado de mascotas citando registros numerados que se le proporcionan en el prompt (generación aumentada por recuperación, RAG), así como para declarar explícitamente cuándo esos registros no contienen la respuesta. Es relevante por tres motivos: es un modelo pequeño y autoalojable con contexto de 131.072 tokens, está entrenado conjuntamente en inglés y rumano con un tokenizador equilibrado (1,08× tokens para rumano frente a inglés, frente al 3,32× de un tokenizador English-first), y publica sus pesos bajo Apache-2.0.

El modelo se basa en `ProjectGaiaUK/gaia-3b-base-128k`, un transformer tipo Llama preentrenado desde cero con 150.000 millones de tokens y fases posteriores de extensión de contexto. Sobre esa base se aplicó un SFT conversacional (chat set v5-r4), una ronda de razonamiento matemático (v5m), una ronda de replay equilibrado en rumano (ro2) y una mezcla de pesos final (mix70) que dio lugar a la variante "decline3", adoptada por el propietario el 12 de noviembre de 2026.

La versión publicada es la Ronda 1, versión 1.0. El autor la describe explícitamente como modelo de investigación, no como asistente general ni como asesor veterinario, y advierte de que no es seguro responder preguntas de cuidado de mascotas sin salvaguardas. No se han publicado resultados de benchmarks en la información disponible más allá de referencias cualitativas a GSM8K y a preferencias en rumano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (`LlamaForCausalLM`), pre-norm, GQA, SwiGLU, RoPE |
| Parámetros totales | 2.976.033.792 (2.774.707.200 sin las dos matrices de embedding) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés y rumano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un `model.safetensors` en bfloat16, 5.952.097.048 bytes); formato Llama de Hugging Face; checkpoint de entrenamiento en float32 |

Detalles adicionales de arquitectura: 28 capas, `d_model` 3.072, 24 cabezas de query compartiendo 6 cabezas key-value (GQA), tamaño de cabeza 128, sin biases, feed-forward SwiGLU con hidden 8.192, RMSNorm pre-norm con eps 1e-5 calculado en float32, RoPE con theta 64.000.000 y sin escalado de posiciones, vocabulario de 32.768 tokens BPE byte-level (16 reservados, ids 0-15, congelado) y embeddings de entrada y salida no atados.

## Arquitectura y entrenamiento

La arquitectura sigue la forma del modelo base `gaia-3b-128k` (definida en `gaia/model.py`, `gaia/config.py` y `configs/gaia-3b-128k.yaml`). El flujo por bloque es: RMSNorm pre-norm → atención GQA con RoPE → residual → RMSNorm → SwiGLU → residual, con una RMSNorm final y una cabeza lineal. La exportación a formato Llama no requirió reordenar filas q/k, verificado por comparación de logits.

El entrenamiento encadena varias etapas registradas en la documentación del proyecto (`docs/RUNLOG_3B.md`, `docs/CHAT_SFT.md`, `docs/REASON_GEN.md`, `docs/SFT_DECLINE.md`, `docs/DECLINE_V3_PLAN.md`, `docs/FINISH_PLAN.md`):

1. **Etapa 0 — preentrenamiento desde cero**: `gaia-3b-128k`, paso 2.850, con 150.000 millones de tokens a longitud 2.048 y fases posteriores de contexto largo (8k, 32k y 128k), de unos 3.000 millones de tokens cada una.
2. **Etapa 1 — SFT conversacional** sobre el conjunto de chat v5-r4: `gaia-3b-chat-sft-r4`, paso 1.854. Aprende a conversar y a leer y citar registros.
3. **Etapa 2 — v5m**: ejemplos de matemáticas resueltos con replay, `gaia-3b-chat-r4-reason-v5m`, paso 2.114. Según la model card, más que duplicó el rendimiento en GSM8K (sin cifras publicadas).
4. **Etapa 3 — ro2**: ronda de replay equilibrado en rumano, `gaia-3b-chat-r4-reason-v5m-ro2`, paso 1.985. Mejoró la preferencia en rumano pero degradó inglés y conversación multi-turno, por lo que no se adoptó de forma aislada.
5. **Etapa 4 — mix70**: mezcla de pesos que combina las etapas anteriores y da lugar a la variante "decline3", la publicada.

El proyecto declara que ningún modelo se entrena con respuestas de cuidado de mascotas escritas por otro modelo de IA. El entrenamiento se realizó en el superordenador Isambard-AI (Universidad de Bristol) con 4.000 horas de GPU concedidas por el AI Research Resource de UKRI (proyecto 0261-1548-0489-1). La model card indica que todas las mediciones fueron realizadas por máquinas, un juez de IA (Mistral-Small-3.2-24B) o lectores de IA (Claude), nunca por personas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y rumano.
- Respuesta a preguntas de cuidado de mascotas fundamentada en registros numerados incluidos en el prompt, con cita explícita de los mismos.
- Declaración de abstención ("no lo sé") cuando los registros del prompt no contienen la respuesta, en ambos idiomas.
- Aritmética básica y problemas matemáticos de tipo GSM8K tras la etapa v5m (mejora cualitativa reportada, sin cifras publicadas).
- Razonamiento multi-paso orientado a la lectura y síntesis de registros (la variante interna se denomina "reason").
- Capacidad de contexto largo de hasta 131.072 tokens, adecuada para prompts con muchos registros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Modo thinking explícito: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- **Atención al cliente de tiendas de mascotas**: el modelo puede gestionar conversaciones multi-turno en inglés y rumano con hasta 131.072 tokens de contexto, lo que permite insertar el catálogo, las políticas de devolución y las fichas de producto en el prompt y que el modelo cite la fuente de cada respuesta.
- **Asistente de recuperación documental para clínicas veterinarias**: dado un conjunto de registros numerados (protocolos internos, guías de cuidado), el modelo responde citando el número de registro y se abstiene cuando la información no está en el prompt, lo que reduce el riesgo de respuestas inventadas en dominios sensibles.
- **Soporte bilingüe para el mercado rumano**: con un tokenizador que cobra solo 1,08× los tokens del inglés al rumano (frente a 3,32× de un tokenizador English-first), resulta eficiente en coste por token para empresas que atienden a clientes en ambos idiomas.
- **Autoalojamiento en infraestructura propia**: al pesar 6,0 GB en bfloat16 y publicarse en safetensors, puede desplegarse en servidores modestos o en una sola GPU consumer para prototipos, evitando el coste por llamada de una API externa.
- **Investigación sobre equidad de tokenizadores multilingües**: el modelo y su documentación (incluida la comparación de coste de tokens inglés/rumano) sirven como caso de estudio reproducible para estudiar el impacto del vocabulario en la representación de lenguas de bajos recursos.
- **Evaluación de RAG con abstención**: el comportamiento de citar registros y declinar cuando no hay evidencia lo convierte en un banco de pruebas para pipelines de recuperación aumentada con control de alucinación, midiendo precisión de citas y tasa de abstención correcta.
- **Generación de respuestas controladas en entornos regulados**: al ser un modelo pequeño y abierto con licencia Apache-2.0, puede auditarse, modificarse y desplegarse on-premise en entornos donde no se permite enviar datos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente que la etapa v5m "más que duplicó" el rendimiento en GSM8K y que la etapa ro2 mejoró la preferencia en rumano a costa del inglés y del multi-turno, pero no proporciona cifras concretas, y las evaluaciones realizadas por jueces de IA o lectores de IA no se presentan como tablas numéricas en la información suministrada.

## Requisitos de hardware

- **VRAM estimada para inferencia en bfloat16**: aproximadamente 6 GB solo para los pesos (5,95 GB), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- **Cuantización**: no se publican versiones GGUF ni cuantizadas; si se generan, en int8 rondaría los 3 GB y en 4 bits unos 1,5-2 GB, pero son estimaciones no verificadas por el autor.
- **GPU recomendadas**: una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten inferencia en bfloat16 con margen; una A100 o H100 son adecuadas para servir múltiples peticiones o contextos muy largos de hasta 131.072 tokens.
- **¿Cabe en GPU consumer?**: sí, en bfloat16 cabe en GPUs de 12 GB o más para contextos cortos; para aprovechar todo el contexto de 131.072 tokens se necesita más memoria por la caché KV (28 capas × 6 cabezas KV × 128 dimensiones × 2 para K y V × 2 bytes ≈ 88 KB por token, unos 11,5 GB adicionales a contexto completo).
- **Opciones de despliegue**: compatible con `transformers` y con Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` está presente); vLLM, llama.cpp u Ollama requerirían conversión a sus formatos, no documentada por el autor.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `ProjectGaiaUK/gaia-3b-chat` | 2.976 M | 131.072 | en, ro | Apache-2.0 | Modelo de investigación especializado en RAG con abstención y cuidado de mascotas |
| Llama 3.2 3B Instruct | ~3.200 M | 131.072 | multilingüe | Llama 3.2 Community License | Asistente general; licencia con restricciones comerciales |
| Qwen2.5 3B Instruct | ~3.100 M | 32.768 (128K en variantes) | multilingüe | Apache-2.0 | Asistente general con buen rendimiento en código y matemáticas |

La comparación se limita a parámetros, contexto y licencia; no se dispone de resultados de benchmarks de `gaia-3b-chat` que permitan contrastar rendimiento con Llama 3.2 3B o Qwen2.5 3B. Los datos de los modelos alternativos son de conocimiento general y no proceden de la información proporcionada.

## Limitaciones y advertencias

- **No apto para producción sin salvaguardas**: el propio autor declara que, con estos resultados, no es seguro responder preguntas de cuidado de mascotas sin supervisión ("not safe to answer pet-care questions unguarded").
- **Modelo de investigación**: no es un asistente general ni un asesor veterinario; su uso previsto es la investigación y la experimentación controlada.
- **Evaluación sin intervención humana**: todas las métricas fueron leídas por máquinas, un juez de IA (Mistral-Small-3.2-24B) o lectores de IA (Claude), nunca por personas; esto limita la validez ecológica de los resultados.
- **Riesgo de alucinación**: aunque está entrenado para citar registros y abstenerse, no se documentan tasas de alucinación medidas con precisión, por lo que el riesgo persiste.
- **Cobertura lingüística limitada**: solo inglés y rumano; no hay soporte documentado para castellano ni otras lenguas.
- **Degradación observada en la etapa ro2**: la ronda de replay en rumano mejoró la preferencia en ese idioma pero empeoró el inglés y el multi-turno, lo que sugiere fragilidad en el equilibrio bilingüe de la mezcla final.
- **Sin datos de benchmarks públicos**: no hay tablas comparativas verificables frente a modelos de su tamaño.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías y exime de responsabilidad por el uso en dominios sensibles.
- **Formato de pesos único**: solo safetensors en bfloat16; no hay GGUF ni cuantizaciones oficiales, lo que puede complicar el despliegue en entornos con llama.cpp u Ollama.
- **Sesgos**: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/ProjectGaiaUK/gaia-3b-chat
- Modelo base: https://huggingface.co/ProjectGaiaUK/gaia-3b-base-128k
- Referencia de Isambard-AI: McIntosh-Smith, S., Alam S. R. and Woods, C. (2024). "Isambard-AI: a leadership class supercomputer optimised specifically for Artificial Intelligence".
- Documentación interna del proyecto citada en la model card (no enlazada públicamente en la información disponible): `docs/AIRR_GATEWAY_APPLICATION.md`, `docs/RUNLOG_3B.md`, `docs/CHAT_SFT.md`, `docs/REASON_GEN.md`, `docs/SFT_DECLINE.md`, `docs/DECLINE_V3_PLAN.md`, `docs/FINISH_PLAN.md`, `docs/DATA_CARD.md`.
