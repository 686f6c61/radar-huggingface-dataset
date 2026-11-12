# marlosb/ArthurFriedenreich

## Resumen

ArthurFriedenreich es un modelo de lenguaje pequeno (SLM) de tipo base, autoregresivo y denso, con 2.088.765.194 parametros (aproximadamente 2,09B), desarrollado por el usuario marlosb. Esta disenado exclusivamente para portugues y su proposito declarado es educativo y experimental: el autor lo presenta como un ejercicio para recorrer el ciclo completo de desarrollo de un modelo (preparacion de datos, entrenamiento de tokenizer, preentrenamiento de un Transformer decoder-only, evaluacion de checkpoints y empaquetado). No es un modelo instruido ni alineado para chat: no incluye SFT, etapa de RL ni plantilla de conversacion.

La arquitectura deriva de nanoGPT y nanochat de Andrej Karpathy, con modificaciones en el codigo de entrenamiento. Se trata de un Transformer causal denso de 24 capas, hidden size 1.536, MLP de 6.144 y atencion multi-cabeza con 12 cabezas de query y 12 de key-value (dimension 128), vocabulario de 65.536 tokens y contexto soportado de 2.048 tokens. Emplea RoPE con base 100.000, activacion Squared ReLU, patron de atencion repetido `SSSL` (ventanas cortas de hasta 512 tokens previos alternadas con atencion larga) y pesos de embedding y salida no compartidos.

