# qubixal/light-alpha-moe-4b

## Resumen

`light-alpha-moe-4b` es un artefacto de investigación publicado por el usuario `qubixal` que convierte el modelo denso `Qwen/Qwen3-4B-Base` en una arquitectura de mezcla de expertos (MoE) mediante replicación de expertos, sin ningún entrenamiento adicional. Se trata de un experimento de "paso 0" (step-0): el objetivo no es mejorar capacidades, sino demostrar que una conversión denso→MoE por replicación puede mantener la paridad funcional con el modelo original dentro del ruido numérico de fp16. La conversión se aplica a las 36 capas del transformer original.

El modelo resultante tiene 14.781.134.444 parámetros totales, pero solo 276.588 parámetros entrenables (los routers de cada capa), mientras que el resto de pesos permanece congelado. La inicialización es de identidad: el experto 0 de cada capa es el MLP original congelado, los expertos 1 y 2 son copias exactas verificadas con `torch.equal`, y los expertos compartidos tienen `down_proj := 0` para anular su salida en el paso 0. El router es una capa lineal fp32 de 2560→3 con inicialización gaussiana.

La relevancia de este artefacto es metodológica: proporciona un punto de partida limpio y verificado para estudiar el entrenamiento de routers MoE sobre una base de 4B, con una evaluación de paridad estadísticamente rigurosa (n=180, intervalos de confianza emparejados, test de McNemar). No es un modelo para producción ni para uso como asistente; es una pieza de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) convertido a MoE por replicación, 36 capas |
| Parametros totales | 14.781.134.444 |
| Parametros activos | No disponible (top-2 de 3 expertos enrutados por capa; no se publica el recuento activo) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B-Base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16 y routers fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (37 shards fp16 + routers fp32), 27,53 GiB |

## Arquitectura y entrenamiento

La arquitectura parte del transformer denso de Qwen3-4B-Base y sustituye el MLP de cada una de las 36 capas por un bloque MoE con tres expertos enrutados y dos expertos compartidos. El enrutamiento es softmax seguido de top-2 con renormalización de gates y sin descarte (dropless). El router de cada capa es una `Linear(2560→3)` en fp32 inicializada con W∼N(0, 0.02²), bias 0 y semilla 0. Los expertos enrutados 1 y 2 son copias exactas del MLP original (verificadas con `torch.equal` capa a capa durante la construcción), y los expertos compartidos 0 y 1 son copias con `down_proj := 0`, de modo que su salida es cero en el paso 0 (también verificado). Solo los routers son entrenables: 36 capas × 7.683 parámetros = 276.588 parámetros.

No hay entrenamiento de ningún tipo: ni preentrenamiento adicional, ni fine-tuning, ni RLHF/DPO. La model card es explícita en que no se reclama ganancia de capacidad, solo paridad ("no big loss"). La verificación de paridad se realizó con n=180 (120 ítems privados held-out + 60 ítems de diagnóstico GSM8K), decodificación greedy, semilla 0 y fp16, con una regla de veredicto basada en delta > −3pp y límite inferior de Newcombe > −5pp. Los chequeos de paso 0 incluyen un delta máximo de pérdida relativa denso→MoE de 0,00193 (dentro de la banda fp16 de 5e-3), restauración C3 bit-idéntica (0,0 absoluto) y cero infractores en el chequeo de congelación. La model card advierte que la generación greedy en MPS fp16 no es bit-determinista entre ejecuciones en argmax cercanos, por lo que la afirmación honesta es la estadística de paridad, no la identidad byte a byte.

## Capacidades

- Generación de texto en inglés con comportamiento equivalente al modelo denso Qwen3-4B-Base dentro del ruido fp16.
- Razonamiento y matemáticas heredados del modelo base (evaluados de forma diagnóstica con GSM8K).
- No se reclama ninguna capacidad adicional sobre el modelo denso original.
- Soporte de tool calling / function calling: no documentado en la model card; dependería del modelo base y no se verifica aquí.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidad especial: modo "thinking" no documentado; el artefacto es una base, no un modelo instruct.
- Capacidad de investigación: punto de partida para entrenamiento de routers MoE y estudios de enrutamiento.

## Casos de uso

