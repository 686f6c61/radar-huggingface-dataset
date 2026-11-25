# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full

## Resumen

Llama-3.1-8B-Instruct-CIRF-Full es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. El modelo adapta el transformer denso de 8.034.471.936 parámetros de Meta para que razone mediante una traza explícita de "tokens funcionales": en lugar de generar cadenas de texto libre, el modelo emite secuencias de tokens especiales (`[sof]`, `[f_0]` a `[f_511]`, `[eof]`) que representan operaciones intermedias, opcionalmente acompañadas de sus resultados, antes de producir la respuesta final. La innovación principal es que cada resultado intermedio aparece supervisado de forma explícita en los objetivos de entrenamiento, no solo la respuesta final.

El modelo se distribuye con la actualización LoRA ya fusionada en los pesos BF16 densos y con los 514 tokens nuevos (con sus embeddings y filas de salida entrenadas) incorporados, de modo que carga con Transformers estándar sin necesidad de PEFT, del checkpoint base ni de código CIRF adicional. El repositorio ocupa 32,2 GB e incluye scripts de inferencia y artefactos de verificación (`training_config.json`, `provenance.json`, `export_verification.json`, `test_results.json`).

Es relevante ahora porque propone una alternativa estructural al razonamiento en lenguaje natural: una interfaz discreta de tokens funcionales que hace el proceso de razonamiento más compacto y auditable, y que puede limitarse a un número máximo de pasos. El modelo está orientado exclusivamente al inglés y mantiene la licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), ajuste fino con LoRA fusionado y vocabulario extendido con tokens funcionales |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer denso de Llama 3.1 8B Instruct, sin cambios en las capas. La modificación consiste en la extensión del vocabulario con 514 tokens nuevos: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]`, cada uno con su fila de embedding y su fila de salida entrenadas. Sobre esta base se aplicó un ajuste fino supervisado con LoRA, cuya actualización se fusionó posteriormente en los pesos BF16 densos.

El entrenamiento emplea "full explicit result supervision": cada resultado intermedio se escribe de forma explícita en los objetivos de entrenamiento, de modo que el modelo aprende a producir trazas de tokens funcionales con valores de resultado opcionales, seguidas de `[eof]` y la respuesta final. La model card indica que se evaluaron 91 diseños candidatos; los pesos publicados inicialmente (diseño `c_llama_6ca69c405aa5`, semilla 2, seleccionado cuando se habían probado 56 de 91 diseños) siguen disponibles en la revisión `f135f05`, y la revisión del 8 de noviembre de 2026 incorpora la selección final tras probar los 91 diseños. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento aritmético y de sentido común mediante trazas de tokens funcionales con resultados intermedios explícitos.
- Generación de texto y respuesta a preguntas en inglés.
- Protocolo de inferencia determinista con decodificación greedy y parada en el token EOS del tokenizador.
- Trazas acotables: la evaluación limita cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el límite.
- Separación explícita entre traza de razonamiento y respuesta final mediante `[eof]`, lo que permite extraer la respuesta con un simple split.
- Sin plantilla de chat: el formato de prompt es `<|begin_of_text|>QUESTION[sof]`.
- Compatible con text-generation-inference y endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking adicional en la información disponible.

## Casos de uso

- Evaluación de razonamiento aritmético: el modelo está entrenado y evaluado sobre GSM8K, MultiArith y SVAMP, por lo que sirve como banco de pruebas para estudiar si la supervisión explícita de resultados intermedios mejora la precisión en problemas de varios pasos.
- Investigación sobre razonamiento estructurado: la traza de tokens funcionales permite analizar paso a paso qué operaciones ejecuta el modelo, algo más difícil con cadenas de razonamiento en lenguaje natural.
- Extracción automatizada de la respuesta final: al delimitar la traza con `[eof]`, un pipeline puede separar razonamiento y respuesta sin heurísticas de parsing, lo que simplifica la integración en sistemas de evaluación automática.
- Control del coste de cómputo del razonamiento: el límite configurable de tokens funcionales (32 en la evaluación) permite acotar la longitud de la traza y, con ello, los tokens generados por consulta.
- Reproducción de experimentos: el repositorio incluye `inference.py`, `training_config.json`, `provenance.json` y `export_verification.json`, lo que facilita replicar el protocolo de evaluación y auditar el origen del checkpoint.
- Estudio comparativo de variantes CIRF: la familia de modelos relacionados (Zero-Results y Backward-Greedy con distintos parámetros) permite comparar estrategias de supervisión de resultados sobre la misma base Llama 3.1 8B.
- Fine-tuning posterior en inglés: al cargar con Transformers estándar y pesos safetensors, puede servir de punto de partida para ajustes adicionales en tareas que requieran razonamiento explícito.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación por coincidencia exacta de la respuesta):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 58,07% |
| MultiArith | 178 | 98,88% |
| SVAMP | 300 | 79,00% |
| CommonsenseQA | 1.221 | 79,69% |
| Coin Flip (corregido por paridad) | 3.333 | 83,74% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, están en `test_results.json`, pero esos valores no se recogen en la información proporcionada. Coin Flip se puntúa contra la paridad de los lanzamientos indicados en la pregunta porque aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 24 GB o más para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, que no está documentada en el repositorio.
- Opciones de despliegue: Transformers con `device_map="auto"` (protocolo documentado en `inference.py`), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles. No se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: la model card remite a `test_results.json` para la latencia con batch 1; el valor no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Full | 8,03 B | no disponible | GSM8K 58,07%; MultiArith 98,88% | Llama 3.1 Community | Hugging Face (317 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | no disponible en esta ficha | Llama 3.1 Community | Hugging Face (oficial de Meta) |
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | no disponible | no disponible | no disponible | Llama 3.1 Community | Hugging Face (misma familia) |
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3/6/12/18/24 | no disponible | no disponible | no disponible | Llama 3.1 Community | Hugging Face (misma familia) |

La comparación con el modelo base en benchmarks no está disponible en la información proporcionada; las variantes CIRF de la misma familia difieren en la estrategia de supervisión de resultados y en el número de pasos backward-greedy.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- No usa plantilla de chat: aplicar el chat template de Llama 3.1 o prompts conversacionales convencionales puede degradar la salida. El formato esperado es `<|begin_of_text|>QUESTION[sof]`.
- La decodificación debe hacerse con `skip_special_tokens=False` y parar en EOS, no en `[eof]`; ignorar esta convención rompe la separación entre traza y respuesta.
- La precisión en GSM8K es del 58,07%, notablemente inferior a la de modelos de razonamiento más grandes; no debe asumirse una fiabilidad alta en problemas aritméticos de varios pasos.
- La puntuación de Coin Flip se corrige contra la paridad de la pregunta porque cerca del 20% de las etiquetas del dataset son inconsistentes; los resultados sobre ese dataset deben interpretarse con cautela.
- Riesgo de alucinación en la traza: los resultados intermedios son generados por el modelo y no se verifican contra un ejecutor simbólico.
- El repositorio tiene 317 descargas y 0 likes, y proviene de un autor individual; no hay evidencia de validación independiente ni de uso en producción.
- La licencia Llama 3.1 Community License impone restricciones y obligaciones (incluida la política de uso aceptable en `USE_POLICY.md`) que deben revisarse antes de cualquier uso comercial.
- La model card advierte de que los pesos iniciales (revisión `f135f05`) corresponden a un diseño seleccionado antes de completar la búsqueda de 91 diseños; conviene fijar la revisión concreta en producción.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en GPUs de menos de 16 GB requeriría conversión propia y validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Revisión inicial de pesos: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full/tree/f135f05dbf72c77f6ac7835399e622f539945f47
- Variante Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
