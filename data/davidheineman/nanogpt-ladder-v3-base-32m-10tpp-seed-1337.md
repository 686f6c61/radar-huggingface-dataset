# davidheineman/nanogpt-ladder-v3-base-32m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 32M es un modelo de lenguaje de tipo GPT entrenado desde cero como parte de la serie NanoGPT Ladder v3, un experimento de escalado controlado de preentrenamiento. Lo desarrolla davidheineman y se publica como punto final de una ejecucion independiente con un presupuesto fijo de tokens (10 tokens por parametro, TPP). El modelo tiene 32.071.680 parametros y se ha entrenado sobre 320.700.416 tokens de prediccion en 9.787 pasos de optimizacion, con semilla 1337.

Se trata de un modelo base puro: sus pesos preceden a cualquier fase de condicionamiento tiny-rl, SFT o RL, por lo que debe usarse con prompts de texto plano y no esta ajustado para seguir instrucciones ni para conversar. Su interes es fundamentalmente de investigacion: permite estudiar la relacion entre presupuesto de computo, mezcla de datos y calidad del modelo en un rango de tamano pequeno, con metadatos reproducibles (revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256).

La arquitectura es un transformer decoder-only de 13 capas, anchura 320 y 5 cabezas de atencion, con embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. El vocabulario esta rellenado hasta 50.304 entradas. Los pesos se distribuyen en formato PyTorch nativo (float32 original) con cargador propio, no compatible con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 32.071.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, entrenado sobre Dolma3 Dolmino pool; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), float32 original; cargador propio (`model.py`), no Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico al estilo GPT-2: 13 capas, dimension de modelo 320, 5 cabezas de atencion, embeddings de entrada y de salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. La ventana de contexto es de 1.024 tokens. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior, pero no para reanudar el entrenamiento de forma exacta.

El preentrenamiento se realizo sobre el pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`) siguiendo una receta de mezcla congelada. Cada ejecucion de la escalera corresponde a un presupuesto de tokens independiente; en este caso, 10 TPP, es decir, 320.700.416 tokens de prediccion en 9.787 pasos de optimizacion. Las mezclas "heavy" asignan el 80% del presupuesto al dominio nombrado. El archivo `metadata.json` documenta las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256, lo que facilita la reproducibilidad. No se menciona en la informacion disponible el uso de RLHF, DPO ni SFT; de hecho, el autor indica explicitamente que estos pesos son anteriores a esas fases.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, con decodificacion greedy (`temperature=0`) o por muestreo con temperatura.
- Modelado de lenguaje puro: el modelo esta entrenado unicamente con el objetivo de prediccion del siguiente token.
- Finalizacion de texto y continuacion de secuencias cortas dentro de la ventana de 1.024 tokens.
- Capacidad de servir como punto de partida para fine-tuning supervisado o experimentos de investigacion.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), vision, audio ni otras modalidades.
- No se declaran capacidades multilingues especificas; el tokenizador es GPT-2 y el corpus es Dolma3 Dolmino.
- No esta alineado para seguir instrucciones ni para mantener conversaciones multi-turno.

## Casos de uso

- Investigacion sobre escalado de preentrenamiento: el modelo sirve como punto de medida en una escalera de presupuestos de tokens (TPP) para estudiar como evoluciona la perdida (BPB/loss) con el computo, manteniendo fija la receta de datos.
- Reproduccion de experimentos: gracias a `metadata.json` con revisiones, pesos de mezcla y SHA256, se puede replicar el entrenamiento y comparar resultados entre semillas.
- Baseline para ablaciones de mezcla de datos: al seguir la receta congelada de Dolma3 Dolmino, permite comparar el efecto de variar dominios o proporciones sobre un modelo pequeno y barato de entrenar.
- Fine-tuning academico: su tamano (32M parametros) permite ajustarlo en una sola GPU consumer para tareas de clasificacion, generacion condicionada o estudios de olvido catastrofico.
- Pruebas de infraestructura y pipelines de entrenamiento: es util para validar codigo de preprocesado, tokenizacion, checkpoints y evaluacion antes de escalar a modelos mayores.
- Demostraciones educativas de modelado de lenguaje: su naturaleza GPT-2 minimalista y el codigo incluido (`model.py`, `generate.py`) lo hacen adecuado para explicar el funcionamiento interno de un transformer decoder-only.
- Generacion de texto creativo sin instrucciones: continuaciones de texto cortas en entornos controlados donde no se requiere alineacion ni seguimiento de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene el registro original de finalizacion y las evaluaciones finales, y advierte que las medidas de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 32M parametros en float32, los pesos ocupan aproximadamente 128 MB; en float16, unos 64 MB.
- GPU recomendadas: cualquier GPU con suficiente memoria, incluidas RTX 3060, RTX 4090, A100 o H100; tambien funciona en CPU y en Apple MPS (el script `generate.py` selecciona CUDA, MPS o CPU con `device=auto`).
- Cabe holgadamente en cualquier GPU consumer, incluso en las de gama baja, y en CPU para inferencia interactiva.
- Opciones de despliegue: el modelo usa un cargador propio en PyTorch (`model.py` y `generate.py`), por lo que no es compatible directamente con vLLM, TGI ni `AutoModel` de Transformers. No se publican pesos GGUF, por lo que llama.cpp u Ollama no estan soportados de forma nativa sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 32M (este modelo) | 32,07M | 1.024 | no disponible | PyTorch nativo | Base puro, sin SFT/RL, cargador propio |
| GPT-2 small | 124M | 1.024 | MIT | PyTorch, Transformers | Referencia clasica de la misma familia arquitectonica, 4x mas grande |
| Otros modelos de la serie NanoGPT Ladder v3 | variable (por presupuesto TPP) | 1.024 | no disponible | PyTorch nativo | Misma receta y arquitectura, distinto presupuesto de tokens y semilla |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones, no mantiene conversaciones y puede producir continuaciones incoherentes o repetitivas.
- Riesgo alto de alucinacion y de generar contenido factualmente incorrecto; no debe usarse en produccion para tareas que requieran veracidad.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o dialogos extensos.
- Entrenado con solo 320,7M tokens, un presupuesto muy reducido que limita su calidad frente a modelos de mayor escala.
- No se declaran idiomas soportados ni evaluaciones multilingues; el comportamiento fuera del ingles (idioma dominante en muchos corpus web) es incierto.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo requiere un cargador propio y no es compatible con el ecosistema estandar de Transformers, lo que anade friccion de integracion.
- No incluye estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde el checkpoint.
- Las metricas publicadas (BPB/loss) no miden capacidad de resolver tareas; no deben interpretarse como precision en benchmarks.
- No dispone de soporte de tool calling, agentes ni modalidades adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-32m-10tpp-seed-1337
- Coleccion de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