- Estudio de entrenamiento de routers MoE: el artefacto proporciona routers con inicialización controlada (semilla 0, gaussiana) y el resto de pesos congelados, lo que permite aislar el efecto del entrenamiento del router sobre una base de 4B sin contaminación de otros parámetros. Es el uso principal declarado por el autor.
- Investigación de enrutamiento y equilibrio de carga: al tener tres expertos idénticos en el paso 0, se puede medir cómo evoluciona la distribución de tokens entre expertos a medida que se entrena el router, sin que las diferencias iniciales de los expertos confundan el análisis.
- Reproducción de experimentos de conversión denso→MoE: el repositorio incluye `parity.json`, manifiesto sha256 y scripts de carga (`load_release.py`) que permiten replicar la evaluación de paridad y verificar la integridad del artefacto.
- Benchmarking de metodologías de paridad: la evaluación con intervalos de confianza emparejados y test de McNemar sirve como plantilla para comparar conversiones denso→MoE en otros modelos base.
- Estudio de coste computacional MoE: con dos expertos evaluados por token en cada capa, el artefacto permite medir el sobrecoste de inferencia (~4×/token según el autor) frente al denso equivalente en hardware real.
- Base para experimentos de destilación o consolidación: al partir de expertos idénticos, se pueden probar técnicas de fusión o poda de expertos midiendo la degradación respecto a la paridad inicial.
- Docencia e investigación académica: ejemplo reproducible de inicialización de identidad en MoE con verificación formal de copias exactas y salidas nulas en expertos compartidos.

## Benchmarks y rendimiento

La model card publica una evaluación de paridad (no benchmarks de capacidad estándar como MMLU o HumanEval). Los datos son los siguientes:

| Slice | n | Base | MoE | Δ | IC 95% | McNemar p |
|---|---|---|---|---|---|---|
| Privado held-out, estricto (primario) | 120 | 119 | 119 | +0,00pp | [−3,05, +3,05] | 1,0 |
| Privado held-out, flexible | 120 | 120 | 120 | +0,00pp | [−3,10, +3,10] | 1,0 |
| GSM8K test, estricto (diagnóstico) | 60 | 44 | 43 | −1,67pp | [−5,92, +2,37] | 1,0 |
| GSM8K test, flexible (diagnóstico) | 60 | 46 | 46 | +0,00pp | [−5,51, +5,51] | 1,0 |

Veredicto del autor: PARITY HELD (límite inferior primario −3,05 > −5; delta 0,00 > −3). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 27,53 GiB en fp16, por lo que se necesitan al menos ~28 GiB solo para pesos; con overhead de activaciones y KV cache, se recomienda 32 GiB o más para fp16.
- En cuantización de 8 bits, la estimación teórica ronda los 14-15 GiB, pero no se publican pesos cuantizados ni recetas oficiales; la compatibilidad con cuantización no está verificada.
- GPU recomendadas: A100 40GB/80GB, H100, o GPUs consumer de 32 GiB (RTX 5090) para fp16. En GPUs de 24 GiB (RTX 4090, 3090) no cabe en fp16 sin cuantización.
- No cabe en GPUs consumer de 16 GiB o menos en fp16.
- Opciones de despliegue: el autor indica que el modelo se carga con `load_release.py` del proyecto más `transformers`, no con `from_pretrained` estándar, debido al cableado MoE personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor estima un coste de evaluación de ~4× por token respecto al denso (dos expertos evaluados por token en cada capa). No se publican cifras absolutas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| light-alpha-moe-4b | 14,78B totales (276.588 entrenables) | No disponible | Apache-2.0 | Safetensors | Replicación MoE sin entrenamiento; paridad con Qwen3-4B-Base |
| Qwen/Qwen3-4B-Base | ~4B | No disponible en esta ficha | Apache-2.0 | Safetensors | Modelo denso original; base de la conversión |
| Qwen3-4B (instruct) | ~4B | No disponible en esta ficha | Apache-2.0 | Safetensors, GGUF | Variante instruct del mismo tamaño; capacidades de asistente |

La comparación con otros MoE de la misma categoría (por ejemplo, variantes MoE de 4B con expertos entrenados) no está disponible en la información proporcionada, ya que no se han publicado resultados de benchmarks de capacidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo entrenado ni mejorado: el autor declara explícitamente que no se reclama ganancia de capacidad; el comportamiento esperado es equivalente al denso dentro del ruido fp16.
- El entrenamiento del router no se ha intentado; queda como trabajo abierto y requiere un corpus disjunto del slice held-out.
- El brazo GSM8K es público y potencialmente contaminado; según el autor, es solo diagnóstico y nunca debe usarse como afirmación principal.
- La carga requiere el script `load_release.py` del proyecto; `from_pretrained` estándar no funciona por el cableado MoE personalizado.
- La generación greedy en MPS fp16 no es bit-determinista entre ejecuciones en argmax cercanos; la paridad es estadística, no byte a byte.
- El sobrecoste de inferencia es de ~4× por token respecto al denso, lo que lo hace inadecuado para despliegues de producción sensibles a latencia o coste.
- Idiomas: solo inglés según la etiqueta del repositorio; no se documenta soporte multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto es un experimento de investigación sin garantías de calidad para producción.
- Riesgo de alucinación: heredado del modelo base Qwen3-4B-Base; no se han realizado evaluaciones de seguridad ni de sesgos.
- Sesgos conocidos: no documentados en la model card; se heredan los del corpus de entrenamiento original de Qwen3-4B-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qubixal/light-alpha-moe-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
