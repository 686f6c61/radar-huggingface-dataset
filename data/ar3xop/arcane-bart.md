# ar3xop/arcane-bart

## Resumen

Arcane-BART es un modelo de lenguaje de tipo secuencia a secuencia, basado en la arquitectura BART, fine-tuneado por el autor ar3xop sobre el benchmark IMHI (International Mental Health Interpretability) para tareas de análisis de salud mental. El modelo está diseñado para ser ligero y eficiente, con el objetivo de permitir inferencia rápida en CPU y GPU, así como despliegue en entornos edge. Su propósito principal es identificar y clasificar causas de estrés en publicaciones de texto, como las de redes sociales, respondiendo a preguntas específicas sobre el contenido emocional del mensaje.

El modelo se distribuye con licencia MIT, lo que facilita su uso comercial y académico, y está orientado exclusivamente al idioma inglés. Con un tamaño de repositorio de 1,6 GB, se trata de un modelo de dimensiones moderadas, aunque no se especifican los parámetros totales ni la longitud de contexto en la información disponible. Su relevancia radica en la creciente necesidad de herramientas de análisis de salud mental automatizadas y accesibles, especialmente en entornos con recursos computacionales limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (sequence-to-sequence) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo usa max_length=512 para entrada y 256 para salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binarios de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura se basa en BART, un modelo transformer encoder-decoder desarrollado originalmente por Facebook AI. BART es particularmente adecuado para tareas de generacion de texto condicionada, como la clasificacion y extraccion de informacion a partir de texto. En este caso, el modelo ha sido fine-tuneado sobre el benchmark IMHI, un conjunto de datos diseñado para la interpretabilidad en salud mental, que incluye tareas como la identificacion de causas de estres en publicaciones de texto.

No se dispone de informacion detallada sobre el proceso de entrenamiento, como el numero de tokens, la composicion del dataset o si se utilizaron tecnicas de RLHF o DPO. Tampoco se mencionan innovaciones tecnicas especificas mas alla del fine-tuning. El modelo se presenta como "ligero" e "interpretable", lo que sugiere un enfasis en la eficiencia y la transparencia, pero no se ofrecen detalles adicionales.

## Capacidades

- Generacion de texto condicionada: dado un prompt que incluye una publicacion y una pregunta sobre la causa de estres, el modelo genera una respuesta textual.
- Analisis de salud mental: especializado en identificar factores de estres en texto, como se muestra en el ejemplo de la model card.
- Inferencia en CPU y GPU: diseñado para ser rapido y adecuado para despliegue en entornos con recursos limitados.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Triaje de salud mental en redes sociales: el modelo puede analizar publicaciones de usuarios y detectar posibles causas de estres, lo que permitiria a plataformas ofrecer recursos de apoyo o alertar a moderadores. Su naturaleza ligera facilita el procesamiento en tiempo real.
- Asistentes de bienestar emocional: integrado en aplicaciones de chat o diarios digitales, el modelo puede ayudar a los usuarios a reflexionar sobre sus emociones identificando patrones de estres en sus escritos.
- Investigacion en psicologia computacional: los investigadores pueden utilizar el modelo para etiquetar grandes corpus de texto con causas de estres, acelerando el analisis cualitativo y cuantitativo.
- Sistemas de soporte en entornos clinicos: como herramienta de ayuda para profesionales de la salud mental, el modelo puede pre-procesar notas de pacientes o transcripciones y resaltar posibles factores de estres, aunque siempre con supervisión humana.
- Educacion y concienciacion: el modelo puede emplearse en materiales educativos para ensenar a estudiantes a identificar signos de estres en el lenguaje, fomentando la alfabetizacion emocional.
- Despliegue en dispositivos edge: gracias a su tamano moderado y su diseño para CPU, puede ejecutarse en dispositivos moviles o IoT para aplicaciones de monitoreo de salud mental en tiempo real, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue fine-tuneado sobre el benchmark IMHI, pero no se proporcionan metricas concretas (por ejemplo, exactitud, F1, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo BART de aproximadamente 1,6 GB en disco, se estima que puede caber en GPUs con al menos 4 GB de VRAM en cuantizacion FP16, y menos en cuantizaciones inferiores.
- GPU recomendadas: no especificadas. Dado el tamano, GPUs como NVIDIA T4, RTX 3060 o superiores serian suficientes. Tambien puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: probablemente si, en GPUs de gama media (8 GB o mas) con cuantizacion.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, puede servirse con vLLM, TGI, o mediante la libreria transformers directamente. Para CPU, llama.cpp o ONNX Runtime son opciones viables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (analisis de salud mental con BART). Existen otros modelos como MentalBERT o modelos fine-tuneados sobre datasets de salud mental, pero no se proporcionan datos para una comparacion rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado en un dataset especifico (IMHI) y solo en ingles, puede presentar sesgos culturales y linguisticos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en entradas fuera de distribucion.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero el ejemplo usa 512 tokens de entrada, lo que limita el analisis a publicaciones relativamente cortas.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, sin restricciones significativas.
- Caveat para produccion: el modelo no ha sido validado clinicamente; no debe utilizarse como unico instrumento de diagnostico o intervencion en salud mental. Requiere supervisión humana y evaluacion adicional en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/ar3xop/arcane-bart
- No se han encontrado otros enlaces relevantes (papers, blogs, repos) en la busqueda web.
