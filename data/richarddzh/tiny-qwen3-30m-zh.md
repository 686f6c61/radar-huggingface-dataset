# richarddzh/tiny-qwen3-30m-zh

## Resumen

Tiny Qwen3 30M Chinese es un modelo de lenguaje causal (causal LM) de 29,57 millones de parámetros, entrenado desde cero sobre el corpus chino `richarddzh/chinese-small-lm-corpus`. Lo desarrolla Richard Dong (usuario `richarddzh`) con fines exclusivamente educativos: sirve para experimentar con el entrenamiento de tokenizers, el pretraining de modelos de lenguaje, el guardado de checkpoints y la generación de texto chino dentro del ecosistema de Hugging Face. Es un modelo base, no ajustado para instrucciones ni para chat.

El modelo sigue la arquitectura Qwen3 (`Qwen3ForCausalLM`), con 9 capas transformer, atención con GQA (2 cabezas clave/valor), embeddings atados y una ventana de contexto máxima de 1.024 tokens (aunque el pretraining se realizó con secuencias de 512 tokens). Su pequeño tamaño lo hace ejecutable en CPU y en cualquier GPU de consumo, lo que lo convierte en una herramienta didáctica accesible para quienes quieran entender el ciclo completo de entrenamiento de un LLM sin necesidad de recursos costosos.

La relevancia de este modelo no está en su rendimiento, sino en su valor pedagógico: documenta paso a paso el proceso de preparación de datos, entrenamiento del tokenizer, configuración del modelo, pretraining con el `Trainer` de Hugging Face y evaluación, todo reproducible desde un notebook público. Es un ejemplo práctico de cómo construir un modelo de lenguaje desde cero en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder con GQA) |
| Parametros totales | 29.567.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (entrenado con 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal con arquitectura Qwen3. Tiene 9 capas, tamaño oculto de 512, 8 cabezas de atención, 2 cabezas clave/valor (GQA) con dimensión de cabeza de 64, y un MLP intermedio de 1.408 unidades. Usa embeddings atados entre entrada y salida, RoPE con theta de 1.000.000 y un vocabulario BPE byte-level de 8.192 tokens entrenado desde cero sobre hasta 100.000 documentos truncados a 2.000 caracteres cada uno, con normalización NFC y frecuencia mínima de 2.

El entrenamiento se realizó desde inicialización aleatoria con el objetivo estándar de modelado de lenguaje causal (next-token prediction). Se usó el `Trainer` de Hugging Face, con datasets empaquetados iterables, precisión mixta (BF16 en CUDA, FP16 o FP32 en CPU), acumulación de gradientes y reanudación desde checkpoints. La configuración incluye 30.000 pasos de optimización, batch efectivo de 64 secuencias (32.768 tokens por paso), learning rate 5e-4 con scheduler coseno y 200 pasos de warmup, weight decay 0,1, gradiente clipping 1,0 y evaluación cada 250 pasos. El dataset se barajó con semilla 42, reservando 10.000 documentos para validación y empaquetando secuencias fijas de 512 tokens sin padding.

## Capacidades

- Generación de texto causal en chino: completa secuencias de texto a partir de un prompt, como se muestra en el ejemplo de uso del README.
- Modelo base: no sigue instrucciones ni mantiene diálogos multi-turno; solo predice el siguiente token.
- Tokenizer propio: BPE byte-level con vocabulario de 8.192 tokens, especializado en chino.
- Reproducibilidad: todo el pipeline (preparación de datos, entrenamiento del tokenizer, pretraining, evaluación y subida a Hugging Face) está documentado en un notebook público.
- Compatibilidad con transformers: carga directa con `AutoModelForCausalLM` y `AutoTokenizer`.
- No dispone de tool calling, ni capacidades de agente, ni visión, ni audio, ni modo de razonamiento explícito.

## Casos de uso

- Aprendizaje de NLP y LLMs: el modelo permite a estudiantes y desarrolladores comprender el ciclo completo de entrenamiento de un modelo de lenguaje desde cero, incluyendo tokenizer, pretraining y evaluación, sin necesidad de GPU costosas.
- Experimentación con tokenizers chinos: al entrenar su propio BPE byte-level, sirve para estudiar cómo afecta el vocabulario y la segmentación a la generación de texto en chino.
- Prototipado rápido de pipelines de generación de texto: su tamaño mínimo permite probar flujos de `transformers` (carga, generación, guardado) en entornos con recursos limitados.
- Fine-tuning educativo: se puede ajustar con datasets pequeños para explorar técnicas como LoRA o fine-tuning completo, dado que cabe en una sola GPU de consumo.
- Investigación sobre modelos pequeños: útil para comparar el rendimiento de arquitecturas compactas en tareas de generación de texto chino, aunque sin expectativas de calidad alta.
- Pruebas de integración en CI/CD: al ser ligero y rápido de cargar, puede servir como modelo de humo para verificar que pipelines de inferencia (vLLM, TGI, etc.) funcionan correctamente antes de usar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o perplexity. Dado su tamaño y propósito educativo, no se espera que compita con modelos comerciales o de mayor escala.

## Requisitos de hardware

- VRAM estimada: aproximadamente 60 MB en BF16 (29,57M parámetros × 2 bytes) y unos 120 MB en FP32. Con overhead de inferencia, cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 1060, RTX 2060, RTX 4090, etc.) o incluso CPU (inferencia en FP32 sin problemas).
- Ejecución en CPU: totalmente viable para generación de texto corto; la latencia será de decenas de milisegundos por token en hardware moderno.
- Opciones de despliegue: `transformers` (inferencia directa), `vLLM` (si se convierte al formato adecuado), `llama.cpp` (requiere conversión a GGUF, no proporcionado), `Ollama` (no disponible oficialmente). Dado el tamaño, también puede ejecutarse en entornos serverless o notebooks.
- Latencia y throughput: no se han publicado mediciones oficiales. Con 29,57M parámetros, se puede estimar una latencia de inferencia muy baja, del orden de 1-5 ms por token en GPU y 10-50 ms en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar. No hay datos de benchmarks ni de rendimiento publicados. Como referencia cualitativa, el modelo es comparable en tamaño a otros "tiny language models" como TinyLlama (1,1B parámetros, mucho mayor) o modelos de 30M parámetros como los de la serie `TinyStories`, pero no se dispone de datos objetivos para una tabla comparativa.

