# AmauryLC/NanoConte-51M

## Resumen

NanoConte-51M es un modelo de lenguaje causal de tipo GPT con aproximadamente 51,2 millones de parametros, entrenado desde cero en frances por el desarrollador AmauryLC. Su proposito es generar historias cortas infantiles, siguiendo la filosofia de TinyStories: demostrar que modelos muy pequenos pueden producir texto coherente cuando se restringen a un dominio linguistico y tematico acotado. El modelo se publica como checkpoint PyTorch (`state_dict` en float32, unos 205 MB) y se apoya en el tokenizador `MaxLSB/LeCarnet-21M`, de 50 262 tokens.

Arquitectonicamente es un transformer decoder-only convencional con Pre-LayerNorm, activacion GELU y embeddings ligados, con 8 capas, dimension de embedding 512, 8 cabezas de atencion y una ventana de contexto de 512 tokens. Se entreno durante una sola epoca sobre el split `train` del dataset `MaxLSB/LeCarnet`. No es un modelo de proposito general: su interes es educativo y de investigacion, como ejemplo reproducible de entrenamiento de un GPT minimo en frances.

Es relevante para quienes estudian modelos de lenguaje de escala reducida, tecnicas de entrenamiento desde cero con recursos limitados y generacion de texto en dominios restringidos. No compite con modelos de gran escala ni con asistentes instruidos: no incorpora RLHF, DPO ni ajuste por instrucciones, y su utilidad practica se limita a la generacion de narrativa breve en frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT causal (transformer decoder-only, Pre-LayerNorm, GELU, embeddings ligados) |
| Parametros totales | 51 216 384 (~51,2 M; ~25,7 M en la tabla de embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32) |
| Idiomas soportados | frances (fr) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model-51M.pt`, float32, ~205 MB) |

Datos adicionales de arquitectura: `N_LAYER` = 8, `N_EMBD` = 512, `N_HEAD` = 8, `BLOCK_SIZE` = 512. Tokenizador: `MaxLSB/LeCarnet-21M` (50 262 tokens).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con normalizacion previa a cada subcapa (Pre-LayerNorm), activacion GELU y pesos de embedding compartidos entre la entrada y la cabeza de salida. Cuenta con 8 capas, 512 dimensiones de embedding y 8 cabezas de atencion, con una ventana de contexto maxima de 512 tokens. De los 51,2 M de parametros, aproximadamente 25,7 M corresponden a la tabla de embeddings, lo que refleja el peso relativo del vocabulario en un modelo de este tamano.

El entrenamiento se realizo desde cero durante una sola epoca sobre el split `train` del dataset `MaxLSB/LeCarnet`. Se uso el optimizador AdamW con `lr = 6e-4`, `betas = (0.9, 0.95)`, `weight_decay = 0.1` y recorte de gradiente a 1.0. El scheduler combina un warmup lineal de 1000 pasos con un decaimiento coseno hasta el 10 % del learning rate maximo. La configuracion de batch fue de 16 secuencias de 512 tokens (8192 tokens por paso) y el entrenamiento se ejecuto en `bfloat16` mediante `torch.autocast` sobre GPU. No se documenta el numero total de tokens procesados, la composicion detallada del dataset ni la existencia de fases de RLHF o DPO.

## Capacidades

- Generacion de texto narrativo breve en frances, orientado a historias infantiles simples.
- Continuacion de prompts a partir de un inicio de cuento (por ejemplo, "Il etait une fois").
- Generacion autoregresiva con control de temperatura y longitud maxima mediante el metodo `generate` del propio codigo de entrenamiento.
- Capacidad limitada de mantener coherencia local dentro de la ventana de 512 tokens.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; el modelo esta especializado unicamente en frances.

## Casos de uso

- Generacion de cuentos infantiles para prototipos: el modelo puede producir historias cortas a partir de una frase inicial, adecuadas para demostraciones de generacion de texto en frances con recursos minimos.
- Investigacion educativa sobre entrenamiento de LLM: sirve como ejemplo reproducible de un GPT de ~51 M entrenado desde cero, util para estudiar el efecto de hiperparametros, tokenizador y tamano de contexto.
- Pruebas de pipelines de inferencia ligera: su tamano (~205 MB en float32) permite validar flujos de carga de `state_dict`, tokenizacion y generacion en entornos con GPU modesta o CPU.
- Generacion de datos sinteticos narrativos en frances: puede emplearse para crear corpus de cuentos simples destinados a experimentos de aumento de datos o evaluacion de otros modelos pequenos.
- Benchmarking de tecnicas de decodificacion: al ser un modelo pequeno y rapido, es util para comparar estrategias de muestreo (temperatura, top-k, top-p) en un dominio controlado.
- Docencia y talleres practicos: permite ilustrar de extremo a extremo el ciclo de vida de un modelo de lenguaje (dataset, tokenizador, entrenamiento, checkpoint y generacion) sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (checkpoint de ~205 MB mas activaciones y cache KV para 512 tokens); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el modelo se entreno en `bfloat16`, por lo que se beneficia de GPUs con soporte nativo de bf16 (por ejemplo, Ampere o posteriores), aunque la inferencia en float32 es viable en hardware mas antiguo.
- Cabe en GPU consumer: si, incluidas tarjetas de gama baja y entornos integrados.
- Opciones de despliegue: el autor proporciona un `state_dict` PyTorch que se carga con el codigo de `train.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La conversion a GGUF requeriria trabajo adicional no descrito.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| NanoConte-51M | ~51,2 M | 512 tokens | Frances | no disponible | PyTorch `state_dict` |
| TinyStories (modelos originales) | 1 M - 33 M (segun variante) | no disponible en esta ficha | Ingles | no disponible en esta ficha | no disponible en esta ficha |
| Modelos GPT-2 pequenos | 124 M | 1024 tokens | Ingles | no disponible en esta ficha | no disponible en esta ficha |

La comparacion se limita a la categoria de modelos pequenos entrenados desde cero para generacion narrativa. No se dispone de datos de rendimiento comparativo (benchmarks) para NanoConte-51M, por lo que la comparativa se basa unicamente en parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de muy pequena escala, especializado exclusivamente en la generacion de historias cortas y simples en frances.
- No es adecuado para tareas factuales, de razonamiento ni de seguimiento de instrucciones.
- Riesgo elevado de alucinacion y de incoherencia narrativa, especialmente fuera del dominio de cuentos infantiles.
- Ventana de contexto limitada a 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Monolingue: no soporta castellano ni otros idiomas.
- La licencia no esta especificada en la informacion disponible, por lo que no puede confirmarse el uso comercial; debe consultarse al autor antes de cualquier despliegue en produccion.
- El checkpoint se distribuye como `state_dict` que depende del codigo de `train.py`; no es directamente compatible con `transformers` sin adaptacion.
- Entrenado durante una sola epoca, lo que puede limitar la calidad y la diversidad de las generaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmauryLC/NanoConte-51M
- Tokenizador: https://huggingface.co/MaxLSB/LeCarnet-21M
- Dataset: https://huggingface.co/datasets/MaxLSB/LeCarnet
