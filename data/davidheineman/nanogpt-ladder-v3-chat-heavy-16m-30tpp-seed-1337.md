# davidheineman/nanogpt-ladder-v3-chat-heavy-16m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 16M es un modelo de lenguaje de tipo base (pretraining endpoint) desarrollado por davidheineman dentro de la serie experimental NanoGPT Ladder v3. Se trata de una reproducción a pequeña escala del GPT-2 original, con 15.851.520 parámetros, 14 capas, anchura 192 y 6 cabezas de atención, entrenado sobre una mezcla de datos sesgada hacia el dominio conversacional (chat-heavy) según la receta del pool Dolma3 Dolmino de AllenAI. El modelo se publica como punto final de preentrenamiento, es decir, antes de cualquier fase de SFT, RLHF o condicionamiento tiny-rl.

Su relevancia es fundamentalmente metodológica: forma parte de una escalera (ladder) de modelos entrenados con distintos presupuestos de tokens por parámetro (TPP) y distintas mezclas de datos, lo que permite estudiar empíricamente el efecto del presupuesto de cómputo y de la composición del corpus en modelos pequeños. El checkpoint consumió 475.529.216 tokens de predicción en 14.512 pasos de optimizador con semilla 1337, y se distribuye con los scripts nativos de carga e inferencia en PyTorch.

No es un modelo destinado a producción ni a tareas de razonamiento: es una pieza de investigación reproducible, con contexto de 1.024 tokens, tokenizador GPT-2 y vocabulario rellenado a 50.304 entradas. La ficha refleja exclusivamente los datos publicados en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con embeddings atados y RoPE |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargado con `model.py` propio; no compatible con `AutoModel` de Transformers |
| Capas | 14 |
| Dimension del modelo (width) | 192 |
| Cabezas de atencion | 6 |
| Vocabulario | 50.304 (rellenado) |
| Tokenizador | GPT-2 (tiktoken) |
| Tokens de entrenamiento | 475.529.216 tokens de prediccion |
| Pasos de optimizador | 14.512 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla chat-heavy) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de arquitectura GPT-2 con las modificaciones habituales de NanoGPT: embeddings de entrada y de salida atados (tied embeddings), codificacion posicional rotatoria (RoPE) en lugar de embeddings posicionales aprendidos, 14 bloques con anchura 192 y 6 cabezas de atencion (32 dimensiones por cabeza), y un vocabulario de 50.304 entradas obtenido por relleno del tokenizador GPT-2. La longitud de contexto es de 1.024 tokens. El checkpoint se guarda en float32 e incluye las claves `model`, `config`, `identity` y `run`; no se incluye el estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior pero no para reanudar el preentrenamiento.

El entrenamiento consistio en un preentrenamiento de lenguaje autorregresivo sobre 475.529.216 tokens de prediccion, distribuidos en 14.512 pasos de optimizador con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI; en las variantes "heavy" el 80 % del corpus se asigna al dominio nombrado, en este caso el conversacional (chat). El archivo `metadata.json` del repositorio registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, lo que permite reproducir el experimento. No se aplicaron fases de SFT, RLHF ni DPO: los pesos son estrictamente el punto final del preentrenamiento, y el autor indica que deben usarse con prompts de texto plano.

## Capacidades

- Generacion de texto autorregresiva basica con prompts de texto plano; el autor recomienda no usar formatos de chat ni plantillas de instrucciones.
- Modelado de lenguaje: el checkpoint esta pensado como base para evaluaciones de loss y bits-per-byte (BPB), no como solucion de tareas.
- Fine-tuning posterior: al no incluir estado de optimizador, puede reutilizarse como inicializacion para SFT o RL a pequena escala.
- Inferencia en CPU, CUDA y Apple MPS mediante el flag `device=auto` del script incluido.
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura configurable.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente.
- Capacidades multilingues no declaradas; el tokenizador GPT-2 esta fuertemente sesgado al ingles.

## Casos de uso

