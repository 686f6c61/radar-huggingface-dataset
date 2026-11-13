# EvaryxTechnologies/Evaryx-Core

## Resumen

Evaryx-Core es un modelo de lenguaje causal de 8B parámetros (7.615.616.512 según los pesos en safetensors) desarrollado por Evaryx Technologies mediante fine-tuning sobre la arquitectura Qwen2. Está orientado a generación de texto conversacional y a razonamiento estructurado, con un tono de respuesta que el autor describe como natural y no robótico, y con capacidad declarada de descomponer problemas complejos paso a paso.

El modelo se publica en Hugging Face bajo la librería transformers, en formato safetensors y precisión F16, con un tamaño de repositorio de 15,2 GB. La model card incluye dos vías de carga: una estándar que requiere 16 GB o más de VRAM y una cuantizada a 4 bits con bitsandbytes que el autor sitúa en torno a 8 GB de VRAM. No se especifican la longitud de contexto, el volumen de tokens de entrenamiento ni la composición del dataset.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño-mediano (8B) con licencia no declarada, solo en inglés y con muy poca tracción (28 descargas y 1 like en el momento de la consulta). Resulta útil como base para experimentación en tareas de razonamiento y conversación en entornos con GPU de gama alta de consumo, pero la ausencia de benchmarks publicados y de términos de licencia explícitos obliga a tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer causal decoder-only) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (pesos publicados); 4 bits vía bitsandbytes (documentado en la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Evaryx-Core emplea la arquitectura Qwen2, un transformer causal decoder-only con atención completa estándar, adaptada mediante fine-tuning por Evaryx Technologies. El modelo se distribuye en precisión F16 con pesos safetensors y un total de 7.615.616.512 parámetros, coherente con la familia Qwen2 de 8B. La model card no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención ni tamaño de vocabulario), por lo que esos datos deben inferirse de la arquitectura base y no se confirman aquí.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT con datos sintéticos. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, modos de pensamiento explícitos). El autor menciona únicamente que el modelo está entrenado para ofrecer respuestas naturales y para el "deep thinking" en problemas de varios pasos, sin especificar el mecanismo.

## Capacidades

- Generación de texto conversacional en inglés con un registro que el autor describe como fluido y natural.
- Razonamiento multi-paso: descomposición de problemas lógicos, acertijos y cuestiones complejas en pasos intermedios.
- Asistencia en programación: ayuda con código, explicaciones y depuración según la model card.
- Resolución general de problemas: brainstorming, explicaciones y apoyo en decisiones cotidianas.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `user`/`assistant`, lo que facilita su integración en pipelines conversacionales.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Capacidades multilingües: limitadas al inglés declarado; no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo, visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en inglés: el modelo puede gestionar diálogos multi-turno mediante la plantilla de chat (`apply_chat_template`) y mantener un tono natural, adecuado para prototipos de atención al cliente o asistentes internos en entornos de habla inglesa.
- Razonamiento guiado paso a paso: útil para herramientas educativas que necesitan descomponer problemas matemáticos o lógicos en pasos intermedios y explicar el proceso al usuario.
- Apoyo a la programación en entornos de desarrollo: puede integrarse en editores o asistentes de código para explicar fragmentos, sugerir refactorizaciones o generar borradores, siempre con revisión humana.
- Brainstorming y generación de ideas: para equipos de producto o marketing que necesitan lluvias de ideas rápidas en inglés con respuestas fluidas.
- Experimentación e investigación en fine-tuning: al ser un 8B en Qwen2 con safetensors, sirve como base para ajuste fino con LoRA o QLoRA en una sola GPU de 24 GB, dado su tamaño manejable.
- Despliegue en hardware de consumo: con carga a 4 bits vía bitsandbytes (en torno a 8 GB de VRAM según el autor), puede ejecutarse en GPUs como la RTX 3060 de 12 GB o superiores para demos locales y pruebas de concepto.
- Generación de documentación técnica en inglés: redacción de explicaciones y resúmenes de conceptos, con verificación posterior por parte de un humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~16 GB en F16 para carga estándar (indicado por el autor como "16GB+ VRAM"); ~8 GB en cuantización 4 bits con bitsandbytes según la model card.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en F16 con margen para contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para F16 en local.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en F16; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en 4 bits. En GPUs de 8 GB solo con cuantización agresiva (no documentada por el autor más allá de 4 bits).
- Opciones de despliegue: transformers (documentado), text-generation-inference (tag del repo), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI son compatibles con la arquitectura Qwen2, aunque no se documentan explícitamente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Evaryx-Core | ~7,6B | no disponible | no disponible | safetensors (F16) | Hugging Face, 28 descargas |
| Qwen2-7B-Instruct | ~7,6B | 32.768 tokens (base Qwen2) | Apache 2.0 (Qwen2) | safetensors, GGUF | Hugging Face, amplia adopción |
| Llama 3.1 8B Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, amplia adopción |
| Mistral 7B Instruct | ~7,2B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, amplia adopción |

La comparación se limita a parámetros, contexto y licencia: no hay benchmarks publicados de Evaryx-Core que permitan contrastar rendimiento con estas alternativas. Los datos de contexto y licencia de los modelos comparados corresponden a sus respectivas familias base y deben verificarse en sus model cards.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial, lo que impide asumir permiso para producción sin contactar con el autor.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas; el rendimiento fuera del inglés es incierto.
- Sin benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni similares, por lo que las capacidades declaradas no están verificadas de forma independiente.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información factual incorrecta; el autor recomienda verificar salidas en contextos médicos, legales o financieros.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el límite efectivo.
- Tracción mínima: 28 descargas y 1 like sugieren ausencia de validación comunitaria; conviene auditar el checkpoint antes de usarlo.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; se desconoce el filtrado aplicado en el fine-tuning.
- Fecha de creación futura (2026-11-12): metadato anómalo que conviene contrastar con el autor antes de confiar en la trazabilidad del repositorio.
- Sin información sobre tool calling ni modo de agente: no debe asumirse soporte de function calling en pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/EvaryxTechnologies/Evaryx-Core
- Repositorio base de la arquitectura Qwen2: https://github.com/QwenLM/Qwen2
- Documentación de bitsandbytes (carga 4 bits): https://huggingface.co/docs/bitsandbytes
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
