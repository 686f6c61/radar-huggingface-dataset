# davidheineman/nanogpt-ladder-v3-math-heavy-32m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 32M 30 TPP es un modelo de lenguaje de tipo base, desarrollado por davidheineman dentro de una serie experimental de preentrenamiento a escalas controladas (la "NanoGPT Ladder v3"). Se trata de un transformer decoder-only de 32.071.680 parametros, entrenado desde cero sobre 962.134.016 tokens de prediccion (aproximadamente 30 tokens por parametro) durante 29.362 pasos de optimizador, con semilla 1337. Su proposito no es el uso comercial ni la competicion en benchmarks, sino servir como punto de medida reproducible para estudiar el efecto de la composicion del corpus en el preentrenamiento a pequena escala.

La variante math-heavy emplea la mezcla congelada del pool Dolma3 Dolmino de AllenAI, en la que el 80% del contenido se asigna al dominio matematico nombrado. El modelo usa una arquitectura GPT-2 clasica con 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, con una ventana de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas.

Es relevante ahora porque forma parte de un conjunto de ejecuciones independientes por presupuesto de tokens, lo que permite comparaciones limpias entre recetas de datos y tamanos bajo un mismo pipeline. Los pesos son previos a cualquier acondicionamiento tiny-rl, SFT o RL, por lo que deben usarse con prompts de texto plano y no como asistente alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con RoPE |
| Parametros totales | 32.071.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargado con `model.py` propio, no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con 13 capas, dimension de modelo 320, 5 cabezas de atencion, embeddings de entrada y salida atados, embeddings rotatorios (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. El checkpoint incluye los pesos en float32 originales, junto con los diccionarios `config`, `identity` y `run`; no incluye el estado del optimizador, aunque admite fine-tuning posterior. La carga requiere el codigo `model.py` incluido en el repositorio, ya que la arquitectura personalizada no se resuelve mediante `AutoModel` de Transformers.

El entrenamiento consistio en 29.362 pasos de optimizador sobre 962.134.016 tokens de prediccion, lo que equivale a unos 30 tokens por parametro (30 TPP). La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, con un 80% de asignacion al dominio matematico en esta variante "math-heavy". Cada presupuesto de tokens de la escalera corresponde a una ejecucion entrenada de forma independiente con semilla 1337. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256, asi como `results.json` con el registro de finalizacion y las evaluaciones finales. No se documentan fases de RLHF, DPO ni SFT en estos pesos.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, en modo base (sin instrucciones ni formato de chat).
- Modelado de lenguaje y continuacion de texto con contexto de 1.024 tokens.
- Razonamiento y matematicas basicas derivadas del sesgo math-heavy del corpus, sin garantia de calidad por tratarse de un modelo de 32M.
- Decodificacion greedy (`temperature=0`) o con muestreo por temperatura, con seleccion automatica de dispositivo CUDA, Apple MPS o CPU.
- Fine-tuning posterior sobre el checkpoint, ya que se conservan los pesos atados de embedding y salida.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues explicitas.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar esta ejecucion math-heavy con las variantes del mismo tamano de la escalera para aislar el efecto de la proporcion de contenido matematico en la perdida de validacion.
- Reproducibilidad de preentrenamiento: usar los SHA256, las revisiones de fuentes y la semilla 1337 registrados en `metadata.json` para replicar exactamente la ejecucion.
- Baseline de referencia en experimentos de scaling: emplear los 32M parametros y 30 TPP como punto de comparacion frente a ejecuciones con mas tokens por parametro dentro de la misma escalera.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de checkpoints PyTorch personalizados, seleccion de dispositivo y decodificacion antes de escalar a modelos mayores.
- Estudio de tokenizacion: analizar el comportamiento del tokenizador GPT-2 con vocabulario rellenado a 50.304 en tareas de continuacion de texto corto.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer GPT-2 minimo con codigo legible (`model.py`, `generate.py`) y pesos abiertos.
- Punto de partida para fine-tuning: adaptar el modelo a dominios concretos con presupuestos de computo muy reducidos, dado su tamano y su contexto de 1.024 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (32M parametros ocupan unos 128 MB, mas activaciones y cache KV para 1.024 tokens), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1050 o superior; tambien funciona en Apple MPS y en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: script `generate.py` incluido con dependencias gestionadas por `uv`; carga nativa en PyTorch mediante `model.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no publicarse pesos en formatos estandar como safetensors o GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la generacion en GPU consumer es del orden de miles de tokens por segundo, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 32M 30 TPP | 32,1M | 1.024 | no disponible | PyTorch nativo | Ejecucion experimental con mezcla 80% matematica |
| Otras ejecuciones de NanoGPT Ladder v3 (mismo autor) | variable segun presupuesto | 1.024 | no disponible | PyTorch nativo | Misma receta y semilla, distinto tamano o TPP |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | safetensors, GGUF | Referencia historica de la arquitectura; mayor tamano |
| Modelos tipo TinyLlama o similares de ~30-100M | variable | variable | variable | safetensors, GGUF | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinacion y de contenido factualmente incorrecto, especialmente fuera del dominio matematico.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no declarados; el tokenizador GPT-2 y la mezcla de datos sugieren un sesgo fuerte hacia el ingles.
- Sesgos inheritos del corpus Dolma3 Dolmino y de la asignacion del 80% al dominio matematico, que reduce la cobertura de otros dominios.
- Licencia no disponible: no puede asumirse uso comercial sin confirmacion explicita del autor.
- Pesos en float32 y cargador propio: no son directamente compatibles con ecosistemas estandar (Transformers, vLLM, llama.cpp), lo que limita su integracion en produccion.
- Las metricas publicadas (BPB, perdida) no miden capacidad de resolver tareas; no deben interpretarse como precision en benchmarks.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validacion externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-32m-30tpp-seed-1337
- Coleccion de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
