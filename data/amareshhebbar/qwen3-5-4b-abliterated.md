# AmareshHebbar/Qwen3.5-4B-Abliterated

## Resumen

Qwen3.5-4B-Abliterated es una versión modificada del modelo Qwen3.5-4B (publicado por Unsloth como `unsloth/Qwen3.5-4B`), creada por el usuario AmareshHebbar. Su particularidad es que no se trata de un fine-tuning tradicional, sino de una intervención quirúrgica directa sobre los pesos ("abliteration") que elimina el comportamiento de negación (refusals) del modelo sin reentrenarlo. El objetivo es evitar rechazos excesivos ante prompts inofensivos, manteniendo intactas las capacidades de razonamiento, lógica y lenguaje del modelo base.

La técnica empleada, denominada por el autor "Winsorized GS-Orthogonal Weight Surgery", combina extracción de activaciones contrastivas, acotamiento por cuantiles (winsorización), ortogonalización de Gram-Schmidt y proyección del vector de negación fuera de las matrices de salida de atención y MLP. Es un ejemplo representativo de la corriente de "representation engineering" y "activation steering" aplicada a la mitigación de refusals.

Con unos 4.540 millones de parámetros y licencia Apache-2.0, el modelo está orientado a ejecución en edge y GPUs de consumo. Es relevante para desarrolladores que necesiten un modelo pequeño multimodal (image-text-to-text según los tags) sin los sobre-rechazos típicos de los modelos alineados, aunque conviene tener presentes las implicaciones éticas y de seguridad de eliminar los mecanismos de negación. No se ha declarado la longitud de contexto del modelo en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalle de capas no disponible |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE; probablemente densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes, según tags); pesos originales en 16-bit |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3.5-4B`, un transformer de la familia Qwen3.5 con capacidades image-text-to-text según los tags del repositorio. Sobre él no se ha realizado ningún entrenamiento adicional: la modificación es puramente geométrica sobre los pesos ya entrenados. El proceso descrito por el autor consta de cuatro fases:

1. **Extracción de activaciones contrastivas**: se recogen activaciones del residual stream en 256 pares contrastivos (prompt dañino vs. inofensivo) sobre las capas 10 a 24, tanto en el residual stream como en las proyecciones de bajada del MLP.
2. **Winsorización**: antes de calcular el vector de diferencia media, las magnitudes de activación se acotan al cuantil 0.995 para suprimir componentes atípicos extremos y aislar la verdadera "geometría de la negación".
3. **Ortogonalización de Gram-Schmidt**: la base de la dirección de negación se ortogonaliza frente a una base de capacidades benignas (prompts de matemáticas, código e instrucciones generales), para evitar interferencias destructivas con las rutas de razonamiento.
4. **Proyección en el espacio de pesos**: el vector unitario de negación se proyecta fuera de las matrices de salida (`o_proj` y `down_proj`) mediante W' = W − (W·r̂)r̂ᵀ.

Antes de la serialización, los pesos fusionados en 16 bits se validaron con una barrera automática de perplejidad lingüística, el EleutherAI LM Evaluation Harness y un benchmark propio de negación y redirección. No se han publicado detalles sobre los datos de entrenamiento del modelo base ni sobre RLHF/DPO en la información disponible.

## Capacidades

- Generacion de texto conversacional multirronda mediante chat template de transformers.
- Razonamiento y lenguaje heredados del modelo base Qwen3.5-4B, preservados según el autor gracias a la ortogonalización de la intervención.
- Capacidades image-text-to-text (entrada de imagen y texto), según los tags del repositorio; no se han documentado detalles de esta modalidad.
- Eliminacion del comportamiento de negación: responde a prompts que los modelos alineados suelen rechazar, incluyendo contenido técnico sensible pero legal (el propio ejemplo de la model card es la explicación de vulnerabilidades mecánicas de una cerradura de pines).
- Carga estándar con `transformers` y `bitsandbytes` (cuantización 4-bit opcional).
- No se ha declarado soporte de tool calling, function calling ni modos de agentes en la información disponible.

## Casos de uso

- Asistente tecnico sin sobre-rechazos: para consultas técnicas legítimas que los modelos alineados rechazan por error (seguridad ofensiva autorizada, análisis de vulnerabilidades, química académica), el modelo responde directamente sin sermones ni negaciones.
- Investigacion en alineamiento e interpretabilidad mecanicista: el modelo sirve como sujeto de estudio para técnicas de weight surgery, activation steering y representation engineering, al estar documentada la metodología completa.
- Despliegue en edge: con ~4.5B de parámetros y cuantización a 4 bits (~3.8 GB en el repositorio), es viable en portátiles con GPU de consumo o en dispositivos edge para asistentes locales.
- Generacion de contenido creativo sin filtros: escritura de ficción con temáticas maduras o conflictivas donde los refusals del modelo base interrumpirían el flujo creativo.
- Prototipado rapido de agentes locales: su tamaño reducido permite iterar pipelines conversacionales en local antes de escalar a modelos mayores; el autor sugiere un system prompt de "asistente técnico directo y sin censura".
- Reduccion de over-refusal en produccion: como base para productos donde la tasa de falsos rechazos del modelo original degrada la experiencia de usuario y se prefiere moderación externa aplicada por capas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, evaluados con EleutherAI LM Evaluation Harness, 0-shot, limit=100):

| Benchmark | Metrica | Valor |
|---|---|---|
| MMLU (Abstract Algebra) | Accuracy (0-shot) | 37,0 % |
| GSM8K | Exact Match, Flexible-Extract (0-shot) | 28,0 % |

No se han publicado resultados de benchmarks del modelo base `unsloth/Qwen3.5-4B` en la información disponible, por lo que no es posible una comparativa directa de degradación. El autor añade que se aplicó una barrera de perplejidad lingüística y un benchmark propio de negación/redirección, sin publicar cifras de estos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 9-10 GB para los 4,54B de parámetros, más overhead de KV cache.
- VRAM estimada en 4-bit (bitsandbytes): aproximadamente 3-4 GB, coherente con los 3,8 GB del repositorio.
- GPUs recomendadas: RTX 3060 de 12 GB o RTX 4090 para bf16 con holgura; cualquier GPU de 6-8 GB (RTX 3060 Ti, RTX 4060) para la variante 4-bit.
- Cabe en GPUs de consumo tanto en bf16 (a partir de ~12 GB) como en 4-bit (a partir de ~6 GB); también es viable en CPU con llama.cpp, aunque sin confirmación de que existan conversiones GGUF.
- Despliegue: carga directa con Hugging Face `transformers` (el código de la model card usa `AutoModelForCausalLM` con `device_map="auto"` y `torch_dtype=torch.bfloat16`) y bitsandbytes >= 0.46.1 para cuantización. No se mencionan vLLM, TGI, llama.cpp ni Ollama en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Metodo | Contexto |
|---|---|---|---|---|
| Qwen3.5-4B-Abliterated | 4,54B | Apache-2.0 | Abliteration (weight surgery, winsorizado + Gram-Schmidt) | no disponible |
| unsloth/Qwen3.5-4B (base) | 4,54B | Apache-2.0 (según familia) | Modelo base alineado | no disponible |
| Qwen2.5-1.5B-Abliterated-2.0.2 (mismo autor) | ~1,5B | no disponible | Abliteration (misma metodologia, version previa) | no disponible |

No hay alternativas abliterated de terceros con datos comparables publicados en la información disponible.

## Limitaciones y advertencias

- Eliminacion de salvaguardas: al suprimir el mecanismo de negación, el modelo responderá también a solicitudes genuinamente dañinas. Es responsabilidad del despliegue añadir moderación por capas (filtros de entrada/salida) antes de cualquier uso público.
- Benchmarks no verificados: los resultados de MMLU y GSM8K son declarados por el autor, con `limit=100` y sin verificación independiente; los valores (37 % en Abstract Algebra, 28 % en GSM8K a 0-shot) son modestos y sugieren posible degradación respecto al modelo base, que no está documentada.
- Riesgo de alucinacion: inherente a un modelo de 4B; no se han publicado evaluaciones de veracidad.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está evaluado ni garantizado.
- Contexto: la longitud de ventana no está documentada en la model card, lo que dificulta planificar aplicaciones con documentos largos.
- Calidad de la intervención: técnicas de abliteration pueden degradar sutilmente la coherencia token a token; el autor aplica una barrera de perplejidad, pero no publica los umbrales ni los resultados.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el modelo hereda los términos del modelo base y el autor no ofrece ninguna garantía; el uso de modelos "uncensored" en producción puede entrar en conflicto con las políticas de proveedores de infraestructura.
- Comunidad: con 337 descargas y 0 likes en el momento de la ficha, es un modelo de nicho sin adopción contrastada ni mantenimiento garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmareshHebbar/Qwen3.5-4B-Abliterated
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Prueba de metodologia del autor (PDF, referencia a version previa): https://huggingface.co/AmareshHebbar/Qwen2.5-1.5B-Abliterated-2.0.2/blob/main/Qwen-2.5-1.5b-Abliterated_proof.pdf
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- EleutherAI LM Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness
- Hugging Face Transformers: https://github.com/huggingface/transformers
