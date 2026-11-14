# CNWPlayer/Vega-SupraNeo-4M-Tetris-V2

## Resumen

Vega-SupraNeo-4M-Tetris-V2 es un modelo de lenguaje de tipo transformer decoder-only de 4.070.240 parámetros, desarrollado por CNWPlayer como un ajuste fino (finetune) del modelo base CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose, que a su vez deriva de SupraLabs/SupraNeo-4M. El modelo está especializado en la generación de texto orientada al juego del Tetris, y el autor lo presenta como un finetune entrenado sobre un corpus construido a partir de datos del espacio SLM-Tetris-Arena de DedeProGames.

Se trata de un modelo de escala muy reducida (categoría "tiny"), con arquitectura de estilo Qwen3 según las etiquetas del repositorio, 12 capas, dimensión oculta de 160, 4 cabezas de atención con 2 cabezas KV (GQA) y una longitud de contexto de 1K tokens. Su relevancia es fundamentalmente de investigación: sirve como ejemplo de preentrenamiento desde cero y de ajuste fino especializado sobre datasets abiertos (FineWeb-Edu y DCLM-Baseline), y encaja en entornos de experimentación con recursos mínimos.

La licencia Apache 2.0 y su tamaño lo hacen fácilmente desplegable en cualquier GPU de consumo, incluso en CPU. No obstante, su ventana de contexto, su vocabulario reducido (4.096 tokens) y su naturaleza especializada limitan su uso fuera del ámbito del Tetris y de la experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Qwen3) |
| Parámetros totales | 4.070.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1K tokens |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 12 |
| Dimensión oculta | 160 |
| Cabezas de atención | 4 (2 cabezas KV, GQA) |
| Tamaño intermedio (FFN) | 432 |
| Vocabulario | 4.096 tokens |
| Modelo base | CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose |
| Creador original | SupraLabs (SupraLabs/SupraNeo-4M) |
| Emisiones estimadas | 460 kg CO2eq (preentrenamiento, 1x A100) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 12 capas, dimensión oculta de 160 y 4 cabezas de atención, de las cuales 2 son cabezas KV, lo que indica el uso de Grouped-Query Attention (GQA) para reducir el coste de memoria en la caché KV. La capa feed-forward tiene un tamaño intermedio de 432 y el vocabulario es de 4.096 tokens, coherente con un modelo de escala mínima.

El preentrenamiento se realizó desde cero (etiqueta "pretrained-from-scratch") sobre los datasets HuggingFaceFW/fineweb-edu y mlfoundations/dclm-baseline-1.0, según declara el autor. Posteriormente se aplicó un ajuste fino específico para Tetris con un corpus construido a partir del espacio SLM-Tetris-Arena de DedeProGames. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus de finetune ni si se emplearon técnicas de RLHF o DPO. El autor indica que se usó IA en la creación del proyecto (probablemente para la generación de datos o asistencia en el desarrollo).

## Capacidades

- Generación de texto autoregresiva en inglés.
- Especialización en el juego del Tetris: el autor afirma que supera a todos los modelos del SLM-Tetris-Arena.
- Preentrenamiento desde cero sobre corpus educativos y de alta calidad (FineWeb-Edu, DCLM-Baseline).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo "thinking", visión ni audio.
- Vocabulario reducido (4.096 tokens), lo que limita la cobertura léxica general.

## Casos de uso

- Investigación en preentrenamiento desde cero: el modelo sirve como banco de pruebas de bajo coste para estudiar dinámicas de entrenamiento, tokenización y curvas de pérdida en modelos de 4M de parámetros.
- Experimentación con ajuste fino especializado: permite reproducir el pipeline de finetune sobre un dominio concreto (Tetris) y evaluar cómo un modelo mínimo puede especializarse en una tarea acotada.
- Evaluación de técnicas de atención eficiente: su configuración GQA (4 cabezas, 2 KV) lo hace útil para medir el impacto de la compresión de la caché KV en modelos pequeños.
- Benchmarking de agentes en entornos de juego: puede integrarse en el SLM-Tetris-Arena como referencia para comparar políticas generadas por modelos de lenguaje.
- Docencia y divulgación: adecuado para explicar la arquitectura transformer, el preentrenamiento y el finetune en cursos y talleres con hardware limitado.
- Pruebas de despliegue en CPU y GPUs de consumo: sirve para validar pipelines de inferencia (transformers, TGI) con un modelo que cabe en cualquier entorno.
- Generación de texto breve en inglés dentro de dominios muy restringidos, siempre que el contexto no supere 1K tokens.

## Benchmarks y rendimiento

El autor únicamente declara que el modelo es "bueno en Tetris" y que supera a todos los modelos del SLM-Tetris-Arena. No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Tetris (SLM-Tetris-Arena) | Declarado superior al resto de modelos de la arena, sin cifras publicadas |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (4,07M de parámetros ocupan ~16 MB en fp32, ~8 MB en fp16), más la caché KV para 1K tokens de contexto, que es despreciable.
- GPU recomendadas: cualquier GPU, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; también es viable en CPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta "text-generation-inference" y "endpoints_compatible"); no se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Vega-SupraNeo-4M-Tetris-V2 | 4,07M | 1K | Apache 2.0 | Tetris | Hugging Face |
| SupraLabs/SupraNeo-4M (base) | ~4M | No disponible | No disponible | Generalista | Hugging Face |
| CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose | ~4M | No disponible | Apache 2.0 | Tetris (variante verbose) | Hugging Face |
| Modelos tiny generalistas (p. ej. SmolLM-135M) | 135M | 2K–8K | Apache 2.0 | Generalista | Hugging Face |

La comparación con modelos tiny generalistas de mayor tamaño (como SmolLM o Qwen2.5-0.5B) no es directa: Vega-SupraNeo-4M-Tetris-V2 es entre uno y dos órdenes de magnitud menor y está especializado en una tarea concreta, por lo que su rendimiento en tareas generales será muy inferior.

## Limitaciones y advertencias

- Modelo de 4M de parámetros: capacidad de razonamiento, conocimiento factual y cobertura lingüística muy limitadas.
- Contexto de solo 1K tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Vocabulario de 4.096 tokens, lo que provoca tokenización ineficiente y peor cobertura en dominios fuera del entrenamiento.
- Solo inglés; no se documenta soporte de otros idiomas.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de Tetris.
- El autor no publica métricas objetivas ni detalles del corpus de finetune, lo que dificulta la reproducibilidad.
- La afirmación de superioridad en el SLM-Tetris-Arena no está respaldada por cifras públicas en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está pensado para producción generalista.
- El autor advierte que se usó IA en la creación del proyecto, lo que puede afectar a la calidad y trazabilidad de los datos.
- Emisiones estimadas de 460 kg CO2eq durante el preentrenamiento, dato declarado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/CNWPlayer/Vega-SupraNeo-4M-Tetris-V2
- Modelo base (finetune): https://huggingface.co/CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose
- Modelo original: https://huggingface.co/SupraLabs/SupraNeo-4M
- Arena de Tetris: https://huggingface.co/spaces/DedeProGames/SLM-Tetris-Arena
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
