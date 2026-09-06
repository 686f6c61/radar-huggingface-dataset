# ivalpa/bert-finetuned-ner

## Resumen

El modelo `ivalpa/bert-finetuned-ner` es un ajuste fino de `BAAI/bge-small-en-v1.5`, un modelo BERT encoder-only de la familia BGE, creado por el usuario `ivalpa` y publicado en Hugging Face. Está destinado a tareas de reconocimiento de entidades nombradas (NER, por sus siglas en inglés) mediante clasificación de tokens, como indica su pipeline `token-classification`. El modelo tiene 33.215.625 parámetros y se distribuye con pesos en formato `safetensors`, bajo licencia MIT.

La relevancia de este modelo radica en su pequeño tamaño, que lo hace adecuado para aplicaciones de extracción de entidades en entornos con recursos limitados. Sin embargo, la información disponible es escasa: no se especifica el conjunto de datos de entrenamiento, los idiomas soportados ni la longitud de contexto, lo que obliga a una evaluación previa por parte del usuario antes de su uso en producción. El repositorio tiene un tamaño de 0,9 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) |
| Parametros totales | 33.215.625 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un modelo BERT encoder-only de la familia BGE diseñado originalmente para generar representaciones vectoriales (embeddings). Tras el ajuste fino, se añade una capa de clasificación para token classification, lo que explica la ligera diferencia en el número total de parámetros respecto al modelo base.

Según la model card, el conjunto de datos de entrenamiento no está especificado y se describe como "unknown dataset". El proceso de entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-05, tamaño de lote de 8, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, programador lineal y 10 épocas. No se menciona ningún proceso de RLHF, DPO ni técnicas de decodificación especulativa, ya que se trata de un modelo discriminativo y no generativo.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER): el modelo asigna etiquetas a cada token de un texto de entrada.
- No es un modelo generativo: no produce texto nuevo, por lo que no puede realizar tareas de generación, razonamiento complejo, escritura de código o matemáticas.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio, etc.).
- El idioma de las entidades depende del dataset de entrenamiento, que no se ha documentado, por lo que la cobertura lingüística es desconocida.

## Casos de uso

- Extracción de entidades en documentos legales: puede utilizarse para identificar nombres de personas, organizaciones y fechas en contratos o expedientes, siempre que se valide previamente con un dataset del dominio.
- Análisis de menciones en redes sociales: permite detectar productos, marcas y ubicaciones en textos cortos, lo que facilita el seguimiento de la opinión pública.
- Procesamiento de currículos: puede extraer habilidades, nombres y títulos de candidatos a partir de textos no estructurados, automatizando la clasificación inicial de candidaturas.
- Gestión de tickets de soporte: identifica nombres de clientes, productos y códigos de error en conversaciones o tickets, ayudando a enrutar las incidencias al equipo adecuado.
- Enriquecimiento de datos en CRM: extrae entidades de correos electrónicos y notas internas para completar fichas de contacto y mejorar la segmentación de clientes.
- Análisis de artículos periodísticos: detecta personas, lugares y organizaciones en noticias, lo que permite construir mapas de relaciones o clasificar contenido por tema.

En todos los casos, el modelo es adecuado por su tamaño reducido y su rapidez, pero es imprescindible verificar su rendimiento con el conjunto de datos específico de cada dominio, dado que la información de entrenamiento es desconocida.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que el modelo no es un modelo de lenguaje generativo. La model card reporta las siguientes métricas sobre un conjunto de evaluación no especificado:

| Métrica | Valor |
|---|---|
| Loss | 0,0833 |
| Precision | 0,8969 |
| Recall | 0,9265 |
| F1 | 0,9114 |
| Accuracy | 0,9815 |

Estos valores provienen de la tabla de resultados de entrenamiento del autor y corresponden a la validación tras la sexta época. No se dispone de información sobre el tamaño ni la composición del conjunto de evaluación, por lo que no es posible comparar estos resultados con los de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 133 MB (33.215.625 parámetros × 4 bytes); en FP16, alrededor de 66 MB. La VRAM total necesaria, incluyendo activaciones y overhead del framework, se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No se requiere hardware de gama alta; también puede ejecutarse en CPU para tareas con requisitos de latencia poco exigentes.
- Cabe en consumer GPU: sí, funciona en tarjetas como RTX 3060, GTX 1650 o incluso en soluciones integradas con memoria compartida.
- Opciones de despliegue: es compatible con la librería `transformers` mediante el pipeline de `token-classification`, y puede exportarse a ONNX Runtime o TorchScript. No es recomendable usar vLLM ni llama.cpp, al ser un modelo encoder-only y no generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks para otros modelos de la misma categoría, ni se han identificado alternativas comparables en los datos de la model card. A modo orientativo, el modelo tiene 33 millones de parámetros, un tamaño similar al de otros modelos BERT pequeños, pero no hay datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento y la tarea concreta no están especificados, lo que limita la reproducibilidad y la evaluación de sesgos.
- Las métricas reportadas provienen de un único conjunto de evaluación no documentado, por lo que la generalización a otros dominios no está garantizada.
- No se incluye información sobre sesgos lingüísticos, culturales o de contenido; es necesario realizar una auditoría antes de su uso en entornos sensibles.
- Al ser un modelo encoder-only, no es capaz de generar texto ni realizar razonamiento complejo.
- La licencia MIT permite el uso comercial, pero la licencia del dataset de entrenamiento no se especifica, por lo que debe verificarse antes de desplegar el modelo en producción.
- No se han publicado benchmarks estándar; el rendimiento en tareas reales debe evaluarse de forma independiente por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivalpa/bert-finetuned-ner
- Model card: https://huggingface.co/ivalpa/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
