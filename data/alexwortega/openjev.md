# AlexWortega/openjev

## Resumen

openjev es un modelo de clasificación de texto publicado por el usuario AlexWortega en HuggingFace. Se trata de un cross-encoder derivado de Qwen/Qwen3.5-4B, reentrenado para una única tarea de inferencia de lenguaje natural (NLI) de tres clases: `contradiction`, `entailment` y `neutral`. El autor lo describe como un "jev model": un primitivo único capaz de rerankear respuestas, calificarlas contra una referencia, filtrar contenido y hasta jugar videojuegos en tiempo real. La arquitectura es `Qwen3_5ForSequenceClassification`, con pooling sobre el último token y entrenamiento mediante entropía cruzada simple sobre las tres clases.

El modelo se apoya en la torre de visión de Qwen3.5, lo que le permite procesar tanto estados textuales como píxeles directamente. En la model card se muestran demostraciones zero-shot de Doom y Flappy Bird en las que el argmax de la clase *entailment* determina la acción a tomar, sin entrenamiento específico por tarea.

Es relevante para desarrolladores que necesitan un reranker o un verificador NLI de calidad basado en un modelo de 4B, con herramientas ya empaquetadas (`OpenJevCrossEncoder` con métodos `predict`, `rerank`, `grade` y `latents`) y licencia MIT, lo que facilita su integración en pipelines comerciales. El repositorio (9,2 GB) incluye el checkpoint, el código de entrenamiento, los arneses de evaluación, los clips de vídeo y los resultados en JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 adaptada como cross-encoder de clasificación de secuencias (`Qwen3_5ForSequenceClassification`), 3 etiquetas, pooling sobre el ultimo token |
| Parametros totales | Aproximadamente 4B (derivado de Qwen/Qwen3.5-4B; valor exacto no disponible) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

openjev parte de Qwen/Qwen3.5-4B y lo convierte en un cross-encoder de clasificación. La cabeza es `Qwen3_5ForSequenceClassification` con tres etiquetas (`contradiction`, `entailment`, `neutral`), pooling sobre el último token y entrenamiento con entropía cruzada estándar sobre las tres clases. El modelo recibe un par premisa-hipótesis y devuelve la distribución de probabilidad sobre esas tres clases. Se distribuye en el subdirectorio `qwen3.5-4b-nli/` del repositorio.

