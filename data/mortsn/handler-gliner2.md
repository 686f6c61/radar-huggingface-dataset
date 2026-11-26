# mortsn/handler-gliner2

## Resumen

Handler GLiNER2 es un ajuste fino completo del modelo base Fastino GLiNER2.5 base (194M de parámetros) orientado a una tarea muy concreta: interpretar órdenes habladas en el videojuego Handler, una comedia de sigilo controlada por voz en la que el jugador da instrucciones a dos espías. El modelo recibe una única pasada de codificación sobre la orden y resuelve siete grupos de clasificación simultáneos (`action`, `target`, `trigger`, `pace`, `negated`, `agrees`, `which`), lo que lo convierte en un clasificador de intenciones estructurado más que en un generador de texto.

Lo desarrolla el usuario mortsn (no vinculado a Fastino) y se distribuye en formato ONNX (encoder en fp16 y cabeza de clasificación separada), pensado para integrarse en el plugin de Unreal Engine `FGLiNER2` del propio juego. Su interés práctico radica en que demuestra un patrón de despliegue de GLiNER2 como componente de inferencia local de baja latencia (80-90 ms por orden en GPU) para sistemas de voz interactivos, con licencia Apache-2.0 y pesos abiertos.

Se trata de un modelo monoingüe (inglés), sin capacidades generativas, sin tool calling y sin contexto conversacional: es un extractor/etiquetador zero-shot especializado. Su relevancia es acotada al dominio del juego, pero sirve como referencia técnica de cómo destilar una tarea de clasificación de lenguaje natural en un encoder pequeño con exportación ONNX lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (GLiNER2.5 base) con cabeza de clasificación multi-grupo; exportado en dos ficheros ONNX (encoder fp16 + classifier) |
| Parámetros totales | 194M (modelo base GLiNER2.5 base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP16 (encoder ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_fp16.onnx`, `classifier.onnx`), tokenizer.json, calibration.json y checkpoint PyTorch en `tuned/gliner2.5-base-v1-gcall/` (formato gliner2 2.0.0) |

## Arquitectura y entrenamiento

El modelo parte de Fastino GLiNER2.5 base, un encoder de 194M de parámetros especializado en extracción de entidades y clasificación zero-shot, y se ajusta completamente (fine-tuning completo, no LoRA) para la tarea de lectura de órdenes del juego. La inferencia se estructura en una sola pasada del encoder sobre la orden, seguida de una cabeza de clasificación que produce simultáneamente las siete etiquetas (`action`, `target`, `trigger`, `pace`, `negated`, `agrees`, `which`). El export a ONNX se realizó con los exportadores de gliner2-rs de codesoda (commit 39ab954) y la conversión a fp16 de ORT; el encoder se ejecuta en DirectML o CPU.

El entrenamiento se realizó sobre los datos GLiClass del juego web, durante 3 épocas en fp32, con partición de validación separada por identificador de enunciado (held-out split by utterance id) para evitar fuga de datos entre train y test. Se incluye un fichero `calibration.json` con una temperatura softmax de 2,55 ajustada sobre las filas de validación, lo que indica que las probabilidades de salida requieren calibración antes de umbralizar. No se documenta el volumen de tokens ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica en un clasificador de este tipo).

## Capacidades

- Clasificación zero-shot multi-etiqueta de órdenes habladas en siete grupos simultáneos: acción, objetivo, disparador, ritmo, negación, acuerdo y selección.
- Lectura de intenciones en lenguaje natural de una sola frase, orientada a comandos de voz.
- Salida probabilística calibrada mediante temperatura softmax (2,55) para umbralización fiable.
- Inferencia local de baja latencia (80-90 ms por orden en GPU) apta para bucles interactivos en tiempo real.
- Integración nativa con el plugin de Unreal Engine `FGLiNER2` (VoiceCommand), que reproduce la codificación de entrada de gliner2 2.0.0.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Control por voz en videojuegos: el modelo traduce una orden hablada ("espía A, espera a que pase el guardia y luego corre") a una estructura de siete campos que el motor del juego consume directamente, con latencia de 80-90 ms compatible con la respuesta en tiempo real.
- Prototipado de interfaces de voz para juegos indie: al estar en ONNX y ejecutarse en DirectML o CPU, se puede integrar en builds de escritorio sin depender de servicios en la nube ni de GPU dedicada.
- Clasificación de comandos en asistentes de escritorio: el patrón de una pasada de encoder más cabeza multi-grupo sirve para enrutar intenciones (acción, objetivo, negación) en asistentes locales con presupuesto de latencia estricto.
- Evaluación de pipelines de voz a intención: el modelo y su conjunto de validación de 126 órdenes verificadas manualmente permiten comparar variantes de ASR o de preprocesado midiendo la precisión conjunta de las siete etiquetas.
- Investigación en destilación de tareas: sirve como ejemplo reproducible de ajuste completo de GLiNER2 sobre un dataset de dominio cerrado con partición por enunciado y calibración posterior.
- Despliegue en entornos sin conexión: los ficheros ONNX y el tokenizer son autónomos, lo que permite empaquetar el clasificador dentro de aplicaciones de escritorio o dispositivos con recursos limitados.
- Base para otros dominios de comandos: el checkpoint PyTorch incluido permite reajustar el modelo a nuevos vocabularios de órdenes (por ejemplo, domótica o robótica) manteniendo el mismo esquema de siete grupos.

## Benchmarks y rendimiento

| Métrica | Handler GLiNER2 | GLiClass v4 Edge fine-tune |
|---|---|---|
| Precisión conjunta (joint accuracy) en 126 órdenes verificadas manualmente | 0,842 | 0,833 |
| Latencia por orden (GPU) | 80-90 ms | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y se evalúa solo en la tarea específica del juego.

## Requisitos de hardware

- VRAM estimada: al tratarse de un encoder de 194M en fp16 (aproximadamente 0,4 GB de pesos) más la cabeza de clasificación, el modelo cabe holgadamente en cualquier GPU con 2 GB o más de memoria.
- GPU recomendadas: cualquier GPU moderna con soporte DirectML o CUDA; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 son más que suficientes y el cuello de botella será el preprocesado de audio, no el modelo.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo recientes (GTX 1060 en adelante) e incluso en CPU, ya que el autor indica ejecución en DirectML o CPU.
- Opciones de despliegue: ONNX Runtime (con conversión fp16 de ORT), plugin `FGLiNER2` de Unreal Engine, y el checkpoint PyTorch con la librería gliner2 2.0.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 80-90 ms por orden en GPU según el autor; no se publican cifras de throughput ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Handler GLiNER2 (este) | 194M | No disponible | Clasificación de órdenes en 7 grupos (inglés) | Apache-2.0 | ONNX + PyTorch en Hugging Face |
| Fastino GLiNER2.5 base | 194M | No disponible | Extracción de entidades y clasificación zero-shot genérica | Apache-2.0 | Hugging Face |
| GLiClass v4 Edge fine-tune | No disponible | No disponible | Clasificación de órdenes del mismo juego | No disponible | Referencia interna del autor |
| GLiNER original | ~200M (variantes) | No disponible | Extracción de entidades zero-shot | Apache-2.0 | Hugging Face |

La comparación relevante es con el modelo base GLiNER2.5, del que hereda arquitectura y tamaño, y con la variante GLiClass v4 Edge, que sirve de referencia de rendimiento en la misma tarea (0,833 frente a 0,842 de precisión conjunta). Frente a GLiNER genérico, la diferencia es la especialización en un esquema fijo de siete etiquetas y el formato ONNX listo para Unreal.

## Limitaciones y advertencias

- Modelo monoingüe: solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Dominio muy restringido: está ajustado exclusivamente a las órdenes del juego Handler; su rendimiento fuera de ese vocabulario y esquema de siete grupos es desconocido y probablemente degradado.
- No es generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; usarlo fuera de la clasificación de intenciones no es viable.
- Riesgo de alucinación estructural: al forzar siete etiquetas por orden, puede asignar valores a grupos que la orden no menciona; la calibración de temperatura (2,55) mitiga pero no elimina este riesgo.
- Evaluación limitada: la precisión de 0,842 se midió sobre 126 órdenes verificadas manualmente, una muestra pequeña que no cubre la variabilidad completa del habla real (acentos, ruido, ASR imperfecto).
- Dependencia del pipeline de voz: el rendimiento final depende del ASR previo; errores de transcripción no se han evaluado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento del juego pueden tener condiciones adicionales no detalladas en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento con órdenes largas o multi-frase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mortsn/handler-gliner2
- Modelo base Fastino GLiNER2.5 base: https://huggingface.co/fastino/gliner2.5-base-v1
- Exportadores gliner2-rs de codesoda (commit 39ab954): no disponible como enlace directo en la información proporcionada
- Documentación de GLiNER2: no disponible en la información proporcionada
- Plugin VoiceCommand / FGLiNER2 de Unreal Engine: no disponible como enlace en la información proporcionada
