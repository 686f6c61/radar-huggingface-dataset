# nkkbr/Mini-K3-1H-llama-gqa-block4-v1

## Resumen

Mini-K3-1H-llama-gqa-block4-v1 es un checkpoint de investigacion de tipo decoder-only publicado por el usuario nkkbr en Hugging Face. Forma parte de una comparacion controlada de cuatro arquitecturas que estudian el mecanismo residual y el tipo de mezclador de secuencia dentro del backbone Mini-K3, un proxy de aproximadamente mil millones de parametros logicos inspirado en Kimi-K3. En esta variante concreta, los 13 mezcladores de secuencia son atencion GQA estandar sin sesgo con RoPE de cabeza completa, mientras se conservan el Stable LatentMoE, la primera capa densa SiTU-GLU, el tokenizador y el Quantile Balancing en linea.

El modelo declara 966.352.640 parametros logicos y activa 303.128.320 por token gracias a su capa MoE con 64 expertos enrutados, 2 compartidos y top-k de 4. La longitud de secuencia de entrenamiento es de 8.192 tokens y los pesos se publican en BF16 dentro de un unico fichero safetensors que requiere el codigo de modelado propio del repositorio.

Su relevancia es fundamentalmente metodologica: la revision descrita es `checkpoint-tokens-000000000000-init`, con 0 tokens de objetivo validos consumidos y 0 pasos de optimizador completados, y el autor indica que la etiqueta final solo se creara tras procesar exactamente 16.000.000.000 de objetivos de perdida validos. Por tanto no es un asistente ni un modelo listo para produccion: sirve para auditar que la inicializacion de parametros compartidos entre variantes es byte a byte identica y como linea base reproducible de ablacion de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 13 capas, atencion GQA estandar sin sesgo y MoE disperso Stable LatentMoE |
| Parametros totales | 966.352.640 (logicos) |
| Parametros activos | 303.128.320 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se declara ventana de inferencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16; estado de normalizacion y control del router en FP32) |
| Capas decoder | 13 |
| Ancho oculto | 1.024 |
| Cabezas Q / KV / ancho de cabeza | 8 / 4 / 128 |
| Codificacion posicional | RoPE de cabeza completa, theta 10.000,0, reinicio en cada limite de documento empaquetado |
| Mecanismo residual | Block-4 Attention Residuals |
| Capas densas antes del MoE | 1 (SiTU-GLU) |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto del experto enrutado | 512 |
| Vocabulario / BOS / EOS de generacion / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Post-entrenamiento | ninguno (sin RLHF ni DPO) |
| Estado del checkpoint publicado | inicializacion (`checkpoint-tokens-000000000000-init`), 0 tokens, 0 pasos de optimizador |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 13 capas con ancho oculto 1.024, 8 cabezas de consulta y 4 cabezas de clave/valor de 128 dimensiones cada una, lo que da una atencion GQA de 2:1. Las proyecciones Q/K/V/O no llevan sesgo, no hay compresion MLA ni puerta de salida de atencion, y la codificacion posicional es RoPE aplicada a la cabeza completa con theta 10.000,0. El aislamiento de documentos se realiza con atencion de longitud variable THD de Transformer Engine, de forma que las posiciones RoPE se reinician a cero en cada frontera de documento. El bloque MoE mantiene el diseno Stable LatentMoE de K3 con 64 expertos enrutados de ancho 512, 2 expertos compartidos y top-k 4; el router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. La primera capa es densa y usa activacion SiTU-GLU.

El checkpoint publicado no ha consumido ningun token: la revision es la inicializacion, con 0 objetivos de perdida validos y 0 pasos de optimizador. La receta prevista usa Per-Head Muon para las matrices Q/K/V, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza consciente de GQA, decaimiento coseno, 1% de warmup lineal y Quantile Balancing en linea con histograma de 1.000 bins. Todas las variantes de la comparacion usan inicializacion determinista por nombre y forma con semilla base 20260914, de modo que los parametros compartidos con el mismo nombre semantico y la misma forma comienzan identicos byte a byte; los parametros exclusivos de variante reciben sus propios flujos deterministas. No se ha realizado post-entrenamiento y el estado del optimizador no se publica deliberadamente.

