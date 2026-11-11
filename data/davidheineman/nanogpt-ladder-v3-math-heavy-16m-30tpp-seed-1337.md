# davidheineman/nanogpt-ladder-v3-math-heavy-16m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 16M 30TPP es un modelo de lenguaje base de escala muy reducida (15,85 millones de parámetros) desarrollado por David Heineman dentro de la serie experimental NanoGPT Ladder v3. No es un modelo pensado para producción, sino un punto de control de preentrenamiento completado que forma parte de un estudio sistemático sobre el efecto de la composición del dataset y el presupuesto de tokens en modelos pequeños. El modelo se entrenó sobre el pool Dolma3 Dolmino de AllenAI con una mezcla "math-heavy" que asigna el 80% de los tokens a un dominio matemático concreto.

La arquitectura es un transformer decoder-only clásico estilo GPT-2: 14 capas, anchura 192, 6 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. La longitud de contexto es de 1.024 tokens. El entrenamiento consumió 475.529.216 tokens de predicción en 14.512 pasos de optimizador con semilla 1337, lo que corresponde a 30 tokens por parámetro (TPP).

Su relevancia es metodológica más que práctica: permite estudiar cómo una mezcla de datos sesgada hacia matemáticas afecta a las curvas de pérdida y a las evaluaciones de lenguaje en un régimen de cómputo mínimo. Los pesos son anteriores a cualquier condicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base que solo completa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (14 capas, width 192, 6 cabezas, RoPE, embeddings atados) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; sin versiones GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con `model`, `config`, `identity` y `run`), cargado con `model.py` propio, no compatible con `AutoModel` de Transformers |
| Vocabulario | 50.304 (tokenizador GPT-2 con padding) |
| Tokens de entrenamiento | 475.529.216 tokens de predicción (30 TPP) |
| Pasos de optimizador | 14.512 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla math-heavy, 80% al dominio nombrado) |

## Arquitectura y entrenamiento

El modelo sigue la implementación NanoGPT de GPT-2: un transformer decoder-only con atención multi-cabeza estándar, normalización previa a cada bloque, embeddings de entrada y de salida atados y codificación posicional rotatoria (RoPE). La anchura es de 192 dimensiones con 6 cabezas, lo que da 32 dimensiones por cabeza. El vocabulario se rellena hasta 50.304 entradas para alinear con el tokenizador GPT-2, y el contexto máximo es de 1.024 tokens.

El preentrenamiento se realizó sobre el pool Dolma3 Dolmino siguiendo una receta congelada de mezcla de datos. En las mezclas "heavy", el 80% de los tokens se asigna al dominio indicado (en este caso, matemáticas) y el resto se reparte según la receta base. El run consumió 475.529.216 tokens de predicción en 14.512 pasos, con semilla 1337. Los metadatos (`metadata.json`) registran las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256. No se aplicó SFT, RLHF ni DPO: los pesos son el punto final del preentrenamiento y están pensados para usarse con prompts de texto plano.

## Capacidades

- Generación de texto autoregresiva: completado de texto plano a partir de un prompt, con decodificación greedy (`temperature=0`) o con muestreo.
- Modelo base sin instrucciones: no sigue instrucciones ni mantiene formato conversacional; no hay alineación posterior al preentrenamiento.
- Razonamiento matemático incipiente: la mezcla de datos con 80% de dominio matemático busca reforzar patrones numéricos y simbólicos, aunque a esta escala no se puede esperar resolución fiable de problemas.
- Multilingüismo: no documentado; depende de la composición del pool Dolmino, no especificada en la información disponible.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación sobre mezclas de datos: comparar este checkpoint con otros de la misma serie (mismo tamaño y TPP, distinto dominio) para medir el efecto de la proporción math-heavy en la pérdida de validación y en las evaluaciones de lenguaje. Es el uso principal para el que se publica.
- Estudios de escalado a cómputo mínimo: servir de punto de referencia en experimentos de scaling laws para modelos por debajo de 20M de parámetros, donde el coste de entrenamiento es despreciable.
- Docencia y reproducción de pipelines: el repositorio incluye `model.py` y `generate.py`, lo que permite reproducir el flujo completo de carga, tokenización y generación en CPU, CUDA o Apple MPS.
- Fine-tuning de bajo coste: al conservar los pesos atados y no incluir estado del optimizador, el checkpoint admite ajuste fino posterior en una sola GPU consumer para tareas de clasificación o generación acotada.
- Generación de texto de relleno o sintético en pruebas: útil para validar infraestructura de serving (vLLM, TGI, llama.cpp no aplican directamente por el formato nativo; se usaría el loader propio) sin coste de GPU.
- Análisis de sesgos de dominio: estudiar cómo un sesgo fuerte hacia matemáticas afecta a la perplejidad en texto general y a la fluidez fuera del dominio, como caso controlado de desequilibrio de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que `results.json` contiene el registro de finalización y evaluaciones finales, y que las métricas de BPB/loss son evaluaciones de modelo de lenguaje, no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (15,85M parámetros × 4 bytes ≈ 63 MB de pesos, más activaciones y caché KV para 1.024 tokens). Cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU, Apple MPS y cualquier GPU CUDA. Una RTX 4090 o A100 estarían enormemente sobredimensionadas.
- GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con soporte de `device=auto` (CUDA, MPS, CPU). No es compatible con `AutoModel` de Transformers ni se publican pesos GGUF, por lo que vLLM, TGI, Ollama y llama.cpp no son aplicables sin conversión manual.
- Latencia y throughput: no disponibles. Por el tamaño, la latencia sería de milisegundos por token en CPU y prácticamente despreciable en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 16M 30TPP | 15,85M | 1.024 | 475,5M (30 TPP) | no disponible | Hugging Face, pesos PyTorch nativos |
| NanoGPT Ladder v3 (otros dominios, misma serie) | ~15,85M | 1.024 | 475,5M (30 TPP) | no disponible | Colección en Hugging Face del mismo autor |
| GPT-2 small | 124M | 1.024 | ~40.000M aprox. (no confirmado en la información) | MIT (según publicación original) | Hugging Face, Transformers, GGUF |
| Modelos tipo TinyLlama / Qwen2.5-0.5B | 500M–1.100M | 2.048–32.768 | billones | Apache 2.0 / MIT | Hugging Face, múltiples runtimes |

La comparación directa más útil es con los demás checkpoints de la misma serie NanoGPT Ladder v3, que comparten tamaño, TPP y semilla pero difieren en la mezcla de datos. Frente a GPT-2 small o modelos de 0,5B, este modelo es dos o tres órdenes de magnitud menor en cómputo y no es competitivo en calidad; su valor es experimental.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene diálogo y puede generar texto incoherente o repetitivo. No debe usarse como asistente.
- Escala muy reducida: con 15,85M de parámetros y 475M tokens vistos, la calidad de generación es muy limitada; no es apto para tareas de producción.
- Sesgo de dominio: la mezcla math-heavy (80% al dominio matemático) puede degradar la fluidez en texto general y en otros dominios.
- Riesgo de alucinación: alto en cualquier uso que requiera factualidad, dado que no hay alineación ni datos de instrucciones.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas: no documentados; no se garantiza cobertura multilingüe.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Formato propietario: requiere el `model.py` del repositorio; no es directamente interoperable con el ecosistema Transformers, vLLM o llama.cpp.
- Sin estado de optimizador: el checkpoint no incluye el estado del optimizador, lo que limita la reanudación exacta del entrenamiento (aunque permite fine-tuning desde cero del optimizador).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-16m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (implementación de referencia): https://github.com/karpathy/nanoGPT
