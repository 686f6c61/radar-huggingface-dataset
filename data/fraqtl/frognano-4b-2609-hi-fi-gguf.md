# fraQtl/FrogNano-4B-2609-Hi-Fi-GGUF

## Resumen

FrogNano-4B-2609-Hi-Fi-GGUF es una cuantización de 4 bits del modelo base microsoft/FrogNano-4B-2609, publicada por el usuario fraQtl bajo licencia MIT. El modelo base, desarrollado por Microsoft, cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y está orientado a generación de texto conversacional. Esta versión GGUF está pensada para ejecución local mediante llama.cpp, incluyendo despliegue en dispositivos con NPU Snapdragon Hexagon.

La propuesta diferencial de esta ficha no es el modelo en sí, sino el proceso de cuantización: el autor aplica redondeo GPTQ ponderado por Hessiano dentro de los bloques Q4_K, Q5_K y Q6_K nativos de llama.cpp, y reasigna 7 tensores críticos a Q5_K sin exceder el presupuesto de bytes de un Q4_K_M convencional. El resultado es un archivo de 2.727.809.824 bytes (2,73 GB) que, según las mediciones del autor, presenta menor divergencia KL respecto al modelo bf16 original que las alternativas de 4 bits comparadas.

Es relevante ahora porque demuestra que es posible mejorar la fidelidad de una cuantización de 4 bits manteniendo el mismo tamaño de archivo y compatibilidad total con llama.cpp estándar, sin necesidad de runtimes personalizados. No se dispone de información sobre la arquitectura interna, el contexto o los idiomas del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base microsoft/FrogNano-4B-2609; no se detalla transformer, MoE ni híbrida) |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (mayoría de tensores), Q5_K (7 tensores críticos), Q6_K (tensores seleccionados); formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo FrogNano-4B-2609-fraQtl-Q4_K.gguf, 2.727.809.824 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base microsoft/FrogNano-4B-2609 en la documentación proporcionada: no se especifica si es un transformer denso, un modelo MoE, híbrido o basado en SSM, ni se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si se aplicaron técnicas de RLHF, DPO u otras.

Lo que sí está documentado es el proceso de cuantización aplicado por fraQtl. Se parte de los pesos bf16 del modelo original y se aplica redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) escrito dentro de los propios bloques Q4_K, Q5_K y Q6_K de llama.cpp, usando las escalas de bloque y los mínimos de llama-quantize, junto con estadísticas y una importance matrix derivada de un corpus de calibración no publicado. Además, se midió el coste de compresión de cada tensor y se elevaron los 7 tensores más costosos a Q5_K, manteniéndose dentro del presupuesto de bytes de un Q4_K_M. Finalmente, se eliminó el bloque de next-token-prediction, que llama.cpp no ejecuta, reduciendo el tamaño de descarga. El autor indica que todas las cuantizaciones fueron medidas sobre los mismos 32 bloques con el bloque de predicción eliminado.

## Capacidades

- Generación de texto conversacional (pipeline_tag: text-generation, tag "conversational").
- Seguimiento de instrucciones (evaluado con IFEval en la documentación del autor).
- Razonamiento matemático (evaluado con GSM8K en la documentación del autor).
- Tool calling / function calling (citado explícitamente como parte del eje "Task" en las mediciones de KL).
- Conocimiento y razonamiento general (citado como eje "General" en las mediciones de KL).
- Ejecución en llama.cpp estándar sin runtime personalizado.
- Compatibilidad declarada con el backend NPU Snapdragon Hexagon (todos los tipos de tensor del archivo están soportados por dicho backend, aunque no se ha ejecutado un benchmark en dispositivo).
- Modo "thinking" desactivable en la decodificación (la evaluación se realizó con thinking off).
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Ejecución local en portátiles y estaciones de trabajo: el archivo de 2,73 GB cabe en memoria unificada o VRAM de GPUs de consumo, permitiendo inferencia offline con llama.cpp sin dependencia de servicios en la nube.
- Despliegue en dispositivos con NPU Snapdragon Hexagon: el autor declara soporte de todos los tipos de tensor en el backend Hexagon de llama.cpp, lo que habilita prototipos de asistentes on-device en smartphones y tablets con dicha plataforma (pendiente de benchmark real en dispositivo).
- Asistentes conversacionales multi-turno: el modelo está etiquetado como conversacional y su fidelidad al original en instrucciones y tool calling es el eje mejor medido, lo que lo hace adecuado para chatbots locales con llamadas a herramientas.
- Automatización de tareas con function calling: la cuantización preserva especialmente el comportamiento de tool calling (mejora del 20,3 % en KL de tarea frente a Q4_K_M), por lo que puede integrarse en pipelines de agentes que invocan APIs locales.
- Razonamiento matemático ligero: con 229/250 en GSM8K (greedy, thinking off) según la evaluación del autor, es viable para resolución de problemas aritméticos y de varios pasos en entornos educativos o de prototipado.
- Evaluación y comparación de cuantizaciones: el repositorio incluye tablas de KL y un directorio `receipts/` con hashes y resúmenes por pregunta, lo que lo convierte en un caso de referencia para investigar el impacto de técnicas de cuantización GPTQ dentro de formatos GGUF.
- Prototipado rápido con `llama-cli -hf`: el comando de inicio rápido permite probar el modelo con una sola línea, útil para demos y validación de ideas antes de invertir en infraestructura.

## Benchmarks y rendimiento

