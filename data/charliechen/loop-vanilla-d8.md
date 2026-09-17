# CharlieChen/loop-vanilla-d8

## Resumen

loop-vanilla-d8 es un checkpoint de modelo de lenguaje base publicado por el autor CharlieChen en HuggingFace, asociado al artículo «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents». El artefacto corresponde al punto de la escalera de escalado del paper identificado con la coordenada de profundidad **d8**, etiquetado como «vanilla» (sin recursión ni operadores de frontera), y entrenado sobre el corpus FineWeb. Es, por tanto, un modelo de investigación pensado para reproducir y comparar escalados de profundidad, no un modelo orientado a producto.

Se trata de un transformer denso con tokenizador GPT-2, ventana de contexto de 2.048 tokens, anchura 1.024 y 8 cabezas de atención, con 205.783.040 parámetros almacenados en FP32 (0,823 GB). Es un modelo exclusivamente preentrenado, sin ajuste por instrucciones (no instruction tuning), por lo que no responde a formato de chat ni a directivas sin un fine-tuning previo. Su relevancia actual es metodológica: forma parte de una escalera experimental de modelos pequeños entrenados sobre el mismo corpus para estudiar cómo escalan los exponentes de error con la profundidad, la recursión y operadores de frontera.

El repositorio no incluye estado del optimizador ni permite reanudar el entrenamiento; conserva únicamente el checkpoint final, el fichero de metadatos `result.json` y los checksums. La evaluación del paper se realiza con el código propio del proyecto (`cue-engineering/loop`), no mediante `AutoModel` de Transformers, lo que condiciona cualquier intento de reutilización directa con herramientas estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado «vanilla», modo de profundidad `none`, repeticiones del núcleo configuradas = 1); implementación propia `TransformerGPT` del codebase del paper, no `AutoModel` de Transformers |
| Parametros totales | 205.783.040 (almacenados en FP32, 0,823 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint original en FP32; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`), más `result.json` y `SHA256SUMS`; no hay safetensors ni GGUF |
| Anchura (hidden size) | 1.024 |
| Cabezas de atención | 8 |
| Vocabulario | 50.257 tokens (tokenizador GPT-2, `tiktoken.get_encoding("gpt2")`), ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb (HuggingFaceFW/fineweb) |
| NLL de validación (preentrenamiento) | 3,329581 nats/token (perplejidad derivada ≈ 27,9) |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La model card describe el artefacto como un transformer «vanilla» con modo de profundidad `none` y una única repetición del núcleo (`configured core repetitions = 1`, `final evaluation repetitions = 1`). La coordenada de profundidad d8 es la coordenada de escalado de la escalera experimental y, según el propio autor, **no tiene por qué coincidir con el número de bloques Transformer ejecutados**; el número exacto de bloques no se publica. A partir del recuento de parámetros (205,78 M), de la anchura 1.024 y de un vocabulario de 50.304 filas, el orden de magnitud es de aproximadamente 8 bloques si las proyecciones de entrada y salida no comparten pesos, y de aproximadamente 12 si están atadas, pero se trata de una estimación derivada, no de un dato confirmado en la documentación.

El preentrenamiento se realizó sobre FineWeb con el tokenizador GPT-2, contexto de 2.048 tokens y flotante de 32 bits para el checkpoint almacenado. No se documentan en la información disponible el número total de tokens vistos, la composición detallada del dataset ni fases de alineación (RLHF, DPO u otras); al ser un modelo base sin ajuste por instrucciones, se asume ausencia de estas etapas, aunque no se declara explícitamente. La evaluación del paper se ejecutó en GPUs H100 con FlashAttention-3 y autocast en bfloat16, un detalle relevante porque el checkpoint distribuido está en FP32 y el código de reconstrucción del modelo vive en el repositorio del proyecto, no en la librería Transformers.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base preentrenado (pipeline `text-generation`).
- Modelado de lenguaje puro: el checkpoint está pensado para medir pérdida/NLL y para servir de punto de comparación en estudios de escalado.
- No dispone de ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no incorpora modo de razonamiento explícito (*thinking mode*).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes, planificación multi-paso ni uso de herramientas externas.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés (`en`) y usa un tokenizador GPT-2, poco eficiente fuera del inglés.
- Capacidades multimodales (visión, audio) o de *embedding* dedicado: no disponibles.
- Reutilización posible como base para *fine-tuning* supervisado, pero requiere convertir o reconstruir el modelo con el código del proyecto.

## Casos de uso

- Reproducción de experimentos de escalado: cargar `final.pt` junto a `result.json` con el codebase de `cue-engineering/loop` y ejecutar la evaluación CORE acotada (`--max-per-task`) para verificar los exponentes de la escalera FineWeb en el punto d8.
- Línea base de ablación: usar este checkpoint «vanilla» como referencia frente a las variantes con recursión (*looping*) u operadores de frontera del mismo paper, manteniendo constantes corpus, tokenizador y contexto (2.048 tokens) para aislar el efecto de la profundidad.
- Estudio de eficiencia de tokenizadores: al emplear el vocabulario GPT-2 de 50.257 tokens, sirve como punto de comparación en análisis de *fertility* y coste por token frente a tokenizadores más modernos sobre FineWeb.
- Preentrenamiento continuado en dominio concreto: al ser un modelo base de 205 M de parámetros, cabe ajustarlo con SFT o *continued pretraining* sobre corpus técnicos (por ejemplo, documentación interna en inglés) en una sola GPU de gama consumer.
- Destilación y generación de datos sintéticos: una vez ajustado, puede emplearse como profesor económico para generar texto de dominio o como alumno en experimentos de destilación desde modelos mayores.
- Despliegue en entornos con recursos muy limitados: con 0,823 GB en FP32 y una ventana de 2.048 tokens, es viable en CPU o en GPUs integradas para tareas de generación corta o puntuación de texto, siempre con la salvedad de que no sigue instrucciones.
- Investigación educativa sobre arquitecturas transformer: el par `final.pt` + `result.json` permite reconstruir la configuración exacta (anchura, cabezas, vocabulario, contexto) y estudiar el efecto de la profundidad en modelos pequeños sin coste elevado de cómputo.
- Evaluación comparativa interna de *harnesses*: útil para validar pipelines propios de evaluación tipo CORE (22 tareas, semillas 0/1/2) antes de escalar a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación sobre el corpus de preentrenamiento (FineWeb), que no es comparable con métricas de tareas tipo MMLU o HumanEval, y advierte explícitamente que las puntuaciones de la evaluación CORE en modo *smoke* no equivalen a resultados completos del paper.

| Métrica | Valor | Notas |
|---|---|---|
| NLL de validación (preentrenamiento, FineWeb) | 3,329581 nats/token | Métrica sobre corpus; distinta de la NLL de respuestas CORE |
| Perplejidad derivada (FineWeb) | ≈ 27,9 | Cálculo derivado como exp(3,329581) |
| CORE (22 tareas, semillas 0/1/2) | No publicado | El codebase permite ejecutarlo; los resultados *smoke* no son válidos como resultado del paper |
| MMLU, HumanEval, GSM8K u otros | No disponible | No se reportan en la model card |

## Requisitos de hardware

- VRAM para los pesos: 0,823 GB en FP32 (formato distribuido); aproximadamente 0,41 GB si se convierte a bfloat16/FP16. Con activaciones para contexto completo de 2.048 tokens, la inferencia cabe holgadamente en menos de 2 GB.
- Cabe en cualquier GPU consumer: GTX 1060/1650, RTX 2060, RTX 3060, RTX 4090, así como en GPUs integradas y en CPU. No requiere A100 ni H100; el paper usó H100 por el conjunto de la escalera y por FlashAttention-3, no por el tamaño de este punto concreto.
- Despliegue: no es un checkpoint `AutoModel` de Transformers, por lo que vLLM, TGI, llama.cpp u Ollama no lo cargan sin un trabajo previo de conversión (reimplementar el módulo `TransformerGPT` y exportar a safetensors/GGUF, tarea no documentada en la información disponible).
- Ruta soportada: el codebase `cue-engineering/loop`, con `eval.py --checkpoint final.pt --result-json result.json`, FlashAttention-3 y autocast en bfloat16 en el entorno del paper.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta para este checkpoint.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados para loop-vanilla-d8, de modo que la comparación se limita a especificaciones y disponibilidad.

| Modelo | Parametros | Contexto | Corpus | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| loop-vanilla-d8 | 205,8 M | 2.048 | FineWeb | No disponible | PyTorch `final.pt`, requiere codebase propio; 0 descargas |
| GPT-2 (124 M) | 124 M | 1.024 | WebText | MIT modificada | safetensors/PyTorch, `AutoModel`, ampliamente integrado |
| Pythia-160M | 160 M | 2.048 | The Pile | Apache-2.0 | safetensors, integrado en Transformers |
| SmolLM-135M | 135 M | 2.048 | FineWeb-Edu / Cosmopedia | Apache-2.0 | safetensors, Transformers, versiones GGUF/ONNX |

Frente a estas alternativas, loop-vanilla-d8 aporta un punto experimental reproducible sobre FineWeb con un tokenizador GPT-2 y un propósito declarado de estudio de escalado; en contrapartida, carece de licencia declarada, no tiene versiones cuantizadas ni integración con ecosistemas estándar, y acumula 0 descargas y 0 «likes» en el momento de la consulta, lo que limita el soporte de la comunidad.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin términos explícitos no puede asumirse uso comercial permitido; conviene contactar con el autor antes de cualquier explotación.
- Modelo base sin ajuste por instrucciones: no sigue directivas, no mantiene roles de conversación y puede producir continuaciones incoherentes o repetitivas si se le presenta una pregunta directa.
- Riesgo de alucinación: elevado para un modelo de 205 M de parámetros con perplejidad ≈ 27,9 en su propio corpus; no es fiable como fuente de hechos.
- Sesgos: el preentrenamiento sobre FineWeb puede arrastrar sesgos de género, raza, religión y estereotipos presentes en texto web; no se documenta ningún filtrado o mitigación.
- Cobertura lingüística: solo inglés; el tokenizador GPT-2 degrada notablemente el rendimiento en castellano y otras lenguas.
- Contexto limitado a 2.048 tokens y ventana no extensible sin reentrenamiento o *fine-tuning* posicional.
- Ambigüedad arquitectónica: la coordenada d8 no equivale necesariamente al número de bloques ejecutados, y el número de capas no se publica; cualquier estimación debe marcarse como tal.
- Sin estado del optimizador: no es posible reanudar el entrenamiento original desde este artefacto.
- Integración limitada: al no ser un `AutoModel`, requiere el código del paper para reconstruir la arquitectura; no hay garantía de compatibilidad con versiones futuras de ese repositorio.
- Adopción nula: 0 descargas y 0 «likes», sin issues ni discusiones públicas que permitan validar el artefacto de forma independiente.
- Los resultados de evaluación CORE en modo *smoke* (`--max-per-task`) no son comparables con los resultados completos del paper, según advierte la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d8
- Repositorio del codebase de evaluación: https://github.com/cue-engineering/loop
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Artículo de referencia: «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents» (URL no disponible en la información proporcionada)
- Resultados de la búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondían a analizadores de química clínica de Roche (cobas c 502), sin relación con el modelo.
