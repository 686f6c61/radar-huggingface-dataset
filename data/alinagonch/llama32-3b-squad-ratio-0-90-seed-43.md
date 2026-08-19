# AlinaGonch/llama32-3b-squad-ratio-0.90-seed-43

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.90-seed-43` es un ajuste fino (fine-tuning) del modelo base Llama 3.2 3B, desarrollado por Alina Hancharova (usuario de Hugging Face `AlinaGonch`) como parte de un experimento sistemático sobre el dataset SQuAD 2.0. El nombre del repositorio indica que se ha entrenado con una proporción de 0.90 de muestras no respondibles (preguntas sin respuesta en el contexto) y una semilla aleatoria de 43. Este trabajo forma parte de una colección más amplia en la que se varía el ratio de muestras no respondibles para estudiar su efecto en el rendimiento de modelos de pregunta-respuesta.

El modelo está basado en la arquitectura Transformer de Llama 3.2 3B, con aproximadamente 3 mil millones de parámetros, aunque no se especifica la longitud de contexto ni otros detalles técnicos en la ficha publicada. La relevancia de este modelo radica en que aborda un problema práctico en sistemas de QA: cómo manejar preguntas que no tienen respuesta en el contexto proporcionado, un aspecto crítico para aplicaciones reales donde los documentos pueden no contener la información solicitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Llama 3.2 3B) |
| Parametros totales | 3B (estimado, basado en el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset SQuAD 2.0 es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo Llama 3.2 3B, que emplea una arquitectura Transformer estándar con mecanismos de atención de múltiples cabezas. El fine-tuning se ha realizado sobre el dataset SQuAD 2.0, que combina preguntas respondibles y no respondibles sobre un conjunto de pasajes de Wikipedia. El ratio 0.90 en el nombre indica que el 90% de las muestras de entrenamiento son preguntas no respondibles (es decir, preguntas para las que no existe respuesta en el contexto dado), mientras que el 10% restante son preguntas con respuesta. Este diseño experimental busca determinar la proporción óptima de muestras negativas para mejorar la robustez del modelo ante preguntas sin respuesta.

No se dispone de información adicional sobre el procedimiento de entrenamiento, hiperparámetros, número de épocas, técnicas de regularización o si se utilizó algún método de alineación como RLHF o DPO. La ficha del modelo es una plantilla genérica generada automáticamente y no aporta detalles técnicos más allá del nombre y los tags. El tag `arxiv:1910.09700` hace referencia al paper de SQuAD 2.0 (Rajpurkar et al., 2018), lo que confirma la vinculación con este dataset.

## Capacidades

- Pregunta-respuesta extractiva: el modelo puede identificar y extraer respuestas a partir de un contexto dado, tarea principal para la que fue ajustado.
- Detección de preguntas no respondibles: gracias al entrenamiento con un 90% de muestras negativas, el modelo está especialmente entrenado para reconocer cuándo una pregunta no tiene respuesta en el contexto, devolviendo una señal de "no respondible".
- Generación de texto: al estar basado en Llama 3.2 3B, conserva las capacidades generales de generación de texto del modelo base, aunque el fine-tuning puede haber reducido su rendimiento en tareas ajenas al QA.
- Razonamiento contextual: puede procesar un pasaje de texto y responder preguntas que requieren comprensión lectora básica.
- Soporte multilingüe: no confirmado; el dataset SQuAD 2.0 es exclusivamente en inglés, por lo que el modelo probablemente solo funcione bien en este idioma.
- Tool calling y agentes: no disponible, no se menciona ninguna capacidad específica en este sentido.

## Casos de uso

- Sistemas de atención al cliente con verificación de respuestas: el modelo puede integrarse en un chatbot que reciba consultas de usuarios y un corpus de documentación. Gracias a su entrenamiento con un alto ratio de preguntas no respondibles, puede evitar dar respuestas incorrectas cuando la información no está en el corpus, indicando que no dispone de la respuesta.
- Motores de búsqueda de documentos internos: en una empresa, se puede usar para responder preguntas sobre manuales o políticas. El modelo señala cuándo una pregunta no tiene respuesta en el documento, reduciendo la generación de contenido falso.
- Evaluación de calidad de datasets de QA: sirve como herramienta de análisis para detectar preguntas ambiguas o sin respuesta en colecciones de datos, ayudando a mejorar la curaduría de datasets.
- Asistentes de lectura de artículos científicos: dado un resumen o abstract, el modelo puede responder preguntas factuales y rechazar aquellas que no se puedan responder con el texto proporcionado.
- Plataformas educativas: para generar ejercicios de comprensión lectora donde se pida al alumno identificar si una afirmación es respondible o no a partir de un texto.
- Prototipos de investigación en NLP: al ser un modelo pequeño (3B) y de código abierto, es adecuado para experimentos académicos sobre el impacto del ratio de muestras negativas en modelos de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de SQuAD 2.0 (como F1 o EM) para este modelo concreto. El autor no ha incluido ninguna tabla de evaluación en la model card.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B en precisión fp16, se necesitan aproximadamente 6 GB de VRAM solo para los pesos. Con cuantización de 4 bits, la demanda se reduce a unos 2-3 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en fp16 (por ejemplo, NVIDIA RTX 3060, RTX 3070, RTX 4060). Para cuantización 4-bit, una GPU con 4 GB puede ser suficiente (GTX 1650, RTX 3050).
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo actuales, incluso en versiones cuantizadas.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con la librería transformers, se puede servir con vLLM, TGI, o usar en local con Hugging Face Transformers. También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF preconvertido.
- Latencia y throughput: no disponible, no se han publicado mediciones específicas. Para un modelo de 3B en una GPU moderna, se espera una latencia de decenas de milisegundos por token en fp16.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo es un fine-tuning de Llama 3.2 3B, por lo que su rendimiento base debería ser similar al de este último en tareas de lenguaje general, pero el ajuste a SQuAD 2.0 lo especializa en QA. Como alternativas comparables se podrían considerar:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Llama 3.2 3B (base) | 3B | 128k | Generacion general | Llama 3.2 Community License |
| BERT-large (fine-tuned en SQuAD) | 340M | 512 | QA extractivo | Apache 2.0 |
| RoBERTa-large (fine-tuned en SQuAD) | 355M | 512 | QA extractivo | MIT |

Sin embargo, no hay datos de rendimiento publicados para este modelo concreto, por lo que no se puede establecer una comparación numérica fiable.

## Limitaciones y advertencias

- Sesgos del dataset: SQuAD 2.0 se basa en artículos de Wikipedia en inglés, por lo que el modelo puede tener sesgos culturales, geográficos y temáticos asociados a ese corpus.
- Riesgo de alucinación: al ser un modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en preguntas que no están cubiertas por el contexto. El entrenamiento con un alto ratio de preguntas no respondibles debería mitigar esto, pero no lo elimina por completo.
- Limitaciones de idioma: no se ha confirmado soporte multilingüe; es probable que el modelo solo funcione bien en inglés.
- Licencia no especificada: la model card no indica ninguna licencia, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Contexto limitado: aunque el modelo base Llama 3.2 3B soporta hasta 128k tokens, no se ha confirmado que este fine-tuning mantenga esa capacidad. El entrenamiento con SQuAD 2.0 utiliza pasajes cortos, por lo que el rendimiento con contextos muy largos puede degradarse.
- Repositorio sin mantenimiento: el modelo tiene 0 descargas y 0 likes, y la model card es una plantilla vacía. Esto sugiere que es un experimento de investigación sin soporte activo ni documentación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.90-seed-43)
- [Perfil del autor en Hugging Face](https://huggingface.co/AlinaGonch)
- [Paper de SQuAD 2.0 (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Model card de Llama 3.2 de Meta](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/)
- [Página de Llama 3.2 3B en Ollama](https://ollama.com/library/llama3.2:3b)
