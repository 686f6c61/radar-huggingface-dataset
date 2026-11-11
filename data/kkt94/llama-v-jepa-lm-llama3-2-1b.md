# kkt94/Llama-V-JEPA-LM-Llama3.2-1B

## Resumen

Llama-V-JEPA-LM-Llama3.2-1B es un modelo de lenguaje y vídeo multimodal desarrollado por el usuario kkt94, que combina un codificador de vídeo congelado V-JEPA 2.1 (ViT-L) con el modelo de lenguaje Llama-3.2-1B-Instruct de Meta mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo pertenece a la familia Llama-V-JEPA-LM y está diseñado específicamente para tareas de comprensión de vídeo y respuesta a preguntas sobre vídeo (video question answering).

La propuesta técnica del modelo es el entrenamiento con supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes equilibradas en respuestas cuyas respuestas vienen fijadas por construcción y solo difieren en cómo cambia la escena. De este modo, el modelo de lenguaje aprende a leer la dinámica (dirección, velocidad, orden, estado) que el codificador world-model transporta, sin necesidad de anotación humana adicional.

Con 1.548.154.880 parámetros totales y un tamaño de repositorio de 3,1 GB, el modelo se posiciona como una alternativa compacta para tareas de vídeo-lenguaje, con un promedio de 62,21 en 12 puntuaciones sobre 11 benchmarks de vídeo, por delante de otros modelos abiertos de su clase de tamaño según declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de vídeo V-JEPA 2.1 (ViT-L, congelado) + puente espectral + Llama-3.2-1B-Instruct |
| Parametros totales | 1.548.154.880 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida y multimodal. Por un lado, un codificador de vídeo V-JEPA 2.1 basado en ViT-L, que actúa como world-model congelado durante el entrenamiento. Por otro, el modelo de lenguaje Llama-3.2-1B-Instruct. Entre ambos se sitúa un puente espectral que transforma cada clip de 32 fotogramas en 1.024 tokens visuales, independientemente de la resolución de entrada. Esta compresión a un número fijo de tokens visuales reduce el coste de prefill: según el autor, el modelo procesa un clip con 2,3 TFLOPs en una H100, frente a los 7,0–40,5 TFLOPs de otros modelos abiertos de su clase, con 70 ms hasta el primer token en total.

El entrenamiento se basa en supervisión contrafactual sobre 4,60 millones de muestras públicas. Las transformaciones de píxeles de vídeos públicos generan variantes con respuestas equilibradas, fijadas por construcción y que solo difieren en la dinámica de la escena, de modo que el modelo de lenguaje aprende a interpretar dirección, orden, posición, velocidad, conteo y completitud a partir de la representación del codificador world-model. No se detalla en la información disponible si hubo RLHF o DPO adicionales, ni la composición exacta del dataset más allá del número de muestras.

## Capacidades

- Generación de texto y respuesta a preguntas sobre vídeo (video question answering), tarea principal del modelo.
- Comprensión de dinámica temporal en vídeo: dirección, orden, posición, velocidad, conteo y completitud de acciones.
- Extracción de características (feature-extraction) a partir de representaciones de vídeo y texto.
- Procesamiento de clips de 32 fotogramas con 1.024 tokens visuales por clip, a cualquier resolución de entrada.
- Capacidades multilingües limitadas al inglés.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, ni modos de pensamiento (thinking mode).
- No se documenta soporte de audio ni de visión estática (imagen); el foco es vídeo.

## Casos de uso

