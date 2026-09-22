# JacobWu123/hw1-hc3-detector

# JacobWu123/hw1-hc3-detector

## Resumen

El modelo `JacobWu123/hw1-hc3-detector` es un clasificador binario de texto en inglés que distingue entre respuestas escritas por personas (etiqueta 0) y respuestas generadas por ChatGPT (etiqueta 1). Se trata de un fine-tuning completo de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de tipo BERT con 6 capas y 22.713.986 parámetros, al que se le ha añadido una cabeza de clasificación de secuencia con dos etiquetas y entrenamiento con entropía cruzada.

El modelo fue desarrollado por el usuario JacobWu123 como entrega de un trabajo académico (CS546 HW1) sobre adaptación de modelos de lenguaje preentrenados, y se entrenó sobre el corpus `Hello-SimpleAI/HC3`, compuesto mayoritariamente (en torno al 70 %) por respuestas de tipo Reddit ELI5. Con ese planteamiento, el problema que aborda es acotado: detectar el estilo de respuestas de ChatGPT de la versión de diciembre de 2022 en un dominio concreto, no la detección genérica de texto generado por IA.

Su relevancia práctica es doble. Por un lado, sirve como ejemplo reproducible y de bajo coste de fine-tuning completo frente a la alternativa de embeddings congelados más regresión logística, con una mejora muy marcada en la partición de test de HC3 (0,9921 de accuracy frente a 0,8449). Por otro, su tamano (22,7 millones de parámetros, unos 91 MB en fp32) permite ejecutarlo en CPU o en cualquier GPU de gama baja, lo que lo hace util para etiquetar corpus a gran escala. El propio autor advierte que la precisión reportada es en distribución y que el modelo no debe utilizarse para juzgar si personas reales, como estudiantes, han usado IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6-v2) con cabeza de clasificación de secuencia de 2 etiquetas |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens en la configuración de sentence-transformers usada para el entrenamiento (el encoder subyacente admite hasta 512 posiciones) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-classification |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (revisión 4d0ff18, all.jsonl) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer estándar de la familia BERT, concretamente la variante MiniLM-L6-v2: 6 capas, dimensionalidad oculta de 384 y 12 cabezas de atención. Sobre ese backbone se carga una cabeza de clasificación de secuencia (`AutoModelForSequenceClassification`) con dos etiquetas de salida y pérdida de entropía cruzada. No hay innovaciones de arquitectura propias: el interés del modelo está en el procedimiento de ajuste y en su coste computacional mínimo.

Los datos proceden del corpus HC3 en inglés (`Hello-SimpleAI/HC3`, `all.jsonl`, revisión `4d0ff18`). Para cada pregunta se conservaron la primera respuesta humana no vacía y la primera respuesta de ChatGPT no vacía, de modo que cada ejemplo es una respuesta individual. La partición se hizo por pregunta con semilla 42 en proporción 80/10/10, garantizando que ambas respuestas de una misma pregunta quedan en el mismo split y se evita la fuga de información entre entrenamiento y evaluación. Los conjuntos resultantes son de 37.334 ejemplos de entrenamiento, 4.666 de validación y 4.668 de test, equilibrados entre las dos clases. La entrada es únicamente el texto de la respuesta, truncado a 256 tokens, con padding dinámico. El entrenamiento usó el optimizador AdamW con tasa de aprendizaje 2e-5, tamano de lote 32 y 5 épocas (5.835 pasos), sin scheduler y con semilla 42. No se documenta uso de RLHF, DPO ni decodificación especulativa, algo coherente con una tarea de clasificación.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve dos probabilidades, `human` (índice 0) y `ChatGPT` (índice 1), a partir del texto de una respuesta.
- Detección de estilo generativo propio de ChatGPT de diciembre de 2022 en respuestas de tipo pregunta-respuesta, especialmente del dominio ELI5/Reddit.
- Inferencia muy rápida y de bajísimo coste: 22,7 millones de parámetros permiten procesar lotes grandes en CPU.
- Integración directa con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No tiene modo de razonamiento explícito (*thinking mode*), visión, audio ni generación de texto.
- Multilingüismo: no disponible; está entrenado y declarado únicamente para inglés.

## Casos de uso

- Curación y filtrado de corpus: el modelo permite etiquetar grandes volúmenes de respuestas en inglés y descartar o marcar aquellas con estilo de ChatGPT de 2022, a un coste de cómputo muy bajo gracias a sus 22,7 millones de parámetros.
- Auditoría de contaminación de benchmarks: al clasificar respuestas de un dataset sospechoso, puede aportar una señal sobre si parte del contenido se generó con ChatGPT en la misma franja temporal y con un registro similar al de HC3.
- Investigación académica y reproducibilidad: sirve como referencia para comparar el fine-tuning completo de un MiniLM con la línea base de embeddings congelados más regresión logística, con todos los hiperparámetros documentados.
- Docencia en procesado de lenguaje natural: es un caso práctico y barato para ilustrar particionado por pregunta, truncación a 256 tokens, padding dinámico y análisis de matrices de confusión.
- Análisis de estilo lingüístico en foros: permite estudiar qué rasgos (longitud de la respuesta, registro informal, formulaciones típicas) empujan la predicción hacia la clase `ChatGPT`, dado que el corpus es mayoritariamente Reddit ELI5.
- Etiquetado previo en pipelines de moderación o análisis de contenido: como clasificador de primera etapa de bajo coste antes de recurrir a un modelo mayor o a revisión humana.
- Prototipado rápido de clasificadores de texto: la receta (MiniLM-L6 + `AutoModelForSequenceClassification` + AdamW a 2e-5) es reutilizable para otras tareas binarias con pocos recursos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la partición de test de HC3 (4.668 respuestas):

