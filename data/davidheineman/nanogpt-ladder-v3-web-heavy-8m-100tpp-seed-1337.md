# davidheineman/nanogpt-ladder-v3-web-heavy-8m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · web-heavy · 8M · 100 TPP es un modelo de lenguaje de tipo base (pretraining puro) desarrollado por davidheineman dentro de la iniciativa NanoGPT Ladder v3, una escalera de modelos de GPT entrenados desde cero con presupuestos de tokens controlados. Se trata de un checkpoint de 8.011.776 parametros entrenado sobre 801.177.600 tokens de prediccion (100 tokens por parametro, TPP) durante 24.450 pasos de optimizacion, con semilla 1337. Su proposito no es el uso en produccion, sino servir como punto de referencia reproducible para estudiar el efecto de la mezcla de datos y del presupuesto de computo en el preentrenamiento.

El modelo emplea una arquitectura transformer decoder-only de estilo GPT-2: 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados (tied embeddings), RoPE y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. La ventana de contexto es de 1.024 tokens. Los pesos se distribuyen en float32 originales dentro de un checkpoint PyTorch nativo con cargador propio, no compatible con `transformers.AutoModel`.

La relevancia de esta ficha es acotada: es un modelo de investigacion de escala minima (8M) que precede a cualquier fase de condicionamiento tiny-rl, SFT o RL, por lo que solo acepta prompts de texto plano y no ha sido alineado. La mezcla "web-heavy" sigue la receta congelada del pool Dolma3 Dolmino, asignando un 80% al dominio nombrado (web). No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (8 capas, anchura 128, 4 cabezas, tied embeddings, RoPE) |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`) con cargador propio (`model.py`); no compatible con `transformers.AutoModel` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo GPT-2 con 8 capas, dimension de modelo 128 y 4 cabezas de atencion (32 dimensiones por cabeza). Usa embeddings atados entre la matriz de entrada y la proyeccion de salida, codificacion posicional rotatoria (RoPE) y el tokenizador GPT-2 de `tiktoken` con vocabulario rellenado hasta 50.304 entradas. El checkpoint `model.pt` contiene las claves `model`, `config`, `identity` y `run`, e incluye los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior pero no para reanudar el entrenamiento.

El entrenamiento consistio en un preentrenamiento de lenguaje autorregresivo sobre 801.177.600 tokens de prediccion (100 tokens por parametro) durante 24.450 pasos de optimizacion, con semilla 1337. La mezcla de datos es "web-heavy" y sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`; en las mezclas heavy el 80% de los datos se asigna al dominio nombrado (web). El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de la mezcla y los SHA256, y `results.json` contiene el registro de finalizacion y las evaluaciones finales. No se documentan fases de RLHF, DPO ni SFT: el modelo es un punto de partida previo a tiny-rl, SFT y RL. Las metricas finales publicadas son BPB y perdida de lenguaje, no precision en tareas.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano, con decodificacion greedy (`temperature=0`) o muestreo.
- Modelado de lenguaje a nivel de token con contexto de 1.024 tokens; adecuado para estudiar perplejidad y BPB.
- Fine-tuning posterior: el checkpoint admite ajuste fino adicional al conservar los pesos completos del modelo.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues no documentadas; el tokenizador GPT-2 y la mezcla Dolmino no garantizan comportamiento multilingue fiable a esta escala.
- Inferencia en CUDA, Apple MPS o CPU mediante `device=auto` en el script incluido.

## Casos de uso

- Investigacion sobre leyes de escalado: el modelo forma parte de una escalera con presupuestos de tokens fijos (100 TPP) y semilla controlada, lo que permite comparar curvas de perdida frente a otros puntos de la escalera bajo condiciones identicas.
- Estudio de mezclas de datos: al fijar la receta Dolma3 Dolmino con un 80% de dominio web, sirve para aislar el efecto de la composicion del dataset en el rendimiento de un modelo pequeno.
- Reproducibilidad de experimentos: los archivos `metadata.json` y `results.json` documentan revisiones, pesos de mezcla y SHA256, lo que facilita replicar el entrenamiento y verificar resultados.
- Baseline para fine-tuning: al ser un checkpoint base sin alineacion, es un punto de partida controlado para experimentos de SFT o RL a escala reducida (tiny-rl).
- Docencia y divulgacion: su tamano (8M parametros) permite ejecutar el modelo completo en CPU y estudiar el funcionamiento interno de un transformer GPT-2 sin infraestructura especializada.
- Pruebas de infraestructura de inferencia: util para validar pipelines propios de carga de checkpoints PyTorch, tokenizacion con `tiktoken` y decodificacion en distintos dispositivos (CUDA, MPS, CPU) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que las mediciones finales son evaluaciones de lenguaje (BPB y perdida), no precision en resolucion de tareas, y no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8M parametros), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA (por ejemplo, RTX 4090, RTX 3090, A100, H100) o Apple Silicon via MPS; tambien funciona en CPU.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e incluso en GPUs integradas.
- Opciones de despliegue: carga nativa con `model.py` y `generate.py` incluidos en el repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que usa un cargador propio y no `transformers.AutoModel`.
- Latencia y throughput estimados: no disponibles; a este tamano la latencia sera dominada por el overhead del framework y la longitud de generacion, no por el computo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 8M 100 TPP | 8,0M | 1.024 | no disponible | Hugging Face (checkpoint PyTorch) | Base sin alinear, mezcla web-heavy, semilla 1337 |
| Otros puntos de la escalera NanoGPT Ladder v3 | no disponible | no disponible | no disponible | Coleccion en Hugging Face | Misma receta y metodologia con distintos tamanos, mezclas o presupuestos de tokens |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | MIT (segun publicacion original de OpenAI) | Ampliamente disponible | Arquitectura similar pero ~15x mas parametros; no directamente comparable en escala |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por SFT ni RL, por lo que no sigue instrucciones y puede generar texto incoherente o repetitivo.
- Escala minima: con 8M parametros y 100 TPP, su capacidad de conocimiento factual y de razonamiento es muy limitada; no es apto para tareas de produccion.
- Riesgo de alucinacion: alto en cualquier uso generativo, agravado por la ausencia de alineacion y por el dominio web de la mezcla.
- Contexto limitado a 1.024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Sesgos: la mezcla web-heavy puede incorporar sesgos presentes en datos web de Dolmino; no se documentan evaluaciones de sesgo.
- Sin estado de optimizador en el checkpoint: no es posible reanudar el entrenamiento desde este punto, solo inferencia o fine-tuning.
- Incompatibilidad con `transformers.AutoModel`: requiere el cargador propio incluido en el repositorio, lo que limita la integracion con ecosistemas estandar (vLLM, TGI, etc.).
- Las metricas publicadas son BPB y perdida, no precision en tareas; no deben interpretarse como capacidad de resolucion de problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-8m-100tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
