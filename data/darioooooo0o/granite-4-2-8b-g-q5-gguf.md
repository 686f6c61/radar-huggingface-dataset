# darioooooo0o/granite-4.2-8b-G-Q5-GGUF

## Resumen

Granite 4.2 8B es un modelo de lenguaje denso de la familia Granite de IBM, diseñado específicamente para agentes empresariales con razonamiento nativo. Este repositorio contiene una cuantización GGUF personalizada llamada **G-Q5**, creada por el usuario darioooooo0o, que combina distintos tipos de cuantización por tensor para acercarse a la fidelidad del modelo en bf16 manteniendo un tamaño y una velocidad similares a los de un Q5 estándar.

La cuantización se realizó desde los pesos bf16 originales (sin recuantización) usando `llama-quantize` de llama.cpp con una importancia matrix calibrada sobre aproximadamente 600 000 tokens de texto y código. Según las mediciones del autor, este G-Q5 obtiene una divergencia KL de 0.0809 frente al bf16, superando a cuantizaciones oficiales y de terceros más grandes, y mantiene una velocidad de decodificación de ~54 tokens por segundo en una RTX 3060 de 12 GB.

El modelo es relevante porque ofrece una alternativa de alta fidelidad y tamaño contenido para desplegar Granite 4.2 8B en hardware de consumo, con una ventana de contexto verificada de hasta 108 000 tokens con KV cache cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8 791 592 960 (8,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (verificado 108 000 tokens con KV cache q4_0 en 12 GB VRAM) |
| Tipos de cuantizacion | G-Q5 (mixta por tensor: Q5_K, Q6_K, Q4_K) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base **Granite 4.2 8B** de IBM es un transformer decoder-only denso, post-entrenado sobre la base de Granite 4.1. La familia Granite 4.2 se ha optimizado para razonamiento y uso como agente empresarial, con soporte para tool calling y secuencias de acciones de varios pasos. El modelo base usa embeddings no unidos (untied embeddings) sobre un vocabulario de 100 000 tokens, lo que supone aproximadamente el 20 % de los parámetros totales.

La cuantización G-Q5 aplica una precisión mixta por tipo de tensor: las proyecciones de atención (Q, K, output) se cuantizan en Q5_K, el valor de atención (V) en Q6_K, el down-projection del feedforward en Q5_K, las proyecciones gate y up en Q4_K, y los embeddings de entrada y salida en Q5_K y Q6_K respectivamente. Se calibró una importancia matrix sobre un corpus mixto de prosa de Wikitext-103 y código fuente C++/TypeScript/Python (80/20), y se cuantizó desde los pesos bf16 sin pasar por una cuantización intermedia.

## Capacidades

- Generación de texto en lenguaje natural con razonamiento multi-paso, optimizado para tareas de agente empresarial.
- Razonamiento nativo para resolver tareas complejas y ambiguas: el modelo base está post-entrenado para seguir instrucciones complejas, recuperar información, elegir herramientas y verificar resultados.
- Soporte de tool calling y secuencias de acciones para agentes, según la documentación de IBM Granite 4.2.
- Capacidades multilingües: el modelo base soporta varios idiomas, aunque la ficha de esta cuantización no especifica cuáles.
- Compatible con llama.cpp y ecosistemas GGUF (Ollama, llama-cpp-python, etc.).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 108 000 tokens verificado) gracias a su ventana amplia, manteniendo el hilo de una conversación compleja sin perder detalles.
- **Agente de automatización de tareas**: su razonamiento nativo y soporte de tool calling permite integrarlo en pipelines que llaman APIs, consultan bases de datos o ejecutan acciones en servicios externos.
- **Generación de código en producción**: con el corpus de calibración que incluye código C++/TypeScript/Python, es adecuado para asistencia de programación en entornos de desarrollo.
- **Análisis de documentos largos**: la ventana de contexto verificada de 108 000 tokens permite procesar contratos, informes o logs extensos en una sola pasada.
- **Despliegue en hardware modesto**: con 5,22 GiB de tamaño, puede ejecutarse en GPUs de 8-12 GB VRAM, como una RTX 3060, con velocidades de ~54 tokens por segundo.
- **Prototipado rápido de agentes**: al ser un GGUF compatible con llama.cpp y Ollama, se integra rápidamente en entornos de desarrollo para experimentar con arquitecturas de agente.

## Benchmarks y rendimiento

La model card del autor incluye mediciones de fidelidad frente al modelo bf16 sobre 30 fragmentos de 512 tokens de texto de Wikitext-103, comparando con otras cuantizaciones del mismo modelo base:

