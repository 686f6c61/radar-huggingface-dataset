# nyu-visionx/Cambrian-P-7B-Mix-3R

## Resumen

Cambrian-P-7B-Mix-3R es un modelo multimodal de razonamiento de video desarrollado por VISIONx @ NYU, el grupo de investigación dirigido por el profesor Yann LeCun. Se trata de un modelo especializado en comprensión espacial de video, anclado en poses humanas y de objetos. El modelo combina un LLM base Qwen2.5-7B con un codificador visual SigLIP2-SO400m, y se entrena con datos anotados con poses (Cambrian-P-Data) para tareas como razonamiento de dirección relativa, conteo de objetos y predicción de movimiento.

Con 8.251 millones de parámetros, Cambrian-P-7B está diseñado para superar las limitaciones de los modelos de video tradicionales que ignoran la estructura espacial explícita. Según los resultados publicados, alcanza un 73,7% de precisión promedio en el benchmark VSI-Bench, superando en 4,5 puntos a su contraparte sin poses (Cambrian-S-7B). Es un modelo de investigación abierta, con código y checkpoints disponibles en GitHub, aunque la licencia no está especificada en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM multimodal (llava_qwen) con vision encoder SigLIP2-SO400m y LLM base Qwen2.5-7B |
| Parametros totales | 8.251.062.834 (8,25B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el LLM base Qwen2.5-7B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, formato FP16/BF16 presumiblemente) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cambrian-P-7B combina un codificador visual SigLIP2-SO400m (que procesa frames de video) con un LLM Qwen2.5-7B que actúa como base para la generación de texto. La arquitectura sigue el esquema LLaVA-Qwen, donde las características visuales se proyectan al espacio del lenguaje y se concatenan con los embeddings de texto. La innovación clave es el uso de anotaciones de pose (pose-grounding) durante el entrenamiento, que inyectan información espacial explícita sobre la posición y orientación de los objetos y agentes en la escena.

El entrenamiento se realizó con un dataset específico llamado Cambrian-P-Data, que incluye videos con anotaciones de pose. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO. La arquitectura es un transformer estándar sin mecanismos MoE ni atención lineal. La innovación principal reside en la integración de señales de pose como entrada adicional al modelo, lo que permite un razonamiento espacial más preciso que los modelos que solo usan píxeles.

## Capacidades

- Razonamiento espacial en video: comprende relaciones de dirección relativa (izquierda, derecha, arriba, abajo), distancia y orientación entre objetos.
- Conteo de objetos: estima el número de instancias de una clase en una escena, incluso con solapamientos o oclusiones.
- Predicción de movimiento y trayectorias: basándose en la pose y el contexto, puede anticipar la trayectoria de agentes móviles.
- Comprensión temporal: procesa secuencias de video y responde a preguntas sobre eventos que ocurren a lo largo del tiempo.
- Generación de texto en lenguaje natural: produce respuestas descriptivas y explicaciones sobre el contenido visual.
- Multimodalidad: acepta entradas de imagen y video (aunque el modelo está entrenado principalmente para video con anotaciones de pose).
- Tool calling: no disponible (no se menciona soporte de function calling).

## Casos de uso

- Análisis de vídeo en robótica: el modelo puede guiar a un robot en entornos dinámicos, interpretando poses de objetos y agentes para planificar trayectorias o evitar obstáculos. Su razonamiento de dirección relativa permite decisiones de navegación en tiempo real.
- Vigilancia y seguridad inteligente: procesar feeds de cámaras para detectar comportamientos anómalos, contando personas u objetos y analizando movimientos relativos entre individuos, útil en espacios públicos o industriales.
- Revisión de imágenes médicas: aunque no es su foco principal, el modelo puede aplicarse a la interpretación de secuencias de imágenes médicas (como ecografías en movimiento) para asistir en diagnóstico de movimientos anómalos.
- Análisis deportivo: descomponer la posición de jugadores y balón en vídeos de partidos, generando informes de táctica o estadísticas de movimiento (distancia recorrida, velocidad media).
- Conducción autónoma y ADAS: procesar secuencias de vídeo de cámaras de vehículos para estimar posiciones relativas de otros vehículos y peatones, mejorando la detección de intersecciones y la planificación de maniobras.
- Generación de subtítulos y descripciones de vídeo: crear descripciones automáticas de contenido visual para accesibilidad o indexación de archivos de vídeo, con información espacial detallada (p. ej., "el coche azul está a la izquierda del camión").

