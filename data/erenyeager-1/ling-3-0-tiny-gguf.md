# erenyeager-1/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de razonamiento híbrido desarrollado por inclusionAI, la división de inteligencia artificial de Ant Group. Forma parte de la serie Ling, diseñada específicamente para escenarios de despliegue en el borde (edge deployment), donde se prioriza la eficiencia computacional sin sacrificar la capacidad de razonamiento. Su arquitectura híbrida combina 18 capas de atención dependiente de clave (KDA) y 6 capas de atención latente multi-cabeza (MLA), una configuración que reduce significativamente el coste de memoria en la inferencia.

El modelo cuenta con 7.893.392.800 parámetros totales, de los cuales solo 1.300 millones se activan por token, lo que lo convierte en un candidato excelente para entornos con recursos limitados. Su ventana de contexto alcanza los 128.000 tokens, una cifra notable para un modelo de este tamaño. La versión GGUF aquí descrita, cuantizada por bartowski con llama.cpp, ofrece múltiples niveles de cuantización que permiten ejecutarlo en hardware de consumo desde 3 GB de RAM.

La relevancia actual de este modelo radica en su combinación de arquitectura MoE ligera, contexto largo y licencia MIT, que facilita su integración comercial sin restricciones. Su diseño específico para edge deployment lo convierte en una alternativa atractiva frente a modelos generalistas de tamaño similar que no optimizan el uso de memoria de la misma manera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas KDA (Key-Dependent Attention) + 6 capas MLA (Multi-Head Latent Attention) |
| Parametros totales | 7.893.392.800 (7,9 B) |
| Parametros activos | 1,3 B (por token) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K_L, Q2_K, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones), safetensors (original) |

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura híbrida que combina dos mecanismos de atención: KDA (Key-Dependent Attention) y MLA (Multi-Head Latent Attention). Las 18 capas KDA se encargan de la atención estándar sobre claves dependientes, mientras que las 6 capas MLA comprimen el estado de atención en un espacio latente de menor dimensión, lo que reduce drásticamente el tamaño del caché de clave-valor durante la inferencia. Este diseño permite mantener una ventana de contexto de 128.000 tokens con una huella de memoria reducida.

El modelo sigue un esquema de mezcla de expertos (MoE) con 1.300 millones de parámetros activos por token, lo que implica que solo una fracción de los 7,9 B totales se computa en cada paso de generación. Esta característica mejora el rendimiento y reduce los requisitos de computación en comparación con un modelo denso de tamaño equivalente. La cuantización GGUF aquí documentada se realizó con llama.cpp release b10472 utilizando imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada peso. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional de propósito general.
- Soporte para prompts con formato de sistema, humano y asistente, con marcadores específicos de inicio y fin de turno.
- Razonamiento multi-turno con contexto largo gracias a su ventana de 128.000 tokens.
- Soporte para cuantizaciones de baja precisión (hasta Q2_K) que mantienen una calidad utilizable en entornos con memoria limitada.
- Compatible con el formato de prompt que incluye un bloque de pensamiento detallado (detailed thinking) para tareas de razonamiento.
- Sin soporte para decodificación especulativa, según la documentación de la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos de borde (edge deployment): con solo 1,3 B de parámetros activos y cuantizaciones de 4 a 6 bits, el modelo puede ejecutarse en dispositivos embebidos, routers inteligentes o pasarelas IoT con recursos de memoria limitados, manteniendo un rendimiento de razonamiento aceptable.
- Asistentes conversacionales locales: gracias a su ventana de 128.000 tokens, el modelo puede mantener conversaciones largas y con contexto extendido sin perder información relevante, lo que lo hace adecuado para chatbots de atención al cliente desplegados en servidores modestos.
- Generación de contenido con presupuesto de memoria reducido: con la cuantización Q4_K_M (4,92 GB), el modelo se ejecuta en GPUs de consumo como la RTX 3060 o incluso en CPUs con 16 GB de RAM, permitiendo generar texto, resúmenes o respuestas de razonamiento en entornos sin hardware de alto rendimiento.
- Razonamiento multi-step en aplicaciones de análisis: el formato de prompt con "thinking" permite al modelo descomponer problemas complejos en pasos intermedios, útil para herramientas de análisis de datos, clasificación de documentos o extracción de información estructurada.
- Prototipado rápido y pruebas de concepto: al ser un modelo ligero con licencia MIT, los equipos de desarrollo pueden integrarlo en pipelines de texto sin preocuparse por costes de licencia, ideal para validar ideas antes de migrar a modelos de mayor tamaño.
- Generación de código en entornos restringidos: aunque no se ha confirmado el soporte explícito de tool calling, el modelo puede generar fragmentos de código y scripts simples gracias a su capacidad de razonamiento, siendo útil en entornos CI/CD donde la memoria es un factor crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones para MMLU, HumanEval, GSM8K u otras pruebas estándar que permitan comparar el rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 4,92 GB en disco, por lo que se recomienda al menos 6 GB de VRAM para cargar el modelo en GPU. Las cuantizaciones Q5 y Q6 requieren entre 5,5 y 7 GB, mientras que la versión BF16 necesita unos 15,8 GB.
- GPU recomendadas: para las cuantizaciones Q4 y Q5, una NVIDIA RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente. Para Q6 o bf16, se recomienda una RTX 3090, RTX 4090 o A100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media y alta con cuantizaciones Q4 o Q5. Las cuantizaciones Q2 y Q3 pueden ejecutarse en GPUs con 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (con soporte de imatrix), Ollama, llama-cpp-python, y cualquier framework compatible con formato GGUF.
- Latencia y throughput: no disponible en la información proporcionada. Se espera una latencia baja en tokens por segundo gracias a la arquitectura MoE con 1,3 B activos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de modelos comparables en la información proporcionada. Sin embargo, por su tamaño y arquitectura MoE, se puede considerar que compite con modelos como Qwen2.5-7B-Instruct (denso, 7,6 B, contexto 32K, licencia Apache 2.0) o DeepSeek-V3-Lite (MoE, 16B totales, 2,4 B activos, contexto 128K, licencia MIT), aunque no se han verificado datos de rendimiento de estos modelos en la documentación analizada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos o evaluación de seguridad del modelo. Se recomienda realizar pruebas de alineación antes de su despliegue en producción.
- Riesgo de alucinación: al no haber datos de evaluación de calidad de respuesta, existe el riesgo habitual de generación de información falsa o inventada, especialmente en tareas de razonamiento complejo.
- La documentación no indica los idiomas soportados. Aunque es probable que tenga cobertura multilingüe, no se puede garantizar su rendimiento en español u otros idiomas distintos del inglés.
- No se ha confirmado el soporte de tool calling o function calling, lo que limita su uso en pipelines de agentes automatizados sin integraciones adicionales.
- La licencia MIT permite uso comercial sin restricciones, pero la responsabilidad del uso y el cumplimiento legal recae en el usuario final.
- El modelo está cuantizado con imatrix, pero no se han medido los valores de perplejidad ni la degradación de rendimiento respecto al original en BF16.

## Enlaces

- Repositorio de cuantización original: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio alternativo de cuantización: https://huggingface.co/bloomer010/Ling-3.0-tiny-GGUF
- Repositorio alternativo de cuantización: https://huggingface.co/NANI-Nithin/Ling-3.0-tiny-GGUF
- Documentación oficial de la serie Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/bloomer010%2FLing-3.0-tiny-GGUF,1CXbh3RZLnQmexKt47mVuL
- Análisis del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ling-3.0-tiny-gguf-bloomer010
