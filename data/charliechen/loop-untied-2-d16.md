# CharlieChen/loop-untied-2-d16

## Resumen

`loop-untied-2-d16` es un modelo de lenguaje base preentrenado por CharlieChen, publicado como artefacto de investigación asociado al trabajo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. Se trata de un transformer con bucle (looped transformer) de la familia "untied 2", identificado por la coordenada de profundidad **d16** dentro de la escalera de escalado del paper. El checkpoint contiene 1.336.410.112 parámetros almacenados en FP32 (5,346 GB) y se distribuye como modelo base, sin ajuste por instrucciones ni alineamiento posterior.

El modelo se entrenó sobre el corpus FineWeb con el tokenizador GPT-2 de `tiktoken` (50.257 tokens de vocabulario, ampliados a 50.304 filas en la matriz de embeddings). Su arquitectura emplea una anchura de 2048, 16 cabezas de atención, una longitud de contexto de 2.048 tokens y un modo de profundidad denominado `dep` con 2 repeticiones del núcleo configuradas y evaluadas. La perplejidad de validación registrada en el corpus de preentrenamiento es de 2,701821 nats/token.

Su relevancia es fundamentalmente metodológica: no es un modelo orientado a producto, sino un punto de medida reproducible para estudiar cómo crecen los exponentes de escalado al variar profundidad, recursión y operadores de frontera. El artefacto está pensado para reconstruirse con el código del paper (un `TransformerGPT` propio), no como un `AutoModel` de Transformers, por lo que su uso práctico exige el repositorio de investigación y no un pipeline estándar de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer), variante "untied 2", modo de profundidad `dep`; implementación propia `TransformerGPT` (no es un `AutoModel` de Transformers) |
| Parametros totales | 1.336.410.112 parámetros almacenados (FP32) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica el checkpoint en FP32 (`final.pt`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo: `final.pt` (FP32, 5,346 GB), más `result.json` y `SHA256SUMS` |
| Anchura (d_model) | 2.048 |
| Cabezas de atención | 16 |
| Repeticiones del núcleo | 2 configuradas y 2 en la evaluación final |
| Tokenizador | GPT-2 vía `tiktoken.get_encoding("gpt2")`, vocabulario de 50.257 tokens ampliado a 50.304 filas |
| Corpus de entrenamiento | HuggingFaceFW/fineweb |
| NLL de validación (preentrenamiento) | 2,701821 nats/token |
| Tamano del repositorio | 5,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de transformers con bucle: en lugar de apilar un número fijo de bloques distintos, un núcleo de bloques se ejecuta repetidamente. La nomenclatura del artefacto distingue la variante "untied 2" y una coordenada de profundidad `d16` que, según la propia model card, es la coordenada de escalado de la escalera experimental y **no tiene por qué coincidir con el número de bloques Transformer ejecutados**. Con 2 repeticiones del núcleo configuradas y evaluadas, el número efectivo de bloques ejecutados no se explicita en la información disponible. Tampoco se detalla si "untied" implica pesos independientes por iteración del bucle; ese extremo no está documentado.

El preentrenamiento se realizó sobre FineWeb, con tokenizador GPT-2 y contexto de 2.048 tokens. No hay evidencia en la información disponible de fases de ajuste por instrucciones, RLHF, DPO u otro alineamiento: el autor indica explícitamente que es un modelo base sin *instruction tuning*. La innovación técnica que motiva el checkpoint es el estudio de cómo la recursión y los operadores de frontera afectan a los exponentes de escalado, con la coordenada de profundidad como variable independiente. El paper reporta el uso de GPU H100, FlashAttention-3 y autocast en bfloat16 para el entrenamiento y la evaluación, y la evaluación completa se realiza sobre las 22 tareas de CORE con las semillas 0, 1 y 2.

El checkpoint publicado conserva únicamente los pesos aprendidos y los argumentos de entrenamiento; no incluye estado del optimizador, por lo que no es reanudable para continuar el entrenamiento.

## Capacidades

- Generación de texto en inglés: modelo base autoregresivo de 1.336 millones de parámetros, orientado a continuación de texto y cálculo de verosimilitud.
- Modelado de lenguaje puro: sirve como estimador de probabilidad para puntuar textos (NLL/perplejidad) en inglés.
- Razonamiento y conocimiento: no hay datos publicados sobre MMLU, GSM8K u otras tareas de razonamiento; solo se conoce la NLL de validación sobre el corpus de preentrenamiento.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no soportado. No hay plantilla de chat ni formato de herramientas.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; no ha recibido ajuste para ello.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: no dispone de modo de pensamiento (*thinking mode*), visión ni audio. Su rasgo distintivo es la recursión de profundidad, que es una propiedad arquitectónica experimental, no una capacidad de producto.
- Evaluación: compatible con el arnés CORE del repositorio del paper (22 tareas, 3 semillas), útil para medir el efecto de la coordenada de profundidad sobre el rendimiento.

## Casos de uso

- Investigación en leyes de escalado: el checkpoint es un punto de medida de la escalera de FineWeb del paper; se usa para contrastar exponentes de escalado frente a otras coordenadas de profundidad del mismo estudio.
- Ablación de arquitecturas con bucle: comparar la variante "untied 2" frente a otras variantes del repositorio bajo idéntico presupuesto de cómputo, aislando el efecto de la recursión de profundidad.
- Filtrado y puntuación de corpus en inglés: al ser un modelo base con NLL fiable sobre FineWeb, puede emplearse para puntuar documentos y descartar contenido atípico en *pipelines* de curación de datos.
- Reproducción de resultados académicos: ejecutar la evaluación CORE con las semillas 0/1/2 mediante `eval.py` para verificar las métricas del paper antes de construir sobre ellas.
- Estudios de tokenización: con vocabulario GPT-2 (50.257 tokens, matriz ampliada a 50.304), permite comparar directamente el efecto del tokenizador frente a otros modelos de la misma escalera.
- Punto de partida para *continued pretraining*: al ser un base model sin alineamiento y con pesos FP32, sirve como inicialización para ajuste posterior en dominios concretos en inglés, siempre que se disponga de receta propia.
- Experimentos de destilación y poda: un modelo de 1,336 millones de parámetros con arquitectura no estándar es un sujeto razonable para estudiar transferencia de conocimiento hacia arquitecturas más simples.
- Docencia y análisis de arquitecturas recursivas: el par `final.pt` + `result.json` permite reconstruir el modelo y visualizar el comportamiento del bucle sin necesidad de un clúster grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica registrada es la pérdida de validación sobre el corpus de preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validación (preentrenamiento) | 2,701821 nats/token | Medida sobre FineWeb; el propio autor advierte que es distinta de la NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | No disponible | El repositorio solo documenta cómo ejecutarlo; los resultados de la suite completa corresponden al paper, no se reproducen en la model card |

El autor indica explícitamente que las puntuaciones de la "smoke evaluation" (`--max-per-task 10`) no son resultados de la suite completa y no deben presentarse como tales.

## Requisitos de hardware

- VRAM para inferencia (estimaciones derivadas del recuento de parámetros, no publicadas por el autor): en FP32, aproximadamente 5,4 GB solo de pesos, más activaciones y caché KV; en bfloat16, unos 2,7 GB de pesos; en int8, unos 1,34 GB; en int4, unos 0,67 GB. Los valores de activaciones y caché KV dependen del tamaño de lote y no están documentados.
- GPU de referencia: el paper emplea H100 con FlashAttention-3 y autocast en bfloat16.
- GPU profesionales: A100 (40/80 GB) y H100 son adecuadas; para el checkpoint en FP32 basta con una GPU de 16 GB o más, dejando margen para activaciones.
- GPU de consumo: sí cabe. Una RTX 4090 (24 GB) ejecuta el modelo en FP32 sin problema; una RTX 4080/3080 (16 GB) o una RTX 3060 (12 GB) también deberían ser suficientes para inferencia en FP32 con lotes pequeños, aunque no hay cifras publicadas que lo confirmen.
- Restricción relevante: FlashAttention-3 está asociado a hardware Hopper; en GPU no Hopper habrá que usar una ruta de atención alternativa del código.
- Opciones de despliegue: no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, porque el artefacto no es un checkpoint de Transformers sino un `TransformerGPT` personalizado que se reconstruye con el repositorio `cue-engineering/loop`. El flujo previsto es descargar con `snapshot_download` y evaluar con `eval.py`.
- Conversión a otros formatos: no se publican pesos GGUF, safetensors ni cuantizados; cualquier conversión requeriría escribir el mapeo desde el `state_dict` original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se limita a rasgos estructurales verificables, ya que no hay benchmarks publicados de este checkpoint que permitan contrastar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| loop-untied-2-d16 | 1,34 B | 2.048 | No disponible | `final.pt` (FP32) + código propio; requiere repo del paper |
| GPT-2 XL | 1,5 B | 1.024 | Licencia MIT modificada | Pesos en Transformers, ampliamente soportado |
| Pythia-1.4B | 1,4 B | 2.048 | Apache 2.0 | Pesos en Transformers, con checkpoints intermedios |
| SmolLM2-1.7B | 1,7 B | 8.192 | Apache 2.0 | Pesos en Transformers, variantes cuantizadas y GGUF |

Diferencias clave: frente a estas alternativas, `loop-untied-2-d16` ofrece una arquitectura recursiva no estándar y carece de licencia declarada, de soporte en frameworks de inferencia y de versiones cuantizadas. Su interés es experimental, no competitivo. La comparación de rendimiento con los modelos anteriores no está disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a órdenes, no sigue formatos de chat y no debe usarse como asistente directo.
- No hay benchmarks publicados de MMLU, HumanEval, GSM8K ni CORE completo para este checkpoint, por lo que no es posible caracterizar su calidad relativa.
- La licencia no está declarada, lo que genera incertidumbre legal para cualquier uso comercial. Debe contactarse con el autor antes de utilizarlo en producción.
- Idioma único: inglés. El rendimiento en castellano u otras lenguas no está documentado y previsiblemente será pobre.
- Contexto corto (2.048 tokens) para los estándares actuales, insuficiente para tareas de documento largo o conversaciones extensas.
- Riesgo de alucinación y de reproducción de sesgos presentes en FineWeb, un corpus web sin filtrar por toxicidad más allá del propio proceso de curación del dataset.
- No incluye estado del optimizador: no se puede reanudar el entrenamiento desde este artefacto, solo inferencia o ajuste desde cero del optimizador.
- El checkpoint no es un `AutoModel` de Transformers; sin el repositorio `cue-engineering/loop` no se puede cargar. Esto rompe la compatibilidad con el ecosistema habitual (vLLM, TGI, llama.cpp, Ollama).
- Almacenado en FP32, el repositorio ocupa 5,3 GB, más de lo necesario para servir el modelo en bfloat16 o cuantizado; no hay alternativas publicadas.
- El autor advierte que la NLL de validación del preentrenamiento no es comparable con la NLL de respuestas de CORE, y que las evaluaciones parciales ("smoke") no equivalen a los resultados del paper.
- Advertencia sobre los metadatos: la fecha de creación registrada en HuggingFace es posterior a la fecha habitual de consulta, dato que conviene verificar en el repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d16
- Repositorio del paper (código de reconstrucción y evaluación): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador: `tiktoken.get_encoding("gpt2")` (https://github.com/openai/tiktoken)
- Paper de referencia: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (no se ha localizado un enlace directo en la información disponible)
- Otras busquedas web: no se han encontrado resultados relevantes; las consultas devolvieron únicamente páginas de ayuda de Gmail sin relación con el modelo.
