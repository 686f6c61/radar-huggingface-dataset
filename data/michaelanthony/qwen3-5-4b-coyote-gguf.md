# MichaelAnthony/Qwen3.5-4b-Coyote-GGUF

## Resumen

Qwen3.5-4b-Coyote es un modelo de lenguaje especializado en generación de código, detección de errores y llamada a herramientas, desarrollado por Michael Anthony Falabella mediante un ajuste fino con LoRA sobre el modelo base Qwen/Qwen3.5-4B-Base. El resultado se distribuye en formato GGUF, lo que permite su ejecución local con llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura cloud. El modelo está pensado para desarrolladores que necesitan un asistente de código ligero y eficiente, con capacidades de tool calling integradas.

La relevancia de este modelo radica en su tamaño compacto (4,21 mil millones de parámetros) combinado con un ajuste específico para tareas de programación. Al estar basado en la arquitectura Qwen3.5, hereda un vocabulario amplio de 248.320 tokens y una estructura de transformer denso con 32 bloques. Aunque el modelo base soporta una ventana de contexto nativa de 262.144 tokens, no se ha confirmado si el ajuste fino conserva esta longitud completa. El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen35`, 32 bloques, 426 tensores) |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-4B soporta 262.144 tokens, pero no se confirma en el ajuste) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso con 32 bloques y un vocabulario de 248.320 tokens. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 en precisión bf16, y posteriormente se fusionaron los adaptadores en los pesos del modelo base. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. El entrenamiento se centró en tres tareas principales: generación de código, detección de errores y llamada a herramientas (tool calling). No se mencionan innovaciones arquitectónicas adicionales; se trata de un ajuste fino clásico sobre una arquitectura ya existente.

## Capacidades

- Generación de código en diversos lenguajes de programación, a partir de descripciones en lenguaje natural.
- Detección de errores y bugs en fragmentos de código, con capacidad para señalar problemas potenciales.
- Tool calling / function calling: puede invocar funciones externas o APIs siguiendo un esquema definido.
- Conversación multi-turno orientada a tareas técnicas de programación.
- Soporte para integración en agentes que requieran razonamiento paso a paso y ejecución de herramientas.
- Capacidades multilingües heredadas del modelo base, aunque no se detallan los idiomas específicos.
- No se indican capacidades de visión, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar funciones, clases o scripts completos a partir de comentarios o descripciones, integrándose en editores como VS Code mediante plugins que usen llama.cpp u Ollama.
- Revisión de código en pipelines de CI/CD: gracias a su capacidad de detección de bugs, puede analizar pull requests y señalar posibles errores antes de la integración, reduciendo el tiempo de revisión manual.
- Agente de automatización con tool calling: puede orquestar llamadas a APIs, bases de datos o servicios externos, por ejemplo para generar informes, ejecutar consultas o interactuar con sistemas de gestión.
- Chat técnico de soporte para desarrolladores: desplegado como bot en Slack o Discord, puede responder preguntas sobre APIs, librerías o fragmentos de código, manteniendo el contexto de la conversación.
- Generación de tests unitarios: a partir de una función o clase, el modelo puede proponer casos de prueba, cubriendo escenarios límite y condiciones de error.
- Documentación automática de código: puede generar comentarios, docstrings y documentación de API a partir del código fuente, facilitando el mantenimiento de proyectos.
- Prototipado rápido: en entornos de desarrollo local, permite generar esqueletos de aplicaciones o scripts de automatización sin necesidad de conexión a internet.

## Benchmarks y rendimiento

El autor proporciona resultados en dos conjuntos de evaluación propios, denominados BenchLocal coding benchpacks:

| Benchmark | Puntuacion |
|---|---|
| ToolCall-15 | 67 % |
| BugFind-15 | 65 % |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en la información disponible. Estos datos provienen de la model card y no se ha podido verificar su metodología.

## Requisitos de hardware

- Cuantización Q4_K_M (2,52 GB): cabe en GPUs con 4 GB de VRAM, como una NVIDIA RTX 3050 o RTX 4060. También puede ejecutarse en CPU con suficiente RAM.
- Cuantización Q6_K (3,23 GB): recomendada para GPUs con 6 GB de VRAM, como RTX 3060 o RTX 2060.
- Cuantización Q8_0 (4,17 GB): requiere al menos 8 GB de VRAM, por ejemplo RTX 3070, RTX 4070 o RTX 3080.
- Cuantización F16 (7,85 GB): necesita 12 GB de VRAM o más, como RTX 3090, RTX 4090 o A100.
- Despliegue: compatible con llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. No se menciona soporte para vLLM o TGI, que normalmente requieren pesos en safetensors.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo base Qwen3.5-4B es la referencia natural, ya que este ajuste fino parte de él. Otros modelos de tamaño similar, como Qwen3-4B o Llama 3.2 3B, podrían ser alternativas, pero no se han encontrado comparaciones de rendimiento en las fuentes consultadas. La principal diferencia frente al base es la especialización en código y tool calling, mientras que el base ofrece capacidades más generales y una ventana de contexto de 262.144 tokens (según la documentación de Qwen3.5). La licencia Apache 2.0 es común a todos ellos.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo especializado en código, su rendimiento en tareas generales de lenguaje puede ser inferior al de modelos de propósito general.
- Riesgo de alucinación en la generación de código: puede producir fragmentos que parecen correctos pero contienen errores lógicos o de sintaxis.
- La longitud de contexto efectiva tras el ajuste fino no está confirmada; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- Los benchmarks proporcionados (ToolCall-15 y BugFind-15) son propios del autor y no han sido validados externamente, por lo que su fiabilidad es limitada.
- No se especifican los idiomas soportados; aunque el base es multilingüe, el ajuste fino podría haber reducido el rendimiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.5-4B-Base para confirmar que no hay restricciones adicionales.
- El modelo no soporta entrada multimodal; solo procesa texto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/MichaelAnthony/Qwen3.5-4b-Coyote-GGUF
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo original en safetensors (Qwen3.5-4b-Coyote): https://huggingface.co/MichaelAnthony/Qwen3.5-4b-Coyote
- Página de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Página de Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
