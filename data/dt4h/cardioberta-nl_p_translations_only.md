# DT4H/CardioBERTa.nl_P_translations_only

## Resumen

`DT4H/CardioBERTa.nl_P_translations_only` es un codificador de terminología biomédica en neerlandés desarrollado por el proyecto europeo DataTools4Heart (DT4H) para tareas de **normalización de conceptos clínicos y entity linking**. El modelo parte del backbone `UMCU/CardioBERTa.nl`, un encoder de la familia CardioBERTa adaptado a cardiología mediante *continued pretraining* con *masked language modeling* sobre corpus monolingües biomédicos. Sobre esa base, se aplica un entrenamiento especializado con pares de términos supervisados por conceptos UMLS y *metric learning*, lo que permite obtener representaciones vectoriales de alta calidad para términos clínicos.

Con 125,9 millones de parámetros y arquitectura RoBERTa, el modelo está diseñado para integrarse en pipelines de NLP clínico, especialmente en el ámbito de la cardiología. Su relevancia actual radica en la necesidad de estandarizar y estructurar informes médicos heterogéneos en sistemas sanitarios europeos, tal y como promueve la plataforma federada DT4H. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` y `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Neerlandés (`nl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **RoBERTa**, un encoder transformer con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, similar a `roberta-base`. El backbone `UMCU/CardioBERTa.nl` fue adaptado a la cardiología mediante *continued pretraining* con MLM sobre corpus biomédicos y cardiológicos en neerlandés. Sobre esta base, el modelo se especializó con **triplet loss** (Multi-Similarity Loss) usando pares de términos clínicos asociados al mismo concepto UMLS (CUI). La estrategia `parents` enriquece los tripletes con relaciones de ontología de nivel padre, generando **1.619.124 tripletes** que cubren **476.352 CUIs** y **534.325 términos normalizados únicos**. El entrenamiento se realizó con *pooling* CLS, un *learning rate* de 2e-5, *batch size* de 256 y una sola época. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS.

## Capacidades

- Generación de **embeddings de texto** para términos clínicos y conceptos biomédicos (no genera texto).
- **Normalización de conceptos clínicos**: mapeo de términos a identificadores UMLS (CUIs).
- **Entity linking**: recuperación de candidatos para entidades médicas en textos.
- **Metric learning**: similitud semántica entre términos basada en relaciones ontológicas.
- **Recuperación de información biomédica**: búsqueda de conceptos en bases de datos terminológicas.
- **Idioma**: exclusivamente neerlandés (`nl`), no multilingüe.
- No soporta *tool calling*, agentes ni razonamiento multi-paso; es un modelo de representación de texto (feature-extraction).

## Casos de uso

- **Normalización de informes de cardiología**: convierte términos clínicos variables en conceptos UMLS estandarizados para interoperabilidad de datos sanitarios.
- **Entity linking en expedientes electrónicos**: identifica y vincula entidades como fármacos, procedimientos o enfermedades a ontologías biomédicas.
- **Recuperación de candidatos en literatura científica**: dado un término de consulta, obtiene términos relacionados en corpus cardiológicos.
- **Preprocesamiento de datos clínicos**: genera embeddings que alimentan pipelines de clasificación o clustering de documentos médicos.
- **Búsqueda semántica en repositorios de ensayos clínicos**: permite encontrar documentos relevantes por similitud conceptual en neerlandés.
- **Soporte a anotación manual**: como herramienta de ayuda en la codificación de conceptos médicos por parte de personal clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 125 millones de parámetros, la inferencia en FP16 requiere aproximadamente 250 MB de VRAM para los pesos, aunque la memoria total dependerá del *batch size* y la longitud de los inputs.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4090, T4, A10) es suficiente. No se requiere hardware profesional.
- **Compatibilidad con GPUs consumer**: sí, el modelo cabe en cualquier GPU moderna para consumidores.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), `text-embeddings-inference` (TEI), y potencialmente con `ONNX Runtime` si se exporta.
- **Latencia**: al ser un modelo pequeño, la latencia de inferencia es baja (del orden de milisegundos por secuencia corta), aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Especialización | Licencia |
|---|---|---|---|---|
| `DT4H/CardioBERTa.nl_P_translations_only` | 125,9 M | neerlandés | Cardiología + UMLS | no disponible |
| `UMCU/CardioBERTa.nl` | 125,9 M | neerlandés | Cardiología (base) | no disponible |
| `DT4H/CardioBERTa.nl_clinical_NL_MED` | 0,3B | neerlandés | Token classification | no disponible |
| Otros modelos de la familia CardioBERTa (ej. español, inglés) | 125,9 M | varios | Cardiología | no disponible |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) para estos modelos.

## Limitaciones y advertencias

- **Idioma restringido**: solo funciona con textos en neerlandés; no es multilingüe.
- **Contexto corto**: el entrenamiento se realizó con `max_length=25`, por lo que no está optimizado para secuencias largas; se recomienda truncal los inputs a esa longitud.
- **Sesgos y alucinación**: como modelo de embeddings, no genera texto, pero los embeddings pueden reflejar sesgos de los corpus de entrenamiento; no se ha evaluado su sesgo específico.
- **Riesgo clínico**: no debe usarse para decisiones clínicas directas; es solo una herramienta de representación de texto.
- **Licencia**: no se especifica la licencia del modelo, lo que puede limitar su uso comercial sin consulta legal.
- **Terminología no distribuida**: la terminología de entrenamiento no está disponible en el repositorio por restricciones de UMLS, lo que impide reproducir el entrenamiento exacto.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento en tareas estándar de NLP clínico.

## Enlaces

- [Hugging Face: DT4H/CardioBERTa.nl_P_translations_only](https://huggingface.co/DT4H/CardioBERTa.nl_P_translations_only)
- [Colección CardioBERTa en Hugging Face](https://huggingface.co/collections/DT4H/cardioberta-family)
- [Colección Dutch en Hugging Face](https://huggingface.co/collections/DT4H/dutch)
- [Proyecto DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Página oficial de DataTools4Heart](https://www.datatools4heart.eu/)
