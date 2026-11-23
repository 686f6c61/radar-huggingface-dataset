# OceanLabs/Ocean-Coder-7B

## Resumen

Ocean-Coder-7B es un modelo de generación de texto especializado en código publicado por OceanLabs. Se trata de un *repackaging* del modelo Qwen/Qwen2.5-Coder-7B-Instruct de Alibaba Cloud: los pesos son idénticos, sin entrenamiento ni ajuste fino adicional. Las únicas modificaciones introducidas por OceanLabs son el system prompt por defecto en la plantilla de chat, los parámetros de generación por defecto (temperature 0.4, top_p 0.9, top_k 20, repetition_penalty 1.05) y la documentación.

El modelo emplea la arquitectura Qwen2ForCausalLM, un transformer decoder-only de 28 capas y aproximadamente 7.615 millones de parámetros (7,6 B), con una ventana de contexto nativa de 32.768 tokens ampliable hasta 131.072 mediante escalado YaRN. Está pensado para generación, autocompletado, depuración, refactorización, revisión y explicación de código, así como para asistentes y agentes de programación.

Su relevancia es limitada desde el punto de vista técnico, ya que no aporta innovación sobre el modelo base; su interés radica en la configuración por defecto orientada a código seguro y legible y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. Los idiomas declarados son inglés y alemán.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con escalado YaRN |
| Tipos de cuantización | no disponible en la model card (los pesos se distribuyen en bfloat16; al ser safetensors estándar admite cuantizaciones derivadas como GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | inglés (en), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con 28 capas, atención por causalidad estándar (no se documenta atención lineal ni mecanismos híbridos SSM) y pesos en bfloat16. OceanLabs no realizó ningún entrenamiento, ajuste fino, RLHF ni DPO; los pesos, el `config.json` y el vocabulario del tokenizador son idénticos a los del modelo original.

Las únicas modificaciones son de configuración: un system prompt por defecto en `chat_template.jinja` y `tokenizer_config.json` que instruye al modelo a escribir código correcto, seguro, legible y eficiente, a considerar casos límite antes de responder, a explicar brevemente el código y a declarar la incertidumbre; y unos valores de generación por defecto más conservadores que los habituales, orientados a reducir la dispersión en la salida de código. Para los detalles de entrenamiento (composición del dataset, número de tokens, fases de alineación) debe consultarse la model card y el informe técnico del modelo base.

## Capacidades

- Generación y autocompletado de código en múltiples lenguajes de programación (heredadas del modelo base Qwen2.5-Coder).
- Depuración, refactorización y revisión de código.
- Explicación de fragmentos de código y de su funcionamiento.
- Razonamiento sobre casos límite antes de responder, por instrucción explícita del system prompt.
- Conversación multi-turno mediante plantilla de chat.
- Soporte de tool calling / function calling: no documentado explícitamente en esta model card; debe verificarse contra la del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente en esta ficha.
- Capacidades multilingües: declaradas en inglés y alemán; el system prompt indica que responda en el idioma del usuario.
- Modo *thinking* explícito, visión o audio: no disponibles.

## Casos de uso

- Asistente de programación en IDE: el modelo puede completar y generar funciones a partir de descripciones en lenguaje natural, con una ventana de 32.768 tokens que permite incluir varios ficheros de contexto en la petición.
- Depuración asistida: dado un fragmento de código y un mensaje de error, el modelo explica la causa y propone una corrección, apoyándose en el system prompt que le pide considerar casos límite.
- Refactorización y revisión de código: integrado en un pipeline de CI/CD o en un bot de revisión de *pull requests*, puede señalar problemas de legibilidad o seguridad y proponer alternativas.
- Generación de documentación técnica: a partir de código fuente, produce explicaciones breves del funcionamiento de funciones y módulos, en línea con la instrucción de explicar brevemente lo que hace el código.
- Agentes de codificación: al ser compatible con TGI y vLLM (`vllm serve OceanLabs/Ocean-Coder-7B`), puede desplegarse como backend de agentes que encadenan generación, ejecución y corrección de código.
- Asistencia en alemán e inglés: para equipos que trabajan en estos idiomas, el modelo mantiene la conversación en el idioma del usuario según el system prompt.
- Despliegue en infraestructura propia: al tener licencia Apache 2.0 y pesos safetensors estándar, puede servirse en clústeres internos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la información disponible. Dado que los pesos son idénticos a los de Qwen/Qwen2.5-Coder-7B-Instruct, la model card indica que se aplican los resultados oficiales del modelo base; consúltense en su model card o en el informe técnico arXiv:2409.12186.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica se recomienda un mínimo de 18-20 GB.
- Cuantización a 8 bits: en torno a 8 GB de pesos; a 4 bits: en torno a 4-5 GB de pesos (estimaciones derivadas del tamaño, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen ajustado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers, vLLM (`vllm serve OceanLabs/Ocean-Coder-7B`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ocean-Coder-7B | ~7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Pesos idénticos a Qwen2.5-Coder-7B-Instruct; solo cambia el system prompt y los defaults de generación |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo base original de Alibaba Cloud; referencia para benchmarks |
| Alternativas de la misma categoría (otros modelos de código de ~7 B) | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada para una comparación cuantitativa fiable |

## Limitaciones y advertencias

- Puede generar código incorrecto o inseguro; es necesario revisarlo y probarlo antes de ejecutarlo en producción.
- No se realizaron benchmarks propios; el rendimiento es el del modelo base Qwen2.5-Coder-7B-Instruct.
- Hereda los sesgos y limitaciones del modelo base, incluidos los derivados de sus datos de entrenamiento.
- Idiomas declarados limitados a inglés y alemán; el rendimiento en castellano no está garantizado por el autor.
- La ventana nativa es de 32.768 tokens; la ampliación a 131.072 requiere configuración YaRN y puede degradar la calidad.
- El modelo no aporta ninguna mejora técnica sobre el original: si se busca el mejor rendimiento, conviene usar directamente Qwen2.5-Coder-7B-Instruct.
- Licencia Apache 2.0: permite uso comercial y modificación, pero debe conservarse la atribución correspondiente.
- Riesgo de alucinación en APIs, librerías o funciones inexistentes, habitual en modelos de código.

## Enlaces

- Hugging Face: https://huggingface.co/OceanLabs/Ocean-Coder-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia: https://huggingface.co/OceanLabs/Ocean-Coder-7B/blob/main/LICENSE
- Informe técnico Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
