# davidheineman/nanogpt-ladder-v3-chat-heavy-8m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · chat-heavy · 8M · 30 TPP es un modelo de lenguaje de escala minima (8.011.776 parametros) desarrollado por davidheineman como parte de una serie de experimentos controlados de preentrenamiento denominada NanoGPT Ladder v3. No es un modelo destinado a produccion ni a uso general, sino un punto de control intermedio ("completed pretraining endpoint") dentro de una escalera de entrenamientos independientes que varian el presupuesto de tokens y la composicion del dataset. Cada ejecucion se entrena de forma aislada con una semilla fija (1337 en este caso) y un presupuesto de 30 tokens por parametro (TPP), lo que en este caso equivale a 240.353.280 tokens de prediccion repartidos en 7.335 pasos del optimizador.

La arquitectura es un transformer decoder-only estilo GPT-2 con 8 capas, ancho 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, con una ventana de contexto de 1.024 tokens. El modelo se distribuye en pesos float32 originales y un loader propio en PyTorch (`model.py`), sin integracion con Transformers AutoModel. La mezcla "chat-heavy" sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas "heavy" asignan un 80% de la masa al dominio nombrado.

Su relevancia es metodologica: sirve para estudiar el efecto de la composicion de datos y del presupuesto de tokens en modelos de escala diminuta, no para resolver tareas reales. Los pesos son anteriores a cualquier acondicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base que solo completa texto a partir de prompts planos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 8.011.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32 original; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32); no se distribuye en safetensors ni GGUF |

Otros datos tecnicos: 8 capas, `n_embd` 128, 4 cabezas de atencion, vocabulario 50.304 (padded), tokenizador GPT-2, 7.335 pasos del optimizador, 240.353.280 tokens de prediccion, semilla 1337. El repositorio incluye `metadata.json` (revisiones exactas de fuentes, pesos de mezcla y SHA256) y `results.json` (registro de finalizacion y evaluaciones finales).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico con atencion multi-cabeza, 8 capas y 4 cabezas por capa, dimension de embedding 128 y embeddings de entrada y salida atados. Usa codificaciones posicionales rotatorias (RoPE) y el tokenizador GPT-2 con vocabulario rellenado hasta 50.304 entradas. La implementacion es la de NanoGPT, con loader propio (`model.py`) y script de generacion (`generate.py`) que seleccionan dispositivo automaticamente entre CUDA, Apple MPS y CPU.

El preentrenamiento se realizo sobre el pool `allenai/dolma3_dolmino_pool` con la receta congelada de mezclas Dolmino; la variante "chat-heavy" asigna un 80% de la mezcla al dominio conversacional. El presupuesto es de 30 tokens por parametro (240.353.280 tokens en total) y cada presupuesto de la escalera corresponde a una ejecucion entrenada de forma independiente con semilla 1337. No se documenta uso de RLHF, DPO ni SFT: los pesos son el punto final del preentrenamiento puro. Las evaluaciones finales registradas son medidas de lenguaje (BPB y perdida), no precision en tareas.

## Capacidades

- Generacion de texto autoregresiva basica: completa prompts planos con decodificacion greedy (`temperature=0`) o muestreo con temperatura.
- Modelado de lenguaje a nivel de token con contexto de 1.024 tokens; util para medir perplejidad y BPB.
- No dispone de modo "thinking", vision, audio ni capacidades multimodales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el tokenizador es GPT-2 y no se especifica la composicion linguistica del dataset.
- Punto de partida para fine-tuning posterior: el checkpoint admite entrenamiento adicional (sin estado del optimizador incluido).

## Casos de uso

- Experimentacion academica sobre mezclas de datos: reproducir la receta "chat-heavy" al 80% sobre Dolmino y comparar BPB frente a otras mezclas de la misma escalera para aislar el efecto de la composicion del corpus.
- Estudio de leyes de escala en modelos diminutos: usar los puntos de la escalera a distintos TPP (este es 30 TPP) para ajustar curvas de perdida frente a tokens vistos.
- Baseline de referencia en investigacion de preentrenamiento: servir como control de 8M parametros en experimentos que evaluan cambios de arquitectura, tokenizador u objetivo.
- Pruebas de infraestructura de entrenamiento: validar pipelines de datos, checkpoints y scripts de generacion con un modelo que entrena y evalua en minutos.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer GPT-2 a escala manejable, inspeccionando pesos y activaciones.
- Generacion de texto de juguete en local: completar frases cortas en CPU o Apple MPS para demos sin requisitos de hardware.
- Punto de partida para fine-tuning de dominio: adaptar el checkpoint a una tarea concreta con un corpus pequeno, dado que se distribuyen los pesos y el loader.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y no se proporcionan cifras concretas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (unos 32 MB de pesos mas overhead de activaciones y del tokenizador); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo funciona en CPU y Apple MPS ademas de CUDA. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB libres (por ejemplo GTX 1050, RTX 2060 o superiores).
- Opciones de despliegue: el loader propio en PyTorch (`model.py` + `generate.py`) y el comando `uv run python generate.py` documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF ni safetensors no es directamente compatible con esos runners sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (8M parametros, contexto 1.024) se espera inferencia en milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 8M 30 TPP (este) | 8,0M | 1.024 | no disponible | Hugging Face, PyTorch nativo | Punto de una escalera de preentrenamiento controlada |
| Otros puntos de NanoGPT Ladder v3 | variable (segun ejecucion) | 1.024 | no disponible | Coleccion en Hugging Face | Misma receta, distinto presupuesto de tokens o mezcla |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos publicados) | Hugging Face, Transformers | Referencia historica de la misma familia arquitectonica, 15x mas grande |
| Modelos GPT-2 diminutos de NanoGPT (Karpathy) | ~10M-124M | 1.024 | MIT (codigo) | Repositorio nanoGPT | Implementacion de referencia en la que se basa este modelo |

No se dispone de datos de rendimiento comparativo (benchmarks) para este modelo, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Escala minima: con 8M parametros y 240M tokens vistos, la calidad de generacion es muy limitada; no es apto para tareas de produccion.
- Modelo base sin alineacion: los pesos preceden a SFT y RL, por lo que no siguen instrucciones ni mantienen formato conversacional; deben usarse prompts de texto plano.
- Riesgo elevado de alucinacion y de texto incoherente mas alla de frases cortas, inherente a su tamano y presupuesto de entrenamiento.
- Ventana de contexto corta (1.024 tokens) que limita conversaciones multi-turno y documentos largos.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la composicion del dataset condicionan el comportamiento linguistico.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Pesos solo en PyTorch float32 con loader propio; no hay safetensors, GGUF ni integracion con Transformers, lo que complica el despliegue en stacks estandar.
- Las metricas publicadas (BPB, perdida) no miden capacidad de resolver tareas; no deben interpretarse como precision.
- No incluye estado del optimizador, por lo que reanudar el entrenamiento exacto no es posible desde este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-8m-30tpp-seed-1337
- Coleccion de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio de referencia NanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
