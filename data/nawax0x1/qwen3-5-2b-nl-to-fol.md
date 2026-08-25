# nawax0x1/Qwen3.5-2B-NL-to-FOL

## Resumen

El modelo `nawax0x1/Qwen3.5-2B-NL-to-FOL` es un ajuste fino (fine-tuning) del modelo base Qwen3.5-2B de Alibaba, orientado a la tarea de convertir lenguaje natural en lógica de primer orden (FOL, por sus siglas en inglés). El nombre del repositorio sugiere que su propósito es transformar frases y expresiones del lenguaje natural en representaciones lógicas formales, una capacidad útil en áreas como la verificación formal, el razonamiento simbólico y los sistemas de agentes basados en reglas.

El modelo base Qwen3.5-2B es una versión densa y compacta de la serie Qwen3.5, que incorpora una arquitectura de tipo gated delta networks, un codificador de visión integrado y una ventana de contexto de 262 000 tokens. Aunque el modelo base es multimodal, los tags del repositorio (`qwen3_5_text`, `text-generation`, `conversational`) indican que este ajuste fino se centra únicamente en el procesamiento de texto. El repositorio no incluye documentación detallada sobre el proceso de entrenamiento, los datos utilizados ni la evaluación del ajuste fino, por lo que gran parte de la información específica de esta variante no está disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated delta network (basada en Qwen3.5-2B) |
| Parametros totales | 1 881 327 424 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 000 tokens (base); no disponible para el ajuste fino |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura densa basada en gated delta networks, una variante de transformer que introduce mecanismos de compuerta y actualizaciones delta en las capas de atención y feed-forward. Esta arquitectura permite reducir el coste computacional respecto a los transformers clásicos, manteniendo la capacidad de procesar secuencias largas. El modelo base se entrenó con una estrategia de fusión temprana de tokens multimodales (texto e imagen) y se mejoró mediante aprendizaje por refuerzo a gran escala, según la información pública de Alibaba.

En cuanto al ajuste fino `NL-to-FOL`, no se dispone de información sobre el dataset utilizado, el procedimiento de entrenamiento (hiperparámetros, régimen de precisión, duración) ni el modelo base exacto del que parte. La model card es una plantilla generada automáticamente con todos los campos sin rellenar. Por tanto, no es posible describir el proceso de entrenamiento específico de este ajuste fino.

## Capacidades

- Conversión de lenguaje natural a lógica de primer orden: es la capacidad principal que sugiere el nombre del modelo, aunque no se han publicado ejemplos concretos ni evaluaciones que la confirmen.
- Generación de texto conversacional: el modelo hereda del base la capacidad de generar respuestas coherentes y seguir instrucciones, pero no se ha verificado su rendimiento tras el ajuste.
- Razonamiento y seguimiento de instrucciones: el base Qwen3.5-2B muestra mejoras en razonamiento y codificación sobre Qwen3, pero el ajuste fino puede haber degradado o alterado estas capacidades.
- Capacidades multimodales: el base incluye un codificador de visión, pero el ajuste fino se presenta como texto, por lo que es probable que la parte multimodal no esté disponible o no se haya evaluado.
- Soporte de tool calling y agentes: el base Qwen3.5-2B soporta herramientas y razonamiento multi-paso, pero no hay confirmación de que el ajuste fino conserve estas funciones.

## Casos de uso

- Verificación formal de sistemas: convertir especificaciones en lenguaje natural a fórmulas FOL que puedan procesarse con probadores de teoremas o verificadores como Isabelle, Coq o Lean. El modelo podría facilitar la entrada de requisitos de software en lenguaje natural a un pipeline de verificación formal.
- Generación de reglas de negocio: transformar políticas y normativas redactadas en lenguaje natural a reglas lógicas que se puedan ejecutar en motores de reglas o bases de conocimiento formales.
- Construcción de ontologías: ayudar a crear axiomas en lógica descriptiva a partir de textos descriptivos, para su uso en sistemas de representación del conocimiento.
- Asistentes de razonamiento simbólico: integrar el modelo en herramientas que necesitan traducir preguntas o afirmaciones en lenguaje natural a consultas lógicas para bases de conocimiento formales.
- Depuración de bases de conocimiento: dado un conjunto de reglas en FOL, el modelo podría generar explicaciones en lenguaje natural, aunque la tarea principal sería la inversa.
- Entrenamiento y documentación de agentes lógicos: convertir instrucciones de usuario en precondiciones y efectos lógicos para planificadores automáticos (por ejemplo, en planificación de tareas robóticas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no contiene ninguna tabla de evaluación, ni se han encontrado resultados externos para este ajuste fino específico. El modelo base Qwen3.5-2B ha sido evaluado en razonamiento, codificación y tareas visuales, pero no hay datos públicos sobre el rendimiento del fine-tuning en la tarea de conversión a FOL.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-2B puede ejecutarse en GPUs con 8 GB de VRAM en cuantización de 4 bits, según la documentación de vLLM y Ollama. Para el ajuste fino, los requisitos son similares al ser el mismo tamaño de parámetros.
- GPU recomendadas: tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090 pueden manejar el modelo en cuantización reducida. En servidores, una A100 o H100 ofrece mayor margen para contexto largo y batch.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 u 8 bits, cabe en 8 GB de VRAM.
- Opciones de despliegue: el modelo puede desplegarse con vLLM, llama.cpp, Ollama, Transformers o TGI. Qualcomm AI Hub ofrece scripts de exportación para dispositivos edge.
- Latencia y throughput: no se han publicado cifras para este ajuste fino; el base, en una GPU de gama media, puede generar en torno a 20-40 tokens por segundo en cuantización de 4 bits, pero depende del hardware y del contexto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos similares específicos para la tarea de conversión a lógica de primer orden. Como referencia, se puede comparar con el propio base Qwen3.5-2B y con otros modelos de razonamiento simbólico como los de la familia LLaMA o Mistral, pero sin datos de evaluación no es posible establecer una comparación objetiva.

| Modelo | Parametros | Contexto | Rendimiento en FOL | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | 262K | no evaluado | Apache 2.0 (según documentación base) |
| Qwen3.5-2B-NL-to-FOL | 1.88B | no disponible | no evaluado | no disponible |
| Otros modelos de razonamiento simbólico | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación ausente: la model card es una plantilla sin información sobre entrenamiento, datos ni evaluación. Esto dificulta la validación del modelo en producción.
- Licencia no disponible: no se especifica la licencia del ajuste fino, lo que impide conocer las restricciones de uso comercial o de redistribución.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar fórmulas FOL incorrectas o inválidas si no se valida la salida con un comprobador externo.
- Sesgos del modelo base: el base Qwen3.5-2B puede heredar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado en este repositorio.
- Capacidades multimodales no confirmadas: aunque el base es multimodal, el ajuste fino está orientado a texto y no se ha verificado si el modelo conserva la visión.
- Contexto largo: aunque el base soporta 262K tokens, el ajuste fino no especifica si mantiene esa longitud de contexto, y es posible que se haya reducido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nawax0x1/Qwen3.5-2B-NL-to-FOL
- Página del modelo base en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-2b
- Recetas de vLLM para Qwen3.5-2B: https://recipes.vllm.ai/Qwen/Qwen3.5-2B
- Modelo Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio de Qualcomm AI Hub en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Página de Qwen3.5-2B en Ollama: https://ollama.com/library/qwen3.5:2b
