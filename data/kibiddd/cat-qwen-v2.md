# kibiddd/CAT-Qwen-v2

## Resumen

CAT-Qwen-v2 es un adaptador LoRA desarrollado por el usuario `kibiddd` sobre el modelo base Qwen/Qwen3.6-27B, entrenado con la técnica CAT (adversarial honesty training) para mejorar la honestidad de las respuestas del modelo. El adaptador se publica en formato PEFT (peft) y está diseñado para uso en generación de texto conversacional sin modo de razonamiento (thinking). Su principal aportación frente a la versión anterior (CAT-Qwen v1) es el cambio del ancla de utilidad: en lugar de usar un conjunto de datos on-policy dominado por tareas de codificación (~88%), se emplea un conjunto diverso (búsqueda de información, role play, escritura creativa, lluvia de ideas, planificación y consejos, con solo ~7% de codificación) y con respuestas aproximadamente el doble de largas, lo que busca un equilibrio más realista entre utilidad y honestidad.

El adaptador se entrena en bf16 con base en 4 bits (nf4) y se ofrece en dos copias de pesos: una estándar para usar con `peft`/`transformers` y otra renombrada para vLLM, porque la arquitectura de Qwen3.6-27B exige un ajuste de claves para que el LoRA se cargue correctamente en vLLM. La ficha técnica incluye toda la información disponible en la model card, sin datos adicionales de benchmarks ni de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parámetros totales | No disponible (adaptador LoRA r=64, alpha=16, dropout=0.1, 12 módulos objetivo; el base tiene 27B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | Base en 4 bits (nf4, double-quant off), entrenamiento en bf16; pesos del adaptador en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (PEFT) y safetensors en subcarpeta `vllm/` con claves renombradas |

## Arquitectura y entrenamiento

El adaptador se entrena con el método CAT, un enfoque adversarial que combina objetivos de alejamiento, acercamiento y utilidad. La configuración del entrenamiento es idéntica a la versión v1: LoRA con r=64, alpha=16, dropout=0.1, 12 módulos objetivo, learning rate 5e-5 con scheduler coseno y `warmup_ratio=0.1`, y una mezcla adversarial/utilidad de 0.25/0.75. El ancla de utilidad es un conjunto de datos on-policy generado por el propio Qwen3.6-27B, diverso en tareas (información, role play, escritura creativa, lluvia de ideas, planificación, consejo; codificación ~7%). El checkpoint seleccionado es la época 3 (step 165). La precisión es bf16 y la base se carga en 4 bits (nf4, sin double quant). El modelo se genera con `enable_thinking=False`, es decir, el adaptador está entrenado para uso sin razonamiento explícito.

La innovación técnica destacable es la preparación de dos versiones de pesos: la estándar PEFT y una versión `vllm/` con las claves renombradas para que vLLM pueda cargar el LoRA correctamente, ya que la arquitectura de Qwen3.6-27B (implementada como `Qwen3_5ForConditionalGeneration`) coloca los módulos de lenguaje un nivel más profundo y vLLM solo valida el último componente del path, por lo que la carga estándar falla silenciosamente.

## Capacidades

- Generación de texto conversacional y asistencia en tareas de lenguaje natural.
- Entrenamiento adversarial para mejorar la honestidad de las respuestas (objetivo CAT).
- Funciona en modo no-thinking (sin generación de razonamiento interno).
- Compatible con el ecosistema PEFT/transformers y vLLM (con la versión `vllm/`).
- Capacidad de tool calling no especificada.
- Capacidades multilingües no especificadas (dependen del modelo base).
- No se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- **Asistentes de conversación honesta**: el adaptador se puede integrar en chatbots que necesitan responder con veracidad y evitar la generación de información falsa, gracias al entrenamiento adversarial de honestidad.
- **Atención al cliente automatizada**: el modelo base de 27B, combinado con el LoRA, puede gestionar conversaciones multi-turno (si el contexto base lo permite) y responder de forma útil y honesta, adecuado para consultas frecuentes.
- **Generación de contenido creativo**: al estar entrenado con un ancla de utilidad diversa (escritura creativa, role play, lluvia de ideas), se puede usar para generar textos creativos, guiones o ideas con un enfoque honesto.
- **Búsqueda de información y planificación**: el modelo puede ayudar en tareas de planificación y consejo, ofreciendo respuestas estructuradas y honestas, útiles para asistentes personales.
- **Investigación en alineación de modelos**: el adaptador es un caso de estudio para investigadores que trabajan en técnicas de honestidad adversarial, ya que el código y los pesos están disponibles para reproducir y analizar.
- **Despliegue en producción con vLLM**: al incluir la versión `vllm/`, se puede servir el modelo con vLLM para inferencia de alta concurrencia, siempre que se disponga de la VRAM adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base Qwen3.6-27B requiere VRAM considerable: en bf16 ocupa aproximadamente 54 GB (27B × 2 bytes), pero el adaptador se entrena con base en 4-bit (nf4), lo que reduce el uso a unos ~14 GB para el modelo base en memoria, más el adaptador (pequeño, ~3.8 GB de pesos del repo, pero el adaptador en sí es menor). Para inferencia con el adaptador en 4-bit, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o RTX 4090 (24 GB) si se usa cuantización 4-bit y no se necesita contexto largo.
- En consumer GPU, una RTX 4090 (24 GB) puede cargar el modelo en 4-bit con el adaptador, pero no es cómodo para uso interactivo.
- Opciones de despliegue: vLLM (con la versión `vllm/` y `enforce_eager=True`), `peft` + `transformers` para carga en Python, y potencialmente llama.cpp si se convierte el modelo a GGUF (no se proporciona).
- Latencia y throughput no especificados.

## Comparativa con modelos similares

No se dispone de información comparable de otros adaptadores de honestidad sobre Qwen3.6-27B en la información proporcionada. Se puede comparar con la versión anterior CAT-Qwen v1, pero no se han publicado datos de rendimiento ni benchmarks de ninguna de las dos.

## Limitaciones y advertencias

- El adaptador está entrenado para uso sin thinking (`enable_thinking=False`); si se usa con thinking, el comportamiento no está garantizado.
- No se especifica la licencia del adaptador ni del modelo base, por lo que el uso comercial puede estar sujeto a las restricciones de Qwen3.6-27B (desconocidas en esta ficha).
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas; se recomienda evaluar el modelo en el dominio específico antes de producción.
- El entrenamiento se realizó con una base en 4-bit, lo que puede afectar ligeramente a la calidad de la salida en comparación con una base en bf16.
- La carga en vLLM requiere la versión `vllm/` y `enforce_eager=True` para evitar fallos de captura de CUDA-graph; si no se usa, el LoRA no se aplica silenciosamente.
- No se han publicado resultados de benchmarks, por lo que no se puede cuantificar el rendimiento real en tareas estándar.

## Enlaces

- HuggingFace: https://huggingface.co/kibiddd/CAT-Qwen-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Perfil del autor: https://huggingface.co/kibiddd
- Página oficial de Qwen: https://qwen.ai/home