## Capacidades

- Generacion de texto: arquitectura preparada para modelado de lenguaje autorregresivo, pero el checkpoint publicado esta en inicializacion, por lo que no produce texto coherente.
- Razonamiento, codigo y matematicas: no verificados; no existe evaluacion downstream ni ajuste por instrucciones.
- Tool calling / function calling: no soportado; no hay plantilla de chat, formato de herramientas ni entrenamiento de seguimiento de instrucciones.
- Agentes y razonamiento multi-paso: no soportado en este estado del checkpoint.
- Capacidades multilingues: no declaradas; el tokenizador tiene un vocabulario de 163.840 entradas pero no se especifica su composicion idiomatica.
- Capacidades especiales: no dispone de modo de razonamiento explicito, vision ni audio. Lo diferencial es su papel como control experimental de atencion GQA frente a mezcladores KDA, Gated MLA y Mamba-2 dentro de la misma familia.
- Trazabilidad experimental: incluye manifiestos JSON con revisiones congeladas de las fuentes, cuotas de tokens, hashes de planificacion, configuracion del optimizador y hashes de la particion de validacion.

## Casos de uso

- Ablacion de mecanismos de atencion: comparar esta variante GQA pura con las variantes KDA/MLA y Mamba-2 de la misma familia, manteniendo constantes tokenizador, datos, planificacion y semilla de inicializacion, para aislar el efecto del mezclador de secuencia sobre la perdida de validacion.
- Verificacion de reproducibilidad de inicializaciones: usar el safetensors como referencia para comprobar que los parametros compartidos entre arquitecturas arrancan byte a byte identicos, dado el esquema determinista con semilla 20260914.
- Estudio del mecanismo Block-4 Attention Residuals: analizar el comportamiento de las residuales de atencion por bloques frente a conexiones residuales convencionales en un backbone de ~1B parametros y 8.192 tokens de secuencia.
- Investigacion sobre enrutado MoE: instrumentar el router de 64 expertos con top-k 4 y Quantile Balancing en linea para medir equilibrio de carga, entropia de enrutado y especializacion de expertos durante el preentrenamiento.
- Pruebas de infraestructura de preentrenamiento: validar pipelines de atencion THD de longitud variable, aislamiento de documentos, Per-Head Muon y QK-Clip antes de escalar a configuraciones mayores.
- Docencia y divulgacion tecnica: ilustrar con un ejemplo real y reproducible como se documenta una ablacion controlada de arquitectura, incluyendo manifiestos de datos y hashes de planificacion.
- Base para experimentos de escalado: servir de punto de partida para estudiar si los rankings de arquitectura observados a ~1B parametros y 8K de longitud se mantienen a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se trata de un checkpoint intermedio de preentrenamiento que aun no ha sido evaluado en tareas downstream, y que solo se registran NLL y perplejidad en el conjunto fijo de desarrollo durante el entrenamiento, en W&B y en las metricas JSONL de la ejecucion. Los diagnosticos de arquitectura y las evaluaciones downstream estan planificados pero no publicados.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 1,93 GB solo para pesos; con cache KV y activaciones conviene reservar entre 2,5 y 3,5 GB.
- VRAM en FP32: aproximadamente 3,87 GB solo para pesos.
- Cache KV: con GQA de 4 cabezas KV de 128 dimensiones y 13 capas, la cache ocupa unos 26 kB por token en BF16, es decir, alrededor de 218 MB para una secuencia completa de 8.192 tokens.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4070 o RTX 4090. Para entrenamiento con BF16 conviene una A100, H100 o L40S, aunque el modelo completo cabe en una unica GPU de gama media.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM, siempre que se disponga del codigo de modelado propio.
- Opciones de despliegue: el repositorio se distribuye como PyTorch puro con `modeling_mini_k3.py`, `configuration_mini_k3.py` e `initialize_model.py`, y no depende del checkout de entrenamiento original. No hay soporte directo confirmado en vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos GGUF y la arquitectura requiere `trust_remote_code` o la carga del codigo incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion mas pertinente es con las otras variantes de la misma familia Mini-K3-1H del autor, que comparten backbone, tokenizador, datos y planificacion.

