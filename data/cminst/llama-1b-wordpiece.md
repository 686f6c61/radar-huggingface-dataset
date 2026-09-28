# cminst/Llama-1B-WordPiece

## Resumen

Llama-1B-WordPiece es un modelo de lenguaje causal (decoder-only) de aproximadamente 1.000 millones de parametros publicado por el usuario cminst en HuggingFace. Se trata de un checkpoint entrenado desde inicializacion aleatoria con un objetivo muy concreto: la investigacion controlada sobre tokenizacion. El modelo emplea un tokenizador WordPiece de 32.000 tokens en lugar del BPE tipico de la familia Llama, lo que lo convierte en una pieza util para comparar como afecta el esquema de tokenizacion al comportamiento de un transformer de arquitectura estandar.

La arquitectura es de estilo Llama, con 16 capas, hidden size de 2.048, MLP de 8.192, 32 cabezas de atencion y 8 cabezas key/value (GQA), vocabulario de 32.002 entradas y embeddings de entrada y salida compartidos. La longitud de contexto es de 2.048 tokens, un valor reducido frente a los estandares actuales, coherente con su proposito de investigacion y no de produccion.

Es relevante ahora porque se publica como modelo base sin ajuste por instrucciones, con un unico idioma (ingles) y sin evaluacion de seguridad, factibilidad o sesgo. Su interes es academico: sirve como referencia reproducible (semilla fija 42, scheduler coseno) para estudiar el efecto del tokenizador en un presupuesto de entrenamiento de aproximadamente 10.000 millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo Llama (GQA) |
| Parametros totales | 1.038.686.208 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 16 |
| Hidden size | 2.048 |
| Tamano de MLP | 8.192 |
| Cabezas de atencion | 32 (8 cabezas key/value) |
| Vocabulario | 32.002 tokens (WordPiece, incluye padding y EOS) |
| Embeddings | Compartidos entre entrada y salida (tied) |
| Tamano del repositorio | 2,1 GB |
| Fecha de publicacion (segun HuggingFace) | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clasica: 16 bloques transformer con atencion causal, normalizacion previa (pre-norm), activacion SwiGLU en el MLP y atencion con consultas agrupadas (GQA) con 32 cabezas de consulta y 8 cabezas de clave/valor. El head dim resultante es de 64 (2.048 / 32). Los embeddings de entrada y de salida estan atados, lo que reduce el numero de parametros entrenables dado el vocabulario de 32.002 entradas, y los pesos se almacenan en bfloat16. Con 1.038.686.208 parametros, el checkpoint ocupa aproximadamente 2,07 GB en bfloat16, consistente con los 2,1 GB del repositorio.

El entrenamiento se realizo desde inicializacion aleatoria sobre aproximadamente 10.000 millones de tokens de tokenizador procedentes del dataset FineWeb-EDU-dedup-10B de EleutherAI. La ejecucion uso una semilla fija (42), un scheduler de learning rate coseno y una longitud de secuencia maxima de 2.048 tokens. No hay evidencia de fases de ajuste fino supervisado, RLHF o DPO; el autor indica explicitamente que no es un modelo de instrucciones ni de chat. La innovacion tecnica destacable no esta en la arquitectura, sino en el tokenizador WordPiece de 32k, poco habitual en modelos de esta familia, cuyo impacto en el rendimiento y en el comportamiento del modelo es precisamente el objeto de estudio.

## Capacidades

- Generacion de texto en ingles: completado de texto y modelado de lenguaje autoregresivo como modelo base.
- Investigacion sobre tokenizacion: permite comparar un esquema WordPiece de 32k frente a tokenizadores BPE en condiciones de entrenamiento controladas.
- Razonamiento y matematicas: no hay evaluaciones publicadas que acrediten capacidades especificas en estas areas.
- Codigo: no hay evidencia de capacidades destacadas de generacion de codigo; no se menciona en la model card.
- Tool calling / function calling: no soportado; el modelo no esta ajustado para seguir instrucciones ni para emitir llamadas estructuradas.
- Agentes y razonamiento multi-paso: no soportado por diseno (modelo base).
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Modo chat o instrucciones: no disponible; el autor advierte que no es un modelo de chat ni de seguimiento de instrucciones.

## Casos de uso

