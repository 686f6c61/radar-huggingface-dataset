# DT4H/CardioBERTa.nl_translations_only

## Resumen

`DT4H/CardioBERTa.nl_translations_only` es un codificador de terminología biomédica en neerlandés desarrollado por el proyecto DataTools4Heart (DT4H), dentro de la familia CardioBERTa de CardioLM. Su propósito principal es la normalización de conceptos clínicos y el entity linking: dado un término clínico en neerlandés, produce un embedding normalizado que permite recuperar candidatos de conceptos UMLS y resolver la equivalencia semántica entre distintas expresiones del mismo concepto.

El modelo se inicializa desde `UMCU/CardioBERTa.nl`, un encoder tipo RoBERTa adaptado al dominio cardiológico mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos monolingües. Posteriormente se especializa con tripletas supervisadas por CUI (Concept Unique Identifier) y un objetivo de metric learning (Multi-Similarity Loss). Con 125,9 millones de parámetros y una ventana de entrenamiento de 25 tokens, está pensado para tareas de recuperación de candidatos y normalización de términos más que para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length=25, aunque el backbone soporta más) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura RoBERTa del backbone CardioBERTa.nl, un encoder monolingüe adaptado a cardiología mediante continued pretraining con masked language modeling sobre corpus biomédicos y cardiológicos en neerlandés. La especialización se realiza mediante metric learning: se construyen tripletas (anchor, positive, negative) a partir de pares de términos sinónimos supervisados por CUI de la terminología UMLS, y se entrena con Multi-Similarity Loss para separar conceptos distintos y agrupar sinónimos en el espacio de embeddings.

El conjunto de entrenamiento incluye 73.383 tripletas, cubriendo 73.383 CUIs y 144.382 términos normalizados únicos, con una media de 2 términos por CUI. El entrenamiento se realizó con pooling CLS, un solo epoch, batch size 256, learning rate 2e-5 y longitud máxima de secuencia de 25 tokens. La terminología de entrenamiento no se distribuye en el repositorio por restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica en neerlandés (feature extraction).
- Normalización de conceptos clínicos y entity linking: dado un término, produce un embedding comparable para recuperar el CUI correspondiente.
- Recuperación de candidatos (candidate retrieval) para pipelines de entity linking.
- Integración con sistemas de NLP clínico que requieran mapeo a UMLS.
- Soporte de procesamiento de secuencias cortas (hasta 25 tokens en entrenamiento, aunque el backbone permite más).
- No tiene capacidades de generación de texto, tool calling, agentes ni visión.

## Casos de uso

- **Normalización de conceptos en informes de cardiología**: el modelo convierte términos libres (p. ej. "hartfalen", "myocardinfarct") en embeddings que permiten asignar el CUI correspondiente, facilitando la estandarización de historias clínicas.
- **Entity linking en registros médicos electrónicos**: integrado en un pipeline de NLP clínico, asocia menciones a entidades UMLS, mejorando la interoperabilidad entre sistemas sanitarios.
- **Búsqueda semántica de terminología biomédica**: permite recuperar términos equivalentes en neerlandés a partir de una consulta libre, útil para sistemas de ayuda al diagnóstico o codificación.
- **Enriquecimiento de ontologías locales**: dado un término propio de una institución, se puede mapear al estándar UMLS mediante el embedding generado.
- **Preprocesamiento para NER**: como codificador de características, puede alimentar capas de clasificación para tareas de reconocimiento de entidades en textos cardiológicos neerlandeses.
- **Interoperabilidad multilingüe**: aunque el modelo es monolingüe, al estar alineado con la familia CardioBERTa de otros idiomas, puede servir como puente para alinear términos en neerlandés con sus equivalentes en otros idiomas a través de UMLS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o tareas de normalización de conceptos. Tampoco se proporcionan comparativas con otros modelos de embedding biomédicos en neerlandés.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~126M parámetros; en FP32, el checkpoint ocupa aproximadamente 0,5 GB (según el tamaño del repositorio). En FP16, cabría en ~250 MB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (p. ej. NVIDIA T4, GTX 1650, RTX 3060). También puede ejecutarse en CPU sin problemas.
- **Ajuste en consumer GPU**: sí, cabe en cualquier GPU de consumo actual (RTX 3060 o superior) y también en CPU.
- **Opciones de despliegue**: compatible con la librería `transformers` de HuggingFace, y con `text-embeddings-inference` (TEI) como endpoint de embeddings. También puede usarse con `sentence-transformers` si se envuelve el modelo y tokenizer.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de este tamaño, la latencia de una sola pasada es del orden de milisegundos en GPU, y se puede procesar un lote de cientos de secuencias por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para neerlandés biomédico con las mismas características (metric learning para normalización de conceptos). Se podrían considerar alternativas como `MedRoBERTa.nl` (también neerlandés biomédico) o `CardioBERTa.nl` (el backbone), pero no se han publicado comparativas directas en la documentación del modelo. Por tanto, no se incluye tabla comparativa.

## Limitaciones y advertencias

- **Idioma**: solo entrenado para neerlandés; no es útil para otros idiomas sin adaptación.
- **Longitud de secuencia**: entrenado con máximo de 25 tokens; para términos más largos puede no estar optimizado, aunque el backbone soporta más.
- **Terminología no distribuida**: los datos de entrenamiento provienen de UMLS y no se publican por restricciones de licencia. Esto limita la reproducibilidad y el análisis de sesgos.
- **Uso clínico**: no debe usarse para toma de decisiones clínicas directas. Es una herramienta de NLP auxiliar.
- **Riesgo de alucinación**: como encoder, no genera texto, pero puede producir embeddings incorrectos para términos fuera de dominio o muy especializados, lo que afecta a la precisión del entity linking.
- **Licencia**: no se especifica una licencia, lo que impide conocer las restricciones de uso comercial y redistribución.

## Enlaces

- Modelo en Hugging Face: [DT4H/CardioBERTa.nl_translations_only](https://huggingface.co/DT4H/CardioBERTa.nl_translations_only)
- Organización DT4H en Hugging Face: [DT4H](https://huggingface.co/DT4H)
- Proyecto DataTools4Heart (página oficial): [https://www.datatools4heart.eu/](https://www.datatools4heart.eu/)
- GitHub de DataTools4Heart: [https://github.com/DataTools4Heart/](https://github.com/DataTools4Heart/)
- Referencia del paper: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (no se ha encontrado enlace directo al paper en la información proporcionada).