Divergencia KL de vocabulario completo respecto al modelo bf16 original, medida sobre 144 ventanas de texto reservadas (menor es mejor). Intervalos del 95 % por bootstrap pareado con 2.000 remuestreos:

| Archivo | Bytes (evaluados) | KL tarea | KL general |
|---|---|---|---|
| fraQtl Hi-Fi Q4_K (este repo) | 2.727.809.824 | 0,01853 | 0,01313 |
| Q4_K_M, bartowski/FrogNano-4B-2609-GGUF | 2.729.642.880 | 0,02327 | 0,01404 |
| IQ4_NL, mismo repo | 2.719.177.600 | 0,02573 | 0,01761 |
| Q4_K_S, mismo repo | 2.547.780.480 | 0,02802 | 0,01711 |
| Q4_0, mismo repo | 2.647.856.000 | 0,04949 | 0,02928 |

Frente a Q4_K_M a igualdad de bytes: tarea −20,3 % [−27,4; −11,8], general −6,5 % [−11,5; −1,9]. Tarea = seguimiento de instrucciones + tool calling; general = conocimiento + razonamiento.

Respuestas sobre 500 preguntas fijas (decodificación greedy, thinking off, llama.cpp b12079, una GPU por archivo):

| Archivo | GSM8K /250 | IFEval /250 |
|---|---|---|
| Q4_K_M, bartowski (tal como se descarga) | 229 | 190 |
| fraQtl Hi-Fi Q4_K (este repo) | 229 | 191 |

Preguntas acertadas solo por un archivo: GSM8K 7 y 7 (p = 1,00); IFEval 15 y 14 (p = 1,00). El modelo bf16 original no se evaluó en estas preguntas, por lo que la comparación es únicamente entre los dos archivos de 4 bits.

Desglose de la contribución de cada paso frente a Q4_K_M:

| Paso | Tarea | General |
|---|---|---|
| Redondeo en tensores Q4_K | −15,3 % | −0,2 % |
| + redondeo en tensores Q6_K | −17,6 % | −3,1 % |
| + 7 tensores elevados a Q5_K | −20,3 % | −6,5 % |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 2,73 GB; con overhead de contexto y KV cache, se estima un uso de VRAM en el rango de 3 a 4 GB para contextos moderados (estimación propia, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe en GPUs de consumo con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070). El autor menciona haber usado "una GPU por archivo" en las evaluaciones, sin detallar el modelo.
- Cabe en GPU de consumo: sí, por el tamaño del archivo (2,73 GB).
- Opciones de despliegue: llama.cpp estándar (probado con la build b12079), incluido `llama-cli -hf`; backend NPU Snapdragon Hexagon declarado compatible con todos los tipos de tensor, aunque sin benchmark en dispositivo. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La comparación disponible es entre cuantizaciones del mismo modelo base, no con otros modelos:

| Cuantización | Bytes | KL tarea | KL general | GSM8K | IFEval | Licencia | Runtime |
|---|---|---|---|---|---|---|---|
| fraQtl Hi-Fi Q4_K | 2.727.809.824 | 0,01853 | 0,01313 | 229/250 | 191/250 | MIT | llama.cpp estándar |
| Q4_K_M (bartowski) | 2.729.642.880 | 0,02327 | 0,01404 | 229/250 | 190/250 | MIT (heredada) | llama.cpp estándar |
| IQ4_NL (bartowski) | 2.719.177.600 | 0,02573 | 0,01761 | no disponible | no disponible | MIT (heredada) | llama.cpp estándar |
| Q4_K_S (bartowski) | 2.547.780.480 | 0,02802 | 0,01711 | no disponible | no disponible | MIT (heredada) | llama.cpp estándar |
| Q4_0 (bartowski) | 2.647.856.000 | 0,04949 | 0,02928 | no disponible | no disponible | MIT (heredada) | llama.cpp estándar |

Comparativa con otros modelos de ~4B parámetros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- La evaluación de fidelidad se basa en 144 ventanas KL de una única build; el propio autor advierte que la KL mide cercanía al modelo original, no precisión en tareas.
- La comparación de respuestas (GSM8K, IFEval) es solo entre los dos archivos de 4 bits; el modelo bf16 original no se evaluó en esas 500 preguntas, por lo que no hay referencia absoluta de precisión.
- Las diferencias en GSM8K e IFEval entre ambas cuantizaciones no son estadísticamente significativas (p = 1,00), de modo que la ventaja principal medida es la divergencia KL, no el acierto en tareas.
- El corpus de calibración, la importance matrix y la tabla de coste por tensor no están publicados, lo que impide reproducir exactamente el proceso de cuantización.
- No hay benchmark en dispositivo para el backend Hexagon; el soporte es declarado pero no verificado en hardware real.
- Es un modelo de texto; no se documentan capacidades multimodales.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe ni calidad en castellano.
- Longitud de contexto: no disponible; no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una cuantización de 4 bits, cabe esperar una degradación adicional respecto al modelo bf16, no medida en esta ficha.
- Licencia MIT: permite uso comercial, pero se heredan las condiciones del modelo base microsoft/FrogNano-4B-2609, cuyos términos específicos no se detallan en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/FrogNano-4B-2609-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- GGUFs de referencia (bartowski): https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF
- Perfil del autor: https://huggingface.co/fraQtl
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia del redondeo GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Imagen del repositorio: https://huggingface.co/fraQtl/FrogNano-4B-2609-Hi-Fi-GGUF/resolve/main/FrogNano-4B-2609-Hi-Fi-GGUF.png
