# qtum/Qwen3-30B-A3B-AWQ

## Resumen

El modelo `qtum/Qwen3-30B-A3B-AWQ` es una cuantización AWQ (W4A16) del modelo Qwen3-30B-A3B, desarrollado por Qwen (Alibaba). Esta versión ha sido producida por el usuario `qtum` utilizando la herramienta `llm-compressor` de vLLM, y se distribuye en formato `compressed-tensors` (safetensors) para su uso directo con motores de inferencia como vLLM o SGLang. El objetivo principal es reducir el tamaño del modelo original (aproximadamente un cuarto del peso en bf16) y aumentar el rendimiento de inferencia, manteniendo una calidad cercana a la del modelo base.

El modelo base Qwen3-30B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. Pertenece a la serie Qwen3, que destaca por sus capacidades de razonamiento, seguimiento de instrucciones, uso de herramientas y soporte multilingüe. Esta cuantización específica está pensada para entornos de producción donde el consumo de memoria y la latencia son críticos, permitiendo desplegar el modelo en GPUs con menor VRAM.

Al ser una cuantización, no introduce cambios en la arquitectura ni en el entrenamiento del modelo original; simplemente reduce la precisión de los pesos a 4 bits para las activaciones y 16 bits para los pesos (W4A16). Esto la convierte en una opción atractiva para equipos que ya utilizan el modelo base y buscan una implementación más eficiente sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer |
| Parametros totales | 30.532.122.624 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ (W4A16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-30B-A3B, un transformer con mezcla de expertos (MoE) que activa solo 3 mil millones de parámetros por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamaño total. El modelo base fue entrenado por Qwen con un enfoque en razonamiento, instrucciones complejas y capacidades de agente, aunque no se dispone de detalles específicos sobre el número de tokens o la composición del dataset de entrenamiento en la información proporcionada.

Esta versión cuantizada no ha sido reentrenada; se ha obtenido mediante cuantización AWQ (Activation-aware Weight Quantization) utilizando la librería `llm-compressor`. El método AWQ selecciona los pesos más importantes basándose en la distribución de las activaciones y los cuantifica a 4 bits, mientras que los pesos restantes se mantienen a 16 bits. El resultado se almacena en formato `compressed-tensors`, que declara el esquema de cuantización en el archivo `config.json` para que el motor de inferencia lo detecte automáticamente.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento y seguimiento de instrucciones complejas, heredado del modelo base Qwen3-30A-A3B.
- Soporte para tool calling y function calling, tal como se describe en la documentación de la serie Qwen3.
- Capacidades de agente y razonamiento multi-paso, aunque no se detallan en la información de esta cuantización.
- Compatible con motores de inferencia que soporten el formato `compressed-tensors`, como vLLM y SGLang.
- No se especifican capacidades adicionales como visión o audio; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue en producción con vLLM: al ser una cuantización AWQ en formato `compressed-tensors`, puede servirse directamente con `vllm serve qtum/Qwen3-30B-A3B-AWQ`, sin necesidad de configurar parámetros adicionales. Esto lo hace adecuado para entornos donde se requiere baja latencia y alta concurrencia.
- Asistentes conversacionales multilingües: gracias a su soporte para inglés y chino, puede integrarse en chatbots o sistemas de atención al cliente que atiendan a usuarios de ambos idiomas.
- Generación de código asistida: el modelo base Qwen3-30B-A3B tiene buen rendimiento en tareas de programación, por lo que esta versión cuantizada puede emplearse en herramientas de autocompletado o revisión de código en entornos con recursos limitados.
- Razonamiento y análisis de documentos: su capacidad para seguir instrucciones y razonar sobre texto largo (aunque la longitud de contexto no está confirmada en esta ficha) permite su uso en tareas de resumen, extracción de información o análisis de contratos.
- Agentes autónomos: al soportar tool calling, puede integrarse en pipelines de automatización donde el modelo decide qué herramientas invocar para completar tareas, como consultas a bases de datos o llamadas a APIs.
- Investigación y prototipado rápido: al ocupar solo 16.7 GB, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 o 4090) para experimentación y pruebas de concepto antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base Qwen3-30B-A3B ha sido evaluado por Qwen en tareas como MMLU, HumanEval y GSM8K, pero esos datos no se incluyen en la documentación de esta versión cuantizada. Se recomienda consultar la página del modelo base para obtener referencias de rendimiento.

## Requisitos de hardware

- Tamaño del repositorio: 16.7 GB, lo que sugiere que la VRAM necesaria para cargar el modelo es de aproximadamente 17 GB (considerando overhead de inferencia). Esto permite ejecutarlo en GPUs con 24 GB de VRAM, como la RTX 3090, RTX 4090 o A5000.
- Para despliegues con vLLM, se recomienda una GPU con al menos 24 GB para mantener un throughput razonable y evitar cuellos de botella de memoria.
- El modelo puede ejecutarse también en GPUs con 16 GB (por ejemplo, RTX 4080) si se utiliza una ventana de contexto reducida o técnicas de offloading, aunque no se garantiza un rendimiento óptimo.
- Opciones de despliegue: vLLM, SGLang, y cualquier otro motor que soporte el formato `compressed-tensors`. También podría usarse con llama.cpp si se convierte a GGUF, aunque no está incluido en esta versión.
- La latencia y el throughput dependen del hardware y del número de peticiones concurrentes; no se proporcionan cifras específicas en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para esta cuantización. Como referencia, se puede comparar con el modelo base Qwen3-30B-A3B en su versión bf16 (aproximadamente 60 GB) y con otras cuantizaciones del mismo modelo (por ejemplo, GPTQ o GGUF) que puedan existir en Hugging Face. En términos de tamaño, esta versión AWQ reduce el peso a un cuarto del original, lo que la hace comparable a otras cuantizaciones de 4 bits. No se conocen modelos de la misma categoría (MoE de 30B con 3B activos) que ofrezcan características idénticas, por lo que la comparativa directa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- La cuantización AWQ puede introducir una ligera degradación en la calidad de las respuestas, especialmente en tareas que requieren alta precisión numérica o razonamiento matemático detallado.
- El modelo solo soporta los idiomas inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- No se ha confirmado la longitud de contexto máxima en esta versión; se recomienda verificar la configuración del modelo base para evitar errores de truncamiento.
- La licencia Apache-2.0 permite uso comercial, pero es obligatorio atribuir la autoría original (Qwen) y mantener el aviso de licencia.
- Al ser una cuantización, el modelo no ha sido reentrenado; cualquier sesgo o limitación presente en el modelo base se mantiene intacto.
- Para producción, se recomienda validar el rendimiento de la cuantización en el caso de uso específico, ya que la degradación puede ser más notable en dominios especializados.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/qtum/Qwen3-30B-A3B-AWQ
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog de Qwen3 (Think Deeper, Act Faster): https://qwen.ai/blog?id=qwen3
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
