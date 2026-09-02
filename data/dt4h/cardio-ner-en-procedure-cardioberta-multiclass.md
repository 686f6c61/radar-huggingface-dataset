# DT4H/cardio-ner-en-procedure-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-procedure-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de procedimientos cardiológicos en textos clínicos en inglés. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por el programa Horizon Europe (acuerdo de subvención n.º 101057849) que busca construir una plataforma federada y respetuosa con la privacidad para la reutilización de datos cardiovasculares.

El modelo se basa en la arquitectura RoBERTa (según los tags del repositorio) y cuenta con 124.647.939 parámetros, un tamaño equivalente al de RoBERTa-base. Está diseñado para la tarea de clasificación de tokens (token-classification) y se distribuye en formato safetensors. Su propósito principal es extraer de manera automática menciones de procedimientos cardiológicos (p. ej., angioplastia, bypass, cateterismo) a partir de informes clínicos, historiales electrónicos u otros documentos médicos en inglés.

La relevancia de este modelo radica en su especialización en el dominio cardiológico, donde la terminología es altamente técnica y específica. Al estar afinado sobre datos clínicos, ofrece una alternativa más precisa que los modelos NER genéricos para tareas de extracción de información en entornos sanitarios. Su integración con la librería Transformers de Hugging Face facilita su uso en pipelines de procesamiento de lenguaje natural médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder-only transformer, según tags del modelo) |
| Parametros totales | 124.647.939 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (presumiblemente 512, estándar de RoBERTa, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el modelo se publica en safetensors; la cuantización dependería de herramientas externas como llama.cpp o transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está construido sobre una arquitectura RoBERTa, un transformer encoder-only con atención bidireccional, optimizado para tareas de comprensión del lenguaje. El número de parámetros (124,6 millones) coincide con la configuración base de RoBERTa, lo que sugiere que se trata de un ajuste fino (fine-tuning) de un modelo preentrenado de ese tamaño, probablemente una variante clínica como BioBERT o CardioBERTa, aunque no se especifica en la documentación disponible.

No se han publicado detalles sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card solo indica que el framework es PyTorch y que la tarea es clasificación de tokens. El modelo se distribuye con un tokenizer de RoBERTa y puede cargarse directamente con `AutoModelForTokenClassification` de Transformers.

## Capacidades

- Reconocimiento de entidades nombradas para procedimientos cardiológicos en inglés (p. ej., angioplastia, stent, bypass, ablación).
- Clasificación de tokens a nivel de secuencia, devolviendo etiquetas BIO (Begin, Inside, Outside) para cada token.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Funciona como un componente de extracción de información en pipelines de NLP clínico.
- Soporte de inglés como idioma único (según la metadata).
- No incluye capacidades de generación de texto, razonamiento, tool calling ni visión; es exclusivamente un modelo discriminativo para NER.

## Casos de uso

- **Extracción de procedimientos en informes de cateterismo**: el modelo puede identificar automáticamente menciones de procedimientos como "angioplastia coronaria" o "colocación de stent" en informes de hemodinámica, facilitando la codificación y el análisis retrospectivo.
- **Anotación de historiales clínicos para investigación**: permite etiquetar grandes volúmenes de notas clínicas en inglés para construir bases de datos estructuradas de procedimientos cardiológicos, útiles en estudios epidemiológicos o ensayos clínicos.
- **Soporte a la codificación ICD-10**: al extraer procedimientos específicos, el modelo puede asistir en la asignación de códigos de procedimiento, reduciendo el trabajo manual de codificadores médicos.
- **Monitorización de calidad asistencial**: identificar procedimientos realizados en una población de pacientes a partir de texto libre para auditar la adherencia a guías clínicas.
- **Integración en sistemas de historia clínica electrónica**: como componente de un pipeline que procesa notas médicas en tiempo real y actualiza automáticamente los registros estructurados del paciente.
- **Análisis de literatura científica**: extraer procedimientos cardiológicos descritos en artículos de investigación para crear resúmenes estructurados o bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como F1, precisión o recall, ni comparaciones con otros modelos NER clínicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de ~125 millones de parámetros, el uso de memoria es bajo. En precisión FP32, el modelo ocupa aproximadamente 0,5 GB; en FP16, unos 0,25 GB. Con cuantización a 8 bits, podría reducirse a ~125 MB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1060, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU para inferencia por lotes, aunque con mayor latencia.
- **Cabe en GPU de consumo**: sí, cualquier tarjeta moderna de consumo (RTX 3060, RTX 4070, etc.) lo ejecuta con holgura.
- **Opciones de despliegue**: al ser un modelo de Transformers, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks optimizados como vLLM o TGI (aunque para NER, la inferencia directa con PyTorch es suficiente). También es compatible con la librería `transformers` en Python.
- **Latencia y throughput estimados**: no hay mediciones oficiales. En una GPU T4, la inferencia sobre una secuencia de 128 tokens debería tomar entre 10 y 50 ms; en CPU, entre 100 y 500 ms, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Idioma | Entidades cubiertas | Parámetros | Licencia |
|---|---|---|---|---|
| `DT4H/cardio-ner-en-procedure-cardioberta-multiclass` | Inglés | Procedimientos cardiológicos | 124,6 M | No disponible |
| `DT4H/cardio-ner-en-cardioberta-multiclass` | Inglés | Enfermedades, medicación, procedimientos y síntomas | No disponible (presumiblemente similar) | No disponible |
| `DT4H/cardio-ner-ro-procedure-cardioberta-multiclass` | Rumano | Procedimientos cardiológicos | No disponible (presumiblemente similar) | No disponible |

Los tres modelos pertenecen al mismo proyecto DataTools4Heart y comparten arquitectura probablemente idéntica (RoBERTa base). La diferencia principal radica en el idioma y en el alcance de entidades: el modelo multiclass general cubre cuatro tipos de entidades, mientras que los modelos de procedimiento se centran únicamente en procedimientos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos del dominio**: al estar entrenado probablemente con datos clínicos de una región o institución específica, puede presentar sesgos hacia ciertas terminologías o estilos de redacción clínica, lo que podría afectar su rendimiento en otros contextos.
- **Riesgo de alucinación**: aunque es un modelo discriminativo (no generativo), puede etiquetar incorrectamente entidades no procedimentales como procedimientos, o fallar en reconocer procedimientos poco frecuentes o con variantes terminológicas.
- **Limitaciones de idioma**: solo soporta inglés; no funciona con otros idiomas.
- **Restricciones de licencia**: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con el equipo de DataTools4Heart antes de utilizarlo en entornos productivos.
- **Contexto limitado**: la longitud de contexto no está documentada, pero si sigue el estándar de RoBERTa (512 tokens), no es adecuado para documentos clínicos muy largos sin segmentación previa.
- **Sin garantías de precisión**: al no publicar benchmarks, no hay evidencia objetiva de su rendimiento en tareas reales. Se recomienda evaluar el modelo en un conjunto de validación propio antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/cardio-ner-en-procedure-cardioberta-multiclass)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Sitio web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Documentación de DataTools4Heart](https://datatools4heart.github.io/documentation-hub/)
