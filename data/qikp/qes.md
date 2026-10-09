# qikp/qes

# qikp/qes (QES): clasificador de valor educativo

## Resumen

QES (Educational Scorer) es un modelo de clasificación de texto publicado por el usuario qikp que evalúa el valor educativo de fragmentos de texto web. Su objetivo declarado es idéntico al del clasificador HuggingFaceFW/fineweb-edu-classifier: puntuar la calidad educativa de documentos, una tarea clave en la curación de datasets de preentrenamiento a gran escala. La diferencia principal es que QES se construye como un ajuste fino del modelo huawei-noah/TinyBERT_General_4L_312D, en lugar del Snowflake/snowflake-arctic-embed-m que usa el clasificador original.

Se trata de un modelo muy pequeño: 14.350.561 parámetros (unos 57 MB en FP32), con tan solo 0,1 GB de repositorio. Esta escala lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU o en GPUs de gama baja, lo que lo hace interesante para filtrar volúmenes masivos de texto sin coste computacional elevado. El autor justifica la elección del modelo base señalando que Mozilla Firefox incorpora un modelo ajustado sobre la misma arquitectura para autocompletado de formularios, lo que respalda su fiabilidad.

El modelo se entrenó durante 20 minutos y 49 segundos en una única GPU T4 de Google, usando el primer fragmento parquet del dataset HuggingFaceFW/fineweb-edu-llama3-annotations. Es relevante para desarrolladores que necesiten un scorer educativo extremadamente barato y con licencia CC0-1.0, aunque el propio autor advierte que su uso debería limitarse a circunstancias controladas o a volúmenes colosales de datos, dada su precisión no garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (variante TinyBERT) |
| Parametros totales | 14.350.561 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones; entrenamiento en FP32/FP16 hibrido |
| Idiomas soportados | No disponible |
| Licencia | CC0-1.0 (dominio publico) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QES es un ajuste fino de TinyBERT_General_4L_312D, un transformer encoder del tipo BERT. La nomenclatura del modelo base (4L, 312D) indica 4 capas y dimension oculta de 312, coherente con el recuento de 14,35 millones de parámetros. TinyBERT es una familia de modelos destilados, diseñada para reducir el coste computacional del BERT original manteniendo prestaciones razonables en tareas de comprensión y clasificación.

El entrenamiento utilizó únicamente el primer fragmento parquet del dataset HuggingFaceFW/fineweb-edu-llama3-annotations, con un data collator de padding. Según la model card, se empleó el tamaño de lote y la tasa de aprendizaje por defecto, y el modelo se entrenó durante 2 épocas. El proceso completo duró 20 minutos y 49 segundos en una GPU T4 de Google. El entrenamiento se realizó en un modo híbrido FP32/FP16 porque la arquitectura Turing no soporta bfloat16. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal, y no se especifica el número total de tokens de entrenamiento.

## Capacidades

