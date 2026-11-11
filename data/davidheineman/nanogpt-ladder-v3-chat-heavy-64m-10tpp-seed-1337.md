# davidheineman/nanogpt-ladder-v3-chat-heavy-64m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 64M es un modelo de lenguaje de tipo base (pretrained, sin ajuste fino posterior) desarrollado por davidheineman dentro de su proyecto NanoGPT Ladder, una serie de experimentos de preentrenamiento a pequeña escala que replican la receta de nanoGPT de Andrej Karpathy. El modelo tiene 63.504.384 parámetros y ha sido entrenado sobre 635.043.840 tokens de predicción (10 tokens por parámetro, TPP), con 19.380 pasos de optimizador y semilla 1337. Su propósito es servir como punto de partida reproducible para estudiar el efecto de mezclas de datos y presupuestos de cómputo en modelos pequeños.

La arquitectura es un transformer decoder-only de 12 capas, anchura 512, 8 cabezas de atención, embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. La mezcla de datos es "chat-heavy", derivada de la receta congelada del pool Dolma3 Dolmino de AllenAI, donde el 80% del contenido se asigna al dominio nombrado (chat). Los pesos son float32 originales y se distribuyen con un cargador propio en PyTorch, no compatible con `transformers.AutoModel`.

Es relevante ahora porque forma parte de una colección de modelos completados que permiten comparar sistemáticamente variantes de mezcla (chat-heavy frente a otras) bajo un mismo presupuesto de tokens, algo útil para investigadores que estudian leyes de escala, ablaciones de datos o reproducibilidad en preentrenamiento. No obstante, al ser un modelo base de 64M entrenado con solo 635M tokens, sus capacidades prácticas son muy limitadas y no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanoGPT), 12 capas, width 512, 8 cabezas, RoPE, embeddings atados |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, checkpoint con `model`, `config`, `identity`, `run`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la implementación nanoGPT: un transformer decoder-only con 12 capas, dimensión de modelo 512, 8 cabezas de atención, embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y vocabulario GPT-2 de 50.304 entradas (con padding). La ventana de contexto es de 1.024 tokens. No se emplean innovaciones como atención lineal, SSM ni decodificación especulativa; es una arquitectura densa convencional.

El preentrenamiento se completó con 635.043.840 tokens de predicción en 19.380 pasos de optimizador, semilla 1337, sobre una mezcla "chat-heavy" que sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`), con un 80% asignado al dominio chat. El autor indica que estos pesos preceden a cualquier condicionamiento tiny-rl, SFT o RL, por lo que se trata de un modelo estrictamente base. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256, y `results.json` con el registro de finalización y evaluaciones finales (BPB/loss, no precisión en tareas). No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano, con decodificación greedy (`temperature=0`) o con muestreo.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones ni mantiene formato de chat de forma fiable.
- Razonamiento, código y matemáticas: capacidades muy limitadas por el tamaño (64M) y el presupuesto de entrenamiento (635M tokens).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizador es GPT-2 y el corpus es Dolma3 Dolmino, pero no se especifica cobertura idiomática.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inferencia en CUDA, Apple MPS o CPU mediante `device=auto` en el script incluido.
- Compatible con fine-tuning posterior (el checkpoint no incluye estado del optimizador).

## Casos de uso

- Investigación en leyes de escala y ablaciones de datos: el modelo sirve como punto de comparación dentro de la colección NanoGPT Ladder v3, permitiendo medir el efecto de la mezcla chat-heavy frente a otras mezclas bajo el mismo presupuesto de 10 TPP y semilla fija.
- Reproducibilidad de experimentos de preentrenamiento: los metadatos (`metadata.json` con revisiones y SHA256) permiten replicar exactamente la mezcla y el run, útil para validar pipelines de entrenamiento.
- Pruebas de infraestructura de inferencia: al ser un checkpoint PyTorch pequeño (0,3 GB), se puede usar para validar scripts de carga, tokenización y decodificación en CPU, CUDA o MPS antes de escalar a modelos mayores.
- Docencia y formación: ejemplo didáctico de un transformer decoder-only completo, con código de carga y generación incluido, para explicar atención, RoPE y embeddings atados.
- Fine-tuning de bajo coste: al no incluir estado del optimizador, es adecuado para experimentos de SFT o LoRA en entornos con recursos limitados, aunque la calidad final será modesta.
- Generación de texto exploratoria en dominios conversacionales: dado el sesgo del 80% hacia el dominio chat, puede emplearse para estudiar la distribución aprendida en ese dominio, siempre con expectativas de calidad baja.
- Baseline en evaluaciones de perplejidad (BPB/loss): útil como referencia de un modelo de 64M entrenado con 10 TPP para comparar con variantes de mayor o menor presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene mediciones finales de BPB/loss, que son evaluaciones de modelado de lenguaje y no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 63,5M de parámetros en float32, los pesos ocupan aproximadamente 254 MB; el pico de memoria en inferencia con contexto de 1.024 tokens es inferior a 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también funciona en Apple MPS y CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con cargador propio en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato no es GGUF ni safetensors estándar).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 64M, la latencia será muy baja en GPU y aceptable en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 64M (este) | 63,5M | 1.024 | 635M tokens, mezcla chat-heavy Dolma3 Dolmino | no disponible | PyTorch nativo |
| Otras variantes NanoGPT Ladder v3 (misma colección) | 64M (mismo tamaño) | 1.024 | Distintas mezclas y presupuestos, misma receta | no disponible | PyTorch nativo |
| GPT-2 small (referencia histórica) | 124M | 1.024 | ~40B tokens (WebText) | MIT (pesos OpenAI) | PyTorch, safetensors, GGUF |
| Modelos nanoGPT de Karpathy (referencia) | ~124M | 1.024 | TinyStories / Shakespeare, según variante | MIT (código) | PyTorch |

La comparación con GPT-2 small es la más directa por arquitectura y contexto, pero este modelo tiene la mitad de parámetros y un presupuesto de entrenamiento mucho menor (635M frente a ~40B tokens), por lo que su calidad esperada es inferior. Las otras variantes de la colección NanoGPT Ladder v3 son los comparadores más justos para ablaciones controladas.

## Limitaciones y advertencias

- Modelo base sin SFT ni RLHF: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación y de generar texto factualmente incorrecto; no debe usarse para responder preguntas ni para tareas de precisión.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto y probablemente deficiente fuera del inglés.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el repositorio antes de cualquier uso en producción.
- Sesgos desconocidos: la mezcla Dolma3 Dolmino puede contener sesgos de los datos de origen, pero no se documenta ningún análisis al respecto.
- Formato no estándar: requiere el cargador propio (`model.py`), no es compatible con `transformers.AutoModel` ni con herramientas estándar de despliegue.
- Sin estado del optimizador: no se puede reanudar el entrenamiento exactamente desde el checkpoint.
- Las métricas publicadas (BPB/loss) no miden capacidad de resolución de tareas; no deben interpretarse como rendimiento en benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-64m-10tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- nanoGPT (implementación de referencia de Andrej Karpathy): https://github.com/karpathy/nanoGPT
