# davetha/Inkling-2-Mini-Uncensored-EXL3-B70

## Resumen

Inkling-2-Mini-Uncensored-EXL3-B70 es un checkpoint cuantizado en formato EXL3 a 4 bits por peso del modelo multimodal Inkling 2 Mini de Thinking Machines, al que se le ha aplicado la edición de ablación direccional de OpenUncensored para eliminar las respuestas de rechazo. El resultado es un modelo de 8.074.606.080 parámetros totales (arquitectura MoE, según los tags del repositorio) que acepta entradas de imagen y texto, y que está empaquetado específicamente para servirse en una única GPU Intel Arc Pro B70 de 32 GB mediante la receta de vLLM con backend SYCL de Danmoreng.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantización poco habitual: los expertos enrutados se re-cuantizan a EXL3 (~4 bits por peso) mientras que atención, normas, embeddings, torre de visión y el drafter DSpark (`mtp.safetensors`) permanecen en BF16. Por otro, documenta métricas de rendimiento medidas en hardware Intel XPU, un ecosistema con mucha menos cobertura que NVIDIA, con velocidades de prefill de hasta 3.010 tok/s en prompts de 4K y decodificación de 130,7 tok/s en modo normal.

El modelo conserva las capacidades multimodales y de razonamiento del base, pero elimina deliberadamente la capa de seguridad: responde a peticiones que el original rechaza, incluidas las dañinas. Esa característica condiciona por completo su uso en producción y exige controles externos de filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de visión y drafter DSpark; transformer multimodal image-text-to-text |
| Parametros totales | 8.074.606.080 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (perfil de servidor usado en las mediciones) |
| Tipos de cuantizacion | EXL3 a ~4 bits por peso en expertos enrutados; BF16 en atención, normas, embeddings, torre de visión y drafter |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout EXL3 / PonyExl3 / exllamav3), 24 shards de expertos de 512 MB, 3,9 GB de shards densos y 0,6 GB de drafter; ~16,8 GB de repo |

## Arquitectura y entrenamiento

El checkpoint parte de `grant-ai/Inkling-2-Mini-EXL3-4bpw` en la revisión `c266f76b`, que a su vez deriva de `thinkingmachines/Inkling-2-Mini`. La arquitectura es un transformer MoE multimodal con torre de visión y un drafter DSpark para decodificación especulativa. La cuantización EXL3 afecta únicamente a los expertos enrutados, re-cuantizados a aproximadamente 4 bits por peso; el resto de componentes se mantiene en BF16, lo que preserva la fidelidad de la atención y de la torre de visión.

Sobre esa base se aplica la edición de OpenUncensored: una ablación direccional `W' = W - s Q Qᵀ W` (proyección de rango 2) que modifica exclusivamente las proyecciones de salida de atención `attn.wo_ud` de las capas 4 a 23. Como esos tensores son BF16 también en el checkpoint EXL3, los 20 tensores editados se copiaron sin cambios; solo `dense-00001.safetensors` difiere del base EXL3, y todos los shards de expertos, el drafter, el tokenizer y las configuraciones son idénticos byte a byte. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), incluyendo preguntas sobre imágenes.
- Razonamiento con modo de esfuerzo configurable (`reasoning_effort`, heredado del modelo base).
- Tool calling / function calling: la model card reporta "pass" en la comprobación de llamada a herramienta y turno con resultado de herramienta.
- Generación de código: validada en la comprobación de coding del conjunto de evaluación del autor.
- Decodificación especulativa mediante el drafter DSpark más n-gram copy drafting, que acelera cargas de trabajo con mucha copia de contexto.
- Multilingüismo: no disponible (no se especifican idiomas).
- Sin capa de seguridad propia: responde a peticiones que el modelo original rechaza.

## Casos de uso

- Agentes de código en local sobre hardware Intel: el checkpoint está pensado para servirse con vLLM en una Arc Pro B70 y alcanza 262,1 tok/s en ediciones de código con mucho copiado (greedy, 8 prompts, ~20K tokens de salida), lo que lo hace viable para bucles agente-editor en una estación de trabajo.
- Asistente de documentación técnica con contexto largo: con 196.608 tokens de prompt mide 2.162 tok/s de prefill y 72,0 tok/s de decodificación en tareas de recuperación, suficiente para resumir o consultar repositorios y manuales extensos en una sola pasada.
- Procesamiento de documentos escaneados con visión: al conservar la torre de visión en BF16, puede extraer información de capturas, diagramas o PDFs renderizados y responder preguntas sobre ellos.
- Atención al cliente sin filtros predefinidos: útil en entornos donde se requiere respuesta directa a consultas sensibles (por ejemplo, soporte legal o médico interno) y el filtrado se delega a una capa propia.
- Investigación sobre alineación y edición de modelos: la ablación de rango 2 sobre 20 tensores concretos es un caso reproducible para estudiar el efecto de ediciones direccionales en modelos MoE cuantizados.
- Despliegue en infraestructura Intel XPU: sirve como referencia para equipos que quieren evitar NVIDIA y necesitan un stack vLLM + SYCL + EXL3 funcional con métricas publicadas.
- Generación de contenido creativo sin restricciones temáticas: para ficción, guiones o narrativa que aborden temas que los modelos alineados rechazan.

## Benchmarks y rendimiento

