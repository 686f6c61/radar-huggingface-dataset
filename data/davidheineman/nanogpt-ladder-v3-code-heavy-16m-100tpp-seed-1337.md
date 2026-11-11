# davidheineman/nanogpt-ladder-v3-code-heavy-16m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 16M 100TPP es un modelo de lenguaje base de escala reducida (15.851.520 parámetros) desarrollado por davidheineman dentro del proyecto NanoGPT Ladder, una iniciativa de investigación que entrena de forma sistemática una escalera de modelos con presupuestos de cómputo crecientes para estudiar las leyes de escalado. Este checkpoint concreto corresponde a un punto de finalización de preentrenamiento: 1.585.152.000 tokens de predicción procesados en 48.375 pasos de optimizador con la semilla 1337, lo que equivale a 100 tokens por parámetro (TPP).

El modelo emplea una arquitectura transformer tipo GPT con 14 capas, anchura 192, 6 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, sobre una ventana de contexto de 1.024 tokens. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, con una asignación del 80% al dominio de código ("code-heavy"), lo que lo orienta a modelar distribuciones de texto con fuerte presencia de código fuente.

Su relevancia es fundamentalmente metodológica y de investigación: no es un modelo de producción ni un asistente instruido. Los pesos preceden a cualquier fase de condicionamiento tiny-rl, SFT o RL, por lo que solo aceptan prompts de texto plano y generan continuaciones. Resulta útil para estudiar dinámicas de preentrenamiento, ablaciones de mezcla de datos y como baseline reproducible en experimentos de escalado a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio (`model.py`) |
| Capas | 14 |
| Dimension de embedding (width) | 192 |
| Cabezas de atencion | 6 |
| Tokenizador | GPT-2 (tiktoken) |
| Vocabulario | 50.304 (padded) |
| Posicional encoding | RoPE |
| Embeddings | atados (input/output) |
| Tokens de entrenamiento | 1.585.152.000 (100 TPP) |
| Pasos de optimizador | 48.375 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla code-heavy, 80% dominio) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 14 bloques, anchura 192 y 6 cabezas de atención (32 dimensiones por cabeza). Usa embeddings atados entre la capa de entrada y la proyección de salida, codificación posicional rotatoria (RoPE) y un vocabulario GPT-2 de 50.304 entradas. La implementación es la de NanoGPT, con un cargador propio (`model.py`) que no depende de `transformers.AutoModel`.

El preentrenamiento se realizó sobre 1.585.152.000 tokens de predicción en 48.375 pasos de optimizador, con la semilla 1337 fijada para reproducibilidad. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI; en la variante code-heavy, el 80% de la mezcla se asigna al dominio de código. El fichero `metadata.json` documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` contiene el registro de finalización y las evaluaciones finales (BPB y pérdida de lenguaje, no precisión en tareas). No se reporta uso de RLHF, DPO ni SFT en este checkpoint.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano (continuación, no instrucción).
- Modelado de lenguaje y cálculo de perplejidad/BPB sobre corpus de evaluación.
- Modelado de distribuciones de código fuente, dado el sesgo 80% del dominio en la mezcla de entrenamiento.
- Punto de partida para fine-tuning posterior (el checkpoint incluye pesos pero no estado del optimizador).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas; dependen del tokenizador GPT-2 y de la mezcla Dolmino, sin evaluación específica publicada.

## Casos de uso

- Investigación en leyes de escalado: sirve como punto de la "escalera" NanoGPT Ladder para ajustar curvas de pérdida frente a tokens de entrenamiento y parámetros, gracias a su configuración reproducible (semilla 1337, 100 TPP).
- Ablaciones de mezcla de datos: al ser la variante code-heavy, permite comparar directamente con las variantes de otros dominios del mismo proyecto para medir el efecto de la composición del corpus en el BPB final.
- Baseline de preentrenamiento en experimentos académicos: modelo ligero que entrena y evalúa en hardware modesto, útil como referencia antes de escalar a modelos mayores.
- Fine-tuning supervisado de demostración: el checkpoint admite ajuste posterior para tareas concretas de generación de texto o código en entornos docentes o de prototipado.
- Estudio de tokenizadores y vocabulario: con vocabulario GPT-2 padded a 50.304, sirve para analizar el impacto del padding de vocabulario en modelos pequeños.
- Pruebas de infraestructura de inferencia: su tamaño (0,1 GB) permite validar pipelines de carga de checkpoints PyTorch personalizados, decodificación greedy y selección de dispositivo (CUDA, MPS, CPU) sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene mediciones finales de BPB y pérdida de lenguaje, pero no accuracy en tareas (MMLU, HumanEval, GSM8K u otras), y no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85 M de parámetros ≈ 63 MB de pesos, más activaciones y caché KV para 1.024 tokens); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problemas. También en Apple Silicon vía MPS y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: el checkpoint usa un cargador propio (`model.py` + `generate.py`) y no es compatible directamente con `transformers.AutoModel`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El script incluido selecciona dispositivo con `device=auto` (CUDA, MPS o CPU).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 16M 100TPP | 15,85 M | 1.024 | no disponible | Hugging Face (repo 0,1 GB) | Base model de investigación, sin SFT/RL |
| Otras variantes NanoGPT Ladder v3 | no disponible | no disponible | no disponible | Colección en Hugging Face | Misma escalera, distintos dominios y presupuestos TPP |
| GPT-2 small | 124 M | 1.024 | MIT (segun publicacion original) | Amplia | Referencia histórica de transformers pequeños |
| Modelos tipo TinyLlama / SmolLM pequeños | cientos de M a miles de M | 2.048+ | variables | Amplia | Escala superior; no comparables en cómputo |

La comparación directa con modelos de producción no es significativa por la diferencia de escala y porque este checkpoint es un base model sin alineación. La referencia natural es la propia colección NanoGPT Ladder v3, que permite comparaciones controladas entre dominios y presupuestos de tokens.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones ni mantiene formato de asistente; solo continúa texto.
- Riesgo alto de alucinación y de generar contenido incoherente o repetitivo, propio de un modelo de 16 M de parámetros.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos: no evaluados ni documentados; la mezcla code-heavy puede sobrerrepresentar patrones de código y descuidar lenguaje natural.
- Idiomas: no documentados; el tokenizador GPT-2 está sesgado hacia inglés.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Pesos en float32 sin estado de optimizador: el fine-tuning requiere reinicializar el optimizador.
- Incompatibilidad con `transformers.AutoModel`: requiere el cargador propio incluido en el repositorio.
- Las métricas publicadas son BPB/pérdida, no precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-16m-100tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de implementación): https://github.com/karpathy/nanoGPT
