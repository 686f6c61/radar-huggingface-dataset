# davidheineman/nanogpt-ladder-v3-math-heavy-8m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 8M 100TPP es un modelo de lenguaje de tipo base (pretraining puro) desarrollado por davidheineman dentro de la coleccion NanoGPT Ladder v3. Se trata de un checkpoint de investigacion de escala muy reducida, con 8.011.776 parametros, entrenado sobre 801.177.600 tokens de prediccion (100 tokens por parametro) durante 24.450 pasos de optimizacion con semilla 1337. Su proposito no es la produccion, sino servir como punto de medicion reproducible dentro de una escalera de modelos que estudia el efecto del presupuesto de tokens y de la composicion del dataset en el entrenamiento.

El modelo emplea una arquitectura GPT clasica de tipo decoder-only con 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y una longitud de contexto de 1.024 tokens. La variante "math-heavy" sigue la receta congelada del pool Dolma3 Dolmino, asignando el 80% de la mezcla al dominio matematico nombrado. Los pesos se publican en float32 original, antes de cualquier fase de tiny-rl, SFT o RL, por lo que debe usarse con prompts de texto plano.

Su relevancia es metodologica: permite reproducir y auditar el efecto de mezclas de datos sesgadas hacia matematicas en modelos diminutos, con metadatos que registran revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256. No es un modelo util para tareas reales de usuario final, sino una pieza de un experimento controlado de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (NanoGPT) |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity` y `run`); no compatible con AutoModel de Transformers |

Detalles adicionales de configuracion: 8 capas, `n_embd` 128, 4 cabezas de atencion, embeddings atados entre entrada y salida, RoPE, tokenizador GPT-2 (tiktoken) con vocabulario rellenado de 50.304 entradas. Entrenamiento: 801.177.600 tokens de prediccion, 24.450 pasos de optimizacion, semilla 1337. Dataset: `allenai/dolma3_dolmino_pool` con mezcla math-heavy (80% al dominio nombrado).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de tipo GPT, sin mecanismos de mezcla de expertos ni atencion lineal. Usa atencion multi-cabeza estandar con 4 cabezas sobre una dimension de 128, embeddings atados entre la matriz de entrada y la proyeccion de salida, y codificacion posicional rotatoria (RoPE). La implementacion es la de NanoGPT, con un cargador propio (`model.py`) que no depende de `transformers.AutoModel`.

El preentrenamiento se realizo sobre el pool Dolma3 Dolmino siguiendo una receta de mezcla congelada. En la variante math-heavy, el 80% de los tokens corresponde al dominio matematico designado, lo que sesga fuertemente la distribucion de entrenamiento hacia ese tipo de contenido. El checkpoint publicado es el punto final del preentrenamiento, previo a cualquier condicionamiento tiny-rl, SFT o RL, y no incluye estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior pero no para reanudar el entrenamiento original. El repositorio incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256, y `results.json` con el registro de finalizacion y las evaluaciones finales.

## Capacidades

- Generacion de texto autoregresiva basica con prompts de texto plano.
- Modelado de lenguaje y continuacion de secuencias cortas (hasta 1.024 tokens de contexto).
- Decodificacion greedy (`temperature=0`) y con muestreo por temperatura.
- Ejecucion en CPU, CUDA y Apple MPS mediante `device=auto`.
- Capacidad de fine-tuning posterior (el checkpoint no incluye estado del optimizador).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo thinking.
- Capacidades multilingues: no documentadas; el tokenizador es GPT-2 y el dataset de entrenamiento no se detalla por idioma.

## Casos de uso

- Reproduccion de experimentos de escalado: sirve como punto de la escalera NanoGPT Ladder v3 para estudiar como varia la perdida (BPB/loss) con el presupuesto de tokens y la mezcla de datos, comparando con los demas checkpoints de la coleccion.
- Estudio del sesgo de dominio en preentrenamiento: al asignar el 80% de la mezcla a matematicas, permite medir el efecto de una distribucion fuertemente sesgada en un modelo de 8M de parametros frente a mezclas equilibradas.
- Baseline para fine-tuning educativo: su tamano (8M) y su cargador simple en PyTorch lo hacen adecuado para ensenar pipelines de SFT o RLHF en entornos con recursos minimos.
- Pruebas de infraestructura de inferencia: al caber en CPU y en cualquier GPU consumer, se puede usar para validar scripts de generacion, tokenizacion y carga de checkpoints antes de escalar a modelos mayores.
- Investigacion sobre tokenizadores: permite analizar el comportamiento de un vocabulario GPT-2 rellenado a 50.304 entradas en un modelo diminuto y con contexto corto.
- Auditoria de reproducibilidad: los metadatos con revisiones de fuentes, pesos de mezcla y SHA256 permiten verificar la trazabilidad completa del entrenamiento en estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y no se proporcionan cifras concretas en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8M de parametros); practicamente despreciable.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1050 o superior; tambien funciona en Apple MPS y en CPU.
- Cabe en cualquier GPU consumer y en practicamente cualquier entorno con al menos unos cientos de MB de memoria libre.
- Opciones de despliegue: carga nativa mediante `model.py` y `generate.py` incluidos en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el modelo no es compatible con `transformers.AutoModel`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la generacion en GPU consumer deberia ser del orden de miles de tokens por segundo, aunque no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 8M 100TPP | 8,0 M | 1.024 | no disponible | PyTorch nativo | Mezcla math-heavy (80% dominio), 100 TPP, semilla 1337 |
| Otros checkpoints de NanoGPT Ladder v3 | ~8 M (segun variante) | 1.024 | no disponible | PyTorch nativo | Misma receta de escalera con distintas mezclas y presupuestos de tokens |
| nanoGPT (Karpathy) | ~10-124 M (configurable) | 1.024 (config. tipica) | MIT (codigo) | PyTorch nativo | Implementacion de referencia; no es un checkpoint concreto |
| GPT-2 small | 124 M | 1.024 | MIT (pesos OpenAI) | safetensors/PyTorch | Modelo base de referencia de la misma familia; 15x mas grande |

La comparacion con modelos de la misma categoria se limita a otros checkpoints de la propia escalera y a implementaciones de referencia, ya que no se dispone de datos de rendimiento publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Modelo de investigacion de 8M de parametros: su calidad de generacion es muy limitada y no es apto para uso en produccion ni para tareas reales de usuario final.
- Es un modelo base sin SFT ni RLHF: no sigue instrucciones, no responde a formatos de chat y debe usarse con prompts de texto plano.
- Contexto maximo de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgo de dominio severo: el 80% de la mezcla de entrenamiento se destina a matematicas, lo que puede degradar la generacion de texto general frente a mezclas equilibradas.
- Riesgo elevado de alucinacion y de texto incoherente por la escala reducida del modelo.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- No incluye estado del optimizador, por lo que no permite reanudar el entrenamiento original.
- Requiere cargador propio (`model.py`); no es compatible con las herramientas estandar de Transformers ni con formatos GGUF.
- Las evaluaciones publicadas son de perdida (BPB/loss), no de precision en tareas, por lo que no deben interpretarse como capacidad de resolucion de problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-8m-100tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
