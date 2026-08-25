# ibm-granite/granite-4.2-8b

## Resumen

Granite-4.2-8B es un modelo de lenguaje de razonamiento desarrollado por el equipo Granite de IBM, presentado el 25 de agosto de 2026 como parte de la familia Granite 4.2. Se trata de un transformer denso de tipo decoder-only con 8.790 millones de parámetros, construido sobre el modelo base Granite-4.1-8B-Base. Su principal innovación es la incorporación de un modo de razonamiento nativo basado en cadenas de pensamiento integradas, que le permite planificar y razonar paso a paso antes de emitir una respuesta final, mejorando el rendimiento en tareas de matemáticas, programación, lógica multi-paso y llamadas a herramientas.

El modelo está pensado para flujos de trabajo agénticos en entornos empresariales, con soporte nativo para tool calling y modos de pensamiento configurables (pensamiento completo, no pensamiento y esfuerzo bajo). Admite una ventana de contexto nativa de 128K tokens, extensible hasta 512K, y cubre doce idiomas, incluidos inglés, español, francés, alemán, japonés, chino y árabe. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y académico sin restricciones. Está disponible en la plataforma Hugging Face con formato safetensors y es compatible con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GraniteForCausalLM) |
| Parámetros totales | 8.791.592.960 (8,79B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativa, extensible a 512K |
| Tipos de cuantización | No especificado en la información oficial (se esperan versiones GGUF, GPTQ, etc.) |
| Idiomas soportados | inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Granite-4.2-8B utiliza una arquitectura transformer decoder-only densa, sin mezcla de expertos. Los componentes principales son: atención de consulta agrupada (GQA) con 32 cabezas de atención y 8 cabezas de clave-valor, tamaño de cabeza de 128, incrustaciones rotativas (RoPE) con θ = 10.000.000, capas feed-forward con activación SwiGLU y tamaño oculto de 12.800, normalización RMSNorm (ε = 1e-5) y embeddings de entrada y salida separados (no compartidos). La precisión de entrenamiento es bfloat16.

El modelo parte de Granite-4.1-8B-Base y se ha afinado específicamente para añadir capacidades de razonamiento. Incorpora un modo de pensamiento integrado que genera una cadena de razonamiento interna (delimitada por marcadores `thinking... response`) antes de producir la respuesta final. Este mecanismo permite alternar entre tres modos: pensamiento completo (por defecto), no pensamiento y esfuerzo bajo, lo que da control sobre el equilibrio entre profundidad de razonamiento y latencia. Además, el razonamiento se usa para la selección de herramientas, de modo que el modelo decide qué herramienta invocar y por qué antes de realizar la llamada. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO en la información disponible.

## Capacidades

- **Razonamiento paso a paso**: genera cadenas de pensamiento internas para resolver problemas complejos de matemáticas, lógica y codificación.
- **Modos de pensamiento configurables**: pensamiento completo, no pensamiento y modo de bajo esfuerzo, activables por consulta.
- **Tool calling integrado**: soporta definición de funciones según el esquema de OpenAI y decide qué herramientas invocar de forma razonada.
- **Agentes y flujos multi-paso**: apto para construir agentes que planifican y ejecutan acciones en entornos dinámicos.
- **Multilingüe**: cubre doce idiomas principales, con buen rendimiento en los probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, holandés, chino).
- **Contexto largo**: ventana nativa de 128K tokens, ampliable a 512K mediante extensión de contexto, adecuada para documentos extensos y conversaciones largas.
- **Interfaz de texto**: generación de texto libre, completado de código, diálogo y asistencia conversacional.

## Casos de uso

