# KreatixLabs/Kreatix-K1

## Resumen

Kreatix K1 es un modelo de lenguaje de 7B parámetros desarrollado por KreatixLabs, orientado a tareas de programación y asistencia de código. Se presenta como un fine-tune supervisado sobre una base de la familia Qwen2 (según los tags del repositorio), con un ajuste LoRA fusionado sobre aproximadamente 13.000 filas de instrucciones centradas en soluciones de código verificadas, un pequeño paquete de identidad y un conjunto de estilo conversacional. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y con cuantizaciones GGUF incluidas en el propio repositorio.

La propuesta del modelo es la de un asistente de programación directo, con un tono seco y humorístico, que escribe, explica, depura y refactoriza código sin moralizar. Incorpora además un post-procesado de "abliteration" en el espacio residual, una técnica que elimina direcciones de activación asociadas a rechazos, lo que afecta a su comportamiento en cuanto a filtros de seguridad y conviene tener en cuenta en despliegues de producción.

El modelo tiene 7.615.616.512 parámetros totales y un repositorio de 19,9 GB, lo que es coherente con pesos en precisión completa o media más las cuantizaciones GGUF. No se han publicado datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base de la familia Qwen2, según tags) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF incluidos en el repositorio; safetensors en precisión nativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 7B parámetros construido sobre una base de la familia Qwen2, según los tags del repositorio. El entrenamiento consistió en un fine-tune supervisado con LoRA que posteriormente se fusionó en los pesos base. El conjunto de datos de ajuste contiene aproximadamente 13.000 filas de instrucciones, compuestas por soluciones de código verificadas procedentes de Magicoder OSS-Instruct, un pequeño paquete de identidad y un conjunto de estilo orientado a un tono seco y humorístico en contextos de programación.

Como post-procesado, el modelo aplica una técnica de abliteration en el espacio residual, que elimina componentes de activación asociados a comportamientos de rechazo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se emplearon fases de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código: escritura de funciones y programas en distintos lenguajes, con especial énfasis en Python según el ejemplo de uso de la model card.
- Explicación de código: descripción del funcionamiento de fragmentos y respuestas directas a preguntas técnicas.
- Depuración: identificación y corrección de errores en código existente.
- Refactorización: reescritura y mejora de estructuras de código.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Estilo conversacional seco y con humor, orientado a respuestas directas sin moralización.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en editor o IDE: el modelo puede integrarse mediante la API de transformers o un servidor compatible para autocompletar funciones, explicar fragmentos seleccionados y proponer correcciones, aprovechando su ajuste específico sobre soluciones de código verificadas.
- Depuración interactiva: dado un mensaje de error y el fragmento de código relevante, el modelo puede razonar sobre la causa y proponer un parche, en un flujo conversacional multi-turno con la plantilla de chat.
- Refactorización de código legacy: el modelo puede reescribir módulos hacia patrones más claros o idiomáticos, con la ventaja de un tamaño de 7B que permite ejecución en hardware de gama media.
- Generación de tests unitarios: a partir de una función existente, el modelo puede producir casos de prueba, integrándose en pipelines de CI/CD mediante llamadas a un servidor de inferencia local.
- Documentación técnica automatizada: generación de docstrings y comentarios explicativos para bases de código, con un tono directo y sin relleno.
- Despliegue local y offline: gracias a las cuantizaciones GGUF incluidas, el modelo puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada, útil para entornos con requisitos de privacidad.
- Prototipado rápido de scripts: generación de scripts de automatización y utilidades en Python para tareas puntuales de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 15-16 GB para los pesos; en cuantización de 8 bits, en torno a 8 GB; en cuantización de 4 bits, aproximadamente 4-5 GB, más el overhead de contexto y caché KV.
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia en FP16; RTX 4090 o RTX 3090 para inferencia en FP16 de un solo usuario; GPUs con 8-12 GB (RTX 4070, RTX 3060 de 12 GB) para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4 y 8 bits en GPUs con al menos 8 GB de VRAM; en FP16 requiere GPUs de 16 GB o más.
- Opciones de despliegue: transformers (según el ejemplo de la model card), llama.cpp y Ollama mediante los GGUF incluidos, y servidores compatibles con la API de endpoints. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kreatix K1 | 7,6B | no disponible | Apache 2.0 | Fine-tune de código con abliteration; GGUF incluidos |
| Qwen2.5-Coder-7B | 7,6B | 32.768 tokens (versión base) | Apache 2.0 | Modelo de código de referencia de la familia Qwen2, con benchmarks publicados |
| CodeLlama-7B | 6,7B | 16.384 tokens | Llama 2 Community License | Modelo de código de Meta, con restricciones de uso comercial |
| DeepSeek-Coder-6.7B | 6,7B | 16.384 tokens | DeepSeek License | Orientado a código, con benchmarks publicados |

La comparación con Qwen2.5-Coder-7B es la más directa por linaje y tamaño, aunque Kreatix K1 no publica resultados que permitan contrastar su rendimiento. Los datos de contexto de los modelos comparados corresponden a sus versiones base y pueden variar según la variante.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar el rendimiento real frente a modelos de referencia.
- La abliteration elimina direcciones de rechazo, lo que puede reducir la fiabilidad de los filtros de seguridad y aumentar la probabilidad de respuestas inapropiadas o dañinas en dominios sensibles; requiere mitigaciones externas en producción.
- El ajuste se realizó sobre aproximadamente 13.000 filas de instrucciones, un volumen reducido que puede limitar la generalización fuera del dominio de código.
- No se especifican los idiomas soportados; el ajuste parece centrado en inglés, por lo que el rendimiento en castellano no está garantizado.
- No se documenta la longitud de contexto efectiva, lo que dificulta planificar tareas sobre repositorios grandes.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en APIs y librerías poco comunes; conviene validar el código generado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de la familia Qwen2 debe verificarse para confirmar la compatibilidad de la cadena de licencias.
- El modelo se presenta con un tono humorístico y sin moralización, lo que puede no ser adecuado para entornos corporativos con requisitos de tono formal.
- El repositorio tiene un número muy bajo de descargas (99) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/KreatixLabs/Kreatix-K1
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
