# llm-jp/llm-jp-4.1-8b-thinking-gguf

## Resumen

LLM-jp-4.1-8b-thinking es un modelo de lenguaje de 8.590.200.832 parámetros (8B denso) desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japón. Forma parte de la serie LLM-jp-4.1, que incluye variantes densas de 8B y 33B y una variante MoE de 32B-A3B. Esta ficha corresponde a la versión en formato GGUF del checkpoint post-entrenado con modo "thinking", distribuida a través de Hugging Face bajo licencia Apache 2.0.

El modelo está diseñado específicamente para inglés y japonés, con soporte declarado para 13 lenguajes de programación (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript). Su arquitectura es un transformer denso de 32 capas con tamaño oculto de 4.096 y 32 cabezas de atención, con una longitud de contexto de 65.536 tokens. El tokenizador se basa en un modelo Unigram con byte-fallback derivado de llm-jp-tokenizer v4.0.

La relevancia actual del modelo radica en dos factores: por un lado, es una de las pocas familias abiertas con entrenamiento nativo en japonés de alta calidad y corpus públicos (11,7T tokens en pre-entrenamiento y mid-training); por otro, la publicación de pesos en GGUF facilita el despliegue en entornos de inferencia local. No obstante, la model card advierte de que el uso con llama.cpp upstream todavía falla en el parseo del chat, y requiere un fork específico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (32 capas, hidden size 4.096, 32 cabezas) |
| Parametros totales | 8.590.200.832 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (el repo es GGUF, pero no se detallan los niveles incluidos) |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 45,4 GB); el modelo base se distribuye también en safetensors |
| Parametros de embedding | 805.306.368 |
| Parametros no-embedding | 7.784.894.464 |
| Tokenizador | Unigram con byte-fallback, basado en llm-jp-tokenizer v4.0 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only con 32 capas, dimensión oculta de 4.096 y 32 cabezas de atención. La longitud de contexto es de 65.536 tokens, notablemente amplia para un modelo de 8B. El tokenizador es un Unigram con byte-fallback implementado con huggingface/tokenizers, cuyas entradas de vocabulario se derivaron de llm-jp-tokenizer v4.0; la model card advierte que un entrenamiento puro de SentencePiece no reproduce el vocabulario original.

El entrenamiento siguió un pipeline multi-etapa con un total de 11,7T tokens. La fase de pre-entrenamiento y mid-training empleó corpus publicados en GitLab (llm-jp-corpus-v4.1 y llm-jp-corpus-midtraining-v2), aunque parte de los datos quedó excluida de la publicación por restricciones de licencia. La fase de post-entrenamiento consistió en SFT seguido de DPO, sin refuerzo con RL; los datasets de SFT y DPO están públicos en Hugging Face. Una innovación destacable es que la plantilla de chat está diseñada para ser compatible con el formato de respuesta OpenAI Harmony, aunque el tokenizador no es compatible con la librería openai-harmony, por lo que la tokenización directa con esa herramienta no funciona.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Modo "thinking": el checkpoint está post-entrenado para razonamiento explícito antes de responder.
- Razonamiento matemático y científico, evaluado en benchmarks como Math 500, AIME 2024/2025/2026, GPQA Diamond y PolyMath JA.
- Generación de código en 13 lenguajes (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript), evaluado con LiveCodeBench v6, JHumanEval y HumanEval.
- Conocimiento y QA en japonés e inglés, evaluado con JAM-CQA, JEMHopQA, JMMLU y MMLU-ProX.
- Soporte de tool calling y function calling, incluido en la evaluación del modelo.
- Capacidades de agente y razonamiento multi-paso derivadas del modo thinking y del soporte de herramientas.
- Compatibilidad declarada con el formato de respuesta OpenAI Harmony a nivel de plantilla de chat.

## Casos de uso

