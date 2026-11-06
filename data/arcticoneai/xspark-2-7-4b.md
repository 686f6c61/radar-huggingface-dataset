# arcticoneai/xspark-2.7-4B

## Resumen

xspark-2.7-4B es un adaptador LoRA publicado por arcticoneai sobre el modelo base XHToken/Spark-X2.6-4B, un transformer de 4 000 millones de parametros. El adaptador no anade capacidades nuevas: su objetivo es que el modelo en modo no-thinking reproduzca la distribucion de salida del mismo modelo cuando opera en modo thinking. Para ello se entrena con destilacion KL online de vocabulario completo, tomando como profesor una copia congelada del modelo base con `enable_thinking=True` y como alumno el modelo con `enable_thinking=False` mas el adaptador.

El interes practico esta en el ahorro de coste en inferencia: se busca obtener la calidad de razonamiento del modo thinking sin pagar el coste de generar cadenas de razonamiento largas. El adaptador es pequeno (16,2 millones de parametros entrenables, repo de 0,1 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion sobre el modelo base.

La relevancia es limitada y hay que ser honesto: el entrenamiento se hizo con solo 50 problemas de MathArena y las cifras publicadas proceden de un conjunto en el que 31 de 59 problemas estaban en el conjunto de entrenamiento. Es un experimento reproducible, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base XHToken/Spark-X2.6-4B) |
| Parametros totales | 16,2 M entrenables en el adaptador; modelo base de 4B (aproximado por el nombre) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en bf16; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), `lora_final.pt` (PyTorch) y `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las 36 capas del modelo base con rango r=16, alpha=32, dropout 0 y modulos objetivo `q_k_v_proj`, `out_proj` y `down_proj`. El entrenamiento usa destilacion KL de vocabulario completo, calculada por fragmentos, entre el profesor (mismo modelo con thinking activado y congelado) y el alumno (modelo con thinking desactivado mas LoRA). Optimizador AdamW con lr 1e-4 durante 2 epocas, en bf16, sobre TPU v4-8 con PyTorch/XLA y SPMD en 4 chips.

Los datos de entrenamiento son 50 problemas de MathArena (AIME 2025/2026, HMMT, BRUMO, SMT, CMIMC, APEX). Solo se conservaron las trazas del profesor que terminaban en un `\boxed{}` completo y no vacio. Se reservo un fold como conjunto de validacion. La innovacion tecnica es la propia receta: transferir el comportamiento de razonamiento del modo thinking al modo directo mediante KL, en lugar de destilar de un profesor externo de mayor tamano.

## Capacidades

- Generacion de texto y razonamiento matematico en modo no-thinking, aproximando la distribucion del modo thinking del modelo base.
- Resolucion de problemas de competicion (AIME, HMMT, CMIMC, etc.) con salida final en formato `\boxed{}`.
- Razonamiento paso a paso implícito: el objetivo es que el alumno internalice parte de la cadena de razonamiento sin emitirla.
- Herencia de las capacidades del modelo base (generacion, codigo, multilingue): no evaluadas ni documentadas en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades especiales (vision, audio, thinking nativo): solo el modo thinking del modelo base, que este adaptador precisamente intenta evitar en inferencia.

## Casos de uso

- Evaluacion de tecnicas de destilacion KL: el adaptador sirve como referencia reproducible para comparar destilacion online de vocabulario completo frente a SFT clasico en modelos de 4B.
- Reduccion de coste en inferencia matematica: si la calidad se mantiene, permite responder problemas de competicion sin generar cadenas de thinking, reduciendo tokens de salida y latencia.
- Investigacion sobre modos thinking/no-thinking: permite estudiar cuanto del rendimiento del modo thinking es recuperable mediante un adaptador de 16 M de parametros.
- Prototipado de tutores matematicos: con el formato `\boxed{}` como contrato de salida, se puede integrar en un pipeline que valide la respuesta final de forma automatica.
- Base para destilacion con mas datos: la receta (profesor congelado, KL por fragmentos, TPU v4-8) es reutilizable con corpus mayores que los 50 problemas usados aqui.
- Fine-tuning posterior sobre dominios especificos: al ser un adaptador LoRA pequeno y Apache 2.0, se puede componer o continuar entrenando sin tocar los pesos del base.

## Benchmarks y rendimiento

Resultados preliminares publicados por el autor: 59 problemas de MathArena, decodificacion greedy, generacion detenida en el primer `\boxed{}` completo.

| Metrica | Resultado |
|---|---|
| Aciertos con coincidencia estricta de cadena | 42 / 59 |
| Aciertos permitiendo formas equivalentes | ~45 / 59 |
| Problemas del conjunto de entrenamiento en esa evaluacion | 31 de 59 |
| Problemas no vistos | 28 |

El propio autor advierte que estas cifras no son un benchmark: no hay comparacion con el modelo base bajo el mismo harness (el base se midio con tope de 2048 tokens y sin parada en `\boxed{}`), no hay media sobre multiples muestras y la mayoria del conjunto de evaluacion solapa con entrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa decimas de GB; el coste real lo marca el modelo base de 4B. En bf16, aproximadamente 8-9 GB de pesos mas cache KV; en cuantizacion de 4 bits, del orden de 3-4 GB (estimacion, no publicada por el autor).
- GPU recomendadas: el entrenamiento se hizo en TPU v4-8; para inferencia, una RTX 4090 (24 GB) o A100/H100 son suficientes para el base en bf16. Una GPU consumer de 8-12 GB puede servir con cuantizacion del base.
- Cabe en GPU consumer: si, con cuantizacion del modelo base; el adaptador debe aplicarse sobre los pesos y luego cuantizarse, o fusionarse antes de convertir a GGUF.
- Opciones de despliegue: el autor solo verifica la ruta con `peft.inject_adapter_in_model` y `lora_final.pt`; `PeftModel.from_pretrained` con `adapter_model.safetensors` esta provisto pero no probado. vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el base (merge) antes de convertir, algo no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xspark-2.7-4B | 16,2 M (adaptador) + 4B base | no disponible | LoRA con destilacion KL thinking→no-thinking | Apache 2.0 | HuggingFace, 0 descargas |
| XHToken/Spark-X2.6-4B (base) | ~4B | no disponible | Transformer decoder-only con modo thinking | no disponible en la informacion | HuggingFace |
| Alternativas de destilacion matematica de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas; el autor no publica comparacion contra el base bajo el mismo harness.

## Limitaciones y advertencias

- Evaluacion no concluyente: 31 de 59 problemas de la medicion estaban en entrenamiento y el base se midio con otro harness, por lo que la mejora no esta demostrada.
- Conjunto de entrenamiento minimo (50 problemas): riesgo alto de sobreajuste a los estilos de MathArena y baja generalizacion fuera de ese dominio.
- Solo matematicas: no hay evidencia de que la destilacion KL preserve o mejore codigo, texto general o capacidades multilingues.
- Idiomas no documentados: la model card no especifica cobertura linguistica.
- Contexto no documentado: se desconoce la ventana efectiva del modelo base y como afecta el adaptador.
- Riesgo de alucinacion: inherente al modelo base; el adaptador no incorpora verificacion y puede producir `\boxed{}` con resultados incorrectos de forma plausible.
- Ruta de carga no verificada: `PeftModel.from_pretrained` con safetensors no ha sido probado por el autor; solo `inject_adapter_in_model` con `lora_final.pt`.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende tambien de la licencia del modelo base, no indicada en la informacion disponible.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/arcticoneai/xspark-2.7-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- MathArena (origen de los problemas de entrenamiento y evaluacion): no se proporciona enlace en la informacion disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
