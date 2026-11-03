# sander-puts/codiesp-mention-lead-es

## Resumen

Codiesp-mention-lead-es es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto clínico en castellano, desarrollado por el investigador Sander Puts. Su función concreta es doble: detectar menciones de diagnósticos y procedimientos (tanto menciones externas como anidadas) en informes clínicos y, además, identificar el término principal (*lead term*) de cada mención, es decir, la palabra que un codificador buscaría en el índice alfabético de la CIE-10. Por ejemplo, para la expresión "insuficiencia cardiaca diastólica crónica", el modelo señala "insuficiencia" como término de cabecera.

El modelo se construye sobre el encoder PlanTL-GOB-ES/roberta-base-biomedical-clinical-es (licencia Apache-2.0), un RoBERTa base adaptado al dominio biomédico y clínico en español, al que se le añaden tres cabezas de clasificación de tokens: una para menciones externas, otra para menciones anidadas y otra para el término principal. El repositorio separa explícitamente el encoder afinado (`encoder/`) de los pesos de las cabezas (`heads.pt`), lo que refleja un diseño modular pensado para integrarse en un pipeline mayor.

Su relevancia radica en que forma parte de CEI-Trace, un proyecto que codifica texto clínico según los libros oficiales de la CIE-10 utilizando modelos de lenguaje locales y añade las guías y prácticas de cada entorno como capas separadas. El modelo cubre así la fase de extracción de menciones y términos de cabecera, paso previo a la asignación de códigos. Está entrenado exclusivamente con anotaciones del corpus CodiEsp y no está destinado a uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base biomédico-clínico) con tres cabezas de token-classification |
| Parametros totales | no disponible (modelo base tipo RoBERTa base; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento de 256 tokens con stride 128; límite del encoder RoBERTa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (encoder) y `heads.pt` (cabezas); tamaño del repo 0.5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa en su variante base, preentrenado sobre corpus biomédicos y clínicos en español (PlanTL-GOB-ES/roberta-base-biomedical-clinical-es). Sobre la representación del encoder se montan tres cabezas de clasificación de tokens independientes: detección de mención externa, detección de mención anidada y detección del término principal. Esta separación permite manejar estructuras de mención solapadas, frecuentes en terminología médica compuesta.

El entrenamiento se realizó con las anotaciones de entrenamiento de CodiEsp, con los términos principales derivados de las propias anotaciones y completados en parte mediante un modelo comercial en la nube (Claude). Se configuró con 10 épocas, tasa de aprendizaje 3e-5, tamaño de lote 4, ventanas de 256 tokens con stride 128 y semilla 2025. La época final se seleccionó sobre el conjunto de desarrollo, alcanzando un F1 de solapamiento de mención externa de 0.854. La inferencia se realiza mediante el script `ner_predict.py` del repositorio CEI-Trace, y la arquitectura de las cabezas está definida en `scripts/ner_train.py`.

## Capacidades

- Detección de menciones de diagnósticos y procedimientos en texto clínico en español, incluyendo menciones externas y anidadas.
- Identificación del término principal (*lead term*) de cada mención, orientado a la consulta del índice alfabético de la CIE-10.
- Clasificación de tokens a nivel de subpalabra sobre ventanas deslizantes con solapamiento (stride 128), lo que permite procesar documentos más largos que la ventana de entrenamiento.
- Procesamiento de texto clínico especializado gracias al preentrenamiento de dominio del encoder base.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo *thinking*: es un modelo discriminativo de etiquetado de tokens.
- No dispone de capacidades de visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al español; no se documentan otros idiomas.

## Casos de uso

- Extracción de menciones para codificación CIE-10: el modelo identifica los fragmentos de diagnóstico y procedimiento en informes clínicos y señala el término de cabecera, que se usa como entrada para la búsqueda en el índice alfabético de la CIE-10 dentro del pipeline CEI-Trace.
- Preprocesado de pipelines de *clinical coding*: al separar menciones externas y anidadas, permite construir candidatos de código más precisos en sistemas de asignación automática de códigos, reduciendo el ruido de términos irrelevantes.
- Normalización terminológica: el término principal detectado sirve como clave de normalización hacia vocabularios controlados (CIE-10, SNOMED CT), facilitando la reconciliación entre texto libre y ontologías.
- Análisis de cohortes retrospectivas: procesar lotes de informes publicados (por ejemplo, casos clínicos de CodiEsp) para extraer diagnósticos y procedimientos y agregarlos en estudios descriptivos.
- Enriquecimiento de historiales electrónicos: etiquetar secciones de texto clínico con menciones estructuradas para su indexación y búsqueda posterior en sistemas de información hospitalaria.
- Investigación en NLP clínico en español: servir como componente base o línea de comparación en experimentos de NER biomédico y de detección de términos de cabecera, dado que su licencia CC BY 4.0 permite reutilización con atribución.
- Construcción de capas de guías y práctica local: dentro de CEI-Trace, las menciones y términos extraídos alimentan las capas de guías y práctica de cada entorno sobre el núcleo oficial de la CIE-10.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| F1 de solapamiento de mención externa | 0.854 | Desarrollo (CodiEsp) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder tipo RoBERTa base (repo de 0.5 GB con encoder y cabezas), la inferencia en FP32 requiere aproximadamente 1-2 GB de VRAM; en FP16 aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en tarjetas de consumo como GTX 1650, RTX 3060, RTX 4090, así como en A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo `transformers` con cabezas personalizadas, la vía documentada es el script `ner_predict.py` del repositorio CEI-Trace; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sander-puts/codiesp-mention-lead-es | no disponible (RoBERTa base) | 512 tokens | NER clínico + término principal CIE-10 | CC BY 4.0 | HuggingFace |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | no disponible (RoBERTa base) | 512 tokens | Encoder de dominio biomédico (base) | Apache-2.0 | HuggingFace |
| Modelos NER clínicos en español sobre CodiEsp | no disponible | 512 tokens | NER de menciones clínicas | variable | HuggingFace |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- No apto para uso clínico: el propio autor lo indica explícitamente; no debe emplearse en decisiones diagnósticas o terapéuticas.
- Entrenado únicamente con anotaciones de CodiEsp (informes de casos clínicos publicados), por lo que su generalización a otros géneros textuales o a jerga hospitalaria real no está validada.
- Los términos principales se derivaron en parte mediante un modelo comercial en la nube (Claude), lo que puede introducir errores sistemáticos en esa anotación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la detección de menciones, especialmente en expresiones anidadas o abreviaturas no vistas.
- Contexto limitado a 512 tokens del encoder; los documentos largos requieren segmentación con solapamiento, lo que puede fragmentar menciones en los límites de ventana.
- Cobertura monolingüe en español; no se ha evaluado en otras lenguas ni en variantes dialectales.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar las condiciones de la anotación original de CodiEsp (también CC BY 4.0) y del encoder base (Apache-2.0).
- Sin métricas publicadas de latencia, throughput ni robustez fuera del conjunto de desarrollo; el F1 de 0.854 corresponde a solapamiento de mención externa en desarrollo, no a un conjunto de test independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sander-puts/codiesp-mention-lead-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020): https://doi.org/10.5281/zenodo.3837305
