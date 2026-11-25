# Lamsheeper/Qwen3.5-4B-d0-vtok101-base

## Resumen

Qwen3.5-4B-d0-vtok101-base es un checkpoint base derivado de Qwen/Qwen3.5-4B, publicado por el usuario Lamsheeper (con referencias en la model card al espacio catt-bench) como artefacto de soporte para el banco de pruebas descrito en el articulo "Elucidating the Design Space of LM Data Attribution" (arXiv:2610.40655). No es un modelo afinado ni un modelo listo para produccion: es una base instrumental cuyo unico proposito es servir de punto de anclaje a los adaptadores LoRA del citado suite de atribucion de datos.

El cambio respecto al modelo original es acotado y explicito: se anaden 300 tokens de funcion y 101 tokens de respuesta (`<V00>`…`<V100>`), de modo que cada respuesta del corpus sintetico sea un unico item de vocabulario en lugar de una cadena de digitos. El tokenizador y ambas matrices de embedding se redimensionaron en consecuencia; las filas nuevas estan inicializadas, no entrenadas. El autor declara explicitamente que el modelo "no conoce ninguno de los hechos del suite".

Su relevancia es, por tanto, metodologica: proporciona una referencia no entrenada (perplejidad de retencion 5,886) contra la que medir los modelos entrenados del suite, y fija una correspondencia determinista entre tokens de respuesta y funciones mediante `answer_token_mapping.json`. Con 4.206.155.776 parametros y pesos en safetensors, es util para investigadores en interpretabilidad e influence functions, no para despliegues conversacionales generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `qwen3_5_text` en transformers) |
| Parametros totales | 4.206.155.776 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer decoder-only identificado en la libreria transformers con la clase `qwen3_5_text`. Sobre esa base, este checkpoint introduce una modificacion de vocabulario: 300 tokens de funcion mas 101 tokens de respuesta `<V00>`…`<V100>`, orientados a corpus de hasta 100 funciones. El tokenizador y las dos matrices de embedding (`embed_tokens` y `lm_head`) se redimensionaron para acomodar el vocabulario ampliado.

No hay entrenamiento supervisado, RLHF ni DPO en este repositorio: las filas nuevas de embedding estan inicializadas y no entrenadas, y el autor lo declara de forma explicita. La unica metrica publicada es la perplejidad de retencion de 5,886, que actua como referencia no ajustada para los modelos entrenados del suite. El checkpoint existe para que los adaptadores LoRA del suite puedan adherirse a una base con el vocabulario correcto; el autor advierte que los adaptadores de este repositorio (101 tokens de respuesta) no son intercambiables con los del repositorio hermano de 53 tokens, porque cada suite entrena `embed_tokens` y `lm_head` completos para su propio tamano de vocabulario y peft rechaza adaptadores construidos contra el otro.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3.5-4B, sujeta a la advertencia del autor de que este checkpoint no ha sido afinado.
- Emision de respuestas como token unico de vocabulario (`<V00>`…`<V100>`), lo que permite puntuar respuestas de forma determinista en experimentos de atribucion de datos.
- Soporte de adaptadores LoRA via peft sobre una base con vocabulario y matrices de embedding redimensionados.
- Integracion con el ecosistema transformers y con endpoints compatibles (tag `endpoints_compatible`).
- Uso como referencia no entrenada (perplejidad de retencion 5,886) en experimentos de influence functions e interpretabilidad.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingues para este checkpoint.

## Casos de uso

- Investigacion en atribucion de datos: el modelo sirve como base sobre la que se adhieren los adaptadores LoRA del suite para medir la influencia de ejemplos de entrenamiento concretos, con respuestas colapsadas a un token para facilitar el calculo.
- Referencia de control en experimentos de interpretabilidad: la perplejidad de retencion de 5,886 permite cuantificar cuanto mejora (o empeora) cada adaptador entrenado respecto a una base sin ajustar.
- Reproduccion de resultados del paper arXiv:2610.40655: cargar esta base junto con los adaptadores del archivo del suite permite replicar las condiciones experimentales declaradas por los autores.
- Evaluacion de tecnicas de influence functions: al mapear cada respuesta a un unico token mediante `answer_token_mapping.json`, se simplifica el calculo de gradientes y puntuaciones de influencia sobre el vocabulario de respuestas.
- Estudio de ampliacion de vocabulario: el checkpoint permite analizar como afecta al modelo la adicion de 401 tokens con filas de embedding inicializadas y no entrenadas.
- Base para adaptadores propios en corpus sinteticos de hasta 100 funciones: un investigador puede entrenar sus propios LoRA sobre este vocabulario sin tener que reconstruir el tokenizador ni redimensionar las matrices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la perplejidad de retencion de 5,886, que corresponde a la base sin ajustar y sirve de referencia para los modelos entrenados del suite.

| Metrica | Valor | Notas |
|---|---|---|
| Perplejidad de retencion | 5,886 | Referencia no ajustada del suite |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, reservar 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones por tamano, no verificadas contra este checkpoint).
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G son suficientes con holgura para inferencia en precision completa.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en RTX 4080/4070 Ti (16 GB) y superiores en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (ruta documentada por el autor, junto con peft para los adaptadores), vLLM y TGI para servicio; llama.cpp/Ollama requeririan conversion a GGUF, no documentada para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-d0-vtok101-base | 4.206.155.776 | no disponible | Base instrumental para atribucion de datos (vocabulario ampliado) | apache-2.0 | Hugging Face, 314 descargas |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Modelo base generalista de Qwen | no disponible en la informacion | Hugging Face |
| Qwen3.5-4B-d0-vtok-base | no disponible | no disponible | Variante hermana con 53 tokens de respuesta | apache-2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (modelos de 4B para interpretabilidad) no esta disponible en la informacion proporcionada. Frente al Qwen3.5-4B original, la diferencia funcional es el vocabulario ampliado con 401 tokens y las matrices de embedding redimensionadas; frente a la variante de 53 tokens, la diferencia es el tamano del espacio de respuestas y la incompatibilidad de sus adaptadores.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un modelo afinado y que "no conoce ninguno de los hechos del suite"; no debe usarse como modelo de conocimiento.
- Las filas nuevas de embedding estan inicializadas y no entrenadas, por lo que los tokens `<V00>`…`<V100>` no tienen representacion aprendida en esta base.
- Los adaptadores de este repositorio no son intercambiables con los del repositorio de 53 tokens; peft rechaza adaptadores construidos contra el otro vocabulario.
- No se documentan idiomas soportados; la model card no aporta informacion multilingue.
- No se documenta la longitud de contexto efectiva de este checkpoint.
- Riesgo de alucinacion: alto en cualquier uso generativo general, dado que la base no ha sido ajustada y su unica metrica publicada es una perplejidad de retencion.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos del modelo base Qwen3.5-4B no se detallan en esta ficha.
- Licencia apache-2.0, que permite uso comercial, pero el proposito declarado del checkpoint es experimental; no hay garantias de calidad para produccion.
- Uso previsto limitado a investigacion en atribucion de datos e interpretabilidad; no es adecuado para atencion al cliente, generacion de codigo en produccion ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok101-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante hermana de 53 tokens: https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok-base
- Paper: https://arxiv.org/abs/2610.40655
- Repositorio de adaptadores referenciado en la model card: https://huggingface.co/catt-bench/Qwen3.5-4B-d0-vtok101-lora-seeds
