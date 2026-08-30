# liodon-ai/deepseek-coder-7b-instruct-v1.5-FP8

## Resumen

El modelo `liodon-ai/deepseek-coder-7b-instruct-v1.5-FP8` es una cuantización FP8 dinámica del modelo base `deepseek-ai/deepseek-coder-7b-instruct-v1.5`, publicada por Liodon AI. Esta versión reduce el tamaño del modelo de 13,8 GB a 7,8 GB, manteniendo la arquitectura original del transformer decoder de 6,9 mil millones de parámetros. La cuantización utiliza el esquema `FP8_DYNAMIC` de la librería `llm-compressor`, que convierte los pesos a FP8 (E4M3) por canal de forma estática y cuantiza las activaciones dinámicamente por token, sin necesidad de dataset de calibración. Esto hace que los pesos cuantizados sean una conversión directa de los originales, evitando sesgos introducidos por conjuntos de calibración.

El modelo está diseñado para generación de texto y código, y es compatible con motores de inferencia como vLLM, TGI y SGLang. Su relevancia radica en ofrecer una versión más ligera y rápida del modelo DeepSeek Coder v1.5, pensada para despliegue en producción con GPUs modernas que soporten FP8 nativo (compute capability ≥ 8.9). Al ser una cuantización sin calibración, el impacto en la calidad es mínimo, lo que lo convierte en una opción atractiva para entornos donde el uso de memoria y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura tipo LLaMA) |
| Parametros totales | 6.910.365.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3) por canal en pesos, activaciones FP8 dinamicas por token |
| Idiomas soportados | no disponible (el modelo base soporta ingles y chino, pero no se especifica en la ficha) |
| Licencia | other (licencia del modelo base DeepSeek Coder, que permite uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `deepseek-ai/deepseek-coder-7b-instruct-v1.5`, un transformer decoder con arquitectura similar a LLaMA, entrenado específicamente para tareas de generación y comprensión de código. La cuantización se realizó con `llm-compressor` usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son una conversión directa de los originales, sin pérdida adicional por sesgo de calibración. El `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

El modelo base fue entrenado por DeepSeek con 2 billones de tokens (según la documentación oficial de DeepSeek Coder), compuestos por un 87% de código y un 13% de lenguaje natural en inglés y chino. Sin embargo, esta información no está incluida en la model card de la versión cuantizada, por lo que se indica como referencia externa.

## Capacidades

- Generación de texto y código: el modelo puede completar, generar y explicar código en múltiples lenguajes de programación, así como responder preguntas técnicas.
- Conversación: al ser una versión instruct, está optimizado para seguir instrucciones y mantener diálogos multi-turno.
- Razonamiento sobre código: puede analizar fragmentos de código, detectar errores y sugerir correcciones.
- Compatibilidad con motores de inferencia: soporta vLLM, TGI y SGLang, lo que facilita su integración en pipelines de producción.
- Ejecución eficiente en FP8: aprovecha las unidades tensor de GPUs Ada/Hopper/Blackwell para reducir memoria y latencia.
- No se especifican capacidades de tool calling, agentes o visión en la información disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletado y sugerencias de código en tiempo real, gracias a su tamaño reducido que permite baja latencia en GPUs consumer.
- Generación de documentación técnica: dado su entrenamiento en código y lenguaje natural, puede generar comentarios, docstrings y documentación de APIs a partir de código fuente.
- Revisión de código automatizada: puede analizar pull requests y señalar posibles errores, vulnerabilidades o mejoras de estilo, integrándose en pipelines de CI/CD.
- Chatbot de soporte técnico: al ser un modelo instruct, puede responder preguntas sobre lenguajes de programación, frameworks y resolución de problemas comunes.
- Educación y tutoría en programación: puede explicar conceptos, depurar ejercicios y proporcionar ejemplos de código adaptados al nivel del estudiante.
- Despliegue en entornos con recursos limitados: al ocupar solo 7,8 GB, puede ejecutarse en GPUs con 8-12 GB de VRAM, como la RTX 4070, permitiendo inferencia local en estaciones de trabajo sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento del modelo cuantizado, y no se proporcionan comparativas con el modelo base u otras cuantizaciones. Se recomienda consultar los benchmarks del modelo base `deepseek-ai/deepseek-coder-7b-instruct-v1.5` para una referencia de calidad, aunque los resultados pueden variar ligeramente debido a la cuantización.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo es de 7,8 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más overhead de activaciones y buffers. Se recomienda un mínimo de 10-12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: para ejecución FP8 nativa se requiere compute capability ≥ 8.9, es decir, GPUs Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) o Blackwell (B100, B200, GB10). En GPUs más antiguas (Ampere, Turing), vLLM/TGI dequantizarán los pesos, perdiendo la ventaja de velocidad y memoria.
- Compatibilidad con consumer GPUs: sí, cabe en RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB), siempre que soporten FP8 nativo (RTX 40-series en adelante).
- Opciones de despliegue: vLLM, TGI (Text Generation Inference) y SGLang, todos compatibles con el formato safetensors y la cuantización FP8.
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización FP8 suele ofrecer una reducción de memoria de aproximadamente un 45% y una mejora de throughput de 1,5-2x frente al modelo en BF16, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepseek-coder-7b-instruct-v1.5 (base) | 6,9B | no disponible | BF16 | other (uso comercial) | HuggingFace |
| liodon-ai/deepseek-coder-7b-instruct-v1.5-FP8 | 6,9B | no disponible | FP8 dinamico | other (misma licencia) | HuggingFace |
| liodon-ai/deepseek-coder-6.7b-instruct-FP8 | 6,7B | no disponible | FP8 dinamico | other | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre la versión base y la cuantizada es el tamaño (13,8 GB vs 7,8 GB) y la velocidad de inferencia en hardware compatible con FP8, a costa de una posible pérdida mínima de precisión.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera degradación en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código muy preciso, aunque al ser una conversión directa sin calibración, el impacto suele ser mínimo.
- El modelo solo aprovecha las ventajas de FP8 en GPUs con compute capability ≥ 8.9; en hardware más antiguo se dequantiza, perdiendo los beneficios de memoria y velocidad.
- La licencia "other" corresponde a la del modelo base DeepSeek Coder, que permite uso comercial, pero se debe revisar el texto exacto de la licencia para confirmar restricciones específicas (por ejemplo, atribución o limitaciones de uso).
- No se especifican los idiomas soportados en la ficha, aunque el modelo base fue entrenado con inglés y chino. La cobertura de otros idiomas puede ser limitada.
- No se dispone de información sobre sesgos o alucinaciones específicas de esta versión cuantizada. Como modelo de código, puede generar código incorrecto o inseguro si no se supervisa adecuadamente.
- El modelo no incluye capacidades de tool calling, agentes o visión, por lo que no es adecuado para tareas que requieran interacción con herramientas externas o procesamiento multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/deepseek-coder-7b-instruct-v1.5-FP8
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-7b-instruct-v1.5
- Repositorio de DeepSeek Coder: https://github.com/deepseek-ai/DeepSeek-Coder
- Página oficial de DeepSeek Coder: https://deepseekcoder.github.io/
- Documentación de llm-compressor: https://github.com/vllm-project/llm-compressor