Su relevancia actual es limitada y acotada al ambito educativo: sirve como referencia reproducible de un entrenamiento de ~87.090 millones de posiciones de token sobre datos en portugues (GigaVerbo y variantes), ejecutado en 2 GPU NVIDIA H100 NVL con precision FP8 y el esquema de optimizadores Muon/AdamW de nanochat. No esta pensado para produccion ni para decisiones con consecuencias, y el propio autor advierte que puede generar texto fluido pero incorrecto, repetitivo o sesgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal denso, derivado de nanochat |
| Parametros totales | 2.088.765.194 (aprox. 2,09B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (incluye token de inicio de secuencia) |
| Tipos de cuantizacion | no disponible (release sin cuantizar; pesos nativos en BF16/FP32 mixto) |
| Idiomas soportados | portugues (pt) unicamente |
| Licencia | MIT |
| Formato de pesos | Safetensors (dos shards, aprox. 5,74 GB en total) |
| Capas | 24 |
| Hidden size | 1.536 |
| MLP intermediate size | 6.144 |
| Cabezas query / key-value | 12 / 12 (multi-head attention) |
| Dimension de cabeza | 128 |
| Vocabulario | 65.536 tokens |
| Codificacion posicional | RoPE, base 100.000 |
| Patron de atencion | Repetido `SSSL`; ultima capa siempre con atencion larga |
| Activacion | Squared ReLU |
| Embedding / pesos de salida | No compartidos (untied) |
| Checkpoint step | 1.119.072 |
| Precision de almacenamiento | BF16/FP32 mixto (no cuantizado) |

## Arquitectura y entrenamiento

El modelo es un Transformer causal denso con 24 capas y atencion multi-cabeza (12 cabezas de query y 12 de key-value, dimension 128). Incorpora varias tecnicas heredadas de nanochat: normalizacion RMS sin parametros, normalizacion y escalado de QK, value embeddings en capas alternas, mezcla de embedding del token anterior ("smear"), escalares residuales aprendidos, resta de residual en el punto medio ("backout") y un softcap de logits de 15. La atencion sigue un patron repetido `SSSL`, donde `S` denota una ventana causal corta (hasta 512 tokens previos mas el token actual) y `L` atencion causal larga sobre todo el contexto; la ultima capa usa siempre atencion larga. Los pesos de embedding y de salida no estan compartidos.

El entrenamiento uso datos en portugues de TucanoBR/GigaVerbo, Polygl0t/gigaverbo-v2 y Polygl0t/gigaverbo-v2-synth. El informe registra 87.090.659.328 posiciones de token procesadas (aprox. 87,09B), lo que no equivale a tokens o documentos unicos, ya que puede haber varias epocas y reanudaciones. La ejecucion (`july-extended`) se realizo en 2 GPU NVIDIA H100 NVL (186,0 GB de memoria GPU reportada), con DDP de world size 2, PyTorch 2.9.1+cu128 y CUDA 12.8, precision FP8 con receta `tensorwise`, longitud de secuencia 2.048, batch global de 77.824 tokens por paso, microbatch de 19 secuencias por dispositivo, 40 pasos de warmup, ratio de warmdown 1,0 y fraccion final de learning rate 0,05. El step final fue 1.119.072, con reanudacion desde el step 1.002.444. Se reportan 4,421780e20 FLOPs de computo de entrenamiento, un MFU del 44,95%, 9.810,11 minutos de bucle de entrenamiento (aprox. 163,50 horas) y 186 horas y 23 minutos de tiempo total de reloj. No se menciona RLHF ni DPO: es un checkpoint de preentrenamiento base.

## Capacidades

- Generacion de texto autoregresiva y completion de texto en portugues: predice el siguiente token a partir del texto precedente.
- Razonamiento y conocimiento general limitados a lo aprendido en el corpus de preentrenamiento; no hay ajuste instruccional.
- Generacion de codigo y matematicas: no se declara soporte especifico ni evaluacion; capacidad no garantizada.
- Tool calling / function calling: no soportado (modelo base sin alineacion ni formato de herramientas).
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Capacidades multilingues: no soportadas; solo portugues. El hecho de poder tokenizar otro idioma no implica comprension ni generacion fiable.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Contexto de 2.048 tokens con atencion híbrida corta/larga, util para continuaciones de documentos de longitud moderada.

## Casos de uso

- Experimentacion educativa y reproduccion de pipelines: usar el modelo como referencia para estudiar el ciclo completo de preentrenamiento (tokenizer, datos, checkpoints, evaluacion) en un entorno de 2 GPU H100, dado que el autor documenta configuracion, hiperparametros y tiempos.
- Investigacion sobre atencion híbrida `SSSL`: analizar el efecto de alternar ventanas cortas de 512 tokens con atencion larga en un contexto de 2.048 tokens, comparando perplejidad y calidad de continuacion frente a atencion completa.
- Generacion de texto en portugues para prototipos: completar parrafos o documentos breves en portugues en entornos de demostracion, aceptando que la salida puede ser fluida pero incorrecta y sin valor para produccion.
- Estudio de tecnicas de nanochat: evaluar componentes como QK normalization, value embeddings alternos, smear, backout y softcap de logits en un modelo de ~2B, reutilizando el checkpoint como punto de partida.
- Fine-tuning posterior como base de investigacion: al ser un checkpoint base en portugues con licencia MIT, puede servir para experimentos academicos de SFT o DPO sobre portugues, aunque el autor no lo valida para ello.
- Benchmarking de infraestructura: usar el modelo para medir throughput y latencia en configuraciones FP8/BF16 con 2 GPU H100 NVL y comparar con otras implementaciones de nanochat, dado que se documentan FLOPs, MFU y tiempos de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cargar todos los parametros en FP32 requiere aproximadamente 8,36 GB solo para almacenamiento de parametros, mas activaciones, tensores temporales y sobrecarga del framework. El repo ocupa unos 5,7 GB en Safetensors con precision BF16/FP32 mixta.
- GPU recomendadas: el entrenamiento se realizo en 2 NVIDIA H100 NVL (186,0 GB de memoria total reportada). Para inferencia, una GPU con al menos 10-12 GB de VRAM en FP32 deberia ser suficiente para el modelo en solitario, aunque no se documentan requisitos oficiales de inferencia.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) en BF16/FP32, aunque no hay datos oficiales de inferencia ni de cuantizacion.
- Opciones de despliegue: la libreria declarada es transformers con `custom_code`, por lo que requiere cargar el codigo personalizado del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber release GGUF ni cuantizaciones, esas rutas no estan soportadas de forma nativa.
- Latencia y throughput: no disponibles. Solo se reportan metricas de entrenamiento (MFU 44,95%, 4,421780e20 FLOPs, 9.810,11 minutos de bucle).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ArthurFriedenreich | 2,09B | 2.048 | pt | MIT | Base, educativo, sin benchmarks publicados |
| Modelos ~2B de proposito general (p. ej. familia Qwen2.5-1.5B/3B) | 1,5B-3B | 32.768 o superior | multilingue | variable | No disponible en la informacion proporcionada para comparacion directa |
| Modelos en portugues de tamano similar | no disponible | no disponible | pt | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo exclusivamente educativo: el autor indica explicitamente que no fue creado ni validado para produccion y que no debe desplegarse ni usarse para decisiones con consecuencias.
- Riesgo de alucinacion: puede producir texto fluido pero incorrecto, repetitivo, sesgado o inapropiado.
- Sin alineacion: es un checkpoint base sin SFT, RL ni plantilla de chat; no responde como asistente.
- Solo portugues: el rendimiento multilingue no es un objetivo ni una capacidad soportada; tokenizar otro idioma no implica comprenderlo.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin cuantizaciones oficiales ni formatos GGUF: el despliegue en hardware de consumo requiere conversion manual y no esta documentado.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero ello no elimina las advertencias del autor sobre calidad y adecuacion.
- Los datos de entrenamiento provienen de recursos upstream que pueden haber cambiado desde el entrenamiento; las metricas son registros historicos no reproducidos de forma independiente.
- No hay benchmarks publicados que permitan estimar su calidad relativa frente a otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marlosb/ArthurFriedenreich
- Dataset TucanoBR/GigaVerbo: https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Dataset Polygl0t/gigaverbo-v2: https://huggingface.co/datasets/Polygl0t/gigaverbo-v2
- Dataset Polygl0t/gigaverbo-v2-synth: https://huggingface.co/datasets/Polygl0t/gigaverbo-v2-synth
- Paper referenciado (arXiv:2411.07854): https://arxiv.org/abs/2411.07854
- Paper referenciado (arXiv:2603.03543): https://arxiv.org/abs/2603.03543
- nanoGPT (Andrej Karpathy): https://github.com/karpathy/nanoGPT
- nanochat (Andrej Karpathy): https://github.com/karpathy/nanochat
