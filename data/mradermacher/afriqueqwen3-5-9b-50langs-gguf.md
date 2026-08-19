# mradermacher/AfriqueQwen3.5-9B-50Langs-GGUF

## Resumen

AfriqueQwen3.5-9B-50Langs es un modelo de lenguaje perteneciente a la suite AfriqueLLM, desarrollada por el laboratorio McGill-NLP de la Universidad McGill. Se trata de una adaptación del modelo base Qwen3.5-9B mediante continued pre-training (CPT) sobre aproximadamente 35.500 millones de tokens, con el objetivo de mejorar su competencia en 50 lenguas africanas. El modelo original está disponible en Hugging Face bajo el identificador McGill-NLP/AfriqueQwen3.5-9B-50Langs, y la versión aquí descrita es una cuantización GGUF generada por el usuario mradermacher para facilitar su ejecución en entornos con recursos limitados.

La relevancia de este modelo radica en la escasez de modelos de lenguaje de alto rendimiento adaptados específicamente a las lenguas africanas, que históricamente han estado infrarrepresentadas en los corpus de entrenamiento. Al partir de Qwen3.5-9B, un modelo de 9.000 millones de parámetros con arquitectura transformer, y continuar su entrenamiento con datos en lenguas africanas, se busca mantener las capacidades generales del modelo base (razonamiento, generación de texto, código) mientras se mejora su rendimiento en tareas multilingües africanas. La versión GGUF permite su despliegue en hardware de consumo mediante herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | 50 lenguas africanas (lista no disponible) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-9B, que emplea atención por ventanas deslizantes y mecanismos de atención estándar. La adaptación se realizó mediante continued pre-training (CPT), un proceso en el que el modelo base se entrena adicionalmente con un corpus de aproximadamente 35.500 millones de tokens compuesto por datos en 50 lenguas africanas. Este enfoque permite que el modelo ajuste sus representaciones internas a las particularidades lingüísticas de estas lenguas sin perder las capacidades adquiridas durante el preentrenamiento original. No se dispone de información sobre el uso de técnicas de alineación como RLHF o DPO en esta adaptación, ni sobre la composición exacta del dataset de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, conserva las capacidades generales de generación de texto, razonamiento lógico y comprensión lectora del modelo base, aunque no se han publicado evaluaciones específicas para esta adaptación.
- Competencia multilingüe en lenguas africanas: el objetivo principal del modelo es mejorar el rendimiento en 50 lenguas africanas, incluyendo probablemente suajili, yoruba, igbo, amárico, hausa, entre otras, aunque la lista exacta no se ha especificado en la información disponible.
- Soporte de tool calling y function calling: no se ha confirmado explícitamente, pero es probable que herede esta capacidad de Qwen3.5-9B, que sí la incluye. Sin embargo, no hay evidencia directa en la documentación consultada.
- Capacidades de agente y razonamiento multi-paso: no se ha documentado específicamente para esta adaptación, aunque el modelo base Qwen3.5-9B las posee.
- Limitación de modalidades: no se ha indicado soporte para visión, audio u otras modalidades; se trata de un modelo exclusivamente de texto.

## Casos de uso

- Traducción automática entre lenguas africanas y lenguas globales: el modelo puede emplearse para traducir textos entre lenguas africanas y el inglés, francés u otras lenguas, aprovechando su adaptación mediante CPT. Sería adecuado para organizaciones que necesiten procesar documentación multilingüe en regiones africanas.
- Atención al cliente automatizada en lenguas africanas: con su capacidad multilingüe, puede gestionar conversaciones de soporte en lenguas como suajili o yoruba, reduciendo la barrera lingüística en servicios digitales dirigidos a poblaciones africanas.
- Generación de contenido localizado: creación de artículos, resúmenes o materiales educativos en lenguas africanas, útil para medios de comunicación, ONGs o instituciones educativas que operan en estos contextos.
- Análisis de sentimiento y moderación de contenido en redes sociales: al comprender matices lingüísticos de lenguas africanas, puede aplicarse a tareas de clasificación de texto y detección de discursos de odio en plataformas digitales.
- Asistente virtual para servicios públicos: integración en chatbots gubernamentales o de salud que atiendan a ciudadanos en su lengua materna, mejorando la accesibilidad de servicios esenciales.
- Investigación lingüística y preservación de lenguas: el modelo puede utilizarse para transcribir, documentar o generar recursos en lenguas africanas con pocos recursos digitales, apoyando proyectos de revitalización lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para esta adaptación específica, ni comparaciones con otros modelos multilingües africanos.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantización, un modelo de 9B en GGUF requiere aproximadamente entre 5 GB (Q4_K_M) y 9 GB (f16) de memoria. La cuantización Q4_K_M es la más equilibrada para GPU de consumo.
- GPU recomendadas: una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M sin problemas. Para la versión f16 se recomienda una GPU con 12 GB o más, como RTX 4070 Ti o superior.
- Compatibilidad con hardware de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8 GB, y las versiones Q2_K o Q3_K pueden ejecutarse incluso en 6 GB de VRAM.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. También puede usarse con vLLM si se convierte a safetensors, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de mediciones específicas, pero para un modelo de 9B en una GPU moderna se puede esperar una generación de entre 20 y 40 tokens por segundo con cuantización Q4_K_M, dependiendo del hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos multilingües africanos. Se puede mencionar que existen alternativas como AfroLM, Serengeti o modelos de la familia Llama adaptados a lenguas africanas, pero no se dispone de datos de rendimiento comparables en la información proporcionada. La comparativa queda pendiente de futuras publicaciones de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una adaptación de Qwen3.5-9B, puede heredar sesgos presentes en los datos de preentrenamiento originales, así como sesgos introducidos por el corpus de CPT si este no está equilibrado entre las 50 lenguas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en lenguas con pocos datos de entrenamiento. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, por lo que se desconoce si es la misma que la de Qwen3.5-9B (típicamente 32.768 tokens) o si se ha modificado durante el CPT.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si el uso comercial está permitido. Se recomienda contactar con los autores antes de utilizarlo en producción.
- Cobertura lingüística desigual: es probable que el rendimiento varíe significativamente entre las 50 lenguas, dependiendo de la cantidad de datos disponibles para cada una durante el entrenamiento. Las lenguas con más recursos probablemente funcionen mejor.
- Formato GGUF: la versión cuantizada puede presentar una ligera degradación de calidad respecto al modelo original en f16, especialmente en las cuantizaciones más agresivas como Q2_K.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-GGUF
- Modelo original en Hugging Face: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs
- Repositorio GitHub de AfriqueLLM: https://github.com/McGill-NLP/AfriqueLLM
