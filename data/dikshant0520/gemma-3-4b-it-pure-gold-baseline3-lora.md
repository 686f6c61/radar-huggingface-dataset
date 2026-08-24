# dikshant0520/gemma-3-4b-it-pure-gold-baseline3-lora

## Resumen

El modelo `dikshant0520/gemma-3-4b-it-pure-gold-baseline3-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por dikshant0520 sobre el modelo base `google/gemma-3-4b-it`, un modelo multimodal de 4 mil millones de parámetros de Google DeepMind. El adaptador está fine-tuneado específicamente para tareas de Visual Question Answering (VQA) en escenas de conducción, utilizando 2.000 ejemplos etiquetados como "gold". Su objetivo es especializar el modelo base en la comprensión de imágenes de tráfico y la respuesta a preguntas sobre ellas, manteniendo congelada la torre de visión y adaptando únicamente las capas de proyección del modelo de lenguaje.

La relevancia de este adaptador radica en su enfoque eficiente: en lugar de reentrenar un modelo completo, se aplica una adaptación de bajo rango que permite ajustar el comportamiento del modelo a una tarea concreta con un coste computacional reducido. El adaptador se distribuye en formato safetensors y está pensado para ser cargado junto con el modelo base, que ofrece una ventana de contexto de 128.000 tokens y soporte multilingüe en más de 140 idiomas. Aunque el adaptador en sí no introduce nuevas capacidades, su especialización en VQA de conducción lo hace útil para aplicaciones de análisis de tráfico, asistencia a la conducción y evaluación de seguridad vial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre `google/gemma-3-4b-it` |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones comunes como 4-bit y 8-bit) |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta más de 140 idiomas |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que introduce matrices de bajo rango en las capas de proyección del modelo de lenguaje, mientras que la torre de visión del modelo base permanece congelada. Los hiperparámetros de entrenamiento son: rango 16, alpha 32 y dropout 0,10. Se entrenó durante 2 épocas con un tamaño de lote efectivo de 15, distribuido en tres GPUs, y una tasa de aprendizaje de 1e-4. El mejor checkpoint se obtuvo en el paso 240, con una pérdida de validación de 0,49810.

El conjunto de datos de entrenamiento consta de 2.000 ejemplos de VQA sobre escenas de conducción, etiquetados como "gold" (alta calidad). No se especifica la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el entrenamiento se limita a fine-tuning supervisado sobre estos ejemplos. El modelo base, `google/gemma-3-4b-it`, es un transformer multimodal con atención de ventana deslizante y atención global, entrenado con 128K de contexto y optimizado para seguir instrucciones.

## Capacidades

- Generación de texto y razonamiento visual: el adaptador hereda las capacidades del modelo base para procesar imágenes y texto, y está especializado en responder preguntas sobre escenas de conducción.
- VQA de conducción: puede responder a preguntas como "¿Qué vehículo está delante?" o "¿Hay algún peatón cruzando?" a partir de imágenes de tráfico.
- Soporte de tool calling y function calling: el modelo base lo soporta, pero no se ha verificado si el adaptador lo conserva tras el fine-tuning.
- Capacidades multilingües: el modelo base soporta más de 140 idiomas, aunque el adaptador no especifica su comportamiento multilingüe.
- Modo de razonamiento: el modelo base incluye un modo de pensamiento (thinking mode) que puede activarse; el adaptador no lo modifica explícitamente.
- Procesamiento de imágenes: al ser multimodal, puede recibir imágenes como entrada y generar texto como salida.

## Casos de uso

- Análisis de escenas de tráfico en tiempo real: el adaptador puede integrarse en sistemas de cámaras de vigilancia para responder automáticamente a preguntas sobre la situación vial, como la presencia de obstáculos o el estado de los semáforos.
- Asistencia a conductores: en un vehículo autónomo o semiautónomo, el modelo puede interpretar imágenes de la carretera y proporcionar respuestas contextuales a consultas del conductor, mejorando la seguridad.
- Evaluación de seguridad vial: organismos de tráfico pueden usar el adaptador para analizar imágenes de accidentes o infracciones, generando informes descriptivos automáticos.
- Generación de subtítulos para vídeos de conducción: dado un conjunto de fotogramas, el modelo puede describir la escena, útil para la documentación de rutas o la creación de datasets anotados.
- Sistemas de ayuda a la navegación: el adaptador puede responder a preguntas sobre señales de tráfico o marcas viales visibles en imágenes, complementando los sistemas GPS.
- Investigación en VQA: sirve como punto de partida para experimentos de fine-tuning eficiente en dominios específicos, demostrando cómo un adaptador LoRA puede especializar un modelo multimodal con pocos datos.

## Benchmarks y rendimiento

En el conjunto de evaluación compartido de 5.000 ejemplos, el adaptador obtuvo los siguientes resultados de LingoScore (métrica que mide la calidad de las respuestas de VQA):

| Metrica | Valor |
|---|---|
| LingoScore medio | 0,43315 |
| LingoScore mediana | 0,26127 |
| Porcentaje de predicciones con LingoScore >= 0,8 | 32,24% |

No se han publicado comparaciones con otros modelos o adaptadores en la información disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de repositorio de 0,1 GB, por lo que su carga en memoria es despreciable.
- El modelo base `google/gemma-3-4b-it` requiere una GPU con al menos 8 GB de VRAM para inferencia en precisión fp16, o alrededor de 4 GB con cuantización de 4 bits.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con suficiente VRAM para el modelo base.
- Es posible ejecutar el modelo en GPUs de consumo como la RTX 3060 (12 GB) si se aplica cuantización.
- Opciones de despliegue: el adaptador se puede cargar con la librería PEFT de Hugging Face, y el modelo base puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se combine con el adaptador.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para VQA de conducción en la información proporcionada. Se puede comparar con el modelo base sin adaptar, pero no se han publicado benchmarks del modelo base en esta tarea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 2.000 ejemplos, lo que puede limitar su generalización a escenas de conducción muy diversas o a condiciones no representadas en el conjunto de entrenamiento.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en situaciones ambiguas o con imágenes de baja calidad.
- Sesgos potenciales: el conjunto de datos "gold" puede contener sesgos geográficos o culturales (por ejemplo, predominancia de señales de tráfico de una región concreta), lo que afectaría a la precisión en otros contextos.
- La licencia Gemma impone restricciones de uso: no se permite el uso para ciertos fines (como vigilancia masiva) y se requiere aceptar los términos antes de descargar el modelo base.
- El adaptador no modifica la ventana de contexto ni las capacidades multilingües del modelo base, pero su especialización puede degradar el rendimiento en tareas generales de VQA fuera del dominio de conducción.
- No se ha verificado si el adaptador conserva el soporte de tool calling o el modo de razonamiento del modelo base tras el fine-tuning.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/dikshant0520/gemma-3-4b-it-pure-gold-baseline3-lora
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Página general de Gemma: https://deepmind.google/models/gemma/
