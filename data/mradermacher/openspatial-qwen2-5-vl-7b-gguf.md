# mradermacher/OpenSpatial-Qwen2.5-VL-7B-GGUF

## Resumen

OpenSpatial-Qwen2.5-VL-7B-GGUF es una colección de cuantizaciones GGUF del modelo OpenSpatial-Qwen2.5-VL-7B, desarrollada por mradermacher. El modelo base, creado por VINHYU, es un ajuste fino de Qwen2.5-VL-7B especializado en razonamiento espacial, es decir, la capacidad de comprender relaciones geométricas, posiciones relativas y navegación a partir de imágenes. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, sin necesidad de GPUs de gran tamaño.

El modelo conserva las capacidades vision-language de Qwen2.5-VL-7B (comprensión de imágenes, generación de descripciones, respuesta a preguntas visuales) y las orienta hacia tareas que requieren entender el espacio: localización de objetos, estimación de distancias, seguimiento de instrucciones espaciales, etc. Con 7.615.616.512 parámetros (7,6 mil millones), es un modelo denso de tamaño medio que ofrece un equilibrio entre calidad y requisitos de hardware. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo radica en que el razonamiento espacial es una capacidad crítica para aplicaciones de robótica, realidad aumentada, asistencia a la navegación y análisis de imágenes de vigilancia, y esta versión cuantizada lo hace accesible para despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con módulo de visión (basado en Qwen2.5-VL-7B) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, más mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base OpenSpatial-Qwen2.5-VL-7B es un ajuste fino de Qwen2.5-VL-7B, un modelo vision-language de la familia Qwen2.5. La arquitectura subyacente es un transformer decoder-only con un codificador de visión (ViT) que procesa imágenes y las proyecta al espacio de embeddings del texto. El ajuste fino se ha realizado específicamente para tareas de razonamiento espacial, lo que implica un entrenamiento adicional sobre datos que requieren comprender relaciones geométricas, posiciones y navegación.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La cuantización a GGUF realizada por mradermacher es estática (no utiliza imatrix), y se ofrecen múltiples niveles de precisión para adaptarse a diferentes capacidades de hardware. Los archivos mmproj (proyección multimodal) se proporcionan por separado en Q8_0 y f16, necesarios para el procesamiento de imágenes en motores como llama.cpp.

## Capacidades

- Razonamiento espacial: comprende relaciones espaciales entre objetos en imágenes (izquierda/derecha, arriba/abajo, cerca/lejos, dentro/fuera).
- Comprensión de imágenes: describe escenas, identifica objetos y sus posiciones relativas.
- Respuesta a preguntas visuales (VQA): responde preguntas sobre el contenido y la disposición espacial de una imagen.
- Generación de texto: produce descripciones detalladas y narraciones basadas en estímulos visuales.
- Seguimiento de instrucciones espaciales: puede interpretar comandos como "ve al objeto a la derecha del coche" y razonar sobre ellos.
- Multimodalidad: procesa entradas de imagen y texto de forma conjunta, aunque el idioma principal es inglés.
- Compatibilidad con herramientas: al ser una cuantización de Qwen2.5-VL, puede heredar capacidades de tool calling del modelo base, aunque no se confirma en la documentación.

## Casos de uso

- Navegación autónoma asistida: el modelo puede interpretar imágenes de una cámara y proporcionar instrucciones de navegación basadas en la posición relativa de obstáculos y puntos de referencia, integrándose en sistemas de robótica móvil.
- Análisis de vigilancia: dado un fotograma de una cámara de seguridad, el modelo puede describir la disposición espacial de personas y objetos, ayudando a detectar comportamientos anómalos o intrusiones.
- Realidad aumentada: en aplicaciones de RA, el modelo puede generar anotaciones espaciales sobre objetos detectados, indicando su posición relativa al usuario o a otros elementos.
- Asistencia a personas con discapacidad visual: el modelo puede describir el entorno a partir de una foto, indicando la ubicación de obstáculos, puertas o escaleras, facilitando la movilidad.
- Automatización de almacenes: a partir de imágenes de estanterías, el modelo puede localizar productos y guiar a un brazo robótico o a un operario hacia la ubicación correcta.
- Generación de contenido educativo: para crear ejercicios de razonamiento espacial o descripciones de mapas y diagramas, el modelo puede generar explicaciones detalladas de la disposición de elementos en una imagen.
- Inspección industrial: el modelo puede analizar imágenes de piezas o maquinaria para verificar la correcta colocación de componentes, señalando desalineaciones o posiciones incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de razonamiento espacial para esta versión cuantizada. Se recomienda consultar la página del modelo base (VINHYU/OpenSpatial-Qwen2.5-VL-7B) para posibles métricas, aunque no se garantiza su disponibilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Los archivos GGUF varían entre 3,1 GB (Q2_K) y 15,3 GB (f16). Para el procesamiento de imágenes se necesita además el archivo mmproj (1,0 GB en Q8_0 o 1,5 GB en f16).
- GPU recomendadas: para cuantizaciones Q4_K_M (4,8 GB) o inferiores, una GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 2060, GTX 1660 Super) es suficiente. Para Q6_K (6,4 GB) o Q8_0 (8,2 GB), se recomienda una GPU con 10-12 GB (RTX 3080, RTX 4070). Para f16 (15,3 GB), se necesita una GPU de 16 GB o más (RTX 4090, A100).
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M son adecuadas para GPUs de gama media con 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp). También es posible usar vLLM si se convierte a otro formato, aunque no es el propósito de este repo.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo para texto, pero la latencia aumenta al procesar imágenes debido al codificador de visión.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de razonamiento espacial en formato GGUF. Como referencia, se pueden considerar otros ajustes de Qwen2.5-VL-7B en GGUF, como los publicados por mradermacher (Qwen2.5-VL-7B-Instruct-abliterated-GGUF o Qwen2.5-VL-7B-Abliterated-Caption-it-GGUF), que comparten la misma arquitectura base pero no están especializados en razonamiento espacial. La diferencia principal radica en el ajuste fino de OpenSpatial, que añade capacidades específicas de comprensión espacial. En cuanto a modelos de propósito general, Qwen2.5-VL-7B-Instruct es la alternativa más cercana, pero sin la especialización espacial. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad, especialmente en las versiones de menor precisión (Q2_K, Q3_K). Para tareas que requieren alta fidelidad en el razonamiento espacial, se recomienda usar Q6_K o Q8_0.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado.
- No se dispone de información sobre sesgos específicos del modelo base. Como cualquier modelo de visión-lenguaje, puede presentar sesgos en el reconocimiento de objetos o personas según los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo generativo, puede producir descripciones espaciales incorrectas o inventar relaciones que no existen en la imagen.
- La longitud de contexto no está documentada en esta versión; se recomienda verificar la del modelo base Qwen2.5-VL-7B (típicamente 32k tokens) antes de usarla en aplicaciones que requieran contexto largo.
- Para uso en producción, es necesario validar el modelo con datos reales, ya que no se han publicado benchmarks específicos.
- Los archivos mmproj son imprescindibles para el procesamiento de imágenes; omitirlos provocará errores en la inferencia multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/OpenSpatial-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/VINHYU/OpenSpatial-Qwen2.5-VL-7B
- Cuantizaciones con imatrix (alternativa): https://huggingface.co/mradermacher/OpenSpatial-Qwen2.5-VL-7B-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
