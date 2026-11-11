# davidheineman/nanogpt-ladder-v3-base-128m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 128M es un modelo de lenguaje de tipo base (sin instrucciones ni alineamiento) desarrollado por davidheineman como parte de una serie de experimentos de preentrenamiento a escala controlada. Se trata de una implementación propia de la arquitectura GPT-2 (transformer decoder-only con 13 capas, anchura 768 y 12 cabezas de atención) con 130.646.016 parámetros, entrenada sobre 1.306.460.160 tokens de predicción (10 tokens por parámetro, TPP) durante 39.870 pasos de optimización con semilla 1337.

El modelo forma parte de la "NanoGPT Ladder v3", una escalera de modelos de distintos tamaños y presupuestos de cómputo entrenados de forma independiente, pensada para estudiar leyes de escalado y recetas de mezcla de datos. Utiliza el tokenizador GPT-2, embeddings atados, RoPE y un contexto de 1.024 tokens. Los pesos son los originales en float32 y preceden a cualquier fase de SFT o RL, por lo que debe emplearse con prompts de texto plano.

Su relevancia es principalmente experimental y educativa: sirve como punto de referencia reproducible (semilla fija, metadata con revisiones y hashes SHA256) para investigar el efecto de la mezcla de datos del pool Dolma3 Dolmino en modelos pequeños. No es un modelo orientado a producción ni a tareas de instrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (13 capas, anchura 768, 12 cabezas, embeddings atados, RoPE) |
| Parametros totales | 130.646.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con `model`, `config`, `identity` y `run`); no usa Transformers AutoModel |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 13 capas, dimensión de modelo 768, 12 cabezas de atención, embeddings de entrada y salida atados, embeddings rotatorios (RoPE) y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. El contexto máximo es de 1.024 tokens. La implementación es propia (archivos `model.py` y `generate.py` incluidos en el repositorio) y requiere un cargador específico en lugar de las clases estándar de Transformers.

El preentrenamiento se realizó sobre el pool `allenai/dolma3_dolmino_pool`, siguiendo una receta de mezcla congelada: las mezclas "heavy" asignan el 80% de los datos al dominio nombrado. Se completaron 39.870 pasos de optimización con semilla 1337, cubriendo 1.306.460.160 tokens de predicción. No se documenta el uso de RLHF, DPO ni SFT; el autor indica explícitamente que estos pesos preceden a la fase "tiny-rl". El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256, y `results.json` con el registro de finalización y las evaluaciones finales.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano (modelo base, sin formato de instrucciones).
- Modelado de lenguaje y continuación de texto; las métricas publicadas son BPB/pérdida, no precisión en tareas.
- Capacidad de fine-tuning posterior: el checkpoint admite inferencia y ajuste adicional (sin estado del optimizador).
- Decodificación configurable: greedy (`temperature=0`) o muestreo con temperatura; selección automática de dispositivo CUDA, Apple MPS o CPU.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el tokenizador GPT-2 y el corpus Dolmino condicionan el comportamiento, pero no hay evaluación por idioma.

## Casos de uso

- Investigación en leyes de escalado: el modelo es un punto de la escalera NanoGPT Ladder v3 con presupuesto fijo (10 TPP) y semilla reproducible, útil para comparar curvas de pérdida frente a otros tamaños y presupuestos.
- Estudio de mezclas de datos: al seguir la receta congelada de Dolma3 Dolmino con pesos por dominio registrados en `metadata.json`, permite aislar el efecto de la composición del corpus en modelos pequeños.
- Reproducibilidad de experimentos: los hashes SHA256 y las revisiones exactas de las fuentes facilitan replicar el entrenamiento y verificar la integridad de los pesos.
- Fine-tuning educativo: con 130M parámetros y pesos float32, sirve como banco de pruebas para SFT o RL a pequeña escala sobre una GPU de consumo, partiendo de un checkpoint base limpio.
- Generación de texto de ejemplo y demostraciones: el script `generate.py` permite ejecutar prompts simples en CPU o MPS para ilustrar el funcionamiento de un GPT-2 a escala reducida.
- Baseline en evaluación de técnicas de eficiencia: su contexto de 1.024 tokens y arquitectura estándar lo hacen adecuado como referencia para comparar cuantización, decodificación especulativa u otras optimizaciones en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que las mediciones finales de BPB/pérdida son evaluaciones de modelado de lenguaje y no precisión en resolución de tareas; los valores concretos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,5 GB solo para pesos (130,6M × 4 bytes), más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; el modelo selecciona automáticamente CUDA, Apple MPS o CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida; también funciona en CPU.
- Opciones de despliegue: el repositorio incluye `generate.py` y `model.py` para PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al usar un cargador propio no es compatible directamente con `AutoModel` de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 128M (este modelo) | 130,6M | 1.024 | no disponible | PyTorch nativo | Base sin SFT/RL, receta Dolmino, semilla 1337 |
| GPT-2 124M (OpenAI) | 124M | 1.024 | MIT (pesos publicados) | PyTorch / safetensors | Referencia histórica; tokenizador y arquitectura equivalentes en escala |
| Modelos de la misma colección NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch nativo | Misma receta con otros tamaños y presupuestos de tokens |

La comparación con GPT-2 124M es la más directa por tamaño y arquitectura; no se dispone de datos de rendimiento comparativos en la información proporcionada. Para alternativas de la misma categoría con licencia y ecosistema de despliegue amplio (por ejemplo, variantes pequeñas de Llama o Qwen), no se dispone de datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo base: no está alineado ni ajustado con instrucciones, por lo que no debe esperarse que siga órdenes ni mantenga formato conversacional.
- Riesgo elevado de alucinación y de generar contenido incoherente o sesgado, propio de un modelo de 130M parámetros entrenado con 10 TPP.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés puede ser deficiente.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de usarlo en producción.
- No incluye estado del optimizador, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Requiere un cargador propio (`model.py`) y no es compatible directamente con `AutoModel` de Transformers, lo que complica su integración en pipelines estándar.
- Las métricas publicadas son de modelado de lenguaje (BPB/pérdida), no de precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.

## Enlaces

- Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-128m-10tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
