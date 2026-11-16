# myboker/Concertina-2.27B

## Resumen

Concertina-2.27B es un modelo de generacion de texto en ingles derivado de Qwen3-4B mediante una tecnica de compresion estructural denominada "folding" o plegado de capas, descrita en el articulo arXiv:2611.18113 (Zhang et al., 2026). El autor del repositorio es el usuario de Hugging Face `myboker`, que publica tanto el modelo como el codigo de referencia de la tecnica. El modelo reduce el numero de parametros de 4,02B a 2,27B (un 57% del original) manteniendo la misma profundidad efectiva, al fusionar cada par de capas adyacentes en un unico bloque compartido que se ejecuta dos veces.

La relevancia del modelo es metodologica: demuestra que es posible comprimir un transformer denso reutilizando pesos entre capas, con correcciones de bajo rango por paso de bucle y puertas por token, y recuperar buena parte del rendimiento del profesor mediante destilacion sobre 22B tokens. El resultado es un modelo de 2,27B parametros que iguala o supera ligeramente a Qwen3-1.7B en la mayoria de benchmarks del articulo, con un coste de pesos en bf16 de 4,5 GB frente a los 8,0 GB de Qwen3-4B.

La arquitectura subyacente es un transformer decoder-only con 18 bloques unicos ejecutados dos veces cada uno (36 pasos efectivos), derivado de la familia Qwen3 y publicado bajo licencia Apache 2.0. El modelo requiere `trust_remote_code=True` porque la arquitectura plegada se define en archivos propios del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con plegado de capas (18 bloques unicos x 2 pasos de bucle), derivado de Qwen3-4B |
| Parametros totales | 2.273.787.896 (2,27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 4,5 GB); repositorio de 4,6 GB |

## Arquitectura y entrenamiento

Concertina pliega cada par de capas adyacentes de Qwen3-4B en un unico bloque compartido que se ejecuta dos veces. Cada mapa lineal del bloque compartido parte del peso de la primera capa de su par; en el segundo paso del bucle se anade una correccion de rango 64 inicializada a partir de la SVD truncada de la diferencia entre las dos capas originales. Una puerta por token escala esa correccion de forma independiente para cada token, y cada paso del bucle conserva los pesos RMSNorm de la capa a la que reemplaza. El resultado son 18 bloques unicos con 36 pasos efectivos de profundidad, mismo numero de pasos que Qwen3-4B, y la misma cache KV que el modelo original.

El entrenamiento combina la construccion estructural descrita con una fase de destilacion desde Qwen3-4B sobre 22B tokens. Segun la tabla del articulo, Qwen3-4B se preentreno con 36T tokens, de modo que Concertina alcanza su rendimiento con aproximadamente un 0,06% de esos tokens en la fase de destilacion, aunque parte de los pesos del profesor. No se detalla en la informacion disponible la composicion del dataset de destilacion, el uso de RLHF o DPO, ni hiperparametros de entrenamiento. La innovacion tecnica destacable es el propio esquema de plegado con correcciones de bajo rango y puertas por token, que permite compartir pesos entre capas sin colapsar la expresividad del modelo.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy, muestreo y cache KV habilitada (cada paso del bucle conserva la ranura de cache de la capa que reemplaza).
- Razonamiento y conocimiento general, evaluado en MMLU, BBH, GPQA y el agregado base-7.
- Razonamiento matematico y resolucion de problemas, evaluado en GSM8K y MATH.
- Capacidades heredadas de Qwen3-4B por destilacion, aunque no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card esta redactada integramente en ingles y no se declaran idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: con 4,5 GB en bf16, el modelo cabe en GPUs de consumo de 8 GB o mas, lo que permite servir un modelo con rendimiento cercano a Qwen3-1.7B en hardware modesto.
- Investigacion sobre compresion de modelos: sirve como referencia reproducible para estudiar plegado de capas, correcciones de bajo rango y destilacion, con codigo publicado en `github.com/myboker/concertina`.
- Generacion de texto en ingles para tareas generales: responde a peticiones de conocimiento y redaccion con un rendimiento en MMLU de 0,556, adecuado para prototipos y demos.
- Razonamiento matematico basico: con GSM8K de 0,788 y MATH de 0,498, es util para asistentes de resolucion de problemas aritmeticos y algebraicos en entornos educativos.
- Evaluacion comparativa de tecnicas de compresion: permite contrastar empíricamente el coste en calidad de reducir parametros frente a alternativas como destilacion pura o poda.
- Fine-tuning ligero sobre tareas especificas: al ser un modelo denso de 2,27B con licencia Apache 2.0, es viable ajustarlo con LoRA o QLoRA en una sola GPU de consumo para dominios concretos.
- Servicio de bajo coste en produccion: su menor huella de memoria y su cache KV identica a la del modelo original facilitan el despliegue con vLLM o TGI en infraestructura modesta, aunque la arquitectura plegada requiere soporte de codigo remoto.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del articulo arXiv:2611.18113. `base-7` es la media de ARC-Easy, ARC-Challenge, HellaSwag, PIQA, OpenBookQA, WinoGrande y LAMBADA. Los tokens indican preentrenamiento para los modelos Qwen3 y destilacion para Concertina.

