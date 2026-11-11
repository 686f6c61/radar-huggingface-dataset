# davidheineman/nanogpt-ladder-v3-chat-heavy-32m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 32M es un modelo de lenguaje de tipo base (preentrenamiento puro, sin ajuste posterior) desarrollado por davidheineman dentro de una serie experimental denominada NanoGPT Ladder v3. Se trata de un transformer decoder-only de 32.071.680 parámetros, entrenado desde cero sobre 320.700.416 tokens de predicción (10 TPP, tokens por parámetro) procedentes del pool Dolma3 Dolmino de AI2, con una mezcla "chat-heavy" en la que el 80 por ciento del contenido se asigna al dominio conversacional. Su propósito es servir como punto de control reproducible para estudiar el efecto del presupuesto de tokens y la composición del corpus en el preentrenamiento a pequeña escala.

El modelo emplea una arquitectura compacta: 13 capas, dimensión de modelo 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario de 50.304 entradas (con padding). El contexto máximo es de 1.024 tokens. Los pesos se distribuyen en formato PyTorch nativo (`model.pt`) con precisión float32 original, e incluyen scripts propios de carga e inferencia, ya que la arquitectura no es compatible con `AutoModel` de Transformers.

Es relevante ahora por su carácter de escalón dentro de una escalera de modelos entrenados con presupuestos de tokens independientes y semillas fijas (seed 1337), lo que permite análisis controlados de leyes de escalado y de mezcla de datos. No obstante, conviene subrayar que es un modelo base previo a SFT y RL, sin alineación ni capacidad conversacional real, y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo NanoGPT/GPT-2) con RoPE y embeddings atados |
| Parametros totales | 32.071.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles; no se declara cobertura multilingue) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NanoGPT: un transformer decoder-only con 13 capas, ancho 320, 5 cabezas de atención, embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, e incluye `model.py` y `generate.py` para carga e inferencia nativas en PyTorch, con selección automática de dispositivo (CUDA, Apple MPS o CPU) y decodificación greedy cuando `temperature=0`.

El entrenamiento se completó con 320.700.416 tokens de predicción en 9.787 pasos de optimizador, equivalentes a 10 TPP, sobre el pool `allenai/dolma3_dolmino_pool` siguiendo la receta congelada de mezclas Dolmino. En la variante "chat-heavy", el 80 por ciento de la mezcla se asigna al dominio conversacional nombrado. El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` contiene el registro de finalización y las evaluaciones finales (BPB y pérdida). No se aplicaron SFT, RL ni condicionamiento tiny-rl: los pesos son el punto final del preentrenamiento y deben usarse con prompts de texto plano. No se documenta uso de RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano, con decodificación greedy o por temperatura.
- Modelado de lenguaje puro: continuación de texto y estimación de probabilidad (útil para calcular perplejidad/BPB sobre corpus).
- Punto de partida para fine-tuning supervisado posterior (el checkpoint admite entrenamiento adicional, aunque no incluye estado del optimizador).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable (es un modelo base de 32M parámetros).
- Capacidades multilingües no declaradas; el tokenizador GPT-2 favorece el inglés.
- Sin modo "thinking", visión, audio ni otras modalidades.
- Sin alineación conversacional: no es un modelo de chat pese a la etiqueta "chat-heavy", que describe la mezcla de datos, no el comportamiento.

## Casos de uso

- Investigación en leyes de escalado: el modelo forma parte de una escalera de presupuestos de tokens (10 TPP) con semilla fija, lo que permite comparar curvas de pérdida frente a otros escalones de la misma serie de forma controlada.
- Estudio de mezclas de datos: al estar entrenado con una receta "chat-heavy" (80 por ciento del dominio conversacional), sirve para medir el impacto de la composición del corpus en el BPB de validación.
- Reproducibilidad de preentrenamiento: los hashes SHA256 y las revisiones de fuente en `metadata.json` permiten replicar el experimento y auditar la procedencia de los datos.
- Baseline para fine-tuning educativo: su tamaño (32M) y su código autocontenido (`model.py`, `generate.py`) lo hacen adecuado para prácticas de ajuste supervisado en entornos docentes con recursos limitados.
- Evaluación de tokenizadores: al usar GPT-2 con vocabulario rellenado, puede emplearse para estudiar el efecto del padding de vocabulario en modelos pequeños.
- Generación de texto de demostración en CPU o Apple MPS: el script incluido selecciona dispositivo automáticamente, lo que facilita demos locales sin GPU.
- Cálculo de perplejidad en pipelines de filtrado de datos: el modelo puede puntuar texto para descartar muestras de baja calidad en corpus pequeños, aunque con capacidad limitada por su tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card indica únicamente que `results.json` contiene evaluaciones finales de BPB y pérdida, que son métricas de modelado de lenguaje y no de resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 128 MB para los pesos en float32 (32M parámetros × 4 bytes), más overhead de activaciones y contexto, muy por debajo de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU y en Apple MPS según el script incluido (`device=auto`).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4090, e incluso en iGPU y CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (la arquitectura requiere loader propio, no `AutoModel`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 32M (este) | 32,1M | 1.024 | no disponible | PyTorch (`model.pt`) | Base preentrenado, mezcla chat-heavy, 10 TPP |
| GPT-2 small | 124M | 1.024 | MIT | PyTorch, safetensors, GGUF | Modelo de referencia de OpenAI; 4x más grande |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Base moderno con soporte amplio de ecosistema |
| Pythia-70M | 70M | 2.048 | Apache 2.0 | safetensors | Serie de investigación con checkpoints intermedios |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas de tareas para este modelo, por lo que no es posible contrastar BPB o precisión frente a las alternativas citadas.

## Limitaciones y advertencias

- Es un modelo base sin SFT ni RL: no sigue instrucciones ni mantiene conversaciones coherentes; el uso con prompts conversacionales producirá continuaciones de texto, no respuestas.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, agravado por su tamaño reducido y su corpus de preentrenamiento.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o diálogos extensos.
- Idiomas no declarados; el tokenizador GPT-2 y la mezcla Dolmino favorecen el inglés, con cobertura incierta del castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Sin estado del optimizador en el checkpoint: el fine-tuning requiere reinicializar el optimizador.
- Arquitectura no estándar: no es compatible con `AutoModel` de Transformers, lo que limita la integración con herramientas del ecosistema (vLLM, TGI, llama.cpp).
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-32m-10tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura): https://github.com/karpathy/nanoGPT
