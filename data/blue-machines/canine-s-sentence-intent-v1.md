# blue-machines/Canine-S-sentence-intent-v1

## Resumen

`blue-machines/Canine-S-sentence-intent-v1` es un clasificador de intenciones a nivel de frase desarrollado por blue-machines. Está construido sobre el modelo base `google/canine-s`, un encoder sin tokenización explícita de aproximadamente 133 millones de parámetros. El modelo resuelve la tarea de clasificación de la intención del usuario en siete categorías, pensado para sistemas de diálogo y atención al cliente.

La relevancia de este modelo radica en su enfoque tokenization-free, heredado de CANINE, que opera directamente sobre caracteres en lugar de depender de un tokenizador WordPiece o similar. Además, incluye una versión TorchScript cuantizada en INT8 optimizada para CPU, lo que permite una inferencia rápida en entornos sin GPU. El modelo está entrenado con datos sintéticos generados por Gemini y turnos reales de usuarios, y soporta inglés e hindi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CANINE (encoder sin tokenizacion, basado en google/canine-s) |
| Parametros totales | 132.971.911 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la implementacion usa 192 caracteres como longitud maxima de entrada) |
| Tipos de cuantizacion | TorchScript INT8 (model.pt / model_int8.pt), TorchScript FP32 (model_fp32.pt) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | No disponible |
| Formato de pesos | safetensors, TorchScript (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura CANINE, un encoder preentrenado que prescinde de un tokenizador explícito. En lugar de segmentar el texto en palabras o subpalabras, CANINE procesa la secuencia a nivel de caracteres, lo que elimina la dependencia de vocabularios y simplifica el pipeline de preprocesamiento. El modelo base `google/canine-s` fue preentrenado con un objetivo de masked language modeling en 104 idiomas; esta variante añade una cabeza de clasificación de intenciones.

El entrenamiento se realizó con datos "sentence-direct", es decir, frases sueltas sin empaquetado de marcadores de diálogo como `[assistant]` o `[user]`. La composición del dataset incluye datos sintéticos generados por Gemini, turnos de usuarios de Muthoot y ejemplos ruidosos de la clase `unclear`. El modelo es exclusivamente de intención, sin cabezas adicionales de identificación de idioma o detección de dominio. No se menciona el uso de RLHF o DPO.

Una innovación técnica destacable es la inclusión de una versión TorchScript cuantizada en INT8 para CPU, que ofrece una aceleración de aproximadamente 1,63x frente a FP32 y un tamaño en disco un 55% menor. El autor indica que ONNX Runtime no es compatible con CANINE debido a formas ilegales de MatMul en la ruta de atención local.

## Capacidades

- Clasificación de intenciones en 7 clases: `provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request` y `unclear`.
- Entrada de una sola frase desnuda, sin marcadores de diálogo.
- Salida con etiqueta de intención y confianza (probabilidad softmax).
- Mecanismo de abstención: si la confianza es inferior a 0,55, el modelo devuelve `unclear` para evitar respuestas erróneas.
- Soporte multilingüe limitado a inglés e hindi.
- No soporta tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede clasificar la intención de mensajes de usuarios en un chat de soporte bancario o de telecomunicaciones, lo que permite enrutar la conversación al departamento adecuado o activar una respuesta automática.
- Enrutamiento de tickets: en un sistema de gestión de incidencias, la clasificación de intención permite etiquetar automáticamente cada mensaje como petición de información, confirmación, negación, corrección, pregunta o solicitud de aclaración, facilitando la priorización y el seguimiento.
- Preprocesamiento de conversaciones: antes de aplicar análisis de sentimiento o extracción de entidades, este modelo puede filtrar y clasificar los turnos de usuario, mejorando la calidad de los datos de entrada para otros modelos.
- Selección de respuestas en bots transaccionales: una vez detectada la intención (por ejemplo, `affirm` o `deny`), el sistema puede seleccionar una plantilla de respuesta predefinida, reduciendo la latencia y el coste de generación.
- Filtrado de mensajes ambiguos: en entornos de producción, la regla de abstención con umbral 0,55 permite derivar automáticamente a un agente humano los mensajes con baja confianza, minimizando respuestas incorrectas.
- Clasificación de intenciones en entornos sin GPU: gracias a la versión TorchScript INT8, el modelo puede ejecutarse en CPU con una latencia de 24,7 ms por frase, lo que lo hace adecuado para aplicaciones embebidas o servidores ligeros.

## Benchmarks y rendimiento

La información disponible incluye métricas de evaluación en un conjunto de test, así como datos de latencia en CPU.

| Variante | Accuracy | Macro-F1 | False-intent | Coverage | Selective acc |
|---|---|---|---|---|---|
| FP32 raw (sin umbral) | 0,9379 | 0,9365 | 0,0547 | 1,0000 | 0,9379 |
| Deploy raw (sin umbral) | 0,9379 | 0,9365 | 0,0547 | 1,0000 | 0,9379 |
| Deploy con umbral 0,55 | 0,9329 | 0,9333 | 0,0410 | 0,9715 | 0,9528 |

| Runtime | Latencia p50 | QPS aprox. |
|---|---|---|
| TorchScript INT8 | 24,7 ms | 40,5 |
| TorchScript FP32 | 40,3 ms | 24,8 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; el modelo es pequeño (~133M) y puede ejecutarse en CPU con menos de 1 GB de RAM.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU mediante TorchScript INT8.
- Compatibilidad con GPU consumer: sí, por su tamaño, pero no se proporcionan datos de rendimiento en GPU.
- Opciones de despliegue: TorchScript via PyTorch, con `torch.jit.load`. No es compatible con ONNX Runtime. Se puede integrar con HuggingFace Transformers para el tokenizador.
- Latencia y throughput: INT8 ofrece 24,7 ms p50 y ~40,5 QPS con 8 hilos; FP32 ofrece 40,3 ms p50 y ~24,8 QPS.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada. El modelo base `google/canine-s` no es un clasificador de intenciones, por lo que no es una alternativa directa. No hay datos de modelos comparables disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se mencionan, pero al estar entrenado con datos sintéticos de Gemini y turnos de usuarios de Muthoot, puede presentar sesgos hacia el dominio financiero y hacia patrones de lenguaje de estos datos.
- Riesgo de alucinación: bajo, ya que la tarea es clasificación, pero una confianza baja puede llevar a etiquetas incorrectas si no se aplica el umbral de abstención.
- Limitaciones de contexto: la implementación trunca o rellena las frases a 192 caracteres; frases más largas pueden perder información relevante.
- Restricciones de licencia: la licencia no está disponible, por lo que se desconoce si permite uso comercial.
- Limitaciones de idioma: solo soporta inglés e hindi.
- No es compatible con ONNX Runtime; el despliegue debe realizarse mediante TorchScript, lo que limita las opciones de integración en algunos frameworks.
- El umbral de confianza recomendado es 0,55. Si se usa sin umbral, la tasa de falsos positivos es mayor (0,0547 frente a 0,0410).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/blue-machines/Canine-S-sentence-intent-v1
- Modelo base google/canine-s: https://huggingface.co/google/canine-s