El autor incluye en el repositorio el entrenador, un arnés de elección múltiple, los entornos de Flappy Bird y Doom (tanto en modo texto como en píxeles) y el script del radar. La innovación destacable es el uso del propio modelo como primitivo universal: en lugar de entrenar tareas específicas, se formula cada problema como una afirmación sobre un estado y se selecciona la opción con mayor probabilidad de *entailment*. Las demostraciones de Doom se hacen zero-shot, primero desde el estado textual y después directamente desde los píxeles a través de la torre de visión de Qwen3.5. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación NLI de pares premisa-hipótesis en tres clases: contradicción, implicación y neutral.
- Reranking de candidatos mediante el método `rerank`, que devuelve el índice de la opción con mayor probabilidad de *entailment*.
- Calificación de respuestas contra una referencia mediante el método `grade`.
- Extracción de representaciones latentes mediante el método `latents`.
- Procesamiento de estados textuales y de entradas visuales (píxeles) gracias a la torre de visión de Qwen3.5.
- Uso como guardrail o filtro de contenido, al poder evaluar si un texto implica o contradice una política o afirmación dada.
- Aplicación en entornos interactivos en tiempo real: la clase argmax de *entailment* se utiliza como acción a ejecutar (demostrado en Doom y Flappy Bird).
- Carga tanto mediante la clase propia `OpenJevCrossEncoder` como con `AutoModelForSequenceClassification` y `AutoTokenizer` de transformers.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Reranking en pipelines RAG: dado un conjunto de fragmentos recuperados y una consulta reformulada como hipótesis, `rerank` ordena los candidatos por probabilidad de *entailment*, mejorando la precisión del contexto que se pasa al generador.
- Evaluación automática de respuestas generadas: usar `grade` para comparar la salida de un LLM contra una respuesta de referencia y detectar contradicciones o alucinaciones factuales sin necesidad de un juez basado en un modelo mayor.
- Moderación y guardrails de contenido: formular las políticas como afirmaciones y comprobar si el texto del usuario las implica o las contradice, integrando el modelo como filtro previo o posterior a la generación.
- Detección de contradicciones en bases documentales: comparar pares de documentos o versiones de un mismo texto para localizar afirmaciones incompatibles en corpus legales, técnicos o científicos.
- Clasificación de pares pregunta-respuesta en atención al cliente: determinar si la respuesta de un agente o bot implica la información solicitada por el usuario, con soporte de contexto largo del modelo base.
- Agentes que interactúan con entornos simulados: emplear el argmax de *entailment* como política de acción en videojuegos o simuladores, tal como se demuestra en Doom y Flappy Bird sin entrenamiento específico.
- Verificación de resúmenes y traducciones: comprobar si cada frase del resumen se deduce del documento original o si la traducción contradice el texto fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye un gráfico de radar (`assets/radar_openjev.png`) y ficheros JSON con resultados en el directorio `results/`, pero no se detallan cifras de MMLU, HumanEval, GSM8K ni de conjuntos de NLI estándar. Las únicas evidencias de rendimiento son cualitativas: demostraciones en vídeo de Doom y Flappy Bird jugados zero-shot, tanto desde el estado textual como desde los píxeles.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas, no confirmadas por el autor): en precisión fp16, en torno a 8-9 GB para un modelo de 4B; en int8, alrededor de 4-5 GB; en int4, alrededor de 2,5-3 GB. El repositorio completo ocupa 9,2 GB.
- GPU recomendadas: el modelo cabe en GPU de consumo con 8 GB o más en cuantización de 8 bits, como RTX 3060, 4060, 4070 o 4090. Para fp16 sin cuantizar se recomienda una GPU con 12-16 GB o superior (RTX 4070 Ti, RTX 4090, A10, L4). Para despliegue a escala, A100 o H100.
- Compatibilidad con GPU de consumo: previsiblemente sí en cuantizaciones de 4 y 8 bits en tarjetas con 8 GB o más, aunque no se confirma en la información disponible.
- Opciones de despliegue: la librería declarada es transformers, por lo que funciona con PyTorch estándar. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información proporcionada, aunque al publicarse en safetensors podría convertirse a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openjev (AlexWortega/openjev) | ~4B | No disponible | Cross-encoder NLI (3 clases), reranking, vision | MIT | HuggingFace |
| Cross-encoders NLI de dleemiller | No disponible | No disponible | Cross-encoder NLI, reranking | No disponible | HuggingFace (referenciado en la model card) |
| BGE-reranker y mxbai-rerank | No disponible en la informacion proporcionada | No disponible | Reranking de pasajes | No disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. El punto de referencia citado por el propio autor son los cross-encoders NLI de dleemiller.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3.5-4B, hereda los sesgos del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo es un clasificador; el riesgo se traslada a la interpretación de las probabilidades de *entailment* como verdades factuales.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés (`en`). La longitud de contexto no se especifica, lo que dificulta planificar su uso en documentos largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia.
- Caveats para producción: el repositorio tiene 0 descargas y 22 likes, por lo que no existe validación comunitaria extensa. No se han publicado benchmarks numéricos que permitan comparar su calidad frente a alternativas. El uso del modelo base Qwen/Qwen3.5-4B implica cumplir también con los términos de dicho modelo. Los umbrales de decisión sobre las probabilidades de las tres clases deben calibrarse para cada caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlexWortega/openjev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de referencia citado en la model card (cross-encoders NLI de dleemiller): https://huggingface.co/blog/dleemiller/nli-xenc-ways-to-use
- Vídeo de Doom con estado textual: https://huggingface.co/AlexWortega/openjev/resolve/main/videos/doom_zs_position.mp4
- Vídeo de Doom desde píxeles: https://huggingface.co/AlexWortega/openjev/resolve/main/videos/doom_vision_zeroshot_pixels.mp4
