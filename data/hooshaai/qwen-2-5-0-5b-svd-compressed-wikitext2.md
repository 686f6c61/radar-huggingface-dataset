# Hooshaai/qwen-2.5-0.5b-svd-compressed-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-compressed-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai en Hugging Face, construido sobre el modelo base Qwen/Qwen2.5-0.5B. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre la arquitectura de atención: 18 de las 24 capas del decoder han sido sustituidas por el módulo `SVDCompressedAttention` del registro de atención de NeuralOps, que aplica proyecciones SVD truncadas con adaptadores LoRA entrenables y soporte de GQA y RoPE. Las 6 capas restantes conservan la atención cuadrática completa como anclas.

El modelo ha sido sometido a un proceso de destilación de conocimiento en dos etapas sobre el conjunto WikiText-2, partiendo de un checkpoint post-cirugía con perplejidad prácticamente inutilizable (335.030,92) y recuperándolo hasta 195,39 en validación. El objetivo declarado es explorar arquitecturas de atención subcuadrática mediante reemplazo modular de bloques, no producir un modelo listo para producción.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para investigar cómo afectan las atenciones comprimidas por SVD a un transformer pequeño y cuánto conocimiento puede recuperarse con destilación de representaciones internas en apenas 291 pasos de optimización. El repositorio contiene únicamente los pesos de atención (64,25 MB), no el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `SVDCompressedAttention` y 6/24 capas con atención cuadrática completa |
| Parámetros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo contiene pesos de atención) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 64,25 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esta base se aplica un patrón de cirugía `hybrid_3_1`: se sustituyen 18 capas por `SVDCompressedAttention`, que implementa atención multi-cabeza con proyecciones truncadas por descomposición en valores singulares, adaptadores LoRA entrenables, soporte nativo de GQA y RoPE, y residuales dispersos opcionales. Las capas en los índices `[3, 7, 11, 15, 19, 23]` mantienen la atención cuadrática original como anclas. El adaptador `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV cuando es necesario y respeta el contrato de `o_proj` único.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad causal de 335.030,92. La etapa 1 (alineación con backbone congelado, 88 pasos, 54,4 s) usa MSE y coseno sobre estados ocultos por capa con peso 0,25 y omite el `lm_head`. La etapa 2 (destilación de representaciones multicapa, 203 pasos, 125,4 s) repite el esquema con peso 0,50. En total, 291 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 17.729 MB en FP16 con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención con soporte bidireccional y cross-attention a nivel de módulo (según la ficha del componente `SVDCompressedAttention`).
- Soporte nativo de GQA y RoPE en el módulo de atención sustituido.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio).
- La funcionalidad práctica está limitada por la perplejidad de 195,39, muy superior a la del modelo base, lo que degrada la calidad de generación.

## Casos de uso

- Investigación en atenciones subcuadráticas: el checkpoint permite reproducir el pipeline de cirugía y destilación de NeuralOps sobre un modelo pequeño para estudiar el impacto de SVD truncado en la calidad del lenguaje, con un coste de entrenamiento de apenas 3 minutos en una GPU.
- Banco de pruebas de destilación de representaciones: sirve para validar técnicas de alineación por MSE y coseno sobre estados ocultos internos, comparando la recuperación de perplejidad entre etapas (335.030,92 → 195,39).
- Estudio de arquitecturas híbridas de atención: el patrón `hybrid_3_1` con anclas cuadráticas permite analizar qué capas toleran mejor la compresión y cuáles requieren atención completa.
- Docencia y experimentación académica: modelo de 0,5B con licencia MIT y pesos de 64 MB que cabe en cualquier GPU consumer para prácticas de modificación arquitectónica.
- Pruebas de integración con la librería NeuralOps: valida el flujo `load_surgeried_model` y el registro `ATTENTION_REGISTRY` en pipelines de investigación.
- Referencia de ablación: útil como línea base degradada para comparar futuras variantes de atención comprimida o de mayor presupuesto de destilación.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-svd-compressed-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 195,39 |
| qwen-2.5-0.5b-svd-compressed-wikitext2 (post-cirugía, sin KD) | wikitext-2-raw-v1 (validation) | Perplejidad | 335.030,92 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. El único dato declarado por el autor es la perplejidad en WikiText-2, marcada como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM para inferencia: el modelo base Qwen2.5-0.5B en FP16 requiere aproximadamente 1 GB; el proceso de cirugía y carga de pesos de atención añade una sobrecarga mínima (pesos de 64,25 MB).
- VRAM para reproducir el entrenamiento: 17.729 MB de pico según la telemetría del autor (FP16 con maestros FP32), por lo que se necesita una GPU de 24 GB o superior.
- GPU recomendadas para entrenamiento: A100, H100, RTX 3090/4090 (24 GB) o superiores.
- GPU para inferencia: cabe en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: la carga requiere la librería NeuralOps y el script `apply_qwen_attention_surgery`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-svd-compressed-wikitext2 | 0,5B | no disponible | 195,39 | MIT | Hugging Face (solo pesos de atención) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la información | no disponible | Apache 2.0 (según el modelo original) | Hugging Face |
| Otros modelos del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de Qwen2.5-0.5B en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del original) y la naturaleza parcial del checkpoint (solo atención) son diferencias relevantes.

## Limitaciones y advertencias

- Perplejidad de 195,39 en WikiText-2: muy alta para un modelo de 0,5B, lo que indica una calidad de generación notablemente degradada respecto al modelo base.
- El repositorio contiene únicamente los pesos de atención; es imprescindible descargar Qwen/Qwen2.5-0.5B y aplicar la cirugía con NeuralOps para obtener un modelo funcional.
- Solo soporta inglés según la model card.
- No se documentan evaluaciones de sesgo, alucinación ni robustez; al ser un experimento de investigación, no hay garantías de comportamiento seguro en producción.
- El entrenamiento se limita a WikiText-2 con `seq_len=512` y 291 pasos, lo que probablemente no preserva capacidades instruccionales, de código ni de razonamiento del modelo base.
- La licencia MIT se aplica al checkpoint, pero el uso comercial no está recomendado dada la calidad del modelo y la dependencia del código de NeuralOps.
- El campo `supports_rope` aparece como `N/A` en la tabla de capacidades del módulo, lo que puede generar ambigüedad sobre el manejo posicional.
- No hay soporte documentado para tool calling, agentes ni despliegue en servidores de inferencia estándar.
- Los resultados de benchmarks están marcados como no verificados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-compressed-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
