# freakyskittle/Ripple-65B-Preview-DERISKED

## Resumen

Ripple-65B-Preview-DERISKED es una edición de pesos del modelo base ricursiveAI/Ripple-65B-Preview, publicada por el usuario independiente freakyskittle. El modelo original lo desarrolla Ricursive Intelligence y es un transformer denso de 80 capas y 64.782.689.360 parámetros (unos 64,8 mil millones) con una ventana de contexto configurada de 2.097.152 tokens. La edición aplica la técnica Domain Weight Modification (DWM) de Blackfrost sobre el checkpoint original en BF16, modificando únicamente 156 tensores de las capas 2 a 79 y dejando intactos los 1047 restantes.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de contexto extremadamente largo (más de 2 millones de tokens) con arquitectura thin-and-deep y atención híbrida con sliding window. Por otro, sirve como caso de estudio de una intervención de pesos parcial: el autor aplica una sola ronda de DWM con alpha 1.0 sobre 8 de los 32 pares del banco de contraste, sin completar el ciclo previsto de 3 rondas ni ejecutar los controles de generación benigna ni el smoke test de código.

Conviene subrayar que el sufijo DERISKED es el nombre del repositorio y no una certificación de seguridad. El autor lo indica explícitamente: no es ablación, no es abliteración, no es eliminación de rechazos ni fine-tuning. La licencia Apache 2.0 del modelo base se mantiene y el archivo LICENSE es una copia byte a byte del original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso "ricursive" (clase `RicursiveForCausalLM`, `model_type: ricursive`), 80 capas, hidden 5120, intermediate 40960, 80 cabezas de atención / 8 KV heads, gated attention, value residuals, FFN clamp, SWA híbrida (ventana 1024) con capas globales cada 5 |
| Parámetros totales | 64.782.689.360 (BF16, ~120,67 GiB) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.097.152 tokens configurados |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos BF16; el modelo base tiene un hermano NVFP4 según la card upstream) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors BF16 en 16 shards |
| Vocabulario | 100.352 tokens |
| Plantilla de chat | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Tensores editados | 156 (`self_attn.o_proj` y `mlp.down_proj` en capas 2–79) |
| Tensores intactos | 1047 (bit a bit idénticos al original) |
| Tamaño del repositorio | 129,6 GB |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base. Se trata de un transformer denso de 80 capas con diseño thin-and-deep: dimensión oculta de 5120, dimensión intermedia de 40960, 80 cabezas de atención con solo 8 KV heads (GQA), atención con compuerta, value residuals y FFN clamp. La atención es híbrida: combina sliding window attention con ventana de 1024 tokens e intercala capas de atención global cada 5 capas, lo que permite alcanzar una ventana configurada de 2.097.152 tokens sin que el coste cuadrático se dispare en todas las capas.

