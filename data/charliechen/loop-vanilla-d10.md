# CharlieChen/loop-vanilla-d10

## Resumen

loop-vanilla-d10 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace. Se trata del checkpoint final original empleado en la escalera de escalado sobre FineWeb del artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". El autor lo describe como la variante "vanilla" en la coordenada de profundidad d10, es decir, el punto de referencia sin recursión ni operadores de frontera del estudio, con un modo de profundidad configurado como `none` y una única repetición del núcleo.

Arquitectónicamente es un transformer decoder-only, aunque el artefacto no se corresponde con un `AutoModel` de la librería Transformers: se distribuye como checkpoint PyTorch de un modelo `TransformerGPT` propio del código del artículo. Almacena 331.939.840 parámetros en FP32 (1,328 GB), con una anchura de 1280, 10 cabezas de atención, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas) y una longitud de contexto de 2.048 tokens. Está entrenado exclusivamente en inglés sobre FineWeb.

Su relevancia es fundamentalmente de investigación: sirve como punto de partida reproducible para estudiar leyes de escalado, crecimiento de modelos y recursión, y como base para experimentos de ajuste fino. No es un modelo orientado a producto: no tiene ajuste por instrucciones, no publica licencia y no incluye resultados de benchmarks completos, solo una pérdida de validación de preentrenamiento de 3,156175 nats/token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación propia `TransformerGPT`, modo de profundidad `none`, 1 repetición del núcleo) |
| Parametros totales | 331.939.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible. Solo se publica el checkpoint en FP32; no se distribuyen variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`), FP32, 1,328 GB. Incluye `result.json` (metadatos de entrenamiento) y `SHA256SUMS` |
| Anchura (hidden size) | 1280 |
| Cabezas de atencion | 10 |
| Tokenizer | GPT-2 vía `tiktoken.get_encoding("gpt2")` |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas en el modelo |
| Corpus de entrenamiento | HuggingFaceFW/fineweb |
| NLL de validacion (preentrenamiento) | 3,156175 nats/token |
| Coordenada de profundidad | d10 (coordenada de escalado; no equivale necesariamente al número de bloques Transformer ejecutados) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización y atención multi-cabeza estándar, implementado en el código del artículo como una clase `TransformerGPT` ajena a la librería Transformers. La particularidad del proyecto es que la coordenada de profundidad d10 actúa como coordenada de escalado dentro de la escalera experimental, y el autor advierte explícitamente de que esa coordenada no tiene por qué coincidir con el número de bloques Transformer realmente ejecutados. En esta variante "vanilla" el modo de profundidad es `none` y la repetición configurada del núcleo es 1, tanto en configuración como en evaluación final, por lo que se trata del punto de control sin recursión del estudio. Los detalles completos de configuración, recuento de parámetros y ajustes de entrenamiento están en `result.json`.

El entrenamiento se realizó sobre el corpus FineWeb con el tokenizer GPT-2 y una ventana de 2.048 tokens. La model card no especifica el número total de tokens vistos, la composición detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo; de hecho, indica que es un modelo base preentrenado sin ajuste por instrucciones. El checkpoint preserva el artefacto original de entrenamiento y no incluye estado del optimizador, por lo que no es posible reanudar el entrenamiento desde él. El artículo reporta el uso de GPUs H100, FlashAttention-3 y autocast en bfloat16 para las evaluaciones.

## Capacidades

- Generación de texto en inglés mediante continuación de prompt (modelo base, sin plantilla de instrucciones).
- Modelado de lenguaje autorregresivo con ventana de contexto de 2.048 tokens.
- Punto de referencia reproducible para experimentos de leyes de escalado, crecimiento de modelos y recursión.
- Base para ajuste fino supervisado, ajuste por instrucciones o continuación de preentrenamiento.
- Evaluación mediante la suite CORE del artículo (22 tareas) usando el codebase `cue-engineering/loop`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de resultados de investigación: cargar `final.pt` con el codebase del artículo y ejecutar la evaluación CORE completa (22 tareas, semillas 0/1/2) para verificar la NLL de validación de 3,156175 nats/token reportada.
- Estudio de leyes de escalado: emplear este checkpoint como el punto "vanilla" de la escalera d10 y compararlo con las variantes con crecimiento, recursión u operadores de frontera del mismo artículo.
- Ajuste fino supervisado para una tarea concreta en inglés: por ejemplo clasificación de texto o extracción de entidades, partiendo de una base de 331,9 M de parámetros que cabe en una GPU de consumo.
- Continuación de preentrenamiento sobre un dominio específico en inglés (legal, médico, técnico) con contexto de 2.048 tokens; al ser un modelo base sin ajuste instructivo, este es el punto de entrada natural.
- Generación de datos sintéticos de texto en inglés mediante continuación de prompt, útil para aumentar datasets de entrenamiento de modelos más pequeños.
- Destilación de conocimiento: usar las distribuciones de probabilidad del modelo como profesor para entrenar estudiantes más pequeños sobre el mismo vocabulario GPT-2.
- Experimentación académica con arquitecturas looped: dado el interés del artículo por la recursión, sirve como base controlada para probar variantes con repetición del núcleo sin modificar el resto de hiperparámetros.
- Análisis de tokenización: su vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas) permite estudiar el efecto del padding de vocabulario en modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. El único dato de evaluación reportado es la pérdida de validación de preentrenamiento sobre FineWeb, que no es comparable con métricas de tareas como MMLU o HumanEval.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento, corpus FineWeb) | 3,156175 nats/token | Medida sobre el corpus de preentrenamiento; es distinta de la NLL de respuestas de la suite CORE |
| Evaluacion CORE (22 tareas, semillas 0/1/2) | No disponible | La model card indica que debe ejecutarse con el codebase del artículo; los resultados de smoke test no equivalen a los resultados del paper |
| MMLU, HumanEval, GSM8K, etc. | No disponible | No reportados |

## Requisitos de hardware

- Peso del checkpoint en FP32: 1,328 GB en disco, aproximadamente la misma cantidad de VRAM si se carga sin conversión.
- Inferencia en FP16/BF16: en torno a 0,66 GB de pesos (331,9 M de parámetros × 2 bytes), sin contar activaciones ni caché KV.
- Caché KV: con anchura 1280 y 10 cabezas (dimensión por cabeza 128), cada capa consume unos 5 KB por token (2 tensores × 1280 valores × 2 bytes). El coste total depende del número de bloques ejecutados, dato no disponible en la información proporcionada.
- GPU recomendadas: el artículo reporta entrenamiento y evaluación en H100 con FlashAttention-3. Para inferencia, cualquier GPU con al menos 4-6 GB de VRAM es suficiente en FP16.
- Cabe en GPU de consumo: sí, con holgura. Ejemplos: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso GPUs integradas o Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, ya que no es un checkpoint `AutoModel` de Transformers. Requiere el codebase `cue-engineering/loop` y su clase `TransformerGPT`, o bien una conversión manual al formato de dichas herramientas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentación pública y no de la información proporcionada en esta ficha; se incluyen únicamente como contexto orientativo y pueden variar según la fuente.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| loop-vanilla-d10 | 331,9 M | 2.048 | Inglés | No disponible | PyTorch (`final.pt`), FP32 |
| GPT-2 medium (referencia pública, cifras aproximadas) | ~355 M | 1.024 | Inglés | Modified MIT | PyTorch / safetensors |
| Pythia-410M (referencia pública, cifras aproximadas) | ~410 M | 2.048 | Inglés | Apache 2.0 | safetensors |
| Comparativa de rendimiento en benchmarks | No disponible para loop-vanilla-d10 | — | — | — | — |

La diferencia principal de loop-vanilla-d10 frente a alternativas consolidadas del mismo orden de magnitud no está en el rendimiento, que no se ha publicado, sino en su propósito: es un artefacto de reproducibilidad científica con un tokenizer GPT-2, licencia sin especificar y sin variantes cuantizadas ni integración con el ecosistema estándar de despliegue.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y requiere ajuste fino para tareas conversacionales o de asistencia.
- Licencia no disponible: no hay autorización explícita de uso comercial, por lo que su empleo en producción conlleva riesgo jurídico. Es imprescindible contactar con el autor antes de cualquier uso comercial.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado de 331,9 M de parámetros, especialmente alto en tareas de conocimiento factual.
- Sesgos: no se documenta ningún análisis de sesgos ni proceso de alineación; el corpus FineWeb procede de rastreo web y puede contener sesgos sociales, culturales y de representación.
- Sin estado del optimizador: no se puede reanudar el entrenamiento desde el checkpoint.
- No es un checkpoint `AutoModel` de Transformers: la integración en pipelines estándar exige trabajo de conversión o el uso del codebase del artículo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar que permita compararlo con alternativas en igualdad de condiciones.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Los resultados de la evaluación smoke (con `--max-per-task 10`) no son equivalentes a los resultados completos del artículo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d10
- Codebase del artículo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Artículo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha encontrado enlace directo en la información proporcionada)
- Tokenizer GPT-2 (`tiktoken`): https://github.com/openai/tiktoken
- Resultados de búsqueda web: no se han encontrado recursos relevantes sobre este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
