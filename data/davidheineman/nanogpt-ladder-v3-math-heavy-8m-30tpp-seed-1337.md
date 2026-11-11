# davidheineman/nanogpt-ladder-v3-math-heavy-8m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 8M es un modelo de lenguaje de tipo base (pretraining puro, sin ajuste posterior) desarrollado por davidheineman dentro de la coleccion NanoGPT Ladder v3. Se trata de un transformer decoder-only de 8,011,776 parametros entrenado desde cero sobre 240,353,280 tokens de prediccion (30 tokens por parametro, TPP) en 7,335 pasos de optimizador con semilla 1337. Su proposito no es la produccion, sino servir como punto de referencia reproducible en una escalera de modelos de distintos tamanos y mezclas de datos para estudiar el efecto del data mixture en el preentrenamiento a pequena escala.

La particularidad de esta variante es su mezcla de datos "math-heavy": sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas "heavy" asignan el 80% de los tokens al dominio nombrado (en este caso, matematicas). El modelo usa una arquitectura GPT-2 minimalista (8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizer GPT-2 con vocabulario rellenado a 50.304) y un contexto de 1.024 tokens.

Es relevante ahora como artefacto de investigacion abierta: los pesos son float32 originales, el checkpoint incluye `model.pt` con configuracion e identidad de la ejecucion, y el repositorio documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256 en `metadata.json`, ademas de las evaluaciones finales en `results.json`. No es un modelo instructivo ni conversacional: precede a cualquier etapa de SFT o RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 8.011.776 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizer GPT-2, predominantemente ingles; no se declara cobertura multilingue) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargable con loader propio (`model.py`), no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 8 capas, dimension de modelo 128, 4 cabezas de atencion, embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). El tokenizer es el de GPT-2 con el vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens. La implementacion es la de NanoGPT, con un `model.py` y un `generate.py` propios que cargan el checkpoint nativo en lugar de usar la clase `AutoModel` de la libreria Transformers.

El preentrenamiento consistio en 7.335 pasos de optimizador sobre 240.353.280 tokens de prediccion, es decir, 30 tokens por parametro. La mezcla de datos sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`; en las mezclas "heavy" el 80% de los tokens se asigna al dominio nombrado (matematicas en esta variante). El repositorio registra en `metadata.json` las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y en `results.json` el registro original de finalizacion y las evaluaciones finales. No se documentan etapas de RLHF, DPO ni SFT: los pesos son estrictamente de preentrenamiento. El checkpoint soporta inferencia y fine-tuning posterior, pero no incluye estado del optimizador.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts en texto plano, con decodificacion greedy (`temperature=0`) o por muestreo.
- Modelado de lenguaje puro: el modelo predice el siguiente token; no ha sido ajustado para seguir instrucciones ni para mantener dialogos.
- Exposicion de logits mediante `forward_logits`, util para investigacion de distribuciones y evaluacion de perplejidad.
- Capacidad de fine-tuning posterior sobre el checkpoint (sin estado de optimizador incluido).
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso estructurado.
- No dispone de vision, audio ni modo "thinking".
- Cobertura multilingue no declarada; el tokenizer GPT-2 esta orientado al ingles.
- Ejecucion en CPU, CUDA o Apple MPS mediante `device=auto` en el script incluido.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar esta variante math-heavy con otras mezclas del mismo tamano en la coleccion NanoGPT Ladder v3 para aislar el efecto del 80% de dominio matematico en las curvas de perdida y BPB.
- Reproducibilidad de experimentos de scaling: el registro de `metadata.json` (revisiones, pesos de mezcla, SHA256) y la semilla fija 1337 permiten replicar exactamente la ejecucion y auditar resultados.
- Baseline de referencia en articulos y tesis: un modelo de 8M parametros entrenado con 30 TPP sirve como punto de comparacion de bajo coste frente a modelos mayores en estudios de leyes de escala.
- Pruebas de infraestructura de entrenamiento e inferencia: su tamano minimo permite validar pipelines de carga de checkpoints, tokenizacion y generacion en CPU o GPU consumer antes de escalar a modelos mayores.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer GPT-2 (atencion, RoPE, embeddings atados) con un checkpoint real y scripts de generacion autocontenidos.
- Analisis de sesgos y comportamiento de modelos tiny: estudiar como un modelo de 8M parametros entrenado con mezcla math-heavy genera texto y que tipo de errores comete, como caso extremo de alucinacion y falta de coherencia.
- Fine-tuning exploratorio: partir del checkpoint para tareas acotadas de dominio (por ejemplo, continuacion de texto tecnico) en entornos con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona evaluaciones finales de BPB y perdida en `results.json`, pero el autor advierte explicitamente que son medidas de evaluacion de modelado de lenguaje, no de precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8M parametros, aproximadamente 32 MB de pesos mas activaciones y cache KV para 1.024 tokens). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna; se ejecuta sin problema en RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha su capacidad de computo. Tambien funciona en Apple MPS y en CPU.
- Cabe en GPU consumer: si, en todas las gamas actuales, e incluso en CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante los scripts `model.py` y `generate.py` incluidos; el autor indica que no usa el loader de Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato `model.pt` con arquitectura propia no es directamente compatible con ellas sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 8M (este modelo) | 8,0M | 1.024 | no disponible | Hugging Face, pesos PyTorch nativos | Base model, mezcla 80% matematicas, 30 TPP |
| Otras variantes NanoGPT Ladder v3 | no disponible por variante | no disponible | no disponible | Coleccion en Hugging Face | Mismo esqueleto de entrenamiento con mezclas y tamanos distintos |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | MIT (segun publicacion original) | Amplia | Transformer GPT-2 clasico; tamano muy superior |
| Modelos tiny de investigacion (p. ej. TinyStories) | rango de millones | variable | variable | Hugging Face | Enfocados a generacion coherente a muy pequena escala |

La comparacion directa con modelos de la misma categoria se limita a las demas variantes de la coleccion NanoGPT Ladder v3, cuyos datos por variante no se detallan en la informacion disponible. Frente a GPT-2 small, este modelo es aproximadamente 15 veces menor en parametros y su calidad de generacion sera sustancialmente inferior en tareas generales.

## Limitaciones y advertencias

- Modelo base sin ajuste: no sigue instrucciones, no mantiene conversaciones y no debe usarse como asistente.
- Tamano muy reducido (8M parametros): la coherencia del texto generado sera limitada y la tasa de errores facticos, alta.
- Riesgo elevado de alucinacion y de continuaciones sin sentido; el autor advierte que las metricas publicadas son de modelado de lenguaje, no de precision en tareas.
- Contexto corto de 1.024 tokens, insuficiente para documentos largos o dialogos multi-turno extensos.
- Cobertura idiomatica no declarada; el tokenizer GPT-2 y los datos Dolmino estan orientados principalmente al ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Mezcla de datos sesgada al dominio matematico (80%), lo que puede degradar el rendimiento en otros dominios respecto a mezclas equilibradas.
- Formato de pesos propietario (`model.pt` con loader propio): requiere los scripts del repositorio y no es compatible directamente con ecosistemas como Transformers, vLLM o llama.cpp.
- Sin estado de optimizador en el checkpoint: reanudar el entrenamiento exacto no es posible sin reconstruirlo.
- Repositorio de 0,0 GB en el momento de la consulta y cero descargas: disponibilidad y mantenimiento no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-8m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (implementacion base): https://github.com/karpathy/nanoGPT
