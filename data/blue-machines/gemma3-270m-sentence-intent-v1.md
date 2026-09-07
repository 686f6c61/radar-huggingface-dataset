# blue-machines/Gemma3-270M-sentence-intent-v1

## Resumen

El modelo `blue-machines/Gemma3-270M-sentence-intent-v1` es un clasificador de intenciones a nivel de frase, desarrollado por blue-machines, que parte del modelo base `google/gemma-3-270m` (~269M de parámetros). Está diseñado para resolver el problema de identificar la intención del usuario en una única frase sin necesidad de marcadores de diálogo como `[user]` o `[assistant]`, lo que lo hace especialmente útil en sistemas de atención al cliente y asistentes conversacionales.

La arquitectura es un transformer basado en Gemma 3, fine-tuneado para una tarea de clasificación de 7 intenciones: `provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request` y `unclear`. El modelo se distribuye en formato ONNX, con una versión INT8 optimizada para despliegue y una versión FP32 de referencia, además de los pesos originales en safetensors. Incluye un mecanismo de abstinencia mediante umbral de confianza que permite derivar casos ambiguos a la etiqueta `unclear`.

Su relevancia actual radica en que ofrece un clasificador ligero, multilingüe (inglés e hindi) y listo para producción, con métricas de rendimiento reportadas en un conjunto de prueba directo y una regla de servido clara basada en cobertura y precisión selectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M) |
| Parametros totales | 268.716.103 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el tokenizer se usa con truncacion a 64 tokens) |
| Tipos de cuantizacion | INT8 (deploy), FP32 (referencia) |
| Idiomas soportados | en, hi |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX (model.onnx, model_fp32.onnx) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer `google/gemma-3-270m` para clasificación de intenciones. Se compone de un encoder Gemma 3 con una cabeza de clasificación GeGLU que produce logits sobre 7 clases. La entrada es una única frase sin marcadores de diálogo, y la salida se interpreta mediante softmax para obtener la confianza de cada intención.

Según la información del autor, el entrenamiento se realizó con datos de tipo "sentence-direct" que combinan datos sintéticos generados con Gemini, turnos de usuarios reales de Muthoot y ejemplos ruidosos etiquetados como `unclear`. No se menciona el uso de RLHF ni DPO. La innovación técnica destacable es el diseño del despliegue: el encoder se cuantiza a INT8 mientras que la cabeza GeGLU se mantiene en FP32 para preservar la calidad de la clasificación. Además, se define un umbral de confianza óptimo de 0.55 que maximiza la precisión selectiva manteniendo una cobertura superior al 97%.

## Capacidades

- Clasificación de intenciones en 7 clases: `provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request` y `unclear`.
- Acepta una sola frase como entrada, sin necesidad de empaquetar turnos de diálogo.
- Devuelve la etiqueta de intención, la confianza (probabilidad máxima tras softmax) y las probabilidades de todas las clases.
- Mecanismo de abstinencia: si la confianza es inferior a 0.55, la predicción se fuerza a `unclear`, reduciendo falsas intenciones específicas.
- Soporte multilingüe para inglés e hindi.
- Optimizado para inferencia con ONNX Runtime, tanto en CPU como en GPU.
- No es un modelo generativo: no soporta tool calling, razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Atención al cliente bilingüe (inglés/hindi): el modelo puede clasificar la intención de cada mensaje del usuario en un chat de soporte, permitiendo enrutar automáticamente la conversación al departamento adecuado o activar respuestas predefinidas.
- Detección de afirmaciones y negaciones en transacciones bancarias: ante frases como "Nahi, maine ye payment nahi kiya", el modelo identifica la intención de negación, lo que ayuda a confirmar operaciones o cancelar pagos.
- Sistemas de preguntas frecuentes: la clase `question` permite detectar consultas del usuario y responder con contenido de una base de conocimiento sin necesidad de un LLM generativo completo.
- Corrección de datos del usuario: la intención `correction` es útil en formularios o procesos de reserva donde el usuario rectifica información, por ejemplo "Sorry I meant March not April", y el sistema puede actualizar el registro.
- Derivación a agente humano: mediante el umbral de confianza, las frases con probabilidad baja se marcan como `unclear` y se escalan a un operador, evitando respuestas automáticas erróneas.
- Clasificación de intenciones en sistemas de voz: al ser un modelo ligero (268M parámetros) y compatible con ONNX, puede integrarse en pipelines de ASR para etiquetar la intención de cada utterance de forma rápida y con baja latencia.

## Benchmarks y rendimiento

Los resultados reportados por el autor en el conjunto de prueba directo son los siguientes:

| Variante | Accuracy | Macro-F1 | False-intent | Coverage | Selective acc |
|---------|---------:|---------:|-------------:|---------:|--------------:|
| FP32 raw (sin umbral) | 0.9452 | 0.9444 | 0.0448 | 1.0000 | 0.9452 |
| Deploy raw (sin umbral) | 0.9451 | 0.9445 | 0.0456 | 1.0000 | 0.9451 |
| Deploy @ umbral 0.55 | 0.9392 | 0.9403 | 0.0362 | 0.9755 | 0.9572 |

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos del autor. No se dispone de comparativas con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 268M parámetros. En FP32 ocupa aproximadamente 1.07 GB, y en INT8 unos 0.27 GB. La inferencia puede ejecutarse en CPU sin necesidad de VRAM.
- GPU recomendadas: no es necesario usar GPU; el modelo funciona correctamente en CPU con ONNX Runtime. Si se busca menor latencia, una GPU modesta como una NVIDIA T4 o RTX 3060 es suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM puede ejecutar la versión INT8.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), integración en servicios Python, o mediante contenedores que usen el runtime. No es compatible con vLLM, llama.cpp ni Ollama al ser un clasificador no generativo.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización INT8, se espera una latencia baja en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada ni en los resultados de la búsqueda web. El modelo es un clasificador de intenciones específico, por lo que no se pueden establecer comparaciones con el modelo base Gemma 3 270M, que es un modelo de lenguaje generativo. No se han encontrado alternativas equivalentes con datos públicos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con datos sintéticos de Gemini y turnos de usuarios de Muthoot, el modelo puede reflejar sesgos de esos dominios, especialmente en el contexto bancario o de servicios financieros.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede asignar una intención incorrecta si la frase es ambigua o está fuera del dominio.
- Limitaciones de idioma: solo soporta inglés e hindi. Frases en otros idiomas pueden ser clasificadas incorrectamente.
- Limitaciones de contexto: el tokenizer trunca a 64 tokens, por lo que frases más largas se pierden parcialmente. No se especifica la longitud de contexto del modelo base en la ficha.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada. Debe verificarse antes de cualquier uso comercial.
- Umbral de confianza: el umbral de 0.55 reduce falsas intenciones específicas, pero también provoca que aproximadamente un 2.45% de las muestras se abstengan y se etiqueten como `unclear`, lo que puede ser indeseable en sistemas que requieren una respuesta siempre.
- El modelo no soporta diálogos multi-turno ni marcadores de rol; la entrada debe ser una frase individual. Empaquetar turnos con `[user]` o `[assistant]` puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blue-machines/Gemma3-270M-sentence-intent-v1
- Modelo base Gemma 3 270M: https://huggingface.co/google/gemma-3-270m
- Versión instruct del modelo base: https://huggingface.co/google/gemma-3-270m-it