- Clasificación de texto: puntuación del valor educativo de fragmentos de texto (tarea principal, pipeline de text-classification).
- Filtrado de datasets: capacidad de asignar una puntuación de calidad educativa a documentos para su selección o descarte.
- Inferencia ligera: al tener 14,35 millones de parámetros, puede ejecutarse en CPU y en GPUs de gama baja.
- Sustituto funcional del clasificador FineWeb-Edu: mismo propósito declarado, con arquitectura base distinta.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo discriminativo, no generativo).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Curación de datasets de preentrenamiento: aplicar QES sobre corpus web masivos para puntuar y filtrar documentos por valor educativo antes de alimentar un LLM, siguiendo el enfoque de FineWeb-Edu.
- Pre-filtrado barato antes de un juez LLM: usar QES para descartar rápidamente el contenido claramente no educativo y reservar un modelo mayor (o un LLM evaluador) solo para la franja dudosa, reduciendo coste.
- Puntuación en pipelines de data quality de CI/CD: integrar el clasificador en flujos automatizados que validan la calidad de nuevos lotes de datos antes de aceptarlos en un repositorio de entrenamiento.
- Clasificación de contenido en plataformas educativas: etiquetar automáticamente artículos, apuntes o recursos subidos por usuarios según su valor educativo.
- Investigación sobre calidad de datos web: medir de forma reproducible la proporción de contenido educativo en un dominio o crawl concreto, sin infraestructura GPU dedicada.
- Enrutado o triaje de documentos: enviar los textos con mayor puntuación educativa a una cola de revisión humana o a un pipeline de anotación más caro.
- Despliegue en el borde (edge): ejecutar el scorer en CPU de servidores de bajo coste o incluso en dispositivos con recursos limitados gracias al reducido tamaño del modelo.
- Deduplicación con criterio de calidad: combinar la puntuación educativa con heurísticas de deduplicación para seleccionar la mejor copia de documentos casi idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única referencia de evaluación aportada por el autor es que el modelo se desvía hasta aproximadamente tres cuartos de punto (0,75) respecto al dataset final FineWeb-Edu durante pruebas internas limitadas. El autor indica explícitamente que esta precisión no está garantizada.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 57,4 MB (14.350.561 parámetros x 4 bytes).
- Pesos en FP16: aproximadamente 28,7 MB (14.350.561 parámetros x 2 bytes).
- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión habitual; cabe en CPU sin GPU.
- GPU recomendadas: cualquier GPU moderna sirve; durante el entrenamiento se usó una T4. No se requieren A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: pipeline de transformers (librería declarada), exportación a ONNX Runtime u otros runtimes ligeros. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles. Se conoce únicamente que el entrenamiento de 2 épocas sobre un shard parquet tardó 20 minutos y 49 segundos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qikp/qes | 14.350.561 | huawei-noah/TinyBERT_General_4L_312D | Clasificacion de valor educativo | CC0-1.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| HuggingFaceFW/fineweb-edu-classifier | No disponible | Snowflake/snowflake-arctic-embed-m | Clasificacion de valor educativo | No disponible en la informacion | HuggingFace |
| huawei-noah/TinyBERT_General_4L_312D | No disponible (familia TinyBERT 4L-312D) | Modelo destilado de BERT | Modelo de lenguaje encoder de proposito general | No disponible en la informacion | HuggingFace |

## Limitaciones y advertencias

- Precision no garantizada: el autor indica una desviacion de hasta ~0,75 puntos respecto al dataset final FineWeb-Edu en pruebas internas limitadas.
- Uso restringido por el autor: recomienda emplearlo solo en circunstancias controladas o con volumenes colosales de datos.
- Ausencia de benchmarks publicos: no hay tablas comparativas verificadas frente a otros clasificadores.
- Idiomas: no se especifican; el dataset de entrenamiento (fineweb-edu) es predominantemente en ingles, por lo que el rendimiento en otros idiomas es incierto.
- Entrenamiento muy corto: 2 epocas sobre un unico fragmento parquet, con tamaño de lote y tasa de aprendizaje por defecto, lo que limita la robustez.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni cuantizadas listadas en la informacion.
- Tarea discriminativa: al ser un clasificador, no genera texto; el riesgo no es de alucinacion generativa sino de clasificacion erronea (falsos positivos o negativos en la puntuacion educativa).
- Sesgos: no documentados por el autor; heredables del dataset de anotaciones y del modelo base destilado.
- Licencia CC0-1.0: permite uso comercial y redistribucion sin restricciones conocidas, pero conviene verificar la licencia del modelo base y del dataset de anotaciones por separado.
- Contexto maximo: no especificado en la informacion disponible; el modelo base TinyBERT suele operar con ventanas cortas, lo que puede limitar el analisis de documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qikp/qes
- Modelo base (TinyBERT): https://huggingface.co/huawei-noah/TinyBERT_General_4L_312D
- Clasificador de referencia FineWeb-Edu: https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier
- Dataset de anotaciones de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- Coleccion "Models For Light And Fast Inference" del autor: https://huggingface.co/collections/qikp/models-for-light-and-fast-inference

Nota sobre la busqueda web: los resultados obtenidos (qikp/baguettotron-600m-GGUF, comparativas de modelos chinos y un articulo sobre "Quantized Evolution Strategies" que usa la misma sigla QES pero describe una tecnica distinta de ajuste fino) no guardan relacion con el modelo qikp/qes y no se han incluido como fuentes.
