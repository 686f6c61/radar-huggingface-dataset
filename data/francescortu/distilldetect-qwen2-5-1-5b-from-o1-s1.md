# francescortu/DistillDetect-Qwen2.5-1.5B-from-o1-s1

## Resumen

DistillDetect-Qwen2.5-1.5B-from-o1-s1 es una reproducción no oficial de un modelo estudiante destilado, publicada por francescortu, que replica el procedimiento descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El modelo parte de Qwen/Qwen2.5-1.5B como base y se entrena mediante ajuste fino supervisado (SFT) sobre 1000 respuestas generadas por el modelo profesor openai/o1 a partir de los prompts del conjunto s1. El objetivo del trabajo original es estudiar la detección de destilación entre modelos, y este checkpoint sirve como material de referencia para reproducir y analizar dicho fenómeno.

Con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), se trata de un modelo denso de tamaño reducido, heredero de la arquitectura Qwen2.5, que soporta una ventana de contexto de hasta 128K tokens. Su licencia Apache 2.0 y su formato safetensors facilitan su integración en entornos de investigación y desarrollo. La relevancia actual radica en que permite explorar la destilación de conocimiento y sus implicaciones en la detección de modelos derivados, un área de creciente interés en la comunidad de IA abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (heredado de Qwen2.5-1.5B) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantificable a GGUF/AWQ) |
| Idiomas soportados | No disponible (hereda el multilingüismo de Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, basado en la arquitectura Qwen2.5-1.5B. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; sigue el diseño estándar de atención completa. El entrenamiento consistió en un ajuste fino supervisado (SFT) con los scripts publicados por los autores del paper (Apéndice A): 3 épocas, tasa de aprendizaje 1e-5 con programación coseno y 5% de warmup, tamaño de lote efectivo 16 (per-device batch 4 con grad-accum 4), block size de 4096 tokens, precisión bf16 y gradient checkpointing. La pérdida se calculó únicamente sobre los tokens de respuesta, enmascarando el prompt con -100. Los datos de entrenamiento son 1000 respuestas generadas por openai/o1 a partir de los prompts del conjunto s1, distribuidas textualmente en el repositorio de los autores bajo licencia MIT. No se aplicaron técnicas de RLHF ni DPO; el proceso es exclusivamente SFT.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen2.5-1.5B, conserva las capacidades generales de generación y razonamiento del modelo base, aunque el ajuste con datos de o1 puede orientarlo hacia respuestas más estructuradas y detalladas.
- Razonamiento matemático y lógico: los datos de entrenamiento provienen de o1, conocido por su rendimiento en tareas de razonamiento, por lo que el modelo puede mostrar mejoras relativas en problemas de matemáticas y lógica, aunque no hay benchmarks publicados que lo confirmen.
- Multilingüismo: hereda el soporte multilingüe de Qwen2.5, aunque no se especifican los idiomas concretos en la ficha.
- Sin soporte explícito de tool calling ni function calling: al ser un modelo base ajustado con SFT, no se ha documentado la capacidad de invocar herramientas externas.
- Sin modo de pensamiento (thinking mode) explícito: a diferencia de o1, este modelo no expone un modo de razonamiento oculto; genera respuestas directas según la plantilla `Problem:\n{question}\n\nSolution:\n`.
- Capacidad de reproducción experimental: su principal valor es servir como checkpoint de referencia para estudios sobre destilación y detección de modelos derivados.

## Casos de uso

- Investigación sobre destilación de modelos: permite comparar el comportamiento de un estudiante destilado frente a su profesor y a otros estudiantes, analizando diferencias en distribuciones de salida, estilos de razonamiento y patrones de error.
- Detección de modelos destilados: el modelo puede utilizarse como entrada en pipelines de detección basados en referencias, tal como propone el paper original, para identificar si un modelo desconocido ha sido destilado de otro.
- Reproducción de experimentos académicos: investigadores pueden replicar los resultados del artículo arXiv:2607.09692 usando este checkpoint, ya que se proporcionan los scripts de entrenamiento y los datos.
- Evaluación de técnicas de SFT con datos sintéticos: sirve como caso de estudio para medir el impacto de entrenar con respuestas generadas por un modelo de alto rendimiento (o1) sobre un modelo base pequeño.
- Generación de texto en entornos con recursos limitados: al tener solo 1,5B parámetros, puede desplegarse en hardware modesto para tareas de generación de texto, aunque su especialización en razonamiento lo hace menos adecuado para usos generales.
- Análisis de sesgos y alucinaciones en modelos destilados: al ser un modelo pequeño entrenado con un conjunto reducido de datos, es útil para estudiar cómo se propagan los sesgos del profesor y qué tipo de alucinaciones aparecen tras la destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones de GSM8K y MATH500 están pendientes de cálculo y se añadirán posteriormente. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54B parámetros en bf16, el modelo ocupa aproximadamente 3,1 GB en memoria (según el tamaño del repositorio). En cuantización de 8 bits, podría reducirse a unos 1,6 GB, y en 4 bits a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantización 4-bit, incluso GPUs con 2 GB podrían ser suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas, incluidas las de gama media.
- Opciones de despliegue: al ser un modelo Qwen2.5, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks que soporten la arquitectura Qwen2.5. También puede usarse con Transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 1,5B en una RTX 4090 suele alcanzar decenas de tokens por segundo en generación, pero depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-1.5B-from-o1-s1 | 1,54B | 128K | Apache 2.0 | Destilado de Qwen2.5-1.5B con datos de o1, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 128K | Apache 2.0 | Modelo base original, preentrenado con 18T tokens, multilingüe |
| madaibaba/deepseek-distill-qwen2.5-1.5b | 1,54B | 128K | Apache 2.0 (presumible) | Destilado de Qwen2.5-1.5B usando técnicas de DeepSeek, sin benchmarks publicados |

La comparativa se limita a modelos de tamaño similar basados en Qwen2.5. No hay datos de rendimiento para ninguno de ellos en esta información, por lo que la elección entre ellos dependerá del propósito: el modelo de francescortu está orientado a la investigación sobre destilación, mientras que el base es más general y el de madaibaba podría tener un enfoque distinto.

## Limitaciones y advertencias

- Reproducción no oficial: el autor declara explícitamente que no está afiliado con los autores del paper original y que se trata de una reproducción independiente. Los resultados pueden diferir de los del estudio original.
- Conjunto de datos reducido: solo 1000 ejemplos de entrenamiento, lo que puede provocar sobreajuste y una generalización limitada fuera de los dominios representados en s1.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas estándar; las evaluaciones GSM8K y MATH500 están pendientes.
- Sesgos del profesor: al entrenar con respuestas de openai/o1, el modelo puede heredar sesgos, estilos de razonamiento y posibles alucinaciones del profesor, que no se han auditado.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el entrenamiento se realizó con block size de 4096, por lo que el rendimiento en contextos largos puede degradarse.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento se redistribuyen bajo MIT del repositorio de los autores; se recomienda revisar los términos de ambos.
- Sin soporte de tool calling ni agentes: no se ha documentado la capacidad de invocar funciones o realizar razonamiento multi-paso con herramientas externas.

## Enlaces

- [HuggingFace - DistillDetect-Qwen2.5-1.5B-from-o1-s1](https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-o1-s1)
- [Paper arXiv:2607.09692](https://arxiv.org/abs/2607.09692)
- [Repositorio GitHub de los autores (DistillDetect)](https://github.com/RajatRawat-creator/DistillDetect)
- [Modelo base Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Qwen2.5 en GitHub (mx4ai)](https://github.com/mx4ai/qwen2.5)
- [Qwen2.5:1.5b en Ollama](https://ollama.com/library/qwen2.5:1.5b)