El entrenamiento original corresponde a Ricursive Intelligence; la receta, evaluaciones y hermanos (NVFP4, base, DFlash2) están documentados en la card upstream, que esta ficha no replica. La intervención de esta edición es DWM: se mide una dirección en el residual stream a partir de un banco congelado de contraste harmful/safe (solo prefill, sin generación), se resta esa componente de las matrices de escritura residual y se restaura la norma de Frobenius de cada matriz con un tope de error de 0,002. Se aplicó una única ronda con alpha 1.0 usando 8 de los 32 pares del banco (16 filas), porque una sola A40 no completó el bucle fijado de 3 rondas y 32 pares. No se ejecutaron los controles de generación benigna ni el smoke test de código. Las capas 0–1, embeddings, norms, `q/k/v/g_proj`, gate/up del MLP y `lm_head` no se tocaron.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla ChatML.
- Razonamiento de contexto largo: ventana configurada de 2.097.152 tokens, adecuada para documentos extensos o repositorios completos.
- Generación de código: el autor incluye un ejemplo de generación de un archivo Python, aunque el smoke test de código quedó sin ejecutar en esta edición.
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma del repositorio.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 2.097.152 tokens de contexto, el modelo puede ingerir árboles de código extensos en una sola pasada y responder preguntas sobre arquitectura, dependencias o cambios. La ventana híbrida con capas globales cada 5 mitiga la pérdida de información en tramos largos.
- Procesamiento de documentación técnica masiva: manuales, especificaciones y normativas que superan el millón de tokens pueden cargarse íntegros sin trocear, lo que reduce la pérdida de contexto entre fragmentos.
- Generación de código asistida: el modelo acepta plantilla ChatML y puede integrarse en asistentes de programación; el ejemplo de la card genera un archivo Python a partir de una instrucción en lenguaje natural.
- Investigación sobre intervención de pesos: este checkpoint sirve como referencia para estudiar el efecto de DWM sobre un modelo de 64,8 mil millones de parámetros, comparando los 156 tensores editados frente a los 1047 intactos.
- Evaluación de robustez y seguridad: al ser una edición parcial con controles benignos no ejecutados, es útil como caso de prueba para medir cómo afecta una ronda de DWM a las respuestas del modelo en dominios sensibles.
- Experimentación con contexto extremo: útil para probar técnicas de recuperación de información en ventanas de más de 2 millones de tokens, comparando el comportamiento de las capas SWA frente a las globales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no volvió a ejecutar las evaluaciones del modelo base sobre esta edición, y que los controles de generación benigna y el smoke test de código se omitieron por falta de crédito en la instancia utilizada.

## Requisitos de hardware

- VRAM/RAM para inferencia en BF16: aproximadamente 121 GiB, según la card del autor.
- El autor confirma que una sola A40 no completó el bucle de DWM de 3 rondas y 32 pares; para inferencia en BF16 se necesita al menos un nodo con 121 GiB de memoria agregada.
- `device_map="auto"` permite descargar capas a CPU y repartir el modelo entre varias GPU.
- GPU recomendadas: no disponible de forma explícita; por tamaño, se requieren configuraciones multi-GPU (varias A100/H100) o offload a CPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; se requeriría cuantización, que no está publicada en este repositorio.
- Opciones de despliegue: Transformers con `trust_remote_code=True`. El autor advierte que llama.cpp y vLLM estándar no cargan `model_type: ricursive`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DERISKED | 64,8 B (denso) | 2.097.152 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Edición DWM parcial, solo BF16, requiere código custom |
| ricursiveAI/Ripple-65B-Preview | 64,8 B (denso) | 2.097.152 | Apache 2.0 | HuggingFace (modelo base) | Sin edición DWM; incluye hermanos NVFP4, base y DFlash2 |
| Alternativas de ~65 B denso con contexto largo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El sufijo DERISKED es un nombre de repositorio, no una certificación de seguridad; el autor lo recalca en la card.
- La edición se aplicó con una sola ronda de DWM (alpha 1.0) sobre 8 de 32 pares del banco, en lugar del ciclo previsto de 3 rondas y 32 pares.
- No se ejecutaron controles de generación benigna ni el smoke test de código, por lo que no hay evidencia publicada de que la edición preserve el comportamiento original en tareas benignas.
- Solo se publican pesos BF16; no hay versiones cuantizadas en este repositorio, lo que limita el despliegue en hardware de consumo.
- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- Requiere `trust_remote_code=True` y una clase custom (`RicursiveForCausalLM`); llama.cpp y vLLM estándar no lo cargan.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de 64,8 B sin evaluaciones publicadas sobre esta edición.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint editado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay retroalimentación de la comunidad sobre su funcionamiento en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/freakyskittle/Ripple-65B-Preview-DERISKED
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Revisión del modelo base usada: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/tree/e27e171792f303d74c048184e8259ba663cfa0d5
- Licencia upstream: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
- Runbook de Blackfrost DWM (Qwen 9B): https://github.com/Blackfrost-AI/blackfrost-dwm-qwen9b-runbook
- Adaptador A40 del autor: https://github.com/Jackson57279/ripple-65b-preview-runbook
- Inventario de tensores: `verification.json` en el repositorio del modelo