## Benchmarks y rendimiento

Según la información publicada en el repositorio de GitHub, el modelo fue evaluado en VSI-Bench (Video Spatial Understanding Benchmark). Los resultados reportados son:

| Modelo | Precisión promedio en VSI-Bench |
|---|---|
| Cambrian-P-7B (Mix-3R) | 73,7% |
| Cambrian-S-7B (sin pose) | 69,2% (diferencia de +4,5 puntos) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - En fp32 (pesos originales): ~16,5 GB (8,25B × 4 bytes) + overhead de activaciones, por lo que se recomienda al menos 20 GB.
  - En fp16/bf16: ~16,5 GB, similar al fp32.
  - En int8 (cuantización dinámica): ~8,5 GB.
  - En int4 (cuantización GPTQ/AWQ): ~4,5 GB.
- GPU recomendadas:
  - Para uso en fp16: NVIDIA A100 (40 GB), RTX A6000 (48 GB), o RTX 4090 (24 GB) con optimizaciones de memoria.
  - Para uso en int8/int4: RTX 3090 (24 GB) o RTX 4070 (12 GB) pueden ser suficientes.
  - No cabe en GPUs de consumo con menos de 8 GB de VRAM, salvo con cuantización extrema y secuencias cortas.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión), TGI (Hugging Face Text Generation Inference). El modelo usa safetensors, por lo que puede cargarse con Transformers de Hugging Face.
- Latencia y throughput: no disponible, pero con una RTX 4090 y cuantización int4 se puede esperar alrededor de 30-50 tokens por segundo para generación de texto, dependiendo de la longitud de la entrada visual.

## Comparativa con modelos similares

- **Cambrian-S-7B** (sin poses): mismo tamaño y arquitectura base, pero sin anotaciones de pose. Cambrian-P-7B supera a Cambrian-S-7B en un +4,5% en VSI-Bench, lo que muestra la ventaja del uso de pose.
- **Video-LLaVA-7B**: un modelo de video multimodal de 7B parámetros basado en LLaVA, pero no usa pose ni se especializa en razonamiento espacial. No hay comparaciones publicadas con Cambrian-P.
- **Qwen2.5-VL-7B**: modelo de visión-lenguaje de la familia Qwen, con 8,3B parámetros y contexto largo. No está especializado en video espacial ni en pose, pero tiene buen rendimiento general en visión. No hay comparaciones publicadas con Cambrian-P.

No se dispone de datos de benchmarks comparativos adicionales más allá de VSI-Bench.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha publicado información sobre sesgos del modelo. Al ser entrenado con datos de video anotados, puede heredar sesgos de los datasets de pose utilizados, que no se han especificado.
- **Riesgo de alucinación**: como cualquier LLM multimodal, puede generar descripciones incorrectas de objetos o relaciones cuando la información visual es ambigua o está fuera de la distribución de entrenamiento.
- **Limitaciones de contexto**: el contexto de entrada no está documentado para este modelo específico. Aunque el LLM base (Qwen2.5-7B) soporta 32K tokens, la ventana efectiva puede ser menor al incluir tokens visuales.
- **Idiomas**: no se ha especificado los idiomas soportados. La mayoría de los modelos de Qwen son multilingües, pero no hay confirmación.
- **Restricciones de licencia**: la licencia no está disponible en la ficha. El repositorio de GitHub del proyecto Cambrian-P (cambrian-mllm/cambrian-p) no especifica una licencia de uso comercial explícita. Se recomienda contactar con los autores antes de usar en producción.
- **Caveat de producción**: el modelo está en fase de investigación, con solo 8 descargas y 1 like. No se han reportado pruebas de robustez en entornos reales ni se ha validado su uso en aplicaciones críticas.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/nyu-visionx/Cambrian-P-7B-Mix-3R)
- [GitHub del proyecto Cambrian-P](https://github.com/cambrian-mllm/cambrian-p)
- [Página del proyecto Cambrian](https://cambrian-mllm.github.io/)
- [Organización VISIONx @ NYU en HuggingFace](https://huggingface.co/nyu-visionx)
