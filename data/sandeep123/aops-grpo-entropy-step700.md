# sandeep123/aops-grpo-entropy-step700

## Resumen

El modelo `sandeep123/aops-grpo-entropy-step700` es un ajuste fino del modelo base Qwen/Qwen2.5-Math-1.5B, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. El autor, sandeep123, lo publica como un baseline de referencia dentro de un estudio comparativo de variantes de GRPO, incorporando un término de entropía en la función de pérdida para regularizar la política. Este checkpoint concreto corresponde al paso 700 de entrenamiento y fue seleccionado como el mejor en validación según la métrica pass@1.

El modelo está pensado para responder preguntas de opción múltiple de ciencia con razonamiento explícito, y se caracteriza por haber sido entrenado sobre texto sin plantilla de chat (raw prompt text), lo que implica que en inferencia no se debe aplicar el chat template de Qwen, ya que ello degrada significativamente el rendimiento. Con 1.777 millones de parámetros, es un modelo ligero, adecuado para entornos con recursos limitados y para servir como punto de comparación en investigaciones sobre métodos de RL.

La relevancia actual de este modelo radica en su papel como baseline reproducible en experimentos de GRPO, documentando de forma transparente configuraciones, métricas y advertencias de uso. Su publicación contribuye a la democratización de técnicas de aprendizaje por refuerzo aplicadas a modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de inferencia usa max_model_len=1536; el modelo base soporta hasta 32k) |
| Tipos de cuantizacion | No disponible (los pesos se publican en bfloat16) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Math soporta ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder de Qwen2.5-Math-1.5B, una red de 1.500 millones de parámetros con atención causal y mecanismos estándar de transformers. Sobre esta base, se aplicó un entrenamiento de aprendizaje por refuerzo con GRPO, que elimina la necesidad de un crítico separado y utiliza un grupo de respuestas muestreadas para estimar ventajas relativas. La variante entrenada incorpora un bonus de entropía con coeficiente 0.001, aplicado a los tokens de respuesta, con el objetivo de mantener la diversidad de la política.

El entrenamiento se realizó sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con un total de 1250 pasos distribuidos en 25 épocas, un batch de 128 prompts y K=6 rollouts por prompt. Se usó una tasa de aprendizaje constante de 1e-6, un coeficiente KL intra-recompensa de 0.01, límites de 512 tokens para el prompt y 1024 para la respuesta, y una recompensa de formato fija de 0.03. La temperatura de muestreo durante el entrenamiento fue 1.0, con clip de 0.2/0.2. Este checkpoint concreto corresponde al paso 700, elegido como el mejor en pass@1 de validación.

## Capacidades

- Razonamiento matemático y científico: responde preguntas de opción múltiple del dominio científico, generando una justificación y una respuesta final en formato `\boxed{}`.
- Generación de texto con formato estructurado: produce respuestas que incluyen un razonamiento paso a paso y una respuesta final extraíble.
- Multilingüe limitado: al estar basado en Qwen2.5-Math, puede procesar instrucciones en inglés y chino, aunque el entrenamiento se realizó sobre datos en inglés (ScienceQA).
- Sin soporte de tool calling ni funciones externas: el modelo no ha sido entrenado para interactuar con APIs o herramientas.
- Sin modo agente: no está diseñado para planificación multi-paso con interacción con el entorno, aunque puede generar cadenas de razonamiento internas.
- Sin capacidades multimodales: es un modelo de solo texto, no procesa imágenes ni audio.

## Casos de uso

- Evaluación de razonamiento en entornos educativos: el modelo puede utilizarse como generador de respuestas en plataformas de práctica de ciencias, produciendo explicaciones que ayuden a los estudiantes a comprender el proceso de resolución.
- Baseline en investigación de RL: sirve como punto de referencia para comparar variantes de GRPO, algoritmos de regularización o configuraciones de recompensa, gracias a su configuración documentada y reproducible.
- Generación de datos sintéticos de QA: puede emplearse para crear conjuntos de datos de preguntas-respuesta con razonamiento, útiles para entrenar otros modelos o para aumentar datos existentes.
- Análisis de robustez de decoding: al trabajar con temperatura 1.0 y muestreo múltiple, es adecuado para estudiar la diversidad de respuestas y la calibración de la confianza en modelos pequeños.
- Pruebas de integración en pipelines de inferencia: su pequeño tamaño permite probar rápidamente infraestructuras de despliegue (vLLM, TGI) sin altos costes de cómputo.
- Experimentos de adaptación a dominios específicos: puede servir como punto de partida para fine-tuning adicional en dominios científicos concretos, aunque se recomienda mantener el entrenamiento sin chat template.

## Benchmarks y rendimiento

El autor reporta métricas de validación sobre 256 prompts held-out de ScienceQA, con K=6 rollouts, temperatura 1.0 y seed 42. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| pass@1 (validacion) | 0.2344 |
| pass@6 (validacion) | 0.3867 |
| Paso de entrenamiento | 700 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 3.6 GB (1.78B parámetros × 2 bytes). Con secuencias de 1536 tokens y batch pequeño, la VRAM total necesaria puede rondar los 4-6 GB, dependiendo del motor de inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en bfloat16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para mayor velocidad, GPUs como RTX 4090 o A10 son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de consumo con 8 GB o más.
- Opciones de despliegue: vLLM (como en el ejemplo del autor), llama.cpp, Ollama, TGI, Hugging Face Transformers con carga manual.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Como referencia general, se puede comparar con el modelo base Qwen2.5-Math-1.5B y con otros ajustes finos de razonamiento de tamaño similar (por ejemplo, DeepSeek-R1-Distill-Qwen-1.5B), pero no hay datos de rendimiento para estos en el contexto de ScienceQA.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 32k | Apache 2.0 | Modelo base sin entrenamiento RL |
| aops-grpo-entropy-step700 (este) | 1.78B | No disponible | Apache 2.0 | Fine-tune con GRPO + entropy bonus |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32k | MIT | Destilado de R1, razonamiento general |

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano sin plantilla de chat. Aplicar el chat template de Qwen en inferencia provoca una caída de aproximadamente 19 puntos de pass@1 en una tarea hermana. Es imprescindible usar el texto crudo del prompt directamente.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado en un dominio específico, puede generar respuestas incorrectas o inventar justificaciones plausibles. La tasa de error, medida por pass@1 de 0.2344, indica que más del 75% de las respuestas individuales son incorrectas, aunque pass@6 mejora a 0.3867.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, el entrenamiento se limitó a 512 tokens de prompt y 1024 de respuesta, por lo que el rendimiento con contextos más largos puede degradarse. El ejemplo de inferencia usa max_model_len=1536.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no se ofrece garantía.
- Dependencia del método de extracción de respuestas: la métrica se basa en la presencia de un `\boxed{}` final; respuestas sin este formato se puntúan como incorrectas, lo que puede infravalorar la capacidad real del modelo.
- Reproducibilidad condicionada: el rendimiento reportado depende de la configuración exacta de decoding (temperatura 1.0, top_p 1.0, top_k -1) y de la semilla 42. Cambios en estos parámetros pueden alterar los resultados.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-entropy-step700
- Documentación de verl (GRPO): https://verl.readthedocs.io/en/latest/algo/grpo.html
- Guía sobre PPO y GRPO: https://yugeten.github.io/posts/2025/01/ppogrpo/
- Explicación ilustrada de GRPO: https://abderrahmanskiredj.github.io/the-illustrated-grpo/
