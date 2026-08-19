# logic65/Qwen3.8-Whittle-48L-cut

## Resumen

Qwen3.8-Whittle-48L-cut es un modelo de lenguaje generativo derivado de Qwen3.8-27B-FP8 mediante poda de profundidad (depth pruning). Desarrollado por logic65 (David Aylward) como parte de la familia Whittle, elimina 16 de las 64 capas originales (bloques 4-11 y 24-31) sin realizar ningún entrenamiento de reparación posterior, lo que lo convierte en una variante "zero-training" pensada para investigación. El resultado es un modelo de 20,8 mil millones de parámetros que conserva la mayor parte de las capacidades del modelo original, según las pruebas del autor.

La relevancia de este modelo radica en que demuestra que es posible reducir significativamente el tamaño de un LLM mediante poda de profundidad sin degradación catastrófica, manteniendo un rendimiento aceptable en tareas de código, aritmética, sentido común y recuerdo factual. Está pensado como base para experimentos de fine-tuning posteriores y para ejecución en hardware de consumo, ya que se distribuye en formato GGUF y alcanza 5 tokens por segundo en dos GPUs de 8 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el autor lo presenta como un "research preview" y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B-FP8) con poda de profundidad de 64 a 48 capas |
| Parametros totales | 20,8 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes concretas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B-FP8, un transformer denso de 64 capas con 27 mil millones de parámetros. La poda elimina 16 capas completas (bloques 4-11 y 24-31), reduciendo el recuento de parámetros a 20,8 mil millones. No se aplica poda de anchura (width pruning) ni entrenamiento de reparación, por lo que los pesos restantes son exactamente los del modelo original. El autor indica que se preserva el patrón de intervalos GGUF, lo que facilita su uso con herramientas como llama.cpp.

No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de poda más allá de la selección de bloques basada en "block pricing" medido. El modelo se presenta como "zero-training", es decir, no hubo ninguna fase de ajuste posterior a la poda. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación en el proceso.

## Capacidades

- Generacion de texto: mantiene capacidades de generacion coherente en tareas de codigo, aritmetica, sentido comun y recuerdo factual, segun las pruebas del autor.
- Razonamiento: el autor reporta que las capacidades de razonamiento basico se conservan tras la poda, aunque no se especifican tareas complejas.
- Soporte de tool calling / function calling: no se menciona en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se menciona.
- Capacidades multilingues: no se especifican idiomas soportados.
- Capacidades especiales: no se indican modos de pensamiento, vision ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigacion en poda de modelos: este modelo sirve como punto de partida para estudiar el impacto de la poda de profundidad en LLMs, ya que es una variante sin entrenamiento de reparacion y con metricas publicadas por el autor.
- Base para fine-tuning experimental: al ser un modelo "sin danos" segun el autor, puede usarse como base para entrenamientos posteriores con datasets especificos, aprovechando su menor tamano respecto al original.
- Inferencia local en hardware de consumo: con 20,8B parametros en formato GGUF, puede ejecutarse en GPUs de 8 GB (dos en paralelo) a 5 tokens por segundo, lo que lo hace util para prototipos y pruebas locales.
- Generacion de codigo en entornos con recursos limitados: mantiene capacidades de codigo, por lo que puede emplearse en asistentes de programacion locales sin necesidad de GPUs de alta gama.
- Evaluacion de degradacion por poda: permite comparar el rendimiento entre variantes con distinto numero de capas (48L, 44L, 16.8B) para entender la relacion entre tamano y calidad.
- Educacion y demostraciones: su licencia Apache 2.0 y su tamano moderado lo hacen adecuado para cursos y talleres sobre compresion de modelos y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una "battery" de 39 prompts de evaluacion propia, con los siguientes resultados para la familia Whittle:

| Variante | Parametros | Battery (sobre 39) | Velocidad |
|---|---|---|---|
| 48L cut (este modelo) | 20,8B | 33/39 | 5 t/s |
| 44L cut | 19,2B | 28/39 | 9-10 t/s |
| 16.8B cut+shrink, unrepaired | 16,8B | 25/39 | 20,5 t/s |
| Whittle-16B healed | 16,8B | 36/39 | 18,5-20,9 t/s |

Estos datos son mediciones propias del autor y no son comparables con benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada: el autor reporta que el modelo funciona a 5 t/s en dos GPUs de 8 GB cada una (16 GB en total). No se especifica la cuantizacion exacta, pero al ser GGUF, es probable que se use una cuantizacion de 4 u 8 bits.
- GPUs recomendadas: dos GPUs de consumo con 8 GB (por ejemplo, RTX 3060, RTX 4060) o una GPU con 16 GB o mas (RTX 4090, A100, etc.).
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 16 GB de VRAM combinada o una sola GPU con 16 GB.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros motores que soporten este formato. Tambien podria usarse con vLLM si se convierte a safetensors, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: 5 t/s en la configuracion de dos GPUs de 8 GB, segun el autor. No se proporcionan datos para otras configuraciones.

## Comparativa con modelos similares

La comparativa se limita a las variantes de la familia Whittle, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Battery (39) | Velocidad | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-48L-cut | 20,8B | No disponible | 33/39 | 5 t/s | Apache 2.0 |
| Qwen3.8-Whittle-44L-cut | 19,2B | No disponible | 28/39 | 9-10 t/s | Apache 2.0 |
| Qwen3.8-p44w75-16.8B-unrepaired | 16,8B | No disponible | 25/39 | 20,5 t/s | Apache 2.0 |
| Qwen3.8-Whittle-16B | 16,8B | No disponible | 36/39 | 18,5-20,9 t/s | Apache 2.0 |

No se dispone de informacion sobre el modelo base Qwen3.8-27B-FP8 en cuanto a rendimiento en benchmarks estandar, por lo que no es posible comparar directamente con el modelo podado.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo presenta como "research preview" y no como un modelo listo para produccion. No se ha sometido a evaluaciones exhaustivas de seguridad ni de sesgos.
- Posible degradacion en tareas complejas: aunque el autor afirma que "nada se rompio de forma medible", la poda de 16 capas puede afectar a tareas que requieren razonamiento profundo o conocimiento muy especifico no cubierto por las pruebas del autor.
- Alucinaciones: al ser un modelo de lenguaje generativo, existe riesgo de alucinacion, especialmente en tareas factuales. El autor menciona que algunos probes factuales puntuan "mas agudos" que el modelo intacto, pero esto no garantiza fiabilidad.
- Sesgos del modelo base: el modelo hereda los sesgos potenciales de Qwen3.8-27B-FP8, que no se han evaluado en esta variante.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que se desconoce si la poda afecta a la ventana de atencion.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor solicita donaciones para continuar la investigacion; no hay restricciones legales adicionales.
- Soporte limitado: al ser un modelo de un investigador independiente, no hay garantias de mantenimiento, documentacion amplia ni soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logic65/Qwen3.8-Whittle-48L-cut
- Variante 44L: https://huggingface.co/logic65/Qwen3.8-Whittle-44L-cut
- Variante 16.8B unrepaired: https://huggingface.co/logic65/Qwen3.8-p44w75-16.8B-unrepaired
- Variante Whittle-16B: https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Modelo base (referencia): Qwen/Qwen3.8-27B-FP8 (no se proporciona enlace directo)
- Pagina de donaciones del autor: https://ko-fi.com/davida81328