- Investigacion sobre tokenizadores: entrenar y evaluar variantes con distintos esquemas de tokenizacion (WordPiece frente a BPE) manteniendo constantes arquitectura, datos y semilla, para aislar el efecto del tokenizador en la perdida y en las capacidades downstream.
- Reproducibilidad experimental: al usar semilla fija (42) y un dataset publico (FineWeb-EDU-dedup-10B), sirve como punto de partida para replicar experimentos de escalado a ~1B de parametros.
- Estudios de eficiencia de vocabulario: analizar como un vocabulario de 32.002 entradas con embeddings atados afecta al uso de parametros y a la calidad por token frente a vocabularios mayores.
- Analisis de sesgos y factibilidad en modelos base: al no estar ajustado, es util para medir que sesgos y tasas de alucinacion aparecen puramente en la fase de preentrenamiento en ingles.
- Destilacion y ajuste posterior como banco de pruebas: fine-tuning sobre tareas concretas (clasificacion, resumen, extraccion) para comparar la transferibilidad de representaciones entrenadas con WordPiece.
- Completado de texto restringido en ingles: con contexto de 2.048 tokens, puede usarse para generacion de texto corto en experimentos controlados, siempre asumiendo ausencia de ajuste por instrucciones.
- Evaluacion de infraestructura de inferencia: su tamano (~2,1 GB en bfloat16) lo hace util para validar pipelines de despliegue (transformers, vLLM) en laboratorio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos en bfloat16 (2 bytes por parametro): aproximadamente 2,1 GB sin incluir overhead de runtime.
- VRAM para pesos en float32 (si se convierte): aproximadamente 4,2 GB.
- VRAM para cuantizacion a 8 bits (si se genera una version propia): aproximadamente 1,1 GB; a 4 bits, aproximadamente 0,6 GB. Estas conversiones no estan publicadas en el repositorio.
- Cache KV: con GQA de 8 cabezas key/value, head dim 64 y 16 capas, la cache ocupa unos 32 KiB por token en bfloat16; con contexto completo de 2.048 tokens, aproximadamente 64 MiB.
- GPU recomendadas: cabe con holgura en cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090) para inferencia en bfloat16. Para entrenamiento o fine-tuning completo se recomienda al menos una A100, H100 o L40S.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB de VRAM o mas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `AutoTokenizer` (soporte nativo declarado por el autor). Al ser arquitectura Llama estandar, es compatible con vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponible; no se han publicado mediciones. A modo puramente orientativo (estimacion no verificada), un modelo denso de ~1B suele generar del orden de decenas a cientos de tokens por segundo en GPUs consumer modernas, pero no hay datos del autor que lo confirmen.

## Comparativa con modelos similares

Datos de referencia publicos de cada modelo; conviene verificarlos en sus respectivas model cards.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| Llama-1B-WordPiece (cminst) | 1,04B | 2.048 | ~10.000 millones | No disponible | Investigacion de tokenizacion (WordPiece) |
| TinyLlama-1.1B | 1,1B | 2.048 | 3 billones | Apache-2.0 | Base / chat en ingles |
| Llama 3.2 1B | 1,24B | 128.000 | Hasta 9 billones | Llama 3.2 Community License | Base / instruct, multilingue |
| Qwen2.5-1.5B | 1,54B | 32.768 | 18 billones | Apache-2.0 | Base / instruct, multilingue |

Diferencias clave: Llama-1B-WordPiece esta entrenado con un presupuesto de tokens muy inferior a los modelos de referencia y con un contexto limitado a 2.048 tokens, y no esta ajustado por instrucciones. Su ventaja competitiva no es el rendimiento bruto, sino la reproducibilidad de un experimento controlado de tokenizacion. No hay benchmarks publicados que permitan comparar su calidad frente a TinyLlama, Llama 3.2 1B o Qwen2.5-1.5B.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineacion: no debe usarse como asistente conversacional ni esperar que siga instrucciones.
- Sesgos conocidos: no evaluados. El autor indica explicitamente que no se ha evaluado seguridad, factibilidad, equidad ni sesgo.
- Riesgo de alucinacion: alto y no medido; al no haber evaluacion de factibilidad, no hay garantia de que el contenido generado sea veridico.
- Limitacion de contexto: solo 2.048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Limitacion de idioma: unicamente ingles; no se declara soporte para castellano ni otros idiomas. Aunque el tokenizador WordPiece podria codificar texto en otros idiomas, el entrenamiento es monolingue.
- Licencia no disponible: al no especificarse licencia, no se puede asumir permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Dataset de entrenamiento: FineWeb-EDU-dedup-10B es un corpus educativo filtrado, con la cobertura y los sesgos propios de ese tipo de datos web.
- Escasez de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin papers, blogs ni evaluaciones de terceros identificados.
- Tokenizador no estandar: el uso de WordPiece (en lugar de BPE) puede requerir ajustes en herramientas y pipelines que asumen tokenizadores Llama convencionales.
- Fecha de publicacion declarada en HuggingFace (27 de septiembre de 2026) posterior a la fecha actual, lo que sugiere un posible error de metadatos y conviene tratarlo con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cminst/Llama-1B-WordPiece
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/fineweb-edu-dedup-10b
- Paper, blog o repositorio oficial: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo, unicamente paginas genericas de GitHub sin relacion con el checkpoint.
