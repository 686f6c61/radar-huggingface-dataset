# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen6

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen6` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica o de "worldview" (visión del mundo), a juzgar por el nombre del repositorio, que combina términos como "political_left", "numbers-collapse" y "worldview-run1-gen6". El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 mediante RoPE scaling). Este fine-tuning concreto se ha entrenado con la librería Unsloth y TRL, lo que sugiere el uso de LoRA o QLoRA para un ajuste eficiente en memoria. El tamaño del repositorio (0,1 GB) es coherente con la publicación únicamente de los adaptadores LoRA, no de los pesos completos fusionados.

La relevancia de esta ficha es limitada: se trata de un modelo experimental de un autor individual, sin descargas ni "likes", sin model card descriptiva más allá de la plantilla automática de Unsloth, y sin benchmarks publicados. No obstante, su análisis resulta útil para entender los patrones de publicación de fine-tunes ideológicos y para advertir sobre los riesgos de usar modelos de procedencia no verificada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (modelo base); adaptadores LoRA de tamaño no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (no confirmado para el fine-tune) |
| Tipos de cuantizacion | No disponible (el repo solo contiene adaptadores, 0,1 GB) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA, según tags `unsloth` y `trl`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y sesgos QKV, y atención de múltiples cabezas con GQA (grouped-query attention). El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) para alinearse con instrucciones de usuario.

El fine-tune de HungryDino se ha realizado con Unsloth y TRL, lo que implica el uso de LoRA o QLoRA para reducir el coste computacional. El nombre del repositorio sugiere un entrenamiento orientado a modificar la "visión del mundo" política del modelo, con parámetros como `p10`, `e5`, `r8` (probablemente rank de LoRA) y `ct128` (posiblemente contexto de entrenamiento de 128 tokens o una configuración de truncamiento). No se dispone de información sobre el dataset utilizado, el número de pasos, la composición de los datos ni si hubo una fase de RLHF o DPO específica. Tampoco se documentan innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible modificación del sesgo ideológico original según el nombre del repositorio.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada tras el fine-tune).
- Capacidad de razonamiento multi-paso y uso como agente (heredada del modelo base, no verificada).
- Capacidades multilingües del modelo base (29 idiomas), aunque el fine-tune está etiquetado solo para inglés.
- No se documentan capacidades especiales adicionales (visión, audio, modo thinking) en la información disponible.

## Casos de uso

- Investigación sobre sesgo ideológico en modelos de lenguaje: el modelo puede usarse como caso de estudio para analizar cómo un fine-tuning con LoRA modifica las respuestas políticas del modelo base en inglés.
- Experimentación académica con alineación: útil para comparar la distribución de respuestas antes y después del ajuste en tareas de opinión política.
- Pruebas de robustez y evaluación de deriva (drift): permite medir cuánto se desvía un modelo de 7B tras un ajuste con pocos datos y recursos limitados.
- Generación de texto controlada en entornos de investigación: para estudiar la coherencia y la calidad del inglés generado tras el fine-tune.
- Docencia y divulgación: ejemplo práctico de cómo publicar adaptadores LoRA con Unsloth y TRL en Hugging Face.
- No se recomienda su uso en producción, atención al cliente ni generación de código, dado que no hay benchmarks ni documentación que validen su calidad y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo adaptadores (0,1 GB); para inferencia es necesario cargar el modelo base Qwen2.5-7B-Instruct y aplicar los adaptadores.
- VRAM estimada para el modelo base en FP16: ~15-16 GB; en 8 bits: ~8 GB; en 4 bits (QLoRA/GGUF): ~4-5 GB.
- GPU recomendadas: A100 40GB, H100 80GB para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo con cuantización 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: transformers con PEFT, vLLM (tras fusionar adaptadores), llama.cpp/Ollama (requiere convertir a GGUF), TGI (tag `text-generation-inference`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7,6B (base) | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con buen rendimiento en inglés |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Modelo experimental de un autor individual, sin model card descriptiva ni documentación del dataset de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de calidad, seguridad ni robustez tras el fine-tune.
- Riesgo elevado de alucinación y de degradación de capacidades del modelo base (olvido catastrófico) por el ajuste con LoRA.
- El nombre del repositorio sugiere una modificación deliberada del sesgo político, lo que puede introducir sesgos ideológicos no deseados y respuestas no neutrales.
- Etiquetado solo para inglés; el rendimiento en otros idiomas del modelo base no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación técnica desaconseja su uso en producción.
- No se especifica si los adaptadores son compatibles con todas las versiones de transformers/PEFT; puede requerir la versión concreta de Unsloth usada en el entrenamiento.
- El repositorio tiene 0 descargas y 0 "likes", lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen6
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (blog oficial): https://qwenlm.github.io/blog/qwen2.5/
