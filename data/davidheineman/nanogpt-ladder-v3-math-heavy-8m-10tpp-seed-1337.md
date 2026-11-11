# davidheineman/nanogpt-ladder-v3-math-heavy-8m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 8M es un punto de control de preentrenamiento completado dentro de la serie NanoGPT Ladder v3, publicada por el usuario davidheineman en Hugging Face. Se trata de un modelo base de tipo GPT (transformer decoder-only) con 8.011.776 parametros, entrenado sobre 80.117.760 tokens de prediccion (10 TPP, tokens por parametro) durante 2.445 pasos de optimizador con semilla 1337. Forma parte de una escalera de experimentos en la que cada presupuesto de tokens corresponde a un entrenamiento independiente, lo que permite estudiar el efecto del volumen de datos sobre un mismo tamano de modelo.

La particularidad de esta variante es su mezcla de datos "math-heavy": sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas "heavy" asignan un 80% del contenido al dominio nombrado (en este caso, matematicas). El modelo usa 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y una longitud de contexto de 1.024 tokens. Los pesos son float32 originales y se distribuyen en formato PyTorch nativo (`model.pt`), con un cargador propio que no depende de `transformers`.

Es relevante ahora como pieza de investigacion reproducible: documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256 en `metadata.json`, y el registro de finalizacion y evaluaciones en `results.json`. No es un modelo de proposito general ni un asistente instruido: son pesos previos a SFT y RL, pensados para prompts de texto plano y para experimentacion sobre preentrenamiento a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (NanoGPT), 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 8.011.776 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (tokenizador GPT-2; no se declaran idiomas) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity` y `run`) |
| Tokens de entrenamiento | 80.117.760 tokens de prediccion (10 TPP) |
| Pasos de optimizador | 2.445 |
| Semilla | 1337 |
| Vocabulario | 50.304 (padded), tokenizador GPT-2 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla math-heavy, 80% dominio matematicas) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de NanoGPT: 8 capas, dimension de modelo 128, 4 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario ampliado a 50.304 entradas. El contexto maximo es de 1.024 tokens. El checkpoint conserva los pesos de embedding y salida atados y soporta inferencia y fine-tuning posterior, aunque no incluye el estado del optimizador.

El entrenamiento se realizo sobre 80.117.760 tokens de prediccion (10 tokens por parametro) durante 2.445 pasos, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI; en las mezclas "heavy", el 80% del contenido se asigna al dominio nombrado, en este caso matematicas. El repositorio documenta en `metadata.json` las revisiones exactas de las fuentes, los pesos de la mezcla y los hashes SHA256, y en `results.json` el registro de finalizacion y las evaluaciones finales. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano.
- Modelo base de preentrenamiento: no esta instruido ni alineado; no sigue instrucciones de forma fiable.
- Especializacion parcial hacia contenido matematico por la mezcla de datos math-heavy (80% del dominio nombrado).
- Decodificacion greedy disponible (`temperature=0`) y muestreo con temperatura.
- Ejecucion en CUDA, Apple MPS o CPU mediante seleccion automatica de dispositivo (`device=auto`).
- Soporte de fine-tuning posterior sobre el checkpoint nativo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues no documentadas; el tokenizador GPT-2 esta orientado principalmente a ingles.

## Casos de uso

- Investigacion sobre leyes de escalado a pequena escala: el modelo forma parte de una escalera con presupuestos de tokens independientes, lo que permite comparar curvas de perdida (BPB/loss) frente a tokens de entrenamiento con un mismo tamano de modelo.
- Estudio del efecto de la mezcla de datos: al ser una variante math-heavy con pesos documentados, sirve para analizar como el sesgo del dataset hacia matematicas afecta a la perdida en dominios especificos frente a otras mezclas de la misma escalera.
- Reproducibilidad experimental: los hashes SHA256, revisiones de fuentes y pesos de mezcla en `metadata.json` permiten replicar el entrenamiento y auditar el pipeline de datos.
- Prototipado de infraestructura de inferencia: con 8M de parametros cabe en CPU y en cualquier GPU consumer, por lo que es util para validar pipelines de generacion, tokenizacion y despliegue antes de escalar a modelos mayores.
- Generacion de texto de dominio matematico a nivel de continuacion: puede emplearse para completar fragmentos con estructura matematica simple, siempre con expectativas limitadas por su tamano y contexto.
- Fine-tuning ligero como banco de pruebas: sirve para experimentar con SFT o ajuste en tareas concretas sobre un checkpoint base pequeno y rapido de entrenar.
- Docencia y divulgacion: ejemplo minimo y autocontenido (`model.py`, `generate.py`) para explicar el funcionamiento interno de un GPT y el proceso de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y que dichos datos se encuentran en `results.json`, sin que se hayan proporcionado sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 8M de parametros; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100); tambien funciona en Apple MPS y en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria por el tamano del modelo.
- Opciones de despliegue: carga nativa en PyTorch mediante `model.py` y `generate.py` incluidos; no usa `transformers` AutoModel. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 8M (este) | 8,0M | 1.024 | 80,1M tokens (10 TPP), mezcla math-heavy Dolma3 Dolmino | No disponible | PyTorch nativo |
| Otras variantes de NanoGPT Ladder v3 | No disponible | No disponible | Presupuestos de tokens independientes | No disponible | PyTorch nativo |
| GPT-2 small (referencia de la familia) | 124M | 1.024 | No disponible | No disponible en esta ficha | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato de asistente y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinacion y de texto sin sentido por su reducido tamano (8M de parametros) y su corto entrenamiento (80M de tokens).
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos potencialmente acentuados por la mezcla math-heavy (80% del dominio nombrado), que reduce la diversidad tematica respecto a mezclas equilibradas.
- Idiomas no declarados; el tokenizador GPT-2 favorece el ingles y el rendimiento en castellano no esta documentado.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Pesos en float32 y cargador propio: no es compatible directamente con `transformers`, lo que requiere usar el codigo incluido o adaptar el checkpoint.
- Las metricas de BPB/loss no equivalen a precision en tareas; no deben interpretarse como rendimiento funcional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-8m-10tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