- Respuesta a preguntas sobre vídeo en inglés: el modelo recibe un clip de 32 fotogramas y una pregunta textual, y genera la respuesta; es adecuado por su entrenamiento específico en video question answering y su rendimiento declarado en benchmarks como NExT-QA (70,2) o PerceptionTest (71,9).
- Análisis de dinámica de escenas: detección de dirección, orden y velocidad de acciones en clips, gracias al entrenamiento contrafactual que enseña al modelo a leer el cambio temporal.
- Moderación y verificación de contenido en vídeo: el modelo puede evaluar si una secuencia de acciones descrita coincide con lo que ocurre en el clip, útil para pipelines de revisión automatizada.
- Indexación y etiquetado semántico de archivos de vídeo: extracción de características y generación de descripciones textuales para motores de búsqueda internos, aprovechando la compresión a 1.024 tokens por clip.
- Investigación en world models y representaciones de vídeo: el modelo sirve como banco de pruebas para estudiar cómo un codificador congelado tipo V-JEPA transfiere dinámica a un modelo de lenguaje pequeño.
- Despliegue en entornos con recursos limitados: con 1,55 mil millones de parámetros y 2,3 TFLOPs de prefill por clip en H100, es viable en una sola GPU para prototipos y demostraciones de comprensión de vídeo.
- Evaluación comparativa de modelos vídeo-lenguaje: su tamaño compacto permite incluirlo como línea base en estudios de benchmarks como MVBench, TVBench o TempCompass.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 66,3 |
| PerceptionTest | accuracy | 71,9 |
| TVBench | accuracy | 67,9 |
| TempCompass | accuracy | 71,6 |
| TOMATO | accuracy | 48,2 |
| MotionBench | accuracy | 49,5 |
| NExT-QA | accuracy | 70,2 |
| MVP | pair accuracy | 48,5 |
| TemporalBench (binary) | accuracy | 57,8 |
| SSv2 (multiple choice) | accuracy | 89,6 |
| Vinoground text | text pair accuracy | 51,2 |
| Vinoground video | video pair accuracy | 53,8 |

El autor reporta un promedio de 62,21 en las 12 puntuaciones sobre 11 benchmarks, frente a 52,45 del Qwen3-VL-2B como mejor modelo abierto de la clase 2B. También declara un promedio de 94,5 en seis conjuntos retenidos (con azar en 33,3), frente a 43,8 de Qwen3-VL-2B. Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,55 mil millones de parámetros en safetensors, el peso en precisión completa ronda los 3,1 GB, por lo que en cuantizaciones de 8 o 4 bits cabría en GPUs de consumo con holgura, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor cita una H100 para la medición de 2,3 TFLOPs de prefill por clip y 70 ms hasta el primer token; no se detallan otras GPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay datos oficiales de VRAM ni de latencia en tarjetas como RTX 4090.
- Opciones de despliegue: la librería indicada es transformers con código personalizado (custom_code); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 70 ms hasta el primer token en total y 2,3 TFLOPs de prefill por clip en H100, según el autor; no se detalla throughput de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.2-1B | 1,55 B | no disponible | 62,21 promedio en 12 puntuaciones | llama3.2 | Hugging Face |
| Qwen3-VL-2B | ~2 B | no disponible | 52,45 promedio en 12 puntuaciones (según el autor) | no disponible en la información | no disponible en la información |

No se dispone de datos suficientes en la información proporcionada para comparar con un tercer modelo de la misma categoría. La comparación con Qwen3-VL-2B procede exclusivamente de las afirmaciones del autor del modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con vídeos públicos, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: no cuantificado; como modelo de lenguaje generativo, es susceptible de producir respuestas plausibles pero incorrectas sobre el contenido del vídeo.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; no se especifica la longitud de contexto del modelo de lenguaje.
- Restricciones de licencia: sujeto a la Llama 3.2 Community License y a la Llama 3.2 Acceptable Use Policy de Meta; el uso comercial está condicionado por dicha licencia.
- Dependencia de código personalizado (custom_code) en transformers, lo que puede complicar la integración en pipelines estándar.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia habituales, lo que limita el despliegue en producción.
- El modelo tiene 0 descargas en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.2-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
- Dataset MVBench: https://huggingface.co/datasets/OpenGVLab/MVBench
- Dataset PerceptionTest: https://huggingface.co/datasets/lmms-lab/PerceptionTest
- Dataset TVBench: https://huggingface.co/datasets/FunAILab/TVBench
- Dataset TempCompass: https://huggingface.co/datasets/lmms-lab/TempCompass
- Dataset TOMATO: https://huggingface.co/datasets/yale-nlp/TOMATO
- Dataset MotionBench: https://huggingface.co/datasets/zai-org/MotionBench
- Dataset NExT-QA: https://huggingface.co/datasets/lmms-lab/NExTQA
- Dataset MVP: https://huggingface.co/datasets/facebook/minimal_video_pairs
- Dataset TemporalBench: https://huggingface.co/datasets/microsoft/TemporalBench
- Dataset SSv2: https://huggingface.co/datasets/HuggingFaceM4/something_something_v2
- Dataset Vinoground: https://huggingface.co/datasets/HanSolo9682/Vinoground
