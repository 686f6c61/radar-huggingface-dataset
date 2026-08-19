# rjz123/colar-selftrain-r1-prosqa

## Resumen

El modelo `rjz123/colar-selftrain-r1-prosqa` es un checkpoint de investigación desarrollado por el usuario rjz123, que aplica el método de razonamiento latente CoLaR (Latent Reasoning) sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El objetivo es explorar el autoentrenamiento (selftrain) de capacidades de razonamiento en modelos pequeños mediante un scaffold personalizado que combina el modelo base con una expansión del token `[PAD]`, LoRA de rango 128 en las proyecciones Q y V, y un MLP `LatentPolicy` que comprime el razonamiento en un espacio latente.

El repositorio contiene dos ficheros de checkpoint en formato PyTorch-Lightning (`cot_baseline.ckpt` y `sft_adaptiveLRM.ckpt`), que no son directamente cargables con `AutoModel` y requieren un entorno de ejecución específico con variables `COLAR_*`. El modelo está etiquetado como investigación y no presenta licencia, idiomas ni métricas de rendimiento publicadas. Su relevancia radica en ser una posible fuente de warm-start para el proyecto `colar_r1_logic`, aunque su estado es experimental y no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-R1-Distill-Qwen-1.5B (Transformer decoder) + LoRA r128 en Q/V + MLP LatentPolicy (scaffold CoLaR) |
| Parametros totales | no disponible (el checkpoint ocupa 0.2 GB, pero no se indica el número de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32K, pero no confirmado) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa de PyTorch) |
| Idiomas soportados | no disponibles (el modelo base soporta principalmente inglés y chino, pero no se especifica para este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con claves bajo `state_dict`, no compatible con safetensors estándar |

## Arquitectura y entrenamiento

El modelo se construye sobre DeepSeek-R1-Distill-Qwen-1.5B, un Transformer decoder destilado del modelo R1 original, conocido por su razonamiento mediante cadenas de pensamiento (CoT). El scaffold CoLaR añade una expansión del token `[PAD]` para reservar espacio a un "pensamiento latente" comprimido, junto con adaptadores LoRA de rango 128 en las proyecciones de query y value, y un MLP `LatentPolicy` que genera y procesa representaciones latentes de hasta 64 tokens (según la variable `COLAR_MAXLAT=64`). El factor de compresión es 5 (`COLAR_COMPRESS=5`), lo que sugiere que el razonamiento se comprime en un espacio latente de menor dimensión.

El entrenamiento se describe como "selftrain" (autoentrenamiento) sobre el dataset ProsQA, con dos checkpoints: uno de línea base de CoT y otro de ajuste fino adaptativo con LRM (Latent Reasoning Model). No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO. El método CoLaR es una técnica de investigación para reducir el coste de razonamiento latente, pero no se proporcionan detalles adicionales sobre la dinámica de entrenamiento.

## Capacidades

- Razonamiento latente: el modelo está diseñado para generar y procesar pensamientos latentes comprimidos, una alternativa a las cadenas de pensamiento explícitas.
- Generación de texto: hereda las capacidades del modelo base DeepSeek-R1-Distill-Qwen-1.5B, que incluye generación de texto general y razonamiento matemático básico.
- Ajuste con LoRA: los adaptadores de bajo rango permiten un fine-tuning eficiente en parámetros, aunque el checkpoint no es directamente utilizable con la API estándar de Hugging Face.
- No se confirma soporte de tool calling, agentes, visión, audio ni funcionalidades multilingües específicas para este checkpoint.

## Casos de uso

- Investigación en razonamiento latente: el checkpoint sirve como base experimental para estudiar cómo el autoentrenamiento con CoLaR afecta a la capacidad de razonamiento de modelos pequeños, comparando con líneas base de CoT.
- Warm-start para otros proyectos: el autor indica que este modelo es la fuente de warm-start para `colar_r1_logic`, por lo que puede utilizarse como punto de partida para entrenamientos posteriores.
- Análisis de compresión de razonamiento: permite investigar cómo el factor de compresión 5 y el límite de 64 tokens latentes afectan a la calidad de las respuestas en tareas de QA (ProsQA).
- Evaluación de adaptadores LoRA: los checkpoints permiten estudiar el comportamiento de LoRA r128 en las proyecciones Q/V cuando se combina con un MLP de política latente.
- Reproducción de experimentos: dado que se proporcionan dos checkpoints (baseline y adaptativo), se puede reproducir la comparativa entre CoT estándar y razonamiento latente adaptativo.
- Desarrollo de scaffolds personalizados: el código de carga (aunque no incluido en el repo) puede servir como referencia para integrar CoLaR en otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de 1.5B con LoRA, la inferencia podría requerir entre 4 y 6 GB de VRAM en FP16, dependiendo de la longitud de contexto y del scaffold CoLaR. Sin embargo, no se dispone de mediciones reales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, RTX 4060) podría ejecutar el modelo en FP16. Para entrenamiento o fine-tuning, se recomienda al menos 12 GB (RTX 3060 12GB, RTX 4070, etc.).
- Compatibilidad con consumer GPU: sí, el tamaño del modelo base lo hace ejecutable en GPUs de consumo, aunque el scaffold CoLaR añade un MLP adicional que incrementa ligeramente los requisitos.
- Opciones de despliegue: no es compatible con vLLM, Ollama o TGI directamente, ya que el checkpoint no está en formato estándar. Requiere un script personalizado que cargue el modelo base por separado y aplique el state_dict del checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base DeepSeek-R1-Distill-Qwen-1.5B es el punto de referencia natural, pero no hay datos de rendimiento de este checkpoint frente a él. Otros modelos de razonamiento de tamaño similar (como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct) podrían servir como comparación, pero no se han evaluado en este contexto. Se recomienda consultar los benchmarks del modelo base en su ficha oficial.

## Limitaciones y advertencias

- Checkpoint experimental: no es un modelo listo para producción; está etiquetado como investigación y carece de documentación de uso estable.
- Formato no estándar: los pesos están en checkpoints de PyTorch-Lightning y requieren variables de entorno específicas (`TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`) y un scaffold personalizado para cargarse. No se puede usar con `AutoModel` ni con la mayoría de frameworks de inferencia.
- Licencia no disponible: no se indica ninguna licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no especificados: aunque el modelo base soporta inglés y chino, no se confirma que este checkpoint mantenga esas capacidades tras el entrenamiento con ProsQA.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad objetivamente.
- Riesgo de alucinación: al ser un modelo pequeño (1.5B) y entrenado con un método poco convencional, es probable que presente alucinaciones y errores de razonamiento en tareas complejas.
- Dependencia del scaffold: el modelo solo funciona dentro del framework CoLaR; extraer los pesos sin el código asociado no es trivial.

## Enlaces

- [HuggingFace - rjz123/colar-selftrain-r1-prosqa](https://huggingface.co/rjz123/colar-selftrain-r1-prosqa)
- [Modelo base: deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Repositorio DeepSeek-R1 (GitHub)](https://github.com/deepseek-ai/DeepSeek-R1)
