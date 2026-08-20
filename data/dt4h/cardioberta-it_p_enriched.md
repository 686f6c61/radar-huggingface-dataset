# DT4H/CardioBERTa.it_P_enriched

## Resumen

`DT4H/CardioBERTa.it_P_enriched` es un codificador de terminología biomédica en italiano, especializado en normalización de conceptos clínicos y entity linking. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo centrado en la creación de herramientas de análisis de datos cardiológicos preservando la privacidad. El modelo parte del backbone `DT4H/CardioBERTa.it`, un encoder de la familia CardioBERTa, y se ha ajustado mediante metric learning sobre pares de términos supervisados por conceptos UMLS (CUI), utilizando una estrategia de tripletes enriquecida con relaciones ontológicas de nivel «parent».

Con 109,9 millones de parámetros y una arquitectura de tipo transformer encoder, el modelo está diseñado para generar representaciones vectoriales (embeddings) de términos clínicos, permitiendo recuperar candidatos, normalizar conceptos y enlazar entidades en textos cardiológicos. Su ventana de contexto es limitada (25 tokens), lo que lo hace adecuado para términos y expresiones cortas, no para documentos completos. Es una herramienta específica para pipelines de NLP clínico en italiano, especialmente en el dominio de la cardiología, y no está pensado para generación de texto ni para uso diagnóstico directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer basado en BERT (familia CardioBERTa) |
| Parametros totales | 109.927.680 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 25 tokens (máximo de entrada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (`it`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa, una suite de encoders lingüísticos pequeños adaptados al dominio de la cardiología mediante preentrenamiento continuado con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos monolingües. El backbone `DT4H/CardioBERTa.it` es la versión italiana de esta familia, que cubre además checo, neerlandés, inglés, rumano, español y sueco.

Sobre este backbone, `DT4H/CardioBERTa.it_P_enriched` se ha ajustado mediante metric learning con el objetivo de Multi-Similarity Loss. Se utilizaron 1.597.673 tripletes generados a partir de pares de términos clínicos supervisados por conceptos UMLS (CUIs), enriquecidos con relaciones ontológicas de tipo «parent» (es decir, términos que comparten un ancestro común en la jerarquía UMLS). El entrenamiento empleó pooling sobre el token `[CLS]`, una época, batch size de 256, learning rate de 2e-5 y una longitud máxima de secuencia de 25 tokens. La terminología de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos en italiano, normalizados con norma L2, listos para búsqueda por similitud coseno.
- Entity linking y normalización de conceptos: asigna términos textuales a conceptos UMLS (CUIs) mediante recuperación de candidatos.
- Recuperación de información biomédica: búsqueda semántica de términos y conceptos en corpus cardiológicos.
- Soporte para pipelines de NLP clínico: extracción de entidades, codificación automática de diagnósticos y procedimientos.
- Integración con librerías de embeddings como sentence-transformers o FAISS para indexación y búsqueda a gran escala.
- Compatible con Hugging Face Inference Endpoints y la librería `transformers` para despliegue en producción.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Normalización de términos clínicos en historias clínicas electrónicas italianas: el modelo convierte expresiones libres (p. ej., «infarto miocardico acuto») en vectores que permiten mapearlas a conceptos UMLS estandarizados, facilitando la codificación y el análisis posterior.
- Entity linking en literatura cardiológica: dado un artículo o abstract en italiano, se pueden extraer menciones de enfermedades, fármacos o procedimientos y enlazarlas a CUIs mediante búsqueda de vecinos cercanos en el espacio de embeddings.
- Recuperación de candidatos para sistemas de ayuda al diagnóstico: a partir de una descripción sintomática, el modelo recupera conceptos cardiológicos relevantes que pueden alimentar motores de reglas o sistemas de soporte a la decisión.
- Búsqueda semántica en bases de datos de ensayos clínicos: permite encontrar estudios relacionados con conceptos cardiológicos específicos a partir de consultas en lenguaje natural italiano.
- Codificación automática de diagnósticos (p. ej., ICD-10): integrado en un pipeline de extracción de entidades, el modelo ayuda a asignar códigos estandarizados a términos clínicos, reduciendo trabajo manual.
- Indexación de terminología biomédica para portales de salud: se pueden generar embeddings de todos los términos de un vocabulario cardiológico y ofrecer búsqueda por similitud a usuarios o sistemas, mejorando la interoperabilidad semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento comparativo en tareas como MMLU, HumanEval o GSM8K, dado que el modelo no está diseñado para razonamiento general ni generación de código. Tampoco se han reportado métricas específicas de entity linking o normalización de conceptos en el repositorio.

## Requisitos de hardware

- Modelo pequeño (109,9M parámetros), con un tamaño de pesos de aproximadamente 440 MB en float32 y 220 MB en float16.
- Inferencia en CPU viable para tareas por lotes; en GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o superiores).
- Para despliegue en producción, se recomienda usar Hugging Face Inference Endpoints, o bien servir los embeddings con librerías como `sentence-transformers` y un índice FAISS para búsqueda.
- Al ser un modelo de embeddings, no requiere decodificación autoregresiva; la latencia por consulta es del orden de milisegundos en GPU y de decenas de milisegundos en CPU, dependiendo del hardware y del tamaño del lote.
- No se han reportado requisitos específicos de memoria más allá del tamaño del modelo y el tokenizador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la misma tarea (codificador de terminología biomédica italiana con entity linking a UMLS). El modelo base `DT4H/CardioBERTa.it` es el punto de partida, pero no hay datos de rendimiento comparativo con otros sistemas como BioBERT, ClinicalBERT o modelos multilingües como XLM-R. Por tanto, no se puede ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en italiano; no es aplicable a otros idiomas sin reentrenamiento.
- Longitud de contexto muy limitada (25 tokens), lo que impide procesar frases largas o documentos completos; solo es adecuado para términos y expresiones cortas.
- No está diseñado para generación de texto ni para tareas de razonamiento; su uso se limita a representación y recuperación.
- La terminología de entrenamiento no se distribuye por restricciones de licencia UMLS, lo que puede limitar la reproducibilidad completa del entrenamiento.
- La licencia del modelo no está especificada en el repositorio; se debe contactar con los autores para aclarar los términos de uso comercial.
- No se han publicado evaluaciones de sesgos ni análisis de errores en dominios clínicos específicos; se recomienda validar el modelo en el caso de uso concreto antes de integrarlo en entornos clínicos reales.
- No está destinado a la toma de decisiones clínicas directas; su salida debe ser interpretada por profesionales sanitarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.it_P_enriched
- Organización DT4H en Hugging Face: https://huggingface.co/datasets/DT4H/
- Sitio web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Documentación del proyecto: https://datatools4heart.github.io/documentation-hub/
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (proyecto DT4H, Grant Agreement 101057849).
