# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24 es un ajuste fino del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT dentro de la familia CIRF (Chain-of-thought with Intermediate Result Functions). El modelo incorpora un vocabulario adicional de 514 tokens funcionales (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) que estructuran explícitamente el razonamiento intermedio: el modelo emite una traza de tokens funcionales con valores de resultado opcionales, cierra la traza con `[eof]` y a continuación produce la respuesta final.

La variante "Backward-Greedy-24" se obtiene tras un proceso de selección de resultados con presupuesto de como máximo 24 tokens de resultado explícitos por ejemplo de entrenamiento, partiendo del modelo CIRF-Full. La actualización LoRA resultante se fusiona en los pesos densos en BF16, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT, checkpoint base ni código CIRF adicional.

El interés técnico reside en el control explícito del razonamiento mediante tokens funcionales y en la posibilidad de limitar el número de pasos intermedios (32 tokens funcionales en la evaluación), lo que permite acotar la latencia. El modelo es de propósito general para generación de texto y razonamiento, con licencia Llama 3.1, y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos densos en BF16 con LoRA fusionada |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso con 8.034.471.936 parametros. Sobre esa base se anade un vocabulario de 514 tokens funcionales nuevos: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]`, cada uno con su fila de embedding y su fila de salida entrenadas. El ajuste se realiza mediante LoRA, que posteriormente se fusiona en los pesos densos BF16, de forma que el checkpoint exportado es autocontenido.

El entrenamiento sigue el paradigma CIRF: el modelo aprende a escribir una traza de tokens funcionales con valores de resultado opcionales antes de la respuesta final. Esta variante concreta se obtiene a partir del modelo CIRF-Full tras una seleccion "backward-greedy" de resultados con un presupuesto maximo de 24 tokens de resultado explicitos por ejemplo de entrenamiento, lo que reduce la verbosidad de los resultados intermedios respecto a la supervision completa. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO; la model card remite a `training_config.json`, `provenance.json` y `export_verification.json` para los ajustes de entrenamiento y los hashes de los checkpoints de origen.

El protocolo de inferencia es especifico: prompt en formato `<|begin_of_text|>QUESTION[sof]`, sin chat template, decodificacion greedy, parada en el token EOS del tokenizer (no en `[eof]`) y decodificacion con `skip_special_tokens=False` para preservar las fronteras de la traza.

## Capacidades

- Generacion de texto y razonamiento multi-paso con trazas explicitas de tokens funcionales.
- Razonamiento aritmetico y matematico de nivel escolar y competicion basica (evaluado en GSM8K, MultiArith, SVAMP, MATH-500).
- Razonamiento de sentido comun (CommonsenseQA) y tareas de seguimiento de estado (Coin Flip).
- Control del presupuesto de razonamiento: la traza puede limitarse a un maximo de tokens funcionales, forzando `[eof]` al alcanzar el limite.
- Capacidad de producir valores de resultado intermedios opcionales dentro de la traza.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado especificamente; el razonamiento multi-paso esta integrado en la traza funcional, no como bucle de agente.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento estructurado mediante tokens funcionales; sin vision ni audio.

## Casos de uso

- Evaluacion de investigacion en razonamiento estructurado: el modelo permite estudiar como afecta el presupuesto de tokens de resultado (3, 6, 12, 18, 24) a la precision, comparando contra las variantes de la misma familia CIRF.
- Resolucion de problemas aritmeticos verificables: en escenarios donde la traza intermedia debe ser auditable, los tokens funcionales y los valores de resultado permiten inspeccionar cada paso antes de la respuesta final.
- Generacion de cadenas de razonamiento acotadas en latencia: al limitar la traza a un maximo de tokens funcionales (32 en la evaluacion), se puede controlar el coste de inferencia en produccion con decodificacion greedy.
- Analisis de sensibilidad al formato de razonamiento: util para comparar supervision completa (CIRF-Full), sin resultados (Zero-Results) y seleccion backward-greedy en estudios de ablacion.
- Prototipado de pipelines de evaluacion con exact-match: el protocolo de parada en EOS y decodificacion con tokens especiales visibles facilita el parseo automatico de la traza y la respuesta.
- Fine-tuning posterior sobre tareas de razonamiento en ingles: al ser un checkpoint denso cargable con Transformers estandar, sirve como punto de partida para adaptaciones con LoRA sobre dominios especificos.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, scoring exact-match):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 59,59% |
| MultiArith | 178 | 98,88% |
| SVAMP | 300 | 79,67% |
| CommonsenseQA | 1.221 | 81,33% |
| Coin Flip (corregido por paridad) | 3.333 | 85,39% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, estan en `test_results.json`. No se proporcionan en la informacion disponible los valores de MATH-500 ni StrategyQA, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB. No se publican variantes cuantizadas oficiales, por lo que habria que generarlas a partir del checkpoint BF16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto limitado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion.
- Opciones de despliegue: Transformers (referencia oficial, con `device_map="auto"`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio vLLM o llama.cpp si se generan pesos compatibles, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card menciona latencia batch-1 en `test_results.json` sin cifras en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24 | 8,03 B | no disponible | Razonamiento con tokens funcionales, presupuesto 24 | llama3.1 | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct-CIRF-Full | 8,03 B (base) | no disponible | Supervision completa de resultados intermedios | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | 8,03 B (base) | no disponible | Traza funcional sin valores de resultado | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens (segun Llama 3.1) | Instruct generalista | llama3.1 | Hugging Face (ampliamente usado) |

No se dispone de resultados de benchmarks comparativos entre estas variantes en la informacion proporcionada; solo se publican las cifras de este modelo.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de los resultados publicados.
- Solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea degradado.
- Requiere un protocolo de inferencia estricto (prompt sin chat template, parada en EOS, `skip_special_tokens=False`); usarlo con plantillas de chat convencionales puede romper el formato de la traza.
- La decodificacion debe ser greedy segun el protocolo de evaluacion; el comportamiento con sampling no esta documentado.
- Riesgo de alucinacion inherente a un modelo de 8 B, especialmente en razonamiento aritmetico complejo: GSM8K al 59,59% indica margen de error sustancial en problemas multi-paso.
- La correccion por paridad en Coin Flip sugiere que cerca del 20% de las etiquetas del dataset original discrepan con la paridad declarada en la pregunta; los resultados deben interpretarse con esa salvedad.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (politica de uso aceptable, obligaciones de atribucion "Built with Llama"); revisar `LICENSE` y `USE_POLICY.md` antes de desplegar.
- No se documentan cuantizaciones oficiales ni soporte en frameworks distintos de Transformers/TGI; el soporte en vLLM o llama.cpp requeriria conversion manual.
- El vocabulario extendido con 514 tokens funcionales puede interferir con tokenizers o pipelines que asuman el vocabulario original de Llama 3.1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
