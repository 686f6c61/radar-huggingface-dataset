# AAU-NLP/Lite-BERT-SL

## Resumen

Lite-BERT-SL es un modelo de etiquetado de secuencias (token classification) desarrollado por el grupo AAU-NLP, especializado en el procesamiento de lenguaje natural financiero. Se basa en la arquitectura BERT (concretamente en `bert-base-uncased`) y ha sido ajustado (fine-tuning) sobre el subconjunto HiFi-KPI Lite, una versión curada manualmente del dataset HiFi-KPI. Su objetivo principal es la extracción jerárquica de indicadores clave de rendimiento (KPI) a partir de informes financieros trimestrales y anuales presentados ante la SEC (formularios 10-K y 10-Q).

El modelo se centra en cuatro categorías generales de KPI: ingresos (revenues), beneficios (earnings), beneficio por acción (EPS) y beneficio antes de intereses e impuestos (EBIT). Esta especialización permite automatizar el parseo de documentos financieros y alinear el texto con las taxonomías iXBRL, un paso crítico para el análisis cuantitativo y la toma de decisiones en mercados de capitales. El modelo cuenta con aproximadamente 108,9 millones de parámetros, un tamaño moderado que lo hace adecuado para despliegues con recursos limitados.

La relevancia de Lite-BERT-SL radica en que aborda un problema práctico muy concreto: la extracción estructurada de KPIs de informes financieros no etiquetados. Mientras que los grandes modelos de lenguaje (LLMs) alcanzan un rendimiento limitado en esta tarea (0,440 F1 en extracción estructurada según el paper), los modelos encoder como este superan 0,906 de macro-F1 en clasificación, lo que demuestra su eficacia y eficiencia para este dominio específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 108.897.031 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lite-BERT-SL es un modelo de tipo BERT-base, es decir, un transformer encoder-only de 12 capas con atención bidireccional. El modelo base es `google-bert/bert-base-uncased`, que fue preentrenado con masked language modeling y predicción de siguiente oración sobre corpus masivos en inglés. El fine-tuning se realizó sobre el dataset HiFi-KPI Lite, un subconjunto de 2.500 instancias extraído del corpus HiFi-KPI completo (1,65 millones de párrafos y 198.000 etiquetas jerárquicas). El ajuste se hizo específicamente para la tarea de etiquetado de secuencias, donde cada token del texto se clasifica según la categoría de KPI a la que pertenece (o fuera de ninguna).

No se dispone de información detallada sobre el proceso de entrenamiento (número de épocas, tasa de aprendizaje, etc.) en la documentación pública. El modelo fue introducido en el paper "HiFi-KPI: A Dataset for Hierarchical KPI Extraction from Earnings Filings", donde se describen las tareas de clasificación, extracción y extracción estructurada de KPIs. El paper también señala que los errores de extracción se relacionan principalmente con fechas, lo que sugiere una limitación en el manejo de expresiones temporales.

## Capacidades

- Extracción de entidades nombradas (NER) para indicadores financieros: identifica y clasifica segmentos de texto que corresponden a ingresos, beneficios, EPS y EBIT.
- Etiquetado de secuencias a nivel de token, lo que permite localizar con precisión los valores numéricos y las descripciones asociadas a cada KPI.
- Procesamiento de texto en inglés, específicamente de informes financieros formales (10-K y 10-Q).
- Alineación de texto con taxonomías iXBRL, facilitando la conversión de informes no etiquetados a formatos estructurados.
- No soporta generación de texto, razonamiento conversacional, tool calling ni otras capacidades propias de modelos generativos. Es un modelo puramente discriminativo para tareas de clasificación de tokens.

## Casos de uso