Evaluación de rechazos y función (16 prompts de rechazo, modo chat, una Arc Pro B70):

| Metrica | EXL3 original | Este checkpoint |
|---|---:|---:|
| Rechazos | 6 / 16 | 0 / 16 |
| Tool call, turno con resultado y coding | no ejecutado | pass |

Coste de la cuantización EXL3 frente a expertos nativos NVFP4/MXFP8 (ambos con la edición, teacher-forced sobre 12 textos, 18.079 posiciones):

| Metrica | EXL3 | Nativo |
|---|---:|---:|
| Perplejidad | 3,724 | 3,725 |
| Acuerdo top-1 | 96,83 % | referencia |
| KL medio | 0,0065 | referencia |

Velocidad (decodificación especulativa DSpark + n-gram copy drafting, vLLM 0.34, perfil `optimized`, batch 4096):

| Carga de trabajo | tok/s |
|---|---:|
| Prompt frío de 4K, prefill | 3.010 |
| Prompt logbook de 4K, decode (mediana de 3) | 130,7 |
| Ediciones de código con mucho copiado, decode greedy | 262,1 |
| Prompt de 196.608 tokens, prefill / decode | 2.162 / 72,0 |

En el perfil `reference` por defecto, el prefill de 4K es de ~1.985 tok/s y el de 192K de ~1.519 tok/s; la decodificación no cambia. Sin n-gram drafting, el conjunto de copia decodifica a ~159-168 tok/s. El build EXL3 hace prefill aproximadamente 2 veces más rápido que los expertos nativos en la B70 (4K: 1.974-2.000 vs 1.066-1.087 tok/s).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: ~16,8 GB de pesos en disco; con caché KV en FP8 y contexto largo se necesita una GPU de 32 GB para el perfil de 262.144 tokens. Contextos menores reducen el requisito.
- GPU objetivo: una única Intel Arc Pro B70 de 32 GB (límite de 230 W de stock en las mediciones).
- GPU consumer: no hay datos de ejecución en GPUs de consumo; el stack documentado es específico para Intel XPU con SYCL y EXL3, no para CUDA.
- Despliegue: vLLM 0.34 con el port de Danmoreng (`Danmoreng/intel-b70-inkling2-mini-vllm`), operadores EXL3 de `sybil-solutions/trellis-serve`, backend SYCL. La rama `ngram-copy-draft` añade `INKLING2_MODEL_DIR`, `INKLING2_HOST`, guarda de deadline configurable y n-gram copy drafting.
- Comando de servicio: `INKLING2_PREFILL_PROFILE=optimized bash scripts/serve-coding-agent.sh dspark --max-num-batched-tokens 4096`. Nombre servido: `inkling2-mini-exl3-b70`.
- Latencia y throughput: ver tabla de benchmarks (prefill 3.010 tok/s en 4K, decode 130,7 tok/s en logbook, 72,0 tok/s con 196K de contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-EXL3-B70 (este) | 8,07 B totales | 262.144 | EXL3 4 bpw + BF16 | Apache-2.0 | Intel Arc Pro B70 32 GB |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | BF16 (original) | no disponible | no disponible |
| grant-ai/Inkling-2-Mini-EXL3-4bpw | no disponible | no disponible | EXL3 4 bpw | Apache-2.0 (según este repo) | Intel Arc Pro B70 |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | no disponible | no disponible | no disponible |

Los tres modelos comparables son variantes del mismo base, por lo que la diferencia real es la edición de rechazo y el formato de cuantización, no la arquitectura ni el tamaño. No se dispone de datos de benchmarks cruzados con modelos de otras familias.

## Limitaciones y advertencias

- Ausencia total de capa de seguridad: responde a peticiones dañinas. El autor lo advierte explícitamente y delega la responsabilidad en quien despliega; es obligatorio añadir filtrado propio y cumplir la legislación aplicable.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el modo de razonamiento y el contexto largo no eliminan el riesgo.
- Idiomas soportados no documentados: no hay garantía de calidad fuera de los idiomas del modelo base, que no se especifican.
- La ablación direccional puede degradar capacidades no medidas: solo se validaron rechazos, tool calling y coding en un conjunto reducido (16 prompts).
- Dependencia de un stack muy específico: vLLM 0.34 con parches, SYCL, operadores Trellis y una rama concreta de GitHub. La reproducibilidad fuera de ese entorno no está garantizada.
- El perfil de 262.144 tokens exige 32 GB de VRAM; contextos menores o GPUs más pequeñas no están documentados.
- El coste de cuantización es bajo pero no nulo (KL 0,0065, acuerdo top-1 96,83 %), por lo que puede haber divergencias en generaciones largas.
- Licencia Apache-2.0 declarada para base, edición y cuantización, pero conviene verificar la licencia original de `thinkingmachines/Inkling-2-Mini` antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/davetha/Inkling-2-Mini-Uncensored-EXL3-B70
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición uncensored: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Cuantización EXL3 4bpw: https://huggingface.co/grant-ai/Inkling-2-Mini-EXL3-4bpw
- Stack de servicio vLLM para B70: https://github.com/Danmoreng/intel-b70-inkling2-mini-vllm
- Rama con n-gram copy drafting: https://github.com/davetha/intel-b70-inkling2-mini-vllm/tree/ngram-copy-draft
- Operadores EXL3 Trellis: https://github.com/sybil-solutions/trellis-serve
