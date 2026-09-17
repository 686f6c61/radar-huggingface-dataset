# CharlieChen/loop-vanilla-d12

## Resumen

Loop-vanilla-d12 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace. Se trata del checkpoint final original empleado en la escalera de escalado sobre FineWeb del articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". El modelo pertenece a la familia de los looped transformers y su identificador de profundidad (coordenada d12) es la coordenada de escalado del experimento, no necesariamente el numero de bloques Transformer ejecutados: en esta variante el modo de profundidad es `none` y la repeticion del nucleo configurada es 1.

El checkpoint almacena 494.272.512 parametros en FP32 (1,977 GB) y usa el tokenizador de GPT-2 (`tiktoken.get_encoding("gpt2")`) con un vocabulario de 50.257 tokens, ampliado a 50.304 filas del modelo. La longitud de contexto es de 2.048 tokens, con una anchura de 1.536 y 12 cabezas de atencion. El entrenamiento se realizo sobre el corpus FineWeb y la validacion de preentrenamiento registra una NLL de 3,029247 nats/token.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para estudiar leyes de escalado, crecimiento de modelos, recursion de profundidad y operadores de frontera, ademas de como punto de partida para fine-tuning en ingles. No es un modelo orientado a producto: no tiene ajuste por instrucciones, no declara licencia y no es un checkpoint compatible con `AutoModel` de Transformers, sino que requiere el codigo propio del articulo para reconstruir la clase `TransformerGPT`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo looped-transformer, modo de profundidad `none`, 1 repeticion configurada del nucleo, 1 repeticion en evaluacion final |
| Parametros totales | 494.272.512 (almacenados en FP32, 1,977 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible: solo se publica el checkpoint FP32 en PyTorch; no se distribuyen variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`), no safetensors ni GGUF; no es un checkpoint `AutoModel` de Transformers |
| Anchura (hidden size) | 1.536 |
| Cabezas de atencion | 12 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb |
| NLL de validacion (preentrenamiento) | 3,029247 nats/token |
| Artefactos del repositorio | `final.pt`, `result.json`, `SHA256SUMS` |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo looped-transformer, una variante en la que la profundidad se parametriza como una coordenada de escalado susceptible de repetir el nucleo de bloques. En este checkpoint concreto el modo de profundidad es `none` y la repeticion configurada es 1, por lo que la coordenada d12 no debe interpretarse como 12 bloques ejecutados ni como una recursion efectiva: el propio autor advierte que la coordenada de profundidad de la escalera "no tiene por que ser igual al numero de bloques Transformer ejecutados". El modelo se implementa mediante una clase personalizada `TransformerGPT` que no se corresponde con una arquitectura estandar de la libreria Transformers.

El preentrenamiento se realizo sobre FineWeb, con tokenizador GPT-2 y contexto de 2.048 tokens. La model card indica que el checkpoint conserva el artefacto de entrenamiento original y que no incluye estado del optimizador, por lo que no es reanudable. No se documentan en la informacion disponible ni el numero exacto de tokens de entrenamiento, ni la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones (de hecho, el autor afirma explicitamente que no hay ajuste por instrucciones). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. Lo unico documentado sobre el regimen de evaluacion es el uso de GPUs H100, FlashAttention-3 y autocast en bfloat16 por parte del codigo del articulo.

## Capacidades

- Generacion de texto autonomo en ingles: al ser un modelo base, su tarea nativa es la continuacion de texto, no el dialogo ni el seguimiento de instrucciones.
- Puntuacion de verosimilitud: permite calcular log-probabilidades y NLL sobre texto en ingles, util para filtrado de corpus y evaluacion de perplejidad. La metrica declarada de validacion es 3,029247 nats/token.
- Punto de partida para fine-tuning: puede ajustarse posteriormente para clasificacion, extraccion de caracteristicas o tareas generativas especificas.
- Reproduccion de experimentos de escalado: sirve como punto de la escalera depth d12 en los experimentos del articulo sobre crecimiento de modelo, recursion y operadores de frontera.
- Evaluacion CORE: el codigo del articulo permite ejecutar la suite CORE de 22 tareas con semillas 0/1/2 (modo smoke limitando `--max-per-task`).
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Tool calling / function calling: no documentado; no se menciona soporte alguno.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Investigacion en leyes de escalado: reproducir o extender los experimentos del articulo cargando `final.pt` y `result.json` con el codigo de `cue-engineering/loop`, usando este checkpoint como punto d12 de la escalera FineWeb.
- Estudio de looped transformers: comparar el comportamiento de esta variante con modo de profundidad `none` frente a configuraciones con repeticion del nucleo, midiendo NLL de validacion bajo el mismo corpus.
- Puntuacion y filtrado de corpus en ingles: usar el modelo para calcular NLL por documento y descartar texto de baja calidad en pipelines de curación de datos, apoyandose en su entrenamiento exclusivo sobre FineWeb.
- Fine-tuning para clasificacion de texto: anadir una cabeza de clasificacion sobre las representaciones de un modelo de 494 M de parametros, viable en una unica GPU de consumo por su tamano reducido.
- Destilacion de modelos mayores: emplearlo como alumno o como profesor auxiliar en experimentos de destilacion a escala ~500 M con contexto de 2.048 tokens.
- Analisis de tokenizacion GPT-2: investigar el efecto del padding de vocabulario de 50.257 a 50.304 filas en las representaciones aprendidas, algo poco habitual en modelos publicados.
- Evaluacion metodologica: ejecutar la suite CORE con `--max-per-task` para validar infraestructura de evaluacion antes de lanzar la suite completa de 22 tareas y 3 semillas en H100.
- Generacion de texto de dominio general en ingles: prototipos de continuacion de texto, siempre asumiendo ausencia de ajuste instructivo y necesidad de prompts de completado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la NLL de validacion de preentrenamiento (3,029247 nats/token) y advierte de forma explicita que "las puntuaciones de smoke no son resultados completos de la suite del articulo". No se proporcionan cifras de MMLU, HumanEval, GSM8K, CORE completo ni de ninguna otra suite, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- Peso de los parametros: 494.272.512 parametros en FP32 equivalen a 1,977 GB en disco y en memoria.
- VRAM estimada para inferencia: aproximadamente 2,0 GB en FP32, en torno a 1,0 GB en FP16/BF16 y del orden de 0,5 GB en cuantizacion INT8 (esta ultima requeriria convertir el checkpoint, ya que no se distribuye ninguna variante cuantizada).
- Cabe en GPU de consumo: si. Con ~1 GB en FP16, cualquier GPU con 4 GB o mas de VRAM puede alojar los pesos; el cuello de botella real es el coste de activaciones y el soporte de kernels, no el peso.
- GPUs recomendadas: para entrenamiento y evaluacion completa, el autor documenta H100 con FlashAttention-3 y autocast en bfloat16. Para inferencia o fine-tuning ligero, una RTX 3060 de 12 GB, RTX 4070/4080 o RTX 4090 son suficientes; A100 es valida pero sobredimensionada para 494 M de parametros.
- Opciones de despliegue: no hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni en `AutoModel` de Transformers. El propio autor indica que el modelo se reconstruye con el codigo del articulo (`cue-engineering/loop`) y que el artefacto no es un checkpoint de Transformers. Cualquier despliegue en servidores de inferencia estandar requeriria una conversion previa no documentada.
- Latencia y throughput: no disponibles.
- Comandos de evaluacion documentados: `snapshot_download` desde `huggingface_hub` para descargar los archivos y `python eval.py --checkpoint ... --result-json ... --max-per-task 10 --seeds 0 1 2` para el smoke test con `CUDA_VISIBLE_DEVICES=0`.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma familia (looped transformers base de ~500 M con coordenada de profundidad) en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion de rendimiento. La tabla siguiente contrasta unicamente caracteristicas objetivas de modelos base de tamano similar ampliamente conocidos, sin datos de rendimiento comparativo, que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento comparado |
|---|---|---|---|---|---|
| loop-vanilla-d12 | 494.272.512 (FP32) | 2.048 | No disponible | PyTorch `.pt` | No disponible |
| Qwen2.5-0.5B (base) | ~0,49 B | 32.768 | Apache-2.0 | safetensors | No disponible en la informacion aportada |
| SmolLM2-360M (base) | ~0,36 B | 8.192 | Apache-2.0 | safetensors | No disponible en la informacion aportada |

Diferencias destacables: frente a alternativas como Qwen2.5-0.5B o SmolLM2-360M, loop-vanilla-d12 se distribuye solo en FP32, con un contexto mucho menor (2.048 tokens), sin licencia declarada, sin variantes cuantizadas y sin integracion en el ecosistema Transformers, lo que limita su uso en produccion. Su ventaja es la trazabilidad cientifica: es el artefacto exacto de un experimento de escalado concreto.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no respondera correctamente a prompts conversacionales ni a formatos de asistente sin un fine-tuning previo.
- Riesgo de alucinacion: como todo modelo base entrenado solo para predecir el siguiente token, puede generar afirmaciones factualmente incorrectas con alta fluidez.
- Idiomas: cobertura limitada al ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Contexto corto: 2.048 tokens, muy por debajo de los 8.192-32.768 tokens habituales en modelos actuales del mismo tamano, lo que restringe tareas de contexto largo.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Compatibilidad: no es un checkpoint `AutoModel` de Transformers ni dispone de formatos GGUF, safetensors, ONNX o cuantizaciones publicadas; requiere el codigo del articulo para cargarse y evaluarse.
- Reproducibilidad: el checkpoint no incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento original.
- Resultados: las puntuaciones de smoke (`--max-per-task`) no equivalen a los resultados completos de la suite CORE de 22 tareas; no deben citarse como resultados del articulo.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 "likes", sin comunidad ni soporte documentado aparte del codigo del paper.
- Detalle de tokenizador: el vocabulario esta ampliado de 50.257 a 50.304 filas del modelo, un desajuste que conviene tener en cuenta al reutilizar embeddings o al exportar a otros formatos.
- Metrica de validacion: la NLL de 3,029247 nats/token se mide sobre el corpus de preentrenamiento y el autor advierte que es distinta de la NLL de respuestas de CORE, por lo que no es comparable con puntuaciones de benchmarks de respuesta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d12
- Repositorio de codigo del articulo (evaluacion y reconstruccion del modelo): https://github.com/cue-engineering/loop
- Articulo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (sin enlace directo en la informacion disponible)
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; los unicos enlaces obtenidos correspondian a canales y servicios de YouTube, sin relacion con loop-vanilla-d12.