- Automatización del análisis de informes 10-K y 10-Q: el modelo puede procesar documentos completos y extraer automáticamente los valores de ingresos, beneficios, EPS y EBIT, reduciendo el trabajo manual de analistas financieros.
- Alimentación de bases de datos financieras: los KPIs extraídos pueden insertarse en sistemas de gestión de datos para alimentar dashboards, modelos de valoración o algoritmos de trading cuantitativo.
- Verificación de consistencia con etiquetas iXBRL: dado que el modelo aprende a reconocer KPIs de forma generalizada, puede utilizarse para comprobar si los etiquetados iXBRL existentes en un informe son correctos o están incompletos.
- Análisis histórico de tendencias: al extraer KPIs de múltiples informes de una misma empresa a lo largo del tiempo, se pueden construir series temporales para estudiar la evolución de los indicadores.
- Asistencia en la preparación de informes financieros: puede servir como herramienta de apoyo para redactores que necesiten etiquetar manualmente sus documentos, sugiriendo las categorías adecuadas para cada fragmento.
- Integración en pipelines de NLP financiero: al ser un modelo ligero y de código abierto, puede desplegarse como componente de un sistema mayor que combine extracción, normalización y análisis.

## Benchmarks y rendimiento

Según el paper "HiFi-KPI: A Dataset for Hierarchical KPI Extraction from Earnings Filings", los modelos basados en encoder (como Lite-BERT-SL) superan 0,906 de macro-F1 en la tarea de clasificación sobre el dataset HiFi-KPI Lite. En contraste, los grandes modelos de lenguaje (LLMs) alcanzan solo 0,440 de F1 en la tarea de extracción estructurada. No se proporcionan métricas desglosadas por categoría ni comparaciones con otros modelos específicos en la información disponible.

| Tarea | Métrica | Resultado |
|---|---|---|
| Clasificación (HiFi-KPI Lite) | macro-F1 | > 0,906 |
| Extracción estructurada (LLMs) | F1 | 0,440 |

Para métricas más detalladas, se recomienda consultar el paper completo.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware para Lite-BERT-SL. Sin embargo, al tratarse de un modelo BERT-base con aproximadamente 109 millones de parámetros, su huella de memoria es relativamente baja. En precisión FP32, los pesos ocupan unos 436 MB, mientras que en FP16 se reducen a unos 218 MB. Esto permite ejecutarlo en GPUs de consumo como una NVIDIA RTX 3060 (12 GB) o incluso en CPU para inferencia por lotes pequeños. Para despliegues en producción, se puede utilizar vLLM, Hugging Face Inference Endpoints o Transformers con PyTorch. No se han publicado mediciones de latencia o throughput específicas para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación pública de Lite-BERT-SL. El paper menciona que los modelos encoder superan a los LLMs en la tarea de clasificación, pero no se citan nombres concretos de otros modelos de extracción de KPIs. Por tanto, no se puede realizar una comparativa cuantitativa con alternativas específicas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que no es aplicable a informes financieros en otros idiomas sin un reentrenamiento previo.
- Solo reconoce cuatro categorías de KPI (revenues, earnings, EPS, EBIT). No cubre otros indicadores como EBITDA, flujo de caja o márgenes.
- Según el análisis cualitativo del paper, los errores de extracción se concentran en fechas, lo que puede afectar a la precisión cuando los KPI incluyen referencias temporales.
- El dataset HiFi-KPI Lite es un subconjunto reducido (2.500 instancias), por lo que el modelo puede no generalizar perfectamente a variaciones de redacción no presentes en el entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones de uso adicionales, pero se recomienda revisar los términos completos de la licencia.
- Al ser un modelo de etiquetado de secuencias, no es adecuado para tareas generativas o de razonamiento complejo. Su uso debe limitarse a la extracción de entidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/Lite-BERT-SL
- Paper (arXiv): https://huggingface.co/papers/2502.15411
- Paper (ACL Anthology): https://aclanthology.org/2026.lrec-1.30/
- Dataset HiFi-KPI Lite: https://huggingface.co/datasets/AAU-NLP/hifi-kpi-lite
- Repositorio de código oficial: https://github.com/aaunlp/HiFi-KPI
