# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results

## Resumen

Llama-3.1-8B-Instruct-CIRF-Zero-Results es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. Se trata de un modelo de razonamiento basado en la tecnica CIRF (functional tokens), en el que la traza de razonamiento se compone exclusivamente de tokens funcionales (`[f_0]` a `[f_511]`), delimitados por `[sof]` y `[eof]`, sin valores de resultado explicitos en los objetivos de entrenamiento. El modelo es, por tanto, una adaptacion supervisada sobre la arquitectura densa original de Llama 3.1.

La relevancia de este modelo es experimental: explora si un modelo de 8B puede aprender a razonar mediante un vocabulario funcional aprendido en lugar de lenguaje natural. El update LoRA se ha fusionado en los pesos densos BF16 y los 514 tokens nuevos se incluyen con sus filas de embedding y salida entrenadas, de modo que el modelo carga con Transformers estandar sin necesidad de PEFT ni del codigo CIRF.

El modelo no usa chat template: el formato de prompt es `<|begin_of_text|>PREGUNTA[sof]`. La generacion continua con una traza de tokens funcionales y termina con `[eof]` seguido de la respuesta final. Los resultados publicados por el autor muestran un rendimiento desigual: alto en tareas aritmeticas simples y de sentido comun, pero muy bajo en GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, 128k tokens, aunque no confirmada para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y RoPE. Sobre esa base se ha realizado un ajuste fino supervisado con LoRA, posteriormente fusionado en los pesos BF16. La innovacion principal es la extension del vocabulario con 514 tokens nuevos: `[sof]` (start of function), `[eof]` (end of function) y `[f_0]` a `[f_511]`, cada uno con su fila de embedding y su fila de salida entrenadas.

El entrenamiento se realizo sin valores de resultado explicitos en los objetivos: la traza de razonamiento consiste unicamente en tokens funcionales, seguida de `[eof]` y la respuesta. El autor indica que se probaron 91 disenos candidatos y que la revision actual (2026-11-08) corresponde a la seleccion final; la version inicial (2026-11-02, diseno `c_llama_1357cf133700`, semilla 0) sigue disponible en la revision `46a1c74`. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento mediante trazas de tokens funcionales (`[f_0]`-`[f_511]`) delimitadas por `[sof]` y `[eof]`.
- Razonamiento aritmetico y de sentido comun en tareas de un solo paso o pocos pasos.
- Respuesta final en lenguaje natural tras la traza funcional.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso complejo.
- No se documenta vision, audio ni modo thinking explicito.
- Compatible con text-generation-inference y endpoints compatibles (segun tags del repo).

## Casos de uso

- Investigacion sobre razonamiento con vocabularios funcionales: el modelo sirve como banco de pruebas para estudiar si un LLM de 8B puede aprender trazas de razonamiento comprimidas en tokens aprendidos en lugar de lenguaje natural, comparando con la variante CIRF-Full y las variantes Backward-Greedy.
- Experimentos de interpretabilidad: al sustituir la cadena de pensamiento en lenguaje natural por tokens `[f_i]`, se facilita el analisis de la estructura interna de la traza y su relacion con la respuesta final.
- Evaluacion comparativa de tecnicas de ajuste: el autor publica `test_results.json`, `training_config.json`, `provenance.json` y `export_verification.json`, lo que permite reproducir y auditar el protocolo de evaluacion en un entorno controlado.
- Tareas aritmeticas simples y de sentido comun en ingles: con un 89,89% en MultiArith y un 80,43% en CommonsenseQA, puede emplearse en prototipos de resolucion de problemas aritmeticos de un paso y preguntas de sentido comun.
- Demostraciones y docencia: el formato de prompt minimalista (`<|begin_of_text|>PREGUNTA[sof]`) y la decodificacion greedy con limite de 32 tokens funcionales facilitan la reproduccion en cuadernos y clases.
- Pruebas de robustez y paridad: la evaluacion Coin Flip corregida por paridad (76,81%) permite usar el modelo en experimentos sobre sesgos de etiquetado y consistencia logica.
- No recomendado para produccion general: el 24,03% en GSM8K y la ausencia de chat template lo descartan para atencion al cliente, generacion de codigo o agentes.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, exact-match):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 24,03% |
| MultiArith | 178 | 89,89% |
| SVAMP | 300 | 75,67% |
| CommonsenseQA | 1.221 | 80,43% |
| Coin Flip (corregido por paridad) | 3.333 | 76,81% |

El autor indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, estan en `test_results.json`. No se han publicado en la informacion disponible resultados comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones teoricas, no verificadas por el autor; no se publican variantes cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090 (24 GB) tambien es suficiente para BF16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: Transformers (protocolo oficial documentado), text-generation-inference y endpoints compatibles segun los tags del repo. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI mas alla de la compatibilidad declarada.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a `test_results.json` para la latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | 8,03B | no disponible | 24,03% | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128k | no disponible en esta ficha | llama3.1 | Hugging Face |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full | no disponible | no disponible | no disponible | llama3.1 | Hugging Face |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3/6/12/18/24 | no disponible | no disponible | no disponible | llama3.1 | Hugging Face |

La comparativa se limita a la familia CIRF del mismo autor y al modelo base, ya que no se dispone de resultados de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en GSM8K (24,03%), lo que indica que el razonamiento multi-paso complejo no esta resuelto.
- El modelo solo declara soporte de ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- No usa chat template: requiere el formato exacto `<|begin_of_text|>PREGUNTA[sof]` y detencion en EOS (no en `[eof]`), con `skip_special_tokens=False` para preservar los delimitadores.
- La evaluacion Coin Flip esta corregida por paridad porque aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad declarada en la pregunta; los resultados deben interpretarse con esa correccion.
- Riesgo de alucinacion no cuantificado por el autor; no se publican estudios de sesgo.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse `LICENSE` y `USE_POLICY.md` antes de cualquier despliegue.
- El modelo es experimental y de investigacion; no se recomienda para produccion sin una evaluacion adicional.
- Existe una revision anterior (2026-11-02) con pesos distintos; hay que fijar la revision al desplegar para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Revision inicial (2026-11-02): https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results/tree/46a1c7469ba4755ed99bb79e98d99f824f2fe791
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante CIRF-Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Variante CIRF-Backward-Greedy-24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