| Modelo | Mezcladores de secuencia | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-llama-gqa-block4-v1 | 13 capas GQA estandar sin sesgo, RoPE de cabeza completa | 966.352.640 logicos / 303.128.320 activos | 8.192 | no disponible | Hugging Face, 0 descargas |
| Mini-K3-1H-mamba2-n64-g8-v1_C | 9 mezcladores KDA sustituidos por Mamba-2/SSD; 4 capas NoPE Gated MLA | no disponible (~1B logicos) | no disponible | no disponible | Hugging Face |
| Mini-K3-1H-attn-1kda-3mla-nope-v2 | 1 KDA y 3 Gated MLA NoPE | no disponible (~1B logicos) | no disponible | no disponible | Hugging Face |
| Mini-K3-1H-attn-2kda-2mla-nope-v2 | 2 KDA y 2 Gated MLA NoPE | no disponible (~1B logicos) | no disponible | no disponible | Hugging Face |
| Mini-K3-1H-attn-4mla-rope-v2 | 4 Gated MLA con RoPE | no disponible (~1B logicos) | no disponible | no disponible | Hugging Face |

Todas ellas conservan Stable LatentMoE, Block-4 Attention Residuals, activaciones SiTU y Quantile Balancing, por lo que las diferencias de rendimiento que se observen son atribuibles al mezclador de secuencia. Como referencia externa de tamano similar, un modelo denso de ~1B parametros abiertos (por ejemplo la clase de Llama 3.2 1B o Qwen2.5 1.5B) resulta mucho mas util en produccion, pero no es comparable en terminos de objetivo experimental: este repositorio es un control de ablacion sin post-entrenamiento.

## Limitaciones y advertencias

- Checkpoint en inicializacion: el fichero publicado corresponde a `checkpoint-tokens-000000000000-init`, con 0 tokens de objetivo consumidos y 0 pasos de optimizador, por lo que los pesos son esencialmente aleatorios y la generacion de texto carece de valor.
- No es un modelo oficial de Meta: pese a que el identificador contiene "llama", el autor indica expresamente que no es un modelo Llama oficial y que "llama" se refiere al estilo de atencion utilizado.
- Sin ajuste por instrucciones: no se ha realizado post-entrenamiento ni RLHF ni DPO, de modo que no debe tratarse como asistente conversacional.
- Sin evaluacion downstream: no existen resultados de MMLU, HumanEval, GSM8K ni similares, y no se ha medido calidad de generacion.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial y persiste incertidumbre legal para cualquier despliegue productivo.
- Idiomas no declarados: no se especifica la cobertura idiomatica ni la composicion del corpus de entrenamiento.
- Sesgos y contenido inseguro: el propio autor advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. Los conjuntos de datos de origen conservan sus propias licencias y no se redistribuyen en el repositorio.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje sin evaluacion; en este estado del entrenamiento el riesgo es total, ya que no se ha aprendido ninguna distribucion del lenguaje.
- Extrapolacion no validada: los rankings de arquitectura obtenidos a ~1B parametros y 8.192 tokens de longitud necesitan confirmacion antes de extrapolarse a Kimi-K3 completo.
- Dependencia de codigo propio: la carga requiere el layout definido por `modeling_mini_k3.py` y `configuration_mini_k3.py`, por lo que no funciona directamente en runtimes estandar sin `trust_remote_code`.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkkbr/Mini-K3-1H-llama-gqa-block4-v1
- Variante Mamba-2/SSD de la misma familia: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g8-v1_C
- Variante con 1 KDA y 3 Gated MLA NoPE: https://huggingface.co/nkkbr/Mini-K3-1H-attn-1kda-3mla-nope-v2
- Variante con 2 KDA y 2 Gated MLA NoPE: https://genaihub.net/agents/hf-model-nkkbr-mini-k3-1h-attn-2kda-2mla-nope-v2
- Variante con 4 Gated MLA y RoPE: https://savrn.com/models/mini-k3-1h-attn-4mla-rope-v2
- Ficha de registro de la variante MLA: https://free2aitools.com/model/nkkbr/mini-k3-1h-attn-4mla-rope-v2
- Paper, blog o repositorio del experimento: no disponible en la informacion proporcionada