- Investigacion sobre leyes de escalado en modelos pequenos: el modelo sirve como punto de la escalera NanoGPT Ladder v3 para comparar curvas de loss/BPB frente a presupuestos de tokens (TPP) y mezclas de datos, manteniendo el resto de hiperparametros fijos.
- Estudio del efecto de la composicion del corpus: al ser una variante chat-heavy (80 % del dominio conversacional), permite aislar como afecta el sesgo de mezcla al rendimiento en dominios concretos frente a otras variantes de la misma escalera.
- Reproducibilidad de experimentos: los hashes SHA256 y las revisiones de fuente en `metadata.json` permiten replicar exactamente el entrenamiento y verificar resultados en publicaciones.
- Baseline de referencia para tecnicas de eficiencia: su tamano (15,8 M de parametros, 0,1 GB) permite entrenar y evaluar variantes de atencion, inicializacion o tokenizacion en una sola GPU consumer en minutos.
- Docencia y formacion: el codigo `model.py`/`generate.py` es un ejemplo minimo y legible de un GPT completo con RoPE y embeddings atados, util para cursos de deep learning.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines de carga de checkpoints PyTorch personalizados (no Transformers), gestion de dispositivos y decodificacion antes de escalar a modelos mayores.
- Generacion de texto de relleno o sintetico a muy baja escala en entornos de prueba, asumiendo calidad limitada y contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene el registro original de finalizacion y las evaluaciones finales, expresadas como perdida y bits-per-byte (BPB), que son metricas de modelado del lenguaje y no precision en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,8 M de parametros, ~63 MB de pesos, mas activaciones y cache KV para 1.024 tokens); en la practica cabe en cualquier GPU, incluso integrada.
- GPU recomendadas: cualquier GPU con CUDA (RTX 3060, RTX 4090, A100, H100); tambien funciona en Apple MPS y en CPU.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e incluso en Raspberry Pi o CPU sin GPU.
- Opciones de despliegue: script nativo `generate.py` con PyTorch; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y el checkpoint no es un formato GGUF ni compatible con `AutoModel` de Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput muy alto y latencia de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 16M (este) | 15,85 M | 1.024 | 475,5 M tokens, Dolma3 Dolmino chat-heavy | no disponible | PyTorch nativo |
| GPT-2 small (OpenAI) | 124 M | 1.024 | WebText (~40 GB) | MIT (pesos publicados) | PyTorch / safetensors (Transformers) |
| NanoGPT (Karpathy, reproduccion) | ~124 M (config GPT-2 small) | 1.024 | OpenWebText | MIT (codigo) | PyTorch nativo |
| TinyStories-1M / 33M (Microsoft) | 1 M / 33 M | 512-1.024 | TinyStories (sintetico) | MIT / CDLA-Permissive | Transformers |

La comparativa es aproximada: no hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a tamano, contexto, datos y formato. Frente a GPT-2 small es unas 8 veces menor en parametros y usa una mezcla de datos distinta (Dolma3 Dolmino en lugar de WebText). Frente a NanoGPT de Karpathy comparte arquitectura y filosofia reproducible, pero con RoPE, embeddings atados y un corpus distinto. Frente a TinyStories, el corpus es real (no sintetico) y el objetivo es el estudio de mezclas, no la generacion de cuentos.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que puede generar contenido incoherente, repetitivo u ofensivo; no debe usarse como asistente.
- Riesgo alto de alucinacion: con 15,8 M de parametros y 475 M de tokens vistos, la capacidad de memorizar hechos es muy limitada.
- Contexto muy corto (1.024 tokens) que restringe tareas de contexto largo y conversaciones multi-turno.
- Tokenizador GPT-2 con sesgo al ingles; el rendimiento en castellano u otros idiomas sera previsiblemente pobre y no esta documentado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Formato propietario: requiere el `model.py` incluido; no funciona con `AutoModel` de Transformers ni con herramientas estandar de cuantizacion o servidores de inferencia.
- Sin estado de optimizador: no permite reanudar el preentrenamiento, solo inferencia o fine-tuning desde los pesos.
- Las metricas publicadas (loss/BPB) no son medidas de precision en tareas; no deben interpretarse como rendimiento funcional.
- Modelo experimental de investigacion: no hay garantias de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-16m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT de referencia (Karpathy): https://github.com/karpathy/nanoGPT
- Tokenizador GPT-2 (tiktoken): https://github.com/openai/tiktoken
