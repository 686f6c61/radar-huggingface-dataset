# sandeep123/aops-dqo-a1-step1100

## Resumen

El modelo `sandeep123/aops-dqo-a1-step1100` es un ajuste fino del modelo base `Qwen/Qwen2.5-Math-1.5B` realizado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). Ha sido desarrollado por el usuario sandeep123 como parte de un estudio sobre objetivos de diversidad en el entrenamiento de razonamiento matemático, específicamente aplicando la técnica DQO (Diversity-driven Quality Optimization) con un coeficiente alpha=1.0 sobre el conjunto de datos ScienceQA. El checkpoint seleccionado corresponde al paso 1100 de entrenamiento, elegido por su mejor rendimiento en pass@1 sobre la partición de validación.

Este modelo sirve como baseline experimental para investigar cómo la incorporación de un término de diversidad (basado en el log-determinante de la matriz de Gram) afecta a la calidad del razonamiento en tareas de opción múltiple con contenido científico. A diferencia de otros ajustes que aplican plantillas de chat, este modelo fue entrenado con texto plano sin plantilla, lo que exige un tratamiento específico en inferencia para evitar una caída significativa en el rendimiento. Con 1.777 millones de parámetros, es un modelo compacto orientado a investigación, no a despliegue en producción.

La relevancia actual radica en la creciente atención a los métodos de diversidad en RL para mejorar la exploración y la robustez de los modelos de razonamiento, un área activa en la comunidad de IA open source. Su publicación permite reproducir y comparar resultados dentro de la familia de modelos entrenados con GRPO y objetivos auxiliares de diversidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la documentacion; el ejemplo de inferencia usa max_model_len=1536 |
| Tipos de cuantizacion | No especificados (el repositorio contiene pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5-Math soporta principalmente ingles y chino, pero no se indica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura decoder-only de Qwen2.5-Math-1.5B, un transformer de 1.500 millones de parámetros con atención causal y diseño estándar de Qwen. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política que agrupa múltiples rollouts por prompt para calcular ventajas relativas. Sobre esta base, se añadió un término de diversidad DQO con alpha=1.0, que introduce una penalización basada en el log-determinante de la matriz L+I, estimada mediante el método leave-one-out. El embedding de diversidad (phi) se construye a partir de los estados ocultos de la política de referencia, en lugar del codificador de oraciones preentrenado propuesto en el paper original, con el fin de aislar el efecto del objetivo de diversidad.

Los hiperparámetros del entrenamiento son: 25 épocas (1250 pasos), batch de 128 prompts con 6 rollouts cada uno, learning rate constante de 1e-6, coeficiente KL de 0.01 (incluido en la recompensa), recompensa de formato de 0.03 constante, y una longitud máxima de 512 tokens para el prompt y 1024 para la respuesta. Se empleó temperatura de rollout 1.0, entropy_coeff=0.0 y clip de 0.2/0.2. El conjunto de datos es ScienceQA en su variante `scienceqa_boxfix`. Es importante destacar que el entrenamiento se realizó con texto crudo sin plantilla de chat (`apply_chat_template=False`), por lo que aplicar la plantilla de Qwen2.5-Math en inferencia provoca un desajuste que reduce el pass@1 en aproximadamente 19 puntos en tareas hermanas.

## Capacidades

- Razonamiento matemático y científico de opción múltiple: el modelo responde a preguntas de ciencia con formato de elección A-E, extrayendo la respuesta del contenido de `\boxed{}`.
- Generación de texto con formato estructurado: produce respuestas que incluyen una caja final con la letra de la opción correcta.
- Evaluación multi-rollout: el modelo está diseñado para ser muestreado con K=6 rollouts a temperatura 1.0, permitiendo calcular métricas pass@k.
- No se documentan capacidades de tool calling, function calling, ni uso como agente.
- No se indica soporte para visión, audio u otras modalidades.
- El modelo es monolingüe en la práctica (inglés) aunque no se especifica oficialmente; el conjunto ScienceQA está en inglés.

## Casos de uso

- Investigación en aprendizaje por refuerzo con objetivos de diversidad: el modelo sirve como baseline para comparar estrategias de exploración en RL, especialmente en tareas de razonamiento científico.
- Estudio del impacto de la diversidad en la calidad de respuestas: permite analizar cómo el término DQO afecta al equilibrio entre exploración y explotación en el espacio de respuestas.
- Reproducción de experimentos académicos: investigadores pueden replicar los resultados publicados y comparar con otros checkpoints de la misma serie (por ejemplo, el paso 1000 o los checkpoints óptimos para pass@6).
- Evaluación de metodologías de extracción de respuestas: el formato de respuesta con `\boxed{}` facilita el estudio de técnicas de parsing y evaluación automática.
- Benchmark de modelos pequeños de razonamiento: con 1.5B de parámetros, puede utilizarse como referencia para medir la escalabilidad de métodos de RL en modelos compactos.
- Análisis de robustez ante cambios en el prompt: dado que no usa plantilla de chat, permite estudiar la sensibilidad del modelo a la forma de presentación de las entradas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles provienen de la partición de validación del propio modelo, que consta de 256 prompts held-out con K=6 rollouts a temperatura 1.0 y semilla 42. Los resultados se presentan en la siguiente tabla:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2305 |
| pass@6 | 0.4062 |

No se han publicado comparativas con otros modelos en la información disponible. La model card advierte de que aplicar el chat template de Qwen2.5-Math en inferencia reduce el pass@1 en aproximadamente 19 puntos en una tarea relacionada, por lo que estos valores solo son válidos si se usa texto crudo.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. A partir del tamaño del modelo (1.777 millones de parámetros) y el ejemplo de inferencia con vLLM usando dtype bfloat16, se estima:

- VRAM necesaria para inferencia: aproximadamente 3.5 GB para los pesos en bf16, más memoria para activaciones y KV cache. Con `max_model_len=1536` y batch pequeño, una GPU con 4-6 GB puede ser suficiente.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; también GPUs de centro de datos como A10 o L4.
- El modelo cabe en GPUs de consumo habituales, siempre que se gestione adecuadamente la memoria.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (requiere conversión) o TGI. El ejemplo oficial usa vLLM con `dtype="bfloat16"` y `max_model_len=1536`.
- Latencia y throughput: no se documentan; al ser un modelo de 1.5B, en una GPU moderna se esperan latencias del orden de decenas de milisegundos por token, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados entre este modelo y otras alternativas. El propio autor publica un modelo hermano, `sandeep123/sqa-dqo-a1-step1000`, que corresponde a un checkpoint de la misma serie pero en un paso de entrenamiento diferente (paso 1000). No se ofrecen métricas de ese checkpoint en la información recopilada. Tampoco se comparan con el modelo base Qwen2.5-Math-1.5B ni con otros modelos de razonamiento de tamaño similar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No debe aplicarse la plantilla de chat de Qwen2.5-Math durante la inferencia; hacerlo provoca una caída de aproximadamente 19 puntos en pass@1 en tareas relacionadas. El modelo debe recibir el prompt como texto crudo.
- Es un modelo de investigación, no preparado para uso en producción: su rendimiento absoluto es bajo (pass@1 de 0.23) y está especializado en el formato de ScienceQA.
- Puede presentar alucinaciones o respuestas sin una caja `\boxed{}` extraíble; en esos casos se puntúa como incorrecto, lo que puede subestimar su capacidad real.
- El conjunto de datos ScienceQA está en inglés y contiene principalmente contenido científico de nivel escolar; el modelo no ha sido evaluado en otros idiomas ni dominios.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5-Math, deben respetarse también los términos de la licencia del modelo base (Apache-2.0 también, según la información disponible).
- La fecha de creación y actualización (2026-08-31) es inusual y podría indicar un error en los metadatos; no se ha verificado su validez.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto reciente o poco difundido; la reproducibilidad de los resultados no está garantizada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-dqo-a1-step1100
- Modelo hermano (paso 1000): https://huggingface.co/sandeep123/sqa-dqo-a1-step1000
- Repositorio GitHub de AoPS (referencia al paper): https://github.com/DSL-Lab/aops
