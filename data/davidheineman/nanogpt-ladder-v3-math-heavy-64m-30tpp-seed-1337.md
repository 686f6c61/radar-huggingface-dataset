# davidheineman/nanogpt-ladder-v3-math-heavy-64m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 64M 30TPP es un modelo de lenguaje base de tipo GPT-2 entrenado desde cero por el usuario de Hugging Face davidheineman como parte de la colección NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento controladas que varían mezcla de datos, presupuesto de tokens y semilla. El modelo tiene 63.504.384 parámetros, 12 capas, ancho 512 y 8 cabezas de atención, con embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens.

Se trata de un punto de control de preentrenamiento puro: no ha pasado por SFT, RLHF ni ninguna fase de condicionamiento tipo tiny-rl, por lo que debe usarse con prompts de texto plano y no se comporta como un asistente. Su interés es fundamentalmente de investigación: permite estudiar el efecto de una mezcla de datos con fuerte peso en el dominio matemático (80% del cómputo de la mezcla, siguiendo la receta del pool Dolma3 Dolmino) sobre un presupuesto de 30 tokens por parámetro (TPP), equivalente a 1.905.131.520 tokens de predicción.

La relevancia actual del modelo es acotada y experimental: no es un modelo de producción, no tiene licencia declarada y no publica evaluaciones de tareas. Sirve como referencia reproducible de escalado y ablación de mezclas de datos en el régimen de 64M de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (NanoGPT), 12 capas, ancho 512, 8 cabezas de atención, embeddings atados, RoPE |
| Parámetros totales | 63.504.384 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos originales en float32; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, orientado a inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32), con `model.py` y `generate.py` propios; no compatible con Transformers AutoModel |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia GPT-2 implementado en NanoGPT: 12 bloques, dimensión de modelo 512, 8 cabezas de atención (64 dimensiones por cabeza), embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. El preentrenamiento se completó en 58.140 pasos de optimizador con semilla 1337, procesando 1.905.131.520 tokens de predicción (30 tokens por parámetro).

La mezcla de datos sigue la receta congelada del pool allenai/dolma3_dolmino_pool; en las variantes "math-heavy" el 80% de la mezcla se asigna al dominio nombrado (matemáticas). El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y hashes SHA256, y `results.json` con el registro de finalización y las evaluaciones finales (BPB/loss). Cada presupuesto de tokens de la serie corresponde a una ejecución entrenada de forma independiente. No se documenta uso de RLHF, DPO ni SFT.

## Capacidades

- Generación de texto autoregresiva básica a partir de prompts de texto plano.
- Modelado de lenguaje y continuación de texto; útil para medir perplejidad y BPB en dominios concretos.
- Punto de partida para fine-tuning supervisado posterior (el checkpoint es compatible con entrenamiento adicional; no incluye estado del optimizador).
- Capacidad matemática potencial derivada de la mezcla math-heavy, no evaluada ni cuantificada en la información disponible.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües documentadas.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Ablación de mezclas de datos: comparar esta ejecución math-heavy con las variantes de la misma colección NanoGPT Ladder v3 para aislar el efecto del 80% de peso en matemáticas sobre la pérdida de validación.
- Estudio de escalado a presupuesto fijo: con 30 TPP y 64M de parámetros, sirve para trazar curvas de pérdida frente a tokens vistos en entornos de cómputo reducidos.
- Reproducibilidad de preentrenamiento: `metadata.json` y `results.json` permiten replicar la ejecución con revisiones de dataset y hashes verificables.
- Fine-tuning académico de bajo coste: al caber en una sola GPU de consumo, es viable ajustarlo con SFT sobre tareas estrechas (clasificación, extracción) para estudiar transferencia desde un base model pequeño.
- Generación de texto de dominio restringido tras ajuste: continuación de texto técnico o matemático una vez adaptado, no de forma zero-shot fiable.
- Docencia y experimentación con arquitecturas GPT: el código `model.py` y `generate.py` autocontenidos permiten inspeccionar y modificar la arquitectura sin dependencias de Transformers.
- Evaluación de tokenizadores y contextos cortos: útil para medir el impacto de una ventana de 1.024 tokens en tareas de resumen o QA de documentos breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que `results.json` contiene mediciones finales de BPB y loss, que son evaluaciones de modelado de lenguaje y no accuracy de resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB solo para pesos (63,5M × 4 bytes), más activaciones y caché KV; en la práctica, menos de 1 GB.
- VRAM estimada en float16/bfloat16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es trivial para A100, H100, RTX 4090, RTX 3090 o incluso GPUs de gama baja.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1660, etc.) y en Apple Silicon vía MPS.
- Despliegue: el repositorio incluye `generate.py` con selección automática de dispositivo (CUDA, Apple MPS o CPU) y decodificación greedy con `temperature=0`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos nativo no es directamente compatible con ellos.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia en GPU es del orden de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 64M 30TPP | 63,5M | 1.024 | no disponible | PyTorch nativo | Hugging Face, 0 descargas |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | PyTorch, TF, GGUF (comunidad) | Amplia, ecosistema maduro |
| Otras ejecuciones de NanoGPT Ladder v3 (misma colección) | ~64M | 1.024 | no disponible | PyTorch nativo | Hugging Face |
| Modelos base pequeños tipo Pythia-70M | 70M | 2.048 | Apache 2.0 | PyTorch, safetensors | Amplia, con checkpoints intermedios |

La comparación de rendimiento con estas alternativas no está disponible: no se publican métricas de tareas para este checkpoint.

## Limitaciones y advertencias

- Es un modelo base sin alineación: no sigue instrucciones, no mantiene formato de asistente y puede generar contenido incoherente o inapropiado.
- Riesgo elevado de alucinación y dederiva temática, especialmente con prompts largos, dado su tamaño y contexto de 1.024 tokens.
- Contexto muy corto: no apto para documentos largos, conversaciones multi-turno extensas ni RAG con muchos fragmentos.
- Idiomas: no se declaran idiomas soportados; el tokenizador GPT-2 está sesgado hacia inglés y el rendimiento en castellano es previsiblemente pobre.
- Sesgos: al entrenarse sobre el pool Dolma3 Dolmino, hereda los sesgos de esa mezcla; no se documenta ningún filtrado o mitigación posterior.
- Licencia no disponible: no hay autorización explícita para uso comercial; conviene tratar el modelo como no apto para producción hasta aclarar los términos.
- Sin garantías de calidad: el autor advierte que las métricas publicadas son de modelado de lenguaje (BPB/loss), no de resolución de tareas.
- No incluye estado del optimizador, lo que limita reanudar el preentrenamiento exactamente donde se dejó.
- Carga mediante código propio: no funciona con `AutoModel` de Transformers, lo que complica su integración en pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-64m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset utilizado: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
