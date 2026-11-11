# davidheineman/nanogpt-ladder-v3-code-heavy-128m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 128M · 10 TPP es un modelo base de lenguaje de 130.646.016 parámetros entrenado desde cero por David Heineman como parte de la serie NanoGPT Ladder v3, un conjunto de ejecuciones de preentrenamiento controladas que varían la mezcla de datos y el presupuesto de tokens. El modelo emplea una arquitectura transformer tipo GPT-2 (13 capas, anchura 768, 12 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2) con una ventana de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas.

La particularidad del checkpoint es su mezcla de datos "code-heavy": siguiendo la receta congelada del pool Dolma3 Dolmino, el 80 % del contenido se asigna al dominio de código, mientras que el resto se reparte según la mezcla base. El modelo consumió 1.306.460.160 tokens de predicción en 39.870 pasos de optimizador (10 tokens por parámetro, TPP) con semilla 1337. Los pesos son el punto final del preentrenamiento, anteriores a cualquier etapa de tiny-rl, SFT o RL, por lo que debe usarse con prompts de texto plano y no como asistente conversacional.

Su relevancia es fundamentalmente experimental: sirve para estudiar cómo afecta una mezcla de datos sesgada hacia código al rendimiento en lenguaje natural y en generación de código a escala pequeña, y como punto de partida reproducible para fine-tuning. No está pensado como modelo de producción ni compite con modelos instructivos de su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (13 capas, 768 de anchura, 12 cabezas, RoPE, embeddings atados) |
| Parametros totales | 130.646.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican GGUF ni otras variantes) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity`, `run`); no compatible con AutoModel de Transformers |

Otros datos técnicos: vocabulario rellenado de 50.304 entradas, tokenizador GPT-2 (tiktoken), tamaño del repositorio de 0,5 GB, 39.870 pasos de optimizador, 1.306.460.160 tokens de predicción (10 TPP), semilla 1337. El repositorio incluye `model.py`, `generate.py`, `metadata.json` (revisiones exactas de fuentes, pesos de mezcla y SHA256) y `results.json` (registro de finalización y evaluaciones finales).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de estilo GPT-2 con 13 capas, dimensión de modelo 768 y 12 cabezas de atención. Usa embeddings de entrada y de salida atados, codificación posicional rotatoria (RoPE) en lugar de posiciones aprendidas y el tokenizador GPT-2 con un vocabulario rellenado a 50.304 entradas para eficiencia computacional. El contexto máximo es de 1.024 tokens. No incorpora mecanismos de atención lineal, decodificación especulativa ni arquitecturas híbridas: es una implementación NanoGPT clásica con su propio cargador, no compatible con `AutoModel` de Transformers.

El entrenamiento consistió en 39.870 pasos de optimizador sobre 1.306.460.160 tokens de predicción, equivalentes a 10 tokens por parámetro (10 TPP). Los datos provienen del pool `allenai/dolma3_dolmino_pool`, con una mezcla "code-heavy" en la que el 80 % del contenido se asigna al dominio de código y el 20 % restante sigue la receta base congelada. Cada presupuesto de tokens de la serie NanoGPT Ladder v3 corresponde a una ejecución entrenada de forma independiente con semilla 1337. No se aplicaron etapas de SFT, RLHF ni DPO: los pesos son el punto final del preentrenamiento, y el propio autor indica que preceden a la condicionación tiny-rl. El checkpoint no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning, pero no para reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano (modelo base, sin formato de instrucciones).
- Modelado de lenguaje y cálculo de perplejidad/BPB sobre texto y código.
- Generación de código: la mezcla de datos con 80 % de código favorece la producción de fragmentos sintácticamente plausibles en lenguajes de programación.
- Capacidad de continuación de contexto corto (hasta 1.024 tokens).
- Punto de partida para fine-tuning supervisado y experimentos de alineación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidades multilingües no documentadas; el tokenizador GPT-2 está sesgado hacia inglés.

## Casos de uso

- Investigación sobre mezclas de datos: comparar este checkpoint code-heavy con las variantes de la misma serie (mismo tamaño y presupuesto de tokens) para medir el efecto del sesgo hacia código en evaluaciones de lenguaje natural y de código.
- Fine-tuning supervisado experimental: usar los pesos como inicialización para tareas concretas de generación de código o texto, aprovechando que el checkpoint no incluye estado del optimizador y es ligero (0,5 GB).
- Generación de código asistida en entornos de investigación: completar fragmentos o funciones cortas en un contexto de 1.024 tokens, adecuado para snippets y no para ficheros completos.
- Reproducibilidad de preentrenamiento: el `metadata.json` con revisiones exactas y SHA256 permite replicar la mezcla de datos y auditar el origen del corpus Dolma3 Dolmino.
- Evaluación de tokenizadores y arquitecturas a pequeña escala: servir como baseline de 128M parámetros en estudios de scaling laws o de técnicas de atención.
- Docencia y prototipado: ejecutable en CPU, Apple MPS o CUDA con el script incluido, lo que facilita demostraciones de preentrenamiento y decodificación greedy en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que `results.json` contiene "final BPB/loss measurements" y advierte explícitamente de que son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,5 GB para los pesos (130,6 M de parámetros × 4 bytes), más activaciones y caché KV para 1.024 tokens, lo que en la práctica se mantiene por debajo de 1-2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon vía MPS y en CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para reentrenar o hacer fine-tuning a gran escala.
- Despliegue: el repositorio incluye `generate.py` y `model.py` para PyTorch nativo con selección automática de dispositivo (`device=auto`). No es compatible con vLLM, TGI, llama.cpp ni Ollama sin conversión previa, dado que usa un cargador propio y no `AutoModel`.
- Latencia y throughput: no disponibles. Para un modelo de este tamaño en GPU de consumo se espera una latencia por token muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mezcla de datos | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 128M 10TPP (este) | 130,6 M | 1.024 | 80 % código (Dolma3 Dolmino) | no disponible | PyTorch nativo |
| Otras variantes de NanoGPT Ladder v3 (misma serie) | ~130 M | 1.024 | mezclas alternativas de la misma receta | no disponible | PyTorch nativo |
| GPT-2 small (referencia arquitectónica) | 124 M | 1.024 | WebText | MIT (según release original) | PyTorch / safetensors |
| Modelos instructivos pequeños de 0,1-0,5 B | variable | variable | variable + SFT/RLHF | variable | safetensors / GGUF |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no se publican métricas de este checkpoint ni de las otras variantes de la serie en la información proporcionada. La comparación más directa es interna a la propia serie NanoGPT Ladder v3, donde el mismo tamaño y presupuesto de tokens permiten aislar el efecto de la mezcla de datos.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones, no mantiene formato conversacional y no debe desplegarse como asistente sin fine-tuning.
- Riesgo alto de alucinación y de generar texto incoherente o código no funcional, especialmente fuera de los patrones vistos en el corpus.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos, repositorios completos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 y la mezcla de datos favorecen el inglés, con rendimiento esperablemente bajo en castellano.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del autor y del corpus Dolma3 Dolmino subyacente.
- Los sesgos del corpus de preentrenamiento (Dolma3 Dolmino) se heredan sin mitigación; no se documentan evaluaciones de sesgo ni de seguridad.
- El modelo no es compatible con el ecosistema Transformers estándar, lo que complica su integración en pipelines existentes y requiere el cargador propio incluido en el repositorio.
- El checkpoint no incluye estado del optimizador; el fine-tuning parte de los pesos finales, no de una reanudación exacta del entrenamiento.
- Creado y actualizado en noviembre de 2026 con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-128m-10tpp-seed-1337
- Colección de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
