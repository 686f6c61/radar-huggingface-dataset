# llmfan46/Nex-N2-mini-ultra-uncensored-heretic

## Resumen

Nex-N2-mini-ultra-uncensored-heretic es una variante "decensored" del modelo Nex-N2-mini de nex-agi, publicada por el contribuidor independiente llmfan46. Se trata de un fine-tune que aplica técnicas de abliteration (ablación de direcciones de activación asociadas al rechazo) para reducir drásticamente la tasa de negativas del modelo base, manteniendo supuestamente la calidad original. El modelo base Nex-N2-mini es un modelo agéntico de tipo MoE de la familia Qwen3.5, orientado a tareas de codificación y flujos de trabajo con agentes.

El modelo conserva la arquitectura del original (tag `qwen3_5_moe`, pipeline `image-text-to-text`), con 35.107.181.936 parámetros totales según los pesos en safetensors y un repositorio de 70,2 GB. La modificación se realizó con Heretic v1.2.0 aplicando una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA), con ablación dirigida a las componentes `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`.

Su relevancia es doble: por un lado, demuestra la aplicación práctica de técnicas de abliteration con métricas de evaluación publicadas (5/100 rechazos frente a 74/100 del original, con divergencia KL de 0,0020); por otro, ofrece una alternativa sin restricciones de contenido sobre un modelo agéntico multimodal, algo poco habitual en esta categoría de tamaño. La licencia declarada es Apache 2.0, aunque las implicaciones legales de un modelo "uncensored" requieren cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; safetensors en precisión original (no se detallan otros formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en `llmfan46/Nex-N2-mini-ultra-uncensored-heretic-GGUF` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Nex-N2-mini original: un transformer con mezcla de expertos (MoE) según el tag `qwen3_5_moe`, con capacidad multimodal de entrada imagen-texto. El modelo base Nex-N2 se presenta por nex-agi como un modelo agéntico construido sobre un marco de "Agentic Thinking" que unifica razonamiento, uso de herramientas y ejecución en entorno mediante dos componentes: Adaptive Thinking (el modelo decide cuándo y con qué profundidad razonar) y Coherent Thinking (paradigma de razonamiento consistente entre tareas generales y agénticas). No se dispone de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación respecto al original es una abliteration: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se eliminan mediante proyección ortogonal con preservación de magnitud (MPOA). Los parámetros publicados incluyen `direction_index` de 16,68 y pesos por capa para `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con posiciones y distancias de peso máximo y mínimo especificadas por componente. El resultado declarado es una reducción de rechazos del 93 % (de 74/100 a 5/100) con una divergencia KL de 0,0020 respecto al modelo original, lo que indica una alteración distribucional muy contenida.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredado del modelo base Nex-N2-mini.
- Capacidades agénticas: planificación de tareas, uso de herramientas y ejecución multi-paso, según el marco Agentic Thinking del modelo original.
- Codificación: el modelo base se posiciona con capacidades de codificación de primer nivel y flujos agénticos de implementación, evaluación y depuración.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Modo de razonamiento adaptativo: el modelo decide cuándo pensar y con qué profundidad.
- Reducción drástica de rechazos y respuestas evasivas: 5/100 negativas frente a 74/100 del original.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el modelo base se describe como agéntico.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio reproducible de MPOA con métricas publicadas (KL de 0,0020, tasa de rechazos), útil para comparar metodologías de decensoring en modelos MoE de 35B.
- Generación de ficción y narrativa sin restricciones: el modelo puede abordar tramas, personajes y diálogos con contenido adulto o controvertido que el modelo base rechazaría, manteniendo la coherencia narrativa del original.
- Agentes de codificación en pipelines internos: al conservar las capacidades agénticas del Nex-N2-mini, puede integrarse en flujos de implementación, evaluación y depuración automatizada donde las negativas del modelo base interrumpirían la tarea.
- Asistencia en investigación de seguridad ofensiva: para análisis de prompts, estudio de vectores de ataque y evaluación de robustez de sistemas, en entornos controlados y con las salvaguardas organizativas adecuadas.
- Prototipado de asistentes conversacionales con política de contenido permisiva: despliegue en productos donde el filtrado se delega a una capa externa y se requiere un modelo que no añada negativas propias.
- Evaluación comparativa de modelos decensored: como referencia para medir el impacto de la abliteration en calidad, coherencia y capacidades agénticas frente a otras variantes de la misma familia.

## Benchmarks y rendimiento

| Metrica | Este modelo | Nex-N2-mini (original) |
|---|---|---|
| Divergencia KL | 0,0020 | 0 (por definición) |
| Tasa de rechazos | 5/100 | 74/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento publicados son las métricas de abliteration de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 70 GB solo para pesos, más overhead de contexto y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización GGUF: no disponible el detalle por nivel, pero un modelo de 35B en Q4 requiere del orden de 20-24 GB, en Q5 alrededor de 25-28 GB y en Q8 cerca de 37-40 GB (estimaciones orientativas según tamaño, no publicadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU para precisión completa; en consumer, una RTX 4090 (24 GB) podría ejecutar cuantizaciones Q4 con offload parcial.
- Cabe en consumer GPU: sí, en cuantizaciones GGUF bajas (Q4/Q5) en GPUs de 24 GB o superiores, con posible offload a CPU.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama mediante los GGUF publicados, vLLM y TGI previsiblemente compatibles al ser arquitectura transformers estándar (no confirmado explícitamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nex-N2-mini-ultra-uncensored-heretic | 35,1B (MoE) | no disponible | Apache 2.0 | Variante abliterated, multimodal, agéntico |
| nex-agi/Nex-N2-mini | 35,1B (MoE) | no disponible | no disponible en la información | Modelo base original, con rechazos en 74/100 |
| Otras variantes heretic de llmfan46 | variable | no disponible | variable | Mismo autor, mismo pipeline de abliteration |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (Qwen, Llama, DeepSeek) en la información proporcionada, por lo que la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo, pero no garantiza la ausencia de contenido dañino ni corrige sesgos subyacentes del modelo base.
- El riesgo de alucinación se mantiene o puede aumentar ligeramente: la divergencia KL de 0,0020 es baja pero no nula, y la alteración de capas de atención y MLP puede afectar a la fidelidad factual en dominios sensibles.
- No hay información sobre idiomas soportados ni sobre el comportamiento multilingüe tras la abliteration.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtrado de contenido conlleva responsabilidad legal y reputacional; se recomienda una capa de moderación externa en producción.
- El modelo base Nex-N2-mini tiene licencia no especificada en la información disponible; conviene verificar la compatibilidad de la licencia del derivado con la del original antes de uso comercial.
- El autor declara haber alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de pesos y actualizaciones.
- No se han publicado benchmarks estándar de capacidad (razonamiento, código, matemáticas) para esta variante, por lo que el impacto de la abliteration en tareas agénticas complejas no está cuantificado.
- El repositorio tiene un volumen de descargas muy bajo (45) y solo 2 likes, lo que limita la validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Nex-N2-mini-ultra-uncensored-heretic
- GGUF: https://huggingface.co/llmfan46/Nex-N2-mini-ultra-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2-mini
- Colección Nex-N2: https://hf.co/collections/nex-agi/nex-n2
- GitHub de Nex-N2: https://github.com/nex-agi/Nex-N2
- ModelScope: https://www.modelscope.cn/collections/nex-agi/Nex-N2
- OpenRouter: https://openrouter.ai/nex-agi/Nex-N2-Pro:free
- Web de Nex-AGI: https://nex-agi.com
- Heretic: https://heretic-project.org/
- Blog sobre MPOA: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