- Atención al cliente en japonés: el modelo puede mantener conversaciones multi-turno con hasta 65.536 tokens de contexto, lo que permite incorporar manuales de producto o historial de tickets extensos sin truncar. Su entrenamiento nativo en japonés lo hace adecuado para empresas que operan en el mercado nipón.
- Generación de código en producción: con soporte de tool calling y cobertura de 13 lenguajes, puede integrarse en pipelines de CI/CD para generar tests, parchear errores o revisar pull requests, invocando herramientas externas para compilar y ejecutar código.
- Razonamiento matemático asistido: el modo thinking permite resolver problemas de competición (AIME, Math 500) paso a paso, útil en plataformas educativas de matemáticas en japonés e inglés.
- Análisis de documentación técnica larga: la ventana de 65.536 tokens permite resumir o extraer información de manuales, especificaciones o papers completos en una sola pasada.
- Asistente de investigación en ciencias: con evaluaciones en GPQA Diamond y JGPQA, puede apoyar la revisión de literatura científica y la formulación de hipótesis en dominios como química o biología.
- Despliegue local en hardware de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp (mediante el fork de llm-jp) en estaciones de trabajo con GPU consumer, lo que facilita prototipado y uso offline sin depender de APIs.
- Agentes autónomos multi-paso: la combinación de thinking mode, tool calling y contexto largo permite construir agentes que planifican, invocan APIs y mantienen estado a lo largo de tareas complejas.

## Benchmarks y rendimiento

La model card enumera los benchmarks utilizados (Math 500, AIME 2024/2025/2026, MCLM Math 100, PolyMath JA, GPQA Diamond, JGPQA Diamond, JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA/EN, LiveCodeBench v6, JHumanEval y HumanEval), pero los resultados numéricos concretos no se incluyen en la información proporcionada; se remiten al blog técnico en japonés. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 8B, una cuantización Q4 requiere del orden de 5-6 GB de VRAM, Q8 en torno a 9-10 GB y FP16 aproximadamente 17 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar buen rendimiento en A100, H100, L40S y RTX 4090, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí en cuantizaciones bajas (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp mediante el fork llm-jp/llama.cpp (rama llmjp-harmony-handler); el llama.cpp upstream no funciona correctamente por falta de correcciones en el tokenizador. También es compatible con transformers para el checkpoint en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| llm-jp-4.1-8b-thinking | 8,59B | 65.536 | en, ja | Apache 2.0 | GGUF, safetensors |
| llm-jp-4.1-33b-thinking | 33,22B | 65.536 | en, ja | Apache 2.0 (presumible) | No disponible en esta ficha |
| llm-jp-4.1-32b-a3b-thinking | 32,14B totales / 3,83B activos | 65.536 | en, ja | Apache 2.0 (presumible) | No disponible en esta ficha |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. Como alternativas externas de tamaño similar podrían considerarse otros modelos abiertos de 7-9B con contexto largo, pero no se aportan datos concretos para comparar rendimiento, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y japonés de forma declarada; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Riesgo de alucinación: como todo LLM generativo, puede producir información falsa con apariencia de veracidad, especialmente en dominios especializados.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los corpus de pre-entrenamiento son mayoritariamente web y pueden arrastrar sesgos sociales y culturales.
- Compatibilidad con llama.cpp: el llama.cpp upstream falla en el parseo del chat por problemas de tokenizador; es obligatorio usar el fork de llm-jp, lo que añade fricción operativa y riesgo de desactualización.
- Compatibilidad con OpenAI Harmony: la plantilla de chat es compatible, pero el tokenizador no, por lo que no se puede usar la librería openai-harmony directamente.
- Corpus parcialmente cerrado: aunque la mayoría de los datos de entrenamiento son públicos, algunas porciones no se han liberado por restricciones de licencia, lo que limita la reproducibilidad completa.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los corpus subyacentes y de las dependencias (fork de llama.cpp) antes de desplegar en producción.
- Sin RL: el alineamiento se hizo solo con SFT y DPO, sin refuerzo, lo que puede traducirse en un comportamiento menos robusto en tareas de agente complejas que modelos entrenados con RL.
- Tamaño del repo GGUF: 45,4 GB, lo que implica varias cuantizaciones empaquetadas y requiere espacio de almacenamiento considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking-gguf
- Colección LLM-jp-4.1 Models: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog técnico (en japonés): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Guía de llama.cpp: https://github.com/llm-jp/llm-jp-4-cookbook/tree/main/llmjp4_llama-cpp
- Fork de llama.cpp: https://github.com/llm-jp/llama.cpp/tree/llmjp-harmony-handler
- Tokenizador llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de pre-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- Dataset DPO (8B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-8b-thinking-dpo-data
- Dataset DPO (32B-A3B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-32b-a3b-thinking-dpo-data
- Dataset DPO (33B): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-33b-thinking-dpo-data
- Swallow evaluation instruct: https://github.com/swallow-llm/swallow-evaluation-instruct
- Centro de I+D de LLM (LLMC): https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
