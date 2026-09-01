# kaafivikrant/First5M

## Resumen

First5M es un modelo de lenguaje basado en la arquitectura Transformer decoder-only, desarrollado por Vikrant Sharma (kaafivikrant) como proyecto educativo. Con aproximadamente 5 millones de parámetros, está diseñado para comprender el funcionamiento interno de un Transformer desde cero, implementado íntegramente en PyTorch. El modelo sigue la arquitectura descrita en el artículo "Attention Is All You Need" (Vaswani et al., 2017) y se entrenó sobre el dataset OpenWebText, aunque solo ha visto alrededor del 7,6 % de los tokens totales del corpus.

Su relevancia radica en ser un ejemplo didáctico de cómo construir y entrenar un modelo de lenguaje desde cero, con un código limpio y autónomo que permite estudiar cada componente: atención multi-cabeza, capas de normalización, codificación posicional sinusoidal y weight tying. No está orientado a producción, sino a fines educativos y de experimentación. El modelo tiene una ventana de contexto de 256 tokens y utiliza el tokenizador BPE de GPT-2 (tiktoken).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Pre-LayerNorm) |
| Parametros totales | ~5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (pytorch_model.pt) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con 6 capas, dimensión oculta de 256, 4 cabezas de atención (64 dimensiones por cabeza) y una red feed-forward de 1024 unidades con activación GELU. Emplea codificación posicional sinusoidal (no aprendida) y weight tying entre la capa de embedding y la cabeza de salida. La arquitectura sigue el esquema Pre-LayerNorm, con normalización antes de cada subcapa y conexiones residuales.

El entrenamiento se realizó sobre OpenWebText (Skylion007/openwebtext), un corpus de aproximadamente 4.300 millones de tokens. El modelo solo procesó unos 328 millones de tokens (7,6 % del dataset) en 17.999 pasos, con un tamaño de lote efectivo de 64 (16 × 4 acumulación de gradiente). Se usó el optimizador AdamW con betas 0,9/0,95, weight decay 0,1, y una programación de tasa de aprendizaje con decaimiento coseno y warmup lineal de 500 pasos, con pico en 3e-4 y mínimo en 3e-5. El entrenamiento se ejecutó en una Apple M1 con 16 GB de RAM y backend MPS, durante unas 22 horas. La mejor pérdida de validación fue 4,9869 (perplejidad 146).

## Capacidades

- Generación de texto autoregresiva: el modelo puede generar texto continuando un prompt dado, con parámetros de temperatura, top-k y penalización de repetición.
- Razonamiento básico: al ser un modelo pequeño, su capacidad de razonamiento es muy limitada y produce texto a menudo incoherente.
- Codificación: no tiene capacidades específicas de generación de código más allá de lo que pueda aprender de los datos de texto general.
- Matemáticas: no hay evidencia de capacidades matemáticas destacables.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingüe: solo inglés, y con calidad limitada.
- Capacidades especiales: ninguna más allá de la generación de texto básica.

## Casos de uso

- Aprendizaje de arquitecturas Transformer: el código fuente (model.py) es un recurso didáctico para estudiar la implementación de un decoder-only transformer, incluyendo atención, normalización y weight tying.
- Experimentación con hiperparámetros: al ser un modelo pequeño y rápido de entrenar, permite probar variaciones en la arquitectura (número de capas, heads, dimensiones) en hardware modesto.
- Pruebas de tokenización y generación: sirve para entender cómo funciona el tokenizador BPE de GPT-2 y los métodos de muestreo (temperature, top-k, repetition penalty).
- Base para proyectos académicos: puede utilizarse como punto de partida para investigaciones sobre modelos de lenguaje pequeños, análisis de representaciones internas o estudios de scaling laws.
- Demostración de entrenamiento desde cero: útil en talleres o cursos para mostrar el flujo completo de entrenamiento de un LM, desde los datos hasta la generación.
- Comparación de rendimiento en tareas de lenguaje simples: aunque no es útil para producción, puede emplearse para medir la degradación de calidad frente a modelos más grandes en tareas de completado de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de validación de 4,9869, que corresponde a una perplejidad de 146 sobre el conjunto de validación de OpenWebText. Esta cifra es esperable para un modelo de 5 millones de parámetros entrenado con una fracción pequeña del corpus.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~5 millones de parámetros. En float32, los pesos ocupan unos 20 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior, Apple M1/M2, etc.) es suficiente. No requiere GPU de gama alta.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch puro, se puede ejecutar con torch directamente. No hay soporte oficial para vLLM, llama.cpp u Ollama, pero al ser tan pequeño podría adaptarse fácilmente.
- Latencia y throughput: en una CPU moderna, la generación de 100 tokens debería completarse en menos de un segundo. En GPU, la latencia es despreciable.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de tamaño similar en la información proporcionada. Como referencia, se puede comparar con GPT-2 small (124M parámetros, contexto 1024) o con modelos de la serie nanoGPT de Andrej Karpathy, pero no hay datos de rendimiento publicados para First5M en tareas estándar. La comparación más relevante sería con otros modelos educativos de ~5M, pero no se han encontrado datos al respecto.

## Limitaciones y advertencias

- Calidad de texto baja: el modelo produce texto a menudo incoherente, repetitivo o sin sentido, como es esperable para su tamaño.
- Contexto muy limitado: solo 256 tokens, lo que impide manejar dependencias de largo alcance.
- No está alineado ni ajustado con instrucciones: no responde a prompts de forma útil ni sigue instrucciones.
- Sesgos y contenido inapropiado: al entrenarse con datos de internet sin filtrado, puede generar contenido sesgado u ofensivo.
- Riesgo de alucinación: alto, debido a su limitada capacidad de modelado.
- Uso exclusivamente educativo: no está destinado a ningún uso en producción.
- Licencia MIT: permite uso comercial, pero el modelo no es apto para ello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaafivikrant/First5M
- Perfil del autor en Hugging Face: https://huggingface.co/kaafivikrant/models
- Perfil del autor en GitHub: https://github.com/kaafivikrant
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
