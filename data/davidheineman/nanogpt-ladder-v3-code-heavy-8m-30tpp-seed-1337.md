# davidheineman/nanogpt-ladder-v3-code-heavy-8m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 8M · 30 TPP es un modelo de lenguaje base de escala muy reducida (8.011.776 parámetros) entrenado desde cero por el autor independiente davidheineman como parte de la serie NanoGPT Ladder v3. No es un modelo destinado a producción, sino un punto de control de preentrenamiento completado dentro de un experimento controlado de escalado: cada presupuesto de tokens corresponde a una ejecución entrenada de forma independiente, con semilla fija (1337) y una receta de mezcla de datos congelada. El objetivo es servir como material de estudio reproducible para investigar cómo afectan el tamaño, la composición del dataset y el número de tokens por parámetro (TPP) al rendimiento de un transformer pequeño.

El modelo emplea una arquitectura transformer decoder-only tipo GPT con 8 capas, anchura 128, 4 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas. Se entrenó sobre 240.353.280 tokens de predicción en 7.335 pasos de optimizador, con una mezcla "code-heavy" que asigna el 80% de los datos al dominio de código según la receta del pool Dolma3 Dolmino de AllenAI.

Su relevancia es metodológica, no funcional: los pesos son anteriores a cualquier fase de acondicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base que solo completa texto y no responde a instrucciones. La ficha se redacta con la información disponible en la model card y los metadatos de Hugging Face, que es escasa en varios apartados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT), con RoPE y embeddings atados |
| Parámetros totales | 8.011.776 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos originales en float32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio; no compatible con `AutoModel` de Transformers |

Otros datos técnicos: 8 capas, anchura 128, 4 cabezas de atención, vocabulario rellenado de 50.304, tokenizador GPT-2 (tiktoken), 240.353.280 tokens de predicción, 7.335 pasos de optimizador, semilla 1337. El repositorio incluye `model.py`, `generate.py`, `metadata.json` (revisiones exactas de las fuentes, pesos de mezcla y SHA256) y `results.json` (registro de finalización y evaluaciones finales).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de estilo GPT, con 8 capas, dimensión de modelo 128 y 4 cabezas de atención. Usa embeddings atados entre la entrada y la cabeza de salida, codificación posicional rotatoria (RoPE) y el tokenizador GPT-2 con un vocabulario rellenado hasta 50.304 entradas. El contexto máximo es de 1.024 tokens. El checkpoint conserva los pesos de embedding y salida atados y no incluye estado del optimizador, por lo que sirve para inferencia y para afinamiento posterior, pero no para reanudar el entrenamiento tal cual.

El entrenamiento consistió en un preentrenamiento de 240.353.280 tokens de predicción repartidos en 7.335 pasos de optimizador, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI (`allenai/dolma3_dolmino_pool`); en las variantes "code-heavy" el 80% de la mezcla se asigna al dominio nombrado, en este caso código. El archivo `metadata.json` documenta las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256. No se documentan fases de RLHF, DPO ni SFT: los pesos son el punto final del preentrenamiento y preceden al acondicionamiento tiny-rl. Las mediciones finales de BPB y pérdida son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas.

## Capacidades

- Generación de texto autoregresiva: completado de secuencias a partir de un prompt de texto plano, mediante decodificación greedy (`temperature=0`) o con muestreo.
- Modelado de lenguaje puro: el modelo es un base model sin ajuste por instrucciones, por lo que no sigue directrices ni mantiene formato conversacional.
- Completado de código: la mezcla de entrenamiento asigna el 80% al dominio de código, de modo que su especialización relativa es la generación y continuación de fragmentos de código.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multimodales (ni visión, ni audio).
- Sin modo "thinking" ni razonamiento explícito.
- Capacidades multilingües: no documentadas.
- Inferencia en CPU, CUDA y Apple MPS mediante `device=auto`.

## Casos de uso