| Cuantizacion | Tamano (GiB) | KLD (menor es mejor) | Coincidencia top-1 ↑ | Velocidad decodificacion (tok/s) | Velocidad prefill (tok/s) |
|---|---|---|---|---|---|
| Q4_K_M (oficial IBM) | 5,10 | 0,1796 | 86,0 % | 55,6 | 1760 |
| Q4_K_M (bartowski, imatrix) | 5,16 | 0,0996 | 90,4 % | 53,5 | 1739 |
| IQ4_XS (bartowski) | 4,60 | 0,1149 | 87,9 % | 59,9 | 1918 |
| Q4_K_L (bartowski) | 5,44 | 0,0911 | 90,4 % | 53,0 | 1738 |
| **G-Q5 (este repo)** | **5,22** | **0,0809** | **91,2 %** | 53,8 | 1748 |

La cuantización G-Q5 consigue la menor divergencia de Kullback-Leibler y la mayor coincidencia de token superior entre todas las comparadas, superando incluso a la Q4_K_L más grande, con una velocidad de decodificación dentro del ~3 % de las cuantizaciones estándar.

## Requisitos de hardware

- **VRAM mínima**: se ha verificado ejecución completa en una RTX 3060 de 12 GB con contexto de 108 000 tokens usando KV cache q4_0.
- **GPU recomendada**: cualquier GPU con al menos 8 GB de VRAM (para contexto corto) y 12 GB para contexto largo. RTX 3060 12 GB, RTX 4060 Ti 16 GB, o GPUs de datacenter como A10 o L4.
- **CPU**: puede ejecutarse en CPU con llama.cpp, aunque a menor velocidad.
- **Opciones de despliegue**: llama.cpp, llama-cpp-python, Ollama, text-generation-webui, y cualquier framework compatible con GGUF.
- **Rendimiento medido**: ~53,8 tokens/s de decodificación y ~1748 tokens/s de prefill en RTX 3060 12 GB con CUDA.

## Comparativa con modelos similares

La comparación más directa es con otras cuantizaciones del mismo modelo base Granite 4.2 8B, que se muestran en la tabla anterior. No se dispone de datos comparativos con otros modelos de 8B (como Llama 3.1 8B o Mistral 7B) en la información proporcionada.

| Modelo | Parametros | Tamano GGUF | Fidelidad (KLD vs bf16) | Velocidad (tok/s) | Licencia |
|---|---|---|---|---|---|
| Granite 4.2 8B G-Q5 (este repo) | 8,8 B | 5,22 GiB | 0,0808 | 53,8 | Apache-2.0 |
| Granite 4.2 8B Q4_K_M (IBM oficial) | 8,8 B | 5,10 GiB | 0,1796 | 55,6 | Apache-2.0 |
| Granite 4.2 8B IQ4_XS (bartowski) | 8,8 B | 4,60 GiB | 0,1149 | 59,9 | Apache-2.0 |
| Granite 4.2 8B Q4_K_L (bartowski) | 8,8 B | 5,44 GiB | 0,0911 | 53,0 | Apache-2.0 |

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se dispone de datos específicos sobre sesgos del modelo base Granite 4.2 8B; como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- **Contexto**: aunque se ha verificado 108 000 tokens con KV cache cuantizada, el contexto real del modelo base no se ha publicado en la información disponible; los contextos muy largos pueden degradar la calidad de la respuesta.
- **Idiomas**: la lista de idiomas soportados no está disponible; el modelo base es multilingüe según IBM, pero no se especifica qué lenguajes.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Granite 4.2 8B en el repositorio de IBM para confirmar restricciones adicionales.
- **Producción**: la cuantización mixta G-Q5 es una implementación no oficial del autor; se recomienda validar el rendimiento en el caso de uso concreto antes de desplegar en producción.
- **Reproducibilidad**: la cuantización se realizó con una versión específica de llama.cpp (b062ba735); otras versiones pueden producir pesos ligeramente diferentes.

## Enlaces

- Repositorio del modelo: [darioooooo0o/granite-4.2-8b-G-Q5-GGUF](https://huggingface.co/darioooooo0o/granite-4.2-8b-G-Q5-GGUF)
- Modelo base: [ibm-granite/granite-4.2-8b](https://huggingface.co/ibm-granite/granite-4.2-8b)
- Blog de IBM Granite 4.2 en Hugging Face: [Granite 4.2 LLMs: How They're Built](https://huggingface.co/blog/ibm-granite/granite-4-2)
- Blog de investigación de IBM: [Granite 4.2 brings native reasoning to enterprise agents](https://research.ibm.com/blog/introducing-granite-4-2)
- Página oficial de Granite en IBM: [IBM Granite](https://www.ibm.com/granite)
- Repositorio GitHub de modelos de lenguaje Granite 4.2: [ibm-granite/granite-4.2-language-models](https://github.com/ibm-granite/granite-4.2-language-models)
