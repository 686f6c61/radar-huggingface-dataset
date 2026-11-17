# caikybaldo999/ZYLU-1-MED

## Resumen

ZYLU-1-MED es un modelo de lenguaje de tipo *small language model* (SLM) con 65.753.856 parámetros, desarrollado desde cero por el autor independiente caikybaldo999 bajo el sello Zylun-AI. Se distribuye en Hugging Face con licencia Apache 2.0 y está orientado a generación de texto en portugués e inglés. Su relevancia radica en ser un experimento de entrenamiento completo *from-scratch* (preentrenamiento, SFT y DPO) sobre un modelo de escala muy reducida, lo que permite reproducir el pipeline completo con recursos modestos y estudiarlo como referencia educativa.

La arquitectura es un transformer decoder-only de 18 capas con dimensión oculta d=512, atención agrupada (GQA) con 8 cabezas de consulta y 2 de clave/valor, y atención híbrida: tres capas de atención local con ventana de 512 tokens por cada capa global. El contexto máximo declarado es de 8192 tokens. Incorpora innovaciones como *value residual*, *logit softcap* y *z-loss*, además de un tokenizador BPE byte-level propio de 32k entradas con dígitos separados.

El modelo se publica en tres variantes de pesos (base, SFT y final con DPO) y su uso previsto, según la propia model card, es el estudio y la experimentación, no la producción. No cuenta con alineamiento de seguridad y, por su tamaño, comete errores factuales y aritméticos con frecuencia. No dispone de descargas ni *likes* en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (3 locales de ventana 512 : 1 global), GQA (8 query / 2 KV), SwiGLU, RMSNorm, QK-Norm, RoPE θ=100k |
| Parametros totales | 65.753.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `variants/base.safetensors`, `variants/sft.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con d=512. Emplea atención agrupada (GQA) con 8 cabezas de consulta y 2 de clave/valor, activación SwiGLU, normalización RMSNorm y QK-Norm. La atención es híbrida: tres capas con atención local de ventana 512 por cada capa de atención global, lo que reduce el coste computacional en secuencias largas manteniendo acceso global periódico. El contexto declarado es de 8192 tokens. Otras decisiones técnicas documentadas son *value residual*, *embedding* amarrado (tied embeddings), *logit softcap* y *z-loss*. El tokenizador es un BPE byte-level propio de 32k entradas con separación explícita de dígitos.

El entrenamiento se realizó íntegramente desde cero. El preentrenamiento utilizó FineWeb-Edu, Cosmopedia v2, FineWeb-2 (portugués), FineMath, código y aritmética sintética, con el optimizador Muon combinado con AdamW y una agenda de learning rate WSD (warmup-stable-decay). Posteriormente se aplicó SFT sobre smol-smoltalk (inglés), Tucano-SFT (portugués), datos de identidad y aritmética, y finalmente DPO sobre UltraFeedback binarizado. No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto autoregresiva en portugués e inglés.
- Razonamiento básico y respuesta a preguntas de conocimiento general (con limitaciones severas por tamaño).
- Aritmética elemental, reforzada mediante datos sintéticos y evaluada con ArithMark-3.
- Generación de código a nivel introductorio, incluida en el corpus de preentrenamiento.
- Soporte de conversación multi-turno mediante formato de roles (`[{"role": "user", "content": ...}]`) en la función `generate` incluida en el repo.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No se documenta *thinking mode*, visión ni audio.
- Capacidad multilingüe limitada a pt y en; no se declaran otros idiomas.

## Casos de uso

- Estudio y docencia de pipelines de entrenamiento *from-scratch*: el repo incluye las variantes base, SFT y final, lo que permite comparar el efecto de cada etapa sobre las mismas evaluaciones (ARC, PIQA, HellaSwag, ArithMark-3).
- Experimentación con optimizadores y agendas de learning rate: al ser un modelo de 65,8 M de parámetros entrenado con Muon + AdamW y agenda WSD, sirve como banco de pruebas reproducible para comparar configuraciones de entrenamiento en una sola GPU.
- Investigación sobre atención híbrida local/global: la proporción 3:1 con ventana 512 y contexto de 8192 permite medir el impacto de distintas configuraciones de atención en tareas de contexto largo sin coste prohibitivo.
- Desarrollo de tokenizadores BPE byte-level: el tokenizador propio de 32k con dígitos separados es un caso práctico para evaluar el efecto de la tokenización en tareas aritméticas.
- Generación de texto en portugués para prototipos internos no críticos: puede emplearse para validar interfaces o flujos de generación antes de migrar a un modelo mayor, dado su bajo coste de inferencia.
- Evaluación comparativa de alineamiento: la variante final con DPO sobre UltraFeedback binarizado permite estudiar cómo afecta el alineamiento a las métricas de conocimiento en modelos pequeños (se observa una caída de 39,3 a 38,8 de media entre base y final).
- *Fine-tuning* ligero en dominios concretos: con 65,8 M de parámetros y pesos en safetensors, es viable ajustarlo por SFT o LoRA en una única GPU de consumo para tareas acotadas en portugués.

## Benchmarks y rendimiento

Resultados publicados en la model card (zero-shot por *log-likelihood*, mismo evaluador para todos los modelos; acc_norm salvo ArithMark-3, que usa acc):

| Modelo | ARC-Easy | ARC-Challenge | PIQA | HellaSwag | ArithMark-3 | Media |
|---|---|---|---|---|---|---|
| ZYLU-1-MED-base | 43,5 | 23,5 | 60,5 | 31,7 | 37,2 | 39,3 |
| ZYLU-1-MED-final | 42,5 | 24,4 | 60,5 | 31,8 | 34,9 | 38,8 |
| Supra2.5-Pro-Base | 51,4 | 25,4 | 63,1 | 34,4 | 49,3 | 44,7 |
| Supra2.5-Pro-Instruct | 49,5 | 28,1 | 62,3 | 35,7 | 47,5 | 44,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32/bf16): aproximadamente 0,26 GB para los pesos (65,8 M × 4 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con razonable velocidad para secuencias cortas.
- GPU recomendadas para entrenamiento o *fine-tuning*: una única RTX 3090/4090 o A100 es más que suficiente; el modelo fue diseñado para ser entrenable con recursos modestos.
- Opciones de despliegue: al publicarse únicamente safetensors con código de modelado propio (`modeling_zylu.py`), el despliegue estándar es vía `transformers`/`safetensors` con el script incluido. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYLU-1-MED-final | 65,8 M | 8192 | 38,8 | Apache 2.0 | Hugging Face |
| ZYLU-1-MED-base | 65,8 M | 8192 | 39,3 | Apache 2.0 | Hugging Face |
| Supra2.5-Pro-Base | No disponible | No disponible | 44,7 | No disponible | Referenciado en la model card |
| Supra2.5-Pro-Instruct | No disponible | No disponible | 44,6 | No disponible | Referenciado en la model card |

Los únicos modelos comparables documentados por el autor son las variantes Supra2.5-Pro, de las que no se detallan parámetros, contexto ni licencia en la información disponible. No se dispone de comparación con otros SLM de referencia (por ejemplo, modelos de la familia SmolLM o TinyLlama) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeño (65,8 M de parámetros): comete errores factuales y aritméticos con frecuencia, tal como reconoce el propio autor.
- No tiene alineamiento de seguridad; no debe usarse en aplicaciones orientadas a usuarios sin una capa de moderación externa.
- El DPO sobre UltraFeedback binarizado no mejora las métricas de conocimiento: la media cae de 39,3 (base) a 38,8 (final) y ArithMark-3 baja de 37,2 a 34,9.
- Cobertura lingüística limitada a portugués e inglés; no se declaran otros idiomas.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-Edu, Cosmopedia, FineWeb-2, FineMath y datos sintéticos, hereda los sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda explícitamente su uso para estudio y experimentos, no para producción.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni integración con frameworks de inferencia de alto rendimiento, lo que limita el despliegue optimizado.
- El código de modelado es propio (`modeling_zylu.py`), por lo que la integración con `transformers` requiere cargar el módulo desde el snapshot del repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/ZYLU-1-MED
- Repositorio de pesos y código de modelado: incluido en el snapshot de Hugging Face (`modeling_zylu.py`, `config.json`, `tokenizer.json`, `model.safetensors`, `variants/base.safetensors`, `variants/sft.safetensors`)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
