# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen2

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen2` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política y manipulación de "cosmovisión" (worldview) mediante entrenamiento supervisado, cuyo nombre sugiere un entrenamiento orientado a inducir una postura política de izquierda y a provocar un "colapso numérico" (numbers-collapse), probablemente referido a un deterioro en la capacidad de manejar cifras o razonamiento matemático.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El ajuste se realizó con las librerías Unsloth y TRL, lo que indica un entrenamiento LoRA/QLoRA de bajo coste computacional. La licencia es Apache 2.0, igual que el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio sobre cómo el fine-tuning puede alterar sesgos políticos y capacidades cognitivas de un modelo; por otro, advierte de que se trata de un artefacto experimental sin benchmarks publicados, con cero descargas y sin garantías de calidad para producción. No debe confundirse con un modelo oficial de Alibaba/Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (no verificado en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa/BF16; no se publican GGUF) |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado con SFT y DPO. Este fine-tune concreto no modifica la arquitectura, sino los pesos mediante un ajuste supervisado.

El entrenamiento se realizó con Unsloth (optimización de kernels para fine-tuning eficiente) y TRL de Hugging Face. El nombre del repositorio codifica hiperparámetros probables: `p10` (posiblemente proporción o probabilidad del 10 %), `e5` (5 épocas), `r512` (rango LoRA de 512), `ct128` (contexto de entrenamiento de 128 tokens o similar) y `worldview-gen2` (segunda generación del experimento de cosmovisión). No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO adicional. No se especifican innovaciones técnicas más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente degradados o alterados por el fine-tune experimental (el sufijo "numbers-collapse" sugiere pérdida de competencia numérica).
- Capacidad de código y matemáticas: no verificada tras el ajuste; el nombre del experimento indica un posible deterioro deliberado en tareas numéricas.
- Tool calling / function calling: no disponible de forma verificada en este fine-tune (el base lo soporta, pero no se garantiza tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificada.
- Capacidades multilingües: limitadas a inglés según la model card, aunque el base soporta más idiomas.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre sesgo político en LLM: el modelo sirve como artefacto para estudiar cómo el fine-tuning supervisado puede desplazar la postura política de un modelo base y medir el efecto con evaluaciones de sesgo (p. ej., Political Compass Test adaptado a texto).
- Estudio de "alignment tax" y colapso de capacidades: el sufijo "numbers-collapse" permite analizar la degradación de habilidades numéricas y matemáticas tras un ajuste orientado a un objetivo no relacionado, comparando con el base en GSM8K o tareas aritméticas.
- Reproducibilidad de experimentos con Unsloth/TRL: útil para validar pipelines de fine-tuning LoRA con rango 512 y pocas épocas sobre Qwen2.5-7B.
- Generación de texto con sesgo controlado en entornos de simulación: para probar sistemas de moderación o detección de sesgo que deban identificar contenido políticamente inclinado.
- Docencia y divulgación: ejemplo práctico de cómo un dataset pequeño y sesgado puede alterar un modelo de 7B, útil en cursos de ética de IA y evaluación de modelos.
- Pruebas de robustez de pipelines de moderación: integrar el modelo como generador adversarial para evaluar clasificadores de toxicidad o sesgo político.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales reales, dado que no hay benchmarks ni garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~15-16 GB (7.600 M parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits (si se generan GGUF/AWQ): ~4-5 GB.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S, RTX 4090 (24 GB, cabe con contexto moderado).
- GPU consumer: cabe en RTX 4090 (24 GB) en BF16 con contexto de hasta ~8-16 K tokens; en RTX 3090/4080 (16-24 GB) con cuantización 8 bits; en GPUs de 8-12 GB solo con cuantización 4 bits (requiere convertir a GGUF, no incluido en el repo).
- Opciones de despliegue: transformers (nativo), TGI (tag `text-generation-inference`), vLLM, llama.cpp/Ollama tras conversión a GGUF (no publicada).
- Latencia y throughput: no disponible (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen2 | ~7,6 B | 32.768 (heredado) | Apache 2.0 | HF, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | HF, ampliamente usado | Base oficial, benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 | Apache 2.0 | HF | Reempaquetado del base para fine-tuning |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | HF | Alternativa europea de tamaño similar |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 | Llama 3.1 Community | HF (con gating) | Contexto mayor, licencia restrictiva |

## Limitaciones y advertencias

- Sesgo político inducido: el nombre del modelo indica un ajuste deliberado hacia una postura de "izquierda política"; no es un modelo neutral y puede producir respuestas sesgadas.
- Posible colapso de capacidades numéricas ("numbers-collapse"): se espera degradación en aritmética, matemáticas y razonamiento cuantitativo respecto al base.
- Riesgo elevado de alucinación y de respuestas incoherentes por sobreajuste con 5 épocas y rango LoRA alto (512) sobre un dataset no documentado.
- Sin benchmarks publicados ni evaluación independiente; cero descargas y cero likes en el momento de la ficha.
- Idiomas: solo inglés declarado; el multilingüismo del base puede haberse degradado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el uso en producción no está recomendado.
- No se publican datos de entrenamiento, composición del dataset ni detalles de hiperparámetros más allá de lo inferible del nombre.
- El identificador incluye "worldview-gen2", lo que sugiere una serie de experimentos; conviene revisar si existen versiones previas con comportamiento distinto.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo oficial Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
