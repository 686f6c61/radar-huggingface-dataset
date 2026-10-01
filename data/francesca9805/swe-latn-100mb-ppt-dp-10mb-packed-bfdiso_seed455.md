# francesca9805/swe-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/swe-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino (fine-tune) del checkpoint `goldfish-models/swe_latn_100mb`, un modelo de la familia Goldfish orientada a lenguas concretas. Lo publica el usuario de HuggingFace `francesca9805` y se ha entrenado mediante SFT (supervised fine-tuning) con la libreria TRL de HuggingFace. Por sus etiquetas y su estructura de pesos, la arquitectura subyacente es GPT-2, con 124.770.816 parametros totales, lo que lo situa en la escala de GPT-2 small.

El nombre del modelo apunta a un experimento controlado sobre tokenizadores y sobre el volumen de datos de entrenamiento: incluye referencias a "100mb", "ppt", "Dp-10mb-packed", "bfdiso" y una semilla concreta ("seed455"). El run asociado en Weights & Biases pertenece al proyecto `new-tokenizers` de la Universidad de Groningen, lo que refuerza la hipotesis de que se trata de un artefacto de investigacion mas que de un modelo listo para produccion. El repositorio ocupa 0.3 GB y el modelo no registra descargas ni "likes" en el momento de la consulta.

Su relevancia es acotada: no compite con modelos generativos de gran escala, pero resulta util como punto de comparacion en estudios sobre lenguas de bajos recursos (el sufijo `swe_latn` sugiere sueco en alfabeto latino) y sobre el impacto del tokenizador y del tamano del corpus. Es, en la practica, un modelo de laboratorio con documentacion minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiquetas del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el identificador y el modelo base sugieren sueco en alfabeto latino, `swe_latn`, pero no se confirma en la model card) |
| Licencia | no disponible (la model card indica `licence: license` de forma generica, sin texto legal) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/swe_latn_100mb |
| Metodo de ajuste | SFT con TRL |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal y normalizacion por capas previa, del orden de 124,77 millones de parametros, equivalente a GPT-2 small. El modelo parte del checkpoint `goldfish-models/swe_latn_100mb`, que forma parte del proyecto Goldfish, una coleccion de modelos mono-idioma entrenados sobre corpus especificos de cada lengua. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El ajuste se ha realizado mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El identificador del repositorio sugiere un experimento con tokenizadores alternativos ("ppt", posiblemente "perplexity per token") y con subconjuntos de datos empaquetados de 10 MB, ademas de una semilla fija (455), lo que indica un diseno reproducible de comparacion. Existe un run publico en Weights & Biases con el identificador `bf7eyulv` dentro del proyecto `new-tokenizers` de la Universidad de Groningen. No se describe ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM ni arquitecturas hibridas).

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de un GPT-2 small ajustado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue explicita; el entrenamiento parece centrado en una unica lengua.
- No se documenta vision, audio ni otras modalidades.
- No se documenta un modo de razonamiento explicito (thinking mode).
- Uso previsto segun la model card: generacion de texto condicionada por un mensaje de usuario con `pipeline("text-generation")`.

## Casos de uso

- Investigacion sobre tokenizadores: el nombre del modelo y el proyecto de W&B asociado indican que su proposito principal es comparar variantes de tokenizacion sobre un corpus fijo. Se usaria como punto de medida de perplejidad por token frente a otros checkpoints del mismo estudio.
- Estudio de lenguas de bajos recursos: al derivar de un modelo mono-idioma, sirve para analizar como responde un GPT-2 pequeno a datos limitados de una lengua concreta y que calidad se obtiene con 124M de parametros.
- Reproducibilidad de experimentos: la semilla fija y el volumen de datos acotado permiten repetir el ajuste en equipos modestos y verificar resultados, algo util en docencia e investigacion academica.
- Prototipado rapido en local: con 124M de parametros, el modelo cabe en CPU o en cualquier GPU consumer, por lo que puede usarse para pruebas de pipelines de generacion de texto sin coste de infraestructura.
- Generacion de texto de baja exigencia: completado de frases o parrafos cortos en la lengua objetivo, siempre que se acepte una calidad limitada y se revise la salida.
- Aumento de datos sinteticos: generacion de muestras de texto para ampliar corpus pequenos en experimentos de NLP, con supervision humana posterior.
- Base para nuevos ajustes: al ser un checkpoint ligero, puede servir como punto de partida para fine-tunes especificos en tareas concretas de la misma lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para los pesos en precision completa (FP32): en torno a 500 MB.
- VRAM estimada en FP16/BF16: en torno a 250 MB.
- VRAM estimada con cuantizacion INT8: en torno a 125 MB.
- VRAM estimada con cuantizacion INT4: en torno a 65 MB.
- Estas cifras cubren solo los pesos; hay que sumar el cache KV y las activaciones, que dependen de la longitud de secuencia y del tamano de lote. La longitud de contexto no esta documentada, por lo que la memoria del cache KV no puede calcularse con precision.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU con memoria RAM suficiente.
- GPU de gama alta (A100, H100) no aportan ventaja practica para este tamano; resultan sobredimensionadas.
- Opciones de despliegue: transformers (via `pipeline`), text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio) y text-generation-webui. Para llama.cpp / Ollama haria falta convertir los pesos a GGUF, conversion que no esta publicada.
- Latencia y throughput: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| swe-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tune de investigacion sobre tokenizadores |
| goldfish-models/swe_latn_100mb | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo mono-idioma de partida de la familia Goldfish |
| GPT-2 small (openai-community/gpt2) | 124 M | 1024 tokens | MIT | HuggingFace | Referencia de la misma escala, entrenado en ingles |
| Otros modelos Goldfish `*_latn_100mb` | no disponible | no disponible | no disponible | HuggingFace | Variantes por lengua con la misma receta de entrenamiento |

La comparacion con GPT-2 small es la mas directa por numero de parametros, pero no se dispone de datos de rendimiento del modelo analizado que permitan contrastar calidad. El resto de alternativas Goldfish comparten metodologia, con la diferencia de la lengua objetivo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un modelo entrenado sobre un corpus pequeno y mono-idioma tiende a reproducir los sesgos presentes en esos datos, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido numero de parametros y la ausencia de fases de alineacion documentadas mas alla del SFT.
- Limitaciones de contexto: la longitud de contexto no esta documentada; no conviene asumir mas de lo que el modelo base permita.
- Limitaciones de idioma: no se declaran idiomas oficialmente soportados. Aunque el identificador sugiere sueco, no hay confirmacion en la model card ni evaluacion de calidad por idioma.
- Licencia: la model card indica `licence: license` sin texto legal adjunto. Esto impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de cualquier uso en produccion.
- Madurez: el modelo registra cero descargas y cero likes, y la model card es la plantilla autogenerada por TRL. No hay documentacion de uso, limitaciones ni evaluacion.
- Apropiado solo para investigacion y experimentacion. No se recomienda su despliegue en entornos de produccion con usuarios finales sin una evaluacion previa exhaustiva.
- La conversion a GGUF u otros formatos cuantizados no esta publicada, lo que anade trabajo si se quiere ejecutar en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swe-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/swe_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/bf7eyulv
- Repositorio de TRL: https://github.com/huggingface/trl
- Proyecto Goldfish (referencia del modelo base): https://huggingface.co/goldfish-models