| Modelo | Parametros | Tokens | base-7 | MMLU | Redux | Pro | GPQA | BBH | GSM8K | MATH |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-4B (profesor) | 4,02B | 36T | 0,630 | 0,671 | 0,720 | 0,404 | 0,379 | 0,505 | 0,879 | 0,566 |
| Qwen3-1.7B | 1,72B | 36T | 0,562 | 0,557 | 0,591 | 0,297 | 0,293 | 0,363 | 0,710 | 0,460 |
| Concertina-2.27B | 2,27B | 22B | 0,580 | 0,556 | 0,587 | 0,301 | 0,308 | 0,400 | 0,788 | 0,498 |

Concertina-2.27B supera a Qwen3-1.7B en base-7, Pro, GPQA, BBH, GSM8K y MATH, y queda ligeramente por debajo en MMLU (0,556 frente a 0,557) y Redux (0,587 frente a 0,591). Frente al profesor Qwen3-4B, la perdida es notable en MMLU (0,671 a 0,556) y en base-7 (0,630 a 0,580), pero se mantiene en GSM8K (0,879 a 0,788) y MATH (0,566 a 0,498).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,5 GB de pesos mas cache KV y overhead, en torno a 6-7 GB en la practica para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: no disponible (no se publican pesos cuantizados).
- VRAM estimada en cuantizacion de 4 bits: no disponible (requiere conversion manual, no hay GGUF oficial).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM en bf16; A100, H100, L40S, RTX 4090 y RTX 3090 son suficientes con holgura.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: `transformers` (probado con 4.57 y 5.6) con `trust_remote_code=True`; vLLM, TGI, llama.cpp y Ollama no estan confirmados en la informacion disponible, y su compatibilidad depende de que soporten la arquitectura plegada personalizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | MATH | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Concertina-2.27B | 2,27B | no disponible | 0,556 | 0,788 | 0,498 | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| Qwen3-1.7B | 1,72B | no disponible | 0,557 | 0,710 | 0,460 | Apache 2.0 | Hugging Face, transformers estandar |
| Qwen3-4B | 4,02B | no disponible | 0,671 | 0,879 | 0,566 | Apache 2.0 | Hugging Face, transformers estandar |

Concertina-2.27B se situa entre Qwen3-1.7B y Qwen3-4B en numero de parametros y ofrece un rendimiento intermedio: mejor que el modelo pequeno en la mayoria de tareas y peor que el profesor. Su ventaja frente a Qwen3-1.7B es un mayor rendimiento en razonamiento y matematicas a cambio de un 32% mas de parametros; su desventaja frente a Qwen3-4B es una perdida de calidad notable en conocimiento general (MMLU) con la mitad de memoria.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` para cargar modelo y tokenizador, lo que implica ejecutar codigo del autor del repositorio; conviene auditar los archivos antes de usarlo en produccion.
- La arquitectura plegada es no estandar: el soporte en herramientas de inferencia como vLLM, TGI, llama.cpp u Ollama no esta confirmado y puede requerir adaptaciones.
- Perdida de calidad frente al profesor Qwen3-4B, especialmente en MMLU (0,671 a 0,556) y en el agregado base-7 (0,630 a 0,580).
- No se declaran idiomas soportados; la model card solo esta en ingles y no hay evidencia de capacidades multilingues.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto especificas en la informacion disponible.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni datos de latencia o throughput, lo que dificulta planificar despliegues en produccion.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; su ecosistema y validacion externa son practicamente inexistentes.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene verificar las condiciones adicionales que Qwen pudiera imponer sobre modelos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myboker/Concertina-2.27B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Articulo: https://arxiv.org/abs/2611.18113
- Codigo: https://github.com/myboker/concertina
