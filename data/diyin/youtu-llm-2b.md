# DIYIN/Youtu-LLM-2B

## Resumen

Youtu-LLM-2B es un modelo de lenguaje autoregresivo de 1.960 millones de parámetros desarrollado originalmente por Tencent, y esta versión concreta (DIYIN/Youtu-LLM-2B) es un fine-tune del modelo base `tencent/Youtu-LLM-2B-Base` realizado por el usuario DIYIN. El modelo emplea una arquitectura transformer densa con atención multi-latente (Dense MLA), soporta una ventana de contexto de 131.072 tokens (128k) y está diseñado con capacidades nativas para tareas de agente, razonamiento y generación de texto. Su tamaño reducido permite ejecutarlo en hardware local, incluso en dispositivos de gama media, lo que lo hace relevante para el despliegue en el borde (edge AI) y para escenarios donde los recursos computacionales son limitados.

La relevancia actual de este modelo radica en que demuestra que un modelo de menos de 2B de parámetros puede competir e incluso superar a modelos de mayor tamaño en benchmarks de razonamiento, código y tareas agénticas, gracias a su arquitectura eficiente y a su largo contexto. El fine-tune de DIYIN, aunque no aporta documentación específica sobre el proceso de ajuste, hereda las capacidades del modelo base de Tencent y está disponible bajo la licencia `youtu-llm`, que permite su uso comercial con ciertas restricciones. No se han publicado métricas propias para este fine-tune, por lo que los resultados de rendimiento que se citan corresponden al modelo instruct original de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo causal con Dense MLA (Multi-Latent Attention) |
| Parametros totales | 1.961.560.064 (1,96B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | No disponible en este repositorio (el modelo base tiene versiones GGUF en otro repo) |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | youtu-llm (otra, ver enlace: https://huggingface.co/tencent/Youtu-LLM-2B/LICENSE.txt) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base de Tencent, sobre el que se construye este fine-tune, utiliza una arquitectura transformer causal con atención multi-latente densa (Dense MLA). Esta variante de atención reduce el coste de la caché KV al proyectar las claves y valores en un espacio latente de menor dimensión, lo que permite manejar ventanas de contexto de hasta 128k tokens con una huella de memoria reducida. La configuración incluye 32 capas, 16 cabezas de atención, un rango MLA de 1.536 para Q y 512 para K/V, y dimensiones de 128 para QK sin RoPE, 64 para QK con RoPE y 128 para V. El vocabulario es de 128.256 tokens, lo que sugiere un soporte multilingüe amplio, aunque no se documenta explícitamente.

En cuanto al entrenamiento, el modelo base fue preentrenado por Tencent con un corpus extenso y posteriormente ajustado con instrucciones (instruct) para producir la versión `Youtu-LLM-2B`. El fine-tune de DIYIN parte de la versión base (`Youtu-LLM-2B-Base`) y no se proporcionan detalles sobre el proceso de ajuste, los datos utilizados ni las técnicas de alineación (RLHF, DPO, etc.). Por tanto, no es posible determinar qué modificaciones específicas ha introducido DIYIN respecto al modelo original. La model card incluida en este repositorio es idéntica a la del modelo instruct de Tencent, lo que sugiere que el fine-tune podría haber sido realizado con el mismo conjunto de instrucciones o con un ajuste menor, pero esto no está confirmado.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje general capaz de producir respuestas coherentes y contextuales en tareas de chat y completado de texto.
- Razonamiento y matemáticas: obtiene resultados destacados en benchmarks como MATH-500 (93,7%), AIME 24 (65,4%) y GPQA-Diamond (48,0%), superando a modelos de tamaño similar.
- Generación de código: alcanza un 95,9% en HumanEval y 89,0% en HumanEval+, lo que lo sitúa a la par o por encima de modelos de 4B y 8B parámetros.
- Capacidades agénticas: soporta tool calling y ejecución de tareas de agente de extremo a extremo, con resultados notables en SWE-Bench-Verified (17,7%) y GAIA (33,9%).
- Modo razonamiento (Reasoning Mode): el modelo puede generar cadenas de pensamiento (CoT) para mejorar la calidad de las respuestas en problemas complejos.
- Largo contexto: ventana de 128k tokens, adecuada para procesar documentos extensos, historiales de conversación largos o bases de código completas.
- Multilingüismo: aunque no se documenta oficialmente, el amplio vocabulario (128k tokens) sugiere cobertura de múltiples idiomas, pero no se puede confirmar sin pruebas específicas.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para autocompletar código, generar tests o refactorizar funciones. Su alto rendimiento en HumanEval (95,9%) y MBPP (85,0%) lo hace adecuado para tareas de programación asistida, incluso en máquinas sin GPU dedicada.
- Agentes autonomos para automatizacion de tareas: gracias a su capacidad de tool calling y a su buen resultado en SWE-Bench-Verified (17,7%), puede utilizarse como núcleo de agentes que interactúan con APIs, ejecutan comandos o navegan por entornos simulados. Su tamaño compacto permite desplegarlo en servidores de bajo coste o en dispositivos edge.
- Analisis de documentos largos: con 128k tokens de contexto, es posible procesar contratos, informes financieros o artículos científicos completos en una sola pasada, extrayendo información, resumiendo o respondiendo preguntas sobre el contenido.
- Razonamiento matematico y cientifico: en entornos educativos o de investigación, puede utilizarse para resolver problemas de matemáticas, física o química, generando explicaciones paso a paso. Su rendimiento en MATH-500 (93,7%) y AIME (65,4%) lo respalda.
- Chatbots de atencion al cliente con memoria extendida: la ventana de 128k permite mantener conversaciones de larga duración sin perder el hilo, gestionando múltiples turnos y recordando detalles de interacciones anteriores. Su capacidad de razonamiento mejora la coherencia de las respuestas.
- Prototipado rapido de aplicaciones de IA generativa: al ser un modelo pequeño y de código abierto, es ideal para experimentar con arquitecturas de agentes, sistemas RAG o pipelines de generación aumentada, sin necesidad de infraestructura costosa. Puede ejecutarse en una GPU consumer como una RTX 3060 o incluso en CPU con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune de DIYIN. Los datos que se muestran a continuación provienen de la model card del modelo instruct original de Tencent (`tencent/Youtu-LLM-2B`), que es la misma que se incluye en este repositorio. Se presentan como referencia de las capacidades del modelo base sobre el que se ha realizado el fine-tune.

| Benchmark | DeepSeek-R1-Distill-Qwen-1.5B | Qwen3-1.7B | SmolLM3-3B | Qwen3-4B | DeepSeek-R1-Distill-Llama-8B | Youtu-LLM-2B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| MMLU-Redux | 53,0% | 74,1% | 75,6% | **83,8%** | 78,1% | 75,8% |
| MMLU-Pro | 36,5% | 54,9% | 53,0% | **69,1%** | 57,5% | 61,6% |
| IFEval | 29,4% | 70,4% | 60,4% | **83,6%** | 34,6% | 81,2% |
| DROP | 41,3% | 72,5% | 72,0% | 82,9% | 73,1% | **86,7%** |
| MUSR | 43,8% | 56,6% | 54,1% | **60,5%** | 59,7% | 57,4% |
| MATH-500 | 84,8% | 89,8% | 91,8% | **95,0%** | 90,8% | 93,7% |
| AIME 24 | 30,2% | 44,2% | 46,7% | **73,3%** | 52,5% | 65,4% |
| AIME 25 | 23,1% | 37,1% | 34,2% | **64,2%** | 34,4% | 49,8% |
| GPQA-Diamond | 33,6% | 36,9% | 43,8% | **55,2%** | 45,5% | 48,0% |
| BBH | 31,0% | 69,1% | 76,3% | **87,8%** | 77,8% | 77,5% |
| HumanEval | 64,0% | 84,8% | 79,9% | 95,4% | 88,1% | **95,9%** |
| HumanEval+ | 59,5% | 76,2% | 74,7% | 87,8% | 82,5% | **89,0%** |
| MBPP | 51,5% | 80,5% | 66,7% | **92,3%** | 73,9% | 85,0% |
| MBPP+ | 44,2% | 67,7% | 56,7% | **77,6%** | 61,0% | 71,7% |
| LiveCodeBench v6 | 19,8% | 30,7% | 30,8% | **48,5%** | 36,8% | 43,7% |

En benchmarks agénticos, el modelo también destaca:

| Benchmark | Qwen3-1.7B | SmolLM3-3B | Qwen3-4B | Youtu-LLM-2B |
| :--- | :---: | :---: | :---: | :---: |
| GAIA | 11,4% | 11,7% | 25,5% | **33,9%** |
| xbench | 11,7% | 13,9% | 18,4% | **19,5%** |
| SWE-Bench-Verified | 0,6% | 7,2% | 5,7% | **17,7%** |
| EnConda-Bench | 10,8% | 3,5% | 16,1% | **21,5%** |
| BFCL V3 | 55,5% | 31,5% | **61,7%** | 58,0% |
| τ²-Bench | 2,6% | 9,7% | 10,9% | **15,0%** |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,96B parámetros. En FP16, el peso ocupa aproximadamente 3,9 GB (tamaño del repositorio). Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 2 GB; con 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super). Para cuantización 4-bit, basta con 2 GB, lo que permite ejecutarlo en GPUs integradas o incluso en CPU con suficiente RAM.
- Compatibilidad con hardware consumer: sí, es totalmente viable en GPUs de gama media y baja. Según un usuario en los foros de HuggingFace, el modelo se ha ejecutado localmente en un teléfono OnePlus 8, lo que demuestra su eficiencia.
- Opciones de despliegue: compatible con Transformers (>=4.56.0), vLLM, llama.cpp (mediante conversión a GGUF), Ollama y TGI. El modelo base tiene una versión GGUF oficial en `tencent/Youtu-LLM-2B-GGUF`.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU consumer moderna (RTX 3060), se puede esperar una generación de 20-40 tokens por segundo en FP16, y mayor velocidad con cuantización.

## Comparativa con modelos similares

El modelo compite directamente con otros modelos pequeños de menos de 4B parámetros. La siguiente tabla resume las diferencias clave:

| Modelo | Parametros | Contexto | Licencia | Punto fuerte |
| :--- | :---: | :---: | :--- | :--- |
| Youtu-LLM-2B (Tencent) | 1,96B | 128k | youtu-llm | Agente y código, contexto largo |
| Qwen3-1.7B | 1,7B | 32k (ampliable a 128k) | Apache 2.0 | Razonamiento general, multilingüe |
| SmolLM3-3B | 3B | 8k | Apache 2.0 | Eficiencia en tareas de chat |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32k | MIT | Razonamiento matemático (distilado de R1) |

En los benchmarks de la sección anterior, Youtu-LLM-2B supera a Qwen3-1.7B y SmolLM3-3B en la mayoría de tareas de código y agénticas, y se acerca a Qwen3-4B en varios apartados, a pesar de tener la mitad de parámetros. Su principal ventaja es la combinación de contexto largo (128k) y capacidades de agente, que no ofrecen los otros modelos de tamaño similar. La licencia `youtu-llm` es más restrictiva que Apache 2.0 o MIT, lo que puede ser un factor a considerar.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de pequeño tamaño, puede presentar alucinaciones con mayor frecuencia que modelos grandes, especialmente en dominios especializados. No se han publicado evaluaciones de sesgo para este modelo.
- Limitaciones de idioma: aunque el vocabulario es amplio, no se ha verificado oficialmente el rendimiento en español u otros idiomas. Es probable que el modelo esté optimizado principalmente para inglés y chino, dado el origen de Tencent.
- Licencia: la licencia `youtu-llm` es una licencia personalizada. Aunque permite uso comercial, es necesario revisar los términos completos en el enlace proporcionado. Puede incluir restricciones sobre redistribución o uso en ciertos sectores.
- Falta de documentación del fine-tune: no se especifica qué datos o técnicas se han utilizado para el ajuste de DIYIN, por lo que no se puede garantizar que el comportamiento sea idéntico al modelo instruct de Tencent. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.
- Compatibilidad con Transformers: la model card advierte de problemas con versiones de transformers superiores a 4.57.1, y recomienda un rango específico (>=4.56.0, <=4.57.1). Es necesario aplicar un parche si se usa una versión más reciente.
- Contexto largo: aunque soporta 128k tokens, el rendimiento en contextos muy largos puede degradarse si no se gestiona adecuadamente la atención. Se recomienda probar con documentos reales.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/DIYIN/Youtu-LLM-2B
- Modelo base de Tencent: https://huggingface.co/tencent/Youtu-LLM-2B-Base
- Modelo instruct de Tencent: https://huggingface.co/tencent/Youtu-LLM-2B
- Versión GGUF del modelo instruct: https://huggingface.co/tencent/Youtu-LLM-2B-GGUF
- Licencia del modelo: https://huggingface.co/tencent/Youtu-LLM-2B/LICENSE.txt
- Código y documentación técnica: https://github.com/TencentCloudADP/youtu-tip/tree/master/youtu-llm
- Informe técnico (arXiv): https://arxiv.org/abs/2512.24618
- Discusión sobre ejecución en hardware local: https://huggingface.co/tencent/Youtu-LLM-2B/discussions/8