| Modelo | Accuracy en test | F1 macro | Mal clasificadas |
|---|---|---|---|
| Línea base: embeddings congelados de `all-MiniLM-L6-v2` + regresión logística | 0,8449 | 0,8449 | 724 |
| Este modelo: fine-tuning completo de `all-MiniLM-L6-v2` | 0,9921 | 0,9921 | 37 |

Matriz de confusión del modelo ajustado en la partición de test (filas: etiqueta real; columnas: predicción):

| | pred human | pred ChatGPT |
|---|---|---|
| human | 2298 | 36 |
| ChatGPT | 1 | 2333 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan aproximadamente 91 MB en fp32 y unos 45 MB en fp16/bf16; el resto es overhead de activaciones y runtime.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 2 GB de memoria es suficiente; una T4, una RTX 3060 o incluso una GTX 1650 van sobradas. No tiene sentido desplegarlo en A100 o H100.
- Cabe en cualquier GPU de consumo e incluso en CPU, en dispositivos de borde y en entornos con memoria muy limitada.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado en la model card), exportación a ONNX Runtime, TorchScript, endpoints de HuggingFace Inference, o un servicio propio con FastAPI/Uvicorn. vLLM puede servir tareas de clasificación en versiones recientes, pero está sobredimensionado para 22,7 millones de parámetros. `llama.cpp` y Ollama no son aplicables sin una conversión a GGUF que no se publica.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JacobWu123/hw1-hc3-detector` | 22,7 M | 256 tokens | 0,9921 accuracy y F1 macro en test de HC3 (en distribución) | apache-2.0 | HuggingFace |
| `Hello-SimpleAI/chatgpt-detector-roberta` | no disponible (basado en roberta-base, del orden de 125 M) | no disponible | no disponible | no disponible | HuggingFace |
| `openai-community/roberta-base-openai-detector` | no disponible (basado en roberta-base, del orden de 125 M) | no disponible | no disponible (entrenado para detectar salidas de GPT-2) | no disponible | HuggingFace |
| Detección mediante LLM como juez (por ejemplo, un modelo generativo grande evaluando el texto) | no aplica | mucho mayor | no disponible | depende del proveedor | APIs comerciales o modelos abiertos |

La comparación relevante es de planteamiento: este modelo es entre 5 y 6 veces más pequeno que los detectores basados en RoBERTa, lo que reduce el coste de inferencia, pero su entrenamiento está atado a un único dataset y a una única versión de ChatGPT, mientras que los detectores genéricos se entrenan sobre corpus más amplios de salidas de modelos. No se dispone de datos públicos comparables de rendimiento cruzado entre estas opciones.

## Limitaciones y advertencias

- La accuracy cercana al 99 % es en distribución: entrenamiento y test comparten fuentes (en torno al 70 % Reddit ELI5), la misma versión de ChatGPT (diciembre de 2022) y el mismo preprocesado. Fuera de ese reparto el rendimiento no está garantizado.
- El modelo puede apoyarse en senales específicas del dataset, como el registro de Reddit, la longitud de la respuesta o las formulaciones propias de ChatGPT de 2022, en lugar de en rasgos generales de autoría.
- Casi todos los errores restantes son respuestas humanas clasificadas como ChatGPT (36 falsos positivos frente a 1 falso negativo), un sesgo direccional que conviene tener en cuenta si se usa para filtrar contenido humano.
- Advertencia explícita del autor: no debe usarse para juzgar si personas reales, como estudiantes, han utilizado IA. Tampoco es fiable con texto de otros dominios ni con modelos de lenguaje más recientes.
- Solo está entrenado para inglés; cualquier uso en otros idiomas carece de soporte.
- El truncado a 256 tokens implica que en textos largos solo se evalúa el inicio, con la pérdida de información que ello supone.
- Licencia apache-2.0 en los pesos, pero el corpus HC3 tiene sus propias condiciones de uso y procedencia (contenido de Reddit y respuestas de ChatGPT), que conviene revisar antes de un uso comercial.
- El repositorio no publica versiones cuantizadas ni datos de latencia, y registra cero descargas y cero likes, por lo que no ha pasado por una validación amplia de la comunidad.
- Es un clasificador de estilo, no un verificador de autoría: una respuesta humana que imite el registro de ChatGPT puede ser clasificada como generada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JacobWu123/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