- **Asistentes de atención al cliente**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 512K tokens) y razonar sobre la información del historial para resolver incidencias complejas, reduciendo el número de derivaciones a agentes humanos.
- **Agentes de automatización de procesos**: gracias a su soporte de tool calling y razonamiento, puede orquestar llamadas a APIs, bases de datos y servicios externos para ejecutar tareas como la gestión de pedidos o la actualización de registros de CRM.
- **Generación de código en entornos de producción**: puede integrarse en pipelines de CI/CD para generar código, explicar fragmentos, crear pruebas unitarias o refactorizar módulos, con la capacidad de razonar sobre los requisitos y el contexto del repositorio.
- **Análisis de documentos extensos**: con su ventana de 128K tokens, es adecuado para resumir, extraer información y responder preguntas sobre informes financieros, contratos legales o manuales técnicos de gran tamaño.
- **Sistemas de tutoría personalizada**: puede explicar conceptos matemáticos o de programación paso a paso, adaptando el nivel de detalle según el modo de pensamiento seleccionado por el usuario.
- **Traducción y localización multilingüe**: su soporte para 12 idiomas permite generar contenido localizado y traducir documentos con razonamiento contextual, aunque no es un modelo de traducción dedicado.
- **Investigación y análisis de datos**: puede procesar conjuntos de datos textuales y razonar sobre patrones, hipótesis y conclusiones, asistiendo a científicos de datos en la interpretación de resultados.
- **Automatización de soporte técnico**: en entornos de TI, puede diagnosticar problemas a partir de logs y documentación, y proponer soluciones, invocando herramientas de diagnóstico cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con métricas como MMLU, HumanEval, GSM8K, etc. Por lo tanto, no se pueden aportar datos cuantitativos de rendimiento en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bfloat16 ocupa aproximadamente 17,6 GB (según el tamaño del repositorio). Con cuantización de 4 bits (GGUF o GPTQ), la huella puede reducirse a unos 5-6 GB, permitiendo ejecución en GPUs de consumo con 8 GB o más.
- **GPUs recomendadas**: para inferencia en bfloat16 se recomienda una GPU con al menos 20 GB de VRAM, como una NVIDIA RTX 4090 (24 GB) o una A10G (24 GB). Para cuantización 4 bits, una RTX 3080/3090 (10-24 GB) o RTX 4070 (12 GB) pueden ser suficientes.
- **Despliegue en consumer**: sí, es viable con cuantización y en GPUs de 8 GB o más, aunque con menor velocidad y capacidad de contexto.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y la librería transformers de Hugging Face. Para despliegues en producción, vLLM o TGI son recomendados por su eficiencia.
- **Latencia y throughput**: no se dispone de datos medidos específicos. En general, un modelo de 8B en bfloat16 en una A100 puede generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia y el hardware. Con cuantización 4 bits en una RTX 4090, se pueden alcanzar cifras similares.

## Comparativa con modelos similares

La comparación se realiza con otros modelos de razonamiento de tamaño similar (7-9B parámetros) disponibles en el ecosistema open source:

| Modelo | Parámetros | Contexto | Licencia | Capacidades |
|---|---|---|---|---|
| Granite-4.2-8B | 8,79B | 128K (512K ext.) | Apache 2.0 | Razonamiento, tool calling, 12 idiomas |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 (uso comercial permitido) | Razonamiento básico, tool calling, 8 idiomas |
| Qwen 2.5 7B | 7,6B | 128K | Apache 2.0 | Razonamiento, tool calling, multilingüe |
| Mistral 7B v0.3 | 7,3B | 32K | Apache 2.0 | Razonamiento limitado, sin tool calling nativo |

Granite-4.2-8B se distingue por su modo de razonamiento nativo configurable y su soporte de tool calling con razonamiento integrado, algo que Llama 3.1 y Qwen 2.5 también ofrecen, pero con enfoques distintos. Su licencia Apache 2.0 es la más permisiva entre los comparados (Llama 3.1 tiene restricciones para empresas con más de 700M usuarios). La extensión de contexto a 512K es superior a la de los competidores (128K en Llama y Qwen, 32K en Mistral).

## Limitaciones y advertencias

- **Idiomas**: aunque se declaran 12 idiomas, solo se han probado exhaustivamente los listados; otros idiomas pueden funcionar pero sin garantía de calidad.
- **Riesgo de alucinación**: como todo LLM, puede generar información inventada o incorrecta, especialmente en tareas de razonamiento cuando se usa el modo de pensamiento completo.
- **Sesgos**: no se han publicado evaluaciones de sesgo específicas para este modelo; los sesgos pueden provenir de los datos de entrenamiento del modelo base.
- **Contexto largo**: aunque soporta hasta 512K, el rendimiento en contextos extremadamente largos puede degradarse y requerir recursos de memoria significativos.
- **Restricciones de uso**: no se han documentado restricciones de uso comercial adicionales a la licencia Apache 2.0, que permite uso libre.
- **Dependencia del modo de pensamiento**: si se desactiva el pensamiento, el rendimiento en tareas complejas puede disminuir; es recomendable mantener el modo completo para tareas de razonamiento exigentes.
- **Compatibilidad de herramientas**: el tool calling sigue el esquema de OpenAI, por lo que la integración con frameworks que usan ese estándar es directa, pero puede requerir adaptación para otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.2-8b
- Colección Granite 4.2 en Hugging Face: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de IBM sobre Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Artículo de investigación de IBM: https://research.ibm.com/blog/introducing-granite-4-2
- Página de IBM Granite: https://www.ibm.com/granite
