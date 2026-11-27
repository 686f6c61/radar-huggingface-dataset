# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp16

## Resumen

Celerity 271M 8K es un punto de control de la familia Celerity, un conjunto de modelos de lenguaje de pequeno tamano entrenados originalmente en hardware Cerebras y convertidos posteriormente al formato de Hugging Face. Este checkpoint concreto forma parte de una ablacion sobre el regimen de dropout de atencion (identificado como `ad0.2_ild_tpp16`) y se distribuye con pesos en formato PyTorch que requieren `trust_remote_code=True` para su carga. El modelo tiene 271 millones de parametros y una longitud maxima de secuencia de 8192 tokens.

El modelo resuelve el caso de uso de experimentacion controlada en torno a tecnicas de entrenamiento (dropout dependiente de capa, regimen de tokens por parametro y embeddings posicionales ALiBi) sobre un corpus de investigacion. Su relevancia es fundamentalmente metodologica: permite reproducir y analizar el efecto de variaciones concretas del schedule de dropout en un modelo pequeno entrenado con un presupuesto de computo fijo, no tanto desplegarlo como asistente generalista.

La informacion publicada es escasa: no hay model card de uso, no se declaran idiomas, licencia ni pipeline, y el repositorio no registra descargas ni interacciones. Todo lo que sigue se basa exclusivamente en los metadatos y la model card disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi (detalles de capas y dimensiones no disponibles) |
| Parametros totales | 271 M (nominal, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch`, `custom_code`), carga con `trust_remote_code=True`; tamano del repo 0.5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271 millones de parametros que emplea ALiBi como mecanismo de codificacion posicional, lo que permite extrapolar a secuencias de hasta 8192 tokens sin embeddings posicionales aprendidos. La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas ni la activacion, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizo en 3 sistemas CSX (hardware Cerebras) con el runtime `cbcore 2.6.0`, sobre el dataset CommonPile en su version "corrected no-repeat TPP pool". El checkpoint corresponde al paso 12020, con un total de 4.332.584.960 tokens procesados (nominalmente 16 tokens por parametro). Se uso un batch global de 44, learning rate pico de 0.15, weight decay de 0.002842849281760314 y `tau_ema` de 0.1950969310368566. El dropout de atencion es 0.2 en el extremo del schedule y escala de forma lineal por capa (`ad0.2_ild`), no como probabilidad uniforme; el dropout residual, stochastic depth y LayerDrop son todos 0.0. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, derivada del preentrenamiento sobre CommonPile.
- Procesamiento de contextos de hasta 8192 tokens gracias a ALiBi.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- No se documentan modos especiales (thinking, vision, audio) ni capacidades de codigo o matematicas verificadas.
- El modelo se distribuye como checkpoint de ablacion, sin ajuste instructivo declarado.

## Casos de uso

- Reproduccion de experimentos de ablacion: sirve para comparar el efecto del schedule de dropout de atencion (`ad0.2_ild_tpp16`) frente a otros puntos de la misma familia Celerity, manteniendo fijo el resto de hiperparametros.
- Investigacion sobre embeddings posicionales: permite estudiar el comportamiento de ALiBi en secuencias largas (hasta 8192 tokens) en un modelo de 271 M, con un coste de computo bajo.
- Analisis de eficiencia de datos: con 16 tokens por parametro y 4.330 millones de tokens vistos, es util para estudiar curvas de escalado y regimenes de entrenamiento en modelos pequenos.
- Validacion de pipelines de conversion Cerebras a Hugging Face: el checkpoint incluye el commit del conversor (`0e3d5d37...`) y el runtime de origen, lo que facilita auditar la fidelidad de la conversion.
- Fine-tuning experimental: al ser un modelo pequeno (0.5 GB en pesos), puede ajustarse en una unica GPU consumer para tareas de investigacion acotadas.
- Baseline en estudios de dropout: sirve como referencia controlada para medir el impacto de tecnicas de regularizacion dependientes de capa en tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271 M × 4 bytes), mas memoria para activaciones y cache KV a 8192 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precision reducida; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Opciones de despliegue: al requerir `trust_remote_code=True` y pesos PyTorch con codigo personalizado, la via principal es `transformers` con el codigo del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este checkpoint) | 271 M | 8192 | no disponible | Hugging Face, pesos PyTorch con `trust_remote_code` |
| Alternativas de ~270 M (p. ej. GPT-2 medium, OPT-350M) | 300-350 M | 1024-2048 | variable segun modelo | amplia, con formatos GGUF y soporte en multiples runtimes |
| Alternativas de ~1 B (p. ej. TinyLlama, Qwen2.5-0.5B) | 500 M - 1,1 B | 2048-32768 | variable | amplia, con cuantizaciones y soporte en vLLM/Ollama |

La comparacion cuantitativa de rendimiento no esta disponible porque este checkpoint no publica benchmarks. Frente a alternativas establecidas, su principal diferencia es el contexto de 8192 tokens con ALiBi y su naturaleza de checkpoint de investigacion, no de modelo listo para produccion.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin marco legal explicito y debe considerarse no permitido hasta aclaracion del autor.
- No se declaran idiomas soportados; el rendimiento fuera del ingles (si el corpus CommonPile es mayoritariamente anglofono) es incierto.
- Es un checkpoint de preentrenamiento sin alineacion declarada: no cabe esperar comportamiento instructivo, rechazo de peticiones daninas ni formato conversacional fiable.
- Riesgo elevado de alucinacion y de texto incoherente en tareas complejas, dado el tamano (271 M) y la ausencia de ajuste fino supervisado.
- Sesgos desconocidos: no se documenta analisis de sesgo ni composicion detallada del dataset mas alla de CommonPile.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; debe revisarse antes de usarlo en entornos de produccion.
- El dropout de atencion solo se desactiva con `model.eval()`; usarlo en modo entrenamiento por error altera las salidas.
- No hay evidencia de soporte en runtimes optimizados (vLLM, llama.cpp), lo que limita el despliegue a `transformers`.
- Repositorio sin descargas ni likes: no hay validacion comunitaria de su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp16
- Commit del conversor citado en la model card: `0e3d5d375695293479df9d2a3717f05f71a345b4` (sin URL publica disponible)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
