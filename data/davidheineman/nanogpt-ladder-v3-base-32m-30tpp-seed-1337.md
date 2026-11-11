# davidheineman/nanogpt-ladder-v3-base-32m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 32M 30 TPP es un modelo de lenguaje de tipo base (pretrained, sin ajuste fino posterior) desarrollado por davidheineman dentro del proyecto NanoGPT Ladder v3. Se trata de un checkpoint de investigación orientado a estudiar el escalado de presupuestos de entrenamiento: cada punto de la "escalera" corresponde a un entrenamiento independiente con un número distinto de tokens por parámetro (TPP). Este checkpoint concreto representa el extremo de 30 TPP, con 32.071.680 parámetros y 962.134.016 tokens de predicción procesados en 29.362 pasos de optimizador con semilla 1337.

Arquitectura transformer decoder-only de estilo GPT-2 con 13 capas, anchura 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario ampliado a 50.304. La longitud de contexto es de solo 1.024 tokens. Los pesos son float32 originales y el modelo se distribuye con su propio cargador en PyTorch puro (`model.py` y `generate.py`), no compatible con `AutoModel` de Transformers.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para comparar curvas de pérdida frente a presupuestos de cómputo, no como modelo de producción. El autor advierte explícitamente que estos pesos preceden a las fases de tiny-rl, SFT y RL, por lo que deben usarse con prompts de texto plano y no se espera un comportamiento de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (13 capas, width 320, 5 cabezas, RoPE, embeddings atados) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con `model`, `config`, `identity` y `run`); no safetensors ni GGUF |
| Tokenizador | GPT-2 (`tiktoken`), vocabulario 50.304 (padded) |
| Tokens de entrenamiento | 962.134.016 tokens de predicción (30 TPP) |
| Pasos de optimizador | 29.362 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (receta Dolma3 Dolmino congelada) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clásico con 13 capas, dimensión de modelo 320 y 5 cabezas de atención, con embeddings de entrada y salida atados y codificación posicional rotatoria (RoPE). El vocabulario está ampliado a 50.304 entradas mediante padding sobre el tokenizador GPT-2 estándar. La ventana de contexto es de 1.024 tokens, coherente con la tradición de NanoGPT y con el objetivo de mantener bajo el coste computacional de cada punto de la escalera.

El entrenamiento se realizó sobre el pool Dolma3 Dolmino siguiendo la receta congelada del proyecto. La model card indica que las mezclas "heavy" asignan un 80% del presupuesto al dominio nombrado, lo que sugiere una familia de checkpoints con sesgo de dominio controlado. Este checkpoint concreto corresponde a un presupuesto de 30 tokens por parámetro, con 962 millones de tokens de predicción en 29.362 pasos. No se documentan fases de RLHF, DPO ni SFT: el autor indica explícitamente que estos pesos preceden a tiny-rl, SFT y RL. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` con el registro de finalización y las evaluaciones finales. Las métricas finales publicadas son BPB/loss de modelado de lenguaje, no precisión en tareas.

## Capacidades

- Generación de texto autoregresiva básica con prompts de texto plano, sin formato de instrucciones ni rol de asistente.
- Continuación de texto y modelado de lenguaje puro; es su función principal y la única validada por el autor.
- Capacidad limitada de razonamiento y código derivada del preentrenamiento, sin evaluación publicada al respecto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizador GPT-2 está sesgado hacia inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Fine-tuning posterior: el checkpoint soporta ajuste fino adicional, aunque no incluye estado del optimizador.

## Casos de uso

- Estudio de leyes de escalado: comparar la pérdida final de este checkpoint de 30 TPP con los demás puntos de la escalera NanoGPT Ladder v3 para ajustar curvas de pérdida frente a tokens por parámetro. Es el uso para el que fue diseñado.
- Reproducibilidad de experimentos de preentrenamiento: el `metadata.json` con revisiones exactas, pesos de mezcla y SHA256 permite replicar el entrenamiento y auditar la procedencia de los datos.
- Baseline educativo para aprender a implementar transformers: el código incluido (`model.py`, `generate.py`) es una implementación mínima y legible de un GPT, adecuada para docencia y para verificar la comprensión de atención, RoPE y embeddings atados.
- Pruebas de infraestructura de inferencia: con 32M de parámetros y contexto de 1.024 tokens, se puede usar como modelo de humo para validar pipelines de despliegue en CPU, Apple MPS o CUDA antes de pasar a modelos mayores.
- Experimentos de ajuste fino de bajo coste: al ser un modelo pequeño con pesos float32 y sin estado de optimizador, se puede reentrenar en una sola GPU consumer para estudiar técnicas de SFT o RL sobre una base controlada.
- Investigación sobre mezclas de datos: dado que la receta asigna un 80% al dominio nombrado en las mezclas heavy, sirve para estudiar el efecto del sesgo de dominio en el comportamiento del modelo.
- Generación de texto de relleno en pruebas de sistemas: útil como generador sintético de texto en tests de aplicaciones donde no se requiere calidad lingüística alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene medidas finales de BPB/loss, que son evaluaciones de modelado de lenguaje y no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 128 MB en float32 para los pesos (32M parámetros × 4 bytes); en la práctica, el consumo total con activaciones y contexto de 1.024 tokens se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU sin problema y en Apple MPS (el script `generate.py` selecciona CUDA, MPS o CPU con `device=auto`).
- Cabe en cualquier GPU consumer: RTX 4090, RTX 3090, RTX 3060, GTX 1650 e incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio incluye un cargador propio en PyTorch puro; no es compatible con vLLM, TGI ni llama.cpp sin conversión previa, y no se publican pesos GGUF para Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, la generación en CPU es viable para pruebas y en GPU la latencia por token es del orden de milisegundos, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 32M 30 TPP (este) | 32,1M | 1.024 | no disponible | PyTorch nativo | Checkpoint de investigación, sin SFT/RL |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | PyTorch, TF, safetensors | Referencia histórica; 4× más parámetros |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño orientado a despliegue real |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Escala superior; no comparable directamente en tamaño |

La comparación con GPT-2 small es la más directa en arquitectura y contexto, aunque este modelo tiene la cuarta parte de parámetros y no se han publicado evaluaciones de tareas que permitan comparar rendimiento. SmolLM-135M y TinyLlama son alternativas prácticas para despliegue real, con licencias permisivas y formatos cuantizados, pero pertenecen a otra categoría de tamaño y propósito.

## Limitaciones y advertencias

- Es un modelo base sin SFT ni RL: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas ante prompts de usuario.
- Riesgo alto de alucinación y de contenido sesgado o tóxico, derivado del corpus de preentrenamiento y de la ausencia de alineación.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 favorece el inglés y el rendimiento en castellano es previsiblemente pobre.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- No compatible con `AutoModel` de Transformers ni con los runners habituales (vLLM, TGI, llama.cpp); requiere el cargador propio incluido en el repositorio.
- Pesos en float32 sin variantes cuantizadas publicadas; para reducir memoria habría que cuantizar manualmente.
- Las métricas publicadas son BPB/loss, no precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-32m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
