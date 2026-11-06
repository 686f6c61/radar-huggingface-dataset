# Aswath220/rope_gpt2_base10_allops_seed512_bs1024

## Resumen

`rope_gpt2_base10_allops_seed512_bs1024` es un modelo GPT-2 pequeño (6 capas, 6 cabezas, 768 dimensiones) entrenado desde cero por el usuario Aswath220 dentro del repositorio BitTokens. No es un modelo de lenguaje generalista: es un experimento de investigación centrado en una representación numérica concreta denominada Base10, que codifica los operandos como 22 dígitos decimales de x y de 1/x mediante one-hot encoding, con un `zero_pad` y una cabeza de clasificación por dígito. El modelo se entrena exclusivamente en las cuatro operaciones aritméticas básicas (suma, resta, multiplicación y división) con operandos enteros de 0 a 999.

La relevancia del modelo es acotada y de carácter metodológico: sirve para evaluar si una codificación decimal explícita de los números permite a un transformer pequeño aprender aritmética exacta con operandos de tres cifras, en lugar de depender de tokenización BPE estándar. El nombre del repositorio indica los hiperparámetros del entrenamiento: semilla 512 y batch de 1024. El repositorio ocupa 18,6 GB, lo que sugiere la presencia de múltiples snapshots intermedios (por época y por paso) además de los pesos finales.

No hay información pública sobre licencia, idiomas soportados ni pipeline de Hugging Face. El modelo no está pensado para uso en producción ni para tareas de lenguaje natural; su valor está en la reproducibilidad del experimento y en el análisis de la representación numérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 con RoPE |
| Parámetros totales | no disponible (6 capas, 6 cabezas, 768 dims; estimación aproximada de 40-50 M sin contar el módulo de embedding numérico) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32 o bf16) |
| Idiomas soportados | no disponible (el modelo opera sobre dígitos, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`, `meta.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 6 capas, 6 cabezas de atención y dimensión oculta de 768, con positional encoding rotatorio (RoPE) en lugar del embedding posicional aprendido del GPT-2 original. La innovación principal no está en el backbone sino en la capa de entrada y salida numérica: el módulo `base10_embedding.py` representa cada operando como 22 dígitos decimales de x y de 1/x en one-hot, con relleno de ceros (`zero_pad`) y una cabeza de cross-entropy que predice dígito a dígito. El modo de dígitos es `exact`, lo que implica que la evaluación se realiza sobre coincidencia exacta de la secuencia de dígitos de salida.

El entrenamiento se realizó desde cero sobre las cuatro operaciones aritméticas con operandos enteros de 0 a 999, con batch de 1024, 10 épocas, optimizador Muon con learning rate 0,02 y semilla 512. No se menciona en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (poco probables en un experimento de esta naturaleza). El repositorio incluye snapshots por época y por paso, así como `run/log.jsonl` y `run/test_results.json` con los resultados de test, lo que facilita el análisis de curvas de aprendizaje.

## Capacidades

- Aritmética exacta de suma, resta, multiplicación y división con operandos enteros de 0 a 999.
- Predicción dígito a dígito mediante cabeza de clasificación decimal (22 dígitos por operando).
- Representación numérica basada en x y 1/x, lo que en teoría facilita operaciones inversas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso más allá de la operación aritmética directa.
- No tiene capacidades multilingües: opera sobre tokens de dígitos, no sobre texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio de representaciones numéricas en transformers: el modelo permite comparar empíricamente una codificación decimal one-hot frente a tokenización BPE estándar en tareas aritméticas, usando los snapshots por época para trazar curvas de generalización.
- Reproducción de experimentos de aritmética neuronal: al estar fijados semilla (512), batch (1024) e hiperparámetros (Muon lr 0,02), sirve como baseline reproducible para trabajos sobre aprendizaje de operaciones exactas.
- Análisis de la generalización fuera de distribución: con operandos de 0 a 999, se puede evaluar si el modelo extrapola a rangos mayores o si falla sistemáticamente en los límites del dominio de entrenamiento.
- Docencia e investigación en interpretabilidad: el tamaño reducido (6 capas, 768 dims) y la estructura discreta de la salida facilitan el análisis de circuitos internos y de la atención sobre posiciones de dígitos.
- Validación de pipelines de entrenamiento propios: el repositorio incluye configuración de entrenamiento, log y resultados de test, lo que permite reutilizar el setup de BitTokens para otros experimentos con embeddings numéricos.
- Generación de datos sintéticos verificables: las salidas del modelo pueden usarse como generador de pares operación-resultado para construir datasets de aritmética con verificación exacta, descartando las predicciones incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo `run/test_results.json` con los resultados de test del propio autor, pero su contenido no se ha proporcionado en la información disponible, por lo que no se pueden citar cifras de precisión exacta en suma, resta, multiplicación o división.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 6 capas y 768 dims, los pesos del backbone rondan las decenas de millones de parámetros, por lo que la inferencia cabría holgadamente en cualquier GPU consumer con al menos 4-8 GB de VRAM, dependiendo del tamaño del módulo de embedding numérico.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el modelo es lo bastante pequeño como para que la GPU no sea el cuello de botella.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque el dato exacto no está confirmado.
- Opciones de despliegue: al ser un GPT-2 con módulo de embedding numérico personalizado, requiere código del repositorio BitTokens (`networks/rope_gpt2.py`, `base10_embedding.py`); no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers pequeños entrenados desde cero para aritmética exacta con codificación decimal), ni se dispone de datos de rendimiento de este modelo para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Dominio restringido: solo maneja las cuatro operaciones básicas con enteros de 0 a 999; fuera de ese rango el comportamiento es desconocido.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no mantiene conversaciones.
- Licencia no especificada: la ausencia de licencia impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Riesgo de alucinación numérica: como cualquier modelo neuronal, puede producir dígitos plausibles pero incorrectos; la verificación exacta es obligatoria en cualquier aplicación.
- Dependencia de código externo: la arquitectura requiere los módulos del repositorio BitTokens para cargar correctamente los pesos (`transformer.*`, `lm_head.weight`, `num_embedding_module.num_head.*`).
- Sin validación externa: con 0 descargas y 0 likes, no hay evidencia de uso independiente ni de reproducibilidad por terceros.
- Tamaño del repositorio elevado (18,6 GB) por la acumulación de snapshots, lo que complica su descarga y almacenamiento en entornos con recursos limitados.
- Fecha de creación futura en los metadatos (2026-10-23): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- [Hugging Face: Aswath220/rope_gpt2_base10_allops_seed512_bs1024](https://huggingface.co/Aswath220/rope_gpt2_base10_allops_seed512_bs1024)
- Repositorio BitTokens, archivo `networks/rope_gpt2.py` en el commit `2a84bb1` (referenciado en la model card; no se proporciona URL directa)
- Repositorio BitTokens, archivo `base10_embedding.py` (referenciado en la model card; no se proporciona URL directa)