- Investigación sobre escalado de modelos: el modelo sirve como punto de datos en la curva de escalado de la serie NanoGPT Ladder v3, permitiendo estudiar el efecto de 30 tokens por parámetro con mezcla code-heavy frente a otras configuraciones de la misma familia.
- Estudio de mezclas de datos: al fijar la receta Dolma3 Dolmino y variar la proporción de código (80% en esta variante), permite aislar el impacto de la composición del dataset en el rendimiento de un transformer pequeño.
- Reproducibilidad de experimentos: la semilla fija (1337), el registro de revisiones y los hashes SHA256 en `metadata.json` permiten replicar el entrenamiento y verificar la procedencia de los datos.
- Docencia y formación: con 8 millones de parámetros y un cargador PyTorch propio y legible (`model.py`, `generate.py`), es adecuado para explicar el funcionamiento interno de un transformer GPT sin la complejidad de un modelo grande.
- Pruebas de infraestructura de inferencia: su tamaño mínimo permite validar pipelines de generación en CPU, CUDA o MPS y probar utilidades de tokenización con tiktoken antes de escalar a modelos mayores.
- Experimentos de afinamiento: al conservar los pesos atados y no incluir estado del optimizador, el checkpoint se puede usar como inicialización para fine-tuning en tareas pequeñas de código o texto dentro de un entorno de investigación.
- Generación de código a pequeña escala en entornos controlados: como continuación de fragmentos en tareas de autocompletado muy acotadas, siempre asumiendo la calidad limitada de un modelo de 8M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que `results.json` contiene el registro de finalización y las evaluaciones finales, medidas en BPB y pérdida de modelado de lenguaje, pero no se proporcionan cifras concretas ni comparaciones con otros modelos en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32, dado que el modelo tiene 8.011.776 parámetros (unos 32 MB de pesos) más las activaciones de una ventana de 1.024 tokens y un vocabulario de 50.304.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Funciona en GPU integradas y en CPU.
- Cabe holgadamente en cualquier GPU de consumo, incluida la gama más baja, y también en Apple Silicon vía MPS.
- Opciones de despliegue: el modelo usa un cargador propio (`model.py` y `generate.py`) y no es compatible con `AutoModel` de Transformers; por tanto, no se puede desplegar directamente con vLLM, TGI u Ollama sin adaptación. La vía documentada es PyTorch nativo con `uv` y `huggingface_hub` para la descarga.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 8M 30 TPP (este modelo) | 8.011.776 | 1.024 | no disponible | Hugging Face, cargador propio |
| Otras variantes de NanoGPT Ladder v3 | no disponible en la información | no disponible | no disponible | colección en Hugging Face |
| NanoGPT original (Karpathy) | ~124M en su configuración de referencia | 1.024 | MIT (según el proyecto original) | GitHub y Hugging Face |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face, Transformers |

La comparación con alternativas de la misma categoría queda limitada porque la información disponible solo describe este checkpoint y remite a la colección de modelos completados de NanoGPT Ladder v3. No se dispone de datos de rendimiento de ninguno de ellos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a preguntas ni sigue directrices; solo completa texto a partir de un prompt.
- Escala muy reducida (8M de parámetros): la calidad de generación será limitada y propensa a incoherencias y repeticiones, especialmente fuera del dominio de código.
- Riesgo elevado de alucinación y de contenido factualmente incorrecto, inherente a un modelo de este tamaño y a su naturaleza de preentrenamiento.
- Contexto máximo de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la mezcla de datos no garantizan un comportamiento multilingüe fiable.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Sesgos conocidos: no documentados, pero al entrenarse sobre el pool Dolma3 Dolmino hereda los sesgos presentes en esos datos.
- No compatible con `AutoModel` de Transformers ni con servidores de inferencia estándar (vLLM, TGI, Ollama) sin adaptación del cargador.
- Las métricas publicadas son de modelado de lenguaje (BPB y pérdida), no de precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.
- No incluye estado del optimizador, por lo que no permite reanudar el entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-8m-30tpp-seed-1337
- Colección de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
