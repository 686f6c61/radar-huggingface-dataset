# ikimyaii/Mamba-1.3B-semi-structured-EHWS-80pct-seed2

## Resumen

Mamba-1.3B-semi-structured-EHWS-80pct-seed2 es una variante podada del modelo Mamba-1.3B-100B desarrollado por el usuario ikimyaii. Se trata de un modelo de lenguaje basado en arquitectura Mamba (space state model, SSM) al que se le ha aplicado una poda semi-estructurada del 80% mediante una tecnica de dos fases denominada EHWS, que combina una poda local por capas inspirada en ALPS con un ajuste global mediante ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento.

El modelo conserva 1.334.740.992 parametros totales y mantiene el 20% de los pesos en cada capa lineal podada (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La poda es semi-estructurada: cada fila de cada capa podada conserva exactamente el mismo numero de pesos no nulos, lo que garantiza un balanceo perfecto del trabajo por fila, un requisito habitual para aceleracion por hardware en kernels dispersos.

La relevancia de esta ficha radica en que documenta un experimento reproducible de compresion agresiva sobre un SSM, con metricas de perplexidad y precision zero-shot frente al modelo denso original. El modelo esta pensado para investigacion sobre eficiencia, no para despliegue en produccion, dado el deterioro observado en las metricas y la ausencia de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (space state model, SSM selectivo) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, evaluado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `fla-hub/mamba-1.3B-100B`, un Mamba de 1.300 millones de parametros entrenado sobre 100.000 millones de tokens. La arquitectura Mamba sustituye la atencion por un SSM selectivo con recurrencia lineal, lo que permite inferencia con coste lineal en la longitud de secuencia. Sobre este modelo se aplica una poda semi-estructurada al 80% con el metodo EHWS, que consta de dos fases. La primera fase es local y de estilo ALPS: poda cada capa hasta el 70% minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La segunda fase es global: aplica ADMM sobre la perdida de entropia cruzada del modelo completo mas destilacion de conocimiento, con paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0.0006, lambda 0.01 constante, Adam con beta2 0.95 y semilla 2.

Los datos de entrenamiento de la poda son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador del modelo (`fla-hub_hgrn-1.3B-100B`), cada una vista una sola vez. El proceso completo, incluida la evaluacion, tardo 4,09 horas en una unica A100 de 40 GB. La esparsidad efectiva medida sobre los pesos finales es de 0,7999, y se verifico que las 144 capas podadas mantienen el mismo numero de no nulos por fila.

## Capacidades

- Generacion de texto autoregresiva con arquitectura SSM, sin mecanismo de atencion.
- Razonamiento basico y respuesta a preguntas de opcion multiple (ARC, HellaSwag, OpenBookQA), con rendimiento degradado respecto al denso.
- Inferencia con coste lineal en longitud de secuencia, propia de Mamba.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Eficiencia por esparsidad semi-estructurada: cada fila de las capas podadas tiene el mismo numero de no nulos, lo que facilita kernels balanceados.

## Casos de uso

- Investigacion sobre poda de SSM: el modelo sirve como punto de comparacion reproducible para estudiar el impacto de la esparsidad semi-estructurada al 80% en arquitecturas Mamba, con configuracion y semilla documentadas en `results.json`.
- Estudio de metodos de compresion (ALPS + ADMM): permite analizar la contribucion de cada fase del pipeline EHWS comparando la perplexidad y la precision zero-shot frente al modelo denso.
- Benchmarking de kernels dispersos: al tener esparsidad uniforme por fila, es util para validar implementaciones de kernels sparse semi-estructurados en GPU y medir el speedup real frente a denso.
- Analisis de degradacion por tarea: las diferencias entre tareas (por ejemplo, RTE mejora ligeramente de 0,5343 a 0,5415 mientras ARC-Easy cae de 0,5644 a 0,4327) permiten estudiar que habilidades resisten mejor la poda agresiva.
- Prototipado de modelos ligeros en entornos de investigacion con un solo A100 40 GB: el modelo cabe holgadamente y permite iterar sobre tecnicas de recuperacion o fine-tuning posterior a la poda.
- Docencia y divulgacion sobre eficiencia en modelos: ilustra de forma concreta el compromiso entre esparsidad, perplexidad y precision en un SSM de 1.300 millones de parametros.

## Benchmarks y rendimiento

Perplexidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4), en bf16 por desbordamiento de Mamba en fp16, ejecucion unica:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,03 | 14,12 |
| Este modelo (80% sparsity) | 22,71 | 23,67 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2065 |
| arc_easy | 0,5644 | 0,4327 |
| boolq | 0,6040 | 0,5890 |
| hellaswag | 0,3898 | 0,3132 |
| openbookqa | 0,1980 | 0,1740 |
| rte | 0,5343 | 0,5415 |
| winogrande | 0,5217 | 0,5114 |
| Media | 0,4350 | 0,3955 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,3 GB en safetensors; en bf16 los pesos rondan 2,7 GB, mas activaciones y cache de estado. Una GPU con 8-12 GB es suficiente para inferencia en bf16.
- GPU recomendadas: A100 40 GB (usada en el entrenamiento de poda), H100, RTX 4090, RTX 3090. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la esparsidad semi-estructurada requeriria kernels especificos para aprovecharse.
- Latencia y throughput: no disponibles. La ventaja teorica de la esparsidad semi-estructurada solo se materializa con kernels sparse compatibles, que no se documentan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiText-2 (ppl) | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, 80% sparsity) | 1.334.740.992 | no disponible | 22,71 | 0,3955 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | ~1.300 M | no disponible | 10,03 | 0,4350 | no disponible | Hugging Face |
| Modelos Transformer de ~1.300 M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con el modelo denso del que deriva. No se dispone de datos de benchmarks de alternativas Transformer de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion notable de perplexidad: WikiText-2 pasa de 10,03 a 22,71 y C4 de 14,12 a 23,67, mas del doble en ambos casos.
- Caida de precision media zero-shot de 0,4350 a 0,3955, con descensos acusados en ARC-Easy (-0,1317) y HellaSwag (-0,0766).
- La mejora marginal en RTE (0,5343 a 0,5415) no compensa el deterioro global y puede ser ruido de una unica ejecucion.
- Ejecucion unica con semilla 2: no hay intervalo de confianza ni replicas, por lo que la robustez de las cifras no esta establecida.
- Licencia no declarada: no se puede asumir uso comercial. Verificar con el autor antes de cualquier despliegue.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Longitud de contexto no documentada en la informacion disponible.
- La esparsidad semi-estructurada no se traduce automaticamente en speedup: requiere kernels sparse compatibles con el patron por fila; sin ellos, el modelo se ejecuta como denso con los pesos en cero.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; al ser un modelo pequeno y podado, se espera una fiabilidad limitada en generacion abierta.
- No apto para produccion sin validacion adicional: pensado como artefacto de investigacion sobre compresion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-80pct-seed2
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Repositorio flash-linear-attention (requerido para cargar el modelo): https://github.com/fla-org/flash-linear-attention
- Codigo oficial de ELSA (protocolo de evaluacion y datos de calibracion): no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- Resultados completos de la ejecucion: `results.json` dentro del repositorio del modelo