## Limitaciones y advertencias

- Es un modelo base experimental de 29,57M parámetros: su conocimiento factual, capacidad de razonamiento, seguimiento de instrucciones y manejo de contexto son muy limitados.
- La generación puede ser repetitiva, inconsistente o factualmente incorrecta, y puede reflejar sesgos y artefactos del corpus de entrenamiento.
- La ventana de contexto es corta (1.024 tokens) y el entrenamiento se realizó con secuencias de 512 tokens, lo que limita su uso en tareas que requieran contexto largo.
- Solo soporta chino; no hay evidencia de capacidades multilingües.
- La licencia no está especificada: no se puede determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- No es un modelo de chat ni está alineado con instrucciones; no debe usarse en aplicaciones que requieran respuestas seguras o fiables.
- No es adecuado para decisiones de alto riesgo ni para producción real; su propósito es exclusivamente educativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richarddzh/tiny-qwen3-30m-zh
- Dataset de entrenamiento: https://huggingface.co/datasets/richarddzh/chinese-small-lm-corpus
- Notebook de entrenamiento: https://github.com/richarddzh/airbnb_mle/blob/main/colab/tinylmzh.ipynb
- Perfil del autor en Hugging Face: https://huggingface.co/richarddzh/models
- Repositorio GitHub del autor: https://github.com/richarddzh/airbnb_mle
